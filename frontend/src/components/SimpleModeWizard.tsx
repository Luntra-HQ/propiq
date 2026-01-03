import { useState } from 'react';
import { SimpleModeStep1 } from './SimpleModeStep1';
import { SimpleModeStep2 } from './SimpleModeStep2';
import { SimpleModeStep3 } from './SimpleModeStep3';
import { WizardSteps } from './ui/wizard-steps';
import { ProgressBar } from './ui/progress-bar';

interface SimpleModeWizardProps {
  onSwitchToAdvanced?: () => void;
}

export const SimpleModeWizard = ({ onSwitchToAdvanced }: SimpleModeWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState({ purchasePrice: 0, downPaymentPercent: 20 });
  const [step2Data, setStep2Data] = useState({
    monthlyRent: 0,
    expenseLevel: 'average' as 'low' | 'average' | 'high',
  });

  const handleStep1Next = (data: typeof step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Next = (data: typeof step2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const handleBackToStep1 = () => setCurrentStep(1);
  const handleBackToStep2 = () => setCurrentStep(2);

  const handleStartOver = () => {
    setCurrentStep(1);
    setStep1Data({ purchasePrice: 0, downPaymentPercent: 20 });
    setStep2Data({ monthlyRent: 0, expenseLevel: 'average' });
  };

  // Calculate monthly expenses from expense level
  const EXPENSE_PRESETS = {
    low: 1.0,
    average: 1.5,
    high: 2.0,
  };
  const monthlyExpenses =
    (step1Data.purchasePrice * (EXPENSE_PRESETS[step2Data.expenseLevel] / 100)) / 12;

  const steps = [
    { number: 1, label: 'Property', completed: currentStep > 1 },
    { number: 2, label: 'Income', completed: currentStep > 2 },
    { number: 3, label: 'Results', completed: false },
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2 animate-in fade-in duration-500">
        <h1 className="text-4xl font-bold text-gray-100">Quick Deal Analysis</h1>
        <p className="text-gray-400 text-lg">
          Get instant insights in 3 simple steps
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-4">
        <WizardSteps steps={steps} currentStep={currentStep} />
        <ProgressBar value={progress} />
      </div>

      {/* Step Content */}
      <div className="bg-surface-100/80 backdrop-blur-glass border border-glass-border rounded-2xl p-8 shadow-2xl">
        {currentStep === 1 && (
          <SimpleModeStep1 data={step1Data} onNext={handleStep1Next} />
        )}

        {currentStep === 2 && (
          <SimpleModeStep2
            data={step2Data}
            purchasePrice={step1Data.purchasePrice}
            onNext={handleStep2Next}
            onBack={handleBackToStep1}
          />
        )}

        {currentStep === 3 && (
          <SimpleModeStep3
            purchasePrice={step1Data.purchasePrice}
            downPaymentPercent={step1Data.downPaymentPercent}
            monthlyRent={step2Data.monthlyRent}
            monthlyExpenses={monthlyExpenses}
            onBack={handleBackToStep2}
            onStartOver={handleStartOver}
            onAdvancedMode={onSwitchToAdvanced}
          />
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center max-w-2xl mx-auto">
        This is a simplified analysis using standard assumptions (7.5% interest rate, 30-year loan, etc.).
        For detailed projections and custom scenarios, switch to Advanced Mode.
      </p>
    </div>
  );
};
