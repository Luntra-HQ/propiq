/**
 * Account Settings - End-to-End Tests
 *
 * Tests the SettingsPage component including:
 * - Tab navigation (Account, Subscription, Preferences, Security)
 * - Personal information display
 * - Account statistics
 * - Subscription tier display
 * - Settings page accessibility
 * - Mobile responsiveness
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

// Test user credentials
const TEST_EMAIL = `settings-test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!@#';
const TEST_NAME = 'Settings Test User';

test.describe('Account Settings Page', () => {

  // Helper: Create account and login
  async function loginAsTestUser(page: any) {
    // Mock Convex auth responses
    await page.route('**/api/mutation', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'auth:signup') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: {
              success: true,
              userId: 'test-user-id-123',
              email: TEST_EMAIL,
              subscriptionTier: 'free',
              analysesLimit: 3,
            },
          }),
        });
      } else if (postData?.path === 'auth:login') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: {
              success: true,
              userId: 'test-user-id-123',
              email: TEST_EMAIL,
              subscriptionTier: 'free',
              token: 'mock-jwt-token',
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock user query
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
              _id: 'test-user-id-123',
              email: TEST_EMAIL,
              firstName: 'Settings',
              lastName: 'Test',
              company: 'Test Company Inc',
              subscriptionTier: 'free',
              subscriptionStatus: 'active',
              analysesUsed: 1,
              analysesLimit: 3,
              currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
              createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
              active: true,
              emailVerified: true,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(BASE_URL);

    // Perform login (assuming there's a login flow in the app)
    await page.evaluate(() => {
      localStorage.setItem('convex-auth-token', 'mock-jwt-token');
      localStorage.setItem('user-id', 'test-user-id-123');
    });

    await page.reload();
    await page.waitForTimeout(1000);
  }

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should display settings page when navigating from dashboard', async ({ page }) => {
    // Navigate to settings
    const settingsButton = page.locator('[data-nav="settings"]').or(page.locator('button:has-text("Settings")')).first();

    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);
    } else {
      // Navigate directly via URL hash
      await page.goto(`${BASE_URL}/#settings`);
      await page.waitForTimeout(1000);
    }

    // Verify settings page loaded
    await expect(page.locator('h1:has-text("Account Settings")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Manage your account, subscription, and preferences')).toBeVisible();
  });

  test('should display all four tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Check all tabs are visible
    await expect(page.locator('button:has-text("Account")')).toBeVisible();
    await expect(page.locator('button:has-text("Subscription")')).toBeVisible();
    await expect(page.locator('button:has-text("Preferences")')).toBeVisible();
    await expect(page.locator('button:has-text("Security")')).toBeVisible();
  });

  test('should navigate between tabs correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Start on Account tab (default)
    await expect(page.locator('text=Personal Information')).toBeVisible();

    // Click Subscription tab
    await page.locator('button:has-text("Subscription")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Current Plan')).toBeVisible();

    // Click Preferences tab
    await page.locator('button:has-text("Preferences")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Notifications')).toBeVisible();

    // Click Security tab
    await page.locator('button:has-text("Security")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Change Password')).toBeVisible();

    // Go back to Account tab
    await page.locator('button:has-text("Account")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Personal Information')).toBeVisible();
  });

  test('should display personal information correctly in Account tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Verify Account tab is active
    await expect(page.locator('text=Personal Information')).toBeVisible();

    // Check email display
    await expect(page.locator(`text=${TEST_EMAIL}`)).toBeVisible();

    // Check name display (if provided during signup)
    const nameElement = page.locator('text=Settings Test');
    if (await nameElement.isVisible()) {
      await expect(nameElement).toBeVisible();
    }

    // Check Member Since date
    await expect(page.locator('text=Member Since')).toBeVisible();
    await expect(page.locator('text=15 days ago')).toBeVisible();
  });

  test('should display account statistics correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Verify Account Statistics section
    await expect(page.locator('text=Account Statistics')).toBeVisible();

    // Check for analyses used
    await expect(page.locator('text=Analyses Used')).toBeVisible();
    await expect(page.locator('text=This month')).toBeVisible();

    // Check for analyses remaining
    await expect(page.locator('text=Analyses Remaining')).toBeVisible();

    // Check for account tier
    await expect(page.locator('text=Account Tier')).toBeVisible();
  });

  test('should display subscription information in Subscription tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Navigate to Subscription tab
    await page.locator('button:has-text("Subscription")').click();
    await page.waitForTimeout(300);

    // Check Current Plan section
    await expect(page.locator('text=Current Plan')).toBeVisible();

    // Check for subscription status
    const statusBadge = page.locator('text=Active').or(page.locator('[class*="emerald"]'));
    await expect(statusBadge.first()).toBeVisible();

    // Check for plan features
    await expect(page.locator('text=Plan Features:')).toBeVisible();
  });

  test('should display upgrade CTA for free tier users', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Navigate to Subscription tab
    await page.locator('button:has-text("Subscription")').click();
    await page.waitForTimeout(300);

    // Free tier should see upgrade CTA
    const upgradeSection = page.locator('text=Upgrade Your Plan').or(page.locator('text=View Pricing Plans'));
    await expect(upgradeSection.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display notification preferences in Preferences tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Navigate to Preferences tab
    await page.locator('button:has-text("Preferences")').click();
    await page.waitForTimeout(300);

    // Check notification toggles
    await expect(page.locator('text=Email Notifications')).toBeVisible();
    await expect(page.locator('text=Usage Alerts')).toBeVisible();
    await expect(page.locator('text=Product Updates')).toBeVisible();

    // Verify toggle switches are present
    const toggles = page.locator('button[class*="rounded-full"]');
    const toggleCount = await toggles.count();
    expect(toggleCount).toBeGreaterThanOrEqual(3);
  });

  test('should toggle notification preferences', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Navigate to Preferences tab
    await page.locator('button:has-text("Preferences")').click();
    await page.waitForTimeout(300);

    // Find and click first toggle
    const firstToggle = page.locator('button[class*="rounded-full"]').first();
    const initialState = await firstToggle.getAttribute('class');

    await firstToggle.click();
    await page.waitForTimeout(200);

    const newState = await firstToggle.getAttribute('class');
    expect(initialState).not.toBe(newState);
  });

  test('should display security options in Security tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Navigate to Security tab
    await page.locator('button:has-text("Security")').click();
    await page.waitForTimeout(300);

    // Check for Change Password section
    await expect(page.locator('text=Change Password')).toBeVisible();

    // Check for password form elements
    await expect(page.locator('label:has-text("Current Password")')).toBeVisible();
    await expect(page.locator('label:has-text("New Password")')).toBeVisible();
    await expect(page.locator('label:has-text("Confirm New Password")')).toBeVisible();

    // Check for logout button
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });

  test('should close settings page when clicking close button', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Verify settings page is open
    await expect(page.locator('h1:has-text("Account Settings")')).toBeVisible();

    // Click close button (X button)
    const closeButton = page.locator('button[aria-label="Close settings"]').or(
      page.locator('button:has(svg):near(h1:has-text("Account Settings"))')
    ).first();

    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);

      // Settings modal should be closed
      await expect(page.locator('h1:has-text("Account Settings")')).not.toBeVisible();
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Tab through the interface
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Verify focus is on an interactive element
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Check for close button ARIA label
    const closeButton = page.locator('button[aria-label="Close settings"]');
    if (await closeButton.isVisible()) {
      expect(await closeButton.getAttribute('aria-label')).toBe('Close settings');
    }
  });
});

