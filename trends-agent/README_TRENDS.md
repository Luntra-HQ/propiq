# 📈 PropIQ Google Trends Monitor

Autonomous real estate trend detection system that sends Slack/Email alerts when relevant topics are trending on Google.

## 🎯 What This Does

This agent automatically monitors Google Trends for real estate investing keywords and sends you notifications via **Slack and Email** when relevant topics are trending. Perfect for:

- **Content strategy** - Know what topics to write about
- **SEO optimization** - Target trending keywords
- **Market insights** - Understand what investors are searching for
- **Competitive intelligence** - Stay ahead of trends

**Autonomy Level:** 95%
- **Agent does:** Monitors trends daily/weekly, filters for relevance, sends alerts
- **You do:** Review alerts, decide which trends to act on (5 minutes/week)

---

## 🔑 Key Features

### 1. **Real Estate Keyword Monitoring**

Monitors 20+ real estate investing keywords including:
- Core terms: real estate, rental property, investment property
- Metrics: cap rate, cash flow, rental income, ROI
- Tools: property calculator, real estate calculator
- Platforms: Zillow, Redfin, Realtor
- And more...

### 2. **Multi-Channel Notifications**

**Slack Alerts:**
- Rich formatted messages with trend details
- Keyword match information
- Actionable suggestions (blog posts, ads, SEO)
- Direct link to generate blog content

**Email Alerts:**
- Professional HTML emails
- Complete trend list with styling
- Action recommendations
- Mobile-friendly design

### 3. **Automated Monitoring**

Set it and forget it:
- **Daily** - Check trends every morning at 9 AM
- **Weekly** - Monday morning trend digest
- **Bi-weekly** - Twice per month check

### 4. **Trend History Tracking**

- Saves all detected trends to JSON file
- Track what was trending when
- Analyze patterns over time
- Never miss an opportunity

---

## 🚀 Quick Start (10 Minutes)

### Step 1: Run Setup

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/trends-agent
./setup_trends_monitor.sh
```

**Setup will:**
- Install dependencies (google-adk, bigquery, requests)
- Check Google Cloud authentication
- Auto-detect Slack webhook from creator-automation
- Auto-detect SendGrid key from backend
- Create .env configuration file
- Offer to run test check

### Step 2: Configure Notifications

The setup script tries to auto-configure from existing systems, but verify:

**For Slack (from creator-automation):**
```bash
# Webhook is auto-detected from:
# ../creator-automation/posting-schedule.json

# Or manually set in .env:
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

**For Email (from backend):**
```bash
# SendGrid key is auto-detected from:
# ../backend/.env

# Or manually set in .env:
SENDGRID_API_KEY="your-sendgrid-api-key"
ALERT_EMAIL="your-email@example.com"
```

### Step 3: Test It

```bash
python3 propiq_trends_monitor.py --weeks 1
```

Check your Slack channel and email - you should see a trends alert if any real estate topics are trending!

### Step 4: Set Up Automation

```bash
# For daily monitoring (9 AM every day)
./setup_automation.sh daily

# For weekly monitoring (9 AM every Monday)
./setup_automation.sh weekly

# For bi-weekly monitoring (9 AM on 1st and 15th)
./setup_automation.sh biweekly
```

---

## 📋 How It Works

### Architecture

```
propiq_trends_monitor.py
├── TrendsMonitor class
│   ├── check_trends()          → Query Google Trends via BigQuery
│   ├── filter_trends()         → Match against real estate keywords
│   ├── send_slack_notification → Rich Slack message
│   ├── send_email_notification → HTML email
│   └── save_trends_history()   → JSON file logging
│
└── Uses Google Trends Agent
    ├── TrendsQueryGeneratorAgent → Generates BigQuery SQL
    └── TrendsQueryExecutorAgent  → Executes query, returns trends
```

### The Process

1. **Query Google Trends** - Fetches top 50 trending terms for past week(s)
2. **Filter for Real Estate** - Matches trends against 20+ keywords
3. **Format Notifications** - Creates rich Slack/Email alerts
4. **Send Alerts** - Delivers via Slack webhook + SendGrid
5. **Log History** - Saves to trends_history.json

### Example Workflow

