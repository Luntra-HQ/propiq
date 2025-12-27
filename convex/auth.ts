/**
 * Authentication functions for PropIQ
 * Handles user signup, login, and profile management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import bcrypt from "bcryptjs";

// ============================================
// PASSWORD VALIDATION
// ============================================

const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
  'football', 'welcome', 'jesus', 'ninja', 'mustang', 'password1',
];

/**
 * Validate password strength (backend validation)
 * Throws error if password doesn't meet requirements
 */
function validatePasswordStrength(password: string): void {
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
  };

  if (!checks.length) {
    throw new Error("Password must be at least 12 characters long");
  }
  if (!checks.uppercase) {
    throw new Error("Password must contain at least one uppercase letter");
  }
  if (!checks.lowercase) {
    throw new Error("Password must contain at least one lowercase letter");
  }
  if (!checks.number) {
    throw new Error("Password must contain at least one number");
  }
  if (!checks.special) {
    throw new Error("Password must contain at least one special character (!@#$%^&*...)");
  }
  if (!checks.notCommon) {
    throw new Error("This password is too common. Please choose a stronger password");
  }
}

// Signup mutation - Create new user account
export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Normalize email to lowercase
    const email = args.email.toLowerCase().trim();

    // Validate password strength
    validatePasswordStrength(args.password);

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password using PBKDF2-SHA256
    const passwordHash = await hashPassword(args.password);

    // Create user with free tier defaults
    const userId = await ctx.db.insert("users", {
      email,
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      company: args.company,
      subscriptionTier: "free",
      analysesUsed: 0,
      analysesLimit: 3, // Free tier gets 3 analyses
      active: true,
      emailVerified: false,
      createdAt: Date.now(),
    });

    return {
      success: true,
      userId: userId.toString(),
      email,
      subscriptionTier: "free",
      analysesLimit: 3,
      message: "Account created successfully",
    };
  },
});

// Login mutation - Authenticate user
// Includes automatic migration from legacy SHA-256 to PBKDF2
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await verifyPassword(args.password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Check if account is active
    if (!user.active) {
      throw new Error("Account is inactive. Please contact support.");
    }

    const now = Date.now();

    // MIGRATION: If user has legacy SHA-256 hash, upgrade to PBKDF2
    if (isLegacyHash(user.passwordHash)) {
      console.log("[AUTH] Migrating password hash for user:", email);
      const newHash = await rehashPassword(args.password);
      await ctx.db.patch(user._id, {
        passwordHash: newHash,
        updatedAt: now,
      });
    }

    // Update last login timestamp
    await ctx.db.patch(user._id, {
      lastLogin: now,
      updatedAt: now,
    });

    return {
      success: true,
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionTier: user.subscriptionTier,
      analysesUsed: user.analysesUsed,
      analysesLimit: user.analysesLimit,
      message: "Login successful",
    };
  },
});

// Get user profile query (accepts Convex ID type)
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  },
});

/**
 * Access gate for paid features.
 *
 * NOTE: Frontend currently uses `subscriptionTier` + limits; this query is intended
 * for backend verification and chaos tests to prevent "paid user locked out"
 * scenarios during temporary webhook/reconciliation delays.
 */
export const hasActiveAccess = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return false;

    // Free users never have paid access.
    if (!user.subscriptionTier || user.subscriptionTier === "free") return false;

    const GRACE_PERIOD_MS = 15 * 60 * 1000;
    const now = Date.now();
    const lastVerified = user.lastVerifiedFromStripeAt ?? 0;

    // Active subscription always has access.
    if (!user.subscriptionStatus || user.subscriptionStatus === "active") return true;

    // Grace period: prevent immediate lockout while reconciliation catches up.
    return now - lastVerified <= GRACE_PERIOD_MS;
  },
});

