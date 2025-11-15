"""
PropIQ Enhanced Support Chat with RAG (Retrieval-Augmented Generation)
Phase 1 Implementation: Knowledge Base Integration + Vector Search

Features:
- Vector-based knowledge retrieval using Supabase pgvector
- Contextual response generation with Azure OpenAI
- Reduced hallucinations through grounded responses
- Multi-turn conversation support
- Sentiment analysis and escalation triggers
"""

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from openai import AzureOpenAI
import numpy as np
from utils.pagination import (
    PaginationParams,
    PaginatedResponse,
    create_pagination_meta
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
    # Fallback if auth not available
    def verify_token(authorization: str = None):
        return {"sub": "guest", "email": "guest@propiq.com"}

router = APIRouter(prefix="/support/rag", tags=["support-rag"])

# Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-15-preview"
)

# Configuration
EMBEDDING_MODEL = "text-embedding-3-small"  # 1536 dimensions
CHAT_MODEL = "gpt-4o-mini"
SIMILARITY_THRESHOLD = 0.75  # Minimum cosine similarity for relevance
MAX_CONTEXT_CHUNKS = 5  # Number of knowledge base chunks to retrieve
MAX_TOKENS = 500  # Increased from 300 for better responses
TEMPERATURE = 0.7  # Balanced creativity

# Models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None
    sources: Optional[List[str]] = None  # NEW: Knowledge base sources cited

class SendMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    conversation_id: str
    message: str
    response: str
    timestamp: datetime
    sources: Optional[List[Dict[str, str]]] = None  # NEW: Cited knowledge sources
    confidence: Optional[float] = None  # NEW: Response confidence (0-1)
    escalated: Optional[bool] = False  # NEW: Whether conversation was escalated

class ConversationHistory(BaseModel):
    conversation_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
    sentiment: Optional[str] = None
    escalated: Optional[bool] = False

class ConversationSummary(BaseModel):
    conversation_id: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    last_message: str
    sentiment: Optional[str] = None
    escalated: Optional[bool] = False

class KnowledgeBaseDocument(BaseModel):
    """Document for knowledge base ingestion"""
    content: str
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata like source, category, last_updated"
    )

# Enhanced System Prompt
SUPPORT_AGENT_PROMPT = """You are an expert customer support agent for PropIQ, an AI-powered real estate investment analysis platform.

**Your role**:
- Help users understand and use PropIQ's features effectively
- Answer questions about property analysis, subscriptions, pricing, and platform functionality
- Guide users through workflows with clear, actionable steps
- Provide accurate information grounded in the knowledge base
- Be friendly, professional, and concise

**PropIQ Platform Overview**:
- **Property Analysis**: AI-powered investment analysis for residential and commercial real estate
- **Subscription Tiers**:
  * Free: 3 trial property analyses (no credit card required)
  * Starter ($29/mo): 20 analyses/month + basic features
  * Pro ($79/mo): 100 analyses/month + Property Advisor multi-agent system
  * Elite ($199/mo): Unlimited analyses + priority support + API access
- **Key Features**:
  * Market trend analysis (neighborhood insights, comparable properties)
  * Financial projections (ROI, cash flow, appreciation)
  * Investment recommendations (proceed, negotiate, walk away)
  * PDF export of analysis reports
  * Property Advisor (Pro/Elite) - multi-agent deep analysis

**Response Guidelines**:
- Keep responses under 200 words (concise and scannable)
- Use bullet points for lists and steps
- If you don't know something, say "I don't have that information, but I can connect you with our team"
- NEVER make up features, pricing, or technical details
- Cite knowledge base sources when providing detailed information
- If a user seems frustrated or issue is unresolved after 2-3 turns, suggest escalation

**Tone**: Helpful, professional, empathetic, and solution-oriented
"""

# RAG Functions

def generate_embedding(text: str) -> List[float]:
    """
    Generate text embedding using Azure OpenAI

    Args:
        text: Input text to embed

    Returns:
        1536-dimensional embedding vector
    """
    try:
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"⚠️  Embedding generation failed: {e}")
        return None


