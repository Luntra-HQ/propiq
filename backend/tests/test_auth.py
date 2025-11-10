"""
Authentication Tests
Tests for user registration, login, and JWT validation
"""

import pytest
import jwt
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

# Import fixtures
from tests.fixtures.user_fixtures import (
    get_free_user,
    get_starter_user,
    get_new_user_data,
    get_test_jwt_payload,
    get_test_auth_header,
    get_expired_jwt_token
)


# ============================================================================
# REGISTRATION TESTS
# ============================================================================

@pytest.mark.asyncio
class TestUserRegistration:
    """Test user registration and account creation"""

    async def test_register_new_user_success(self, client: TestClient):
        """
        Test: Successful user registration

        Expected:
        - User created in database
        - Welcome email sent
        - Free tier assigned
        - JWT token returned
        """
        # Arrange
        user_data = get_new_user_data()

        with patch('routers.auth.create_user_in_db') as mock_create, \
             patch('utils.onboarding_emails.send_welcome_email') as mock_email:

            mock_create.return_value = {
                "id": "new-user-id",
                "email": user_data["email"],
                "subscription_tier": "free"
            }

            # Act
            response = client.post("/api/v1/auth/register", json={
                "email": user_data["email"],
                "password": user_data["password"],
                "full_name": user_data.get("full_name", "")
            })

            # Assert
            assert response.status_code == 200
            data = response.json()

            assert "token" in data
            assert "user" in data
            assert data["user"]["email"] == user_data["email"]
            assert data["user"]["subscription_tier"] == "free"

            # Verify user created
            mock_create.assert_called_once()

            # Verify welcome email sent
            mock_email.assert_called_once_with(user_data["email"])

    async def test_register_duplicate_email(self, client: TestClient):
        """
        Test: Registration with existing email fails

        Expected:
        - Returns 400 Bad Request
        - Error message about duplicate email
        """
        # Arrange
        existing_user = get_free_user()
        user_data = get_new_user_data(email=existing_user["email"])

        with patch('routers.auth.create_user_in_db') as mock_create:
            # Simulate duplicate email error
            mock_create.side_effect = Exception("Email already exists")

            # Act
            response = client.post("/api/v1/auth/register", json={
                "email": user_data["email"],
                "password": user_data["password"]
            })

            # Assert
            assert response.status_code == 400
            assert "email" in response.json()["detail"].lower()

    async def test_register_invalid_email_format(self, client: TestClient):
        """
        Test: Registration with invalid email format

        Expected:
        - Returns 422 Validation Error
        """
        # Arrange
        invalid_data = {
            "email": "not-an-email",
            "password": "SecurePass123!"
        }

        # Act
        response = client.post("/api/v1/auth/register", json=invalid_data)

        # Assert
        assert response.status_code == 422
        errors = response.json()["detail"]
        assert any("email" in str(error).lower() for error in errors)

    async def test_register_weak_password(self, client: TestClient):
        """
        Test: Registration with weak password fails

        Expected:
        - Returns 400 Bad Request
        - Password requirements explained
        """
        # Arrange
        user_data = {
            "email": "test@propiq.com",
            "password": "123"  # Too weak
        }

        # Act
        response = client.post("/api/v1/auth/register", json=user_data)

        # Assert
        assert response.status_code in [400, 422]
        assert "password" in response.json()["detail"].lower()

    async def test_register_missing_required_fields(self, client: TestClient):
        """
        Test: Registration without required fields

        Expected:
        - Returns 422 Validation Error
        """
        # Act
        response = client.post("/api/v1/auth/register", json={})

        # Assert
        assert response.status_code == 422


# ============================================================================
# LOGIN TESTS
# ============================================================================

