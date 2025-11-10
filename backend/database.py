"""
Supabase database service for PropIQ
Replaces MongoDB with PostgreSQL
"""

import os
from supabase import create_client, Client
from typing import Optional, Dict, List
import bcrypt
from datetime import datetime

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for admin operations

# Only initialize if credentials are available
supabase: Optional[Client] = None
if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)

# ============================================================================
# USER OPERATIONS
# ============================================================================

def create_user(email: str, password: str, full_name: Optional[str] = None) -> Dict:
    """
    Create a new user with hashed password

    Args:
        email: User's email address
        password: Plain text password (will be hashed)
        full_name: Optional full name

    Returns:
        Created user data (without password_hash)
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    # Hash password with bcrypt
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    result = supabase.table("users").insert({
        "email": email,
        "password_hash": password_hash,
        "full_name": full_name,
        "trial_analyses_remaining": 3
    }).execute()

    if result.data:
        user = result.data[0]
        # Don't return password_hash
        user.pop('password_hash', None)
        return user

    return None


def get_user_by_email(email: str) -> Optional[Dict]:
    """
    Get user by email

    Args:
        email: User's email address

    Returns:
        User data (including password_hash for verification)
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("users").select("*").eq("email", email).execute()
    return result.data[0] if result.data else None


def get_user_by_id(user_id: str) -> Optional[Dict]:
    """
    Get user by ID

    Args:
        user_id: User's UUID

    Returns:
        User data (without password_hash)
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("users").select("*").eq("id", user_id).execute()

    if result.data:
        user = result.data[0]
        # Don't return password_hash
        user.pop('password_hash', None)
        return user

    return None


def verify_password(plain_password: str, password_hash: str) -> bool:
    """
    Verify password against hash

    Args:
        plain_password: Plain text password to verify
        password_hash: Bcrypt hash from database

    Returns:
        True if password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), password_hash.encode('utf-8'))
    except Exception:
        return False


def update_last_login(user_id: str):
    """
    Update user's last login timestamp

    Args:
        user_id: User's UUID
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    supabase.table("users").update({
        "last_login_at": datetime.utcnow().isoformat()
    }).eq("id", user_id).execute()


def update_user_profile(user_id: str, updates: Dict) -> Optional[Dict]:
    """
    Update user profile information

    Args:
        user_id: User's UUID
        updates: Dictionary of fields to update (full_name, company, phone)

    Returns:
        Updated user data
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    # Only allow specific fields to be updated
    allowed_fields = {'full_name', 'company', 'phone'}
    filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}

    if not filtered_updates:
        return None

    result = supabase.table("users").update(filtered_updates).eq("id", user_id).execute()

    if result.data:
        user = result.data[0]
        user.pop('password_hash', None)
        return user

    return None


# ============================================================================
# PROPERTY ANALYSIS OPERATIONS
# ============================================================================

def save_property_analysis(
    user_id: str,
    address: str,
    analysis_data: Dict
) -> Dict:
    """
    Save property analysis to database

    Args:
        user_id: User's UUID
        address: Property address
        analysis_data: Analysis result and metadata

    Returns:
        Saved analysis data
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    # Extract location info if available
    location = analysis_data.get("analysis", {}).get("location", {})

    result = supabase.table("property_analyses").insert({
        "user_id": user_id,
        "address": address,
        "property_type": analysis_data.get("property_type", "single_family"),
        "purchase_price": analysis_data.get("purchase_price"),
        "down_payment": analysis_data.get("down_payment"),
        "interest_rate": analysis_data.get("interest_rate"),
        "analysis_result": analysis_data.get("analysis"),
        "tokens_used": analysis_data.get("tokens_used"),
        "model_used": analysis_data.get("model", "gpt-4o-mini"),
        "city": location.get("city"),
        "state": location.get("state"),
        "zip_code": analysis_data.get("zip_code")
    }).execute()

    return result.data[0] if result.data else None


def get_user_analyses(user_id: str, limit: int = 10) -> List[Dict]:
    """
    Get user's property analyses

    Args:
        user_id: User's UUID
        limit: Maximum number of analyses to return

    Returns:
        List of analysis records
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("property_analyses")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()

    return result.data


