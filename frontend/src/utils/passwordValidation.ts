/**
 * Password Validation Utilities
 *
 * OWASP Password Requirements:
 * - Minimum 8 characters (we use 12 for better security)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - No common passwords
 */

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4; // 0=very weak, 1=weak, 2=fair, 3=good, 4=strong
  feedback: string;
  isValid: boolean;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
    notCommon: boolean;
  };
}

// Common weak passwords to reject
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
  'football', 'welcome', 'jesus', 'ninja', 'mustang', 'password1',
];

/**
 * Validate password strength
 * Returns score, feedback, and individual requirement checks
 */
export function validatePassword(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
  };

  // Count how many checks passed
  const passedChecks = Object.values(checks).filter(Boolean).length;

  // Determine score (0-4)
  let score: 0 | 1 | 2 | 3 | 4;
  if (passedChecks <= 2) {
    score = 0; // Very weak
  } else if (passedChecks === 3) {
    score = 1; // Weak
  } else if (passedChecks === 4) {
    score = 2; // Fair
  } else if (passedChecks === 5) {
    score = 3; // Good
  } else {
    score = 4; // Strong
  }

  // All checks must pass for valid password
  const isValid = Object.values(checks).every(Boolean);

  // Generate feedback
  let feedback = '';
  if (!checks.length) {
    feedback = 'Password must be at least 12 characters long';
  } else if (!checks.uppercase) {
    feedback = 'Password must contain at least one uppercase letter';
  } else if (!checks.lowercase) {
    feedback = 'Password must contain at least one lowercase letter';
  } else if (!checks.number) {
    feedback = 'Password must contain at least one number';
  } else if (!checks.special) {
    feedback = 'Password must contain at least one special character (!@#$%^&*...)';
  } else if (!checks.notCommon) {
    feedback = 'This password is too common. Please choose a stronger password';
  } else {
    feedback = 'Password is strong!';
  }

  return {
    score,
    feedback,
    isValid,
    checks,
  };
}

/**
 * Get color for password strength indicator
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
      return 'bg-red-500'; // Very weak
    case 1:
      return 'bg-orange-500'; // Weak
    case 2:
      return 'bg-yellow-500'; // Fair
    case 3:
      return 'bg-blue-500'; // Good
    case 4:
      return 'bg-green-500'; // Strong
    default:
      return 'bg-gray-400';
  }
}

/**
 * Get text label for password strength
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return '';
  }
}

/**
 * Get width percentage for strength meter
 */
export function getPasswordStrengthWidth(score: number): string {
  switch (score) {
    case 0:
      return '20%';
    case 1:
      return '40%';
    case 2:
      return '60%';
    case 3:
      return '80%';
    case 4:
      return '100%';
    default:
      return '0%';
  }
}
