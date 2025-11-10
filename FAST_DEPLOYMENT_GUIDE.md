# PropIQ Fast Deployment Guide

**Goal**: Deploy PropIQ frontend and backend in under 10 minutes

**Why This Guide?** Azure deployment is slow (10+ minutes). This guide uses Netlify for frontend (deploys in ~1 minute) and Render.com/Railway for backend (deploys in ~3 minutes).

---

## Quick Summary

| Component | Platform | Deploy Time | Cost |
|-----------|----------|-------------|------|
| **Frontend** | Netlify | ~1 minute | Free tier available |
| **Backend** | Render.com or Railway | ~3 minutes | Free tier available (with limits) |
| **Database** | MongoDB Atlas | Already configured | Free tier (512MB) |

**Total Deployment Time**: ~5 minutes 🚀

---

## Part 1: Frontend Deployment (Netlify)

### Option A: Netlify CLI (Fastest - 1 minute)

**Prerequisites:**
- Netlify CLI installed ✅ (already have v23.9.1)
- Frontend built ✅ (dist/ folder ready)

**Steps:**

1. **Navigate to frontend directory**
```bash
cd propiq/frontend
```

2. **Login to Netlify (first time only)**
```bash
netlify login
```
This opens your browser to authenticate.

3. **Initialize Netlify site**
```bash
netlify init
```

Follow the prompts:
- **Create & configure a new site**
- **Team**: Select your team (or Personal)
- **Site name**: `propiq-app` (or your preferred name)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

4. **Deploy!**
```bash
netlify deploy --prod
```

**Done!** Your frontend is live at `https://propiq-app.netlify.app` (or your custom domain)

### Option B: Netlify Dashboard (2 minutes)

