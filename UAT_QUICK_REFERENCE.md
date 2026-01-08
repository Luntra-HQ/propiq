# PropIQ UAT Quick Reference Card

**Print this page and keep it handy while testing!**

---

## 🚀 Quick Start

```bash
# Open test matrix
cd /Users/briandusape/Projects/propiq
open UAT_TEST_MATRIX.csv

# Navigate to app
https://propiq.luntra.one
```

---

## 📋 Test Priority Order

**Execute in this order:**

1. **Day 1-2:** UAT-001 to UAT-020 (P0 - Revenue & Auth)
2. **Day 3-5:** UAT-021 to UAT-042 (P1 - Features & Mobile)
3. **Day 6-8:** UAT-043 to UAT-070 (P2 - UX & Polish)
4. **Day 9-10:** UAT-071 to UAT-092 (P3 - Edge Cases)

---

## 🧪 Test Accounts

```
Free:    test-free@propiq.com    | TestUser123!
Starter: test-starter@propiq.com | TestUser123!
Pro:     test-pro@propiq.com     | TestUser123!
Elite:   test-elite@propiq.com   | TestUser123!
```

**Create these accounts during UAT execution via signup flow.**

---

## 🏠 Test Properties

**Use these addresses for PropIQ Analysis:**

```
1. 123 Main St, Austin, TX 78701        (Good: 75-85)
2. 456 Ocean Blvd, San Francisco, CA    (Bad: 20-35)
3. 789 Elm St, Cleveland, OH 44101      (Fair: 50-60)
4. 321 Pine Ave, Phoenix, AZ 85001      (Excellent: 85-95)
5. 654 Maple Dr, Seattle, WA 98101      (Poor: 30-45)
```

---

## 💳 Stripe Test Cards

```
Success:       4242 4242 4242 4242
Declined:      4000 0000 0000 0002
Auth Required: 4000 0025 0000 3155
Insufficient:  4000 0000 0000 9995

Date: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

---

## 📊 Test Status Codes

| Status | When to Use |
|--------|-------------|
| **PASS** | All expected results met ✅ |
| **FAIL** | One or more criteria failed ❌ |
| **BLOCKED** | Cannot test (dependency broken) ⛔ |
| **SKIP** | Intentionally skipped 🔄 |

---

## 🐛 Bug Severity Guide

| Severity | Examples | Action |
|----------|----------|--------|
| **Critical (P0)** | • App crashes<br>• Payment fails<br>• Cannot login<br>• Data loss | Stop testing! Fix immediately |
| **High (P1)** | • Feature broken<br>• Incorrect calculation<br>• Mobile unusable | Fix before launch |
| **Medium (P2)** | • UI glitch<br>• Slow performance<br>• Minor UX issue | Fix if time permits |
| **Low (P3)** | • Typo<br>• Cosmetic issue<br>• Enhancement idea | Track as tech debt |

---

## 📸 Screenshot Shortcuts

**Mac:**
- Screenshot area: `Cmd + Shift + 4`
- Screenshot window: `Cmd + Shift + 4`, then `Space`
- Screen record: `Cmd + Shift + 5`

**Windows:**
- Screenshot area: `Win + Shift + S`
- Screen record: `Win + G`

**Save to:** `/propiq/uat-screenshots/UAT-XXX-description.png`

---

## ✅ Testing Checklist (for Each Test)

- [ ] Read Test Scenario
- [ ] Verify Pre-conditions met
- [ ] Execute Test Steps in order
- [ ] Compare with Expected Results
- [ ] Document Actual Results
- [ ] Mark Status (PASS/FAIL/BLOCKED/SKIP)
- [ ] Screenshot final state
- [ ] Create GitHub issue if FAIL
- [ ] Fill in: Tester, Date, Notes
- [ ] Move to next test

---

## 🚨 Critical Test Cases (MUST PASS)

**Top 10 Make-or-Break Tests:**

| ID | What It Tests | Why Critical |
|----|---------------|--------------|
| UAT-003 | Stripe checkout Starter | Revenue |
| UAT-006 | Webhook processing | Revenue |
| UAT-008 | Login | Access |
| UAT-012 | Password reset request | Access |
| UAT-016 | PropIQ analysis (valid) | Core product |
| UAT-020 | Usage counter accuracy | Limits |
| UAT-022 | Hard cap enforcement | Limits |
| UAT-026 | Calculator mortgage calc | Trust |
| UAT-038 | Mobile dashboard iPhone | 60% users |
| UAT-071 | Chrome desktop | 80% users |

**If ANY of these fail, DO NOT LAUNCH.**

---

## 📞 Browser DevTools

**Open DevTools:** `F12` (all browsers) or `Cmd+Opt+I` (Mac)

**Useful Panels:**
- **Console:** See JavaScript errors
- **Network:** See failed API requests
- **Application:** Check cookies, localStorage

**When test FAILS, capture:**
1. Console errors (red text)
2. Failed network requests (red/orange)
3. Screenshot of issue

---

## 🔗 Useful URLs

```
App:            https://propiq.luntra.one
Convex:         https://mild-tern-361.convex.cloud
GitHub Issues:  https://github.com/[your-org]/propiq/issues
Stripe:         https://dashboard.stripe.com/test/payments
Sentry:         https://sentry.io/[your-project]
```

---

## 📋 Daily Workflow

**Morning:**
1. Open UAT_TEST_MATRIX.csv
2. Review yesterday's progress
3. Plan today's test cases (aim for 8-12/day)
4. Set up test environment (accounts, browsers)

**During Testing:**
1. Execute 1 test at a time
2. Document immediately
3. Create GitHub issues for bugs
4. Take breaks every 2 hours

**Evening:**
1. Update UAT_PROGRESS_TRACKER.md
2. Triage bugs found
3. Note blockers for next day
4. Commit/save all documentation

---

## 🎯 Pass/Fail Decision Tree

```
Did ALL expected results happen?
│
├─ YES → Mark PASS ✅
│        Screenshot success state
│        Move to next test
│
├─ NO  → Mark FAIL ❌
│        Screenshot error
│        Note what went wrong
│        Create GitHub issue
│        Tag with severity
│        Move to next test (or fix blocker)
│
└─ CANNOT TEST → Mark BLOCKED ⛔
                  Note dependency
                  Skip to next test
                  Come back later
