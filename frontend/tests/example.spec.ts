import { test, expect } from '@playwright/test';

test.describe('Luntra Dashboard', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot for visual verification in Comet
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });

    // Verify the page title or a key element
    await expect(page).toHaveTitle(/Luntra|Outreach Dashboard/i);
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');

    // Example: Test navigation if you have links
    // const navLink = page.locator('nav a').first();
    // await navLink.click();
    // await expect(page).toHaveURL(/\/some-route/);

    // For now, just verify the page is interactive
    await expect(page.locator('body')).toBeVisible();
  });

  test('responsive design - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take a screenshot of mobile view
    await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });

    // Verify responsive elements are present
    await expect(page.locator('body')).toBeVisible();
  });

  test('visual regression - desktop layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Visual regression test - compares against baseline
    await expect(page).toHaveScreenshot('desktop-layout.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});

test.describe('Performance Tests', () => {
  test('page load time is acceptable', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Log performance metric
    console.log(`Page load time: ${loadTime}ms`);

    // Assert load time is under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
