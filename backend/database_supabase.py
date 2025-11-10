"""
Supabase PostgreSQL Database Connection for PropIQ
Replaces MongoDB with PostgreSQL for better Render compatibility
"""
import os
from typing import Optional, Dict, Any
import bcrypt
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
from config.logging_config import get_logger

load_dotenv()

logger = get_logger(__name__)

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for backend

# Initialize Supabase client
supabase: Optional[Client] = None

try:
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info("Supabase connection initialized")
    else:
        logger.warning("Supabase not configured (missing URL or SERVICE_KEY)")
except Exception as e:
    logger.error(f"Supabase connection failed: {e}", exc_info=True)

# ============================================================================
# USER AUTHENTICATION FUNCTIONS
# ============================================================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_user(email: str, password: str, full_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a new user in Supabase

    Args:
        email: User email (unique)
        password: Plain text password (will be hashed)
        full_name: Optional full name

    Returns:
        User data dict

    Raises:
        Exception: If user already exists or creation fails
    """
    if not supabase:
        raise Exception("Supabase not initialized")

    # Check if user already exists
    existing = supabase.table("users").select("id").eq("email", email.lower()).execute()
    if existing.data:
        raise Exception(f"User with email {email} already exists")

    # Hash password
    password_hash = hash_password(password)

    # Create user record
    user_data = {
        "email": email.lower(),
        "password_hash": password_hash,
        "full_name": full_name,
        "subscription_tier": "free",
        "subscription_status": "active",
        "propiq_usage_count": 0,
        "propiq_usage_limit": 5,  # Free tier: 5 analyses
        "created_at": datetime.utcnow().isoformat(),
        "last_login": datetime.utcnow().isoformat()
    }

    result = supabase.table("users").insert(user_data).execute()

    if not result.data:
        raise Exception("Failed to create user")

    return result.data[0]

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    if not supabase:
        return None

    result = supabase.table("users").select("*").eq("email", email.lower()).execute()

    if result.data:
        return result.data[0]
    return None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    if not supabase:
        return None

    result = supabase.table("users").select("*").eq("id", user_id).execute()

    if result.data:
        return result.data[0]
    return None

def update_last_login(user_id: str) -> bool:
    """Update user's last login timestamp"""
    if not supabase:
        return False

    try:
        supabase.table("users").update({
            "last_login": datetime.utcnow().isoformat()
        }).eq("id", user_id).execute()
        return True
    except Exception:
        return False

# ============================================================================
# PROPERTY ANALYSIS FUNCTIONS
# ============================================================================

