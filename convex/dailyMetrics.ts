/**
 * Daily Metrics Collection for Business Intelligence Dashboard
 *
 * This Convex function aggregates key metrics for the daily intelligence report
 * Called by: vibe-marketing/daily_intelligence_enhanced.py
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get comprehensive daily metrics for business intelligence
 *
 * Returns metrics for:
 * - User signups (last 24h and total)
 * - Property analyses (last 24h and total)
 * - Support conversations
 * - User engagement patterns
 *
 * @returns {Object} Comprehensive metrics object
 */
export const getDailyMetrics = query({
  args: {
    hoursAgo: v.optional(v.number()), // Default: 24 hours
  },
  handler: async (ctx, args) => {
    const hoursAgo = args.hoursAgo || 24;
    const cutoffTime = Date.now() - (hoursAgo * 60 * 60 * 1000);

    try {
      // USER METRICS
      const allUsers = await ctx.db.query("users").collect();
      const recentUsers = allUsers.filter(user =>
        user._creationTime >= cutoffTime
      );

      const totalUsers = allUsers.length;
      const newUsers = recentUsers.length;

      // Calculate user subscription tiers
      const subscriptionBreakdown = allUsers.reduce((acc, user) => {
        const tier = user.subscriptionTier || 'free';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // PROPERTY ANALYSIS METRICS
      const allAnalyses = await ctx.db.query("propertyAnalyses").collect();
      const recentAnalyses = allAnalyses.filter(analysis =>
        analysis._creationTime >= cutoffTime
      );

      const totalAnalyses = allAnalyses.length;
      const analyses24h = recentAnalyses.length;

      // Calculate average analyses per user
      const avgAnalysesPerUser = totalUsers > 0
        ? (totalAnalyses / totalUsers).toFixed(2)
        : "0";

      // SUPPORT CHAT METRICS
      let supportChats24h = 0;
      let totalSupportChats = 0;

      try {
        const allChats = await ctx.db.query("supportChats").collect();
        totalSupportChats = allChats.length;
        supportChats24h = allChats.filter(chat =>
          chat._creationTime >= cutoffTime
        ).length;
      } catch (error) {
        // Support chats table might not exist yet
        console.log("Support chats table not found (this is okay for new deployments)");
      }

      // ENGAGEMENT METRICS
      // Users who analyzed at least one property in the last 24h
      const activeUserIds = new Set(
        recentAnalyses.map(a => a.userId)
      );
      const activeUsers24h = activeUserIds.size;

      // Calculate engagement rate
      const engagementRate = totalUsers > 0
        ? ((activeUsers24h / totalUsers) * 100).toFixed(1)
        : "0";

      // TRIAL USAGE TRACKING
      const trialUsers = allUsers.filter(user =>
        !user.subscriptionTier || user.subscriptionTier === 'free'
      );
      const trialUsersNearLimit = trialUsers.filter(user =>
        user.analysesUsed >= 2 // 2 out of 3 free trials used
      ).length;

      // RECENT ACTIVITY SUMMARY
      const recentActivityByUser = recentAnalyses.reduce((acc, analysis) => {
        const userId = analysis.userId;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const powerUsers = Object.entries(recentActivityByUser)
        .filter(([_, count]) => count >= 5)
        .length;

      return {
        success: true,
        timestamp: new Date().toISOString(),
        period: `Last ${hoursAgo} hours`,

        users: {
          total: totalUsers,
          new_24h: newUsers,
          active_24h: activeUsers24h,
          engagement_rate: `${engagementRate}%`,
          subscription_breakdown: subscriptionBreakdown,
          trial_users: trialUsers.length,
          trial_users_near_limit: trialUsersNearLimit,
        },

        analyses: {
          total: totalAnalyses,
          last_24h: analyses24h,
          avg_per_user: avgAnalysesPerUser,
          power_users_24h: powerUsers, // Users with 5+ analyses
        },

        support: {
          total_conversations: totalSupportChats,
          conversations_24h: supportChats24h,
        },

        insights: {
          // Quick insights for the AI to analyze
          growth_signals: {
            signup_velocity: newUsers >= 5 ? "high" : newUsers >= 2 ? "moderate" : "low",
            analysis_volume: analyses24h >= 50 ? "high" : analyses24h >= 20 ? "moderate" : "low",
            engagement: parseFloat(engagementRate) >= 30 ? "excellent" :
                       parseFloat(engagementRate) >= 15 ? "good" :
                       parseFloat(engagementRate) >= 5 ? "fair" : "low",
          },

          conversion_opportunities: {
            trial_users_ready_to_convert: trialUsersNearLimit,
            power_users_to_nurture: powerUsers,
          }
        }
      };

    } catch (error) {
      console.error("Error fetching daily metrics:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  },
});

/**
 * Get week-over-week comparison metrics
 * Useful for trend analysis in the daily report
 */
export const getWeeklyComparison = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);

    try {
      // Get all users
      const allUsers = await ctx.db.query("users").collect();

      // This week's new users
      const thisWeekUsers = allUsers.filter(u =>
        u._creationTime >= oneWeekAgo && u._creationTime < now
      ).length;

      // Last week's new users
      const lastWeekUsers = allUsers.filter(u =>
        u._creationTime >= twoWeeksAgo && u._creationTime < oneWeekAgo
      ).length;

      // Calculate growth rate
      const weekOverWeekGrowth = lastWeekUsers > 0
        ? (((thisWeekUsers - lastWeekUsers) / lastWeekUsers) * 100).toFixed(1)
        : "N/A";

      // Get all analyses
      const allAnalyses = await ctx.db.query("propertyAnalyses").collect();

      const thisWeekAnalyses = allAnalyses.filter(a =>
        a._creationTime >= oneWeekAgo && a._creationTime < now
      ).length;

      const lastWeekAnalyses = allAnalyses.filter(a =>
        a._creationTime >= twoWeeksAgo && a._creationTime < oneWeekAgo
      ).length;

      const analysisGrowth = lastWeekAnalyses > 0
        ? (((thisWeekAnalyses - lastWeekAnalyses) / lastWeekAnalyses) * 100).toFixed(1)
        : "N/A";

      return {
        success: true,
        users: {
          this_week: thisWeekUsers,
          last_week: lastWeekUsers,
          growth_rate: `${weekOverWeekGrowth}%`,
        },
        analyses: {
          this_week: thisWeekAnalyses,
          last_week: lastWeekAnalyses,
          growth_rate: `${analysisGrowth}%`,
        },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Get revenue insights from user data
 * (Note: Actual revenue comes from Stripe, but this provides user-based estimates)
 */
export const getRevenueEstimates = query({
  args: {},
  handler: async (ctx) => {
    try {
      const allUsers = await ctx.db.query("users").collect();

      const pricingTiers = {
        free: 0,
        starter: 29,
        pro: 79,
        elite: 199,
      };

      const estimatedMRR = allUsers.reduce((total, user) => {
        const tier = user.subscriptionTier || 'free';
        const price = pricingTiers[tier as keyof typeof pricingTiers] || 0;
        return total + price;
      }, 0);

      const paidUsers = allUsers.filter(user =>
        user.subscriptionTier && user.subscriptionTier !== 'free'
      ).length;

      const conversionRate = allUsers.length > 0
        ? ((paidUsers / allUsers.length) * 100).toFixed(1)
        : "0";

      return {
        success: true,
        estimated_mrr: estimatedMRR,
        paid_users: paidUsers,
        free_users: allUsers.length - paidUsers,
        conversion_rate: `${conversionRate}%`,
        note: "Use Stripe API for actual revenue data",
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
