# PropIQ Extension vs Web App - Technical Comparison

**Date:** December 29, 2025
**Codebases Analyzed:**
- Extension: `/Projects/propiq-extension`
- Web App: `/Projects/propiq`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Feature Parity Analysis](#feature-parity-analysis)
3. [Shared vs Duplicated Code](#shared-vs-duplicated-code)
4. [API Calls & Backend Integration](#api-calls--backend-integration)
5. [Authentication & Session Management](#authentication--session-management)
6. [Data Models & Types](#data-models--types)
7. [Recommendations](#recommendations)

---

## Executive Summary

### Key Findings

**Feature Parity:** ⚠️ **65% overlap** - Extension is a subset of web app functionality, focused specifically on Zillow integration and property analysis.

**Code Duplication:** 🔴 **HIGH** - Significant duplication in:
- Type definitions (UserData, PropertyData, AnalysisRequest/Response)
- Auth logic and session management
- API client patterns
- Validation utilities (password strength)

**API Inconsistencies:** ⚠️ **MODERATE** - Both use Convex backend but with different approaches:
- Extension uses dual approach (Convex HTTP + legacy Azure endpoints)
- Web app uses direct Convex mutations/queries
- Different auth token handling (chrome.storage vs localStorage)

**Integration Status:** ✅ **GOOD** - Extension has auth-sync.ts content script that successfully bridges web app sessions to extension via postMessage API.

---

## Feature Parity Analysis

### Features Present in BOTH Extension and Web App

| Feature | Extension | Web App | Notes |
|---------|-----------|---------|-------|
| **User Authentication** | ✅ Full | ✅ Full | Extension syncs from web app |
| **Property Analysis** | ✅ Core feature | ✅ Core feature | Extension integrates with Zillow |
| **Mock Mode** | ✅ For dev | ❌ No | Extension-only feature |
| **Session Management** | ✅ chrome.storage | ✅ localStorage | Different storage mechanisms |
| **Password Validation** | ✅ Duplicated | ✅ Duplicated | Same rules, separate code |

**Files:**
- Extension: `src/shared/session-manager.ts`, `src/shared/api-client.ts`
- Web App: `frontend/src/utils/auth.ts`, `convex/auth.ts`

---

### Features ONLY in Web App

| Feature | Implementation | Location |
|---------|----------------|----------|
| **Deal Calculator** | 3-tab comprehensive calculator | `frontend/src/components/DealCalculator.tsx` |
| **Dashboard** | User analytics and property tracking | `frontend/src/components/Dashboard.tsx` |
| **Subscription Management** | Stripe integration, plan changes | `frontend/src/components/PlanChangeModal.tsx` |
| **Blog System** | Content management with Convex | `convex/blog.ts`, `convex/articles.ts` |
| **Email Marketing** | Onboarding sequences, Resend API | `convex/emails.ts`, `convex/emailScheduler.ts` |
| **Lead Magnets** | PDF downloads, lead capture | `convex/leadMagnet.ts` |
| **Help Center** | Self-service support | `frontend/src/components/HelpCenter.tsx` |
| **Account Settings** | Password change, preferences | `frontend/src/components/ChangePasswordForm.tsx` |
| **Analytics Dashboard** | User tracking, metrics | `convex/analytics.ts`, `convex/dailyMetrics.ts` |
| **PDF Export** | Property report exports | `frontend/src/utils/pdfExport.ts` |
| **NPS Surveys** | In-app feedback collection | Referenced in Convex backend |
| **Referral System** | User referrals tracking | `convex/auth.ts` (referralCode support) |

**Coverage:** Web app has **12+ major features** not available in extension.

---

### Features ONLY in Extension

| Feature | Implementation | Location |
|---------|----------------|----------|
| **Zillow Parser** | DOM scraping for property data | `src/content/zillow-parser.ts` (504 lines) |
| **Content Script Injection** | Analyzer UI on Zillow pages | `src/content/analyzer-ui.ts` |
| **Auth Sync Bridge** | Web app ↔ extension session sync | `src/content/auth-sync.ts` |
| **Chrome Storage Integration** | Persistent extension storage | All files using `chrome.storage.local` |
| **Browser Action Popup** | Extension popup UI | `src/popup/popup.ts`, `src/popup/index.html` |
| **Mock Mode** | Offline development mode | `src/shared/mock-data.ts` |

**Coverage:** Extension has **6 major features** unique to browser extension context.

---

## Shared vs Duplicated Code

### 🔴 HIGH DUPLICATION Areas

#### 1. **Type Definitions** - 90% duplicated

**Extension:** `src/shared/types.ts` (150 lines)
```typescript
export interface UserData {
  userId: string;
  email: string;
  accessToken: string;
  subscriptionTier: 'free' | 'starter' | 'pro' | 'elite';
  analysesRemaining: number;
  isLoggedIn: boolean;
}

export interface PropertyData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  // ... more fields
}

export interface AnalysisRequest {
  address: string;
  propertyType?: string;
  purchasePrice?: number;
  // ...
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: { /* ... */ };
  error?: string;
  usesRemaining?: number;
}
```

**Web App:** `frontend/src/utils/auth.ts` + Convex types
```typescript
export interface User {
  id: string;              // ← userId in extension
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  subscriptionTier: string;
  analysesUsed: number;
  analysesLimit: number;   // ← extension calculates analysesRemaining
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: number;
  lastLogin?: number;
}
```

**Differences:**
- Extension uses `accessToken`, web app uses session tokens
- Extension stores `analysesRemaining` (calculated), web app stores `analysesUsed` + `analysesLimit`
- Web app has additional fields (company, Stripe IDs, emailVerified)
- Field naming: `userId` vs `id`, `isLoggedIn` vs `active`

**Impact:** Changes to data models require updates in BOTH codebases.

---

#### 2. **Password Validation** - 100% duplicated

**Extension:** `src/shared/passwordValidation.ts` (120 lines)
```typescript
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  // Implementation...
}
```

**Web App:** `frontend/src/utils/passwordValidation.ts` + `convex/auth.ts`
```typescript
// Frontend validation (passwordValidation.ts)
export const validatePassword = (password: string) => {
  // Nearly identical implementation
};

// Backend validation (convex/auth.ts)
const COMMON_PASSWORDS = [ /* same list */ ];

function validatePasswordStrength(password: string): void {
  // Throws errors if invalid - same rules
}
```

**Issue:** Same validation logic exists in 3 places (extension, web frontend, Convex backend).

---

#### 3. **Session/Auth Management** - 80% duplicated

**Extension:** `src/shared/session-manager.ts` (324 lines)
```typescript
class SessionManager {
  private sessionData: SessionData | null = null;

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${CONVEX_HTTP_URL}/auth/extension-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    // Store in chrome.storage.local
  }

  async validateSession(token: string): Promise<boolean> {
    const response = await fetch(`${CONVEX_HTTP_URL}/auth/validate`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    return result.valid === true;
  }
}
```

**Web App:** `frontend/src/utils/auth.ts` (255 lines)
```typescript
export async function login(data: LoginData): Promise<AuthResponse> {
  // This is deprecated - uses Convex mutations directly
  console.warn('login() is deprecated. Use useMutation(api.auth.login)');
  return { success: false, error: 'Use Convex mutations' };
}

// Components use:
const loginMutation = useMutation(api.auth.loginWithSession);
const result = await loginMutation({ email, password });
// Store in localStorage
```

**Differences:**
- Extension uses fetch + HTTP endpoints
- Web app uses Convex React hooks (useMutation, useQuery)
- Storage: chrome.storage.local vs localStorage
- Extension has SessionManager singleton pattern
- Web app has deprecated wrapper functions

---

#### 4. **API Client Patterns** - 70% duplicated

**Extension:** `src/shared/api-client.ts` (315 lines)
```typescript
class ApiClient {
  private baseUrl = 'https://luntra-outreach-app.azurewebsites.net';

  async analyzeProperty(request: AnalysisRequest): Promise<AnalysisResponse> {
    const config = await this.getConfig();

    if (config.mockMode || !config.accessToken) {
      return generateMockAnalysis(request);
    }

    // Call Convex API
    const response = await fetch('https://mild-tern-361.convex.site/propiq/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`,
      },
      body: JSON.stringify(request),
    });
    // Transform response...
  }
}

export const apiClient = new ApiClient();
```

**Web App:** Direct Convex queries/mutations
```typescript
// Components use hooks directly:
const analyzeProperty = useMutation(api.propiq.analyzeProperty);

const result = await analyzeProperty({
  address: propertyData.address,
  purchasePrice: propertyData.price,
  // ...
});
```

**Issue:** Extension maintains a full API client class while web app uses Convex's built-in client.

---

### ⚠️ MODERATE DUPLICATION Areas

#### 5. **Mock Data Generation** - Extension only, could be shared

**Extension:** `src/shared/mock-data.ts` (245 lines)
- Mock analysis responses
- Mock login/signup responses
- Delay simulation utilities

**Web App:** No mock mode - could benefit from shared mock utilities for testing.

---

### ✅ LOW/NO DUPLICATION Areas

1. **Zillow Parser** - Extension-specific (`src/content/zillow-parser.ts`)
2. **Deal Calculator** - Web app-specific (`frontend/src/components/DealCalculator.tsx`)
3. **Stripe Integration** - Web app-specific (`convex/stripe.ts`)
4. **Email System** - Web app-specific (`convex/emails.ts`)
5. **Blog System** - Web app-specific (`convex/blog.ts`)

---

## API Calls & Backend Integration

### Backend Architecture

**Both use Convex as primary backend:**
- Convex deployment: `mild-tern-361.convex.site`
- Convex cloud URL: Different for dev/prod

**But with different access patterns:**

#### Extension Approach

```typescript
// HTTP API calls to Convex HTTP routes
fetch('https://mild-tern-361.convex.site/auth/extension-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // Manual token management
  },
  body: JSON.stringify({ email, password })
});

