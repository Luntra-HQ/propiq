/**
 * Sentry Error Monitoring Configuration - Frontend
 * Sprint 12 - Production Readiness
 *
 * Tracks errors, performance, and user feedback for PropIQ frontend.
 */
import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE || "production";
const RELEASE = import.meta.env.VITE_RELEASE_VERSION || "propiq-frontend@1.0.0";

/**
 * Initialize Sentry SDK for error tracking
 *
 * Features enabled:
 * - Error tracking
 * - Performance monitoring
 * - React component tracking
 * - User feedback
 * - Session replay (optional)
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE,

    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        // Trace all requests
        tracePropagationTargets: [
          "localhost",
          "propiq.luntra.one",
          "luntra-outreach-app.azurewebsites.net",
        ],
      }),
      new Sentry.Replay({
        // Session replay configuration
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block all media
      }),
    ],

    // Performance monitoring
    tracesSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || "1.0"
    ),

    // Session replay sample rate
    // Only record sessions with errors
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Send PII (Personally Identifiable Information)
    // Set to false for GDPR/CCPA compliance
    sendDefaultPii: false,

    // Ignore common noisy errors
    beforeSend(event, hint) {
      // Filter out extension errors (browser extensions)
      if (
        event.exception?.values?.[0]?.value?.includes("Extension") ||
        event.exception?.values?.[0]?.value?.includes("chrome-extension")
      ) {
        return null;
      }

      // Filter out network errors that are expected
      if (
        event.exception?.values?.[0]?.value?.includes("Failed to fetch") ||
        event.exception?.values?.[0]?.value?.includes("NetworkError")
      ) {
        // Still log but with lower priority
        event.level = "warning";
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      "chrome-extension://",
      "moz-extension://",
      // Network errors
      "Network request failed",
      "Failed to fetch",
      // ResizeObserver errors (harmless)
      "ResizeObserver loop",
    ],
  });

  console.log(`Sentry initialized for ${ENVIRONMENT} environment`);
}

/**
 * Set user context for Sentry events
 */
export function setUserContext(
  userId: string,
  email?: string,
  subscriptionTier?: string
) {
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: userId,
    email: email,
    subscription_tier: subscriptionTier,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  if (!SENTRY_DSN) return;

  Sentry.setUser(null);
}

/**
 * Set a tag for filtering Sentry events
 */
export function setTag(key: string, value: string) {
  if (!SENTRY_DSN) return;

  Sentry.setTag(key, value);
}

/**
 * Add a breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string = "default",
  level: Sentry.SeverityLevel = "info",
  data?: Record<string, any>
) {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a message manually
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info"
) {
  if (!SENTRY_DSN) return;

  Sentry.captureMessage(message, level);
}

/**
 * Show user feedback dialog
 */
export function showFeedbackDialog() {
  if (!SENTRY_DSN) return;

  const eventId = Sentry.lastEventId();
  if (eventId) {
    Sentry.showReportDialog({ eventId });
  }
}

// Export Sentry for direct use if needed
export { Sentry };
