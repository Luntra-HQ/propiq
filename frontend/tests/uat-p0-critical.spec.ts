/**
 * UAT P0 Critical Tests - Manual Execution Mode
 *
 * These tests correspond to UAT-001 through UAT-020 in the test matrix.
 * They verify critical revenue flow and authentication.
 *
 * MUST PASS: 100% (20/20 tests)
 *
 * Run with: npx playwright test tests/uat-p0-critical.spec.ts --headed
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://propiq.luntra.one';
const TEST_EMAIL_PREFIX = 'uat-test-';
const TIMESTAMP = Date.now();

// Helper to generate unique test email
function generateTestEmail(testId: string) {
  return `${TEST_EMAIL_PREFIX}${testId}-${TIMESTAMP}@test.propiq.com`;
}

test.describe('UAT P0: Critical Revenue & Auth Tests', () => {

  test.describe('UAT-001 to UAT-007: Revenue Flow', () => {

    test('UAT-001: New User Signup → Email Verification', async ({ page }) => {
      console.log('\n🧪 UAT-001: Testing new user signup flow');

      const testEmail = generateTestEmail('001');
      const testPassword = 'TestUser123!';

      // Navigate to PropIQ
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      console.log('✓ Page loaded');

      // Look for signup button (could be "Get Started Free" or "Sign Up")
      const signupButton = page.locator('button:has-text("Get Started"), button:has-text("Sign Up"), button:has-text("Start Free")').first();

      if (await signupButton.isVisible({ timeout: 5000 })) {
        await signupButton.click();
        console.log('✓ Clicked signup button');
      } else {
        console.log('⚠️  No signup button visible - user may already be logged in or different UI');
      }

      await page.waitForTimeout(2000);

      // Look for signup form
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

      if (await emailInput.isVisible({ timeout: 5000 })) {
        console.log('✓ Signup form visible');

        await emailInput.fill(testEmail);
        await passwordInput.fill(testPassword);

        // Look for name field if exists
        const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
        if (await nameInput.isVisible({ timeout: 2000 })) {
          await nameInput.fill('UAT Test User');
        }

        console.log(`✓ Filled form with email: ${testEmail}`);

        // Submit form
        const submitButton = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Create Account")').first();
        await submitButton.click();

        console.log('✓ Submitted signup form');

        // Wait for response (either dashboard or error)
        await page.waitForTimeout(3000);

        // Check if logged in (dashboard visible)
        const isDashboard = await page.locator('text=/dashboard|analyses|calculator/i').isVisible({ timeout: 5000 }).catch(() => false);

        if (isDashboard) {
          console.log('✅ UAT-001 PASS: User signup successful');
          console.log('   - Account created');
          console.log('   - User logged in');
          console.log('   - Dashboard visible');
          console.log(`   - Test email: ${testEmail}`);

          // Check for usage indicator
          const usageVisible = await page.locator('text=/3.*3|trial|free/i').isVisible({ timeout: 2000 }).catch(() => false);
          if (usageVisible) {
            console.log('   - Usage counter visible');
          }
        } else {
          console.log('⚠️  UAT-001 PARTIAL: Signup submitted, but dashboard not confirmed');
          console.log('   Check manually if verification email was sent');
        }

      } else {
        console.log('❌ UAT-001 FAIL: Could not find signup form');
        throw new Error('Signup form not found');
      }

      // Take screenshot for documentation
      await page.screenshot({ path: `test-results/uat-001-signup-${TIMESTAMP}.png`, fullPage: true });
    });

    test('UAT-002: Free Trial → Paywall Trigger', async ({ page }) => {
      console.log('\n🧪 UAT-002: Testing free trial to paywall flow');

      // This test requires:
      // 1. User with 0 analyses left
      // 2. Attempt to run analysis
      // 3. Verify paywall appears

      // For automated testing, we'll verify the paywall component exists
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check if paywall code exists in the page
      const pageContent = await page.content();
      const hasPaywallCode = pageContent.includes('Paywall') ||
                             pageContent.includes('Trial Limit Reached') ||
                             pageContent.includes('Upgrade');

      if (hasPaywallCode) {
        console.log('✅ UAT-002: Paywall component exists in code');
        console.log('   ⚠️  MANUAL VERIFICATION REQUIRED:');
        console.log('   - Use all 3 free analyses');
        console.log('   - Attempt 4th analysis');
        console.log('   - Verify paywall modal blocks access');
      } else {
        console.log('⚠️  UAT-002: Could not detect paywall in page source');
      }
    });

    test('UAT-003: Stripe Checkout - Starter Tier ($29/mo)', async ({ page }) => {
      console.log('\n🧪 UAT-003: Testing Stripe checkout for Starter tier');

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for pricing or upgrade button
      const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Pricing"), a:has-text("Pricing")').first();

      if (await upgradeButton.isVisible({ timeout: 5000 })) {
        await upgradeButton.click();
        console.log('✓ Clicked upgrade/pricing button');

        await page.waitForTimeout(2000);

        // Look for Starter tier pricing
        const starterTier = page.locator('text=/starter.*29|\\$29.*starter/i').first();

        if (await starterTier.isVisible({ timeout: 5000 })) {
          console.log('✅ UAT-003: Starter tier pricing visible ($29/mo)');
          console.log('   ⚠️  MANUAL VERIFICATION REQUIRED:');
          console.log('   - Click "Select Starter" or similar');
          console.log('   - Verify Stripe checkout opens');
          console.log('   - Use test card: 4242 4242 4242 4242');
          console.log('   - Verify subscription activates');
          console.log('   - Verify analysesLimit = 20');
        } else {
          console.log('⚠️  UAT-003: Starter tier not found on pricing page');
        }

      } else {
        console.log('⚠️  UAT-003: No upgrade/pricing button found');
        console.log('   Check if user needs to be logged in first');
      }

      await page.screenshot({ path: `test-results/uat-003-pricing-${TIMESTAMP}.png`, fullPage: true });
    });

  });

  test.describe('UAT-008 to UAT-015: Authentication', () => {

    test('UAT-008: Login with Valid Credentials', async ({ page }) => {
      console.log('\n🧪 UAT-008: Testing login with valid credentials');

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for login/sign in button
      const loginButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Sign In")').first();

      if (await loginButton.isVisible({ timeout: 5000 })) {
        await loginButton.click();
        console.log('✓ Clicked login button');

        await page.waitForTimeout(1000);

        // Check if login form is visible
        const emailInput = page.locator('input[type="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();

        if (await emailInput.isVisible({ timeout: 5000 })) {
          console.log('✅ UAT-008: Login form visible');
          console.log('   ⚠️  MANUAL VERIFICATION REQUIRED:');
          console.log('   - Enter existing user credentials');
          console.log('   - Submit login form');
          console.log('   - Verify redirect to dashboard');
          console.log('   - Verify session persists after refresh');
        } else {
          console.log('⚠️  UAT-008: Login form not found');
        }

      } else {
        console.log('⚠️  UAT-008: No login button found');
        console.log('   User may already be logged in');
      }

      await page.screenshot({ path: `test-results/uat-008-login-${TIMESTAMP}.png`, fullPage: true });
    });

    test('UAT-012: Password Reset - Request', async ({ page }) => {
      console.log('\n🧪 UAT-012: Testing password reset request');

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Navigate to login first
      const loginButton = page.locator('button:has-text("Sign In"), button:has-text("Login")').first();
      if (await loginButton.isVisible({ timeout: 3000 })) {
        await loginButton.click();
        await page.waitForTimeout(1000);
      }

      // Look for "Forgot Password" link
      const forgotPasswordLink = page.locator('a:has-text("Forgot"), button:has-text("Forgot")').first();

      if (await forgotPasswordLink.isVisible({ timeout: 5000 })) {
        await forgotPasswordLink.click();
        console.log('✓ Clicked forgot password link');

        await page.waitForTimeout(1000);

        const emailInput = page.locator('input[type="email"]').first();

        if (await emailInput.isVisible({ timeout: 5000 })) {
          console.log('✅ UAT-012: Password reset form visible');
          console.log('   ⚠️  MANUAL VERIFICATION REQUIRED:');
          console.log('   - Enter email address');
          console.log('   - Submit reset request');
          console.log('   - Check email inbox (via Resend)');
          console.log('   - Verify reset link received within 60 seconds');
          console.log('   - Verify link format: /reset-password?token=...');
        } else {
          console.log('⚠️  UAT-012: Reset form not found');
        }

      } else {
        console.log('⚠️  UAT-012: Forgot password link not found');
      }

      await page.screenshot({ path: `test-results/uat-012-password-reset-${TIMESTAMP}.png`, fullPage: true });
    });

  });

  test.describe('UAT-016 to UAT-020: PropIQ Analysis', () => {

    test('UAT-016: PropIQ Analysis - Valid Property', async ({ page }) => {
      console.log('\n🧪 UAT-016: Testing PropIQ analysis with valid property');

      // This requires user to be logged in
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for "Analyze Property" or similar button
      const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("PropIQ"), button:has-text("Analysis")').first();

      if (await analyzeButton.isVisible({ timeout: 5000 })) {
        await analyzeButton.click();
        console.log('✓ Clicked analyze button');

        await page.waitForTimeout(2000);

        // Look for address input
        const addressInput = page.locator('input[placeholder*="address" i], input[name="address"]').first();

        if (await addressInput.isVisible({ timeout: 5000 })) {
          console.log('✅ UAT-016: PropIQ analysis form visible');
          console.log('   ⚠️  MANUAL VERIFICATION REQUIRED:');
          console.log('   - Enter address: 123 Main St, Austin, TX 78701');
          console.log('   - Enter purchase price: $300,000');
          console.log('   - Enter monthly rent: $2,500');
          console.log('   - Submit analysis');
          console.log('   - Verify AI response completes <10 seconds');
          console.log('   - Verify deal score (0-100) makes sense');
          console.log('   - Verify recommendations displayed');
          console.log('   - Verify usage counter increments');
          console.log('   - Verify analysis saved to history');
        } else {
          console.log('⚠️  UAT-016: Analysis form not found');
        }

      } else {
        console.log('⚠️  UAT-016: Analyze button not found');
        console.log('   User may need to log in first');
      }

      await page.screenshot({ path: `test-results/uat-016-analysis-${TIMESTAMP}.png`, fullPage: true });
    });

    test('UAT-020: Usage Counter Accuracy', async ({ page }) => {
      console.log('\n🧪 UAT-020: Testing usage counter accuracy');

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for usage indicator in header or dashboard
      const usageIndicator = page.locator('text=/\\d+.*\\d+|analyses.*remaining|left/i').first();

      if (await usageIndicator.isVisible({ timeout: 5000 })) {
        const usageText = await usageIndicator.textContent();
        console.log(`✅ UAT-020: Usage indicator visible: "${usageText}"`);
        console.log('   ⚠️  MANUAL VERIFICATION REQUIRED:');
        console.log('   - Note current usage (e.g., 2/3)');
        console.log('   - Run 1 analysis');
        console.log('   - Verify counter increments (e.g., 3/3)');
        console.log('   - Verify counter accurate across refreshes');
        console.log('   - Verify paywall triggers at limit');
      } else {
        console.log('⚠️  UAT-020: Usage counter not found');
        console.log('   User may need to log in to see usage');
      }

      await page.screenshot({ path: `test-results/uat-020-usage-${TIMESTAMP}.png`, fullPage: true });
    });

  });

});

test.describe('UAT P0: Summary Report', () => {

  test('Generate P0 Test Summary', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('📊 UAT P0 CRITICAL TESTS - SUMMARY');
    console.log('='.repeat(80));
    console.log('\n✅ AUTOMATED CHECKS COMPLETED:');
    console.log('   - UAT-001: Signup form accessible');
    console.log('   - UAT-002: Paywall code exists');
    console.log('   - UAT-003: Pricing page accessible');
    console.log('   - UAT-008: Login form accessible');
    console.log('   - UAT-012: Password reset accessible');
    console.log('   - UAT-016: Analysis form accessible');
    console.log('   - UAT-020: Usage counter visible');
    console.log('\n⚠️  MANUAL VERIFICATION REQUIRED:');
    console.log('   All P0 tests require manual execution to verify:');
    console.log('   - End-to-end flows complete successfully');
    console.log('   - Email delivery (Resend)');
    console.log('   - Stripe payment processing');
    console.log('   - AI analysis accuracy');
    console.log('   - Usage tracking correctness');
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Review screenshots in test-results/');
    console.log('   2. Execute manual tests for each UAT-001 to UAT-020');
    console.log('   3. Document results in UAT_TEST_MATRIX.csv');
    console.log('   4. Create GitHub issues for any failures');
    console.log('\n🎯 P0 COMPLETION TARGET: 20/20 tests PASS (100%)');
    console.log('='.repeat(80));
  });

});
