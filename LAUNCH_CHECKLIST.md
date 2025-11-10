# PropIQ Paid Beta Launch Checklist

**Version**: 1.0
**Last Updated**: November 10, 2025
**Target Launch Date**: [TO BE DETERMINED]
**Status**: 🔴 Pre-launch - Critical items pending

---

## 📋 Launch Readiness Overview

| Category | Progress | Status | Blocking |
|----------|----------|--------|----------|
| Backend Development | 95% | ✅ Complete | No |
| Frontend Development | 0% | 🔴 Not Started | **YES** |
| Database Setup | 80% | ⚠️ Migrations Pending | **YES** |
| Payment Integration | 90% | ⚠️ Webhook Setup Needed | **YES** |
| Legal Compliance | 100% | ✅ Complete | No |
| Security | 85% | ⚠️ Audit Needed | **YES** |
| Monitoring | 90% | ⚠️ Setup Needed | **YES** |
| Documentation | 80% | ⚠️ Some Missing | No |

**Overall Readiness**: 78% - **NOT READY FOR LAUNCH**

---

## 🔴 CRITICAL BLOCKERS (Must Complete Before Launch)

### 1. Database Migrations (P0 - BLOCKING)
**Owner**: Backend Lead / DevOps
**Estimated Time**: 30 minutes
**Status**: ⬜ Not Started

**Actions**:
```bash
# In Supabase Dashboard → SQL Editor, run these migrations in order:

# 1. Column rename migration (CRITICAL - app will crash without this)
psql < backend/supabase_migration_dealiq_to_propiq.sql

# 2. Production indexes (CRITICAL - performance will degrade)
psql < backend/supabase_migration_add_production_indexes.sql

# 3. Stripe webhooks table (CRITICAL - payment processing will fail)
psql < backend/supabase_migration_stripe_webhooks.sql

# 4. GDPR deletion columns (HIGH - account deletion won't work)
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

# 5. User preferences columns (MEDIUM - settings page won't work)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
```

**Verification**:
```sql
-- Verify all migrations succeeded
SELECT 'propiq columns' as check, COUNT(*) as count FROM information_schema.columns
WHERE table_name = 'users' AND column_name LIKE '%propiq%';
-- Expected: 3

SELECT 'indexes' as check, COUNT(*) as count FROM pg_indexes
WHERE tablename IN ('users', 'property_analyses', 'support_chats', 'onboarding_status');
-- Expected: 16+

SELECT 'stripe_webhooks table' as check, COUNT(*) as count FROM information_schema.tables
WHERE table_name = 'stripe_webhooks';
-- Expected: 1

SELECT 'gdpr columns' as check, COUNT(*) as count FROM information_schema.columns
WHERE table_name = 'users' AND column_name LIKE '%deletion%';
-- Expected: 3
```

---

### 2. Stripe Webhook Configuration (P0 - BLOCKING)
**Owner**: Backend Lead / DevOps
**Estimated Time**: 15 minutes
**Status**: ⬜ Not Started

**Actions**:
1. Log into Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://luntra-outreach-app.azurewebsites.net/api/v1/stripe/webhook`
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Copy webhook signing secret
6. Add to environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
   ```
7. Restart backend service

**Verification**:
```bash
# Send test webhook from Stripe Dashboard
# Check logs for successful processing
# Verify database updated correctly
```

---

### 3. Backend Router Integration (P0 - BLOCKING)
**Owner**: Backend Lead
**Estimated Time**: 10 minutes
**Status**: ⬜ Not Started

**Action**:
Update `backend/api.py` to include all new routers:

```python
# Add these imports
from routers.gdpr import router as gdpr_router
from routers.subscription import router as subscription_router
from routers.dashboard import router as dashboard_router
from routers.account import router as account_router
from routers.analysis_history import router as analysis_history_router
from routers.payment_enhanced import router as payment_enhanced_router

