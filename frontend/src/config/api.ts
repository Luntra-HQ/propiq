/**
 * API configuration for PropIQ
 * Centralizes all API endpoint configuration with /api/v1 prefix
 *
 * Sprint 7: Migration to API v1
 */

import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // Production
  if (import.meta.env.PROD) {
    return 'https://luntra-outreach-app.azurewebsites.net/api/v1';
  }

  // Development - check if custom API URL is set
  const customUrl = import.meta.env.VITE_API_URL;
  if (customUrl) {
    return `${customUrl}/api/v1`;
  }

  // Default development
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

  // Property Images (Street View, Satellite)
  PROPERTY_IMAGES: '/property/images',
  PROPERTY_STREETVIEW: '/property/streetview',
  PROPERTY_IMAGES_HEALTH: '/property/health',

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
