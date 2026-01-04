# PropIQ Service Subscriptions Tracker

**Created:** December 30, 2025
**Purpose:** Track all service subscriptions, trial periods, and renewal dates

---

## 📋 Service Inventory

### 🔴 Critical Services (Active Subscriptions)

| Service | Tier/Plan | Cost | Renewal | End Date | Cancel By | Status |
|---------|-----------|------|---------|----------|-----------|--------|
| **Stripe** | Startup Benefits | Free → Paid | Monthly | TBD | Check dashboard | ✅ Active |
| **Intercom** | Startup Program | Free | Ends | **Oct 28, 2026** | **Oct 21, 2026** | ⏰ **REMINDER SET** |
| **Supabase** | Free Tier | $0 | - | - | - | ✅ Active |
| **Azure OpenAI** | Pay-as-you-go | Variable | Monthly | - | Monitor usage | ✅ Active |
| **MongoDB Atlas** | Shared Tier | $0 | - | - | - | ✅ Active |
| **SendGrid** | Free Tier | $0 (100/day) | - | - | Monitor limit | ✅ Active |
| **Convex** | Free Tier | $0 | - | - | - | ✅ Active |

### 🟡 Supporting Services

| Service | Tier/Plan | Cost | Notes | Status |
|---------|-----------|------|-------|--------|
| **Weights & Biases** | Free Tier | $0 | Analytics tracking | ✅ Active |
| **Sentry** | Free Tier | $0 | Error tracking | ✅ Active |
| **Microsoft Clarity** | Free | $0 | User analytics | ✅ Active |
| **Slack** | Free | $0 | Team notifications | ✅ Active |
| **GitHub** | Free/Pro | $0-4/mo | Code repository | ✅ Active |

### 🟢 Potential Startup Programs

| Program | Credits Available | Application Status | Deadline | Notes |
|---------|------------------|-------------------|----------|-------|
| **Google for Startups** | $2,000-100,000 | Not applied | - | Cloud + Ads credits |
| **Microsoft for Startups** | $1,000-150,000 | Not applied | - | Azure credits |
| **Y Combinator Startup School** | Various perks | Not applied | - | Free to join |
| **AWS Activate** | $1,000-100,000 | Not applied | - | AWS credits |

---

## ⏰ Critical Dates & Reminders

### Immediate Action Required

| Date | Action | Service | Reminder Set |
|------|--------|---------|--------------|
| **Oct 21, 2026** | ⚠️ **Cancel Intercom** (7 days before renewal) | Intercom | ✅ Cal invite sent |
| **Oct 28, 2026** | 🔴 **Intercom renews** (avoid charge) | Intercom | ✅ Cal invite sent |

### Quarterly Reviews

| Date | Action | Purpose |
|------|--------|---------|
| **March 31, 2026** | Review all free tiers | Check if usage approaching limits |
| **June 30, 2026** | Review subscriptions | Cancel unused services |
| **September 30, 2026** | Review subscriptions | Optimize costs |
| **December 31, 2026** | Annual review | Plan 2027 budget |

---

## 📊 Service Details

### 1. Stripe (Payment Processing)

**Current Status:**
- Plan: Production account
- Cost: 2.9% + $0.30 per transaction
- Startup benefits: May have received reduced fees or credits
- Dashboard: https://dashboard.stripe.com

**Action Items:**
- [ ] Check if any startup credits/benefits expire
- [ ] Review transaction fees annually
- [ ] Consider volume pricing when revenue > $10k/month

**Monitoring:**
- Monthly revenue reports
- Transaction fee analysis
- Fraud detection settings

---

### 2. Intercom (Customer Messaging)

**CRITICAL - Service Ends Soon!**

**Current Status:**
- Plan: Startup program (likely free/discounted)
- End Date: **October 28, 2026**
- Dashboard: https://app.intercom.com
- Cost if renewed: ~$74/month (Starter plan)
- Annual cost if renewed: ~$888/year

**Decision Points:**

**Option A: Cancel (Recommended - Save $888/year)**
- ✅ You already have custom AI support chat built
- ✅ Saves $888/year
- ✅ No vendor lock-in
- ⚠️ Need to remove Intercom integration from codebase

**Option B: Keep Intercom**
- ✅ Professional support platform
- ✅ Advanced features (user profiles, campaigns)
- ❌ $888/year cost
- ❌ Duplicate of existing custom chat

**Recommendation: Cancel before Oct 28, 2026**

**Cancellation Checklist:**
- [ ] **Oct 1, 2026**: Verify custom support chat is working perfectly
- [ ] **Oct 15, 2026**: Export all Intercom data (conversations, user profiles)
- [ ] **Oct 21, 2026**: **Cancel Intercom subscription**
- [ ] **Oct 22, 2026**: Remove Intercom code from frontend
- [ ] **Oct 23, 2026**: Remove Intercom router from backend
- [ ] **Oct 24, 2026**: Update documentation
- [ ] **Oct 28, 2026**: Verify no charge processed
- [ ] **Nov 1, 2026**: Delete Intercom API keys

