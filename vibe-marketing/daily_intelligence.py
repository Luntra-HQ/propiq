#!/usr/bin/env python3
"""
PropIQ Daily Business Intelligence Report
Generates automated daily health report and sends to Slack

Schedule with cron: 0 9 * * * cd /path/to/vibe-marketing && python3 daily_intelligence.py
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Configuration from environment variables
STRIPE_KEY = os.getenv("STRIPE_SECRET_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")
WANDB_KEY = os.getenv("WANDB_API_KEY")
WANDB_PROJECT = os.getenv("WANDB_PROJECT", "propiq-analysis")
SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK_URL")
CLAUDE_KEY = os.getenv("ANTHROPIC_API_KEY")

def fetch_stripe_data() -> Dict[str, Any]:
    """Fetch revenue data from Stripe for last 24 hours"""
    print("📊 Fetching Stripe revenue data...")

    yesterday = int((datetime.now() - timedelta(days=1)).timestamp())
    today = int(datetime.now().timestamp())

    try:
        response = requests.get(
            "https://api.stripe.com/v1/charges",
            headers={"Authorization": f"Bearer {STRIPE_KEY}"},
            params={
                "created[gte]": yesterday,
                "created[lte]": today,
                "limit": 100
            }
        )
        response.raise_for_status()
        data = response.json()

        # Calculate metrics
        total_revenue = sum(charge.get('amount', 0) for charge in data.get('data', [])) / 100
        num_charges = len(data.get('data', []))

        return {
            "total_revenue": total_revenue,
            "num_charges": num_charges,
            "raw_data": data
        }
    except Exception as e:
        print(f"⚠️  Stripe API error: {e}")
        return {"error": str(e), "total_revenue": 0, "num_charges": 0}


def fetch_mongodb_data() -> Dict[str, Any]:
    """Fetch user and analysis data from MongoDB"""
    print("📊 Fetching MongoDB data...")

    try:
        from pymongo import MongoClient

        client = MongoClient(MONGODB_URI)
        db = client.get_database()  # Uses database from URI

        yesterday = datetime.now() - timedelta(days=1)

        # Count new users
        new_users = db.users.count_documents({
            "created_at": {"$gte": yesterday}
        })

        # Count property analyses
        analyses = db.property_analyses.count_documents({
            "created_at": {"$gte": yesterday}
        })

        # Count total active users
        total_users = db.users.count_documents({})

        # Count support chats
        support_chats = db.support_chats.count_documents({
            "created_at": {"$gte": yesterday}
        }) if "support_chats" in db.list_collection_names() else 0

        return {
            "new_users": new_users,
            "analyses": analyses,
            "total_users": total_users,
            "support_chats": support_chats
        }
    except Exception as e:
        print(f"⚠️  MongoDB error: {e}")
        return {
            "error": str(e),
            "new_users": 0,
            "analyses": 0,
            "total_users": 0,
            "support_chats": 0
        }


def fetch_wandb_data() -> Dict[str, Any]:
    """Fetch AI metrics from Weights & Biases"""
    print("📊 Fetching W&B AI metrics...")

    try:
        # W&B API endpoint (this is a simplified version)
        # You may need to adjust based on your actual W&B project structure
        response = requests.get(
            f"https://api.wandb.ai/api/v1/runs/{WANDB_PROJECT}",
            headers={"Authorization": f"Bearer {WANDB_KEY}"},
            params={"limit": 100}
        )

        if response.status_code == 200:
            data = response.json()
            return {
                "runs": len(data.get('runs', [])),
                "raw_data": data
            }
        else:
            print(f"⚠️  W&B API returned status {response.status_code}")
            return {"runs": 0, "error": f"Status {response.status_code}"}

    except Exception as e:
        print(f"⚠️  W&B API error: {e}")
        return {"error": str(e), "runs": 0}


def generate_report_with_claude(
    stripe_data: Dict[str, Any],
    mongo_data: Dict[str, Any],
    wandb_data: Dict[str, Any]
) -> str:
    """Generate business intelligence report using Claude"""
    print("🤖 Generating report with Claude AI...")

    today = datetime.now().strftime("%B %d, %Y")

    prompt = f"""You are a business intelligence analyst for PropIQ, an AI-powered real estate investment analysis platform.

Your task is to generate a comprehensive daily health report by analyzing the following data from the last 24 hours:

STRIPE REVENUE DATA:
{json.dumps(stripe_data, indent=2)}

