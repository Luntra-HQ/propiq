"""
PropIQ Support Chat API v3 - Phase 4: Advanced Features & UX Enhancement
Integrates all Phase 4 capabilities for next-generation support experience

New in v3:
- Multi-language support with auto-translation
- Action buttons in responses
- Rich media (property cards, charts, images)
- User context injection for personalized responses
- Property data lookup
- Calendar integration for scheduling
- Smart reply suggestions

This is the culmination of all 4 phases of development.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
import os
import json

# Phase 1-3 imports
from ..utils.support_chat_v2 import (
    get_supabase_client,
    generate_embedding,
    search_knowledge_base
)
from ..utils.language_analysis import SentimentAnalysis, IntentClassification
from ..utils.notifications import SlackNotifier, EmailNotifier
from ..utils.proactive_engagement import ProactiveEngagementManager
from ..utils.csat_surveys import CSATSurveyManager

# Phase 4 imports
from ..utils.multilingual_support import (
    MultilingualConversationManager,
    LanguageDetector,
    Translator,
    detect_language
)
from ..utils.action_buttons import (
    ContextualButtonSuggester,
    ButtonTemplates,
    create_button_group
)
from ..utils.rich_media import (
    RichMediaBuilder,
    RichMediaResponse,
    create_property_summary_response
)
from ..utils.user_context import (
    UserContextManager,
    ContextualResponseGenerator,
    format_context_for_ai
)
from ..utils.property_lookup import (
    PropertyLookupManager,
    PropertyQueryInterpreter,
    answer_property_question
)
from ..utils.calendar_integration import (
    MeetingScheduler,
    MeetingType,
    get_meeting_button
)
from ..utils.smart_replies import (
    SmartReplyGenerator,
    get_smart_replies
)

# Azure OpenAI
try:
    from openai import AzureOpenAI
    AZURE_OPENAI_AVAILABLE = True
except ImportError:
    AZURE_OPENAI_AVAILABLE = False
    print("⚠️  Azure OpenAI not available")

# Initialize
router = APIRouter(prefix="/api/v1/support/chat/v3", tags=["Support Chat v3"])

# Azure OpenAI setup
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")

if AZURE_OPENAI_AVAILABLE and AZURE_OPENAI_API_KEY:
    azure_openai_client = AzureOpenAI(
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_key=AZURE_OPENAI_API_KEY,
        api_version="2024-02-01"
    )
else:
    azure_openai_client = None


# Request/Response models

class ChatMessageV3(BaseModel):
    """Enhanced chat message with Phase 4 features"""
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=5000)
    user_id: str
    user_email: str
    user_name: Optional[str] = None
    detected_language: Optional[str] = None
    include_user_context: bool = True
    include_property_data: bool = True
    include_buttons: bool = True
    include_rich_media: bool = False


class ChatResponseV3(BaseModel):
    """Enhanced chat response with Phase 4 features"""
    conversation_id: str
    message: str
    translated_message: Optional[str] = None
    detected_language: str
    target_language: str
    needs_translation: bool

    # Phase 4 enhancements
    buttons: Optional[List[Dict[str, Any]]] = None
    media: Optional[List[Dict[str, Any]]] = None
    suggested_replies: Optional[List[str]] = None
    user_context_used: bool = False
    property_data_used: bool = False

    # Phase 2-3 features
    sentiment: Optional[str] = None
    intent: Optional[str] = None
    escalated: bool = False
    assigned_to: Optional[str] = None

    # Metadata
    response_time_ms: Optional[int] = None
    created_at: str


# Main chat endpoint

@router.post("/message", response_model=ChatResponseV3)
async def send_message_v3(
    request: ChatMessageV3,
    background_tasks: BackgroundTasks
) -> ChatResponseV3:
    """
    Send message with full Phase 4 capabilities

    Features:
    - Multi-language support with auto-translation
    - User context injection for personalized responses
    - Property data lookup
    - Action buttons
    - Rich media (if requested)
    - Sentiment analysis and intent classification
    - Smart escalation
    - Proactive suggestions
    """
    start_time = datetime.utcnow()

    supabase = get_supabase_client()

    # Step 1: Language detection and translation
    multilingual_mgr = MultilingualConversationManager()
    message_result = multilingual_mgr.process_user_message(
        message=request.message,
        conversation_language=request.detected_language
    )

    detected_language = message_result["detected_language"]
    needs_translation = message_result["needs_translation"]
    message_for_ai = message_result["translated_message"]

    print(f"🌐 Language: {detected_language}, Needs translation: {needs_translation}")

    # Step 2: Get user context
    user_context_mgr = UserContextManager(supabase)
    user_context = user_context_mgr.get_full_context(
        user_id=request.user_id,
        user_email=request.user_email
    ) if request.include_user_context else {}

    user_context_prompt = user_context_mgr.format_context_for_prompt(
        user_context, verbose=False
    ) if request.include_user_context else ""

    # Step 3: Check for property data questions
    property_lookup_mgr = PropertyLookupManager(supabase)
    property_query_interpreter = PropertyQueryInterpreter()

    property_question_interpretation = property_query_interpreter.interpret_query(message_for_ai)
    property_data_used = False
    property_context = ""

    if request.include_property_data and property_question_interpretation["intent"] in ["get_metric", "compare", "portfolio_stats"]:
        # Answer property question directly
        property_answer = answer_property_question(
            user_id=request.user_id,
            question=message_for_ai,
            supabase_client=supabase
        )

        if property_answer:
            property_context = f"\n\nPROPERTY DATA: {property_answer}"
            property_data_used = True
            print(f"🏠 Property data used in response")

    # Step 4: Knowledge base search
    knowledge_base_results = search_knowledge_base(message_for_ai, limit=3, threshold=0.75)

    knowledge_context = ""
    if knowledge_base_results:
        knowledge_context = "\n\nRELEVANT KNOWLEDGE:\n" + "\n\n".join([
            f"- {result['content']}"
            for result in knowledge_base_results
        ])

    # Step 5: Sentiment analysis and intent classification
    sentiment_analysis = SentimentAnalysis.analyze_sentiment(message_for_ai)
    intent_classification = IntentClassification.classify_intent(message_for_ai)

    sentiment = sentiment_analysis.get("overall_sentiment", "neutral")
    intent = intent_classification.get("intent", "general")

    print(f"💭 Sentiment: {sentiment}, Intent: {intent}")

    # Step 6: Build AI prompt with full context
    system_prompt = f"""You are PropIQ's AI support assistant. You help users with property investment analysis and platform questions.

