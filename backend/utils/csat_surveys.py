"""
CSAT (Customer Satisfaction) Survey System for PropIQ Support Agent
Phase 3: Post-resolution feedback collection and analysis

This module handles:
- CSAT survey delivery (post-resolution)
- Rating collection (1-5 stars)
- Feedback text collection
- Survey analytics and reporting
- Automated follow-up based on rating
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from enum import Enum
import uuid


class CSATRating(Enum):
    """CSAT rating scale"""
    VERY_DISSATISFIED = 1
    DISSATISFIED = 2
    NEUTRAL = 3
    SATISFIED = 4
    VERY_SATISFIED = 5


class CSATCategory(Enum):
    """Categories for CSAT feedback"""
    RESPONSE_QUALITY = "response_quality"
    RESPONSE_SPEED = "response_speed"
    ISSUE_RESOLUTION = "issue_resolution"
    AGENT_HELPFULNESS = "agent_helpfulness"
    OVERALL_EXPERIENCE = "overall_experience"


class CSATSurveyManager:
    """Manages CSAT surveys and feedback"""

    # Survey templates
    SURVEY_TEMPLATES = {
        "post_resolution": {
            "title": "How was your support experience? ⭐",
            "message": """Your recent support conversation has been resolved. We'd love to hear about your experience!

Please rate your experience (1-5 stars):
⭐ Very Dissatisfied
⭐⭐ Dissatisfied
⭐⭐⭐ Neutral
⭐⭐⭐⭐ Satisfied
⭐⭐⭐⭐⭐ Very Satisfied

Your feedback helps us improve our service.""",
            "questions": [
                {
                    "id": "rating",
                    "type": "rating",
                    "question": "Overall, how satisfied were you with the support you received?",
                    "required": True
                },
                {
                    "id": "feedback",
                    "type": "text",
                    "question": "What did we do well? What could we improve?",
                    "required": False
                },
                {
                    "id": "categories",
                    "type": "multi_select",
                    "question": "Rate these aspects of your experience (optional):",
                    "options": [
                        {"label": "Response Quality", "value": "response_quality"},
                        {"label": "Response Speed", "value": "response_speed"},
                        {"label": "Issue Resolution", "value": "issue_resolution"},
                        {"label": "Helpfulness", "value": "agent_helpfulness"}
                    ],
                    "required": False
                }
            ]
        },

        "escalation_follow_up": {
            "title": "How did we handle your escalated issue?",
            "message": """Your support issue was escalated to our team. We want to make sure it was resolved to your satisfaction.