def get_analysis_by_id(analysis_id: str) -> Optional[Dict]:
    """
    Get specific property analysis by ID

    Args:
        analysis_id: Analysis UUID

    Returns:
        Analysis data
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("property_analyses")\
        .select("*")\
        .eq("id", analysis_id)\
        .execute()

    return result.data[0] if result.data else None


def decrement_trial_analyses(user_id: str) -> bool:
    """
    Decrement user's trial analyses count

    Args:
        user_id: User's UUID

    Returns:
        True if decremented, False if no trials remaining
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    user = get_user_by_id(user_id)
    if user and user.get("trial_analyses_remaining", 0) > 0:
        supabase.table("users").update({
            "trial_analyses_remaining": user["trial_analyses_remaining"] - 1
        }).eq("id", user_id).execute()
        return True

    return False


def get_user_trial_count(user_id: str) -> int:
    """
    Get user's remaining trial analyses count

    Args:
        user_id: User's UUID

    Returns:
        Number of trials remaining
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("users")\
        .select("trial_analyses_remaining")\
        .eq("id", user_id)\
        .execute()

    if result.data:
        return result.data[0].get("trial_analyses_remaining", 0)

    return 0


# ============================================================================
# SUBSCRIPTION OPERATIONS
# ============================================================================

def create_subscription(user_id: str, stripe_data: Dict) -> Dict:
    """
    Create or update subscription

    Args:
        user_id: User's UUID
        stripe_data: Stripe subscription data

    Returns:
        Created/updated subscription data
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("subscriptions").upsert({
        "user_id": user_id,
        "stripe_customer_id": stripe_data.get("customer_id"),
        "stripe_subscription_id": stripe_data.get("subscription_id"),
        "stripe_price_id": stripe_data.get("price_id"),
        "tier": stripe_data.get("tier", "starter"),
        "status": stripe_data.get("status", "active"),
        "current_period_start": stripe_data.get("current_period_start"),
        "current_period_end": stripe_data.get("current_period_end")
    }).execute()

    # Update user's subscription status
    supabase.table("users").update({
        "subscription_tier": stripe_data.get("tier", "starter"),
        "subscription_status": stripe_data.get("status", "active")
    }).eq("id", user_id).execute()

    return result.data[0] if result.data else None


def get_user_subscription(user_id: str) -> Optional[Dict]:
    """
    Get user's subscription

    Args:
        user_id: User's UUID

    Returns:
        Subscription data
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("subscriptions")\
        .select("*")\
        .eq("user_id", user_id)\
        .execute()

    return result.data[0] if result.data else None


def cancel_subscription(user_id: str) -> bool:
    """
    Cancel user's subscription

    Args:
        user_id: User's UUID

    Returns:
        True if canceled, False otherwise
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("subscriptions").update({
        "status": "canceled",
        "canceled_at": datetime.utcnow().isoformat()
    }).eq("user_id", user_id).execute()

    # Update user status
    supabase.table("users").update({
        "subscription_status": "canceled"
    }).eq("id", user_id).execute()

    return bool(result.data)


# ============================================================================
# EMAIL SUBSCRIBER OPERATIONS (for marketing)
# ============================================================================

def add_email_subscriber(email: str, source: str = "landing_page") -> Dict:
    """
    Add email subscriber for marketing

    Args:
        email: Subscriber email
        source: Source of subscription (e.g., 'landing_page', 'blog', 'popup')

    Returns:
        Subscriber data
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("email_subscribers").upsert({
        "email": email,
        "source": source,
        "is_active": True
    }).execute()

    return result.data[0] if result.data else None


def get_email_subscriber(email: str) -> Optional[Dict]:
    """
    Get email subscriber by email

    Args:
        email: Subscriber email

    Returns:
        Subscriber data
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("email_subscribers")\
        .select("*")\
        .eq("email", email)\
        .execute()

    return result.data[0] if result.data else None


def unsubscribe_email(email: str) -> bool:
    """
    Unsubscribe email from marketing

    Args:
        email: Subscriber email

    Returns:
        True if unsubscribed, False otherwise
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("email_subscribers").update({
        "is_active": False
    }).eq("email", email).execute()

    return bool(result.data)


# ============================================================================
# ANALYTICS & REPORTING
# ============================================================================

def get_total_users() -> int:
    """Get total number of users"""
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("users").select("id", count="exact").execute()
    return result.count if hasattr(result, 'count') else 0


def get_total_analyses() -> int:
    """Get total number of property analyses"""
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("property_analyses").select("id", count="exact").execute()
    return result.count if hasattr(result, 'count') else 0


def get_active_subscriptions() -> int:
    """Get number of active subscriptions"""
    if not supabase:
        raise Exception("Supabase client not initialized")

    result = supabase.table("subscriptions")\
        .select("id", count="exact")\
        .eq("status", "active")\
        .execute()

    return result.count if hasattr(result, 'count') else 0
