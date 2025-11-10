# PropIQ Social CLI 🚀

**Post to LinkedIn, Instagram, and YouTube from the terminal**

Stop wasting time copy/pasting content. Automate your social media with a powerful CLI tool.

---

## What This Does

```bash
# Post to LinkedIn
propiq-cli post linkedin "Your post content here"

# Post Instagram Reel
propiq-cli post instagram-reel https://example.com/video.mp4 "Caption"

# Post YouTube Short
propiq-cli post youtube-short /path/to/video.mp4 "Title"

# Schedule a post
propiq-cli schedule linkedin "Content" --date "2025-11-12 07:00"

# Get analytics
propiq-cli analytics instagram --days 7

# Batch schedule from content calendar
propiq-cli batch ../creator-economy/calendars/NOVEMBER_2025_CONTENT_CALENDAR.json
```

**Time saved:** 1.5-2 hours/week

---

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd social-cli
pip3 install -r requirements.txt
```

### 2. Setup API Credentials

```bash
# Interactive setup wizard
python3 propiq-cli.py setup

# Or setup individual platforms
python3 propiq-cli.py setup linkedin
python3 propiq-cli.py setup instagram
python3 propiq-cli.py setup youtube
```

### 3. Test Connection

```bash
python3 propiq-cli.py status
```

Should show:
```
✅ LinkedIn: Connected
   Account: Your Name

✅ Instagram: Connected
   Account: @your_handle

✅ YouTube: Connected
   Account: Your Channel
```

### 4. Post Your First Content

```bash
python3 propiq-cli.py post linkedin "Testing PropIQ Social CLI! 🚀"
```

---

## Platform Setup Guides

### LinkedIn Setup (5 minutes)

1. **Create LinkedIn App:**
   - Go to: https://www.linkedin.com/developers/apps
   - Click "Create app"
   - Fill in:
     - App name: `PropIQ Social CLI`
     - LinkedIn Page: Your personal or business page
   - In "Products" tab, add "Share on LinkedIn"
   - In "Auth" tab, add redirect URL: `http://localhost:8000/callback`

2. **Get Credentials:**
   - Copy Client ID and Client Secret
   - Run: `python3 propiq-cli.py setup linkedin`
   - Follow prompts

3. **Get Access Token:**
   - Option A: Use OAuth flow (automated in future version)
   - Option B: Use Postman to get token manually
   - Paste token when prompted

**Cost:** FREE

---

### Instagram Setup (10 minutes)

1. **Convert to Business Account:**
   - Instagram → Settings → Account
   - "Switch to Professional Account"
   - Choose "Business" or "Creator"

2. **Connect to Facebook Page:**
   - Instagram → Settings → Account → Linked Accounts → Facebook
   - Create or link a Facebook Page

3. **Create Facebook App:**
   - Go to: https://developers.facebook.com/apps
   - Click "Create App"
   - Type: Business
   - Add product: "Instagram Basic Display"

4. **Get Access Token:**
   - Graph API Explorer: https://developers.facebook.com/tools/explorer/
   - Select your app
   - Add permissions:
     - `instagram_content_publish`
     - `instagram_basic`
     - `pages_read_engagement`
   - Click "Generate Access Token"

5. **Get Account ID:**
   - In Graph API Explorer:
     - Call: `GET /me/accounts` (gets Facebook Pages)
     - Copy Page ID
     - Call: `GET /{page-id}?fields=instagram_business_account`
     - Copy Instagram Business Account ID

6. **Run Setup:**
   - `python3 propiq-cli.py setup instagram`
   - Paste access token and account ID

**Cost:** FREE
**Requirements:** Instagram Business/Creator account

---

### YouTube Setup (10 minutes)

1. **Create Google Cloud Project:**
   - Go to: https://console.cloud.google.com
   - Create new project: `PropIQ Social CLI`

2. **Enable YouTube Data API:**
   - APIs & Services → Enable APIs and Services
   - Search "YouTube Data API v3"
   - Click "Enable"

3. **Create OAuth Credentials:**
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Desktop app
   - Download JSON file

4. **Get Access Token:**
   - Option A: OAuth flow (automated soon)
   - Option B: Google OAuth Playground: https://developers.google.com/oauthplayground
     - Select "YouTube Data API v3"
     - Authorize APIs
     - Exchange authorization code for tokens

