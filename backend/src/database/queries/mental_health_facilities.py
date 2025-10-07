"""
Database queries for mental health facilities with PostGIS spatial operations.
Provides async functions for facility search and location-based queries.
"""

from sqlalchemy import and_, or_, func, text, select
from sqlalchemy.orm import Session
from geoalchemy2 import Geography
from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_GeogFromText, ST_AsText
from typing import List, Optional, Dict, Any, Tuple
import logging

from ..models.mental_health_facility import MentalHealthFacility
from ...schemas.mental_health_facility import (
    FacilityCreate, 
    FacilityUpdate, 
    NearbyFacilitiesRequest,
    FacilitySearchRequest
)

logger = logging.getLogger(__name__)


async def insert_facility(db: Session, facility_data: FacilityCreate) -> MentalHealthFacility:
    """
    Insert a new mental health facility with spatial data.
    
    Args:
        db: Database session
        facility_data: Facility creation data
    
    Returns:
        Created facility record
    
    Raises:
        Exception: If facility creation fails
    """
    try:
        # Create location point from coordinates if provided
        location_point = None
        if facility_data.latitude is not None and facility_data.longitude is not None:
            location_point = func.ST_GeogFromText(
                f'POINT({facility_data.longitude} {facility_data.latitude})'
            )
        
        # Create facility record
        facility = MentalHealthFacility(
            facility_id=facility_data.facility_id,
            name=facility_data.name,
            address=facility_data.address,
            city=facility_data.city,
            state=facility_data.state.upper() if facility_data.state else None,
            zip_code=facility_data.zip_code,
            phone=facility_data.phone,
            website=facility_data.website,
            location=location_point,
            facility_type=facility_data.facility_type,
            services=facility_data.services or [],
            payment_types=facility_data.payment_types or [],
            description=facility_data.description,
            hours_of_operation=facility_data.hours_of_operation,
            languages_spoken=facility_data.languages_spoken or [],
            capacity=facility_data.capacity,
            email=facility_data.email,
            fax=facility_data.fax,
            contact_person=facility_data.contact_person,
            data_source=facility_data.data_source,
            is_active=True,
            is_verified=False
        )
        
        db.add(facility)
        db.commit()
        db.refresh(facility)
        
        logger.info(f"Inserted facility: {facility.name} (ID: {facility.facility_id})")
        return facility
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to insert facility {facility_data.facility_id}: {e}")
        raise


async def update_facility(db: Session, facility_id: str, update_data: FacilityUpdate) -> Optional[MentalHealthFacility]:
    """
    Update an existing mental health facility.
    
    Args:
        db: Database session
        facility_id: Facility ID to update
        update_data: Fields to update
    
    Returns:
        Updated facility record or None if not found
    """
    try:
        facility = db.query(MentalHealthFacility).filter(
            MentalHealthFacility.facility_id == facility_id
        ).first()
        
        if not facility:
            logger.warning(f"Facility not found for update: {facility_id}")
            return None
        
        # Update fields that are provided
        update_dict = update_data.dict(exclude_unset=True)
        
        # Handle location update
        if 'latitude' in update_dict and 'longitude' in update_dict:
            lat, lng = update_dict.pop('latitude'), update_dict.pop('longitude')
            if lat is not None and lng is not None:
                facility.location = func.ST_GeogFromText(f'POINT({lng} {lat})')
        
        # Update other fields
        for field, value in update_dict.items():
            if hasattr(facility, field):
                setattr(facility, field, value)
        
        db.commit()
        db.refresh(facility)
        
        logger.info(f"Updated facility: {facility.name} (ID: {facility.facility_id})")
        return facility
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update facility {facility_id}: {e}")
        raise


