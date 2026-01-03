import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/calculatorUtils';

interface Step1Data {
  purchasePrice: number;
  downPaymentPercent: number;
}

interface SimpleModeStep1Props {
  data: Step1Data;
  onNext: (data: Step1Data) => void;
  onBack?: () => void;
}

export const SimpleModeStep1 = ({ data, onNext, onBack }: SimpleModeStep1Props) => {
  const [purchasePrice, setPurchasePrice] = useState(data.purchasePrice || 0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(data.downPaymentPercent || 20);

  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
  const closingCosts = purchasePrice * 0.03; // 3% closing costs
  const totalCashNeeded = downPaymentAmount + closingCosts;

  const handleNext = () => {
    if (purchasePrice > 0) {
      onNext({ purchasePrice, downPaymentPercent });
    }
  };

  const isValid = purchasePrice > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-100">Property Basics</h2>
        <p className="text-gray-400">Let's start with the purchase price</p>
      </div>

      {/* Purchase Price */}
      <div className="space-y-3">
        <Label htmlFor="purchase-price" className="text-lg text-gray-200">
          Purchase Price
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span>
          <Input
            id="purchase-price"
            type="number"
            value={purchasePrice || ''}
            onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            placeholder="275000"
            className="bg-surface-200 border-glass-border text-gray-100 text-2xl font-semibold pl-10 pr-4 py-6 text-center"
            step="5000"
          />
        </div>
        <p className="text-sm text-gray-400 text-center">Enter the property's asking price</p>
      </div>

      {/* Down Payment Selector */}
      <div className="space-y-3">
        <Label htmlFor="down-payment" className="text-lg text-gray-200">
          Down Payment
        </Label>
        <Select
          value={downPaymentPercent.toString()}
          onValueChange={(value) => setDownPaymentPercent(parseFloat(value))}
        >
          <SelectTrigger
            id="down-payment"
            className="bg-surface-200 border-glass-border text-gray-100 text-lg py-6"
          >
            <SelectValue placeholder="Select down payment" />
          </SelectTrigger>
          <SelectContent className="bg-surface-300 border-glass-border backdrop-blur-glass">
            <SelectItem value="5" className="text-gray-100 text-base">5% - Minimal down</SelectItem>
            <SelectItem value="10" className="text-gray-100 text-base">10% - Low down</SelectItem>
            <SelectItem value="15" className="text-gray-100 text-base">15% - Moderate</SelectItem>
            <SelectItem value="20" className="text-gray-100 text-base">20% - Traditional</SelectItem>
            <SelectItem value="25" className="text-gray-100 text-base">25% - Conservative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Auto-calculated Cash Needed */}
      {purchasePrice > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 space-y-3 animate-in fade-in duration-300">
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
            Cash Needed to Close
          </h3>
          <div className="space-y-2 text-gray-200">
            <div className="flex justify-between items-center">
              <span>Down Payment ({downPaymentPercent}%)</span>
              <span className="font-semibold">{formatCurrency(downPaymentAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Closing Costs (est. 3%)</span>
              <span className="font-semibold">{formatCurrency(closingCosts)}</span>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold">Total Cash Needed</span>
                <span className="font-bold text-primary">{formatCurrency(totalCashNeeded)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="flex-1"
        >
          Continue to Income & Expenses
        </Button>
      </div>
    </div>
  );
};
