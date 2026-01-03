/**
 * Simple Mode Step 2 - Income & Expenses
 *
 * Collects monthly rent and expense level estimate
 * Shows estimated cash flow preview
 *
 * @component
 */

import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Step1Data, Step2Data } from './SimpleModeWizard';
import { EXPENSE_PRESETS, ExpenseLevel } from '../utils/verdictLogic';
import { formatCurrency, calculateMonthlyMortgagePayment } from '../utils/calculatorUtils';

interface SimpleModeStep2Props {
  step1Data: Step1Data;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
  initialData: Step2Data | null;
}

interface ExpenseCardProps {
  level: ExpenseLevel;
  label: string;
  description: string;
  amount: number;
  selected: boolean;
  onClick: () => void;
}

const ExpenseCard = ({ level, label, description, amount, selected, onClick }: ExpenseCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`expense-card p-4 rounded-xl border-2 transition-all text-left ${
      selected
        ? 'border-primary bg-primary/10'
        : 'border-glass-border bg-surface-200 hover:border-glass-border-hover'
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className={`font-semibold ${selected ? 'text-primary' : 'text-gray-200'}`}>
        {label}
      </h4>
      <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-gray-400'}`}>
        {formatCurrency(amount)}/mo
      </span>
    </div>
    <p className="text-sm text-gray-400">{description}</p>
  </button>
);

export const SimpleModeStep2 = ({ step1Data, onNext, onBack, initialData }: SimpleModeStep2Props) => {
  const [monthlyRent, setMonthlyRent] = useState(initialData?.monthlyRent || 0);
  const [expenseLevel, setExpenseLevel] = useState<ExpenseLevel>(
    initialData?.expenseLevel || 'average'
  );

  const isValid = monthlyRent > 0;

  // Calculate mortgage payment
  const loanAmount = step1Data.purchasePrice * (1 - step1Data.downPaymentPercent / 100);
  const mortgagePayment = calculateMonthlyMortgagePayment(loanAmount, 7.5, 30);

  // Calculate monthly expenses
  const monthlyMaintenance = EXPENSE_PRESETS[expenseLevel](step1Data.purchasePrice);
  const monthlyPropertyTax = Math.round(step1Data.purchasePrice * 0.012 / 12);
  const monthlyInsurance = Math.round(step1Data.purchasePrice * 0.005 / 12);
  const monthlyManagement = Math.round(monthlyRent * 0.10);
  const monthlyVacancy = Math.round(monthlyRent * 0.05);

  const totalExpenses = mortgagePayment + monthlyMaintenance + monthlyPropertyTax + monthlyInsurance + monthlyManagement + monthlyVacancy;
  const estimatedCashFlow = monthlyRent - totalExpenses;

  const handleNext = () => {
    if (isValid) {
      onNext({ monthlyRent, expenseLevel });
    }
  };

  // Allow Enter key to proceed
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isValid) {
        handleNext();
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isValid, monthlyRent, expenseLevel]);

  return (
    <div className="simple-mode-step glass-container">
      <div className="step-header">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Income & Expenses</h2>
        <p className="text-gray-400">How much can you rent it for?</p>
      </div>

      <div className="step-body mt-8 space-y-8">
        {/* Monthly Rent */}
        <div className="input-group">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Monthly Rent
          </label>
          <Input
            type="number"
            value={monthlyRent || ''}
            onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
            placeholder="$2,200"
            className="text-3xl font-semibold h-16 text-center bg-surface-200 border-glass-border text-gray-100"
            onFocus={(e) => e.target.select()}
          />
          <p className="text-xs text-gray-400 mt-1">
            Research 3+ comparable rentals in the area (don't rely on Zillow alone)
          </p>
        </div>

        {/* Expense Level */}
        <div className="input-group">
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Expected Maintenance & Repairs
          </label>
          <div className="expense-cards space-y-3">
            <ExpenseCard
              level="low"
              label="Low Maintenance"
              description="Newer property (built 2010+), minimal repairs expected"
              amount={EXPENSE_PRESETS.low(step1Data.purchasePrice)}
              selected={expenseLevel === 'low'}
              onClick={() => setExpenseLevel('low')}
            />
            <ExpenseCard
              level="average"
              label="Average Maintenance"
              description="Typical rental (1990-2010), standard upkeep needed"
              amount={EXPENSE_PRESETS.average(step1Data.purchasePrice)}
              selected={expenseLevel === 'average'}
              onClick={() => setExpenseLevel('average')}
            />
            <ExpenseCard
              level="high"
              label="High Maintenance"
              description="Older property (pre-1990), frequent repairs likely"
              amount={EXPENSE_PRESETS.high(step1Data.purchasePrice)}
              selected={expenseLevel === 'high'}
              onClick={() => setExpenseLevel('high')}
            />
          </div>
        </div>

        {/* Cash Flow Preview */}
        {monthlyRent > 0 && (
          <div className={`cash-flow-preview rounded-xl p-6 border-2 ${
            estimatedCashFlow > 0
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">
                Estimated Monthly Cash Flow:
              </span>
              <span className={`text-2xl font-bold ${
                estimatedCashFlow > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatCurrency(estimatedCashFlow)}
              </span>
            </div>
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Income:</span>
                <span>+{formatCurrency(monthlyRent)}</span>
              </div>
              <div className="flex justify-between">
                <span>Expenses:</span>
                <span>-{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="step-footer mt-8 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-surface-200 text-gray-200 border-glass-border hover:bg-surface-300"
        >
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          size="lg"
          className="flex-1 bg-primary hover:bg-primary/90 text-white"
        >
          See My Verdict →
        </Button>
      </div>
    </div>
  );
};
