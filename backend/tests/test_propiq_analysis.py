"""
PropIQ Analysis Tests
Tests for property analysis, usage limits, and tier enforcement
"""

import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

# Import fixtures
from tests.fixtures.user_fixtures import (
    get_free_user,
    get_starter_user,
    get_pro_user,
    get_user_at_limit,
    get_user_over_limit,
    get_test_auth_header
)
from tests.fixtures.property_fixtures import (
    get_basic_property_analysis,
    get_commercial_property_analysis,
    get_user_property_history,
    assert_property_analysis_valid
)


# ============================================================================
# PROPERTY ANALYSIS CREATION TESTS
# ============================================================================

@pytest.mark.asyncio
class TestPropertyAnalysis:
    """Test property analysis creation and retrieval"""

    async def test_analyze_property_success(self, client: TestClient):
        """
        Test: Successful property analysis

        Expected:
        - Analysis created
        - Usage count incremented
        - Analysis data returned
        """
        # Arrange
        user = get_free_user()
        headers = get_test_auth_header(user)
        address = "123 Main St, San Francisco, CA 94102"

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.run_property_analysis') as mock_analyze, \
             patch('routers.propiq.increment_usage') as mock_increment, \
             patch('routers.propiq.save_analysis') as mock_save:

            mock_user.return_value = user
            analysis = get_basic_property_analysis(user["id"], address)
            mock_analyze.return_value = analysis["analysis_result"]
            mock_save.return_value = analysis

            # Act
            response = client.post(
                "/api/v1/propiq/analyze",
                json={"address": address},
                headers=headers
            )

            # Assert
            assert response.status_code == 200
            data = response.json()

            assert "id" in data
            assert data["address"] == address
            assert "analysis_result" in data
            assert "market_analysis" in data["analysis_result"]
            assert "investment_metrics" in data["analysis_result"]

            # Verify usage incremented
            mock_increment.assert_called_once_with(user["id"])

    async def test_analyze_commercial_property(self, client: TestClient):
        """
        Test: Commercial property analysis

        Expected:
        - Analysis includes commercial-specific metrics
        - Higher value range
        """
        # Arrange
        user = get_pro_user()  # Pro tier for commercial
        headers = get_test_auth_header(user)
        address = "456 Market St, San Francisco, CA 94103"

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.run_property_analysis') as mock_analyze, \
             patch('routers.propiq.increment_usage') as mock_increment, \
             patch('routers.propiq.save_analysis') as mock_save:

            mock_user.return_value = user
            analysis = get_commercial_property_analysis(user["id"])
            mock_analyze.return_value = analysis["analysis_result"]
            mock_save.return_value = analysis

            # Act
            response = client.post(
                "/api/v1/propiq/analyze",
                json={"address": address},
                headers=headers
            )

            # Assert
            assert response.status_code == 200
            data = response.json()

            # Commercial properties have different metrics
            property_data = data["analysis_result"]["property"]
            assert "Commercial" in property_data.get("property_type", "")

    async def test_analyze_invalid_address(self, client: TestClient):
        """
        Test: Analysis with invalid/not found address

        Expected:
        - Returns 400 Bad Request
        - Usage not incremented
        """
        # Arrange
        user = get_free_user()
        headers = get_test_auth_header(user)
        invalid_address = "Not A Real Address 123"

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.run_property_analysis') as mock_analyze, \
             patch('routers.propiq.increment_usage') as mock_increment:

            mock_user.return_value = user
            mock_analyze.side_effect = ValueError("Address not found")

            # Act
            response = client.post(
                "/api/v1/propiq/analyze",
                json={"address": invalid_address},
                headers=headers
            )

            # Assert
            assert response.status_code == 400
            assert "Address not found" in response.json()["detail"]

            # Usage should not be incremented for failed analysis
            mock_increment.assert_not_called()

    async def test_analyze_without_authentication(self, client: TestClient):
        """
        Test: Analysis without authentication fails

        Expected:
        - Returns 401 Unauthorized
        """
        # Act
        response = client.post(
            "/api/v1/propiq/analyze",
            json={"address": "123 Main St"}
        )

        # Assert
        assert response.status_code == 401


# ============================================================================
# USAGE LIMIT TESTS
# ============================================================================

