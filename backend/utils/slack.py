"""
Slack Notifications for PropIQ
Sends real-time alerts for key user events
"""

import requests
import os
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Slack webhook URL from environment
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

def send_slack_notification(
    message: str,
    color: str = "#4F46E5",  # PropIQ brand color (indigo)
    title: Optional[str] = None
) -> bool:
    """
    Send formatted notification to Slack channel

    Args:
        message: The notification text
        color: Hex color for the message sidebar (default: PropIQ indigo)
        title: Optional title for the notification

    Returns:
        bool: True if sent successfully, False otherwise
    """
    if not SLACK_WEBHOOK_URL:
        logger.warning("SLACK_WEBHOOK_URL not configured - notification not sent")
        return False

    try:
        payload = {
            "attachments": [{
                "color": color,
                "text": message,
                "footer": "PropIQ Backend",
                "ts": int(datetime.now().timestamp())
            }]
        }

        if title:
            payload["attachments"][0]["title"] = title

        response = requests.post(
            SLACK_WEBHOOK_URL,
            json=payload,
            timeout=5
        )

        if response.status_code == 200:
            logger.info(f"✅ Slack notification sent: {title or message[:50]}")
            return True
        else:
            logger.error(f"❌ Slack notification failed: {response.status_code}")
            return False

    except Exception as e:
        logger.error(f"❌ Slack notification error: {str(e)}")
        return False


# ============================================================================
# User Event Notifications
# ============================================================================

def notify_new_user(
    email: str,
    name: Optional[str] = None,
    tier: str = "free",
    source: str = "web"
) -> bool:
    """
    Notify when a new user signs up

    Args:
        email: User's email address
        name: User's full name (optional)
        tier: Subscription tier (free, starter, pro, elite)
        source: Signup source (web, api, referral)

    Returns:
        bool: True if notification sent successfully

    Example Slack message:
        🎉 New user signup!
        • Email: john@example.com
        • Name: John Doe
        • Tier: Free
        • Source: web
    """
    user_display = name if name else email

    message = f"""🎉 *New user signup!*
• Email: {email}
• Name: {user_display}
• Tier: {tier.title()}
• Source: {source}
• Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"""

    return send_slack_notification(
        message=message,
        color="#10B981",  # Green for new users
        title="New User Signup"
    )


def notify_user_upgrade(
    email: str,
    from_tier: str,
    to_tier: str,
    amount: float,
    payment_method: Optional[str] = None
) -> bool:
    """
    Notify when a user upgrades their subscription

    Args:
        email: User's email address
        from_tier: Previous tier
        to_tier: New tier
        amount: Payment amount in dollars
        payment_method: Payment method used (card, etc.)

    Returns:
        bool: True if notification sent successfully

    Example Slack message:
        💰 User upgraded!
        • User: john@example.com
        • free → Pro
        • Amount: $79.00
        • Payment: •••• 4242
    """
    payment_info = f"• Payment: {payment_method}" if payment_method else ""

    message = f"""💰 *User upgraded!*
• User: {email}
• {from_tier.title()} → {to_tier.title()}
• Amount: ${amount:.2f}
{payment_info}
• Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"""

    return send_slack_notification(
        message=message,
        color="#F59E0B",  # Amber for upgrades/revenue
        title="User Upgrade"
    )


def notify_payment_success(
    email: str,
    tier: str,
    amount: float,
    interval: str = "monthly"
) -> bool:
    """
    Notify when a payment succeeds (recurring subscription)

    Args:
        email: User's email address
        tier: Subscription tier
        amount: Payment amount in dollars
        interval: Billing interval (monthly, yearly)

    Returns:
        bool: True if notification sent successfully

    Example Slack message:
        ✅ Payment received
        • User: john@example.com
        • Plan: Pro (monthly)
        • Amount: $79.00
    """
    message = f"""✅ *Payment received*
• User: {email}
• Plan: {tier.title()} ({interval})
• Amount: ${amount:.2f}
• Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"""

    return send_slack_notification(
        message=message,
        color="#10B981",  # Green for successful payment
        title="Payment Success"
    )


