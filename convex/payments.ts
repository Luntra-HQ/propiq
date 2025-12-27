/**
 * Stripe payment functions for PropIQ
 * Handles subscriptions and payment processing
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Subscription tier configuration
// NEW STRATEGY: Unlimited analyses on all paid tiers (SaaS Playbook model)
// Lower entry price ($49 vs $69), premium positioning for Elite ($199)
const SUBSCRIPTION_TIERS = {
  free: { price: 0, analyses: 3, priceId: null },
  starter: { price: 49, analyses: 999999, priceId: process.env.STRIPE_STARTER_PRICE_ID }, // UNLIMITED
  pro: { price: 99, analyses: 999999, priceId: process.env.STRIPE_PRO_PRICE_ID }, // UNLIMITED
  elite: { price: 199, analyses: 999999, priceId: process.env.STRIPE_ELITE_PRICE_ID }, // UNLIMITED
};

const ACCESS_GRACE_PERIOD_MS = 15 * 60 * 1000;

// Create Stripe checkout session
export const createCheckoutSession = action({
  args: {
    userId: v.id("users"),
    tier: v.string(), // "starter" | "pro" | "elite"
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.getUser, { userId: args.userId });

    if (!user) {
      throw new Error("User not found");
    }

    const tierConfig = SUBSCRIPTION_TIERS[args.tier as keyof typeof SUBSCRIPTION_TIERS];

    if (!tierConfig || !tierConfig.priceId) {
      throw new Error("Invalid subscription tier");
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error("Stripe not configured");
    }

    try {
      // Create Stripe checkout session
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${apiKey}`,
        },
        body: new URLSearchParams({
          "mode": "subscription",
          "customer_email": user.email,
          "line_items[0][price]": tierConfig.priceId,
          "line_items[0][quantity]": "1",
          "success_url": args.successUrl,
          "cancel_url": args.cancelUrl,
          "metadata[userId]": args.userId,
          "metadata[tier]": args.tier,
          // Also attach metadata to the subscription so out-of-order events (invoice.paid)
          // can still map back to the user/tier even if checkout events arrive late.
          "subscription_data[metadata][userId]": args.userId,
          "subscription_data[metadata][tier]": args.tier,
        }).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stripe API error: ${errorText}`);
      }

      const session = await response.json();

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("Stripe checkout error:", error);
      throw new Error(`Failed to create checkout session: ${error}`);
    }
  },
});

// Handle successful subscription (called by webhook)
export const handleSubscriptionSuccess = mutation({
  args: {
    userId: v.id("users"),
    tier: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const tierConfig = SUBSCRIPTION_TIERS[args.tier as keyof typeof SUBSCRIPTION_TIERS];

    if (!tierConfig) {
      throw new Error("Invalid subscription tier");
    }

    const now = Date.now();

    // Update user with new subscription
    await ctx.db.patch(args.userId, {
      subscriptionTier: args.tier,
      subscriptionStatus: "active",
      lastVerifiedFromStripeAt: now,
      analysesLimit: tierConfig.analyses,
      analysesUsed: 0, // Reset usage count
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Cancel subscription
/**
 * Cancel user's subscription in Stripe
 * Subscription remains active until end of billing period
 */
export const cancelSubscription = action({
  args: {
    userId: v.id("users"),
    reason: v.string(), // "too_expensive" | "not_using" | "missing_features" | "switching_provider" | "other"
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.getUser, { userId: args.userId });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.stripeSubscriptionId) {
      throw new Error("No active subscription to cancel");
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error("Stripe not configured");
    }

    try {
      // Cancel subscription in Stripe (at period end)
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${user.stripeSubscriptionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${apiKey}`,
        },
        body: new URLSearchParams({
          // Cancel at period end (user retains access until then)
          cancel_at_period_end: "true",
        }).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stripe API error: ${errorText}`);
      }

      const subscription = await response.json();

      // Update database with cancellation info
      await ctx.runMutation(api.auth.updateUser, {
        userId: args.userId,
        updates: {
          subscriptionStatus: "cancelled",
          cancellationReason: args.reason,
          cancellationFeedback: args.feedback,
          cancelledAt: Date.now(),
          previousTier: user.subscriptionTier,
          updatedAt: Date.now(),
        },
      });

      // Record cancellation in analytics table
      await ctx.runMutation(api.cancellations.recordCancellation, {
        userId: args.userId,
        reason: args.reason,
        reasonText: args.feedback,
        tier: user.subscriptionTier,
      });

      console.log(`Subscription cancelled for user ${args.userId}. Active until: ${new Date(subscription.current_period_end * 1000).toISOString()}`);

      return {
        success: true,
        cancelAt: subscription.current_period_end * 1000, // Convert to milliseconds
        message: "Your subscription will remain active until the end of your billing period.",
      };
    } catch (error) {
      console.error("Stripe cancellation error:", error);
      throw new Error(`Failed to cancel subscription: ${error}`);
    }
  },
});

