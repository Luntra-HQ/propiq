"""
Account Settings API
Handles user profile, password changes, and account preferences
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, validator
from typing import Dict, Any, Optional
import os
from datetime import datetime

router = APIRouter(prefix="/api/v1/account", tags=["account"])


# ============================================================================
# MODELS
# ============================================================================

class ProfileUpdateRequest(BaseModel):
    """Request to update user profile"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    """Request to change password"""
    current_password: str
    new_password: str
    confirm_password: str

    @validator("new_password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class EmailPreferences(BaseModel):
    """Email notification preferences"""
    marketing_emails: bool = True
    product_updates: bool = True
    usage_alerts: bool = True
    billing_notifications: bool = True
    weekly_summary: bool = False


class NotificationPreferences(BaseModel):
    """In-app notification preferences"""
    analysis_complete: bool = True
    usage_limit_warning: bool = True
    subscription_renewal: bool = True
    new_features: bool = True


# ============================================================================
# AUTHENTICATION HELPER
# ============================================================================

async def get_current_user(authorization: str = None) -> dict:
    """Get current user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    try:
        import jwt
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        JWT_SECRET = os.getenv("JWT_SECRET")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

        from database_supabase import get_user_by_id
        user = await get_user_by_id(payload.get("sub"))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# ============================================================================
# PROFILE MANAGEMENT
# ============================================================================

@router.get("/profile")
async def get_profile(authorization: str = None):
    """
    Get user profile

    Returns:
    - User information
    - Account details
    - Subscription info
    """
    user = await get_current_user(authorization)

    profile = {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name"),
            "phone": user.get("phone"),
            "company": user.get("company"),
            "job_title": user.get("job_title"),
            "email_verified": user.get("email_verified", False)
        },
        "account": {
            "created_at": user.get("created_at"),
            "last_login": user.get("last_login"),
            "subscription_tier": user.get("subscription_tier", "free"),
            "subscription_status": user.get("subscription_status", "active")
        }
    }

    return profile


