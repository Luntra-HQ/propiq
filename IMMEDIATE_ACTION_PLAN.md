# ⚡ PropIQ Immediate Action Plan
**EXECUTE THIS NOW - Next 2 Hours**

**Created:** December 18, 2025
**Priority:** P0 - LAUNCH BLOCKER VERIFICATION
**Goal:** Verify all critical flows work, then launch

---

## 🎯 My Expert Opinion: What to Do RIGHT NOW

Based on reviewing your **6+ hour debugging marathon** and analyzing all documentation:

### **The Situation:**
- ✅ Site is LIVE (HTTP 200)
- ✅ CORS fixed (`IS_PRODUCTION_ENV=true`)
- ✅ Convex API fixed (string references)
- ✅ Stripe configured
- ❌ **ZERO END-TO-END TESTING**

### **The Risk:**
You've been debugging technical issues for hours but **haven't verified that USERS can actually sign up**. This is the #1 launch blocker.

### **The Solution:**
Run these tests in the next 2 hours. If all pass → Launch tomorrow. If any fail → Fix then launch.

---

## 📋 Test Checklist (Execute in Order)

### ☑️ TEST 1: Account Signup (20 minutes) - **MOST CRITICAL**

**Priority:** P0 - If this fails, NOTHING else matters

**Steps:**
1. Open https://propiq.luntra.one **in incognito mode**
2. Open DevTools console (F12)
3. Click "Sign Up" or "Get Started"
4. Fill form:
   ```
   Email: test+propiq$(date +%s)@gmail.com
   Password: TestSignup123!@#
   ```
5. Click "Create Account"

**EXPECTED BEHAVIOR:**
- ✅ Redirect to /app or /dashboard
- ✅ User logged in (can see user data)
- ✅ Console: No CORS errors
- ✅ Console: No "is not a function" errors
- ✅ localStorage has `propiq_user_id`

**IF IT FAILS:**
- Screenshot EVERY error in console
- Copy the exact error message
- Note which step failed
- **DO NOT LAUNCH** until fixed

**IF IT WORKS:**
- ✅ Mark test as PASSED
- Write down the test account credentials
- Move to TEST 2

---

### ☑️ TEST 2: Login Flow (10 minutes)

**Steps:**
1. Logout (or open new incognito window)
2. Go to https://propiq.luntra.one/login
3. Enter credentials from TEST 1
4. Click "Sign In"

**EXPECTED BEHAVIOR:**
- ✅ Redirect to /app
- ✅ User data loaded
- ✅ Analyses limit shows: 3
- ✅ No console errors

**IF IT FAILS:**
- Check if the session token was stored correctly
- Verify Convex login endpoint is working

---

### ☑️ TEST 3: Property Analysis (15 minutes)

**Steps:**
1. While logged in from TEST 2
2. Navigate to property analysis page
3. Enter test property:
   ```
   Address: 123 Main St, Austin TX
   Purchase Price: $300,000
   Rent: $2,500
   Down Payment: 20%
   Interest Rate: 7%
   ```
4. Click "Analyze Property"

**EXPECTED BEHAVIOR:**
- ✅ Analysis completes
- ✅ Results displayed
- ✅ `analysesUsed` increments (1/3)
- ✅ No errors

**IF IT FAILS:**
- Check if Azure OpenAI endpoint is configured
- Verify analysesLimit logic

---

### ☑️ TEST 4: Stripe Checkout (20 minutes) - **PAYMENT CRITICAL**

**Steps:**
1. While logged in
2. Go to https://propiq.luntra.one/pricing
3. Click "Choose Starter" ($49/mo)
4. **Observe carefully what happens**

**EXPECTED BEHAVIOR:**
- ✅ Redirect to `checkout.stripe.com`
- ✅ Stripe checkout page loads
- ✅ Shows "Starter - $49/month"

**IF IT REDIRECTS TO STRIPE:**
✅ Payment integration WORKS!

**Test card (Stripe test mode):**
```
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
ZIP: 12345
```

**After Payment:**
- ✅ Redirect back to PropIQ
- ✅ Subscription tier: "starter"
- ✅ Analyses limit: UNLIMITED

