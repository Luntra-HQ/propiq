# PropIQ Bug Log

**Purpose:** Track all bugs encountered during development and production

---

## Active Bugs

(None - all bugs resolved)

---

## Resolved Bugs

### BUG-001: Maximum Update Depth Exceeded (Tooltip Infinite Loop)

**Date Discovered:** 2026-01-04
**Date Resolved:** 2026-01-04 (both occurrences)
**Occurrences:** 2 (DealCalculatorV3, then DealCalculatorV2)
**Severity:** Critical
**Status:** ✅ RESOLVED
**Component:** DealCalculatorV3 / EnhancedTooltip (first), DealCalculatorV2 (second)

**Description:**
React throws "Maximum update depth exceeded" error when loading Advanced Mode tab with tooltips.

**Error Message:**
```
Error: Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
React limits the number of nested updates to prevent infinite loops.
```

**Stack Trace:**
```
button
Primitive.button.SlotClone
TooltipTrigger@radix-ui/react-tooltip.js:2504:54
TooltipProvider@chunk-P4HM26TC.js:55:52
Tooltip@radix-ui/react-tooltip.js:2419:12
EnhancedTooltip@enhanced-tooltip.tsx:5:32
FormLabelWithTooltip@enhanced-tooltip.tsx:180:32
FormField
BasicAnalysisTab@DealCalculatorV3.tsx:348:32
TooltipProviderProvider@chunk-P4HM26TC.js:55:52
TooltipProvider@radix-ui/react-tooltip.js:2373:12
DealCalculator@DealCalculatorV3.tsx:46:23
Dashboard
```

**Attempted Fixes:**
1. ✅ Removed `TooltipProvider` wrapper from `EnhancedTooltip` component (lines 21-97)
2. ✅ Added single `TooltipProvider` at `DealCalculatorV3` component level (line 139)
3. ❌ Dev server restart with clean cache - ERROR STILL PERSISTS
4. ✅ Removed unused `TooltipProvider` import from `enhanced-tooltip.tsx`
5. ✅ Removed `asChild` prop from `TooltipTrigger` (potential event propagation issue)
6. ✅ Simplified `TooltipTrigger` - removed button wrapper, directly wrapped icon

**Investigation Findings:**
- ✅ Searched all `TooltipProvider` instances - only in DealCalculatorV3 (correct)
- ✅ No TooltipProvider in SimpleModeWizard, Dashboard, or App
- ✅ No TooltipProvider in DealCalculatorV2 (not being used)
- ⚠️ Stack trace shows "TooltipProviderProvider" - suggests internal Radix nesting
- 💡 Suspected `asChild` prop causing re-render loops

**Reproduction Steps:**
1. Navigate to http://localhost:5174/
2. Login to account
3. Click "📊 Advanced" tab
4. Error appears immediately on tab load (or after refresh)

**Environment:**
- React 18.3.1
- Radix UI Tooltip
- Vite 7.3.0 (HMR enabled)
- Browser: Latest (Firefox/Chrome)

**Root Cause (per Grok AI analysis):**
The `<button type="button">` element with `onClick={e => e.preventDefault()}` inside `TooltipTrigger asChild` was causing internal Radix event propagation loops. With ~20 tooltips in one form, this amplified into infinite re-renders.

**Final Solution:**
✅ **Use `<span tabIndex={0}>` instead of `<button>` - keeps ALL Radix features**

**Files Changed:**
- `enhanced-tooltip.tsx`: Changed trigger from `<button>` to `<span tabIndex={0}>`
- `DealCalculatorV3.tsx`: Added `TooltipProvider` with `skipDelayDuration={500}`

**Code Changes:**
```tsx
// BEFORE (causing infinite loop):
<TooltipTrigger asChild>
  <button type="button" onClick={(e) => e.preventDefault()}>
    <HelpCircle />
  </button>
</TooltipTrigger>

// AFTER (fixed - credit: Grok AI):
<TooltipTrigger asChild>
  <span tabIndex={0} className="inline-flex items-center justify-center w-4 h-4 cursor-help">
    <HelpCircle />
  </span>
</TooltipTrigger>
```

**DealCalculatorV3 wrapper:**
```tsx
<TooltipProvider delayDuration={200} skipDelayDuration={500}>
  <div className="deal-calculator">
    {/* ... 20+ tooltips ... */}
  </div>
</TooltipProvider>
```

**Why this works:**
- `<span>` with `tabIndex={0}` is focusable (keyboard accessible)
- No button click events = no event propagation issues
- `cursor-help` CSS gives proper ? cursor affordance
- Single `TooltipProvider` at component level (not nested)
- `skipDelayDuration={500}` enables instant tooltips when moving between them

**Outcome:**
- ✅ Advanced Mode loads without errors
- ✅ Tooltips display correctly with Radix portal/positioning
- ✅ No infinite re-renders
- ✅ Full accessibility (keyboard nav, ARIA, screen readers)
- ✅ Smart positioning (auto-adjusts to viewport)
- ✅ Keeps all Radix UI features (better than CSS workaround)

**Lessons Learned:**
- Don't use `<button onClick={preventDefault}>` inside Radix `asChild` components
- Use semantic `<span tabIndex={0}>` for non-button interactive elements
- Single `TooltipProvider` at high level, never nested
- `skipDelayDuration` prevents jarring delays when moving between tooltips
- Grok AI is excellent at debugging React component re-render loops

**Second Occurrence (Same Day):**
- **Component:** DealCalculatorV2
- **Fix Commit:** 61aeea3
- **Same Root Cause:** `InputTooltip` component had `<TooltipProvider>` wrapper around each tooltip
- **Solution:** Removed TooltipProvider from InputTooltip, added single provider at DealCalculatorV2 root (line 97)
- **Impact:** Site was crashing in production until fix deployed
- **Tracked in:** PROPIQ_BUG_TRACKER.csv

---

---

## Bug Template

```markdown
### BUG-XXX: Title

**Date Discovered:** YYYY-MM-DD
**Severity:** Critical | High | Medium | Low
**Status:** Open | Investigating | Fixed | Closed
**Component:** ComponentName

**Description:**
Brief description of the bug

**Error Message:**
```
Error text here
```

**Reproduction Steps:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Attempted Fixes:**
- [ ] Fix attempt 1
- [ ] Fix attempt 2

**Environment:**
- OS: macOS/Windows/Linux
- Browser: Chrome/Firefox/Safari
- Version: X.X.X
```

---

**Last Updated:** 2026-01-04 (Session ended 12:40 AM - launch delayed)

---

## Session Status: January 4, 2026

**Time Spent:** 4+ hours
**Issues Encountered:** 1 critical (Radix UI infinite loop)
**Resolution:** Removed all tooltips from Advanced Mode
**Next Steps:** Clean environment, verify functionality Monday

**Recommendation:** Ship without tooltips, add in v2
