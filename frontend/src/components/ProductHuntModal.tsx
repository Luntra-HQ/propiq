/**
 * Product Hunt Launch Modal
 *
 * Special modal for Product Hunt visitors offering launch discount.
 * Shows once per session to PH traffic.
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Check } from 'lucide-react';

interface ProductHuntModalProps {
  /** Enable/disable modal */
  isActive?: boolean;
  /** Launch end date (creates urgency) */
  launchEndDate?: string;
}

export const ProductHuntModal: React.FC<ProductHuntModalProps> = ({
  isActive = false,
  launchEndDate,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Only show to Product Hunt traffic
    const urlParams = new URLSearchParams(window.location.search);
    const isFromPH =
      urlParams.get('ref') === 'producthunt' ||
      urlParams.get('utm_source') === 'producthunt' ||
      document.referrer.includes('producthunt.com');

    if (!isFromPH || !isActive) return;

    // Check if already shown this session
    const shown = sessionStorage.getItem('propiq_ph_modal_shown');
    if (shown) return;

    // Show modal after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem('propiq_ph_modal_shown', 'true');

      // Track modal view
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'product_hunt_modal_view', {
          event_category: 'Product Hunt',
          event_label: 'Modal Shown',
        });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isActive]);

  useEffect(() => {
    if (!launchEndDate) return;

    const updateTimer = () => {
      const end = new Date(launchEndDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Offer expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [launchEndDate]);

  const handleClose = () => {
    setIsVisible(false);

    // Track modal dismiss
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'product_hunt_modal_dismiss', {
        event_category: 'Product Hunt',
        event_label: 'Modal Closed',
      });
    }
  };

  const handleClaim = () => {
    // Track claim click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'product_hunt_offer_claim', {
        event_category: 'Product Hunt',
        event_label: 'Offer Claimed',
      });
    }

    // Redirect to signup with PH discount
    window.location.href = '/#waitlist?promo=PRODUCTHUNT50';
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-slate-900 border-2 border-orange-500 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-white pointer-events-auto animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-400 text-sm mb-4">
              <Sparkles className="h-4 w-4" />
              Product Hunt Exclusive
            </div>

            <h2 className="text-3xl font-bold mb-2">
              Welcome, Product Hunter! 🚀
            </h2>

            <p className="text-gray-400">
              Thanks for checking us out on Product Hunt!
            </p>
          </div>

          {/* Offer */}
          <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/40 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                50% OFF
              </p>
              <p className="text-gray-300 mt-2">
                First 3 months of any plan
              </p>
            </div>

            {/* Timer */}
            {timeRemaining && (
              <div className="flex items-center justify-center gap-2 text-sm text-orange-400">
                <Clock className="h-4 w-4 animate-pulse" />
                {timeRemaining}
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            {[
              'Unlimited property analyses',
              'AI-powered insights in 30 seconds',
              '5-year projection modeling',
              'Mobile-optimized experience',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-400" />
                </div>
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleClaim}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold text-lg transition shadow-lg"
          >
            Claim Your 50% Discount
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            No credit card required to start. Cancel anytime.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default ProductHuntModal;