5. **Run Setup:**
   - `python3 propiq-cli.py setup youtube`
   - Paste Client ID, Client Secret, Access Token

**Cost:** FREE (up to 10,000 API quota/day)

---

## Usage Examples

### Post to LinkedIn

```bash
# Simple text post
python3 propiq-cli.py post linkedin "The 1% rule fails investors more than any other metric. Here's why..."

# Post with image
python3 propiq-cli.py post linkedin "Check out this property analysis!" --image /path/to/image.jpg
```

### Post Instagram Reel

```bash
# Post Reel (video must be publicly accessible URL)
python3 propiq-cli.py post instagram-reel https://example.com/video.mp4 "The 1% rule will cost you money. Here's why 👇"

# Note: Local file upload coming soon
```

**Important:** Remember to wait 2-3 hours before sharing to Stories (algorithm optimization)!

### Post YouTube Short

```bash
# Post Short (requires google-api-python-client)
python3 propiq-cli.py post youtube-short /path/to/video.mp4 "30-Second Property Analysis | PropIQ"
```

### Schedule Posts

```bash
# Schedule LinkedIn post
python3 propiq-cli.py schedule linkedin "Your content" --date "2025-11-12 07:00"

# Schedule Instagram Reel
python3 propiq-cli.py schedule instagram-reel https://example.com/video.mp4 --date "2025-11-12 15:00" --caption "Caption here"

# View scheduled posts
python3 propiq-cli.py status
```

### Get Analytics

```bash
# Instagram analytics
python3 propiq-cli.py analytics instagram --days 7

# All platforms
python3 propiq-cli.py analytics all --days 30
```

### Batch Schedule from Calendar

```bash
# Schedule all posts from content calendar
python3 propiq-cli.py batch ../creator-economy/calendars/NOVEMBER_2025_CONTENT_CALENDAR.json
```

---

## Integration with Content Calendar

Your content calendar JSON should follow this format:

```json
{
  "posts": [
    {
      "platform": "linkedin",
      "title": "LinkedIn Post #1",
      "content": "Your post content here...",
      "scheduled_time": "2025-11-12 07:00",
      "status": "pending"
    },
    {
      "platform": "instagram-reel",
      "title": "Instagram Reel #1",
      "content": "https://example.com/video.mp4",
      "caption": "Caption here",
      "scheduled_time": "2025-11-12 15:00",
      "status": "pending"
    }
  ]
}
```

Then run:

```bash
python3 propiq-cli.py batch path/to/calendar.json
```

---

## Automation with Cron

### Auto-Post Scheduled Content

