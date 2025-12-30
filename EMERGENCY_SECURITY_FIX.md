# 🚨 EMERGENCY SECURITY REMEDIATION GUIDE

**Created:** December 29, 2025
**Severity:** CRITICAL
**Estimated Time:** 4-6 hours
**Status:** 🔴 IN PROGRESS

---

## ⚠️ CRITICAL ALERT

**ALL PRODUCTION API KEYS AND SECRETS ARE COMPROMISED**

Your production credentials are exposed in `.env` files that may be visible in:
1. Local git history
2. GitHub repository (https://github.com/Luntra-HQ/propiq)
3. Potentially already harvested by automated scanners

**IMMEDIATE ACTION REQUIRED - Follow this guide step by step**

---

## 📋 PRE-FLIGHT CHECKLIST

Before starting, gather access to:
- [ ] Stripe Dashboard (stripe.com/login)
- [ ] Azure Portal (portal.azure.com)
- [ ] SendGrid Dashboard
- [ ] MongoDB Atlas
- [ ] Supabase Dashboard
- [ ] Weights & Biases
- [ ] Slack Workspace Admin
- [ ] Intercom Admin
- [ ] Convex Dashboard
- [ ] GitHub Repository Admin Access

**DO NOT SKIP ANY STEPS - This is a systematic recovery process**

---

## PHASE 1: STOP THE BLEEDING (NEXT 60 MINUTES)

### Step 1: Audit Current Access (5 minutes)

Check for suspicious activity:

#### Stripe
```bash
# Login to https://dashboard.stripe.com
# Go to: Developers → Logs
# Look for: Unknown API calls, refunds, customer access
# Check: Last 24 hours of activity
```

#### Azure OpenAI
```bash
# Login to https://portal.azure.com
# Navigate to: luntra-openai-service → Metrics
# Check: Unusual spike in API calls or costs
```

#### MongoDB Atlas
```bash
# Login to https://cloud.mongodb.com
# Go to: Clusters → propiq-production-clust → Metrics
# Check: Network → Access List → Recent connections
# Look for: Unknown IP addresses
```

#### Supabase
```bash
# Login to https://supabase.com/dashboard
# Project: yvaujsbktvkzoxfzeimn
# Check: Logs → Recent queries from unknown IPs
```

**DOCUMENT ANY SUSPICIOUS ACTIVITY IMMEDIATELY**

---

### Step 2: Rotate ALL API Keys (45 minutes)

**⚠️ CRITICAL: Do these in order to avoid service disruption**

#### 2.1 Generate New Stripe Keys (10 min)

1. Login to Stripe Dashboard: https://dashboard.stripe.com
2. Go to: **Developers → API Keys**
3. Click: **+ Create secret key**
4. Label: "Production Key - Rotated Dec 2025"
5. **Copy the new key** (starts with `sk_live_`)
6. **DO NOT DELETE OLD KEY YET** (will do after updating env vars)

```bash
# Save temporarily (delete this file after)
echo "NEW_STRIPE_SECRET_KEY=<paste_key_here>" > ~/Desktop/new_keys.txt
```

#### 2.2 Rotate Azure OpenAI Key (5 min)

1. Login: https://portal.azure.com
2. Navigate to: **luntra-openai-service**
3. Go to: **Keys and Endpoint** (left sidebar)
4. Click: **Regenerate Key 1**
5. Copy the new key

```bash
echo "NEW_AZURE_OPENAI_KEY=<paste_key_here>" >> ~/Desktop/new_keys.txt
```

#### 2.3 Rotate SendGrid API Key (5 min)

1. Login: https://app.sendgrid.com
2. Go to: **Settings → API Keys**
3. Find the old key, click **Delete**
4. Click: **Create API Key**
5. Name: "PropIQ Production - Dec 2025"
6. Permissions: **Full Access**
7. Copy the key

```bash
echo "NEW_SENDGRID_API_KEY=<paste_key_here>" >> ~/Desktop/new_keys.txt
```

#### 2.4 Change MongoDB Password (5 min)

1. Login: https://cloud.mongodb.com
2. Go to: **Database Access** (left sidebar)
3. Find user: **propIQ_backend_user**
4. Click: **Edit**
5. Click: **Edit Password**
6. Choose: **Autogenerate Secure Password**
7. Copy the password
8. Click: **Update User**

```bash
echo "NEW_MONGODB_PASSWORD=<paste_password_here>" >> ~/Desktop/new_keys.txt
```

**Update connection string:**
```bash
# Format:
# mongodb+srv://propIQ_backend_user:<NEW_PASSWORD>@propiq-production-clust.q4050y.mongodb.net/propiq?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster
```

#### 2.5 Rotate Supabase Service Key (5 min)

1. Login: https://supabase.com/dashboard
2. Project: **yvaujsbktvkzoxfzeimn**
3. Go to: **Settings → API**
4. Click: **Reset service_role key**
5. Confirm warning
6. Copy new key

```bash
echo "NEW_SUPABASE_SERVICE_KEY=<paste_key_here>" >> ~/Desktop/new_keys.txt
```

#### 2.6 Generate New JWT Secret (2 min)

```bash
# Generate cryptographically secure JWT secret
openssl rand -hex 32

# Save it
echo "NEW_JWT_SECRET=<paste_output_here>" >> ~/Desktop/new_keys.txt
```

#### 2.7 Rotate Weights & Biases Key (3 min)

1. Login: https://wandb.ai
2. Go to: **User Settings → API Keys**
3. Click: **Revoke** on old key
4. Click: **New key**
5. Copy it

```bash
echo "NEW_WANDB_API_KEY=<paste_key_here>" >> ~/Desktop/new_keys.txt
```

#### 2.8 Regenerate Slack Webhook (3 min)

1. Go to: https://api.slack.com/apps
2. Find your app
3. Go to: **Incoming Webhooks**
4. Delete old webhook URL
5. Click: **Add New Webhook to Workspace**
6. Copy new URL

```bash
echo "NEW_SLACK_WEBHOOK_URL=<paste_url_here>" >> ~/Desktop/new_keys.txt
```

#### 2.9 Rotate Intercom Token (3 min)

1. Login: https://app.intercom.com
2. Go to: **Settings → Developers → Developer Hub**
3. Revoke old Access Token
4. Create new token
5. Copy it

```bash
echo "NEW_INTERCOM_ACCESS_TOKEN=<paste_token_here>" >> ~/Desktop/new_keys.txt
```

#### 2.10 Rotate Convex Deploy Key (4 min)

1. Login: https://dashboard.convex.dev
2. Go to your project: **propiq**
3. Go to: **Settings → Deploy Keys**
4. Click: **Revoke** on old key
5. Click: **Generate Deploy Key**
6. Copy it

```bash
echo "NEW_CONVEX_DEPLOY_KEY=<paste_key_here>" >> ~/Desktop/new_keys.txt
```

---

### Step 3: Update Environment Variables (10 minutes)

**Now we'll update all environment variables with the new keys**

#### 3.1 Update Convex Environment Variables

```bash
cd /Users/briandusape/Projects/propiq

# Set all new environment variables in Convex
npx convex env set AZURE_OPENAI_KEY "<NEW_AZURE_OPENAI_KEY>"
npx convex env set STRIPE_SECRET_KEY "<NEW_STRIPE_SECRET_KEY>"
npx convex env set STRIPE_WEBHOOK_SECRET "<keep_existing_or_regenerate>"
```

#### 3.2 Create NEW .env files (NOT tracked in git)

**These will be LOCAL ONLY - never committed**

---

## PHASE 2: SECURE THE REPOSITORY (NEXT 90 MINUTES)

### Step 4: Make Repository Private (5 minutes)

**IMMEDIATELY if it's public:**

1. Go to: https://github.com/Luntra-HQ/propiq
2. Click: **Settings** tab
3. Scroll to: **Danger Zone**
4. Click: **Change visibility**
5. Select: **Make private**
6. Type repository name to confirm
7. Click: **I understand, make this repository private**

---

### Step 5: Remove Secrets from Git History (60 minutes)

**⚠️ WARNING: This rewrites git history - notify all team members**

```bash
cd /Users/briandusape/Projects/propiq

# Create backup first
cd ..
cp -r propiq propiq_backup_$(date +%Y%m%d_%H%M%S)
cd propiq

# Method 1: Using git-filter-repo (recommended)
# Install if needed
pip3 install git-filter-repo

# Remove ALL .env files from history
git filter-repo --path .env --invert-paths --force
git filter-repo --path .env.local --invert-paths --force
git filter-repo --path backend/.env --invert-paths --force
git filter-repo --path frontend/.env.local --invert-paths --force

# Method 2: Using BFG (alternative)
# brew install bfg
# bfg --delete-files '.env*' --no-blob-protection
```

**After cleaning:**
```bash
# Force push to remote (requires force push permissions)
git push origin --force --all
git push origin --force --tags

# Tell team members to re-clone:
# git clone https://github.com/Luntra-HQ/propiq.git
```

---

### Step 6: Clean Up Exposed Secrets in Documentation (15 minutes)

**Remove hardcoded secrets from markdown files:**

```bash
# Search for remaining exposed keys
grep -r "sk_live_" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "SG\." . --exclude-dir=node_modules --exclude-dir=.git
grep -r "mongodb+srv://" . --exclude-dir=node_modules --exclude-dir=.git
```

**Files to clean:**
- RENDER_ENV_VARS.txt
- DEPLOY_NOW_CHECKLIST.md
- docs/DEPLOY_NOW.md
- docs/DEPLOYMENT_READY.md
- Any other files with hardcoded credentials

Replace with:
```bash
# Example:
STRIPE_SECRET_KEY=sk_live_*** (see .env.local)
MONGODB_URI=mongodb+srv://*** (see .env.local)
```

---

### Step 7: Revoke Old Keys (10 minutes)

**NOW delete the compromised keys from each service**

#### Stripe
1. Dashboard → Developers → API Keys
2. Find old key (starts with `sk_live_51RdHuv...`)
3. Click **Delete**
4. Confirm deletion

#### Azure OpenAI
- Key is already rotated (only 2 keys exist)

#### SendGrid
- Already deleted in Step 2.3

#### MongoDB
- Old password already replaced

#### Others
- Follow similar process for each service

---

## PHASE 3: IMPLEMENT SECURE SECRET MANAGEMENT (NEXT 2 HOURS)

### Step 8: Create Secure .env Files (30 minutes)

I'll create secure environment file templates in the next steps.

### Step 9: Set Up Secret Scanning (30 minutes)

I'll create pre-commit hooks and GitHub Actions workflows.

### Step 10: Add Security Headers & Rate Limiting (60 minutes)

I'll implement code fixes for CORS, security headers, and rate limiting.

---

## 🆘 EMERGENCY CONTACTS

If you encounter issues during remediation:
- Stripe Support: https://support.stripe.com
- Azure Support: https://portal.azure.com → Support
- MongoDB Support: https://www.mongodb.com/contact

---

## 📊 PROGRESS TRACKER

- [ ] Phase 1: Stop the Bleeding (60 min)
  - [ ] Step 1: Audit Current Access
  - [ ] Step 2: Rotate ALL API Keys
  - [ ] Step 3: Update Environment Variables
- [ ] Phase 2: Secure Repository (90 min)
  - [ ] Step 4: Make Repository Private
  - [ ] Step 5: Remove Secrets from Git History
  - [ ] Step 6: Clean Up Documentation
  - [ ] Step 7: Revoke Old Keys
- [ ] Phase 3: Implement Security (120 min)
  - [ ] Step 8: Create Secure .env Files
  - [ ] Step 9: Set Up Secret Scanning
  - [ ] Step 10: Add Security Headers

---

## ✅ COMPLETION CHECKLIST

When you've completed all steps:
- [ ] All API keys rotated
- [ ] Old keys revoked
- [ ] Git history cleaned
- [ ] Repository is private
- [ ] No secrets in documentation
- [ ] New .env files created (gitignored)
- [ ] Application still works
- [ ] Pre-commit hooks installed
- [ ] Team notified of changes

---

**NEXT:** I'll create the secure environment file templates and implementation scripts.

Let me know when you've completed Phase 1 and we'll move to Phase 2 together.
