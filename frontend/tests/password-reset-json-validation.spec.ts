/**
 * Password Reset - JSON Response Validation Tests
 *
 * Tests that verify the password reset flow returns valid JSON responses
 * for all scenarios, including edge cases and error conditions.
 *
 * This suite focuses on:
 * - Network response validation (valid JSON, proper Content-Type)
 * - HTTP status codes
 * - Error handling (malformed email, missing fields, user not found)
 * - UI response to network errors
 */

import { test, expect, Page, Request, Route } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const CONVEX_URL = process.env.VITE_CONVEX_URL || 'https://mild-tern-361.convex.cloud';
const CONVEX_SITE_URL = CONVEX_URL.replace('.cloud', '.site');

// Helper function to validate JSON response
async function validateJsonResponse(response: any, expectedStatusRange: { min: number; max: number } = { min: 200, max: 299 }) {
  const status = response.status();
  console.log(`[Test] Response status: ${status}`);

  // Check status code is in expected range
  expect(status).toBeGreaterThanOrEqual(expectedStatusRange.min);
  expect(status).toBeLessThanOrEqual(expectedStatusRange.max);

  // Check Content-Type header
  const contentType = response.headers()['content-type'];
  console.log(`[Test] Content-Type: ${contentType}`);
  expect(contentType).toContain('application/json');

  // Get response text
  const responseText = await response.text();
  console.log(`[Test] Response body length: ${responseText.length} bytes`);

  // Validate it's not empty
  expect(responseText.length).toBeGreaterThan(0);

  // Parse JSON - this will throw if invalid
  let data;
  try {
    data = JSON.parse(responseText);
    console.log(`[Test] Parsed JSON successfully:`, data);
  } catch (e) {
    throw new Error(`Failed to parse JSON response: ${responseText}`);
  }

  // Validate JSON structure (should have success field)
  expect(data).toHaveProperty('success');
  expect(typeof data.success).toBe('boolean');

  return data;
}

// Helper to intercept and capture network request
async function captureNetworkRequest(page: Page, urlPattern: string): Promise<{ request: Request | null; response: any }> {
  let capturedRequest: Request | null = null;
  let capturedResponse: any = null;

  await page.route(urlPattern, async (route: Route) => {
    capturedRequest = route.request();
    const response = await route.fetch();
    capturedResponse = response;
    await route.fulfill({ response });
  });

  return { request: capturedRequest, response: capturedResponse };
}

