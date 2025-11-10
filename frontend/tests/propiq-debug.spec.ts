import { test, expect } from '@playwright/test';

test.describe('PropIQ Dashboard Debugging', () => {
  const url = 'https://propiq.luntra.one';

  test('1. Check if page loads', async ({ page }) => {
    console.log('🔍 Loading:', url);

    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('📊 Response status:', response?.status());
    console.log('📊 Response headers:', await response?.allHeaders());

    expect(response?.status()).toBe(200);
  });

  test('2. Check for console errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      console.log('💬', text);
    });

    page.on('pageerror', error => {
      const errorText = error.message;
      errors.push(errorText);
      console.log('❌ Page Error:', errorText);
    });

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n📋 Total console messages:', consoleMessages.length);
    console.log('❌ Total errors:', errors.length);

    if (errors.length > 0) {
      console.log('\n⚠️ ERRORS FOUND:');
      errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    }
  });

  test('3. Check if Firebase is blocking', async ({ page }) => {
    const networkRequests: any[] = [];

    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    page.on('requestfailed', request => {
      console.log('❌ Failed request:', request.url(), request.failure()?.errorText);
    });

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n📡 Network Requests:', networkRequests.length);

    const firebaseRequests = networkRequests.filter(r => r.url.includes('firebase'));
    console.log('🔥 Firebase requests:', firebaseRequests.length);
    firebaseRequests.forEach(req => console.log('  -', req.url));

    const failedFirebase = firebaseRequests.filter(r => r.url.includes('firebase'));
    if (failedFirebase.length > 0) {
      console.log('⚠️ Firebase might be blocking the app');
    }
  });

  test('4. Check DOM content', async ({ page }) => {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    const html = await page.content();
    console.log('\n📄 Page HTML length:', html.length);

    const appDiv = await page.$('#app');
    if (appDiv) {
      const appContent = await appDiv.innerHTML();
      console.log('📦 #app div content length:', appContent.length);
      console.log('📦 #app div content:', appContent.substring(0, 500));
    } else {
      console.log('❌ #app div not found!');
    }

    const bodyText = await page.textContent('body');
    console.log('📝 Body text:', bodyText?.substring(0, 200));
  });

  test('5. Check if loading screen appears', async ({ page }) => {
    await page.goto(url);

    // Check for loading screen
    const loadingText = await page.textContent('body');
    console.log('\n🔄 Page content:', loadingText);

    if (loadingText?.includes('Loading LUNTRA Engine')) {
      console.log('✅ Loading screen appears');
      console.log('⏳ Waiting for authentication...');

      await page.waitForTimeout(10000);

      const afterWait = await page.textContent('body');
      console.log('🔄 After 10s wait:', afterWait);
    }
  });

  test('6. Screenshot current state', async ({ page }) => {
    await page.goto(url);
    await page.waitForTimeout(3000);

    const screenshotPath = '/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/luntra/frontend/propiq-debug.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('📸 Screenshot saved:', screenshotPath);
  });

  test('7. Check window globals', async ({ page }) => {
    await page.goto(url);
    await page.waitForTimeout(2000);

    const globals = await page.evaluate(() => {
      return {
        hasAppId: typeof (window as any).__app_id !== 'undefined',
        hasFirebaseConfig: typeof (window as any).__firebase_config !== 'undefined',
        hasAuthToken: typeof (window as any).__initial_auth_token !== 'undefined',
        appId: (window as any).__app_id,
        firebaseConfig: (window as any).__firebase_config
      };
    });

    console.log('\n🌐 Window Globals:');
    console.log('  __app_id:', globals.hasAppId ? globals.appId : '❌ MISSING');
    console.log('  __firebase_config:', globals.hasFirebaseConfig ? 'Present' : '❌ MISSING');
    console.log('  __initial_auth_token:', globals.hasAuthToken ? 'Present' : 'Not set (OK)');

    if (!globals.hasAppId || !globals.hasFirebaseConfig) {
      console.log('\n❌ PROBLEM: Firebase globals are missing!');
      console.log('   This will cause the app to hang on initialization.');
    }
  });
});
