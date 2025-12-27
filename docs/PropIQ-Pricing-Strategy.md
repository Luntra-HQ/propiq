# PropIQ Pricing Strategy Document

**Last Updated:** December 17, 2025
**Owner:** Brian Dusape (bdusape@luntra.one)
**Status:** Active - Implementation Phase

---

## Executive Summary

This document defines PropIQ's pricing structure, ensuring consistency across the website, Stripe billing, and all marketing materials. Strategy is based on SaaS Playbook principles for low-touch, low-ACV SaaS products.

---

## Final Pricing Structure

| Tier | Price/Month | Annual Value | Analyses/Month | Target Customer Segment |
|------|-------------|--------------|----------------|------------------------|
| **Free** | $0 | $0 | 3 | Trial users, tire-kickers, initial validation |
| **Starter** | $49 | $588 | 30 | New investors analyzing 1-2 properties/week |
| **Pro** ⭐ | $99 | $1,188 | 100 | Active investors analyzing 3+ properties/day |
| **Elite** | $199 | $2,388 | Unlimited | Power users, small teams, high-volume analysts |

**⭐ Most Popular:** Pro tier should be marked as "Most Popular" on the website.

---

## Detailed Tier Breakdown

### Free Tier
- **Price:** $0/month
- **Analyses:** 3 per month
- **Purpose:** Lead generation, product validation, conversion to paid
- **Target:**
  - First-time real estate investors
  - Users evaluating PropIQ
  - Budget-conscious learners
- **Positioning:** "Try before you buy - perfect for your first 3 deals"
- **Stripe Product:** Need to create (see Implementation section)

### Starter Tier
- **Price:** $49/month ($588/year)
- **Analyses:** 30 per month (~1 per day)
- **Purpose:** Entry-level paid tier, captures budget-conscious users
- **Target:**
  - New investors testing 5-10 deals/week
  - Side hustlers building portfolios
  - Users learning real estate investing
- **Positioning:** "Perfect for newer investors evaluating 1-2 properties weekly"
- **Stripe Product ID:** `prod_THeIiOuBLI4aC1`
- **Metadata:**
  - `tier`: "starter"
  - `analyses_limit`: "30"
- **Price ID:** *To be created in Stripe Dashboard*

### Pro Tier ⭐ (Most Popular)
- **Price:** $99/month ($1,188/year)
- **Analyses:** 100 per month (~3+ per day)
- **Purpose:** Primary revenue driver, best value proposition
- **Target:**
  - Active investors evaluating 2-3+ properties/day
  - Serious real estate professionals
  - Users with established deal flow
- **Positioning:** "Perfect for active investors analyzing multiple deals daily"
- **Stripe Product ID:** `prod_THeJ5ANavi2KMa`
- **Metadata:**
  - `tier`: "pro"
  - `analyses_limit`: "100" *(Update from 60)*
- **Price ID:** *To be created in Stripe Dashboard*

### Elite Tier
- **Price:** $199/month ($2,388/year)
- **Analyses:** Unlimited
- **Purpose:** Premium offering, captures high-value users
- **Target:**
  - Power users analyzing 10+ properties/day
  - Small investment teams (2-3 people)
  - Real estate wholesalers
  - Professional deal finders
- **Positioning:** "Unlimited analyses for power users and small teams"
- **Stripe Product ID:** `prod_THeKnZH9oB3Vov`
- **Metadata:**
  - `tier`: "elite"
  - `analyses_limit`: "unlimited" *(Update from 100)*
- **Price ID:** *To be created in Stripe Dashboard*

---

## Pricing Psychology & Strategy

### Why This Structure Works

1. **Clear Value Ladder:** Each tier offers ~2x value of previous tier
2. **Price Anchoring:** Elite at $199 makes Pro at $99 look like great value
3. **Most Popular Positioning:** Pro tier is sweet spot for conversions
4. **Low Barrier to Entry:** $49 Starter reduces friction vs $79
5. **Unlimited Tier:** Elite's unlimited analyses justify premium price

### Pricing Rationale (from SaaS Playbook)

**ACV Analysis:**
- Starter: $588 ACV (Low ACV)
- Pro: $1,188 ACV (Low ACV)
- Elite: $2,388 ACV (Low-Medium ACV)

