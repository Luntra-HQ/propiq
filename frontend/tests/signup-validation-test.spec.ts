/**
 * Sign-Up Validation Hypothesis Test
 *
 * Tests whether password validation mismatch is causing sign-up crashes
 *
 * Hypothesis: Frontend accepts passwords ≥8 chars, but backend requires ≥12 chars + complexity
 * This causes "random" crashes when users pick passwords that pass frontend but fail backend
 */

import { test, expect } from '@playwright/test';

const CONVEX_SITE_URL = process.env.VITE_CONVEX_URL?.replace('.convex.cloud', '.convex.site') || 'https://diligent-starling-125.convex.site';

test.describe('Sign-Up Password Validation Hypothesis', () => {

  test('WEAK PASSWORD: Should fail (8 chars, no complexity)', async ({ page }) => {
    const email = `weak-${Date.now()}@test.com`;
    const weakPassword = 'password'; // 8 chars, lowercase only

    await page.goto('http://localhost:5173');

    // Open signup (assuming there's a signup button)
    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').first();
    if (await signupButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signupButton.click();
    }

    // Fill form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', weakPassword);

    // Click submit
    await page.click('button[type="submit"]');

    // HYPOTHESIS: This should show an error from backend
    // Wait for either success or error
    const errorMessage = await page.locator('text=/password/i, text=/error/i, [class*="error"]').first().textContent({ timeout: 10000 }).catch(() => null);

    console.log('WEAK PASSWORD TEST:');
    console.log('  Email:', email);
    console.log('  Password:', weakPassword);
    console.log('  Error shown:', errorMessage);

    // If hypothesis is correct, there should be an error
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.toLowerCase()).toContain('password');
  });

  test('STRONG PASSWORD: Should succeed (12+ chars with complexity)', async ({ page }) => {
    const email = `strong-${Date.now()}@test.com`;
    const strongPassword = 'StrongPass123!@#'; // 16 chars, has everything

    await page.goto('http://localhost:5173');

    // Open signup
    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').first();
    if (await signupButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signupButton.click();
    }

    // Fill form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', strongPassword);

    // Click submit
    await page.click('button[type="submit"]');

    // HYPOTHESIS: This should succeed
    // Wait for success indicators
    const success = await Promise.race([
      page.waitForURL(/dashboard|success/, { timeout: 10000 }).then(() => 'redirect'),
      page.locator('text=/welcome/i, text=/success/i').waitFor({ timeout: 10000 }).then(() => 'message'),
    ]).catch(() => null);

    console.log('STRONG PASSWORD TEST:');
    console.log('  Email:', email);
    console.log('  Password:', strongPassword);
    console.log('  Success:', success);

    // If hypothesis is correct, signup should succeed
    expect(success).toBeTruthy();
  });

  test('MEDIUM PASSWORD: Borderline case (11 chars, partial complexity)', async ({ page }) => {
    const email = `medium-${Date.now()}@test.com`;
    const mediumPassword = 'Password123'; // 11 chars, uppercase + lowercase + number, NO special

    await page.goto('http://localhost:5173');

    // Open signup
    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').first();
    if (await signupButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signupButton.click();
    }

    // Fill form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', mediumPassword);

    // Click submit
    await page.click('button[type="submit"]');

    // This should fail (missing special char and <12 chars)
    const errorMessage = await page.locator('text=/password/i, text=/error/i, text=/special/i, [class*="error"]').first().textContent({ timeout: 10000 }).catch(() => null);

    console.log('MEDIUM PASSWORD TEST:');
    console.log('  Email:', email);
    console.log('  Password:', mediumPassword);
    console.log('  Error shown:', errorMessage);

    // Should fail because missing special character and only 11 chars
    expect(errorMessage).toBeTruthy();
  });

  test('DIRECT API TEST: Weak password via Convex endpoint', async () => {
    const email = `api-weak-${Date.now()}@test.com`;
    const weakPassword = 'weak1234'; // 8 chars, no uppercase, no special

    const response = await fetch(`${CONVEX_SITE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: weakPassword }),
    });

    const result = await response.json();

    console.log('API WEAK PASSWORD TEST:');
    console.log('  Response:', result);

    // Should fail with password requirement error
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.error.toLowerCase()).toContain('password');
  });

  test('DIRECT API TEST: Strong password via Convex endpoint', async () => {
    const email = `api-strong-${Date.now()}@test.com`;
    const strongPassword = 'StrongPassword123!@#'; // 20 chars, has everything

    const response = await fetch(`${CONVEX_SITE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: strongPassword }),
    });

    const result = await response.json();

    console.log('API STRONG PASSWORD TEST:');
    console.log('  Response:', result);

    // Should succeed
    expect(result.success).toBe(true);
    expect(result.user).toBeTruthy();
    expect(result.sessionToken).toBeTruthy();
  });
});
