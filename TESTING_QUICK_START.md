# 🚀 PropIQ Testing Quick Start
## Get Launch-Ready in 2 Hours

**Read this first!** → Then run the tests below.

---

## 📚 What You Have Now

1. **PRE_LAUNCH_QA_STRATEGY.md** (Comprehensive guide - 15 min read)
   - Research-backed testing strategy
   - 5 Quick Wins (2 hours)
   - Automated testing setup
   - Launch day monitoring plan

2. **quick-test.sh** (Automated script - run now!)
   - Lighthouse audit
   - Backend health check
   - Console error check

3. **Existing checklists:**
   - MANUAL_TESTING_CHECKLIST.md (address validation)
   - PRODUCTION_LAUNCH_CHECKLIST.md (full launch)

---

## ⚡ Start Here (Next 10 Minutes)

### Step 1: Start Dev Server (if not running)

```bash
cd /Users/briandusape/Projects/LUNTRA/propiq/frontend
npm run dev
```

**Expected:** Dev server at http://localhost:5173

---

### Step 2: Run Quick Test Script

```bash
cd /Users/briandusape/Projects/LUNTRA/propiq
./quick-test.sh
```

**This will:**
- ✅ Install Lighthouse (if needed)
- ✅ Run performance audit
- ✅ Generate HTML report
- ✅ Check backend health
- ✅ Open browser for manual console check

**Expected output:**
```
Performance:     90+/100 ✅
Accessibility:   95+/100 ✅
Best Practices:  90+/100 ✅
SEO:             95+/100 ✅
```

**If scores < 90:** See "lighthouse-report.html" for what to fix

---

### Step 3: Manual Critical Path Test (3 minutes)

**Test the money flow** (this is what 95% of users will do):

```
1. Sign Up → 2. Run Analysis → 3. View Results → 4. Upgrade → 5. Pay
```

**Use timer - must complete in < 3 minutes:**

#### Part 1: Sign Up (30 seconds)
- Go to http://localhost:5173
- Click "Sign Up"
- Email: `test-$(date +%s)@propiq.com` (unique email)
- Password: `Test123!@#`
- Submit
- ✅ Verify: Redirected to dashboard
- ✅ Verify: "3 free analyses remaining" visible

#### Part 2: Run Analysis (60 seconds)
- Click "Run PropIQ Analysis"
- Enter: `2505 Longview St, Austin, TX 78705`
- ✅ Verify: Green checkmark (address valid)
- Click "Analyze Property"
- ✅ Verify: Loading spinner appears
- Wait (should be < 15 seconds)
- ✅ Verify: Deal score appears (0-100)
- ✅ Verify: Monthly cash flow visible
- ✅ Verify: No console errors (F12 → Console tab)

#### Part 3: View Results (30 seconds)
- Scroll through report
- ✅ Verify: Charts render
- ✅ Verify: All sections load
- Click "Export to PDF"
- ✅ Verify: PDF downloads

#### Part 4: Upgrade (60 seconds) - OPTIONAL
- Click "Upgrade to Pro"
- Select plan
- Test card: `4242 4242 4242 4242`
- ✅ Verify: Stripe checkout works

**If ANY step fails → CRITICAL BUG - must fix before launch**

---

## 🎯 What "Launch Ready" Looks Like

### Green Light ✅ (All Must Be True)
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] Critical path test passes in < 3 minutes
- [ ] Zero console errors (browser F12)
- [ ] Mobile works (test on real phone)
- [ ] Payment works (Stripe test mode)

### Yellow Light ⚠️ (Can Launch, Monitor Closely)
- [ ] Lighthouse scores 80-89
- [ ] Minor bugs in non-critical features
- [ ] Some TODOs in code

### Red Light 🔴 (DO NOT LAUNCH)
- [ ] Lighthouse Performance < 80
- [ ] Critical path test fails
- [ ] Console shows errors
- [ ] Payment broken
- [ ] Site crashes on mobile

---

## 📋 Your 2-Hour Testing Roadmap

### Hour 1: Automated Tests

**00:00 - 00:10** → Run `./quick-test.sh`
- Review Lighthouse scores
- Check backend health
- Look for console errors

**00:10 - 00:30** → Fix Critical Issues
- If Performance < 90: Optimize images, enable caching
- If Accessibility < 95: Fix ARIA labels, contrast issues
- If console errors: Debug and fix

**00:30 - 00:50** → Manual Critical Path Test
- Follow 3-minute test above
- Document any bugs found

