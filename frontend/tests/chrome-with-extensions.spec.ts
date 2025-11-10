import { test, chromium } from '@playwright/test';

test.describe('Manual UX Review with Chrome Extensions', () => {
  test('Open PropIQ in Chrome with extensions enabled', async () => {
    // Launch Chrome with your profile (includes all extensions)
    const userDataDir = '/Users/briandusape/Library/Application Support/Google/Chrome/Default';
    
    const browser = await chromium.launchPersistentContext(userDataDir, {
      headless: false, // Must be false for extensions
      channel: 'chrome', // Use installed Chrome
      viewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();
    
    // Open PropIQ
    await page.goto('http://localhost:5173');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Chrome opened with extensions!');
    console.log('📋 You can now:');
    console.log('   - Use Axe DevTools (F12 → axe tab)');
    console.log('   - Use WAVE extension');
    console.log('   - Run Lighthouse audit');
    console.log('   - Inspect with Chrome DevTools');
    console.log('\n⏸️  Test paused. Click "Resume" in Playwright Inspector when done.');
    
    // Pause to let you use extensions manually
    await page.pause();
    
    await browser.close();
  });

  test('Open specific page for review', async ({ page }) => {
    // This runs in regular Chromium (no extensions)
    // But you can open Chrome separately and navigate to same URL
    
    await page.goto('http://localhost:5173');
    
    const currentUrl = page.url();
    console.log(`\n📍 Current URL: ${currentUrl}`);
    console.log('💡 Open this URL in Chrome to use extensions');
    
    await page.pause();
  });
});
