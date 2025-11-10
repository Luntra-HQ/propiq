# N8N Setup Guide for PropIQ Daily Intelligence

**Time to complete:** 20 minutes
**What you'll get:** Automated daily business intelligence reports at 9 AM

---

## Step 1: Install N8N (5 minutes)

### Option A: Run with npx (Quickest - No Installation)
```bash
npx n8n
```

### Option B: Install Globally (Recommended)
```bash
npm install -g n8n
```

### Option C: Docker (Most Isolated)
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**For this guide, we'll use Option A (npx)** - simplest to get started.

---

## Step 2: Start N8N (1 minute)

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/vibe-marketing
npx n8n
```

**N8N will open at:** http://localhost:5678

**On first launch:**
1. Create an account (email + password)
2. You'll see the N8N workflow editor

---

## Step 3: Import the PropIQ Workflow (2 minutes)

1. **In N8N UI:**
   - Click "Workflows" (left sidebar)
   - Click "Add workflow" → "Import from File"

2. **Import the JSON:**
   - Select: `n8n-daily-intelligence.json`
   - Or copy/paste the JSON content from the file

3. **You should see:**
   - 8 connected nodes
   - Schedule trigger → Data fetching → Claude AI → Slack

---

## Step 4: Configure Credentials (10 minutes)

N8N needs API credentials for each service. Here's how to add them:

### 4.1 Stripe API Credentials

1. Click on "Fetch Stripe Revenue Data" node
2. Click "Credential to connect with" → "Create New"
3. Enter:
   - **Credential Name:** PropIQ Stripe
   - **Secret Key:** (From your `.env` - `STRIPE_SECRET_KEY`)
4. Save

**Where to get Stripe key:**
- Stripe Dashboard → Developers → API Keys → Secret Key
- Should start with `sk_live_` (production) or `sk_test_` (testing)

---

### 4.2 MongoDB Credentials

1. Click on "Query MongoDB - New Users" node
2. Click "Credential to connect with" → "Create New"
3. Enter:
   - **Credential Name:** PropIQ MongoDB
   - **Connection String:** (From your `.env` - `MONGODB_URI`)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database`
4. Save
5. Repeat for "Query MongoDB - Property Analyses" node (select same credential)

**Where to get MongoDB URI:**
- MongoDB Atlas → Connect → Connection String
- Replace `<password>` with your actual password

---

### 4.3 Weights & Biases API

For W&B, we'll use environment variables instead of credentials:

1. Click "Fetch W&B AI Metrics" node
2. In the Authorization header, it uses: `{{ $env.WANDB_API_KEY }}`
3. You'll set this environment variable before running N8N

**Where to get W&B API key:**
- wandb.ai → Settings → API Keys

---

### 4.4 Claude (Anthropic) API

1. Click on "Generate Report with Claude" node
2. Click "Credential to connect with" → "Create New"
3. Enter:
   - **Credential Name:** Claude API
   - **API Key:** (Your Anthropic API key)
4. Save

**Where to get Claude API key:**
- Go to: https://console.anthropic.com/settings/keys
- Create new key if needed

---

### 4.5 Slack Webhook

We'll use an environment variable for this:

1. The "Send to Slack" node uses: `{{ $env.SLACK_WEBHOOK_URL }}`
2. You'll set this environment variable before running N8N

**How to create Slack webhook:**
1. Go to: https://api.slack.com/apps
2. Create new app → "From scratch"
3. Name it "PropIQ Intelligence"
4. Select your workspace
5. Go to "Incoming Webhooks" → Activate
6. "Add New Webhook to Workspace"
7. Select channel (e.g., #propiq-intelligence)
8. Copy webhook URL (starts with `https://hooks.slack.com/`)

---

## Step 5: Set Environment Variables (2 minutes)

Create a `.env` file in the vibe-marketing folder:

```bash
# /Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/vibe-marketing/.env

WANDB_API_KEY="your_wandb_key_here"
WANDB_PROJECT="propiq-analysis"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

**To run N8N with environment variables:**

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/vibe-marketing
export $(cat .env | xargs) && npx n8n
```

---

## Step 6: Test the Workflow (3 minutes)

1. **In N8N UI:**
   - Click "Execute Workflow" button (top right)
   - Watch each node execute (they'll turn green)

2. **Check for errors:**
   - Red nodes = error (click to see details)
   - Green nodes = success

3. **Verify Slack:**
   - Check your Slack channel
   - You should see a formatted daily report

---

## Step 7: Activate the Schedule (1 minute)

1. Click the **Active/Inactive toggle** (top right)
2. It should turn green and say "Active"
3. The workflow will now run automatically every day at 9:00 AM

---

## Troubleshooting

### "MongoDB connection failed"
- Check your `MONGODB_URI` is correct
- Verify Network Access in MongoDB Atlas allows your IP
- Try whitelisting 0.0.0.0/0 (all IPs) for testing

### "Stripe API error"
- Verify you're using the SECRET key (not publishable)
- Check if you're using LIVE keys (not test keys)

### "Claude API error"
- Verify API key is valid
- Check you have credits in your Anthropic account

### "Slack webhook failed"
- Regenerate webhook in Slack
- Make sure webhook URL is in `.env` file
- Verify environment variables loaded (`echo $SLACK_WEBHOOK_URL`)

### "W&B data not loading"
- Verify `WANDB_API_KEY` is set
- Check project name is correct (`propiq-analysis`)

---

## Running N8N in the Background

### Option 1: Keep terminal open
```bash
export $(cat .env | xargs) && npx n8n
```
Leave this terminal window open.

### Option 2: Run as background process
```bash
export $(cat .env | xargs) && nohup npx n8n > n8n.log 2>&1 &
```

### Option 3: Use PM2 (Recommended for production)
```bash
npm install -g pm2
pm2 start n8n --name propiq-intelligence
pm2 save
pm2 startup  # Configure to start on boot
```

---

## Customizing the Report

Want to add/remove metrics? Edit the Claude prompt in the "Generate Report with Claude" node:

**To add custom metrics:**
1. Click on "Generate Report with Claude" node
2. Find the prompt section
3. Add your custom section:
   ```
   📱 *CUSTOM METRIC*
   - Your metric here
   ```

**To change report frequency:**
1. Click "Schedule Trigger (9 AM Daily)" node
2. Change cron expression:
   - Every 6 hours: `0 */6 * * *`
   - Twice daily: `0 9,18 * * *` (9 AM and 6 PM)
   - Weekly: `0 9 * * 1` (Mondays at 9 AM)

---

## Next Steps

Once this workflow is running smoothly:

1. **Week 1:** Monitor daily reports, verify accuracy
2. **Week 2:** Add custom insights (cohort analysis, A/B test results)
3. **Week 3:** Build Workflow 2 (Reddit-to-Content Machine)
4. **Week 4:** Expand to video and outreach automation

---

## Cost Estimate

- **N8N:** Free (self-hosted) or $20/mo (cloud)
- **Claude API:** ~$0.50/day for report generation (~$15/mo)
- **Slack:** Free
- **Other APIs:** Already paying for them
- **Total:** ~$15-35/month for automated BI

**Compare to:**
- Hiring analyst: $5,000+/month
- BI tools (Mixpanel, Amplitude): $200-1,000/month

**ROI: Massive** 🚀

---

## Support

**Stuck?** Check N8N logs:
- In UI: Click on failed node → View details
- In terminal: Check console output

**Want help?** Drop a message and I'll debug with you.

---

**Next:** Once this is running, let's generate your first 10 pieces of content! 🎉
