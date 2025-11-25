# External Network Audit Report

**Date:** 2025-11-24
**Auditor:** Claude Code
**Project:** PropIQ (propiq.luntra.one)
**Branch:** claude/audit-external-network-issues-01Fb8VwM9AZpHr93AwP4NH7b

---

## Executive Summary

This audit identifies issues that would cause problems for external users who are not on the developer's local network or VPN. The PropIQ application is a SaaS web app using React (Vite) frontend, Convex backend-as-a-service, and a legacy FastAPI backend on Azure.

**Overall Status: PRODUCTION-READY with minor improvements recommended**

The application is well-configured for external users. Most localhost references are appropriately scoped to development environments, documentation, or test files.

---

## Findings Table

| # | File/Location | Problem | Why it Breaks for External Users | Severity | Recommended Fix |
|---|---------------|---------|-----------------------------------|----------|-----------------|
| 1 | `frontend/src/config/api.ts:24` | Hardcoded `http://localhost:8000/api/v1` as default fallback | External users in development mode without `VITE_API_URL` set will fail to connect to API | **LOW** | Already properly gated behind `import.meta.env.PROD` check - no action needed |
| 2 | `convex/http.ts:20` | `IS_PRODUCTION = true` is hardcoded | Cannot easily switch between dev/prod CORS without code changes | **LOW** | Consider using environment variable: `const IS_PRODUCTION = process.env.NODE_ENV === 'production'` |
| 3 | `convex/http.ts:588` | Extension CORS uses `"*"` wildcard | Overly permissive - allows any origin to call extension endpoints | **MEDIUM** | Consider restricting to known Chrome extension origins or implementing origin validation |
| 4 | `backend/api.py:124` | `http://localhost:8000` in OpenAPI servers list | Swagger UI shows localhost as server option in production | **LOW** | Conditionally show based on environment |
| 5 | `backend/api.py:141-142` | Localhost origins in default CORS list | If `ALLOWED_ORIGINS` env var not set, localhost is allowed | **LOW** | Already handled - localhost in list doesn't hurt production, only dev fallback |
| 6 | `social-cli/linkedin-oauth.py:16` | `REDIRECT_URI = "http://localhost:8000/callback"` | OAuth callbacks will fail in production | **HIGH** (if used) | Make configurable via environment variable |
| 7 | `backend/render.yaml:75` | Contains localhost origins in ALLOWED_ORIGINS | Deployment manifest allows localhost connections | **LOW** | Remove localhost origins from production config |
| 8 | `backend/test_e2e_stripe.py:11` | `API_BASE_URL = "http://localhost:8000"` | Test file hardcoded to localhost | **N/A** | Test file - acceptable |
| 9 | Multiple `.env.template` files | Contain localhost defaults | External users need to update these values | **INFO** | Document clearly in README |
| 10 | `frontend/playwright.config.ts:31,84` | Hardcoded `http://localhost:5173` | E2E tests fail in CI without local server | **N/A** | Test config - acceptable |

---

## Detailed Analysis

### 1. Local-Only Dependencies Scan

#### Production Code Issues (Require Attention)

**File: `convex/http.ts`**
```typescript
// Line 20 - Hardcoded production flag
const IS_PRODUCTION = true;

// Lines 24-31 - CORS configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": IS_PRODUCTION
    ? "https://propiq.luntra.one"
    : "http://localhost:5173",
  // ...
};
```
**Status:** ACCEPTABLE - Production flag is correctly set to `true`, ensuring external users get the correct CORS origin.

**File: `frontend/src/config/api.ts`**
```typescript
// Lines 11-25 - API URL detection
const getApiBaseUrl = (): string => {
  // Production - CORRECT
  if (import.meta.env.PROD) {
    return 'https://luntra-outreach-app.azurewebsites.net/api/v1';
  }
  // Development fallback - ACCEPTABLE
  return 'http://localhost:8000/api/v1';
};
```
**Status:** CORRECT - Production builds will always use the Azure backend URL.

#### Extension CORS Security Concern