// Get user by string ID - FIXES localStorage string → Convex ID type mismatch
// This is the query that should be used from the frontend
export const getUserById = query({
  args: { userIdString: v.string() },
  handler: async (ctx, args) => {
    try {
      // Validate and convert string to Convex ID
      const userId = ctx.db.normalizeId("users", args.userIdString);
      if (!userId) {
        console.log("[getUserById] Invalid ID format:", args.userIdString);
        return null;
      }

      const user = await ctx.db.get(userId);
      if (!user) {
        console.log("[getUserById] User not found for ID:", args.userIdString);
        return null;
      }

      // Return user data without password hash
      return {
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
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt,
      };
    } catch (e) {
      console.error("[getUserById] Error fetching user:", e);
      return null;
    }
  },
});

// Update user profile mutation
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  },
});

// ============================================
// SECURE PASSWORD HASHING (PBKDF2-SHA256)
// ============================================
//
// Uses Web Crypto API PBKDF2 which works in Convex's edge runtime
// - Random 16-byte salt per user
// - 600,000 iterations (OWASP 2023 recommendation)
// - 32-byte derived key
// - Format: $pbkdf2-sha256$v1$iterations$salt$hash
//
// Supports migration from old SHA-256 hashes

const PBKDF2_ITERATIONS = 600000; // ~100ms on server, OWASP recommended
const PBKDF2_SALT_LENGTH = 16; // 128 bits
const PBKDF2_KEY_LENGTH = 32; // 256 bits
const HASH_VERSION = "v1";

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate cryptographically secure random salt
 */
function generateSalt(): Uint8Array {
  const salt = new Uint8Array(PBKDF2_SALT_LENGTH);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Hash password using PBKDF2-SHA256
 * Returns formatted string: $pbkdf2-sha256$v1$iterations$salt$hash
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = generateSalt();

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH * 8 // bits
  );

  // Format: $pbkdf2-sha256$v1$iterations$salt$hash
  const saltB64 = arrayBufferToBase64(salt.buffer);
  const hashB64 = arrayBufferToBase64(derivedBits);

  return `$pbkdf2-sha256$${HASH_VERSION}$${PBKDF2_ITERATIONS}$${saltB64}$${hashB64}`;
}

/**
 * Verify password against stored hash
 * Supports both new PBKDF2 format and legacy SHA-256 (for migration)
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Check if it's a new PBKDF2 hash
  if (storedHash.startsWith("$pbkdf2-sha256$")) {
    return verifyPbkdf2Password(password, storedHash);
  }

  // Legacy SHA-256 hash (64 hex characters)
  if (storedHash.length === 64 && /^[a-f0-9]+$/.test(storedHash)) {
    return verifyLegacySha256Password(password, storedHash);
  }

  // Unknown format
  console.error("[AUTH] Unknown password hash format");
  return false;
}

/**
 * Verify password against PBKDF2 hash
 */
async function verifyPbkdf2Password(password: string, storedHash: string): Promise<boolean> {
  try {
    // Parse stored hash: $pbkdf2-sha256$v1$iterations$salt$hash
    const parts = storedHash.split("$");
    if (parts.length !== 6) {
      console.error("[AUTH] Invalid PBKDF2 hash format");
      return false;
    }

    const [, algo, version, iterationsStr, saltB64, hashB64] = parts;

    if (algo !== "pbkdf2-sha256") {
      console.error("[AUTH] Unknown algorithm:", algo);
      return false;
    }

    const iterations = parseInt(iterationsStr, 10);
    const salt = base64ToUint8Array(saltB64);
    const storedHashBytes = base64ToUint8Array(hashB64);

    // Hash the input password with the same salt
    const encoder = new TextEncoder();
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
        iterations: iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      storedHashBytes.length * 8
    );

    // Constant-time comparison to prevent timing attacks
    const derivedBytes = new Uint8Array(derivedBits);
    if (derivedBytes.length !== storedHashBytes.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < derivedBytes.length; i++) {
      result |= derivedBytes[i] ^ storedHashBytes[i];
    }

    return result === 0;
  } catch (e) {
    console.error("[AUTH] Error verifying PBKDF2 password:", e);
    return false;
  }
}

/**
 * Verify password against legacy SHA-256 hash
 * Used for migration - old users with SHA-256 hashes
 */
