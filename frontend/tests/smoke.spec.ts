/**
 * Smoke Tests
 * Sprint 7: Quick smoke tests to verify core functionality
 */

import { test, expect } from '@playwright/test';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:8000';

test.describe('Smoke Tests - API Health', () => {
  test('PropIQ API is healthy', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/propiq/health`);

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBeTruthy();
  });

  test('Support Chat API is healthy', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/support/health`);

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBeTruthy();
  });

  test('Stripe API is healthy', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/stripe/health`);

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBeTruthy();
  });

  test('Marketing API is healthy', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/marketing/health`);

    expect([200, 404]).toContain(response.status()); // May not exist
  });
});

test.describe('Smoke Tests - Frontend', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check that we're not on an error page
    await expect(page).not.toHaveURL(/404/);
    await expect(page).not.toHaveURL(/error/);

    // Check for key elements
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    expect(body.length).toBeGreaterThan(100);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      errors.push(err.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Allow some errors but not critical ones
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('manifest') &&
      !err.toLowerCase().includes('warning')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('JavaScript loads and executes', async ({ page }) => {
    await page.goto('/');

    // Check that React has loaded by looking for React root
    const reactRoot = await page.$('#root');
    expect(reactRoot).toBeTruthy();

    // Check that React has rendered content
    const rootContent = await page.textContent('#root');
    expect(rootContent).toBeTruthy();
    expect(rootContent.length).toBeGreaterThan(0);
  });
});

test.describe('Smoke Tests - Critical Paths', () => {
  test('can access health endpoints without auth', async ({ request }) => {
    const endpoints = [
      '/api/v1/propiq/health',
      '/api/v1/support/health',
      '/api/v1/stripe/health'
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${API_BASE}${endpoint}`);
      expect([200, 503]).toContain(response.status());
    }
  });

  test('protected endpoints require authentication', async ({ request }) => {
    // These endpoints should return 401 without auth token
    const protectedEndpoints = [
      '/api/v1/propiq/analyze',
      '/api/v1/propiq/analyses',
      '/api/v1/support/conversations'
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await request.post(`${API_BASE}${endpoint}`, {
        data: {}
      });

      // Should require authentication (401) or bad request (422/400)
      expect([401, 422, 400]).toContain(response.status());
    }
  });
});
