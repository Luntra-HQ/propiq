# PropIQ Daily Business Intelligence Workflow

**Automated daily health report delivered to Slack at 9:00 AM**

This workflow pulls data from Stripe, MongoDB, Weights & Biases, and Microsoft Clarity to generate a comprehensive business intelligence report.

---

## Overview

**What it does:**
- Fetches revenue metrics from Stripe
- Pulls user activity from MongoDB
- Gets AI performance data from W&B
- Analyzes website traffic from Microsoft Clarity
- Generates insights using Claude
- Delivers formatted report to Slack

**Time to setup:** 15 minutes
**Maintenance:** Zero (runs automatically)
**Value:** Priceless (data-driven decisions daily)

---

## Option 1: String.com Workflow (RECOMMENDED)

### Step 1: Sign Up for String.com
1. Go to https://string.com
2. Sign up with Google/email
3. Free tier is fine to start

### Step 2: Create New Workflow
1. Click "New Workflow"
2. Name it: "PropIQ Daily Intelligence"
3. Set schedule: Daily at 9:00 AM EST

### Step 3: Copy This Prompt to String

```
You are a business intelligence analyst for PropIQ, an AI-powered real estate investment analysis platform.

Your task is to generate a comprehensive daily health report by pulling data from multiple sources and providing actionable insights.

DATA SOURCES TO PULL:

1. STRIPE REVENUE DATA
   - API Endpoint: https://api.stripe.com/v1/charges?created[gte]={{yesterday_unix}}&created[lte]={{today_unix}}
   - Headers: Authorization: Bearer {{STRIPE_SECRET_KEY}}
   - Metrics needed: New customers, MRR, churn, subscription changes

2. MONGODB USER DATA
   - Connection: {{MONGODB_URI}}
   - Database: luntra_outreach
   - Collections to query:
     - users: Count new signups (created_at >= yesterday)
     - property_analyses: Count analyses run in last 24h
     - support_chats: Count support conversations

3. WEIGHTS & BIASES AI METRICS
   - API Endpoint: https://api.wandb.ai/api/v1/runs/{{WANDB_PROJECT}}
   - Headers: Authorization: Bearer {{WANDB_API_KEY}}
   - Metrics needed: API calls, tokens used, cost, response times

4. MICROSOFT CLARITY (if API available)
   - Project: tts5hc8zf8
   - Metrics: Sessions, bounce rate, top pages

REPORT FORMAT:

Generate a Slack-formatted message with these sections:

📊 *PropIQ Daily Health Report - {{today_date}}*

💰 *REVENUE (Last 24h)*
- New customers: X ($XXX MRR)
- Total MRR: $X,XXX (+X% vs yesterday)
- Churn: X customers ($XX)
- Trial → Paid conversions: X (X% rate)

👥 *USER ACTIVITY*
- New signups: XX
- Active users (last 24h): XX
- Property analyses run: XX
- Avg analyses per user: X.X

🤖 *AI PERFORMANCE*
- Total OpenAI API calls: XXX
- Avg response time: X.Xs
- Token usage: XXX,XXX tokens
- Estimated cost: $XX.XX
- Success rate: XX%

📈 *WEBSITE METRICS*
- Unique visitors: X,XXX
- Bounce rate: XX%
- Avg session duration: X:XX
- Top traffic source: XXXXX

🎯 *KEY INSIGHTS* (AI-generated)
- Analyze trends vs yesterday/last week
- Flag concerning metrics (red flags)
- Highlight wins (green flags)
- Suggest 1-2 action items

TONE: Professional but encouraging. Celebrate wins, flag issues constructively.

OUTPUT: Send to Slack webhook: {{SLACK_WEBHOOK_URL}}
```

### Step 4: Configure Variables

In String.com, add these environment variables:

| Variable | Value | Where to Get It |
|----------|-------|----------------|
| `STRIPE_SECRET_KEY` | sk_live_xxx | Stripe Dashboard → Developers → API Keys |
| `MONGODB_URI` | mongodb+srv://xxx | MongoDB Atlas → Connect → Connection String |
| `WANDB_API_KEY` | xxx | wandb.ai → Settings → API Keys |
| `WANDB_PROJECT` | propiq-analysis | Your W&B project name |
| `SLACK_WEBHOOK_URL` | https://hooks.slack.com/xxx | Slack → Apps → Incoming Webhooks |