**Files to Update When Canceling:**
```bash
# Backend files
backend/routers/intercom.py
backend/.env (remove INTERCOM keys)

# Documentation
backend/INTERCOM_*.md

# Check for frontend integration
grep -r "intercom" frontend/
```

---

### 3. Supabase (Database)

**Current Status:**
- Plan: Free Tier
- Limits: 500 MB database, 2 GB bandwidth/month
- Cost if exceeded: $25/month (Pro tier)
- Dashboard: https://supabase.com/dashboard

**Monitoring:**
- Check database size monthly
- Track API requests
- Monitor bandwidth usage

**Upgrade Triggers:**
- Database > 400 MB (80% of limit)
- Bandwidth > 1.6 GB/month
- Need for additional features (Point-in-time recovery)

---

### 4. Azure OpenAI (AI Service)

**Current Status:**
- Plan: Pay-as-you-go
- Model: GPT-4o-mini
- Estimated cost: ~$10-50/month (depends on usage)
- Dashboard: https://portal.azure.com

**Cost Optimization:**
- Use gpt-4o-mini (cheapest model)
- Cache common responses
- Implement rate limiting
- Monitor token usage

**Budget Alerts:**
- Set alert at $100/month
- Review usage weekly
- Optimize prompts to reduce tokens

---

### 5. MongoDB Atlas (Legacy Database)

**Current Status:**
- Plan: Shared Tier (M0)
- Cost: Free
- Limits: 512 MB storage
- Dashboard: https://cloud.mongodb.com

**Note:** You're migrating to Supabase. Plan to deprecate MongoDB:
- [ ] Complete data migration to Supabase
- [ ] Update all queries to use Supabase
- [ ] Test thoroughly
- [ ] Archive MongoDB data
- [ ] **Delete MongoDB cluster** (save $0, reduce complexity)

---

### 6. SendGrid (Email Service)

**Current Status:**
- Plan: Free Tier
- Limits: 100 emails/day
- Cost if exceeded: $19.95/month (Essentials - 50k emails/month)
- Dashboard: https://app.sendgrid.com

**Monitoring:**
- Track daily email volume
- Current usage: ~10-20 emails/day (well within limit)
- Upgrade trigger: >80 emails/day consistently

**Alternatives if needed:**
- **Resend**: 3,000 emails/month free
- **AWS SES**: $0.10 per 1,000 emails
- **Postmark**: 100 emails/month free

---

### 7. Convex (Backend Database)

**Current Status:**
- Plan: Free Tier
- Limits: 1 GB storage, 1M function calls/month
- Cost if exceeded: Starting at $25/month
- Dashboard: https://dashboard.convex.dev

**Monitoring:**
- Storage usage
- Function call volume
- Database performance

**Growth Plan:**
- Free tier should support 100-500 users
- Upgrade when hitting limits
- Consider caching to reduce function calls

---

## 💰 Monthly Cost Breakdown

### Current Monthly Costs

| Service | Current Cost | If Exceeded Free Tier | Notes |
|---------|--------------|----------------------|-------|
| Stripe | 2.9% + $0.30/txn | Variable (revenue-based) | Scales with revenue |
| **Intercom** | **$0 → $74** | **Renews Oct 28, 2026** | **⚠️ CANCEL TO SAVE $888/year** |
| Supabase | $0 | $25/month | Free tier sufficient |
| Azure OpenAI | $10-50/month | Variable | Usage-based |
| MongoDB | $0 | - | Plan to deprecate |
| SendGrid | $0 | $19.95/month | Far from limit |
| Convex | $0 | $25/month | Within limits |
| W&B | $0 | $50/month | Analytics only |
| Sentry | $0 | $29/month | Error tracking |
| **TOTAL** | **~$10-50/month** | **~$200/month** | **If all exceeded + Intercom** |

**Cost Optimization Opportunities:**
1. **Cancel Intercom before Oct 28, 2026** → Save $888/year
2. **Deprecate MongoDB** → Reduce complexity
3. **Optimize Azure OpenAI usage** → Cache responses, reduce tokens
4. **Stay within free tiers** → Monitor usage dashboards

---

## 📅 Cancellation Reminders Calendar

### 2026 Service Review Calendar

| Date | Event | Action |
|------|-------|--------|
| **Jan 15, 2026** | Q1 Service Review | Review usage, check approaching limits |
| **Apr 15, 2026** | Q2 Service Review | Review subscriptions, cancel unused |
| **Jul 15, 2026** | Q3 Service Review | Review costs, optimize |
| **Oct 1, 2026** | **Intercom Pre-Cancel Check** | Verify custom chat working |
| **Oct 15, 2026** | **Export Intercom Data** | Download all conversations |
| **Oct 21, 2026** | **⚠️ CANCEL INTERCOM** | Cancel 7 days before renewal |
| **Oct 28, 2026** | **Intercom Renewal Date** | Verify cancellation processed |
| **Nov 1, 2026** | **Remove Intercom Code** | Clean up codebase |

