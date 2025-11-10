"""
GDPR Compliance API
Handles data export and account deletion requests per GDPR requirements
"""

from fastapi import APIRouter, HTTPException, Header, Depends, Response
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
import jwt
import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api/v1/gdpr", tags=["gdpr"])

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"


# ============================================================================
# MODELS
# ============================================================================

class DataExportRequest(BaseModel):
    """Request for user data export"""
    format: str = "json"  # json or csv
    include_analyses: bool = True
    include_support_chats: bool = True
    include_payment_history: bool = True


class DataExportResponse(BaseModel):
    """Response with data export"""
    success: bool
    export_date: str
    user_id: str
    data: Dict[str, Any]
    message: str


class AccountDeletionRequest(BaseModel):
    """Request for account deletion"""
    password: str  # Require password confirmation
    confirm: bool = False  # Must explicitly confirm
    reason: Optional[str] = None


class AccountDeletionResponse(BaseModel):
    """Response for account deletion"""
    success: bool
    message: str
    deletion_scheduled_date: Optional[str] = None


# ============================================================================
# AUTHENTICATION
# ============================================================================

def verify_token(authorization: str = Header(None)) -> dict:
    """Verify JWT token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")


# ============================================================================
# GDPR DATA EXPORT
# ============================================================================

@router.post("/export-data", response_model=DataExportResponse)
async def export_user_data(
    request: DataExportRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Export all user data per GDPR Article 15 (Right of Access)

    This endpoint:
    1. Collects all user data from database
    2. Includes property analyses, support chats, payment history
    3. Returns data in JSON or CSV format
    4. Suitable for GDPR data portability requests

    Requires:
    - Authorization: Bearer <jwt_token>

    Returns:
        Complete user data package including:
        - User profile
        - Subscription details
        - Property analyses
        - Support conversations
        - Payment history
        - Account activity logs
    """
    user_id = token_payload.get("sub")
    user_email = token_payload.get("email")

    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token: missing user ID")

    try:
        # Import database functions
        from database_supabase import (
            get_user_by_id,
            get_user_property_analyses,
            get_user_support_chats
        )

        # 1. Get user profile data
        user_data = await get_user_by_id(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        # Prepare export data structure
        export_data = {
            "export_metadata": {
                "export_date": datetime.utcnow().isoformat(),
                "user_id": user_id,
                "email": user_email,
                "format": request.format,
                "gdpr_compliance": "Article 15 - Right of Access"
            },
            "user_profile": {
                "id": user_data.get("id"),
                "email": user_data.get("email"),
                "full_name": user_data.get("full_name"),
                "created_at": user_data.get("created_at"),
                "last_login": user_data.get("last_login"),
                "email_verified": user_data.get("email_verified", False)
            },
            "subscription": {
                "tier": user_data.get("subscription_tier"),
                "status": user_data.get("subscription_status"),
                "stripe_customer_id": user_data.get("subscription_stripe_customer_id"),
                "stripe_subscription_id": user_data.get("subscription_stripe_subscription_id"),
                "current_period_start": user_data.get("subscription_current_period_start"),
                "current_period_end": user_data.get("subscription_current_period_end")
            },
            "usage_statistics": {
                "propiq_usage_count": user_data.get("propiq_usage_count"),
                "propiq_usage_limit": user_data.get("propiq_usage_limit"),
                "propiq_last_reset_date": user_data.get("propiq_last_reset_date")
            }
        }

        # 2. Include property analyses if requested
        if request.include_analyses:
            try:
                analyses = await get_user_property_analyses(user_id)
                export_data["property_analyses"] = {
                    "count": len(analyses),
                    "analyses": analyses
                }
            except Exception as e:
                export_data["property_analyses"] = {
                    "error": f"Could not retrieve analyses: {str(e)}"
                }

        # 3. Include support chats if requested
        if request.include_support_chats:
            try:
                chats = await get_user_support_chats(user_id)
                # Sanitize chat data (remove internal notes, etc.)
                sanitized_chats = []
                for chat in chats:
                    sanitized_chats.append({
                        "conversation_id": chat.get("conversation_id"),
                        "role": chat.get("role"),
                        "content": chat.get("content"),
                        "created_at": chat.get("created_at")
                    })

                export_data["support_conversations"] = {
                    "count": len(sanitized_chats),
                    "conversations": sanitized_chats
                }
            except Exception as e:
                export_data["support_conversations"] = {
                    "error": f"Could not retrieve chats: {str(e)}"
                }

        # 4. Include payment history if requested
        if request.include_payment_history:
            try:
                # Get payment history from Stripe
                import stripe
                stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

                if user_data.get("subscription_stripe_customer_id"):
                    customer_id = user_data["subscription_stripe_customer_id"]

                    # Get invoices
                    invoices = stripe.Invoice.list(customer=customer_id, limit=100)

                    payment_history = []
                    for invoice in invoices.data:
                        payment_history.append({
                            "invoice_id": invoice.id,
                            "amount_paid": invoice.amount_paid / 100,  # Convert cents to dollars
                            "currency": invoice.currency,
                            "status": invoice.status,
                            "paid": invoice.paid,
                            "created": datetime.fromtimestamp(invoice.created).isoformat(),
                            "period_start": datetime.fromtimestamp(invoice.period_start).isoformat() if invoice.period_start else None,
                            "period_end": datetime.fromtimestamp(invoice.period_end).isoformat() if invoice.period_end else None
                        })

                    export_data["payment_history"] = {
                        "count": len(payment_history),
                        "invoices": payment_history
                    }
                else:
                    export_data["payment_history"] = {
                        "count": 0,
                        "message": "No payment history (free tier user)"
                    }

            except Exception as e:
                export_data["payment_history"] = {
                    "error": f"Could not retrieve payment history: {str(e)}"
                }

        # Return data
        return DataExportResponse(
            success=True,
            export_date=datetime.utcnow().isoformat(),
            user_id=user_id,
            data=export_data,
            message="Data export completed successfully. This data package complies with GDPR Article 15 (Right of Access)."
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Data export error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export user data: {str(e)}"
        )


@router.get("/export-data/download")
async def download_user_data(
    format: str = "json",
    token_payload: dict = Depends(verify_token)
):
    """
    Download user data as file

    This endpoint returns data as downloadable file
    Supports JSON and CSV formats

    Requires:
    - Authorization: Bearer <jwt_token>

    Returns:
        File download with user data
    """
    # Create data export request
    request = DataExportRequest(
        format=format,
        include_analyses=True,
        include_support_chats=True,
        include_payment_history=True
    )

    # Get export data
    export_response = await export_user_data(request, token_payload)

    user_id = token_payload.get("sub")
    filename = f"propiq_data_export_{user_id}_{datetime.utcnow().strftime('%Y%m%d')}"

    if format == "json":
        content = json.dumps(export_response.data, indent=2)
        media_type = "application/json"
        filename += ".json"
    else:
        # TODO: Implement CSV export
        raise HTTPException(status_code=400, detail="CSV format not yet implemented")

    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


# ============================================================================
# GDPR ACCOUNT DELETION
# ============================================================================

@router.post("/delete-account", response_model=AccountDeletionResponse)
async def request_account_deletion(
    request: AccountDeletionRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Request account deletion per GDPR Article 17 (Right to Erasure)

    This endpoint:
    1. Verifies user password
    2. Requires explicit confirmation
    3. Cancels active subscriptions
    4. Schedules account deletion (30-day grace period)
    5. Sends confirmation email

    IMPORTANT: This is irreversible after grace period!

    Requires:
    - Authorization: Bearer <jwt_token>
    - Password confirmation
    - Explicit confirmation flag

    Returns:
        Account deletion confirmation with scheduled date
    """
    user_id = token_payload.get("sub")
    user_email = token_payload.get("email")

    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token: missing user ID")

    # Validate confirmation
    if not request.confirm:
        raise HTTPException(
            status_code=400,
            detail="You must explicitly confirm account deletion by setting confirm=true"
        )

    try:
        # Import database functions
        from database_supabase import (
            get_user_by_id,
            verify_user_password,
            schedule_account_deletion,
            cancel_user_subscription
        )

        # 1. Get user data
        user_data = await get_user_by_id(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        # 2. Verify password
        password_valid = await verify_user_password(user_id, request.password)
        if not password_valid:
            raise HTTPException(status_code=401, detail="Invalid password")

        # 3. Cancel active subscription if exists
        if user_data.get("subscription_stripe_subscription_id"):
            try:
                import stripe
                stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

                subscription_id = user_data["subscription_stripe_subscription_id"]
                stripe.Subscription.delete(subscription_id)

                print(f"✅ Canceled subscription for user {user_id}")
            except Exception as e:
                print(f"⚠️  Failed to cancel subscription: {str(e)}")
                # Continue with account deletion even if subscription cancellation fails

        # 4. Schedule account deletion (30-day grace period)
        deletion_date = await schedule_account_deletion(
            user_id=user_id,
            reason=request.reason
        )

        # 5. Send confirmation email
        try:
            from utils.onboarding_emails import send_account_deletion_confirmation
            await send_account_deletion_confirmation(
                email=user_email,
                deletion_date=deletion_date
            )
        except Exception as e:
            print(f"⚠️  Failed to send confirmation email: {str(e)}")

        # 6. Log deletion request
        print(f"🗑️  Account deletion scheduled: {user_email} (User ID: {user_id})")
        if request.reason:
            print(f"   Reason: {request.reason}")

        return AccountDeletionResponse(
            success=True,
            message=(
                f"Your account deletion has been scheduled for {deletion_date}. "
                f"You have 30 days to cancel this request by logging in again. "
                f"After this date, all your data will be permanently deleted in compliance with GDPR."
            ),
            deletion_scheduled_date=deletion_date
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Account deletion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process account deletion: {str(e)}"
        )


@router.post("/cancel-deletion")
async def cancel_account_deletion(
    token_payload: dict = Depends(verify_token)
):
    """
    Cancel scheduled account deletion

    This endpoint:
    1. Cancels scheduled account deletion
    2. Restores account to active status
    3. Sends confirmation email

    Requires:
    - Authorization: Bearer <jwt_token>

    Returns:
        Confirmation that deletion was canceled
    """
    user_id = token_payload.get("sub")
    user_email = token_payload.get("email")

    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token: missing user ID")

    try:
        # Import database functions
        from database_supabase import cancel_scheduled_deletion

        # Cancel deletion
        await cancel_scheduled_deletion(user_id)

        # Send confirmation email
        try:
            from utils.onboarding_emails import send_deletion_canceled_email
            await send_deletion_canceled_email(user_email)
        except Exception as e:
            print(f"⚠️  Failed to send confirmation email: {str(e)}")

        print(f"✅ Account deletion canceled: {user_email}")

        return {
            "success": True,
            "message": "Account deletion has been canceled. Your account remains active."
        }

    except Exception as e:
        print(f"❌ Cancel deletion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel deletion: {str(e)}"
        )


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/health")
async def gdpr_health_check():
    """Health check for GDPR endpoints"""
    return {
        "status": "healthy",
        "gdpr_compliance": "enabled",
        "endpoints": {
            "data_export": "/api/v1/gdpr/export-data",
            "account_deletion": "/api/v1/gdpr/delete-account",
            "cancel_deletion": "/api/v1/gdpr/cancel-deletion"
        },
        "compliance": {
            "article_15": "Right of Access - Data Export",
            "article_17": "Right to Erasure - Account Deletion",
            "grace_period": "30 days"
        }
    }
