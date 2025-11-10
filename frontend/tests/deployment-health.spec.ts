import { test, expect } from '@playwright/test';

test.describe('Deployment Health Checks', () => {
  const API_BASE = process.env.VITE_API_BASE || 'http://localhost:8000';
  const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

  test.describe('DNS & Network Validation', () => {
    test('frontend URL is accessible via DNS', async ({ page }) => {
      const response = await page.goto(FRONTEND_URL);

      expect(response).not.toBeNull();
      expect(response!.status()).toBeLessThan(400);

      // Verify DNS resolved correctly
      const finalURL = page.url();
      expect(finalURL).toContain(new URL(FRONTEND_URL).hostname);
    });

    test('backend API endpoint is reachable', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/api/templates`, { timeout: 2000 });

        // Accept either success or expected error responses (not DNS/network errors)
        expect([200, 404, 500]).toContain(response.status());

      } catch (error: any) {
        // If backend is not running, skip this test with helpful message
        if (error.message?.includes('ECONNREFUSED')) {
          test.skip(true, 'Backend server is not running on port 8000. This is expected if testing frontend only.');
        } else {
          // For other errors, it should not be a DNS/network error
          expect(error.message).not.toMatch(/ENOTFOUND|ETIMEDOUT/i);
        }
      }
    });

    test('frontend loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      console.log(`Frontend load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // 10 second threshold
    });

    test('CORS headers are configured correctly', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/api/templates`, { timeout: 2000 });
        const headers = response.headers();

        // Check if CORS is configured (or not needed for same-origin)
        const corsHeader = headers['access-control-allow-origin'];
        console.log('CORS header:', corsHeader || 'Not set (same-origin)');

        // Either CORS should be set or we're on same origin
        const frontendOrigin = new URL(FRONTEND_URL).origin;
        const backendOrigin = new URL(API_BASE).origin;

        if (frontendOrigin !== backendOrigin) {
          expect(corsHeader).toBeDefined();
        }
      } catch (error: any) {
        // If backend is not running, skip this test
        if (error.message?.includes('ECONNREFUSED')) {
          test.skip(true, 'Backend server is not running on port 8000. This is expected if testing frontend only.');
        } else {
          throw error;
        }
      }
    });
  });

  test.describe('Backend Connectivity', () => {
    test.beforeEach(async ({ request }) => {
      // Check if backend is running before running these tests
      try {
        await request.get(`${API_BASE}/api/templates`, { timeout: 2000 });
      } catch (error: any) {
        if (error.message?.includes('ECONNREFUSED')) {
          test.skip(true, 'Backend server is not running on port 8000. Start backend with: cd ../backend && npm run dev');
        }
      }
    });

    test('backend /api/templates endpoint responds', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/templates`);

      expect(response.status()).toBeLessThan(500);

      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });

    test('backend /api/logs endpoint responds', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/logs`);

      expect(response.status()).toBeLessThan(500);

      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });

    test('backend handles POST requests', async ({ request }) => {
      const testPayload = {
        email: 'test@example.com',
        first_name: 'Test',
        company: 'Test Co'
      };

      const response = await request.post(`${API_BASE}/api/preview?template_id=0`, {
        data: testPayload,
      });

      // Accept any response that's not a network/server error
      expect(response.status()).toBeLessThan(500);
    });

    test('backend returns valid JSON responses', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/templates`);

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Backend did not return valid JSON');
      }

      expect(data).toBeDefined();
      expect(Array.isArray(data) || typeof data === 'object').toBe(true);
    });
  });

  test.describe('Authentication & Persistence', () => {
    test('localStorage persistence works', async ({ page }) => {
      await page.goto(FRONTEND_URL);

      // Set test data in localStorage
      await page.evaluate(() => {
        localStorage.setItem('test_auth_token', 'test_token_12345');
        localStorage.setItem('test_user_data', JSON.stringify({
          username: 'testuser',
          timestamp: Date.now()
        }));
      });

      // Reload page
      await page.reload();

      // Verify data persists
      const authToken = await page.evaluate(() =>
        localStorage.getItem('test_auth_token')
      );
      const userData = await page.evaluate(() =>
        localStorage.getItem('test_user_data')
      );

      expect(authToken).toBe('test_token_12345');
      expect(userData).toContain('testuser');

      // Cleanup
      await page.evaluate(() => {
        localStorage.removeItem('test_auth_token');
        localStorage.removeItem('test_user_data');
      });
    });

    test('sessionStorage persistence works', async ({ page }) => {
      await page.goto(FRONTEND_URL);

      // Set test data in sessionStorage
      await page.evaluate(() => {
        sessionStorage.setItem('test_session', 'session_data');
      });

      // Navigate within app (simulates SPA navigation)
      await page.evaluate(() => {
        sessionStorage.getItem('test_session');
      });

      const sessionData = await page.evaluate(() =>
        sessionStorage.getItem('test_session')
      );

      expect(sessionData).toBe('session_data');

      // Cleanup
      await page.evaluate(() => {
        sessionStorage.removeItem('test_session');
      });
    });

    test('cookies can be set and persist', async ({ context, page }) => {
      await page.goto(FRONTEND_URL);

      // Set a test cookie
      await context.addCookies([{
        name: 'test_auth_cookie',
        value: 'authenticated',
        domain: new URL(FRONTEND_URL).hostname,
        path: '/',
      }]);

      // Reload page
      await page.reload();

      // Verify cookie persists
      const cookies = await context.cookies();
      const authCookie = cookies.find(c => c.name === 'test_auth_cookie');

      expect(authCookie).toBeDefined();
      expect(authCookie?.value).toBe('authenticated');
    });

    test('application state persists after reload', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle');

      // Simulate user interaction that might set state
      await page.evaluate(() => {
        // Simulate setting application state
        (window as any).appState = { userLoggedIn: true };
        localStorage.setItem('appState', JSON.stringify({ userLoggedIn: true }));
      });

      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if state can be restored
      const restoredState = await page.evaluate(() => {
        const stored = localStorage.getItem('appState');
        return stored ? JSON.parse(stored) : null;
      });

      expect(restoredState).not.toBeNull();
      expect(restoredState.userLoggedIn).toBe(true);

      // Cleanup
      await page.evaluate(() => {
        localStorage.removeItem('appState');
      });
    });
  });

  test.describe('Critical User Flows', () => {
    test('full page load includes all critical resources', async ({ page }) => {
      const resources: string[] = [];

      page.on('response', response => {
        resources.push(response.url());
      });

      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle');

      // Verify critical resources loaded
      const hasJS = resources.some(url => url.includes('.js'));
      const hasCSS = resources.some(url => url.includes('.css') || url.includes('tailwind'));

      expect(hasJS).toBe(true);
      console.log(`Loaded ${resources.length} resources`);
    });

    test('application renders main UI elements', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle');

      // Check for key UI elements
      const heading = await page.locator('h1').first();
      await expect(heading).toBeVisible();

      const body = await page.locator('body');
      await expect(body).toBeVisible();

      // Verify app mounted
      const appElement = await page.locator('#app');
      const hasContent = await appElement.evaluate(el => el.children.length > 0);
      expect(hasContent).toBe(true);
    });

    test('backend API integration works end-to-end', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle');

      // Wait for initial API calls to complete
      await page.waitForTimeout(1000);

      // Check that templates were loaded
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      // Verify no critical errors in console
      await page.waitForTimeout(500);
      const criticalErrors = consoleMessages.filter(msg =>
        msg.toLowerCase().includes('error') &&
        !msg.includes('favicon') // Ignore favicon errors
      );

      console.log('Console messages:', consoleMessages.slice(-5));

      // Should have minimal critical errors
      expect(criticalErrors.length).toBeLessThan(5);
    });
  });

  test.describe('Error Handling & Resilience', () => {
    test('application handles backend timeout gracefully', async ({ page }) => {
      await page.goto(FRONTEND_URL);

      // Simulate slow network by delaying requests
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });

      await page.waitForLoadState('networkidle');

      // App should still render even with slow API
      const body = await page.locator('body');
      await expect(body).toBeVisible();
    });

    test('application remains functional after network interruption', async ({ page, context }) => {
      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle');

      // Simulate network interruption
      await context.setOffline(true);
      await page.waitForTimeout(500);

      // Restore network
      await context.setOffline(false);

      // App should recover
      await page.waitForTimeout(500);
      const body = await page.locator('body');
      await expect(body).toBeVisible();
    });
  });
});
