/**
 * Security Audit Logging System
 *
 * Comprehensive logging for security events, compliance, and incident response
 *
 * **Purpose:**
 * - Track authentication events (login, logout, password changes)
 * - Monitor suspicious activity (brute force, enumeration)
 * - Provide forensic trail for security incidents
 * - Meet compliance requirements (GDPR, SOC 2, PCI-DSS)
 *
 * **Event Categories:**
 * - AUTH: Authentication events (login, logout, password)
 * - ADMIN: Administrative actions
 * - PAYMENT: Subscription and payment changes
 * - ACCESS: Authorization and access control
 * - SYSTEM: System-level security events
 *
 * **Severity Levels:**
 * - info: Normal operations (successful login)
 * - warning: Suspicious but not critical (failed login)
 * - critical: Security incident (brute force detected, unauthorized access)
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Security event types
 */
export const SecurityEvents = {
  // Authentication events
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  LOGOUT_ALL_DEVICES: "LOGOUT_ALL_DEVICES",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Password events
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_COMPLETED: "PASSWORD_RESET_COMPLETED",
  PASSWORD_RESET_FAILED: "PASSWORD_RESET_FAILED",

  // Account events
  ACCOUNT_CREATED: "ACCOUNT_CREATED",
  ACCOUNT_DELETED: "ACCOUNT_DELETED",
  EMAIL_CHANGED: "EMAIL_CHANGED",
  PROFILE_UPDATED: "PROFILE_UPDATED",

  // Subscription events
  SUBSCRIPTION_CREATED: "SUBSCRIPTION_CREATED",
  SUBSCRIPTION_UPGRADED: "SUBSCRIPTION_UPGRADED",
  SUBSCRIPTION_DOWNGRADED: "SUBSCRIPTION_DOWNGRADED",
  SUBSCRIPTION_CANCELED: "SUBSCRIPTION_CANCELED",
  PAYMENT_METHOD_CHANGED: "PAYMENT_METHOD_CHANGED",

  // Admin events
  ADMIN_ACTION: "ADMIN_ACTION",
  ADMIN_USER_IMPERSONATION: "ADMIN_USER_IMPERSONATION",

  // Access control events
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  PERMISSION_DENIED: "PERMISSION_DENIED",

  // Security events
  BRUTE_FORCE_DETECTED: "BRUTE_FORCE_DETECTED",
  SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

/**
 * Log a security event
 * Can be called from mutations, actions, or HTTP endpoints
 */
export const logSecurityEvent = mutation({
  args: {
    event: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("audit_logs", {
      event: args.event,
      severity: args.severity,
      userId: args.userId,
      email: args.email,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      metadata: args.metadata,
      timestamp: Date.now(),
    });

    // Log to console for debugging (filtered in production monitoring)
    if (args.severity === "critical") {
      console.error(`[AUDIT] CRITICAL: ${args.event}`, {
        userId: args.userId,
        email: args.email,
        ipAddress: args.ipAddress,
        metadata: args.metadata,
      });
    } else if (args.severity === "warning") {
      console.warn(`[AUDIT] WARNING: ${args.event}`, {
        userId: args.userId,
        email: args.email,
      });
    }
  },
});

/**
 * Internal mutation for logging (doesn't require authentication)
 * Used by system processes like cron jobs
 */
export const logSecurityEventInternal = internalMutation({
  args: {
    event: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("audit_logs", {
      event: args.event,
      severity: args.severity,
      userId: args.userId,
      email: args.email,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

/**
 * Get recent security events
 * Used for security dashboard and monitoring
 */
export const getRecentEvents = query({
  args: {
    limit: v.optional(v.number()),
    severity: v.optional(v.string()),
    event: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    let query = ctx.db.query("audit_logs").order("desc");

    if (args.severity) {
      query = query.filter((q) => q.eq(q.field("severity"), args.severity));
    }

    if (args.event) {
      query = query.filter((q) => q.eq(q.field("event"), args.event));
    }

    return await query.take(limit);
  },
});

/**
 * Get failed login attempts for an email or IP
 * Used for brute force detection
 */
export const getFailedLogins = query({
  args: {
    email: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    sinceMinutes: v.number(), // How far back to look
  },
  handler: async (ctx, args) => {
    const since = Date.now() - args.sinceMinutes * 60 * 1000;

    let query = ctx.db
      .query("audit_logs")
      .withIndex("by_event", (q) => q.eq("event", SecurityEvents.LOGIN_FAILED))
      .filter((q) => q.gte(q.field("timestamp"), since));

    if (args.email) {
      query = query.filter((q) => q.eq(q.field("email"), args.email));
    }

    if (args.ipAddress) {
      query = query.filter((q) => q.eq(q.field("ipAddress"), args.ipAddress));
    }

    return await query.collect();
  },
});

/**
 * Get audit trail for a specific user
 * Used for compliance and investigation
 */
export const getUserAuditTrail = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    return await ctx.db
      .query("audit_logs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get critical security events
 * Used for security incident response
 */
export const getCriticalEvents = query({
  args: {
    limit: v.optional(v.number()),
    sinceHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const sinceHours = args.sinceHours || 24;
    const since = Date.now() - sinceHours * 60 * 60 * 1000;

    return await ctx.db
      .query("audit_logs")
      .withIndex("by_severity", (q) => q.eq("severity", "critical"))
      .filter((q) => q.gte(q.field("timestamp"), since))
      .order("desc")
      .take(limit);
  },
});

/**
 * Cleanup old audit logs
 * Run periodically to maintain 90-day retention
 */
export const cleanupOldLogs = internalMutation({
  args: {
    retentionDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const retentionDays = args.retentionDays || 90;
    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    const oldLogs = await ctx.db
      .query("audit_logs")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoffTime))
      .collect();

    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }

    console.log(`[AUDIT] Cleaned up ${oldLogs.length} logs older than ${retentionDays} days`);

    return { deletedCount: oldLogs.length };
  },
});

/**
 * Get statistics for security dashboard
 */
export const getSecurityStats = query({
  args: {
    sinceHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sinceHours = args.sinceHours || 24;
    const since = Date.now() - sinceHours * 60 * 60 * 1000;

    // Get all recent logs
    const logs = await ctx.db
      .query("audit_logs")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();

    // Calculate statistics
    const stats = {
      totalEvents: logs.length,
      bySeverity: {
        info: 0,
        warning: 0,
        critical: 0,
      },
      byEvent: {} as Record<string, number>,
      failedLogins: 0,
      successfulLogins: 0,
      uniqueIPs: new Set<string>(),
      uniqueUsers: new Set<string>(),
    };

    for (const log of logs) {
      // Count by severity
      if (log.severity === "info") stats.bySeverity.info++;
      else if (log.severity === "warning") stats.bySeverity.warning++;
      else if (log.severity === "critical") stats.bySeverity.critical++;

      // Count by event type
      stats.byEvent[log.event] = (stats.byEvent[log.event] || 0) + 1;

      // Count login events
      if (log.event === SecurityEvents.LOGIN_FAILED) stats.failedLogins++;
      if (log.event === SecurityEvents.LOGIN_SUCCESS) stats.successfulLogins++;

      // Track unique IPs and users
      if (log.ipAddress) stats.uniqueIPs.add(log.ipAddress);
      if (log.userId) stats.uniqueUsers.add(log.userId);
    }

    return {
      totalEvents: stats.totalEvents,
      bySeverity: stats.bySeverity,
      byEvent: stats.byEvent,
      failedLogins: stats.failedLogins,
      successfulLogins: stats.successfulLogins,
      uniqueIPs: stats.uniqueIPs.size,
      uniqueUsers: stats.uniqueUsers.size,
      timeRangeHours: sinceHours,
    };
  },
});
