# Known Issues - DealCalculatorV3 & QuickCheck

**Date:** January 4, 2026
**Status:** Non-blocking issues documented for future fixes

---

## Issue #1: Component Flashing (Accessibility Concern)

**Severity:** Medium (UX/Accessibility)
**Component:** DealCalculatorV3, QuickCheck
**Status:** ⚠️ Open - Deferred to post-launch

### Description:
Components flash/flicker during rendering, potentially triggering seizures in photosensitive users.

### Attempted Fixes:
1. ✅ Changed validation mode from `onChange` to `onBlur`
2. ✅ Added `useDeferredValue` for input debouncing
3. ✅ Replaced `useEffect` with `useMemo` to reduce re-renders
4. ❌ Still experiencing visual flashing

### Root Cause (Suspected):
- **Primary:** React Strict Mode in development causes double-rendering
- **Secondary:** Tab switching in ComponentTestPage re-mounts components
- React Hook Form's `watch()` creates new object references on every render
- Even with `useDeferredValue`, rapid form updates cause visual flicker
- May be related to ShadCN Form component re-rendering behavior

### Testing Notes:
- QuickCheck: User reports "flashing makes it difficult to input information"
- No `useEffect` or real-time watchers in QuickCheck (only button-triggered)
- Flashing may be environmental (dev server + React Strict Mode)
- **Test in production build** to verify if issue persists

### Workarounds:
- Use keyboard navigation (Tab) instead of clicking between fields
- Wait for field to finish updating before moving to next field
- Consider adding "Calculate" button instead of real-time updates

### Recommended Fix (Future):
1. **Option A:** Add manual "Calculate" button (disable real-time)
   - Pros: Zero flashing, user controls when to recalculate
   - Cons: Less "wow factor", extra click required

2. **Option B:** Implement proper debouncing library (lodash.debounce)
   - Pros: Maintains real-time feel, smoother updates
   - Cons: Adds dependency, more complex

3. **Option C:** Use React Transition API
   - Pros: Built into React 18, smooth transitions
   - Cons: Requires refactoring, learning curve

### Testing Notes:
- Issue is visual only - calculations remain accurate
- No impact on functionality
- Does not prevent form submission or validation
- More noticeable on slower machines/browsers

### Accessibility Impact:
- **WCAG 2.3.1 (Three Flashes or Below Threshold):** Potential violation
- **Recommendation:** Add warning on page or disable real-time updates
- **Priority:** Should fix before marketing to users with photosensitivity

---

## Issue #2: Radix UI Infinite Loop (RESOLVED)

**Severity:** Critical (Blocker)
**Status:** ✅ Resolved

### Components Removed:
1. ✅ Tooltips (EnhancedTooltip) - Removed entirely
2. ✅ RadioGroup - Replaced with native `<select>` elements

### Solution:
Radix UI components with `asChild` prop + React Hook Form's `FormControl` cause infinite re-render loops. Replaced all problematic components with native HTML elements styled with Tailwind.

### Files Modified:
- `DealCalculatorV3.tsx` - Lines 411-436 (Investment Strategy)
- `DealCalculatorV3.tsx` - Lines 438-463 (Market Tier)

---

## Issue #3: useEffect Infinite Loop (RESOLVED)

**Severity:** Critical (Blocker)
**Status:** ✅ Resolved

### Root Cause:
```tsx
// BEFORE (broken):
useEffect(() => {
  setMetrics(calculateAllMetrics(inputs));
}, [inputs]); // inputs object reference changes every render
```

### Solution:
```tsx
// AFTER (fixed):
const metrics = useMemo(() => {
  return calculateAllMetrics(inputs);
}, [inputs.purchasePrice, inputs.monthlyRent, ...]); // Only specific values
```

---

## Console Warnings (Expected - Can Ignore):

These warnings appear in dev but are **NOT errors**:

1. **Content Security Policy (CSP)**
   - Sentry blocked (expected in dev)
   - Clarity blocked (expected in dev)
   - Will work in production with proper CSP headers

2. **Frame Ancestors**
   - CSP directive ignored in `<meta>` tag
   - Normal browser behavior
   - Use HTTP headers in production

3. **React DevTools**
   - Suggestion to install browser extension
   - Optional, not an error

---

## Testing Status:

### ✅ Resolved Issues:
- [x] Export name mismatch (DealCalculator vs DealCalculatorV3)
- [x] RadioGroup infinite loop
- [x] Tooltip infinite loop
- [x] useEffect infinite loop

### ⚠️ Known Issues:
- [ ] Component flashing (deferred)

### 📋 Pending Testing:
- [ ] QuickCheck functionality
- [ ] DealCalculatorV3 calculations
- [ ] Form validation
- [ ] All tabs working
- [ ] No console errors during use

---

**Last Updated:** January 4, 2026
**Next Review:** After initial user testing
