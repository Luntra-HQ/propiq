# PropIQ Stripe Chaos Engineering Test Plan

**Created:** December 19, 2025
**Based on:** Perplexity research + Grok real-time intelligence
**Target:** Prevent production failures identified in PropTech community

---

## 🎯 Executive Summary

**Problem:** Stripe webhooks have 3 critical failure modes affecting PropTech SaaS:
1. **Duplicate events** → Double charges, data corruption
2. **Out-of-order events** → Broken subscription states
3. **Missing events** → Paid users locked out

**Current PropIQ Status:**
- ✅ **Convex** has idempotency protection (`stripeEvents` table with unique `eventId` index)
- ⚠️ **FastAPI** (deprecated) has NO idempotency protection
- ❌ No state machine for subscription transitions
- ❌ No reconciliation polling for missing events
- ❌ No grace period to prevent lockouts

**Goal:** Build chaos tests to prevent these failures in production.

---

## 📊 Test Priority Matrix

| Scenario | Severity | Likelihood | Impact | Priority |
|----------|----------|------------|--------|----------|
| Duplicate `checkout.session.completed` | HIGH | MEDIUM | Double subscription activation | **P0** |
| Out-of-order `invoice.paid` before `checkout.session.completed` | HIGH | HIGH | User not activated | **P0** |
| Missing `invoice.paid` webhook | CRITICAL | LOW | Paid user locked out | **P0** |
| Duplicate `invoice.payment_failed` | MEDIUM | LOW | Incorrect status | **P1** |
| Network timeout during checkout | MEDIUM | MEDIUM | User confusion | **P1** |
| Webhook signature verification failure | LOW | LOW | Security risk | **P2** |

---

## 🧪 Test Suite Architecture

```
propiq/
├── frontend/tests/
│   └── stripe-chaos.spec.ts          # E2E chaos tests (Playwright)
├── convex/
│   └── stripeWebhook.test.ts         # Convex webhook handler tests
└── backend/routers/
    └── test_payment_chaos.py          # FastAPI tests (deprecated endpoint)
```

---

## 🔴 P0 TESTS (Must Implement)

### Test 1: Duplicate `checkout.session.completed` Event

**Scenario:** Stripe sends same event twice due to network retry.

**Expected Behavior:**
- ✅ First event: Creates subscription, activates user
- ✅ Second event: Returns `200 OK` but does NOT duplicate subscription
- ✅ User has exactly ONE subscription record
- ✅ `stripeEvents` table has exactly ONE entry for this `eventId`

**Test Implementation (Convex):**

```typescript
// convex/stripeWebhook.test.ts
import { convexTest } from "convex-test";
import { api } from "./_generated/api";

describe("Stripe Webhook Idempotency", () => {
  test("duplicate checkout.session.completed is ignored", async () => {
    const t = convexTest();

    const event = {
      id: "evt_test_duplicate_123",
      type: "checkout.session.completed",
      created: Date.now() / 1000,
      data: {
        object: {
          id: "cs_test_123",
          customer: "cus_test_123",
          subscription: "sub_test_123",
          metadata: {
            userId: "user_123",
            tier: "starter",
          },
        },
      },
    };

    // Process first time
    await t.action(api.http.routes["/stripe-webhook"], {
      method: "POST",
      body: JSON.stringify(event),
      headers: { "stripe-signature": "valid_signature" },
    });

    // Check: subscription created
    const user = await t.query(api.auth.getUser, { userId: "user_123" });
    expect(user.subscriptionTier).toBe("starter");
    expect(user.stripeSubscriptionId).toBe("sub_test_123");

    // Process DUPLICATE
    await t.action(api.http.routes["/stripe-webhook"], {
      method: "POST",
      body: JSON.stringify(event),
      headers: { "stripe-signature": "valid_signature" },
    });

    // Check: still only ONE subscription
    const events = await t.query(api.payments.getStripeEventsByEventId, {
      eventId: "evt_test_duplicate_123",
    });
    expect(events.length).toBe(1);

    // Check: user subscription unchanged
    const userAfter = await t.query(api.auth.getUser, { userId: "user_123" });
    expect(userAfter.subscriptionTier).toBe("starter");
    expect(userAfter.analysesUsed).toBe(0); // Not reset again
  });
});
```

