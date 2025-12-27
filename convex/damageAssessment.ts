/**
 * Damage Assessment Queries for PropIQ Stripe Webhook Investigation
 * Run these in Convex Dashboard to check for issues identified by Grok intelligence
 *
 * Triggered by: X/Twitter community reports of Stripe webhook reliability issues
 * Date: December 19, 2025
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * ASSESSMENT 1: Find Duplicate Stripe Events
 *
 * Checks if any Stripe webhook events were processed multiple times.
 * This would indicate the idempotency protection failed.
 *
 * Expected: duplicateCount = 0
 * Warning: duplicateCount > 0 (investigate)
 * Critical: duplicateCount > 5 (systemic issue)
 */
export const findDuplicateStripeEvents = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("stripeEvents").collect();

    // Group by eventId
    const eventCounts = new Map<string, number>();
    const eventDetails = new Map<string, any[]>();

    events.forEach(event => {
      const count = eventCounts.get(event.eventId) || 0;
      eventCounts.set(event.eventId, count + 1);

      const details = eventDetails.get(event.eventId) || [];
      details.push({
        _id: event._id,
        eventType: event.eventType,
        status: event.status,
        createdAt: new Date(event.createdAt).toISOString(),
        customerId: event.customerId,
      });
      eventDetails.set(event.eventId, details);
    });

    // Find duplicates
    const duplicates = Array.from(eventCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([eventId, count]) => ({
        eventId,
        count,
        occurrences: eventDetails.get(eventId)
      }));

    // Analyze impact
    const duplicatesByType = new Map<string, number>();
    duplicates.forEach(dup => {
      const eventType = dup.occurrences![0].eventType;
      const count = duplicatesByType.get(eventType) || 0;
      duplicatesByType.set(eventType, count + 1);
    });

    return {
      summary: {
        totalEvents: events.length,
        uniqueEvents: eventCounts.size,
        duplicateCount: duplicates.length,
        duplicatePercentage: ((duplicates.length / events.length) * 100).toFixed(2) + "%"
      },
      duplicates: duplicates,
      duplicatesByType: Array.from(duplicatesByType.entries()).map(([type, count]) => ({
        eventType: type,
        duplicateCount: count
      })),
      assessment: duplicates.length === 0
        ? "✅ SAFE: No duplicate events found"
        : duplicates.length < 5
        ? "⚠️ WARNING: Some duplicates found, investigate"
        : "🔴 CRITICAL: Systemic duplicate processing detected"
    };
  },
});

/**
 * ASSESSMENT 2: Find Paid Users Without Access
 *
 * Identifies users who have Stripe customer/subscription IDs (indicating payment)
 * but are still on the free tier (indicating webhook processing failed).
 *
 * This is the "paid but locked out" bug mentioned in Grok's intelligence.
 *
 * Expected: affectedCount = 0
 * Warning: affectedCount = 1-2 (isolated incidents)
 * Critical: affectedCount > 2 (systemic failure)
 */
export const findPaidUsersWithoutAccess = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    // Category 1: Has Stripe customer ID but still on free tier
    const paidButFree = users.filter(user =>
      user.stripeCustomerId &&
      user.subscriptionTier === "free"
    );

    // Category 2: Has active subscription ID but wrong tier
    const activeButWrongTier = users.filter(user =>
      user.stripeSubscriptionId &&
      user.subscriptionTier === "free"
    );

    // Category 3: Has subscription ID but subscription status indicates problem
    const statusMismatch = users.filter(user =>
      user.stripeSubscriptionId &&
      user.subscriptionStatus &&
      user.subscriptionStatus !== "active" &&
      user.subscriptionTier !== "free"
    );

    // Get payment history from Stripe events for affected users
    const affectedUserIds = new Set([
      ...paidButFree.map(u => u._id),
      ...activeButWrongTier.map(u => u._id)
    ]);

    const allEvents = await ctx.db.query("stripeEvents").collect();

    const enrichedUsers = await Promise.all(
      [...affectedUserIds].map(async (userId) => {
        const user = users.find(u => u._id === userId);
        if (!user) return null;

        // Find related Stripe events
        const relatedEvents = allEvents.filter(e =>
          e.customerId === user.stripeCustomerId
        );

        return {
          userId: user._id,
          email: user.email,
          subscriptionTier: user.subscriptionTier,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          subscriptionStatus: user.subscriptionStatus,
          createdAt: new Date(user.createdAt).toISOString(),
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : null,
          analysesUsed: user.analysesUsed,
          analysesLimit: user.analysesLimit,
          relatedStripeEvents: relatedEvents.length,
          lastStripeEvent: relatedEvents.length > 0
            ? {
                type: relatedEvents[relatedEvents.length - 1].eventType,
                status: relatedEvents[relatedEvents.length - 1].status,
                date: new Date(relatedEvents[relatedEvents.length - 1].createdAt).toISOString()
              }
            : null
        };
      })
    );

    const validEnrichedUsers = enrichedUsers.filter(u => u !== null);

    const totalAffected = validEnrichedUsers.length;

    return {
      summary: {
        totalUsers: users.length,
        paidUsers: users.filter(u => u.subscriptionTier !== "free").length,
        freeUsers: users.filter(u => u.subscriptionTier === "free").length,
        affectedCount: totalAffected,
        categories: {
          paidButFree: paidButFree.length,
          activeButWrongTier: activeButWrongTier.length,
          statusMismatch: statusMismatch.length
        }
      },
      affectedUsers: validEnrichedUsers,
      assessment: totalAffected === 0
        ? "✅ SAFE: No users with payment/access mismatch"
        : totalAffected <= 2
        ? "⚠️ WARNING: Some users affected, manual intervention needed"
        : "🔴 CRITICAL: Systemic failure, immediate action required",
      actionRequired: totalAffected > 0
        ? [
            "1. Verify each user's subscription status in Stripe dashboard",
            "2. Manually update subscriptionTier in Convex if payment verified",
            "3. Notify affected users and offer apology credit if locked out >24hr",
            "4. Investigate why webhook didn't update their subscription"
          ]
        : []
    };
  },
});

