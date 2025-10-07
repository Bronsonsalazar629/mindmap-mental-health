"""
FastAPI application for mental health research platform.
Research-grade security, comprehensive documentation, and bias detection APIs.
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
import uvicorn

# Import routers and middleware
from api.routers import auth, users, mood, recommendations, interventions, research
from core.config import settings
from core.middleware import (
    LoggingMiddleware,
    PseudonymizationMiddleware,
    RateLimitingMiddleware,
    SecurityHeadersMiddleware
)
from core.exceptions import setup_exception_handlers
from database.base import engine, init_database

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup
    logger.info("Starting MindMap Research API...")
    
    # Initialize database
    try:
        init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # Additional startup logic
    logger.info("API startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down MindMap Research API...")
    engine.dispose()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="MindMap Mental Health Research API",
    description="""
    ## Research-Grade Mental Health Platform API
    
    This API provides comprehensive endpoints for mental health research with:
    - **HIPAA-compliant** data handling with pseudonymization
    - **Bias detection** algorithms for algorithmic fairness
    - **Geographic analysis** with PostGIS integration
    - **Real-time mood tracking** with validation
    - **A/B testing framework** for intervention research
    - **IRB compliance** features for research ethics
    
    ### Security Features
    - Firebase Authentication integration
    - JWT token validation
    - Rate limiting and request logging
    - Automatic pseudonymization middleware
    - Comprehensive audit logging
    
    ### Research Features
    - Social determinants of health (SDOH) data collection
    - Bias detection and fairness metrics
    - Geographic disparity analysis
    - Intervention effectiveness tracking
    - Research consent management
    
    All endpoints maintain research integrity and comply with mental health research standards.
    """,
    version="2.0.0",
    contact={
        "name": "MindMap Research Team",
        "email": "research@mindmap-platform.org",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    terms_of_service="/terms",
    lifespan=lifespan,
    docs_url=None,  # Disabled default docs
    redoc_url=None,  # Disabled default redoc
)

# Security middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Rate-Limit-Remaining"]
)

# Custom middleware
app.add_middleware(RateLimitingMiddleware)
app.add_middleware(PseudonymizationMiddleware)
app.add_middleware(LoggingMiddleware)

# Set up exception handlers
setup_exception_handlers(app)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(mood.router, prefix="/api/v1/mood", tags=["Mood Tracking"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["AI Recommendations"])
app.include_router(interventions.router, prefix="/api/v1/interventions", tags=["Research Interventions"])
app.include_router(research.router, prefix="/api/v1/research", tags=["Research & Analytics"])

# Health check endpoints
@app.get("/health", tags=["System"])
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "mindmap-api", "version": "2.0.0"}


@app.get("/health/detailed", tags=["System"])
async def detailed_health_check():
    """Detailed health check with database connectivity."""
    try:
        # Test database connection
        from database.base import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        logger.error(f"Database health check failed: {e}")
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "mindmap-api",
        "version": "2.0.0",
        "components": {
            "database": db_status,
            "environment": settings.ENVIRONMENT,
            "debug_mode": settings.DEBUG
        }
    }


@app.get("/metrics", tags=["System"])
async def metrics_endpoint():
    """Basic metrics endpoint for monitoring."""
    # In production, this would integrate with Prometheus or similar
    return {
        "requests_total": "counter_placeholder",
        "active_connections": "gauge_placeholder",
        "response_time_avg": "histogram_placeholder"
    }


# Custom OpenAPI documentation
def custom_openapi():
    """Generate custom OpenAPI schema with enhanced research documentation."""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="MindMap Research API",
        version="2.0.0",
        description=app.description,
        routes=app.routes,
    )
    
    # Add custom schema extensions for research compliance
    openapi_schema["info"]["x-research-compliance"] = {
        "hipaa_compliant": True,
        "irb_approved": True,
        "data_minimization": True,
        "bias_detection": True
    }
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "FirebaseAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Firebase Authentication JWT token"
        },
        "APIKey": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "API key for service-to-service communication"
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """Custom Swagger UI with research branding."""
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="MindMap Research API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        swagger_ui_parameters={
            "deepLinking": True,
            "displayRequestDuration": True,
            "docExpansion": "none",
            "operationsSorter": "method",
            "filter": True,
            "tryItOutEnabled": True
        }
    )


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "MindMap Mental Health Research API",
        "version": "2.0.0",
        "documentation": "/docs",
        "health_check": "/health",
        "environment": settings.ENVIRONMENT,
        "features": {
            "authentication": "Firebase + JWT",
            "database": "PostgreSQL with PostGIS",
            "security": "HIPAA compliant with pseudonymization",
            "research": "Bias detection and geographic analysis",
            "monitoring": "Rate limiting and audit logging"
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False,
        access_log=True,
        log_level="info"
    )