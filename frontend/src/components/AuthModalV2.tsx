/**
 * AuthModal V2 - ShadCN Migration
 *
 * Migrated authentication modal using:
 * - ShadCN Dialog for modal structure (better accessibility)
 * - FormInput for all form fields (glass styled)
 * - PropIQ Button for submit actions (brand consistency)
 * - Improved error handling and validation
 *
 * SECURITY: Uses HTTP endpoints that set httpOnly cookies
 * - Session token never exposed to JavaScript
 * - Works in private browsing
 * - Sessions can be revoked server-side
 */

import { useState } from 'react';
import { Mail, Lock, User, Building, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuthModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModalV2 = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'signup'
}: AuthModalV2Props) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use auth hook with server-side sessions
  const { login, signup } = useAuth();

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');

  // Form validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setCompany('');
    setError(null);
    setSuccess(null);
    setEmailError('');
    setPasswordError('');
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (mode === 'signup' && password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    if (!validateForm()) {
      return;
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
          setSuccess('Account created successfully! Redirecting...');
          setTimeout(() => {
            onSuccess();
            resetForm();
            onClose();
          }, 1500);
        } else {
          setError(result.error || 'Signup failed. Please try again.');
        }
      } else {
        const result = await login(email.trim(), password);

        if (result.success) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            onSuccess();
            resetForm();
            onClose();
          }, 1500);
        } else {
          setError(result.error || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
          bg-gradient-to-br from-glass-medium to-surface-200
          backdrop-blur-glass
          border-glass-border
          shadow-glow
          max-w-md
        "
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-50">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'signup'
              ? 'Start analyzing properties with AI-powered insights'
              : 'Continue your property analysis journey'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-500/50 rounded-xl backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-xl backdrop-blur-sm animate-scale-in">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-200">{success}</p>
            </div>
          )}

          {/* Signup Fields */}
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  id="firstName"
                  label="First Name"
                  type="text"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="John"
                  disabled={loading}
                  inputClassName="pl-10"
                />
                <FormInput
                  id="lastName"
                  label="Last Name"
                  type="text"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="Doe"
                  disabled={loading}
                  inputClassName="pl-10"
                />
              </div>

              <FormInput
                id="company"
                label="Company"
                type="text"
                value={company}
                onChange={setCompany}
                placeholder="Your Company (Optional)"
                disabled={loading}
                inputClassName="pl-10"
                helpText="Optional - for business accounts"
              />
            </>
          )}

          {/* Email */}
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
            disabled={loading}
            error={emailError}
            inputClassName="pl-10"
          />

          {/* Password */}
          <FormInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
            disabled={loading}
            error={passwordError}
            helpText={mode === 'signup' ? 'Must be at least 8 characters' : undefined}
            inputClassName="pl-10"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            loadingText={mode === 'signup' ? 'Creating account...' : 'Logging in...'}
            disabled={loading}
            icon={loading ? undefined : mode === 'signup' ? <User className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          >
            {mode === 'signup' ? 'Create Account' : 'Log In'}
          </Button>

          {/* Mode Switch */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={switchMode}
              disabled={loading}
              className="text-sm text-gray-400 hover:text-violet-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'signup' ? (
                <>
                  Already have an account? <span className="font-semibold">Log in</span>
                </>
              ) : (
                <>
                  Don't have an account? <span className="font-semibold">Sign up</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModalV2;