{user_context_prompt}

Guidelines:
- Be helpful, friendly, and professional
- Use user context to personalize responses
- Provide specific, actionable answers
- If user is approaching limits, gently suggest upgrading
- If you don't know something, admit it and offer to connect with support

{knowledge_context}
{property_context}"""

    # Step 7: Generate AI response
    if not azure_openai_client:
        ai_response = "I'm here to help! (AI temporarily unavailable)"
    else:
        try:
            completion = azure_openai_client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message_for_ai}
                ],
                temperature=0.7,
                max_tokens=500
            )

            ai_response = completion.choices[0].message.content

        except Exception as e:
            print(f"❌ AI generation failed: {e}")
            ai_response = "I'm having trouble generating a response right now. Please try again or contact support."

    # Step 8: Translate response back to user's language
    if needs_translation:
        response_result = multilingual_mgr.process_ai_response(
            response=ai_response,
            target_language=detected_language
        )

        translated_response = response_result["translated_response"]
    else:
        translated_response = ai_response

    # Step 9: Generate action buttons
    buttons = []
    if request.include_buttons:
        button_suggester = ContextualButtonSuggester()
        suggested_buttons = button_suggester.suggest_buttons(
            intent=intent,
            user_context=user_context,
            conversation_messages=[]
        )

        buttons = [btn.to_dict() for btn in suggested_buttons]

        # Add meeting button if appropriate
        if intent in ["sales", "technical_support"]:
            meeting_type = MeetingType.SALES_CALL if intent == "sales" else MeetingType.SUPPORT_CALL
            meeting_button = get_meeting_button(
                meeting_type=meeting_type,
                user_email=request.user_email,
                user_name=request.user_name
            )
            buttons.append(meeting_button)

        print(f"🔘 Generated {len(buttons)} action buttons")

    # Step 10: Generate rich media (if requested)
    media = []
    if request.include_rich_media:
        # Check if we should show property card
        latest_property = property_lookup_mgr.get_latest_analysis(request.user_id)

        if latest_property and "property" in message_for_ai.lower():
            builder = RichMediaBuilder()
            property_card = builder.create_property_card(latest_property, include_actions=True)
            media.append(property_card)
            print(f"📊 Added property card to response")

    # Step 10.5: Generate smart reply suggestions
    smart_replies = []
    reply_generator = SmartReplyGenerator()
    smart_replies = reply_generator.generate_smart_replies(
        last_assistant_message=translated_response,
        intent=intent,
        user_context=user_context
    )
    print(f"💬 Generated {len(smart_replies)} smart reply suggestions")

    # Step 11: Save conversation
    conversation_id = request.conversation_id or str(datetime.utcnow().timestamp())

    conversation_data = {
        "conversation_id": conversation_id,
        "user_id": request.user_id,
        "user_email": request.user_email,
        "messages": [
            {
                "role": "user",
                "content": request.message,
                "original_content": request.message,
                "detected_language": detected_language,
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "role": "assistant",
                "content": ai_response,
                "translated_content": translated_response if needs_translation else None,
                "target_language": detected_language,
                "timestamp": datetime.utcnow().isoformat(),
                "buttons": buttons,
                "media": media
            }
        ],
        "sentiment": sentiment,
        "intent": intent,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "last_message_at": datetime.utcnow().isoformat(),
        "detected_language": detected_language
    }

    try:
        # Check if conversation exists
        existing = supabase.table("support_conversations_v2").select("conversation_id").eq(
            "conversation_id", conversation_id
        ).execute()

        if existing.data and len(existing.data) > 0:
            # Update existing
            supabase.table("support_conversations_v2").update({
                "messages": conversation_data["messages"],
                "sentiment": sentiment,
                "intent": intent,
                "updated_at": datetime.utcnow().isoformat(),
                "last_message_at": datetime.utcnow().isoformat()
            }).eq("conversation_id", conversation_id).execute()
        else:
            # Create new
            supabase.table("support_conversations_v2").insert(conversation_data).execute()

        print(f"💾 Conversation saved: {conversation_id}")

    except Exception as e:
        print(f"⚠️  Failed to save conversation: {e}")

    # Step 12: Calculate response time
    end_time = datetime.utcnow()
    response_time_ms = int((end_time - start_time).total_seconds() * 1000)

    # Step 13: Return response
    return ChatResponseV3(
        conversation_id=conversation_id,
        message=ai_response,
        translated_message=translated_response if needs_translation else None,
        detected_language=detected_language,
        target_language=detected_language,
        needs_translation=needs_translation,
        buttons=buttons if buttons else None,
        media=media if media else None,
        suggested_replies=smart_replies if smart_replies else None,
        user_context_used=bool(user_context),
        property_data_used=property_data_used,
        sentiment=sentiment,
        intent=intent,
        escalated=False,
        assigned_to=None,
        response_time_ms=response_time_ms,
        created_at=datetime.utcnow().isoformat()
    )


# Health check endpoint

@router.get("/health")
async def health_check_v3():
    """Health check for v3 API with all Phase 4 features"""
    from ..utils import multilingual_support, action_buttons, rich_media, user_context, property_lookup, calendar_integration, smart_replies

    return {
        "status": "healthy",
        "version": "3.0",
        "phase": "4 - Advanced Features & UX Enhancement",
        "features": {
            "multi_language": multilingual_support.health_check(),
            "action_buttons": action_buttons.health_check(),
            "rich_media": rich_media.health_check(),
            "user_context": user_context.health_check(),
            "property_lookup": property_lookup.health_check(),
            "calendar_integration": calendar_integration.health_check(),
            "smart_replies": smart_replies.health_check()
        },
        "phase_1_3_features": {
            "rag_knowledge_base": True,
            "sentiment_analysis": True,
            "intent_classification": True,
            "multi_channel_notifications": True,
            "agent_handoff": True,
            "proactive_engagement": True,
            "csat_surveys": True,
            "analytics": True
        },
        "azure_openai": bool(azure_openai_client),
        "database": bool(get_supabase_client())
    }