@pytest.mark.asyncio
class TestUsageLimits:
    """Test usage limits and tier enforcement"""

    async def test_free_tier_usage_limit(self, client: TestClient):
        """
        Test: Free tier user hits usage limit

        Expected:
        - Can analyze up to 5 properties
        - 6th analysis blocked with upgrade prompt
        """
        # Arrange
        user = get_user_at_limit("free")  # Already at 5/5
        headers = get_test_auth_header(user)

        with patch('routers.propiq.get_user_by_id') as mock_user:
            mock_user.return_value = user

            # Act
            response = client.post(
                "/api/v1/propiq/analyze",
                json={"address": "123 Main St"},
                headers=headers
            )

            # Assert
            assert response.status_code == 403  # Forbidden
            data = response.json()
            assert "limit" in data["detail"].lower()
            assert "upgrade" in data["detail"].lower()

    async def test_starter_tier_usage_limit(self, client: TestClient):
        """
        Test: Starter tier limit (25 analyses)

        Expected:
        - Can analyze up to 25 properties
        - 26th analysis blocked
        """
        # Arrange
        user = get_user_at_limit("starter")  # Already at 25/25
        headers = get_test_auth_header(user)

        with patch('routers.propiq.get_user_by_id') as mock_user:
            mock_user.return_value = user

            # Act
            response = client.post(
                "/api/v1/propiq/analyze",
                json={"address": "123 Main St"},
                headers=headers
            )

            # Assert
            assert response.status_code == 403
            data = response.json()
            assert "limit" in data["detail"].lower()

    async def test_usage_resets_monthly(self, client: TestClient):
        """
        Test: Usage count resets at start of billing period

        Expected:
        - After reset date, usage count is 0
        - User can analyze again
        """
        # Arrange
        user = get_user_over_limit("free")
        # Simulate last reset was over 30 days ago
        user["propiq_last_reset_date"] = (datetime.utcnow() - timedelta(days=31)).isoformat()

        headers = get_test_auth_header(user)

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.check_and_reset_usage') as mock_reset, \
             patch('routers.propiq.run_property_analysis') as mock_analyze, \
             patch('routers.propiq.increment_usage') as mock_increment, \
             patch('routers.propiq.save_analysis') as mock_save:

            # Mock reset logic
            user_after_reset = user.copy()
            user_after_reset["propiq_usage_count"] = 0
            mock_reset.return_value = user_after_reset

            mock_user.return_value = user_after_reset
            analysis = get_basic_property_analysis(user["id"])
            mock_analyze.return_value = analysis["analysis_result"]
            mock_save.return_value = analysis

            # Act
            response = client.post(
                "/api/v1/propiq/analyze",
                json={"address": "123 Main St"},
                headers=headers
            )

            # Assert
            assert response.status_code == 200
            mock_reset.assert_called_once()

    async def test_pro_tier_higher_limit(self, client: TestClient):
        """
        Test: Pro tier has 100 analyses limit

        Expected:
        - Can analyze more than starter tier
        """
        # Arrange
        user = get_pro_user()
        user["propiq_usage_count"] = 50  # Halfway through pro limit
        headers = get_test_auth_header(user)

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.run_property_analysis') as mock_analyze, \
             patch('routers.propiq.increment_usage') as mock_increment, \
             patch('routers.propiq.save_analysis') as mock_save:

            mock_user.return_value = user
            analysis = get_basic_property_analysis(user["id"])
            mock_analyze.return_value = analysis["analysis_result"]
            mock_save.return_value = analysis

            # Act
            response = client.post(
                "/api/v1/propiq/analyze",
                json={"address": "123 Main St"},
                headers=headers
            )

            # Assert
            assert response.status_code == 200  # Pro user can still analyze

    async def test_usage_count_incremented_correctly(self, client: TestClient):
        """
        Test: Each analysis increments usage count by 1

        Expected:
        - Usage count increases after each analysis
        """
        # Arrange
        user = get_free_user()
        initial_usage = user["propiq_usage_count"]
        headers = get_test_auth_header(user)

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.run_property_analysis') as mock_analyze, \
             patch('routers.propiq.increment_usage') as mock_increment, \
             patch('routers.propiq.save_analysis') as mock_save:

            mock_user.return_value = user
            analysis = get_basic_property_analysis(user["id"])
            mock_analyze.return_value = analysis["analysis_result"]
            mock_save.return_value = analysis

            # Act
            response = client.post(
                "/api/v1/propiq/analyze",
                json={"address": "123 Main St"},
                headers=headers
            )

            # Assert
            assert response.status_code == 200
            mock_increment.assert_called_once_with(user["id"])


# ============================================================================
# PROPERTY HISTORY TESTS
# ============================================================================

