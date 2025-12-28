import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * Referral Landing Page - /r/[code]
 * Validates referral code, stores it in localStorage, and redirects to signup
 */
const ReferralLandingPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'validating' | 'valid' | 'invalid'>('validating');

  // Validate the referral code
  const validation = useQuery(
    api?.referrals?.validateReferralCode,
    code ? { code } : 'skip'
  );

  useEffect(() => {
    if (!code) {
      // No code provided, redirect to landing page
      navigate('/');
      return;
    }

    if (validation === undefined) {
      // Still loading
      return;
    }

    if (validation && validation.valid) {
      // Valid code! Store it and redirect to signup
      localStorage.setItem('referralCode', code);
      localStorage.setItem('referrerName', validation.referrerName || 'A PropIQ user');

      setStatus('valid');

      // Redirect after brief success message
      setTimeout(() => {
        navigate('/signup');
      }, 1500);
    } else {
      // Invalid code
      setStatus('invalid');

      // Redirect to landing page after error message
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [code, validation, navigate]);

  if (status === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900/20 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-violet-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Validating Referral Code...
          </h2>
          <p className="text-gray-400">
            Please wait while we verify your code
          </p>
        </div>
      </div>
    );
  }

  if (status === 'valid') {
    const referrerName = validation?.referrerName || 'A PropIQ user';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900/20 to-slate-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to PropIQ!
          </h2>
          <p className="text-xl text-gray-300 mb-2">
            You were referred by <span className="text-violet-400 font-semibold">{referrerName}</span>
          </p>
          <p className="text-gray-400 mb-6">
            Creating your account now...
          </p>
          <div className="flex items-center justify-center gap-2 text-violet-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Redirecting to signup...</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900/20 to-slate-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Invalid Referral Code
          </h2>
          <p className="text-xl text-gray-300 mb-2">
            The code <span className="font-mono text-violet-400">{code}</span> is not valid
          </p>
          <p className="text-gray-400 mb-6">
            Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ReferralLandingPage;
