
import { test, expect } from '@playwright/test';

// Configuration for API URL, defaulting to local backend
const API_BASE = process.env.VITE_API_URL || 'http://localhost:8000';

test.describe('AI Component Removal Verification', () => {

    test('Backend: Verify /analyze endpoint is removed (404)', async ({ request }) => {
        // Attempt to call the analyzed endpoint. It should now return 404 (Not Found).
        // Previously it was POST /api/v1/propiq/analyze
        const response = await request.post(`${API_BASE}/api/v1/propiq/analyze`, {
            data: {
                address: '123 Test St, Test City, TS 12345',
                propertyType: 'single_family'
            }
        });

        // Check that the router was successfully removed
        expect(response.status(), 'Analyze endpoint should return 404').toBe(404);
    });

    test('Frontend: Dashboard should not show AI Analysis widgets', async ({ page }) => {
        // 1. Mock Authentication
        // We mock the Convex auth endpoint to return a signed-in user.
        // The endpoint path ends with /auth/me
        await page.route('**/auth/me', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    authenticated: true,
                    user: {
                        _id: 'mock_user_123',
                        email: 'tester@propiq.com',
                        firstName: 'Test',
                        lastName: 'User',
                        subscriptionTier: 'starter',
                        analysesUsed: 0,
                        analysesLimit: 20,
                        active: true,
                        emailVerified: true
                    }
                })
            });
        });

        // Mock any other potentially called endpoints to avoid network errors
        // E.g. usage stats or recent analyses, if they were still being called (they shouldn't be)
        await page.route('**/propiq/analyses*', async route => {
            await route.fulfill({ status: 404 });
        });

        // 2. Set Session Token
        // We inject the session token so the useAuth hook attempts to fetch the user
        await page.addInitScript(() => {
            localStorage.setItem('propiq_session_token', 'mock_valid_token');
        });

        // 3. Navigate to Dashboard
        await page.goto('/app');

        // 4. Verify Dashboard Loaded
        // "Deal Calculator" is the key permanent component remaining. Use exact: true to avoid matching "Unlimited Deal Calculator"
        await expect(page.getByRole('heading', { name: 'Deal Calculator', exact: true })).toBeVisible({ timeout: 10000 });

        // 5. Verify AI Components are GONE
        // These texts correspond to the HeroPropIQCard that was removed
        await expect(page.getByText('PropIQ AI Analysis')).not.toBeVisible();
        await expect(page.getByText('Analyze a Property')).not.toBeVisible();

        // "Properties Analyzed" stat card should be gone
        await expect(page.getByText('Properties Analyzed', { exact: true })).not.toBeVisible();

        // Verify "Upgrade to Continue" (from lock state) is not there
        await expect(page.getByText('Upgrade to Continue')).not.toBeVisible();

        // Verify the "Analyze" button is not present
        const analyzeButton = page.getByRole('button', { name: 'Analyze' });
        if (await analyzeButton.count() > 0) {
            await expect(analyzeButton).not.toBeVisible();
        }

        console.log('✅ AI Analysis components successfully verified as removed.');
    });
});
