# PropIQ Daily Intelligence Dashboard - Deployment Guide

**Status:** ✅ Production Ready
**Setup Time:** 15 minutes
**Maintenance:** Zero (fully automated)

---

## 🎯 What You're Building

An AI-powered business intelligence dashboard that automatically:
- Collects metrics from Stripe, Convex, W&B, and Clarity
- Generates insights using Azure OpenAI (GPT-4)
- Delivers a comprehensive report to Slack every morning at 9 AM

**Example Report:**
```
📊 PropIQ Daily Health Report - January 15, 2025

💰 REVENUE (Last 24h)
- New customers: 3 ($237 MRR)
- Total MRR: $4,890 (+5.1% vs yesterday)
- Trial → Paid: 3/47 signups (6.4% conversion)

👥 USER ACTIVITY
- New signups: 47
- Analyses run: 89
- Engagement rate: 31.4%

🎯 KEY INSIGHTS
🟢 Reddit traffic converting at 8.2% (best channel!)
🟡 3 users hit limits - upsell opportunity
🔴 Support volume up 40% - check for issues

💡 RECOMMENDED ACTIONS:
1. Reach out to users who hit limits with Pro offer
2. Review support logs for product improvements
```

---

## 🚀 Quick Start (Option A: Automated Setup)

### Step 1: Run the Setup Script

```bash
cd /Users/briandusape/Projects/propiq/vibe-marketing
./setup_dashboard.sh
```

The script will:
- ✅ Check Python installation
- ✅ Install dependencies
- ✅ Create environment file
- ✅ Guide you through API key setup
- ✅ Test the dashboard
- ✅ Set up daily cron job

**That's it!** Your dashboard is ready.

---

## 📋 Manual Setup (Option B: Step by Step)

If you prefer manual setup or want to understand each step:

### Step 1: Install Dependencies

```bash
cd /Users/briandusape/Projects/propiq/vibe-marketing
pip3 install requests pymongo python-dotenv
```

### Step 2: Create Environment File

```bash
cp .env.production.template .env.production
```

### Step 3: Configure API Keys

Edit `.env.production` with your actual API keys:

```bash
# Required
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
AZURE_OPENAI_ENDPOINT=https://YOUR_RESOURCE.openai.azure.com/
AZURE_OPENAI_KEY=YOUR_KEY

# Optional (enhances reports)
WANDB_API_KEY=YOUR_KEY
```

