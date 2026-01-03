import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/calculatorUtils';
import { cn } from '@/lib/utils';

interface Step2Data {
  monthlyRent: number;
  expenseLevel: 'low' | 'average' | 'high';
}

interface SimpleModeStep2Props {
  data: Step2Data;
  purchasePrice: number;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

// Expense presets based on purchase price
const EXPENSE_PRESETS = {
  low: {
    percent: 1.0,
    label: 'Low (1%/year)',
    description: 'Well-maintained, newer property'
  },
  average: {
    percent: 1.5,
    label: 'Average (1.5%/year)',
    description: 'Typical maintenance & repairs'
  },
  high: {
    percent: 2.0,
    label: 'High (2%/year)',
    description: 'Older property, higher upkeep'
  },
};

export const SimpleModeStep2 = ({ data, purchasePrice, onNext, onBack }: SimpleModeStep2Props) => {
  const [monthlyRent, setMonthlyRent] = useState(data.monthlyRent || 0);
  const [expenseLevel, setExpenseLevel] = useState<'low' | 'average' | 'high'>(data.expenseLevel || 'average');

  const monthlyExpenses = (purchasePrice * (EXPENSE_PRESETS[expenseLevel].percent / 100)) / 12;

  const handleNext = () => {
    if (monthlyRent > 0) {
      onNext({ monthlyRent, expenseLevel });
    }
  };

  const isValid = monthlyRent > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-100">Income & Expenses</h2>
        <p className="text-gray-400">Tell us about the rental income and costs</p>
      </div>

      {/* Monthly Rent */}
      <div className="space-y-3">
        <Label htmlFor="monthly-rent" className="text-lg text-gray-200">
          Expected Monthly Rent
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span>
          <Input
            id="monthly-rent"
            type="number"
            value={monthlyRent || ''}
            onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            placeholder="2200"
            className="bg-surface-200 border-glass-border text-gray-100 text-2xl font-semibold pl-10 pr-4 py-6 text-center"
            step="50"
          />
        </div>
        <p className="text-sm text-gray-400 text-center">
          Research comparable rentals in the area
        </p>
      </div>

      {/* Expense Level Presets */}
      <div className="space-y-3">
        <Label className="text-lg text-gray-200">
          Property Maintenance Level
        </Label>
        <div className="grid grid-cols-1 gap-3">
          {(Object.keys(EXPENSE_PRESETS) as Array<keyof typeof EXPENSE_PRESETS>).map((level) => (
            <button
              key={level}
              onClick={() => setExpenseLevel(level)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                expenseLevel === level
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-glass-border bg-surface-200 hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="font-semibold text-gray-100">
                  {EXPENSE_PRESETS[level].label}
                </span>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all",
                  expenseLevel === level
                    ? "border-primary bg-primary"
                    : "border-gray-500"
                )}>
                  {expenseLevel === level && (
                    <svg
                      className="w-full h-full text-white p-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400">{EXPENSE_PRESETS[level].description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Expense Estimate Display */}
      {purchasePrice > 0 && (
        <div className="bg-surface-200/50 border border-glass-border rounded-xl p-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Estimated Monthly Maintenance</span>
            <span className="font-semibold text-gray-100 text-lg">
              ~{formatCurrency(monthlyExpenses)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Based on {EXPENSE_PRESETS[expenseLevel].percent}% of purchase price annually
          </p>
        </div>
      )}

      {/* Quick 1% Rule Check */}
      {monthlyRent > 0 && purchasePrice > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <span className="font-semibold text-gray-200">Quick Check: 1% Rule</span>
          </div>
          <p className="text-sm text-gray-300">
            Monthly rent is{' '}
            <span className="font-bold text-primary">
              {((monthlyRent / purchasePrice) * 100).toFixed(2)}%
            </span>
            {' '}of purchase price.{' '}
            {(monthlyRent / purchasePrice) >= 0.01
              ? '✅ Meets the 1% rule!'
              : '⚠️ Below the 1% rule (aim for 1% or higher).'}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="flex-1"
        >
          See Analysis Results
        </Button>
      </div>
    </div>
  );
};
