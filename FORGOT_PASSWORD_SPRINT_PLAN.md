# Forgot Password Sprint Plan

## Overview

This sprint plan outlines the implementation of a secure "Forgot Password" flow for PropIQ. The feature enables users to reset their password via email verification when they cannot remember their credentials.

---

## Current State Analysis

### Existing Infrastructure
- **Authentication**: Convex-based with PBKDF2-SHA256 password hashing (600k iterations)
- **Email**: SendGrid configured with onboarding email templates
- **Frontend**: React + TypeScript with login/signup pages
- **Sessions**: Server-side session management in Convex

### Key Files
| Component | File Path |
|-----------|-----------|
| Convex Schema | `convex/schema.ts` |
| Auth Mutations | `convex/auth.ts` |
| HTTP Endpoints | `convex/http.ts` |
| Sessions | `convex/sessions.ts` |
| Login Page | `frontend/src/pages/LoginPage.tsx` |
| Auth Hook | `frontend/src/hooks/useAuth.tsx` |
| Email Templates | `backend/utils/onboarding_emails.py` |
| Email Router | `backend/routers/email.py` |

---

## Sprint Scope

### User Stories

1. **US-1**: As a user who forgot my password, I want to request a password reset email so I can regain access to my account.
2. **US-2**: As a user, I want to receive a secure reset link via email within minutes of requesting it.
3. **US-3**: As a user, I want to set a new password using the reset link so I can log in again.
4. **US-4**: As a user, I want clear feedback throughout the process so I know the status of my request.

### Acceptance Criteria

- [ ] "Forgot Password?" link visible on login page
- [ ] Email input form with validation
- [ ] Success message shown regardless of email existence (prevents enumeration)
- [ ] Reset email sent within 60 seconds
- [ ] Reset link expires after 1 hour
- [ ] Reset link is single-use (invalidated after use)
- [ ] New password must meet existing password requirements (8+ chars, uppercase, lowercase, digit)
- [ ] User is logged in automatically after successful password reset
- [ ] All existing sessions are invalidated on password reset (security measure)

---

## Technical Design

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FORGOT PASSWORD FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. REQUEST RESET                                                            │
│  ┌──────────┐    POST /auth/forgot-password    ┌──────────────────┐         │
│  │  User    │ ──────────────────────────────▶  │  Convex Backend  │         │
│  │  (Email) │                                  │                  │         │
│  └──────────┘                                  │  - Validate email│         │
│       │                                        │  - Generate token│         │
│       │                                        │  - Store in DB   │         │
│       │                                        │  - Send email    │         │
│       ▼                                        └──────────────────┘         │
│  "Check your email"                                    │                    │
│  (same msg regardless                                  │                    │
│   of email existence)                                  ▼                    │
│                                                 ┌──────────────┐            │
│  2. EMAIL RECEIVED                              │   SendGrid   │            │
│  ┌──────────────────────────────────────────────┴──────────────┘            │
│  │  Subject: Reset your PropIQ password                                     │
│  │  Body: Click here to reset (link valid 1 hour)                          │
│  │  Link: https://propiq.luntra.one/reset-password?token=xxx               │
│  └──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  3. RESET PASSWORD                                                           │
│  ┌──────────┐   GET /reset-password?token=xxx   ┌──────────────────┐        │
│  │  User    │ ─────────────────────────────────▶│   Frontend       │        │
│  │ (clicks) │                                   │                  │        │
│  └──────────┘                                   │  - Validate token│        │
│       │                                         │  - Show form     │        │
│       │                                         └──────────────────┘        │
│       ▼                                                                     │
│  ┌──────────────────┐  POST /auth/reset-password  ┌─────────────────┐       │
│  │ New Password Form│ ────────────────────────────▶│ Convex Backend │       │
│  │                  │                              │                │       │
│  └──────────────────┘                              │ - Verify token │       │
│       │                                            │ - Hash password│       │
│       │                                            │ - Invalidate   │       │
│       ▼                                            │   all sessions │       │
│  Success → Auto-login                              │ - Create new   │       │
│                                                    │   session      │       │
│                                                    └─────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Schema Changes

Add `passwordResetTokens` table to `convex/schema.ts`:

```typescript
passwordResetTokens: defineTable({
  userId: v.id("users"),
  tokenHash: v.string(),        // SHA-256 hash of the token (not plaintext)
  expiresAt: v.number(),        // Unix timestamp (1 hour from creation)
  used: v.boolean(),            // Single-use enforcement
  createdAt: v.number(),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
})
  .index("by_token_hash", ["tokenHash"])
  .index("by_user", ["userId"])
  .index("by_expires", ["expiresAt"]),
```

### Security Considerations

