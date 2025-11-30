/**
 * Password Strength Indicator Component
 *
 * Shows visual feedback for password strength as user types
 */

import React from 'react';
import { Check, X } from 'lucide-react';
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  getPasswordStrengthWidth,
  type PasswordStrength,
} from '../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true,
}) => {
  // Don't show anything if password is empty
  if (!password) {
    return null;
  }

  const strength = validatePassword(password);

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Meter */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Password Strength:</span>
          <span
            className={`font-semibold ${
              strength.score >= 3 ? 'text-green-400' : 'text-orange-400'
            }`}
          >
            {getPasswordStrengthLabel(strength.score)}
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getPasswordStrengthColor(strength.score)} transition-all duration-300`}
            style={{ width: getPasswordStrengthWidth(strength.score) }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1 text-xs">
          <RequirementItem
            met={strength.checks.length}
            text="At least 12 characters"
          />
          <RequirementItem
            met={strength.checks.uppercase}
            text="One uppercase letter (A-Z)"
          />
          <RequirementItem
            met={strength.checks.lowercase}
            text="One lowercase letter (a-z)"
          />
          <RequirementItem
            met={strength.checks.number}
            text="One number (0-9)"
          />
          <RequirementItem
            met={strength.checks.special}
            text="One special character (!@#$%...)"
          />
          <RequirementItem
            met={strength.checks.notCommon}
            text="Not a common password"
          />
        </div>
      )}
    </div>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => (
  <div className="flex items-center gap-2">
    {met ? (
      <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
    ) : (
      <X className="h-4 w-4 text-gray-500 flex-shrink-0" />
    )}
    <span className={met ? 'text-green-400' : 'text-gray-500'}>{text}</span>
  </div>
);
