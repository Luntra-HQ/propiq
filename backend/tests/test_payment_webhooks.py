"""
Payment Webhook Tests
Tests for Stripe webhook processing and payment flow
"""

import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock

# Import fixtures
from tests.fixtures.user_fixtures import (
    get_free_user,
    get_starter_user,
    get_test_auth_header
)
from tests.fixtures.stripe_fixtures import (
    get_checkout_session_completed_event,
    get_subscription_created_event,
    get_subscription_updated_event,
    get_subscription_deleted_event,
    get_invoice_payment_succeeded_event,
    get_invoice_payment_failed_event,
    get_test_webhook_headers,
    get_complete_subscription_flow_events
)


# ============================================================================
# WEBHOOK ENDPOINT TESTS
# ============================================================================

@pytest.mark.asyncio
class TestStripeWebhooks:
    """Test Stripe webhook processing"""

    @pytest.fixture
    def mock_stripe_verify(self):
        """Mock Stripe signature verification"""
        with patch('stripe.Webhook.construct_event') as mock:
            yield mock

    @pytest.fixture
    def mock_db(self):
        """Mock database operations"""
        with patch('routers.payment_enhanced.get_or_create_webhook') as mock_create, \
             patch('routers.payment_enhanced.mark_webhook_processed') as mock_mark, \
             patch('routers.payment_enhanced.update_user_subscription') as mock_update:

            # Mock idempotency check - webhook not yet processed
            mock_create.return_value = (
                "webhook-uuid-123",  # webhook_id
                False  # already_processed
            )

            yield {
                'create': mock_create,
                'mark': mock_mark,
                'update': mock_update
            }

    async def test_checkout_session_completed(self, client: TestClient, mock_stripe_verify, mock_db):
        """
        Test: Checkout session completed webhook

        Expected:
        - Webhook is recorded in database
        - User subscription is activated
        - User tier is updated
        - Returns 200 OK
        """
        # Arrange
        user = get_free_user()
        event = get_checkout_session_completed_event(
            customer_email=user["email"],
            tier="starter",
            user_id=user["id"]
        )

        mock_stripe_verify.return_value = event

        payload = json.dumps(event)
        headers = get_test_webhook_headers(payload)

        # Act
        response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

        # Assert
        assert response.status_code == 200
        assert response.json()["status"] == "success"

        # Verify webhook was recorded
        mock_db['create'].assert_called_once()

        # Verify user subscription was updated
        mock_db['update'].assert_called_once()
        update_call = mock_db['update'].call_args[1]
        assert update_call["tier"] == "starter"
        assert update_call["status"] == "active"

        # Verify webhook marked as processed
        mock_db['mark'].assert_called_once()

    async def test_subscription_created(self, client: TestClient, mock_stripe_verify, mock_db):
        """
        Test: Subscription created webhook

        Expected:
        - Subscription ID stored in database
        - User tier updated
        - Stripe customer ID linked
        """
        # Arrange
        user = get_free_user()
        event = get_subscription_created_event(
            customer_id="cus_test_123",
            tier="pro",
            user_id=user["id"]
        )

        mock_stripe_verify.return_value = event

        payload = json.dumps(event)
        headers = get_test_webhook_headers(payload)

        # Act
        response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

        # Assert
        assert response.status_code == 200

        # Verify subscription details stored
        mock_db['update'].assert_called_once()
        update_call = mock_db['update'].call_args[1]
        assert update_call["stripe_customer_id"] == "cus_test_123"
        assert "sub_test_" in update_call["stripe_subscription_id"]

    async def test_subscription_canceled(self, client: TestClient, mock_stripe_verify, mock_db):
        """
        Test: Subscription deleted (canceled) webhook

        Expected:
        - User tier reverted to free
        - Subscription status set to canceled
        - Access removed at period end
        """
        # Arrange
        user = get_starter_user()
        event = get_subscription_deleted_event(
            customer_id=user["subscription_stripe_customer_id"],
            tier="starter"
        )

        mock_stripe_verify.return_value = event

        payload = json.dumps(event)
        headers = get_test_webhook_headers(payload)

        # Act
        response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

        # Assert
        assert response.status_code == 200

        # Verify downgrade to free
        mock_db['update'].assert_called_once()
        update_call = mock_db['update'].call_args[1]
        assert update_call["tier"] == "free"
        assert update_call["status"] == "canceled"

    async def test_invoice_payment_succeeded(self, client: TestClient, mock_stripe_verify, mock_db):
        """
        Test: Invoice payment succeeded (recurring payment)

        Expected:
        - Subscription remains active
        - Payment recorded
        - No tier changes
        """
        # Arrange
        user = get_starter_user()
        event = get_invoice_payment_succeeded_event(
            customer_id=user["subscription_stripe_customer_id"],
            tier="starter",
            amount=2900
        )

        mock_stripe_verify.return_value = event

        payload = json.dumps(event)
        headers = get_test_webhook_headers(payload)

        # Act
        response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

        # Assert
        assert response.status_code == 200

        # Verify subscription still active
        mock_db['update'].assert_called_once()
        update_call = mock_db['update'].call_args[1]
        assert update_call["status"] == "active"

    async def test_invoice_payment_failed(self, client: TestClient, mock_stripe_verify, mock_db):
        """
        Test: Invoice payment failed

        Expected:
        - User notified (in production)
        - Subscription status updated to past_due
        - Slack alert sent
        """
        # Arrange
        user = get_starter_user()
        event = get_invoice_payment_failed_event(
            customer_id=user["subscription_stripe_customer_id"],
            tier="starter",
            amount=2900,
            failure_message="Card declined"
        )

        mock_stripe_verify.return_value = event

        payload = json.dumps(event)
        headers = get_test_webhook_headers(payload)

        # Act
        response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

        # Assert
        assert response.status_code == 200

        # Verify subscription marked as past_due
        mock_db['update'].assert_called_once()
        update_call = mock_db['update'].call_args[1]
        assert update_call["status"] == "past_due"


