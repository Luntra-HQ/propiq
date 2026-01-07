import { useState } from 'react';
import { Mail, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

/**
 * ResendVerification Component
 *
 * Allows users to resend verification email
 * Features:
 * - Rate limiting UI (shows countdown if rate limited)
 * - Success/error states
 * - Non-blocking (doesn't reveal if email exists)
 *
 * Props:
 * - email: User's email address
 * - className: Optional CSS classes
 */

interface ResendVerificationProps {
  email: string;
  className?: string;
}

type ResendStatus = 'idle' | 'sending' | 'sent' | 'error' | 'rate_limited';

export function ResendVerification({ email, className = '' }: ResendVerificationProps) {
  const [status, setStatus] = useState<ResendStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);

  const handleResend = async () => {
    if (status === 'sending' || status === 'rate_limited') {
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || 'https://mild-tern-361.convex.cloud';
      const API_URL = CONVEX_URL.replace('.convex.cloud', '.convex.site');

      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('sent');
        setMessage(
          data.message || 'Verification email sent! Please check your inbox and spam folder.'
        );

        // Reset to idle after 10 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 10000);
      } else {
        // Check if rate limited
        if (data.error?.includes('Too many') || data.error?.includes('wait')) {
          setStatus('rate_limited');
          setMessage(data.error);

          // Start 60-second countdown
          setCountdown(60);
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setStatus('idle');
                setMessage('');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to send verification email. Please try again.');

          // Reset to idle after 5 seconds
          setTimeout(() => {
            setStatus('idle');
            setMessage('');
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <div className={`resend-verification ${className}`}>
      {/* Idle State - Show Button */}
      {status === 'idle' && (
        <button
          onClick={handleResend}
          className="inline-flex items-center space-x-2 text-violet-600 hover:text-violet-700 font-medium text-sm transition-colors"
        >
          <Mail className="h-4 w-4" />
          <span>Resend verification email</span>
        </button>
      )}

      {/* Sending State */}
      {status === 'sending' && (
        <div className="inline-flex items-center space-x-2 text-gray-600 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Sending email...</span>
        </div>
      )}

      {/* Success State */}
      {status === 'sent' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Email Sent!</p>
              <p className="text-xs text-green-700 mt-1">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Failed to Send</p>
              <p className="text-xs text-red-700 mt-1">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rate Limited State */}
      {status === 'rate_limited' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Too Many Requests</p>
              <p className="text-xs text-yellow-700 mt-1">{message}</p>
              {countdown > 0 && (
                <p className="text-xs text-yellow-600 mt-2 font-medium">
                  Try again in {countdown} seconds
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ResendVerificationBanner Component
 *
 * Full-width banner for unverified users
 * Shows on dashboard/main pages
 */

interface ResendVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

export function ResendVerificationBanner({ email, onDismiss }: ResendVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">
                Please verify your email address
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                We sent a verification email to <span className="font-semibold">{email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ResendVerification email={email} />
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
