# PropIQ Strategic Roadmap - Week 1 (January 3-10, 2026)

**Goal:** Maximize calculator value and conversion rate through expert-validated features
**Target:** Mobile Claude Code can execute this independently
**Expected ROI:** 30-50% increase in trial signups from improved calculator UX

---

## 📊 Week Overview - Priority Matrix

| Priority | Feature | Impact | Effort | ROI Score | Status |
|----------|---------|--------|--------|-----------|--------|
| P0 | Fix Radix UI Infinite Loop | High | 3h | 🔥 Critical | Not Started |
| P1 | Red Flags & Green Lights Polish | High | 2h | ⭐⭐⭐⭐⭐ | Needs Testing |
| P1 | Simple Mode MVP | Very High | 6h | ⭐⭐⭐⭐⭐ | Not Started |
| P2 | Confidence Score Display | High | 2h | ⭐⭐⭐⭐ | Not Started |
| P2 | Enhanced Tooltips | Medium | 3h | ⭐⭐⭐⭐ | Partially Done |
| P3 | IRR Calculation | Medium | 4h | ⭐⭐⭐ | Not Started |
| P3 | Equity Multiple | Medium | 2h | ⭐⭐⭐ | Not Started |
| P4 | Sample Property (Charlotte) | Low | 2h | ⭐⭐ | Not Started |

**Total Estimated Effort:** 24 hours (1 week for mobile Claude Code)

---

## 🎯 Daily Breakdown (High ROI Focus)

### **Day 1 (Monday): Critical Fixes & Foundation**
**Goal:** Stabilize calculator and prepare for Simple Mode
**Time:** 4-5 hours

#### Task 1.1: Fix Radix UI Infinite Loop (P0 - Critical)
**Time:** 3 hours | **ROI:** 🔥 Unblocks future work

**Problem:**
- RadioGroup and Select components cause infinite renders with React Hook Form
- Investment Strategy selector still commented out
- Market Tier & Projection presets using native HTML selects as workaround

**Solution Path:**
```typescript
// Option A: Controlled Components with useEffect
const [value, setValue] = useState(field.value);

useEffect(() => {
  field.onChange(value);
}, [value]);

<RadioGroup value={value} onValueChange={setValue}>
  {/* RadioGroup items */}
</RadioGroup>

// Option B: Uncontrolled with ref
const ref = useRef();
<RadioGroup ref={ref} defaultValue={field.value} onValueChange={field.onChange}>

// Option C: Custom wrapper component
<FormRadioGroup field={field} options={options} />
```

**Files to Fix:**
- `frontend/src/components/DealCalculatorV3.tsx` (lines 353-378, 380-409, 873-981)
- Create: `frontend/src/components/ui/form-radio-group.tsx` (new wrapper)
- Create: `frontend/src/components/ui/form-select.tsx` (new wrapper)

**Testing Checklist:**
- [ ] Investment Strategy selector works without infinite loop
- [ ] Market Tier selector works as RadioGroup (not native select)
- [ ] Projection presets work as RadioGroup
- [ ] Form validation still works
- [ ] Values persist on tab switching

**Success Criteria:** All Select/RadioGroup components work without infinite loops

---

#### Task 1.2: Test & Polish Red Flags/Green Lights (P1)
**Time:** 1 hour | **ROI:** ⭐⭐⭐⭐⭐ Improves trust

**What to Test:**
1. Enter property with negative cash flow → See red flag
2. Enter excellent deal (10%+ CoC, DCR 1.35+) → See green lights
3. Borderline deal (CoC 7%, DCR 1.15) → See mix of flags/lights
4. Test responsive design on mobile

**Polish Tasks:**
- Adjust warning thresholds if needed
- Add animation on flag appearance (optional)
- Ensure colors match brand (red/emerald)
- Test with real property examples

