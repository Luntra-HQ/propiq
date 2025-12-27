/**
 * Referral program functions for PropIQ
 * Handles referral code generation, tracking, and rewards
 */

import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Generate a unique referral code in format: FIRSTNAME-XXXX
 * Example: BRIAN-A1B2, WARREN-X9Y4
 */
function generateReferralCode(firstName?: string): string {
  const name = (firstName || "USER").toUpperCase().substring(0, 10);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous chars (0,O,1,I)
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${name}-${code}`;
}

/**
 * Get or create user's referral code
 * Returns existing code if user has one, generates new one if not
 */
export const getOrCreateReferralCode = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // If user already has a code, return it
    if (user.referralCode) {
      return {
        success: true,
        code: user.referralCode,
        url: `https://propiq.luntra.one/r/${user.referralCode}`,
      };
    }

    // Generate new unique code
    let code = generateReferralCode(user.firstName);
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", code))
        .first();

      if (!existing) {
        break; // Code is unique
      }

      // Generate new code and try again
      code = generateReferralCode(user.firstName);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique referral code");
    }

    // Save code to user
    await ctx.db.patch(args.userId, {
      referralCode: code,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      code,
      url: `https://propiq.luntra.one/r/${code}`,
    };
  },
});

/**
 * Get user's referral code (query, doesn't create if missing)
 */
export const getReferralCode = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user || !user.referralCode) {
      return null;
    }

    return {
      code: user.referralCode,
      url: `https://propiq.luntra.one/r/${user.referralCode}`,
    };
  },
});

/**
 * Validate a referral code and get referrer info
 */
export const validateReferralCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.code))
      .first();

    if (!referrer) {
      return {
        valid: false,
        error: "Invalid referral code",
      };
    }

    return {
      valid: true,
      referrerId: referrer._id,
      referrerName: referrer.firstName || "A PropIQ user",
    };
  },
});

/**
 * Track a new referral when someone signs up with a code
 * Called during signup process
 */
export const trackReferral = mutation({
  args: {
    referredUserId: v.id("users"),
    referralCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Find referrer by code
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode))
      .first();

    if (!referrer) {
      console.error(`[REFERRAL] Invalid code: ${args.referralCode}`);
      return { success: false, error: "Invalid referral code" };
    }

    // Don't allow self-referrals
    if (referrer._id === args.referredUserId) {
      console.error(`[REFERRAL] Self-referral attempt: ${referrer.email}`);
      return { success: false, error: "Cannot refer yourself" };
    }

    // Update referred user
    await ctx.db.patch(args.referredUserId, {
      referredBy: referrer._id,
      updatedAt: Date.now(),
    });

    // Create referral record
    await ctx.db.insert("referrals", {
      referrerId: referrer._id,
      referredId: args.referredUserId,
      referralCode: args.referralCode,
      status: "pending", // pending -> converted -> rewarded
      rewardGranted: false,
      createdAt: Date.now(),
    });

    console.log(`[REFERRAL] Tracked: ${referrer.email} referred new user (ID: ${args.referredUserId})`);

    return {
      success: true,
      referrerId: referrer._id,
      referrerName: referrer.firstName || "PropIQ user",
    };
  },
});

/**
 * Mark referral as converted when referred user subscribes to paid plan
 * Called by Stripe webhook when subscription is created
 */
export const convertReferral = mutation({
  args: {
    userId: v.id("users"), // The user who just subscribed
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user || !user.referredBy) {
      // User wasn't referred, nothing to do
      return { success: true, wasReferred: false };
    }

    // Find the referral record
    const referral = await ctx.db
      .query("referrals")
      .withIndex("by_referred", (q) => q.eq("referredId", args.userId))
      .first();

    if (!referral) {
      console.error(`[REFERRAL] No referral record found for user ${args.userId}`);
      return { success: false, error: "Referral record not found" };
    }

    if (referral.status === "converted") {
      // Already converted
      return { success: true, alreadyConverted: true };
    }

    // Mark as converted
    await ctx.db.patch(referral._id, {
      status: "converted",
      convertedAt: Date.now(),
    });

    console.log(`[REFERRAL] Converted: User ${args.userId} subscribed (referrer: ${referral.referrerId})`);

    return {
      success: true,
      wasReferred: true,
      referrerId: referral.referrerId,
      needsReward: !referral.rewardGranted,
    };
  },
});

/**
 * Grant referral reward to referrer (1 month free via Stripe coupon)
 * Called after referred user subscribes
 */
