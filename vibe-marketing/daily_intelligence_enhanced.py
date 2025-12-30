#!/usr/bin/env python3
"""
PropIQ Daily Business Intelligence Report (Enhanced)
Optimized for PropIQ's tech stack: Convex, Azure OpenAI, Stripe, W&B, Microsoft Clarity

Schedule with cron: 0 9 * * * cd /path/to/propiq/vibe-marketing && python3 daily_intelligence_enhanced.py
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import sys
from dotenv import load_dotenv

# Load environment variables from .env.production
load_dotenv('.env.production')

# Add color output for terminal
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_status(message: str, status: str = "info"):
    """Print colored status messages"""
    colors = {
        "success": Colors.GREEN,
        "warning": Colors.YELLOW,
        "error": Colors.RED,
        "info": Colors.BLUE
    }
    color = colors.get(status, Colors.BLUE)
    print(f"{color}{message}{Colors.END}")

# Configuration from environment variables
STRIPE_KEY = os.getenv("STRIPE_SECRET_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")  # Fallback for legacy setup
CONVEX_DEPLOYMENT_URL = os.getenv("CONVEX_URL")  # PropIQ uses Convex
WANDB_KEY = os.getenv("WANDB_API_KEY")
WANDB_PROJECT = os.getenv("WANDB_PROJECT", "propiq-analysis")
CLARITY_PROJECT_ID = os.getenv("CLARITY_PROJECT_ID", "tts5hc8zf8")
SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK_URL")

# Email configuration (alternative to Slack)
EMAIL_API_KEY = os.getenv("RESEND_API_KEY") or os.getenv("SENDGRID_API_KEY")  # Supports both!
EMAIL_SERVICE = os.getenv("EMAIL_SERVICE", "resend")  # "resend" or "sendgrid"
EMAIL_FROM = os.getenv("EMAIL_FROM", "PropIQ Intelligence <noreply@luntra.one>")
REPORT_EMAIL_TO = os.getenv("REPORT_EMAIL_TO", "brian@luntra.one")  # Your email
DELIVERY_METHOD = os.getenv("DELIVERY_METHOD", "email")  # "email" or "slack"

# Azure OpenAI (PropIQ's actual AI provider)
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o-mini")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")


def fetch_stripe_metrics() -> Dict[str, Any]:
    """
    Fetch revenue and subscription metrics from Stripe

    Returns:
        Dict with revenue, customer count, MRR, subscription changes
    """
    print_status("📊 Fetching Stripe metrics...", "info")

    if not STRIPE_KEY:
        print_status("⚠️  STRIPE_SECRET_KEY not set, skipping Stripe data", "warning")
        return {"error": "No API key", "revenue": 0, "new_customers": 0, "mrr": 0}

    try:
        yesterday = int((datetime.now() - timedelta(days=1)).timestamp())
        today = int(datetime.now().timestamp())

        # Fetch recent charges
        charges_response = requests.get(
            "https://api.stripe.com/v1/charges",
            headers={"Authorization": f"Bearer {STRIPE_KEY}"},
            params={
                "created[gte]": yesterday,
                "created[lte]": today,
                "limit": 100
            },
            timeout=10
        )
        charges_response.raise_for_status()
        charges_data = charges_response.json()

        # Fetch subscription changes
        subscriptions_response = requests.get(
            "https://api.stripe.com/v1/subscriptions",
            headers={"Authorization": f"Bearer {STRIPE_KEY}"},
            params={
                "created[gte]": yesterday,
                "created[lte]": today,
                "limit": 100,
                "status": "active"
            },
            timeout=10
        )
        subscriptions_response.raise_for_status()
        subscriptions_data = subscriptions_response.json()

        # Calculate metrics
        total_revenue = sum(
            charge.get('amount', 0) for charge in charges_data.get('data', [])
            if charge.get('paid')
        ) / 100

        num_charges = len([c for c in charges_data.get('data', []) if c.get('paid')])

        new_subscriptions = subscriptions_data.get('data', [])
        new_customers = len(new_subscriptions)

        # Calculate MRR from new subscriptions
        new_mrr = sum(
            sub.get('items', {}).get('data', [{}])[0].get('price', {}).get('unit_amount', 0) / 100
            for sub in new_subscriptions
        )

        # Get all active subscriptions for total MRR
        all_subs_response = requests.get(
            "https://api.stripe.com/v1/subscriptions",
            headers={"Authorization": f"Bearer {STRIPE_KEY}"},
            params={"status": "active", "limit": 100},
            timeout=10
        )
        all_subs_data = all_subs_response.json()

        total_mrr = sum(
            sub.get('items', {}).get('data', [{}])[0].get('price', {}).get('unit_amount', 0) / 100
            for sub in all_subs_data.get('data', [])
        )

        print_status(f"✅ Stripe: ${total_revenue:.2f} revenue, {new_customers} new customers", "success")

        return {
            "total_revenue_24h": round(total_revenue, 2),
            "num_charges": num_charges,
            "new_customers": new_customers,
            "new_mrr": round(new_mrr, 2),
            "total_mrr": round(total_mrr, 2),
            "subscription_count": len(all_subs_data.get('data', []))
        }

    except requests.exceptions.Timeout:
        print_status("⚠️  Stripe API timeout", "warning")
        return {"error": "Timeout", "revenue": 0}
    except requests.exceptions.RequestException as e:
        print_status(f"⚠️  Stripe API error: {str(e)[:100]}", "warning")
        return {"error": str(e), "revenue": 0}


def fetch_convex_metrics() -> Dict[str, Any]:
    """
    Fetch user and analysis metrics from Convex database

    Returns:
        Dict with user signups, analyses count, support chats
    """
    print_status("📊 Fetching Convex metrics...", "info")

    if not CONVEX_DEPLOYMENT_URL:
        print_status("⚠️  CONVEX_URL not set, trying MongoDB fallback", "warning")
        return fetch_mongodb_metrics()

    try:
        # Call the Convex dailyMetrics function we just deployed
        response = requests.post(
            f"{CONVEX_DEPLOYMENT_URL}/api/query",
            json={
                "path": "dailyMetrics:getDailyMetrics",
                "args": {"hoursAgo": 24}
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()

            # Convex returns {"status":"success","value":{...}}
            if result.get("status") == "success" and "value" in result:
                data = result["value"]
                users = data.get("users", {})
                analyses = data.get("analyses", {})
                support = data.get("support", {})

                metrics = {
                    "new_users": users.get("new_24h", 0),
                    "total_users": users.get("total", 0),
                    "analyses_24h": analyses.get("last_24h", 0),
                    "total_analyses": analyses.get("total", 0),
                    "support_chats": support.get("conversations_24h", 0),
                    "engagement_rate": users.get("engagement_rate", "0%"),
                    "power_users": analyses.get("power_users_24h", 0)
                }

                print_status(f"✅ Convex: {metrics['new_users']} new users, {metrics['analyses_24h']} analyses", "success")
                return metrics
            else:
                error_msg = result.get("error", "Unknown error")
                print_status(f"⚠️  Convex query failed: {error_msg}", "warning")
                return {"error": error_msg, "new_users": 0, "analyses_24h": 0}
        else:
            print_status(f"⚠️  Convex API returned {response.status_code}", "warning")
            return {"error": f"Status {response.status_code}", "new_users": 0}

    except Exception as e:
        print_status(f"⚠️  Convex error: {str(e)[:100]}", "warning")
        return {"error": str(e), "new_users": 0}


def fetch_mongodb_metrics() -> Dict[str, Any]:
    """
    Fallback: Fetch metrics from MongoDB (if not using Convex)

    Returns:
        Dict with user and activity metrics
    """
    print_status("📊 Fetching MongoDB metrics...", "info")

    if not MONGODB_URI:
        print_status("⚠️  Neither CONVEX_URL nor MONGODB_URI set", "warning")
        return {
            "new_users": 0,
            "total_users": 0,
            "analyses_24h": 0,
            "support_chats": 0,
            "error": "No database configured"
        }

    try:
        from pymongo import MongoClient

        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        db = client.get_database()

        yesterday = datetime.now() - timedelta(days=1)

        # Count new users
        new_users = db.users.count_documents({
            "created_at": {"$gte": yesterday}
        })

        # Total users
        total_users = db.users.count_documents({})

        # Property analyses
        analyses_24h = db.property_analyses.count_documents({
            "created_at": {"$gte": yesterday}
        })

        total_analyses = db.property_analyses.count_documents({})

        # Support chats
        support_chats = 0
        if "support_chats" in db.list_collection_names():
            support_chats = db.support_chats.count_documents({
                "created_at": {"$gte": yesterday}
            })

        client.close()

        print_status(f"✅ MongoDB: {new_users} new users, {analyses_24h} analyses", "success")

        return {
            "new_users": new_users,
            "total_users": total_users,
            "analyses_24h": analyses_24h,
            "total_analyses": total_analyses,
            "support_chats": support_chats
        }

    except Exception as e:
        print_status(f"⚠️  MongoDB error: {str(e)[:100]}", "warning")
        return {"error": str(e), "new_users": 0}


def fetch_wandb_metrics() -> Dict[str, Any]:
    """
    Fetch AI performance metrics from Weights & Biases

    Returns:
        Dict with API calls, token usage, costs
    """
    print_status("📊 Fetching W&B AI metrics...", "info")

    if not WANDB_KEY:
        print_status("⚠️  WANDB_API_KEY not set, using estimates", "warning")
        return {
            "runs": 0,
            "estimated_api_calls": "N/A",
            "estimated_tokens": "N/A",
            "error": "No API key"
        }

    try:
        # W&B API - get recent runs
        headers = {"Authorization": f"Bearer {WANDB_KEY}"}

        # Get project runs (simplified - adjust based on your W&B structure)
        response = requests.get(
            f"https://api.wandb.ai/api/v1/runs",
            headers=headers,
            params={
                "project": WANDB_PROJECT,
                "limit": 100
            },
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            runs = len(data.get('runs', []))

            print_status(f"✅ W&B: {runs} runs tracked", "success")

            return {
                "runs_24h": runs,
                "project": WANDB_PROJECT,
                "note": "Detailed metrics available in W&B dashboard"
            }
        else:
            print_status(f"⚠️  W&B API returned {response.status_code}", "warning")
            return {"runs": 0, "error": f"Status {response.status_code}"}

    except Exception as e:
        print_status(f"⚠️  W&B error: {str(e)[:100]}", "warning")
        return {"error": str(e), "runs": 0}


def fetch_clarity_metrics() -> Dict[str, Any]:
    """
    Fetch web analytics from Microsoft Clarity
    Note: Clarity doesn't have a public API yet, so this is a placeholder

    Returns:
        Dict with session metrics (placeholder for now)
    """
    print_status("📊 Fetching Microsoft Clarity metrics...", "info")

    # Microsoft Clarity doesn't have a public API as of 2025
    # You would need to manually check the dashboard or use their planned API

    print_status("ℹ️  Clarity metrics: Check dashboard at https://clarity.microsoft.com", "info")

    return {
        "project_id": CLARITY_PROJECT_ID,
        "note": "Clarity API not yet available - check dashboard",
        "dashboard_url": f"https://clarity.microsoft.com/projects/view/{CLARITY_PROJECT_ID}/dashboard"
    }


def generate_insights_with_azure_openai(
    stripe_data: Dict[str, Any],
    db_data: Dict[str, Any],
    wandb_data: Dict[str, Any],
    clarity_data: Dict[str, Any]
) -> str:
    """
    Generate business intelligence report using Azure OpenAI

    Returns:
        Formatted Slack message with insights
    """
    print_status("🤖 Generating insights with Azure OpenAI...", "info")

    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY:
        print_status("⚠️  Azure OpenAI not configured, generating basic report", "warning")
        return generate_basic_report(stripe_data, db_data, wandb_data, clarity_data)

    try:
        today = datetime.now().strftime("%B %d, %Y")

        # Construct prompt for AI analysis
        system_prompt = """You are a business intelligence analyst for PropIQ, an AI-powered real estate investment analysis platform.

