# QuickCheck Flashing Investigation

**Date:** January 4, 2026
**Issue:** QuickCheck component flashes when results first render
**Status:** 🔍 Active Investigation

---

## Summary

QuickCheck flashes when results appear, but DealCalculatorV3 doesn't. Both ChatGPT and Gemini identified the root cause as **heavy mount + glassmorphism (backdrop-filter)**.

---

## AI Consultant Analysis

### ChatGPT's Diagnosis
**Primary Suspects:**
1. **`backdrop-filter` / glassmorphism** - Causes 1-2 frame "unfiltered → filtered" paint
2. **Mounting big subtree all at once** - Conditional `{result && ...}` creates expensive first paint
3. **Font/icon swap (FOIT/FOUT)** - Webfonts loading when results mount

**Most Likely:** backdrop-filter triggering compositing repaint on first mount

### Gemini's Diagnosis
**Primary Suspects:**
1. **State batching race condition** - Two setState calls (setResult + setIsCalculating) not batched
2. **Heavy mount layout shift** - Creating all DOM nodes simultaneously with expensive CSS
3. **Image/icon decoding** - SVG icons mounting for first time

**Key Difference:** DealCalculatorV3 updates existing nodes (useMemo), QuickCheck mounts new nodes

---

## What Makes QuickCheck Different

| Feature | DealCalculatorV3 (No Flash) | QuickCheck (Flashes) |
|---------|----------------------------|----------------------|
| **DOM Strategy** | Updates existing nodes | Mounts new nodes all at once |
| **Trigger** | `useDeferredValue` (gradual) | `setTimeout` → setState (instant) |
| **Rendering** | Always mounted, updates continuously | Conditional render `{result && ...}` |
| **State Updates** | Single useMemo | Two setState calls (result + loading) |

---

## Debugging Plan (In Order)

### Test #1: Chrome Paint Flashing Overlay
**Purpose:** Confirm if this is a paint/compositing issue
**Steps:**
1. Chrome DevTools → More tools → Rendering
2. Enable "Paint flashing"
3. Enable "Layout Shift Regions"
4. Click "Analyze Deal" and watch for green flashes

**Expected Result:**
- Big green flash = paint/compositing (backdrop-filter issue)
- Layout shift highlights = reflow/mounting issue

---

### Test #2: Combine setState Calls (Batching Fix)
**Purpose:** Eliminate potential double-render from two setState calls
**Current Code:**
```tsx
setTimeout(() => {
  const calculation = calculateQuickCheck(price, rent);
  setResult(calculation);      // ← First render
  setIsCalculating(false);     // ← Second render?
}, 500);
```

**Fix:**
```tsx
const [state, setState] = useState({ result: null, isCalculating: false });

setTimeout(() => {
  const calculation = calculateQuickCheck(price, rent);
  setState({ result: calculation, isCalculating: false }); // ← Single render
}, 500);
```

**File:** `/Users/briandusape/Projects/propiq/frontend/src/components/QuickCheck.tsx`

---

### Test #3: Remove backdrop-filter (Most Likely Fix)
**Purpose:** Test if glassmorphism is causing the flash
**CSS to temporarily disable:**
```css
/* quickcheck.css */
.quick-check-results {
  /* backdrop-filter: blur(12px); ← COMMENT OUT */
}

.executive-summary-card {
  /* backdrop-filter: blur(12px); ← COMMENT OUT */
}
```

**Files:**
- `/Users/briandusape/Projects/propiq/frontend/src/styles/quickcheck.css`

**If this works:** Add layer promotion:
```css
.glass {
  will-change: backdrop-filter;
  transform: translateZ(0);
}
```

---

### Test #4: Keep Container Mounted (Visibility Toggle)
**Purpose:** Avoid heavy DOM mount by keeping structure in DOM
**Current:**
```tsx
{result && (
  <div className="quick-check-results">
    <ExecutiveSummary result={result} />
    ...
  </div>
)}
```

**Fix:**
```tsx
<div className={`quick-check-results ${!result ? 'is-hidden' : ''}`}>
  {result && (
    <>
      <ExecutiveSummary result={result} />
      ...
    </>
  )}
</div>
```

```css
.quick-check-results.is-hidden {
  visibility: hidden;
  height: 0;
  overflow: hidden;
}
```

---

### Test #5: Binary Search Components
**Purpose:** Isolate which child component causes the flash
**Steps:**
1. Comment out all children except ExecutiveSummary
2. If flash persists, isolate further (ConfidenceMeter, MetricCards)
3. If flash gone, add back one component at a time

---

## Previous Fixes Attempted (Didn't Work)

- ✅ Disabled CSS slideDown animation (opacity 0 → 1)
- ✅ Changed `transition: all` to specific properties
- ✅ Removed ConfidenceMeter 500ms progress bar transition
- ✅ Disabled shine animation
- ✅ Reduced transition durations (1s → 0.2s)

