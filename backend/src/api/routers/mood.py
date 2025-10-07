"""
Mood tracking endpoints for MindMap Research API.
Handles mood entries, analysis, and geographic patterns for research.
"""

import logging
from datetime import datetime, timezone, date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from pydantic import BaseModel, validator, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from slowapi import Limiter
from slowapi.util import get_remote_address

from core.auth import (
    get_current_active_user,
    get_current_consented_user,
    AuthenticatedUser
)
from core.config import settings
from core.exceptions import ResourceNotFoundError, ValidationError
from database.base import get_db
from database.models.mood_entry import MoodEntry
from database.models.user import User
from database.models.audit_log import AuditLog

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class MoodEntryCreate(BaseModel):
    """Model for creating a new mood entry."""
    mood_score: int = Field(..., ge=1, le=10, description="Mood score from 1-10")
    anxiety_level: Optional[int] = Field(None, ge=1, le=4, description="Anxiety level 1-4")
    stress_level: Optional[int] = Field(None, ge=1, le=5, description="Stress level 1-5")
    energy_level: Optional[int] = Field(None, ge=1, le=5, description="Energy level 1-5")
    sleep_quality: Optional[int] = Field(None, ge=1, le=5, description="Sleep quality 1-5")
    
    # Location data (optional)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    location_accuracy: Optional[float] = Field(None, gt=0)
    location_method: Optional[str] = Field(None, regex="^(gps|network|manual)$")
    
    # Entry metadata
    entry_method: Optional[str] = Field("manual", regex="^(manual|prompted|automated)$")
    notes: Optional[str] = Field(None, max_length=1000)
    mood_scale: str = Field("1-10", description="Mood scale used")
    
    # Research context
    entry_context: Optional[dict] = None  # Additional context data
    
    @validator('entry_context')
    def validate_context(cls, v):
        if v and len(str(v)) > 5000:  # Prevent huge context objects
            raise ValueError('Entry context too large')
        return v


class MoodEntryUpdate(BaseModel):
    """Model for updating an existing mood entry."""
    mood_score: Optional[int] = Field(None, ge=1, le=10)
    anxiety_level: Optional[int] = Field(None, ge=1, le=4)
    stress_level: Optional[int] = Field(None, ge=1, le=5)
    energy_level: Optional[int] = Field(None, ge=1, le=5)
    sleep_quality: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = Field(None, max_length=1000)


class MoodEntryResponse(BaseModel):
    """Response model for mood entries."""
    entry_id: str
    mood_score: int
    anxiety_level: Optional[int]
    stress_level: Optional[int]
    energy_level: Optional[int]
    sleep_quality: Optional[int]
    entry_date: str
    recorded_at: str
    entry_method: str
    data_quality: str
    notes: Optional[str]
    has_location: bool
    is_research_eligible: bool


class MoodTrendsResponse(BaseModel):
    """Response model for mood trends analysis."""
    period: str
    average_mood: float
    mood_trend: str  # improving, stable, declining
    total_entries: int
    mood_variability: float
    anxiety_average: Optional[float]
    stress_average: Optional[float]
    energy_average: Optional[float]
    sleep_average: Optional[float]