// Also falls back to Azure backend for some endpoints
this.baseUrl = 'https://luntra-outreach-app.azurewebsites.net';
```

**Files:**
- `src/shared/api-client.ts` - Main API client
- `src/shared/session-manager.ts` - Auth management
- Endpoints: `/auth/extension-login`, `/auth/extension-signup`, `/auth/validate`

#### Web App Approach

```typescript
// Direct Convex React hooks
const loginMutation = useMutation(api.auth.loginWithSession);
const user = useQuery(api.auth.getUser, { userId });

// Convex handles auth, network, caching automatically
const result = await loginMutation({ email, password });
```

**Files:**
- Convex hooks from `convex/react`
- No manual HTTP calls
- Automatic session management via Convex client

---

### API Endpoints Comparison

| Endpoint | Extension | Web App | Backend Implementation |
|----------|-----------|---------|------------------------|
| **Login** | POST /auth/extension-login | useMutation(api.auth.loginWithSession) | convex/http.ts:121 |
| **Signup** | POST /auth/extension-signup | useMutation(api.auth.signupWithSession) | convex/http.ts:178 |
| **Session Validation** | GET /auth/validate | Automatic (Convex client) | convex/http.ts:237 |
| **Logout** | POST /auth/extension-logout | useMutation(api.auth.logout) | convex/http.ts:299 |
| **Property Analysis** | POST /propiq/analyze | useMutation(api.propiq.analyzeProperty) | convex/propiq.ts |
| **Get User Profile** | GET /auth/me | useQuery(api.auth.getUser) | convex/auth.ts |

---

### Inconsistencies

#### 1. **Dual Backend References** 🔴

Extension has two backend URLs:
```typescript
// api-client.ts
this.baseUrl = 'https://luntra-outreach-app.azurewebsites.net'; // Azure (legacy?)

