# Subscription Management Testing Guide
## Phase 1: Stripe Customer Portal Integration

**Last Updated:** December 23, 2025
**Status:** Ready for Testing
**Estimated Testing Time:** 30-45 minutes

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Stripe Configuration](#stripe-configuration)
4. [Testing Checklist](#testing-checklist)
5. [Test Scenarios](#test-scenarios)
6. [Troubleshooting](#troubleshooting)
7. [Known Limitations](#known-limitations)

---

## Prerequisites

### Required Access
- [ ] Stripe Dashboard access (live or test mode)
- [ ] PropIQ production/staging environment access
- [ ] Test credit cards (Stripe provides these)
- [ ] Admin access to Convex deployment

### Required Accounts
- [ ] Free tier test account
- [ ] Paid tier test account (Starter, Pro, or Elite)
- [ ] Test Stripe customer with active subscription

### Environment Variables (Must be Set)
```bash
# In Convex Dashboard (https://dashboard.convex.dev)
STRIPE_SECRET_KEY=sk_live_xxx  # or sk_test_xxx for testing
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ELITE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Environment Setup

### 1. Deploy Backend Changes

```bash
cd /Users/briandusape/Projects/propiq

# Deploy Convex functions (includes new customer portal action)
npx convex deploy --prod

# Verify deployment
npx convex logs --prod
```

**Expected Output:**
```
✓ Deployed functions:
  - payments:createCheckoutSession
  - payments:createCustomerPortalSession ← NEW
  - payments:handleSubscriptionSuccess
  - payments:cancelSubscription
  - http (webhook routes)
```

### 2. Deploy Frontend Changes

```bash
cd /Users/briandusape/Projects/propiq/frontend

# Build frontend
npm run build

# Deploy to your hosting (Netlify/Vercel/etc)
# Example for Vercel:
vercel --prod

# Or for Netlify:
netlify deploy --prod
```

### 3. Verify Deployment

```bash
# Test health endpoint
curl https://[your-convex-url]/health

# Should return:
# {"status":"healthy","service":"PropIQ Convex Backend","timestamp":...}
```

---

## Stripe Configuration

### Enable Customer Portal

**CRITICAL:** Stripe Customer Portal must be configured before testing.

1. **Go to Stripe Dashboard**
   - Navigate to: https://dashboard.stripe.com/settings/billing/portal
   - Or: Settings → Billing → Customer Portal

2. **Activate Customer Portal**
   - Click "Activate Customer Portal"
   - Choose "Use Stripe-hosted portal"

3. **Configure Settings**

   **Business Information:**
   - [ ] Upload logo
   - [ ] Set brand color (suggest: #7C3AED - violet-600)
   - [ ] Add support email: support@luntra.one
   - [ ] Add privacy policy URL: https://propiq.luntra.one/privacy
   - [ ] Add terms of service URL: https://propiq.luntra.one/terms

   **Functionality:**
   - [ ] ✅ Allow customers to update payment methods
   - [ ] ✅ Allow customers to view billing history
   - [ ] ✅ Allow customers to cancel subscriptions
   - [ ] ✅ Show invoice history
   - [ ] ⚠️ Configure cancellation behavior (see below)

4. **Cancellation Settings** (IMPORTANT)

   Choose one:
   - **Option A: Cancel at Period End** (Recommended)
     - User keeps access until billing period ends
     - Less frustration for users
     - Better for retention

   - **Option B: Cancel Immediately**
     - User loses access immediately
     - Partial refund may apply
     - Can frustrate users

   **Recommendation:** Choose "Cancel at Period End"

5. **Save Configuration**
   - Click "Save changes"
   - Test mode and Live mode have separate configs!

### Webhook Configuration

Verify webhook endpoint is configured:

1. Go to: https://dashboard.stripe.com/webhooks
2. Ensure endpoint exists: `https://[your-convex-url]/stripe-webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

---

## Testing Checklist

### Pre-Testing Verification

- [ ] All environment variables set in Convex
- [ ] Convex functions deployed successfully
- [ ] Frontend deployed and accessible
- [ ] Stripe Customer Portal configured
- [ ] Stripe webhook endpoint verified
- [ ] Test accounts created (free and paid)

### Feature Testing

**Dashboard "Manage" Button:**
- [ ] Free user sees "Upgrade" button
- [ ] Paid user sees "Manage" button
- [ ] Button click opens Stripe portal (paid users)
- [ ] Free user gets alert + redirect to pricing

**Header Tier Badge:**
- [ ] Free user sees static badge
- [ ] Paid user sees clickable badge
- [ ] Hover shows tooltip
- [ ] Click opens Stripe portal

**Stripe Customer Portal:**
- [ ] Portal loads successfully
- [ ] Displays correct subscription info
- [ ] Shows payment method
- [ ] Shows billing history
- [ ] "Return to PropIQ" link works

**Portal Functionality:**
- [ ] Can update payment method
- [ ] Can view invoice history
- [ ] Can download receipts
- [ ] Can cancel subscription
- [ ] Return URL redirects to /app

### Error Handling

- [ ] Free user clicking "Manage" shows alert
- [ ] User without Stripe customer ID gets error
- [ ] Network errors are handled gracefully
- [ ] Portal loading errors show message

---

## Test Scenarios

### Scenario 1: Paid User Manages Subscription

**Setup:**
- Login as user with Starter/Pro/Elite subscription
- Ensure user has active Stripe subscription

**Test Steps:**
1. Navigate to dashboard
2. Locate "Manage" button in BenefitsCard
3. Click "Manage"
4. Verify redirect to Stripe portal
5. Verify subscription details are correct
6. Click "Update payment method"
7. Enter test card: `4242 4242 4242 4242`
8. Save changes
9. Click "Return to PropIQ"
10. Verify redirect back to /app

**Expected Result:**
✅ Payment method updated successfully
✅ User returned to PropIQ dashboard
✅ No errors in console

### Scenario 2: Paid User Cancels Subscription

**Setup:**
- Login as user with paid subscription
- Ensure subscription is active

**Test Steps:**
1. Click "Manage" in dashboard or header
2. In Stripe portal, click "Cancel subscription"
3. Follow cancellation flow
4. Note cancellation date (end of period vs immediate)
5. Return to PropIQ
6. Refresh dashboard

**Expected Result:**
✅ Subscription marked for cancellation
✅ User retains access until period end (if configured)
✅ Dashboard shows correct status
✅ Webhook received and processed

**Verification:**
```bash
# Check Convex logs for webhook
npx convex logs --prod | grep "customer.subscription"
```

### Scenario 3: Free User Attempts to Manage

**Setup:**
- Login as free tier user
- Ensure no active subscription

**Test Steps:**
1. Navigate to dashboard
2. Verify "Upgrade" button is shown (not "Manage")
3. Click tier badge in header (should not be clickable)
4. If "Manage" appears, click it

**Expected Result:**
✅ Alert: "You need a paid subscription to access the billing portal"
✅ Redirected to pricing page
✅ No errors in console

### Scenario 4: Header Tier Badge Click

**Setup:**
- Login as paid user

**Test Steps:**
1. Locate tier badge in header (e.g., "Pro", "Starter")
2. Hover over badge
3. Verify tooltip appears
4. Click badge
5. Verify redirect to Stripe portal

**Expected Result:**
✅ Tooltip shows: "Manage subscription and billing"
✅ Badge is clickable (hover state visible)
✅ Click opens Stripe portal
✅ Return works correctly

### Scenario 5: View Billing History

**Setup:**
- Login as paid user with at least 2 months of history

**Test Steps:**
1. Click "Manage" button
2. In Stripe portal, view "Billing history"
3. Verify invoices are listed
4. Click "Download" on an invoice
5. Verify PDF downloads

**Expected Result:**
✅ All invoices displayed
✅ Correct amounts and dates
✅ PDF downloads successfully
✅ Invoice details are accurate

### Scenario 6: Update Payment Method

**Setup:**
- Login as paid user

**Test Steps:**
1. Click "Manage"
2. Click "Update payment method"
3. Enter new test card:
   - Card: `5555 5555 5555 4444` (Mastercard)
   - Expiry: Any future date
   - CVC: Any 3 digits
4. Save changes
5. Verify success message
6. Return to PropIQ

**Expected Result:**
✅ Payment method updated
✅ Next invoice will use new card
✅ Success confirmation shown
✅ Stripe dashboard reflects change

### Scenario 7: Reactivate Cancelled Subscription

**Setup:**
- Cancelled subscription (end of period)

**Test Steps:**
1. Click "Manage" before period ends
2. Look for "Reactivate" option
3. Click "Reactivate subscription"
4. Verify reactivation
5. Return to PropIQ

**Expected Result:**
✅ Subscription reactivated
✅ No new charge (already paid)
✅ Access continues uninterrupted
✅ Webhook updates subscription status

---

## Troubleshooting

### Issue: "Stripe not configured" error

**Cause:** Missing `STRIPE_SECRET_KEY` environment variable

**Solution:**
```bash
# In Convex dashboard
npx convex env set STRIPE_SECRET_KEY "sk_live_xxx"
npx convex deploy --prod
```

### Issue: "No Stripe customer ID found"

**Cause:** User never completed a Stripe checkout

**Solution:**
1. User must upgrade to paid tier first
2. Complete Stripe checkout flow
3. Webhook creates `stripeCustomerId`
4. Then "Manage" will work

**Debug:**
```bash
# Check user record in Convex dashboard
# Verify stripeCustomerId field exists
```

### Issue: Portal doesn't load / 404 error

**Cause:** Stripe Customer Portal not configured

**Solution:**
1. Go to Stripe Dashboard → Settings → Billing → Customer Portal
2. Click "Activate Customer Portal"
3. Configure settings
4. Save changes

### Issue: Return URL doesn't work

**Cause:** Domain not whitelisted in Stripe

**Solution:**
1. Go to Stripe Dashboard → Settings → Branding
2. Add domain: `https://propiq.luntra.one`
3. Save changes

### Issue: Free user sees "Manage" button

**Cause:** Tier check logic error

**Debug:**
```javascript
// Check in browser console
console.log('Current tier:', user?.subscriptionTier);
// Should be 'free' for free users
```

**Solution:**
- Verify user tier in database
- Check BenefitsCard conditional logic
- Ensure `currentTier !== 'free'` check works

### Issue: Webhook not received

**Cause:** Webhook endpoint not configured or signature mismatch

**Solution:**
1. Verify webhook endpoint in Stripe Dashboard
2. Check `STRIPE_WEBHOOK_SECRET` is set
3. Verify endpoint URL is correct
4. Check Convex logs for errors

**Debug:**
```bash
# Check webhook deliveries in Stripe
# Dashboard → Developers → Webhooks → [endpoint] → Events

# Check Convex logs
npx convex logs --prod | grep "Stripe webhook"
```

---

## Known Limitations

### Current Limitations (Phase 1)

1. **No In-App Downgrade**
   - Users must cancel in Stripe portal
   - Then manually select new tier
   - Future: Direct downgrade UI

2. **No Prorated Refunds Shown**
   - Stripe handles refunds automatically
   - Not displayed in app UI
   - Future: Show prorated amounts

3. **No Billing Preview**
   - Can't see what next invoice will be
   - Stripe portal shows this
   - Future: Pull from Stripe API

4. **No Team Management** (Elite tier)
   - Elite tier mentions "up to 5 users"
   - Not yet implemented
   - Future: Team invitation system

5. **No Usage-Based Billing**
   - All tiers are flat monthly rate
   - No overage charges
   - Future: Add-on purchases

### Browser Compatibility

Tested on:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

### Mobile Testing

- ✅ iOS Safari
- ✅ Android Chrome
- ⚠️ Small screens may need UI adjustments

---

## Success Criteria

Phase 1 is successful if:

- [ ] Paid users can open Stripe Customer Portal
- [ ] Users can update payment methods
- [ ] Users can cancel subscriptions
- [ ] Users can view billing history
- [ ] Return URL works correctly
- [ ] Free users are blocked appropriately
- [ ] No console errors during normal flow
- [ ] Webhooks are received and processed
- [ ] Mobile experience is functional

---

## Testing Metrics to Track

**Before Launch:**
- Portal open success rate: Target 100%
- Return URL success rate: Target 100%
- Payment update success rate: Target 95%+
- Cancellation completion rate: Track baseline

**After Launch:**
- % of users using self-service vs support
- Avg time to complete payment update
- Cancellation reasons (Stripe provides this)
- Reactivation rate after cancellation

---

## Next Steps After Testing

Once Phase 1 testing is complete:

1. **Document Issues Found**
   - Create GitHub issues for bugs
   - Prioritize by severity
   - Fix critical issues before Phase 2

2. **Move to Phase 2: Settings Page**
   - Create dedicated Settings/Account page
   - Show subscription overview
   - Add "Manage Billing" button
   - Include account preferences

3. **Future Enhancements**
   - In-app cancellation flow
   - Downgrade support
   - Billing preview
   - Team management (Elite tier)

---

## Support Contacts

**Development:**
- Brian Dusape: brian@luntra.one

**Stripe Support:**
- Dashboard: https://dashboard.stripe.com/support
- Email: support@stripe.com

**PropIQ Production:**
- URL: https://propiq.luntra.one
- API: https://[convex-url]

---

**Testing Template**

```markdown
## Test Session Report

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** Production / Staging
**Duration:** XX minutes

### Tests Completed
- [ ] Scenario 1: Paid user manages subscription
- [ ] Scenario 2: Paid user cancels subscription
- [ ] Scenario 3: Free user attempts to manage
- [ ] Scenario 4: Header tier badge click
- [ ] Scenario 5: View billing history
- [ ] Scenario 6: Update payment method
- [ ] Scenario 7: Reactivate cancelled subscription

### Issues Found
1. [Description]
   - Severity: Critical / High / Medium / Low
   - Steps to reproduce:
   - Expected:
   - Actual:

### Notes
[Any additional observations]

### Recommendation
✅ Ready for production
⚠️ Needs fixes before launch
❌ Major issues, do not launch
```

---

**Ready to test!** Follow this guide step-by-step for comprehensive validation.
