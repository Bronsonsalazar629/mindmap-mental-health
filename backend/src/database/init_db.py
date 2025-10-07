"""
Database initialization script for mental health research platform.
Creates database schema, enables extensions, and sets up initial data.
"""

import os
import sys
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from base import Base, engine, SessionLocal, init_database
from models import *
from utils.pseudonymization import pseudonymizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_database_if_not_exists():
    """Create the database if it doesn't exist."""
    # Parse database URL to get database name
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/mindmap')
    
    # Create a connection to PostgreSQL server (without specifying database)
    server_url = database_url.rsplit('/', 1)[0]  # Remove database name
    database_name = database_url.rsplit('/', 1)[1]  # Get database name
    
    try:
        # Connect to PostgreSQL server
        server_engine = create_engine(f"{server_url}/postgres")
        
        with server_engine.connect() as conn:
            # Check if database exists
            result = conn.execute(
                text("SELECT 1 FROM pg_catalog.pg_database WHERE datname = :db_name"),
                {"db_name": database_name}
            )
            
            if not result.fetchone():
                # Create database
                conn.execute(text("COMMIT"))  # End transaction
                conn.execute(text(f"CREATE DATABASE {database_name}"))
                logger.info(f"Database '{database_name}' created successfully")
            else:
                logger.info(f"Database '{database_name}' already exists")
                
    except Exception as e:
        logger.error(f"Error creating database: {e}")
        raise


def enable_extensions():
    """Enable required PostgreSQL extensions."""
    extensions = [
        'postgis',           # Geographic information system
        'uuid-ossp',         # UUID generation
        'pgcrypto',          # Cryptographic functions
        'pg_stat_statements' # Query statistics (optional)
    ]
    
    with engine.connect() as connection:
        for ext in extensions:
            try:
                connection.execute(text(f'CREATE EXTENSION IF NOT EXISTS "{ext}";'))
                logger.info(f"Extension '{ext}' enabled")
            except Exception as e:
                if ext == 'pg_stat_statements':  # Optional extension
                    logger.warning(f"Optional extension '{ext}' not available: {e}")
                else:
                    logger.error(f"Failed to enable extension '{ext}': {e}")
                    raise
        connection.commit()


def create_indexes():
    """Create additional indexes for performance."""
    indexes = [
        # User indexes
        "CREATE INDEX IF NOT EXISTS idx_users_demographics ON users(age_group, gender_identity, race_ethnicity);",
        "CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location_point);",
        "CREATE INDEX IF NOT EXISTS idx_users_engagement ON users(engagement_score, last_login);",
        
        # MoodEntry indexes
        "CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_pseudonym_id, entry_date);",
        "CREATE INDEX IF NOT EXISTS idx_mood_entries_location ON mood_entries USING GIST(location_point);",
        "CREATE INDEX IF NOT EXISTS idx_mood_entries_mood_score ON mood_entries(mood_score, recorded_at);",
        "CREATE INDEX IF NOT EXISTS idx_mood_entries_quality ON mood_entries(data_quality, is_validated);",
        
        # ResourceRecommendation indexes
        "CREATE INDEX IF NOT EXISTS idx_recommendations_user_type ON resource_recommendations(user_pseudonym_id, resource_type);",
        "CREATE INDEX IF NOT EXISTS idx_recommendations_algorithm ON resource_recommendations(algorithm_type, confidence_score);",
        "CREATE INDEX IF NOT EXISTS idx_recommendations_bias ON resource_recommendations(bias_risk_level) WHERE bias_risk_level != 'low';",
        "CREATE INDEX IF NOT EXISTS idx_recommendations_engagement ON resource_recommendations(status, engagement_score);",
        
        # InterventionLog indexes
        "CREATE INDEX IF NOT EXISTS idx_interventions_user_type ON intervention_logs(user_pseudonym_id, intervention_type);",
        "CREATE INDEX IF NOT EXISTS idx_interventions_experiment ON intervention_logs(experiment_id, treatment_arm);",
        "CREATE INDEX IF NOT EXISTS idx_interventions_outcome ON intervention_logs(immediate_effectiveness, short_term_effectiveness);",
        
        # AuditLog indexes
        "CREATE INDEX IF NOT EXISTS idx_audit_user_event ON audit_logs(user_pseudonym_id, event_type, event_timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_audit_security ON audit_logs(event_category, severity_level, event_timestamp) WHERE event_category = 'security';",
        "CREATE INDEX IF NOT EXISTS idx_audit_bias ON audit_logs(event_type, event_timestamp) WHERE event_type = 'bias_detected';",
        
        # Social determinants indexes
        "CREATE INDEX IF NOT EXISTS idx_sdoh_vulnerability ON social_determinants(income_level, education_level, insurance_status);",
    ]
    
    with engine.connect() as connection:
        for index_sql in indexes:
            try:
                connection.execute(text(index_sql))
                logger.info(f"Index created: {index_sql.split()[5]}")  # Extract index name
            except Exception as e:
                logger.warning(f"Index creation warning: {e}")
        connection.commit()