def save_property_analysis(
    user_id: str,
    address: str,
    analysis_result: Dict[str, Any],
    wandb_run_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Save property analysis to database

    Args:
        user_id: User ID
        address: Property address
        analysis_result: Analysis data from AI
        wandb_run_id: Optional W&B run ID for tracking

    Returns:
        Saved analysis record
    """
    if not supabase:
        raise Exception("Supabase not initialized")

    analysis_data = {
        "user_id": user_id,
        "address": address,
        "analysis_result": analysis_result,  # JSONB column
        "wandb_run_id": wandb_run_id,
        "created_at": datetime.utcnow().isoformat()
    }

    result = supabase.table("property_analyses").insert(analysis_data).execute()

    if not result.data:
        raise Exception("Failed to save analysis")

    # Increment user's usage count
    supabase.rpc("increment_propiq_usage", {"user_id_param": user_id}).execute()

    return result.data[0]

def get_user_analyses(user_id: str, limit: int = 20, offset: int = 0) -> list:
    """
    Get user's property analysis history with pagination support

    Args:
        user_id: User ID to get analyses for
        limit: Maximum number of analyses to return
        offset: Number of analyses to skip (for pagination)

    Returns:
        List of property analyses
    """
    if not supabase:
        return []

    result = supabase.table("property_analyses")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .range(offset, offset + limit - 1)\
        .execute()

    return result.data if result.data else []

def count_user_analyses(user_id: str) -> int:
    """
    Get total count of user's property analyses

    Args:
        user_id: User ID to count analyses for

    Returns:
        Total number of analyses
    """
    if not supabase:
        return 0

    result = supabase.table("property_analyses")\
        .select("id", count="exact")\
        .eq("user_id", user_id)\
        .execute()

    return result.count if result.count is not None else 0

def check_usage_limit(user_id: str) -> Dict[str, Any]:
    """
    Check if user has reached their usage limit

    Returns:
        {
            "can_analyze": bool,
            "usage_count": int,
            "usage_limit": int,
            "remaining": int,
            "tier": str
        }
    """
    if not supabase:
        return {
            "can_analyze": False,
            "usage_count": 0,
            "usage_limit": 0,
            "remaining": 0,
            "tier": "unknown"
        }

    user = get_user_by_id(user_id)
    if not user:
        return {
            "can_analyze": False,
            "usage_count": 0,
            "usage_limit": 0,
            "remaining": 0,
            "tier": "unknown"
        }

    usage_count = user.get("propiq_usage_count", 0)
    usage_limit = user.get("propiq_usage_limit", 5)
    remaining = max(0, usage_limit - usage_count)

    return {
        "can_analyze": usage_count < usage_limit,
        "usage_count": usage_count,
        "usage_limit": usage_limit,
        "remaining": remaining,
        "tier": user.get("subscription_tier", "free")
    }

def decrement_trial_analyses(user_id: str) -> bool:
    """
    Decrement trial analyses (actually increments usage count)

    This function name is kept for backward compatibility with MongoDB code.
    In Supabase, we increment usage_count instead of decrementing remaining.

    Args:
        user_id: User ID

    Returns:
        True if successful, False otherwise
    """
    if not supabase:
        return False

    try:
        # Increment usage count via RPC function
        supabase.rpc("increment_propiq_usage", {"user_id_param": user_id}).execute()
        return True
    except Exception as e:
        logger.error(f"Failed to decrement trial analyses: {e}", exc_info=True)
        return False

def get_user_trial_count(user_id: str) -> int:
    """
    Get remaining trial analyses for user

    This function name is kept for backward compatibility with MongoDB code.

    Args:
        user_id: User ID

    Returns:
        Number of analyses remaining (usage_limit - usage_count)
    """
    if not supabase:
        return 0

    user = get_user_by_id(user_id)
    if not user:
        return 0

    usage_count = user.get("propiq_usage_count", 0)
    usage_limit = user.get("propiq_usage_limit", 5)
    remaining = max(0, usage_limit - usage_count)

    return remaining

# ============================================================================
# SUBSCRIPTION FUNCTIONS
# ============================================================================

def update_user_subscription(
    user_id: str,
    tier: str,
    status: str = "active"
) -> bool:
    """
    Update user's subscription tier and limits

    Args:
        user_id: User ID
        tier: Subscription tier (free, starter, pro, elite)
        status: Subscription status (active, canceled, past_due)
    """
    if not supabase:
        return False

    # Define usage limits per tier
    tier_limits = {
        "free": 5,
        "starter": 30,
        "pro": 60,
        "elite": 100
    }

    usage_limit = tier_limits.get(tier.lower(), 5)

    try:
        supabase.table("users").update({
            "subscription_tier": tier.lower(),
            "subscription_status": status,
            "propiq_usage_limit": usage_limit,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", user_id).execute()

        return True
    except Exception as e:
        logger.error(f"Failed to update subscription: {e}", exc_info=True)
        return False

# ============================================================================
# SUPPORT CHAT FUNCTIONS
# ============================================================================

def save_support_message(
    user_id: str,
    conversation_id: str,
    message: str,
    role: str,  # "user" or "assistant"
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Save support chat message"""
    if not supabase:
        raise Exception("Supabase not initialized")

    message_data = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "message": message,
        "role": role,
        "metadata": metadata or {},
        "created_at": datetime.utcnow().isoformat()
    }

    result = supabase.table("support_chats").insert(message_data).execute()

    if not result.data:
        raise Exception("Failed to save message")

    return result.data[0]

