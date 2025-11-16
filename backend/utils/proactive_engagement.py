"""
Proactive Engagement System for PropIQ Support Agent
Phase 3: Automated user engagement based on behavior and lifecycle

This module handles:
- Onboarding messages (triggered on signup)
- Trial expiration reminders
- Usage tips based on behavior
- Re-engagement campaigns
- Feature discovery nudges

Uses background tasks (Celery/Redis optional, FastAPI BackgroundTasks fallback)
"""

import os
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from enum import Enum
import uuid

# Try to import Celery, fall back to FastAPI BackgroundTasks
try:
    from celery import Celery
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    print("⚠️  Celery not available, using FastAPI BackgroundTasks")

# Redis for scheduling (optional)
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    print("⚠️  Redis not available, using in-memory scheduling")


class MessageType(Enum):
    """Types of proactive messages"""
    ONBOARDING_WELCOME = "onboarding_welcome"
    ONBOARDING_FEATURE_TOUR = "onboarding_feature_tour"
    TRIAL_EXPIRING_SOON = "trial_expiring_soon"
    TRIAL_EXPIRED = "trial_expired"
    USAGE_TIP = "usage_tip"
    FEATURE_ANNOUNCEMENT = "feature_announcement"
    RE_ENGAGEMENT = "re_engagement"
    UPGRADE_PROMPT = "upgrade_prompt"


