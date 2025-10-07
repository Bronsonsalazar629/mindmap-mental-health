#!/usr/bin/env python3
"""
SAMHSA Mental Health Facilities Data Import Script

This script imports mental health facility data from SAMHSA CSV files
into the PostgreSQL database with PostGIS spatial indexing.

Features:
- Async database operations with asyncpg
- Progress logging and error handling
- Data validation and cleanup
- Geocoding for missing coordinates
- Duplicate detection and handling
- Performance monitoring

Usage:
    python import_samhsa_data.py --csv-path data/facilities.csv --batch-size 100
"""

import asyncio
import asyncpg
import pandas as pd
import numpy as np
import logging
import argparse
import sys
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import json
import hashlib
import re
from dataclasses import dataclass

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('samhsa_import.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class ImportStats:
    """Statistics for the import operation."""
    total_records: int = 0
    processed: int = 0
    successful: int = 0
    failed: int = 0
    duplicates: int = 0
    geocoded: int = 0
    errors: List[str] = None
    start_time: datetime = None
    end_time: datetime = None
    
    def __post_init__(self):
        if self.errors is None:
            self.errors = []
        if self.start_time is None:
            self.start_time = datetime.now(timezone.utc)
    
    @property
    def duration_seconds(self) -> float:
        end = self.end_time or datetime.now(timezone.utc)
        return (end - self.start_time).total_seconds()
    
    @property
    def success_rate(self) -> float:
        return (self.successful / self.processed * 100) if self.processed > 0 else 0
    
    def summary(self) -> Dict[str, Any]:
        self.end_time = datetime.now(timezone.utc)
        return {
            'total_records': self.total_records,
            'processed': self.processed,
            'successful': self.successful,
            'failed': self.failed,
            'duplicates': self.duplicates,
            'geocoded': self.geocoded,
            'success_rate': f"{self.success_rate:.1f}%",
            'duration_seconds': self.duration_seconds,
            'records_per_second': self.processed / self.duration_seconds if self.duration_seconds > 0 else 0,
            'errors': self.errors[-10:]  # Last 10 errors
        }


class SAMHSADataImporter:
    """Main class for importing SAMHSA facility data."""
    
    def __init__(self, database_url: str, batch_size: int = 100):
        self.database_url = database_url
        self.batch_size = batch_size
        self.pool: Optional[asyncpg.Pool] = None
        self.stats = ImportStats()
        
        # Field mappings from SAMHSA CSV to our database schema
        self.field_mappings = {
            'MPRID': 'facility_id',
            'NAME1': 'name',
            'STREET': 'address',
            'CITY': 'city',
            'STFIPS': 'state',  # Will need to convert to state abbrev
            'ZIP': 'zip_code',
            'PHONE': 'phone',
            'WEBSITE': 'website',
            'TYPE_FAC': 'facility_type',
            'FOCUS': 'services',  # Will need parsing
            'PAYMENT': 'payment_types',  # Will need parsing
            'LANG': 'languages_spoken'  # Will need parsing
        }
        
        # State FIPS to abbreviation mapping
        self.state_fips = {
            '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
            '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
            '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
            '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
            '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
            '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
            '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
            '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
            '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
            '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI', '56': 'WY'
        }

    async def connect_database(self) -> None:
        """Establish database connection pool."""
        try:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            logger.info("Database connection pool established")
            
            # Test connection and PostGIS
            async with self.pool.acquire() as conn:
                version = await conn.fetchval("SELECT version()")
                postgis = await conn.fetchval("SELECT PostGIS_version()")
                logger.info(f"Connected to {version}")
                logger.info(f"PostGIS version: {postgis}")
                
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    async def close_database(self) -> None:
        """Close database connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info("Database connections closed")

    def load_csv_data(self, csv_path: str) -> pd.DataFrame:
        """Load and preprocess CSV data."""
        logger.info(f"Loading CSV data from {csv_path}")
        
        try:
            # Try different encodings if needed
            encodings = ['utf-8', 'latin1', 'cp1252']
            df = None
            
            for encoding in encodings:
                try:
                    df = pd.read_csv(csv_path, encoding=encoding, low_memory=False)
                    logger.info(f"Successfully loaded CSV with {encoding} encoding")
                    break
                except UnicodeDecodeError:
                    continue
            
            if df is None:
                raise ValueError("Could not read CSV with any supported encoding")
            
            logger.info(f"Loaded {len(df)} records with {len(df.columns)} columns")
            self.stats.total_records = len(df)
            
            return df
            
        except Exception as e:
            logger.error(f"Failed to load CSV data: {e}")
            raise

    def clean_and_validate_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate the CSV data."""
        logger.info("Cleaning and validating data")
        
        # Create a copy to avoid modifying original
        clean_df = df.copy()
        
        # Basic data cleaning
        clean_df = clean_df.replace([np.nan, 'NULL', 'null', '', ' '], None)
        
        # Clean phone numbers
        if 'PHONE' in clean_df.columns:
            clean_df['PHONE'] = clean_df['PHONE'].astype(str).apply(self.clean_phone_number)
        
        # Clean zip codes
        if 'ZIP' in clean_df.columns:
            clean_df['ZIP'] = clean_df['ZIP'].astype(str).apply(self.clean_zip_code)
        
        # Convert state FIPS to abbreviations
        if 'STFIPS' in clean_df.columns:
            clean_df['STATE_ABBREV'] = clean_df['STFIPS'].astype(str).str.zfill(2).map(self.state_fips)
        
        # Clean facility names
        if 'NAME1' in clean_df.columns:
            clean_df['NAME1'] = clean_df['NAME1'].astype(str).apply(self.clean_facility_name)
        
        # Remove records with missing critical fields
        initial_count = len(clean_df)
        clean_df = clean_df.dropna(subset=['MPRID', 'NAME1'])
        removed_count = initial_count - len(clean_df)
        
        if removed_count > 0:
            logger.warning(f"Removed {removed_count} records with missing critical fields")
        
        logger.info(f"Data cleaning complete. {len(clean_df)} records ready for import")
        return clean_df

    def clean_phone_number(self, phone: str) -> Optional[str]:
        """Clean and format phone numbers."""
        if not phone or phone == 'nan':
            return None
        
        # Extract digits only
        digits = re.sub(r'\D', '', str(phone))
        
        # Must be 10 digits for US numbers
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':
            return f"({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        
        # Return original if can't parse
        return str(phone)[:20] if len(str(phone)) <= 20 else None

    def clean_zip_code(self, zip_code: str) -> Optional[str]:
        """Clean and validate zip codes."""
        if not zip_code or zip_code == 'nan':
            return None
        
        # Extract digits and hyphens
        clean_zip = re.sub(r'[^\d-]', '', str(zip_code))
        
        # Return first 5 or 10 characters (XXXXX or XXXXX-XXXX format)
        if len(clean_zip) >= 5:
            return clean_zip[:10] if '-' in clean_zip else clean_zip[:5]
        
        return None

    def clean_facility_name(self, name: str) -> str:
        """Clean facility names."""
        if not name or name == 'nan':
            return 'Unknown Facility'
        
        # Remove extra whitespace and title case
        clean_name = ' '.join(str(name).split())
        
        # Limit length
        return clean_name[:255] if len(clean_name) <= 255 else clean_name[:252] + '...'

    def parse_services(self, focus_code: str) -> List[str]:
        """Parse SAMHSA focus codes into service types."""
        if not focus_code or focus_code == 'nan':
            return []
        
        # SAMHSA focus code mappings (simplified)
        service_mappings = {
            '1': 'Mental Health Services',
            '2': 'Substance Abuse Treatment',
            '3': 'Both Mental Health and Substance Abuse',
            '4': 'General Healthcare',
            'MH': 'Mental Health Services',
            'SA': 'Substance Abuse Treatment',
            'BOTH': 'Both Mental Health and Substance Abuse'
        }
        
        services = []
        focus_str = str(focus_code).upper().strip()
        
        for code, service in service_mappings.items():
            if code in focus_str:
                services.append(service)
        
        return services if services else ['General Mental Health']

    def parse_payment_types(self, payment_code: str) -> List[str]:
        """Parse payment type codes."""
        if not payment_code or payment_code == 'nan':
            return ['Contact Facility']
        
        payment_mappings = {
            'CASH': 'Cash',
            'CREDIT': 'Credit Cards',
            'INSURANCE': 'Private Insurance',
            'MEDICARE': 'Medicare',
            'MEDICAID': 'Medicaid',
            'TRICARE': 'Military Insurance',
            'SLIDING': 'Sliding Fee Scale',
            'FREE': 'Free Services'
        }
        
        payments = []
        payment_str = str(payment_code).upper()
        
        for code, payment in payment_mappings.items():
            if code in payment_str:
                payments.append(payment)
        
        return payments if payments else ['Contact Facility']

    async def geocode_address(self, address: str, city: str, state: str, zip_code: str) -> Optional[Tuple[float, float]]:
        """Geocode address to get coordinates (placeholder - would integrate with geocoding service)."""
        # In a real implementation, this would call a geocoding API
        # For now, return None to indicate coordinates not available
        return None

    async def process_batch(self, batch_df: pd.DataFrame) -> None:
        """Process a batch of facility records."""
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                for _, row in batch_df.iterrows():
                    try:
                        await self.process_single_record(conn, row)
                        self.stats.successful += 1
                    except Exception as e:
                        self.stats.failed += 1
                        error_msg = f"Failed to process record {row.get('MPRID', 'unknown')}: {e}"
                        self.stats.errors.append(error_msg)
                        logger.error(error_msg)
                    
                    self.stats.processed += 1
                    
                    # Progress logging
                    if self.stats.processed % 100 == 0:
                        progress = (self.stats.processed / self.stats.total_records) * 100
                        logger.info(f"Progress: {self.stats.processed}/{self.stats.total_records} ({progress:.1f}%)")

    async def process_single_record(self, conn: asyncpg.Connection, row: pd.Series) -> None:
        """Process a single facility record."""
        
        # Check for duplicate
        existing = await conn.fetchval(
            "SELECT facility_id FROM mental_health_facilities WHERE facility_id = $1",
            str(row.get('MPRID', ''))
        )
        
        if existing:
            self.stats.duplicates += 1
            logger.debug(f"Skipping duplicate facility: {row.get('MPRID')}")
            return
        
        # Map fields from CSV to database schema
        facility_data = {
            'facility_id': str(row.get('MPRID', '')),
            'name': self.clean_facility_name(row.get('NAME1', '')),
            'address': str(row.get('STREET', '')) if pd.notna(row.get('STREET')) else None,
            'city': str(row.get('CITY', '')) if pd.notna(row.get('CITY')) else None,
            'state': row.get('STATE_ABBREV'),
            'zip_code': self.clean_zip_code(row.get('ZIP')),
            'phone': self.clean_phone_number(row.get('PHONE')),
            'website': str(row.get('WEBSITE', '')) if pd.notna(row.get('WEBSITE')) else None,
            'facility_type': 'outpatient',  # Default, would map from TYPE_FAC if available
            'services': self.parse_services(row.get('FOCUS')),
            'payment_types': self.parse_payment_types(row.get('PAYMENT')),
            'languages_spoken': ['English'],  # Default, would parse from LANG if available
            'data_source': 'SAMHSA',
            'is_active': True,
            'is_verified': False
        }
        
        # Try to geocode if address is available
        location_point = None
        if facility_data['address'] and facility_data['city'] and facility_data['state']:
            coords = await self.geocode_address(
                facility_data['address'],
                facility_data['city'],
                facility_data['state'],
                facility_data['zip_code']
            )
            if coords:
                location_point = f"POINT({coords[1]} {coords[0]})"  # longitude, latitude
                self.stats.geocoded += 1
        
        # Insert into database
        await conn.execute("""
            INSERT INTO mental_health_facilities (
                facility_id, name, address, city, state, zip_code, phone, website,
                location, facility_type, services, payment_types, languages_spoken,
                data_source, is_active, is_verified, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, 
                $9, $10, $11, $12, $13, 
                $14, $15, $16, $17, $17
            )
        """, 
        facility_data['facility_id'],
        facility_data['name'],
        facility_data['address'],
        facility_data['city'],
        facility_data['state'],
        facility_data['zip_code'],
        facility_data['phone'],
        facility_data['website'],
        location_point,
        facility_data['facility_type'],
        facility_data['services'],
        facility_data['payment_types'],
        facility_data['languages_spoken'],
        facility_data['data_source'],
        facility_data['is_active'],
        facility_data['is_verified'],
        datetime.now(timezone.utc)
        )

    async def import_data(self, csv_path: str) -> ImportStats:
        """Main import method."""
        logger.info(f"Starting SAMHSA data import from {csv_path}")
        
        try:
            await self.connect_database()
            
            # Load and clean data
            df = self.load_csv_data(csv_path)
            clean_df = self.clean_and_validate_data(df)
            
            # Process in batches
            total_batches = (len(clean_df) + self.batch_size - 1) // self.batch_size
            logger.info(f"Processing {len(clean_df)} records in {total_batches} batches")
            
            for i in range(0, len(clean_df), self.batch_size):
                batch_df = clean_df.iloc[i:i + self.batch_size]
                batch_num = (i // self.batch_size) + 1
                
                logger.info(f"Processing batch {batch_num}/{total_batches}")
                await self.process_batch(batch_df)
            
            # Final statistics
            self.stats.end_time = datetime.now(timezone.utc)
            summary = self.stats.summary()
            
            logger.info("Import completed successfully!")
            logger.info(f"Summary: {json.dumps(summary, indent=2)}")
            
            return self.stats
            
        except Exception as e:
            logger.error(f"Import failed: {e}")
            raise
        finally:
            await self.close_database()


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Import SAMHSA facility data')
    parser.add_argument('--csv-path', required=True, help='Path to SAMHSA CSV file')
    parser.add_argument('--database-url', 
                        default='postgresql://postgres:password@localhost:5432/mindmap',
                        help='Database connection URL')
    parser.add_argument('--batch-size', type=int, default=100, 
                        help='Number of records to process per batch')
    parser.add_argument('--dry-run', action='store_true', 
                        help='Validate data without importing')
    
    args = parser.parse_args()
    
    # Validate CSV path
    csv_path = Path(args.csv_path)
    if not csv_path.exists():
        logger.error(f"CSV file not found: {csv_path}")
        sys.exit(1)
    
    try:
        importer = SAMHSADataImporter(args.database_url, args.batch_size)
        
        if args.dry_run:
            logger.info("Running in dry-run mode - no data will be imported")
            df = importer.load_csv_data(str(csv_path))
            clean_df = importer.clean_and_validate_data(df)
            logger.info(f"Validation complete. {len(clean_df)} records would be imported")
        else:
            stats = await importer.import_data(str(csv_path))
            
            if stats.failed > 0:
                logger.warning(f"Import completed with {stats.failed} failures")
                sys.exit(1)
            else:
                logger.info("Import completed successfully with no failures")
                
    except KeyboardInterrupt:
        logger.info("Import interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Import failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())