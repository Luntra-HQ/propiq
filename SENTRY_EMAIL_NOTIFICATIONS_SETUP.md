# Sentry Email Notifications Setup

**Goal:** Receive email notifications when errors occur in PropIQ
**Time:** 15 minutes
**Result:** Daily/weekly error summaries + critical error alerts via email

---

## Overview

Sentry offers multiple email notification options:
1. **Personal Notifications** - Emails sent to your account
2. **Team Notifications** - Emails sent to specific team members
3. **Alert Rules** - Custom email alerts based on conditions
4. **Digest Emails** - Daily/weekly summaries

---

## Step 1: Configure Personal Email Notifications

### 1.1 Log into Sentry

```
https://sentry.io/auth/login/
```

**Your Organization ID:** `4510522471219200`
**Projects:**
- `propiq-frontend` - React app errors
- `propiq-backend` - FastAPI errors

### 1.2 Go to User Settings

1. Click your **profile icon** (top right)
2. Click **"User Settings"**
3. Or go directly to: `https://sentry.io/settings/account/notifications/`

### 1.3 Configure Notification Settings

**Email Notifications Tab:**

```
☑ Workflow Notifications
   ☑ Issue State Changes (New, Resolved, Regressed)
   ☑ Issue Assignment
   ☑ Comments and Mentions

☑ Deploy Notifications
   ☑ Deploy started
   ☑ Deploy completed
   ☑ Deploy failed

☑ Weekly Reports
   ☑ Send me a weekly report of my organization's activity

☐ Quota Notifications (optional)
   ☐ Quota exceeded
   ☐ Quota warnings
```

