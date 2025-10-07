"""
Startup script for MindMap Research API.
Initializes database, checks configuration, and sets up monitoring.
"""

import logging
import sys
import os
from pathlib import Path

# Add src directory to Python path
src_path = Path(__file__).parent
sys.path.insert(0, str(src_path))

from core.config import settings
from database.base import init_database, db_manager
from database.init_db import initialize_database

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format=settings.LOG_FORMAT,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('mindmap_api.log') if settings.is_production else logging.NullHandler()
    ]
)

logger = logging.getLogger(__name__)


def check_environment():
    """Validate environment configuration."""
    logger.info("Checking environment configuration...")
    
    # Critical settings
    critical_settings = [
        'DATABASE_URL',
        'SECRET_KEY',
        'PSEUDONYMIZATION_SALT'
    ]
    
    missing_settings = []
    for setting in critical_settings:
        if not getattr(settings, setting, None):
            missing_settings.append(setting)
    
    if missing_settings:
        logger.error(f"Missing critical settings: {missing_settings}")
        return False
    
    # Production-specific checks
    if settings.is_production:
        if settings.SECRET_KEY == "your-secret-key-change-in-production":
            logger.error("Production environment using default secret key")
            return False
        
        if not settings.FIREBASE_PROJECT_ID:
            logger.warning("Firebase not configured in production")
    
    logger.info("Environment configuration valid")
    return True


def check_database():
    """Check database connectivity and health."""
    logger.info("Checking database connectivity...")
    
    try:
        if not db_manager.health_check():
            logger.error("Database health check failed")
            return False
        
        pool_status = db_manager.get_pool_status()
        logger.info(f"Database pool status: {pool_status}")
        
        logger.info("Database connectivity confirmed")
        return True
        
    except Exception as e:
        logger.error(f"Database check failed: {e}")
        return False


def initialize_application():
    """Initialize the complete application."""
    logger.info("Starting MindMap Research API initialization...")
    
    # Check environment
    if not check_environment():
        logger.error("Environment check failed")
        sys.exit(1)
    
    # Initialize database
    try:
        logger.info("Initializing database...")
        initialize_database()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)
    
    # Check database health
    if not check_database():
        logger.error("Database health check failed")
        sys.exit(1)
    
    # Initialize Firebase (if configured)
    try:
        from core.auth import init_firebase
        if settings.FIREBASE_PROJECT_ID:
            init_firebase()
            logger.info("Firebase initialized successfully")
        else:
            logger.info("Firebase not configured - skipping initialization")
    except Exception as e:
        logger.warning(f"Firebase initialization failed: {e}")
    
    # Initialize Redis (if available)
    try:
        from core.middleware import redis_client
        if redis_client:
            redis_client.ping()
            logger.info("Redis connection confirmed")
        else:
            logger.info("Redis not available - using in-memory rate limiting")
    except Exception as e:
        logger.warning(f"Redis check failed: {e}")
    
    logger.info("Application initialization completed successfully")
    logger.info(f"Running in {settings.ENVIRONMENT} mode")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"API documentation: http://localhost:8000/docs")


if __name__ == "__main__":
    initialize_application()