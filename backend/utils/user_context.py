"""
User Context Injection System for PropIQ Support Agent
Phase 4: Personalized AI responses with user data

This module handles:
- User subscription and billing data retrieval
- Usage statistics and analytics
- Property analysis history
- User preferences and settings
- Context formatting for AI prompts
- Privacy-aware data handling

User context makes AI responses personalized and contextually relevant.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from enum import Enum
import json


class SubscriptionTier(Enum):
    """Subscription tier levels"""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    ELITE = "elite"


class UserContextManager:
    """Manage user context retrieval and formatting"""

    def __init__(self, supabase_client=None):
        """
        Initialize user context manager

        Args:
            supabase_client: Supabase client for data retrieval
        """
        self.supabase = supabase_client

    def get_full_context(
        self,
        user_id: str,
        user_email: str,
        include_history: bool = True,
        include_preferences: bool = True
    ) -> Dict[str, Any]:
        """
        Get complete user context

        Args:
            user_id: User ID
            user_email: User email
            include_history: Include analysis history
            include_preferences: Include user preferences

        Returns:
            Complete user context dict
        """
        context = {
            "user_id": user_id,
            "user_email": user_email,
            "subscription": self.get_subscription_context(user_id),
            "usage": self.get_usage_context(user_id),
            "billing": self.get_billing_context(user_id),
        }

        if include_history:
            context["history"] = self.get_analysis_history(user_id, limit=10)

        if include_preferences:
            context["preferences"] = self.get_user_preferences(user_id)

        # Add derived insights
        context["insights"] = self._generate_insights(context)

        return context

    def get_subscription_context(self, user_id: str) -> Dict[str, Any]:
        """
        Get user subscription information

        Args:
            user_id: User ID

        Returns:
            Subscription context
        """
        if not self.supabase:
            return self._get_fallback_subscription()

        try:
            # Query user subscription from database
            result = self.supabase.table("users").select(
                "subscription_tier, subscription_status, trial_ends_at, subscribed_at"
            ).eq("user_id", user_id).execute()

            if result.data and len(result.data) > 0:
                user_data = result.data[0]

                subscription_tier = user_data.get("subscription_tier", "free")
                subscription_status = user_data.get("subscription_status", "active")
                trial_ends_at = user_data.get("trial_ends_at")
                subscribed_at = user_data.get("subscribed_at")

                # Calculate trial info
                is_trial = subscription_tier == "free" and trial_ends_at is not None
                trial_days_remaining = 0

                if is_trial and trial_ends_at:
                    trial_end = datetime.fromisoformat(trial_ends_at.replace("Z", "+00:00"))
                    trial_days_remaining = max(0, (trial_end - datetime.utcnow()).days)

                return {
                    "tier": subscription_tier,
                    "status": subscription_status,
                    "is_trial": is_trial,
                    "trial_days_remaining": trial_days_remaining,
                    "subscribed_at": subscribed_at,
                    "plan_limits": self._get_plan_limits(subscription_tier)
                }

        except Exception as e:
            print(f"⚠️  Failed to get subscription context: {e}")

        return self._get_fallback_subscription()

    def get_usage_context(self, user_id: str) -> Dict[str, Any]:
        """
        Get user usage statistics

        Args:
            user_id: User ID

        Returns:
            Usage context
        """
        if not self.supabase:
            return self._get_fallback_usage()

        try:
            # Get current month's usage
            month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            # Count analyses this month
            analyses_result = self.supabase.table("property_analyses").select(
                "id", count="exact"
            ).eq("user_id", user_id).gte("created_at", month_start.isoformat()).execute()

            analyses_this_month = analyses_result.count if analyses_result else 0

            # Count total analyses
            total_analyses_result = self.supabase.table("property_analyses").select(
                "id", count="exact"
            ).eq("user_id", user_id).execute()

            total_analyses = total_analyses_result.count if total_analyses_result else 0

            # Check if used Property Advisor
            advisor_result = self.supabase.table("property_analyses").select(
                "id", count="exact"
            ).eq("user_id", user_id).eq("analysis_type", "advisor").execute()

            used_advisor = (advisor_result.count if advisor_result else 0) > 0

            # Get last activity
            last_analysis_result = self.supabase.table("property_analyses").select(
                "created_at"
            ).eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()

            last_activity = None
            days_since_activity = None

            if last_analysis_result.data and len(last_analysis_result.data) > 0:
                last_activity = last_analysis_result.data[0].get("created_at")
                if last_activity:
                    last_dt = datetime.fromisoformat(last_activity.replace("Z", "+00:00"))
                    days_since_activity = (datetime.utcnow() - last_dt).days

            return {
                "analyses_this_month": analyses_this_month,
                "total_analyses": total_analyses,
                "used_property_advisor": used_advisor,
                "last_activity": last_activity,
                "days_since_activity": days_since_activity
            }

        except Exception as e:
            print(f"⚠️  Failed to get usage context: {e}")

        return self._get_fallback_usage()

    def get_billing_context(self, user_id: str) -> Dict[str, Any]:
        """
        Get user billing information

        Args:
            user_id: User ID

        Returns:
            Billing context (privacy-aware)
        """
        if not self.supabase:
            return {}

        try:
            # Get billing info (privacy-aware - no card details)
            result = self.supabase.table("users").select(
                "billing_cycle, next_billing_date, payment_method_type"
            ).eq("user_id", user_id).execute()

            if result.data and len(result.data) > 0:
                billing_data = result.data[0]

                return {
                    "billing_cycle": billing_data.get("billing_cycle", "monthly"),
                    "next_billing_date": billing_data.get("next_billing_date"),
                    "payment_method_type": billing_data.get("payment_method_type"),  # "card", "paypal", etc.
                    "has_payment_method": billing_data.get("payment_method_type") is not None
                }

        except Exception as e:
            print(f"⚠️  Failed to get billing context: {e}")

        return {}

    def get_analysis_history(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get user's property analysis history

        Args:
            user_id: User ID
            limit: Maximum number of analyses to retrieve

        Returns:
            List of analysis summaries
        """
        if not self.supabase:
            return []

        try:
            result = self.supabase.table("property_analyses").select(
                "id, property_address, property_price, analysis_type, created_at, metrics"
            ).eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()

            if result.data:
                return [
                    {
                        "id": analysis.get("id"),
                        "address": analysis.get("property_address"),
                        "price": analysis.get("property_price"),
                        "type": analysis.get("analysis_type", "standard"),
                        "created_at": analysis.get("created_at"),
                        "metrics": analysis.get("metrics", {})
                    }
                    for analysis in result.data
                ]

        except Exception as e:
            print(f"⚠️  Failed to get analysis history: {e}")

        return []

    def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """
        Get user preferences and settings

        Args:
            user_id: User ID

        Returns:
            User preferences
        """
        if not self.supabase:
            return {}

        try:
            result = self.supabase.table("user_preferences").select("*").eq(
                "user_id", user_id
            ).execute()

            if result.data and len(result.data) > 0:
                return result.data[0]

        except Exception as e:
            print(f"⚠️  Failed to get user preferences: {e}")

        return {}

    def format_context_for_prompt(
        self,
        context: Dict[str, Any],
        verbose: bool = False
    ) -> str:
        """
        Format user context for AI prompt injection

        Args:
            context: User context dict
            verbose: Include detailed history

        Returns:
            Formatted context string for prompt
        """
        subscription = context.get("subscription", {})
        usage = context.get("usage", {})
        billing = context.get("billing", {})
        insights = context.get("insights", {})

        # Build context string
        lines = []

        lines.append("=== USER CONTEXT ===")

        # Subscription info
        tier = subscription.get("tier", "free").title()
        status = subscription.get("status", "active")
        lines.append(f"Subscription: {tier} ({status})")

        if subscription.get("is_trial"):
            days_remaining = subscription.get("trial_days_remaining", 0)
            lines.append(f"Trial Status: {days_remaining} days remaining")

        # Plan limits
        plan_limits = subscription.get("plan_limits", {})
        analyses_limit = plan_limits.get("analyses_per_month")
        if analyses_limit:
            if analyses_limit == -1:
                lines.append("Monthly Analyses: Unlimited")
            else:
                analyses_used = usage.get("analyses_this_month", 0)
                analyses_remaining = max(0, analyses_limit - analyses_used)
                lines.append(f"Monthly Analyses: {analyses_used}/{analyses_limit} used ({analyses_remaining} remaining)")

        # Features
        has_advisor = plan_limits.get("has_property_advisor", False)
        used_advisor = usage.get("used_property_advisor", False)

        if has_advisor:
            if not used_advisor:
                lines.append("✨ Has access to Property Advisor (never used)")
            else:
                lines.append("✨ Has used Property Advisor")

        # Activity
        total_analyses = usage.get("total_analyses", 0)
        days_since_activity = usage.get("days_since_activity")

        lines.append(f"Total Analyses: {total_analyses}")

        if days_since_activity is not None:
            if days_since_activity == 0:
                lines.append("Last Activity: Today")
            elif days_since_activity == 1:
                lines.append("Last Activity: Yesterday")
            else:
                lines.append(f"Last Activity: {days_since_activity} days ago")

        # Insights
        if insights.get("approaching_limit"):
            lines.append("⚠️  Approaching monthly analysis limit")

        if insights.get("trial_expiring_soon"):
            lines.append("⚠️  Trial expiring soon")

        if insights.get("inactive_user"):
            lines.append("💡 User has been inactive for a while")

        if insights.get("power_user"):
            lines.append("💪 Power user (many analyses)")

        # Recent history (if verbose)
        if verbose:
            history = context.get("history", [])
            if history:
                lines.append("\nRecent Analyses:")
                for i, analysis in enumerate(history[:3], 1):
                    address = analysis.get("address", "Unknown")
                    price = analysis.get("price", 0)
                    lines.append(f"  {i}. {address} (${price:,})")

        lines.append("=== END USER CONTEXT ===")

        return "\n".join(lines)

    def _generate_insights(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights from user context"""
        insights = {}

        subscription = context.get("subscription", {})
        usage = context.get("usage", {})

        # Approaching limit
        plan_limits = subscription.get("plan_limits", {})
        analyses_limit = plan_limits.get("analyses_per_month", 0)
        analyses_used = usage.get("analyses_this_month", 0)

        if analyses_limit > 0:
            usage_ratio = analyses_used / analyses_limit
            insights["approaching_limit"] = usage_ratio >= 0.8

        # Trial expiring soon
        if subscription.get("is_trial"):
            days_remaining = subscription.get("trial_days_remaining", 0)
            insights["trial_expiring_soon"] = days_remaining <= 2

        # Inactive user
        days_since_activity = usage.get("days_since_activity")
        if days_since_activity is not None:
            insights["inactive_user"] = days_since_activity >= 7

        # Power user
        total_analyses = usage.get("total_analyses", 0)
        insights["power_user"] = total_analyses >= 20

        # New user
        insights["new_user"] = total_analyses == 0

        # Premium user
        tier = subscription.get("tier", "free")
        insights["premium_user"] = tier in ["pro", "elite"]

        return insights

    def _get_plan_limits(self, tier: str) -> Dict[str, Any]:
        """Get plan limits for subscription tier"""
        limits = {
            "free": {
                "analyses_per_month": 3,
                "has_property_advisor": False,
                "has_export_pdf": False,
                "has_priority_support": False
            },
            "starter": {
                "analyses_per_month": 20,
                "has_property_advisor": False,
                "has_export_pdf": True,
                "has_priority_support": False
            },
            "pro": {
                "analyses_per_month": 100,
                "has_property_advisor": True,
                "has_export_pdf": True,
                "has_priority_support": False
            },
            "elite": {
                "analyses_per_month": -1,  # Unlimited
                "has_property_advisor": True,
                "has_export_pdf": True,
                "has_priority_support": True
            }
        }

        return limits.get(tier, limits["free"])

    def _get_fallback_subscription(self) -> Dict[str, Any]:
        """Fallback subscription context when DB unavailable"""
        return {
            "tier": "free",
            "status": "active",
            "is_trial": True,
            "trial_days_remaining": 7,
            "plan_limits": self._get_plan_limits("free")
        }

    def _get_fallback_usage(self) -> Dict[str, Any]:
        """Fallback usage context when DB unavailable"""
        return {
            "analyses_this_month": 0,
            "total_analyses": 0,
            "used_property_advisor": False,
            "last_activity": None,
            "days_since_activity": None
        }


class ContextualResponseGenerator:
    """Generate contextual responses based on user data"""

    @staticmethod
    def generate_personalized_greeting(context: Dict[str, Any]) -> str:
        """Generate personalized greeting based on user context"""
        subscription = context.get("subscription", {})
        usage = context.get("usage", {})
        insights = context.get("insights", {})

        tier = subscription.get("tier", "free").title()
        total_analyses = usage.get("total_analyses", 0)

        # New user
        if insights.get("new_user"):
            return f"Welcome to PropIQ! I'm here to help you get started with your {tier} plan. Ready to analyze your first property?"

        # Trial expiring soon
        if insights.get("trial_expiring_soon"):
            days = subscription.get("trial_days_remaining", 0)
            return f"Hi! Your trial expires in {days} day{'s' if days != 1 else ''}. How can I help you today?"

        # Approaching limit
        if insights.get("approaching_limit"):
            return f"Hi! You're close to your monthly limit. How can I help? (Consider upgrading for more analyses!)"

        # Power user
        if insights.get("power_user"):
            return f"Welcome back! You've analyzed {total_analyses} properties - you're a PropIQ pro! What can I help with?"

        # Inactive user
        if insights.get("inactive_user"):
            days = usage.get("days_since_activity", 0)
            return f"Welcome back! It's been {days} days. We've added some great new features. How can I help?"

        # Default
        return f"Hi! How can I help you with your {tier} account today?"

    @staticmethod
    def suggest_next_action(context: Dict[str, Any]) -> Optional[str]:
        """Suggest next action based on user context"""
        subscription = context.get("subscription", {})
        usage = context.get("usage", {})
        insights = context.get("insights", {})

        # New user - suggest first analysis
        if insights.get("new_user"):
            return "analyze_first_property"

        # Has advisor access but never used
        plan_limits = subscription.get("plan_limits", {})
        has_advisor = plan_limits.get("has_property_advisor", False)
        used_advisor = usage.get("used_property_advisor", False)

        if has_advisor and not used_advisor:
            return "try_property_advisor"

        # Approaching limit - suggest upgrade
        if insights.get("approaching_limit"):
            return "upgrade_plan"

        # Trial expiring - suggest upgrade
        if insights.get("trial_expiring_soon"):
            return "upgrade_before_trial_ends"

        return None


# Convenience functions

def get_user_context(
    user_id: str,
    user_email: str,
    supabase_client=None
) -> Dict[str, Any]:
    """Quick function to get user context"""
    manager = UserContextManager(supabase_client)
    return manager.get_full_context(user_id, user_email)


def format_context_for_ai(
    user_id: str,
    user_email: str,
    supabase_client=None,
    verbose: bool = False
) -> str:
    """Quick function to get formatted context for AI prompt"""
    manager = UserContextManager(supabase_client)
    context = manager.get_full_context(user_id, user_email)
    return manager.format_context_for_prompt(context, verbose=verbose)


def get_personalized_greeting(
    user_id: str,
    user_email: str,
    supabase_client=None
) -> str:
    """Quick function to get personalized greeting"""
    manager = UserContextManager(supabase_client)
    context = manager.get_full_context(user_id, user_email, include_history=False)
    return ContextualResponseGenerator.generate_personalized_greeting(context)


# Health check
def health_check() -> Dict[str, Any]:
    """Check user context system status"""
    return {
        "subscription_tiers": [tier.value for tier in SubscriptionTier],
        "features": {
            "subscription_context": True,
            "usage_tracking": True,
            "billing_context": True,
            "analysis_history": True,
            "user_preferences": True,
            "personalized_greetings": True,
            "contextual_insights": True
        }
    }
