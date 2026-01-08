# PropIQ Post-Signup Email Investigation

**Date:** January 7, 2026
**Status:** ⚠️ **GAP IDENTIFIED**

---

## Executive Summary

**Answer:** **No, there's a gap.** PropIQ sends ONE email after direct trial signup (email verification), but there's NO automated welcome/onboarding email sequence currently active.

### What Users Get After Signup

**Direct Trial Signup (not via lead magnet):**
1. ✅ **Email Verification Email** (immediate) - via Convex + Resend
2. ❌ **No welcome email sequence**
3. ❌ **No onboarding drip campaign**

**Lead Magnet → Trial Conversion:**
1. ✅ **Email Verification Email** (immediate) - via Convex + Resend
2. ✅ **Lead nurture sequence stopped** (Day 3 + Day 7 emails no longer sent)
3. ❌ **No transition to trial onboarding sequence**

---

## The Current State

### What's Working ✅

**Email Verification (Convex + Resend):**
- **Location:** `convex/http.ts` (lines 212-299)
- **Triggered by:** `POST /auth/signup` endpoint
- **When:** Immediately after user signs up
- **Email provider:** Resend API
- **From:** `PropIQ <noreply@propiq.luntra.one>`
- **Content:**
  - Welcome message
  - Email verification link
  - 24-hour expiration
  - Professional HTML design

**Code flow:**
```typescript
// 1. User signs up
POST /auth/signup
  ↓
// 2. Create user + session
signupWithSession mutation
  ↓
// 3. Create verification token
createEmailVerificationToken mutation
  ↓
// 4. HTTP endpoint sends email
fetch("https://api.resend.com/emails")
  ↓
// 5. User receives verification email
```

**Lead Nurture Sequence (for lead magnet users):**
- **Location:** `convex/emailScheduler.ts`, `convex/crons.ts`
- **Emails:** Day 3 + Day 7 nurture emails
- **Status:** ✅ Active and running
- **Note:** Stops when user signs up (status → `converted_trial`)

### What's NOT Working ❌

**No Post-Signup Onboarding Sequence:**
- Direct trial signups get **NO welcome emails** beyond verification
- No educational sequence about PropIQ features
- No engagement emails to drive usage
- No retention campaign

**Legacy Backend System (NOT ACTIVE):**
- **Location:** `backend/utils/onboarding_emails.py`, `backend/routers/onboarding.py`
- **Status:** ❌ **NOT RUNNING** - Backend API not accessible
- **Was:** 4-day onboarding email campaign via SendGrid
- **Now:** Legacy code from pre-Convex migration

---

## The Gap

### For Direct Trial Signups

**Current experience:**
```
User signs up
  ↓
Receives email verification email
  ↓
[NOTHING ELSE]
  ↓
User must self-discover PropIQ features
```

**Missing:**
- Welcome email (beyond verification)
- Feature education sequence
- Engagement/activation emails
- Success stories or social proof
- Tips for getting started

### For Lead Magnet → Trial Conversions

**Current experience:**
```
User downloads lead magnet
  ↓
Day 3: Nurture email sent
  ↓
Day 7: Final nurture email sent
  ↓
User signs up for trial
  ↓
Lead nurture emails STOP
  ↓
Verification email sent
  ↓
[NOTHING ELSE]
  ↓
No transition to trial onboarding
```

**Missing:**
- "Congrats on signing up!" email
- Trial activation sequence
- Feature walkthroughs
- Success milestones

---

## What SHOULD Exist (Best Practice)

### Ideal Post-Signup Sequence

**Day 0 (Immediate):**
- ✅ Email verification (CURRENT)
- ❌ Welcome email with getting started guide (MISSING)

**Day 1:**
- ❌ "How to run your first property analysis" (MISSING)
- ❌ Product tour walkthrough (MISSING)

**Day 3:**
- ❌ "Master the deal calculator" (MISSING)
- ❌ Tips for interpreting metrics (MISSING)

**Day 5:**
- ❌ "Advanced features unlocked" (MISSING)
- ❌ Upgrade path education (Free → Starter → Pro) (MISSING)

**Day 7:**
- ❌ "You've had PropIQ for a week..." check-in (MISSING)
- ❌ Success stories from other investors (MISSING)

---

## Legacy Backend System (Context)

### What Existed Before Convex

**4-Day Onboarding Campaign (Python/FastAPI + SendGrid):**

**Day 1: Welcome to PropIQ**
- Platform introduction
- Key features overview
- Quick-start checklist

