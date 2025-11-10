"""
Pytest configuration and fixtures for PropIQ backend tests
"""

import pytest
import os
import sys
from typing import Generator
from fastapi.testclient import TestClient
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load test environment variables from .env.test if it exists
def load_test_env():
    """Load environment variables from .env.test file"""
    backend_dir = Path(__file__).parent.parent
    env_test_file = backend_dir / ".env.test"

    if env_test_file.exists():
        # Load .env.test file
        print(f"Loading test environment from: {env_test_file}")
        try:
            from dotenv import load_dotenv
            load_dotenv(env_test_file, override=True)
            print("✅ Test environment loaded successfully")
            return True
        except ImportError:
            print("⚠️  python-dotenv not installed, using default test values")
            return False
    else:
        print(f"⚠️  No .env.test file found at {env_test_file}")
        print("Using default test environment values")
        return False

# Try to load .env.test, fall back to defaults if not available
env_loaded = load_test_env()

# Set default test environment variables if not loaded from file
if not env_loaded or not os.getenv("SUPABASE_URL"):
    os.environ["ENVIRONMENT"] = "testing"
    # Use a random-looking JWT secret to avoid environment validator warnings
    os.environ["JWT_SECRET"] = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
    os.environ["LOG_LEVEL"] = "WARNING"  # Reduce log noise in tests

    # Mock external services in test environment
    os.environ["WANDB_MODE"] = "disabled"
    os.environ["WANDB_API_KEY"] = ""

    # Mock database connection for tests
    os.environ["MONGODB_URI"] = "mongodb://test:test@localhost:27017/test"
    os.environ["SUPABASE_URL"] = "https://test.supabase.co"
    os.environ["SUPABASE_ANON_KEY"] = "test_supabase_anon_key_for_testing_only"
    os.environ["SUPABASE_SERVICE_KEY"] = "test_supabase_service_key_for_testing_only"


@pytest.fixture(scope="session")
def test_env():
    """Fixture to ensure test environment is set up"""
    env = os.getenv("ENVIRONMENT")
    jwt_secret = os.getenv("JWT_SECRET", "")
    supabase_url = os.getenv("SUPABASE_URL", "")

    # Validate test environment
    assert env == "testing", f"ENVIRONMENT must be 'testing', got '{env}'"
    assert len(jwt_secret) >= 32, "JWT_SECRET must be at least 32 characters"
    assert supabase_url, "SUPABASE_URL must be set"

    # Check if using real test database or mock
    is_real_db = "test.supabase.co" not in supabase_url
    if is_real_db:
        print(f"✅ Using real test database: {supabase_url}")
    else:
        print("⚠️  Using mock database (tests requiring DB will be skipped)")

    return {
        "environment": "testing",
        "jwt_secret": jwt_secret,
        "supabase_url": supabase_url,
        "is_real_db": is_real_db
    }


@pytest.fixture(scope="module")
def client() -> Generator:
    """
    Create a FastAPI test client

    Usage:
        def test_endpoint(client):
            response = client.get("/api/v1/health")
            assert response.status_code == 200
    """
    from api import app

    # Note: Integration tests require database connection
    # Set up test database or mock as needed
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def mock_db():
    """
    Mock database for tests that don't need real database

    Usage:
        def test_with_mock_db(client, mock_db):
            # Test will use mocked database
            pass
    """
    # TODO: Implement database mocking for integration tests
    # This could use unittest.mock or a test database
    pass


@pytest.fixture
def auth_headers(client) -> dict:
    """
    Create authentication headers with a valid JWT token

    Usage:
        def test_protected_endpoint(client, auth_headers):
            response = client.get("/api/v1/auth/profile", headers=auth_headers)
            assert response.status_code == 200
    """
    # This will need to be implemented once we have test user creation
    # For now, return empty dict
    return {}


@pytest.fixture
def test_user_data() -> dict:
    """
    Test user data for signup/login tests

    Usage:
        def test_signup(client, test_user_data):
            response = client.post("/api/v1/auth/signup", json=test_user_data)
            assert response.status_code == 200
    """
    return {
        "email": "test@propiq.test",
        "password": "TestPassword123",
        "firstName": "Test",
        "lastName": "User"
    }


@pytest.fixture
def test_property_data() -> dict:
    """
    Test property data for analysis tests

    Usage:
        def test_analysis(client, auth_headers, test_property_data):
            response = client.post(
                "/api/v1/propiq/analyze",
                json=test_property_data,
                headers=auth_headers
            )
            assert response.status_code == 200
    """
    return {
        "address": "123 Main St, San Francisco, CA 94102",
        "propertyType": "single_family",
        "purchasePrice": 800000,
        "downPayment": 160000,
        "interestRate": 6.5
    }


@pytest.fixture(autouse=True)
def reset_test_state():
    """
    Reset any test state before each test
    Runs automatically for all tests (autouse=True)
    """
    # Clean up any test data, reset mocks, etc.
    yield
    # Cleanup after test
    pass


# Pytest plugins
pytest_plugins = []


# Custom pytest hooks
def pytest_configure(config):
    """
    Custom pytest configuration
    Called once at the start of the test session
    """
    # Add custom markers
    config.addinivalue_line(
        "markers", "unit: Unit tests (fast, no external dependencies)"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests (require database, external services)"
    )
    config.addinivalue_line(
        "markers", "security: Security-focused tests"
    )
    config.addinivalue_line(
        "markers", "slow: Slow-running tests"
    )
    config.addinivalue_line(
        "markers", "smoke: Smoke tests (quick sanity checks)"
    )


def pytest_collection_modifyitems(config, items):
    """
    Modify test collection
    Add markers to tests based on their location
    """
    for item in items:
        # Auto-mark tests based on directory
        if "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        elif "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        elif "security" in str(item.fspath):
            item.add_marker(pytest.mark.security)
