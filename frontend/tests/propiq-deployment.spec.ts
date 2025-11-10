import { test, expect } from '@playwright/test';

const BASE_URL = 'https://propiq.luntra.one';

test.describe('PropIQ Deployment Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('01 - Site loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/LUNTRA Deal IQ/);
    console.log('✅ Page title:', await page.title());
  });

  test('02 - JavaScript loads and executes', async ({ page }) => {
    // Wait for JavaScript to initialize
    await page.waitForTimeout(1000);

    // Check if LuntraApp is initialized
    const appExists = await page.evaluate(() => {
      return typeof window.luntraApp !== 'undefined';
    });

    expect(appExists).toBeTruthy();
    console.log('✅ LuntraApp initialized:', appExists);
  });

  test('03 - Check for JavaScript errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('❌ Console error:', msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
      console.log('❌ Page error:', error.message);
    });

    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      console.log('\n🚨 JavaScript Errors Found:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    } else {
      console.log('✅ No JavaScript errors detected');
    }

    expect(errors.length).toBe(0);
  });

  test('04 - Main content area exists', async ({ page }) => {
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
    console.log('✅ Main content area is visible');
  });

  test('05 - Navigation elements exist', async ({ page }) => {
    const guestNav = page.locator('#guest-nav');
    const authNav = page.locator('#auth-nav');

    await expect(guestNav).toBeVisible();
    console.log('✅ Guest navigation visible');

    // Auth nav should be hidden initially
    await expect(authNav).toHaveClass(/hidden/);
    console.log('✅ Auth navigation hidden (correct initial state)');
  });

  test('06 - Navigation links are clickable', async ({ page }) => {
    // Test clicking navigation links
    const links = [
      { selector: '[data-nav="landing"]', name: 'Home' },
      { selector: '[data-nav="pricing"]', name: 'Pricing' },
      { selector: '[data-nav="login"]', name: 'Login' },
      { selector: '[data-nav="signup"]', name: 'Signup' }
    ];

    for (const link of links) {
      const element = page.locator(link.selector);
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();

      console.log(`${isVisible && isEnabled ? '✅' : '❌'} ${link.name} link - Visible: ${isVisible}, Enabled: ${isEnabled}`);

      if (isVisible && isEnabled) {
        await element.click();
        await page.waitForTimeout(500);
        console.log(`   Clicked ${link.name} successfully`);
      }
    }
  });

  test('07 - "Get Started" button functionality', async ({ page }) => {
    const getStartedBtn = page.locator('[data-nav="signup"]').first();

    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    await page.waitForTimeout(500);

    // Check if we navigated to signup page
    const signupContent = await page.content();
    const hasSignupForm = signupContent.includes('Create your account') ||
                         signupContent.includes('Sign up') ||
                         signupContent.includes('signup-form');

    console.log('✅ Get Started button clicked');
    console.log(`${hasSignupForm ? '✅' : '❌'} Signup form loaded: ${hasSignupForm}`);
  });

  test('08 - Check landing page content', async ({ page }) => {
    const content = await page.content();

    const checks = [
      { text: 'Property Analysis', name: 'Hero text' },
      { text: 'Get Started', name: 'CTA button' },
      { text: 'LUNTRA', name: 'Brand name' }
    ];

    checks.forEach(check => {
      const exists = content.includes(check.text);
      console.log(`${exists ? '✅' : '❌'} ${check.name}: ${exists}`);
    });
  });

  test('09 - Test "Run PropIQ" button (if visible)', async ({ page }) => {
    const runBtn = page.locator('#run-propiq-btn');
    const isVisible = await runBtn.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ Run PropIQ button found');
      await runBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ Run PropIQ button clicked');
    } else {
      console.log('ℹ️  Run PropIQ button not visible (may be on different page)');
    }
  });

  test('10 - Test login functionality', async ({ page }) => {
    // Navigate to login
    await page.locator('[data-nav="login"]').click();
    await page.waitForTimeout(500);

    // Check for login form
    const loginForm = page.locator('#login-form');
    const formExists = await loginForm.isVisible().catch(() => false);

    if (formExists) {
      console.log('✅ Login form visible');

      // Try filling out form
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="password"]', 'password123');

      console.log('✅ Login form fields filled');

      // Submit form
      await page.locator('#login-form button[type="submit"]').click();
      await page.waitForTimeout(1000);

      console.log('✅ Login form submitted');
    } else {
      console.log('❌ Login form not found');
    }
  });

  test('11 - Test signup functionality', async ({ page }) => {
    // Navigate to signup
    await page.locator('[data-nav="signup"]').click();
    await page.waitForTimeout(500);

    // Check for signup form
    const signupForm = page.locator('#signup-form');
    const formExists = await signupForm.isVisible().catch(() => false);

    if (formExists) {
      console.log('✅ Signup form visible');

      // Try filling out form
      await page.fill('[name="name"]', 'Test User');
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="password"]', 'password123');

      console.log('✅ Signup form fields filled');

      // Submit form
      await page.locator('#signup-form button[type="submit"]').click();
      await page.waitForTimeout(1000);

      console.log('✅ Signup form submitted');

      // Check if we're redirected to dashboard
      const url = page.url();
      console.log('Current URL:', url);
    } else {
      console.log('❌ Signup form not found');
    }
  });

  test('12 - Check local storage functionality', async ({ page }) => {
    // Test local storage access
    const canAccessStorage = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        return value === 'value';
      } catch (e) {
        return false;
      }
    });

    console.log(`${canAccessStorage ? '✅' : '❌'} LocalStorage accessible: ${canAccessStorage}`);
    expect(canAccessStorage).toBeTruthy();
  });

  test('13 - Comprehensive page state check', async ({ page }) => {
    await page.waitForTimeout(1000);

    const state = await page.evaluate(() => {
      return {
        luntraAppExists: typeof window.luntraApp !== 'undefined',
        mainContentExists: !!document.getElementById('main-content'),
        guestNavExists: !!document.getElementById('guest-nav'),
        authNavExists: !!document.getElementById('auth-nav'),
        dataNavElements: document.querySelectorAll('[data-nav]').length,
        hasClickListeners: document.querySelectorAll('[data-nav]')[0]?.onclick !== null ||
                          document.querySelectorAll('[data-nav]')[0]?.hasAttribute('href'),
        bodyClass: document.body.className,
        readyState: document.readyState
      };
    });

    console.log('\n📊 Page State:');
    console.log('  LuntraApp exists:', state.luntraAppExists ? '✅' : '❌');
    console.log('  Main content exists:', state.mainContentExists ? '✅' : '❌');
    console.log('  Guest nav exists:', state.guestNavExists ? '✅' : '❌');
    console.log('  Auth nav exists:', state.authNavExists ? '✅' : '❌');
    console.log('  Navigation elements:', state.dataNavElements);
    console.log('  Has click listeners:', state.hasClickListeners ? '✅' : '❌');
    console.log('  Document ready state:', state.readyState);

    expect(state.luntraAppExists).toBeTruthy();
    expect(state.mainContentExists).toBeTruthy();
  });

  test('14 - Test mobile menu functionality', async ({ page, isMobile }) => {
    if (isMobile) {
      const menuBtn = page.locator('#mobile-menu-btn');
      const isVisible = await menuBtn.isVisible().catch(() => false);

      if (isVisible) {
        await menuBtn.click();
        await page.waitForTimeout(300);
        console.log('✅ Mobile menu button clicked');
      }
    } else {
      console.log('ℹ️  Skipping mobile menu test (desktop viewport)');
    }
  });

  test('15 - Screenshot current state', async ({ page }) => {
    await page.screenshot({
      path: '/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq-static/screenshots/propiq-current-state.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved to screenshots/propiq-current-state.png');
  });
});

test.describe('PropIQ Functionality Deep Dive', () => {
  test('Debug - What happens on page load', async ({ page }) => {
    const logs: string[] = [];
    const errors: string[] = [];

    page.on('console', (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    console.log('\n📝 Console logs:');
    logs.forEach(log => console.log(`  ${log}`));

    if (errors.length > 0) {
      console.log('\n🚨 Errors:');
      errors.forEach(err => console.log(`  ${err}`));
    }

    // Get detailed app state
    const appState = await page.evaluate(() => {
      const app = (window as any).luntraApp;
      if (!app) return { error: 'LuntraApp not initialized' };

      return {
        currentPage: app.currentPage,
        trialUses: app.trialUses,
        maxTrialUses: app.maxTrialUses,
        isAuthenticated: app.isAuthenticated,
        userEmail: app.userEmail
      };
    });

    console.log('\n🔍 App State:', appState);
  });
});