Create a cron job to check for scheduled posts every hour:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path):
0 * * * * cd /path/to/social-cli && python3 auto-post.py >> logs/auto-post.log 2>&1
```

The `auto-post.py` script (included) will:
1. Check for posts due now
2. Post them to the appropriate platform
3. Mark as posted
4. Log results

---

## CLI Commands Reference

### Post Commands

| Command | Description |
|---------|-------------|
| `post linkedin "content"` | Post to LinkedIn |
| `post instagram-reel url "caption"` | Post Instagram Reel |
| `post youtube-short path "title"` | Post YouTube Short |

### Schedule Commands

| Command | Description |
|---------|-------------|
| `schedule linkedin "content" --date "..."` | Schedule LinkedIn post |
| `schedule instagram-reel url --date "..." --caption "..."` | Schedule Instagram Reel |

### Analytics Commands

| Command | Description |
|---------|-------------|
| `analytics linkedin --days 7` | LinkedIn analytics (last 7 days) |
| `analytics instagram --days 30` | Instagram analytics (last 30 days) |
| `analytics all --days 7` | All platforms |

### Setup Commands

| Command | Description |
|---------|-------------|
| `setup` | Interactive setup wizard (all platforms) |
| `setup linkedin` | Setup LinkedIn only |
| `setup instagram` | Setup Instagram only |
| `setup youtube` | Setup YouTube only |

### Utility Commands

| Command | Description |
|---------|-------------|
| `status` | Check API connection status |
| `batch calendar.json` | Batch schedule from content calendar |

---

## Folder Structure

```
social-cli/
├── propiq-cli.py           # Main CLI script
├── modules/
│   ├── __init__.py
│   ├── linkedin.py         # LinkedIn API integration
│   ├── instagram.py        # Instagram Graph API integration
│   ├── youtube.py          # YouTube Data API integration
│   ├── analytics.py        # Analytics aggregation
│   ├── scheduler.py        # Post scheduling
│   ├── setup.py            # Interactive setup wizard
│   └── config.py           # Configuration management
├── data/
│   ├── posts.db            # Posted content history
│   └── scheduled_posts.db  # Scheduled posts queue
├── logs/
│   └── auto-post.log       # Automated posting logs
├── requirements.txt        # Python dependencies
├── README.md               # This file
└── auto-post.py            # Cron job script
```

---

## Configuration

Credentials are stored in: `~/.propiq-cli/config.json`

```json
{
  "linkedin": {
    "client_id": "...",
    "client_secret": "...",
    "access_token": "...",
    "person_urn": "urn:li:person:..."
  },
  "instagram": {
    "access_token": "...",
    "account_id": "..."
  },
  "youtube": {
    "client_id": "...",
    "client_secret": "...",
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

**Security:** This file contains sensitive tokens. Never commit to git.

---

## Troubleshooting

### LinkedIn: "Unauthorized"

- Access token expired (LinkedIn tokens expire after 60 days)
- Re-run: `python3 propiq-cli.py setup linkedin`

### Instagram: "Video processing failed"

- Video must be publicly accessible URL
- Video must be 9:16 aspect ratio (vertical)
- Video must be under 90 seconds
- Check video format (MP4 or MOV)

### YouTube: "Upload failed"

- Ensure `google-api-python-client` is installed
- Check API quota (10,000 units/day default)
- Verify OAuth credentials are correct

### General: "Module import failed"

- Run: `pip3 install -r requirements.txt`
- Ensure you're in the `social-cli` directory

---

## API Costs & Limits

| Platform | Cost | Daily Limits |
|----------|------|--------------|
| **LinkedIn** | FREE | No official limit (rate limited) |
| **Instagram** | FREE | 200 API calls/hour per user |
| **YouTube** | FREE | 10,000 quota units/day (1 upload = 1,600 units) |
| **Twitter** | $100/mo | 3,000 posts/month (Basic tier) |

**Recommendation:** Use Buffer for Twitter ($6-15/mo) instead of Twitter API.

---

## Roadmap

### Phase 1 (Current)
- ✅ LinkedIn posting
- ✅ Instagram Reels posting
- ✅ YouTube Shorts posting
- ✅ Post scheduling
- ✅ Basic analytics

### Phase 2 (Next 2 weeks)
- [ ] OAuth automation (no manual token entry)
- [ ] Local file upload (Instagram/YouTube)
- [ ] Image optimization
- [ ] Video processing (resize, format conversion)
- [ ] Advanced analytics (engagement trends, best times)

### Phase 3 (Next month)
- [ ] Multi-account support
- [ ] Content repurposing (LinkedIn post → Instagram Reel caption)
- [ ] AI-powered caption generation
- [ ] Hashtag suggestions
- [ ] Performance predictions

---

## Why CLI Instead of Buffer/Hootsuite?

| Feature | PropIQ CLI | Buffer/Hootsuite |
|---------|------------|------------------|
| **Cost** | FREE | $15-99/month |
| **LinkedIn posting** | ✅ | ✅ |
| **Instagram Reels** | ✅ (with timing control) | ⚠️ (auto-shares to Stories) |
| **YouTube Shorts** | ✅ | ❌ (not supported) |
| **Custom automation** | ✅ | ❌ |
| **Integration with content calendar** | ✅ | Limited |
| **Analytics** | Basic (free tier) | Advanced (paid) |
| **Batch scheduling** | ✅ | ✅ |

**Best approach:** Use CLI for Instagram/YouTube, Buffer for Twitter (API too expensive).

---

## Support

**Issues?**
1. Check configuration: `python3 propiq-cli.py status`
2. Review error message
3. Check API credentials
4. Verify API limits/quotas

**Want to contribute?**
- Add new platforms (TikTok, Facebook, etc.)
- Improve OAuth flows
- Add advanced analytics
- Create video processing features

---

## Credits

**Built for:** PropIQ by LUNTRA
**Purpose:** Streamline social media distribution, save 1.5-2 hours/week
**Philosophy:** Automate repetitive tasks, focus on creating great content

---

🚀 **Your social media automation system is ready!**

Start with: `python3 propiq-cli.py setup`
