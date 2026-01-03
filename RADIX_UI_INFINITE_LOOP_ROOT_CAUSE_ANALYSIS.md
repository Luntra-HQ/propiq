# Radix UI Infinite Loop - Root Cause Analysis & Solution

**Date:** January 3, 2026
**Issue:** Maximum update depth exceeded when using Radix UI Select/RadioGroup with React Hook Form
**Status:** Root cause identified, solution documented

---

## 🔍 What We Did Wrong

### Our Broken Pattern (Lines 353-378 in DealCalculatorV3.tsx)

```typescript
// ❌ THIS CAUSES INFINITE LOOP
<FormField
  control={form.control}
  name="strategy"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Investment Strategy</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a strategy" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="buy_hold">Buy & Hold</SelectItem>
          <SelectItem value="brrrr">BRRRR</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

**Why it breaks:**
1. ❌ Using `defaultValue={field.value}` with a controlled component
2. ❌ The combination triggers Radix UI's internal `BubbleInput` to dispatch click events
3. ❌ Parent component updates state → triggers re-render → value comparison fails → dispatches click → infinite loop

---

## 🎯 Root Cause (from GitHub Issue #2549)

### Technical Explanation

**Inside Radix UI's `<Checkbox>` and `<Select>` components:**

1. There's a hidden `<BubbleInput />` component that uses `useEffect` to compare values
2. When values differ, it dispatches a click event for accessibility
3. This event bubbles up to parent's `onClick` handler
4. Parent updates state → triggers re-render
5. `useEffect` runs again → sees different value → dispatches click
6. **INFINITE LOOP**

**From @takagimeow's analysis:**
```typescript
// Radix UI's internal BubbleInput behavior
useEffect(() => {
  if (checkbox.value !== bubbleInputValue) {
    bubbleInputRef.current?.click(); // THIS TRIGGERS THE LOOP
  }
}, [checkbox.value, bubbleInputValue]);
```

---

## ✅ The Correct Pattern (from shadcn/ui docs)

### For RadioGroup

```typescript
// ✅ CORRECT: Use Controller with value + onValueChange
<FormField
  control={form.control}
  name="strategy"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Investment Strategy</FormLabel>
      <FormControl>
        <RadioGroup
          value={field.value}              // NOT defaultValue!
          onValueChange={field.onChange}   // Radix's API
        >
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="buy_hold" />
            </FormControl>
            <FormLabel className="font-normal">
              Buy & Hold - Long-term rental income
            </FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="brrrr" />
            </FormControl>
            <FormLabel className="font-normal">
              BRRRR - Buy, Rehab, Rent, Refinance, Repeat
            </FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
    </FormItem>
  )}
/>
```

### For Select

```typescript
// ✅ CORRECT: Use Controller with value + onValueChange
<FormField
  control={form.control}
  name="marketTier"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Market Classification</FormLabel>
      <Select
        value={field.value}              // NOT defaultValue!
        onValueChange={field.onChange}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select market tier" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="A">Class A - Hot metros (4-5% cap)</SelectItem>
          <SelectItem value="B">Class B - Growth markets (5-7% cap)</SelectItem>
          <SelectItem value="C">Class C - Cash flow markets (7-9% cap)</SelectItem>
          <SelectItem value="D">Class D - High-risk markets (9%+ cap)</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

---

## 🔬 How to Debug with Chrome DevTools

### Step 1: Install React DevTools Extension

**Chrome Web Store:**
https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi

### Step 2: Enable Profiler Settings

1. Open Chrome DevTools (F12)
2. Click "Components" tab (React icon)
3. Click ⚙️ Settings icon
4. Under "Profiler":
   - ✅ Check "Record why each component rendered while profiling"
5. Under "General":
   - ✅ Check "Highlight updates when components render"

### Step 3: Profile the Infinite Loop

**Before fixing:**
```bash
1. Open http://localhost:5173
2. Go to React DevTools → Profiler tab
3. Click 🔴 Start Profiling (red circle button)
4. Try to interact with the Investment Strategy selector
5. Watch browser freeze (infinite loop)
6. Click ⏹️ Stop Profiling
7. Look for components that rendered 100+ times
```

**Expected results:**
- DealCalculatorV3: 300+ renders
- FormField: 300+ renders
- Select: 300+ renders
- Yellow tiles everywhere (slow renders)

**After fixing:**
```bash
1. Apply the correct pattern (value instead of defaultValue)
2. Start profiling
3. Interact with selector
4. Stop profiling
5. Should see only 2-3 renders per interaction
```

### Step 4: Identify Problem Components

**Look for:**
- Yellow tiles (components taking long to render)
- Components with high render counts (>10 in Profiler)
- Components that render on every keystroke

**Visual Highlighting:**
When "Highlight updates" is enabled, you'll see blue/green boxes flash around components that re-render. If the entire calculator flashes repeatedly without user interaction = infinite loop.

---

## 📊 Comparison: What Changed

### Before (Broken)

| Component | Pattern | Result |
|-----------|---------|--------|
| Investment Strategy | `defaultValue={field.value}` | ❌ Infinite loop |
| Market Tier | Native `<select>` | ✅ Works (workaround) |
| Projection Presets | Native `<select>` | ✅ Works (workaround) |

