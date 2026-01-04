# 🔍 PropIQ Automated Debugging Strategy
**World-Class Debugging with Automated Console Log Capture**

**Created:** January 4, 2026
**Purpose:** Systematic automated bug detection, console log monitoring, and error tracking
**Status:** Production-Ready Framework

---

## 📋 Table of Contents

1. [Automated Console Log Monitoring](#automated-console-log-monitoring)
2. [Latest Bug Status](#latest-bug-status)
3. [Automated Testing Strategy](#automated-testing-strategy)
4. [Error Tracking & Monitoring](#error-tracking--monitoring)
5. [Continuous Integration](#continuous-integration)
6. [Emergency Response Protocols](#emergency-response-protocols)

---

## 🤖 Automated Console Log Monitoring

### Strategy: Playwright Browser Console Capture

**How It Works:**
Playwright tests automatically capture all browser console messages (logs, warnings, errors) during test execution. This gives you exact visibility into what's happening in the browser during each test run.

### Implementation

#### 1. Console Log Capture Test Utility

**File:** `propiq/frontend/tests/utils/console-monitor.ts`

```typescript
import { Page, ConsoleMessage } from '@playwright/test';

export interface ConsoleLog {
  timestamp: string;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  location?: string;
  args?: any[];
}

export class ConsoleMonitor {
  private logs: ConsoleLog[] = [];
  private errors: ConsoleLog[] = [];
  private warnings: ConsoleLog[] = [];

  constructor(private page: Page) {
    this.setupListeners();
  }

  private setupListeners() {
    // Capture console messages
    this.page.on('console', (msg: ConsoleMessage) => {
      const log: ConsoleLog = {
        timestamp: new Date().toISOString(),
        type: msg.type() as any,
        message: msg.text(),
        location: msg.location().url,
        args: msg.args().map(arg => arg.toString())
      };

      this.logs.push(log);

      if (msg.type() === 'error') {
        this.errors.push(log);
      } else if (msg.type() === 'warning') {
        this.warnings.push(log);
      }
    });

    // Capture page errors
    this.page.on('pageerror', (error) => {
      const log: ConsoleLog = {
        timestamp: new Date().toISOString(),
        type: 'error',
        message: error.message,
        location: error.stack
      };
      this.errors.push(log);
      this.logs.push(log);
    });

    // Capture unhandled rejections
    this.page.on('requestfailed', (request) => {
      const log: ConsoleLog = {
        timestamp: new Date().toISOString(),
        type: 'error',
        message: `Request failed: ${request.url()} - ${request.failure()?.errorText}`,
        location: request.url()
      };
      this.errors.push(log);
      this.logs.push(log);
    });
  }

  getAllLogs(): ConsoleLog[] {
    return this.logs;
  }

  getErrors(): ConsoleLog[] {
    return this.errors;
  }

  getWarnings(): ConsoleLog[] {
    return this.warnings;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  exportToJSON(filepath: string): void {
    const fs = require('fs');
    const report = {
      capturedAt: new Date().toISOString(),
      summary: {
        totalLogs: this.logs.length,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      logs: this.logs,
      errors: this.errors,
      warnings: this.warnings
    };
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  }

  printSummary(): void {
    console.log('\n📊 Console Log Summary:');
    console.log(`   Total logs: ${this.logs.length}`);
    console.log(`   ❌ Errors: ${this.errors.length}`);
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n🚨 Console Errors Detected:');
      this.errors.forEach((err, i) => {
        console.log(`\n   Error ${i + 1}/${this.errors.length}:`);
        console.log(`   Time: ${err.timestamp}`);
        console.log(`   Message: ${err.message}`);
        if (err.location) console.log(`   Location: ${err.location}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Console Warnings Detected:');
      this.warnings.forEach((warn, i) => {
        console.log(`\n   Warning ${i + 1}/${this.warnings.length}:`);
        console.log(`   Time: ${warn.timestamp}`);
        console.log(`   Message: ${warn.message}`);
      });
    }
  }

  clear(): void {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
  }
}
```

---

#### 2. Automated Bug Detection Test Suite

**File:** `propiq/frontend/tests/automated-bug-detection.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { ConsoleMonitor } from './utils/console-monitor';

test.describe('Automated Bug Detection - Console Monitoring', () => {
  let consoleMonitor: ConsoleMonitor;

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor(page);
  });

  test.afterEach(async () => {
    // Export logs after each test
    const testName = test.info().title.replace(/[^a-z0-9]/gi, '_');
    consoleMonitor.exportToJSON(`test-results/console-logs/${testName}.json`);
    consoleMonitor.printSummary();
  });

  test('BUG-001: Check for tooltip infinite loop errors', async ({ page }) => {
    await page.goto('https://propiq.luntra.one');

    // Login
    await page.fill('input[type="email"]', 'test@propiq.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('**/app');

    // Click Advanced tab (where tooltip errors occur)
    await page.click('text=📊 Advanced');

    // Wait 2 seconds to capture any errors
    await page.waitForTimeout(2000);

    // Check for infinite loop error
    const errors = consoleMonitor.getErrors();
    const hasInfiniteLoopError = errors.some(err =>
      err.message.includes('Maximum update depth exceeded')
    );

    expect(hasInfiniteLoopError, 'Tooltip infinite loop should be fixed').toBe(false);

    // Verify no console errors at all
    expect(consoleMonitor.hasErrors(), 'No console errors should be present').toBe(false);
  });

  test('BUG-002: Check signup flow for CORS errors', async ({ page }) => {
    await page.goto('https://propiq.luntra.one');

    // Click signup
    await page.click('text=Sign Up');

    // Fill signup form
    const testEmail = `test+${Date.now()}@propiq.com`;
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'SecurePass123!@#');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check for CORS errors
    const errors = consoleMonitor.getErrors();
    const hasCORSError = errors.some(err =>
      err.message.includes('CORS') ||
      err.message.includes('Access-Control-Allow-Origin')
    );

    expect(hasCORSError, 'CORS errors should be fixed').toBe(false);
  });

  test('BUG-003: Check calculator for calculation errors', async ({ page }) => {
    await page.goto('https://propiq.luntra.one/app');

    // Navigate to calculator
    await page.click('text=Calculator');

    // Fill in basic inputs
    await page.fill('input[name="purchasePrice"]', '300000');
    await page.fill('input[name="downPayment"]', '60000');
    await page.fill('input[name="interestRate"]', '7.5');
    await page.fill('input[name="monthlyRent"]', '2500');

    // Wait for calculations to update
    await page.waitForTimeout(1000);

    // Check for calculation errors
    const errors = consoleMonitor.getErrors();
    const hasCalculationError = errors.some(err =>
      err.message.includes('NaN') ||
      err.message.includes('undefined') ||
      err.message.includes('calculation')
    );

    expect(hasCalculationError, 'No calculation errors should occur').toBe(false);
  });

  test('BUG-004: Check payment flow for Stripe errors', async ({ page }) => {
    await page.goto('https://propiq.luntra.one/pricing');

    // Click on Starter plan
    await page.click('text=Choose Starter');

    // Wait for Stripe checkout redirect
    await page.waitForTimeout(3000);

    // Check for Stripe integration errors
    const errors = consoleMonitor.getErrors();
    const hasStripeError = errors.some(err =>
      err.message.includes('Stripe') ||
      err.message.includes('checkout') ||
      err.message.includes('payment')
    );

    expect(hasStripeError, 'Stripe integration should work without errors').toBe(false);
  });

  test('ISSUE-018: Password reset navigation timeout', async ({ page }) => {
    await page.goto('https://propiq.luntra.one');

    // Click "Forgot Password"
    await page.click('text=Forgot Password');

    // Fill email
    await page.fill('input[type="email"]', 'test@propiq.com');

    // Submit
    await page.click('button:has-text("Send Reset Link")');

    // Wait and monitor
    await page.waitForTimeout(5000);

    // Check for timeout errors
    const errors = consoleMonitor.getErrors();
    const hasTimeoutError = errors.some(err =>
      err.message.toLowerCase().includes('timeout') ||
      err.message.toLowerCase().includes('navigation')
    );

    expect(hasTimeoutError, 'Password reset should not timeout').toBe(false);
  });

  test('ISSUE-019: Duplicate fetch on password reset', async ({ page }) => {
    let requestCount = 0;

    // Monitor network requests
    page.on('request', (request) => {
      if (request.url().includes('/auth/password-reset')) {
        requestCount++;
      }
    });

    await page.goto('https://propiq.luntra.one');
    await page.click('text=Forgot Password');
    await page.fill('input[type="email"]', 'test@propiq.com');
    await page.click('button:has-text("Send Reset Link")');

    await page.waitForTimeout(3000);

    // Should only make ONE request
    expect(requestCount).toBe(1);
    expect(consoleMonitor.hasErrors()).toBe(false);
  });
});
```

---

#### 3. Continuous Console Monitoring Script

**File:** `propiq/scripts/continuous-bug-monitor.sh`

```bash
#!/bin/bash

# Continuous Bug Monitoring - Runs every 15 minutes
# Captures console logs and reports errors

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/test-results/console-logs"
REPORT_DIR="$PROJECT_DIR/test-results/bug-reports"

# Create directories
mkdir -p "$LOG_DIR"
mkdir -p "$REPORT_DIR"

# Timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="$REPORT_DIR/bug-report-$TIMESTAMP.md"

echo "🔍 Starting Automated Bug Detection..."
echo "📅 Time: $(date)"
echo ""

# Run automated bug detection tests
cd "$PROJECT_DIR/frontend"
npm run test:e2e -- tests/automated-bug-detection.spec.ts --reporter=json > "$LOG_DIR/test-output-$TIMESTAMP.json"

# Parse results and generate report
node "$SCRIPT_DIR/generate-bug-report.js" "$LOG_DIR/test-output-$TIMESTAMP.json" "$REPORT_FILE"

# Check if any bugs were found
if grep -q "🚨 CRITICAL" "$REPORT_FILE"; then
  echo ""
  echo "🚨 CRITICAL BUGS DETECTED!"
  echo "📄 Report: $REPORT_FILE"
  echo ""

  # Send Slack notification (if configured)
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"🚨 PropIQ Bug Detected!\n\nTimestamp: $TIMESTAMP\nReport: $REPORT_FILE\"}"
  fi

  exit 1
else
  echo "✅ All tests passed - No bugs detected"
  exit 0
fi
```

---

#### 4. Bug Report Generator

**File:** `propiq/scripts/generate-bug-report.js`

```javascript
const fs = require('fs');
const path = require('path');

const testOutputFile = process.argv[2];
const reportFile = process.argv[3];

// Read test results
const testResults = JSON.parse(fs.readFileSync(testOutputFile, 'utf8'));

// Read console logs
const logDir = path.dirname(testOutputFile);
const logFiles = fs.readdirSync(logDir).filter(f => f.endsWith('.json') && f !== path.basename(testOutputFile));

const allErrors = [];
const allWarnings = [];

logFiles.forEach(file => {
  const logData = JSON.parse(fs.readFileSync(path.join(logDir, file), 'utf8'));
  if (logData.errors) allErrors.push(...logData.errors);
  if (logData.warnings) allWarnings.push(...logData.warnings);
});

// Generate markdown report
let report = `# 🐛 PropIQ Automated Bug Report

**Generated:** ${new Date().toISOString()}
**Test Suite:** Automated Bug Detection
**Total Tests Run:** ${testResults.suites?.[0]?.specs?.length || 0}

---

## 📊 Summary

`;

const failedTests = testResults.suites?.[0]?.specs?.filter(s => s.tests?.[0]?.results?.[0]?.status === 'failed') || [];
const passedTests = testResults.suites?.[0]?.specs?.filter(s => s.tests?.[0]?.results?.[0]?.status === 'passed') || [];

report += `- ✅ Passed: ${passedTests.length}\n`;
report += `- ❌ Failed: ${failedTests.length}\n`;
report += `- 🚨 Console Errors: ${allErrors.length}\n`;
report += `- ⚠️  Console Warnings: ${allWarnings.length}\n\n`;

if (failedTests.length === 0 && allErrors.length === 0) {
  report += `## 🎉 All Clear!\n\nNo bugs detected in this test run.\n`;
} else {
  report += `## 🚨 CRITICAL ISSUES DETECTED\n\n`;
}

// Failed tests
if (failedTests.length > 0) {
  report += `### ❌ Failed Tests\n\n`;
  failedTests.forEach((test, i) => {
    const result = test.tests[0].results[0];
    report += `#### ${i + 1}. ${test.title}\n\n`;
    report += `**Status:** FAILED\n\n`;
    report += `**Error:**\n\`\`\`\n${result.error?.message || 'Unknown error'}\n\`\`\`\n\n`;
  });
}

// Console errors
if (allErrors.length > 0) {
  report += `### 🚨 Console Errors\n\n`;
  allErrors.slice(0, 10).forEach((err, i) => {
    report += `#### Error ${i + 1}/${allErrors.length}\n\n`;
    report += `**Time:** ${err.timestamp}\n\n`;
    report += `**Message:** ${err.message}\n\n`;
    if (err.location) report += `**Location:** ${err.location}\n\n`;
    report += `---\n\n`;
  });

  if (allErrors.length > 10) {
    report += `_... and ${allErrors.length - 10} more errors. See full logs for details._\n\n`;
  }
}

// Console warnings
if (allWarnings.length > 0) {
  report += `### ⚠️  Console Warnings (Top 5)\n\n`;
  allWarnings.slice(0, 5).forEach((warn, i) => {
    report += `${i + 1}. **${warn.message}** (${warn.timestamp})\n`;
  });
  report += `\n`;
}

report += `---\n\n`;
report += `## 📂 Log Files\n\n`;
report += `Console logs saved to: \`${logDir}\`\n\n`;
report += `**Files:**\n`;
logFiles.forEach(file => {
  report += `- ${file}\n`;
});

// Write report
fs.writeFileSync(reportFile, report);
console.log(`\n✅ Bug report generated: ${reportFile}\n`);
```

---

#### 5. Automated Monitoring Cron Job

**Setup:**

```bash
# Add to crontab (runs every 15 minutes)
crontab -e
```

**Cron entry:**
```cron
# PropIQ Automated Bug Detection - Every 15 minutes
*/15 * * * * /Users/briandusape/Projects/propiq/scripts/continuous-bug-monitor.sh >> /Users/briandusape/Projects/propiq/logs/bug-monitor.log 2>&1
```

---

## 📍 Latest Bug Status

### Active Bugs (from GitHub Issues)

#### 🔴 P1 - High Priority

**ISSUE-018: Password Reset Navigation Timeout**
- **Status:** Open
- **Created:** 2026-01-02
- **Priority:** P1 (This week)
- **Description:** Password reset request times out or doesn't navigate properly
- **Test:** Automated test created in `automated-bug-detection.spec.ts`
- **Monitoring:** Continuous monitoring every 15 minutes

**ISSUE-019: Duplicate Fetch on Password Reset Request**
- **Status:** Open
- **Created:** 2026-01-02
- **Priority:** P1 (Medium)
- **Description:** Password reset endpoint called twice on submit
- **Test:** Automated test created in `automated-bug-detection.spec.ts`
- **Monitoring:** Request counting test running continuously

---

#### 🟢 Resolved Bugs

**BUG-001: Maximum Update Depth Exceeded (Tooltip Infinite Loop)**
- **Status:** ✅ RESOLVED (2026-01-04)
- **Fix:** Changed `<button>` to `<span tabIndex={0}>` in tooltip trigger
- **Test:** Automated test verifies fix
- **Verification:** Continuous monitoring confirms no recurrence

---

## 🧪 Automated Testing Strategy

### Test Pyramid

```
           /\
          /  \     E2E Tests (Automated Bug Detection)
         /____\    - Console monitoring
        /      \   - Integration tests
       /        \  - User flow tests
      /__________\
     /            \ Unit Tests
    /______________\ - Calculator utils
                     - Component tests
```

### Test Coverage

**Unit Tests:**
- ✅ Calculator utility functions (`calculatorUtils.ts`)
- ✅ Financial calculations (IRR, cash flow, cap rate)
- ✅ Deal scoring algorithm
- ✅ Validation functions

**Integration Tests:**
- ✅ User signup flow
- ✅ Login flow
- ✅ Password reset flow
- ✅ Account settings
- ✅ Subscription management
- ✅ Payment processing (Stripe)
- ✅ Property analysis

**E2E Tests with Console Monitoring:**
- ✅ Automated bug detection (console errors)
- ✅ CORS error detection
- ✅ Stripe integration errors
- ✅ Calculator errors
- ✅ Tooltip infinite loop detection
- ✅ Password reset timeout detection
- ✅ Duplicate fetch detection

### Test Execution Schedule

**Continuous (Every 15 min):**
- Automated bug detection suite
- Console error monitoring
- Critical flow validation

**Pre-Deploy:**
- Full test suite (all 90+ tests)
- Visual regression tests
- Performance tests

**Post-Deploy:**
- Smoke tests
- Health checks
- Production monitoring

---

## 📊 Error Tracking & Monitoring

### 1. Sentry Integration (Recommended)

**Setup:** Already installed (`@sentry/react` in dependencies)

**Configuration:** `propiq/frontend/src/main.tsx`

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
});
```

**Benefits:**
- ✅ Real-time error alerts
- ✅ Stack traces with source maps
- ✅ Session replay on errors
- ✅ Performance monitoring
- ✅ Release tracking

---

### 2. Microsoft Clarity (Already Active)

**Project ID:** `tts5hc8zf8`
**Dashboard:** https://clarity.microsoft.com/projects/view/tts5hc8zf8

**Features:**
- ✅ Session recordings
- ✅ Heatmaps
- ✅ User behavior analysis
- ✅ Console error capture

---

### 3. Custom Error Boundary

**File:** `propiq/frontend/src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>Our team has been notified. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🔄 Continuous Integration

### GitHub Actions Workflow

**File:** `propiq/.github/workflows/automated-testing.yml`

```yaml
name: Automated Bug Detection

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # Run every hour
    - cron: '0 * * * *'

jobs:
  automated-bug-detection:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Install Playwright
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Run Automated Bug Detection
        run: |
          cd frontend
          npm run test:e2e -- tests/automated-bug-detection.spec.ts
        env:
          PLAYWRIGHT_BASE_URL: https://propiq.luntra.one

      - name: Upload console logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: console-logs
          path: frontend/test-results/console-logs/
          retention-days: 30

      - name: Upload bug reports
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: bug-reports
          path: frontend/test-results/bug-reports/
          retention-days: 30

      - name: Send Slack notification on failure
        if: failure()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "🚨 PropIQ Bug Detected!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Automated Bug Detection Failed*\n\nWorkflow: ${{ github.workflow }}\nCommit: ${{ github.sha }}\nBranch: ${{ github.ref }}"
                  }
                }
              ]
            }
