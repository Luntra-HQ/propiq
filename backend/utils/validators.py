"""
Input validation and sanitization utilities for PropIQ API
Provides comprehensive validation to prevent security vulnerabilities
"""

import re
from typing import Optional
from pydantic import validator, Field
import html
from config.logging_config import get_logger

logger = get_logger(__name__)


# ============================================================================
# VALIDATION CONSTANTS
# ============================================================================

# Password requirements
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_DIGIT = True
PASSWORD_REQUIRE_SPECIAL = False  # Optional for better UX

# String length limits
MAX_NAME_LENGTH = 100
MAX_EMAIL_LENGTH = 255
MAX_ADDRESS_LENGTH = 500
MAX_DESCRIPTION_LENGTH = 2000
MAX_URL_LENGTH = 2048

# Patterns
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
ALPHANUMERIC_PATTERN = re.compile(r'^[a-zA-Z0-9_-]+$')

# SQL injection patterns (for additional protection beyond parameterized queries)
SQL_INJECTION_PATTERNS = [
    r"(\bUNION\b.*\bSELECT\b)",
    r"(\bSELECT\b.*\bFROM\b)",
    r"(\bINSERT\b.*\bINTO\b)",
    r"(\bUPDATE\b.*\bSET\b)",
    r"(\bDELETE\b.*\bFROM\b)",
    r"(\bDROP\b.*\bTABLE\b)",
    r"(\bEXEC\b|\bEXECUTE\b)",
    r"(--|\#|\/\*|\*\/)",  # SQL comments
    r"(\bOR\b.*=.*)",
    r"(\bAND\b.*=.*)",
]

# XSS patterns
XSS_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:",
    r"onerror\s*=",
    r"onload\s*=",
    r"onclick\s*=",
    r"<iframe",
    r"<embed",
    r"<object",
]


# ============================================================================
# SANITIZATION FUNCTIONS
# ============================================================================

def sanitize_html(text: str) -> str:
    """
    Escape HTML special characters to prevent XSS attacks

    Args:
        text: Input text to sanitize

    Returns:
        HTML-escaped text
    """
    if not text:
        return text
    return html.escape(text)


def sanitize_string(text: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize string input by removing dangerous characters

    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized text
    """
    if not text:
        return text

    # Remove null bytes
    text = text.replace('\x00', '')

    # Strip leading/trailing whitespace
    text = text.strip()

    # Truncate to max length
    if max_length and len(text) > max_length:
        logger.warning(f"String truncated from {len(text)} to {max_length} characters")
        text = text[:max_length]

    return text


def sanitize_address(address: str) -> str:
    """
    Sanitize property address input

    Args:
        address: Property address

    Returns:
        Sanitized address
    """
    address = sanitize_string(address, MAX_ADDRESS_LENGTH)
    address = sanitize_html(address)
    return address


# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

def validate_password(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength

    Args:
        password: Password to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"

    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters"

    if len(password) > PASSWORD_MAX_LENGTH:
        return False, f"Password must not exceed {PASSWORD_MAX_LENGTH} characters"

    if PASSWORD_REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"

    if PASSWORD_REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"

    if PASSWORD_REQUIRE_DIGIT and not re.search(r'\d', password):
        return False, "Password must contain at least one digit"

    if PASSWORD_REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"

    # Check for common weak passwords
    weak_passwords = ['password', '12345678', 'qwerty', 'abc123', 'password123']
    if password.lower() in weak_passwords:
        return False, "Password is too common, please choose a stronger password"

    return True, None


def validate_email(email: str) -> tuple[bool, Optional[str]]:
    """
    Validate email format

    Args:
        email: Email address to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not email:
        return False, "Email is required"

    if len(email) > MAX_EMAIL_LENGTH:
        return False, f"Email must not exceed {MAX_EMAIL_LENGTH} characters"

    if not EMAIL_PATTERN.match(email):
        return False, "Invalid email format"

    return True, None


def validate_uuid(uuid_str: str) -> tuple[bool, Optional[str]]:
    """
    Validate UUID format

    Args:
        uuid_str: UUID string to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not uuid_str:
        return False, "UUID is required"

    if not UUID_PATTERN.match(uuid_str):
        return False, "Invalid UUID format"

    return True, None


def validate_string_length(text: str, field_name: str, max_length: int) -> tuple[bool, Optional[str]]:
    """
    Validate string length

    Args:
        text: Text to validate
        field_name: Name of the field (for error message)
        max_length: Maximum allowed length

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not text:
        return True, None  # Empty strings are okay (use Optional[] for required fields)

    if len(text) > max_length:
        return False, f"{field_name} must not exceed {max_length} characters"

    return True, None


def detect_sql_injection(text: str) -> tuple[bool, Optional[str]]:
    """
    Detect potential SQL injection attempts

    Note: This is a defense-in-depth measure. Always use parameterized queries!

    Args:
        text: Text to check

    Returns:
        Tuple of (is_suspicious, warning_message)
    """
    if not text:
        return False, None

    text_upper = text.upper()

    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, text_upper, re.IGNORECASE):
            logger.warning(f"Potential SQL injection detected: pattern={pattern}")
            return True, "Input contains potentially dangerous SQL patterns"

    return False, None


