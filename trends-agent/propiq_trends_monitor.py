#!/usr/bin/env python3
"""
PropIQ Trends Monitor
Monitors Google Trends for real estate investing keywords and sends alerts via Slack/Email
"""

import os
import sys
import json
import logging
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the google_trends_agent to path
sys.path.insert(0, str(Path(__file__).parent))

# Real estate investing keywords to monitor
PROPIQ_KEYWORDS = [
    # Core real estate terms
    "real estate", "rental property", "investment property",
    "property investing", "real estate investing",

    # Financial metrics
    "cap rate", "cash flow", "rental income",
    "property analysis", "ROI property",

    # Market conditions
    "housing market", "real estate market",
    "property prices", "home prices",

    # Tools and resources
    "property calculator", "real estate calculator",
    "investment calculator", "rental calculator",

    # Investor terms
    "landlord", "real estate investor",
    "property management", "rental analysis",

    # Platforms
    "zillow", "redfin", "realtor"
]

class TrendsMonitor:
    def __init__(self, slack_webhook_url=None, sendgrid_api_key=None, recipient_email=None):
        self.slack_webhook = slack_webhook_url
        self.sendgrid_key = sendgrid_api_key
        self.recipient_email = recipient_email

    def check_trends(self, region="United States", weeks=1):
        """
        Check Google Trends for real estate keywords
        Returns list of trending topics that match our keywords
        """
        logger.info(f"Checking Google Trends for past {weeks} week(s) in {region}...")

        try:
            # Import the trends agent
            from google_trends_agent.agent import root_agent

            # Query for top trending terms
            query = f"List the top 50 trending terms in {region} for the past {weeks} week(s)"
            logger.info(f"Query: {query}")

            # Run the agent (note: this queries BigQuery)
            # Use run_live for synchronous execution
            session = root_agent.run_live(query)
            result = session

            # Extract trending terms from the result
            trends = self._parse_trends_from_result(result)

            # Filter for real estate related trends
            relevant_trends = self._filter_real_estate_trends(trends)

            return relevant_trends

        except Exception as e:
            logger.error(f"Error checking trends: {e}", exc_info=True)
            return []

    def _parse_trends_from_result(self, result):
        """Parse trending terms from agent result"""
        trends = []

        # The result is a session object from run_live
        # Get the text content from the session
        text = ""

        if hasattr(result, 'content'):
            text = result.content
        elif hasattr(result, 'messages') and result.messages:
            # Get last message content
            last_msg = result.messages[-1]
            if hasattr(last_msg, 'content'):
                text = last_msg.content
            else:
                text = str(last_msg)
        else:
            text = str(result)

        # Extract terms (they're usually listed with numbers or bullets)
        lines = text.split('\n')
        for line in lines:
            # Remove numbers, bullets, and clean up
            term = line.strip()
            term = term.lstrip('0123456789.)-•*# ')
            term = term.strip()

            if term and len(term) > 2 and not term.startswith('SELECT'):
                trends.append(term.lower())

        return trends

    def _filter_real_estate_trends(self, trends):
        """Filter trends for real estate keywords"""
        relevant = []

        for trend in trends:
            # Check if any of our keywords are in the trend
            for keyword in PROPIQ_KEYWORDS:
                if keyword.lower() in trend.lower():
                    relevant.append({
                        'term': trend,
                        'keyword_match': keyword,
                        'detected_at': datetime.now().isoformat()
                    })
                    break

        return relevant

    def send_slack_notification(self, trends):
        """Send Slack notification about trending topics"""
        if not self.slack_webhook:
            logger.warning("No Slack webhook configured. Skipping Slack notification.")
            return False

        if not trends:
            logger.info("No relevant trends to notify about.")
            return False

        # Build Slack message
        message = self._build_slack_message(trends)

        try:
            response = requests.post(
                self.slack_webhook,
                json=message,
                headers={'Content-Type': 'application/json'}
            )

            if response.status_code == 200:
                logger.info(f"Slack notification sent successfully! ({len(trends)} trends)")
                return True
            else:
                logger.error(f"Slack notification failed: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"Error sending Slack notification: {e}")
            return False

    def _build_slack_message(self, trends):
        """Build formatted Slack message"""
        # Create blocks for rich formatting
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"📈 {len(trends)} Real Estate Topics Trending on Google",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Detected:* {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
                }
            },
            {
                "type": "divider"
            }
        ]

        # Add each trend
        for i, trend in enumerate(trends, 1):
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{i}. {trend['term'].title()}*\n_Match keyword: {trend['keyword_match']}_"
                }
            })

        # Add action suggestions
        blocks.append({"type": "divider"})
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*💡 Suggested Actions:*\n" +
                       "• Create blog post about trending topic\n" +
                       "• Generate social media content\n" +
                       "• Update PropIQ landing page keywords\n" +
                       "• Run targeted Google Ads campaign"
            }
        })

        # Add link to generate blog post
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "🤖 *Auto-generate blog post:*\nVisit <https://propiq.luntra.one/dashboard|PropIQ Dashboard> to generate content"
            }
        })

        return {"blocks": blocks}

    def send_email_notification(self, trends):
        """Send email notification via SendGrid"""
        if not self.sendgrid_key or not self.recipient_email:
            logger.warning("SendGrid not configured. Skipping email notification.")
            return False

        if not trends:
            return False

        # Build email content
        subject = f"{len(trends)} Real Estate Topics Trending on Google"
        html_content = self._build_email_html(trends)

        try:
            # SendGrid API call
            response = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {self.sendgrid_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "personalizations": [{
                        "to": [{"email": self.recipient_email}],
                        "subject": subject
                    }],
                    "from": {
                        "email": "trends@propiq.luntra.one",
                        "name": "PropIQ Trends Monitor"
                    },
                    "content": [{
                        "type": "text/html",
                        "value": html_content
                    }]
                }
            )

            if response.status_code == 202:
                logger.info(f"Email sent successfully to {self.recipient_email}!")
                return True
            else:
                logger.error(f"Email failed: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False

    def _build_email_html(self, trends):
        """Build HTML email content"""
        trends_html = ""
        for i, trend in enumerate(trends, 1):
            trends_html += f"""
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 16px; font-weight: bold; color: #1a73e8;">{i}</td>
                <td style="padding: 16px;">
                    <strong style="font-size: 16px; color: #202124;">{trend['term'].title()}</strong><br>
                    <span style="color: #5f6368; font-size: 14px;">Match keyword: <em>{trend['keyword_match']}</em></span>
                </td>
            </tr>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">📈 Google Trends Alert</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Real Estate Topics Trending Now</p>
                </div>

                <!-- Content -->
                <div style="padding: 32px;">
                    <p style="color: #202124; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        PropIQ Trends Monitor detected <strong>{len(trends)} trending topics</strong> related to real estate investing on Google Trends.
                    </p>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                        {trends_html}
                    </table>

                    <!-- Actions -->
                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: #202124; margin: 0 0 16px 0; font-size: 18px;">💡 Suggested Actions</h3>
                        <ul style="color: #5f6368; margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li>Create blog post about trending topic</li>
                            <li>Generate social media content</li>
                            <li>Update PropIQ landing page keywords</li>
                            <li>Run targeted Google Ads campaign</li>
                        </ul>
                    </div>

                    <!-- CTA -->
                    <div style="text-align: center;">
                        <a href="https://propiq.luntra.one" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Go to PropIQ Dashboard
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #5f6368; margin: 0; font-size: 14px;">
                        Detected on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}<br>
                        <a href="https://propiq.luntra.one" style="color: #1a73e8; text-decoration: none;">propiq.luntra.one</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        return html

    def save_trends_history(self, trends, output_file="trends_history.json"):
        """Save trends to JSON file for history"""
        try:
            # Load existing history
            if os.path.exists(output_file):
                with open(output_file, 'r') as f:
                    history = json.load(f)
            else:
                history = {"trends": []}

            # Add new trends
            history["trends"].extend(trends)
            history["last_check"] = datetime.now().isoformat()

            # Save updated history
            with open(output_file, 'w') as f:
                json.dump(history, f, indent=2)

            logger.info(f"Saved {len(trends)} trends to {output_file}")
            return True

        except Exception as e:
            logger.error(f"Error saving trends history: {e}")
            return False


def main():
    """Main execution function"""
    import argparse

    parser = argparse.ArgumentParser(description='PropIQ Google Trends Monitor')
    parser.add_argument('--region', default='United States', help='Region to monitor (default: United States)')
    parser.add_argument('--weeks', type=int, default=1, help='Number of weeks to look back (default: 1)')
    parser.add_argument('--slack-webhook', help='Slack webhook URL')
    parser.add_argument('--sendgrid-key', help='SendGrid API key')
    parser.add_argument('--email', help='Recipient email address')
    parser.add_argument('--no-slack', action='store_true', help='Skip Slack notification')
    parser.add_argument('--no-email', action='store_true', help='Skip email notification')
    parser.add_argument('--save-history', action='store_true', help='Save trends to history file')

    args = parser.parse_args()

    print("="*80)
    print("PropIQ Google Trends Monitor")
    print("="*80)
    print()

    # Load from environment if not provided
    slack_webhook = args.slack_webhook or os.getenv('SLACK_WEBHOOK_URL')
    sendgrid_key = args.sendgrid_key or os.getenv('SENDGRID_API_KEY')
    recipient_email = args.email or os.getenv('ALERT_EMAIL')

    # Create monitor
    monitor = TrendsMonitor(
        slack_webhook_url=slack_webhook if not args.no_slack else None,
        sendgrid_api_key=sendgrid_key if not args.no_email else None,
        recipient_email=recipient_email
    )

    # Check trends
    trends = monitor.check_trends(region=args.region, weeks=args.weeks)

    if trends:
        print(f"\n✅ Found {len(trends)} relevant trends!")
        print()
        for i, trend in enumerate(trends, 1):
            print(f"{i}. {trend['term'].title()}")
            print(f"   └─ Match: {trend['keyword_match']}")
        print()

        # Send notifications
        if not args.no_slack:
            monitor.send_slack_notification(trends)

        if not args.no_email:
            monitor.send_email_notification(trends)

        # Save history
        if args.save_history:
            monitor.save_trends_history(trends)
    else:
        print("\nℹ️  No relevant real estate trends detected this week.")
        print("   Monitoring keywords:", ", ".join(PROPIQ_KEYWORDS[:5]), "...")

    print()
    print("="*80)
    print("Monitoring complete!")
    print("="*80)


if __name__ == "__main__":
    main()