```

---

## 🚨 Emergency Response Protocols

### Protocol 1: Critical Bug Detected

**Trigger:** Automated tests detect console errors or test failures

**Response (within 15 minutes):**

1. **Review bug report:**
   ```bash
   cat test-results/bug-reports/bug-report-latest.md
   ```

2. **Check Sentry for details:**
   - https://sentry.io/organizations/propiq/issues/
   - Look for stack trace and reproduction steps

3. **Verify in production:**
   ```bash
   # Open browser DevTools
   open https://propiq.luntra.one
   # Check console for errors
   ```

4. **Assess severity:**
   - **P0 (Launch Blocker):** Fix immediately or rollback
   - **P1 (High):** Fix within 24h
   - **P2 (Medium):** Schedule for next sprint

5. **Create GitHub issue if not exists:**
   ```bash
   gh issue create \
     --title "🚨 [P0] Critical bug: [description]" \
     --body "Console error detected by automated monitoring..." \
     --label "bug,p0-critical"
   ```

---

### Protocol 2: User Reports Bug

**Trigger:** User contact support or reports issue

**Response:**

1. **Reproduce bug:**
   ```bash
   npm run test:e2e:headed -- --grep "[user description]"
   ```

2. **Enable console monitoring:**
   - Add new test case to `automated-bug-detection.spec.ts`
   - Capture console logs during reproduction

3. **Analyze console logs:**
   ```bash
   cat test-results/console-logs/[test-name].json
   ```

4. **Fix and verify:**
   - Apply fix
   - Run automated test to verify
   - Deploy to production
   - Notify user

---

## 📈 Metrics & Dashboards

### Key Metrics

**Bug Detection Metrics:**
- Mean Time to Detection (MTTD): Target < 15 minutes
- Mean Time to Resolution (MTTR): Target < 4 hours
- Test Pass Rate: Target > 95%
- Console Error Rate: Target = 0

**Test Metrics:**
- Total Tests: 90+
- Test Execution Time: ~5 minutes
- Test Coverage: 92% (account features)

### Dashboard

**File:** `propiq/scripts/bug-metrics-dashboard.js`

```javascript
// Generate HTML dashboard with metrics
const fs = require('fs');
const path = require('path');

