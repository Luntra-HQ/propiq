# Stripe Checkout Flow Debugging Guide

## Current Status: December 18, 2025

### ✅ Confirmed Working:
- Stripe environment variables are set in Convex
- Stripe Price IDs match configuration:
  - Starter: `price_1SXQEsJogOchEFxvG8fT5B0b` ($49/mo)
  - Pro: `price_1SL51sJogOchEFxvVounuNcK` ($99/mo)
  - Elite: `price_1SXQF2JogOchEFxvRpZ0GGuf` ($199/mo)
- Stripe Secret Key: `sk_live_51RdHuvJogOchEFxv...` (LIVE mode)

---

## Test Plan: Debug Stripe Checkout

### Step 1: Identify the Exact Error

**Method A: Browser Console Test**
```javascript
// Open https://propiq.luntra.one/pricing in browser
// Open Developer Tools (F12) → Console tab
// Click "Choose Starter" button
// Look for errors in console

// Expected flow:
// 1. [PRICING] Upgrading to tier: starter
// 2. [PRICING] Creating Stripe checkout session...
// 3. [PRICING] Redirecting to Stripe checkout: cs_test_...
// 4. Window redirects to https://checkout.stripe.com/...

// If error occurs, copy the full error message
```

**Method B: Network Tab Test**
```
1. Open https://propiq.luntra.one/pricing
2. Open Developer Tools (F12) → Network tab
3. Filter by "Fetch/XHR"
4. Click "Choose Starter" button
5. Look for failed requests (red status codes)
6. Click on failed request → Response tab
7. Copy error response
```

---

### Step 2: Common Issues & Fixes

#### Issue #1: "User not authenticated"
**Symptom:** Alert says "Please sign up or log in to complete your purchase"

**Fix:** This is expected behavior! The flow is:
1. Click "Choose Starter" → Redirect to login
2. Login/signup → Auto-redirect to Stripe checkout
3. Complete payment → Return to /app?upgrade=success

**Test:**
```
1. Go to https://propiq.luntra.one/pricing
2. Click "Choose Starter"
3. You should see alert → click OK
4. Login page opens
5. Login → Should auto-redirect to Stripe checkout after 500ms
```

---

#### Issue #2: "Stripe not configured" or "Invalid subscription tier"
**Symptom:** Error: "Stripe not configured" or "Invalid subscription tier"

**Root Cause:** Convex environment variables not accessible in action

**Fix:**
```bash
cd /Users/briandusape/Projects/LUNTRA/propiq

# Verify env vars are set
npx convex env list | grep STRIPE

# Should show:
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_STARTER_PRICE_ID=price_...
# STRIPE_PRO_PRICE_ID=price_...
# STRIPE_ELITE_PRICE_ID=price_...

# If missing, set them:
npx convex env set STRIPE_SECRET_KEY "sk_live_YOUR_STRIPE_SECRET_KEY_HERE"
npx convex env set STRIPE_STARTER_PRICE_ID "price_1SXQEsJogOchEFxvG8fT5B0b"
npx convex env set STRIPE_PRO_PRICE_ID "price_1SL51sJogOchEFxvVounuNcK"
npx convex env set STRIPE_ELITE_PRICE_ID "price_1SXQF2JogOchEFxvRpZ0GGuf"
```

---

#### Issue #3: Stripe API Error
**Symptom:** Error: "Stripe API error: ..."

**Possible Causes:**
- Price ID doesn't exist in Stripe
- Price ID belongs to different Stripe account
- Stripe account in test mode but using live price IDs (or vice versa)

**Fix:**
```bash
# Login to Stripe CLI
stripe login

# List your products and prices
stripe prices list --limit 10

# Verify the price IDs exist:
stripe prices retrieve price_1SXQEsJogOchEFxvG8fT5B0b  # Starter $49
stripe prices retrieve price_1SL51sJogOchEFxvVounuNcK  # Pro $99
stripe prices retrieve price_1SXQF2JogOchEFxvRpZ0GGuf  # Elite $199

# Check if you're in live mode
stripe config --list
# Should show: test_mode = false
```

---

#### Issue #4: CORS or Network Error
**Symptom:** "Failed to fetch" or "Network error"

**Root Cause:** Convex action can't reach Stripe API

**Fix:** Check Convex deployment status
```bash
cd /Users/briandusape/Projects/LUNTRA/propiq

# Check Convex deployment
npx convex dev --once

# Verify functions are deployed
npx convex run payments:createCheckoutSession --help
```

---