Please share your feedback:""",
            "questions": [
                {
                    "id": "rating",
                    "type": "rating",
                    "question": "How satisfied are you with how your issue was handled?",
                    "required": True
                },
                {
                    "id": "resolution_quality",
                    "type": "rating",
                    "question": "How satisfied are you with the resolution?",
                    "required": True
                },
                {
                    "id": "feedback",
                    "type": "text",
                    "question": "Any additional feedback?",
                    "required": False
                }
            ]
        }
    }

    def __init__(self, supabase_client=None):
        """
        Initialize CSAT survey manager

        Args:
            supabase_client: Supabase client for data storage
        """
        self.supabase = supabase_client

    def send_survey(
        self,
        conversation_id: str,
        user_id: str,
        user_email: str,
        survey_type: str = "post_resolution",
        context: Dict[str, Any] = None
    ) -> str:
        """
        Send CSAT survey to user

        Args:
            conversation_id: Conversation ID
            user_id: User ID
            user_email: User email
            survey_type: Type of survey ("post_resolution", "escalation_follow_up")
            context: Additional context for survey rendering

        Returns:
            Survey ID
        """
        survey_id = str(uuid.uuid4())
        timestamp = datetime.utcnow()

        if survey_type not in self.SURVEY_TEMPLATES:
            raise ValueError(f"Unknown survey type: {survey_type}")

        template = self.SURVEY_TEMPLATES[survey_type]

        # Create survey record
        survey_data = {
            "survey_id": survey_id,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "user_email": user_email,
            "survey_type": survey_type,
            "title": template["title"],
            "message": template["message"],
            "questions": template["questions"],
            "status": "sent",
            "sent_at": timestamp.isoformat(),
            "created_at": timestamp.isoformat()
        }

        # Save to database
        if self.supabase:
            try:
                self.supabase.table("csat_surveys").insert(survey_data).execute()
                print(f"✅ CSAT survey sent: {survey_id} for conversation {conversation_id}")
            except Exception as e:
                print(f"⚠️  Failed to save CSAT survey: {e}")

        # Update conversation with survey ID
        if self.supabase:
            try:
                self.supabase.table("support_conversations_v2").update({
                    "csat_survey_sent": True,
                    "csat_survey_id": survey_id,
                    "csat_survey_sent_at": timestamp.isoformat()
                }).eq("conversation_id", conversation_id).execute()
            except Exception as e:
                print(f"⚠️  Failed to update conversation with survey ID: {e}")

        return survey_id

    def submit_survey_response(
        self,
        survey_id: str,
        rating: int,
        feedback: Optional[str] = None,
        category_ratings: Optional[Dict[str, int]] = None,
        user_id: Optional[str] = None
    ) -> bool:
        """
        Submit CSAT survey response

        Args:
            survey_id: Survey ID
            rating: Overall rating (1-5)
            feedback: Optional feedback text
            category_ratings: Optional ratings by category
            user_id: User ID (for verification)

        Returns:
            Success status
        """
        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5")

        timestamp = datetime.utcnow()

        # Get survey
        if not self.supabase:
            print("⚠️  Database not available")
            return False

        try:
            survey_result = self.supabase.table("csat_surveys").select("*").eq(
                "survey_id", survey_id
            ).execute()

            if not survey_result.data or len(survey_result.data) == 0:
                print(f"⚠️  Survey not found: {survey_id}")
                return False

            survey = survey_result.data[0]

            # Verify user ID if provided
            if user_id and survey["user_id"] != user_id:
                print(f"⚠️  User ID mismatch for survey {survey_id}")
                return False

            # Update survey with response
            response_data = {
                "rating": rating,
                "feedback": feedback,
                "category_ratings": category_ratings or {},
                "status": "completed",
                "responded_at": timestamp.isoformat(),
                "updated_at": timestamp.isoformat()
            }

            self.supabase.table("csat_surveys").update(response_data).eq(
                "survey_id", survey_id
            ).execute()

            # Update conversation with CSAT data
            conversation_id = survey["conversation_id"]
            self.supabase.table("support_conversations_v2").update({
                "csat_rating": rating,
                "csat_feedback": feedback,
                "csat_timestamp": timestamp.isoformat()
            }).eq("conversation_id", conversation_id).execute()

            print(f"✅ CSAT response recorded: {survey_id} - Rating: {rating}/5")

            # Trigger follow-up if rating is low
            if rating <= 2:
                self._handle_low_rating(survey_id, conversation_id, rating, feedback)

            return True

        except Exception as e:
            print(f"❌ Failed to submit survey response: {e}")
            return False

    def _handle_low_rating(
        self,
        survey_id: str,
        conversation_id: str,
        rating: int,
        feedback: Optional[str]
    ):
        """
        Handle low CSAT rating (1-2 stars)

        Args:
            survey_id: Survey ID
            conversation_id: Conversation ID
            rating: Rating given (1-2)
            feedback: User feedback
        """
        print(f"🚨 Low CSAT rating detected: {rating}/5 for survey {survey_id}")

        # TODO: Send notification to support team
        # NotificationManager.send_low_csat_alert(
        #     conversation_id=conversation_id,
        #     rating=rating,
        #     feedback=feedback
        # )

        # TODO: Create follow-up task for support team
        # TaskManager.create_task(
        #     type="follow_up_low_csat",
        #     conversation_id=conversation_id,
        #     priority="high"
        # )

    def get_survey_statistics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        survey_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get CSAT survey statistics

        Args:
            start_date: Start date for filtering
            end_date: End date for filtering
            survey_type: Filter by survey type

        Returns:
            Survey statistics
        """
        if not self.supabase:
            return {"error": "Database not available"}

        try:
            # Build query
            query = self.supabase.table("csat_surveys").select("*")

            if start_date:
                query = query.gte("created_at", start_date.isoformat())

            if end_date:
                query = query.lte("created_at", end_date.isoformat())

            if survey_type:
                query = query.eq("survey_type", survey_type)

            # Execute query
            result = query.execute()
            surveys = result.data

            if not surveys:
                return {
                    "total_sent": 0,
                    "total_responded": 0,
                    "response_rate": 0,
                    "avg_rating": 0,
                    "rating_distribution": {}
                }

            # Calculate statistics
            total_sent = len(surveys)
            responded = [s for s in surveys if s.get("status") == "completed"]
            total_responded = len(responded)

            response_rate = (total_responded / total_sent * 100) if total_sent > 0 else 0

            # Average rating
            ratings = [s["rating"] for s in responded if s.get("rating")]
            avg_rating = sum(ratings) / len(ratings) if ratings else 0

            # Rating distribution
            rating_distribution = {i: 0 for i in range(1, 6)}
            for rating in ratings:
                rating_distribution[rating] += 1

            # NPS calculation (promoters - detractors)
            promoters = sum(1 for r in ratings if r >= 4)
            detractors = sum(1 for r in ratings if r <= 2)
            nps = ((promoters - detractors) / total_responded * 100) if total_responded > 0 else 0

            return {
                "total_sent": total_sent,
                "total_responded": total_responded,
                "response_rate": round(response_rate, 1),
                "avg_rating": round(avg_rating, 2),
                "rating_distribution": rating_distribution,
                "nps": round(nps, 1),
                "promoters": promoters,
                "passives": sum(1 for r in ratings if r == 3),
                "detractors": detractors
            }

        except Exception as e:
            print(f"❌ Failed to get survey statistics: {e}")
            return {"error": str(e)}

    def get_feedback_summary(
        self,
        min_rating: Optional[int] = None,
        max_rating: Optional[int] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get recent feedback responses

        Args:
            min_rating: Minimum rating filter
            max_rating: Maximum rating filter
            limit: Maximum number of responses

        Returns:
            List of feedback responses
        """
        if not self.supabase:
            return []

        try:
            query = self.supabase.table("csat_surveys").select(
                "survey_id, conversation_id, user_email, rating, feedback, responded_at"
            ).eq("status", "completed").order("responded_at", desc=True).limit(limit)

            if min_rating:
                query = query.gte("rating", min_rating)

            if max_rating:
                query = query.lte("rating", max_rating)

            result = query.execute()

            return result.data if result.data else []

        except Exception as e:
            print(f"❌ Failed to get feedback summary: {e}")
            return []


# CSAT trigger conditions
def should_send_csat_survey(conversation: Dict[str, Any]) -> bool:
    """
    Determine if CSAT survey should be sent for conversation

    Args:
        conversation: Conversation data

    Returns:
        True if survey should be sent
    """
    # Only send for resolved conversations
    if conversation.get("status") != "resolved":
        return False

    # Don't send if already sent
    if conversation.get("csat_survey_sent"):
        return False

    # Don't send for very short conversations (< 2 turns)
    messages = conversation.get("messages", [])
    if len(messages) < 4:  # 2 user + 2 assistant messages
        return False

    # Don't send for proactive conversations (no user request)
    if conversation.get("is_proactive"):
        return False

    return True


def get_csat_emoji(rating: int) -> str:
    """Get emoji for CSAT rating"""
    emoji_map = {
        1: "😞",
        2: "🙁",
        3: "😐",
        4: "😊",
        5: "🌟"
    }
    return emoji_map.get(rating, "⭐")


def get_csat_label(rating: int) -> str:
    """Get label for CSAT rating"""
    label_map = {
        1: "Very Dissatisfied",
        2: "Dissatisfied",
        3: "Neutral",
        4: "Satisfied",
        5: "Very Satisfied"
    }
    return label_map.get(rating, "Unknown")


# Health check
def health_check() -> Dict[str, Any]:
    """Check CSAT system status"""
    return {
        "survey_types": list(CSATSurveyManager.SURVEY_TEMPLATES.keys()),
        "rating_scale": "1-5",
        "features": {
            "post_resolution_surveys": True,
            "escalation_follow_ups": True,
            "category_ratings": True,
            "nps_calculation": True,
            "low_rating_alerts": True
        }
    }
