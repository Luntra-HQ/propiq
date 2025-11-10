# Frontend API Migration Guide: /api/v1 Prefix

**Version:** 3.1.1
**Sprint:** 6
**Date:** 2025-11-07
**Breaking Change:** Yes
**Urgency:** High

---

## Overview

In Sprint 2, we implemented API versioning and all backend endpoints now use the `/api/v1` prefix. The frontend must be updated to use these new endpoints.

**Breaking Change:**
```diff
- OLD: /auth/signup
+ NEW: /api/v1/auth/signup

- OLD: /propiq/analyze
+ NEW: /api/v1/propiq/analyze
```

---

## Why This Change?

**Benefits:**
- **API Versioning:** Can release v2 without breaking v1 clients
- **Better Organization:** Clear separation of API routes
- **Industry Standard:** Follows REST API best practices
- **Future-Proof:** Easier to maintain multiple API versions

---

## Affected Endpoints

### Authentication Endpoints

| Old Endpoint | New Endpoint | Method | Status |
|--------------|--------------|--------|--------|
| `/auth/signup` | `/api/v1/auth/signup` | POST | ⚠️  |
| `/auth/login` | `/api/v1/auth/login` | POST | ⚠️  |
| `/auth/users/{id}` | `/api/v1/auth/users/{id}` | GET | ⚠️  |

### Property Analysis Endpoints

| Old Endpoint | New Endpoint | Method | Status |
|--------------|--------------|--------|--------|
| `/propiq/analyze` | `/api/v1/propiq/analyze` | POST | ⚠️  |
| `/propiq/health` | `/api/v1/propiq/health` | GET | ⚠️  |

### Payment Endpoints

| Old Endpoint | New Endpoint | Method | Status |
|--------------|--------------|--------|--------|
| `/stripe/create-checkout-session` | `/api/v1/stripe/create-checkout-session` | POST | ⚠️  |
| `/stripe/webhook` | `/api/v1/stripe/webhook` | POST | ⚠️  |

### Support Chat Endpoints

| Old Endpoint | New Endpoint | Method | Status |
|--------------|--------------|--------|--------|
| `/support/chat` | `/api/v1/support/chat` | POST | ⚠️  |
| `/support/history/{id}` | `/api/v1/support/history/{id}` | GET | ⚠️  |
| `/support/conversations` | `/api/v1/support/conversations` | GET | ⚠️  |

### Marketing Endpoints

| Old Endpoint | New Endpoint | Method | Status |
|--------------|--------------|--------|--------|
| `/marketing/capture-email` | `/api/v1/marketing/capture-email` | POST | ⚠️  |

---

## Migration Strategy

We have **3 options** for migrating the frontend:

### Option 1: Global API Base URL (Recommended ✅)

Update the Axios base URL configuration once, and all requests automatically use the new prefix.

**Pros:**
- Changes in one place
- Cleanest solution
- Easy to update in future
- No code duplication

**Cons:**
- Requires axios instance configuration

### Option 2: Search and Replace

Find and replace all endpoint strings in the codebase.

**Pros:**
- Simple
- Works without axios configuration

**Cons:**
- Error-prone
- Must update many files
- Easy to miss endpoints

### Option 3: Gradual Migration

Support both old and new endpoints temporarily using a fallback mechanism.

**Pros:**
- Zero downtime
- Can migrate incrementally

**Cons:**
- More complex
- Temporary code bloat
- Must remove fallback later

---

## Implementation: Option 1 (Recommended)

### Step 1: Create API Configuration File

Create `propiq/frontend/src/config/api.ts`:

```typescript
/**
 * API configuration for PropIQ
 * Centralizes all API endpoint configuration
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
    const token = localStorage.getItem('accessToken');
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
      // Clear token and redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints (without /api/v1 prefix)
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
```

### Step 2: Update All API Calls

