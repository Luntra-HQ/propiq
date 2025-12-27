# PropIQ Bug Tracking & Issue Management Strategy

**Created:** December 19, 2025
**Purpose:** Systematic approach to discovering, tracking, and resolving production issues
**Goal:** Stop reactive debugging, start proactive monitoring

---

## 🎯 The Problem

**Current approach (reactive):**
- Wait for user to report issue
- Try to reproduce manually
- Fix → Test → Deploy
- Repeat for next issue
- **Result:** Slow, inefficient, misses many bugs

**Better approach (proactive):**
- Automatically detect issues before users report them
- Prioritize by real impact (not guesswork)
- Fix root causes (not symptoms)
- Prevent regressions with tests
- **Result:** Fast, efficient, high quality

---

## 🏗️ 3-Layer Detection System

### Layer 1: Automated Error Detection (Real-time)
**Tools:** Sentry (already configured!)
**What it catches:** Runtime errors, crashes, API failures

**How to use:**
1. **Check Sentry Dashboard Daily** (5 min/day)
   - URL: https://sentry.io/organizations/YOUR_ORG/projects/
   - Look for: New issues, spike in error rate, performance degradation

2. **Set up Slack Alerts** (one-time, 10 min)
   ```
   Sentry → Settings → Integrations → Slack
   Alert rules:
   - Error rate > 1% (send to #propiq-critical)
   - New issue type (send to #propiq-bugs)
   - Performance degradation (send to #propiq-alerts)
   ```

3. **Sentry gives you:**
   - Stack traces (exact line of code that failed)
   - User context (who experienced the bug)
   - Breadcrumbs (what they did before error)
   - Session replay (watch their session)
   - Frequency (how many users affected)

**Time saved:** 90% - You don't need to manually hunt for errors!

---

### Layer 2: User Behavior Analytics (Proactive)
**Tools:** Microsoft Clarity (already configured!)
**What it catches:** UX issues, silent failures, confusion points

