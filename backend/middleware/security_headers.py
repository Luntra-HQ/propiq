"""
Security Headers Middleware for FastAPI
Adds comprehensive security headers to protect against common web vulnerabilities
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import os
from config.logging_config import get_logger

logger = get_logger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds security headers to all HTTP responses

    Security headers included:
    - X-Content-Type-Options: nosniff (prevent MIME type sniffing)
    - X-Frame-Options: DENY (prevent clickjacking)
    - X-XSS-Protection: 1; mode=block (XSS protection for older browsers)
    - Strict-Transport-Security: enforce HTTPS (production only)
    - Content-Security-Policy: restrict resource loading
    - Referrer-Policy: control referrer information
    - Permissions-Policy: control browser features
    """

    def __init__(
        self,
        app,
        enable_hsts: bool = None,
        hsts_max_age: int = 31536000,  # 1 year
        hsts_include_subdomains: bool = True,
        csp_directives: dict = None
    ):
        super().__init__(app)

        # Auto-enable HSTS in production
        environment = os.getenv("ENVIRONMENT", "development")
        if enable_hsts is None:
            self.enable_hsts = environment == "production"
        else:
            self.enable_hsts = enable_hsts

        self.hsts_max_age = hsts_max_age
        self.hsts_include_subdomains = hsts_include_subdomains

        # Default CSP directives
        if csp_directives is None:
            self.csp_directives = {
                "default-src": ["'self'"],
                "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                "img-src": ["'self'", "data:", "https:"],
                "font-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
                "connect-src": ["'self'", "https://api.stripe.com", "https://*.supabase.co"],
                "frame-ancestors": ["'none'"],
                "base-uri": ["'self'"],
                "form-action": ["'self'"],
                "upgrade-insecure-requests": []
            }
        else:
            self.csp_directives = csp_directives

    def _build_csp_header(self) -> str:
        """Build Content-Security-Policy header value"""
        directives = []
        for directive, sources in self.csp_directives.items():
            if sources:
                directives.append(f"{directive} {' '.join(sources)}")
            else:
                directives.append(directive)
        return "; ".join(directives)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Add security headers to response"""

        response = await call_next(request)

        # X-Content-Type-Options: Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # X-Frame-Options: Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # X-XSS-Protection: Enable XSS filter (for older browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Strict-Transport-Security: Enforce HTTPS (production only)
        if self.enable_hsts:
            hsts_value = f"max-age={self.hsts_max_age}"
            if self.hsts_include_subdomains:
                hsts_value += "; includeSubDomains"
            hsts_value += "; preload"
            response.headers["Strict-Transport-Security"] = hsts_value

        # Content-Security-Policy: Control resource loading
        response.headers["Content-Security-Policy"] = self._build_csp_header()

        # Referrer-Policy: Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions-Policy: Control browser features
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "accelerometer=()"
        )

        # X-Permitted-Cross-Domain-Policies: Restrict cross-domain policies
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"

        return response


def add_security_headers(
    app,
    enable_hsts: bool = None,
    hsts_max_age: int = 31536000,
    hsts_include_subdomains: bool = True,
    csp_directives: dict = None
):
    """
    Add security headers middleware to FastAPI app

    Args:
        app: FastAPI application instance
        enable_hsts: Enable HSTS (auto-enabled in production)
        hsts_max_age: HSTS max-age in seconds (default: 1 year)
        hsts_include_subdomains: Include subdomains in HSTS
        csp_directives: Custom CSP directives (optional)

    Example:
        from middleware.security_headers import add_security_headers

        app = FastAPI()
        add_security_headers(app)
    """
    app.add_middleware(
        SecurityHeadersMiddleware,
        enable_hsts=enable_hsts,
        hsts_max_age=hsts_max_age,
        hsts_include_subdomains=hsts_include_subdomains,
        csp_directives=csp_directives
    )
    logger.info(
        f"Security headers middleware enabled (HSTS: {enable_hsts or os.getenv('ENVIRONMENT') == 'production'})"
    )


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware to limit the size of incoming requests
    Prevents DoS attacks from large payloads
    """

    def __init__(
        self,
        app,
        max_request_size: int = 10 * 1024 * 1024  # 10 MB default
    ):
        super().__init__(app)
        self.max_request_size = max_request_size

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Check request size before processing"""

        # Get content-length header
        content_length = request.headers.get("content-length")

        if content_length:
            content_length = int(content_length)

            if content_length > self.max_request_size:
                logger.warning(
                    f"Request too large: {content_length} bytes (max: {self.max_request_size})",
                    extra={
                        "content_length": content_length,
                        "max_size": self.max_request_size,
                        "path": request.url.path,
                        "client_ip": request.client.host if request.client else "unknown"
                    }
                )

                from fastapi.responses import JSONResponse
                return JSONResponse(
                    status_code=413,
                    content={
                        "success": False,
                        "error": "Request entity too large",
                        "error_code": "REQUEST_TOO_LARGE",
                        "max_size_mb": self.max_request_size / (1024 * 1024)
                    }
                )

        response = await call_next(request)
        return response


def add_request_size_limit(
    app,
    max_request_size: int = 10 * 1024 * 1024  # 10 MB default
):
    """
    Add request size limit middleware to FastAPI app

    Args:
        app: FastAPI application instance
        max_request_size: Maximum request size in bytes (default: 10 MB)

    Example:
        from middleware.security_headers import add_request_size_limit

        app = FastAPI()
        add_request_size_limit(app, max_request_size=5 * 1024 * 1024)  # 5 MB
    """
    app.add_middleware(
        RequestSizeLimitMiddleware,
        max_request_size=max_request_size
    )
    logger.info(f"Request size limit middleware enabled (max: {max_request_size / (1024 * 1024):.1f} MB)")
