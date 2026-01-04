# PropIQ Daily Digest Setup Guide

**Goal:** Receive daily/weekly email reports combining Sentry errors and Google Analytics 4 data
**Time:** 20 minutes
**Result:** Automated email digest with error tracking and analytics in one place

---

## Overview

The PropIQ Daily Digest service combines:
- **Sentry Error Tracking** - Errors from frontend, backend, and extension
- **Google Analytics 4** - User metrics and analytics (future enhancement)
- **Automated Email Delivery** - Via Resend API
- **Scheduled Reports** - Daily at 8 AM, Weekly on Monday at 9 AM

**What You'll Get:**
- Daily summary of errors across all projects
- Top errors with occurrence counts and user impact
- Project-level breakdown (frontend/backend/extension)
- Critical error alerts
- Weekly comprehensive reports

---

## Architecture

```
┌─────────────────────┐
│   Sentry API        │
│   (Error Data)      │
└──────────┬──────────┘
           │
           │ Fetch stats
           │
           ▼
┌─────────────────────────┐
│ PropIQ Backend          │
│ /api/digest/generate    │
│                         │
│ - Fetch from Sentry     │
│ - Combine data          │
│ - Format email          │
└──────────┬──────────────┘
           │
           │ Send via Resend
           │
           ▼
┌─────────────────────────┐
│   Email Recipients      │
│   (DIGEST_RECIPIENTS)   │
└─────────────────────────┘
```

---

## Step 1: Get Sentry API Token

### 1.1 Create Sentry Auth Token

1. **Go to Sentry Settings:**
   ```
   https://sentry.io/settings/account/api/auth-tokens/
   ```

2. **Click "Create New Token"**

3. **Configure token:**
   ```
   Name: PropIQ Daily Digest
   Scopes:
     ☑ org:read
     ☑ project:read
     ☑ event:read
   ```

4. **Click "Create Token"**

5. **Copy the token** (starts with `sntrys_...`)

### 1.2 Get Sentry Organization Slug

1. **Go to your Sentry dashboard:**
   ```
   https://sentry.io/organizations/
   ```

2. **Note your organization slug** (from the URL)
   - Example: `https://sentry.io/organizations/propiq-team/`
   - Slug is: `propiq-team`

### 1.3 Get Sentry Project Slugs

Your PropIQ Sentry projects:
- `propiq-frontend` - React app errors
- `propiq-backend` - FastAPI errors
- `propiq-extension` - Chrome extension errors (if using Sentry)

---

## Step 2: Get Resend API Key

### 2.1 Sign Up for Resend

1. **Go to Resend:**
   ```
   https://resend.com
   ```

2. **Sign up** (free tier includes 3,000 emails/month)

3. **Verify your domain** (optional but recommended):
   - Go to **Domains** → **Add Domain**
   - Follow DNS setup instructions
   - Or use `onboarding@resend.dev` for testing

### 2.2 Create API Key

1. **Go to API Keys:**
   ```
   https://resend.com/api-keys
   ```

2. **Click "Create API Key"**

3. **Configure:**
   ```
   Name: PropIQ Daily Digest
   Permission: Full Access
   ```

4. **Click "Create"**

5. **Copy the API key** (starts with `re_...`)

---

## Step 3: Configure Environment Variables

### 3.1 Add to Backend `.env`

Edit `/Users/briandusape/Projects/propiq/backend/.env`:

```bash
# Sentry Configuration
SENTRY_AUTH_TOKEN=sntrys_your_token_here
SENTRY_ORG_SLUG=your-org-slug
SENTRY_FRONTEND_PROJECT=propiq-frontend
SENTRY_BACKEND_PROJECT=propiq-backend
SENTRY_EXTENSION_PROJECT=propiq-extension

# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
DIGEST_RECIPIENTS=your-email@example.com,team@example.com

# Optional: Email sender configuration
FROM_EMAIL=digest@propiq.luntra.one
```

**Important:**
- `DIGEST_RECIPIENTS` can be comma-separated for multiple recipients
- Ensure `FROM_EMAIL` domain matches your Resend verified domain
- Never commit `.env` to git

### 3.2 Add to Azure App Settings (Production)

For production deployment on Azure:

```bash
# Set environment variables in Azure
az webapp config appsettings set \
  --name luntra-outreach-app \
  --resource-group luntra-outreach-rg \
  --settings \
    SENTRY_AUTH_TOKEN="sntrys_your_token_here" \
    SENTRY_ORG_SLUG="your-org-slug" \
    SENTRY_FRONTEND_PROJECT="propiq-frontend" \
    SENTRY_BACKEND_PROJECT="propiq-backend" \
    SENTRY_EXTENSION_PROJECT="propiq-extension" \
    RESEND_API_KEY="re_your_api_key_here" \
    DIGEST_RECIPIENTS="your-email@example.com"
```

---

