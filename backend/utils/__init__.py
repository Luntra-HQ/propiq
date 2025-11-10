"""
PropIQ Utilities Package
Shared utilities for onboarding campaigns, Slack notifications, error handling, etc.
"""

from utils.onboarding_campaign import (
    start_onboarding_campaign,
    send_onboarding_email,
    send_scheduled_onboarding_email,
    get_onboarding_status,
    send_test_onboarding_email
)

from utils.onboarding_emails import (
    get_onboarding_sequence,
    get_email_day_1,
    get_email_day_2,
    get_email_day_3,
    get_email_day_4
)

from utils.error_responses import (
    ErrorResponse,
    ErrorDetail,
    ErrorCodes,
    create_error_response,
    handle_validation_error,
    unauthorized_error,
    forbidden_error,
    not_found_error,
    already_exists_error,
    usage_limit_exceeded_error,
    service_unavailable_error,
    internal_error,
    custom_exception_handler
)

__all__ = [
    # Onboarding
    "start_onboarding_campaign",
    "send_onboarding_email",
    "send_scheduled_onboarding_email",
    "get_onboarding_status",
    "send_test_onboarding_email",
    "get_onboarding_sequence",
    "get_email_day_1",
    "get_email_day_2",
    "get_email_day_3",
    "get_email_day_4",
    # Error handling
    "ErrorResponse",
    "ErrorDetail",
    "ErrorCodes",
    "create_error_response",
    "handle_validation_error",
    "unauthorized_error",
    "forbidden_error",
    "not_found_error",
    "already_exists_error",
    "usage_limit_exceeded_error",
    "service_unavailable_error",
    "internal_error",
    "custom_exception_handler"
]