**IF IT FAILS:**
- Check browser console for errors
- Verify `createCheckoutSession` action is working
- Check Stripe dashboard for events

---

## 🚨 Emergency Debugging (If Tests Fail)

### If Signup Fails with CORS Error

**Error looks like:**
```
Access-Control-Allow-Origin: http://localhost:5173
Origin 'https://propiq.luntra.one' is not allowed
```

**FIX (2 minutes):**
```bash
cd /Users/briandusape/Projects/LUNTRA/propiq

# Verify environment variable
npx convex env list | grep IS_PRODUCTION

# If it shows "false", run:
npx convex env set IS_PRODUCTION_ENV true

# Wait 30 seconds, then retest signup
```

---

### If Signup Fails with "is not a function"

**Error looks like:**
```
TypeError: [object Object] is not a functionReference
TypeError: ba is not a function
```

**FIX (5 minutes):**
```bash
cd /Users/briandusape/Projects/LUNTRA/propiq/frontend

# Rebuild with clean cache
rm -rf node_modules/.vite
npm run build

# Redeploy
netlify deploy --prod --dir=dist

# Wait for deploy, then retest
```

---

### If Stripe Fails to Redirect

**Error looks like:**
```
Console: Error calling createCheckoutSession
Or: No redirect happens at all
```

**FIX (3 minutes):**
```bash
# Check Convex has Stripe keys
npx convex env list | grep STRIPE

# Should see:
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_STARTER_PRICE_ID=price_...
# STRIPE_PRO_PRICE_ID=price_...
# STRIPE_ELITE_PRICE_ID=price_...

# If any missing, set them (refer to STRIPE_PRICE_IDS.txt)
```

---

## 📊 Test Results Template

**Copy this and fill it out as you test:**

```markdown
# PropIQ Production Testing Results
**Date:** December 18, 2025
**Tester:** [Your name]

## TEST 1: Signup ✅ / ❌
- Incognito browser: ✅ / ❌
- Form loaded: ✅ / ❌
- Submitted successfully: ✅ / ❌
- Redirected to dashboard: ✅ / ❌
- No CORS errors: ✅ / ❌
- User logged in: ✅ / ❌
- **Status:** PASS / FAIL
- **Notes:** [any issues observed]

## TEST 2: Login ✅ / ❌
- Login page loaded: ✅ / ❌
- Credentials accepted: ✅ / ❌
- Redirect to app: ✅ / ❌
- User data loaded: ✅ / ❌
- **Status:** PASS / FAIL
- **Notes:**

## TEST 3: Property Analysis ✅ / ❌
- Analysis page loaded: ✅ / ❌
- Form submitted: ✅ / ❌
- Results displayed: ✅ / ❌
- Usage counter updated: ✅ / ❌
- **Status:** PASS / FAIL
- **Notes:**

## TEST 4: Stripe Checkout ✅ / ❌
- Pricing page loaded: ✅ / ❌
- Clicked "Choose Starter": ✅ / ❌
- Redirected to Stripe: ✅ / ❌
- Checkout page loaded: ✅ / ❌
- Payment successful (test mode): ✅ / ❌
- Tier upgraded: ✅ / ❌
- **Status:** PASS / FAIL
- **Notes:**

## OVERALL STATUS
- **All Tests Passed:** YES / NO
- **Ready to Launch:** YES / NO
- **Blockers:** [list any critical issues]
```

---

## 🎯 Decision Tree: What to Do After Testing

```
┌─────────────────────────────────────┐
│   Run All 4 Tests                   │
└───────────┬─────────────────────────┘
            │
            ▼
    ┌───────────────┐
    │ All Passed?   │
    └───────┬───────┘
            │
        ┌───┴────┐
        │        │
       YES      NO
        │        │
        ▼        ▼
    ┌─────┐  ┌──────────────────────┐
    │LAUNCH  │Debug failing test(s)│
    │TOMORROW│  using framework    │
    └─────┘  └──────┬───────────────┘
                    │
                    ▼
            ┌───────────────┐
            │  Re-test      │
            │               │
            └───────┬───────┘
                    │
                    ▼
            (Repeat until pass)
```

