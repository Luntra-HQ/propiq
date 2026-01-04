/**
 * Cleanup test accounts from PropIQ database
 * Run this ONCE to remove test data and get clean metrics
 *
 * WARNING: This will DELETE users. Review carefully before running.
 */

import { mutation, query } from "./_generated/server";

/**
 * Preview test accounts that will be deleted
 * Run this first to review what will be deleted
 */
export const previewTestAccounts = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    const testPatterns = [
      /test[+@-]/i,
      /rapid-test/i,
      /chaos-test/i,
      /tour-test/i,
      /tour-verify/i,
      /free-tier/i,
      /@propiq\.test$/i,
      /@test\.com$/i,
      /@example\.com$/i,
      /^test\./i, // test.1766*
    ];

    const testAccounts = allUsers.filter(user => {
      const email = user.email;
      return testPatterns.some(pattern => pattern.test(email));
    });

    return {
      totalUsers: allUsers.length,
      testAccountsToDelete: testAccounts.length,
      testAccounts: testAccounts.map(u => ({
        id: u._id,
        email: u.email,
        firstName: u.firstName,
        signupDate: new Date(u.createdAt).toISOString(),
        analysesUsed: u.analysesUsed,
      })),
    };
  },
});

/**
 * DELETE test accounts (IRREVERSIBLE)
 *
 * Usage:
 * npx convex run cleanupTestAccounts:deleteTestAccounts
 *
 * This will:
 * 1. Delete test user accounts
 * 2. Delete their property analyses
 * 3. Delete their sessions
 * 4. Clean up related data
 */
export const deleteTestAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    const testPatterns = [
      /test[+@-]/i,
      /rapid-test/i,
      /chaos-test/i,
      /tour-test/i,
      /tour-verify/i,
      /free-tier/i,
      /@propiq\.test$/i,
      /@test\.com$/i,
      /@example\.com$/i,
      /^test\./i,
    ];

    const testAccounts = allUsers.filter(user => {
      const email = user.email;
      return testPatterns.some(pattern => pattern.test(email));
    });

    let deletedUsers = 0;
    let deletedAnalyses = 0;
    let deletedSessions = 0;

    for (const user of testAccounts) {
      // Delete property analyses
      const analyses = await ctx.db
        .query("propertyAnalyses")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      for (const analysis of analyses) {
        await ctx.db.delete(analysis._id);
        deletedAnalyses++;
      }

      // Delete sessions
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      for (const session of sessions) {
        await ctx.db.delete(session._id);
        deletedSessions++;
      }

      // Delete onboarding progress
      const onboarding = await ctx.db
        .query("onboardingProgress")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      if (onboarding) {
        await ctx.db.delete(onboarding._id);
      }

      // Delete the user account
      await ctx.db.delete(user._id);
      deletedUsers++;
    }

    // Log the cleanup to audit logs
    await ctx.db.insert("audit_logs", {
      event: "TEST_ACCOUNTS_CLEANUP",
      severity: "info",
      adminId: "system",
      timestamp: Date.now(),
      metadata: {
        deletedUsers,
        deletedAnalyses,
        deletedSessions,
        testPatternsUsed: testPatterns.map(p => p.source),
      },
    });

    return {
      success: true,
      deletedUsers,
      deletedAnalyses,
      deletedSessions,
      message: `Cleaned up ${deletedUsers} test accounts and ${deletedAnalyses} test analyses`,
    };
  },
});

/**
 * Get clean user count (real users only)
 */
export const getRealUserCount = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    const testPatterns = [
      /test[+@-]/i,
      /rapid-test/i,
      /chaos-test/i,
      /tour-test/i,
      /tour-verify/i,
      /free-tier/i,
      /@propiq\.test$/i,
      /@test\.com$/i,
      /@example\.com$/i,
      /^test\./i,
    ];

    // Known personal emails (exclude from "real users")
    const personalEmails = [
      'bdusape@gmail.com',
      'bdusape@luntra.one',
      'briandphive@gmail.com',
      'b.dusape@outlook.com',
      'bdusape@outlook.com',
      'infodiamonddusape@gmail.com',
      'budsape+emailtest2@gmail.com',
    ];

    const realUsers = allUsers.filter(user => {
      const email = user.email;
      const isTest = testPatterns.some(pattern => pattern.test(email));
      const isPersonal = personalEmails.includes(email);
      return !isTest && !isPersonal;
    });

    return {
      totalUsersInDB: allUsers.length,
      realUsers: realUsers.length,
      realUserEmails: realUsers.map(u => ({
        email: u.email,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        signupDate: new Date(u.createdAt).toISOString(),
        analysesUsed: u.analysesUsed,
      })),
    };
  },
});