def search_knowledge_base(
    query: str,
    limit: int = MAX_CONTEXT_CHUNKS,
    threshold: float = SIMILARITY_THRESHOLD
) -> List[Dict[str, Any]]:
    """
    Search knowledge base using vector similarity

    Args:
        query: User's question
        limit: Maximum number of results to return
        threshold: Minimum similarity score (0-1)

    Returns:
        List of matching documents with content and metadata
    """
    if not DATABASE_AVAILABLE:
        print("⚠️  Knowledge base search skipped (database unavailable)")
        return []

    try:
        # Generate query embedding
        query_embedding = generate_embedding(query)
        if not query_embedding:
            return []

        # Search for similar documents using pgvector
        # Note: This uses Supabase's RPC function for vector similarity search
        result = supabase.rpc(
            "match_support_documents",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": limit
            }
        ).execute()

        if result.data:
            return result.data
        else:
            print("⚠️  No relevant knowledge base documents found")
            return []

    except Exception as e:
        print(f"⚠️  Knowledge base search failed: {e}")
        return []


def build_context_from_sources(sources: List[Dict[str, Any]]) -> str:
    """
    Build context string from knowledge base sources

    Args:
        sources: List of matched documents from vector search

    Returns:
        Formatted context string for prompt injection
    """
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


def analyze_sentiment_simple(conversation_messages: List[Dict]) -> str:
    """
    Simple sentiment analysis using GPT-4o-mini
    (Phase 2 will use Azure AI Language Service for production)

    Args:
        conversation_messages: List of conversation messages

    Returns:
        "positive", "neutral", or "negative"
    """
    if not conversation_messages:
        return "neutral"

    # Get last 2 user messages
    user_messages = [
        msg["content"] for msg in conversation_messages[-4:]
        if msg.get("role") == "user"
    ]

    if not user_messages:
        return "neutral"

    try:
        prompt = f"""Analyze the sentiment of these customer messages.
Respond with ONLY one word: positive, neutral, or negative.

Messages:
{chr(10).join(user_messages)}

Sentiment:"""

        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=10
        )

        sentiment = response.choices[0].message.content.strip().lower()

        if sentiment not in ["positive", "neutral", "negative"]:
            return "neutral"

        return sentiment

    except Exception as e:
        print(f"⚠️  Sentiment analysis failed: {e}")
        return "neutral"


def should_escalate_conversation(
    conversation_messages: List[Dict],
    sentiment: str
) -> bool:
    """
    Determine if conversation should be escalated to human agent

    Escalation triggers:
    - Negative sentiment detected
    - More than 3 agent responses (conversation not resolving)
    - Explicit request for human agent
    - Billing/payment issues mentioned

    Args:
        conversation_messages: Full conversation history
        sentiment: Current conversation sentiment

    Returns:
        True if should escalate
    """
    # Check sentiment
    if sentiment == "negative":
        return True

    # Check conversation length (too many back-and-forth = not resolving)
    agent_turn_count = sum(
        1 for msg in conversation_messages if msg.get("role") == "assistant"
    )
    if agent_turn_count >= 4:
        return True

    # Check for explicit escalation requests
    last_user_message = next(
        (msg["content"] for msg in reversed(conversation_messages)
         if msg.get("role") == "user"),
        ""
    ).lower()

    escalation_keywords = [
        "speak to a person", "talk to someone", "human agent",
        "customer service", "escalate", "not helpful", "this isn't working"
    ]

    if any(keyword in last_user_message for keyword in escalation_keywords):
        return True

    # Check for billing issues
    billing_keywords = ["billing", "payment", "charge", "refund", "invoice"]
    if any(keyword in last_user_message for keyword in billing_keywords):
        return True

    return False


# API Endpoints