### Step 5: Test Run
1. Click "Test Run" in String.com
2. Check if data pulls correctly
3. Verify Slack message format
4. Make adjustments if needed

### Step 6: Activate
1. Click "Activate Workflow"
2. Set schedule: Daily at 9:00 AM
3. You're done! ✅

---

## Option 2: N8N Workflow (For Advanced Users)

If you prefer N8N for more control, here's the workflow structure:

### Workflow Nodes

```
1. [Schedule Trigger] → Every day at 9:00 AM

2. [HTTP Request] Stripe API
   ├─ URL: https://api.stripe.com/v1/charges
   ├─ Method: GET
   ├─ Auth: Bearer {{STRIPE_SECRET_KEY}}
   └─ Query: created[gte]={{yesterday}}&created[lte]={{today}}

3. [MongoDB] Query Users Collection
   ├─ Operation: Find
   ├─ Collection: users
   └─ Query: {created_at: {$gte: ISODate("{{yesterday}}")}}

4. [MongoDB] Query Property Analyses
   ├─ Operation: Aggregate
   ├─ Collection: property_analyses
   └─ Pipeline: Count analyses in last 24h

5. [HTTP Request] Weights & Biases API
   ├─ URL: https://api.wandb.ai/api/v1/runs/{{project}}
   ├─ Method: GET
   └─ Headers: Authorization: Bearer {{WANDB_API_KEY}}

6. [Claude AI] - Generate Insights
   ├─ System Prompt: "You are a business analyst..."
   ├─ User Prompt: "Analyze this data and provide insights: {{data}}"
   └─ Model: claude-3-sonnet

7. [Slack] Send Message
   ├─ Webhook URL: {{SLACK_WEBHOOK_URL}}
   └─ Message: {{formatted_report}}
```

### N8N JSON Workflow (Import This)

Save this as `propiq-daily-intelligence.json` and import to N8N:

```json
{
  "name": "PropIQ Daily Intelligence",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [{"field": "cronExpression", "expression": "0 9 * * *"}]
        }
      }
    },
    {
      "name": "Fetch Stripe Data",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 200],
      "parameters": {
        "url": "https://api.stripe.com/v1/charges",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.STRIPE_SECRET_KEY}}"
        },
        "qs": {
          "created[gte]": "={{$today.minus({days: 1}).toUnixInteger()}}",
          "created[lte]": "={{$today.toUnixInteger()}}"
        }
      }
    },
    {
      "name": "Query MongoDB Users",
      "type": "n8n-nodes-base.mongodb",
      "position": [450, 350],
      "parameters": {
        "operation": "find",
        "collection": "users",
        "query": "{\"created_at\": {\"$gte\": \"{{$today.minus({days: 1}).toISO()}}\"}}"
      }
    },
    {
      "name": "Generate Report with Claude",
      "type": "n8n-nodes-base.ai",
      "position": [750, 300],
      "parameters": {
        "model": "claude-3-sonnet",
        "prompt": "See PROMPT_TEMPLATE.md"
      }
    },
    {
      "name": "Send to Slack",
      "type": "n8n-nodes-base.slack",
      "position": [950, 300],
      "parameters": {
        "webhookUrl": "={{$env.SLACK_WEBHOOK_URL}}",
        "text": "={{$json.report}}"
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [[{"node": "Fetch Stripe Data"}, {"node": "Query MongoDB Users"}]]
    },
    "Fetch Stripe Data": {
      "main": [[{"node": "Generate Report with Claude"}]]
    },
    "Query MongoDB Users": {
      "main": [[{"node": "Generate Report with Claude"}]]
    },
    "Generate Report with Claude": {
      "main": [[{"node": "Send to Slack"}]]
    }
  }
}
```

---

## Alternative: Simple Python Script (No-Code-Tool Alternative)

If you want to run this yourself without String/N8N:

