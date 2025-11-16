"""
PropIQ Enhanced Support Chat - Phase 2
Advanced Conversation Intelligence with RAG

New in Phase 2:
- Azure AI Language Service integration (production sentiment analysis)
- Advanced intent classification with priority routing
- Multi-channel escalation notifications (Slack + Email)
- Human agent handoff workflows
- Conversation assignment system
- Enhanced analytics and monitoring
"""

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import uuid
from openai import AzureOpenAI

# Import Phase 1 utilities
from utils.pagination import (
    PaginationParams,
    PaginatedResponse,
    create_pagination_meta
)

# Import Phase 2 utilities
from utils.language_analysis import (
    analyze_message_sentiment,
    classify_message_intent,
    analyze_conversation,
    SentimentAnalysis,
    IntentClassification
)
from utils.notifications import (
    NotificationManager,
    EscalationReason,
    NotificationPriority
)

# Supabase for vector storage
try:
    from database_supabase import get_supabase_client
    supabase = get_supabase_client()
    DATABASE_AVAILABLE = True
except Exception as e:
    print(f"⚠️  Database not available for support chat: {e}")
    DATABASE_AVAILABLE = False
    supabase = None

# JWT auth
try:
    from auth import verify_token
except:
    def verify_token(authorization: str = None):
        return {"sub": "guest", "email": "guest@propiq.com", "name": "Guest User"}

router = APIRouter(prefix="/support/v2", tags=["support-v2"])

# Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-15-preview"
)

# Configuration
EMBEDDING_MODEL = "text-embedding-3-small"
CHAT_MODEL = "gpt-4o-mini"
SIMILARITY_THRESHOLD = 0.75
MAX_CONTEXT_CHUNKS = 5
MAX_TOKENS = 500
TEMPERATURE = 0.7

# Escalation thresholds
ESCALATION_CONFIG = {
    "max_agent_turns": 4,  # Escalate after 4 AI responses without resolution
    "negative_sentiment_threshold": 0.75,  # Confidence threshold for negative sentiment
    "high_priority_intents": ["billing", "technical_support"],
    "auto_escalate_keywords": [
        "speak to a person", "talk to someone", "human agent",
        "this isn't working", "not helpful", "terrible", "awful"
    ]
}


# Models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None
    sources: Optional[List[str]] = None

class SendMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    conversation_id: str
    message: str
    response: str
    timestamp: datetime
    sources: Optional[List[Dict[str, str]]] = None
    confidence: Optional[float] = None
    escalated: Optional[bool] = False
    sentiment: Optional[str] = None
    intent: Optional[str] = None
    assigned_to: Optional[str] = None

class ConversationHistory(BaseModel):
    conversation_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
    sentiment: Optional[str] = None
    intent: Optional[str] = None
    escalated: Optional[bool] = False
    assigned_to: Optional[str] = None
    escalation_reason: Optional[str] = None

class ConversationSummary(BaseModel):
    conversation_id: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    last_message: str
    sentiment: Optional[str] = None
    intent: Optional[str] = None
    escalated: Optional[bool] = False
    assigned_to: Optional[str] = None
    priority: Optional[str] = None

class AssignConversationRequest(BaseModel):
    agent_email: str
    agent_name: str

class ResolveConversationRequest(BaseModel):
    resolution_notes: Optional[str] = None


