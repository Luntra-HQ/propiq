/**
 * Delete all users except specific ones
 * Run with: npx tsx scripts/cleanup-keep-only.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Get Convex deployment URL from environment
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL or VITE_CONVEX_URL environment variable not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Emails to KEEP (all others will be deleted)
const KEEP_EMAILS = [
  "bdusape@luntra.one",
  "soldbyadonis@gmail.com",
  "keanulamarre@gmail.com"
];

async function main() {
  console.log("🧹 PropIQ Selective User Cleanup");
  console.log("================================\n");
  console.log("⚠️  This will delete ALL users EXCEPT:\n");
  KEEP_EMAILS.forEach(email => console.log(`   ✅ ${email}`));
  console.log("");

  // Fetch all users
  console.log("📋 Fetching all users...\n");
  const users = await client.query(api.adminCleanup.listAllUsers, {});

  console.log(`Found ${users.length} total users\n`);

  // Filter to get emails to delete
  const emailsToDelete = users
    .map(u => u.email)
    .filter(email => !KEEP_EMAILS.includes(email));

  console.log(`Will DELETE: ${emailsToDelete.length} users`);
  console.log(`Will KEEP: ${KEEP_EMAILS.length} users\n`);

  if (emailsToDelete.length === 0) {
    console.log("✅ No users to delete!");
    return;
  }

  console.log("Users to be deleted:");
  emailsToDelete.slice(0, 20).forEach(email => console.log(`   - ${email}`));
  if (emailsToDelete.length > 20) {
    console.log(`   ... and ${emailsToDelete.length - 20} more`);
  }
  console.log("");

  // Delete one at a time to avoid timeouts
  let totalDeleted = 0;
  let totalFailed = 0;

  console.log("🗑️  Starting deletion...\n");

  for (let i = 0; i < emailsToDelete.length; i++) {
    const email = emailsToDelete[i];
    const progress = `[${i + 1}/${emailsToDelete.length}]`;

    try {
      const result = await client.mutation(api.adminCleanup.deleteUserByEmail, {
        email
      });

      if (result.success) {
        totalDeleted++;
        console.log(`${progress} ✅ Deleted: ${email}`);
      } else {
        totalFailed++;
        console.log(`${progress} ❌ Failed: ${email} - ${result.error}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      totalFailed++;
      console.error(`${progress} ❌ Error deleting ${email}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log("\n✨ Cleanup complete!\n");
  console.log(`Total deleted: ${totalDeleted}`);
  console.log(`Total failed: ${totalFailed}`);
  console.log(`Remaining users: ${KEEP_EMAILS.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
