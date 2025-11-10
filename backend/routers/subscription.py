"""
Subscription Management API
Handles subscription upgrades, downgrades, and cancellations
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
import stripe
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/v1/subscription", tags=["subscription"])

# Stripe Configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PRICE_IDS = {
    "starter": os.getenv("STRIPE_PRICE_ID_STARTER"),
    "pro": os.getenv("STRIPE_PRICE_ID_PRO"),
    "elite": os.getenv("STRIPE_PRICE_ID_ELITE")
}

TIER_LIMITS = {
    "free": {"analyses": 5, "price": 0},
    "starter": {"analyses": 25, "price": 29},
    "pro": {"analyses": 100, "price": 79},
    "elite": {"analyses": 500, "price": 149}
}


# ============================================================================
# MODELS
# ============================================================================

class SubscriptionUpgradeRequest(BaseModel):
    """Request to upgrade subscription"""
    target_tier: str  # starter, pro, or elite
    payment_method_id: Optional[str] = None  # For first-time subscribers


class SubscriptionChangeResponse(BaseModel):
    """Response for subscription changes"""
    success: bool
    message: str
    subscription: Dict[str, Any]
    next_billing_date: Optional[str] = None
    proration_amount: Optional[float] = None


class CancellationRequest(BaseModel):
    """Request to cancel subscription"""
    reason: Optional[str] = None
    feedback: Optional[str] = None
    cancel_immediately: bool = False  # If true, cancel now; if false, at period end


# ============================================================================
# AUTHENTICATION HELPER
# ============================================================================

async def get_current_user(authorization: str = None) -> dict:
    """Get current user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    try:
        import jwt
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        JWT_SECRET = os.getenv("JWT_SECRET")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

        # Get user from database
        from database_supabase import get_user_by_id
        user = await get_user_by_id(payload.get("sub"))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# ============================================================================
# SUBSCRIPTION UPGRADE
# ============================================================================

