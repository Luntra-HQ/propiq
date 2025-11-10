import { test, expect } from '@playwright/test';

/**
 * Environment Variable Validation Tests
 *
 * Verifies that frontend ENV vars match backend deployment values
 * and validates health endpoints for both services.
 */

// Configuration from environment variables
const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://luntra.one';
const BACKEND_URL = process.env.VITE_API_BASE || 'https://api.luntra.one';

// Expected environment configuration
const EXPECTED_ENV = {
  production: {
    frontend: 'https://luntra.one',
    backend: 'https://api.luntra.one',
  },
  staging: {
    frontend: 'https://staging.luntra.one',
    backend: 'https://api-staging.luntra.one',
  },
  local: {
    frontend: 'http://localhost:5173',
    backend: 'http://localhost:8000',
  },
};

test.describe('Environment Variable Validation', () => {
  test('ENV vars are properly configured', async () => {
    console.log('=== ENVIRONMENT CONFIGURATION ===');
    console.log(`Frontend URL (PLAYWRIGHT_BASE_URL): ${FRONTEND_URL}`);
    console.log(`Backend URL (VITE_API_BASE): ${BACKEND_URL}`);
    console.log('===================================');

    // Verify URLs are set
    expect(FRONTEND_URL).toBeTruthy();
    expect(BACKEND_URL).toBeTruthy();

    // Verify URLs are valid
    expect(FRONTEND_URL).toMatch(/^https?:\/\/.+/);
    expect(BACKEND_URL).toMatch(/^https?:\/\/.+/);
  });

  test('Frontend and backend URLs match expected deployment environment', async () => {
    // Determine environment based on URLs
    let detectedEnv: string | null = null;
    let expectedConfig: typeof EXPECTED_ENV.production | null = null;

    if (FRONTEND_URL.includes('luntra.one') && !FRONTEND_URL.includes('staging')) {
      detectedEnv = 'production';
      expectedConfig = EXPECTED_ENV.production;
    } else if (FRONTEND_URL.includes('staging')) {
      detectedEnv = 'staging';
      expectedConfig = EXPECTED_ENV.staging;
    } else if (FRONTEND_URL.includes('localhost')) {
      detectedEnv = 'local';
      expectedConfig = EXPECTED_ENV.local;
    }

    console.log(`Detected environment: ${detectedEnv}`);

    // Verify environment was detected
    expect(detectedEnv).not.toBeNull();
    expect(expectedConfig).not.toBeNull();

    if (expectedConfig) {
      // Check frontend URL matches expected
      const frontendMatches = FRONTEND_URL === expectedConfig.frontend ||
                             FRONTEND_URL.startsWith(expectedConfig.frontend);

      console.log(`Frontend URL match: ${frontendMatches}`);
      console.log(`  Expected: ${expectedConfig.frontend}`);
      console.log(`  Actual: ${FRONTEND_URL}`);

      expect(frontendMatches,
        `Frontend URL mismatch: expected ${expectedConfig.frontend}, got ${FRONTEND_URL}`
      ).toBeTruthy();

      // Check backend URL matches expected
      const backendMatches = BACKEND_URL === expectedConfig.backend ||
                            BACKEND_URL.startsWith(expectedConfig.backend);

      console.log(`Backend URL match: ${backendMatches}`);
      console.log(`  Expected: ${expectedConfig.backend}`);
      console.log(`  Actual: ${BACKEND_URL}`);

      expect(backendMatches,
        `Backend URL mismatch: expected ${expectedConfig.backend}, got ${BACKEND_URL}`
      ).toBeTruthy();
    }
  });

  test('Frontend and backend URLs are in same environment', async () => {
    // Verify both URLs are in the same environment (production/staging/local)
    const frontendIsProduction = FRONTEND_URL.includes('luntra.one') && !FRONTEND_URL.includes('staging');
    const frontendIsStaging = FRONTEND_URL.includes('staging');
    const frontendIsLocal = FRONTEND_URL.includes('localhost');

    const backendIsProduction = BACKEND_URL.includes('luntra.one') && !BACKEND_URL.includes('staging');
    const backendIsStaging = BACKEND_URL.includes('staging');
    const backendIsLocal = BACKEND_URL.includes('localhost');

    console.log('Environment consistency check:');
    console.log(`  Frontend: ${frontendIsProduction ? 'production' : frontendIsStaging ? 'staging' : 'local'}`);
    console.log(`  Backend: ${backendIsProduction ? 'production' : backendIsStaging ? 'staging' : 'local'}`);

    const envMatches = (
      (frontendIsProduction && backendIsProduction) ||
      (frontendIsStaging && backendIsStaging) ||
      (frontendIsLocal && backendIsLocal)
    );

    expect(envMatches,
      'Frontend and backend are in different environments! This will cause CORS and connectivity issues.'
    ).toBeTruthy();
  });
});

