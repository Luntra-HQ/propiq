# ✅ Workflow 1: Daily Intelligence Dashboard - COMPLETE!

**Status:** Ready to run
**Setup time:** 5 minutes
**What you have:**

## Files Created

1. **`daily_intelligence.py`** - Main Python script that:
   - Fetches Stripe revenue data
   - Pulls MongoDB user/analysis data
   - Gets W&B AI metrics
   - Generates AI report with Claude
   - Sends to Slack

2. **`run_daily_intelligence.sh`** - Simple runner script that:
   - Loads environment variables
   - Runs the Python script
   - Shows helpful error messages

3. **`n8n-daily-intelligence.json`** - N8N workflow (for future use)
4. **`N8N_SETUP_GUIDE.md`** - Complete N8N setup guide (when you want more power)

---

## Quick Start (5 Minutes)

### Step 1: Set up Slack Webhook (2 minutes)

You need a Slack webhook URL to receive the reports.

**Option A: Use existing Slack workspace**
1. Go to: https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "PropIQ Intelligence"
4. Select your workspace
5. Go to "Incoming Webhooks" → Toggle "Activate Incoming Webhooks"
6. Click "Add New Webhook to Workspace"
7. Select a channel (create #propiq-intelligence if needed)
8. Copy the webhook URL

**Option B: Test without Slack**
The script will print the report to console if Slack fails, so you can test without it!

### Step 2: Add Slack Webhook to Environment (1 minute)

Add this line to your backend `.env` file:

```bash
# Add to: /Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/backend/.env
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

### Step 3: Run the Report! (1 minute)

```bash
cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/vibe-marketing"
./run_daily_intelligence.sh
```

**Expected output:**
```
📂 Loading environment variables from backend/.env...
🚀 Running Daily Intelligence Report...
⏰ 2025-10-31 14:30:00

📊 Fetching Stripe revenue data...
📊 Fetching MongoDB data...
📊 Fetching W&B AI metrics...
🤖 Generating report with Claude AI...
📤 Sending report to Slack...
✅ Report sent successfully!

✅ Daily intelligence report completed successfully!
```

---

## Schedule to Run Daily (2 minutes)

### Option 1: Cron (Mac/Linux)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 9 AM):
0 9 * * * cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/vibe-marketing && ./run_daily_intelligence.sh >> daily_intelligence.log 2>&1
```

### Option 2: Manual for Now

Just run `./run_daily_intelligence.sh` whenever you want a fresh report!

---

## What the Report Looks Like

```
📊 *PropIQ Daily Health Report - October 31, 2025*

💰 *REVENUE (Last 24h)*
- New customers: 3 ($237 MRR)
- Total MRR: $4,890 (+5.1% vs yesterday)
- Churn: 1 customer ($29 Starter plan)
- Trial → Paid: 3/47 signups (6.4% conversion)

👥 *USER ACTIVITY*
- New signups: 47 (+12 vs yesterday)
- Total users: 523
- Property analyses run: 89
- Support conversations: 12
- Avg analyses per new user: 1.9

🤖 *AI PERFORMANCE*
- Total API calls: 89 [estimate]
- Token usage: ~450,000 tokens [estimate]
- Estimated cost: $11.50
- Success rate: 98%

📈 *GROWTH TRENDS*
- User growth rate: +12% week-over-week 🟢
- Analysis volume: Increasing trend 🟢
- Revenue trend: Up 5% 🟢

🎯 *KEY INSIGHTS*
🟢 Conversion rate from trial to paid improved from 4.2% to 6.4% - onboarding improvements working!
🟢 Deal Calculator usage up 23% - users love this feature
🟡 3 users hit analysis limits on Starter plan - upsell opportunity
🔴 Support chat volume up 40% - check for common issues

💡 *RECOMMENDED ACTIONS:*
1. Reach out to 3 users who hit limits with Pro plan offer
2. Review support chat logs for product improvement opportunities
```

---

## Troubleshooting

### "Missing environment variables"
**Fix:** Make sure these are in `backend/.env`:
- `STRIPE_SECRET_KEY`
- `MONGODB_URI`
- `ANTHROPIC_API_KEY`
- `SLACK_WEBHOOK_URL` (optional for testing)

### "Stripe API error"
**Fix:** Check you're using the correct live/test key in `.env`

### "MongoDB connection failed"
**Fix:** Verify `MONGODB_URI` format:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### "Claude API error"
**Fix:** Verify `ANTHROPIC_API_KEY` starts with `sk-ant-`

### "Slack webhook failed"
**Fix:** The report will print to console instead. Check your webhook URL is correct.

---

## Next Steps

### Now that Workflow 1 is complete:

✅ **You have:** Automated daily intelligence ready to run
⏭️  **Next:** Let's generate your first 10 pieces of content!

---

## Upgrade to N8N Later

When you want more power and features:
1. Follow `N8N_SETUP_GUIDE.md`
2. Import `n8n-daily-intelligence.json`
3. Get visual workflow editor + more control

**For now:** The Python script does everything you need! 🎉

---

## Cost Estimate

- **Python script:** Free to run
- **Claude API:** ~$0.30-0.50 per report
- **Slack:** Free
- **Monthly:** ~$10-15 for daily reports

**Compare to:**
- Mixpanel/Amplitude: $200-1,000/month
- Hiring analyst: $5,000+/month

**ROI: Massive!** 🚀

---

**Questions?** Just ask! Ready to move on to content generation when you are. 🎯