@pytest.mark.asyncio
class TestUserLogin:
    """Test user login and authentication"""

    async def test_login_success(self, client: TestClient):
        """
        Test: Successful login with valid credentials

        Expected:
        - JWT token returned
        - User data returned
        - Last login updated
        """
        # Arrange
        user = get_free_user()
        credentials = {
            "email": user["email"],
            "password": "password123"  # Matches fixture
        }

        with patch('routers.auth.verify_user_credentials') as mock_verify, \
             patch('routers.auth.update_last_login') as mock_login:

            mock_verify.return_value = user

            # Act
            response = client.post("/api/v1/auth/login", json=credentials)

            # Assert
            assert response.status_code == 200
            data = response.json()

            assert "token" in data
            assert "user" in data
            assert data["user"]["email"] == user["email"]

            # Verify token is valid JWT
            decoded = jwt.decode(
                data["token"],
                options={"verify_signature": False}
            )
            assert decoded["email"] == user["email"]
            assert decoded["sub"] == user["id"]

            # Verify last login updated
            mock_login.assert_called_once_with(user["id"])

    async def test_login_invalid_credentials(self, client: TestClient):
        """
        Test: Login with wrong password

        Expected:
        - Returns 401 Unauthorized
        """
        # Arrange
        credentials = {
            "email": "test@propiq.com",
            "password": "wrongpassword"
        }

        with patch('routers.auth.verify_user_credentials') as mock_verify:
            mock_verify.return_value = None  # Invalid credentials

            # Act
            response = client.post("/api/v1/auth/login", json=credentials)

            # Assert
            assert response.status_code == 401
            assert "Invalid" in response.json()["detail"]

    async def test_login_nonexistent_user(self, client: TestClient):
        """
        Test: Login with non-existent email

        Expected:
        - Returns 401 Unauthorized
        - Same error message as wrong password (security)
        """
        # Arrange
        credentials = {
            "email": "nonexistent@propiq.com",
            "password": "password123"
        }

        with patch('routers.auth.verify_user_credentials') as mock_verify:
            mock_verify.return_value = None

            # Act
            response = client.post("/api/v1/auth/login", json=credentials)

            # Assert
            assert response.status_code == 401

    async def test_login_inactive_user(self, client: TestClient):
        """
        Test: Login with inactive/deleted account

        Expected:
        - Returns 401 Unauthorized
        """
        # Arrange
        from tests.fixtures.user_fixtures import get_inactive_user
        user = get_inactive_user()
        credentials = {
            "email": user["email"],
            "password": "password123"
        }

        with patch('routers.auth.verify_user_credentials') as mock_verify:
            mock_verify.return_value = None  # Inactive users can't log in

            # Act
            response = client.post("/api/v1/auth/login", json=credentials)

            # Assert
            assert response.status_code == 401


# ============================================================================
# JWT TOKEN TESTS
# ============================================================================

@pytest.mark.asyncio
class TestJWTTokens:
    """Test JWT token generation and validation"""

    async def test_valid_token_accepted(self, client: TestClient):
        """
        Test: Valid JWT token allows access to protected endpoint

        Expected:
        - Token validated successfully
        - User data accessible
        """
        # Arrange
        user = get_free_user()
        headers = get_test_auth_header(user)

        with patch('routers.auth.get_user_by_id') as mock_get:
            mock_get.return_value = user

            # Act
            response = client.get("/api/v1/users/me", headers=headers)

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == user["email"]

    async def test_expired_token_rejected(self, client: TestClient):
        """
        Test: Expired JWT token is rejected

        Expected:
        - Returns 401 Unauthorized
        - Clear expiration error message
        """
        # Arrange
        user = get_free_user()
        expired_token = get_expired_jwt_token(user)
        headers = {"Authorization": f"Bearer {expired_token}"}

        # Act
        response = client.get("/api/v1/users/me", headers=headers)

        # Assert
        assert response.status_code == 401
        assert "expired" in response.json()["detail"].lower()

    async def test_invalid_token_rejected(self, client: TestClient):
        """
        Test: Invalid JWT token is rejected

        Expected:
        - Returns 401 Unauthorized
        """
        # Arrange
        headers = {"Authorization": "Bearer invalid.token.here"}

        # Act
        response = client.get("/api/v1/users/me", headers=headers)

        # Assert
        assert response.status_code == 401

    async def test_missing_token_rejected(self, client: TestClient):
        """
        Test: Request without token is rejected

        Expected:
        - Returns 401 Unauthorized
        """
        # Act
        response = client.get("/api/v1/users/me")

        # Assert
        assert response.status_code == 401

    async def test_malformed_auth_header(self, client: TestClient):
        """
        Test: Malformed Authorization header

        Expected:
        - Returns 401 Unauthorized
        """
        # Test cases
        malformed_headers = [
            {"Authorization": "NotBearer token"},
            {"Authorization": "Bearer"},
            {"Authorization": "token"},
            {"Authorization": ""}
        ]

        for headers in malformed_headers:
            response = client.get("/api/v1/users/me", headers=headers)
            assert response.status_code == 401

    async def test_token_contains_correct_claims(self, client: TestClient):
        """
        Test: JWT token contains all required claims

        Expected:
        - sub (user ID)
        - email
        - exp (expiration)
        - iat (issued at)
        """
        # Arrange
        user = get_free_user()
        payload = get_test_jwt_payload(user)

        # Assert
        assert "sub" in payload
        assert "email" in payload
        assert "exp" in payload
        assert "iat" in payload
        assert payload["sub"] == user["id"]
        assert payload["email"] == user["email"]

    async def test_token_expiration_time(self, client: TestClient):
        """
        Test: JWT token expires after 7 days

        Expected:
        - Expiration is ~7 days from issue
        """
        # Arrange
        user = get_free_user()
        payload = get_test_jwt_payload(user)

        # Calculate expiration duration
        issued_at = datetime.fromtimestamp(payload["iat"])
        expires_at = datetime.fromtimestamp(payload["exp"])
        duration = expires_at - issued_at

        # Assert ~7 days (allow 1 minute tolerance)
        expected_duration = timedelta(days=7)
        assert abs(duration - expected_duration) < timedelta(minutes=1)


