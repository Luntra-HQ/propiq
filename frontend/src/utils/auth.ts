/**
 * Authentication Utility for PropIQ Convex Backend
 * Handles user signup, login, logout, and session management
 *
 * Migrated from Azure API to Convex
 */

/**
 * Check if localStorage is available (may not be in private browsing, iframes, etc.)
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.error('[AUTH] localStorage not available:', e);
    return false;
  }
}

/**
 * Safely set an item in localStorage with error handling
 */
function safeSetItem(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) {
    console.error('[AUTH] Cannot store auth data - localStorage unavailable');
    return false;
  }

  try {
    localStorage.setItem(key, value);
    // Verify the write succeeded
    if (localStorage.getItem(key) !== value) {
      console.error('[AUTH] localStorage write verification failed for:', key);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[AUTH] Failed to write to localStorage:', e);
    return false;
  }
}

/**
 * Safely get an item from localStorage with error handling
 */
function safeGetItem(key: string): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error('[AUTH] Failed to read from localStorage:', e);
    return null;
  }
}

/**
 * Safely remove an item from localStorage with error handling
 */
function safeRemoveItem(key: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('[AUTH] Failed to remove from localStorage:', e);
  }
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  subscriptionTier: string;
  analysesUsed: number;
  analysesLimit: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: number;
  lastLogin?: number;
}

export interface AuthResponse {
  success: boolean;
  userId?: string;
  email?: string;
  subscriptionTier?: string;
  analysesLimit?: number;
  message?: string;
  error?: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Store auth data in localStorage with safety checks
 */
function storeAuthData(userId: string, email: string, tier: string): boolean {
  const success = safeSetItem('propiq_user_id', userId) &&
                  safeSetItem('propiq_user_email', email) &&
                  safeSetItem('propiq_subscription_tier', tier) &&
                  safeSetItem('propiq_logged_in', 'true');

  if (!success) {
    console.error('[AUTH] Failed to store auth data - some localStorage writes failed');
  }

  return success;
}

/**
 * Sign up a new user
 * Note: This is a wrapper. Components should use useMutation(api.auth.signup) directly
 */
export async function signup(data: SignupData): Promise<AuthResponse> {
  // This function is deprecated - components should use Convex mutations directly
  // Kept for backward compatibility
  console.warn('signup() is deprecated. Use useMutation(api.auth.signup) instead');

  return {
    success: false,
    error: 'Please use Convex mutations directly in components',
  };
}

/**
 * Log in an existing user
 * Note: This is a wrapper. Components should use useMutation(api.auth.login) directly
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  // This function is deprecated - components should use Convex mutations directly
  // Kept for backward compatibility
  console.warn('login() is deprecated. Use useMutation(api.auth.login) instead');

  return {
    success: false,
    error: 'Please use Convex mutations directly in components',
  };
}

/**
 * Log out the current user
 */
export function logout(): void {
  safeRemoveItem('propiq_user_id');
  safeRemoveItem('propiq_user_email');
  safeRemoveItem('propiq_subscription_tier');
  safeRemoveItem('propiq_logged_in');
  safeRemoveItem('propiq_analyses_used');

  // Reload to clear any cached state
  window.location.reload();
}

/**
 * Get the current user's ID
 */
export function getUserId(): string | null {
  return safeGetItem('propiq_user_id');
}

/**
 * Get the current user's email
 */
export function getUserEmail(): string | null {
  return safeGetItem('propiq_user_email');
}

/**
 * Get the current user's subscription tier
 */
export function getUserTier(): string {
  return safeGetItem('propiq_subscription_tier') || 'free';
}

/**
 * Check if user is logged in
 */
export function isAuthenticated(): boolean {
  const isLoggedIn = safeGetItem('propiq_logged_in');
  const userId = getUserId();
  return !!(isLoggedIn === 'true' && userId);
}

/**
 * Get user details from Convex
 * Note: Components should use useQuery(api.auth.getUser) instead
 */
export async function getUserDetails(userId: string): Promise<User | null> {
  // This function is deprecated - components should use Convex queries directly
  console.warn('getUserDetails() is deprecated. Use useQuery(api.auth.getUser) instead');

  // For now, return cached data from localStorage
  const email = getUserEmail();
  const tier = getUserTier();

  if (!email) return null;

  return {
    id: userId,
    email,
    subscriptionTier: tier,
    analysesUsed: 0,
    analysesLimit: tier === 'free' ? 3 : tier === 'starter' ? 20 : tier === 'pro' ? 100 : 999999,
    active: true,
    emailVerified: false,
    createdAt: Date.now(),
  };
}

/**
 * Store login data after successful authentication
 */
export function handleAuthSuccess(userId: string, email: string, tier: string): void {
  storeAuthData(userId, email, tier);
}

/**
 * Get the current user's auth token
 * @deprecated Convex handles authentication automatically
 */
export function getAuthToken(): string | null {
  return null; // Convex doesn't use JWT tokens
}

/**
 * Verify if token is still valid
 * @deprecated Convex handles authentication automatically
 */
export async function verifyToken(): Promise<boolean> {
  return isAuthenticated();
}
