"""
Smart Reply Suggestions for PropIQ Support Agent
Phase 4: Gmail-style quick reply suggestions

This module handles:
- Context-aware reply suggestions
- Intent-based quick responses
- Personalized reply options
- Multi-language reply support
- Reply analytics and optimization

Smart replies save time and improve user experience.
"""

from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime


class ReplyType(Enum):
    """Types of smart replies"""
    AFFIRMATIVE = "affirmative"  # Yes, Sure, Okay
    NEGATIVE = "negative"  # No, Not now
    QUESTION = "question"  # Tell me more, How does it work?
    ACTION = "action"  # Show me, Let's do it
    GRATITUDE = "gratitude"  # Thank you, Thanks
    FOLLOW_UP = "follow_up"  # What's next?, Anything else?


class SmartReplyGenerator:
    """Generate contextual smart reply suggestions"""

    # Base reply templates
    BASE_REPLIES = {
        ReplyType.AFFIRMATIVE: [
            "Yes, please",
            "Sure",
            "That sounds good",
            "Okay",
            "I'd like that"
        ],
        ReplyType.NEGATIVE: [
            "No, thank you",
            "Not right now",
            "Maybe later",
            "I'll pass"
        ],
        ReplyType.QUESTION: [
            "Tell me more",
            "How does it work?",
            "Can you explain?",
            "What are my options?"
        ],
        ReplyType.ACTION: [
            "Show me",
            "Let's do it",
            "Take me there",
            "Get started"
        ],
        ReplyType.GRATITUDE: [
            "Thank you",
            "Thanks!",
            "Appreciate it",
            "That helps"
        ],
        ReplyType.FOLLOW_UP: [
            "What's next?",
            "Anything else?",
            "What do you recommend?",
            "Tell me more"
        ]
    }

    @staticmethod
    def generate_smart_replies(
        last_assistant_message: str,
        intent: Optional[str] = None,
        user_context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None
    ) -> List[str]:
        """
        Generate smart reply suggestions based on context

        Args:
            last_assistant_message: Last message from assistant
            intent: Classified intent
            user_context: User context data
            conversation_history: Full conversation history

        Returns:
            List of 3 suggested replies
        """
        replies = []

        last_message_lower = last_assistant_message.lower()

        # Detect questions
        if "?" in last_assistant_message:
            if "would you like" in last_message_lower or "do you want" in last_message_lower:
                # Yes/No question
                replies = ["Yes, please", "No, thank you", "Tell me more"]

            elif "how can i help" in last_message_lower or "what can i help" in last_message_lower:
                # Open-ended help question
                replies = SmartReplyGenerator._get_help_replies(intent, user_context)

            elif "upgrade" in last_message_lower or "plan" in last_message_lower:
                # Upgrade question
                replies = ["Show me pricing", "Not right now", "What's included?"]

            elif "schedule" in last_message_lower or "call" in last_message_lower:
                # Meeting question
                replies = ["Yes, schedule a call", "Not now", "Send me details"]

            else:
                # Generic question
                replies = ["Yes", "No", "Tell me more"]

        # Detect offers/suggestions
        elif any(keyword in last_message_lower for keyword in ["you can", "try", "check out", "consider"]):
            replies = ["Show me", "Sounds good", "Maybe later"]

        # Detect completion/success messages
        elif any(keyword in last_message_lower for keyword in ["done", "complete", "ready", "all set"]):
            replies = ["Thanks!", "What's next?", "Perfect"]

        # Detect explanations
        elif len(last_assistant_message) > 200:  # Long explanation
            replies = ["That helps, thanks", "Tell me more", "Got it"]

        # Default replies based on intent
        else:
            replies = SmartReplyGenerator._get_intent_based_replies(intent, user_context)

        # Ensure we have exactly 3 replies
        while len(replies) < 3:
            replies.append("Continue")

        return replies[:3]

    @staticmethod
    def _get_help_replies(
        intent: Optional[str],
        user_context: Optional[Dict[str, Any]]
    ) -> List[str]:
        """Get help-specific replies"""
        user_context = user_context or {}
        subscription = user_context.get("subscription", {})
        insights = user_context.get("insights", {})

        tier = subscription.get("tier", "free")

        replies = []

        # New users
        if insights.get("new_user"):
            replies = ["Analyze a property", "View pricing", "Show me around"]

        # Free users
        elif tier == "free":
            replies = ["Analyze a property", "View plans", "Get help"]

        # Paid users
        elif tier in ["starter", "pro", "elite"]:
            replies = ["Analyze a property", "View my analyses", "Account settings"]

        else:
            replies = ["Analyze a property", "View pricing", "Get help"]

        return replies

    @staticmethod
    def _get_intent_based_replies(
        intent: Optional[str],
        user_context: Optional[Dict[str, Any]]
    ) -> List[str]:
        """Get replies based on conversation intent"""
        if intent == "sales":
            return ["View pricing", "Schedule a call", "Tell me more"]

        elif intent == "billing":
            return ["Manage billing", "View plans", "Contact support"]

        elif intent == "technical_support":
            return ["Schedule support call", "View docs", "Continue"]

        elif intent == "feature_question":
            return ["Show me", "Try it", "Learn more"]

        elif intent == "account_management":
            return ["Account settings", "Update profile", "Manage billing"]

        else:
            return ["Continue", "Thanks", "Tell me more"]

    @staticmethod
    def generate_contextual_replies(
        conversation_messages: List[Dict[str, Any]],
        intent: Optional[str] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """
        Generate replies based on full conversation context

        Args:
            conversation_messages: Full conversation history
            intent: Classified intent
            user_context: User context

        Returns:
            List of suggested replies
        """
        if not conversation_messages or len(conversation_messages) == 0:
            return ["Hi there", "I need help", "Get started"]

        # Get last assistant message
        last_assistant_message = None
        for msg in reversed(conversation_messages):
            if msg.get("role") == "assistant":
                last_assistant_message = msg.get("content", "")
                break

        if last_assistant_message:
            return SmartReplyGenerator.generate_smart_replies(
                last_assistant_message=last_assistant_message,
                intent=intent,
                user_context=user_context,
                conversation_history=conversation_messages
            )

        # Fallback
        return ["Continue", "Thanks", "Tell me more"]


class ReplyPersonalizer:
    """Personalize replies based on user preferences and language"""

    @staticmethod
    def personalize_replies(
        replies: List[str],
        user_context: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> List[str]:
        """
        Personalize reply suggestions

        Args:
            replies: Base reply suggestions
            user_context: User context
            language: Target language

        Returns:
            Personalized replies
        """
        # TODO: In production, translate replies to user's language
        # For now, just return as-is

        user_context = user_context or {}
        preferences = user_context.get("preferences", {})

        # Apply user preferences (formal vs casual, etc.)
        tone = preferences.get("tone", "friendly")

        if tone == "formal":
            # Make replies more formal
            reply_map = {
                "Thanks!": "Thank you",
                "Got it": "Understood",
                "Sure": "Certainly",
                "Okay": "Very well"
            }

            replies = [reply_map.get(r, r) for r in replies]

        elif tone == "casual":
            # Make replies more casual
            reply_map = {
                "Thank you": "Thanks!",
                "Understood": "Got it",
                "Certainly": "Sure thing"
            }

            replies = [reply_map.get(r, r) for r in replies]

        return replies


class ReplyAnalytics:
    """Track smart reply usage and effectiveness"""

    def __init__(self, supabase_client=None):
        """
        Initialize reply analytics

        Args:
            supabase_client: Supabase client for logging
        """
        self.supabase = supabase_client

    def track_reply_usage(
        self,
        conversation_id: str,
        user_id: str,
        suggested_replies: List[str],
        selected_reply: Optional[str] = None
    ):
        """
        Track smart reply usage

        Args:
            conversation_id: Conversation ID
            user_id: User ID
            suggested_replies: Replies that were suggested
            selected_reply: Reply that was selected (if any)
        """
        timestamp = datetime.utcnow()

        usage_log = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "suggested_replies": suggested_replies,
            "selected_reply": selected_reply,
            "was_used": selected_reply is not None,
            "created_at": timestamp.isoformat()
        }

        if self.supabase:
            try:
                self.supabase.table("smart_reply_usage").insert(usage_log).execute()
                print(f"📊 Smart reply usage tracked: {'Used' if selected_reply else 'Not used'}")
            except Exception as e:
                print(f"⚠️  Failed to track smart reply usage: {e}")

    def get_reply_statistics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get smart reply usage statistics

        Args:
            start_date: Start date filter
            end_date: End date filter

        Returns:
            Usage statistics
        """
        if not self.supabase:
            return {"error": "Database not available"}

        try:
            query = self.supabase.table("smart_reply_usage").select("*")

            if start_date:
                query = query.gte("created_at", start_date.isoformat())

            if end_date:
                query = query.lte("created_at", end_date.isoformat())

            result = query.execute()
            logs = result.data if result.data else []

            total_shown = len(logs)
            total_used = sum(1 for log in logs if log.get("was_used"))

            usage_rate = (total_used / total_shown * 100) if total_shown > 0 else 0

            # Count most popular replies
            reply_counts = {}
            for log in logs:
                selected = log.get("selected_reply")
                if selected:
                    reply_counts[selected] = reply_counts.get(selected, 0) + 1

            top_replies = sorted(
                reply_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]

            return {
                "total_shown": total_shown,
                "total_used": total_used,
                "usage_rate": round(usage_rate, 1),
                "top_replies": [
                    {"reply": reply, "count": count}
                    for reply, count in top_replies
                ]
            }

        except Exception as e:
            print(f"❌ Failed to get reply statistics: {e}")
            return {"error": str(e)}


# Convenience functions

def get_smart_replies(
    last_message: str,
    intent: Optional[str] = None,
    user_context: Optional[Dict[str, Any]] = None
) -> List[str]:
    """Quick function to get smart replies"""
    generator = SmartReplyGenerator()
    return generator.generate_smart_replies(
        last_assistant_message=last_message,
        intent=intent,
        user_context=user_context
    )


def get_smart_replies_for_conversation(
    conversation_messages: List[Dict[str, Any]],
    intent: Optional[str] = None,
    user_context: Optional[Dict[str, Any]] = None
) -> List[str]:
    """Quick function to get smart replies from conversation"""
    generator = SmartReplyGenerator()
    return generator.generate_contextual_replies(
        conversation_messages=conversation_messages,
        intent=intent,
        user_context=user_context
    )


# Health check
def health_check() -> Dict[str, Any]:
    """Check smart reply system status"""
    return {
        "reply_types": [rt.value for rt in ReplyType],
        "base_reply_count": sum(len(replies) for replies in SmartReplyGenerator.BASE_REPLIES.values()),
        "features": {
            "context_aware_suggestions": True,
            "intent_based_replies": True,
            "personalization": True,
            "usage_analytics": True,
            "multi_language_support": False  # TODO: Integrate with multilingual_support
        }
    }
