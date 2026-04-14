# PropIQ — Claude Project Memory

## Project Overview
PropIQ is an AI-powered real estate investment analysis SaaS platform.
Live URL: propiq.luntra.one (migrating to propiqhq.com)

---

## Tech Stack

### Frontend
- React + TypeScript
- Hosted on Netlify
- Vite build system

### Backend
- Convex (deployment: mild-tern-361)
- All mutations, queries, and HTTP actions live in convex/
- Key files: convex/auth.ts, convex/http.ts, convex/schema.ts

### Transactional Email
- Resend API
- Verified sending domain: propiq.luntra.one
- From address: PropIQ <noreply@propiq.luntra.one>
- RESEND_API_KEY must be set in Convex production environment variables

---

## Critical Environment Variables

| Variable | Value | Purpose |
|---|---|---|
| VITE_CONVEX_URL | https://mild-tern-361.convex.cloud | Convex client hooks only |
| VITE_CONVEX_SITE_URL | https://mild-tern-361.convex.site | All HTTP action endpoints |

### ⚠️ Rule: Never use VITE_CONVEX_URL for fetch() calls
All HTTP fetch calls in the frontend must use VITE_CONVEX_SITE_URL.
Using VITE_CONVEX_URL for HTTP routes returns empty responses and causes JSON parse errors.

Both variables must be set in:
- frontend/.env.local (local development)
- Netlify dashboard (production builds)

---

## Auth System

### Working Flows
- Signup with email verification
- Email verification via token
- Login / logout
- Password reset (request + confirm)

### Auth Architecture
- Custom auth in convex/auth.ts (PBKDF2-SHA256 password hashing, 600k iterations)
- Session management in convex/sessions.ts
- HTTP endpoints in convex/http.ts
- Password requirements: 8+ chars, 1 uppercase, 1 number

### HTTP Endpoints (all on .convex.site)
- POST /auth/signup
- POST /auth/login
- POST /auth/logout
- POST /auth/verify-email
- POST /auth/request-password-reset
- POST /auth/reset-password
- GET /auth/me

### ⚠️ Rule: Every HTTP route needs an OPTIONS handler
Every POST route in convex/http.ts must have a matching OPTIONS handler for CORS preflight.
Missing OPTIONS handlers cause 404 preflight errors in the browser.

---

## Email Delivery

### Current Status
- Resend API key: configured in Convex production env vars
- SPF/DKIM/DMARC: configured on propiq.luntra.one
- Gmail delivery: confirmed working
- Outlook/Microsoft delivery: SPF+DKIM fix applied, unconfirmed

### Known Issue
- luntra.one (parent domain) is NOT verified in Resend
- Only propiq.luntra.one is verified
- All from addresses must use @propiq.luntra.one, not @luntra.one

---

## Domain Migration
- Current: propiq.luntra.one
- Target: propiqhq.com
- Status: Domain purchased, migration pending
- Blocker: DNS propagation time needed for SPF/DKIM/DMARC setup on propiqhq.com
- Do not migrate until propiqhq.com is fully verified in Resend

---

## Deployment

### Frontend (Netlify)
- Auto-deploys on git push to main
- Environment variables must be set in Netlify dashboard — .env.local is never deployed
- After any new env variable is added locally, it must also be added to Netlify dashboard

### Backend (Convex)
- Deploy with: npx convex deploy --prod
- Environment variables set at: dashboard.convex.dev/deployment/mild-tern-361/settings/environment-variables
- Changes to env vars take effect immediately — no redeploy needed

### Smoke Test After Every Deploy
1. curl POST /auth/request-password-reset → confirm 200 + JSON response
2. Check Resend dashboard → confirm email appears
3. Click reset link → confirm no JS errors
4. Complete reset → confirm redirect to login

---

## Development Rules

### Before Every Fix
1. Check Convex logs first: dashboard.convex.dev/deployment/mild-tern-361/logs
2. Reproduce with curl before touching code
3. Identify exact root cause before delegating to Claude Code

### Claude Code Rules
- Never let Claude Code push a fix without reviewing the diagnosis first
- Claude Code will pattern-match on code style — always validate against actual error symptoms
- Confirm changes with git diff before committing

### Credentials
- Never hardcode secrets in markdown files
- Pre-commit hook blocks commits with exposed credentials
- All secrets go in environment variables only

---

## Known Issues (as of April 13, 2026)
- [ ] Outlook email deliverability unconfirmed after SPF/DKIM fix
- [ ] propiqhq.com domain migration pending
- [ ] GDPR compliance not implemented (legal risk for EU users)
- [ ] CI/CD pipeline (GitHub Actions) failing — Playwright/Vite config issue

## Recently Resolved
- [x] Frontend using .convex.cloud instead of .convex.site for HTTP routes
- [x] Resend API key invalid in production
- [x] Missing SPF/DKIM on propiq.luntra.one
- [x] Missing OPTIONS handler for /auth/verify-email
- [x] Verification emails using unverified luntra.one domain
- [x] Password requirements too strict (now: 8 chars, 1 uppercase, 1 number)
- [x] 29 markdown files with exposed credentials (redacted)
