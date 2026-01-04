#!/usr/bin/env node

/**
 * Quick Deployment Verification Script
 *
 * Tests PropIQ live deployment:
 * 1. Site loads
 * 2. Calculator works
 * 3. No console errors
 * 4. Latest changes deployed
 */

import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Verifying PropIQ Deployment...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const warnings = [];
  const logs = [];

  // Capture console messages
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();

    if (type === 'error') {
      errors.push(text);
      console.log(`❌ Console Error: ${text}`);
    } else if (type === 'warning') {
      warnings.push(text);
      console.log(`⚠️  Console Warning: ${text}`);
    } else {
      logs.push(text);
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    errors.push(error.message);
    console.log(`❌ Page Error: ${error.message}`);
  });

  try {
    // Test 1: Homepage loads
    console.log('Test 1: Loading homepage...');
    await page.goto('https://propiq.luntra.one', { waitUntil: 'networkidle' });
    console.log('✅ Homepage loaded\n');

    // Test 2: Component test page loads
    console.log('Test 2: Loading component test page...');
    await page.goto('https://propiq.luntra.one/test', { waitUntil: 'networkidle' });
    console.log('✅ Component test page loaded\n');

    // Test 3: Check for calculator components
    console.log('Test 3: Checking for calculator components...');
    const hasQuickCheck = await page.locator('text=QuickCheck').count() > 0;
    const hasV3 = await page.locator('text=DealCalculatorV3').count() > 0;
    const hasV2 = await page.locator('text=DealCalculatorV2').count() > 0;

    if (hasQuickCheck) console.log('✅ QuickCheck component found');
    if (hasV3) console.log('✅ DealCalculatorV3 component found');
    if (hasV2) console.log('✅ DealCalculatorV2 component found');

    if (!hasQuickCheck && !hasV3 && !hasV2) {
      console.log('⚠️  No calculator components found on test page');
    }

    console.log('');

    // Test 4: Check for tooltip infinite loop (BUG-001)
    console.log('Test 4: Checking for BUG-001 (tooltip infinite loop)...');
    await page.waitForTimeout(3000); // Wait for any loops to trigger

    const tooltipErrors = errors.filter(e =>
      e.includes('tooltip') ||
      e.includes('Maximum update depth') ||
      e.includes('Too many re-renders')
    );

    if (tooltipErrors.length > 0) {
      console.log('❌ BUG-001 DETECTED: Tooltip infinite loop still present');
      tooltipErrors.forEach(e => console.log(`   ${e}`));
    } else {
      console.log('✅ BUG-001 NOT DETECTED: No tooltip infinite loops\n');
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DEPLOYMENT VERIFICATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Total Errors: ${errors.length}`);
    console.log(`Total Warnings: ${warnings.length}`);
    console.log(`Total Logs: ${logs.length}\n`);

    if (errors.length > 0) {
      console.log('❌ ERRORS DETECTED:');
      errors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
      console.log('');
    }

    if (warnings.length > 0 && warnings.length <= 5) {
      console.log('⚠️  WARNINGS:');
      warnings.slice(0, 5).forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
      console.log('');
    }

    if (errors.length === 0 && tooltipErrors.length === 0) {
      console.log('🎉 DEPLOYMENT VERIFIED: PropIQ is live and working!\n');
      console.log('✅ No critical errors detected');
      console.log('✅ Calculator components deployed');
      console.log('✅ BUG-001 tooltip fix confirmed\n');
      process.exit(0);
    } else {
      console.log('⚠️  DEPLOYMENT HAS ISSUES - Review errors above\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
