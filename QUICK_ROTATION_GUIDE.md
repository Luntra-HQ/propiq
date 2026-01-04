# PropIQ API Key Rotation - Quick Reference

**Date:** December 30, 2025
**Estimated Time:** 30-60 minutes for all critical keys

---

## ⚡ Quick Start

```bash
# 1. Check what needs rotation
cd /Users/briandusape/Projects/propiq
./scripts/check-rotation-status.sh

# 2. Follow rotation steps below
# 3. Test each service after rotation
# 4. Run check script again to track progress
```

---

## 🔴 Critical Keys (Do These First)

### 1. Stripe (5 mins)
```bash
# Dashboard
open https://dashboard.stripe.com/apikeys

# Steps:
1. Create new secret key → Copy
2. Update backend/.env: STRIPE_SECRET_KEY=new_key
3. Create new webhook at /stripe/webhook → Copy secret
4. Update backend/.env: STRIPE_WEBHOOK_SECRET=new_secret
5. Delete old keys
6. Redeploy: cd backend && ./deploy-azure.sh
```

### 2. Supabase (3 mins)
```bash
# Dashboard
open https://supabase.com/dashboard

# Steps:
1. Select project → Settings → API
2. Reset service_role key → Copy
3. Update backend/.env: SUPABASE_SERVICE_KEY=new_key
4. Redeploy: cd backend && ./deploy-azure.sh
```

### 3. Azure OpenAI (3 mins)
```bash
# Portal
open https://portal.azure.com

# Steps:
1. Find "luntra-openai-service"
2. Keys and Endpoint → Regenerate Key 1 → Copy
3. Update backend/.env: AZURE_OPENAI_KEY=new_key
4. Redeploy: cd backend && ./deploy-azure.sh
```

### 4. MongoDB (3 mins)
```bash
# Atlas
open https://cloud.mongodb.com

# Steps:
1. Database Access → Find propIQ_backend_user
2. Edit → Edit Password → Autogenerate → Copy
3. Update backend/.env: MONGODB_URI with new password
4. Redeploy: cd backend && ./deploy-azure.sh
```

### 5. SendGrid (3 mins)
```bash
# Dashboard
open https://app.sendgrid.com/settings/api_keys

# Steps:
1. Create API Key → Full Access → Copy
2. Update backend/.env: SENDGRID_API_KEY=new_key
3. Delete old key
4. Redeploy: cd backend && ./deploy-azure.sh
```

---

## 🟡 Moderate Priority (This Week)

### 6. Convex (2 mins)
```bash
open https://dashboard.convex.dev

# Steps:
1. Settings → Deploy Keys → Create → Copy
2. Update .env.local: CONVEX_DEPLOY_KEY=new_key
3. Delete old key
4. Deploy: npx convex deploy
```

### 7. JWT Secret (2 mins)
```bash
# ⚠️ WARNING: Logs out ALL users!

# Generate new secret
openssl rand -hex 32

# Update backend/.env: JWT_SECRET=new_secret
# Redeploy: cd backend && ./deploy-azure.sh
# Notify users to log in again
```

### 8. Intercom (2 mins)
```bash
open https://app.intercom.com/a/apps/_/settings/developers

# Steps:
1. Rotate access token → Copy
2. Update backend/.env: INTERCOM_ACCESS_TOKEN=new_token
3. Redeploy: cd backend && ./deploy-azure.sh
```

### 9. Slack (2 mins)
```bash
open https://api.slack.com/apps

# Steps:
1. Find app → Incoming Webhooks → Regenerate
2. Update backend/.env: SLACK_WEBHOOK_URL=new_url
3. Redeploy: cd backend && ./deploy-azure.sh
```

---

## ✅ Post-Rotation Checklist

After rotating all keys:

```bash
# Test backend health
curl https://luntra-outreach-app.azurewebsites.net/propiq/health

# Test in app:
- [ ] Login works
- [ ] Property analysis works
- [ ] Payments work (test mode)
- [ ] Emails send
- [ ] No console errors

# Azure Portal:
- [ ] Update App Service Configuration with new keys
- [ ] Restart App Service
- [ ] Check logs for errors

# Track completion:
./scripts/check-rotation-status.sh
```

---

## 🛡️ Prevent Future Leaks

### Option 1: Git-Secrets (Recommended)
```bash
# Automated setup
./scripts/setup-git-secrets.sh

# This will:
# ✓ Install git-secrets
# ✓ Configure secret patterns
# ✓ Block commits with secrets
# ✓ Scan repo for existing secrets
```

### Option 2: Manual Pre-commit Hook
```bash
# Install gitleaks
brew install gitleaks

# Test before commit
gitleaks protect --staged --verbose
```

### Option 3: GitHub Secret Scanning
```bash
# Enable at:
open https://github.com/YOUR_USERNAME/propiq/settings/security_analysis

# Enable:
- [x] Secret scanning
- [x] Push protection
- [x] Secret scanning alerts
```

---

## 📅 Rotation Schedule

Set calendar reminders:

| Date | Task |
|------|------|
| **Today** | Rotate all critical keys |
| **This Week** | Rotate moderate keys + install git-secrets |
| **March 30, 2026** | Next quarterly rotation (90 days) |
| **June 30, 2026** | Quarterly rotation |
| **September 30, 2026** | Quarterly rotation |
| **December 30, 2026** | Annual rotation (all keys) |

---

## 🆘 Troubleshooting

### "Deployment failed after rotation"
```bash
# Check Azure logs
az webapp log tail --name luntra-outreach-app --resource-group luntra

# Verify .env file format (no extra spaces, quotes)
# Verify App Service Configuration updated
# Try manual restart
```

### "Database connection failed"
```bash
# Test MongoDB connection
mongosh "mongodb+srv://propIQ_backend_user:NEW_PASSWORD@..."

# Verify password has no special chars that need encoding
# Check MongoDB Atlas Network Access (IP whitelist)
```

### "Stripe webhooks not working"
```bash
# Test webhook endpoint
curl -X POST https://luntra-outreach-app.azurewebsites.net/stripe/webhook

# Verify webhook secret matches in:
# 1. Stripe Dashboard → Webhooks → Signing secret
# 2. backend/.env → STRIPE_WEBHOOK_SECRET
# 3. Azure App Service → Configuration → STRIPE_WEBHOOK_SECRET
```

---

## 📞 Support

### Service Dashboards:
- **Stripe:** https://dashboard.stripe.com
- **Supabase:** https://supabase.com/dashboard
- **Azure:** https://portal.azure.com
- **MongoDB:** https://cloud.mongodb.com
- **SendGrid:** https://app.sendgrid.com
- **Convex:** https://dashboard.convex.dev

### Documentation:
- **Full Security Report:** `SECURITY_AUDIT_REPORT.md`
- **Setup Git-Secrets:** `./scripts/setup-git-secrets.sh`
- **Check Status:** `./scripts/check-rotation-status.sh`

---

## 🎯 Success Criteria

You're done when:
- ✅ All critical keys rotated
- ✅ All services tested and working
- ✅ Old keys deleted from dashboards
- ✅ Azure App Settings updated
- ✅ Git-secrets or leak prevention installed
- ✅ Rotation status tracked
- ✅ Calendar reminders set

---

**Good luck! You've got this!** 💪

*For detailed instructions, see `SECURITY_AUDIT_REPORT.md`*
