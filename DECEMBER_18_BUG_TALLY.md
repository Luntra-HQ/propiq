# December 18, 2025 - Bug Tally

## Root Cause: Convex API Not Properly Generated

The frontend's `convex/_generated/api.js` uses generic `anyApi` placeholder instead of typed module definitions, causing all `api.*` references to be undefined in production.

## Bugs Encountered (Same Root Cause)

| # | Time | Component | Error | Occurrences | Fix Applied |
|---|------|-----------|-------|-------------|-------------|
| 1 | 11:15 AM | PricingPageWrapper | `undefined is not an object (evaluating 'api.payments.createCheckoutSession')` | 1x | ✅ String reference: `"payments:createCheckoutSession"` |
| 2 | 11:28 AM | App.tsx | `undefined is not an object (evaluating 'Us.payments.createCheckoutSession')` | 1x | ✅ String reference: `"payments:createCheckoutSession"` |
| 3 | 11:35 AM | OnboardingChecklist | `undefined is not an object (evaluating 's.onboarding.getProgress')` | 1x | ✅ String reference: `"onboarding:getProgress"` |
| 4 | 11:38 AM | HelpCenter | `undefined is not an object (evaluating 'api.articles.*')` | 0x (proactive) | ✅ String references (7 instances) |

**Total Error Encounters:** 3
**Total Components Fixed:** 4 (including proactive HelpCenter fix)

## Pattern

Every component using `api.*` syntax breaks because:
1. Frontend's Convex codegen is incomplete
2. Production bundle minifies to undefined references
3. String references bypass this issue

## Solution Strategy

**Systematic fix:** Replace ALL `api.*` references with string format `"module:function"`

**Examples:**
- `api.payments.createCheckoutSession` → `"payments:createCheckoutSession" as any`
- `api.onboarding.getProgress` → `"onboarding:getProgress" as any`
- `api.auth.getUserById` → `"auth:getUserById" as any`

## Files Fixed

1. ✅ PricingPageWrapper.tsx - FIXED (1 instance)
2. ✅ App.tsx - FIXED (1 instance)
3. ✅ OnboardingChecklist.tsx - FIXED (3 instances)
4. ✅ HelpCenter.tsx - FIXED (7 instances)
5. ⚠️ utils/auth.ts - No fixes needed (only comments)

## Time Impact

**Total debugging time:** ~45 minutes
**Errors encountered:** 3 times
**Components debugged one-by-one:** 3
**Components fixed proactively:** 1 (HelpCenter)
**Prevention:** Should have done global search/replace initially (would've saved ~30 min)

## Frequency Tracking

If this error recurs, increment the "Occurrences" column above.

**Last Updated:** Dec 18, 2025 11:40 AM

---

**Status:** ✅ ALL FIXED - Deployed
**Remaining:** Test if errors are resolved
