/**
 * API v1 Migration Tests
 * Sprint 7: Verify all endpoints use /api/v1 prefix correctly
 */

import { test, expect } from '@playwright/test';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:8000';

test.describe('API v1 Endpoint Migration', () => {
  test('health endpoint uses /api/v1 prefix', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/propiq/health`);

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('azure_openai_configured');
  });

  test('old endpoints return 404', async ({ request }) => {
    // Test that old endpoint without /api/v1 returns 404
    const response = await request.get(`${API_BASE}/propiq/health`);

    expect(response.status()).toBe(404);
  });

  test('support chat health uses /api/v1 prefix', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/support/health`);

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('stripe health uses /api/v1 prefix', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/stripe/health`);

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });
});

test.describe('API v1 Authentication Endpoints', () => {
  const testEmail = `test-${Date.now()}@propiq-test.com`;
  const testPassword = 'SecureTestPass123!';

  test('signup endpoint uses /api/v1 prefix', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/v1/auth/signup`, {
      data: {
        email: testEmail,
        password: testPassword,
        full_name: 'Test User'
      }
    });

    // Should be either 201 (created) or 400 (already exists)
    expect([201, 400]).toContain(response.status());

    if (response.status() === 201) {
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('userId');
    }
  });

  test('login endpoint uses /api/v1 prefix', async ({ request }) => {
    // First try to create user (might already exist)
    await request.post(`${API_BASE}/api/v1/auth/signup`, {
      data: {
        email: testEmail,
        password: testPassword
      }
    });

    // Now login
    const response = await request.post(`${API_BASE}/api/v1/auth/login`, {
      data: {
        email: testEmail,
        password: testPassword
      }
    });

    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('accessToken');
    }
  });
});
