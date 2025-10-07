"""
Alembic environment configuration for mental health research database.
Includes PostGIS support and research compliance features.
"""

from logging.config import fileConfig
import os
import sys
from sqlalchemy import engine_from_config, pool
from alembic import context

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import your models
from base import Base
from models import *  # Import all models

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the SQLAlchemy URL from environment variable if available
database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/mindmap')
config.set_main_option('sqlalchemy.url', database_url)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata

def include_object(object, name, type_, reflected, compare_to):
    """
    Determine whether to include an object in the migration.
    Exclude PostGIS system tables and functions.
    """
    # Exclude PostGIS system tables
    if type_ == "table" and name in ['spatial_ref_sys', 'geometry_columns', 'geography_columns']:
        return False
    
    return True

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    def process_revision_directives(context, revision, directives):
        """Process revision directives to add custom behavior."""
        # Add custom migration behavior here if needed
        pass

    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # Enable PostGIS extension before running migrations
        connection.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
        connection.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
        connection.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
        connection.commit()

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
            compare_type=True,
            compare_server_default=True,
            process_revision_directives=process_revision_directives,
            # Custom render options for research compliance
            render_as_batch=True,  # For SQLite compatibility if needed
        )

        with context.begin_transaction():
            # Add custom pre-migration logic here
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()