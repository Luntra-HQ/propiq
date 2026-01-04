# Stripe API Key Rotation Guide
**Date:** December 31, 2025
**Issue:** #10 - Complete Stripe API Key Rotation
**Reason:** Keys exposed in documentation (November 2025)

---

## ⚠️ Why This is Critical

In November 2025, the following Stripe keys were exposed in documentation:
- `STRIPE_SECRET_KEY=sk_live_...[EXPOSED_REDACTED]`
- `STRIPE_PUBLISHABLE_KEY=pk_live_...[EXPOSED_REDACTED]`
- `STRIPE_WEBHOOK_SECRET=whsec_...[EXPOSED_REDACTED]`

While the documentation was sanitized, **the keys themselves were NOT rotated**. If these keys are still active in Convex or Azure, they pose a security risk.

---

## ✅ Pre-Rotation Checklist

**Already Verified:**
- ✅ Exposed keys are NOT hardcoded in codebase
- ✅ Code uses environment variables (secure pattern)
- ✅ Frontend doesn't have Stripe keys (correct)

**Need to Verify:**
- [ ] Check if exposed keys are still in Convex environment variables
- [ ] Check if exposed keys are still in Azure App Service settings

---

## 🔄 Rotation Steps

### Step 1: Verify Current Keys in Convex

1. Open Convex dashboard:
   ```bash
   open https://dashboard.convex.dev/t/brian-dusape/propiq/settings/environment-variables
   ```

2. Check if current `STRIPE_SECRET_KEY` matches the exposed key pattern (starts with `sk_live_51...` from Nov 2025)
   - **If YES:** Keys need rotation (proceed to Step 2)
   - **If NO:** Keys already rotated (skip to Step 6 - Verification)

### Step 2: Create New Stripe Secret Key

1. Login to Stripe dashboard:
   ```bash
   open https://dashboard.stripe.com/apikeys
   ```