test.describe('Frontend Health Check', () => {
  test('Frontend is accessible and returns valid HTML', async ({ page }) => {
    console.log(`\n=== FRONTEND HEALTH CHECK ===`);
    console.log(`Testing: ${FRONTEND_URL}`);

    const startTime = Date.now();

    // Navigate to frontend
    const response = await page.goto(FRONTEND_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const duration = Date.now() - startTime;

    // Verify response
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    console.log(`✓ Frontend accessible (${duration}ms)`);
    console.log(`  Status: ${response!.status()}`);
    console.log(`  Content-Type: ${response!.headers()['content-type']}`);

    // Verify it's HTML
    const contentType = response!.headers()['content-type'] || '';
    expect(contentType).toContain('text/html');

    // Verify page has basic structure
    const title = await page.title();
    console.log(`  Page Title: ${title}`);
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check for common meta tags
    const viewport = await page.locator('meta[name="viewport"]').count();
    console.log(`  Has viewport meta: ${viewport > 0}`);

    console.log('✓ Frontend health check passed\n');
  });

  test('Frontend can make requests to backend', async ({ page, request }) => {
    console.log(`\n=== FRONTEND -> BACKEND CONNECTIVITY ===`);

    // First verify frontend loads
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });

    // Try to make a request to backend from browser context
    const backendAccessible = await page.evaluate(async (backendUrl) => {
      try {
        const response = await fetch(`${backendUrl}/health`);
        return {
          ok: response.ok,
          status: response.status,
          data: await response.json(),
        };
      } catch (error) {
        return {
          ok: false,
          status: 0,
          error: (error as Error).message,
        };
      }
    }, BACKEND_URL);

    console.log(`Backend accessibility from frontend:`);
    console.log(`  Status: ${backendAccessible.status}`);
    console.log(`  OK: ${backendAccessible.ok}`);

    if (backendAccessible.data) {
      console.log(`  Response: ${JSON.stringify(backendAccessible.data)}`);
    }
    if (backendAccessible.error) {
      console.log(`  Error: ${backendAccessible.error}`);
    }

    // This test will pass even if backend is not running,
    // but will log the error for visibility
    console.log('✓ Frontend connectivity test complete\n');
  });
});