**Day 2: Master Property Analysis**
- AI analysis deep dive
- Deal score interpretation
- Pro tips

**Day 3: Deal Calculator & Financial Tools**
- Calculator walkthrough
- Scenario analysis
- Financial metrics

**Day 4: Advanced Features & Success Stories**
- Export reports
- Market insights
- Customer success stories

**Files:**
- `backend/utils/onboarding_emails.py` - Email templates
- `backend/utils/onboarding_campaign.py` - Campaign logic
- `backend/routers/onboarding.py` - API endpoints

**Status:** ❌ **NOT ACTIVE** (backend migrated to Convex)

**Backend API check:**
```bash
curl https://api.luntra.one/health
# No response (not deployed or not accessible)

curl https://api.luntra.one/onboarding/health
# No response
```

---

## Technical Implementation Details

### Email Verification (Current)

**File:** `convex/http.ts`

**Trigger:**
```typescript
http.route({
  path: "/auth/signup",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Create user + session
    const result = await ctx.runMutation(api.auth.signupWithSession, {
      email, password, firstName, lastName, company, userAgent
    });

    // 2. Send verification email
    if (result.verificationToken) {
      const resendApiKey = process.env.RESEND_API_KEY;
      const verificationUrl = `https://propiq.luntra.one/verify-email?token=${result.verificationToken}`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PropIQ <noreply@propiq.luntra.one>",
          to: result.user.email,
          subject: "Verify your PropIQ email address",
          html: `...verification email template...`
        })
      });
    }
  })
});
```

**Email sent:**
- Subject: "Verify your PropIQ email address"
- Professional HTML template
- Call-to-action: "Verify Email Address" button
- Link expires in 24 hours

### Lead Nurture Sequence (Current)

**Files:**
- `convex/emailScheduler.ts` - Email templates + sending logic
- `convex/crons.ts` - Scheduled jobs

**Status:** ✅ Active (deployed to Convex)

**Flow:**
```
Lead captured → status: "captured"
  ↓
Day 3: Cron runs (10 AM EST) → Email sent → status: "nurtured_day3"
  ↓
Day 7: Cron runs (10:30 AM EST) → Email sent → status: "nurtured_day7"
  ↓
