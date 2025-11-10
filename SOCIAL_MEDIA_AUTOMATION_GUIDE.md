# PropIQ Social Media Automation - Complete System Guide

**Your terminal-first, CLI-powered social media engine**

This guide connects all the pieces: CLI tools + Content calendar + Slack automation + Research intelligence.

---

## System Overview

You now have 3 interconnected systems:

```
1. INTELLIGENCE GATHERING (Weekly)
   ↓ Social Media Examiner insights
   ↓ Algorithm updates
   ↓ Platform research

2. CONTENT PLANNING (Monthly)
   ↓ Multi-platform calendar
   ↓ Content pillars
   ↓ Repurposing strategy

3. POSTING AUTOMATION (Daily)
   ↓ CLI tools (LinkedIn, Instagram, YouTube)
   ↓ Slack reminders
   ↓ Automated scheduling
```

**Result:** 1.5-2 hours saved per week

---

## Folder Structure (Complete System)

```
propiq/
├── social-cli/                      ← NEW: Terminal posting tools
│   ├── propiq-cli.py               ← Main CLI script
│   ├── auto-post.py                ← Cron automation
│   ├── modules/
│   │   ├── linkedin.py             ← LinkedIn API
│   │   ├── instagram.py            ← Instagram Graph API
│   │   ├── youtube.py              ← YouTube Data API
│   │   ├── scheduler.py            ← Post scheduling
│   │   └── analytics.py            ← Performance tracking
│   ├── data/
│   │   ├── posts.db                ← Posted content history
│   │   └── scheduled_posts.db      ← Scheduled posts queue
│   ├── README.md
│   └── QUICK_START.md
│
├── creator-economy/                 ← Research & planning
│   ├── intelligence/               ← Weekly insights
│   │   └── SOCIAL_MEDIA_EXAMINER_2025-11-03.md
│   ├── playbooks/                  ← Platform guides
│   │   └── INSTAGRAM_REELS_PLAYBOOK.md
│   └── calendars/                  ← Content scheduling
│       └── NOVEMBER_2025_CONTENT_CALENDAR.md
│
├── creator-automation/              ← Slack reminders
│   ├── slack-notify.py
│   ├── posting-schedule.json
│   └── README.md
│
└── vibe-marketing/                  ← Ready-to-post content
    └── PROPIQ-READY-TO-POST.md
```

---

## How the Systems Work Together

### Monday Morning (Planning - 30 min)

**1. Gather Intelligence**
```bash
# Read Social Media Examiner newsletter (arrives Sunday)
# Extract key insights

cd propiq/creator-economy/intelligence
# Create SOCIAL_MEDIA_EXAMINER_2025-11-10.md
# Document 2-3 actionable tactics
```

**2. Review Analytics**
```bash
cd propiq/social-cli
python3 propiq-cli.py analytics all --days 7
```

**3. Adjust Calendar if Needed**
- Based on last week's performance
- Update creator-economy/calendars/NOVEMBER_2025_CONTENT_CALENDAR.md

---

### Wednesday (Production Day - 2-3 hours)

**1. Batch Create Instagram Reels**
- Follow playbook: `creator-economy/playbooks/INSTAGRAM_REELS_PLAYBOOK.md`
- Record all Reels for the week
- Edit in CapCut
- Export vertical 9:16 format

**2. Upload Videos to Cloud**
- Upload to publicly accessible URL (Cloudinary, S3, etc.)
- Copy URLs for CLI posting

**3. Pre-Schedule Week's Content**
```bash
cd propiq/social-cli

# Schedule Tuesday's LinkedIn post
python3 propiq-cli.py schedule linkedin "The 1% rule fails investors..." --date "2025-11-12 07:00"

# Schedule Tuesday's Instagram Reel
python3 propiq-cli.py schedule instagram-reel https://example.com/reel1.mp4 --date "2025-11-12 15:00" --caption "The 1% rule will cost you money"

# Schedule Tuesday's YouTube Short (cross-post)
python3 propiq-cli.py schedule youtube-short https://example.com/reel1.mp4 --date "2025-11-12 15:30" --caption "The 1% Rule is Dead | PropIQ"

# Schedule Thursday's posts
# ... repeat for all week's content
```

---

### Daily (Posting - 5-15 min per platform)

**Option A: Automated (Recommended)**

Set up cron to auto-post:
```bash
# Add to crontab
crontab -e

# Run every hour
0 * * * * cd /path/to/social-cli && python3 auto-post.py >> logs/auto-post.log 2>&1
```

Posts will publish automatically at scheduled times.

**Option B: Manual with Reminders**

Your Slack automation will remind you when it's time to post:

```bash
# When Slack reminds you at 7:00 AM for LinkedIn:
cd propiq/social-cli
python3 propiq-cli.py post linkedin "The 1% rule fails investors more than any other metric. Here's why..."

# When Slack reminds you at 3:00 PM for Instagram:
python3 propiq-cli.py post instagram-reel https://example.com/reel1.mp4 "The 1% rule will cost you money. Here's why 👇"

# Wait 2-3 hours, then manually share to Stories
# (Can't automate this - Instagram algorithm requires manual timing)
```