**Files:**
- `frontend/src/utils/calculatorUtils.ts` (lines 398-458)
- `frontend/src/components/DealCalculatorV3.tsx` (lines 668-690)

---

### **Day 2 (Tuesday): Simple Mode MVP - Part 1**
**Goal:** Build 3-step wizard UI framework
**Time:** 6 hours

#### Task 2.1: Create Simple Mode Component Structure (3h)
**ROI:** ⭐⭐⭐⭐⭐ Main conversion driver

**File Structure:**
```
frontend/src/components/
  ├── SimpleModeWizard.tsx          (NEW - Main component)
  ├── SimpleModeStep1.tsx           (NEW - Property basics)
  ├── SimpleModeStep2.tsx           (NEW - Income/Expenses)
  ├── SimpleModeStep3.tsx           (NEW - Results)
  └── ui/
      ├── wizard-steps.tsx          (NEW - Step indicator)
      └── progress-bar.tsx          (NEW - Visual progress)
```

**Step 1: Property Basics**
```typescript
interface Step1Data {
  purchasePrice: number;
  downPaymentPercent: 5 | 10 | 15 | 20 | 25; // Dropdown presets
}

// UI: Big number input + slider
// Auto-calculate: Cash needed = down payment + closing (3%)
```

**Step 2: Income & Expenses**
```typescript
interface Step2Data {
  monthlyRent: number;
  expenseLevel: 'low' | 'average' | 'high'; // Preset buttons
}

// Expense presets:
const EXPENSE_PRESETS = {
  low: (price) => price * 0.01 / 12,      // 1% annually
  average: (price) => price * 0.015 / 12, // 1.5%
  high: (price) => price * 0.02 / 12      // 2%
};
```

**Step 3: Results**
```typescript
interface SimpleModeResults {
  verdict: 'Great Deal' | 'Good Deal' | 'Risky' | 'Pass';
  monthlyCashFlow: number;
  cashOnCashReturn: number;
  dealScore: number;
  confidence: { score: number; message: string };
  greenLights: string[];
  redFlags: string[];
}

// Big verdict at top
// 4 key metrics
// Confidence meter
// CTA: "See 5-Year Projections & Tax Benefits" → Sign up
```

---

#### Task 2.2: Implement Verdict Logic (2h)

**Verdict Calculation:**
```typescript
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
```

**Verdict Copy:**
```typescript
export const VERDICT_COPY = {
  'Great Deal': {
    emoji: '🎉',
    headline: 'Excellent Investment Opportunity!',
    message: 'Strong cash flow and solid returns. This deal meets professional investor criteria.',
    cta: 'See full 5-year wealth projection',
    color: '#28a745'
  },
  'Good Deal': {
    emoji: '✅',
    headline: 'Solid Investment',
    message: 'Positive cash flow with good fundamentals. Worth pursuing with verified rent comps.',
    cta: 'Analyze advanced metrics & scenarios',
    color: '#17a2b8'
  },
  'Risky': {
    emoji: '⚠️',
    headline: 'Proceed with Caution',
    message: 'Tight margins or negative cash flow. Consider negotiating price or increasing rent.',
    cta: 'See what price would make this a good deal',
    color: '#ffc107'
  },
  'Pass': {
    emoji: '❌',
    headline: 'Not Recommended',
    message: 'This deal doesn\'t meet investment criteria. Better opportunities exist.',
    cta: 'Learn what makes a good deal',
    color: '#dc3545'
  }
};
```

---

#### Task 2.3: Wire Up Simple/Advanced Toggle (1h)

**Add to Dashboard:**
```typescript
// In Dashboard.tsx or DealCalculator.tsx
const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

return (
  <div className="calculator-container">
    <div className="mode-toggle">
      <button
        onClick={() => setMode('simple')}
        className={mode === 'simple' ? 'active' : ''}
      >
        Simple Mode
      </button>
      <button
        onClick={() => setMode('advanced')}
        className={mode === 'advanced' ? 'active' : ''}
      >
        Advanced Mode
      </button>
    </div>

    {mode === 'simple' ? (
      <SimpleModeWizard />
    ) : (
      <DealCalculatorV3 />
    )}
  </div>
);
```

