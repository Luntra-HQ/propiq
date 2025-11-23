/**
 * Server-Side Session Authentication Hook & Context
 *
 * This replaces localStorage-based auth with proper httpOnly cookie sessions:
 * - Sessions stored server-side in Convex
 * - Session token in httpOnly cookie (never accessible to JS)
 * - Automatic session refresh
 * - Works in private browsing
 * - Can be revoked server-side
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Convex HTTP API base URL
// HTTP endpoints use .convex.site (not .convex.cloud which is for WebSocket)
const CONVEX_HTTP_URL = import.meta.env.VITE_CONVEX_URL?.replace('.convex.cloud', '.convex.site') || '';

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
}

// Auth context type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<{ success: boolean; deletedCount?: number; error?: string }>;
  refreshUser: () => Promise<void>;
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
  });

  /**
   * Fetch current user from /auth/me endpoint
   * Uses httpOnly cookie for authentication
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      console.log('[AUTH] Fetching current user...');

      const response = await fetch(AUTH_ENDPOINTS.me, {
        method: 'GET',
        credentials: 'include', // Send cookies!
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('[AUTH] /me response:', data);

      if (data.authenticated && data.user) {
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('[AUTH] Error fetching user:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Failed to fetch user',
      });
    }
  }, []);

  /**
   * Login with email and password
   * Server sets httpOnly cookie on success
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('[AUTH] Logging in...');

      const response = await fetch(AUTH_ENDPOINTS.login, {
        method: 'POST',
        credentials: 'include', // Receive and store cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('[AUTH] Login response:', data);

      if (data.success && data.user) {
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });

        // Clear any legacy localStorage
        clearLegacyStorage();

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
   * Server sets httpOnly cookie on success
   */
  const signup = useCallback(async (data: SignupData) => {
    try {
      console.log('[AUTH] Signing up...');

      const response = await fetch(AUTH_ENDPOINTS.signup, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('[AUTH] Signup response:', result);

      if (result.success && result.user) {
        setState({
          user: result.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });

        // Clear any legacy localStorage
        clearLegacyStorage();

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
   * Logout - clears server session and cookie
   */
  const logout = useCallback(async () => {
    try {
      console.log('[AUTH] Logging out...');

      await fetch(AUTH_ENDPOINTS.logout, {
        method: 'POST',
        credentials: 'include',
      });

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      // Clear any legacy localStorage
      clearLegacyStorage();
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
      // Still clear local state on error
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, []);

  /**
   * Logout from all devices - clears ALL sessions for this user
   */
  const logoutEverywhere = useCallback(async () => {
    try {
      console.log('[AUTH] Logging out from all devices...');

      const response = await fetch(AUTH_ENDPOINTS.logoutEverywhere, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      clearLegacyStorage();

      if (result.success) {
        return { success: true, deletedCount: result.deletedCount };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('[AUTH] Logout everywhere error:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
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

  // Refresh user on window focus (optional, catches session changes)
  useEffect(() => {
    const handleFocus = () => {
      if (!state.isLoading) {
        fetchCurrentUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchCurrentUser, state.isLoading]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    logoutEverywhere,
    refreshUser,
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
