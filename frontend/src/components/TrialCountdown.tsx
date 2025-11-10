/**
 * Trial Countdown Component
 * Sprint 9: User Onboarding & Growth
 *
 * Displays trial status notifications to encourage upgrades:
 * - Analyses remaining counter
 * - Progress bar visualization
 * - Contextual upgrade prompts
 * - Dismissible banner
 *
 * Notification triggers:
 * - 2 analyses remaining (gentle reminder)
 * - 1 analysis remaining (urgent)
 * - 0 analyses remaining (upgrade required)
 */

import { useState, useEffect } from 'react';
import { X, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import './TrialCountdown.css';

export interface TrialStatus {
  tier: 'free' | 'starter' | 'pro' | 'elite';
  analysesUsed: number;
  analysesLimit: number;
  isTrialActive: boolean;
  daysRemainingInTrial?: number;
}

interface TrialCountdownProps {
  status: TrialStatus;
  onUpgrade: () => void;
  onDismiss?: () => void;
  position?: 'top' | 'bottom';
  showProgressBar?: boolean;
}

export const TrialCountdown: React.FC<TrialCountdownProps> = ({
  status,
  onUpgrade,
  onDismiss,
  position = 'top',
  showProgressBar = true
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const analysesRemaining = Math.max(0, status.analysesLimit - status.analysesUsed);
  const usagePercent = (status.analysesUsed / status.analysesLimit) * 100;

  // Only show for free tier users
  const shouldShow = status.tier === 'free' && status.isTrialActive;

  // Determine urgency level
  const getUrgencyLevel = (): 'info' | 'warning' | 'critical' => {
    if (analysesRemaining === 0) return 'critical';
    if (analysesRemaining === 1) return 'warning';
    return 'info';
  };

  const urgency = getUrgencyLevel();

  // Get message based on remaining analyses
  const getMessage = (): { title: string; subtitle: string } => {
    switch (analysesRemaining) {
      case 0:
        return {
          title: "You've used all your free analyses",
          subtitle: 'Upgrade now to continue analyzing properties'
        };
      case 1:
        return {
          title: '1 free analysis remaining',
          subtitle: 'Upgrade to unlock unlimited property analysis'
        };
      case 2:
        return {
          title: '2 free analyses left',
          subtitle: 'Make them count or upgrade for unlimited access'
        };
      default:
        return {
          title: `${analysesRemaining} free analyses remaining`,
          subtitle: 'Explore PropIQ risk-free'
        };
    }
  };

  const message = getMessage();

  // Check dismissal status from localStorage
  useEffect(() => {
    const dismissKey = `propiq_trial_dismissed_${status.analysesUsed}`;
    const wasDismissed = localStorage.getItem(dismissKey);
    setIsDismissed(wasDismissed === 'true');

    // Show notification with animation
    if (shouldShow && !wasDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [shouldShow, status.analysesUsed]);

  const handleDismiss = () => {
    setIsVisible(false);

    // Don't allow dismissing critical (0 remaining) notifications
    if (urgency !== 'critical') {
      const dismissKey = `propiq_trial_dismissed_${status.analysesUsed}`;
      localStorage.setItem(dismissKey, 'true');
      setIsDismissed(true);

      if (onDismiss) {
        onDismiss();
      }
    }

    // Track dismissal
    if (window.gtag) {
      window.gtag('event', 'trial_notification_dismiss', {
        event_category: 'conversion',
        analyses_remaining: analysesRemaining
      });
    }
  };

  const handleUpgrade = () => {
    // Track upgrade click
    if (window.gtag) {
      window.gtag('event', 'trial_notification_upgrade_click', {
        event_category: 'conversion',
        analyses_remaining: analysesRemaining,
        urgency
      });
    }

    onUpgrade();
  };

  // Don't render if dismissed or shouldn't show
  if (!shouldShow || (isDismissed && urgency !== 'critical')) {
    return null;
  }

  return (
    <div
      className={`trial-countdown trial-countdown-${position} trial-countdown-${urgency} ${isVisible ? 'trial-countdown-visible' : ''}`}
      role="alert"
      aria-live={urgency === 'critical' ? 'assertive' : 'polite'}
    >
      <div className="trial-countdown-content">
        {/* Icon */}
        <div className="trial-countdown-icon">
          {urgency === 'critical' ? (
            <AlertCircle className="h-6 w-6" />
          ) : urgency === 'warning' ? (
            <Zap className="h-6 w-6" />
          ) : (
            <TrendingUp className="h-6 w-6" />
          )}
        </div>

        {/* Message */}
        <div className="trial-countdown-message">
          <h4 className="trial-countdown-title">{message.title}</h4>
          <p className="trial-countdown-subtitle">{message.subtitle}</p>

          {/* Progress bar */}
          {showProgressBar && (
            <div className="trial-countdown-progress-container">
              <div
                className="trial-countdown-progress-bar"
                style={{ width: `${usagePercent}%` }}
                role="progressbar"
                aria-valuenow={status.analysesUsed}
                aria-valuemin={0}
                aria-valuemax={status.analysesLimit}
              />
            </div>
          )}

          {/* Usage stats */}
          <div className="trial-countdown-stats">
            <span className="trial-countdown-stat">
              <strong>{status.analysesUsed}</strong> used
            </span>
            <span className="trial-countdown-separator">•</span>
            <span className="trial-countdown-stat">
              <strong>{analysesRemaining}</strong> remaining
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="trial-countdown-actions">
          <button
            onClick={handleUpgrade}
            className="trial-countdown-upgrade-button"
          >
            {urgency === 'critical' ? 'Upgrade Now' : 'See Plans'}
          </button>

          {/* Only show dismiss for non-critical */}
          {urgency !== 'critical' && (
            <button
              onClick={handleDismiss}
              className="trial-countdown-dismiss-button"
              aria-label="Dismiss notification"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Compact version for sidebar/navbar
 */
export const TrialCountdownCompact: React.FC<{
  status: TrialStatus;
  onUpgrade: () => void;
}> = ({ status, onUpgrade }) => {
  const analysesRemaining = Math.max(0, status.analysesLimit - status.analysesUsed);
  const usagePercent = (status.analysesUsed / status.analysesLimit) * 100;

  // Only show for free tier
  if (status.tier !== 'free' || !status.isTrialActive) {
    return null;
  }

  const isUrgent = analysesRemaining <= 1;

  return (
    <button
      onClick={onUpgrade}
      className={`trial-compact ${isUrgent ? 'trial-compact-urgent' : ''}`}
    >
      <div className="trial-compact-content">
        <span className="trial-compact-label">Free Trial</span>
        <span className="trial-compact-count">
          {analysesRemaining} / {status.analysesLimit}
        </span>
      </div>
      <div className="trial-compact-progress">
        <div
          className="trial-compact-progress-fill"
          style={{ width: `${usagePercent}%` }}
        />
      </div>
    </button>
  );
};

/**
 * Hook to fetch trial status from API
 */
export const useTrialStatus = (userId?: string): TrialStatus | null => {
  const [status, setStatus] = useState<TrialStatus | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchStatus = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch(`/api/v1/users/${userId}/trial-status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('propiq_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch trial status:', error);
      }
    };

    fetchStatus();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return status;
};

/**
 * Mock trial status for testing
 */
export const mockTrialStatus = (analysesUsed: number): TrialStatus => ({
  tier: 'free',
  analysesUsed,
  analysesLimit: 3,
  isTrialActive: true
});
