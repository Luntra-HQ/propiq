# PropIQ Calculator - Real Estate GPT Recommendations Implementation Plan

**Date:** January 3, 2026
**Source:** Real Estate Investment GPT Expert Analysis
**Status:** Ready to Implement

---

## 📊 Executive Summary

The Real Estate GPT reviewed our DealCalculator and provided expert recommendations across 5 deliverables:
1. ✅ Missing calculations identified (IRR, Equity Multiple, Depreciation, etc.)
2. ✅ Simple Mode spec delivered (5 inputs, 4 metrics, 3-step flow)
3. ✅ Advanced Mode enhancements detailed
4. ✅ Compounding model upgrade formulas provided
5. ✅ Demo strategy designed (Charlotte property example)

**GPT is offering:** Market data, psychology insights, and future features (pending request)

---

## 🚀 Phase 1: Critical Calculations (Week 1)

### **Priority: HIGHEST** - Missing Essential Metrics

#### 1.1 Add IRR (Internal Rate of Return)
**Why:** Critical for multi-year hold scenarios
**Formula:** Excel-style XIRR over cash flows for each year
**Implementation:**
```typescript
// frontend/src/utils/calculatorUtils.ts

export const calculateIRR = (cashFlows: number[], dates: Date[]): number => {
  // Use Newton-Raphson method to find IRR
  // cashFlows[0] = negative (initial investment)
  // cashFlows[1-n] = positive (annual returns)

  let irr = 0.1; // Initial guess: 10%
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(cashFlows, dates, irr);
    const dnpv = calculateDerivativeNPV(cashFlows, dates, irr);

    const newIrr = irr - npv / dnpv;

    if (Math.abs(newIrr - irr) < tolerance) {
      return newIrr * 100; // Return as percentage
    }

    irr = newIrr;
  }

  return 0; // Failed to converge
};
```

**Display:** Advanced Metrics tab
**Target:** Show alongside CoC Return

---

#### 1.2 Add Equity Multiple
**Why:** Shows total return on investment
**Formula:** `Equity Multiple = (Total Cash Inflows / Total Cash Invested)`
**Implementation:**
```typescript
export const calculateEquityMultiple = (
  totalCashInflows: number,
  totalCashInvested: number
): number => {
  if (totalCashInvested === 0) return 0;
  return totalCashInflows / totalCashInvested;
};

// For 5-year projection:
const totalInflows =
  cumulativeCashFlow +
  equityFromAppreciation +
  equityFromPrincipalPaydown;

const equityMultiple = calculateEquityMultiple(totalInflows, totalCashInvested);
```

**Display:** Scenarios tab, after 5-year projections
**Target:** 2.0x+ is good (double your money)

---

#### 1.3 Add Total Return (Wealth Built)
**Why:** Shows complete picture of wealth accumulation
**Formula:**
```
Total Return =
  Cumulative Cash Flow +
  Principal Paydown +
  Appreciation Gain +
  Tax Benefits
```

**Implementation:**
```typescript
export interface WealthBuiltMetrics {
  cumulativeCashFlow: number;
  principalPaydown: number;
  appreciationGain: number;
  taxBenefits: number;
  totalWealth: number;
}

export const calculateWealthBuilt = (
  projections: YearlyProjection[],
  initialInvestment: number,
  purchasePrice: number,
  buildingValue: number
): WealthBuiltMetrics => {
  const finalYear = projections[projections.length - 1];

  const cumulativeCashFlow = finalYear.cumulativeCashFlow;
  const appreciationGain = finalYear.propertyValue - purchasePrice;
  const principalPaydown = finalYear.equity - (purchasePrice - initialInvestment);

  // Depreciation tax benefit (simplified)
  const annualDepreciation = buildingValue / 27.5;
  const taxBenefits = annualDepreciation * 0.25 * projections.length; // Assume 25% tax bracket

  const totalWealth = cumulativeCashFlow + principalPaydown + appreciationGain + taxBenefits;

  return {
    cumulativeCashFlow,
    principalPaydown,
    appreciationGain,
    taxBenefits,
    totalWealth
  };
};
```