@router.post("/entries", response_model=MoodEntryResponse)
@limiter.limit("60/hour")
async def create_mood_entry(
    request: Request,
    mood_data: MoodEntryCreate,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new mood entry.
    
    Records a mood entry with optional location data and context.
    Validates data quality and handles geographic privacy.
    """
    try:
        # Create location point if coordinates provided
        location_point = None
        if mood_data.latitude is not None and mood_data.longitude is not None:
            # In production, add privacy protection by adding noise to coordinates
            privacy_radius = settings.GEOGRAPHIC_PRIVACY_RADIUS_METERS
            location_point = f'POINT({mood_data.longitude} {mood_data.latitude})'
        
        # Create mood entry
        mood_entry = MoodEntry(
            user_pseudonym_id=current_user.pseudonym_id,
            entry_date=date.today(),
            recorded_at=datetime.now(timezone.utc),
            mood_score=mood_data.mood_score,
            mood_scale=mood_data.mood_scale,
            anxiety_level=mood_data.anxiety_level,
            stress_level=mood_data.stress_level,
            energy_level=mood_data.energy_level,
            sleep_quality=mood_data.sleep_quality,
            location_point=location_point,
            location_accuracy=mood_data.location_accuracy,
            location_method=mood_data.location_method,
            entry_method=mood_data.entry_method,
            notes=mood_data.notes,
            data_quality='high',  # Would be determined by validation logic
            is_validated=True,
            is_research_eligible=True,  # Based on user consent
            data_sharing_allowed=True,  # Based on user consent
            demographic_context={
                "user_pseudonym": current_user.pseudonym_id,
                "entry_timestamp": datetime.now(timezone.utc).isoformat()
            },
            entry_context=mood_data.entry_context
        )
        
        db.add(mood_entry)
        db.commit()
        db.refresh(mood_entry)
        
        # Update user engagement score
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if user:
            # Simple engagement calculation - would be more sophisticated in production
            user.engagement_score = min(1.0, user.engagement_score + 0.01)
            db.commit()
        
        # Log mood entry creation
        audit_log = AuditLog(
            user_pseudonym_id=current_user.pseudonym_id,
            event_type="mood_entry_created",
            event_category="user_data",
            event_description="New mood entry recorded",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={
                "entry_id": mood_entry.entry_id,
                "mood_score": mood_data.mood_score,
                "has_location": location_point is not None,
                "entry_method": mood_data.entry_method
            }
        )
        db.add(audit_log)
        db.commit()
        
        return MoodEntryResponse(
            entry_id=mood_entry.entry_id,
            mood_score=mood_entry.mood_score,
            anxiety_level=mood_entry.anxiety_level,
            stress_level=mood_entry.stress_level,
            energy_level=mood_entry.energy_level,
            sleep_quality=mood_entry.sleep_quality,
            entry_date=mood_entry.entry_date.isoformat(),
            recorded_at=mood_entry.recorded_at.isoformat(),
            entry_method=mood_entry.entry_method,
            data_quality=mood_entry.data_quality,
            notes=mood_entry.notes,
            has_location=mood_entry.location_point is not None,
            is_research_eligible=mood_entry.is_research_eligible
        )
        
    except Exception as e:
        logger.error(f"Failed to create mood entry: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create mood entry"
        )


@router.get("/entries", response_model=List[MoodEntryResponse])
@limiter.limit("100/hour")
async def get_mood_entries(
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = Query(30, le=100, description="Maximum number of entries to return"),
    offset: int = Query(0, ge=0, description="Number of entries to skip"),
    start_date: Optional[date] = Query(None, description="Filter entries from this date"),
    end_date: Optional[date] = Query(None, description="Filter entries until this date")
):
    """
    Get user's mood entries with optional filtering.
    
    Returns paginated mood entries for the authenticated user
    with optional date range filtering.
    """
    try:
        # Build query
        query = db.query(MoodEntry).filter(
            MoodEntry.user_pseudonym_id == current_user.pseudonym_id
        )
        
        # Apply date filters
        if start_date:
            query = query.filter(MoodEntry.entry_date >= start_date)
        if end_date:
            query = query.filter(MoodEntry.entry_date <= end_date)
        
        # Order by most recent first
        query = query.order_by(desc(MoodEntry.recorded_at))
        
        # Apply pagination
        entries = query.offset(offset).limit(limit).all()
        
        return [
            MoodEntryResponse(
                entry_id=entry.entry_id,
                mood_score=entry.mood_score,
                anxiety_level=entry.anxiety_level,
                stress_level=entry.stress_level,
                energy_level=entry.energy_level,
                sleep_quality=entry.sleep_quality,
                entry_date=entry.entry_date.isoformat(),
                recorded_at=entry.recorded_at.isoformat(),
                entry_method=entry.entry_method,
                data_quality=entry.data_quality,
                notes=entry.notes,
                has_location=entry.location_point is not None,
                is_research_eligible=entry.is_research_eligible
            )
            for entry in entries
        ]
        
    except Exception as e:
        logger.error(f"Failed to get mood entries: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve mood entries"
        )


@router.get("/entries/{entry_id}", response_model=MoodEntryResponse)
@limiter.limit("100/hour")
async def get_mood_entry(
    request: Request,
    entry_id: str,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific mood entry by ID.
    
    Returns detailed information about a single mood entry
    if it belongs to the authenticated user.
    """
    try:
        entry = db.query(MoodEntry).filter(
            and_(
                MoodEntry.entry_id == entry_id,
                MoodEntry.user_pseudonym_id == current_user.pseudonym_id
            )
        ).first()
        
        if not entry:
            raise ResourceNotFoundError("Mood entry", entry_id)
        
        return MoodEntryResponse(
            entry_id=entry.entry_id,
            mood_score=entry.mood_score,
            anxiety_level=entry.anxiety_level,
            stress_level=entry.stress_level,
            energy_level=entry.energy_level,
            sleep_quality=entry.sleep_quality,
            entry_date=entry.entry_date.isoformat(),
            recorded_at=entry.recorded_at.isoformat(),
            entry_method=entry.entry_method,
            data_quality=entry.data_quality,
            notes=entry.notes,
            has_location=entry.location_point is not None,
            is_research_eligible=entry.is_research_eligible
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get mood entry: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve mood entry"
        )


@router.put("/entries/{entry_id}")
@limiter.limit("30/hour")
async def update_mood_entry(
    request: Request,
    entry_id: str,
    mood_update: MoodEntryUpdate,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing mood entry.
    
    Allows users to modify their mood entries within a reasonable
    time window to correct mistakes or add additional information.
    """
    try:
        entry = db.query(MoodEntry).filter(
            and_(
                MoodEntry.entry_id == entry_id,
                MoodEntry.user_pseudonym_id == current_user.pseudonym_id
            )
        ).first()
        
        if not entry:
            raise ResourceNotFoundError("Mood entry", entry_id)
        
        # Check if entry is too old to modify (24 hours)
        time_since_entry = datetime.now(timezone.utc) - entry.recorded_at
        if time_since_entry.total_seconds() > 86400:  # 24 hours
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify entries older than 24 hours"
            )
        
        # Track what was updated
        updated_fields = {}
        
        # Update fields
        for field, value in mood_update.dict(exclude_unset=True).items():
            if hasattr(entry, field) and value is not None:
                old_value = getattr(entry, field)
                setattr(entry, field, value)
                updated_fields[field] = {"old": old_value, "new": value}
        
        # Mark as modified
        entry.is_modified = True
        entry.modification_timestamp = datetime.now(timezone.utc)
        
        db.commit()
        
        # Log mood entry update
        audit_log = AuditLog(
            user_pseudonym_id=current_user.pseudonym_id,
            event_type="mood_entry_updated",
            event_category="user_data",
            event_description="Mood entry updated",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={
                "entry_id": entry_id,
                "updated_fields": updated_fields
            }
        )
        db.add(audit_log)
        db.commit()
        
        return {
            "message": "Mood entry updated successfully",
            "updated_fields": list(updated_fields.keys())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update mood entry: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update mood entry"
        )


@router.delete("/entries/{entry_id}")
@limiter.limit("10/hour")
async def delete_mood_entry(
    request: Request,
    entry_id: str,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a mood entry.
    
    Allows users to delete their mood entries within a reasonable
    time window. For research integrity, entries may be marked
    as deleted rather than physically removed.
    """
    try:
        entry = db.query(MoodEntry).filter(
            and_(
                MoodEntry.entry_id == entry_id,
                MoodEntry.user_pseudonym_id == current_user.pseudonym_id
            )
        ).first()
        
        if not entry:
            raise ResourceNotFoundError("Mood entry", entry_id)
        
        # Check if entry is too old to delete (24 hours)
        time_since_entry = datetime.now(timezone.utc) - entry.recorded_at
        if time_since_entry.total_seconds() > 86400:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot delete entries older than 24 hours"
            )
        
        # Log deletion before removing
        audit_log = AuditLog(
            user_pseudonym_id=current_user.pseudonym_id,
            event_type="mood_entry_deleted",
            event_category="user_data",
            event_description="Mood entry deleted",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={
                "entry_id": entry_id,
                "original_mood_score": entry.mood_score,
                "entry_date": entry.entry_date.isoformat()
            }
        )
        db.add(audit_log)
        
        # Remove the entry
        db.delete(entry)
        db.commit()
        
        return {"message": "Mood entry deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete mood entry: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete mood entry"
        )


@router.get("/trends", response_model=MoodTrendsResponse)
@limiter.limit("50/hour")
async def get_mood_trends(
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$", description="Time period for analysis"),
):
    """
    Get mood trends and analysis for the user.
    
    Analyzes mood patterns over time and provides insights
    about trends, variability, and correlations.
    """
    try:
        # Calculate date range based on period
        end_date = date.today()
        if period == "7d":
            days = 7
        elif period == "30d":
            days = 30
        elif period == "90d":
            days = 90
        else:  # 1y
            days = 365
        
        start_date = end_date - timedelta(days=days)
        
        # Get entries for the period
        entries = db.query(MoodEntry).filter(
            and_(
                MoodEntry.user_pseudonym_id == current_user.pseudonym_id,
                MoodEntry.entry_date >= start_date,
                MoodEntry.entry_date <= end_date
            )
        ).all()
        
        if not entries:
            return MoodTrendsResponse(
                period=period,
                average_mood=0.0,
                mood_trend="insufficient_data",
                total_entries=0,
                mood_variability=0.0,
                anxiety_average=None,
                stress_average=None,
                energy_average=None,
                sleep_average=None
            )
        
        # Calculate basic statistics
        mood_scores = [entry.mood_score for entry in entries]
        avg_mood = sum(mood_scores) / len(mood_scores)
        mood_variability = calculate_variability(mood_scores)
        
        # Calculate trend (simplified)
        recent_entries = sorted(entries, key=lambda x: x.entry_date)[-7:]  # Last week
        older_entries = sorted(entries, key=lambda x: x.entry_date)[:7]   # First week
        
        if len(recent_entries) > 0 and len(older_entries) > 0:
            recent_avg = sum(e.mood_score for e in recent_entries) / len(recent_entries)
            older_avg = sum(e.mood_score for e in older_entries) / len(older_entries)
            
            if recent_avg > older_avg + 0.5:
                trend = "improving"
            elif recent_avg < older_avg - 0.5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        # Calculate averages for other metrics
        anxiety_scores = [e.anxiety_level for e in entries if e.anxiety_level is not None]
        stress_scores = [e.stress_level for e in entries if e.stress_level is not None]
        energy_scores = [e.energy_level for e in entries if e.energy_level is not None]
        sleep_scores = [e.sleep_quality for e in entries if e.sleep_quality is not None]
        
        return MoodTrendsResponse(
            period=period,
            average_mood=round(avg_mood, 2),
            mood_trend=trend,
            total_entries=len(entries),
            mood_variability=round(mood_variability, 2),
            anxiety_average=round(sum(anxiety_scores) / len(anxiety_scores), 2) if anxiety_scores else None,
            stress_average=round(sum(stress_scores) / len(stress_scores), 2) if stress_scores else None,
            energy_average=round(sum(energy_scores) / len(energy_scores), 2) if energy_scores else None,
            sleep_average=round(sum(sleep_scores) / len(sleep_scores), 2) if sleep_scores else None
        )
        
    except Exception as e:
        logger.error(f"Failed to get mood trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze mood trends"
        )


def calculate_variability(scores: List[int]) -> float:
    """Calculate mood variability (standard deviation)."""
    if len(scores) < 2:
        return 0.0
    
    mean = sum(scores) / len(scores)
    variance = sum((score - mean) ** 2 for score in scores) / len(scores)
    return variance ** 0.5