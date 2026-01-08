# PropIQ UAT Testing Guide

**Last Updated:** January 5, 2026
**Created by:** Claude Code (World-Class CTO Session)

---

## 📋 Quick Start

### Files in This UAT Package
1. **UAT_TEST_MATRIX.csv** - 92 test cases ready to execute
2. **UAT_GUIDE.md** - This file (instructions)

### How to Open the Test Matrix

**Option 1: Excel**
```bash
# From Mac Finder
open UAT_TEST_MATRIX.csv

# Excel will auto-import with commas as delimiters
```

**Option 2: Google Sheets**
1. Go to sheets.google.com
2. File → Import → Upload → Select UAT_TEST_MATRIX.csv
3. Import settings: Comma separator, Auto-detect

**Option 3: Numbers (Mac)**
```bash
open -a Numbers UAT_TEST_MATRIX.csv
```

---

## 🎯 Test Matrix Structure

### Columns Explained

| Column | Purpose | How to Use |
|--------|---------|------------|
| **Test ID** | Unique identifier (UAT-001, UAT-002, etc.) | Reference in bug reports |
| **Priority** | P0 (critical), P1 (high), P2 (medium), P3 (low) | Execute P0 first |
| **Feature Area** | Category (Revenue Flow, Auth, Calculator, etc.) | Group related tests |
| **Test Scenario** | What you're testing | Read this first |
| **Pre-conditions** | Setup required | Do this before testing |
| **Test Steps** | Numbered steps to execute | Follow exactly |
| **Expected Results** | What should happen | Compare with actual |
| **Actual Results** | What actually happened | **YOU FILL THIS IN** |
| **Status** | PASS / FAIL / BLOCKED / SKIP | **YOU FILL THIS IN** |
| **Bug ID** | Link to GitHub issue | Create issue if FAIL |
| **Tester** | Your name | Track who tested what |
| **Date** | When tested | Track progress |
| **Notes** | Additional observations | Optional details |

---

## 📊 Test Breakdown by Priority

### P0 - Revenue Critical (Must Pass 100%)
**20 test cases** - Days 1-2

Focus areas:
- UAT-001 to UAT-007: Signup → Paywall → Stripe checkout
- UAT-008 to UAT-015: Authentication & password reset
- UAT-016 to UAT-020: PropIQ AI analysis core functionality

**⚠️ If ANY P0 test fails, DO NOT LAUNCH.**

---

### P1 - Core Features (Must Pass 95%+)
**32 test cases** - Days 3-5

Focus areas:
- UAT-021 to UAT-025: Subscription tier management
- UAT-026 to UAT-032: Deal Calculator accuracy
- UAT-033 to UAT-037: Dashboard & navigation
- UAT-038 to UAT-042: Mobile responsiveness
- UAT-071 to UAT-074: Cross-browser compatibility

**⚠️ Fix critical P1 bugs before launch.**

---

### P2 - User Experience (Must Pass 80%+)
**28 test cases** - Days 6-8

Focus areas:
- UAT-043 to UAT-048: Onboarding & product tour
- UAT-049 to UAT-055: Help Center
- UAT-056 to UAT-059: Support chat
- UAT-060 to UAT-064: Email communications
- UAT-075 to UAT-081: Performance & accessibility

**ℹ️ Can launch with minor P2 issues; fix post-launch.**

---

### P3 - Nice-to-Have (Best Effort)
**12 test cases** - Days 9-10

Focus areas:
- UAT-065 to UAT-070: Analytics & monitoring
- UAT-082 to UAT-085: Security edge cases
- UAT-086 to UAT-092: Edge cases & regression

**ℹ️ Fix if time permits; track as tech debt.**

---

## 🚀 Execution Strategy

### Week 1: Critical Path (P0 + P1)

**Day 1: Revenue Flow (P0)**
```bash
# Test UAT-001 to UAT-007
# Focus: Signup → Trial → Paywall → Stripe

Priority: Get ONE user through full conversion flow
Goal: Prove the money works
```

**Day 2: Authentication (P0)**
```bash
# Test UAT-008 to UAT-015
# Focus: Login, logout, password reset, sessions

Priority: Security and access control
Goal: Users can reliably access their accounts
```

**Day 3: PropIQ Analysis (P0)**
```bash
# Test UAT-016 to UAT-020
# Focus: AI analysis core product

Priority: The reason users pay you
Goal: Analysis is accurate and fast
```

**Day 4: Calculator + Subscriptions (P1)**
```bash
# Test UAT-021 to UAT-032
# Focus: Deal Calculator accuracy, tier upgrades

Priority: Secondary revenue driver
Goal: Calculator = trusted tool
```

**Day 5: Mobile + Cross-Browser (P1)**
```bash
# Test UAT-038 to UAT-042, UAT-071 to UAT-074
# Focus: Responsiveness, compatibility

Priority: 60%+ users are mobile
Goal: Works everywhere
```

---

### Week 2: Polish & Validation (P2 + P3)

