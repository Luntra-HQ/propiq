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
    recommendation
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
 * Calculate Simple Mode verdict
 */
export type SimpleModeVerdict = 'Great Deal' | 'Good Deal' | 'Risky' | 'Pass';

export const calculateSimpleModeVerdict = (
  metrics: CalculatedMetrics
): SimpleModeVerdict => {
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

/**
 * Verdict copy and metadata
 */
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
} as const;

/**
 * Calculate confidence score for deal analysis
 */
export type InputQuality = 'estimated' | 'researched' | 'verified';

export interface ConfidenceScore {
  score: number;
  message: string;
  color: string;
}

export const calculateConfidenceScore = (
  metrics: CalculatedMetrics,
  userInputQuality: InputQuality = 'estimated'
): ConfidenceScore => {
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
  let color = '';
  if (confidence >= 80) {
    message = '🎯 High confidence - Strong deal with verified data';
    color = '#28a745';
  } else if (confidence >= 60) {
    message = '✅ Good confidence - Solid deal, verify rent comps';
    color = '#17a2b8';
  } else if (confidence >= 40) {
    message = '⚠️ Medium confidence - Research more before committing';
    color = '#ffc107';
  } else {
    message = '⚠️ Low confidence - Deal needs more work or better data';
    color = '#dc3545';
  }

  return { score: confidence, message, color };
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
    const equity = currentPropertyValue - (baseMetrics.loanAmount - principalPaidDown);

    // Total return = cumulative cash flow + equity
    const totalReturn = cumulativeCashFlow + equity - baseMetrics.totalCashInvested;

    projections.push({
      year,
      monthlyRent: currentRent,
      annualIncome,
      annualExpenses,
      annualCashFlow,
      propertyValue: currentPropertyValue,
      equity,
      cumulativeCashFlow,
      totalReturn
    });
  }

  return projections;
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
