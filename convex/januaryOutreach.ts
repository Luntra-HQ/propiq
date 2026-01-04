/**
 * January 2026 User Segmentation for Outreach
 * Custom queries to segment 123 users by behavior for targeted email campaigns
 */

import { query } from "./_generated/server";

/**
 * SEGMENT 1: Upgrade Intent (Highest Priority)
 * Users who showed intent to upgrade but didn't complete payment
 *
 * Indicators:
 * - Have Stripe customer ID (started checkout) but still on free tier
 * - Used 3/3 analyses (hit free tier limit)
 * - Logged in multiple times but didn't upgrade
 */
export const getUpgradeIntentUsers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    // Get analysis counts for each user
    const usersWithIntent = await Promise.all(
      allUsers.map(async (user) => {
        const analyses = await ctx.db
          .query("propertyAnalyses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const analysisCount = analyses.length;
        const loginCount = sessions.length;
        const lastAnalysisDate = analyses.length > 0
          ? Math.max(...analyses.map(a => a.createdAt))
          : null;

        // Calculate upgrade intent score
        let intentScore = 0;
        let intentReasons: string[] = [];

        // Has Stripe customer ID but didn't convert (40 points)
        if (user.stripeCustomerId && user.subscriptionTier === "free") {
          intentScore += 40;
          intentReasons.push("Started checkout but didn't complete");
        }

        // Hit free tier limit (30 points)
        if (user.analysesUsed >= user.analysesLimit && analysisCount > 0) {
          intentScore += 30;
          intentReasons.push("Used all free analyses");
        }

        // Multiple logins but no upgrade (20 points)
        if (loginCount >= 3 && user.subscriptionTier === "free" && analysisCount > 0) {
          intentScore += 20;
          intentReasons.push("Multiple sessions, engaged but didn't upgrade");
        }

        // Ran 2-3 analyses (10 points)
        if (analysisCount >= 2 && user.subscriptionTier === "free") {
          intentScore += 10;
          intentReasons.push("Actively used product");
        }

        return {
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          company: user.company || "",
          signupDate: new Date(user.createdAt).toISOString(),
          lastLoginDate: user.lastLogin ? new Date(user.lastLogin).toISOString() : "",
          lastAnalysisDate: lastAnalysisDate ? new Date(lastAnalysisDate).toISOString() : "",
          analysisCount,
          analysesUsed: user.analysesUsed,
          analysesLimit: user.analysesLimit,
          loginCount,
          intentScore,
          intentReasons: intentReasons.join(", "),
          stripeCustomerId: user.stripeCustomerId || "",
          subscriptionTier: user.subscriptionTier,
        };
      })
    );

    // Filter only users with intent score > 0
    const highIntentUsers = usersWithIntent
      .filter(u => u.intentScore > 0)
      .sort((a, b) => b.intentScore - a.intentScore);

    return {
      segment: "Upgrade Intent",
      count: highIntentUsers.length,
      users: highIntentUsers,
      exportedAt: new Date().toISOString(),
    };
  },
});

/**
 * SEGMENT 2: Signed Up, Never Used Product
 * Users who created account but never ran a property analysis
 *
 * Criteria:
 * - Zero property analyses
 * - May have logged in
 */
export const getSignedUpNeverUsed = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    const ghostUsers = await Promise.all(
      allUsers.map(async (user) => {
        const analyses = await ctx.db
          .query("propertyAnalyses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const analysisCount = analyses.length;
        const loginCount = sessions.length;
        const daysSinceSignup = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

        return {
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          company: user.company || "",
          signupDate: new Date(user.createdAt).toISOString(),
          lastLoginDate: user.lastLogin ? new Date(user.lastLogin).toISOString() : "",
          daysSinceSignup,
          loginCount,
          analysisCount,
          emailVerified: user.emailVerified,
        };
      })
    );

    // Filter users with 0 analyses
    const neverUsedUsers = ghostUsers.filter(u => u.analysisCount === 0);

    return {
      segment: "Signed Up, Never Used",
      count: neverUsedUsers.length,
      users: neverUsedUsers,
      exportedAt: new Date().toISOString(),
    };
  },
});

/**
 * SEGMENT 3: Used Product, Didn't Upgrade
 * Users who ran at least 1 analysis but are still on free tier
 *
 * Criteria:
 * - 1+ property analyses
 * - subscriptionTier = "free"
 */
export const getUsedProductDidntUpgrade = query({
  args: {},
  handler: async (ctx) => {
    const freeUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("subscriptionTier"), "free"))
      .collect();

    const usersWhoUsedProduct = await Promise.all(
      freeUsers.map(async (user) => {
        const analyses = await ctx.db
          .query("propertyAnalyses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const analysisCount = analyses.length;
        const lastAnalysisDate = analyses.length > 0
          ? Math.max(...analyses.map(a => a.createdAt))
          : null;

        const daysSinceSignup = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
        const daysSinceLastAnalysis = lastAnalysisDate
          ? Math.floor((Date.now() - lastAnalysisDate) / (1000 * 60 * 60 * 24))
          : null;

        return {
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          company: user.company || "",
          signupDate: new Date(user.createdAt).toISOString(),
          lastAnalysisDate: lastAnalysisDate ? new Date(lastAnalysisDate).toISOString() : "",
          daysSinceSignup,
          daysSinceLastAnalysis,
          analysisCount,
          analysesUsed: user.analysesUsed,
          analysesRemaining: user.analysesLimit - user.analysesUsed,
          loginCount: sessions.length,
          subscriptionTier: user.subscriptionTier,
        };
      })
    );

    // Filter users with 1+ analyses
    const usedButFree = usersWhoUsedProduct.filter(u => u.analysisCount >= 1);

    return {
      segment: "Used Product, Didn't Upgrade",
      count: usedButFree.length,
      users: usedButFree,
      exportedAt: new Date().toISOString(),
    };
  },
});

