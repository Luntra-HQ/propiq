"""
User Dashboard API
Provides usage analytics, statistics, and dashboard data
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timedelta
from collections import Counter
import os

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


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
# USAGE DASHBOARD
# ============================================================================

@router.get("/overview")
async def get_dashboard_overview(authorization: str = None):
    """
    Get user dashboard overview

    Returns:
    - Usage statistics (current month)
    - Subscription details
    - Recent activity
    - Quick actions
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import get_user_analyses, count_user_analyses

        # Usage stats
        current_usage = user.get("propiq_usage_count", 0)
        usage_limit = user.get("propiq_usage_limit", 5)
        percentage_used = round((current_usage / usage_limit) * 100, 1) if usage_limit > 0 else 0

        # Get recent analyses
        recent_analyses = await get_user_analyses(user_id, limit=5)

        # Calculate usage trend (last 30 days)
        total_analyses = await count_user_analyses(user_id)

        # Subscription info
        subscription_tier = user.get("subscription_tier", "free")
        subscription_status = user.get("subscription_status", "active")

        # Calculate days until reset
        last_reset = user.get("propiq_last_reset_date")
        days_until_reset = None
        if last_reset:
            try:
                reset_date = datetime.fromisoformat(last_reset)
                next_reset = reset_date + timedelta(days=30)
                days_until_reset = (next_reset - datetime.utcnow()).days
            except:
                pass

        # Quick stats
        overview = {
            "usage": {
                "current": current_usage,
                "limit": usage_limit,
                "remaining": max(0, usage_limit - current_usage),
                "percentage_used": percentage_used,
                "status": "warning" if percentage_used >= 80 else "good",
                "days_until_reset": days_until_reset
            },
            "subscription": {
                "tier": subscription_tier,
                "status": subscription_status,
                "next_billing_date": user.get("subscription_current_period_end"),
                "upgrade_available": subscription_tier != "elite"
            },
            "activity": {
                "total_analyses": total_analyses,
                "recent_analyses_count": len(recent_analyses),
                "last_analysis_date": recent_analyses[0]["created_at"] if recent_analyses else None
            },
            "recent_analyses": [
                {
                    "id": analysis["id"],
                    "address": analysis["address"],
                    "created_at": analysis["created_at"],
                    "verdict": analysis.get("analysis_result", {}).get("recommendation", {}).get("verdict", "unknown")
                }
                for analysis in recent_analyses[:5]
            ],
            "quick_actions": [
                {
                    "action": "analyze_property",
                    "label": "Analyze New Property",
                    "enabled": current_usage < usage_limit
                },
                {
                    "action": "view_history",
                    "label": "View Analysis History",
                    "enabled": total_analyses > 0
                },
                {
                    "action": "upgrade",
                    "label": f"Upgrade to {get_next_tier(subscription_tier)}",
                    "enabled": subscription_tier != "elite"
                }
            ]
        }

        return overview

    except Exception as e:
        print(f"❌ Dashboard overview error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load dashboard: {str(e)}")