**How to use:**
1. **Review Clarity Heatmaps** (10 min/week)
   - URL: https://clarity.microsoft.com/projects/view/tts5hc8zf8
   - Look for:
     - Dead clicks (users clicking non-clickable elements)
     - Rage clicks (users frustrated, clicking repeatedly)
     - Quick backs (users immediately leaving pages)
     - Excessive scrolling (users can't find something)

2. **Watch Session Recordings** (20 min/week)
   - Filter by: "Users who didn't complete signup"
   - Filter by: "Users who abandoned analysis"
   - **Look for:** Where do users get stuck?

3. **Clarity gives you:**
   - What users are trying to do (but can't)
   - Where they're confused
   - Which features are ignored
   - Which errors they see (but don't report)

**Time saved:** 80% - Users show you the bugs without reporting them!

---

### Layer 3: Chaos Engineering (Preventive)
**Tools:** Playwright tests (you have 30+ test files!)
**What it catches:** Edge cases, race conditions, failure modes

**How to use:**
1. **Run Critical Path Tests Daily** (automated via CI/CD)
   ```bash
   # Critical user journeys
   npx playwright test \
     tests/user-signup-integration.spec.ts \
     tests/customer-journey-scenarios.spec.ts \
     tests/stripe-webhook-chaos.spec.ts \
     --reporter=list
   ```

2. **Run Full Chaos Suite Weekly** (15 min)
   ```bash
   # All chaos tests
   npx playwright test tests/*chaos*.spec.ts --reporter=html
   ```

3. **Tests give you:**
   - Bugs before users see them
   - Regression prevention
   - Documentation of expected behavior
   - Confidence to deploy

**Time saved:** 95% - Catch bugs before production!

---

## 📊 Centralized Issue Tracking

### Use GitHub Issues (Not Manual Tracking)

**Why GitHub Issues > Manual Markdown:**
- ✅ Search & filter by label, status, assignee
- ✅ Link to PRs (see exactly what fixed it)
- ✅ Track time to resolution
- ✅ See trends over time
- ✅ Integrate with Sentry (auto-create issues)
- ❌ Manual tracking gets out of sync

**Setup (10 min one-time):**
1. Create issue labels:
   ```
   - bug-critical (blocks users)
   - bug-high (breaks feature)
   - bug-medium (annoying but workaround exists)
   - bug-low (minor UI issue)

   - area-auth (authentication/signup)
   - area-analysis (property analysis)
   - area-payments (Stripe)
   - area-ui (frontend)
   - area-api (backend)

   - source-sentry (caught by Sentry)
   - source-user-report (user complained)
   - source-test (found in testing)
   - source-clarity (found in Clarity)
   ```

2. Create issue templates:
   ```markdown
   ## Bug Report Template
   **Source:** [Sentry/User Report/Test/Clarity]
   **Severity:** [Critical/High/Medium/Low]
   **Area:** [Auth/Analysis/Payments/UI/API]

   **Description:**
   [What's broken?]

   **Impact:**
   - Users affected: [All/Some/Few]
   - Revenue impact: [Yes/No]
   - Workaround: [Yes/No]

   **Evidence:**
   - Sentry link: [URL]
   - Clarity session: [URL]
   - Test failure: [URL]

   **Reproduction:**
   1. Step 1
   2. Step 2
   3. Error occurs

   **Root Cause:** [After investigation]
   **Fix:** [PR link]
   ```

3. Connect Sentry to GitHub:
   ```
   Sentry → Settings → Integrations → GitHub
   Enable "Create GitHub issue from Sentry issue"
   ```

---

## 🚀 Weekly Workflow (90 min/week total)

### Monday: Triage (30 min)
1. **Check Sentry** (10 min)
   - Review new issues from past week
   - Create GitHub issues for each unique error
   - Label by severity & area

2. **Review Clarity** (10 min)
   - Watch 3-5 sessions where users failed signup
   - Watch 3-5 sessions where users abandoned analysis
   - Note patterns → Create GitHub issues

3. **Prioritize** (10 min)
   - Sort GitHub issues by: Impact × Frequency
   - High impact + High frequency = Fix this week
   - High impact + Low frequency = Fix this month
   - Low impact = Backlog

### Tuesday-Thursday: Fix (45 min total)
- Pick top 3 issues from GitHub
- Fix one per day (15 min each)
- Write test to prevent regression
- Deploy

### Friday: Prevent (15 min)
- Run full chaos test suite
- Fix any new failures
- Update tests based on this week's bugs

---

## 🎯 Smart Prioritization Matrix

### Priority Formula:
```
Priority Score = (Users Affected × Severity × Revenue Impact) / Time to Fix
```

**Example 1: Sign-up crashes**
- Users affected: ALL new users (100)
- Severity: CRITICAL (10)
- Revenue impact: HIGH (10) - can't sign up = no revenue
- Time to fix: 15 min (0.25 hours)
- **Score: (100 × 10 × 10) / 0.25 = 40,000** ← FIX NOW

**Example 2: Typo on FAQ page**
- Users affected: Few (10)
- Severity: LOW (1)
- Revenue impact: NONE (0)
- Time to fix: 2 min (0.03 hours)
- **Score: (10 × 1 × 0) / 0.03 = 0** ← Backlog

---

## 🔍 Root Cause Analysis (RCA) Template

When fixing bugs, always do RCA to prevent recurrence:

```markdown
## Bug: [Title]

### Symptom
What users experienced

### Root Cause
The actual underlying problem

### Fix
What code was changed

### Prevention
- Added test: [link to test]
- Added monitoring: [Sentry alert]
- Updated docs: [link]

### Related Issues
- Might also affect: [area X]
- Similar to previous bug: [issue #123]
```

**Example:**
```markdown
## Bug: Sign-up crashes randomly

### Symptom
Users click "Sign Up" → form freezes → no account created

### Root Cause
Frontend validates ≥8 char password
Backend requires ≥12 char + special char
→ Frontend says OK, backend rejects → appears to crash

### Fix
Updated frontend validation to match backend
File: frontend/src/components/SignupForm.tsx:145

### Prevention
- Added E2E test: tests/signup-validation.spec.ts
- Added Sentry alert: "Sign-up validation errors"
- Updated error message to be user-friendly

### Related Issues
- Check if login has same mismatch (#127)
- Check password reset flow (#128)
```

---

## 📈 Metrics to Track

### Weekly Review Dashboard

**Error Metrics (from Sentry):**
- Total errors this week: [number]
- New error types: [number]
- Repeat errors: [number]
- Users affected: [number]
- Error rate: [percentage]

**User Metrics (from Clarity):**
- Sign-up completion rate: [%]
- Analysis completion rate: [%]
- Dead clicks: [number]
- Rage clicks: [number]

**Fix Metrics (from GitHub):**
- Issues opened: [number]
- Issues closed: [number]
- Average time to fix: [hours]
- Critical issues open: [number]

**Health Score:**
```
Health = (1 - Error Rate) × Sign-up Rate × Analysis Completion Rate × 100
Target: > 95
```

---

## 🛠️ Tools Setup Checklist

### One-Time Setup (30 min total)

- [ ] **Sentry** (5 min)
  - [ ] Add DSN keys to environment variables
  - [ ] Test frontend error capture
  - [ ] Test backend error capture
  - [ ] Set up Slack integration

- [ ] **Clarity** (already done ✅)
  - Project ID: tts5hc8zf8

- [ ] **GitHub Issues** (10 min)
  - [ ] Create issue labels
  - [ ] Create issue templates
  - [ ] Connect Sentry integration

- [ ] **CI/CD Tests** (15 min)
  - [ ] Add GitHub Action to run tests on PR
  - [ ] Add daily cron job for chaos tests
  - [ ] Configure test failure notifications

---

## 🚨 Incident Response Playbook

### Critical Bug (Service Down)
1. **Immediate (0-5 min):**
   - Check Sentry for error spike
   - Check Clarity for user impact
   - Post in Slack: "Investigating [issue]"

2. **Mitigation (5-15 min):**
   - Rollback to previous version (if recent deploy)
   - OR apply hotfix
   - Verify issue resolved in Sentry

3. **Communication (15-30 min):**
   - Notify affected users
   - Post status update
   - Update status page

4. **Post-Mortem (within 24 hours):**
   - Write RCA
   - Add tests to prevent recurrence
   - Update monitoring/alerts

---

## 💡 Pro Tips

### 1. **Sentry Breadcrumbs**
Add breadcrumbs in code to understand user flow:
```typescript
Sentry.addBreadcrumb({
  category: 'user-action',
  message: 'User clicked Analyze button',
  data: { address: '123 Main St' }
});
```

### 2. **Sentry User Context**
Always set user context on login:
```typescript
Sentry.setUser({
  id: userId,
  email: userEmail,
  subscription: userTier
});
```

### 3. **Clarity Tagging**
Tag sessions by feature:
```javascript
clarity('set', 'feature', 'property-analysis');
clarity('set', 'tier', 'pro');
```

### 4. **Test-Driven Bug Fixes**
1. Write failing test that reproduces bug
2. Fix code until test passes
3. Bug can never come back (test prevents regression)

---

## 📚 Reference Links

**Monitoring:**
- Sentry Dashboard: https://sentry.io
- Clarity Dashboard: https://clarity.microsoft.com/projects/view/tts5hc8zf8
- GitHub Issues: https://github.com/YOUR_ORG/propiq/issues

**Documentation:**
- Sentry Setup: `/SENTRY_SETUP_GUIDE.md`
- Error Monitoring: `/docs/ERROR_MONITORING.md`
- Testing Guide: `/TESTING_QUICK_START.md`

**Internal Tracking:**
- Production Issues: `/PRODUCTION_ISSUES_TRACKER.md` (deprecated - use GitHub)
- Session Tracker: `/SESSION_TRACKER.md`

---

## 🎯 Success Criteria

**You're doing it right when:**
- ✅ You find bugs before users report them
- ✅ You can reproduce any bug in < 5 min (Sentry + Clarity)
- ✅ You fix critical bugs in < 1 hour
- ✅ Your error rate is < 0.1%
- ✅ Your tests prevent regressions
- ✅ You spend 90 min/week on bugs (not 10 hours)

**You're doing it wrong when:**
- ❌ Users report bugs you didn't know about
- ❌ You can't reproduce bugs
- ❌ Same bugs keep coming back
- ❌ You're manually testing everything
- ❌ You're firefighting constantly

---

## 🚀 Quick Start (Do This Now)

### 1. Set Up Sentry Alerts (5 min)
```bash
1. Go to https://sentry.io
2. Settings → Integrations → Slack
3. Create alert: "Error rate > 1%"
4. Create alert: "New issue created"
```

### 2. Check Clarity (5 min)
```bash
1. Go to https://clarity.microsoft.com/projects/view/tts5hc8zf8
2. Recordings → Filter: "Did not complete signup"
3. Watch 2-3 sessions
4. Note where users get stuck
```

### 3. Create First GitHub Issue (5 min)
```bash
1. Go to GitHub repo → Issues → New
2. Title: "Sign-up validation mismatch (from Sentry)"
3. Use bug report template
4. Add label: bug-critical, area-auth, source-sentry
5. Assign to yourself
```

### 4. Fix It (15 min)
- Update frontend validation to match backend
- Write test
- Deploy
- Close issue with PR link

**Total time:** 30 min
**Result:** First systematic bug fix ✅

---

**Last Updated:** December 19, 2025
**Next Review:** After 1 week of using this workflow
