"""
Middleware components for MindMap Research API.
Includes pseudonymization, rate limiting, logging, and security headers.
"""

import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from urllib.parse import urlparse

import redis
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from .config import settings
from database.base import SessionLocal
from database.models.audit_log import AuditLog
from database.utils.pseudonymization import pseudonymizer

logger = logging.getLogger(__name__)

# Redis connection for rate limiting
try:
    redis_client = redis.Redis.from_url(
        settings.REDIS_URL,
        password=settings.REDIS_PASSWORD,
        db=settings.REDIS_DB,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
        retry_on_timeout=True
    )
    # Test connection
    redis_client.ping()
    logger.info("Redis connected successfully")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}. Rate limiting will use in-memory storage.")
    redis_client = None

# Rate limiter setup
def get_identifier(request: Request) -> str:
    """Get identifier for rate limiting (IP or user)."""
    # Try to get user from authentication first
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            # Extract user identifier from token for authenticated requests
            # This would need to be implemented based on your token structure
            return f"user:{request.headers.get('x-user-id', get_remote_address(request))}"
        except:
            pass
    
    # Fall back to IP address
    return get_remote_address(request)


if redis_client:
    limiter = Limiter(
        key_func=get_identifier,
        storage_uri=settings.REDIS_URL,
        default_limits=[f"{settings.RATE_LIMIT_REQUESTS_PER_MINUTE}/minute"]
    )
else:
    limiter = Limiter(
        key_func=get_identifier,
        default_limits=[f"{settings.RATE_LIMIT_REQUESTS_PER_MINUTE}/minute"]
    )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Content Security Policy for API
        csp = (
            "default-src 'none'; "
            "frame-ancestors 'none'; "
            "base-uri 'none'"
        )
        response.headers["Content-Security-Policy"] = csp
        
        # Research compliance headers
        response.headers["X-Research-Platform"] = "MindMap-API-v2.0.0"
        response.headers["X-Data-Classification"] = "research-sensitive"
        
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Comprehensive request/response logging for research compliance."""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log request
        start_time = time.time()
        client_ip = self.get_client_ip(request)
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Sanitize URL for logging (remove sensitive parameters)
        url = str(request.url)
        parsed_url = urlparse(url)
        safe_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
        if parsed_url.query and not any(sensitive in parsed_url.query.lower() 
                                       for sensitive in ['password', 'token', 'key', 'secret']):
            safe_url += f"?{parsed_url.query}"
        
        logger.info(
            f"REQUEST {request_id}: {request.method} {safe_url} "
            f"from {client_ip} ({user_agent})"
        )
        
        try:
            response = await call_next(request)
            
            # Calculate response time
            response_time = (time.time() - start_time) * 1000
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            # Log response
            logger.info(
                f"RESPONSE {request_id}: {response.status_code} "
                f"({response_time:.2f}ms)"
            )
            
            # Log to audit trail for sensitive endpoints
            if self.is_sensitive_endpoint(request.url.path):
                await self.log_audit_event(request, response, response_time)
            
            return response
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(
                f"ERROR {request_id}: {str(e)} ({response_time:.2f}ms)"
            )
            
            # Log error to audit trail
            await self.log_audit_event(request, None, response_time, error=str(e))
            
            raise
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address, considering proxy headers."""
        # Check for forwarded headers (common in load balancers)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        return get_remote_address(request)
    
    def is_sensitive_endpoint(self, path: str) -> bool:
        """Check if endpoint requires audit logging."""
        sensitive_patterns = [
            "/api/v1/users",
            "/api/v1/mood",
            "/api/v1/research",
            "/api/v1/interventions",
            "/api/v1/auth"
        ]
        return any(pattern in path for pattern in sensitive_patterns)
    
    async def log_audit_event(
        self, 
        request: Request, 
        response: Optional[Response], 
        response_time: float,
        error: Optional[str] = None
    ):
        """Log event to audit trail."""
        try:
            db = SessionLocal()
            
            # Extract user ID if available
            user_pseudonym_id = getattr(request.state, "user_pseudonym_id", None)
            
            audit_log = AuditLog(
                user_pseudonym_id=user_pseudonym_id,
                event_type="api_request",
                event_category="api_access",
                event_description=f"{request.method} {request.url.path}",
                ip_address=self.get_client_ip(request),
                user_agent=request.headers.get("user-agent", "unknown"),
                request_id=request.state.request_id,
                additional_data={
                    "method": request.method,
                    "path": request.url.path,
                    "response_time_ms": response_time,
                    "status_code": response.status_code if response else None,
                    "error": error,
                    "headers": dict(request.headers) if settings.DEBUG else {},
                    "query_params": dict(request.query_params) if request.query_params else {}
                }
            )
            
            db.add(audit_log)
            db.commit()
            
        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")
        finally:
            db.close()


