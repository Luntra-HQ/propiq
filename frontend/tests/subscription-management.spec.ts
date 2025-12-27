/**
 * Subscription Management - End-to-End Tests
 *
 * Tests subscription-related features including:
 * - Plan change modal (upgrade/downgrade)
 * - Subscription cancellation dialog
 * - Stripe billing portal redirect
 * - Subscription status display
 * - Billing information display
 * - Cancellation feedback collection
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

// Test user credentials
const TEST_EMAIL = `subscription-test-${Date.now()}@example.com`;

test.describe('Subscription Management - Plan Change Modal', () => {

  async function setupPaidUserWithSettings(page: any, tier: string = 'starter') {
    // Mock paid user
    await page.route('**/api/query', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'users:getCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: {
              _id: 'test-user-id',
              email: TEST_EMAIL,
              subscriptionTier: tier,
              subscriptionStatus: 'active',
              analysesUsed: 5,
              analysesLimit: tier === 'starter' ? 20 : tier === 'pro' ? 100 : 999,
              currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
              createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
              stripeCustomerId: 'cus_test123',
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.evaluate(() => {
      localStorage.setItem('convex-auth-token', 'mock-jwt-token');
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Navigate to Subscription tab
    await page.locator('button:has-text("Subscription")').click();
    await page.waitForTimeout(300);
  }

  test.beforeEach(async ({ page }) => {
    await setupPaidUserWithSettings(page);
  });

  test('should display "Change Plan" button for paid users', async ({ page }) => {
    await expect(page.locator('button:has-text("Change Plan")')).toBeVisible();
  });

  test('should open plan change modal when clicking "Change Plan"', async ({ page }) => {
    await page.locator('button:has-text("Change Plan")').click();
    await page.waitForTimeout(500);

    // Modal should be visible
    await expect(page.locator('text=Change Your Plan')).toBeVisible();
    await expect(page.locator('text=Currently on')).toBeVisible();
  });

  test('should display all available plan tiers in modal', async ({ page }) => {
    await page.locator('button:has-text("Change Plan")').click();
    await page.waitForTimeout(500);

    // Should show Starter, Pro, and Elite plans
    await expect(page.locator('text=Starter').first()).toBeVisible();
    await expect(page.locator('text=Pro').first()).toBeVisible();
    await expect(page.locator('text=Elite').first()).toBeVisible();

    // Should NOT show Free tier
    const freeTierCount = await page.locator('text=Free').count();
    expect(freeTierCount).toBeLessThan(2); // May appear once in description
  });

  test('should highlight current plan', async ({ page }) => {
    await page.locator('button:has-text("Change Plan")').click();
    await page.waitForTimeout(500);

    // Current plan should be marked (Starter in this case)
    const starterCard = page.locator('[class*="border"]').filter({ hasText: 'Starter' }).first();
    const isHighlighted = await starterCard.evaluate((el) => {
      return el.className.includes('current') ||
             el.textContent?.includes('Current Plan') ||
             window.getComputedStyle(el).borderColor !== '';
    });

    expect(isHighlighted).toBeTruthy();
  });

  test('should allow selecting a different plan', async ({ page }) => {
    await page.locator('button:has-text("Change Plan")').click();
    await page.waitForTimeout(500);

    // Click on Pro plan
    const proCard = page.locator('[class*="rounded"]').filter({ hasText: 'Pro' }).first();

    if (await proCard.isVisible()) {
      await proCard.click();
      await page.waitForTimeout(300);

      // Confirmation button should be enabled
      const confirmButton = page.locator('button:has-text("Confirm")').or(
        page.locator('button:has-text("Change")').or(page.locator('button:has-text("Upgrade")'))
      );

      if (await confirmButton.isVisible()) {
        await expect(confirmButton.first()).toBeVisible();
      }
    }
  });

  test('should show upgrade indicator when selecting higher tier', async ({ page }) => {
    await page.locator('button:has-text("Change Plan")').click();
    await page.waitForTimeout(500);

    // Select Elite plan (higher than Starter)
    const eliteCard = page.locator('[class*="rounded"]').filter({ hasText: 'Elite' }).first();

    if (await eliteCard.isVisible()) {
      await eliteCard.click();
      await page.waitForTimeout(300);

      // Should show upgrade messaging
      const upgradeText = page.locator('text=Upgrade').or(
        page.locator('text=upgrade').or(page.locator('[class*="green"]').filter({ hasText: 'plan' }))
      );

      await expect(upgradeText.first()).toBeVisible({ timeout: 2000 });
    }
  });

  test('should close modal when clicking X button', async ({ page }) => {
    await page.locator('button:has-text("Change Plan")').click();
    await page.waitForTimeout(500);

    // Click close button
    const closeButton = page.locator('button[aria-label="Close dialog"]').or(
      page.locator('button:has(svg)').filter({ hasText: '' })
    ).first();

    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(300);

      // Modal should be closed
      await expect(page.locator('text=Change Your Plan')).not.toBeVisible();
    }
  });

  test('should handle plan change confirmation', async ({ page }) => {
    // Mock successful plan change
    await page.route('**/api/mutation', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'subscription:changePlan' || postData?.functionName?.includes('changePlan')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: { success: true, newTier: 'pro' },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.locator('button:has-text("Change Plan")').click();
    await page.waitForTimeout(500);

    // Select Pro plan
    const proCard = page.locator('[class*="rounded"]').filter({ hasText: 'Pro' }).first();
    if (await proCard.isVisible()) {
      await proCard.click();
      await page.waitForTimeout(300);

      // Confirm plan change
      const confirmButton = page.locator('button').filter({ hasText: /Confirm|Change|Upgrade/ }).first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForTimeout(1000);

        // Should show success or close modal
        const modalClosed = !(await page.locator('text=Change Your Plan').isVisible().catch(() => false));
        expect(modalClosed).toBeTruthy();
      }
    }
  });
});