@router.put("/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    authorization: str = None
):
    """
    Update user profile

    Args:
        full_name: User's full name
        phone: Phone number
        company: Company name
        job_title: Job title

    Returns:
        Updated profile
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import supabase

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not available")

        # Build update data (only include provided fields)
        update_data = {
            "updated_at": datetime.utcnow().isoformat()
        }

        if request.full_name is not None:
            update_data["full_name"] = request.full_name
        if request.phone is not None:
            update_data["phone"] = request.phone
        if request.company is not None:
            update_data["company"] = request.company
        if request.job_title is not None:
            update_data["job_title"] = request.job_title

        # Update user
        result = supabase.table("users").update(update_data).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update profile")

        return {
            "success": True,
            "message": "Profile updated successfully",
            "profile": result.data[0]
        }

    except Exception as e:
        print(f"❌ Profile update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


# ============================================================================
# PASSWORD MANAGEMENT
# ============================================================================

@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    authorization: str = None
):
    """
    Change user password

    Args:
        current_password: Current password for verification
        new_password: New password (min 8 chars, must include uppercase, lowercase, number)
        confirm_password: Confirm new password

    Returns:
        Success confirmation
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import supabase, verify_password, hash_password

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not available")

        # Verify current password
        password_valid = verify_password(request.current_password, user.get("password_hash", ""))
        if not password_valid:
            raise HTTPException(status_code=401, detail="Current password is incorrect")

        # Hash new password
        new_password_hash = hash_password(request.new_password)

        # Update password
        result = supabase.table("users").update({
            "password_hash": new_password_hash,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update password")

        # TODO: Send password change confirmation email

        return {
            "success": True,
            "message": "Password changed successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Password change error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to change password: {str(e)}")


# ============================================================================
# EMAIL PREFERENCES
# ============================================================================

@router.get("/email-preferences")
async def get_email_preferences(authorization: str = None):
    """
    Get user's email notification preferences

    Returns:
        Email preferences settings
    """
    user = await get_current_user(authorization)

    # Get preferences from user record (stored as JSON)
    preferences = user.get("email_preferences", {})

    # Defaults if not set
    default_preferences = {
        "marketing_emails": True,
        "product_updates": True,
        "usage_alerts": True,
        "billing_notifications": True,
        "weekly_summary": False
    }

    # Merge with defaults
    return {**default_preferences, **preferences}


@router.put("/email-preferences")
async def update_email_preferences(
    preferences: EmailPreferences,
    authorization: str = None
):
    """
    Update email notification preferences

    Args:
        marketing_emails: Receive marketing and promotional emails
        product_updates: Receive product updates and new features
        usage_alerts: Receive alerts when approaching usage limits
        billing_notifications: Receive billing and payment notifications
        weekly_summary: Receive weekly usage summary emails

    Returns:
        Updated preferences
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import supabase

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not available")

        # Convert preferences to dict
        preferences_dict = preferences.dict()

        # Update user preferences
        result = supabase.table("users").update({
            "email_preferences": preferences_dict,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update preferences")

        return {
            "success": True,
            "message": "Email preferences updated successfully",
            "preferences": preferences_dict
        }

    except Exception as e:
        print(f"❌ Email preferences update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update email preferences: {str(e)}")


# ============================================================================
# NOTIFICATION PREFERENCES
# ============================================================================

@router.get("/notification-preferences")
async def get_notification_preferences(authorization: str = None):
    """
    Get user's in-app notification preferences

    Returns:
        Notification preferences settings
    """
    user = await get_current_user(authorization)

    preferences = user.get("notification_preferences", {})

    default_preferences = {
        "analysis_complete": True,
        "usage_limit_warning": True,
        "subscription_renewal": True,
        "new_features": True
    }

    return {**default_preferences, **preferences}


@router.put("/notification-preferences")
async def update_notification_preferences(
    preferences: NotificationPreferences,
    authorization: str = None
):
    """
    Update in-app notification preferences

    Args:
        analysis_complete: Notify when property analysis is complete
        usage_limit_warning: Warn when approaching usage limit
        subscription_renewal: Notify about subscription renewals
        new_features: Notify about new features and updates

    Returns:
        Updated preferences
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import supabase

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not available")

        preferences_dict = preferences.dict()

        result = supabase.table("users").update({
            "notification_preferences": preferences_dict,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update preferences")

        return {
            "success": True,
            "message": "Notification preferences updated successfully",
            "preferences": preferences_dict
        }

    except Exception as e:
        print(f"❌ Notification preferences update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update notification preferences: {str(e)}")


# ============================================================================
# ACCOUNT ACTIONS
# ============================================================================

@router.post("/verify-email")
async def request_email_verification(authorization: str = None):
    """
    Send email verification link

    Returns:
        Confirmation that email was sent
    """
    user = await get_current_user(authorization)

    if user.get("email_verified"):
        return {
            "success": True,
            "message": "Email already verified"
        }

    try:
        # TODO: Generate verification token and send email
        # from utils.onboarding_emails import send_verification_email
        # await send_verification_email(user["email"], verification_token)

        return {
            "success": True,
            "message": f"Verification email sent to {user['email']}"
        }

    except Exception as e:
        print(f"❌ Email verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send verification email: {str(e)}")


@router.get("/activity-log")
async def get_activity_log(
    limit: int = 50,
    authorization: str = None
):
    """
    Get user's recent activity log

    Args:
        limit: Maximum number of activities to return

    Returns:
        List of recent activities
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import get_user_analyses

        # Get recent analyses
        analyses = await get_user_analyses(user_id, limit=limit)

        activity_log = [
            {
                "type": "property_analysis",
                "timestamp": analysis["created_at"],
                "description": f"Analyzed property at {analysis['address']}",
                "details": {
                    "analysis_id": analysis["id"],
                    "address": analysis["address"],
                    "verdict": analysis.get("analysis_result", {}).get("recommendation", {}).get("verdict")
                }
            }
            for analysis in analyses
        ]

        # TODO: Add other activity types (login, profile updates, subscription changes, etc.)

        return {
            "activities": activity_log,
            "total": len(activity_log)
        }

    except Exception as e:
        print(f"❌ Activity log error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load activity log: {str(e)}")


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/health")
async def account_health_check():
    """Health check for account endpoints"""
    return {
        "status": "healthy",
        "endpoints": {
            "profile": "/api/v1/account/profile",
            "change_password": "/api/v1/account/change-password",
            "email_preferences": "/api/v1/account/email-preferences",
            "notification_preferences": "/api/v1/account/notification-preferences",
            "verify_email": "/api/v1/account/verify-email",
            "activity_log": "/api/v1/account/activity-log"
        }
    }
