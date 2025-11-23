"""
PropIQ Password Reset Router
Endpoints for sending password reset emails via SendGrid

Endpoints:
- POST /password-reset/send-email - Send password reset email (internal use)
- GET /password-reset/health - Health check
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
import logging

from utils.password_reset_email import get_password_reset_email, FROM_EMAIL

router = APIRouter(prefix="/password-reset", tags=["password-reset"])
logger = logging.getLogger(__name__)

# SendGrid configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")


class SendResetEmailRequest(BaseModel):
    """Request body for sending password reset email"""
    email: EmailStr
    reset_token: str
    user_name: Optional[str] = "there"


class SendResetEmailResponse(BaseModel):
    """Response body for send email endpoint"""
    success: bool
    message: str
    email: Optional[str] = None
    error: Optional[str] = None


async def send_email_via_sendgrid(
    to_email: str,
    subject: str,
    html_content: str
) -> bool:
    """
    Send email via SendGrid

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email body

    Returns:
        True if sent successfully, False otherwise
    """
    if not SENDGRID_API_KEY:
        logger.error("SENDGRID_API_KEY not configured")
        return False

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)

        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )

        response = sg.send(message)

        if response.status_code in [200, 202]:
            logger.info(f"[PASSWORD_RESET] Email sent to {to_email}")
            return True
        else:
            logger.error(f"[PASSWORD_RESET] SendGrid returned status {response.status_code}")
            return False

    except Exception as e:
        logger.error(f"[PASSWORD_RESET] Failed to send email: {str(e)}")
        return False


@router.post("/send-email", response_model=SendResetEmailResponse)
async def send_reset_email(request: SendResetEmailRequest):
    """
    Send a password reset email

    This endpoint is called by the Convex backend when a user requests
    a password reset. It generates the email using the template and
    sends it via SendGrid.

    Args:
        request: SendResetEmailRequest with email, token, and user name

    Returns:
        SendResetEmailResponse with success status
    """
    if not SENDGRID_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Email service not configured. Set SENDGRID_API_KEY environment variable."
        )

    try:
        # Generate email content
        email_data = get_password_reset_email(
            user_name=request.user_name or "there",
            user_email=request.email,
            reset_token=request.reset_token,
            expiration_minutes=60  # 1 hour expiration
        )

        # Send via SendGrid
        success = await send_email_via_sendgrid(
            to_email=request.email,
            subject=email_data["subject"],
            html_content=email_data["html_content"]
        )

        if success:
            logger.info(f"[PASSWORD_RESET] Reset email sent to {request.email}")
            return SendResetEmailResponse(
                success=True,
                message="Password reset email sent successfully",
                email=request.email
            )
        else:
            logger.error(f"[PASSWORD_RESET] Failed to send email to {request.email}")
            raise HTTPException(
                status_code=500,
                detail="Failed to send password reset email"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[PASSWORD_RESET] Error sending reset email: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send password reset email: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint for password reset email system

    Returns:
        System health status
    """
    has_sendgrid = bool(SENDGRID_API_KEY)

    return {
        "status": "healthy" if has_sendgrid else "degraded",
        "sendgrid_configured": has_sendgrid,
        "service": "password-reset-email"
    }