**Day 6-7: UX & Onboarding (P2)**
```bash
# Test UAT-043 to UAT-064
# Focus: First-use experience, help system, emails

Priority: Reduce churn, improve NPS
Goal: Users succeed on their own
```

**Day 8: Performance & Accessibility (P2)**
```bash
# Test UAT-075 to UAT-081
# Focus: Speed, WCAG compliance

Priority: SEO + inclusivity
Goal: Fast and accessible
```

**Day 9: Security & Edge Cases (P3)**
```bash
# Test UAT-082 to UAT-090
# Focus: Attack vectors, unusual inputs

Priority: Sleep well at night
Goal: No critical vulnerabilities
```

**Day 10: Regression & Sign-off**
```bash
# Test UAT-091 to UAT-092
# Run all Playwright tests
# Final go/no-go decision
```

---

## ✅ How to Execute Tests

### Step-by-Step Process

1. **Pick a Test Case**
   - Start with UAT-001 (first P0 test)
   - Read "Test Scenario" to understand goal

2. **Check Pre-conditions**
   - Ensure setup is correct
   - Create test accounts if needed

3. **Follow Test Steps**
   - Execute steps exactly as written
   - Don't skip steps

4. **Compare Results**
   - Read "Expected Results" line by line
   - Check if each ✓ criterion is met

5. **Record Outcome**
   - **Actual Results:** What actually happened (be specific!)
   - **Status:**
     - `PASS` - All expected results met
     - `FAIL` - One or more criteria not met
     - `BLOCKED` - Cannot test (dependency broken)
     - `SKIP` - Intentionally skipped (document why)

6. **Log Bugs** (if FAIL)
   - Create GitHub issue with Test ID in title
   - Example: `[UAT-003] Stripe checkout fails on Safari`
   - Include:
     - Test ID
     - Steps to reproduce
     - Expected vs actual
     - Screenshots/video
   - Copy GitHub issue number to "Bug ID" column

7. **Fill Metadata**
   - **Tester:** Your name
   - **Date:** Today's date
   - **Notes:** Any observations

---

## 🐛 Bug Reporting Template

When you find a bug, create a GitHub issue with this format:

```markdown
# [UAT-XXX] Brief Description

**Test Case:** UAT-XXX - Test Scenario Name
**Priority:** P0 / P1 / P2 / P3
**Severity:** Critical / High / Medium / Low

## Steps to Reproduce
1. Navigate to...
2. Click...
3. Enter...
4. Submit...

## Expected Result
✓ Should do X
✓ Should show Y
✓ Should update Z

## Actual Result
❌ Did not do X
❌ Error message: "..."
❌ Z not updated

## Environment
- Browser: Chrome 120.0.6099.129
- Device: MacBook Pro M1
- OS: macOS 14.2
- User: test@propiq.com (Starter tier)

## Screenshots/Video
[Attach here]

## Additional Notes
[Any other relevant info]
```

---

## 📸 Documentation Tips

### What to Capture

**For PASS:**
- Screenshot of final success state
- Note completion time

**For FAIL:**
- Screenshot of error
- Browser console errors (F12 → Console)
- Network tab for failed requests (F12 → Network)
- Video recording if complex (Loom recommended)

### Tools
- **Mac:** Cmd+Shift+4 (screenshot), Cmd+Shift+5 (screen recording)
- **Windows:** Win+Shift+S (screenshot), Win+G (recording)
- **Loom:** https://loom.com (for video walkthrough)

---

## 🧪 Test Accounts

### Create These Test Users

```bash
# Free Tier User
Email: test-free@propiq.com
Password: TestUser123!
Analyses: 3/3 remaining

# Starter Tier User
Email: test-starter@propiq.com
Password: TestUser123!
Analyses: 20/20 remaining
Stripe: Active subscription

# Pro Tier User
Email: test-pro@propiq.com
Password: TestUser123!
Analyses: 100/100 remaining
Stripe: Active subscription

# Elite Tier User
Email: test-elite@propiq.com
Password: TestUser123!
Analyses: 300/300 remaining
Stripe: Active subscription
```

**Note:** You'll need to create these during UAT, or create them now via signup flow.

---

## 🔧 Test Environment

### URLs
- **Production:** https://propiq.luntra.one
- **Backend:** Convex (mild-tern-361.convex.cloud)
- **Stripe:** Live Mode (test cards work)
- **Email:** Resend (real emails sent)

### Test Data

**Property Addresses for Analysis:**
```
1. 123 Main St, Austin, TX 78701
   (Good deal - expect score 75-85)

2. 456 Ocean Blvd, San Francisco, CA 94102
   (Overpriced - expect score 20-35)

3. 789 Elm Street, Cleveland, OH 44101
   (Borderline - expect score 50-60)

4. 321 Pine Ave, Phoenix, AZ 85001
   (Excellent deal - expect score 85-95)

5. 654 Maple Dr, Seattle, WA 98101
   (Poor deal - expect score 30-45)
```