**Display:** New card in Scenarios tab: "5-Year Wealth Accumulation"
**Visualization:** Stacked bar chart showing each component

---

#### 1.4 Add Depreciation Tax Benefit
**Why:** Tax benefits are a major part of real estate returns
**Formula:** `Annual Depreciation = (Building Value / 27.5 years)`
**Implementation:**
```typescript
export const calculateDepreciation = (
  purchasePrice: number,
  landValuePercent: number = 20 // Typically 20-30% is land
): number => {
  const buildingValue = purchasePrice * (1 - landValuePercent / 100);
  const annualDepreciation = buildingValue / 27.5;
  return annualDepreciation;
};

export const calculateTaxBenefit = (
  annualDepreciation: number,
  taxBracket: number = 25 // User's marginal tax rate
): number => {
  return annualDepreciation * (taxBracket / 100);
};
```

**Display:** Advanced Metrics tab, under "Tax Benefits" section
**Note:** Add disclaimer "Consult tax professional for accurate calculations"

---

#### 1.5 Add Amortization Schedule
**Why:** Visualize equity buildup from principal paydown
**Implementation:**
```typescript
export interface AmortizationPayment {
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativePrincipal: number;
}

export const generateAmortizationSchedule = (
  loanAmount: number,
  annualRate: number,
  years: number
): AmortizationPayment[] => {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  const monthlyPayment = calculateMonthlyMortgagePayment(loanAmount, annualRate, years);

  const schedule: AmortizationPayment[] = [];
  let balance = loanAmount;
  let cumulativePrincipal = 0;

  for (let year = 1; year <= years; year++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;

      balance -= principal;
      yearlyPrincipal += principal;
      yearlyInterest += interest;
      cumulativePrincipal += principal;
    }

    schedule.push({
      year,
      payment: monthlyPayment * 12,
      principal: yearlyPrincipal,
      interest: yearlyInterest,
      balance,
      cumulativePrincipal
    });
  }

  return schedule;
};
```

**Display:** New expandable section in Advanced Metrics
**Visualization:** Line chart showing balance decreasing over time

---

### 1.6 Add New Input Fields

**Property Characteristics:**
```typescript
// Add to dealCalculatorSchema.ts
export const dealCalculatorSchema = z.object({
  // ... existing fields ...

  // Property characteristics (optional but useful)
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  squareFeet: z.number().int().min(100).max(50000).optional(),
  yearBuilt: z.number().int().min(1800).max(2026).optional(),

  // BRRRR specific
  arv: z.number().min(0).max(100000000).optional(), // After Repair Value

  // Tax modeling
  landValuePercent: z.number().min(0).max(100).default(20),
  taxBracket: z.number().min(0).max(50).default(25),
});
```

**Display:** These go in an "Advanced Inputs" collapsible section

---

## 🎯 Phase 2: Simple Mode (Week 2)

### **Goal:** Make calculator accessible to first-time investors

#### 2.1 Simple Mode UI Component

**File:** `frontend/src/components/DealCalculatorSimple.tsx`

```typescript
interface SimpleModeInputs {
  purchasePrice: number;
  downPaymentPercent: number;
  monthlyRent: number;
  monthlyExpenses: number; // Or preset: "Low", "Avg", "High"
  // Loan terms pre-filled: 30 years @ 7%
}

interface SimpleModeResults {
  monthlyCashFlow: number;
  cashOnCashReturn: number;
  dealScore: number;
  verdict: 'Great Deal' | 'Good Deal' | 'Risky' | 'Pass';
}
```

**3-Step Wizard Flow:**
```
Step 1: "How much is the property?"
  - Purchase Price input
  - Down Payment slider (5%, 10%, 15%, 20%, 25%)

Step 2: "What's the expected rent?"
  - Monthly Rent input
  - Expenses preset selector:
    * Low: $400/mo (1% of purchase price)
    * Average: $650/mo (1.5%)
    * High: $900/mo (2%)

Step 3: "Here's your deal analysis"
  - Monthly Cash Flow (big number, green/red)
  - Cash-on-Cash Return (%)
  - Deal Score (0-100 with color)
  - Verdict message
  - CTA: "Sign up for full analysis"
```

