/**
 * CORS Diagnostic Test
 *
 * Simple test to diagnose CORS configuration issues
 */

import { test } from '@playwright/test';

const CONVEX_URL = 'https://mild-tern-361.convex.site';

test('CORS diagnostic', async ({ page }) => {
  await page.goto('/');

  // Capture all console messages
  const logs: string[] = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  // Capture network errors
  const networkErrors: any[] = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()?.errorText,
    });
  });

  // Try to make a simple fetch request
  const result = await page.evaluate(async (url) => {
    try {
      const response = await fetch(`${url}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }, CONVEX_URL);

  console.log('\n========== CORS DIAGNOSTIC RESULTS ==========\n');
  console.log('Fetch Result:', JSON.stringify(result, null, 2));
  console.log('\nConsole Logs:', logs.join('\n'));
  console.log('\nNetwork Errors:', JSON.stringify(networkErrors, null, 2));
  console.log('\n============================================\n');
});
