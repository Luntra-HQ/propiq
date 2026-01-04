# 🎯 Promo Code Integration Test Guide

## Quick Test Checklist

### ✅ Visual Tests (Manual - 5 minutes)

**Test 1: Promo Code Input Appears**
1. Navigate to: http://localhost:5173/pricing
2. **Expected:** Purple gradient promo code box appears above pricing cards
3. **Expected:** Input field with placeholder "Enter code (e.g., PRODUCTHUNT)"
4. ✓ PASS / ✗ FAIL: _______

**Test 2: Manual Promo Code Entry**
1. Type "producthunt" in the promo code field
2. **Expected:** Auto-converts to "PRODUCTHUNT" (uppercase)
3. **Expected:** Confirmation message appears: "✓ Code PRODUCTHUNT will be applied at checkout"
4. ✓ PASS / ✗ FAIL: _______

**Test 3: URL Parameter Auto-Fill**
1. Navigate to: http://localhost:5173/pricing?promo=PRODUCTHUNT
2. **Expected:** Promo code field is pre-filled with "PRODUCTHUNT"
3. **Expected:** Confirmation message already showing
4. ✓ PASS / ✗ FAIL: _______

**Test 4: Checkout Integration**
1. Login to your test account
2. Enter promo code "PRODUCTHUNT"
3. Click "Choose Pro" (or any tier)
4. **Expected:** Browser console shows: `[PRICING] Applying promo code: PRODUCTHUNT`
5. **Expected:** Redirects to Stripe checkout
6. **Expected:** Discount is applied on Stripe checkout page
7. ✓ PASS / ✗ FAIL: _______

**Test 5: Product Hunt Landing Flow**
1. Visit: http://localhost:5173/pricing?promo=PRODUCTHUNT
2. Click "Choose Pro"
3. If not logged in: Sign up → Redirected to checkout
4. **Expected:** Promo code persists through signup flow
5. **Expected:** Checkout shows 50% discount for 3 months
6. ✓ PASS / ✗ FAIL: _______

---

## 🔍 Console Testing

Open browser DevTools Console and check for these logs:

```javascript
// When visiting /pricing?promo=PRODUCTHUNT
[PRICING] Promo code detected from URL: PRODUCTHUNT

// When clicking upgrade with promo code
[PRICING] Creating Stripe checkout session...
[PRICING] Applying promo code: PRODUCTHUNT
[PRICING] Redirecting to Stripe checkout: cs_test_...
```

---

## 🔧 Backend Testing (Convex Console)

1. Go to: https://dashboard.convex.dev
2. Open your PropIQ project
3. Navigate to Logs
4. Trigger a checkout with promo code
5. **Expected log:** `[STRIPE] Applying promotion code: PRODUCTHUNT`

---

## 🎨 UI/UX Verification

### Promo Code Widget Design
- [ ] Purple gradient background (violet-800 to purple-800)
- [ ] Tag icon next to heading
- [ ] Rounded corners (rounded-lg)
- [ ] Input has violet border (border-violet-600)
- [ ] Focus state changes border color (border-violet-400)
- [ ] Confirmation text is violet-200
- [ ] Bold promo code in confirmation message
- [ ] Mobile responsive (full width on small screens)

### Accessibility
- [ ] Input has proper placeholder text
- [ ] Keyboard navigation works (Tab to focus)
- [ ] Clear visual feedback when typing
- [ ] High contrast text for readability

---

## 🚀 Product Hunt Launch Checklist

### Pre-Launch Setup
- [ ] Create live Stripe coupon `PRODUCTHUNT` (50% off, 3 months)
- [ ] Create live promotion code `PRODUCTHUNT` (max 100 uses)
- [ ] Test checkout in live mode with real payment method
- [ ] Verify discount appears correctly on Stripe checkout

### Launch Day URLs
```
Main Product Hunt Link:
https://propiq.com/pricing?promo=PRODUCTHUNT

Share on Twitter/X:
"🎉 We're on Product Hunt! Get 50% off PropIQ for 3 months with code PRODUCTHUNT
https://propiq.com/pricing?promo=PRODUCTHUNT"

Email Template:
"Thanks for checking us out on Product Hunt! Use code PRODUCTHUNT for 50% off your first 3 months."
```

