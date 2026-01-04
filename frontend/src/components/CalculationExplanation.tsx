/**
 * Calculation Explanation Component
 *
 * Inline expandable explanations showing exactly how each metric was calculated.
 * Builds trust by making the "black box" transparent.
 *
 * @component
 */

import { ChevronDown, Info } from 'lucide-react';
import { type QuickCheckResult } from '../utils/smartDefaults';
import { formatCurrency, formatPercent } from '../utils/calculatorUtils';

export interface CalculationExplanationProps {
  metric: 'cashFlow' | 'cocReturn' | 'onePercent' | 'dealScore';
  result: QuickCheckResult;
  isOpen: boolean;
  onToggle: () => void;
}

export const CalculationExplanation: React.FC<CalculationExplanationProps> = ({
  metric,
  result,
  isOpen,
  onToggle,
}) => {
  const explanations = {
    cashFlow: {
      title: 'Monthly Cash Flow Calculation',
      formula: 'Rent - Expenses - Mortgage = Cash Flow',
      breakdown: [
        { label: 'Monthly Rent', value: result.assumptions.monthlyRent, color: 'green' },
        { label: 'Mortgage Payment (P&I)', value: -result.assumptions.monthlyMortgage, color: 'red' },
        {
          label: 'Property Tax',
          value: -(result.assumptions.estimatedTaxes / 12),
          color: 'red',
        },
        {
          label: 'Insurance',
          value: -(result.assumptions.estimatedInsurance / 12),
          color: 'red',
        },
        {
          label: 'Maintenance (1% rule)',
          value: -result.assumptions.estimatedMaintenance,
          color: 'red',
        },
        {
          label: 'Vacancy Reserve (8%)',
          value: -result.assumptions.estimatedVacancy,
          color: 'red',
        },
        {
          label: 'Property Mgmt (10%)',
          value: -result.assumptions.estimatedPropertyMgmt,
          color: 'red',
        },
      ],
      result: result.monthlyCashFlow,
      assumptions: [
        '20% down payment (industry standard for investment properties)',
        '7.0% interest rate (current market average for 30-year mortgages)',
        '1.2% property tax (national average annual rate)',
        '0.5% insurance (national average annual cost)',
        '1% maintenance reserve (the "1% rule" for unexpected repairs)',
        '8% vacancy reserve (industry standard for rental properties)',
        '10% property management (if not self-managing)',
      ],
      editPrompt: 'Want to use YOUR actual numbers for precision? Load into Advanced Mode →',
    },
    cocReturn: {
      title: 'Cash-on-Cash Return Calculation',
      formula: '(Annual Cash Flow ÷ Initial Investment) × 100',
      breakdown: [
        {
          label: 'Annual Cash Flow',
          value: result.monthlyCashFlow * 12,
          color: result.monthlyCashFlow >= 0 ? 'green' : 'red',
        },
        { label: 'Initial Investment', value: result.assumptions.initialInvestment, color: 'blue' },
      ],
      result: result.cocReturn,
      assumptions: [
        `Initial Investment = Down Payment (${formatCurrency(result.assumptions.downPayment)}) + Closing Costs (${formatCurrency(result.assumptions.closingCosts)})`,
        'Annual Cash Flow = Monthly Cash Flow × 12',
        'Good CoC Return: 8-12% or higher',
      ],
      editPrompt: 'Adjust closing costs and down payment in Advanced Mode →',
    },
    onePercent: {
      title: '1% Rule Check',
      formula: '(Monthly Rent ÷ Purchase Price) × 100',
      breakdown: [
        { label: 'Monthly Rent', value: result.assumptions.monthlyRent, color: 'green' },
        { label: 'Purchase Price', value: result.assumptions.purchasePrice, color: 'blue' },
      ],
      result: result.onePercentRule,
      assumptions: [
        'The "1% Rule" states rent should be at least 1% of purchase price monthly',
        'Example: $200k house should rent for $2,000/month',
        'This rule is a quick screening tool, not a guarantee of profitability',
        '0.8-1.0% is acceptable in many markets',
        '<0.6% usually indicates poor cash flow',
      ],
      editPrompt: 'Verify actual rent prices in Advanced Mode →',
    },
    dealScore: {
      title: 'Deal Score Calculation',
      formula: 'Weighted score based on multiple factors (0-100)',
      breakdown: [
        { label: 'Cash Flow Score', value: 0, color: 'blue' },
        { label: 'CoC Return Score', value: 0, color: 'blue' },
        { label: 'Cap Rate Score', value: 0, color: 'blue' },
        { label: '1% Rule Score', value: 0, color: 'blue' },
      ],
      result: result.dealScore,
      assumptions: [
        'Cash Flow (30 points max): Higher cash flow = higher score',
        'Cash-on-Cash Return (30 points max): >12% = perfect score',
        'Cap Rate (20 points max): >10% = perfect score',
        '1% Rule (20 points max): ≥1.0% = perfect score',
        'Total: Sum of all factors, capped at 100',
      ],
      editPrompt: 'See detailed scoring breakdown in Advanced Mode →',
    },
  };

  const explanation = explanations[metric];

  const calculateTotal = (breakdown: typeof explanation.breakdown): number => {
    return breakdown.reduce((sum, item) => sum + item.value, 0);
  };

  return (
    <div className="calculation-explanation">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="calc-toggle-btn"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Hide calculation' : 'Show calculation'}
      >
        <Info className="h-4 w-4" />
        <span>How we calculated this</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div className="calc-breakdown animate-slide-down">
          {/* Formula */}
          <div className="formula-card">
            <h4 className="formula-title">{explanation.title}</h4>
            <code className="formula-code">{explanation.formula}</code>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="breakdown-section">
            <h5 className="breakdown-title">Step-by-Step:</h5>
            <table className="breakdown-table">
              <tbody>
                {explanation.breakdown.map((item, idx) => (
                  <tr key={idx}>
                    <td className="breakdown-label">{item.label}</td>
                    <td className={`breakdown-value value-${item.color}`}>
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
                {metric === 'cashFlow' && (
                  <tr className="total-row">
                    <td className="breakdown-label">
                      <strong>Net Monthly Cash Flow</strong>
                    </td>
                    <td className="breakdown-value">
                      <strong>{formatCurrency(calculateTotal(explanation.breakdown))}</strong>
                    </td>
                  </tr>
                )}
                {metric === 'cocReturn' && (
                  <tr className="total-row">
                    <td className="breakdown-label">
                      <strong>Cash-on-Cash Return</strong>
                    </td>
                    <td className="breakdown-value">
                      <strong>{formatPercent(result.cocReturn)}</strong>
                    </td>
                  </tr>
                )}
                {metric === 'onePercent' && (
                  <tr className="total-row">
                    <td className="breakdown-label">
                      <strong>1% Rule</strong>
                    </td>
                    <td className="breakdown-value">
                      <strong>{formatPercent(result.onePercentRule)}</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Assumptions Used */}
          <div className="assumptions-card">
            <h5 className="assumptions-title">📋 Assumptions We Used:</h5>
            <ul className="assumptions-list-detailed">
              {explanation.assumptions.map((assumption, idx) => (
                <li key={idx}>{assumption}</li>
              ))}
            </ul>
          </div>

          {/* CTA to Advanced Mode */}
          <div className="upgrade-cta-inline">
            <p className="upgrade-text">{explanation.editPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationExplanation;
