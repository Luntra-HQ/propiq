/**
 * Test Formspree Webhook Integration
 * Simulates what Formspree sends to verify our endpoint works
 */

async function testWebhook() {
  const WEBHOOK_URL = "https://mild-tern-361.convex.site/webhook/formspree";

  console.log("🧪 Testing Formspree Webhook Integration\n");
  console.log(`Webhook URL: ${WEBHOOK_URL}\n`);

  // Simulate what Formspree sends
  const testData = {
    email: "webhook-test@example.com",
    firstName: "Webhook",
    leadMagnet: "test-lead-magnet",
    source: "landing-page",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "test-campaign",
  };

  console.log("📤 Sending test webhook with data:");
  console.log(JSON.stringify(testData, null, 2));
  console.log();

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Webhook Test PASSED!\n");
      console.log("Response:");
      console.log(JSON.stringify(result, null, 2));
      console.log("\n🎉 Your webhook endpoint is working correctly!");
      console.log("\nNext step: Configure this webhook in Formspree dashboard:");
      console.log("  1. Login to formspree.io");
      console.log("  2. Go to form xldqywge");
      console.log("  3. Integrations → Add Webhook");
      console.log(`  4. Enter URL: ${WEBHOOK_URL}`);
      console.log("  5. Save\n");
    } else {
      console.log("❌ Webhook Test FAILED\n");
      console.log(`Status: ${response.status}`);
      console.log("Response:");
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("❌ Error testing webhook:", error);
  }
}

testWebhook();
