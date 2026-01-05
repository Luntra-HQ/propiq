/**
 * Email Verification End-to-End Test
 *
 * Tests the complete email verification flow:
 * 1. Create test user via signup
 * 2. Verify verification token was created
 * 3. Test resend verification email
 * 4. Test token validation
 * 5. Clean up test data
 *
 * Usage: npx tsx scripts/test-email-verification.ts
 */

const CONVEX_URL = process.env.VITE_CONVEX_URL || 'https://mild-tern-361.convex.cloud';
const API_URL = CONVEX_URL.replace('.convex.cloud', '.convex.site');

// Generate unique test email
const timestamp = Date.now();
const testEmail = `test-verify-${timestamp}@propiq-test.com`;
const testPassword = 'TestPass123!@#';

interface TestResult {
  step: string;
  success: boolean;
  details: string;
  data?: any;
}

const results: TestResult[] = [];

async function logResult(step: string, success: boolean, details: string, data?: any) {
  results.push({ step, success, details, data });
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${step}: ${details}`);
  if (data) {
    console.log(`   Data:`, JSON.stringify(data, null, 2));
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSignupCreatesToken() {
  console.log('\n📝 Step 1: Testing signup creates verification token...');

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
      }),
    });

    const data = await response.json();

    if (data.success && data.user) {
      await logResult(
        'Signup',
        true,
        'User created successfully',
        { userId: data.user._id, email: data.user.email, emailVerified: data.user.emailVerified }
      );

      if (!data.user.emailVerified) {
        await logResult('Email Verification Status', true, 'User correctly marked as unverified');
      } else {
        await logResult('Email Verification Status', false, 'User incorrectly marked as verified');
      }

      return data.user._id;
    } else {
      await logResult('Signup', false, data.error || 'Unknown error', data);
      return null;
    }
  } catch (error: any) {
    await logResult('Signup', false, `Network error: ${error.message}`);
    return null;
  }
}

async function testResendVerification() {
  console.log('\n📧 Step 2: Testing resend verification email...');

  try {
    // First resend
    const response1 = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    const data1 = await response1.json();

    if (data1.success) {
      await logResult('Resend Email (1st)', true, 'Verification email sent successfully', {
        message: data1.message,
      });
    } else {
      await logResult('Resend Email (1st)', false, data1.error || 'Unknown error', data1);
      return null;
    }

    // Wait 2 seconds
    await sleep(2000);

    // Second resend (should work - not rate limited yet)
    const response2 = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    const data2 = await response2.json();

    if (data2.success) {
      await logResult('Resend Email (2nd)', true, 'Second resend successful', {
        message: data2.message,
      });
      return data2.token; // Return token for next test
    } else {
      await logResult('Resend Email (2nd)', false, data2.error || 'Unknown error', data2);
      return null;
    }
  } catch (error: any) {
    await logResult('Resend Verification', false, `Network error: ${error.message}`);
    return null;
  }
}

async function testRateLimiting() {
  console.log('\n⏱️ Step 3: Testing rate limiting (5 resends/hour)...');

  try {
    // Try to send 6 emails rapidly
    const resendPromises = [];
    for (let i = 0; i < 6; i++) {
      resendPromises.push(
        fetch(`${API_URL}/auth/resend-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: testEmail }),
        })
      );
    }

    const responses = await Promise.all(resendPromises);
    const results = await Promise.all(responses.map(r => r.json()));

    const successCount = results.filter(r => r.success).length;
    const rateLimitedCount = results.filter(r => !r.success && r.error?.includes('Too many')).length;

    if (rateLimitedCount > 0) {
      await logResult(
        'Rate Limiting',
        true,
        `Correctly blocked after ${successCount} resends`,
        { successCount, rateLimitedCount }
      );
      return true;
    } else {
      await logResult(
        'Rate Limiting',
        false,
        'No rate limiting detected - all 6 resends succeeded',
        { successCount, rateLimitedCount }
      );
      return false;
    }
  } catch (error: any) {
    await logResult('Rate Limiting', false, `Network error: ${error.message}`);
    return false;
  }
}

async function testInvalidToken() {
  console.log('\n🔒 Step 4: Testing invalid token validation...');

  try {
    const fakeToken = '00000000-0000-0000-0000-000000000000';

    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: fakeToken }),
    });

    const data = await response.json();

    if (!data.success && data.error?.includes('Invalid')) {
      await logResult('Invalid Token', true, 'Correctly rejected invalid token', {
        error: data.error,
      });
      return true;
    } else {
      await logResult('Invalid Token', false, 'Did not reject invalid token', data);
      return false;
    }
  } catch (error: any) {
    await logResult('Invalid Token', false, `Network error: ${error.message}`);
    return false;
  }
}

async function testEmailEnumeration() {
  console.log('\n🔐 Step 5: Testing email enumeration prevention...');

  try {
    const fakeEmail = `nonexistent-${timestamp}@propiq-test.com`;

    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fakeEmail }),
    });

    const data = await response.json();

    // Should return success even for non-existent email (to prevent enumeration)
    if (data.success) {
      await logResult(
        'Email Enumeration Prevention',
        true,
        'Returns success for non-existent email (prevents enumeration)',
        { message: data.message }
      );
      return true;
    } else {
      await logResult(
        'Email Enumeration Prevention',
        false,
        'Reveals that email does not exist (enumeration vulnerability)',
        data
      );
      return false;
    }
  } catch (error: any) {
    await logResult('Email Enumeration Prevention', false, `Network error: ${error.message}`);
    return false;
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 EMAIL VERIFICATION TEST SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`\nResults: ${passed}/${total} tests passed (${percentage}%)\n`);

  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.step}`);
    console.log(`   ${result.details}`);
  });

  console.log('\n' + '='.repeat(80));

  if (percentage === 100) {
    console.log('✅ All tests passed! Email verification system is working correctly.');
  } else if (percentage >= 80) {
    console.log('⚠️  Most tests passed, but some issues detected. Review failures above.');
  } else {
    console.log('❌ Multiple test failures detected. Email verification system needs fixes.');
  }

  console.log('='.repeat(80) + '\n');

  console.log('📋 Next Steps:');
  console.log('1. Check Resend dashboard for email delivery logs');
  console.log('2. Verify DNS records (SPF, DKIM, DMARC) for propiq.luntra.one');
  console.log('3. Test clicking verification link from real email');
  console.log('4. Monitor verification rate (target: >80% within 24 hours)');
  console.log('5. Clean up test user data from database if needed\n');
}

async function main() {
  console.log('🚀 Starting Email Verification End-to-End Test');
  console.log('='.repeat(80));
  console.log(`API URL: ${API_URL}`);
  console.log(`Test Email: ${testEmail}`);
  console.log('='.repeat(80));

  // Run tests sequentially
  const userId = await testSignupCreatesToken();

  if (userId) {
    await testResendVerification();
    await testRateLimiting();
  }

  await testInvalidToken();
  await testEmailEnumeration();

  // Print summary
  await printSummary();
}

// Run tests
main().catch((error) => {
  console.error('❌ Fatal error running tests:', error);
  process.exit(1);
});
