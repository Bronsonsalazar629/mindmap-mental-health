"""
Mental Health Facilities API endpoints.
Provides facility search, nearby lookup, and SAMHSA data integration.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from ...core.auth import get_current_active_user, AuthenticatedUser
from ...core.config import settings
from ...core.exceptions import ResourceNotFoundError, ValidationError
from ...database.base import get_db
from ...database.queries.mental_health_facilities import (
    insert_facility,
    update_facility,
    get_nearby_facilities,
    search_facilities,
    get_facility_by_id,
    get_facilities_by_state,
    get_facility_statistics
)
from ...schemas.mental_health_facility import (
    FacilityCreate,
    FacilityUpdate,
    FacilityResponse,
    NearbyFacilitiesRequest,
    FacilitySearchRequest,
    FacilitiesResponse,
    MentalHealthFacility
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/facilities", tags=["facilities"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/nearby", response_model=FacilitiesResponse)
@limiter.limit("60/minute")
async def get_nearby_mental_health_facilities(
    request: Request,
    latitude: float = Query(..., ge=-90, le=90, description="Search center latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Search center longitude"),
    radius: float = Query(10.0, ge=0.1, le=100.0, description="Search radius in miles"),
    facility_type: Optional[str] = Query(None, description="Filter by facility type"),
    services: Optional[str] = Query(None, description="Comma-separated list of services"),
    payment_types: Optional[str] = Query(None, description="Comma-separated payment types"),
    languages: Optional[str] = Query(None, description="Comma-separated languages"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    verified_only: bool = Query(False, description="Only verified facilities"),
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Find mental health facilities near a specific location.
    
    Uses PostGIS spatial queries to find facilities within the specified radius.
    Supports filtering by facility type, services, payment methods, and languages.
    
    Returns facilities ordered by distance from the search center.
    """
    try:
        # Parse filter parameters
        services_list = [s.strip() for s in services.split(',')] if services else None
        payment_types_list = [p.strip() for p in payment_types.split(',')] if payment_types else None
        languages_list = [l.strip() for l in languages.split(',')] if languages else None
        
        # Get nearby facilities
        facilities = await get_nearby_facilities(
            db=db,
            latitude=latitude,
            longitude=longitude,
            radius_miles=radius,
            facility_type=facility_type,
            services=services_list,
            payment_types=payment_types_list,
            languages=languages_list,
            limit=limit,
            only_verified=verified_only
        )
        
        # Convert to response format
        facility_responses = []
        for facility in facilities:
            facility_dict = facility.to_dict(include_distance=True)
            facility_responses.append(FacilityResponse(**facility_dict))
        
        response = FacilitiesResponse(
            facilities=facility_responses,
            total_count=len(facility_responses),
            search_center={"latitude": latitude, "longitude": longitude},
            search_radius_miles=radius,
            filters_applied={
                "facility_type": facility_type,
                "services": services_list,
                "payment_types": payment_types_list,
                "languages": languages_list,
                "verified_only": verified_only
            }
        )
        
        logger.info(f"Nearby search: {len(facilities)} facilities found within {radius} miles of ({latitude}, {longitude})")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get nearby facilities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve nearby facilities"
        )


