/**
 * PropIQ Deal Calculator - Financial Calculation Utilities
 *
 * Complete set of real estate investment calculations
 * Ported from original Streamlit calculator
 */

// Market tier definitions with cap rate targets
export const CAP_RATE_TARGETS = {
  A: { min: 4, target: 4.5, good: 5 },    // Hot, high-cost metros
  B: { min: 5, target: 6, good: 7 },      // Growth markets, suburbs
  C: { min: 7, target: 8, good: 9 },      // Cash flow markets
  D: { min: 9, target: 10, good: 11 }     // Distressed/rural, high-risk
} as const;

export const COC_BENCHMARKS = {
  excellent: 12,  // Strong in today's higher-rate climate
  good: 10,       // Solid return
  target: 8,      // Minimum acceptable
  acceptable: 6,  // May accept for BRRRR initial
  poor: 4         // Below standard
} as const;

export const RENT_GROWTH_PRESETS = {
  conservative: 2,  // Stabilized urban markets
  average: 3,       // National 10-year average
  aggressive: 5     // High-growth Sunbelt markets
} as const;

export const APPRECIATION_PRESETS = {
  conservative: 3,  // Long-term safe assumption
  average: 4,       // Historical average
  optimistic: 5,    // Inflation + scarcity markets
  aggressive: 6     // Hot markets only
} as const;

export type MarketTier = 'A' | 'B' | 'C' | 'D';

export interface PropertyInputs {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  monthlyRent: number;
  annualPropertyTax: number;
  annualInsurance: number;
  monthlyHOA: number;
  monthlyUtilities: number;
  monthlyMaintenance: number;
  monthlyVacancy: number;
  monthlyPropertyManagement: number;
  closingCosts: number;
  rehabCosts: number;
  strategy: 'rental' | 'houseHack' | 'brrrr' | 'fixFlip' | 'commercial';
  marketTier?: MarketTier;
}

export interface CalculatedMetrics {
  // Monthly metrics
  monthlyPI: number;
  monthlyPITI: number;
  monthlyTotalExpenses: number;
  monthlyCashFlow: number;

  // Annual metrics
  annualGrossIncome: number;
  annualOperatingExpenses: number;
  annualNOI: number;
  annualCashFlow: number;
  annualDebtService: number;

  // Investment metrics
  totalCashInvested: number;
  loanAmount: number;
  capRate: number;
  cashOnCashReturn: number;
  onePercentRule: number;
  grm: number;
  debtCoverageRatio: number;
  operatingExpenseRatio: number;
  breakEvenOccupancy: number;

  // Deal score
  dealScore: number;
  dealRating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Avoid';
  recommendation: string;

  // Advanced metrics
  irr: number; // Internal Rate of Return (5-year hold)
  equityMultiple: number; // Equity Multiple (5-year hold)
}

export interface ScenarioAnalysis {
  bestCase: CalculatedMetrics;
  baseCase: CalculatedMetrics;
  worstCase: CalculatedMetrics;
}

export interface YearlyProjection {
  year: number;
  monthlyRent: number;
  annualIncome: number;
  annualExpenses: number;
  annualCashFlow: number;
  propertyValue: number;
  loanBalance: number;
  equity: number;
  cumulativeCashFlow: number;
  totalReturn: number;
}

/**
 * Calculate monthly mortgage payment (Principal & Interest only)
 */
export const calculateMonthlyMortgagePayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  if (principal === 0 || years === 0) return 0;

  if (annualRate === 0) {
    return principal / (years * 12);
  }

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;

  const monthlyPayment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return monthlyPayment;
};

/**
 * Calculate PITI (Principal, Interest, Taxes, Insurance)
 */
export const calculatePITI = (
  principal: number,
  annualRate: number,
  years: number,
  annualTaxes: number,
  annualInsurance: number
): number => {
  const pi = calculateMonthlyMortgagePayment(principal, annualRate, years);
  const monthlyTaxes = annualTaxes / 12;
  const monthlyInsurance = annualInsurance / 12;

  return pi + monthlyTaxes + monthlyInsurance;
};

/**
 * Calculate Capitalization Rate (Cap Rate)
 */
export const calculateCapRate = (noi: number, purchasePrice: number): number => {
  if (purchasePrice === 0) return 0;
  return (noi / purchasePrice) * 100;
};

/**
 * Calculate Cash-on-Cash Return
 */
export const calculateCashOnCashReturn = (
  annualCashFlow: number,
  totalCashInvested: number
): number => {
  if (totalCashInvested === 0) return 0;
  return (annualCashFlow / totalCashInvested) * 100;
};

