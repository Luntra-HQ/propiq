/**
 * Production Monitoring Queries for PropIQ
 * Health checks and metrics for system monitoring
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * System Health Check
 * Returns overall system status and key health metrics
 */
export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    try {
      // Check database connectivity by counting users
      const totalUsers = await ctx.db.query("users").collect();
      const userCount = totalUsers.length;

      // Check recent signups (last 24 hours)
      const recentSignups = totalUsers.filter((u) => u.createdAt >= last24Hours);

      // Check recent analyses
      const recentAnalyses = await ctx.db
        .query("propertyAnalyses")
        .filter((q) => q.gte(q.field("createdAt"), last24Hours))
        .collect();

      // Check email logs
      const recentEmails = await ctx.db
        .query("emailLogs")
        .filter((q) => q.gte(q.field("sentAt"), last24Hours))
        .collect();

      // Check referrals
      const totalReferrals = await ctx.db.query("referrals").collect();
      const recentReferrals = totalReferrals.filter((r) => r.createdAt >= last24Hours);

      // Check subscriptions
      const paidUsers = totalUsers.filter((u) => u.subscriptionTier !== "free");

      return {
        status: "healthy",
        timestamp: now,
        checks: {
          database: {
            status: "healthy",
            totalUsers: userCount,
            paidUsers: paidUsers.length,
          },
          signups: {
            last24Hours: recentSignups.length,
            status: recentSignups.length > 0 || userCount < 10 ? "healthy" : "warning",
          },
          analyses: {
            last24Hours: recentAnalyses.length,
            status: "healthy",
          },
          emails: {
            last24Hours: recentEmails.length,
            status: "healthy",
          },
          referrals: {
            total: totalReferrals.length,
            last24Hours: recentReferrals.length,
            status: "healthy",
          },
        },
      };
    } catch (error) {
      console.error("[MONITORING] Health check failed:", error);
      return {
        status: "unhealthy",
        timestamp: now,
        error: String(error),
        checks: {},
      };
    }
  },
});

/**
 * Daily Metrics
 * Returns key metrics for the current day
 */
export const getDailyMetrics = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);

    // Signups today
    const signupsToday = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("createdAt"), startOfDay))
      .collect();

    // Analyses today
    const analysesToday = await ctx.db
      .query("propertyAnalyses")
      .filter((q) => q.gte(q.field("createdAt"), startOfDay))
      .collect();

    // Emails sent today
    const emailsToday = await ctx.db
      .query("emailLogs")
      .filter((q) => q.gte(q.field("sentAt"), startOfDay))
      .collect();

    // Active users today (anyone who ran an analysis)
    const activeUserIds = new Set(analysesToday.map((a) => a.userId));

    return {
      date: new Date().toISOString().split("T")[0],
      metrics: {
        signups: signupsToday.length,
        analyses: analysesToday.length,
        emails: emailsToday.length,
        activeUsers: activeUserIds.size,
      },
    };
  },
});

/**
 * Email Queue Health
 * Returns status of email sending
 */
export const getEmailQueueHealth = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const lastHour = now - 60 * 60 * 1000;

    // Get recent email logs
    const recentEmails = await ctx.db
      .query("emailLogs")
      .filter((q) => q.gte(q.field("sentAt"), last24Hours))
      .collect();

    const emailsLastHour = recentEmails.filter((e) => e.sentAt >= lastHour);

    // Count by type
    const byType: Record<string, number> = {};
    recentEmails.forEach((e) => {
      byType[e.emailType] = (byType[e.emailType] || 0) + 1;
    });

    return {
      status: "healthy",
      last24Hours: recentEmails.length,
      lastHour: emailsLastHour.length,
      byType,
    };
  },
});

/**
 * Subscription Metrics
 * Returns subscription and revenue data
 */
export const getSubscriptionMetrics = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    // Count by tier
    const byTier: Record<string, number> = {
      free: 0,
      starter: 0,
      pro: 0,
      elite: 0,
    };

    allUsers.forEach((u) => {
      const tier = u.subscriptionTier || "free";
      byTier[tier] = (byTier[tier] || 0) + 1;
    });

    // Calculate MRR (based on tier prices)
    const tierPrices: Record<string, number> = {
      free: 0,
      starter: 49,
      pro: 99,
      elite: 199,
    };

    let mrr = 0;
    Object.entries(byTier).forEach(([tier, count]) => {
      mrr += count * (tierPrices[tier] || 0);
    });

    return {
      totalUsers: allUsers.length,
      byTier,
      mrr,
      paidUsers: byTier.starter + byTier.pro + byTier.elite,
    };
  },
});

/**
 * Referral Stats
 * Returns referral program performance
 */
export const getReferralStats = query({
  args: {},
  handler: async (ctx) => {
    const allReferrals = await ctx.db.query("referrals").collect();

    const stats = {
      total: allReferrals.length,
      pending: allReferrals.filter((r) => r.status === "pending").length,
      converted: allReferrals.filter((r) => r.status === "converted").length,
      rewarded: allReferrals.filter((r) => r.rewardGranted).length,
      conversionRate:
        allReferrals.length > 0
          ? (allReferrals.filter((r) => r.status === "converted").length / allReferrals.length) * 100
          : 0,
    };

    return stats;
  },
});

/**
 * Cron Job Status
 * Returns status of scheduled jobs (requires manual checking)
 */
export const getCronJobStatus = query({
  args: {},
  handler: async (ctx) => {
    // Note: Convex doesn't expose cron job execution logs via queries
    // This returns a helpful message for checking manually
    return {
      note: "Check Convex dashboard → Scheduled Functions for cron job status",
      jobs: {
        "check-inactive-users": {
          schedule: "Weekly on Monday at 14:00 UTC (9 AM EST)",
          checkIn: "Convex Dashboard → Functions → Scheduled",
        },
      },
    };
  },
});
