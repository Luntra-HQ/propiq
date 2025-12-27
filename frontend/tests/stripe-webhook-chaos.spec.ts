/**
 * Stripe Chaos Engineering Tests (P0)
 *
 * These tests are intentionally backend-focused and run under Playwright so they
 * integrate with the existing `frontend/tests/` structure.
 *
 * They validate:
 * 1) Duplicate event delivery (idempotency)
 * 2) Out-of-order events (invoice.paid before checkout.session.completed)
 * 3) Missing webhook delivery + reconciliation + grace period
 */

import { test, expect } from '@playwright/test';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

type StripeEvent = {
  id: string;
  type: string;
  created: number;
  data: {
    object: any;
  };
};

function getConvexUrls() {
  // Important: do NOT default to production here.
  // These chaos tests mutate data (create users, write stripeEvents).
  const cloudEnv = process.env.VITE_CONVEX_URL;
  if (!cloudEnv) {
    throw new Error(
      [
        'VITE_CONVEX_URL is not set.',
        'Set it in `frontend/.env.local` or repo-root `.env.local`, or export it before running Playwright.',
        'Example: VITE_CONVEX_URL=https://<your-deployment>.convex.cloud',
      ].join(' ')
    );
  }

  const cloudUrlRaw = cloudEnv
    .replace(/\.convex\.site$/, '.convex.cloud')
    .replace(/\/+$/, '');

  const siteUrl = cloudUrlRaw.replace(/\.convex\.cloud$/, '.convex.site');
  return { cloudUrl: cloudUrlRaw, siteUrl };
}

