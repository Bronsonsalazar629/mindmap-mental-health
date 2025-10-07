"""
Database configuration and base classes for mental health research platform.
Includes HIPAA compliance, bias detection, and research ethics support.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from geoalchemy2 import Geography
import os
from datetime import datetime, timezone
import logging

# Configure logging for database operations
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database URL with PostGIS support
DATABASE_URL = os.getenv(
    'DATABASE_URL', 
    'postgresql://postgres:password@localhost:5432/mindmap'
)

# Create engine with advanced connection pooling for production
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv('NODE_ENV') == 'development',
    pool_size=10,  # Number of connections to maintain in pool
    max_overflow=20,  # Additional connections beyond pool_size
    pool_timeout=30,  # Seconds to wait for connection
    pool_recycle=3600,  # Recreate connections after 1 hour
    pool_pre_ping=True,  # Validate connections before use
    connect_args={
        "options": "-c timezone=utc",
        "connect_timeout": 10,
        "application_name": "mindmap-research-api"
    },
    # Enable query logging for research compliance
    logging_name="sqlalchemy.engine",
    # Connection pooling events for monitoring
    echo_pool=os.getenv('NODE_ENV') == 'development'
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Audit logging for research compliance
@event.listens_for(Session, 'before_insert')
def before_insert(mapper, connection, target):
    """Add creation timestamp and audit info before insert."""
    if hasattr(target, 'created_at'):
        target.created_at = datetime.now(timezone.utc)
    if hasattr(target, 'updated_at'):
        target.updated_at = datetime.now(timezone.utc)

@event.listens_for(Session, 'before_update')
def before_update(mapper, connection, target):
    """Add update timestamp before update."""
    if hasattr(target, 'updated_at'):
        target.updated_at = datetime.now(timezone.utc)

def get_db():
    """Dependency to get database session with proper error handling."""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


async def get_db_async():
    """Async version of database dependency."""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


class DatabaseManager:
    """Database manager for transaction handling and connection monitoring."""
    
    def __init__(self):
        self.engine = engine
        self.session_factory = SessionLocal
    
    def get_session(self):
        """Get a new database session."""
        return self.session_factory()
    
    def execute_with_retry(self, operation, max_retries=3):
        """Execute database operation with retry logic."""
        for attempt in range(max_retries):
            session = self.get_session()
            try:
                result = operation(session)
                session.commit()
                return result
            except Exception as e:
                session.rollback()
                logger.warning(f"Database operation failed (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise
            finally:
                session.close()
    
    def health_check(self) -> bool:
        """Check database connectivity."""
        try:
            with self.engine.connect() as conn:
                conn.execute("SELECT 1")
                return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    def get_pool_status(self) -> dict:
        """Get connection pool status."""
        pool = self.engine.pool
        return {
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "invalid": pool.invalid()
        }


# Global database manager instance
db_manager = DatabaseManager()

def init_database():
    """Initialize database with all tables and extensions."""
    # Enable PostGIS extension
    with engine.connect() as connection:
        try:
            connection.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
            connection.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
            connection.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
            connection.commit()
            logger.info("PostGIS and required extensions enabled successfully")
        except Exception as e:
            logger.error(f"Error enabling extensions: {e}")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")

class AuditMixin:
    """Mixin for audit trail fields required for research compliance."""
    from sqlalchemy import Column, DateTime
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class ResearchComplianceMixin:
    """Mixin for research ethics and IRB compliance fields."""
    from sqlalchemy import Column, Boolean, String, DateTime
    
    is_consented = Column(Boolean, default=False, nullable=False)
    consent_version_id = Column(String(36), nullable=True)
    data_retention_until = Column(DateTime, nullable=True)
    anonymization_level = Column(String(20), default='pseudonymized', nullable=False)