def get_conversation_history(conversation_id: str, limit: int = 50) -> list:
    """Get support conversation history"""
    if not supabase:
        return []

    result = supabase.table("support_chats")\
        .select("*")\
        .eq("conversation_id", conversation_id)\
        .order("created_at", desc=False)\
        .limit(limit)\
        .execute()

    return result.data if result.data else []

# ============================================================================
# HEALTH CHECK
# ============================================================================

def get_database() -> Optional[Client]:
    """Get Supabase client (for health checks)"""
    return supabase

def test_connection() -> bool:
    """Test database connection"""
    if not supabase:
        return False

    try:
        # Simple query to test connection
        result = supabase.table("users").select("id").limit(1).execute()
        return True
    except Exception:
        return False

# ============================================================================
# ONBOARDING STATUS FUNCTIONS
# ============================================================================

def record_onboarding_status(user_id: str, campaign_results: Dict[str, Any]) -> bool:
    """
    Record initial onboarding campaign status in database

    Args:
        user_id: User's database ID
        campaign_results: Results from start_onboarding_campaign containing:
            - user_email: Email address
            - emails_sent: List of sent emails
            - emails_scheduled: List of scheduled emails
            - errors: List of errors

    Returns:
        bool: True if successful, False otherwise
    """
    if not supabase:
        logger.warning("Supabase not available - cannot record onboarding status")
        return False

    try:
        # Build email_status object from results
        email_status = {}
        for sent_email in campaign_results.get("emails_sent", []):
            email_status[f"day_{sent_email['day']}"] = "sent"
        for scheduled_email in campaign_results.get("emails_scheduled", []):
            email_status[f"day_{scheduled_email['day']}"] = "scheduled"

        # Prepare data for database
        onboarding_data = {
            "user_id": user_id,
            "user_email": campaign_results.get("user_email", ""),
            "campaign_started_at": datetime.utcnow().isoformat(),
            "email_status": email_status,
            "emails_scheduled": campaign_results.get("emails_scheduled", []),
            "errors": campaign_results.get("errors", []),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        # Insert or update (upsert) onboarding status
        result = supabase.table("onboarding_status").upsert(
            onboarding_data,
            on_conflict="user_id"
        ).execute()

        logger.info(f"✅ Recorded onboarding status for user {user_id}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to record onboarding status for {user_id}: {e}", exc_info=True)
        return False


def update_onboarding_status(user_id: str, day_number: int, status: str) -> bool:
    """
    Update the status of a specific onboarding email

    Args:
        user_id: User's database ID
        day_number: Email day number (1-4)
        status: New status ("sent", "failed", "scheduled")

    Returns:
        bool: True if successful, False otherwise
    """
    if not supabase:
        logger.warning("Supabase not available - cannot update onboarding status")
        return False

    try:
        # First, get current status
        result = supabase.table("onboarding_status").select("*").eq("user_id", user_id).execute()

        if not result.data:
            logger.warning(f"No onboarding record found for user {user_id}")
            return False

        current_data = result.data[0]
        email_status = current_data.get("email_status", {})
        emails_scheduled = current_data.get("emails_scheduled", [])

        # Update email_status
        email_status[f"day_{day_number}"] = status

        # Update the scheduled email status in emails_scheduled array
        for scheduled_email in emails_scheduled:
            if scheduled_email.get("day") == day_number:
                scheduled_email["status"] = status

        # Update database
        update_result = supabase.table("onboarding_status").update({
            "email_status": email_status,
            "emails_scheduled": emails_scheduled,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).execute()

        logger.info(f"✅ Updated onboarding status for user {user_id}, day {day_number}: {status}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to update onboarding status for {user_id}: {e}", exc_info=True)
        return False


def get_onboarding_status(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get onboarding campaign status for a user

    Args:
        user_id: User's database ID

    Returns:
        Dictionary with onboarding status or None if not found
    """
    if not supabase:
        logger.warning("Supabase not available - cannot get onboarding status")
        return None

    try:
        result = supabase.table("onboarding_status").select("*").eq("user_id", user_id).execute()

        if result.data:
            return result.data[0]
        else:
            logger.info(f"No onboarding status found for user {user_id}")
            return None

    except Exception as e:
        logger.error(f"❌ Failed to get onboarding status for {user_id}: {e}", exc_info=True)
        return None


def get_pending_onboarding_emails() -> list[Dict[str, Any]]:
    """
    Get all scheduled onboarding emails that are due to be sent

    Returns:
        List of dictionaries with pending email information:
        [
            {
                "user_id": "uuid",
                "user_email": "user@example.com",
                "day_number": 2,
                "scheduled_for": "ISO timestamp",
                "subject": "Email subject"
            },
            ...
        ]
    """
    if not supabase:
        logger.warning("Supabase not available - cannot get pending emails")
        return []

    try:
        # Get all onboarding statuses
        result = supabase.table("onboarding_status").select("*").execute()

        pending_emails = []
        current_time = datetime.utcnow()

        for record in result.data:
            user_id = record.get("user_id")
            user_email = record.get("user_email")
            emails_scheduled = record.get("emails_scheduled", [])

            # Check each scheduled email
            for scheduled_email in emails_scheduled:
                status = scheduled_email.get("status", "")
                scheduled_for_str = scheduled_email.get("scheduled_for", "")

                # Only include emails that are scheduled and due
                if status == "scheduled" and scheduled_for_str:
                    try:
                        # Parse ISO timestamp
                        scheduled_for = datetime.fromisoformat(scheduled_for_str.replace("Z", "+00:00"))

                        # Check if it's time to send
                        if scheduled_for <= current_time:
                            pending_emails.append({
                                "user_id": user_id,
                                "user_email": user_email,
                                "day_number": scheduled_email.get("day"),
                                "scheduled_for": scheduled_for_str,
                                "subject": scheduled_email.get("subject", "")
                            })
                    except Exception as parse_error:
                        logger.warning(f"Failed to parse scheduled_for date: {parse_error}")
                        continue

        logger.info(f"📧 Found {len(pending_emails)} pending onboarding emails")
        return pending_emails

    except Exception as e:
        logger.error(f"❌ Failed to get pending onboarding emails: {e}", exc_info=True)
        return []


# ============================================================================
# GDPR COMPLIANCE FUNCTIONS
# ============================================================================

async def get_user_property_analyses(user_id: str) -> list[Dict[str, Any]]:
    """
    Get all property analyses for a user (for GDPR data export)

    Args:
        user_id: User ID

    Returns:
        List of property analyses
    """
    if not supabase:
        return []

    try:
        result = supabase.table("property_analyses") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        return result.data if result.data else []

    except Exception as e:
        logger.error(f"Failed to get user analyses: {e}", exc_info=True)
        return []


async def get_user_support_chats(user_id: str) -> list[Dict[str, Any]]:
    """
    Get all support chat messages for a user (for GDPR data export)

    Args:
        user_id: User ID

    Returns:
        List of support chat messages
    """
    if not supabase:
        return []

    try:
        result = supabase.table("support_chats") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        return result.data if result.data else []

    except Exception as e:
        logger.error(f"Failed to get user support chats: {e}", exc_info=True)
        return []


async def verify_user_password(user_id: str, password: str) -> bool:
    """
    Verify user password by user ID

    Args:
        user_id: User ID
        password: Plain text password to verify

    Returns:
        True if password is correct, False otherwise
    """
    if not supabase:
        return False

    try:
        # Get user's password hash
        result = supabase.table("users") \
            .select("password_hash") \
            .eq("id", user_id) \
            .execute()

        if not result.data:
            return False

        password_hash = result.data[0].get("password_hash")
        if not password_hash:
            return False

        # Verify password
        return verify_password(password, password_hash)

    except Exception as e:
        logger.error(f"Failed to verify password: {e}", exc_info=True)
        return False


async def schedule_account_deletion(user_id: str, reason: Optional[str] = None) -> str:
    """
    Schedule account deletion with 30-day grace period

    Args:
        user_id: User ID
        reason: Optional reason for deletion

    Returns:
        Scheduled deletion date (ISO format)
    """
    if not supabase:
        raise Exception("Supabase not initialized")

    try:
        from datetime import timedelta

        # Calculate deletion date (30 days from now)
        deletion_date = datetime.utcnow() + timedelta(days=30)
        deletion_date_str = deletion_date.isoformat()

        # Update user record
        update_data = {
            "deletion_scheduled": True,
            "deletion_scheduled_date": deletion_date_str,
            "deletion_reason": reason,
            "updated_at": datetime.utcnow().isoformat()
        }

        result = supabase.table("users") \
            .update(update_data) \
            .eq("id", user_id) \
            .execute()

        if not result.data:
            raise Exception("Failed to schedule deletion")

        logger.info(f"🗑️  Scheduled account deletion for user {user_id} on {deletion_date_str}")
        return deletion_date_str

    except Exception as e:
        logger.error(f"Failed to schedule account deletion: {e}", exc_info=True)
        raise


async def cancel_scheduled_deletion(user_id: str) -> bool:
    """
    Cancel scheduled account deletion

    Args:
        user_id: User ID

    Returns:
        True if successful
    """
    if not supabase:
        raise Exception("Supabase not initialized")

    try:
        # Update user record
        update_data = {
            "deletion_scheduled": False,
            "deletion_scheduled_date": None,
            "deletion_reason": None,
            "updated_at": datetime.utcnow().isoformat()
        }

        result = supabase.table("users") \
            .update(update_data) \
            .eq("id", user_id) \
            .execute()

        if not result.data:
            return False

        logger.info(f"✅ Canceled scheduled deletion for user {user_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to cancel deletion: {e}", exc_info=True)
        return False


async def cancel_user_subscription(user_id: str) -> bool:
    """
    Cancel user's subscription (called before account deletion)

    Args:
        user_id: User ID

    Returns:
        True if successful or no subscription exists
    """
    if not supabase:
        return False

    try:
        # Update user subscription to canceled
        update_data = {
            "subscription_tier": "free",
            "subscription_status": "canceled",
            "subscription_stripe_subscription_id": None,
            "updated_at": datetime.utcnow().isoformat()
        }

        result = supabase.table("users") \
            .update(update_data) \
            .eq("id", user_id) \
            .execute()

        if not result.data:
            return False

        logger.info(f"✅ Canceled subscription for user {user_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to cancel subscription: {e}", exc_info=True)
        return False


def get_users_scheduled_for_deletion() -> list[Dict[str, Any]]:
    """
    Get users whose deletion date has passed (for background job)

    Returns:
        List of users to be deleted
    """
    if not supabase:
        return []

    try:
        # Get users with deletion_scheduled_date <= now
        current_time = datetime.utcnow().isoformat()

        result = supabase.table("users") \
            .select("*") \
            .eq("deletion_scheduled", True) \
            .lte("deletion_scheduled_date", current_time) \
            .execute()

        return result.data if result.data else []

    except Exception as e:
        logger.error(f"Failed to get users scheduled for deletion: {e}", exc_info=True)
        return []


async def permanently_delete_user(user_id: str) -> bool:
    """
    Permanently delete user and all associated data (GDPR compliance)

    This function:
    1. Deletes all property analyses
    2. Deletes all support chat messages
    3. Deletes user record
    4. Cannot be undone!

    Args:
        user_id: User ID

    Returns:
        True if successful
    """
    if not supabase:
        raise Exception("Supabase not initialized")

    try:
        # 1. Delete property analyses
        supabase.table("property_analyses") \
            .delete() \
            .eq("user_id", user_id) \
            .execute()

        # 2. Delete support chats
        supabase.table("support_chats") \
            .delete() \
            .eq("user_id", user_id) \
            .execute()

        # 3. Delete onboarding status
        supabase.table("onboarding_status") \
            .delete() \
            .eq("user_id", user_id) \
            .execute()

        # 4. Delete user record
        result = supabase.table("users") \
            .delete() \
            .eq("id", user_id) \
            .execute()

        if not result.data:
            raise Exception("Failed to delete user record")

        logger.info(f"🗑️  Permanently deleted user {user_id} and all associated data")
        return True

    except Exception as e:
        logger.error(f"Failed to permanently delete user: {e}", exc_info=True)
        raise
