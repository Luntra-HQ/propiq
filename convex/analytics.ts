/**
 * Revenue analytics for PropIQ
 * MRR tracking and subscription metrics
 */

import { query } from "./_generated/server";

// Subscription tier pricing
const TIER_PRICING = {
  free: 0,
  starter: 49,
  pro: 99,
  elite: 199,
};

/**
 * Calculate current MRR from all active subscriptions
 * Returns total monthly recurring revenue
 */
export const getMRR = query({
  args: {},
  handler: async (ctx) => {
    // Get all active paid users
    const users = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("active"), true),
          q.or(
            q.eq(q.field("subscriptionStatus"), "active"),
            q.eq(q.field("subscriptionStatus"), "trialing")
          )
        )
      )
      .collect();

    let totalMRR = 0;

    for (const user of users) {
      const tier = user.subscriptionTier as keyof typeof TIER_PRICING;
      const price = TIER_PRICING[tier] || 0;
      totalMRR += price;
    }

    return {
      totalMRR,
      currency: "USD",
      activeSubscribers: users.filter((u) => u.subscriptionTier !== "free").length,
      timestamp: Date.now(),
    };
  },
});

/**
 * Get MRR breakdown by tier
 * Shows revenue distribution across subscription tiers
 */
export const getMRRByTier = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("active"), true),
          q.or(
            q.eq(q.field("subscriptionStatus"), "active"),
            q.eq(q.field("subscriptionStatus"), "trialing")
          )
        )
      )
      .collect();

    const mrrByTier = {
      starter: 0,
      pro: 0,
      elite: 0,
      total: 0,
    };

    const countByTier = {
      starter: 0,
      pro: 0,
      elite: 0,
      free: 0,
    };

    for (const user of users) {
      const tier = user.subscriptionTier as keyof typeof TIER_PRICING;
      const price = TIER_PRICING[tier] || 0;

      if (tier !== "free") {
        mrrByTier[tier as keyof Omit<typeof mrrByTier, "total">] += price;
        mrrByTier.total += price;
        countByTier[tier as keyof typeof countByTier] += 1;
      } else {
        countByTier.free += 1;
      }
    }

    return {
      mrr: mrrByTier,
      subscribers: countByTier,
      timestamp: Date.now(),
    };
  },
});

/**
 * Get active subscription counts per tier
 * Shows distribution of customers across tiers
 */
export const getSubscriptionCounts = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").filter((q) => q.eq(q.field("active"), true)).collect();

    const counts = {
      free: 0,
      starter: 0,
      pro: 0,
      elite: 0,
      total: users.length,
    };

    for (const user of users) {
      const tier = user.subscriptionTier as keyof typeof counts;
      if (tier in counts) {
        counts[tier] += 1;
      }
    }

    return {
      counts,
      activePaid: counts.starter + counts.pro + counts.elite,
      timestamp: Date.now(),
    };
  },
});

/**
 * Calculate trial to paid conversion rate
 * Shows percentage of users who convert from free to paid
 */
export const getTrialConversionRate = query({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Get all signups in the last 30 days
    const recentSignups = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    const totalSignups = recentSignups.length;

    // Count how many converted to paid
    const conversions = recentSignups.filter(
      (user) =>
        user.subscriptionTier !== "free" &&
        (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing")
    ).length;

    const conversionRate = totalSignups > 0 ? (conversions / totalSignups) * 100 : 0;

    return {
      totalSignups,
      conversions,
      conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
      periodDays: 30,
      timestamp: Date.now(),
    };
  },
});

/**
 * Get comprehensive revenue dashboard data
 * All key metrics in one query for admin dashboard
 */
export const getRevenueDashboard = query({
  args: {},
  handler: async (ctx) => {
    // Get all active users
    const activeUsers = await ctx.db.query("users").filter((q) => q.eq(q.field("active"), true)).collect();

    // Calculate MRR
    let totalMRR = 0;
    const mrrByTier = { starter: 0, pro: 0, elite: 0 };
    const countByTier = { free: 0, starter: 0, pro: 0, elite: 0 };

    for (const user of activeUsers) {
      const tier = user.subscriptionTier as keyof typeof TIER_PRICING;
      const price = TIER_PRICING[tier] || 0;

      if (tier !== "free") {
        totalMRR += price;
        mrrByTier[tier as keyof typeof mrrByTier] += price;
      }

      if (tier in countByTier) {
        countByTier[tier as keyof typeof countByTier] += 1;
      }
    }

    // Calculate trial conversion (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentSignups = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    const conversions = recentSignups.filter(
      (user) =>
        user.subscriptionTier !== "free" &&
        (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing")
    ).length;

    const conversionRate = recentSignups.length > 0 ? (conversions / recentSignups.length) * 100 : 0;

    // Calculate churn (users who cancelled in last 30 days)
    const recentCancellations = await ctx.db
      .query("cancellations")
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    const churnedMRR = recentCancellations.reduce((sum, c) => sum + c.mrr, 0);

    return {
      mrr: {
        total: totalMRR,
        byTier: mrrByTier,
        currency: "USD",
      },
      subscribers: {
        total: activeUsers.length,
        byTier: countByTier,
        activePaid: countByTier.starter + countByTier.pro + countByTier.elite,
      },
      conversion: {
        rate: Math.round(conversionRate * 10) / 10,
        conversions,
        signups: recentSignups.length,
        periodDays: 30,
      },
      churn: {
        count: recentCancellations.length,
        mrrLost: churnedMRR,
        periodDays: 30,
      },
      timestamp: Date.now(),
    };
  },
});

/**
 * Get average revenue per user (ARPU)
 * Shows average MRR per paying customer
 */
export const getARPU = query({
  args: {},
  handler: async (ctx) => {
    const paidUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("active"), true),
          q.neq(q.field("subscriptionTier"), "free"),
          q.or(
            q.eq(q.field("subscriptionStatus"), "active"),
            q.eq(q.field("subscriptionStatus"), "trialing")
          )
        )
      )
      .collect();

    let totalMRR = 0;

    for (const user of paidUsers) {
      const tier = user.subscriptionTier as keyof typeof TIER_PRICING;
      const price = TIER_PRICING[tier] || 0;
      totalMRR += price;
    }

    const arpu = paidUsers.length > 0 ? totalMRR / paidUsers.length : 0;

    return {
      arpu: Math.round(arpu * 100) / 100, // Round to 2 decimals
      totalMRR,
      paidUsers: paidUsers.length,
      timestamp: Date.now(),
    };
  },
});
