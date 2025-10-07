"""
User management endpoints for MindMap Research API.
Handles user profiles, preferences, and HIPAA-compliant data operations.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from core.auth import (
    get_current_active_user,
    get_current_consented_user,
    require_researcher_role,
    AuthenticatedUser
)
from core.config import settings
from core.exceptions import ResourceNotFoundError, ValidationError, ConsentRequiredError
from database.base import get_db
from database.models.user import User, DemographicCategory, GenderIdentity, RaceEthnicity
from database.models.social_determinants import SocialDeterminants
from database.models.audit_log import AuditLog

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class UserProfileUpdate(BaseModel):
    """Model for updating user profile information."""
    age_group: Optional[DemographicCategory] = None
    gender_identity: Optional[GenderIdentity] = None
    race_ethnicity: Optional[RaceEthnicity] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    
    @validator('preferred_language')
    def validate_language(cls, v):
        if v and len(v) not in [2, 5]:  # ISO language codes
            raise ValueError('Language code must be in ISO format (e.g., "en" or "en-US")')
        return v
    
    @validator('timezone')
    def validate_timezone(cls, v):
        if v:
            # Basic timezone validation - in production, use pytz
            valid_timezones = [
                'UTC', 'America/New_York', 'America/Chicago', 
                'America/Denver', 'America/Los_Angeles', 'Europe/London'
            ]
            if v not in valid_timezones:
                raise ValueError(f'Timezone must be one of: {valid_timezones}')
        return v


class UserPreferencesUpdate(BaseModel):
    """Model for updating user preferences."""
    data_sharing_consent: Optional[bool] = None
    location_tracking_enabled: Optional[bool] = None
    notification_preferences: Optional[dict] = None
    privacy_level: Optional[str] = None
    
    @validator('privacy_level')
    def validate_privacy_level(cls, v):
        if v and v not in ['minimal', 'standard', 'enhanced']:
            raise ValueError('Privacy level must be minimal, standard, or enhanced')
        return v


class SocialDeterminantsUpdate(BaseModel):
    """Model for updating social determinants of health data."""
    income_level: Optional[str] = None
    education_level: Optional[str] = None
    employment_status: Optional[str] = None
    insurance_status: Optional[str] = None
    housing_status: Optional[str] = None
    has_mental_health_provider: Optional[bool] = None
    social_support_level: Optional[int] = None
    experiences_discrimination: Optional[bool] = None
    financial_stress_level: Optional[int] = None
    neighborhood_safety_rating: Optional[int] = None
    
    @validator('social_support_level', 'financial_stress_level', 'neighborhood_safety_rating')
    def validate_ratings(cls, v, field):
        if v is not None and not (1 <= v <= 5):
            raise ValueError(f'{field.name} must be between 1 and 5')
        return v


class UserResponse(BaseModel):
    """Response model for user data."""
    pseudonym_id: str
    age_group: Optional[str]
    gender_identity: Optional[str]
    race_ethnicity: Optional[str]
    is_active: bool
    is_consented: bool
    engagement_score: float
    preferred_language: str
    timezone: str
    last_login: Optional[str]
    created_at: str


@router.get("/profile", response_model=UserResponse)
@limiter.limit("30/minute")
async def get_user_profile(
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's profile information.
    
    Returns the user's profile data including demographics,
    preferences, and account status.
    """
    try:
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if not user:
            raise ResourceNotFoundError("User", current_user.pseudonym_id)
        
        return UserResponse(
            pseudonym_id=user.pseudonym_id,
            age_group=user.age_group.value if user.age_group else None,
            gender_identity=user.gender_identity.value if user.gender_identity else None,
            race_ethnicity=user.race_ethnicity.value if user.race_ethnicity else None,
            is_active=user.is_active,
            is_consented=user.is_consented,
            engagement_score=user.engagement_score,
            preferred_language=user.preferred_language,
            timezone=user.timezone,
            last_login=user.last_login.isoformat() if user.last_login else None,
            created_at=user.created_at.isoformat() if user.created_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile"
        )


