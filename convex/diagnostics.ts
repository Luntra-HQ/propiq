/**
 * Diagnostic queries for investigating Issue #2: Reports not saving
 *
 * These queries help identify:
 * - Total analyses in database
 * - Analyses properly linked to users
 * - Any potential orphaned analyses
 * - User analysis counts vs actual saved analyses
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Check all analyses and their userId associations
 * Run this in Convex dashboard to diagnose report saving issues
 */
export const checkAnalysesIntegrity = query({
  handler: async (ctx) => {
    // Get all analyses
    const allAnalyses = await ctx.db.query("propertyAnalyses").collect();

    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    // Create user ID set for quick lookup
    const userIds = new Set(allUsers.map(u => u._id));

    // Check each analysis
    const orphanedAnalyses = allAnalyses.filter(a => !userIds.has(a.userId));
    const validAnalyses = allAnalyses.filter(a => userIds.has(a.userId));

    // Group analyses by user
    const analysesByUser = new Map<string, number>();
    validAnalyses.forEach(a => {
      const count = analysesByUser.get(a.userId) || 0;
      analysesByUser.set(a.userId, count + 1);
    });

    // Find users with mismatched counts
    const userMismatches = allUsers.map(u => ({
      userId: u._id,
      email: u.email,
      analysesUsed: u.analysesUsed,
      actualAnalyses: analysesByUser.get(u._id) || 0,
      mismatch: u.analysesUsed !== (analysesByUser.get(u._id) || 0),
    })).filter(u => u.mismatch);

    return {
      summary: {
        totalAnalyses: allAnalyses.length,
        validAnalyses: validAnalyses.length,
        orphanedAnalyses: orphanedAnalyses.length,
        totalUsers: allUsers.length,
        usersWithAnalyses: analysesByUser.size,
        usersWithMismatch: userMismatches.length,
      },
      orphanedAnalyses: orphanedAnalyses.map(a => ({
        analysisId: a._id,
        address: a.address,
        userId: a.userId,
        createdAt: new Date(a.createdAt).toISOString(),
      })),
      userMismatches,
      recentAnalyses: validAnalyses
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10)
        .map(a => ({
          analysisId: a._id,
          userId: a.userId,
          address: a.address,
          createdAt: new Date(a.createdAt).toISOString(),
        })),
    };
  },
});

/**
 * Get detailed report for a specific user
 */
export const checkUserAnalyses = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return { error: "User not found" };
    }

    const analyses = await ctx.db
      .query("propertyAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      user: {
        userId: user._id,
        email: user.email,
        analysesUsed: user.analysesUsed,
        analysesLimit: user.analysesLimit,
        subscriptionTier: user.subscriptionTier,
        createdAt: new Date(user.createdAt).toISOString(),
      },
      analyses: {
        total: analyses.length,
        list: analyses.map(a => ({
          analysisId: a._id,
          address: a.address,
          createdAt: new Date(a.createdAt).toISOString(),
        })),
      },
      discrepancy: user.analysesUsed !== analyses.length,
      discrepancyDetails: {
        userCounter: user.analysesUsed,
        actualAnalyses: analyses.length,
        difference: user.analysesUsed - analyses.length,
      },
    };
  },
});

/**
 * Quick summary of database state
 */
export const getDatabaseSummary = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const analyses = await ctx.db.query("propertyAnalyses").collect();
    const sessions = await ctx.db.query("sessions").collect();

    const now = Date.now();
    const activeSessions = sessions.filter(s => s.expiresAt > now);

    const usersByTier = {
      free: users.filter(u => u.subscriptionTier === "free").length,
      starter: users.filter(u => u.subscriptionTier === "starter").length,
      pro: users.filter(u => u.subscriptionTier === "pro").length,
      elite: users.filter(u => u.subscriptionTier === "elite").length,
    };

    const recentAnalyses = analyses.filter(
      a => a.createdAt > now - 7 * 24 * 60 * 60 * 1000
    ).length;

    return {
      users: {
        total: users.length,
        byTier: usersByTier,
      },
      analyses: {
        total: analyses.length,
        last7Days: recentAnalyses,
      },
      sessions: {
        total: sessions.length,
        active: activeSessions.length,
      },
      health: {
        status: "ok",
        timestamp: new Date(now).toISOString(),
      },
    };
  },
});
