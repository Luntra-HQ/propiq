# Microsoft Clarity - Smart Setup Guide

**Goal:** Track real user sessions, filter out your own testing, get notified of issues

---

## 🎯 How Clarity Works (Different from Sentry)

**Sentry:** Sends email for EVERY error → Good for immediate alerts
**Clarity:** Records ALL sessions → You review dashboard when needed

**Why no email alerts by default?**
- You'd get 1000s of emails (one per session)
- Instead: Check dashboard weekly, filter for problem sessions

---

## ✅ Step 1: Verify Clarity is Tracking (2 min)

### Check If Installed

Your Clarity script is in: `frontend/index.html`

Let me verify it's there...

### Test if Working

1. **Go to:** https://clarity.microsoft.com/projects/view/tts5hc8zf8
2. **Check:** "Recordings" tab
3. **Look for:** Sessions from today

**If you see sessions:** ✅ It's working!
**If you see 0 sessions:** ❌ Script issue or not deployed

---

## 🚫 Step 2: Filter Out Your Own Sessions (5 min)

### Option 1: Block Your IP Address (Recommended)

**On Clarity Dashboard:**

1. Go to: https://clarity.microsoft.com/projects/view/tts5hc8zf8/settings
2. Click **"IP blocking"** tab
3. Click **"Add IP address"**
4. Get your IP:
   ```bash
   curl ifconfig.me
   ```
   (e.g., `73.162.45.123`)
5. Paste your IP → Save
6. **Result:** Your sessions won't be recorded

**Pros:**
- ✅ Clean - no test sessions at all
- ✅ Won't affect analytics

**Cons:**
- ❌ Can't watch your own sessions for debugging
- ❌ If IP changes (mobile, different location), you'll be tracked again

---

### Option 2: Tag Your Sessions (Recommended for Testing)

**Add this to your code:**

**File:** `frontend/src/main.tsx` (or wherever you initialize app)

```typescript
// Detect if this is a test user (YOU)
const isTestUser =
  window.location.hostname === 'localhost' || // Local dev
  localStorage.getItem('clarity_test_user') === 'true'; // Manual flag

if (isTestUser && typeof clarity === 'function') {
  // Tag your sessions so you can filter them out
  clarity('set', 'test_user', 'true');
  clarity('set', 'user_type', 'developer');
}
```

**To manually mark yourself as test user:**
```javascript
// In browser console when testing:
localStorage.setItem('clarity_test_user', 'true');
clarity('set', 'test_user', 'true');
```

**Then in Clarity Dashboard:**
1. Go to Recordings
2. Add filter: `Custom tag` → `test_user` → `is not` → `true`
3. Save as default filter
4. **Result:** Only see real user sessions

**Pros:**
- ✅ Can still watch your own sessions if needed
- ✅ Easy to toggle on/off
- ✅ Works across different IPs

**Cons:**
- ❌ Requires code change

---

## 📧 Step 3: Set Up Smart Alerts (Email for Problems Only)

Clarity can send emails for **specific behaviors** (not every session).

### Alert 1: Rage Clicks (Users Frustrated)

**What it is:** User rapidly clicks same element (sign of frustration/bug)

**Setup:**
1. Go to: https://clarity.microsoft.com/projects/view/tts5hc8zf8/insights
2. Click **"Create insight"**
3. Select: **"Rage clicks"**
4. Configure:
   - Rage clicks: `> 3` per session
   - On page: `All pages` (or specific like `/signup`)
   - Time period: `Last 7 days`
5. Click **"Get notified"**
6. Enter email: `bdusape@luntra.one`
7. Frequency: `Daily digest` (not real-time - too many alerts)
8. Save

**Result:** Email every day with list of sessions where users rage-clicked

---

### Alert 2: Dead Clicks (Users Confused)

**What it is:** User clicks non-clickable element (thinks it's a button but it's not)

**Setup:**
1. Insights → Create insight
2. Select: **"Dead clicks"**
3. Configure:
   - Dead clicks: `> 2` per session
   - On page: `All pages`
4. Click **"Get notified"**
5. Email: `bdusape@luntra.one`
6. Frequency: `Daily digest`
7. Save

**Result:** Email daily with sessions where UI is confusing

---

### Alert 3: Quick Backs (Users Leaving Immediately)

**What it is:** User lands on page, immediately hits back button

**Setup:**
1. Insights → Create insight
2. Select: **"Quick backs"**
3. Configure:
   - Page: `/signup` or `/pricing` (key pages)
   - Time on page: `< 5 seconds`
4. Get notified → Daily digest
5. Save

**Result:** Know which pages are causing immediate exits

---

### Alert 4: JavaScript Errors (Similar to Sentry)

**What it is:** Clarity also tracks JS errors (overlaps with Sentry, but shows in session context)

**Setup:**
1. Insights → Create insight
2. Select: **"JavaScript errors"**
3. Configure:
   - Error count: `> 0`
   - Page: `All pages`
4. Get notified → Daily digest
5. Save

**Result:** See errors in context of user session

---

## 📊 Step 4: Review Dashboard Weekly (15 min/week)

Instead of email alerts for every session, **schedule weekly review:**

### Weekly Clarity Check (Fridays, 15 min)

**1. Heatmaps (5 min)**
- Go to: Heatmaps tab
- Check: What are users clicking?
- Look for: Dead clicks (red dots on non-clickable elements)