def notify_payment_failed(
    email: str,
    tier: str,
    reason: Optional[str] = None,
    amount: Optional[float] = None
) -> bool:
    """
    Notify when a payment fails (URGENT - requires action)

    Args:
        email: User's email address
        tier: Subscription tier
        reason: Failure reason from Stripe
        amount: Attempted payment amount

    Returns:
        bool: True if notification sent successfully

    Example Slack message:
        ⚠️ PAYMENT FAILED
        • User: john@example.com
        • Plan: Pro
        • Amount: $79.00
        • Reason: Card declined
        • ACTION REQUIRED: Contact user ASAP!
    """
    reason_text = f"• Reason: {reason}" if reason else ""
    amount_text = f"• Amount: ${amount:.2f}" if amount else ""

    message = f"""⚠️ *PAYMENT FAILED*
• User: {email}
• Plan: {tier.title()}
{amount_text}
{reason_text}
• Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

🚨 *ACTION REQUIRED:* Contact user ASAP to prevent churn!"""

    return send_slack_notification(
        message=message,
        color="#EF4444",  # Red for failed payments (urgent)
        title="URGENT: Payment Failed"
    )


def notify_first_property_analysis(
    email: str,
    property_address: str,
    analysis_type: str = "standard"
) -> bool:
    """
    Notify when a user completes their first property analysis

    Args:
        email: User's email address
        property_address: Property address analyzed
        analysis_type: Type of analysis (standard, detailed, etc.)

    Returns:
        bool: True if notification sent successfully

    Example Slack message:
        🏡 First property analyzed!
        • User: john@example.com
        • Property: 123 Main St, Austin, TX
        • Type: Standard analysis
    """
    message = f"""🏡 *First property analyzed!*
• User: {email}
• Property: {property_address}
• Type: {analysis_type.title()} analysis
• Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"""

    return send_slack_notification(
        message=message,
        color="#3B82F6",  # Blue for user engagement
        title="First Property Analysis"
    )


# ============================================================================
# Daily Summary (Optional - for later)
# ============================================================================

def send_daily_summary(
    new_users: int,
    analyses_count: int,
    upgrades_count: int,
    revenue: float,
    date: Optional[str] = None
) -> bool:
    """
    Send daily summary of activity

    Args:
        new_users: Number of new signups today
        analyses_count: Number of properties analyzed
        upgrades_count: Number of upgrades
        revenue: Total revenue for the day
        date: Date for the summary (defaults to today)

    Returns:
        bool: True if notification sent successfully
    """
    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')

    message = f"""📊 *Daily Summary ({date})*

• New users: {new_users}
• Properties analyzed: {analyses_count}
• Upgrades: {upgrades_count}
• Revenue: ${revenue:.2f}

Keep up the great work! 🚀"""

    return send_slack_notification(
        message=message,
        color="#8B5CF6",  # Purple for summaries
        title="Daily Activity Summary"
    )


# ============================================================================
# Error/Alert Notifications
# ============================================================================

def notify_error(
    error_type: str,
    error_message: str,
    user_email: Optional[str] = None,
    endpoint: Optional[str] = None
) -> bool:
    """
    Notify about system errors (optional - for monitoring)

    Args:
        error_type: Type of error (database, api, payment, etc.)
        error_message: Error message/details
        user_email: Affected user (if applicable)
        endpoint: API endpoint where error occurred

    Returns:
        bool: True if notification sent successfully
    """
    user_text = f"• User: {user_email}" if user_email else ""
    endpoint_text = f"• Endpoint: {endpoint}" if endpoint else ""

    message = f"""🔴 *System Error: {error_type}*
{user_text}
{endpoint_text}
• Error: {error_message}
• Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"""

    return send_slack_notification(
        message=message,
        color="#DC2626",  # Dark red for errors
        title=f"Error: {error_type}"
    )


# ============================================================================
# Health Check
# ============================================================================

def test_slack_integration() -> dict:
    """
    Test Slack integration - sends a test message

    Returns:
        dict: Status of the test
    """
    if not SLACK_WEBHOOK_URL:
        return {
            "success": False,
            "message": "SLACK_WEBHOOK_URL not configured",
            "configured": False
        }

    test_message = """🧪 *Slack Integration Test*

This is a test notification from PropIQ backend.

If you're seeing this, Slack notifications are working correctly! ✅

Time: """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    success = send_slack_notification(
        message=test_message,
        color="#10B981",
        title="Test Notification"
    )

    return {
        "success": success,
        "message": "Test notification sent" if success else "Failed to send test",
        "configured": True,
        "webhook_url_set": bool(SLACK_WEBHOOK_URL)
    }