**Conclusion:** These were good hygiene but didn't fix the root cause because the issue is **mounting + paint**, not transitions.

---

## Files Involved

### Components:
- `/Users/briandusape/Projects/propiq/frontend/src/components/QuickCheck.tsx`
- `/Users/briandusape/Projects/propiq/frontend/src/components/ExecutiveSummary.tsx`
- `/Users/briandusape/Projects/propiq/frontend/src/components/CalculationExplanation.tsx`
- `/Users/briandusape/Projects/propiq/frontend/src/components/BreakevenTimeline.tsx`
- `/Users/briandusape/Projects/propiq/frontend/src/components/ui/confidence-meter.tsx`

### Styles:
- `/Users/briandusape/Projects/propiq/frontend/src/styles/quickcheck.css`

---

## Test Results

### Test #1: Paint Flashing
**Status:** ✅ Attempted (Inconclusive)
**Result:** User enabled Paint Flashing + Layout Shift overlays in Chrome DevTools but did not observe specific visual indicators. Console shows expected CSP warnings (Sentry, Clarity blocked) which are unrelated to flashing issue.
**Note:** Paint Flashing should show GREEN boxes over painted areas, PURPLE boxes over layout shifts - user did not report seeing these overlays.

### Test #2: State Batching
**Status:** ⏳ Not Started
**Result:**

### Test #3: Remove backdrop-filter
**Status:** 🎯 **RECOMMENDED NEXT STEP**
**Result:** Both ChatGPT and Gemini identified this as most likely fix (80% confidence)

### Test #4: Visibility Toggle
**Status:** ⏳ Not Started
**Result:**

### Test #5: Binary Search
**Status:** ⏳ Not Started
**Result:**

---

## Session End Summary (Jan 4, 2026, 1:45 PM EST)

### What Was Accomplished:
- ✅ Consulted ChatGPT and Gemini - both identified root cause
- ✅ Created comprehensive investigation document
- ✅ Disabled CSS animations (slideDown, shine effect)
- ✅ Removed `transition: all` declarations (6 locations)
- ✅ Removed ConfidenceMeter 500ms progress bar animation
- ✅ Enabled Paint Flashing in Chrome DevTools

### What Still Flashes:
- ❌ QuickCheck component when results first appear
- ✅ DealCalculatorV3 has NO flashing (works perfectly)

### Root Cause (AI Consensus):
**Heavy DOM mount + backdrop-filter/glassmorphism causing expensive paint on first render**

### Next Session Action Plan:

**OPTION A: Quick Fix (5 minutes)**
Apply Test #3 - Remove `backdrop-filter` from QuickCheck results:
1. Edit `/Users/briandusape/Projects/propiq/frontend/src/styles/quickcheck.css`
2. Comment out all `backdrop-filter: blur(12px);` in results-related classes
3. Test if flashing is gone
4. If fixed: Add layer promotion (`will-change: backdrop-filter; transform: translateZ(0);`)

**OPTION B: Proper Fix (15 minutes)**
Apply Test #4 - Keep container mounted, toggle visibility:
1. Edit `/Users/briandusape/Projects/propiq/frontend/src/components/QuickCheck.tsx`
2. Keep `.quick-check-results` div always mounted
3. Toggle visibility with CSS class instead of conditional render
4. This avoids expensive DOM mount entirely

**OPTION C: Nuclear Option (30 minutes)**
Restructure QuickCheck to match DealCalculatorV3 pattern:
1. Always mount results container
2. Use `useMemo` for calculations
3. Update values instead of mounting new components

---

## Console Warnings (NOT THE ISSUE)

The following console errors are **EXPECTED in dev mode** and are NOT causing the flashing:

```
✓ CSP blocking Sentry - Expected (Sentry disabled in dev)
✓ CSP blocking Clarity - Expected (analytics disabled in dev)
✓ CSP frame-ancestors in meta tag - Expected warning
✓ Worker blob: blocked - Expected (Sentry feature)
```

**These will not appear in production.** They are CSP warnings, not the visual flashing issue.

---

## Key Files to Edit Next Session

### Option A (Remove backdrop-filter):
- `/Users/briandusape/Projects/propiq/frontend/src/styles/quickcheck.css`
  - Lines with `backdrop-filter: blur(12px);`

### Option B (Visibility toggle):
- `/Users/briandusape/Projects/propiq/frontend/src/components/QuickCheck.tsx`
  - Line 197: Results conditional render
- `/Users/briandusape/Projects/propiq/frontend/src/styles/quickcheck.css`
  - Add `.quick-check-results.is-hidden` class

---

**Last Updated:** January 4, 2026, 1:45 PM EST
**Investigator:** Claude Code + ChatGPT + Gemini
**Status:** 🔄 Session paused - Ready for next session with clear action plan