User signs up → status: "converted_trial" → Emails STOP
```

**Note:** Lead nurture emails are for UNCONVERTED leads only. Once they sign up, the sequence stops and nothing replaces it.

---

## What's Available for Implementation

### Onboarding Progress Tracking (Exists!)

**File:** `convex/onboarding.ts`

**Already implemented:**
- ✅ Database table: `onboardingProgress`
- ✅ Mutations to track user progress:
  - `updateTask` - Mark tasks complete
  - `dismissChecklist` - Dismiss onboarding UI
  - `updateTourProgress` - Track product tour
  - `getCompletionPercentage` - Calculate progress %

**Tracked milestones:**
- `analyzedFirstProperty`
- `exploredCalculator`
- `triedScenarios`
- `readKeyMetricsArticle`
- `setInvestmentCriteria`
- `exportedReport`
- `analyzedThreeProperties`
- `completedProductTour`

**Frontend components:**
- `frontend/src/components/ProductTour.tsx` - Interactive product tour
- UI checklist (exists in app)

**What's missing:** Email notifications tied to these milestones!

---

## Recommendations

### Option 1: Quick Fix (1-2 hours)

**Add welcome email to existing verification email:**
- Combine verification + welcome in one email
- Include quick start guide
- Link to product tour
- No new infrastructure needed

**Pros:**
- Fast to implement
- Uses existing Resend integration
- Better than nothing

**Cons:**
- Only one email (no sequence)
- No progressive education
- No behavior-based triggers

### Option 2: Convex Onboarding Sequence (4-6 hours)

**Build new onboarding email sequence in Convex:**
- Copy Day 1-4 templates from legacy backend
- Create `convex/onboardingEmailScheduler.ts`
- Add cron jobs for Day 1, 3, 5, 7
- Track in new `userOnboardingCampaigns` table
- Use existing Resend integration

**Pros:**
- Progressive education
- Better user activation
- Aligns with lead nurture approach
- All in Convex (consistent architecture)

**Cons:**
- More development time
- Need to adapt legacy templates
- Need new database schema

### Option 3: Behavior-Triggered Emails (8-12 hours)

**Smart onboarding based on user actions:**
- Welcome email on signup (Day 0)
- "Congrats on first analysis!" email (triggered by event)
- "You haven't analyzed a property yet" (Day 3, if inactive)
- "Try the calculator" (Day 5, if not used)
- "Upgrade to unlock more" (after 3 analyses)

**Pros:**
- Personalized experience
- Higher engagement
- Reduced email fatigue
- Ties to onboarding milestones (already tracked!)

**Cons:**
- Most complex to build
- Requires event system
- Need to test multiple paths

### Option 4: Migrate Legacy Backend Campaign (2-3 hours)

**Port existing 4-day campaign to Convex:**
- Copy email templates from `backend/utils/onboarding_emails.py`
- Implement in Convex (like lead nurture sequence)
- Use existing Resend integration
- Add cron jobs for automated sending

**Pros:**
- Templates already written and tested
- Known to work (was live before)
- Complete sequence ready to go

**Cons:**
- Static sequence (not personalized)
- May need content updates
- Doesn't leverage onboarding milestones

---

## Cost Analysis

**All options use existing Resend integration:**
- Current cost: $0/month (within free tier)
- Free tier: 3,000 emails/month
- Current usage: ~200/month (lead nurture only)
- With onboarding: ~800/month (still FREE)

**Breakdown (100 signups/month):**
- Lead nurture: ~200 emails/month
- Email verification: ~100 emails/month
- 4-day onboarding: ~400 emails/month (4 emails × 100 users)
- **Total: ~700/month = FREE**

**At scale (500 signups/month):**
- Lead nurture: ~200 emails/month
- Email verification: ~500 emails/month
- 4-day onboarding: ~2,000 emails/month
- **Total: ~2,700/month = FREE**

**At 750+ signups/month:** Would exceed free tier, need paid plan ($20/mo for 50k emails)

---

## Immediate Next Steps

### To Fix The Gap

**Recommended approach:** Option 2 (Convex Onboarding Sequence)

**Why:**
- Consistent with current architecture (all Convex)
- Proven templates from legacy backend
- Reasonable development time (4-6 hours)
- Free within current usage
- Can iterate and improve over time

**Implementation checklist:**
1. Create `convex/onboardingEmailScheduler.ts`
2. Add email templates (Day 1, 3, 5, 7)
3. Create `userOnboardingCampaigns` table in schema
4. Add mutations to start/track campaigns
5. Add cron jobs for automated sending
6. Update signup flow to start campaign
7. Test with development email
8. Deploy to production

**Files to create/modify:**
- `convex/onboardingEmailScheduler.ts` (NEW)
- `convex/schema.ts` (ADD table)
- `convex/crons.ts` (ADD cron jobs)
- `convex/http.ts` (UPDATE signup to start campaign)

---

## Current File Locations

### Active (Convex)
- ✅ `convex/auth.ts` - Signup mutations
- ✅ `convex/http.ts` - HTTP endpoints (includes signup)
- ✅ `convex/emailScheduler.ts` - Lead nurture emails
- ✅ `convex/crons.ts` - Cron jobs (lead nurture only)
- ✅ `convex/onboarding.ts` - Onboarding progress tracking
- ✅ `convex/leads.ts` - Lead management

### Legacy (Not Active)
- ❌ `backend/utils/onboarding_emails.py` - Email templates
- ❌ `backend/utils/onboarding_campaign.py` - Campaign logic
- ❌ `backend/routers/onboarding.py` - API endpoints

### Documentation
- 📄 `ONBOARDING_CAMPAIGN_GUIDE.md` - Legacy campaign docs
- 📄 `LEAD_NURTURE_IMPLEMENTATION_COMPLETE.md` - Current lead nurture
- 📄 `COFOUNDER_HANDOFF_NURTURE_SEQUENCE.md` - Lead nurture handoff

---

## Summary

### Current State
- ✅ Email verification works (Convex + Resend)
- ✅ Lead nurture sequence works (Day 3 + Day 7)
- ✅ Onboarding progress tracking works (in-app)
- ❌ **No post-signup onboarding email sequence**
- ❌ **Legacy backend campaign not active**

### The Gap
- Direct trial signups get **only verification email**
- Lead magnet conversions get **no trial onboarding**
- Users must self-discover features
- No progressive education or engagement

### The Fix
- **Recommended:** Build Convex onboarding sequence (Option 2)
- **Time:** 4-6 hours
- **Cost:** $0/month (within Resend free tier)
- **Impact:** Better user activation and retention

---

**Investigation completed:** January 7, 2026
**Findings:** Clear gap identified - post-signup onboarding email sequence needed
**Recommendation:** Implement Option 2 (Convex Onboarding Sequence)
