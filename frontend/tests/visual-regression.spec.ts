import { test, expect } from '@playwright/test';

/**
 * Visual Regression Testing Suite
 *
 * This suite captures visual snapshots of key pages and components
 * to detect unintended UI changes. Snapshots are stored in test-results/
 * and can be uploaded to Comet ML for historical comparison.
 *
 * Usage:
 * - Update baselines: npx playwright test --update-snapshots
 * - Run tests: npx playwright test tests/visual-regression.spec.ts
 * - View report: npx playwright show-report
 */

const PRODUCTION_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://luntra.one';

test.describe('Visual Regression - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Warm cache and ensure consistent state
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });

    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Additional time for animations
  });

  test('homepage full page screenshot', async ({ page }) => {
    // Capture full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 10000,
    });
  });

  test('homepage above the fold', async ({ page }) => {
    // Capture viewport screenshot (above the fold)
    await expect(page).toHaveScreenshot('homepage-viewport.png', {
      animations: 'disabled',
      timeout: 10000,
    });
  });

  test('homepage hero section', async ({ page }) => {
    // Find and screenshot hero section
    const hero = page.locator('header, [role="banner"], main > div:first-child').first();

    if (await hero.count() > 0) {
      await expect(hero).toHaveScreenshot('homepage-hero.png', {
        animations: 'disabled',
        timeout: 10000,
      });
    }
  });

  test('homepage navigation', async ({ page }) => {
    // Screenshot navigation bar
    const nav = page.locator('nav, [role="navigation"]').first();

    if (await nav.count() > 0) {
      await expect(nav).toHaveScreenshot('homepage-nav.png', {
        animations: 'disabled',
        timeout: 10000,
      });
    }
  });

  test('homepage footer', async ({ page }) => {
    // Scroll to footer and screenshot
    const footer = page.locator('footer, [role="contentinfo"]').first();

    if (await footer.count() > 0) {
      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await expect(footer).toHaveScreenshot('homepage-footer.png', {
        animations: 'disabled',
        timeout: 10000,
      });
    }
  });
});

test.describe('Visual Regression - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('mobile homepage full page', async ({ page }) => {
    await expect(page).toHaveScreenshot('mobile-homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 10000,
    });
  });

  test('mobile homepage viewport', async ({ page }) => {
    await expect(page).toHaveScreenshot('mobile-homepage-viewport.png', {
      animations: 'disabled',
      timeout: 10000,
    });
  });

  test('mobile navigation menu', async ({ page }) => {
    // Try to find and open mobile menu
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .hamburger, [aria-expanded]').first();

    if (await menuButton.count() > 0) {
      await menuButton.click();
      await page.waitForTimeout(500); // Wait for menu animation

      await expect(page).toHaveScreenshot('mobile-menu-open.png', {
        animations: 'disabled',
        timeout: 10000,
      });
    }
  });
});

test.describe('Visual Regression - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('tablet homepage full page', async ({ page }) => {
    await expect(page).toHaveScreenshot('tablet-homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 10000,
    });
  });

  test('tablet homepage viewport', async ({ page }) => {
    await expect(page).toHaveScreenshot('tablet-homepage-viewport.png', {
      animations: 'disabled',
      timeout: 10000,
    });
  });
});

test.describe('Visual Regression - Dark Mode', () => {
  test.use({ colorScheme: 'dark' });

  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('dark mode homepage', async ({ page }) => {
    await expect(page).toHaveScreenshot('dark-mode-homepage.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 10000,
    });
  });
});

test.describe('Visual Regression - Interactive States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('button hover states', async ({ page }) => {
    // Find primary CTA button
    const button = page.locator('button, a[role="button"], .btn, .button').first();

    if (await button.count() > 0) {
      // Hover over button
      await button.hover();
      await page.waitForTimeout(300);

      await expect(button).toHaveScreenshot('button-hover.png', {
        animations: 'disabled',
        timeout: 10000,
      });
    }
  });

  test('form focus states', async ({ page }) => {
    // Find first input field
    const input = page.locator('input[type="text"], input[type="email"], input').first();

    if (await input.count() > 0) {
      await input.focus();
      await page.waitForTimeout(300);

      await expect(input).toHaveScreenshot('input-focus.png', {
        animations: 'disabled',
        timeout: 10000,
      });
    }
  });
});

test.describe('Visual Regression - Performance Markers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
  });

  test('capture page with performance timing', async ({ page }) => {
    // Get performance metrics
    const performanceTiming = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        totalTime: perf.loadEventEnd - perf.fetchStart,
      };
    });

    console.log('Performance Timing:', performanceTiming);

    // Take screenshot with performance context
    await expect(page).toHaveScreenshot('homepage-with-perf-metrics.png', {
      animations: 'disabled',
      timeout: 10000,
    });
  });
});

test.describe('Visual Regression - Different Browsers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('browser-specific rendering', async ({ page, browserName }) => {
    // Capture browser-specific screenshots
    await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      timeout: 10000,
    });
  });
});