---

### **Day 3 (Wednesday): Confidence Score & Enhanced UX**
**Goal:** Build trust through transparency
**Time:** 5 hours

#### Task 3.1: Implement Confidence Score (2h)
**ROI:** ⭐⭐⭐⭐ Builds trust

**Algorithm:**
```typescript
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
```

**UI Component:**
```typescript
const ConfidenceMeter = ({ score, message }) => {
  const color = score >= 80 ? '#28a745' : score >= 60 ? '#17a2b8' : score >= 40 ? '#ffc107' : '#dc3545';

  return (
    <div className="confidence-meter">
      <div className="meter-label">Deal Confidence</div>
      <div className="meter-bar">
        <div
          className="meter-fill"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <div className="meter-message">{message}</div>
    </div>
  );
};
```

**Add to Results:**
- Display above Deal Score badge
- Allow user to toggle input quality (Estimated/Researched/Verified)

---

#### Task 3.2: Add Enhanced Tooltips (3h)
**ROI:** ⭐⭐⭐⭐ Educates beginners

**Tooltip Data Structure:**
```typescript
export const BEGINNER_TOOLTIPS = {
  purchasePrice: {
    title: "Purchase Price",
    help: "The total amount you'll pay to buy the property. Don't include rehab or closing costs here.",
    warning: "Make sure this matches the offer price or listing price you're analyzing.",
    example: "Example: $250,000 for a 3-bed, 2-bath rental"
  },

  monthlyRent: {
    title: "Monthly Rent",
    help: "Expected monthly rental income. Research 3+ comparable rentals in the area.",
    warning: "Don't use Zillow's estimate alone - verify with local property managers or recent listings.",
    example: "Example: Similar 3-bed homes in this ZIP rent for $2,200-$2,500/month"
  },

  monthlyMaintenance: {
    title: "Monthly Maintenance",
    help: "Budget for repairs, lawn care, HVAC servicing, etc.",
    warning: "Rule of thumb: 1-2% of property value annually. Older homes need more. Don't underestimate!",
    example: "Example: $300,000 home × 1.5% = $4,500/year = $375/month"
  },

  debtCoverageRatio: {
    title: "Debt Coverage Ratio (DCR)",
    help: "How much your net operating income covers your mortgage payment.",
    interpretation: "1.25+ is good. Below 1.0 means you can't cover the mortgage.",
    goodRange: "1.25 - 1.50",
    concernRange: "< 1.20"
  }
};
```

**Enhanced Tooltip Component:**
```tsx
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EnhancedTooltip = ({ metadata }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <HelpCircle className="inline w-4 h-4 ml-1 text-gray-400 hover:text-primary cursor-pointer" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-surface-300 border-glass-border p-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-200">{metadata.title}</h4>
          <p className="text-sm text-gray-300">{metadata.help}</p>
          {metadata.warning && (
            <div className="bg-yellow-500/10 border-l-2 border-yellow-500 p-2">
              <p className="text-xs text-yellow-300">⚠️ {metadata.warning}</p>
            </div>
          )}
          {metadata.example && (
            <div className="bg-blue-500/10 border-l-2 border-blue-500 p-2">
              <p className="text-xs text-blue-300">💡 {metadata.example}</p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
```

**Files to Update:**
- `frontend/src/schemas/dealCalculatorSchema.ts` - Expand fieldMetadata
- `frontend/src/components/DealCalculatorV3.tsx` - Add EnhancedTooltip to all FormLabels

---

### **Day 4 (Thursday): IRR & Advanced Metrics**
**Goal:** Add professional-grade calculations
**Time:** 6 hours

