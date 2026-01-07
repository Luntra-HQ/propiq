/**
 * Admin Cleanup Utilities
 *
 * Functions to clean up test data and manage users.
 * ⚠️ USE WITH CAUTION - These functions permanently delete data
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List all users in the database
 * Useful for seeing what test accounts exist
 */
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    return users.map(user => ({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionTier: user.subscriptionTier,
      emailVerified: user.emailVerified,
      active: user.active,
      createdAt: user.createdAt,
      analysesUsed: user.analysesUsed,
    }));
  },
});

/**
 * Find user by email
 * Useful for checking if a specific email exists
 */
export const findUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      return { exists: false, user: null };
    }

    return {
      exists: true,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        active: user.active,
        createdAt: user.createdAt,
        subscriptionTier: user.subscriptionTier,
      },
    };
  },
});

/**
 * Delete a user by email
 * Also deletes all related data:
 * - Sessions
 * - Property analyses
 * - Support chats
 * - Email verification tokens
 */
export const deleteUserByEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return {
        success: false,
        error: `User with email ${email} not found`,
      };
    }

    const userId = user._id;

    console.log(`[ADMIN] Deleting user: ${email} (ID: ${userId})`);

    // Delete all sessions for this user
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    console.log(`[ADMIN] Deleted ${sessions.length} sessions`);

    // Delete all property analyses
    const analyses = await ctx.db
      .query("propertyAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const analysis of analyses) {
      await ctx.db.delete(analysis._id);
    }
    console.log(`[ADMIN] Deleted ${analyses.length} property analyses`);

    // Delete all support chats
    const chats = await ctx.db
      .query("supportChats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const chat of chats) {
      await ctx.db.delete(chat._id);
    }
    console.log(`[ADMIN] Deleted ${chats.length} support chats`);

    // Delete all email verification tokens
    const tokens = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const token of tokens) {
      await ctx.db.delete(token._id);
    }
    console.log(`[ADMIN] Deleted ${tokens.length} email verification tokens`);

    // Finally, delete the user
    await ctx.db.delete(userId);
    console.log(`[ADMIN] Deleted user: ${email}`);

    return {
      success: true,
      email: email,
      deletedData: {
        sessions: sessions.length,
        analyses: analyses.length,
        supportChats: chats.length,
        verificationTokens: tokens.length,
      },
    };
  },
});

/**
 * Delete multiple users by email
 * Batch deletion for cleaning up test accounts
 */
export const deleteMultipleUsers = mutation({
  args: {
    emails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const email of args.emails) {
      const result = await deleteUserByEmailHelper(ctx, { email });
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      total: args.emails.length,
      successful: successCount,
      failed: failureCount,
      results: results,
    };
  },
});

/**
 * Delete all unverified users
 * Useful for cleaning up test accounts that never verified their email
 */
export const deleteUnverifiedUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const unverifiedUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("emailVerified"), false))
      .collect();

    console.log(`[ADMIN] Found ${unverifiedUsers.length} unverified users`);

    const deleted = [];

    for (const user of unverifiedUsers) {
      // Delete related data
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      for (const session of sessions) {
        await ctx.db.delete(session._id);
      }

      const analyses = await ctx.db
        .query("propertyAnalyses")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      for (const analysis of analyses) {
        await ctx.db.delete(analysis._id);
      }

      const tokens = await ctx.db
        .query("emailVerificationTokens")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      for (const token of tokens) {
        await ctx.db.delete(token._id);
      }

      // Delete user
      await ctx.db.delete(user._id);

      deleted.push({
        email: user.email,
        createdAt: user.createdAt,
      });
    }

    console.log(`[ADMIN] Deleted ${deleted.length} unverified users`);

    return {
      success: true,
      deletedCount: deleted.length,
      deletedUsers: deleted,
    };
  },
});

/**
 * Helper function - used by deleteMultipleUsers
 */
const deleteUserByEmailHelper = async (
  ctx: any,
  args: { email: string }
) => {
  const email = args.email.toLowerCase();

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();

  if (!user) {
    return {
      success: false,
      error: `User with email ${email} not found`,
    };
  }

  const userId = user._id;

  // Delete all related data
  const sessions = await ctx.db
    .query("sessions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const session of sessions) {
    await ctx.db.delete(session._id);
  }

  const analyses = await ctx.db
    .query("propertyAnalyses")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const analysis of analyses) {
    await ctx.db.delete(analysis._id);
  }

  const chats = await ctx.db
    .query("supportChats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const chat of chats) {
    await ctx.db.delete(chat._id);
  }

  const tokens = await ctx.db
    .query("emailVerificationTokens")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const token of tokens) {
    await ctx.db.delete(token._id);
  }

  await ctx.db.delete(userId);

  return {
    success: true,
    email: email,
    deletedData: {
      sessions: sessions.length,
      analyses: analyses.length,
      supportChats: chats.length,
      verificationTokens: tokens.length,
    },
  };
};
