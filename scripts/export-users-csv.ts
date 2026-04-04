/**
 * Export Users to CSV Script
 *
 * Queries all users from Convex and exports to CSV file.
 * Run with: npx tsx scripts/export-users-csv.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

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

/**
 * Convert array of objects to CSV format
 */
function arrayToCSV(data: any[]): string {
  if (data.length === 0) {
    return "";
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV rows
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];

      // Escape quotes and wrap in quotes if contains comma or quote
      if (value === null || value === undefined) {
        return "";
      }

      const stringValue = String(value);

      // Wrap in quotes if contains comma, newline, or quote
      if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    });

    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

async function exportUsers() {
  console.log("📊 PropIQ User Export Tool");
  console.log("==========================\n");

  try {
    console.log("🔄 Fetching users from Convex...\n");

    const users = await client.query(api.adminCleanup.exportUsersForCSV, {});

    if (users.length === 0) {
      console.log("⚠️  No users found in database.");
      return;
    }

    console.log(`✅ Found ${users.length} users\n`);

    // Convert to CSV
    const csv = arrayToCSV(users);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
    const filename = `propiq-users-export-${timestamp}.csv`;
    const downloadsFolder = path.join(os.homedir(), "Downloads");
    const filepath = path.join(downloadsFolder, filename);

    // Write to file
    fs.writeFileSync(filepath, csv, "utf-8");

    console.log(`✅ Export complete!`);
    console.log(`📁 File saved to: ${filepath}`);
    console.log(`\n📊 Export Summary:`);
    console.log(`   Total users: ${users.length}`);
    console.log(`   Columns: ${Object.keys(users[0]).join(", ")}`);

    // Show first few rows as preview
    console.log(`\n📝 Preview (first 3 rows):`);
    const preview = users.slice(0, 3);
    preview.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Plan: ${user.planType}`);
      console.log(`   Signup: ${user.signupDate}`);
      console.log(`   Last Active: ${user.lastActive}`);
    });

    console.log(`\n✨ You can now open ${filename} in Excel, Google Sheets, or any CSV viewer.`);

  } catch (error) {
    console.error("❌ Error exporting users:", error);
    process.exit(1);
  }
}

// Run the export
exportUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
