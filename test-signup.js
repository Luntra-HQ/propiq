// Quick test to create a user and trigger email
const { ConvexHttpClient } = require("convex/browser");
const client = new ConvexHttpClient("https://mild-tern-361.convex.cloud");

async function testSignup() {
  const testEmail = "budsape+propiqtest1@gmail.com";
  const result = await client.mutation("auth:signup", {
    email: testEmail,
    password: "TestPassword123!",
    firstName: "Brian",
    lastName: "Test"
  });
  
  console.log("✅ Signup successful:", result);
  console.log(`📧 Check email at: ${testEmail}`);
  console.log("⏰ Email should arrive within 1-2 minutes");
}

testSignup().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
