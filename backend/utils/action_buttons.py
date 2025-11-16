"""
Action Button System for PropIQ Support Agent
Phase 4: Interactive buttons in chat responses

This module handles:
- Action button definitions and types
- Context-aware button suggestions
- Button rendering for frontend
- Click tracking and analytics
- Deep linking to specific app features

Buttons enhance user experience by providing quick actions directly in chat.
"""

from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime
import uuid


class ButtonStyle(Enum):
    """Button visual styles"""
    PRIMARY = "primary"  # Blue, for main actions
    SECONDARY = "secondary"  # Gray, for secondary actions
    SUCCESS = "success"  # Green, for positive actions
    WARNING = "warning"  # Orange, for cautionary actions
    DANGER = "danger"  # Red, for destructive actions
    LINK = "link"  # Text-only link style


class ButtonType(Enum):
    """Types of action buttons"""
    # Navigation buttons
    NAVIGATE = "navigate"  # Navigate to app page
    EXTERNAL_LINK = "external_link"  # Open external URL

    # Action buttons
    TRIGGER_ACTION = "trigger_action"  # Trigger backend action
    OPEN_MODAL = "open_modal"  # Open modal dialog

    # Data buttons
    QUICK_REPLY = "quick_reply"  # Send predefined message
    COPY_TEXT = "copy_text"  # Copy text to clipboard

    # File buttons
    DOWNLOAD_FILE = "download_file"  # Download file
    EXPORT_PDF = "export_pdf"  # Export PDF report


class ActionButton:
    """Action button data model"""

    def __init__(
        self,
        label: str,
        button_type: ButtonType,
        action: str,
        style: ButtonStyle = ButtonStyle.PRIMARY,
        icon: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tracking_id: Optional[str] = None
    ):
        """
        Initialize action button

        Args:
            label: Button text label
            button_type: Type of button
            action: Action to perform (URL, endpoint, etc.)
            style: Visual style
            icon: Optional icon name (e.g., "dollar-sign", "chart", "download")
            metadata: Additional metadata for button
            tracking_id: Optional ID for click tracking
        """
        self.label = label
        self.button_type = button_type
        self.action = action
        self.style = style
        self.icon = icon
        self.metadata = metadata or {}
        self.tracking_id = tracking_id or str(uuid.uuid4())

    def to_dict(self) -> Dict[str, Any]:
        """Convert button to dictionary for API response"""
        return {
            "label": self.label,
            "type": self.button_type.value,
            "action": self.action,
            "style": self.style.value,
            "icon": self.icon,
            "metadata": self.metadata,
            "tracking_id": self.tracking_id
        }


class ButtonGroup:
    """Group of related action buttons"""

    def __init__(self, buttons: List[ActionButton], layout: str = "horizontal"):
        """
        Initialize button group

        Args:
            buttons: List of action buttons
            layout: Layout style ("horizontal", "vertical", "grid")
        """
        self.buttons = buttons
        self.layout = layout

    def to_dict(self) -> Dict[str, Any]:
        """Convert button group to dictionary"""
        return {
            "buttons": [btn.to_dict() for btn in self.buttons],
            "layout": self.layout
        }


