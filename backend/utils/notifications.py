"""
Notification System for PropIQ Support Agent Escalations
Phase 2: Multi-Channel Notifications

This module handles notifications for:
- Support escalations (Slack + Email)
- Human agent assignments
- High-priority issues
- SLA breaches

Channels:
- Slack webhooks (instant team notifications)
- Email (SendGrid integration)
- In-app notifications (database records)
"""

import os
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from enum import Enum

# Environment variables
SLACK_SUPPORT_WEBHOOK = os.getenv("SLACK_SUPPORT_WEBHOOK")
SLACK_ESCALATION_WEBHOOK = os.getenv("SLACK_ESCALATION_WEBHOOK", SLACK_SUPPORT_WEBHOOK)
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "support@propiq.com")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@propiq.com")
APP_BASE_URL = os.getenv("APP_BASE_URL", "https://app.propiq.com")

# Check availability
SLACK_AVAILABLE = bool(SLACK_SUPPORT_WEBHOOK)
EMAIL_AVAILABLE = bool(SENDGRID_API_KEY)


class EscalationReason(Enum):
    """Reasons for escalation"""
    NEGATIVE_SENTIMENT = "negative_sentiment"
    USER_REQUEST = "user_request"
    UNRESOLVED_ISSUE = "unresolved_issue"
    BILLING_ISSUE = "billing_issue"
    TECHNICAL_ERROR = "technical_error"
    HIGH_PRIORITY = "high_priority"
    SLA_BREACH = "sla_breach"