# ============================================================================
# IDEMPOTENCY TESTS
# ============================================================================

@pytest.mark.asyncio
class TestWebhookIdempotency:
    """Test that webhooks are processed exactly once"""

    async def test_duplicate_webhook_ignored(self, client: TestClient):
        """
        Test: Duplicate webhook event is ignored

        Expected:
        - First event: processed normally
        - Second event with same ID: returns success but doesn't process
        - User only updated once
        """
        # Arrange
        user = get_free_user()
        event = get_checkout_session_completed_event(
            customer_email=user["email"],
            tier="starter",
            user_id=user["id"]
        )

        payload = json.dumps(event)
        headers = get_test_webhook_headers(payload)

        with patch('stripe.Webhook.construct_event') as mock_verify, \
             patch('routers.payment_enhanced.get_or_create_webhook') as mock_create, \
             patch('routers.payment_enhanced.update_user_subscription') as mock_update:

            mock_verify.return_value = event

            # First request - not yet processed
            mock_create.return_value = ("webhook-id", False)
            response1 = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

            # Second request - already processed
            mock_create.return_value = ("webhook-id", True)
            response2 = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

            # Assert both return 200
            assert response1.status_code == 200
            assert response2.status_code == 200

            # But user only updated once
            assert mock_update.call_count == 1

    async def test_idempotency_across_event_types(self, client: TestClient):
        """
        Test: Different event types with same ID are treated as same event

        Expected:
        - Idempotency is by event ID, not event type
        """
        with patch('stripe.Webhook.construct_event') as mock_verify, \
             patch('routers.payment_enhanced.get_or_create_webhook') as mock_create:

            event1 = get_checkout_session_completed_event()
            event2 = get_subscription_created_event()

            # Force same event ID
            event2["id"] = event1["id"]

            mock_create.side_effect = [
                ("webhook-id", False),  # First event processed
                ("webhook-id", True)    # Second event skipped (same ID)
            ]

            mock_verify.side_effect = [event1, event2]

            payload1 = json.dumps(event1)
            payload2 = json.dumps(event2)
            headers1 = get_test_webhook_headers(payload1)
            headers2 = get_test_webhook_headers(payload2)

            response1 = client.post("/api/v1/stripe/webhook", content=payload1, headers=headers1)
            response2 = client.post("/api/v1/stripe/webhook", content=payload2, headers=headers2)

            assert response1.status_code == 200
            assert response2.status_code == 200
            assert response2.json().get("message") == "Already processed"


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

@pytest.mark.asyncio
class TestWebhookErrors:
    """Test webhook error handling"""

    async def test_invalid_signature(self, client: TestClient):
        """
        Test: Invalid webhook signature is rejected

        Expected:
        - Returns 400 Bad Request
        - Webhook not processed
        """
        with patch('stripe.Webhook.construct_event') as mock_verify:
            import stripe
            mock_verify.side_effect = stripe.error.SignatureVerificationError(
                "Invalid signature", "sig_header"
            )

            event = get_checkout_session_completed_event()
            payload = json.dumps(event)
            headers = {"Stripe-Signature": "invalid_signature"}

            response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

            assert response.status_code == 400
            assert "Invalid signature" in response.json()["detail"]

    async def test_invalid_payload(self, client: TestClient):
        """
        Test: Invalid JSON payload is rejected

        Expected:
        - Returns 400 Bad Request
        """
        with patch('stripe.Webhook.construct_event') as mock_verify:
            mock_verify.side_effect = ValueError("Invalid payload")

            response = client.post(
                "/api/v1/stripe/webhook",
                content="not valid json",
                headers={"Stripe-Signature": "sig"}
            )

            assert response.status_code == 400
            assert "Invalid payload" in response.json()["detail"]

    async def test_database_error_returns_success(self, client: TestClient):
        """
        Test: Database errors don't cause webhook retry

        Expected:
        - Returns 200 (to prevent Stripe retries)
        - Error logged to Sentry
        - Webhook marked as failed for manual retry
        """
        with patch('stripe.Webhook.construct_event') as mock_verify, \
             patch('routers.payment_enhanced.get_or_create_webhook') as mock_create:

            event = get_checkout_session_completed_event()
            mock_verify.return_value = event

            # Simulate database error
            mock_create.side_effect = Exception("Database connection lost")

            payload = json.dumps(event)
            headers = get_test_webhook_headers(payload)

            response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

            # Still returns 200 to prevent Stripe retries
            assert response.status_code == 200
            assert response.json()["status"] == "success"

    async def test_missing_user_id_in_metadata(self, client: TestClient):
        """
        Test: Webhook with missing user_id in metadata

        Expected:
        - Attempts to find user by email
        - If not found, logs error but returns 200
        """
        with patch('stripe.Webhook.construct_event') as mock_verify, \
             patch('routers.payment_enhanced.get_or_create_webhook') as mock_create:

            event = get_checkout_session_completed_event()
            # Remove user_id from metadata
            del event["data"]["object"]["metadata"]["user_id"]

            mock_verify.return_value = event
            mock_create.return_value = ("webhook-id", False)

            payload = json.dumps(event)
            headers = get_test_webhook_headers(payload)

            response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

            # Returns 200 (webhook recorded, but user not updated)
            assert response.status_code == 200