# Pre-defined button templates
class ButtonTemplates:
    """Common button templates for PropIQ"""

    # Pricing & Billing
    VIEW_PRICING = ActionButton(
        label="View Pricing",
        button_type=ButtonType.NAVIGATE,
        action="/pricing",
        style=ButtonStyle.PRIMARY,
        icon="dollar-sign"
    )

    UPGRADE_NOW = ActionButton(
        label="Upgrade Now",
        button_type=ButtonType.NAVIGATE,
        action="/pricing?intent=upgrade",
        style=ButtonStyle.SUCCESS,
        icon="arrow-up-circle"
    )

    COMPARE_PLANS = ActionButton(
        label="Compare Plans",
        button_type=ButtonType.NAVIGATE,
        action="/pricing#compare",
        style=ButtonStyle.SECONDARY,
        icon="grid"
    )

    MANAGE_BILLING = ActionButton(
        label="Manage Billing",
        button_type=ButtonType.NAVIGATE,
        action="/account/billing",
        style=ButtonStyle.SECONDARY,
        icon="credit-card"
    )

    # Property Analysis
    ANALYZE_PROPERTY = ActionButton(
        label="Analyze a Property",
        button_type=ButtonType.NAVIGATE,
        action="/analyze",
        style=ButtonStyle.PRIMARY,
        icon="home"
    )

    VIEW_ANALYSES = ActionButton(
        label="View My Analyses",
        button_type=ButtonType.NAVIGATE,
        action="/dashboard/analyses",
        style=ButtonStyle.SECONDARY,
        icon="folder"
    )

    PROPERTY_ADVISOR = ActionButton(
        label="Try Property Advisor",
        button_type=ButtonType.NAVIGATE,
        action="/analyze?mode=advisor",
        style=ButtonStyle.SUCCESS,
        icon="users"
    )

    # Export & Download
    EXPORT_PDF = ActionButton(
        label="Export as PDF",
        button_type=ButtonType.EXPORT_PDF,
        action="/api/v1/export/pdf",
        style=ButtonStyle.SECONDARY,
        icon="download"
    )

    DOWNLOAD_REPORT = ActionButton(
        label="Download Report",
        button_type=ButtonType.DOWNLOAD_FILE,
        action="/api/v1/download/report",
        style=ButtonStyle.SECONDARY,
        icon="file-text"
    )

    # Account & Settings
    VIEW_ACCOUNT = ActionButton(
        label="My Account",
        button_type=ButtonType.NAVIGATE,
        action="/account",
        style=ButtonStyle.SECONDARY,
        icon="user"
    )

    UPDATE_PROFILE = ActionButton(
        label="Update Profile",
        button_type=ButtonType.NAVIGATE,
        action="/account/profile",
        style=ButtonStyle.SECONDARY,
        icon="edit"
    )

    # Support & Help
    VIEW_DOCS = ActionButton(
        label="View Documentation",
        button_type=ButtonType.EXTERNAL_LINK,
        action="https://docs.propiq.com",
        style=ButtonStyle.LINK,
        icon="book-open"
    )

    SCHEDULE_CALL = ActionButton(
        label="Schedule a Call",
        button_type=ButtonType.NAVIGATE,
        action="/support/schedule",
        style=ButtonStyle.PRIMARY,
        icon="phone"
    )

    CONTACT_SALES = ActionButton(
        label="Contact Sales",
        button_type=ButtonType.NAVIGATE,
        action="/contact/sales",
        style=ButtonStyle.PRIMARY,
        icon="mail"
    )

    # Quick Replies
    YES = ActionButton(
        label="Yes",
        button_type=ButtonType.QUICK_REPLY,
        action="Yes",
        style=ButtonStyle.SUCCESS,
        icon="check"
    )

    NO = ActionButton(
        label="No",
        button_type=ButtonType.QUICK_REPLY,
        action="No",
        style=ButtonStyle.SECONDARY,
        icon="x"
    )

    CONTINUE = ActionButton(
        label="Continue",
        button_type=ButtonType.QUICK_REPLY,
        action="Continue",
        style=ButtonStyle.PRIMARY,
        icon="arrow-right"
    )