# Add these router registrations
app.include_router(gdpr_router)
app.include_router(subscription_router)
app.include_router(dashboard_router)
app.include_router(account_router)
app.include_router(analysis_history_router)

# Switch to enhanced payment handler
# app.include_router(payment_router)  # OLD - comment out
app.include_router(payment_enhanced_router)  # NEW - use this
```

**Verification**:
```bash
curl https://luntra-outreach-app.azurewebsites.net/api/v1/gdpr/health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/subscription/health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/dashboard/health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/account/health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/analysis/health
```

---

### 4. Environment Variables Configuration (P0 - BLOCKING)
**Owner**: DevOps
**Estimated Time**: 15 minutes
**Status**: ⬜ Not Started

**Complete Environment Variables Checklist**:

```bash
# ============================================================================
# CRITICAL - App will not start without these
# ============================================================================

# Database
✅ SUPABASE_URL=https://xxxxx.supabase.co
✅ SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Authentication
✅ JWT_SECRET=[64+ character random string]
✅ JWT_ALGORITHM=HS256

# Stripe (PRODUCTION KEYS)
⬜ STRIPE_SECRET_KEY=sk_live_xxxxx  # NOT sk_test_xxxxx
⬜ STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # NOT pk_test_xxxxx
⬜ STRIPE_WEBHOOK_SECRET=whsec_xxxxx
⬜ STRIPE_PRICE_ID_STARTER=price_xxxxx
⬜ STRIPE_PRICE_ID_PRO=price_xxxxx
⬜ STRIPE_PRICE_ID_ELITE=price_xxxxx

# SendGrid Email
⬜ SENDGRID_API_KEY=SG.xxxxx
✅ FROM_EMAIL=team@propiq.luntra.one
✅ SUPPORT_EMAIL=support@propiq.luntra.one

# Application
✅ ENVIRONMENT=production
✅ APP_URL=https://propiq.luntra.one

# ============================================================================
# HIGH PRIORITY - Monitoring and Error Tracking
# ============================================================================

# Sentry
⬜ SENTRY_DSN=https://xxxxx@o000000.ingest.sentry.io/0000000
✅ SENTRY_TRACES_SAMPLE_RATE=1.0
✅ SENTRY_PROFILES_SAMPLE_RATE=1.0
✅ RELEASE_VERSION=propiq@1.0.0

# ============================================================================
# MEDIUM PRIORITY - Optional but recommended
# ============================================================================

# Logging
✅ LOG_LEVEL=INFO

# Rate Limiting
✅ RATE_LIMIT_ENABLED=true
✅ RATE_LIMIT_PER_MINUTE=100

# AI Tracking (optional)
✅ WANDB_MODE=disabled  # or online if using W&B

# ============================================================================
# SECURITY - Must be strong production values
# ============================================================================

