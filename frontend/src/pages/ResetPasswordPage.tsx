/**
 * Reset Password Page
 *
 * Two-step password reset flow:
 * 1. Request Reset: User enters email, receives reset link via email
 * 2. Reset Password: User clicks link with token, enters new password
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { validatePassword } from '../utils/passwordValidation';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Clock,
} from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Mode: 'request' (enter email) or 'reset' (enter new password with token)
  const mode = token ? 'reset' : 'request';

  // Request reset state
  const [email, setEmail] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Shared state
  const [error, setError] = useState<string | null>(null);

  // Verify token validity if in reset mode
  const tokenVerification = useQuery(
    api.auth.verifyResetToken,
    token ? { token } : 'skip'
  );

  useEffect(() => {
    if (mode === 'reset' && tokenVerification) {
      if (!tokenVerification.valid) {
        setError(tokenVerification.error || 'Invalid or expired reset token');
      }
    }
  }, [mode, tokenVerification]);

  // Request password reset (send email)
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRequestLoading(true);

    try {
      const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
      const baseUrl = convexUrl.replace('/api', '');
      const endpoint = `${baseUrl}/auth/request-password-reset`;

      console.log('[Reset Password] Requesting password reset for:', email);
      console.log('[Reset Password] Endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      console.log('[Reset Password] Response status:', response.status);
      const data = await response.json();
      console.log('[Reset Password] Response data:', data);

      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'Failed to send reset email';
        console.error('[Reset Password] Error:', errorMsg);
        setError(errorMsg);
      } else {
        console.log('[Reset Password] Success! Check your email.');
        setRequestSuccess(true);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred';
      console.error('[Reset Password] Exception:', err);
      setError(errorMsg);
    } finally {
      setRequestLoading(false);
    }
  };

  // Reset password with token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('[Reset Password] Starting password reset with token');

    // Validate password match
    if (newPassword !== confirmPassword) {
      const errorMsg = 'Passwords do not match';
      console.error('[Reset Password] Validation error:', errorMsg);
      setError(errorMsg);
      return;
    }

    // Validate password strength
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      console.error('[Reset Password] Password strength validation failed:', passwordCheck.feedback);
      setError(passwordCheck.feedback);
      return;
    }

    setResetLoading(true);

    try {
      const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
      const baseUrl = convexUrl.replace('/api', '');
      const endpoint = `${baseUrl}/auth/reset-password`;

      console.log('[Reset Password] Endpoint:', endpoint);
      console.log('[Reset Password] Token length:', token?.length);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      console.log('[Reset Password] Response status:', response.status);
      const data = await response.json();
      console.log('[Reset Password] Response data:', data);

      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'Failed to reset password';
        console.error('[Reset Password] Error:', errorMsg);
        setError(errorMsg);
      } else {
        console.log('[Reset Password] Success! Redirecting to login...');
        setResetSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred';
      console.error('[Reset Password] Exception:', err);
      setError(errorMsg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back to login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-white">PropIQ</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {mode === 'request' ? 'Reset Password' : 'Create New Password'}
          </h1>
          <p className="text-gray-400 text-center mb-6">
            {mode === 'request'
              ? "Enter your email and we'll send you a reset link"
              : 'Enter your new password below'}
          </p>

          {/* Error/Success */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {requestSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-semibold">Check your email!</span>
              </div>
              <p className="text-sm text-gray-400 ml-6">
                If an account exists with that email, we've sent a password reset link.
                The link will expire in 15 minutes.
              </p>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">
                Password reset successful! Redirecting to login...
              </span>
            </div>
          )}

          {/* Token expiration warning */}
          {mode === 'reset' && tokenVerification?.valid && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-yellow-400">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">
                This link expires in{' '}
                {Math.max(
                  0,
                  Math.floor(((tokenVerification.expiresAt ?? Date.now()) - Date.now()) / 60000)
                )}{' '}
                minutes
              </span>
            </div>
          )}

          {/* Request Reset Form */}
          {mode === 'request' && !requestSuccess && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg py-3 font-semibold text-white flex items-center justify-center gap-2 transition"
              >
                {requestLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && tokenVerification?.valid && !resetSuccess && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="text"
                  value={tokenVerification.email}
                  disabled
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <PasswordStrengthIndicator password={newPassword} />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg py-3 font-semibold text-white flex items-center justify-center gap-2 transition"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Back to login link */}
          {!resetSuccess && (
            <p className="mt-6 text-center text-gray-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Log in
              </Link>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Need help? Contact support@propiq.com
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
