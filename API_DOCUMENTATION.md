# PropIQ API Documentation

**Version**: 1.0
**Last Updated**: November 10, 2025
**Base URL**: `https://luntra-outreach-app.azurewebsites.net`
**Authentication**: Bearer JWT Token

---

## 📚 Table of Contents

1. [Authentication](#authentication)
2. [Subscription Management](#subscription-management)
3. [User Dashboard](#user-dashboard)
4. [Account Settings](#account-settings)
5. [Property Analysis](#property-analysis)
6. [Analysis History](#analysis-history)
7. [GDPR Compliance](#gdpr-compliance)
8. [Payment Webhooks](#payment-webhooks)
9. [Error Codes](#error-codes)
10. [Rate Limits](#rate-limits)

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### POST `/api/v1/auth/register`
Create a new user account

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "subscription_tier": "free",
    "subscription_status": "active"
  }
}
```

**Errors**:
- `400`: Email already exists, weak password
- `422`: Validation error (invalid email format)

---

### POST `/api/v1/auth/login`
Authenticate existing user

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "subscription_tier": "starter",
    "subscription_status": "active"
  }
}
```

**Errors**:
- `401`: Invalid credentials
- `422`: Validation error

---

## 💳 Subscription Management

### GET `/api/v1/subscription/plans`
Get available subscription plans

**Response** (200):
```json
{
  "plans": [
    {
      "tier": "free",
      "name": "Free",
      "price": 0,
      "billing_period": "month",
      "analyses_per_month": 5,
      "features": [...]
    },
    {
      "tier": "starter",
      "name": "Starter",
      "price": 29,
      "billing_period": "month",
      "analyses_per_month": 25,
      "features": [...],
      "popular": true
    }
    // ... pro, elite
  ]
}
```

---

### GET `/api/v1/subscription/details`
Get current user's subscription details

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "subscription": {
    "tier": "starter",
    "status": "active",
    "stripe_customer_id": "cus_xxx",
    "stripe_subscription_id": "sub_xxx"
  },
  "usage": {
    "current_usage": 12,
    "usage_limit": 25,
    "percentage_used": 48.0,
    "last_reset": "2025-11-01T00:00:00Z"
  },
  "billing": {
    "current_period_start": "2025-11-01T00:00:00Z",
    "current_period_end": "2025-12-01T00:00:00Z",
    "next_billing_date": "2025-12-01T00:00:00Z"
  },
  "tier_info": {
    "analyses": 25,
    "price": 29
  }
}
```

---

### POST `/api/v1/subscription/upgrade`
Upgrade subscription to higher tier

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "target_tier": "pro",
  "payment_method_id": "pm_xxx"  // Optional, for first-time subscribers
}
```

**Response** (200 - Checkout Session):
```json
{
  "success": true,
  "message": "Checkout session created. Redirect user to complete payment.",
  "subscription": {
    "checkout_url": "https://checkout.stripe.com/pay/cs_xxx",
    "session_id": "cs_xxx"
  }
}
```

**Response** (200 - Existing Subscriber):
```json
{
  "success": true,
  "message": "Successfully upgraded from starter to pro",
  "subscription": {
    "tier": "pro",
    "status": "active",
    "stripe_subscription_id": "sub_xxx"
  },
  "next_billing_date": "2025-12-01T00:00:00Z",
  "proration_amount": 50.00
}
```

**Errors**:
- `400`: Invalid tier, already at tier
- `401`: Unauthorized
- `500`: Stripe error

---

### POST `/api/v1/subscription/downgrade`
Downgrade subscription (scheduled at period end)

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `target_tier` (string, required): Target tier (e.g., "free", "starter")

**Response** (200):
```json
{
  "success": true,
  "message": "Subscription will be downgraded to Free on December 01, 2025. You'll keep starter access until then.",
  "subscription": {
    "tier": "starter",
    "status": "active",
    "cancel_at_period_end": true,
    "downgrade_scheduled": "free"
  },
  "next_billing_date": "2025-12-01T00:00:00Z"
}
```

---

### POST `/api/v1/subscription/cancel`
Cancel subscription

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "reason": "Too expensive",
  "feedback": "Great product but over budget",
  "cancel_immediately": false
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Subscription will be canceled on December 01, 2025. You'll keep starter access until then.",
  "current_tier": "starter",
  "access_until": "2025-12-01T00:00:00Z"
}
```

---

## 📊 User Dashboard

### GET `/api/v1/dashboard/overview`
Get dashboard overview with usage stats

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "usage": {
    "current": 12,
    "limit": 25,
    "remaining": 13,
    "percentage_used": 48.0,
    "status": "good",
    "days_until_reset": 15
  },
  "subscription": {
    "tier": "starter",
    "status": "active",
    "next_billing_date": "2025-12-01T00:00:00Z",
    "upgrade_available": true
  },
  "activity": {
    "total_analyses": 45,
    "recent_analyses_count": 5,
    "last_analysis_date": "2025-11-10T14:30:00Z"
  },
  "recent_analyses": [
    {
      "id": "uuid",
      "address": "123 Main St, San Francisco, CA",
      "created_at": "2025-11-10T14:30:00Z",
      "verdict": "buy"
    }
  ],
  "quick_actions": [
    {
      "action": "analyze_property",
      "label": "Analyze New Property",
      "enabled": true
    },
    {
      "action": "upgrade",
      "label": "Upgrade to Pro",
      "enabled": true
    }
  ]
}
```

---

### GET `/api/v1/dashboard/usage-stats`
Get detailed usage statistics

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "current_period": {
    "start_date": "2025-11-01T00:00:00Z",
    "analyses_count": 12,
    "limit": 25,
    "remaining": 13
  },
  "daily_usage_last_30_days": [
    {"date": "2025-10-12", "count": 2},
    {"date": "2025-10-13", "count": 1}
    // ... 30 days
  ],
  "property_types": {
    "Single Family": 8,
    "Multi-Family": 3,
    "Commercial": 1
  },
  "verdict_distribution": {
    "buy": 5,
    "strong_buy": 2,
    "hold": 3,
    "avoid": 2
  },
  "total_lifetime_analyses": 45,
  "average_per_day": 1.5
}
```

---

### GET `/api/v1/dashboard/billing-history`
Get billing and payment history

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "has_billing_history": true,
  "invoices": [
    {
      "id": "in_xxx",
      "date": "2025-11-01T00:00:00Z",
      "amount": 29.00,
      "currency": "USD",
      "status": "paid",
      "paid": true,
      "invoice_pdf": "https://pay.stripe.com/invoice/xxx/pdf",
      "description": "Starter Plan - Monthly",
      "period_start": "2025-11-01T00:00:00Z",
      "period_end": "2025-12-01T00:00:00Z"
    }
  ],
  "upcoming_invoice": {
    "amount": 29.00,
    "currency": "USD",
    "date": "2025-12-01T00:00:00Z",
    "description": "Starter Plan - Monthly"
  },
  "total_paid": 87.00,
  "currency": "USD"
}
```

---

### GET `/api/v1/dashboard/recommendations`
Get personalized recommendations

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "recommendations": [
    {
      "type": "upgrade",
      "priority": "high",
      "title": "Consider Upgrading Your Plan",
      "description": "You've used 85% of your monthly limit. Upgrade to get more analyses.",
      "action": "upgrade",
      "suggested_tier": "pro"
    }
  ],
  "usage_health": "warning",
  "tier_optimization": {
    "status": "over_utilized",
    "message": "Consider upgrading to avoid hitting limits",
    "suggested_action": "upgrade"
  }
}
```

---

## 👤 Account Settings

### GET `/api/v1/account/profile`
Get user profile

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "company": "Acme Inc",
    "job_title": "Real Estate Investor",
    "email_verified": true
  },
  "account": {
    "created_at": "2025-10-01T00:00:00Z",
    "last_login": "2025-11-10T14:30:00Z",
    "subscription_tier": "starter",
    "subscription_status": "active"
  }
}
```

---

### PUT `/api/v1/account/profile`
Update user profile

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "full_name": "John Smith",
  "phone": "+1234567890",
  "company": "New Company Inc",
  "job_title": "Senior Investor"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": { /* updated profile */ }
}
```

---

### POST `/api/v1/account/change-password`
Change password

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewSecurePass456!",
  "confirm_password": "NewSecurePass456!"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors**:
- `401`: Current password incorrect
- `400`: New password doesn't meet requirements
- `400`: Passwords don't match

---

### GET `/api/v1/account/email-preferences`
Get email notification preferences

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "marketing_emails": true,
  "product_updates": true,
  "usage_alerts": true,
  "billing_notifications": true,
  "weekly_summary": false
}
```

---

### PUT `/api/v1/account/email-preferences`
Update email notification preferences

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "marketing_emails": false,
  "product_updates": true,
  "usage_alerts": true,
  "billing_notifications": true,
  "weekly_summary": true
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Email preferences updated successfully",
  "preferences": { /* updated preferences */ }
}
```

---

## 🏠 Property Analysis

### POST `/api/v1/propiq/analyze`
Analyze a property

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "address": "123 Main St, San Francisco, CA 94102"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "address": "123 Main St, San Francisco, CA 94102",
  "analysis_result": {
    "property": {
      "address": "123 Main St, San Francisco, CA 94102",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94102",
      "property_type": "Single Family",
      "year_built": 1985,
      "bedrooms": 3,
      "bathrooms": 2,
      "sqft": 1800
    },
    "market_analysis": {
      "estimated_value": 1250000,
      "value_range": {
        "low": 1150000,
        "high": 1350000
      },
      "price_per_sqft": 694,
      "appreciation_rate": 5.2
    },
    "investment_metrics": {
      "cap_rate": 4.8,
      "cash_on_cash_return": 6.2,
      "roi_5_year": 28.5,
      "monthly_rental_income": 4500,
      "monthly_expenses": 2800,
      "net_monthly_cashflow": 1700
    },
    "risk_analysis": {
      "overall_score": 7.5,
      "market_volatility": "medium",
      "liquidity": "high",
      "regulatory_risk": "low"
    },
    "recommendation": {
      "verdict": "buy",
      "confidence": 0.82,
      "key_strengths": [
        "Strong appreciation potential",
        "High demand area"
      ],
      "key_risks": [
        "High property taxes"
      ]
    }
  },
  "created_at": "2025-11-10T14:30:00Z"
}
```

**Errors**:
- `400`: Address not found
- `403`: Usage limit exceeded
- `401`: Unauthorized

---

## 📜 Analysis History

### GET `/api/v1/analysis/history`
Get property analysis history with filtering, sorting, pagination

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `page` (int, default: 1): Page number
- `page_size` (int, default: 20, max: 100): Items per page
- `sort_by` (enum): created_at, address, verdict, value, cap_rate
- `sort_order` (enum): asc, desc
- `verdict` (enum): buy, strong_buy, hold, avoid, sell
- `property_type` (enum): Single Family, Multi-Family, Commercial, Condo
- `min_value` (float): Minimum property value
- `max_value` (float): Maximum property value
- `min_cap_rate` (float): Minimum cap rate
- `max_cap_rate` (float): Maximum cap rate
- `city` (string): Filter by city
- `state` (string): Filter by state
- `date_from` (ISO date): Start date
- `date_to` (ISO date): End date
- `search` (string): Search in address

**Response** (200):
```json
{
  "analyses": [
    {
      "id": "uuid",
      "address": "123 Main St, San Francisco, CA 94102",
      "created_at": "2025-11-10T14:30:00Z",
      "analysis_result": { /* full analysis */ }
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "verdict": "buy",
    "city": "San Francisco"
  },
  "sort": {
    "field": "created_at",
    "order": "desc"
  }
}
```

---

### GET `/api/v1/analysis/history/{analysis_id}`
Get specific analysis details

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "address": "123 Main St, San Francisco, CA 94102",
  "analysis_result": { /* full analysis */ },
  "created_at": "2025-11-10T14:30:00Z"
}
```

**Errors**:
- `404`: Analysis not found
- `403`: Not authorized to view this analysis

---

### DELETE `/api/v1/analysis/history/{analysis_id}`
Delete a property analysis

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "Analysis deleted successfully",
  "analysis_id": "uuid"
}
```

---

### GET `/api/v1/analysis/export/csv`
Export analyses to CSV

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**: Same filters as `/history` endpoint

**Response** (200):
- Content-Type: `text/csv`
- File download with analyses data

---

### GET `/api/v1/analysis/export/json`
Export analyses to JSON

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**: Same filters as `/history` endpoint

**Response** (200):
- Content-Type: `application/json`
- File download with analyses data

---

### GET `/api/v1/analysis/summary`
Get summary statistics of all analyses

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "total_analyses": 45,
  "verdict_distribution": {
    "buy": 20,
    "strong_buy": 8,
    "hold": 10,
    "avoid": 7
  },
  "property_type_distribution": {
    "Single Family": 30,
    "Multi-Family": 10,
    "Commercial": 5
  },
  "average_metrics": {
    "cap_rate": 5.2,
    "monthly_cash_flow": 1850.50
  },
  "date_range": {
    "first_analysis": "2025-10-01T00:00:00Z",
    "last_analysis": "2025-11-10T14:30:00Z"
  }
}
```

---

## 🔒 GDPR Compliance

### POST `/api/v1/gdpr/export-data`
Export all user data (GDPR Article 15)

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "format": "json",
  "include_analyses": true,
  "include_support_chats": true,
  "include_payment_history": true
}
```

