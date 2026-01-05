# ADR-002: Unauthenticated Pricing Flow

**Status:** Implemented
**Date:** 2026-01-05
**Author:** Claude Code (with Brian Dusape)

## Context

Users visiting the pricing page (`/pricing`) or clicking "Upgrade" inside the app without being authenticated were hitting a hard blocker:

- **Old behavior:** `alert('Please log in to upgrade your plan.')` → user bounced, conversion lost
- **Problem:** Created friction in the signup/upgrade funnel, reducing conversion rates
- **Business impact:** Lost potential revenue from users who wanted to upgrade but weren't yet logged in

## Decision

Implemented **localStorage-based tier persistence with automatic checkout trigger** after authentication.

### Flow

1. **User clicks "Get Started" on pricing page (unauthenticated)**
   - Tier ID saved to `localStorage.pendingTier`
   - User redirected to `/signup?plan=<tier>` (e.g., `/signup?plan=pro`)

2. **User completes signup/login**
   - Auth system sets `userId` in React state
   - `AuthModal` closes

3. **App.tsx detects pending tier (useEffect)**
   ```typescript
   useEffect(() => {
     if (userId && !showAuthModal) {
       const pendingTier = localStorage.getItem('pendingTier');
       if (pendingTier) {
         localStorage.removeItem('pendingTier'); // Clear to prevent loops
         setTimeout(() => {
           handleSelectTier(pendingTier); // Auto-trigger Stripe checkout
         }, 1000);
       }
     }
   }, [userId, showAuthModal]);
   ```

4. **Stripe checkout session created automatically**
   - User redirected to Stripe Checkout
   - After payment, returns to app with active subscription

### Implementation Details

**Files Modified:**
- `frontend/src/App.tsx`:
  - Modified `handleSelectTier()` to detect unauthenticated users
  - Added useEffect to auto-trigger checkout after auth
- `frontend/src/pages/PricingPagePublic.tsx`:
  - Added `handleTierSelect()` function
  - Changed "Get Started" buttons from `<Link>` to `<button onClick={handleTierSelect}>`

**Key Code Snippet:**
```typescript
// In handleSelectTier (App.tsx)
if (!userId) {
  console.log('User not authenticated - saving tier and redirecting to signup');
  localStorage.setItem('pendingTier', tierId);
  window.location.href = `/signup?plan=${tierId}`;
  return;
}
```

## Alternatives Considered

### Option A: Query Parameter Only (No localStorage)
- Pass `?plan=pro` to signup
- After signup, read URL param and trigger checkout
- **Rejected:** URL params can be lost during OAuth redirects or if user navigates away

### Option B: Inline Auth Modal on Pricing Page
- Show signup/login modal directly on pricing page
- After auth, trigger checkout immediately
- **Rejected:** More complex UI state management, harder to maintain

### Option C: Server-Side Session Storage
- Store pending tier in backend session
- Retrieve after login
- **Rejected:** Adds backend complexity, requires session management

## Consequences

### Positive
✅ **Better conversion rates** - No hard blocker for unauthenticated users
✅ **Seamless UX** - User intent (upgrade to Pro) preserved across signup
✅ **Simple implementation** - Only ~20 lines of code added
✅ **No backend changes** - Pure frontend solution

### Negative
⚠️ **Depends on localStorage** - Fails if user has disabled it (rare: <0.1% of users)
⚠️ **Race condition risk** - If auth state updates slowly, useEffect might not fire
⚠️ **Manual cleanup required** - Must clear `pendingTier` after checkout to prevent repeat triggers

### Mitigations
- Added 1-second delay in useEffect to let auth state settle
- Clear localStorage immediately before triggering checkout
- Added console logging for debugging

## Testing Checklist

- [ ] Unauthenticated user clicks "Get Started" on pricing page
- [ ] Verify `localStorage.pendingTier` is set
- [ ] Verify redirect to `/signup?plan=pro`
- [ ] Complete signup
- [ ] Verify checkout automatically triggers after login
- [ ] Verify `localStorage.pendingTier` is cleared after checkout
- [ ] Test with localStorage disabled (should fail gracefully)
- [ ] Test "Back" button during signup (should not lose tier selection)

## Rollback Plan

If this creates issues:

```bash
git revert <commit-hash>
git push origin main
netlify deploy --prod
```

Fallback: Simple alert + manual redirect to signup (original behavior).

## References

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [SaaS Conversion Funnel Best Practices](https://www.intercom.com/blog/saas-pricing-page/)
- Related Issue: (none - proactive improvement)

## Future Improvements

1. **Add visual indicator** - Show "Upgrading to Pro..." message during auto-checkout
2. **Support plan preselection on signup page** - Read `?plan=pro` and highlight that tier
3. **Analytics tracking** - Track conversion rate for unauthenticated → paid flow
4. **A/B test** - Compare this flow vs. inline auth modal (Option B)