test.describe('Password Reset - Network Response Validation', () => {

  test.beforeEach(async ({ page }) => {
    // Set up console logging
    page.on('console', msg => {
      if (msg.text().includes('[Reset Password]')) {
        console.log(`Browser: ${msg.text()}`);
      }
    });
  });

  test('Happy Path: Valid email returns success JSON with 200 status', async ({ page }) => {
    console.log('\n=== TEST: Happy Path - Valid Email ===');

    let networkResponse: any = null;

    // Intercept the password reset request
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      const response = await route.fetch();
      networkResponse = response;
      await route.fulfill({ response });
    });

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Fill in valid email
    const testEmail = 'valid.user@example.com';
    await page.locator('input[type="email"]').fill(testEmail);

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for network request to complete
    await page.waitForTimeout(2000);

    // Validate network response
    expect(networkResponse).not.toBeNull();
    const data = await validateJsonResponse(networkResponse, { min: 200, max: 200 });

    // Validate response structure
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('message');
    expect(data.message).toContain('password reset link');

    // Validate UI shows success message
    await expect(page.locator('text=Check your email!')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=If an account exists with that email')).toBeVisible();

    console.log('✅ Happy path test passed - valid JSON with 200 status');
  });

  test('Email Not Found: Valid format but user does not exist returns secure JSON response', async ({ page }) => {
    console.log('\n=== TEST: Email Not Found ===');

    let networkResponse: any = null;

    // Intercept the password reset request
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      const response = await route.fetch();
      networkResponse = response;
      await route.fulfill({ response });
    });

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Fill in valid email format that doesn't exist
    const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;
    await page.locator('input[type="email"]').fill(nonExistentEmail);

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for network request to complete
    await page.waitForTimeout(2000);

    // Validate network response
    expect(networkResponse).not.toBeNull();
    const data = await validateJsonResponse(networkResponse, { min: 200, max: 200 });

    // For security, backend should return success even if user doesn't exist
    // (prevents email enumeration attacks)
    expect(data.success).toBe(true);
    expect(data.message).toContain('If an account exists');

    // Validate UI shows the same success message (security feature)
    await expect(page.locator('text=Check your email!')).toBeVisible({ timeout: 5000 });

    console.log('✅ Email not found test passed - secure response prevents enumeration');
  });

  test('Malformed Email: Email without @ symbol returns clean error', async ({ page }) => {
    console.log('\n=== TEST: Malformed Email (No @ Symbol) ===');

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Try to fill in malformed email (no @ symbol)
    const malformedEmail = 'stephensemail.com';
    await page.locator('input[type="email"]').fill(malformedEmail);

    // Try to submit form
    await page.locator('button[type="submit"]').click();

    // HTML5 email validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    console.log(`[Test] HTML5 validation message: ${validationMessage}`);

    // Check that input is marked as invalid
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();

    // Verify no network request was made (HTML5 validation blocked it)
    let networkRequestMade = false;
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      networkRequestMade = true;
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    // Wait a bit to ensure no request was made
    await page.waitForTimeout(1000);
    expect(networkRequestMade).toBe(false);

    console.log('✅ Malformed email test passed - HTML5 validation prevented submission');
  });

  test('Empty Email Field: Submitting with no email returns validation error', async ({ page }) => {
    console.log('\n=== TEST: Empty Email Field ===');

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Do NOT fill in email field - leave it empty

    // Try to submit form
    await page.locator('button[type="submit"]').click();

    // HTML5 required validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    console.log(`[Test] HTML5 validation message: ${validationMessage}`);

    // Check that input is marked as invalid
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();

    // Verify no network request was made
    let networkRequestMade = false;
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      networkRequestMade = true;
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    await page.waitForTimeout(1000);
    expect(networkRequestMade).toBe(false);

    console.log('✅ Empty email test passed - HTML5 validation prevented submission');
  });

  test('Backend Error: Invalid email format that bypasses HTML5 returns 400 with JSON error', async ({ page }) => {
    console.log('\n=== TEST: Backend Validation - Invalid Email ===');

    let networkResponse: any = null;

    // Mock the backend to return an error for invalid email
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      const requestBody = route.request().postDataJSON();

      // Simulate backend rejecting malformed email
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Valid email is required'
        })
      });

      networkResponse = {
        status: () => 400,
        headers: () => ({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ success: false, error: 'Valid email is required' })
      };
    });

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Use JavaScript to set invalid email value (bypass HTML5 validation)
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.value = 'not-an-email';
        // Remove HTML5 validation
        emailInput.removeAttribute('required');
        emailInput.type = 'text';
      }
    });

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for network request
    await page.waitForTimeout(2000);

    // Validate error is shown in UI
    await expect(page.locator('[class*="red"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Valid email is required')).toBeVisible();

    console.log('✅ Backend validation test passed - clean JSON error response');
  });

  test('Network Error: Failed request returns user-friendly error', async ({ page }) => {
    console.log('\n=== TEST: Network Error Handling ===');

    // Intercept and abort the request (simulate network failure)
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      await route.abort('failed');
    });

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Fill in valid email
    await page.locator('input[type="email"]').fill('test@example.com');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for error to appear
    await page.waitForTimeout(2000);

    // Validate error message is shown
    await expect(page.locator('[class*="red"]')).toBeVisible({ timeout: 5000 });

    // Error should mention network issue
    const errorText = await page.locator('[class*="red"]').textContent();
    console.log(`[Test] Error message: ${errorText}`);
    expect(errorText).toBeTruthy();

    console.log('✅ Network error test passed - graceful failure handling');
  });

  test('Empty Response Body: Server returns empty body shows error', async ({ page }) => {
    console.log('\n=== TEST: Empty Response Body ===');

    // Mock server returning empty response
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ''  // Empty body
      });
    });

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Fill in email
    await page.locator('input[type="email"]').fill('test@example.com');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Should show error about empty response
    await expect(page.locator('text=Server returned an empty response')).toBeVisible({ timeout: 5000 });

    console.log('✅ Empty response test passed - detected and reported');
  });

  test('Non-JSON Response: Server returns HTML instead of JSON shows error', async ({ page }) => {
    console.log('\n=== TEST: Non-JSON Response ===');

    // Mock server returning HTML instead of JSON
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Error</body></html>'
      });
    });

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Fill in email
    await page.locator('input[type="email"]').fill('test@example.com');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Should show error about invalid response
    await expect(page.locator('text=Server returned an invalid response')).toBeVisible({ timeout: 5000 });

    console.log('✅ Non-JSON response test passed - detected and reported');
  });

  test('Malformed JSON: Server returns invalid JSON shows error', async ({ page }) => {
    console.log('\n=== TEST: Malformed JSON Response ===');

    // Mock server returning malformed JSON
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{invalid json here'  // Malformed JSON
      });
    });

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Fill in email
    await page.locator('input[type="email"]').fill('test@example.com');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Should show error about parsing failure
    await expect(page.locator('text=Failed to parse server response')).toBeVisible({ timeout: 5000 });

    console.log('✅ Malformed JSON test passed - detected and reported');
  });

  test('500 Server Error: Backend error returns proper JSON error', async ({ page }) => {
    console.log('\n=== TEST: 500 Server Error ===');

    let networkResponse: any = null;

    // Mock server error
    await page.route('**/auth/request-password-reset', async (route: Route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });

      networkResponse = {
        status: () => 500,
        headers: () => ({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ success: false, error: 'Internal server error' })
      };
    });

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Fill in email
    await page.locator('input[type="email"]').fill('test@example.com');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for error
    await page.waitForTimeout(2000);

    // Should show error message
    await expect(page.locator('[class*="red"]')).toBeVisible({ timeout: 5000 });
    const errorText = await page.locator('[class*="red"]').textContent();
    expect(errorText).toContain('error');

    console.log('✅ 500 error test passed - proper error handling');
  });
});