**File: `convex/http.ts:587-592`**
```typescript
const extensionCorsHeaders = {
  "Access-Control-Allow-Origin": "*",  // SECURITY: Overly permissive
  "Access-Control-Allow-Credentials": "false",
  // ...
};
```
**Recommendation:** While `"*"` is required for Chrome extensions (they can't be whitelisted by origin), consider:
1. Validating the request contains expected extension headers
2. Rate limiting extension endpoints more aggressively
3. Adding user agent validation

---

### 2. API and Frontend Configuration

#### CORS Configuration - CORRECTLY IMPLEMENTED

**Convex Backend (`convex/http.ts`):**
- Production origin: `https://propiq.luntra.one`
- Credentials: `false` (correct for Bearer token auth)
- Methods: `GET, POST, OPTIONS`
- Headers: `Content-Type, Authorization`

**FastAPI Backend (`backend/api.py`):**
- Loads from `ALLOWED_ORIGINS` environment variable
- Defaults include production domain `https://propiq.luntra.one`
- Credentials: `true` (for potential cookie use)
- Properly configured preflight cache (600s)

#### Mixed Content Check - PASS

All production URLs use HTTPS:
- Frontend: `https://propiq.luntra.one`
- Convex API: `https://[project].convex.cloud` / `.convex.site`
- Azure Backend: `https://luntra-outreach-app.azurewebsites.net`
- Stripe: `https://api.stripe.com`
- Azure OpenAI: `https://luntra-openai-service.openai.azure.com`

**No HTTP-only resources found in production paths.**

---

### 3. Environment/Config Pitfalls

#### Auth Callbacks & OAuth

| Service | Current Config | External User Impact | Status |
|---------|----------------|----------------------|--------|
| Convex Auth | Uses Bearer tokens via HTTP endpoints | Works for external users | **OK** |
| Stripe Checkout | Redirects to `propiq.luntra.one` | Works correctly | **OK** |
| LinkedIn OAuth (`social-cli/`) | Hardcoded `localhost:8000` | CLI tool - not user-facing | **N/A** |

#### Webhook Endpoints

| Webhook | URL | Status |
|---------|-----|--------|
| Stripe | `https://[convex-url]/stripe-webhook` | **OK** - Public endpoint |
| Slack | Uses `SLACK_WEBHOOK_URL` env var | **OK** - Configurable |
| Intercom | `https://luntra-outreach-app.azurewebsites.net/intercom/webhook` | **OK** - Public |

#### Cookie Configuration

The application correctly uses localStorage + Authorization Bearer tokens instead of cookies:

```typescript
// frontend/src/hooks/useAuth.tsx
// UPDATED: Uses localStorage + Authorization header instead of httpOnly cookies
// Because Convex is on a different domain (convex.site), cookies don't work.
```

**This is the correct approach** for cross-domain authentication with Convex and works reliably for external users.

---

### 4. Network & Firewall Assumptions

#### Services Architecture

```
External User → Netlify CDN (propiq.luntra.one)
                    ↓
             Convex Cloud (primary backend)
                    ↓
        ┌──────────┴──────────┐
        ↓                     ↓
   Azure OpenAI          Stripe API
   (AI analysis)         (payments)
```

All services are publicly accessible cloud services. **No LAN-only dependencies found.**

#### Database Access

| Database | Access Method | External User Impact |
|----------|---------------|---------------------|
| Convex DB | Via Convex Cloud | **OK** - Managed service |
| MongoDB Atlas (legacy) | Via Convex/Azure Backend | **OK** - Cloud hosted |
| Supabase (legacy) | Via Azure Backend | **OK** - Cloud hosted |
| Redis (optional) | Via Azure Backend | **OK** - Cloud hosted |

**Note:** Legacy backends are being phased out in favor of Convex. All database access is properly configured for external access via cloud services.

---

### 5. Browser & Device Perspective

#### DNS & SSL Requirements

| Check | Status | Notes |
|-------|--------|-------|
| Domain resolves publicly | **PASS** | `propiq.luntra.one` resolves correctly |
| SSL certificate valid | **PASS** | Served via Netlify with auto-SSL |
| HSTS enabled | **PASS** | Backend adds HSTS header in production |
| Mixed content | **PASS** | All resources served via HTTPS |

#### Non-Standard Ports

All services use standard HTTPS (port 443). No unusual ports required.

#### Browser Compatibility

| Feature | Requirement | Status |
|---------|-------------|--------|
| localStorage | Required for auth tokens | **OK** - Widely supported |
| Fetch API | Required for API calls | **OK** - Widely supported |
| WebSocket | Required for Convex real-time | **OK** - Widely supported |
| ES6+ JavaScript | Required | **OK** - Vite builds with targets |

#### Mobile Device Considerations

- Responsive design: Implemented via Tailwind CSS
- Touch interactions: Using standard HTML elements
- Network resilience: 30s timeout on API calls (`frontend/src/config/api.ts:36`)

---

### 6. Files Safe to Ignore

The following localhost references are **not issues** for external users:

| Category | Examples | Reason |
|----------|----------|--------|
| Documentation | `README.md`, `DEPLOYMENT_GUIDE.md`, etc. | Developer instructions |
| Test files | `*.spec.ts`, `test_*.py` | Only run in dev environment |
| Config templates | `.env.template`, `.env.example` | Templates need customization |
| CI/CD | `.github/workflows/` | Build-time only |
| Scripts | `test_onboarding.sh`, `deploy_*.sh` | Developer tools |
| OpenAPI docs | `backend/api.py` servers list | Shows both dev/prod options |

---

## Prioritized Checklist

### Priority 1: Must Fix Before External Testers (Critical)

- [x] **CORS configured for production domain** - Already correct (`https://propiq.luntra.one`)
- [x] **API base URL uses production endpoint** - Already correct in production builds
- [x] **SSL/TLS enabled** - Netlify auto-SSL configured
- [x] **Auth tokens work cross-origin** - Using localStorage + Bearer tokens correctly
- [x] **Webhook endpoints publicly accessible** - Convex and Azure endpoints are public

### Priority 2: Should Fix (Medium)

- [ ] **Review extension CORS wildcard** (`convex/http.ts:588`)
  - Consider adding request validation for extension endpoints
  - Add rate limiting specific to extension routes

- [ ] **Remove localhost from production CORS** (`backend/render.yaml:75`)
  ```yaml
  # Change from:
  value: http://localhost:5173,http://localhost:3000,https://luntra.one,https://propiq.luntra.one
  # To:
  value: https://luntra.one,https://propiq.luntra.one
  ```

- [ ] **Make IS_PRODUCTION configurable** (`convex/http.ts:20`)
  ```typescript
  // Change from:
  const IS_PRODUCTION = true;
  // To:
  const IS_PRODUCTION = process.env.CONVEX_ENV === 'production';
  ```

### Priority 3: Nice to Have (Low)

- [ ] **Conditionally show OpenAPI servers** (`backend/api.py:118-127`)
  - Only show localhost server in development mode

- [ ] **Update LinkedIn OAuth CLI** (`social-cli/linkedin-oauth.py:16`)
  - Make `REDIRECT_URI` configurable via environment variable
  - This is a developer CLI tool, so low priority

### Priority 4: Documentation Only

- [ ] **Document env var requirements** for external developers
- [ ] **Add production deployment checklist** to README

---

## Conclusion

**The PropIQ application is ready for external users.** The architecture correctly separates development and production configurations, with all critical external-facing components properly configured:

1. **Frontend** correctly detects production environment and uses HTTPS backend URLs
2. **Convex backend** has CORS properly configured for `propiq.luntra.one`
3. **Authentication** uses localStorage + Bearer tokens, avoiding cross-domain cookie issues
4. **All external services** (Stripe, Azure OpenAI, SendGrid) are cloud-hosted and publicly accessible
5. **SSL/TLS** is enforced across all production endpoints

The minor issues identified (extension CORS wildcard, localhost in some config files) do not prevent external users from using the application but should be addressed for security hardening.

---

## Appendix: Files Reviewed

### Production Code (Critical)
- `convex/http.ts` - HTTP endpoints and CORS
- `frontend/src/config/api.ts` - API configuration
- `frontend/src/hooks/useAuth.tsx` - Authentication
- `backend/api.py` - FastAPI main application

### Configuration Files
- `convex.json` - Convex deployment config
- `backend/render.yaml` - Render deployment manifest
- `frontend/netlify.toml` - Netlify configuration
- Various `.env.template` files

### Test Files (Not blocking)
- `frontend/tests/*.spec.ts` - Playwright tests
- `backend/tests/**/*.py` - Python tests
