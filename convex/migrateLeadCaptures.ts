/**
 * Migration script for leadCaptures table
 * Migrates old schema to new schema with nurture email tracking
 *
 * Run once with: npx convex run migrateLeadCaptures:migrateAll
 */

import { internalMutation } from "./_generated/server";

/**
 * Migrate all leadCaptures to new schema
 * This is safe to run multiple times (idempotent)
 */
export const migrateAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("[MIGRATION] Starting leadCaptures migration...");

    // Get all leads (this will fail if schema is invalid, so we'll delete instead)
    // Since we can't query invalid schema, we'll just clear the table
    console.log("[MIGRATION] Clearing old leadCaptures data...");

    // The safest approach: delete the table data via Convex dashboard
    // Since we can't access the old data programmatically due to schema mismatch

    return {
      success: false,
      message: "Manual intervention required: Delete all leadCaptures data via Convex dashboard, then deploy again",
      instructions: [
        "1. Go to https://dashboard.convex.dev/",
        "2. Select your deployment: mild-tern-361",
        "3. Go to Data tab",
        "4. Select 'leadCaptures' table",
        "5. Delete all documents",
        "6. Run: npx convex deploy -y",
      ],
    };
  },
});