### After (Fixed)

| Component | Pattern | Result |
|-----------|---------|--------|
| Investment Strategy | `value={field.value}` | ✅ Works |
| Market Tier | `value={field.value}` RadioGroup | ✅ Works |
| Projection Presets | `value={field.value}` RadioGroup | ✅ Works |

---

## 🛠️ Implementation Plan

### Files to Fix

**1. DealCalculatorV3.tsx - Investment Strategy (Lines 353-378)**

```typescript
// REPLACE LINES 353-378
{/* Investment Strategy - TEMPORARILY DISABLED DUE TO INFINITE LOOP */}
{/* TODO: Fix Select component infinite render issue */}

// WITH:
<FormField
  control={form.control}
  name="strategy"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-gray-200">Investment Strategy</FormLabel>
      <FormControl>
        <RadioGroup
          value={field.value}
          onValueChange={field.onChange}
          className="flex flex-col space-y-2"
        >
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="buy_hold" />
            </FormControl>
            <FormLabel className="font-normal text-gray-200">
              Buy & Hold - Long-term rental income
            </FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="brrrr" />
            </FormControl>
            <FormLabel className="font-normal text-gray-200">
              BRRRR - Buy, Rehab, Rent, Refinance, Repeat
            </FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="flip" />
            </FormControl>
            <FormLabel className="font-normal text-gray-200">
              Fix & Flip - Buy low, renovate, sell high
            </FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
      <FormDescription className="text-xs text-gray-400">
        Your investment approach affects risk tolerance and holding period
      </FormDescription>
    </FormItem>
  )}
/>
```

**2. DealCalculatorV3.tsx - Market Tier (Lines 380-409)**

```typescript
// REPLACE native <select> with:
<FormField
  control={form.control}
  name="marketTier"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-gray-200">Market Classification</FormLabel>
      <FormControl>
        <RadioGroup
          value={field.value}
          onValueChange={field.onChange}
          className="flex flex-col space-y-2"
        >
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="A" />
            </FormControl>
            <FormLabel className="font-normal text-gray-200">
              Class A - Hot metros (4-5% cap)
            </FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="B" />
            </FormControl>
            <FormLabel className="font-normal text-gray-200">
              Class B - Growth markets (5-7% cap)
            </FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="C" />
            </FormControl>
            <FormLabel className="font-normal text-gray-200">
              Class C - Cash flow markets (7-9% cap)
            </FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="D" />
            </FormControl>
            <FormLabel className="font-normal text-gray-200">
              Class D - High-risk markets (9%+ cap)
            </FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
      <FormDescription className="text-xs text-gray-400">
        Property market tier affects expected cap rate targets
      </FormDescription>
    </FormItem>
  )}
/>
```

**3. DealCalculatorV3.tsx - Projection Presets (Lines 896-980)**

Keep as native `<select>` for now (working workaround), or upgrade to RadioGroup using same pattern.

---

## ✅ Testing Checklist

**Before Committing:**

- [ ] Remove all console.logs
- [ ] Test Investment Strategy selector (should work without freezing)
- [ ] Test Market Tier selector (should work without freezing)
- [ ] Open React DevTools Profiler
- [ ] Profile a full form interaction
- [ ] Verify render count is < 10 per interaction
- [ ] Check browser console for errors (should be 0)
- [ ] Test on mobile viewport (375px width)
- [ ] Verify glassmorphism styling matches existing design

---

## 🎯 Expected Outcome

**Before fix:**
- Browser freezes
- "Maximum update depth exceeded" error
- 300+ component renders
- Investment Strategy commented out

**After fix:**
- Smooth interaction
- 0 console errors
- 2-3 component renders per interaction
- All selectors working with proper Radix UI components

---

## 📚 Resources

### Official Documentation
- [React Hook Form - Controller](https://react-hook-form.com/api/usecontroller/controller)
- [Radix UI - RadioGroup](https://www.radix-ui.com/primitives/docs/components/radio-group)
- [shadcn/ui - React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form)

### GitHub Issues
- [Radix UI #2549 - Checkbox infinite loop](https://github.com/radix-ui/primitives/issues/2549)
- [Radix UI #3068 - Select with react-hook-form](https://github.com/radix-ui/primitives/issues/3068)
- [React Hook Form #10246 - Radix RadioGroup integration](https://github.com/orgs/react-hook-form/discussions/10246)

### Chrome DevTools
- [React Developer Tools - Chrome Extension](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Debugging React Rerenders - Bryce's Blog](https://brycedooley.com/debug-react-rerenders/)
- [React Profiler Guide - Dead Simple Chat](https://deadsimplechat.com/blog/react-profiler/)

---

## 🚀 Next Steps

1. **Immediate:** Apply the correct pattern to Investment Strategy (Issue #23)
2. **Then:** Convert Market Tier from native select to RadioGroup
3. **Optional:** Convert Projection Presets to RadioGroup (or keep as native select)
4. **Testing:** Profile with React DevTools to confirm fix
5. **Commit:** Push fix and close Issue #23

---

**Analysis Completed:** January 3, 2026
**Root Cause:** Using `defaultValue` instead of `value` with Radix UI controlled components
**Solution:** Use Controller pattern with `value={field.value}` and `onValueChange={field.onChange}`

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
