/**
 * Session Management for PropIQ
 * Server-side sessions with httpOnly cookie support
 *
 * This replaces localStorage-based auth for proper security:
 * - Sessions stored server-side in Convex
 * - Session token in httpOnly cookie (not userId!)
 * - Automatic expiration and refresh
 * - Can revoke sessions server-side
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Session duration: 30 days sliding window in milliseconds
const SESSION_IDLE_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000;

// Session refresh threshold: 7 days (auto-extend if less than this remaining)
const SESSION_REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate a cryptographically secure session token
 */
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a new session for a user
 * Called after successful login
 *
 * IMPORTANT: Uses Convex _id as the session token (not random token)
 * This prevents race conditions and token mismatch issues
 */
export const createSession = mutation({
  args: {
    userId: v.id("users"),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Insert session - the _id IS the token
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      token: "", // Legacy field, kept for schema compatibility
      expiresAt: now + SESSION_IDLE_TIMEOUT_MS, // 30 day sliding window
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      createdAt: now,
      lastActivityAt: now,
    });

    // Use Convex _id as the token - this is immutable and safe
    const token = sessionId.toString();

    console.log("[SESSION] Created session for user:", args.userId, "token:", token);

    return {
      sessionId,
      token, // This is now the _id string
      expiresAt: now + SESSION_IDLE_TIMEOUT_MS,
    };
  },
});

/**
 * Validate a session token and return user data
 * Called by the /auth/me HTTP endpoint
 *
 * IMPORTANT: Token is now the Convex _id (not random string)
 * Uses normalizeId for direct lookup - no index needed
 */
export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) {
      return null;
    }

    const now = Date.now();

    // Token IS the session _id - use normalizeId for direct lookup
    const sessionId = ctx.db.normalizeId("sessions", args.token);
    if (!sessionId) {
      console.log("[SESSION] Invalid session ID format:", args.token);
      return null;
    }

    // Direct lookup by _id (fastest possible)
    const session = await ctx.db.get(sessionId);
    if (!session) {
      console.log("[SESSION] Session not found");
      return null;
    }

    // Check if session expired (30-day sliding window)
    if (session.expiresAt < now) {
      console.log("[SESSION] Session expired");
      return null;
    }

    // Get user data
    const user = await ctx.db.get(session.userId);
    if (!user || !user.active) {
      return null;
    }

    // Check if refresh is needed (within 7 days of expiry)
    const needsRefresh = session.expiresAt - now < SESSION_REFRESH_THRESHOLD_MS;

    // Return user data (without password hash) and session info
    return {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        subscriptionTier: user.subscriptionTier,
        analysesUsed: user.analysesUsed ?? 0,
        analysesLimit: user.analysesLimit ?? 3,
        active: user.active,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      session: {
        expiresAt: session.expiresAt,
        needsRefresh,
      },
    };
  },
});

/**
 * Refresh a session (extend idle expiration)
 * Called when user is active and session is close to expiring
 *
 * Token is now the Convex _id
 */
export const refreshSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Token IS the session _id
    const sessionId = ctx.db.normalizeId("sessions", args.token);
    if (!sessionId) {
      return { success: false, error: "Invalid session" };
    }

    const session = await ctx.db.get(sessionId);
    if (!session || session.expiresAt < now) {
      return { success: false, error: "Invalid or expired session" };
    }

    // Extend session by 30 days
    const newExpiresAt = now + SESSION_IDLE_TIMEOUT_MS;

    await ctx.db.patch(sessionId, {
      expiresAt: newExpiresAt,
      lastActivityAt: now,
    });

    console.log("[SESSION] Refreshed session for user:", session.userId);

    return {
      success: true,
      expiresAt: newExpiresAt,
    };
  },
});

/**
 * Delete a session (logout)
 * Token is now the Convex _id
 */
export const deleteSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Token IS the session _id
    const sessionId = ctx.db.normalizeId("sessions", args.token);
    if (!sessionId) {
      return { success: true }; // Already gone
    }

    const session = await ctx.db.get(sessionId);
    if (session) {
      await ctx.db.delete(sessionId);
      console.log("[SESSION] Deleted session for user:", session.userId);
    }

    return { success: true };
  },
});

/**
 * Delete all sessions for a user (logout from all devices)
 */
export const deleteAllUserSessions = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    console.log(
      "[SESSION] Deleted all sessions for user:",
      args.userId,
      "count:",
      sessions.length
    );

    return { success: true, deletedCount: sessions.length };
  },
});

/**
 * Get all active sessions for a user (for "manage sessions" UI)
 */
export const getUserSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter out expired and return sanitized list
    return sessions
      .filter((s) => s.expiresAt > now)
      .map((s) => ({
        _id: s._id,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastActivityAt: s.lastActivityAt,
        expiresAt: s.expiresAt,
      }));
  },
});

/**
 * Cleanup expired sessions (run periodically via cron)
 */
export const cleanupExpiredSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find expired sessions
    const expiredSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    for (const session of expiredSessions) {
      await ctx.db.delete(session._id);
    }

    console.log("[SESSION] Cleaned up expired sessions:", expiredSessions.length);

    return { deletedCount: expiredSessions.length };
  },
});
