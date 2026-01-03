/**
 * Simple Mode Step 3 - Results & Verdict
 *
 * Displays instant deal verdict with key metrics
 * Shows red flags, green lights, and sign-up CTA
 *
 * @component
 */

import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Step1Data, Step2Data } from './SimpleModeWizard';
import {
  calculateAllMetrics,
  formatCurrency,
  formatPercent,
  getRedFlags,
  getGreenLights,
  type DealCalculatorInputs,
} from '../utils/calculatorUtils';
import { calculateSimpleModeVerdict, VERDICT_COPY, EXPENSE_PRESETS } from '../utils/verdictLogic';

interface SimpleModeStep3Props {
  step1Data: Step1Data;
  step2Data: Step2Data;
  onStartOver: () => void;
}

export const SimpleModeStep3 = ({ step1Data, step2Data, onStartOver }: SimpleModeStep3Props) => {
  const navigate = useNavigate();

  // Build full calculator inputs from simple mode data
  const monthlyMaintenance = EXPENSE_PRESETS[step2Data.expenseLevel](step1Data.purchasePrice);

  const fullInputs: DealCalculatorInputs = {
    purchasePrice: step1Data.purchasePrice,
    downPaymentPercent: step1Data.downPaymentPercent,
    interestRate: 7.5, // Default estimate
    loanTermYears: 30,
    monthlyRent: step2Data.monthlyRent,
    annualPropertyTax: step1Data.purchasePrice * 0.012, // 1.2% estimate
    monthlyInsurance: step1Data.purchasePrice * 0.005 / 12, // 0.5% estimate
    monthlyHOA: 0,
    monthlyMaintenance,
    monthlyCapEx: step1Data.purchasePrice * 0.005 / 12, // 0.5% estimate
    monthlyUtilities: 0,
    monthlyManagement: step2Data.monthlyRent * 0.10, // 10%
    monthlyVacancy: step2Data.monthlyRent * 0.05, // 5%
    marketTier: 'B', // Default
    strategy: 'buy_hold',
  };

  // Calculate metrics
  const metrics = calculateAllMetrics(fullInputs);
  const verdict = calculateSimpleModeVerdict(metrics);
  const verdictCopy = VERDICT_COPY[verdict];
  const redFlags = getRedFlags(metrics);
  const greenLights = getGreenLights(metrics);

  return (
    <div className="simple-mode-step glass-container">
      {/* Verdict Badge */}
      <div
        className={`verdict-badge p-8 rounded-2xl border-2 mb-8`}
        style={{
          backgroundColor: `${verdictCopy.color}20`,
          borderColor: `${verdictCopy.color}50`
        }}
      >
        <div className="text-center">
          <div className="text-6xl mb-3">{verdictCopy.emoji}</div>
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            {verdictCopy.headline}
          </h1>
          <p className="text-lg text-gray-300">
            {verdictCopy.message}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics grid grid-cols-2 gap-4 mb-8">
        <div className="metric-card bg-surface-200 border border-glass-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Monthly Cash Flow</div>
          <div className={`text-2xl font-bold ${
            metrics.monthlyCashFlow > 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {formatCurrency(metrics.monthlyCashFlow)}
          </div>
        </div>

        <div className="metric-card bg-surface-200 border border-glass-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Cash-on-Cash Return</div>
          <div className={`text-2xl font-bold ${
            metrics.cashOnCashReturn > 8 ? 'text-emerald-400' : metrics.cashOnCashReturn > 5 ? 'text-blue-400' : 'text-yellow-400'
          }`}>
            {formatPercent(metrics.cashOnCashReturn)}
          </div>
        </div>

        <div className="metric-card bg-surface-200 border border-glass-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Deal Score</div>
          <div className="text-2xl font-bold text-gray-100">
            {Math.round(metrics.dealScore)}/100
          </div>
        </div>

        <div className="metric-card bg-surface-200 border border-glass-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Cap Rate</div>
          <div className={`text-2xl font-bold ${
            metrics.capRate > 6 ? 'text-emerald-400' : metrics.capRate > 4 ? 'text-blue-400' : 'text-yellow-400'
          }`}>
            {formatPercent(metrics.capRate)}
          </div>
        </div>
      </div>

      {/* Green Lights */}
      {greenLights.length > 0 && (
        <div className="green-lights bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-4">
          <h3 className="text-emerald-400 font-semibold text-lg mb-3">✅ Deal Strengths</h3>
          <ul className="space-y-2">
            {greenLights.map((light, i) => (
              <li key={i} className="text-sm text-emerald-300">{light}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="red-flags bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-red-400 font-semibold text-lg mb-3">⚠️ Warning Signs</h3>
          <ul className="space-y-2">
            {redFlags.map((flag, i) => (
              <li key={i} className="text-sm text-red-300">{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Section */}
      <div className="cta-section bg-surface-200 border border-glass-border rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-100 mb-3">
          {verdictCopy.cta}
        </h3>
        <p className="text-gray-300 mb-4">Sign up to unlock:</p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start text-gray-300">
            <span className="mr-2">🔮</span>
            <span>5-year wealth projection & tax benefits</span>
          </li>
          <li className="flex items-start text-gray-300">
            <span className="mr-2">📊</span>
            <span>Monthly cash flow breakdown</span>
          </li>
          <li className="flex items-start text-gray-300">
            <span className="mr-2">🎯</span>
            <span>Advanced metrics (IRR, Equity Multiple)</span>
          </li>
          <li className="flex items-start text-gray-300">
            <span className="mr-2">📈</span>
            <span>Best/Worst case scenario analysis</span>
          </li>
        </ul>
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-white mb-2"
          onClick={() => navigate('/signup')}
        >
          Create Free Account →
        </Button>
        <p className="text-center text-xs text-gray-400">
          No credit card required • 3 free analyses
        </p>
      </div>

      {/* Start Over Button */}
      <Button
        variant="ghost"
        onClick={onStartOver}
        className="w-full text-gray-400 hover:text-gray-200"
      >
        ← Analyze Another Property
      </Button>
    </div>
  );
};