Generate a concise, actionable daily health report in Slack format with emojis.
Focus on trends, red/green flags, and specific action items.
Be encouraging but honest about metrics."""

        user_prompt = f"""Analyze this data for PropIQ's daily health report ({today}):

STRIPE REVENUE (Last 24h):
{json.dumps(stripe_data, indent=2)}

DATABASE METRICS (Users & Activity):
{json.dumps(db_data, indent=2)}

AI PERFORMANCE (W&B):
{json.dumps(wandb_data, indent=2)}

ANALYTICS (Clarity):
{json.dumps(clarity_data, indent=2)}

Generate a Slack-formatted report with:
1. Revenue highlights (new customers, MRR growth)
2. User activity (signups, analyses, engagement)
3. AI performance summary
4. Key insights with 🟢 (wins), 🟡 (watch), 🔴 (issues)
5. 1-2 specific action items

Keep it under 500 words. Use Slack markdown (*bold*, _italic_)."""

        # Azure OpenAI API call
        url = f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version={AZURE_OPENAI_API_VERSION}"

        headers = {
            "api-key": AZURE_OPENAI_KEY,
            "Content-Type": "application/json"
        }

        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 1500,
            "top_p": 0.95
        }

        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()
        report = result['choices'][0]['message']['content']

        print_status("✅ AI report generated successfully", "success")

        return report

    except requests.exceptions.Timeout:
        print_status("⚠️  Azure OpenAI timeout, using fallback", "warning")
        return generate_basic_report(stripe_data, db_data, wandb_data, clarity_data)
    except Exception as e:
        print_status(f"⚠️  Azure OpenAI error: {str(e)[:100]}", "warning")
        return generate_basic_report(stripe_data, db_data, wandb_data, clarity_data)


def generate_basic_report(
    stripe_data: Dict[str, Any],
    db_data: Dict[str, Any],
    wandb_data: Dict[str, Any],
    clarity_data: Dict[str, Any]
) -> str:
    """
    Generate a basic report without AI (fallback)

    Returns:
        Formatted Slack message
    """
    today = datetime.now().strftime("%B %d, %Y")

    report = f"""📊 *PropIQ Daily Health Report - {today}*

