/**
 * ProductTour Integration Example
 * Shows how to integrate the ProductTour component into your app
 */

import { useState } from 'react';
import { ProductTour, useShouldShowTour, resetProductTour } from './ProductTour';

/**
 * Example: Integrate into main App component
 */
export const AppWithTour = () => {
  const shouldShowTour = useShouldShowTour();
  const [showTour, setShowTour] = useState(shouldShowTour);

  const handleTourComplete = () => {
    console.log('✅ Tour completed!');
    setShowTour(false);

    // Optional: Track completion analytics
    if (window.gtag) {
      window.gtag('event', 'tour_complete', {
        event_category: 'onboarding',
        event_label: 'product_tour'
      });
    }
  };

  const handleTourSkip = () => {
    console.log('⏭️  Tour skipped');
    setShowTour(false);

    // Optional: Track skip analytics
    if (window.gtag) {
      window.gtag('event', 'tour_skip', {
        event_category: 'onboarding',
        event_label: 'product_tour'
      });
    }
  };

  return (
    <div>
      {/* Your app content */}
      <nav>
        <button data-tour="analyze-button">Analyze Property</button>
        <button data-tour="calculator-button">Calculator</button>
        <button data-tour="pricing-button">Pricing</button>
      </nav>

      <main>
        {/* Main app content */}
      </main>

      <button
        data-tour="support-button"
        style={{ position: 'fixed', bottom: '20px', right: '20px' }}
      >
        Support Chat
      </button>

      {/* Product Tour */}
      {showTour && (
        <ProductTour
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
          autoStart={true}
        />
      )}
    </div>
  );
};

/**
 * Example: Manual tour trigger (e.g., from Help menu)
 */
export const ManualTourTrigger = () => {
  const [showTour, setShowTour] = useState(false);

  const handleStartTour = () => {
    // Reset tour status to allow replay
    resetProductTour();
    setShowTour(true);
  };

  return (
    <div>
      <button onClick={handleStartTour}>
        Take Product Tour
      </button>

      {showTour && (
        <ProductTour
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
          autoStart={true}
        />
      )}
    </div>
  );
};

/**
 * Required data-tour attributes for tour targets:
 *
 * Add these to your UI elements:
 *
 * 1. Analyze button:
 *    <button data-tour="analyze-button">Analyze Property</button>
 *
 * 2. Calculator button:
 *    <button data-tour="calculator-button">Deal Calculator</button>
 *
 * 3. Support chat button:
 *    <button data-tour="support-button">Support Chat</button>
 *
 * 4. Pricing button:
 *    <button data-tour="pricing-button">View Pricing</button>
 */

/**
 * Analytics Integration:
 *
 * The tour automatically tracks:
 * - tour_complete: When user finishes the tour
 * - tour_skip: When user skips the tour
 *
 * You can add more granular tracking:
 *
 * window.gtag('event', 'tour_step_view', {
 *   event_category: 'onboarding',
 *   event_label: stepId,
 *   step_number: stepIndex
 * });
 */

/**
 * localStorage Keys Used:
 *
 * - propiq_tour_completed: "true" when completed
 * - propiq_tour_skipped: "true" when skipped
 * - propiq_tour_completed_at: ISO timestamp of completion
 *
 * Reset tour:
 * resetProductTour();
 */