| Risk | Mitigation |
|------|------------|
| Email enumeration | Same response regardless of email existence |
| Token brute-force | 64-byte cryptographically random token |
| Token theft | Store hash only, short expiration (1 hour) |
| Replay attacks | Single-use tokens (marked `used: true` after consumption) |
| Session hijacking | Invalidate ALL sessions on password reset |
| Rate limiting | Max 3 requests per email per hour |

---

## Implementation Tasks

### Story 1: Backend - Database & Core Logic

#### Task 1.1: Update Convex Schema
**File**: `convex/schema.ts`
**Effort**: S (Small)

- Add `passwordResetTokens` table with fields:
  - `userId`, `tokenHash`, `expiresAt`, `used`, `createdAt`, `ipAddress`, `userAgent`
- Add indexes: `by_token_hash`, `by_user`, `by_expires`

#### Task 1.2: Create Password Reset Mutations
**File**: `convex/passwordReset.ts` (new)
**Effort**: M (Medium)

Create new file with:
- `requestPasswordReset` mutation
  - Accepts email
  - Generates 64-byte random token
  - Stores SHA-256 hash of token
  - Returns token (plaintext) for email
  - Invalidates any existing tokens for this user
- `validateResetToken` query
  - Accepts token
  - Verifies token hash exists, not expired, not used
  - Returns user email (for display) or null
- `resetPassword` mutation
  - Accepts token and new password
  - Validates token
  - Hashes new password with PBKDF2-SHA256
  - Updates user password
  - Marks token as used
  - Deletes ALL user sessions (security)
  - Creates new session
  - Returns session token for auto-login

#### Task 1.3: Add HTTP Endpoints
**File**: `convex/http.ts`
**Effort**: S (Small)

Add endpoints:
- `POST /auth/forgot-password` - Request reset email
- `GET /auth/validate-reset-token` - Check if token is valid
- `POST /auth/reset-password` - Reset password with token

### Story 2: Backend - Email Integration

#### Task 2.1: Create Password Reset Email Template
**File**: `backend/utils/password_reset_email.py` (new)
**Effort**: S (Small)