/**
 * SEGMENT 4: Active Users (2+ Analyses)
 * Users who ran multiple analyses (power users)
 *
 * Criteria:
 * - 2+ property analyses
 */
export const getActiveUsers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    const activeUsers = await Promise.all(
      allUsers.map(async (user) => {
        const analyses = await ctx.db
          .query("propertyAnalyses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const analysisCount = analyses.length;
        const lastAnalysisDate = analyses.length > 0
          ? Math.max(...analyses.map(a => a.createdAt))
          : null;

        const daysSinceLastAnalysis = lastAnalysisDate
          ? Math.floor((Date.now() - lastAnalysisDate) / (1000 * 60 * 60 * 24))
          : null;

        return {
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          company: user.company || "",
          signupDate: new Date(user.createdAt).toISOString(),
          lastAnalysisDate: lastAnalysisDate ? new Date(lastAnalysisDate).toISOString() : "",
          analysisCount,
          totalAnalyses: analysisCount,
          analysesUsed: user.analysesUsed,
          analysesRemaining: user.analysesLimit - user.analysesUsed,
          daysSinceLastAnalysis,
          loginCount: sessions.length,
          subscriptionTier: user.subscriptionTier,
        };
      })
    );

    // Filter users with 2+ analyses
    const powerUsers = activeUsers.filter(u => u.analysisCount >= 2);

    return {
      segment: "Active Users (2+ Analyses)",
      count: powerUsers.length,
      users: powerUsers,
      exportedAt: new Date().toISOString(),
    };
  },
});

/**
 * SEGMENT 5: Recent Signups (Last 14 Days)
 * Fresh users who might still be evaluating
 *
 * Criteria:
 * - Signed up in last 14 days
 */
export const getRecentSignups = query({
  args: {},
  handler: async (ctx) => {
    const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);

    const recentUsers = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("createdAt"), fourteenDaysAgo))
      .collect();

    const enrichedUsers = await Promise.all(
      recentUsers.map(async (user) => {
        const analyses = await ctx.db
          .query("propertyAnalyses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const analysisCount = analyses.length;
        const lastAnalysisDate = analyses.length > 0
          ? Math.max(...analyses.map(a => a.createdAt))
          : null;

        const daysSinceSignup = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

        return {
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          company: user.company || "",
          signupDate: new Date(user.createdAt).toISOString(),
          daysSinceSignup,
          lastAnalysisDate: lastAnalysisDate ? new Date(lastAnalysisDate).toISOString() : "",
          analysisCount,
          analysesUsed: user.analysesUsed,
          analysesRemaining: user.analysesLimit - user.analysesUsed,
          loginCount: sessions.length,
          subscriptionTier: user.subscriptionTier,
          emailVerified: user.emailVerified,
        };
      })
    );

    return {
      segment: "Recent Signups (Last 14 Days)",
      count: enrichedUsers.length,
      users: enrichedUsers,
      exportedAt: new Date().toISOString(),
    };
  },
});

/**
 * ALL SEGMENTS SUMMARY
 * Run all segment queries and return counts + overlaps
 */
export const getAllSegmentsSummary = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;

    // Count each segment
    let upgradeIntentCount = 0;
    let signedUpNeverUsedCount = 0;
    let usedProductCount = 0;
    let activeUsersCount = 0;
    let recentSignupsCount = 0;

    const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);

    for (const user of allUsers) {
      const analyses = await ctx.db
        .query("propertyAnalyses")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const analysisCount = analyses.length;
      const loginCount = sessions.length;

      // Segment 1: Upgrade Intent
      if (
        (user.stripeCustomerId && user.subscriptionTier === "free") ||
        (user.analysesUsed >= user.analysesLimit && analysisCount > 0) ||
        (loginCount >= 3 && user.subscriptionTier === "free" && analysisCount > 0) ||
        (analysisCount >= 2 && user.subscriptionTier === "free")
      ) {
        upgradeIntentCount++;
      }

      // Segment 2: Signed Up, Never Used
      if (analysisCount === 0) {
        signedUpNeverUsedCount++;
      }

      // Segment 3: Used Product, Didn't Upgrade
      if (analysisCount >= 1 && user.subscriptionTier === "free") {
        usedProductCount++;
      }

      // Segment 4: Active Users (2+ analyses)
      if (analysisCount >= 2) {
        activeUsersCount++;
      }

      // Segment 5: Recent Signups (last 14 days)
      if (user.createdAt >= fourteenDaysAgo) {
        recentSignupsCount++;
      }
    }

    return {
      totalUsers,
      segments: {
        upgradeIntent: {
          count: upgradeIntentCount,
          description: "Users who showed intent to upgrade (Stripe ID, hit limits, multiple sessions)",
        },
        signedUpNeverUsed: {
          count: signedUpNeverUsedCount,
          description: "Users who created account but never ran analysis",
        },
        usedProductDidntUpgrade: {
          count: usedProductCount,
          description: "Users who ran 1+ analyses but still on free tier",
        },
        activeUsers: {
          count: activeUsersCount,
          description: "Power users who ran 2+ analyses",
        },
        recentSignups: {
          count: recentSignupsCount,
          description: "Users who signed up in last 14 days",
        },
      },
      exportedAt: new Date().toISOString(),
    };
  },
});
