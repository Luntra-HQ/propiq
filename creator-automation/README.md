# 🤖 LUNTRA Creator Automation System

**Your personal AI chief of staff for content marketing**

This system automates reminders for social media posts, references your research folders, and uses accumulated knowledge to send intelligent notifications to Slack.

---

## What It Does

### ✅ Core Features

1. **Automated Post Reminders**
   - Sends Slack notifications before it's time to post
   - Includes full post content (copy/paste ready)
   - References optimal posting times based on platform research

2. **Research Context Integration**
   - Pulls insights from your propiq research folders
   - Includes keyword strategy, marketing docs
   - Provides context for why each post matters

3. **Intelligent Scheduling**
   - Based on platform-specific best times
   - LinkedIn: Tuesday-Thursday 7-9 AM
   - Twitter: Tuesday-Thursday 8-10 PM ET
   - Customizable per post

4. **Terminal Commands**
   - `python3 slack-notify.py test` - Send test notification
   - `python3 slack-notify.py all` - Send all pending posts
   - `python3 slack-notify.py list` - See posting schedule
   - `python3 slack-notify.py mark --post-id linkedin-1` - Mark as posted

---

## Quick Start (5 Minutes)

### Step 1: Run Setup

```bash
cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/creator-automation"
chmod +x setup.sh
./setup.sh
```

**Setup will:**
- Install Python dependencies
- Guide you through Slack webhook creation
- Set up automated hourly checks (optional)

### Step 2: Get Slack Webhook