@router.post("/upgrade", response_model=SubscriptionChangeResponse)
async def upgrade_subscription(
    request: SubscriptionUpgradeRequest,
    authorization: str = None
):
    """
    Upgrade user's subscription to a higher tier

    This endpoint:
    1. Validates the target tier
    2. Creates Stripe checkout session (if first subscription)
    3. Updates existing subscription (if already subscribed)
    4. Calculates proration
    5. Updates user record

    Args:
        target_tier: One of: starter, pro, elite
        payment_method_id: Required for first-time subscribers

    Returns:
        Subscription details with next billing date and proration
    """
    user = await get_current_user(authorization)
    user_id = user["id"]
    current_tier = user.get("subscription_tier", "free")

    # Validate target tier
    if request.target_tier not in ["starter", "pro", "elite"]:
        raise HTTPException(status_code=400, detail="Invalid tier. Choose: starter, pro, or elite")

    # Check if already at or above target tier
    tier_order = ["free", "starter", "pro", "elite"]
    if tier_order.index(current_tier) >= tier_order.index(request.target_tier):
        raise HTTPException(
            status_code=400,
            detail=f"Already at {current_tier} tier. Cannot upgrade to {request.target_tier}"
        )

    try:
        # Import database functions
        from database_supabase import update_user_subscription

        # Case 1: First-time subscriber (free -> paid)
        if current_tier == "free":
            if not request.payment_method_id:
                # Create checkout session
                price_id = STRIPE_PRICE_IDS.get(request.target_tier)
                if not price_id:
                    raise HTTPException(status_code=500, detail="Stripe price ID not configured")

                checkout_session = stripe.checkout.Session.create(
                    customer_email=user["email"],
                    payment_method_types=["card"],
                    line_items=[{
                        "price": price_id,
                        "quantity": 1
                    }],
                    mode="subscription",
                    success_url=f"{os.getenv('APP_URL')}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
                    cancel_url=f"{os.getenv('APP_URL')}/subscription/cancel",
                    metadata={
                        "user_id": user_id,
                        "tier": request.target_tier
                    }
                )

                return SubscriptionChangeResponse(
                    success=True,
                    message="Checkout session created. Redirect user to complete payment.",
                    subscription={
                        "checkout_url": checkout_session.url,
                        "session_id": checkout_session.id
                    }
                )
            else:
                # Create customer and subscription with payment method
                customer = stripe.Customer.create(
                    email=user["email"],
                    payment_method=request.payment_method_id,
                    invoice_settings={"default_payment_method": request.payment_method_id},
                    metadata={"user_id": user_id}
                )

                subscription = stripe.Subscription.create(
                    customer=customer.id,
                    items=[{"price": STRIPE_PRICE_IDS[request.target_tier]}],
                    metadata={"user_id": user_id, "tier": request.target_tier}
                )

                # Update user in database
                await update_user_subscription(
                    user_id=user_id,
                    tier=request.target_tier,
                    status="active",
                    stripe_customer_id=customer.id,
                    stripe_subscription_id=subscription.id,
                    usage_limit=TIER_LIMITS[request.target_tier]["analyses"],
                    current_period_end=datetime.fromtimestamp(subscription.current_period_end).isoformat()
                )

                return SubscriptionChangeResponse(
                    success=True,
                    message=f"Successfully upgraded to {request.target_tier} tier",
                    subscription={
                        "tier": request.target_tier,
                        "status": "active",
                        "stripe_subscription_id": subscription.id
                    },
                    next_billing_date=datetime.fromtimestamp(subscription.current_period_end).isoformat()
                )

        # Case 2: Existing subscriber (upgrade within paid tiers)
        else:
            stripe_subscription_id = user.get("subscription_stripe_subscription_id")
            if not stripe_subscription_id:
                raise HTTPException(status_code=400, detail="No active subscription found")

            # Get current subscription
            subscription = stripe.Subscription.retrieve(stripe_subscription_id)

            # Update subscription with new price (prorated)
            updated_subscription = stripe.Subscription.modify(
                stripe_subscription_id,
                items=[{
                    "id": subscription["items"]["data"][0].id,
                    "price": STRIPE_PRICE_IDS[request.target_tier]
                }],
                proration_behavior="always_invoice",  # Charge proration immediately
                metadata={"tier": request.target_tier}
            )

            # Calculate proration amount (from upcoming invoice)
            upcoming_invoice = stripe.Invoice.upcoming(customer=subscription.customer)
            proration_amount = upcoming_invoice.amount_due / 100  # Convert cents to dollars

            # Update user in database
            await update_user_subscription(
                user_id=user_id,
                tier=request.target_tier,
                status="active",
                usage_limit=TIER_LIMITS[request.target_tier]["analyses"],
                current_period_end=datetime.fromtimestamp(updated_subscription.current_period_end).isoformat()
            )

            return SubscriptionChangeResponse(
                success=True,
                message=f"Successfully upgraded from {current_tier} to {request.target_tier}",
                subscription={
                    "tier": request.target_tier,
                    "status": "active",
                    "stripe_subscription_id": stripe_subscription_id
                },
                next_billing_date=datetime.fromtimestamp(updated_subscription.current_period_end).isoformat(),
                proration_amount=proration_amount
            )

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        print(f"❌ Subscription upgrade error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upgrade subscription: {str(e)}")


# ============================================================================
# SUBSCRIPTION DOWNGRADE
# ============================================================================

