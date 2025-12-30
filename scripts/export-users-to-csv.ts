#!/usr/bin/env node
/**
 * Export PropIQ users to CSV for marketing and analytics
 *
 * Usage:
 *   npx tsx scripts/export-users-to-csv.ts               # Export all users
 *   npx tsx scripts/export-users-to-csv.ts --segment     # Export by segment
 *   npx tsx scripts/export-users-to-csv.ts --free        # Export only free tier users
 *
 * Output:
 *   Creates CSV file: propiq-users-export-{timestamp}.csv
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, "..");

// Read .env.local file
const envLocalPath = path.join(projectRoot, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Get Convex URL from environment
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL not found in environment variables");
  console.error("Please set VITE_CONVEX_URL or CONVEX_URL in your .env file");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Parse command line arguments
const args = process.argv.slice(2);
const exportSegments = args.includes("--segment");
const exportFreeOnly = args.includes("--free");

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[]): string {
  if (data.length === 0) return "";

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV rows
  const rows = data.map(obj => {
    return headers.map(header => {
      let value = obj[header];

      // Handle special values
      if (value === null || value === undefined) {
        value = "";
      } else if (typeof value === "object") {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }

      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }

      return value;
    }).join(",");
  });

  // Combine headers and rows
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Save CSV to file
 */
function saveCSV(filename: string, csvContent: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
  const fullFilename = `${filename}-${timestamp}.csv`;
  const filepath = path.join(process.cwd(), fullFilename);

  fs.writeFileSync(filepath, csvContent, "utf-8");

  return filepath;
}

/**
 * Main export function
 */
async function exportUsers() {
  console.log("🚀 Starting PropIQ user export...\n");

  try {
    if (exportSegments) {
      // Export users grouped by segment
      console.log("📊 Fetching users by segment...");
      const data = await client.query(api.exports.exportUsersBySegment, {});

      console.log("\n📈 Segment Breakdown:");
      console.log(`   Ghost users (signed up, never used): ${data.segments.ghost.count}`);
      console.log(`   One-time users (logged in but minimal usage): ${data.segments.oneTime.count}`);
      console.log(`   Cold users (inactive >30 days): ${data.segments.cold.count}`);
      console.log(`   Warm users (active within 30 days): ${data.segments.warm.count}`);
      console.log(`   Active users (active within 7 days): ${data.segments.active.count}`);
      console.log(`   Total: ${data.totalUsers}\n`);

      // Save each segment to separate CSV
      for (const [segmentName, segmentData] of Object.entries(data.segments)) {
        if (segmentData.users.length > 0) {
          const csv = arrayToCSV(segmentData.users);
          const filepath = saveCSV(`propiq-users-${segmentName}`, csv);
          console.log(`✅ Saved ${segmentData.count} ${segmentName} users to: ${filepath}`);
        }
      }
    } else if (exportFreeOnly) {
      // Export only free tier users
      console.log("📊 Fetching free tier users...");
      const data = await client.query(api.exports.exportFreeTrialUsers, {});

      console.log("\n📈 Free Tier Users:");
      console.log(`   Total free users: ${data.totalCount}`);
      console.log(`   Ghost: ${data.segmentBreakdown.ghost}`);
      console.log(`   One-time: ${data.segmentBreakdown.oneTime}`);
      console.log(`   Cold: ${data.segmentBreakdown.cold}`);
      console.log(`   Warm: ${data.segmentBreakdown.warm}`);
      console.log(`   Active: ${data.segmentBreakdown.active}\n`);

      const csv = arrayToCSV(data.users);
      const filepath = saveCSV("propiq-users-free-tier", csv);
      console.log(`✅ Saved ${data.totalCount} free tier users to: ${filepath}`);
    } else {
      // Export all users
      console.log("📊 Fetching all users...");
      const data = await client.query(api.exports.exportAllUsers, {});

      console.log(`\n📈 Total users: ${data.totalCount}\n`);

      const csv = arrayToCSV(data.users);
      const filepath = saveCSV("propiq-users-export", csv);
      console.log(`✅ Saved ${data.totalCount} users to: ${filepath}`);
    }

    console.log("\n✨ Export complete!\n");
  } catch (error: any) {
    console.error("\n❌ Export failed:");
    console.error(error.message || error);
    process.exit(1);
  }
}

// Run export
exportUsers();
