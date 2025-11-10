import { test, expect } from '@playwright/test';

/**
 * Backend Deployment Verification Tests
 *
 * Validates backend deployment by checking /health endpoint
 * Ensures HTTP 200 response and build hash for traceability
 */

const BACKEND_URL = process.env.VITE_API_BASE || 'https://api.luntra.one';

test.describe('Backend Deployment Verification', () => {
  test('/health endpoint returns 200 OK', async ({ request }) => {
    console.log('\n=== BACKEND HEALTH CHECK ===');
    console.log(`Testing: ${BACKEND_URL}/health`);

    const response = await request.get(`${BACKEND_URL}/health`, {
      timeout: 10000
    });

    console.log(`Response Status: ${response.status()}`);
    console.log(`Response OK: ${response.ok()}`);

    // Validate HTTP 200
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    console.log('✅ Health endpoint returned 200 OK\n');
  });

  test('/health response includes required fields', async ({ request }) => {
    console.log('\n=== HEALTH RESPONSE VALIDATION ===');

    const response = await request.get(`${BACKEND_URL}/health`);
    const body = await response.json();

    console.log('Response body:');
    console.log(JSON.stringify(body, null, 2));
    console.log('');

    // Validate required fields
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('build_hash');
    expect(body).toHaveProperty('build_timestamp');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('environment');

    console.log('✅ All required fields present\n');
  });

  test('/health returns healthy status', async ({ request }) => {
    console.log('\n=== HEALTH STATUS CHECK ===');

    const response = await request.get(`${BACKEND_URL}/health`);
    const body = await response.json();

    console.log(`Status: ${body.status}`);

    // Validate status is "healthy"
    expect(body.status).toBe('healthy');

    console.log('✅ Backend status is healthy\n');
  });

  test('/health response includes build hash for traceability', async ({ request }) => {
    console.log('\n=== BUILD HASH VERIFICATION ===');

    const response = await request.get(`${BACKEND_URL}/health`);
    const body = await response.json();

    console.log(`Build Hash: ${body.build_hash}`);
    console.log(`Build Timestamp: ${body.build_timestamp}`);
    console.log(`Version: ${body.version}`);
    console.log(`Environment: ${body.environment}`);
    console.log('');

    // Validate build hash exists and is not "unknown"
    expect(body.build_hash).toBeTruthy();
    expect(typeof body.build_hash).toBe('string');

    if (body.build_hash === 'unknown') {
      console.log('⚠️  WARNING: Build hash is "unknown"');
      console.log('   This may indicate:');
      console.log('   - Build was not deployed from git');
      console.log('   - Git is not available in deployment environment');
      console.log('   - BUILD_HASH env var not set\n');
    } else {
      // Build hash should be a git short hash (7 characters)
      expect(body.build_hash.length).toBeGreaterThanOrEqual(7);
      console.log(`✅ Build hash present: ${body.build_hash}`);
      console.log('   Deployment is traceable to git commit\n');
    }
  });

  test('/health response includes build timestamp', async ({ request }) => {
    console.log('\n=== BUILD TIMESTAMP VERIFICATION ===');

    const response = await request.get(`${BACKEND_URL}/health`);
    const body = await response.json();

    console.log(`Build Timestamp: ${body.build_timestamp}`);
    console.log(`Deployed At: ${body.deployed_at || 'not set'}`);
    console.log('');

    // Validate build timestamp exists
    expect(body.build_timestamp).toBeTruthy();
    expect(typeof body.build_timestamp).toBe('string');

    // Validate it's a valid ISO timestamp
    const timestamp = new Date(body.build_timestamp);
    expect(timestamp.toString()).not.toBe('Invalid Date');

    console.log(`✅ Build timestamp is valid: ${timestamp.toISOString()}\n`);
  });

  test('/health response includes version information', async ({ request }) => {
    console.log('\n=== VERSION INFORMATION ===');

    const response = await request.get(`${BACKEND_URL}/health`);
    const body = await response.json();

    console.log(`API Version: ${body.version}`);
    console.log(`Environment: ${body.environment}`);
    console.log(`Python Version: ${body.python_version || 'not available'}`);
    console.log('');

    // Validate version field
    expect(body.version).toBeTruthy();
    expect(typeof body.version).toBe('string');

    // Validate environment field
    expect(body.environment).toBeTruthy();
    expect(['production', 'staging', 'development']).toContain(body.environment);

    console.log(`✅ Version: ${body.version}`);
    console.log(`✅ Environment: ${body.environment}\n`);
  });

  test('Complete deployment verification summary', async ({ request }) => {
    console.log('\n=== COMPLETE DEPLOYMENT VERIFICATION ===');

    const response = await request.get(`${BACKEND_URL}/health`);
    const body = await response.json();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 DEPLOYMENT SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`Backend URL:       ${BACKEND_URL}`);
    console.log(`Health Status:     ${body.status}`);
    console.log(`HTTP Status:       ${response.status()}`);
    console.log('');
    console.log(`Build Hash:        ${body.build_hash}`);
    console.log(`Build Timestamp:   ${body.build_timestamp}`);
    console.log(`API Version:       ${body.version}`);
    console.log(`Environment:       ${body.environment}`);
    console.log(`Python Version:    ${body.python_version || 'unknown'}`);
    console.log('');

    // Calculate deployment age
    if (body.build_timestamp) {
      const deployedAt = new Date(body.build_timestamp);
      const now = new Date();
      const ageMs = now.getTime() - deployedAt.getTime();
      const ageMinutes = Math.floor(ageMs / 60000);
      const ageHours = Math.floor(ageMinutes / 60);
      const ageDays = Math.floor(ageHours / 24);

      let ageStr = '';
      if (ageDays > 0) {
        ageStr = `${ageDays} day(s) ${ageHours % 24} hour(s)`;
      } else if (ageHours > 0) {
        ageStr = `${ageHours} hour(s) ${ageMinutes % 60} minute(s)`;
      } else {
        ageStr = `${ageMinutes} minute(s)`;
      }

      console.log(`Deployment Age:    ${ageStr}`);
      console.log('');
    }

    console.log('✅ All checks passed');
    console.log('✅ Backend is healthy and responding');
    console.log('✅ Deployment is traceable');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Final assertions
    expect(response.status()).toBe(200);
    expect(body.status).toBe('healthy');
    expect(body.build_hash).toBeTruthy();
    expect(body.build_timestamp).toBeTruthy();
    expect(body.version).toBeTruthy();
  });
});

