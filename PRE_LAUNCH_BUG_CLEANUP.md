# PropIQ Pre-Launch Bug Cleanup Strategy

**Created:** January 4, 2026
**Purpose:** Smart, prioritized approach to getting production-ready for Product Hunt launch

---

## 🎯 Current Situation (as of Jan 4, 2026)

### Bug Inventory
```
Total bugs tracked: 11
├── Open: 3 bugs
│   ├── P1 (High): 2 bugs  ⚠️ MUST FIX BEFORE LAUNCH
│   └── No priority: 1 bug
└── Closed: 8 bugs ✅
```

### Status Breakdown
- ✅ **8 fixed** (73% resolution rate - GOOD!)
- ⚠️ **2 P1 open** (password reset issues)
- ℹ️ **1 unprioritized** (needs triage)

---

## 🚨 BLOCKER BUGS (Must Fix for Launch)

### Issue #19: Duplicate Fetch on Password Reset Request
**Priority:** P1 (High)
**Impact:** User experience - unnecessary network calls
**Status:** Investigating
**Decision:** **FIX BEFORE LAUNCH**

**Why it's a blocker:**
- Password reset is critical user flow
- Duplicate fetches suggest race condition
- Could cause confusion or errors

**Fix strategy:**
```typescript
// Check if already fetching before making request
const [isFetching, setIsFetching] = useState(false);

const handlePasswordReset = async () => {
  if (isFetching) return; // Prevent duplicate

  setIsFetching(true);
  try {
    await resetPassword();
  } finally {
    setIsFetching(false);
  }
};
```

**Time estimate:** 15-30 minutes
**Risk:** Low (isolated to password reset flow)

---

### Issue #18: Password Reset Navigation Timeout
**Priority:** P1 (High)
**Impact:** Users may think reset failed
**Status:** Needs manual verification
**Decision:** **FIX OR DOCUMENT BEFORE LAUNCH**

**Why it matters:**
- Critical authentication flow
- Could prevent users from accessing account
- Creates support burden

**Options:**

1. **Fix (30 min):** Add loading state + timeout handling
   ```typescript
   const [resetStatus, setResetStatus] = useState('idle');

   const handleReset = async () => {
     setResetStatus('loading');

     try {
       const result = await Promise.race([
         resetPassword(),
         timeout(10000) // 10 second timeout
       ]);

       setResetStatus('success');
       navigate('/reset-success');
     } catch (err) {
       setResetStatus('error');
       // Show clear error message
     }
   };
   ```

2. **Document (5 min):** Add FAQ: "Password reset takes 30-60 seconds"
   - Pro: Fast
   - Con: Still bad UX

**Recommendation:** **FIX** (only 30 min investment for critical flow)

---

### Issue #27: React Error #185 (Tooltip Provider)
**Priority:** Unknown (needs review)
**Status:** CSV shows "INVESTIGATING" but may be fixed
**Decision:** **VERIFY STATUS**

**Action:**
1. Test calculator page
2. Check for "Maximum update depth exceeded" errors
3. If present: Fix (already know root cause)
4. If fixed: Update CSV status to FIXED

**Time estimate:** 10 minutes to verify + 15 minutes to fix if needed

---

## ✅ ALREADY FIXED (Great Work!)

These are **NOT blockers** - celebrate these wins:

- ✅ BUG-023: Radix UI infinite loop (P0 - critical)
- ✅ BUG-012: Sensitive data in errors (security)
- ✅ BUG-010: Stripe key rotation (security)
- ✅ BUG-009: Chrome extension security (security)
- ✅ BUG-008: Rate limiting (security)
- ✅ BUG-007: Session tokens in localStorage (security)
- ✅ BUG-006: CORS configuration (security)
- ✅ BUG-005: CONVEX key exposed (security - critical)

**Security posture: EXCELLENT** ✅

---

## 📋 Pre-Launch Bug Triage Framework

### Step 1: Categorize by Launch Impact

**Use this decision tree for EVERY open bug:**

```
Is it a security vulnerability?
├─ YES → FIX NOW (no exceptions)
└─ NO ↓

Does it prevent core functionality?
├─ YES → FIX BEFORE LAUNCH
└─ NO ↓

Does it affect critical user flows?
├─ YES → FIX OR MITIGATE
│   ├─ Fix if < 1 hour
│   └─ Add workaround docs if complex
└─ NO ↓

Is it visible to 50%+ of users?
├─ YES → FIX if < 30 min, else DEFER
└─ NO → DEFER TO POST-LAUNCH
```

### Step 2: Apply RICE Scoring

**RICE = Reach × Impact × Confidence / Effort**

| Factor | Scale |
|--------|-------|
| **Reach** | % of users affected (0-100) |
| **Impact** | 3 = Massive, 2 = High, 1 = Medium, 0.5 = Low |
| **Confidence** | % sure of fix (0-100) |
| **Effort** | Hours to fix |

