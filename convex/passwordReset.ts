/**
 * Password Reset Functions for PropIQ
 *
 * Handles forgot password flow:
 * 1. User requests password reset with email
 * 2. System generates secure token, stores hash, returns plaintext for email
 * 3. User clicks link with token
 * 4. System validates token and allows password reset
 * 5. Password is updated, all sessions invalidated, new session created
 *
 * Security measures:
 * - 64-byte cryptographically random tokens
 * - Only SHA-256 hash stored in database
 * - 1-hour expiration
 * - Single-use tokens
 * - Rate limiting (max 3 requests per email per hour)
 * - All sessions invalidated on password reset
 */

import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Token expiration: 1 hour in milliseconds
const TOKEN_EXPIRATION_MS = 60 * 60 * 1000;

// Rate limit: max requests per email in the rate limit window
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Session duration for auto-login after reset
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a cryptographically secure 64-byte token
 * Returns hex string (128 characters)
 */
function generateResetToken(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hash a token using SHA-256 for storage
 * Never store plaintext tokens in the database
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================
// PASSWORD HASHING (duplicated from auth.ts for module isolation)
// ============================================

const PBKDF2_ITERATIONS = 600000;
const PBKDF2_SALT_LENGTH = 16;
const PBKDF2_KEY_LENGTH = 32;
const HASH_VERSION = "v1";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function generateSalt(): Uint8Array {
  const salt = new Uint8Array(PBKDF2_SALT_LENGTH);
  crypto.getRandomValues(salt);
  return salt;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = generateSalt();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH * 8
  );

  const saltB64 = arrayBufferToBase64(salt.buffer);
  const hashB64 = arrayBufferToBase64(derivedBits);

  return `$pbkdf2-sha256$${HASH_VERSION}$${PBKDF2_ITERATIONS}$${saltB64}$${hashB64}`;
}

// ============================================
// MUTATIONS & QUERIES
// ============================================

/**
 * Request a password reset
 *
 * - Looks up user by email
 * - Checks rate limit
 * - Invalidates any existing tokens for this user
 * - Generates new token and stores hash
 * - Returns the plaintext token (to be sent via email)
 *
 * IMPORTANT: Returns success even if email doesn't exist (prevents enumeration)
 */
export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const now = Date.now();

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    // Always return success to prevent email enumeration
    // But only actually create token if user exists
    if (!user) {
      console.log("[PASSWORD_RESET] Reset requested for non-existent email:", email);
      return {
        success: true,
        message: "If an account exists with this email, you will receive a reset link.",
      };
    }

    // Check if account is active
    if (!user.active) {
      console.log("[PASSWORD_RESET] Reset requested for inactive account:", email);
      return {
        success: true,
        message: "If an account exists with this email, you will receive a reset link.",
      };
    }

    // Rate limiting: check recent requests for this user
    const recentTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gt(q.field("createdAt"), now - RATE_LIMIT_WINDOW_MS))
      .collect();

    if (recentTokens.length >= RATE_LIMIT_MAX_REQUESTS) {
      console.log("[PASSWORD_RESET] Rate limit exceeded for:", email);
      return {
        success: false,
        error: "Too many reset requests. Please try again in an hour.",
      };
    }

    // Invalidate any existing unused tokens for this user
    const existingTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("used"), false))
      .collect();

    for (const token of existingTokens) {
      await ctx.db.patch(token._id, { used: true });
    }

    // Generate new token
    const plainToken = generateResetToken();
    const tokenHash = await hashToken(plainToken);

    // Store token hash (never the plaintext!)
    await ctx.db.insert("passwordResetTokens", {
      userId: user._id,
      tokenHash,
      expiresAt: now + TOKEN_EXPIRATION_MS,
      used: false,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: now,
    });

    console.log("[PASSWORD_RESET] Token created for user:", email);

    return {
      success: true,
      message: "If an account exists with this email, you will receive a reset link.",
      // Only return these for internal use (sending email)
      _internal: {
        token: plainToken,
        email: user.email,
        firstName: user.firstName || "there",
      },
    };
  },
});