**Stripe Test Cards:**
```
# Success
4242 4242 4242 4242 (any future date, any CVC)

# Declined
4000 0000 0000 0002

# Requires authentication (3D Secure)
4000 0025 0000 3155

# Insufficient funds
4000 0000 0000 9995
```

---

## 📊 Progress Tracking

### Daily Standup Questions

1. **What did I test yesterday?**
   - List Test IDs completed

2. **What am I testing today?**
   - Plan which test cases

3. **Any blockers?**
   - Bugs preventing progress
   - Missing test data

### Completion Metrics

Track these daily:

```
Total Tests: 92

P0: __/20 (___%)
P1: __/32 (___%)
P2: __/28 (___%)
P3: __/12 (___%)

Bugs Found: __
- Critical (P0): __
- High (P1): __
- Medium (P2): __
- Low (P3): __

Bugs Fixed: __
Bugs Remaining: __
```

---

## ✅ Go/No-Go Criteria

### Launch Readiness Checklist

**Must Have (Hard Requirements):**
- [ ] 100% of P0 tests PASS
- [ ] 0 critical bugs open
- [ ] 95%+ of P1 tests PASS
- [ ] All revenue flow tests verified (UAT-001 to UAT-007)
- [ ] Authentication fully functional (UAT-008 to UAT-015)
- [ ] PropIQ analysis working (UAT-016 to UAT-020)
- [ ] Mobile responsive on iOS and Android
- [ ] Cross-browser tested (Chrome, Safari, Firefox)
- [ ] Stripe webhooks processing correctly
- [ ] Email delivery verified (Resend working)

**Should Have (Strong Preferences):**
- [ ] 80%+ of P2 tests PASS
- [ ] No high-severity bugs
- [ ] Help Center functional
- [ ] Product tour working
- [ ] Calculator accurate (<1% error)

**Nice to Have (Launch Without):**
- [ ] 50%+ of P3 tests PASS
- [ ] Analytics tracking verified
- [ ] All edge cases handled

---

## 🎯 Next Session Pickup

### When You Return to This

1. **Open the CSV:**
   ```bash
   cd /Users/briandusape/Projects/propiq
   open UAT_TEST_MATRIX.csv
   ```

2. **Find Where You Left Off:**
   - Sort by "Status" column
   - Look for first blank row
   - That's your next test

3. **Review Progress:**
   - Count PASS vs FAIL
   - Check if blocking bugs
   - Prioritize fixes

4. **Continue Testing:**
   - Pick next test in priority order
   - Execute and document
   - Create bug issues as needed

---

## 🚨 Emergency Contacts

If you find a critical bug:

1. **Mark as P0 FAIL in spreadsheet**
2. **Create GitHub issue immediately**
3. **Tag with `critical` and `uat-blocker` labels**
4. **Stop testing dependent features**
5. **Switch to another test area while bug is fixed**

---

## 📈 Success Metrics

### What Good Looks Like

**Coverage:**
- ✅ 92 test cases executed
- ✅ All major user flows tested
- ✅ Mobile + desktop verified
- ✅ 3+ browsers tested

**Quality:**
- ✅ <5 bugs per 100 test cases
- ✅ No P0 bugs in production
- ✅ 95%+ test pass rate
- ✅ All critical paths work

**Speed:**
- ✅ 2 weeks to complete UAT
- ✅ Bugs fixed within 24-48 hours
- ✅ Regression tests pass

---

## 🎓 Testing Best Practices

1. **Test with fresh eyes** - Don't test your own code the same day you write it
2. **Use real data** - Actual property addresses, realistic financial numbers
3. **Test like a user** - Don't take shortcuts; follow the actual user journey
4. **Document everything** - Future you will thank present you
5. **Take breaks** - Testing fatigue leads to missed bugs
6. **Vary your approach** - Try different browsers, devices, inputs
7. **Think maliciously** - Try to break it; users will
8. **Ask "what if?"** - What if user does X instead of Y?

---

## 🔄 Automation Reference

We already have 35+ Playwright tests that cover some UAT scenarios:

```bash
# Run all tests
cd propiq/frontend
npm run test

# Run specific test file
npx playwright test tests/user-signup-integration.spec.ts

# Run production tests
npm run test:production

# See test report
npm run test:report
```

**Tip:** Cross-reference automated tests with UAT matrix to avoid duplicate manual testing.

---

## 📝 Final Notes

- This UAT matrix is a **living document** - update as you learn
- Feel free to add new test cases if you discover gaps
- Priority can be adjusted based on your business needs
- The CSV format makes it easy to filter, sort, and share
- Export completed matrix to PDF for stakeholder review

**Good luck with UAT! 🚀**

Questions? Resume Claude Code session and ask away.

---

**Created:** January 5, 2026
**Author:** Claude Code (Senior Full-Stack Engineer Mode)
**Version:** 1.0
**Status:** Ready for UAT Execution
