# Luntra Backend API Deployment Guide

Complete guide for deploying the Luntra FastAPI backend to production.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Deployment Platforms](#deployment-platforms)
4. [Environment Configuration](#environment-configuration)
5. [Deployment Methods](#deployment-methods)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

**For Render.com deployment:**

```bash
# 1. Push backend to GitHub
cd /path/to/backend
git push origin production-api

# 2. Go to https://dashboard.render.com
# 3. New Web Service
# 4. Connect GitHub repository: bdusape/OUTREACH-APP
# 5. Select branch: production-api
# 6. Configure:
#    - Name: luntra-api
#    - Environment: Python 3
#    - Build Command: pip install -r requirements.txt
#    - Start Command: uvicorn api:app --host 0.0.0.0 --port $PORT
# 7. Add environment variables from .env.example
# 8. Deploy
```

---

## Prerequisites

### 1. Repository Setup

The backend code is now in the `production-api` branch:

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/backend
git branch  # Should show: production-api
git remote -v  # Should show: https://github.com/bdusape/OUTREACH-APP.git
```

### 2. Required Services

Before deploying, ensure you have accounts and credentials for:

- **MongoDB Atlas** (or MongoDB Cloud)
  - Create cluster at: https://www.mongodb.com/cloud/atlas
  - Database name: `luntra`
  - Collection: `users`
  - Get connection string (mongodb+srv://...)

- **Comet ML** (optional, for experiment tracking)
  - Sign up at: https://www.comet.com
  - Get API key from: https://www.comet.com/api/my/settings/
  - Create workspace: `luntra-ai`
  - Create project: `luntra-backend`

- **Email Provider** (choose one)
  - **Resend** (recommended): https://resend.com/api-keys
  - **SendGrid**: https://app.sendgrid.com/settings/api_keys

- **Stripe** (for payments)
  - Get keys from: https://dashboard.stripe.com/apikeys
  - Get webhook secret from: https://dashboard.stripe.com/webhooks

### 3. Domain Setup (Optional)

If using custom domain:
- Point `api.luntra.one` A record to deployment platform IP
- Or use CNAME to platform-provided domain

---

## Deployment Platforms

### Option 1: Render.com (Recommended)

**Pros:**
- Free tier available
- Auto-deploys from GitHub
- Built-in HTTPS
- Easy environment variable management
- Good for FastAPI/Python

**Steps:**

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `bdusape/OUTREACH-APP`
4. Select branch: `production-api`
5. Configure service:
   ```
   Name: luntra-api
   Region: Oregon (US West) or closest to you
   Branch: production-api
   Root Directory: (leave blank)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn api:app --host 0.0.0.0 --port $PORT
   ```
6. Choose plan: Free or Starter ($7/mo)
7. Add environment variables (see section below)
8. Click "Create Web Service"

**Custom Domain Setup (Render):**
1. In Render dashboard → Settings → Custom Domain
2. Add: `api.luntra.one`
3. Add DNS records as instructed
4. Wait for SSL certificate provisioning

### Option 2: Railway.app

**Pros:**
- $5 free credit monthly
- Simpler interface
- Automatic deploys from GitHub

**Steps:**

1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose `bdusape/OUTREACH-APP`
4. Add variables:
   ```
   RAILWAY_BRANCH=production-api
   PORT=8000
   ```
5. Add environment variables
6. Deploy

### Option 3: Heroku

**Steps:**

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create luntra-api

# Set buildpack
heroku buildpacks:set heroku/python

# Add remote
git remote add heroku https://git.heroku.com/luntra-api.git

# Push to Heroku
git push heroku production-api:main

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set COMET_API_KEY=your_comet_api_key
# ... (add all variables)

# Open app
heroku open
```

---

## Environment Configuration

### Required Environment Variables

Copy from `.env.example` and fill in your values:

```bash
# Application
ENVIRONMENT=production
PORT=8000

# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luntra?retryWrites=true&w=majority

# Comet ML (Optional - for logging)
COMET_API_KEY=your_comet_api_key
COMET_WORKSPACE=luntra-ai
COMET_PROJECT=luntra-backend

# Email Provider (Choose one)
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=noreply@luntra.one

# OR use SendGrid
# EMAIL_PROVIDER=sendgrid
# SENDGRID_API_KEY=your_sendgrid_api_key
# FROM_EMAIL=noreply@luntra.one

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PRICE_ID=price_your_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS (IMPORTANT)
ALLOWED_ORIGINS=https://luntra.one

# External APIs (Optional)
OPENAI_API_KEY=sk-proj-your_openai_api_key
SERPER_API_KEY=your_serper_api_key
APOLLO_API_KEY=your_apollo_api_key

# Build Info (Auto-generated by platform)
BUILD_TIMESTAMP=
PYTHON_VERSION=3.11
```

### MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create new cluster (Free tier: M0)
3. Database Access → Add New Database User
   - Username: `luntra-app`
   - Password: (generate strong password)
4. Network Access → Add IP Address
   - For Render: Add `0.0.0.0/0` (allows all IPs)
   - For production: Add specific IPs
5. Connect → Connect your application
   - Copy connection string
   - Replace `<username>` and `<password>`
   - Example: `mongodb+srv://luntra-app:pass123@cluster0.xxxxx.mongodb.net/luntra?retryWrites=true&w=majority`

---

## Deployment Methods

### Method 1: Render Dashboard (Recommended)

1. Log in to https://dashboard.render.com
2. Navigate to your service: `luntra-api`
3. Go to "Environment" tab
4. Add all environment variables
5. Go to "Settings" tab
6. Scroll to "Deploy Hook"
7. Click "Manual Deploy" → "Deploy latest commit"
8. Monitor logs in "Logs" tab
9. Service will be available at: `https://luntra-api.onrender.com`

### Method 2: Auto-Deploy (Git Push)

If auto-deploy is enabled:

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/backend

# Make changes to code
git add .
git commit -m "Update backend API"
git push origin production-api

# Render automatically deploys within 1-2 minutes
```

### Method 3: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Set branch
railway environment production-api

# Add environment variables
railway variables set MONGODB_URI=your_mongodb_uri
railway variables set COMET_API_KEY=your_comet_api_key
# ... (add all variables)

# Deploy
railway up
```

---

## Post-Deployment Verification

### Step 1: Health Check

After deployment completes, verify the /health endpoint:

```bash
# Replace with your deployment URL
curl https://luntra-api.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "build_hash": "96a0d3d",
  "build_timestamp": "2025-10-20T12:34:56.789Z",
  "version": "1.0.0",
  "environment": "production",
  "python_version": "3.11",
  "deployed_at": "2025-10-20T12:34:56.789Z"
}
```

### Step 2: Run Frontend Deployment Verification

From the frontend directory:

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/frontend

# Verify deployment with script
npm run deploy:verify:production

# Expected output:
# ✅ Health check passed
# ✅ Build hash present: 96a0d3d
# ✅ Response time: 234ms
```

### Step 3: Run Full Backend Deployment Tests

```bash
# Set API URL
export VITE_API_BASE=https://luntra-api.onrender.com

# Run comprehensive tests
npm run test:backend-deploy:production

# Expected results:
# - 24 tests (8 scenarios × 3 browsers)
# - All tests passing
# - Build hash validated
# - Response times < 2 seconds
```

### Step 4: Test Auth Endpoints

```bash
# Test user signup
curl -X POST https://luntra-api.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Expected response:
{
  "success": true,
  "userId": "676a9b8c7d8e9f0001234567",
  "message": "User created successfully"
}

# Test user login
curl -X POST https://luntra-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123"
  }'

# Expected response:
{
  "success": true,
  "userId": "676a9b8c7d8e9f0001234567",
  "message": "Login successful"
}
```

### Step 5: Update Frontend API URL

In frontend `.env`:

```bash
VITE_API_BASE=https://luntra-api.onrender.com
```

Or use custom domain:

```bash
VITE_API_BASE=https://api.luntra.one
```

Then redeploy frontend:

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/frontend
npm run deploy:frontend
```

---

## Troubleshooting

### Issue 1: Build Fails with Missing Dependencies

**Error:**
```
ERROR: Could not find a version that satisfies the requirement fastapi==0.115.0
```

**Solution:**
1. Check `requirements.txt` is in root directory
2. Verify Python version (should be 3.11+)
3. In Render dashboard → Settings → Python Version → Select "3.11"

### Issue 2: Health Endpoint Returns 503

**Error:**
```
{"detail": "Database service unavailable"}
```

**Solution:**
1. Check MongoDB connection string is correct
2. Verify MongoDB Atlas Network Access allows your deployment IP
3. Test connection:
   ```bash
   # In Render dashboard → Shell
   python
   >>> from pymongo import MongoClient
   >>> import os
   >>> client = MongoClient(os.getenv("MONGODB_URI"))
   >>> client.server_info()  # Should return server info
   ```

### Issue 3: Build Hash Shows "unknown"

**Error:**
```json
{"build_hash": "unknown"}
```

**Solution:**
This is normal in some deployment environments where git is not available. The build hash is for traceability and can be "unknown" without affecting functionality.

To fix, add build-time environment variable:
```bash
BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

### Issue 4: CORS Errors in Browser Console

**Error:**
```
Access to fetch at 'https://luntra-api.onrender.com/auth/login' from origin 'https://luntra.one' has been blocked by CORS policy
```

**Solution:**
1. Check `ALLOWED_ORIGINS` environment variable
2. Should include: `https://luntra.one`
3. For multiple origins:
   ```bash
   ALLOWED_ORIGINS=https://luntra.one,https://www.luntra.one
   ```
4. Redeploy after updating

### Issue 5: Slow Cold Starts (Render Free Tier)

**Symptoms:**
- First request after 15 minutes takes 30-60 seconds
- Subsequent requests are fast

**Solution:**
- This is expected on Render free tier
- Service "sleeps" after 15 minutes of inactivity
- Upgrade to Starter plan ($7/mo) for always-on
- Or implement ping service to keep warm:
  ```bash
  # Add to continuous-monitor.sh
  curl https://luntra-api.onrender.com/health
  ```

### Issue 6: MongoDB Connection Timeout

**Error:**
```
pymongo.errors.ServerSelectionTimeoutError: connection closed
```

**Solution:**
1. Check MongoDB Atlas Network Access
   - Add `0.0.0.0/0` for testing
   - Add specific IPs for production
2. Verify connection string includes `?retryWrites=true&w=majority`
3. Check MongoDB Atlas cluster status (should be green)
4. Test with shorter timeout:
   ```python
   MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
   ```

---

## Security Checklist

Before going live:

- [ ] MongoDB Network Access restricted to deployment IPs
- [ ] Strong MongoDB user password (20+ characters)
- [ ] All API keys rotated (not using development keys)
- [ ] `.env` file not committed to git
- [ ] CORS allowed origins only includes production URLs
- [ ] HTTPS enabled (automatic on Render/Railway)
- [ ] Stripe webhook secret configured
- [ ] Rate limiting enabled (add middleware if needed)
- [ ] Error messages don't expose sensitive info
- [ ] Dependency security audit passed
  ```bash
  pip audit  # or check GitHub security alerts
  ```

---

## Monitoring and Logging

### Render Logs

View real-time logs:
1. Render dashboard → luntra-api → Logs
2. Filter by severity: Info, Warning, Error
3. Download logs for analysis

### Comet ML Experiments

If Comet ML is configured:
1. Go to https://www.comet.com/luntra-ai/luntra-backend
2. View experiments for:
   - User signups
   - User logins
   - Database operations
   - Errors and failures

### Health Monitoring

Add to cron or monitoring service:

```bash
# Check every 5 minutes
*/5 * * * * curl -f https://luntra-api.onrender.com/health || echo "API down!"
```

Or use uptime monitoring services:
- UptimeRobot (free): https://uptimerobot.com
- Pingdom
- StatusCake

---

## Scaling and Performance

### Current Capacity

- **Free tier**: 512 MB RAM, 0.5 CPU
- **Expected load**: 10-50 requests/minute
- **Database**: MongoDB Atlas M0 (512 MB storage)

### When to Upgrade

Upgrade when:
- RAM usage > 80% consistently
- Response times > 2 seconds
- Cold starts affecting users
- Need more than 100 GB bandwidth/month

### Upgrade Path

1. Render Starter: $7/mo (512 MB RAM, always-on)
2. Render Standard: $25/mo (2 GB RAM, 1 CPU)
3. MongoDB Atlas M10: $57/mo (2 GB RAM, dedicated)

---

## Rollback Procedure

If deployment fails:

```bash
# Method 1: Render Dashboard
# 1. Go to Render dashboard → luntra-api → Events
# 2. Find last successful deploy
# 3. Click "Redeploy"

# Method 2: Git Revert
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/backend
git revert HEAD
git push origin production-api
# Render auto-deploys previous version

# Method 3: Roll back to specific commit
git log  # Find commit hash
git reset --hard <commit-hash>
git push -f origin production-api
```

---

## Summary

**Backend Deployment Checklist:**

- [x] Code committed to `production-api` branch
- [ ] MongoDB Atlas cluster created and configured
- [ ] Environment variables added to deployment platform
- [ ] Deployment platform connected to GitHub
- [ ] Service deployed successfully
- [ ] /health endpoint returns 200 with build hash
- [ ] Auth endpoints tested (signup/login)
- [ ] Frontend updated with production API URL
- [ ] Frontend redeployed with new API URL
- [ ] Full integration tests passing
- [ ] Monitoring and alerts configured

**Production URLs:**

- Backend API: `https://luntra-api.onrender.com` (or `https://api.luntra.one`)
- Health Check: `https://luntra-api.onrender.com/health`
- Auth Endpoints: `https://luntra-api.onrender.com/auth/*`
- Frontend: `https://luntra.one`

**Support:**

- Render Dashboard: https://dashboard.render.com
- MongoDB Atlas: https://cloud.mongodb.com
- Comet ML: https://www.comet.com/luntra-ai/luntra-backend
- GitHub Repository: https://github.com/bdusape/OUTREACH-APP/tree/production-api

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section or check deployment platform logs.
