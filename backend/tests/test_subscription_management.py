"""
Subscription Management Tests
Tests for subscription upgrade, downgrade, and cancellation
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

# Import fixtures
from tests.fixtures.user_fixtures import (
    get_free_user,
    get_starter_user,
    get_pro_user,
    get_test_auth_header
)


# ============================================================================
# SUBSCRIPTION UPGRADE TESTS
# ============================================================================

@pytest.mark.asyncio
class TestSubscriptionUpgrade:
    """Test subscription upgrade functionality"""

    async def test_upgrade_free_to_starter(self, client: TestClient):
        """
        Test: Free user upgrades to Starter

        Expected:
        - Checkout session created
        - Stripe called with correct price ID
        - User redirected to payment
        """
        user = get_free_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user, \
             patch('stripe.checkout.Session.create') as mock_checkout:

            mock_user.return_value = user
            mock_checkout.return_value = Mock(
                url="https://checkout.stripe.com/pay/test_session",
                id="cs_test_123"
            )

            response = client.post(
                "/api/v1/subscription/upgrade",
                json={"target_tier": "starter"},
                headers=headers
            )

            assert response.status_code == 200
            data = response.json()

            assert data["success"] is True
            assert "checkout_url" in data["subscription"]
            mock_checkout.assert_called_once()

    async def test_upgrade_starter_to_pro(self, client: TestClient):
        """
        Test: Existing subscriber upgrades from Starter to Pro

        Expected:
        - Subscription modified with proration
        - Usage limit increased
        - Next billing date provided
        """
        user = get_starter_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user, \
             patch('stripe.Subscription.retrieve') as mock_retrieve, \
             patch('stripe.Subscription.modify') as mock_modify, \
             patch('stripe.Invoice.upcoming') as mock_invoice, \
             patch('routers.subscription.update_user_subscription') as mock_update:

            mock_user.return_value = user

            # Mock Stripe subscription
            mock_subscription = Mock()
            mock_subscription.items = {"data": [{"id": "si_test_123"}]}
            mock_subscription.customer = "cus_test_123"
            mock_subscription.current_period_end = 1735689600  # Future timestamp

            mock_retrieve.return_value = mock_subscription
            mock_modify.return_value = mock_subscription

            # Mock upcoming invoice for proration
            mock_invoice.return_value = Mock(amount_due=5000)  # $50 proration

            response = client.post(
                "/api/v1/subscription/upgrade",
                json={"target_tier": "pro"},
                headers=headers
            )

            assert response.status_code == 200
            data = response.json()

            assert data["success"] is True
            assert data["subscription"]["tier"] == "pro"
            assert data["proration_amount"] == 50.0
            assert "next_billing_date" in data

            # Verify database updated
            mock_update.assert_called_once()

    async def test_upgrade_already_at_tier(self, client: TestClient):
        """
        Test: User tries to "upgrade" to same tier

        Expected:
        - Returns 400 error
        - No Stripe calls made
        """
        user = get_starter_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user:
            mock_user.return_value = user

            response = client.post(
                "/api/v1/subscription/upgrade",
                json={"target_tier": "starter"},
                headers=headers
            )

            assert response.status_code == 400
            assert "Already at starter tier" in response.json()["detail"]

    async def test_upgrade_invalid_tier(self, client: TestClient):
        """
        Test: User tries to upgrade to invalid tier

        Expected:
        - Returns 400 error
        """
        user = get_free_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user:
            mock_user.return_value = user

            response = client.post(
                "/api/v1/subscription/upgrade",
                json={"target_tier": "invalid_tier"},
                headers=headers
            )

            assert response.status_code == 400
            assert "Invalid tier" in response.json()["detail"]


# ============================================================================
# SUBSCRIPTION DOWNGRADE TESTS
# ============================================================================

@pytest.mark.asyncio
class TestSubscriptionDowngrade:
    """Test subscription downgrade functionality"""

    async def test_downgrade_starter_to_free(self, client: TestClient):
        """
        Test: Downgrade from Starter to Free

        Expected:
        - Subscription canceled at period end
        - User keeps access until period ends
        - No immediate downgrade
        """
        user = get_starter_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user, \
             patch('stripe.Subscription.modify') as mock_modify:

            mock_user.return_value = user

            # Mock Stripe subscription
            mock_subscription = Mock()
            mock_subscription.current_period_end = 1735689600
            mock_subscription.cancel_at_period_end = True

            mock_modify.return_value = mock_subscription

            response = client.post(
                "/api/v1/subscription/downgrade",
                params={"target_tier": "free"},
                headers=headers
            )

            assert response.status_code == 200
            data = response.json()

            assert data["success"] is True
            assert "downgraded to Free" in data["message"]
            assert data["subscription"]["tier"] == "starter"  # Still starter until period end
            assert data["subscription"]["cancel_at_period_end"] is True

            # Verify Stripe updated
            mock_modify.assert_called_once()

    async def test_downgrade_pro_to_starter(self, client: TestClient):
        """
        Test: Downgrade from Pro to Starter

        Expected:
        - Downgrade scheduled at period end
        - User keeps Pro access until then
        """
        user = get_pro_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user, \
             patch('stripe.Subscription.retrieve') as mock_retrieve, \
             patch('stripe.Subscription.modify') as mock_modify:

            mock_user.return_value = user

            mock_subscription = Mock()
            mock_subscription.current_period_end = 1735689600

            mock_retrieve.return_value = mock_subscription
            mock_modify.return_value = mock_subscription

            response = client.post(
                "/api/v1/subscription/downgrade",
                params={"target_tier": "starter"},
                headers=headers
            )

            assert response.status_code == 200
            data = response.json()

            assert data["success"] is True
            assert "downgraded from pro to starter" in data["message"]
            assert data["subscription"]["downgrade_scheduled"] == "starter"

    async def test_downgrade_invalid_direction(self, client: TestClient):
        """
        Test: User tries to "downgrade" to higher tier

        Expected:
        - Returns 400 error
        - Suggests using upgrade instead
        """
        user = get_starter_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user:
            mock_user.return_value = user

            response = client.post(
                "/api/v1/subscription/downgrade",
                params={"target_tier": "pro"},
                headers=headers
            )

            assert response.status_code == 400
            assert "Use /upgrade instead" in response.json()["detail"]


# ============================================================================
# SUBSCRIPTION CANCELLATION TESTS
# ============================================================================

@pytest.mark.asyncio
class TestSubscriptionCancellation:
    """Test subscription cancellation"""

    async def test_cancel_at_period_end(self, client: TestClient):
        """
        Test: Cancel subscription at period end

        Expected:
        - Subscription marked for cancellation
        - User keeps access until period end
        - Cancellation reason logged
        """
        user = get_starter_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user, \
             patch('stripe.Subscription.modify') as mock_modify:

            mock_user.return_value = user

            mock_subscription = Mock()
            mock_subscription.current_period_end = 1735689600
            mock_subscription.cancel_at_period_end = True

            mock_modify.return_value = mock_subscription

            response = client.post(
                "/api/v1/subscription/cancel",
                json={
                    "reason": "Too expensive",
                    "feedback": "Great product but over budget",
                    "cancel_immediately": False
                },
                headers=headers
            )

            assert response.status_code == 200
            data = response.json()

            assert data["success"] is True
            assert "will be canceled" in data["message"]
            assert data["current_tier"] == "starter"
            assert "access_until" in data

            # Verify metadata includes reason
            call_args = mock_modify.call_args
            assert "cancellation_reason" in call_args[1]["metadata"]

    async def test_cancel_immediately(self, client: TestClient):
        """
        Test: Cancel subscription immediately

        Expected:
        - Subscription deleted now
        - User downgraded to free immediately
        - Loses access immediately
        """
        user = get_starter_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user, \
             patch('stripe.Subscription.delete') as mock_delete, \
             patch('routers.subscription.update_user_subscription') as mock_update:

            mock_user.return_value = user
            mock_delete.return_value = Mock()

            response = client.post(
                "/api/v1/subscription/cancel",
                json={
                    "cancel_immediately": True
                },
                headers=headers
            )

            assert response.status_code == 200
            data = response.json()

            assert data["success"] is True
            assert "canceled immediately" in data["message"]
            assert data["new_tier"] == "free"

            # Verify Stripe subscription deleted
            mock_delete.assert_called_once()

            # Verify user updated to free
            mock_update.assert_called_once()
            update_call = mock_update.call_args[1]
            assert update_call["tier"] == "free"
            assert update_call["status"] == "canceled"

    async def test_cancel_free_tier_error(self, client: TestClient):
        """
        Test: Free user tries to cancel

        Expected:
        - Returns 400 error
        - No paid subscription to cancel
        """
        user = get_free_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user:
            mock_user.return_value = user

            response = client.post(
                "/api/v1/subscription/cancel",
                json={"cancel_immediately": False},
                headers=headers
            )

            assert response.status_code == 400
            assert "No active paid subscription" in response.json()["detail"]


# ============================================================================
# SUBSCRIPTION DETAILS TESTS
# ============================================================================

@pytest.mark.asyncio
class TestSubscriptionDetails:
    """Test getting subscription details"""

    async def test_get_subscription_details_free_user(self, client: TestClient):
        """
        Test: Get details for free user

        Expected:
        - Returns free tier info
        - Shows usage statistics
        - No billing info
        """
        user = get_free_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user:
            mock_user.return_value = user

            response = client.get(
                "/api/v1/subscription/details",
                headers=headers
            )

            assert response.status_code == 200
            data = response.json()

            assert data["subscription"]["tier"] == "free"
            assert data["usage"]["usage_limit"] == 5
            assert data["tier_info"]["analyses"] == 5
            assert data["tier_info"]["price"] == 0

    async def test_get_subscription_details_paid_user(self, client: TestClient):
        """
        Test: Get details for paid user

        Expected:
        - Returns current tier
        - Shows billing dates
        - Includes Stripe info
        """
        user = get_starter_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user, \
             patch('stripe.Subscription.retrieve') as mock_retrieve:

            mock_user.return_value = user

            mock_subscription = Mock()
            mock_subscription.cancel_at_period_end = False
            mock_subscription.metadata = {}

            mock_retrieve.return_value = mock_subscription

            response = client.get(
                "/api/v1/subscription/details",
                headers=headers
            )

            assert response.status_code == 200
            data = response.json()

            assert data["subscription"]["tier"] == "starter"
            assert data["usage"]["usage_limit"] == 25
            assert data["billing"]["cancel_at_period_end"] is False


# ============================================================================
# AVAILABLE PLANS TESTS
# ============================================================================

@pytest.mark.asyncio
class TestAvailablePlans:
    """Test getting available subscription plans"""

    async def test_get_available_plans(self, client: TestClient):
        """
        Test: Get list of all available plans

        Expected:
        - Returns all 4 tiers
        - Includes pricing and features
        - Starter marked as popular
        """
        response = client.get("/api/v1/subscription/plans")

        assert response.status_code == 200
        data = response.json()

        assert "plans" in data
        assert len(data["plans"]) == 4

        # Check all tiers present
        tiers = [plan["tier"] for plan in data["plans"]]
        assert "free" in tiers
        assert "starter" in tiers
        assert "pro" in tiers
        assert "elite" in tiers

        # Check Starter is marked popular
        starter_plan = next(p for p in data["plans"] if p["tier"] == "starter")
        assert starter_plan.get("popular") is True

        # Check pricing
        assert starter_plan["price"] == 29
        pro_plan = next(p for p in data["plans"] if p["tier"] == "pro")
        assert pro_plan["price"] == 79


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

@pytest.mark.asyncio
class TestSubscriptionErrors:
    """Test subscription error handling"""

    async def test_stripe_error_handling(self, client: TestClient):
        """
        Test: Stripe API error handling

        Expected:
        - Returns 400 with Stripe error message
        """
        user = get_free_user()
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user, \
             patch('stripe.checkout.Session.create') as mock_checkout:

            mock_user.return_value = user

            import stripe
            mock_checkout.side_effect = stripe.error.InvalidRequestError(
                "Invalid price ID",
                "price_id"
            )

            response = client.post(
                "/api/v1/subscription/upgrade",
                json={"target_tier": "starter"},
                headers=headers
            )

            assert response.status_code == 400
            assert "Stripe error" in response.json()["detail"]

    async def test_missing_subscription_id(self, client: TestClient):
        """
        Test: User has no Stripe subscription ID

        Expected:
        - Returns appropriate error
        """
        user = get_starter_user()
        user["subscription_stripe_subscription_id"] = None
        headers = get_test_auth_header(user)

        with patch('routers.subscription.get_current_user') as mock_user:
            mock_user.return_value = user

            response = client.post(
                "/api/v1/subscription/downgrade",
                params={"target_tier": "free"},
                headers=headers
            )

            assert response.status_code == 400
            assert "No active subscription" in response.json()["detail"]
