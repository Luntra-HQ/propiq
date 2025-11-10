"""
Support Chat Test Fixtures
Provides realistic support conversation data for testing
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List


# ============================================================================
# SUPPORT CHAT MESSAGE FIXTURES
# ============================================================================

def get_user_message(
    user_id: str,
    conversation_id: str,
    content: str = "I need help with my property analysis",
    created_at: datetime = None
) -> Dict[str, Any]:
    """
    User message in support chat

    Use case: Testing user-initiated support conversations
    """
    if created_at is None:
        created_at = datetime.utcnow()

    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "conversation_id": conversation_id,
        "role": "user",
        "content": content,
        "created_at": created_at.isoformat(),
        "updated_at": created_at.isoformat()
    }


def get_assistant_message(
    user_id: str,
    conversation_id: str,
    content: str = "I'd be happy to help with your property analysis. What specific questions do you have?",
    created_at: datetime = None
) -> Dict[str, Any]:
    """
    Assistant message in support chat

    Use case: Testing AI assistant responses
    """
    if created_at is None:
        created_at = datetime.utcnow()

    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": content,
        "created_at": created_at.isoformat(),
        "updated_at": created_at.isoformat()
    }


def get_system_message(
    user_id: str,
    conversation_id: str,
    content: str = "Support conversation started",
    created_at: datetime = None
) -> Dict[str, Any]:
    """
    System message in support chat

    Use case: Testing system notifications
    """
    if created_at is None:
        created_at = datetime.utcnow()

    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "conversation_id": conversation_id,
        "role": "system",
        "content": content,
        "created_at": created_at.isoformat(),
        "updated_at": created_at.isoformat()
    }


# ============================================================================
# CONVERSATION FLOW FIXTURES
# ============================================================================

def get_basic_conversation(user_id: str) -> List[Dict[str, Any]]:
    """
    Basic support conversation (3 messages)

    Use case: Testing simple support interactions
    """
    conversation_id = str(uuid.uuid4())
    base_time = datetime.utcnow() - timedelta(minutes=10)

    return [
        get_user_message(
            user_id,
            conversation_id,
            "How do I interpret the cap rate in my property analysis?",
            base_time
        ),
        get_assistant_message(
            user_id,
            conversation_id,
            "The cap rate (capitalization rate) is a key metric that shows the rate of return on your investment. "
            "It's calculated as Net Operating Income / Property Value. A higher cap rate typically means higher returns.",
            base_time + timedelta(seconds=30)
        ),
        get_user_message(
            user_id,
            conversation_id,
            "Thank you! That makes sense now.",
            base_time + timedelta(minutes=2)
        )
    ]


def get_technical_support_conversation(user_id: str) -> List[Dict[str, Any]]:
    """
    Technical support conversation

    Use case: Testing technical issue resolution
    """
    conversation_id = str(uuid.uuid4())
    base_time = datetime.utcnow() - timedelta(hours=1)

    return [
        get_user_message(
            user_id,
            conversation_id,
            "I'm getting an error when trying to analyze a property: 'Address not found'",
            base_time
        ),
        get_assistant_message(
            user_id,
            conversation_id,
            "I can help with that. Could you share the exact address you're trying to analyze?",
            base_time + timedelta(seconds=45)
        ),
        get_user_message(
            user_id,
            conversation_id,
            "123 Main Street, San Francisco CA",
            base_time + timedelta(minutes=2)
        ),
        get_assistant_message(
            user_id,
            conversation_id,
            "I see the issue - the address format needs a comma between the state and city. Try: '123 Main Street, San Francisco, CA 94102'. "
            "Also include the ZIP code for best results.",
            base_time + timedelta(minutes=2, seconds=30)
        ),
        get_user_message(
            user_id,
            conversation_id,
            "Perfect! That worked. Thanks!",
            base_time + timedelta(minutes=5)
        )
    ]


def get_billing_support_conversation(user_id: str) -> List[Dict[str, Any]]:
    """
    Billing/subscription support conversation

    Use case: Testing payment-related support
    """
    conversation_id = str(uuid.uuid4())
    base_time = datetime.utcnow() - timedelta(days=1)

    return [
        get_user_message(
            user_id,
            conversation_id,
            "I was charged but my account still shows as Free tier",
            base_time
        ),
        get_assistant_message(
            user_id,
            conversation_id,
            "I apologize for the inconvenience. Let me check your subscription status. "
            "Can you confirm the email address associated with your payment?",
            base_time + timedelta(minutes=1)
        ),
        get_user_message(
            user_id,
            conversation_id,
            "starter@test.propiq.com",
            base_time + timedelta(minutes=3)
        ),
        get_assistant_message(
            user_id,
            conversation_id,
            "Thank you. I can see your payment was processed successfully. Your account has been upgraded to Starter tier. "
            "Please refresh your browser to see the updated tier. If you still see issues, please let me know.",
            base_time + timedelta(minutes=5)
        ),
        get_user_message(
            user_id,
            conversation_id,
            "It's working now! Thank you so much!",
            base_time + timedelta(minutes=8)
        )
    ]


def get_feature_question_conversation(user_id: str) -> List[Dict[str, Any]]:
    """
    Feature inquiry conversation

    Use case: Testing product feature explanations
    """
    conversation_id = str(uuid.uuid4())
    base_time = datetime.utcnow() - timedelta(hours=2)

    return [
        get_user_message(
            user_id,
            conversation_id,
            "What's the difference between the Starter and Pro tiers?",
            base_time
        ),
        get_assistant_message(
            user_id,
            conversation_id,
            "Great question! Here are the key differences:\n\n"
            "**Starter ($29/month):**\n"
            "- 25 property analyses per month\n"
            "- Basic market analysis\n"
            "- Standard support\n\n"
            "**Pro ($79/month):**\n"
            "- 100 property analyses per month\n"
            "- Advanced market insights\n"
            "- Priority support\n"
            "- Export to PDF\n"
            "- API access\n\n"
            "Pro tier is ideal for real estate professionals and active investors.",
            base_time + timedelta(seconds=45)
        ),
        get_user_message(
            user_id,
            conversation_id,
            "Can I upgrade mid-month?",
            base_time + timedelta(minutes=3)
        ),
        get_assistant_message(
            user_id,
            conversation_id,
            "Yes! You can upgrade anytime. We'll prorate the remaining time on your current plan "
            "and you'll get immediate access to all Pro features.",
            base_time + timedelta(minutes=3, seconds=30)
        )
    ]


def get_long_conversation(user_id: str) -> List[Dict[str, Any]]:
    """
    Long conversation with many back-and-forth messages

    Use case: Testing pagination, conversation history limits
    """
    conversation_id = str(uuid.uuid4())
    base_time = datetime.utcnow() - timedelta(hours=3)
    messages = []

    # Create 20 alternating messages
    for i in range(10):
        messages.append(get_user_message(
            user_id,
            conversation_id,
            f"User message {i+1} - asking about feature details",
            base_time + timedelta(minutes=i*2)
        ))
        messages.append(get_assistant_message(
            user_id,
            conversation_id,
            f"Assistant response {i+1} - providing detailed explanation",
            base_time + timedelta(minutes=i*2, seconds=30)
        ))

    return messages


# ============================================================================
# CONVERSATION METADATA FIXTURES
# ============================================================================

def get_conversation_summary(
    user_id: str,
    conversation_id: str = None,
    message_count: int = 3
) -> Dict[str, Any]:
    """
    Conversation summary metadata

    Use case: Testing conversation list views
    """
    if conversation_id is None:
        conversation_id = str(uuid.uuid4())

    return {
        "conversation_id": conversation_id,
        "user_id": user_id,
        "message_count": message_count,
        "first_message": "How do I interpret the cap rate?",
        "last_message": "Thank you! That makes sense now.",
        "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "status": "resolved"
    }


def get_active_conversation_summary(user_id: str) -> Dict[str, Any]:
    """
    Active (unresolved) conversation summary

    Use case: Testing active conversation detection
    """
    return {
        "conversation_id": str(uuid.uuid4()),
        "user_id": user_id,
        "message_count": 5,
        "first_message": "I'm having trouble with property analysis",
        "last_message": "Let me investigate this further for you",
        "created_at": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "status": "active"
    }


# ============================================================================
# MULTI-CONVERSATION FIXTURES
# ============================================================================

def get_user_conversation_history(user_id: str, count: int = 5) -> List[Dict[str, Any]]:
    """
    Generate multiple conversation summaries for a user

    Args:
        user_id: User ID
        count: Number of conversations to generate

    Use case: Testing conversation history, pagination
    """
    conversations = []

    for i in range(count):
        conv_id = str(uuid.uuid4())
        conversations.append({
            "conversation_id": conv_id,
            "user_id": user_id,
            "message_count": 3 + (i * 2),
            "first_message": f"Support question {i+1}",
            "last_message": f"Thank you for your help!",
            "created_at": (datetime.utcnow() - timedelta(days=i)).isoformat(),
            "updated_at": (datetime.utcnow() - timedelta(days=i, hours=-1)).isoformat(),
            "status": "resolved"
        })

    return conversations


# ============================================================================
# EDGE CASE FIXTURES
# ============================================================================

def get_empty_conversation(user_id: str) -> List[Dict[str, Any]]:
    """
    Conversation with no messages

    Use case: Testing edge case handling
    """
    return []


def get_very_long_message(user_id: str, conversation_id: str = None) -> Dict[str, Any]:
    """
    Message with very long content

    Use case: Testing message length limits
    """
    if conversation_id is None:
        conversation_id = str(uuid.uuid4())

    long_content = "This is a very long message. " * 100  # 3000+ characters

    return get_user_message(user_id, conversation_id, long_content)


def get_special_characters_message(user_id: str, conversation_id: str = None) -> Dict[str, Any]:
    """
    Message with special characters, emojis, code

    Use case: Testing character encoding, sanitization
    """
    if conversation_id is None:
        conversation_id = str(uuid.uuid4())

    content = """
    Testing special characters:
    - Emojis: 🏠 💰 📊
    - Math: ROI = (Revenue - Cost) / Cost × 100%
    - Code: `const capRate = noi / propertyValue`
    - Links: https://propiq.luntra.one
    - Quotes: "The best investment"
    """

    return get_user_message(user_id, conversation_id, content)


# ============================================================================
# COMMON SUPPORT TOPICS (Pre-built responses)
# ============================================================================

COMMON_TOPICS = {
    "cap_rate": {
        "question": "What is cap rate and how do I use it?",
        "answer": "Cap rate (capitalization rate) is the rate of return on a real estate investment. "
                  "It's calculated as: Net Operating Income / Property Value × 100%. "
                  "A higher cap rate typically indicates higher returns but may also indicate higher risk."
    },
    "usage_limits": {
        "question": "How many property analyses can I run?",
        "answer": "Your usage limits depend on your tier:\n"
                  "- Free: 5 analyses per month\n"
                  "- Starter: 25 analyses per month\n"
                  "- Pro: 100 analyses per month\n"
                  "- Elite: 500 analyses per month"
    },
    "upgrade": {
        "question": "How do I upgrade my subscription?",
        "answer": "You can upgrade anytime from your dashboard. Go to Settings → Subscription → Choose Plan. "
                  "Your upgrade is immediate and we'll prorate any unused time from your current plan."
    },
    "cancel": {
        "question": "How do I cancel my subscription?",
        "answer": "You can cancel anytime from Settings → Subscription → Cancel Plan. "
                  "You'll retain access until the end of your current billing period."
    },
    "api_access": {
        "question": "Do you have API access?",
        "answer": "Yes! API access is available on Pro tier and above. "
                  "You can generate API keys from Settings → API Access."
    }
}


def get_conversation_for_topic(user_id: str, topic: str) -> List[Dict[str, Any]]:
    """
    Generate conversation for a common support topic

    Args:
        user_id: User ID
        topic: One of: cap_rate, usage_limits, upgrade, cancel, api_access

    Use case: Testing common support scenarios
    """
    if topic not in COMMON_TOPICS:
        raise ValueError(f"Unknown topic: {topic}. Choose from: {list(COMMON_TOPICS.keys())}")

    conversation_id = str(uuid.uuid4())
    base_time = datetime.utcnow() - timedelta(minutes=5)

    topic_data = COMMON_TOPICS[topic]

    return [
        get_user_message(user_id, conversation_id, topic_data["question"], base_time),
        get_assistant_message(
            user_id,
            conversation_id,
            topic_data["answer"],
            base_time + timedelta(seconds=30)
        ),
        get_user_message(user_id, conversation_id, "Thank you!", base_time + timedelta(minutes=1))
    ]


# ============================================================================
# ASSERTION HELPERS
# ============================================================================

def assert_message_valid(message: Dict[str, Any]) -> None:
    """
    Assert that message has all required fields

    Use case: Validating API responses in tests
    """
    assert "id" in message
    assert "user_id" in message
    assert "conversation_id" in message
    assert "role" in message
    assert "content" in message
    assert "created_at" in message
    assert message["role"] in ["user", "assistant", "system"]


def assert_message_belongs_to_user(message: Dict[str, Any], user_id: str) -> None:
    """
    Assert that message belongs to specific user

    Use case: Testing access control
    """
    assert message["user_id"] == user_id, \
        f"Message belongs to {message['user_id']}, not {user_id}"


def assert_message_belongs_to_conversation(
    message: Dict[str, Any],
    conversation_id: str
) -> None:
    """
    Assert that message belongs to specific conversation

    Use case: Testing conversation isolation
    """
    assert message["conversation_id"] == conversation_id, \
        f"Message belongs to conversation {message['conversation_id']}, not {conversation_id}"


def assert_conversation_order(messages: List[Dict[str, Any]]) -> None:
    """
    Assert that messages are in chronological order

    Use case: Testing message sorting
    """
    for i in range(len(messages) - 1):
        current_time = datetime.fromisoformat(messages[i]["created_at"])
        next_time = datetime.fromisoformat(messages[i + 1]["created_at"])
        assert current_time <= next_time, \
            f"Messages not in chronological order at index {i}"