@router.post("/chat", response_model=ChatResponse)
async def send_support_message_rag(
    request: SendMessageRequest,
    background_tasks: BackgroundTasks,
    token_payload: dict = Depends(verify_token)
):
    """
    Send a message to the PropIQ support agent with RAG-enhanced responses

    Process:
    1. Generate embedding for user query
    2. Search knowledge base for relevant context
    3. Inject context into system prompt
    4. Generate AI response grounded in knowledge base
    5. Analyze sentiment and check for escalation
    6. Return response with cited sources

    Args:
        request: Message content and optional conversation_id
        token_payload: User authentication (from JWT)
        background_tasks: For async operations (sentiment analysis, logging)

    Returns:
        AI-generated response with knowledge base citations and metadata
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Support chat temporarily unavailable (database offline)"
        )

    user_id = token_payload.get("sub", "guest")
    user_email = token_payload.get("email", "guest@propiq.com")

    try:
        # Step 1: Load conversation history if continuing
        conversation_messages = []
        conversation_id = request.conversation_id

        if conversation_id:
            # Fetch existing conversation from Supabase
            result = supabase.table("support_conversations_rag").select("*").eq(
                "conversation_id", conversation_id
            ).eq("user_id", user_id).execute()

            if result.data and len(result.data) > 0:
                conversation_messages = result.data[0].get("messages", [])

        # If new conversation, generate ID
        if not conversation_id:
            import uuid
            conversation_id = str(uuid.uuid4())

        # Step 2: Search knowledge base for relevant context
        print(f"🔍 Searching knowledge base for: {request.message}")
        knowledge_sources = search_knowledge_base(request.message)

        # Step 3: Build enhanced system prompt with context
        context_string = build_context_from_sources(knowledge_sources)

        enhanced_system_prompt = SUPPORT_AGENT_PROMPT
        if context_string:
            enhanced_system_prompt += f"\n\n{context_string}"

        # Step 4: Build messages for OpenAI
        messages = [{"role": "system", "content": enhanced_system_prompt}]

        # Add conversation history (limit to last 10 messages to stay within context window)
        for msg in conversation_messages[-10:]:
            messages.append({
                "role": msg.get("role"),
                "content": msg.get("content")
            })

        # Add new user message
        messages.append({"role": "user", "content": request.message})

        # Step 5: Generate AI response
        print(f"🤖 Generating AI response with {len(knowledge_sources)} knowledge sources")
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=messages,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS
        )

        ai_response = response.choices[0].message.content
        timestamp = datetime.utcnow()

        # Step 6: Prepare source citations
        sources_cited = [
            {
                "source": src.get("metadata", {}).get("source", "Documentation"),
                "category": src.get("metadata", {}).get("category", "General"),
                "relevance": src.get("similarity", 0.0)
            }
            for src in knowledge_sources
        ] if knowledge_sources else None

        # Step 7: Analyze sentiment (simple version for Phase 1)
        updated_messages = conversation_messages + [
            {"role": "user", "content": request.message, "timestamp": timestamp.isoformat()},
            {"role": "assistant", "content": ai_response, "timestamp": timestamp.isoformat()}
        ]

        sentiment = analyze_sentiment_simple(updated_messages)

        # Step 8: Check for escalation
        should_escalate = should_escalate_conversation(updated_messages, sentiment)

        if should_escalate:
            ai_response += "\n\n_I'll connect you with a team member who can provide more specialized assistance. Someone will reach out to you shortly._"
            print(f"⚠️  Conversation {conversation_id} flagged for escalation (sentiment: {sentiment})")

        # Step 9: Save conversation to database
        conversation_data = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "user_email": user_email,
            "messages": updated_messages,
            "sentiment": sentiment,
            "escalated": should_escalate,
            "last_message_at": timestamp.isoformat(),
            "updated_at": timestamp.isoformat()
        }

        # Upsert conversation
        existing = supabase.table("support_conversations_rag").select("id").eq(
            "conversation_id", conversation_id
        ).execute()

        if existing.data and len(existing.data) > 0:
            # Update existing
            supabase.table("support_conversations_rag").update(
                conversation_data
            ).eq("conversation_id", conversation_id).execute()
        else:
            # Insert new
            conversation_data["created_at"] = timestamp.isoformat()
            supabase.table("support_conversations_rag").insert(
                conversation_data
            ).execute()

        # Step 10: Return response
        return ChatResponse(
            success=True,
            conversation_id=conversation_id,
            message=request.message,
            response=ai_response,
            timestamp=timestamp,
            sources=sources_cited,
            confidence=knowledge_sources[0].get("similarity", 0.0) if knowledge_sources else 0.0,
            escalated=should_escalate
        )

    except Exception as e:
        print(f"❌ Support chat error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Support chat failed: {str(e)}"
        )


@router.get("/history/{conversation_id}", response_model=ConversationHistory)
async def get_conversation_history_rag(
    conversation_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Get full conversation history with sentiment and escalation status"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub", "guest")

    result = supabase.table("support_conversations_rag").select("*").eq(
        "conversation_id", conversation_id
    ).eq("user_id", user_id).execute()

    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation = result.data[0]

    return ConversationHistory(
        conversation_id=conversation_id,
        messages=[
            ChatMessage(
                role=msg.get("role"),
                content=msg.get("content"),
                timestamp=datetime.fromisoformat(msg.get("timestamp")) if msg.get("timestamp") else None
            )
            for msg in conversation.get("messages", [])
        ],
        created_at=datetime.fromisoformat(conversation.get("created_at")),
        updated_at=datetime.fromisoformat(conversation.get("updated_at")),
        sentiment=conversation.get("sentiment"),
        escalated=conversation.get("escalated", False)
    )


@router.get("/conversations", response_model=PaginatedResponse[ConversationSummary])
async def list_user_conversations_rag(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    token_payload: dict = Depends(verify_token)
):
    """List all support conversations for the authenticated user (paginated)"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub", "guest")

    # Get total count
    count_result = supabase.table("support_conversations_rag").select(
        "id", count="exact"
    ).eq("user_id", user_id).execute()

    total_count = count_result.count if count_result.count else 0

    # Get paginated conversations
    offset = (page - 1) * page_size
    result = supabase.table("support_conversations_rag").select("*").eq(
        "user_id", user_id
    ).order("updated_at", desc=True).range(
        offset, offset + page_size - 1
    ).execute()

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
            escalated=conv.get("escalated", False)
        )
        for conv in conversations
    ]

    # Create pagination metadata
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


