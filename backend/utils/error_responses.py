"""
Standardized error response models for PropIQ API
Provides consistent error formatting across all endpoints
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from config.logging_config import get_logger

logger = get_logger(__name__)


class ErrorDetail(BaseModel):
    """Detailed error information"""
    field: Optional[str] = None  # Field name if validation error
    message: str  # Human-readable error message
    code: Optional[str] = None  # Machine-readable error code


class ErrorResponse(BaseModel):
    """Standardized error response model"""
    success: bool = False
    error: str  # Main error message
    error_code: str  # Machine-readable error code
    details: Optional[List[ErrorDetail]] = None  # Additional error details
    request_id: Optional[str] = None  # Request ID for debugging


# Error Code Constants
class ErrorCodes:
    """Centralized error codes for consistency"""

    # Authentication & Authorization (401, 403)
    UNAUTHORIZED = "UNAUTHORIZED"
    INVALID_TOKEN = "INVALID_TOKEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    FORBIDDEN = "FORBIDDEN"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"

    # Validation Errors (400, 422)
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    INVALID_EMAIL = "INVALID_EMAIL"
    INVALID_PASSWORD = "INVALID_PASSWORD"

    # Resource Errors (404, 409)
    NOT_FOUND = "NOT_FOUND"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    DUPLICATE_EMAIL = "DUPLICATE_EMAIL"

    # Rate Limiting & Usage (429)
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    USAGE_LIMIT_EXCEEDED = "USAGE_LIMIT_EXCEEDED"
    TRIAL_LIMIT_EXCEEDED = "TRIAL_LIMIT_EXCEEDED"

    # Payment & Subscription (402, 403)
    PAYMENT_REQUIRED = "PAYMENT_REQUIRED"
    SUBSCRIPTION_REQUIRED = "SUBSCRIPTION_REQUIRED"
    SUBSCRIPTION_INACTIVE = "SUBSCRIPTION_INACTIVE"
    PAYMENT_FAILED = "PAYMENT_FAILED"

    # External Service Errors (502, 503)
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    DATABASE_ERROR = "DATABASE_ERROR"
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR"
    AI_SERVICE_ERROR = "AI_SERVICE_ERROR"

    # Server Errors (500)
    INTERNAL_ERROR = "INTERNAL_ERROR"
    UNKNOWN_ERROR = "UNKNOWN_ERROR"


def create_error_response(
    status_code: int,
    error_message: str,
    error_code: str = ErrorCodes.INTERNAL_ERROR,
    details: Optional[List[ErrorDetail]] = None,
    request_id: Optional[str] = None
) -> JSONResponse:
    """
    Create a standardized error response

    Args:
        status_code: HTTP status code
        error_message: Human-readable error message
        error_code: Machine-readable error code
        details: Additional error details
        request_id: Request ID for debugging

    Returns:
        JSONResponse with standardized error format
    """
    error_response = ErrorResponse(
        success=False,
        error=error_message,
        error_code=error_code,
        details=details,
        request_id=request_id
    )

    # Log error
    logger.error(
        f"Error response: {error_code} - {error_message}",
        extra={
            "status_code": status_code,
            "error_code": error_code,
            "request_id": request_id
        }
    )

    return JSONResponse(
        status_code=status_code,
        content=error_response.model_dump()
    )


def handle_validation_error(
    errors: List[Dict[str, Any]],
    request_id: Optional[str] = None
) -> JSONResponse:
    """
    Handle Pydantic validation errors

    Args:
        errors: List of validation errors from Pydantic
        request_id: Request ID for debugging

    Returns:
        JSONResponse with validation errors
    """
    error_details = []
    for error in errors:
        field = ".".join(str(loc) for loc in error.get("loc", []))
        message = error.get("msg", "Validation error")
        error_details.append(ErrorDetail(
            field=field,
            message=message,
            code=ErrorCodes.VALIDATION_ERROR
        ))

    return create_error_response(
        status_code=422,
        error_message="Validation failed",
        error_code=ErrorCodes.VALIDATION_ERROR,
        details=error_details,
        request_id=request_id
    )


# Common Error Responses (for convenience)

def unauthorized_error(
    message: str = "Authentication required",
    request_id: Optional[str] = None
) -> HTTPException:
    """401 Unauthorized error"""
    return HTTPException(
        status_code=401,
        detail={
            "success": False,
            "error": message,
            "error_code": ErrorCodes.UNAUTHORIZED,
            "request_id": request_id
        }
    )


def forbidden_error(
    message: str = "Access forbidden",
    request_id: Optional[str] = None
) -> HTTPException:
    """403 Forbidden error"""
    return HTTPException(
        status_code=403,
        detail={
            "success": False,
            "error": message,
            "error_code": ErrorCodes.FORBIDDEN,
            "request_id": request_id
        }
    )


def not_found_error(
    resource: str = "Resource",
    request_id: Optional[str] = None
) -> HTTPException:
    """404 Not Found error"""
    return HTTPException(
        status_code=404,
        detail={
            "success": False,
            "error": f"{resource} not found",
            "error_code": ErrorCodes.NOT_FOUND,
            "request_id": request_id
        }
    )


def already_exists_error(
    resource: str = "Resource",
    request_id: Optional[str] = None
) -> HTTPException:
    """409 Conflict error"""
    return HTTPException(
        status_code=409,
        detail={
            "success": False,
            "error": f"{resource} already exists",
            "error_code": ErrorCodes.ALREADY_EXISTS,
            "request_id": request_id
        }
    )


def usage_limit_exceeded_error(
    message: str = "Usage limit exceeded",
    request_id: Optional[str] = None
) -> HTTPException:
    """429 Rate Limit Exceeded error"""
    return HTTPException(
        status_code=429,
        detail={
            "success": False,
            "error": message,
            "error_code": ErrorCodes.USAGE_LIMIT_EXCEEDED,
            "request_id": request_id
        }
    )


def service_unavailable_error(
    service: str = "Service",
    request_id: Optional[str] = None
) -> HTTPException:
    """503 Service Unavailable error"""
    return HTTPException(
        status_code=503,
        detail={
            "success": False,
            "error": f"{service} temporarily unavailable",
            "error_code": ErrorCodes.SERVICE_UNAVAILABLE,
            "request_id": request_id
        }
    )


def internal_error(
    message: str = "Internal server error",
    request_id: Optional[str] = None
) -> HTTPException:
    """500 Internal Server Error"""
    return HTTPException(
        status_code=500,
        detail={
            "success": False,
            "error": message,
            "error_code": ErrorCodes.INTERNAL_ERROR,
            "request_id": request_id
        }
    )


# Exception handler for FastAPI
async def custom_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for unhandled exceptions

    Args:
        request: FastAPI request object
        exc: Exception that was raised

    Returns:
        JSONResponse with standardized error format
    """
    request_id = getattr(request.state, "request_id", None)

    # Log the exception
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={"request_id": request_id, "path": request.url.path},
        exc_info=True
    )

    return create_error_response(
        status_code=500,
        error_message="An unexpected error occurred",
        error_code=ErrorCodes.INTERNAL_ERROR,
        request_id=request_id
    )
