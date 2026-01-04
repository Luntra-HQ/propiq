/**
 * Convex Test Helpers
 *
 * Centralized configuration and utilities for testing Convex HTTP endpoints.
 * Updated to support Convex architecture (migrated from FastAPI on Dec 30, 2025).
 */

import { APIRequestContext } from '@playwright/test';

/**
 * Get Convex HTTP URL from environment or use default
 * Converts .convex.cloud to .convex.site for HTTP endpoints
 */
export function getConvexHttpUrl(): string {
  // Priority 1: Direct HTTP URL env var
  if (process.env.PLAYWRIGHT_CONVEX_HTTP_URL) {
    return process.env.PLAYWRIGHT_CONVEX_HTTP_URL;
  }

  // Priority 2: Convert VITE_CONVEX_URL (.convex.cloud → .convex.site)
  if (process.env.VITE_CONVEX_URL) {
    return process.env.VITE_CONVEX_URL.replace('.convex.cloud', '.convex.site');
  }

  // Priority 3: Default to PropIQ's Convex deployment
  return 'https://mild-tern-361.convex.site';
}

/**
 * Convex HTTP base URL for all endpoints
 * Lazy evaluation to avoid execution at module import
 */
function getConvexBaseUrl(): string {
  return getConvexHttpUrl();
}

/**
 * Authentication endpoints
 * Note: These are getter functions to avoid module-level code execution
 */
export const AUTH_ENDPOINTS = {
  get signup() { return `${getConvexBaseUrl()}/auth/signup`; },
  get login() { return `${getConvexBaseUrl()}/auth/login`; },
  get me() { return `${getConvexBaseUrl()}/auth/me`; },
  get logout() { return `${getConvexBaseUrl()}/auth/logout`; },
  get logoutEverywhere() { return `${getConvexBaseUrl()}/auth/logout-everywhere`; },
  get refresh() { return `${getConvexBaseUrl()}/auth/refresh`; },
};

/**
 * Payment/Stripe endpoints (to be verified)
 */
export const PAYMENT_ENDPOINTS = {
  get createCheckout() { return `${getConvexBaseUrl()}/stripe/create-checkout`; },
  get webhook() { return `${getConvexBaseUrl()}/stripe/webhook`; },
  get cancelSubscription() { return `${getConvexBaseUrl()}/stripe/cancel`; },
  get billingPortal() { return `${getConvexBaseUrl()}/stripe/billing-portal`; },
};

/**
 * User type matching Convex schema
 */
export interface ConvexUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  subscriptionTier: string;
  analysesUsed: number;
  analysesLimit: number;
  active: boolean;
  emailVerified: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

/**
 * Signup response from Convex
 * Note: Convex /auth/signup returns same format as /auth/login
 * (includes sessionToken and user object)
 */
export interface SignupResponse {
  success: boolean;
  user: ConvexUser;
  sessionToken: string;
  expiresAt: number;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response from Convex
 */
export interface LoginResponse {
  success: boolean;
  sessionToken: string;
  user: ConvexUser;
  expiresAt: number;
  message: string;
}

/**
 * Make an authenticated request to Convex HTTP endpoint
 *
 * @param request - Playwright APIRequestContext
 * @param url - Full endpoint URL
 * @param options - Request options
 * @returns Response from Convex
 */
export async function makeConvexRequest(
  request: APIRequestContext,
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    token?: string;
    headers?: Record<string, string>;
    timeout?: number;
  } = {}
) {
  const {
    method = 'POST',
    data,
    token,
    headers = {},
    timeout = 10000,
  } = options;

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add Authorization header if token provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Make request
  const response = await request.fetch(url, {
    method,
    headers: requestHeaders,
    data,
    timeout,
  });

  return response;
}

/**
 * Sign up a new user via Convex HTTP endpoint
 *
 * @param request - Playwright APIRequestContext
 * @param userData - User signup data
 * @returns Signup response
 */
export async function signupUser(
  request: APIRequestContext,
  userData: SignupRequest
) {
  const response = await makeConvexRequest(request, AUTH_ENDPOINTS.signup, {
    method: 'POST',
    data: userData,
  });

  return {
    response,
    body: response.ok() ? await response.json() : null,
  };
}

/**
 * Login user via Convex HTTP endpoint
 *
 * @param request - Playwright APIRequestContext
 * @param credentials - Login credentials
 * @returns Login response with session token
 */
export async function loginUser(
  request: APIRequestContext,
  credentials: LoginRequest
) {
  const response = await makeConvexRequest(request, AUTH_ENDPOINTS.login, {
    method: 'POST',
    data: credentials,
  });

  return {
    response,
    body: response.ok() ? await response.json() : null,
  };
}

/**
 * Get current user details via session token
 *
 * @param request - Playwright APIRequestContext
 * @param token - Session token from login
 * @returns User details
 */
export async function getCurrentUser(
  request: APIRequestContext,
  token: string
) {
  const response = await makeConvexRequest(request, AUTH_ENDPOINTS.me, {
    method: 'GET',
    token,
  });

  return {
    response,
    body: response.ok() ? await response.json() : null,
  };
}

