#!/usr/bin/env npx tsx

/**
 * Direct Resend API test
 */

const RESEND_API_KEY = "re_gYqsNdmm_J28LGczXvRscJDEwUb61AitP";
const TEST_EMAIL = "bdusape@gmail.com";

console.log("📧 Testing Resend API directly");
console.log("=" .repeat(80));

async function testResend() {
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
        subject: "PropIQ Email Test - Direct API",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>✅ Email Working!</h1>
              <p>This email was sent directly to the Resend API.</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p>If you receive this, your Resend integration is working correctly!</p>
            </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Email sent successfully!");
      console.log("Email ID:", data.id);
      console.log("\nCheck your inbox at:", TEST_EMAIL);
    } else {
      console.error("❌ Failed to send email");
      console.error("Status:", response.status);
      console.error("Error:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testResend();
