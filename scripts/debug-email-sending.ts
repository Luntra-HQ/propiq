#!/usr/bin/env npx tsx

/**
 * Debug Email Sending
 *
 * This script tests:
 * 1. Direct Resend API call
 * 2. Convex resendVerificationEmail mutation
 * 3. HTTP endpoint /auth/resend-verification
 */

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const RESEND_API_KEY = "re_4CdJEL2t_GcMioqLz1JeNnpd7Y6QNG7aG";
const TEST_EMAIL = "bdusape@gmail.com";
const API_URL = "https://mild-tern-361.convex.site";

console.log("🔍 Email Delivery Debugging");
console.log("=" .repeat(80));
console.log(`Test Email: ${TEST_EMAIL}`);
console.log(`API URL: ${API_URL}`);
console.log(`Resend API Key: ${RESEND_API_KEY.substring(0, 10)}...`);
console.log("=" .repeat(80));
console.log();

/**
 * Test 1: Direct Resend API call
 */
async function testDirectResend() {
  console.log("📧 Test 1: Direct Resend API Call");
  console.log("-".repeat(80));

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PropIQ <noreply@propiq.luntra.one>",
        to: TEST_EMAIL,
        subject: "Test Email from PropIQ Debug Script",
        html: `
          <html>
            <body>
              <h1>Test Email</h1>
              <p>This is a test email sent directly from the debug script.</p>
              <p>If you receive this, Resend API is working correctly.</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Email sent successfully!");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      console.error("❌ Failed to send email");
      console.error("Status:", response.status);
      console.error("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log();
}

/**
 * Test 2: Convex HTTP endpoint
 */
async function testConvexEndpoint() {
  console.log("📧 Test 2: Convex HTTP Endpoint /auth/resend-verification");
  console.log("-".repeat(80));

  try {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
      }),
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("✅ Endpoint returned success");
    } else {
      console.log("❌ Endpoint returned failure");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log();
}

/**
 * Test 3: Check Resend logs via API
 */
async function checkResendLogs() {
  console.log("📋 Test 3: Check Recent Resend Email Logs");
  console.log("-".repeat(80));

  try {
    const response = await fetch("https://api.resend.com/emails?limit=10", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Recent emails sent:");
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((email: any, index: number) => {
          console.log(`\n${index + 1}. Email ID: ${email.id}`);
          console.log(`   To: ${email.to}`);
          console.log(`   Subject: ${email.subject}`);
          console.log(`   Status: ${email.last_event}`);
          console.log(`   Created: ${new Date(email.created_at).toLocaleString()}`);
        });
      } else {
        console.log("No recent emails found");
        console.log("Response:", JSON.stringify(data, null, 2));
      }
    } else {
      console.error("❌ Failed to fetch logs");
      console.error("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log();
}

// Run all tests
(async () => {
  await testDirectResend();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await testConvexEndpoint();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await checkResendLogs();

  console.log("=" .repeat(80));
  console.log("✅ All tests complete");
  console.log("=" .repeat(80));
})();