**Playwright E2E Test:**

```typescript
// frontend/tests/stripe-chaos.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Stripe Chaos: Duplicate Events", () => {
  test("duplicate checkout event does not double-activate subscription", async ({
    page,
    context,
  }) => {
    // 1. User signs up
    await page.goto("http://localhost:5173/signup");
    await page.fill('[name="email"]', `chaos-test-${Date.now()}@propiq.com`);
    await page.fill('[name="password"]', "Test123!@#");
    await page.click('button[type="submit"]');

    // 2. Upgrade to Starter tier
    await page.goto("http://localhost:5173/pricing");
    await page.click('[data-tier="starter"]');

    // 3. Intercept Stripe webhook and simulate duplicate
    await context.route("**/stripe-webhook", async (route) => {
      const request = route.request();
      const body = request.postDataJSON();

      // Store first event
      if (!global.firstEventId) {
        global.firstEventId = body.id;
        await route.continue();
        return;
      }

      // Send duplicate
      if (body.id === global.firstEventId) {
        // Webhook should return 200 but not process
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ received: true, duplicate: true }),
        });
        return;
      }

      await route.continue();
    });

    // 4. Complete Stripe checkout (mock)
    await page.click('[data-testid="confirm-payment"]');

    // 5. Wait for activation
    await page.waitForSelector('[data-subscription-tier="starter"]');

    // 6. Check database (via API)
    const response = await page.evaluate(async () => {
      return fetch("/api/test/subscription-count", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json());
    });

    expect(response.subscriptionCount).toBe(1);
    expect(response.stripeEventCount).toBe(1); // Only one event logged
  });
});
```

---

### Test 2: Out-of-Order Events (`invoice.paid` before `checkout.session.completed`)

**Scenario:** Network conditions cause `invoice.paid` to arrive before `checkout.session.completed`.

**Expected Behavior:**
- ✅ `invoice.paid` arrives first: Sets subscription to `active` (creates record with subscription ID)
- ✅ `checkout.session.completed` arrives second: Links customer ID but does NOT change `active` status
- ✅ User has access to paid features
- ✅ No data corruption

**Test Implementation (Convex):**

```typescript
test("out-of-order events: invoice.paid before checkout.session.completed", async () => {
  const t = convexTest();

  const userId = await t.mutation(api.auth.createUser, {
    email: "outoforder@test.com",
    password: "pass",
  });

  // EVENT 2 arrives FIRST
  const invoicePaidEvent = {
    id: "evt_invoice_paid",
    type: "invoice.paid",
    created: 1000,
    data: {
      object: {
        subscription: "sub_123",
        customer: "cus_123",
        lines: { data: [{ period: { end: 2000 } }] },
      },
    },
  };

  await t.mutation(api.payments.handleWebhookEvent, { event: invoicePaidEvent });

  // Check: subscription is active
  let user = await t.query(api.auth.getUser, { userId });
  expect(user.subscriptionTier).toBe("unknown"); // We don't know tier yet
  expect(user.stripeSubscriptionId).toBe("sub_123");

  // EVENT 1 arrives SECOND
  const checkoutEvent = {
    id: "evt_checkout",
    type: "checkout.session.completed",
    created: 999, // OLDER timestamp
    data: {
      object: {
        subscription: "sub_123",
        customer: "cus_123",
        metadata: { userId, tier: "starter" },
      },
    },
  };

  await t.mutation(api.payments.handleWebhookEvent, { event: checkoutEvent });

  // Check: tier is now set, but status remains active
  user = await t.query(api.auth.getUser, { userId });
  expect(user.subscriptionTier).toBe("starter");
  expect(user.stripeCustomerId).toBe("cus_123");
  expect(user.stripeSubscriptionId).toBe("sub_123");
});
```

