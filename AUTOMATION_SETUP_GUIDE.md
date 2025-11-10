# PropIQ Content Automation Setup Guide
## AI-Powered Content Scheduling with Comet Assistant, Zapier & Make.com

---

## 🎯 Automation Goals

**What We're Automating:**
1. Content scheduling from Google Drive
2. Post publishing to LinkedIn and Twitter
3. Engagement tracking and logging
4. Performance analytics collection
5. Notification for important engagement

**What We're NOT Automating:**
- Responding to comments (keep this personal)
- Engaging with target accounts (do this manually)
- Creating new content (use templates, but add personal touch)
- DM conversations (always manual and genuine)

---

## Option 1: Comet Assistant (AI-Powered, Simplest)

### What is Comet Assistant?

Comet is an AI assistant that can:
- Access your Google Drive
- Read files and understand content
- Schedule posts to social media
- Track and log activities
- Send notifications

### Setup Steps

#### Step 1: Grant Comet Access to Google Drive

1. Open Comet Assistant
2. Say: "I want to give you access to my Google Drive folder"
3. Follow the OAuth flow to connect Google Drive
4. Grant read access to "PropIQ Content Marketing" folder

#### Step 2: Provide Comet with Instructions

**Initial Prompt to Comet:**

```
Hi Comet! I need your help managing my PropIQ content marketing.

FOLDER STRUCTURE:
- Google Drive folder: "PropIQ Content Marketing"
- Pre-written posts: "02_Pre_Written_Posts/Week_01_Posts/"
- Content calendar: "03_Content_Calendar/Week_01_Schedule.md"
- Engagement tracker: "04_Engagement_Tracker/Daily_Engagement_Log.md"

YOUR TASKS:

1. DAILY POSTING (Automated)
   - Read today's date
   - Check "Week_01_Schedule.md" for today's post
   - Navigate to corresponding post file (e.g., "Day_1_Build_Update.md")
   - Extract post content
   - Post to LinkedIn at scheduled time
   - Crosspost to Twitter (use Twitter version if available)
   - Log posted content in "Daily_Engagement_Log.md"

2. ENGAGEMENT REMINDERS (Notification)
   - Send me a reminder at 9 AM EST: "Comment on 10 posts before posting today"
   - Send me a reminder 1 hour after posting: "Respond to all comments now"

3. TRACKING (Automated)
   - At end of day (8 PM EST), check post performance
   - Log engagement metrics (likes, comments, shares) in "Daily_Engagement_Log.md"
   - Alert me if a post hits >150 likes (viral potential)

4. WEEKLY SUMMARY (Automated)
   - Every Sunday at 8 PM EST
   - Generate summary of week's performance
   - Send to my email or Slack
   - Include: Total posts, avg engagement, top post, follower growth

EXAMPLE WORKFLOW:

Monday, 12:00 PM EST:
→ You: Read "Day_1_Build_Update.md"
→ You: Post to LinkedIn
→ You: Crosspost to Twitter (280 char version)
→ You: Log in "Daily_Engagement_Log.md": "Nov 4 - Posted Day 1 Build Update at 12:00 PM"

Monday, 1:00 PM EST:
→ You: Send notification "Your Day 1 post has 25 likes and 5 comments. Respond now!"

Monday, 8:00 PM EST:
→ You: Check final metrics
→ You: Log in tracker: "Nov 4 - Final: 67 likes, 12 comments, 8 shares"

Can you handle this? Let me know if you need any clarifications!
```

#### Step 3: Test the Workflow

**Day 1 Test:**
1. Manually verify Comet can access the folder
2. Ask Comet: "What's today's post according to the calendar?"
3. Ask Comet: "Can you show me the content for today's post?"
4. Ask Comet: "Schedule today's post for 12:00 PM EST"
5. Verify the post appears in your LinkedIn drafts

**Day 2-7:**
- Let Comet run automatically
- Monitor notifications
- Verify posts are published on time
- Check engagement logs are updated

---

## Option 2: Zapier (No-Code Automation)

### Zap 1: Google Drive → Buffer → LinkedIn

**Trigger:** New file in Google Drive folder
**Actions:**
1. Extract file content
2. Format for LinkedIn
3. Create Buffer post
4. Schedule for time specified in filename

**Setup:**

1. **Create Zap**
   - Trigger: Google Drive - New File in Folder
   - Folder: "PropIQ Content Marketing/02_Pre_Written_Posts/Week_01_Posts/"