/**
 * Logout user (invalidate session)
 *
 * @param request - Playwright APIRequestContext
 * @param token - Session token to invalidate
 */
export async function logoutUser(
  request: APIRequestContext,
  token: string
) {
  const response = await makeConvexRequest(request, AUTH_ENDPOINTS.logout, {
    method: 'POST',
    token,
  });

  return {
    response,
    body: response.ok() ? await response.json() : null,
  };
}

/**
 * Generate unique test user data
 *
 * @param overrides - Optional field overrides
 * @returns Test user data
 */
export function generateTestUser(overrides: Partial<SignupRequest> = {}): SignupRequest {
  const timestamp = Date.now();
  return {
    email: `test.user.${timestamp}@propiq-test.com`,
    password: 'TestPassword123!@#', // Meets Convex password requirements
    firstName: 'Test',
    lastName: 'User',
    company: 'PropIQ Testing Inc.',
    ...overrides,
  };
}

/**
 * Wait for a condition with timeout
 *
 * @param condition - Async function that returns true when condition met
 * @param timeout - Max wait time in ms
 * @param interval - Check interval in ms
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return false;
}

/**
 * Add delay to respect Convex rate limits during testing
 *
 * Convex Rate Limits (from GitHub Issue #8):
 * - Login: 5 attempts per 15 minutes per IP
 * - Signup: 3 attempts per 1 hour per IP
 * - Password Reset: 3 requests per 1 hour per email
 *
 * This helper adds appropriate delays between test runs to avoid hitting rate limits.
 *
 * @param delayMs - Delay in milliseconds (default: 2000ms = 2 seconds)
 * @returns Promise that resolves after delay
 *
 * @example
 * ```typescript
 * test.afterEach(async () => {
 *   await respectRateLimit(3000); // 3 second delay between tests
 * });
 * ```
 */
export async function respectRateLimit(delayMs: number = 2000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, delayMs));
}

/**
 * Calculate appropriate delay for different endpoint types
 *
 * @param endpoint - Type of endpoint being tested
 * @returns Delay in milliseconds
 *
 * @example
 * ```typescript
 * await respectRateLimit(getRateLimitDelay('signup')); // 1200ms delay
 * ```
 */
export function getRateLimitDelay(endpoint: 'login' | 'signup' | 'passwordReset'): number {
  // Rate limits:
  // - Login: 5 attempts per 15 min (900s) = 180s per attempt
  // - Signup: 3 attempts per 1 hour (3600s) = 1200s per attempt
  // - Password Reset: 3 attempts per 1 hour (3600s) = 1200s per attempt

  // For testing, use 10% of the full window to be safe and fast
  const delays = {
    login: 2000,      // 2 seconds (safe for 5 attempts in 15 min)
    signup: 2000,     // 2 seconds (safe for rapid testing, may still hit limit)
    passwordReset: 2000, // 2 seconds
  };

  return delays[endpoint];
}

/**
 * Clean up test user (delete from database)
 * Note: This requires a cleanup endpoint in Convex
 *
 * @param request - Playwright APIRequestContext
 * @param userId - User ID to delete
 * @param adminToken - Admin session token (if required)
 */
export async function cleanupTestUser(
  request: APIRequestContext,
  userId: string,
  adminToken?: string
) {
  // TODO: Implement when Convex cleanup endpoint is ready
  // For now, test users can be cleaned up via convex/cleanupTestAccounts.ts
  console.log(`[CLEANUP] Test user ${userId} should be cleaned up manually or via cron`);
}

/**
 * Validate Convex error response format
 *
 * @param response - Response from Convex endpoint
 * @returns Error details if error response
 */
export async function parseConvexError(response: any): Promise<{
  isError: boolean;
  code?: string;
  message?: string;
  errors?: string[];
}> {
  if (!response.ok()) {
    const text = await response.text();

    try {
      // Try to parse as JSON
      const json = JSON.parse(text);

      // Check for Convex error format
      if (json.code) {
        return {
          isError: true,
          code: json.code,
          message: json.message,
          errors: json.errors,
        };
      }

      // Generic error
      return {
        isError: true,
        message: json.message || text,
      };
    } catch {
      // Not JSON, return raw text
      return {
        isError: true,
        message: text,
      };
    }
  }

  return { isError: false };
}

/**
 * Test environment validation
 * Ensures all required environment variables are set
 */
export function validateTestEnvironment(): void {
  const convexUrl = getConvexHttpUrl();

  if (!convexUrl || convexUrl === 'https://placeholder.convex.cloud') {
    throw new Error(
      'CONVEX_HTTP_URL not configured. Set VITE_CONVEX_URL or PLAYWRIGHT_CONVEX_HTTP_URL'
    );
  }

  if (!convexUrl.includes('convex.site')) {
    console.warn(
      `⚠️  Convex HTTP URL should use .convex.site (got: ${convexUrl})`
    );
  }

  console.log('✅ Test environment validated');
  console.log(`   Convex HTTP URL: ${convexUrl}`);
}

// Note: Validation removed from auto-import to prevent Playwright config errors
// Call validateTestEnvironment() manually in tests if needed
