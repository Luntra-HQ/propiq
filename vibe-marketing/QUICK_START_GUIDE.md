# PropIQ Vibe Marketing - Quick Start Guide

**Get your first automated workflow running in 15 minutes**

---

## What You're Getting

I've set up **Workflow #5: Daily Business Intelligence Dashboard** - the most autonomous vibe marketing workflow that requires minimal intervention from you.

### What It Does

Every morning at 9 AM, you'll get a Slack message (or email) with:
- 💰 Revenue metrics (Stripe)
- 👥 User activity (MongoDB)
- 🤖 AI performance (Weights & Biases)
- 📈 Website analytics (Microsoft Clarity)
- 🎯 AI-generated insights and action items

### Why This Workflow First?

✅ All data sources already exist in your stack
✅ Provides immediate business value
✅ Runs 100% automatically (zero maintenance)
✅ Teaches you how vibe marketing works
✅ Foundation for more advanced workflows

---

## Files You Have

```
propiq/vibe-marketing/
├── QUICK_START_GUIDE.md          ← You are here
├── DAILY_INTELLIGENCE_WORKFLOW.md ← Full workflow setup (3 options)
└── PROMPT_TEMPLATES.md            ← 30+ ready-to-use prompts
```

---

## Option 1: String.com (RECOMMENDED - Easiest)

**Time to setup:** 10 minutes
**Technical skill:** None required
**Cost:** Free tier

### Steps

1. **Sign up for String.com**
   - Go to https://string.com
   - Sign up with email
   - Free tier is perfect to start

2. **Create New Workflow**
   - Click "New Workflow"
   - Name: "PropIQ Daily Intelligence"
   - Schedule: Daily at 9:00 AM EST

3. **Copy the Prompt**
   - Open `DAILY_INTELLIGENCE_WORKFLOW.md`
   - Find "Step 3: Copy This Prompt to String"
   - Copy entire prompt
   - Paste into String.com

4. **Add Your API Keys**
   - In String.com, add these environment variables:

   | Variable | Where to Get It |
   |----------|----------------|
   | `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys |
   | `MONGODB_URI` | MongoDB Atlas → Connect String |
   | `WANDB_API_KEY` | wandb.ai → Settings → API Keys |
   | `SLACK_WEBHOOK_URL` | Slack → Apps → Incoming Webhooks |

5. **Test & Activate**
   - Click "Test Run"
   - Check your Slack for the report
   - Click "Activate" to schedule daily

**Done!** ✅ You'll get your first automated report tomorrow at 9 AM.

---

## Option 2: Python Script (For Developers)

**Time to setup:** 15 minutes
**Technical skill:** Basic Python
**Cost:** Free (run on your server)

### Steps

1. **Copy the Script**
   - Open `DAILY_INTELLIGENCE_WORKFLOW.md`
   - Scroll to "Alternative: Simple Python Script"
   - Save as `daily_intelligence.py` in your propiq folder

2. **Install Dependencies**
   ```bash
   pip install requests pymongo anthropic stripe wandb
   ```

3. **Set Environment Variables**
   ```bash
   export STRIPE_SECRET_KEY="sk_live_REDACTED"
   export MONGODB_URI="mongodb+srv://REDACTED
   export WANDB_API_KEY="xxx"
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/xxx"
   export ANTHROPIC_API_KEY="your_claude_api_key"
   ```

4. **Test Run**
   ```bash
   python3 daily_intelligence.py
   ```

5. **Schedule with Cron**
   ```bash
   crontab -e
   # Add this line:
   0 9 * * * cd /path/to/propiq && python3 daily_intelligence.py
   ```

**Done!** ✅ Script runs automatically every day at 9 AM.

---

## Option 3: N8N Workflow (Most Powerful)

**Time to setup:** 20 minutes
**Technical skill:** Intermediate (workflow builder experience)
**Cost:** Free (self-hosted) or $20/mo (cloud)

### Steps

1. **Setup N8N**
   - Self-hosted: `npx n8n` (runs locally)
   - Cloud: Sign up at https://n8n.io

2. **Import Workflow**
   - Open `DAILY_INTELLIGENCE_WORKFLOW.md`
   - Find "N8N JSON Workflow (Import This)"
   - Copy JSON
   - In N8N: Workflows → Import from JSON

3. **Configure Nodes**
   - Click each node
   - Add your API credentials
   - Test individual nodes

4. **Activate Workflow**
   - Click "Activate" toggle
   - Verify schedule (9 AM daily)

**Done!** ✅ N8N will run the workflow automatically.

---

## What Happens Next?

### Day 1: You Get Your First Report
Check Slack at 9 AM. You should see:
```
📊 PropIQ Daily Health Report - January 15, 2025

