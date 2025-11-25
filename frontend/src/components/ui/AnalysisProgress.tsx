/**
 * AnalysisProgress Component - 2025 Design System
 *
 * Streaming UI indicators for AI analysis progress.
 * Shows step-by-step progress during property analysis.
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FileText,
  CheckCircle,
  Loader2,
} from 'lucide-react';

export type AnalysisStep =
  | 'finding'
  | 'location'
  | 'market'
  | 'financials'
  | 'risk'
  | 'insights'
  | 'complete';

interface Step {
  id: AnalysisStep;
  label: string;
  activeLabel: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { id: 'finding', label: 'Find property data', activeLabel: 'Finding property data...', icon: Search },
  { id: 'location', label: 'Analyze location', activeLabel: 'Analyzing location...', icon: MapPin },
  { id: 'market', label: 'Check market trends', activeLabel: 'Checking market trends...', icon: TrendingUp },
  { id: 'financials', label: 'Calculate financials', activeLabel: 'Calculating financials...', icon: DollarSign },
  { id: 'risk', label: 'Assess risks', activeLabel: 'Assessing risks...', icon: AlertTriangle },
  { id: 'insights', label: 'Generate insights', activeLabel: 'Generating insights...', icon: FileText },
];

interface AnalysisProgressProps {
  currentStep: AnalysisStep;
  className?: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentStep,
  className = '',
}) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className={`space-y-3 ${className}`}>
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex || currentStep === 'complete';
        const isActive = index === currentIndex && currentStep !== 'complete';
        const isPending = index > currentIndex && currentStep !== 'complete';
        const Icon = step.icon;

        return (
          <div
            key={step.id}
            className={`
              flex items-center gap-3 p-3 rounded-xl transition-all duration-300
              ${isComplete ? 'bg-emerald-500/10 border border-emerald-500/30' : ''}
              ${isActive ? 'bg-violet-500/10 border border-violet-500/30' : ''}
              ${isPending ? 'bg-slate-800/30 border border-slate-700/30 opacity-50' : ''}
            `}
          >
            {/* Status Icon */}
            <div
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${isComplete ? 'bg-emerald-500/20' : ''}
                ${isActive ? 'bg-violet-500/20' : ''}
                ${isPending ? 'bg-slate-700/50' : ''}
              `}
            >
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
              ) : (
                <Icon className="h-5 w-5 text-gray-500" />
              )}
            </div>

            {/* Label */}
            <span
              className={`
                text-sm font-medium
                ${isComplete ? 'text-emerald-300' : ''}
                ${isActive ? 'text-violet-300 progress-pulse' : ''}
                ${isPending ? 'text-gray-500' : ''}
              `}
            >
              {isActive ? step.activeLabel : step.label}
            </span>

            {/* Checkmark for complete */}
            {isComplete && (
              <div className="ml-auto">
                <svg
                  className="h-5 w-5 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12l5 5L20 7" className="checkmark-draw" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * useAnalysisProgress - Hook for simulating analysis progress
 */
interface UseAnalysisProgressOptions {
  onComplete?: () => void;
  stepDuration?: number;
}

export const useAnalysisProgress = ({
  onComplete,
  stepDuration = 2000,
}: UseAnalysisProgressOptions = {}) => {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('finding');
  const [isRunning, setIsRunning] = useState(false);

  const start = () => {
    setIsRunning(true);
    setCurrentStep('finding');
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentStep('finding');
  };

  useEffect(() => {
    if (!isRunning) return;

    const stepOrder: AnalysisStep[] = ['finding', 'location', 'market', 'financials', 'risk', 'insights', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);

    if (currentStep === 'complete') {
      setIsRunning(false);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [currentStep, isRunning, stepDuration, onComplete]);

  return {
    currentStep,
    isRunning,
    start,
    reset,
    setCurrentStep,
  };
};

/**
 * AnalysisProgressOverlay - Full-screen progress overlay
 */
interface AnalysisProgressOverlayProps {
  isVisible: boolean;
  currentStep: AnalysisStep;
  address?: string;
  onCancel?: () => void;
}

export const AnalysisProgressOverlay: React.FC<AnalysisProgressOverlayProps> = ({
  isVisible,
  currentStep,
  address,
  onCancel,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 float-soft">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Analyzing Property</h2>
          {address && (
            <p className="text-gray-400 text-sm truncate">{address}</p>
          )}
        </div>

        {/* Progress Steps */}
        <AnalysisProgress currentStep={currentStep} />

        {/* Cancel Button */}
        {onCancel && currentStep !== 'complete' && (
          <button
            onClick={onCancel}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 hover:text-white text-sm font-medium transition-all"
          >
            Cancel Analysis
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalysisProgress;