class ContextualButtonSuggester:
    """Suggest buttons based on conversation context"""

    @staticmethod
    def suggest_buttons(
        intent: Optional[str] = None,
        user_context: Optional[Dict[str, Any]] = None,
        conversation_messages: Optional[List[Dict[str, Any]]] = None
    ) -> List[ActionButton]:
        """
        Suggest contextually relevant buttons

        Args:
            intent: Conversation intent (billing, technical_support, etc.)
            user_context: User subscription and usage data
            conversation_messages: Conversation history

        Returns:
            List of suggested action buttons
        """
        buttons = []
        user_context = user_context or {}

        # Intent-based button suggestions
        if intent == "billing":
            buttons.extend([
                ButtonTemplates.MANAGE_BILLING,
                ButtonTemplates.VIEW_PRICING,
                ButtonTemplates.CONTACT_SALES
            ])

        elif intent == "sales":
            subscription_tier = user_context.get("subscription_tier", "free")

            if subscription_tier == "free":
                buttons.extend([
                    ButtonTemplates.VIEW_PRICING,
                    ButtonTemplates.UPGRADE_NOW,
                    ButtonTemplates.SCHEDULE_CALL
                ])
            else:
                buttons.extend([
                    ButtonTemplates.COMPARE_PLANS,
                    ButtonTemplates.CONTACT_SALES
                ])

        elif intent == "feature_question":
            buttons.extend([
                ButtonTemplates.ANALYZE_PROPERTY,
                ButtonTemplates.VIEW_DOCS,
                ButtonTemplates.PROPERTY_ADVISOR
            ])

        elif intent == "technical_support":
            buttons.extend([
                ButtonTemplates.VIEW_DOCS,
                ButtonTemplates.SCHEDULE_CALL
            ])

        elif intent == "account_management":
            buttons.extend([
                ButtonTemplates.VIEW_ACCOUNT,
                ButtonTemplates.UPDATE_PROFILE,
                ButtonTemplates.MANAGE_BILLING
            ])

        # User context-based suggestions
        subscription_tier = user_context.get("subscription_tier", "free")
        analyses_count = user_context.get("analyses_count", 0)

        # Free users who haven't analyzed anything
        if subscription_tier == "free" and analyses_count == 0:
            if ButtonTemplates.ANALYZE_PROPERTY not in buttons:
                buttons.insert(0, ButtonTemplates.ANALYZE_PROPERTY)

        # Users approaching limits
        analyses_used = user_context.get("analyses_used_this_month", 0)
        analyses_limit = user_context.get("analyses_limit", 3)

        if analyses_limit > 0 and analyses_used / analyses_limit >= 0.8:
            if subscription_tier != "elite":
                if ButtonTemplates.UPGRADE_NOW not in buttons:
                    buttons.append(ButtonTemplates.UPGRADE_NOW)

        # Pro/Elite users who haven't used Property Advisor
        if subscription_tier in ["pro", "elite"]:
            used_advisor = user_context.get("used_property_advisor", False)
            if not used_advisor and ButtonTemplates.PROPERTY_ADVISOR not in buttons:
                buttons.append(ButtonTemplates.PROPERTY_ADVISOR)

        # Limit to 3-4 buttons max to avoid overwhelming users
        return buttons[:4]

    @staticmethod
    def suggest_pricing_buttons(
        current_tier: str,
        include_schedule_call: bool = True
    ) -> List[ActionButton]:
        """Suggest pricing-related buttons based on current tier"""
        buttons = []

        if current_tier == "free":
            buttons.extend([
                ButtonTemplates.VIEW_PRICING,
                ButtonTemplates.UPGRADE_NOW,
                ButtonTemplates.COMPARE_PLANS
            ])
        elif current_tier == "starter":
            buttons.extend([
                ActionButton(
                    label="Upgrade to Pro",
                    button_type=ButtonType.NAVIGATE,
                    action="/pricing?highlight=pro",
                    style=ButtonStyle.SUCCESS,
                    icon="arrow-up-circle"
                ),
                ButtonTemplates.COMPARE_PLANS
            ])
        elif current_tier == "pro":
            buttons.extend([
                ActionButton(
                    label="Upgrade to Elite",
                    button_type=ButtonType.NAVIGATE,
                    action="/pricing?highlight=elite",
                    style=ButtonStyle.SUCCESS,
                    icon="star"
                ),
                ButtonTemplates.COMPARE_PLANS
            ])
        else:  # elite
            buttons.extend([
                ButtonTemplates.MANAGE_BILLING,
                ButtonTemplates.CONTACT_SALES
            ])

        if include_schedule_call:
            buttons.append(ButtonTemplates.SCHEDULE_CALL)

        return buttons

    @staticmethod
    def suggest_analysis_buttons(
        has_analyses: bool,
        subscription_tier: str
    ) -> List[ActionButton]:
        """Suggest analysis-related buttons"""
        buttons = [ButtonTemplates.ANALYZE_PROPERTY]

        if has_analyses:
            buttons.append(ButtonTemplates.VIEW_ANALYSES)

        if subscription_tier in ["pro", "elite"]:
            buttons.append(ButtonTemplates.PROPERTY_ADVISOR)

        return buttons

    @staticmethod
    def suggest_confirmation_buttons() -> List[ActionButton]:
        """Suggest yes/no confirmation buttons"""
        return [ButtonTemplates.YES, ButtonTemplates.NO]