**Post-Publishing (First Hour - Critical)**
- Engage with comments immediately
- Instagram: Like first 5-10 comments
- LinkedIn: Respond to all comments
- This signals engagement to the algorithm

---

## Complete Weekly Workflow

### Monday (Planning)
- [ ] Read Social Media Examiner newsletter (15 min)
- [ ] Extract insights → Update intelligence folder
- [ ] Review last week's analytics via CLI
- [ ] Adjust content calendar if needed

### Wednesday (Production)
- [ ] Record all Instagram Reels for the week (1-2 hours)
- [ ] Edit in CapCut
- [ ] Upload to cloud storage
- [ ] Schedule all posts via CLI (30 min)

### Tuesday (Posting Day)
- [ ] 7:00 AM - LinkedIn post publishes (automated or manual)
- [ ] Engage in first hour
- [ ] 3:00 PM - Instagram Reel publishes
- [ ] Engage in first hour
- [ ] **5:30 PM - Manually share Reel to Instagram Stories**
- [ ] 3:30 PM - YouTube Short publishes (automated)
- [ ] 8:00 PM - Post Twitter thread via Buffer

### Thursday (Posting Day)
- [ ] 7:00 AM - LinkedIn post publishes
- [ ] Engage in first hour
- [ ] 3:00 PM - Instagram Reel publishes
- [ ] Engage in first hour
- [ ] **5:30 PM - Manually share Reel to Stories**
- [ ] 3:30 PM - YouTube Short publishes

### Friday (Reflection)
- [ ] Check analytics for the week
- [ ] Note what performed best
- [ ] Plan next week's topics

---

## CLI Commands Cheat Sheet

### Post Immediately

```bash
# LinkedIn
python3 propiq-cli.py post linkedin "Your content"
python3 propiq-cli.py post linkedin "Content" --image /path/to/image.jpg

# Instagram Reel
python3 propiq-cli.py post instagram-reel https://url/video.mp4 "Caption"

# YouTube Short
python3 propiq-cli.py post youtube-short /path/to/video.mp4 "Title"
```

### Schedule Posts

```bash
# Schedule for specific date/time
python3 propiq-cli.py schedule linkedin "Content" --date "2025-11-12 07:00"
python3 propiq-cli.py schedule instagram-reel https://url/video.mp4 --date "2025-11-12 15:00" --caption "Caption"
```

### Analytics

```bash
# Get analytics for last 7 days
python3 propiq-cli.py analytics instagram --days 7
python3 propiq-cli.py analytics linkedin --days 7
python3 propiq-cli.py analytics all --days 7
```

### Batch Operations

```bash
# Schedule all posts from content calendar
python3 propiq-cli.py batch ../creator-economy/calendars/NOVEMBER_2025_CONTENT_CALENDAR.json
```

### Check Status

```bash
# Verify API connections
python3 propiq-cli.py status
```

---

## Platform-Specific Notes

### LinkedIn
- **Best time:** Tuesday-Thursday 7-9 AM ET
- **Automation:** Fully supported via CLI
- **Cost:** FREE
- **Engagement:** Respond to all comments within 24 hours

### Instagram Reels
- **Best time:** Tuesday-Thursday 3-5 PM ET
- **Automation:** Post via CLI, **manually** share to Stories after 2-3 hours
- **Cost:** FREE (requires Business/Creator account)
- **Critical:** Never share to Stories immediately (kills reach by 40-60%)

### YouTube Shorts
- **Best time:** Same as Instagram (3-5 PM ET)
- **Automation:** Fully supported via CLI
- **Cost:** FREE (10,000 API quota/day)
- **Tip:** Cross-post same video as Instagram Reel

### Twitter/X
- **Best time:** Tuesday-Thursday 8-10 PM ET
- **Automation:** Use Buffer ($6/mo) - Twitter API too expensive ($100/mo)
- **Cost:** $6-15/month (Buffer Essentials)

---

## Integration with Buffer (Twitter Only)

Since Twitter API costs $100/month, use Buffer for Twitter only:

### Setup Buffer

1. Sign up: https://buffer.com
2. Connect Twitter account
3. Subscribe to Essentials plan ($6/mo for 1 channel)

### Posting Flow

**For LinkedIn, Instagram, YouTube:**
→ Use CLI (free, full control)

**For Twitter:**
→ Use Buffer (cheap, official integration)

**Workflow:**
1. CLI posts to LinkedIn/Instagram/YouTube (automated)
2. Buffer posts to Twitter (pre-scheduled)
3. All platforms covered, minimal cost

---

## Cost Breakdown

