# Sentry Slack Alerts - Step-by-Step Setup

**Time:** 10 minutes
**Result:** Get notified in Slack when errors happen

---

## 🎯 What You'll Get

**After setup, when an error happens:**
1. User gets error in PropIQ
2. Sentry captures it
3. **You get Slack message immediately:**
   ```
   🚨 New Issue in PropIQ
   SignupForm.tsx:145 - TypeError: Cannot read property 'length'
   45 users affected | View in Sentry →
   ```

---

## 📋 Step-by-Step Setup

### Step 1: Log into Sentry (1 min)

1. **Go to:** https://sentry.io/auth/login/
2. **Login** with your account
3. **Select organization** (if you have multiple)

**Your Sentry DSNs show you're already registered:**
- Frontend DSN: `o4510522471219200.ingest.us.sentry.io`
- Backend DSN: `o4510522471219200.ingest.us.sentry.io`

**Your organization ID:** `4510522471219200`

---

### Step 2: Go to Integrations (1 min)

1. **Click** on the ⚙️ gear icon (Settings) in the top right
2. **Click** "Integrations" in the left sidebar
3. **Find** "Slack" in the list
   - Or search for "Slack" in the search box

**Direct URL:**
```
https://sentry.io/organizations/YOUR_ORG_SLUG/integrations/slack/
```

*(Replace YOUR_ORG_SLUG with your actual organization name)*

---

### Step 3: Install Slack Integration (2 min)

1. **Click** "Install" or "Add to Slack" button
2. **Slack will open** asking for permissions
3. **Select workspace** (your Slack workspace)
4. **Choose channel:**
   - Option 1: Create new channel `#propiq-alerts`
   - Option 2: Use existing channel like `#general`
5. **Click "Allow"** to grant permissions

**Permissions needed:**
- Post messages to specific channels
- Read basic channel info

---

### Step 4: Create Alert Rule (3 min)

After installing Slack integration:

1. **Go to Alerts:**
   ```
   https://sentry.io/organizations/YOUR_ORG_SLUG/alerts/rules/
   ```

2. **Click** "Create Alert Rule"

3. **Configure Alert #1: New Issues**

   **Name:** `New Issue Alert - PropIQ`

   **Conditions:**
   - ☑️ "When an event is first seen"
   - Environment: `production` (or `all environments`)

   **Filters (optional):**
   - Project: Select `propiq-frontend` AND `propiq-backend`
   - Level: `error` or `fatal`

   **Actions:**
   - ☑️ "Send a notification via Slack"
   - Select: `#propiq-alerts` channel
   - Notification: `[issue link] - [title] | [count] users affected`

   **Action Interval:** Immediately

   **Click** "Save Rule"

4. **Configure Alert #2: High Error Rate**

   **Name:** `High Error Rate - PropIQ`

   **Conditions:**
   - ☑️ "When an event happens"
   - Condition: `Error count` is `more than` `10` in `1 hour`

   **Filters:**
   - Environment: `production`
   - Level: `error` or `fatal`

   **Actions:**
   - ☑️ "Send a notification via Slack"
   - Select: `#propiq-alerts`
   - Message: `⚠️ High error rate detected`

   **Click** "Save Rule"

5. **Configure Alert #3: Frequency Alert** (optional)

   **Name:** `Same Error Recurring - PropIQ`

   **Conditions:**
   - ☑️ "An issue changes state from resolved to unresolved"

   **This alerts when:**
   - You marked an issue as "resolved"
   - But it happens again (regression)

   **Actions:**
   - ☑️ "Send a notification via Slack"
   - Select: `#propiq-alerts`

   **Click** "Save Rule"

---

### Step 5: Test the Integration (2 min)

1. **Trigger a test error** (use our test script):
   ```bash
   cd /Users/briandusape/Projects/LUNTRA/propiq
   chmod +x test-sentry-now.sh
   ./test-sentry-now.sh
   ```

2. **Or manually trigger:**
   ```bash
   # Backend test
   cd backend
   source venv/bin/activate
   python -c "from config.sentry_config import init_sentry, capture_exception; init_sentry(); capture_exception(Exception('Test Slack Alert'))"
   ```

3. **Check Slack:**
   - Within 30 seconds, you should see a message in `#propiq-alerts`
   - Message format:
     ```
     🔴 New Issue
     Exception: Test Slack Alert
     View issue →
     ```

4. **Click "View issue"** in Slack
   - Should open Sentry dashboard
   - Shows full error details

---

## 🎨 Customize Alert Messages (Optional)

### Default Slack Message Format:
```
[Issue Link] - [Title]
Level: error | Count: 45 users
```

### Custom Format (in Alert Rule settings):
```
🚨 *{title}*
👥 Users affected: {count}
📍 Location: {filename}:{lineno}
🔗 <{url}|View in Sentry>
```

**To customize:**
1. Edit alert rule
2. Scroll to "Actions"
3. Click "Customize message"
4. Use variables: `{title}`, `{count}`, `{url}`, `{filename}`, `{lineno}`

---

## 📊 Alert Rules Cheat Sheet

### Recommended Alert Setup

