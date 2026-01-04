/**
 * Smart Defaults for QuickCheck Calculator
 *
 * These are conservative national averages used when users only provide
 * purchase price and monthly rent. All values are documented and can be
 * overridden in Advanced Mode.
 *
 * Sources:
 * - Freddie Mac for interest rates
 * - National Association of Realtors for tax/insurance
 * - BiggerPockets for maintenance/vacancy reserves
 */

export interface SmartDefaults {
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  closingCostsPercent: number;
  propertyTaxPercent: number;
  insurancePercent: number;
  maintenancePercent: number;
  vacancyPercent: number;
  propertyManagementPercent: number;
  appreciationPercent: number;
}

/**
 * National Averages - Conservative Estimates
 */
export const SMART_DEFAULTS: SmartDefaults = {
  // Financing
  downPaymentPercent: 20, // Industry standard for investment properties
  interestRate: 7.0, // Current market average (as of Jan 2026)
  loanTerm: 30, // Standard 30-year mortgage

  // One-Time Costs
  closingCostsPercent: 3, // 3% of purchase price

  // Annual Costs (as % of purchase price)
  propertyTaxPercent: 1.2, // National average property tax rate
  insurancePercent: 0.5, // National average insurance cost
  maintenancePercent: 1.0, // 1% rule for maintenance reserve

  // Monthly Costs (as % of monthly rent)
  vacancyPercent: 8, // 8% vacancy reserve (industry standard)
  propertyManagementPercent: 10, // 10% property management fee

  // Appreciation
  appreciationPercent: 3.5, // Conservative annual appreciation
};

/**
 * Calculate monthly mortgage payment (P&I only)
 */
export const calculateMortgagePayment = (
  loanAmount: number,
  annualRate: number,
  years: number
): number => {
  if (loanAmount === 0 || annualRate === 0) return 0;

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;

  const payment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return payment;
};

/**
 * QuickCheck Result Interface
 */
export interface QuickCheckResult {
  // Top-level metrics
  dealScore: number;
  monthlyCashFlow: number;
  cocReturn: number;
  onePercentRule: number;
  capRate: number;

  // Breakeven data
  breakevenMonths: number | null;
  breakevenYears: number | null;

  // Detailed breakdown
  assumptions: {
    purchasePrice: number;
    monthlyRent: number;
    downPayment: number;
    loanAmount: number;
    interestRate: number;
    monthlyMortgage: number;
    monthlyExpenses: number;
    estimatedTaxes: number;
    estimatedInsurance: number;
    estimatedMaintenance: number;
    estimatedVacancy: number;
    estimatedPropertyMgmt: number;
    closingCosts: number;
    initialInvestment: number;
  };

  // Trust indicators
  confidenceLevel: 'low' | 'medium' | 'high';
  confidenceMessage: string;
}

/**
 * Main QuickCheck Calculation
 *
 * Takes only 2 inputs: purchase price and monthly rent
 * Returns comprehensive analysis using smart defaults
 */
