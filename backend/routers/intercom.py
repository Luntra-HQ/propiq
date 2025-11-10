"""
Intercom Customer Messaging Integration for PropIQ
Handles user events, webhooks, and customer engagement tracking
"""

from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import os
import hmac
import hashlib
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/intercom", tags=["intercom"])

# Intercom Configuration
INTERCOM_ACCESS_TOKEN = os.getenv("INTERCOM_ACCESS_TOKEN")
INTERCOM_WEBHOOK_SECRET = os.getenv("INTERCOM_WEBHOOK_SECRET")
INTERCOM_API_BASE = "https://api.intercom.io"

# Check if Intercom is configured
INTERCOM_ENABLED = bool(INTERCOM_ACCESS_TOKEN)


class UserEvent(BaseModel):
    """User event for Intercom tracking"""
    user_id: str
    email: EmailStr
    event_name: str
    metadata: Optional[Dict[str, Any]] = None


class UserIdentity(BaseModel):
    """User identity for Intercom"""
    user_id: str
    email: EmailStr
    name: Optional[str] = None
    created_at: Optional[int] = None
    custom_attributes: Optional[Dict[str, Any]] = None


def verify_webhook_signature(request_body: bytes, signature: str) -> bool:
    """
    Verify Intercom webhook signature

    Args:
        request_body: Raw request body bytes
        signature: X-Hub-Signature header value

    Returns:
        True if signature is valid
    """
    if not INTERCOM_WEBHOOK_SECRET:
        return False

    expected_signature = hmac.new(
        INTERCOM_WEBHOOK_SECRET.encode('utf-8'),
        request_body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(f"sha256={expected_signature}", signature)


def track_user_event(user_id: str, email: str, event_name: str, metadata: Dict[str, Any] = None):
    """
    Track a user event in Intercom

    Args:
        user_id: User's unique ID
        email: User's email address
        event_name: Name of the event
        metadata: Optional event metadata
    """
    if not INTERCOM_ENABLED:
        print(f"⚠️  Intercom not configured. Event not tracked: {event_name}")
        return

    try:
        headers = {
            "Authorization": f"Bearer {INTERCOM_ACCESS_TOKEN}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload = {
            "event_name": event_name,
            "created_at": int(datetime.utcnow().timestamp()),
            "user_id": user_id,
            "email": email
        }

        if metadata:
            payload["metadata"] = metadata

        response = requests.post(
            f"{INTERCOM_API_BASE}/events",
            headers=headers,
            json=payload,
            timeout=5
        )

        if response.status_code in [200, 202]:
            print(f"✅ Intercom event tracked: {event_name} for user {user_id}")
        else:
            print(f"⚠️  Intercom API error: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"⚠️  Failed to track Intercom event: {e}")


def create_or_update_user(user_id: str, email: str, name: str = None, custom_attributes: Dict[str, Any] = None):
    """
    Create or update a user in Intercom

    Args:
        user_id: User's unique ID
        email: User's email address
        name: User's full name
        custom_attributes: Custom user attributes
    """
    if not INTERCOM_ENABLED:
        print(f"⚠️  Intercom not configured. User not created/updated: {email}")
        return

    try:
        headers = {
            "Authorization": f"Bearer {INTERCOM_ACCESS_TOKEN}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload = {
            "user_id": user_id,
            "email": email,
            "signed_up_at": int(datetime.utcnow().timestamp())
        }

        if name:
            payload["name"] = name

        if custom_attributes:
            payload["custom_attributes"] = custom_attributes

        response = requests.post(
            f"{INTERCOM_API_BASE}/contacts",
            headers=headers,
            json=payload,
            timeout=5
        )

        if response.status_code in [200, 201]:
            print(f"✅ Intercom user created/updated: {email}")
        else:
            print(f"⚠️  Intercom API error: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"⚠️  Failed to create/update Intercom user: {e}")


@router.post("/webhook")
async def intercom_webhook(request: Request, x_hub_signature: str = Header(None)):
    """
    Handle incoming Intercom webhooks

    Intercom sends webhooks for events like:
    - user.created
    - user.deleted
    - conversation.user.created
    - conversation.admin.replied

    Requires:
    - X-Hub-Signature header for verification
    """
    if not INTERCOM_ENABLED:
        raise HTTPException(status_code=503, detail="Intercom not configured")

    # Get raw request body for signature verification
    body = await request.body()

    # Verify webhook signature
    if INTERCOM_WEBHOOK_SECRET and x_hub_signature:
        if not verify_webhook_signature(body, x_hub_signature):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # Parse webhook payload
    try:
        payload = await request.json()
        topic = payload.get("topic")
        data = payload.get("data", {})

        print(f"📨 Intercom webhook received: {topic}")

        # Handle different webhook topics
        if topic == "user.created":
            # New user signed up
            user = data.get("item", {})
            print(f"✅ New Intercom user: {user.get('email')}")

        elif topic == "conversation.user.created":
            # User started a conversation
            conversation = data.get("item", {})
            print(f"💬 New conversation from user")

        elif topic == "conversation.admin.replied":
            # Admin replied to user
            conversation = data.get("item", {})
            print(f"💬 Admin replied to conversation")

        return {"status": "received", "topic": topic}

    except Exception as e:
        print(f"⚠️  Failed to process Intercom webhook: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/track-event")
async def track_event(event: UserEvent):
    """
    Manually track a user event in Intercom

    Use this endpoint to track custom events like:
    - Property analysis completed
    - Subscription upgraded
    - Feature used

    Args:
        event: UserEvent with user_id, email, event_name, and optional metadata

    Returns:
        Success status
    """
    if not INTERCOM_ENABLED:
        raise HTTPException(status_code=503, detail="Intercom not configured")

    track_user_event(
        user_id=event.user_id,
        email=event.email,
        event_name=event.event_name,
        metadata=event.metadata
    )

    return {"status": "success", "event": event.event_name}


@router.post("/identify-user")
async def identify_user(user: UserIdentity):
    """
    Create or update a user in Intercom

    Use this endpoint to:
    - Register new users
    - Update user attributes
    - Track user properties

    Args:
        user: UserIdentity with user_id, email, name, and custom_attributes

    Returns:
        Success status
    """
    if not INTERCOM_ENABLED:
        raise HTTPException(status_code=503, detail="Intercom not configured")

    create_or_update_user(
        user_id=user.user_id,
        email=user.email,
        name=user.name,
        custom_attributes=user.custom_attributes
    )

    return {"status": "success", "user_id": user.user_id}


@router.get("/health")
async def health_check():
    """Health check endpoint for Intercom integration"""
    return {
        "status": "healthy" if INTERCOM_ENABLED else "degraded",
        "intercom_configured": INTERCOM_ENABLED,
        "api_base": INTERCOM_API_BASE
    }


# Helper function for other routers to use
def notify_user_signup(user_id: str, email: str, name: str = None, subscription_tier: str = "free"):
    """
    Notify Intercom when a user signs up

    Call this from auth.py after successful signup
    """
    create_or_update_user(
        user_id=user_id,
        email=email,
        name=name,
        custom_attributes={
            "subscription_tier": subscription_tier,
            "signup_date": datetime.utcnow().isoformat()
        }
    )

    track_user_event(
        user_id=user_id,
        email=email,
        event_name="user_signed_up",
        metadata={
            "subscription_tier": subscription_tier
        }
    )


def notify_property_analysis(user_id: str, email: str, address: str, recommendation: str):
    """
    Notify Intercom when a property analysis is completed

    Call this from propiq.py after successful analysis
    """
    track_user_event(
        user_id=user_id,
        email=email,
        event_name="property_analyzed",
        metadata={
            "address": address,
            "recommendation": recommendation,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def notify_subscription_change(user_id: str, email: str, old_tier: str, new_tier: str):
    """
    Notify Intercom when a user's subscription changes

    Call this from payment.py after subscription update
    """
    create_or_update_user(
        user_id=user_id,
        email=email,
        custom_attributes={
            "subscription_tier": new_tier,
            "previous_tier": old_tier,
            "upgraded_at": datetime.utcnow().isoformat()
        }
    )

    track_user_event(
        user_id=user_id,
        email=email,
        event_name="subscription_upgraded",
        metadata={
            "from_tier": old_tier,
            "to_tier": new_tier
        }
    )