1. **Go to** [app.netlify.com](https://app.netlify.com)
2. **Click** "Add new site" → "Import an existing project"
3. **Connect** your Git provider (GitHub, GitLab, Bitbucket)
4. **Select** your repository
5. **Configure**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `propiq/frontend`
6. **Click** "Deploy site"

**Auto-deploys on every git push!**

### Environment Variables (Netlify)

In Netlify dashboard → Site settings → Environment variables:

```bash
# Backend API URL (will be set after backend deployment)
VITE_API_URL=https://your-backend.onrender.com
```

---

## Part 2: Backend Deployment (Choose One)

### Option A: Render.com (Recommended - Free Tier Available)

**Why Render?**
- ✅ Free tier (750 hours/month)
- ✅ Auto-deploy from Git
- ✅ Built-in environment variables
- ✅ PostgreSQL/Redis if needed later
- ✅ Fast deployments (~3 minutes)

**Steps:**

1. **Go to** [render.com](https://render.com)
2. **Sign up** with GitHub
3. **Click** "New +" → "Web Service"
4. **Connect** your repository
5. **Configure**:
   - **Name**: `propiq-backend`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `propiq/backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

6. **Add Environment Variables** (in Render dashboard):

```bash
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/propiq

# JWT
JWT_SECRET=your-secret-key-here

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Weights & Biases (optional)
WANDB_API_KEY=your-wandb-key
WANDB_MODE=online

# Environment
ENVIRONMENT=production
```

7. **Click** "Create Web Service"

**Done!** Your backend will deploy at `https://propiq-backend.onrender.com`

**Health Check:**
```bash
curl https://propiq-backend.onrender.com/health
```

### Option B: Railway (Alternative - Also Fast)

**Why Railway?**
- ✅ $5 free credit/month
- ✅ Very fast deployments (~2 minutes)
- ✅ Great developer experience
- ✅ Built-in PostgreSQL/Redis/MongoDB

**Steps:**

1. **Go to** [railway.app](https://railway.app)
2. **Sign up** with GitHub
3. **Click** "New Project" → "Deploy from GitHub repo"
4. **Select** your repository
5. **Configure**:
   - **Root Directory**: `propiq/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`

6. **Add Environment Variables** (same as Render above)

7. **Generate Domain** (Railway dashboard → Settings → Generate Domain)

**Done!** Your backend is live at `https://propiq-backend.up.railway.app`

---

## Part 3: Connect Frontend to Backend

1. **Copy your backend URL**:
   - Render: `https://propiq-backend.onrender.com`
   - Railway: `https://propiq-backend.up.railway.app`

2. **Update Netlify environment variable**:

Go to Netlify dashboard → Site settings → Environment variables:

```bash
VITE_API_URL=https://propiq-backend.onrender.com
```

3. **Redeploy frontend** (to pick up new env variable):

```bash
# Option 1: CLI
netlify deploy --prod

# Option 2: Git push (if using Git auto-deploy)
git commit --allow-empty -m "Update API URL"
git push
```

**Done!** Frontend now talks to backend.

---

## Part 4: Verification & Testing

### Frontend Tests

1. **Visit your Netlify site**:
```
https://propiq-app.netlify.app
```

2. **Check console** (F12) for errors
3. **Test navigation** between pages
4. **Verify Microsoft Clarity** is tracking (check clarity.microsoft.com)

### Backend Tests

1. **Health check**:
```bash
curl https://propiq-backend.onrender.com/health
```

Expected:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T..."
}
```

2. **Enhanced Support Chat Health**:
```bash
curl https://propiq-backend.onrender.com/support/health/enhanced
```

Expected:
```json
{
  "status": "healthy",
  "features": {
    "function_calling": true,
    "session_state": true,
    "analytics": true,
    "database": true
  },
  "tools_available": [
    "check_subscription_status",
    "get_analysis_history",
    "create_support_ticket",
    "schedule_demo_call",
    "apply_promotional_credit"
  ]
}
```

3. **Property Advisor Health**:
```bash
curl https://propiq-backend.onrender.com/advisor/health
```

Expected:
```json
{
  "status": "healthy",
  "agents": [
    "Market Analyst",
    "Deal Analyst",
    "Risk Analyst",
    "Action Planner"
  ],
  "premium_only": true
}
```

### End-to-End Test

1. **Sign up** for a new account
2. **Analyze a property** (use free trial)
3. **Test support chat** (click "Need Help?")
4. **Try deal calculator**
5. **Check subscription** in user settings

---

## Part 5: Custom Domain (Optional)

### Netlify Custom Domain

1. **Netlify dashboard** → Domain settings
2. **Add custom domain**: `propiq.com`
3. **Update DNS** with your registrar:

```
CNAME www propiq-app.netlify.app
A     @   75.2.60.5 (Netlify's load balancer)
```

**SSL certificate auto-provisions in ~1 minute!**

### Render Custom Domain

1. **Render dashboard** → Settings → Custom Domain
2. **Add domain**: `api.propiq.com`
3. **Update DNS**:

```
CNAME api propiq-backend.onrender.com
```

**SSL auto-provisions!**

---

## Deployment Comparison

| Platform | Frontend | Backend | Deploy Time | Cost | Auto-Deploy |
|----------|----------|---------|-------------|------|-------------|
| **Azure** | Static Web Apps | App Service | 10-15 min | $13+/mo | Yes |
| **Netlify + Render** | Netlify | Render | 3-5 min | Free tier available | Yes |
| **Netlify + Railway** | Netlify | Railway | 2-4 min | $5 credit/mo | Yes |

**Winner**: Netlify + Render/Railway (3-10x faster!)

---

## Monitoring & Logs

### Netlify Logs

**View deployment logs**:
```bash
netlify logs
```

Or in dashboard → Deploys → [Latest deploy] → Deploy log

### Render Logs

**View live logs**:
- Render dashboard → Your service → Logs
- Real-time streaming

**CLI (optional)**:
```bash
# Install Render CLI
npm install -g @render/cli

# View logs
render logs propiq-backend
```

### Railway Logs

**View logs**:
- Railway dashboard → Your service → Deployments → Logs
- Real-time streaming

---

## Troubleshooting

### Frontend Issues

**Problem**: Build fails on Netlify

**Solution**:
1. Check build logs in Netlify dashboard
2. Verify `package.json` scripts are correct
3. Ensure `netlify.toml` is properly configured
4. Check Node version (set in netlify.toml)

**Problem**: "Failed to fetch" errors

**Solution**:
1. Verify `VITE_API_URL` environment variable is set
2. Check backend is running (visit health endpoint)
3. Verify CORS is enabled on backend

### Backend Issues

**Problem**: 503 Service Unavailable (Render)

**Solution**:
- Render free tier spins down after 15 min of inactivity
- First request after idle takes ~30 seconds to spin up
- Upgrade to paid tier ($7/mo) for always-on

**Problem**: Environment variables not loading

**Solution**:
1. Verify all variables are set in Render/Railway dashboard
2. Redeploy after adding new variables
3. Check for typos in variable names

**Problem**: Database connection failed

**Solution**:
1. Check `MONGODB_URI` is correct
2. Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for allow all)
3. Check MongoDB Atlas connection limits

---

## Rollback Strategy

### Netlify Rollback

**Via Dashboard**:
1. Netlify dashboard → Deploys
2. Find previous working deploy
3. Click "..." → "Publish deploy"

**Via CLI**:
```bash
netlify rollback
```

### Render Rollback

**Via Dashboard**:
1. Render dashboard → Deploys
2. Find previous deploy
3. Click "..." → "Redeploy"

### Railway Rollback

**Via Dashboard**:
1. Railway dashboard → Deployments
2. Click previous deployment
3. Click "Redeploy"

---

## CI/CD Auto-Deploy

### Automatic Deployments

**Both Netlify and Render/Railway support auto-deploy from Git:**

1. **Push to `main` branch** → Production deploy
2. **Push to `staging` branch** → Staging deploy (configure in dashboard)
3. **Open PR** → Preview deploy (Netlify only)

**Workflow**:
```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Netlify and Render/Railway auto-deploy in 2-3 minutes!
```

### Branch Deploys

**Netlify** (automatic):
- Every PR gets a preview URL: `deploy-preview-123--propiq-app.netlify.app`

**Render** (manual setup):
- Create separate service for staging branch
- Different environment variables for staging

---

## Cost Breakdown

### Free Tier Limits

**Netlify**:
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ Auto-deploy from Git
- ✅ Free SSL

**Render**:
- ✅ 750 hours/month (enough for 1 service)
- ✅ Auto-deploy from Git
- ✅ Free SSL
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512 MB RAM

**Railway**:
- ✅ $5 free credit/month (~500 hours)
- ✅ No spin-down
- ✅ Auto-deploy from Git
- ✅ Free SSL

### Paid Tiers (When You Scale)

**Netlify Pro** ($19/mo):
- 400 GB bandwidth
- Password-protected sites
- Analytics

**Render** ($7/mo per service):
- Always-on (no spin-down)
- More resources

**Railway** (Pay as you go):
- $0.000463/GB-hour RAM
- $0.000231/vCPU-hour
- No spin-down

---

## Migration from Azure

If you're currently on Azure, here's how to migrate:

### 1. Export Environment Variables from Azure

```bash
# List all app settings
az webapp config appsettings list \
  --name luntra-outreach-app \
  --resource-group luntra-outreach-rg \
  --output json > azure_env.json
```

### 2. Set up Render/Railway with same variables

Copy the values from `azure_env.json` to Render/Railway dashboard.

### 3. Test new deployment

**Don't delete Azure yet!** Test the new deployment first.

### 4. Update DNS (if using custom domain)

Once new deployment is verified:
1. Update DNS CNAME to point to new backend
2. Monitor for 24 hours
3. If stable, delete Azure resources

### 5. Delete Azure Resources (optional)

```bash
# Delete resource group (careful!)
az group delete --name luntra-outreach-rg
```

**Savings**: ~$13+/month if moving to free tier!

---

## Next Steps

### After Deployment

1. **Set up monitoring**:
   - Render/Railway dashboard has built-in metrics
   - Add Sentry for error tracking (optional)
   - Use W&B for AI analytics (already configured)

2. **Configure alerts**:
   - Render: Email alerts for deploy failures
   - Railway: Discord/Slack webhooks

3. **Set up staging environment**:
   - Deploy `staging` branch to separate service
   - Test before merging to `main`

4. **Add tests to CI/CD**:
   - Run tests before deploy
   - Block deploy if tests fail

5. **Optimize performance**:
   - Enable Netlify asset optimization
   - Add caching headers
   - Compress images

---

## Quick Commands Reference

### Netlify CLI

```bash
# Login
netlify login

# Initialize site
netlify init

# Deploy to production
netlify deploy --prod

# Deploy to staging (draft)
netlify deploy

# View logs
netlify logs

# Open dashboard
netlify open

# Link to existing site
netlify link

# Rollback
netlify rollback
```

### Development

```bash
# Frontend
cd propiq/frontend
npm install
npm run dev        # Local dev server
npm run build      # Production build

# Backend
cd propiq/backend
pip install -r requirements.txt
uvicorn api:app --reload --port 8000

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/support/health/enhanced
curl http://localhost:8000/advisor/health
```

---

## Support

**Issues?**

1. **Check logs** first (Netlify/Render/Railway dashboard)
2. **Verify environment variables** are set correctly
3. **Test locally** (`npm run dev` for frontend, `uvicorn api:app --reload` for backend)
4. **Check database** connection (MongoDB Atlas)
5. **Verify API keys** (Azure OpenAI, Stripe, etc.)

**Resources**:
- [Netlify Docs](https://docs.netlify.com)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)

---

## Summary

**You now have**:
- ✅ Frontend deployed to Netlify (1-2 min deploys)
- ✅ Backend deployed to Render/Railway (3-5 min deploys)
- ✅ Auto-deploy on git push
- ✅ Free SSL certificates
- ✅ Free tier hosting (or cheap paid tiers)
- ✅ 3-10x faster than Azure!

**Total setup time**: ~15 minutes (one-time)
**Future deploys**: ~2-3 minutes (automatic)

**Enjoy your fast deployments! 🚀**

---

**Last Updated**: October 21, 2025
**Status**: Production-ready ✅
