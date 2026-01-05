/**
 * Login Page
 *
 * Standalone login/signup page for unauthenticated users.
 * Redirects to /app after successful authentication.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validatePassword } from '../utils/passwordValidation';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';
import {
  Mail,
  Lock,
  User,
  Building,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

const LoginPage: React.FC = () => {
  // DELIBERATE BREAKING CHANGE TO TEST ENFORCEMENT
  THIS_WILL_BREAK_COMPILATION = true;

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');

  // Where to redirect after login
  const from = (location.state as any)?.from?.pathname || '/app';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setCompany('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate password strength for signup
    if (mode === 'signup') {
      const passwordCheck = validatePassword(password);
      if (!passwordCheck.isValid) {
        setError(passwordCheck.feedback);
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const result = await signup({
          email: email.trim(),
          password,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          company: company.trim() || undefined,
        });

        if (result.success) {
          setSuccess('Account created! Redirecting...');
          setTimeout(() => navigate(from, { replace: true }), 1000);
        } else {
          setError(result.error || 'Signup failed');
        }
      } else {
        const result = await login(email.trim(), password);

        if (result.success) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => navigate(from, { replace: true }), 1000);
        } else {
          setError(result.error || 'Login failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
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
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400 text-center mb-6">
            {mode === 'signup'
              ? 'Start with 3 free property analyses'
              : 'Log in to your account'}
          </p>

          {/* Error/Success */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="email-input"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="password-input"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {/* Password Strength Indicator (signup only) */}
              {mode === 'signup' && <PasswordStrengthIndicator password={password} />}

              {/* Forgot Password Link (login only) */}
              {mode === 'login' && (
                <div className="mt-2 text-right">
                  <Link
                    to="/reset-password"
                    className="text-sm text-violet-400 hover:text-violet-300 transition"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Company (optional)</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                    placeholder="ACME Properties"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid={mode === 'signup' ? 'signup-submit-button' : 'login-submit-button'}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg py-3 font-semibold text-white flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === 'signup' ? 'Creating Account...' : 'Logging In...'}
                </>
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Mode toggle */}
          <p className="mt-6 text-center text-gray-400">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    resetForm();
                  }}
                  className="text-violet-400 hover:text-violet-300 font-medium"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    resetForm();
                  }}
                  className="text-violet-400 hover:text-violet-300 font-medium"
                >
                  Sign up free
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
