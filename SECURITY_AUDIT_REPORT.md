# PropIQ Security Audit Report (UPDATED)

**Date:** December 30, 2025
**Previous Audit:** November 6, 2025
**Auditor:** Claude Code Security Scan
**Status:** 🟡 **CREDENTIAL ROTATION REQUIRED**

---

## Executive Summary

**Good News:** ✅ No API keys found in git history (verified December 30, 2025)
**Action Needed:** 🔄 Rotate all API keys as precautionary measure
**Prevention:** 🛡️ Implement automated leak prevention tools

### Previous Audit Follow-up

The November 2025 audit identified critical security issues and fixed:
- ✅ Created comprehensive .gitignore
- ✅ Fixed deployment scripts (removed hardcoded secrets)
- ✅ Sanitized documentation files

**However, the API keys themselves were NOT rotated.** This audit confirms:
1. Keys are still the same as exposed in November
2. Keys need immediate rotation
3. Additional leak prevention measures needed

---

## API Keys Identified (December 30, 2025)

### 🔴 Critical Priority (Rotate TODAY)

#### 1. **Stripe Keys** (CRITICAL - Payment Processing)
- **Location:** `backend/.env`
- **Keys Found:**
  - `STRIPE_SECRET_KEY=sk_live_...[EXPOSED_REDACTED]`
  - `STRIPE_PUBLISHABLE_KEY=pk_live_...[EXPOSED_REDACTED]`
  - `STRIPE_WEBHOOK_SECRET=whsec_...[EXPOSED_REDACTED]`
