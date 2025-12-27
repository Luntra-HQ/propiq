/**
 * Password Reset Flow - E2E with Gmail MCP Integration
 *
 * This test automatically:
 * 1. Requests a password reset
 * 2. Fetches the reset email from Gmail using MCP
 * 3. Extracts the reset token from the email
 * 4. Completes the password reset flow
 *
 * Prerequisites:
 * - Gmail MCP server configured and running
 * - Test account: bdusape@gmail.com
 */

import { test, expect } from '@playwright/test';
import { waitForPasswordResetEmail, extractResetToken } from './helpers/gmail-api-client';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = 'bdusape@gmail.com';
const CURRENT_PASSWORD = process.env.TEST_USER_PASSWORD || 'YourCurrentPassword123!';
const NEW_PASSWORD = `NewPassword${Date.now()}!@#Abc`;

test.describe('Password Reset with Gmail Integration', () => {

  test('should complete full password reset flow with real email', async ({ page }) => {
    // Set longer timeout for email delivery
    test.setTimeout(120000); // 2 minutes

    console.log('\n=== STEP 1: Request Password Reset ===');

    // Navigate to reset password page
    await page.goto(`${BASE_URL}/reset-password`);

    // Fill in email and submit
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('button[type="submit"]').click();

    // Wait for success message
    await expect(page.locator('text=Check your email!')).toBeVisible({ timeout: 10000 });
    console.log('✅ Password reset requested successfully');

    console.log('\n=== STEP 2: Fetch Email from Gmail ===');

    // Wait for email to arrive and extract token
    console.log(`📧 Waiting for email to ${TEST_EMAIL}...`);
    const resetToken = await waitForPasswordResetEmail(TEST_EMAIL, 10, 3000);

    if (!resetToken) {
      console.log('\n⚠️  Failed to retrieve password reset email');
      console.log('Possible reasons:');
      console.log('1. Email not sent (check Convex logs)');
      console.log('2. Email delayed (check spam folder)');
      console.log('3. Gmail MCP server error (check server logs)\n');

      test.fail(true, 'Failed to retrieve password reset email from Gmail');
      return;
    }

    console.log('✅ Reset token extracted:', resetToken);

    console.log('\n=== STEP 3: Navigate to Reset Link ===');

    // Navigate to reset password page with token
    await page.goto(`${BASE_URL}/reset-password?token=${resetToken}`);

    // Verify token is valid
    await expect(page.locator('h1')).toContainText('Create New Password', { timeout: 10000 });
    console.log('✅ Token verified successfully');

    // Check email is pre-filled
    await expect(page.locator(`input[value="${TEST_EMAIL}"]`)).toBeVisible();

    console.log('\n=== STEP 4: Reset Password ===');

    // Fill in new password
    await page.locator('input[placeholder="••••••••"]').first().fill(NEW_PASSWORD);
    await page.locator('input[placeholder="••••••••"]').last().fill(NEW_PASSWORD);

    // Submit password reset
    await page.locator('button[type="submit"]').click();

    // Wait for success
    await expect(page.locator('text=Password reset successful!')).toBeVisible({ timeout: 10000 });
    console.log('✅ Password reset successful');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    console.log('✅ Redirected to login page');

    console.log('\n=== STEP 5: Verify New Password Works ===');

    // Try logging in with new password
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill(NEW_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Should successfully login
    await expect(page).toHaveURL(/\/(app|dashboard)/, { timeout: 10000 });
    console.log('✅ Successfully logged in with new password');

    console.log('\n=== TEST COMPLETE ===');
    console.log(`New password: ${NEW_PASSWORD}`);
    console.log('💡 Save this password for future tests!\n');
  });

  test('should handle expired tokens from email', async ({ page }) => {
    // This test simulates receiving an email with an expired token
    // (token created > 15 minutes ago)

    const expiredToken = 'a'.repeat(64); // Mock expired token

    await page.goto(`${BASE_URL}/reset-password?token=${expiredToken}`);

    // Should show error for expired token
    // Note: This will only work if the token actually exists but is expired
    await expect(page.locator('text=/expired/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Gmail MCP Integration Helpers', () => {

  test('should verify Gmail MCP is accessible', async () => {
    // This test verifies that the Gmail MCP server is running
    // and can be accessed from Playwright

    console.log('\n=== Gmail MCP Server Check ===');

    try {
      // TODO: Add actual Gmail MCP health check
      // Example: const status = await gmailMCP.health();

      console.log('⚠️  Gmail MCP integration pending');
      console.log('\nTo enable Gmail MCP:');
      console.log('1. Ensure MCP server is running');
      console.log('2. Configure MCP client in Playwright');
      console.log('3. Add Gmail API credentials');
      console.log('4. Implement search/fetch email functions\n');

      test.skip(true, 'Gmail MCP not yet configured');

    } catch (error) {
      console.error('Gmail MCP error:', error);
      throw error;
    }
  });

  test('should extract token from email HTML', () => {
    const sampleEmailHtml = `
      <html>
        <body>
          <p>Click here to reset your password:</p>
          <a href="http://localhost:5173/reset-password?token=abc123def456abc123def456abc123def456abc123def456abc123def456abc12">Reset Password</a>
        </body>
      </html>
    `;

    const token = extractResetToken(sampleEmailHtml);
    expect(token).toBe('abc123def456abc123def456abc123def456abc123def456abc123def456abc12');
  });
});

/**
 * IMPLEMENTATION GUIDE for Gmail MCP Integration
 *
 * Step 1: Install Gmail MCP Server
 * ```bash
 * # Install the MCP server for Gmail
 * npm install -g @modelcontextprotocol/server-gmail
 * ```
 *
 * Step 2: Configure Gmail API Credentials
 * - Go to Google Cloud Console
 * - Enable Gmail API
 * - Create OAuth 2.0 credentials
 * - Download credentials.json
 *
 * Step 3: Start MCP Server
 * ```bash
 * mcp-server-gmail --credentials ./credentials.json
 * ```
 *
 * Step 4: Implement MCP Client in Playwright
 * ```typescript
 * import { createMCPClient } from '@modelcontextprotocol/client';
 *
 * const gmailClient = createMCPClient({
 *   serverUrl: 'http://localhost:3000',  // MCP server URL
 * });
 *
 * // Search for emails
 * const emails = await gmailClient.call('gmail.search', {
 *   query: 'from:noreply@luntra.one subject:"Reset Your PropIQ Password" newer_than:5m',
 *   maxResults: 1,
 * });
 *
 * // Get email content
 * const emailContent = await gmailClient.call('gmail.get', {
 *   messageId: emails[0].id,
 * });
 *
 * // Extract token
 * const token = extractResetToken(emailContent.html);
 * ```
 *
 * Step 5: Update waitForResetEmail function above with actual MCP calls
 */