class PseudonymizationMiddleware(BaseHTTPMiddleware):
    """Middleware to automatically pseudonymize user identifiers."""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Process request body for pseudonymization if needed
        if request.method in ["POST", "PUT", "PATCH"]:
            await self.process_request_body(request)
        
        # Continue with request processing
        response = await call_next(request)
        
        # Process response body for pseudonymization if needed
        response = await self.process_response_body(response)
        
        return response
    
    async def process_request_body(self, request: Request):
        """Process request body to pseudonymize sensitive data."""
        try:
            if request.headers.get("content-type") == "application/json":
                body = await request.body()
                if body:
                    try:
                        data = json.loads(body)
                        # Pseudonymize any user_id fields in the request
                        if isinstance(data, dict):
                            data = self.pseudonymize_dict(data)
                            # Store pseudonymized data back to request
                            request._body = json.dumps(data).encode()
                    except json.JSONDecodeError:
                        pass  # Not JSON, skip processing
        except Exception as e:
            logger.warning(f"Failed to process request body for pseudonymization: {e}")
    
    async def process_response_body(self, response: Response) -> Response:
        """Process response body to ensure pseudonymized data."""
        # For now, we rely on the application layer to handle response pseudonymization
        # This could be extended to automatically pseudonymize response data
        return response
    
    def pseudonymize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively pseudonymize dictionary data."""
        if not isinstance(data, dict):
            return data
        
        pseudonymized = {}
        for key, value in data.items():
            if key in ["email", "user_id", "identifier"] and isinstance(value, str):
                # Pseudonymize the value
                pseudonymized[key] = pseudonymizer.pseudonymize_user_id(value)
            elif isinstance(value, dict):
                pseudonymized[key] = self.pseudonymize_dict(value)
            elif isinstance(value, list):
                pseudonymized[key] = [
                    self.pseudonymize_dict(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                pseudonymized[key] = value
        
        return pseudonymized


class RateLimitingMiddleware(BaseHTTPMiddleware):
    """Enhanced rate limiting with research compliance features."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.limiter = limiter
    
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            # Check rate limits
            identifier = get_identifier(request)
            
            # Different limits for different endpoint types
            if "/api/v1/research" in request.url.path:
                # Stricter limits for research endpoints
                await self.check_research_rate_limit(request, identifier)
            elif "/api/v1/auth" in request.url.path:
                # Authentication endpoint limits
                await self.check_auth_rate_limit(request, identifier)
            else:
                # General API limits
                await self.check_general_rate_limit(request, identifier)
            
            response = await call_next(request)
            
            # Add rate limit headers
            self.add_rate_limit_headers(response, identifier)
            
            return response
            
        except RateLimitExceeded as e:
            # Log rate limit violation
            logger.warning(
                f"Rate limit exceeded for {identifier} on {request.url.path}"
            )
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "detail": str(e),
                    "retry_after": 60
                },
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(settings.RATE_LIMIT_REQUESTS_PER_MINUTE),
                    "X-RateLimit-Remaining": "0"
                }
            )
    
    async def check_research_rate_limit(self, request: Request, identifier: str):
        """Check rate limits for research endpoints (stricter)."""
        # Implement custom rate limiting logic for research endpoints
        # This could include daily limits, per-user limits, etc.
        pass
    
    async def check_auth_rate_limit(self, request: Request, identifier: str):
        """Check rate limits for authentication endpoints."""
        # Implement custom rate limiting logic for auth endpoints
        # This could include failed login attempt limits, etc.
        pass
    
    async def check_general_rate_limit(self, request: Request, identifier: str):
        """Check general rate limits."""
        # Use the configured limiter
        pass
    
    def add_rate_limit_headers(self, response: Response, identifier: str):
        """Add rate limiting information to response headers."""
        try:
            # This would integrate with your rate limiting storage to get current limits
            response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_REQUESTS_PER_MINUTE)
            # response.headers["X-RateLimit-Remaining"] = str(remaining_requests)
            # response.headers["X-RateLimit-Reset"] = str(reset_timestamp)
        except Exception as e:
            logger.warning(f"Failed to add rate limit headers: {e}")


def setup_rate_limiting(app):
    """Set up rate limiting for the FastAPI app."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)