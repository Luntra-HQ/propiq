/**
 * Simple Resend Test via Convex HTTP Endpoint
 *
 * Tests that email sending is working by triggering a resend verification email.
 * This tests the full flow: Convex → Resend API → Email delivery
 *
 * Usage: npx tsx scripts/test-resend-simple.ts <email@example.com>
 */

const CONVEX_URL = process.env.VITE_CONVEX_URL || 'https://mild-tern-361.convex.cloud';
const API_URL = CONVEX_URL.replace('.convex.cloud', '.convex.site');

const testEmail = process.argv[2] || 'test@example.com';

console.log('🧪 Simple Resend API Test via Convex');
console.log('='.repeat(80));
console.log(`API URL: ${API_URL}`);
console.log(`Test Email: ${testEmail}`);
console.log('='.repeat(80) + '\n');

async function testResendAPI() {
  console.log('📧 Step 1: Testing resend verification email endpoint...\n');

  try {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();

    if (data.success) {
      console.log('\n✅ SUCCESS: Resend API is working!');
      console.log(`   Message: ${data.message}`);
      console.log('\nThis means:');
      console.log('  ✓ Convex HTTP endpoint is working');
      console.log('  ✓ RESEND_API_KEY is configured in Convex');
      console.log('  ✓ Email was sent to Resend API');
      console.log('\nNext steps:');
      console.log('  1. Check if email arrived in inbox');
      console.log('  2. Check Resend dashboard: https://resend.com/emails');
      console.log('  3. Verify domain status in Resend');
    } else {
      console.log('\n❌ FAILED: Resend API returned error');
      console.log(`   Error: ${data.error}`);
      console.log('\nPossible causes:');
      console.log('  1. RESEND_API_KEY not set in Convex');
      console.log('  2. RESEND_API_KEY is invalid');
      console.log('  3. Resend API is down');
      console.log('  4. Domain not verified in Resend');
      console.log('\nTo fix:');
      console.log('  - Check Convex env: npx convex env list | grep RESEND');
      console.log('  - Verify API key at: https://resend.com/api-keys');
      console.log('  - Check domain at: https://resend.com/domains');
    }

    console.log('\n' + '='.repeat(80));
    console.log('Response Data:');
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('❌ Network error:', error.message);
    console.log('\nPlease check:');
    console.log('  1. Backend is running');
    console.log('  2. VITE_CONVEX_URL is correct');
    console.log('  3. Internet connection is active\n');
  }
}

testResendAPI().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
