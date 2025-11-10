# PropIQ Deployment & Operations Guide

**Version**: 1.0
**Last Updated**: November 10, 2025
**Purpose**: Complete guide for deploying and operating PropIQ in production

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Monitoring Setup](#monitoring-setup)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Operations & Maintenance](#operations--maintenance)
9. [Incident Response](#incident-response)
10. [Rollback Procedures](#rollback-procedures)

---

## ✅ Pre-Deployment Checklist

### Code Readiness
- [ ] All code merged to main branch
- [ ] All tests passing (`pytest tests/ -v`)
- [ ] Code review completed
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Documentation complete

### Infrastructure Readiness
- [ ] Production environment provisioned
- [ ] Database instance ready (Supabase)
- [ ] Backend hosting ready (Azure App Service)
- [ ] Frontend hosting ready (Vercel/Netlify/Azure)
- [ ] CDN configured (optional)
- [ ] SSL certificates installed

### Service Accounts
- [ ] Stripe account created (live mode)
- [ ] SendGrid account created
- [ ] Sentry project created
- [ ] UptimeRobot account created
- [ ] All API keys generated

### Team Readiness
- [ ] On-call schedule defined
- [ ] Deployment runbook reviewed
- [ ] Rollback procedure tested
- [ ] Communication channels ready (Slack)

---

## 🔧 Environment Setup

### 1. Environment Variables

Create `.env` file in `backend/` with production values:

```bash
# ============================================================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# ============================================================================

# Environment
ENVIRONMENT=production

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Authentication
JWT_SECRET=[GENERATE 64+ RANDOM CHARACTERS]
JWT_ALGORITHM=HS256

# Stripe (PRODUCTION - LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_1...
STRIPE_PRICE_ID_PRO=price_1...
STRIPE_PRICE_ID_ELITE=price_1...

# SendGrid Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxx...
FROM_EMAIL=team@propiq.luntra.one
SUPPORT_EMAIL=support@propiq.luntra.one

# Application
APP_URL=https://propiq.luntra.one
LOG_LEVEL=INFO

# Sentry Error Monitoring
SENTRY_DSN=https://xxx@oyyy.ingest.sentry.io/zzz
SENTRY_TRACES_SAMPLE_RATE=1.0
SENTRY_PROFILES_SAMPLE_RATE=1.0
RELEASE_VERSION=propiq@1.0.0

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=100

# AI Tracking (optional)
WANDB_MODE=disabled

# ============================================================================
# SECURITY NOTES
# ============================================================================
# - JWT_SECRET must be strong random string (64+ characters)
# - Use LIVE Stripe keys (sk_live_*, pk_live_*)
# - NEVER commit this file to git
# - Store securely in Azure Key Vault or similar
# ============================================================================
```

### 2. Generate JWT Secret

```bash
# Generate secure JWT secret
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Or using openssl
openssl rand -base64 64
```

---

## 🗄️ Database Deployment

### Step 1: Connect to Supabase

1. Log in to Supabase Dashboard: https://app.supabase.com
2. Select your production project
3. Navigate to SQL Editor

### Step 2: Run Migrations (IN ORDER)

**CRITICAL: Run these in the exact order shown**

#### Migration 1: Column Rename (BLOCKING - App will crash without this)
```sql
-- File: backend/supabase_migration_dealiq_to_propiq.sql
-- Copy entire file contents and run in SQL Editor
```

**Verification**:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users' AND column_name LIKE '%propiq%';
-- Expected: 3 rows (propiq_usage_count, propiq_usage_limit, propiq_last_reset_date)
```

#### Migration 2: Production Indexes (BLOCKING - Performance will degrade)
```sql
-- File: backend/supabase_migration_add_production_indexes.sql
-- Copy entire file contents and run in SQL Editor
```

**Verification**:
```sql
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
-- Expected: 16+ indexes
```

#### Migration 3: Stripe Webhooks Table (BLOCKING - Payments will fail)
```sql
-- File: backend/supabase_migration_stripe_webhooks.sql
-- Copy entire file contents and run in SQL Editor
```

**Verification**:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'stripe_webhooks';
-- Expected: 1 row
```

#### Migration 4: GDPR Columns (HIGH PRIORITY)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
```

#### Migration 5: User Preferences (MEDIUM PRIORITY)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
```

### Step 3: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see/edit their own data
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Property analyses
CREATE POLICY analyses_select_own ON property_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY analyses_insert_own ON property_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY analyses_delete_own ON property_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

---

## 🚀 Backend Deployment

### Step 1: Prepare Code

```bash
# Clone repository
git clone https://github.com/Luntra-HQ/propiq.git
cd propiq/backend

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Update API Configuration

Edit `backend/api.py` to include all routers:

```python
# Add these imports at the top
from routers.gdpr import router as gdpr_router
from routers.subscription import router as subscription_router
from routers.dashboard import router as dashboard_router
from routers.account import router as account_router
from routers.analysis_history import router as analysis_history_router
from routers.payment_enhanced import router as payment_enhanced_router

# Add these router registrations (after existing routers)
app.include_router(gdpr_router)
app.include_router(subscription_router)
app.include_router(dashboard_router)
app.include_router(account_router)
app.include_router(analysis_history_router)

# Replace old payment router with enhanced version
# app.include_router(payment_router)  # OLD - comment out
app.include_router(payment_enhanced_router)  # NEW - use this

# Add security headers (PRODUCTION ONLY)
if os.getenv("ENVIRONMENT") == "production":
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000"
        return response

    # HTTPS redirect
    from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
    app.add_middleware(HTTPSRedirectMiddleware)

    # CORS - Restrict to production domain
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://propiq.luntra.one"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"]
    )
```

### Step 3: Deploy to Azure App Service

#### Option A: Azure Portal Deploy
1. Log in to Azure Portal
2. Navigate to App Service: `luntra-outreach-app`
3. Go to Deployment Center
4. Connect to GitHub repository
5. Select branch: `main`
6. Deploy

#### Option B: Azure CLI Deploy
```bash
# Install Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Set subscription
az account set --subscription "your-subscription-id"

# Deploy
az webapp up \
  --name luntra-outreach-app \
  --resource-group your-resource-group \
  --runtime "PYTHON:3.11" \
  --plan your-app-service-plan \
  --location westus2
```

### Step 4: Configure Environment Variables in Azure

```bash
# Set environment variables in Azure App Service
az webapp config appsettings set \
  --name luntra-outreach-app \
  --resource-group your-resource-group \
  --settings \
    ENVIRONMENT=production \
    SUPABASE_URL="https://your-project.supabase.co" \
    SUPABASE_SERVICE_KEY="eyJhbG..." \
    JWT_SECRET="your-64-char-secret" \
    STRIPE_SECRET_KEY="sk_live_..." \
    STRIPE_WEBHOOK_SECRET="whsec_..." \
    # ... all other environment variables
```

Or use Azure Portal:
1. App Service → Configuration → Application Settings
2. Add each environment variable
3. Click "Save"

### Step 5: Restart Backend

```bash
az webapp restart --name luntra-outreach-app --resource-group your-resource-group
```

---

## 🌐 Frontend Deployment

### Step 1: Update API Endpoints

In frontend `.env.production`:

```bash
REACT_APP_API_URL=https://luntra-outreach-app.azurewebsites.net
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
REACT_APP_ENVIRONMENT=production
```

### Step 2: Build Frontend

```bash
cd frontend
npm install
npm run build
```

### Step 3: Deploy to Vercel/Netlify

#### Vercel:
```bash
npm install -g vercel
vercel --prod
```

#### Netlify:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

#### Azure Static Web Apps:
```bash
az staticwebapp create \
  --name propiq-frontend \
  --resource-group your-resource-group \
  --location westus2
```

---

## 📊 Monitoring Setup

### 1. Sentry Error Monitoring

1. Create account: https://sentry.io
2. Create two projects:
   - PropIQ Backend (Python/FastAPI)
   - PropIQ Frontend (React)
3. Copy DSN keys
4. Add to environment variables:
   ```bash
   SENTRY_DSN=https://xxx@oyyy.ingest.sentry.io/zzz
   ```
5. Test error reporting:
   ```python
   import sentry_sdk
   sentry_sdk.capture_message("Test error from PropIQ Backend")
   ```

### 2. UptimeRobot Monitoring

1. Create account: https://uptimerobot.com
2. Create monitors:
   - **Backend Health**: `https://luntra-outreach-app.azurewebsites.net/health`
   - **PropIQ API**: `https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health`
   - **Subscription API**: `https://luntra-outreach-app.azurewebsites.net/api/v1/subscription/health`
   - **Frontend**: `https://propiq.luntra.one`
   - **Database**: Check for keyword "connected" in `/health`
3. Set check interval: 5 minutes
4. Add alert contacts (email, Slack)

### 3. Stripe Webhook Configuration

1. Log in to Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to Developers → Webhooks
3. Click "Add endpoint"
4. URL: `https://luntra-outreach-app.azurewebsites.net/api/v1/stripe/webhook`
5. Select events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Copy webhook signing secret
7. Add to environment variables: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## ✅ Post-Deployment Verification

### 1. Smoke Tests

#### Backend Health
```bash
curl https://luntra-outreach-app.azurewebsites.net/health
# Expected: {"status": "healthy", "database": "connected"}
```

#### API Endpoints
```bash
# GDPR health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/gdpr/health

# Subscription health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/subscription/health

# Dashboard health
curl https://luntra-outreach-app.azurewebsites.net/api/v1/dashboard/health
```

### 2. Critical User Flows

Test manually:

- [ ] User can sign up
- [ ] User can log in
- [ ] User can analyze a property
- [ ] User can upgrade subscription (test mode card: 4242 4242 4242 4242)
- [ ] Stripe webhook processes correctly
- [ ] Usage limit increments
- [ ] User can view dashboard
- [ ] User can export data
- [ ] User can change password

### 3. Monitoring Verification

- [ ] Sentry receiving events
- [ ] UptimeRobot showing all monitors green
- [ ] Stripe webhook endpoint verified
- [ ] Database migrations completed
- [ ] All environment variables set

---

## 🔄 Operations & Maintenance

### Daily Tasks

1. **Monitor Sentry for Errors**
   - Review new errors
   - Prioritize and fix critical issues

2. **Check UptimeRobot Alerts**
   - Investigate any downtime
   - Verify all endpoints healthy

3. **Review User Activity**
   - Check signups
   - Monitor usage patterns
   - Review failed payments

### Weekly Tasks

1. **Performance Review**
   - Check API response times
   - Review slow queries
   - Optimize if needed

2. **Security Review**
   - Check for security alerts
   - Review failed login attempts
   - Update dependencies if needed

3. **Database Maintenance**
   - Check database size
   - Review query performance
   - Clean up old data if needed

### Monthly Tasks

1. **Dependency Updates**
   ```bash
   pip list --outdated
   npm outdated
   ```

2. **Security Audit**
   - Run `safety check`
   - Review security logs
   - Update security policies

3. **Performance Testing**
   - Run load tests
   - Verify performance targets met
   - Optimize bottlenecks

4. **Billing Review**
   - Review Stripe dashboard
   - Check churn rate
   - Analyze revenue metrics

---

## 🚨 Incident Response

### Severity Levels

**P0 - Critical** (Resolve in <1 hour)
- Complete site outage
- Payment processing down
- Database corruption
- Security breach

**P1 - High** (Resolve in <4 hours)
- Major feature broken
- Severe performance degradation
- Stripe webhooks failing

**P2 - Medium** (Resolve in <1 day)
- Minor feature broken
- Moderate performance issues
- Non-critical bugs

**P3 - Low** (Resolve in <1 week)
- Cosmetic issues
- Enhancement requests
- Documentation updates

### Incident Response Process

1. **Detection** (0-5 minutes)
   - Alert received (Sentry, UptimeRobot, user report)
   - Create incident ticket
   - Notify on-call engineer

2. **Assessment** (5-15 minutes)
   - Determine severity
   - Identify affected users
   - Estimate impact

3. **Mitigation** (15-60 minutes)
   - Apply immediate fix or rollback
   - Restore service
   - Communicate with users

4. **Resolution** (1-4 hours)
   - Implement permanent fix
   - Deploy to production
   - Verify issue resolved

5. **Post-Mortem** (1-2 days after)
   - Document incident
   - Identify root cause
   - Implement preventive measures

---

## ⏮️ Rollback Procedures

### When to Rollback

- Critical bugs in production
- Severe performance degradation
- Security vulnerability introduced
- Data corruption risk

### Rollback Process

#### Backend Rollback

```bash
# Via Azure Portal
1. Go to App Service → Deployment Center
2. Click "Deployment History"
3. Select previous successful deployment
4. Click "Redeploy"

# Via Azure CLI
az webapp deployment source sync \
  --name luntra-outreach-app \
  --resource-group your-resource-group \
  --commit-id PREVIOUS_COMMIT_HASH
```

#### Database Rollback

```sql
-- If migration failed, manually reverse
-- Example: Reverse column addition
ALTER TABLE users DROP COLUMN IF EXISTS new_column;

-- Restore from backup (if needed)
-- Contact Supabase support for assistance
```

#### Frontend Rollback

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback
```

---

## 📝 Deployment Checklist Summary

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance testing complete
- [ ] Team notified of deployment
- [ ] Rollback plan ready

### Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Monitoring configured
- [ ] Webhooks configured

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Critical flows verified
- [ ] Monitoring active
- [ ] Team notified of completion
- [ ] Documentation updated

---

**Document Owner**: DevOps / CTO
**Last Updated**: November 10, 2025
**Next Review**: After first deployment
**Version**: 1.0
