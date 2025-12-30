/**
 * Rate Limiting Implementation for Convex
 * Protects against brute force attacks and API abuse
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
};

/**
 * Check if an IP/identifier is rate limited
 * Returns: { allowed: boolean, remainingAttempts: number, resetAt: number }
 */
export const checkRateLimit = query({
  args: {
    identifier: v.string(), // IP address or user ID
    action: v.string(), // "login", "signup", "passwordReset", "api"
  },
  handler: async (ctx, args) => {
    const config = RATE_LIMIT_CONFIG[args.action as keyof typeof RATE_LIMIT_CONFIG];

    if (!config) {
      throw new Error(`Unknown action: ${args.action}`);
    }

    const now = Date.now();

    // Find existing rate limit record
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_action", (q) =>
        q.eq("identifier", args.identifier).eq("action", args.action)
      )
      .first();

    if (!existing) {
      // No record = allowed
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
        resetAt: now + config.windowMs,
      };
    }

    // Check if currently blocked
    if (existing.blockedUntil && now < existing.blockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetAt: existing.blockedUntil,
      };
    }

    // Check if window has expired (reset counter)
    if (now > existing.windowExpiresAt) {
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
        resetAt: now + config.windowMs,
      };
    }

    // Within window - check if limit exceeded
    const remainingAttempts = config.maxAttempts - existing.attempts;

    if (remainingAttempts <= 0) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetAt: existing.windowExpiresAt,
      };
    }

    return {
      allowed: true,
      remainingAttempts,
      resetAt: existing.windowExpiresAt,
    };
  },
});

/**
 * Record a rate limit attempt
 * Call this AFTER the action (login, signup, etc.)
 */
export const recordAttempt = mutation({
  args: {
    identifier: v.string(),
    action: v.string(),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const config = RATE_LIMIT_CONFIG[args.action as keyof typeof RATE_LIMIT_CONFIG];

    if (!config) {
      throw new Error(`Unknown action: ${args.action}`);
    }

    const now = Date.now();

    // Find existing record
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_action", (q) =>
        q.eq("identifier", args.identifier).eq("action", args.action)
      )
      .first();

    if (!existing) {
      // Create new record
      await ctx.db.insert("rateLimits", {
        identifier: args.identifier,
        action: args.action,
        attempts: 1,
        windowExpiresAt: now + config.windowMs,
        blockedUntil: null,
        lastAttemptAt: now,
        createdAt: now,
      });
      return;
    }

    // Reset if window expired
    if (now > existing.windowExpiresAt) {
      await ctx.db.patch(existing._id, {
        attempts: 1,
        windowExpiresAt: now + config.windowMs,
        blockedUntil: null,
        lastAttemptAt: now,
      });
      return;
    }

    // Increment attempts
    const newAttempts = existing.attempts + 1;
    const updates: any = {
      attempts: newAttempts,
      lastAttemptAt: now,
    };

    // If limit exceeded, block
    if (newAttempts >= config.maxAttempts) {
      updates.blockedUntil = now + config.blockDurationMs;
      console.log(`[RATE LIMIT] Blocking ${args.identifier} for ${args.action} until ${new Date(updates.blockedUntil)}`);
    }

    await ctx.db.patch(existing._id, updates);
  },
});

/**
 * Clear rate limits for an identifier (admin function)
 */
export const clearRateLimit = mutation({
  args: {
    identifier: v.string(),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.action) {
      // Clear specific action
      const record = await ctx.db
        .query("rateLimits")
        .withIndex("by_identifier_action", (q) =>
          q.eq("identifier", args.identifier).eq("action", args.action)
        )
        .first();

      if (record) {
        await ctx.db.delete(record._id);
        console.log(`[RATE LIMIT] Cleared ${args.action} for ${args.identifier}`);
      }
    } else {
      // Clear all actions for identifier
      const records = await ctx.db
        .query("rateLimits")
        .withIndex("by_identifier_action", (q) =>
          q.eq("identifier", args.identifier)
        )
        .collect();

      for (const record of records) {
        await ctx.db.delete(record._id);
      }
      console.log(`[RATE LIMIT] Cleared all rate limits for ${args.identifier}`);
    }

    return { success: true };
  },
});

/**
 * Get rate limit status for an identifier
 */
export const getRateLimitStatus = query({
  args: {
    identifier: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_action", (q) =>
        q.eq("identifier", args.identifier)
      )
      .collect();

    const now = Date.now();

    return records.map((record) => ({
      action: record.action,
      attempts: record.attempts,
      blocked: record.blockedUntil ? now < record.blockedUntil : false,
      blockedUntil: record.blockedUntil,
      windowExpiresAt: record.windowExpiresAt,
      lastAttemptAt: record.lastAttemptAt,
    }));
  },
});
