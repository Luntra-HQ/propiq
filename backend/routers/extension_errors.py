"""
Extension Error Logging Router
Sprint 13 - Chrome Extension Error Tracking

Receives error logs from PropIQ Chrome extension and stores them for analysis.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from config.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/extension", tags=["extension"])


class ErrorContext(BaseModel):
    """Error context from extension"""

    extensionContext: str = Field(..., description="Extension context (background, popup, content)")
    url: Optional[str] = Field(None, description="URL where error occurred")
    version: str = Field(..., description="Extension version")
    userId: Optional[str] = Field(None, description="User ID if logged in")


class ErrorDetails(BaseModel):
    """Error details"""

    name: str = Field(..., description="Error name")
    message: str = Field(..., description="Error message")
    stack: Optional[str] = Field(None, description="Stack trace (truncated)")


class ErrorLog(BaseModel):
    """Single error log entry"""

    id: str = Field(..., description="Unique error ID")
    timestamp: int = Field(..., description="Unix timestamp (milliseconds)")
    error: ErrorDetails = Field(..., description="Error details")
    context: ErrorContext = Field(..., description="Error context")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class ErrorLogRequest(BaseModel):
    """Request body for logging errors"""

    errors: List[ErrorLog] = Field(..., description="List of error logs")


class ErrorLogResponse(BaseModel):
    """Response for error logging"""

    success: bool = Field(..., description="Whether logging succeeded")
    logged: int = Field(..., description="Number of errors logged")
    message: str = Field(..., description="Response message")


@router.post(
    "/errors",
    response_model=ErrorLogResponse,
    summary="Log extension errors",
    description="Receive and store error logs from PropIQ Chrome extension",
)
async def log_extension_errors(
    request: ErrorLogRequest,
) -> ErrorLogResponse:
    """
    Log errors from Chrome extension.

    Stores errors in database and optionally sends alerts for critical errors.

    **Request Body:**
    ```json
    {
      "errors": [
        {
          "id": "1234567890-abc123",
          "timestamp": 1704067200000,
          "error": {
            "name": "TypeError",
            "message": "Cannot read property 'price' of undefined",
            "stack": "TypeError: Cannot read property...\n at analyze..."
          },
          "context": {
            "extensionContext": "content",
            "url": "https://www.zillow.com/homedetails/123",
            "version": "1.2.0",
            "userId": "user_abc123"
          },
          "metadata": {
            "severity": "high",
            "context": "property_analysis"
          }
        }
      ]
    }
    ```

    **Response:**
    ```json
    {
      "success": true,
      "logged": 1,
      "message": "Successfully logged 1 error(s)"
    }
    ```
    """
    try:
        logged_count = 0

        for error_log in request.errors:
            # Log to structured logging
            logger.error(
                f"Extension Error: {error_log.error.name} - {error_log.error.message}",
                extra={
                    "error_id": error_log.id,
                    "extension_version": error_log.context.version,
                    "extension_context": error_log.context.extensionContext,
                    "url": error_log.context.url,
                    "user_id": error_log.context.userId,
                    "severity": error_log.metadata.get("severity") if error_log.metadata else None,
                    "error_name": error_log.error.name,
                    "error_message": error_log.error.message,
                    "stack_trace": error_log.error.stack,
                    "timestamp": datetime.fromtimestamp(error_log.timestamp / 1000).isoformat(),
                    "metadata": error_log.metadata,
                },
            )

            # TODO: Store in database (Convex)
            # await db.extensionErrors.insert({
            #     "errorId": error_log.id,
            #     "timestamp": datetime.fromtimestamp(error_log.timestamp / 1000),
            #     "errorName": error_log.error.name,
            #     "errorMessage": error_log.error.message,
            #     "stackTrace": error_log.error.stack,
            #     "extensionVersion": error_log.context.version,
            #     "extensionContext": error_log.context.extensionContext,
            #     "url": error_log.context.url,
            #     "userId": error_log.context.userId,
            #     "severity": error_log.metadata.get("severity") if error_log.metadata else None,
            #     "metadata": error_log.metadata,
            #     "receivedAt": datetime.utcnow(),
            # })

            # Check for critical errors
            severity = error_log.metadata.get("severity") if error_log.metadata else None
            if severity == "critical":
                logger.critical(
                    f"🚨 CRITICAL Extension Error: {error_log.error.name}",
                    extra={
                        "error_id": error_log.id,
                        "error_message": error_log.error.message,
                        "extension_version": error_log.context.version,
                        "user_id": error_log.context.userId,
                    },
                )

                # TODO: Send Slack alert for critical errors
                # await send_slack_alert(
                #     f"🚨 Critical Extension Error\n"
                #     f"Error: {error_log.error.name}\n"
                #     f"Message: {error_log.error.message}\n"
                #     f"Version: {error_log.context.version}\n"
                #     f"Context: {error_log.context.extensionContext}\n"
                #     f"URL: {error_log.context.url}\n"
                #     f"User: {error_log.context.userId}"
                # )

            logged_count += 1

        logger.info(f"Successfully logged {logged_count} extension error(s)")

        return ErrorLogResponse(
            success=True,
            logged=logged_count,
            message=f"Successfully logged {logged_count} error(s)",
        )

    except Exception as e:
        logger.error(f"Failed to log extension errors: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to log errors: {str(e)}",
        )


@router.get(
    "/errors/health",
    summary="Health check for extension error logging",
    description="Check if extension error logging endpoint is operational",
)
async def extension_errors_health() -> Dict[str, Any]:
    """
    Health check for extension error logging.

    Returns:
        Dict with status information
    """
    return {
        "status": "healthy",
        "service": "extension_error_logging",
        "timestamp": datetime.utcnow().isoformat(),
    }
