# Phase 3: Enhanced Subscription Management & Account Features

**Status:** In Progress
**Started:** December 23, 2025
**Estimated Completion:** 8-12 hours

---

## Overview

Phase 3 builds on the foundation of Phase 1 (Stripe Customer Portal) and Phase 2 (Settings Page) by adding critical in-app features that improve user experience and reduce friction in subscription management.

---

## Feature Priorities

### **High Priority (Must Have)**

#### 1. In-App Cancellation Flow ⭐⭐⭐
**Why:** Users shouldn't need to leave PropIQ to cancel
**Impact:** Reduces support tickets, improves UX, increases reactivation chances

**Features:**
- Cancel subscription button in Settings → Subscription tab
- Confirmation dialog with:
  - Cancellation reason selection (dropdown)
  - Optional feedback text area
  - Retain access until period end notification
  - "Cancel Subscription" and "Never Mind" buttons
- Success confirmation with reactivation instructions
- Webhook handling for cancellation events
- Database update: `subscriptionStatus = 'cancelled'`

**Files to Modify:**
- `frontend/src/pages/SettingsPage.tsx` - Add cancel button & dialog
- `convex/payments.ts` - Enhance `cancelSubscription` mutation
- `convex/http.ts` - Handle `customer.subscription.deleted` webhook

---

#### 2. Downgrade Subscription Support ⭐⭐⭐
**Why:** Users want flexibility without cancelling entirely
**Impact:** Improves retention, prevents churn to competitors

**Features:**
- "Change Plan" button in Settings → Subscription
- Plan comparison modal showing all tiers
- Downgrade flow (Pro → Starter, Elite → Pro/Starter)
- Prorated credit handling (Stripe automatic)
- Confirmation dialog showing:
  - New monthly price
  - Features you'll lose
  - Effective date (immediate vs. next cycle)
- Update via Stripe subscription modification API

**Files to Create/Modify:**
- `frontend/src/components/PlanChangeModal.tsx` - NEW
- `convex/payments.ts` - Add `changeSubscriptionTier` action
- `convex/http.ts` - Handle subscription update webhooks

---

#### 3. Change Password Functionality ⭐⭐⭐
**Why:** Security best practice, user expectation
**Impact:** Reduces "forgot password" support tickets

**Features:**
- "Change Password" section in Settings → Security tab
- Form with:
  - Current password (required for verification)
  - New password (with strength meter)
  - Confirm new password
- Password requirements display:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character
- Success notification
- Optional: Email confirmation of password change

**Files to Modify:**
- `frontend/src/pages/SettingsPage.tsx` - Add password form
- `convex/auth.ts` - Add `changePassword` mutation
- Optionally: Email service integration

---

### **Medium Priority (Should Have)**

#### 4. Download Analysis History ⭐⭐
**Why:** Users want to keep records of past analyses
**Impact:** Adds value to paid tiers, professional feature

**Features:**
- "Download History" button in Settings → Account tab
- Export formats:
  - **CSV:** All analyses with key metrics
  - **PDF:** Formatted report with branding
- Date range filter (Last 30 days, Last 90 days, All time)
- Limit to paid tiers (Premium feature)
- Includes:
  - Property address
  - Analysis date
  - Deal score
  - Key metrics (cash flow, ROI, cap rate)
  - AI recommendation summary

**Files to Create:**
- `frontend/src/utils/exportAnalyses.ts` - NEW (CSV generation)
- `frontend/src/utils/pdfExport.ts` - Enhance existing
- `convex/propertyAnalyses.ts` - Add `getAnalysesForExport` query

---

#### 5. Billing Preview Component ⭐⭐
**Why:** Transparency builds trust
**Impact:** Reduces billing-related support tickets

**Features:**
- "Next Invoice" card in Settings → Subscription tab
- Shows:
  - Next billing date
  - Amount to be charged
  - Payment method (last 4 digits)
  - Line items (subscription, add-ons if any)
- Pulls data from Stripe API
- Updates in real-time

