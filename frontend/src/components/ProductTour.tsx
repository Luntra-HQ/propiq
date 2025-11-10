/**
 * PropIQ Product Tour Component
 * Sprint 9: User Onboarding & Growth
 *
 * Interactive tour guiding new users through key features:
 * - Property Analysis
 * - Deal Calculator
 * - Support Chat
 * - Pricing Plans
 *
 * Features:
 * - Step-by-step walkthrough
 * - Skip/Complete functionality
 * - Progress indicator
 * - Keyboard navigation (Escape to close, Arrow keys to navigate)
 * - Auto-save completion status to localStorage
 * - Responsive design
 */

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Home, Calculator, MessageCircle, CreditCard } from 'lucide-react';
import './ProductTour.css';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  targetSelector?: string; // CSS selector for highlighting element
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface ProductTourProps {
  onComplete: () => void;
  onSkip: () => void;
  autoStart?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to PropIQ!',
    description: 'Let\'s take a quick 60-second tour to show you how PropIQ helps you find and analyze investment properties faster.',
    icon: Sparkles,
    position: 'bottom'
  },
  {
    id: 'analysis',
    title: 'AI-Powered Property Analysis',
    description: 'Enter any property address to get instant market insights, cash flow projections, and investment recommendations powered by GPT-4.',
    icon: Home,
    targetSelector: '[data-tour="analyze-button"]',
    position: 'bottom'
  },
  {
    id: 'calculator',
    title: 'Advanced Deal Calculator',
    description: 'Run comprehensive financial analysis with our 3-tab calculator. Model scenarios, project 5-year returns, and get instant deal scores (0-100).',
    icon: Calculator,
    targetSelector: '[data-tour="calculator-button"]',
    position: 'bottom'
  },
  {
    id: 'support',
    title: '24/7 AI Support Chat',
    description: 'Need help? Click the chat button anytime to ask our AI assistant about real estate investing or PropIQ features.',
    icon: MessageCircle,
    targetSelector: '[data-tour="support-button"]',
    position: 'left'
  },
  {
    id: 'pricing',
    title: 'Start with 3 Free Analyses',
    description: 'You have 3 free property analyses to get started. Upgrade anytime for unlimited access and advanced features.',
    icon: CreditCard,
    targetSelector: '[data-tour="pricing-button"]',
    position: 'bottom'
  }
];

export const ProductTour: React.FC<ProductTourProps> = ({
  onComplete,
  onSkip,
  autoStart = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  // Start tour on mount if autoStart enabled
  useEffect(() => {
    if (autoStart) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  // Highlight target element
  useEffect(() => {
    if (!isOpen || !step.targetSelector) {
      // Clear highlight
      if (highlightedElement) {
        highlightedElement.style.position = '';
        highlightedElement.style.zIndex = '';
        highlightedElement.style.boxShadow = '';
        setHighlightedElement(null);
      }
      return;
    }

    const element = document.querySelector(step.targetSelector) as HTMLElement;
    if (element) {
      // Highlight element
      element.style.position = 'relative';
      element.style.zIndex = '10001';
      element.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)';
      setHighlightedElement(element);

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      // Cleanup highlight on unmount
      if (element) {
        element.style.position = '';
        element.style.zIndex = '';
        element.style.boxShadow = '';
      }
    };
  }, [isOpen, currentStep, step.targetSelector]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    // Save skip status
    localStorage.setItem('propiq_tour_skipped', 'true');
    onSkip();
  };

  const handleComplete = () => {
    setIsOpen(false);
    // Save completion status
    localStorage.setItem('propiq_tour_completed', 'true');
    localStorage.setItem('propiq_tour_completed_at', new Date().toISOString());
    onComplete();
  };

  if (!isOpen) return null;

  const StepIcon = step.icon;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="tour-backdrop" />

      {/* Tour card */}
      <div className="tour-card">
        {/* Progress bar */}
        <div className="tour-progress-container">
          <div
            className="tour-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="tour-close-button"
          aria-label="Close tour"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="tour-content">
          {/* Icon */}
          <div className="tour-icon">
            <StepIcon className="h-8 w-8" />
          </div>

          {/* Step indicator */}
          <div className="tour-step-indicator">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </div>

          {/* Title */}
          <h3 className="tour-title">{step.title}</h3>

          {/* Description */}
          <p className="tour-description">{step.description}</p>

          {/* Navigation */}
          <div className="tour-navigation">
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="tour-nav-button tour-nav-button-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            {/* Skip button */}
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="tour-nav-button tour-nav-button-text"
              >
                Skip Tour
              </button>
            )}

            {/* Next/Complete button */}
            <button
              onClick={handleNext}
              className="tour-nav-button tour-nav-button-primary"
            >
              {isLastStep ? (
                <>
                  Complete
                  <Check className="h-5 w-5" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {/* Keyboard hints */}
          <div className="tour-hints">
            <span>Use arrow keys to navigate</span>
            <span>•</span>
            <span>Press ESC to skip</span>
          </div>
        </div>

        {/* Step dots */}
        <div className="tour-dots">
          {TOUR_STEPS.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={`tour-dot ${index === currentStep ? 'tour-dot-active' : ''} ${index < currentStep ? 'tour-dot-completed' : ''}`}
              aria-label={`Go to step ${index + 1}`}
            >
              {index < currentStep && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

/**
 * Hook to check if user should see the tour
 */
export const useShouldShowTour = (): boolean => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('propiq_tour_completed');
    const skipped = localStorage.getItem('propiq_tour_skipped');

    // Show tour if user hasn't completed or skipped it
    setShouldShow(!completed && !skipped);
  }, []);

  return shouldShow;
};

/**
 * Function to manually reset tour (for testing or user request)
 */
export const resetProductTour = () => {
  localStorage.removeItem('propiq_tour_completed');
  localStorage.removeItem('propiq_tour_skipped');
  localStorage.removeItem('propiq_tour_completed_at');
};
