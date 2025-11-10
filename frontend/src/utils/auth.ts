/**
 * Authentication Utility for PropIQ Backend API
 * Handles user signup, login, logout, and session management
 *
 * Sprint 7: Migrated to /api/v1 endpoint prefix
 */

import { apiClient, API_ENDPOINTS } from '../config/api';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier?: string;
  subscription_status?: string;
  propiq_usage_count?: number;
  propiq_usage_limit?: number;
  trial_analyses_remaining?: number;
}

export interface AuthResponse {
  success: boolean;
  userId?: string;
  email?: string;
  accessToken?: string;
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
 * Sign up a new user
 */
export async function signup(data: SignupData): Promise<AuthResponse> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_SIGNUP, data);
    const result = response.data;

    // Store auth token and user info
    if (result.success && result.accessToken) {
      localStorage.setItem('propiq_token', result.accessToken);
      localStorage.setItem('propiq_user_id', result.userId);
      localStorage.setItem('propiq_user_email', result.email);
    }

    return result;
  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Signup failed',
    };
  }
}

/**
 * Log in an existing user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGIN, data);
    const result = response.data;

    // Store auth token and user info
    if (result.success && result.accessToken) {
      localStorage.setItem('propiq_token', result.accessToken);
      localStorage.setItem('propiq_user_id', result.userId);
      localStorage.setItem('propiq_user_email', result.email);
    }

    return result;
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Login failed',
    };
  }
}

/**
 * Log out the current user
 */
export function logout(): void {
  localStorage.removeItem('propiq_token');
  localStorage.removeItem('propiq_user_id');
  localStorage.removeItem('propiq_user_email');

  // Reload to clear any cached state
  window.location.reload();
}

/**
 * Get the current user's auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('propiq_token');
}

/**
 * Get the current user's ID
 */
export function getUserId(): string | null {
  return localStorage.getItem('propiq_user_id');
}

/**
 * Get the current user's email
 */
export function getUserEmail(): string | null {
  return localStorage.getItem('propiq_user_email');
}

/**
 * Check if user is logged in
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const userId = getUserId();
  return !!(token && userId);
}

/**
 * Get user details from backend
 */
export async function getUserDetails(userId: string): Promise<User | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await apiClient.get(API_ENDPOINTS.AUTH_USER(userId));
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

/**
 * Make authenticated API request
 * @deprecated Use apiClient directly instead - authentication is handled automatically
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Verify if token is still valid
 */
export async function verifyToken(): Promise<boolean> {
  const userId = getUserId();
  if (!userId) return false;

  const user = await getUserDetails(userId);
  return user !== null;
}
