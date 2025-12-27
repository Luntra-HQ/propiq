# app/api/payment.py
"""
Stripe Payment Integration for PropIQ
Handles checkout session creation and subscription management

⚠️  DEPRECATED (Dec 26, 2025): This entire module is deprecated
⚠️  Stripe webhooks now handled by Convex: convex/http.ts:/stripe/webhook
⚠️  Checkout sessions now created via Convex: convex/payments.ts:createCheckoutSession
⚠️  Subscription updates handled via Convex: convex/payments.ts:handleSubscriptionSuccess
⚠️  This FastAPI router is kept for legacy support only - DO NOT USE FOR NEW FEATURES

MIGRATION STATUS:
✅ Stripe webhook configured to Convex endpoint
✅ All payment processing happens in Convex
✅ Dual auth system (Convex/Supabase) resolved - using Convex only
✅ Webhook path fixed: /stripe/webhook (was /stripe-webhook)
✅ Signature verification added to Convex webhook handler

If you need to make payment-related changes, edit:
- convex/http.ts (webhook handler)
- convex/payments.ts (payment mutations and actions)
"""

from fastapi import APIRouter, HTTPException, Header, Depends, Request
from pydantic import BaseModel, EmailStr
import stripe
import os
import jwt
from dotenv import load_dotenv
from config.logging_config import get_logger

logger = get_logger(__name__)

# Supabase database import removed - now using Convex exclusively
# Previous code attempted to sync subscriptions to Supabase, causing dual auth issues
# All subscription state is now managed in Convex database only

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api/v1/stripe", tags=["payments"])

# Stripe Configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID")  # Default price ID from .env
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# JWT Configuration (must match auth.py)
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"

class CheckoutRequest(BaseModel):
    priceId: str  # Stripe price ID for the selected plan
    tier: str  # "starter", "pro", or "elite"

class CheckoutResponse(BaseModel):
    success: bool
    sessionId: str
    checkoutUrl: str

class SubscriptionStatusResponse(BaseModel):
    active: bool
    tier: str = None
    expiresAt: str = None

class PaymentCheckRequest(BaseModel):
    user_id: str  # or email if you identify users that way

def verify_token(authorization: str = Header(None)) -> dict:
    """Verify JWT token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

@router.post("/create-checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CheckoutRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Create Stripe checkout session for subscription purchase

    This endpoint:
    1. Verifies user authentication
    2. Creates a Stripe checkout session
    3. Returns checkout URL for redirect

    Requires:
    - Authorization: Bearer <jwt_token>

    Args:
        request: CheckoutRequest with priceId and tier
        token_payload: Decoded JWT token (injected by verify_token)

    Returns:
        CheckoutResponse with sessionId and checkoutUrl
    """

    user_email = token_payload.get("email")
    user_id = token_payload.get("sub")

    if not stripe.api_key:
        raise HTTPException(
            status_code=500,
            detail="Stripe not configured"
        )

    try:
        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            customer_email=user_email,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": request.priceId,
                    "quantity": 1
                }
            ],
            mode="subscription",
            success_url="https://propiq.luntra.one/dashboard?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://propiq.luntra.one/pricing?canceled=true",
            metadata={
                "user_id": user_id,
                "user_email": user_email,
                "tier": request.tier
            },
            subscription_data={
                "metadata": {
                    "user_id": user_id,
                    "tier": request.tier
                }
            }
        )

        return CheckoutResponse(
            success=True,
            sessionId=session.id,
            checkoutUrl=session.url
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create checkout session: {str(e)}"
        )

@router.get("/subscription")
async def get_subscription_status(
    token_payload: dict = Depends(verify_token)
):
    """
    Get user's current subscription status

    Requires:
    - Authorization: Bearer <jwt_token>

    Returns:
        SubscriptionStatusResponse with active status and details
    """

    user_email = token_payload.get("email")

    try:
        # Find customer by email
        customers = stripe.Customer.list(email=user_email, limit=1)

        if not customers.data:
            return SubscriptionStatusResponse(active=False)

        customer = customers.data[0]

        # Get active subscriptions
        subscriptions = stripe.Subscription.list(
            customer=customer.id,
            status='active',
            limit=1
        )

        if not subscriptions.data:
            return SubscriptionStatusResponse(active=False)

        subscription = subscriptions.data[0]

        return SubscriptionStatusResponse(
            active=True,
            tier=subscription.metadata.get("tier", "unknown"),
            expiresAt=str(subscription.current_period_end)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch subscription: {str(e)}"
        )

