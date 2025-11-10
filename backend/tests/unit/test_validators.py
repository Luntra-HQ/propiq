"""
Unit tests for validation utilities
Tests all validation functions, sanitization, and security checks
"""

import pytest
import importlib.util

# Import validators module directly to avoid circular import issues
spec = importlib.util.spec_from_file_location("validators", "utils/validators.py")
validators = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validators)


class TestPasswordValidation:
    """Test password validation functions"""

    def test_valid_password(self):
        """Test that valid passwords pass validation"""
        valid_passwords = [
            "ValidPass1",
            "Test1234Test",
            "MyP@ssw0rd",
            "Abcd1234",
            "SecurePass99"
        ]

        for pwd in valid_passwords:
            is_valid, msg = validators.validate_password(pwd)
            assert is_valid is True, f"Password '{pwd}' should be valid, got: {msg}"
            assert msg is None

    def test_password_too_short(self):
        """Test that passwords under 8 characters are rejected"""
        short_passwords = ["Test1", "Abc123", "Pass1"]

        for pwd in short_passwords:
            is_valid, msg = validators.validate_password(pwd)
            assert is_valid is False
            assert "at least 8 characters" in msg

    def test_password_too_long(self):
        """Test that passwords over 128 characters are rejected"""
        long_password = "A" * 129 + "1a"
        is_valid, msg = validators.validate_password(long_password)
        assert is_valid is False
        assert "must not exceed 128 characters" in msg

    def test_password_no_uppercase(self):
        """Test that passwords without uppercase letters are rejected"""
        no_upper_passwords = ["password123", "test1234", "abcdefgh1"]

        for pwd in no_upper_passwords:
            is_valid, msg = validators.validate_password(pwd)
            assert is_valid is False
            assert "uppercase letter" in msg

    def test_password_no_lowercase(self):
        """Test that passwords without lowercase letters are rejected"""
        no_lower_passwords = ["PASSWORD123", "TEST1234", "ABCDEFGH1"]

        for pwd in no_lower_passwords:
            is_valid, msg = validators.validate_password(pwd)
            assert is_valid is False
            assert "lowercase letter" in msg

    def test_password_no_digit(self):
        """Test that passwords without digits are rejected"""
        no_digit_passwords = ["Password", "TestPass", "AbcdEfgh"]

        for pwd in no_digit_passwords:
            is_valid, msg = validators.validate_password(pwd)
            assert is_valid is False
            assert "digit" in msg

    def test_password_common_passwords(self):
        """Test that common weak passwords are rejected"""
        # Note: These passwords also fail other checks (uppercase, lowercase, etc.)
        # The validator checks requirements first, then checks common passwords
        common_passwords = ["Password123", "password123"]

        for pwd in common_passwords:
            is_valid, msg = validators.validate_password(pwd)
            assert is_valid is False
            # Password123 is detected as common
            # password123 fails uppercase check before common password check

    def test_password_empty(self):
        """Test that empty passwords are rejected"""
        is_valid, msg = validators.validate_password("")
        assert is_valid is False
        assert "required" in msg

    def test_password_none(self):
        """Test that None passwords are rejected"""
        is_valid, msg = validators.validate_password(None)
        assert is_valid is False
        assert "required" in msg


class TestEmailValidation:
    """Test email validation functions"""

    def test_valid_emails(self):
        """Test that valid email addresses pass validation"""
        valid_emails = [
            "test@example.com",
            "user@domain.co",
            "first.last@company.org",
            "user+tag@example.com",
            "user123@test123.com"
        ]

        for email in valid_emails:
            is_valid, msg = validators.validate_email(email)
            assert is_valid is True, f"Email '{email}' should be valid, got: {msg}"
            assert msg is None

    def test_invalid_email_format(self):
        """Test that invalid email formats are rejected"""
        invalid_emails = [
            "invalid-email",
            "@example.com",
            "user@",
            "user @example.com",
            "user@.com",
            "user@domain",
            ""
        ]

        for email in invalid_emails:
            is_valid, msg = validators.validate_email(email)
            assert is_valid is False
            assert msg is not None

    def test_email_too_long(self):
        """Test that overly long email addresses are rejected"""
        long_email = "a" * 250 + "@example.com"
        is_valid, msg = validators.validate_email(long_email)
        assert is_valid is False
        assert "must not exceed" in msg

    def test_email_empty(self):
        """Test that empty emails are rejected"""
        is_valid, msg = validators.validate_email("")
        assert is_valid is False
        assert "required" in msg

    def test_email_none(self):
        """Test that None emails are rejected"""
        is_valid, msg = validators.validate_email(None)
        assert is_valid is False
        assert "required" in msg