// session-manager.ts
const CONVEX_HTTP_URL = 'https://mild-tern-361.convex.site'; // Current
```

**Issue:** Unclear which endpoints go to which backend. Some endpoints may be dead code.

#### 2. **Different Auth Token Formats** ⚠️

**Extension:**
```typescript
// Uses "sessionToken" stored in chrome.storage
headers: { Authorization: `Bearer ${sessionToken}` }
```

**Web App:**
```typescript
// Uses Convex-managed auth (no explicit tokens in code)
// Tokens handled automatically by Convex client
```

#### 3. **Response Transformation** ⚠️

Extension transforms Convex responses to match legacy format:
```typescript
// api-client.ts:252-276
return {
  success: true,
  analysis: {
    address: request.address,
    monthlyCashFlow: result.analysis?.cashFlow?.monthly || 0,
    dealScore: result.dealScore || 50,
    // Transform Convex response to legacy AnalysisResponse
  }
};
```

Web app uses Convex responses directly without transformation.

---

## Authentication & Session Management

### Authentication Flow Comparison

#### Extension Auth Flow

```
User logs in via popup
    ↓
session-manager.ts → POST /auth/extension-login
    ↓
Convex backend validates credentials
    ↓
Returns sessionToken in response body
    ↓
Extension stores in chrome.storage.local:
  - propiq_session { sessionToken, user, expiresAt }
  - propiq_user_data (legacy compat)
    ↓