function uniqueEmail(prefix: string) {
  const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${nonce}@propiq-chaos-test.local`;
}

async function createTestUser(convex: ConvexHttpClient) {
  const email = uniqueEmail('stripe');
  const password = 'TestPassword123!';

  const result = await convex.mutation(api.auth.signupWithSession, {
    email,
    password,
    firstName: 'Chaos',
    lastName: 'Test',
    userAgent: 'Playwright',
  });

  return { email, password, userId: result.user._id };
}

function checkoutSessionCompletedEvent(params: {
  eventId: string;
  userId: string;
  tier: 'starter' | 'pro' | 'elite';
  customerId: string;
  subscriptionId: string;
}): StripeEvent {
  return {
    id: params.eventId,
    type: 'checkout.session.completed',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: `cs_test_${params.eventId}`,
        customer: params.customerId,
        subscription: params.subscriptionId,
        metadata: {
          userId: params.userId,
          tier: params.tier,
        },
      },
    },
  };
}

function invoicePaidEvent(params: {
  eventId: string;
  userId: string;
  tier: 'starter' | 'pro' | 'elite';
  customerId: string;
  subscriptionId: string;
}): StripeEvent {
  return {
    id: params.eventId,
    type: 'invoice.paid',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: `in_test_${params.eventId}`,
        customer: params.customerId,
        subscription: params.subscriptionId,
        metadata: {
          userId: params.userId,
          tier: params.tier,
        },
      },
    },
  };
}

test.describe('Stripe Chaos Engineering (P0)', () => {
  test('TEST 1: duplicate checkout.session.completed is idempotent (no duplicated stripeEvents row)', async ({ request }) => {
    test.setTimeout(60_000);
    const { cloudUrl, siteUrl } = getConvexUrls();
    const convex = new ConvexHttpClient(cloudUrl);

    const { userId } = await createTestUser(convex);

    const eventId = `evt_test_dup_${Date.now()}`;
    const event = checkoutSessionCompletedEvent({
      eventId,
      userId: userId as unknown as string,
      tier: 'starter',
      customerId: `cus_test_${Date.now()}`,
      subscriptionId: `sub_test_${Date.now()}`,
    });

    const first = await request.post(`${siteUrl}/stripe-webhook`, {
      headers: { 'stripe-signature': 'test-signature' },
      data: event,
    });
    expect(first.status()).toBe(200);

    const second = await request.post(`${siteUrl}/stripe-webhook`, {
      headers: { 'stripe-signature': 'test-signature' },
      data: event,
    });
    expect(second.status()).toBe(200);

    const loggedEvents = await convex.query(api.payments.getStripeEventsByEventId, { eventId });
    expect(loggedEvents.length).toBe(1);

    const user = await convex.query(api.auth.getUser, { userId });
    expect(user?.subscriptionTier).toBe('starter');
    expect(user?.stripeSubscriptionId).toBe(event.data.object.subscription);
  });

  test('TEST 2: out-of-order events (invoice.paid arrives before checkout.session.completed) does not corrupt subscription state', async ({ request }) => {
    test.setTimeout(60_000);
    const { cloudUrl, siteUrl } = getConvexUrls();
    const convex = new ConvexHttpClient(cloudUrl);

    const { userId } = await createTestUser(convex);

    const customerId = `cus_ooo_${Date.now()}`;
    const subscriptionId = `sub_ooo_${Date.now()}`;

    const invoiceEventId = `evt_test_invoice_first_${Date.now()}`;
    const checkoutEventId = `evt_test_checkout_second_${Date.now()}`;

    const invoiceEvent = invoicePaidEvent({
      eventId: invoiceEventId,
      userId: userId as unknown as string,
      tier: 'pro',
      customerId,
      subscriptionId,
    });

    const checkoutEvent = checkoutSessionCompletedEvent({
      eventId: checkoutEventId,
      userId: userId as unknown as string,
      tier: 'pro',
      customerId,
      subscriptionId,
    });

    const invoiceResp = await request.post(`${siteUrl}/stripe-webhook`, {
      headers: { 'stripe-signature': 'test-signature' },
      data: invoiceEvent,
    });
    expect(invoiceResp.status()).toBe(200);

    const afterInvoice = await convex.query(api.auth.getUser, { userId });
    expect(afterInvoice?.subscriptionTier).toBe('pro');
    expect(afterInvoice?.subscriptionStatus).toBe('active');
    expect(afterInvoice?.stripeCustomerId).toBe(customerId);
    expect(afterInvoice?.stripeSubscriptionId).toBe(subscriptionId);

    const checkoutResp = await request.post(`${siteUrl}/stripe-webhook`, {
      headers: { 'stripe-signature': 'test-signature' },
      data: checkoutEvent,
    });
    expect(checkoutResp.status()).toBe(200);

    const afterCheckout = await convex.query(api.auth.getUser, { userId });
    expect(afterCheckout?.subscriptionTier).toBe('pro');
    expect(afterCheckout?.subscriptionStatus).toBe('active');
    expect(afterCheckout?.stripeCustomerId).toBe(customerId);
    expect(afterCheckout?.stripeSubscriptionId).toBe(subscriptionId);

    const invoiceLogs = await convex.query(api.payments.getStripeEventsByEventId, { eventId: invoiceEventId });
    const checkoutLogs = await convex.query(api.payments.getStripeEventsByEventId, { eventId: checkoutEventId });
    expect(invoiceLogs.length).toBe(1);
    expect(checkoutLogs.length).toBe(1);
  });

  test('TEST 3: missing webhook + reconciliation activates user within grace period (no immediate lockout)', async ({ context }) => {
    test.setTimeout(60_000);
    const { cloudUrl, siteUrl } = getConvexUrls();
    const convex = new ConvexHttpClient(cloudUrl);

    const { userId } = await createTestUser(convex);

    const eventId = `evt_test_missing_${Date.now()}`;
    const customerId = `cus_missing_${Date.now()}`;
    const subscriptionId = `sub_missing_${Date.now()}`;

    const event = checkoutSessionCompletedEvent({
      eventId,
      userId: userId as unknown as string,
      tier: 'starter',
      customerId,
      subscriptionId,
    });

    // Simulate webhook endpoint returning 500 so the event is never processed.
    // We use route interception so the request never reaches Convex.
    const targetUrl = 'https://stripe-webhook-outage.test.invalid/stripe-webhook';
    await context.route('**/stripe-webhook', async (route) => {
      await route.fulfill({ status: 500, body: 'simulated webhook outage' });
    });

    const blocked = await context.request
      .post(targetUrl, {
        headers: { 'stripe-signature': 'test-signature' },
        data: event,
        failOnStatusCode: false,
      })
      .catch((e) => e);

    // If routing is active for APIRequestContext, we should see the simulated 500.
    // If routing is not active, the request will fail DNS and still correctly model "never processed".
    if (typeof blocked?.status === 'function') {
      expect(blocked.status()).toBe(500);
    }

    await context.unroute('**/stripe-webhook');

    // Verify the event was NOT logged/processed in Convex.
    const loggedEvents = await convex.query(api.payments.getStripeEventsByEventId, { eventId });
    expect(loggedEvents.length).toBe(0);

    // Trigger reconciliation job (Stripe API is mocked via payload).
    await convex.action(api.payments.reconcileUserSubscription, {
      userId,
      mock: JSON.stringify({
        customerId,
        subscriptionId,
        tier: 'starter',
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }),
    });

    const userAfterReconcile = await convex.query(api.auth.getUser, { userId });
    expect(userAfterReconcile?.subscriptionTier).toBe('starter');
    expect(userAfterReconcile?.subscriptionStatus).toBe('active');
    expect(userAfterReconcile?.stripeCustomerId).toBe(customerId);
    expect(userAfterReconcile?.stripeSubscriptionId).toBe(subscriptionId);

    // Grace period prevents immediate lockout during Stripe delays.
    await convex.mutation(api.payments.updateSubscriptionStatus, {
      userId,
      subscriptionStatus: 'past_due',
      lastVerifiedFromStripeAt: Date.now() - 5 * 60 * 1000,
    });

    const hasAccessWithinGrace = await convex.query(api.auth.hasActiveAccess, { userId });
    expect(hasAccessWithinGrace).toBe(true);

    // After grace period expires, lockout is allowed.
    await convex.mutation(api.payments.updateSubscriptionStatus, {
      userId,
      subscriptionStatus: 'past_due',
      lastVerifiedFromStripeAt: Date.now() - 20 * 60 * 1000,
    });

    const hasAccessAfterGrace = await convex.query(api.auth.hasActiveAccess, { userId });
    expect(hasAccessAfterGrace).toBe(false);
  });
});
