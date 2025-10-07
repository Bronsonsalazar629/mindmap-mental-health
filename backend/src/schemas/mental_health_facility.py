"""
Pydantic schemas for Mental Health Facility API endpoints.
Handles validation and serialization for SAMHSA facility data.
"""

from pydantic import BaseModel, validator, Field
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime


class FacilityBase(BaseModel):
    """Base model for facility data."""
    name: str = Field(..., min_length=1, max_length=255, description="Facility name")
    address: Optional[str] = Field(None, max_length=500, description="Street address")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, min_length=2, max_length=2, description="State abbreviation")
    zip_code: Optional[str] = Field(None, max_length=10, description="ZIP code")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    website: Optional[str] = Field(None, max_length=500, description="Website URL")
    
    @validator('state')
    def validate_state(cls, v):
        if v and len(v) != 2:
            raise ValueError('State must be 2-character abbreviation')
        return v.upper() if v else v
    
    @validator('website')
    def validate_website(cls, v):
        if v and not (v.startswith('http://') or v.startswith('https://')):
            return f'https://{v}'
        return v


class FacilityCreate(FacilityBase):
    """Schema for creating a new facility."""
    facility_id: str = Field(..., min_length=1, max_length=50, description="Unique facility identifier")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude coordinate")
    facility_type: Optional[str] = Field(None, max_length=50, description="Type of facility")
    services: Optional[List[str]] = Field(default=[], description="Services offered")
    payment_types: Optional[List[str]] = Field(default=[], description="Payment methods accepted")
    description: Optional[str] = Field(None, description="Facility description")
    hours_of_operation: Optional[Dict[str, Any]] = Field(None, description="Operating hours")
    languages_spoken: Optional[List[str]] = Field(default=[], description="Languages spoken")
    capacity: Optional[int] = Field(None, ge=0, description="Facility capacity")
    email: Optional[str] = Field(None, max_length=255, description="Email address")
    fax: Optional[str] = Field(None, max_length=20, description="Fax number")
    contact_person: Optional[str] = Field(None, max_length=255, description="Contact person")
    data_source: str = Field(default="SAMHSA", max_length=50, description="Data source")
    
    @validator('services', 'payment_types', 'languages_spoken')
    def validate_arrays(cls, v):
        if v is None:
            return []
        if not isinstance(v, list):
            raise ValueError('Must be a list')
        return [str(item).strip() for item in v if item]
    
    @validator('email')
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v


class FacilityUpdate(BaseModel):
    """Schema for updating facility information."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=2)
    zip_code: Optional[str] = Field(None, max_length=10)
    phone: Optional[str] = Field(None, max_length=20)
    website: Optional[str] = Field(None, max_length=500)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    facility_type: Optional[str] = Field(None, max_length=50)
    services: Optional[List[str]] = None
    payment_types: Optional[List[str]] = None
    description: Optional[str] = None
    hours_of_operation: Optional[Dict[str, Any]] = None
    languages_spoken: Optional[List[str]] = None
    capacity: Optional[int] = Field(None, ge=0)
    email: Optional[str] = Field(None, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class FacilityResponse(FacilityBase):
    """Schema for facility API responses."""
    facility_id: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    coordinates: Optional[Tuple[float, float]] = None
    facility_type: Optional[str] = None
    services: List[str] = []
    payment_types: List[str] = []
    description: Optional[str] = None
    hours_of_operation: Optional[Dict[str, Any]] = None
    languages_spoken: List[str] = []
    capacity: Optional[int] = None
    email: Optional[str] = None
    contact_person: Optional[str] = None
    full_address: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    distance_miles: Optional[float] = None
    data_source: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class NearbyFacilitiesRequest(BaseModel):
    """Schema for nearby facilities search request."""
    latitude: float = Field(..., ge=-90, le=90, description="Search center latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Search center longitude")
    radius_miles: float = Field(default=10.0, ge=0.1, le=100.0, description="Search radius in miles")
    facility_type: Optional[str] = Field(None, description="Filter by facility type")
    services: Optional[List[str]] = Field(None, description="Filter by services")
    payment_types: Optional[List[str]] = Field(None, description="Filter by payment types")
    languages: Optional[List[str]] = Field(None, description="Filter by languages spoken")
    limit: int = Field(default=50, ge=1, le=100, description="Maximum number of results")
    only_verified: bool = Field(default=False, description="Only return verified facilities")
    
    @validator('services', 'payment_types', 'languages')
    def validate_filter_lists(cls, v):
        if v is None:
            return None
        return [str(item).strip().lower() for item in v if item]


class FacilitySearchRequest(BaseModel):
    """Schema for text-based facility search."""
    query: str = Field(..., min_length=2, max_length=200, description="Search query")
    state: Optional[str] = Field(None, min_length=2, max_length=2, description="Filter by state")
    city: Optional[str] = Field(None, max_length=100, description="Filter by city")
    facility_type: Optional[str] = Field(None, description="Filter by facility type")
    services: Optional[List[str]] = Field(None, description="Filter by services")
    limit: int = Field(default=50, ge=1, le=100, description="Maximum number of results")
    only_active: bool = Field(default=True, description="Only return active facilities")
    
    @validator('state')
    def validate_state(cls, v):
        return v.upper() if v else v


class FacilitiesResponse(BaseModel):
    """Schema for paginated facility responses."""
    facilities: List[FacilityResponse]
    total_count: int
    search_center: Optional[Dict[str, float]] = None
    search_radius_miles: Optional[float] = None
    filters_applied: Dict[str, Any] = {}


class FacilityImportStats(BaseModel):
    """Schema for facility import statistics."""
    total_processed: int
    successful_imports: int
    failed_imports: int
    updated_facilities: int
    new_facilities: int
    errors: List[str] = []
    processing_time_seconds: float


class MentalHealthFacility(FacilityResponse):
    """Main Pydantic model for Mental Health Facility with distance calculation."""
    
    @property
    def location_dict(self) -> Optional[Dict[str, float]]:
        """Return location as dictionary."""
        if self.coordinates:
            return {
                'latitude': self.coordinates[0],
                'longitude': self.coordinates[1]
            }
        return None
    
    def calculate_distance_from(self, lat: float, lng: float) -> Optional[float]:
        """Calculate distance from given coordinates (placeholder for actual calculation)."""
        if not self.coordinates:
            return None
        
        from math import radians, cos, sin, asin, sqrt
        
        # Haversine formula for distance calculation
        lat1, lon1 = radians(lat), radians(lng)
        lat2, lon2 = radians(self.coordinates[0]), radians(self.coordinates[1])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        r = 3956  # Radius of earth in miles
        
        return c * r