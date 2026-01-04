# PropIQ Simplified API Key Rotation List

**Date:** December 30, 2025
**Architecture:** Convex-Only (MongoDB and Supabase removed!)
**Status:** ✅ Simplified

---

## 🎉 Great News!

By switching to Convex-only, you've **reduced your API keys from 9 to 5!**

**Removed:**
- ❌ MongoDB password (deprecated)
- ❌ Supabase service key (deprecated)
- ❌ Supabase anon key (deprecated)
- ❌ Intercom keys (will cancel Oct 2026)

---

## 🔑 Keys to Rotate (5 Total)

### 🔴 Critical Priority

| # | Service | Keys | Risk Level | Time | Dashboard |
|---|---------|------|------------|------|-----------|
| 1 | **Stripe** | 3 keys | 🔴 CRITICAL | 5 min | [dashboard.stripe.com](https://dashboard.stripe.com/apikeys) |
| 2 | **Azure OpenAI** | 1 key | 🔴 CRITICAL | 3 min | [portal.azure.com](https://portal.azure.com) |
| 3 | **SendGrid** | 1 key | 🔴 HIGH | 3 min | [app.sendgrid.com](https://app.sendgrid.com/settings/api_keys) |

**Total Critical Keys:** 5 keys, ~15 minutes

---

### ✅ Already Rotated (Moderate Priority)

| Service | Status | Notes |
|---------|--------|-------|
| Convex | ✅ Done | Deploy key rotated |
| JWT Secret | ✅ Done | Users logged out, working |
| Intercom | ✅ Deprecated | Will cancel Oct 21, 2026 |
| Slack | ✅ Done | Webhook rotated |

---

### ❌ Deprecated (No Rotation Needed)

| Service | Status | Action Taken |
|---------|--------|--------------|
| MongoDB | ❌ Deleted | Removed from codebase |
| Supabase | ❌ Deleted | Removed from codebase |

---

## ⚡ Quick Rotation Commands

### 1️⃣ Stripe (3 keys - 5 minutes)

```bash
# Open dashboard
open https://dashboard.stripe.com/apikeys

# Steps:
# 1. Create new secret key → Copy
# 2. Copy new publishable key (auto-generated)
# 3. Go to Webhooks → Get signing secret
# 4. Update backend/.env with all 3 keys
# 5. Redeploy backend
# 6. Test payment in app
```

**Keys to update:**
```bash
STRIPE_SECRET_KEY=sk_live_NEW_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_NEW_KEY
STRIPE_WEBHOOK_SECRET=whsec_NEW_SECRET
```

---

### 2️⃣ Azure OpenAI (1 key - 3 minutes)

```bash
# Open Azure Portal
open https://portal.azure.com

# Steps:
# 1. Search "luntra-openai-service"
# 2. Keys and Endpoint → Regenerate Key 1
# 3. Copy new key
# 4. Update backend/.env
# 5. Redeploy backend
# 6. Test property analysis
```

**Key to update:**
```bash
AZURE_OPENAI_KEY=NEW_KEY_HERE
```

---

### 3️⃣ SendGrid (1 key - 3 minutes)

```bash
# Open SendGrid
open https://app.sendgrid.com/settings/api_keys

# Steps:
# 1. Create API Key → Full Access
# 2. Name: "PropIQ Backend (Rotated Dec 30 2025)"
# 3. Copy key (starts with SG.)
# 4. Update backend/.env
# 5. Delete old key
# 6. Redeploy backend
# 7. Test email (password reset)
```

**Key to update:**
```bash
SENDGRID_API_KEY=SG.NEW_KEY_HERE
```

---

## 📋 Post-Rotation Checklist

After rotating all keys:

**Backend:**
- [ ] All new keys updated in `backend/.env`
- [ ] Backend redeployed: `cd backend && ./deploy-azure.sh`
- [ ] Azure App Settings updated (if using Azure)

**Testing:**
- [ ] Stripe: Test payment flow
- [ ] Azure OpenAI: Run property analysis
- [ ] SendGrid: Send test email (password reset)
- [ ] No errors in logs

**Cleanup:**
- [ ] Old Stripe keys deleted from Stripe dashboard
- [ ] Old SendGrid key deleted from SendGrid dashboard
- [ ] Old Azure OpenAI key regenerated (can't reuse)

**Documentation:**
- [ ] Run `./scripts/check-rotation-status.sh`
- [ ] Mark as completed in rotation tracker
- [ ] Set reminder for next rotation (March 30, 2026)

---

## 💰 Simplified Cost Structure

### Current Monthly Costs

| Service | Free Tier | Paid Tier | Current Usage |
|---------|-----------|-----------|---------------|
| **Convex** | 1GB, 1M calls | $25/mo | Within free tier |
| **Stripe** | Pay per transaction | 2.9% + $0.30 | Revenue-based |
| **Azure OpenAI** | Usage-based | Variable | ~$10-50/mo |
| **SendGrid** | 100/day | $19.95/mo | ~15/day (well within) |

**Total:** ~$10-50/month (depending on OpenAI usage)

**Simplified from:** $10-100/month (with 3 databases)
**Savings:** Up to 50% if you had exceeded free tiers!

---

## 🎯 Rotation Schedule

| Date | Keys to Rotate | Type |
|------|----------------|------|
| **Every Quarter** | Stripe, Azure, SendGrid (3 services) | Critical keys |
| **Every Year** | JWT secret (logs out users) | Annual rotation |
| **March 30, 2026** | Next quarterly rotation | Automated reminder |
| **December 30, 2026** | Annual rotation + security audit | Full rotation |

---

## 🔄 Quarterly Rotation Workflow

Every 90 days (automated calendar reminders):

```bash
# 1. Check rotation status
cd /Users/briandusape/Projects/propiq
./scripts/check-rotation-status.sh

# 2. Rotate keys (follow prompts)
# - Stripe (3 keys)
# - Azure OpenAI (1 key)
# - SendGrid (1 key)

# 3. Update backend
# Edit backend/.env with new keys

# 4. Redeploy
cd backend
./deploy-azure.sh

# 5. Test everything
# - Payment flow
# - Property analysis
# - Email sending

# 6. Verify
./scripts/check-rotation-status.sh
```

**Total time:** 15-20 minutes every 90 days

---

## 📊 Before vs After

### BEFORE (with MongoDB + Supabase):

**Services:** 9 total
- Convex, JWT, Intercom, Slack (4)
- Stripe, Azure, SendGrid (3)
- MongoDB, Supabase (2)

**Databases:** 3
**Keys to rotate:** 9
**Time per rotation:** 40-50 minutes
**Complexity:** High

### AFTER (Convex-only):

**Services:** 5 total
- Convex, JWT, Slack (completed)
- Stripe, Azure, SendGrid (3 remaining)

**Databases:** 1 (Convex)
**Keys to rotate:** 5
**Time per rotation:** 15-20 minutes
**Complexity:** Low ✅

**Improvement:** 44% fewer keys, 60% faster rotation!

---

## ✅ Migration Complete!

**What was removed:**
- ✅ MongoDB (deleted from codebase)
- ✅ Supabase (deleted from codebase)
- ✅ All related database files
- ✅ MongoDB and Supabase env vars
- ✅ Database dependencies from requirements.txt

**What remains:**
- ✅ Convex (primary database)
- ✅ Stripe (payments)
- ✅ Azure OpenAI (AI service)
- ✅ SendGrid (email)
- ✅ Supporting services (JWT, Slack)

**Next steps:**
1. Rotate remaining 3 critical services (Stripe, Azure, SendGrid)
2. Delete MongoDB cluster in MongoDB Atlas
3. Pause/delete Supabase project
4. Update CLAUDE.md with new architecture
5. Test PropIQ thoroughly

---

## 🚀 Quick Start

Ready to rotate the remaining keys?

```bash
# Open rotation tracker
./scripts/check-rotation-status.sh

# Follow the prompts for:
# 1. Stripe (5 minutes)
# 2. Azure OpenAI (3 minutes)
# 3. SendGrid (3 minutes)

# Total time: ~15 minutes
```

**See:** `QUICK_ROTATION_GUIDE.md` for detailed instructions

---

**Last Updated:** December 30, 2025
**Architecture:** Convex-Only ✅
**Keys Remaining:** 3 services (5 total keys)
**Next Rotation:** March 30, 2026
