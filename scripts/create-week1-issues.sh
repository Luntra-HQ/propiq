#!/bin/bash

# PropIQ Week 1 GitHub Issues Creator
# Creates organized issues for the strategic roadmap

set -e

echo "🚀 Creating GitHub Issues for PropIQ Week 1 Roadmap..."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Install it with: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

# Create labels if they don't exist
echo "📋 Creating labels..."
gh label create "calculator" --color "0E8A16" --description "Deal Calculator features" --force 2>/dev/null || true
gh label create "ui-enhancement" --color "1D76DB" --description "UI/UX improvements" --force 2>/dev/null || true
gh label create "bug" --color "D73A4A" --description "Something isn't working" --force 2>/dev/null || true
gh label create "high-roi" --color "FBCA04" --description "High return on investment" --force 2>/dev/null || true
gh label create "weekend-sprint" --color "C2E0C6" --description "Weekend sprint work" --force 2>/dev/null || true
gh label create "week-1" --color "BFD4F2" --description "Week 1 strategic roadmap" --force 2>/dev/null || true
gh label create "p0-critical" --color "B60205" --description "Priority 0 - Critical" --force 2>/dev/null || true
gh label create "p1-high" --color "D93F0B" --description "Priority 1 - High" --force 2>/dev/null || true
gh label create "p2-medium" --color "FBCA04" --description "Priority 2 - Medium" --force 2>/dev/null || true

echo ""
echo "✅ Labels created"
echo ""

# Issue 1: Weekend Sprint Completion (Documentation)
echo "📝 Creating Issue #1: Weekend Sprint Completion Report..."
gh issue create \
  --title "✅ Weekend Sprint: Market-Aware Deal Score, Presets & Warning System" \
  --body "# Weekend Sprint Completion Report

## 🎯 Summary
Successfully implemented 3 of 4 Quick Wins from Real Estate GPT recommendations.

## ✅ Completed Features

