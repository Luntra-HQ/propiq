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
});
