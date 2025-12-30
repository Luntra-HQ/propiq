/**
 * Additional schema definitions for rate limiting
 * Add this to your existing convex/schema.ts file
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Add this table to your schema
export const rateLimitsTable = defineTable({
  identifier: v.string(), // IP address or user ID
  action: v.string(), // "login", "signup", "passwordReset", "api"
  attempts: v.number(), // Number of attempts in current window
  windowExpiresAt: v.number(), // When the current window expires
  blockedUntil: v.union(v.number(), v.null()), // When the block expires (null if not blocked)
  lastAttemptAt: v.number(), // Timestamp of last attempt
  createdAt: v.number(), // When this record was created
})
.index("by_identifier_action", ["identifier", "action"])
.index("by_identifier", ["identifier"])
.index("by_blocked_until", ["blockedUntil"]);

// INSTRUCTIONS:
// 1. Copy the rateLimitsTable definition above
// 2. Add it to your existing schema.ts file:
//
// export default defineSchema({
//   users: defineTable({ ... }),
//   sessions: defineTable({ ... }),
//   rateLimits: rateLimitsTable,  // <-- Add this line
//   // ... other tables
// });
//
// 3. Run: npx convex dev
// 4. Convex will automatically create the new table and indexes
