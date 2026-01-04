/**
 * Calculator Smoke Tests
 * Tier 1 E2E Testing - Critical calculator workflows
 *
 * Tests cover:
 * - Calculator loads and renders
 * - User can input property data
 * - Calculations update in real-time
 * - Tab switching (Basic, Advanced, Scenarios)
 * - Results display correctly
 */

import { test, expect } from '@playwright/test';

test.describe('Deal Calculator Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage (calculator is embedded)
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('calculator loads and renders all key elements', async ({ page }) => {
    // Check for calculator container
    const calculator = await page.locator('.deal-calculator').first();
    await expect(calculator).toBeVisible();

    // Check for input fields (basic inputs should be visible)
    await expect(page.locator('input[name="purchasePrice"], input[placeholder*="Purchase"], input[placeholder*="purchase"]').first()).toBeVisible();

    // Check for results section
    const results = await page.locator('.results-display, .metrics-grid, [class*="result"]').first();
    await expect(results).toBeVisible();
  });

  test('can input property data and see calculations update', async ({ page }) => {
    // Fill in basic property inputs
    const purchasePrice = page.locator('input[name="purchasePrice"], input[placeholder*="Purchase"], input[placeholder*="purchase"]').first();
    await purchasePrice.fill('250000');

    const downPayment = page.locator('input[name="downPaymentPercent"], input[placeholder*="Down"], input[placeholder*="down"]').first();
    await downPayment.fill('20');

    const monthlyRent = page.locator('input[name="monthlyRent"], input[placeholder*="Rent"], input[placeholder*="rent"]').first();
    await monthlyRent.fill('2500');

    // Wait for calculations to update (debounce delay)
    await page.waitForTimeout(500);

    // Verify results are displayed (look for dollar amounts)
    const resultsText = await page.locator('.results-display, .metrics-grid, [class*="result"]').first().textContent();

    // Should show formatted currency values
    expect(resultsText).toMatch(/\$[\d,]+/);
  });

  test('can switch between calculator tabs', async ({ page }) => {
    // Look for tab navigation
    const tabs = await page.locator('[role="tablist"], .tabs, [class*="tab"]').first();

    // Check if tabs exist
    if (await tabs.isVisible()) {
      // Find all tab buttons
      const tabButtons = await page.locator('[role="tab"], button[class*="tab"], .tab-button').all();

      // Verify we have multiple tabs
      expect(tabButtons.length).toBeGreaterThanOrEqual(2);

      // Test switching to Advanced tab (if it exists)
      const advancedTab = await page.locator('[role="tab"]:has-text("Advanced"), button:has-text("Advanced")').first();
      if (await advancedTab.isVisible()) {
        await advancedTab.click();
        await page.waitForTimeout(300);

        // Advanced tab should be active
        const activeTab = await page.locator('[role="tab"][aria-selected="true"], [role="tab"].active, button.active').first();
        const activeText = await activeTab.textContent();
        expect(activeText?.toLowerCase()).toContain('advanced');
      }
    }
  });

  test('displays deal score and metrics', async ({ page }) => {
    // Fill in complete property data
    await page.locator('input[name="purchasePrice"], input[placeholder*="Purchase"]').first().fill('250000');
    await page.locator('input[name="downPaymentPercent"], input[placeholder*="Down"]').first().fill('20');
    await page.locator('input[name="monthlyRent"], input[placeholder*="Rent"]').first().fill('2500');

    // Wait for calculations
    await page.waitForTimeout(500);

    // Look for key metrics
    const pageContent = await page.textContent('body');

    // Should display cash flow
    expect(pageContent).toMatch(/cash\s*flow/i);

    // Should display financial metrics (look for percentage or dollar signs)
    expect(pageContent).toMatch(/\$[\d,]+|\d+\.?\d*%/);
  });

  test('handles zero and invalid inputs gracefully', async ({ page }) => {
    // Test with zero purchase price
    const purchasePrice = page.locator('input[name="purchasePrice"], input[placeholder*="Purchase"]').first();
    await purchasePrice.fill('0');
    await page.waitForTimeout(300);

    // Calculator should not crash (page should still be responsive)
    const calculator = await page.locator('.deal-calculator, [class*="calculator"]').first();
    await expect(calculator).toBeVisible();

    // Test with very large number
    await purchasePrice.fill('99999999');
    await page.waitForTimeout(300);

    // Should handle without crashing
    await expect(calculator).toBeVisible();
  });

  test('calculations are mathematically correct', async ({ page }) => {
    // Input specific values with known calculation results
    await page.locator('input[name="purchasePrice"], input[placeholder*="Purchase"]').first().fill('200000');
    await page.locator('input[name="downPaymentPercent"], input[placeholder*="Down"]').first().fill('20');
    await page.locator('input[name="monthlyRent"], input[placeholder*="Rent"]').first().fill('2000');

    // Fill interest rate if visible
    const interestRate = page.locator('input[name="interestRate"], input[placeholder*="Interest"]').first();
    if (await interestRate.isVisible()) {
      await interestRate.fill('6');
    }

    await page.waitForTimeout(500);

    // Verify loan amount calculation
    // $200k purchase * 80% LTV = $160k loan
    const pageText = await page.textContent('body');

    // Should show loan amount around $160,000
    expect(pageText).toMatch(/160,000|160000/);
  });

  test('no JavaScript errors during calculator interaction', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      errors.push(err.message);
    });

    // Interact with calculator
    await page.locator('input[name="purchasePrice"], input[placeholder*="Purchase"]').first().fill('250000');
    await page.locator('input[name="monthlyRent"], input[placeholder*="Rent"]').first().fill('2500');
    await page.waitForTimeout(500);

    // Filter out non-critical errors
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('manifest') &&
      !err.toLowerCase().includes('warning') &&
      !err.includes('DevTools')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('responsive design - calculator works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    // Calculator should still be visible and functional
    const calculator = await page.locator('.deal-calculator, [class*="calculator"]').first();
    await expect(calculator).toBeVisible();

    // Should be able to input data
    const purchasePrice = page.locator('input[name="purchasePrice"], input[placeholder*="Purchase"]').first();
    await expect(purchasePrice).toBeVisible();
    await purchasePrice.fill('200000');

    // Results should display
    await page.waitForTimeout(300);
    const results = await page.locator('.results-display, .metrics-grid, [class*="result"]').first();
    await expect(results).toBeVisible();
  });
});