def create_views():
    """Create database views for common research queries."""
    views = [
        # User demographics summary
        """
        CREATE OR REPLACE VIEW user_demographics_summary AS
        SELECT 
            age_group,
            gender_identity,
            race_ethnicity,
            COUNT(*) as user_count,
            AVG(engagement_score) as avg_engagement,
            COUNT(CASE WHEN is_active THEN 1 END) as active_users
        FROM users 
        WHERE is_consented = true
        GROUP BY age_group, gender_identity, race_ethnicity;
        """,
        
        # Mood trends view
        """
        CREATE OR REPLACE VIEW mood_trends AS
        SELECT 
            DATE_TRUNC('week', entry_date) as week,
            u.age_group,
            u.gender_identity,
            u.race_ethnicity,
            AVG(m.mood_score) as avg_mood,
            COUNT(*) as entry_count,
            STDDEV(m.mood_score) as mood_stddev
        FROM mood_entries m
        JOIN users u ON m.user_pseudonym_id = u.pseudonym_id
        WHERE m.is_research_eligible = true
        GROUP BY DATE_TRUNC('week', entry_date), u.age_group, u.gender_identity, u.race_ethnicity;
        """,
        
        # Bias detection summary
        """
        CREATE OR REPLACE VIEW bias_detection_summary AS
        SELECT 
            event_type,
            DATE_TRUNC('day', event_timestamp) as event_date,
            COUNT(*) as event_count,
            AVG((bias_indicators->>'severity')::float) as avg_severity
        FROM audit_logs
        WHERE event_type = 'bias_detected' 
        AND bias_indicators IS NOT NULL
        GROUP BY event_type, DATE_TRUNC('day', event_timestamp);
        """,
        
        # Intervention effectiveness view
        """
        CREATE OR REPLACE VIEW intervention_effectiveness AS
        SELECT 
            i.intervention_type,
            u.age_group,
            u.gender_identity,
            u.race_ethnicity,
            COUNT(*) as total_interventions,
            AVG(i.immediate_effectiveness) as avg_immediate_effect,
            AVG(i.short_term_effectiveness) as avg_short_term_effect,
            AVG(i.engagement_score) as avg_engagement,
            COUNT(CASE WHEN i.status = 'completed' THEN 1 END) / COUNT(*)::float as completion_rate
        FROM intervention_logs i
        JOIN users u ON i.user_pseudonym_id = u.pseudonym_id
        WHERE i.is_research_eligible = true
        GROUP BY i.intervention_type, u.age_group, u.gender_identity, u.race_ethnicity;
        """
    ]
    
    with engine.connect() as connection:
        for view_sql in views:
            try:
                connection.execute(text(view_sql))
                # Extract view name from CREATE OR REPLACE VIEW statement
                view_name = view_sql.split()[4]
                logger.info(f"View created: {view_name}")
            except Exception as e:
                logger.error(f"View creation error: {e}")
        connection.commit()