@router.get("/usage-stats")
async def get_usage_statistics(authorization: str = None):
    """
    Get detailed usage statistics

    Returns:
    - Daily usage breakdown
    - Usage by property type
    - Monthly trends
    - Comparison to limits
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import get_user_analyses

        # Get all analyses for the user
        all_analyses = await get_user_analyses(user_id, limit=1000)

        # Group by date
        daily_usage = {}
        property_types = []
        verdicts = []

        for analysis in all_analyses:
            # Daily breakdown
            created_at = datetime.fromisoformat(analysis["created_at"])
            date_key = created_at.strftime("%Y-%m-%d")
            daily_usage[date_key] = daily_usage.get(date_key, 0) + 1

            # Property types
            property_type = analysis.get("analysis_result", {}).get("property", {}).get("property_type", "Unknown")
            property_types.append(property_type)

            # Verdicts
            verdict = analysis.get("analysis_result", {}).get("recommendation", {}).get("verdict", "unknown")
            verdicts.append(verdict)

        # Last 30 days usage
        today = datetime.utcnow()
        last_30_days = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(30)]
        daily_usage_chart = [
            {"date": date, "count": daily_usage.get(date, 0)}
            for date in reversed(last_30_days)
        ]

        # Property type breakdown
        property_type_stats = dict(Counter(property_types))

        # Verdict breakdown
        verdict_stats = dict(Counter(verdicts))

        # Current period usage
        last_reset = user.get("propiq_last_reset_date")
        current_period_start = datetime.fromisoformat(last_reset) if last_reset else datetime.utcnow() - timedelta(days=30)
        current_period_analyses = [
            a for a in all_analyses
            if datetime.fromisoformat(a["created_at"]) >= current_period_start
        ]

        return {
            "current_period": {
                "start_date": current_period_start.isoformat(),
                "analyses_count": len(current_period_analyses),
                "limit": user.get("propiq_usage_limit", 5),
                "remaining": max(0, user.get("propiq_usage_limit", 5) - user.get("propiq_usage_count", 0))
            },
            "daily_usage_last_30_days": daily_usage_chart,
            "property_types": property_type_stats,
            "verdict_distribution": verdict_stats,
            "total_lifetime_analyses": len(all_analyses),
            "average_per_day": round(len(all_analyses) / 30, 2) if len(all_analyses) > 0 else 0
        }

    except Exception as e:
        print(f"❌ Usage statistics error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load usage statistics: {str(e)}")


@router.get("/billing-history")
async def get_billing_history(authorization: str = None):
    """
    Get billing and payment history

    Returns:
    - Past invoices
    - Payment history
    - Upcoming charges
    """
    user = await get_current_user(authorization)

    try:
        import stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

        stripe_customer_id = user.get("subscription_stripe_customer_id")
        if not stripe_customer_id:
            return {
                "has_billing_history": False,
                "message": "No billing history available (free tier)",
                "invoices": []
            }

        # Get invoices from Stripe
        invoices = stripe.Invoice.list(customer=stripe_customer_id, limit=100)

        billing_history = []
        for invoice in invoices.data:
            billing_history.append({
                "id": invoice.id,
                "date": datetime.fromtimestamp(invoice.created).isoformat(),
                "amount": invoice.amount_paid / 100,  # Convert cents to dollars
                "currency": invoice.currency.upper(),
                "status": invoice.status,
                "paid": invoice.paid,
                "invoice_pdf": invoice.invoice_pdf,
                "description": invoice.lines.data[0].description if invoice.lines.data else None,
                "period_start": datetime.fromtimestamp(invoice.period_start).isoformat() if invoice.period_start else None,
                "period_end": datetime.fromtimestamp(invoice.period_end).isoformat() if invoice.period_end else None
            })

        # Get upcoming invoice
        upcoming_invoice = None
        try:
            upcoming = stripe.Invoice.upcoming(customer=stripe_customer_id)
            upcoming_invoice = {
                "amount": upcoming.amount_due / 100,
                "currency": upcoming.currency.upper(),
                "date": datetime.fromtimestamp(upcoming.period_end).isoformat(),
                "description": upcoming.lines.data[0].description if upcoming.lines.data else None
            }
        except stripe.error.InvalidRequestError:
            # No upcoming invoice (e.g., subscription canceled)
            pass

        return {
            "has_billing_history": True,
            "invoices": billing_history,
            "upcoming_invoice": upcoming_invoice,
            "total_paid": sum(inv["amount"] for inv in billing_history if inv["paid"]),
            "currency": billing_history[0]["currency"] if billing_history else "USD"
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        print(f"❌ Billing history error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load billing history: {str(e)}")


@router.get("/recommendations")
async def get_recommendations(authorization: str = None):
    """
    Get personalized recommendations based on usage

    Returns:
    - Tier upgrade recommendations
    - Feature suggestions
    - Usage optimization tips
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import get_user_analyses, count_user_analyses

        current_tier = user.get("subscription_tier", "free")
        current_usage = user.get("propiq_usage_count", 0)
        usage_limit = user.get("propiq_usage_limit", 5)
        total_analyses = await count_user_analyses(user_id)

        recommendations = []

        # Usage-based recommendations
        usage_percentage = (current_usage / usage_limit) * 100 if usage_limit > 0 else 0

        if usage_percentage >= 80 and current_tier != "elite":
            recommendations.append({
                "type": "upgrade",
                "priority": "high",
                "title": "Consider Upgrading Your Plan",
                "description": f"You've used {usage_percentage:.0f}% of your monthly limit. Upgrade to get more analyses.",
                "action": "upgrade",
                "suggested_tier": get_next_tier(current_tier)
            })

        if usage_percentage < 30 and current_tier != "free" and total_analyses < 10:
            recommendations.append({
                "type": "tip",
                "priority": "low",
                "title": "Make the Most of Your Subscription",
                "description": f"You're only using {usage_percentage:.0f}% of your limit. Analyze more properties to maximize value.",
                "action": "analyze_property"
            })

        # Feature recommendations
        if total_analyses >= 5 and current_tier == "free":
            recommendations.append({
                "type": "feature",
                "priority": "medium",
                "title": "Unlock Advanced Features",
                "description": "Get PDF exports, priority support, and more with a paid plan.",
                "action": "view_plans"
            })

        # Usage pattern recommendations
        recent_analyses = await get_user_analyses(user_id, limit=10)
        if len(recent_analyses) >= 5:
            property_types = [
                a.get("analysis_result", {}).get("property", {}).get("property_type", "")
                for a in recent_analyses
            ]
            if "Commercial" in str(property_types) and current_tier in ["free", "starter"]:
                recommendations.append({
                    "type": "feature",
                    "priority": "high",
                    "title": "Commercial Property Analysis",
                    "description": "Upgrade to Pro for advanced commercial property analysis features.",
                    "action": "upgrade",
                    "suggested_tier": "pro"
                })

        # Default tip if no recommendations
        if not recommendations:
            recommendations.append({
                "type": "tip",
                "priority": "low",
                "title": "You're All Set!",
                "description": "Your subscription is optimized for your usage. Keep analyzing properties!",
                "action": None
            })

        return {
            "recommendations": recommendations,
            "usage_health": "good" if usage_percentage < 80 else "warning",
            "tier_optimization": get_tier_optimization(current_tier, current_usage, usage_limit)
        }

    except Exception as e:
        print(f"❌ Recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load recommendations: {str(e)}")


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_next_tier(current_tier: str) -> str:
    """Get the next tier up from current tier"""
    tier_progression = {
        "free": "Starter",
        "starter": "Pro",
        "pro": "Elite",
        "elite": "Elite"  # Already at top
    }
    return tier_progression.get(current_tier, "Starter")


def get_tier_optimization(tier: str, usage: int, limit: int) -> dict:
    """Determine if user's tier is optimized for their usage"""
    usage_percentage = (usage / limit) * 100 if limit > 0 else 0

    if usage_percentage >= 90:
        return {
            "status": "over_utilized",
            "message": "Consider upgrading to avoid hitting limits",
            "suggested_action": "upgrade"
        }
    elif usage_percentage < 30 and tier != "free":
        return {
            "status": "under_utilized",
            "message": "You might save money on a lower tier",
            "suggested_action": "review_usage"
        }
    else:
        return {
            "status": "optimized",
            "message": "Your tier matches your usage well",
            "suggested_action": None
        }


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/health")
async def dashboard_health_check():
    """Health check for dashboard endpoints"""
    return {
        "status": "healthy",
        "endpoints": {
            "overview": "/api/v1/dashboard/overview",
            "usage_stats": "/api/v1/dashboard/usage-stats",
            "billing_history": "/api/v1/dashboard/billing-history",
            "recommendations": "/api/v1/dashboard/recommendations"
        }
    }