**Where to get each key:** See [Getting API Keys](#getting-api-keys) section below.

### Step 4: Deploy Convex Function

The dashboard needs a Convex function to fetch user metrics:

```bash
cd /Users/briandusape/Projects/propiq
npx convex deploy
```

This deploys `convex/dailyMetrics.ts` which provides:
- User signup metrics
- Property analysis counts
- Support chat statistics
- Engagement rates

### Step 5: Test the Dashboard

```bash
cd vibe-marketing
source .env.production
python3 daily_intelligence_enhanced.py
```

You should see:
```
🚀 PropIQ Daily Intelligence Dashboard
⏰ 2025-01-15 09:00:00

📊 Fetching Stripe metrics...
✅ Stripe: $237.00 revenue, 3 new customers

📊 Fetching Convex metrics...
✅ Convex: 47 new users, 89 analyses

🤖 Generating insights with Azure OpenAI...
✅ AI report generated successfully

📤 Sending report to Slack...
✅ Report sent to Slack successfully!
```

### Step 6: Schedule Daily Runs

Add to crontab to run every day at 9 AM:

```bash
crontab -e
```

Add this line:
```bash
0 9 * * * cd /Users/briandusape/Projects/propiq/vibe-marketing && source .env.production && python3 daily_intelligence_enhanced.py >> logs/daily_report_$(date +\%Y\%m\%d).log 2>&1
```

**Alternative schedules:**
```bash
# 9 AM weekdays only
0 9 * * 1-5 cd /path/to/vibe-marketing && ...

# 9 AM and 5 PM daily
0 9,17 * * * cd /path/to/vibe-marketing && ...

# Every hour during business hours
0 9-17 * * * cd /path/to/vibe-marketing && ...
```

---

## 🔑 Getting API Keys

### Stripe Secret Key

1. Go to https://dashboard.stripe.com/apikeys
2. Click "Reveal test key" or use your live key
3. Copy the key (starts with `sk_live_` or `sk_test_`)
4. Paste into `.env.production` as `STRIPE_SECRET_KEY`

**Security Note:** Never commit this key to git!

### Convex Deployment URL

1. Go to https://dashboard.convex.dev
2. Select your PropIQ project
3. Click "Settings"
4. Copy the "Deployment URL" (e.g., `https://mild-tern-361.convex.cloud`)
5. Paste into `.env.production` as `CONVEX_URL`

### Slack Webhook URL

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "PropIQ Intelligence" and select your workspace
4. Click "Incoming Webhooks" → Activate
5. Click "Add New Webhook to Workspace"
6. Select the channel (e.g., #propiq-intelligence)
7. Copy the webhook URL (starts with `https://hooks.slack.com/`)
8. Paste into `.env.production` as `SLACK_WEBHOOK_URL`

### Azure OpenAI Credentials

1. Go to https://portal.azure.com
2. Navigate to your Azure OpenAI resource
3. Click "Keys and Endpoint" in the left sidebar
4. Copy:
   - Endpoint (e.g., `https://your-resource.openai.azure.com/`)
   - Key 1
5. Paste into `.env.production`:
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_KEY`

### Weights & Biases API Key (Optional)

1. Go to https://wandb.ai/settings
2. Scroll to "API Keys"
3. Click "New Key" or copy existing key
4. Paste into `.env.production` as `WANDB_API_KEY`

### Microsoft Clarity Project ID (Optional)

1. Go to https://clarity.microsoft.com
2. Select your PropIQ project
3. Copy the Project ID (shown in URL: `/projects/view/YOUR_ID/`)
4. Paste into `.env.production` as `CLARITY_PROJECT_ID`

**Default:** Already set to `tts5hc8zf8` (PropIQ's Clarity project)

---

## 📊 Understanding the Dashboard Output

### Metrics Collected

**Revenue (Stripe):**
- New customers in last 24h
- New MRR added
- Total MRR
- Subscription changes
- Trial conversion rate

**Users (Convex):**
- New signups
- Active users (engaged in last 24h)
- Total user count
- Engagement rate
- Subscription tier breakdown

**Activity (Convex):**
- Property analyses run
- Average analyses per user
- Power users (5+ analyses/day)
- Trial users near limit

**Support (Convex):**
- New support conversations
- Total conversations

**AI Performance (W&B):**
- API calls tracked
- Estimated token usage
- Estimated costs

### AI-Generated Insights

The Azure OpenAI integration provides:
- **🟢 Green flags:** Wins to celebrate
- **🟡 Yellow flags:** Things to watch
- **🔴 Red flags:** Issues needing attention
- **Actionable recommendations:** 1-2 specific actions to take

---

## 🔧 Customization

### Adjust Report Timing

Edit the cron schedule:
```bash
crontab -e

# Change from 9 AM to 8 AM
0 8 * * * cd /path/to/vibe-marketing && ...

# Run twice daily (9 AM and 5 PM)
0 9,17 * * * cd /path/to/vibe-marketing && ...
```

### Customize Report Content

Edit `daily_intelligence_enhanced.py`:

**Add custom metrics:**
```python
# Line ~250: Add your custom metric fetch
def fetch_custom_metrics() -> Dict[str, Any]:
    # Your custom logic here
    return {"custom_metric": 123}

# Line ~350: Include in report generation
custom_data = fetch_custom_metrics()
report = generate_insights_with_azure_openai(
    stripe_data, db_data, wandb_data, clarity_data, custom_data
)
```

**Modify AI prompt:**
```python
# Line ~400: Edit the system_prompt or user_prompt
system_prompt = """You are a business intelligence analyst...
Add your custom instructions here..."""
```

### Change Delivery Channel

**Send to email instead of Slack:**
```python
def send_to_email(report: str) -> bool:
    import smtplib
    # Add your email logic here
```

**Send to Discord:**
```python
def send_to_discord(report: str) -> bool:
    import requests
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    requests.post(webhook_url, json={"content": report})
```

---

## 🐛 Troubleshooting

### "STRIPE_SECRET_KEY not set"

**Problem:** Environment variable not loaded

**Solution:**
```bash
# Make sure to source the env file
source .env.production
python3 daily_intelligence_enhanced.py

# Or export manually
export STRIPE_SECRET_KEY=sk_live_YOUR_KEY
```

### "Convex integration needs custom query function"

**Problem:** Convex function not deployed

**Solution:**
```bash
cd /Users/briandusape/Projects/propiq
npx convex deploy
```

Verify at https://dashboard.convex.dev → Your Project → Functions → `dailyMetrics`

### "MongoDB connection timeout"

**Problem:** Network access not configured

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add `0.0.0.0/0` (allow all) for testing
4. Or add your server's specific IP

### "Slack webhook error: 404"

**Problem:** Invalid webhook URL

**Solution:**
1. Go back to Slack App settings
2. Regenerate webhook URL
3. Update `.env.production`
4. Test: `curl -X POST -H 'Content-Type: application/json' -d '{"text":"Test"}' YOUR_WEBHOOK_URL`

### "Azure OpenAI timeout"

**Problem:** API request taking too long or rate limit

**Solution:**
```python
# Edit line ~380: Increase timeout
response = requests.post(url, headers=headers, json=payload, timeout=60)

# Or use fallback report
# The script automatically falls back if Azure OpenAI fails
```

### No metrics showing in report

**Problem:** No data in last 24 hours

**Solution:**
```python
# Edit line ~30: Extend timeframe for testing
def fetch_stripe_metrics():
    yesterday = int((datetime.now() - timedelta(days=7)).timestamp())  # 7 days instead of 1
```

### Cron job not running

**Problem:** Cron environment different from shell

**Solution:**
```bash
# Edit crontab to include full path
0 9 * * * export PATH=/usr/local/bin:/usr/bin:/bin && cd /Users/briandusape/Projects/propiq/vibe-marketing && source .env.production && /usr/local/bin/python3 daily_intelligence_enhanced.py >> logs/cron_$(date +\%Y\%m\%d).log 2>&1
```

Check logs:
```bash
tail -f logs/cron_*.log
```

---

## 📁 File Structure

```
propiq/vibe-marketing/
├── daily_intelligence_enhanced.py   ← Main dashboard script (ENHANCED)
├── daily_intelligence.py            ← Original script (legacy)
├── setup_dashboard.sh               ← Automated setup wizard
├── .env.production.template         ← Environment template
├── .env.production                  ← Your actual API keys (gitignored)
├── DEPLOYMENT_GUIDE.md             ← This file
├── QUICK_START_GUIDE.md            ← 15-min quick start
├── README.md                        ← Overview
├── logs/                            ← Daily logs
│   ├── daily_report_20250115.log
│   ├── daily_report_20250116.log
│   └── ...
└── ...

propiq/convex/
└── dailyMetrics.ts                  ← Convex function for metrics
```

---

## 📈 Success Metrics

**Week 1:**
- ✅ Daily report running automatically
- ✅ Team checking report every morning
- ✅ 1-2 actionable insights acted upon

**Week 2:**
- ✅ Custom metrics added
- ✅ Report timing adjusted to team needs
- ✅ 3-5 decisions influenced by data

**Month 1:**
- ✅ Dashboard trusted as source of truth
- ✅ 10+ hours/month saved on manual reporting
- ✅ Data-driven culture established

---

## 🚀 Next Steps After Setup

### Week 1: Refine

1. Adjust metrics based on what's valuable
2. Add custom metrics for your business
3. Fine-tune AI prompts for better insights

### Week 2: Expand

Deploy additional vibe marketing workflows:
- **Reddit-to-Content Engine** (auto-generate blog posts)
- **One-Click CRM** (automated prospect research)
- **Competitor Intelligence** (daily competitive analysis)

See: `vibe-marketing/README.md` for 7 workflow blueprints

### Month 2: Scale

1. Add weekly deep-dive reports
2. Automate action items (e.g., send emails to users who hit limits)
3. Build custom dashboards in Slack
4. Integrate with more data sources

---

## 💰 Cost Breakdown

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| **Python Script** | $0 | Runs on your server |
| **Convex Queries** | $0 | Free tier (generous limits) |
| **Azure OpenAI** | $5-15 | ~$0.50/day for reports |
| **Stripe API** | $0 | Free |
| **W&B API** | $0 | Free tier |
| **Slack Webhooks** | $0 | Free |
| **Total** | **$5-15/mo** | Full automated BI dashboard |

**Compare to:**
- Hiring analyst: $5,000+/month
- BI tools (Mixpanel): $200-1,000/month
- Manual reporting: 10+ hours/week

**ROI:** Massive 🚀

---

## 🆘 Support

**Issues?**
- Check troubleshooting section above
- Review logs in `logs/` directory
- Test individual components (Stripe, Convex, etc.)

**Questions?**
- Email: brian@luntra.one
- Slack: #propiq-intelligence

**Want to contribute?**
- Share your customizations
- Submit improvements
- Help others in the community

---

## ✅ Checklist: Am I Ready?

Before going live, verify:

- [ ] All required API keys configured
- [ ] Test run completed successfully
- [ ] Report delivered to Slack
- [ ] Cron job scheduled
- [ ] Logs directory created
- [ ] Team knows where to find reports
- [ ] Understand how to read metrics

**All checked?** You're ready! 🎉

---

## 🎉 You're Done!

Your PropIQ Daily Intelligence Dashboard is now live.

**Tomorrow at 9 AM:** Check Slack for your first automated report.

**Questions?** See troubleshooting section or reach out for help.

**Want to build more?** Check out `vibe-marketing/README.md` for 6 more automation workflows.

---

**Last Updated:** January 2025
**Version:** 2.0 (Enhanced with Azure OpenAI, Convex, improved error handling)
**Status:** ✅ Production Ready
