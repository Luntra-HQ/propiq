/**
 * Server-Side Session Authentication Hook & Context
 *
 * UPDATED: Uses localStorage + Authorization header instead of httpOnly cookies
 * Because Convex is on a different domain (convex.site), cookies don't work.
 * This is the approach Convex officially recommends.
 *
 * - Sessions stored server-side in Convex
 * - Session token stored in localStorage
 * - Token sent via Authorization header
 * - Works across page loads and browser restarts
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Convex HTTP API base URL
// HTTP endpoints use .convex.site (not .convex.cloud which is for WebSocket)
const CONVEX_HTTP_URL = import.meta.env.VITE_CONVEX_URL?.replace('.convex.cloud', '.convex.site') || '';

// localStorage key for session token
const TOKEN_STORAGE_KEY = 'propiq_session_token';

// API endpoints
const AUTH_ENDPOINTS = {
  me: `${CONVEX_HTTP_URL}/auth/me`,
  login: `${CONVEX_HTTP_URL}/auth/login`,
  signup: `${CONVEX_HTTP_URL}/auth/signup`,
  logout: `${CONVEX_HTTP_URL}/auth/logout`,
  logoutEverywhere: `${CONVEX_HTTP_URL}/auth/logout-everywhere`,
  refresh: `${CONVEX_HTTP_URL}/auth/refresh`,
};

console.log('[AUTH] Endpoints configured:', AUTH_ENDPOINTS);

// Helper to get/set token from localStorage
function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    console.error('[AUTH] Failed to store token');
  }
}

function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

// User type matching Convex schema
export interface User {
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
}

// Auth state
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  sessionToken: string | null;
}

// Auth context type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<{ success: boolean; deletedCount?: number; error?: string }>;
  refreshUser: () => Promise<void>;
  getSessionToken: () => string | null;
}

interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Auth Provider Component
 * Wrap your app with this to provide auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    sessionToken: getStoredToken(),
  });

  /**
   * Fetch current user from /auth/me endpoint
   * Uses Authorization header with token from localStorage
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        console.log('[AUTH] No token stored, not authenticated');
        setState(prev => ({
          ...prev,
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
          sessionToken: null,
        }));
        return;
      }

      console.log('[AUTH] Fetching current user with token...');

      const response = await fetch(AUTH_ENDPOINTS.me, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('[AUTH] /me response:', data);

      if (data.authenticated && data.user) {
        setState(prev => ({
          ...prev,
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
          sessionToken: token,
        }));
      } else {
        // Token invalid, clear it
        clearStoredToken();
        setState(prev => ({
          ...prev,
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
          sessionToken: null,
        }));
      }
    } catch (error) {
      console.error('[AUTH] Error fetching user:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Failed to fetch user',
        sessionToken: null,
      }));
    }
  }, []);

  /**
   * Login with email and password
   * Stores session token in localStorage
   * Also notifies Chrome extension via postMessage for session sync
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('[AUTH] Logging in...');

      const response = await fetch(AUTH_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('[AUTH] Login response:', data);

      if (data.success && data.user && data.sessionToken) {
        // Store token in localStorage
        setStoredToken(data.sessionToken);
        console.log('[AUTH] Token stored in localStorage');

        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
          sessionToken: data.sessionToken,
        });

        // Clear any legacy localStorage
        clearLegacyStorage();

        // Notify Chrome extension of login (if extension content script is present)
        notifyExtension('login', data.sessionToken, data.user, data.expiresAt);

        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      return { success: false, error: 'Network error' };
    }
  }, []);

  /**
   * Signup with email and password
   * Stores session token in localStorage
   * Also notifies Chrome extension via postMessage for session sync
   */
  const signup = useCallback(async (data: SignupData) => {
    try {
      console.log('[AUTH] Signing up...');

      const response = await fetch(AUTH_ENDPOINTS.signup, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('[AUTH] Signup response:', result);

      if (result.success && result.user && result.sessionToken) {
        // Store token in localStorage
        setStoredToken(result.sessionToken);
        console.log('[AUTH] Token stored in localStorage');

        setState({
          user: result.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
          sessionToken: result.sessionToken,
        });

        // Clear any legacy localStorage
        clearLegacyStorage();

        // Notify Chrome extension of signup/login
        notifyExtension('login', result.sessionToken, result.user, result.expiresAt);

        return { success: true };
      } else {
        return { success: false, error: result.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('[AUTH] Signup error:', error);
      return { success: false, error: 'Network error' };
    }
  }, []);

  /**
   * Logout - clears server session and localStorage
   * Also notifies Chrome extension to clear its session
   */
  const logout = useCallback(async () => {
    try {
      console.log('[AUTH] Logging out...');

      const token = getStoredToken();

      // Call logout endpoint with token
      if (token) {
        await fetch(AUTH_ENDPOINTS.logout, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      // Clear localStorage
      clearStoredToken();

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        sessionToken: null,
      });

      // Clear any legacy localStorage
      clearLegacyStorage();

      // Notify Chrome extension of logout
      notifyExtension('logout');
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
      // Still clear local state on error
      clearStoredToken();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        sessionToken: null,
      });

      // Still notify extension
      notifyExtension('logout');
    }
  }, []);

  /**
   * Logout from all devices - clears ALL sessions for this user
   * Also notifies Chrome extension to clear its session
   */
  const logoutEverywhere = useCallback(async () => {
    try {
      console.log('[AUTH] Logging out from all devices...');

      const token = getStoredToken();

      const response = await fetch(AUTH_ENDPOINTS.logoutEverywhere, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      const result = await response.json();

      // Clear localStorage
      clearStoredToken();

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        sessionToken: null,
      });

      clearLegacyStorage();

      // Notify Chrome extension of logout
      notifyExtension('logout');

      if (result.success) {
        return { success: true, deletedCount: result.deletedCount };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('[AUTH] Logout everywhere error:', error);
      clearStoredToken();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        sessionToken: null,
      });

      // Still notify extension
      notifyExtension('logout');

      return { success: false, error: 'Network error' };
    }
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Fetch user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Refresh user on window focus - THROTTLED to prevent session race conditions
  // Only check once every 5 minutes, with a 30-second delay after focus
  useEffect(() => {
    let focusTimeout: ReturnType<typeof setTimeout>;
    let lastCheck = 0;

    const handleFocus = () => {
      // Don't check if we're already loading
      if (state.isLoading) return;

      // Throttle: only check once every 5 minutes minimum
      const now = Date.now();
      if (now - lastCheck < 5 * 60 * 1000) {
        return; // Skip - checked recently
      }

      // Delay the check to avoid rapid checks on tab switching
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        lastCheck = Date.now();
        fetchCurrentUser();
      }, 5000); // 5 second delay
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(focusTimeout);
    };
  }, [fetchCurrentUser, state.isLoading]);

  /**
   * Get current session token from localStorage
   * Used by API calls that need authentication
   */
  const getSessionToken = useCallback(() => {
    return getStoredToken();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    logoutEverywhere,
    refreshUser,
    getSessionToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook for backward compatibility - returns just the user
 * Use this as a drop-in replacement for the old useCurrentUser
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

/**
 * Notify Chrome extension of auth state changes via postMessage
 * The extension's content script (auth-sync.ts) listens for these messages
 */
function notifyExtension(
  type: 'login' | 'logout',
  sessionToken?: string,
  user?: User,
  expiresAt?: number
): void {
  try {
    if (type === 'login' && sessionToken && user) {
      window.postMessage({
        type: 'PROPIQ_AUTH_LOGIN',
        payload: {
          sessionToken,
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            subscriptionTier: user.subscriptionTier,
            analysesUsed: user.analysesUsed,
            analysesLimit: user.analysesLimit,
          },
          expiresAt: expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000,
        },
      }, '*');
      console.log('[AUTH] Extension notified of login');
    } else if (type === 'logout') {
      window.postMessage({
        type: 'PROPIQ_AUTH_LOGOUT',
      }, '*');
      console.log('[AUTH] Extension notified of logout');
    }
  } catch (e) {
    // Ignore postMessage errors (extension may not be installed)
    console.log('[AUTH] Could not notify extension:', e);
  }
}

/**
 * Clear legacy localStorage auth data
 * Called on successful auth to prevent conflicts
 */
function clearLegacyStorage(): void {
  try {
    localStorage.removeItem('propiq_user_id');
    localStorage.removeItem('propiq_user_email');
    localStorage.removeItem('propiq_subscription_tier');
    localStorage.removeItem('propiq_logged_in');
    localStorage.removeItem('propiq_analyses_used');
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Check if we have a legacy localStorage session
 * Used for migration - if true, we should try to validate and migrate
 */
export function hasLegacySession(): boolean {
  try {
    return !!localStorage.getItem('propiq_user_id');
  } catch {
    return false;
  }
}
