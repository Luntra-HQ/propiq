/**
 * Cancellation tracking for PropIQ
 * Records and analyzes subscription cancellations
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// MRR pricing by tier
const TIER_MRR = {
  starter: 49,
  pro: 99,
  elite: 199,
  free: 0,
};

/**
 * Record a subscription cancellation
 * Called from the cancelSubscription action in payments.ts
 */
export const recordCancellation = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    reasonText: v.optional(v.string()),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    const mrr = TIER_MRR[args.tier as keyof typeof TIER_MRR] || 0;

    const cancellationId = await ctx.db.insert("cancellations", {
      userId: args.userId,
      reason: args.reason,
      reasonText: args.reasonText,
      tier: args.tier,
      mrr,
      createdAt: Date.now(),
    });

    return { success: true, cancellationId };
  },
});

/**
 * Get cancellation statistics for analytics
 * Returns count and MRR lost by reason
 */
export const getCancellationStats = query({
  args: {},
  handler: async (ctx) => {
    const cancellations = await ctx.db.query("cancellations").collect();

    // Group by reason
    const statsByReason: Record<string, { count: number; mrrLost: number }> = {};

    for (const cancellation of cancellations) {
      if (!statsByReason[cancellation.reason]) {
        statsByReason[cancellation.reason] = { count: 0, mrrLost: 0 };
      }
      statsByReason[cancellation.reason].count++;
      statsByReason[cancellation.reason].mrrLost += cancellation.mrr;
    }

    // Calculate totals
    const totalCancellations = cancellations.length;
    const totalMrrLost = cancellations.reduce((sum, c) => sum + c.mrr, 0);

    return {
      totalCancellations,
      totalMrrLost,
      byReason: statsByReason,
    };
  },
});

/**
 * Get recent cancellations with user details
 * Useful for admin dashboard
 */
export const getRecentCancellations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const cancellations = await ctx.db
      .query("cancellations")
      .order("desc")
      .take(limit);

    // Enrich with user data
    const enriched = await Promise.all(
      cancellations.map(async (cancellation) => {
        const user = await ctx.db.get(cancellation.userId);
        return {
          ...cancellation,
          userEmail: user?.email,
          userName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get cancellations for a specific user
 */
export const getUserCancellations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cancellations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Get cancellation trend over time
 * Returns counts by month for the last N months
 */
export const getCancellationTrend = query({
  args: {
    months: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const months = args.months || 6;
    const now = Date.now();
    const startDate = now - months * 30 * 24 * 60 * 60 * 1000; // Approximate

    const cancellations = await ctx.db
      .query("cancellations")
      .withIndex("by_date")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    // Group by month
    const byMonth: Record<string, { count: number; mrrLost: number }> = {};

    for (const cancellation of cancellations) {
      const date = new Date(cancellation.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { count: 0, mrrLost: 0 };
      }
      byMonth[monthKey].count++;
      byMonth[monthKey].mrrLost += cancellation.mrr;
    }

    return byMonth;
  },
});
