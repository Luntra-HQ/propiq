import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

/**
 * VerifyEmail Page
 *
 * Handles email verification via token in URL query parameter
 * URL: /verify-email?token=<uuid>
 *
 * Flow:
 * 1. Extract token from URL
 * 2. Call POST /auth/verify-email with token
 * 3. Show success/error state
 * 4. Redirect to login on success
 */

type VerificationStatus = 'verifying' | 'success' | 'expired' | 'invalid' | 'already_verified' | 'error';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [email, setEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('invalid');
      setErrorMessage('No verification token provided');
      return;
    }

    // Call verification endpoint
    const verifyEmail = async () => {
      try {
        const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || 'https://mild-tern-361.convex.cloud';
        const API_URL = CONVEX_URL.replace('.convex.cloud', '.convex.site');

        const response = await fetch(`${API_URL}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          if (data.alreadyVerified) {
            setStatus('already_verified');
          } else {
            setStatus('success');
            setEmail(data.email || '');
          }
        } else {
          // Check error message for specific cases
          if (data.error?.includes('expired')) {
            setStatus('expired');
          } else if (data.error?.includes('Invalid')) {
            setStatus('invalid');
          } else {
            setStatus('error');
          }
          setErrorMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setErrorMessage('Failed to connect to server. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Email Verification</h1>
            <p className="text-violet-100">PropIQ Account Verification</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Verifying State */}
            {status === 'verifying' && (
              <div className="text-center">
                <Loader2 className="h-16 w-16 text-violet-600 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Verifying your email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Email Verified! 🎉
                </h2>
                <p className="text-gray-600 mb-6">
                  {email && (
                    <>
                      Your email <span className="font-semibold">{email}</span> has been successfully verified.
                    </>
                  )}
                  {!email && 'Your email has been successfully verified.'}
                </p>
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Continue to Login
                  </Link>
                  <Link
                    to="/"
                    className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}

            {/* Already Verified State */}
            {status === 'already_verified' && (
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Already Verified
                </h2>
                <p className="text-gray-600 mb-6">
                  This email address has already been verified. You can login to your account.
                </p>
                <Link
                  to="/login"
                  className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {/* Expired State */}
            {status === 'expired' && (
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Link Expired
                </h2>
                <p className="text-gray-600 mb-6">
                  This verification link has expired. Verification links are valid for 24 hours.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please request a new verification email from the login page.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Go to Login
                  </Link>
                  <Link
                    to="/"
                    className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}

            {/* Invalid Token State */}
            {status === 'invalid' && (
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Invalid Link
                </h2>
                <p className="text-gray-600 mb-6">
                  This verification link is invalid or has already been used.
                </p>
                {errorMessage && (
                  <p className="text-sm text-gray-500 mb-6">
                    {errorMessage}
                  </p>
                )}
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Go to Login
                  </Link>
                  <Link
                    to="/"
                    className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}

            {/* Generic Error State */}
            {status === 'error' && (
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  We couldn't verify your email address. Please try again or contact support.
                </p>
                {errorMessage && (
                  <p className="text-sm text-gray-500 mb-6">
                    Error: {errorMessage}
                  </p>
                )}
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Try Again
                  </button>
                  <Link
                    to="/login"
                    className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Need help?{' '}
              <a href="mailto:support@propiq.luntra.one" className="text-violet-600 hover:text-violet-700 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-violet-600 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-1">Email Verification Tips</p>
              <ul className="space-y-1 text-xs">
                <li>• Verification links expire after 24 hours</li>
                <li>• Check your spam folder if you don't see the email</li>
                <li>• Each link can only be used once</li>
                <li>• Request a new link from the login page if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
