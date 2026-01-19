/**
 * API configuration for PropIQ
 * Centralizes all API endpoint configuration with /api/v1 prefix
 *
 * Sprint 7: Migration to API v1
 */

import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // VITE_API_URL wins when set (dev or prod). At AWS cutover, set in Netlify build env.
  // This allows pointing to AWS App Runner or Azure Web App dynamically.
  const customUrl = import.meta.env.VITE_API_URL;
  if (customUrl) {
    const base = customUrl.replace(/\/api\/v1\/?$/, '');
    return `${base}/api/v1`;
  }

  // Production default: Azure backend (migrate by setting VITE_API_URL)
  if (import.meta.env.PROD) {
    return 'https://luntra-outreach-app.azurewebsites.net/api/v1';
  }

  // Development default
  return 'http://localhost:8000/api/v1';
};

// API Base URL
export const API_BASE_URL = getApiBaseUrl();

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Check multiple possible token storage keys for backward compatibility
    const token = localStorage.getItem('propiq_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('propiq_token');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('propiq_user_id');
      localStorage.removeItem('propiq_user_email');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints (without /api/v1 prefix - automatically added by baseURL)
export const API_ENDPOINTS = {
  // Auth
  AUTH_SIGNUP: '/auth/signup',
  AUTH_LOGIN: '/auth/login',
  AUTH_USER: (userId: string) => `/auth/users/${userId}`,

  // Property Analysis
  PROPIQ_ANALYZE: '/propiq/analyze',
  PROPIQ_HEALTH: '/propiq/health',

  // Payments
  STRIPE_CHECKOUT: '/stripe/create-checkout-session',
  STRIPE_WEBHOOK: '/stripe/webhook',

  // Support
  SUPPORT_CHAT: '/support/chat',
  SUPPORT_HISTORY: (conversationId: string) => `/support/history/${conversationId}`,
  SUPPORT_CONVERSATIONS: '/support/conversations',

  // Marketing
  MARKETING_CAPTURE_EMAIL: '/marketing/capture-email',
};

// Export type for TypeScript autocompletion
export type ApiEndpoint = keyof typeof API_ENDPOINTS;
