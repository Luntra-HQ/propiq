"""
Sentry Error Monitoring Configuration
Sprint 12 - Production Readiness

Tracks errors, performance, and user feedback for PropIQ backend.
"""
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from dotenv import load_dotenv
from config.logging_config import get_logger

load_dotenv()
logger = get_logger(__name__)

# Sentry Configuration
SENTRY_DSN = os.getenv("SENTRY_DSN")
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
RELEASE = os.getenv("RELEASE_VERSION", "propiq@1.0.0")

# Sample rates
TRACES_SAMPLE_RATE = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "1.0"))
PROFILES_SAMPLE_RATE = float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "1.0"))


def init_sentry():
    """
    Initialize Sentry SDK for error tracking

    Features enabled:
    - Error tracking
    - Performance monitoring (traces)
    - Profiling
    - FastAPI integration
    - User context
    """
    if not SENTRY_DSN:
        logger.warning("Sentry DSN not configured - error tracking disabled")
        return

    try:
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            environment=ENVIRONMENT,
            release=RELEASE,

            # Enable FastAPI integration
            integrations=[
                FastApiIntegration(transaction_style="endpoint"),
                StarletteIntegration(transaction_style="endpoint"),
                RedisIntegration(),
            ],

            # Performance monitoring
            traces_sample_rate=TRACES_SAMPLE_RATE,

            # Profiling
            profiles_sample_rate=PROFILES_SAMPLE_RATE,

            # Send PII (Personally Identifiable Information)
            # Set to False if you need to comply with GDPR/CCPA
            send_default_pii=False,

            # Attach stack traces to messages
            attach_stacktrace=True,

            # Max breadcrumbs to capture
            max_breadcrumbs=50,

            # Filter out common noisy errors
            before_send=before_send_filter,
        )

        logger.info(f"Sentry initialized for {ENVIRONMENT} environment")

    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {e}", exc_info=True)


def before_send_filter(event, hint):
    """
    Filter events before sending to Sentry

    Use this to:
    - Remove sensitive data
    - Filter out known errors
    - Enhance error context
    """
    # Filter out 404 errors (not actual errors)
    if event.get("exception"):
        exc_value = event["exception"]["values"][0]
        if "404" in str(exc_value.get("value", "")):
            return None

    # Filter out health check endpoint noise
    if event.get("transaction") == "/propiq/health":
        return None

    if event.get("transaction") == "/support/health":
        return None

    if event.get("transaction") == "/stripe/health":
        return None

    # Scrub sensitive data from request
    if event.get("request"):
        # Remove authorization headers
        if event["request"].get("headers"):
            event["request"]["headers"].pop("authorization", None)
            event["request"]["headers"].pop("cookie", None)

        # Remove sensitive query params
        if event["request"].get("query_string"):
            # Add scrubbing logic here if needed
            pass

    return event


def capture_message(message: str, level: str = "info", **kwargs):
    """
    Capture a message in Sentry

    Args:
        message: Message to log
        level: Log level (debug, info, warning, error, fatal)
        **kwargs: Additional context
    """
    if not SENTRY_DSN:
        return

    sentry_sdk.capture_message(message, level=level, **kwargs)


def capture_exception(error: Exception, **context):
    """
    Capture an exception in Sentry with additional context

    Args:
        error: Exception to capture
        **context: Additional context (user, tags, etc.)
    """
    if not SENTRY_DSN:
        return

    with sentry_sdk.push_scope() as scope:
        # Add context
        for key, value in context.items():
            scope.set_extra(key, value)

        sentry_sdk.capture_exception(error)


def set_user_context(user_id: str, email: str = None, subscription_tier: str = None):
    """
    Set user context for Sentry events

    This helps track which users are experiencing errors
    """
    if not SENTRY_DSN:
        return

    sentry_sdk.set_user({
        "id": user_id,
        "email": email,
        "subscription_tier": subscription_tier,
    })


def set_tag(key: str, value: str):
    """
    Set a tag for filtering Sentry events

    Useful tags:
    - feature: "propiq_analysis", "support_chat", "payment"
    - endpoint: "/api/v1/propiq/analyze"
    - user_tier: "free", "starter", "pro", "elite"
    """
    if not SENTRY_DSN:
        return

    sentry_sdk.set_tag(key, value)


def add_breadcrumb(message: str, category: str = "default", level: str = "info", **data):
    """
    Add a breadcrumb for debugging

    Breadcrumbs are like logs that lead up to an error
    """
    if not SENTRY_DSN:
        return

    sentry_sdk.add_breadcrumb(
        message=message,
        category=category,
        level=level,
        data=data
    )


# Performance monitoring helpers
class SentryTransaction:
    """Context manager for Sentry transactions"""

    def __init__(self, operation: str, name: str):
        self.operation = operation
        self.name = name
        self.transaction = None

    def __enter__(self):
        if SENTRY_DSN:
            self.transaction = sentry_sdk.start_transaction(
                op=self.operation,
                name=self.name
            )
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.transaction:
            self.transaction.finish()


def trace_function(operation: str = "function"):
    """
    Decorator to trace function performance in Sentry

    Usage:
        @trace_function(operation="database")
        async def get_user(user_id: str):
            ...
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            if not SENTRY_DSN:
                return await func(*args, **kwargs)

            with SentryTransaction(operation, func.__name__):
                return await func(*args, **kwargs)

        return wrapper
    return decorator


# Health check
def sentry_health_check() -> dict:
    """Check if Sentry is configured and working"""
    return {
        "configured": bool(SENTRY_DSN),
        "environment": ENVIRONMENT,
        "release": RELEASE,
        "traces_sample_rate": TRACES_SAMPLE_RATE,
    }
