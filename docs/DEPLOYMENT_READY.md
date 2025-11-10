# Backend Deployment - Ready to Deploy!

**Status:** All configuration complete. Ready for deployment.

**Date:** October 20, 2025

---

## Summary

Your Luntra backend is fully configured and ready to deploy to production. All environment variables, dependencies, and documentation are prepared.

## What's Ready

- ✅ Backend code committed to `production-api` branch
- ✅ MongoDB connection string configured
- ✅ All API keys organized in .env.production
- ✅ Dependencies defined in requirements.txt
- ✅ Procfile configured for deployment
- ✅ Health endpoint with build hash traceability
- ✅ Authentication routes (signup/login) ready
- ✅ Comprehensive deployment guides created

## MongoDB Configuration

**Connection String:**
```
mongodb+srv://dealIQ_backend_user:nahpyr-dyPhy3-xoqwat@propiq-production-clust.q4050y.mongodb.net/luntra?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster
```

**Database:** luntra
**Collection:** users
**Cluster:** PropIQ-Production-Cluster

**Note:** Replace `<db_username>` and `<db_password>` with your actual MongoDB credentials when deploying to Render.

---

## Next Steps: Deploy to Render.com

### Option 1: Manual Deployment (Recommended - 15 minutes)

Follow the step-by-step guide in `RENDER_DEPLOYMENT_GUIDE.md`. Here's the quick version:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/register
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect repository: `bdusape/OUTREACH-APP`
   - Branch: `production-api` ⚠️ IMPORTANT!

3. **Configure Service**
   ```
   Name: luntra-api
   Region: Oregon (US West)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn api:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

4. **Add Environment Variables**

   Copy/paste these into Render's environment variables section (all on separate lines):

   ```bash
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
   PYTHON_VERSION=3.11
   ```

   **IMPORTANT:** Replace `<db_username>` and `<db_password>` in the MONGODB_URI with your actual MongoDB credentials!

5. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for build to complete

6. **Verify Deployment**

   Your backend will be available at: `https://luntra-api.onrender.com`

   Test the health endpoint:
   ```bash
   curl https://luntra-api.onrender.com/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "build_hash": "c96d193",
     "build_timestamp": "2025-10-20...",
     "version": "1.0.0",
     "environment": "production",
     "python_version": "3.11"
   }
   ```

---

## Post-Deployment Verification

After deployment completes, run these verification commands from the frontend directory:

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/frontend

# 1. Verify health endpoint
npm run deploy:verify:production

# 2. Run backend deployment tests
export VITE_API_BASE=https://luntra-api.onrender.com
npm run test:backend-deploy:production

# 3. Test authentication endpoints
curl -X POST https://luntra-api.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## Update Frontend with Backend URL

Once backend is deployed and verified:

1. Update frontend environment variable:
   ```bash
   cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/frontend
   ```

2. Edit `.env` or set in Cloudflare Pages:
   ```bash
   VITE_API_BASE=https://luntra-api.onrender.com
   ```

3. Redeploy frontend:
   ```bash
   npm run deploy:frontend
   ```

4. Run full integration tests:
   ```bash
   npm run test:integration:production
   ```

---

## Monitoring

After deployment, monitor your backend:

1. **Render Logs**
   - Dashboard → luntra-api → Logs
   - Look for: "✅ Auth router registered"

2. **Health Monitoring**
   - Add to monitoring: `https://luntra-api.onrender.com/health`
   - Recommended services: UptimeRobot, Pingdom

3. **Performance**
   - Free tier: 512 MB RAM, 0.5 CPU
   - Cold starts after 15 min inactivity (upgrade to Starter plan for always-on)

---

## Alternative: Deploy to Railway.app

If you prefer Railway over Render:

1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose `bdusape/OUTREACH-APP`, branch `production-api`
4. Add the same environment variables
5. Deploy

Railway provides $5 free credit monthly.

---

## Documentation Reference

- **RENDER_DEPLOYMENT_GUIDE.md** - Step-by-step Render deployment (with your credentials)
- **BACKEND_DEPLOYMENT.md** - Comprehensive guide (Render, Railway, Heroku options)
- **.env.production** - All environment variables organized

---

## Deployment Checklist

- [ ] MongoDB username and password ready (replace placeholders)
- [ ] Create Render.com account
- [ ] Connect GitHub repository (bdusape/OUTREACH-APP)
- [ ] Select production-api branch
- [ ] Add all environment variables (with real MongoDB credentials)
- [ ] Deploy and wait for build completion
- [ ] Verify /health endpoint returns 200
- [ ] Test authentication endpoints
- [ ] Update frontend VITE_API_BASE
- [ ] Redeploy frontend
- [ ] Run integration tests

---

## Troubleshooting

### Build Fails
- Check Python version is set to 3.11
- Verify requirements.txt is in root directory
- Check Render logs for specific errors

### Health Endpoint Returns 503
- Verify MongoDB connection string is correct
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Check Render logs for MongoDB connection errors

### CORS Errors
- Ensure ALLOWED_ORIGINS includes https://luntra.one
- Redeploy after updating CORS settings

---

## Expected Timeline

- Render account creation: 2 minutes
- Service configuration: 5 minutes
- Build and deployment: 2-3 minutes
- Verification and testing: 5 minutes

**Total: ~15 minutes**

---

## Support

If you encounter issues:

1. Check Render logs (Dashboard → luntra-api → Logs)
2. Review troubleshooting sections in deployment guides
3. Test MongoDB connection directly from Render Shell
4. Verify all environment variables are set correctly

---

**Your backend is ready to go live!** Follow the steps above and you'll have a production API running in about 15 minutes.