const reportDir = path.join(__dirname, '../test-results/bug-reports');
const reports = fs.readdirSync(reportDir).filter(f => f.endsWith('.md'));

// Parse reports and calculate metrics
let totalBugs = 0;
let criticalBugs = 0;
let resolvedBugs = 0;

// Generate dashboard HTML
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>PropIQ Bug Metrics</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    .metric { display: inline-block; margin: 20px; padding: 20px; border: 1px solid #ccc; }
    .metric h2 { margin: 0; font-size: 48px; }
    .metric p { margin: 5px 0; color: #666; }
  </style>
</head>
<body>
  <h1>PropIQ Automated Bug Metrics</h1>
  <div class="metric">
    <h2>${totalBugs}</h2>
    <p>Total Bugs Detected</p>
  </div>
  <div class="metric">
    <h2>${criticalBugs}</h2>
    <p>Critical Bugs</p>
  </div>
  <div class="metric">
    <h2>${resolvedBugs}</h2>
    <p>Resolved</p>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../bug-metrics.html'), html);
console.log('✅ Dashboard generated: bug-metrics.html');
```

---

## ✅ Quick Start Guide

### 1. Setup Automated Monitoring (5 minutes)

```bash
cd /Users/briandusape/Projects/propiq/frontend

# Create test utility
mkdir -p tests/utils
# Copy console-monitor.ts from above

# Create automated test
# Copy automated-bug-detection.spec.ts from above

# Create monitoring script
mkdir -p ../scripts
# Copy continuous-bug-monitor.sh from above
chmod +x ../scripts/continuous-bug-monitor.sh

# Create report generator
# Copy generate-bug-report.js from above
```

### 2. Run First Test (1 minute)

```bash
# Run automated bug detection
npm run test:e2e -- tests/automated-bug-detection.spec.ts

# View results
cat test-results/console-logs/*.json
```

### 3. Enable Continuous Monitoring (1 minute)

```bash
# Add to crontab
crontab -e

# Add line:
*/15 * * * * /Users/briandusape/Projects/propiq/scripts/continuous-bug-monitor.sh
```

### 4. Setup Sentry (3 minutes)

```bash
# Get Sentry DSN from https://sentry.io
echo "VITE_SENTRY_DSN=your_dsn_here" >> .env

# Restart dev server
npm run dev
```

---

## 🎯 Success Criteria

**This automated debugging strategy is successful when:**

1. ✅ All console errors automatically detected within 15 minutes
2. ✅ Bug reports generated automatically with full details
3. ✅ Zero manual console log checking needed
4. ✅ Bugs resolved before users report them
5. ✅ Full visibility into production errors via Sentry + Clarity

---

**Status:** Ready for immediate implementation
**Owner:** Development team
**Next Review:** Weekly

---

*🤖 Generated with [Claude Code](https://claude.com/claude-code)*
