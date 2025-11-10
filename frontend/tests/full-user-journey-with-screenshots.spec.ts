import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://propiq.luntra.one';
const SCREENSHOTS_DIR = './test-results/evidence';

// Helper function to take timestamped screenshots
async function captureEvidence(page: Page, testName: string, action: string, timing: 'before' | 'after') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${testName}__${action}__${timing}__${timestamp}.png`;
  const filepath = `${SCREENSHOTS_DIR}/${filename}`;

  await page.screenshot({
    path: filepath,
    fullPage: true
  });

  console.log(`📸 Screenshot: ${filename}`);
  return filepath;
}

test.describe('PropIQ UAT - Complete User Journey with Evidence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any previous state
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('01 - Landing page loads and displays hero content', async ({ page }) => {
    console.log('\n🧪 UAT Test 01: Landing Page Display');

    // Evidence: Initial page load
    await captureEvidence(page, 'test-01', 'page-load', 'after');

    // Verify hero content is visible
    const heroVisible = await page.locator('text=AI-Powered Property Analysis').isVisible();
    console.log(`  Hero text visible: ${heroVisible ? '✅' : '❌'}`);

    // Verify Get Started button exists
    const getStartedBtn = page.locator('button:has-text("Get Started")').first();
    const btnVisible = await getStartedBtn.isVisible();
    console.log(`  Get Started button visible: ${btnVisible ? '✅' : '❌'}`);

    await captureEvidence(page, 'test-01', 'verification-complete', 'after');

    expect(heroVisible).toBe(true);
    expect(btnVisible).toBe(true);
  });

  test('02 - Get Started button navigation', async ({ page }) => {
    console.log('\n🧪 UAT Test 02: Get Started Button Click');

    // Evidence BEFORE clicking
    await captureEvidence(page, 'test-02', 'get-started-button', 'before');
    console.log('  📌 About to click "Get Started" button');

    // Click Get Started
    const getStartedBtn = page.locator('button:has-text("Get Started")').first();
    await getStartedBtn.click();
    await page.waitForTimeout(1000);

    // Evidence AFTER clicking
    await captureEvidence(page, 'test-02', 'get-started-button', 'after');
    console.log('  ✓ Clicked "Get Started" button');

    // Verify navigation to signup page
    const signupVisible = await page.locator('text=Create Account').isVisible();
    const signupFormVisible = await page.locator('#signup-form').isVisible();

    console.log(`  Signup page loaded: ${signupVisible ? '✅' : '❌'}`);
    console.log(`  Signup form displayed: ${signupFormVisible ? '✅' : '❌'}`);

    expect(signupVisible || signupFormVisible).toBe(true);
  });

  test('03 - Sign In button navigation', async ({ page }) => {
    console.log('\n🧪 UAT Test 03: Sign In Button Click');

    // Evidence BEFORE clicking
    await captureEvidence(page, 'test-03', 'sign-in-button', 'before');
    console.log('  📌 About to click "Sign In" button');

    // Click Sign In
    const signInBtn = page.locator('button:has-text("Sign In")').first();
    await signInBtn.click();
    await page.waitForTimeout(1000);

    // Evidence AFTER clicking
    await captureEvidence(page, 'test-03', 'sign-in-button', 'after');
    console.log('  ✓ Clicked "Sign In" button');

    // Verify navigation to login page
    const loginVisible = await page.locator('text=Welcome Back').isVisible();
    const loginFormVisible = await page.locator('#login-form').isVisible();

    console.log(`  Login page loaded: ${loginVisible ? '✅' : '❌'}`);
    console.log(`  Login form displayed: ${loginFormVisible ? '✅' : '❌'}`);

    expect(loginVisible || loginFormVisible).toBe(true);
  });

  test('04 - Signup form submission', async ({ page }) => {
    console.log('\n🧪 UAT Test 04: Signup Form Submission');

    // Navigate to signup
    await page.locator('button:has-text("Get Started")').first().click();
    await page.waitForTimeout(1000);

    // Evidence BEFORE filling form
    await captureEvidence(page, 'test-04', 'signup-form-empty', 'before');
    console.log('  📌 About to fill signup form');

    // Fill form
    await page.fill('[name="name"]', 'UAT Test User');
    await page.fill('[name="email"]', 'uat@example.com');
    await page.fill('[name="password"]', 'testpass123');

    // Evidence AFTER filling, BEFORE submit
    await captureEvidence(page, 'test-04', 'signup-form-filled', 'after');
    console.log('  ✓ Filled signup form');

    // Evidence BEFORE submit
    await captureEvidence(page, 'test-04', 'signup-submit', 'before');
    console.log('  📌 About to submit signup form');

    // Submit form
    await page.locator('#signup-form button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Evidence AFTER submit
    await captureEvidence(page, 'test-04', 'signup-submit', 'after');
    console.log('  ✓ Submitted signup form');

    // Verify dashboard loaded
    const dashboardVisible = await page.locator('text=Deal IQ Analysis').isVisible();
    console.log(`  Dashboard loaded: ${dashboardVisible ? '✅' : '❌'}`);

    expect(dashboardVisible).toBe(true);
  });

  test('05 - Navigation: Home link', async ({ page }) => {
    console.log('\n🧪 UAT Test 05: Home Navigation Link');

    // Evidence BEFORE clicking
    await captureEvidence(page, 'test-05', 'home-link', 'before');
    console.log('  📌 About to click Home link');

    // Click Home navigation
    await page.locator('[data-nav="landing"]').first().click();
    await page.waitForTimeout(1000);

    // Evidence AFTER clicking
    await captureEvidence(page, 'test-05', 'home-link', 'after');
    console.log('  ✓ Clicked Home link');

    // Verify landing page loaded
    const landingVisible = await page.locator('text=AI-Powered Property Analysis').isVisible();
    console.log(`  Landing page loaded: ${landingVisible ? '✅' : '❌'}`);

    expect(landingVisible).toBe(true);
  });

  test('06 - Navigation: Pricing link', async ({ page }) => {
    console.log('\n🧪 UAT Test 06: Pricing Navigation Link');

    // Evidence BEFORE clicking
    await captureEvidence(page, 'test-06', 'pricing-link', 'before');
    console.log('  📌 About to click Pricing link');

    // Click Pricing navigation
    await page.locator('[data-nav="pricing"]').first().click();
    await page.waitForTimeout(1000);

    // Evidence AFTER clicking
    await captureEvidence(page, 'test-06', 'pricing-link', 'after');
    console.log('  ✓ Clicked Pricing link');

    // Verify pricing page loaded
    const pricingVisible = await page.locator('text=LUNTRA Pro Features').isVisible();
    console.log(`  Pricing page loaded: ${pricingVisible ? '✅' : '❌'}`);

    expect(pricingVisible).toBe(true);
  });

  test('07 - Pricing: All tiers display correctly', async ({ page }) => {
    console.log('\n🧪 UAT Test 07: Pricing Tiers Display');

    // Navigate to pricing
    await page.goto(`${BASE_URL}/#pricing`);
    await page.waitForTimeout(1000);

    // Evidence: Pricing page
    await captureEvidence(page, 'test-07', 'pricing-tiers', 'after');

    // Check all three tiers
    const tiers = [
      { name: 'Starter', price: '$69' },
      { name: 'Pro', price: '$99' },
      { name: 'Elite', price: '$149' }
    ];

    for (const tier of tiers) {
      const tierVisible = await page.locator(`text=${tier.name}`).first().isVisible();
      const priceVisible = await page.locator(`text=${tier.price}`).first().isVisible();

      console.log(`  ${tier.name} tier visible: ${tierVisible ? '✅' : '❌'}`);
      console.log(`  ${tier.name} price (${tier.price}) visible: ${priceVisible ? '✅' : '❌'}`);

      expect(tierVisible).toBe(true);
      expect(priceVisible).toBe(true);
    }
  });

  test('08 - Pricing: Starter tier button clickable', async ({ page }) => {
    console.log('\n🧪 UAT Test 08: Pricing Tier Button Click');

    // Navigate to pricing
    await page.goto(`${BASE_URL}/#pricing`);
    await page.waitForTimeout(1000);

    // Evidence BEFORE clicking
    await captureEvidence(page, 'test-08', 'starter-button', 'before');
    console.log('  📌 About to click Starter "Get Started" button');

    // Try clicking Starter tier button
    const starterButton = page.locator('[data-upgrade="starter"]').first();
    const isClickable = await starterButton.isEnabled();
    console.log(`  Starter button enabled: ${isClickable ? '✅' : '❌'}`);

    if (isClickable) {
      await starterButton.click();
      await page.waitForTimeout(1000);

      // Evidence AFTER clicking
      await captureEvidence(page, 'test-08', 'starter-button', 'after');
      console.log('  ✓ Clicked Starter button');
    }

    expect(isClickable).toBe(true);
  });

  test('09 - Direct URL navigation: #landing', async ({ page }) => {
    console.log('\n🧪 UAT Test 09: Direct URL Hash Navigation (#landing)');

    // Navigate directly to #landing
    await page.goto(`${BASE_URL}/#landing`);
    await page.waitForTimeout(1000);

    // Evidence
    await captureEvidence(page, 'test-09', 'landing-hash-navigation', 'after');

    // Verify landing page loaded
    const landingVisible = await page.locator('text=AI-Powered Property Analysis').isVisible();
    console.log(`  Landing page via #landing: ${landingVisible ? '✅' : '❌'}`);

    expect(landingVisible).toBe(true);
  });

  test('10 - Direct URL navigation: #login', async ({ page }) => {
    console.log('\n🧪 UAT Test 10: Direct URL Hash Navigation (#login)');

    // Navigate directly to #login
    await page.goto(`${BASE_URL}/#login`);
    await page.waitForTimeout(1000);

    // Evidence
    await captureEvidence(page, 'test-10', 'login-hash-navigation', 'after');

    // Verify login page loaded
    const loginVisible = await page.locator('text=Welcome Back').isVisible();
    console.log(`  Login page via #login: ${loginVisible ? '✅' : '❌'}`);

    expect(loginVisible).toBe(true);
  });

  test('11 - Direct URL navigation: #signup', async ({ page }) => {
    console.log('\n🧪 UAT Test 11: Direct URL Hash Navigation (#signup)');

    // Navigate directly to #signup
    await page.goto(`${BASE_URL}/#signup`);
    await page.waitForTimeout(1000);

    // Evidence
    await captureEvidence(page, 'test-11', 'signup-hash-navigation', 'after');

    // Verify signup page loaded
    const signupVisible = await page.locator('text=Create Account').isVisible();
    console.log(`  Signup page via #signup: ${signupVisible ? '✅' : '❌'}`);

    expect(signupVisible).toBe(true);
  });

  test('12 - Complete user journey with all evidence', async ({ page }) => {
    console.log('\n🧪 UAT Test 12: Complete User Journey');

    // Step 1: Landing page
    console.log('\n  Step 1: Landing page');
    await captureEvidence(page, 'test-12', 'step1-landing', 'after');

    // Step 2: Navigate to signup
    console.log('\n  Step 2: Navigate to signup');
    await captureEvidence(page, 'test-12', 'step2-signup-nav', 'before');
    await page.locator('[data-nav="signup"]').first().click();
    await page.waitForTimeout(500);
    await captureEvidence(page, 'test-12', 'step2-signup-nav', 'after');

    // Step 3: Fill signup form
    console.log('\n  Step 3: Fill signup form');
    await page.fill('[name="name"]', 'Journey Test User');
    await page.fill('[name="email"]', 'journey@example.com');
    await page.fill('[name="password"]', 'testpass123');
    await captureEvidence(page, 'test-12', 'step3-signup-filled', 'after');

    // Step 4: Submit signup
    console.log('\n  Step 4: Submit signup');
    await captureEvidence(page, 'test-12', 'step4-signup-submit', 'before');
    await page.locator('#signup-form button[type="submit"]').click();
    await page.waitForTimeout(2000);
    await captureEvidence(page, 'test-12', 'step4-signup-submit', 'after');

    // Step 5: View pricing
    console.log('\n  Step 5: Navigate to pricing');
    await captureEvidence(page, 'test-12', 'step5-pricing-nav', 'before');
    await page.locator('[data-nav="pricing"]').first().click();
    await page.waitForTimeout(500);
    await captureEvidence(page, 'test-12', 'step5-pricing-nav', 'after');

    // Step 6: Back to dashboard
    console.log('\n  Step 6: Return to dashboard');
    await page.locator('[data-nav="dashboard"]').first().click();
    await page.waitForTimeout(500);
    await captureEvidence(page, 'test-12', 'step6-dashboard', 'after');

    // Verify final state
    const dashboardVisible = await page.locator('text=Deal IQ Analysis').isVisible();
    console.log(`\n  Final dashboard state: ${dashboardVisible ? '✅' : '❌'}`);

    expect(dashboardVisible).toBe(true);
  });
});
