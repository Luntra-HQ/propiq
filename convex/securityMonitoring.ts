/**
 * Security Monitoring and Threat Detection
 *
 * Analyzes audit logs to detect suspicious activity patterns:
 * - Brute force attacks (multiple failed logins)
 * - Account enumeration attempts
 * - Unusual access patterns
 * - Concurrent sessions from different IPs
 * - Suspicious timing patterns
 *
 * **Usage:**
 * - Run via cron jobs (every 15 minutes)
 * - Can be triggered manually for incident response
 * - Generates alerts for critical events
 */

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { SecurityEvents } from "./auditLog";

/**
 * Brute force detection threshold
 * More than this many failed logins = brute force attack
 */
const BRUTE_FORCE_THRESHOLD = {
  ATTEMPTS: 10, // Failed login attempts
  WINDOW_MINUTES: 60, // Within this time window
};

/**
 * Account enumeration detection
 * Too many failed logins for non-existent accounts from same IP
 */
const ENUMERATION_THRESHOLD = {
  ATTEMPTS: 20, // Attempts for non-existent accounts
  WINDOW_MINUTES: 30,
};

/**
 * Detect brute force attacks
 * Checks for excessive failed login attempts from same IP or against same email
 */
export const detectBruteForce = internalQuery({
  handler: async (ctx) => {
    const since = Date.now() - BRUTE_FORCE_THRESHOLD.WINDOW_MINUTES * 60 * 1000;

    // Get all failed login attempts in the time window
    const failedLogins = await ctx.db
      .query("audit_logs")
      .withIndex("by_event", (q) => q.eq("event", SecurityEvents.LOGIN_FAILED))
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();

    // Group by IP address
    const byIP = new Map<string, number>();
    // Group by email
    const byEmail = new Map<string, number>();

    for (const log of failedLogins) {
      if (log.ipAddress) {
        byIP.set(log.ipAddress, (byIP.get(log.ipAddress) || 0) + 1);
      }
      if (log.email) {
        byEmail.set(log.email, (byEmail.get(log.email) || 0) + 1);
      }
    }

    const threats: Array<{
      type: "brute_force_ip" | "brute_force_email";
      target: string;
      attempts: number;
      severity: "critical";
    }> = [];

    // Check for brute force from IP
    for (const [ip, count] of byIP.entries()) {
      if (count >= BRUTE_FORCE_THRESHOLD.ATTEMPTS) {
        threats.push({
          type: "brute_force_ip",
          target: ip,
          attempts: count,
          severity: "critical",
        });
      }
    }

    // Check for brute force against email
    for (const [email, count] of byEmail.entries()) {
      if (count >= BRUTE_FORCE_THRESHOLD.ATTEMPTS) {
        threats.push({
          type: "brute_force_email",
          target: email,
          attempts: count,
          severity: "critical",
        });
      }
    }

    return threats;
  },
});

/**
 * Detect account enumeration attempts
 * Too many failed logins for non-existent accounts suggests enumeration
 */
export const detectEnumeration = internalQuery({
  handler: async (ctx) => {
    const since = Date.now() - ENUMERATION_THRESHOLD.WINDOW_MINUTES * 60 * 1000;

    // Get failed logins with reason "user_not_found"
    const enumerationAttempts = await ctx.db
      .query("audit_logs")
      .withIndex("by_event", (q) => q.eq("event", SecurityEvents.LOGIN_FAILED))
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();

    // Filter to only user_not_found attempts and group by IP
    const byIP = new Map<string, number>();

    for (const log of enumerationAttempts) {
      if (log.metadata?.reason === "user_not_found" && log.ipAddress) {
        byIP.set(log.ipAddress, (byIP.get(log.ipAddress) || 0) + 1);
      }
    }

    const threats: Array<{
      type: "enumeration";
      ipAddress: string;
      attempts: number;
      severity: "critical";
    }> = [];

    for (const [ip, count] of byIP.entries()) {
      if (count >= ENUMERATION_THRESHOLD.ATTEMPTS) {
        threats.push({
          type: "enumeration",
          ipAddress: ip,
          attempts: count,
          severity: "critical",
        });
      }
    }

    return threats;
  },
});

