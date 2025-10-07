"""
Exception handling for MindMap Research API.
Provides comprehensive error handling with logging and sanitized responses.
"""

import logging
import traceback
from typing import Union, Dict, Any

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import settings

logger = logging.getLogger(__name__)


class MindMapAPIException(Exception):
    """Base exception for MindMap API errors."""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_ERROR",
        details: Dict[str, Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(MindMapAPIException):
    """Authentication related errors."""
    
    def __init__(self, message: str = "Authentication failed", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="AUTHENTICATION_ERROR",
            details=details
        )


class AuthorizationError(MindMapAPIException):
    """Authorization related errors."""
    
    def __init__(self, message: str = "Insufficient permissions", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="AUTHORIZATION_ERROR",
            details=details
        )


class ValidationError(MindMapAPIException):
    """Data validation errors."""
    
    def __init__(self, message: str = "Validation failed", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            details=details
        )


class ResourceNotFoundError(MindMapAPIException):
    """Resource not found errors."""
    
    def __init__(self, resource_type: str, resource_id: str = None):
        message = f"{resource_type} not found"
        if resource_id:
            message += f" (ID: {resource_id})"
        
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="RESOURCE_NOT_FOUND",
            details={"resource_type": resource_type, "resource_id": resource_id}
        )


class DatabaseError(MindMapAPIException):
    """Database operation errors."""
    
    def __init__(self, message: str = "Database operation failed", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="DATABASE_ERROR",
            details=details
        )


class ConsentRequiredError(MindMapAPIException):
    """Research consent required errors."""
    
    def __init__(self, consent_type: str = "research_participation"):
        super().__init__(
            message=f"User consent required for {consent_type}",
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="CONSENT_REQUIRED",
            details={"consent_type": consent_type}
        )


class RateLimitError(MindMapAPIException):
    """Rate limiting errors."""
    
    def __init__(self, message: str = "Rate limit exceeded", retry_after: int = 60):
        super().__init__(
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="RATE_LIMIT_EXCEEDED",
            details={"retry_after": retry_after}
        )


class BiasDetectionError(MindMapAPIException):
    """Bias detection and algorithmic fairness errors."""
    
    def __init__(self, message: str = "Bias detection failed", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="BIAS_DETECTION_ERROR",
            details=details
        )


def create_error_response(
    request: Request,
    error_code: str,
    message: str,
    status_code: int,
    details: Dict[str, Any] = None
) -> JSONResponse:
    """Create standardized error response."""
    
    # Generate request ID if available
    request_id = getattr(request.state, "request_id", "unknown")
    
    # Prepare response data
    response_data = {
        "error": {
            "code": error_code,
            "message": message,
            "request_id": request_id,
            "timestamp": "2024-01-01T00:00:00Z",  # Would use actual timestamp
            "path": request.url.path
        }
    }
    
    # Add details in development mode or for certain error types
    if details and (settings.DEBUG or error_code in ["VALIDATION_ERROR"]):
        response_data["error"]["details"] = details
    
    # Add support information
    if status_code >= 500:
        response_data["error"]["support"] = {
            "contact": "support@mindmap-platform.org",
            "documentation": "https://docs.mindmap-platform.org"
        }
    
    return JSONResponse(
        status_code=status_code,
        content=response_data
    )


async def mindmap_exception_handler(request: Request, exc: MindMapAPIException) -> JSONResponse:
    """Handle MindMap API specific exceptions."""
    
    # Log the error
    logger.error(
        f"MindMapAPIException: {exc.error_code} - {exc.message} "
        f"(Path: {request.url.path}, Details: {exc.details})"
    )
    
    return create_error_response(
        request=request,
        error_code=exc.error_code,
        message=exc.message,
        status_code=exc.status_code,
        details=exc.details
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions."""
    
    logger.warning(
        f"HTTPException: {exc.status_code} - {exc.detail} (Path: {request.url.path})"
    )
    
    # Map common HTTP exceptions to our error codes
    error_code_map = {
        400: "BAD_REQUEST",
        401: "AUTHENTICATION_ERROR",
        403: "AUTHORIZATION_ERROR",
        404: "RESOURCE_NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        422: "VALIDATION_ERROR",
        429: "RATE_LIMIT_EXCEEDED",
        500: "INTERNAL_ERROR",
        502: "BAD_GATEWAY",
        503: "SERVICE_UNAVAILABLE"
    }
    
    error_code = error_code_map.get(exc.status_code, "HTTP_ERROR")
    
    return create_error_response(
        request=request,
        error_code=error_code,
        message=str(exc.detail),
        status_code=exc.status_code
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic validation errors."""
    
    logger.warning(
        f"ValidationError: {exc.errors()} (Path: {request.url.path})"
    )
    
    # Format validation errors
    formatted_errors = []
    for error in exc.errors():
        formatted_errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return create_error_response(
        request=request,
        error_code="VALIDATION_ERROR",
        message="Request validation failed",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details={"validation_errors": formatted_errors}
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle SQLAlchemy database errors."""
    
    logger.error(
        f"SQLAlchemyError: {type(exc).__name__} - {str(exc)} (Path: {request.url.path})",
        exc_info=settings.DEBUG
    )
    
    # Don't expose database details in production
    if settings.is_production:
        message = "Database operation failed"
        details = None
    else:
        message = f"Database error: {str(exc)}"
        details = {"error_type": type(exc).__name__}
    
    return create_error_response(
        request=request,
        error_code="DATABASE_ERROR",
        message=message,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        details=details
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    
    # Log the full exception with traceback
    logger.error(
        f"Unhandled exception: {type(exc).__name__} - {str(exc)} (Path: {request.url.path})",
        exc_info=True
    )
    
    # Generate detailed error information for debugging
    if settings.DEBUG:
        details = {
            "exception_type": type(exc).__name__,
            "exception_message": str(exc),
            "traceback": traceback.format_exc().split('\n')
        }
        message = f"Internal server error: {str(exc)}"
    else:
        details = None
        message = "An unexpected error occurred"
    
    return create_error_response(
        request=request,
        error_code="INTERNAL_ERROR",
        message=message,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        details=details
    )


def setup_exception_handlers(app):
    """Set up all exception handlers for the FastAPI app."""
    
    # Custom exception handlers
    app.add_exception_handler(MindMapAPIException, mindmap_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
    
    logger.info("Exception handlers configured successfully")