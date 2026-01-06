/**
 * Stripe payment functions for PropIQ
 * Handles subscriptions and payment processing
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Subscription tier configuration
// USAGE-BASED MODEL (Jan 4, 2026) - Sustainable pricing with capped analyses
// Protects margins, predictable COGS, clear upsell path
const SUBSCRIPTION_TIERS = {
  free: { price: 0, analyses: 3, priceId: null },
  starter: { price: 29, analyses: 20, priceId: 'price_1Sm54hJogOchEFxvukES6gEC' }, // $29/mo - 20 analyses
  pro: { price: 79, analyses: 100, priceId: 'price_1Sm55FJogOchEFxvHsjRST1K' }, // $79/mo - 100 analyses
  elite: { price: 199, analyses: 300, priceId: 'price_1Sm57PJogOchEFxvQypRULNy' }, // $199/mo - 300 analyses
};

// Create Stripe checkout session
export const createCheckoutSession = action({
  args: {
    userId: v.id("users"),
    tier: v.string(), // "starter" | "pro" | "elite"
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const user: any = await ctx.runQuery(api.auth.getUser, { userId: args.userId });

    if (!user) {
      console.error("User not found for checkout:", args.userId);
      throw new Error("User not found");
    }

    const tierConfig = SUBSCRIPTION_TIERS[args.tier as keyof typeof SUBSCRIPTION_TIERS];

    if (!tierConfig || !tierConfig.priceId) {
      console.error("Invalid subscription tier:", args.tier);
      throw new Error("Invalid subscription tier");
    }

    // Check if price ID is a placeholder (not yet configured in Stripe)
    if (tierConfig.priceId.startsWith('price_STARTER_') ||
        tierConfig.priceId.startsWith('price_PRO_') ||
        tierConfig.priceId.startsWith('price_ELITE_')) {
      console.error("Placeholder price ID detected:", tierConfig.priceId);
      throw new Error(
        "Pricing update in progress. New pricing tiers launching soon! " +
        "Current tier: " + args.tier.toUpperCase() + " ($" + tierConfig.price + "/month). " +
        "Please check back in a few hours or contact support@luntra.one for early access."
      );
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      throw new Error("Stripe not configured");
    }

    try {
      const requestBody = new URLSearchParams({
        "mode": "subscription",
        "customer_email": user.email,
        "line_items[0][price]": tierConfig.priceId,
        "line_items[0][quantity]": "1",
        "success_url": args.successUrl,
        "cancel_url": args.cancelUrl,
        "metadata[userId]": args.userId,
        "metadata[tier]": args.tier,
      }).toString();

      // Create Stripe checkout session
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${apiKey}`,
        },
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Stripe API error:", errorText);
        throw new Error(`Stripe API error: ${errorText}`);
      }

      const session = await response.json();

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("Checkout creation failed:", error);
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Full error:", error);
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : String(error)}`);
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
