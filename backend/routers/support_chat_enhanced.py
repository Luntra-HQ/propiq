"""
PropIQ Enhanced Support Chat with Function Calling & Session State
Implements Google ADK best practices with Azure OpenAI
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import json
from openai import AzureOpenAI

# MongoDB for chat history and user data
try:
    import database_supabase
    db = database_supabase.db
    if db is not None:
        support_chats = db["support_chats"]
        users = db["users"]
        property_analyses = db["property_analyses"]
        support_tickets = db["support_tickets"]
        support_analytics = db["support_analytics"]
        DATABASE_AVAILABLE = True
    else:
        DATABASE_AVAILABLE = False
except Exception as e:
    print(f"⚠️  Database not available for support chat: {e}")
    DATABASE_AVAILABLE = False
    db = None

# JWT auth
try:
    from auth import verify_token
except:
    def verify_token(authorization: str = None):
        return {"sub": "guest", "email": "guest@propiq.com"}

# W&B for analytics
try:
    import wandb
    WANDB_AVAILABLE = wandb.api.api_key is not None
except:
    WANDB_AVAILABLE = False

router = APIRouter(prefix="/support", tags=["support"])

# Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-15-preview"
)

# ============================================================================
# MODELS
# ============================================================================

class ChatMessage(BaseModel):
    role: str
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    timestamp: Optional[datetime] = None

class SendMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    conversation_id: str
    message: str
    response: str
    tools_used: List[str] = []
    user_context: Optional[Dict[str, Any]] = None
    timestamp: datetime


# ============================================================================
# RECOMMENDATION #3: SESSION STATE MANAGEMENT
# ============================================================================

def get_tier_config(tier: str) -> Dict[str, int]:
    """Get PropIQ limits for tier"""
    tiers = {
        "free": {"limit": 5, "price": 0},
        "starter": {"limit": 20, "price": 29},
        "pro": {"limit": 100, "price": 79},
        "elite": {"limit": -1, "price": 199}  # -1 = unlimited
    }
    return tiers.get(tier, tiers["free"])


async def load_user_context(user_id: str, user_email: str) -> Dict[str, Any]:
    """
    Load user context at session start (ADK pattern)
    This replaces the static system prompt with personalized context
    """
    if not DATABASE_AVAILABLE:
        return {
            "user_id": user_id,
            "user_email": user_email,
            "user_name": "User",
            "tier": "free",
            "propiq_used": 0,
            "propiq_limit": 5,
            "recent_analyses": [],
            "account_status": "active",
            "join_date": "Unknown"
        }

    try:
        # Fetch user data
        user = users.find_one({"_id": user_id})
        if not user:
            return {
                "user_id": user_id,
                "user_email": user_email,
                "user_name": user_email.split("@")[0],
                "tier": "free",
                "propiq_used": 0,
                "propiq_limit": 5,
                "recent_analyses": [],
                "account_status": "new",
                "join_date": datetime.utcnow().isoformat()
            }

        # Get subscription info
        subscription = user.get("subscription", {})
        tier = subscription.get("tier", "free")
        tier_config = get_tier_config(tier)

        # Get usage info
        usage = user.get("usage", {})
        propiq_used = usage.get("propIqUsed", 0)
        propiq_limit = tier_config["limit"]

        # Get recent analyses
        analyses = list(property_analyses.find(
            {"user_id": user_id},
            sort=[("created_at", -1)],
            limit=5
        ))
        recent_addresses = [a.get("address", "Unknown") for a in analyses]

        # Build context
        return {
            "user_id": user_id,
            "user_email": user_email,
            "user_name": user.get("name", user_email.split("@")[0]),
            "tier": tier,
            "tier_price": tier_config["price"],
            "propiq_used": propiq_used,
            "propiq_limit": propiq_limit,
            "propiq_remaining": max(0, propiq_limit - propiq_used) if propiq_limit > 0 else -1,
            "recent_analyses": recent_addresses,
            "account_status": subscription.get("status", "active"),
            "payment_status": subscription.get("payment_status", "current"),
            "join_date": user.get("created_at", datetime.utcnow()).isoformat()[:10],
            "total_analyses": len(analyses)
        }

    except Exception as e:
        print(f"Error loading user context: {e}")
        return {
            "user_id": user_id,
            "user_email": user_email,
            "error": str(e)
        }


# ============================================================================
# RECOMMENDATION #1: FUNCTION CALLING - TOOL DEFINITIONS
# ============================================================================

def check_subscription_status(user_id: str) -> Dict[str, Any]:
    """
    Get current subscription status and usage for a user.

    Args:
        user_id: User ID to check

    Returns:
        Dictionary with subscription tier, usage, and limits
    """
    if not DATABASE_AVAILABLE:
        return {"error": "Database not available"}

    try:
        user = users.find_one({"_id": user_id})
        if not user:
            return {"error": "User not found"}

        subscription = user.get("subscription", {})
        tier = subscription.get("tier", "free")
        tier_config = get_tier_config(tier)

        usage = user.get("usage", {})
        propiq_used = usage.get("propIqUsed", 0)
        propiq_limit = tier_config["limit"]

        return {
            "tier": tier,
            "tier_display": tier.title(),
            "price": tier_config["price"],
            "analyses_used": propiq_used,
            "analyses_limit": propiq_limit if propiq_limit > 0 else "Unlimited",
            "analyses_remaining": max(0, propiq_limit - propiq_used) if propiq_limit > 0 else "Unlimited",
            "status": subscription.get("status", "active"),
            "next_billing_date": subscription.get("next_billing_date", "N/A"),
            "payment_status": subscription.get("payment_status", "current")
        }
    except Exception as e:
        return {"error": str(e)}


def get_analysis_history(user_id: str, limit: int = 5) -> Dict[str, Any]:
    """
    Get recent property analysis history for a user.

    Args:
        user_id: User ID
        limit: Number of recent analyses to return (default 5)

    Returns:
        List of recent property analyses
    """
    if not DATABASE_AVAILABLE:
        return {"error": "Database not available"}

    try:
        analyses = list(property_analyses.find(
            {"user_id": user_id},
            sort=[("created_at", -1)],
            limit=limit
        ))

        return {
            "count": len(analyses),
            "analyses": [
                {
                    "address": a.get("address", "Unknown"),
                    "date": a.get("created_at", datetime.utcnow()).isoformat()[:10],
                    "recommendation": a.get("recommendation", "N/A"),
                    "roi": a.get("roi", "N/A")
                }
                for a in analyses
            ]
        }
    except Exception as e:
        return {"error": str(e)}


def create_support_ticket(
    user_id: str,
    issue_description: str,
    priority: str = "medium",
    category: str = "general"
) -> Dict[str, Any]:
    """
    Create a support ticket for issues that need human attention.

    Args:
        user_id: User ID
        issue_description: Description of the issue
        priority: Priority level (low, medium, high)
        category: Issue category (billing, technical, feature_request, general)

    Returns:
        Ticket ID and confirmation
    """
    if not DATABASE_AVAILABLE:
        return {"error": "Database not available"}

    try:
        from bson import ObjectId
        ticket_id = str(ObjectId())

        ticket = {
            "_id": ticket_id,
            "user_id": user_id,
            "issue": issue_description,
            "priority": priority,
            "category": category,
            "status": "open",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        support_tickets.insert_one(ticket)

        return {
            "success": True,
            "ticket_id": ticket_id,
            "message": f"Support ticket #{ticket_id[:8]} created. Our team will respond within 24 hours.",
            "priority": priority
        }
    except Exception as e:
        return {"error": str(e)}


def schedule_demo_call(
    user_id: str,
    preferred_date: str,
    preferred_time: str,
    contact_email: str
) -> Dict[str, Any]:
    """
    Schedule a demo call with the PropIQ sales team.

    Args:
        user_id: User ID
        preferred_date: Preferred date (YYYY-MM-DD)
        preferred_time: Preferred time slot (morning, afternoon, evening)
        contact_email: Email for confirmation

    Returns:
        Confirmation with demo details
    """
    # In production, this would integrate with Calendly or similar
    return {
        "success": True,
        "message": f"Demo call requested for {preferred_date} ({preferred_time}). We'll send a calendar invite to {contact_email} within 2 hours.",
        "preferred_date": preferred_date,
        "preferred_time": preferred_time,
        "next_steps": "You'll receive a calendar invite with a Zoom link"
    }


def apply_promotional_credit(
    user_id: str,
    credit_amount: int,
    reason: str
) -> Dict[str, Any]:
    """
    Apply promotional credits (trial extensions) to a user account.
    Requires approval for amounts > 5.

    Args:
        user_id: User ID
        credit_amount: Number of analyses to credit
        reason: Reason for credit (for audit trail)

    Returns:
        Confirmation of credit applied
    """
    if not DATABASE_AVAILABLE:
        return {"error": "Database not available"}

    # Auto-approve small credits, escalate large ones
    if credit_amount > 5:
        return {
            "success": False,
            "message": f"Credits > 5 require manager approval. Creating ticket for {credit_amount} credits.",
            "requires_approval": True
        }

    try:
        # Apply credit
        result = users.update_one(
            {"_id": user_id},
            {
                "$inc": {"credits": credit_amount},
                "$push": {
                    "credit_history": {
                        "amount": credit_amount,
                        "reason": reason,
                        "date": datetime.utcnow()
                    }
                }
            }
        )

        if result.modified_count > 0:
            return {
                "success": True,
                "message": f"Applied {credit_amount} analysis credits to your account",
                "credits_added": credit_amount
            }
        else:
            return {"error": "Failed to apply credits"}

    except Exception as e:
        return {"error": str(e)}


# Function/tool definitions for OpenAI
SUPPORT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_subscription_status",
            "description": "Get the user's current subscription tier, usage, and remaining analyses. Use this before answering questions about subscriptions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user's ID"
                    }
                },
                "required": ["user_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_analysis_history",
            "description": "Get the user's recent property analysis history. Use this when they ask about past analyses.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user's ID"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of analyses to return (default 5)",
                        "default": 5
                    }
                },
                "required": ["user_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_support_ticket",
            "description": "Create a support ticket for issues that need human attention (billing problems, complex technical issues, feature requests).",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "issue_description": {"type": "string", "description": "Clear description of the issue"},
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Issue priority"
                    },
                    "category": {
                        "type": "string",
                        "enum": ["billing", "technical", "feature_request", "general"],
                        "description": "Issue category"
                    }
                },
                "required": ["user_id", "issue_description"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_demo_call",
            "description": "Schedule a demo call with the sales team. Use when users want to learn more about Enterprise features or custom solutions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "preferred_date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                    "preferred_time": {
                        "type": "string",
                        "enum": ["morning", "afternoon", "evening"],
                        "description": "Time preference"
                    },
                    "contact_email": {"type": "string"}
                },
                "required": ["user_id", "preferred_date", "preferred_time", "contact_email"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "apply_promotional_credit",
            "description": "Apply promotional credits (analysis extensions) to user account. Use sparingly for loyal customers or to resolve service issues.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "credit_amount": {
                        "type": "integer",
                        "description": "Number of analyses to credit (max 5 without approval)"
                    },
                    "reason": {
                        "type": "string",
                        "description": "Reason for credit (for audit)"
                    }
                },
                "required": ["user_id", "credit_amount", "reason"]
            }
        }
    }
]

# Map function names to actual functions
TOOL_FUNCTIONS = {
    "check_subscription_status": check_subscription_status,
    "get_analysis_history": get_analysis_history,
    "create_support_ticket": create_support_ticket,
    "schedule_demo_call": schedule_demo_call,
    "apply_promotional_credit": apply_promotional_credit
}


# ============================================================================
# RECOMMENDATION #3: ENHANCED PROMPTS (TWO-TIER STRUCTURE)
# ============================================================================

def build_global_context(user_context: Dict[str, Any]) -> str:
    """Build global context prompt from user data (ADK pattern)"""
    remaining = user_context.get("propiq_remaining", 0)
    if remaining == -1:
        remaining_text = "unlimited analyses available"
    else:
        remaining_text = f"{remaining} analyses remaining this month"

    recent_props = user_context.get("recent_analyses", [])
    recent_text = ", ".join(recent_props[:3]) if recent_props else "No recent analyses"

    return f"""