#### Task 4.1: Implement IRR Calculation (4h)
**ROI:** ⭐⭐⭐ Appeals to sophisticated investors

**IRR Algorithm (Newton-Raphson Method):**
```typescript
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
```

**Display in Advanced Metrics:**
```tsx
<div className="metric-card">
  <div className="metric-label">
    IRR (5-Year Hold)
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <HelpCircle className="inline w-4 h-4 ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Internal Rate of Return - Accounts for time value of money</p>
          <p className="text-xs mt-1">Good: &gt;15% | Excellent: &gt;20%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  <div className="metric-value">{formatPercent(irr)}</div>
</div>
```

---

#### Task 4.2: Add Equity Multiple (2h)
**ROI:** ⭐⭐⭐ Quick value add

**Calculation:**
```typescript
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

// Display
<div className="metric-card">
  <div className="metric-label">Equity Multiple (5-Year)</div>
  <div className="metric-value">{equityMultiple.toFixed(2)}x</div>
  <div className="metric-subtext">
    {equityMultiple >= 2.0 ? '✅ Strong' : equityMultiple >= 1.5 ? '✅ Good' : '⚠️ Low'}
  </div>
</div>
```

---

### **Day 5 (Friday): Polish & Testing**
**Goal:** Ensure production readiness
**Time:** 3 hours

#### Task 5.1: Sample Property (Charlotte, NC) (1h)
**ROI:** ⭐⭐ Demo preparation

**Create Pre-filled Example:**
```typescript
export const SAMPLE_PROPERTIES = {
  charlotte: {
    name: "Charlotte, NC - Single Family Rental",
    purchasePrice: 275000,
    downPaymentPercent: 20,
    interestRate: 7.5,
    loanTerm: 30,
    monthlyRent: 2200,
    annualPropertyTax: 2750,
    annualInsurance: 1400,
    monthlyHOA: 0,
    monthlyUtilities: 0,
    monthlyMaintenance: 350,
    monthlyVacancy: 110,
    monthlyPropertyManagement: 220,
    closingCosts: 8250,
    rehabCosts: 5000,
    strategy: 'rental',
    marketTier: 'B'
  }
};

// Add "Load Example" button
<button onClick={() => form.reset(SAMPLE_PROPERTIES.charlotte)}>
  Load Charlotte Example
</button>
```

---

#### Task 5.2: End-to-End Testing (2h)

**Test Checklist:**
- [ ] Simple Mode: Complete 3-step wizard
- [ ] Advanced Mode: All tabs work
- [ ] Market Tier selector works (no infinite loop)
- [ ] Projection presets work (no infinite loop)
- [ ] Red flags show for bad deals
- [ ] Green lights show for good deals
- [ ] Confidence score updates correctly
- [ ] IRR calculates without errors
- [ ] Equity Multiple displays correctly
- [ ] Sample property loads correctly
- [ ] Form validation works
- [ ] Mobile responsive
- [ ] Print functionality works

---

## 📁 File Organization Summary

### **New Files to Create:**
```
frontend/src/components/
  ├── SimpleModeWizard.tsx              (Day 2)
  ├── SimpleModeStep1.tsx               (Day 2)
  ├── SimpleModeStep2.tsx               (Day 2)
  ├── SimpleModeStep3.tsx               (Day 2)
  └── ui/
      ├── wizard-steps.tsx              (Day 2)
      ├── progress-bar.tsx              (Day 2)
      ├── form-radio-group.tsx          (Day 1)
      ├── form-select.tsx               (Day 1)
      └── enhanced-tooltip.tsx          (Day 3)

frontend/src/utils/
  ├── irrCalculations.ts                (Day 4)
  ├── verdictLogic.ts                   (Day 2)
  └── sampleProperties.ts               (Day 5)
```

