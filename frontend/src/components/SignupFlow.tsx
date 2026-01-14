/**
 * Optimized Signup Flow Component
 * Sprint 9: User Onboarding & Growth
 *
 * Features:
 * - Simplified single-step form
 * - Real-time validation
 * - Password strength indicator
 * - Social proof elements
 * - Mobile-optimized
 */

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Check, X, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './SignupFlow.css';

interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

interface SignupFlowProps {
  onSuccess: (userData: any) => void;
  onSwitchToLogin: () => void;
  onClose: () => void;
}

export const SignupFlow: React.FC<SignupFlowProps> = ({
  onSuccess,
  onSwitchToLogin,
  onClose
}) => {
  const { signup: signupUser } = useAuth();  // Use the auth hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  // Email validation
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailError = emailTouched && email && !emailValid;

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: '' };

    let score = 0;

    // Length check
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;

    // Character variety
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 15;

    if (score < 40) return { score, label: 'Weak', color: 'text-red-400' };
    if (score < 70) return { score, label: 'Good', color: 'text-yellow-400' };
    return { score, label: 'Strong', color: 'text-green-400' };
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordValid = password.length >= 8;
  const showPasswordError = passwordTouched && password && !passwordValid;

  // Name validation
  const nameValid = firstName.trim().length > 0 && lastName.trim().length > 0;
  const showNameError = nameTouched && (!firstName.trim() || !lastName.trim());

  const canSubmit = emailValid && passwordValid && nameValid && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      setEmailTouched(true);
      setPasswordTouched(true);
      setNameTouched(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const signupData: SignupData = {
        email: email.toLowerCase().trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      };

      const result = await signupUser(signupData);  // Use the hook's signup method

      if (result.success) {
        // Track signup completion
        if (window.gtag) {
          window.gtag('event', 'signup_complete', {
            method: 'email'
          });
        }

        onSuccess(result);
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-flow">
      {/* Header with Value Proposition */}
      <div className="signup-header">
        <button onClick={onClose} className="close-button" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        <div className="signup-hero">
          <Sparkles className="h-8 w-8 text-violet-400 mb-3" />
          <h2 className="signup-title">Start Analyzing Properties in 30 Seconds</h2>
          <p className="signup-subtitle">
            Join 1,000+ investors using AI-powered analysis
          </p>
        </div>

        {/* Social Proof */}
        <div className="social-proof">
          <div className="social-proof-item">
            <Check className="h-4 w-4 text-green-400" />
            <span>3 free trial analyses</span>
          </div>
          <div className="social-proof-item">
            <Check className="h-4 w-4 text-green-400" />
            <span>No credit card required</span>
          </div>
          <div className="social-proof-item">
            <Check className="h-4 w-4 text-green-400" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="signup-form" noValidate>
        {/* Name Inputs */}
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            First Name
          </label>
          <div className="input-wrapper">
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder="John"
              className={`form-input ${showNameError && !firstName.trim() ? 'input-error' : ''}`}
              autoComplete="given-name"
              autoFocus
              required
            />
            {firstName.trim() && (
              <Check className="input-icon-right text-green-400" />
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Last Name
          </label>
          <div className="input-wrapper">
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder="Doe"
              className={`form-input ${showNameError && !lastName.trim() ? 'input-error' : ''}`}
              autoComplete="family-name"
              required
            />
            {lastName.trim() && (
              <Check className="input-icon-right text-green-400" />
            )}
          </div>
          {showNameError && (
            <p className="form-error">
              <X className="h-3 w-3" />
              Please enter your first and last name
            </p>
          )}
        </div>

        {/* Email Input */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@example.com"
              className={`form-input ${showEmailError ? 'input-error' : ''}`}
              autoComplete="email"
              required
            />
            {emailValid && email && (
              <Check className="input-icon-right text-green-400" />
            )}
          </div>
          {showEmailError && (
            <p className="form-error">
              <X className="h-3 w-3" />
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              placeholder="Create a strong password"
              className={`form-input ${showPasswordError ? 'input-error' : ''}`}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="input-icon-right-button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="password-strength">
              <div className="strength-bar-container">
                <div
                  className={`strength-bar strength-${passwordStrength.score < 40 ? 'weak' : passwordStrength.score < 70 ? 'medium' : 'strong'}`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
              <span className={`strength-label ${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
            </div>
          )}

          {showPasswordError && (
            <p className="form-error">
              <X className="h-3 w-3" />
              Password must be at least 8 characters
            </p>
          )}

          {/* Password Requirements */}
          <div className="password-requirements">
            <p className={password.length >= 8 ? 'requirement-met' : 'requirement-unmet'}>
              <Check className="h-3 w-3" />
              At least 8 characters
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="form-error-banner">
            <X className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="submit-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating your account...
            </>
          ) : (
            <>
              Start Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </button>

        {/* Terms */}
        <p className="terms-text">
          By signing up, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </p>

        {/* Switch to Login */}
        <div className="switch-mode">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="switch-button"
          >
            Sign in
          </button>
        </div>
      </form>

      {/* Trust Indicators */}
      <div className="trust-indicators">
        <div className="trust-item">
          <strong>50,000+</strong>
          <span>Properties Analyzed</span>
        </div>
        <div className="trust-item">
          <strong>1,000+</strong>
          <span>Happy Investors</span>
        </div>
        <div className="trust-item">
          <strong>4.9/5</strong>
          <span>User Rating</span>
        </div>
      </div>
    </div>
  );
};

// Import ArrowRight icon
import { ArrowRight } from 'lucide-react';
