# GitHub Issues - PropIQ Launch Tracking

**Date:** 2026-01-02 19:15
**Purpose:** Track launch blockers and bugs discovered during Day 1 testing

---

## Issues Created

### P1 - Fix Before Launch (2 Open Issues)

#### Issue #18: 🟠 P1: Password Reset Navigation Timeout
- **URL:** https://github.com/Luntra-HQ/propiq/issues/18
- **Status:** OPEN
- **Priority:** HIGH (P1)
- **Labels:** bug, P1, high
- **Description:** Password reset tests timeout waiting for page navigation with token parameter
- **Impact:** Cannot verify password reset works end-to-end via automated tests
- **Action Required:** Manual verification before launch
- **Related Files:**
  - `frontend/src/pages/ResetPasswordPage.tsx`
  - `frontend/tests/password-reset.spec.ts`
  - `launch-blockers.md` (lines 85-100)

#### Issue #19: 🟡 P1: Duplicate Fetch on Password Reset Request
- **URL:** https://github.com/Luntra-HQ/propiq/issues/19
- **Status:** OPEN
- **Priority:** MEDIUM-HIGH (P1)
- **Labels:** bug, P1, medium
- **Description:** Frontend shows "TypeError: Failed to fetch" after successful HTTP 200 response
- **Impact:** Poor user experience (success message followed by console error)
- **Action Required:** Code review and fix duplicate API calls
- **Related Files:**
  - `frontend/src/pages/ResetPasswordPage.tsx` (lines 40-50 estimated)
  - `launch-blockers.md` (lines 102-111)

---

### P2 - Fix After Launch (1 Closed Issue)

#### Issue #20: 📚 P2: Rate Limiting Prevents Full Test Suite Execution (RESOLVED)
- **URL:** https://github.com/Luntra-HQ/propiq/issues/20
- **Status:** ✅ CLOSED (RESOLVED)
- **Priority:** LOW (P2)
- **Labels:** documentation, enhancement
- **Description:** Convex rate limiting prevents full automated test suite execution
- **Impact:** Cannot run 42 signup tests in reasonable time (would take 14 hours)
- **Resolution:** Comprehensive documentation created, manual testing strategy defined
- **Action Taken:**
  - Created `RATE_LIMITING_GUIDE.md` (580 lines)
  - Created `RATE_LIMITING_SOLUTION_SUMMARY.md` (366 lines)
  - Created `RATE_LIMITING_VERIFICATION_REPORT.md` (verification checklist)
  - Added rate limit helpers to test suite
  - Defined manual testing strategy for launch
  - Post-launch plan: Implement mocked unit tests
- **Related Files:**
  - `frontend/tests/RATE_LIMITING_GUIDE.md`
  - `RATE_LIMITING_SOLUTION_SUMMARY.md`
  - `RATE_LIMITING_VERIFICATION_REPORT.md`
  - `frontend/tests/helpers/convexTestHelpers.ts`
  - `frontend/tests/user-signup-integration.spec.ts`
  - `launch-blockers.md` (lines 118-136)
- **Note:** Rate limiting is a FEATURE, not a bug - working as intended

---

## Issue Status Summary

| Priority | Status | Count | Blocking Launch? |
|----------|--------|-------|------------------|
| P1       | OPEN   | 2     | YES - Need manual verification |
| P2       | CLOSED | 1     | NO - Documentation complete |
| **Total** |       | **3** | **2 open (P1)** |

---

## Pre-Existing Issues (For Reference)

PropIQ repository previously had issues #5-17 (all CLOSED), primarily related to security improvements implemented on December 31, 2025:

**Closed Security Issues:**
- #5: 🔴 CRITICAL: CONVEX_DEPLOY_KEY Exposed in .env.local
- #6: 🟠 HIGH: Overly Permissive CORS Configuration
- #7: 🟠 HIGH: Session Tokens in localStorage (XSS Risk)
- #8: 🟠 HIGH: No Rate Limiting on Authentication Endpoints (referenced in Issue #20)
- #9: 🟠 HIGH: Chrome Extension postMessage Security
- #10: 🟠 HIGH: Complete Stripe API Key Rotation
- #11: 🟡 MEDIUM: Missing Content Security Policy Headers
- #12: 🟡 MEDIUM: Sensitive Data in Error Messages
- #13: 🟡 MEDIUM: Token Lifetime Too Long
- #14: 🟡 MEDIUM: Insufficient Security Event Logging
- #15: 🟡 MEDIUM: Insufficient Password Validation Feedback
- #16: 🟡 MEDIUM: No HTTPS Enforcement in Development
- #17: 🔧 SECURITY: Implement Automated Secret Scanning

---

## Launch Blocker Analysis

### ✅ P0 Issues: 0 (CLEAR TO PROCEED)
**Previous P0 (RESOLVED):**
- Backend API unreachable (129 test failures)
- **Resolution:** Tests refactored to use Convex endpoints
- **Status:** ✅ FIXED

### ⚠️ P1 Issues: 2 (NEED MANUAL VERIFICATION)

**Issue #18:** Password Reset Navigation Timeout
- **Blocker Status:** YES - Need manual verification
- **Workaround:** Manual testing before launch
- **Time Required:** 10-15 minutes