@router.post("/check-subscription/")
async def check_subscription(data: PaymentCheckRequest):
    """Legacy endpoint for checking subscription status"""
    try:
        customers = stripe.Customer.list(email=data.user_id)
        if not customers.data:
            return {"active": False}

        customer_id = customers.data[0].id
        subscriptions = stripe.Subscription.list(customer=customer_id, status='active')
        return {"active": bool(subscriptions.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events

    This endpoint:
    1. Verifies webhook signature
    2. Processes payment events
    3. Sends Slack notifications for key events
    4. Updates user subscription in database

    Events handled:
    - checkout.session.completed: User completed payment
    - invoice.payment_succeeded: Recurring payment succeeded
    - invoice.payment_failed: Payment failed (requires action!)
    - customer.subscription.deleted: User canceled subscription
    """

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Webhook secret not configured"
        )

    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Import Slack notifications
    try:
        from utils.slack import (
            notify_user_upgrade,
            notify_payment_success,
            notify_payment_failed
        )
        slack_available = True
    except Exception as e:
        print(f"⚠️  Slack notifications not available: {e}")
        slack_available = False

    # Handle the event
    event_type = event["type"]
    event_data = event["data"]["object"]

    try:
        # Checkout session completed - New subscription
        if event_type == "checkout.session.completed":
            customer_email = event_data.get("customer_email")
            customer_id = event_data.get("customer")
            metadata = event_data.get("metadata", {})

            user_id = metadata.get("user_id")
            tier = metadata.get("tier", "unknown")
            amount_total = event_data.get("amount_total", 0) / 100  # Convert cents to dollars

            logger.info(f"Checkout completed: {customer_email} → {tier} (${amount_total})")

            # Send Slack notification
            if slack_available and customer_email:
                notify_user_upgrade(
                    email=customer_email,
                    from_tier="free",
                    to_tier=tier,
                    amount=amount_total
                )

            # ⚠️  DEPRECATED: Subscription updates now handled by Convex webhook
            # This FastAPI webhook endpoint should NOT be configured in Stripe dashboard
            # All subscription updates happen in: convex/http.ts:/stripe/webhook
            #
            # MIGRATION COMPLETE (Dec 26, 2025):
            # - Stripe webhook configured to point to Convex endpoint
            # - Convex handles all subscription activation (convex/payments.ts:handleSubscriptionSuccess)
            # - Supabase database module deprecated in favor of Convex database
            #
            # If you're seeing this code execute, check your Stripe webhook configuration!
            # It should point to: https://mild-tern-361.convex.site/stripe/webhook
            logger.warning("⚠️  DEPRECATED WEBHOOK CALLED - This endpoint should not be in use!")
            logger.warning("⚠️  Check Stripe dashboard webhook configuration")
            logger.warning(f"⚠️  Payment for {customer_email} may not be processed correctly")

        # Invoice payment succeeded - Recurring payment
        elif event_type == "invoice.payment_succeeded":
            customer_id = event_data.get("customer")
            subscription_id = event_data.get("subscription")
            amount_paid = event_data.get("amount_paid", 0) / 100

            # Get customer details
            customer = stripe.Customer.retrieve(customer_id)
            customer_email = customer.get("email")

            # Get subscription details
            subscription = stripe.Subscription.retrieve(subscription_id)
            tier = subscription.metadata.get("tier", "unknown")

            print(f"✅ Payment succeeded: {customer_email} - {tier} (${amount_paid})")

            # Send Slack notification
            if slack_available and customer_email:
                notify_payment_success(
                    email=customer_email,
                    tier=tier,
                    amount=amount_paid,
                    interval="monthly"
                )

        # Invoice payment failed - URGENT: User needs attention
        elif event_type == "invoice.payment_failed":
            customer_id = event_data.get("customer")
            subscription_id = event_data.get("subscription")
            amount_due = event_data.get("amount_due", 0) / 100

            # Get customer details
            customer = stripe.Customer.retrieve(customer_id)
            customer_email = customer.get("email")

            # Get subscription details
            subscription = stripe.Subscription.retrieve(subscription_id)
            tier = subscription.metadata.get("tier", "unknown")

            # Get failure reason
            charge = event_data.get("charge")
            failure_message = "Unknown"
            if charge:
                charge_obj = stripe.Charge.retrieve(charge)
                failure_message = charge_obj.get("failure_message", "Card declined")

            logger.warning(f"Payment failed: {customer_email} - {tier} (${amount_due}) - {failure_message}")

            # Send Slack notification (URGENT)
            if slack_available and customer_email:
                notify_payment_failed(
                    email=customer_email,
                    tier=tier,
                    reason=failure_message,
                    amount=amount_due
                )

            # Update user status to "past_due" in database
            if DATABASE_AVAILABLE and customer_email:
                try:
                    user = get_user_by_email(customer_email)
                    if user:
                        update_user_subscription(
                            user_id=user["id"],
                            tier=tier,  # Keep current tier
                            status="past_due"
                        )
                        logger.info(f"Marked subscription as past_due for {customer_email}")
                except Exception as e:
                    logger.error(f"Failed to update payment_failed status: {e}")

        # Customer subscription deleted - User canceled
        elif event_type == "customer.subscription.deleted":
            subscription_id = event_data.get("id")
            customer_id = event_data.get("customer")

            # Get customer details
            customer = stripe.Customer.retrieve(customer_id)
            customer_email = customer.get("email")
            tier = event_data.get("metadata", {}).get("tier", "unknown")

            logger.info(f"Subscription canceled: {customer_email} - {tier}")

            # Downgrade user to free tier in database
            if DATABASE_AVAILABLE and customer_email:
                try:
                    user = get_user_by_email(customer_email)
                    if user:
                        update_user_subscription(
                            user_id=user["id"],
                            tier="free",
                            status="canceled"
                        )
                        logger.info(f"Downgraded {customer_email} to free tier")
                except Exception as e:
                    logger.error(f"Failed to downgrade subscription: {e}")

        else:
            print(f"ℹ️  Unhandled event type: {event_type}")

    except Exception as e:
        print(f"❌ Error processing webhook event: {str(e)}")
        # Don't raise exception - return 200 to Stripe to prevent retries

    return {"status": "success"}


@router.get("/health")
async def health_check():
    """Health check endpoint for Stripe integration"""
    has_stripe_key = bool(stripe.api_key)
    has_price_id = bool(STRIPE_PRICE_ID)
    has_webhook_secret = bool(STRIPE_WEBHOOK_SECRET)

    return {
        "status": "healthy" if (has_stripe_key and has_price_id) else "degraded",
        "stripe_configured": has_stripe_key,
        "default_price_configured": has_price_id,
        "webhook_configured": has_webhook_secret
    }
