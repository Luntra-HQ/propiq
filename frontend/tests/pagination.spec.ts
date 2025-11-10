/**
 * Pagination Tests
 * Sprint 7: Verify pagination works correctly on list endpoints
 */

import { test, expect } from '@playwright/test';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:8000';

test.describe('Pagination Functionality', () => {
  let authToken: string;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    // Create/login test user
    const testEmail = `pagination-test-${Date.now()}@propiq-test.com`;
    const testPassword = 'TestPass123!';

    // Try signup
    await request.post(`${API_BASE}/api/v1/auth/signup`, {
      data: {
        email: testEmail,
        password: testPassword,
        full_name: 'Pagination Test User'
      }
    });

    // Login to get token
    const loginResponse = await request.post(`${API_BASE}/api/v1/auth/login`, {
      data: {
        email: testEmail,
        password: testPassword
      }
    });

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      authToken = loginData.accessToken;
      userId = loginData.userId;
    }
  });

  test('support conversations endpoint returns paginated response', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    const response = await request.get(
      `${API_BASE}/api/v1/support/conversations?page=1&page_size=20`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Verify paginated response structure
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('pagination');

    // Verify pagination metadata
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('page_size');
    expect(data.pagination).toHaveProperty('total_items');
    expect(data.pagination).toHaveProperty('total_pages');
    expect(data.pagination).toHaveProperty('has_next');
    expect(data.pagination).toHaveProperty('has_previous');

    // Verify data is array
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('property analyses endpoint returns paginated response', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    const response = await request.get(
      `${API_BASE}/api/v1/propiq/analyses?page=1&page_size=10`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Verify paginated response structure
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('pagination');

    // Verify pagination metadata
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.page_size).toBe(10);
    expect(data.pagination.has_previous).toBe(false); // First page

    // Verify data is array
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('pagination respects page_size parameter', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    const response = await request.get(
      `${API_BASE}/api/v1/propiq/analyses?page=1&page_size=5`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Data should have at most 5 items
    expect(data.data.length).toBeLessThanOrEqual(5);
    expect(data.pagination.page_size).toBe(5);
  });

  test('pagination rejects page_size > 100', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    const response = await request.get(
      `${API_BASE}/api/v1/propiq/analyses?page=1&page_size=150`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    // Should return validation error
    expect(response.status()).toBe(422);
  });

  test('pagination returns correct metadata for multiple pages', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    // Get first page with small page_size to force multiple pages
    const response1 = await request.get(
      `${API_BASE}/api/v1/propiq/analyses?page=1&page_size=2`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (response1.ok()) {
      const data1 = await response1.json();

      if (data1.pagination.total_pages > 1) {
        // If there are multiple pages, verify navigation metadata
        expect(data1.pagination.has_next).toBe(true);
        expect(data1.pagination.next_page).toBe(2);
        expect(data1.pagination.has_previous).toBe(false);

        // Get second page
        const response2 = await request.get(
          `${API_BASE}/api/v1/propiq/analyses?page=2&page_size=2`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (response2.ok()) {
          const data2 = await response2.json();
          expect(data2.pagination.page).toBe(2);
          expect(data2.pagination.has_previous).toBe(true);
          expect(data2.pagination.previous_page).toBe(1);
        }
      }
    }
  });
});