**2. Recordings (10 min)**
- Go to: Recordings tab
- Filter by:
  - **"Did not complete signup"** (filter by URL path: started `/signup`, didn't reach `/welcome`)
  - **"Rage clicks > 0"** (users frustrated)
  - **"Errors > 0"** (users experiencing bugs)
- Watch 5-10 sessions
- Note patterns → Create GitHub issues

---

## 🎨 Clarity Filters Cheat Sheet

### Useful Filters for Weekly Review

| Filter | What to Look For | Indicates |
|--------|------------------|-----------|
| **Rage clicks > 3** | What element are they clicking? | Button not working OR slow response |
| **Dead clicks > 2** | What looks clickable but isn't? | Confusing UI |
| **Session duration < 10s** | Why did they leave so fast? | Bad landing page OR wrong audience |
| **Pages visited > 10** | Where are they getting lost? | Can't find what they need |
| **URL contains /signup** | Where do they drop off? | Signup friction |

---

## 🚫 Pro Tip: Exclude Test Sessions Automatically

### Create Saved Filter: "Real Users Only"

**In Clarity Dashboard:**
1. Go to Recordings
2. Add filters:
   - Custom tag `test_user` → `is not` → `true`
   - OR IP address → `is not` → `YOUR_IP`
   - AND Session duration → `> 5 seconds` (filters out accidental clicks)
3. Click **"Save as default filter"**
4. Name it: `Real Users Only`

**Result:** Every time you open Clarity, only see real user sessions

---

## 📧 Email Notification Settings

### Recommended Setup (Balance: Stay Informed, Not Overwhelmed)

**Daily Digest (Best for Solo Dev):**
- ☑️ Rage clicks insight (> 3 per session)
- ☑️ JavaScript errors insight (> 0)
- ☐ Dead clicks (optional - can be noisy)
- ☐ Quick backs (optional - can be noisy)

**Receive email at:** 9 AM every day with summary of issues

**Weekly Digest (Alternative):**
- If daily is too much, switch to weekly
- Get one email every Monday with full week summary

---

## 🧪 Test Your Setup (5 min)

### Verify Clarity is Tracking

**1. Open your site in incognito window:**
```bash
# Start dev server
cd /Users/briandusape/Projects/LUNTRA/propiq/frontend
npm run dev

# Open: http://localhost:5173
```

**2. Do some actions:**
- Click around
- Navigate between pages
- Trigger an error (optional)

**3. Wait 2 minutes**

**4. Check Clarity dashboard:**
- Go to: Recordings → Last 30 minutes
- Should see your session

**5. Tag it as test:**
- Click on your session
- Add tag: `test_user: true`
- Now it will be filtered out

---

## 🔍 Clarity vs Sentry: When to Use Each

| Tool | Best For | Check Frequency |
|------|----------|-----------------|
| **Sentry** | Runtime errors, crashes, API failures | Real-time (email alerts) |
| **Clarity** | UX issues, user confusion, behavior patterns | Weekly (dashboard review) |

**Workflow:**
1. **Sentry alert** → Something broke, fix immediately
2. **Clarity review** → Users are confused, improve UX this sprint

---

## ✅ Quick Setup Checklist

**Do this now (10 min):**

- [ ] **Verify Clarity is tracking**
  - Go to: https://clarity.microsoft.com/projects/view/tts5hc8zf8
  - Check for sessions from today

- [ ] **Block your IP (Option 1)**
  - Get IP: `curl ifconfig.me`
  - Add to IP blocking in Clarity settings

  **OR**

- [ ] **Add test user tagging (Option 2)**
  - Add code to `frontend/src/main.tsx`
  - Tag your localhost sessions

- [ ] **Create "Real Users Only" filter**
  - Recordings → Add filters → Save as default

- [ ] **Set up 2 insights with daily digest**
  - Rage clicks insight
  - JavaScript errors insight

- [ ] **Schedule weekly review**
  - Calendar: Every Friday, 15 min, review Clarity

---

## 🎯 Success Criteria

**You've set it up correctly when:**
- ✅ Clarity dashboard shows real user sessions (not just yours)
- ✅ You get daily email digest with problem sessions (if any)
- ✅ Your own testing doesn't clutter the data
- ✅ You can watch session replays of real users
- ✅ You review dashboard weekly and find UX issues

---

## 🔗 Quick Links

**Your Clarity Dashboard:**
```
https://clarity.microsoft.com/projects/view/tts5hc8zf8
```

**Recordings:**
```
https://clarity.microsoft.com/projects/view/tts5hc8zf8/recordings
```

**Insights:**
```
https://clarity.microsoft.com/projects/view/tts5hc8zf8/insights
```

**Settings (IP blocking):**
```
https://clarity.microsoft.com/projects/view/tts5hc8zf8/settings
```

---

## 📝 Sample Email You'll Receive

**Subject:** `[Clarity] Daily Insight: Rage clicks detected`

**Body:**
```
PropIQ - Daily Summary

🔴 Rage Clicks (5 sessions)
Users repeatedly clicked:
- "Sign Up" button (3 sessions) → Not responding?
- "Analyze" button (2 sessions) → Too slow?

View sessions →

📊 Top Issues This Week:
- Rage clicks: 15 total
- Dead clicks: 8 total
- Quick backs: 3 on /pricing

Review dashboard →
```

---

**Last Updated:** December 19, 2025
**Project:** PropIQ
**Clarity ID:** tts5hc8zf8