| Tool | Monthly Cost | What It Does |
|------|--------------|--------------|
| **PropIQ Social CLI** | FREE | LinkedIn, Instagram, YouTube posting |
| **Buffer Essentials** | $6/mo | Twitter posting (1 channel) |
| **Slack automation** | FREE | Post reminders |
| **Total** | **$6/month** | All 4 platforms automated |

**vs. Traditional Approach:**
- Hootsuite: $99/month
- Buffer Team: $120/month
- Later: $80/month

**You save:** $74-114/month

---

## Troubleshooting

### CLI: "Module import failed"

```bash
cd propiq/social-cli
pip3 install -r requirements.txt
```

### CLI: "LinkedIn not configured"

```bash
python3 propiq-cli.py setup linkedin
```

Follow interactive prompts.

### CLI: "Instagram video processing failed"

- Video must be publicly accessible URL (not local file yet)
- Must be 9:16 aspect ratio (vertical)
- Must be under 90 seconds
- Must be MP4 or MOV format

Upload to Cloudinary/S3 first, then use URL.

### Slack automation not working

```bash
cd propiq/creator-automation
# Check if running
launchctl list | grep luntra

# View logs
cat launchd.log
cat launchd-error.log
```

---

## Next Steps

### This Week (Get Started)

**Day 1:**
- [ ] Set up LinkedIn CLI: `python3 propiq-cli.py setup linkedin`
- [ ] Test post: `python3 propiq-cli.py post linkedin "Testing!"`
- [ ] Set up Buffer for Twitter

**Day 2:**
- [ ] Set up Instagram CLI: `python3 propiq-cli.py setup instagram`
- [ ] Record first Instagram Reel (30 min)
- [ ] Upload to cloud storage

**Day 3:**
- [ ] Set up YouTube CLI: `python3 propiq-cli.py setup youtube`
- [ ] Schedule Tuesday's posts via CLI
- [ ] Test automated posting

### Week 2 (Optimize)

- [ ] Add cron job for auto-posting
- [ ] Refine content calendar based on analytics
- [ ] Batch produce 4 Reels for the month

### Month 2 (Scale)

- [ ] Analyze top-performing content
- [ ] Create 30-day content library
- [ ] Automate repurposing (LinkedIn → Instagram → YouTube)

---

## Advanced Tips

### Content Repurposing Flow

```
1. Write LinkedIn post (long-form)
   ↓
2. Extract key insights → Create Instagram Reel script
   ↓
3. Record Reel (30-60s)
   ↓
4. CLI: Post Reel to Instagram + YouTube simultaneously
   ↓
5. Wait 2-3 hours → Share to Instagram Stories
   ↓
6. Extract thread → Post to Twitter via Buffer
   ↓
7. Expand → Write 1,500-word blog post (end of month)
```

**1 piece of content → 5 distribution channels**

### Batch Scheduling Strategy

Every Sunday night:
```bash
cd propiq/social-cli

# Schedule entire week
python3 propiq-cli.py schedule linkedin "Post 1" --date "2025-11-12 07:00"
python3 propiq-cli.py schedule instagram-reel url1 --date "2025-11-12 15:00" --caption "Caption 1"
python3 propiq-cli.py schedule youtube-short url1 --date "2025-11-12 15:30" --caption "Title 1"

# ... repeat for Thursday
```

Set it and forget it. Cron handles the rest.

### Analytics-Driven Optimization

Every Monday:
```bash
python3 propiq-cli.py analytics all --days 7
```

Look for:
- Which posts got most saves (Instagram) → High intent
- Which posts got most comments (LinkedIn) → Engagement
- Which times performed best → Adjust calendar

Double down on what works.

---

## Support & Resources

**Documentation:**
- CLI Tool: `propiq/social-cli/README.md`
- Quick Start: `propiq/social-cli/QUICK_START.md`
- Instagram Playbook: `propiq/creator-economy/playbooks/INSTAGRAM_REELS_PLAYBOOK.md`
- Content Calendar: `propiq/creator-economy/calendars/NOVEMBER_2025_CONTENT_CALENDAR.md`

**API Documentation:**
- LinkedIn: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- Instagram: https://developers.facebook.com/docs/instagram-api
- YouTube: https://developers.google.com/youtube/v3

**Tools:**
- Buffer: https://buffer.com
- Graph API Explorer: https://developers.facebook.com/tools/explorer/
- LinkedIn Developer Portal: https://www.linkedin.com/developers/apps

---

## Key Takeaways

✅ **CLI tools save 1.5-2 hours/week**
✅ **Only $6/month** (Buffer for Twitter)
✅ **Full control** over timing and content
✅ **Integrates** with existing research and calendar system
✅ **Scales easily** (add more platforms, automate more)

**Philosophy:**
- Automate repetitive tasks
- Manual only where algorithm requires it (Instagram Stories)
- Focus energy on creating great content, not clicking buttons

---

🚀 **Your complete social media automation system is ready!**

Start with: `cd propiq/social-cli && python3 propiq-cli.py setup linkedin`

Then schedule your first week of content and watch the system work.
