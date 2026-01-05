# PropIQ Testing Session - Tonight

**Date:** January 4, 2026, 9:00 PM
**Goal:** Verify P1 bug fixes + critical paths before launch
**Time:** ~30 minutes

---

## 🖥️ Terminal Setup (Multi-Terminal)

### Terminal 1: Frontend Dev Server
```bash
cd /Users/briandusape/Projects/propiq/frontend
npm run dev
```

**Expected output:**
```
VITE v6.0.11  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Leave this running** - Don't close it!

---

### Terminal 2: Convex Backend (if needed)
```bash
cd /Users/briandusape/Projects/propiq
npx convex dev
```

**Expected output:**
```
Convex deployment URL: https://mild-tern-361.convex.cloud
```

**Leave this running** - Backend for auth/database

---

### Terminal 3: Testing Commands & Logs
```bash
cd /Users/briandusape/Projects/propiq
# Use this for git commands, viewing logs, etc.
```

**Keep this free** - For running commands during testing

---

## 🧪 Testing Checklist

### Test 1: Issue #19 - Duplicate Fetch Prevention (5 min)

**Setup:**
1. Open browser: http://localhost:5173/reset-password
2. Open DevTools (F12)
3. Go to Network tab
4. Filter: XHR

**Test Steps:**
```
1. Enter email: test@example.com
2. **QUICKLY DOUBLE-CLICK** "Send Reset Link" button
3. Watch Network tab

Expected Results:
✅ Only ONE request to /auth/request-password-reset
✅ Console logs: "Request already in progress, ignoring duplicate"
❌ NO second request should appear

Actual Results:
[ ] Pass - Only 1 request
[ ] Fail - Multiple requests: ___________
```

**Screenshot if fails:** Take screenshot of Network tab

---

### Test 2: Issue #18 - Timeout Handling (5 min)

**Setup:**
1. Still on http://localhost:5173/reset-password
2. DevTools Network tab open
3. Enable "Slow 3G" throttling (or "Offline" to force timeout)

**Test Steps:**
```
1. Network tab → Throttling dropdown → Select "Slow 3G"
2. Enter email: timeout@example.com
3. Click "Send Reset Link"
4. Wait 10 seconds

Expected Results:
✅ Loading spinner shows for ~10 seconds
✅ After 10 seconds: Clear error message
✅ Error says: "Request timed out. Please try again."
❌ NO infinite loading

Actual Results:
[ ] Pass - Timeout at 10s with clear message
[ ] Fail - Different behavior: ___________
```

**Remember:** Turn throttling back to "No throttling" after test!

---

### Test 3: Password Reset Complete Flow (5 min)

**Note:** This tests the full flow end-to-end

**Test Steps:**
```
1. Go to: http://localhost:5173/reset-password
2. Enter YOUR real email
3. Click "Send Reset Link"
4. Check your email inbox
5. Click the reset link (opens with ?token=xxx)
6. Enter new password: TestPassword123!
7. Confirm password: TestPassword123!
8. Click "Reset Password"

Expected Results:
✅ Email received within 1 minute
✅ Reset link works (shows password form)
✅ Password strength indicator shows
✅ Success message: "Password reset successful!"
✅ Redirects to login after 2 seconds

Actual Results:
[ ] Pass - Full flow works
[ ] Fail - Stopped at step: ___________
   Error: ___________
```

---

### Test 4: Signup Flow (5 min)

**Test Steps:**
```
1. Go to: http://localhost:5173/login
2. Click "Sign up free"
3. Fill form:
   - First Name: Test
   - Last Name: User
   - Email: testuser_$(date +%s)@example.com (unique!)
   - Password: TestPassword123!
   - Company: Test Co
4. Click "Create Account"

Expected Results:
✅ Form submits without errors
✅ Success message: "Account created! Redirecting..."
✅ Redirects to /app within 1 second
✅ Console shows no errors

Actual Results:
[ ] Pass
[ ] Fail - Error: ___________
```

---

### Test 5: Login Flow (3 min)

**Test Steps:**
```
1. Logout if logged in
2. Go to: http://localhost:5173/login
3. Enter credentials from Test 4
4. Click "Log In"

Expected Results:
✅ Login successful
✅ Redirects to dashboard/app
✅ No console errors

Actual Results:
[ ] Pass
[ ] Fail - Error: ___________
```

---

### Test 6: Calculator (5 min)

**Test Steps:**
```
1. While logged in, go to calculator page
2. Enter test property:
   - Purchase Price: $300,000
   - Down Payment: 20% ($60,000)
   - Interest Rate: 7%
   - Loan Term: 30 years
   - Monthly Rent: $2,000
   - Property Tax: $3,000/year
   - Insurance: $1,200/year
   - HOA: $100/month
3. Submit/Calculate

Expected Results:
✅ Results display immediately
✅ Shows monthly cash flow
✅ Shows cap rate, cash-on-cash return
✅ No console errors
✅ Deal score shows (0-100)

Actual Results:
[ ] Pass
[ ] Fail - Error: ___________
```

---

### Test 7: Mobile View (2 min)

**Test Steps:**
```
1. In DevTools, click "Toggle Device Toolbar" (Cmd+Shift+M)
2. Select "iPhone 14 Pro"
3. Repeat Test 4 (Signup) on mobile view