export const grantReferralReward = action({
  args: {
    referralId: v.id("referrals"),
  },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.referralId);

    if (!referral) {
      throw new Error("Referral not found");
    }

    if (referral.rewardGranted) {
      return { success: true, alreadyGranted: true };
    }

    const referrer = await ctx.runQuery(api.auth.getUser, { userId: referral.referrerId });

    if (!referrer) {
      throw new Error("Referrer not found");
    }

    if (!referrer.stripeCustomerId) {
      console.log(`[REFERRAL] Referrer ${referrer.email} has no Stripe customer ID yet, skipping reward`);
      return { success: false, error: "Referrer has no Stripe customer" };
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error("Stripe not configured");
    }

    try {
      // Create Stripe coupon for 1 month free (100% off for 1 month)
      const couponResponse = await fetch("https://api.stripe.com/v1/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${apiKey}`,
        },
        body: new URLSearchParams({
          percent_off: "100",
          duration: "once", // One-time discount
          name: `Referral Reward - ${referral.referralCode}`,
          metadata_referral_id: args.referralId,
        }).toString(),
      });

      if (!couponResponse.ok) {
        const errorText = await couponResponse.text();
        throw new Error(`Failed to create coupon: ${errorText}`);
      }

      const coupon = await couponResponse.json();

      // Apply coupon to customer's subscription
      if (referrer.stripeSubscriptionId) {
        const subscriptionResponse = await fetch(
          `https://api.stripe.com/v1/subscriptions/${referrer.stripeSubscriptionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${apiKey}`,
            },
            body: new URLSearchParams({
              coupon: coupon.id,
            }).toString(),
          }
        );

        if (!subscriptionResponse.ok) {
          const errorText = await subscriptionResponse.text();
          throw new Error(`Failed to apply coupon: ${errorText}`);
        }
      }

      // Mark reward as granted
      await ctx.runMutation(api.referrals.markRewardGranted, {
        referralId: args.referralId,
        stripeCouponId: coupon.id,
      });

      console.log(`[REFERRAL] ✅ Granted 1 month free to ${referrer.email} for referring user ${referral.referredId}`);

      return {
        success: true,
        couponId: coupon.id,
        referrerEmail: referrer.email,
      };
    } catch (error) {
      console.error("[REFERRAL] Error granting reward:", error);
      throw error;
    }
  },
});

/**
 * Internal mutation to mark reward as granted
 */
export const markRewardGranted = mutation({
  args: {
    referralId: v.id("referrals"),
    stripeCouponId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.referralId, {
      status: "rewarded",
      rewardGranted: true,
      rewardGrantedAt: Date.now(),
      rewardType: "1_month_free",
      stripeCouponId: args.stripeCouponId,
    });

    return { success: true };
  },
});

/**
 * Get user's referral stats (how many people they've referred)
 */
export const getReferralStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", args.userId))
      .collect();

    const pending = referrals.filter((r) => r.status === "pending").length;
    const converted = referrals.filter((r) => r.status === "converted" || r.status === "rewarded").length;
    const rewarded = referrals.filter((r) => r.status === "rewarded").length;

    return {
      total: referrals.length,
      pending,
      converted,
      rewarded,
      referrals: referrals.map((r) => ({
        id: r._id,
        status: r.status,
        createdAt: r.createdAt,
        convertedAt: r.convertedAt,
        rewardGranted: r.rewardGranted,
      })),
    };
  },
});

/**
 * Get top referrers leaderboard for admin dashboard
 * Returns users with most successful referrals
 */
export const getTopReferrers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get all referrals
    const allReferrals = await ctx.db.query("referrals").collect();

    // Group by referrer and count conversions
    const referrerStats: Record<string, { total: number; converted: number; rewarded: number }> = {};

    for (const referral of allReferrals) {
      const referrerId = referral.referrerId.toString();

      if (!referrerStats[referrerId]) {
        referrerStats[referrerId] = { total: 0, converted: 0, rewarded: 0 };
      }

      referrerStats[referrerId].total++;

      if (referral.status === "converted" || referral.status === "rewarded") {
        referrerStats[referrerId].converted++;
      }

      if (referral.status === "rewarded") {
        referrerStats[referrerId].rewarded++;
      }
    }

    // Get user info for top referrers
    const leaderboard = await Promise.all(
      Object.entries(referrerStats).map(async ([referrerId, stats]) => {
        const user = await ctx.db.get(referrerId as any);
        return {
          userId: referrerId,
          email: user?.email,
          name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown",
          referralCode: user?.referralCode,
          ...stats,
        };
      })
    );

    // Sort by converted (most successful referrers first)
    leaderboard.sort((a, b) => b.converted - a.converted);

    return leaderboard.slice(0, limit);
  },
});