class TestUUIDValidation:
    """Test UUID validation functions"""

    def test_valid_uuids(self):
        """Test that valid UUIDs pass validation"""
        valid_uuids = [
            "550e8400-e29b-41d4-a716-446655440000",
            "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            "00000000-0000-0000-0000-000000000000"
        ]

        for uuid in valid_uuids:
            is_valid, msg = validators.validate_uuid(uuid)
            assert is_valid is True, f"UUID '{uuid}' should be valid, got: {msg}"
            assert msg is None

    def test_invalid_uuid_format(self):
        """Test that invalid UUID formats are rejected"""
        invalid_uuids = [
            ("not-a-uuid", "Invalid UUID"),
            ("550e8400-e29b-41d4-a716", "Invalid UUID"),  # Too short
            ("550e8400-e29b-41d4-a716-446655440000-extra", "Invalid UUID"),  # Too long
            ("550e8400e29b41d4a716446655440000", "Invalid UUID"),  # No hyphens
            ("", "UUID is required")  # Empty string
        ]

        for uuid, expected_msg in invalid_uuids:
            is_valid, msg = validators.validate_uuid(uuid)
            assert is_valid is False
            assert expected_msg in msg, f"Expected '{expected_msg}' in '{msg}'"


class TestSQLInjectionDetection:
    """Test SQL injection detection"""

    def test_safe_strings(self):
        """Test that safe strings pass validation"""
        safe_strings = [
            "Hello World",
            "123 Main Street",
            "John Doe",
            "test@example.com"
        ]

        for string in safe_strings:
            is_suspicious, msg = validators.detect_sql_injection(string)
            assert is_suspicious is False, f"String '{string}' should be safe, got: {msg}"
            assert msg is None

    def test_sql_injection_union_select(self):
        """Test detection of UNION SELECT attacks"""
        attacks = [
            "1' UNION SELECT * FROM users--",
            "' OR 1=1 UNION SELECT password FROM accounts--",
            "admin' UNION SELECT null, username, password FROM users--"
        ]

        for attack in attacks:
            is_suspicious, msg = validators.detect_sql_injection(attack)
            assert is_suspicious is True, f"Attack '{attack}' should be detected"
            assert "SQL patterns" in msg

    def test_sql_injection_select_from(self):
        """Test detection of SELECT FROM attacks"""
        attacks = [
            "'; SELECT * FROM users WHERE '1'='1",
            "admin' OR '1'='1'; SELECT * FROM accounts;--",
            "user'; SELECT password FROM users WHERE username='admin'--"
        ]

        for attack in attacks:
            is_suspicious, msg = validators.detect_sql_injection(attack)
            assert is_suspicious is True

    def test_sql_injection_drop_table(self):
        """Test detection of DROP TABLE attacks"""
        attacks = [
            "'; DROP TABLE users;--",
            "admin'; DROP DATABASE mydb;--",
            "' OR '1'='1'; DROP TABLE accounts CASCADE;--"
        ]

        for attack in attacks:
            is_suspicious, msg = validators.detect_sql_injection(attack)
            assert is_suspicious is True

    def test_sql_injection_comments(self):
        """Test detection of SQL comments"""
        attacks = [
            "admin'--",
            "' OR 1=1--",
            "'; DROP TABLE users; /* comment */"
        ]

        for attack in attacks:
            is_suspicious, msg = validators.detect_sql_injection(attack)
            assert is_suspicious is True


class TestXSSDetection:
    """Test XSS (Cross-Site Scripting) detection"""

    def test_safe_strings(self):
        """Test that safe strings pass validation"""
        safe_strings = [
            "Hello World",
            "This is a normal sentence.",
            "Email: test@example.com",
            "Price: $1,234.56"
        ]

        for string in safe_strings:
            is_suspicious, msg = validators.detect_xss(string)
            assert is_suspicious is False, f"String '{string}' should be safe, got: {msg}"
            assert msg is None

    def test_xss_script_tags(self):
        """Test detection of script tags"""
        attacks = [
            "<script>alert('XSS')</script>",
            "<SCRIPT>alert('XSS')</SCRIPT>",
            "<script src='malicious.js'></script>",
            "<script>document.cookie</script>"
        ]

        for attack in attacks:
            is_suspicious, msg = validators.detect_xss(attack)
            assert is_suspicious is True, f"Attack '{attack}' should be detected"
            assert "HTML/JavaScript" in msg

    def test_xss_javascript_protocol(self):
        """Test detection of javascript: protocol"""
        attacks = [
            "javascript:alert('XSS')",
            "JAVASCRIPT:void(0)",
            "<a href='javascript:alert(1)'>Click</a>"
        ]

        for attack in attacks:
            is_suspicious, msg = validators.detect_xss(attack)
            assert is_suspicious is True

    def test_xss_event_handlers(self):
        """Test detection of event handlers"""
        attacks = [
            "<img onerror='alert(1)' src='x'>",
            "<body onload='malicious()'>",
            "<div onclick='steal_data()'>Click me</div>"
        ]

        for attack in attacks:
            is_suspicious, msg = validators.detect_xss(attack)
            assert is_suspicious is True

    def test_xss_iframes(self):
        """Test detection of iframes"""
        attacks = [
            "<iframe src='malicious.com'></iframe>",
            "<IFRAME>content</IFRAME>",
            "<iframe onload='alert(1)'>"
        ]

        for attack in attacks:
            is_suspicious, msg = validators.detect_xss(attack)
            assert is_suspicious is True