**State Machine Test:**

```typescript
test("state machine prevents invalid transitions", async () => {
  const t = convexTest();

  const userId = await t.mutation(api.auth.createUser, {
    email: "statemachine@test.com",
    password: "pass",
  });

  // Set to "active"
  await t.mutation(api.payments.updateSubscriptionStatus, {
    userId,
    status: "active",
  });

  // Try to transition to "incomplete" (invalid: active → incomplete not allowed)
  const result = await t.mutation(api.payments.updateSubscriptionStatus, {
    userId,
    status: "incomplete",
  });

  expect(result.success).toBe(false);
  expect(result.error).toContain("Invalid state transition");

  // User should still be "active"
  const user = await t.query(api.auth.getUser, { userId });
  expect(user.subscriptionTier).toBe("active");
});
```

---

### Test 3: Missing `invoice.paid` Webhook (Paid User Locked Out)

**Scenario:** Webhook fails to deliver for 2 hours due to endpoint downtime. User paid but still shows as "free" tier.

**Expected Behavior:**
- ✅ Reconciliation job polls Stripe API
- ✅ Detects paid invoice that wasn't processed via webhook
- ✅ Activates user's subscription
- ✅ User regains access within reconciliation window (15 min)

**Test Implementation (Convex):**

```typescript
test("reconciliation job backfills missing invoice.paid event", async () => {
  const t = convexTest();

  const userId = await t.mutation(api.auth.createUser, {
    email: "missing@test.com",
    password: "pass",
  });

  // Simulate: User completed Stripe checkout, got customer ID, but webhook failed
  await t.mutation(api.auth.updateUser, {
    userId,
    stripeCustomerId: "cus_missing_123",
    subscriptionTier: "free", // Still free because webhook never arrived
  });

  // Mock Stripe API to return paid invoice
  global.mockStripeInvoices = [
    {
      id: "in_missing_123",
      subscription: "sub_missing_123",
      customer: "cus_missing_123",
      paid: true,
      created: Date.now() / 1000 - 3600, // 1 hour ago
      lines: {
        data: [{ period: { end: Date.now() / 1000 + 86400 * 30 } }],
      },
    },
  ];

  // Run reconciliation
  await t.action(api.payments.reconcileRecentInvoices, { minutes: 120 });

  // Check: user is now active
  const user = await t.query(api.auth.getUser, { userId });
  expect(user.subscriptionTier).toBe("starter"); // Inferred from Stripe price
  expect(user.stripeSubscriptionId).toBe("sub_missing_123");
  expect(user.analysesLimit).toBe(999999); // Unlimited
});
```

**Grace Period Test:**

```typescript
test("grace period prevents lockout during webhook delay", async () => {
  const t = convexTest();

  const userId = await t.mutation(api.auth.createUser, {
    email: "grace@test.com",
    password: "pass",
  });

  // Set subscription to "past_due" but last verified 5 minutes ago
  await t.mutation(api.auth.updateUser, {
    userId,
    subscriptionTier: "starter",
    subscriptionStatus: "past_due",
    currentPeriodEnd: Date.now() - 1000, // Expired 1 second ago
    lastVerifiedFromStripeAt: Date.now() - 5 * 60 * 1000, // 5 min ago
  });

  // Check access: should still have access (grace period)
  const hasAccess = await t.query(api.auth.hasActiveAccess, { userId });
  expect(hasAccess).toBe(true);

  // Simulate 20 minutes passing (grace period expired)
  await t.mutation(api.auth.updateUser, {
    userId,
    lastVerifiedFromStripeAt: Date.now() - 20 * 60 * 1000, // 20 min ago
  });

  // Check access: should be locked out now
  const hasAccessAfter = await t.query(api.auth.hasActiveAccess, { userId });
  expect(hasAccessAfter).toBe(false);
});
```