/**
 * Calculate 1% Rule compliance
 */
export const calculate1PercentRule = (
  monthlyRent: number,
  purchasePrice: number
): number => {
  if (purchasePrice === 0) return 0;
  return (monthlyRent / purchasePrice) * 100;
};

/**
 * Calculate Gross Rent Multiplier (GRM)
 */
export const calculateGRM = (
  purchasePrice: number,
  grossMonthlyIncome: number
): number => {
  if (grossMonthlyIncome === 0) return 0;
  return purchasePrice / (grossMonthlyIncome * 12);
};

/**
 * Calculate Debt Coverage Ratio (DCR)
 */
export const calculateDebtCoverageRatio = (
  annualNOI: number,
  annualDebtService: number
): number => {
  if (annualDebtService === 0) return 0;
  return annualNOI / annualDebtService;
};

/**
 * Calculate Operating Expense Ratio (OER)
 */
export const calculateOperatingExpenseRatio = (
  annualOperatingExpenses: number,
  grossAnnualIncome: number
): number => {
  if (grossAnnualIncome === 0) return 0;
  return (annualOperatingExpenses / grossAnnualIncome) * 100;
};

/**
 * Calculate Break-Even Occupancy
 */
export const calculateBreakEvenOccupancy = (
  annualDebtService: number,
  annualOperatingExpenses: number,
  grossAnnualIncome: number
): number => {
  if (grossAnnualIncome === 0) return 0;
  return ((annualDebtService + annualOperatingExpenses) / grossAnnualIncome) * 100;
};

/**
 * Calculate all metrics for a property
 */
export const calculateAllMetrics = (inputs: PropertyInputs): CalculatedMetrics => {
  // Calculate loan amount and total cash invested
  const downPayment = inputs.purchasePrice * (inputs.downPaymentPercent / 100);
  const loanAmount = inputs.purchasePrice - downPayment;
  const totalCashInvested = downPayment + inputs.closingCosts + inputs.rehabCosts;

  // Monthly P&I
  const monthlyPI = calculateMonthlyMortgagePayment(
    loanAmount,
    inputs.interestRate,
    inputs.loanTerm
  );

  // Monthly PITI
  const monthlyPITI = calculatePITI(
    loanAmount,
    inputs.interestRate,
    inputs.loanTerm,
    inputs.annualPropertyTax,
    inputs.annualInsurance
  );

  // Monthly expenses
  const monthlyTotalExpenses =
    monthlyPITI +
    inputs.monthlyHOA +
    inputs.monthlyUtilities +
    inputs.monthlyMaintenance +
    inputs.monthlyVacancy +
    inputs.monthlyPropertyManagement;

  // Monthly cash flow
  const monthlyCashFlow = inputs.monthlyRent - monthlyTotalExpenses;

  // Annual metrics
  const annualGrossIncome = inputs.monthlyRent * 12;
  const annualDebtService = monthlyPITI * 12;
  const annualOperatingExpenses =
    (inputs.monthlyHOA +
     inputs.monthlyUtilities +
     inputs.monthlyMaintenance +
     inputs.monthlyVacancy +
     inputs.monthlyPropertyManagement) * 12 +
    inputs.annualPropertyTax +
    inputs.annualInsurance;

  const annualNOI = annualGrossIncome - annualOperatingExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  // Investment ratios
  const capRate = calculateCapRate(annualNOI, inputs.purchasePrice);
  const cashOnCashReturn = calculateCashOnCashReturn(annualCashFlow, totalCashInvested);
  const onePercentRule = calculate1PercentRule(inputs.monthlyRent, inputs.purchasePrice);
  const grm = calculateGRM(inputs.purchasePrice, inputs.monthlyRent);
  const debtCoverageRatio = calculateDebtCoverageRatio(annualNOI, annualDebtService);
  const operatingExpenseRatio = calculateOperatingExpenseRatio(
    annualOperatingExpenses,
    annualGrossIncome
  );
  const breakEvenOccupancy = calculateBreakEvenOccupancy(
    annualDebtService,
    annualOperatingExpenses,
    annualGrossIncome
  );

  // Calculate deal score with market tier awareness
  const { score, rating, recommendation } = calculateDealScore(
    {
      monthlyCashFlow,
      capRate,
      cashOnCashReturn,
      onePercentRule,
      debtCoverageRatio
    },
    inputs.marketTier || 'B' // Default to B-class market
  );

  // Calculate IRR (Internal Rate of Return) for 5-year hold
  // First, we need to create a temporary metrics object for projections
  const tempMetrics = {
    monthlyPI,
    monthlyPITI,
    monthlyTotalExpenses,
    monthlyCashFlow,
    annualGrossIncome,
    annualOperatingExpenses,
    annualNOI,
    annualCashFlow,
    annualDebtService,
    totalCashInvested,
    loanAmount,
    capRate,
    cashOnCashReturn,
    onePercentRule,
    grm,
    debtCoverageRatio,
    operatingExpenseRatio,
    breakEvenOccupancy,
    dealScore: score,
    dealRating: rating,
    recommendation,
    irr: 0, // Placeholder, will be calculated
    equityMultiple: 0 // Placeholder, will be calculated
  };

  const projections = generate5YearProjections(
    inputs,
    tempMetrics,
    3, // 3% annual rent growth (conservative)
    3, // 3% annual expense growth
    4  // 4% annual appreciation (average)
  );

  const cashFlows = getPropertyCashFlows(inputs, tempMetrics, projections);
  const irr = calculateIRR(cashFlows);

  // Calculate Equity Multiple (5-year hold)
  const cumulativeCashFlow = projections.reduce((sum, proj) => sum + proj.annualCashFlow, 0);
  const finalProjection = projections[projections.length - 1];

  // Equity at exit = property value - remaining loan balance - selling costs
  const salePrice = finalProjection.propertyValue;
  const sellingCosts = salePrice * 0.06; // 6% selling costs
  const equityAtExit = salePrice - finalProjection.loanBalance - sellingCosts;

  const equityMultiple = calculateEquityMultiple(
    totalCashInvested,
    cumulativeCashFlow,
    equityAtExit
  );

  return {
    monthlyPI,
    monthlyPITI,
    monthlyTotalExpenses,
    monthlyCashFlow,
    annualGrossIncome,
    annualOperatingExpenses,
    annualNOI,
    annualCashFlow,
    annualDebtService,
    totalCashInvested,
    loanAmount,
    capRate,
    cashOnCashReturn,
    onePercentRule,
    grm,
    debtCoverageRatio,
    operatingExpenseRatio,
    breakEvenOccupancy,
    dealScore: score,
    dealRating: rating,
    recommendation,
    irr,
    equityMultiple
  };
};