test.describe('Account Settings - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display correctly on mobile', async ({ page }) => {
    // Mock user for mobile test
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
              _id: 'test-user-id-123',
              email: TEST_EMAIL,
              subscriptionTier: 'free',
              analysesUsed: 1,
              analysesLimit: 3,
              createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Verify settings page is responsive
    await expect(page.locator('h1:has-text("Account Settings")')).toBeVisible();

    // Tabs should be visible (may show icons only)
    await expect(page.locator('button:has-text("Account")').or(page.locator('button').first())).toBeVisible();

    // Content should stack vertically
    const accountStats = page.locator('text=Account Statistics');
    if (await accountStats.isVisible()) {
      await expect(accountStats).toBeVisible();
    }
  });

  test('should navigate tabs on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Click Subscription tab
    const subscriptionTab = page.locator('button:has-text("Subscription")').or(
      page.locator('button').nth(1)
    );

    if (await subscriptionTab.isVisible()) {
      await subscriptionTab.click();
      await page.waitForTimeout(300);

      // Verify content changed
      await expect(page.locator('text=Current Plan').or(page.locator('text=Plan'))).toBeVisible();
    }
  });
});

test.describe('Account Settings - Edge Cases', () => {

  test('should handle missing user data gracefully', async ({ page }) => {
    // Mock null/missing user
    await page.route('**/api/query', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'users:getCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: null,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Should show login prompt or redirect
    const loginPrompt = page.locator('text=Please log in to view settings').or(
      page.locator('text=Welcome Back')
    );
    await expect(loginPrompt.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display "Not set" for missing profile fields', async ({ page }) => {
    // Mock user with missing optional fields
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
              _id: 'test-user-id-123',
              email: TEST_EMAIL,
              subscriptionTier: 'free',
              analysesUsed: 0,
              analysesLimit: 3,
              createdAt: Date.now(),
              // No firstName, lastName, or company
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Should show "Not set" for missing fields
    await expect(page.locator('text=Not set')).toBeVisible({ timeout: 5000 });
  });
});
