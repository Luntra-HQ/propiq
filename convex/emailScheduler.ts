/**
 * Email Scheduler - Automated email triggers
 * Handles trial expiration warnings, trial expired, and re-engagement emails
 */

import { v } from "convex/values";
import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Trigger Trial Warning Email
 * Called after analysis completes when user has exactly 1 analysis remaining
 */
export const triggerTrialWarningEmail = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user data
    const user = await ctx.db.get(args.userId);
    if (!user) {
      console.error(`[EMAIL SCHEDULER] User not found: ${args.userId}`);
      return { success: false, error: "User not found" };
    }

    // Only trigger for free tier users with exactly 1 analysis remaining
    if (user.subscriptionTier !== "free") {
      console.log(`[EMAIL SCHEDULER] User ${user.email} is not on free tier, skipping warning`);
      return { success: false, error: "Not a free tier user" };
    }

    const analysesRemaining = user.analysesLimit - user.analysesUsed;
    if (analysesRemaining !== 1) {
      console.log(`[EMAIL SCHEDULER] User ${user.email} has ${analysesRemaining} analyses remaining, not 1`);
      return { success: false, error: "User does not have exactly 1 analysis remaining" };
    }

    // Check if warning email already sent
    const existingEmail = await ctx.db
      .query("emailLogs")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("emailType", "trial_expiration_warning")
      )
      .first();

    if (existingEmail) {
      console.log(`[EMAIL SCHEDULER] Warning email already sent to ${user.email}`);
      return { success: false, error: "Warning email already sent" };
    }

    // Schedule email to be sent
    await ctx.scheduler.runAfter(0, internal.emails.sendTrialExpirationWarning, {
      userId: args.userId,
      email: user.email,
      firstName: user.firstName,
      analysesRemaining: 1,
    });

    console.log(`[EMAIL SCHEDULER] ✅ Scheduled trial warning email for ${user.email}`);
    return { success: true };
  },
});

/**
 * Trigger Trial Expired Email
 * Called after analysis completes when user has 0 analyses remaining
 */
export const triggerTrialExpiredEmail = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user data
    const user = await ctx.db.get(args.userId);
    if (!user) {
      console.error(`[EMAIL SCHEDULER] User not found: ${args.userId}`);
      return { success: false, error: "User not found" };
    }

    // Only trigger for free tier users with 0 analyses remaining
    if (user.subscriptionTier !== "free") {
      console.log(`[EMAIL SCHEDULER] User ${user.email} is not on free tier, skipping expired email`);
      return { success: false, error: "Not a free tier user" };
    }

    const analysesRemaining = user.analysesLimit - user.analysesUsed;
    if (analysesRemaining !== 0) {
      console.log(`[EMAIL SCHEDULER] User ${user.email} has ${analysesRemaining} analyses remaining, not 0`);
      return { success: false, error: "User does not have 0 analyses remaining" };
    }

    // Check if expired email already sent
    const existingEmail = await ctx.db
      .query("emailLogs")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("emailType", "trial_expired")
      )
      .first();

    if (existingEmail) {
      console.log(`[EMAIL SCHEDULER] Expired email already sent to ${user.email}`);
      return { success: false, error: "Expired email already sent" };
    }

    // Schedule email to be sent
    await ctx.scheduler.runAfter(0, internal.emails.sendTrialExpired, {
      userId: args.userId,
      email: user.email,
      firstName: user.firstName,
      analysesUsed: user.analysesUsed,
    });

    console.log(`[EMAIL SCHEDULER] ✅ Scheduled trial expired email for ${user.email}`);
    return { success: true };
  },
});

/**
 * Check Inactive Users
 * Scheduled function to find and re-engage inactive free tier users
 * Runs weekly on Mondays at 9 AM EST (2 PM UTC)
 */
export const checkInactiveUsers = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[EMAIL SCHEDULER] Starting inactive user check...");

    // Get current timestamp
    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000; // 14 days in ms
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000; // 30 days in ms

    // Find inactive free tier users
    const inactiveUsers = await ctx.runQuery(internal.emailScheduler.getInactiveUsers, {
      inactiveSince: fourteenDaysAgo,
    });

    console.log(`[EMAIL SCHEDULER] Found ${inactiveUsers.length} inactive users`);

    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const user of inactiveUsers) {
      try {
        // Check if re-engagement email sent in last 30 days
        const recentEmail = await ctx.runQuery(internal.emailScheduler.getRecentReengagementEmail, {
          userId: user._id,
          since: thirtyDaysAgo,
        });

        if (recentEmail) {
          console.log(`[EMAIL SCHEDULER] Skipping ${user.email} - re-engagement sent recently`);
          emailsSkipped++;
          continue;
        }

        // Calculate days since active
        const daysSinceActive = Math.floor((now - user.lastActiveAt) / (24 * 60 * 60 * 1000));

        // Send re-engagement email
        await ctx.runAction(internal.emails.sendReengagement, {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          daysSinceActive,
        });

        emailsSent++;
        console.log(`[EMAIL SCHEDULER] ✅ Sent re-engagement email to ${user.email} (inactive for ${daysSinceActive} days)`);
      } catch (error) {
        console.error(`[EMAIL SCHEDULER] ❌ Failed to send re-engagement to ${user.email}:`, error);
      }
    }

    console.log(`[EMAIL SCHEDULER] ✅ Inactive user check complete. Sent: ${emailsSent}, Skipped: ${emailsSkipped}`);
    return { success: true, emailsSent, emailsSkipped, totalChecked: inactiveUsers.length };
  },
});

/**
 * Get Inactive Users (Internal Query)
 * Find free tier users who haven't been active in 14+ days
 */
export const getInactiveUsers = internalMutation({
  args: {
    inactiveSince: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    // Filter for inactive free tier users
    const inactiveUsers = allUsers.filter((user) => {
      // Must be free tier
      if (user.subscriptionTier !== "free") return false;

      // Must have lastActiveAt field
      if (!user.lastActiveAt) return false;

      // Must be inactive for 14+ days
      if (user.lastActiveAt > args.inactiveSince) return false;

      return true;
    });

    return inactiveUsers;
  },
});

/**
 * Get Recent Re-engagement Email (Internal Query)
 * Check if user received re-engagement email in last 30 days
 */
export const getRecentReengagementEmail = internalMutation({
  args: {
    userId: v.id("users"),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const recentEmail = await ctx.db
      .query("emailLogs")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("emailType", "reengagement")
      )
      .filter((q) => q.gte(q.field("sentAt"), args.since))
      .first();

    return recentEmail;
  },
});