# ============================================================================
# COMPLETE FLOW TESTS
# ============================================================================

@pytest.mark.asyncio
class TestPaymentFlows:
    """Test complete payment flows from checkout to subscription"""

    async def test_complete_signup_flow(self, client: TestClient):
        """
        Test: Complete new user subscription flow

        Flow:
        1. checkout.session.completed
        2. customer.subscription.created
        3. invoice.payment_succeeded

        Expected:
        - All events processed successfully
        - User upgraded to paid tier
        - Subscription data stored
        """
        user = get_free_user()
        events = get_complete_subscription_flow_events(
            customer_email=user["email"],
            tier="starter",
            user_id=user["id"]
        )

        with patch('stripe.Webhook.construct_event') as mock_verify, \
             patch('routers.payment_enhanced.get_or_create_webhook') as mock_create, \
             patch('routers.payment_enhanced.update_user_subscription') as mock_update:

            # Each event is unique (not yet processed)
            mock_create.side_effect = [
                (f"webhook-{i}", False) for i in range(len(events))
            ]

            for event in events:
                mock_verify.return_value = event
                payload = json.dumps(event)
                headers = get_test_webhook_headers(payload)

                response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)
                assert response.status_code == 200

            # Verify user was updated at least once
            assert mock_update.call_count >= 1

    async def test_upgrade_flow(self, client: TestClient):
        """
        Test: User upgrades from starter to pro

        Expected:
        - subscription.updated event
        - Tier upgraded
        - Usage limit increased
        """
        user = get_starter_user()
        event = get_subscription_updated_event(
            customer_id=user["subscription_stripe_customer_id"],
            tier="pro",
            user_id=user["id"]
        )

        with patch('stripe.Webhook.construct_event') as mock_verify, \
             patch('routers.payment_enhanced.get_or_create_webhook') as mock_create, \
             patch('routers.payment_enhanced.update_user_subscription') as mock_update:

            mock_verify.return_value = event
            mock_create.return_value = ("webhook-id", False)

            payload = json.dumps(event)
            headers = get_test_webhook_headers(payload)

            response = client.post("/api/v1/stripe/webhook", content=payload, headers=headers)

            assert response.status_code == 200

            # Verify tier upgraded
            update_call = mock_update.call_args[1]
            assert update_call["tier"] == "pro"

    async def test_payment_failure_then_recovery(self, client: TestClient):
        """
        Test: Payment fails then succeeds on retry

        Flow:
        1. invoice.payment_failed
        2. invoice.payment_succeeded

        Expected:
        - First: status = past_due
        - Second: status = active
        """
        user = get_starter_user()

        failed_event = get_invoice_payment_failed_event(
            customer_id=user["subscription_stripe_customer_id"],
            tier="starter"
        )

        success_event = get_invoice_payment_succeeded_event(
            customer_id=user["subscription_stripe_customer_id"],
            tier="starter"
        )

        with patch('stripe.Webhook.construct_event') as mock_verify, \
             patch('routers.payment_enhanced.get_or_create_webhook') as mock_create, \
             patch('routers.payment_enhanced.update_user_subscription') as mock_update:

            mock_create.side_effect = [
                ("webhook-1", False),
                ("webhook-2", False)
            ]

            # First: payment failed
            mock_verify.return_value = failed_event
            payload1 = json.dumps(failed_event)
            headers1 = get_test_webhook_headers(payload1)
            response1 = client.post("/api/v1/stripe/webhook", content=payload1, headers=headers1)
            assert response1.status_code == 200

            # Second: payment succeeded
            mock_verify.return_value = success_event
            payload2 = json.dumps(success_event)
            headers2 = get_test_webhook_headers(payload2)
            response2 = client.post("/api/v1/stripe/webhook", content=payload2, headers=headers2)
            assert response2.status_code == 200

            # Verify status changed from past_due to active
            assert mock_update.call_count == 2
            call1_status = mock_update.call_args_list[0][1]["status"]
            call2_status = mock_update.call_args_list[1][1]["status"]
            assert call1_status == "past_due"
            assert call2_status == "active"
