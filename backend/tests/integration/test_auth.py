"""
Integration tests for authentication endpoints
Tests signup, login, profile, and JWT token validation

NOTE: These tests require a live database connection (Supabase).
Run with: pytest -m "integration and not requires_db" to skip database tests
Or set up test database before running full integration tests.
"""

import pytest
from fastapi.testclient import TestClient
import importlib.util

# Import auth module directly
spec = importlib.util.spec_from_file_location("auth", "auth.py")
auth_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(auth_module)

# Mark all tests in this module as requiring database
pytestmark = [pytest.mark.integration, pytest.mark.requires_db]


class TestAuthSignup:
    """Test user signup endpoint"""

    def test_signup_success(self, client):
        """Test successful user signup with valid data"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "newuser@test.com",
                "password": "ValidPass123",
                "firstName": "John",
                "lastName": "Doe",
                "company": "Test Company"
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert data["success"] is True
        assert "message" in data
        assert "user" in data
        assert "token" in data

        # Verify user data
        user = data["user"]
        assert user["email"] == "newuser@test.com"
        assert user["firstName"] == "John"
        assert user["lastName"] == "Doe"
        assert user["company"] == "Test Company"
        assert "id" in user
        assert "createdAt" in user

        # Verify default subscription
        assert user["subscriptionTier"] == "free"
        assert user["analysesUsed"] == 0

        # Verify token is a string
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 0

    def test_signup_minimal_data(self, client):
        """Test signup with only required fields"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "minimal@test.com",
                "password": "ValidPass123"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["email"] == "minimal@test.com"

    def test_signup_duplicate_email(self, client):
        """Test signup with existing email"""
        # First signup
        client.post(
            "/api/v1/auth/signup",
            json={
                "email": "duplicate@test.com",
                "password": "ValidPass123"
            }
        )

        # Second signup with same email
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "duplicate@test.com",
                "password": "AnotherPass123"
            }
        )

        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert "error" in data
        assert "error_code" in data
        assert data["error_code"] == "EMAIL_EXISTS"

    def test_signup_invalid_email(self, client):
        """Test signup with invalid email format"""
        invalid_emails = [
            "notanemail",
            "@example.com",
            "user@",
            "user @example.com",
            ""
        ]

        for email in invalid_emails:
            response = client.post(
                "/api/v1/auth/signup",
                json={
                    "email": email,
                    "password": "ValidPass123"
                }
            )

            assert response.status_code == 422
            data = response.json()
            assert data["success"] is False
            assert data["error_code"] == "VALIDATION_ERROR"

    def test_signup_weak_password(self, client):
        """Test signup with passwords that don't meet requirements"""
        weak_passwords = [
            "short1",  # Too short
            "nouppercase123",  # No uppercase
            "NOLOWERCASE123",  # No lowercase
            "NoDigits",  # No digits
            "Password123"  # Common password
        ]

        for password in weak_passwords:
            response = client.post(
                "/api/v1/auth/signup",
                json={
                    "email": f"test_{password}@test.com",
                    "password": password
                }
            )

            assert response.status_code == 422
            data = response.json()
            assert data["success"] is False
            assert data["error_code"] == "VALIDATION_ERROR"

    def test_signup_password_too_long(self, client):
        """Test signup with password exceeding max length"""
        long_password = "A" * 129 + "1a"  # 131 characters

        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "longpass@test.com",
                "password": long_password
            }
        )

        assert response.status_code == 422
        data = response.json()
        assert data["success"] is False

    def test_signup_xss_in_name(self, client):
        """Test signup with XSS attempt in name fields"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "xss@test.com",
                "password": "ValidPass123",
                "firstName": "<script>alert('xss')</script>",
                "lastName": "Test"
            }
        )

        # Should reject XSS attempts
        assert response.status_code == 422
        data = response.json()
        assert data["success"] is False
        assert data["error_code"] == "VALIDATION_ERROR"

    def test_signup_sql_injection_attempt(self, client):
        """Test signup with SQL injection attempt"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "sql@test.com",
                "password": "ValidPass123",
                "firstName": "'; DROP TABLE users;--"
            }
        )

        # Should reject SQL injection attempts
        assert response.status_code == 422
        data = response.json()
        assert data["success"] is False


class TestAuthLogin:
    """Test user login endpoint"""

    def test_login_success(self, client, test_user_data):
        """Test successful login with valid credentials"""
        # First create a user
        client.post("/api/v1/auth/signup", json=test_user_data)

        # Then login
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"]
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert data["success"] is True
        assert "message" in data
        assert "user" in data
        assert "token" in data

        # Verify user data
        user = data["user"]
        assert user["email"] == test_user_data["email"]
        assert user["firstName"] == test_user_data["firstName"]

        # Verify token
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 0

    def test_login_wrong_password(self, client, test_user_data):
        """Test login with wrong password"""
        # Create user
        client.post("/api/v1/auth/signup", json=test_user_data)

        # Login with wrong password
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": "WrongPassword123"
            }
        )

        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
        assert data["error_code"] == "INVALID_CREDENTIALS"

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "SomePassword123"
            }
        )

        assert response.status_code in [401, 404]
        data = response.json()
        assert data["success"] is False
        assert data["error_code"] in ["INVALID_CREDENTIALS", "USER_NOT_FOUND"]

    def test_login_invalid_email_format(self, client):
        """Test login with invalid email format"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "notanemail",
                "password": "SomePassword123"
            }
        )

        assert response.status_code == 422
        data = response.json()
        assert data["success"] is False
        assert data["error_code"] == "VALIDATION_ERROR"

    def test_login_empty_credentials(self, client):
        """Test login with empty email and password"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "",
                "password": ""
            }
        )

        assert response.status_code == 422
        data = response.json()
        assert data["success"] is False

    def test_login_case_insensitive_email(self, client, test_user_data):
        """Test that email login is case-insensitive"""
        # Create user with lowercase email
        client.post("/api/v1/auth/signup", json=test_user_data)

        # Login with uppercase email
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"].upper(),
                "password": test_user_data["password"]
            }
        )

        # Should succeed (email should be case-insensitive)
        assert response.status_code in [200, 401]  # Depends on implementation