### 1. Market-Aware Deal Score (A/B/C/D Tiers)
- Added market tier classification to Deal Score algorithm
- Created dropdown selector for Class A/B/C/D markets
- Deal recommendations now contextually accurate based on market type
- **Files Modified:**
  - \`frontend/src/utils/calculatorUtils.ts\`
  - \`frontend/src/schemas/dealCalculatorSchema.ts\`
  - \`frontend/src/components/DealCalculatorV3.tsx\`

### 2. Smart Presets for Projections
- Rent Growth: Conservative (2%), Average (3%), Aggressive (5%)
- Expense Growth: Low (1.5%), Typical (2%), High (3%)
- Appreciation: Conservative (3%), Average (4%), Optimistic (5%), Aggressive (6%)
- Educational tooltips for each preset
- **Files Modified:**
  - \`frontend/src/components/DealCalculatorV3.tsx\`

### 3. Red Flags & Green Lights Warning System
- 6 red flag conditions (negative cash flow, low DCR, etc.)
- 5 green light conditions (strong cash flow, excellent CoC, etc.)
- Color-coded display boxes in Basic Analysis tab
- **Files Modified:**
  - \`frontend/src/utils/calculatorUtils.ts\`
  - \`frontend/src/components/DealCalculatorV3.tsx\`

## 🔧 Technical Challenges

### Radix UI Infinite Loop Issue
- **Problem:** RadioGroup and Select components cause infinite renders with React Hook Form
- **Temporary Fix:** Replaced with native HTML \`<select>\` elements
- **Files Affected:** Investment Strategy selector (commented out), Market Tier, Projection presets
- **Next Steps:** See Issue #2 for permanent fix

## 📊 Impact
- **User Benefit:** Contextual deal scoring, guided assumptions, risk awareness
- **Code Quality:** Fully typed, 0 TypeScript errors, HMR working
- **Performance:** No regressions, all calculations < 50ms

## 📁 Documentation
- \`WEEKEND_SPRINT_PROGRESS.md\` - Detailed progress report
- \`COMPLETE_GPT_RECOMMENDATIONS.md\` - Full GPT recommendations
- \`STRATEGIC_ROADMAP_WEEK_1.md\` - Week ahead plan

## ✅ Acceptance Criteria
- [x] Market tier selector working
- [x] Smart presets functional
- [x] Red flags display for poor deals
- [x] Green lights display for good deals
- [x] 0 TypeScript errors
- [x] 0 console errors
- [x] Documentation complete

## 🔗 Related Issues
- #2 - Fix Radix UI infinite loop (blocking future RadioGroups)
" \
  --label "calculator,ui-enhancement,weekend-sprint,high-roi" \
  --assignee "@me"

echo "✅ Issue #1 created"
echo ""

# Issue 2: Fix Radix UI Infinite Loop (P0 - Critical)
echo "📝 Creating Issue #2: Fix Radix UI Infinite Loop..."
gh issue create \
  --title "🔥 [P0] Fix Radix UI RadioGroup/Select Infinite Loop with React Hook Form" \
  --body "# Critical Bug: Infinite Render Loop

## 🚨 Priority: P0 (Critical)
**Blocks:** Investment Strategy selector, future RadioGroup components
**Impact:** High - Prevents use of Radix UI form components
**Effort:** 3 hours
**ROI:** 🔥 Unblocks all future Radix UI work

## 🐛 Problem Description

Radix UI \`RadioGroup\` and \`Select\` components cause infinite render loops when integrated with React Hook Form.

**Error:**
\`\`\`
Error: Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
\`\`\`

**Current Workaround:**
- Investment Strategy selector commented out (lines 353-378 in DealCalculatorV3.tsx)
- Market Tier using native HTML \`<select>\` instead of RadioGroup
- Projection presets using native HTML \`<select>\` instead of RadioGroup

## 🔍 Root Cause

Using \`defaultValue={field.value}\` with Radix components causes React to re-render infinitely. Radix UI components don't integrate smoothly with React Hook Form's controlled inputs.

## 🎯 Acceptance Criteria

- [ ] Investment Strategy selector works without infinite loop
- [ ] Market Tier selector works as RadioGroup (not native select)
- [ ] Projection presets work as RadioGroup
- [ ] Form validation still works
- [ ] Values persist on tab switching
- [ ] No console errors
- [ ] TypeScript compiles without errors

## 💡 Proposed Solutions

### Option A: Controlled Components with useEffect
\`\`\`typescript
const [value, setValue] = useState(field.value);

useEffect(() => {
  field.onChange(value);
}, [value]);

<RadioGroup value={value} onValueChange={setValue}>
  {/* RadioGroup items */}
</RadioGroup>
\`\`\`

### Option B: Uncontrolled with Ref
\`\`\`typescript
const ref = useRef();
<RadioGroup ref={ref} defaultValue={field.value} onValueChange={field.onChange}>
\`\`\`

### Option C: Custom Wrapper Component
Create \`FormRadioGroup\` and \`FormSelect\` wrapper components that properly handle React Hook Form integration.

\`\`\`typescript
// frontend/src/components/ui/form-radio-group.tsx
import { Control, FieldValues, Path } from 'react-hook-form';
import { RadioGroup } from '@/components/ui/radio-group';

interface FormRadioGroupProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  options: Array<{ value: string; label: string }>;
}

export function FormRadioGroup<T extends FieldValues>({
  control,
  name,
  options
}: FormRadioGroupProps<T>) {
  // Implementation that avoids infinite loop
}
\`\`\`

## 📁 Files to Fix

- \`frontend/src/components/DealCalculatorV3.tsx\` (lines 353-378, 380-409, 873-981)
- Create: \`frontend/src/components/ui/form-radio-group.tsx\` (new wrapper)
- Create: \`frontend/src/components/ui/form-select.tsx\` (new wrapper)

## 🧪 Testing Checklist

- [ ] Test Investment Strategy selector
- [ ] Test Market Tier selector
- [ ] Test Rent Growth preset selector
- [ ] Test Expense Growth preset selector
- [ ] Test Appreciation preset selector
- [ ] Test form validation on all fields
- [ ] Test tab switching (values persist)
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test mobile viewport (375px)

## 🔗 Resources

- [React Hook Form + Radix UI Integration](https://react-hook-form.com/get-started#IntegratingControlledInputs)
- [Radix UI RadioGroup Docs](https://www.radix-ui.com/primitives/docs/components/radio-group)
- [Shadcn UI Form Pattern](https://ui.shadcn.com/docs/components/form)

## 📊 Definition of Done

- All RadioGroup/Select components work without infinite loops
- Investment Strategy selector uncommented and functional
- Native HTML selects replaced with proper Radix UI components
- Documentation updated with proper usage pattern
- Reusable wrapper components created for future use
" \
  --label "bug,calculator,p0-critical,week-1,high-roi" \
  --assignee "@me"

echo "✅ Issue #2 created"
echo ""

# Issue 3: Simple Mode MVP
echo "📝 Creating Issue #3: Simple Mode MVP..."
gh issue create \
  --title "🎯 [P1] Build Simple Mode MVP - 3-Step Wizard for Beginners" \
  --body "# Simple Mode MVP - Beginner-Friendly Calculator

## 🎯 Priority: P1 (High)
**Impact:** Very High - Main conversion driver
**Effort:** 6 hours
**ROI:** ⭐⭐⭐⭐⭐

## 📋 Overview

Create a simplified 3-step wizard for first-time real estate investors. Replace overwhelming form with guided flow.

## 🎨 User Flow

### Step 1: Property Basics
**Inputs:**
- Purchase Price (big number input)
- Down Payment (dropdown: 5%, 10%, 15%, 20%, 25%)

**Auto-calculate:**
- Cash needed = down payment + closing costs (3%)

### Step 2: Income & Expenses
**Inputs:**
- Monthly Rent (big number input)
- Expense Level (3 buttons: Low/Average/High)

**Expense Presets:**
\`\`\`typescript
const EXPENSE_PRESETS = {
  low: (price) => price * 0.01 / 12,      // 1% annually
  average: (price) => price * 0.015 / 12, // 1.5%
  high: (price) => price * 0.02 / 12      // 2%
};
\`\`\`

### Step 3: Results & Verdict
**Display:**
- Big verdict badge (Great Deal / Good Deal / Risky / Pass)
- Monthly cash flow
- Cash-on-cash return
- Deal score
- Confidence meter
- Red flags (if any)
- Green lights (if any)
- **CTA:** \"See 5-Year Projections & Tax Benefits\" → Advanced Mode

## 🎨 UI Components to Create

\`\`\`
frontend/src/components/
  ├── SimpleModeWizard.tsx          (Main component)
  ├── SimpleModeStep1.tsx           (Property basics)
  ├── SimpleModeStep2.tsx           (Income/Expenses)
  ├── SimpleModeStep3.tsx           (Results)
  └── ui/
      ├── wizard-steps.tsx          (Step indicator)
      └── progress-bar.tsx          (Visual progress)
\`\`\`

## 🧮 Verdict Logic

\`\`\`typescript
export const calculateSimpleModeVerdict = (
  metrics: CalculatedMetrics
): 'Great Deal' | 'Good Deal' | 'Risky' | 'Pass' => {
  if (metrics.dealScore >= 80 && metrics.monthlyCashFlow > 0) {
    return 'Great Deal';
  } else if (metrics.dealScore >= 65 && metrics.monthlyCashFlow >= 0) {
    return 'Good Deal';
  } else if (metrics.dealScore >= 35 || metrics.monthlyCashFlow >= -200) {
    return 'Risky';
  } else {
    return 'Pass';
  }
};
\`\`\`

## 🎨 Verdict Copy

\`\`\`typescript
export const VERDICT_COPY = {
  'Great Deal': {
    emoji: '🎉',
    headline: 'Excellent Investment Opportunity!',
    message: 'Strong cash flow and solid returns. This deal meets professional investor criteria.',
    cta: 'See full 5-year wealth projection'
  },
  // ... (see STRATEGIC_ROADMAP_WEEK_1.md for full copy)
};
\`\`\`

## 🔄 Mode Toggle

Add toggle between Simple/Advanced modes in Dashboard or DealCalculator:

\`\`\`typescript
const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

return (
  <div className=\"mode-toggle\">
    <button onClick={() => setMode('simple')}>Simple Mode</button>
    <button onClick={() => setMode('advanced')}>Advanced Mode</button>
  </div>
);
\`\`\`

## ✅ Acceptance Criteria

- [ ] 3-step wizard functional
- [ ] Step 1: Property basics input works
- [ ] Step 2: Income/expense input works
- [ ] Step 3: Results display with verdict
- [ ] Verdict logic calculates correctly
- [ ] Red flags/green lights show appropriately
- [ ] Confidence meter displays
- [ ] CTA button links to Advanced Mode
- [ ] Wizard completable in < 60 seconds
- [ ] Mobile responsive (375px width)
- [ ] Glassmorphism design consistent
- [ ] 0 TypeScript errors

## 🧪 Testing Scenarios

1. **Good Deal:**
   - \$250K purchase, 20% down
   - \$2,200 rent, average expenses
   - Should show \"Good Deal\" verdict

2. **Great Deal:**
   - \$200K purchase, 25% down
   - \$2,500 rent, low expenses
   - Should show \"Great Deal\" verdict

3. **Risky Deal:**
   - \$350K purchase, 5% down
   - \$2,000 rent, high expenses
   - Should show \"Risky\" verdict

4. **Pass:**
   - \$400K purchase, 10% down
   - \$1,800 rent, high expenses
   - Should show \"Pass\" verdict

## 📁 Files to Create

- \`frontend/src/components/SimpleModeWizard.tsx\`
- \`frontend/src/components/SimpleModeStep1.tsx\`
- \`frontend/src/components/SimpleModeStep2.tsx\`
- \`frontend/src/components/SimpleModeStep3.tsx\`
- \`frontend/src/components/ui/wizard-steps.tsx\`
- \`frontend/src/components/ui/progress-bar.tsx\`
- \`frontend/src/utils/verdictLogic.ts\`

## 📁 Files to Modify

- \`frontend/src/components/Dashboard.tsx\` (add mode toggle)
- \`frontend/src/utils/calculatorUtils.ts\` (add verdict exports)

## 📊 Success Metrics (Post-Launch)

- Target: 40% of users choose Simple Mode initially
- Target: 30% of Simple Mode users upgrade to Advanced
- Target: Simple Mode users complete in < 90 seconds
- Target: 50% increase in trial signups from improved UX

## 🔗 Related Issues

- #1 - Weekend Sprint completion (provides red flags/green lights)
- #2 - Radix UI fix (needed for step indicator)
" \
  --label "calculator,ui-enhancement,p1-high,week-1,high-roi" \
  --assignee "@me"

echo "✅ Issue #3 created"
echo ""

# Issue 4: Confidence Score
echo "📝 Creating Issue #4: Confidence Score Display..."
gh issue create \
  --title "🎯 [P2] Add Confidence Score & Meter to Build Trust" \
  --body "# Confidence Score Feature

## 🎯 Priority: P2 (Medium-High)
**Impact:** High - Builds trust with transparent data quality
**Effort:** 2 hours
**ROI:** ⭐⭐⭐⭐

## 📋 Overview

Add a confidence score that shows users how reliable their analysis is based on:
1. Deal metrics quality (70 points)
2. Input data quality (30 points)

## 🧮 Algorithm

\`\`\`typescript
export const calculateConfidenceScore = (
  metrics: CalculatedMetrics,
  userInputQuality: 'estimated' | 'researched' | 'verified'
): { score: number; message: string } => {
  let confidence = 0;

  // Base metrics quality (70 points)
  if (metrics.monthlyCashFlow > 0) confidence += 30;
  if (metrics.debtCoverageRatio >= 1.25) confidence += 25;
  if (metrics.cashOnCashReturn >= 8) confidence += 15;

  // Input data quality (30 points)
  if (userInputQuality === 'verified') confidence += 30;
  else if (userInputQuality === 'researched') confidence += 20;
  else confidence += 10;

  let message = '';
  if (confidence >= 80) {
    message = '🎯 High confidence - Strong deal with verified data';
  } else if (confidence >= 60) {
    message = '✅ Good confidence - Solid deal, verify rent comps';
  } else if (confidence >= 40) {
    message = '⚠️ Medium confidence - Research more before committing';
  } else {
    message = '⚠️ Low confidence - Deal needs more work or better data';
  }

  return { score: confidence, message };
};
\`\`\`

## 🎨 UI Component

\`\`\`typescript
const ConfidenceMeter = ({ score, message }) => {
  const color =
    score >= 80 ? '#28a745' :
    score >= 60 ? '#17a2b8' :
    score >= 40 ? '#ffc107' :
    '#dc3545';

  return (
    <div className=\"confidence-meter\">
      <div className=\"meter-label\">Deal Confidence</div>
      <div className=\"meter-bar\">
        <div
          className=\"meter-fill\"
          style={{ width: \`\${score}%\`, backgroundColor: color }}
        />
      </div>
      <div className=\"meter-percentage\">{score}%</div>
      <div className=\"meter-message\">{message}</div>
    </div>
  );
};
\`\`\`

## 📍 Display Location

Add confidence meter **above Deal Score badge** in Basic Analysis tab results.

Also add input quality selector:
\`\`\`tsx
<div className=\"input-quality-selector\">
  <label>How did you get your rent estimate?</label>
  <select onChange={(e) => setInputQuality(e.target.value)}>
    <option value=\"estimated\">Estimated (Zillow/Redfin)</option>
    <option value=\"researched\">Researched (3+ comps)</option>
    <option value=\"verified\">Verified (property manager quote)</option>
  </select>
</div>
\`\`\`

## ✅ Acceptance Criteria

- [ ] Confidence score calculates correctly
- [ ] Meter displays with appropriate color
- [ ] Message updates based on score
- [ ] Input quality selector works
- [ ] Score updates when input quality changes
- [ ] Displays in Basic Analysis tab
- [ ] Mobile responsive
- [ ] Glassmorphism styling consistent

## 🧪 Testing Scenarios

1. **High Confidence (80%+):**
   - Good metrics + verified data
   - Should show green meter

2. **Medium Confidence (40-60%):**
   - Okay metrics + estimated data
   - Should show yellow meter

3. **Low Confidence (<40%):**
   - Poor metrics + estimated data
   - Should show red meter

## 📁 Files to Modify

- \`frontend/src/utils/calculatorUtils.ts\` (add calculateConfidenceScore)
- \`frontend/src/components/DealCalculatorV3.tsx\` (add ConfidenceMeter component)

## 📊 User Benefits

- **Transparency:** Users know how much to trust the analysis
- **Education:** Teaches importance of verified rent comps
- **Risk Awareness:** Prevents overconfidence in weak data
- **Trust Building:** Shows PropIQ cares about data quality

## 🔗 Related Issues

- #1 - Weekend Sprint (provides red flags/green lights foundation)
- #3 - Simple Mode (needs confidence meter in results)
" \
  --label "calculator,ui-enhancement,p2-medium,week-1,high-roi" \
  --assignee "@me"

echo "✅ Issue #4 created"
echo ""

# Issue 5: Enhanced Tooltips
echo "📝 Creating Issue #5: Enhanced Tooltips..."
gh issue create \
  --title "📚 [P2] Add Enhanced Beginner-Friendly Tooltips to All Fields" \
  --body "# Enhanced Tooltips Feature

## 🎯 Priority: P2 (Medium)
**Impact:** Medium - Educates beginners, reduces support tickets
**Effort:** 3 hours
**ROI:** ⭐⭐⭐⭐

## 📋 Overview

Enhance existing tooltips with:
- Detailed help text
- Common warnings/pitfalls
- Real-world examples
- Good/concern ranges

## 🎨 Tooltip Data Structure

\`\`\`typescript
export const BEGINNER_TOOLTIPS = {
  purchasePrice: {
    title: \"Purchase Price\",
    help: \"The total amount you'll pay to buy the property. Don't include rehab or closing costs here.\",
    warning: \"Make sure this matches the offer price or listing price you're analyzing.\",
    example: \"Example: \$250,000 for a 3-bed, 2-bath rental\"
  },

  monthlyRent: {
    title: \"Monthly Rent\",
    help: \"Expected monthly rental income. Research 3+ comparable rentals in the area.\",
    warning: \"Don't use Zillow's estimate alone - verify with local property managers or recent listings.\",
    example: \"Example: Similar 3-bed homes in this ZIP rent for \$2,200-\$2,500/month\"
  },

  monthlyMaintenance: {
    title: \"Monthly Maintenance\",
    help: \"Budget for repairs, lawn care, HVAC servicing, etc.\",
    warning: \"Rule of thumb: 1-2% of property value annually. Older homes need more. Don't underestimate!\",
    example: \"Example: \$300,000 home × 1.5% = \$4,500/year = \$375/month\"
  },

  debtCoverageRatio: {
    title: \"Debt Coverage Ratio (DCR)\",
    help: \"How much your net operating income covers your mortgage payment.\",
    interpretation: \"1.25+ is good. Below 1.0 means you can't cover the mortgage.\",
    goodRange: \"1.25 - 1.50\",
    concernRange: \"< 1.20\"
  }
};
\`\`\`

## 🎨 Enhanced Tooltip Component

\`\`\`tsx
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EnhancedTooltip = ({ metadata }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <HelpCircle className=\"inline w-4 h-4 ml-1 text-gray-400 hover:text-primary cursor-pointer\" />
      </TooltipTrigger>
      <TooltipContent className=\"max-w-xs bg-surface-300 border-glass-border p-4\">
        <div className=\"space-y-2\">
          <h4 className=\"font-semibold text-gray-200\">{metadata.title}</h4>
          <p className=\"text-sm text-gray-300\">{metadata.help}</p>
          {metadata.warning && (
            <div className=\"bg-yellow-500/10 border-l-2 border-yellow-500 p-2\">
              <p className=\"text-xs text-yellow-300\">⚠️ {metadata.warning}</p>
            </div>
          )}
          {metadata.example && (
            <div className=\"bg-blue-500/10 border-l-2 border-blue-500 p-2\">
              <p className=\"text-xs text-blue-300\">💡 {metadata.example}</p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
\`\`\`

## ✅ Fields Needing Enhanced Tooltips

**Basic Tab:**
- [ ] Purchase Price
- [ ] Down Payment
- [ ] Interest Rate
- [ ] Loan Term
- [ ] Monthly Rent
- [ ] Annual Property Tax
- [ ] Annual Insurance
- [ ] Monthly HOA
- [ ] Monthly Utilities
- [ ] Monthly Maintenance
- [ ] Monthly Vacancy
- [ ] Monthly Property Management
- [ ] Closing Costs
- [ ] Rehab Costs

**Advanced Tab (Metrics):**
- [ ] Debt Coverage Ratio
- [ ] Operating Expense Ratio
- [ ] Break-Even Occupancy
- [ ] Gross Rent Multiplier
- [ ] Cap Rate
- [ ] Cash-on-Cash Return
- [ ] 1% Rule

## 📁 Files to Modify

- \`frontend/src/schemas/dealCalculatorSchema.ts\` - Expand fieldMetadata
- \`frontend/src/components/DealCalculatorV3.tsx\` - Add EnhancedTooltip to FormLabels
- Create: \`frontend/src/components/ui/enhanced-tooltip.tsx\` (new component)

## ✅ Acceptance Criteria

- [ ] All 14 basic input fields have enhanced tooltips
- [ ] All 7 advanced metrics have enhanced tooltips
- [ ] Tooltips show on hover/click
- [ ] Warning boxes display when present
- [ ] Example boxes display when present
- [ ] Mobile-friendly (tap to open, tap outside to close)
- [ ] Glassmorphism styling consistent
- [ ] 0 TypeScript errors

## 🧪 Testing Checklist

- [ ] Test each tooltip on desktop
- [ ] Test each tooltip on mobile (tap interaction)
- [ ] Verify examples are realistic
- [ ] Verify warnings are actionable
- [ ] Check for typos/grammar
- [ ] Ensure tooltips don't overlap UI
- [ ] Test in Chrome, Firefox, Safari

## 📊 User Benefits

- **Education:** Teaches real estate investing fundamentals
- **Confidence:** Users feel guided, not overwhelmed
- **Accuracy:** Better inputs = better analysis
- **Support Reduction:** Fewer \"What does this mean?\" questions

## 🔗 Related Issues

- #3 - Simple Mode (can use subset of tooltips)
" \
  --label "calculator,ui-enhancement,p2-medium,week-1" \
  --assignee "@me"

echo "✅ Issue #5 created"
echo ""

# Issue 6: IRR Calculation
echo "📝 Creating Issue #6: IRR Calculation..."
gh issue create \
  --title "📊 [P3] Add IRR (Internal Rate of Return) Calculation" \
  --body "# IRR Calculation Feature

## 🎯 Priority: P3 (Medium)
**Impact:** Medium - Appeals to sophisticated investors
**Effort:** 4 hours
**ROI:** ⭐⭐⭐

## 📋 Overview

Add Internal Rate of Return (IRR) calculation to Advanced Metrics tab. IRR accounts for time value of money and is the gold standard for comparing investments.

## 🧮 IRR Algorithm (Newton-Raphson Method)

\`\`\`typescript
/**
 * Calculate Internal Rate of Return using Newton-Raphson method
 * IRR is the discount rate where NPV = 0
 */
export const calculateIRR = (
  cashFlows: number[],
  guess: number = 0.1,
  maxIterations: number = 100,
  tolerance: number = 0.0001
): number => {
  let irr = guess;

  for (let i = 0; i < maxIterations; i++) {
    const npv = cashFlows.reduce((sum, cf, t) => {
      return sum + cf / Math.pow(1 + irr, t);
    }, 0);

    const npvDerivative = cashFlows.reduce((sum, cf, t) => {
      return sum - (t * cf) / Math.pow(1 + irr, t + 1);
    }, 0);

    const newIrr = irr - npv / npvDerivative;

    if (Math.abs(newIrr - irr) < tolerance) {
      return newIrr * 100; // Return as percentage
    }

    irr = newIrr;
  }

  return NaN; // Did not converge
};

/**
 * Get cash flows for IRR calculation
 */
export const getPropertyCashFlows = (
  inputs: PropertyInputs,
  metrics: CalculatedMetrics,
  holdPeriod: number = 5
): number[] => {
  const cashFlows: number[] = [];

  // Year 0: Initial investment (negative)
  cashFlows.push(-metrics.totalCashInvested);

  // Years 1-5: Annual cash flow + equity at sale
  const projections = generate5YearProjections(inputs, metrics);

  projections.forEach((projection, index) => {
    if (index < holdPeriod - 1) {
      // Years 1-4: Just cash flow
      cashFlows.push(projection.annualCashFlow);
    } else {
      // Year 5: Cash flow + sale proceeds
      const saleProceeds = projection.equity - (inputs.purchasePrice * 0.06); // 6% selling costs
      cashFlows.push(projection.annualCashFlow + saleProceeds);
    }
  });

  return cashFlows;
};
\`\`\`

## 🎨 UI Display

Add to Advanced Metrics tab:

\`\`\`tsx
<div className=\"metric-card\">
  <div className=\"metric-label\">
    IRR (5-Year Hold)
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <HelpCircle className=\"inline w-4 h-4 ml-1\" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Internal Rate of Return - Accounts for time value of money</p>
          <p className=\"text-xs mt-1\">Good: &gt;15% | Excellent: &gt;20%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  <div className=\"metric-value\">
    {isNaN(irr) ? 'N/A' : formatPercent(irr)}
  </div>
  <div className=\"metric-subtext\">
    {irr >= 20 ? '🎯 Excellent' : irr >= 15 ? '✅ Good' : irr >= 10 ? '⚠️ Fair' : '❌ Poor'}
  </div>
</div>
\`\`\`

## ⚠️ Edge Cases to Handle

1. **Non-convergence:**
   - If Newton-Raphson doesn't converge in 100 iterations, return NaN
   - Display \"Unable to calculate\" instead of showing NaN

2. **Unusual Cash Flows:**
   - Multiple sign changes in cash flows can cause issues
   - Add validation: warn if more than 2 sign changes

3. **Negative Initial Investment:**
   - Ensure totalCashInvested is always negative in Year 0
   - Handle edge case where down payment is 0%

## ✅ Acceptance Criteria

- [ ] IRR calculates correctly for standard deals
- [ ] Handles edge cases gracefully (returns NaN or 'N/A')
- [ ] Displays in Advanced Metrics tab
- [ ] Tooltip explains IRR to beginners
- [ ] Shows rating (Excellent/Good/Fair/Poor)
- [ ] Assumes 5-year hold period
- [ ] Accounts for 6% selling costs at exit
- [ ] 0 TypeScript errors
- [ ] Unit tests pass

## 🧪 Testing Scenarios

1. **Standard Rental:**
   - \$250K purchase, 20% down
   - \$2,200 rent, 3% appreciation
   - Expected IRR: ~12-15%

2. **BRRRR Deal:**
   - \$200K purchase, \$50K rehab
   - \$2,500 rent, 5% appreciation
   - Expected IRR: ~18-22%

3. **Edge Case (Low Returns):**
   - \$400K purchase, 10% down
   - \$2,000 rent, 2% appreciation
   - Expected IRR: ~5-8%

## 📁 Files to Create

- \`frontend/src/utils/irrCalculations.ts\` (new utility file)

## 📁 Files to Modify

- \`frontend/src/utils/calculatorUtils.ts\` (export getPropertyCashFlows)
- \`frontend/src/components/DealCalculatorV3.tsx\` (add IRR to Advanced Metrics)

## 📊 Benchmarks (2026 Market)

- **Excellent:** > 20% IRR
- **Good:** 15-20% IRR
- **Fair:** 10-15% IRR
- **Poor:** < 10% IRR

## 🔗 Resources

- [IRR Explanation](https://www.investopedia.com/terms/i/irr.asp)
- [Newton-Raphson Method](https://en.wikipedia.org/wiki/Newton%27s_method)

## 🔗 Related Issues

- #7 - Equity Multiple (complementary metric)
" \
  --label "calculator,p3-medium,week-1" \
  --assignee "@me"

echo "✅ Issue #6 created"
echo ""

# Issue 7: Equity Multiple
echo "📝 Creating Issue #7: Equity Multiple..."
gh issue create \
  --title "📊 [P3] Add Equity Multiple Metric" \
  --body "# Equity Multiple Feature

## 🎯 Priority: P3 (Medium)
**Impact:** Medium - Quick value add for pro investors
**Effort:** 2 hours
**ROI:** ⭐⭐⭐

## 📋 Overview

Add Equity Multiple calculation to Advanced Metrics tab. Shows total cash returned divided by total cash invested over hold period.

## 🧮 Calculation

\`\`\`typescript
/**
 * Calculate Equity Multiple
 * Total Cash Returned / Total Cash Invested
 */
export const calculateEquityMultiple = (
  totalCashInvested: number,
  cumulativeCashFlow: number,
  equityAtExit: number
): number => {
  const totalReturns = cumulativeCashFlow + equityAtExit;
  return totalReturns / totalCashInvested;
};
\`\`\`

## 🎨 UI Display

Add to Advanced Metrics tab (next to IRR):

\`\`\`tsx
<div className=\"metric-card\">
  <div className=\"metric-label\">
    Equity Multiple (5-Year)
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <HelpCircle className=\"inline w-4 h-4 ml-1\" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Total cash returned / Total cash invested</p>
          <p className=\"text-xs mt-1\">Example: 2.5x means you get \$2.50 back for every \$1 invested</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  <div className=\"metric-value\">{equityMultiple.toFixed(2)}x</div>
  <div className=\"metric-subtext\">
    {equityMultiple >= 2.0 ? '✅ Strong' : equityMultiple >= 1.5 ? '✅ Good' : '⚠️ Low'}
  </div>
</div>
\`\`\`

## ✅ Acceptance Criteria

- [ ] Equity multiple calculates correctly
- [ ] Displays as \"2.5x\" format
- [ ] Shows rating (Strong/Good/Low)
- [ ] Assumes 5-year hold period
- [ ] Accounts for cumulative cash flow + equity at exit
- [ ] Tooltip explains metric to beginners
- [ ] 0 TypeScript errors

## 🧪 Testing Scenarios

1. **Strong Deal:**
   - 5-year cumulative cash flow: \$30K
   - Equity at exit: \$120K
   - Total invested: \$60K
   - Expected multiple: 2.5x

2. **Good Deal:**
   - 5-year cumulative cash flow: \$20K
   - Equity at exit: \$80K
   - Total invested: \$60K
   - Expected multiple: 1.67x

3. **Weak Deal:**
   - 5-year cumulative cash flow: \$10K
   - Equity at exit: \$50K
   - Total invested: \$60K
   - Expected multiple: 1.0x

## 📊 Benchmarks

- **Strong:** ≥ 2.0x
- **Good:** 1.5 - 2.0x
- **Fair:** 1.2 - 1.5x
- **Poor:** < 1.2x

## 📁 Files to Modify

- \`frontend/src/utils/calculatorUtils.ts\` (add calculateEquityMultiple)
- \`frontend/src/components/DealCalculatorV3.tsx\` (add to Advanced Metrics)

## 🔗 Related Issues

- #6 - IRR Calculation (complementary metric)
" \
  --label "calculator,p3-medium,week-1" \
  --assignee "@me"

echo "✅ Issue #7 created"
echo ""

echo "🎉 All issues created successfully!"
echo ""
echo "📋 Summary:"
echo "  - Issue #1: Weekend Sprint Completion Report ✅"
echo "  - Issue #2: Fix Radix UI Infinite Loop (P0) 🔥"
echo "  - Issue #3: Simple Mode MVP (P1) 🎯"
echo "  - Issue #4: Confidence Score (P2) 🎯"
echo "  - Issue #5: Enhanced Tooltips (P2) 📚"
echo "  - Issue #6: IRR Calculation (P3) 📊"
echo "  - Issue #7: Equity Multiple (P3) 📊"
echo ""
echo "🔗 View all issues: gh issue list"
echo "🔗 View project board: gh project list"
echo ""
