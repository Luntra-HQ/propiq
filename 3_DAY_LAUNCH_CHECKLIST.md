# 3-Day Product Hunt Launch Checklist
## Quick Reference Execution Guide

**Launch Date:** T-3 Days
**Quick Links:**
- Full Workflow: `PRE_LAUNCH_DEBUG_WORKFLOW.md`
- Launch Guide: `PRODUCT_HUNT_LAUNCH_GUIDE.md`
- Bug Tracker: `launch-blockers.md` (create if doesn't exist)

---

## Day 1: Critical Path Testing
**Goal:** Verify revenue-critical flows work perfectly

### ☀️ Morning (9 AM - 1 PM)

#### Auth Flow Testing
```bash
# 1. Run automated tests
npx playwright test tests/user-signup-integration.spec.ts
npx playwright test tests/password-reset.spec.ts
npx playwright test tests/account-settings.spec.ts

# 2. Manual testing in 3 browsers (Chrome, Safari, Firefox)
# - Signup
# - Login
# - Password reset
# - Logout

# If bugs found → Cursor Agent:
"Fix auth bugs in [file:line]. Error: [paste error]"
```

**Deliverable:** ✅ All auth tests passing, 0 console errors

---

#### Analysis Flow Testing
```bash
# 3. Run integration tests
npx playwright test tests/production-backend-integration.spec.ts

# 4. Test 5 real properties manually:
Test addresses:
1. High price luxury: [Find on Zillow]
2. Sweet spot rental: [Find on Zillow]
3. Negative cash flow: [Find on Zillow]
4. Edge case cheap: [Find on Zillow]
5. Missing data: [Find on Zillow]

# For each: Enter → Analyze → Verify score → Export PDF
```

**Deliverable:** ✅ 5 successful analyses, deal scores accurate

---

### 🌆 Afternoon (2 PM - 6 PM)

#### Payment Flow Testing
```bash
# 5. Run Stripe tests
npx playwright test tests/subscription-management.spec.ts

# 6. Manual payment testing (Stripe TEST mode)
Test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- 3D Secure: 4000 0025 0000 3155

Test plans:
- [ ] Starter ($49/mo) with promo code PRODUCTHUNT50
- [ ] Upgrade Starter → Pro
- [ ] Cancel subscription

# If issues → Perplexity:
"Stripe webhook not triggering Convex mutation. Error: [paste error].
Convex HTTP endpoint configuration 2026"
```

**Deliverable:** ✅ 3 test payments successful, promo code works

---

### 🌙 Evening (7 PM - 9 PM)

#### Day 1 Review
```bash
# 7. Create bug tracker
touch launch-blockers.md

# Document:
P0 (launch blocking): [list]
P1 (fix before launch): [list]
P2 (fix after launch): [list]

# 8. Run full test suite
npm run test:all

# Expected: 90+ tests, 100% pass rate
```

**Deliverable:** ✅ Bug tracker created, priorities assigned

---

## Day 2: Edge Cases & Integration
**Goal:** Find what breaks under stress

### ☀️ Morning (9 AM - 1 PM)

#### Mobile Testing
```bash
# 1. Visual regression tests
npx playwright test tests/visual-regression.spec.ts --update-snapshots

# 2. Real device testing
Devices needed:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)

Flows to test on each:
- [ ] Signup
- [ ] Login
- [ ] Analyze property
- [ ] Checkout

# Common mobile bugs to check:
- Keyboard covering inputs?
- Buttons too small (<44px)?
- Horizontal scroll?
- Fixed positioning broken?

# If bugs → Cursor Agent:
"Fix mobile responsive issues in [component].
Viewport: iPhone SE (375px). Screenshot attached."
```

**Deliverable:** ✅ Mobile flows work on 2+ real devices

---

### 🌆 Afternoon (2 PM - 6 PM)

#### Browser Compatibility
```bash
# 3. Cross-browser testing matrix

Test in: Chrome, Safari, Firefox

Flows:           Chrome  Safari  Firefox
Signup           [ ]     [ ]     [ ]
Login            [ ]     [ ]     [ ]
Analysis         [ ]     [ ]     [ ]
Calculator       [ ]     [ ]     [ ]
Checkout         [ ]     [ ]     [ ]
PDF Export       [ ]     [ ]     [ ]

# If Safari bugs → Perplexity:
"React 19 Safari 17 compatibility issue.
Error: [paste console error]. Known bugs 2026?"
```

**Deliverable:** ✅ All flows work in Chrome + Safari (minimum)

---

### 🌙 Evening (7 PM - 9 PM)

#### Error Monitoring
```bash
# 4. Test Sentry integration
npm run test:sentry-now

# Trigger these errors intentionally:
1. Invalid email format
2. Expired session
3. Stripe webhook fail
4. OpenAI timeout
5. Network offline

# 5. Verify in Sentry dashboard:
https://sentry.io/organizations/luntra/issues/

Check:
- [ ] Errors captured
- [ ] Stack traces readable
- [ ] Slack alerts sent
- [ ] Source maps working

# 6. Check Microsoft Clarity
https://clarity.microsoft.com/projects/view/tts5hc8zf8

Look for:
- Dead clicks
- Rage clicks
- Form abandonment
```

**Deliverable:** ✅ Error monitoring confirmed working

---

## Day 3: Load Testing & Polish
**Goal:** Ready for traffic spike

### ☀️ Morning (9 AM - 12 PM)

#### Load Testing
```bash
# 1. Grok strategy consult
Prompt:
"Product Hunt typically brings 500-2,000 visitors in first 6 hours.
Current stack: Convex free tier (1M calls/month), Netlify.
Will we hit limits? Scaling strategy?"

# 2. Run chaos tests
npx playwright test tests/chaos-engineering.spec.ts

# Monitor during test:
- Convex dashboard (execution times)
- Sentry (error rate)
- Browser DevTools (response times)

# Success criteria:
- [ ] 95%+ requests < 3 seconds
- [ ] Error rate < 0.1%
- [ ] No database timeouts

# If performance issues → Perplexity:
"Convex query optimization for high concurrent load.
Query taking 5s under 1000 users. Best practices 2026?"
```

**Deliverable:** ✅ Load test passed (1,000 concurrent users)

---

### 🌆 Afternoon (1 PM - 4 PM)

#### Final QA Pass
```bash
# 3. Full Playwright suite
npm run test:all

# Target: 100% pass rate
# If failures → group by type:
- Auth failures: [count]
- Payment failures: [count]
- Analysis failures: [count]

# Cursor Agent batch fix:
"Fix all [type] test failures. Provide explanations for each."

# 4. Manual smoke test (20 min end-to-end)
Time yourself:
- [ ] Signup (3 min)
- [ ] Analyze 3 properties (9 min)
- [ ] Hit trial limit (2 min)
- [ ] Upgrade to Starter (4 min)
- [ ] Analyze 5 more (2 min)

# If ANY step fails → P0 blocker
```

**Deliverable:** ✅ 100% test pass rate, 20-min flow perfect

---

### 🌙 Evening (5 PM - 7 PM)

#### Launch Polish
```bash
# 5. Grok product review
Prompt:
"Review Product Hunt submission. Files:
- Tagline: [paste]
- Description: [paste]
- Screenshots: [attach]

What would make users upvote vs scroll past?
Compare to this week's top products."

# 6. Cursor Agent - landing page optimization
Prompt:
"Optimize frontend/src/pages/LandingPage.tsx for PH traffic:
1. First Contentful Paint < 1.5s
2. Clear CTA above fold
3. Social proof visible
4. Mobile-first
5. Lighthouse 95+

Provide code changes."

# 7. Final build
npm run build

# Check:
- [ ] No warnings
- [ ] Bundle size < 500KB
- [ ] No console errors in production
```

**Deliverable:** ✅ Landing page optimized, build clean

---

## Pre-Launch Final Check (1 Hour Before)
**Time: 11 PM night before launch (for 12:01 AM PST launch)**

```bash
# RUN THIS CHECKLIST:

1. [ ] npm run test:all → All pass
2. [ ] npm run build → Success
3. [ ] Open https://propiq.luntra.one → Loads < 2s
4. [ ] Full flow: Signup → Analyze → Pay → < 5 min
5. [ ] Sentry dashboard → Error rate < 0.1%
6. [ ] Clarity recordings → Smooth UX
7. [ ] Product Hunt assets → Uploaded
8. [ ] Promo code PRODUCTHUNT50 → Works
9. [ ] iPhone test → All flows work
10. [ ] Team briefed → Ready for support

# If all checked:
🚀 LAUNCH AT 12:01 AM PST

# If < 90% checked:
⚠️ DELAY 24 HOURS
```

---

## AI Tool Quick Commands

### Cursor Agent (Code Fixes)
```bash
# Template:
"Fix [error type] in [file:line]. Error: [paste full error].
Expected behavior: [describe]. Current: [describe]."

# Examples:
"Fix TypeScript error in frontend/src/components/AuthModal.tsx:127.
Error: Property 'user' does not exist on type 'User | null'."

"Optimize Convex query in convex/propiq.ts:89.
Taking 5s under load. Add indexes and caching."
```

---

### Perplexity (Research)
```bash
# Template:
"[Technology] [specific issue] [error message if applicable].
[Context]. Best practices 2026?"

# Examples:
"Convex authentication session timeout. Users logged out after 5 min.
Using Convex auth with localStorage. Best practices 2026?"

"Stripe webhook signature validation failing. Error: 'No signatures found'.
Convex HTTP endpoint setup. Debugging guide 2026?"
```

---

### Grok (Strategy)
```bash
# Template:
"[Situation]. [Options]. [Constraints].
What's the optimal decision for [goal]?"

# Examples:
"Found 15 bugs with 3 days until launch. P0: [list 5]. P1: [list 10].
Team of 1 developer. Which 5 bugs to fix first for max conversion?"

"Stripe checkout failing 2% of the time. Root cause unknown.
4 hours available. Fastest debugging strategy to isolate issue?"
```

---

## Bug Tracking Template

Create `launch-blockers.md`:

```markdown
# Launch Blockers

## P0 - LAUNCH BLOCKING (Fix immediately)
- [ ] [Bug description] - File: [path:line] - Assigned: [Cursor/You]

## P1 - Fix Before Launch (Next 48h)
- [ ] [Bug description] - File: [path:line] - Priority: [High/Med]

## P2 - Fix After Launch (Week 1)
- [ ] [Bug description] - File: [path:line] - Nice to have

## FIXED ✅
- [x] [Bug description] - Fixed in commit: [hash]
```

---

## Emergency Contacts

**If Critical Bug < 6h Before Launch:**

1. **Feature Flag It:**
   ```typescript
   // convex/config.ts
   export const FEATURES = {
     pdfExport: false, // ← Disable broken feature
   };
   ```

2. **Cursor Composer Mode:**
   - Enable "Agent Mode"
   - Prompt: "Emergency fix for [bug]. Multi-file changes OK. Ship ASAP."

3. **Delay Launch (Last Resort):**
   - Only if: Signup/payment completely broken
   - Post on PH: "Delaying 24h for quality"
   - Fix properly overnight

---

## Success Metrics

### Pre-Launch Confidence (Target: 95%+)
- [ ] Auth tests: 20%
- [ ] Payment tests: 20%
- [ ] Analysis tests: 20%
- [ ] Mobile responsive: 15%
- [ ] Load test: 15%
- [ ] Zero P0 bugs: 10%

**Total: ___% / 100%**

**Decision:**
- 95%+: 🚀 LAUNCH
- 90-94%: ⚠️ Review risks, launch if acceptable
- < 90%: ❌ DELAY 24 hours

---

## Launch Day Monitoring (First 6 Hours)

**Check every 30 minutes:**
- [ ] Sentry error rate < 0.1%
- [ ] Convex execution times < 500ms
- [ ] Signup conversion rate
- [ ] Payment success rate

**Alert thresholds:**
- Error rate > 1%: Investigate
- Response time > 5s: Check Convex
- Payment fail > 5%: Disable Stripe

---

## Final Wisdom

**From Product Hunt veterans:**
> "Better to delay 24h than launch broken.
> PH community forgives delays, not bugs."

**From successful launches:**
> "First 6 hours determine ranking.
> Be ready to engage, not debug."

**From PropIQ's mission:**
> "We help investors analyze faster.
> Our own launch should be analyzed thoroughly." 🎯

---

**Good luck! Ship with confidence.** 🚀

**Document:** Quick Reference
**Companion:** PRE_LAUNCH_DEBUG_WORKFLOW.md (detailed)
**Last Updated:** 2026-01-02
