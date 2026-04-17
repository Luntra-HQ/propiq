/**
 * Real Email Delivery Test
 *
 * Tests actual email delivery via Resend API after domain configuration.
 * Creates a test user and triggers verification email.
 *
 * Usage: npx tsx scripts/test-real-email-delivery.ts <your-email@example.com>
 */

const CONVEX_URL = process.env.VITE_CONVEX_URL || 'https://mild-tern-361.convex.cloud';
const API_URL = CONVEX_URL.replace('.convex.cloud', '.convex.site');

// Get email from command line argument
const testEmail = process.argv[2];

if (!testEmail) {
  console.error('❌ Error: Please provide an email address');
  console.log('\nUsage: npx tsx scripts/test-real-email-delivery.ts your-email@example.com\n');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(testEmail)) {
  console.error('❌ Error: Invalid email format');
  console.log('\nPlease provide a valid email address.\n');
  process.exit(1);
}

const timestamp = Date.now();
const testPassword = 'TestPass123!@#';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSignupAndEmailDelivery() {
  console.log('🚀 Testing Real Email Delivery via Resend');
  console.log('='.repeat(80));
  console.log(`API URL: ${API_URL}`);
  console.log(`Test Email: ${testEmail}`);
  console.log(`Timestamp: ${new Date(timestamp).toISOString()}`);
  console.log('='.repeat(80) + '\n');

  try {
    console.log('📝 Step 1: Creating test user account...');

    const signupResponse = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        company: 'PropIQ Testing',
      }),
    });

    const signupData = await signupResponse.json();

    if (!signupData.success) {
      console.error('❌ Signup failed:', signupData.error);

      // If user already exists, try resend instead
      if (signupData.error?.includes('already exists')) {
        console.log('\n⚠️  User already exists. Testing resend verification email instead...\n');
        return testResendVerification();
      }

      return;
    }

    console.log('✅ User created successfully');
    console.log(`   User ID: ${signupData.user._id}`);
    console.log(`   Email: ${signupData.user.email}`);
    console.log(`   Email Verified: ${signupData.user.emailVerified}`);

    // Check if verification email was sent
    console.log('\n📧 Step 2: Checking if verification email was sent...');

    // Wait 2 seconds for email to be sent
    await sleep(2000);

    console.log('✅ Signup completed - verification email should have been sent');
    console.log('\n' + '='.repeat(80));
    console.log('📬 CHECK YOUR EMAIL INBOX');
    console.log('='.repeat(80));
    console.log('\nPlease check your email inbox for:');
    console.log('- From: PropIQ <noreply@propiqhq.com>');
    console.log('- Subject: Verify your PropIQ email address');
    console.log('- Contains: Blue "Verify My Email" button');
    console.log('\n⚠️  Also check your SPAM/JUNK folder if not in inbox\n');

    console.log('📋 What to verify:');
    console.log('1. Email arrived in inbox (not spam)');
    console.log('2. Sender shows as "PropIQ <noreply@propiqhq.com>"');
    console.log('3. Email has proper formatting (not broken HTML)');
    console.log('4. "Verify My Email" button works and redirects to app');
    console.log('5. After clicking, see "Email Verified! 🎉" success page');
    console.log('6. Can login without verification warning\n');

    console.log('='.repeat(80));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(80));
    console.log('\nIf email did NOT arrive:');
    console.log('1. Check spam/junk folder');
    console.log('2. Verify Resend domain is fully verified (DNS records)');
    console.log('3. Check Resend dashboard logs: https://resend.com/emails');
    console.log('4. Try running resend test: npx tsx scripts/test-resend-verification.ts\n');

  } catch (error: any) {
    console.error('❌ Network error:', error.message);
    console.log('\nPlease check:');
    console.log('1. Backend is running');
    console.log('2. CONVEX_URL is correct');
    console.log('3. Internet connection is active\n');
  }
}

async function testResendVerification() {
  console.log('📧 Testing resend verification email...\n');

  try {
    const resendResponse = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    const resendData = await resendResponse.json();

    if (resendData.success) {
      console.log('✅ Verification email resend successful');
      console.log(`   Message: ${resendData.message}`);

      // Wait 2 seconds
      await sleep(2000);

      console.log('\n' + '='.repeat(80));
      console.log('📬 CHECK YOUR EMAIL INBOX');
      console.log('='.repeat(80));
      console.log('\nA new verification email has been sent to:', testEmail);
      console.log('\nPlease check your email inbox (and spam folder)');
      console.log('for the verification email from PropIQ.\n');

      console.log('='.repeat(80));
      console.log('✅ RESEND TEST COMPLETE');
      console.log('='.repeat(80) + '\n');
    } else {
      console.error('❌ Resend failed:', resendData.error);
    }
  } catch (error: any) {
    console.error('❌ Network error:', error.message);
  }
}

// Run test
testSignupAndEmailDelivery().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