- **Status:** ⚠️ EXPOSED (November 2025) - Requires rotation (see Issue #10)
- **Risk Level:** CRITICAL - Controls payment processing
- **Impact:** Unauthorized charges, refunds, customer data access
- **Rotation URL:** https://dashboard.stripe.com/apikeys

#### 2. **Supabase Service Key** (CRITICAL - Database Admin Access)
- **Location:** `backend/.env`
- **Keys Found:**
  - `SUPABASE_SERVICE_KEY=sb_secret_gBbV5AtaJlaokh4mEno_-A_ArAN0Ysp`
  - `SUPABASE_ANON_KEY=sb_publishable_hdKqm5S2eirpHn2ZsdtO6g_H7_2GHuL`
- **Risk Level:** CRITICAL - Full database access
- **Impact:** Read/write/delete all user data
- **Rotation URL:** https://supabase.com/dashboard

#### 3. **Azure OpenAI Key** (CRITICAL - AI Service Access)
- **Location:** `backend/.env`
- **Key Found:**
  - `AZURE_OPENAI_KEY=938KkvrloTxNKLBPytAuZm2OKQtQOcY1v2DB1bx3isMZ2ewUjYLAJQQJ99BJACYeBjFXJ3w3AAABACOGEx8u`
- **Risk Level:** CRITICAL - Controls AI service & billing
- **Impact:** Unauthorized API usage, unexpected bills
- **Rotation URL:** https://portal.azure.com

#### 4. **MongoDB Connection String** (CRITICAL - Database Access)
- **Location:** `backend/.env`
- **Key Found:**
  - `MONGODB_URI=mongodb+srv://propIQ_backend_user:nahpyr-dyPhy3-xoqwat@propiq-production-clust.q4050y.mongodb.net/...`
- **Risk Level:** CRITICAL - Full database access
- **Impact:** Read/write/delete all data, database manipulation
- **Rotation URL:** https://cloud.mongodb.com

#### 5. **SendGrid API Key** (HIGH - Email Access)
- **Location:** `backend/.env`
- **Key Found:**
  - `SENDGRID_API_KEY=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`
- **Risk Level:** HIGH - Can send emails on your behalf
- **Impact:** Spam sending, reputation damage
- **Rotation URL:** https://app.sendgrid.com/settings/api_keys

### 🟡 Moderate Priority (Rotate This Week)

#### 6. **Convex Deploy Key** (MEDIUM - Backend Deployment)
- **Location:** `.env.local`
- **Key Found:**
  - `CONVEX_DEPLOY_KEY=prod:mild-tern-361|eyJ2MiI6ImRlNzY3NTIxNzc1NTRiODk4ODBkY2M0NjljNzdkY2IxIn0=`
- **Risk Level:** MEDIUM - Can deploy to Convex backend
- **Impact:** Unauthorized deployments, service disruption
- **Rotation URL:** https://dashboard.convex.dev

#### 7. **JWT Secret** (MEDIUM - Session Security)
- **Location:** `backend/.env`
- **Key Found:**
  - `JWT_SECRET=9990747ca11c97900008bb0f93c77a99791202f56d40e91b4f7d5b2dfedd5e2b`
- **Risk Level:** MEDIUM - Controls session authentication
- **Impact:** Session hijacking, impersonation
- **⚠️ WARNING:** Rotating this will log out all users

#### 8. **Intercom Keys** (MEDIUM - Customer Messaging)
- **Location:** `backend/.env`
- **Keys Found:**
  - `INTERCOM_ACCESS_TOKEN=dG9rOmNkNDI4ZmQ3XzRhZjdfNDgyYV9iNTMwX2RhODU1ZmQyODNhNjoxOjA=`
  - `INTERCOM_API_KEY=c290ac56-e42b-46e3-8371-c39b166b55c0`
- **Risk Level:** MEDIUM - Customer data access
- **Impact:** View customer conversations, send messages
- **Rotation URL:** https://app.intercom.com/a/apps/_/settings/developers

#### 9. **Slack Webhook** (LOW-MEDIUM - Notifications)
- **Location:** `backend/.env`
- **Key Found:**
  - `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/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`
- **Risk Level:** MEDIUM - Can post to Slack channel
- **Impact:** Spam notifications
- **Rotation URL:** https://api.slack.com/apps

### 🟢 Low Priority (Rotate When Convenient)

#### 10. **Weights & Biases** (LOW - Analytics)
- **Location:** `backend/.env`
- **Key Found:**
  - `WANDB_API_KEY=12421393e758b9d1dc651df9da417d30039fff55`
- **Risk Level:** LOW - Analytics only
- **Impact:** View/modify experiment data
- **Rotation URL:** https://wandb.ai/settings

#### 11. **Sentry DSN** (LOW - Error Tracking)
- **Location:** `backend/.env`, `.env.local`
- **Keys Found:**
  - `SENTRY_DSN=https://427c9f40afdbd3c2ec43f062f5609257@o4510522471219200.ingest.us.sentry.io/4510535827849216`
- **Risk Level:** LOW - Public DSN (can be exposed)
- **Impact:** Minimal - send fake errors
- **Rotation URL:** https://sentry.io (optional)

---

## Git History Analysis (Re-verified December 30, 2025)

### ✅ Good News!

1. **No actual .env files committed to git**
   - Verified: Only template files in git history
   - `.gitignore` properly excludes all `.env` variations
   - Last check: December 30, 2025

2. **No hardcoded secrets in git commits**
   - Searched full git history for:
     - Stripe keys (`sk_live_`, `sk_test_`, `pk_live_`)
     - AWS keys (`AKIA`)
     - JWT tokens (`eyJ`)
     - MongoDB passwords
   - Only found placeholders and documentation examples

3. **Strong .gitignore in place**
   - Created in November 2025 audit
   - Excludes all secret variations
   - Includes security warnings

**Conclusion:** No public exposure detected, but rotation still recommended as precautionary measure.

---

## Automated Rotation & Prevention Tools

I'll now create automated scripts to help you rotate keys and prevent future leaks.

---

## Step-by-Step Rotation Guide

### 1️⃣ Stripe Keys Rotation

**Steps:**
```bash
# 1. Login to Stripe Dashboard
open https://dashboard.stripe.com/apikeys

# 2. Create new secret key
# - Click "Create secret key"
# - Name: "PropIQ Backend (Rotated 2025-12-30)"
# - Copy the new key (starts with sk_live_)

# 3. Create new publishable key (if needed)
# - Usually auto-generated, just copy it

# 4. Update backend/.env
# Replace:
#   STRIPE_SECRET_KEY=sk_live_OLD_KEY
# With:
#   STRIPE_SECRET_KEY=sk_live_NEW_KEY

# 5. Recreate webhook
# - Go to: https://dashboard.stripe.com/webhooks
# - Delete old webhook
# - Create new webhook with endpoint: https://luntra-outreach-app.azurewebsites.net/stripe/webhook
# - Copy new webhook secret (starts with whsec_)
# - Update STRIPE_WEBHOOK_SECRET in .env

# 6. Delete old keys
# - Go back to API keys page
# - Click "..." on old key → "Delete"

# 7. Redeploy backend
cd /Users/briandusape/Projects/propiq/backend
./deploy-azure.sh

# 8. Update Azure App Settings
# Go to Azure Portal → App Service → Configuration
# Update STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
```

### 2️⃣ Supabase Keys Rotation

**Steps:**
```bash
# 1. Login to Supabase
open https://supabase.com/dashboard

# 2. Select your PropIQ project

# 3. Go to Settings → API

# 4. Regenerate service_role key
# - Click "Reset" next to service_role secret
# - Copy new key

# 5. Update backend/.env
#   SUPABASE_SERVICE_KEY=NEW_KEY_HERE

# 6. Anon key usually doesn't need rotation (it's public-facing)
# But if you want to rotate it:
#   - Reset anon public key
#   - Update SUPABASE_ANON_KEY in .env
#   - Update frontend/.env.local with new VITE_SUPABASE_ANON_KEY

# 7. Redeploy backend and frontend
cd /Users/briandusape/Projects/propiq/backend
./deploy-azure.sh
```

### 3️⃣ Azure OpenAI Key Rotation

**Steps:**
```bash
# 1. Login to Azure Portal
open https://portal.azure.com

# 2. Navigate to your OpenAI resource
# Search for "luntra-openai-service"

# 3. Go to "Keys and Endpoint"

# 4. Regenerate Key 1 or Key 2
# - Click "Regenerate Key 1"
# - Copy the new key

# 5. Update backend/.env
#   AZURE_OPENAI_KEY=NEW_KEY_HERE

# 6. Redeploy backend
cd /Users/briandusape/Projects/propiq/backend
./deploy-azure.sh

# 7. Update Azure App Settings
```

### 4️⃣ MongoDB Password Rotation

**Steps:**
```bash
# 1. Login to MongoDB Atlas
open https://cloud.mongodb.com

# 2. Go to "Database Access"

# 3. Find user "propIQ_backend_user"

# 4. Click "Edit" → "Edit Password"

# 5. Click "Autogenerate Secure Password"
# - Copy the new password

# 6. Update backend/.env
# Replace password in:
#   MONGODB_URI=mongodb+srv://propIQ_backend_user:NEW_PASSWORD@propiq-production-clust.q4050y.mongodb.net/propiq?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster

# 7. Redeploy backend
cd /Users/briandusape/Projects/propiq/backend
./deploy-azure.sh

# 8. Verify connection works
curl https://luntra-outreach-app.azurewebsites.net/propiq/health
```

### 5️⃣ SendGrid API Key Rotation

**Steps:**
```bash
# 1. Login to SendGrid
open https://app.sendgrid.com/settings/api_keys

# 2. Create new API key
# - Click "Create API Key"
# - Name: "PropIQ Backend (Rotated 2025-12-30)"
# - Permissions: Full Access (or Email Send only)
# - Copy the key (starts with SG.)

# 3. Update backend/.env
#   SENDGRID_API_KEY=SG.NEW_KEY_HERE

# 4. Delete old API key
# - Find old key in list
# - Click "..." → "Delete"

# 5. Redeploy backend
cd /Users/briandusape/Projects/propiq/backend
./deploy-azure.sh

# 6. Test email sending
# Send a test email through your app
```

### 6️⃣ Convex Deploy Key Rotation

**Steps:**
```bash
# 1. Login to Convex
open https://dashboard.convex.dev

# 2. Select PropIQ project

# 3. Go to Settings → Deploy Keys

# 4. Create new deploy key
# - Click "Create Deploy Key"
# - Copy the new key

# 5. Update .env.local
#   CONVEX_DEPLOY_KEY=NEW_KEY_HERE

# 6. Delete old deploy key

# 7. Redeploy Convex functions
cd /Users/briandusape/Projects/propiq
npx convex deploy
```

### 7️⃣ JWT Secret Rotation

**⚠️ WARNING: This will log out ALL users!**

**Steps:**
```bash
# 1. Generate new JWT secret
openssl rand -hex 32

# 2. Update backend/.env
#   JWT_SECRET=NEW_64_CHAR_HEX_STRING

# 3. Redeploy backend
cd /Users/briandusape/Projects/propiq/backend
./deploy-azure.sh

# 4. Notify users
# - Send email: "We've upgraded our security. Please log in again."
# - Add banner to app: "Session expired. Please log in."
```

---

## Leak Prevention Implementation

### Option 1: Git-Secrets (Recommended)

Git-secrets prevents you from committing secrets to git.

**Install:**
```bash
# macOS
brew install git-secrets

# Or clone and install manually
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install
```

**Setup for PropIQ:**
```bash
cd /Users/briandusape/Projects/propiq

# Initialize git-secrets
git secrets --install

# Register AWS provider (basic patterns)
git secrets --register-aws

# Add custom patterns for your keys
git secrets --add 'sk_live_[a-zA-Z0-9]{99,}'                          # Stripe live keys
git secrets --add 'sk_test_[a-zA-Z0-9]{99,}'                          # Stripe test keys
git secrets --add 'pk_live_[a-zA-Z0-9]{99,}'                          # Stripe publishable keys
git secrets --add 'whsec_[a-zA-Z0-9]{32,}'                           # Stripe webhook secrets
git secrets --add 'SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}'        # SendGrid keys
git secrets --add 'mongodb\+srv://[^"'\''[:space:]]*'                # MongoDB URIs
git secrets --add 'sb_secret_[a-zA-Z0-9_-]{20,}'                    # Supabase service keys
git secrets --add 'eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}'      # JWT tokens
git secrets --add '[0-9a-f]{64}'                                     # 64-char hex (JWT secrets)
git secrets --add 'AKIA[0-9A-Z]{16}'                                # AWS access keys

# Scan current repo
git secrets --scan

# Scan all history (takes longer)
git secrets --scan-history
```

**Test it:**
```bash
# Try to commit a fake secret
echo "STRIPE_SECRET_KEY=sk_live_test123456" > test-secret.txt
git add test-secret.txt
git commit -m "test"
# Should BLOCK the commit!

# Clean up
rm test-secret.txt
git reset HEAD test-secret.txt
```

### Option 2: Gitleaks (Alternative)

Gitleaks is another popular secret scanner.

**Install:**
```bash
brew install gitleaks
```

**Usage:**
```bash
cd /Users/briandusape/Projects/propiq

# Scan current repo
gitleaks detect --source . --verbose

# Scan before every commit (manual)
gitleaks protect --staged --verbose

# Integrate with pre-commit hook
# Add to .git/hooks/pre-commit:
#!/bin/bash
gitleaks protect --staged --verbose --redact
```

### Option 3: Pre-Commit Framework (Most Comprehensive)

Pre-commit manages multiple hooks including secret detection.

**Install:**
```bash
pip install pre-commit
```

**Create `.pre-commit-config.yaml`:**
```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
        exclude: package-lock.json

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: check-added-large-files
      - id: check-json
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
```

**Setup:**
```bash
cd /Users/briandusape/Projects/propiq

# Install hooks
pre-commit install

# Create baseline (excludes existing secrets from scan)
detect-secrets scan > .secrets.baseline

# Run on all files
pre-commit run --all-files

# Now every git commit will run these checks automatically!
```

### Option 4: GitHub Secret Scanning (Cloud-based)

**Enable on GitHub:**
1. Go to: https://github.com/YOUR_USERNAME/propiq/settings/security_analysis
2. Enable "Secret scanning"
3. Enable "Push protection" (blocks pushes with secrets)
4. Enable "Secret scanning alerts"

**Configure notifications:**
1. Go to: https://github.com/YOUR_USERNAME/propiq/settings/security_analysis
2. Click "Enable" for all scanning features
3. Add your email for notifications

---

## Post-Rotation Checklist

After rotating each key, verify:

```bash
# Stripe
- [ ] New secret key works in backend
- [ ] Payments process successfully
- [ ] Webhooks receive events
- [ ] Old key deleted from Stripe dashboard

# Supabase
- [ ] Database connections work
- [ ] Queries execute successfully
- [ ] Auth flows work
- [ ] Old key revoked

# Azure OpenAI
- [ ] Property analysis works
- [ ] API calls succeed
- [ ] No billing issues
- [ ] Old key regenerated (can't be used)

# MongoDB
- [ ] Database connections work
- [ ] Queries succeed
- [ ] No authentication errors
- [ ] Old password changed

# SendGrid
- [ ] Test email sends successfully
- [ ] Old key deleted
- [ ] No delivery issues

# Convex
- [ ] Deployments work
- [ ] Functions execute
- [ ] Old key revoked

# JWT Secret
- [ ] Users can log in
- [ ] Sessions persist correctly
- [ ] Tokens validate properly
- [ ] Old sessions invalidated

# Other services
- [ ] All integrations tested
- [ ] No errors in logs
- [ ] Azure App Settings updated
```

---

## Monitoring & Alerts

### Set Up Alerts for Unusual Activity

**1. Stripe:**
- Enable fraud detection: https://dashboard.stripe.com/radar
- Set up webhooks for unusual charges
- Enable email notifications for large transactions

**2. Azure:**
- Set budget alerts: https://portal.azure.com → Cost Management
- Alert threshold: $100/month
- Enable email notifications

**3. MongoDB Atlas:**
- Enable performance advisor
- Set up alerts for unusual query patterns
- Enable email notifications

**4. SendGrid:**
- Enable rate limit alerts
- Monitor email bounce rates
- Set up spam complaint alerts

---

## Long-Term Security Improvements

### 1. Implement Secret Rotation Schedule

**Quarterly Rotation (Every 90 days):**
- Critical keys: Stripe, Supabase, Azure OpenAI, MongoDB
- Set calendar reminders
- Document each rotation

**Annual Rotation:**
- JWT secret (requires user logout notification)
- Less critical keys: Sentry, W&B

**Immediate Rotation Triggers:**
- Team member leaves
- Suspected breach
- Security audit findings

### 2. Use Secret Management Service

**Recommended Options:**

**For Small Teams (Free/Low Cost):**
- **Doppler:** https://doppler.com
  - Free for small teams
  - Easy integration
  - Automatic syncing

**For Azure Users:**
- **Azure Key Vault:** https://azure.microsoft.com/en-us/services/key-vault/
  - Native Azure integration
  - Pay-as-you-go pricing
  - Works with App Service

**For Development Teams:**
- **1Password for Developers:** https://1password.com/developers
  - Secure secret sharing
  - CLI integration
  - Team management

### 3. Environment-Specific Keys

**Use different keys for each environment:**
- Development: `_dev` suffix
- Staging: `_staging` suffix
- Production: `_prod` suffix

**Example:**
```bash
# Development
STRIPE_SECRET_KEY=sk_test_ABC123_dev

# Staging
STRIPE_SECRET_KEY=sk_test_XYZ789_staging

# Production
STRIPE_SECRET_KEY=sk_live_REAL_KEY_prod
```

### 4. Audit Logs Review

**Monthly Reviews:**
- [ ] Stripe payment logs
- [ ] Supabase database access logs
- [ ] Azure OpenAI usage logs
- [ ] SendGrid email logs
- [ ] MongoDB connection logs

**Look for:**
- Unusual API call patterns
- Failed authentication attempts
- Unexpected geographic locations
- Spike in usage/billing

---

## Automated Rotation Tracking

I'll create a script to track when keys were last rotated.

---

## Summary

### Critical Actions Required TODAY:

1. **Rotate Stripe keys** (financial risk)
2. **Rotate Supabase service key** (data access)
3. **Rotate Azure OpenAI key** (billing risk)
4. **Rotate MongoDB password** (data access)
5. **Rotate SendGrid key** (reputation risk)

### This Week:

6. **Install git-secrets or gitleaks**
7. **Enable GitHub secret scanning**
8. **Rotate moderate-priority keys** (Convex, Intercom, Slack)

### This Month:

9. **Set up secret rotation calendar**
10. **Implement secret management service** (Doppler or Azure Key Vault)
11. **Create .env.template files** for all environments
12. **Audit all service access logs**

---

## Resources

### Rotation Dashboards:
- Stripe: https://dashboard.stripe.com/apikeys
- Supabase: https://supabase.com/dashboard
- Azure: https://portal.azure.com
- MongoDB: https://cloud.mongodb.com
- SendGrid: https://app.sendgrid.com/settings/api_keys
- Convex: https://dashboard.convex.dev

### Secret Scanning Tools:
- Git-secrets: https://github.com/awslabs/git-secrets
- Gitleaks: https://github.com/gitleaks/gitleaks
- detect-secrets: https://github.com/Yelp/detect-secrets
- pre-commit: https://pre-commit.com

### Secret Management:
- Doppler: https://doppler.com
- Azure Key Vault: https://azure.microsoft.com/services/key-vault
- 1Password: https://1password.com/developers

### Security Best Practices:
- OWASP Top 10: https://owasp.org/www-project-top-ten
- Stripe Security: https://stripe.com/docs/security
- MongoDB Security: https://docs.mongodb.com/manual/security

---

**Audit Completed:** December 30, 2025
**Status:** 🟡 Credential Rotation Required
**Next Review:** March 30, 2026 (90 days)
**Previous Audit:** November 6, 2025

---

**End of Security Audit Report**
