/**
 * Manual User Setup Script
 *
 * Creates a user account and links existing Stripe subscription
 *
 * Usage:
 * npx convex run scripts/manual-user-setup:setupUser \
 *   --email "bdusape@gmail.com" \
 *   --stripeCustomerId "cus_TfS8sSuWVZqLjy" \
 *   --stripeSubscriptionId "sub_1Si7DuJogOchEFxvFRBb7eVH" \
 *   --tier "starter"
 */

import { internalMutation } from "../convex/_generated/server";
import { v } from "convex/values";

export const setupUser = internalMutation({
  args: {
    email: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user with Stripe data
      await ctx.db.patch(existingUser._id, {
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        subscriptionTier: args.tier,
        subscriptionStatus: "active",
        analysesLimit: 999999, // Unlimited for paid tier
        analysesUsed: 0,
        lastVerifiedFromStripeAt: Date.now(),
        updatedAt: Date.now(),
      });

      return {
        success: true,
        message: `Updated existing user ${args.email}`,
        userId: existingUser._id,
      };
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      emailVerified: true, // Auto-verify since they paid
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionTier: args.tier,
      subscriptionStatus: "active",
      analysesUsed: 0,
      analysesLimit: 999999, // Unlimited
      lastVerifiedFromStripeAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // Will set password via reset flow
    });

    return {
      success: true,
      message: `Created new user ${args.email}`,
      userId,
    };
  },
});