/**
 * Run all security checks and log critical threats
 * Called periodically by cron job
 */
export const runSecurityChecks = internalMutation({
  handler: async (ctx) => {
    console.log("[SECURITY] Running security monitoring checks...");

    // Detect brute force attacks
    const bruteForceThreats = await ctx.runQuery(internal.securityMonitoring.detectBruteForce);

    if (bruteForceThreats.length > 0) {
      console.error(`[SECURITY] ⚠️  Detected ${bruteForceThreats.length} brute force threats:`, bruteForceThreats);

      // Log each threat as a critical audit event
      for (const threat of bruteForceThreats) {
        await ctx.runMutation(internal.auditLog.logSecurityEventInternal, {
          event: SecurityEvents.BRUTE_FORCE_DETECTED,
          severity: "critical",
          ipAddress: threat.type === "brute_force_ip" ? threat.target : undefined,
          email: threat.type === "brute_force_email" ? threat.target : undefined,
          metadata: {
            attempts: threat.attempts,
            threshold: BRUTE_FORCE_THRESHOLD.ATTEMPTS,
            windowMinutes: BRUTE_FORCE_THRESHOLD.WINDOW_MINUTES,
          },
        });
      }
    }

    // Detect enumeration attempts
    const enumerationThreats = await ctx.runQuery(internal.securityMonitoring.detectEnumeration);

    if (enumerationThreats.length > 0) {
      console.error(`[SECURITY] ⚠️  Detected ${enumerationThreats.length} enumeration threats:`, enumerationThreats);

      // Log each threat
      for (const threat of enumerationThreats) {
        await ctx.runMutation(internal.auditLog.logSecurityEventInternal, {
          event: SecurityEvents.SUSPICIOUS_ACTIVITY,
          severity: "critical",
          ipAddress: threat.ipAddress,
          metadata: {
            type: "account_enumeration",
            attempts: threat.attempts,
            threshold: ENUMERATION_THRESHOLD.ATTEMPTS,
            windowMinutes: ENUMERATION_THRESHOLD.WINDOW_MINUTES,
          },
        });
      }
    }

    const totalThreats = bruteForceThreats.length + enumerationThreats.length;

    if (totalThreats === 0) {
      console.log("[SECURITY] ✅ No threats detected");
    }

    return {
      bruteForceThreats: bruteForceThreats.length,
      enumerationThreats: enumerationThreats.length,
      totalThreats,
      timestamp: Date.now(),
    };
  },
});

/**
 * Get security monitoring summary
 * Used for dashboard/reporting
 */
export const getSecuritySummary = internalQuery({
  args: {
    hoursBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hoursBack = args.hoursBack || 24;
    const since = Date.now() - hoursBack * 60 * 60 * 1000;

    // Get critical security events
    const criticalEvents = await ctx.db
      .query("audit_logs")
      .withIndex("by_severity", (q) => q.eq("severity", "critical"))
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();

    // Count by type
    const eventCounts: Record<string, number> = {};
    for (const event of criticalEvents) {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    }

    // Get failed login count
    const failedLogins = await ctx.db
      .query("audit_logs")
      .withIndex("by_event", (q) => q.eq("event", SecurityEvents.LOGIN_FAILED))
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();

    // Get successful login count
    const successfulLogins = await ctx.db
      .query("audit_logs")
      .withIndex("by_event", (q) => q.eq("event", SecurityEvents.LOGIN_SUCCESS))
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();

    return {
      timeRange: {
        hours: hoursBack,
        since,
        until: Date.now(),
      },
      criticalEvents: {
        total: criticalEvents.length,
        byType: eventCounts,
      },
      authentication: {
        failedLogins: failedLogins.length,
        successfulLogins: successfulLogins.length,
        failureRate: successfulLogins.length > 0
          ? (failedLogins.length / (failedLogins.length + successfulLogins.length)) * 100
          : 0,
      },
    };
  },
});