# Enhanced System Prompt
SUPPORT_AGENT_PROMPT = """You are an expert customer support agent for PropIQ, an AI-powered real estate investment analysis platform.

**Your role**:
- Help users understand and use PropIQ's features effectively
- Answer questions about property analysis, subscriptions, pricing, and platform functionality
- Guide users through workflows with clear, actionable steps
- Provide accurate information grounded in the knowledge base
- Be friendly, professional, empathetic, and solution-oriented

**PropIQ Platform Overview**:
- **Property Analysis**: AI-powered investment analysis for residential and commercial real estate
- **Subscription Tiers**:
  * Free: 3 trial property analyses (no credit card required)
  * Starter ($29/mo): 20 analyses/month + basic features
  * Pro ($79/mo): 100 analyses/month + Property Advisor multi-agent system
  * Elite ($199/mo): Unlimited analyses + priority support + API access

**Response Guidelines**:
- Keep responses under 200 words (concise and scannable)
- Use bullet points for lists and steps
- If you don't know something, say "I don't have that information, but I can connect you with our team"
- NEVER make up features, pricing, or technical details
- Cite knowledge base sources when providing detailed information
- If a user seems frustrated or issue is unresolved after 2-3 turns, suggest connecting with a team member

**Tone**: Helpful, professional, empathetic, and solution-oriented
"""


# RAG Functions
def generate_embedding(text: str) -> List[float]:
    """Generate text embedding using Azure OpenAI"""
    try:
        response = client.embeddings.create(model=EMBEDDING_MODEL, input=text)
        return response.data[0].embedding
    except Exception as e:
        print(f"⚠️  Embedding generation failed: {e}")
        return None


def search_knowledge_base(query: str, limit: int = MAX_CONTEXT_CHUNKS, threshold: float = SIMILARITY_THRESHOLD) -> List[Dict[str, Any]]:
    """Search knowledge base using vector similarity"""
    if not DATABASE_AVAILABLE:
        return []

    try:
        query_embedding = generate_embedding(query)
        if not query_embedding:
            return []

        result = supabase.rpc(
            "match_support_documents",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": limit
            }
        ).execute()

        return result.data if result.data else []

    except Exception as e:
        print(f"⚠️  Knowledge base search failed: {e}")
        return []


def build_context_from_sources(sources: List[Dict[str, Any]]) -> str:
    """Build context string from knowledge base sources"""
    if not sources:
        return ""

    context_parts = ["**Relevant Knowledge Base Information:**\n"]

    for idx, source in enumerate(sources, 1):
        content = source.get("content", "")
        metadata = source.get("metadata", {})
        source_name = metadata.get("source", "Documentation")
        context_parts.append(f"{idx}. [{source_name}] {content}\n")

    context_parts.append(
        "\nUse the above information to answer the user's question accurately. "
        "If the knowledge base doesn't contain relevant information, say so honestly."
    )

    return "\n".join(context_parts)


def determine_escalation(
    conversation_messages: List[Dict],
    sentiment_analysis: Dict[str, Any],
    intent_classification: Dict[str, Any]
) -> tuple[bool, Optional[EscalationReason], NotificationPriority]:
    """
    Determine if conversation should be escalated with advanced logic

    Returns:
        (should_escalate, reason, priority)
    """
    # Check negative sentiment with high confidence
    if sentiment_analysis.get("overall_sentiment") == "negative":
        confidence = sentiment_analysis.get("confidence", 0)
        if confidence >= ESCALATION_CONFIG["negative_sentiment_threshold"]:
            return True, EscalationReason.NEGATIVE_SENTIMENT, NotificationPriority.HIGH

    # Check for user frustration pattern
    if sentiment_analysis.get("user_frustration_detected", False):
        return True, EscalationReason.NEGATIVE_SENTIMENT, NotificationPriority.HIGH

    # Check conversation length (not resolving)
    agent_turns = sum(1 for msg in conversation_messages if msg.get("role") == "assistant")
    if agent_turns >= ESCALATION_CONFIG["max_agent_turns"]:
        return True, EscalationReason.UNRESOLVED_ISSUE, NotificationPriority.MEDIUM

    # Check high-priority intents
    intent = intent_classification.get("intent", "general")
    if intent in ESCALATION_CONFIG["high_priority_intents"]:
        if intent_classification.get("priority") == "high":
            reason = EscalationReason.BILLING_ISSUE if intent == "billing" else EscalationReason.TECHNICAL_ERROR
            return True, reason, NotificationPriority.HIGH

    # Check for explicit escalation keywords
    last_user_message = next(
        (msg["content"] for msg in reversed(conversation_messages) if msg.get("role") == "user"),
        ""
    ).lower()

    for keyword in ESCALATION_CONFIG["auto_escalate_keywords"]:
        if keyword in last_user_message:
            return True, EscalationReason.USER_REQUEST, NotificationPriority.MEDIUM

    return False, None, NotificationPriority.LOW