/**
 * Calculate deal score (0-100 points) with market-aware targets
 */
export const calculateDealScore = (
  metrics: {
    monthlyCashFlow: number;
    capRate: number;
    cashOnCashReturn: number;
    onePercentRule: number;
    debtCoverageRatio: number;
  },
  marketTier: MarketTier = 'B'
): { score: number; rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Avoid'; recommendation: string } => {
  let score = 0;

  // Get market-specific cap rate targets
  const capTarget = CAP_RATE_TARGETS[marketTier];

  // Cash Flow Score (40 points)
  if (metrics.monthlyCashFlow >= 500) score += 40;
  else if (metrics.monthlyCashFlow >= 300) score += 30;
  else if (metrics.monthlyCashFlow >= 100) score += 20;
  else if (metrics.monthlyCashFlow >= 0) score += 10;
  else score += 0; // Negative cash flow

  // Cap Rate Score (30 points) - Market-aware
  if (metrics.capRate >= capTarget.good) score += 30;
  else if (metrics.capRate >= capTarget.target) score += 25;
  else if (metrics.capRate >= capTarget.min) score += 20;
  else if (metrics.capRate >= capTarget.min * 0.8) score += 10;
  else score += 0;

  // Cash-on-Cash Return Score (20 points) - Using COC_BENCHMARKS
  if (metrics.cashOnCashReturn >= COC_BENCHMARKS.excellent) score += 20;
  else if (metrics.cashOnCashReturn >= COC_BENCHMARKS.good) score += 15;
  else if (metrics.cashOnCashReturn >= COC_BENCHMARKS.target) score += 10;
  else if (metrics.cashOnCashReturn >= COC_BENCHMARKS.acceptable) score += 5;
  else score += 0;

  // 1% Rule Score (10 points)
  if (metrics.onePercentRule >= 1.0) score += 10;
  else if (metrics.onePercentRule >= 0.8) score += 7;
  else if (metrics.onePercentRule >= 0.6) score += 4;
  else score += 0;

  // Determine rating and recommendation
  let rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Avoid';
  let recommendation: string;

  if (score >= 80) {
    rating = 'Excellent';
    recommendation = `Strong investment opportunity for Class ${marketTier} market. Proceed with thorough due diligence.`;
  } else if (score >= 65) {
    rating = 'Good';
    recommendation = `Solid investment with good fundamentals for Class ${marketTier}. Consider negotiating better terms.`;
  } else if (score >= 50) {
    rating = 'Fair';
    recommendation = `Marginal deal for Class ${marketTier} market. Look for ways to improve cash flow or reduce purchase price.`;
  } else if (score >= 35) {
    rating = 'Poor';
    recommendation = `Weak investment metrics for Class ${marketTier}. Consider passing unless you can significantly improve terms.`;
  } else {
    rating = 'Avoid';
    recommendation = `Not recommended for Class ${marketTier} market. Negative cash flow or very poor returns.`;
  }

  return { score, rating, recommendation };
};

