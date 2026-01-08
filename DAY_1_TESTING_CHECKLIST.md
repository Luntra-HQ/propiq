# 🎯 Day 1 Testing Checklist - Thursday Jan 8

**Status:** Ready to execute
**Time Required:** 3 hours (afternoon)
**Goal:** Verify the 3 critical flows work + mobile + password reset

---

## ✅ Morning Tests (Already Done - 30 min ago)
- [x] All code committed (58 files)
- [x] Security issues fixed (AWS creds removed)
- [ ] AWS credentials rotated (DO THIS FIRST!)

---

## 📱 AFTERNOON TESTS (Start Here - 3 hours)

### Test 1: Signup Flow (UAT-001) - 10 minutes
**Priority:** P0 - CRITICAL

**Steps:**
1. Open Chrome Incognito: https://propiq.luntra.one
2. Click "Sign Up" or "Get Started Free"
3. Fill form:
   - Name: `Test User Day1`
   - Email: YOUR_REAL_EMAIL@gmail.com (use real email!)
   - Password: `TestUser123!`
4. Submit

**Expected Results:**
- ✅ Account created successfully
- ✅ Redirected to dashboard
- ✅ Shows "3/3 analyses remaining" (free tier)
- ✅ Welcome email arrives within 2 minutes

**If FAILS:**
- Take screenshot
- Copy any error messages
- Tell Claude: "Signup failed: [exact error]"

**Result:** ☐ PASS ☐ FAIL

**Notes:**
```
[Write what happened]
```

---

### Test 2: Email Verification (UAT-013) - 5 minutes
**Priority:** P0 - CRITICAL

**Steps:**
1. Check email inbox (Gmail/etc)
2. Find "Welcome to PropIQ" email
3. Click verification link (if present)
4. Verify you're logged in

**Expected Results:**
- ✅ Email received within 2 minutes
- ✅ From: noreply@resend.dev or support@propiq.luntra.one
- ✅ Contains verification link OR you're already logged in
- ✅ Email looks professional (not broken HTML)

**Result:** ☐ PASS ☐ FAIL

**Notes:**
```
[Did email arrive? What did it look like?]
```

---

### Test 3: Login (UAT-008) - 5 minutes
**Priority:** P0 - CRITICAL

**Steps:**
1. Log out (if logged in)
2. Go to: https://propiq.luntra.one/login
3. Enter credentials from Test 1
4. Click "Log In"

**Expected Results:**
- ✅ Redirects to dashboard
- ✅ Shows user name
- ✅ Shows usage limits (3/3 analyses)
- ✅ No errors in console (F12 → Console tab)

**Result:** ☐ PASS ☐ FAIL

**Notes:**
```
[Any issues?]
```

---

### Test 4: Password Reset (UAT-012) - 10 minutes
**Priority:** P1 - HIGH

**Steps:**
1. Log out
2. Go to login page
3. Click "Forgot Password?"
4. Enter your email from Test 1
5. Submit
6. Check email inbox
7. Click reset link
8. Enter new password: `NewPassword123!`
9. Submit
10. Try logging in with new password

**Expected Results:**
- ✅ "Password reset email sent" message
- ✅ Email arrives within 2 minutes
- ✅ Reset link works (opens password reset page)
- ✅ New password saves successfully
- ✅ Can log in with new password
- ✅ Old password no longer works

**Result:** ☐ PASS ☐ FAIL

**Notes:**
```
[Did reset work? Any issues?]
```

---

### Test 5: PropIQ Analysis (UAT-016) - 15 minutes
**Priority:** P0 - CRITICAL (Core product!)

**Steps:**
1. Log in to dashboard
2. Find "Analyze Property" or similar button
3. Enter property details:
   ```
   Address: 123 Main St, Austin, TX 78701
   Purchase Price: $300,000
   Down Payment: $60,000 (20%)
   Monthly Rent: $2,500
   ```
4. Click "Analyze" or "Run Analysis"
5. Wait for AI response (should be <30 seconds)

**Expected Results:**
- ✅ Analysis completes within 30 seconds
- ✅ Shows deal score (0-100)
- ✅ Shows key metrics (cap rate, cash flow, ROI)
- ✅ AI recommendations make sense
- ✅ No errors or timeouts
- ✅ Analysis saves to history
- ✅ Usage counter decrements (3/3 → 2/3)

**Result:** ☐ PASS ☐ FAIL

**Notes:**
```
[What was the deal score? Did it make sense?]
```

---

### Test 6: Stripe Payment (UAT-003) - 15 minutes
**Priority:** P0 - CRITICAL (Revenue!)

