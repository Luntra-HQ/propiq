import { test, expect } from '@playwright/test';

const BASE_URL = 'https://propiq.luntra.one';

test.describe('PropIQ Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any previous state
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('01 - Landing page → Signup → Dashboard flow', async ({ page }) => {
    console.log('\n🧪 Testing: Landing → Signup → Dashboard');

    // Should start on landing page
    await expect(page.locator('text=AI-Powered Property Analysis')).toBeVisible();
    console.log('✅ Landing page loaded');

    // Click "Get Started Free" button
    await page.locator('button:has-text("Get Started Free")').click();
    await page.waitForTimeout(500);

    // Should show signup form
    await expect(page.locator('text=Create Account')).toBeVisible({ timeout: 5000 });
    console.log('✅ Signup form displayed');

    // Fill signup form
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    console.log('✅ Filled signup form');

    // Submit signup
    await page.locator('#signup-form button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // Should navigate to dashboard
    await expect(page.locator('text=Deal IQ Analysis')).toBeVisible({ timeout: 5000 });
    console.log('✅ Dashboard loaded after signup');
  });

  test('02 - Landing page → Login flow', async ({ page }) => {
    console.log('\n🧪 Testing: Landing → Login');

    // Click "Sign In" button
    await page.locator('button:has-text("Sign In")').first().click();
    await page.waitForTimeout(500);

    // Should show login form
    await expect(page.locator('text=Welcome Back')).toBeVisible({ timeout: 5000 });
    console.log('✅ Login form displayed');

    // Fill and submit login
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // Should navigate to dashboard
    await expect(page.locator('text=Deal IQ Analysis')).toBeVisible({ timeout: 5000 });
    console.log('✅ Dashboard loaded after login');
  });

  test('03 - Navigation: All header links work', async ({ page }) => {
    console.log('\n🧪 Testing: All navigation links');

    const links = [
      { name: 'Home', selector: '[data-nav="landing"]', expectedText: 'AI-Powered Property Analysis' },
      { name: 'Pricing', selector: '[data-nav="pricing"]', expectedText: 'LUNTRA Pro Features' },
      { name: 'Login', selector: '[data-nav="login"]', expectedText: 'Welcome Back' },
      { name: 'Signup', selector: '[data-nav="signup"]', expectedText: 'Create Account' }
    ];

    for (const link of links) {
      console.log(`\n  Testing: ${link.name} link`);

      // Click the link
      await page.locator(link.selector).first().click();
      await page.waitForTimeout(500);

      // Verify expected content appears
      const contentVisible = await page.locator(`text=${link.expectedText}`).isVisible().catch(() => false);

      if (contentVisible) {
        console.log(`  ✅ ${link.name} page loaded`);
      } else {
        console.log(`  ❌ ${link.name} page did NOT load - expected "${link.expectedText}"`);

        // Log what we actually see
        const mainContent = await page.locator('#main-content').textContent();
        console.log(`  📄 Actual content: ${mainContent?.substring(0, 100)}...`);
      }

      expect(contentVisible).toBe(true);
    }
  });

  test('04 - Dashboard: Run Deal IQ Analysis button works', async ({ page }) => {
    console.log('\n🧪 Testing: Run Analysis functionality');

    // First login
    await page.goto(`${BASE_URL}/#login`);
    await page.waitForTimeout(500);
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // Should be on dashboard
    await expect(page.locator('text=Deal IQ Analysis')).toBeVisible();

    // Get initial trial count
    const initialCount = await page.locator('[data-trial-simple]').textContent();
    console.log(`  Initial trial count: ${initialCount}`);

    // Click "Run Deal IQ Analysis" button
    await page.locator('#run-propiq-btn').click();
    await page.waitForTimeout(2500);

    // Should show analysis results
    await expect(page.locator('text=Property Analysis Results')).toBeVisible({ timeout: 5000 });
    console.log('✅ Analysis results page loaded');

    // Should show property details
    await expect(page.locator('text=Property Overview')).toBeVisible();
    await expect(page.locator('text=AI Valuation')).toBeVisible();
    console.log('✅ Analysis results display correctly');
  });

  test('05 - Pricing: All tier buttons exist and are clickable', async ({ page }) => {
    console.log('\n🧪 Testing: Pricing page tiers');

    // Navigate to pricing
    await page.goto(`${BASE_URL}/#pricing`);
    await page.waitForTimeout(1000);

    // Should show pricing section
    await expect(page.locator('text=LUNTRA Pro Features')).toBeVisible();
    console.log('✅ Pricing section loaded');

    // Check all three tiers exist
    const tiers = [
      { name: 'Starter', price: '$69' },
      { name: 'Pro', price: '$99' },
      { name: 'Elite', price: '$149' }
    ];

    for (const tier of tiers) {
      const tierVisible = await page.locator(`text=${tier.name}`).first().isVisible();
      const priceVisible = await page.locator(`text=${tier.price}`).first().isVisible();

      console.log(`  ${tierVisible && priceVisible ? '✅' : '❌'} ${tier.name} tier (${tier.price}) - Visible: ${tierVisible && priceVisible}`);

      expect(tierVisible).toBe(true);
      expect(priceVisible).toBe(true);
    }

    // Try clicking "Get Started" on Starter tier
    const starterButton = page.locator('[data-upgrade="starter"]').first();
    const isClickable = await starterButton.isEnabled();
    console.log(`  ${isClickable ? '✅' : '❌'} Starter "Get Started" button is clickable: ${isClickable}`);

    if (isClickable) {
      await starterButton.click();
      await page.waitForTimeout(1000);
      console.log('  ✅ Clicked Starter button successfully');
    }
  });

  test('06 - Complete user flow: Signup → Run Analysis → View Pricing → Logout', async ({ page }) => {
    console.log('\n🧪 Testing: Complete user journey');

    // Step 1: Signup
    console.log('\n  Step 1: Signup');
    await page.locator('[data-nav="signup"]').first().click();
    await page.waitForTimeout(500);
    await page.fill('[name="name"]', 'Journey Test User');
    await page.fill('[name="email"]', 'journey@example.com');
    await page.fill('[name="password"]', 'testpass123');
    await page.locator('#signup-form button[type="submit"]').click();
    await page.waitForTimeout(1500);
    console.log('    ✅ Signed up successfully');

    // Step 2: Run Analysis
    console.log('\n  Step 2: Run Analysis');
    await page.locator('#run-propiq-btn').click();
    await page.waitForTimeout(2500);
    await expect(page.locator('text=Property Analysis Results')).toBeVisible();
    console.log('    ✅ Ran analysis successfully');

    // Step 3: Go back to dashboard
    console.log('\n  Step 3: Navigate back to Dashboard');
    await page.locator('[data-nav="dashboard"]').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Deal IQ Analysis')).toBeVisible();
    console.log('    ✅ Returned to dashboard');

    // Step 4: View Pricing
    console.log('\n  Step 4: View Pricing');
    await page.locator('[data-nav="pricing"]').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=LUNTRA Pro Features')).toBeVisible();
    console.log('    ✅ Viewed pricing page');

    // Step 5: View History
    console.log('\n  Step 5: View History');
    await page.locator('[data-nav="history"]').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Analysis History')).toBeVisible();
    console.log('    ✅ Viewed history page');

    // Step 6: View Settings
    console.log('\n  Step 6: View Settings');
    await page.locator('[data-nav="settings"]').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Account Settings')).toBeVisible();
    console.log('    ✅ Viewed settings page');

    // Step 7: Logout
    console.log('\n  Step 7: Logout');
    await page.locator('#logout-btn').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=AI-Powered Property Analysis')).toBeVisible();
    console.log('    ✅ Logged out successfully - back to landing page');
  });

  test('07 - URL hash navigation works directly', async ({ page }) => {
    console.log('\n🧪 Testing: Direct URL hash navigation');

    const pages = [
      { hash: '#landing', expectedText: 'AI-Powered Property Analysis' },
      { hash: '#pricing', expectedText: 'LUNTRA Pro Features' },
      { hash: '#login', expectedText: 'Welcome Back' },
      { hash: '#signup', expectedText: 'Create Account' }
    ];

    for (const pageTest of pages) {
      console.log(`\n  Testing direct navigation to: ${pageTest.hash}`);

      await page.goto(`${BASE_URL}/${pageTest.hash}`);
      await page.waitForTimeout(1000);

      const isVisible = await page.locator(`text=${pageTest.expectedText}`).isVisible().catch(() => false);
      console.log(`  ${isVisible ? '✅' : '❌'} ${pageTest.hash} loaded correctly: ${isVisible}`);

      expect(isVisible).toBe(true);
    }
  });
});