| Alert Name | Condition | When to Use | Channel |
|------------|-----------|-------------|---------|
| **New Issue** | First time error seen | New bugs | `#propiq-alerts` |
| **High Error Rate** | >10 errors in 1 hour | Something broke | `#propiq-critical` |
| **Regression** | Resolved issue returns | Bug came back | `#propiq-alerts` |
| **Slow Performance** | p95 > 1s | Performance issue | `#propiq-perf` |
| **User Feedback** | User reports bug | User complained | `#propiq-support` |

---

## 🔕 Managing Alert Fatigue

### If You Get Too Many Alerts:

**Problem:** Too many alerts, you start ignoring them

**Solution 1: Increase Thresholds**
```
Instead of: "Error count > 1 in 1 hour"
Use: "Error count > 10 in 1 hour"
```

**Solution 2: Filter by Environment**
```
Only alert on: Environment = "production"
Ignore: Environment = "development" or "staging"
```

**Solution 3: Ignore Known Errors**
```
In Alert Rule → Filters → Add:
"Error message does not contain '404'"
"Error message does not contain 'Network request failed'"
```

**Solution 4: Use Issue States**
```
Only alert on: "When issue is unresolved"
This prevents alerts for issues you already know about
```

---

## 🧪 Testing Your Alerts

### Test Checklist

- [ ] **Test 1: New Issue Alert**
  - Trigger new error → Should get Slack message

- [ ] **Test 2: High Frequency Alert**
  - Trigger same error 10+ times → Should get Slack message

- [ ] **Test 3: Click Slack Link**
  - Click "View issue" → Should open Sentry dashboard

- [ ] **Test 4: Silence Alert**
  - Mute an issue in Sentry → Should NOT get Slack messages for it

- [ ] **Test 5: Resolve Issue**
  - Mark issue as resolved → Should NOT get more alerts for it

---

## 🚨 Troubleshooting

### "I'm not getting Slack notifications"

**Check 1: Is Slack connected?**
```
Sentry → Settings → Integrations → Slack
Should show: "Installed" with green checkmark
```

**Check 2: Is alert rule enabled?**
```
Sentry → Alerts → Rules
Your rule should NOT be paused/disabled
```

**Check 3: Does error match filters?**
```
Check alert rule filters:
- Environment matches? (production vs development)
- Project matches? (propiq-frontend vs propiq-backend)
- Level matches? (error, warning, info)
```

**Check 4: Trigger test alert**
```
In Alert Rule → Click "Test Rule"
Should send test notification to Slack
```

---

### "Slack messages don't include details"

**Fix:** Customize message format
```
1. Edit alert rule
2. Actions → "Customize notification"
3. Add variables: {title}, {culprit}, {count}, {url}
```

---

### "Alerts going to wrong channel"

**Fix:** Update Slack workspace settings
```
1. Sentry → Settings → Integrations → Slack
2. Click "Configure"
3. Change default channel
4. Or update per-rule in Alert Rule settings
```

---

## 📱 Mobile Notifications (Bonus)

### Get Alerts on Your Phone

**Option 1: Slack Mobile App**
1. Install Slack on phone
2. Enable push notifications for `#propiq-alerts`
3. You'll get phone notifications when errors happen

**Option 2: Sentry Mobile App**
1. Install "Sentry" app from App Store
2. Login with your Sentry account
3. Enable push notifications
4. Get notified directly from Sentry

---

## 🎯 Success Criteria

**You've set it up correctly when:**
- ✅ Test error triggers Slack message within 30 seconds
- ✅ Slack message includes error details and link
- ✅ Clicking link opens correct Sentry issue
- ✅ You can mute/resolve issues from Sentry dashboard
- ✅ Alerts only come for production errors (not dev)

---

## 🔗 Quick Links

**Your Sentry Dashboard:**
```
https://sentry.io/organizations/[YOUR_ORG]/
```

**Sentry Integrations:**
```
https://sentry.io/organizations/[YOUR_ORG]/integrations/
```

**Alert Rules:**
```
https://sentry.io/organizations/[YOUR_ORG]/alerts/rules/
```

**Sentry Slack Docs:**
```
https://docs.sentry.io/product/integrations/notification-incidents/slack/
```

---

## ✅ Next Steps After Setup

1. [ ] Test all 3 alert types
2. [ ] Create `#propiq-alerts` Slack channel (if not exists)
3. [ ] Invite team members to channel
4. [ ] Set up notification preferences (mute at night?)
5. [ ] Document response process ("What to do when alert fires")

---

## 📋 Alert Response Checklist

**When you get a Slack alert:**

1. ⏱️ **Within 5 minutes:**
   - [ ] Click Sentry link
   - [ ] Read error message
   - [ ] Check: How many users affected?
   - [ ] Check: Is service down?

2. 🔥 **If Critical (service down):**
   - [ ] Post in Slack: "Investigating [issue]"
   - [ ] Check recent deployments
   - [ ] Consider rollback
   - [ ] Fix or hotfix within 1 hour

3. ⚠️ **If High (feature broken):**
   - [ ] Create GitHub issue
   - [ ] Assign to developer
   - [ ] Fix within 24 hours

4. 📝 **If Medium/Low:**
   - [ ] Create GitHub issue
   - [ ] Add to sprint backlog
   - [ ] Fix within 1 week

---

**Last Updated:** December 19, 2025
**Status:** Ready to configure
**Time Required:** 10 minutes