#### 2.2 Verdict Logic

```typescript
const getVerdict = (metrics: SimpleModeResults): string => {
  if (metrics.dealScore >= 80 && metrics.monthlyCashFlow > 200) {
    return '🎉 Great Deal! Strong cash flow and returns.';
  } else if (metrics.dealScore >= 65 && metrics.monthlyCashFlow > 0) {
    return '✅ Good Deal! Positive cash flow.';
  } else if (metrics.dealScore >= 50 || metrics.monthlyCashFlow > -100) {
    return '⚠️ Risky. Consider negotiating price or higher rent.';
  } else {
    return '❌ Pass. This deal doesn\'t meet investment criteria.';
  }
};
```

---

## 🔧 Phase 3: Advanced Mode Enhancements (Week 3)

### 3.1 BRRRR Refinance Modeling

**New Section in Scenarios Tab:**

```typescript
interface BRRRRAnalysis {
  arv: number; // After Repair Value
  rehabCosts: number;
  totalInvested: number; // Purchase + Closing + Rehab
  cashOutRefiLTV: number; // Typically 75%
  cashOutAmount: number;
  cashLeftInDeal: number;
  newCoC: number; // After refinance
  infiniteReturn: boolean; // If cash left = 0
}

export const calculateBRRRR = (
  purchasePrice: number,
  closingCosts: number,
  rehabCosts: number,
  arv: number,
  cashOutLTV: number = 75,
  newInterestRate: number = 7.5
): BRRRRAnalysis => {
  const totalInvested = purchasePrice + closingCosts + rehabCosts;
  const cashOutAmount = arv * (cashOutLTV / 100);
  const cashLeftInDeal = totalInvested - cashOutAmount;

  // Recalculate CoC with new loan
  const newLoanAmount = cashOutAmount;
  const newMonthlyPI = calculateMonthlyMortgagePayment(newLoanAmount, newInterestRate, 30);
  // ... recalculate cash flow with new payment

  const newCoC = cashLeftInDeal > 0 ? (annualCashFlow / cashLeftInDeal) * 100 : Infinity;

  return {
    arv,
    rehabCosts,
    totalInvested,
    cashOutRefiLTV: cashOutLTV,
    cashOutAmount,
    cashLeftInDeal,
    newCoC,
    infiniteReturn: cashLeftInDeal <= 0
  };
};
```

### 3.2 Sensitivity Analysis

**New Interactive Component:**

```typescript
interface SensitivityRange {
  metric: 'rent' | 'expenses' | 'capRate' | 'appreciation';
  min: number;
  max: number;
  step: number;
}

// Example: Slider that shows how CoC changes with rent
// Rent: $2,000 → $3,000 in $100 increments
// Display chart showing CoC from 5% to 15%
```

**Visualization:** Line chart with metric on X-axis, return on Y-axis

---

## 📈 Phase 4: Improved Compounding Model (Week 4)

### 4.1 Enhanced Yearly Projections

**Current (too simple):**
```typescript
// Year 2 rent = Year 1 rent × 1.03
```

