/**
 * Simple Mode Step 1 - Property Basics
 *
 * Collects purchase price and down payment percentage
 * Auto-calculates cash needed (down payment + closing costs)
 *
 * @component
 */

import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Step1Data } from './SimpleModeWizard';
import { calculateCashNeeded } from '../utils/verdictLogic';
import { formatCurrency } from '../utils/calculatorUtils';

interface SimpleModeStep1Props {
  onNext: (data: Step1Data) => void;
  initialData: Step1Data | null;
}

export const SimpleModeStep1 = ({ onNext, initialData }: SimpleModeStep1Props) => {
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice || 0);
  const [downPaymentPercent, setDownPaymentPercent] = useState<5 | 10 | 15 | 20 | 25>(
    initialData?.downPaymentPercent || 20
  );

  const isValid = purchasePrice > 0 && purchasePrice < 10000000;

  const cashNeeded = purchasePrice > 0
    ? calculateCashNeeded(purchasePrice, downPaymentPercent)
    : null;

  const handleNext = () => {
    if (isValid) {
      onNext({ purchasePrice, downPaymentPercent });
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
  }, [isValid, purchasePrice, downPaymentPercent]);

  return (
    <div className="simple-mode-step glass-container">
      <div className="step-header">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Property Basics</h2>
        <p className="text-gray-400">Let's start with the purchase details</p>
      </div>

      <div className="step-body mt-8 space-y-8">
        {/* Purchase Price */}
        <div className="input-group">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Purchase Price
          </label>
          <Input
            type="number"
            value={purchasePrice || ''}
            onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
            placeholder="$250,000"
            className="text-3xl font-semibold h-16 text-center bg-surface-200 border-glass-border text-gray-100"
            onFocus={(e) => e.target.select()}
          />
          <p className="text-xs text-gray-400 mt-1">
            The total amount you'll pay to buy the property
          </p>
        </div>

        {/* Down Payment */}
        <div className="input-group">
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Down Payment
          </label>
          <div className="button-group flex gap-2 flex-wrap">
            {([5, 10, 15, 20, 25] as const).map((percent) => (
              <Button
                key={percent}
                type="button"
                variant={downPaymentPercent === percent ? 'default' : 'outline'}
                className={`flex-1 min-w-[80px] ${
                  downPaymentPercent === percent
                    ? 'bg-primary text-white'
                    : 'bg-surface-200 text-gray-200 border-glass-border hover:bg-surface-300'
                }`}
                onClick={() => setDownPaymentPercent(percent)}
              >
                {percent}%
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Common down payments: 20% (conventional), 25% (investment), 5-10% (FHA/aggressive)
          </p>
        </div>

        {/* Cash Needed Display */}
        {cashNeeded && (
          <div className="cash-needed-display bg-surface-200 border border-glass-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-400">Cash Needed:</span>
              <span className="text-2xl font-bold text-gray-100">
                {formatCurrency(cashNeeded.total)}
              </span>
            </div>
            <div className="breakdown text-sm text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Down Payment ({downPaymentPercent}%):</span>
                <span>{formatCurrency(cashNeeded.downPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>Closing Costs (est. 3%):</span>
                <span>{formatCurrency(cashNeeded.closingCosts)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="step-footer mt-8">
        <Button
          onClick={handleNext}
          disabled={!isValid}
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          Next: Income & Expenses →
        </Button>
      </div>
    </div>
  );
};
