"""
Application configuration for MindMap Research API.
Manages environment variables, security settings, and research compliance parameters.
"""

import os
from typing import List, Optional
from pydantic import BaseSettings, validator
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with validation and environment support."""
    
    # Application settings
    APP_NAME: str = "MindMap Research API"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API settings
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database settings
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/mindmap"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_POOL_RECYCLE: int = 3600
    
    # Redis settings (for rate limiting and caching)
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    
    # Firebase settings
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_PRIVATE_KEY_ID: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""
    FIREBASE_CLIENT_ID: str = ""
    FIREBASE_CLIENT_X509_CERT_URL: str = ""
    
    # Security settings
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "*.mindmap-platform.org"]
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://mindmap-platform.org",
        "https://app.mindmap-platform.org"
    ]
    
    # Rate limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60
    RATE_LIMIT_REQUESTS_PER_HOUR: int = 1000
    RATE_LIMIT_BURST_SIZE: int = 10
    
    # Pseudonymization
    PSEUDONYMIZATION_SALT: str = "mindmap-research-salt-2024"
    HASH_ALGORITHM: str = "SHA256"
    
    # Research compliance
    REQUIRE_CONSENT: bool = True
    MINIMUM_AGE: int = 18
    DATA_RETENTION_DAYS: int = 2555  # 7 years
    AUDIT_LOG_RETENTION_DAYS: int = 3650  # 10 years
    
    # Geographic analysis
    DEFAULT_LOCATION_ACCURACY_METERS: float = 100.0
    MINIMUM_LOCATION_ACCURACY_METERS: float = 10.0
    GEOGRAPHIC_PRIVACY_RADIUS_METERS: float = 500.0
    
    # Bias detection
    BIAS_DETECTION_ENABLED: bool = True
    BIAS_DETECTION_THRESHOLD: float = 0.1
    BIAS_DETECTION_SIGNIFICANCE_LEVEL: float = 0.05
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    ACCESS_LOG_FORMAT: str = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'
    
    # Monitoring and metrics
    ENABLE_METRICS: bool = True
    METRICS_PATH: str = "/metrics"
    HEALTH_CHECK_PATH: str = "/health"
    
    # File upload settings
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: List[str] = [".jpg", ".jpeg", ".png", ".pdf", ".txt", ".csv"]
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        """Validate environment setting."""
        allowed = ["development", "testing", "staging", "production"]
        if v not in allowed:
            raise ValueError(f"Environment must be one of: {allowed}")
        return v
    
    @validator("DATABASE_URL")
    def validate_database_url(cls, v):
        """Validate database URL format."""
        if not v.startswith(("postgresql://", "postgresql+psycopg2://")):
            raise ValueError("Database URL must be a PostgreSQL connection string")
        return v
    
    @validator("ALLOWED_ORIGINS")
    def validate_origins(cls, v):
        """Validate CORS origins."""
        if not v:
            raise ValueError("At least one allowed origin must be specified")
        return v
    
    @validator("FIREBASE_PROJECT_ID")
    def validate_firebase_config(cls, v, values):
        """Validate Firebase configuration for production."""
        if values.get("ENVIRONMENT") == "production" and not v:
            raise ValueError("Firebase project ID is required in production")
        return v
    
    @validator("SECRET_KEY")
    def validate_secret_key(cls, v, values):
        """Validate secret key for production."""
        if values.get("ENVIRONMENT") == "production":
            if len(v) < 32:
                raise ValueError("Secret key must be at least 32 characters in production")
            if v == "your-secret-key-change-in-production":
                raise ValueError("Default secret key cannot be used in production")
        return v
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.ENVIRONMENT == "production"
    
    @property
    def database_config(self) -> dict:
        """Get database configuration for SQLAlchemy."""
        return {
            "pool_size": self.DATABASE_POOL_SIZE,
            "max_overflow": self.DATABASE_MAX_OVERFLOW,
            "pool_timeout": self.DATABASE_POOL_TIMEOUT,
            "pool_recycle": self.DATABASE_POOL_RECYCLE,
            "pool_pre_ping": True,
            "echo": self.DEBUG and self.is_development,
        }
    
    @property
    def firebase_config(self) -> dict:
        """Get Firebase configuration dictionary."""
        return {
            "type": "service_account",
            "project_id": self.FIREBASE_PROJECT_ID,
            "private_key_id": self.FIREBASE_PRIVATE_KEY_ID,
            "private_key": self.FIREBASE_PRIVATE_KEY.replace("\\n", "\n") if self.FIREBASE_PRIVATE_KEY else "",
            "client_email": self.FIREBASE_CLIENT_EMAIL,
            "client_id": self.FIREBASE_CLIENT_ID,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": self.FIREBASE_CLIENT_X509_CERT_URL
        }
    
    @property
    def redis_config(self) -> dict:
        """Get Redis configuration dictionary."""
        return {
            "url": self.REDIS_URL,
            "password": self.REDIS_PASSWORD,
            "db": self.REDIS_DB,
            "decode_responses": True,
            "socket_connect_timeout": 5,
            "socket_timeout": 5,
            "retry_on_timeout": True,
        }
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()


# Create global settings instance
settings = get_settings()


# Development settings override
if settings.ENVIRONMENT == "development":
    settings.DEBUG = True
    settings.LOG_LEVEL = "DEBUG"
    
# Production settings override
elif settings.ENVIRONMENT == "production":
    settings.DEBUG = False
    settings.LOG_LEVEL = "WARNING"
    settings.RATE_LIMIT_REQUESTS_PER_MINUTE = 30  # Stricter rate limiting
    settings.RATE_LIMIT_REQUESTS_PER_HOUR = 500