async def get_nearby_facilities(
    db: Session, 
    latitude: float, 
    longitude: float, 
    radius_miles: float = 10.0,
    facility_type: Optional[str] = None,
    services: Optional[List[str]] = None,
    payment_types: Optional[List[str]] = None,
    languages: Optional[List[str]] = None,
    limit: int = 50,
    only_verified: bool = False
) -> List[MentalHealthFacility]:
    """
    Find mental health facilities within a specified radius using PostGIS.
    
    Args:
        db: Database session
        latitude: Search center latitude
        longitude: Search center longitude
        radius_miles: Search radius in miles
        facility_type: Filter by facility type
        services: Filter by services offered
        payment_types: Filter by payment methods
        languages: Filter by languages spoken
        limit: Maximum number of results
        only_verified: Only return verified facilities
    
    Returns:
        List of facilities within radius with distance calculations
    """
    try:
        # Convert miles to meters for PostGIS (1 mile = 1609.344 meters)
        radius_meters = radius_miles * 1609.344
        
        # Create search point
        search_point = func.ST_GeogFromText(f'POINT({longitude} {latitude})')
        
        # Base query with distance calculation
        query = db.query(
            MentalHealthFacility,
            func.ST_Distance(MentalHealthFacility.location, search_point).label('distance_meters')
        ).filter(
            and_(
                MentalHealthFacility.is_active == True,
                MentalHealthFacility.location.isnot(None),
                func.ST_DWithin(MentalHealthFacility.location, search_point, radius_meters)
            )
        )
        
        # Apply filters
        if facility_type:
            query = query.filter(MentalHealthFacility.facility_type == facility_type)
        
        if only_verified:
            query = query.filter(MentalHealthFacility.is_verified == True)
        
        # Array filters using PostGIS array operations
        if services:
            for service in services:
                query = query.filter(
                    func.array_to_string(MentalHealthFacility.services, '||').ilike(f'%{service}%')
                )
        
        if payment_types:
            for payment_type in payment_types:
                query = query.filter(
                    func.array_to_string(MentalHealthFacility.payment_types, '||').ilike(f'%{payment_type}%')
                )
        
        if languages:
            for language in languages:
                query = query.filter(
                    func.array_to_string(MentalHealthFacility.languages_spoken, '||').ilike(f'%{language}%')
                )
        
        # Order by distance and limit results
        query = query.order_by(text('distance_meters')).limit(limit)
        
        results = query.all()
        
        # Add distance in miles to each facility
        facilities = []
        for facility, distance_meters in results:
            distance_miles = distance_meters / 1609.344 if distance_meters else None
            facility.distance_miles = distance_miles
            facilities.append(facility)
        
        logger.info(f"Found {len(facilities)} facilities within {radius_miles} miles of ({latitude}, {longitude})")
        return facilities
        
    except Exception as e:
        logger.error(f"Failed to get nearby facilities: {e}")
        raise


async def search_facilities(
    db: Session,
    query_text: str,
    state: Optional[str] = None,
    city: Optional[str] = None,
    facility_type: Optional[str] = None,
    services: Optional[List[str]] = None,
    limit: int = 50,
    only_active: bool = True
) -> List[MentalHealthFacility]:
    """
    Search mental health facilities using full-text search.
    
    Args:
        db: Database session
        query_text: Search query
        state: Filter by state
        city: Filter by city
        facility_type: Filter by facility type
        services: Filter by services
        limit: Maximum number of results
        only_active: Only return active facilities
    
    Returns:
        List of matching facilities
    """
    try:
        # Full-text search using PostgreSQL tsvector
        search_vector = func.to_tsvector('english', 
            func.coalesce(MentalHealthFacility.name, '') + ' ' +
            func.coalesce(MentalHealthFacility.description, '')
        )
        
        query_tsquery = func.plainto_tsquery('english', query_text)
        
        # Base query with full-text search
        query = db.query(MentalHealthFacility).filter(
            search_vector.match(query_tsquery)
        )
        
        # Apply filters
        if only_active:
            query = query.filter(MentalHealthFacility.is_active == True)
        
        if state:
            query = query.filter(MentalHealthFacility.state == state.upper())
        
        if city:
            query = query.filter(MentalHealthFacility.city.ilike(f'%{city}%'))
        
        if facility_type:
            query = query.filter(MentalHealthFacility.facility_type == facility_type)
        
        if services:
            for service in services:
                query = query.filter(
                    func.array_to_string(MentalHealthFacility.services, '||').ilike(f'%{service}%')
                )
        
        # Order by search rank and limit
        query = query.order_by(
            func.ts_rank(search_vector, query_tsquery).desc()
        ).limit(limit)
        
        facilities = query.all()
        
        logger.info(f"Found {len(facilities)} facilities matching '{query_text}'")
        return facilities
        
    except Exception as e:
        logger.error(f"Failed to search facilities: {e}")
        raise


