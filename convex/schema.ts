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
    subscriptionStatus: v.optional(v.string()), // Stripe subscription status
    // When we last verified subscription state from Stripe (webhook or reconciliation)
    lastVerifiedFromStripeAt: v.optional(v.number()),
    // Billing period end (ms since epoch) when known
    currentPeriodEnd: v.optional(v.number()),
    analysesUsed: v.number(),
    analysesLimit: v.number(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),

    // Cancellation tracking
    cancellationReason: v.optional(v.string()),
    cancellationFeedback: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),

    // Tier change history
    previousTier: v.optional(v.string()),

    // Referral program
    referralCode: v.optional(v.string()), // Unique code like "BRIAN-A1B2"
    referredBy: v.optional(v.id("users")), // User who referred them
    referralRewardClaimed: v.optional(v.boolean()), // Has referrer been rewarded?

    // Account status
    active: v.boolean(),
    emailVerified: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    lastLogin: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_referral_code", ["referralCode"]),

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

  // Password reset tokens - Temporary tokens for password reset flow
  passwordResets: defineTable({
    userId: v.id("users"),
    email: v.string(),

    // Reset token (cryptographically secure random string)
    token: v.string(),

    // Expiration (15 minutes from creation)
    expiresAt: v.number(),

    // Status tracking
    used: v.boolean(),
    usedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_user", ["userId"]),

  // Knowledge base articles - Help center content
  articles: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly identifier (e.g., "how-to-analyze-property")
    content: v.string(), // Markdown content
    excerpt: v.string(), // Short summary for search results
    category: v.string(), // "getting-started" | "property-analysis" | "calculator" | "troubleshooting" | "billing" | "advanced" | "education"
    tags: v.array(v.string()), // ["address", "analysis", "error"] for better search

    // Analytics
    viewCount: v.number(),
    helpfulVotes: v.number(),
    unhelpfulVotes: v.number(),

    // Publishing
    published: v.boolean(),
    featured: v.boolean(), // Show in top results

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_published", ["published"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["category", "published"],
    })
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["category", "published"],
    }),

  // Article feedback - Track helpful/unhelpful votes
  articleFeedback: defineTable({
    articleId: v.id("articles"),
    userId: v.id("users"),
    vote: v.number(), // 1 = helpful, -1 = unhelpful
    comment: v.optional(v.string()), // Optional feedback comment
    createdAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_user", ["userId"])
    .index("by_article_and_user", ["articleId", "userId"]),

  // Failed searches - Track searches with no results
  failedSearches: defineTable({
    query: v.string(),
    userId: v.optional(v.id("users")),
    page: v.optional(v.string()), // Where user was when searching
    resultsCount: v.number(), // 0 for failed searches
    createdAt: v.number(),
  })
    .index("by_query", ["query"])
    .index("by_date", ["createdAt"]),

  // User onboarding progress - Track checklist completion
  onboardingProgress: defineTable({
    userId: v.id("users"),

    // 7 onboarding tasks
    analyzedFirstProperty: v.boolean(),
    exploredCalculator: v.boolean(),
    triedScenarios: v.boolean(),
    readKeyMetricsArticle: v.boolean(),
    setInvestmentCriteria: v.boolean(),
    exportedReport: v.boolean(),
    analyzedThreeProperties: v.boolean(),

    // Tour completion
    completedProductTour: v.boolean(),
    tourStep: v.optional(v.number()),

    // Checklist state
    checklistDismissed: v.boolean(),
    checklistCompletedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Support tickets - For human escalation from AI chat
  supportTickets: defineTable({
    userId: v.id("users"),
    conversationId: v.string(), // Links to supportChats

    // Ticket details
    subject: v.string(),
    priority: v.string(), // "low" | "medium" | "high" | "urgent"
    status: v.string(), // "open" | "in_progress" | "waiting_on_user" | "resolved" | "closed"
    category: v.string(), // "billing" | "technical" | "feature_request" | "bug" | "other"

    // Assignment
    assignedTo: v.optional(v.string()), // Support agent email/ID

    // Satisfaction
    satisfactionRating: v.optional(v.number()), // 1-5 stars
    satisfactionComment: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_conversation", ["conversationId"])
    .index("by_assigned", ["assignedTo"]),

  // NPS responses - Net Promoter Score surveys
  npsResponses: defineTable({
    userId: v.id("users"),
    score: v.number(), // 0-10
    reason: v.optional(v.string()), // Why they gave this score
    subscriptionTier: v.string(), // Tier at time of response
    daysSinceSignup: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_score", ["score"])
    .index("by_date", ["createdAt"]),

  // Audit logs - Track sensitive admin operations for security/compliance
  audit_logs: defineTable({
    action: v.string(), // "admin_password_reset" | "admin_user_delete" | etc.
    userId: v.optional(v.id("users")), // User being acted upon
    adminId: v.optional(v.string()), // Admin performing action (from CLI auth)
    email: v.optional(v.string()), // Email for easier tracking
    timestamp: v.number(),
    metadata: v.optional(v.any()), // Additional context (old values, etc.)
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_user", ["userId"]),

  // Email logs - Track onboarding and marketing emails
  emailLogs: defineTable({
    userId: v.id("users"),
    emailType: v.string(), // "onboarding_day_1" | "onboarding_day_2" | etc.
    sentAt: v.number(),
    resendId: v.optional(v.string()), // Resend email ID for tracking
    opened: v.boolean(),
    clicked: v.boolean(),
    openedAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["emailType"])
    .index("by_sent_date", ["sentAt"]),

  // Referrals - Track referral relationships and rewards
  referrals: defineTable({
    referrerId: v.id("users"), // User who referred
    referredId: v.id("users"), // User who was referred
    referralCode: v.string(), // Code that was used
    status: v.string(), // "pending" | "converted" | "rewarded"

    // Reward tracking
    rewardGranted: v.boolean(), // Has the referrer been rewarded?
    rewardGrantedAt: v.optional(v.number()),
    rewardType: v.optional(v.string()), // "1_month_free" | "discount" | etc.
    stripeCouponId: v.optional(v.string()), // Stripe coupon ID if applicable

    // Timestamps
    createdAt: v.number(), // When referral link was clicked
    convertedAt: v.optional(v.number()), // When referred user subscribed
  })
    .index("by_referrer", ["referrerId"])
    .index("by_referred", ["referredId"])
    .index("by_status", ["status"])
    .index("by_code", ["referralCode"]),

  // Cancellations - Track subscription cancellations for analytics
  cancellations: defineTable({
    userId: v.id("users"),
    reason: v.string(), // "too_expensive" | "not_enough_value" | "switching_competitor" | "pause_investing" | "missing_features" | "other"
    reasonText: v.optional(v.string()), // Additional feedback text
    tier: v.string(), // Subscription tier at time of cancellation
    mrr: v.number(), // Monthly recurring revenue lost
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["createdAt"])
    .index("by_reason", ["reason"]),
});