## Step 4: Test the Digest Service

### 4.1 Start Backend Locally

```bash
cd /Users/briandusape/Projects/propiq/backend
source venv/bin/activate
uvicorn api:app --reload
```

**Expected output:**
```
Daily digest router registered (Sentry + GA4 email reports)
```

### 4.2 Check Health Endpoint

```bash
curl http://localhost:8000/api/digest/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "daily_digest",
  "sentry_configured": true,
  "email_configured": true,
  "recipients_configured": true,
  "timestamp": "2026-01-01T12:00:00"
}
```

**If any field is `false`**, check your environment variables.

### 4.3 Generate Test Digest (No Email)

```bash
curl -X POST "http://localhost:8000/api/digest/generate?days=1&send_email=false"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Digest generated (email not sent)",
  "stats": {
    "date": "2026-01-01",
    "total_errors": 45,
    "critical_errors": 3,
    "new_issues": 5,
    "resolved_issues": 0,
    "users_affected": 12,
    "top_errors": [
      {
        "title": "TypeError: Cannot read property 'price'",
        "count": "18",
        "users": 5,
        "link": "https://sentry.io/issues/..."
      }
    ],
    "projects": {
      "frontend": { ... },
      "backend": { ... },
      "extension": { ... }
    }
  }
}
```

### 4.4 Send Test Email

```bash
curl -X POST "http://localhost:8000/api/digest/generate?days=1&send_email=true"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Digest generated and email sent",
  "stats": { ... }
}
```

**Check your inbox** for the digest email!

---

## Step 5: Set Up Automated Scheduling

### Option 1: Azure Web App Cron Jobs (Recommended)

Azure doesn't support cron directly, but you can use **Azure Logic Apps** or **Azure Functions**.

#### 5.1 Using Azure Logic Apps

1. **Go to Azure Portal:**
   ```
   https://portal.azure.com
   ```

2. **Create Logic App:**
   - Search for "Logic Apps"
   - Click "Create"
   - Name: `propiq-daily-digest`
   - Resource Group: `luntra-outreach-rg`
   - Click "Review + Create"

3. **Configure Daily Trigger:**
   - Open Logic App Designer
   - Choose "Recurrence" trigger
   - Set:
     - Interval: 1
     - Frequency: Day
     - Time zone: Your timezone
     - At these hours: 8
     - At these minutes: 0

4. **Add HTTP Action:**
   - Click "+ New step"
   - Search for "HTTP"
   - Configure:
     - Method: POST
     - URI: `https://luntra-outreach-app.azurewebsites.net/api/digest/daily`
     - Headers: `Content-Type: application/json`

5. **Save and Enable**

#### 5.2 Weekly Digest

Create another Logic App for weekly digest:
- Trigger: Recurrence (Weekly, Monday, 9:00 AM)
- HTTP POST to: `/api/digest/weekly`

### Option 2: External Cron Service (Alternative)

Use a free cron service like **cron-job.org**:

1. **Sign up:**
   ```
   https://cron-job.org
   ```

2. **Create Cron Job (Daily):**
   ```
   Title: PropIQ Daily Digest
   URL: https://luntra-outreach-app.azurewebsites.net/api/digest/daily
   Method: POST
   Schedule: Every day at 8:00 AM
   ```

3. **Create Cron Job (Weekly):**
   ```
   Title: PropIQ Weekly Digest
   URL: https://luntra-outreach-app.azurewebsites.net/api/digest/weekly
   Method: POST
   Schedule: Every Monday at 9:00 AM
   ```

### Option 3: Manual Trigger (Testing)

For testing, manually trigger digests:

```bash
# Daily digest
curl -X POST https://luntra-outreach-app.azurewebsites.net/api/digest/daily

# Weekly digest
curl -X POST https://luntra-outreach-app.azurewebsites.net/api/digest/weekly
```

---

## Email Templates

### Daily Digest Email

**Subject:** `PropIQ Daily Digest - 2026-01-01`

**Content:**
```
📊 PropIQ Daily Digest
January 1, 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary (Last 24 Hours):
• 45 total errors
• 3 critical errors
• 5 new issues
• 12 users affected

Top Errors:
1. TypeError: Cannot read property 'price' (18 occurrences, 5 users)
   → View in Sentry

2. NetworkError: API timeout (12 occurrences, 3 users)
   → View in Sentry

3. AuthError: Invalid JWT token (8 occurrences, 2 users)
   → View in Sentry

Project Breakdown:
Frontend: 28 errors • 2 critical • 3 new • 8 users
Backend: 12 errors • 1 critical • 2 new • 3 users
Extension: 5 errors • 0 critical • 0 new • 1 user

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View All Issues | PropIQ Dashboard

PropIQ Daily Digest • Powered by Sentry & GA4
```

### Weekly Digest Email

**Subject:** `PropIQ Weekly Summary - Jan 1-7, 2026`

