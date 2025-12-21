# PropIQ Production Issues - Master Tracker

**Created:** December 19, 2025
**Purpose:** Persistent issue tracking across Claude Code sessions
**Status:** ACTIVE INVESTIGATION

---

## 🚨 **Critical Issues Reported**

### Issue #1: Sign-Up Flow Crashes at Different Points
**Severity:** CRITICAL
**Status:** ✅ **FIXED** (Dec 21, 2025)
**Reported:** User reports sign-up crashes inconsistently
**Impact:** Users cannot create accounts → Zero conversions
**Root Cause:** Password validation mismatch
- Frontend validates: ≥8 characters
- Backend requires: ≥12 characters + uppercase + lowercase + number + special char
- Users see green checkmark, backend rejects → appears to "crash"
**Test Results:** Confirmed via direct API test
- Weak password (8 chars): FAILED - "Password must be at least 12 characters long"
- Strong password (20 chars): SUCCESS - User created
**Fix Applied:** ✅
- Updated AuthModal.tsx and AuthModalV2.tsx to use validatePassword()
- Added PasswordStrengthIndicator component with real-time feedback
- Frontend now validates 12+ chars with uppercase, lowercase, number, special char
- Commit: 904de5f
**Time to Fix:** 20 minutes

### Issue #2: Reports Don't Save to User Accounts
**Severity:** CRITICAL
**Status:** INVESTIGATING
**Reported:** Property analysis reports are lost
**Impact:** Users lose work → Churn risk
**Details:**
- Users create reports but they don't persist
- Suggests database write failure or auth/session issue

### Issue #3: Previous Chaos Tests Forgotten
**Severity:** HIGH (Process Issue)
**Status:** ACKNOWLEDGED
**Reported:** Solutions built but not persisted across sessions
**Impact:** Repeated work, no progress
**Details:**
- Work gets done, then forgotten
- Need systematic documentation

---

## 📋 **Investigation Plan**

### Phase 1: Evidence Gathering (30 min)
**Goal:** Understand what's actually broken

**Steps:**
1. [ ] Check production logs for sign-up errors
2. [ ] Review Convex database for failed user creations
3. [ ] Check browser console errors (if available)
4. [ ] Review existing test results
5. [ ] Map the complete sign-up flow (code walkthrough)

**Output:** `SIGN_UP_FLOW_ANALYSIS.md`

---

### Phase 2: Issue Categorization (15 min)
**Goal:** Separate symptoms from root causes

**Categories:**
- **Auth Issues** - Session/token problems
- **Database Issues** - Write failures, sync problems
- **Network Issues** - API timeouts, race conditions
- **Validation Issues** - Form validation, data validation
- **State Management** - Frontend state bugs

**Output:** Categorized issue list with evidence

---

### Phase 3: Root Cause Analysis (45 min)
**Goal:** Find the ONE core issue causing multiple symptoms

**Approach:**
1. Start with most frequent failure point
2. Trace code from user action → database write
3. Identify failure point(s)
4. Test hypothesis with targeted fix

**Output:** Root cause identified with reproduction steps

---

### Phase 4: Systematic Fix (60 min)
**Goal:** Fix root cause + add tests to prevent regression

**Steps:**
1. [ ] Implement fix
2. [ ] Add unit tests
3. [ ] Add E2E test
4. [ ] Verify in production
5. [ ] Document in this file

**Output:** Verified fix with tests

---

### Phase 5: Monitoring & Documentation (30 min)
**Goal:** Ensure issue stays fixed

**Steps:**
1. [ ] Add error monitoring (Sentry/logging)
2. [ ] Create runbook for debugging
3. [ ] Update this tracker with resolution
4. [ ] Create "handoff file" for next session

**Output:** Production-ready monitoring + docs

---

## 🔍 **Evidence Collection**

### Sign-Up Flow Evidence
**Last Updated:** [Not started]

**Error Logs:**
```
[Paste error logs here when available]
```

**Failed User Creations:**
```
[Query Convex for failed signups]
```

**Console Errors:**
```
[Browser console errors during signup]
```

**Test Results:**
```
[Existing test failures related to signup]
```

---

### Report Saving Evidence
**Last Updated:** [Not started]

**Database Query:**
```
[Check if propertyAnalyses are being created]
```

**User Reports:**
```
[Specific user complaints about lost reports]
```

**Code Flow:**
```
[Trace: User clicks "Analyze" → API call → Database write]
```

---

## 🎯 **Hypothesis Tracking**

### Hypothesis 1: Auth Session Expiry
**Likelihood:** HIGH
**Reasoning:** "Crashes at different moments" suggests session timeout
**Test:** Check if failures correlate with time since signup
**Status:** NOT TESTED

### Hypothesis 2: Convex Write Race Condition
**Likelihood:** MEDIUM
**Reasoning:** Async writes might not complete before user navigates
**Test:** Add explicit await/promise handling
**Status:** NOT TESTED

### Hypothesis 3: Database Constraint Violation
**Likelihood:** MEDIUM
**Reasoning:** Duplicate user creation attempts
**Test:** Check Convex logs for constraint errors
**Status:** NOT TESTED

### Hypothesis 4: Frontend State Desync
**Likelihood:** LOW
**Reasoning:** React state not updating with Convex real-time data
**Test:** Check useQuery subscriptions
**Status:** NOT TESTED

---

## 📊 **Resolution History**

### Issue Resolutions Will Be Logged Here
Each resolution will include:
- Root cause identified
- Fix implemented
- Tests added
- Verification steps
- Date resolved

---

## 🔄 **Session Handoff Protocol**

### For Next Claude Code Session:
**To resume investigation:**
1. Read this file: `/Users/briandusape/Projects/LUNTRA/propiq/PRODUCTION_ISSUES_TRACKER.md`
2. Read latest analysis: `/Users/briandusape/Projects/LUNTRA/propiq/SIGN_UP_FLOW_ANALYSIS.md` (will be created)
3. Check Phase completion checkboxes
4. Continue from last incomplete phase

### Files to Always Check:
- `PRODUCTION_ISSUES_TRACKER.md` (this file) - Master issue list
- `SIGN_UP_FLOW_ANALYSIS.md` - Technical deep dive
- `CHAOS_TEST_RESULTS.md` - Previous test results
- `SESSION_TRACKER.md` - Current session work

---

## ⚠️ **Rules for Sustainable Progress**

1. **NEVER skip documentation** - Every finding goes in a file
2. **ALWAYS update this tracker** - Check boxes as you complete steps
3. **VERIFY before marking complete** - Test in production, not just locally
4. **CREATE handoff files** - Next session must be able to continue seamlessly
5. **ONE issue at a time** - Don't jump between problems

---

## 🚀 **Next Action (Right Now)**

**Phase 1, Step 1:** Check production logs for sign-up errors

**Command:**
```bash
# Check Convex logs for auth errors
# Review stripeEvents for payment issues
# Query users table for incomplete signups
```

**Expected Time:** 10 minutes
**Output:** Evidence section above gets filled in

---

**Status:** READY TO BEGIN INVESTIGATION
**Last Updated:** December 19, 2025 - File created
**Next Update:** After Phase 1 evidence gathering
