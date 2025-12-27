# PropIQ Stripe Webhook Damage Assessment

**Date:** December 19, 2025
**Trigger:** Grok intelligence revealed webhook reliability issues in PropTech community
**Status:** Assessment in progress

---

## 🎯 Assessment Objectives

1. Determine which webhook endpoint is active (FastAPI vs Convex)
2. Check for duplicate webhook processing
3. Identify users who paid but have no subscription access
4. Verify dual-auth synchronization issues
5. Measure scope of potential impact

---

## 📋 Assessment Checklist

### ✅ Phase 1: Webhook Endpoint Verification

**Action:** Check Stripe Dashboard
- [ ] Login to Stripe Dashboard: https://dashboard.stripe.com/webhooks
- [ ] Identify active webhook endpoint URL
- [ ] Check which events are subscribed
- [ ] Verify webhook signing secret matches environment variable

**Expected Findings:**
- ✅ **SAFE:** Endpoint is `*.convex.site/stripe-webhook` (Convex - has idempotency)
- ⚠️ **AT RISK:** Endpoint is `azurewebsites.net/api/v1/stripe/webhook` (FastAPI - no idempotency)
- 🔴 **CRITICAL:** Both endpoints are active (double processing!)

**How to check:**
1. Go to https://dashboard.stripe.com/test/webhooks (test mode)
2. Go to https://dashboard.stripe.com/webhooks (live mode)
3. Note the endpoint URL(s)
4. Check "Events to send" configuration

---

### ✅ Phase 2: Convex Duplicate Event Detection

**Action:** Query Convex for duplicate eventIds

