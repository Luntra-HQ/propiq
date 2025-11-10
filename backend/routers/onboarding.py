"""
PropIQ Onboarding Campaign Router
Endpoints for testing and managing onboarding email campaigns

Endpoints:
- POST /onboarding/test-email - Send test onboarding email
- GET /onboarding/status/{user_id} - Get onboarding status
- POST /onboarding/process-scheduled - Manually trigger scheduled email processing
- GET /onboarding/health - Health check
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import os
import logging

from utils.onboarding_campaign import (
    send_test_onboarding_email,
    get_onboarding_status,
    process_scheduled_onboarding_emails,
    start_onboarding_campaign
)

router = APIRouter(prefix="/onboarding", tags=["onboarding"])
logger = logging.getLogger(__name__)

# Check if SendGrid is configured
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")


class TestEmailRequest(BaseModel):
    email: EmailStr
    day: int = 1  # Which day to send (1-4)


class StartCampaignRequest(BaseModel):
    user_id: str
    user_email: EmailStr
    user_name: Optional[str] = None


@router.post("/test-email")
async def send_test_email(request: TestEmailRequest):
    """
    Send a test onboarding email

    Useful for testing email templates and SendGrid configuration.
    Does not record in database or affect user onboarding status.

    Args:
        request: Test email request with email and day number

    Returns:
        Result of test email send
    """
    if not SENDGRID_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="SendGrid not configured. Set SENDGRID_API_KEY environment variable."
        )

    if request.day < 1 or request.day > 4:
        raise HTTPException(
            status_code=400,
            detail="Day must be between 1 and 4"
        )

    try:
        result = await send_test_onboarding_email(request.email, request.day)

        if result.get("success"):
            return {
                "status": "success",
                "message": f"Test email (Day {request.day}) sent successfully",
                "email": request.email,
                "subject": result.get("subject"),
                "day": request.day
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send test email: {result.get('error', 'Unknown error')}"
            )

    except Exception as e:
        logger.error(f"Error sending test email: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send test email: {str(e)}"
        )


@router.get("/status/{user_id}")
async def get_status(user_id: str):
    """
    Get onboarding campaign status for a user

    Args:
        user_id: User's database ID

    Returns:
        Onboarding campaign status and email history
    """
    try:
        status = get_onboarding_status(user_id)

        if not status:
            raise HTTPException(
                status_code=404,
                detail="No onboarding campaign found for this user"
            )

        return {
            "status": "success",
            "data": status
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting onboarding status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get onboarding status: {str(e)}"
        )


@router.post("/start-campaign")
async def start_campaign(request: StartCampaignRequest):
    """
    Manually start onboarding campaign for a user

    Useful for re-triggering campaign or testing.

    Args:
        request: Campaign start request

    Returns:
        Campaign start result
    """
    if not SENDGRID_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="SendGrid not configured. Set SENDGRID_API_KEY environment variable."
        )

    try:
        result = await start_onboarding_campaign(
            user_email=request.user_email,
            user_id=request.user_id,
            user_name=request.user_name
        )

        return {
            "status": "success",
            "message": "Onboarding campaign started successfully",
            "data": result
        }

    except Exception as e:
        logger.error(f"Error starting campaign: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start campaign: {str(e)}"
        )


@router.post("/process-scheduled")
async def process_scheduled():
    """
    Manually trigger processing of scheduled onboarding emails

    This endpoint would normally be called by a cron job or scheduler.
    In production, you'd set up:
    - Cron job calling this endpoint every hour
    - AWS EventBridge / GCP Cloud Scheduler / Azure Functions
    - Celery Beat task

    Returns:
        Processing result
    """
    if not SENDGRID_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="SendGrid not configured"
        )

    try:
        await process_scheduled_onboarding_emails()

        return {
            "status": "success",
            "message": "Scheduled emails processed successfully"
        }

    except Exception as e:
        logger.error(f"Error processing scheduled emails: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process scheduled emails: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint for onboarding campaign system

    Returns:
        System health status
    """
    has_sendgrid = bool(SENDGRID_API_KEY)

    return {
        "status": "healthy" if has_sendgrid else "degraded",
        "sendgrid_configured": has_sendgrid,
        "features": {
            "test_emails": has_sendgrid,
            "campaign_start": has_sendgrid,
            "scheduled_processing": has_sendgrid
        }
    }
