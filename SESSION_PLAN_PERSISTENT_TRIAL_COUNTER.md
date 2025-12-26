# Session Plan: Persistent Trial Counter + Day 1 Email
**Date:** 2025-12-25
**Goal:** Ship two high-impact conversion improvements
**Estimated Time:** 2-3 hours total

---

## TASK 1: Persistent Trial Counter ⏱️ Target: 1 hour

### Current State
- `TrialCountdown.tsx` has two components:
  - `TrialCountdown`: Large banner (only shows when ≤2 analyses remaining)
  - `TrialCountdownCompact`: Navbar-friendly widget (already built but not used!)
- `App.tsx` Header shows generic `UsageBadge` ("X left")
- Free tier users don't see trial status until almost depleted

### Desired State
- Free tier users see persistent "X / 3 analyses" counter in navbar
- Always visible across all pages
- Clickable to trigger upgrade modal
- Includes progress bar for visual urgency
- Paid users continue seeing existing UsageBadge

### Implementation Steps

#### Step 1: Import TrialCountdownCompact
**File:** `frontend/src/App.tsx`
**Line:** ~2 (with other imports)

```tsx
import { TrialCountdownCompact } from './components/TrialCountdown';
```

#### Step 2: Add onUpgrade prop to Header component
**File:** `frontend/src/App.tsx`
**Lines:** 124-145 (Header component definition)

**Before:**
```tsx
const Header = ({
  propIqUsed,
  propIqLimit,
  currentTier,
  userId,
  userEmail,
  onLogout,
  onHelpClick,
  onManageSubscription,
  onSettingsClick
}: {
  propIqUsed: number;
  propIqLimit: number;
  currentTier: string;
  userId: string | null;
  userEmail: string | null;
  onLogout: () => void;
  onHelpClick: () => void;
  onManageSubscription?: () => void;
  onSettingsClick?: () => void;
}) => {
```

**After:**
```tsx
const Header = ({
  propIqUsed,
  propIqLimit,
  currentTier,
  userId,
  userEmail,
  onLogout,
  onHelpClick,
  onManageSubscription,
  onSettingsClick,
  onUpgrade  // ← ADD THIS
}: {
  propIqUsed: number;
  propIqLimit: number;
  currentTier: string;
  userId: string | null;
  userEmail: string | null;
  onLogout: () => void;
  onHelpClick: () => void;
  onManageSubscription?: () => void;
  onSettingsClick?: () => void;
  onUpgrade?: () => void;  // ← ADD THIS
}) => {
```

#### Step 3: Pass handleUpgradeClick to Header
**File:** `frontend/src/App.tsx`
**Line:** 804 (Header component usage)

**Before:**
```tsx
<Header
  propIqUsed={propIqUsed}
  propIqLimit={propIqLimit}
  currentTier={currentTier}
  userId={userId}
  userEmail={userEmail}
  onLogout={handleLogout}
  onHelpClick={() => setShowHelpCenter(true)}
  onManageSubscription={handleManageSubscription}
  onSettingsClick={() => setShowSettings(true)}
/>
```

**After:**
```tsx
<Header
  propIqUsed={propIqUsed}
  propIqLimit={propIqLimit}
  currentTier={currentTier}
  userId={userId}
  userEmail={userEmail}
  onLogout={handleLogout}
  onHelpClick={() => setShowHelpCenter(true)}
  onManageSubscription={handleManageSubscription}
  onSettingsClick={() => setShowSettings(true)}
  onUpgrade={handleUpgradeClick}  // ← ADD THIS
/>
```

#### Step 4: Replace UsageBadge with conditional rendering
**File:** `frontend/src/App.tsx`
**Line:** 179 (inside Header component)

**Before:**
```tsx
<UsageBadge used={propIqUsed} limit={propIqLimit} />
```

**After:**
```tsx
{/* Show trial counter for free users, usage badge for paid users */}
{currentTier === 'free' && onUpgrade ? (
  <TrialCountdownCompact
    status={{
      tier: 'free',
      analysesUsed: propIqUsed,
      analysesLimit: propIqLimit,
      isTrialActive: true
    }}
    onUpgrade={onUpgrade}
  />
) : (
  <UsageBadge used={propIqUsed} limit={propIqLimit} />
)}
```

### Testing Checklist
- [ ] Free tier user sees "X / 3" counter in navbar
- [ ] Counter shows on all pages (dashboard, pricing, settings)
- [ ] Clicking counter opens pricing modal
- [ ] Progress bar fills as analyses are used
- [ ] Paid tier users still see old UsageBadge
- [ ] Counter updates in real-time after analysis

