# PropIQ Testing Guide

Comprehensive testing strategy for the PropIQ platform with Convex backend.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Suites Overview](#test-suites-overview)
3. [Running Tests](#running-tests)
4. [Convex-Specific Testing](#convex-specific-testing)
5. [Chaos Engineering](#chaos-engineering)
6. [CI/CD Integration](#cicd-integration)
7. [Best Practices](#best-practices)

---

## Quick Start

### Prerequisites

```bash
# Ensure both servers are running
cd /Users/briandusape/Projects/LUNTRA/propiq

# Terminal 1: Start Convex dev server
CONVEX_DEPLOY_KEY="your-key" npx convex dev

# Terminal 2: Start frontend dev server
cd frontend && npm run dev
```

### Run All Tests

```bash
cd frontend

# Run all tests (headless)
npm test

# Run with browser visible
npm run test:headed

# Run with Playwright UI (interactive)
npm run test:ui
```

---

## Test Suites Overview

### 1. **Deployment Health Checks** (`deployment-health.spec.ts`)
- DNS resolution and network validation
- Backend API connectivity
- CORS configuration
- Authentication persistence (localStorage, sessionStorage, cookies)
- Critical user flows
- Error handling and resilience

**Run:** `npm run test:health`

### 2. **Convex Integration Tests** (`convex-integration.spec.ts`) ⭐ NEW
- Authentication flow (signup, login, JWT)
- Property analysis (core feature)
  - Usage limits enforcement
  - Database persistence
  - Analysis history loading
- Support chat
  - Message sending/receiving
  - Conversation persistence
- Stripe payment integration
  - Pricing tiers loading
  - Checkout flow
  - Webhook logging
- Real-time updates (WebSocket sync)
- Error handling
- Performance optimization

**Run:** `npm run test:convex`

### 3. **Chaos Engineering Tests** (`chaos-engineering.spec.ts`) ⭐ NEW
- **Network Chaos**
  - Intermittent failures
  - Slow network (3G simulation)
  - Random packet loss
  - DNS failures
- **API Chaos**
  - 500 Internal Server Errors
  - Rate limiting (429)
  - Malformed responses
  - Missing fields
  - Timeouts
- **Database Chaos**
  - Convex unavailability
  - Slow queries
  - Connection pool exhaustion
- **Authentication Chaos**
  - Expired JWT tokens
  - Token refresh failures
  - Concurrent login/logout
- **Browser Chaos**
  - localStorage quota exceeded
  - Rapid page reloads
  - Memory pressure
  - Browser extension interference
- **Stripe Payment Chaos**
  - Stripe API failures
  - Webhook delivery failures
  - Checkout abandonment
- **Race Conditions**
  - Concurrent API requests
  - State updates from multiple sources
- **Resource Exhaustion**
  - Usage limit testing
  - WebSocket connection limits
- **Recovery & Self-Healing**
  - Auto-reconnection
  - Retry mechanisms

**Run:** `npm run test:chaos`

### 4. **Visual Regression Tests** (`visual-regression.spec.ts`)
- Screenshot comparison
- UI consistency across browsers

**Run:** `npm run test:visual`

### 5. **Accessibility Tests** (`accessibility.spec.ts`)
- WCAG 2.1 compliance
- Screen reader support
- Keyboard navigation

### 6. **User Journey Tests** (`full-user-journey.spec.ts`)
- End-to-end user flows
- Multi-step scenarios

### 7. **Backend Integration** (`backend-deployment.spec.ts`)
- API endpoint validation
- Authentication flows

---

## Running Tests

### Development Testing

```bash
# Run specific test file
npm run test tests/convex-integration.spec.ts

# Run with browser visible (helpful for debugging)
npm run test:headed

# Run in interactive UI mode
npm run test:ui

# Debug mode (step through tests)
npm run test:debug
```

### Convex-Specific Tests

```bash
# Test all Convex backend integration
npm run test:convex

# Test with browser visible
npm run test:convex:headed

# Test specific Convex feature
npx playwright test -g "property analysis"
```

### Chaos Engineering Tests

```bash
# Run all chaos tests
npm run test:chaos

# Run specific chaos category
npx playwright test -g "Network Chaos"

# Run with browser visible to see failures
npm run test:chaos:headed
```

### Comprehensive Test Suites

```bash
# Run health + Convex + integration tests
npm run test:all

# Run chaos + health (resilience testing)
npm run test:resilience

# Run ALL tests (full suite)
npm test
```

### Production Testing

```bash
# Test against production
npm run test:production

# Visual regression on production
npm run test:visual

# Full production health check
PLAYWRIGHT_BASE_URL=https://luntra.one npm run test:health
```

---

## Convex-Specific Testing

### Testing Real-Time Sync

Convex provides real-time data synchronization via WebSockets. Test this by:

```typescript
test('data updates reflect immediately', async ({ context }) => {
  const page1 = await context.newPage();
  const page2 = await context.newPage();

  await page1.goto('http://localhost:5173');
  await page2.goto('http://localhost:5173');

  // Make change in page1
  // Verify it appears in page2 automatically
});
```

### Testing Usage Limits

```typescript
test('property analysis respects usage limits', async ({ page }) => {
  // Attempt to exceed free tier limit (3 analyses)
  for (let i = 0; i < 4; i++) {
    await analyzeProperty(page);
  }

  // 4th attempt should show upgrade prompt
  await expect(page.locator('text=upgrade')).toBeVisible();
});
```

### Testing Convex Functions Directly

For unit testing Convex functions, use Convex's test framework:

```typescript
// convex/propiq.test.ts
import { convexTest } from "convex-test";
import { api } from "./_generated/api";

test("analyzeProperty enforces usage limits", async () => {
  const t = convexTest();

  // Create test user with limit
  const userId = await t.mutation(api.auth.createUser, {
    email: "test@example.com",
    subscriptionTier: "free",
    analysesLimit: 3,
  });

  // Use all 3 analyses
  for (let i = 0; i < 3; i++) {
    await t.action(api.propiq.analyzeProperty, { userId, address: "123 Test St" });
  }

  // 4th should fail
  await expect(
    t.action(api.propiq.analyzeProperty, { userId, address: "456 Test Ave" })
  ).rejects.toThrow("Analysis limit reached");
});
```

### Monitoring Convex Performance

```typescript
test('Convex queries load within SLA', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('http://localhost:5173');
  await page.waitForSelector('[data-loaded="true"]');

  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(2000); // 2 second SLA
});
```

---

## Chaos Engineering

### Why Chaos Testing?

Chaos engineering helps you:
1. **Discover weaknesses** before users do
2. **Build confidence** in system resilience
3. **Prevent outages** by testing failure scenarios
4. **Improve incident response** through practice

### Chaos Testing Principles

1. **Hypothesis**: Define expected behavior under failure
2. **Inject Failure**: Simulate real-world problems
3. **Observe**: Monitor system response
4. **Learn**: Document findings and improve

### Example Chaos Test

```typescript
test('survives Convex database outage', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // HYPOTHESIS: App should show cached data when Convex is down

  // INJECT FAILURE: Block Convex
  await page.route('**/*.convex.cloud/**', route => route.abort());

  // OBSERVE: App should still render
  await expect(page.locator('body')).toBeVisible();

  // OBSERVE: User should see offline indicator
  await expect(page.locator('[data-status="offline"]')).toBeVisible();

  // LEARN: Document fallback behavior
});
```

### Chaos Testing Schedule

**Recommended frequency:**
- Development: Run chaos tests before every release
- Staging: Automated chaos tests nightly
- Production: Planned chaos drills quarterly (with monitoring)

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: PropIQ Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start Convex dev
        run: |
          CONVEX_DEPLOY_KEY=${{ secrets.CONVEX_DEPLOY_KEY }} npx convex dev &
          sleep 10

      - name: Run tests
        run: npm run test:all

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running health checks before commit..."
npm run test:health

if [ $? -ne 0 ]; then
  echo "❌ Health checks failed. Commit aborted."
  exit 1
fi

echo "✅ All checks passed!"
```

---

## Best Practices

### 1. Test Naming

```typescript
// ✅ Good: Descriptive, specific
test('user cannot analyze property after exceeding monthly limit', async ({ page }) => {

// ❌ Bad: Vague
test('test limits', async ({ page }) => {
```

### 2. Test Independence

```typescript
// ✅ Good: Each test is independent
test('signup creates user', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`; // Unique per test
});

// ❌ Bad: Tests depend on each other
let userId;
test('create user', async () => { userId = ...; });
test('use user', async () => { /* uses userId */ });
```

### 3. Assertions

```typescript
// ✅ Good: Clear assertion with context
await expect(page.locator('[data-testid="analysis-result"]'))
  .toContainText('Deal Score');

// ❌ Bad: Vague assertion
await expect(page.locator('div')).toBeVisible();
```

### 4. Waiting Strategies

```typescript
// ✅ Good: Wait for specific condition
await page.waitForSelector('[data-loaded="true"]');

// ❌ Bad: Arbitrary timeout
await page.waitForTimeout(5000);
```

### 5. Error Handling

```typescript
// ✅ Good: Graceful handling
const button = await page.locator('button').isVisible()
  .catch(() => false);

if (button) {
  await page.click('button');
} else {
  console.log('Button not found, skipping step');
}

// ❌ Bad: Test crashes on missing element
await page.click('button'); // Throws if not found
```

### 6. Test Data

```typescript
// ✅ Good: Generate unique test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: crypto.randomBytes(16).toString('hex'),
};

// ❌ Bad: Hardcoded data (causes conflicts)
const testUser = {
  email: 'test@example.com',
  password: 'password123',
};
```

### 7. Cleanup

```typescript
test('creates analysis', async ({ page }) => {
  // Create test data
  const analysisId = await createAnalysis();

  // Test
  await verifyAnalysis(analysisId);

  // Cleanup
  await deleteAnalysis(analysisId);
});
```

---

## Test Coverage Goals

### Current Coverage
- ✅ Frontend UI: ~80%
- ✅ API Integration: ~70%
- ✅ E2E Flows: ~60%
- ⭐ Convex Backend: ~50% (NEW)
- ⭐ Chaos/Resilience: ~40% (NEW)

### Coverage Targets (6 months)
- 🎯 Frontend UI: 90%
- 🎯 API Integration: 85%
- 🎯 E2E Flows: 75%
- 🎯 Convex Backend: 80%
- 🎯 Chaos/Resilience: 60%

---

## Debugging Failed Tests

### View Test Report

```bash
npm run test:report
```

### Run Single Test in Debug Mode

```bash
npx playwright test -g "property analysis" --debug
```

### Check Screenshots/Videos

Failed tests automatically capture:
- Screenshots: `test-results/*/test-failed-1.png`
- Videos: `test-results/*/video.webm`
- Traces: `test-results/*/trace.zip`

### View Trace

```bash
npx playwright show-trace test-results/.../trace.zip
```

---

## Monitoring & Alerts

### Continuous Monitoring

```bash
# Run tests every 5 minutes
npm run monitor

# Run once
npm run monitor:once
```

### Slack Notifications

```bash
# Test Slack webhook
npm run slack:test
```

### Post-Deployment Monitoring

```bash
# Start 24-hour monitoring after deploy
npm run monitor:post-deployment

# Run full test suite
npm run monitor:post-deployment:suite
```

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Convex Testing Guide](https://docs.convex.dev/testing)
- [Chaos Engineering Principles](https://principlesofchaos.org)
- [Web.dev Testing Guide](https://web.dev/testing)

---

## FAQ

**Q: How long do tests take to run?**
A:
- Health checks: ~30 seconds
- Convex integration: ~2 minutes
- Chaos engineering: ~5 minutes
- Full suite: ~10 minutes

**Q: Can I run tests in parallel?**
A: Yes! Playwright runs tests in parallel by default. Configure in `playwright.config.ts`:
```typescript
workers: process.env.CI ? 1 : 4
```

**Q: Do I need Convex dev running?**
A: Yes, for Convex integration tests. The `webServer` config in Playwright will auto-start the frontend, but you need to manually start Convex dev.

**Q: How do I test production?**
A: Set `PLAYWRIGHT_BASE_URL`:
```bash
PLAYWRIGHT_BASE_URL=https://luntra.one npm test
```

**Q: What if tests are flaky?**
A:
1. Check network conditions
2. Increase timeouts if needed
3. Use explicit waits instead of `waitForTimeout`
4. Enable retries in CI: `retries: 2`

---

**Last Updated:** 2025-11-18
**Maintained by:** PropIQ Team
**Questions?** Open an issue on GitHub