```

---

## 💡 Testing Tips

**Do:**
- ✅ Test with fresh browser (clear cache between runs)
- ✅ Use real property addresses
- ✅ Try edge cases (empty fields, special chars)
- ✅ Test on actual mobile device (not just emulator)
- ✅ Document EVERYTHING

**Don't:**
- ❌ Rush through tests
- ❌ Skip failed tests
- ❌ Assume something works because it "should"
- ❌ Test multiple features simultaneously
- ❌ Forget to log bugs

---

## 🚦 Go/No-Go Thresholds

| Metric | Must Have | Current |
|--------|-----------|---------|
| P0 Pass Rate | 100% | ___% |
| P1 Pass Rate | 95% | ___% |
| Critical Bugs | 0 | ___ |
| High Bugs | <3 | ___ |

**If all "Must Have" met → 🟢 LAUNCH**
**If any "Must Have" missed → 🔴 NO LAUNCH**

---

## 📝 Bug Report Template

```markdown
# [UAT-XXX] Brief Description

**Priority:** P0/P1/P2/P3
**Browser:** Chrome 120.x
**Device:** MacBook Pro / iPhone 14

## Steps to Reproduce
1.
2.
3.

## Expected
✓

## Actual
❌

## Screenshot
[Attach]
```

**Create at:** https://github.com/[your-org]/propiq/issues/new

---

## ⏱️ Time Estimates

| Test Type | Avg Time | Notes |
|-----------|----------|-------|
| Auth tests | 3-5 min | Includes email check |
| Analysis tests | 5-8 min | Includes AI wait time |
| Calculator tests | 4-6 min | Verify calculations |
| Mobile tests | 6-10 min | Device switching |
| Integration tests | 8-12 min | Multiple steps |

**Daily capacity:** 8-12 tests (if full-time)

---

## 🎓 Common Pitfalls

**Watch out for:**

1. **Cache Issues**
   - Clear browser cache between test runs
   - Use incognito/private mode

2. **Session Persistence**
   - Logout fully between account tests
   - Check session expires correctly

3. **Email Delays**
   - Wait 60 seconds for Resend emails
   - Check spam folder

4. **Stripe Test Mode**
   - Use test cards only
   - Don't use real payment info

5. **Mobile Testing**
   - Test on REAL devices
   - Emulators hide bugs

---

## 📊 Success Looks Like

**End of Week 1:**
- ✅ All P0 tests complete (20/20)
- ✅ 80%+ of P1 tests complete (26+/32)
- ✅ All critical bugs identified
- ✅ Zero blockers remaining

**End of Week 2:**
- ✅ All 92 tests complete
- ✅ 95%+ pass rate
- ✅ <5 open bugs (all P2/P3)
- ✅ Launch decision made

---

## 🆘 When You Need Help

**Questions about:**
- Test execution → Check UAT_GUIDE.md
- Bug reporting → See GitHub issue template
- Test coverage → Review UAT_TEST_MATRIX.csv
- Launch decision → Check UAT_PROGRESS_TRACKER.md

**Resume Claude Code session:**
```bash
# Just reference these files and ask!
```

---

**Last Updated:** January 5, 2026
**Version:** 1.0
**Print Date:** ___/___/___

---

**Keep this page visible while testing for quick reference! 📌**