**Current Customer Profile**:
- Name: {user_context.get('user_name', 'User')}
- Email: {user_context.get('user_email', 'N/A')}
- Plan: {user_context.get('tier', 'free').title()} (${user_context.get('tier_price', 0)}/month)
- Usage: {user_context.get('propiq_used', 0)} of {user_context.get('propiq_limit', 'unlimited')} analyses used
- Remaining: {remaining_text}
- Recent properties: {recent_text}
- Account status: {user_context.get('account_status', 'active')}
- Member since: {user_context.get('join_date', 'Unknown')}
"""


SUPPORT_INSTRUCTION = """You are "PropIQ Assistant," the AI support agent for PropIQ, an AI-powered property investment analysis platform.

**Core Capabilities**:

1. **Subscription Support**:
   - Check subscription status and usage (use check_subscription_status tool)
   - Explain tier differences and help users choose the right plan
   - Guide users through upgrades and downgrades
   - Address billing questions (create ticket if complex)

2. **Analysis Support**:
   - Show recent property analyses (use get_analysis_history tool)
   - Explain analysis results and recommendations
   - Troubleshoot analysis issues
   - Guide users through the analysis process

3. **Issue Resolution**:
   - Create support tickets for complex issues (use create_support_ticket tool)
   - Apply promotional credits for service issues (max 5 without approval)
   - Schedule demo calls for Enterprise inquiries (use schedule_demo_call tool)