💰 *REVENUE (Last 24h)*
- Revenue: ${stripe_data.get('total_revenue_24h', 0):.2f}
- New customers: {stripe_data.get('new_customers', 0)}
- New MRR: ${stripe_data.get('new_mrr', 0):.2f}
- Total MRR: ${stripe_data.get('total_mrr', 0):.2f}
- Active subscriptions: {stripe_data.get('subscription_count', 0)}

👥 *USER ACTIVITY*
- New signups: {db_data.get('new_users', 0)}
- Total users: {db_data.get('total_users', 0)}
- Analyses (24h): {db_data.get('analyses_24h', 0)}
- Total analyses: {db_data.get('total_analyses', 0)}
- Support chats: {db_data.get('support_chats', 0)}

🤖 *AI PERFORMANCE*
- W&B runs tracked: {wandb_data.get('runs_24h', 'N/A')}
- Project: {wandb_data.get('project', 'propiq-analysis')}

📈 *ANALYTICS*
- Clarity Project: {clarity_data.get('project_id', 'N/A')}
- Dashboard: {clarity_data.get('dashboard_url', 'N/A')}

💡 *NOTE:* Configure Azure OpenAI to get AI-generated insights and action items!

---
_Generated at {datetime.now().strftime("%I:%M %p")} | PropIQ Intelligence Dashboard v2.0_
"""

    return report


def send_via_email(report: str) -> bool:
    """
    Send report via email using Resend or SendGrid

    Returns:
        True if successful, False otherwise
    """
    print_status(f"📧 Sending report via email ({EMAIL_SERVICE.upper()})...", "info")

    if not EMAIL_API_KEY:
        print_status("⚠️  Email API key not set (RESEND_API_KEY or SENDGRID_API_KEY)", "warning")
        print_status("\n" + "="*60, "info")
        print_status("REPORT PREVIEW:", "info")
        print_status("="*60 + "\n", "info")
        print(report)
        print_status("\n" + "="*60 + "\n", "info")
        return False

    try:
        # Convert Slack formatting to HTML
        html_report = report.replace("*", "<strong>").replace("_", "<em>")
        html_report = html_report.replace("\n", "<br>")
        html_report = html_report.replace("```", "")

        # Create beautiful HTML email
        html_content = f"""
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 24px;">📊 PropIQ Daily Intelligence</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
                <div style="line-height: 1.6; color: #333;">
                    {html_report}
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6B7280; font-size: 12px; text-align: center;">
                    Generated automatically by PropIQ Daily Intelligence Dashboard<br>
                    <a href="https://propiq.luntra.one" style="color: #4F46E5; text-decoration: none;">Visit Dashboard</a>
                </p>
            </div>
        </body>
        </html>
        """

        if EMAIL_SERVICE == "resend":
            # Resend API (simpler!)
            resend_data = {
                "from": EMAIL_FROM,
                "to": [REPORT_EMAIL_TO],
                "subject": f"📊 PropIQ Daily Intelligence - {datetime.now().strftime('%B %d, %Y')}",
                "html": html_content
            }

            response = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {EMAIL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=resend_data,
                timeout=10
            )
            response.raise_for_status()

        else:  # SendGrid
            sendgrid_data = {
                "personalizations": [{
                    "to": [{"email": REPORT_EMAIL_TO}],
                    "subject": f"📊 PropIQ Daily Intelligence - {datetime.now().strftime('%B %d, %Y')}"
                }],
                "from": {"email": EMAIL_FROM.split('<')[1].split('>')[0] if '<' in EMAIL_FROM else EMAIL_FROM,
                         "name": EMAIL_FROM.split('<')[0].strip() if '<' in EMAIL_FROM else "PropIQ Intelligence"},
                "content": [{"type": "text/html", "value": html_content}]
            }

            response = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {EMAIL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=sendgrid_data,
                timeout=10
            )
            response.raise_for_status()

        print_status(f"✅ Report sent to {REPORT_EMAIL_TO} successfully!", "success")
        return True

    except Exception as e:
        print_status(f"⚠️  Email error: {str(e)[:100]}", "warning")
        print_status("\n" + "="*60, "info")
        print_status("REPORT PREVIEW:", "info")
        print_status("="*60 + "\n", "info")
        print(report)
        print_status("\n" + "="*60 + "\n", "info")
        return False


def send_to_slack(report: str) -> bool:
    """
    Send report to Slack via webhook (legacy/alternative method)

    Returns:
        True if successful, False otherwise
    """
    print_status("📤 Sending report to Slack...", "info")

    if not SLACK_WEBHOOK:
        print_status("⚠️  SLACK_WEBHOOK_URL not set", "warning")
        print_status("\n" + "="*60, "info")
        print_status("REPORT PREVIEW:", "info")
        print_status("="*60 + "\n", "info")
        print(report)
        print_status("\n" + "="*60 + "\n", "info")
        return False

    try:
        response = requests.post(
            SLACK_WEBHOOK,
            json={"text": report},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response.raise_for_status()

        print_status("✅ Report sent to Slack successfully!", "success")
        return True

    except Exception as e:
        print_status(f"⚠️  Slack webhook error: {str(e)[:100]}", "warning")
        print_status("\n" + "="*60, "info")
        print_status("REPORT PREVIEW:", "info")
        print_status("="*60 + "\n", "info")
        print(report)
        print_status("\n" + "="*60 + "\n", "info")
        return False


def send_report(report: str) -> bool:
    """
    Send report via configured delivery method (email or Slack)

    Returns:
        True if successful, False otherwise
    """
    if DELIVERY_METHOD == "email":
        return send_via_email(report)
    elif DELIVERY_METHOD == "slack":
        return send_to_slack(report)
    else:
        print_status(f"⚠️  Unknown delivery method: {DELIVERY_METHOD}", "warning")
        print_status("   Defaulting to email...", "info")
        return send_via_email(report)


def verify_environment() -> List[str]:
    """Check which environment variables are configured"""
    required = {
        "STRIPE_SECRET_KEY": STRIPE_KEY,
        "MONGODB_URI or CONVEX_URL": MONGODB_URI or CONVEX_DEPLOYMENT_URL,
    }

    # Check delivery method requirement
    if DELIVERY_METHOD == "email":
        required[f"Email API Key ({EMAIL_SERVICE.upper()})"] = EMAIL_API_KEY
    elif DELIVERY_METHOD == "slack":
        required["SLACK_WEBHOOK_URL (for Slack)"] = SLACK_WEBHOOK
    else:
        # Default to email
        required["Email API Key or SLACK_WEBHOOK_URL"] = EMAIL_API_KEY or SLACK_WEBHOOK

    optional = {
        "AZURE_OPENAI_ENDPOINT": AZURE_OPENAI_ENDPOINT,
        "AZURE_OPENAI_KEY": AZURE_OPENAI_KEY,
        "WANDB_API_KEY": WANDB_KEY,
        "CLARITY_PROJECT_ID": CLARITY_PROJECT_ID
    }

    missing = []

    print_status("\n🔍 Environment Check:", "info")
    print_status(f"   Delivery Method: {DELIVERY_METHOD.upper()}", "info")
    print_status("="*60, "info")

    for name, value in required.items():
        if value:
            print_status(f"  ✅ {name}", "success")
        else:
            print_status(f"  ❌ {name} (REQUIRED)", "error")
            missing.append(name)

    for name, value in optional.items():
        if value:
            print_status(f"  ✅ {name}", "success")
        else:
            print_status(f"  ⚠️  {name} (optional)", "warning")

    print_status("="*60 + "\n", "info")

    return missing


def main():
    """Main execution function"""
    print_status("\n" + "="*60, "info")
    print_status("🚀 PropIQ Daily Intelligence Dashboard", "info")
    print_status(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", "info")
    print_status("="*60 + "\n", "info")

    # Verify environment
    missing_vars = verify_environment()

    if missing_vars:
        print_status(f"\n❌ Missing required variables: {', '.join(missing_vars)}", "error")
        print_status("\nSet them with:", "info")
        for var in missing_vars:
            print_status(f"  export {var}='your_value_here'", "info")
        print_status("\nSee: vibe-marketing/.env.template for full list\n", "info")
        return 1

    # Fetch all metrics
    print_status("\n📊 Collecting metrics from all sources...\n", "info")

    stripe_data = fetch_stripe_metrics()
    db_data = fetch_convex_metrics()  # Will fallback to MongoDB if needed
    wandb_data = fetch_wandb_metrics()
    clarity_data = fetch_clarity_metrics()

    # Generate report
    print_status("\n🤖 Generating intelligence report...\n", "info")
    report = generate_insights_with_azure_openai(
        stripe_data,
        db_data,
        wandb_data,
        clarity_data
    )

    # Send report via configured method (email or Slack)
    print_status("\n📤 Delivering report...\n", "info")
    success = send_report(report)

    # Summary
    print_status("\n" + "="*60, "info")
    if success:
        print_status("✅ Daily intelligence report completed successfully!", "success")
        if DELIVERY_METHOD == "email":
            print_status(f"Check your inbox at {REPORT_EMAIL_TO}", "info")
        else:
            print_status("Check your Slack channel for the report", "info")
    else:
        print_status("⚠️  Report generated but delivery failed", "warning")
        print_status("Check the console output above for the report", "info")
    print_status("="*60 + "\n", "info")

    return 0 if success else 1


if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print_status("\n\n⚠️  Interrupted by user", "warning")
        sys.exit(1)
    except Exception as e:
        print_status(f"\n\n❌ Unexpected error: {str(e)}", "error")
        import traceback
        traceback.print_exc()
        sys.exit(1)