**Monday 9:00 AM** (automated)
- Agent queries Google Trends for past week
- Finds "rental property calculator" is trending
- Sends Slack notification with details
- Sends email backup alert

**Monday 9:05 AM** (you)
- See Slack notification
- Click link to generate blog post
- Blog Writer Agent creates "How to Use a Rental Property Calculator"

**Monday 9:30 AM** (published)
- Blog post live
- Social media scheduled
- SEO optimized for trending keyword

**Result:** Rode the trend wave while it's hot! 🏄

---

## 📊 Monitored Keywords

### Core Real Estate Terms
- real estate
- rental property
- investment property
- property investing
- real estate investing

### Financial Metrics
- cap rate
- cash flow
- rental income
- property analysis
- ROI property

### Market Conditions
- housing market
- real estate market
- property prices
- home prices

### Tools & Resources
- property calculator
- real estate calculator
- investment calculator
- rental calculator

### Investor Terms
- landlord
- real estate investor
- property management
- rental analysis

### Platforms
- zillow
- redfin
- realtor

**Total: 20+ keywords monitored**

---

## 🎨 Notification Examples

### Slack Notification

```
📈 3 Real Estate Topics Trending on Google

Detected: November 6, 2025 at 9:00 AM

─────────────────────────────

1. Rental Property Calculator
   Match keyword: rental calculator

2. Cap Rate Analysis
   Match keyword: cap rate

3. Real Estate Investing Guide
   Match keyword: real estate investing

─────────────────────────────

💡 Suggested Actions:
• Create blog post about trending topic
• Generate social media content
• Update PropIQ landing page keywords
• Run targeted Google Ads campaign

🤖 Auto-generate blog post:
cd ~/Projects/LUNTRA/LUNTRA\ MVPS/propiq/blog-writer-agent && ./run_blog_generation.sh
```

### Email Notification

Professional HTML email with:
- 📈 Header with gradient banner
- 📋 Formatted trend list with match keywords
- 💡 Action recommendations
- 🔗 Call-to-action button to PropIQ
- 📅 Timestamp and branding

---

## 💻 Command Line Usage

### Basic Usage

```bash
# Check trends for past week (US)
python3 propiq_trends_monitor.py

# Check trends for past 2 weeks
python3 propiq_trends_monitor.py --weeks 2

# Check specific region
python3 propiq_trends_monitor.py --region "United Kingdom"

# Save trends to history file
python3 propiq_trends_monitor.py --save-history
```

### Notification Control

```bash
# Slack only (no email)
python3 propiq_trends_monitor.py --no-email

# Email only (no Slack)
python3 propiq_trends_monitor.py --no-slack

# Neither (just print to terminal)
python3 propiq_trends_monitor.py --no-slack --no-email
```

### Advanced Options

```bash
# Custom Slack webhook
python3 propiq_trends_monitor.py --slack-webhook "https://hooks.slack.com/..."

# Custom email
python3 propiq_trends_monitor.py --email "custom@example.com"

# Full customization
python3 propiq_trends_monitor.py \
  --region "Canada" \
  --weeks 3 \
  --save-history \
  --email "brian@propiq.com"
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Google Cloud (auto-configured)
GOOGLE_CLOUD_PROJECT="newagent-fgks"
GOOGLE_CLOUD_LOCATION="us-central1"

# Slack (auto-detected from creator-automation)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# SendGrid (auto-detected from backend)
SENDGRID_API_KEY="SG.xxxxx"
ALERT_EMAIL="your-email@example.com"

# Monitoring settings
MONITOR_REGION="United States"
MONITOR_WEEKS=1
SAVE_HISTORY=true
```

### Customizing Keywords

Edit `propiq_trends_monitor.py` to add/remove keywords:

```python
PROPIQ_KEYWORDS = [
    # Add your custom keywords here
    "your custom term",
    "another keyword",
    # ...
]
```

---

## 🔄 Automation Setup

### Daily Monitoring

```bash
./setup_automation.sh daily
```

**Schedule:** Every day at 9:00 AM
**Use case:** High-volume content strategy, stay on top of fast-moving trends

### Weekly Monitoring

```bash
./setup_automation.sh weekly
```

