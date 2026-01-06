/**
 * Production-safe Logger Utility for Frontend
 *
 * Replaces console.log with environment-aware logging:
 * - Development: Full verbose logging
 * - Production: Error logging only (via Sentry)
 */

import * as Sentry from '@sentry/react';

const IS_PRODUCTION = import.meta.env.PROD;
const IS_DEV = import.meta.env.DEV;

export const logger = {
  /**
   * Debug-level logging (development only)
   * Use for detailed troubleshooting information
   */
  debug: (...args: any[]) => {
    if (IS_DEV) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info-level logging (development only)
   * Use for general information
   */
  info: (...args: any[]) => {
    if (IS_DEV) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Warning-level logging (always logged)
   * Use for non-critical issues
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
    if (IS_PRODUCTION) {
      Sentry.captureMessage(String(args[0]), 'warning');
    }
  },

  /**
   * Error-level logging (always logged + Sentry)
   * Use for critical errors that need investigation
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    if (IS_PRODUCTION && args[0] instanceof Error) {
      Sentry.captureException(args[0]);
    } else if (IS_PRODUCTION) {
      Sentry.captureMessage(String(args[0]), 'error');
    }
  },

  /**
   * Auth-specific logging
   */
  auth: (...args: any[]) => {
    if (IS_DEV) {
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
    if (IS_DEV) {
      console.log('[ANALYSIS]', ...args);
    }
  },

  /**
   * Performance logging
   */
  perf: (label: string, duration: number) => {
    if (IS_DEV) {
      console.log(`[PERF] ${label}: ${duration}ms`);
    }
  },
};

export default logger;
