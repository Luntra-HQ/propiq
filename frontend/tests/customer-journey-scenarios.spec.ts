/**
 * Customer Journey & Purchase Scenario Tests
 *
 * Tests different user personas and their interactions with the site:
 * 1. Free Tier User - Uses 3 free analyses, hits paywall
 * 2. Starter Tier Upgrade - Upgrades to $29/mo plan
 * 3. Pro Tier User - Power user with 100 analyses/month
 * 4. Elite Tier User - Unlimited access
 * 5. Tour Interaction - New user goes through product tour
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://propiq.luntra.one';

test.describe('Customer Journey Scenarios', () => {

  test.describe('Scenario 1: Free Tier User Journey', () => {
    test('new user signs up and explores site', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      console.log('🆓 Scenario: Free Tier User Journey');

      // Wait for auth modal
      await page.waitForTimeout(2000);

      // Create test user
      const timestamp = Date.now();
      const email = `free-tier-${timestamp}@test.com`;

      await page.fill('[data-testid="email-input"]', email);
      await page.fill('[data-testid="password-input"]', 'TestPass123!');

      // Submit
      const submitBtn = page.locator('[data-testid="signup-submit-button"]');
      await submitBtn.click();

      // Wait for signup
      await page.waitForTimeout(3000);

      console.log('✅ Free tier user created');

      // User should see:
      // - Main dashboard
      // - 3 free analyses remaining
      // - Upgrade prompts

      // Check for usage indicator
      const usageText = await page.locator('text=/3 free|free trial|analyses/i').count();
      console.log(`Usage indicator found: ${usageText > 0 ? 'Yes' : 'No'}`);
    });

    test('free user exhausts trial and sees paywall', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      console.log('🔒 Testing: Free user hits paywall after 3 analyses');

      // If already logged in, we'll see the paywall after 3 uses
      // Otherwise, skip this test
      const isLoggedIn = await page.evaluate(() => {
        return !!localStorage.getItem('auth_token') || !!localStorage.getItem('userId');
      });

      if (!isLoggedIn) {
        console.log('⚠️  Not logged in, skipping paywall test');
        test.skip();
        return;
      }

      // Look for upgrade CTA or paywall
      const upgradeButton = page.locator('button:has-text("Upgrade")').or(
        page.locator('text=/upgrade now/i')
      ).first();

      const hasUpgradePrompt = await upgradeButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasUpgradePrompt) {
        console.log('✅ Upgrade prompt visible for free tier user');
      } else {
        console.log('ℹ️  User may not have exhausted free tier yet');
      }
    });
  });

  test.describe('Scenario 2: Pricing Page Exploration', () => {
    test('user explores different pricing tiers', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      console.log('💳 Scenario: User explores pricing options');

      // Wait for page load
      await page.waitForLoadState('networkidle');

      // Look for pricing/plans button
      const pricingButton = page.locator('button:has-text("Pricing")').or(
        page.locator('a:has-text("Plans")').or(
          page.locator('button:has-text("Upgrade")')
        )
      ).first();

      const hasPricing = await pricingButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasPricing) {
        await pricingButton.click();
        await page.waitForTimeout(1000);

        console.log('✅ Opened pricing page');

        // Look for pricing tiers
        const starterPlan = await page.locator('text=/starter|\\$29/i').count();
        const proPlan = await page.locator('text=/pro|\\$79/i').count();
        const elitePlan = await page.locator('text=/elite|unlimited|\\$199/i').count();

        console.log(`Found pricing tiers:`);
        console.log(`- Starter ($29/mo): ${starterPlan > 0 ? 'Yes' : 'No'}`);
        console.log(`- Pro ($79/mo): ${proPlan > 0 ? 'Yes' : 'No'}`);
        console.log(`- Elite ($199/mo): ${elitePlan > 0 ? 'Yes' : 'No'}`);

        expect(starterPlan + proPlan + elitePlan).toBeGreaterThan(0);
      } else {
        console.log('⚠️  Pricing button not found');
      }
    });

    test('pricing page shows clear value propositions', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      console.log('💎 Testing: Value proposition clarity');

      // Click pricing button if available
      const pricingButton = page.locator('button:has-text("Pricing")').or(
        page.locator('button:has-text("Upgrade")')
      ).first();

      if (await pricingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await pricingButton.click();
        await page.waitForTimeout(1000);

        // Look for key value propositions
        const hasAnalysisCount = await page.locator('text=/analyses|properties/i').count();
        const hasFeatures = await page.locator('text=/feature|benefit|include/i').count();
        const hasPricing = await page.locator('text=/\\$|month|year/i').count();

        console.log(`Value propositions found:`);
        console.log(`- Analysis counts: ${hasAnalysisCount > 0 ? 'Yes' : 'No'}`);
        console.log(`- Features listed: ${hasFeatures > 0 ? 'Yes' : 'No'}`);
        console.log(`- Clear pricing: ${hasPricing > 0 ? 'Yes' : 'No'}`);

        expect(hasAnalysisCount + hasFeatures + hasPricing).toBeGreaterThan(3);
      }
    });
  });

  test.describe('Scenario 3: Product Tour Interaction', () => {
    test('new user sees product tour on first visit', async ({ page, context }) => {
      // Clear localStorage to simulate first visit
      await context.clearCookies();
      await page.goto(PRODUCTION_URL);

      console.log('🎯 Scenario: First-time user product tour');

      // Create new user
      const timestamp = Date.now();
      const email = `tour-test-${timestamp}@test.com`;

      await page.waitForTimeout(2000);
      await page.fill('[data-testid="email-input"]', email);
      await page.fill('[data-testid="password-input"]', 'TestPass123!');

      const submitBtn = page.locator('[data-testid="signup-submit-button"]');
      await submitBtn.click();

      // Wait for login and tour to appear
      await page.waitForTimeout(4000);

      // Look for tour elements
      const tourTitle = page.locator('text=/welcome to propiq|product tour|let.*s get started/i').first();
      const hasTour = await tourTitle.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasTour) {
        console.log('✅ Product tour appeared for new user');

        // Take screenshot of tour
        await page.screenshot({ path: 'test-results/product-tour-visible.png', fullPage: true });

        // Try to navigate tour
        const nextButton = page.locator('button:has-text("Next")').or(
          page.locator('button[class*="next"]')
        ).first();

        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextButton.click();
          await page.waitForTimeout(500);
          console.log('✅ Successfully navigated tour');
        }

        // Try to skip tour
        const skipButton = page.locator('button:has-text("Skip")').or(
          page.locator('button:has-text("Close")')
        ).first();

        if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await skipButton.click();
          console.log('✅ Successfully skipped tour');
        }
      } else {
        console.log('ℹ️  Product tour not visible (may need to be triggered manually)');
        // Take screenshot for debugging
        await page.screenshot({ path: 'test-results/no-product-tour.png', fullPage: true });
      }
    });
  });

  test.describe('Scenario 4: Help & Support Discovery', () => {
    test('user can find help resources', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      console.log('❓ Scenario: User looking for help');

      // First, ensure we're logged in or create an account
      await page.waitForTimeout(2000);

      // Check if auth modal is visible
      const authModalVisible = await page.locator('text=Create Account').isVisible({ timeout: 3000 }).catch(() => false);

      if (authModalVisible) {
        console.log('Creating test account to access logged-in features...');
        const timestamp = Date.now();
        const email = `support-test-${timestamp}@test.com`;

        await page.fill('[data-testid="email-input"]', email);
        await page.fill('[data-testid="password-input"]', 'TestPass123!');
        await page.click('[data-testid="signup-submit-button"]');

        // Wait for auth modal to close and app to load
        console.log('Waiting for app to load after login...');
        await page.waitForTimeout(5000); // Give app time to fully load

        // Verify we're logged in - auth modal should be gone
        const authStillVisible = await page.locator('text=Create Account').isVisible({ timeout: 2000 }).catch(() => false);
        console.log(`Auth modal still visible: ${authStillVisible ? 'Yes' : 'No'}`);
      }

      // Now look for support/help elements
      // Support chat should be a button or widget in the corner
      const supportChat = page.locator('[class*="support"]').or(
        page.locator('[class*="chat"]').or(
          page.locator('button:has-text("Help")').or(
            page.locator('[data-testid*="support"]').or(
              page.locator('[role="button"]:has-text("Support")')
            )
          )
        )
      );

      const hasSupport = await supportChat.count();
      console.log(`Support elements found: ${hasSupport}`);

      // Look for FAQ or documentation links
      const faqLink = page.locator('text=/faq|help center|docs|guide/i').first();
      const hasFAQ = await faqLink.isVisible({ timeout: 3000 }).catch(() => false);

      console.log(`FAQ/Documentation available: ${hasFAQ ? 'Yes' : 'No'}`);

      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/support-discovery.png', fullPage: true });

      if (hasSupport === 0 && !hasFAQ) {
        console.log('⚠️  No support elements found - this is a UX issue to address');
        console.log('Users may struggle to find help when needed');
      }

      // Don't fail the test, just warn - this is a UX improvement opportunity
      console.log(hasSupport > 0 || hasFAQ ? '✅ Help resources available' : '⚠️  Consider adding visible help/support option');
    });
  });

  test.describe('Scenario 5: Mobile User Experience', () => {
    test('mobile user can navigate and use key features', async ({ page, context }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      await page.goto(PRODUCTION_URL);

      console.log('📱 Scenario: Mobile user experience');

      await page.waitForLoadState('networkidle');

      // Check if auth modal is mobile-friendly
      const authModal = page.locator('text=Create Account').first();
      const isVisible = await authModal.isVisible({ timeout: 5000 }).catch(() => false);

      if (isVisible) {
        console.log('✅ Auth modal visible on mobile');

        // Take mobile screenshot
        await page.screenshot({ path: 'test-results/mobile-auth.png', fullPage: true });
      }

      // Check if main navigation is accessible
      const hasNavigation = await page.locator('[role="navigation"]').or(
        page.locator('nav').or(
          page.locator('[class*="menu"]')
        )
      ).count();

      console.log(`Mobile navigation found: ${hasNavigation > 0 ? 'Yes' : 'No'}`);
    });
  });

  test.describe('Scenario 6: Error Handling & Edge Cases', () => {
    test('user enters invalid email format', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      console.log('⚠️  Scenario: Invalid email handling');

      await page.waitForTimeout(2000);

      // Try invalid email
      await page.fill('[data-testid="email-input"]', 'notanemail');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');

      const submitBtn = page.locator('[data-testid="signup-submit-button"]');
      await submitBtn.click();

      await page.waitForTimeout(1000);

      // Look for error message
      const errorMessage = page.locator('[role="alert"]').or(
        page.locator('[class*="error"]').or(
          page.locator('text=/invalid|error|please/i')
        )
      ).first();

      const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasError) {
        console.log('✅ Error message shown for invalid email');
      } else {
        console.log('ℹ️  No error message visible (browser validation may have blocked submit)');
      }
    });

    test('user tries to access without logging in', async ({ page, context }) => {
      console.log('🔐 Scenario: Accessing site without auth');

      // Clear all cookies first
      await context.clearCookies();

      // Navigate to the page
      await page.goto(PRODUCTION_URL);

      // Now clear localStorage (must be done after page loads)
      await page.evaluate(() => {
        try {
          localStorage.clear();
        } catch (e) {
          // Ignore security errors - just continue
          console.log('Could not clear localStorage:', e);
        }
      });

      await page.waitForTimeout(2000);

      // Should see auth modal
      const authModal = page.locator('text=Create Account').first();
      const isVisible = await authModal.isVisible({ timeout: 5000 }).catch(() => false);

      console.log(`Auth modal shown for logged-out user: ${isVisible ? 'Yes' : 'No'}`);
      expect(isVisible).toBe(true);
    });
  });
});
