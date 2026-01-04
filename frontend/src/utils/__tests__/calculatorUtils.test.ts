/**
 * Unit Tests for Calculator Utilities
 *
 * Focus: Financial accuracy for investor decisions ($50k-$500k+)
 * Coverage Target: 100% for core financial calculations
 *
 * Test Categories:
 * 1. Mortgage & Financing Calculations
 * 2. Investment Metrics (Cap Rate, CoC, DSCR)
 * 3. Advanced Metrics (IRR, Equity Multiple)
 * 4. Deal Scoring & Analysis
 * 5. Edge Cases & Error Handling
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyMortgagePayment,
  calculatePITI,
  calculateCapRate,
  calculateCashOnCashReturn,
  calculate1PercentRule,
  calculateGRM,
  calculateDebtCoverageRatio,
  calculateOperatingExpenseRatio,
  calculateBreakEvenOccupancy,
  calculateIRR,
  calculateEquityMultiple,
  calculateConfidenceScore,
  calculateAllMetrics,
  type PropertyInputs,
  type InputQuality,
} from '../calculatorUtils';

// ============================================================================
// 1. MORTGAGE & FINANCING CALCULATIONS
// ============================================================================

describe('calculateMonthlyMortgagePayment', () => {
  it('calculates correct payment for typical 30-year mortgage', () => {
    // $200k loan at 6% for 30 years
    // Expected: $1,199.10/month (verified with mortgage calculator)
    const payment = calculateMonthlyMortgagePayment(200_000, 6, 30);
    expect(payment).toBeCloseTo(1199.10, 2);
  });

  it('calculates correct payment for 15-year mortgage', () => {
    // $200k loan at 5% for 15 years
    // Expected: $1,581.59/month
    const payment = calculateMonthlyMortgagePayment(200_000, 5, 15);
    expect(payment).toBeCloseTo(1581.59, 2);
  });

  it('handles zero interest rate (cash purchase equivalent)', () => {
    // $100k at 0% for 10 years = $100k / 120 months = $833.33/month
    const payment = calculateMonthlyMortgagePayment(100_000, 0, 10);
    expect(payment).toBeCloseTo(833.33, 2);
  });

  it('handles high interest rates without overflow', () => {
    // Extreme rate: 20% APR (historical high)
    const payment = calculateMonthlyMortgagePayment(300_000, 0.20, 30);
    expect(payment).toBeGreaterThan(0);
    expect(payment).toBeLessThan(300_000); // Sanity check
  });

  it('returns 0 for zero principal', () => {
    const payment = calculateMonthlyMortgagePayment(0, 0.06, 30);
    expect(payment).toBe(0);
  });
});

describe('calculatePITI', () => {
  it('sums principal, interest, taxes, and insurance correctly', () => {
    // $200k loan at 6% for 30 years, $3600/year taxes, $1200/year insurance
    const piti = calculatePITI(200_000, 6, 30, 3_600, 1_200);
    expect(piti).toBeGreaterThan(1500); // Should include mortgage + taxes + insurance
  });

  it('calculates PITI for 15-year mortgage with higher taxes', () => {
    // $150k loan at 5% for 15 years, $4800/year taxes, $1200/year insurance
    const piti = calculatePITI(150_000, 5, 15, 4_800, 1_200);
    expect(piti).toBeGreaterThan(1500);
  });
});

// ============================================================================
// 2. INVESTMENT METRICS
// ============================================================================

describe('calculateCapRate', () => {
  it('calculates cap rate for profitable property', () => {
    // NOI: $12,000/year, Purchase: $150,000
    // Cap Rate: 12,000 / 150,000 = 8%
    const capRate = calculateCapRate(12_000, 150_000);
    expect(capRate).toBeCloseTo(8.0, 2);
  });

  it('calculates cap rate for expensive market (low cap)', () => {
    // NOI: $10,000/year, Purchase: $250,000
    // Cap Rate: 10,000 / 250,000 = 4%
    const capRate = calculateCapRate(10_000, 250_000);
    expect(capRate).toBeCloseTo(4.0, 2);
  });

  it('returns 0 for zero purchase price (avoid division by zero)', () => {
    const capRate = calculateCapRate(12_000, 0);
    expect(capRate).toBe(0);
  });

  it('handles negative NOI (cash flow negative property)', () => {
    const capRate = calculateCapRate(-5_000, 200_000);
    expect(capRate).toBeCloseTo(-2.5, 2);
  });
});

describe('calculateCashOnCashReturn', () => {
  it('calculates CoC for strong cash flowing property', () => {
    // Annual cash flow: $6,000, Cash invested: $50,000
    // CoC: 6,000 / 50,000 = 12%
    const coc = calculateCashOnCashReturn(6_000, 50_000);
    expect(coc).toBeCloseTo(12.0, 2);
  });

  it('calculates CoC for break-even property', () => {
    const coc = calculateCashOnCashReturn(0, 50_000);
    expect(coc).toBe(0);
  });

  it('calculates negative CoC for losing money', () => {
    const coc = calculateCashOnCashReturn(-3_000, 50_000);
    expect(coc).toBeCloseTo(-6.0, 2);
  });

  it('returns 0 for zero cash invested (avoid division by zero)', () => {
    const coc = calculateCashOnCashReturn(6_000, 0);
    expect(coc).toBe(0);
  });
});

describe('calculate1PercentRule', () => {
  it('meets 1% rule for strong rental market', () => {
    // Rent: $2,500, Purchase: $250,000
    // 1% Rule: 2,500 / 250,000 = 1.0%
    const rule = calculate1PercentRule(2_500, 250_000);
    expect(rule).toBeCloseTo(1.0, 2);
  });

  it('fails 1% rule for expensive market', () => {
    // Rent: $2,000, Purchase: $400,000
    // 1% Rule: 2,000 / 400,000 = 0.5%
    const rule = calculate1PercentRule(2_000, 400_000);
    expect(rule).toBeCloseTo(0.5, 2);
  });

  it('exceeds 1% rule for value markets', () => {
    // Rent: $1,500, Purchase: $100,000
    // 1% Rule: 1,500 / 100,000 = 1.5%
    const rule = calculate1PercentRule(1_500, 100_000);
    expect(rule).toBeCloseTo(1.5, 2);
  });

  it('returns 0 for zero purchase price', () => {
    const rule = calculate1PercentRule(2_000, 0);
    expect(rule).toBe(0);
  });
});

describe('calculateDebtCoverageRatio', () => {
  it('calculates strong DCR above lender minimum', () => {
    // NOI: $15,000/year, Debt Service: $10,000/year
    // DCR: 15,000 / 10,000 = 1.5 (excellent)
    const dcr = calculateDebtCoverageRatio(15_000, 10_000);
    expect(dcr).toBeCloseTo(1.5, 2);
  });

  it('calculates minimum acceptable DCR', () => {
    // NOI: $12,500/year, Debt Service: $10,000/year
    // DCR: 12,500 / 10,000 = 1.25 (minimum for most lenders)
    const dcr = calculateDebtCoverageRatio(12_500, 10_000);
    expect(dcr).toBeCloseTo(1.25, 2);
  });

  it('calculates failing DCR below 1.0', () => {
    // NOI: $8,000/year, Debt Service: $10,000/year
    // DCR: 8,000 / 10,000 = 0.8 (can't cover debt)
    const dcr = calculateDebtCoverageRatio(8_000, 10_000);
    expect(dcr).toBeCloseTo(0.8, 2);
  });

  it('returns 0 for zero debt service', () => {
    const dcr = calculateDebtCoverageRatio(15_000, 0);
    expect(dcr).toBe(0);
  });
});

// ============================================================================
// 3. ADVANCED METRICS (IRR, EQUITY MULTIPLE)
// ============================================================================

describe('calculateIRR', () => {
  it('calculates IRR for profitable 5-year hold', () => {
    // Year 0: -$50,000 (initial investment)
    // Years 1-4: +$5,000 (annual cash flow)
    // Year 5: +$5,000 + $70,000 (cash flow + sale proceeds)
    // Expected IRR: ~12-15%
    const cashFlows = [-50_000, 5_000, 5_000, 5_000, 5_000, 75_000];
    const irr = calculateIRR(cashFlows);

    expect(irr).toBeGreaterThan(10); // At least 10%
    expect(irr).toBeLessThan(20); // But less than 20%
    expect(Number.isNaN(irr)).toBe(false);
  });

  it('calculates IRR for break-even scenario', () => {
    // Year 0: -$100,000
    // Years 1-5: +$20,000 each (total returns = initial investment)
    const cashFlows = [-100_000, 20_000, 20_000, 20_000, 20_000, 20_000];
    const irr = calculateIRR(cashFlows);

    // Break-even IRR should be close to 0%
    expect(irr).toBeCloseTo(0, 0);
  });

  it('handles losing investment (negative IRR)', () => {
    // Year 0: -$100,000
    // Years 1-5: +$10,000 each (total: $50k returned, lost $50k)
    const cashFlows = [-100_000, 10_000, 10_000, 10_000, 10_000, 10_000];
    const irr = calculateIRR(cashFlows);

    // Should be negative since we lost money
    expect(irr).toBeLessThan(0);
  });

  it('returns NaN for impossible cash flows (no sign change)', () => {
    // All positive cash flows (no investment)
    const cashFlows = [10_000, 10_000, 10_000];
    const irr = calculateIRR(cashFlows);

    expect(Number.isNaN(irr)).toBe(true);
  });
});

describe('calculateEquityMultiple', () => {
  it('calculates 2x equity multiple (doubled money)', () => {
    // Invested: $50,000
    // Cumulative cash flow: $25,000
    // Equity at exit: $75,000
    // Total returns: $100,000
    // Multiple: 100,000 / 50,000 = 2.0x
    const multiple = calculateEquityMultiple(50_000, 25_000, 75_000);
    expect(multiple).toBeCloseTo(2.0, 2);
  });

  it('calculates strong 3x equity multiple', () => {
    // Invested: $50,000
    // Cumulative cash flow: $30,000
    // Equity at exit: $120,000
    // Total returns: $150,000
    // Multiple: 150,000 / 50,000 = 3.0x
    const multiple = calculateEquityMultiple(50_000, 30_000, 120_000);
    expect(multiple).toBeCloseTo(3.0, 2);
  });

  it('calculates losing investment (< 1x)', () => {
    // Invested: $100,000
    // Cumulative cash flow: $10,000
    // Equity at exit: $50,000
    // Total returns: $60,000
    // Multiple: 60,000 / 100,000 = 0.6x (lost 40%)
    const multiple = calculateEquityMultiple(100_000, 10_000, 50_000);
    expect(multiple).toBeCloseTo(0.6, 2);
  });

  it('returns 0 for zero cash invested', () => {
    const multiple = calculateEquityMultiple(0, 25_000, 75_000);
    expect(multiple).toBe(0);
  });
});

// ============================================================================
// 4. CONFIDENCE SCORE
// ============================================================================

describe('calculateConfidenceScore', () => {
  const strongMetrics = {
    monthlyCashFlow: 500,
    debtCoverageRatio: 1.5,
    cashOnCashReturn: 12,
    // ... other required fields
  } as any;

  const weakMetrics = {
    monthlyCashFlow: -100,
    debtCoverageRatio: 0.9,
    cashOnCashReturn: 2,
  } as any;

  it('gives high score for strong deal with verified data', () => {
    const result = calculateConfidenceScore(strongMetrics, 'verified');

    expect(result.score).toBeGreaterThanOrEqual(80); // Should be high confidence
    expect(result.color).toBe('#28a745'); // Green
    expect(result.message).toContain('High confidence');
  });

  it('gives lower score for strong deal with estimated data', () => {
    const result = calculateConfidenceScore(strongMetrics, 'estimated');

    expect(result.score).toBeLessThanOrEqual(80); // Lower due to data quality
    expect(result.score).toBeGreaterThan(40); // But still decent due to metrics
  });

  it('gives low score for weak deal regardless of data quality', () => {
    const result = calculateConfidenceScore(weakMetrics, 'verified');

    expect(result.score).toBeLessThan(60); // Weak metrics drag it down
  });

  it('gives appropriate warnings for medium confidence', () => {
    const mediumMetrics = {
      monthlyCashFlow: 200,
      debtCoverageRatio: 1.15,
      cashOnCashReturn: 6,
    } as any;

    const result = calculateConfidenceScore(mediumMetrics, 'researched');

    expect(result.score).toBeGreaterThan(40);
    expect(result.score).toBeLessThan(80);
    expect(result.message).toMatch(/(Medium|Good) confidence/i);
  });
});

// ============================================================================
// 5. INTEGRATION TEST - calculateAllMetrics
// ============================================================================

describe('calculateAllMetrics', () => {
  it('calculates all metrics for typical rental property', () => {
    const inputs: PropertyInputs = {
      purchasePrice: 250_000,
      downPaymentPercent: 20,
      interestRate: 6.5,
      loanTerm: 30,
      closingCosts: 7_500,
      rehabCosts: 10_000,
      monthlyRent: 2_500,
      annualPropertyTax: 3_600,
      annualInsurance: 1_200,
      monthlyHOA: 0,
      monthlyUtilities: 50,
      monthlyMaintenance: 300,
      monthlyVacancy: 200,
      monthlyPropertyManagement: 250,
      strategy: 'rental',
      marketTier: 'B',
    };

    const metrics = calculateAllMetrics(inputs);

    // Verify key calculations
    expect(metrics.loanAmount).toBe(200_000);
    expect(metrics.totalCashInvested).toBe(67_500); // Down + closing + rehab

    // Mortgage (PI) should be calculated correctly
    expect(metrics.monthlyPI).toBeGreaterThan(1_200);
    expect(metrics.monthlyPI).toBeLessThan(1_400);

    // Cash flow should be positive for this deal
    expect(metrics.monthlyCashFlow).toBeGreaterThan(0);

    // Cap rate should be reasonable
    expect(metrics.capRate).toBeGreaterThan(0);
    expect(metrics.capRate).toBeLessThan(15);

    // CoC should be reasonable
    expect(metrics.cashOnCashReturn).toBeGreaterThan(0);
    expect(metrics.cashOnCashReturn).toBeLessThan(30);

    // Deal score should be present
    expect(metrics.dealScore).toBeGreaterThanOrEqual(0);
    expect(metrics.dealScore).toBeLessThanOrEqual(100);

    // IRR should be calculated
    expect(Number.isNaN(metrics.irr)).toBe(false);

    // Equity multiple should be calculated
    expect(metrics.equityMultiple).toBeGreaterThan(0);
  });

  it('handles cash purchase (0% down payment)', () => {
    const inputs: PropertyInputs = {
      purchasePrice: 150_000,
      downPaymentPercent: 100, // All cash
      interestRate: 0,
      loanTerm: 30,
      closingCosts: 3_000,
      rehabCosts: 5_000,
      monthlyRent: 1_500,
      annualPropertyTax: 1_800,
      annualInsurance: 600,
      monthlyHOA: 0,
      monthlyUtilities: 0,
      monthlyMaintenance: 150,
      monthlyVacancy: 150,
      monthlyPropertyManagement: 150,
      strategy: 'rental',
      marketTier: 'C',
    };

    const metrics = calculateAllMetrics(inputs);

    expect(metrics.loanAmount).toBe(0);
    expect(metrics.monthlyPI).toBe(0);
    expect(metrics.monthlyCashFlow).toBeGreaterThan(0); // Should cash flow well
  });
});

// ============================================================================
// 6. EDGE CASES & ERROR HANDLING
// ============================================================================

describe('Edge Cases', () => {
  it('handles extremely high property values without overflow', () => {
    const inputs: PropertyInputs = {
      purchasePrice: 10_000_000,
      downPaymentPercent: 25,
      interestRate: 5,
      loanTerm: 30,
      closingCosts: 200_000,
      rehabCosts: 0,
      monthlyRent: 50_000,
      annualPropertyTax: 120_000,
      annualInsurance: 12_000,
      monthlyHOA: 500,
      monthlyUtilities: 0,
      monthlyMaintenance: 2_000,
      monthlyVacancy: 2_500,
      monthlyPropertyManagement: 5_000,
      strategy: 'rental',
      marketTier: 'A',
    };

    const metrics = calculateAllMetrics(inputs);

    expect(Number.isFinite(metrics.monthlyCashFlow)).toBe(true);
    expect(Number.isFinite(metrics.capRate)).toBe(true);
  });

  it('handles zero rent (development property)', () => {
    const inputs: PropertyInputs = {
      purchasePrice: 200_000,
      downPaymentPercent: 25,
      interestRate: 6,
      loanTerm: 30,
      closingCosts: 5_000,
      rehabCosts: 50_000,
      monthlyRent: 0, // Not rented yet
      annualPropertyTax: 2_400,
      annualInsurance: 1_200,
      monthlyHOA: 0,
      monthlyUtilities: 0,
      monthlyMaintenance: 0,
      monthlyVacancy: 0,
      monthlyPropertyManagement: 0,
      strategy: 'fixFlip',
      marketTier: 'B',
    };

    const metrics = calculateAllMetrics(inputs);

    expect(metrics.monthlyCashFlow).toBeLessThan(0); // Negative due to expenses
  });
});
