/**
 * Cron Jobs for PropIQ
 *
 * Scheduled tasks that run automatically:
 * - Lead nurture emails (Day 3, Day 7)
 * - User onboarding emails (Day 1, Day 3, Day 7)
 * - Session cleanup
 * - Analytics aggregation
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ============================================
// LEAD NURTURE SEQUENCE (for lead magnet downloads)
// ============================================

/**
 * Day 3 Nurture Email - Daily at 10:00 AM EST (3:00 PM UTC)
 * Sends first follow-up email to leads captured 3 days ago
 */
crons.daily(
  "send-day3-nurture-emails",
  {
    hourUTC: 15, // 10 AM EST = 3 PM UTC
    minuteUTC: 0,
  },
  internal.emailScheduler.checkLeadsForDay3Nurture
);

/**
 * Day 7 Nurture Email - Daily at 10:30 AM EST (3:30 PM UTC)
 * Sends final follow-up email to leads captured 7 days ago
 */
crons.daily(
  "send-day7-nurture-emails",
  {
    hourUTC: 15, // 10:30 AM EST = 3:30 PM UTC
    minuteUTC: 30,
  },
  internal.emailScheduler.checkLeadsForDay7Nurture
);

// ============================================
// USER ONBOARDING SEQUENCE (for direct trial signups)
// ============================================

/**
 * Day 1 Onboarding Email - Daily at 9:00 AM EST (2:00 PM UTC)
 * Sends feature overview email to users who signed up 1 day ago
 */
crons.daily(
  "send-day1-onboarding-emails",
  {
    hourUTC: 14, // 9 AM EST = 2 PM UTC
    minuteUTC: 0,
  },
  internal.onboardingEmailScheduler.checkUsersForDay1Onboarding
);

/**
 * Day 3 Onboarding Email - Daily at 9:30 AM EST (2:30 PM UTC)
 * Sends Deal Calculator highlight email to users who signed up 3 days ago
 */
crons.daily(
  "send-day3-onboarding-emails",
  {
    hourUTC: 14, // 9:30 AM EST = 2:30 PM UTC
    minuteUTC: 30,
  },
  internal.onboardingEmailScheduler.checkUsersForDay3Onboarding
);

/**
 * Day 7 Onboarding Email - Daily at 9:45 AM EST (2:45 PM UTC)
 * Sends urgency reminder email to users who signed up 7 days ago
 */
crons.daily(
  "send-day7-onboarding-emails",
  {
    hourUTC: 14, // 9:45 AM EST = 2:45 PM UTC
    minuteUTC: 45,
  },
  internal.onboardingEmailScheduler.checkUsersForDay7Onboarding
);

// ============================================
// SYSTEM MAINTENANCE
// ============================================

/**
 * Cleanup Expired Sessions - Daily at 2:00 AM EST (7:00 AM UTC)
 * Removes expired session tokens to keep database clean
 */
crons.daily(
  "cleanup-expired-sessions",
  {
    hourUTC: 7, // 2 AM EST = 7 AM UTC
    minuteUTC: 0,
  },
  internal.sessions.cleanupExpiredSessions
);


// ============================================
// ANALYTICS & REPORTING
// ============================================

/**
 * Weekly Intelligence Dashboard - Mondays at 8:00 AM EST (1:00 PM UTC)
 * Sends summary of MRR, Churn, and User Funnel to admin
 */
crons.weekly(
  "send-weekly-dashboard",
  {
    dayOfWeek: "monday",
    hourUTC: 13, // 8 AM EST = 1 PM UTC
    minuteUTC: 0,
  },
  internal.analytics.sendWeeklyEmail
);

export default crons;