**Script:** Run in Convex Dashboard (https://dashboard.convex.dev)

```typescript
// Query to find duplicate Stripe events
import { query } from "./_generated/server";
import { v } from "convex/values";

export const findDuplicateStripeEvents = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("stripeEvents").collect();

    // Group by eventId
    const eventCounts = new Map<string, number>();
    events.forEach(event => {
      const count = eventCounts.get(event.eventId) || 0;
      eventCounts.set(event.eventId, count + 1);
    });

    // Find duplicates
    const duplicates = Array.from(eventCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([eventId, count]) => ({ eventId, count }));

    return {
      totalEvents: events.length,
      uniqueEvents: eventCounts.size,
      duplicates: duplicates,
      duplicateCount: duplicates.length,
      impactedEventIds: duplicates.map(d => d.eventId)
    };
  },
});
```

**Expected Outcomes:**
- ✅ **GOOD:** `duplicateCount: 0` (no duplicates)
- ⚠️ **WARNING:** `duplicateCount: 1-5` (rare duplicates, investigate)
- 🔴 **CRITICAL:** `duplicateCount: >5` (systemic issue, Grok's warning confirmed)

**Save results to:** `/tmp/propiq-duplicate-events.json`

---

### ✅ Phase 3: Paid Users Without Access Detection

**Action:** Find users with Stripe data but wrong subscription tier

**Script:** Run in Convex Dashboard

```typescript
// Query to find users who paid but don't have access
import { query } from "./_generated/server";

export const findPaidUsersWithoutAccess = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    // Find users with Stripe customer ID but still on free tier
    const affectedUsers = users.filter(user =>
      user.stripeCustomerId && // Has paid (Stripe customer exists)
      user.subscriptionTier === "free" // But still on free tier
    );

    // Find users with Stripe subscription ID but wrong tier
    const mismatchedUsers = users.filter(user =>
      user.stripeSubscriptionId && // Has active subscription
      user.subscriptionTier === "free" // But marked as free
    );

    return {
      totalUsers: users.length,
      paidUsers: users.filter(u => u.subscriptionTier !== "free").length,
      affectedCount: affectedUsers.length,
      affectedUsers: affectedUsers.map(u => ({
        id: u._id,
        email: u.email,
        stripeCustomerId: u.stripeCustomerId,
        subscriptionTier: u.subscriptionTier,
        createdAt: new Date(u.createdAt).toISOString()
      })),
      mismatchedCount: mismatchedUsers.length,
      mismatchedUsers: mismatchedUsers.map(u => ({
        id: u._id,
        email: u.email,
        stripeSubscriptionId: u.stripeSubscriptionId,
        subscriptionTier: u.subscriptionTier
      }))
    };
  },
});
```

**Expected Outcomes:**
- ✅ **GOOD:** `affectedCount: 0, mismatchedCount: 0`
- ⚠️ **WARNING:** `affectedCount: 1-2` (isolated incidents, manual fix)
- 🔴 **CRITICAL:** `affectedCount: >2` (systemic failure, immediate action required)

**For each affected user:**
1. Check Stripe dashboard: https://dashboard.stripe.com/customers
2. Verify subscription status
3. If paid and active, manually update `subscriptionTier` in Convex
4. Notify user (if locked out for >24 hours, offer refund/credit)

**Save results to:** `/tmp/propiq-affected-users.json`

---

### ✅ Phase 4: Webhook Event History Analysis

**Action:** Check recent webhook failures in Stripe

**Steps:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your endpoint
3. Review "Recent deliveries" tab
4. Look for:
   - ❌ Failed deliveries (red)
   - ⏱️ Slow deliveries (>5 seconds)
   - 🔁 Retries (indicates failures)

**Document:**
- Total webhooks in past 7 days: _____
- Failed webhooks: _____
- Success rate: _____% (should be >99%)
- Average response time: _____ms (should be <500ms)

**Red flags:**
- Success rate < 95% → Investigate endpoint health
- Response time > 2s → Timeout risk
- Multiple retries on same event → Idempotency issue

---

### ✅ Phase 5: FastAPI vs Convex Sync Check

**Action:** Verify if dual system is causing issues

**Query Supabase (if accessible):**
```sql
-- Check if any users exist in Supabase but not Convex
SELECT email, subscription_tier, created_at
FROM users
WHERE email NOT IN (
  SELECT email FROM convex_users -- hypothetical sync table
);
```

**Query Convex:**
```typescript
// Check webhook logs for failures
import { query } from "./_generated/server";

export const checkWebhookFailures = query({
  handler: async (ctx) => {
    const failedEvents = await ctx.db
      .query("stripeEvents")
      .filter(q => q.eq(q.field("status"), "failed"))
      .collect();

    return {
      failedCount: failedEvents.length,
      failedEvents: failedEvents.map(e => ({
        eventId: e.eventId,
        eventType: e.eventType,
        error: e.error,
        createdAt: new Date(e.createdAt).toISOString()
      }))
    };
  },
});
```

**Expected Outcomes:**
- ✅ **GOOD:** All users in Convex, no failed webhook events
- ⚠️ **WARNING:** 1-2 failed events (transient issues)
- 🔴 **CRITICAL:** >5 failed events or users in Supabase not in Convex

---

## 📊 Damage Assessment Report Template

Once all checks are complete, fill out this template:

```markdown
# PropIQ Stripe Webhook Damage Assessment Report

**Date:** [Date]
**Assessed by:** [Your name]
**Environment:** Production (propiq.luntra.one)

---

## Executive Summary

**Overall Status:** [✅ GREEN | ⚠️ YELLOW | 🔴 RED]

**Key Findings:**
- Webhook endpoint: [FastAPI | Convex | Both]
- Duplicate events: [Count]
- Affected users: [Count]
- Estimated revenue at risk: $[Amount]

---

## Detailed Findings

### 1. Webhook Configuration
- Active endpoint: _____
- Events subscribed: _____
- Idempotency protection: [Yes | No]
- Signing secret verified: [Yes | No]

### 2. Data Integrity
- Total Stripe events logged: _____
- Duplicate events found: _____
- Users with payment mismatches: _____
- Failed webhook deliveries: _____

### 3. User Impact
- Total paying customers: _____
- Customers affected by bugs: _____
- Customers locked out of paid features: _____
- Estimated churn risk: _____

### 4. Financial Impact
- Potential refunds owed: $_____
- Lost MRR (if churn occurs): $_____
- Support time cost: _____ hours × $100/hr

---

## Risk Assessment

| Risk | Severity | Likelihood | Impact | Priority |
|------|----------|------------|--------|----------|
| Duplicate charges | [H/M/L] | [H/M/L] | $_____ | P0/P1/P2 |
| Locked out paid users | [H/M/L] | [H/M/L] | _____ users | P0/P1/P2 |
| Data inconsistency | [H/M/L] | [H/M/L] | _____ records | P0/P1/P2 |
| Customer complaints | [H/M/L] | [H/M/L] | _____ tickets | P0/P1/P2 |

---

## Recommended Actions

### Immediate (P0 - Do Today)
- [ ] [Action 1]
- [ ] [Action 2]

### Short-term (P1 - Do This Week)
- [ ] [Action 1]
- [ ] [Action 2]

### Long-term (P2 - Do This Month)
- [ ] [Action 1]
- [ ] [Action 2]

---

## Next Steps

1. [Next step]
2. [Next step]
3. [Next step]

**Assessment completed at:** [Timestamp]
```

---

## 🔧 Quick Fix Scripts (If Issues Found)

### Fix: User Paid But No Access

```typescript
// Fix a specific user's subscription
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const fixUserSubscription = mutation({
  args: {
    userId: v.id("users"),
    tier: v.string(), // "starter" | "pro" | "elite"
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string()
  },
  handler: async (ctx, args) => {
    const tierLimits = {
      starter: 999999,
      pro: 999999,
      elite: 999999
    };

    await ctx.db.patch(args.userId, {
      subscriptionTier: args.tier,
      analysesLimit: tierLimits[args.tier],
      analysesUsed: 0, // Reset usage
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      updatedAt: Date.now()
    });

    console.log(`Fixed subscription for user ${args.userId} → ${args.tier}`);

    return { success: true };
  },
});
```

**Usage:**
1. Get user details from Stripe dashboard
2. Run mutation in Convex with correct tier
3. Notify user their access has been restored
4. Offer 1 month free as apology if locked out >24hr

---

### Fix: Disable Old FastAPI Webhook

**If FastAPI webhook is still active:**

1. **Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/webhooks
   - Find old endpoint: `azurewebsites.net/api/v1/stripe/webhook`
   - Click "..." → "Disable"
   - Verify Convex endpoint is enabled

2. **FastAPI Code:**
   - Update `backend/routers/payment.py` line 220
   - Add deprecation check:
   ```python
   @router.post("/webhook")
   async def stripe_webhook(request: Request):
       """⚠️ DEPRECATED - Use Convex webhook instead"""
       logger.error("Old FastAPI webhook called - should be disabled in Stripe!")
       return {"status": "deprecated", "message": "Use Convex webhook"}
   ```

3. **Monitor:**
   - Check logs for 7 days
   - If no calls to old endpoint, remove it entirely

---

## 📞 Emergency Contacts

**If critical issues found:**
- Stripe Support: https://support.stripe.com
- Convex Support: support@convex.dev
- PropIQ Team Lead: [Your contact]

**Escalation criteria:**
- >5 users affected → Notify team lead immediately
- >$1000 potential refunds → Loop in finance
- Data breach risk → Security team + legal

---

**End of Assessment Protocol**