@router.post("/knowledge-base/ingest")
async def ingest_knowledge_document(
    document: KnowledgeBaseDocument,
    token_payload: dict = Depends(verify_token)
):
    """
    Ingest a document into the knowledge base (admin only)

    This endpoint:
    1. Generates embedding for the document
    2. Stores content + embedding in Supabase pgvector
    3. Returns success status

    Args:
        document: Document with content and metadata
        token_payload: User authentication (admin check)

    Returns:
        Success status and document ID
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    # TODO: Add admin check (for now, any authenticated user can ingest)
    # user_role = token_payload.get("role")
    # if user_role != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required")

    try:
        # Generate embedding
        embedding = generate_embedding(document.content)
        if not embedding:
            raise HTTPException(status_code=500, detail="Failed to generate embedding")

        # Store in knowledge base
        result = supabase.table("support_knowledge_base").insert({
            "content": document.content,
            "embedding": embedding,
            "metadata": document.metadata,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to store document")

        doc_id = result.data[0].get("id")

        return {
            "success": True,
            "document_id": doc_id,
            "message": f"Document ingested successfully (ID: {doc_id})"
        }

    except Exception as e:
        print(f"❌ Knowledge base ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check_rag():
    """Health check for RAG-enhanced support chat system"""
    has_openai = bool(os.getenv("AZURE_OPENAI_KEY"))

    # Check if knowledge base has documents
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
        "openai_configured": has_openai,
        "database_available": DATABASE_AVAILABLE,
        "embedding_model": EMBEDDING_MODEL,
        "chat_model": CHAT_MODEL,
        "knowledge_base_documents": kb_count,
        "features": {
            "rag": True,
            "sentiment_analysis": True,
            "escalation": True,
            "source_citation": True
        }
    }
