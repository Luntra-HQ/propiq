"""
PropIQ Onboarding Campaign Manager
Handles scheduling and sending of onboarding email sequence via SendGrid

Features:
- Send individual onboarding emails
- Schedule full 4-day sequence
- Track onboarding status in database
- Handle email delivery errors gracefully
"""

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import os
import logging

from utils.onboarding_emails import get_onboarding_sequence, FROM_EMAIL

# Configure logging
logger = logging.getLogger(__name__)

# SendGrid configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")


async def send_onboarding_email(
    to_email: str,
    email_data: Dict[str, Any],
    user_name: str = "there",
    max_retries: int = 3
) -> bool:
    """
    Send a single onboarding email via SendGrid with retry logic

    Args:
        to_email: Recipient email address
        email_data: Email dictionary with subject, html_content
        user_name: User's first name for personalization
        max_retries: Maximum number of retry attempts (default: 3)

    Returns:
        True if email sent successfully, False otherwise
    """
    if not SENDGRID_API_KEY:
        logger.error("SENDGRID_API_KEY not configured")
        return False

    import asyncio
    from sendgrid.helpers.mail import Mail

    for attempt in range(max_retries):
        try:
            sg = SendGridAPIClient(SENDGRID_API_KEY)

            message = Mail(
                from_email=FROM_EMAIL,
                to_emails=to_email,
                subject=email_data["subject"],
                html_content=email_data["html_content"]
            )

            response = sg.send(message)

            if response.status_code in [200, 202]:
                if attempt > 0:
                    logger.info(f"✅ Sent onboarding email to {to_email} after {attempt + 1} attempts: {email_data['subject']}")
                else:
                    logger.info(f"✅ Sent onboarding email to {to_email}: {email_data['subject']}")
                return True
            else:
                logger.warning(f"⚠️  SendGrid returned status {response.status_code} for {to_email} (attempt {attempt + 1}/{max_retries})")

                # Don't retry on client errors (4xx), only server errors (5xx) or network issues
                if 400 <= response.status_code < 500:
                    logger.error(f"❌ Client error {response.status_code} - not retrying")
                    return False

        except Exception as e:
            logger.warning(f"⚠️  Failed to send onboarding email to {to_email} (attempt {attempt + 1}/{max_retries}): {str(e)}")

        # If not the last attempt, wait before retrying (exponential backoff)
        if attempt < max_retries - 1:
            wait_time = 2 ** attempt  # 1s, 2s, 4s
            logger.info(f"⏳ Waiting {wait_time}s before retry...")
            await asyncio.sleep(wait_time)

    logger.error(f"❌ Failed to send onboarding email to {to_email} after {max_retries} attempts")
    return False