**Schedule:** Every Monday at 9:00 AM
**Use case:** Weekly content planning, manageable alert frequency (recommended)

### Bi-weekly Monitoring

```bash
./setup_automation.sh biweekly
```

**Schedule:** 1st and 15th of month at 9:00 AM
**Use case:** Low-frequency checks, focus on major trends

### Checking Automation Status

**macOS (launchd):**
```bash
# Check if job is running
launchctl list | grep trendsmonitor

# View logs
tail -f launchd.log

# Manually trigger
launchctl start com.propiq.trendsmonitor

# Disable
launchctl unload ~/Library/LaunchAgents/com.propiq.trendsmonitor.plist
```

**Linux (cron):**
```bash
# View cron jobs
crontab -l

# View logs
tail -f cron.log

# Edit cron
crontab -e
```

---

## 📁 File Structure

```
trends-agent/
├── propiq_trends_monitor.py    # Main monitoring script
├── setup_trends_monitor.sh     # Setup wizard
├── setup_automation.sh         # Automation configuration
├── .env.example               # Environment template
├── .env                       # Your configuration (git-ignored)
├── README_TRENDS.md           # This file
│
├── google_trends_agent/       # ADK Google Trends Agent
│   ├── agent.py               # Agent orchestration
│   ├── tools.py               # BigQuery tools
│   └── prompt.py              # Agent instructions
│
├── trends_history.json        # Detected trends log (auto-created)
├── launchd.log               # macOS automation logs
└── cron.log                  # Linux automation logs
```

---

## 🔗 Integration with Blog Writer

The trends monitor works seamlessly with the Blog Writer Agent:

### Automated Content Pipeline

1. **Trends Monitor** (Monday 9 AM) - Detects "cap rate calculator" trending
2. **Slack Alert** (Monday 9:01 AM) - You see notification
3. **Blog Writer** (Monday 9:10 AM) - Generate blog post about cap rates
4. **Published** (Monday 10 AM) - Blog live, riding the trend wave

### Quick Integration Command

Slack notification includes ready-to-run command:

```bash
cd ~/Projects/LUNTRA/LUNTRA\ MVPS/propiq/blog-writer-agent && ./run_blog_generation.sh
```

Just add a custom topic about the trending term!

---

## 📈 Use Cases

### 1. Content Strategy

**Problem:** Don't know what to write about
**Solution:** Get weekly trend alerts, write about what's hot

**Example:**
- Trend detected: "rental property taxes"
- Blog Writer generates: "Ultimate Guide to Rental Property Tax Deductions"
- Result: SEO-optimized content for trending topic

### 2. SEO Optimization

**Problem:** Targeting wrong keywords
**Solution:** Focus SEO on actually trending terms

**Example:**
- Trend detected: "cap rate vs cash-on-cash return"
- Update PropIQ landing page meta tags
- Result: Better search rankings for hot keywords

### 3. Google Ads Campaigns

**Problem:** Ads targeting low-volume keywords
**Solution:** Launch campaigns for trending terms

**Example:**
- Trend detected: "real estate calculator"
- Launch Google Ads campaign
- Result: Lower CPC, higher conversion rate

### 4. Social Media Content

**Problem:** Social posts getting low engagement
**Solution:** Post about what's trending now

**Example:**
- Trend detected: "housing market crash"
- Twitter thread: "Is the housing market crashing? Here's what investors need to know"
- Result: Higher engagement, more followers

---

## 🎯 Performance Metrics

After 4 weeks of monitoring:

**Trend Detection:**
- [ ] Trends monitored: ~4 weeks
- [ ] Relevant trends detected: X
- [ ] Alerts sent: X (Slack + Email)
- [ ] False positives: Y%

**Content Impact:**
- [ ] Blog posts created from trends: X
- [ ] Organic traffic increase: +X%
- [ ] SEO ranking improvements: X keywords
- [ ] Social media engagement: +X%

**Time Savings:**
- [ ] Manual trend research: 2-3 hours/week
- [ ] With automation: 5 minutes/week to review
- [ ] **Savings: ~10 hours/month**

---

## 🆘 Troubleshooting

### No Trends Detected