**Files to Modify:**
- `frontend/src/pages/SettingsPage.tsx` - Add invoice preview card
- `convex/payments.ts` - Add `getUpcomingInvoice` action
- Uses Stripe API: `stripe.invoices.retrieveUpcoming()`

---

### **Low Priority (Nice to Have)**

#### 6. Usage Analytics Charts ⭐
**Features:**
- Line chart showing analyses over time
- Bar chart comparing monthly usage
- Trend indicators (up/down from last month)

#### 7. Team Management (Elite Tier) ⭐
**Features:**
- Invite team members
- Manage permissions
- View team usage

#### 8. API Keys Management ⭐
**Features:**
- Generate API keys for integrations
- Revoke keys
- Usage tracking per key

---

## Implementation Order

**Week 1:**
1. ✅ In-app cancellation flow (Day 1-2)
2. ✅ Downgrade subscription support (Day 2-3)
3. ✅ Change password functionality (Day 3-4)

**Week 2:**
4. Download analysis history (Day 5-6)
5. Billing preview component (Day 7)
6. Testing & bug fixes (Day 8)

---

## Technical Architecture

### Cancellation Flow

```typescript
// Frontend: SettingsPage.tsx
const handleCancelClick = () => {
  setShowCancelDialog(true);
};

const handleConfirmCancel = async (reason: string, feedback: string) => {
  await cancelSubscription({ userId, reason, feedback });
  // Show success message
  // Update UI to reflect cancelled status
};

// Backend: convex/payments.ts
export const cancelSubscription = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user's Stripe subscription ID
    // Call Stripe API to cancel subscription
    // Update database: subscriptionStatus = 'cancelled'
    // Log cancellation reason for analytics
    // Return success
  }
});
```

### Downgrade Flow

```typescript
// convex/payments.ts
export const changeSubscriptionTier = action({
  args: {
    userId: v.id("users"),
    newTier: v.string(), // "starter" | "pro" | "elite"
  },
  handler: async (ctx, args) => {
    // Validate new tier is lower than current
    // Get Stripe subscription ID
    // Update subscription via Stripe API
    // Stripe handles prorated credits automatically
    // Webhook will update database when confirmed
  }
});
```

### Password Change Flow

```typescript
// convex/auth.ts
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify current password matches
    // Validate new password strength
    // Hash new password
    // Update database
    // Optionally: Send confirmation email
  }
});
```

---

## Database Schema Changes

### Users Table Updates

```typescript
// Add cancellation tracking
users: defineTable({
  // ... existing fields ...

  // Cancellation tracking
  cancellationReason: v.optional(v.string()),
  cancellationFeedback: v.optional(v.string()),
  cancelledAt: v.optional(v.number()),

  // Downgrade tracking
  previousTier: v.optional(v.string()),
  tierChangeHistory: v.optional(v.array(v.object({
    fromTier: v.string(),
    toTier: v.string(),
    changedAt: v.number(),
    reason: v.optional(v.string()),
  }))),
})
```

### New Tables

```typescript
// Track cancellation reasons for analytics
cancellationReasons: defineTable({
  userId: v.id("users"),
  tier: v.string(),
  reason: v.string(), // "too_expensive" | "not_using" | "missing_features" | "other"
  feedback: v.optional(v.string()),
  createdAt: v.number(),
})
```

---

## UI/UX Mockups

### Cancellation Dialog

```
┌─────────────────────────────────────────────┐
│  Cancel Subscription?                       │
├─────────────────────────────────────────────┤
│                                             │
│  We're sorry to see you go! Your Pro plan  │
│  will remain active until Feb 23, 2026.    │
│                                             │
│  Why are you cancelling?                   │
│  ┌──────────────────────────────────────┐ │
│  │ [Dropdown: Select a reason]          │ │
│  └──────────────────────────────────────┘ │
│                                             │
│  Any feedback? (optional)                  │
│  ┌──────────────────────────────────────┐ │
│  │ [Text area]                          │ │
│  └──────────────────────────────────────┘ │
│                                             │
│  [Never Mind]  [Cancel Subscription] ←red  │
└─────────────────────────────────────────────┘
```