async def start_onboarding_campaign(
    user_email: str,
    user_id: str,
    user_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Start the complete 4-day onboarding campaign for a new user

    This function:
    1. Sends Day 1 email immediately
    2. Schedules Day 2-4 emails (in a real implementation, you'd use a task queue)
    3. Records onboarding status in database

    Args:
        user_email: User's email address
        user_id: User's database ID
        user_name: User's first name (optional)

    Returns:
        Dictionary with campaign status and results
    """
    name_for_email = user_name or "there"

    # Get complete email sequence
    email_sequence = get_onboarding_sequence(name_for_email, user_email)

    results = {
        "user_id": user_id,
        "user_email": user_email,
        "campaign_started_at": datetime.utcnow().isoformat(),
        "emails_sent": [],
        "emails_scheduled": [],
        "errors": []
    }

    # Send Day 1 immediately
    day_1_email = email_sequence[0]
    day_1_success = await send_onboarding_email(user_email, day_1_email, name_for_email)

    if day_1_success:
        results["emails_sent"].append({
            "day": 1,
            "subject": day_1_email["subject"],
            "sent_at": datetime.utcnow().isoformat(),
            "status": "sent"
        })
    else:
        results["errors"].append({
            "day": 1,
            "error": "Failed to send Day 1 email"
        })

    # Schedule remaining emails (Days 2-4)
    # NOTE: In production, you'd use a task queue like Celery, RQ, or cloud scheduler
    # For now, we'll record the intended schedule
    for i, email_data in enumerate(email_sequence[1:], start=2):
        scheduled_time = datetime.utcnow() + timedelta(hours=email_data["delay_hours"])

        results["emails_scheduled"].append({
            "day": i,
            "subject": email_data["subject"],
            "scheduled_for": scheduled_time.isoformat(),
            "delay_hours": email_data["delay_hours"],
            "status": "scheduled"
        })

        logger.info(
            f"📅 Scheduled Day {i} email for {user_email} at {scheduled_time.isoformat()}"
        )

    # Store onboarding status in database
    try:
        from database_supabase import record_onboarding_status
        record_onboarding_status(user_id, results)
        logger.info(f"✅ Recorded onboarding status for user {user_id}")
    except Exception as e:
        logger.warning(f"⚠️  Failed to record onboarding status: {e}")
        results["errors"].append({
            "type": "database",
            "error": f"Failed to record status: {str(e)}"
        })

    return results


async def send_scheduled_onboarding_email(
    user_id: str,
    day_number: int
) -> bool:
    """
    Send a scheduled onboarding email for a specific day

    This would typically be called by a background task scheduler (cron, Celery, etc.)

    Args:
        user_id: User's database ID
        day_number: Which day of the sequence (1-4)

    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Get user data from database
        from database_supabase import get_user_by_id
        user = get_user_by_id(user_id)

        if not user:
            logger.error(f"❌ User {user_id} not found for onboarding email")
            return False

        user_email = user.get("email")
        user_name = user.get("full_name", "").split()[0] if user.get("full_name") else "there"

        # Get email sequence
        email_sequence = get_onboarding_sequence(user_name, user_email)

        if day_number < 1 or day_number > len(email_sequence):
            logger.error(f"❌ Invalid day number: {day_number}")
            return False

        # Send email (day_number is 1-indexed, array is 0-indexed)
        email_data = email_sequence[day_number - 1]
        success = await send_onboarding_email(user_email, email_data, user_name)

        if success:
            # Update onboarding status in database
            try:
                from database_supabase import update_onboarding_status
                update_onboarding_status(user_id, day_number, "sent")
            except Exception as e:
                logger.warning(f"⚠️  Failed to update onboarding status: {e}")

        return success

    except Exception as e:
        logger.error(f"❌ Error sending scheduled email for user {user_id}, day {day_number}: {e}")
        return False


def get_onboarding_status(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get onboarding campaign status for a user

    Args:
        user_id: User's database ID

    Returns:
        Dictionary with onboarding status or None if not found
    """
    try:
        from database_supabase import get_onboarding_status as db_get_status
        return db_get_status(user_id)
    except Exception as e:
        logger.error(f"❌ Failed to get onboarding status for {user_id}: {e}")
        return None


# Background task example (would run on a schedule)
async def process_scheduled_onboarding_emails():
    """
    Process all scheduled onboarding emails that are due to be sent

    This function should be called periodically (e.g., every hour) by a cron job
    or task scheduler to check for and send scheduled onboarding emails.

    In production, you'd use:
    - Celery Beat (Python task queue)
    - APScheduler (Python scheduler)
    - Cloud scheduler (AWS EventBridge, GCP Cloud Scheduler, Azure Functions)
    - Cron job calling this endpoint
    """
    try:
        from database_supabase import get_pending_onboarding_emails
        pending_emails = get_pending_onboarding_emails()

        logger.info(f"📧 Processing {len(pending_emails)} scheduled onboarding emails")

        for email_task in pending_emails:
            user_id = email_task["user_id"]
            day_number = email_task["day_number"]

            try:
                success = await send_scheduled_onboarding_email(user_id, day_number)

                if success:
                    logger.info(f"✅ Sent Day {day_number} email to user {user_id}")
                else:
                    logger.error(f"❌ Failed to send Day {day_number} email to user {user_id}")

            except Exception as e:
                logger.error(f"❌ Error processing email for user {user_id}: {e}")

        logger.info("✅ Finished processing scheduled onboarding emails")

    except Exception as e:
        logger.error(f"❌ Error in process_scheduled_onboarding_emails: {e}")


# Simple scheduler endpoint (for testing)
async def send_test_onboarding_email(email: str, day: int = 1) -> Dict[str, Any]:
    """
    Send a test onboarding email (for testing purposes)

    Args:
        email: Test recipient email
        day: Which day to send (1-4)

    Returns:
        Result dictionary
    """
    email_sequence = get_onboarding_sequence("Test User", email)

    if day < 1 or day > len(email_sequence):
        return {
            "success": False,
            "error": f"Invalid day number: {day}. Must be 1-4."
        }

    email_data = email_sequence[day - 1]
    success = await send_onboarding_email(email, email_data, "Test User")

    return {
        "success": success,
        "day": day,
        "subject": email_data["subject"],
        "to": email
    }