/**
 * Get red flag warnings for a deal
 */
export const getRedFlags = (metrics: CalculatedMetrics): string[] => {
  const flags: string[] = [];

  if (metrics.monthlyCashFlow < 0) {
    flags.push('⚠️ Negative Cash Flow - High risk without appreciation plan');
  }

  if (metrics.debtCoverageRatio < 1.0) {
    flags.push('🚨 DCR < 1.0 - Income doesn\'t cover debt service');
  }

  if (metrics.debtCoverageRatio >= 1.0 && metrics.debtCoverageRatio < 1.2) {
    flags.push('⚠️ DCR < 1.2 - Tight margins, risky for unexpected costs');
  }

  if (metrics.operatingExpenseRatio > 50) {
    flags.push('⚠️ High expenses - Over 50% of income goes to operating costs');
  }

  if (metrics.onePercentRule < 0.7) {
    flags.push('⚠️ Below 1% Rule - Rent may be too low for this price');
  }

  if (metrics.cashOnCashReturn < 6) {
    flags.push('⚠️ Low CoC Return - Below typical investor expectations');
  }

  return flags;
};

/**
 * Get green light signals for a deal
 */
export const getGreenLights = (metrics: CalculatedMetrics): string[] => {
  const positives: string[] = [];

  if (metrics.monthlyCashFlow >= 200) {
    positives.push('✅ Strong positive cash flow ($200+/month)');
  }

  if (metrics.debtCoverageRatio >= 1.35) {
    positives.push('✅ Excellent debt coverage - Healthy margin of safety');
  }

  if (metrics.cashOnCashReturn >= 10) {
    positives.push('✅ Great CoC Return - Above 10% annual return');
  }

  if (metrics.capRate >= 6) {
    positives.push('✅ Solid cap rate for long-term appreciation');
  }

  if (metrics.onePercentRule >= 1.0) {
    positives.push('✅ Meets 1% Rule - Good rent-to-price ratio');
  }

  return positives;
};

/**
 * Generate scenario analysis (best case, base case, worst case)
 */
export const generateScenarioAnalysis = (baseInputs: PropertyInputs): ScenarioAnalysis => {
  // Base case
  const baseCase = calculateAllMetrics(baseInputs);

  // Best case: 10% higher rent, 5% lower expenses
  const bestCaseInputs: PropertyInputs = {
    ...baseInputs,
    monthlyRent: baseInputs.monthlyRent * 1.1,
    monthlyMaintenance: baseInputs.monthlyMaintenance * 0.95,
    monthlyVacancy: baseInputs.monthlyVacancy * 0.95,
    monthlyUtilities: baseInputs.monthlyUtilities * 0.95
  };
  const bestCase = calculateAllMetrics(bestCaseInputs);

  // Worst case: 10% lower rent, 10% higher expenses
  const worstCaseInputs: PropertyInputs = {
    ...baseInputs,
    monthlyRent: baseInputs.monthlyRent * 0.9,
    monthlyMaintenance: baseInputs.monthlyMaintenance * 1.1,
    monthlyVacancy: baseInputs.monthlyVacancy * 1.1,
    monthlyUtilities: baseInputs.monthlyUtilities * 1.1
  };
  const worstCase = calculateAllMetrics(worstCaseInputs);

  return { bestCase, baseCase, worstCase };
};

/**
 * Generate 5-year financial projections
 */