class NotificationPriority(Enum):
    """Notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class SlackNotifier:
    """Send notifications to Slack via webhooks"""

    @staticmethod
    def send_escalation_alert(
        conversation_id: str,
        user_email: str,
        reason: EscalationReason,
        sentiment: str,
        intent: str,
        last_message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM
    ) -> bool:
        """
        Send escalation alert to Slack

        Args:
            conversation_id: Conversation ID
            user_email: User's email
            reason: Escalation reason
            sentiment: Current sentiment
            intent: Detected intent
            last_message: Last user message
            priority: Notification priority

        Returns:
            True if sent successfully
        """
        if not SLACK_AVAILABLE:
            print("⚠️  Slack notifications not configured")
            return False

        # Emoji based on priority
        priority_emoji = {
            NotificationPriority.LOW: "ℹ️",
            NotificationPriority.MEDIUM: "⚠️",
            NotificationPriority.HIGH: "🔴",
            NotificationPriority.URGENT: "🚨"
        }

        emoji = priority_emoji.get(priority, "⚠️")

        # Color based on priority
        color_map = {
            NotificationPriority.LOW: "#36a64f",  # Green
            NotificationPriority.MEDIUM: "#ff9900",  # Orange
            NotificationPriority.HIGH: "#ff0000",  # Red
            NotificationPriority.URGENT: "#8B0000"  # Dark red
        }

        color = color_map.get(priority, "#ff9900")

        # Conversation URL
        conversation_url = f"{APP_BASE_URL}/support/conversations/{conversation_id}"

        # Build Slack message
        payload = {
            "text": f"{emoji} *Support Escalation Required*",
            "attachments": [
                {
                    "color": color,
                    "fields": [
                        {
                            "title": "User",
                            "value": user_email,
                            "short": True
                        },
                        {
                            "title": "Priority",
                            "value": priority.value.upper(),
                            "short": True
                        },
                        {
                            "title": "Reason",
                            "value": reason.value.replace("_", " ").title(),
                            "short": True
                        },
                        {
                            "title": "Sentiment",
                            "value": f"{sentiment.title()} 😞" if sentiment == "negative" else sentiment.title(),
                            "short": True
                        },
                        {
                            "title": "Intent",
                            "value": intent.replace("_", " ").title(),
                            "short": True
                        },
                        {
                            "title": "Last Message",
                            "value": f"_{last_message[:200]}..._" if len(last_message) > 200 else f"_{last_message}_",
                            "short": False
                        }
                    ],
                    "actions": [
                        {
                            "type": "button",
                            "text": "View Conversation 💬",
                            "url": conversation_url,
                            "style": "primary"
                        },
                        {
                            "type": "button",
                            "text": "Assign to Me 👤",
                            "url": f"{conversation_url}?action=assign"
                        }
                    ],
                    "footer": "PropIQ Support Agent",
                    "ts": int(datetime.utcnow().timestamp())
                }
            ]
        }

        try:
            response = requests.post(
                SLACK_ESCALATION_WEBHOOK,
                json=payload,
                timeout=5
            )

            if response.status_code == 200:
                print(f"✅ Slack escalation alert sent for conversation {conversation_id}")
                return True
            else:
                print(f"⚠️  Slack notification failed: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            print(f"❌ Slack notification error: {e}")
            return False

    @staticmethod
    def send_resolution_notification(
        conversation_id: str,
        user_email: str,
        resolved_by: str,
        resolution_time_minutes: int
    ) -> bool:
        """
        Send notification when issue is resolved

        Args:
            conversation_id: Conversation ID
            user_email: User's email
            resolved_by: Who resolved it ("AI" or agent name)
            resolution_time_minutes: Time to resolve

        Returns:
            True if sent successfully
        """
        if not SLACK_AVAILABLE:
            return False

        payload = {
            "text": f"✅ *Support Issue Resolved*",
            "attachments": [
                {
                    "color": "#36a64f",
                    "fields": [
                        {
                            "title": "User",
                            "value": user_email,
                            "short": True
                        },
                        {
                            "title": "Resolved By",
                            "value": resolved_by,
                            "short": True
                        },
                        {
                            "title": "Resolution Time",
                            "value": f"{resolution_time_minutes} minutes",
                            "short": True
                        },
                        {
                            "title": "Conversation",
                            "value": f"<{APP_BASE_URL}/support/conversations/{conversation_id}|View Details>",
                            "short": False
                        }
                    ],
                    "footer": "PropIQ Support Agent",
                    "ts": int(datetime.utcnow().timestamp())
                }
            ]
        }

        try:
            response = requests.post(SLACK_SUPPORT_WEBHOOK, json=payload, timeout=5)
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Slack resolution notification error: {e}")
            return False

    @staticmethod
    def send_daily_summary(stats: Dict[str, Any]) -> bool:
        """
        Send daily support summary to Slack

        Args:
            stats: Daily statistics

        Returns:
            True if sent successfully
        """
        if not SLACK_AVAILABLE:
            return False

        payload = {
            "text": "📊 *Daily Support Summary*",
            "attachments": [
                {
                    "color": "#4A90E2",
                    "fields": [
                        {
                            "title": "Total Conversations",
                            "value": str(stats.get("total_conversations", 0)),
                            "short": True
                        },
                        {
                            "title": "Escalations",
                            "value": str(stats.get("escalations", 0)),
                            "short": True
                        },
                        {
                            "title": "Resolution Rate",
                            "value": f"{stats.get('resolution_rate', 0):.1f}%",
                            "short": True
                        },
                        {
                            "title": "Avg Response Time",
                            "value": f"{stats.get('avg_response_time_seconds', 0):.1f}s",
                            "short": True
                        },
                        {
                            "title": "Sentiment Distribution",
                            "value": f"😊 {stats.get('positive', 0)} | 😐 {stats.get('neutral', 0)} | 😞 {stats.get('negative', 0)}",
                            "short": False
                        }
                    ],
                    "footer": "PropIQ Support Analytics",
                    "ts": int(datetime.utcnow().timestamp())
                }
            ]
        }

        try:
            response = requests.post(SLACK_SUPPORT_WEBHOOK, json=payload, timeout=5)
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Slack daily summary error: {e}")
            return False


class EmailNotifier:
    """Send email notifications via SendGrid"""

    @staticmethod
    def send_escalation_email(
        conversation_id: str,
        user_email: str,
        user_name: str,
        reason: EscalationReason,
        last_message: str,
        conversation_summary: str,
        to_emails: List[str] = None
    ) -> bool:
        """
        Send escalation email to support team

        Args:
            conversation_id: Conversation ID
            user_email: User's email
            user_name: User's name
            reason: Escalation reason
            last_message: Last user message
            conversation_summary: Brief conversation summary
            to_emails: List of recipient emails (default: SUPPORT_EMAIL)

        Returns:
            True if sent successfully
        """
        if not EMAIL_AVAILABLE:
            print("⚠️  Email notifications not configured")
            return False

        if to_emails is None:
            to_emails = [SUPPORT_EMAIL]

        conversation_url = f"{APP_BASE_URL}/support/conversations/{conversation_id}"

        # Build email HTML
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
                .field {{ margin: 15px 0; }}
                .field-label {{ font-weight: bold; color: #555; }}
                .field-value {{ margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #4A90E2; }}
                .message {{ font-style: italic; color: #666; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🚨 Support Escalation Required</h2>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="field-label">User:</div>
                        <div class="field-value">{user_name} ({user_email})</div>
                    </div>

                    <div class="field">
                        <div class="field-label">Escalation Reason:</div>
                        <div class="field-value">{reason.value.replace('_', ' ').title()}</div>
                    </div>

                    <div class="field">
                        <div class="field-label">Last Message:</div>
                        <div class="field-value message">"{last_message}"</div>
                    </div>

                    <div class="field">
                        <div class="field-label">Conversation Summary:</div>
                        <div class="field-value">{conversation_summary}</div>
                    </div>

                    <a href="{conversation_url}" class="button">View Full Conversation →</a>

                    <div class="footer">
                        <p>This is an automated notification from PropIQ Support Agent.</p>
                        <p>Conversation ID: {conversation_id}</p>
                        <p>Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            sg = SendGridAPIClient(SENDGRID_API_KEY)

            message = Mail(
                from_email=Email(SENDGRID_FROM_EMAIL, "PropIQ Support"),
                to_emails=[To(email) for email in to_emails],
                subject=f"🚨 Support Escalation: {user_email} - {reason.value.replace('_', ' ').title()}",
                html_content=Content("text/html", html_content)
            )

            response = sg.send(message)

            if response.status_code in [200, 201, 202]:
                print(f"✅ Escalation email sent for conversation {conversation_id}")
                return True
            else:
                print(f"⚠️  Email send failed: {response.status_code}")
                return False

        except Exception as e:
            print(f"❌ Email notification error: {e}")
            return False

    @staticmethod
    def send_assignment_notification(
        conversation_id: str,
        user_email: str,
        assigned_to: str,
        assigned_to_email: str
    ) -> bool:
        """
        Notify agent when conversation is assigned to them

        Args:
            conversation_id: Conversation ID
            user_email: User's email
            assigned_to: Agent name
            assigned_to_email: Agent email

        Returns:
            True if sent successfully
        """
        if not EMAIL_AVAILABLE:
            return False

        conversation_url = f"{APP_BASE_URL}/support/conversations/{conversation_id}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4A90E2; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9f9f9; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>📋 New Support Conversation Assigned</h2>
                </div>
                <div class="content">
                    <p>Hi {assigned_to},</p>
                    <p>A support conversation has been assigned to you.</p>
                    <p><strong>User:</strong> {user_email}</p>
                    <p><strong>Conversation ID:</strong> {conversation_id}</p>
                    <a href="{conversation_url}" class="button">View Conversation →</a>
                    <p>Please respond as soon as possible.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            sg = SendGridAPIClient(SENDGRID_API_KEY)

            message = Mail(
                from_email=Email(SENDGRID_FROM_EMAIL, "PropIQ Support"),
                to_emails=To(assigned_to_email),
                subject=f"📋 Support Assignment: {user_email}",
                html_content=Content("text/html", html_content)
            )

            response = sg.send(message)
            return response.status_code in [200, 201, 202]

        except Exception as e:
            print(f"❌ Assignment email error: {e}")
            return False


class NotificationManager:
    """Central manager for all notification channels"""

    @staticmethod
    def send_escalation(
        conversation_id: str,
        user_email: str,
        user_name: str,
        reason: EscalationReason,
        sentiment: str,
        intent: str,
        last_message: str,
        conversation_summary: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        notify_slack: bool = True,
        notify_email: bool = True
    ) -> Dict[str, bool]:
        """
        Send escalation notifications across all channels

        Args:
            conversation_id: Conversation ID
            user_email: User's email
            user_name: User's name
            reason: Escalation reason
            sentiment: Current sentiment
            intent: Detected intent
            last_message: Last user message
            conversation_summary: Brief summary
            priority: Notification priority
            notify_slack: Send to Slack
            notify_email: Send email

        Returns:
            {
                "slack": bool,
                "email": bool,
                "success": bool (True if at least one succeeded)
            }
        """
        results = {
            "slack": False,
            "email": False
        }

        # Send Slack notification
        if notify_slack:
            results["slack"] = SlackNotifier.send_escalation_alert(
                conversation_id=conversation_id,
                user_email=user_email,
                reason=reason,
                sentiment=sentiment,
                intent=intent,
                last_message=last_message,
                priority=priority
            )

        # Send email notification
        if notify_email:
            results["email"] = EmailNotifier.send_escalation_email(
                conversation_id=conversation_id,
                user_email=user_email,
                user_name=user_name,
                reason=reason,
                last_message=last_message,
                conversation_summary=conversation_summary
            )

        results["success"] = results["slack"] or results["email"]

        return results

    @staticmethod
    def send_assignment(
        conversation_id: str,
        user_email: str,
        assigned_to: str,
        assigned_to_email: str
    ) -> bool:
        """Send assignment notification"""
        return EmailNotifier.send_assignment_notification(
            conversation_id=conversation_id,
            user_email=user_email,
            assigned_to=assigned_to,
            assigned_to_email=assigned_to_email
        )


# Health check
def health_check() -> Dict[str, Any]:
    """Check notification systems availability"""
    return {
        "slack": {
            "available": SLACK_AVAILABLE,
            "webhook_configured": bool(SLACK_SUPPORT_WEBHOOK)
        },
        "email": {
            "available": EMAIL_AVAILABLE,
            "sendgrid_configured": bool(SENDGRID_API_KEY),
            "from_email": SENDGRID_FROM_EMAIL
        },
        "app_base_url": APP_BASE_URL
    }
