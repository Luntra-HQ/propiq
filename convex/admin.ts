/**
 * Admin Mutations for PropIQ
 *
 * SECURITY: These mutations should ONLY be called via CLI with proper authentication.
 * They perform sensitive operations like password resets and are NOT exposed via HTTP endpoints.
 *
 * All operations are logged to audit_logs table for compliance and security tracking.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./authUtils";

/**
 * Reset user password (ADMIN ONLY - CLI access)
 *
 * Security features:
 * - Password must be provided in plain text - will be hashed using PBKDF2
 * - Backups old hash in audit log for rollback capability
 * - Validates user exists before proceeding
 * - Logs all operations for compliance
 *
 * Usage:
 * ```bash
 * npx convex run admin:resetUserPassword '{
 *   "email": "user@example.com",
 *   "newPassword": "TempPassword123!"
 * }'
 * ```
 */
export const resetUserPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string(), // Plain text password - will be hashed
  },
  handler: async (ctx, args) => {
    console.log(`[ADMIN] Password reset requested for: ${args.email}`);

    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      console.error(`[ADMIN] User not found: ${args.email}`);
      throw new Error(`User not found: ${args.email}`);
    }

    // Hash the new password using PBKDF2 (imported at top of file)
    console.log(`[ADMIN] Hashing new password for ${args.email}...`);
    const newPasswordHash = await hashPassword(args.newPassword);

    // Backup old hash for rollback capability
    const oldHash = user.passwordHash;
    console.log(`[ADMIN] Old hash backed up (first 20 chars): ${oldHash.substring(0, 20)}...`);

    // Update password
    const now = Date.now();
    await ctx.db.patch(user._id, {
      passwordHash: newPasswordHash,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert("audit_logs", {
      action: "admin_password_reset",
      userId: user._id,
      email: args.email,
      timestamp: now,
      metadata: {
        oldHashBackup: oldHash, // Store for rollback
        oldHashType: oldHash.startsWith("$pbkdf2") ? "PBKDF2" : "SHA256",
        newHashType: "PBKDF2",
        resetBy: "CLI_ADMIN",
      },
    });

    console.log(`[ADMIN] ✅ Password reset successful for ${args.email}`);
    console.log(`[ADMIN] User can now login with the new password`);

    return {
      success: true,
      message: "Password updated successfully",
      userId: user._id,
      email: args.email,
      oldHashType: oldHash.startsWith("$pbkdf2") ? "PBKDF2" : "SHA256",
      newHashType: "PBKDF2",
    };
  },
});

/**
 * Rollback password reset (ADMIN ONLY - CLI access)
 *
 * Restores the previous password hash from audit logs.
 * Use this if a password reset causes issues.
 *
 * Usage:
 * ```bash
 * npx convex run admin:rollbackPasswordReset '{
 *   "email": "user@example.com"
 * }'
 * ```
 */
export const rollbackPasswordReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`[ADMIN] Password rollback requested for: ${args.email}`);

    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User not found: ${args.email}`);
    }

    // Find most recent password reset audit log
    const auditLogs = await ctx.db
      .query("audit_logs")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();

    const relevantLog = auditLogs.find(
      (log) =>
        log.action === "admin_password_reset" &&
        log.email === args.email
    );

    if (!relevantLog || !relevantLog.metadata?.oldHashBackup) {
      throw new Error("No backup hash found in audit logs - cannot rollback");
    }

    // Restore old hash
    const now = Date.now();
    await ctx.db.patch(user._id, {
      passwordHash: relevantLog.metadata.oldHashBackup as string,
      updatedAt: now,
    });

    // Log the rollback
    await ctx.db.insert("audit_logs", {
      action: "admin_password_rollback",
      userId: user._id,
      email: args.email,
      timestamp: now,
      metadata: {
        restoredFrom: relevantLog._id,
        restoredHashType: relevantLog.metadata.oldHashType,
      },
    });

    console.log(`[ADMIN] ✅ Password rolled back for ${args.email}`);

    return {
      success: true,
      message: "Password rolled back to previous value",
      email: args.email,
    };
  },
});

/**
 * View recent audit logs (ADMIN ONLY - CLI access)
 *
 * Usage:
 * ```bash
 * npx convex run admin:getAuditLogs '{
 *   "limit": 10
 * }'
 * ```
 */
export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    let query = ctx.db
      .query("audit_logs")
      .withIndex("by_timestamp")
      .order("desc");

    const logs = await query.take(limit);

    // Filter by action if specified
    if (args.action) {
      return logs.filter((log) => log.action === args.action);
    }

    return logs;
  },
});

/**
 * Get audit logs for a specific user (ADMIN ONLY - CLI access)
 *
 * Usage:
 * ```bash
 * npx convex run admin:getUserAuditLogs '{
 *   "email": "user@example.com"
 * }'
 * ```
 */
export const getUserAuditLogs = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("audit_logs")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();

    return logs.filter((log) => log.email === args.email);
  },
});
