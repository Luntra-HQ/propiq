# Luntra Backend - Render.com Deployment Guide

**Quick deployment guide using your existing credentials**

---

## Step 1: Get MongoDB Connection String

You mentioned you already have MongoDB set up. You need to get the connection string.

### Find Your MongoDB Connection String:

1. Go to https://cloud.mongodb.com
2. Log in to your account
3. Click **"Connect"** on your cluster
4. Choose **"Drivers"**
5. Copy the connection string (looks like this):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Add `/luntra` before the `?`** to specify the database:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/luntra?retryWrites=true&w=majority
   ```

**Save this! You'll need it in Step 3.**

---

## Step 2: Deploy to Render.com

### 2.1 Create Render Account

Go to: https://dashboard.render.com/register

- Sign up with GitHub (recommended)
- Authorize Render to access your repositories

### 2.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect to GitHub repository: **bdusape/OUTREACH-APP**
3. Click **"Connect"**

### 2.3 Configure Service Settings

**Fill in these exact settings:**

```
Name: luntra-api
Region: Oregon (US West)
Branch: production-api  ⚠️ IMPORTANT!
Root Directory: (leave blank)
Runtime: Python 3

Build Command: pip install -r requirements.txt
Start Command: uvicorn api:app --host 0.0.0.0 --port $PORT

Instance Type: Free
```

**⚠️ DON'T click "Create Web Service" yet!**

Scroll down to add environment variables first.

---

## Step 3: Add Environment Variables

In the **"Environment Variables"** section, click **"Add Environment Variable"** for each of these:

### REQUIRED Variables (Must Add):

```bash
# 1. Application
ENVIRONMENT = production

# 2. Database (YOUR ACTUAL MONGODB CONNECTION STRING)
MONGODB_URI = mongodb+srv://dealIQ_backend_user:nahpyr-dyPhy3-xoqwat@propiq-production-clust.q4050y.mongodb.net/luntra?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster

# 3. CORS
ALLOWED_ORIGINS = https://luntra.one,https://app.luntra.one
```

### Email Provider (Using Resend):

```bash
EMAIL_PROVIDER = resend
RESEND_API_KEY = re_H7EmkHzY_35Evxg2J4cG7Qfp5eMT2BkGk
RESEND_FROM = bdusape@gmail.com
```

### Stripe (Payment Integration):

```bash
STRIPE_SECRET_KEY = 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
STRIPE_PRICE_ID = price_1RqHkREtJUE5bLBgPGCA4EOz
STRIPE_WEBHOOK_SECRET = whsec_05faf4882ab063e18686d4088b8ee2d6293095a5ce5f74805cbf701bb45745d4
```

### External APIs:

```bash
# OpenAI
OPENAI_API_KEY = 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

# Serper (Search API)
SERPER_API_KEY = 4683d1c1e4dcbec517be9c7ef871d5e1ef10a613

# Apollo (Lead Enrichment)
APOLLO_API_KEY = nBonFucH5lRJoY-eMyDdTA
```

### Optional (Can add later):

```bash
PYTHON_VERSION = 3.11
COMET_API_KEY = (your comet key if you have one)
COMET_WORKSPACE = luntra-ai
COMET_PROJECT = luntra-backend
```

---

## Step 4: Deploy!

Now click **"Create Web Service"** at the bottom.

### What Happens:

1. Render clones your repository (production-api branch)
2. Installs Python dependencies (~2-3 minutes)
3. Starts your API server
4. Gives you a URL like: `https://luntra-api.onrender.com`

### Watch for Success Logs:

You'll see logs streaming. Look for these lines:

```
✅ Auth router registered
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000
```

When you see that, **YOU'RE LIVE!** 🎉

---

## Step 5: Get Your Backend URL

After deployment:

1. Copy the URL from the top of the page
2. It looks like: `https://luntra-api.onrender.com`
3. Test it: `https://luntra-api.onrender.com/health`

You should see:

```json
{
  "status": "healthy",
  "build_hash": "c96d193",
  "build_timestamp": "2025-10-20...",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## Step 6: Verify MongoDB Connection

Once deployed, check Render logs for:

```
✅ Auth router registered
```

This means MongoDB connected successfully!

If you see:
```
⚠️  MongoDB not available: ...
```

Then check:
1. MongoDB connection string is correct
2. Password has special characters (might need URL encoding)
3. MongoDB Atlas network access allows 0.0.0.0/0

---

## Quick Reference: Copy-Paste Environment Variables

Here's the full list to copy/paste into Render (one per line):

```
ENVIRONMENT=production
MONGODB_URI=mongodb+srv://dealIQ_backend_user:nahpyr-dyPhy3-xoqwat@propiq-production-clust.q4050y.mongodb.net/luntra?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster
ALLOWED_ORIGINS=https://luntra.one,https://app.luntra.one
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_H7EmkHzY_35Evxg2J4cG7Qfp5eMT2BkGk
RESEND_FROM=bdusape@gmail.com
STRIPE_SECRET_KEY=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
STRIPE_PRICE_ID=price_1RqHkREtJUE5bLBgPGCA4EOz
STRIPE_WEBHOOK_SECRET=whsec_05faf4882ab063e18686d4088b8ee2d6293095a5ce5f74805cbf701bb45745d4
OPENAI_API_KEY=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
SERPER_API_KEY=4683d1c1e4dcbec517be9c7ef871d5e1ef10a613
APOLLO_API_KEY=nBonFucH5lRJoY-eMyDdTA
```

**Remember to replace** `YOUR_MONGODB_CONNECTION_STRING` with your actual MongoDB connection string!

---

## Troubleshooting

### Build Fails

**Error:** `Could not find a version that satisfies the requirement fastapi`

**Fix:** In Render settings:
- Go to "Environment"
- Set `PYTHON_VERSION = 3.11`
- Redeploy

### App Crashes on Start

**Check logs for:**
- `MongoDB not available` → Fix MONGODB_URI
- `Port already in use` → Render handles this automatically
- `Import error` → Missing dependency in requirements.txt

### Health Check Returns 503

**Possible causes:**
1. MongoDB connection failed
2. Environment variables not set
3. App didn't start properly

**Fix:** Check Render logs for the actual error

---

## Next Steps After Deployment

Once your backend is deployed and healthy:

1. **Test the health endpoint**:
   ```bash
   curl https://luntra-api.onrender.com/health
   ```

2. **Run deployment verification**:
   ```bash
   cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/frontend
   npm run deploy:verify https://luntra-api.onrender.com
   ```

3. **Update frontend with backend URL**:
   - Update `VITE_API_BASE` in frontend
   - Redeploy frontend

4. **Run full integration tests**:
   ```bash
   npm run test:integration:production
   ```

---

## Your Deployment Checklist

- [ ] Get MongoDB connection string
- [ ] Create Render.com account
- [ ] Connect GitHub repository
- [ ] Select production-api branch
- [ ] Add all environment variables (especially MONGODB_URI)
- [ ] Deploy
- [ ] Verify /health endpoint
- [ ] Test auth endpoints (/auth/signup, /auth/login)
- [ ] Update frontend VITE_API_BASE
- [ ] Run integration tests

---

**Estimated Time:** 15-20 minutes

**Your backend URL will be:** `https://luntra-api.onrender.com`

Ready to deploy? Start at **Step 1**!