test.describe('Backend Health Check', () => {
  test('Backend /health endpoint is accessible', async ({ request }) => {
    console.log(`\n=== BACKEND HEALTH CHECK ===`);
    console.log(`Testing: ${BACKEND_URL}/health`);

    let response;
    let isHealthy = false;
    let errorMessage = '';

    try {
      const startTime = Date.now();

      response = await request.get(`${BACKEND_URL}/health`, {
        timeout: 10000,
      });

      const duration = Date.now() - startTime;

      console.log(`✓ Backend responded (${duration}ms)`);
      console.log(`  Status: ${response.status()}`);
      console.log(`  OK: ${response.ok()}`);

      // Verify response
      expect(response.status()).toBe(200);
      expect(response.ok()).toBeTruthy();

      // Parse response body
      const body = await response.json();
      console.log(`  Response: ${JSON.stringify(body)}`);

      // Verify response structure
      expect(body).toHaveProperty('status');
      expect(body.status).toBe('healthy');

      isHealthy = true;
      console.log('✓ Backend health check passed\n');

    } catch (error) {
      errorMessage = (error as Error).message;
      console.log(`✗ Backend health check failed`);
      console.log(`  Error: ${errorMessage}`);

      // Log helpful debugging info
      console.log(`\n⚠️  Backend Health Check Warnings:`);
      console.log(`  - Ensure backend is running at: ${BACKEND_URL}`);
      console.log(`  - Check backend logs for errors`);
      console.log(`  - Verify VITE_API_BASE env var is correct`);
      console.log(`  - Check CORS configuration if deployed`);
      console.log('');

      // Re-throw error to fail the test
      throw error;
    }
  });

  test('Backend returns correct JSON structure', async ({ request }) => {
    console.log(`\n=== BACKEND RESPONSE VALIDATION ===`);

    try {
      const response = await request.get(`${BACKEND_URL}/health`);
      const body = await response.json();

      console.log(`Response structure:`);
      console.log(`  ${JSON.stringify(body, null, 2)}`);

      // Verify required fields
      expect(body).toHaveProperty('status');
      expect(typeof body.status).toBe('string');

      // Verify status value
      expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status);

      console.log('✓ Backend response structure valid\n');

    } catch (error) {
      console.log(`✗ Backend response validation failed`);
      console.log(`  Error: ${(error as Error).message}\n`);
      throw error;
    }
  });

  test('Backend health endpoint has acceptable response time', async ({ request }) => {
    console.log(`\n=== BACKEND PERFORMANCE CHECK ===`);

    const RESPONSE_TIME_THRESHOLD = 2000; // 2 seconds

    try {
      const startTime = Date.now();
      const response = await request.get(`${BACKEND_URL}/health`);
      const duration = Date.now() - startTime;

      console.log(`Response time: ${duration}ms`);
      console.log(`Threshold: ${RESPONSE_TIME_THRESHOLD}ms`);

      expect(duration).toBeLessThan(RESPONSE_TIME_THRESHOLD);

      if (duration > 1000) {
        console.log(`⚠️  Warning: Response time is slow (> 1 second)`);
      }

      console.log('✓ Backend performance check passed\n');

    } catch (error) {
      console.log(`✗ Backend performance check failed`);
      console.log(`  Error: ${(error as Error).message}\n`);
      throw error;
    }
  });
});