**Formula:**
```
RICE Score = (Reach × Impact × Confidence) / Effort
```

**Example: Issue #19 (Duplicate Fetch)**
```
Reach:     100 (all password reset users)
Impact:    1   (medium - annoying but not broken)
Confidence: 90  (we know the fix)
Effort:    0.5 hours

RICE = (100 × 1 × 0.9) / 0.5 = 180

Interpretation: HIGH PRIORITY (score > 100 = do it)
```

### Step 3: Launch Blocker Criteria

**A bug is a BLOCKER if ANY of these are true:**

1. ✅ Security vulnerability (P0/P1)
2. ✅ Prevents signup/login
3. ✅ Prevents payment/subscription
4. ✅ Causes data loss
5. ✅ Crashes app for >10% of users
6. ✅ Violates privacy regulations (GDPR, etc.)
7. ✅ Obvious UX embarrassment (typos on landing page, broken images)

**NOT blockers:**
- ❌ Edge case bugs (affects <5% of users)
- ❌ Minor UI glitches (wrong color, spacing)
- ❌ Missing "nice-to-have" features
- ❌ Performance (if < 3 second load time)
- ❌ Browser compatibility (if works on Chrome/Safari)

---

## 🏃 Speed Run: 2-Hour Pre-Launch Cleanup

**Total time: 2 hours to launch-ready**

### Hour 1: Critical Fixes (60 min)

**Task 1: Fix Issue #19 (Duplicate Fetch) - 30 min**
```bash
# 1. Locate password reset component
# 2. Add fetching state guard
# 3. Test: Spam click reset button
# 4. Commit fix
```

**Task 2: Fix Issue #18 (Navigation Timeout) - 25 min**
```bash
# 1. Add Promise.race with timeout
# 2. Add loading spinner
# 3. Test: Wait for timeout
# 4. Commit fix
```

**Task 3: Verify Issue #27 status - 5 min**
```bash
# 1. Open calculator
# 2. Hover tooltips
# 3. Check console for errors
# 4. Update CSV if fixed
```

### Hour 2: Verification & Polish (60 min)

**Task 4: Critical path testing - 30 min**
```bash
# Test these flows end-to-end:
[ ] Signup new account
[ ] Login existing account
[ ] Password reset flow
[ ] Subscribe to paid plan
[ ] Use calculator (basic analysis)
[ ] View results
[ ] Logout
```

**Task 5: Run automated tests - 15 min**
```bash
npm run test                    # Unit tests
npm run test:e2e                # E2E tests (if you have them)
npx playwright test tests/      # Critical path tests
```

**Task 6: Final issue tracker sync - 5 min**
```bash
# Update CSV with fixes
node scripts/sync-issue-tracker.cjs sync

# Verify all P0/P1 bugs closed
gh issue list --label bug --label P1 --state open
```

**Task 7: Deploy to production - 10 min**
```bash
git add .
git commit -m "fix: resolve P1 password reset issues for launch"
git push
npm run deploy   # Or your deployment command
```

---

## 📊 Launch Readiness Checklist

### Critical (Must Have)

- [ ] **Zero P0 (critical) bugs open**
- [ ] **Zero P1 (high) bugs in core flows** (signup, login, payment, calculator)
- [ ] **All security bugs fixed**
- [ ] **No console errors on happy path**
- [ ] **Core features work on Chrome & Safari**

### Important (Should Have)

- [ ] **<5 total open bugs**
- [ ] **All open bugs are P2 or lower**
- [ ] **Mobile responsive (iPhone/Android)**
- [ ] **Load time < 3 seconds**
- [ ] **Password reset works reliably**

### Nice to Have (Can Defer)

- [ ] Zero open bugs (perfectionism)
- [ ] All edge cases covered
- [ ] Perfect cross-browser support
- [ ] 100% test coverage
- [ ] Performance optimizations

---

## 🎯 Your Specific Action Plan

### Based on current bug inventory:

**MUST FIX (blockers):**
1. ✅ Issue #19 - Duplicate fetch (30 min)
2. ✅ Issue #18 - Navigation timeout (25 min)
3. ⚠️ Issue #27 - Verify if fixed (10 min)

**TOTAL TIME: 1 hour 5 minutes**

**CAN DEFER (not blockers):**
- All other bugs are either fixed or low priority

### Timeline to Launch

**Option 1: Fix everything today (recommended)**
```
Now:        Fix #19 (30 min)
+30 min:    Fix #18 (25 min)
+55 min:    Verify #27 (10 min)
+1h 5m:     Test critical paths (30 min)
+1h 35m:    Deploy (10 min)
+1h 45m:    ✅ LAUNCH READY
```

**Option 2: Deferred approach (not recommended)**
```
Now:        Document workarounds
Tomorrow:   Fix bugs
Next week:  Launch

Risk: More bugs discovered, momentum lost
```

---

## 🚀 Post-Launch Bug Strategy

**After Product Hunt launch:**