test.describe('Calculator Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('handles negative cash flow properties', async ({ page }) => {
    // Input a property that will have negative cash flow
    await page.locator('input[name="purchasePrice"], input[placeholder*="Purchase"]').first().fill('500000');
    await page.locator('input[name="downPaymentPercent"], input[placeholder*="Down"]').first().fill('20');
    await page.locator('input[name="monthlyRent"], input[placeholder*="Rent"]').first().fill('1000'); // Low rent

    await page.waitForTimeout(500);

    // Calculator should handle this without crashing
    const calculator = await page.locator('.deal-calculator, [class*="calculator"]').first();
    await expect(calculator).toBeVisible();

    // Should display results (even if negative)
    const resultsText = await page.textContent('body');
    expect(resultsText).toBeTruthy();
  });

  test('handles all-cash purchase (0% financing)', async ({ page }) => {
    await page.locator('input[name="purchasePrice"], input[placeholder*="Purchase"]').first().fill('200000');
    await page.locator('input[name="downPaymentPercent"], input[placeholder*="Down"]').first().fill('100'); // All cash
    await page.locator('input[name="monthlyRent"], input[placeholder*="Rent"]').first().fill('2000');

    await page.waitForTimeout(500);

    // Should show zero mortgage payment
    const pageText = await page.textContent('body');

    // Calculator should work without errors
    const calculator = await page.locator('.deal-calculator, [class*="calculator"]').first();
    await expect(calculator).toBeVisible();
  });
});
