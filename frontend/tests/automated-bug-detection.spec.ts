import { test, expect } from '@playwright/test';
import { ConsoleMonitor } from './utils/console-monitor';
import path from 'path';

test.describe('Automated Bug Detection - Console Monitoring', () => {
  let consoleMonitor: ConsoleMonitor;

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor(page);
  });

  test.afterEach(async () => {
    // Export logs after each test
    const testName = test.info().title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const logPath = path.join(process.cwd(), 'test-results', 'console-logs', `${testName}.json`);
    consoleMonitor.exportToJSON(logPath);
    consoleMonitor.printSummary();
  });

  test('BUG-001: Check for tooltip infinite loop errors', async ({ page }) => {
    await page.goto('https://propiq.luntra.one');

    // Login (using test credentials)
    await page.fill('input[type="email"]', 'test@propiq.com');
    await page.fill('input[type="password"]', 'TestPass123!');

    // Try to submit (may or may not succeed - we're monitoring console)
    await page.click('button[type="submit"]').catch(() => {});

    // Wait for potential redirect
    await page.waitForTimeout(3000);

    // Check if we're on dashboard (if login succeeded)
    const isDashboard = page.url().includes('/app') || page.url().includes('/dashboard');

    if (isDashboard) {
      // Try to click Advanced tab
      const advancedTab = page.locator('text=📊 Advanced, text=Advanced').first();
      if (await advancedTab.isVisible()) {
        await advancedTab.click();
        await page.waitForTimeout(2000);
      }
    }

    // Check for infinite loop error
    const errors = consoleMonitor.getErrors();
    const hasInfiniteLoopError = errors.some(err =>
      err.message.includes('Maximum update depth exceeded')
    );

    expect(hasInfiniteLoopError, 'Tooltip infinite loop should be fixed').toBe(false);
  });

  test('BUG-002: Check signup flow for CORS errors', async ({ page }) => {
    await page.goto('https://propiq.luntra.one');

    // Look for signup button
    const signupButton = page.locator('text=Sign Up, button:has-text("Sign Up")').first();

    if (await signupButton.isVisible()) {
      await signupButton.click();
      await page.waitForTimeout(1000);
    }

    // Try to fill signup form if it exists
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    if (await emailInput.isVisible()) {
      const testEmail = `test+${Date.now()}@propiq.com`;
      await emailInput.fill(testEmail);

      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('SecurePass123!@#');
      }

      // Submit (may fail, we're monitoring console)
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click().catch(() => {});
        await page.waitForTimeout(3000);
      }
    }

    // Check for CORS errors
    const errors = consoleMonitor.getErrors();
    const hasCORSError = errors.some(err =>
      err.message.includes('CORS') ||
      err.message.includes('Access-Control-Allow-Origin') ||
      err.message.includes('blocked by CORS policy')
    );

    expect(hasCORSError, 'CORS errors should be fixed').toBe(false);
  });

  test('BUG-003: Check calculator for calculation errors', async ({ page }) => {
    await page.goto('https://propiq.luntra.one/app');

    // Wait for page load
    await page.waitForTimeout(2000);

    // Navigate to calculator if not already there
    const calculatorLink = page.locator('text=Calculator, a:has-text("Calculator")').first();
    if (await calculatorLink.isVisible()) {
      await calculatorLink.click();
      await page.waitForTimeout(1000);
    }

    // Try to fill calculator inputs
    const purchasePriceInput = page.locator('input[name="purchasePrice"]').first();
    if (await purchasePriceInput.isVisible()) {
      await purchasePriceInput.fill('300000');
      await page.waitForTimeout(500);
    }

    // Check for calculation errors
    const errors = consoleMonitor.getErrors();
    const hasCalculationError = errors.some(err =>
      err.message.toLowerCase().includes('nan') ||
      err.message.toLowerCase().includes('undefined') ||
      err.message.toLowerCase().includes('calculation')
    );

    expect(hasCalculationError, 'No calculation errors should occur').toBe(false);
  });

  test('BUG-004: Check payment flow for Stripe errors', async ({ page }) => {
    await page.goto('https://propiq.luntra.one/pricing');

    // Wait for page load
    await page.waitForTimeout(2000);

    // Look for Starter plan button
    const starterButton = page.locator('text=Choose Starter, button:has-text("Starter")').first();
    if (await starterButton.isVisible()) {
      await starterButton.click().catch(() => {});
      await page.waitForTimeout(3000);
    }

    // Check for Stripe integration errors
    const errors = consoleMonitor.getErrors();
    const hasStripeError = errors.some(err =>
      err.message.toLowerCase().includes('stripe') ||
      err.message.toLowerCase().includes('checkout') && err.message.toLowerCase().includes('failed')
    );

    expect(hasStripeError, 'Stripe integration should work without errors').toBe(false);
  });

  test('ISSUE-018: Password reset navigation timeout', async ({ page }) => {
    await page.goto('https://propiq.luntra.one');

    // Look for "Forgot Password" link
    const forgotPasswordLink = page.locator('text=Forgot Password, a:has-text("Forgot")').first();

    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await page.waitForTimeout(1000);

      // Fill email
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@propiq.com');

        // Submit
        const submitButton = page.locator('button:has-text("Send Reset Link"), button:has-text("Reset")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click().catch(() => {});
          await page.waitForTimeout(5000);
        }
      }
    }

    // Check for timeout errors
    const errors = consoleMonitor.getErrors();
    const hasTimeoutError = errors.some(err =>
      err.message.toLowerCase().includes('timeout') ||
      err.message.toLowerCase().includes('navigation')
    );

    expect(hasTimeoutError, 'Password reset should not timeout').toBe(false);
  });

  test('ISSUE-019: Duplicate fetch on password reset', async ({ page }) => {
    let requestCount = 0;

    // Monitor network requests
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/auth/password-reset') || url.includes('resetPassword')) {
        requestCount++;
        console.log(`Password reset request #${requestCount}: ${url}`);
      }
    });

    await page.goto('https://propiq.luntra.one');

    // Look for "Forgot Password" link
    const forgotPasswordLink = page.locator('text=Forgot Password, a:has-text("Forgot")').first();

    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await page.waitForTimeout(1000);

      // Fill email
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@propiq.com');

        // Submit
        const submitButton = page.locator('button:has-text("Send Reset Link"), button:has-text("Reset")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click().catch(() => {});
          await page.waitForTimeout(3000);
        }
      }
    }

    // Should only make ONE request (allowing 0 if feature doesn't exist yet)
    expect(requestCount <= 1, `Should make at most 1 password reset request, got ${requestCount}`).toBe(true);
    expect(consoleMonitor.hasErrors(), 'No console errors should occur').toBe(false);
  });

  test('General health check: No console errors on homepage', async ({ page }) => {
    await page.goto('https://propiq.luntra.one');
    await page.waitForTimeout(3000);

    // Homepage should have zero console errors
    expect(consoleMonitor.hasErrors(), 'Homepage should have no console errors').toBe(false);
  });
});
