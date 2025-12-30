/**
 * User data export functions for PropIQ
 * Export user data for marketing and analytics
 */

import { query } from "./_generated/server";

/**
 * Export all user data with engagement metrics
 * Designed for CSV export and email marketing segmentation
 */
export const exportAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    // Fetch analysis counts and last analysis date for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        // Get property analyses count and last analysis date
        const analyses = await ctx.db
          .query("propertyAnalyses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const analysisCount = analyses.length;
        const lastAnalysisDate = analyses.length > 0
          ? Math.max(...analyses.map(a => a.createdAt))
          : null;

        // Get session count (login count)
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const loginCount = sessions.length;

        // Get onboarding progress
        const onboarding = await ctx.db
          .query("onboardingProgress")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        // Calculate days since signup
        const daysSinceSignup = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

        // Calculate days since last login
        const daysSinceLastLogin = user.lastLogin
          ? Math.floor((Date.now() - user.lastLogin) / (1000 * 60 * 60 * 24))
          : null;

        // Calculate days since last active
        const daysSinceLastActive = user.lastActiveAt
          ? Math.floor((Date.now() - user.lastActiveAt) / (1000 * 60 * 60 * 24))
          : null;

        // User segmentation
        let userSegment = "ghost"; // Signed up but never used
        if (analysisCount > 0 && daysSinceLastActive !== null && daysSinceLastActive <= 7) {
          userSegment = "active";
        } else if (analysisCount > 0 && daysSinceLastActive !== null && daysSinceLastActive <= 30) {
          userSegment = "warm";
        } else if (analysisCount > 0) {
          userSegment = "cold";
        } else if (loginCount > 1) {
          userSegment = "one-time";
        }

        return {
          // User ID
          userId: user._id,

          // Basic Info
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          company: user.company || "",

          // Subscription Info
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus || "none",
          stripeCustomerId: user.stripeCustomerId || "",

          // Dates (ISO format for CSV)
          signupDate: new Date(user.createdAt).toISOString(),
          lastLoginDate: user.lastLogin ? new Date(user.lastLogin).toISOString() : "",
          lastActiveDate: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : "",
          lastAnalysisDate: lastAnalysisDate ? new Date(lastAnalysisDate).toISOString() : "",

          // Engagement Metrics
          loginCount,
          analysisCount,
          analysesUsed: user.analysesUsed,
          analysesLimit: user.analysesLimit,
          analysesRemaining: user.analysesLimit - user.analysesUsed,

          // Time-based Metrics
          daysSinceSignup,
          daysSinceLastLogin,
          daysSinceLastActive,

          // Onboarding Progress
          analyzedFirstProperty: onboarding?.analyzedFirstProperty || false,
          completedProductTour: onboarding?.completedProductTour || false,
          checklistDismissed: onboarding?.checklistDismissed || false,

          // Segmentation
          userSegment,

          // Account Status
          active: user.active,
          emailVerified: user.emailVerified,

          // Referral Info
          referralCode: user.referralCode || "",
          referredBy: user.referredBy || "",
        };
      })
    );

    return {
      users: enrichedUsers,
      totalCount: enrichedUsers.length,
      exportedAt: new Date().toISOString(),
    };
  },
});

/**
 * Export users by segment for targeted outreach
 * Segments: ghost, one-time, cold, warm, active
 */
export const exportUsersBySegment = query({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    // Fetch analysis counts and last analysis date for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        // Get property analyses count and last analysis date
        const analyses = await ctx.db
          .query("propertyAnalyses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const analysisCount = analyses.length;
        const lastAnalysisDate = analyses.length > 0
          ? Math.max(...analyses.map(a => a.createdAt))
          : null;

        // Get session count (login count)
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const loginCount = sessions.length;

        // Get onboarding progress
        const onboarding = await ctx.db
          .query("onboardingProgress")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        // Calculate days since signup
        const daysSinceSignup = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

        // Calculate days since last login
        const daysSinceLastLogin = user.lastLogin
          ? Math.floor((Date.now() - user.lastLogin) / (1000 * 60 * 60 * 24))
          : null;

        // Calculate days since last active
        const daysSinceLastActive = user.lastActiveAt
          ? Math.floor((Date.now() - user.lastActiveAt) / (1000 * 60 * 60 * 24))
          : null;

        // User segmentation
        let userSegment = "ghost"; // Signed up but never used
        if (analysisCount > 0 && daysSinceLastActive !== null && daysSinceLastActive <= 7) {
          userSegment = "active";
        } else if (analysisCount > 0 && daysSinceLastActive !== null && daysSinceLastActive <= 30) {
          userSegment = "warm";
        } else if (analysisCount > 0) {
          userSegment = "cold";
        } else if (loginCount > 1) {
          userSegment = "one-time";
        }

        return {
          // User ID
          userId: user._id,

          // Basic Info
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          company: user.company || "",

          // Subscription Info
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus || "none",
          stripeCustomerId: user.stripeCustomerId || "",

          // Dates (ISO format for CSV)
          signupDate: new Date(user.createdAt).toISOString(),
          lastLoginDate: user.lastLogin ? new Date(user.lastLogin).toISOString() : "",
          lastActiveDate: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : "",
          lastAnalysisDate: lastAnalysisDate ? new Date(lastAnalysisDate).toISOString() : "",

          // Engagement Metrics
          loginCount,
          analysisCount,
          analysesUsed: user.analysesUsed,
          analysesLimit: user.analysesLimit,
          analysesRemaining: user.analysesLimit - user.analysesUsed,

          // Time-based Metrics
          daysSinceSignup,
          daysSinceLastLogin,
          daysSinceLastActive,

          // Onboarding Progress
          analyzedFirstProperty: onboarding?.analyzedFirstProperty || false,
          completedProductTour: onboarding?.completedProductTour || false,
          checklistDismissed: onboarding?.checklistDismissed || false,

          // Segmentation
          userSegment,

          // Account Status
          active: user.active,
          emailVerified: user.emailVerified,

          // Referral Info
          referralCode: user.referralCode || "",
          referredBy: user.referredBy || "",
        };
      })
    );

    // Group users by segment
    const segments = {
      ghost: enrichedUsers.filter(u => u.userSegment === "ghost"),
      oneTime: enrichedUsers.filter(u => u.userSegment === "one-time"),
      cold: enrichedUsers.filter(u => u.userSegment === "cold"),
      warm: enrichedUsers.filter(u => u.userSegment === "warm"),
      active: enrichedUsers.filter(u => u.userSegment === "active"),
    };

    return {
      segments: {
        ghost: {
          count: segments.ghost.length,
          users: segments.ghost,
        },
        oneTime: {
          count: segments.oneTime.length,
          users: segments.oneTime,
        },
        cold: {
          count: segments.cold.length,
          users: segments.cold,
        },
        warm: {
          count: segments.warm.length,
          users: segments.warm,
        },
        active: {
          count: segments.active.length,
          users: segments.active,
        },
      },
      totalUsers: enrichedUsers.length,
      exportedAt: new Date().toISOString(),
    };
  },
});

