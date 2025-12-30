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
    dayOfWeek: "monday", // Must be string: "monday", "tuesday", etc.
    hourUTC: 14, // 2 PM UTC = 9 AM EST
    minuteUTC: 0,
  },
  internal.emailScheduler.checkInactiveUsers
);

/**
 * Lead Nurture Day 3 - Daily at 10 AM EST (3 PM UTC)
 * Sends nurture emails to leads captured 3 days ago
 */
crons.daily(
  "lead-nurture-day-3",
  {
    hourUTC: 15, // 3 PM UTC = 10 AM EST
    minuteUTC: 0,
  },
  internal.emailScheduler.checkLeadsForDay3Nurture
);

/**
 * Lead Nurture Day 7 - Daily at 10:30 AM EST (3:30 PM UTC)
 * Sends final nurture emails to leads captured 7 days ago
 */
crons.daily(
  "lead-nurture-day-7",
  {
    hourUTC: 15, // 3:30 PM UTC = 10:30 AM EST
    minuteUTC: 30,
  },
  internal.emailScheduler.checkLeadsForDay7Nurture
);

export default crons;
