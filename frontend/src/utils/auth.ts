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
 * Store login data after successful authentication
 */
export function handleAuthSuccess(userId: string, email: string, tier: string): void {
  storeAuthData(userId, email, tier);
}