export const generate5YearProjections = (
  inputs: PropertyInputs,
  baseMetrics: CalculatedMetrics,
  annualRentGrowth: number = 3,
  annualExpenseGrowth: number = 2,
  annualAppreciation: number = 3
): YearlyProjection[] => {
  const projections: YearlyProjection[] = [];

  let currentRent = inputs.monthlyRent;
  let currentExpenses = baseMetrics.monthlyTotalExpenses - baseMetrics.monthlyPI;
  let currentPropertyValue = inputs.purchasePrice;
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= 5; year++) {
    // Apply growth rates
    currentRent = currentRent * (1 + annualRentGrowth / 100);
    currentExpenses = currentExpenses * (1 + annualExpenseGrowth / 100);
    currentPropertyValue = currentPropertyValue * (1 + annualAppreciation / 100);

    // Calculate annual figures
    const annualIncome = currentRent * 12;
    const annualExpenses = (currentExpenses + baseMetrics.monthlyPI) * 12;
    const annualCashFlow = annualIncome - annualExpenses;

    cumulativeCashFlow += annualCashFlow;

    // Calculate equity (property value - remaining loan balance)
    // Simplified: assumes equal principal payments
    const yearsElapsed = year;
    const principalPaidDown = (baseMetrics.loanAmount / inputs.loanTerm) * yearsElapsed;
    const loanBalance = baseMetrics.loanAmount - principalPaidDown;
    const equity = currentPropertyValue - loanBalance;

    // Total return = cumulative cash flow + equity
    const totalReturn = cumulativeCashFlow + equity - baseMetrics.totalCashInvested;

    projections.push({
      year,
      monthlyRent: currentRent,
      annualIncome,
      annualExpenses,
      annualCashFlow,
      propertyValue: currentPropertyValue,
      loanBalance,
      equity,
      cumulativeCashFlow,
      totalReturn
    });
  }

  return projections;
};

/**
 * Calculate Internal Rate of Return using Newton-Raphson method
 *
 * IRR is the discount rate where NPV = 0. It accounts for the time value of money
 * and provides a more accurate picture of investment performance than simple ROI.
 *
 * @param cashFlows - Array of cash flows (Year 0 is initial investment, typically negative)
 * @param guess - Initial guess for IRR (default: 10%)
 * @param maxIterations - Maximum iterations for convergence (default: 100)
 * @param tolerance - Convergence tolerance (default: 0.0001)
 * @returns IRR as a percentage, or NaN if did not converge
 *
 * @example
 * const cashFlows = [-100000, 15000, 15000, 15000, 15000, 115000];
 * const irr = calculateIRR(cashFlows); // ~15.2%
 */
export const calculateIRR = (
  cashFlows: number[],
  guess: number = 0.1,
  maxIterations: number = 100,
  tolerance: number = 0.0001
): number => {
  let irr = guess;

  for (let i = 0; i < maxIterations; i++) {
    // Calculate NPV at current IRR
    const npv = cashFlows.reduce((sum, cf, t) => {
      return sum + cf / Math.pow(1 + irr, t);
    }, 0);

    // Calculate derivative of NPV
    const npvDerivative = cashFlows.reduce((sum, cf, t) => {
      return sum - (t * cf) / Math.pow(1 + irr, t + 1);
    }, 0);

    // Newton-Raphson iteration
    const newIrr = irr - npv / npvDerivative;

    // Check for convergence
    if (Math.abs(newIrr - irr) < tolerance) {
      return newIrr * 100; // Return as percentage
    }

    irr = newIrr;
  }

  return NaN; // Did not converge
};

/**
 * Get property cash flows for IRR calculation
 *
 * Generates cash flows array assuming property is held for a specified period
 * and then sold. Includes:
 * - Year 0: Initial investment (negative)
 * - Years 1-4: Annual cash flow
 * - Year 5: Annual cash flow + sale proceeds
 *
 * @param inputs - Property input data
 * @param metrics - Calculated metrics
 * @param projections - 5-year projections (from generate5YearProjections)
 * @param holdPeriod - Years to hold before selling (default: 5)
 * @param sellingCostsPercent - Selling costs as % of sale price (default: 6%)
 * @returns Array of cash flows for IRR calculation
 *
 * @example
 * const cashFlows = getPropertyCashFlows(inputs, metrics, projections);
 * // [-100000, 15000, 15500, 16000, 16500, 117000]
 */