**00:50 - 01:00** → Mobile Quick Test
- Open http://localhost:5173 on your phone
- Try signup → analysis flow
- Check if buttons are tappable
- Verify no horizontal scrolling

---

### Hour 2: Strategic Testing

**01:00 - 01:20** → Error Handling Test
- Test with offline mode (Chrome DevTools → Network → Offline)
- Test with invalid inputs (empty forms, gibberish)
- Test with backend down (stop uvicorn server)
- ✅ Verify: User-friendly errors (not technical crashes)

**01:20 - 01:40** → Security Quick Check
- Install OWASP ZAP (if not installed): `brew install --cask owasp-zap`
- Run automated scan on http://localhost:5173
- ✅ Verify: No critical vulnerabilities
- Fix: Any high-priority security issues

**01:40 - 02:00** → Set Up Monitoring
- Sign up for UptimeRobot (free): https://uptimerobot.com
- Add monitor: https://propiq.luntra.one (every 5 min)
- Add alert: Email if down for > 2 minutes
- ✅ Result: Instant notification if site goes down during launch

---

## 🚨 Common Issues & Quick Fixes

### Issue 1: Lighthouse Performance < 90
**Cause:** Large images, no caching
**Fix:**
```bash
# Optimize images (convert to WebP)
# Add to frontend/public/.htaccess or netlify.toml:
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Issue 2: Console Errors
**Cause:** Unhandled promise rejections, missing error boundaries
**Fix:**
```typescript
// Add to main.tsx
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to error tracking (Sentry)
});
```

### Issue 3: Mobile Scrolling Issues
**Cause:** Width overflow, elements too wide
**Fix:**
```css
/* Add to global CSS */
html, body {
  max-width: 100vw;
  overflow-x: hidden;
}
```

### Issue 4: Slow Analysis (> 20 seconds)
**Cause:** Backend timeout, slow OpenAI response
**Fix:**
```python
# backend/routers/propiq.py
# Increase timeout, add caching, use async/await properly
```

---

## 🎓 Learning Resources

**If you want to dive deeper:**

1. **Lighthouse Guide:** https://developer.chrome.com/docs/lighthouse/
2. **Web Vitals:** https://web.dev/vitals/
3. **Playwright Testing:** https://playwright.dev/docs/intro
4. **OWASP Top 10:** https://owasp.org/www-project-top-ten/

**But for launch, just do:**
1. ✅ Run quick-test.sh
2. ✅ Manual critical path test
3. ✅ Mobile test on real device
4. ✅ Fix any critical issues found

---

## 🚀 After Testing (Deploy with Confidence)

Once all tests pass:

```bash
# 1. Build for production
cd frontend
npm run build

# 2. Deploy frontend (if using Netlify)
# Drag dist/ folder to https://app.netlify.com/drop

# 3. Deploy backend (if using Render)
# See DEPLOY_NOW_CHECKLIST.md

# 4. Final verification
curl https://propiq.luntra.one
# Should return 200 OK

# 5. LAUNCH! 🎉
```

---

## 📊 Success Metrics (First 24 Hours)

Track these after launch:

| Metric | Target | How to Check |
|--------|--------|--------------|
| **Uptime** | > 99.9% | UptimeRobot dashboard |
| **Error Rate** | < 0.1% | Browser console, Sentry |
| **Signup Success** | > 95% | Count signups in database |
| **Analysis Speed** | < 15s avg | Time from submit to results |
| **Payment Success** | > 98% | Stripe dashboard |

---

## ❓ Need Help?

**If stuck:**
1. Check PRE_LAUNCH_QA_STRATEGY.md (comprehensive guide)
2. Review error in browser console (F12)
3. Check backend logs: `cd backend && tail -f logs/app.log`
4. Ask in MicroConf Connect #saas-help

**If critical bug found:**
1. Document: What happened, how to reproduce
2. Fix: Use Cursor AI to help debug
3. Test again: Run `./quick-test.sh`
4. Deploy: Only when all tests pass

---

## ✅ Pre-Launch Checklist (Final)

Before clicking "Launch":

- [ ] `./quick-test.sh` passes (all scores > 90)
- [ ] Critical path test passes (< 3 minutes)
- [ ] Mobile test passes (real device)
- [ ] Zero console errors
- [ ] Backend health check passes
- [ ] UptimeRobot monitoring active
- [ ] Stripe test payment works
- [ ] Team ready to monitor for 2 hours post-launch

**If all checked → YOU'RE READY TO LAUNCH! 🚀**

---

**Created:** December 19, 2025
**Status:** Ready to run
**Next Action:** `./quick-test.sh`