2. **Add Formatter**
   - Action: Text - Extract Pattern
   - Pattern: Extract everything between \`\`\` markdown blocks
   - Store as "post_content"

3. **Add Buffer**
   - Action: Create Post
   - Profile: LinkedIn (connect your account)
   - Text: {{post_content}}
   - Scheduled: Parse from filename (e.g., "2025-11-04_12-00_Day_1_Build_Update.md")

4. **Add Google Sheets Logger**
   - Action: Create Spreadsheet Row
   - Spreadsheet: "PropIQ Engagement Tracker"
   - Row data: Date, Time, Post Type, Status: "Posted"

**Naming Convention for Files:**
```
2025-11-04_12-00_Day_1_Build_Update.md
2025-11-05_09-00_Day_2_Hot_Take.md
2025-11-06_13-00_Day_3_Founder_Journey.md
```

Zapier will parse the date/time and schedule automatically.

---

### Zap 2: LinkedIn Engagement → Slack Notification

**Trigger:** New comment on your LinkedIn post
**Actions:**
1. Send Slack notification
2. Log engagement in Google Sheets

**Setup:**

1. **Create Zap**
   - Trigger: LinkedIn - New Comment on Your Post
   - Filter: Only posts with #PropIQ hashtag

2. **Add Slack**
   - Action: Send Channel Message
   - Channel: #propiq-social
   - Message: "New comment from {{commenter_name}}: {{comment_text}}"

3. **Add Google Sheets**
   - Action: Create Spreadsheet Row
   - Spreadsheet: "PropIQ Engagement Tracker"
   - Row: Date, Time, Commenter, Comment Text, Status: "Pending Response"

---

### Zap 3: End of Day Performance Check

**Trigger:** Schedule - Every day at 8 PM EST
**Actions:**
1. Fetch today's post metrics (LinkedIn API)
2. Log to Google Sheets
3. Send summary email

**Setup:**

1. **Create Zap**
   - Trigger: Schedule by Zapier - Every Day, 8:00 PM EST

2. **Add LinkedIn**
   - Action: Get Post Stats
   - Post: Most recent post with #PropIQ

3. **Add Google Sheets**
   - Action: Create Spreadsheet Row
   - Spreadsheet: "PropIQ Engagement Tracker"
   - Row: Date, Likes, Comments, Shares, Impressions

4. **Add Email**
   - Action: Send Outbound Email
   - To: Your email
   - Subject: "PropIQ Daily Performance - {{today_date}}"
   - Body: "Today's post: {{likes}} likes, {{comments}} comments, {{shares}} shares"

---

## Option 3: Make.com (More Powerful, Visual)

### Scenario 1: Content Publishing Workflow

**Modules:**

1. **Google Drive - Watch Files**
   - Folder: "PropIQ Content Marketing/02_Pre_Written_Posts/Week_01_Posts/"
   - Trigger: New or updated file

2. **Router** (split based on filename)
   - Route 1: If filename contains "LinkedIn" → LinkedIn module
   - Route 2: If filename contains "Twitter" → Twitter module
   - Route 3: Both → Post to both

3. **Text Parser**
   - Extract content between markdown code blocks
   - Parse scheduled time from filename

4. **LinkedIn - Create Post**
   - Text: {{parsed_content}}
   - Scheduled: {{parsed_time}}

5. **Twitter - Create Tweet**
   - Text: {{parsed_content}} (first 280 chars)
   - Scheduled: {{parsed_time}}

6. **Google Sheets - Add Row**
   - Sheet: "PropIQ Engagement Log"
   - Row: Date, Time, Platform, Status, Post ID

7. **Slack - Send Message**
   - Channel: #propiq-social
   - Message: "✅ Posted to {{platform}} at {{time}}"

---

### Scenario 2: Engagement Monitoring

**Modules:**

1. **HTTP - Make a Request** (every 30 minutes)
   - URL: LinkedIn API to check notifications
   - Method: GET
   - Headers: Authorization bearer token

2. **Filter** (only new comments/likes since last check)

3. **Router**
   - Route 1: If comment → Send Slack notification
   - Route 2: If like >100 total → Send "Going viral!" alert
   - Route 3: All engagement → Log to Google Sheets

4. **Slack - Send Message**
   - Channel: #propiq-social
   - Message: "New comment from {{user}}: {{text}}"

5. **Google Sheets - Add Row**
   - Sheet: "PropIQ Engagement Tracker"
   - Row: Timestamp, Type (comment/like/share), User, Content

---

## Option 4: Buffer (Content Scheduling Only)

### Setup

1. **Create Buffer Account**
   - Connect LinkedIn profile
   - Connect Twitter account

2. **Create Queue**
   - Monday: 12:00 PM EST
   - Tuesday: 9:00 AM EST
   - Wednesday: 1:00 PM EST
   - Thursday: 11:00 AM EST
   - Friday: 8:00 AM EST
   - Saturday: 10:00 AM EST
   - Sunday: 7:00 PM EST

3. **Load Week 1 Posts**
   - Copy each post from "02_Pre_Written_Posts/"
   - Paste into Buffer
   - Assign to queue slot
   - Add visual assets

4. **Analytics**
   - Check Buffer analytics daily at 8 PM
   - Export weekly report
   - Compare against goals

---

## Engagement Tracker Template (Google Sheets)

### Sheet 1: Daily Posts

| Date | Day | Post Type | Platform | Scheduled Time | Posted? | Likes | Comments | Shares | Impressions | CTR | Notes |
|------|-----|-----------|----------|----------------|---------|-------|----------|--------|-------------|-----|-------|
| 11/4 | Mon | Build Update | LinkedIn | 12:00 PM | ✅ | 67 | 12 | 8 | 1,234 | 2.3% | Great engagement |
| 11/4 | Mon | Build Update | Twitter | 12:00 PM | ✅ | 23 | 4 | 2 | 456 | 1.8% | Crosspost |
| 11/5 | Tue | Hot Take | LinkedIn | 9:00 AM | ✅ | 145 | 28 | 15 | 2,345 | 3.1% | Viral potential! |

### Sheet 2: Engagement Log

| Date | Time | Commenter | Platform | Comment | Replied? | Notes |
|------|------|-----------|----------|---------|----------|-------|
| 11/4 | 12:15 PM | John Smith | LinkedIn | "This resonates!" | ✅ | Sent DM with demo link |
| 11/4 | 12:22 PM | Jane Doe | LinkedIn | "What tech stack?" | ✅ | Answered in comment |

### Sheet 3: Weekly Summary

| Week | Total Posts | Avg Likes | Avg Comments | Avg Shares | New Followers | Demo Requests | Top Post |
|------|-------------|-----------|--------------|------------|---------------|---------------|----------|
| 1 | 7 | 89 | 18 | 11 | 52 | 12 | Day 5 Value Bomb |

---

## Target Accounts List (for Pre-Posting Engagement)

### Category 1: Real Estate Influencers (LinkedIn)

1. **Bigger Pockets** (@biggerpockets)
2. **Grant Cardone** (@grantcardone)
3. **Ken McElroy** (@kenmcelroy)
4. **[Your local real estate group]**
5. **[PropTech founder 1]**

### Category 2: Build in Public / Founders

6. **Leandrew Robinson** (@leandrew)
7. **Sahil Bloom** (@sahilbloom)
8. **Greg Isenberg** (@gregisenberg)
9. **Dickie Bush** (@dickiebush)
10. **Justin Welsh** (@justinwelsh)

### Category 3: SaaS / Tech

11. **Indie Hackers** (@indiehackers)
12. **Product Hunt** (@producthunt)
13. **Y Combinator** (@ycombinator)
14. **[DevOps influencer]**
15. **[SaaS founder you admire]**

### Category 4: Financial Literacy

16. **The Financial Diet** (@thefinancialdiet)
17. **Personal Finance YouTubers** (crosspost to LinkedIn)
18. **Real estate investing groups**
19. **FIRE movement accounts**
20. **[Financial advisor in your niche]**

### Daily Routine:

**9:00 AM - 10:00 AM:**
- Open LinkedIn
- Go through list 1-10
- Find today's posts from each
- Write genuine, thoughtful comments (not just "Great post!")
- Hit 10 comments before moving on

**Example Comments:**
- "This point about [specific detail] resonates. We're seeing the same with PropIQ users who [related insight]."
- "Love this framework. Question: How do you [specific question]? We're tackling [similar problem] for real estate investors."
- "Saved this. The [specific lesson] is exactly what we needed to hear today while building PropIQ."

---

## Automation Decision Tree

**Choose your automation level:**

### Level 1: Manual Everything (Week 1 Recommended)
- ✅ Full control
- ✅ Learn what works
- ✅ Build authentic connections
- ❌ Time-intensive (2 hours/day)

**Best for:** First 2 weeks while testing content

---

### Level 2: Buffer Scheduling Only
- ✅ Posts scheduled ahead
- ✅ Manual engagement remains authentic
- ✅ Analytics in one place
- ❌ Still need to engage manually

**Best for:** Weeks 3-4 after finding your rhythm

---

### Level 3: Zapier/Make.com Light Automation
- ✅ Posting automated
- ✅ Notifications for engagement
- ✅ Tracking automated
- ❌ Need to set up workflows

**Best for:** Month 2+ when scaling

---

### Level 4: Comet Assistant Full Automation
- ✅ AI handles scheduling
- ✅ AI logs metrics
- ✅ AI sends reminders
- ❌ Less control over timing

**Best for:** Month 3+ when content machine is proven

---

## Recommended Progression

**Week 1-2:** Manual everything
- Learn optimal posting times
- Understand what content resonates
- Build genuine relationships

**Week 3-4:** Add Buffer
- Schedule posts 1 week ahead
- Keep engagement manual
- Track which posts drive signups

**Month 2:** Add Zapier notifications
- Get alerts for comments
- Automate engagement logging
- Track metrics automatically

**Month 3:** Consider Comet Assistant
- Full automation if proven
- Keep human touch on responses
- Scale to 2x/day posting

---

## 🚨 Automation Warnings

**NEVER Automate:**
1. ❌ Responding to comments (people can tell it's robotic)
2. ❌ Sending DMs (spam = instant unfollow)
3. ❌ Commenting on others' posts (engagement must be genuine)
4. ❌ Creating content (AI-written posts lack personality)

**Safe to Automate:**
1. ✅ Scheduling posts (you wrote them, just timing)
2. ✅ Cross-posting (LinkedIn → Twitter)
3. ✅ Logging metrics (data entry)
4. ✅ Sending yourself reminders (notifications)

---

## Testing Checklist

Before going live with automation:

- [ ] Test posting to LinkedIn from automation tool
- [ ] Verify posts appear correctly (formatting, links, hashtags)
- [ ] Test Twitter crossposting (character limits)
- [ ] Confirm notifications work (comment alerts)
- [ ] Check engagement logging is accurate
- [ ] Verify scheduled times are correct (EST timezone)
- [ ] Test "kill switch" (how to pause automation)
- [ ] Have backup plan (manual posting if automation fails)

---

## Troubleshooting

### Issue: Posts not publishing

**Check:**
1. API connections still valid? (LinkedIn/Twitter auth)
2. Scheduled time in past? (buffer won't post)
3. Character limits exceeded? (Twitter 280 chars)
4. Hashtags formatted correctly? (#PropIQ not # PropIQ)

**Fix:** Reconnect APIs, adjust schedule, edit content

---

### Issue: Engagement not logging

**Check:**
1. Google Sheets permissions (Zapier/Make has write access?)
2. Sheet name matches workflow (case-sensitive)
3. Column names match data fields

**Fix:** Update permissions, rename sheet, remap fields

---

### Issue: Too many notifications

**Check:**
1. Notification filters too broad?
2. Receiving alerts for every like?

**Fix:** Add filters (only >50 likes, only comments, etc.)

---

## Support Resources

**Zapier:** https://zapier.com/help
**Make.com:** https://www.make.com/en/help
**Buffer:** https://buffer.com/resources
**Comet Assistant:** [Your Comet support channel]

**LinkedIn API:** https://docs.microsoft.com/en-us/linkedin/
**Twitter API:** https://developer.twitter.com/en/docs

---

## Final Checklist: Go-Live

- [ ] Week 1 posts loaded into automation tool
- [ ] Visual assets uploaded and linked
- [ ] Scheduled times verified (correct timezone)
- [ ] Test post published successfully
- [ ] Engagement tracker spreadsheet set up
- [ ] Notification channels configured (Slack/Email)
- [ ] Target accounts list saved in bookmarks
- [ ] Daily routine calendar blocked (9-10 AM engagement, post time, 8 PM review)
- [ ] Backup plan documented (manual posting process)
- [ ] Metrics goals set (50 followers, 10 signups)

---

**Last Updated:** 2025-11-02
**Recommended Start:** Week 1 Manual → Week 3 Buffer → Month 2 Zapier → Month 3 Comet
**Primary Tool:** Google Drive + Buffer (simplest, most reliable)
**Advanced Tool:** Make.com (most powerful, visual workflows)
