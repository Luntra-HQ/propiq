# Simple Mode Design Specification

**Created:** January 3, 2026
**Purpose:** 3-step wizard for beginner investors to get instant deal verdict
**Role:** Gemini (Design & Specification)

---

## 🎯 User Flow

```
Step 1: Property Basics (15 seconds)
  ↓
Step 2: Income & Expenses (20 seconds)
  ↓
Step 3: Results & Verdict (instant)
  ↓
CTA: Sign up to see 5-year projections
```

**Total time to verdict:** 35 seconds

---

## 📐 Component Architecture

```
SimpleModeWizard (Container)
  ├── WizardSteps (Progress indicator: 1/3, 2/3, 3/3)
  ├── SimpleModeStep1 (Property basics)
  ├── SimpleModeStep2 (Income/Expenses)
  └── SimpleModeStep3 (Results + Verdict)
```

---

## 🔧 Component Specifications

### SimpleModeWizard.tsx

**Purpose:** Container component managing wizard state and navigation

**State:**
```typescript
interface WizardState {
  currentStep: 1 | 2 | 3;
  step1Data: {
    purchasePrice: number;
    downPaymentPercent: 5 | 10 | 15 | 20 | 25;
  };
  step2Data: {
    monthlyRent: number;
    expenseLevel: 'low' | 'average' | 'high';
  };
}
```

**Methods:**
- `goToStep(step: number)`: Navigate to specific step
- `handleStep1Complete(data)`: Save Step 1 data, advance to Step 2
- `handleStep2Complete(data)`: Save Step 2 data, advance to Step 3
- `handleBack()`: Go to previous step

**Styling:**
- Glassmorphism container (bg-surface-100, backdrop-blur-glass)
- Max width: 700px
- Centered on page
- Padding: 48px

---

### SimpleModeStep1.tsx

**Purpose:** Collect purchase price and down payment

**Inputs:**
1. **Purchase Price**
   - Type: Number input
   - Placeholder: "$250,000"
   - Validation: > 0, < 10,000,000
   - Format: Currency with commas
   - Font size: 32px (big, prominent)

2. **Down Payment**
   - Type: Button group (radio-style)
   - Options: 5%, 10%, 15%, 20%, 25%
   - Default: 20%
   - Layout: Horizontal row of 5 buttons

**Auto-Calculations:**
```typescript
const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
const closingCosts = purchasePrice * 0.03; // 3% estimate
const cashNeeded = downPaymentAmount + closingCosts;
```

**Display:**
- Show "Cash Needed: $XX,XXX" below inputs
- Breakdown: "Down: $XX,XXX + Closing: $X,XXX"

**Validation:**
- Purchase price required
- Down payment selection required
- Next button disabled until valid

**UI Elements:**
```typescript
<div className="simple-mode-step">
  <h2 className="step-title">Property Basics</h2>
  <p className="step-description">Let's start with the purchase details</p>

  <div className="input-group">
    <label>Purchase Price</label>
    <Input
      type="number"
      value={purchasePrice}
      onChange={setPurchasePrice}
      className="text-3xl font-semibold"
    />
  </div>

  <div className="input-group">
    <label>Down Payment</label>
    <div className="button-group horizontal">
      {[5, 10, 15, 20, 25].map(percent => (
        <Button
          key={percent}
          variant={selected === percent ? 'primary' : 'outline'}
          onClick={() => setDownPayment(percent)}
        >
          {percent}%
        </Button>
      ))}
    </div>
  </div>

  <div className="auto-calc-display">
    <div className="cash-needed">
      <span className="label">Cash Needed:</span>
      <span className="amount">{formatCurrency(cashNeeded)}</span>
    </div>
    <div className="breakdown text-sm text-gray-400">
      Down: {formatCurrency(downPaymentAmount)} +
      Closing: {formatCurrency(closingCosts)}
    </div>
  </div>

  <Button onClick={handleNext} disabled={!isValid}>
    Next: Income & Expenses →
  </Button>
</div>
```

---

### SimpleModeStep2.tsx

**Purpose:** Collect rental income and expense estimate

**Inputs:**
1. **Monthly Rent**
   - Type: Number input
   - Placeholder: "$2,200"
   - Validation: > 0
   - Format: Currency
   - Font size: 32px

2. **Expense Level**
   - Type: Three large buttons (visual selection)
   - Options:
     - **Low (1%)**: "Newer property, minimal maintenance"
     - **Average (1.5%)**: "Typical rental, standard upkeep"
     - **High (2%)**: "Older property, more repairs"
   - Default: Average
   - Layout: Vertical stack of 3 cards

