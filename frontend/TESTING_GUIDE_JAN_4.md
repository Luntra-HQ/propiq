# Testing Guide - January 4, 2026

## ✅ Environment Ready!

Your dev environment is clean and ready to test.

### What's Been Done:

1. ✅ **Cleaned up dev environment** - All Vite processes killed, caches cleared
2. ✅ **Dev server running** - `http://localhost:5173` (PID: 2221)
3. ✅ **Test route created** - `/test` page now accessible
4. ✅ **Components integrated** - QuickCheck and DealCalculatorV3 added to ComponentTestPage
5. ✅ **HMR working** - Hot Module Reload updating successfully
6. ✅ **No compilation errors** - Clean build

---

## 🧪 How to Test

### Step 1: Open the Test Page

**URL:** http://localhost:5173/test

1. Open your browser
2. Navigate to `http://localhost:5173/test`
3. Open DevTools (F12 or Cmd+Option+I)
4. Click the **Console** tab

### Step 2: Navigate to the V3 Tab

You'll see 5 tabs at the top:
- Forms
- Modals
- Calculator V2
- **🆕 V3 & QuickCheck** ← Click this one
- Interactive

### Step 3: Test QuickCheck Component

The QuickCheck section appears first on the page.

#### QuickCheck 6-Point Test:

1. **✅ Component Renders**
   - [ ] QuickCheck form is visible
   - [ ] No red errors in console

2. **✅ Inputs Work**
   - [ ] Type in "Purchase Price" field (try: 250000)
   - [ ] Type in "Monthly Rent" field (try: 1800)
   - [ ] Both fields accept numbers

3. **✅ Analyze Button Works**
   - [ ] Click "Analyze Deal" button
   - [ ] Results appear below form
   - [ ] Deal Score displays (0-100)
   - [ ] No errors in console

4. **✅ Results Display Correctly**
   - [ ] Executive Summary section appears
   - [ ] Deal Score badge shows
   - [ ] Monthly Cash Flow displays
   - [ ] Key metrics visible (Cap Rate, CoC Return, etc.)

5. **✅ Switch to Advanced Button**
   - [ ] "Switch to Advanced" button is visible
   - [ ] Click it
   - [ ] Alert shows (temporary - integration pending)
   - [ ] Console logs prefilled data

6. **✅ Glass Styling Applied**
   - [ ] Background has blur effect
   - [ ] Purple/violet accent colors
   - [ ] Looks professional, not broken

---

### Step 4: Test DealCalculatorV3 Component

Scroll down to the "DealCalculatorV3" section below QuickCheck.

#### DealCalculatorV3 Comprehensive Test:

**Test 1: Page Loads (30 seconds)**
- [ ] DealCalculatorV3 form is visible
- [ ] No blank screen
- [ ] Console has NO RED errors (yellow warnings OK)
- [ ] All 3 tabs visible (Basic Analysis, Advanced Metrics, Scenarios)

**Test 2: Input Validation (1 minute)**
- [ ] Find "Purchase Price" field
- [ ] Type `500` (too low)
- [ ] **Expected:** Error appears: "Purchase price must be at least $1,000"
- [ ] Type `300000` (valid)
- [ ] **Expected:** Error disappears

**Test 3: Real-Time Calculations (1 minute)**
- [ ] Enter these values:
  - Purchase Price: `300000`
  - Down Payment: `20`
  - Interest Rate: `7`
  - Monthly Rent: `2500`
- [ ] **Expected:** Deal Score displays (number 0-100)
- [ ] **Expected:** Monthly Cash Flow displays ($ amount)
- [ ] Change Purchase Price to `350000`
- [ ] **Expected:** Numbers update immediately

**Test 4: All Tabs Work (1 minute)**
- [ ] Click "Basic Analysis" tab
- [ ] Click "Advanced Metrics" tab
- [ ] Click "Scenarios & Projections" tab
- [ ] All tabs switch without errors
- [ ] Check console - no new errors when switching

**Test 5: Multiple Field Validation (2 minutes)**
- [ ] Enter invalid values:
  - Down Payment: `150` → **Expected:** Error (>100%)
  - Interest Rate: `40` → **Expected:** Error (>30%)
  - Monthly Rent: `-100` → **Expected:** Error (negative)
- [ ] Correct the values
- [ ] **Expected:** All errors disappear

**Test 6: Visual Check (1 minute)**
- [ ] Form has **glass effect** (blurred background)
- [ ] Colors are **purple/violet** accent
- [ ] Input fields have **border when focused**
- [ ] Error messages in **red** below fields
- [ ] Deal Score badge **prominent** at top
- [ ] Overall looks professional, not broken

**Test 7: No Infinite Loop (Critical!)**
- [ ] Watch console while using the calculator
- [ ] **Expected:** NO "Maximum update depth exceeded" errors
- [ ] **Expected:** Page doesn't freeze or become unresponsive
- [ ] **Expected:** Smooth performance when typing in inputs

---

