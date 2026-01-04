/**
 * Error Codes for PropIQ
 *
 * Provides standardized error codes and safe messages for client responses
 * Prevents information disclosure while maintaining debuggability
 *
 * **Security Principle:** Never expose:
 * - Whether a user/email exists
 * - Internal system details
 * - Stack traces
 * - Database schema
 * - Third-party error details (Stripe, etc.)
 *
 * **Usage:**
 * ```typescript
 * import { ErrorCodes, createError } from './errorCodes';
 *
 * // In mutations/queries:
 * throw createError(ErrorCodes.AUTH_INVALID_CREDENTIALS);
 * ```
 */

export interface ErrorCode {
  code: string;
  message: string;
  httpStatus?: number;
}

/**
 * Standardized error codes
 * Code format: <DOMAIN><NUMBER>
 * - AUTH001-099: Authentication errors
 * - PAY001-099: Payment errors
 * - PROP001-099: Property analysis errors
 * - SYS001-099: System/general errors
 */
export const ErrorCodes = {
  // ============================================
  // Authentication Errors (AUTH001-099)
  // ============================================

  /**
   * Generic login failure
   * Used for both incorrect email AND incorrect password
   * Prevents email enumeration
   */
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH001',
    message: 'Invalid email or password. Please check your credentials and try again.',
    httpStatus: 401,
  },

  /**
   * Generic account creation failure
   * Used when email already exists
   * Prevents email enumeration
   */
  AUTH_ACCOUNT_EXISTS: {
    code: 'AUTH002',
    message: 'Unable to create account with this email. Please try logging in or use a different email.',
    httpStatus: 400,
  },

  /**
   * Session expired or invalid
   */
  AUTH_SESSION_INVALID: {
    code: 'AUTH003',
    message: 'Your session has expired. Please log in again.',
    httpStatus: 401,
  },

  /**
   * Password reset token invalid or expired
   */
  AUTH_RESET_TOKEN_INVALID: {
    code: 'AUTH004',
    message: 'This password reset link is invalid or has expired. Please request a new one.',
    httpStatus: 400,
  },

  /**
   * Password validation failed
   * Frontend should show detailed requirements via PasswordStrengthIndicator
   */
  AUTH_WEAK_PASSWORD: {
    code: 'AUTH005',
    message: 'Password does not meet security requirements.',
    httpStatus: 400,
  },

  /**
   * Generic email sending failure
   * Doesn't reveal whether email exists
   */
  AUTH_EMAIL_FAILED: {
    code: 'AUTH006',
    message: 'Unable to send email. Please try again later or contact support.',
    httpStatus: 500,
  },

  // ============================================
  // Payment Errors (PAY001-099)
  // ============================================

  /**
   * Generic payment failure
   * Doesn't expose Stripe error details
   */
  PAY_CHECKOUT_FAILED: {
    code: 'PAY001',
    message: 'Unable to process payment. Please check your payment method and try again.',
    httpStatus: 400,
  },

  /**
   * Subscription not found
   */
  PAY_SUBSCRIPTION_NOT_FOUND: {
    code: 'PAY002',
    message: 'Subscription not found. Please contact support.',
    httpStatus: 404,
  },

  /**
   * Cannot cancel subscription
   */
  PAY_CANCEL_FAILED: {
    code: 'PAY003',
    message: 'Unable to cancel subscription. Please contact support.',
    httpStatus: 500,
  },

  /**
   * Webhook validation failed
   */
  PAY_WEBHOOK_INVALID: {
    code: 'PAY004',
    message: 'Invalid webhook signature.',
    httpStatus: 401,
  },

  // ============================================
  // Property Analysis Errors (PROP001-099)
  // ============================================

  /**
   * Analysis limit reached
   */
  PROP_LIMIT_REACHED: {
    code: 'PROP001',
    message: 'You have reached your analysis limit. Please upgrade to continue.',
    httpStatus: 403,
  },

  /**
   * Invalid address or data
   */
  PROP_INVALID_DATA: {
    code: 'PROP002',
    message: 'Invalid property data provided. Please check your inputs and try again.',
    httpStatus: 400,
  },

  /**
   * AI service unavailable
   */
  PROP_AI_UNAVAILABLE: {
    code: 'PROP003',
    message: 'Analysis service temporarily unavailable. Please try again in a few moments.',
    httpStatus: 503,
  },

  /**
   * Property not found
   */
  PROP_NOT_FOUND: {
    code: 'PROP004',
    message: 'Property analysis not found.',
    httpStatus: 404,
  },

  // ============================================
  // System Errors (SYS001-099)
  // ============================================

  /**
   * Generic internal server error
   * Default for all unexpected errors
   */
  SYS_INTERNAL_ERROR: {
    code: 'SYS001',
    message: 'An unexpected error occurred. Please try again later.',
    httpStatus: 500,
  },

  /**
   * Database operation failed
   */
  SYS_DATABASE_ERROR: {
    code: 'SYS002',
    message: 'Database error occurred. Please try again.',
    httpStatus: 500,
  },

  /**
   * Rate limit exceeded
   */
  SYS_RATE_LIMIT: {
    code: 'SYS003',
    message: 'Too many requests. Please try again later.',
    httpStatus: 429,
  },

  /**
   * Invalid request data
   */
  SYS_INVALID_REQUEST: {
    code: 'SYS004',
    message: 'Invalid request data provided.',
    httpStatus: 400,
  },

  /**
   * Resource not found
   */
  SYS_NOT_FOUND: {
    code: 'SYS005',
    message: 'Requested resource not found.',
    httpStatus: 404,
  },

  /**
   * Permission denied
   */
  SYS_FORBIDDEN: {
    code: 'SYS006',
    message: 'You do not have permission to perform this action.',
    httpStatus: 403,
  },
} as const;

/**
 * Create a safe error to throw to clients
 * Includes error code and sanitized message
 *
 * @param errorCode - Error code from ErrorCodes
 * @param debugInfo - Optional server-side debug info (logged, not sent to client)
 */
export function createError(errorCode: ErrorCode, debugInfo?: unknown): Error {
  // Log debug info server-side (never sent to client)
  if (debugInfo) {
    console.error(`[ERROR] ${errorCode.code}:`, debugInfo);
  }

  // Return error with code and safe message
  const error = new Error(errorCode.message);
  (error as any).code = errorCode.code;
  (error as any).httpStatus = errorCode.httpStatus;

  return error;
}

/**
 * Sanitize an unknown error for client response
 * Prevents stack traces and internal details from leaking
 *
 * @param error - Raw error from try-catch
 * @param fallbackCode - Error code to use if error is unknown
 */
export function sanitizeError(error: unknown, fallbackCode = ErrorCodes.SYS_INTERNAL_ERROR): ErrorCode {
  // Log full error server-side for debugging
  console.error('[ERROR] Sanitizing error:', error);

  // Check if error has our error code
  if (error instanceof Error && (error as any).code) {
    const code = (error as any).code;
    // Find matching error code
    const errorCode = Object.values(ErrorCodes).find(ec => ec.code === code);
    if (errorCode) {
      return errorCode;
    }
  }

  // Return generic error
  return fallbackCode;
}

/**
 * Format error for client response
 * Returns only safe information
 *
 * @param error - Error to format
 */
export function formatErrorResponse(error: unknown): {
  success: false;
  error: string;
  errorCode: string;
  httpStatus: number;
} {
  const sanitized = sanitizeError(error);

  return {
    success: false,
    error: sanitized.message,
    errorCode: sanitized.code,
    httpStatus: sanitized.httpStatus || 500,
  };
}