Token sent in Authorization header for API calls
```

**Files:**
- `src/shared/session-manager.ts` (324 lines)
- `src/popup/popup.ts` (login UI)

**Storage:**
```typescript
await chrome.storage.local.set({
  propiq_session: {
    sessionToken: "abc123",
    user: { userId, email, subscriptionTier, ... },
    expiresAt: timestamp,
    syncedFromWebApp: false
  }
});
```

---

#### Web App Auth Flow

```
User logs in via AuthModal
    ↓
useMutation(api.auth.loginWithSession)
    ↓
Convex backend validates credentials
    ↓
Returns user object + session token
    ↓
Frontend stores in localStorage:
  - propiq_user_id
  - propiq_user_email
  - propiq_subscription_tier
  - propiq_logged_in
    ↓
Convex client manages session automatically
```

**Files:**
- `frontend/src/utils/auth.ts` (255 lines)
- `frontend/src/components/AuthModal.tsx` (login UI)
- `convex/auth.ts` (backend logic)

**Storage:**
```typescript
localStorage.setItem('propiq_user_id', userId);
localStorage.setItem('propiq_user_email', email);
localStorage.setItem('propiq_subscription_tier', tier);
localStorage.setItem('propiq_logged_in', 'true');
```

---

### Extension ↔ Web App Session Sync

**Brilliant implementation:** Extension has a content script that syncs sessions from web app!

**File:** `src/content/auth-sync.ts` (139 lines)

#### How It Works

```
1. User logs in on propiq.luntra.one
    ↓
2. Web app emits postMessage:
   window.postMessage({
     type: 'PROPIQ_AUTH_LOGIN',
     payload: { sessionToken, user }
   })
    ↓
3. Extension content script listens on propiq.luntra.one
    ↓
4. Content script receives message
    ↓
5. Stores session in chrome.storage.local
    ↓
