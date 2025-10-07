"""
Authentication endpoints for MindMap Research API.
Handles Firebase authentication, JWT tokens, and user session management.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy.orm import Session

from core.auth import (
    create_access_token,
    create_refresh_token,
    verify_firebase_token,
    verify_jwt_token,
    get_current_user,
    get_current_active_user,
    AuthenticatedUser
)
from core.config import settings
from core.exceptions import AuthenticationError, ValidationError
from database.base import get_db
from database.models.user import User
from database.models.audit_log import AuditLog

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()


class FirebaseLoginRequest(BaseModel):
    """Request model for Firebase authentication."""
    firebase_token: str
    device_info: Optional[dict] = None
    
    @validator('firebase_token')
    def validate_firebase_token(cls, v):
        if not v or len(v) < 10:
            raise ValueError('Invalid Firebase token format')
        return v


class JWTLoginRequest(BaseModel):
    """Request model for JWT authentication."""
    email: EmailStr
    password: str  # This would be hashed
    remember_me: bool = False
    device_info: Optional[dict] = None


class TokenResponse(BaseModel):
    """Response model for successful authentication."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: dict


class RefreshTokenRequest(BaseModel):
    """Request model for token refresh."""
    refresh_token: str


class LogoutRequest(BaseModel):
    """Request model for logout."""
    all_devices: bool = False


@router.post("/firebase-login", response_model=TokenResponse)
async def firebase_login(
    request: Request,
    login_data: FirebaseLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with Firebase ID token.
    
    This endpoint accepts a Firebase ID token, verifies it, and returns
    JWT tokens for API access along with user information.
    """
    try:
        # Verify Firebase token
        firebase_user_info = await verify_firebase_token(login_data.firebase_token)
        
        # Get or create user in database
        from core.auth import get_or_create_user
        user = await get_or_create_user(firebase_user_info, db)
        
        # Create JWT tokens
        token_data = {
            "sub": user.pseudonym_id,
            "email": firebase_user_info.get("email"),
            "pseudonym_id": user.pseudonym_id,
            "email_verified": firebase_user_info.get("email_verified", False),
            "auth_method": "firebase"
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(user.pseudonym_id)
        
        # Log successful authentication
        audit_log = AuditLog(
            user_pseudonym_id=user.pseudonym_id,
            event_type="login_success",
            event_category="authentication",
            event_description="Successful Firebase authentication",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={
                "auth_method": "firebase",
                "device_info": login_data.device_info
            }
        )
        db.add(audit_log)
        db.commit()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_info={
                "pseudonym_id": user.pseudonym_id,
                "email": firebase_user_info.get("email"),
                "email_verified": firebase_user_info.get("email_verified", False),
                "is_active": user.is_active,
                "is_consented": user.is_consented,
                "research_participation": user.research_participation_consent,
                "data_sharing_consent": user.data_sharing_consent
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Firebase login failed: {e}")
        
        # Log failed authentication attempt
        audit_log = AuditLog(
            event_type="login_failed",
            event_category="security",
            event_description="Failed Firebase authentication attempt",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={
                "auth_method": "firebase",
                "error": str(e)
            }
        )
        db.add(audit_log)
        db.commit()
        
        raise AuthenticationError("Firebase authentication failed")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    Validates the refresh token and issues a new access token
    if the refresh token is valid and not expired.
    """
    try:
        # Verify refresh token
        token_data = await verify_jwt_token(refresh_data.refresh_token)
        
        # Get user from database
        user = db.query(User).filter(User.pseudonym_id == token_data.user_id).first()
        if not user or not user.is_active:
            raise AuthenticationError("User not found or inactive")
        
        # Create new access token
        new_token_data = {
            "sub": user.pseudonym_id,
            "pseudonym_id": user.pseudonym_id,
            "auth_method": token_data.auth_method
        }
        
        new_access_token = create_access_token(new_token_data)
        new_refresh_token = create_refresh_token(user.pseudonym_id)
        
        # Log token refresh
        audit_log = AuditLog(
            user_pseudonym_id=user.pseudonym_id,
            event_type="token_refreshed",
            event_category="authentication",
            event_description="Access token refreshed",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown")
        )
        db.add(audit_log)
        db.commit()
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_info={
                "pseudonym_id": user.pseudonym_id,
                "is_active": user.is_active,
                "is_consented": user.is_consented
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise AuthenticationError("Token refresh failed")


@router.post("/logout")
async def logout(
    request: Request,
    logout_data: LogoutRequest,
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Logout user and invalidate tokens.
    
    In a production system, this would invalidate the refresh token
    and optionally all user sessions if requested.
    """
    try:
        # Log logout event
        audit_log = AuditLog(
            user_pseudonym_id=current_user.pseudonym_id,
            event_type="logout",
            event_category="authentication",
            event_description="User logout",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={
                "all_devices": logout_data.all_devices
            }
        )
        db.add(audit_log)
        db.commit()
        
        # In a full implementation, you would:
        # 1. Add the tokens to a blacklist/revocation list
        # 2. Clear session data
        # 3. If all_devices=True, invalidate all user tokens
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.get("/me")
async def get_current_user_info(
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user information.
    
    Returns detailed information about the authenticated user
    including consent status and research participation.
    """
    try:
        # Get full user data from database
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "pseudonym_id": user.pseudonym_id,
            "is_active": user.is_active,
            "is_consented": user.is_consented,
            "consent_version_id": user.consent_version_id,
            "research_participation_consent": user.research_participation_consent,
            "data_sharing_consent": user.data_sharing_consent,
            "preferred_language": user.preferred_language,
            "timezone": user.timezone,
            "engagement_score": user.engagement_score,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "auth_method": current_user.auth_method,
            "permissions": current_user.permissions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information"
        )


@router.get("/verify")
async def verify_token(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Verify if the current token is valid.
    
    This endpoint can be used by clients to check if their
    token is still valid without making other API calls.
    """
    return {
        "valid": True,
        "user_id": current_user.pseudonym_id,
        "auth_method": current_user.auth_method,
        "is_verified": current_user.is_verified
    }


@router.post("/consent")
async def update_consent(
    request: Request,
    consent_data: dict,  # Would define proper consent model
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update user consent preferences.
    
    Handles research participation consent, data sharing consent,
    and other privacy preferences required for research compliance.
    """
    try:
        # Get user from database
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update consent fields
        if "research_participation_consent" in consent_data:
            user.research_participation_consent = consent_data["research_participation_consent"]
        
        if "data_sharing_consent" in consent_data:
            user.data_sharing_consent = consent_data["data_sharing_consent"]
        
        if "consent_version_id" in consent_data:
            user.consent_version_id = consent_data["consent_version_id"]
        
        # Mark as consented if all required consents are given
        user.is_consented = (
            user.research_participation_consent and 
            user.consent_version_id is not None
        )
        
        db.commit()
        
        # Log consent update
        audit_log = AuditLog(
            user_pseudonym_id=user.pseudonym_id,
            event_type="consent_updated",
            event_category="compliance",
            event_description="User consent preferences updated",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data=consent_data
        )
        db.add(audit_log)
        db.commit()
        
        return {
            "message": "Consent updated successfully",
            "is_consented": user.is_consented,
            "research_participation_consent": user.research_participation_consent,
            "data_sharing_consent": user.data_sharing_consent
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update consent: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update consent preferences"
        )