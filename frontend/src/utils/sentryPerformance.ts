/**
 * Sentry Performance Monitoring Utilities
 * Uses modern Sentry v8+ APIs (startSpan instead of deprecated startTransaction)
 */

import * as Sentry from '@sentry/react';

/**
 * Track a synchronous operation's performance
 * @param name - Operation name (e.g., "property.analysis.calculate")
 * @param operation - Function to track
 * @param metadata - Optional metadata to attach
 */
export async function trackPerformance<T>(
  name: string,
  operation: () => Promise<T> | T,
  metadata?: Record<string, any>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name,
      op: 'function',
      attributes: metadata,
    },
    async () => {
      return await operation();
    }
  );
}

/**
 * Track PropIQ property analysis performance
 */
export async function trackPropertyAnalysis<T>(
  propertyAddress: string,
  analysisOperation: () => Promise<T>
): Promise<T> {
  return trackPerformance(
    'propiq.analysis',
    analysisOperation,
    {
      property: propertyAddress,
      feature: 'property_analysis',
    }
  );
}

/**
 * Track PDF export performance
 */
export async function trackPDFExport<T>(
  propertyAddress: string,
  exportOperation: () => Promise<T>
): Promise<T> {
  return trackPerformance(
    'propiq.pdf_export',
    exportOperation,
    {
      property: propertyAddress,
      feature: 'pdf_export',
    }
  );
}

/**
 * Track checkout/payment performance
 */
export async function trackCheckout<T>(
  tier: string,
  checkoutOperation: () => Promise<T>
): Promise<T> {
  return trackPerformance(
    'propiq.checkout',
    checkoutOperation,
    {
      subscription_tier: tier,
      feature: 'checkout',
    }
  );
}

/**
 * Track API call performance
 */
export async function trackAPICall<T>(
  endpoint: string,
  method: string,
  apiOperation: () => Promise<T>
): Promise<T> {
  return trackPerformance(
    `api.${method.toLowerCase()}.${endpoint}`,
    apiOperation,
    {
      endpoint,
      method,
      category: 'api',
    }
  );
}

/**
 * Manual span creation for complex operations with multiple steps
 *
 * Example:
 * ```typescript
 * const span = startSpan('complex.operation');
 * try {
 *   // Step 1
 *   const childSpan1 = span.startChild({ op: 'step1' });
 *   await doStep1();
 *   childSpan1.end();
 *
 *   // Step 2
 *   const childSpan2 = span.startChild({ op: 'step2' });
 *   await doStep2();
 *   childSpan2.end();
 * } finally {
 *   span.end();
 * }
 * ```
 */
export function startManualSpan(name: string, metadata?: Record<string, any>) {
  return Sentry.startInactiveSpan({
    name,
    op: 'manual',
    attributes: metadata,
  });
}

/**
 * Add breadcrumb for important user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, tier?: string) {
  Sentry.setUser({
    id: userId,
    email,
    subscription_tier: tier,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}