## 📊 Expected Test Results

### If All Tests Pass ✅

Both components are working! You can proceed to:
1. Document test results
2. Consider deployment with feature flag
3. Re-enable OnboardingChecklist

### If QuickCheck Fails ❌

**Common Issues:**
- Missing dependency (smartDefaults.ts)
- ExecutiveSummary component error
- CSS file missing (quickcheck.css)

**Fix:** Check console error, read file path mentioned

### If DealCalculatorV3 Fails ❌

**Common Issues:**
- Form validation not working (zodResolver issue)
- dealCalculatorSchema.ts missing
- GlassForm component error

**Fix:** Check console error message

### If Infinite Loop Returns ❌

**This means:**
- Tooltips may have been re-added
- Radix UI issue resurfaced

**Fix:**
1. Check DealCalculatorV3.tsx for tooltip imports
2. Remove any EnhancedTooltip or HelpCircle components

---

## 🐛 Debugging Tips

### Console Errors to Ignore:
These are normal and can be ignored:
- Content Security Policy warnings (Sentry, Tally.so)
- React DevTools suggestion
- Meta tag deprecation warning
- Chrome extension errors

### Console Errors to Report:
These indicate problems:
- "Cannot read properties of undefined"
- "Cannot find module"
- "is not a function"
- "Maximum update depth exceeded" ⚠️ CRITICAL
- TypeScript errors in component rendering

### How to Check for Infinite Loops:
1. Open DevTools Console
2. Look for repeating error messages
3. Watch CPU usage (shouldn't spike to 100%)
4. Page should remain responsive
5. Tab should not freeze

---

## 📝 Test Results Template

Copy this and fill it out:

```markdown
## Test Results - January 4, 2026

**Tester:** [Your Name]
**Time:** [Current Time]
**Browser:** [Chrome/Firefox/Safari]

### QuickCheck Component:
- [ ] Test 1: Component Renders - PASS / FAIL
- [ ] Test 2: Inputs Work - PASS / FAIL
- [ ] Test 3: Analyze Button - PASS / FAIL
- [ ] Test 4: Results Display - PASS / FAIL
- [ ] Test 5: Switch Button - PASS / FAIL
- [ ] Test 6: Glass Styling - PASS / FAIL

**Notes:** [Any issues or observations]

### DealCalculatorV3 Component:
- [ ] Test 1: Page Loads - PASS / FAIL
- [ ] Test 2: Input Validation - PASS / FAIL
- [ ] Test 3: Real-Time Calculations - PASS / FAIL
- [ ] Test 4: All Tabs Work - PASS / FAIL
- [ ] Test 5: Multiple Validations - PASS / FAIL
- [ ] Test 6: Visual Check - PASS / FAIL
- [ ] Test 7: No Infinite Loop - PASS / FAIL

**Notes:** [Any issues or observations]

### Overall Status:
- [ ] Ready for deployment
- [ ] Needs fixes (see notes)
- [ ] Major issues found

**Console Errors:** [Copy/paste any RED errors here]
```

---

## 🚀 Next Steps Based on Results

### If ALL TESTS PASS (Best Case):
1. ✅ Document results
2. ✅ Re-enable OnboardingChecklist in App.tsx
3. ✅ Create feature flag for side-by-side deployment
4. ✅ Deploy to staging
5. ✅ Test on mobile devices
6. ✅ Deploy to production

**Timeline:** 1-2 days

---

### If QUICKCHECK PASSES but V3 FAILS:
1. Ship QuickCheck standalone
2. Debug V3 separately
3. Deploy V3 when fixed

**Timeline:** 2-3 days

---

### If BOTH FAIL:
1. Check console errors
2. Review component files
3. Fix issues one at a time
4. Retest after each fix

**Timeline:** 3-5 days

---

### If INFINITE LOOP RETURNS:
1. Stop testing immediately
2. Check for tooltip code
3. Follow BUG_LOG.md resolution
4. Consider alternative tooltip library

**Timeline:** 1 week

---

## 📞 Quick Reference

**Dev Server URL:** http://localhost:5173
**Test Page URL:** http://localhost:5173/test
**Dev Server PID:** 2221

**Kill Server:**
```bash
kill $(cat /tmp/vite-pid.txt)
```

**Restart Server:**
```bash
cd /Users/briandusape/Projects/propiq/frontend
npm run dev
```

**Check Server Status:**
```bash
curl http://localhost:5173
```

**View Server Logs:**
```bash
tail -f /tmp/vite-output.log
```

---

## 📚 Additional Documentation

- `SESSION_END_2026-01-03.md` - Last night's session notes
- `SESSION_WRAP_JAN_4_2026.md` - Tooltip bug details
- `BUG_LOG.md` - All bug history
- `QUICKCHECK_IMPLEMENTATION_COMPLETE.md` - QuickCheck specs

---

**Created:** January 4, 2026
**Status:** Ready for Testing
**Estimated Time:** 15-30 minutes

**Good luck! 🍀**
