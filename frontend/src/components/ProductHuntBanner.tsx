/**
 * Product Hunt Launch Banner
 *
 * Displays during PH launch day to drive upvotes and engagement.
 * Shows launch offer and direct link to PH listing.
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, X, ExternalLink } from 'lucide-react';

interface ProductHuntBannerProps {
  /** Product Hunt listing URL (set once live) */
  productHuntUrl?: string;
  /** Enable/disable banner display */
  isActive?: boolean;
  /** Launch date (will auto-hide after 48 hours) */
  launchDate?: string;
}

export const ProductHuntBanner: React.FC<ProductHuntBannerProps> = ({
  productHuntUrl = 'https://www.producthunt.com/@propiq',
  isActive = false,
  launchDate,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed
    const dismissed = localStorage.getItem('propiq_ph_banner_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Check if within 48 hours of launch
    if (launchDate) {
      const launch = new Date(launchDate);
      const now = new Date();
      const hoursSinceLaunch = (now.getTime() - launch.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLaunch > 48) {
        setIsVisible(false);
        return;
      }
    }

    // Show banner if active
    setIsVisible(isActive);
  }, [isActive, launchDate]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('propiq_ph_banner_dismissed', 'true');
  };

  const handleClick = () => {
    // Track PH banner click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'product_hunt_banner_click', {
        event_category: 'Product Hunt',
        event_label: 'Banner Click',
      });
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg animate-slideInDown">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: PH Logo + Message */}
        <div className="flex items-center gap-3 flex-1">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <p className="text-sm sm:text-base font-semibold">
              🚀 We're live on Product Hunt today!
            </p>
            <p className="text-xs sm:text-sm opacity-90 hidden sm:block">
              Support us with an upvote + get 50% off for 3 months
            </p>
          </div>
        </div>

        {/* Right: CTA + Close */}
        <div className="flex items-center gap-2">
          <a
            href={productHuntUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition flex items-center gap-2 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Upvote on</span> Product Hunt
            <ExternalLink className="h-4 w-4" />
          </a>

          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar animation (optional visual flair) */}
      <div className="h-1 bg-white/20 overflow-hidden">
        <div className="h-full bg-white/40 animate-shimmer"
             style={{ width: '100%', animation: 'shimmer 2s infinite' }} />
      </div>

      <style>{`
        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-slideInDown {
          animation: slideInDown 0.5s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ProductHuntBanner;