async function verifyLegacySha256Password(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "propiq_salt_2025"); // Old static salt
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Constant-time comparison
  if (computedHash.length !== storedHash.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < computedHash.length; i++) {
    result |= computedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Check if a stored hash is using the legacy SHA-256 format
 */
function isLegacyHash(storedHash: string): boolean {
  return storedHash.length === 64 && /^[a-f0-9]+$/.test(storedHash);
}

/**
 * Rehash a password with the new secure algorithm
 * Called during login for users with legacy hashes
 */
async function rehashPassword(password: string): Promise<string> {
  console.log("[AUTH] Rehashing password with PBKDF2");
  return hashPassword(password);
}

// ============================================
// PASSWORD RESET
// ============================================

/**
 * Generate a cryptographically secure reset token
 * Returns a 32-byte random hex string (64 characters)
 */
function generateResetToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Request password reset - creates a reset token
 * Returns token that needs to be sent via email
 * Token expires in 15 minutes
 */
export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return {
        success: true,
        message: "If an account exists with that email, a password reset link has been sent.",
      };
    }

    // Invalidate any existing reset tokens for this user
    const existingResets = await ctx.db
      .query("passwordResets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const reset of existingResets) {
      if (!reset.used) {
        await ctx.db.delete(reset._id);
      }
    }

    // Generate new reset token
    const token = generateResetToken();
    const now = Date.now();
    const expiresAt = now + 60 * 60 * 1000; // 1 hour (increased from 15 minutes for better UX)

    // Store reset token
    await ctx.db.insert("passwordResets", {
      userId: user._id,
      email: user.email,
      token,
      expiresAt,
      used: false,
      createdAt: now,
    });

    console.log("[AUTH] Password reset requested for:", email);

    return {
      success: true,
      token, // This will be sent via email by the HTTP endpoint
      email: user.email,
      expiresAt,
      message: "If an account exists with that email, a password reset link has been sent.",
    };
  },
});

/**
 * Reset password using a valid reset token
 * Validates token and updates user's password
 */
export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate password strength
    try {
      validatePasswordStrength(args.newPassword);
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    // Find reset token
    const resetToken = await ctx.db
      .query("passwordResets")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetToken) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    // Check if token has expired
    if (Date.now() > resetToken.expiresAt) {
      return { success: false, error: "Reset token has expired. Please request a new one." };
    }

    // Check if token has already been used
    if (resetToken.used) {
      return { success: false, error: "This reset token has already been used." };
    }

    // Get user
    const user = await ctx.db.get(resetToken.userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(args.newPassword);

    // Update user's password
    const now = Date.now();
    await ctx.db.patch(user._id, {
      passwordHash: newPasswordHash,
      updatedAt: now,
    });

    // Mark token as used
    await ctx.db.patch(resetToken._id, {
      used: true,
      usedAt: now,
    });

    // Invalidate all existing sessions for security
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    console.log("[AUTH] Password reset successful for:", user.email);

    return {
      success: true,
      message: "Password reset successful. Please log in with your new password.",
    };
  },
});

/**
 * Verify reset token validity (for frontend validation)
 */
export const verifyResetToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("passwordResets")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetToken) {
      return { valid: false, error: "Invalid reset token" };
    }

    if (Date.now() > resetToken.expiresAt) {
      return { valid: false, error: "Reset token has expired" };
    }

    if (resetToken.used) {
      return { valid: false, error: "Reset token has already been used" };
    }

    return {
      valid: true,
      email: resetToken.email,
      expiresAt: resetToken.expiresAt,
    };
  },
});

// ============================================
// SESSION-BASED AUTH (httpOnly cookie)
// ============================================

// Session duration: 30 days in milliseconds
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Generate a cryptographically secure session token
 */
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Login with server-side session (for HTTP endpoint)
 * Creates a session record and returns the token for cookie
 * Includes automatic migration from legacy SHA-256 to PBKDF2
 */
