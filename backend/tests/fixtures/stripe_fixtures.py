"""
Stripe webhook and payment test fixtures
Provides realistic Stripe event payloads for testing
"""

import time
from datetime import datetime, timedelta
from typing import Dict, Any


# ============================================================================
# STRIPE EVENT HELPERS
# ============================================================================

def get_stripe_event_base(event_type: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create base Stripe event structure

    Args:
        event_type: Stripe event type (e.g., "customer.subscription.created")
        event_data: Event data object

    Returns:
        Complete Stripe event payload
    """
    event_id = f"evt_test_{int(time.time())}_{event_type.replace('.', '_')}"

    return {
        "id": event_id,
        "object": "event",
        "api_version": "2023-10-16",
        "created": int(time.time()),
        "type": event_type,
        "data": {
            "object": event_data,
            "previous_attributes": {}
        },
        "livemode": False,
        "pending_webhooks": 1,
        "request": {
            "id": f"req_test_{int(time.time())}",
            "idempotency_key": None
        }
    }


# ============================================================================
# CHECKOUT SESSION EVENTS
# ============================================================================

def get_checkout_session_completed_event(
    customer_email: str = "test@propiq.com",
    tier: str = "starter",
    user_id: str = "test-user-id-123"
) -> Dict[str, Any]:
    """
    Checkout session completed event - New subscription

    This event fires when a user completes payment
    """
    session_data = {
        "id": f"cs_test_{int(time.time())}",
        "object": "checkout.session",
        "amount_subtotal": 2900 if tier == "starter" else (7900 if tier == "pro" else 14900),
        "amount_total": 2900 if tier == "starter" else (7900 if tier == "pro" else 14900),
        "currency": "usd",
        "customer": f"cus_test_{tier}_123",
        "customer_email": customer_email,
        "mode": "subscription",
        "payment_status": "paid",
        "status": "complete",
        "subscription": f"sub_test_{tier}_123",
        "success_url": "https://propiq.luntra.one/dashboard?session_id=CHECKOUT_SESSION_ID",
        "metadata": {
            "user_id": user_id,
            "user_email": customer_email,
            "tier": tier
        }
    }

    return get_stripe_event_base("checkout.session.completed", session_data)


# ============================================================================
# SUBSCRIPTION EVENTS
# ============================================================================

def get_subscription_created_event(
    customer_id: str = "cus_test_123",
    tier: str = "starter",
    user_id: str = "test-user-id-123"
) -> Dict[str, Any]:
    """
    Customer subscription created event

    This event fires when a subscription is created
    """
    current_time = int(time.time())
    subscription_data = {
        "id": f"sub_test_{tier}_123",
        "object": "subscription",
        "customer": customer_id,
        "status": "active",
        "current_period_start": current_time,
        "current_period_end": current_time + (30 * 24 * 60 * 60),  # 30 days
        "cancel_at_period_end": False,
        "canceled_at": None,
        "created": current_time,
        "items": {
            "object": "list",
            "data": [{
                "id": f"si_test_{tier}",
                "object": "subscription_item",
                "price": {
                    "id": f"price_test_{tier}",
                    "object": "price",
                    "active": True,
                    "currency": "usd",
                    "recurring": {
                        "interval": "month",
                        "interval_count": 1
                    },
                    "unit_amount": 2900 if tier == "starter" else (7900 if tier == "pro" else 14900)
                },
                "quantity": 1
            }]
        },
        "metadata": {
            "user_id": user_id,
            "tier": tier
        }
    }

    return get_stripe_event_base("customer.subscription.created", subscription_data)


def get_subscription_updated_event(
    customer_id: str = "cus_test_123",
    tier: str = "pro",
    user_id: str = "test-user-id-123",
    cancel_at_period_end: bool = False
) -> Dict[str, Any]:
    """
    Customer subscription updated event

    This event fires when a subscription is modified
    """
    subscription_data = get_subscription_created_event(customer_id, tier, user_id)["data"]["object"]
    subscription_data["cancel_at_period_end"] = cancel_at_period_end

    if cancel_at_period_end:
        subscription_data["canceled_at"] = int(time.time())

    return get_stripe_event_base("customer.subscription.updated", subscription_data)


def get_subscription_deleted_event(
    customer_id: str = "cus_test_123",
    tier: str = "starter"
) -> Dict[str, Any]:
    """
    Customer subscription deleted event

    This event fires when a subscription is canceled
    """
    subscription_data = get_subscription_created_event(customer_id, tier)["data"]["object"]
    subscription_data["status"] = "canceled"
    subscription_data["canceled_at"] = int(time.time())

    return get_stripe_event_base("customer.subscription.deleted", subscription_data)


# ============================================================================
# INVOICE EVENTS
# ============================================================================

def get_invoice_payment_succeeded_event(
    customer_id: str = "cus_test_123",
    tier: str = "starter",
    amount: int = 2900
) -> Dict[str, Any]:
    """
    Invoice payment succeeded event

    This event fires when a payment is successful (recurring payment)
    """
    invoice_data = {
        "id": f"in_test_{int(time.time())}",
        "object": "invoice",
        "customer": customer_id,
        "subscription": f"sub_test_{tier}_123",
        "amount_due": amount,
        "amount_paid": amount,
        "amount_remaining": 0,
        "currency": "usd",
        "paid": True,
        "status": "paid",
        "billing_reason": "subscription_cycle",
        "created": int(time.time()),
        "lines": {
            "object": "list",
            "data": [{
                "id": f"il_test_{tier}",
                "object": "line_item",
                "amount": amount,
                "currency": "usd",
                "description": f"PropIQ {tier.capitalize()} Plan",
                "price": {
                    "id": f"price_test_{tier}",
                    "object": "price",
                    "active": True,
                    "currency": "usd",
                    "unit_amount": amount
                }
            }]
        }
    }

    return get_stripe_event_base("invoice.payment_succeeded", invoice_data)


def get_invoice_payment_failed_event(
    customer_id: str = "cus_test_123",
    tier: str = "starter",
    amount: int = 2900,
    failure_message: str = "Your card was declined"
) -> Dict[str, Any]:
    """
    Invoice payment failed event

    This event fires when a payment fails
    """
    invoice_data = {
        "id": f"in_test_failed_{int(time.time())}",
        "object": "invoice",
        "customer": customer_id,
        "subscription": f"sub_test_{tier}_123",
        "amount_due": amount,
        "amount_paid": 0,
        "amount_remaining": amount,
        "currency": "usd",
        "paid": False,
        "status": "open",
        "billing_reason": "subscription_cycle",
        "created": int(time.time()),
        "attempt_count": 1,
        "charge": f"ch_test_{int(time.time())}",
        "lines": {
            "object": "list",
            "data": [{
                "id": f"il_test_{tier}",
                "object": "line_item",
                "amount": amount,
                "currency": "usd",
                "description": f"PropIQ {tier.capitalize()} Plan"
            }]
        },
        "last_finalization_error": {
            "message": failure_message,
            "type": "card_error",
            "code": "card_declined"
        }
    }

    return get_stripe_event_base("invoice.payment_failed", invoice_data)


# ============================================================================
# PAYMENT INTENT EVENTS
# ============================================================================

def get_payment_intent_succeeded_event(
    amount: int = 2900,
    customer_id: str = "cus_test_123"
) -> Dict[str, Any]:
    """Payment intent succeeded event"""
    payment_intent_data = {
        "id": f"pi_test_{int(time.time())}",
        "object": "payment_intent",
        "amount": amount,
        "currency": "usd",
        "customer": customer_id,
        "status": "succeeded",
        "charges": {
            "object": "list",
            "data": [{
                "id": f"ch_test_{int(time.time())}",
                "object": "charge",
                "amount": amount,
                "currency": "usd",
                "paid": True,
                "status": "succeeded"
            }]
        }
    }

    return get_stripe_event_base("payment_intent.succeeded", payment_intent_data)


def get_payment_intent_payment_failed_event(
    amount: int = 2900,
    customer_id: str = "cus_test_123"
) -> Dict[str, Any]:
    """Payment intent payment failed event"""
    payment_intent_data = {
        "id": f"pi_test_failed_{int(time.time())}",
        "object": "payment_intent",
        "amount": amount,
        "currency": "usd",
        "customer": customer_id,
        "status": "requires_payment_method",
        "last_payment_error": {
            "message": "Your card was declined",
            "type": "card_error",
            "code": "card_declined"
        }
    }

    return get_stripe_event_base("payment_intent.payment_failed", payment_intent_data)


# ============================================================================
# CUSTOMER EVENTS
# ============================================================================

def get_customer_created_event(
    email: str = "test@propiq.com"
) -> Dict[str, Any]:
    """Customer created event"""
    customer_data = {
        "id": f"cus_test_{int(time.time())}",
        "object": "customer",
        "email": email,
        "created": int(time.time()),
        "default_source": None,
        "invoice_settings": {
            "default_payment_method": None
        }
    }

    return get_stripe_event_base("customer.created", customer_data)


# ============================================================================
# SUBSCRIPTION TIER HELPERS
# ============================================================================

TIER_PRICES = {
    "starter": 2900,  # $29/month
    "pro": 7900,      # $79/month
    "elite": 14900    # $149/month
}

TIER_PRICE_IDS = {
    "starter": "price_test_starter_monthly",
    "pro": "price_test_pro_monthly",
    "elite": "price_test_elite_monthly"
}


def get_tier_amount(tier: str) -> int:
    """Get amount in cents for subscription tier"""
    return TIER_PRICES.get(tier, 2900)


def get_tier_price_id(tier: str) -> str:
    """Get Stripe price ID for subscription tier"""
    return TIER_PRICE_IDS.get(tier, "price_test_starter_monthly")


# ============================================================================
# TEST SCENARIOS
# ============================================================================

def get_complete_subscription_flow_events(
    customer_email: str = "test@propiq.com",
    tier: str = "starter",
    user_id: str = "test-user-id-123"
) -> list[Dict[str, Any]]:
    """
    Get all events for a complete subscription flow

    Returns list of events in order:
    1. checkout.session.completed
    2. customer.subscription.created
    3. invoice.payment_succeeded
    """
    customer_id = f"cus_test_{tier}_123"

    return [
        get_checkout_session_completed_event(customer_email, tier, user_id),
        get_subscription_created_event(customer_id, tier, user_id),
        get_invoice_payment_succeeded_event(customer_id, tier, TIER_PRICES[tier])
    ]


def get_subscription_cancellation_flow_events(
    customer_id: str = "cus_test_123",
    tier: str = "starter",
    user_id: str = "test-user-id-123"
) -> list[Dict[str, Any]]:
    """
    Get all events for subscription cancellation

    Returns list of events in order:
    1. customer.subscription.updated (cancel_at_period_end = true)
    2. customer.subscription.deleted (at period end)
    """
    return [
        get_subscription_updated_event(customer_id, tier, user_id, cancel_at_period_end=True),
        get_subscription_deleted_event(customer_id, tier)
    ]


def get_payment_failure_flow_events(
    customer_id: str = "cus_test_123",
    tier: str = "starter"
) -> list[Dict[str, Any]]:
    """
    Get all events for payment failure

    Returns list of events in order:
    1. invoice.payment_failed
    2. payment_intent.payment_failed
    """
    amount = TIER_PRICES[tier]

    return [
        get_invoice_payment_failed_event(customer_id, tier, amount),
        get_payment_intent_payment_failed_event(amount, customer_id)
    ]


# ============================================================================
# WEBHOOK SIGNATURE HELPERS
# ============================================================================

def generate_stripe_signature(payload: str, secret: str, timestamp: int = None) -> str:
    """
    Generate Stripe webhook signature for testing

    Args:
        payload: JSON payload as string
        secret: Webhook secret
        timestamp: Unix timestamp (default: now)

    Returns:
        Stripe-Signature header value
    """
    import hmac
    import hashlib

    if timestamp is None:
        timestamp = int(time.time())

    # Create the signed payload
    signed_payload = f"{timestamp}.{payload}"

    # Compute the signature
    signature = hmac.new(
        secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Return in Stripe format
    return f"t={timestamp},v1={signature}"


def get_test_webhook_headers(payload: str, secret: str = "whsec_test_secret") -> Dict[str, str]:
    """
    Get headers for testing webhook requests

    Args:
        payload: JSON payload as string
        secret: Webhook secret (default: test secret)

    Returns:
        Dictionary of headers including Stripe-Signature
    """
    return {
        "Content-Type": "application/json",
        "Stripe-Signature": generate_stripe_signature(payload, secret)
    }


# ============================================================================
# MOCK STRIPE API RESPONSES
# ============================================================================

def get_mock_stripe_customer(email: str, customer_id: str = None) -> Dict[str, Any]:
    """Mock Stripe customer object"""
    if customer_id is None:
        customer_id = f"cus_test_{int(time.time())}"

    return {
        "id": customer_id,
        "object": "customer",
        "email": email,
        "created": int(time.time()),
        "default_source": None,
        "subscriptions": {
            "object": "list",
            "data": []
        }
    }


def get_mock_stripe_subscription(
    customer_id: str,
    tier: str = "starter",
    status: str = "active"
) -> Dict[str, Any]:
    """Mock Stripe subscription object"""
    current_time = int(time.time())

    return {
        "id": f"sub_test_{tier}_123",
        "object": "subscription",
        "customer": customer_id,
        "status": status,
        "current_period_start": current_time,
        "current_period_end": current_time + (30 * 24 * 60 * 60),
        "cancel_at_period_end": False,
        "metadata": {
            "tier": tier
        }
    }
