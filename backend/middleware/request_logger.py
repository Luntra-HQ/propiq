"""
Request Logging Middleware for FastAPI
Logs all incoming requests and outgoing responses with timing information
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import time
import uuid
from config.logging_config import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs all HTTP requests and responses

    Features:
    - Logs request method, path, client IP
    - Logs response status code and processing time
    - Adds unique request ID to each request
    - Excludes health check endpoints from logging (configurable)
    - Masks sensitive headers (Authorization, API keys)
    """

    def __init__(
        self,
        app,
        exclude_paths: list = None,
        log_request_body: bool = False,
        log_response_body: bool = False
    ):
        super().__init__(app)
        self.exclude_paths = exclude_paths or ["/health", "/docs", "/redoc", "/openapi.json"]
        self.log_request_body = log_request_body
        self.log_response_body = log_response_body

        # Sensitive headers to mask in logs
        self.sensitive_headers = {
            "authorization",
            "cookie",
            "x-api-key",
            "stripe-signature",
            "azure-openai-key"
        }

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        return request.client.host if request.client else "unknown"

    def _mask_sensitive_headers(self, headers: dict) -> dict:
        """Mask sensitive header values for logging"""
        masked = {}
        for key, value in headers.items():
            if key.lower() in self.sensitive_headers:
                masked[key] = "***MASKED***"
            else:
                masked[key] = value
        return masked

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and log details"""

        # Skip logging for excluded paths
        if request.url.path in self.exclude_paths:
            return await call_next(request)

        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Extract request details
        client_ip = self._get_client_ip(request)
        method = request.method
        path = request.url.path
        query_params = dict(request.query_params)

        # Start timer
        start_time = time.time()

        # Log incoming request
        logger.info(
            f"Incoming request: {method} {path}",
            extra={
                "request_id": request_id,
                "method": method,
                "path": path,
                "query_params": query_params,
                "client_ip": client_ip,
                "user_agent": request.headers.get("user-agent", "unknown"),
                "headers": self._mask_sensitive_headers(dict(request.headers))
            }
        )

        # Process request
        try:
            response = await call_next(request)

            # Calculate processing time
            process_time = time.time() - start_time

            # Log response
            logger.info(
                f"Request completed: {method} {path} - {response.status_code} ({process_time:.3f}s)",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "status_code": response.status_code,
                    "process_time_seconds": round(process_time, 3),
                    "client_ip": client_ip
                }
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            # Calculate processing time for failed requests
            process_time = time.time() - start_time

            # Log error
            logger.error(
                f"Request failed: {method} {path} - {str(e)} ({process_time:.3f}s)",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "error": str(e),
                    "process_time_seconds": round(process_time, 3),
                    "client_ip": client_ip
                },
                exc_info=True
            )

            # Re-raise exception to be handled by FastAPI's error handlers
            raise


def add_request_logging(
    app,
    exclude_paths: list = None,
    log_request_body: bool = False,
    log_response_body: bool = False
):
    """
    Add request logging middleware to FastAPI app

    Args:
        app: FastAPI application instance
        exclude_paths: List of paths to exclude from logging (e.g., ["/health"])
        log_request_body: Whether to log request body (use cautiously, may log sensitive data)
        log_response_body: Whether to log response body (use cautiously, may log sensitive data)

    Example:
        from middleware.request_logger import add_request_logging

        app = FastAPI()
        add_request_logging(app, exclude_paths=["/health", "/metrics"])
    """
    app.add_middleware(
        RequestLoggingMiddleware,
        exclude_paths=exclude_paths,
        log_request_body=log_request_body,
        log_response_body=log_response_body
    )
    logger.info("Request logging middleware enabled")