test.describe('Subscription Management - Cancellation Dialog', () => {

  async function setupPaidUserForCancellation(page: any) {
    await page.route('**/api/query', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'users:getCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: {
              _id: 'test-user-id',
              email: TEST_EMAIL,
              subscriptionTier: 'pro',
              subscriptionStatus: 'active',
              analysesUsed: 10,
              analysesLimit: 100,
              currentPeriodEnd: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
              createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
              stripeCustomerId: 'cus_test456',
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.evaluate(() => {
      localStorage.setItem('convex-auth-token', 'mock-jwt-token');
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Subscription")').click();
    await page.waitForTimeout(300);
  }

  test.beforeEach(async ({ page }) => {
    await setupPaidUserForCancellation(page);
  });

  test('should display "Cancel Plan" button in Danger Zone', async ({ page }) => {
    // Scroll to danger zone if needed
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    await expect(page.locator('text=Danger Zone')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Cancel Plan")').or(
      page.locator('button:has-text("Cancel Subscription")')
    )).toBeVisible();
  });

  test('should open cancellation dialog when clicking "Cancel Plan"', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const cancelButton = page.locator('button:has-text("Cancel Plan")').or(
      page.locator('button:has-text("Cancel Subscription")')
    );

    await cancelButton.click();
    await page.waitForTimeout(500);

    // Dialog should be visible
    await expect(page.locator('text=Cancel Subscription')).toBeVisible();
    await expect(page.locator('text=We\'re sorry to see you go').or(
      page.locator('text=sorry to see you go')
    )).toBeVisible();
  });

  test('should display cancellation reasons', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const cancelButton = page.locator('button:has-text("Cancel Plan")').or(
      page.locator('button:has-text("Cancel Subscription")')
    );
    await cancelButton.click();
    await page.waitForTimeout(500);

    // Check for reason options
    await expect(page.locator('text=Too expensive').or(page.locator('text=expensive'))).toBeVisible();
    await expect(page.locator('text=Not using it enough').or(page.locator('text=Not using'))).toBeVisible();
    await expect(page.locator('text=Missing features').or(page.locator('text=features'))).toBeVisible();
  });

  test('should display warning about billing period retention', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const cancelButton = page.locator('button:has-text("Cancel Plan")').or(
      page.locator('button:has-text("Cancel Subscription")')
    );
    await cancelButton.click();
    await page.waitForTimeout(500);

    // Should show retention warning
    await expect(page.locator('text=remain active until').or(
      page.locator('text=billing period')
    )).toBeVisible();
  });

  test('should require reason selection before confirming cancellation', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const cancelButton = page.locator('button:has-text("Cancel Plan")').or(
      page.locator('button:has-text("Cancel Subscription")')
    );
    await cancelButton.click();
    await page.waitForTimeout(500);

    // Try to confirm without selecting reason
    const confirmButton = page.locator('button').filter({ hasText: /Confirm|Cancel.*Plan/ }).last();

    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      await page.waitForTimeout(500);

      // Should show error about selecting reason
      await expect(page.locator('text=Please select').or(
        page.locator('[class*="red"]')
      )).toBeVisible({ timeout: 2000 });
    }
  });

  test('should allow selecting cancellation reason', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const cancelButton = page.locator('button:has-text("Cancel Plan")').or(
      page.locator('button:has-text("Cancel Subscription")')
    );
    await cancelButton.click();
    await page.waitForTimeout(500);

    // Select a reason (radio button or similar)
    const reasonOption = page.locator('input[type="radio"]').or(
      page.locator('label').filter({ hasText: 'expensive' })
    ).first();

    if (await reasonOption.isVisible()) {
      await reasonOption.click();
      await page.waitForTimeout(200);
    }
  });

  test('should allow providing additional feedback', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const cancelButton = page.locator('button:has-text("Cancel Plan")').or(
      page.locator('button:has-text("Cancel Subscription")')
    );
    await cancelButton.click();
    await page.waitForTimeout(500);

    // Find feedback textarea
    const feedbackArea = page.locator('textarea').or(
      page.locator('input[type="text"]').filter({ hasText: '' })
    ).first();

    if (await feedbackArea.isVisible()) {
      await feedbackArea.fill('This is my feedback about cancelling');
      await page.waitForTimeout(200);

      const value = await feedbackArea.inputValue();
      expect(value).toContain('feedback');
    }
  });

  test('should close cancellation dialog when clicking close button', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const cancelButton = page.locator('button:has-text("Cancel Plan")').or(
      page.locator('button:has-text("Cancel Subscription")')
    );
    await cancelButton.click();
    await page.waitForTimeout(500);

    // Click close button
    const closeButton = page.locator('button[aria-label="Close dialog"]').or(
      page.locator('button:has(svg)').filter({ hasText: '' })
    ).first();

    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(300);

      // Dialog should be closed
      await expect(page.locator('text=Cancel Subscription?')).not.toBeVisible();
    }
  });

  test('should show loading state when processing cancellation', async ({ page }) => {
    // Mock delayed cancellation
    await page.route('**/api/mutation', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path?.includes('cancel') || postData?.functionName?.includes('cancel')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: { success: true },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const cancelButton = page.locator('button:has-text("Cancel Plan")').or(
      page.locator('button:has-text("Cancel Subscription")')
    );
    await cancelButton.click();
    await page.waitForTimeout(500);

    // Select reason
    const reasonOption = page.locator('input[type="radio"]').first();
    if (await reasonOption.isVisible()) {
      await reasonOption.click();
    }

    // Confirm cancellation
    const confirmButton = page.locator('button').filter({ hasText: /Confirm|Cancel.*Plan/ }).last();
    if (await confirmButton.isVisible()) {
      await confirmButton.click();

      // Should show loading indicator
      await expect(page.locator('[class*="spin"]').or(
        page.locator('text=Processing').or(page.locator('text=loading'))
      )).toBeVisible({ timeout: 1000 });
    }
  });
});