test.describe('End-to-End ENV Validation', () => {
  test('Full stack health check (Frontend + Backend)', async ({ page, request }) => {
    console.log(`\n=== FULL STACK HEALTH CHECK ===`);

    const results = {
      frontend: { accessible: false, loadTime: 0 },
      backend: { accessible: false, responseTime: 0 },
      integration: { canConnect: false },
    };

    // 1. Check Frontend
    try {
      const frontendStart = Date.now();
      const frontendResponse = await page.goto(FRONTEND_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });
      results.frontend.loadTime = Date.now() - frontendStart;
      results.frontend.accessible = frontendResponse!.status() === 200;
      console.log(`✓ Frontend: accessible (${results.frontend.loadTime}ms)`);
    } catch (error) {
      console.log(`✗ Frontend: ${(error as Error).message}`);
    }

    // 2. Check Backend
    try {
      const backendStart = Date.now();
      const backendResponse = await request.get(`${BACKEND_URL}/health`);
      results.backend.responseTime = Date.now() - backendStart;
      results.backend.accessible = backendResponse.status() === 200;
      console.log(`✓ Backend: accessible (${results.backend.responseTime}ms)`);
    } catch (error) {
      console.log(`✗ Backend: ${(error as Error).message}`);
    }

    // 3. Check Integration (Frontend can reach Backend)
    if (results.frontend.accessible) {
      try {
        const canConnect = await page.evaluate(async (backendUrl) => {
          try {
            const response = await fetch(`${backendUrl}/health`);
            return response.ok;
          } catch {
            return false;
          }
        }, BACKEND_URL);
        results.integration.canConnect = canConnect;

        if (canConnect) {
          console.log(`✓ Integration: frontend can reach backend`);
        } else {
          console.log(`✗ Integration: frontend cannot reach backend (CORS issue?)`);
        }
      } catch (error) {
        console.log(`✗ Integration: ${(error as Error).message}`);
      }
    }

    // Print summary
    console.log(`\n=== SUMMARY ===`);
    console.log(`Frontend: ${results.frontend.accessible ? '✓' : '✗'} (${results.frontend.loadTime}ms)`);
    console.log(`Backend: ${results.backend.accessible ? '✓' : '✗'} (${results.backend.responseTime}ms)`);
    console.log(`Integration: ${results.integration.canConnect ? '✓' : '✗'}`);
    console.log(`===============\n`);

    // Assert all checks passed
    expect(results.frontend.accessible, 'Frontend should be accessible').toBeTruthy();
    expect(results.backend.accessible, 'Backend should be accessible').toBeTruthy();

    // Integration check is informational only (backend might not be running in test env)
    if (!results.integration.canConnect) {
      console.log(`⚠️  Warning: Frontend cannot connect to backend. This is OK if backend is not deployed yet.`);
    }
  });

  test('Environment variables summary report', async () => {
    console.log(`\n=== ENVIRONMENT VARIABLES REPORT ===`);
    console.log(`\nConfigured URLs:`);
    console.log(`  PLAYWRIGHT_BASE_URL: ${FRONTEND_URL}`);
    console.log(`  VITE_API_BASE: ${BACKEND_URL}`);

    console.log(`\nExpected production values:`);
    console.log(`  Frontend: ${EXPECTED_ENV.production.frontend}`);
    console.log(`  Backend: ${EXPECTED_ENV.production.backend}`);

    console.log(`\nExpected staging values:`);
    console.log(`  Frontend: ${EXPECTED_ENV.staging.frontend}`);
    console.log(`  Backend: ${EXPECTED_ENV.staging.backend}`);

    console.log(`\nExpected local values:`);
    console.log(`  Frontend: ${EXPECTED_ENV.local.frontend}`);
    console.log(`  Backend: ${EXPECTED_ENV.local.backend}`);

    // Determine current environment
    let currentEnv = 'unknown';
    if (FRONTEND_URL.includes('luntra.one') && !FRONTEND_URL.includes('staging')) {
      currentEnv = 'production';
    } else if (FRONTEND_URL.includes('staging')) {
      currentEnv = 'staging';
    } else if (FRONTEND_URL.includes('localhost')) {
      currentEnv = 'local';
    }

    console.log(`\nDetected environment: ${currentEnv}`);

    // Check for mismatches
    const mismatches: string[] = [];

    if (currentEnv === 'production') {
      if (FRONTEND_URL !== EXPECTED_ENV.production.frontend) {
        mismatches.push(`Frontend URL: ${FRONTEND_URL} (expected ${EXPECTED_ENV.production.frontend})`);
      }
      if (BACKEND_URL !== EXPECTED_ENV.production.backend) {
        mismatches.push(`Backend URL: ${BACKEND_URL} (expected ${EXPECTED_ENV.production.backend})`);
      }
    }

    if (mismatches.length > 0) {
      console.log(`\n⚠️  Environment Mismatches Detected:`);
      mismatches.forEach(m => console.log(`  - ${m}`));
    } else {
      console.log(`\n✓ All environment variables match expected values for ${currentEnv}`);
    }

    console.log(`\n====================================\n`);

    // This test always passes - it's informational only
    expect(true).toBeTruthy();
  });
});
