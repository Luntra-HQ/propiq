# How Sentry Works - Simple Guide

**Created:** December 19, 2025

---

## 🎯 What is Sentry?

**Think of Sentry as a security camera for your code.**

- When something breaks in your app, Sentry automatically takes a "snapshot"
- Shows you: what broke, who it affected, how to reproduce it
- Sends you alerts so you know immediately

---

## 🔄 How It Works (Step by Step)

### 1. **Error Happens in Production**
```
User clicks "Sign Up" → Password validation fails → JavaScript error
```

### 2. **Sentry Captures the Error (Automatically)**
Sentry SDK (installed in your code) catches the error and collects:
- **What:** "Uncaught TypeError: Cannot read property 'length' of undefined"
- **Where:** `SignupForm.tsx:145` (exact line of code)
- **Who:** User ID, email, subscription tier
- **When:** 2025-12-19 14:32:15 PST
- **How:** Breadcrumbs (what user did before error)
  - Clicked "Sign Up"
  - Typed password
  - Clicked "Submit"
  - Error occurred

### 3. **Sentry Sends Data to Dashboard**
```
Your App → Sentry SDK → Sentry.io Server → Sentry Dashboard
```

### 4. **You Get Notified**
- Slack: "🚨 New error in PropIQ: SignupForm.tsx:145"
- Email: "Error rate increased by 200%"
- Dashboard: See all errors grouped by type

### 5. **You Debug Faster**
Instead of asking user "What did you do?"
You see:
- Exact stack trace
- User's actions leading up to error
- Session replay (watch their session like a video)
- How many users affected

---

## 📊 Your Current Setup

### Frontend (React)
**File:** `frontend/src/config/sentry.ts`
**DSN:** `https://40030bebf39c05993afb993b0b81630b@o4510522471219200.ingest.us.sentry.io/4510522474496000`

**What it tracks:**
- JavaScript errors (uncaught exceptions)
- React component errors
- API call failures
- Performance (page load time, slow requests)
- User actions (breadcrumbs)

**Initialized in:** `frontend/src/main.tsx:31-32`

### Backend (FastAPI)
**File:** `backend/config/sentry_config.py`
**DSN:** `https://427c9f40afdbd3c2ec43f062f5609257@o4510522471219200.ingest.us.sentry.io/4510535827849216`

**What it tracks:**
- Python exceptions
- API endpoint errors
- Database errors
- Performance (slow endpoints)
- User context (who made the request)

**Initialized in:** `backend/api.py:29-30`

---

## 🧪 How to Test It's Working

### Frontend Test (3 min)

**Option 1: Browser Console**
```javascript
// Open your app in browser
// Open DevTools Console (F12)
// Run this:
throw new Error("Test Sentry Error from Console");
```

**Option 2: Use Test Function**
```bash
# Start dev server
cd /Users/briandusape/Projects/LUNTRA/propiq/frontend
npm run dev

# Open browser: http://localhost:5173
# Open console and paste:
import('/src/utils/testSentry.ts').then(m => m.testSentryFrontend())
```

**Expected result:**
- Console shows: "Test error sent to Sentry"
- Within 30 seconds, error appears in Sentry dashboard

### Backend Test (2 min)

**Option 1: Test Endpoint**
```bash
# If you have a test endpoint
curl -X POST http://localhost:8000/test-sentry
```

**Option 2: Trigger Error in Python**
```python
# Add this to any backend endpoint temporarily
from config.sentry_config import capture_exception

try:
    raise Exception("Test Sentry Error from Backend")
except Exception as e:
    capture_exception(e)
```

**Expected result:**
- Error appears in Sentry dashboard within 30 seconds

---

## 🔍 Understanding Sentry Dashboard

### 1. **Issues Tab** (Main view)
**URL:** https://sentry.io/organizations/YOUR_ORG/issues/

**What you see:**
```
Issue                           Users    Events    Last Seen
SignupForm.tsx:145 TypeError       45       123    2 mins ago
payment.py:67 StripeError          12        34    15 mins ago
```

**Click on an issue to see:**
- Stack trace (exact code that failed)
- User details (who experienced it)
- Breadcrumbs (what they did before error)
- Session replay (watch their session)
- Similar issues (is this related to other bugs?)

### 2. **Performance Tab**
**What you see:**
- Slow API endpoints (p95 response time)
- Slow page loads
- Database query performance
- Trends over time

### 3. **Alerts Tab**
**What you configure:**
- When to get notified
- Where to send alerts (Slack, email, PagerDuty)
- Thresholds (e.g., "error rate > 1%")

---

## 🔔 How Alerts Work

### Alert Flow
```
1. Error happens → 2. Sentry receives it → 3. Checks alert rules → 4. Sends notification

Example:
User gets error → Sentry detects → "Error rate > 1%" rule triggered → Slack message sent
```

### Alert Types

**1. New Issue Alert**
- **When:** First time Sentry sees this error
- **Why:** New bugs should be investigated immediately
- **Example:** "New error: Cannot read property 'length' of undefined"