/**
 * Export free tier users who haven't converted
 * Perfect for email outreach to convert trial users to paid
 */
export const exportFreeTrialUsers = query({
  args: {},
  handler: async (ctx) => {
    // Get free tier users
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("subscriptionTier"), "free"))
      .collect();

    // Fetch analysis counts and last analysis date for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        // Get property analyses count and last analysis date
        const analyses = await ctx.db
          .query("propertyAnalyses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const analysisCount = analyses.length;
        const lastAnalysisDate = analyses.length > 0
          ? Math.max(...analyses.map(a => a.createdAt))
          : null;

        // Get session count (login count)
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const loginCount = sessions.length;

        // Get onboarding progress
        const onboarding = await ctx.db
          .query("onboardingProgress")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        // Calculate days since signup
        const daysSinceSignup = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

        // Calculate days since last login
        const daysSinceLastLogin = user.lastLogin
          ? Math.floor((Date.now() - user.lastLogin) / (1000 * 60 * 60 * 24))
          : null;

        // Calculate days since last active
        const daysSinceLastActive = user.lastActiveAt
          ? Math.floor((Date.now() - user.lastActiveAt) / (1000 * 60 * 60 * 24))
          : null;

        // User segmentation
        let userSegment = "ghost"; // Signed up but never used
        if (analysisCount > 0 && daysSinceLastActive !== null && daysSinceLastActive <= 7) {
          userSegment = "active";
        } else if (analysisCount > 0 && daysSinceLastActive !== null && daysSinceLastActive <= 30) {
          userSegment = "warm";
        } else if (analysisCount > 0) {
          userSegment = "cold";
        } else if (loginCount > 1) {
          userSegment = "one-time";
        }

        return {
          // User ID
          userId: user._id,

          // Basic Info
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          company: user.company || "",

          // Subscription Info
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus || "none",
          stripeCustomerId: user.stripeCustomerId || "",

          // Dates (ISO format for CSV)
          signupDate: new Date(user.createdAt).toISOString(),
          lastLoginDate: user.lastLogin ? new Date(user.lastLogin).toISOString() : "",
          lastActiveDate: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : "",
          lastAnalysisDate: lastAnalysisDate ? new Date(lastAnalysisDate).toISOString() : "",

          // Engagement Metrics
          loginCount,
          analysisCount,
          analysesUsed: user.analysesUsed,
          analysesLimit: user.analysesLimit,
          analysesRemaining: user.analysesLimit - user.analysesUsed,

          // Time-based Metrics
          daysSinceSignup,
          daysSinceLastLogin,
          daysSinceLastActive,

          // Onboarding Progress
          analyzedFirstProperty: onboarding?.analyzedFirstProperty || false,
          completedProductTour: onboarding?.completedProductTour || false,
          checklistDismissed: onboarding?.checklistDismissed || false,

          // Segmentation
          userSegment,

          // Account Status
          active: user.active,
          emailVerified: user.emailVerified,

          // Referral Info
          referralCode: user.referralCode || "",
          referredBy: user.referredBy || "",
        };
      })
    );

    return {
      users: enrichedUsers,
      totalCount: enrichedUsers.length,
      segmentBreakdown: {
        ghost: enrichedUsers.filter(u => u.userSegment === "ghost").length,
        oneTime: enrichedUsers.filter(u => u.userSegment === "one-time").length,
        cold: enrichedUsers.filter(u => u.userSegment === "cold").length,
        warm: enrichedUsers.filter(u => u.userSegment === "warm").length,
        active: enrichedUsers.filter(u => u.userSegment === "active").length,
      },
      exportedAt: new Date().toISOString(),
    };
  },
});
