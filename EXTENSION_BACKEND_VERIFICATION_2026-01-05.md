# Extension Backend Migration & P0 Status Verification
## Completed: January 5, 2026

**Report:** Verification of remaining P0 issues from November 2025 Production Readiness Audit
**Status:** 3 of 4 remaining P0 issues verified
**Priority Order:** RICE scores (highest to lowest)

---

## Executive Summary

After fixing the top 2 P0 issues (Stripe webhook + subscription cancellation), I verified the status of the remaining 4 P0 blockers from November 2025:

| P0 Issue | RICE | November Status | **January Status** | Verified |
|----------|------|-----------------|-------------------|----------|
| **#2: Extension Backend Mismatch** | 1500 | 🔴 BLOCKER | ✅ **FIXED** | Yes |
| **#5: Analysis Race Condition** | 1200 | 🔴 BLOCKER | 🔴 **NOT FIXED** | Yes |
| **#8: Failed Analysis Charging** | 1200 | 🔴 BLOCKER | ✅ **FIXED** | Yes |
| **#4: Email Verification** | 400 | 🔴 BLOCKER | 🔴 **NOT IMPLEMENTED** | Yes |

**Good News:** 2 issues are already fixed (extension + failed charging)
**Critical:** 2 issues remain unfixed (race condition + email verification)

---

## Detailed Findings

### ✅ P0 #2: Extension Backend Mismatch (RICE 1500) - FIXED

**November 2025 Issue:**
> Extension points to wrong backend (FastAPI vs Convex mismatch)
> File: `propiq-extension/src/shared/api-client.ts:45` → Points to FastAPI
> Should point to Convex: `{CONVEX_URL}/propiq/analyze`

**Investigation Results:**

**Extension Location:** `/Users/briandusape/Projects/propiq-extension/`

**Current Configuration (January 2026):**
```typescript
// propiq-extension/src/shared/api-client.ts:129
const response = await fetch('https://mild-tern-361.convex.site/propiq/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.accessToken}`,
  },
  body: JSON.stringify(request),
});
```

**Verification:**
- ✅ Extension uses `https://mild-tern-361.convex.site` (Convex HTTP endpoint)
- ✅ Frontend uses `https://mild-tern-361.convex.cloud` (Convex WebSocket)
- ✅ Per `frontend/src/hooks/useAuth.tsx:18` comment:
  ```typescript
  // HTTP endpoints use .convex.site (not .convex.cloud which is for WebSocket)
  const CONVEX_HTTP_URL = import.meta.env.VITE_CONVEX_URL?.replace('.convex.cloud', '.convex.site') || '';
  ```

**Convex URL Explanation:**
- `.convex.cloud` = WebSocket connections (realtime database queries)
- `.convex.site` = HTTP REST endpoints (actions/mutations)

**Status:** ✅ **FIXED** - Extension correctly uses Convex `.convex.site` endpoint

**When Fixed:** Unknown (sometime between Nov 2025 and Jan 2026)

**Evidence:** `propiq-extension/src/shared/api-client.ts:129`

---

### 🔴 P0 #5: Analysis Limit Race Condition (RICE 1200) - NOT FIXED

**November 2025 Issue:**
> Check limit + increment counter = 2 separate operations
> User clicks 3× fast → race condition → exceeds limit

**Investigation Results:**

**File:** `convex/propiq.ts`

**Current Code (Lines 22-70):**
```typescript
export const analyzeProperty = action({
  handler: async (ctx, args) => {
    try {
      // 1. CHECK LIMIT (query - read operation)
      const user = await ctx.runQuery(api.auth.getUser, { userId: args.userId });

      if (user.analysesUsed >= user.analysesLimit) {
        throw new Error("Analysis limit reached");
      }

      // 2. GENERATE ANALYSIS (slow OpenAI call - 2-5 seconds)
      const analysisResult = await generateAIAnalysis(args);

      // 3. SAVE ANALYSIS (mutation)
      await ctx.runMutation(api.propiq.saveAnalysis, { ... });

      // 4. INCREMENT COUNTER (separate mutation)
      await ctx.runMutation(api.propiq.incrementAnalysisCount, { userId: args.userId });

      return { success: true, ... };
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  },
});
```

**Race Condition Scenario:**
1. User with 1 remaining analysis clicks "Analyze" 3 times quickly
2. **Time T0:** Request #1 checks limit (0/1 ✅ pass) → starts analysis
3. **Time T0+10ms:** Request #2 checks limit (0/1 ✅ pass) → starts analysis
4. **Time T0+20ms:** Request #3 checks limit (0/1 ✅ pass) → starts analysis
5. **Time T0+3s:** Request #1 completes → increments counter (1/1)
6. **Time T0+4s:** Request #2 completes → increments counter (2/1 ❌ over limit!)
7. **Time T0+5s:** Request #3 completes → increments counter (3/1 ❌ WAY over!)

**Result:** User charged for 3 analyses when limit was 1.