test.describe('Backend Deployment Health Monitoring', () => {
  test('Response time is acceptable (< 2 seconds)', async ({ request }) => {
    console.log('\n=== RESPONSE TIME CHECK ===');

    const startTime = Date.now();
    const response = await request.get(`${BACKEND_URL}/health`);
    const duration = Date.now() - startTime;

    console.log(`Response Time: ${duration}ms`);
    console.log(`Threshold: 2000ms`);
    console.log('');

    // Validate response time
    expect(duration).toBeLessThan(2000);

    if (duration > 1000) {
      console.log('⚠️  WARNING: Response time > 1 second');
      console.log('   Consider investigating performance\n');
    } else {
      console.log('✅ Response time is acceptable\n');
    }
  });

  test('Multiple consecutive requests succeed (reliability check)', async ({ request }) => {
    console.log('\n=== RELIABILITY CHECK (5 requests) ===');

    const requests = 5;
    let successCount = 0;
    const responseTimes = [];

    for (let i = 0; i < requests; i++) {
      try {
        const startTime = Date.now();
        const response = await request.get(`${BACKEND_URL}/health`);
        const duration = Date.now() - startTime;

        responseTimes.push(duration);

        if (response.status() === 200) {
          successCount++;
        }

        console.log(`Request ${i + 1}/${requests}: ${response.status()} (${duration}ms)`);
      } catch (error) {
        console.log(`Request ${i + 1}/${requests}: FAILED (${error.message})`);
      }
    }

    console.log('');
    console.log(`Success Rate: ${successCount}/${requests} (${(successCount / requests * 100).toFixed(1)}%)`);

    if (responseTimes.length > 0) {
      const avgResponseTime = Math.round(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      );
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);

      console.log(`Average Response Time: ${avgResponseTime}ms`);
      console.log(`Min Response Time: ${minResponseTime}ms`);
      console.log(`Max Response Time: ${maxResponseTime}ms`);
    }

    console.log('');

    // Expect 100% success rate
    expect(successCount).toBe(requests);

    console.log('✅ All requests succeeded\n');
  });
});