**2. Error Rate Alert**
- **When:** Error rate exceeds threshold
- **Why:** Sudden spike means something broke
- **Example:** "Error rate increased from 0.1% to 5%"

**3. Frequency Alert**
- **When:** Same error happens too many times
- **Why:** Recurring issue affecting many users
- **Example:** "SignupForm error happened 50 times in 1 hour"

---

## 🚀 What You Should Do Daily

### Morning Check (5 min)
```bash
1. Open Sentry dashboard
2. Check for new issues (red badges)
3. Check error rate trend (is it increasing?)
4. Click on top 3 most frequent errors
5. Create GitHub issues for any critical ones
```

### When You Get an Alert
```bash
1. Read Slack notification
2. Click link to Sentry issue
3. Review stack trace & breadcrumbs
4. Check: Is this critical? (blocks users?)
5. If yes: Fix within 1 hour
6. If no: Create GitHub issue, fix this week
```

---

## 💡 Sentry Best Practices

### ✅ Do This

**1. Set User Context (after login)**
```typescript
// Frontend (after user logs in)
import { setUserContext } from './config/sentry';

setUserContext(userId, email, subscriptionTier);
```

```python
# Backend (in auth endpoint)
from config.sentry_config import set_user_context

set_user_context(user_id, email, subscription_tier)
```

**Why:** Know WHO is affected by bugs

**2. Add Breadcrumbs (for debugging)**
```typescript
// Before important actions
import { addBreadcrumb } from './config/sentry';

addBreadcrumb('User clicked Analyze', 'user-action', 'info', {
  address: '123 Main St'
});
```

**Why:** Understand what user did BEFORE error

**3. Tag Errors by Feature**
```typescript
import { setTag } from './config/sentry';

setTag('feature', 'property-analysis');
setTag('tier', userTier);
```

**Why:** Filter errors by feature in dashboard

### ❌ Don't Do This

**1. Don't Log Sensitive Data**
```typescript
// ❌ BAD
captureException(error, { password: userPassword }); // NEVER

// ✅ GOOD
captureException(error, { userId: userId });
```

**2. Don't Track Expected Errors**
```typescript
// ❌ BAD - 404s are expected
if (response.status === 404) {
  captureException(new Error("404"));
}

// ✅ GOOD - Only track unexpected errors
if (response.status >= 500) {
  captureException(new Error("Server error"));
}
```

**3. Don't Ignore Sentry**
- If you get alerts, investigate them
- If you don't act on alerts, turn them off (reduces noise)

---

## 🎯 Common Questions

### Q: "I don't see errors in Sentry"
**A:** Check:
1. Is DSN configured? (`echo $VITE_SENTRY_DSN`)
2. Is app running? (dev server or production)
3. Did you trigger a test error?
4. Check browser console for "Sentry initialized"

### Q: "Too many alerts!"
**A:** Tune your alert rules:
1. Increase thresholds (e.g., 5% instead of 1%)
2. Filter out known errors
3. Use "Issue States" (only alert on unresolved issues)

### Q: "How much does Sentry cost?"
**A:**
- Free: 5,000 errors/month
- Team: $26/month for 50,000 errors
- Business: $80/month for 100,000 errors

**Your usage:** Likely within free tier for MVP

### Q: "Should I use Sentry in development?"
**A:** Yes, but with different settings:
- Development: Catch errors early
- Production: Monitor user-facing issues

---

## 📈 Metrics to Track

### Weekly Sentry Review

**Error Health:**
- Total errors this week: _____
- New error types: _____
- Repeat errors: _____
- Users affected: _____
- Error rate: _____% (target: < 0.5%)

**Top 3 Errors:**
1. ________________ (_____ users affected)
2. ________________ (_____ users affected)
3. ________________ (_____ users affected)

**Actions Taken:**
- [ ] Created GitHub issues for critical errors
- [ ] Fixed top error
- [ ] Updated alert thresholds

---

## 🔗 Quick Links

**Your Sentry Organization:**
- Dashboard: https://sentry.io/organizations/YOUR_ORG/
- Frontend Project: https://sentry.io/organizations/YOUR_ORG/projects/propiq-frontend/
- Backend Project: https://sentry.io/organizations/YOUR_ORG/projects/propiq-backend/

**Documentation:**
- Sentry Docs: https://docs.sentry.io
- React Integration: https://docs.sentry.io/platforms/javascript/guides/react/
- FastAPI Integration: https://docs.sentry.io/platforms/python/integrations/fastapi/

---

## ✅ Next Steps

1. [ ] Test Sentry is working (trigger test error)
2. [ ] Set up Slack alerts
3. [ ] Add user context after login
4. [ ] Review Sentry dashboard daily (5 min)
5. [ ] Create GitHub issues from Sentry errors

---

**Status:** Sentry configured and ready to use
**Last Updated:** December 19, 2025