#### Before:
```typescript
// OLD: Direct axios calls
import axios from 'axios';

const signup = async (userData: SignupData) => {
  const response = await axios.post('/auth/signup', userData);
  return response.data;
};

const login = async (credentials: LoginData) => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};
```

#### After:
```typescript
// NEW: Use apiClient
import { apiClient, API_ENDPOINTS } from '../config/api';

const signup = async (userData: SignupData) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH_SIGNUP, userData);
  return response.data;
};

const login = async (credentials: LoginData) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
  return response.data;
};
```

### Step 3: Update Authentication Utils

Update `propiq/frontend/src/utils/auth.ts` (if it exists):

```typescript
import { apiClient, API_ENDPOINTS } from '../config/api';

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

export const authService = {
  signup: async (data: SignupData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_SIGNUP, data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('userId', response.data.userId);
    }
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGIN, data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('userId', response.data.userId);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  },

  getUser: async (userId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH_USER(userId));
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },
};
```

### Step 4: Update Property Analysis Utils

Update `propiq/frontend/src/utils/propiq.ts`:

```typescript
import { apiClient, API_ENDPOINTS } from '../config/api';

export interface PropertyAnalysisRequest {
  address: string;
  propertyType?: string;
  purchasePrice?: number;
  downPayment?: number;
  interestRate?: number;
}

export const propiqService = {
  analyzeProperty: async (data: PropertyAnalysisRequest) => {
    const response = await apiClient.post(API_ENDPOINTS.PROPIQ_ANALYZE, data);
    return response.data;
  },

  checkHealth: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PROPIQ_HEALTH);
    return response.data;
  },
};
```

### Step 5: Update Support Chat Utils

Update `propiq/frontend/src/utils/supportChat.ts`:

```typescript
import { apiClient, API_ENDPOINTS } from '../config/api';

export interface ChatMessage {
  message: string;
  conversationId?: string;
}

export const supportChatService = {
  sendMessage: async (data: ChatMessage) => {
    const response = await apiClient.post(API_ENDPOINTS.SUPPORT_CHAT, data);
    return response.data;
  },

  getHistory: async (conversationId: string) => {
    const response = await apiClient.get(
      API_ENDPOINTS.SUPPORT_HISTORY(conversationId)
    );
    return response.data;
  },

  getConversations: async () => {
    const response = await apiClient.get(API_ENDPOINTS.SUPPORT_CONVERSATIONS);
    return response.data;
  },
};
```

### Step 6: Update Environment Variables

Update `propiq/frontend/.env`:

```bash
# Production API URL
VITE_API_URL=https://luntra-outreach-app.azurewebsites.net

# Development API URL (optional, defaults to localhost:8000)
# VITE_API_URL=http://localhost:8000
```

### Step 7: Update Components

Update any components that make API calls directly:

#### Before:
```tsx
const handleAnalyze = async () => {
  try {
    const response = await axios.post('/propiq/analyze', data);
    setAnalysis(response.data);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

#### After:
```tsx
import { propiqService } from '../utils/propiq';