export const calculateQuickCheck = (
  purchasePrice: number,
  monthlyRent: number
): QuickCheckResult => {
  // Calculate down payment and loan
  const downPayment = purchasePrice * (SMART_DEFAULTS.downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPayment;

  // Calculate monthly mortgage payment (P&I)
  const monthlyMortgage = calculateMortgagePayment(
    loanAmount,
    SMART_DEFAULTS.interestRate,
    SMART_DEFAULTS.loanTerm
  );

  // Calculate monthly expenses
  const annualTax = purchasePrice * (SMART_DEFAULTS.propertyTaxPercent / 100);
  const annualInsurance = purchasePrice * (SMART_DEFAULTS.insurancePercent / 100);
  const annualMaintenance = purchasePrice * (SMART_DEFAULTS.maintenancePercent / 100);

  const monthlyTax = annualTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const monthlyMaintenance = annualMaintenance / 12;
  const monthlyVacancy = monthlyRent * (SMART_DEFAULTS.vacancyPercent / 100);
  const monthlyPropertyMgmt = monthlyRent * (SMART_DEFAULTS.propertyManagementPercent / 100);

  const totalMonthlyExpenses =
    monthlyTax +
    monthlyInsurance +
    monthlyMaintenance +
    monthlyVacancy +
    monthlyPropertyMgmt;

  // Calculate cash flow
  const monthlyCashFlow = monthlyRent - monthlyMortgage - totalMonthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  // Calculate initial investment
  const closingCosts = purchasePrice * (SMART_DEFAULTS.closingCostsPercent / 100);
  const initialInvestment = downPayment + closingCosts;

  // Calculate Cash-on-Cash Return
  const cocReturn = initialInvestment > 0 ? (annualCashFlow / initialInvestment) * 100 : 0;

  // Calculate Cap Rate (NOI / Purchase Price)
  const annualNOI = monthlyRent * 12 - (totalMonthlyExpenses * 12);
  const capRate = purchasePrice > 0 ? (annualNOI / purchasePrice) * 100 : 0;

  // Calculate 1% Rule (Rent / Purchase Price)
  const onePercentRule = purchasePrice > 0 ? (monthlyRent / purchasePrice) * 100 : 0;

  // Calculate Deal Score (using simplified algorithm)
  const dealScore = calculateDealScore({
    monthlyCashFlow,
    cocReturn,
    capRate,
    onePercentRule,
  });

  // Calculate Breakeven
  const breakeven = calculateBreakeven(
    initialInvestment,
    monthlyCashFlow,
    SMART_DEFAULTS.appreciationPercent,
    purchasePrice,
    loanAmount,
    SMART_DEFAULTS.interestRate,
    SMART_DEFAULTS.loanTerm
  );

  // Determine confidence level
  const { level, message } = determineConfidence(purchasePrice, monthlyRent);

  return {
    dealScore,
    monthlyCashFlow,
    cocReturn,
    onePercentRule,
    capRate,
    breakevenMonths: breakeven.breakevenMonth,
    breakevenYears: breakeven.breakevenMonth ? Math.floor(breakeven.breakevenMonth / 12) : null,
    assumptions: {
      purchasePrice,
      monthlyRent,
      downPayment,
      loanAmount,
      interestRate: SMART_DEFAULTS.interestRate,
      monthlyMortgage,
      monthlyExpenses: totalMonthlyExpenses,
      estimatedTaxes: annualTax,
      estimatedInsurance: annualInsurance,
      estimatedMaintenance: annualMaintenance,
      estimatedVacancy: monthlyVacancy,
      estimatedPropertyMgmt: monthlyPropertyMgmt,
      closingCosts,
      initialInvestment,
    },
    confidenceLevel: level,
    confidenceMessage: message,
  };
};

/**
 * Calculate Deal Score (0-100)
 * Simplified version for QuickCheck
 */
const calculateDealScore = (metrics: {
  monthlyCashFlow: number;
  cocReturn: number;
  capRate: number;
  onePercentRule: number;
}): number => {
  let score = 0;

  // Cash Flow (30 points max)
  if (metrics.monthlyCashFlow >= 500) score += 30;
  else if (metrics.monthlyCashFlow >= 300) score += 25;
  else if (metrics.monthlyCashFlow >= 200) score += 20;
  else if (metrics.monthlyCashFlow >= 100) score += 15;
  else if (metrics.monthlyCashFlow >= 0) score += 10;
  else score += 0; // Negative cash flow

  // Cash-on-Cash Return (30 points max)
  if (metrics.cocReturn >= 12) score += 30;
  else if (metrics.cocReturn >= 10) score += 25;
  else if (metrics.cocReturn >= 8) score += 20;
  else if (metrics.cocReturn >= 6) score += 15;
  else if (metrics.cocReturn >= 4) score += 10;
  else score += 5;

  // Cap Rate (20 points max)
  if (metrics.capRate >= 10) score += 20;
  else if (metrics.capRate >= 8) score += 16;
  else if (metrics.capRate >= 6) score += 12;
  else if (metrics.capRate >= 4) score += 8;
  else score += 4;

  // 1% Rule (20 points max)
  if (metrics.onePercentRule >= 1.0) score += 20;
  else if (metrics.onePercentRule >= 0.8) score += 15;
  else if (metrics.onePercentRule >= 0.6) score += 10;
  else score += 5;

  return Math.min(Math.max(Math.round(score), 0), 100);
};

/**
 * Determine confidence level based on input quality
 */
const determineConfidence = (
  price: number,
  rent: number
): { level: 'low' | 'medium' | 'high'; message: string } => {
  const rentToPrice = price > 0 ? rent / price : 0;

  // Unrealistic rent ratios = low confidence
  if (rentToPrice < 0.003) {
    return {
      level: 'low',
      message: 'Rent seems too low for this price. Verify inputs.',
    };
  }

  if (rentToPrice > 0.02) {
    return {
      level: 'low',
      message: 'Rent seems too high for this price. Is this commercial?',
    };
  }

  // QuickCheck always uses estimates, so medium at best
  return {
    level: 'medium',
    message: 'Using national averages. Use Advanced Mode for precision.',
  };
};

/**
 * Breakeven Calculation Interface
 */
export interface BreakevenResult {
  breakevenMonth: number | null;
  breakevenYears: number | null;
  timeline: MonthlyBreakeven[];
  totalReturnAt5Years: number;
  totalReturnAt10Years: number;
}

export interface MonthlyBreakeven {
  month: number;
  year: number;
  cumulativeCashFlow: number;
  principalPaidDown: number;
  equityFromAppreciation: number;
  totalEquity: number;
  propertyValue: number;
  loanBalance: number;
  breakevenReached: boolean;
}

/**
 * Calculate when user breaks even on investment
 * Includes cash flow + principal paydown + appreciation
 */
export const calculateBreakeven = (
  initialInvestment: number,
  monthlyCashFlow: number,
  annualAppreciation: number,
  propertyValue: number,
  loanAmount: number,
  interestRate: number,
  loanTerm: number
): BreakevenResult => {
  let cumulativeCashFlow = 0;
  let currentPropertyValue = propertyValue;
  let currentLoanBalance = loanAmount;
  let breakevenMonth: number | null = null;

  const timeline: MonthlyBreakeven[] = [];
  const monthlyRate = interestRate / 100 / 12;
  const monthlyMortgage = calculateMortgagePayment(loanAmount, interestRate, loanTerm);

  // Simulate up to 30 years (360 months)
  for (let month = 1; month <= 360; month++) {
    // Accumulate cash flow
    cumulativeCashFlow += monthlyCashFlow;

    // Calculate principal paid this month
    const interestPaid = currentLoanBalance * monthlyRate;
    const principalPaid = monthlyMortgage - interestPaid;
    currentLoanBalance -= principalPaid;

    // Calculate total principal paid down
    const totalPrincipalPaid = loanAmount - currentLoanBalance;

    // Apply appreciation (compounded annually)
    if (month % 12 === 0) {
      currentPropertyValue *= 1 + annualAppreciation / 100;
    }

    // Calculate equity from appreciation
    const equityFromAppreciation = currentPropertyValue - propertyValue;

    // Total equity = principal paid + appreciation
    const totalEquity = totalPrincipalPaid + equityFromAppreciation;

    // Total return = cash flow + equity
    const totalReturn = cumulativeCashFlow + totalEquity;

    const breakevenReached = totalReturn >= initialInvestment;

    timeline.push({
      month,
      year: Math.floor(month / 12) + 1,
      cumulativeCashFlow,
      principalPaidDown: totalPrincipalPaid,
      equityFromAppreciation,
      totalEquity,
      propertyValue: currentPropertyValue,
      loanBalance: currentLoanBalance,
      breakevenReached,
    });

    // Record breakeven month (first time we reach it)
    if (breakevenReached && breakevenMonth === null) {
      breakevenMonth = month;
    }
  }

  return {
    breakevenMonth,
    breakevenYears: breakevenMonth ? Math.floor(breakevenMonth / 12) : null,
    timeline,
    totalReturnAt5Years: timeline[59]?.cumulativeCashFlow + timeline[59]?.totalEquity || 0,
    totalReturnAt10Years: timeline[119]?.cumulativeCashFlow + timeline[119]?.totalEquity || 0,
  };
};

/**
 * Get human-readable breakeven date
 */
export const getBreakevenDate = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Format years and months
 */
export const formatBreakevenTime = (months: number): string => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
};
