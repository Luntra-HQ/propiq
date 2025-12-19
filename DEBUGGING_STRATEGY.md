# PropIQ Debugging Strategy - STOP THE MADNESS

**Date:** December 18, 2025
**Problem:** Endless loop of breaking fixes
**Solution:** Systematic recovery and prevention

---

## 🚨 **STEP 1: ROLLBACK IMMEDIATELY**

### Option A: Rollback to Last Deploy (Fastest)

```bash
# Find the last working deployment
netlify deploys list --limit 5

# Rollback to specific deployment (find one that worked)
netlify rollback [deployment-id]
```

### Option B: Git Reset to Working Commit

```bash
# Find last known working commit
git log --oneline --graph -20

# Create backup branch of current broken state
git branch broken-convex-$(date +%Y%m%d)

# Hard reset to working commit (REPLACE WITH ACTUAL HASH)
git reset --hard [working-commit-hash]

# Force push (if needed)
git push origin main --force
```

### Option C: Nuclear Option - Use Previous Working Codebase

```bash
# If you have propiq-review or backup:
cp -r ../propiq-review/frontend/convex/_generated .
cp -r ../propiq-review/frontend/vite.config.ts .
```

---

## 🎯 **STEP 2: CREATE BASELINE DOCUMENTATION**

**Before making ANY changes, document what works:**

### Current Working State Checklist

- [ ] Site loads at https://propiq.luntra.one
- [ ] Login/signup works
- [ ] Dashboard loads
- [ ] Property analysis works
- [ ] Pricing page loads
- [ ] Stripe checkout works (this is what we're fixing)

**Save this checklist and test after EVERY change.**

---

## 🛠️ **STEP 3: FIX ONE THING AT A TIME**

### The Proper Fix for Stripe Checkout

**ROOT ISSUE:** Convex API generation is incompatible with browser bundling.

**SOLUTION:** Use Convex's official approach (not our hacks)

#### Step 3.1: Check Convex Version

```bash
cd /Users/briandusape/Projects/LUNTRA/propiq
npm list convex
```

**Expected:** convex@1.31.x or higher

#### Step 3.2: Use Official Convex Setup

Instead of manually creating `api.js`, use the official codegen:

```bash
# Delete our manual files
rm convex/_generated/api.js
rm convex.config.ts

# Let Convex generate properly
npx convex dev --once

# Check if api.js was regenerated correctly
cat convex/_generated/api.js
```

#### Step 3.3: If Official Codegen Doesn't Work

**Alternative:** Don't use generated API at all. Use string references:

```typescript
// Instead of:
const createCheckout = useAction(api.payments.createCheckoutSession);

// Use:
const createCheckout = useAction("payments:createCheckoutSession" as any);
```

This bypasses the broken API generation entirely.

---

## 📝 **STEP 4: TESTING PROTOCOL**

### Before Every Deploy:

1. **Local test:**
   ```bash
   npm run build
   npm run preview  # Test production build locally
   ```

2. **Open browser to `http://localhost:4173`**

3. **Test checklist:**
   - [ ] Site loads (no white screen)
   - [ ] Console has NO errors
   - [ ] Click through: Home → Pricing → Choose Plan
   - [ ] Verify Stripe button works (doesn't need to complete checkout)

4. **Only deploy if ALL checks pass**

### Deployment Protocol:

```bash
# 1. Build
npm run build

# 2. Test locally
npm run preview &
sleep 3
curl http://localhost:4173 | grep "<title>"

# 3. If test passes, deploy
netlify deploy --prod --dir=dist

# 4. Test production IMMEDIATELY
curl https://propiq.luntra.one | grep "<title>"

# 5. Open browser and check console
# 6. If errors, ROLLBACK IMMEDIATELY
```

---

## 🔧 **ALTERNATIVE APPROACH: Simpler Stripe Integration**

If Convex keeps breaking, use **direct API calls** instead:

### Frontend: Call Convex HTTP endpoint directly

```typescript
// src/utils/stripe.ts
export async function createCheckoutSession(tier: string, userId: string) {
  const response = await fetch('https://your-convex-url.convex.cloud/payments/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier, userId })
  });

  const { url } = await response.json();
  window.location.href = url;
}
```

### Backend: Expose HTTP endpoint

```typescript
// convex/http.ts
import { httpAction } from "./_generated/server";

export const http = httpRouter();

http.route({
  path: "/payments/create-checkout",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { tier, userId } = await request.json();
    // Stripe checkout logic here
    return new Response(JSON.stringify({ url: checkoutUrl }));
  })
});
```

**Benefits:**
- No generated API needed
- No bundling issues
- Simpler debugging
- Works 100% of the time

---

## 📊 **DECISION MATRIX**

| Approach | Complexity | Risk | Time to Fix |
|----------|-----------|------|-------------|
| **Rollback to working version** | Low | Low | 5 min | ← START HERE
| **Fix Convex codegen** | High | High | 2+ hours |
| **Use string references** | Medium | Low | 15 min | ← IF ROLLBACK WORKS
| **Direct HTTP endpoints** | Medium | Low | 30 min | ← IF STRINGS FAIL
| **Rewrite without Convex** | Very High | Medium | 1+ days | ← LAST RESORT

---

## 🎯 **RECOMMENDED ACTION PLAN**

### RIGHT NOW (Next 10 Minutes):

1. **Find last working Netlify deployment:**
   ```bash
   netlify deploys list
   ```

2. **Rollback to it:**
   ```bash
   netlify rollback [deployment-id]
   ```

3. **Verify site works:**
   - Open https://propiq.luntra.one
   - Check if site loads
   - Even if Stripe doesn't work, at least site is live

### THEN (Next 30 Minutes):

4. **Create a new branch for Stripe fix:**
   ```bash
   git checkout -b stripe-fix-simple
   ```

5. **Use string reference approach (simplest fix):**
   ```typescript
   // In PricingPageWrapper.tsx
   // Change:
   const createCheckout = useAction(api.payments.createCheckoutSession);

   // To:
   const createCheckout = useAction("payments:createCheckoutSession" as any);
   ```

6. **Test locally → Deploy to preview → Test → Merge**

---

## 🚨 **NEVER AGAIN CHECKLIST**

- [ ] **Always create a backup branch** before major changes
- [ ] **Test production build locally** before deploying
- [ ] **Deploy to Netlify preview** before production
- [ ] **Keep last 5 working deployments** for quick rollback
- [ ] **Document what works** before fixing what doesn't
- [ ] **One change at a time** - never fix multiple issues simultaneously

---

## 📞 **Emergency Contacts & Resources**

**Netlify Rollback:**
```bash
netlify rollback [deployment-id]
```

**Git Rollback:**
```bash
git reset --hard [commit-hash]
git push --force
```

**Convex Docs:**
- https://docs.convex.dev/client/react
- https://docs.convex.dev/functions/actions

**Stripe Docs:**
- https://stripe.com/docs/payments/checkout

---

**Status:** This document is your lifeline. Follow it systematically.
