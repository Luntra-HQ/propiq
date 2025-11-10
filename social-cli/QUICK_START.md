# Quick Start Guide - PropIQ Social CLI

Get up and running in 10 minutes.

---

## Step 1: Install Dependencies (2 min)

```bash
cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/social-cli"
pip3 install -r requirements.txt
```

---

## Step 2: Setup LinkedIn (5 min)

### Create LinkedIn App

1. Visit: https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill in:
   - App name: `PropIQ Social CLI`
   - LinkedIn Page: Your page (create one if needed)
4. Products → Add "Share on LinkedIn"
5. Auth tab → Redirect URL: `http://localhost:8000/callback`
6. Copy Client ID and Client Secret

### Run Setup

```bash
python3 propiq-cli.py setup linkedin
```

Follow prompts to enter:
- Client ID
- Client Secret
- Access Token (get from LinkedIn OAuth or tools)
- Person URN (from API Explorer)

---

## Step 3: Test Connection (1 min)

```bash
python3 propiq-cli.py status
```

Should show:
```
✅ LinkedIn: Connected
   Account: Your Name
```

---

## Step 4: Post Your First Content (1 min)

```bash
python3 propiq-cli.py post linkedin "Testing PropIQ Social CLI! 🚀

This tool will save me hours every week."
```

Check LinkedIn - your post should be live!

---

## Next Steps

### Setup Instagram (10 min)

```bash
python3 propiq-cli.py setup instagram
```

Requirements:
- Instagram Business or Creator account
- Facebook Page connected to Instagram
- Facebook Developer app with Instagram permissions

See [README.md](README.md#instagram-setup-10-minutes) for detailed steps.

### Setup YouTube (10 min)

```bash
python3 propiq-cli.py setup youtube
```

Requirements:
- Google Cloud project
- YouTube Data API v3 enabled
- OAuth 2.0 credentials

See [README.md](README.md#youtube-setup-10-minutes) for detailed steps.

### Automate with Cron

Schedule posts to run automatically:

```bash
# Create logs directory
mkdir -p logs

# Add to crontab (runs every hour)
crontab -e

# Add this line:
0 * * * * cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/social-cli" && python3 auto-post.py >> logs/auto-post.log 2>&1
```

### Batch Schedule from Calendar

```bash
# Schedule all November posts
python3 propiq-cli.py batch ../creator-economy/calendars/NOVEMBER_2025_CONTENT_CALENDAR.json
```

---

## Usage Examples

### Post to LinkedIn

```bash
# Text post
python3 propiq-cli.py post linkedin "Your content here"

# With image
python3 propiq-cli.py post linkedin "Content" --image /path/to/image.jpg
```

### Schedule Post

```bash
python3 propiq-cli.py schedule linkedin "Content" --date "2025-11-12 07:00"
```

### Get Analytics

```bash
python3 propiq-cli.py analytics instagram --days 7
```

---

## Troubleshooting

**"Module import failed"**
- Run: `pip3 install -r requirements.txt`

**"LinkedIn not configured"**
- Run: `python3 propiq-cli.py setup linkedin`

**"Unauthorized"**
- Token expired - re-run setup for that platform

---

**You're ready to automate your social media!** 🚀

Full documentation: [README.md](README.md)
