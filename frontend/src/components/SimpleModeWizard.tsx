/**
 * Simple Mode Wizard - 3-Step Property Analysis
 *
 * Guides beginners through quick property analysis:
 * Step 1: Property Basics (price, down payment)
 * Step 2: Income & Expenses (rent, maintenance level)
 * Step 3: Results & Verdict (instant analysis)
 *
 * @component
 */

import { useState } from 'react';
import './DealCalculator.css';

// Step components (to be created)
import { SimpleModeStep1 } from './SimpleModeStep1';
import { SimpleModeStep2 } from './SimpleModeStep2';
import { SimpleModeStep3 } from './SimpleModeStep3';

export interface Step1Data {
  purchasePrice: number;
  downPaymentPercent: 5 | 10 | 15 | 20 | 25;
}

export interface Step2Data {
  monthlyRent: number;
  expenseLevel: 'low' | 'average' | 'high';
}

export const SimpleModeWizard = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);

  const handleStep1Complete = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Complete = (data: Step2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2);
    }
  };

  const handleStartOver = () => {
    setStep1Data(null);
    setStep2Data(null);
    setCurrentStep(1);
  };

  return (
    <div className="simple-mode-wizard-container">
      {/* Progress Indicator */}
      <div className="wizard-progress">
        <div className="progress-steps">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Property</div>
          </div>
          <div className={`progress-line ${currentStep > 1 ? 'active' : ''}`} />
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Income</div>
          </div>
          <div className={`progress-line ${currentStep > 2 ? 'active' : ''}`} />
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Verdict</div>
          </div>
        </div>
      </div>

      {/* Wizard Steps */}
      <div className="wizard-content">
        {currentStep === 1 && (
          <SimpleModeStep1
            onNext={handleStep1Complete}
            initialData={step1Data}
          />
        )}

        {currentStep === 2 && step1Data && (
          <SimpleModeStep2
            step1Data={step1Data}
            onNext={handleStep2Complete}
            onBack={handleBack}
            initialData={step2Data}
          />
        )}

        {currentStep === 3 && step1Data && step2Data && (
          <SimpleModeStep3
            step1Data={step1Data}
            step2Data={step2Data}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
};