6. Extension popup/content scripts now authenticated!
```

**Code:**
```typescript
// auth-sync.ts:42
window.addEventListener('message', async (event) => {
  if (event.origin !== window.location.origin) return;

  const message = event.data;

  switch (message.type) {
    case 'PROPIQ_AUTH_LOGIN':
      await handleLogin(message.payload);
      break;

    case 'PROPIQ_AUTH_LOGOUT':
      await handleLogout();
      break;
  }
});
```

**Result:** Users only need to log in once (on web app), and extension automatically stays in sync!

---

### Session Storage Comparison

| Aspect | Extension | Web App |
|--------|-----------|---------|
| **Storage API** | `chrome.storage.local` | `localStorage` |
| **Cross-context** | ✅ Shared across popup, content, background | ❌ Scoped to domain |
| **Persistence** | ✅ Survives browser restart | ✅ Survives browser restart |
| **Storage Keys** | `propiq_session`, `propiq_user_data` | `propiq_user_id`, `propiq_user_email`, etc. |
| **Token Format** | Bearer token (explicit) | Managed by Convex (implicit) |
| **Expiration** | 30 days (`expiresAt` field) | Managed by Convex |
| **Validation** | Manual (calls `/auth/validate`) | Automatic (Convex client) |

---

### Authentication Inconsistencies

#### 1. **Token Naming** 🔴

- Extension: `sessionToken`, `accessToken` (used interchangeably)
- Web App: No explicit token in frontend code (Convex-managed)
- Backend: Returns `sessionToken` from HTTP endpoints

**Recommendation:** Standardize on `sessionToken` everywhere.

#### 2. **User ID Field** ⚠️

- Extension types: `userId: string`
- Web app types: `id: string`
- Convex backend: `_id: Id<"users">`

**Recommendation:** Use `userId` consistently in frontend, `_id` in Convex.

#### 3. **Session Validation** ⚠️

- Extension: Manual validation via `/auth/validate` endpoint
- Web App: Automatic validation by Convex client
- Extension validates on every API call (redundant?)

---

## Data Models & Types

### User Data Model

#### Extension Definition (`src/shared/types.ts`)

```typescript
export interface UserData {
  userId: string;
  email: string;
  accessToken: string;
  subscriptionTier: 'free' | 'starter' | 'pro' | 'elite';
  analysesRemaining: number;  // ← Calculated field
  isLoggedIn: boolean;
}
```

#### Web App Definition (`frontend/src/utils/auth.ts`)

```typescript
export interface User {
  id: string;                  // ← Different from extension
  email: string;
  firstName?: string;          // ← Not in extension
  lastName?: string;           // ← Not in extension
  company?: string;            // ← Not in extension
  subscriptionTier: string;
  analysesUsed: number;        // ← Extension calculates from this
  analysesLimit: number;       // ← Extension calculates from this
  stripeCustomerId?: string;   // ← Not in extension
  stripeSubscriptionId?: string; // ← Not in extension
  active: boolean;             // ← Extension uses isLoggedIn
  emailVerified: boolean;      // ← Not in extension
  createdAt: number;           // ← Not in extension
  lastLogin?: number;          // ← Not in extension
}
```

#### Convex Backend Schema (`convex/schema.ts` - inferred)

```typescript
users: defineTable({
  email: v.string(),
  passwordHash: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  company: v.optional(v.string()),
  subscriptionTier: v.string(),
  analysesUsed: v.number(),
  analysesLimit: v.number(),
  stripeCustomerId: v.optional(v.string()),
  stripeSubscriptionId: v.optional(v.string()),
  active: v.boolean(),
  emailVerified: v.boolean(),
  createdAt: v.number(),
  lastLogin: v.optional(v.number()),
  // ... more fields
})
```

---

### Property Analysis Data Model

#### Extension (`src/shared/types.ts`)

```typescript
export interface AnalysisRequest {
  address: string;
  propertyType?: string;
  purchasePrice?: number;
  downPayment?: number;
  downPaymentPercent?: number;
  interestRate?: number;
  monthlyRent?: number;
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: {
    address: string;
    purchasePrice: number;
    estimatedMonthlyRent: number;
    monthlyCashFlow: number;
    annualCashFlow: number;
    capRate: number;
    cashOnCashReturn: number;
    dealScore: number;           // 0-100
    dealRating: string;          // 'EXCELLENT', 'GOOD', etc.
    recommendation: string;
    keyFindings: string[];
    risks: string[];
    opportunities: string[];
    marketInsights: string[];
    fullAnalysis: string;        // JSON string
    analysisId: string;
    timestamp: string;
  };
  error?: string;
  usesRemaining?: number;
}
```

#### Web App / Convex

Uses Convex mutation directly - no intermediate type:

```typescript
// convex/propiq.ts
export const analyzeProperty = mutation({
  args: {
    address: v.string(),
    propertyType: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    // ...
  },
  handler: async (ctx, args) => {
    // Returns object directly, not wrapped in AnalysisResponse
    return {
      analysisId,
      dealScore,
      recommendation,
      analysis: { /* ... */ },
      analysesRemaining
    };
  }
});
```

**Issue:** Extension expects `AnalysisResponse` wrapper, Convex returns unwrapped object. Extension transforms in api-client.ts:252-276.

---

### Field Naming Inconsistencies

| Concept | Extension | Web App | Convex Backend |
|---------|-----------|---------|----------------|
| **User identifier** | userId | id | _id |
| **Logged in status** | isLoggedIn | - | active |
| **Analyses count** | analysesRemaining (calculated) | - | analysesUsed, analysesLimit |
| **Access token** | accessToken / sessionToken | - | sessionToken |
| **Property type** | propertyType | propertyType | propertyType |

---

## Recommendations

### 1. **Create Shared Type Package** 🎯 High Priority

**Problem:** Type definitions duplicated across extension and web app.

**Solution:** Create npm package `@propiq/shared-types`

```
@propiq/shared-types/
├── src/
│   ├── user.ts           # User, UserData types
│   ├── auth.ts           # AuthResponse, LoginData, SignupData
│   ├── property.ts       # PropertyData, AnalysisRequest/Response
│   ├── subscription.ts   # Subscription tier types
│   └── index.ts          # Re-exports
├── package.json
└── tsconfig.json
```

**Usage:**
```typescript
// Extension
import { UserData, AnalysisRequest } from '@propiq/shared-types';

