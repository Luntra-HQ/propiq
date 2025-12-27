# PropIQ Testing Strategy - Session Tracker

**Date:** December 19, 2025
**Composition:** Stripe Chaos Engineering Implementation
**Duration:** 2-3 hours total

---

## 🎼 COMPOSITION SEQUENCE (Follow This Exactly)

### ✅ MOVEMENT I: Research & Intelligence Gathering (15 min)

#### Step 1: Perplexity - Opening Theme ⏳ IN PROGRESS
**Status:** Waiting for user to run query
**Prompt:**
```
Based on recent developer feedback about Stripe webhooks, I need solutions for these specific problems:

1. DUPLICATE WEBHOOK EVENTS causing double charges:
   - How to implement idempotency keys in FastAPI?
   - Best practices for deduplication in MongoDB?
   - Code examples for event_id tracking
   - Testing strategies to simulate duplicates

2. OUT-OF-ORDER WEBHOOK EVENTS breaking subscription state:
   - How to handle checkout.session.completed arriving AFTER invoice.paid?
   - State machine patterns for subscription lifecycle
   - Timestamp-based event ordering strategies
   - Database transaction patterns to prevent race conditions

3. MISSING WEBHOOK EVENTS leaving paid users locked out:
   - Fallback strategies when webhooks fail to arrive
   - Polling Stripe API as backup verification
   - Grace period implementations
   - Customer notification systems for manual intervention

Focus on FastAPI + MongoDB implementations with code examples from 2024-2025.
Include testing approaches for each scenario.
```

**Output:** Save to `/Users/briandusape/Projects/LUNTRA/propiq/stripe-webhook-solutions.md`

---

#### Step 2: Grok - Counterpoint Theme ✅ COMPLETED
**Status:** Done
**Results:** Saved in conversation history
**Key Findings:**
- Local environment struggles
- Event reliability issues (duplicates, out-of-order, missing)
- Sync challenges with databases
- Community moving toward alternatives (SSE, direct APIs)

**Output:** Added to `chaos-scenarios.md` under "Live Issues"

---

### ⏭️ MOVEMENT II: Strategic Planning (20 min)

#### Step 1: Claude Code - Development of Theme
**Status:** PENDING (waiting for Perplexity results)
**Prompt:**
```
Based on these Stripe failure scenarios [paste stripe-webhook-solutions.md + Grok results], design a comprehensive chaos engineering test suite for PropIQ's payment system.

Context:
- We use Stripe for subscriptions (4 tiers: Free, Starter $49, Pro $99, Elite $199)
- Backend: FastAPI (deprecated) + Convex (current)
- Convex has idempotency (stripeEvents table with eventId index)
- Frontend: React with Stripe checkout integration
- Current tests: /frontend/tests/

Create:
1. Test file structure
2. Specific test cases with priorities (P0, P1, P2)
3. Mock strategies for Stripe API
4. Expected behaviors for each failure mode
```

**Output:** Save as `/Users/briandusape/Projects/LUNTRA/propiq/docs/STRIPE_CHAOS_TEST_PLAN.md`

---

### ⏭️ MOVEMENT III: Implementation (45 min)

#### Step 1: Cursor - Execution Theme (Forte)
**Status:** PENDING
**File to create:** `/Users/briandusape/Projects/LUNTRA/propiq/frontend/tests/stripe-chaos.spec.ts`

**Prompt for Cursor:**
```typescript
// Implement chaos engineering tests for Stripe based on this plan:
// [paste test plan from Claude Code]

// Start with P0 tests:
// 1. Webhook signature verification failure
// 2. Network timeout during checkout
// 3. Duplicate webhook events (idempotency)

// Use Playwright's route interception to simulate failures
```

---

#### Step 2: Claude Code - Supporting Harmony
**Status:** PENDING
**For complex multi-file changes**

**Prompt:**
```
I need to add webhook idempotency handling to the backend.

Files to modify:
- backend/routers/payment.py (webhook handler)
- backend/database_mongodb.py (add webhook_events collection)

Requirements:
1. Store webhook event IDs in MongoDB
2. Check for duplicates before processing
3. Return 200 OK even for duplicates (Stripe best practice)
4. Add logging for debugging

Implement this with proper error handling and tests.
```

---

### ⏭️ MOVEMENT IV: Visual Verification (15 min)

#### Step 1: Gemini - Visual Inspection
**Status:** PENDING
**Actions:**
1. Run tests: `npm run test:headed tests/stripe-chaos.spec.ts`
2. Capture screenshots of error states
3. Upload to Gemini

**Prompt for Gemini:**
```
Analyze these Stripe payment flow screenshots for:
1. User experience during failures - are error messages helpful?
2. Visual consistency - do error states match design system?
3. Accessibility issues - color contrast, screen reader text?
4. Missing edge cases - what scenarios aren't covered?

Compare against PropIQ's existing UI patterns.
```

---

### ⏭️ MOVEMENT V: Validation & Documentation (25 min)

#### Step 1: Claude Code - Finale
**Status:** PENDING

**Prompt:**
```
Review the Stripe chaos tests I just implemented:
- /frontend/tests/stripe-chaos.spec.ts
- /backend/routers/payment.py

Verify:
1. All P0 scenarios are covered
2. Error messages are user-friendly
3. Logging is comprehensive
4. Tests are maintainable

Generate:
1. Test coverage report
2. Documentation for TESTING_GUIDE.md
3. Runbook for handling Stripe failures in production
```

---

## 📊 PROGRESS TRACKING

### Current Status
- **Movement:** I - Research & Intelligence
- **Step:** 1 of 2 (Perplexity)
- **Overall Progress:** 5% complete
- **Time Spent:** 30 min (research phase)
- **Time Remaining:** ~2 hours

### Completed Steps
- [x] Grok intelligence gathering
- [x] Identified production risks in payment.py
- [x] Created damage assessment toolkit

### Next Immediate Action
- [ ] **RUN PERPLEXITY QUERY** (user action required)
- [ ] Save results to markdown file
- [ ] Move to Movement II with Claude Code

---

## 🎯 SUCCESS CRITERIA

By end of this composition, we will have:
1. ✅ Comprehensive Stripe webhook failure research
2. ✅ Detailed chaos engineering test plan
3. ✅ Implemented P0 chaos tests (duplicates, timeouts, failures)
4. ✅ Visual validation of error states
5. ✅ Production runbook for Stripe incidents
6. ✅ Updated testing documentation

---

## ⚠️ IMPORTANT RULES

1. **Follow the sequence exactly** - Don't skip steps
2. **Complete each movement before moving to next**
3. **Save outputs to specified file paths**
4. **Update this tracker as we go**
5. **If sidetracked, come back to this file**

---

**Last Updated:** Movement I, Step 1 in progress
**Next Action:** User runs Perplexity query
**Claude's Role:** Wait for results, then proceed to Movement II