export const getPropertyCashFlows = (
  inputs: any,
  metrics: CalculatedMetrics,
  projections: YearlyProjection[],
  holdPeriod: number = 5,
  sellingCostsPercent: number = 6
): number[] => {
  const cashFlows: number[] = [];

  // Year 0: Initial investment (negative)
  cashFlows.push(-metrics.totalCashInvested);

  // Years 1-5: Annual cash flow + equity at sale in final year
  projections.forEach((projection, index) => {
    if (index < holdPeriod - 1) {
      // Years 1-4: Just annual cash flow
      cashFlows.push(projection.annualCashFlow);
    } else {
      // Year 5: Cash flow + sale proceeds
      // Sale proceeds = equity gained - selling costs
      const salePrice = projection.propertyValue;
      const sellingCosts = salePrice * (sellingCostsPercent / 100);
      const remainingLoanBalance = projection.loanBalance;
      const saleProceeds = salePrice - remainingLoanBalance - sellingCosts;

      cashFlows.push(projection.annualCashFlow + saleProceeds);
    }
  });

  return cashFlows;
};

/**
 * Calculate Equity Multiple
 *
 * Equity Multiple shows how many times your initial investment is returned
 * over the hold period. It's the total cash returned divided by total cash invested.
 *
 * Formula: (Cumulative Cash Flow + Equity at Exit) / Total Cash Invested
 *
 * @param totalCashInvested - Initial cash invested (down payment + closing + rehab)
 * @param cumulativeCashFlow - Total cash flow over hold period
 * @param equityAtExit - Equity gained when property is sold
 * @returns Equity multiple (e.g., 2.0 means you doubled your money)
 *
 * @example
 * const em = calculateEquityMultiple(100000, 18000, 120000);
 * // em = 1.38 (you got back $138k on $100k invested = 1.38x)
 *
 * Interpretation:
 * - 1.0x = Break even (got your money back)
 * - 1.5x = Good (50% total return)
 * - 2.0x = Strong (doubled your money)
 * - 3.0x = Excellent (tripled your money)
 */
export const calculateEquityMultiple = (
  totalCashInvested: number,
  cumulativeCashFlow: number,
  equityAtExit: number
): number => {
  if (totalCashInvested === 0) return 0;

  const totalReturns = cumulativeCashFlow + equityAtExit;
  return totalReturns / totalCashInvested;
};

/**
 * Input quality level for confidence score calculation
 */
export type InputQuality = 'estimated' | 'researched' | 'verified';

/**
 * Confidence score result
 */
export interface ConfidenceScore {
  score: number;
  message: string;
  color: string;
}

/**
 * Calculate confidence score based on deal metrics and input data quality
 *
 * Builds trust by showing users how reliable their analysis is.
 * Score is based on:
 * - 70 points from deal metrics quality (cash flow, DCR, CoC)
 * - 30 points from input data quality (estimated/researched/verified)
 *
 * @param metrics - Calculated financial metrics
 * @param inputQuality - Quality of user's input data
 * @returns Confidence score (0-100), message, and color
 *
 * @example
 * const confidence = calculateConfidenceScore(metrics, 'verified');
 * // { score: 85, message: '🎯 High confidence...', color: '#28a745' }
 */
export const calculateConfidenceScore = (
  metrics: CalculatedMetrics,
  inputQuality: InputQuality = 'estimated'
): ConfidenceScore => {
  let score = 0;

  // Base metrics quality (70 points total)
  // Positive cash flow is critical for rental success
  if (metrics.monthlyCashFlow > 0) {
    score += 30;
  }

  // Debt coverage ratio >= 1.25 means strong income relative to debt
  if (metrics.debtCoverageRatio >= 1.25) {
    score += 25;
  }

  // Cash-on-cash return >= 8% is solid in today's market
  if (metrics.cashOnCashReturn >= 8) {
    score += 15;
  }

  // Input data quality (30 points total)
  // More thorough research = higher confidence
  if (inputQuality === 'verified') {
    score += 30; // Confirmed with property manager, recent comps
  } else if (inputQuality === 'researched') {
    score += 20; // Checked 3+ comparable rentals
  } else {
    score += 10; // Rough estimate or Zillow only
  }

  // Generate user-facing message and color based on score
  let message = '';
  let color = '';

  if (score >= 80) {
    message = '🎯 High confidence - Strong deal with verified data';
    color = '#28a745'; // Green
  } else if (score >= 60) {
    message = '✅ Good confidence - Solid deal, verify rent comps';
    color = '#17a2b8'; // Blue
  } else if (score >= 40) {
    message = '⚠️ Medium confidence - Research more before committing';
    color = '#ffc107'; // Yellow
  } else {
    message = '❌ Low confidence - Deal needs more work or better data';
    color = '#dc3545'; // Red
  }

  return { score, message, color };
};

/**
 * Format currency for display
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format percentage for display
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with commas
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};