```python
# daily_intelligence.py
# Schedule this with cron: 0 9 * * * python3 daily_intelligence.py

import os
import requests
from datetime import datetime, timedelta
from pymongo import MongoClient
import anthropic

# Configuration
STRIPE_KEY = os.getenv("STRIPE_SECRET_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")
WANDB_KEY = os.getenv("WANDB_API_KEY")
SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK_URL")
CLAUDE_KEY = os.getenv("ANTHROPIC_API_KEY")

def fetch_stripe_data():
    yesterday = int((datetime.now() - timedelta(days=1)).timestamp())
    today = int(datetime.now().timestamp())

    response = requests.get(
        "https://api.stripe.com/v1/charges",
        headers={"Authorization": f"Bearer {STRIPE_KEY}"},
        params={"created[gte]": yesterday, "created[lte]": today}
    )
    return response.json()

def fetch_mongodb_data():
    client = MongoClient(MONGODB_URI)
    db = client["luntra_outreach"]

    yesterday = datetime.now() - timedelta(days=1)

    new_users = db.users.count_documents({"created_at": {"$gte": yesterday}})
    analyses = db.property_analyses.count_documents({"created_at": {"$gte": yesterday}})

    return {"new_users": new_users, "analyses": analyses}

def fetch_wandb_data():
    # W&B API call here
    pass

def generate_report(stripe_data, mongo_data, wandb_data):
    client = anthropic.Anthropic(api_key=CLAUDE_KEY)

    prompt = f"""
    Generate a daily business intelligence report for PropIQ.

    Data:
    - Stripe: {stripe_data}
    - MongoDB: {mongo_data}
    - W&B: {wandb_data}

    Format as a Slack message with emojis and insights.
    """

    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    return message.content[0].text

def send_to_slack(report):
    requests.post(SLACK_WEBHOOK, json={"text": report})

if __name__ == "__main__":
    stripe_data = fetch_stripe_data()
    mongo_data = fetch_mongodb_data()
    wandb_data = fetch_wandb_data()

    report = generate_report(stripe_data, mongo_data, wandb_data)
    send_to_slack(report)

    print("✅ Daily report sent!")
```

**Schedule with cron:**
```bash
crontab -e
# Add this line:
0 9 * * * cd /path/to/propiq && python3 daily_intelligence.py
```

---

## Expected Output Example

```
📊 *PropIQ Daily Health Report - January 15, 2025*

💰 *REVENUE (Last 24h)*
- New customers: 3 ($237 MRR)
- Total MRR: $4,890 (+5.1% vs yesterday)
- Churn: 1 customer ($29 Starter plan)
- Trial → Paid: 3/47 signups (6.4% conversion)

👥 *USER ACTIVITY*
- New signups: 47 (+12 vs yesterday)
- Active users: 234 (engaging with platform)
- Property analyses run: 89
- Avg analyses per user: 2.1

🤖 *AI PERFORMANCE*
- OpenAI API calls: 156
- Avg response time: 2.3s ⚡
- Token usage: 487,000 tokens
- Cost: $12.40 (within budget ✅)
- Success rate: 98.7%

📈 *WEBSITE METRICS*
- Unique visitors: 1,240 (+12% vs yesterday)
- Bounce rate: 34% (improved!)
- Avg session: 3:45
- Top source: Reddit r/realestateinvesting

🎯 *KEY INSIGHTS*
🟢 Deal Calculator usage up 23% - users love this feature, consider promoting in onboarding
🟢 Reddit traffic converting at 8.2% (best channel!)
🟡 3 users hit analysis limits on Starter plan - upsell opportunity
🔴 Support chat volume up 40% - check for common issues

💡 *Recommended Actions:*
1. Create content around Deal Calculator (high engagement)
2. Reach out to 3 users who hit limits with Pro plan offer
3. Review support chat logs for product improvement opportunities
```

---

## Troubleshooting

**Issue:** Slack webhook not working
**Solution:** Regenerate webhook in Slack Apps settings

**Issue:** MongoDB connection timeout
**Solution:** Whitelist your IP in MongoDB Atlas Network Access

**Issue:** Stripe API rate limit
**Solution:** Add delay between requests or cache data

**Issue:** Missing data in report
**Solution:** Check API keys are correct and have proper permissions

---

## Next Steps After Setup

1. **Week 1:** Monitor daily reports, adjust metrics as needed
2. **Week 2:** Add custom insights (A/B test results, cohort analysis)
3. **Week 3:** Expand to weekly deep-dive reports
4. **Month 2:** Automate action items (e.g., auto-send upsell emails)

---

## Cost Estimate

- String.com: Free tier (or $20/mo for advanced features)
- N8N: Free (self-hosted) or $20/mo (cloud)
- Claude API: ~$0.50/day for report generation
- Total: **$5-20/month for automated business intelligence**

Compare that to:
- Hiring analyst: $5,000+/month
- BI tools (Mixpanel, Amplitude): $200-1,000/month

**ROI: Massive** 🚀

---

**Questions?** Drop them in the PropIQ Slack channel or DM me!
