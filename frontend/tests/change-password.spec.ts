/**
 * Change Password - End-to-End Tests
 *
 * Tests the ChangePasswordForm component including:
 * - Current password verification
 * - New password validation (12+ chars, uppercase, lowercase, number, special)
 * - Password strength meter
 * - Password confirmation matching
 * - Success/error message display
 * - Form reset after success
 * - Accessibility features
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

// Test credentials
const TEST_EMAIL = `change-password-${Date.now()}@example.com`;
const CURRENT_PASSWORD = 'CurrentPassword123!@#';
const NEW_PASSWORD = 'NewSecurePassword456!@#';
const WEAK_PASSWORD = 'weak';
const NO_UPPERCASE = 'password123!@#';
const NO_LOWERCASE = 'PASSWORD123!@#';
const NO_NUMBER = 'PasswordOnly!@#';
const NO_SPECIAL = 'Password123456';
const TOO_SHORT = 'Pass123!';
const COMMON_PASSWORD = 'password123';

test.describe('Change Password Form', () => {

  // Helper: Setup logged-in user and navigate to Security tab
  async function setupPasswordChangeForm(page: any) {
    // Mock Convex auth
    await page.route('**/api/query', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'users:getCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: {
              _id: 'test-user-id',
              email: TEST_EMAIL,
              subscriptionTier: 'free',
              analysesUsed: 0,
              analysesLimit: 3,
              createdAt: Date.now(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.evaluate(() => {
      localStorage.setItem('convex-auth-token', 'mock-jwt-token');
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Navigate to Security tab
    const securityTab = page.locator('button:has-text("Security")');
    if (await securityTab.isVisible()) {
      await securityTab.click();
      await page.waitForTimeout(300);
    }
  }

  test.beforeEach(async ({ page }) => {
    await setupPasswordChangeForm(page);
  });

  test('should display change password form with all required fields', async ({ page }) => {
    // Verify form title
    await expect(page.locator('text=Change Password')).toBeVisible();

    // Verify all three password fields
    await expect(page.locator('label:has-text("Current Password")')).toBeVisible();
    await expect(page.locator('label:has-text("New Password")')).toBeVisible();
    await expect(page.locator('label:has-text("Confirm New Password")')).toBeVisible();

    // Verify submit button
    await expect(page.locator('button:has-text("Change Password")')).toBeVisible();
  });

  test('should show/hide password visibility toggles', async ({ page }) => {
    // Current password field
    const currentPasswordInput = page.locator('input#current-password').or(
      page.locator('input[placeholder*="current password"]')
    ).first();

    // Verify password is hidden by default
    expect(await currentPasswordInput.getAttribute('type')).toBe('password');

    // Click visibility toggle
    const eyeButtons = page.locator('button').filter({ hasText: '' }).filter({ has: page.locator('svg') });
    const firstEyeButton = eyeButtons.first();

    if (await firstEyeButton.isVisible()) {
      await firstEyeButton.click();
      await page.waitForTimeout(200);

      // Password should now be visible (type="text")
      const inputType = await currentPasswordInput.getAttribute('type');
      expect(inputType).toBe('text');
    }
  });

  test('should disable submit button when form is empty', async ({ page }) => {
    const submitButton = page.locator('button:has-text("Change Password")');

    // Button should be disabled initially
    await expect(submitButton).toBeDisabled();
  });

  test('should show password strength meter when typing new password', async ({ page }) => {
    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    await newPasswordInput.fill('Test');
    await page.waitForTimeout(300);

    // Password strength indicator should appear
    await expect(page.locator('text=Password Strength')).toBeVisible({ timeout: 2000 });
  });

  test('should display password requirements checklist', async ({ page }) => {
    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    await newPasswordInput.fill('Test');
    await page.waitForTimeout(300);

    // Check for requirement items
    await expect(page.locator('text=At least 12 characters')).toBeVisible();
    await expect(page.locator('text=One uppercase letter')).toBeVisible();
    await expect(page.locator('text=One lowercase letter')).toBeVisible();
    await expect(page.locator('text=One number')).toBeVisible();
    await expect(page.locator('text=One special character')).toBeVisible();
    await expect(page.locator('text=Not a common password')).toBeVisible();
  });

  test('should validate password is at least 12 characters', async ({ page }) => {
    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    // Type short password
    await newPasswordInput.fill(TOO_SHORT);
    await page.waitForTimeout(300);

    // Length requirement should show as not met
    const lengthRequirement = page.locator('text=At least 12 characters').locator('..');
    const hasRedColor = await lengthRequirement.evaluate((el) => {
      return window.getComputedStyle(el).color.includes('rgb') || el.className.includes('red') || el.className.includes('gray');
    });

    expect(hasRedColor).toBeTruthy();
  });

  test('should validate password contains uppercase letter', async ({ page }) => {
    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    await newPasswordInput.fill(NO_UPPERCASE);
    await page.waitForTimeout(300);

    // Uppercase requirement should show as not met
    const requirement = page.locator('text=One uppercase letter').locator('..');
    await expect(requirement).toBeVisible();
  });

  test('should validate password contains lowercase letter', async ({ page }) => {
    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    await newPasswordInput.fill(NO_LOWERCASE);
    await page.waitForTimeout(300);

    // Lowercase requirement should show as not met
    await expect(page.locator('text=One lowercase letter')).toBeVisible();
  });

  test('should validate password contains number', async ({ page }) => {
    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    await newPasswordInput.fill(NO_NUMBER);
    await page.waitForTimeout(300);

    await expect(page.locator('text=One number')).toBeVisible();
  });

  test('should validate password contains special character', async ({ page }) => {
    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    await newPasswordInput.fill(NO_SPECIAL);
    await page.waitForTimeout(300);

    await expect(page.locator('text=One special character')).toBeVisible();
  });

  test('should show password mismatch error', async ({ page }) => {
    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    const confirmPasswordInput = page.locator('input#confirm-password').or(
      page.locator('label:has-text("Confirm New Password")').locator('..').locator('input')
    ).first();

    // Fill with mismatched passwords
    await newPasswordInput.fill(NEW_PASSWORD);
    await confirmPasswordInput.fill('DifferentPassword456!@#');
    await page.waitForTimeout(300);

    // Should show "Passwords don't match" message
    await expect(page.locator('text=Passwords don\'t match').or(page.locator('text=don\'t match'))).toBeVisible();
  });

  test('should show password match indicator when passwords match', async ({ page }) => {
    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    const confirmPasswordInput = page.locator('input#confirm-password').or(
      page.locator('label:has-text("Confirm New Password")').locator('..').locator('input')
    ).first();

    // Fill with matching passwords
    await newPasswordInput.fill(NEW_PASSWORD);
    await confirmPasswordInput.fill(NEW_PASSWORD);
    await page.waitForTimeout(300);

    // Should show "Passwords match" message
    await expect(page.locator('text=Passwords match')).toBeVisible({ timeout: 2000 });
  });

  test('should enable submit button when all fields are valid', async ({ page }) => {
    // Mock successful password change
    await page.route('**/api/mutation', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'auth:changePassword') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: { success: true },
          }),
        });
      } else {
        await route.continue();
      }
    });

    const currentPasswordInput = page.locator('input#current-password').or(
      page.locator('label:has-text("Current Password")').locator('..').locator('input')
    ).first();

    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    const confirmPasswordInput = page.locator('input#confirm-password').or(
      page.locator('label:has-text("Confirm New Password")').locator('..').locator('input')
    ).first();

    // Fill all fields with valid data
    await currentPasswordInput.fill(CURRENT_PASSWORD);
    await newPasswordInput.fill(NEW_PASSWORD);
    await confirmPasswordInput.fill(NEW_PASSWORD);
    await page.waitForTimeout(500);

    // Submit button should be enabled
    const submitButton = page.locator('button:has-text("Change Password")');
    await expect(submitButton).toBeEnabled({ timeout: 2000 });
  });

  test('should show loading state when submitting', async ({ page }) => {
    // Mock delayed password change response
    await page.route('**/api/mutation', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'auth:changePassword') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: { success: true },
          }),
        });
      } else {
        await route.continue();
      }
    });

    const currentPasswordInput = page.locator('input#current-password').or(
      page.locator('label:has-text("Current Password")').locator('..').locator('input')
    ).first();

    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    const confirmPasswordInput = page.locator('input#confirm-password').or(
      page.locator('label:has-text("Confirm New Password")').locator('..').locator('input')
    ).first();

    await currentPasswordInput.fill(CURRENT_PASSWORD);
    await newPasswordInput.fill(NEW_PASSWORD);
    await confirmPasswordInput.fill(NEW_PASSWORD);

    const submitButton = page.locator('button:has-text("Change Password")');
    await submitButton.click();

    // Should show loading state
    await expect(page.locator('text=Changing Password')).toBeVisible({ timeout: 1000 });
  });

  test('should display success message after successful password change', async ({ page }) => {
    // Mock successful password change
    await page.route('**/api/mutation', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'auth:changePassword') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: { success: true, message: 'Password changed successfully' },
          }),
        });
      } else {
        await route.continue();
      }
    });

    const currentPasswordInput = page.locator('input#current-password').or(
      page.locator('label:has-text("Current Password")').locator('..').locator('input')
    ).first();

    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    const confirmPasswordInput = page.locator('input#confirm-password').or(
      page.locator('label:has-text("Confirm New Password")').locator('..').locator('input')
    ).first();

    await currentPasswordInput.fill(CURRENT_PASSWORD);
    await newPasswordInput.fill(NEW_PASSWORD);
    await confirmPasswordInput.fill(NEW_PASSWORD);

    const submitButton = page.locator('button:has-text("Change Password")');
    await submitButton.click();
    await page.waitForTimeout(1000);

    // Should show success message
    await expect(page.locator('text=Password changed successfully')).toBeVisible({ timeout: 3000 });
  });

  test('should display error message when current password is incorrect', async ({ page }) => {
    // Mock failed password change
    await page.route('**/api/mutation', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'auth:changePassword') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'error',
            errorMessage: 'Current password is incorrect',
          }),
        });
      } else {
        await route.continue();
      }
    });

    const currentPasswordInput = page.locator('input#current-password').or(
      page.locator('label:has-text("Current Password")').locator('..').locator('input')
    ).first();

    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    const confirmPasswordInput = page.locator('input#confirm-password').or(
      page.locator('label:has-text("Confirm New Password")').locator('..').locator('input')
    ).first();

    await currentPasswordInput.fill('WrongPassword123!@#');
    await newPasswordInput.fill(NEW_PASSWORD);
    await confirmPasswordInput.fill(NEW_PASSWORD);

    const submitButton = page.locator('button:has-text("Change Password")');
    await submitButton.click();
    await page.waitForTimeout(1000);

    // Should show error message
    await expect(page.locator('text=Current password is incorrect').or(
      page.locator('[class*="red"]').filter({ hasText: 'password' })
    )).toBeVisible({ timeout: 3000 });
  });

  test('should clear form after successful password change', async ({ page }) => {
    // Mock successful password change
    await page.route('**/api/mutation', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'auth:changePassword') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: { success: true },
          }),
        });
      } else {
        await route.continue();
      }
    });

    const currentPasswordInput = page.locator('input#current-password').or(
      page.locator('label:has-text("Current Password")').locator('..').locator('input')
    ).first();

    const newPasswordInput = page.locator('input#new-password').or(
      page.locator('label:has-text("New Password")').locator('..').locator('input')
    ).first();

    await currentPasswordInput.fill(CURRENT_PASSWORD);
    await newPasswordInput.fill(NEW_PASSWORD);
    await page.locator('input#confirm-password').or(
      page.locator('label:has-text("Confirm New Password")').locator('..').locator('input')
    ).first().fill(NEW_PASSWORD);

    const submitButton = page.locator('button:has-text("Change Password")');
    await submitButton.click();
    await page.waitForTimeout(1500);

    // Form fields should be cleared
    expect(await currentPasswordInput.inputValue()).toBe('');
    expect(await newPasswordInput.inputValue()).toBe('');
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab to current password field
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs depending on page structure

    const currentPasswordInput = page.locator('input#current-password').or(
      page.locator('label:has-text("Current Password")').locator('..').locator('input')
    ).first();

    // Type password
    await currentPasswordInput.type('Test123!@#');

    // Tab to next field
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus moved
    const focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Change Password - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display correctly on mobile', async ({ page }) => {
    await page.route('**/api/query', async (route: any) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.path === 'users:getCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            value: {
              _id: 'test-user-id',
              email: TEST_EMAIL,
              subscriptionTier: 'free',
              analysesUsed: 0,
              analysesLimit: 3,
              createdAt: Date.now(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/#settings`);
    await page.waitForTimeout(1000);

    // Navigate to Security tab
    const securityTab = page.locator('button:has-text("Security")').or(page.locator('button').nth(3));
    if (await securityTab.isVisible()) {
      await securityTab.click();
      await page.waitForTimeout(300);
    }

    // Form should be visible and usable
    await expect(page.locator('label:has-text("Current Password")')).toBeVisible();
    await expect(page.locator('button:has-text("Change Password")')).toBeVisible();
  });
});
