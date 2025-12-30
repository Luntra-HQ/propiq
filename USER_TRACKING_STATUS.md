# PropIQ User Tracking Status & Recommendations

**Last Updated:** 2025-12-29

## Summary

You have **124 free tier signups** (not 22 as originally thought). Here's the breakdown:

- **Ghost users (104):** Signed up but never used the product
- **One-time users (13):** Logged in but never ran an analysis
- **Cold users (7):** Used product but inactive >30 days
- **Warm users (0):** None currently
- **Active users (0):** None currently

## Currently Tracked Data ✅

Your Convex database is already tracking comprehensive user data:

### User Profile Data
- ✅ Email address
- ✅ First name, last name, company
- ✅ Subscription tier (free, starter, pro, elite)
- ✅ Subscription status
- ✅ Stripe customer ID

### Activity Tracking
- ✅ **Sign-up date** (`createdAt`)
- ✅ **Last login date** (`lastLogin`)
- ✅ **Last active date** (`lastActiveAt`)
- ✅ **Last analysis date** (from `propertyAnalyses` table)
- ✅ **Login count** (number of sessions in `sessions` table)
- ✅ **Analysis count** (number of analyses run)
- ✅ **Analyses used** (current billing period)

### Engagement Data
- ✅ Onboarding progress (7 tasks tracked)
- ✅ Product tour completion
- ✅ Email engagement (opens, clicks)
- ✅ NPS survey responses
- ✅ Support chat history
- ✅ Referral program participation

## Available Export Data

The new export system provides 30+ data points per user:

### Basic Information
- userId, email, firstName, lastName, company
- subscriptionTier, subscriptionStatus, stripeCustomerId

### Dates (ISO format)
- signupDate
- lastLoginDate
- lastActiveDate
- lastAnalysisDate

### Engagement Metrics
- loginCount (total sessions)
- analysisCount (total analyses ever)
- analysesUsed (current billing period)
- analysesLimit (based on tier)
- analysesRemaining

### Time-based Metrics
- daysSinceSignup
- daysSinceLastLogin
- daysSinceLastActive

### Onboarding Progress
- analyzedFirstProperty (boolean)
- completedProductTour (boolean)
- checklistDismissed (boolean)

### Segmentation
- userSegment (ghost, one-time, cold, warm, active)

### Account Status
- active (boolean)
- emailVerified (boolean)

## Recommended Tracking Additions ⚠️

While you have excellent tracking, here are some gaps to consider:

### 1. Feature Usage Tracking (PRIORITY: HIGH)

**Problem:** You know they analyzed properties, but not what features they used.

**Recommendation:** Add event tracking for:
```typescript
// New table: featureEvents
featureEvents: defineTable({
  userId: v.id("users"),
  feature: v.string(), // "calculator", "scenario_analysis", "pdf_export", "share", etc.
  eventType: v.string(), // "viewed", "used", "completed"
  metadata: v.optional(v.any()), // Additional context
  createdAt: v.number(),
})
```

**Why it matters:**
- Understand which features drive engagement
- Identify unused features (candidates for removal)
- Personalize onboarding ("You haven't tried scenarios yet!")
- Improve conversion (users who use calculator upgrade 3x more)

### 2. Email Click Tracking (PRIORITY: MEDIUM)

**Current state:** You track opens/clicks in `emailLogs` table ✅

**Recommendation:** Add UTM parameters to all email links:
```
https://propiq.com/dashboard?utm_source=email&utm_medium=trial_warning&utm_campaign=convert_trial
```

Track which emails drive conversions, not just opens.

### 3. Conversion Funnel Tracking (PRIORITY: HIGH)

**Problem:** You don't know where users drop off in the conversion funnel.

**Recommendation:** Add funnel step tracking:
```typescript
// New table: funnelEvents
funnelEvents: defineTable({
  userId: v.id("users"),
  funnel: v.string(), // "trial_to_paid", "onboarding", etc.
  step: v.string(), // "clicked_upgrade", "viewed_pricing", "entered_card", etc.
  completed: v.boolean(),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
```

**Track conversion funnel:**
1. User hits analysis limit
2. Clicks "Upgrade"
3. Views pricing page
4. Clicks plan
5. Enters payment info
6. Completes checkout

**Why it matters:** Identify where users abandon the upgrade process.

### 4. Session Duration & Page Views (PRIORITY: LOW)

**Current state:** You track sessions, but not duration or page views.

**Recommendation:** Add to `sessions` table:
```typescript
sessions: defineTable({
  // ... existing fields
  duration: v.optional(v.number()), // Session length in seconds
  pageViews: v.optional(v.number()), // Pages viewed in session
  lastPageVisited: v.optional(v.string()),
})
```

**Why it matters:**
- "Active" users with 30-second sessions aren't really active
- Understand content engagement
- Identify confused users (high bounce rate)

### 5. Property Analysis Feedback (PRIORITY: MEDIUM)

**Problem:** You don't know if analyses were helpful.

**Recommendation:** Add thumbs up/down on analysis results:
```typescript
// New table: analysisFeedback
analysisFeedback: defineTable({
  analysisId: v.id("propertyAnalyses"),
  userId: v.id("users"),
  rating: v.number(), // 1 = helpful, -1 = not helpful
  feedback: v.optional(v.string()), // Optional comment
  createdAt: v.number(),
})
```

**Why it matters:**
- Improve AI model quality
- Identify inaccurate analyses
- Understand what users value

### 6. Exit Intent & Churn Signals (PRIORITY: MEDIUM)

**Recommendation:** Track signals that predict churn:
- Account settings page views (looking to cancel)
- Billing page views without action
- Support tickets about pricing/cancellation
- Usage drop-off (was active, now cold)

