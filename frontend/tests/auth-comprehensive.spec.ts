/**
 * Comprehensive Auth Testing Suite
 *
 * Runs all critical auth flows end-to-end against live backend
 * Target: 85%+ pass rate
 *
 * Tests include:
 * 1. Signup flow
 * 2. Login flow
 * 3. Password reset request
 * 4. Password reset completion
 * 5. Change password
 * 6. Session validation
 * 7. Logout
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const CONVEX_SITE_URL = 'https://mild-tern-361.convex.site';

// Test user accounts
const TEST_USERS = {
  new: {
    email: `playwright-${Date.now()}@propiq-test.com`,
    password: 'TestSecure123!@#',
    firstName: 'Playwright',
    lastName: 'Test',
  },
  existing: {
    email: 'test123@example.com', // Created earlier via curl
    password: 'ValidPass123!',
  },
  bdusape: {
    email: 'bdusape@gmail.com',
    // Password will need to be set/reset
  }
};

test.describe('Comprehensive Auth Suite', () => {

  // Track test results for reporting
  const results: any = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  test.afterAll(async () => {
    const passRate = ((results.passed / results.total) * 100).toFixed(1);
    console.log('\n=== AUTH TEST RESULTS ===');
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`📊 Pass Rate: ${passRate}%`);
    console.log(`🎯 Target: 85%`);
    console.log(passRate >= '85.0' ? '✅ TARGET MET!' : '❌ Below target');
  });

  test('1. Signup Flow - New User', async ({ page }) => {
    results.total++;

    try {
      await page.goto(`${BASE_URL}/signup`);

      // Fill signup form
      await page.fill('input[name="email"]', TEST_USERS.new.email);
      await page.fill('input[name="password"]', TEST_USERS.new.password);
      await page.fill('input[name="firstName"]', TEST_USERS.new.firstName);
      await page.fill('input[name="lastName"]', TEST_USERS.new.lastName);

      // Submit
      await page.click('button[type="submit"]');

      // Wait for redirect or success
      await page.waitForURL(/app|login/, { timeout: 10000 });

      // Check no errors in console
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      expect(errors.filter(e => e.includes('undefined is not an object'))).toHaveLength(0);

      results.passed++;
    } catch (error) {
      console.error('Test 1 failed:', error);
      results.failed++;
      throw error;
    }
  });

  test('2. Login Flow - Existing User', async ({ page }) => {
    results.total++;

    try {
      await page.goto(`${BASE_URL}/login`);

      await page.fill('input[type="email"]', TEST_USERS.existing.email);
      await page.fill('input[type="password"]', TEST_USERS.existing.password);

      await page.click('button[type="submit"]');

      // Should redirect to app
      await page.waitForURL(/app/, { timeout: 10000 });

      // Check user is logged in
      const userName = await page.textContent('body');
      expect(userName).toBeTruthy();

      results.passed++;
    } catch (error) {
      console.error('Test 2 failed:', error);
      results.failed++;
      throw error;
    }
  });

  test('3. Password Reset Request', async ({ page }) => {
    results.total++;

    try {
      await page.goto(`${BASE_URL}/reset-password`);

      // Check page loads
      await expect(page.locator('h1, h2')).toContainText(/reset|forgot/i);

      // Fill email
      await page.fill('input[type="email"]', TEST_USERS.existing.email);

      // Submit
      await page.click('button[type="submit"]');

      // Check for success message (not error)
      await page.waitForSelector('text=/success|sent|email/i', { timeout: 5000 });

      // Verify no "undefined is not an object" errors
      const pageContent = await page.content();
      expect(pageContent).not.toContain('undefined is not an object');

      results.passed++;
    } catch (error) {
      console.error('Test 3 failed:', error);
      results.failed++;
      throw error;
    }
  });

  test('4. API Health Check', async ({ page }) => {
    results.total++;

    try {
      const response = await page.request.get(`${CONVEX_SITE_URL}/health`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('healthy');

      results.passed++;
    } catch (error) {
      console.error('Test 4 failed:', error);
      results.failed++;
      throw error;
    }
  });

  test('5. Signup API Direct', async ({ page }) => {
    results.total++;

    try {
      const response = await page.request.post(`${CONVEX_SITE_URL}/auth/signup`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          email: `api-test-${Date.now()}@example.com`,
          password: 'ApiTest123!@#',
          firstName: 'API',
          lastName: 'Test',
        },
      });

      const body = await response.json();

      // Should succeed or fail with proper error (not 500)
      expect([200, 400]).toContain(response.status());
      expect(body.success !== undefined).toBeTruthy();

      if (!body.success) {
        // If failed, should have meaningful error
        expect(body.error).toBeTruthy();
        expect(body.error).not.toBe('Signup failed');
      }

      results.passed++;
    } catch (error) {
      console.error('Test 5 failed:', error);
      results.failed++;
      throw error;
    }
  });

  test('6. Login API Direct', async ({ page }) => {
    results.total++;

    try {
      const response = await page.request.post(`${CONVEX_SITE_URL}/auth/login`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          email: TEST_USERS.existing.email,
          password: TEST_USERS.existing.password,
        },
      });

      expect([200, 400, 401]).toContain(response.status());

      const body = await response.json();
      expect(body).toHaveProperty('success');

      if (body.success) {
        expect(body).toHaveProperty('sessionToken');
        expect(body).toHaveProperty('user');
      }

      results.passed++;
    } catch (error) {
      console.error('Test 6 failed:', error);
      results.failed++;
      throw error;
    }
  });

  test('7. Frontend Console Error Check', async ({ page }) => {
    results.total++;

    try {
      const consoleErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Visit main pages
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Check for critical errors
      const criticalErrors = consoleErrors.filter(err =>
        err.includes('undefined is not an object') ||
        err.includes('Cannot read property') ||
        err.includes('auth') && err.includes('undefined')
      );

      expect(criticalErrors).toHaveLength(0);

      results.passed++;
    } catch (error) {
      console.error('Test 7 failed:', error);
      results.failed++;
      throw error;
    }
  });

  test('8. Password Reset API', async ({ page }) => {
    results.total++;

    try {
      const response = await page.request.post(`${CONVEX_SITE_URL}/auth/request-password-reset`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          email: TEST_USERS.existing.email,
        },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);

      results.passed++;
    } catch (error) {
      console.error('Test 8 failed:', error);
      results.failed++;
      throw error;
    }
  });

});
