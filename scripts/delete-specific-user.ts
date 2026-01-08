/**
 * Delete a specific user by email
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL or VITE_CONVEX_URL environment variable not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const EMAIL_TO_DELETE = "briandphive@gmail.com";

async function main() {
  console.log(`🔍 Checking for user: ${EMAIL_TO_DELETE}\n`);

  // Check if user exists
  const checkResult = await client.query(api.adminCleanup.findUserByEmail, {
    email: EMAIL_TO_DELETE
  });

  if (!checkResult.exists) {
    console.log(`✅ User ${EMAIL_TO_DELETE} does NOT exist in database`);
    console.log("You should be able to sign up with this email now!");
    return;
  }

  console.log(`⚠️  User found in database:`);
  console.log(`   Email: ${checkResult.user!.email}`);
  console.log(`   Verified: ${checkResult.user!.emailVerified}`);
  console.log(`   Active: ${checkResult.user!.active}`);
  console.log(`   Tier: ${checkResult.user!.subscriptionTier}`);
  console.log(`   Created: ${new Date(checkResult.user!.createdAt).toLocaleString()}\n`);

  console.log(`🗑️  Deleting user...\n`);

  const deleteResult = await client.mutation(api.adminCleanup.deleteUserByEmail, {
    email: EMAIL_TO_DELETE
  });

  if (deleteResult.success) {
    console.log(`✅ Successfully deleted user: ${deleteResult.email}`);
    console.log(`\nDeleted data:`);
    console.log(`   - Sessions: ${deleteResult.deletedData.sessions}`);
    console.log(`   - Property Analyses: ${deleteResult.deletedData.analyses}`);
    console.log(`   - Support Chats: ${deleteResult.deletedData.supportChats}`);
    console.log(`   - Verification Tokens: ${deleteResult.deletedData.verificationTokens}`);
    console.log(`\n✨ You can now sign up with ${EMAIL_TO_DELETE}!`);
  } else {
    console.log(`❌ Error: ${deleteResult.error}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