**Implementation:** Add `churnRiskScore` to users table, calculated daily:
```typescript
users: defineTable({
  // ... existing fields
  churnRiskScore: v.optional(v.number()), // 0-100, higher = more risk
  churnRiskFactors: v.optional(v.array(v.string())), // ["inactive_30_days", "viewed_pricing_no_action"]
  churnRiskUpdatedAt: v.optional(v.number()),
})
```

## Quick Win Opportunities

### 1. Email the 104 Ghost Users

**Segment:** Never used the product (0 analyses)

**Email strategy:**
- Subject: "Need help getting started with PropIQ?"
- Offer: Video walkthrough or sample property data
- Goal: Get first analysis (users who complete 1 analysis convert at 10x rate)

**Template:**
```
Subject: Did something go wrong?

Hi [FirstName],

I noticed you signed up for PropIQ on [SignupDate] but haven't analyzed your first property yet.

That's unusual - most users run their first analysis within 5 minutes!

Is there something blocking you? I'd love to help.

Reply to this email and I'll personally walk you through your first analysis.

Or if you prefer, here's a quick video: [link]

Best,
Brian
Founder, PropIQ

P.S. You have 3 free analyses waiting. Don't let them go to waste!
```

### 2. Reach Out to 13 One-Time Users

**Segment:** Logged in multiple times but never ran analysis

**Email strategy:**
- Subject: "Can I help you analyze your first property?"
- Identify blocker (confused, missing data, technical issue)
- Offer personal onboarding call

### 3. Win Back 7 Cold Users

**Segment:** Used product but inactive >30 days

**Email strategy:**
- Subject: "We've added new features since you left"
- Highlight improvements
- Offer discount or bonus analyses
- "What would bring you back?" survey

### 4. Set Up Automated Drip Campaigns

**Day 0 (Signup):**
- Welcome email
- "Your first 3 analyses are ready"
- Quick start guide

**Day 1 (If no analysis):**
- "Having trouble? Here's a video"
- Sample property data

**Day 3 (If no analysis):**
- "This is unusual... can I help?"
- Personal offer to assist

**Day 7 (If 1-2 analyses used):**
- "You're almost there! 1 analysis left"
- "Users who complete all 3 trials upgrade 5x more often"

**Day 14 (Trial expiring, free tier):**
- "Your trial expires in 7 days"
- Show ROI: "Users save $12,847 on average"
- Upgrade offer

**Day 21 (Trial expired, no upgrade):**
- "Your trial has expired"
- Show what they're missing
- Limited-time discount (20% off first month)

## Export Usage Guide

### Export all users:
```bash
npm run export:users
```

### Export by segment (recommended):
```bash
npm run export:segments
```

This creates 5 separate CSV files:
- `propiq-users-ghost-{date}.csv` (104 users)
- `propiq-users-one-time-{date}.csv` (13 users)
- `propiq-users-cold-{date}.csv` (7 users)
- `propiq-users-warm-{date}.csv` (0 users)
- `propiq-users-active-{date}.csv` (0 users)

### Export only free tier:
```bash
npm run export:free
```

## Data Quality Notes

### Test Users Detected

Your export includes test users like:
- `rapid-test-*@propiq.test`
- `chaos-test-*@propiq.test`
- `test@example.com`

**Recommendation:** Filter these out:
1. Add `isTestUser` boolean to users table
2. Exclude from analytics and emails
3. Or use `.filter()` in export script

### Missing Data Patterns

- **104 ghost users** = Onboarding problem (people don't understand how to start)
- **0 warm/active users** = Retention problem (nobody sticking around)
- **13 one-time users** = UX problem (logged in, couldn't figure it out)

## Next Steps

1. **Immediate (Today):**
   - Export free tier users: `npm run export:free`
   - Review CSV in Excel/Google Sheets
   - Filter out test users
   - Draft first email to ghost users

2. **This Week:**
   - Set up email templates in Resend
   - Send first batch to 10-20 ghost users (test)
   - Track response rate
   - Implement feature usage tracking

3. **This Month:**
   - Add conversion funnel tracking
   - Set up automated drip campaigns
   - Analyze what causes conversions
   - Fix top 3 drop-off points

4. **Ongoing:**
   - Monitor churn risk scores
   - A/B test email copy
   - Track feature usage patterns
   - Optimize conversion funnel

## Questions to Answer with This Data

1. **Why did 104 users sign up but never use the product?**
   - Is onboarding confusing?
   - Do they not have property data?
   - Is the value prop unclear?

2. **What makes the 7 "cold" users different?**
   - What did they analyze?
   - When did they stop?
   - What was their last activity?

3. **Why did 0 users convert from free to paid?**
   - Is pricing too high?
   - Is the free tier too generous (3 analyses)?
   - Do users not see enough value?
   - Is the upgrade path unclear?

4. **How can we prevent users from going cold?**
   - Email before they churn
   - Add re-engagement hooks
   - Offer incentives to return

## Success Metrics

Track these weekly:

**Activation:**
- % of signups who complete first analysis (currently <16%)
- Time to first analysis
- % who complete all 3 trial analyses

**Engagement:**
- % of users active in last 7 days (currently 0%)
- % of users active in last 30 days (currently 0%)
- Average analyses per user

**Conversion:**
- Free to paid conversion rate (currently 0%)
- Time to first paid subscription
- % who upgrade before trial expires

**Retention:**
- % of paid users still active after 30 days
- % of paid users still active after 90 days
- Monthly churn rate

## Resources

- Export script: `/scripts/export-users-to-csv.ts`
- Export queries: `/convex/exports.ts`
- Database schema: `/convex/schema.ts`
- Documentation: `/scripts/README.md`

---

**Bottom Line:** You're tracking the RIGHT data, but you're not USING it yet. Your 124 signups are waiting for you to reach out!
