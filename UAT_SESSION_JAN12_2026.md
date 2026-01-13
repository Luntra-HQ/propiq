# 🧪 PropIQ UAT Session - January 12, 2026

**UAT Lead:** Brian Dusape
**Session Start:** January 12, 2026 (1 day before launch!)
**Launch Target:** Monday, January 13, 2026 @ 12:01 AM PST

---

## 🚨 CRITICAL BUG FIXED BEFORE TESTING

### BUG #001: Password Reset Null Auth Error (P0 BLOCKER) ✅ FIXED

**Status:** ✅ RESOLVED @ 1:20 PM EST Jan 12, 2026
**Commit:** 6866283
**Deployed:** ✅ Pushing to production now (Netlify auto-deploy ~2 min)

**Error Details:**
```
TypeError: Cannot read properties of null (reading 'auth')
Location: ResetPasswordPage.tsx:50
Test Case: UAT-012 (Forgot Password Flow)
```

**Root Cause:**
- `api.auth` was null during initial page load
- Code tried to access `api.auth.verifyResetToken` before Convex initialized
- Caused immediate crash on /forgot-password page

**The Fix:**
```tsx
// BEFORE (BROKEN):
const tokenVerification = useQuery(
  api.auth?.verifyResetToken ?? (undefined as any),
  token ? { token } : 'skip'
);

// AFTER (FIXED):
const tokenVerification = useQuery(
  api.auth?.verifyResetToken,
  !api.auth || !token ? 'skip' : { token }
);
```

**Verification:**
- ✅ Build succeeds (38.96s)
- ✅ No type errors
- ✅ Deployed to production
- ⏳ Waiting for Netlify deploy (~2 minutes)

---

## 📊 UAT PROGRESS TRACKER

### Test Execution Status

| Priority | Total Tests | Completed | Pass | Fail | Blocked | Skip | % Complete |
|----------|-------------|-----------|------|------|---------|------|------------|
| **P0** (Critical) | 20 | 0 | 0 | 0 | 0 | 0 | 0% |
| **P1** (High) | 32 | 0 | 0 | 0 | 0 | 0 | 0% |
| **P2** (Medium) | 28 | 0 | 0 | 0 | 0 | 0 | 0% |
| **P3** (Low) | 12 | 0 | 0 | 0 | 0 | 0 | 0% |
| **TOTAL** | **92** | **0** | **0** | **0** | **0** | **0** | **0%** |

**Overall Pass Rate:** 0% (Target: 95%+)

---

## 🎯 IMMEDIATE P0 TESTING (REQUIRED FOR LAUNCH)

### Test Session 1: Critical Revenue Flow (NOW!)

**Time Budget:** 60 minutes
**Goal:** Verify the 3 critical paths work

---

### ✅ UAT-001: Free Tier Signup

**Priority:** P0 (CRITICAL - LAUNCH BLOCKER)
**Status:** ⏳ PENDING

**Test Steps:**
1. Open https://propiq.luntra.one in **incognito window**
2. Click "Get Started Free" or "Sign Up"
3. Fill in form:
   - Email: `brian-uat-001@gmail.com` (use your real email!)
   - Password: `TestPropIQ2026!`
4. Click "Create Account"
5. **Expected:** Email verification sent
6. Check inbox for verification email
7. Click verification link
8. **Expected:** Redirected to dashboard
9. **Expected:** Shows "Free Trial" tier
10. **Expected:** Shows "3/3 analyses remaining"

**Result:** ☐ PASS | ☐ FAIL | ☐ BLOCKED

**Notes:**
_____________________________________________
_____________________________________________

**If FAIL, document error:**
_____________________________________________
_____________________________________________

---

### ✅ UAT-003: Stripe Checkout (Pro Tier)

**Priority:** P0 (CRITICAL - LAUNCH BLOCKER)
**Status:** ⏳ PENDING

