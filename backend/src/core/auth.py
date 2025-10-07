"""
Authentication system for MindMap Research API.
Supports Firebase Authentication and JWT tokens with research-grade security.
"""

import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Union
from functools import wraps

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel, ValidationError

from .config import settings
from database.base import SessionLocal
from database.models.user import User
from database.models.audit_log import AuditLog
from database.utils.pseudonymization import pseudonymizer

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer(auto_error=False)

# Firebase initialization
_firebase_app = None


class TokenData(BaseModel):
    """Token payload data model."""
    user_id: Optional[str] = None
    email: Optional[str] = None
    pseudonym_id: Optional[str] = None
    is_verified: bool = False
    auth_method: str = "unknown"
    iat: Optional[int] = None
    exp: Optional[int] = None


class AuthenticatedUser(BaseModel):
    """Authenticated user model for dependency injection."""
    pseudonym_id: str
    email: Optional[str] = None
    is_verified: bool = False
    auth_method: str
    firebase_uid: Optional[str] = None
    permissions: list[str] = []
    is_researcher: bool = False
    is_admin: bool = False


def init_firebase():
    """Initialize Firebase Admin SDK."""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
        logger.info("Firebase already initialized")
        return firebase_admin.get_app()
    except ValueError:
        pass
    
    if not settings.FIREBASE_PROJECT_ID:
        logger.warning("Firebase not configured - Firebase authentication disabled")
        return None
    
    try:
        # Initialize Firebase with service account
        cred = credentials.Certificate(settings.firebase_config)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
        return _firebase_app
    except Exception as e:
        logger.error(f"Firebase initialization failed: {e}")
        return None


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "iss": "mindmap-research-api",
        "aud": "mindmap-client"
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def create_refresh_token(user_id: str) -> str:
    """Create a JWT refresh token."""
    data = {
        "user_id": user_id,
        "token_type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(data, settings.SECRET_KEY, algorithm="HS256")


async def verify_firebase_token(token: str) -> Dict[str, Any]:
    """Verify Firebase ID token."""
    if not _firebase_app and not init_firebase():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase authentication is not available"
        )
    
    try:
        # Verify the Firebase token
        decoded_token = firebase_auth.verify_id_token(token)
        
        # Extract user information
        user_info = {
            "firebase_uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture"),
            "auth_method": "firebase",
            "token_claims": decoded_token
        }
        
        logger.info(f"Firebase token verified for user: {user_info['firebase_uid']}")
        return user_info
        
    except firebase_auth.InvalidIdTokenError:
        logger.warning(f"Invalid Firebase token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Firebase token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def verify_jwt_token(token: str) -> TokenData:
    """Verify JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        
        # Validate token structure
        user_id = payload.get("sub") or payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        
        # Check token expiration
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        
        return TokenData(
            user_id=user_id,
            email=payload.get("email"),
            pseudonym_id=payload.get("pseudonym_id"),
            is_verified=payload.get("email_verified", False),
            auth_method=payload.get("auth_method", "jwt"),
            iat=payload.get("iat"),
            exp=payload.get("exp")
        )
        
    except JWTError as e:
        logger.warning(f"JWT token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_or_create_user(user_info: Dict[str, Any], db) -> User:
    """Get existing user or create new user from authentication info."""
    
    # Generate pseudonym for user
    identifier = user_info.get("email") or user_info.get("firebase_uid")
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to identify user from authentication data"
        )
    
    pseudonym_id = pseudonymizer.pseudonymize_user_id(identifier)
    identifier_hash = pseudonymizer.hash_sensitive_data(identifier)
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.identifier_hash == identifier_hash).first()
    
    if existing_user:
        # Update last login
        existing_user.last_login = datetime.now(timezone.utc)
        db.commit()
        logger.info(f"Existing user logged in: {existing_user.pseudonym_id}")
        return existing_user
    
    # Create new user
    new_user = User(
        pseudonym_id=pseudonym_id,
        identifier_hash=identifier_hash,
        is_active=True,
        engagement_score=0.0,
        data_sharing_consent=False,  # Must be explicitly granted
        research_participation_consent=False,  # Must be explicitly granted
        is_consented=False,
        preferred_language="en",
        timezone="UTC",
        last_login=datetime.now(timezone.utc)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log user creation
    audit_log = AuditLog(
        user_pseudonym_id=pseudonym_id,
        event_type="user_created",
        event_category="authentication",
        event_description="New user account created",
        ip_address="unknown",  # Will be set by middleware
        user_agent="unknown",  # Will be set by middleware
        additional_data={
            "auth_method": user_info.get("auth_method", "unknown"),
            "email_verified": user_info.get("email_verified", False)
        }
    )
    db.add(audit_log)
    db.commit()
    
    logger.info(f"New user created: {new_user.pseudonym_id}")
    return new_user


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> AuthenticatedUser:
    """Get current authenticated user from token."""
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    db = SessionLocal()
    
    try:
        # Try Firebase token first
        try:
            firebase_user_info = await verify_firebase_token(token)
            user = await get_or_create_user(firebase_user_info, db)
            
            return AuthenticatedUser(
                pseudonym_id=user.pseudonym_id,
                email=firebase_user_info.get("email"),
                is_verified=firebase_user_info.get("email_verified", False),
                auth_method="firebase",
                firebase_uid=firebase_user_info.get("firebase_uid"),
                permissions=["user"],
                is_researcher=False,  # Would be determined by role system
                is_admin=False
            )
            
        except HTTPException as firebase_error:
            # If Firebase fails, try JWT
            if firebase_error.status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
                # Firebase not available, try JWT
                pass
            else:
                # Firebase token was invalid, try JWT as fallback
                pass
        
        # Try JWT token
        token_data = await verify_jwt_token(token)
        
        # Get user from database
        user = db.query(User).filter(User.pseudonym_id == token_data.pseudonym_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return AuthenticatedUser(
            pseudonym_id=user.pseudonym_id,
            email=token_data.email,
            is_verified=token_data.is_verified,
            auth_method="jwt",
            permissions=["user"],
            is_researcher=False,
            is_admin=False
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
    finally:
        db.close()


async def get_current_active_user(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """Get current active user (requires user to be active)."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive"
            )
        return current_user
    finally:
        db.close()