---

## 🎯 Decision Framework

### When to Upgrade from Free Tier

**Upgrade if:**
- ✅ Consistently hitting 80% of free tier limits
- ✅ Need advanced features not in free tier
- ✅ Revenue supports the cost (ROI positive)
- ✅ Service is critical to business operations

**Don't upgrade if:**
- ❌ Usage is sporadic or inconsistent
- ❌ Alternative free service available
- ❌ Can optimize to stay within free tier
- ❌ Service not essential to core product

### When to Cancel a Service

**Cancel if:**
- ✅ Haven't used in 30+ days
- ✅ Duplicate of another service you're using
- ✅ Cost > value provided
- ✅ Free alternative available
- ✅ Feature can be built in-house (like Intercom)

**Example: Intercom**
- ✅ You have custom AI support chat (duplicate)
- ✅ Cost = $888/year
- ✅ Value = Can build same features for free
- **Decision: CANCEL**

---

## 🔄 Quarterly Review Checklist

Run this every 3 months:

### Service Usage Review
- [ ] Check Supabase database size (keep < 400 MB)
- [ ] Check SendGrid daily email volume (keep < 80/day)
- [ ] Check Convex function calls (keep < 800k/month)
- [ ] Check Azure OpenAI spending (keep < budget)
- [ ] Review Stripe transaction fees

### Cost Optimization
- [ ] Identify services not used in 30+ days
- [ ] Check for duplicate services
- [ ] Review if built-in features can replace paid services
- [ ] Optimize API usage to stay in free tiers

### Upcoming Renewals
- [ ] List services renewing in next 90 days
- [ ] Decide: Keep, Cancel, or Downgrade
- [ ] Set reminders for cancellation deadlines
- [ ] Export data before canceling

---

## 📝 Service Cancellation Template

When canceling a service:

### 1. Pre-Cancellation (7-14 days before)
- [ ] Verify alternative solution is working
- [ ] Export all data from service
- [ ] Update documentation
- [ ] Notify team

### 2. Cancellation Day
- [ ] Cancel subscription
- [ ] Screenshot confirmation
- [ ] Remove API keys from .env
- [ ] Remove service code from codebase

### 3. Post-Cancellation (Within 7 days)
- [ ] Verify no charge processed
- [ ] Remove from tracking spreadsheet
- [ ] Update budget forecasts
- [ ] Archive exported data

---

## 🚨 Emergency Contacts

If you need to cancel or modify a subscription quickly:

| Service | Support | Cancellation Method |
|---------|---------|-------------------|
| Stripe | https://support.stripe.com | Dashboard → Settings → Close Account |
| Intercom | https://www.intercom.com/help | Settings → Subscription → Cancel |
| Supabase | https://supabase.com/dashboard/support | Dashboard → Settings → Delete Project |
| Azure | https://portal.azure.com | Portal → Subscriptions → Cancel |
| MongoDB | https://www.mongodb.com/contact | Dashboard → Project Settings → Terminate |
| SendGrid | https://app.sendgrid.com/settings/billing | Settings → Billing → Cancel Plan |

---

## 💡 Cost-Saving Tips

### 1. Maximize Free Tiers
- Stay under limits with caching
- Implement rate limiting
- Monitor usage dashboards weekly

### 2. Startup Programs
- Apply for Google for Startups ($2k-100k credits)
- Apply for Microsoft for Startups ($1k-150k credits)
- Join Y Combinator Startup School (free perks)

### 3. Annual vs Monthly
- Pay annually when possible (usually 15-20% discount)
- But only if confident you'll use for full year

### 4. Alternative Services
- Research cheaper alternatives before upgrading
- Open source options when possible
- Build in-house if simple (like you did with support chat!)

---

## 📊 Service Health Dashboard

Track these metrics monthly:

| Service | Metric to Track | Current | Limit | % Used |
|---------|----------------|---------|-------|--------|
| Supabase | Database size | TBD | 500 MB | TBD% |
| SendGrid | Emails/day | ~15 | 100 | 15% |
| Convex | Function calls/month | TBD | 1M | TBD% |
| Azure OpenAI | Monthly spend | TBD | $100 | TBD% |

**Update this table monthly!**

---

## 🎯 2026 Goals

### Cost Targets
- [ ] Keep monthly costs < $100
- [ ] Stay in free tiers where possible
- [ ] Cancel Intercom (save $888/year)
- [ ] Deprecate MongoDB (simplify stack)

### Optimization Targets
- [ ] Reduce Azure OpenAI costs 20% through caching
- [ ] Stay under SendGrid free tier (100/day)
- [ ] Optimize Convex function calls

### Revenue Targets
- [ ] $1,000 MRR → Can afford Pro tiers
- [ ] $5,000 MRR → Upgrade to scale
- [ ] $10,000 MRR → Premium services justified

---

**Last Updated:** December 30, 2025
**Next Review:** March 31, 2026
**Critical Reminder:** **Cancel Intercom by Oct 21, 2026** 🚨