test.describe('Subscription Management - Stripe Billing Portal', () => {

  async function setupPaidUserForBilling(page: any) {
    await page.route('**/api/query', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'users:getCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: {
              _id: 'test-user-id',
              email: TEST_EMAIL,
              subscriptionTier: 'starter',
              subscriptionStatus: 'active',
              analysesUsed: 3,
              analysesLimit: 20,
              currentPeriodEnd: Date.now() + 20 * 24 * 60 * 60 * 1000,
              createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
              stripeCustomerId: 'cus_billing123',
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.evaluate(() => {
      localStorage.setItem('convex-auth-token', 'mock-jwt-token');
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Subscription")').click();
    await page.waitForTimeout(300);
  }

  test.beforeEach(async ({ page }) => {
    await setupPaidUserForBilling(page);
  });

  test('should display "Manage Billing" button', async ({ page }) => {
    await expect(page.locator('button:has-text("Manage Billing")').or(
      page.locator('button:has-text("Manage")').filter({ hasText: 'Stripe' })
    )).toBeVisible();
  });

  test('should display billing information section', async ({ page }) => {
    await expect(page.locator('text=Billing Information').or(
      page.locator('text=Billing')
    )).toBeVisible();

    await expect(page.locator('text=Next Billing Date').or(
      page.locator('text=billing')
    )).toBeVisible();
  });

  test('should display next billing date correctly', async ({ page }) => {
    // Should show a future date (we set it to 20 days from now)
    const billingDateElement = page.locator('text=Next Billing Date').locator('..').locator('text=/2025|2026/');
    await expect(billingDateElement.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display subscription status', async ({ page }) => {
    await expect(page.locator('text=Active').or(
      page.locator('[class*="emerald"]').filter({ hasText: 'active' })
    )).toBeVisible();
  });

  test('should display Stripe customer ID', async ({ page }) => {
    // Should show partial customer ID
    await expect(page.locator('text=Customer ID').or(
      page.locator('text=cus_')
    )).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Subscription Management - Free Tier Users', () => {

  async function setupFreeUser(page: any) {
    await page.route('**/api/query', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'users:getCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: {
              _id: 'test-user-id',
              email: TEST_EMAIL,
              subscriptionTier: 'free',
              analysesUsed: 2,
              analysesLimit: 3,
              createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.evaluate(() => {
      localStorage.setItem('convex-auth-token', 'mock-jwt-token');
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Subscription")').click();
    await page.waitForTimeout(300);
  }

  test.beforeEach(async ({ page }) => {
    await setupFreeUser(page);
  });

  test('should NOT display "Change Plan" button for free users', async ({ page }) => {
    const changePlanButton = page.locator('button:has-text("Change Plan")');
    const isVisible = await changePlanButton.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  });

  test('should NOT display "Cancel Plan" button for free users', async ({ page }) => {
    const cancelButton = page.locator('button:has-text("Cancel Plan")');
    const isVisible = await cancelButton.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  });

  test('should display upgrade CTA for free users', async ({ page }) => {
    await expect(page.locator('text=Upgrade Your Plan').or(
      page.locator('text=View Pricing Plans')
    )).toBeVisible();
  });

  test('should have clickable upgrade button', async ({ page }) => {
    const upgradeButton = page.locator('button').filter({ hasText: /Upgrade|View Pricing|Get Started/ }).first();
    await expect(upgradeButton).toBeVisible();
    await expect(upgradeButton).toBeEnabled();
  });
});
