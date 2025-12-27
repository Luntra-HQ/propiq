import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, Loader2, Lock } from 'lucide-react';
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  getPasswordStrengthWidth,
} from '../utils/passwordValidation';

interface ChangePasswordFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSubmit }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordStrength = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const canSubmit =
    currentPassword.length > 0 &&
    passwordStrength.isValid &&
    passwordsMatch &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmit(currentPassword, newPassword);

      // Success - clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Password */}
      <div>
        <label htmlFor="current-password" className="block text-sm font-medium text-gray-300 mb-2">
          Current Password *
        </label>
        <div className="relative">
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all disabled:opacity-50 pr-12"
            placeholder="Enter your current password"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-2">
          New Password *
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all disabled:opacity-50 pr-12"
            placeholder="Enter a strong password"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Password Strength Meter */}
        {newPassword.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Password Strength:</span>
              <span className={`text-xs font-medium ${
                passwordStrength.score === 4 ? 'text-green-400' :
                passwordStrength.score === 3 ? 'text-blue-400' :
                passwordStrength.score === 2 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {getPasswordStrengthLabel(passwordStrength.score)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                style={{ width: getPasswordStrengthWidth(passwordStrength.score) }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{passwordStrength.feedback}</p>
          </div>
        )}

        {/* Requirements Checklist */}
        {newPassword.length > 0 && (
          <div className="mt-3 space-y-1">
            <RequirementItem
              met={passwordStrength.checks.length}
              label="At least 12 characters"
            />
            <RequirementItem
              met={passwordStrength.checks.uppercase}
              label="One uppercase letter (A-Z)"
            />
            <RequirementItem
              met={passwordStrength.checks.lowercase}
              label="One lowercase letter (a-z)"
            />
            <RequirementItem
              met={passwordStrength.checks.number}
              label="One number (0-9)"
            />
            <RequirementItem
              met={passwordStrength.checks.special}
              label="One special character (!@#$%...)"
            />
            <RequirementItem
              met={passwordStrength.checks.notCommon}
              label="Not a common password"
            />
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm New Password *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all disabled:opacity-50 pr-12"
            placeholder="Confirm your new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Password Match Indicator */}
        {confirmPassword.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            {passwordsMatch ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-emerald-400">Passwords match</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-red-400" />
                <span className="text-xs text-red-400">Passwords don't match</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-300">Password changed successfully!</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Changing Password...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            Change Password
          </>
        )}
      </button>
    </form>
  );
};

// Requirement Item Component
const RequirementItem: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
  <div className="flex items-center gap-2">
    {met ? (
      <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
    ) : (
      <X className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
    )}
    <span className={`text-xs ${met ? 'text-emerald-400' : 'text-gray-500'}`}>
      {label}
    </span>
  </div>
);

export default ChangePasswordForm;