**Issue #19:** Duplicate Fetch on Password Reset Request
- **Blocker Status:** MINOR - Doesn't break functionality
- **Workaround:** Can launch with console error (poor UX but not critical)
- **Fix Required:** Code review to find duplicate event handlers

### ✅ P2 Issues: 1 (NOT BLOCKING)
**Issue #20:** Rate Limiting - Documentation complete, not blocking launch

---

## Manual Testing Required Before Launch

Based on Issue #18, the following manual verification is required:

### Password Reset Flow Test
```bash
# Step 1: Request Password Reset
1. Open browser → http://localhost:5173
2. Click "Forgot Password?"
3. Enter test email: test.launch.reset@propiq-test.com
4. Submit form
5. ✅ Verify success message shown

# Step 2: Get Reset Token
1. Open Convex dashboard → https://dashboard.convex.dev
2. Navigate to PropIQ project (mild-tern-361)
3. Open "passwordResets" table
4. Find entry for test.launch.reset@propiq-test.com
5. Copy reset token

# Step 3: Reset Password
1. Visit: http://localhost:5173/#reset-password?token=XXXXX
2. ✅ Verify page loads (currently timing out in tests)
3. Enter new password: NewTestPassword456!@#
4. Confirm new password
5. Submit form
6. ✅ Verify success message

# Step 4: Verify Password Updated
1. Navigate to login page
2. Login with: test.launch.reset@propiq-test.com
3. Use NEW password: NewTestPassword456!@#
4. ✅ Verify successful login

# Step 5: Check Console (Issue #19)
1. Open browser dev tools → Console tab
2. Repeat password reset request
3. 🔍 Look for "TypeError: Failed to fetch" after success
4. Document if error appears
```

**Expected Duration:** 10-15 minutes
**Pass Criteria:** All ✅ steps must pass to verify password reset works

---

## Launch Decision Matrix

| Issue | Status | Blocks Launch? | Action Required |
|-------|--------|----------------|-----------------|
| #18: Password Reset Timeout | OPEN | YES | Manual verification (10-15 min) |
| #19: Duplicate Fetch Error | OPEN | NO* | Code review (can fix post-launch) |
| #20: Rate Limiting Docs | CLOSED | NO | None - documentation complete |

\* Issue #19 doesn't block launch because functionality works (just poor UX with console error)

### Launch Recommendation

**Can launch IF:**
- ✅ Issue #18 manual verification passes (password reset works)
- ⚠️ Issue #19 can be fixed post-launch (minor UX issue)

**Cannot launch IF:**
- ❌ Issue #18 manual verification fails (password reset broken)

---

## Post-Launch Action Items

### Week 1:
1. **Fix Issue #19:** Duplicate fetch error
   - Review ResetPasswordPage.tsx for duplicate event handlers
   - Test fix in development
   - Deploy patch

2. **Implement Mocked Tests (Issue #20):**
   - Create `tests/mocks/convexMock.ts`
   - Create `tests/user-signup-unit.spec.ts` with mocked responses
   - Run tests in CI/CD (<1 minute execution)

### Week 2+:
1. **Request Separate Convex Test Deployment (Issue #20):**
   - Contact Convex support for test environment
   - Configure relaxed rate limits (100/hour vs 3/hour)
   - Enable full automated test suite in CI/CD

2. **Fix Issue #18 (if not resolved):**
   - Debug password reset page navigation
   - Fix routing or token handling
   - Re-enable automated password reset tests

---

## References

### Documentation Created
- `launch-blockers.md` - Main bug tracker
- `RATE_LIMITING_GUIDE.md` - Comprehensive rate limiting guide
- `RATE_LIMITING_SOLUTION_SUMMARY.md` - Executive summary
- `RATE_LIMITING_VERIFICATION_REPORT.md` - Verification checklist
- `GITHUB_ISSUES_SUMMARY.md` - This file

### Test Results
- `DAY_1_MORNING_TEST_RESULTS.md` - Initial test execution results
- `TEST_REFACTORING_COMPLETE.md` - Test suite refactoring summary
- `CONVEX_INVESTIGATION_REPORT.md` - Architecture analysis

### Related GitHub Issues
- Issue #8: Rate Limiting Implementation (closed Dec 31, 2025)
- Issue #18: Password Reset Navigation Timeout (open, P1)
- Issue #19: Duplicate Fetch Error (open, P1)
- Issue #20: Rate Limiting Documentation (closed, P2)

---

## Next Steps

1. **Immediate (Next 30 Minutes):**
   - [ ] Run manual password reset verification (Issue #18)
   - [ ] Document results in launch-blockers.md
   - [ ] Update Pre-Launch Confidence Score

2. **If Password Reset Passes:**
   - [ ] Update Issue #18 with manual test results
   - [ ] Proceed to Day 1 Afternoon testing (payment flows)
   - [ ] Update confidence score: 18% → 60-70%

3. **If Password Reset Fails:**
   - [ ] Debug ResetPasswordPage.tsx routing
   - [ ] Fix navigation issue
   - [ ] Re-test manually
   - [ ] Delay launch if cannot fix

---

**Last Updated:** 2026-01-02 19:15
**Total Open Issues:** 2 (both P1)
**Blocking Launch:** 1 (Issue #18 requires manual verification)
**Ready for Launch:** Pending manual verification
