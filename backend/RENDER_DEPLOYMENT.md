# 🚀 PropIQ Backend Deployment to Render

**Recommended Platform:** Render.com
**Estimated Setup Time:** 5-10 minutes
**Monthly Cost:** FREE (750 hours/month) or $7/month for always-on

---

## Why Render?

✅ **Instant, real-time logs** - No Azure delays
✅ **Auto-deploy from GitHub** - Push to main = automatic deployment
✅ **Simpler than Azure** - No Docker registry, containers, or complex CLI
✅ **Better free tier** - 750 hours/month free
✅ **Built-in SSL** - Automatic HTTPS
✅ **Faster cold starts** - Much quicker than Azure

---

## 📋 Prerequisites

- GitHub account (your repo: LUNTRA/propiq/backend)
- Render account (free): https://render.com
- Environment variables from `.env` file

---

## 🎯 Deployment Steps

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select repository: `LUNTRA`
4. Root directory: `propiq/backend`
5. Click **"Connect"**

### Step 3: Configure Service

Render will auto-detect your `render.yaml` file. Verify these settings:

- **Name:** `propiq-backend`
- **Environment:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn api:app --host 0.0.0.0 --port $PORT`
- **Plan:** Free (or Starter $7/mo for always-on)

### Step 4: Set Environment Variables

You need to manually set these in the Render dashboard:

#### Required Environment Variables

```bash
# ⚠️ SECURITY WARNING: Never commit real credentials!
# Use these as templates - replace with your actual values from .env file

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE-NAME.openai.azure.com/
AZURE_OPENAI_KEY=YOUR_AZURE_OPENAI_API_KEY_HERE

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-secure-jwt-secret-key-here

# Stripe
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
STRIPE_PRICE_ID=price_YOUR_DEFAULT_PRICE_ID
STRIPE_PRICE_STARTER=price_YOUR_STARTER_PRICE_ID
STRIPE_PRICE_PRO=price_YOUR_PRO_PRICE_ID
STRIPE_PRICE_ELITE=price_YOUR_ELITE_PRICE_ID

# SendGrid
SENDGRID_API_KEY=SG.YOUR_SENDGRID_API_KEY_HERE

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Weights & Biases
WANDB_API_KEY=YOUR_WANDB_API_KEY_HERE

# Intercom (Optional)
INTERCOM_ACCESS_TOKEN=YOUR_INTERCOM_ACCESS_TOKEN_HERE
INTERCOM_API_KEY=YOUR_INTERCOM_API_KEY_HERE
```

**How to add in Render:**
1. Go to your service → **Environment** tab
2. Click **"Add Environment Variable"**
3. Paste key and value
4. Repeat for all variables above

**💡 Pro Tip:** Use the `copy_env_to_render.sh` script to format your environment variables!

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy automatically
3. Wait 2-3 minutes for deployment
4. You'll get a URL like: `https://propiq-backend.onrender.com`

### Step 6: Verify Deployment

Test your deployed backend:

```bash
# Health check
curl https://propiq-backend.onrender.com/health

# Stripe health check
curl https://propiq-backend.onrender.com/stripe/health
```

Expected response:
```json
{
  "status": "healthy",
  "stripe_configured": true,
  "default_price_configured": true,
  "webhook_configured": true
}
```

---

## 🔗 Update Stripe Webhook

After deployment, update your Stripe webhook URL:

### Option 1: Using Stripe CLI

```bash
export STRIPE_API_KEY=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

# Update webhook endpoint
stripe webhook_endpoints update we_1SL4wzJogOchEFxvrXvJSB9S \
  -d url="https://propiq-backend.onrender.com/stripe/webhook"
```

### Option 2: Using Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click on webhook: `we_1SL4wzJogOchEFxvrXvJSB9S`
3. Update URL to: `https://propiq-backend.onrender.com/stripe/webhook`
4. Save changes

---

## 📊 Monitoring & Logs

### View Real-Time Logs

1. Go to your Render service dashboard
2. Click **"Logs"** tab
3. See real-time streaming logs (much better than Azure!)

### Monitor Health

Render automatically monitors your `/health` endpoint:
- Green = Healthy
- Red = Down (will auto-restart)

---

## 🔄 Auto-Deploy Setup

Your `render.yaml` is configured for auto-deploy. Every time you push to `main`:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will automatically:
1. Detect the push
2. Build the new code
3. Run tests (if configured)
4. Deploy to production
5. Health check the new version
6. Switch traffic to new version

**Zero-downtime deployments!** 🎉

---

## 💰 Pricing

### Free Tier (Recommended for Testing)
- ✅ 750 hours/month free
- ✅ Automatic SSL
- ✅ Custom domains
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold starts (~30 seconds)

### Starter Plan ($7/month) - **Recommended for Production**
- ✅ Always on (no spin down)
- ✅ No cold starts
- ✅ 512 MB RAM
- ✅ Better performance

### Pro Plan ($25/month)
- ✅ 2 GB RAM
- ✅ Autoscaling
- ✅ Multiple instances

---

## 🐛 Troubleshooting

### Build Fails

Check build logs in Render dashboard. Common issues:
- Missing dependency in `requirements.txt`
- Python version mismatch (ensure 3.11)

**Fix:** Update `requirements.txt` and push again

### Service Won't Start

Check logs for errors:
- Missing environment variable → Add in Render dashboard
- Database connection failed → Verify `MONGODB_URI`
- Port binding issue → Render automatically sets `$PORT`

### Slow Response Times

Free tier spins down after 15 min inactivity:
- First request after spin down takes ~30 seconds
- **Solution:** Upgrade to Starter ($7/mo) for always-on

### Stripe Webhooks Failing

Verify webhook URL is updated:
```bash
stripe webhook_endpoints retrieve we_1SL4wzJogOchEFxvrXvJSB9S
```

Should show: `"url": "https://propiq-backend.onrender.com/stripe/webhook"`

---

## 🚀 Next Steps

After deployment:

1. ✅ Test E2E flow with production URL
2. ✅ Update frontend API URL to Render URL
3. ✅ Configure custom domain (optional): `api.propiq.luntra.one`
4. ✅ Set up monitoring alerts in Render
5. ✅ Test Stripe payment flow end-to-end

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Render Community:** https://community.render.com

---

## 🎯 Comparison: Render vs Azure

| Feature | Render | Azure |
|---------|--------|-------|
| Setup Time | 5 min | 30+ min |
| Logs | Real-time, instant | Slow, delayed |
| Auto Deploy | ✅ Built-in | ❌ Manual setup |
| SSL | ✅ Automatic | ⚠️ Manual config |
| Pricing | $0-7/mo | $50+/mo |
| Cold Starts | ~30s (free) | ~2min |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Logs Quality | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**Winner:** 🏆 Render (for FastAPI backends)

---

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables set in Render
- [ ] Health endpoint returns 200 OK
- [ ] Stripe health check passes
- [ ] Webhook URL updated in Stripe
- [ ] Test payment flow works end-to-end
- [ ] MongoDB connection verified
- [ ] Azure OpenAI integration working
- [ ] Slack notifications working
- [ ] Frontend connected to new API URL
- [ ] Custom domain configured (optional)
- [ ] Monitoring alerts set up

---

**🎉 You're ready to deploy!**

Push to main and watch Render do the rest. Much simpler than Azure!