@router.post("/downgrade", response_model=SubscriptionChangeResponse)
async def downgrade_subscription(
    target_tier: str,
    authorization: str = None
):
    """
    Downgrade user's subscription to a lower tier

    This endpoint:
    1. Validates the target tier
    2. Schedules downgrade for end of billing period
    3. User keeps current features until period ends
    4. No refunds for early downgrade

    Args:
        target_tier: One of: free, starter, pro

    Returns:
        Confirmation with effective date
    """
    user = await get_current_user(authorization)
    user_id = user["id"]
    current_tier = user.get("subscription_tier", "free")

    # Validate target tier
    valid_tiers = ["free", "starter", "pro", "elite"]
    if target_tier not in valid_tiers:
        raise HTTPException(status_code=400, detail=f"Invalid tier. Choose from: {', '.join(valid_tiers)}")

    # Check if actually downgrading
    tier_order = ["free", "starter", "pro", "elite"]
    if tier_order.index(current_tier) <= tier_order.index(target_tier):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot downgrade from {current_tier} to {target_tier}. Use /upgrade instead."
        )

    try:
        from database_supabase import update_user_subscription

        # Downgrade to free
        if target_tier == "free":
            stripe_subscription_id = user.get("subscription_stripe_subscription_id")
            if not stripe_subscription_id:
                raise HTTPException(status_code=400, detail="No active subscription to cancel")

            # Cancel subscription at period end
            subscription = stripe.Subscription.modify(
                stripe_subscription_id,
                cancel_at_period_end=True,
                metadata={"downgrade_to": "free"}
            )

            # Update user record (but keep current tier until period ends)
            period_end = datetime.fromtimestamp(subscription.current_period_end)

            return SubscriptionChangeResponse(
                success=True,
                message=f"Subscription will be downgraded to Free on {period_end.strftime('%B %d, %Y')}. You'll keep {current_tier} access until then.",
                subscription={
                    "tier": current_tier,  # Keep current tier
                    "status": "active",
                    "cancel_at_period_end": True,
                    "downgrade_scheduled": target_tier
                },
                next_billing_date=period_end.isoformat()
            )

        # Downgrade within paid tiers
        else:
            stripe_subscription_id = user.get("subscription_stripe_subscription_id")
            if not stripe_subscription_id:
                raise HTTPException(status_code=400, detail="No active subscription found")

            subscription = stripe.Subscription.retrieve(stripe_subscription_id)

            # Schedule downgrade at period end (no refund)
            # We'll update the subscription when the period ends via webhook
            # For now, just mark the intent

            period_end = datetime.fromtimestamp(subscription.current_period_end)

            # We can use subscription metadata to track the scheduled downgrade
            stripe.Subscription.modify(
                stripe_subscription_id,
                metadata={
                    "tier": current_tier,
                    "downgrade_scheduled": target_tier,
                    "downgrade_at": period_end.isoformat()
                }
            )

            return SubscriptionChangeResponse(
                success=True,
                message=f"Subscription will be downgraded from {current_tier} to {target_tier} on {period_end.strftime('%B %d, %Y')}. You'll keep {current_tier} access until then.",
                subscription={
                    "tier": current_tier,
                    "status": "active",
                    "downgrade_scheduled": target_tier
                },
                next_billing_date=period_end.isoformat()
            )

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        print(f"❌ Subscription downgrade error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to downgrade subscription: {str(e)}")


# ============================================================================
# SUBSCRIPTION CANCELLATION
# ============================================================================

@router.post("/cancel")
async def cancel_subscription(
    request: CancellationRequest,
    authorization: str = None
):
    """
    Cancel user's subscription

    This endpoint:
    1. Cancels Stripe subscription
    2. Can cancel immediately or at period end
    3. Collects cancellation feedback
    4. Sends confirmation email

    Args:
        reason: Optional cancellation reason
        feedback: Optional user feedback
        cancel_immediately: If true, lose access now; if false, at period end

    Returns:
        Cancellation confirmation
    """
    user = await get_current_user(authorization)
    user_id = user["id"]
    current_tier = user.get("subscription_tier", "free")

    if current_tier == "free":
        raise HTTPException(status_code=400, detail="No active paid subscription to cancel")

    try:
        from database_supabase import update_user_subscription

        stripe_subscription_id = user.get("subscription_stripe_subscription_id")
        if not stripe_subscription_id:
            raise HTTPException(status_code=400, detail="No active subscription found")

        # Log cancellation reason
        if request.reason or request.feedback:
            print(f"📊 Cancellation feedback from {user['email']}:")
            if request.reason:
                print(f"   Reason: {request.reason}")
            if request.feedback:
                print(f"   Feedback: {request.feedback}")

        if request.cancel_immediately:
            # Cancel immediately
            subscription = stripe.Subscription.delete(stripe_subscription_id)

            # Update user to free tier immediately
            await update_user_subscription(
                user_id=user_id,
                tier="free",
                status="canceled",
                stripe_subscription_id=None,
                usage_limit=TIER_LIMITS["free"]["analyses"]
            )

            return {
                "success": True,
                "message": "Subscription canceled immediately. Your account has been downgraded to Free tier.",
                "effective_date": datetime.utcnow().isoformat(),
                "new_tier": "free"
            }
        else:
            # Cancel at period end
            subscription = stripe.Subscription.modify(
                stripe_subscription_id,
                cancel_at_period_end=True,
                metadata={
                    "cancellation_reason": request.reason or "Not provided",
                    "cancellation_feedback": request.feedback or "None"
                }
            )

            period_end = datetime.fromtimestamp(subscription.current_period_end)

            return {
                "success": True,
                "message": f"Subscription will be canceled on {period_end.strftime('%B %d, %Y')}. You'll keep {current_tier} access until then.",
                "effective_date": period_end.isoformat(),
                "current_tier": current_tier,
                "access_until": period_end.isoformat()
            }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        print(f"❌ Subscription cancellation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel subscription: {str(e)}")


