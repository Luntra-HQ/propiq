/**
 * Simple Mode Verdict Logic
 *
 * Calculates beginner-friendly verdict based on key metrics
 * Provides actionable messaging for each verdict level
 *
 * @module verdictLogic
 */

import { CalculatedMetrics } from './calculatorUtils';

export type VerdictLevel = 'Great Deal' | 'Good Deal' | 'Risky' | 'Pass';

export interface VerdictCopy {
  emoji: string;
  headline: string;
  message: string;
  cta: string;
  color: string;
}

/**
 * Calculate Simple Mode verdict based on key financial metrics
 *
 * Algorithm:
 * - Great Deal: Score 80+, positive cash flow, CoC 10%+
 * - Good Deal: Score 65+, non-negative cash flow, CoC 6%+
 * - Risky: Score 35+, cash flow > -$200, cap rate 3%+
 * - Pass: Doesn't meet minimum criteria
 *
 * @param metrics - Calculated financial metrics from calculatorUtils
 * @returns verdict level
 */
export const calculateSimpleModeVerdict = (
  metrics: CalculatedMetrics
): VerdictLevel => {
  const { dealScore, monthlyCashFlow, cashOnCashReturn, capRate } = metrics;

  // Great Deal: Exceptional numbers across the board
  if (
    dealScore >= 80 &&
    monthlyCashFlow > 0 &&
    cashOnCashReturn >= 10
  ) {
    return 'Great Deal';
  }

  // Good Deal: Solid fundamentals, worth pursuing
  if (
    dealScore >= 65 &&
    monthlyCashFlow >= 0 &&
    cashOnCashReturn >= 6
  ) {
    return 'Good Deal';
  }

  // Risky: Marginal numbers, proceed with caution
  if (
    (dealScore >= 35 || monthlyCashFlow >= -200) &&
    capRate >= 3
  ) {
    return 'Risky';
  }

  // Pass: Doesn't meet minimum investment criteria
  return 'Pass';
};

/**
 * Verdict messaging and styling
 * Provides user-facing copy and colors for each verdict level
 */
export const VERDICT_COPY: Record<VerdictLevel, VerdictCopy> = {
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

/**
 * Expense presets for Simple Mode
 * Based on property age/condition estimate
 */
export const EXPENSE_PRESETS = {
  low: (purchasePrice: number) => Math.round(purchasePrice * 0.01 / 12),      // 1% annually
  average: (purchasePrice: number) => Math.round(purchasePrice * 0.015 / 12), // 1.5% annually
  high: (purchasePrice: number) => Math.round(purchasePrice * 0.02 / 12)      // 2% annually
} as const;

export type ExpenseLevel = keyof typeof EXPENSE_PRESETS;

/**
 * Calculate cash needed for property purchase
 * Includes down payment + closing costs estimate (3%)
 */
export const calculateCashNeeded = (
  purchasePrice: number,
  downPaymentPercent: number
): { downPayment: number; closingCosts: number; total: number } => {
  const downPayment = Math.round(purchasePrice * (downPaymentPercent / 100));
  const closingCosts = Math.round(purchasePrice * 0.03); // 3% estimate
  const total = downPayment + closingCosts;

  return { downPayment, closingCosts, total };
};