**Response** (200):
```json
{
  "success": true,
  "export_date": "2025-11-10T14:30:00Z",
  "user_id": "uuid",
  "data": {
    "export_metadata": { /* metadata */ },
    "user_profile": { /* profile */ },
    "subscription": { /* subscription */ },
    "usage_statistics": { /* usage */ },
    "property_analyses": { /* analyses */ },
    "support_conversations": { /* chats */ },
    "payment_history": { /* invoices */ }
  },
  "message": "Data export completed successfully"
}
```

---

### GET `/api/v1/gdpr/export-data/download`
Download user data as file

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `format` (enum): json, csv

**Response** (200):
- File download with complete user data

---

### POST `/api/v1/gdpr/delete-account`
Request account deletion (GDPR Article 17)

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "password": "current_password",
  "confirm": true,
  "reason": "No longer needed"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Your account deletion has been scheduled for December 10, 2025. You have 30 days to cancel...",
  "deletion_scheduled_date": "2025-12-10T00:00:00Z"
}
```

**Errors**:
- `401`: Invalid password
- `400`: Confirmation not provided

---

### POST `/api/v1/gdpr/cancel-deletion`
Cancel scheduled account deletion

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "Account deletion has been canceled. Your account remains active."
}
```

---

## 💰 Payment Webhooks

