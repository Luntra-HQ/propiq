# Stripe Pricing Setup Commands

**Date**: January 4, 2026
**Model**: Usage-Based Pricing (Option 1)
**Goal**: Ensure 100% parity between frontend pricing and Stripe checkout

---

## ⚠️ IMPORTANT: Use Full Access API Key

The current restricted key (`rk_live_...`) cannot create prices. You need to:

1. Go to: https://dashboard.stripe.com/apikeys
2. Create a new **Secret key** (not restricted)
3. Set it temporarily: `export STRIPE_API_KEY="sk_live_..."`
4. Run the commands below
5. Delete the secret key after setup

---

## 📋 Existing Products (Live Mode)

✅ Already created:
- **prod_THeIiOuBLI4aC1** - PropIQ Starter (30 analyses metadata)
- **prod_THeJ5ANavi2KMa** - PropIQ Pro (60 analyses metadata)
- **prod_THeKnZH9oB3Vov** - PropIQ Elite (100 analyses metadata)

---

## 🎯 Required Prices (New Usage-Based Model)

### 1. Starter: $29/month (20 analyses)

```bash
stripe prices create \
  -d product=prod_THeIiOuBLI4aC1 \
  -d unit_amount=2900 \
  -d currency=usd \
  -d "recurring[interval]"=month \
  -d nickname="PropIQ Starter - \$29/month (20 analyses)" \
  -d "metadata[tier]"=starter \
  -d "metadata[analyses_limit]"=20 \
  --live
```

**Expected Output:**
```json
{
  "id": "price_XXXXXXXXXXXXXX",
  "object": "price",
  "active": true,
  "unit_amount": 2900,
  ...
}
```

**Action**: Copy the `"id"` field and update `src/config/pricing.ts` line 30:
```typescript
starter: 'price_XXXXXXXXXXXXXX', // Replace with actual price ID
```

---

### 2. Pro: $79/month (100 analyses)

```bash
stripe prices create \
  -d product=prod_THeJ5ANavi2KMa \
  -d unit_amount=7900 \
  -d currency=usd \
  -d "recurring[interval]"=month \
  -d nickname="PropIQ Pro - \$79/month (100 analyses)" \
  -d "metadata[tier]"=pro \
  -d "metadata[analyses_limit]"=100 \
  --live
```

**Action**: Copy the `"id"` field and update `src/config/pricing.ts` line 31:
```typescript
pro: 'price_XXXXXXXXXXXXXX', // Replace with actual price ID
```

---

### 3. Elite: $199/month (300 analyses)

First, update the product metadata to reflect 300 analyses:

```bash
stripe products update prod_THeKnZH9oB3Vov \
  -d description="300 Prop IQ analyses per month - Perfect for power users, teams, and real estate agents" \
  -d "metadata[analyses_limit]"=300 \
  --live
```

Then create the price:

```bash
stripe prices create \
  -d product=prod_THeKnZH9oB3Vov \
  -d unit_amount=19900 \
  -d currency=usd \
  -d "recurring[interval]"=month \
  -d nickname="PropIQ Elite - \$199/month (300 analyses)" \
  -d "metadata[tier]"=elite \
  -d "metadata[analyses_limit]"=300 \
  --live
```

**Action**: Copy the `"id"` field and update `src/config/pricing.ts` line 32:
```typescript
elite: 'price_XXXXXXXXXXXXXX', // Replace with actual price ID
```

---

## 💰 Top-Up Packages (One-Time Purchases)

### Product Setup (if not exists):

```bash
stripe products create \
  -d name="PropIQ Analysis Top-Up" \
  -d description="Additional AI property analyses for when you exceed your monthly limit" \
  -d type=service \
  --live
```

**Save the product ID as: `prod_TOPUP_XXXXXX`**

---

### Top-Up Prices:

#### +10 Analyses - $15

```bash
stripe prices create \
  -d product=prod_TOPUP_XXXXXX \
  -d unit_amount=1500 \
  -d currency=usd \
  -d nickname="PropIQ Top-Up - 10 analyses (\$15)" \
  -d "metadata[runs]"=10 \
  --live
```

#### +25 Analyses - $30

```bash
stripe prices create \
  -d product=prod_TOPUP_XXXXXX \
  -d unit_amount=3000 \
  -d currency=usd \
  -d nickname="PropIQ Top-Up - 25 analyses (\$30)" \
  -d "metadata[runs]"=25 \
  --live
```

#### +50 Analyses - $50

```bash
stripe prices create \
  -d product=prod_TOPUP_XXXXXX \
  -d unit_amount=5000 \
  -d currency=usd \
  -d nickname="PropIQ Top-Up - 50 analyses (\$50)" \
  -d "metadata[runs]"=50 \
  --live
```

---

## 🔄 Update Product Metadata (Recommended)

Ensure product descriptions match new limits:

```bash
# Starter - 20 analyses
stripe products update prod_THeIiOuBLI4aC1 \
  -d description="20 Prop IQ analyses per month - Perfect for new investors testing 5-10 deals/week" \
  -d "metadata[analyses_limit]"=20 \
  --live

# Pro - 100 analyses
stripe products update prod_THeJ5ANavi2KMa \
  -d description="100 Prop IQ analyses per month - Perfect for active investors evaluating 3+ properties/day" \
  -d "metadata[analyses_limit]"=100 \
  --live

# Elite - 300 analyses
stripe products update prod_THeKnZH9oB3Vov \
  -d description="300 Prop IQ analyses per month - Perfect for power users, teams, and real estate agents" \
  -d "metadata[analyses_limit]"=300 \
  --live
```

---

## ✅ Verification Checklist

After creating all prices:

- [ ] Update `src/config/pricing.ts` with actual Stripe price IDs
- [ ] Rebuild frontend: `npm run build`
- [ ] Deploy to production: `netlify deploy --prod --dir=dist`
- [ ] Test checkout flow:
  1. Go to https://propiq.luntra.one/pricing
  2. Click "Get Started" on each tier
  3. Verify correct price shows in Stripe checkout
  4. Cancel without completing payment
- [ ] Verify Stripe Dashboard shows correct prices
- [ ] Archive old unlimited prices (set to inactive)

---

## 📊 Revenue Impact

### Old Model (Unlimited):
- Starter: $49 - UNLIMITED (unsustainable)
- Pro: $99 - UNLIMITED (unsustainable)
- Elite: $199 - UNLIMITED (unsustainable)

### New Model (Usage-Based):
- Starter: $29 - 20 analyses (89.7% margin)
- Pro: $79 - 100 analyses (81% margin)
- Elite: $199 - 300 analyses (77.4% margin)

**Result**: Sustainable margins, predictable COGS, clear upsell path

---

## 🎯 2026 Revenue Targets

With new pricing:

| Quarter | MRR Target | Customers Needed (Mixed) |
|---------|------------|--------------------------|
| Q1 2026 | $2,500     | 76 customers             |
| Q2 2026 | $7,500     | 207 customers            |
| Q3 2026 | $15,000    | 405 customers            |
| Q4 2026 | $30,000    | 685 customers            |

**Conversion assumptions**:
- 70% Starter ($29)
- 25% Pro ($79)
- 5% Elite ($199)

---

## 📞 Support

If you encounter errors creating prices:

1. Check API key permissions: https://dashboard.stripe.com/apikeys
2. Verify product IDs are correct: `stripe products list --live`
3. Check Stripe logs: https://dashboard.stripe.com/logs
4. Contact Stripe support if needed

---

**Last Updated**: January 4, 2026
**Status**: ⏳ Pending price creation in Stripe
