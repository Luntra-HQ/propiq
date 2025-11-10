import { test, expect } from '@playwright/test';

test('Verify Deal IQ Dashboard loads correctly', async ({ page }) => {
  console.log('🚀 Testing https://propiq.luntra.one');

  await page.goto('https://propiq.luntra.one');
  await page.waitForTimeout(3000);

  // Check for Firebase globals
  const globals = await page.evaluate(() => ({
    hasAppId: typeof (window as any).__app_id !== 'undefined',
    hasFirebaseConfig: typeof (window as any).__firebase_config !== 'undefined'
  }));

  console.log('✅ Firebase globals present:', globals);

  // Check for app content
  const appDiv = await page.$('#app');
  const appContent = appDiv ? await appDiv.innerHTML() : '';

  console.log('📦 App div content length:', appContent.length);

  // Check for key elements
  const bodyText = await page.textContent('body');

  if (bodyText?.includes('LUNTRA Internal Dashboard')) {
    console.log('✅ Header found: LUNTRA Internal Dashboard');
  }

  if (bodyText?.includes('Deal IQ Analysis')) {
    console.log('✅ Feature found: Deal IQ Analysis');
  }

  if (bodyText?.includes('Runs Left')) {
    console.log('✅ Trial tracking found');
  }

  // Take screenshot
  await page.screenshot({
    path: '/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/luntra/frontend/propiq-working.png',
    fullPage: true
  });

  console.log('📸 Screenshot saved: propiq-working.png');

  // Verify app is actually rendering
  expect(appContent.length).toBeGreaterThan(100);
  expect(globals.hasAppId).toBe(true);
  expect(globals.hasFirebaseConfig).toBe(true);
});
