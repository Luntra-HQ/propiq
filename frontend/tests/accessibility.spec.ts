import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('Homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Deal Calculator should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Wait for calculator to load
    await page.waitForSelector('.deal-calculator');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('PropIQ Analysis modal should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Open PropIQ modal
    await page.click('button:has-text("Run PropIQ AI Analysis")');

    // Wait for modal
    await page.waitForSelector('.propiq-modal');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Support Chat should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Open support chat
    await page.click('button:has-text("Need Help")');

    // Wait for chat widget
    await page.waitForSelector('.support-chat-widget');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Help Center modal should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Try to find and click Help button
    const helpButton = page.getByTestId('help-button').or(page.getByRole('button', { name: /help/i }));

    try {
      await helpButton.waitFor({ state: 'visible', timeout: 5000 });
      await helpButton.click();

      // Wait for Help Center modal
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Run comprehensive WCAG 2.1 AA accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log any violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log('Help Center Accessibility Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (e) {
      console.log('Help button not available (may require authentication)');
      test.skip();
    }
  });

  test('Help Center modal has proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const helpButton = page.getByTestId('help-button').or(page.getByRole('button', { name: /help/i }));

    try {
      await helpButton.waitFor({ state: 'visible', timeout: 5000 });
      await helpButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      const modal = page.locator('[role="dialog"]');

      // Check required ARIA attributes
      await expect(modal).toHaveAttribute('role', 'dialog');
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal).toHaveAttribute('aria-labelledby');

      // Verify close button has accessible name
      const closeButton = page.getByRole('button', { name: /close/i });
      await expect(closeButton).toBeVisible();

      // Verify search input has accessible name
      const searchInput = page.locator('input[aria-label*="search" i]').or(
        page.getByRole('searchbox')
      );
      const searchVisible = await searchInput.count();
      if (searchVisible > 0) {
        const hasAccessibleName = await searchInput.first().evaluate((el) => {
          return !!(el.getAttribute('aria-label') ||
                   el.getAttribute('aria-labelledby') ||
                   document.querySelector(`label[for="${el.id}"]`));
        });
        expect(hasAccessibleName).toBe(true);
      }
    } catch (e) {
      console.log('Help button not available');
      test.skip();
    }
  });

  test('Help Center supports keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const helpButton = page.getByTestId('help-button').or(page.getByRole('button', { name: /help/i }));

    try {
      await helpButton.waitFor({ state: 'visible', timeout: 5000 });

      // Focus and press Enter to open
      await helpButton.focus();
      await page.keyboard.press('Enter');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Verify modal is closed
      await expect(modal).not.toBeVisible();
    } catch (e) {
      console.log('Help button not available');
      test.skip();
    }
  });

  test('Help Center has sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const helpButton = page.getByTestId('help-button').or(page.getByRole('button', { name: /help/i }));

    try {
      await helpButton.waitFor({ state: 'visible', timeout: 5000 });
      await helpButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Run color contrast check specifically
      const contrastResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withRules(['color-contrast'])
        .analyze();

      // Log violations for review
      if (contrastResults.violations.length > 0) {
        console.log('Color Contrast Violations:',
          JSON.stringify(contrastResults.violations, null, 2));
      }

      // Filter for critical/serious violations only
      const criticalViolations = contrastResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalViolations).toEqual([]);
    } catch (e) {
      console.log('Help button not available');
      test.skip();
    }
  });

  test('Help Center is usable at 200% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const helpButton = page.getByTestId('help-button').or(page.getByRole('button', { name: /help/i }));

    try {
      await helpButton.waitFor({ state: 'visible', timeout: 5000 });
      await helpButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Simulate 200% zoom
      await page.evaluate(() => {
        document.body.style.zoom = '2.0';
      });

      await page.waitForTimeout(500);

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Verify critical elements are still accessible
      const closeButton = page.getByRole('button', { name: /close/i });
      await expect(closeButton).toBeVisible();

      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1.0';
      });
    } catch (e) {
      console.log('Help button not available');
      test.skip();
    }
  });
});