💰 REVENUE (Last 24h)
- New customers: 3 ($237 MRR)
...
```

### Day 2-7: Monitor & Adjust
- Is the data accurate? (Check against Stripe dashboard)
- Any errors? (Check String.com/N8N logs)
- Want more metrics? (Edit the prompt)

### Week 2: Expand Your Vibe Marketing

Once the daily report is running smoothly, pick your next workflow:

**Workflow Options:**
1. ✅ **Daily Intelligence** (Done!)
2. 🎯 **Reddit-to-Content Machine** (Auto-generate blog posts from Reddit pain points)
3. 📧 **One-Click Investor CRM** (Auto-research prospects with one button)
4. 🎬 **AI Video Generator** (Create PropIQ demo videos automatically)
5. 🤖 **AI Persona on Website** (Tavus video chat for visitors)
6. 📱 **Email-from-Video Automation** (Capture emails from social content)

**Which one next?** Just let me know and I'll set it up.

---

## Using the Prompt Templates

You also have **30+ ready-to-use prompts** in `PROMPT_TEMPLATES.md`:

### Quick Wins You Can Do Today (No automation needed)

**1. Generate LinkedIn Post (5 min)**
- Open `PROMPT_TEMPLATES.md`
- Copy "LinkedIn Post Generator" prompt
- Paste into Claude
- Fill in {{TOPIC}} (e.g., "Why the 1% rule is outdated")
- Get a ready-to-post LinkedIn article

**2. Create Twitter Thread (5 min)**
- Use "X/Twitter Thread Generator" prompt
- Topic: "How I analyze properties in 30 seconds"
- Get viral thread ready to post

**3. Write Cold Email (3 min)**
- Use "Personalized Cold Email Generator"
- Find investor on LinkedIn
- Generate custom outreach email

**4. Mine Reddit for Ideas (10 min)**
- Browse r/realestateinvesting
- Copy 10 interesting posts
- Use "Reddit Pain Point Miner" prompt
- Get content ideas for the week

---

## Troubleshooting

### "My Slack webhook isn't working"
**Solution:**
1. Go to Slack → Apps → Incoming Webhooks
2. Create new webhook (select channel)
3. Copy URL (starts with `https://hooks.slack.com/`)
4. Update in String.com / N8N / script

### "MongoDB connection timeout"
**Solution:**
1. MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add "0.0.0.0/0" (allow all) for testing
4. Click "Confirm"

### "Stripe API error: Invalid API key"
**Solution:**
1. Stripe Dashboard → Developers → API Keys
2. Copy "Secret key" (starts with `sk_live_REDACTED`)
3. Make sure you're using LIVE keys (not test keys)

### "No data showing in report"
**Solution:**
- Check API keys are correct
- Verify you have data in last 24h (try extending to 7 days for testing)
- Check String.com/N8N logs for specific errors

### "Report has wrong timezone"
**Solution:**
- Update schedule to match your timezone
- In String.com: Edit workflow → Change schedule
- In Python/N8N: Adjust cron timing

---

## Success Metrics

Track these to measure your vibe marketing ROI:

**Week 1:**
- ✅ Daily report running automatically
- ✅ Team checking report daily
- ✅ 1-2 actionable insights acted on

**Week 2-4:**
- 📈 Added 2-3 more automated workflows
- 📧 Email list growing by 50+/week
- 📱 Social content posted 3x/week (automated)

**Month 2-3:**
- 🚀 100+ qualified leads/month
- 💰 First customers from vibe marketing campaigns
- ⏰ 10+ hours/week saved on manual marketing tasks

---

## Next Steps

### Immediate (Today)
1. ✅ Choose Option 1, 2, or 3 above
2. ✅ Set up Daily Intelligence workflow (15 min)
3. ✅ Test run to verify it works

### This Week
1. Generate 5 pieces of content using prompts in `PROMPT_TEMPLATES.md`
2. Post to LinkedIn, X, Reddit
3. Monitor which topics get best engagement

### Next Week
1. Tell me which workflow you want next
2. I'll set it up for you
3. Keep building your vibe marketing engine

---

## Resources

**Documentation:**
- `DAILY_INTELLIGENCE_WORKFLOW.md` - Full workflow setup guide (3 implementation options)
- `PROMPT_TEMPLATES.md` - 30+ ready-to-use prompts for content, ads, outreach

**Tools:**
- String.com - https://string.com (easiest option)
- N8N - https://n8n.io (most powerful option)
- Claude Code - You're already using it!

**Learning:**
- Greg Isenberg's Vibe Marketing tutorials (in `vibemarketingtutorials.md`)
- Boring Marketer on X - Real-time vibe marketing workflows
- String.com examples - Browse their template library

---

## Questions?

**Common Questions:**

**Q: Do I need all these tools?**
A: Nope! Start with just String.com for the daily report. Add more as you scale.

**Q: Can I customize the daily report?**
A: Yes! Edit the prompt to add/remove metrics. Want cohort analysis? Add it to the prompt.

**Q: How much does this cost?**
A:
- String.com: Free tier
- Claude API: ~$0.50/day for reports
- N8N: Free (self-hosted)
- Total: Under $20/month

**Q: What if I get stuck?**
A: Just ask me! Reply here or ping me in Slack. I'll help you debug.

**Q: Which workflow should I build next?**
A: After the daily report is running, I recommend:
1. **Reddit-to-Content Machine** (if you want content ideas)
2. **One-Click CRM** (if you're doing outreach)
3. **AI Video Generator** (if you want viral social content)

---

## Final Checklist

Before you finish today, make sure you:

- [ ] Chose Option 1, 2, or 3 for Daily Intelligence
- [ ] Gathered all API keys (Stripe, MongoDB, W&B, Slack)
- [ ] Set up the workflow (15 min)
- [ ] Ran a test to verify it works
- [ ] Scheduled it to run daily at 9 AM
- [ ] Bookmarked `PROMPT_TEMPLATES.md` for content generation

**Once you're done, you'll have your first vibe marketing workflow running fully automated!** 🎉

---

**Tomorrow at 9 AM:** Check your Slack for your first automated business intelligence report.

**Questions?** Just ask - I'm here to help you scale PropIQ with vibe marketing! 🚀