// Get user's subscription info
export const getSubscriptionInfo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    const tierConfig = SUBSCRIPTION_TIERS[user.subscriptionTier as keyof typeof SUBSCRIPTION_TIERS];

    return {
      tier: user.subscriptionTier,
      price: tierConfig.price,
      analysesUsed: user.analysesUsed,
      analysesLimit: user.analysesLimit,
      analysesRemaining: user.analysesLimit - user.analysesUsed,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      subscriptionStatus: user.subscriptionStatus,
      lastVerifiedFromStripeAt: user.lastVerifiedFromStripeAt,
      currentPeriodEnd: user.currentPeriodEnd,
    };
  },
});

/**
 * Stripe webhook idempotency + event logging.
 *
 * Convex transactions are serializable; doing "read by index then insert" in a single
 * mutation ensures concurrent duplicates will retry and see the existing record.
 */
export const startStripeEventProcessing = mutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    customerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    rawData: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stripeEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .first();

    if (existing) {
      return {
        duplicate: true,
        eventLogId: existing._id,
        status: existing.status,
      };
    }

    const eventLogId = await ctx.db.insert("stripeEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      customerId: args.customerId,
      subscriptionId: args.subscriptionId,
      status: "processing",
      rawData: args.rawData,
      createdAt: Date.now(),
    });

    return { duplicate: false, eventLogId, status: "processing" };
  },
});

export const finishStripeEventProcessing = mutation({
  args: {
    eventLogId: v.id("stripeEvents"),
    status: v.string(), // "completed" | "failed"
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventLogId, {
      status: args.status,
      error: args.error,
    });
    return { success: true };
  },
});

export const getStripeEventsByEventId = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stripeEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

/**
 * Update subscription fields (used by webhook handlers + reconciliation job).
 */
export const updateSubscriptionStatus = mutation({
  args: {
    userId: v.id("users"),
    subscriptionStatus: v.optional(v.string()),
    lastVerifiedFromStripeAt: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.userId, {
      subscriptionStatus: args.subscriptionStatus,
      lastVerifiedFromStripeAt: args.lastVerifiedFromStripeAt ?? now,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: now,
    });
    return { success: true };
  },
});

type MockReconciliationPayload = {
  customerId: string;
  subscriptionId: string;
  tier: string;
  currentPeriodEnd?: number;
};

/**
 * Reconcile a single user's subscription state.
 *
 * For production it can call Stripe API (requires STRIPE_SECRET_KEY).
 * For tests/local chaos runs you can pass `mock` to avoid live Stripe calls.
 */
