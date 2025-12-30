/**
 * Signup Audit Script
 * Compares lead captures vs actual user signups to identify data flow gaps
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

async function auditSignups() {
  console.log("🔍 SIGNUP AUDIT - Analyzing data flow gaps\n");
  console.log("============================================================");

  // 1. Get lead capture statistics
  console.log("\n📊 LEAD CAPTURES (Formspree → Convex leadCaptures table)");
  console.log("------------------------------------------------------------");

  const leadStats = await client.query("leads:getLeadStats" as any);
  console.log(`Total Leads Captured: ${leadStats.total}`);
  console.log(`\nBy Status:`);
  console.log(`  - Captured (not nurtured):      ${leadStats.byStatus.captured}`);
  console.log(`  - Nurtured (emails sent):       ${leadStats.byStatus.nurtured}`);
  console.log(`  - Converted to Trial:           ${leadStats.byStatus.converted_trial}`);
  console.log(`  - Converted to Paid:            ${leadStats.byStatus.converted_paid}`);

  console.log(`\nBy Lead Magnet:`);
  Object.entries(leadStats.byLeadMagnet).forEach(([magnet, count]) => {
    console.log(`  - ${magnet}: ${count}`);
  });

  console.log(`\nBy Source:`);
  Object.entries(leadStats.bySource).forEach(([source, count]) => {
    console.log(`  - ${source}: ${count}`);
  });

  console.log(`\nConversion Rates:`);
  console.log(`  - Lead → Trial: ${leadStats.conversionRates.toTrial.toFixed(1)}%`);
  console.log(`  - Lead → Paid:  ${leadStats.conversionRates.toPaid.toFixed(1)}%`);

  // 2. Get recent leads
  console.log("\n\n📋 RECENT LEADS (Last 20)");
  console.log("------------------------------------------------------------");

  const recentLeads = await client.query("leads:getRecentLeads" as any, { limit: 20 });
  recentLeads.forEach((lead: any, idx: number) => {
    const date = new Date(lead.capturedAt).toLocaleDateString();
    const status = lead.status.padEnd(20);
    console.log(`${(idx + 1).toString().padStart(2)}. ${lead.email.padEnd(35)} ${status} ${date}`);
  });

  // 3. Get all users
  console.log("\n\n👥 USER SIGNUPS (App Auth → Convex users table)");
  console.log("------------------------------------------------------------");

  const allUsersData = await client.query("exports:exportAllUsers" as any);
  console.log(`Total Users in Database: ${allUsersData.totalCount}`);

  // Group by subscription tier
  const tierCounts: Record<string, number> = {};
  allUsersData.users.forEach((user: any) => {
    tierCounts[user.subscriptionTier] = (tierCounts[user.subscriptionTier] || 0) + 1;
  });

  console.log(`\nBy Subscription Tier:`);
  Object.entries(tierCounts).forEach(([tier, count]) => {
    console.log(`  - ${tier}: ${count}`);
  });

  // Group by segment
  const segmentCounts: Record<string, number> = {};
  allUsersData.users.forEach((user: any) => {
    segmentCounts[user.userSegment] = (segmentCounts[user.userSegment] || 0) + 1;
  });

  console.log(`\nBy User Segment:`);
  Object.entries(segmentCounts).forEach(([segment, count]) => {
    console.log(`  - ${segment}: ${count}`);
  });

  // Show recent signups (last 10)
  const sortedByDate = [...allUsersData.users].sort((a: any, b: any) =>
    new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime()
  );

  console.log(`\nRecent Signups (Last 10):`);
  sortedByDate.slice(0, 10).forEach((user: any, idx: number) => {
    const date = new Date(user.signupDate).toLocaleDateString();
    const segment = user.userSegment.padEnd(10);
    console.log(`  ${(idx + 1).toString().padStart(2)}. ${user.email.padEnd(35)} ${segment} ${date}`);
  });

  // Check for converted leads
  const convertedLeads = recentLeads.filter((lead: any) =>
    lead.status === "converted_trial" || lead.status === "converted_paid"
  );

  console.log(`\nConverted Leads (linked to users): ${convertedLeads.length}`);

  // 4. Identify the gap
  console.log("\n\n⚠️  DATA MISMATCH ANALYSIS");
  console.log("------------------------------------------------------------");
  console.log(`Clarity Events (Analytics):       17 sign ups`);
  console.log(`Formspree Submissions:             2 submissions`);
  console.log(`Convex Lead Captures:              ${leadStats.total} leads`);
  console.log(`Convex Users (actual signups):     ${allUsersData.totalCount} users`);
  console.log(`Lead → User Links:                 ${leadStats.byStatus.converted_trial} conversions`);

  console.log("\n\n💡 ANALYSIS");
  console.log("------------------------------------------------------------");

  const totalUsers = allUsersData.totalCount;
  const totalLeads = leadStats.total;
  const linkedLeads = leadStats.byStatus.converted_trial + leadStats.byStatus.converted_paid;
  const unlinkedUsers = totalUsers - linkedLeads;

  console.log(`\n📊 Funnel Breakdown:`);
  console.log(`  1. Clarity tracked 17 "Sign up" events`);
  console.log(`  2. Formspree received 2 form submissions`);
  console.log(`  3. Convex has ${totalLeads} lead captures`);
  console.log(`  4. Convex has ${totalUsers} actual users`);
  console.log(`  5. Only ${linkedLeads} users are linked to leads`);

  console.log(`\n🔴 GAPS IDENTIFIED:`);
  console.log(`  - ${totalUsers} users signed up directly (bypassing lead capture)`);
  console.log(`  - ${2 - totalLeads} Formspree submissions didn't create leads (webhook issue?)`);
  console.log(`  - ${17 - totalUsers} Clarity events are phantom (analytics issue?)`);

  console.log("\n\n💡 RECOMMENDATIONS");
  console.log("------------------------------------------------------------");

  if (unlinkedUsers > 0) {
    console.log(`\n🔴 PRIMARY ISSUE: ${unlinkedUsers} users have NO lead tracking!`);
    console.log("\n✅ SOLUTIONS:");
    console.log("\n1. FIX LEAD CAPTURE ON SIGNUP:");
    console.log("   The auth.signup mutation (convex/auth.ts:101-121) already tries to");
    console.log("   link leads, but it needs to CREATE leads for direct signups:");
    console.log("");
    console.log("   if (!existingLead) {");
    console.log("     // Create lead capture for direct signups");
    console.log("     await ctx.db.insert('leadCaptures', {");
    console.log("       email,");
    console.log("       leadMagnet: 'direct-signup',");
    console.log("       source: 'app-auth',");
    console.log("       status: 'converted_trial',");
    console.log("       userId,");
    console.log("       convertedAt: Date.now(),");
    console.log("       capturedAt: Date.now(),");
    console.log("     });");
    console.log("   }");

    console.log("\n2. FIX FORMSPREE → CONVEX INTEGRATION:");
    console.log("   - Formspree has 2 submissions but 0 leads in Convex");
    console.log("   - Check webhook configuration in Formspree dashboard");
    console.log("   - Verify Convex HTTP endpoint for lead capture");
    console.log("   - Test webhook manually");

    console.log("\n3. BACKFILL MISSING LEADS:");
    console.log("   Run a migration to create lead captures for existing users:");
    console.log("   - For each user without a linked lead");
    console.log("   - Create a leadCapture entry");
    console.log("   - Mark as 'converted_trial' with source 'backfill'");
  } else {
    console.log("✅ Perfect! All users are tracked in lead system!");
  }

  console.log("\n============================================================");
}

auditSignups().catch(console.error);