2. Create new secret key:
   - Click **"Create secret key"**
   - Name: `PropIQ Backend (Rotated 2025-12-31)`
   - Click **"Create"**
   - **IMPORTANT:** Copy the new key immediately (you won't see it again)
   - Key format: `sk_live_51...` (51 characters, starts with `sk_live_`)

3. Save the new key temporarily:
   ```bash
   # Copy to clipboard or save in password manager
   # DO NOT save to file or commit to git
   ```

### Step 3: Update Convex Environment Variables

1. Go to Convex environment variables:
   ```bash
   open https://dashboard.convex.dev/t/brian-dusape/propiq/settings/environment-variables
   ```

2. Update `STRIPE_SECRET_KEY`:
   - Click **"Edit"** next to `STRIPE_SECRET_KEY`
   - Paste the new key from Step 2
   - Click **"Save"**

3. Deploy changes:
   ```bash
   cd /Users/briandusape/Projects/propiq
   npx convex deploy
   ```

### Step 4: Rotate Webhook Secret

1. Go to Stripe webhooks:
   ```bash
   open https://dashboard.stripe.com/webhooks
   ```

2. Find the existing webhook for PropIQ:
   - Endpoint: `https://mild-tern-361.convex.site/stripe/webhook`
   - Click **"..."** → **"Delete"**

3. Create new webhook:
   - Click **"Add endpoint"**
   - Endpoint URL: `https://mild-tern-361.convex.site/stripe/webhook`
   - Description: `PropIQ Webhook (Rotated 2025-12-31)`
   - Events to send:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`
   - Click **"Add endpoint"**

4. Copy webhook signing secret:
   - After creating, click the new webhook
   - Click **"Reveal"** next to **"Signing secret"**
   - Copy the secret (format: `whsec_...`)

5. Update Convex environment:
   ```bash
   # Go to Convex dashboard
   open https://dashboard.convex.dev/t/brian-dusape/propiq/settings/environment-variables

   # Update STRIPE_WEBHOOK_SECRET with new value
   # Deploy again
   ```

### Step 5: Delete Old Keys from Stripe

**IMPORTANT:** Only do this AFTER verifying new keys work (Step 6)

1. Return to Stripe API keys:
   ```bash
   open https://dashboard.stripe.com/apikeys
   ```

2. Find the old secret key (created before Dec 31, 2025)

3. Click **"..."** → **"Delete"**

4. Confirm deletion

### Step 6: Verification

Run the verification script:
```bash
cd /Users/briandusape/Projects/propiq
chmod +x scripts/verify-stripe-rotation.sh
./scripts/verify-stripe-rotation.sh
```

Or manually verify:

#### Test 1: Webhook Signature Validation
```bash
# Send test webhook to Convex
curl -X POST https://mild-tern-361.convex.site/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'

# Expected: 401 or signature validation error (NOT 500)
# This confirms webhook secret is configured
```

#### Test 2: Create Test Checkout Session
```bash
# Use Convex function to create a test checkout
# This will verify the new secret key works

# Open Convex dashboard
open https://dashboard.convex.dev/deployment/function/payments:createCheckoutSession

# Or test via web app:
# 1. Login to PropIQ
# 2. Go to Pricing page
# 3. Click "Upgrade to Starter" ($29/mo)
# 4. Verify Stripe checkout page loads
# 5. Close checkout (don't complete payment)
```

#### Test 3: Monitor Stripe Logs
```bash
# Check Stripe logs for errors
open https://dashboard.stripe.com/logs

# Should see successful API requests
# No authentication errors
```

### Step 7: Update Azure (If Applicable)

If you're also using Azure App Service for backend (in addition to Convex):

```bash
# Update Azure App Service settings
az webapp config appsettings set \
  --name luntra-outreach-app \
  --resource-group luntra-outreach-rg \
  --settings \
    STRIPE_SECRET_KEY=<new_key> \
    STRIPE_WEBHOOK_SECRET=<new_secret>

# Restart app
az webapp restart \
  --name luntra-outreach-app \
  --resource-group luntra-outreach-rg
```

---

## 📋 Post-Rotation Checklist

After completing all steps, verify:

### Immediate Checks
- [ ] New Stripe secret key works in Convex
- [ ] Webhook receives and validates events
- [ ] Checkout session creation works
- [ ] Old keys deleted from Stripe dashboard
- [ ] No errors in Stripe logs
- [ ] No errors in Convex logs

### 24-Hour Monitoring
- [ ] Monitor Stripe dashboard for errors
- [ ] Monitor Convex logs for payment errors
- [ ] Test actual payment flow (use test mode if needed)
- [ ] Verify webhook deliveries successful

### Documentation
- [ ] Document rotation in team notes
- [ ] Update runbook/playbook
- [ ] Set calendar reminder for next rotation

---

## 🔐 Security Best Practices

### Key Rotation Schedule

Set calendar reminders for future rotations:
- **Next rotation:** April 1, 2026 (90 days)
- **Frequency:** Quarterly (every 90 days)
- **Exception:** Immediately if keys are exposed

### Key Storage Rules

✅ **DO:**
- Store keys in environment variables only
- Use password manager for backups
- Rotate quarterly
- Delete old keys after rotation
- Use separate keys for dev/staging/production

❌ **DON'T:**
- Hardcode keys in source code
- Commit keys to git
- Share keys via email/Slack
- Reuse keys across environments
- Store keys in documentation

### Monitoring

Set up alerts for:
- Failed Stripe API calls
- Webhook delivery failures
- Unauthorized payment attempts
- Suspicious refund activity

---

## 🆘 Rollback Plan

If new keys cause issues:

1. **Immediate rollback:**
   ```bash
   # Restore old keys in Convex environment
   # (Only if old keys NOT deleted yet)
   ```

2. **Debug the issue:**
   - Check Convex logs
   - Check Stripe logs
   - Verify webhook endpoint URL
   - Verify event selections

3. **Try rotation again** once issue identified

---

## 📞 Support

**Stripe Support:** https://support.stripe.com
**Convex Docs:** https://docs.convex.dev
**Issue Tracker:** GitHub Issue #10

**Created:** December 31, 2025
**Status:** Pending user action
