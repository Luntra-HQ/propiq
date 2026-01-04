# Google Analytics 4 Email Reports Setup

**Goal:** Receive daily/weekly analytics reports via email
**Time:** 10 minutes
**Result:** Automated email reports with traffic, errors, and user behavior

---

## Overview

Google Analytics 4 offers built-in email reporting that can send you:
- **Scheduled Reports** - Daily, weekly, or monthly summaries
- **Custom Insights** - Specific metrics you care about
- **Audience Reports** - User demographics and behavior
- **Real-time Alerts** - When specific events occur

---

## Step 1: Access Google Analytics 4

### 1.1 Log Into GA4

```
https://analytics.google.com
```

**Your GA4 Setup:**
- Property: "PropIQ Chrome Extension" or "PropIQ Web App"
- Measurement ID: `G-XXXXXXXXXX` (from your analytics setup)

### 1.2 Verify GA4 Installation

**Check if GA4 is already tracking:**
1. Go to: `https://analytics.google.com`
2. Select your property
3. Go to "Reports" → "Real-time"
4. Visit your site/extension
5. Verify events appear in real-time

---

## Step 2: Create Custom Report

Before scheduling emails, create the report you want to receive.

### 2.1 Navigate to Library

1. Click **"Reports"** in left sidebar
2. Click **"Library"** at the bottom
3. Click **"Create new report"**

### 2.2 Create PropIQ Daily Summary

**Report Name:** "PropIQ Daily Summary"

**Metrics to Include:**
- Total users
- New users
- Sessions
- Engagement rate
- Events count
- Error events count (`error_occurred`)
- Property analyzed count
- Average session duration

**Dimensions to Add:**
- Date
- Source/Medium
- Device category
- Extension version (if using extension)

**Configuration:**
```
Report Type: Detail report
Dimensions: Date
Metrics: Users, Sessions, Events, error_occurred
Date Range: Last 7 days
```

### 2.3 Create PropIQ Error Report

**Report Name:** "PropIQ Error Tracking"

**Metrics:**
- `error_occurred` event count
- Users with errors
- Error rate (errors / total events)

**Dimensions:**
- Error type
- Error context
- Extension version
- Browser

**Filters:**
- Event name = `error_occurred`

### 2.4 Create PropIQ User Behavior Report

**Report Name:** "PropIQ User Behavior"

**Metrics:**
- Properties analyzed
- Demo mode usage
- Login/signup conversions
- Feature usage

**Dimensions:**
- User type (new vs returning)
- Date
- Source

---

## Step 3: Schedule Email Reports

GA4 has limited email scheduling (unlike Universal Analytics). Here are your options:

### Option 1: Looker Studio (Recommended)

GA4 integrates with Looker Studio (formerly Data Studio) for better email reporting.

#### 3.1 Create Looker Studio Report

1. Go to: `https://lookerstudio.google.com`
2. Click **"Create"** → **"Report"**
3. Select **"Google Analytics"** connector
4. Choose your GA4 property
5. Select account, property, and data stream

#### 3.2 Design Report

**Add Scorecards:**
- Total Users (last 7 days)
- Total Errors
- Total Analyses
- Error Rate

**Add Time Series Charts:**
- Users over time
- Errors over time
- Analyses over time

**Add Tables:**
- Top errors by type
- Top pages with errors
- User demographics

#### 3.3 Schedule Email Delivery

1. Click **"Share"** button (top right)
2. Click **"Schedule email delivery"**
3. **Configure:**
   ```
   Recipients: your-email@example.com
   Subject: PropIQ Daily Analytics - [Date]
   Frequency: Daily
   Time: 8:00 AM (your timezone)
   Attach report: PDF
   ```
4. Click **"Schedule"**

**Result:** You'll receive a PDF report every morning at 8 AM!

### Option 2: GA4 Insights (Limited)

GA4 automatically generates insights, but email delivery is limited.

#### 3.4 Enable Insights Notifications

1. Go to GA4 → **"Insights"** (in left sidebar)
2. Click the bell icon 🔔
3. Enable: **"Email me when new insights are available"**

**What you'll get:**
- Weekly summary of automatic insights
- Anomaly detection (sudden traffic changes)
- New user segments discovered

**Limitation:** Can't customize what's included

### Option 3: GA4 API + Custom Email (Advanced)

For full control, fetch GA4 data via API and send custom emails.

**This is implemented in:** `backend/routers/analytics_digest.py` (see Step 4 below)

---

## Step 4: Create Custom Analytics Digest (Advanced)

For complete control, create a custom service that:
1. Fetches data from GA4 API
2. Fetches errors from Sentry API
3. Combines into single daily digest email
4. Sends via SendGrid/Resend

**Implementation:** See `CUSTOM_DAILY_DIGEST_SETUP.md`

---

## Recommended Email Schedule

### Daily Email (8 AM)
**Content:**
- Users yesterday vs last week
- Errors yesterday
- Top 3 errors
- Properties analyzed
- Demo mode usage

**Trigger:** Looker Studio scheduled report

### Weekly Email (Monday 9 AM)
**Content:**
- Full week summary
- Week-over-week growth
- All errors this week
- User retention
- Feature usage breakdown

**Trigger:** Looker Studio scheduled report + Sentry weekly digest

---

## Email Report Templates

### Daily Analytics Email (Looker Studio)

