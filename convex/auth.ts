/**
 * Authentication functions for PropIQ
 * Handles user signup, login, and profile management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password (simple hash for now - will upgrade to bcrypt)
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

    // Update last login timestamp
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
      updatedAt: Date.now(),
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

// Get user profile query
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

// Get user by email query (for checking if user exists)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return null;
    }

    // Return minimal user data (for existence check)
    return {
      userId: user._id.toString(),
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    };
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

// Simple password hashing (will be replaced with bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "propiq_salt_2025"); // Static salt for now
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
