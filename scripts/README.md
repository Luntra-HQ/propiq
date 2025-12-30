# PropIQ Scripts

Utility scripts for managing PropIQ database and exports.

## User Export Script

Export user data to CSV for marketing, analytics, and email outreach.

### Prerequisites

```bash
npm install convex tsx
```

### Usage

**Export all users:**
```bash
npx tsx scripts/export-users-to-csv.ts
```

**Export users by segment:**
```bash
npx tsx scripts/export-users-to-csv.ts --segment
```

**Export only free tier users:**
```bash
npx tsx scripts/export-users-to-csv.ts --free
```

### Output

Creates CSV files with the following data:

**User Data:**
- userId
- email
- firstName
- lastName
- company
- subscriptionTier (free, starter, pro, elite)
- subscriptionStatus
- stripeCustomerId

**Dates:**
- signupDate (ISO format)
- lastLoginDate
- lastActiveDate
- lastAnalysisDate

**Engagement Metrics:**
- loginCount (number of sessions)
- analysisCount (total analyses run)
- analysesUsed (current billing period)
- analysesLimit (based on tier)
- analysesRemaining

**Time Metrics:**
- daysSinceSignup
- daysSinceLastLogin
- daysSinceLastActive

**Onboarding:**
- analyzedFirstProperty (boolean)
- completedProductTour (boolean)
- checklistDismissed (boolean)

**Segmentation:**
- userSegment (ghost, one-time, cold, warm, active)

**Account Status:**
- active (boolean)
- emailVerified (boolean)

### User Segments

The script automatically segments users:

1. **Ghost** - Signed up but never used the product (0 analyses)
2. **One-time** - Logged in multiple times but never ran analysis (0 analyses, >1 login)
3. **Cold** - Used product but inactive >30 days (>0 analyses, >30 days inactive)
4. **Warm** - Used product recently (>0 analyses, 8-30 days inactive)
5. **Active** - Currently using product (>0 analyses, <7 days inactive)

### Email Outreach Ideas

**Ghost Users:**
- Subject: "Did you forget something?"
- Goal: Get them to run first analysis
- Offer: Video tutorial, demo data

**One-time Users:**
- Subject: "Having trouble getting started?"
- Goal: Understand blocker, get first analysis
- Offer: Personal onboarding call

**Cold Users:**
- Subject: "We miss you!"
- Goal: Re-engage with new features
- Offer: Extra analyses, discount

**Warm Users:**
- Subject: "Upgrade to unlock more analyses"
- Goal: Convert to paid plan
- Offer: 20% discount on first month

**Free Tier (all segments):**
- Subject: "You have X analyses left"
- Goal: Convert before trial expires
- Offer: Clear upgrade path, pricing

### Examples

**Find users who signed up but never logged in:**
```bash
npx tsx scripts/export-users-to-csv.ts --segment
# Look at ghost segment CSV
```

**Find free users close to limit:**
```bash
npx tsx scripts/export-users-to-csv.ts --free
# Filter CSV for analysesRemaining < 3
```

**Find inactive paid users (churn risk):**
```bash
npx tsx scripts/export-users-to-csv.ts
# Filter for subscriptionTier != "free" AND daysSinceLastActive > 30
```

### Troubleshooting

**Error: CONVEX_URL not found**
```bash
# Make sure .env.local has VITE_CONVEX_URL
cat .env.local | grep CONVEX_URL
```

**Permission errors:**
```bash
# Make script executable
chmod +x scripts/export-users-to-csv.ts
```

**Missing tsx:**
```bash
npm install -D tsx
```
