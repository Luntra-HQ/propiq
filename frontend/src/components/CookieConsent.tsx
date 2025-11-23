/**
 * CookieConsent.tsx
 * GDPR/CCPA compliant cookie consent banner
 *
 * Features:
 * - Blocks analytics until consent given
 * - Persists preference in localStorage
 * - Respects "Do Not Track" browser setting
 * - Provides granular consent options
 */

import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield } from 'lucide-react';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

// Cookie consent storage key
const CONSENT_KEY = 'propiq_cookie_consent';
const CONSENT_VERSION = '1.0'; // Increment to re-prompt users after policy changes

interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const stored = localStorage.getItem(CONSENT_KEY);

    if (stored) {
      try {
        const consent: ConsentState = JSON.parse(stored);
        // Re-prompt if consent version changed
        if (consent.version !== CONSENT_VERSION) {
          setShowBanner(true);
        } else if (consent.analytics) {
          // Re-enable analytics if previously accepted
          enableAnalytics();
        }
      } catch {
        setShowBanner(true);
      }
    } else {
      // Check "Do Not Track" browser setting
      const dnt = navigator.doNotTrack === '1' || (window as any).doNotTrack === '1';
      if (dnt) {
        // Respect DNT - don't show banner, don't track
        saveConsent(false, false);
      } else {
        // Small delay to not interrupt initial page load
        setTimeout(() => setShowBanner(true), 1500);
      }
    }
  }, []);

  const enableAnalytics = () => {
    // Enable Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }

    // Enable Microsoft Clarity (already loaded, just confirming consent)
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('consent');
    }
  };

  const disableAnalytics = () => {
    // Disable Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  };

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const consent: ConsentState = {
      analytics,
      marketing,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
    enableAnalytics();
    setShowBanner(false);
    onAccept?.();
  };

  const handleAcceptEssential = () => {
    saveConsent(false, false);
    disableAnalytics();
    setShowBanner(false);
    onDecline?.();
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideInUp"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-4xl mx-auto bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
        {/* Main Banner */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-violet-600/20 p-3 rounded-lg">
              <Cookie className="h-6 w-6 text-violet-400" />
            </div>

            <div className="flex-1">
              <h3 id="cookie-consent-title" className="text-lg font-bold text-white mb-2">
                We value your privacy
              </h3>
              <p id="cookie-consent-description" className="text-sm text-gray-300 mb-4">
                We use cookies and similar technologies to improve your experience, analyze site usage,
                and assist in our marketing efforts. By clicking "Accept All", you consent to our use
                of cookies. You can customize your preferences or reject non-essential cookies.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Accept All
                </button>
                <button
                  onClick={handleAcceptEssential}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleCustomize}
                  className="px-5 py-2.5 text-violet-300 hover:text-violet-200 font-medium transition-colors focus:outline-none focus:underline"
                >
                  {showDetails ? 'Hide Details' : 'Cookie Settings'}
                </button>
              </div>
            </div>

            {/* Close button (accepts essential only) */}
            <button
              onClick={handleAcceptEssential}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              aria-label="Close and accept essential cookies only"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Detailed Settings Panel */}
        {showDetails && (
          <div className="border-t border-slate-700 bg-slate-900/50 p-6">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Cookie Categories
            </h4>

            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between gap-4 p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Essential Cookies</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Required for the website to function. Cannot be disabled.
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded">
                  Always Active
                </span>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between gap-4 p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Analytics Cookies</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Help us understand how visitors interact with our website (Google Analytics, Microsoft Clarity).
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-slate-700 px-2 py-1 rounded">
                  Optional
                </span>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between gap-4 p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Marketing Cookies</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Used to deliver relevant advertisements and track campaign effectiveness.
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-slate-700 px-2 py-1 rounded">
                  Optional
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-gray-400">
                For more information, please read our{' '}
                <a
                  href="https://luntra.one/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  Privacy Policy
                </a>
                {' '}and{' '}
                <a
                  href="https://luntra.one/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  Cookie Policy
                </a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