/**
 * ASSESSMENT 3: Check Webhook Processing Failures
 *
 * Analyzes Stripe webhook event logs for failures, errors, or slow processing.
 *
 * Expected: failedCount = 0, avgProcessingTime < 1000ms
 * Warning: failedCount > 0 or avgProcessingTime > 2000ms
 * Critical: failedCount > 5 or avgProcessingTime > 5000ms
 */
export const checkWebhookHealth = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("stripeEvents").collect();

    // Failed events
    const failedEvents = events.filter(e => e.status === "failed");

    // Processing events (stuck?)
    const processingEvents = events.filter(e => e.status === "processing");

    // Completed events
    const completedEvents = events.filter(e => e.status === "completed");

    // Calculate statistics
    const eventsByType = new Map<string, number>();
    events.forEach(e => {
      const count = eventsByType.get(e.eventType) || 0;
      eventsByType.set(e.eventType, count + 1);
    });

    // Recent events (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => e.createdAt > sevenDaysAgo);

    return {
      summary: {
        totalEvents: events.length,
        failedCount: failedEvents.length,
        processingCount: processingEvents.length,
        completedCount: completedEvents.length,
        successRate: ((completedEvents.length / events.length) * 100).toFixed(2) + "%",
        recentEventsLast7Days: recentEvents.length
      },
      failedEvents: failedEvents.map(e => ({
        eventId: e.eventId,
        eventType: e.eventType,
        error: e.error,
        customerId: e.customerId,
        createdAt: new Date(e.createdAt).toISOString()
      })),
      processingEvents: processingEvents.map(e => ({
        eventId: e.eventId,
        eventType: e.eventType,
        customerId: e.customerId,
        createdAt: new Date(e.createdAt).toISOString(),
        stuckForMs: Date.now() - e.createdAt
      })),
      eventsByType: Array.from(eventsByType.entries()).map(([type, count]) => ({
        eventType: type,
        count,
        percentage: ((count / events.length) * 100).toFixed(2) + "%"
      })),
      assessment: failedEvents.length === 0 && processingEvents.length === 0
        ? "✅ SAFE: All webhooks processing successfully"
        : failedEvents.length < 5
        ? "⚠️ WARNING: Some webhook failures detected"
        : "🔴 CRITICAL: High webhook failure rate"
    };
  },
});

/**
 * ASSESSMENT 4: Subscription State Audit
 *
 * Comprehensive audit of all subscription states to find inconsistencies.
 *
 * Checks for:
 * - Users over their analysis limit but still on free tier
 * - Users with unlimited analyses but on free tier
 * - Users with subscription IDs but no customer IDs
 * - Other data integrity issues
 */