**Marketing Strategy for Low ACV Products:**
- Content marketing (moderately fast, scalable)
- SEO (slow, scalable)
- Other peoples' audiences (fast, less scalable)
- Launch sites (fast, less scalable)
- Low-touch sales funnel: Website → Trial → Purchase

---

## Implementation Checklist

### Phase 1: Stripe Configuration ✅ IN PROGRESS

- [ ] **Update PropIQ Starter Product** (`prod_THeIiOuBLI4aC1`)
  - [ ] Verify metadata: `analyses_limit: "30"`, `tier: "starter"`
  - [ ] Create price: $49.00/month
  - [ ] Set as default price

- [ ] **Update PropIQ Pro Product** (`prod_THeJ5ANavi2KMa`)
  - [ ] Update metadata: `analyses_limit` from "60" to "100"
  - [ ] Create price: $99.00/month
  - [ ] Set as default price

- [ ] **Update PropIQ Elite Product** (`prod_THeKnZH9oB3Vov`)
  - [ ] Update metadata: `analyses_limit` from "100" to "unlimited"
  - [ ] Create price: $199.00/month
  - [ ] Set as default price

- [ ] **Create PropIQ Free Product** (if needed)
  - [ ] Name: "PropIQ Free"
  - [ ] Description: "3 analyses per month - Perfect for trying PropIQ"
  - [ ] Metadata: `analyses_limit: "3"`, `tier: "free"`
  - [ ] No price needed (handled in app logic)

### Phase 2: Website Updates

- [ ] Update pricing page at `frontend/src/pages/LandingPage.tsx`
  - [ ] Change "Free" to show 3 analyses
  - [ ] Add "Starter" tier: $49/mo, 30 analyses
  - [ ] Update "Pro" tier: $99/mo, 100 analyses, mark as "Most Popular"
  - [ ] Update "Elite" tier: $199/mo, Unlimited analyses

- [ ] Update pricing copy and CTAs
  - [ ] Free: "Get Started Free"
  - [ ] Starter: "Choose Starter"
  - [ ] Pro: "Get Started" (with "Most Popular" badge)
  - [ ] Elite: "Choose Elite"

- [ ] Ensure Stripe checkout links use correct Price IDs

### Phase 3: Documentation & Marketing

- [ ] Update marketing materials with new pricing
- [ ] Create pricing FAQ if needed
- [ ] Update any sales decks or pitch materials
- [ ] Document Price IDs in this file once created

---

## Stripe Product & Price IDs Reference

### Products (Live Mode)

| Tier | Product ID | Current Status |
|------|-----------|----------------|
| Free | *To be created* | ⚠️ Not created yet |
| Starter | `prod_THeIiOuBLI4aC1` | ✅ Exists, needs price |
| Pro | `prod_THeJ5ANavi2KMa` | ✅ Exists, needs metadata update & price |
| Elite | `prod_THeKnZH9oB3Vov` | ✅ Exists, needs metadata update & price |

### Price IDs (To be filled after creation)

| Tier | Price ID | Monthly Price | Status |
|------|----------|---------------|--------|
| Free | N/A | $0 | ⏳ Pending |
| Starter | `price_XXXXX` | $49 | ⏳ Pending creation |
| Pro | `price_XXXXX` | $99 | ⏳ Pending creation |
| Elite | `price_XXXXX` | $199 | ⏳ Pending creation |

**Action Required:** After creating prices in Stripe Dashboard, update this table with actual Price IDs.

---

## Marketing Positioning by Tier

### Free Tier Messaging
- **Headline:** "Try PropIQ Free"
- **Subheadline:** "Analyze your first 3 properties with no credit card required"
- **CTA:** "Start Free"
- **Use Cases:**
  - "Testing your first rental property deal"
  - "Learning real estate analysis fundamentals"
  - "Evaluating PropIQ's features"

### Starter Tier Messaging
- **Headline:** "Perfect for New Investors"
- **Subheadline:** "30 analyses per month - evaluate 1-2 properties weekly"
- **CTA:** "Start with Starter"
- **Use Cases:**
  - "Building your first rental portfolio"
  - "Analyzing weekend property tours"
  - "Side hustle investing"

