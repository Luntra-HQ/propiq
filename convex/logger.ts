/**
 * Production-safe Logger Utility for Convex
 *
 * Replaces console.log with environment-aware logging:
 * - Development: Full verbose logging
 * - Production: Error logging only (via Sentry)
 */

const IS_PRODUCTION = process.env.CONVEX_CLOUD_URL !== undefined;

export const logger = {
  /**
   * Debug-level logging (development only)
   * Use for detailed troubleshooting information
   */
  debug: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info-level logging (development only)
   * Use for general information
   */
  info: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Warning-level logging (always logged)
   * Use for non-critical issues
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error-level logging (always logged + Sentry)
   * Use for critical errors that need investigation
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    // TODO: Add Sentry integration here
    // Sentry.captureException(args[0]);
  },

  /**
   * Auth-specific logging
   */
  auth: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.log('[AUTH]', ...args);
    }
  },

  /**
   * Payment-specific logging (always logged for audit trail)
   */
  payment: (...args: any[]) => {
    console.log('[PAYMENT]', ...args);
  },

  /**
   * Analysis-specific logging
   */
  analysis: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.log('[ANALYSIS]', ...args);
    }
  },
};

export default logger;