```
Subject: PropIQ Daily Analytics - January 1, 2026

Yesterday's Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 45 users (↑ 12% from last week)
🏠 67 properties analyzed
⚠️  3 errors (0.4% error rate)
🎯 28% demo mode usage

Top Errors:
1. TypeError: Cannot read 'price' (2 occurrences)
2. NetworkError: API timeout (1 occurrence)

User Sources:
• Chrome Web Store: 28 users
• Organic: 12 users
• Product Hunt: 5 users

Device Breakdown:
• Desktop: 80%
• Mobile: 20%

View Full Report: [Looker Studio Dashboard]

--
PropIQ Analytics
Powered by Google Analytics 4
```

### Weekly Summary Email

```
Subject: PropIQ Weekly Summary - Jan 1-7, 2026

This Week's Highlights:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Growth:
• 234 users (↑ 18% from last week)
• 89 new users (38% of total)
• 3.2 sessions per user

🏠 Feature Usage:
• 456 properties analyzed
• 112 users used demo mode (48%)
• 23 signups
• 5 subscriptions started

⚠️  Errors:
• 18 total errors (0.5% error rate)
• 3 new error types this week
• 2 critical errors (resolved)

Top Issues:
1. TypeError: Cannot read 'price' (8x)
   Status: Fixed in v1.2.1
2. NetworkError: API timeout (5x)
   Status: Investigating
3. ParseError: Missing rent field (3x)
   Status: Added fallback

🎯 User Retention:
• Day 7: 42% (↑ 5% from last week)
• Day 30: 28%

📊 Traffic Sources:
• Chrome Web Store: 45%
• Organic Search: 30%
• Product Hunt: 15%
• Direct: 10%

View Full Report: [Looker Studio Dashboard]
View Errors: [Sentry Dashboard]

--
PropIQ Weekly Digest
```

---

## Setting Up Looker Studio Report (Step-by-Step)

### 1. Create New Report

1. **Go to:** `https://lookerstudio.google.com`
2. **Click:** "Create" → "Report"
3. **Select:** "Google Analytics"
4. **Authorize:** Google Analytics access
5. **Choose:**
   - Account: Your GA4 account
   - Property: PropIQ property
   - Click "Add"

### 2. Add Scorecards (KPIs)

**Scorecard 1: Total Users**
- Metric: Active users
- Date range: Last 7 days
- Comparison: Previous period

**Scorecard 2: Total Errors**
- Metric: Event count
- Filter: Event name = `error_occurred`
- Date range: Last 7 days

**Scorecard 3: Properties Analyzed**
- Metric: Event count
- Filter: Event name = `property_analyzed`
- Date range: Last 7 days

**Scorecard 4: Error Rate**
- Metric: Calculated field
  ```
  Formula: error_occurred / total_events * 100
  Format: Percent
  ```

### 3. Add Time Series Chart

**Chart: Users Over Time**
- Dimension: Date
- Metric: Active users
- Date range: Last 30 days
- Style: Line chart

**Chart: Errors Over Time**
- Dimension: Date
- Metric: Event count (error_occurred)
- Date range: Last 30 days
- Style: Bar chart

### 4. Add Table (Top Errors)

**Table: Top Errors by Type**
- Dimension: Error type (custom parameter)
- Metrics: Event count, Unique users
- Sort by: Event count descending
- Rows: 10

### 5. Add Filter Controls

- Date range selector
- Extension version dropdown
- Device category dropdown

### 6. Style Report

- **Theme:** Choose professional theme
- **Colors:** Match PropIQ brand
- **Logo:** Add PropIQ logo (top left)

### 7. Share & Schedule

1. **Click** "Share" (top right)
2. **Add recipients:** your-email@example.com
3. **Subject:** "PropIQ Daily Analytics - [Date]"
4. **Frequency:** Daily at 8:00 AM
5. **Attach:** PDF
6. **Click** "Schedule"

---

## Testing

### Test Email Report

1. **In Looker Studio:**
   - Click "Share" → "Schedule email delivery"
   - Click "Send now" (instead of scheduling)
   - Check email inbox for report

2. **Verify Data:**
   - Open PDF attachment
   - Verify metrics are correct
   - Check charts render properly

3. **Adjust if Needed:**
   - Edit report layout
   - Fix broken metrics
   - Re-send test

---

## Troubleshooting

### No Data in Report

**Solution:**
1. Verify GA4 is tracking events
2. Check "Real-time" report in GA4
3. Ensure date range includes data
4. Verify filters aren't excluding all data

### Email Not Arriving

**Solution:**
1. Check spam folder
2. Verify email address is correct
3. Check Looker Studio → "Schedule email delivery" status
4. Add `@google.com` to safe senders

### Report Shows Wrong Data

**Solution:**
1. Verify GA4 property selection
2. Check date range filter
3. Verify custom parameters are tracked
4. Review calculated field formulas

---

## Next Steps

1. ✅ **Create Looker Studio report** (10 minutes)
2. ✅ **Schedule daily email** (2 minutes)
3. ✅ **Test email delivery** (1 minute)
4. ⏭️ **Create custom daily digest** (combines Sentry + GA4)

---

## Resources

**Looker Studio:**
- Dashboard: `https://lookerstudio.google.com`
- Templates: `https://lookerstudio.google.com/gallery`
- Docs: `https://support.google.com/looker-studio`

**Google Analytics 4:**
- Dashboard: `https://analytics.google.com`
- Help: `https://support.google.com/analytics`
- GA4 API: `https://developers.google.com/analytics/devguides/reporting/data/v1`

---

**Status:** ✅ Ready to configure
**Time Required:** 10 minutes
**Next:** Create custom daily digest (Sentry + GA4 combined)
