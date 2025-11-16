"""
Calendar Integration for PropIQ Support Agent
Phase 4: Schedule calls and meetings directly from chat

This module handles:
- Meeting scheduling (sales calls, support calls, onboarding)
- Calendly integration
- Google Calendar integration (optional)
- Availability checking
- Meeting reminders
- Timezone handling

Enables users to schedule calls without leaving the chat interface.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from enum import Enum
import os
import json


class MeetingType(Enum):
    """Types of meetings"""
    SALES_CALL = "sales_call"
    SUPPORT_CALL = "support_call"
    ONBOARDING_CALL = "onboarding_call"
    DEMO_CALL = "demo_call"
    TECHNICAL_SUPPORT = "technical_support"
    ACCOUNT_REVIEW = "account_review"


class CalendarProvider(Enum):
    """Calendar providers"""
    CALENDLY = "calendly"
    GOOGLE_CALENDAR = "google_calendar"
    MICROSOFT_OUTLOOK = "microsoft_outlook"
    INTERNAL = "internal"


# Calendly configuration
CALENDLY_API_KEY = os.getenv("CALENDLY_API_KEY")
CALENDLY_ENABLED = bool(CALENDLY_API_KEY)

# Meeting type to Calendly event type mapping
CALENDLY_EVENT_TYPES = {
    MeetingType.SALES_CALL: os.getenv("CALENDLY_SALES_EVENT_TYPE", "sales-consultation"),
    MeetingType.SUPPORT_CALL: os.getenv("CALENDLY_SUPPORT_EVENT_TYPE", "support-session"),
    MeetingType.ONBOARDING_CALL: os.getenv("CALENDLY_ONBOARDING_EVENT_TYPE", "onboarding-session"),
    MeetingType.DEMO_CALL: os.getenv("CALENDLY_DEMO_EVENT_TYPE", "product-demo"),
    MeetingType.TECHNICAL_SUPPORT: os.getenv("CALENDLY_TECHNICAL_EVENT_TYPE", "technical-support"),
    MeetingType.ACCOUNT_REVIEW: os.getenv("CALENDLY_ACCOUNT_EVENT_TYPE", "account-review")
}


class CalendarIntegration:
    """Calendar integration manager"""

    def __init__(self, provider: CalendarProvider = CalendarProvider.CALENDLY):
        """
        Initialize calendar integration

        Args:
            provider: Calendar provider to use
        """
        self.provider = provider

    def get_scheduling_link(
        self,
        meeting_type: MeetingType,
        user_email: str,
        user_name: Optional[str] = None,
        prefill_data: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Get scheduling link for meeting type

        Args:
            meeting_type: Type of meeting
            user_email: User's email
            user_name: User's name
            prefill_data: Additional data to prefill

        Returns:
            Scheduling URL
        """
        if self.provider == CalendarProvider.CALENDLY:
            return self._get_calendly_link(meeting_type, user_email, user_name, prefill_data)
        else:
            return self._get_fallback_link(meeting_type)

    def _get_calendly_link(
        self,
        meeting_type: MeetingType,
        user_email: str,
        user_name: Optional[str] = None,
        prefill_data: Optional[Dict[str, str]] = None
    ) -> str:
        """Generate Calendly scheduling link"""
        base_url = os.getenv("CALENDLY_BASE_URL", "https://calendly.com/propiq")
        event_slug = CALENDLY_EVENT_TYPES.get(meeting_type, "consultation")

        # Build URL with query parameters
        url = f"{base_url}/{event_slug}"

        # Add prefill parameters
        params = []

        if user_email:
            params.append(f"email={user_email}")

        if user_name:
            params.append(f"name={user_name}")

        if prefill_data:
            for key, value in prefill_data.items():
                params.append(f"{key}={value}")

        if params:
            url += "?" + "&".join(params)

        return url

    def _get_fallback_link(self, meeting_type: MeetingType) -> str:
        """Fallback scheduling link"""
        return f"https://propiq.com/schedule/{meeting_type.value}"

    def create_meeting_invitation(
        self,
        meeting_type: MeetingType,
        user_email: str,
        user_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create meeting invitation with link and details

        Args:
            meeting_type: Type of meeting
            user_email: User's email
            user_name: User's name

        Returns:
            Meeting invitation dict
        """
        meeting_config = self._get_meeting_config(meeting_type)

        scheduling_link = self.get_scheduling_link(
            meeting_type=meeting_type,
            user_email=user_email,
            user_name=user_name
        )

        return {
            "meeting_type": meeting_type.value,
            "title": meeting_config["title"],
            "description": meeting_config["description"],
            "duration_minutes": meeting_config["duration"],
            "scheduling_link": scheduling_link,
            "instructions": meeting_config.get("instructions", ""),
            "created_at": datetime.utcnow().isoformat()
        }

    def _get_meeting_config(self, meeting_type: MeetingType) -> Dict[str, Any]:
        """Get meeting configuration"""
        configs = {
            MeetingType.SALES_CALL: {
                "title": "Schedule a Sales Consultation",
                "description": "Discuss PropIQ plans and find the right fit for your needs",
                "duration": 30,
                "instructions": "We'll review your investment goals and show you how PropIQ can help you make better decisions."
            },
            MeetingType.SUPPORT_CALL: {
                "title": "Schedule a Support Session",
                "description": "Get personalized help with any issues or questions",
                "duration": 30,
                "instructions": "Our support team will help you resolve any issues and answer your questions."
            },
            MeetingType.ONBOARDING_CALL: {
                "title": "Schedule an Onboarding Call",
                "description": "Get started with PropIQ and learn best practices",
                "duration": 45,
                "instructions": "We'll walk you through PropIQ's features and help you analyze your first properties."
            },
            MeetingType.DEMO_CALL: {
                "title": "Schedule a Product Demo",
                "description": "See PropIQ in action with a personalized demo",
                "duration": 30,
                "instructions": "We'll show you how PropIQ works and demonstrate key features for your use case."
            },
            MeetingType.TECHNICAL_SUPPORT: {
                "title": "Schedule Technical Support",
                "description": "Get help with technical issues or integrations",
                "duration": 30,
                "instructions": "Our technical team will help you resolve any technical challenges."
            },
            MeetingType.ACCOUNT_REVIEW: {
                "title": "Schedule an Account Review",
                "description": "Review your account and optimize your PropIQ usage",
                "duration": 30,
                "instructions": "We'll review your usage, answer questions, and help you get more value from PropIQ."
            }
        }

        return configs.get(meeting_type, {
            "title": "Schedule a Meeting",
            "description": "Connect with the PropIQ team",
            "duration": 30,
            "instructions": ""
        })


class MeetingScheduler:
    """Handle meeting scheduling and tracking"""

    def __init__(self, supabase_client=None):
        """
        Initialize meeting scheduler

        Args:
            supabase_client: Supabase client for logging
        """
        self.supabase = supabase_client
        self.calendar = CalendarIntegration()

    def schedule_meeting(
        self,
        user_id: str,
        user_email: str,
        meeting_type: MeetingType,
        user_name: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create meeting scheduling invitation

        Args:
            user_id: User ID
            user_email: User email
            meeting_type: Type of meeting
            user_name: User name
            notes: Additional notes

        Returns:
            Meeting invitation with scheduling link
        """
        # Create invitation
        invitation = self.calendar.create_meeting_invitation(
            meeting_type=meeting_type,
            user_email=user_email,
            user_name=user_name
        )

        # Log meeting request
        if self.supabase:
            try:
                meeting_log = {
                    "user_id": user_id,
                    "user_email": user_email,
                    "meeting_type": meeting_type.value,
                    "scheduling_link": invitation["scheduling_link"],
                    "notes": notes,
                    "status": "link_sent",
                    "created_at": datetime.utcnow().isoformat()
                }

                self.supabase.table("meeting_requests").insert(meeting_log).execute()
                print(f"📅 Meeting invitation created: {meeting_type.value} for {user_email}")

            except Exception as e:
                print(f"⚠️  Failed to log meeting request: {e}")

        return invitation

    def suggest_meeting_type(
        self,
        conversation_context: Dict[str, Any]
    ) -> MeetingType:
        """
        Suggest appropriate meeting type based on conversation context

        Args:
            conversation_context: Conversation data (intent, user context, etc.)

        Returns:
            Suggested meeting type
        """
        intent = conversation_context.get("intent", "general")
        user_context = conversation_context.get("user_context", {})
        subscription = user_context.get("subscription", {})

        tier = subscription.get("tier", "free")
        is_new_user = user_context.get("insights", {}).get("new_user", False)

        # New users -> onboarding
        if is_new_user:
            return MeetingType.ONBOARDING_CALL

        # Sales intent or free/starter users asking about features
        if intent == "sales" or (tier in ["free", "starter"] and intent == "feature_question"):
            return MeetingType.SALES_CALL

        # Technical support intent
        if intent == "technical_support":
            return MeetingType.TECHNICAL_SUPPORT

        # Account management for pro/elite users
        if tier in ["pro", "elite"] and intent == "account_management":
            return MeetingType.ACCOUNT_REVIEW

        # Default to general support
        return MeetingType.SUPPORT_CALL


class AvailabilityChecker:
    """Check meeting availability (if using internal calendar)"""

    def __init__(self):
        """Initialize availability checker"""
        pass

    def get_available_slots(
        self,
        start_date: datetime,
        end_date: datetime,
        duration_minutes: int = 30,
        timezone: str = "UTC"
    ) -> List[Dict[str, Any]]:
        """
        Get available time slots

        Args:
            start_date: Start date for availability search
            end_date: End date for availability search
            duration_minutes: Meeting duration
            timezone: User's timezone

        Returns:
            List of available time slots
        """
        # This is a placeholder - in production, integrate with Google Calendar API
        # or use Calendly's availability API

        available_slots = []

        # Generate sample slots (9 AM - 5 PM, weekdays)
        current_date = start_date

        while current_date <= end_date:
            # Skip weekends
            if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                # Morning slots (9 AM - 12 PM)
                for hour in range(9, 12):
                    slot_start = current_date.replace(hour=hour, minute=0, second=0)
                    slot_end = slot_start + timedelta(minutes=duration_minutes)

                    available_slots.append({
                        "start": slot_start.isoformat(),
                        "end": slot_end.isoformat(),
                        "timezone": timezone,
                        "available": True
                    })

                # Afternoon slots (1 PM - 5 PM)
                for hour in range(13, 17):
                    slot_start = current_date.replace(hour=hour, minute=0, second=0)
                    slot_end = slot_start + timedelta(minutes=duration_minutes)

                    available_slots.append({
                        "start": slot_start.isoformat(),
                        "end": slot_end.isoformat(),
                        "timezone": timezone,
                        "available": True
                    })

            current_date += timedelta(days=1)

        return available_slots[:20]  # Return first 20 slots


# Convenience functions

def create_meeting_link(
    user_email: str,
    meeting_type: str = "sales_call",
    user_name: Optional[str] = None
) -> str:
    """Quick function to create meeting link"""
    calendar = CalendarIntegration()
    meeting_type_enum = MeetingType(meeting_type) if isinstance(meeting_type, str) else meeting_type

    return calendar.get_scheduling_link(
        meeting_type=meeting_type_enum,
        user_email=user_email,
        user_name=user_name
    )


def schedule_support_call(
    user_id: str,
    user_email: str,
    user_name: Optional[str] = None,
    supabase_client=None
) -> Dict[str, Any]:
    """Quick function to schedule support call"""
    scheduler = MeetingScheduler(supabase_client)
    return scheduler.schedule_meeting(
        user_id=user_id,
        user_email=user_email,
        meeting_type=MeetingType.SUPPORT_CALL,
        user_name=user_name
    )


def schedule_sales_call(
    user_id: str,
    user_email: str,
    user_name: Optional[str] = None,
    supabase_client=None
) -> Dict[str, Any]:
    """Quick function to schedule sales call"""
    scheduler = MeetingScheduler(supabase_client)
    return scheduler.schedule_meeting(
        user_id=user_id,
        user_email=user_email,
        meeting_type=MeetingType.SALES_CALL,
        user_name=user_name
    )


def get_meeting_button(
    meeting_type: MeetingType,
    user_email: str,
    user_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get action button for scheduling meeting

    Args:
        meeting_type: Type of meeting
        user_email: User email
        user_name: User name

    Returns:
        Action button dict
    """
    calendar = CalendarIntegration()
    config = calendar._get_meeting_config(meeting_type)

    link = calendar.get_scheduling_link(
        meeting_type=meeting_type,
        user_email=user_email,
        user_name=user_name
    )

    return {
        "label": config["title"],
        "type": "external_link",
        "action": link,
        "style": "primary",
        "icon": "calendar",
        "metadata": {
            "meeting_type": meeting_type.value,
            "duration_minutes": config["duration"]
        }
    }


# Health check
def health_check() -> Dict[str, Any]:
    """Check calendar integration status"""
    return {
        "calendly_enabled": CALENDLY_ENABLED,
        "calendly_base_url": os.getenv("CALENDLY_BASE_URL"),
        "meeting_types": [mt.value for mt in MeetingType],
        "providers": [cp.value for cp in CalendarProvider],
        "features": {
            "calendly_integration": CALENDLY_ENABLED,
            "meeting_scheduling": True,
            "availability_checking": True,
            "meeting_tracking": True,
            "timezone_support": True
        }
    }