export const auditSubscriptionStates = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const issues: any[] = [];

    users.forEach(user => {
      // Issue 1: User exceeded free tier limit but still on free
      if (user.subscriptionTier === "free" && user.analysesUsed > 3) {
        issues.push({
          userId: user._id,
          email: user.email,
          issue: "Exceeded free tier limit",
          details: `Used ${user.analysesUsed} analyses (limit: 3) but still on free tier`,
          severity: "medium"
        });
      }

      // Issue 2: User has unlimited analyses (999999) but on free tier
      if (user.subscriptionTier === "free" && user.analysesLimit >= 999999) {
        issues.push({
          userId: user._id,
          email: user.email,
          issue: "Unlimited analyses on free tier",
          details: "User has analysesLimit=999999 but subscriptionTier=free",
          severity: "high"
        });
      }

      // Issue 3: User has subscription ID but no customer ID
      if (user.stripeSubscriptionId && !user.stripeCustomerId) {
        issues.push({
          userId: user._id,
          email: user.email,
          issue: "Subscription ID without customer ID",
          details: "Has stripeSubscriptionId but missing stripeCustomerId",
          severity: "medium"
        });
      }

      // Issue 4: User on paid tier but no Stripe IDs
      if (user.subscriptionTier !== "free" && !user.stripeCustomerId) {
        issues.push({
          userId: user._id,
          email: user.email,
          issue: "Paid tier without Stripe customer",
          details: `Tier=${user.subscriptionTier} but no Stripe customer ID`,
          severity: "high"
        });
      }

      // Issue 5: Analysis limit doesn't match tier
      const expectedLimits = {
        free: 3,
        starter: 999999,
        pro: 999999,
        elite: 999999
      };
      const expectedLimit = expectedLimits[user.subscriptionTier as keyof typeof expectedLimits];
      if (expectedLimit && user.analysesLimit !== expectedLimit) {
        issues.push({
          userId: user._id,
          email: user.email,
          issue: "Analysis limit mismatch",
          details: `Tier=${user.subscriptionTier}, expected limit=${expectedLimit}, actual=${user.analysesLimit}`,
          severity: "low"
        });
      }
    });

    // Group by severity
    const highSeverity = issues.filter(i => i.severity === "high");
    const mediumSeverity = issues.filter(i => i.severity === "medium");
    const lowSeverity = issues.filter(i => i.severity === "low");

    return {
      summary: {
        totalUsers: users.length,
        issuesFound: issues.length,
        highSeverity: highSeverity.length,
        mediumSeverity: mediumSeverity.length,
        lowSeverity: lowSeverity.length
      },
      issues: {
        high: highSeverity,
        medium: mediumSeverity,
        low: lowSeverity
      },
      assessment: issues.length === 0
        ? "✅ SAFE: No subscription state inconsistencies found"
        : highSeverity.length === 0
        ? "⚠️ WARNING: Minor inconsistencies found"
        : "🔴 CRITICAL: Data integrity issues detected"
    };
  },
});

/**
 * MASTER ASSESSMENT: Run All Checks
 *
 * Runs all damage assessment queries and provides a comprehensive report.
 */
export const runFullDamageAssessment = query({
  handler: async (ctx) => {
    const duplicates = await findDuplicateStripeEvents.handler(ctx);
    const paidUsersIssues = await findPaidUsersWithoutAccess.handler(ctx);
    const webhookHealth = await checkWebhookHealth.handler(ctx);
    const subscriptionAudit = await auditSubscriptionStates.handler(ctx);

    // Calculate overall risk score (0-100, lower is better)
    let riskScore = 0;

    // Duplicates: 10 points per duplicate (max 30)
    riskScore += Math.min(duplicates.summary.duplicateCount * 10, 30);

    // Paid users without access: 15 points each (max 30)
    riskScore += Math.min(paidUsersIssues.summary.affectedCount * 15, 30);

    // Webhook failures: 5 points each (max 20)
    riskScore += Math.min(webhookHealth.summary.failedCount * 5, 20);

    // High severity subscription issues: 10 points each (max 20)
    riskScore += Math.min(subscriptionAudit.summary.highSeverity * 10, 20);

    const overallStatus = riskScore === 0
      ? "✅ GREEN: System healthy, no issues detected"
      : riskScore < 30
      ? "⚠️ YELLOW: Minor issues detected, monitoring recommended"
      : "🔴 RED: Critical issues detected, immediate action required";

    return {
      assessmentDate: new Date().toISOString(),
      riskScore: riskScore,
      overallStatus: overallStatus,
      detailedAssessments: {
        duplicateEvents: duplicates,
        paidUsersWithoutAccess: paidUsersIssues,
        webhookHealth: webhookHealth,
        subscriptionAudit: subscriptionAudit
      },
      prioritizedActions: riskScore > 0 ? [
        ...(paidUsersIssues.summary.affectedCount > 0 ? [
          {
            priority: "P0",
            action: `Fix ${paidUsersIssues.summary.affectedCount} users who paid but don't have access`,
            impact: "Customer satisfaction, revenue retention"
          }
        ] : []),
        ...(duplicates.summary.duplicateCount > 0 ? [
          {
            priority: "P0",
            action: "Investigate duplicate webhook processing",
            impact: "Prevent double charges, data corruption"
          }
        ] : []),
        ...(webhookHealth.summary.failedCount > 0 ? [
          {
            priority: "P1",
            action: "Investigate and fix webhook failures",
            impact: "Ensure reliable payment processing"
          }
        ] : []),
        ...(subscriptionAudit.summary.highSeverity > 0 ? [
          {
            priority: "P1",
            action: "Fix data integrity issues in subscription states",
            impact: "Data consistency, billing accuracy"
          }
        ] : [])
      ] : []
    };
  },
});