**Auto-Calculations:**
```typescript
const EXPENSE_PRESETS = {
  low: (price: number) => Math.round(price * 0.01 / 12),
  average: (price: number) => Math.round(price * 0.015 / 12),
  high: (price: number) => Math.round(price * 0.02 / 12)
};

const monthlyExpenses = EXPENSE_PRESETS[expenseLevel](purchasePrice);
const estimatedCashFlow = monthlyRent - monthlyExpenses - mortgagePayment;
```

**Display:**
- Show "Estimated Monthly Expenses: $XXX" below selection
- Show "Estimated Cash Flow: $XXX" (green if positive, red if negative)

**UI Elements:**
```typescript
<div className="simple-mode-step">
  <h2 className="step-title">Income & Expenses</h2>
  <p className="step-description">How much can you rent it for?</p>

  <div className="input-group">
    <label>Monthly Rent</label>
    <Input
      type="number"
      value={monthlyRent}
      onChange={setMonthlyRent}
      className="text-3xl font-semibold"
      placeholder="$2,200"
    />
    <p className="hint text-sm text-gray-400">
      Research 3+ comparable rentals in the area
    </p>
  </div>

  <div className="input-group">
    <label>Expected Maintenance & Expenses</label>
    <div className="expense-cards">
      <ExpenseCard
        level="low"
        label="Low Maintenance"
        description="Newer property, minimal repairs"
        amount={EXPENSE_PRESETS.low(purchasePrice)}
        selected={expenseLevel === 'low'}
        onClick={() => setExpenseLevel('low')}
      />
      <ExpenseCard
        level="average"
        label="Average Maintenance"
        description="Typical rental, standard upkeep"
        amount={EXPENSE_PRESETS.average(purchasePrice)}
        selected={expenseLevel === 'average'}
        onClick={() => setExpenseLevel('average')}
      />
      <ExpenseCard
        level="high"
        label="High Maintenance"
        description="Older property, frequent repairs"
        amount={EXPENSE_PRESETS.high(purchasePrice)}
        selected={expenseLevel === 'high'}
        onClick={() => setExpenseLevel('high')}
      />
    </div>
  </div>

  <div className="auto-calc-display">
    <div className={`cash-flow ${estimatedCashFlow > 0 ? 'positive' : 'negative'}`}>
      <span className="label">Estimated Monthly Cash Flow:</span>
      <span className="amount">{formatCurrency(estimatedCashFlow)}</span>
    </div>
  </div>

  <div className="button-row">
    <Button variant="outline" onClick={handleBack}>
      ← Back
    </Button>
    <Button onClick={handleNext} disabled={!monthlyRent}>
      See My Verdict →
    </Button>
  </div>
</div>
```

---

### SimpleModeStep3.tsx

**Purpose:** Display verdict, key metrics, and sign-up CTA

**Calculations:**
```typescript
// Run full calculator with simple inputs
const fullInputs = {
  purchasePrice,
  downPaymentPercent,
  monthlyRent,
  // Estimates:
  interestRate: 7.5,
  loanTermYears: 30,
  monthlyPropertyTax: purchasePrice * 0.012 / 12,
  monthlyInsurance: purchasePrice * 0.005 / 12,
  monthlyHOA: 0,
  monthlyMaintenance: EXPENSE_PRESETS[expenseLevel](purchasePrice),
  monthlyCapEx: purchasePrice * 0.005 / 12,
  monthlyUtilities: 0,
  monthlyManagement: monthlyRent * 0.10,
  monthlyVacancy: monthlyRent * 0.05,
  marketTier: 'B' // Default
};

const metrics = calculateAllMetrics(fullInputs);
const verdict = calculateSimpleModeVerdict(metrics);
const verdictCopy = VERDICT_COPY[verdict];
```

**Display Sections:**

1. **Verdict Badge (Top, Large)**
```typescript
<div className={`verdict-badge verdict-${verdict.toLowerCase()}`}>
  <div className="emoji">{verdictCopy.emoji}</div>
  <h1 className="headline">{verdictCopy.headline}</h1>
  <p className="message">{verdictCopy.message}</p>
</div>
```

2. **Key Metrics (4 Cards)**
```typescript
<div className="key-metrics grid-cols-2">
  <MetricCard
    label="Monthly Cash Flow"
    value={formatCurrency(metrics.monthlyCashFlow)}
    isPositive={metrics.monthlyCashFlow > 0}
  />
  <MetricCard
    label="Cash-on-Cash Return"
    value={formatPercent(metrics.cashOnCashReturn)}
    isPositive={metrics.cashOnCashReturn > 8}
  />
  <MetricCard
    label="Deal Score"
    value={`${metrics.dealScore}/100`}
    color={getDealScoreColor(metrics.dealScore)}
  />
  <MetricCard
    label="Cap Rate"
    value={formatPercent(metrics.capRate)}
    isPositive={metrics.capRate > 5}
  />
</div>
```