---

## ⏱️ Time Allocation

**Total Time: 2 hours**

| Task | Time | Priority |
|------|------|----------|
| **TEST 1: Signup** | 20 min | P0 |
| **TEST 2: Login** | 10 min | P0 |
| **TEST 3: Analysis** | 15 min | P0 |
| **TEST 4: Stripe** | 20 min | P0 |
| **Debugging** (if needed) | 30 min | P0 |
| **Documentation** | 15 min | P1 |
| **Buffer** | 10 min | - |

---

## 📞 Next Steps Based on Results

### ✅ If All Tests Pass:

1. **Document results** (save test results markdown)
2. **Screenshot working flows** (proof it works)
3. **Prepare launch announcement**
4. **Execute Day 1 of Launch Week Plan** (AI_TOOLS_STRATEGIC_PLAYBOOK.md)
5. **Set up monitoring** (health-check.sh)

**Tomorrow's Launch Checklist:**
- [ ] Post launch announcement on X/Twitter
- [ ] Email waitlist
- [ ] Post on LinkedIn
- [ ] Submit to Product Hunt
- [ ] Monitor analytics closely

---

### ❌ If Any Test Fails:

1. **Do NOT launch yet**
2. **Use PROPIQ_DEBUGGING_FRAMEWORK.md** to debug
3. **Use AI tools strategically:**
   - **Cursor**: "Fix the error in [component]"
   - **Perplexity**: "Research this error: [error message]"
   - **Gemini**: "Analyze root cause and create fix plan"
4. **Fix, test, repeat**
5. **Launch when all tests pass**

---

## 🤖 AI Tools Quick Reference (For Debugging)

### If Signup Fails:

**Cursor Prompt:**
```
Analyze SignupFlow.tsx and convex/auth.ts
Find why signup is failing
Show me exact line where error occurs
```

**Perplexity Prompt:**
```
Convex authentication error: [paste error]
Using React + TypeScript
What are the common causes and fixes?
```

---

### If Stripe Fails:

**Cursor Prompt:**
```
Analyze PricingPageWrapper.tsx line 23
The createCheckoutSession action is failing
Show me:
1. How it's called
2. What the action expects
3. Why it might fail in production
```

**Perplexity Prompt:**
```
Stripe checkout with Convex
Error: [paste error]
How do I debug Stripe redirect issues?
```

---

## 💡 Pro Tips

### Testing Tips:
1. **Always use incognito** - prevents cache issues
2. **Keep DevTools open** - catch errors immediately
3. **Test on mobile** - responsive design check
4. **Test on different browsers** - Chrome, Safari, Firefox
5. **Document everything** - you'll need it later

### Debugging Tips:
1. **Start with console errors** - 90% of issues show here
2. **Check Network tab** - see failed API calls
3. **Verify environment variables** - common failure point
4. **Test locally first** - faster debugging cycle
5. **Use AI tools** - don't debug alone

---

## 🎯 Success Criteria

**You're ready to launch when:**

✅ All 4 tests pass
✅ No console errors
✅ User can signup → analyze property → upgrade plan
✅ Stripe checkout works end-to-end
✅ Documentation is complete

**Then:**
🚀 **LAUNCH TOMORROW**
📊 Follow AI_TOOLS_STRATEGIC_PLAYBOOK.md Day 1-7
📈 Monitor analytics hourly
💰 Get first customers within 48-72 hours

---

## 📝 Final Checklist Before Launch

- [ ] All 4 tests passed
- [ ] Test results documented
- [ ] Screenshots of working flows saved
- [ ] Monitoring scripts set up
- [ ] Launch announcement drafted
- [ ] Product Hunt submission ready
- [ ] Social media posts scheduled
- [ ] Emergency rollback plan ready

---

**⚡ START TESTING NOW - THE CLOCK IS TICKING ⚡**

*Time to launch: Depends on test results*
*Goal: Launch within 24 hours*

---

*🤖 Generated with [Claude Code](https://claude.com/claude-code)*

*Co-Authored-By: Claude <noreply@anthropic.com>*
