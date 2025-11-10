/**
 * PropIQ Deal Calculator - Financial Calculation Utilities
 *
 * Complete set of real estate investment calculations
 * Ported from original Streamlit calculator
 */

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

  // Calculate deal score
  const { score, rating, recommendation } = calculateDealScore({
    monthlyCashFlow,
    capRate,
    cashOnCashReturn,
    onePercentRule,
    debtCoverageRatio
  });

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
 * Calculate deal score (0-100 points)
 */
export const calculateDealScore = (metrics: {
  monthlyCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  onePercentRule: number;
  debtCoverageRatio: number;
}): { score: number; rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Avoid'; recommendation: string } => {
  let score = 0;

  // Cash Flow Score (40 points)
  if (metrics.monthlyCashFlow >= 500) score += 40;
  else if (metrics.monthlyCashFlow >= 300) score += 30;
  else if (metrics.monthlyCashFlow >= 100) score += 20;
  else if (metrics.monthlyCashFlow >= 0) score += 10;
  else score += 0; // Negative cash flow

  // Cap Rate Score (30 points)
  if (metrics.capRate >= 10) score += 30;
  else if (metrics.capRate >= 8) score += 25;
  else if (metrics.capRate >= 6) score += 20;
  else if (metrics.capRate >= 4) score += 10;
  else score += 0;

  // Cash-on-Cash Return Score (20 points)
  if (metrics.cashOnCashReturn >= 12) score += 20;
  else if (metrics.cashOnCashReturn >= 10) score += 15;
  else if (metrics.cashOnCashReturn >= 8) score += 10;
  else if (metrics.cashOnCashReturn >= 6) score += 5;
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
    recommendation = 'Strong investment opportunity. Proceed with thorough due diligence.';
  } else if (score >= 65) {
    rating = 'Good';
    recommendation = 'Solid investment with good fundamentals. Consider negotiating better terms.';
  } else if (score >= 50) {
    rating = 'Fair';
    recommendation = 'Marginal deal. Look for ways to improve cash flow or reduce purchase price.';
  } else if (score >= 35) {
    rating = 'Poor';
    recommendation = 'Weak investment metrics. Consider passing unless you can significantly improve terms.';
  } else {
    rating = 'Avoid';
    recommendation = 'Not recommended. Negative cash flow or very poor returns.';
  }

  return { score, rating, recommendation };
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