**Steps:**
1. While logged in, click "Upgrade" or "Pricing"
2. Choose **Starter tier ($29/month)**
3. Click "Create Account" or "Subscribe"
4. Should redirect to Stripe checkout
5. Fill Stripe form:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   Name: Test User
   ```
6. Click "Subscribe" or "Pay"
7. Wait for redirect back to PropIQ

**Expected Results:**
- ✅ Redirects to Stripe checkout
- ✅ Stripe page loads (secure stripe.com URL)
- ✅ Test card is accepted
- ✅ Redirects back to PropIQ dashboard
- ✅ Shows "Starter" tier badge/label
- ✅ Usage limit updated (3 → 20 analyses/month)
- ✅ "Upgrade" button disappears or changes to "Manage"

**Result:** ☐ PASS ☐ FAIL

**Notes:**
```
[Did payment work? Are you upgraded?]
```

---

### Test 7: Mobile Responsive (UAT-038) - 20 minutes
**Priority:** P1 - HIGH

**Steps:**
1. Open PropIQ on your iPhone/Android
2. Go to: https://propiq.luntra.one
3. Test the following:
   - Sign up form (readable? inputs work?)
   - Login form (works on mobile?)
   - Dashboard (layout looks good?)
   - Analysis page (can enter property data?)
   - Pricing page (all tiers visible?)

**Expected Results:**
- ✅ Site loads on mobile
- ✅ Text is readable (not tiny)
- ✅ Buttons are tappable (not too small)
- ✅ Forms work (keyboard appears, can type)
- ✅ Navigation works (hamburger menu if present)
- ✅ No horizontal scrolling
- ✅ Images/logos display correctly

**Result:** ☐ PASS ☐ FAIL

**Notes:**
```
[Any mobile issues? Layout problems?]
```

---

### Test 8: Calculator (UAT-026) - 10 minutes
**Priority:** P1 - HIGH

**Steps:**
1. Log in to dashboard
2. Find "Deal Calculator" or similar
3. Enter test property:
   ```
   Purchase Price: $200,000
   Down Payment: 20%
   Interest Rate: 7%
   Loan Term: 30 years
   Monthly Rent: $1,800
   Property Tax: $200/month
   Insurance: $100/month
   HOA: $0
   Maintenance: $150/month
   Vacancy: $150/month (8.3%)
   ```
4. Review calculated results

**Expected Results:**
- ✅ Calculator loads without errors
- ✅ All inputs accept numbers
- ✅ Calculations update in real-time
- ✅ Shows monthly cash flow
- ✅ Shows cap rate
- ✅ Shows cash-on-cash return
- ✅ Math makes sense (spot check a few calculations)

**Result:** ☐ PASS ☐ FAIL

**Notes:**
```
[Did calculations look correct?]
```

---

## 📊 RESULTS SUMMARY

**Tests Completed:** __ / 8

**Results:**
- ☐ Signup: PASS / FAIL
- ☐ Email: PASS / FAIL
- ☐ Login: PASS / FAIL
- ☐ Password Reset: PASS / FAIL
- ☐ PropIQ Analysis: PASS / FAIL
- ☐ Payment: PASS / FAIL
- ☐ Mobile: PASS / FAIL
- ☐ Calculator: PASS / FAIL

**Critical Bugs Found (P0):**
```
[List any bugs that prevent signup, payment, or analysis]
```

**Minor Issues (P1/P2):**
```
[List any UX issues or non-blocking bugs]
```

---

## 🚨 IF YOU FIND BUGS

### Critical Bug (Blocks Revenue/Signup):
1. **STOP testing**
2. Take screenshot
3. Copy exact error message
4. Tell Claude: "CRITICAL BUG: [describe]"
5. We fix it immediately

### Minor Bug (UX issue):
1. Write it down in "Minor Issues" section
2. Continue testing
3. We fix after all tests complete

---

## ✅ AFTER ALL TESTS COMPLETE

### If ALL 8 Tests PASS:
🎉 **YOU'RE READY TO LAUNCH!**
- Product works end-to-end
- Move to Day 2: Create PH materials
- Schedule: Friday = Screenshots + Demo

### If 1-2 Tests FAIL:
⚠️ **FIXABLE - Still on track**
- Report failures to Claude
- Fix bugs tonight/tomorrow morning
- Re-test tomorrow afternoon
- Still launch Monday (Day 5)

### If 3+ Tests FAIL:
🔴 **SERIOUS ISSUES**
- Product needs work
- Delay launch to Jan 20 (1 week)
- Focus on fixing critical bugs first
- Re-run all tests next week

---

## 📱 TESTING TIPS

**Before Each Test:**
- Clear browser cache (Cmd+Shift+Delete)
- Open DevTools (F12) to watch for errors
- Use Incognito/Private mode for clean state

**During Testing:**
- Follow steps EXACTLY as written
- Don't skip steps
- Take screenshots of anything weird
- Write notes immediately (you'll forget!)

**After Each Test:**
- Mark PASS or FAIL
- Save notes
- Move to next test

---

## 🎯 SUCCESS CRITERIA

**Can launch Monday if:**
- ✅ Signup works (UAT-001)
- ✅ Payment works (UAT-003)
- ✅ Analysis works (UAT-016)

**These 3 are MUST PASS. Everything else is nice-to-have.**

---

## ⏱️ TIME BUDGET

| Test | Time | Running Total |
|------|------|---------------|
| Signup | 10 min | 0:10 |
| Email | 5 min | 0:15 |
| Login | 5 min | 0:20 |
| Password Reset | 10 min | 0:30 |
| Analysis | 15 min | 0:45 |
| Payment | 15 min | 1:00 |
| Mobile | 20 min | 1:20 |
| Calculator | 10 min | 1:30 |
| **TOTAL** | **1.5 hours** | |

**Actual time will be 2-3 hours with:**
- Bug investigation
- Screenshots
- Note-taking
- Retrying failed tests

---

## 🆘 QUICK HELP

**Can't find signup button?**
- Look for "Get Started Free" or "Sign Up" (top right)

**Email not arriving?**
- Check spam folder
- Wait 5 minutes
- Check Resend.com dashboard (if you have access)

**Stripe checkout not loading?**
- Check browser console for errors
- Try different browser
- Check internet connection

**Analysis timing out?**
- Wait up to 60 seconds
- Check Convex dashboard for errors
- Try simpler address

---

**🎯 YOUR NEXT ACTION: Start with Test 1 (Signup) - takes 10 minutes!**

**Open:** https://propiq.luntra.one

**Let's do this!** 🚀