const handleAnalyze = async () => {
  try {
    const response = await propiqService.analyzeProperty(data);
    setAnalysis(response);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

---

## Implementation: Option 2 (Search & Replace)

If you prefer a simpler approach without creating service files:

### Step 1: Find All API Calls

Search your codebase for:
- `'/auth/`
- `'/propiq/`
- `'/stripe/`
- `'/support/`
- `'/marketing/`

### Step 2: Replace Each Occurrence

```diff
- axios.post('/auth/signup', data)
+ axios.post('/api/v1/auth/signup', data)

- axios.post('/auth/login', data)
+ axios.post('/api/v1/auth/login', data)

- axios.post('/propiq/analyze', data)
+ axios.post('/api/v1/propiq/analyze', data)

- axios.get('/support/conversations')
+ axios.get('/api/v1/support/conversations')
```

### Step 3: Update Base URL

Update axios defaults if used:

```typescript
axios.defaults.baseURL = 'https://luntra-outreach-app.azurewebsites.net/api/v1';
```

---

## Testing the Migration

### 1. Test Local Development

```bash
cd propiq/frontend
npm run dev
```

Test all functionality:
- [ ] Signup flow
- [ ] Login flow
- [ ] Property analysis
- [ ] Support chat
- [ ] Payment flow

### 2. Check Network Tab

Open browser DevTools → Network:
- All API calls should show `/api/v1/` prefix
- Verify 200 OK responses (not 404)
- Check request/response payloads

### 3. Test Error Handling

- Try invalid login (should show error)
- Try expired token (should redirect to login)
- Try network offline (should show error)

### 4. Test Production Build

```bash
npm run build
npm run preview
```

Verify all endpoints work with production API URL.

---

## Troubleshooting

### Problem: 404 Not Found Errors

**Cause:** Frontend still using old endpoints

**Solution:**
1. Check network tab for endpoint URLs
2. Search codebase for old endpoints: `grep -r "/auth/" src/`
3. Update any missed endpoints

### Problem: CORS Errors

**Cause:** Backend CORS not configured for new domain

**Solution:**
Update backend `.env`:
```bash
ALLOWED_ORIGINS=http://localhost:5173,https://propiq.luntra.one
```

### Problem: Authentication Not Working

**Cause:** Token not being sent or backend rejecting it

**Solution:**
1. Check axios interceptor is adding Authorization header
2. Verify token in localStorage
3. Check backend logs for JWT validation errors

### Problem: Mixed Content (HTTP/HTTPS)

**Cause:** Trying to call HTTP API from HTTPS site

**Solution:**
Ensure API URL uses HTTPS in production:
```typescript
const API_BASE_URL = 'https://luntra-outreach-app.azurewebsites.net/api/v1';
```

---

## Rollback Plan

If migration causes issues, you can temporarily add fallback:

```typescript
const apiCall = async (endpoint: string, data: any) => {
  try {
    // Try new API v1 endpoint
    return await axios.post(`/api/v1${endpoint}`, data);
  } catch (error) {
    if (error.response?.status === 404) {
      // Fallback to old endpoint
      console.warn('Falling back to old API endpoint');
      return await axios.post(endpoint, data);
    }
    throw error;
  }
};
```

**Remove this fallback once migration is complete!**

---

## Migration Checklist

- [ ] Create `src/config/api.ts` with API configuration
- [ ] Create `src/utils/auth.ts` with auth service
- [ ] Create `src/utils/propiq.ts` with PropIQ service
- [ ] Create `src/utils/supportChat.ts` with support service
- [ ] Update all components to use services
- [ ] Update environment variables
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test property analysis
- [ ] Test support chat
- [ ] Test payment flow
- [ ] Verify all network requests use `/api/v1/`
- [ ] Test production build
- [ ] Deploy frontend
- [ ] Monitor for errors

---

## Timeline

**Estimated Time:** 2-4 hours

- Setup (30 min): Create config and service files
- Migration (1-2 hours): Update all API calls
- Testing (1 hour): Test all functionality
- Deploy (30 min): Build and deploy

---

## Summary

**What Changed:**
- All API endpoints now use `/api/v1/` prefix
- Backend implemented in Sprint 2
- Frontend must be updated to match

**Why:**
- API versioning for future compatibility
- Industry standard REST practices
- Easier maintenance

**How:**
- Create centralized API configuration
- Update all API calls to use new endpoints
- Test thoroughly before deploying

**When:**
- High priority (blocking production deployment)
- Should be done in Sprint 6

---

**See Also:**
- [Sprint 2 Documentation](./sprints/SPRINT_2_COMPLETE.md) - API versioning details
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment
- [Backend API Documentation](./API_USAGE_GUIDE.md) - Complete endpoint list

---

**Version:** 1.0
**Last Updated:** 2025-11-07
**Status:** Ready for implementation
**Priority:** High