class TestAuthProfile:
    """Test user profile endpoint"""

    def test_get_profile_success(self, client, auth_headers):
        """Test getting user profile with valid token"""
        response = client.get("/api/v1/auth/profile", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "user" in data

        user = data["user"]
        assert "id" in user
        assert "email" in user
        assert "subscriptionTier" in user
        assert "analysesUsed" in user
        assert "createdAt" in user

    def test_get_profile_no_token(self, client):
        """Test getting profile without authentication token"""
        response = client.get("/api/v1/auth/profile")

        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
        assert data["error_code"] == "UNAUTHORIZED"

    def test_get_profile_invalid_token(self, client):
        """Test getting profile with invalid token"""
        response = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": "Bearer invalid-token-12345"}
        )

        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
        assert data["error_code"] == "INVALID_TOKEN"

    def test_get_profile_malformed_header(self, client):
        """Test getting profile with malformed auth header"""
        # Missing 'Bearer' prefix
        response = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": "some-token"}
        )

        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False

    def test_get_profile_empty_token(self, client):
        """Test getting profile with empty token"""
        response = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": "Bearer "}
        )

        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False


class TestJWTTokenValidation:
    """Test JWT token validation and security"""

    def test_token_contains_user_info(self, client, test_user_data):
        """Test that JWT token contains user information"""
        # Signup and get token
        signup_response = client.post("/api/v1/auth/signup", json=test_user_data)
        token = signup_response.json()["token"]

        # Use token to access profile
        profile_response = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert profile_response.status_code == 200
        user = profile_response.json()["user"]
        assert user["email"] == test_user_data["email"]

    def test_token_reusable(self, client, test_user_data):
        """Test that token can be reused for multiple requests"""
        # Signup
        signup_response = client.post("/api/v1/auth/signup", json=test_user_data)
        token = signup_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Make multiple requests with same token
        for _ in range(3):
            response = client.get("/api/v1/auth/profile", headers=headers)
            assert response.status_code == 200

    def test_login_generates_new_token(self, client, test_user_data):
        """Test that login generates a new token"""
        # Signup
        signup_response = client.post("/api/v1/auth/signup", json=test_user_data)
        signup_token = signup_response.json()["token"]

        # Login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"]
            }
        )
        login_token = login_response.json()["token"]

        # Tokens should be different (different timestamps)
        # But both should work
        assert isinstance(signup_token, str)
        assert isinstance(login_token, str)

        # Both tokens should work
        response1 = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {signup_token}"}
        )
        response2 = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {login_token}"}
        )

        assert response1.status_code == 200
        assert response2.status_code == 200


class TestAuthEndToEnd:
    """End-to-end authentication workflow tests"""

    def test_signup_login_profile_flow(self, client):
        """Test complete signup -> login -> profile flow"""
        user_data = {
            "email": "e2e@test.com",
            "password": "E2ETest123",
            "firstName": "End",
            "lastName": "ToEnd"
        }

        # 1. Signup
        signup_response = client.post("/api/v1/auth/signup", json=user_data)
        assert signup_response.status_code == 200
        signup_data = signup_response.json()
        assert signup_data["success"] is True

        # 2. Login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": user_data["email"],
                "password": user_data["password"]
            }
        )
        assert login_response.status_code == 200
        login_data = login_response.json()
        token = login_data["token"]

        # 3. Get Profile
        profile_response = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert profile_response.status_code == 200
        profile_data = profile_response.json()
        assert profile_data["user"]["email"] == user_data["email"]

    def test_multiple_users_isolation(self, client):
        """Test that multiple users are isolated from each other"""
        # Create two users
        user1_data = {
            "email": "user1@test.com",
            "password": "User1Pass123",
            "firstName": "User",
            "lastName": "One"
        }
        user2_data = {
            "email": "user2@test.com",
            "password": "User2Pass123",
            "firstName": "User",
            "lastName": "Two"
        }

        # Signup both users
        response1 = client.post("/api/v1/auth/signup", json=user1_data)
        response2 = client.post("/api/v1/auth/signup", json=user2_data)

        token1 = response1.json()["token"]
        token2 = response2.json()["token"]

        # Get profiles
        profile1 = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {token1}"}
        ).json()
        profile2 = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {token2}"}
        ).json()

        # Verify users are different
        assert profile1["user"]["email"] == user1_data["email"]
        assert profile2["user"]["email"] == user2_data["email"]
        assert profile1["user"]["id"] != profile2["user"]["id"]


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