### POST `/api/v1/stripe/webhook`
Stripe webhook endpoint (called by Stripe, not clients)

**Headers**:
- `Stripe-Signature`: Webhook signature for verification

**Events Handled**:
- `checkout.session.completed`: New subscription created
- `customer.subscription.created`: Subscription activated
- `customer.subscription.updated`: Subscription changed
- `customer.subscription.deleted`: Subscription canceled
- `invoice.payment_succeeded`: Payment successful
- `invoice.payment_failed`: Payment failed

**Response** (200):
```json
{
  "status": "success",
  "message": "Webhook processed"
}
```

---

## ❌ Error Codes

| Status Code | Description | Example |
|-------------|-------------|---------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions, usage limit exceeded |
| 404 | Not Found | Resource not found |
| 422 | Validation Error | Pydantic validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

**Error Response Format**:
```json
{
  "detail": "Error message here"
}
```

---

## ⏱️ Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Property Analysis | 5 requests | per minute |
| Subscription Changes | 10 requests | per hour |
| Login Attempts | 3 requests | per minute |
| General API | 100 requests | per minute |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1699632000
```

---

## 🔧 Development & Testing

### Health Checks

- Backend: `/health`
- PropIQ API: `/api/v1/propiq/health`
- Subscription API: `/api/v1/subscription/health`
- Dashboard API: `/api/v1/dashboard/health`
- Account API: `/api/v1/account/health`
- Analysis API: `/api/v1/analysis/health`
- GDPR API: `/api/v1/gdpr/health`

### Test Mode (Stripe)

For development, use Stripe test keys:
- Test cards: `4242 4242 4242 4242` (Visa)
- Test webhook secret: `whsec_test_...`

---

**API Version**: 1.0
**Documentation Last Updated**: November 10, 2025
**Contact**: support@propiq.luntra.one