export const reconcileUserSubscription = action({
  args: {
    userId: v.id("users"),
    // JSON string to avoid complex Convex arg validators for Stripe-like payloads.
    mock: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // NOTE: Actions cannot access `ctx.db` directly. Use queries/mutations.
    const user = await ctx.runQuery(api.auth.getUser, { userId: args.userId });
    if (!user) throw new Error("User not found");

    let payload: MockReconciliationPayload | null = null;

    if (args.mock) {
      payload = JSON.parse(args.mock) as MockReconciliationPayload;
    } else {
      const apiKey = process.env.STRIPE_SECRET_KEY;
      if (!apiKey) {
        throw new Error("Stripe not configured");
      }

      // Minimal reconciliation strategy:
      // - Find Stripe customer by email
      // - List subscriptions for that customer
      // NOTE: This is intentionally conservative; production hardening can expand this.
      const searchResp = await fetch("https://api.stripe.com/v1/customers/search", {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!searchResp.ok) {
        throw new Error(`Stripe customer search failed: ${await searchResp.text()}`);
      }

      // Real Stripe search requires query param; keep this path for future hardening.
      // For now, tests should pass `mock`.
      throw new Error("Reconciliation requires mock payload in this environment");
    }

    const now = Date.now();
    const tierConfig = SUBSCRIPTION_TIERS[payload.tier as keyof typeof SUBSCRIPTION_TIERS];
    if (!tierConfig) {
      throw new Error(`Unknown tier: ${payload.tier}`);
    }

    // Apply the reconciliation update via mutations (write-safe).
    await ctx.runMutation(api.payments.handleSubscriptionSuccess, {
      userId: args.userId,
      tier: payload.tier,
      stripeCustomerId: payload.customerId,
      stripeSubscriptionId: payload.subscriptionId,
    });

    await ctx.runMutation(api.payments.updateSubscriptionStatus, {
      userId: args.userId,
      subscriptionStatus: "active",
      lastVerifiedFromStripeAt: now,
      currentPeriodEnd: payload.currentPeriodEnd,
    });

    // Verify access using the canonical gate (includes grace-period logic).
    const hasAccess = await ctx.runQuery(api.auth.hasActiveAccess, { userId: args.userId });

    return { success: true, reconciledAt: now, hasAccess };
  },
});

/**
 * Create Stripe Customer Portal session for subscription management
 *
 * Allows users to:
 * - Update payment method
 * - Cancel subscription
 * - View billing history
 * - Download invoices
 */
export const createCustomerPortalSession = action({
  args: {
    userId: v.id("users"),
    returnUrl: v.string(), // URL to return to after managing subscription
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.getUser, { userId: args.userId });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.stripeCustomerId) {
      throw new Error("No Stripe customer ID found. Please upgrade to a paid plan first.");
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error("Stripe not configured");
    }

    try {
      // Create Stripe Customer Portal session
      const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${apiKey}`,
        },
        body: new URLSearchParams({
          customer: user.stripeCustomerId,
          return_url: args.returnUrl,
        }).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stripe API error: ${errorText}`);
      }

      const session = await response.json();

      return {
        success: true,
        url: session.url,
      };
    } catch (error) {
      console.error("Stripe customer portal error:", error);
      throw new Error(`Failed to create customer portal session: ${error}`);
    }
  },
});

/**
 * Change user's subscription tier (upgrade or downgrade)
 * Stripe handles prorated credits/charges automatically
 */
export const changeSubscriptionTier = action({
  args: {
    userId: v.id("users"),
    newTier: v.string(), // "starter" | "pro" | "elite"
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.getUser, { userId: args.userId });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.stripeSubscriptionId) {
      throw new Error("No active subscription to modify");
    }

    if (args.newTier === user.subscriptionTier) {
      throw new Error("Already on this tier");
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error("Stripe not configured");
    }

    // Get the new price ID for the tier
    const priceIds: Record<string, string> = {
      starter: process.env.STRIPE_STARTER_PRICE_ID!,
      pro: process.env.STRIPE_PRO_PRICE_ID!,
      elite: process.env.STRIPE_ELITE_PRICE_ID!,
    };

    const newPriceId = priceIds[args.newTier];

    if (!newPriceId) {
      throw new Error(`Invalid tier: ${args.newTier}`);
    }

    try {
      // First, retrieve the subscription to get the subscription item ID
      const subscriptionResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions/${user.stripeSubscriptionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!subscriptionResponse.ok) {
        const errorText = await subscriptionResponse.text();
        throw new Error(`Failed to retrieve subscription: ${errorText}`);
      }

      const subscription = await subscriptionResponse.json();
      const subscriptionItemId = subscription.items.data[0].id;

      // Update the subscription with the new price
      const updateResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions/${user.stripeSubscriptionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${apiKey}`,
          },
          body: new URLSearchParams({
            [`items[0][id]`]: subscriptionItemId,
            [`items[0][price]`]: newPriceId,
            proration_behavior: "create_prorations", // Stripe handles credits/charges
          }).toString(),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Stripe API error: ${errorText}`);
      }

      const updatedSubscription = await updateResponse.json();

      // Update database
      await ctx.runMutation(api.auth.updateUser, {
        userId: args.userId,
        updates: {
          subscriptionTier: args.newTier,
          previousTier: user.subscriptionTier,
          updatedAt: Date.now(),
        },
      });

      console.log(`Subscription tier changed for user ${args.userId}: ${user.subscriptionTier} → ${args.newTier}`);

      return {
        success: true,
        newTier: args.newTier,
        proratedAmount: updatedSubscription.latest_invoice?.amount_due || 0,
        message: "Your subscription has been updated successfully.",
      };
    } catch (error) {
      console.error("Stripe tier change error:", error);
      throw new Error(`Failed to change subscription tier: ${error}`);
    }
  },
});
