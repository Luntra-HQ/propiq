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
    analysesUsed: v.number(),
    analysesLimit: v.number(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),

    // Account status
    active: v.boolean(),
    emailVerified: v.boolean(),

    // Onboarding email tracking
    onboardingDay0Sent: v.optional(v.boolean()),
    onboardingDay0SentAt: v.optional(v.number()),
    onboardingDay1Sent: v.optional(v.boolean()),
    onboardingDay1SentAt: v.optional(v.number()),
    onboardingDay3Sent: v.optional(v.boolean()),
    onboardingDay3SentAt: v.optional(v.number()),
    onboardingDay7Sent: v.optional(v.boolean()),
    onboardingDay7SentAt: v.optional(v.number()),

    // Referral system (optional)
    referralCode: v.optional(v.string()),

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

    // Property images stored in AWS S3
    images: v.optional(v.array(v.object({
      s3Key: v.string(),              // S3 object key (e.g., "properties/userId/timestamp-random.jpg")
      s3Url: v.string(),               // Full S3 URL for display
      filename: v.string(),            // Original filename
      size: v.number(),                // File size in bytes
      mimeType: v.string(),            // e.g., "image/jpeg"
      uploadedAt: v.number(),          // Timestamp
      width: v.optional(v.number()),   // Image dimensions (optional)
      height: v.optional(v.number()),
    }))),

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

  // Email verification tokens - For verifying user email addresses on signup
  emailVerifications: defineTable({
    userId: v.id("users"),
    email: v.string(),

    // Verification token (cryptographically secure random string)
    token: v.string(),

    // Expiration (24 hours from creation)
    expiresAt: v.number(),

    // Status tracking
    verified: v.boolean(),
    verifiedAt: v.optional(v.number()),

    // Resend tracking (prevent abuse)
    resendCount: v.number(), // Track how many times verification was resent
    lastResendAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_user", ["userId"])
    .index("by_user_unverified", ["userId", "verified"]),

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

  // Lead captures - Track lead magnet downloads and nurture sequence
  leadCaptures: defineTable({
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),

    // Lead source tracking
    leadMagnetType: v.string(), // "real-estate-checklist" | "deal-analyzer-guide" | etc.
    source: v.optional(v.string()), // "landing-page" | "blog-post" | "formspree"

    // UTM tracking for attribution
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    utmContent: v.optional(v.string()),
    utmTerm: v.optional(v.string()),

    // Conversion tracking
    status: v.string(), // "captured" | "nurtured_day3" | "nurtured_day7" | "converted_trial" | "converted_paid"
    userId: v.optional(v.id("users")), // Linked when user signs up
    convertedAt: v.optional(v.number()), // When they became a trial/paid user

    // Email nurture tracking
    day3EmailSent: v.boolean(),
    day3EmailSentAt: v.optional(v.number()),
    day7EmailSent: v.boolean(),
    day7EmailSentAt: v.optional(v.number()),

    // Engagement tracking
    emailOpened: v.boolean(),
    emailClicked: v.boolean(),
    lastEngagementAt: v.optional(v.number()),

    // Timestamps
    capturedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_captured_date", ["capturedAt"])
    .index("by_status_and_date", ["status", "capturedAt"]),
});
