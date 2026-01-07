/**
 * Cleanup Test Users Script
 *
 * Deletes test user accounts from Convex database.
 * Run with: npx tsx scripts/cleanup-test-users.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as readline from "readline";

// Get Convex deployment URL from environment
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL or VITE_CONVEX_URL environment variable not set");
  console.log("\nPlease set one of:");
  console.log("  export CONVEX_URL=https://your-deployment.convex.cloud");
  console.log("  export VITE_CONVEX_URL=https://your-deployment.convex.cloud");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Helper to prompt for user input
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log("🧹 PropIQ Test User Cleanup Tool");
  console.log("================================\n");

  // Show menu
  console.log("What would you like to do?\n");
  console.log("1. List all users");
  console.log("2. Check if specific email exists");
  console.log("3. Delete user by email");
  console.log("4. Delete multiple users (comma-separated emails)");
  console.log("5. Delete all unverified users");
  console.log("0. Exit\n");

  const choice = await prompt("Enter your choice (0-5): ");

  switch (choice.trim()) {
    case "1":
      await listAllUsers();
      break;

    case "2":
      await checkEmail();
      break;

    case "3":
      await deleteOneUser();
      break;

    case "4":
      await deleteMultipleUsers();
      break;

    case "5":
      await deleteUnverifiedUsers();
      break;

    case "0":
      console.log("👋 Goodbye!");
      process.exit(0);
      break;

    default:
      console.log("❌ Invalid choice. Please run the script again.");
      process.exit(1);
  }
}

async function listAllUsers() {
  console.log("\n📋 Fetching all users...\n");

  try {
    const users = await client.query(api.adminCleanup.listAllUsers, {});

    if (users.length === 0) {
      console.log("✅ No users found in database.");
      return;
    }

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      const verifiedIcon = user.emailVerified ? "✅" : "❌";
      const activeIcon = user.active ? "🟢" : "🔴";
      const date = new Date(user.createdAt).toLocaleDateString();

      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ${verifiedIcon} Verified | ${activeIcon} Active | Tier: ${user.subscriptionTier}`);
      console.log(`   Created: ${date} | Analyses: ${user.analysesUsed}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
  }
}

async function checkEmail() {
  const email = await prompt("\nEnter email address to check: ");

  console.log(`\n🔍 Checking for: ${email}...\n`);

  try {
    const result = await client.query(api.adminCleanup.findUserByEmail, { email: email.trim() });

    if (!result.exists) {
      console.log(`✅ Email ${email} is NOT in database - you can sign up with it!`);
      return;
    }

    console.log(`⚠️  Email ${email} EXISTS in database:\n`);
    const user = result.user!;
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email Verified: ${user.emailVerified ? "✅ Yes" : "❌ No"}`);
    console.log(`   Active: ${user.active ? "✅ Yes" : "❌ No"}`);
    console.log(`   Tier: ${user.subscriptionTier}`);
    console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
  } catch (error) {
    console.error("❌ Error checking email:", error);
  }
}

async function deleteOneUser() {
  const email = await prompt("\n⚠️  Enter email address to DELETE: ");

  console.log(`\n🔍 Looking up: ${email}...\n`);

  try {
    // First check if user exists
    const checkResult = await client.query(api.adminCleanup.findUserByEmail, { email: email.trim() });

    if (!checkResult.exists) {
      console.log(`✅ Email ${email} not found in database - nothing to delete.`);
      return;
    }

    // Show user info
    const user = checkResult.user!;
    console.log(`Found user:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email Verified: ${user.emailVerified ? "Yes" : "No"}`);
    console.log(`   Tier: ${user.subscriptionTier}`);
    console.log("");

    // Confirm deletion
    const confirm = await prompt("❗ Are you sure you want to DELETE this user? (yes/no): ");

    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Deletion cancelled.");
      return;
    }

    // Delete the user
    console.log("\n🗑️  Deleting user and all related data...\n");

    const result = await client.mutation(api.adminCleanup.deleteUserByEmail, { email: email.trim() });

    if (result.success) {
      console.log(`✅ Successfully deleted user: ${result.email}`);
      console.log("\nDeleted data:");
      console.log(`   - Sessions: ${result.deletedData.sessions}`);
      console.log(`   - Property Analyses: ${result.deletedData.analyses}`);
      console.log(`   - Support Chats: ${result.deletedData.supportChats}`);
      console.log(`   - Verification Tokens: ${result.deletedData.verificationTokens}`);
      console.log("\n✨ You can now sign up with this email address!");
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.error("❌ Error deleting user:", error);
  }
}

async function deleteMultipleUsers() {
  const emailsInput = await prompt("\n⚠️  Enter email addresses to DELETE (comma-separated): ");

  const emails = emailsInput
    .split(",")
    .map(e => e.trim())
    .filter(e => e.length > 0);

  if (emails.length === 0) {
    console.log("❌ No emails provided.");
    return;
  }

  console.log(`\n📋 You want to delete ${emails.length} users:`);
  emails.forEach((email, i) => console.log(`   ${i + 1}. ${email}`));
  console.log("");

  const confirm = await prompt("❗ Are you sure you want to DELETE all these users? (yes/no): ");

  if (confirm.toLowerCase() !== "yes") {
    console.log("❌ Deletion cancelled.");
    return;
  }

  console.log("\n🗑️  Deleting users...\n");

  try {
    const result = await client.mutation(api.adminCleanup.deleteMultipleUsers, { emails });

    console.log(`\n✅ Deletion complete!`);
    console.log(`   Total: ${result.total}`);
    console.log(`   Successful: ${result.successful}`);
    console.log(`   Failed: ${result.failed}`);

    if (result.results.some(r => !r.success)) {
      console.log("\n❌ Failed deletions:");
      result.results.forEach(r => {
        if (!r.success) {
          console.log(`   - ${r.error}`);
        }
      });
    }

    console.log("\n✨ Successfully deleted users can now be used for signup!");
  } catch (error) {
    console.error("❌ Error deleting users:", error);
  }
}

async function deleteUnverifiedUsers() {
  console.log("\n⚠️  This will delete ALL users who haven't verified their email.");
  console.log("This includes:");
  console.log("- Test accounts that never verified");
  console.log("- Abandoned signups");
  console.log("- Users who lost their verification email\n");

  const confirm = await prompt("Are you sure? (yes/no): ");

  if (confirm.toLowerCase() !== "yes") {
    console.log("❌ Deletion cancelled.");
    return;
  }

  console.log("\n🗑️  Deleting all unverified users...\n");

  try {
    const result = await client.mutation(api.adminCleanup.deleteUnverifiedUsers, {});

    console.log(`✅ Successfully deleted ${result.deletedCount} unverified users!`);

    if (result.deletedUsers.length > 0) {
      console.log("\nDeleted users:");
      result.deletedUsers.forEach((user, i) => {
        const date = new Date(user.createdAt).toLocaleDateString();
        console.log(`   ${i + 1}. ${user.email} (created ${date})`);
      });
    }

    console.log("\n✨ These email addresses can now be used for signup!");
  } catch (error) {
    console.error("❌ Error deleting unverified users:", error);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