### Commit Message
```
feat: add persistent trial counter to navbar

- Import TrialCountdownCompact component
- Add onUpgrade prop to Header component
- Replace UsageBadge with TrialCountdownCompact for free tier users
- Paid users continue seeing existing usage badge
- Trial counter now always visible, not just when ≤2 analyses

Expected impact: +2-3% conversion (constant scarcity reminder)

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## TASK 2: Wire Day 1 Onboarding Email ⏱️ Target: 1-2 hours

### Current State
- Beautiful email templates exist in `backend/utils/onboarding_emails.py`
- 4-day sequence designed (Day 1-4)
- SendGrid integration exists in `backend/routers/email.py`
- **BUT:** No trigger system - emails never sent!
- Signup happens in `convex/auth.ts`

### Desired State
- Day 1 welcome email fires immediately after user signs up
- Email sent via SendGrid
- Email includes user's name if provided
- Foundation laid for Day 2-4 emails (future task)

### Implementation Steps

#### Step 1: Review Current Email Template
**File:** `backend/utils/onboarding_emails.py`
**Function:** `get_email_day_1()` (lines 20-215)

This template is ready to use. It includes:
- Welcome message
- Platform overview
- Quick-start checklist
- Feature highlights
- Social proof

#### Step 2: Check SendGrid Integration
**File:** `backend/routers/email.py`
**Lines:** 1-23

Current implementation is basic but functional. Need to enhance for onboarding.

#### Step 3: Create Convex Email Action
**File:** Create new `convex/emails.ts`

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "team@propiq.ai";

export const sendOnboardingDay1 = action({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Import SendGrid (you'll need to add @sendgrid/mail to package.json)
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(SENDGRID_API_KEY);

    // Build email content (adapt from onboarding_emails.py template)
    const userName = args.name || "there";

    const msg = {
      to: args.email,
      from: FROM_EMAIL,
      subject: "Day 1 of 4: Welcome to PropIQ",
      html: getDay1EmailHTML(userName, args.email),
    };

    try {
      await sgMail.send(msg);
      console.log(`[ONBOARDING] Day 1 email sent to ${args.email}`);

      // Log to database for tracking
      await ctx.runMutation(internal.emails.logEmailSent, {
        userId: args.userId,
        emailType: "onboarding_day_1",
        sentAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      console.error(`[ONBOARDING] Failed to send email to ${args.email}:`, error);
      return { success: false, error: String(error) };
    }
  },
});

// Helper function - email HTML template
function getDay1EmailHTML(userName: string, userEmail: string): string {
  const APP_URL = "https://propiq.luntra.one";

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4F46E5;
            font-size: 28px;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .feature-card {
            background: #f3f4f6;
            border-left: 4px solid #4F46E5;
            padding: 16px;
            margin: 16px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to PropIQ</h1>
        <p>Hi ${userName},</p>
        <p>PropIQ is your AI-powered partner for real estate investment analysis...</p>
        <a href="${APP_URL}" class="cta-button">Explore PropIQ →</a>

        <!-- Full template from onboarding_emails.py -->

        <p>© 2025 PropIQ by LUNTRA</p>
    </div>
</body>
</html>
  `;
}
```

#### Step 4: Trigger Email in Signup Flow
**File:** `convex/auth.ts`
**Location:** After user creation (find the signup mutation)

**Add this after user is created:**
```typescript
// Trigger Day 1 onboarding email
await ctx.scheduler.runAfter(0, internal.emails.sendOnboardingDay1, {
  userId: user._id,
  email: args.email,
  name: args.firstName,
});
```

#### Step 5: Add Email Tracking Schema
**File:** `convex/schema.ts`

```typescript
emailLogs: defineTable({
  userId: v.id("users"),
  emailType: v.string(),
  sentAt: v.number(),
  opened: v.optional(v.boolean()),
  clicked: v.optional(v.boolean()),
})
  .index("by_user", ["userId"])
  .index("by_type", ["emailType"]),
```

### Environment Variables Needed
Add to `.env` or Convex environment:
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FROM_EMAIL=team@propiq.ai
APP_URL=https://propiq.luntra.one
```

### Testing Checklist
- [ ] Sign up with new test account
- [ ] Check email inbox (might take 1-2 minutes)
- [ ] Verify email has correct name personalization
- [ ] Check email links work (point to propiq.luntra.one)
- [ ] Verify email logged in database
- [ ] Test with multiple signups (ensure not duplicates)

### Commit Message
```
feat: wire Day 1 onboarding email on signup

- Create convex/emails.ts with SendGrid integration
- Add sendOnboardingDay1 action with email template
- Trigger email immediately after user creation in auth.ts
- Add emailLogs schema for tracking
- Email includes personalized welcome and quick-start guide

Expected impact: +5-8% conversion (users who receive onboarding emails convert 2-3x higher)

Foundation for Day 2-4 emails (scheduled separately)

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Success Metrics

### Task 1: Persistent Trial Counter
- **Visibility:** 100% of free tier users see counter
- **Engagement:** Track click-through rate on counter
- **Conversion:** Measure if trial-to-paid improves by 2-3%

### Task 2: Day 1 Email
- **Delivery:** 95%+ emails successfully sent
- **Open Rate:** Target 40-50% (industry standard for welcome emails)
- **Activation:** Measure if email recipients analyze more properties

---

## Files Modified Summary

### Task 1 (Trial Counter)
- `frontend/src/App.tsx` - 4 changes (import, props, usage, conditional)
- `frontend/src/components/TrialCountdown.tsx` - No changes (already exists!)

### Task 2 (Email)
- `convex/emails.ts` - New file
- `convex/auth.ts` - Add scheduler call
- `convex/schema.ts` - Add emailLogs table
- `package.json` - Add @sendgrid/mail dependency

---

## Rollback Plan
If issues arise:
1. **Task 1:** Revert App.tsx changes, UsageBadge will return
2. **Task 2:** Comment out scheduler call in auth.ts, emails stop

---

## Next Steps (Future Sessions)
1. Wire Day 2-4 onboarding emails with proper delays
2. Add email open/click tracking
3. Build cancellation reason modal
4. Implement simple referral program
5. Fix dual auth system (Convex + Supabase)

---

**Ready to code!** Start with Task 1, test thoroughly, commit, then move to Task 2.
