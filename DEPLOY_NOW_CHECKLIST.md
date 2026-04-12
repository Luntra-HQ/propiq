# PropIQ Deployment - Quick Checklist

**Goal**: Get propiq.luntra.one fully updated with new AI features

---

## ✅ Part 1: Deploy Frontend to Netlify (2 minutes)

### Option A: Drag & Drop (Fastest!)

1. **Netlify Drop page is open** in your browser
2. **Finder is open** showing `dist/` folder
3. **Drag the entire `dist` folder** to the Netlify page
4. **Wait 30 seconds** - your site deploys!
5. **Copy the URL** (e.g., `https://unique-name-123.netlify.app`)

### Option B: Via Dashboard

1. Go to [app.netlify.com](https://app.netlify.com/start)
2. Click "Add new site" → "Deploy manually"
3. Drag `dist/` folder
4. Done!

**✅ Result**: Frontend live at Netlify URL

---

## ✅ Part 2: Deploy Backend to Render.com (5 minutes)

**Render page is open** in your browser.

### Steps:

1. **Sign up/Login** with GitHub (if not already)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select repository (your LUNTRA repo)

3. **Configure Service**:
   ```
   Name: propiq-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: LUNTRA MVPS/propiq/backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn api:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

4. **Add Environment Variables**:

   Click "Advanced" → "Add Environment Variable"

   **Copy-paste from `RENDER_ENV_VARS.txt` (already open)**:

   **REQUIRED (Must have these)**:
   ```
   AZURE_OPENAI_ENDPOINT=https://luntra-openai-service.cognitiveservices.azure.com/
   AZURE_OPENAI_KEY=REDACTED
   AZURE_OPENAI_API_VERSION=2025-01-01-preview
   AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

   MONGODB_URI=mongodb+srv://REDACTED

   JWT_SECRET=luntra-propiq-secret-key-2025-change-in-production

   ENVIRONMENT=production
   PYTHON_VERSION=3.11
   ```

   **Stripe (Payments)**:
   ```
   STRIPE_SECRET_KEY=sk_live_REDACTED
   STRIPE_PRICE_ID=price_1RqHkREtJUE5bLBgPGCA4EOz
   STRIPE_WEBHOOK_SECRET=whsec_REDACTED
   ```

   **Email Services** (Add all 3 for flexibility):
   ```
   MAILJET_API_KEY=f94686280e1f877be06f4bf3a679f7a7
   MAILJET_SECRET_KEY=101a9d55daa7ffc1b67604c7a06a63ab

   RESEND_API_KEY=re_H7EmkHzY_35Evxg2J4cG7Qfp5eMT2BkGk

   SENDGRID_API_KEY=REDACTED
   ```

   **SerpAPI** (Market research):
   ```
   SERPAPI_KEY=REDACTED
   ```

   **W&B Analytics**:
   ```
   WANDB_API_KEY=12421393e758b9d1dc651df9da417d30039fff55
   WANDB_MODE=online
   ```

   **Intercom** (Optional):
   ```
   INTERCOM_ACCESS_TOKEN=dG9rOmNkNDI4ZmQ3XzRhZjdfNDgyYV9iNTMwX2RhODU1ZmQyODNhNjoxOjA=
   INTERCOM_API_KEY=c290ac56-e42b-46e3-8371-c39b166b55c0
   ```

5. **Click "Create Web Service"**

6. **Wait 3-5 minutes** for deployment

7. **Copy your backend URL** (e.g., `https://propiq-backend.onrender.com`)

**✅ Result**: Backend live at Render URL

---

## ✅ Part 3: Connect Frontend to Backend (1 minute)

### Update Frontend Environment Variable

1. **Go to Netlify** dashboard → Your site
2. **Site settings** → "Environment variables"
3. **Add variable**:
   ```
   Key: VITE_API_URL
   Value: https://propiq-backend.onrender.com
   ```
   (Use your actual Render URL from Part 2)

4. **Redeploy**:
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

   **OR** drag `dist/` folder again to Netlify Drop

**✅ Result**: Frontend now talks to backend!

---

## ✅ Part 4: Update DNS for propiq.luntra.one (2 minutes)

### Point Custom Domain to Netlify

1. **In Netlify dashboard** → Your site → "Domain settings"

2. **Add custom domain**: `propiq.luntra.one`

3. **Netlify will show DNS records**:
   ```
   Type: CNAME
   Name: propiq
   Value: [your-site].netlify.app
   ```

4. **Update DNS** at your domain registrar:
   - Go to your domain registrar (e.g., Cloudflare, GoDaddy, Namecheap)
   - Find DNS settings for `luntra.one`
   - Add/update CNAME record:
     ```
     CNAME  propiq  [your-site].netlify.app
     ```

5. **Wait 1-5 minutes** for DNS propagation

6. **Netlify auto-provisions SSL** (1 minute)

**✅ Result**: `https://propiq.luntra.one` is live!

---

## ✅ Part 5: Verification (1 minute)

### Test Backend

```bash
# Health check
curl https://propiq-backend.onrender.com/health

# Enhanced support chat
curl https://propiq-backend.onrender.com/support/health/enhanced

# Property advisor
curl https://propiq-backend.onrender.com/advisor/health
```

**Expected**: All return `{"status": "healthy"}`

### Test Frontend

1. Visit `https://propiq.luntra.one`
2. Open browser console (F12)
3. Check for errors
4. Test navigation
5. Try creating account / logging in

**✅ If all tests pass → DEPLOYMENT COMPLETE! 🎉**

---

## 🚨 Troubleshooting

### Frontend shows "Failed to fetch"
- Check `VITE_API_URL` is set correctly in Netlify
- Verify backend is running (visit health endpoint)
- Check browser console for CORS errors

### Backend deploy fails
- Check all REQUIRED env vars are set
- Check build logs in Render dashboard
- Verify `requirements.txt` exists

### DNS not working
- Wait 5-10 minutes for propagation
- Check DNS with: `dig propiq.luntra.one`
- Verify CNAME points to correct Netlify URL

---

## 📊 Deployment Summary

| Component | Platform | URL | Deploy Time |
|-----------|----------|-----|-------------|
| **Frontend** | Netlify | `propiq.luntra.one` | ~1 min |
| **Backend** | Render.com | `propiq-backend.onrender.com` | ~3-5 min |
| **Database** | MongoDB Atlas | (already configured) | - |

**Total deployment time**: ~10 minutes (first time)
**Future deployments**: ~2-3 minutes (git push auto-deploys!)

---

## 🎯 New Features Now Live

### Enhanced Support Chat
- 5 AI-powered tools
- Session state management
- Subscription status checking
- Analysis history
- Support ticket creation
- Demo call scheduling
- Promotional credits

### Multi-Agent Property Advisor (Premium)
- Market Analyst (research & comps)
- Deal Analyst (financial scenarios)
- Risk Analyst (risk assessment)
- Action Planner (execution roadmap)

**Available for**: Pro and Elite subscribers only

---

## 📈 Post-Deployment

### Monitor Services

**Netlify**:
- Dashboard: [app.netlify.com](https://app.netlify.com)
- Check deploy logs
- Monitor bandwidth usage

**Render**:
- Dashboard: [dashboard.render.com](https://dashboard.render.com)
- View real-time logs
- Monitor usage (Free tier: 750 hours/month)

### Next Steps

1. ✅ Test all features thoroughly
2. ✅ Monitor for errors (first 24 hours)
3. ✅ Gather user feedback
4. ✅ Consider upgrading Render to Starter ($7/mo) for always-on
5. ✅ Set up error tracking (Sentry - optional)

---

**Last Updated**: October 21, 2025
**Status**: Ready to deploy! 🚀
