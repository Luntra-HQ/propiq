# Stripe Checkout Issue - Diagnosis & Fix

**Date:** December 18, 2025 (Launch Day)
**Status:** CRITICAL - Blocking purchases
**Priority:** P0 - Must fix before launch announcement

---

## Quick Summary

✅ **What's Working:**
- Stripe environment variables are set in Convex
- Price IDs are correct ($49, $99, $199)
- Stripe account is in LIVE mode
- Convex deployment is active

❓ **What's Unknown:**
- The exact error users see when clicking "Choose Plan"
- Whether the issue is frontend or backend

---

## How to Debug (5 minutes)

### Option 1: Use the Test Page (Easiest)

1. Open the diagnostic tool:
   ```bash
   # Serve the test page locally
   cd /Users/briandusape/Projects/LUNTRA/propiq
   python3 -m http.server 8080

   # Open in browser
   open http://localhost:8080/test-stripe.html
   ```

2. Run all 4 tests in the page
3. Copy the results and we'll analyze them

### Option 2: Test on Live Site

1. Open https://propiq.luntra.one/pricing in **incognito window**
2. Open Browser DevTools (F12) → **Console** tab
3. Click **"Choose Starter"** button
4. Look for logs starting with `[PRICING]`
5. Copy any error messages

**Expected logs (if working):**
```
[PRICING] Upgrading to tier: starter
[PRICING] User not authenticated, redirecting to login
```

**OR (if logged in):**
```
[PRICING] Upgrading to tier: starter
[PRICING] Creating Stripe checkout session...
[PRICING] Redirecting to Stripe checkout: cs_live_...
```

---

## Most Likely Issues & Fixes

### Issue #1: Convex Environment Variables Not Accessible

**Symptom:** Error: "Stripe not configured" or "undefined price ID"

**Root Cause:** Environment variables set but not deployed to production

**Fix:**
```bash
cd /Users/briandusape/Projects/LUNTRA/propiq

# Redeploy Convex functions
npx convex deploy

# Verify deployment
npx convex logs

# Test manually
npx convex run payments:createCheckoutSession '{
  "userId": "YOUR_USER_ID",
  "tier": "starter",
  "successUrl": "https://propiq.luntra.one/app?upgrade=success",
  "cancelUrl": "https://propiq.luntra.one/pricing"
}'
```

---

### Issue #2: Convex Deployment Mismatch

**Symptom:** Frontend calls one Convex URL, but env vars are on different deployment

**Root Cause:** Multiple Convex deployments (dev vs prod)

**Current Config:**
- Frontend uses: `https://diligent-starling-125.convex.cloud`
- Env vars are on: `diligent-starling-125` (same - ✅)

**Verify:**
```bash
# Check frontend Convex URL
cat .env.local | grep CONVEX_URL

# Check which deployment has env vars
npx convex env list | head -1

# Should match!
```

If they DON'T match, update `.env.local`:
```bash
echo 'VITE_CONVEX_URL=https://diligent-starling-125.convex.cloud' > .env.local
```

Then rebuild frontend:
```bash
cd frontend
npm run build
```

---

### Issue #3: Price IDs Don't Exist in Stripe

**Symptom:** Stripe API error: "No such price: price_..."

**Fix:**
```bash
# Verify prices exist in Stripe
stripe prices retrieve price_1SXQEsJogOchEFxvG8fT5B0b  # Starter
stripe prices retrieve price_1SL51sJogOchEFxvVounuNcK  # Pro
stripe prices retrieve price_1SXQF2JogOchEFxvRpZ0GGuf  # Elite

# If any fail, create new prices:
stripe prices create \
  --product prod_YOUR_PRODUCT_ID \
  --currency usd \
  --unit_amount 4900 \
  --recurring interval=month \
  --active true

# Then update Convex env vars with new price IDs
```

---

### Issue #4: Frontend Not Deployed with Latest Code

**Symptom:** Old pricing shows on live site ($29/$79 instead of $49/$99)

**Root Cause:** I fixed the Schema.org markup but it hasn't been deployed yet