### Plan Change Modal

```
┌─────────────────────────────────────────────┐
│  Change Your Plan                    [X]    │
├─────────────────────────────────────────────┤
│                                             │
│  Current: Pro ($99/mo)                     │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Starter  │  │   Pro    │  │  Elite   │ │
│  │  $49/mo  │  │  $99/mo  │  │ $199/mo  │ │
│  │          │  │ CURRENT  │  │          │ │
│  │[Select]  │  │          │  │[Select]  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  Changing to Starter will:                 │
│  • Remove bulk import feature              │
│  • Remove priority support                 │
│  • Save you $50/month                      │
│                                             │
│  Change takes effect: Immediately          │
│  Prorated credit: $24.50 applied          │
│                                             │
│         [Cancel]  [Confirm Change]         │
└─────────────────────────────────────────────┘
```

---

## Success Metrics

**Cancellation Flow:**
- 80%+ completion rate for cancellation flow
- <5% report issues with cancellation
- 15%+ reactivation rate within 30 days

**Downgrade Support:**
- 30%+ of cancellers choose downgrade instead
- Improved retention by 20%
- Average LTV increase of $150/user

**Password Change:**
- <1% error rate
- 95%+ success rate
- Zero "forgot password" after recent change

**Export Feature:**
- Used by 40%+ of paid users monthly
- Cited as top 5 valuable feature

---

## Testing Requirements

### Unit Tests
- Password validation logic
- Cancellation reason validation
- Export data formatting
- Stripe API call mocking

### Integration Tests
- Full cancellation flow
- Downgrade flow with Stripe
- Password change end-to-end
- Export generation

### User Acceptance Tests
- Test all cancellation reasons
- Test downgrade from each tier
- Test password strength validation
- Test export with various date ranges

---

## Risk Mitigation

**Risk 1: Accidental Cancellations**
- **Mitigation:** Require confirmation dialog, show retention date
- **Fallback:** Allow reactivation within grace period

**Risk 2: Prorated Credit Errors**
- **Mitigation:** Stripe handles automatically, show preview
- **Fallback:** Manual credit adjustment process

**Risk 3: Password Change Lockout**
- **Mitigation:** Email confirmation, recovery link
- **Fallback:** Support team manual verification

**Risk 4: Export Performance**
- **Mitigation:** Limit exports to 1000 analyses max
- **Fallback:** Async job processing for large exports

---

## Dependencies

**External Services:**
- Stripe API (subscription updates, cancellation)
- Email service (password change confirmation)
- PDF library (jsPDF or similar)

**Internal:**
- Phase 1 & 2 completed
- Stripe webhook handling working
- Database schema migrations

---

## Rollout Plan

**Phase 3A (High Priority):**
- Deploy cancellation flow
- Deploy downgrade support
- Deploy password change
- **Testing:** 2-3 days
- **Launch:** Announce in-app & email

**Phase 3B (Medium Priority):**
- Deploy export feature
- Deploy billing preview
- **Testing:** 1-2 days
- **Launch:** Soft launch to Pro/Elite users

**Phase 3C (Low Priority):**
- Analytics charts
- Team management
- API keys
- **Timeline:** TBD based on user demand

---

## Documentation Updates

**User Docs:**
- How to cancel your subscription
- How to downgrade your plan
- How to change your password
- How to export your analysis history

**Developer Docs:**
- Cancellation webhook handling
- Subscription modification API
- Password hashing standards
- Export data format specification

---

**Next Steps:**
1. Begin implementation of cancellation flow
2. Set up cancellation tracking in database
3. Create confirmation dialog UI
4. Test with Stripe test mode
5. Move to downgrade support

---

**Estimated Total Implementation Time:** 8-12 hours
**Status:** Ready to begin 🚀
