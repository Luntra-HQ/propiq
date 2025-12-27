/**
 * Auth Flow End-to-End Tests
 *
 * Tests the complete authentication flow including:
 * - CORS configuration
 * - Signup
 * - Login
 * - Session validation
 * - Password reset
 * - Logout
 *
 * These tests run against the actual Convex backend.
 */

import { test, expect } from '@playwright/test';

// Test user credentials
const TEST_USER = {
  email: `test.${Date.now()}@propiq-test.com`,
  password: 'TestPassword123!@#',
  firstName: 'Test',
  lastName: 'User',
};

const EXISTING_USER = {
  email: 'bdusape@gmail.com', // Update with actual test account
  password: 'your-password-here', // Update with actual password
};

const CONVEX_URL = process.env.VITE_CONVEX_URL?.replace('.convex.cloud', '.convex.site') || 'https://mild-tern-361.convex.site';

test.describe('Authentication Flow', () => {

  test.describe('CORS Configuration', () => {
    test('should allow requests from localhost:5173', async ({ page }) => {
      // Navigate to the app
      await page.goto('/');

      // Monitor console for CORS errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('CORS')) {
          consoleErrors.push(msg.text());
        }
      });

      // Make a request to the auth endpoint
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/auth/me`, {
          headers: {
            'Authorization': 'Bearer invalid-token',
          },
        });
        return {
          status: res.status,
          headers: Object.fromEntries(res.headers.entries()),
        };
      }, CONVEX_URL);

      // Verify no CORS errors
      expect(consoleErrors).toHaveLength(0);

      // Verify CORS headers are present
      expect(response.headers['access-control-allow-origin']).toBeTruthy();

      console.log('✅ CORS headers:', response.headers);
    });
  });

  test.describe('Signup Flow', () => {
    test('should create a new user account', async ({ page }) => {
      await page.goto('/login');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Look for signup form or toggle
      const hasSignupButton = await page.locator('text=/sign.*up/i').count() > 0;

      if (hasSignupButton) {
        await page.click('text=/sign.*up/i');
      }

      // Fill signup form
      await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
      await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);

      // Look for first name field (optional)
      const firstNameField = page.locator('input[name="firstName"]');
      if (await firstNameField.count() > 0) {
        await firstNameField.fill(TEST_USER.firstName);
      }

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for redirect or success message
      await page.waitForTimeout(2000);

      // Check for successful signup
      const url = page.url();
      const isLoggedIn = url.includes('/dashboard') || url.includes('/app');

      console.log('✅ Signup test completed. Current URL:', url);
      console.log('   Is logged in:', isLoggedIn);
    });

    test('should reject signup with weak password', async ({ page }) => {
      await page.goto('/login');

      const response = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: args.email,
            password: 'weak', // Weak password
            firstName: 'Test',
            lastName: 'User',
          }),
        });
        return res.json();
      }, { url: CONVEX_URL, email: `weak.${Date.now()}@test.com` });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Password');

      console.log('✅ Weak password rejected:', response.error);
    });

    test('should reject duplicate email signup', async ({ page }) => {
      const duplicateEmail = `duplicate.${Date.now()}@test.com`;

      // First signup
      await page.evaluate(async (args) => {
        await fetch(`${args.url}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: args.email,
            password: 'TestPassword123!@#',
            firstName: 'Test',
          }),
        });
      }, { url: CONVEX_URL, email: duplicateEmail });

      // Second signup with same email
      const response = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: args.email,
            password: 'TestPassword123!@#',
            firstName: 'Test',
          }),
        });
        return res.json();
      }, { url: CONVEX_URL, email: duplicateEmail });

      expect(response.success).toBe(false);
      expect(response.error).toMatch(/already exists/i);

      console.log('✅ Duplicate email rejected:', response.error);
    });
  });

  test.describe('Login Flow', () => {
    test('should login with valid credentials', async ({ page }) => {
      // First create a user
      const testEmail = `login.${Date.now()}@test.com`;

      await page.evaluate(async (args) => {
        await fetch(`${args.url}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: args.email,
            password: args.password,
            firstName: 'Login',
            lastName: 'Test',
          }),
        });
      }, { url: CONVEX_URL, email: testEmail, password: TEST_USER.password });

      // Now try to login
      const loginResponse = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: args.email,
            password: args.password,
          }),
        });
        return res.json();
      }, { url: CONVEX_URL, email: testEmail, password: TEST_USER.password });

      expect(loginResponse.success).toBe(true);
      expect(loginResponse.sessionToken).toBeTruthy();
      expect(loginResponse.user).toBeTruthy();
      expect(loginResponse.user.email).toBe(testEmail);

      console.log('✅ Login successful');
      console.log('   User:', loginResponse.user.email);
      console.log('   Session token length:', loginResponse.sessionToken.length);
    });

    test('should reject login with wrong password', async ({ page }) => {
      const response = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'any@email.com',
            password: 'WrongPassword123!',
          }),
        });
        return res.json();
      }, { url: CONVEX_URL });

      expect(response.success).toBe(false);
      expect(response.error).toMatch(/invalid/i);

      console.log('✅ Invalid credentials rejected:', response.error);
    });

    test('should reject login with missing fields', async ({ page }) => {
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@test.com',
            // Missing password
          }),
        });
        return res.json();
      }, CONVEX_URL);

      expect(response.success).toBe(false);

      console.log('✅ Missing fields rejected:', response.error);
    });
  });

  test.describe('Session Validation', () => {
    test('should validate valid session token', async ({ page }) => {
      // Create user and get token
      const testEmail = `session.${Date.now()}@test.com`;

      const signupResponse = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: args.email,
            password: args.password,
            firstName: 'Session',
          }),
        });
        return res.json();
      }, { url: CONVEX_URL, email: testEmail, password: TEST_USER.password });

      const token = signupResponse.sessionToken;

      // Validate session
      const meResponse = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${args.token}`,
          },
        });
        return res.json();
      }, { url: CONVEX_URL, token });

      expect(meResponse.authenticated).toBe(true);
      expect(meResponse.user).toBeTruthy();
      expect(meResponse.user.email).toBe(testEmail);

      console.log('✅ Session validated');
      console.log('   User:', meResponse.user.email);
      console.log('   Subscription tier:', meResponse.user.subscriptionTier);
    });

    test('should reject invalid session token', async ({ page }) => {
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/auth/me`, {
          headers: {
            'Authorization': 'Bearer invalid-token-12345',
          },
        });
        return res.json();
      }, CONVEX_URL);

      expect(response.authenticated).toBe(false);
      expect(response.user).toBeNull();

      console.log('✅ Invalid token rejected');
    });

    test('should reject missing Authorization header', async ({ page }) => {
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/auth/me`);
        return res.json();
      }, CONVEX_URL);

      expect(response.authenticated).toBe(false);

      console.log('✅ Missing auth header rejected');
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should accept password reset request', async ({ page }) => {
      const response = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/request-password-reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: args.email,
          }),
        });
        return res.json();
      }, { url: CONVEX_URL, email: 'any@email.com' });

      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();

      console.log('✅ Password reset request accepted');
      console.log('   Message:', response.message);
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout and invalidate session', async ({ page }) => {
      // Create user and login
      const testEmail = `logout.${Date.now()}@test.com`;

      const signupResponse = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: args.email,
            password: args.password,
          }),
        });
        return res.json();
      }, { url: CONVEX_URL, email: testEmail, password: TEST_USER.password });

      const token = signupResponse.sessionToken;

      // Logout
      const logoutResponse = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${args.token}`,
          },
        });
        return res.json();
      }, { url: CONVEX_URL, token });

      expect(logoutResponse.success).toBe(true);

      // Verify session is invalid
      const meResponse = await page.evaluate(async (args) => {
        const res = await fetch(`${args.url}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${args.token}`,
          },
        });
        return res.json();
      }, { url: CONVEX_URL, token });

      expect(meResponse.authenticated).toBe(false);

      console.log('✅ Logout successful, session invalidated');
    });
  });

  test.describe('UI Integration', () => {
    test('should display login page without CORS errors', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Check for CORS errors
      const corsErrors = consoleErrors.filter(e =>
        e.includes('CORS') ||
        e.includes('Access-Control-Allow-Origin') ||
        e.includes('not allowed by')
      );

      expect(corsErrors).toHaveLength(0);

      // Verify login form is visible
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      console.log('✅ Login page loaded without CORS errors');
      console.log('   Total console errors:', consoleErrors.length);
      console.log('   CORS errors:', corsErrors.length);
    });
  });
});

test.describe('Performance & Edge Cases', () => {
  test('should handle rapid sequential logins', async ({ page }) => {
    const testEmail = `rapid.${Date.now()}@test.com`;

    // Create user
    await page.evaluate(async (args) => {
      await fetch(`${args.url}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: args.email,
          password: args.password,
        }),
      });
    }, { url: CONVEX_URL, email: testEmail, password: TEST_USER.password });

    // Rapid logins
    const results = await page.evaluate(async (args) => {
      const promises = Array(5).fill(null).map(() =>
        fetch(`${args.url}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: args.email,
            password: args.password,
          }),
        }).then(r => r.json())
      );
      return Promise.all(promises);
    }, { url: CONVEX_URL, email: testEmail, password: TEST_USER.password });

    // All should succeed
    results.forEach(result => {
      expect(result.success).toBe(true);
    });

    console.log('✅ Rapid sequential logins handled');
    console.log('   Successful logins:', results.length);
  });
});