Expected Results:
✅ Forms are usable (not cut off)
✅ Buttons are tappable
✅ Text is readable
✅ No horizontal scrolling

Actual Results:
[ ] Pass
[ ] Fail - Issue: ___________
```

---

## 🎯 Pass/Fail Summary

**Total Tests:** 7

**Results:**
- Test 1 (Duplicate Fetch): [ ] Pass [ ] Fail
- Test 2 (Timeout): [ ] Pass [ ] Fail
- Test 3 (Full Reset Flow): [ ] Pass [ ] Fail
- Test 4 (Signup): [ ] Pass [ ] Fail
- Test 5 (Login): [ ] Pass [ ] Fail
- Test 6 (Calculator): [ ] Pass [ ] Fail
- Test 7 (Mobile): [ ] Pass [ ] Fail

**Passed:** ___ / 7

**Launch Ready?**
- 7/7 Pass: ✅ LAUNCH NOW
- 6/7 Pass: ⚠️ Fix 1 issue, then launch
- 5/7 Pass: ⚠️ Fix 2 issues (1-2 hours)
- <5/7 Pass: ❌ NOT READY (investigate)

---

## 🐛 Issues Found

**If you find bugs during testing, document here:**

### Issue 1:
- **Test:** _____________
- **What happened:** _____________
- **Expected:** _____________
- **Severity:** [ ] P0 [ ] P1 [ ] P2 [ ] P3
- **Screenshot:** _____________

### Issue 2:
- **Test:** _____________
- **What happened:** _____________
- **Expected:** _____________
- **Severity:** [ ] P0 [ ] P1 [ ] P2 [ ] P3

*(Add more as needed)*

---

## 📊 Console Errors

**During testing, watch for these in console:**

**Critical (Must Fix):**
- ❌ Uncaught Error
- ❌ TypeError
- ❌ Failed to fetch
- ❌ 401 Unauthorized
- ❌ 500 Internal Server Error

**Warnings (Can Ignore for Launch):**
- ⚠️ React DevTools warnings
- ⚠️ Missing alt tags
- ⚠️ Console.log statements

**Log Critical Errors Here:**
```
Error 1: ___________
File: ___________
Line: ___________

Error 2: ___________
```

---

## 🔧 Common Issues & Quick Fixes

### Issue: "Port 5173 already in use"
**Fix:**
```bash
lsof -ti:5173 | xargs kill -9
npm run dev
```

### Issue: "Convex not connecting"
**Fix:**
```bash
# Check .env.local has VITE_CONVEX_URL
cat frontend/.env.local | grep CONVEX

# Restart Convex
npx convex dev
```

### Issue: "Can't receive password reset email"
**Fix:**
- Check spam folder
- Check Convex logs for email send errors
- Try different email address
- Check SendGrid is configured

### Issue: "Network timeout during test"
**Fix:**
- Turn off network throttling in DevTools
- Network tab → No throttling
- Retry test

---

## ✅ Post-Testing Actions

### If All Tests Pass (7/7):

```bash
# 1. Commit any fixes (if you made any)
git add .
git commit -m "test: verified all critical paths - ready for launch"

# 2. Create test report
echo "All tests passed: $(date)" >> TEST_RESULTS.md

# 3. Push to GitHub
git push

# 4. You're ready to deploy tomorrow!
```

**Next:** Get some sleep, deploy tomorrow morning, LAUNCH! 🚀

---

### If 1-2 Tests Fail:

```bash
# 1. Document failures in TESTING_TONIGHT.md
# 2. Create GitHub issues for failures
gh issue create --title "Bug found in testing: [describe]"

# 3. Decide: Fix tonight or fix tomorrow morning?
#    - Simple fix (<15 min): Fix tonight
#    - Complex fix (>15 min): Fix tomorrow, delay launch 1 day
```

---

### If 3+ Tests Fail:

```bash
# Houston, we have a problem

# 1. Stop and analyze
# 2. Check if Convex is running
# 3. Check if frontend is running
# 4. Check browser console for errors
# 5. Re-run tests one more time

# If still failing:
#  - Document all failures
#  - Get help (ask me!)
#  - Don't launch tomorrow - need more time
```

---

## 📝 Quick Notes During Testing

**Use this space for observations:**

```
9:00 PM - Started testing
9:05 PM - Test 1: ___________
9:10 PM - Test 2: ___________
9:15 PM - Test 3: ___________
9:20 PM - Test 4: ___________
9:25 PM - Test 5: ___________
9:30 PM - Test 6: ___________
9:32 PM - Test 7: ___________

Overall: ___________
```

---

## 🎯 Final Checklist

Before you close your laptop tonight:

- [ ] All 3 terminals closed (Ctrl+C)
- [ ] Test results documented above
- [ ] Any bugs found → GitHub issues created
- [ ] Test report committed to git
- [ ] Decided on launch date (tomorrow or later?)
- [ ] You feel confident about launch? Y/N

---

**Good luck! You've got this! 🚀**

**Questions during testing?** Take notes and ask me after!

**Time estimate:** 30-35 minutes for all tests
**Your launch depends on this:** Take your time, be thorough

---

**Created:** January 4, 2026, 9:00 PM
**Purpose:** Final pre-launch testing session
**Goal:** Verify readiness → Launch tomorrow