**Content:** (More detailed version with trends, resolved issues, and 10 top errors)

---

## API Endpoints Reference

### Generate Digest

**Endpoint:** `POST /api/digest/generate`

**Parameters:**
- `days` (int): Number of days to include (1 for daily, 7 for weekly)
- `send_email` (bool): Whether to send email (default: true)

**Example:**
```bash
curl -X POST "http://localhost:8000/api/digest/generate?days=7&send_email=true"
```

### Daily Digest

**Endpoint:** `POST /api/digest/daily`

**Description:** Generates and sends daily digest (last 24 hours)

**Example:**
```bash
curl -X POST http://localhost:8000/api/digest/daily
```

### Weekly Digest

**Endpoint:** `POST /api/digest/weekly`

**Description:** Generates and sends weekly digest (last 7 days)

**Example:**
```bash
curl -X POST http://localhost:8000/api/digest/weekly
```

### Health Check

**Endpoint:** `GET /api/digest/health`

**Example:**
```bash
curl http://localhost:8000/api/digest/health
```

---

## Troubleshooting

### Emails Not Sending

**Check 1: Resend API Key**
```bash
# Test Resend API
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_your_api_key_here' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "digest@propiq.luntra.one",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

**Check 2: Environment Variables**
```bash
# In backend directory
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('RESEND_API_KEY:', os.getenv('RESEND_API_KEY')[:10] + '...' if os.getenv('RESEND_API_KEY') else 'NOT SET')"
```

**Check 3: Digest Recipients**
```bash
# Check if recipients are configured
curl http://localhost:8000/api/digest/health | grep recipients_configured
```

### No Sentry Data

**Check 1: Sentry Auth Token**
```bash
# Test Sentry API
curl -H "Authorization: Bearer sntrys_your_token_here" \
  "https://sentry.io/api/0/projects/YOUR_ORG/propiq-frontend/issues/?statsPeriod=1d&limit=5"
```

**Check 2: Project Slugs**
Verify project names match exactly:
- Frontend: `propiq-frontend`
- Backend: `propiq-backend`
- Extension: `propiq-extension`

### Errors in Backend Logs

**Common Issues:**

1. **Invalid Sentry token:**
   ```
   Failed to fetch Sentry stats: 401 Unauthorized
   ```
   → Check SENTRY_AUTH_TOKEN

2. **Invalid Resend key:**
   ```
   Failed to send digest email: 401
   ```
   → Check RESEND_API_KEY

3. **No recipients:**
   ```
   DIGEST_RECIPIENTS not set, cannot send digest email
   ```
   → Set DIGEST_RECIPIENTS in .env

---

## Next Steps

### Immediate (Required)
1. ✅ Get Sentry API token
2. ✅ Get Resend API key
3. ✅ Configure environment variables
4. ✅ Test digest generation
5. ✅ Send test email

### Short-term (This Week)
1. ⏭ Set up Azure Logic Apps for scheduling
2. ⏭ Configure Sentry email notifications (see `SENTRY_EMAIL_NOTIFICATIONS_SETUP.md`)
3. ⏭ Configure GA4 email reports (see `GA4_EMAIL_REPORTS_SETUP.md`)
4. ⏭ Test automated scheduling

### Long-term (Future Enhancements)
1. 📊 Add GA4 analytics to digest
2. 📈 Add error trend charts
3. 🎯 Add performance metrics
4. 📱 Add Slack integration for critical errors
5. 🔔 Add push notifications for critical issues

---

## Resources

### Documentation
- **Sentry API:** https://docs.sentry.io/api/
- **Resend API:** https://resend.com/docs
- **Azure Logic Apps:** https://docs.microsoft.com/en-us/azure/logic-apps/

### PropIQ Files
- **Router:** `backend/routers/daily_digest.py`
- **Templates:** `backend/utils/email_templates.py`
- **API Registration:** `backend/api.py` (lines 305-311)

### Related Guides
- **Sentry Setup:** `SENTRY_EMAIL_NOTIFICATIONS_SETUP.md`
- **GA4 Setup:** `GA4_EMAIL_REPORTS_SETUP.md`

---

## Summary

✅ **Complete setup in 3 steps:**
1. Get Sentry + Resend API keys
2. Configure environment variables
3. Test and schedule

✅ **Benefits:**
- Single daily email with all errors
- No switching between Sentry/GA4 dashboards
- Automated delivery every morning
- Weekly comprehensive reports

✅ **Cost:**
- Sentry: Free tier (5K events/month)
- Resend: Free tier (3K emails/month)
- Azure Logic Apps: ~$0.01/day

---

**Status:** ✅ Ready to configure
**Time Required:** 20 minutes
**Next:** Get API keys and configure environment variables

**Last Updated:** January 1, 2026
**Author:** Claude Code
**Version:** 1.0.0