Create HTML email template matching existing onboarding style:
- Subject: "Reset your PropIQ password"
- Clear CTA button with reset link
- Security notice (didn't request this? ignore)
- Expiration warning (1 hour)
- Support contact

#### Task 2.2: Create Email Sending Endpoint
**File**: `backend/routers/password_reset.py` (new)
**Effort**: S (Small)

FastAPI router with:
- `POST /password-reset/send-email` - Internal endpoint called by Convex
  - Accepts: email, reset_token, user_name
  - Sends via SendGrid
  - Returns success/failure

#### Task 2.3: Wire Up Convex to Call Email API
**File**: `convex/passwordReset.ts`
**Effort**: S (Small)

Add action to call FastAPI email endpoint:
- `sendPasswordResetEmail` action
  - Calls FastAPI `/password-reset/send-email`
  - Handles errors gracefully

### Story 3: Frontend - Request Reset Flow

#### Task 3.1: Add Forgot Password Link to Login Page
**File**: `frontend/src/pages/LoginPage.tsx`
**Effort**: XS (Extra Small)

- Add "Forgot password?" link below password field
- Link to `/forgot-password` route

#### Task 3.2: Create Forgot Password Page
**File**: `frontend/src/pages/ForgotPasswordPage.tsx` (new)
**Effort**: M (Medium)

New page with:
- Email input field with validation
- Submit button
- Loading state
- Success message (same regardless of email existence)
- Link back to login
- Match existing design system (slate/violet theme)

#### Task 3.3: Add Route Configuration
**File**: `frontend/src/App.tsx` (or routes config)
**Effort**: XS (Extra Small)

- Add `/forgot-password` route → ForgotPasswordPage
- Add `/reset-password` route → ResetPasswordPage

### Story 4: Frontend - Reset Password Flow

#### Task 4.1: Create Reset Password Page
**File**: `frontend/src/pages/ResetPasswordPage.tsx` (new)
**Effort**: M (Medium)

New page with:
- Extract token from URL query params
- Validate token on mount (show error if invalid/expired)
- New password input with strength indicator
- Confirm password input
- Submit button
- Success state with auto-redirect to /app
- Loading and error states
- Match existing design system

#### Task 4.2: Add Password Validation
**File**: `frontend/src/utils/validation.ts` (new or existing)
**Effort**: XS (Extra Small)

Reuse/extract password validation logic:
- Min 8 characters
- Max 128 characters
- Contains uppercase, lowercase, digit
- Strength indicator (Weak/Good/Strong)

#### Task 4.3: Update useAuth Hook
**File**: `frontend/src/hooks/useAuth.tsx`
**Effort**: S (Small)

Add methods:
- `requestPasswordReset(email: string): Promise<{ success: boolean }>`
- `resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }>`

### Story 5: Testing & Documentation

#### Task 5.1: Backend Unit Tests
**File**: `convex/passwordReset.test.ts` (new)
**Effort**: M (Medium)

Test cases:
- Token generation produces valid format
- Token hash is stored, not plaintext
- Expired tokens are rejected
- Used tokens are rejected
- Password is updated correctly
- All sessions are invalidated
- Rate limiting works

#### Task 5.2: E2E Tests
**File**: `frontend/e2e/forgot-password.spec.ts` (new)
**Effort**: M (Medium)

Playwright tests:
- Complete forgot password flow (happy path)
- Invalid email format shows error
- Invalid/expired token shows error
- Password mismatch shows error
- Successful reset redirects to app

#### Task 5.3: Update API Documentation
**Effort**: S (Small)

Document new endpoints:
- `POST /auth/forgot-password`
- `GET /auth/validate-reset-token`
- `POST /auth/reset-password`

---

## Sprint Breakdown

### Sprint 1: Backend Foundation (3-4 story points)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| 1.1 Schema Update | P0 | S | None |
| 1.2 Core Mutations | P0 | M | 1.1 |
| 1.3 HTTP Endpoints | P0 | S | 1.2 |

**Definition of Done**:
- Convex schema deployed
- Mutations testable via Convex dashboard
- HTTP endpoints return expected responses

### Sprint 2: Email Integration (2-3 story points)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| 2.1 Email Template | P0 | S | None |
| 2.2 Email Router | P0 | S | 2.1 |
| 2.3 Convex→Email | P0 | S | 1.2, 2.2 |

**Definition of Done**:
- Password reset emails send successfully
- Email matches brand styling
- Links work correctly

### Sprint 3: Frontend Implementation (4-5 story points)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| 3.1 Login Link | P0 | XS | None |
| 3.2 Forgot Page | P0 | M | 3.1 |
| 3.3 Route Config | P0 | XS | 3.2 |
| 4.1 Reset Page | P0 | M | 3.3 |
| 4.2 Validation | P1 | XS | None |
| 4.3 Auth Hook | P0 | S | Sprint 1 |

**Definition of Done**:
- All pages styled consistently
- Forms validate correctly
- Loading/error states work
- Successful reset logs user in

### Sprint 4: Testing & Polish (2-3 story points)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| 5.1 Backend Tests | P1 | M | Sprint 1, 2 |
| 5.2 E2E Tests | P1 | M | Sprint 3 |
| 5.3 Documentation | P2 | S | All |

**Definition of Done**:
- Tests pass in CI
- No critical bugs
- Documentation complete

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `convex/passwordReset.ts` | Reset mutations, queries, actions |
| `frontend/src/pages/ForgotPasswordPage.tsx` | Request reset UI |
| `frontend/src/pages/ResetPasswordPage.tsx` | Set new password UI |
| `backend/utils/password_reset_email.py` | Email template |
| `backend/routers/password_reset.py` | Email sending router |
| `frontend/e2e/forgot-password.spec.ts` | E2E tests |

### Modified Files
| File | Changes |
|------|---------|
| `convex/schema.ts` | Add `passwordResetTokens` table |
| `convex/http.ts` | Add 3 new endpoints |
| `frontend/src/pages/LoginPage.tsx` | Add "Forgot password?" link |
| `frontend/src/hooks/useAuth.tsx` | Add reset methods |
| `frontend/src/App.tsx` | Add routes |
| `backend/main.py` | Include password reset router |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Email delivery issues | Medium | High | Use SendGrid's reliable infrastructure; add retry logic |
| Token security vulnerabilities | Low | Critical | Follow OWASP guidelines; security review before deploy |
| User confusion with flow | Medium | Medium | Clear UI messaging; progress indicators |
| Rate limit abuse | Medium | Low | Implement proper rate limiting per email/IP |

---

## Success Metrics

- **Completion Rate**: >90% of users who request reset complete the flow
- **Time to Reset**: <5 minutes from request to successful login
- **Error Rate**: <1% of reset attempts fail due to technical issues
- **Security**: 0 unauthorized password changes

---

## Rollout Plan

1. **Development**: Implement all features on feature branch
2. **Staging**: Deploy to staging environment for QA
3. **Security Review**: Internal security audit of token handling
4. **Soft Launch**: Enable for 10% of users (feature flag)
5. **Full Launch**: Roll out to all users after 24-hour monitoring
6. **Documentation**: Update user-facing help docs

---

## Dependencies

- SendGrid API key configured (`SENDGRID_API_KEY`)
- Frontend domain configured for email links (`https://propiq.luntra.one`)
- Convex deployment access

---

## Appendix: Token Generation Code Reference

```typescript
// Generate cryptographically secure 64-byte token
function generateResetToken(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Hash token for storage (never store plaintext)
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
```

---

*Last Updated: November 2025*
*Author: PropIQ Engineering Team*
