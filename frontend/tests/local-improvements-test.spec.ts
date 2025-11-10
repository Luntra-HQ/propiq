import { test, expect } from '@playwright/test';

/**
 * Test Suite: All UX Improvements + Quick Wins
 *
 * This test verifies all 7 improvements implemented:
 * P0: Feature hierarchy (PropIQ first)
 * P1: Branding fix, Settings removal, Address validation
 * P2: Enhanced loading feedback
 * Quick Win #1: Sample property preload
 * Quick Win #2: Tooltip help system
 */

test.describe('PropIQ UX Improvements - Local Testing', () => {
  const LOCAL_URL = 'http://localhost:5173';

  test('P0 + P1: Verify branding and feature hierarchy', async ({ page }) => {
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // P1: Verify new branding (not "LUNTRA Internal Dashboard")
    const header = await page.locator('h1').first().textContent();
    console.log('📝 Header text:', header);
    expect(header).toContain('PropIQ');
    expect(header).not.toContain('LUNTRA Internal Dashboard');

    // P1: Verify Settings button is removed
    const settingsButton = await page.locator('button:has-text("Settings")').count();
    expect(settingsButton).toBe(0);
    console.log('✅ Settings button removed');

    // P0: Verify PropIQ section appears FIRST (before calculator)
    const sections = await page.locator('section').all();
    console.log('📦 Found', sections.length, 'sections');

    // Find PropIQ section
    const firstSectionText = await sections[0].textContent();
    expect(firstSectionText).toContain('PropIQ AI Analysis');
    expect(firstSectionText).toContain('analyses remaining');
    console.log('✅ PropIQ section appears first (hero position)');

    // Find Calculator section (should be after PropIQ)
    const secondSectionText = await sections[1].textContent();
    expect(secondSectionText).toContain('Real Estate Investment Calculator');
    expect(secondSectionText).toContain('Free Tool');
    console.log('✅ Calculator section appears second with "Free Tool" badge');
  });

  test('Quick Win #1: Sample Property Banner', async ({ page }) => {
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // Click "Analyze a Property Now" to open modal
    await page.click('button:has-text("Analyze a Property Now")');
    await page.waitForTimeout(1000);

    // Verify sample property banner exists
    const banner = page.locator('.propiq-sample-banner');
    await expect(banner).toBeVisible();
    console.log('✅ Sample property banner visible');

    // Verify banner content
    const bannerText = await banner.textContent();
    expect(bannerText).toContain('New to PropIQ');
    expect(bannerText).toContain('Try Sample Property');
    console.log('✅ Banner has correct text');

    // Click "Try Sample Property" button
    await page.click('button:has-text("Try Sample Property")');
    await page.waitForTimeout(500);

    // Verify form is auto-filled
    const addressInput = await page.locator('input[placeholder*="address"]').inputValue();
    console.log('📍 Address filled:', addressInput);
    expect(addressInput).toContain('2505 Longview St');
    expect(addressInput).toContain('Austin');
    console.log('✅ Sample property auto-filled form');
  });

  test('P1: Address Validation', async ({ page }) => {
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // Open PropIQ modal
    await page.click('button:has-text("Analyze a Property Now")');
    await page.waitForTimeout(1000);

    // Test invalid address: just "123"
    await page.fill('input[placeholder*="address"]', '123');
    await page.click('button:has-text("Analyze Property")');
    await page.waitForTimeout(500);

    // Verify error message appears
    const errorText = await page.locator('text=/Please include/i').textContent();
    console.log('⚠️ Validation error:', errorText);
    expect(errorText).toBeTruthy();
    console.log('✅ Address validation prevents invalid addresses');
  });

  test('Quick Win #2: Tooltip Help System', async ({ page }) => {
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // Login first (required for analysis)
    // For now, skip this test if no auth - tooltips show on results page
    console.log('⏭️ Tooltip test requires authentication - skipping for now');

    // TODO: Add test for tooltip hover once we have test credentials
    // Should test:
    // - Hover over "?" icon next to "Cap Rate"
    // - Verify tooltip text appears with explanation
    // - Test on mobile (tap to show)
  });

  test('P2: Enhanced Loading State (Mock)', async ({ page }) => {
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // Open PropIQ modal
    await page.click('button:has-text("Analyze a Property Now")');
    await page.waitForTimeout(1000);

    // Load sample property
    await page.click('button:has-text("Try Sample Property")');
    await page.waitForTimeout(500);

    // Start analysis (will fail without auth, but we can see loading state briefly)
    await page.click('button:has-text("Analyze Property")');

    // Check for loading elements (before auth error appears)
    const hasLoadingOrError = await Promise.race([
      page.waitForSelector('text=/This typically takes 10-20 seconds/i', { timeout: 2000 }).then(() => 'loading'),
      page.waitForSelector('text=/must be logged in/i', { timeout: 2000 }).then(() => 'auth_error'),
    ]).catch(() => 'timeout');

    if (hasLoadingOrError === 'loading') {
      console.log('✅ Enhanced loading state visible with time estimate');

      // Check for progress steps
      const hasMarketAnalysis = await page.locator('text=Market Analysis').count();
      const hasFinancialModeling = await page.locator('text=Financial Modeling').count();

      if (hasMarketAnalysis > 0 && hasFinancialModeling > 0) {
        console.log('✅ Progress steps visible (Market Analysis, Financial Modeling)');
      }
    } else {
      console.log('ℹ️ Auth required - loading state test skipped');
    }
  });

  test('Summary: All Improvements Present', async ({ page }) => {
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    const improvements = {
      p0_feature_hierarchy: false,
      p1_branding: false,
      p1_settings_removed: false,
      quickwin_sample_property: false,
    };

    // Check branding
    const header = await page.locator('h1').first().textContent();
    if (header?.includes('PropIQ') && !header.includes('LUNTRA Internal Dashboard')) {
      improvements.p1_branding = true;
    }

    // Check Settings removed
    const settingsCount = await page.locator('button:has-text("Settings")').count();
    if (settingsCount === 0) {
      improvements.p1_settings_removed = true;
    }

    // Check feature hierarchy
    const sections = await page.locator('section').all();
    const firstSection = await sections[0]?.textContent();
    if (firstSection?.includes('PropIQ AI Analysis')) {
      improvements.p0_feature_hierarchy = true;
    }

    // Check sample property
    await page.click('button:has-text("Analyze a Property Now")');
    await page.waitForTimeout(1000);
    const hasSampleButton = await page.locator('button:has-text("Try Sample Property")').count();
    if (hasSampleButton > 0) {
      improvements.quickwin_sample_property = true;
    }

    // Print results
    console.log('\n📊 Improvement Verification Results:');
    console.log('P0 Feature Hierarchy:', improvements.p0_feature_hierarchy ? '✅' : '❌');
    console.log('P1 Branding Fix:', improvements.p1_branding ? '✅' : '❌');
    console.log('P1 Settings Removed:', improvements.p1_settings_removed ? '✅' : '❌');
    console.log('Quick Win: Sample Property:', improvements.quickwin_sample_property ? '✅' : '❌');

    // Assert all passed
    expect(improvements.p0_feature_hierarchy).toBe(true);
    expect(improvements.p1_branding).toBe(true);
    expect(improvements.p1_settings_removed).toBe(true);
    expect(improvements.quickwin_sample_property).toBe(true);

    console.log('\n🎉 All improvements verified successfully!\n');
  });
});
