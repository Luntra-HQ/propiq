/**
 * QuickCheck Component - 2-Input Property Analyzer
 *
 * Provides instant deal analysis using only purchase price and monthly rent.
 * All other values are estimated using conservative national averages.
 *
 * Features:
 * - 2-input form (price + rent)
 * - Executive summary with deal score
 * - Inline calculation explanations
 * - Breakeven timeline
 * - Seamless graduation to Advanced Mode
 *
 * @component
 */

import { useState } from 'react';
import { Zap, Info, ArrowRight } from 'lucide-react';
import { calculateQuickCheck, type QuickCheckResult } from '../utils/smartDefaults';
import { ExecutiveSummary } from './ExecutiveSummary';
import { CalculationExplanation } from './CalculationExplanation';
import { BreakevenTimeline } from './BreakevenTimeline';
import { formatCurrency } from '../utils/calculatorUtils';
import '../styles/quickcheck.css';

export interface QuickCheckProps {
  onSwitchToAdvanced?: (prefilledData: any) => void;
}

export const QuickCheck: React.FC<QuickCheckProps> = ({ onSwitchToAdvanced }) => {
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [monthlyRent, setMonthlyRent] = useState<string>('');
  const [result, setResult] = useState<QuickCheckResult | null>(null);
  const [openCalculation, setOpenCalculation] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAnalyze = () => {
    const price = parseFloat(purchasePrice);
    const rent = parseFloat(monthlyRent);

    if (isNaN(price) || isNaN(rent) || price <= 0 || rent <= 0) {
      alert('Please enter valid numbers for both purchase price and monthly rent.');
      return;
    }

    setIsCalculating(true);

    // Simulate brief calculation time for UX (feels more trustworthy)
    setTimeout(() => {
      const calculation = calculateQuickCheck(price, rent);
      setResult(calculation);
      setIsCalculating(false);

      // Track analytics
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', 'quick_check_analyze', {
          price,
          rent,
          dealScore: calculation.dealScore,
        });
      }
    }, 500);
  };

  const handleLoadIntoAdvanced = () => {
    if (!result || !onSwitchToAdvanced) return;

    // Pre-fill Advanced Mode with QuickCheck data
    const prefilledData = {
      purchasePrice: result.assumptions.purchasePrice,
      monthlyRent: result.assumptions.monthlyRent,
      downPaymentPercent: 20,
      interestRate: result.assumptions.interestRate,
      loanTerm: 30,
      closingCosts: result.assumptions.closingCosts,
      annualPropertyTax: result.assumptions.estimatedTaxes,
      annualInsurance: result.assumptions.estimatedInsurance,
      monthlyMaintenance: result.assumptions.estimatedMaintenance,
      monthlyVacancy: result.assumptions.estimatedVacancy,
      monthlyPropertyManagement: result.assumptions.estimatedPropertyMgmt,
      monthlyHOA: 0,
      monthlyUtilities: 0,
      rehabCosts: 0,
      strategy: 'rental' as const,
      marketTier: 'tier2' as const,
    };

    // Track conversion
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'switched_to_advanced', {
        fromQuickCheck: true,
        dataPreFilled: true,
        dealScore: result.dealScore,
      });
    }

    onSwitchToAdvanced(prefilledData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="quick-check-container">
      {/* Header */}
      <div className="quick-check-header">
        <div className="header-icon">
          <Zap className="h-8 w-8 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-50">⚡ Quick Check</h2>
          <p className="text-gray-400 mt-1">Get instant deal analysis in 5 seconds</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="quick-check-form">
        <div className="input-grid">
          {/* Purchase Price */}
          <div className="input-group">
            <label htmlFor="purchasePrice" className="input-label">
              Purchase Price
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                id="purchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="250,000"
                className="input-field"
                min="0"
                step="1000"
              />
            </div>
            <p className="input-hint">💡 Example: $250,000</p>
          </div>

          {/* Monthly Rent */}
          <div className="input-group">
            <label htmlFor="monthlyRent" className="input-label">
              Monthly Rent
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                id="monthlyRent"
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="1,800"
                className="input-field"
                min="0"
                step="50"
              />
            </div>
            <p className="input-hint">💡 Example: $1,800/month</p>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={isCalculating || !purchasePrice || !monthlyRent}
          className="analyze-btn"
        >
          {isCalculating ? (
            <>
              <div className="spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Analyze Deal
            </>
          )}
        </button>

        {/* Trust Statement */}
        <div className="trust-statement">
          <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />
          <p className="text-sm text-gray-400">
            We'll estimate costs based on conservative national averages.
            Click any number to see how we calculated it.
          </p>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="quick-check-results">
          {/* Executive Summary */}
          <ExecutiveSummary
            result={result}
            onClickMetric={(metric) => {
              setOpenCalculation(openCalculation === metric ? null : metric);

              // Track analytics
              if (typeof window !== 'undefined' && (window as any).clarity) {
                (window as any).clarity('event', 'calculation_explanation_opened', { metric });
              }
            }}
          />

          {/* Calculation Explanations */}
          <CalculationExplanation
            metric="cashFlow"
            result={result}
            isOpen={openCalculation === 'cashFlow'}
            onToggle={() => setOpenCalculation(openCalculation === 'cashFlow' ? null : 'cashFlow')}
          />

          <CalculationExplanation
            metric="cocReturn"
            result={result}
            isOpen={openCalculation === 'cocReturn'}
            onToggle={() => setOpenCalculation(openCalculation === 'cocReturn' ? null : 'cocReturn')}
          />

          <CalculationExplanation
            metric="onePercent"
            result={result}
            isOpen={openCalculation === 'onePercent'}
            onToggle={() => setOpenCalculation(openCalculation === 'onePercent' ? null : 'onePercent')}
          />

          {/* Breakeven Timeline */}
          {result.breakevenMonths && (
            <BreakevenTimeline
              result={result}
              onView={() => {
                // Track analytics
                if (typeof window !== 'undefined' && (window as any).clarity) {
                  (window as any).clarity('event', 'breakeven_viewed', {
                    months: result.breakevenMonths,
                  });
                }
              }}
            />
          )}

          {/* CTA to Advanced Mode */}
          {onSwitchToAdvanced && (
            <div className="upgrade-card glass-panel">
              <h4 className="text-lg font-semibold text-gray-50 mb-2">
                Want More Precision?
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Load these numbers into Advanced Mode and customize
                every assumption for accurate analysis.
              </p>
              <button onClick={handleLoadIntoAdvanced} className="btn-secondary w-full">
                <ArrowRight className="h-5 w-5" />
                Load into Advanced Mode
              </button>
            </div>
          )}

          {/* Assumptions Panel (Always Visible) */}
          <div className="assumptions-panel glass-panel">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">📋 Assumptions We Used:</h4>
            <ul className="assumptions-list">
              <li>
                <span className="assumption-label">Down Payment:</span>
                <span className="assumption-value">
                  {formatCurrency(result.assumptions.downPayment)} (20%)
                </span>
              </li>
              <li>
                <span className="assumption-label">Interest Rate:</span>
                <span className="assumption-value">{result.assumptions.interestRate}% (current market avg)</span>
              </li>
              <li>
                <span className="assumption-label">Closing Costs:</span>
                <span className="assumption-value">
                  {formatCurrency(result.assumptions.closingCosts)} (3% of price)
                </span>
              </li>
              <li>
                <span className="assumption-label">Property Tax:</span>
                <span className="assumption-value">
                  {formatCurrency(result.assumptions.estimatedTaxes / 12)}/mo (1.2% annually)
                </span>
              </li>
              <li>
                <span className="assumption-label">Insurance:</span>
                <span className="assumption-value">
                  {formatCurrency(result.assumptions.estimatedInsurance / 12)}/mo (0.5% annually)
                </span>
              </li>
              <li>
                <span className="assumption-label">Maintenance Reserve:</span>
                <span className="assumption-value">
                  {formatCurrency(result.assumptions.estimatedMaintenance)}/mo (1% rule)
                </span>
              </li>
              <li>
                <span className="assumption-label">Vacancy Reserve:</span>
                <span className="assumption-value">
                  {formatCurrency(result.assumptions.estimatedVacancy)}/mo (8% of rent)
                </span>
              </li>
              <li>
                <span className="assumption-label">Property Management:</span>
                <span className="assumption-value">
                  {formatCurrency(result.assumptions.estimatedPropertyMgmt)}/mo (10% of rent)
                </span>
              </li>
            </ul>
            <p className="assumptions-note">
              💡 These are conservative national averages. Your actual costs may vary.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isCalculating && (
        <div className="empty-state">
          <div className="empty-icon">
            <Zap className="h-12 w-12 text-gray-600" />
          </div>
          <p className="text-gray-400 text-center">
            Enter a purchase price and monthly rent above to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickCheck;