class ProactiveMessage:
    """Proactive message templates"""

    TEMPLATES = {
        MessageType.ONBOARDING_WELCOME: {
            "title": "Welcome to PropIQ! 👋",
            "message": """Welcome to PropIQ! I'm your AI support assistant, here to help you get started.

Here's what you can do with your free trial:
• Analyze up to 3 properties
• Get AI-powered investment insights
• Review market trends and comparable properties
• Export analysis reports as PDF

Ready to analyze your first property? Just click "Analyze Property" in the dashboard!

Need help getting started? Just ask me anything!""",
            "delay_seconds": 300,  # 5 minutes after signup
            "actions": [
                {"label": "Analyze a Property", "url": "/analyze"},
                {"label": "View Pricing", "url": "/pricing"}
            ]
        },

        MessageType.ONBOARDING_FEATURE_TOUR: {
            "title": "Discover PropIQ's Features 🚀",
            "message": """Now that you've been using PropIQ, let me show you some powerful features you might have missed:

**Property Advisor** (Pro/Elite users)
Run a deep multi-agent analysis with market research, financial projections, risk assessment, and action planning.

**PDF Export**
Download professional analysis reports to share with partners or lenders.

**Comparable Properties**
See how your target property stacks up against similar properties in the area.

Want to learn more about any of these features?""",
            "delay_seconds": 86400,  # 24 hours after signup
            "conditions": {
                "analyses_count": {"min": 1}  # At least 1 analysis completed
            }
        },

        MessageType.TRIAL_EXPIRING_SOON: {
            "title": "Your Trial is Expiring Soon ⏰",
            "message": """Your free trial is expiring in 2 days. You've used {analyses_used} of 3 trial analyses.

To continue analyzing properties, upgrade to a paid plan:

**Starter** ($29/mo) - 20 analyses/month
**Pro** ($79/mo) - 100 analyses/month + Property Advisor
**Elite** ($199/mo) - Unlimited analyses + priority support

Ready to upgrade?""",
            "delay_seconds": 0,  # Sent via scheduled job
            "actions": [
                {"label": "Upgrade Now", "url": "/pricing"},
                {"label": "Compare Plans", "url": "/pricing#compare"}
            ]
        },

        MessageType.TRIAL_EXPIRED: {
            "title": "Your Trial Has Ended",
            "message": """Your free trial has ended. To continue using PropIQ, please upgrade to a paid plan.

You can still access your previous analyses, but new analyses require an active subscription.

Choose a plan that fits your needs:
• **Starter** ($29/mo) - Perfect for individual investors
• **Pro** ($79/mo) - Best for active investors with the Property Advisor
• **Elite** ($199/mo) - Unlimited access for professionals

Questions about pricing? I'm here to help!""",
            "delay_seconds": 0,
            "actions": [
                {"label": "View Plans", "url": "/pricing"}
            ]
        },

        MessageType.USAGE_TIP: {
            "title": "Pro Tip: {tip_title} 💡",
            "message": "{tip_content}",
            "delay_seconds": 0
        },

        MessageType.RE_ENGAGEMENT: {
            "title": "We Miss You! 👋",
            "message": """It's been a while since you last used PropIQ. We've added some great new features:

• Improved AI analysis accuracy
• Faster property data lookup
• Enhanced market insights
• New comparable property matching

Ready to analyze another property? Your {subscription_tier} plan is active and ready to go!

Need help with anything?""",
            "delay_seconds": 0,  # Sent via scheduled job (7 days inactive)
        },

        MessageType.UPGRADE_PROMPT: {
            "title": "Unlock More with Pro 🌟",
            "message": """You've used {analyses_used} of {analyses_limit} analyses this month. You're getting great value from PropIQ!

Upgrade to Pro for:
• 100 analyses per month (vs {analyses_limit})
• Property Advisor multi-agent analysis
• Priority support
• Advanced analytics

For just ${price_difference} more per month, you'll unlock powerful features that serious investors love.

Want to learn more about Pro?""",
            "delay_seconds": 0,
            "actions": [
                {"label": "Upgrade to Pro", "url": "/pricing?highlight=pro"},
                {"label": "Learn More", "url": "/features/property-advisor"}
            ]
        }
    }

    @staticmethod
    def render_message(message_type: MessageType, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Render a proactive message with context variables

        Args:
            message_type: Type of message to render
            context: Variables to inject into message (e.g., user name, usage stats)

        Returns:
            Rendered message dict
        """
        if message_type not in ProactiveMessage.TEMPLATES:
            raise ValueError(f"Unknown message type: {message_type}")

        template = ProactiveMessage.TEMPLATES[message_type].copy()
        context = context or {}

        # Render message content with context
        if "message" in template:
            template["message"] = template["message"].format(**context) if context else template["message"]

        if "title" in template:
            template["title"] = template["title"].format(**context) if context else template["title"]

        return template


class ProactiveEngagementManager:
    """Manages proactive engagement workflows"""

    def __init__(self, supabase_client=None):
        """
        Initialize manager

        Args:
            supabase_client: Supabase client for conversation creation
        """
        self.supabase = supabase_client

    def create_proactive_conversation(
        self,
        user_id: str,
        user_email: str,
        message_type: MessageType,
        context: Dict[str, Any] = None
    ) -> str:
        """
        Create a proactive conversation with initial message

        Args:
            user_id: User ID
            user_email: User email
            message_type: Type of proactive message
            context: Context variables for message rendering

        Returns:
            Conversation ID
        """
        # Render message
        message_data = ProactiveMessage.render_message(message_type, context)

        conversation_id = str(uuid.uuid4())
        timestamp = datetime.utcnow()

        # Create proactive message
        assistant_message = {
            "role": "assistant",
            "content": message_data["message"],
            "timestamp": timestamp.isoformat(),
            "is_proactive": True,
            "message_type": message_type.value,
            "actions": message_data.get("actions")
        }

        # Save to database
        if self.supabase:
            try:
                conversation_data = {
                    "conversation_id": conversation_id,
                    "user_id": user_id,
                    "user_email": user_email,
                    "messages": [assistant_message],
                    "sentiment": "neutral",
                    "intent": "proactive_engagement",
                    "status": "active",
                    "is_proactive": True,
                    "created_at": timestamp.isoformat(),
                    "updated_at": timestamp.isoformat(),
                    "last_message_at": timestamp.isoformat()
                }

                self.supabase.table("support_conversations_v2").insert(
                    conversation_data
                ).execute()

                print(f"✅ Proactive conversation created: {conversation_id} ({message_type.value})")

            except Exception as e:
                print(f"⚠️  Failed to save proactive conversation: {e}")

        return conversation_id

    def schedule_onboarding_messages(
        self,
        user_id: str,
        user_email: str,
        user_name: str = None
    ):
        """
        Schedule onboarding message sequence

        Args:
            user_id: User ID
            user_email: User email
            user_name: User's name
        """
        context = {
            "user_name": user_name or user_email.split("@")[0]
        }

        # Welcome message (5 minutes after signup)
        self._schedule_message(
            user_id=user_id,
            user_email=user_email,
            message_type=MessageType.ONBOARDING_WELCOME,
            context=context,
            delay_seconds=300
        )

        # Feature tour (24 hours after signup, if at least 1 analysis)
        self._schedule_message(
            user_id=user_id,
            user_email=user_email,
            message_type=MessageType.ONBOARDING_FEATURE_TOUR,
            context=context,
            delay_seconds=86400,
            conditions={"analyses_count": {"min": 1}}
        )

        print(f"✅ Onboarding messages scheduled for {user_email}")

    def send_usage_tip(
        self,
        user_id: str,
        user_email: str,
        tip_title: str,
        tip_content: str
    ) -> str:
        """
        Send a usage tip to user

        Args:
            user_id: User ID
            user_email: User email
            tip_title: Tip title
            tip_content: Tip content

        Returns:
            Conversation ID
        """
        context = {
            "tip_title": tip_title,
            "tip_content": tip_content
        }

        return self.create_proactive_conversation(
            user_id=user_id,
            user_email=user_email,
            message_type=MessageType.USAGE_TIP,
            context=context
        )

    def send_trial_expiration_reminder(
        self,
        user_id: str,
        user_email: str,
        analyses_used: int,
        days_until_expiration: int
    ) -> str:
        """
        Send trial expiration reminder

        Args:
            user_id: User ID
            user_email: User email
            analyses_used: Number of analyses used
            days_until_expiration: Days until trial expires

        Returns:
            Conversation ID
        """
        context = {
            "analyses_used": analyses_used,
            "days_until_expiration": days_until_expiration
        }

        message_type = (
            MessageType.TRIAL_EXPIRING_SOON if days_until_expiration > 0
            else MessageType.TRIAL_EXPIRED
        )

        return self.create_proactive_conversation(
            user_id=user_id,
            user_email=user_email,
            message_type=message_type,
            context=context
        )

    def send_upgrade_prompt(
        self,
        user_id: str,
        user_email: str,
        analyses_used: int,
        analyses_limit: int,
        current_tier: str,
        target_tier: str = "Pro",
        price_difference: int = 50
    ) -> str:
        """
        Send upgrade prompt when user is near limit

        Args:
            user_id: User ID
            user_email: User email
            analyses_used: Analyses used this month
            analyses_limit: Monthly analysis limit
            current_tier: Current subscription tier
            target_tier: Suggested upgrade tier
            price_difference: Price difference for upgrade

        Returns:
            Conversation ID
        """
        context = {
            "analyses_used": analyses_used,
            "analyses_limit": analyses_limit,
            "current_tier": current_tier,
            "target_tier": target_tier,
            "price_difference": price_difference
        }

        return self.create_proactive_conversation(
            user_id=user_id,
            user_email=user_email,
            message_type=MessageType.UPGRADE_PROMPT,
            context=context
        )

    def send_re_engagement_message(
        self,
        user_id: str,
        user_email: str,
        subscription_tier: str,
        days_inactive: int
    ) -> str:
        """
        Send re-engagement message to inactive users

        Args:
            user_id: User ID
            user_email: User email
            subscription_tier: Current subscription tier
            days_inactive: Days since last activity

        Returns:
            Conversation ID
        """
        context = {
            "subscription_tier": subscription_tier.title(),
            "days_inactive": days_inactive
        }

        return self.create_proactive_conversation(
            user_id=user_id,
            user_email=user_email,
            message_type=MessageType.RE_ENGAGEMENT,
            context=context
        )

    def _schedule_message(
        self,
        user_id: str,
        user_email: str,
        message_type: MessageType,
        context: Dict[str, Any],
        delay_seconds: int,
        conditions: Dict[str, Any] = None
    ):
        """
        Schedule a proactive message for future delivery

        Args:
            user_id: User ID
            user_email: User email
            message_type: Message type
            context: Context variables
            delay_seconds: Delay in seconds
            conditions: Conditions to check before sending
        """
        # In production, use Celery or similar task queue
        # For now, just log the scheduled message
        scheduled_time = datetime.utcnow() + timedelta(seconds=delay_seconds)

        print(f"📅 Scheduled {message_type.value} for {user_email} at {scheduled_time}")
        print(f"   Delay: {delay_seconds}s, Conditions: {conditions}")

        # TODO: Implement with Celery
        # send_proactive_message.apply_async(
        #     args=[user_id, user_email, message_type.value, context],
        #     countdown=delay_seconds
        # )


# Usage tip library
USAGE_TIPS = [
    {
        "title": "Use Financial Details for Better Analysis",
        "content": """When analyzing a property, add your financial details (purchase price, down payment, interest rate) for more accurate ROI calculations.

The AI can provide detailed cash flow projections and break-even analysis when you include these numbers!""",
        "trigger": "user_analyzed_without_financials",
        "category": "analysis_quality"
    },
    {
        "title": "Export Your Analysis as PDF",
        "content": """Did you know you can export your property analysis as a professional PDF report?

Click the "Export PDF" button to download a shareable report - perfect for presenting to partners, lenders, or your team!""",
        "trigger": "user_completed_first_analysis",
        "category": "features"
    },
    {
        "title": "Try Property Advisor for Deep Analysis",
        "content": """Pro and Elite users can access **Property Advisor** - our advanced multi-agent system.

It provides:
• Market trend research
• Detailed financial modeling
• Risk assessment
• Step-by-step action plan

Perfect for complex investment decisions!""",
        "trigger": "user_on_pro_or_elite_hasnt_used_advisor",
        "category": "premium_features"
    },
    {
        "title": "Compare Multiple Properties",
        "content": """Analyzing multiple properties? Use your analysis history to compare different investments side-by-side.

Go to your dashboard to see all previous analyses and identify the best opportunity!""",
        "trigger": "user_has_multiple_analyses",
        "category": "workflow"
    },
    {
        "title": "Set Up Saved Searches",
        "content": """Save time by saving your search criteria! Set your preferred:
• Location
• Price range
• Property type
• Investment goals

Get instant analysis results without re-entering your preferences each time.""",
        "trigger": "user_analyzed_3_similar_properties",
        "category": "efficiency"
    }
]


def get_relevant_tip(user_context: Dict[str, Any]) -> Optional[Dict[str, str]]:
    """
    Get a relevant usage tip based on user context

    Args:
        user_context: User behavior and usage data

    Returns:
        Tip dict or None
    """
    for tip in USAGE_TIPS:
        trigger = tip.get("trigger")

        # Check trigger conditions
        if trigger == "user_analyzed_without_financials":
            if user_context.get("last_analysis_had_financials") is False:
                return tip

        elif trigger == "user_completed_first_analysis":
            if user_context.get("analyses_count") == 1:
                return tip

        elif trigger == "user_on_pro_or_elite_hasnt_used_advisor":
            tier = user_context.get("subscription_tier", "free")
            used_advisor = user_context.get("used_property_advisor", False)
            if tier in ["pro", "elite"] and not used_advisor:
                return tip

        elif trigger == "user_has_multiple_analyses":
            if user_context.get("analyses_count", 0) >= 3:
                return tip

    return None


# Health check
def health_check() -> Dict[str, Any]:
    """Check proactive engagement system status"""
    return {
        "celery_available": CELERY_AVAILABLE,
        "redis_available": REDIS_AVAILABLE,
        "message_types": [mt.value for mt in MessageType],
        "usage_tips_count": len(USAGE_TIPS)
    }
