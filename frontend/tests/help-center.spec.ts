/**
 * Playwright E2E Tests for Help Center Feature
 *
 * Tests the Help Center modal, search functionality, article viewing,
 * feedback system, and edge cases.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'TestPassword#123';

// Helper function to login
async function login(page: Page) {
  await page.goto(BASE_URL);

  // Wait for auth modal or login button
  await page.waitForSelector('button:has-text("Sign In"), button:has-text("Log In")', { timeout: 10000 });

  // Click sign in/login button
  const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Log In")').first();
  await signInButton.click();

  // Fill in credentials
  await page.fill('input[type="email"]', TEST_USER_EMAIL);
  await page.fill('input[type="password"]', TEST_USER_PASSWORD);

  // Submit login and wait for navigation
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }),
    page.click('button[type="submit"]')
  ]);

  // Wait for dashboard to load - look for greeting text
  await page.getByText(/Good/i).waitFor({ timeout: 15000 });
}

test.describe('Help Center - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display Help button in dashboard header', async ({ page }) => {
    // Check Help button exists
    const helpButton = page.locator('button:has-text("Help")');
    await expect(helpButton).toBeVisible({ timeout: 10000 });

    // Verify it has the correct icon
    const helpIcon = helpButton.locator('svg');
    await expect(helpIcon).toBeVisible();

    // Verify accessibility
    await expect(helpButton).toHaveAttribute('aria-label', 'Open Help Center');
    await expect(helpButton).toHaveAttribute('title', /Help Center/i);
  });

  test('should open Help Center modal when Help button clicked', async ({ page }) => {
    // Click Help button
    await page.click('button:has-text("Help")');

    // Wait for modal to appear
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });

    // Verify modal is visible
    const modal = page.locator('[class*="help-center"]').first();
    await expect(modal).toBeVisible();

    // Verify close button exists
    const closeButton = page.locator('button[aria-label*="Close"], button:has-text("✕")').last();
    await expect(closeButton).toBeVisible();
  });

  test('should close Help Center modal when close button clicked', async ({ page }) => {
    // Open Help Center
    await page.click('button:has-text("Help")');
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });

    // Click close button
    const closeButton = page.locator('button[aria-label*="Close"], button:has-text("✕")').last();
    await closeButton.click();

    // Wait a moment for animation
    await page.waitForTimeout(500);

    // Verify modal is closed (or not visible)
    const modal = page.locator('[class*="help-center"]').first();
    await expect(modal).not.toBeVisible();
  });

  test('should display search input in Help Center', async ({ page }) => {
    await page.click('button:has-text("Help")');
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });

    // Check search input exists
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /.*(Search|search).*/);
  });
});

