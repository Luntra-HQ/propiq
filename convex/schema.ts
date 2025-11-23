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

  // ============================================================================
  // PILLAR 3: INTELLIGENCE LAYER - Portfolio Tracking & Deal Alerts
  // ============================================================================

  // Saved Properties - Properties users want to track/watch
  savedProperties: defineTable({
    userId: v.string(),

    // Property info
    address: v.string(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),

    // Current valuation (can be updated)
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    monthlyRent: v.optional(v.number()),

    // Status
    status: v.string(), // "watching" | "owned" | "under_contract" | "sold"
    propertyType: v.optional(v.string()),

    // Related analysis
    analysisId: v.optional(v.string()),
    dealScore: v.optional(v.number()),

    // User notes
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    // Dates
    purchaseDate: v.optional(v.number()),
    saleDate: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_address", ["address"]),

  // Portfolio Snapshots - Historical portfolio value tracking
  portfolioSnapshots: defineTable({
    userId: v.string(),

    // Snapshot date (daily/weekly/monthly)
    snapshotDate: v.number(),
    snapshotType: v.string(), // "daily" | "weekly" | "monthly"

    // Aggregated values
    totalProperties: v.number(),
    totalValue: v.number(),
    totalEquity: v.number(),
    totalMonthlyIncome: v.number(),
    totalMonthlyExpenses: v.number(),
    totalCashFlow: v.number(),

    // Performance metrics
    avgCapRate: v.optional(v.number()),
    avgCashOnCash: v.optional(v.number()),
    portfolioScore: v.optional(v.number()), // 0-100

    // Breakdown by status
    ownedCount: v.number(),
    watchingCount: v.number(),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "snapshotDate"])
    .index("by_user_and_type", ["userId", "snapshotType"]),

  // Deal Alerts - Saved search criteria for notifications
  dealAlerts: defineTable({
    userId: v.string(),
    userEmail: v.string(),

    // Alert name and status
    name: v.string(),
    isActive: v.boolean(),

    // Search criteria
    cities: v.optional(v.array(v.string())),
    states: v.optional(v.array(v.string())),
    zipCodes: v.optional(v.array(v.string())),

    // Price range
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),

    // Deal criteria
    minDealScore: v.optional(v.number()), // Minimum deal score (0-100)
    minCapRate: v.optional(v.number()),
    minCashFlow: v.optional(v.number()),
    propertyTypes: v.optional(v.array(v.string())),

    // Notification settings
    notifyEmail: v.boolean(),
    notifyInApp: v.boolean(),
    frequency: v.string(), // "instant" | "daily" | "weekly"

    // Stats
    matchCount: v.number(),
    lastMatchAt: v.optional(v.number()),
    lastNotifiedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_active", ["isActive"]),

  // Alert Matches - Properties that matched deal alerts
  alertMatches: defineTable({
    alertId: v.id("dealAlerts"),
    userId: v.string(),

    // Matched property
    analysisId: v.string(),
    address: v.string(),
    dealScore: v.number(),
    capRate: v.optional(v.number()),
    cashFlow: v.optional(v.number()),

    // Match status
    status: v.string(), // "new" | "viewed" | "saved" | "dismissed"
    notified: v.boolean(),

    // Timestamps
    matchedAt: v.number(),
    viewedAt: v.optional(v.number()),
  })
    .index("by_alert", ["alertId"])
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),

  // User Notifications - In-app notification system
  notifications: defineTable({
    userId: v.string(),

    // Notification content
    type: v.string(), // "deal_alert" | "share_view" | "comment" | "system"
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),

    // Related entities
    relatedId: v.optional(v.string()),
    relatedType: v.optional(v.string()),

    // Status
    isRead: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"])
    .index("by_user_and_type", ["userId", "type"]),
});