@pytest.mark.asyncio
class TestPropertyHistory:
    """Test retrieving user's property analysis history"""

    async def test_get_user_analyses(self, client: TestClient):
        """
        Test: Get user's analysis history

        Expected:
        - Returns list of analyses
        - Sorted by date (newest first)
        - Only user's own analyses
        """
        # Arrange
        user = get_starter_user()
        headers = get_test_auth_header(user)
        history = get_user_property_history(user["id"], count=5)

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.get_user_analyses') as mock_history:

            mock_user.return_value = user
            mock_history.return_value = history

            # Act
            response = client.get("/api/v1/propiq/analyses", headers=headers)

            # Assert
            assert response.status_code == 200
            data = response.json()

            assert isinstance(data, list)
            assert len(data) == 5

            # Verify all belong to user
            for analysis in data:
                assert analysis["user_id"] == user["id"]

            # Verify sorted by date (newest first)
            dates = [analysis["created_at"] for analysis in data]
            assert dates == sorted(dates, reverse=True)

    async def test_get_single_analysis(self, client: TestClient):
        """
        Test: Get specific analysis by ID

        Expected:
        - Returns analysis details
        - Only if user owns it
        """
        # Arrange
        user = get_starter_user()
        headers = get_test_auth_header(user)
        analysis = get_basic_property_analysis(user["id"])

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.get_analysis_by_id') as mock_get:

            mock_user.return_value = user
            mock_get.return_value = analysis

            # Act
            response = client.get(
                f"/api/v1/propiq/analyses/{analysis['id']}",
                headers=headers
            )

            # Assert
            assert response.status_code == 200
            data = response.json()

            assert data["id"] == analysis["id"]
            assert data["user_id"] == user["id"]
            assert_property_analysis_valid(data)

    async def test_cannot_access_other_user_analysis(self, client: TestClient):
        """
        Test: User cannot access another user's analysis

        Expected:
        - Returns 403 Forbidden or 404 Not Found
        """
        # Arrange
        user = get_starter_user()
        other_user = get_free_user()
        headers = get_test_auth_header(user)

        # Analysis belongs to other user
        analysis = get_basic_property_analysis(other_user["id"])

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.get_analysis_by_id') as mock_get:

            mock_user.return_value = user
            mock_get.return_value = analysis

            # Act
            response = client.get(
                f"/api/v1/propiq/analyses/{analysis['id']}",
                headers=headers
            )

            # Assert
            assert response.status_code in [403, 404]

    async def test_empty_history(self, client: TestClient):
        """
        Test: New user with no analyses

        Expected:
        - Returns empty list
        """
        # Arrange
        user = get_free_user()
        headers = get_test_auth_header(user)

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.get_user_analyses') as mock_history:

            mock_user.return_value = user
            mock_history.return_value = []

            # Act
            response = client.get("/api/v1/propiq/analyses", headers=headers)

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) == 0

    async def test_pagination(self, client: TestClient):
        """
        Test: Analysis history pagination

        Expected:
        - Can limit results
        - Can offset for next page
        """
        # Arrange
        user = get_starter_user()
        headers = get_test_auth_header(user)
        full_history = get_user_property_history(user["id"], count=20)

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.get_user_analyses') as mock_history:

            mock_user.return_value = user

            # First page (10 results)
            mock_history.return_value = full_history[:10]
            response1 = client.get(
                "/api/v1/propiq/analyses?limit=10&offset=0",
                headers=headers
            )

            # Second page (next 10 results)
            mock_history.return_value = full_history[10:20]
            response2 = client.get(
                "/api/v1/propiq/analyses?limit=10&offset=10",
                headers=headers
            )

            # Assert
            assert response1.status_code == 200
            assert response2.status_code == 200

            page1 = response1.json()
            page2 = response2.json()

            assert len(page1) == 10
            assert len(page2) == 10

            # Verify no overlap
            page1_ids = {a["id"] for a in page1}
            page2_ids = {a["id"] for a in page2}
            assert len(page1_ids.intersection(page2_ids)) == 0


# ============================================================================
# TIER FEATURE ACCESS TESTS
# ============================================================================

@pytest.mark.asyncio
class TestTierFeatures:
    """Test tier-specific feature access"""

    async def test_free_tier_basic_features_only(self, client: TestClient):
        """
        Test: Free tier has basic features only

        Expected:
        - Can analyze single-family properties
        - Cannot export to PDF
        - Cannot access API
        """
        # Arrange
        user = get_free_user()
        headers = get_test_auth_header(user)

        with patch('routers.propiq.get_user_by_id') as mock_user:
            mock_user.return_value = user

            # Try to export PDF (premium feature)
            response = client.get(
                "/api/v1/propiq/analyses/123/export/pdf",
                headers=headers
            )

            # Assert
            assert response.status_code in [402, 403]  # Payment Required or Forbidden

    async def test_pro_tier_advanced_features(self, client: TestClient):
        """
        Test: Pro tier has advanced features

        Expected:
        - Can export to PDF
        - Can analyze commercial properties
        - Has API access
        """
        # Arrange
        user = get_pro_user()
        headers = get_test_auth_header(user)
        analysis = get_commercial_property_analysis(user["id"])

        with patch('routers.propiq.get_user_by_id') as mock_user, \
             patch('routers.propiq.get_analysis_by_id') as mock_get, \
             patch('routers.propiq.export_to_pdf') as mock_export:

            mock_user.return_value = user
            mock_get.return_value = analysis
            mock_export.return_value = b"PDF content"

            # Try to export PDF
            response = client.get(
                f"/api/v1/propiq/analyses/{analysis['id']}/export/pdf",
                headers=headers
            )

            # Assert
            assert response.status_code == 200
            assert response.headers["content-type"] == "application/pdf"

    async def test_upgrade_prompt_on_limit(self, client: TestClient):
        """
        Test: User at limit sees upgrade prompt

        Expected:
        - Error message includes upgrade link
        - Shows next tier benefits
        """
        # Arrange
        user = get_user_at_limit("free")
        headers = get_test_auth_header(user)

        with patch('routers.propiq.get_user_by_id') as mock_user:
            mock_user.return_value = user

            # Act
            response = client.post(
                "/api/v1/propiq/analyze",
                json={"address": "123 Main St"},
                headers=headers
            )

            # Assert
            assert response.status_code == 403
            data = response.json()
            assert "upgrade" in data["detail"].lower()
            assert "starter" in data["detail"].lower()  # Suggests next tier
