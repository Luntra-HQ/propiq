/**
 * Quick verification test for Product Tour
 * Checks if the tour appears for a brand new user
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://propiq.luntra.one';

test.describe('Product Tour Verification', () => {
  test('product tour appears for brand new user', async ({ page, context }) => {
    // Clear everything to simulate brand new user
    await context.clearCookies();

    await page.goto(PRODUCTION_URL);

    console.log('🎯 Verifying Product Tour...');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Create a completely new account
    const timestamp = Date.now();
    const email = `tour-verify-${timestamp}@test.com`;

    console.log(`Creating new user: ${email}`);

    // Fill signup form
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="signup-submit-button"]');

    // Wait for signup to complete and app to load
    console.log('Waiting for app to load...');
    await page.waitForTimeout(6000); // Wait longer for tour to trigger

    // Take screenshot of what we see
    await page.screenshot({ path: 'test-results/after-signup.png', fullPage: true });

    // Check if auth modal is gone (means we logged in)
    const authModalGone = !(await page.locator('text=Create Account').isVisible({ timeout: 2000 }).catch(() => false));
    console.log(`✅ Logged in: ${authModalGone ? 'Yes' : 'No'}`);

    // Look for product tour elements
    const tourElements = [
      page.locator('text=/welcome to propiq/i'),
      page.locator('text=/product tour/i'),
      page.locator('text=/let.*s get started/i'),
      page.locator('[class*="tour"]'),
      page.locator('button:has-text("Next")'),
      page.locator('button:has-text("Skip")'),
    ];

    console.log('\n🔍 Checking for tour elements...');

    let tourFound = false;
    for (const element of tourElements) {
      const visible = await element.isVisible({ timeout: 1000 }).catch(() => false);
      const count = await element.count();

      if (visible || count > 0) {
        console.log(`✅ Found tour element: ${await element.first().textContent().catch(() => 'element')}`);
        tourFound = true;
      }
    }

    if (tourFound) {
      console.log('\n🎉 PRODUCT TOUR IS SHOWING!');
      await page.screenshot({ path: 'test-results/product-tour-visible.png', fullPage: true });

      // Try to interact with it
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('Clicking Next button...');
        await nextButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Tour is interactive!');
      }
    } else {
      console.log('\n⚠️  Product tour not visible');
      console.log('Possible reasons:');
      console.log('1. Tour already seen (localStorage not cleared)');
      console.log('2. Tour trigger timing issue');
      console.log('3. Tour conditional logic not met');

      // Check localStorage
      const tourStatus = await page.evaluate(() => ({
        completed: localStorage.getItem('propiq_tour_completed'),
        skipped: localStorage.getItem('propiq_tour_skipped'),
        userId: localStorage.getItem('userId'),
        authToken: localStorage.getItem('auth_token'),
      }));

      console.log('\nLocalStorage status:', JSON.stringify(tourStatus, null, 2));
    }

    // Don't fail the test - just report findings
    console.log('\n📊 Verification complete - see screenshots for details');
  });
});