### Pro Tier Messaging ⭐
- **Headline:** "Most Popular - For Active Investors"
- **Subheadline:** "100 analyses per month - analyze multiple deals daily"
- **CTA:** "Get Started"
- **Badge:** "MOST POPULAR" or "BEST VALUE"
- **Use Cases:**
  - "Reviewing daily MLS listings"
  - "Active deal sourcing and wholesaling"
  - "Building a serious portfolio"

### Elite Tier Messaging
- **Headline:** "Unlimited for Power Users"
- **Subheadline:** "Unlimited analyses for high-volume professionals"
- **CTA:** "Go Elite"
- **Use Cases:**
  - "Real estate teams and small firms"
  - "Wholesalers analyzing 10+ deals/day"
  - "Property scouts and bird dogs"

---

## Recommended Marketing Channels (from SaaS Playbook)

For PropIQ's price points ($49-$199/mo = Low ACV), prioritize:

### Primary Channels (High Priority)
1. **Content Marketing** - Moderately fast, scalable
   - Blog posts on real estate analysis
   - Property investment guides
   - Cash flow calculation tutorials
   - Cap rate explainers

2. **SEO** - Slow but scalable
   - Target: "rental property calculator"
   - Target: "real estate investment analysis"
   - Target: "cash flow calculator real estate"

3. **Other Peoples' Audiences** - Fast, less scalable
   - Real estate podcasts
   - Investor forums (BiggerPockets)
   - Real estate Facebook groups
   - YouTube real estate channels

4. **Launch Sites** - Fast, less scalable
   - Product Hunt
   - Indie Hackers
   - Reddit (r/realestateinvesting)

### Secondary Channels
5. **Affiliate Marketing** (founder-managed initially)
6. **Partnerships** with real estate educators
7. **Free Tools** - Interactive calculators on landing page

---

## Competitive Analysis Notes

*Space for tracking competitor pricing:*
- Competitor 1: [Price] - [Features]
- Competitor 2: [Price] - [Features]
- Competitor 3: [Price] - [Features]

---

## Future Pricing Considerations

### Annual Plans (Phase 2)
Consider adding annual plans with discount:
- Starter: $490/year (save $98 = 2 months free)
- Pro: $990/year (save $198 = 2 months free)
- Elite: $1,990/year (save $398 = 2 months free)

### Enterprise Tier (Phase 3)
When ready for larger teams:
- **Price:** Custom pricing (starting ~$499+/month)
- **Features:**
  - Unlimited team members
  - API access
  - Custom integrations
  - Priority support
  - Dedicated account manager

### Variable Pricing (Future)
As mentioned, ability to charge different prices to different customer segments:
- Geographic pricing
- Use-case based pricing
- Grandfathered pricing for early adopters

---

## Metrics to Track

### Key SaaS Metrics (from Playbook)

1. **Gross Revenue Churn**
   - Target: < 5% (Good), < 2% (Great)
   - Formula: Canceled MRR / MRR at start of month

2. **MRR by Tier**
   - Track which tiers drive most revenue
   - Monitor tier upgrade/downgrade patterns

3. **Conversion Rates**
   - Free → Starter
   - Free → Pro
   - Free → Elite
   - Starter → Pro
   - Pro → Elite

4. **Customer Acquisition Cost (CAC) by Channel**
5. **Lifetime Value (LTV) by Tier**
6. **LTV:CAC Ratio** (Target: 3:1 or better)

---

## Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-17 | 1.0 | Initial pricing strategy document | Claude Code + Brian Dusape |

---

## Questions & Decisions Log

### Resolved
- ✅ 4-tier structure (Free/Starter/Pro/Elite)
- ✅ Analysis limits (3/30/100/unlimited)
- ✅ Price points ($0/$49/$99/$199)

### Open Questions
- [ ] Should we offer annual plans at launch?
- [ ] Do we need team/multi-user pricing?
- [ ] Should Free tier have time limit (e.g., 14-day trial)?

---

## Contact & Support

**Questions about pricing strategy:**
- Email: bdusape@luntra.one
- Stripe Account: acct_1RdHuvJogOchEFxv
- Dashboard: https://dashboard.stripe.com/products

**Related Documentation:**
- Website: https://propiq.luntra.one
- SaaS Playbook: /Users/briandusape/Downloads/THE SAAS PLAYBOOK.pdf
- Stripe Price IDs: (Update after creation)

---

**End of Document**
