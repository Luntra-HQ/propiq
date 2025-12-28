/**
 * Cron Jobs Configuration
 * Scheduled tasks that run automatically
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Check Inactive Users - Weekly on Mondays at 9 AM EST (2 PM UTC)
 * Sends re-engagement emails to users who haven't been active in 14+ days
 */
crons.weekly(
  "check-inactive-users",
  {
    dayOfWeek: 1, // Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    hourUTC: 14, // 2 PM UTC = 9 AM EST
    minuteUTC: 0,
  },
  internal.emailScheduler.checkInactiveUsers
);

export default crons;