**Why This Happens:**
- The limit check (line 31) and increment (line 57) are **separate operations**
- Between check and increment: 2-5 seconds (OpenAI API call)
- Multiple requests can all pass the check before ANY increment happens

**Required Fix:**
Move limit check + increment into a **SINGLE atomic mutation** that runs BEFORE the analysis:

```typescript
// NEW FUNCTION (needs to be created):
export const reserveAnalysisSlot = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) throw new Error("User not found");

    // ATOMIC: Check + increment in single transaction
    if (user.analysesUsed >= user.analysesLimit) {
      throw new Error("Analysis limit reached");
    }

    // Increment IMMEDIATELY (reserves the slot)
    await ctx.db.patch(args.userId, {
      analysesUsed: user.analysesUsed + 1,
      updatedAt: Date.now(),
    });

    return { success: true, analysesRemaining: user.analysesLimit - user.analysesUsed - 1 };
  },
});

// UPDATED analyzeProperty:
export const analyzeProperty = action({
  handler: async (ctx, args) => {
    // 1. Reserve slot FIRST (atomic check + increment)
    await ctx.runMutation(api.propiq.reserveAnalysisSlot, { userId: args.userId });

    try {
      // 2. Generate analysis (can take 5+ seconds)
      const analysisResult = await generateAIAnalysis(args);

      // 3. Save analysis
      await ctx.runMutation(api.propiq.saveAnalysis, { ... });

      return { success: true };
    } catch (error) {
      // 4. If analysis fails, DECREMENT counter (refund the slot)
      await ctx.runMutation(api.propiq.decrementAnalysisCount, { userId: args.userId });
      throw error;
    }
  },
});
```

**Status:** 🔴 **NOT FIXED** - Race condition still exists

**Business Impact:**
- Users can exceed their analysis limits
- Revenue loss: Users get free analyses
- Support burden: Confused users seeing wrong counts

**Effort to Fix:** 4 hours (create atomic mutation + add rollback logic)

**Priority:** 🔴 **CRITICAL** - Fix before production launch

**Evidence:** `convex/propiq.ts:31-57`

---

### ✅ P0 #8: Charges for Failed Analyses (RICE 1200) - FIXED

**November 2025 Issue:**
> Increment happens even if analysis fails
> Users lose credits when OpenAI errors occur

**Investigation Results:**

**File:** `convex/propiq.ts`

**Current Code Flow (Lines 22-70):**
```typescript
export const analyzeProperty = action({
  handler: async (ctx, args) => {
    try {
      // 1. Check limit
      const user = await ctx.runQuery(api.auth.getUser, { userId: args.userId });

      // 2. Generate analysis (may throw error)
      const analysisResult = await generateAIAnalysis(args);

      // 3. Save analysis (may throw error)
      await ctx.runMutation(api.propiq.saveAnalysis, { ... });

      // 4. Increment counter (ONLY REACHED IF ABOVE STEPS SUCCEED)
      await ctx.runMutation(api.propiq.incrementAnalysisCount, { userId: args.userId });

      return { success: true };
    } catch (error) {
      // If error thrown above, increment is NEVER called
      throw new Error(`Analysis failed: ${error.message}`);
    }
  },
});
```

**Key Finding:** Counter increment (line 57) only happens AFTER:
1. ✅ `generateAIAnalysis()` succeeds (line 38)
2. ✅ `saveAnalysis()` succeeds (line 41)

**If Either Fails:**
- Error thrown in try block (line 65)
- Increment never reached
- User keeps their credit ✅

**Test Scenarios:**

| Scenario | Line | Counter Incremented? | Correct? |
|----------|------|---------------------|----------|
| OpenAI API error | 38 | ❌ No | ✅ Correct |
| Database save fails | 41 | ❌ No | ✅ Correct |
| Success | 57 | ✅ Yes | ✅ Correct |

**Status:** ✅ **FIXED** - Counter only increments on successful analysis

**When Fixed:** Unknown (sometime between Nov 2025 and Jan 2026)

**Evidence:** `convex/propiq.ts:22-70` (counter increment is AFTER all error-prone operations)

---

### 🔴 P0 #4: No Email Verification (RICE 400) - NOT IMPLEMENTED

**November 2025 Issue:**
> No email verification on signup
> Users can create accounts with fake emails

**Investigation Results:**

**File:** `convex/auth.ts`

**Signup Flow (Lines 75-108):**
```typescript
export const signup = mutation({
  handler: async (ctx, args) => {
    // 1. Check if email exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // 2. Hash password
    const passwordHash = await hashPassword(args.password);

    // 3. Create user
    const userId = await ctx.db.insert("users", {
      email,
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      company: args.company,
      subscriptionTier: "free",
      analysesUsed: 0,
      analysesLimit: 3,
      active: true,
      emailVerified: false,  // ⚠️ Set to false but never verified!
      createdAt: Date.now(),
    });

    // 4. Return success (no email sent!)
    return {
      success: true,
      userId: userId.toString(),
      email,
      subscriptionTier: "free",
      analysesLimit: 3,
      message: "Account created successfully",
    };
  },
});
```

**Key Findings:**

