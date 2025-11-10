"""
Rate Limiting Middleware for FastAPI
Protects API endpoints from abuse and DDoS attacks
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware using sliding window algorithm

    Tracks requests by IP address and enforces configurable limits
    """

    def __init__(self, app, requests_per_minute: int = 60, requests_per_hour: int = 1000):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour

        # Storage: {ip_address: [(timestamp, endpoint), ...]}
        self.request_history: Dict[str, list] = {}

        # Whitelist endpoints that don't need rate limiting
        self.whitelist = [
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json"
        ]

        # Stricter limits for sensitive endpoints
        self.strict_endpoints = {
            "/auth/signup": (5, 60),  # 5 signups per minute
            "/auth/login": (10, 60),  # 10 login attempts per minute
            "/propiq/analyze": (10, 3600),  # 10 analyses per hour
            "/stripe/create-checkout-session": (5, 60),  # 5 checkout attempts per minute
        }

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        # Check for forwarded IP (behind proxy/load balancer)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # X-Forwarded-For can contain multiple IPs, use the first one
            return forwarded.split(",")[0].strip()

        # Check for real IP header (common in Azure/AWS)
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fallback to direct client IP
        return request.client.host if request.client else "unknown"

    def _clean_old_requests(self, ip: str, cutoff_time: float):
        """Remove requests older than cutoff time"""
        if ip in self.request_history:
            self.request_history[ip] = [
                (timestamp, endpoint)
                for timestamp, endpoint in self.request_history[ip]
                if timestamp > cutoff_time
            ]

            # Clean up empty entries
            if not self.request_history[ip]:
                del self.request_history[ip]

    def _check_rate_limit(
        self,
        ip: str,
        endpoint: str,
        max_requests: int,
        window_seconds: int
    ) -> Tuple[bool, int, int]:
        """
        Check if request exceeds rate limit

        Returns:
            (is_allowed, requests_made, max_requests)
        """
        current_time = time.time()
        cutoff_time = current_time - window_seconds

        # Clean old requests
        self._clean_old_requests(ip, cutoff_time)

        # Count requests in current window
        if ip not in self.request_history:
            self.request_history[ip] = []

        requests_in_window = sum(
            1 for timestamp, _ in self.request_history[ip]
            if timestamp > cutoff_time
        )

        # Check limit
        is_allowed = requests_in_window < max_requests

        return is_allowed, requests_in_window, max_requests

    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting"""

        # Skip rate limiting for whitelisted endpoints
        if any(request.url.path.startswith(endpoint) for endpoint in self.whitelist):
            return await call_next(request)

        # Get client IP
        client_ip = self._get_client_ip(request)
        endpoint = request.url.path
        current_time = time.time()

        # Check endpoint-specific limits first
        for strict_endpoint, (max_req, window) in self.strict_endpoints.items():
            if endpoint.startswith(strict_endpoint):
                is_allowed, requests_made, max_requests = self._check_rate_limit(
                    client_ip, endpoint, max_req, window
                )

                if not is_allowed:
                    # Calculate retry-after time
                    oldest_request = min(
                        (ts for ts, ep in self.request_history.get(client_ip, [])
                         if ts > current_time - window),
                        default=current_time
                    )
                    retry_after = int(window - (current_time - oldest_request)) + 1

                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": "Rate limit exceeded",
                            "detail": f"Too many requests to {strict_endpoint}. Try again later.",
                            "requests_made": requests_made + 1,
                            "max_requests": max_requests,
                            "retry_after": retry_after
                        },
                        headers={"Retry-After": str(retry_after)}
                    )

        # Check general per-minute limit
        is_allowed_minute, requests_minute, max_minute = self._check_rate_limit(
            client_ip, endpoint, self.requests_per_minute, 60
        )

        if not is_allowed_minute:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "detail": "Too many requests. Maximum 60 requests per minute.",
                    "requests_made": requests_minute + 1,
                    "max_requests": max_minute,
                    "retry_after": 60
                },
                headers={"Retry-After": "60"}
            )

        # Check general per-hour limit
        is_allowed_hour, requests_hour, max_hour = self._check_rate_limit(
            client_ip, endpoint, self.requests_per_hour, 3600
        )

        if not is_allowed_hour:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "detail": "Too many requests. Maximum 1000 requests per hour.",
                    "requests_made": requests_hour + 1,
                    "max_requests": max_hour,
                    "retry_after": 3600
                },
                headers={"Retry-After": "3600"}
            )

        # Record this request
        if client_ip not in self.request_history:
            self.request_history[client_ip] = []
        self.request_history[client_ip].append((current_time, endpoint))

        # Process request
        response = await call_next(request)

        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit-Minute"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining-Minute"] = str(
            max(0, self.requests_per_minute - requests_minute - 1)
        )
        response.headers["X-RateLimit-Limit-Hour"] = str(self.requests_per_hour)
        response.headers["X-RateLimit-Remaining-Hour"] = str(
            max(0, self.requests_per_hour - requests_hour - 1)
        )

        return response


# Convenience function to add rate limiting to FastAPI app
def add_rate_limiting(app, requests_per_minute: int = 60, requests_per_hour: int = 1000):
    """
    Add rate limiting middleware to FastAPI application

    Usage:
        from middleware.rate_limiter import add_rate_limiting
        add_rate_limiting(app, requests_per_minute=60, requests_per_hour=1000)

    Args:
        app: FastAPI application instance
        requests_per_minute: Maximum requests per minute (default: 60)
        requests_per_hour: Maximum requests per hour (default: 1000)
    """
    app.add_middleware(
        RateLimitMiddleware,
        requests_per_minute=requests_per_minute,
        requests_per_hour=requests_per_hour
    )
    print(f"✅ Rate limiting enabled: {requests_per_minute}/min, {requests_per_hour}/hour")
