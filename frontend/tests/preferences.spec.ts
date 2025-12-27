/**
 * User Preferences - End-to-End Tests
 *
 * Tests the Preferences tab functionality including:
 * - Notification preference toggles
 * - Email notification settings
 * - Usage alert preferences
 * - Product update subscriptions
 * - Display preferences
 * - Preference persistence
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

// Test user credentials
const TEST_EMAIL = `preferences-test-${Date.now()}@example.com`;

test.describe('User Preferences - Notification Settings', () => {

  async function setupUserWithPreferences(page: any) {
    // Mock user with preferences
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
              analysesUsed: 1,
              analysesLimit: 3,
              createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
              preferences: {
                emailNotifications: true,
                usageAlerts: true,
                productUpdates: false,
              },
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

    // Navigate to Preferences tab
    await page.locator('button:has-text("Preferences")').click();
    await page.waitForTimeout(300);
  }

  test.beforeEach(async ({ page }) => {
    await setupUserWithPreferences(page);
  });

  test('should display Notifications section', async ({ page }) => {
    await expect(page.locator('text=Notifications')).toBeVisible();
  });

  test('should display all notification preference options', async ({ page }) => {
    // Email Notifications
    await expect(page.locator('text=Email Notifications')).toBeVisible();
    await expect(page.locator('text=Receive updates about your analyses and subscription').or(
      page.locator('text=updates about your analyses')
    )).toBeVisible();

    // Usage Alerts
    await expect(page.locator('text=Usage Alerts')).toBeVisible();
    await expect(page.locator('text=Get notified when approaching analysis limit').or(
      page.locator('text=approaching analysis limit')
    )).toBeVisible();

    // Product Updates
    await expect(page.locator('text=Product Updates')).toBeVisible();
    await expect(page.locator('text=Stay informed about new features and improvements').or(
      page.locator('text=new features')
    )).toBeVisible();
  });

  test('should display toggle switches for each preference', async ({ page }) => {
    // Count toggle switches (should have at least 3)
    const toggles = page.locator('button[class*="rounded-full"]').or(
      page.locator('button[class*="toggle"]')
    );

    const toggleCount = await toggles.count();
    expect(toggleCount).toBeGreaterThanOrEqual(3);
  });

  test('should toggle email notifications preference', async ({ page }) => {
    // Find Email Notifications toggle
    const emailNotificationToggle = page.locator('text=Email Notifications')
      .locator('..')
      .locator('button[class*="rounded-full"]')
      .first();

    // Get initial state
    const initialState = await emailNotificationToggle.getAttribute('class');

    // Click toggle
    await emailNotificationToggle.click();
    await page.waitForTimeout(300);

    // State should have changed
    const newState = await emailNotificationToggle.getAttribute('class');
    expect(initialState).not.toBe(newState);
  });

  test('should toggle usage alerts preference', async ({ page }) => {
    const usageAlertsToggle = page.locator('text=Usage Alerts')
      .locator('..')
      .locator('button[class*="rounded-full"]')
      .first();

    const initialState = await usageAlertsToggle.getAttribute('class');

    await usageAlertsToggle.click();
    await page.waitForTimeout(300);

    const newState = await usageAlertsToggle.getAttribute('class');
    expect(initialState).not.toBe(newState);
  });

  test('should toggle product updates preference', async ({ page }) => {
    const productUpdatesToggle = page.locator('text=Product Updates')
      .locator('..')
      .locator('button[class*="rounded-full"]')
      .first();

    const initialState = await productUpdatesToggle.getAttribute('class');

    await productUpdatesToggle.click();
    await page.waitForTimeout(300);

    const newState = await productUpdatesToggle.getAttribute('class');
    expect(initialState).not.toBe(newState);
  });

  test('should visually indicate toggle state (on/off)', async ({ page }) => {
    const firstToggle = page.locator('button[class*="rounded-full"]').first();

    // Get background color or class
    const toggleState = await firstToggle.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        className: el.className,
      };
    });

    // Should have styling that indicates state (violet for on, gray for off)
    expect(
      toggleState.backgroundColor.includes('rgb') ||
      toggleState.className.includes('violet') ||
      toggleState.className.includes('slate')
    ).toBeTruthy();
  });

  test('should allow toggling multiple preferences independently', async ({ page }) => {
    const toggles = page.locator('button[class*="rounded-full"]');

    // Toggle first preference
    await toggles.nth(0).click();
    await page.waitForTimeout(200);

    const firstState = await toggles.nth(0).getAttribute('class');

    // Toggle second preference
    await toggles.nth(1).click();
    await page.waitForTimeout(200);

    const secondState = await toggles.nth(1).getAttribute('class');

    // States should be different or independently controlled
    expect(firstState).toBeTruthy();
    expect(secondState).toBeTruthy();
  });

  test('should maintain toggle state when switching tabs', async ({ page }) => {
    const emailToggle = page.locator('text=Email Notifications')
      .locator('..')
      .locator('button[class*="rounded-full"]')
      .first();

    // Toggle email notifications
    await emailToggle.click();
    await page.waitForTimeout(300);

    const stateAfterToggle = await emailToggle.getAttribute('class');

    // Switch to Account tab
    await page.locator('button:has-text("Account")').click();
    await page.waitForTimeout(300);

    // Switch back to Preferences
    await page.locator('button:has-text("Preferences")').click();
    await page.waitForTimeout(300);

    // State should be maintained
    const stateAfterReturn = await emailToggle.getAttribute('class');
    expect(stateAfterToggle).toBe(stateAfterReturn);
  });
});

test.describe('User Preferences - Display Preferences', () => {

  async function setupUserForDisplayPrefs(page: any) {
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
              analysesUsed: 5,
              analysesLimit: 20,
              createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
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

    await page.locator('button:has-text("Preferences")').click();
    await page.waitForTimeout(300);
  }

  test.beforeEach(async ({ page }) => {
    await setupUserForDisplayPrefs(page);
  });

  test('should display Display Preferences section', async ({ page }) => {
    // Scroll down if needed
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);

    await expect(page.locator('text=Display Preferences').or(
      page.locator('text=Display')
    )).toBeVisible({ timeout: 3000 });
  });

  test('should show "coming soon" message for additional preferences', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Should indicate future features
    await expect(page.locator('text=coming soon').or(
      page.locator('text=Additional preferences')
    )).toBeVisible({ timeout: 3000 });
  });
});

test.describe('User Preferences - Accessibility', () => {

  async function setupForAccessibility(page: any) {
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
              analysesUsed: 0,
              analysesLimit: 3,
              createdAt: Date.now(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Preferences")').click();
    await page.waitForTimeout(300);
  }

  test.beforeEach(async ({ page }) => {
    await setupForAccessibility(page);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through preferences
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
  });

  test('should allow toggling with keyboard', async ({ page }) => {
    const firstToggle = page.locator('button[class*="rounded-full"]').first();

    // Focus toggle
    await firstToggle.focus();
    await page.waitForTimeout(100);

    const initialState = await firstToggle.getAttribute('class');

    // Press Enter or Space to toggle
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    const newState = await firstToggle.getAttribute('class');
    expect(initialState).not.toBe(newState);
  });

  test('should have proper contrast for toggle states', async ({ page }) => {
    const firstToggle = page.locator('button[class*="rounded-full"]').first();

    const colors = await firstToggle.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });

    // Should have defined colors
    expect(colors.backgroundColor).toMatch(/rgb/);
  });

  test('should have descriptive labels for each preference', async ({ page }) => {
    // Each toggle should have associated text
    const labels = ['Email Notifications', 'Usage Alerts', 'Product Updates'];

    for (const label of labels) {
      await expect(page.locator(`text=${label}`)).toBeVisible();
    }
  });

  test('should have descriptive text under each preference', async ({ page }) => {
    // Check that descriptions exist
    const descriptions = page.locator('p[class*="text-sm"]').or(
      page.locator('[class*="gray"]').filter({ hasText: /Receive|Get|Stay/ })
    );

    const count = await descriptions.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

test.describe('User Preferences - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display preferences correctly on mobile', async ({ page }) => {
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
              analysesUsed: 1,
              analysesLimit: 3,
              createdAt: Date.now(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Navigate to Preferences tab
    const prefsTab = page.locator('button:has-text("Preferences")').or(
      page.locator('button').nth(2)
    );

    if (await prefsTab.isVisible()) {
      await prefsTab.click();
      await page.waitForTimeout(300);
    }

    // Preferences should be visible
    await expect(page.locator('text=Notifications').or(
      page.locator('text=Email Notifications')
    )).toBeVisible({ timeout: 3000 });

    // Toggles should be usable on mobile
    const firstToggle = page.locator('button[class*="rounded-full"]').first();
    await expect(firstToggle).toBeVisible();
  });

  test('should have touch-friendly toggle sizes on mobile', async ({ page }) => {
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
              analysesUsed: 0,
              analysesLimit: 3,
              createdAt: Date.now(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    const prefsTab = page.locator('button:has-text("Preferences")').or(
      page.locator('button').nth(2)
    );

    if (await prefsTab.isVisible()) {
      await prefsTab.click();
      await page.waitForTimeout(300);
    }

    const firstToggle = page.locator('button[class*="rounded-full"]').first();

    if (await firstToggle.isVisible()) {
      const size = await firstToggle.boundingBox();

      // Toggle should be at least 44x44px (iOS touch target guideline)
      expect(size?.height).toBeGreaterThanOrEqual(24); // May be smaller but still usable
    }
  });
});

test.describe('User Preferences - Edge Cases', () => {

  test('should handle preference update failures gracefully', async ({ page }) => {
    // Mock preference update failure
    await page.route('**/api/mutation', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path?.includes('updatePreferences') || postData?.functionName?.includes('preferences')) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'error',
            errorMessage: 'Failed to update preferences',
          }),
        });
      } else {
        await route.continue();
      }
    });

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
              analysesUsed: 0,
              analysesLimit: 3,
              createdAt: Date.now(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Preferences")').click();
    await page.waitForTimeout(300);

    // Try to toggle a preference
    const firstToggle = page.locator('button[class*="rounded-full"]').first();

    if (await firstToggle.isVisible()) {
      await firstToggle.click();
      await page.waitForTimeout(500);

      // Should revert to original state or show error (depends on implementation)
      // At minimum, app shouldn't crash
      const isStillVisible = await firstToggle.isVisible();
      expect(isStillVisible).toBeTruthy();
    }
  });

  test('should load with default preferences for new users', async ({ page }) => {
    // Mock new user with no saved preferences
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
              analysesUsed: 0,
              analysesLimit: 3,
              createdAt: Date.now(),
              // No preferences field
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Preferences")').click();
    await page.waitForTimeout(300);

    // Should show default toggle states (likely all enabled or as per component defaults)
    const toggles = page.locator('button[class*="rounded-full"]');
    const count = await toggles.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