1. ✅ Schema has `emailVerified: v.boolean()` field (line 95)
2. ✅ Resend API configured for password reset emails (convex/http.ts:389)
3. ❌ **NO email verification sent on signup**
4. ❌ Users can login immediately without verifying email
5. ❌ No verification endpoint exists

**Current Behavior:**
- User signs up with `fake@example.com`
- `emailVerified` set to `false`
- User can login and use app immediately
- No verification required

**Required Implementation:**

1. **Create verification token mutation:**
```typescript
export const createEmailVerificationToken = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.insert("emailVerifications", {
      userId: args.userId,
      token,
      expiresAt,
      used: false,
    });

    return { token };
  },
});
```

2. **Send verification email (after signup):**
```typescript
// In signup mutation, after creating user:
const { token } = await ctx.runMutation(api.auth.createEmailVerificationToken, { userId });

const verificationUrl = `https://propiq.luntra.one/verify-email?token=${token}`;

const emailResponse = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "PropIQ <noreply@propiq.luntra.one>",
    to: email,
    subject: "Verify your PropIQ email",
    html: `<p>Click to verify: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  }),
});
```

3. **Add verification endpoint:**
```typescript
http.route({
  path: "/verify-email",
  method: "POST",
  handler: async (ctx, request) => {
    const { token } = await request.json();

    const verification = await ctx.db
      .query("emailVerifications")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!verification || verification.used || verification.expiresAt < Date.now()) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 400 });
    }

    await ctx.db.patch(verification.userId, { emailVerified: true });
    await ctx.db.patch(verification._id, { used: true });

    return new Response(JSON.stringify({ success: true }));
  },
});
```

4. **Update schema:**
```typescript
emailVerifications: defineTable({
  userId: v.id("users"),
  token: v.string(),
  expiresAt: v.number(),
  used: v.boolean(),
})
  .index("by_token", ["token"])
  .index("by_user", ["userId"]),
```

**Status:** 🔴 **NOT IMPLEMENTED** - Email verification completely missing

**Business Impact:**
- Users can create accounts with fake emails
- No way to contact users about important updates
- Support burden: Can't reset passwords for fake emails
- Spam/abuse risk: Bots can create unlimited accounts

**Effort to Fix:** 1.5 weeks (schema + mutations + endpoints + frontend)

**Priority:** 🔴 **BLOCKER** - Required before production

**Evidence:** `convex/auth.ts:75-108` (no email sending after signup)

---

## Summary Status Table

| P0 Issue | RICE | Status | Files | Fix Effort |
|----------|------|--------|-------|------------|
| #2: Extension Backend | 1500 | ✅ **FIXED** | `propiq-extension/src/shared/api-client.ts:129` | N/A |
| #5: Race Condition | 1200 | 🔴 **NOT FIXED** | `convex/propiq.ts:31-57` | 4 hours |
| #8: Failed Charging | 1200 | ✅ **FIXED** | `convex/propiq.ts:22-70` | N/A |
| #4: Email Verification | 400 | 🔴 **NOT IMPLEMENTED** | `convex/auth.ts:75-108` | 1.5 weeks |

**Total Remaining Effort:** ~2 weeks

---

## Recommended Next Steps

### Immediate (This Week):

1. **Fix Analysis Race Condition** (4 hours) - RICE 1200
   - Create `reserveAnalysisSlot` atomic mutation
   - Add rollback logic for failed analyses
   - Test with concurrent requests

### Short-term (Next 2 Weeks):

2. **Implement Email Verification** (1.5 weeks) - RICE 400
   - Add `emailVerifications` schema
   - Create verification token generation
   - Build email sending logic (Resend)
   - Add verification endpoint
   - Build frontend verification page
   - Update signup flow

### Testing:

3. **Verification Testing**
   - Race condition: Use concurrent API requests
   - Email verification: Test signup → email → verify flow
   - Failed analysis charging: Simulate OpenAI errors

---

## Cross-Reference

**Related Documents:**
- `PRODUCTION_READINESS_REPORT.md` - November 2025 original audit
- `P0_ISSUES_CROSS_REFERENCE_2026-01-05.md` - Today's P0 status summary
- `STRIPE_WEBHOOK_SECURITY_FIX_2026-01-05.md` - Webhook fix (P0 #1)
- `SUBSCRIPTION_CANCELLATION_FIX_2026-01-05.md` - Cancellation fix (P0 #6)

**P0 Progress:**
- **Total P0 Issues (Nov 2025):** 12
- **Fixed Before Today:** 3 (onboarding, password validation, forgot password link)
- **Fixed Today:** 2 (webhook signature, subscription cancellation)
- **Already Fixed (Verified Today):** 2 (extension backend, failed charging)
- **Remaining:** 5 (race condition, email verification, + 3 not yet examined)

**Overall Progress:** 7/12 P0 issues resolved (58%)

---

**Report Generated:** January 5, 2026, 10:45 AM PST
**Next Action:** Fix analysis race condition (4 hours)
**Deployment Status:** Extension + Web App both on Convex ✅

