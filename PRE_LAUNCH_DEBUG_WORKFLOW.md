# PropIQ Pre-Launch Debug Workflow
## 3-Day Product Hunt Launch Preparation

**Launch Date:** 3 days from now
**Goal:** Zero critical bugs, 95%+ uptime confidence
**Tools:** Cursor Agents, Perplexity, Grok, Playwright

---

## Table of Contents

1. [Strategic AI Tool Allocation](#strategic-ai-tool-allocation)
2. [Day 1: Critical Path Testing](#day-1-critical-path-testing)
3. [Day 2: Edge Cases & Integration](#day-2-edge-cases--integration)
4. [Day 3: Load Testing & Polish](#day-3-load-testing--polish)
5. [Debugging Decision Tree](#debugging-decision-tree)
6. [Emergency Response Plan](#emergency-response-plan)

---

## Strategic AI Tool Allocation

### 🎯 Cursor Agents - Code-Level Debugging
**Best For:** Writing tests, fixing bugs, refactoring code

**Workflow:**
```bash
# Use Cursor Agents for:
1. Writing/fixing Playwright tests
2. Debugging TypeScript/React errors
3. Convex mutation/query optimization
4. Auth flow bug fixes
5. Real-time code reviews
```

**Context Engineering Tips:**
- Share entire error stack traces
- Include relevant file paths (e.g., `frontend/src/components/AuthModal.tsx:127`)
- Provide recent git commits for context
- Use `.cursorrules` file to maintain PropIQ coding standards

**Agent Modes:**
- **Composer Mode:** For multi-file refactors (auth system, payment flow)
- **Chat Mode:** For single-file bug fixes
- **Agent Mode:** For autonomous test suite execution

---

### 🔍 Perplexity - Infrastructure & Research
**Best For:** Debugging infrastructure, researching best practices, investigating errors

**Workflow:**
```bash
# Use Perplexity for:
1. Convex deployment issues
2. Netlify/Azure configuration problems
3. Stripe webhook debugging
4. React 19 + Convex compatibility issues
5. Latest security best practices
```

**Search Strategies:**
```
✅ GOOD: "Convex backend rate limiting best practices 2026"
✅ GOOD: "React 19 Stripe checkout integration error CORS"
✅ GOOD: "Playwright test flakiness async state management"

❌ BAD: "fix my bug" (too vague)
❌ BAD: "PropIQ not working" (product-specific, no context)
```

**Pro Tips:**
- Include error codes and stack traces
- Add "2026" or "latest" to get current docs
- Use "vs" for comparisons (e.g., "Convex vs Firebase auth 2026")
- Attach screenshots of configuration panels

---

### 🤖 Grok - Strategic Debugging & Prioritization
**Best For:** High-level strategy, prioritization, product decisions

**Workflow:**
```bash
# Use Grok for:
1. Prioritizing bug fixes (P0 vs P1 vs P2)
2. Product Hunt launch readiness assessment
3. User experience optimization decisions
4. Competitive analysis (PropIQ vs competitors)
5. Growth strategy during launch spike
```

**Question Templates:**
```
"We have 3 days until Product Hunt launch. Here are 15 bugs we found.
Which 5 should we fix first to maximize conversion and minimize churn?"

"Our signup flow has 3 steps. Competitors have 1-step. Should we simplify
before launch or keep our data collection approach?"

"Stripe checkout failing 2% of the time. Root cause unknown. What's the
fastest debugging strategy to isolate this in 4 hours?"
```

**Strategic Value:**
- Grok provides X (Twitter) context - knows what's trending
- Real-time web access for competitor analysis
- Product-market fit insights

---

## Day 1: Critical Path Testing
**Focus:** Revenue-critical flows (signup → analyze → pay)

### Morning (4 hours): Authentication Flow

#### 1.1 Cursor Agent Task
```typescript
// Prompt for Cursor Agent:
"Run all auth-related Playwright tests and fix any failures:
- tests/user-signup-integration.spec.ts
- tests/password-reset.spec.ts
- tests/account-settings.spec.ts

Fix TypeScript errors, update deprecated Convex mutations,
ensure 100% pass rate."
```

**Expected Output:**
- ✅ All auth tests passing
- ✅ Console errors eliminated
- ✅ TypeScript strict mode compliance

---

#### 1.2 Manual Testing Checklist
Run these flows manually in **3 browsers** (Chrome, Safari, Firefox):

**Signup Flow:**
- [ ] Sign up with new email
- [ ] Verify email validation (12+ chars, special chars, etc.)
- [ ] Check welcome email sent (via Gmail MCP)
- [ ] Confirm trial analyses = 3
- [ ] Verify redirect to dashboard

**Login Flow:**
- [ ] Login with correct credentials
- [ ] Test "Remember Me" checkbox
- [ ] Verify session persists after browser restart
- [ ] Test logout (clears localStorage)

**Password Reset:**
- [ ] Request password reset
- [ ] Check email received (Gmail MCP)
- [ ] Click reset link
- [ ] Set new password
- [ ] Login with new password

**Issues Found?** → Log in `launch-blockers.md`

---

#### 1.3 Perplexity Research Task
If auth bugs found:
```
"Debugging Convex authentication session timeout issues.
User sessions expiring after 5 minutes instead of 30 days.
Using Convex auth with localStorage. Best practices 2026?"
```

Include:
- Error screenshots
- Browser console logs
- Convex dashboard logs

---

### Afternoon (4 hours): Property Analysis Flow

#### 2.1 Cursor Agent Task
```typescript
// Prompt for Cursor Agent:
"Test property analysis end-to-end:
1. Run tests/production-backend-integration.spec.ts
2. Fix any Azure OpenAI timeout issues
3. Verify Convex mutations return correct data shape
4. Ensure analysesRemaining decrements properly
5. Check PDF export functionality"
```

---

#### 2.2 Manual Testing - Real Property Data
Test with **5 real Zillow properties**:

**Test Properties:**
1. **High Price:** $2M luxury rental (should score low)
2. **Sweet Spot:** $300K rental (should score 70-80)
3. **Cash Flow Negative:** $800K property (should flag as bad deal)
4. **Edge Case:** $50K property (test minimum price handling)
5. **Missing Data:** Property with no rent estimate

**For Each Property:**
- [ ] Enter address
- [ ] Click "Analyze Property"
- [ ] Wait for AI analysis (< 30 seconds)
- [ ] Verify deal score (0-100)
- [ ] Check cash flow calculation
- [ ] Review AI recommendations
- [ ] Export to PDF
- [ ] Verify `analysesRemaining` decreased

**Red Flags:**
- Analysis takes > 30 seconds
- Deal score = NaN or 0
- PDF export crashes
- Azure OpenAI rate limiting errors

---

#### 2.3 Grok Strategy Session
If analysis quality issues:
```
"PropIQ AI analysis returned 'EXCELLENT' rating for clearly
bad deal (negative cash flow, 2% cap rate). How do we improve
deal scoring algorithm in 4 hours without retraining the model?"
```

**Expected Output:**
- Heuristic validation rules
- Scoring weight adjustments
- Fallback logic for edge cases

---

### Evening (2 hours): Stripe Checkout Flow

#### 3.1 Cursor Agent Task
```typescript
// Prompt for Cursor Agent:
"Test Stripe integration:
1. Run tests/subscription-management.spec.ts
2. Verify promo code PRODUCTHUNT50 applies correctly
3. Test all 3 plan upgrades (Starter, Pro, Elite)
4. Ensure webhooks update Convex user records
5. Check cancellation flow doesn't break"
```

---

#### 3.2 Manual Testing - Payment Flow
**Test with Stripe TEST mode:**

**Starter Plan ($49/mo):**
- [ ] Click "Get Started"
- [ ] Enter test card `4242 4242 4242 4242`
- [ ] Apply promo code `PRODUCTHUNT50`
- [ ] Verify discount shows (50% off = $24.50)
- [ ] Complete checkout
- [ ] Confirm redirect to dashboard
- [ ] Check `subscriptionTier` = "starter"
- [ ] Verify `analysesLimit` = 99999 (unlimited)

**Plan Upgrade:**
- [ ] Go to Account Settings → Subscription
- [ ] Click "Upgrade to Pro"
- [ ] Verify prorated amount shown
- [ ] Complete upgrade
- [ ] Check `subscriptionTier` = "pro"

**Cancellation:**
- [ ] Click "Cancel Subscription"
- [ ] Select reason
- [ ] Confirm cancellation
- [ ] Verify access continues until period end
- [ ] Check cancellation email sent

---

#### 3.3 Perplexity Research Task
If Stripe issues:
```
"Stripe webhook failing to update Convex database.
Receiving 'invoice.payment_succeeded' but Convex mutation not triggered.
Using Convex HTTP endpoints. Debugging checklist 2026?"
```

---

### Day 1 End-of-Day Checklist
- [ ] All Playwright tests passing (90+ tests)
- [ ] 5 real property analyses successful
- [ ] 3 test payments completed
- [ ] Zero console errors in production
- [ ] `launch-blockers.md` updated with P0 bugs

**If P0 bugs exist:** Work overnight to fix (use Cursor Composer Mode)

---

## Day 2: Edge Cases & Integration
**Focus:** What breaks under stress?

### Morning (4 hours): Mobile Responsiveness

#### 1.1 Cursor Agent Task
```typescript
// Prompt for Cursor Agent:
"Run visual regression tests:
npx playwright test tests/visual-regression.spec.ts --update-snapshots

Fix any layout breaks on:
- iPhone SE (375px width)
- iPad (768px width)
- Desktop (1920px width)"
```

---

#### 1.2 Manual Testing - Mobile Devices
Test on **real devices** (not just DevTools):

**Devices:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)

**Flows:**
- [ ] Signup on mobile
- [ ] Login on mobile
- [ ] Analyze property (address autocomplete works?)
- [ ] View results (readable?)
- [ ] Calculator UI (inputs accessible?)
- [ ] Checkout flow (Stripe mobile form works?)

**Common Mobile Bugs:**
- Keyboard covering input fields
- Buttons too small to tap (< 44px)
- Horizontal scroll on small screens
- Fixed positioning breaking layout

---

### Afternoon (4 hours): Browser Compatibility

#### 2.1 Cross-Browser Testing
**Browsers to Test:**
1. **Chrome** (90% of users)
2. **Safari** (8% of users)
3. **Firefox** (2% of users)
4. **Edge** (if time permits)

**Test Matrix:**
```
              Chrome   Safari   Firefox
Signup        [ ]      [ ]      [ ]
Login         [ ]      [ ]      [ ]
Analysis      [ ]      [ ]      [ ]
Calculator    [ ]      [ ]      [ ]
Checkout      [ ]      [ ]      [ ]
PDF Export    [ ]      [ ]      [ ]
```

---

#### 2.2 Perplexity Research Task
If Safari-specific bugs:
```
"React 19 rendering issues in Safari 17. Components not
mounting, console shows 'TypeError: undefined is not an object'.
Works fine in Chrome. Known React 19 Safari bugs 2026?"
```

---

### Evening (2 hours): Error Monitoring

#### 3.1 Sentry Integration Check
```bash
# Test Sentry error tracking:
npm run test:sentry-now

# Trigger intentional errors:
1. Invalid email format
2. Expired session token
3. Stripe webhook failure
4. Azure OpenAI timeout
5. Network offline simulation
```

**Verify in Sentry Dashboard:**
- [ ] Errors captured
- [ ] Stack traces readable
- [ ] Source maps working
- [ ] Slack notifications sent
- [ ] User context included

---

#### 3.2 Microsoft Clarity Check
```bash
# Verify Clarity tracking:
1. Visit https://clarity.microsoft.com/projects/view/tts5hc8zf8
2. Check last 24 hours of recordings
3. Watch 5 signup sessions
4. Identify UX friction points
```

**Look For:**
- Dead clicks (users clicking non-interactive elements)
- Rage clicks (repeated clicking)
- Quick backs (users immediately leaving)
- Form abandonment (where users drop off)

---

### Day 2 End-of-Day Checklist
- [ ] Mobile flows tested on 2+ real devices
- [ ] Safari compatibility confirmed
- [ ] Sentry capturing all error types
- [ ] Clarity heatmaps reviewed
- [ ] `launch-blockers.md` updated

---

## Day 3: Load Testing & Polish
**Focus:** Can we handle Product Hunt traffic spike?

### Morning (3 hours): Load Testing

#### 1.1 Grok Strategy Session
```
"Product Hunt launches typically bring 500-2,000 visitors in first 6 hours.
Our Convex free tier supports 1M function calls/month. Will we hit limits?
What's our scaling strategy?"
```

**Expected Output:**
- Traffic estimates
- Convex tier upgrade recommendation
- Rate limiting strategy
- CDN caching opportunities

---

#### 1.2 Load Test Execution
```bash
# Simulate 1,000 concurrent users:
npx playwright test tests/chaos-engineering.spec.ts

# Monitor:
1. Convex dashboard (function execution times)
2. Sentry error rates
3. Server response times
4. Database query performance
```

**Success Criteria:**
- [ ] 95%+ requests < 3 seconds
- [ ] Error rate < 0.1%
- [ ] No database timeouts
- [ ] Convex functions < 500ms P95

**If Performance Issues:**
→ Use Perplexity to research Convex optimization
→ Use Cursor to implement caching/indexing

---

### Afternoon (3 hours): Final QA Pass

#### 2.1 Playwright Full Suite
```bash
# Run ALL tests (90+ tests):
npm run test:all

# Expected duration: 10-15 minutes
# Target: 100% pass rate
```

**If Failures:**
→ Cursor Agent: "Fix all failing tests with detailed explanations"
→ Group by failure type (auth, payment, analysis, etc.)
→ Prioritize P0 blockers

---

#### 2.2 Manual Smoke Test
**20-Minute End-to-End Flow:**

1. **Signup** (3 min)
   - New user email
   - Strong password
   - Verify welcome email

2. **Analyze 3 Properties** (9 min)
   - Use test addresses
   - Verify all 3 succeed
   - Check trial counter: 3 → 2 → 1 → 0

3. **Hit Trial Limit** (2 min)
   - Try 4th analysis
   - Verify upgrade modal shows
   - Confirm correct pricing displayed

4. **Upgrade to Starter** (4 min)
   - Enter test card
   - Apply `PRODUCTHUNT50`
   - Complete checkout
   - Verify unlimited analyses

5. **Analyze 5 More Properties** (2 min)
   - Rapid-fire analysis
   - Verify no limit enforcement

**If ANY step fails:** P0 blocker - fix immediately

---

### Evening (2 hours): Product Hunt Asset Review

#### 3.1 Grok Product Review
```
"Review our Product Hunt submission. Here's our tagline, description,
and screenshots. What would make a PH user upvote vs scroll past?
How do we compare to top products this week?"
```

**Include:**
- Screenshots (`/screenshots/` folder)
- Tagline from `PRODUCT_HUNT_LAUNCH_GUIDE.md`
- Competitor products

---

#### 3.2 Cursor Agent - Landing Page Optimization
```typescript
// Prompt for Cursor Agent:
"Review frontend/src/pages/LandingPage.tsx for Product Hunt traffic.
Optimize for:
1. First Contentful Paint < 1.5s
2. Clear CTA above fold
3. Social proof visible
4. Mobile-first design
5. Lighthouse score 95+

Provide specific code changes."
```

---

### Day 3 Final Checklist
- [ ] Load test passed (1,000 concurrent users)
- [ ] All 90+ Playwright tests passing
- [ ] Lighthouse score 95+ (all metrics)
- [ ] Product Hunt assets reviewed by Grok
- [ ] Landing page optimized
- [ ] `launch-blockers.md` = EMPTY (all P0s fixed)
- [ ] Team briefed on launch day support

---

## Debugging Decision Tree

```
Bug Found
    ↓
Is it blocking signup/payment/analysis?
    ↓
YES → P0 (fix immediately)
NO → Continue
    ↓
Does it affect > 10% of users?
    ↓
YES → P1 (fix before launch)
NO → P2 (fix post-launch)
    ↓
Which AI tool to use?
    ↓
├─ Code error (TypeScript, React)
│  └─ Use Cursor Agent
│
├─ Infrastructure issue (Convex, Netlify)
│  └─ Use Perplexity
│
└─ Strategic decision (prioritization, UX)
   └─ Use Grok
```

---

## Debugging Decision Matrix

| Error Type | Symptoms | AI Tool | Search/Prompt Template |
|------------|----------|---------|------------------------|
| **Auth Failure** | Login button unresponsive, session expires immediately | Cursor Agent | "Fix Convex auth session persistence. User logged out after 5 min. Code: `convex/auth.ts:127`" |
| **Payment Error** | Stripe checkout redirects to error page | Perplexity | "Stripe webhook signature validation failing. Error: 'No signatures found matching the expected signature'. Convex HTTP endpoint config 2026" |
| **Analysis Timeout** | Azure OpenAI call hangs > 30 seconds | Perplexity + Cursor | Perplexity: "Azure OpenAI timeout best practices". Cursor: "Add timeout + retry logic to `convex/propiq.ts:89`" |
| **Mobile Layout Break** | Buttons cut off on iPhone SE | Cursor Agent | "Fix mobile responsive design. Buttons hidden below fold on 375px width. File: `frontend/src/components/AuthModal.tsx`" |
| **Rate Limiting** | 429 errors under load | Grok + Perplexity | Grok: "Should we implement client-side rate limiting or upgrade Convex tier?". Perplexity: "Convex rate limiting strategies 2026" |
| **PDF Export Crash** | Browser freezes when exporting | Cursor Agent | "Optimize PDF generation. Browser hangs on large property reports. Using jspdf. File: `utils/pdfExport.ts:156`" |

---

## Emergency Response Plan

### Critical Bug Found (< 6 hours to launch)

#### Option 1: Fast Fix (Prefer)
1. **Isolate:** Can we disable the broken feature temporarily?
2. **Fix:** Use Cursor Composer Mode for rapid multi-file fix
3. **Test:** Run targeted Playwright tests
4. **Deploy:** Push to production if tests pass

#### Option 2: Feature Flag (Safer)
```typescript
// Add feature flag in convex/config.ts:
export const FEATURES = {
  pdfExport: false,  // ← Disable if broken
  chromeExtension: false,
  referralSystem: true,
};

// Use in components:
if (FEATURES.pdfExport) {
  // Show export button
}
```

#### Option 3: Delay Launch (Last Resort)
**Only if:**
- Signup flow completely broken
- Payment processing failing > 50%
- Data loss risk

**Action:**
1. Post on Product Hunt: "Delaying 24h for critical bug fix"
2. Use 24h to fix properly
3. Re-launch next day

---

## Tool Usage Summary

### Cursor Agents (60% of debugging time)
- Writing/fixing Playwright tests
- Implementing bug fixes
- Code refactoring
- TypeScript error resolution
- Real-time pair programming

### Perplexity (25% of debugging time)
- Infrastructure debugging (Convex, Azure, Netlify)
- Third-party integration issues (Stripe, Sentry)
- Latest documentation lookup
- Best practices research
- Error message investigation

### Grok (15% of debugging time)
- Bug prioritization (P0 vs P1 vs P2)
- Strategic product decisions
- Competitive analysis
- Growth strategy during launch
- High-level UX optimization

---

## Success Metrics

**Pre-Launch Confidence Score:** (Target: 95%+)

```
Calculation:
- Auth tests passing: 20%
- Payment tests passing: 20%
- Analysis tests passing: 20%
- Mobile responsive: 15%
- Load test passed: 15%
- Zero P0 bugs: 10%
────────────────────────
Total: ___% / 100%
```

**Launch Readiness Checklist:**
- [ ] 90+ Playwright tests at 100% pass rate
- [ ] 5 real property analyses tested successfully
- [ ] 3 test payments completed (Starter, Pro, Elite)
- [ ] Mobile tested on 2+ real devices
- [ ] Safari compatibility confirmed
- [ ] Load test: 1,000 concurrent users passed
- [ ] Lighthouse score 95+ on all metrics
- [ ] Sentry error monitoring active
- [ ] Microsoft Clarity tracking verified
- [ ] Product Hunt assets approved by team
- [ ] Emergency rollback plan documented

**If checklist = 100%:** 🚀 LAUNCH

**If checklist < 90%:** ⚠️ Delay launch 24h

---

## Post-Launch Monitoring (First 24 Hours)

### Hour 1-6 (Critical Period)
**Monitor Every 30 Minutes:**
- [ ] Sentry error rate (target: < 0.1%)
- [ ] Convex function execution times
- [ ] Signup conversion rate
- [ ] Payment success rate
- [ ] Server response times

**Alert Thresholds:**
- Error rate > 1%: Investigate immediately
- Response time > 5s: Check Convex logs
- Payment failure > 5%: Disable Stripe temporarily

### Hour 6-24 (Stabilization)
**Monitor Every 2 Hours:**
- [ ] Total signups
- [ ] Trial → Paid conversion
- [ ] Analyses per user
- [ ] User retention (return visits)

**Success Indicators:**
- 500+ signups
- 50+ paid conversions
- < 0.1% error rate
- 95%+ uptime

---

## Final Pre-Flight Check (1 Hour Before Launch)

```bash
# Run this checklist 1 hour before submitting to Product Hunt:

1. npm run test:all
   Expected: All tests pass

2. npm run build
   Expected: Build succeeds, no warnings

3. Open https://propiq.luntra.one
   Expected: Loads in < 2 seconds

4. Test signup → analyze → pay (full flow)
   Expected: < 5 minutes, no errors

5. Check Sentry dashboard
   Expected: Error rate < 0.1%

6. Check Clarity recordings
   Expected: No dead clicks, smooth UX

7. Review Product Hunt submission
   Expected: All assets uploaded, copy approved

8. Verify promo code PRODUCTHUNT50
   Expected: 50% discount applies

9. Test mobile on iPhone
   Expected: All flows work

10. Deep breath, ship it 🚀
```

---

**Document Status:** Ready for 3-Day Sprint
**Last Updated:** 2026-01-02
**Owner:** Brian Dusape
**Confidence Level:** 95%

Good luck with the launch! 🎉