**Playwright E2E Test:**

```typescript
test("user with missing webhook gets access via reconciliation", async ({ page }) => {
  // 1. Create user
  await page.goto("http://localhost:5173/signup");
  const email = `missing-${Date.now()}@test.com`;
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', "Test123!@#");
  await page.click('button[type="submit"]');

  // 2. Mock: User pays in Stripe, but webhook fails (return 500)
  await page.route("**/stripe-webhook", async (route) => {
    await route.fulfill({ status: 500 }); // Simulate endpoint down
  });

  // 3. User upgrades (payment succeeds in Stripe, webhook fails)
  await page.goto("http://localhost:5173/pricing");
  await page.click('[data-tier="starter"]');
  await page.click('[data-testid="confirm-payment"]');

  // 4. User should see "free" tier (webhook failed)
  await expect(page.locator('[data-subscription-tier="free"]')).toBeVisible();

  // 5. Restore webhook endpoint
  await page.unroute("**/stripe-webhook");

  // 6. Trigger reconciliation (simulate cron job)
  await page.evaluate(async () => {
    await fetch("/api/admin/reconcile-subscriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    });
  });

  // 7. User should now see "starter" tier
  await page.reload();
  await expect(page.locator('[data-subscription-tier="starter"]')).toBeVisible();
  await expect(page.locator('[data-analyses-remaining]')).toContainText("Unlimited");
});
```

---

## 🟡 P1 TESTS (Should Implement)

### Test 4: Network Timeout During Checkout

**Scenario:** User clicks "Pay" but request times out.

**Expected:**
- ✅ Show user-friendly error message
- ✅ Allow retry
- ✅ Don't create duplicate checkout sessions

```typescript
test("network timeout shows retry button", async ({ page }) => {
  await page.goto("http://localhost:5173/pricing");

  // Simulate timeout
  await page.route("**/create-checkout-session", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10s delay
  });

  await page.click('[data-tier="starter"]');
  await page.click('[data-testid="upgrade-button"]', { timeout: 5000 }).catch(() => {
    // Expected to timeout
  });

  // Should show error with retry
  await expect(page.locator('[data-error="checkout-timeout"]')).toBeVisible();
  await expect(page.locator('[data-action="retry-checkout"]')).toBeVisible();
});
```

### Test 5: Webhook Signature Verification Failure

**Scenario:** Attacker sends fake webhook with invalid signature.

**Expected:**
- ✅ Return `400 Bad Request`
- ✅ Do NOT process event
- ✅ Log security warning

```typescript
test("invalid webhook signature is rejected", async () => {
  const t = convexTest();

  const result = await t.action(api.http.routes["/stripe-webhook"], {
    method: "POST",
    body: JSON.stringify({ id: "evt_fake", type: "invoice.paid" }),
    headers: { "stripe-signature": "invalid_signature" },
  });

  expect(result.status).toBe(400);
  expect(result.body).toContain("Invalid signature");

  // Check: no event was logged
  const events = await t.query(api.payments.getStripeEventsByEventId, {
    eventId: "evt_fake",
  });
  expect(events.length).toBe(0);
});
```

---

## 🔵 P2 TESTS (Nice to Have)

### Test 6: Subscription Cancellation Flow

```typescript
test("customer.subscription.deleted downgrades user to free", async () => {
  const t = convexTest();

  const userId = await t.mutation(api.auth.createUser, {
    email: "cancel@test.com",
    password: "pass",
  });

  // Set to starter tier
  await t.mutation(api.payments.handleSubscriptionSuccess, {
    userId,
    tier: "starter",
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
  });

  // Send cancellation event
  await t.mutation(api.payments.handleWebhookEvent, {
    event: {
      id: "evt_cancel",
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_123", customer: "cus_123" } },
    },
  });

  // Check: downgraded to free
  const user = await t.query(api.auth.getUser, { userId });
  expect(user.subscriptionTier).toBe("free");
  expect(user.analysesLimit).toBe(3);
});
```