test.describe('Password Reset Token Flow - JSON Validation', () => {

  test('Valid token reset returns JSON success', async ({ page }) => {
    console.log('\n=== TEST: Valid Token Password Reset ===');

    const validToken = 'a'.repeat(64);
    let resetResponse: any = null;

    // Mock token verification
    await page.route('**/api/query', async (route: Route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'auth:verifyResetToken') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: {
              valid: true,
              email: 'test@example.com',
              expiresAt: Date.now() + 15 * 60 * 1000,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock password reset endpoint
    await page.route('**/auth/reset-password', async (route: Route) => {
      resetResponse = {
        status: () => 200,
        headers: () => ({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({
          success: true,
          message: 'Password reset successful. Please log in with your new password.'
        })
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password reset successful. Please log in with your new password.'
        })
      });
    });

    // Navigate with token
    await page.goto(`${BASE_URL}/reset-password?token=${validToken}`);

    // Fill in passwords
    await page.locator('input[placeholder="••••••••"]').first().fill('NewSecurePassword123!@#');
    await page.locator('input[placeholder="••••••••"]').last().fill('NewSecurePassword123!@#');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Validate network response
    expect(resetResponse).not.toBeNull();
    const data = await validateJsonResponse(resetResponse, { min: 200, max: 200 });
    expect(data.success).toBe(true);

    // Validate UI
    await expect(page.locator('text=Password reset successful!')).toBeVisible({ timeout: 5000 });

    console.log('✅ Valid token reset test passed');
  });
});

test.describe('Response Headers Validation', () => {

  test('CORS headers are present in password reset response', async ({ page }) => {
    console.log('\n=== TEST: CORS Headers Validation ===');

    let responseHeaders: any = null;

    await page.route('**/auth/request-password-reset', async (route: Route) => {
      const response = await route.fetch();
      responseHeaders = response.headers();
      await route.fulfill({ response });
    });

    await page.goto(`${BASE_URL}/reset-password`);
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(2000);

    // Validate CORS headers
    expect(responseHeaders).not.toBeNull();
    expect(responseHeaders['access-control-allow-origin']).toBeDefined();
    console.log(`[Test] CORS Origin: ${responseHeaders['access-control-allow-origin']}`);

    console.log('✅ CORS headers test passed');
  });
});
