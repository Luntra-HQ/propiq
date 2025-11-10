"""
PropIQ Custom Support Chat
AI-powered customer support using Azure OpenAI (no third-party dependencies)
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from openai import AzureOpenAI
from utils.pagination import (
    PaginationParams,
    PaginatedResponse,
    create_pagination_meta
)

# MongoDB for chat history
try:
    from database_supabase import get_database
    db = get_database()
    support_chats = db["support_chats"]
    DATABASE_AVAILABLE = True
except Exception as e:
    print(f"⚠️  Database not available for support chat: {e}")
    DATABASE_AVAILABLE = False

# JWT auth
try:
    from auth import verify_token
except:
    # Fallback if auth not available
    def verify_token(authorization: str = None):
        return {"sub": "guest", "email": "guest@propiq.com"}

router = APIRouter(prefix="/support", tags=["support"])

# Azure OpenAI client (reuse existing configuration)
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-15-preview"
)

# Models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class SendMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None  # For continuing conversations

class ChatResponse(BaseModel):
    success: bool
    conversation_id: str
    message: str
    response: str
    timestamp: datetime

class ConversationHistory(BaseModel):
    conversation_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime

class ConversationSummary(BaseModel):
    """Summary of a support conversation for list view"""
    conversation_id: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    last_message: str


# PropIQ Support Agent System Prompt
SUPPORT_AGENT_PROMPT = """You are a helpful customer support agent for PropIQ, an AI-powered property investment analysis platform.

**Your role**:
- Help users understand how to use PropIQ's features
- Answer questions about property analysis, subscriptions, and pricing
- Guide users through the platform
- Be friendly, concise, and professional

**PropIQ Features**:
- Property Analysis: AI-powered investment analysis for real estate properties
- Subscription Tiers:
  * Free: 3 trial property analyses
  * Starter ($29/mo): 20 analyses/month
  * Pro ($79/mo): 100 analyses/month
  * Elite ($199/mo): Unlimited analyses
- Analysis includes: market trends, financial projections, ROI, recommendations

**Guidelines**:
- Keep responses under 150 words
- Be concise and actionable
- If you don't know something, admit it and offer to connect them with the team
- Don't make up features or pricing that don't exist
- Focus on helping users succeed with their property investments

**Common Questions**:
- How to analyze a property → Enter address and optional financial details
- What's included in analysis → Location insights, financials, investment recommendation
- How to upgrade → Go to Settings → Subscription
- Trial usage → Free users get 3 analyses to try the platform
"""


@router.post("/chat", response_model=ChatResponse)
async def send_support_message(
    request: SendMessageRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Send a message to the PropIQ support agent and get an AI-powered response

    Args:
        request: Message content and optional conversation_id
        token_payload: User authentication (from JWT)

    Returns:
        AI-generated response with conversation_id for follow-ups
    """
    user_id = token_payload.get("sub", "guest")
    user_email = token_payload.get("email", "guest@propiq.com")

    try:
        # Load conversation history if continuing
        conversation_history = []
        conversation_id = request.conversation_id

        if conversation_id and DATABASE_AVAILABLE:
            # Fetch existing conversation
            existing_chat = support_chats.find_one({
                "conversation_id": conversation_id,
                "user_id": user_id
            })

            if existing_chat:
                conversation_history = existing_chat.get("messages", [])

        # If new conversation, generate ID
        if not conversation_id:
            from bson import ObjectId
            conversation_id = str(ObjectId())

        # Build messages for OpenAI
        messages = [
            {"role": "system", "content": SUPPORT_AGENT_PROMPT}
        ]

        # Add conversation history
        for msg in conversation_history:
            messages.append({
                "role": msg.get("role"),
                "content": msg.get("content")
            })

        # Add new user message
        messages.append({
            "role": "user",
            "content": request.message
        })

        # Get AI response
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=300  # Keep responses concise
        )

        ai_response = response.choices[0].message.content
        timestamp = datetime.utcnow()

        # Save to database
        if DATABASE_AVAILABLE:
            # Add user message and AI response to history
            updated_messages = conversation_history + [
                {
                    "role": "user",
                    "content": request.message,
                    "timestamp": timestamp
                },
                {
                    "role": "assistant",
                    "content": ai_response,
                    "timestamp": timestamp
                }
            ]

            # Upsert conversation
            support_chats.update_one(
                {
                    "conversation_id": conversation_id,
                    "user_id": user_id
                },
                {
                    "$set": {
                        "user_email": user_email,
                        "messages": updated_messages,
                        "updated_at": timestamp
                    },
                    "$setOnInsert": {
                        "created_at": timestamp
                    }
                },
                upsert=True
            )

        return ChatResponse(
            success=True,
            conversation_id=conversation_id,
            message=request.message,
            response=ai_response,
            timestamp=timestamp
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Support chat failed: {str(e)}"
        )


@router.get("/history/{conversation_id}", response_model=ConversationHistory)
async def get_conversation_history(
    conversation_id: str,
    token_payload: dict = Depends(verify_token)
):
    """
    Get the full history of a support conversation

    Args:
        conversation_id: ID of the conversation
        token_payload: User authentication

    Returns:
        Complete conversation history
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub", "guest")

    # Fetch conversation
    chat = support_chats.find_one({
        "conversation_id": conversation_id,
        "user_id": user_id
    })

    if not chat:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return ConversationHistory(
        conversation_id=conversation_id,
        messages=[
            ChatMessage(
                role=msg.get("role"),
                content=msg.get("content"),
                timestamp=msg.get("timestamp")
            )
            for msg in chat.get("messages", [])
        ],
        created_at=chat.get("created_at"),
        updated_at=chat.get("updated_at")
    )


@router.get("/conversations", response_model=PaginatedResponse[ConversationSummary])
async def list_user_conversations(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    token_payload: dict = Depends(verify_token)
):
    """
    List all support conversations for the authenticated user (paginated)

    Sprint 7: Added pagination for better performance with large conversation lists

    Args:
        page: Page number (default: 1)
        page_size: Items per page (default: 20, max: 100)
        token_payload: User authentication (from JWT)

    Returns:
        Paginated list of conversation summaries with metadata
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub", "guest")

    # Create pagination params
    pagination = PaginationParams(page=page, page_size=page_size)

    # Get total count for pagination metadata
    total_count = support_chats.count_documents({"user_id": user_id})

    # Fetch paginated conversations for this user
    conversations = list(support_chats.find(
        {"user_id": user_id},
        sort=[("updated_at", -1)],
        skip=pagination.skip,
        limit=pagination.limit
    ))

    # Format conversation summaries
    conversation_summaries = [
        ConversationSummary(
            conversation_id=chat["conversation_id"],
            created_at=chat.get("created_at"),
            updated_at=chat.get("updated_at"),
            message_count=len(chat.get("messages", [])),
            last_message=chat.get("messages", [])[-1].get("content", "") if chat.get("messages") else ""
        )
        for chat in conversations
    ]

    # Create pagination metadata
    pagination_meta = create_pagination_meta(
        total_items=total_count,
        page=pagination.page,
        page_size=pagination.page_size
    )

    # Return paginated response
    return PaginatedResponse(
        success=True,
        data=conversation_summaries,
        pagination=pagination_meta
    )


@router.get("/health")
async def health_check():
    """Health check for support chat system"""
    has_openai = bool(os.getenv("AZURE_OPENAI_KEY"))

    return {
        "status": "healthy" if has_openai else "degraded",
        "openai_configured": has_openai,
        "database_available": DATABASE_AVAILABLE,
        "model": "gpt-4o-mini"
    }
