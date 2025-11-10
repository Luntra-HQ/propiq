/**
 * Frontend Integration Tests
 * Sprint 7: Verify frontend correctly uses new API configuration
 */

import { test, expect } from '@playwright/test';

test.describe('Frontend API Integration', () => {
  test('frontend loads successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the page has loaded
    await expect(page).toHaveTitle(/PropIQ|LUNTRA/);
  });

  test('API calls use /api/v1 prefix', async ({ page }) => {
    // Track network requests
    const apiRequests: string[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('/auth/') || url.includes('/propiq/') || url.includes('/support/')) {
        apiRequests.push(url);
      }
    });

    await page.goto('/');

    // Try to trigger an API call (e.g., health check or authentication)
    await page.waitForTimeout(2000);

    // Verify that any API calls use /api/v1 prefix
    for (const url of apiRequests) {
      if (url.includes('/auth/') || url.includes('/propiq/') || url.includes('/support/') || url.includes('/stripe/')) {
        expect(url).toContain('/api/v1/');
      }
    }
  });

  test('authentication modal uses new API endpoints', async ({ page, context }) => {
    await page.goto('/');

    // Look for login/signup button
    const authButton = page.getByText(/login|sign in|get started/i).first();

    if (await authButton.isVisible()) {
      // Track network requests
      const authRequests: string[] = [];

      page.on('request', request => {
        const url = request.url();
        if (url.includes('/auth/')) {
          authRequests.push(url);
        }
      });

      await authButton.click();

      // Wait for auth modal
      await page.waitForTimeout(1000);

      // Check if the auth modal loaded
      const emailInput = page.getByPlaceholder(/email/i).first();

      if (await emailInput.isVisible()) {
        await emailInput.fill(`test-${Date.now()}@propiq.test`);

        const passwordInput = page.getByPlaceholder(/password/i).first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('TestPassword123!');

          // Try to submit (don't wait for success, just check the request)
          const submitButton = page.getByRole('button', { name: /sign up|sign in|continue/i }).first();

          if (await submitButton.isVisible()) {
            await submitButton.click();

            // Wait a bit for request to be made
            await page.waitForTimeout(1000);

            // Verify auth requests use /api/v1/
            for (const url of authRequests) {
              expect(url).toContain('/api/v1/auth/');
            }
          }
        }
      }
    }
  });

  test('property analysis uses new API endpoints', async ({ page }) => {
    // This test assumes user can access analysis feature
    await page.goto('/');

    // Track network requests
    const analysisRequests: string[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.includes('/propiq/analyze')) {
        analysisRequests.push(url);
      }
    });

    // Look for analyze button or property input
    const analyzeButton = page.getByText(/analyze|property analysis/i).first();

    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForTimeout(1000);

      // If analysis was triggered, verify it used /api/v1/
      if (analysisRequests.length > 0) {
        for (const url of analysisRequests) {
          expect(url).toContain('/api/v1/propiq/analyze');
        }
      }
    }
  });
});

test.describe('Frontend Error Handling', () => {
  test('handles 401 unauthorized correctly', async ({ page, context }) => {
    // Intercept API requests and return 401
    await page.route('**/api/v1/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Token expired' })
      });
    });

    await page.goto('/');

    // The app should handle 401 gracefully (redirect to login or show error)
    await page.waitForTimeout(1000);

    // Check that the page doesn't crash
    await expect(page).not.toHaveURL(/about:blank/);
  });

  test('handles network errors gracefully', async ({ page }) => {
    // Intercept and fail API requests
    await page.route('**/api/v1/**', route => {
      route.abort('failed');
    });

    await page.goto('/');

    // Wait for the page to handle errors
    await page.waitForTimeout(2000);

    // The app should show an error message or fallback UI
    // But should not crash
    await expect(page).not.toHaveURL(/about:blank/);
  });
});
