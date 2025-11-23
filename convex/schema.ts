/**
 * Convex Database Schema for PropIQ
 * Defines all tables and indexes for the application
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - Core user data and subscription info
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),

    // Subscription & limits
    subscriptionTier: v.string(), // "free" | "starter" | "pro" | "elite"
    analysesUsed: v.number(),
    analysesLimit: v.number(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),

    // Account status
    active: v.boolean(),
    emailVerified: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    lastLogin: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  // Property analyses - AI-powered property analysis results
  propertyAnalyses: defineTable({
    userId: v.id("users"),

    // Property details
    address: v.string(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),

    // Financial inputs
    purchasePrice: v.optional(v.number()),
    downPayment: v.optional(v.number()),
    monthlyRent: v.optional(v.number()),

    // AI Analysis result (JSON)
    analysisResult: v.string(),
    aiRecommendation: v.string(),
    dealScore: v.number(), // 0-100

    // Metadata
    model: v.string(), // "gpt-4o-mini"
    tokensUsed: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "createdAt"]),

  // Support chat conversations
  supportChats: defineTable({
    userId: v.id("users"),
    conversationId: v.string(),

    // Messages array
    messages: v.array(
      v.object({
        role: v.string(), // "user" | "assistant"
        content: v.string(),
        timestamp: v.number(),
      })
    ),

    // Status
    status: v.string(), // "open" | "closed"

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_conversation", ["conversationId"]),

  // Stripe events - Track webhook events for debugging
  stripeEvents: defineTable({
    eventId: v.string(),
    eventType: v.string(),
    customerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    status: v.string(), // "processing" | "completed" | "failed"
    error: v.optional(v.string()),
    rawData: v.string(), // JSON string of full event
    createdAt: v.number(),
  }).index("by_event_id", ["eventId"]),

  // Sessions table - Server-side session management with httpOnly cookies
  // This replaces localStorage-based auth for proper security
  sessions: defineTable({
    userId: v.id("users"),

    // Session token (stored in httpOnly cookie, NOT the session _id)
    token: v.string(),

    // Expiration times:
    // - expiresAt: 30 days idle timeout (resets on activity)
    // - absoluteExpiresAt: 1 year max (never extends, forces re-auth)
    expiresAt: v.number(),
    absoluteExpiresAt: v.optional(v.number()), // Optional for backward compatibility

    // Metadata for security/debugging
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    lastActivityAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"])
    .index("by_expires", ["expiresAt"]),

  // Property Images cache - Stores fetched property images
  // Used to reduce API calls and improve performance
  propertyImages: defineTable({
    // Address hash for efficient lookup
    addressHash: v.string(),
    address: v.string(),
    formattedAddress: v.optional(v.string()),

    // Geocoding results
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    placeId: v.optional(v.string()),

    // Image URLs (from Google Street View, satellite, etc.)
    images: v.array(
      v.object({
        url: v.string(),
        type: v.string(), // "street_view" | "satellite" | "hybrid"
        width: v.number(),
        height: v.number(),
        heading: v.optional(v.number()),
        source: v.string(),
      })
    ),

    // Cache metadata
    fetchedAt: v.number(),
    expiresAt: v.number(),
    source: v.string(), // "google" | "bing" | "placeholder"
  })
    .index("by_address_hash", ["addressHash"])
    .index("by_expires", ["expiresAt"]),

  // ============================================================================
  // PILLAR 2: NETWORK EFFECTS - Deal Sharing & Collaboration
  // ============================================================================

  // Shared Analyses - Allows users to share deals via link or with specific users
  sharedAnalyses: defineTable({
    // The analysis being shared
    analysisId: v.string(), // ID from property_analyses table in Supabase
    ownerId: v.string(), // User ID who owns the analysis

    // Share settings
    shareToken: v.string(), // Unique token for public link sharing
    shareType: v.string(), // "public" | "private" | "team"

    // Access control
    allowedEmails: v.optional(v.array(v.string())), // Emails with access (for private shares)
    teamId: v.optional(v.string()), // Team ID (for team shares)

    // Permissions
    canComment: v.boolean(),
    canExport: v.boolean(),

    // Share metadata
    title: v.optional(v.string()), // Custom title for shared view
    description: v.optional(v.string()), // Owner's notes about the deal

    // Expiration
    expiresAt: v.optional(v.number()), // Optional expiration timestamp

    // Analytics
    viewCount: v.number(),
    lastViewedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_share_token", ["shareToken"])
    .index("by_analysis", ["analysisId"])
    .index("by_owner", ["ownerId"])
    .index("by_team", ["teamId"]),

  // Analysis Comments - Collaborative comments on shared analyses
  analysisComments: defineTable({
    // Reference to shared analysis or direct analysis
    sharedAnalysisId: v.optional(v.id("sharedAnalyses")),
    analysisId: v.string(), // Direct reference to analysis

    // Comment author
    authorId: v.string(), // User ID
    authorEmail: v.string(),
    authorName: v.optional(v.string()),

    // Comment content
    content: v.string(),

    // Threading (for replies)
    parentCommentId: v.optional(v.id("analysisComments")),

    // Status
    isEdited: v.boolean(),
    isDeleted: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_analysis", ["analysisId"])
    .index("by_shared_analysis", ["sharedAnalysisId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentCommentId"]),

  // Teams - For team-based collaboration
  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),

    // Owner/admin
    ownerId: v.string(),

    // Team settings
    isPublic: v.boolean(), // Can be discovered by others
    inviteCode: v.optional(v.string()), // For invite-only teams

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_invite_code", ["inviteCode"]),

  // Team Members - Junction table for team membership
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.string(),
    userEmail: v.string(),

    // Role
    role: v.string(), // "owner" | "admin" | "member" | "viewer"

    // Status
    status: v.string(), // "active" | "invited" | "removed"
    invitedBy: v.optional(v.string()),

    // Timestamps
    joinedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_and_user", ["teamId", "userId"]),
});