**Fix:**
```bash
cd /Users/briandusape/Projects/LUNTRA/propiq/frontend

# Build with latest changes
npm run build

# Deploy to Netlify (or your hosting)
netlify deploy --prod --dir=dist

# OR if using Azure Static Web Apps:
# (follow your deployment process)
```

---

### Issue #5: Auth System Issue

**Symptom:** "User not found" even when logged in

**Root Cause:** User exists in Convex but `api.auth.getUser` fails

**Fix:**
```bash
# Check if auth system is working
cd /Users/briandusape/Projects/LUNTRA/propiq

# List users in Convex
npx convex run auth:listUsers

# If no users show up, auth system needs fixing
# Check convex/auth.ts for issues
```

---

## Emergency Workaround (If Can't Fix in Time)

If you can't fix Stripe checkout before launch, use **Payment Links** as a temporary solution:

### Create Stripe Payment Links

1. Go to https://dashboard.stripe.com/payment-links
2. Click "Create payment link"
3. Create 3 links:
   - **Starter:** $49/mo subscription
   - **Pro:** $99/mo subscription
   - **Elite:** $199/mo subscription
4. Copy the URLs (format: `https://buy.stripe.com/XXXX`)

### Update Pricing Page

Replace the checkout button actions with direct links:

```tsx
// In PricingPageWrapper.tsx or PricingPage.tsx
const PAYMENT_LINKS = {
  starter: 'https://buy.stripe.com/STARTER_LINK_HERE',
  pro: 'https://buy.stripe.com/PRO_LINK_HERE',
  elite: 'https://buy.stripe.com/ELITE_LINK_HERE'
};

const handleSelectTier = (tier: string) => {
  // Temporary: Direct to Stripe Payment Link
  window.location.href = PAYMENT_LINKS[tier];

  // TODO: Fix Convex checkout flow after launch
};
```

**Pros:**
- ✅ Works immediately
- ✅ No code changes needed (just update links)
- ✅ Can launch TODAY

**Cons:**
- ❌ Users aren't automatically upgraded in Convex
- ❌ You'll need to manually sync subscriptions
- ❌ No auto-redirect to /app after payment

---

## Testing Checklist

Before launch, verify ALL of these:

### Pre-Test:
- [ ] Convex env vars are set (run `npx convex env list | grep STRIPE`)
- [ ] Stripe prices exist (run `stripe prices list`)
- [ ] Frontend is built and deployed with latest code
- [ ] Browser console is open to see errors

### Test Flow:
- [ ] Go to https://propiq.luntra.one/pricing (incognito)
- [ ] Click "Choose Starter"
- [ ] Should redirect to /login OR show Stripe checkout
- [ ] Login/signup
- [ ] Should auto-redirect to Stripe checkout
- [ ] Enter test card: 4242 4242 4242 4242
- [ ] Submit payment
- [ ] Should redirect to /app?upgrade=success
- [ ] User's tier in Convex should be "starter"
- [ ] Stripe dashboard shows new subscription

### If ANY step fails:
1. Stop and document the exact error
2. Use diagnostic tools to identify root cause
3. Apply appropriate fix from above
4. Retest entire flow

---

## Next Steps

**Right Now:**

1. Open the live site and test checkout
2. Copy any error messages you see
3. Run the diagnostic tool (test-stripe.html)
4. Let me know what you find

**Once Working:**

5. Test all 3 tiers (Starter, Pro, Elite)
6. Verify Stripe webhooks are configured
7. Test cancellation flow
8. Document the working flow

---

## Contact

If you're stuck:

1. **Share error messages** - Copy from browser console
2. **Share Convex logs** - https://dashboard.convex.dev → Logs tab
3. **Share Stripe logs** - https://dashboard.stripe.com/logs
4. **Run diagnostic tool** - Open test-stripe.html and share results

I'll help debug based on the actual error!

---

**Last Updated:** December 18, 2025 18:00
**Urgency:** CRITICAL - Blocking launch
**Estimated Fix Time:** 15-30 minutes (once we see the error)