---

## 🛠️ Test Utilities & Mocks

### Stripe Event Builder

```typescript
// tests/utils/stripeEventBuilder.ts
export class StripeEventBuilder {
  static checkoutSessionCompleted(overrides = {}) {
    return {
      id: `evt_checkout_${Date.now()}`,
      type: "checkout.session.completed",
      created: Date.now() / 1000,
      data: {
        object: {
          id: "cs_test",
          customer: "cus_test",
          subscription: "sub_test",
          metadata: { userId: "user_test", tier: "starter" },
          ...overrides,
        },
      },
    };
  }

  static invoicePaid(overrides = {}) {
    return {
      id: `evt_invoice_${Date.now()}`,
      type: "invoice.paid",
      created: Date.now() / 1000,
      data: {
        object: {
          subscription: "sub_test",
          customer: "cus_test",
          lines: { data: [{ period: { end: Date.now() / 1000 + 86400 * 30 } }] },
          ...overrides,
        },
      },
    };
  }

  static duplicate(event) {
    return { ...event }; // Same event ID
  }

  static withOlderTimestamp(event, secondsAgo = 100) {
    return { ...event, created: event.created - secondsAgo };
  }
}
```

### Mock Stripe API

```typescript
// tests/mocks/stripeMock.ts
export class MockStripeAPI {
  invoices = [];
  subscriptions = [];

  addInvoice(invoice) {
    this.invoices.push(invoice);
  }

  addSubscription(subscription) {
    this.subscriptions.push(subscription);
  }

  Invoice = {
    list: async (params) => {
      return {
        data: this.invoices.filter((inv) => inv.created >= params.created.gte),
        auto_paging_iter: function* () {
          for (const inv of this.data) yield inv;
        },
      };
    },
  };

  Subscription = {
    retrieve: async (id) => {
      return this.subscriptions.find((sub) => sub.id === id);
    },
    list: async (params) => {
      return {
        data: this.subscriptions.filter((sub) => sub.customer === params.customer),
        auto_paging_iter: function* () {
          for (const sub of this.data) yield sub;
        },
      };
    },
  };
}
```

---

## 📈 Test Coverage Goals

**Phase 1 (This Sprint):**
- ✅ P0 tests implemented (3 tests)
- ✅ Basic state machine validation
- ✅ Idempotency protection verified
- **Coverage:** Prevent 90% of Grok-identified issues

**Phase 2 (Next Sprint):**
- ✅ P1 tests implemented (2 tests)
- ✅ P2 tests implemented (1 test)
- ✅ Full state machine transitions tested
- **Coverage:** 95% protection

**Phase 3 (Month 2):**
- ✅ Load testing (1000 concurrent webhooks)
- ✅ Chaos monkey (random failure injection)
- ✅ Production smoke tests (live monitoring)
- **Coverage:** 99% protection

---

## 🚀 Implementation Sequence

1. **Convex Tests First** (30 min)
   - Implement P0 tests in Convex
   - Verify idempotency works
   - Test state machine

2. **Backend Fixes** (20 min)
   - Add reconciliation job
   - Add grace period logic
   - Implement state machine validation

3. **Playwright E2E** (30 min)
   - Implement P0 E2E tests
   - Test full user journey with chaos

4. **Validation** (15 min)
   - Run all tests
   - Verify coverage
   - Document results

---

## ✅ Success Criteria

Tests pass when:
- ✅ Duplicate events do not corrupt data
- ✅ Out-of-order events do not break subscription state
- ✅ Missing events are backfilled within 15 minutes
- ✅ No paid user is ever locked out
- ✅ All state transitions are valid
- ✅ Security (signature verification) is enforced

---

**Next Step:** Implement P0 tests in Cursor (Movement III)