**Improved (compound everything):**
```typescript
export const generate5YearProjectionsV2 = (
  inputs: PropertyInputs,
  baseMetrics: CalculatedMetrics,
  rentGrowth: number,
  expenseGrowth: number,
  appreciation: number
): YearlyProjection[] => {
  const projections: YearlyProjection[] = [];

  let currentRent = inputs.monthlyRent;
  let currentExpenses = baseMetrics.monthlyTotalExpenses;
  let currentValue = inputs.purchasePrice;
  let loanBalance = baseMetrics.loanAmount;

  for (let year = 1; year <= 5; year++) {
    // Compound rent annually
    currentRent *= (1 + rentGrowth / 100);

    // Compound expenses annually
    currentExpenses *= (1 + expenseGrowth / 100);

    // Compound property value
    currentValue *= (1 + appreciation / 100);

    // Get loan balance from amortization schedule
    const amortization = generateAmortizationSchedule(
      baseMetrics.loanAmount,
      inputs.interestRate,
      inputs.loanTerm
    );
    loanBalance = amortization[year - 1].balance;

    // Calculate equity
    const downPaymentEquity = inputs.purchasePrice * (inputs.downPaymentPercent / 100);
    const appreciationEquity = currentValue - inputs.purchasePrice;
    const principalPaydownEquity = baseMetrics.loanAmount - loanBalance;
    const totalEquity = downPaymentEquity + appreciationEquity + principalPaydownEquity;

    // Annual metrics
    const annualIncome = currentRent * 12;
    const annualExpenses = currentExpenses * 12;
    const annualCashFlow = annualIncome - annualExpenses - baseMetrics.annualDebtService;

    // Cumulative cash flow
    const cumulativeCashFlow = projections.reduce((sum, p) => sum + p.annualCashFlow, 0) + annualCashFlow;

    // Total return calculation
    const totalReturn = ((cumulativeCashFlow + totalEquity) / baseMetrics.totalCashInvested - 1) * 100;

    projections.push({
      year,
      monthlyRent: currentRent,
      annualIncome,
      annualExpenses,
      annualCashFlow,
      propertyValue: currentValue,
      equity: totalEquity,
      cumulativeCashFlow,
      totalReturn,
      loanBalance, // NEW
      principalPaidDown: baseMetrics.loanAmount - loanBalance, // NEW
      appreciationGain: currentValue - inputs.purchasePrice // NEW
    });
  }

  return projections;
};
```

### 4.2 Wealth Visualization Component

**New Component:** `WealthAccumulationChart.tsx`

```typescript
import { Line } from 'recharts'; // or Chart.js

const WealthAccumulationChart = ({ projections }) => {
  const data = projections.map(p => ({
    year: p.year,
    cashFlow: p.cumulativeCashFlow,
    appreciation: p.appreciationGain,
    principalPaydown: p.principalPaidDown,
    total: p.cumulativeCashFlow + p.appreciationGain + p.principalPaidDown
  }));

  return (
    <div className="wealth-chart">
      <h3>5-Year Wealth Accumulation</h3>
      <LineChart data={data}>
        <Line dataKey="cashFlow" stroke="#10b981" name="Cash Flow" />
        <Line dataKey="appreciation" stroke="#3b82f6" name="Appreciation" />
        <Line dataKey="principalPaydown" stroke="#8b5cf6" name="Principal Paydown" />
        <Line dataKey="total" stroke="#f59e0b" strokeWidth={3} name="Total Wealth" />
      </LineChart>
    </div>
  );
};
```

---

## 🎨 Phase 5: Landing Page Demo (Week 5)

### 5.1 Pre-filled Sample Property

**Charlotte, NC Example:**
```typescript
const sampleProperty = {
  city: 'Charlotte',
  state: 'NC',
  purchasePrice: 275000,
  downPaymentPercent: 20,
  interestRate: 7.0,
  loanTerm: 30,
  monthlyRent: 2400,
  annualPropertyTax: 3300,
  annualInsurance: 1200,
  monthlyHOA: 0,
  monthlyUtilities: 0,
  monthlyMaintenance: 230,
  monthlyVacancy: 120,
  monthlyPropertyManagement: 0,
  closingCosts: 8250,
  rehabCosts: 0
};
```

**Instant Verdict Display:**
```
✅ This deal generates $230/mo cash flow and 9.4% CoC Return

Monthly Cash Flow: +$230
Cash-on-Cash Return: 9.4%
Deal Score: 78 (Good Deal)

Want to see 5-year wealth projections, tax benefits, and refinance scenarios?
[Sign Up for Full Analysis →]
```

### 5.2 Interactive Demo Features

**Allow users to tweak:**
- Purchase Price (slider: $200K - $350K)
- Monthly Rent (slider: $1,800 - $3,000)
- Down Payment (dropdown: 5%, 10%, 15%, 20%, 25%)

**Live update results as they adjust sliders**

---

## 🎯 Revised Deal Score Algorithm

### New Weighted Scoring (100 points total)

