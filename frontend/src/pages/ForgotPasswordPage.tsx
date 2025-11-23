/**
 * Forgot Password Page
 *
 * Allows users to request a password reset email.
 * Shows success message regardless of whether email exists (prevents enumeration).
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL?.replace('.cloud', '.site') || '';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${CONVEX_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setError(data.error || 'Too many requests. Please try again later.');
        return;
      }

      // Always show success (prevents email enumeration)
      setSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Unable to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
            {/* Success icon */}
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">
              Check your email
            </h1>

            <p className="text-gray-400 mb-6">
              If an account exists with <span className="text-white font-medium">{email}</span>,
              you will receive a password reset link shortly.
            </p>

            <p className="text-gray-500 text-sm mb-8">
              The link will expire in 1 hour. If you don't see the email, check your spam folder.
            </p>

            <div className="space-y-3">
              <Link
                to="/auth"
                className="block w-full bg-violet-600 hover:bg-violet-700 rounded-lg py-3 font-semibold text-white transition"
              >
                Back to login
              </Link>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="block w-full text-gray-400 hover:text-white py-2 transition"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Request form
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back to login */}
        <Link
          to="/auth"
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
            Forgot your password?
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Enter your email and we'll send you a reset link
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg py-3 font-semibold text-white flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          {/* Back to login */}
          <p className="mt-6 text-center text-gray-400">
            Remember your password?{' '}
            <Link
              to="/auth"
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