# API Endpoints

@router.post("/chat", response_model=ChatResponse)
async def send_support_message_v2(
    request: SendMessageRequest,
    background_tasks: BackgroundTasks,
    token_payload: dict = Depends(verify_token)
):
    """
    Send a message to the PropIQ support agent with Phase 2 enhancements

    New in Phase 2:
    - Azure AI Language Service sentiment analysis
    - Advanced intent classification
    - Multi-channel escalation notifications
    - Priority routing
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Support chat temporarily unavailable")

    user_id = token_payload.get("sub", "guest")
    user_email = token_payload.get("email", "guest@propiq.com")
    user_name = token_payload.get("name", user_email.split("@")[0])

    try:
        # Step 1: Load conversation history
        conversation_messages = []
        conversation_id = request.conversation_id

        if conversation_id:
            result = supabase.table("support_conversations_v2").select("*").eq(
                "conversation_id", conversation_id
            ).eq("user_id", user_id).execute()

            if result.data and len(result.data) > 0:
                conversation_messages = result.data[0].get("messages", [])

        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        # Step 2: Analyze user message (Phase 2 enhancement)
        print(f"🔍 Analyzing message with Azure AI Language...")
        sentiment_result = analyze_message_sentiment(request.message)
        intent_result = classify_message_intent(request.message)

        print(f"  Sentiment: {sentiment_result.get('sentiment')} (confidence: {sentiment_result.get('confidence_scores', {}).get(sentiment_result.get('sentiment'), 0):.2f})")
        print(f"  Intent: {intent_result.get('intent')} (priority: {intent_result.get('priority')})")

        # Step 3: Search knowledge base for context
        knowledge_sources = search_knowledge_base(request.message)
        context_string = build_context_from_sources(knowledge_sources)

        # Step 4: Build enhanced system prompt
        enhanced_system_prompt = SUPPORT_AGENT_PROMPT
        if context_string:
            enhanced_system_prompt += f"\n\n{context_string}"

        # Step 5: Build messages for OpenAI
        messages = [{"role": "system", "content": enhanced_system_prompt}]

        for msg in conversation_messages[-10:]:
            messages.append({
                "role": msg.get("role"),
                "content": msg.get("content")
            })

        messages.append({"role": "user", "content": request.message})

        # Step 6: Generate AI response
        print(f"🤖 Generating AI response with {len(knowledge_sources)} knowledge sources")
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=messages,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS
        )

        ai_response = response.choices[0].message.content
        timestamp = datetime.utcnow()

        # Step 7: Prepare source citations
        sources_cited = [
            {
                "source": src.get("metadata", {}).get("source", "Documentation"),
                "category": src.get("metadata", {}).get("category", "General"),
                "relevance": src.get("similarity", 0.0)
            }
            for src in knowledge_sources
        ] if knowledge_sources else None

        # Step 8: Update conversation messages
        updated_messages = conversation_messages + [
            {
                "role": "user",
                "content": request.message,
                "timestamp": timestamp.isoformat(),
                "sentiment": sentiment_result.get("sentiment"),
                "intent": intent_result.get("intent")
            },
            {
                "role": "assistant",
                "content": ai_response,
                "timestamp": timestamp.isoformat(),
                "sources": sources_cited
            }
        ]

        # Step 9: Analyze overall conversation sentiment (Phase 2)
        conversation_analysis = SentimentAnalysis.analyze_conversation_sentiment(updated_messages)

        # Step 10: Determine escalation (Phase 2)
        should_escalate, escalation_reason, priority = determine_escalation(
            updated_messages,
            conversation_analysis,
            intent_result
        )

        if should_escalate:
            ai_response += "\n\n_I'll connect you with a team member who can provide more specialized assistance. Someone will reach out to you shortly._"
            print(f"⚠️  Conversation {conversation_id} flagged for escalation: {escalation_reason.value}")

            # Send escalation notifications (Phase 2)
            conversation_summary = f"{len(updated_messages)} messages exchanged. Last intent: {intent_result.get('intent')}. Sentiment: {conversation_analysis.get('overall_sentiment')}."

            background_tasks.add_task(
                NotificationManager.send_escalation,
                conversation_id=conversation_id,
                user_email=user_email,
                user_name=user_name,
                reason=escalation_reason,
                sentiment=conversation_analysis.get("overall_sentiment"),
                intent=intent_result.get("intent"),
                last_message=request.message,
                conversation_summary=conversation_summary,
                priority=priority
            )

        # Step 11: Save conversation to database
        conversation_data = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "user_email": user_email,
            "user_name": user_name,
            "messages": updated_messages,
            "sentiment": conversation_analysis.get("overall_sentiment"),
            "intent": intent_result.get("intent"),
            "priority": intent_result.get("priority"),
            "escalated": should_escalate,
            "escalation_reason": escalation_reason.value if escalation_reason else None,
            "last_message_at": timestamp.isoformat(),
            "updated_at": timestamp.isoformat()
        }

        # Upsert conversation
        existing = supabase.table("support_conversations_v2").select("id").eq(
            "conversation_id", conversation_id
        ).execute()

        if existing.data and len(existing.data) > 0:
            supabase.table("support_conversations_v2").update(
                conversation_data
            ).eq("conversation_id", conversation_id).execute()
        else:
            conversation_data["created_at"] = timestamp.isoformat()
            supabase.table("support_conversations_v2").insert(conversation_data).execute()

        # Step 12: Return response
        return ChatResponse(
            success=True,
            conversation_id=conversation_id,
            message=request.message,
            response=ai_response,
            timestamp=timestamp,
            sources=sources_cited,
            confidence=knowledge_sources[0].get("similarity", 0.0) if knowledge_sources else 0.0,
            escalated=should_escalate,
            sentiment=conversation_analysis.get("overall_sentiment"),
            intent=intent_result.get("intent")
        )

    except Exception as e:
        print(f"❌ Support chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Support chat failed: {str(e)}")


@router.post("/conversations/{conversation_id}/assign")
async def assign_conversation(
    conversation_id: str,
    request: AssignConversationRequest,
    background_tasks: BackgroundTasks,
    token_payload: dict = Depends(verify_token)
):
    """
    Assign conversation to a human agent (Phase 2 feature)

    Args:
        conversation_id: Conversation to assign
        request: Agent details

    Returns:
        Success status
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    # Only admins/agents can assign (TODO: Add proper role check)
    # user_role = token_payload.get("role")
    # if user_role not in ["admin", "agent"]:
    #     raise HTTPException(status_code=403, detail="Only agents can assign conversations")

    try:
        # Update conversation with assignment
        result = supabase.table("support_conversations_v2").update({
            "assigned_to": request.agent_email,
            "assigned_to_name": request.agent_name,
            "assigned_at": datetime.utcnow().isoformat(),
            "status": "assigned"
        }).eq("conversation_id", conversation_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Get conversation details for notification
        conv = result.data[0]

        # Send assignment notification
        background_tasks.add_task(
            NotificationManager.send_assignment,
            conversation_id=conversation_id,
            user_email=conv.get("user_email"),
            assigned_to=request.agent_name,
            assigned_to_email=request.agent_email
        )

        return {
            "success": True,
            "conversation_id": conversation_id,
            "assigned_to": request.agent_email,
            "message": f"Conversation assigned to {request.agent_name}"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Assignment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversations/{conversation_id}/resolve")
async def resolve_conversation(
    conversation_id: str,
    request: ResolveConversationRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Mark conversation as resolved (Phase 2 feature)

    Args:
        conversation_id: Conversation to resolve
        request: Resolution details

    Returns:
        Success status
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Update conversation status
        result = supabase.table("support_conversations_v2").update({
            "status": "resolved",
            "resolved_at": datetime.utcnow().isoformat(),
            "resolved_by": token_payload.get("email"),
            "resolution_notes": request.resolution_notes
        }).eq("conversation_id", conversation_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Conversation not found")

        conv = result.data[0]

        # Calculate resolution time
        created_at = datetime.fromisoformat(conv.get("created_at"))
        resolution_time = (datetime.utcnow() - created_at).total_seconds() / 60

        return {
            "success": True,
            "conversation_id": conversation_id,
            "resolved_by": token_payload.get("email"),
            "resolution_time_minutes": round(resolution_time, 1),
            "message": "Conversation marked as resolved"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Resolution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/escalated", response_model=PaginatedResponse[ConversationSummary])
async def list_escalated_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    token_payload: dict = Depends(verify_token)
):
    """
    List all escalated conversations (for support team dashboard)
    Phase 2 feature
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    # Count escalated conversations
    count_result = supabase.table("support_conversations_v2").select(
        "id", count="exact"
    ).eq("escalated", True).execute()

    total_count = count_result.count if count_result.count else 0

    # Get paginated escalated conversations
    offset = (page - 1) * page_size
    result = supabase.table("support_conversations_v2").select("*").eq(
        "escalated", True
    ).order("updated_at", desc=True).range(offset, offset + page_size - 1).execute()

    conversations = result.data if result.data else []

    # Format summaries
    summaries = [
        ConversationSummary(
            conversation_id=conv["conversation_id"],
            created_at=datetime.fromisoformat(conv.get("created_at")),
            updated_at=datetime.fromisoformat(conv.get("updated_at")),
            message_count=len(conv.get("messages", [])),
            last_message=conv.get("messages", [])[-1].get("content", "") if conv.get("messages") else "",
            sentiment=conv.get("sentiment"),
            intent=conv.get("intent"),
            escalated=True,
            assigned_to=conv.get("assigned_to"),
            priority=conv.get("priority")
        )
        for conv in conversations
    ]

    pagination_meta = create_pagination_meta(
        total_items=total_count,
        page=page,
        page_size=page_size
    )

    return PaginatedResponse(
        success=True,
        data=summaries,
        pagination=pagination_meta
    )


@router.get("/health")
async def health_check_v2():
    """Health check for Phase 2 support chat system"""
    from utils.language_analysis import health_check as lang_health
    from utils.notifications import health_check as notif_health

    has_openai = bool(os.getenv("AZURE_OPENAI_KEY"))

    # Check knowledge base count
    kb_count = 0
    if DATABASE_AVAILABLE:
        try:
            count_result = supabase.table("support_knowledge_base").select(
                "id", count="exact"
            ).execute()
            kb_count = count_result.count if count_result.count else 0
        except:
            kb_count = 0

    return {
        "status": "healthy" if (has_openai and DATABASE_AVAILABLE) else "degraded",
        "phase": 2,
        "openai_configured": has_openai,
        "database_available": DATABASE_AVAILABLE,
        "embedding_model": EMBEDDING_MODEL,
        "chat_model": CHAT_MODEL,
        "knowledge_base_documents": kb_count,
        "language_analysis": lang_health(),
        "notifications": notif_health(),
        "features": {
            "rag": True,
            "sentiment_analysis": True,
            "intent_classification": True,
            "escalation": True,
            "source_citation": True,
            "multi_channel_notifications": True,
            "conversation_assignment": True,
            "priority_routing": True
        }
    }