class ButtonAnalytics:
    """Track button clicks and engagement"""

    def __init__(self, supabase_client=None):
        """
        Initialize analytics tracker

        Args:
            supabase_client: Supabase client for logging
        """
        self.supabase = supabase_client

    def track_button_click(
        self,
        tracking_id: str,
        conversation_id: str,
        user_id: str,
        button_label: str,
        button_type: str,
        action: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Track button click event

        Args:
            tracking_id: Button tracking ID
            conversation_id: Conversation ID
            user_id: User ID
            button_label: Button label
            button_type: Button type
            action: Button action
            metadata: Additional metadata
        """
        timestamp = datetime.utcnow()

        click_event = {
            "tracking_id": tracking_id,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "button_label": button_label,
            "button_type": button_type,
            "action": action,
            "metadata": metadata or {},
            "clicked_at": timestamp.isoformat(),
            "created_at": timestamp.isoformat()
        }

        # Log to database
        if self.supabase:
            try:
                self.supabase.table("button_clicks").insert(click_event).execute()
                print(f"📊 Button click tracked: {button_label} ({tracking_id})")
            except Exception as e:
                print(f"⚠️  Failed to track button click: {e}")
        else:
            print(f"📊 Button click (no DB): {button_label}")

    def get_button_analytics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        group_by: str = "button_label"
    ) -> List[Dict[str, Any]]:
        """
        Get button click analytics

        Args:
            start_date: Start date filter
            end_date: End date filter
            group_by: Group by field (button_label, button_type, action)

        Returns:
            Analytics data grouped by specified field
        """
        if not self.supabase:
            return []

        try:
            query = self.supabase.table("button_clicks").select("*")

            if start_date:
                query = query.gte("clicked_at", start_date.isoformat())

            if end_date:
                query = query.lte("clicked_at", end_date.isoformat())

            result = query.execute()
            clicks = result.data if result.data else []

            # Group and count
            grouped = {}
            for click in clicks:
                key = click.get(group_by, "unknown")
                if key not in grouped:
                    grouped[key] = {
                        group_by: key,
                        "total_clicks": 0,
                        "unique_users": set(),
                        "unique_conversations": set()
                    }

                grouped[key]["total_clicks"] += 1
                grouped[key]["unique_users"].add(click.get("user_id"))
                grouped[key]["unique_conversations"].add(click.get("conversation_id"))

            # Convert to list
            analytics = []
            for key, data in grouped.items():
                analytics.append({
                    group_by: data[group_by],
                    "total_clicks": data["total_clicks"],
                    "unique_users": len(data["unique_users"]),
                    "unique_conversations": len(data["unique_conversations"])
                })

            # Sort by total clicks
            analytics.sort(key=lambda x: x["total_clicks"], reverse=True)

            return analytics

        except Exception as e:
            print(f"❌ Failed to get button analytics: {e}")
            return []


# Convenience functions

def create_button_group(
    buttons: List[ActionButton],
    layout: str = "horizontal"
) -> Dict[str, Any]:
    """Create a button group for API response"""
    group = ButtonGroup(buttons, layout)
    return group.to_dict()


def suggest_buttons_for_intent(
    intent: str,
    user_context: Dict[str, Any] = None
) -> List[Dict[str, Any]]:
    """Quick function to suggest buttons for intent"""
    suggester = ContextualButtonSuggester()
    buttons = suggester.suggest_buttons(
        intent=intent,
        user_context=user_context
    )
    return [btn.to_dict() for btn in buttons]


def create_custom_button(
    label: str,
    action: str,
    button_type: str = "navigate",
    style: str = "primary",
    icon: Optional[str] = None
) -> Dict[str, Any]:
    """Create a custom button"""
    button = ActionButton(
        label=label,
        button_type=ButtonType(button_type),
        action=action,
        style=ButtonStyle(style),
        icon=icon
    )
    return button.to_dict()


def create_quick_reply_buttons(replies: List[str]) -> List[Dict[str, Any]]:
    """Create quick reply buttons from text options"""
    buttons = []
    for reply in replies:
        button = ActionButton(
            label=reply,
            button_type=ButtonType.QUICK_REPLY,
            action=reply,
            style=ButtonStyle.SECONDARY
        )
        buttons.append(button.to_dict())

    return buttons


# Health check
def health_check() -> Dict[str, Any]:
    """Check action button system status"""
    return {
        "button_types": [bt.value for bt in ButtonType],
        "button_styles": [bs.value for bs in ButtonStyle],
        "template_count": len([
            attr for attr in dir(ButtonTemplates)
            if not attr.startswith("_") and isinstance(getattr(ButtonTemplates, attr), ActionButton)
        ]),
        "features": {
            "contextual_suggestions": True,
            "click_tracking": True,
            "analytics": True,
            "quick_replies": True,
            "custom_buttons": True
        }
    }