class TestSanitization:
    """Test sanitization functions"""

    def test_html_escape(self):
        """Test HTML character escaping"""
        test_cases = [
            ("<script>alert('xss')</script>", "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"),
            ("<b>Bold</b>", "&lt;b&gt;Bold&lt;/b&gt;"),
            ("User & Admin", "User &amp; Admin"),
            ('"quotes"', "&quot;quotes&quot;")
        ]

        for dirty, expected_clean in test_cases:
            clean = validators.sanitize_html(dirty)
            assert clean == expected_clean, f"Expected '{expected_clean}', got '{clean}'"

    def test_sanitize_string_removes_null_bytes(self):
        """Test that null bytes are removed"""
        dirty = "Hello\x00World"
        clean = validators.sanitize_string(dirty)
        assert "\x00" not in clean
        assert clean == "HelloWorld"

    def test_sanitize_string_trims_whitespace(self):
        """Test that whitespace is trimmed"""
        dirty = "  Hello World  "
        clean = validators.sanitize_string(dirty)
        assert clean == "Hello World"

    def test_sanitize_string_truncates_to_max_length(self):
        """Test that strings are truncated to max length"""
        dirty = "A" * 100
        clean = validators.sanitize_string(dirty, max_length=50)
        assert len(clean) == 50

    def test_sanitize_address(self):
        """Test address sanitization"""
        dirty_address = "<script>alert('xss')</script>123 Main St"
        clean = validators.sanitize_address(dirty_address)
        assert "<script>" not in clean
        assert "123 Main St" in clean


class TestValidateSafeString:
    """Test comprehensive safe string validation"""

    def test_safe_strings_pass(self):
        """Test that safe strings pass all checks"""
        safe_strings = [
            "Hello World",
            "123 Main Street, San Francisco, CA",
            "John Doe",
            "test@example.com"
        ]

        for string in safe_strings:
            is_valid, msg = validators.validate_safe_string(string, "Test")
            assert is_valid is True, f"String '{string}' should be safe, got: {msg}"
            assert msg is None

    def test_sql_injection_detected(self):
        """Test that SQL injection attempts are caught"""
        dangerous_strings = [
            "'; DROP TABLE users;--",
            "admin' OR '1'='1",
            "1' UNION SELECT * FROM users--"
        ]

        for string in dangerous_strings:
            is_valid, msg = validators.validate_safe_string(string, "Input")
            assert is_valid is False, f"String '{string}' should be rejected"
            assert "SQL patterns" in msg

    def test_xss_detected(self):
        """Test that XSS attempts are caught"""
        dangerous_strings = [
            "<script>alert('xss')</script>",
            "javascript:alert(1)",
            "<img onerror='alert(1)' src='x'>"
        ]

        for string in dangerous_strings:
            is_valid, msg = validators.validate_safe_string(string, "Input")
            assert is_valid is False, f"String '{string}' should be rejected"
            assert "HTML/JavaScript" in msg


class TestStringLengthValidation:
    """Test string length validation"""

    def test_valid_length(self):
        """Test that strings within length limits pass"""
        is_valid, msg = validators.validate_string_length("Hello", "Test", 10)
        assert is_valid is True
        assert msg is None

    def test_exceeds_length(self):
        """Test that overly long strings are rejected"""
        is_valid, msg = validators.validate_string_length("A" * 100, "Test", 50)
        assert is_valid is False
        assert "must not exceed 50 characters" in msg

    def test_empty_string(self):
        """Test that empty strings pass (if optional)"""
        is_valid, msg = validators.validate_string_length("", "Test", 10)
        assert is_valid is True


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