export const loginWithSession = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await verifyPassword(args.password, user.passwordHash);

    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check if account is active
    if (!user.active) {
      return { success: false, error: "Account is inactive. Please contact support." };
    }

    const now = Date.now();

    // MIGRATION: If user has legacy SHA-256 hash, upgrade to PBKDF2
    if (isLegacyHash(user.passwordHash)) {
      console.log("[AUTH] Migrating password hash for user:", email);
      const newHash = await rehashPassword(args.password);
      await ctx.db.patch(user._id, {
        passwordHash: newHash,
        updatedAt: now,
      });
    }

    // Create session - use _id as the token (matches validateSession logic)
    const sessionId = await ctx.db.insert("sessions", {
      userId: user._id,
      token: "", // Legacy field, kept for schema compatibility
      expiresAt: now + SESSION_DURATION_MS,
      userAgent: args.userAgent,
      createdAt: now,
      lastActivityAt: now,
    });

    // The session _id IS the token - this is what validateSession expects
    const sessionToken = sessionId.toString();

    // Update last login timestamp
    await ctx.db.patch(user._id, {
      lastLogin: now,
      updatedAt: now,
    });

    console.log("[AUTH] Login with session for user:", user.email, "token:", sessionToken);

    return {
      success: true,
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
 * Signup with server-side session (for HTTP endpoint)
 * Creates user and session, returns token for cookie
 */
export const signupWithSession = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Validate password strength
    try {
      validatePasswordStrength(args.password);
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const passwordHash = await hashPassword(args.password);

    // Create user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email,
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      company: args.company,
      subscriptionTier: "free",
      analysesUsed: 0,
      analysesLimit: 3,
      active: true,
      emailVerified: false,
      createdAt: now,
      lastLogin: now,
    });

    // Create session - use _id as the token (matches validateSession logic)
    const sessionId = await ctx.db.insert("sessions", {
      userId,
      token: "", // Legacy field, kept for schema compatibility
      expiresAt: now + SESSION_DURATION_MS,
      userAgent: args.userAgent,
      createdAt: now,
      lastActivityAt: now,
    });

    // The session _id IS the token - this is what validateSession expects
    const sessionToken = sessionId.toString();

    console.log("[AUTH] Signup with session for user:", email, "token:", sessionToken);

    return {
      success: true,
      sessionToken,
      user: {
        _id: userId,
        email,
        firstName: args.firstName,
        lastName: args.lastName,
        company: args.company,
        subscriptionTier: "free",
        analysesUsed: 0,
        analysesLimit: 3,
        active: true,
        emailVerified: false,
      },
    };
  },
});


/**
 * Query: Get user by email
 * Used by Stripe webhook to find user and update subscription
 */
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    return user;
  },
});

/**
 * Mutation: Update user subscription tier
 * Called by Stripe webhook after successful payment
 */
export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    tier: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, tier, stripeCustomerId, stripeSubscriptionId } = args;
    
    // Get current user to determine new limits
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Set analyses limit based on tier (UNLIMITED for all paid tiers)
    const tierLimits: Record<string, number> = {
      free: 3,
      starter: 999999, // UNLIMITED
      pro: 999999, // UNLIMITED
      elite: 999999, // UNLIMITED
    };

    const analysesLimit = tierLimits[tier] || 3;
    
    // Update user with new subscription
    await ctx.db.patch(userId, {
      subscriptionTier: tier,
      analysesLimit,
      stripeCustomerId,
      stripeSubscriptionId,
    });
    
    console.log(`[AUTH] Updated subscription for user ${user.email} to ${tier} (limit: ${analysesLimit})`);
    
    return {
      success: true,
      user: {
        ...user,
        subscriptionTier: tier,
        analysesLimit,
      },
    };
  },
});

/**
 * Mutation: Reset monthly usage
 * Called by cron job to reset usage counts at start of billing cycle
 */
export const resetMonthlyUsage = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      analysesUsed: 0,
    });

    console.log(`[AUTH] Reset usage for user ${args.userId}`);

    return { success: true };
  },
});

/**
 * Change user password
 * Requires current password for verification
 */
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      args.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password (basic check - more validation on frontend)
    if (args.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long");
    }

    if (args.currentPassword === args.newPassword) {
      throw new Error("New password must be different from current password");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(args.newPassword, salt);

    // Update password
    await ctx.db.patch(args.userId, {
      passwordHash: newPasswordHash,
      updatedAt: Date.now(),
    });

    console.log(`[AUTH] Password changed for user ${args.userId}`);

    return {
      success: true,
      message: "Password changed successfully",
    };
  },
});