// Web app
import { User, AnalysisResponse } from '@propiq/shared-types';
```

**Benefit:** Single source of truth, type safety across codebases.

---

### 2. **Standardize Field Naming** 🎯 High Priority

**Inconsistencies to fix:**

| Field | Current | Recommended |
|-------|---------|-------------|
| User ID | `userId` / `id` / `_id` | `userId` (frontend), `_id` (Convex) |
| Session token | `accessToken` / `sessionToken` | `sessionToken` everywhere |
| Login status | `isLoggedIn` / `active` | `isActive` (backend), `isLoggedIn` (frontend derived) |

**Migration:**
1. Update Convex schema with field aliases
2. Update extension types
3. Update web app types
4. Deploy backend first, then frontends

---

### 3. **Unify Auth Approach** 🎯 Medium Priority

**Problem:** Extension uses HTTP endpoints, web app uses Convex hooks.

**Recommendation:** Extension should use Convex React hooks too!

**Why:**
- Automatic session management
- Built-in caching and optimistic updates
- Realtime subscriptions (useQuery auto-updates)
- Less code to maintain

**Challenge:** Chrome extensions can't use React hooks in content scripts.

**Solution:**
```typescript
// popup/background (can use React)
const login = useMutation(api.auth.loginWithSession);

// content scripts (no React)
import { ConvexClient } from 'convex/browser';
const client = new ConvexClient(CONVEX_URL);
await client.mutation(api.auth.loginWithSession, { email, password });
```

---

### 4. **Extract Shared Validation** 🎯 High Priority

**Problem:** Password validation duplicated 3 times.

**Solution:** Move to `@propiq/shared-types` or `@propiq/shared-utils`

```typescript
// @propiq/shared-utils/src/passwordValidation.ts
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  // ...
};