def create_initial_consent_version():
    """Create initial consent form version."""
    db = SessionLocal()
    try:
        from models.consent_version import ConsentVersion
        
        # Check if initial consent version exists
        existing = db.query(ConsentVersion).filter_by(version_number='v1.0.0').first()
        if existing:
            logger.info("Initial consent version already exists")
            return
        
        initial_consent = ConsentVersion(
            version_number='v1.0.0',
            consent_type='research_participation',
            title='Mental Health Research Participation Consent',
            content_html="""
            <h1>Research Participation Consent Form</h1>
            <h2>Study Title: Geographic Patterns in Mental Health Outcomes</h2>
            
            <h3>Purpose of the Study</h3>
            <p>This study aims to understand how geographic location, environmental factors, and social determinants 
            affect mental health outcomes. Your participation will help us develop better mental health interventions.</p>
            
            <h3>What Will Happen</h3>
            <p>If you choose to participate, you will:</p>
            <ul>
                <li>Track your mood and mental health status using our mobile application</li>
                <li>Provide location data when using the app (you can opt out)</li>
                <li>Complete optional surveys about your social and environmental circumstances</li>
                <li>Receive personalized mental health recommendations</li>
            </ul>
            
            <h3>Risks and Benefits</h3>
            <p><strong>Risks:</strong> Minimal risk. Some questions may cause emotional discomfort. 
            You may skip any questions or withdraw at any time.</p>
            <p><strong>Benefits:</strong> You may benefit from mood tracking and personalized recommendations. 
            Your data will contribute to mental health research that may help others.</p>
            
            <h3>Privacy and Confidentiality</h3>
            <p>Your privacy is extremely important to us:</p>
            <ul>
                <li>Your identity will be protected using advanced pseudonymization techniques</li>
                <li>Location data will be aggregated and anonymized</li>
                <li>All data is encrypted and stored securely</li>
                <li>Only authorized researchers will have access to de-identified data</li>
                <li>We comply with HIPAA and other privacy regulations</li>
            </ul>
            
            <h3>Voluntary Participation</h3>
            <p>Participation is entirely voluntary. You may withdraw at any time without penalty 
            and request deletion of your data.</p>
            
            <h3>Contact Information</h3>
            <p>For questions about this study, contact:</p>
            <ul>
                <li>Principal Investigator: Dr. Research Lead</li>
                <li>Email: research@mindmap-platform.org</li>
                <li>Phone: (555) 123-4567</li>
            </ul>
            
            <p>For questions about your rights as a research participant, contact the IRB at your institution.</p>
            """,
            content_plain_text="""
            RESEARCH PARTICIPATION CONSENT FORM
            Study Title: Geographic Patterns in Mental Health Outcomes
            
            PURPOSE: This study aims to understand how geographic location, environmental factors, 
            and social determinants affect mental health outcomes.
            
            PROCEDURES: If you participate, you will track your mood using our app, optionally 
            provide location data, complete surveys, and receive personalized recommendations.
            
            RISKS: Minimal risk. Some questions may cause emotional discomfort. You may skip 
            questions or withdraw at any time.
            
            BENEFITS: You may benefit from mood tracking and personalized recommendations. 
            Your data will contribute to mental health research.
            
            PRIVACY: Your identity will be protected using pseudonymization. Location data 
            will be aggregated and anonymized. All data is encrypted and stored securely.
            
            VOLUNTARY: Participation is voluntary. You may withdraw at any time and request 
            data deletion.
            
            CONTACT: Dr. Research Lead, research@mindmap-platform.org, (555) 123-4567
            """,
            language_code='en',
            reading_level_grade=8,
            status='active',
            effective_date=datetime.now(),
            consent_scopes=['mood_tracking', 'location_tracking', 'demographic_data', 'social_determinants'],
            risk_level='minimal',
            minimum_age_required=18,
            created_by='system_initialization'
        )
        
        db.add(initial_consent)
        db.commit()
        logger.info("Initial consent version created successfully")
        
    except Exception as e:
        logger.error(f"Error creating initial consent version: {e}")
        db.rollback()
    finally:
        db.close()


def initialize_database():
    """Complete database initialization process."""
    logger.info("Starting database initialization...")
    
    try:
        # Step 1: Create database if it doesn't exist
        create_database_if_not_exists()
        
        # Step 2: Enable PostgreSQL extensions
        enable_extensions()
        
        # Step 3: Create all tables
        init_database()
        logger.info("Database tables created successfully")
        
        # Step 4: Create indexes for performance
        create_indexes()
        
        # Step 5: Create views for research queries
        create_views()
        
        # Step 6: Create initial consent version
        create_initial_consent_version()
        
        logger.info("✅ Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise


if __name__ == "__main__":
    initialize_database()