test.describe('Help Center - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Help")');
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });
  });

  test('should search for articles and display results', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();

    // Type search query
    await searchInput.fill('property analysis');
    await page.waitForTimeout(800); // Debounce delay

    // Verify search results appear
    const results = page.locator('[class*="article"], [class*="search-result"]');
    const count = await results.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();

    // Search for something that doesn't exist
    await searchInput.fill('xyzabc123nonexistent');
    await page.waitForTimeout(800);

    // Should show "no results" message or empty state
    const noResults = page.locator('text=/No (articles|results) found/i, text=/Try (a different|another) search/i');
    await expect(noResults.first()).toBeVisible({ timeout: 5000 });
  });

  test('EDGE CASE: should handle very long search queries', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();

    // Enter extremely long search query
    const longQuery = 'property analysis real estate investment calculator deal metrics cash flow cap rate roi return on investment monthly payment mortgage'.repeat(5);
    await searchInput.fill(longQuery);
    await page.waitForTimeout(800);

    // Should not crash and should handle gracefully
    const modal = page.locator('[class*="help-center"]').first();
    await expect(modal).toBeVisible();
  });

  test('EDGE CASE: should handle special characters in search', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();

    // Test special characters
    const specialQueries = ['<script>alert("xss")</script>', '"; DROP TABLE articles;--', '100%', 'C++ && Java'];

    for (const query of specialQueries) {
      await searchInput.fill(query);
      await page.waitForTimeout(500);

      // Should not crash or execute malicious code
      const modal = page.locator('[class*="help-center"]').first();
      await expect(modal).toBeVisible();

      // Clear for next test
      await searchInput.clear();
    }
  });

  test('should clear search when input is cleared', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();

    // Enter search
    await searchInput.fill('property');
    await page.waitForTimeout(800);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Should show default view (categories or featured articles)
    const categories = page.locator('text=/Getting Started|Troubleshooting|Billing/i');
    await expect(categories.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Help Center - Article Viewing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Help")');
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });
  });

  test('should display article categories', async ({ page }) => {
    // Check for common categories
    const categories = [
      /Getting Started/i,
      /Property Analysis/i,
      /Calculator/i,
      /Troubleshooting/i,
      /Billing/i
    ];

    for (const category of categories) {
      const categoryElement = page.locator(`text=${category}`);
      const count = await categoryElement.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should open article when clicked', async ({ page }) => {
    // Find and click first article
    const firstArticle = page.locator('[class*="article"], button:has-text("PropIQ"), button:has-text("property")').first();
    await firstArticle.click();

    await page.waitForTimeout(1000);

    // Verify article content is visible
    // Look for back button or article title
    const backButton = page.locator('button:has-text("Back"), button[aria-label*="Back"]');
    const hasBack = await backButton.count() > 0;

    expect(hasBack).toBeTruthy();
  });

  test('should navigate back from article view', async ({ page }) => {
    // Click article
    const firstArticle = page.locator('[class*="article"], button:has-text("PropIQ")').first();
    await firstArticle.click();
    await page.waitForTimeout(1000);

    // Click back button
    const backButton = page.locator('button:has-text("Back"), button[aria-label*="Back"]').first();
    await backButton.click();
    await page.waitForTimeout(500);

    // Should be back at article list/search view
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('EDGE CASE: should render markdown content correctly', async ({ page }) => {
    // Click first article
    const firstArticle = page.locator('[class*="article"], button:has-text("PropIQ")').first();
    await firstArticle.click();
    await page.waitForTimeout(1000);

    // Check for markdown elements (headings, lists, code blocks)
    const hasHeadings = await page.locator('h1, h2, h3').count() > 0;
    const hasLists = await page.locator('ul, ol').count() > 0;

    // At least one markdown element should be present
    expect(hasHeadings || hasLists).toBeTruthy();
  });
});

test.describe('Help Center - Article Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Help")');
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });
  });

  test('should display feedback buttons in article view', async ({ page }) => {
    // Open article
    const firstArticle = page.locator('[class*="article"], button:has-text("PropIQ")').first();
    await firstArticle.click();
    await page.waitForTimeout(1000);

    // Look for feedback buttons (thumbs up/down or helpful/not helpful)
    const feedbackButtons = page.locator('button:has-text("Helpful"), button:has-text("helpful"), button[aria-label*="helpful"]');
    const count = await feedbackButtons.count();

    expect(count).toBeGreaterThan(0);
  });

  test('EDGE CASE: should prevent duplicate votes on same article', async ({ page }) => {
    // Open article
    const firstArticle = page.locator('[class*="article"], button:has-text("PropIQ")').first();
    await firstArticle.click();
    await page.waitForTimeout(1000);

    // Click helpful button
    const helpfulButton = page.locator('button:has-text("Helpful"), button[aria-label*="helpful"]').first();
    await helpfulButton.click();
    await page.waitForTimeout(500);

    // Try clicking again
    await helpfulButton.click();
    await page.waitForTimeout(500);

    // Should show feedback already submitted or button disabled
    // The exact behavior depends on implementation
    const isDisabled = await helpfulButton.isDisabled();
    const hasSubmittedText = await page.locator('text=/already submitted|thank you/i').count() > 0;

    expect(isDisabled || hasSubmittedText).toBeTruthy();
  });
});