3. **Green Lights / Red Flags**
```typescript
{greenLights.length > 0 && (
  <div className="green-lights">
    <h3>✅ Deal Strengths</h3>
    <ul>
      {greenLights.map(light => <li>{light}</li>)}
    </ul>
  </div>
)}

{redFlags.length > 0 && (
  <div className="red-flags">
    <h3>⚠️ Warning Signs</h3>
    <ul>
      {redFlags.map(flag => <li>{flag}</li>)}
    </ul>
  </div>
)}
```

4. **CTA Section**
```typescript
<div className="cta-section">
  <h3>{verdictCopy.cta}</h3>
  <p>Sign up to see:</p>
  <ul className="benefits">
    <li>🔮 5-year wealth projection</li>
    <li>📊 Monthly breakdown & tax benefits</li>
    <li>🎯 Advanced metrics (IRR, Equity Multiple)</li>
    <li>📈 Best/Worst case scenarios</li>
  </ul>
  <Button size="lg" onClick={() => navigate('/signup')}>
    Create Free Account →
  </Button>
  <p className="no-credit-card text-sm text-gray-400">
    No credit card required • 3 free analyses
  </p>
</div>

<Button variant="ghost" onClick={handleStartOver}>
  ← Analyze Another Property
</Button>
```

---

## 🎨 Styling Guidelines

### Colors by Verdict

```css
.verdict-great-deal {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: 2px solid #28a745;
}

.verdict-good-deal {
  background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
  border: 2px solid #17a2b8;
}

.verdict-risky {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
  border: 2px solid #ffc107;
}

.verdict-pass {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  border: 2px solid #dc3545;
}
```

### Glassmorphism

```css
.simple-mode-step {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;
}

.metric-card {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
}
```

---

## 🔢 Verdict Algorithm (Codex Role)

```typescript
/**
 * Calculate Simple Mode verdict based on key metrics
 * @param metrics - Calculated financial metrics
 * @returns verdict: 'Great Deal' | 'Good Deal' | 'Risky' | 'Pass'
 */
export const calculateSimpleModeVerdict = (
  metrics: CalculatedMetrics
): 'Great Deal' | 'Good Deal' | 'Risky' | 'Pass' => {
  const { dealScore, monthlyCashFlow, cashOnCashReturn, capRate } = metrics;

  // Great Deal: High score + positive cash flow + strong CoC
  if (
    dealScore >= 80 &&
    monthlyCashFlow > 0 &&
    cashOnCashReturn >= 10
  ) {
    return 'Great Deal';
  }

  // Good Deal: Decent score + positive/neutral cash flow
  if (
    dealScore >= 65 &&
    monthlyCashFlow >= 0 &&
    cashOnCashReturn >= 6
  ) {
    return 'Good Deal';
  }

  // Risky: Marginal numbers but not terrible
  if (
    (dealScore >= 35 || monthlyCashFlow >= -200) &&
    capRate >= 3
  ) {
    return 'Risky';
  }

  // Pass: Doesn't meet minimum criteria
  return 'Pass';
};
```

---

## 📱 Responsive Design

### Desktop (> 768px)
- Two-column layout for Step 1 & 2 (inputs left, auto-calc right)
- Results in 2x2 grid
- Max width: 700px

### Tablet (480px - 768px)
- Single column
- Larger buttons for touch
- Metrics in 2x2 grid

### Mobile (< 480px)
- Full width
- Single column metrics (stacked)
- Larger touch targets (min 44px height)

---

## ✅ Success Criteria

- [ ] User can complete wizard in < 1 minute
- [ ] Verdict displays instantly (no loading spinner)
- [ ] All auto-calculations accurate
- [ ] Mobile responsive (test 375px width)
- [ ] Glassmorphism styling matches DealCalculatorV3
- [ ] CTA drives to /signup route
- [ ] "Start Over" resets wizard to Step 1

---

## 🚀 Implementation Order

1. **SimpleModeWizard.tsx** (Container logic)
2. **SimpleModeStep1.tsx** (Property basics)
3. **SimpleModeStep2.tsx** (Income/Expenses)
4. **utils/verdictLogic.ts** (Verdict algorithm + copy)
5. **SimpleModeStep3.tsx** (Results display)
6. **Dashboard.tsx** (Add mode toggle)

---

**Design Spec Complete:** January 3, 2026
**Ready for Implementation (Cursor Role)**

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