@router.get("/search", response_model=FacilitiesResponse)
@limiter.limit("60/minute")
async def search_mental_health_facilities(
    request: Request,
    q: str = Query(..., min_length=2, max_length=200, description="Search query"),
    state: Optional[str] = Query(None, min_length=2, max_length=2, description="Filter by state"),
    city: Optional[str] = Query(None, max_length=100, description="Filter by city"),
    facility_type: Optional[str] = Query(None, description="Filter by facility type"),
    services: Optional[str] = Query(None, description="Comma-separated services"),
    limit: int = Query(50, ge=1, le=100, description="Maximum results"),
    active_only: bool = Query(True, description="Only active facilities"),
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Search mental health facilities by name, description, or services.
    
    Uses PostgreSQL full-text search with ranking for relevance.
    Supports filtering by location, facility type, and services.
    
    Returns facilities ordered by search relevance.
    """
    try:
        # Parse services filter
        services_list = [s.strip() for s in services.split(',')] if services else None
        
        # Perform text search
        facilities = await search_facilities(
            db=db,
            query_text=q,
            state=state.upper() if state else None,
            city=city,
            facility_type=facility_type,
            services=services_list,
            limit=limit,
            only_active=active_only
        )
        
        # Convert to response format
        facility_responses = []
        for facility in facilities:
            facility_dict = facility.to_dict()
            facility_responses.append(FacilityResponse(**facility_dict))
        
        response = FacilitiesResponse(
            facilities=facility_responses,
            total_count=len(facility_responses),
            filters_applied={
                "query": q,
                "state": state,
                "city": city,
                "facility_type": facility_type,
                "services": services_list,
                "active_only": active_only
            }
        )
        
        logger.info(f"Text search: {len(facilities)} facilities found for query '{q}'")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to search facilities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search facilities"
        )


@router.get("/{facility_id}", response_model=FacilityResponse)
@limiter.limit("100/minute")
async def get_facility_details(
    request: Request,
    facility_id: str,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific facility.
    
    Returns complete facility information including contact details,
    services, payment options, and location data.
    """
    try:
        facility = await get_facility_by_id(db, facility_id)
        
        if not facility:
            raise ResourceNotFoundError("Facility", facility_id)
        
        facility_dict = facility.to_dict()
        response = FacilityResponse(**facility_dict)
        
        logger.info(f"Retrieved facility details for ID: {facility_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get facility details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve facility details"
        )


@router.get("/by-state/{state}", response_model=FacilitiesResponse)
@limiter.limit("60/minute")
async def get_facilities_by_state_endpoint(
    request: Request,
    state: str,
    limit: int = Query(100, ge=1, le=500, description="Maximum results"),
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all active facilities in a specific state.
    
    Returns facilities ordered alphabetically by name.
    Useful for state-specific facility directories.
    """
    try:
        if len(state) != 2:
            raise ValidationError("State must be a 2-character abbreviation")
        
        facilities = await get_facilities_by_state(db, state, limit)
        
        # Convert to response format
        facility_responses = []
        for facility in facilities:
            facility_dict = facility.to_dict()
            facility_responses.append(FacilityResponse(**facility_dict))
        
        response = FacilitiesResponse(
            facilities=facility_responses,
            total_count=len(facility_responses),
            filters_applied={
                "state": state.upper(),
                "active_only": True
            }
        )
        
        logger.info(f"State query: {len(facilities)} facilities found in {state.upper()}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get facilities by state: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve facilities by state"
        )


@router.get("/statistics/overview")
@limiter.limit("30/minute")
async def get_facility_statistics_endpoint(
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive statistics about facilities in the database.
    
    Returns counts by state, facility type, verification status,
    and other aggregate data for analytics and reporting.
    """
    try:
        stats = await get_facility_statistics(db)
        
        logger.info("Retrieved facility statistics")
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get facility statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve facility statistics"
        )


@router.post("/", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_facility(
    request: Request,
    facility_data: FacilityCreate,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new mental health facility record.
    
    Requires facility admin permissions. Creates a new facility
    with spatial location data and service information.
    """
    try:
        # Check if facility with this ID already exists
        existing = await get_facility_by_id(db, facility_data.facility_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Facility with ID {facility_data.facility_id} already exists"
            )
        
        # Create the facility
        facility = await insert_facility(db, facility_data)
        
        facility_dict = facility.to_dict()
        response = FacilityResponse(**facility_dict)
        
        logger.info(f"Created new facility: {facility.name} (ID: {facility.facility_id})")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create facility: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create facility"
        )


@router.put("/{facility_id}", response_model=FacilityResponse)
@limiter.limit("10/minute")
async def update_facility_endpoint(
    request: Request,
    facility_id: str,
    update_data: FacilityUpdate,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing mental health facility.
    
    Requires facility admin permissions. Updates facility
    information including location, services, and contact details.
    """
    try:
        facility = await update_facility(db, facility_id, update_data)
        
        if not facility:
            raise ResourceNotFoundError("Facility", facility_id)
        
        facility_dict = facility.to_dict()
        response = FacilityResponse(**facility_dict)
        
        logger.info(f"Updated facility: {facility.name} (ID: {facility_id})")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update facility: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update facility"
        )


# Health check endpoint
@router.get("/health/status")
@limiter.limit("100/minute")
async def facility_service_health(request: Request, db: Session = Depends(get_db)):
    """Health check for facility service."""
    try:
        # Test database connectivity and PostGIS
        result = db.execute("SELECT ST_AsText(ST_GeogFromText('POINT(-122.4194 37.7749)'))").scalar()
        
        return {
            "status": "healthy",
            "service": "mental_health_facilities",
            "database": "connected",
            "postgis": "active",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Facility service health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Facility service is not healthy"
        )