### Week 1 (Launch week)
- **Monitor:** Check Sentry every 2 hours
- **Triage:** New bugs labeled "launch-week"
- **Fix:** P0/P1 bugs within 24 hours
- **Communicate:** Post updates if major issues

### Week 2-4 (Growth phase)
- **Monitor:** Daily Sentry review
- **Fix:** P1 bugs within 3 days
- **Defer:** P2/P3 to backlog
- **Collect:** User feedback on what bugs matter most

### Month 2+ (Stable)
- **Monitor:** Weekly bug review
- **Fix:** Based on user impact, not severity
- **Focus:** Features over bug fixes (unless critical)

---

## 🧠 Smart Shortcuts

### Bugs You Can Ignore (For Now)

**These are NOT launch blockers:**

1. **Bugs in unused features**
   - If <10% of users will see it
   - Example: Advanced calculator features

2. **Visual polish**
   - Alignment off by 2px
   - Color slightly wrong
   - Animation timing

3. **Edge cases**
   - Works 95% of the time? Ship it.
   - Example: Rare browser/OS combo

4. **Performance (if reasonable)**
   - Load time <3 sec? Good enough.
   - Can optimize post-launch

5. **Missing features** (not bugs)
   - "Would be nice" ≠ bug
   - Ship MVP, iterate

### Bugs You MUST Fix

**Never launch with these:**

1. **Broken signup** (dead in water)
2. **Broken payment** (no revenue)
3. **Security holes** (legal liability)
4. **Data loss bugs** (user trust destroyed)
5. **App crashes** (1-star reviews)
6. **Obvious typos** (looks amateur)

---

## 📈 Metrics-Driven Decisions

### Track These Metrics

**Pre-launch:**
```bash
# Bug velocity (bugs fixed per day)
grep "FIXED" PROPIQ_BUG_TRACKER.csv | wc -l  # Should increase daily

# P0/P1 open count (should be 0 at launch)
gh issue list --label P1 --state open | wc -l

# Critical path success rate (should be 100%)
# Test signup → login → subscribe → use calculator
```

**Post-launch:**
```bash
# User-reported bugs (track in Sentry)
# Error rate (should be <1% of sessions)
# Support tickets (bugs vs questions)
```

### Decision Matrix

| Open Bugs | P0/P1 Open | Error Rate | Decision |
|-----------|------------|------------|----------|
| <5        | 0          | <0.5%      | ✅ LAUNCH |
| 5-10      | 0          | <1%        | ⚠️ Review critical paths first |
| <5        | 1-2        | <1%        | ⚠️ Fix P1s, then launch |
| Any       | 3+         | Any        | ❌ NOT READY |
| Any       | Any        | >2%        | ❌ NOT READY |

**Your status:** 3 open bugs, 2 P1, unknown error rate
**Decision:** **Fix 2 P1s → LAUNCH READY**

---

## 🎯 Final Answer: What To Do Right Now

### The 90-Minute Launch Prep

**Priority 1: Fix blockers (60 min)**
1. Fix Issue #19 - Duplicate fetch (30 min)
2. Fix Issue #18 - Navigation timeout (25 min)
3. Verify Issue #27 is actually fixed (5 min)

**Priority 2: Verify core flows (20 min)**
1. Signup → Login → Calculator → Logout (5 min)
2. Password reset end-to-end (5 min)
3. Subscribe to paid plan (test mode) (5 min)
4. Check browser console for errors (5 min)

**Priority 3: Update tracking (10 min)**
1. Mark bugs as fixed in CSV
2. Sync to GitHub: `node scripts/sync-issue-tracker.cjs sync`
3. Run readiness check: `./scripts/check-launch-readiness.sh` (we'll create this)

---

## ✅ Success Criteria

**You're ready to launch when:**

1. ✅ Zero P0/P1 bugs open
2. ✅ Core user flows work (signup/login/calculator/payment)
3. ✅ No console errors on critical paths
4. ✅ Security bugs all fixed
5. ✅ Runs on Chrome & Safari (mobile + desktop)

**You're NOT ready if:**

1. ❌ Any P0/P1 bugs open
2. ❌ Signup or payment broken
3. ❌ App crashes for common actions
4. ❌ Security vulnerabilities present
5. ❌ Doesn't work on mobile

---

## 🎖️ The Harsh Truth

**Perfectionism kills launches.**

- You'll NEVER fix all bugs
- Users will find new ones in 5 minutes
- Best launch = "works well enough"
- Ship → Learn → Iterate > Perfect → Never ship

**Your goal:** Not zero bugs. Just zero *critical* bugs.

**80/20 rule:**
- Fix 20% of bugs (the critical ones)
- Get 80% of the benefit (launch-ready)
- Fix remaining 80% of bugs post-launch (based on real user feedback)

---

**Current status:** 2 P1 bugs away from launch
**Time to fix:** ~1 hour
**Your next step:** Open those 2 issues and fix them NOW

🚀 You're closer than you think!