**Recommended Settings for Solo Developer:**
- ✅ Issue State Changes (know when new errors occur)
- ✅ Weekly Reports (get summary every Monday)
- ❌ Comments (not needed if you're solo)
- ❌ Quota warnings (unless approaching limits)

### 1.4 Set Email Delivery

**Delivery Method:**
- Select: **"Send me an email immediately"**
- Or: **"Send me an email every hour"** (batched)

**Recommended:** Immediate for critical, hourly for non-critical

---

## Step 2: Set Up Project-Specific Alert Rules

Alert rules let you send emails based on specific conditions.

### 2.1 Navigate to Alerts

```
https://sentry.io/organizations/YOUR_ORG_SLUG/alerts/rules/
```

### 2.2 Create Alert Rule for Critical Errors

1. Click **"Create Alert Rule"**

2. **Set Conditions:**
   ```
   When: An event is seen
   If: event.level equals error OR fatal
   And: event.tags[severity] equals critical
   ```

3. **Set Actions:**
   ```
   Then: Send a notification via Email
   To: your-email@example.com
   ```

4. **Name the rule:**
   ```
   Critical Errors - Immediate Email
   ```

5. **Click "Save Rule"**

### 2.3 Create Alert Rule for High Error Frequency

1. Click **"Create Alert Rule"**

2. **Set Conditions:**
   ```
   When: An event is seen
   If: The issue has happened at least 10 times in 1 hour
   ```

3. **Set Actions:**
   ```
   Then: Send a notification via Email
   To: your-email@example.com
   ```

4. **Name the rule:**
   ```
   High Frequency Errors - Email Alert
   ```

5. **Click "Save Rule"**

### 2.4 Create Alert Rule for New Issues

1. Click **"Create Alert Rule"**

2. **Set Conditions:**
   ```
   When: A new issue is created
   If: The issue is first seen
   And: event.level equals error OR fatal
   ```

3. **Set Actions:**
   ```
   Then: Send a notification via Email
   To: your-email@example.com
   ```

4. **Name the rule:**
   ```
   New Issues - Email Alert
   ```

5. **Click "Save Rule"**

---

## Step 3: Configure Weekly Digest Emails

Weekly digests give you a summary of all activity.

### 3.1 Enable Weekly Reports

1. Go to: `https://sentry.io/settings/account/notifications/`
2. Scroll to **"Weekly Reports"**
3. Check: **"Send me a weekly report of my organization's activity"**
4. **Delivery time:** Defaults to Monday 9 AM (your local time)

### What's Included:
- Total errors this week
- Most common errors
- New issues introduced
- Resolved issues
- Users affected
- Top browsers/devices with errors

---

## Step 4: Configure Email for Specific Projects

You can customize email settings per project.

### 4.1 Frontend Project Settings

1. Go to: `https://sentry.io/organizations/YOUR_ORG_SLUG/projects/propiq-frontend/`
2. Click **"Settings"** → **"Notifications"**
3. Under **"Email"**:
   ```
   ☑ Send me email when:
      ☑ New issues are created
      ☑ Issues change state (Resolved → Unresolved)
      ☑ Issues are assigned to me
   ```

### 4.2 Backend Project Settings

Repeat the same for `propiq-backend`:
1. Go to: `https://sentry.io/organizations/YOUR_ORG_SLUG/projects/propiq-backend/`
2. Click **"Settings"** → **"Notifications"**
3. Configure same as frontend

---

## Step 5: Email Template Customization (Optional)

Sentry email templates are not customizable, but you can:
- Add email rules with custom titles
- Use Slack + email (for richer formatting in Slack)
- Create custom email service (see Step 6 below)

---

## Step 6: Custom Daily Digest Email (Advanced)

If you want more control, create a custom daily digest using Sentry API.

**This is implemented in:** `backend/routers/sentry_digest.py` (see below)

**Features:**
- Fetch errors from Sentry API
- Combine with GA4 analytics
- Send custom formatted email via SendGrid/Resend
- Schedule daily at 8 AM

---

## Email Examples

### Critical Error Email (Immediate)

```
Subject: 🚨 Critical Error in PropIQ - Backend

A critical error has occurred:

Error: DatabaseConnectionError
Message: Failed to connect to Convex database
Location: backend/api.py:145
Environment: Production
Users Affected: 12
First Seen: 2026-01-01 14:23:45 UTC

View in Sentry: https://sentry.io/issues/12345

--
PropIQ Error Monitoring
Powered by Sentry
```

### Weekly Digest Email

```
Subject: 📊 PropIQ Weekly Error Report - Jan 1-7, 2026

This Week's Summary:
• 45 total errors (↓ 12% from last week)
• 3 new issues introduced
• 8 issues resolved
• 120 users affected

Top 3 Issues:
1. TypeError: Cannot read property 'price' (18 occurrences)
   → Fix: Add null check in zillow-parser.ts:234

2. NetworkError: Timeout connecting to API (12 occurrences)
   → Fix: Increase timeout to 10s

3. AuthError: Invalid JWT token (8 occurrences)
   → Fix: Refresh token before expiry

Performance:
• Frontend: 2.3s avg load time
• Backend: 145ms avg response time
• Error rate: 0.3% (within target)

View Full Report: https://sentry.io/organizations/YOUR_ORG

--
PropIQ Weekly Digest
Powered by Sentry
```

---

## Recommended Email Configuration

### For Solo Developer (You):

**Daily:**
- ❌ No daily emails (too noisy)

**Weekly:**
- ✅ Weekly digest (Monday 9 AM)

**Immediate:**
- ✅ Critical errors only
- ✅ New issues (first occurrence)
- ✅ High frequency errors (10+ in 1 hour)

**Hourly:**
- ❌ Not needed (use Slack for faster response)

### For Team (Future):

**Daily:**
- ✅ Daily digest to team email
- ✅ Daily stats summary

**Weekly:**
- ✅ Weekly digest to all team members

**Immediate:**
- ✅ Critical errors to on-call engineer
- ✅ New issues to team lead

---

## Testing Email Notifications

### Test 1: Trigger Test Error

**Frontend:**
```bash
cd /Users/briandusape/Projects/propiq
./test-sentry-now.sh
```

**Expected:**
- Console shows test errors sent
- Email arrives within 5-10 minutes (if immediate)
- Check spam folder if not in inbox

### Test 2: Check Sentry Dashboard

1. Go to: `https://sentry.io/organizations/YOUR_ORG_SLUG/issues/`
2. Look for test errors
3. Verify email was sent (check Sentry → Activity)

### Test 3: Verify Email Settings

1. Go to: `https://sentry.io/settings/account/notifications/`
2. Click **"Send Test Email"** (if available)
3. Check inbox for Sentry test email

---

## Troubleshooting

### Not Receiving Emails

**Check 1: Email Address Verified**
1. Go to: `https://sentry.io/settings/account/emails/`
2. Verify your email is listed and verified
3. Click "Send Verification Email" if needed

**Check 2: Notification Settings**
1. Go to: `https://sentry.io/settings/account/notifications/`
2. Ensure email notifications are enabled
3. Check "Delivery method" is set correctly

**Check 3: Alert Rules**
1. Go to: `https://sentry.io/organizations/YOUR_ORG_SLUG/alerts/rules/`
2. Verify alert rules are active (not muted)
3. Check rule conditions match your errors

**Check 4: Spam Folder**
- Sentry emails may be filtered as spam
- Add `@sentry.io` to safe senders list
- Check spam/junk folder

**Check 5: Email Quota**
- Free tier: 5,000 events/month
- If exceeded, emails may stop
- Check: `https://sentry.io/organizations/YOUR_ORG_SLUG/stats/`

### Emails Too Frequent

**Solution 1: Adjust Alert Rules**
- Change "immediately" to "hourly" or "daily"
- Increase threshold (10+ errors → 50+ errors)

**Solution 2: Mute Noisy Issues**
1. Go to issue in Sentry
2. Click "Mute" or "Ignore"
3. Set duration or conditions

**Solution 3: Use Slack Instead**
- Configure Slack for immediate alerts
- Use email for daily/weekly summaries only

---

## Email Frequency Recommendations

| Alert Type | Frequency | Example |
|------------|-----------|---------|
| **Critical Errors** | Immediate | Database down, API key invalid |
| **New Issues** | Hourly batch | First occurrence of any error |
| **High Frequency** | Immediate | Same error 10+ times in 1 hour |
| **Resolved Issues** | Daily digest | Issues fixed in last 24 hours |
| **Weekly Summary** | Monday 9 AM | Full week's error report |

---

## Next Steps

1. ✅ **Set up email notifications** (follow steps above)
2. ✅ **Configure alert rules** (critical, new, high frequency)
3. ✅ **Enable weekly digest**
4. ⏭️ **Set up GA4 email reports** (see `GA4_EMAIL_REPORTS_SETUP.md`)
5. ⏭️ **Create custom daily digest** (combines Sentry + GA4)

---

## Resources

**Sentry Documentation:**
- Email Notifications: https://docs.sentry.io/product/alerts/notifications/
- Alert Rules: https://docs.sentry.io/product/alerts/alert-types/
- Weekly Reports: https://docs.sentry.io/product/reports/

**Your Sentry URLs:**
- Dashboard: `https://sentry.io/organizations/YOUR_ORG_SLUG/`
- Issues: `https://sentry.io/organizations/YOUR_ORG_SLUG/issues/`
- Alerts: `https://sentry.io/organizations/YOUR_ORG_SLUG/alerts/rules/`
- Settings: `https://sentry.io/settings/account/notifications/`

---

**Status:** ✅ Ready to configure
**Time Required:** 15 minutes
**Next:** Configure GA4 email reports
