/**
 * Stripe payment functions for PropIQ
 * Handles subscriptions and payment processing
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Subscription tier configuration
const SUBSCRIPTION_TIERS = {
  free: { price: 0, analyses: 3, priceId: null },
  starter: { price: 29, analyses: 20, priceId: process.env.STRIPE_STARTER_PRICE_ID },
  pro: { price: 79, analyses: 100, priceId: process.env.STRIPE_PRO_PRICE_ID },
  elite: { price: 199, analyses: 999999, priceId: process.env.STRIPE_ELITE_PRICE_ID },
};

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

    // Update user with new subscription
    await ctx.db.patch(args.userId, {
      subscriptionTier: args.tier,
      analysesLimit: tierConfig.analyses,
      analysesUsed: 0, // Reset usage count
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Cancel subscription
export const cancelSubscription = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Downgrade to free tier
    await ctx.db.patch(args.userId, {
      subscriptionTier: "free",
      analysesLimit: 3,
      stripeSubscriptionId: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
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
    };
  },
});

// Log Stripe webhook event
export const logStripeEvent = mutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    customerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    status: v.string(),
    error: v.optional(v.string()),
    rawData: v.string(),
  },
  handler: async (ctx, args) => {
    const eventLogId = await ctx.db.insert("stripeEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      customerId: args.customerId,
      subscriptionId: args.subscriptionId,
      status: args.status,
      error: args.error,
      rawData: args.rawData,
      createdAt: Date.now(),
    });

    return eventLogId;
  },
});
