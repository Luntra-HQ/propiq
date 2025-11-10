# Deploy Backend Now - Complete Checklist

**EVERYTHING IS READY!** Follow these steps to deploy your backend in 10 minutes.

---

## ✅ Pre-Deployment Checklist (COMPLETE)

- ✅ Backend code on `production-api` branch
- ✅ MongoDB credentials configured
- ✅ All API keys in place (Stripe, OpenAI, Serper, Apollo, Resend)
- ✅ Dependencies in requirements.txt
- ✅ Procfile configured
- ✅ Health endpoint with build traceability
- ✅ Auth routes ready (signup/login)

---

## 🚀 Deploy to Render.com (10 Steps)

### Step 1: Open Render Dashboard
Go to: **https://dashboard.render.com/register**

- Sign up with GitHub (recommended)
- Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Find and select repository: **bdusape/OUTREACH-APP**
4. Click **"Connect"**

### Step 3: Configure Service Settings

Fill in these EXACT values:

```
Name: luntra-api
Region: Oregon (US West)
Branch: production-api  ⚠️ CRITICAL - Must be production-api, NOT main/master!
Root Directory: (leave blank)
Runtime: Python 3
```

### Step 4: Set Build & Start Commands

```
Build Command: pip install -r requirements.txt
Start Command: uvicorn api:app --host 0.0.0.0 --port $PORT
```

### Step 5: Choose Plan

Select: **Free** (or Starter if you want always-on)

**DON'T CLICK "Create Web Service" YET!**

Scroll down to add environment variables first.

---

## 🔑 Step 6: Add Environment Variables

In the **"Environment Variables"** section, click **"Add Environment Variable"** and add these ONE BY ONE:

### Copy-Paste These (12 Variables):

```
ENVIRONMENT=production
```

```
MONGODB_URI=mongodb+srv://dealIQ_backend_user:nahpyr-dyPhy3-xoqwat@propiq-production-clust.q4050y.mongodb.net/luntra?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster
```

```
ALLOWED_ORIGINS=https://luntra.one,https://app.luntra.one
```

```
EMAIL_PROVIDER=resend
```

```
RESEND_API_KEY=re_H7EmkHzY_35Evxg2J4cG7Qfp5eMT2BkGk
```

```
RESEND_FROM=bdusape@gmail.com
```

```
STRIPE_SECRET_KEY=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
```

```
STRIPE_PRICE_ID=price_1RqHkREtJUE5bLBgPGCA4EOz
```

```
STRIPE_WEBHOOK_SECRET=whsec_05faf4882ab063e18686d4088b8ee2d6293095a5ce5f74805cbf701bb45745d4
```

```
OPENAI_API_KEY=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
```

```
SERPER_API_KEY=4683d1c1e4dcbec517be9c7ef871d5e1ef10a613
```

```
APOLLO_API_KEY=nBonFucH5lRJoY-eMyDdTA
```

```
PYTHON_VERSION=3.11
```

---

## 🎯 Step 7: Deploy!

Now click **"Create Web Service"** at the bottom.

### What Happens Next:

1. Render clones your `production-api` branch
2. Installs Python dependencies (2-3 minutes)
3. Starts uvicorn server
4. Assigns URL: `https://luntra-api.onrender.com`

### Watch the Logs

You'll see logs streaming in real-time. Look for these SUCCESS messages:

```
✅ Successfully installed fastapi uvicorn pymongo comet-ml...
✅ Auth router registered
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000
```

When you see **"Uvicorn running"**, **YOU'RE LIVE!** 🎉

---

## ✅ Step 8: Get Your Backend URL

After deployment completes:

1. Look at the top of the Render dashboard
2. Copy the URL: `https://luntra-api.onrender.com`
3. Save it - you'll need it to update the frontend

---

## 🧪 Step 9: Verify Deployment

Test your backend is working:

### Test Health Endpoint

```bash
curl https://luntra-api.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "build_hash": "c96d193",
  "build_timestamp": "2025-10-20T...",
  "version": "1.0.0",
  "environment": "production",
  "python_version": "3.11"
}
```

### Test Signup Endpoint

```bash
curl -X POST https://luntra-api.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "userId": "676a9b8c...",
  "message": "User created successfully"
}
```

---

## 🔗 Step 10: Update Frontend

Once backend is verified, update frontend to use the production API:

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/frontend
```

### Update Environment Variable

In Cloudflare Pages dashboard or `.env`:

```bash
VITE_API_BASE=https://luntra-api.onrender.com
```

### Redeploy Frontend

```bash
npm run deploy:frontend
```

### Run Integration Tests

```bash
export VITE_API_BASE=https://luntra-api.onrender.com
npm run test:integration:production
```

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Health endpoint returns 200 with "healthy" status
- ✅ MongoDB connection shows "✅ Auth router registered" in logs
- ✅ Signup endpoint creates users successfully
- ✅ Login endpoint authenticates users
- ✅ Frontend can connect to backend API

---

## 🚨 Troubleshooting

### Issue: Build Fails

**Error:** `Could not find a version that satisfies the requirement fastapi`

**Fix:**
- Go to Render dashboard → Settings → Environment
- Add: `PYTHON_VERSION=3.11`
- Click "Manual Deploy" → "Deploy latest commit"

### Issue: Health Endpoint Returns 503

**Error:** `{"detail": "Database service unavailable"}`

**Fix:**
- Check MongoDB Atlas dashboard is online (green)
- Verify MongoDB Network Access allows 0.0.0.0/0
- Check Render logs for MongoDB connection errors

### Issue: "Auth router not registered"

**Error:** Missing auth endpoints

**Fix:**
- Verify `MONGODB_URI` is set correctly in Render environment variables
- Check branch is `production-api` (NOT main)
- Redeploy with correct branch

### Issue: CORS Errors in Browser

**Error:** `Access blocked by CORS policy`

**Fix:**
- Check `ALLOWED_ORIGINS` includes `https://luntra.one`
- Add comma-separated origins if needed: `https://luntra.one,https://www.luntra.one`
- Redeploy after updating

---

## 📊 Expected Timeline

- Render account setup: 2 minutes
- Service configuration: 3 minutes
- Environment variables: 3 minutes
- Build & deployment: 2-3 minutes

**Total: ~10 minutes**

---

## 🎉 You're Done!

After successful deployment:

1. Your backend API is live at: `https://luntra-api.onrender.com`
2. Frontend can connect to backend
3. Users can sign up and log in
4. MongoDB is storing user data
5. All integrations (Stripe, OpenAI, etc.) are working

---

## 📚 Additional Resources

- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Deployment Guide:** RENDER_DEPLOYMENT_GUIDE.md
- **Full Backend Guide:** BACKEND_DEPLOYMENT.md
- **Environment Variables:** .env.production

---

## 🔐 Security Reminder

- ✅ MongoDB Network Access restricted after testing (remove 0.0.0.0/0)
- ✅ Environment variables stored securely in Render (not in git)
- ✅ HTTPS enabled automatically by Render
- ✅ CORS restricted to luntra.one only

---

**Ready to deploy?** Start at Step 1! 🚀