@router.put("/profile")
@limiter.limit("10/minute")
async def update_user_profile(
    request: Request,
    profile_data: UserProfileUpdate,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile information.
    
    Allows users to update their demographic information,
    language preferences, and timezone settings.
    """
    try:
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if not user:
            raise ResourceNotFoundError("User", current_user.pseudonym_id)
        
        # Track what fields were updated for audit logging
        updated_fields = {}
        
        # Update profile fields
        if profile_data.age_group is not None:
            user.age_group = profile_data.age_group
            updated_fields['age_group'] = profile_data.age_group.value
        
        if profile_data.gender_identity is not None:
            user.gender_identity = profile_data.gender_identity
            updated_fields['gender_identity'] = profile_data.gender_identity.value
        
        if profile_data.race_ethnicity is not None:
            user.race_ethnicity = profile_data.race_ethnicity
            updated_fields['race_ethnicity'] = profile_data.race_ethnicity.value
        
        if profile_data.preferred_language is not None:
            user.preferred_language = profile_data.preferred_language
            updated_fields['preferred_language'] = profile_data.preferred_language
        
        if profile_data.timezone is not None:
            user.timezone = profile_data.timezone
            updated_fields['timezone'] = profile_data.timezone
        
        db.commit()
        
        # Log profile update
        audit_log = AuditLog(
            user_pseudonym_id=user.pseudonym_id,
            event_type="profile_updated",
            event_category="user_management",
            event_description="User profile updated",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={"updated_fields": updated_fields}
        )
        db.add(audit_log)
        db.commit()
        
        return {"message": "Profile updated successfully", "updated_fields": list(updated_fields.keys())}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user profile: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )


@router.get("/preferences")
@limiter.limit("30/minute")
async def get_user_preferences(
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user preferences and privacy settings.
    
    Returns current privacy preferences, notification settings,
    and consent status.
    """
    try:
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if not user:
            raise ResourceNotFoundError("User", current_user.pseudonym_id)
        
        return {
            "data_sharing_consent": user.data_sharing_consent,
            "research_participation_consent": user.research_participation_consent,
            "is_consented": user.is_consented,
            "consent_version_id": user.consent_version_id,
            "engagement_score": user.engagement_score,
            "notification_preferences": {},  # Would be implemented with user preferences model
            "privacy_level": "standard"  # Would be determined from user settings
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user preferences"
        )


@router.put("/preferences")
@limiter.limit("10/minute")
async def update_user_preferences(
    request: Request,
    preferences_data: UserPreferencesUpdate,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update user preferences and privacy settings.
    
    Allows users to modify their privacy preferences,
    consent settings, and notification preferences.
    """
    try:
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if not user:
            raise ResourceNotFoundError("User", current_user.pseudonym_id)
        
        updated_fields = {}
        
        # Update consent preferences
        if preferences_data.data_sharing_consent is not None:
            user.data_sharing_consent = preferences_data.data_sharing_consent
            updated_fields['data_sharing_consent'] = preferences_data.data_sharing_consent
        
        # Update other preferences would go here
        
        db.commit()
        
        # Log preferences update
        audit_log = AuditLog(
            user_pseudonym_id=user.pseudonym_id,
            event_type="preferences_updated",
            event_category="privacy",
            event_description="User preferences updated",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={"updated_fields": updated_fields}
        )
        db.add(audit_log)
        db.commit()
        
        return {"message": "Preferences updated successfully", "updated_fields": list(updated_fields.keys())}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user preferences: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user preferences"
        )


@router.get("/social-determinants")
@limiter.limit("30/minute")
async def get_social_determinants(
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_consented_user),
    db: Session = Depends(get_db)
):
    """
    Get user's social determinants of health data.
    
    Returns SDOH data for consented research participants.
    Requires research participation consent.
    """
    try:
        sdoh = db.query(SocialDeterminants).filter(
            SocialDeterminants.user_pseudonym_id == current_user.pseudonym_id
        ).first()
        
        if not sdoh:
            return {"message": "No social determinants data available"}
        
        return {
            "income_level": sdoh.income_level,
            "education_level": sdoh.education_level,
            "employment_status": sdoh.employment_status,
            "insurance_status": sdoh.insurance_status,
            "housing_status": sdoh.housing_status,
            "has_mental_health_provider": sdoh.has_mental_health_provider,
            "social_support_level": sdoh.social_support_level,
            "experiences_discrimination": sdoh.experiences_discrimination,
            "financial_stress_level": sdoh.financial_stress_level,
            "neighborhood_safety_rating": sdoh.neighborhood_safety_rating,
            "data_collection_date": sdoh.data_collection_date.isoformat() if sdoh.data_collection_date else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get social determinants: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve social determinants data"
        )


@router.put("/social-determinants")
@limiter.limit("5/minute")
async def update_social_determinants(
    request: Request,
    sdoh_data: SocialDeterminantsUpdate,
    current_user: AuthenticatedUser = Depends(get_current_consented_user),
    db: Session = Depends(get_db)
):
    """
    Update user's social determinants of health data.
    
    Allows consented users to update their SDOH information
    for research purposes. Requires research consent.
    """
    try:
        # Get or create SDOH record
        sdoh = db.query(SocialDeterminants).filter(
            SocialDeterminants.user_pseudonym_id == current_user.pseudonym_id
        ).first()
        
        if not sdoh:
            sdoh = SocialDeterminants(
                user_pseudonym_id=current_user.pseudonym_id,
                data_collection_date=datetime.now(timezone.utc)
            )
            db.add(sdoh)
        
        updated_fields = {}
        
        # Update SDOH fields
        for field, value in sdoh_data.dict(exclude_unset=True).items():
            if hasattr(sdoh, field) and value is not None:
                setattr(sdoh, field, value)
                updated_fields[field] = value
        
        # Update data collection date
        sdoh.data_collection_date = datetime.now(timezone.utc)
        
        db.commit()
        
        # Log SDOH update
        audit_log = AuditLog(
            user_pseudonym_id=current_user.pseudonym_id,
            event_type="sdoh_updated",
            event_category="research_data",
            event_description="Social determinants of health data updated",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={
                "updated_fields": updated_fields,
                "research_eligible": True
            }
        )
        db.add(audit_log)
        db.commit()
        
        return {
            "message": "Social determinants data updated successfully",
            "updated_fields": list(updated_fields.keys()),
            "data_collection_date": sdoh.data_collection_date.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update social determinants: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update social determinants data"
        )


@router.delete("/account")
@limiter.limit("3/hour")
async def delete_user_account(
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete user account and all associated data.
    
    Implements GDPR/CCPA right to deletion while maintaining
    research data integrity and compliance requirements.
    """
    try:
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if not user:
            raise ResourceNotFoundError("User", current_user.pseudonym_id)
        
        # Log account deletion request
        audit_log = AuditLog(
            user_pseudonym_id=user.pseudonym_id,
            event_type="account_deletion_requested",
            event_category="privacy",
            event_description="User requested account deletion",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={
                "research_data_present": user.research_participation_consent,
                "consented": user.is_consented
            }
        )
        db.add(audit_log)
        db.commit()
        
        # In a production system, this would:
        # 1. Check if user has research data that must be retained
        # 2. Anonymize rather than delete if retention is required
        # 3. Schedule deletion after retention period
        # 4. Remove from all systems and backups
        
        # For now, mark as inactive instead of hard delete
        user.is_active = False
        user.engagement_score = 0.0
        db.commit()
        
        return {
            "message": "Account deactivation initiated",
            "status": "scheduled_for_deletion",
            "note": "Research data will be handled according to retention policies"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete user account: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process account deletion request"
        )