**Possible reasons:**
1. No real estate topics trending this week (normal)
2. Keywords too specific - consider broader terms
3. Region setting too narrow

**Solution:**
```bash
# Try broader region
python3 propiq_trends_monitor.py --region "Global"

# Try longer time period
python3 propiq_trends_monitor.py --weeks 2
```

### Slack Notifications Not Sending

**Check:**
```bash
# Test webhook
curl -X POST -H 'Content-Type: application/json' \
  -d '{"text":"Test from PropIQ Trends Monitor"}' \
  $SLACK_WEBHOOK_URL

# Check .env file
cat .env | grep SLACK_WEBHOOK_URL
```

### Email Notifications Not Sending

**Check:**
```bash
# Test SendGrid key
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json'

# Check .env file
cat .env | grep SENDGRID_API_KEY
```

### BigQuery Authentication Error

**Solution:**
```bash
# Re-authenticate
gcloud auth application-default login

# Set quota project
gcloud auth application-default set-quota-project newagent-fgks
```

### Automation Not Running

**macOS:**
```bash
# Reload launchd job
launchctl unload ~/Library/LaunchAgents/com.propiq.trendsmonitor.plist
launchctl load ~/Library/LaunchAgents/com.propiq.trendsmonitor.plist

# Check logs
tail -f launchd-error.log
```

**Linux:**
```bash
# Check cron service
systemctl status cron

# View cron logs
grep CRON /var/log/syslog
```

---

## 🔮 Future Enhancements

### Phase 1 (Current):
- ✅ Google Trends monitoring
- ✅ Slack notifications
- ✅ Email notifications
- ✅ Automated scheduling
- ✅ Trend history logging

### Phase 2 (Next Month):
- [ ] **Trend velocity tracking** - Detect fast-rising trends
- [ ] **Competitive analysis** - Compare to competitor keywords
- [ ] **Auto-blog generation** - Trigger Blog Writer automatically
- [ ] **Performance analytics** - Track which trends drove traffic

### Phase 3 (3 Months):
- [ ] **Multi-region monitoring** - US, UK, Canada, Australia
- [ ] **Custom alert rules** - "Only notify if trend > 100% increase"
- [ ] **Trend predictions** - ML model to predict next trends
- [ ] **Dashboard UI** - Web interface for trend visualization

---

## 💡 Pro Tips

### 1. **Start Weekly, Scale to Daily**

Begin with weekly monitoring to avoid alert fatigue. Once you have a content workflow, scale to daily.

### 2. **Track Your Winners**

Save trends_history.json and note which trended topics you acted on. Measure traffic impact.

### 3. **Combine with Blog Writer**

Set up this workflow:
- Monday 9 AM: Trends alert
- Monday 9:30 AM: Generate blog post
- Monday 10 AM: Publish
- Tuesday: Social media posts

### 4. **Use for Google Ads**

When a trend is detected, immediately launch a Google Ads campaign. Ride the trend wave with paid traffic too.

### 5. **Create a Trend Swipe File**

Even if you don't act on a trend immediately, save it. Patterns emerge over time.

---

## 📚 Resources

### Documentation
- [Google Trends BigQuery Dataset](https://console.cloud.google.com/marketplace/product/bigquery-public-datasets/google-search-trends)
- [ADK Documentation](https://google.github.io/adk-docs/)
- [Slack Webhooks Guide](https://api.slack.com/messaging/webhooks)
- [SendGrid API Docs](https://docs.sendgrid.com/api-reference/)

### Related Systems
- **Blog Writer Agent** - `/propiq/blog-writer-agent/`
- **Creator Automation** - `/propiq/creator-automation/`
- **Backend SendGrid** - `/propiq/backend/` (email setup)

---

## 🚀 Quick Start Reminder

**Get started in 3 commands:**

```bash
# 1. Setup
./setup_trends_monitor.sh

# 2. Test
python3 propiq_trends_monitor.py --weeks 1

# 3. Automate
./setup_automation.sh weekly
```

Then check your Slack for trend alerts every Monday! 📈

---

**Created:** 2025-11-06
**Status:** ✅ Ready for production
**Autonomy:** 95% automated
**Integration:** Works with Blog Writer Agent