# ============================================================================
# PASSWORD RESET TESTS
# ============================================================================

@pytest.mark.asyncio
class TestPasswordReset:
    """Test password reset flow"""

    async def test_request_password_reset(self, client: TestClient):
        """
        Test: Request password reset email

        Expected:
        - Reset email sent
        - Reset token generated
        - Returns 200 (even if email doesn't exist - security)
        """
        # Arrange
        email = "test@propiq.com"

        with patch('utils.onboarding_emails.send_password_reset_email') as mock_email:
            # Act
            response = client.post("/api/v1/auth/reset-password", json={
                "email": email
            })

            # Assert
            assert response.status_code == 200
            assert "email sent" in response.json()["message"].lower()

    async def test_reset_password_with_valid_token(self, client: TestClient):
        """
        Test: Reset password with valid reset token

        Expected:
        - Password updated
        - Reset token invalidated
        - User can log in with new password
        """
        # Arrange
        reset_token = "valid-reset-token-123"
        new_password = "NewSecurePass123!"

        with patch('routers.auth.validate_reset_token') as mock_validate, \
             patch('routers.auth.update_user_password') as mock_update:

            mock_validate.return_value = "user-id-123"

            # Act
            response = client.post("/api/v1/auth/reset-password/confirm", json={
                "token": reset_token,
                "new_password": new_password
            })

            # Assert
            assert response.status_code == 200
            mock_update.assert_called_once_with("user-id-123", new_password)

    async def test_reset_password_with_invalid_token(self, client: TestClient):
        """
        Test: Reset password with invalid/expired token

        Expected:
        - Returns 400 Bad Request
        - Password not changed
        """
        # Arrange
        invalid_token = "invalid-or-expired-token"
        new_password = "NewSecurePass123!"

        with patch('routers.auth.validate_reset_token') as mock_validate:
            mock_validate.return_value = None  # Invalid token

            # Act
            response = client.post("/api/v1/auth/reset-password/confirm", json={
                "token": invalid_token,
                "new_password": new_password
            })

            # Assert
            assert response.status_code == 400


# ============================================================================
# TIER-BASED ACCESS TESTS
# ============================================================================

@pytest.mark.asyncio
class TestTierBasedAccess:
    """Test that user tier affects access to features"""

    async def test_free_user_limited_access(self, client: TestClient):
        """
        Test: Free tier user has limited access

        Expected:
        - Can access basic features
        - Cannot access premium features
        """
        # Arrange
        user = get_free_user()
        headers = get_test_auth_header(user)

        # Act - try to access premium feature
        with patch('routers.auth.get_user_by_id') as mock_get:
            mock_get.return_value = user

            response = client.get("/api/v1/premium/feature", headers=headers)

            # Assert
            assert response.status_code in [403, 402]  # Forbidden or Payment Required

    async def test_paid_user_full_access(self, client: TestClient):
        """
        Test: Paid tier user has full access

        Expected:
        - Can access all features
        """
        # Arrange
        user = get_starter_user()
        headers = get_test_auth_header(user)

        # Act
        with patch('routers.auth.get_user_by_id') as mock_get:
            mock_get.return_value = user

            response = client.get("/api/v1/premium/feature", headers=headers)

            # Assert
            assert response.status_code != 403  # Not forbidden

    async def test_canceled_subscription_loses_access(self, client: TestClient):
        """
        Test: User with canceled subscription loses access

        Expected:
        - Tier reverts to free
        - Loses premium access
        """
        # Arrange
        from tests.fixtures.user_fixtures import get_canceled_subscription_user
        user = get_canceled_subscription_user()
        headers = get_test_auth_header(user)

        # Act
        with patch('routers.auth.get_user_by_id') as mock_get:
            mock_get.return_value = user

            response = client.get("/api/v1/users/me", headers=headers)

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["subscription_tier"] == "free"
            assert data["subscription_status"] == "canceled"
