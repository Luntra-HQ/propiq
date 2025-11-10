# PropIQ API Usage Guide

**Version:** 3.1.1
**API Version:** v1
**Base URL:** `https://luntra-outreach-app.azurewebsites.net/api/v1`
**Last Updated:** 2025-11-07

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Security Best Practices](#security-best-practices)
6. [Rate Limiting](#rate-limiting)
7. [Code Examples](#code-examples)
8. [Testing](#testing)

---

## Overview

The PropIQ API provides AI-powered real estate investment analysis, subscription management, and user authentication. All endpoints use the `/api/v1` prefix for versioning.

### Key Features

- **JWT Authentication** - Secure token-based auth with bcrypt password hashing
- **Input Validation** - Multi-layered validation (XSS, SQL injection, sanitization)
- **Security Headers** - 8 security headers on all responses (CSP, HSTS, etc.)
- **Structured Logging** - JSON logs with request tracing
- **Error Standardization** - Consistent error codes and response format

### Base URL

```
Production: https://luntra-outreach-app.azurewebsites.net/api/v1
Local Dev:  http://localhost:8000/api/v1
```

---

## Authentication

### Overview

PropIQ uses JWT (JSON Web Tokens) for authentication. After signup/login, you receive a JWT token that must be included in the `Authorization` header for protected endpoints.

### Token Format

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

- **Access Token:** 7 days (configurable via `JWT_EXPIRATION_DAYS`)
- **Refresh:** Not yet implemented (planned for future sprint)

---

### 1. User Signup

**Endpoint:** `POST /api/v1/auth/signup`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Real Estate Co"
}
```

**Validation Rules:**

- **Email:** Valid email format, max 255 characters
- **Password:** 8-128 characters, must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 digit
  - Cannot be common password (e.g., "Password123")
- **Names:** Max 100 characters, XSS/SQL injection checked
- **Company:** Optional, max 200 characters

**Success Response (200):**

```json
{
  "success": true,
  "message": "Signup successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Real Estate Co",
    "createdAt": "2025-11-07T12:00:00Z",
    "subscriptionTier": "free",
    "analysesUsed": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

```json
// 400 - Email already exists
{
  "success": false,
  "error": "Email already registered",
  "error_code": "EMAIL_EXISTS",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}

// 422 - Validation error
{
  "success": false,
  "error": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

**cURL Example:**

```bash
curl -X POST https://luntra-outreach-app.azurewebsites.net/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**JavaScript Example:**

```javascript
const signup = async (userData) => {
  const response = await fetch('https://luntra-outreach-app.azurewebsites.net/api/v1/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  // Store token in localStorage or secure cookie
  localStorage.setItem('token', data.token);
  return data;
};
```

---

### 2. User Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "subscriptionTier": "pro",
    "analysesUsed": 15,
    "analysesLimit": 100
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

```json
// 401 - Invalid credentials
{
  "success": false,
  "error": "Invalid email or password",
  "error_code": "INVALID_CREDENTIALS"
}

// 404 - User not found
{
  "success": false,
  "error": "User not found",
  "error_code": "USER_NOT_FOUND"
}
```

**cURL Example:**

```bash
curl -X POST https://luntra-outreach-app.azurewebsites.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

---

### 3. Get User Profile

**Endpoint:** `GET /api/v1/auth/profile`

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Real Estate Co",
    "subscriptionTier": "pro",
    "analysesUsed": 15,
    "analysesLimit": 100,
    "createdAt": "2025-11-01T12:00:00Z",
    "lastLogin": "2025-11-07T12:00:00Z"
  }
}
```

**Error Responses:**

```json
// 401 - Missing token
{
  "success": false,
  "error": "No authorization token provided",
  "error_code": "UNAUTHORIZED"
}

// 401 - Invalid token
{
  "success": false,
  "error": "Invalid or expired token",
  "error_code": "INVALID_TOKEN"
}
```

**JavaScript Example:**

```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch('https://luntra-outreach-app.azurewebsites.net/api/v1/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, redirect to login
      window.location.href = '/login';
    }
    throw new Error('Failed to fetch profile');
  }

  return await response.json();
};
```

---

## API Endpoints

### Property Analysis

#### Analyze Property

**Endpoint:** `POST /api/v1/propiq/analyze`

**Authentication:** Required (JWT token)

**Request Body:**

```json
{
  "address": "123 Main St, San Francisco, CA 94102",
  "propertyType": "single_family",
  "purchasePrice": 800000,
  "downPaymentPercent": 20,
  "interestRate": 7.5,
  "loanTerm": 30,
  "monthlyRent": 4500,
  "propertyTaxRate": 1.2,
  "insurance": 150,
  "hoaFees": 100,
  "maintenance": 200,
  "propertyManagement": 10,
  "vacancy": 5,
  "appreciationRate": 3,
  "rentGrowthRate": 2
}
```

**Field Validation:**

- **address:** Required, max 500 characters, XSS/SQL injection checked
- **propertyType:** Optional, one of: `single_family`, `multi_family`, `condo`, `townhouse`
- **purchasePrice:** Optional, 0-100,000,000
- **downPaymentPercent:** Optional, 0-100
- **interestRate:** Optional, 0-100
- **loanTerm:** Optional, 1-50 years
- **monthlyRent:** Optional, >= 0
- **All percentages:** 0-100 range

**Success Response (200):**

```json
{
  "success": true,
  "analysis": {
    "address": "123 Main St, San Francisco, CA 94102",
    "propertyType": "single_family",
    "financials": {
      "purchasePrice": 800000,
      "downPayment": 160000,
      "loanAmount": 640000,
      "monthlyMortgage": 4478.98,
      "totalMonthlyExpenses": 5428.98,
      "monthlyRent": 4500,
      "monthlyCashFlow": -928.98,
      "annualCashFlow": -11147.76
    },
    "metrics": {
      "capRate": 4.2,
      "cashOnCashReturn": -6.97,
      "totalROI": -3.97,
      "debtServiceCoverageRatio": 0.83,
      "onePercentRule": 0.56,
      "fiftyPercentRule": "pass"
    },
    "score": 42,
    "rating": "Poor",
    "recommendation": "This property does not meet standard investment criteria...",
    "aiInsights": "Based on the analysis, this property has negative cash flow...",
    "projections": {
      "year1": { "cashFlow": -11147.76, "equity": 24000, "totalReturn": 12852.24 },
      "year2": { "cashFlow": -10066.31, "equity": 48480, "totalReturn": 38413.69 },
      "year3": { "cashFlow": -8961.64, "equity": 73451.52, "totalReturn": 64489.88 },
      "year4": { "cashFlow": -7832.87, "equity": 98925.07, "totalReturn": 91092.20 },
      "year5": { "cashFlow": -6679.13, "equity": 124910.42, "totalReturn": 118231.29 }
    },
    "analysisId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-11-07T12:00:00Z"
  },
  "usage": {
    "analysesUsed": 16,
    "analysesLimit": 100,
    "remaining": 84
  }
}
```

**Error Responses:**

```json
// 403 - Usage limit exceeded
{
  "success": false,
  "error": "Analysis limit reached. Please upgrade your subscription.",
  "error_code": "USAGE_LIMIT_EXCEEDED",
  "details": [
    {
      "field": "usage",
      "message": "You have used 3/3 free analyses. Upgrade to continue."
    }
  ]
}

// 422 - Invalid input
{
  "success": false,
  "error": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "purchasePrice",
      "message": "Purchase price must be between 0 and 100,000,000"
    }
  ]
}
```

**cURL Example:**

```bash
curl -X POST https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "address": "123 Main St, San Francisco, CA 94102",
    "purchasePrice": 800000,
    "monthlyRent": 4500
  }'
```

**JavaScript Example:**

```javascript
const analyzeProperty = async (propertyData) => {
  const token = localStorage.getItem('token');

  const response = await fetch('https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(propertyData),
  });

  if (!response.ok) {
    const error = await response.json();

    // Handle usage limit
    if (error.error_code === 'USAGE_LIMIT_EXCEEDED') {
      // Redirect to pricing page
      window.location.href = '/pricing';
    }

    throw new Error(error.error);
  }

  return await response.json();
};
```

---

### Payment Endpoints

#### Create Checkout Session

**Endpoint:** `POST /api/v1/stripe/create-checkout-session`

**Authentication:** Required

**Request Body:**

```json
{
  "priceId": "price_1ABC123xyz",
  "successUrl": "https://propiq.com/success",
  "cancelUrl": "https://propiq.com/cancel"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "sessionId": "cs_test_abc123xyz",
  "url": "https://checkout.stripe.com/pay/cs_test_abc123xyz"
}
```

**JavaScript Example:**

```javascript
const createCheckoutSession = async (priceId) => {
  const token = localStorage.getItem('token');

  const response = await fetch('https://luntra-outreach-app.azurewebsites.net/api/v1/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      priceId,
      successUrl: window.location.origin + '/success',
      cancelUrl: window.location.origin + '/cancel',
    }),
  });

  const { url } = await response.json();
  window.location.href = url; // Redirect to Stripe checkout
};
```

---

## Error Handling

### Error Response Format

All errors follow this standardized format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "error_code": "MACHINE_READABLE_CODE",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific field error"
    }
  ],
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `EMAIL_EXISTS` | 400 | Email already registered |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `USAGE_LIMIT_EXCEEDED` | 403 | Analysis limit reached |
| `PAYMENT_REQUIRED` | 402 | Payment required for action |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Best Practices

**1. Always check HTTP status codes:**

```javascript
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();

    switch (response.status) {
      case 401:
        // Redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        // Show upgrade prompt
        if (error.error_code === 'USAGE_LIMIT_EXCEEDED') {
          showUpgradeModal();
        }
        break;
      case 422:
        // Display validation errors
        displayValidationErrors(error.details);
        break;
      default:
        // Generic error message
        showError(error.error);
    }

    throw new Error(error.error);
  }

  return await response.json();
};
```

**2. Use request_id for debugging:**

```javascript
try {
  const data = await apiCall();
} catch (error) {
  console.error('API Error:', error.message);
  console.error('Request ID:', error.request_id); // Include in bug reports
}
```

**3. Implement retry logic for 5xx errors:**

```javascript
const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
};
```

---

## Security Best Practices

### 1. Token Storage

**❌ BAD: localStorage (vulnerable to XSS)**

```javascript
localStorage.setItem('token', token); // Avoid if possible
```

**✅ GOOD: HTTP-only cookies (when backend supports it)**

```javascript
// Set cookie on server-side with httpOnly flag
// Client-side JavaScript cannot access it
```

**✅ ACCEPTABLE: localStorage with XSS protection**

```javascript
// Only if you implement strict CSP and sanitize all user input
localStorage.setItem('token', token);
```

### 2. HTTPS Only

**Always use HTTPS in production:**

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://luntra-outreach-app.azurewebsites.net/api/v1'
  : 'http://localhost:8000/api/v1';
```

### 3. Input Sanitization

**Client-side validation is not enough - server validates all inputs:**

```javascript
// Still sanitize on client for UX
const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .slice(0, 500); // Limit length
};
```

### 4. CORS Handling

**The API has CORS enabled for specific origins. If you get CORS errors:**

1. Ensure you're using the correct origin
2. Include credentials if needed:

```javascript
fetch(url, {
  credentials: 'include', // Send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 5. Security Headers

**All API responses include these security headers:**

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000` (production only)
- `Content-Security-Policy: default-src 'self'`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `X-Request-ID: <uuid>` (for request tracing)

---

## Rate Limiting

### Current Limits

- **General endpoints:** 100 requests per minute per IP
- **Auth endpoints:** 10 requests per minute per IP
- **Analysis endpoints:** 5 requests per minute per user

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

### Handling Rate Limits

```javascript
const checkRateLimit = (response) => {
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const waitSeconds = resetTime - Math.floor(Date.now() / 1000);
    throw new Error(`Rate limited. Try again in ${waitSeconds} seconds.`);
  }
};
```

---

## Code Examples

### React Hook for Authentication

```typescript
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionTier: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('https://luntra-outreach-app.azurewebsites.net/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('https://luntra-outreach-app.azurewebsites.net/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

### Python Client Example

```python
import requests
from typing import Dict, Any, Optional

class PropIQClient:
    def __init__(self, base_url: str = "https://luntra-outreach-app.azurewebsites.net/api/v1"):
        self.base_url = base_url
        self.token: Optional[str] = None

    def signup(self, email: str, password: str, first_name: str, last_name: str) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/auth/signup",
            json={
                "email": email,
                "password": password,
                "firstName": first_name,
                "lastName": last_name,
            }
        )
        response.raise_for_status()
        data = response.json()
        self.token = data["token"]
        return data

    def login(self, email: str, password: str) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data["token"]
        return data

    def analyze_property(self, address: str, **kwargs) -> Dict[str, Any]:
        if not self.token:
            raise ValueError("Not authenticated. Call login() first.")

        response = requests.post(
            f"{self.base_url}/propiq/analyze",
            json={"address": address, **kwargs},
            headers={"Authorization": f"Bearer {self.token}"}
        )
        response.raise_for_status()
        return response.json()

# Usage
client = PropIQClient()
client.login("user@example.com", "SecurePass123")
analysis = client.analyze_property(
    address="123 Main St, San Francisco, CA",
    purchasePrice=800000,
    monthlyRent=4500
)
print(f"Deal Score: {analysis['analysis']['score']}")
```

---

## Testing

### Health Check Endpoints

```bash
# PropIQ service health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health

# Auth service health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/auth/health

# Stripe service health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/stripe/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "service": "propiq-analysis",
  "version": "3.1.1",
  "timestamp": "2025-11-07T12:00:00Z"
}
```

### Testing Checklist

- [ ] Sign up with valid credentials
- [ ] Sign up with invalid email (expect 422)
- [ ] Sign up with weak password (expect 422)
- [ ] Sign up with existing email (expect 400)
- [ ] Login with valid credentials
- [ ] Login with wrong password (expect 401)
- [ ] Access protected endpoint without token (expect 401)
- [ ] Access protected endpoint with invalid token (expect 401)
- [ ] Analyze property with valid data
- [ ] Analyze property without authentication (expect 401)
- [ ] Exceed usage limit (expect 403)
- [ ] Send invalid property data (expect 422)
- [ ] Create checkout session
- [ ] Verify security headers in responses

---

## Changelog

### v1 API (Current - v3.1.1)

**Added:**
- JWT authentication with bcrypt
- Property analysis with Azure OpenAI
- Input validation (XSS, SQL injection, sanitization)
- 8 security headers (CSP, HSTS, etc.)
- Request logging with unique IDs
- Standardized error responses
- Rate limiting
- API versioning with `/api/v1` prefix

**Security:**
- Password strength requirements (8+ chars, mixed case, digit)
- XSS detection (10+ patterns)
- SQL injection detection (10+ patterns)
- HTML sanitization
- Request size limits (10 MB)
- CORS configuration

---

## Support

### Need Help?

- **Documentation:** [PropIQ Docs](../README.md)
- **API Issues:** Check `request_id` in error response for debugging
- **Rate Limits:** Upgrade subscription for higher limits
- **Security:** Report vulnerabilities to security@propiq.com

### Common Issues

**Q: "Invalid or expired token" error**
A: Token expired after 7 days. Login again to get a new token.

**Q: "Usage limit exceeded" error**
A: Upgrade your subscription to get more analyses per month.

**Q: CORS error in browser**
A: Ensure you're calling from an allowed origin. Contact support to whitelist your domain.

**Q: 500 Internal Server Error**
A: Server issue. Check status page or contact support with `request_id`.

---

**End of API Usage Guide**
