/**
 * Run the backfill script to add all existing users to leadCaptures
 */

import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://mild-tern-361.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function runBackfill() {
  console.log("🔄 Running backfill script...\n");
  console.log("This will create lead captures for all 136 existing users.\n");

  try {
    // Check status before backfill
    console.log("📊 Checking current status...");
    const statusBefore = await client.mutation("backfillLeads:checkBackfillStatus" as any);
    console.log(`\nBefore Backfill:`);
    console.log(`  Total Users:           ${statusBefore.totalUsers}`);
    console.log(`  Total Leads:           ${statusBefore.totalLeads}`);
    console.log(`  Users with Leads:      ${statusBefore.usersWithLeads}`);
    console.log(`  Users without Leads:   ${statusBefore.usersWithoutLeads}`);
    console.log(`  Needs Backfill:        ${statusBefore.needsBackfill ? '✅ YES' : '❌ NO'}\n`);

    if (!statusBefore.needsBackfill) {
      console.log("✅ All users already have lead captures. No backfill needed!");
      return;
    }

    // Run backfill
    console.log("🚀 Running backfill...\n");
    const result = await client.mutation("backfillLeads:backfillLeadCaptures" as any);

    console.log("\n✅ Backfill Complete!\n");
    console.log(`📊 Summary:`);
    console.log(`  Total Users:          ${result.totalUsers}`);
    console.log(`  Leads Created/Linked: ${result.leadsCreated}`);
    console.log(`  Users Skipped:        ${result.usersSkipped}`);
    console.log(`  Errors:               ${result.errors}`);
    console.log(`\n${result.message}\n`);

    // Check status after backfill
    console.log("📊 Checking status after backfill...");
    const statusAfter = await client.mutation("backfillLeads:checkBackfillStatus" as any);
    console.log(`\nAfter Backfill:`);
    console.log(`  Total Users:           ${statusAfter.totalUsers}`);
    console.log(`  Total Leads:           ${statusAfter.totalLeads}`);
    console.log(`  Users with Leads:      ${statusAfter.usersWithLeads}`);
    console.log(`  Users without Leads:   ${statusAfter.usersWithoutLeads}`);
    console.log(`  Needs Backfill:        ${statusAfter.needsBackfill ? '⚠️  YES' : '✅ NO'}\n`);

    console.log("🎉 All users are now in the lead tracking system!");
    console.log("\nNext steps:");
    console.log("  1. Configure Formspree webhook (see FORMSPREE_CONVEX_WEBHOOK_SETUP.md)");
    console.log("  2. Test form submission on landing page");
    console.log("  3. Run audit script to verify: npx tsx scripts/audit-signups.ts\n");

  } catch (error) {
    console.error("❌ Backfill failed:", error);
    throw error;
  }
}

runBackfill().catch(console.error);