MONGODB USER & ACTIVITY DATA:
{json.dumps(mongo_data, indent=2)}

WEIGHTS & BIASES AI METRICS:
{json.dumps(wandb_data, indent=2)}

---

Generate a Slack-formatted report with these sections:

📊 *PropIQ Daily Health Report - {today}*

💰 *REVENUE (Last 24h)*
- New customers: X ($XXX MRR)
- Total MRR: $X,XXX (+X% vs yesterday)
- Churn: X customers ($XX)
- Trial → Paid conversions: X (X% rate)

👥 *USER ACTIVITY*
- New signups: {mongo_data.get('new_users', 0)}
- Total users: {mongo_data.get('total_users', 0)}
- Property analyses run: {mongo_data.get('analyses', 0)}
- Support conversations: {mongo_data.get('support_chats', 0)}
- Avg analyses per new user: X.X

🤖 *AI PERFORMANCE*
- Total API calls: {wandb_data.get('runs', 0)} [estimate]
- Token usage: XXX,XXX tokens [estimate]
- Estimated cost: $XX.XX
- Success rate: XX%

📈 *GROWTH TRENDS*
- User growth rate: X% week-over-week
- Analysis volume trend: increasing/decreasing/stable
- Revenue trend: up/down/flat

🎯 *KEY INSIGHTS* (AI-generated)
- Analyze trends vs yesterday/last week
- Flag concerning metrics (🔴 red flags)
- Highlight wins (🟢 green flags)
- Note interesting patterns (🟡 yellow flags)
- Suggest 1-2 action items

💡 *RECOMMENDED ACTIONS:*
1. [Actionable item based on data]
2. [Another actionable item]

TONE: Professional but encouraging. Celebrate wins, flag issues constructively.

IMPORTANT: If any data is missing or shows errors, note it but provide insights based on available data. Make reasonable estimates where needed and mark them as [estimate]."""

    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": CLAUDE_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json={
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 2048,
                "temperature": 0.3,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
        )
        response.raise_for_status()

        data = response.json()
        report = data['content'][0]['text']
        return report

    except Exception as e:
        print(f"⚠️  Claude API error: {e}")
        return f"""📊 *PropIQ Daily Health Report - {today}*

⚠️ Report generation failed: {str(e)}

**Available data:**
- New users: {mongo_data.get('new_users', 0)}
- Analyses run: {mongo_data.get('analyses', 0)}
- Revenue: ${stripe_data.get('total_revenue', 0):.2f}

Please check API credentials and try again."""


def send_to_slack(report: str) -> bool:
    """Send report to Slack via webhook"""
    print("📤 Sending report to Slack...")

    try:
        response = requests.post(
            SLACK_WEBHOOK,
            json={"text": report},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        print("✅ Report sent successfully!")
        return True

    except Exception as e:
        print(f"⚠️  Slack webhook error: {e}")
        print("\n📄 Report preview:\n")
        print(report)
        return False


def main():
    """Main execution function"""
    print("🚀 Starting PropIQ Daily Intelligence Report...")
    print(f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Verify environment variables
    missing_vars = []
    if not STRIPE_KEY:
        missing_vars.append("STRIPE_SECRET_KEY")
    if not MONGODB_URI:
        missing_vars.append("MONGODB_URI")
    if not CLAUDE_KEY:
        missing_vars.append("ANTHROPIC_API_KEY")
    if not SLACK_WEBHOOK:
        missing_vars.append("SLACK_WEBHOOK_URL")

    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("\nPlease set them before running this script.")
        print("Example:")
        print("  export STRIPE_SECRET_KEY='sk_live_...'")
        print("  export MONGODB_URI='mongodb+srv://...'")
        print("  export ANTHROPIC_API_KEY='sk-ant-...'")
        print("  export SLACK_WEBHOOK_URL='https://hooks.slack.com/...'")
        return 1

    # Fetch data from all sources
    stripe_data = fetch_stripe_data()
    mongo_data = fetch_mongodb_data()
    wandb_data = fetch_wandb_data()

    # Generate report
    report = generate_report_with_claude(stripe_data, mongo_data, wandb_data)

    # Send to Slack
    success = send_to_slack(report)

    if success:
        print("\n✅ Daily intelligence report completed successfully!")
        return 0
    else:
        print("\n⚠️  Report generated but failed to send to Slack")
        print("Check the console output above for the report.")
        return 1


if __name__ == "__main__":
    exit(main())