async def get_facility_by_id(db: Session, facility_id: str) -> Optional[MentalHealthFacility]:
    """
    Get a specific facility by ID.
    
    Args:
        db: Database session
        facility_id: Facility ID
    
    Returns:
        Facility record or None if not found
    """
    try:
        facility = db.query(MentalHealthFacility).filter(
            MentalHealthFacility.facility_id == facility_id
        ).first()
        
        if facility:
            logger.info(f"Retrieved facility: {facility.name} (ID: {facility_id})")
        else:
            logger.warning(f"Facility not found: {facility_id}")
        
        return facility
        
    except Exception as e:
        logger.error(f"Failed to get facility {facility_id}: {e}")
        raise


async def get_facilities_by_state(db: Session, state: str, limit: int = 100) -> List[MentalHealthFacility]:
    """
    Get all facilities in a specific state.
    
    Args:
        db: Database session
        state: State abbreviation
        limit: Maximum number of results
    
    Returns:
        List of facilities in the state
    """
    try:
        facilities = db.query(MentalHealthFacility).filter(
            and_(
                MentalHealthFacility.state == state.upper(),
                MentalHealthFacility.is_active == True
            )
        ).limit(limit).all()
        
        logger.info(f"Found {len(facilities)} facilities in {state.upper()}")
        return facilities
        
    except Exception as e:
        logger.error(f"Failed to get facilities for state {state}: {e}")
        raise


async def get_facility_statistics(db: Session) -> Dict[str, Any]:
    """
    Get comprehensive statistics about facilities in the database.
    
    Args:
        db: Database session
    
    Returns:
        Dictionary with facility statistics
    """
    try:
        # Basic counts
        total_facilities = db.query(func.count(MentalHealthFacility.facility_id)).scalar()
        active_facilities = db.query(func.count(MentalHealthFacility.facility_id)).filter(
            MentalHealthFacility.is_active == True
        ).scalar()
        verified_facilities = db.query(func.count(MentalHealthFacility.facility_id)).filter(
            MentalHealthFacility.is_verified == True
        ).scalar()
        
        # By state
        by_state = db.query(
            MentalHealthFacility.state,
            func.count(MentalHealthFacility.facility_id).label('count')
        ).filter(
            MentalHealthFacility.is_active == True
        ).group_by(MentalHealthFacility.state).all()
        
        # By facility type
        by_type = db.query(
            MentalHealthFacility.facility_type,
            func.count(MentalHealthFacility.facility_id).label('count')
        ).filter(
            MentalHealthFacility.is_active == True
        ).group_by(MentalHealthFacility.facility_type).all()
        
        stats = {
            'total_facilities': total_facilities,
            'active_facilities': active_facilities,
            'verified_facilities': verified_facilities,
            'facilities_by_state': [{'state': state, 'count': count} for state, count in by_state],
            'facilities_by_type': [{'type': ftype, 'count': count} for ftype, count in by_type]
        }
        
        logger.info(f"Generated facility statistics: {total_facilities} total facilities")
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get facility statistics: {e}")
        raise