# 🚀 PropIQ Automated Debugging - Quick Start Guide

**Get up and running with automated console log monitoring in 5 minutes**

---

## ✅ What You're Getting

**Automated debugging system that:**
- ✅ Captures all browser console errors automatically
- ✅ Monitors 7 critical bugs including ISSUE-018 and ISSUE-019
- ✅ Generates detailed bug reports with timestamps and stack traces
- ✅ Can run continuously every 15 minutes
- ✅ Sends Slack notifications on critical bugs (optional)
- ✅ Integrates with Sentry for production monitoring

---

## 📦 Files Created

```
propiq/
├── frontend/
│   ├── tests/
│   │   ├── automated-bug-detection.spec.ts  ✨ Main test suite
│   │   └── utils/
│   │       └── console-monitor.ts            ✨ Console capture utility
│   └── package.json                          ✨ Updated with new scripts
├── scripts/
│   ├── continuous-bug-monitor.sh             ✨ Monitoring script
│   ├── generate-bug-report.js                ✨ Report generator
│   └── setup-automated-debugging.sh          ✨ Setup script
├── AUTOMATED_DEBUGGING_STRATEGY.md           📚 Full documentation
└── DEBUGGING_QUICK_START.md                  📚 This file
```

---

## 🏃 Quick Start (5 Minutes)

### Step 1: Setup (1 minute)

```bash
cd /Users/briandusape/Projects/propiq
bash scripts/setup-automated-debugging.sh
```

This will:
- Create all necessary directories
- Make scripts executable
- Verify Playwright installation
- Run your first automated bug detection test

---

### Step 2: Run Manual Test (1 minute)

```bash
cd frontend
npm run test:bugs
```

**What this does:**
- Runs 7 automated bug detection tests
- Captures all console logs, errors, and warnings
- Saves results to `test-results/console-logs/`
- Prints summary to terminal

**Example output:**
```
📊 Console Log Summary:
   Total logs: 42
   ❌ Errors: 0
   ⚠️  Warnings: 3

✅ All tests passed - No bugs detected
```

---

### Step 3: View Console Logs (1 minute)

```bash
# View latest console log
cat frontend/test-results/console-logs/*.json | tail -50

# Or view in formatted JSON
cat frontend/test-results/console-logs/bug-001_check_for_tooltip_infinite_loop_errors.json | jq .
```

**Log file structure:**
```json
{
  "capturedAt": "2026-01-04T12:30:00.000Z",
  "summary": {
    "totalLogs": 42,
    "errors": 0,
    "warnings": 3
  },
  "errors": [],
  "warnings": [
    {
      "timestamp": "2026-01-04T12:30:15.234Z",
      "type": "warning",
      "message": "React DevTools warning...",
      "location": "https://propiq.luntra.one/app"
    }
  ]
}
```

---

### Step 4: Enable Continuous Monitoring (2 minutes)

**Option A: Cron Job (Recommended)**

```bash
# Edit crontab
crontab -e

# Add this line (runs every 15 minutes)
*/15 * * * * /Users/briandusape/Projects/propiq/scripts/continuous-bug-monitor.sh >> /Users/briandusape/Projects/propiq/logs/bug-monitor.log 2>&1
```

**Option B: Manual Runs**

```bash
# Run monitoring script once
npm run monitor:bugs

# Or use the script directly
bash scripts/continuous-bug-monitor.sh
```

---

## 🧪 Available Test Commands

**Basic:**
```bash
npm run test:bugs              # Run all bug detection tests
npm run test:bugs:headed       # Run with visible browser
npm run test:bugs:ui           # Run with Playwright UI
```

**Monitoring:**
```bash
npm run monitor:bugs           # Run continuous monitoring once
npm run setup:debugging        # Re-run setup script
```

**Individual Bug Tests:**
```bash
# Test specific bug
npx playwright test tests/automated-bug-detection.spec.ts --grep "BUG-001"

# Test ISSUE-018 (Password reset timeout)
npx playwright test tests/automated-bug-detection.spec.ts --grep "ISSUE-018"

# Test ISSUE-019 (Duplicate fetch)
npx playwright test tests/automated-bug-detection.spec.ts --grep "ISSUE-019"
```

---

## 📋 What Bugs Are Monitored?

### ✅ Currently Monitored (7 tests)

1. **BUG-001:** Tooltip infinite loop errors
   - Checks for "Maximum update depth exceeded"
   - Status: Fixed (monitoring for regression)

2. **BUG-002:** CORS errors on signup
   - Checks for "Access-Control-Allow-Origin" errors
   - Critical for user onboarding

3. **BUG-003:** Calculator calculation errors
   - Checks for NaN, undefined in calculations
   - Critical for core functionality

4. **BUG-004:** Stripe payment integration errors
   - Checks for checkout failures
   - Critical for revenue

5. **ISSUE-018:** Password reset navigation timeout
   - Checks for timeout errors
   - Priority: P1 (High)

6. **ISSUE-019:** Duplicate fetch on password reset
   - Counts API requests (should be exactly 1)
   - Priority: P1 (Medium)

7. **General Health Check:** Homepage console errors
   - Ensures zero console errors on landing page
   - Critical for first impressions

---

## 📊 Reading Console Logs

