# Get Your Slack Webhook URL (2 minutes)

## ✅ **Status:** Dashboard is DEPLOYED and WORKING! Just need Slack for delivery.

---

## Quick Setup

### Step 1: Go to Slack Apps
https://api.slack.com/apps

### Step 2: Create App
1. Click **"Create New App"**
2. Choose **"From scratch"**
3. Name: **"PropIQ Intelligence"**
4. Select your workspace

### Step 3: Enable Webhooks
1. Click **"Incoming Webhooks"** in left sidebar
2. Toggle **"Activate Incoming Webhooks"** to ON
3. Click **"Add New Webhook to Workspace"**
4. Select channel: **#propiq-intelligence** (or create it first)
5. Click **"Allow"**

### Step 4: Copy Webhook URL
You'll see a URL like:
```
https://hooks.slack.com/services/T01234ABCD/B01234EFGH/aAbBcCdDeEfFgGhH1234567890
```

### Step 5: Update .env.production
```bash
cd /Users/briandusape/Projects/propiq/vibe-marketing
nano .env.production
```

Find this line:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Replace with your actual webhook URL.

### Step 6: Test!
```bash
python3 daily_intelligence_enhanced.py
```

Check your Slack channel - you should see the report! 🎉

---

## Done!

Now set up the cron job to run daily:

```bash
crontab -e
```

Add this line:
```
0 9 * * * cd /Users/briandusape/Projects/propiq/vibe-marketing && python3 daily_intelligence_enhanced.py >> logs/daily_report_$(date +\%Y\%m\%d).log 2>&1
```

Save and exit. Your dashboard will now run every day at 9 AM!
