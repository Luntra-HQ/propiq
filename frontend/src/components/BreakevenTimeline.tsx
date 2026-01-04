/**
 * Breakeven Timeline Component
 *
 * Answers the critical question: "When will I recoup my investment?"
 * Shows timeline with cash flow + equity buildup (principal paydown + appreciation).
 *
 * Based on user feedback:
 * - "Want to know when I'll breakeven" (Rob)
 * - "ROI is dependent on how long you hold the property" (Shligton)
 *
 * @component
 */

import { Clock, CheckCircle, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { type QuickCheckResult, formatBreakevenTime, getBreakevenDate } from '../utils/smartDefaults';
import { formatCurrency } from '../utils/calculatorUtils';
import { useEffect } from 'react';

export interface BreakevenTimelineProps {
  result: QuickCheckResult;
  onView?: () => void;
}

export const BreakevenTimeline: React.FC<BreakevenTimelineProps> = ({ result, onView }) => {
  useEffect(() => {
    // Track view event
    if (onView) {
      onView();
    }
  }, [onView]);

  // Handle case where breakeven is not reached
  if (!result.breakevenMonths) {
    return (
      <div className="breakeven-warning glass-panel">
        <div className="warning-header">
          <AlertCircle className="h-6 w-6 text-amber-400" />
          <h4 className="text-amber-300 font-semibold">Breakeven Not Reached</h4>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          With current cash flow ({formatCurrency(result.monthlyCashFlow)}/mo), you won't recoup
          your {formatCurrency(result.assumptions.initialInvestment)} investment within 30 years.
        </p>
        <div className="warning-actions mt-4">
          <p className="text-sm text-gray-300 font-medium mb-2">💡 Recommended Actions:</p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Pass on this deal</li>
            <li>• Negotiate a 15-20% price reduction</li>
            <li>• Verify if rent can be increased</li>
            <li>• Consider house-hacking to reduce expenses</li>
          </ul>
        </div>
      </div>
    );
  }

  // Calculate milestones for timeline visualization
  const progressPercent = Math.min((12 / result.breakevenMonths) * 100, 100);

  // Get 5-year projection data (we'll use simplified version for now)
  const getYearlyData = (year: number) => {
    const monthIndex = year * 12;
    const cumulativeCashFlow = result.monthlyCashFlow * monthIndex;

    // Simple equity calculation (this would come from full breakeven timeline in production)
    const annualAppreciation = 0.035; // 3.5%
    const propertyValue = result.assumptions.purchasePrice * Math.pow(1 + annualAppreciation, year);
    const equityGained = propertyValue - result.assumptions.purchasePrice;

    // Estimate principal paydown (simplified)
    const principalPaydown = result.assumptions.downPayment * (year * 0.05); // Rough estimate

    const totalEquity = equityGained + principalPaydown;
    const totalReturn = cumulativeCashFlow + totalEquity;

    return {
      year,
      cumulativeCashFlow,
      principalPaydown,
      equityGained,
      totalEquity,
      totalReturn,
      propertyValue,
      breakevenReached: totalReturn >= result.assumptions.initialInvestment,
    };
  };

  const yearlyData = [1, 2, 3, 4, 5].map(getYearlyData);

  return (
    <div className="breakeven-timeline-card glass-panel">
      {/* Header */}
      <div className="timeline-header">
        <div className="header-icon-wrapper">
          <Clock className="h-6 w-6 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-50">When You'll Break Even</h3>
          <p className="text-sm text-gray-400">
            Time to recoup your {formatCurrency(result.assumptions.initialInvestment)} investment
          </p>
        </div>
      </div>

      {/* Big Number - Breakeven Time */}
      <div className="breakeven-hero">
        <div className="breakeven-value">
          <span className="years-number">{result.breakevenYears}</span>
          <span className="years-label">years</span>
          {result.breakevenMonths % 12 > 0 && (
            <>
              <span className="months-number">{result.breakevenMonths % 12}</span>
              <span className="months-label">months</span>
            </>
          )}
        </div>
        <p className="breakeven-date text-gray-400">
          {getBreakevenDate(result.breakevenMonths)}
        </p>
      </div>

      {/* Visual Timeline */}
      <div className="timeline-visual">
        <div className="timeline-milestones">
          {/* Today Marker */}
          <div className="milestone-marker start-marker" style={{ left: '0%' }}>
            <div className="marker-dot"></div>
            <div className="marker-label-wrapper">
              <span className="marker-label">Today</span>
              <span className="marker-value">$0</span>
            </div>
          </div>

          {/* Year 1 Marker (if before breakeven) */}
          {result.breakevenMonths > 12 && (
            <div
              className="milestone-marker mid-marker"
              style={{ left: `${Math.min((12 / result.breakevenMonths) * 100, 95)}%` }}
            >
              <div className="marker-dot"></div>
              <div className="marker-label-wrapper">
                <span className="marker-label">Year 1</span>
                <span className="marker-value">{formatCurrency(yearlyData[0].totalReturn)}</span>
              </div>
            </div>
          )}

          {/* Breakeven Marker */}
          <div className="milestone-marker end-marker" style={{ left: '100%' }}>
            <div className="marker-dot success-dot">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="marker-label-wrapper">
              <span className="marker-label success-label">✅ Breakeven</span>
              <span className="marker-value">{formatCurrency(result.assumptions.initialInvestment)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="timeline-progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* 5-Year Projection Table */}
      <div className="projection-section">
        <div className="projection-header">
          <TrendingUp className="h-5 w-5 text-violet-400" />
          <h4 className="text-sm font-semibold text-gray-300">5-Year Projection</h4>
        </div>

        <div className="projection-table-wrapper">
          <table className="projection-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Cash Flow</th>
                <th>Equity Gained</th>
                <th>Total Return</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((data) => (
                <tr
                  key={data.year}
                  className={data.breakevenReached ? 'breakeven-reached-row' : ''}
                >
                  <td className="year-cell">Year {data.year}</td>
                  <td className="cash-flow-cell">{formatCurrency(data.cumulativeCashFlow)}</td>
                  <td className="equity-cell">{formatCurrency(data.totalEquity)}</td>
                  <td className="total-cell font-semibold">{formatCurrency(data.totalReturn)}</td>
                  <td className="status-cell">
                    {data.breakevenReached ? (
                      <span className="status-badge success-badge">
                        <CheckCircle className="h-3 w-3" />
                        ✓
                      </span>
                    ) : (
                      <span className="status-badge pending-badge">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insight */}
      <div className="breakeven-insight">
        <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          This includes both <strong>cash flow</strong> from rent and{' '}
          <strong>equity buildup</strong> from principal paydown + appreciation (3.5% annually).
          Your actual breakeven may vary based on market conditions.
        </p>
      </div>

      {/* How Equity Builds Explanation */}
      <details className="equity-explanation">
        <summary className="explanation-summary">
          <Info className="h-4 w-4" />
          <span>How does equity build over time?</span>
        </summary>
        <div className="explanation-content">
          <p className="text-sm text-gray-400 mb-2">
            Your equity grows from three sources:
          </p>
          <ol className="equity-sources-list">
            <li>
              <strong>Cash Flow:</strong> Monthly profit from rent after all expenses
            </li>
            <li>
              <strong>Principal Paydown:</strong> Each mortgage payment reduces your loan balance,
              increasing your ownership stake
            </li>
            <li>
              <strong>Appreciation:</strong> Property value increases over time (we assume 3.5%
              annually, which is conservative)
            </li>
          </ol>
          <p className="text-sm text-gray-400 mt-2">
            💡 Even if cash flow is low, equity buildup can make the deal worthwhile for long-term
            investors.
          </p>
        </div>
      </details>
    </div>
  );
};

export default BreakevenTimeline;
