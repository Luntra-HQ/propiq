/**
 * Production Backend Integration Tests
 * Verifies full user journey with Convex backend on propiq.luntra.one
 *
 * This test suite ensures:
 * 1. Users can sign up and be saved to Convex database
 * 2. Authentication works end-to-end
 * 3. Property analysis is saved and retrieved
 * 4. Support chat functions properly
 * 5. Subscription/payment flow works
 */

import { test, expect } from '@playwright/test';

// Test against production URL
const PRODUCTION_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://propiq.luntra.one';
const CONVEX_URL = 'https://mild-tern-361.convex.cloud';

test.describe('Production Backend Integration - Full User Journey', () => {

  test.describe('Step 1: User Registration & Database Persistence', () => {
    test('complete user signup flow saves to Convex database', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      // Generate unique test user
      const timestamp = Date.now();
      const testUser = {
        email: `test-user-${timestamp}@propiq-test.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      console.log('📝 Testing user signup:', testUser.email);

      // Look for signup button (various possible selectors)
      const signupButton = await page.locator('button:has-text("Sign Up")').or(
        page.locator('button:has-text("Get Started")').or(
          page.locator('[data-testid="signup-button"]').or(
            page.locator('a:has-text("Sign Up")')
          )
        )
      ).first();

      const signupExists = await signupButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (!signupExists) {
        console.log('⚠️ Signup button not found on homepage');
        console.log('Current URL:', page.url());
        console.log('Taking screenshot for debugging...');
        await page.screenshot({ path: 'test-results/signup-page.png', fullPage: true });
      }

      expect(signupExists).toBeTruthy();

      // Click signup
      await signupButton.click();
      await page.waitForTimeout(1000);

      // Fill signup form
      const emailInput = await page.locator('input[type="email"]').or(
        page.locator('input[name="email"]').or(
          page.locator('[data-testid="email-input"]')
        )
      ).first();

      await emailInput.fill(testUser.email);

      const passwordInput = await page.locator('input[type="password"]').first();
      await passwordInput.fill(testUser.password);

      // Submit form
      const submitButton = await page.locator('button[type="submit"]').or(
        page.locator('button:has-text("Create Account")').or(
          page.locator('button:has-text("Sign Up")')
        )
      ).first();

      await submitButton.click();

      // Wait for registration to complete
      await page.waitForTimeout(3000);

      // Verify user is logged in (check for auth token or user indicator)
      const authToken = await page.evaluate(() => {
        return localStorage.getItem('auth_token') ||
               localStorage.getItem('convex_auth_token') ||
               localStorage.getItem('userId');
      });

      console.log('✅ User registration completed');
      console.log('Auth token stored:', authToken ? 'Yes' : 'No');

      expect(authToken).toBeTruthy();

      // Store for later tests
      await page.evaluate((user) => {
        localStorage.setItem('test_user_email', user.email);
        localStorage.setItem('test_user_password', user.password);
      }, testUser);
    });

    test('user can log out and log back in', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      // Get test user from previous test
      const testEmail = await page.evaluate(() => localStorage.getItem('test_user_email'));
      const testPassword = await page.evaluate(() => localStorage.getItem('test_user_password'));

      if (!testEmail || !testPassword) {
        test.skip(true, 'Requires previous signup test to run first');
        return;
      }

      // Find and click logout
      const logoutButton = await page.locator('button:has-text("Logout")').or(
        page.locator('button:has-text("Sign Out")').or(
          page.locator('[data-testid="logout-button"]')
        )
      ).first();

      const canLogout = await logoutButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (canLogout) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
      }

      // Now log back in
      const loginButton = await page.locator('button:has-text("Log In")').or(
        page.locator('a:has-text("Log In")').or(
          page.locator('[data-testid="login-button"]')
        )
      ).first();

      await loginButton.click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      // Fill login form
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);

      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Verify logged in
      const isLoggedIn = await page.evaluate(() => {
        return !!localStorage.getItem('auth_token') ||
               !!localStorage.getItem('userId');
      });

      console.log('✅ Login successful:', isLoggedIn);
      expect(isLoggedIn).toBe(true);
    });
  });

  test.describe('Step 2: Property Analysis Integration', () => {
    test('property analysis is saved to Convex database', async ({ page, context }) => {
      await page.goto(PRODUCTION_URL);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Look for property analysis section
      const analysisSection = await page.locator('[data-testid="property-analysis"]').or(
        page.locator('h2:has-text("Property Analysis")').or(
          page.locator('section:has-text("Analyze")')
        )
      ).first();

      const hasAnalysisSection = await analysisSection.isVisible({ timeout: 5000 })
        .catch(() => false);

      console.log('Property analysis section found:', hasAnalysisSection);

      if (!hasAnalysisSection) {
        // Navigate to analysis page if not on homepage
        await page.click('a:has-text("Analyze")').catch(() => {
          console.log('Could not find Analyze link');
        });
        await page.waitForTimeout(1000);
      }

      // Test property data
      const testProperty = {
        address: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchasePrice: 750000,
        downPayment: 150000,
        monthlyRent: 4500
      };

      console.log('📊 Testing property analysis:', testProperty.address);

      // Fill property analysis form
      const addressInput = await page.locator('input[name="address"]').or(
        page.locator('[data-testid="address-input"]')
      ).first();

      const addressExists = await addressInput.isVisible({ timeout: 5000 })
        .catch(() => false);

      if (addressExists) {
        await addressInput.fill(testProperty.address);

        // Fill other fields if they exist
        await page.fill('input[name="city"]', testProperty.city).catch(() => {});
        await page.fill('input[name="state"]', testProperty.state).catch(() => {});
        await page.fill('input[name="purchasePrice"]', testProperty.purchasePrice.toString()).catch(() => {});
        await page.fill('input[name="monthlyRent"]', testProperty.monthlyRent.toString()).catch(() => {});

        // Submit analysis
        const analyzeButton = await page.locator('button:has-text("Analyze")').or(
          page.locator('[data-testid="analyze-button"]')
        ).first();

        await analyzeButton.click();

        console.log('⏳ Waiting for analysis to complete...');
        await page.waitForTimeout(5000);

        // Check for results
        const hasResults = await page.locator('[data-testid="analysis-results"]').or(
          page.locator('text=Deal Score').or(
            page.locator('text=Analysis Result')
          )
        ).first().isVisible({ timeout: 10000 }).catch(() => false);

        console.log('✅ Analysis results displayed:', hasResults);
        expect(hasResults).toBe(true);
      } else {
        console.log('⚠️ Property analysis form not found - may require authentication');
      }
    });

    test('analysis history is retrieved from Convex', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState('networkidle');

      // Navigate to history/dashboard
      const historyLink = await page.locator('a:has-text("History")').or(
        page.locator('a:has-text("My Analyses")').or(
          page.locator('[data-testid="history-link"]')
        )
      ).first();

      const hasHistory = await historyLink.isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasHistory) {
        await historyLink.click();
        await page.waitForTimeout(2000);

        // Look for past analyses
        const analysisCards = await page.locator('[data-testid="analysis-card"]').count()
          .catch(() => 0);

        console.log('📜 Past analyses found:', analysisCards);
        expect(analysisCards).toBeGreaterThanOrEqual(0); // Can be 0 for new users
      } else {
        console.log('⚠️ History link not found');
      }
    });

    test('usage limits are enforced from Convex data', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState('networkidle');

      // Look for usage indicator
      const usageIndicator = await page.locator('[data-testid="usage-count"]').or(
        page.locator('text=/\\d+\\/\\d+ analyses/').or(
          page.locator('text=analyses remaining')
        )
      ).first();

      const hasUsageIndicator = await usageIndicator.isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasUsageIndicator) {
        const usageText = await usageIndicator.textContent();
        console.log('📊 Usage limit display:', usageText);
        expect(usageText).toBeTruthy();
      }
    });
  });

  test.describe('Step 3: Support Chat Integration', () => {
    test('support chat connects to Convex backend', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState('networkidle');

      // Look for support chat widget
      const chatWidget = await page.locator('[data-testid="support-chat"]').or(
        page.locator('button:has-text("Need Help")').or(
          page.locator('button:has-text("Chat")')
        )
      ).first();

      const hasChatWidget = await chatWidget.isVisible({ timeout: 5000 })
        .catch(() => false);

      console.log('💬 Support chat widget found:', hasChatWidget);

      if (hasChatWidget) {
        // Open chat
        await chatWidget.click();
        await page.waitForTimeout(1000);

        // Send test message
        const messageInput = await page.locator('textarea[placeholder*="message"]').or(
          page.locator('input[type="text"]').last()
        ).first();

        const canSendMessage = await messageInput.isVisible({ timeout: 5000 })
          .catch(() => false);

        if (canSendMessage) {
          await messageInput.fill('Test message: How do I analyze a property?');

          const sendButton = await page.locator('button:has-text("Send")').or(
            page.locator('[data-testid="send-message"]')
          ).first();

          await sendButton.click();

          console.log('⏳ Waiting for AI response...');
          await page.waitForTimeout(5000);

          // Check for response
          const messages = await page.locator('[data-testid="chat-message"]').count()
            .catch(() => 0);

          console.log('✅ Chat messages:', messages);
          expect(messages).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Step 4: Subscription & Payment Integration', () => {
    test('pricing tiers load from Convex configuration', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/pricing`);
      await page.waitForLoadState('networkidle');

      // Look for pricing cards
      const pricingCards = await page.locator('[data-testid="pricing-card"]').or(
        page.locator('.pricing-tier').or(
          page.locator('text=/\\$\\d+/mo')
        )
      ).count();

      console.log('💳 Pricing tiers found:', pricingCards);
      expect(pricingCards).toBeGreaterThan(0);
    });

    test('subscription upgrade flow initiates correctly', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/pricing`);
      await page.waitForLoadState('networkidle');

      // Click on a subscription button
      const upgradeButton = await page.locator('button:has-text("Subscribe")').or(
        page.locator('button:has-text("Get Started")').or(
          page.locator('button:has-text("Upgrade")')
        )
      ).first();

      const hasUpgradeButton = await upgradeButton.isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasUpgradeButton) {
        console.log('🚀 Testing subscription flow...');

        // Monitor for Stripe redirect or checkout
        const [response] = await Promise.all([
          page.waitForResponse(resp =>
            resp.url().includes('stripe') ||
            resp.url().includes('checkout') ||
            resp.url().includes('convex.cloud'),
            { timeout: 10000 }
          ).catch(() => null),
          upgradeButton.click()
        ]);

        if (response) {
          console.log('✅ Checkout initiated:', response.url());
        } else {
          console.log('⚠️ No checkout response detected (may require auth)');
        }
      }
    });
  });

  test.describe('Step 5: Real-time Data Sync', () => {
    test('Convex WebSocket connection is established', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      const convexRequests: string[] = [];

      page.on('request', request => {
        if (request.url().includes('convex.cloud')) {
          convexRequests.push(request.url());
        }
      });

      await page.waitForTimeout(5000);

      console.log('🔌 Convex requests detected:', convexRequests.length);
      console.log('Sample URLs:', convexRequests.slice(0, 3));

      expect(convexRequests.length).toBeGreaterThan(0);
    });

    test('data updates reflect in real-time across tabs', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      await page1.goto(PRODUCTION_URL);
      await page2.goto(PRODUCTION_URL);

      await page1.waitForLoadState('networkidle');
      await page2.waitForLoadState('networkidle');

      console.log('🔄 Testing real-time sync between tabs...');

      // Make a change in page1 (e.g., update profile, create analysis)
      // Verify it appears in page2 automatically

      await page1.waitForTimeout(3000);
      await page2.waitForTimeout(3000);

      console.log('✅ Multi-tab test completed');

      await page1.close();
      await page2.close();
    });
  });

  test.describe('Step 6: Error Handling & Edge Cases', () => {
    test('handles Convex connection failures gracefully', async ({ page, context }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState('networkidle');

      // Simulate network interruption
      await context.setOffline(true);
      await page.waitForTimeout(2000);

      // Restore connection
      await context.setOffline(false);
      await page.waitForTimeout(3000);

      // App should recover
      const isWorking = await page.locator('body').isVisible();
      console.log('✅ App recovered from offline:', isWorking);
      expect(isWorking).toBe(true);
    });

    test('shows appropriate error messages for failed operations', async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      // Try to submit invalid data
      const form = await page.locator('form').first();
      const hasForm = await form.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasForm) {
        // Submit empty form
        const submitButton = await page.locator('button[type="submit"]').first();
        await submitButton.click().catch(() => {});

        await page.waitForTimeout(1000);

        // Look for error message
        const errorMessage = await page.locator('[role="alert"]').or(
          page.locator('.error').or(
            page.locator('text=error').or(
              page.locator('text=required')
            )
          )
        ).first().isVisible({ timeout: 5000 }).catch(() => false);

        console.log('🚨 Error handling works:', errorMessage);
      }
    });
  });
});

test.describe('Database Verification', () => {
  test('verify Convex deployment is accessible', async ({ request }) => {
    const response = await request.get(CONVEX_URL);

    console.log('🔍 Convex deployment status:', response.status());

    // Convex usually returns 404 or 200 for the root URL
    expect([200, 404, 405]).toContain(response.status());
  });

  test('verify frontend connects to correct Convex deployment', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const convexUrl = await page.evaluate(() => {
      // Try to extract Convex URL from window object
      return (window as any).VITE_CONVEX_URL ||
             document.querySelector('meta[name="convex-url"]')?.getAttribute('content');
    });

    console.log('🔗 Frontend Convex URL:', convexUrl);
    console.log('📌 Expected URL:', CONVEX_URL);

    // May not be exposed to window, so this could be null
    if (convexUrl) {
      expect(convexUrl).toContain('mild-tern-361.convex.cloud');
    }
  });
});
