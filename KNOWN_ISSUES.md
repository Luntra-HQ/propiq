# PropIQ Known Issues & Technical Debt
**Comprehensive Bug Tracker and Technical Debt Registry**

**Last Updated:** January 5, 2026
**Production Status:** UAT in Progress
**Next Review:** After P0 UAT completion

---

## Executive Summary

**Total Issues Tracked:** 47 (from November 2025 audit)
**P0 Resolved:** 11/12 (92%)
**P1 Open:** 18 issues
**P2 Open:** 17 issues
**Recent Fixes:** 14 issues resolved (December 2025 - January 2026)

**Launch Blockers:**
- ✅ Stripe webhook security: **FIXED** (Jan 5)
- ✅ Analysis race condition: **FIXED** (Jan 5)
- ✅ Email verification: **FIXED** (Jan 5)
- ✅ Password reset flow: **FIXED** (Dec 2025)
- ⚠️ **GDPR compliance: PENDING** (only remaining P0)
- ⚠️ **CI/CD pipeline failing: NEEDS FIX** (blocking deployments)

---

## Table of Contents

1. [P0 Issues (Blockers)](#p0-issues-blockers)
2. [P1 Issues (Critical)](#p1-issues-critical)
3. [P2 Issues (Important)](#p2-issues-important)
4. [P3 Issues (Nice-to-Have)](#p3-issues-nice-to-have)
5. [Recently Resolved](#recently-resolved)
6. [Technical Debt](#technical-debt)
7. [Infrastructure Issues](#infrastructure-issues)

---

## P0 Issues (Blockers)

**Must fix before accepting real payments or launching to public**

### 🔴 OPEN P0 Issues (2)

#### P0-001: GDPR Compliance Not Implemented
**RICE Score:** 2400 (Reach: 500, Impact: 3.0, Confidence: 100%, Effort: 2.0)
**Status:** ❌ OPEN
**Priority:** P0 - Blocker
**Reported:** November 29, 2025

**Problem:**
- No data export endpoint (users can't download their data)
- No data deletion endpoint (users can't delete their accounts)
- No privacy policy page
- No cookie consent banner
- GDPR compliance required for EU users

**Impact:**
- Legal risk: GDPR fines up to €20M or 4% of revenue
- Cannot accept EU users without compliance
- Blocks launch in European markets

**Recommended Fix:**
1. Create `/api/data-export` endpoint (Convex action)
2. Create `/api/delete-account` endpoint (Convex mutation)
3. Add privacy policy page (Markdown in Help Center)
4. Implement cookie consent banner (React component)
5. Add "Download my data" and "Delete account" buttons to settings

**Effort:** 2 weeks (1 week backend, 1 week frontend + legal review)

**Files to Create:**
- `convex/gdpr.ts` - Data export/deletion mutations
- `frontend/src/pages/PrivacyPolicy.tsx`
- `frontend/src/components/CookieConsent.tsx` (already exists - verify compliance)
- `frontend/src/pages/Settings.tsx` - Add GDPR buttons

---

#### P0-002: GitHub Actions CI/CD Failing
**RICE Score:** N/A (Infrastructure)
**Status:** ❌ OPEN
**Priority:** P0 - Blocking Deployments
**Reported:** January 5, 2026

**Problem:**
- GitHub Actions CI failing on every commit
- Playwright trying to start Vite dev server in CI environment
- Node.js crypto.hash error (Vite 7 compatibility)
- Netlify deployments blocked by test enforcement

**Error:**
```
TypeError: crypto.hash is not a function
Error: Process from config.webServer was not able to start. Exit code: 1
```

**Impact:**
- Can't deploy new changes to production
- All commits show red X in GitHub
- Test enforcement working as designed, but tests can't run

**Root Cause:**
- Playwright config expects dev server (localhost:5173)
- CI environment can't start Vite dev server
- Vite 7 requires Node.js 20.19+ with crypto.hash support

**Recommended Fix:**
1. Update `playwright.config.ts`:
   - Detect CI environment (`process.env.CI`)
   - Skip `webServer` in CI
   - Use production URL for tests: `https://propiq.luntra.one`
2. Update GitHub Actions workflow:
   - Set `PLAYWRIGHT_BASE_URL=https://propiq.luntra.one`
   - Remove dev server start command
3. Verify tests pass against production

**Effort:** 4-8 hours

**Files to Modify:**
- `frontend/playwright.config.ts` (lines 10-30)
- `.github/workflows/ci.yml` (lines 30-50)

---

### ✅ RESOLVED P0 Issues (11)

#### P0-003: Stripe Webhook Signature Not Verified ✅ FIXED
**Status:** ✅ RESOLVED (January 5, 2026)
**RICE Score:** 3000

**Problem:** Webhook signature not verified - attackers could send fake events and upgrade accounts for free

**Fix Applied:**
- Implemented HMAC-SHA256 signature verification
- Added timestamp validation (5-minute window)
- Added replay attack prevention
- Added comprehensive event logging

**Files Modified:**
- `convex/http.ts` (lines 600-715)

**Documentation:** `STRIPE_WEBHOOK_SECURITY_FIX_2026-01-05.md`

---

#### P0-004: Analysis Race Condition ✅ FIXED
**Status:** ✅ RESOLVED (January 5, 2026)
**RICE Score:** 1200

**Problem:** Users could bypass analysis limits by clicking "Analyze" multiple times rapidly

**Fix Applied:**
- Implemented atomic slot reservation pattern
- Created `reserveAnalysisSlot()` mutation (check + increment in single transaction)
- Added rollback mechanism (`refundAnalysisSlot()`)
- Tested: 10+ rapid clicks only consumed 1 slot

**Files Modified:**
- `convex/propiq.ts` (lines 132-209)

**Documentation:** `RACE_CONDITION_FIX_2026-01-05.md`

---

#### P0-005: Email Verification Not Implemented ✅ FIXED
**Status:** ✅ RESOLVED (January 5, 2026)
**RICE Score:** 400

**Problem:** Users could create accounts with fake emails, preventing password recovery

**Fix Applied:**
- Added `emailVerifications` table to schema
- Created 3 backend mutations (create, verify, resend)
- Created 2 HTTP endpoints (verify-email, resend-verification)
- Built 3 frontend components (VerifyEmail, ResendVerification, ResendVerificationBanner)
- Integrated Resend API for email delivery
- Added security: rate limiting (5/hour), token expiry (24h), one-time use

**Files Modified:**
- `convex/schema.ts`, `convex/auth.ts`, `convex/http.ts`
- `frontend/src/pages/VerifyEmail.tsx` (NEW)
- `frontend/src/components/ResendVerification.tsx` (NEW)

**Testing:** 7/7 automated tests passing

**Documentation:** `EMAIL_VERIFICATION_IMPLEMENTATION_2026-01-05.md`

**Pending:** Resend domain configuration (15 minutes)

---

#### P0-006: No Password Reset Flow ✅ FIXED
**Status:** ✅ RESOLVED (December 2025)
**RICE Score:** 600

**Fix Applied:**
- Built token-based password reset flow
- Added `passwordResets` table
- Created reset request and reset password endpoints
- Built frontend pages (ForgotPasswordPage, ResetPasswordPage)
- Added security: 15-minute token expiry, one-time use

---

#### P0-007: Subscription Cancellation Doesn't Work ✅ FIXED
**Status:** ✅ RESOLVED (January 5, 2026)
**RICE Score:** 800

**Fix Applied:**
- Implemented `customer.subscription.deleted` webhook handler
- Downgrade user to free tier on cancellation
- Reset analysis limits to 3
- Clear Stripe customer/subscription IDs

**Files Modified:**
- `convex/http.ts` (Stripe webhook handler)

---

#### P0-008: No Database Index for stripeCustomerId ✅ FIXED
**Status:** ✅ RESOLVED (December 2025)
**RICE Score:** 4000

**Fix Applied:**
- Added index: `by_stripe_customer` on users table
- Webhook lookups now O(log n) instead of O(n)

**Files Modified:**
- `convex/schema.ts` (line 39)

---

#### P0-009: Charges for Failed Analyses ✅ FIXED
**Status:** ✅ RESOLVED (January 5, 2026)
**RICE Score:** 1200

**Fix Applied:**
- Implemented refund mechanism in race condition fix
- If analysis fails after slot reserved, slot is automatically refunded
- Non-blocking - doesn't fail if refund fails

---

#### P0-010: No First-Time Onboarding ✅ FIXED
**Status:** ✅ RESOLVED (December 2025)
**RICE Score:** 1000

**Fix Applied:**
- Built 7-task onboarding checklist
- Added product tour (optional)
- Created `onboardingProgress` table
- Built `OnboardingChecklist.tsx` component

---

#### P0-011: Weak Password Validation ✅ FIXED
**Status:** ✅ RESOLVED (December 2025)
**RICE Score:** 1000

**Fix Applied:**
- Minimum 8 characters
- Requires: uppercase, lowercase, number
- Backend + frontend validation

---

#### P0-012: No "Forgot Password" Link ✅ FIXED
**Status:** ✅ RESOLVED (December 2025)
**RICE Score:** 400

**Fix Applied:**
- Added "Forgot Password?" link to LoginPage
- Links to ForgotPasswordPage

---

#### P0-013: Environment Variables Not Documented ✅ FIXED
**Status:** ✅ RESOLVED (December 2025)
**RICE Score:** 12

**Fix Applied:**
- Created `.env.local.example`
- Documented all required variables in README.md
- Added to PROJECT_BRIEF.md

---

## P1 Issues (Critical)

**Fix within first week of launch**

### 🔴 OPEN P1 Issues (18)

#### P1-001: No Retry Button for Failed Analyses
**RICE Score:** 400 (Reach: 200, Impact: 1.0, Confidence: 100%, Effort: 0.5)
**Status:** ❌ OPEN
**Priority:** P1 - High

**Problem:**
- If analysis fails (OpenAI timeout, network error, etc.), user has no way to retry
- Must refresh page or start over
- Analysis slot already consumed

**Impact:**
- Poor user experience
- Lost analyses (user charged but got no result)

**Recommended Fix:**
- Add "Retry" button to error state
- Reuse same analysis slot (don't charge twice)
- Show error message with retry option

**Effort:** 4 hours

**Files to Modify:**
- `frontend/src/pages/AnalysisPage.tsx`
- `convex/propiq.ts` (add retry logic)

---

#### P1-002: No Analysis History UI
**RICE Score:** 400 (Reach: 400, Impact: 1.0, Confidence: 100%, Effort: 1.0)
**Status:** ❌ OPEN
**Priority:** P1 - High

**Problem:**
- Backend saves all analyses to `propertyAnalyses` table
- Query exists: `getAnalysisHistory`
- But no frontend UI to display history

**Impact:**
- Users can't review past analyses
- Can't compare properties side-by-side
- Feature exists but unusable

**Recommended Fix:**
- Create `AnalysisHistoryPage.tsx`
- Add "History" link to navigation
- Display table with: address, date, deal score, actions (view, delete)
- Add search/filter functionality

**Effort:** 1 week

**Files to Create:**
- `frontend/src/pages/AnalysisHistoryPage.tsx`

---

#### P1-003: Pricing FAQ Contradicts Unlimited Model
**RICE Score:** 1000 (Reach: 500, Impact: 0.5, Confidence: 100%, Effort: 0.25)
**Status:** ❌ OPEN
**Priority:** P1 - High

**Problem:**
- Pricing page mentions "unlimited analyses" in some places
- But pricing tiers are usage-based (20/100/300 per month)
- Confusing messaging - which is correct?

**Impact:**
- User confusion
- Potential legal issue if advertised as "unlimited" but actually limited
- Trust issues

**Recommended Fix:**
- Audit all copy on pricing page
- Standardize messaging: "20 analyses/month" (NOT "unlimited")
- Remove any "unlimited" references unless all paid tiers are truly unlimited

**Effort:** 2 hours

**Files to Modify:**
- `frontend/src/pages/PricingPagePublic.tsx`
- `frontend/src/config/pricing.ts` (copy in CONVERSION_COPY)

---

#### P1-004: No Payment Confirmation Message
**RICE Score:** 200 (Reach: 100, Impact: 1.0, Confidence: 100%, Effort: 0.5)
**Status:** ❌ OPEN
**Priority:** P1 - High

**Problem:**
- After Stripe checkout, user redirected to dashboard
- No confirmation message shown
- User confused: "Did my payment go through?"

**Impact:**
- User anxiety
- Support tickets: "I paid but not sure if it worked"

**Recommended Fix:**
- Add success banner after redirect: "Welcome to PropIQ Pro! Your payment was successful."
- Auto-dismiss after 10 seconds
- Show new tier and limits

**Effort:** 4 hours

**Files to Modify:**
- `frontend/src/App.tsx` (detect success redirect, show banner)
- `frontend/src/components/SuccessBanner.tsx` (NEW)

---

#### P1-005: No Subscription Management Page
**RICE Score:** 150 (Reach: 300, Impact: 1.0, Confidence: 100%, Effort: 2.0)
**Status:** ❌ OPEN
**Priority:** P1 - High

**Problem:**
- Users can't see their subscription status
- Can't view billing history
- Can't cancel subscription (must email support)

**Impact:**
- Poor user experience
- Support tickets for cancellations
- No self-service

**Recommended Fix:**
- Create Settings page
- Show current tier, next billing date, payment method
- Add "Manage Subscription" button → Stripe Customer Portal
- Display billing history

**Effort:** 2 weeks

**Files to Create:**
- `frontend/src/pages/Settings.tsx`
- `convex/payments.ts` - Add `getSubscriptionDetails` query

---

#### P1-006: No Error Handling for Failed Checkout
**RICE Score:** 160 (Reach: 50, Impact: 2.0, Confidence: 80%, Effort: 0.5)
**Status:** ❌ OPEN
**Priority:** P1 - High

**Problem:**
- If Stripe checkout fails (card declined, etc.), user sees generic error
- No clear next steps
- Silent failures

**Impact:**
- Lost conversions
- User frustration

**Recommended Fix:**
- Catch checkout errors
- Show user-friendly message: "Payment failed: Card declined. Please try another payment method."
- Provide "Try again" button

**Effort:** 4 hours

**Files to Modify:**
- `frontend/src/pages/PricingPagePublic.tsx`
- Handle Stripe checkout errors

---

#### P1-007: No Failed Payment Webhook Handler
**RICE Score:** 100 (Reach: 50, Impact: 2.0, Confidence: 100%, Effort: 1.0)
**Status:** ❌ OPEN
**Priority:** P1 - High

**Problem:**
- If subscription renewal fails (expired card), no webhook handler
- User not notified
- Subscription continues but not paid

**Impact:**
- Revenue loss
- Subscription stays active without payment

**Recommended Fix:**
- Add `invoice.payment_failed` webhook handler
- Send email to user: "Payment failed - update payment method"
- Downgrade user after 7 days of failed payments

**Effort:** 1 week

**Files to Modify:**
- `convex/http.ts` (add payment_failed handler)
- Create email template for failed payment

---

#### P1-008: No Timeout for Stuck Analyses
**RICE Score:** 200 (Reach: 100, Impact: 1.0, Confidence: 100%, Effort: 0.5)
**Status:** ❌ OPEN
**Priority:** P1 - High

**Problem:**
- If OpenAI API hangs, analysis never completes
- User sees loading spinner forever
- No timeout or error after X minutes

**Impact:**
- Poor UX
- Consumed analysis slot but no result

**Recommended Fix:**
- Add 30-second timeout to OpenAI API call
- If timeout, refund slot and show error
- Add retry button

**Effort:** 4 hours

**Files to Modify:**
- `convex/propiq.ts` - Add timeout to `analyzeProperty` action

---

#### P1-009: Generic Error Messages Expose Backend Info
**RICE Score:** 320 (Reach: 400, Impact: 0.5, Confidence: 80%, Effort: 0.5)
**Status:** ❌ OPEN
**Priority:** P1 - Medium

**Problem:**
- Error messages show backend details: "MongoDB connection failed at propiq.ts:145"
- Security risk: leaks implementation details
- Poor UX: technical jargon

**Impact:**
- Security vulnerability (information disclosure)
- User confusion

**Recommended Fix:**
- Sanitize all error messages before sending to frontend
- User-facing: "Something went wrong. Please try again."
- Log detailed errors to Sentry (not shown to user)

**Effort:** 4 hours

**Files to Modify:**
- All Convex mutations/actions
- Add error sanitization wrapper

---

#### P1-010: No Offline Detection
**RICE Score:** 300 (Reach: 300, Impact: 0.5, Confidence: 100%, Effort: 0.5)
**Status:** ❌ OPEN
**Priority:** P1 - Medium

**Problem:**
- If user goes offline, app doesn't notify
- Actions fail silently
- User confused why nothing works

**Impact:**
- Poor UX on mobile
- Users think app is broken

**Recommended Fix:**
- Add offline detection (browser API)
- Show banner: "You're offline. Some features may not work."
- Disable actions when offline

**Effort:** 4 hours

**Files to Create:**
- `frontend/src/components/OfflineBanner.tsx`
- `frontend/src/hooks/useOnlineStatus.ts`

---

#### P1-011: No React Error Boundary
**RICE Score:** 400 (Reach: 200, Impact: 1.0, Confidence: 100%, Effort: 0.5)
**Status:** ⚠️ EXISTS - NEEDS VERIFICATION

**Problem:**
- If React component throws error, entire app crashes
- White screen of death
- No error message or recovery

**Impact:**
- Complete app failure
- User loses all work

**Note:** ErrorBoundary.tsx exists in codebase - verify it's working correctly

**Recommended Fix:**
- Verify ErrorBoundary catches all errors
- Add fallback UI with "Refresh page" button
- Log errors to Sentry

**Effort:** 2 hours (verification)

**Files to Verify:**
- `frontend/src/components/ErrorBoundary.tsx`
- `frontend/src/App.tsx` (ensure wrapped in ErrorBoundary)

---

#### P1-012: No Rate Limiting on Analysis Endpoint
**RICE Score:** 16 (Reach: 10, Impact: 2.0, Confidence: 80%, Effort: 1.0)
**Status:** ❌ OPEN
**Priority:** P1 - Low

**Problem:**
- No rate limiting on `analyzeProperty` action
- Attacker could spam analyses (DoS)
- Azure OpenAI costs could skyrocket

**Impact:**
- Financial risk (runaway costs)
- Service degradation

**Recommended Fix:**
- Add rate limiting: 10 analyses per minute per user
- Add IP-based rate limiting: 100 req/15min (already implemented globally, verify on analysis endpoint)
- Add cost caps in Azure OpenAI dashboard

**Effort:** 1 week

**Files to Modify:**
- `convex/propiq.ts` - Add rate limiting to analyzeProperty

---

#### P1-013: No Account Lockout After Failed Logins
**RICE Score:** 80 (Reach: 100, Impact: 1.0, Confidence: 80%, Effort: 1.0)
**Status:** ❌ OPEN
**Priority:** P1 - Low

**Problem:**
- No limit on failed login attempts
- Attacker could brute force passwords

**Impact:**
- Security vulnerability

**Recommended Fix:**
- Lock account after 5 failed attempts
- Require password reset to unlock
- Add CAPTCHA after 3 failures

**Effort:** 1 week

**Files to Modify:**
- `convex/auth.ts` - Add failed login tracking

---

#### P1-014: Session Timeout Has No Warning
**RICE Score:** 300 (Reach: 300, Impact: 0.5, Confidence: 100%, Effort: 0.5)
**Status:** ❌ OPEN
**Priority:** P1 - Medium

**Problem:**
- Session expires after 30 days idle
- No warning before expiration
- User suddenly logged out

**Impact:**
- User loses in-progress work
- Confusion

**Recommended Fix:**
- Show banner 5 minutes before expiration: "You'll be logged out in 5 minutes. Stay signed in?"
- "Stay signed in" extends session

**Effort:** 4 hours

**Files to Create:**
- `frontend/src/components/SessionTimeoutWarning.tsx`

---

#### P1-015: No Signup Confirmation Email
**RICE Score:** 160 (Reach: 400, Impact: 0.5, Confidence: 80%, Effort: 1.0)
**Status:** ❌ OPEN (but email verification exists)

**Problem:**
- User signs up but gets no welcome email
- Should send: "Welcome to PropIQ! Here's how to get started."

**Note:** Email verification flow sends verification email, but no separate welcome email

**Recommended Fix:**
- Add welcome email after email verification
- Include: Getting started guide, first analysis walkthrough, support contact

**Effort:** 1 week

**Files to Modify:**
- `convex/http.ts` - Add welcome email after verification

---

#### P1-016: Usage Counter Doesn't Persist Across Devices
**RICE Score:** 80 (Reach: 200, Impact: 0.5, Confidence: 80%, Effort: 1.0)
**Status:** ⚠️ VERIFY - Convex Should Handle This

**Problem:**
- Usage counter stored in database (Convex)
- Should sync automatically across devices
- Need to verify this works correctly

**Recommended Fix:**
- Test on 2 devices
- Verify usage counter syncs in real-time
- If not, fix Convex subscription

**Effort:** 2 hours (verification)

---

#### P1-017: No Export/PDF Functionality
**RICE Score:** 120 (Reach: 300, Impact: 1.0, Confidence: 80%, Effort: 2.0)
**Status:** ❌ OPEN

**Problem:**
- Pricing page advertises "Export to PDF" on Starter tier
- Feature not implemented
- False advertising

**Impact:**
- User expectations not met
- Trust issue

**Recommended Fix:**
1. Remove from pricing page (quick fix)
2. OR implement PDF export (2 weeks)

**Effort:** 5 minutes (remove) or 2 weeks (build)

**Files to Modify:**
- `frontend/src/config/pricing.ts` (remove feature)
- OR build PDF export feature

---

#### P1-018: Zillow Parser Might Break on UI Changes
**RICE Score:** 500 (Reach: 500, Impact: 2.0, Confidence: 50%, Effort: 1.0)
**Status:** ❌ OPEN - FUTURE RISK

**Problem:**
- If building Chrome extension, Zillow parser could break when Zillow updates UI
- No monitoring or alerts

**Impact:**
- Extension stops working
- User complaints

**Recommended Fix:**
- Add parser tests
- Monitor for parsing errors
- Have fallback (manual input)

**Effort:** 1 week (when extension built)

**Note:** Not urgent - Chrome extension not built yet

---

## P2 Issues (Important)

**Fix within first month**

### 🔴 OPEN P2 Issues (17)

#### P2-001: No Mobile-Optimized UI
**RICE Score:** N/A
**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Problem:**
- Site is responsive but not fully optimized for mobile
- Some modals/tables don't work well on small screens
- Need mobile testing on real devices (iPhone, Android)

**Recommended Fix:**
- UAT P1 tests include mobile testing (UAT-038 to UAT-052)
- Fix any issues found during UAT

---

#### P2-002: No Dark/Light Mode Toggle
**Status:** ⚠️ DARK MODE ONLY

**Problem:**
- App only has dark theme
- Some users prefer light mode

**Recommended Fix:**
- Add theme toggle
- Persist preference in localStorage

**Effort:** 1 week

---

#### P2-003: No Keyboard Shortcuts
**Status:** ❌ OPEN

**Problem:**
- Power users want keyboard shortcuts (e.g., Cmd+K to analyze)

**Recommended Fix:**
- Add common shortcuts
- Show shortcut menu (Cmd+?)

**Effort:** 1 week

---

#### P2-004: No Loading Skeleton for Tables
**Status:** ❌ OPEN

**Problem:**
- Tables show nothing while loading
- Should show skeleton placeholder

**Recommended Fix:**
- Add loading skeleton component

**Effort:** 1 week

---

#### P2-005: No Empty States
**Status:** ❌ OPEN

**Problem:**
- New users see blank pages (no analyses yet)
- Should show helpful empty state

**Recommended Fix:**
- Add empty states with CTA

**Effort:** 1 week

---

#### P2-006: No Search in Analysis History
**Status:** ❌ OPEN (History UI doesn't exist yet)

**Problem:**
- When history UI built, need search/filter

**Recommended Fix:**
- Add search bar, filter by date/score

**Effort:** Included in P1-002

---

#### P2-007: No Property Comparison Feature
**Status:** ❌ OPEN - ROADMAP

**Problem:**
- Users can't compare 2+ properties side-by-side

**Recommended Fix:**
- Add comparison view

**Effort:** 2 weeks

---

#### P2-008: No Deal Alerts/Notifications
**Status:** ❌ OPEN - ROADMAP

**Problem:**
- Pro tier advertises "Deal alerts" but not implemented

**Recommended Fix:**
- Remove from pricing or build feature

**Effort:** 1 month

---

#### P2-009-017: [Additional P2 issues...]

---

## P3 Issues (Nice-to-Have)

**Backlog - fix when time permits**

### 🔴 OPEN P3 Issues (12)

#### P3-001: No Social Login (Google, Facebook)
#### P3-002: No Two-Factor Authentication
#### P3-003: No Team Collaboration Features
#### P3-004: No API Access (Elite tier promises this)
#### P3-005: No White-Label Reports (Elite tier promises this)
#### P3-006: No Chrome Extension (Pro tier promises this)
#### P3-007: No Bulk Property Import
#### P3-008: No Market Insights Dashboard
#### P3-009: No Mobile App (iOS/Android)
#### P3-010: No Multi-Language Support
#### P3-011: No Advanced Analytics (usage dashboards)
#### P3-012: No Referral Program

**Note:** Many P3 issues are roadmap features mentioned in pricing but not yet built.

---

## Recently Resolved

### ✅ Fixed in January 2026 (14 issues)

#### January 5, 2026
1. ✅ **P0-003:** Stripe webhook signature verification (RICE 3000)
2. ✅ **P0-004:** Analysis race condition (RICE 1200)
3. ✅ **P0-005:** Email verification (RICE 400)
4. ✅ **P0-007:** Subscription cancellation (RICE 800)
5. ✅ **P0-009:** Charges for failed analyses (RICE 1200)

#### January 4, 2026
6. ✅ **ISSUE-018:** Password reset navigation timeout
7. ✅ **ISSUE-019:** Duplicate fetch on password reset
8. ✅ **ISSUE-020:** CSP violations (filtered in console)

#### December 2025
9. ✅ **P0-006:** Password reset flow
10. ✅ **P0-008:** Database index for stripeCustomerId
11. ✅ **P0-010:** First-time onboarding
12. ✅ **P0-011:** Weak password validation
13. ✅ **P0-012:** "Forgot Password" link
14. ✅ **P0-013:** Environment variables documented

---

## Technical Debt

### Code Quality Issues

#### TD-001: Multiple Calculator Versions
**Status:** 🔴 NEEDS CLEANUP

**Problem:**
- `DealCalculator.tsx` (old)
- `DealCalculatorV2.tsx` (current)
- `DealCalculatorV3.tsx.bak` (backup)

**Impact:**
- Code confusion
- Maintenance burden

**Recommended Fix:**
- Delete V1 and V3.bak
- Rename V2 to DealCalculator

**Effort:** 1 hour

---

#### TD-002: Multiple Auth Modal Versions
**Status:** 🔴 NEEDS CLEANUP

**Problem:**
- `AuthModal.tsx`
- `AuthModalV2.tsx`

**Recommended Fix:**
- Consolidate into one component

**Effort:** 2 hours

---

#### TD-003: Unused Backend Code
**Status:** 🔴 NEEDS CLEANUP

**Problem:**
- `/backend` directory contains old FastAPI code
- No longer used (migrated to Convex)

**Recommended Fix:**
- Archive to `/backend-archive`
- Remove from active codebase

**Effort:** 1 hour

---

#### TD-004: Large Bundle Size
**Status:** ⚠️ OPTIMIZATION NEEDED

**Problem:**
- Build warnings: 2 chunks >500KB
- Slow page load on slow connections

**Recommended Fix:**
- Code splitting
- Lazy load routes
- Tree shaking

**Effort:** 1 week

---

#### TD-005: No Unit Tests for Calculator Utils
**Status:** ❌ MISSING

**Problem:**
- `calculatorUtils.ts` has no unit tests
- Financial calculations not verified

**Recommended Fix:**
- Add Vitest tests
- Test all calculation functions

**Effort:** 1 week

---

#### TD-006: Inconsistent Error Handling
**Status:** 🔴 NEEDS STANDARDIZATION

**Problem:**
- Some errors throw
- Some return error objects
- Some log to console

**Recommended Fix:**
- Standardize error handling pattern
- Use Sentry for all errors

**Effort:** 1 week

---

## Infrastructure Issues

### INF-001: No Database Backups Verified
**Status:** ⚠️ VERIFY

**Problem:**
- Convex claims auto-backups
- Never tested restore

**Recommended Fix:**
- Test backup/restore process
- Document recovery procedure

**Effort:** 4 hours

---

### INF-002: No Load Testing
**Status:** ❌ NOT DONE

**Problem:**
- Don't know how many concurrent users app can handle

**Recommended Fix:**
- Run load tests (k6 or Artillery)
- Test with 100, 1000, 10000 concurrent users

**Effort:** 1 week

---

### INF-003: No CDN for Static Assets
**Status:** ⚠️ PARTIAL (Cloudflare CDN active)

**Problem:**
- Frontend served via Netlify + Cloudflare
- Verify CDN working correctly

**Recommended Fix:**
- Check CDN cache headers
- Optimize cache strategy

**Effort:** 4 hours

---

### INF-004: No Monitoring Dashboard
**Status:** ❌ MISSING

**Problem:**
- No central dashboard for:
  - Error rates
  - User signups
  - API usage
  - Revenue

**Recommended Fix:**
- Set up Grafana or similar
- Create dashboard with key metrics

**Effort:** 1 week

---

### INF-005: No Runbook for Common Issues
**Status:** ❌ MISSING

**Problem:**
- No documented procedures for:
  - User can't log in
  - Payment failed
  - Analysis stuck

**Recommended Fix:**
- Create runbook with troubleshooting steps

**Effort:** 1 week

---

## Issue Tracking Process

### Severity Levels

**P0 (Blocker):**
- Prevents launch or causes data loss/security breach
- Fix immediately, drop everything else
- Examples: Stripe webhook security, GDPR compliance

**P1 (Critical):**
- Major feature broken or poor UX
- Fix within 1 week of launch
- Examples: No retry button, no history UI

**P2 (Important):**
- Nice-to-have features or minor UX issues
- Fix within 1 month
- Examples: Dark mode toggle, keyboard shortcuts

**P3 (Nice-to-Have):**
- Future roadmap features
- Fix when time permits
- Examples: Social login, mobile app

### RICE Scoring

**Formula:** (Reach × Impact × Confidence) / Effort

- **Reach:** Users impacted per month
- **Impact:** 0.25 (minimal), 0.5 (low), 1 (medium), 2 (high), 3 (massive)
- **Confidence:** 50% (low), 80% (medium), 100% (certain)
- **Effort:** Person-weeks

**Priority:** RICE > 100 = P0, 50-100 = P1, 20-50 = P2, <20 = P3

---

## Issue Reporting Template

```markdown
### Issue Title
**RICE Score:** [Calculated score]
**Status:** ❌ OPEN / ⚠️ IN PROGRESS / ✅ RESOLVED
**Priority:** P0/P1/P2/P3
**Reported:** [Date]

**Problem:**
[Description of the issue]

**Impact:**
[User impact, revenue impact, security impact]

**Recommended Fix:**
[Proposed solution]

**Effort:** [Time estimate]

**Files to Modify:**
- [List of files]
```

---

## Next Steps

### Immediate Actions (This Week)

1. **Fix CI/CD Pipeline** (P0-002)
   - Update Playwright config for CI
   - Unblock deployments

2. **Implement GDPR Compliance** (P0-001)
   - Data export endpoint
   - Data deletion endpoint
   - Privacy policy page

3. **Complete P0 UAT Testing**
   - Execute remaining 13/20 manual tests
   - Fix any critical bugs found

### Short-Term (Next 2 Weeks)

4. **Fix Top 5 P1 Issues**
   - Payment confirmation message
   - Retry button for failed analyses
   - Analysis history UI
   - Timeout for stuck analyses
   - Error message sanitization

5. **Clean Up Technical Debt**
   - Remove old calculator versions
   - Archive FastAPI backend
   - Standardize error handling

### Long-Term (Next 3 Months)

6. **Build Roadmap Features**
   - PDF export
   - Chrome extension
   - API access
   - White-label reports

7. **Optimize Performance**
   - Code splitting
   - Load testing
   - CDN optimization

---

## Metrics

### Issue Resolution Rate

- **Total Issues:** 47
- **Resolved:** 14 (30%)
- **Open P0:** 2 (critical)
- **Open P1:** 18 (high priority)
- **Open P2:** 17 (medium priority)
- **Open P3:** 12 (nice-to-have)

### Target Resolution Timeline

- **Week 1:** Resolve 2 P0 issues
- **Week 2-3:** Resolve 10 P1 issues
- **Month 2:** Resolve remaining P1 + 50% of P2
- **Month 3:** Resolve remaining P2 + start P3

---

**Last Updated:** January 5, 2026
**Document Owner:** Brian Dusape
**Review Frequency:** Weekly (during UAT), then Monthly
**Next Review:** January 12, 2026