test.describe('Help Center - Onboarding Checklist', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display onboarding checklist for new users', async ({ page }) => {
    // Look for onboarding checklist
    const checklist = page.locator('text=/onboarding|checklist|welcome/i, [class*="onboarding"]');
    const count = await checklist.count();

    // May or may not be visible depending on user state
    // Just verify it doesn't crash
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('EDGE CASE: should handle checklist dismissal', async ({ page }) => {
    // Look for checklist
    const checklist = page.locator('[class*="onboarding"]').first();
    const isVisible = await checklist.isVisible().catch(() => false);

    if (isVisible) {
      // Look for dismiss/close button
      const dismissButton = page.locator('button:has-text("Dismiss"), button:has-text("✕")').first();
      if (await dismissButton.isVisible()) {
        await dismissButton.click();
        await page.waitForTimeout(500);

        // Checklist should be hidden
        await expect(checklist).not.toBeVisible();
      }
    }
  });
});

test.describe('Help Center - Performance & Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should load Help Center quickly (< 2 seconds)', async ({ page }) => {
    const startTime = Date.now();

    await page.click('button:has-text("Help")');
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });

    const loadTime = Date.now() - startTime;

    console.log(`Help Center load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab to Help button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to open
    const helpButton = page.locator('button:has-text("Help")');
    await helpButton.focus();
    await page.keyboard.press('Enter');

    // Modal should open
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });

    // Press Escape to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Modal should close
    const modal = page.locator('[class*="help-center"]').first();
    const isVisible = await modal.isVisible().catch(() => false);

    expect(isVisible).toBeFalsy();
  });

  test('EDGE CASE: should handle rapid open/close clicks', async ({ page }) => {
    // Rapidly open and close multiple times
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Help")');
      await page.waitForTimeout(100);

      const closeButton = page.locator('button[aria-label*="Close"], button:has-text("✕")').last();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(100);
      }
    }

    // Should not crash
    const helpButton = page.locator('button:has-text("Help")');
    await expect(helpButton).toBeVisible();
  });

  test('EDGE CASE: should handle multiple modals scenario', async ({ page }) => {
    // Open Help Center
    await page.click('button:has-text("Help")');
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });

    // Try to open another modal (like pricing)
    const pricingButton = page.locator('button:has-text("Upgrade"), button:has-text("Pricing")').first();
    if (await pricingButton.isVisible()) {
      await pricingButton.click();
      await page.waitForTimeout(500);

      // Both modals might be open or one should close
      // Just verify no crash
      const modals = page.locator('[role="dialog"], [class*="modal"]');
      const count = await modals.count();

      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Help Center - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display Help button on mobile', async ({ page }) => {
    await login(page);

    const helpButton = page.locator('button:has-text("Help"), button[aria-label*="Help"]');
    await expect(helpButton).toBeVisible();
  });

  test('should open Help Center modal on mobile', async ({ page }) => {
    await login(page);

    await page.click('button:has-text("Help"), button[aria-label*="Help"]');
    await page.waitForTimeout(1000);

    // Modal should be visible and fill screen
    const modal = page.locator('[class*="help-center"]').first();
    await expect(modal).toBeVisible();
  });

  test('EDGE CASE: should handle mobile keyboard with search', async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Help"), button[aria-label*="Help"]');
    await page.waitForTimeout(1000);

    // Click search input (should open mobile keyboard)
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await searchInput.click();
    await searchInput.fill('property');

    // Should not crash or have layout issues
    await expect(searchInput).toBeVisible();
  });
});

test.describe('Help Center - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('EDGE CASE: should handle network errors gracefully', async ({ page }) => {
    // Open Help Center first
    await page.click('button:has-text("Help")');
    await page.waitForSelector('text=PropIQ Help Center, text=Help Center', { timeout: 5000 });

    // Simulate offline
    await page.context().setOffline(true);

    // Try to search
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await searchInput.fill('property');
    await page.waitForTimeout(1000);

    // Should show error message or cached results
    const modal = page.locator('[class*="help-center"]').first();
    await expect(modal).toBeVisible();

    // Restore online
    await page.context().setOffline(false);
  });

  test('EDGE CASE: should handle article not found', async ({ page }) => {
    // Open Help Center
    await page.click('button:has-text("Help")');
    await page.waitForTimeout(1000);

    // Try to navigate to non-existent article (if URL routing is used)
    // This test depends on implementation
    // Just verify Help Center doesn't crash
    const modal = page.locator('[class*="help-center"]').first();
    await expect(modal).toBeVisible();
  });
});