### Step 3: Manual Test (Command Line)

**Test Convex function directly:**
```bash
cd /Users/briandusape/Projects/LUNTRA/propiq

# Get a test user ID first
npx convex run auth:listUsers

# Create checkout session manually (replace USER_ID with actual ID)
npx convex run payments:createCheckoutSession '{
  "userId": "USER_ID_HERE",
  "tier": "starter",
  "successUrl": "https://propiq.luntra.one/app?upgrade=success",
  "cancelUrl": "https://propiq.luntra.one/pricing"
}'

# Expected output:
# {
#   "success": true,
#   "sessionId": "cs_test_...",
#   "url": "https://checkout.stripe.com/c/pay/cs_test_..."
# }
```

---

### Step 4: End-to-End Test (Real User Flow)

**Full Purchase Flow Test:**

1. **Start as unauthenticated user:**
   ```
   - Open incognito window
   - Go to https://propiq.luntra.one/pricing
   - Click "Choose Starter" ($49/mo)
   - Should see alert: "Please sign up or log in..."
   ```

2. **Sign up:**
   ```
   - Click OK on alert → Redirects to /login?redirect=/pricing&tier=starter
   - Fill in signup form (use test email like test+stripe@yourdomain.com)
   - Submit form → Creates account
   ```

3. **Auto-redirect to checkout:**
   ```
   - After signup, sessionStorage should have:
     - selectedTier: "starter"
     - checkoutIntent: "true"
   - After 500ms delay, should auto-trigger checkout
   - Should redirect to Stripe checkout page
   ```

4. **Complete payment:**
   ```
   - Fill in Stripe checkout form
   - Use test card: 4242 4242 4242 4242
   - Any future expiry date (e.g., 12/25)
   - Any 3-digit CVC (e.g., 123)
   - Click "Subscribe"
   ```

5. **Verify success:**
   ```
   - Should redirect to https://propiq.luntra.one/app?upgrade=success
   - User should see success message
   - Check Convex dashboard: User's subscriptionTier should be "starter"
   - Check Stripe dashboard: New subscription should appear
   ```

---

## Debugging Checklist

### Before Testing:
- [ ] Convex environment variables are set (run `npx convex env list | grep STRIPE`)
- [ ] Stripe price IDs exist in Stripe account (run `stripe prices list`)
- [ ] Stripe account is in LIVE mode (not test mode)
- [ ] Convex functions are deployed (run `npx convex dev --once`)
- [ ] Frontend is using correct Convex URL

### During Testing:
- [ ] Browser console is open (F12) to see logs
- [ ] Network tab is monitoring requests
- [ ] No ad blockers or privacy extensions blocking Stripe
- [ ] Using supported browser (Chrome, Safari, Firefox)

### After Error:
- [ ] Copy full error message from console
- [ ] Screenshot of Network tab showing failed request
- [ ] Check Convex logs: https://dashboard.convex.dev
- [ ] Check Stripe logs: https://dashboard.stripe.com/logs

---

## Known Issues & Workarounds

### Issue: "Failed to create checkout session"
**Workaround:** User can manually subscribe via Stripe Payment Links:
- Starter ($49): https://buy.stripe.com/STARTER_LINK_HERE
- Pro ($99): https://buy.stripe.com/PRO_LINK_HERE
- Elite ($199): https://buy.stripe.com/ELITE_LINK_HERE

*(You need to create these links in Stripe Dashboard → Payment Links)*

---

## Success Indicators

✅ **Checkout is working if:**
1. Clicking "Choose Starter" → No errors in console
2. After login → Auto-redirects to `https://checkout.stripe.com/c/pay/cs_...`
3. After payment → Redirects to `/app?upgrade=success`
4. User's Convex record shows `subscriptionTier: "starter"`
5. Stripe dashboard shows new active subscription

---

## Contact for Help

If checkout is still failing after trying all fixes:

1. **Collect Debug Info:**
   - Browser console screenshot
   - Network tab screenshot
   - Convex logs from dashboard
   - Stripe logs from dashboard

2. **Check Convex Dashboard:**
   - https://dashboard.convex.dev
   - Go to Logs tab
   - Filter by function: `payments:createCheckoutSession`
   - Look for error details

3. **Check Stripe Dashboard:**
   - https://dashboard.stripe.com/logs
   - Look for recent API errors
   - Check if checkout sessions are being created

---

**Last Updated:** December 18, 2025
**Stripe Mode:** LIVE
**Convex Deployment:** mild-tern-361 (or diligent-starling-125)