### Monitoring During Launch
- [ ] Check Stripe Dashboard → Promotion Codes → PRODUCTHUNT
- [ ] Monitor redemptions (updates real-time)
- [ ] Watch for checkout errors in Convex logs
- [ ] Check customer emails are getting receipts

---

## 🐛 Troubleshooting

### Issue: Promo code not appearing at Stripe checkout

**Solution 1:** Check Convex logs for errors
```bash
# Look for this log
[STRIPE] Applying promotion code: PRODUCTHUNT
```

**Solution 2:** Verify promotion code exists in Stripe
- Dashboard → Promotion Codes → Search "PRODUCTHUNT"
- Status must be "Active"
- Not expired or used up

**Solution 3:** Check environment variables
```bash
# Ensure STRIPE_SECRET_KEY is set in Convex
# Go to Convex Dashboard → Settings → Environment Variables
```

### Issue: Discount not applying correctly

**Cause:** Promotion code ID mismatch
**Fix:** Ensure Stripe promotion code is named exactly "PRODUCTHUNT" (case-sensitive)

### Issue: Promo code field not showing on pricing page

**Cause:** Missing props in PricingPage component
**Fix:** Verify PricingPageWrapper passes `promoCode` and `onPromoCodeChange`

---

## 🔐 Secure Key Handoff (If Needed)

If I need your Stripe secret key for testing:

**Option 1: Environment Variable (Recommended)**
```bash
# Set it temporarily in your shell
export STRIPE_SECRET_KEY="sk_live_your_key_here"

# I can read it with:
echo $STRIPE_SECRET_KEY
```

**Option 2: Secure File (Recommended)**
```bash
# Create a secure file outside git
echo "sk_live_your_key_here" > /tmp/stripe_key.txt
chmod 600 /tmp/stripe_key.txt

# I can read it with:
cat /tmp/stripe_key.txt

# Delete after use:
rm /tmp/stripe_key.txt
```

**Option 3: Convex Environment Variables**
```bash
# Set it in Convex Dashboard
# I can test using npx convex dev which reads from .env.local
```

**❌ NEVER paste keys directly in chat!**

---

## 📊 Success Metrics

Track these during Product Hunt launch:

1. **Redemption Rate**
   - Goal: 30%+ of Product Hunt visitors use code
   - Monitor: Stripe Dashboard → Promotion Codes

2. **Conversion Rate**
   - Goal: 15%+ of code users complete checkout
   - Monitor: Stripe Dashboard → Payments

3. **Customer Feedback**
   - Look for: "easy checkout", "great discount"
   - Monitor: Support chat, Twitter mentions

---

## ✅ Test Results Summary

Fill this out after testing:

| Test | Status | Notes |
|------|--------|-------|
| Promo input appears | ☐ PASS ☐ FAIL | |
| Manual entry works | ☐ PASS ☐ FAIL | |
| URL parameter works | ☐ PASS ☐ FAIL | |
| Checkout integration | ☐ PASS ☐ FAIL | |
| Full user flow | ☐ PASS ☐ FAIL | |
| Console logs correct | ☐ PASS ☐ FAIL | |
| UI/UX polished | ☐ PASS ☐ FAIL | |

**Tester:** ___________________
**Date:** ___________________
**Environment:** ☐ Local ☐ Test ☐ Live

---

## 🎉 Launch Day Script

**1 Hour Before Launch:**
- [ ] Deploy latest code to production
- [ ] Verify live Stripe coupon is active
- [ ] Test checkout in incognito window
- [ ] Prepare social media posts
- [ ] Alert team in Slack

**During Launch:**
- [ ] Monitor Stripe Dashboard (refresh every 5 min)
- [ ] Watch Convex logs for errors
- [ ] Respond to Product Hunt comments
- [ ] Share on Twitter/LinkedIn

**Post-Launch (Next Day):**
- [ ] Check total redemptions
- [ ] Review conversion rate
- [ ] Send thank you email to new customers
- [ ] Analyze what worked/didn't work

---

**Last Updated:** 2026-01-02
**Integration Status:** ✅ Complete and ready for testing