def detect_xss(text: str) -> tuple[bool, Optional[str]]:
    """
    Detect potential XSS attempts

    Args:
        text: Text to check

    Returns:
        Tuple of (is_suspicious, warning_message)
    """
    if not text:
        return False, None

    for pattern in XSS_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            logger.warning(f"Potential XSS detected: pattern={pattern}")
            return True, "Input contains potentially dangerous HTML/JavaScript"

    return False, None


def validate_safe_string(text: str, field_name: str = "Input") -> tuple[bool, Optional[str]]:
    """
    Validate that string doesn't contain dangerous patterns

    Args:
        text: Text to validate
        field_name: Name of the field (for error message)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not text:
        return True, None

    # Check for SQL injection
    is_sql_suspicious, sql_message = detect_sql_injection(text)
    if is_sql_suspicious:
        return False, f"{field_name}: {sql_message}"

    # Check for XSS
    is_xss_suspicious, xss_message = detect_xss(text)
    if is_xss_suspicious:
        return False, f"{field_name}: {xss_message}"

    return True, None


# ============================================================================
# PYDANTIC FIELD DEFINITIONS (for reuse in models)
# ============================================================================

def PasswordField(**kwargs):
    """Pydantic field for password with validation"""
    return Field(
        ...,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description="Password must be 8-128 characters with uppercase, lowercase, and digit",
        **kwargs
    )


def EmailField(**kwargs):
    """Pydantic field for email with length limit"""
    return Field(
        ...,
        max_length=MAX_EMAIL_LENGTH,
        description="Valid email address",
        **kwargs
    )


def NameField(**kwargs):
    """Pydantic field for name with length limit"""
    return Field(
        ...,
        max_length=MAX_NAME_LENGTH,
        description="Name (max 100 characters)",
        **kwargs
    )


def AddressField(**kwargs):
    """Pydantic field for address with length limit"""
    return Field(
        ...,
        max_length=MAX_ADDRESS_LENGTH,
        description="Property address (max 500 characters)",
        **kwargs
    )


def UUIDField(**kwargs):
    """Pydantic field for UUID"""
    return Field(
        ...,
        pattern=r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        description="Valid UUID",
        **kwargs
    )


# ============================================================================
# PYDANTIC VALIDATORS (for use with @validator decorator)
# ============================================================================

def password_validator(cls, v):
    """Validator for password fields"""
    is_valid, error_msg = validate_password(v)
    if not is_valid:
        raise ValueError(error_msg)
    return v


def safe_string_validator(field_name: str = "Input"):
    """Create a validator for safe string fields"""
    def validator_func(cls, v):
        if v:
            is_valid, error_msg = validate_safe_string(v, field_name)
            if not is_valid:
                raise ValueError(error_msg)
        return v
    return validator_func


def sanitize_validator(cls, v):
    """Validator that sanitizes HTML"""
    if v:
        return sanitize_html(v)
    return v
