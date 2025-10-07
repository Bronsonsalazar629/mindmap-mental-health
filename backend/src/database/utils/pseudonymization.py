"""
Pseudonymization utilities for ethics.
Uses SHA-256 hashing with salt for secure, irreversible pseudonymization.
"""

import hashlib
import hmac
import secrets
import os
from typing import Optional, Union
import uuid
from datetime import datetime

class PseudonymizationService:
    """Service for creating pseudonymized identifiers for research participants."""
    
    def __init__(self):
        # Use environment variable for salt, generate if not exists
        self.salt = os.getenv('PSEUDONYM_SALT', self._generate_salt())
        if not os.getenv('PSEUDONYM_SALT'):
            print("WARNING: No PSEUDONYM_SALT environment variable found. Using generated salt.")
            print(f"Add this to your .env file: PSEUDONYM_SALT={self.salt}")
    
    def _generate_salt(self) -> str:
        """Generate a cryptographically secure salt."""
        return secrets.token_hex(32)
    
    def pseudonymize_user_id(self, user_identifier: str) -> str:
        """
        Create a pseudonymized user ID using SHA-256 with HMAC.
        
        Args:
            user_identifier: Original user identifier (email, phone, etc.)
        
        Returns:
            Pseudonymized identifier suitable for research
        """
        # Use HMAC-SHA256 for additional security
        pseudonym = hmac.new(
            self.salt.encode('utf-8'),
            user_identifier.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Add prefix for identification
        return f"psn_{pseudonym[:32]}"
    
    def create_research_id(self, user_identifier: str, study_id: Optional[str] = None) -> str:
        """
        Create a research-specific participant ID.
        
        Args:
            user_identifier: Original user identifier
            study_id: Optional study identifier for multi-study platforms
        
        Returns:
            Research participant ID
        """
        base_data = user_identifier
        if study_id:
            base_data = f"{study_id}:{user_identifier}"
        
        research_hash = hashlib.sha256(
            f"{self.salt}:{base_data}:{datetime.now().date()}".encode('utf-8')
        ).hexdigest()
        
        return f"rid_{research_hash[:16]}"
    
    def anonymize_location(self, latitude: float, longitude: float, precision: int = 3) -> tuple:
        """
        Reduce location precision for privacy while maintaining research utility.
        
        Args:
            latitude: Original latitude
            longitude: Original longitude  
            precision: Decimal places to maintain (3 = ~100m precision)
        
        Returns:
            Tuple of (anonymized_lat, anonymized_lng)
        """
        anon_lat = round(latitude, precision)
        anon_lng = round(longitude, precision)
        return (anon_lat, anon_lng)
    
    def create_session_id(self) -> str:
        """Create a unique session identifier for tracking user interactions."""
        return f"sess_{uuid.uuid4().hex[:16]}"
    
    def hash_sensitive_data(self, sensitive_data: str) -> str:
        """Hash sensitive data for bias detection while preserving statistical properties."""
        return hashlib.sha256(
            f"{self.salt}:{sensitive_data}".encode('utf-8')
        ).hexdigest()[:32]

# Global pseudonymization service instance
pseudonymizer = PseudonymizationService()


def generate_demo_user_id() -> str:
    """Generate a demo user ID for seed data."""
    return f"demo_{uuid.uuid4().hex[:12]}"


def validate_pseudonym_format(pseudonym: str) -> bool:
    """Validate that a pseudonym follows the expected format."""
    valid_prefixes = ['psn_', 'rid_', 'sess_', 'demo_']
    return any(pseudonym.startswith(prefix) for prefix in valid_prefixes)