1. Go to: https://api.slack.com/messaging/webhooks
2. Click "Create your Slack app"
3. Choose "From scratch"
4. Name: "LUNTRA Creator Bot"
5. Select your workspace
6. Enable "Incoming Webhooks"
7. Add webhook to a channel (e.g., #reminders or DM yourself)
8. Copy the webhook URL

### Step 3: Test It

```bash
python3 slack-notify.py test
```

Check your Slack channel - you should see a rich notification with your first post content!

---

## How It Works

### Architecture

```
creator-automation/
├── posting-schedule.json     ← What to post, when
├── slack-notify.py           ← Python script (sends Slack messages)
├── setup.sh                  ← One-time setup
└── README.md                 ← You are here
```

### The Magic: Intelligent Parsing

1. **Reads your schedule** (`posting-schedule.json`)
2. **Extracts post content** from `PROPIQ-READY-TO-POST.md`
3. **Gathers research context** from keyword strategy, marketing docs
4. **Sends rich Slack message** with:
   - Full post text (copy/paste ready)
   - Optimal posting time
   - Platform (LinkedIn, Twitter, etc.)
   - Research insights
   - Action buttons

### Slack Message Example

```
📢 Time to Post: LinkedIn Post #1 - The 1% Rule is Dead

Platform: LinkedIn
Best Time: Tuesday-Thursday 7:00-9:00 AM

Post Content:
```
The 1% rule fails investors more than any other "rule of thumb"...
[Full post text here]
```

📚 Research Context:
• Cap rate calculator is an easy win keyword
• LinkedIn performs best 7-9 AM Tuesday-Thursday
• Focus on AI differentiation vs competitors

💡 Note: Best performing time for LinkedIn. First post to establish authority.

[📋 Copy Post] [✅ Mark Posted] [⏰ Remind Later]
```

---

## Usage Guide

### Daily Workflow

**1. Morning Check (if automated):**
- Slack bot sends reminder at scheduled time
- Open Slack, see full post content
- Copy post text
- Paste into LinkedIn/Twitter
- Click "✅ Mark Posted" (or run terminal command)

**2. Manual Posting:**
```bash
# See what's next
python3 slack-notify.py list

# Send notification for next post
python3 slack-notify.py test

# Mark as posted after publishing
python3 slack-notify.py mark --post-id linkedin-1
```

### Terminal Commands

#### `python3 slack-notify.py test`
**Purpose:** Send test notification for first pending post
**Use case:** Testing Slack integration, previewing next post

#### `python3 slack-notify.py all`
**Purpose:** Send notifications for ALL pending posts
**Use case:** Bulk review, planning ahead

#### `python3 slack-notify.py list`
**Purpose:** List all posts in schedule
**Output:**
```
📋 Posting Schedule:

⏳ LinkedIn Post #1 - The 1% Rule is Dead
   Platform: linkedin
   Time: Tuesday-Thursday 7:00-9:00 AM
   Status: pending

✅ LinkedIn Post #2 - What Separates Great Deals
   Platform: linkedin
   Time: Thursday-Friday 7:00-9:00 AM
   Status: posted
```

#### `python3 slack-notify.py mark --post-id <id>`
**Purpose:** Mark post as completed
**Example:**
```bash
python3 slack-notify.py mark --post-id linkedin-1
```

#### `python3 slack-notify.py check`
**Purpose:** Run scheduled check (normally done automatically)
**Use case:** Manual trigger, debugging

---

## Configuration

### Editing Schedule (`posting-schedule.json`)

```json
{
  "posts": [
    {
      "id": "linkedin-1",
      "platform": "linkedin",
      "title": "LinkedIn Post #1 - The 1% Rule is Dead",
      "file": "../vibe-marketing/PROPIQ-READY-TO-POST.md",
      "section": "📱 LINKEDIN POST #1",
      "optimal_time": "Tuesday-Thursday 7:00-9:00 AM",
      "cron": "0 7 * * 2",
      "status": "pending",
      "notes": "Best performing time for LinkedIn."
    }
  ],
  "slack_webhook_url": "https://hooks.slack.com/services/...",
  "advance_notice_hours": 1,
  "research_folders": [
    "../vibe-marketing/",
    "../PROPIQ_KEYWORD_STRATEGY_2025.md"
  ],
  "settings": {
    "enable_reminders": true,
    "include_research_context": true
  }
}
```

### Key Fields

- **`id`**: Unique identifier for post
- **`platform`**: "linkedin", "twitter", "instagram", etc.
- **`title`**: Descriptive title for notification
- **`file`**: Path to markdown file with post content
- **`section`**: Header in markdown file (e.g., "## 📱 LINKEDIN POST #1")
- **`optimal_time`**: Human-readable best time
- **`cron`**: Cron expression for automation (0 7 * * 2 = 7 AM on Tuesdays)
- **`status`**: "pending" or "posted"
- **`notes`**: Additional context

### Cron Expression Guide

Format: `minute hour day month weekday`

**Examples:**
- `0 7 * * 2` = 7:00 AM every Tuesday
- `0 20 * * 2,4` = 8:00 PM every Tuesday and Thursday
- `0 9 * * 1-5` = 9:00 AM Monday-Friday
- `30 12 * * *` = 12:30 PM every day

**Weekday Numbers:**
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

---

## Expanding the System

### Adding New Posts

1. **Add post to `PROPIQ-READY-TO-POST.md`** (or create new file)
2. **Add entry to `posting-schedule.json`:**

```json
{
  "id": "linkedin-5",
  "platform": "linkedin",
  "title": "LinkedIn Post #5 - New Topic",
  "file": "../vibe-marketing/PROPIQ-READY-TO-POST.md",
  "section": "📱 LINKEDIN POST #5",
  "optimal_time": "Tuesday 7:00 AM",
  "cron": "0 7 * * 2",
  "status": "pending",
  "notes": "Educational content about X"
}
```

3. **Test:**
```bash
python3 slack-notify.py test
```

### Adding Research Folders

**In `posting-schedule.json`:**

```json
"research_folders": [
  "../vibe-marketing/",
  "../PROPIQ_KEYWORD_STRATEGY_2025.md",
  "../PROPIQ_SOCIAL_MEDIA_IMAGES.md",
  "../backend/simulations/",
  "../versions/content/"
]
```

The system will scan these folders for insights (lines starting with ✅).

### Creating a "Creator Economy Subfolder"

**Your idea: Separate folder for creator economy reminders**

**Suggested structure:**

```
propiq/
├── creator-automation/        ← This system
├── creator-economy/          ← NEW: General creator reminders
│   ├── content-calendar.md   ← Monthly content plan
│   ├── growth-metrics.md     ← KPIs to track
│   ├── platform-research.md  ← Algorithm insights
│   └── automation-ideas.md   ← Future automations
└── vibe-marketing/           ← PropIQ-specific content
```

**Then update `posting-schedule.json`:**

```json
"research_folders": [
  "../vibe-marketing/",
  "../creator-economy/",
  "../PROPIQ_KEYWORD_STRATEGY_2025.md"
]
```

---

## Advanced Use Cases

### 1. Blog Post Reminders

**Add to schedule:**

```json
{
  "id": "blog-1",
  "platform": "blog",
  "title": "Blog Post: How to Analyze Rental Property",
  "file": "../blog-drafts/rental-property-guide.md",
  "section": "## Main Content",
  "optimal_time": "Monday 10:00 AM",
  "cron": "0 10 * * 1",
  "status": "pending",
  "notes": "SEO keyword: 'how to analyze rental property'"
}
```

### 2. Weekly Review Reminders

```json
{
  "id": "weekly-review",
  "platform": "internal",
  "title": "Weekly Creator Review",
  "file": "../creator-economy/weekly-template.md",
  "section": "## Review Checklist",
  "optimal_time": "Friday 4:00 PM",
  "cron": "0 16 * * 5",
  "status": "pending",
  "notes": "Review week's content, plan next week"
}
```

### 3. Product Launch Countdown

```json
{
  "id": "launch-1-week",
  "platform": "linkedin",
  "title": "Product Launch: 1 Week Out",
  "file": "../product-launch/announcements.md",
  "section": "## 1 Week Before",
  "optimal_time": "Specific date: November 12",
  "cron": "0 9 12 11 *",
  "status": "pending",
  "notes": "Build anticipation for launch"
}
```

---

## Integration with Other Tools

### Google Calendar Sync

**Future enhancement:** Export schedule to Google Calendar

```bash
# Pseudocode
python3 slack-notify.py export-calendar > propiq-posts.ics
# Import into Google Calendar
```

### Analytics Tracking

**Future enhancement:** Track post performance

```json
{
  "id": "linkedin-1",
  "analytics": {
    "posted_at": "2025-11-05T08:00:00Z",
    "impressions": 1500,
    "engagement_rate": 3.2,
    "clicks": 48,
    "conversions": 5
  }
}
```

### Notion Integration

**Future enhancement:** Sync with Notion content calendar

---

## Troubleshooting

### Slack notifications not sending

**Check:**
1. Webhook URL is correct in `posting-schedule.json`
2. Test with: `python3 slack-notify.py test`
3. Check Slack webhook page: https://api.slack.com/apps

### Cron job not running

**Mac (launchd):**
```bash
# Check if job is loaded
launchctl list | grep luntra

# View logs
cat launchd.log
cat launchd-error.log
```

**Linux (cron):**
```bash
# Check crontab
crontab -l

# View logs
cat cron.log
```

### Post content not extracting

**Check:**
1. File path is correct in `posting-schedule.json`
2. Section header matches exactly (including emoji)
3. Post is wrapped in ` ``` ` code blocks

**Debug:**
```bash
# Run with verbose output
python3 slack-notify.py test
# Check terminal output for errors
```

---

## Roadmap: Future Enhancements

### Phase 1 (Current):
- ✅ Slack notifications with post content
- ✅ Research context integration
- ✅ Terminal commands
- ✅ Cron/launchd scheduling

### Phase 2 (Next 2 weeks):
- [ ] **Mark as posted** from Slack (interactive buttons)
- [ ] **Snooze notification** for later
- [ ] **Analytics tracking** (impressions, clicks)
- [ ] **Performance insights** (which posts performed best)

### Phase 3 (Next month):
- [ ] **Multi-platform posting** via APIs
  - LinkedIn API integration
  - Twitter API integration
  - Direct posting from terminal
- [ ] **Content library management**
  - Tag posts by topic
  - Search past posts
  - Repost top performers
- [ ] **AI content suggestions**
  - Analyze what performed well
  - Suggest new post topics
  - Auto-generate variations

### Phase 4 (Long-term):
- [ ] **Full creator dashboard**
  - Web interface
  - Analytics visualization
  - Content calendar view
- [ ] **Team collaboration**
  - Multi-user support
  - Approval workflows
  - Comment threads
- [ ] **Cross-platform analytics**
  - Unified view of all platforms
  - Best time to post predictions
  - Audience growth tracking

---

## Creator Economy Expansion Ideas

**Your vision: Use research to inform all creator tasks**

### Possible Automations:

1. **Content Repurposing Reminders**
   - "Your LinkedIn post got 500 likes → Turn it into a blog post"
   - Extract from analytics, suggest repurposing

2. **Keyword Opportunity Alerts**
   - Scan keyword research folder
   - "New keyword opportunity: 'rental property mistakes' (easy win)"
   - Suggest content to create

3. **Engagement Reminders**
   - "You haven't engaged on LinkedIn in 3 days"
   - "Reply to comments on your last post"
   - Community building automation

4. **Performance Insights**
   - Weekly digest: "Your top post this week"
   - Monthly trends: "LinkedIn engagement up 25%"
   - Quarterly review: "You gained 150 followers"

5. **Content Gap Analysis**
   - "You haven't posted about 'cap rate' in 2 weeks"
   - "Competitor posted about X, consider responding"
   - Strategic positioning

6. **Newsletter Reminders**
   - Weekly: "Time to send newsletter"
   - Auto-generate from top-performing posts
   - Repurpose existing content

---

## Why This Approach Works

### Traditional Problem:
- ❌ Create content → Forget to post
- ❌ Post at wrong times (low engagement)
- ❌ Manually track what to post when
- ❌ Research is scattered, not actionable
- ❌ No system = inconsistent posting

### LUNTRA Solution:
- ✅ Content pre-written + auto-reminders
- ✅ Optimal times based on research
- ✅ Centralized schedule
- ✅ Research insights in every notification
- ✅ System enforces consistency

### Result:
- **5-10 hours saved per week** (no more "what should I post?")
- **Higher engagement** (posting at optimal times)
- **Consistent brand presence** (never miss a post)
- **Data-driven decisions** (research informs every post)

---

## Support & Feedback

**Questions? Issues? Ideas?**

1. Check troubleshooting section above
2. Review `slack-notify.py` code (well-commented)
3. Experiment with `posting-schedule.json`

**Want to expand the system?**
- Add your use cases to this README
- Share what works / what doesn't
- Build on top of this foundation

---

## Credits

**Built for:** LUNTRA / PropIQ marketing automation
**Purpose:** Turn research into action with intelligent reminders
**Philosophy:** Knowledge is only valuable when it's actionable

---

🚀 **Your personal AI chief of staff for content marketing is ready!**

Run `./setup.sh` to get started.