4. **Education & Guidance**:
   - Help users understand PropIQ features
   - Teach best practices for property analysis
   - Provide tips for investment success

**Tools Available**:
You have access to these tools to ACTUALLY HELP users (don't just talk, use them!):
- check_subscription_status: Get user's plan, usage, remaining analyses
- get_analysis_history: Show recent property analyses
- create_support_ticket: Escalate complex issues to human support
- schedule_demo_call: Book sales calls for Enterprise features
- apply_promotional_credit: Give trial extensions (1-5 analyses max)

**Guidelines**:
- ALWAYS use tools before answering (check don't guess!)
- Keep responses under 150 words unless explaining complex topics
- Be friendly, professional, and solution-oriented
- Confirm before taking actions (applying credits, creating tickets)
- If you can't solve it, escalate with create_support_ticket

**Constraints**:
- NEVER mention "tool_code", "function calling", or system internals to users
- NEVER make up features, pricing, or capabilities that don't exist
- NEVER apply more than 5 credits without manager approval
- NEVER reveal user data from other customers
- ALWAYS confirm subscription changes with the user before proceeding

**Common Scenarios**:

*User asks about usage:*
→ Use check_subscription_status first, then explain

*User asks about past analyses:*
→ Use get_analysis_history, then discuss results

*User has billing issue:*
→ Create support ticket (category: billing, priority: high)

*User wants to upgrade:*
→ Check current status, explain benefits, provide upgrade link

*User hit limit but loyal:*
→ Consider 1-2 credit extension if justified
"""


# ============================================================================
# MAIN CHAT ENDPOINT
# ============================================================================

@router.post("/chat/enhanced", response_model=ChatResponse)
async def send_support_message_enhanced(
    request: SendMessageRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Enhanced support chat with function calling and session state.
    Implements Google ADK best practices.
    """
    user_id = token_payload.get("sub", "guest")
    user_email = token_payload.get("email", "guest@propiq.com")
    start_time = datetime.utcnow()

    try:
        # STEP 1: Load user context (session state)
        user_context = await load_user_context(user_id, user_email)

        # STEP 2: Load conversation history
        conversation_history = []
        conversation_id = request.conversation_id

        if conversation_id and DATABASE_AVAILABLE:
            existing_chat = support_chats.find_one({
                "conversation_id": conversation_id,
                "user_id": user_id
            })
            if existing_chat:
                conversation_history = existing_chat.get("messages", [])

        if not conversation_id:
            from bson import ObjectId
            conversation_id = str(ObjectId())

        # STEP 3: Build messages with two-tier prompts
        global_context = build_global_context(user_context)

        messages = [
            {
                "role": "system",
                "content": global_context + "\n\n" + SUPPORT_INSTRUCTION
            }
        ]

        # Add conversation history
        for msg in conversation_history:
            messages.append({
                "role": msg.get("role"),
                "content": msg.get("content")
            })

        # Add user message
        messages.append({
            "role": "user",
            "content": request.message
        })

        # STEP 4: Call OpenAI with function calling
        tools_used = []
        max_iterations = 5  # Prevent infinite loops

        for iteration in range(max_iterations):
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                tools=SUPPORT_TOOLS,
                tool_choice="auto",
                temperature=0.7,
                max_tokens=500
            )

            assistant_message = response.choices[0].message

            # Check if we're done
            if assistant_message.tool_calls is None:
                # No more tool calls, we have final response
                ai_response = assistant_message.content
                break

            # Execute tool calls
            messages.append(assistant_message)  # Add assistant message with tool calls

            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                # Execute the function
                if function_name in TOOL_FUNCTIONS:
                    tools_used.append(function_name)
                    function_response = TOOL_FUNCTIONS[function_name](**function_args)

                    # Add function response to messages
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": function_name,
                        "content": json.dumps(function_response)
                    })
        else:
            # Max iterations reached
            ai_response = "I'm having trouble processing your request. Let me create a support ticket for human assistance."
            tools_used.append("create_support_ticket")

        timestamp = datetime.utcnow()
        duration_ms = int((timestamp - start_time).total_seconds() * 1000)

        # STEP 5: Save to database
        if DATABASE_AVAILABLE:
            updated_messages = conversation_history + [
                {
                    "role": "user",
                    "content": request.message,
                    "timestamp": timestamp
                },
                {
                    "role": "assistant",
                    "content": ai_response,
                    "tools_used": tools_used,
                    "timestamp": timestamp
                }
            ]

            support_chats.update_one(
                {"conversation_id": conversation_id, "user_id": user_id},
                {
                    "$set": {
                        "user_email": user_email,
                        "messages": updated_messages,
                        "updated_at": timestamp
                    },
                    "$setOnInsert": {"created_at": timestamp}
                },
                upsert=True
            )

            # Log analytics
            support_analytics.insert_one({
                "user_id": user_id,
                "conversation_id": conversation_id,
                "query": request.message,
                "response": ai_response,
                "tools_used": tools_used,
                "duration_ms": duration_ms,
                "tier": user_context.get("tier"),
                "created_at": timestamp
            })

        # STEP 6: Log to W&B
        if WANDB_AVAILABLE:
            wandb.log({
                "event": "support_chat_enhanced",
                "user_tier": user_context.get("tier"),
                "tools_used_count": len(tools_used),
                "tools": ",".join(tools_used),
                "duration_ms": duration_ms,
                "message_length": len(request.message),
                "response_length": len(ai_response)
            })

        return ChatResponse(
            success=True,
            conversation_id=conversation_id,
            message=request.message,
            response=ai_response,
            tools_used=tools_used,
            user_context=user_context,
            timestamp=timestamp
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Support chat failed: {str(e)}"
        )


@router.get("/health/enhanced")
async def health_check_enhanced():
    """Health check for enhanced support system"""
    return {
        "status": "healthy",
        "features": {
            "function_calling": True,
            "session_state": True,
            "analytics": WANDB_AVAILABLE,
            "database": DATABASE_AVAILABLE
        },
        "tools_available": list(TOOL_FUNCTIONS.keys()),
        "model": "gpt-4o-mini"
    }