### **Files to Modify:**
```
frontend/src/components/
  ├── DealCalculatorV3.tsx              (All days)
  └── Dashboard.tsx                     (Day 2)

frontend/src/utils/
  └── calculatorUtils.ts                (Days 1, 3, 4)

frontend/src/schemas/
  └── dealCalculatorSchema.ts           (Day 3)
```

---

## 🎯 Success Metrics

**Code Quality:**
- [ ] 0 TypeScript errors
- [ ] 0 console errors in production
- [ ] All Radix UI components work without infinite loops
- [ ] 100% type coverage for new functions

**User Experience:**
- [ ] Simple Mode completable in < 60 seconds
- [ ] All tooltips provide actionable guidance
- [ ] Red flags prevent bad investments
- [ ] Confidence score builds trust

**Performance:**
- [ ] Calculator loads in < 2 seconds
- [ ] All calculations complete in < 100ms
- [ ] No React performance warnings

**Conversion Impact (Post-Launch):**
- Target: 30-50% increase in trial signups
- Target: 20% more users complete Simple Mode vs old calculator
- Target: 40% of Simple Mode users upgrade to see Advanced

---

## 🚨 Known Blockers & Mitigation

**Blocker 1: Radix UI Infinite Loop**
- **Impact:** High - Blocks RadioGroup/Select usage
- **Mitigation:** Day 1 priority fix
- **Backup Plan:** Keep native HTML selects if unfixable by EOD Monday

**Blocker 2: IRR Convergence Edge Cases**
- **Impact:** Medium - May fail for unusual cash flows
- **Mitigation:** Add error handling, show "Unable to calculate" instead of NaN
- **Backup Plan:** Hide IRR if calculation fails

**Blocker 3: Mobile Testing**
- **Impact:** Medium - Simple Mode must work on mobile
- **Mitigation:** Test on Day 5 with real device
- **Backup Plan:** Mobile-specific layout adjustments

---

## 📞 Handoff Instructions for Mobile Claude Code

### **Getting Started:**
1. Pull latest from `main` branch
2. Review `WEEKEND_SPRINT_PROGRESS.md` for context
3. Review `COMPLETE_GPT_RECOMMENDATIONS.md` for full requirements
4. Start with Day 1, Task 1.1 (Radix UI fix)

### **Development Workflow:**
```bash
# Start dev server
cd frontend
npm run dev

# Open browser to http://localhost:5173
# Login with test account
# Navigate to Deal Calculator

# Make changes, test in browser
# Commit frequently with descriptive messages
```

### **Testing Each Task:**
- Complete the testing checklist for each task before moving on
- Test in Chrome, Firefox, and Safari if possible
- Test on mobile viewport (375px width)
- Verify no console errors
- Verify TypeScript compiles without errors

### **When Stuck:**
- Check `COMPLETE_GPT_RECOMMENDATIONS.md` for detailed specs
- Review existing `DealCalculatorV3.tsx` implementation patterns
- Test with sample Charlotte property data
- Ask for clarification if requirements are unclear

### **Daily Deliverables:**
- Functional code committed to `feature/week-1-enhancements` branch
- Testing notes in commit message
- Update `STRATEGIC_ROADMAP_WEEK_1.md` with progress checkmarks
- Screenshot of major UI changes

---

## 🎁 Bonus Tasks (If Time Permits)

**Bonus 1: Deal Comparison (2h)**
- Allow users to save & compare multiple deals side-by-side
- Show which deal has better CoC, cash flow, IRR

**Bonus 2: Email Report (1h)**
- "Email me this analysis" button
- PDF export of deal summary

**Bonus 3: Deal Score Breakdown (1h)**
- Show how each factor contributes to 0-100 score
- Educational for beginners

**Bonus 4: Market Data Integration (4h)**
- Fetch rent comps from RentCast API
- Auto-populate average rents for ZIP code

---

**Last Updated:** January 3, 2026
**Maintained By:** PropIQ Development Team
**Questions?** Review COMPLETE_GPT_RECOMMENDATIONS.md or ask in Slack