### Log Location

All console logs are saved to:
```
frontend/test-results/console-logs/
```

### Log File Naming

```
bug-001_check_for_tooltip_infinite_loop_errors.json
bug-002_check_signup_flow_for_cors_errors.json
issue-018_password_reset_navigation_timeout.json
general_health_check_no_console_errors_on_homepage.json
```

### Understanding the Output

**When tests PASS:**
```
✅ All tests passed - No bugs detected

📊 Console Log Summary:
   Total logs: 15
   ❌ Errors: 0
   ⚠️  Warnings: 2
```

**When tests FAIL:**
```
🚨 CRITICAL BUGS DETECTED!
📄 Report: test-results/bug-reports/bug-report-2026-01-04_12-30-00.md

🚨 Console Errors Detected:

   Error 1/3:
   Time: 2026-01-04T12:30:15.234Z
   Message: Maximum update depth exceeded
   Location: https://propiq.luntra.one/app
```

---

## 🚨 Bug Reports

### Location

Bug reports are auto-generated at:
```
frontend/test-results/bug-reports/
```

### Report Format

Each report includes:
- **Summary:** Pass/fail counts, error counts
- **Failed Tests:** Detailed error messages and stack traces
- **Console Errors:** Top 10 errors with timestamps
- **Console Warnings:** Top 5 warnings
- **Log Files:** Links to full console logs

**Example:**
```markdown
# 🐛 PropIQ Automated Bug Report

**Generated:** 2026-01-04T12:30:00.000Z
**Test Suite:** Automated Bug Detection

## 📊 Summary

- ✅ Passed: 6
- ❌ Failed: 1
- 🚨 Console Errors: 3
- ⚠️  Warnings: 2

## 🚨 CRITICAL ISSUES DETECTED

### ❌ Failed Tests

#### 1. BUG-001: Check for tooltip infinite loop errors

**Status:** FAILED

**Error:**
```
Error: Tooltip infinite loop should be fixed
```
```

---

## 🔧 Advanced Configuration

### Add Slack Notifications

```bash
# Set Slack webhook URL
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Run monitoring
npm run monitor:bugs
```

Now you'll get Slack alerts when bugs are detected!

---

### Add Sentry for Production Errors

```bash
# 1. Sign up at https://sentry.io
# 2. Create new project "PropIQ"
# 3. Get your DSN

# 4. Add to .env
echo "VITE_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id" >> .env

# 5. Restart dev server
npm run dev
```

Sentry is already installed in `package.json` - just needs configuration!

---

## 🎯 Troubleshooting

### "Playwright not found"

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install --with-deps
```

---

### "Permission denied" when running scripts

```bash
chmod +x scripts/*.sh
```

---

### Console logs not being captured

Check that `ConsoleMonitor` is initialized in test:

```typescript
let consoleMonitor: ConsoleMonitor;

test.beforeEach(async ({ page }) => {
  consoleMonitor = new ConsoleMonitor(page); // ✅ This line is critical
});
```

---

### Tests timing out

Increase timeout in test:

```typescript
test('My test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

---

## 📚 Full Documentation

For complete details, see:
- `AUTOMATED_DEBUGGING_STRATEGY.md` - Full strategy and architecture
- `DEBUGGING_STRATEGY.md` - Original debugging approach
- `BUG_LOG.md` - All historical bugs and fixes

---

## ✅ Success Checklist

**You're ready when:**

- [x] Setup script completed successfully
- [x] `npm run test:bugs` runs without errors
- [x] Console logs appear in `test-results/console-logs/`
- [x] Bug reports generate in `test-results/bug-reports/`
- [x] Cron job scheduled (optional)
- [x] Sentry configured (optional)

---

## 🎉 Next Steps

**Now that automated debugging is set up:**

1. **Run before every deploy:**
   ```bash
   npm run test:bugs
   ```

2. **Check logs daily:**
   ```bash
   cat frontend/test-results/console-logs/*.json | jq '.summary'
   ```

3. **Review bug reports weekly:**
   ```bash
   ls -lt frontend/test-results/bug-reports/ | head
   ```

4. **Add custom bug tests** to `automated-bug-detection.spec.ts`:
   ```typescript
   test('MY-BUG: Description', async ({ page }) => {
     // Your test here
   });
   ```

---

## 💡 Pro Tips

**Tip 1: Run on CI/CD**
Add to GitHub Actions to catch bugs before they hit production!

**Tip 2: Monitor Production**
Run tests against `https://propiq.luntra.one` to catch live issues.

**Tip 3: Export Logs**
```bash
# Export all logs to single JSON file
jq -s '.' test-results/console-logs/*.json > all-logs.json
```

**Tip 4: Search Logs**
```bash
# Find all errors
jq '.errors[]' test-results/console-logs/*.json

# Find specific error
grep -r "CORS" test-results/console-logs/
```

---

## 📞 Support

**Issues?**
- Check `AUTOMATED_DEBUGGING_STRATEGY.md` for detailed docs
- Review `BUG_LOG.md` for similar issues
- Create GitHub issue with console log attached

---

**Last Updated:** January 4, 2026
**Version:** 1.0.0
**Status:** Production Ready

---

*🤖 Generated with [Claude Code](https://claude.com/claude-code)*