# ============================================================================
# GET SUBSCRIPTION DETAILS
# ============================================================================

@router.get("/details")
async def get_subscription_details(authorization: str = None):
    """
    Get current user's subscription details

    Returns:
        - Current tier
        - Usage statistics
        - Billing information
        - Next billing date
        - Cancellation status
    """
    user = await get_current_user(authorization)

    details = {
        "subscription": {
            "tier": user.get("subscription_tier", "free"),
            "status": user.get("subscription_status", "active"),
            "stripe_customer_id": user.get("subscription_stripe_customer_id"),
            "stripe_subscription_id": user.get("subscription_stripe_subscription_id")
        },
        "usage": {
            "current_usage": user.get("propiq_usage_count", 0),
            "usage_limit": user.get("propiq_usage_limit", 5),
            "percentage_used": round((user.get("propiq_usage_count", 0) / user.get("propiq_usage_limit", 5)) * 100, 1),
            "last_reset": user.get("propiq_last_reset_date")
        },
        "billing": {
            "current_period_start": user.get("subscription_current_period_start"),
            "current_period_end": user.get("subscription_current_period_end"),
            "next_billing_date": user.get("subscription_current_period_end")
        },
        "tier_info": TIER_LIMITS.get(user.get("subscription_tier", "free"), TIER_LIMITS["free"])
    }

    # If has Stripe subscription, get more details
    if user.get("subscription_stripe_subscription_id"):
        try:
            subscription = stripe.Subscription.retrieve(user["subscription_stripe_subscription_id"])
            details["billing"]["cancel_at_period_end"] = subscription.cancel_at_period_end

            if subscription.get("metadata", {}).get("downgrade_scheduled"):
                details["subscription"]["downgrade_scheduled"] = subscription["metadata"]["downgrade_scheduled"]

        except stripe.error.StripeError:
            pass  # Subscription might be canceled

    return details


# ============================================================================
# AVAILABLE PLANS
# ============================================================================

@router.get("/plans")
async def get_available_plans():
    """
    Get all available subscription plans

    Returns:
        List of plans with features and pricing
    """
    return {
        "plans": [
            {
                "tier": "free",
                "name": "Free",
                "price": 0,
                "billing_period": "month",
                "analyses_per_month": 5,
                "features": [
                    "5 property analyses per month",
                    "Basic market analysis",
                    "Investment metrics",
                    "Email support"
                ]
            },
            {
                "tier": "starter",
                "name": "Starter",
                "price": 29,
                "billing_period": "month",
                "analyses_per_month": 25,
                "features": [
                    "25 property analyses per month",
                    "Advanced market insights",
                    "Detailed investment metrics",
                    "Priority email support",
                    "Analysis history"
                ],
                "popular": True
            },
            {
                "tier": "pro",
                "name": "Pro",
                "price": 79,
                "billing_period": "month",
                "analyses_per_month": 100,
                "features": [
                    "100 property analyses per month",
                    "Commercial property analysis",
                    "Multi-family analysis",
                    "Export to PDF",
                    "API access",
                    "Priority support",
                    "Advanced analytics"
                ]
            },
            {
                "tier": "elite",
                "name": "Elite",
                "price": 149,
                "billing_period": "month",
                "analyses_per_month": 500,
                "features": [
                    "500 property analyses per month",
                    "All Pro features",
                    "Custom analysis parameters",
                    "White-label reports",
                    "Dedicated account manager",
                    "Phone support",
                    "Team collaboration (coming soon)"
                ]
            }
        ]
    }


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/health")
async def subscription_health_check():
    """Health check for subscription endpoints"""
    return {
        "status": "healthy",
        "stripe_configured": bool(stripe.api_key and "sk_" in stripe.api_key),
        "price_ids_configured": all(STRIPE_PRICE_IDS.values()),
        "endpoints": {
            "upgrade": "/api/v1/subscription/upgrade",
            "downgrade": "/api/v1/subscription/downgrade",
            "cancel": "/api/v1/subscription/cancel",
            "details": "/api/v1/subscription/details",
            "plans": "/api/v1/subscription/plans"
        }
    }