⚠️ Ensure JWT_SECRET is random 64+ character string (not default)
⚠️ Ensure Stripe keys are LIVE keys (sk_live_*, pk_live_*)
⚠️ Ensure all API keys are from production services
⚠️ Do NOT commit .env file to git
```

---

### 5. Frontend Development (P0 - BLOCKING)
**Owner**: Frontend Lead
**Estimated Time**: 40-60 hours
**Status**: ⬜ Not Started

**Critical Pages Needed**:

1. **Subscription Management** (Priority: P0)
   - [ ] View current plan page
   - [ ] Upgrade flow (select plan → Stripe Checkout)
   - [ ] Downgrade confirmation modal
   - [ ] Cancellation flow with feedback
   - [ ] Billing history page

2. **User Dashboard** (Priority: P0)
   - [ ] Usage overview with charts
   - [ ] Current month progress
   - [ ] Recent analyses list
   - [ ] Quick actions (analyze, upgrade, export)

3. **Account Settings** (Priority: P1)
   - [ ] Profile edit form
   - [ ] Password change form
   - [ ] Email preferences toggles
   - [ ] Notification preferences toggles

4. **Property Analysis History** (Priority: P1)
   - [ ] List view with filters
   - [ ] Search bar
   - [ ] Sort dropdown
   - [ ] Export buttons (CSV, JSON)
   - [ ] Delete confirmation

5. **Legal Pages** (Priority: P0)
   - [ ] Privacy Policy page (`/legal/privacy`)
   - [ ] Terms of Service page (`/legal/terms`)
   - [ ] Footer links to legal pages
   - [ ] ToS acceptance on signup

**API Integration Endpoints to Use**:
- Subscription: `/api/v1/subscription/*`
- Dashboard: `/api/v1/dashboard/*`
- Account: `/api/v1/account/*`
- Analysis: `/api/v1/analysis/*`
- GDPR: `/api/v1/gdpr/*`

---

### 6. Sentry Error Monitoring Setup (P0 - BLOCKING)
**Owner**: DevOps / Backend Lead
**Estimated Time**: 20 minutes
**Status**: ⬜ Not Started

**Actions**:
1. Create Sentry account: https://sentry.io (free tier available)
2. Create new project: "PropIQ Backend" (Python/FastAPI)
3. Create new project: "PropIQ Frontend" (React)
4. Copy DSN keys and add to environment variables
5. Test error reporting:
   ```python
   # In Python backend
   import sentry_sdk
   sentry_sdk.capture_message("Test error from PropIQ Backend")
   ```
   ```javascript
   // In React frontend
   Sentry.captureMessage("Test error from PropIQ Frontend");
   ```
6. Verify errors appear in Sentry dashboard within 2 minutes
7. Set up alerts to email/Slack for critical errors

**Reference**: `backend/MONITORING_SETUP_GUIDE.md` (Section 1)

---

### 7. UptimeRobot Monitoring Setup (P0 - BLOCKING)
**Owner**: DevOps
**Estimated Time**: 15 minutes
**Status**: ⬜ Not Started

**Actions**:
1. Create UptimeRobot account: https://uptimerobot.com (free tier available)
2. Create 5 monitors:
   - Backend API Health: `https://luntra-outreach-app.azurewebsites.net/health`
   - PropIQ Analysis: `https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health`
   - Subscription API: `https://luntra-outreach-app.azurewebsites.net/api/v1/subscription/health`
   - Frontend: `https://propiq.luntra.one`
   - Database: Check for keyword "connected" in `/health` endpoint
3. Set interval to 5 minutes for all monitors
4. Add alert contacts (email, Slack webhook)
5. Test one monitor (pause/unpause to trigger alert)

**Reference**: `backend/MONITORING_SETUP_GUIDE.md` (Section 2)

---

## ⚠️ HIGH PRIORITY (Should Complete Before Launch)

### 8. Security Audit
**Owner**: Security Lead / CTO
**Estimated Time**: 4-6 hours
**Status**: ⬜ Not Started

**Checklist**:
- [ ] Review all authentication flows
- [ ] Verify JWT expiration (currently 7 days - acceptable?)
- [ ] Check password hashing (bcrypt with salt - ✅)
- [ ] Verify Stripe webhook signature validation
- [ ] Check CORS configuration
- [ ] Review rate limiting settings
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Verify HTTPS enforcement
- [ ] Check sensitive data logging
- [ ] Review access control (RLS in Supabase)
- [ ] Test GDPR data export/deletion flows
- [ ] Verify environment variables security

**Tools to Use**:
- OWASP ZAP for security scanning
- Manual penetration testing
- Code review for security issues

---

### 9. Performance Testing
**Owner**: Backend Lead / QA
**Estimated Time**: 3-4 hours
**Status**: ⬜ Not Started

**Test Scenarios**:
- [ ] Load test: 100 concurrent users
- [ ] Stress test: Find breaking point
- [ ] Spike test: Sudden traffic increase
- [ ] Endurance test: Sustained load for 1 hour
- [ ] Test database query performance
- [ ] Test API response times (<200ms for 95th percentile)
- [ ] Test Stripe webhook processing under load
- [ ] Test file exports (CSV/JSON) with large datasets

**Tools**:
- Artillery, k6, or Apache JMeter
- New Relic or Datadog for APM

**Success Criteria**:
- API response time <200ms (p95)
- No errors under 100 concurrent users
- Database queries optimized (<50ms)

---

### 10. Test Suite Execution
**Owner**: QA / Backend Lead
**Estimated Time**: 1 hour
**Status**: ⬜ Not Started

**Actions**:
```bash
cd backend

# Install test dependencies
pip install pytest pytest-cov pytest-asyncio

# Run full test suite
pytest tests/ -v --cov=backend --cov-report=html --cov-report=term

# Expected results:
# - All tests pass
# - Coverage ≥ 60%
# - No critical warnings

# Open coverage report
open htmlcov/index.html
```

**Test Files to Run**:
- `tests/test_payment_webhooks.py` (40+ tests)
- `tests/test_auth.py` (30+ tests)
- `tests/test_propiq_analysis.py` (25+ tests)
- `tests/test_subscription_management.py` (20+ tests)

---

### 11. Legal Document Review
**Owner**: Legal Counsel / CTO
**Estimated Time**: 2-4 hours (external)
**Status**: ⬜ Not Started

**Actions**:
1. Send documents to legal counsel:
   - `backend/legal/PRIVACY_POLICY.md`
   - `backend/legal/TERMS_OF_SERVICE.md`
2. Address any feedback or required changes
3. Get written approval from counsel
4. Add documents to website
5. Require acceptance on signup

**Deliverable**: Signed-off legal documents ready for production

---

### 12. Beta User Onboarding Flow
**Owner**: Product / Marketing
**Estimated Time**: 2 hours
**Status**: ⬜ Not Started

**Actions**:
1. Create welcome email template
2. Create day 2 onboarding email (tips & tricks)
3. Create day 7 check-in email (usage feedback)
4. Set up email automation in SendGrid
5. Create in-app onboarding tour (if frontend supports)
6. Prepare beta user documentation

---

## 📊 MEDIUM PRIORITY (Nice to Have for Launch)

### 13. API Documentation
**Status**: ⬜ Not Started
- [ ] Document all API endpoints (Swagger/OpenAPI)
- [ ] Add request/response examples
- [ ] Document authentication flow
- [ ] Create API usage guide

### 14. Deployment Automation
**Status**: ⬜ Not Started
- [ ] Set up CI/CD pipeline
- [ ] Automate database migrations
- [ ] Configure auto-scaling
- [ ] Set up staging environment

### 15. Analytics Integration
**Status**: ⬜ Not Started
- [ ] Set up Google Analytics or Mixpanel
- [ ] Track key user actions
- [ ] Set up conversion funnels
- [ ] Create analytics dashboard

### 16. Customer Support Setup
**Status**: ⬜ Not Started
- [ ] Set up support ticketing system
- [ ] Create support email auto-responses
- [ ] Prepare FAQ document
- [ ] Train support team

---

## 🧪 PRE-LAUNCH TESTING CHECKLIST

### Critical User Flows (Must Test Manually)
- [ ] **Signup Flow**
  - [ ] New user can sign up
  - [ ] Email verification works
  - [ ] User is assigned free tier
  - [ ] Welcome email received

- [ ] **Property Analysis Flow**
  - [ ] User can analyze a property
  - [ ] Results display correctly
  - [ ] Usage count increments
  - [ ] Usage limit enforced

- [ ] **Subscription Upgrade Flow**
  - [ ] User can upgrade from free to starter
  - [ ] Stripe checkout works
  - [ ] Webhook processes correctly
  - [ ] User tier updated in database
  - [ ] Usage limit increases
  - [ ] Receipt email sent

- [ ] **Subscription Management Flow**
  - [ ] User can downgrade (scheduled at period end)
  - [ ] User can cancel subscription
  - [ ] User retains access until period end
  - [ ] Downgrade/cancellation confirmation emails sent

- [ ] **Payment Flow**
  - [ ] Monthly billing works correctly
  - [ ] Failed payments handled gracefully
  - [ ] Invoice emails sent
  - [ ] Billing history displays correctly

- [ ] **GDPR Compliance Flow**
  - [ ] User can export their data
  - [ ] Export includes all user data
  - [ ] User can request account deletion
  - [ ] 30-day grace period works
  - [ ] Account deletion can be canceled
  - [ ] Permanent deletion removes all data

- [ ] **Account Settings Flow**
  - [ ] User can update profile
  - [ ] User can change password
  - [ ] User can update email preferences
  - [ ] User can update notification preferences

- [ ] **Dashboard Flow**
  - [ ] Usage statistics display correctly
  - [ ] Charts render properly
  - [ ] Billing history shows invoices
  - [ ] Recommendations are relevant

- [ ] **Analysis History Flow**
  - [ ] Filters work correctly
  - [ ] Sorting works
  - [ ] Pagination works
  - [ ] CSV export works
  - [ ] JSON export works
  - [ ] Delete analysis works

---

## 🚀 GO/NO-GO DECISION CRITERIA

### ✅ GO - Ready to Launch
**All of these must be true:**
- ✅ All database migrations completed successfully
- ✅ Stripe webhooks configured and tested
- ✅ All backend routers integrated
- ✅ Environment variables configured (production values)
- ✅ Frontend pages deployed and working
- ✅ Sentry error monitoring active
- ✅ UptimeRobot monitors active
- ✅ Security audit completed with no critical issues
- ✅ All critical user flows tested and working
- ✅ Legal documents approved and published
- ✅ Test suite passing with ≥60% coverage
- ✅ Performance tests passing (p95 <200ms)

### 🔴 NO-GO - Not Ready
**Any of these is a blocker:**
- 🔴 Database migrations not run
- 🔴 Stripe webhooks not configured
- 🔴 Frontend not deployed
- 🔴 Critical security vulnerabilities
- 🔴 Test suite failing
- 🔴 Payment processing not working
- 🔴 Legal documents not approved
- 🔴 Monitoring not set up

---

## 📅 LAUNCH TIMELINE

### Week 4 - Final Sprint
**Days 1-2**: Critical blockers (database, Stripe, integration)
**Days 3-4**: Frontend development, security audit, testing
**Days 5-6**: Final testing, bug fixes, documentation
**Day 7**: Go/no-go decision, soft launch

### Launch Day Checklist
- [ ] Final smoke test of all critical flows
- [ ] Verify monitoring alerts working
- [ ] Team on standby for support
- [ ] Send launch announcement to beta users
- [ ] Monitor error rates closely
- [ ] Be ready to rollback if needed

---

## 📞 EMERGENCY CONTACTS

**CTO/Tech Lead**: [Email/Phone]
**DevOps Lead**: [Email/Phone]
**Backend Lead**: [Email/Phone]
**Frontend Lead**: [Email/Phone]
**Product Manager**: [Email/Phone]

**External Services**:
- Stripe Support: https://support.stripe.com
- Sentry Support: https://sentry.io/support
- Supabase Support: https://supabase.com/support

---

## 📝 NOTES

**Launch Philosophy**: "Launch when ready, not when planned"
- Don't rush to meet arbitrary deadlines
- All critical blockers must be resolved
- User experience must be smooth
- Payment processing must be rock-solid
- GDPR compliance must be verified

**Beta Launch Scope**:
- Limited to 50-100 initial users
- Closely monitored for issues
- Quick iteration based on feedback
- Gradual scale-up as confidence grows

---

**Document Owner**: CTO Office
**Last Updated**: November 10, 2025
**Next Review**: Daily until launch
**Version**: 1.0