/**
 * Validate a password reset token
 *
 * Used to check if token is valid before showing reset form
 * Returns user email (masked) if valid, null if invalid
 */
export const validateResetToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token || args.token.length !== 128) {
      return null;
    }

    const now = Date.now();
    const tokenHash = await hashToken(args.token);

    // Find token by hash
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .first();

    if (!resetToken) {
      console.log("[PASSWORD_RESET] Token not found");
      return null;
    }

    // Check if token is expired
    if (resetToken.expiresAt < now) {
      console.log("[PASSWORD_RESET] Token expired");
      return null;
    }

    // Check if token was already used
    if (resetToken.used) {
      console.log("[PASSWORD_RESET] Token already used");
      return null;
    }

    // Get user info
    const user = await ctx.db.get(resetToken.userId);
    if (!user || !user.active) {
      return null;
    }

    // Return masked email for display (e.g., "j***@example.com")
    const emailParts = user.email.split("@");
    const localPart = emailParts[0];
    const maskedLocal = localPart.charAt(0) + "***";
    const maskedEmail = maskedLocal + "@" + emailParts[1];

    return {
      valid: true,
      email: maskedEmail,
      expiresAt: resetToken.expiresAt,
    };
  },
});

/**
 * Reset password using a valid token
 *
 * - Validates token
 * - Updates password with new PBKDF2 hash
 * - Marks token as used
 * - Deletes ALL user sessions (security measure)
 * - Creates new session for auto-login
 */
export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token || args.token.length !== 128) {
      return { success: false, error: "Invalid reset token" };
    }

    // Validate password requirements
    if (args.newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" };
    }
    if (args.newPassword.length > 128) {
      return { success: false, error: "Password must be less than 128 characters" };
    }
    if (!/[A-Z]/.test(args.newPassword)) {
      return { success: false, error: "Password must contain an uppercase letter" };
    }
    if (!/[a-z]/.test(args.newPassword)) {
      return { success: false, error: "Password must contain a lowercase letter" };
    }
    if (!/[0-9]/.test(args.newPassword)) {
      return { success: false, error: "Password must contain a number" };
    }

    const now = Date.now();
    const tokenHash = await hashToken(args.token);

    // Find token by hash
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .first();

    if (!resetToken) {
      return { success: false, error: "Invalid or expired reset link" };
    }

    // Check if token is expired
    if (resetToken.expiresAt < now) {
      return { success: false, error: "Reset link has expired. Please request a new one." };
    }

    // Check if token was already used
    if (resetToken.used) {
      return { success: false, error: "This reset link has already been used" };
    }

    // Get user
    const user = await ctx.db.get(resetToken.userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.active) {
      return { success: false, error: "Account is inactive. Please contact support." };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(args.newPassword);

    // Update user password
    await ctx.db.patch(user._id, {
      passwordHash: newPasswordHash,
      updatedAt: now,
    });

    // Mark token as used
    await ctx.db.patch(resetToken._id, { used: true });

    // Delete ALL sessions for this user (security measure)
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    console.log("[PASSWORD_RESET] Password reset for user:", user.email, "- deleted", sessions.length, "sessions");

    // Create new session for auto-login
    const sessionId = await ctx.db.insert("sessions", {
      userId: user._id,
      token: "", // Legacy field
      expiresAt: now + SESSION_DURATION_MS,
      userAgent: args.userAgent,
      createdAt: now,
      lastActivityAt: now,
    });

    const sessionToken = sessionId.toString();

    return {
      success: true,
      message: "Password reset successfully",
      sessionToken,
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
      },
    };
  },
});

/**
 * Cleanup expired password reset tokens
 * Run periodically via cron job
 */
export const cleanupExpiredTokens = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find expired tokens
    const expiredTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_expires")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    for (const token of expiredTokens) {
      await ctx.db.delete(token._id);
    }

    console.log("[PASSWORD_RESET] Cleaned up expired tokens:", expiredTokens.length);

    return { deletedCount: expiredTokens.length };
  },
});