**Test Steps:**
1. Log in with account from UAT-001
2. Go to Pricing page
3. Click "Upgrade" or "Create Account" under **Pro** ($79/mo)
4. **Expected:** Redirects to Stripe Checkout
5. Fill in Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/28`
   - CVC: `123`
   - Name: "Test User"
   - Zip: "19103"
6. Click "Subscribe"
7. **Expected:** Payment succeeds
8. **Expected:** Redirects back to PropIQ dashboard
9. **Expected:** Tier shows "Pro"
10. **Expected:** Usage limit shows "100 analyses/month"

**Result:** ☐ PASS | ☐ FAIL | ☐ BLOCKED

**Notes:**
_____________________________________________
_____________________________________________

**If FAIL, document error:**
_____________________________________________
_____________________________________________

---

### ✅ UAT-016: PropIQ Analysis (Core Feature)

**Priority:** P0 (CRITICAL - LAUNCH BLOCKER)
**Status:** ⏳ PENDING

**Test Steps:**
1. Log in with Pro account from UAT-003
2. Click "Analyze Property" or "New Analysis"
3. Enter test property:
   - Address: `1234 Spruce St, Philadelphia, PA 19103`
   - Purchase Price: `$300,000`
   - Down Payment: `20%`
   - Interest Rate: `7.5%`
   - Monthly Rent: `$2,500`
4. Click "Analyze Property"
5. **Expected:** Analysis starts (loading indicator)
6. **Expected:** Analysis completes in < 30 seconds
7. **Expected:** Shows AI recommendations
8. **Expected:** Shows deal score (0-100)
9. **Expected:** Shows cash flow projection
10. **Expected:** Analysis saved to history
11. Check usage counter: **Expected:** 99/100 remaining

**Result:** ☐ PASS | ☐ FAIL | ☐ BLOCKED

**Notes:**
_____________________________________________
_____________________________________________

**If FAIL, document error:**
_____________________________________________
_____________________________________________

---

### ✅ UAT-012: Forgot Password Flow

**Priority:** P0 (CRITICAL - LAUNCH BLOCKER)
**Status:** ⏳ PENDING (Just fixed!)

**Test Steps:**
1. Log out of PropIQ
2. Go to login page
3. Click "Forgot Password?"
4. **Expected:** No JavaScript errors (check console F12)
5. **Expected:** Page loads successfully
6. Enter email: `brian-uat-001@gmail.com`
7. Click "Send Reset Link"
8. **Expected:** Success message appears
9. Check email inbox
10. **Expected:** Reset email received
11. Click reset link in email
12. **Expected:** Redirects to reset password page
13. **Expected:** Shows email address (pre-filled)
14. Enter new password: `NewTestPassword2026!`
15. Confirm password: `NewTestPassword2026!`
16. Click "Reset Password"
17. **Expected:** Success message
18. **Expected:** Redirects to login
19. Log in with new password
20. **Expected:** Login succeeds

**Result:** ☐ PASS | ☐ FAIL | ☐ BLOCKED

**Notes:**
_____________________________________________
_____________________________________________

**If FAIL, document error:**
_____________________________________________
_____________________________________________

---

## 🐛 BUGS FOUND DURING THIS SESSION

### Bug Summary

| Bug ID | Test Case | Description | Status | Priority | Assigned | ETA |
|--------|-----------|-------------|--------|----------|----------|-----|
| BUG-001 | UAT-012 | Password reset null auth error | ✅ FIXED | P0 | Claude | ✅ DONE |
| BUG-002 | UAT-___ | _________________________ | Open | P__ | _______ | __/__/__ |
| BUG-003 | UAT-___ | _________________________ | Open | P__ | _______ | __/__/__ |

---

## 🚦 LAUNCH DECISION (After Testing)

### Scenario A: All 4 P0 Tests PASS ✅

**Decision:** 🟢 **GO FOR LAUNCH MONDAY**

**Next Steps:**
1. ✅ Continue with 5-Day Launch Plan (Day 2-5)
2. ✅ Create Product Hunt materials (screenshots, demo video)
3. ✅ Build upvote network (email 100+ supporters)
4. ✅ Launch Monday 12:01 AM PST

---

### Scenario B: 1-2 P0 Tests FAIL ⚠️

**Decision:** 🟡 **FIX BUGS, THEN DECIDE**

**Timeline:**
- If bugs fixable in < 4 hours → Launch Monday (tight!)
- If bugs need > 4 hours → Delay to Wednesday Jan 15

**Next Steps:**
1. Document exact errors
2. Have Claude Code fix bugs using PRE_LAUNCH_DEBUG_WORKFLOW.md
3. Re-test after fixes
4. Make final go/no-go decision by midnight tonight

---

### Scenario C: 3-4 P0 Tests FAIL ❌

**Decision:** 🔴 **DELAY LAUNCH**

**Reason:** Product is broken, need time to fix properly

**New Launch Date Options:**
- Wednesday, January 15, 2026 (2-day delay)
- Friday, January 17, 2026 (4-day delay)

**Next Steps:**
1. Systematic debugging of all failures
2. Full regression testing after fixes
3. Re-run all P0 tests
4. Announce delay to any early supporters

---

## ⏱️ TESTING TIMELINE

**Total Time Estimate:** 60-90 minutes for 4 P0 tests

| Test | Time Estimate | Status |
|------|---------------|--------|
| UAT-001 (Signup) | 15 min | ⏳ Not started |
| UAT-003 (Payment) | 20 min | ⏳ Not started |
| UAT-016 (Analysis) | 15 min | ⏳ Not started |
| UAT-012 (Password Reset) | 20 min | ⏳ Not started |
| **TOTAL** | **70 min** | **0% complete** |

---

## 📝 QUICK NOTES SECTION

Use this space for quick observations during testing:

**What's Working Well:**
- _____________________________________________
- _____________________________________________

**Unexpected Issues:**
- _____________________________________________
- _____________________________________________

**User Experience Notes:**
- _____________________________________________
- _____________________________________________

---

## 🎯 SUCCESS CRITERIA CHECKLIST

Before you can launch, verify:

- [ ] UAT-001: Signup works (email sent, account created)
- [ ] UAT-003: Payment works (Stripe checkout succeeds)
- [ ] UAT-016: Analysis works (AI generates results)
- [ ] UAT-012: Password reset works (no errors, email sent)
- [ ] No P0 bugs open
- [ ] Site loads in < 3 seconds
- [ ] No console errors on critical pages

**If all boxes checked:** 🟢 READY TO LAUNCH!

---

## 🚀 DEPLOYMENT STATUS

**Production URL:** https://propiq.luntra.one
**Last Deployment:** January 12, 2026 @ 1:25 PM EST (password reset fix)
**Netlify Status:** ⏳ Deploying (check in 2 minutes)

**Verify deployment:**
```bash
curl -I https://propiq.luntra.one
# Should return HTTP/2 200
# Check x-nf-request-id header (new value = deployed)
```

---

## 📞 HELP & SUPPORT

**If you get stuck:**
1. Document the exact error (screenshot + console logs)
2. Tell Claude Code: "UAT-XXX failed with error: [paste error]"
3. Claude will help debug following PRE_LAUNCH_DEBUG_WORKFLOW.md

**Emergency Contact:**
- Claude Code (this AI assistant!)
- PropIQ support: support@propiq.com

---

**REMEMBER:** Quality over speed. Better to find bugs now than after 1,000 users see them on Product Hunt!

**LET'S DO THIS!** 🚀

Start with UAT-001 (Signup) when you're ready!

---

**Session Owner:** Brian Dusape
**Started:** January 12, 2026 @ 1:30 PM EST
**Target Completion:** January 12, 2026 @ 3:00 PM EST (90 min session)
**Launch:** January 13, 2026 @ 12:01 AM PST (10.5 hours from now!)