async def get_current_consented_user(
    current_user: AuthenticatedUser = Depends(get_current_active_user)
) -> AuthenticatedUser:
    """Get current user with research consent (required for research endpoints)."""
    if not settings.REQUIRE_CONSENT:
        return current_user
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.pseudonym_id == current_user.pseudonym_id).first()
        if not user or not user.is_consented or not user.research_participation_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Research participation consent required"
            )
        return current_user
    finally:
        db.close()


def require_permissions(required_permissions: list[str]):
    """Decorator to require specific permissions."""
    def decorator(func):
        @wraps(func)
        async def wrapper(
            current_user: AuthenticatedUser = Depends(get_current_active_user),
            *args, **kwargs
        ):
            user_permissions = set(current_user.permissions)
            required_perms = set(required_permissions)
            
            if not required_perms.issubset(user_permissions):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required: {required_permissions}"
                )
            
            return await func(current_user=current_user, *args, **kwargs)
        return wrapper
    return decorator


def require_researcher_role(
    current_user: AuthenticatedUser = Depends(get_current_active_user)
) -> AuthenticatedUser:
    """Dependency to require researcher role."""
    if not current_user.is_researcher:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Researcher role required"
        )
    return current_user


def require_admin_role(
    current_user: AuthenticatedUser = Depends(get_current_active_user)
) -> AuthenticatedUser:
    """Dependency to require admin role."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator role required"
        )
    return current_user


# Initialize Firebase on module import
init_firebase()