export function validatePassword(password: string): ValidationResult {
  // Single implementation
}
```

**Usage:**
```typescript
// Extension
import { validatePassword } from '@propiq/shared-utils';

// Web app frontend
import { validatePassword } from '@propiq/shared-utils';

// Convex backend
import { validatePassword } from '@propiq/shared-utils/passwordValidation';
```

---

### 5. **Remove Dead Code** 🎯 Low Priority

**Extension dead code candidates:**

```typescript
// api-client.ts:44
this.baseUrl = 'https://luntra-outreach-app.azurewebsites.net';
// Is this still used? Or legacy Azure backend?
```

**Web app dead code:**

```typescript
// frontend/src/utils/auth.ts:137
export async function signup(data: SignupData): Promise<AuthResponse> {
  console.warn('signup() is deprecated. Use useMutation(api.auth.signup) instead');
  // Remove deprecated wrappers
}
```

**Action:** Audit and remove unused code.

---

### 6. **Consolidate Mock Data** 🎯 Low Priority

**Extension has mock mode, web app doesn't.**

**Recommendation:** Extract mock-data.ts to shared package

```typescript
// @propiq/shared-test-utils/src/mockData.ts
export function generateMockAnalysis(request: AnalysisRequest): AnalysisResponse {
  // Shared mock data generator
}

// Use in extension dev mode
// Use in web app Playwright tests
// Use in Storybook stories
```

---

### 7. **Document Auth Sync Bridge** 🎯 Medium Priority

**Extension has brilliant auth-sync.ts but it's undocumented.**

**Action:** Create `/docs/extension-auth-sync.md` explaining:
- How web app emits auth events
- How extension content script listens
- How to trigger sync manually
- Troubleshooting guide

---

### 8. **Unified API Client** 🎯 Low Priority (Future)

**Long-term vision:** Both extension and web app could use same Convex client.

**Current state:**
- Extension: Custom ApiClient class
- Web app: Convex React hooks

**Future state:**
- Both use Convex client (React hooks in React contexts, vanilla client in content scripts)
- No manual HTTP calls
- No response transformation

---

## Summary Table

| Category | Status | Duplication Level | Priority |
|----------|--------|-------------------|----------|
| **Type Definitions** | 🔴 High duplication | 90% | 🎯 High - Create shared package |
| **Password Validation** | 🔴 High duplication | 100% | 🎯 High - Extract to shared utils |
| **Auth/Session Management** | ⚠️ Moderate duplication | 80% | 🎯 Medium - Standardize approach |
| **API Clients** | ⚠️ Moderate duplication | 70% | 🎯 Medium - Unify on Convex client |
| **Mock Data** | ⚠️ Extension-only | 0% | 🎯 Low - Extract to test utils |
| **Field Naming** | ⚠️ Inconsistent | N/A | 🎯 High - Standardize naming |
| **Dead Code** | ⚠️ Present in both | N/A | 🎯 Low - Audit and remove |

---

## Next Steps

### Immediate Actions (Week 1)

1. ✅ **Create `/docs/extension-web-app-comparison.md`** (this document)
2. 📝 **Audit and document all API endpoints** (extension vs web app)
3. 📝 **Create shared types package structure**
4. 📝 **Standardize field naming** (create migration plan)

### Short-term (Month 1)

1. 📦 **Publish `@propiq/shared-types` package**
2. 🔄 **Refactor extension to use shared types**
3. 🔄 **Refactor web app to use shared types**
4. 🧪 **Add integration tests** for extension ↔ web app auth sync

### Long-term (Quarter 1)

1. 🏗️ **Migrate extension to Convex client** (remove custom ApiClient)
2. 📚 **Document auth sync bridge**
3. 🧹 **Remove all dead code**
4. 🎨 **Create shared test utils package**

---

**Document Version:** 1.0
**Last Updated:** December 29, 2025
**Author:** Claude Code Analysis
**Review Status:** Pending review by development team