```typescript
export const calculateDealScoreV2 = (
  metrics: CalculatedMetrics,
  marketTier: 'A' | 'B' | 'C' | 'D' = 'B'
): number => {
  let score = 0;

  // 1. Cash Flow (25 points)
  if (metrics.monthlyCashFlow >= 300) score += 25;
  else if (metrics.monthlyCashFlow >= 200) score += 20;
  else if (metrics.monthlyCashFlow >= 100) score += 15;
  else if (metrics.monthlyCashFlow >= 0) score += 10;
  else score += 0;

  // 2. Cash-on-Cash Return (20 points)
  if (metrics.cashOnCashReturn >= 12) score += 20;
  else if (metrics.cashOnCashReturn >= 10) score += 17;
  else if (metrics.cashOnCashReturn >= 8) score += 14;
  else if (metrics.cashOnCashReturn >= 6) score += 10;
  else if (metrics.cashOnCashReturn >= 4) score += 5;
  else score += 0;

  // 3. Cap Rate (15 points) - Tiered by market
  const capRateTargets = {
    A: 5,   // Class A markets (expensive, low cap)
    B: 7,   // Class B markets (balanced)
    C: 9,   // Class C markets (cheaper, higher cap)
    D: 11   // Class D markets (highest cap needed)
  };
  const target = capRateTargets[marketTier];

  if (metrics.capRate >= target + 2) score += 15;
  else if (metrics.capRate >= target) score += 12;
  else if (metrics.capRate >= target - 1) score += 8;
  else score += 3;

  // 4. Debt Coverage Ratio (15 points)
  if (metrics.debtCoverageRatio >= 1.5) score += 15;
  else if (metrics.debtCoverageRatio >= 1.35) score += 12;
  else if (metrics.debtCoverageRatio >= 1.25) score += 10;
  else if (metrics.debtCoverageRatio >= 1.15) score += 7;
  else if (metrics.debtCoverageRatio >= 1.0) score += 4;
  else score += 0;

  // 5. Total Return 5-Year (15 points)
  // Calculate based on projections
  const totalReturn5Yr = calculateTotalReturn5Year(metrics);
  if (totalReturn5Yr >= 100) score += 15; // 100%+ return
  else if (totalReturn5Yr >= 75) score += 12;
  else if (totalReturn5Yr >= 50) score += 9;
  else if (totalReturn5Yr >= 25) score += 5;
  else score += 0;

  // 6. 1% Rule (5 points) - De-emphasized
  if (metrics.onePercentRule >= 1.2) score += 5;
  else if (metrics.onePercentRule >= 1.0) score += 4;
  else if (metrics.onePercentRule >= 0.8) score += 2;
  else score += 0;

  // 7. Market Risk (5 points) - Placeholder
  // TODO: Integrate market data API
  score += 3; // Default average market

  return Math.min(score, 100);
};
```

---

## 📋 Implementation Priority

### **Sprint 1 (This Week):**
1. ✅ Get remaining GPT answers (market data, psychology, future features)
2. Add IRR calculation
3. Add Equity Multiple
4. Add Total Return (Wealth Built)
5. Fix Deal Score algorithm V2

### **Sprint 2 (Next Week):**
6. Build Simple Mode component
7. Build 3-step wizard flow
8. Add preset expense bundles
9. Test Simple Mode UX

### **Sprint 3 (Week 3):**
10. Add BRRRR refinance modeling
11. Add sensitivity analysis sliders
12. Enhance Advanced Mode UI
13. Add depreciation tax benefits

### **Sprint 4 (Week 4):**
14. Upgrade compounding model
15. Build wealth accumulation chart
16. Improve 5-year projections table
17. Add amortization schedule

### **Sprint 5 (Week 5):**
18. Build landing page demo
19. Add Charlotte sample property
20. Make demo interactive
21. A/B test different CTAs

---

## 📞 Next Steps

**Immediate:**
1. Ask GPT for remaining answers (market data, psychology, future features)
2. Review this implementation plan
3. Prioritize which features to build first
4. Start coding Sprint 1 items

**Questions for You:**
- Should we implement all of Sprint 1 immediately?
- Do you want Simple Mode or Advanced Mode first?
- Should we focus on demo for landing page before logged-in features?

---

**Status:** Ready to implement based on Real Estate GPT expert recommendations! 🚀
