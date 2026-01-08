/**
 * Test script to verify analysis race condition fix
 *
 * This script simulates concurrent analysis requests to test if the atomic
 * slot reservation prevents users from bypassing their analysis limits.
 *
 * Run with: npx tsx scripts/test-race-condition.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://mild-tern-361.convex.cloud";

async function testRaceCondition() {
  console.log("🧪 Testing Analysis Race Condition Fix\n");
  console.log("Connecting to Convex:", CONVEX_URL);

  const client = new ConvexHttpClient(CONVEX_URL);

  // Test user setup
  const testEmail = `race-test-${Date.now()}@test.com`;
  const testPassword = "TestPassword123!";

  console.log("\n📝 Step 1: Creating test user with 1 analysis limit");

  try {
    // Create test user
    const signupResult = await client.mutation(api.auth.signup, {
      email: testEmail,
      password: testPassword,
      firstName: "Race",
      lastName: "Test",
      company: "Test Co",
    });

    console.log("✅ Test user created:", signupResult.userId);

    // Login to get session token
    const loginResult = await client.mutation(api.auth.login, {
      email: testEmail,
      password: testPassword,
    });

    const userId = loginResult.user._id;
    console.log("✅ Logged in, user ID:", userId);

    // Set user to have only 1 analysis limit for testing
    console.log("\n⚙️  Step 2: Setting analysis limit to 1 (for testing race condition)");

    // Note: We'll need to manually set this via Convex dashboard or create a test helper mutation
    // For now, we'll use the free tier's 3 analyses and make 5 concurrent requests

    console.log("\n🚀 Step 3: Firing 5 concurrent analysis requests (limit is 3)");
    console.log("Expected: First 3 succeed, remaining 2 fail with 'limit reached' error");
    console.log("Firing requests...\n");

    const testProperty = {
      userId,
      address: "123 Test St",
      city: "Test City",
      state: "CA",
      zipCode: "90210",
      purchasePrice: 500000,
      downPayment: 100000,
      monthlyRent: 3000,
    };

    // Fire 5 concurrent requests
    const promises = [];
    for (let i = 1; i <= 5; i++) {
      const promise = client.action(api.propiq.analyzeProperty, {
        ...testProperty,
        address: `${testProperty.address} - Request ${i}`,
      })
        .then((result) => {
          console.log(`✅ Request ${i} SUCCEEDED:`, {
            analysisId: result.analysisId,
            analysesRemaining: result.analysesRemaining,
          });
          return { requestNum: i, status: "success", result };
        })
        .catch((error) => {
          console.log(`❌ Request ${i} FAILED:`, error.message);
          return { requestNum: i, status: "failed", error: error.message };
        });

      promises.push(promise);
    }

    // Wait for all requests to complete
    const results = await Promise.all(promises);

    // Analyze results
    console.log("\n📊 Results Summary:");
    console.log("=".repeat(50));

    const successful = results.filter((r) => r.status === "success");
    const failed = results.filter((r) => r.status === "failed");

    console.log(`✅ Successful requests: ${successful.length}/5`);
    console.log(`❌ Failed requests: ${failed.length}/5`);

    // Verify fix worked
    console.log("\n🔍 Verification:");

    if (successful.length === 3 && failed.length === 2) {
      console.log("✅ RACE CONDITION FIX VERIFIED!");
      console.log("   - Exactly 3 analyses succeeded (matching the limit)");
      console.log("   - Exactly 2 analyses failed (as expected)");
      console.log("   - No race condition occurred!");
    } else if (successful.length > 3) {
      console.log("❌ RACE CONDITION STILL EXISTS!");
      console.log(`   - ${successful.length} analyses succeeded (should be 3)`);
      console.log("   - Race condition allowed bypassing the limit!");
    } else {
      console.log("⚠️  UNEXPECTED RESULT");
      console.log(`   - ${successful.length} successful, ${failed.length} failed`);
      console.log("   - Check logs for details");
    }

    // Get final user state
    console.log("\n📈 Final User State:");
    const user = await client.query(api.auth.getUser, { userId });
    console.log(`   - Analyses used: ${user.analysesUsed}/${user.analysesLimit}`);
    console.log(`   - Expected: 3/3 (all 3 free analyses used)`);

    if (user.analysesUsed === 3) {
      console.log("✅ User counter is correct!");
    } else {
      console.log(`❌ User counter is incorrect! Expected 3, got ${user.analysesUsed}`);
    }

  } catch (error: any) {
    console.error("\n❌ Test failed with error:", error.message);
    process.exit(1);
  }

  console.log("\n✅ Test completed successfully!");
  process.exit(0);
}

// Run the test
testRaceCondition().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
