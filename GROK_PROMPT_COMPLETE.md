# COMPLETE GROK PROMPT - PropIQ Auth Deployment Issue

## CONTEXT
I have a React + Vite + TypeScript app with Convex backend deployed to Netlify. Users cannot sign up or reset passwords because auth functions are undefined at runtime, despite successful deployments.

---

## THE PROBLEM

**User-facing error:**
```
TypeError: undefined is not an object (evaluating 'x.auth.verifyResetToken')

Stack trace:
b@https://propiq.luntra.one/assets/ResetPasswordPage-TX4sDyHG.js:1:400
de@https://propiq.luntra.one/assets/vendor-react-DS3QBTlo.js:1:26111
```

**Also occurs with:**
- `auth.changePassword` - undefined
- `auth.verifyResetToken` - undefined

**Symptoms:**
- Persists across multiple deployments
- Happens to ALL users, not just one browser
- Hard refresh (Cmd+Shift+R) doesn't fix it
- Old asset hash still loads: `ResetPasswordPage-TX4sDyHG.js`
- Issue ongoing for weeks

---

## TECH STACK

- **Frontend:** React 18.3.1 + Vite 7.3.0 + TypeScript
- **Backend:** Convex (https://mild-tern-361.convex.cloud)
- **Hosting:** Netlify (propiq.luntra.one)
- **Build:** Vite with lazy-loaded routes (React.lazy)
- **Auth:** Custom Convex auth with bcrypt password hashing

---

## WHAT WE'VE DONE

### 1. Fixed bcryptjs Import Issue
**Problem:** `const bcrypt = await import("bcryptjs")` caused Convex deploy to fail
**Fix:** Changed to static import: `import bcrypt from "bcryptjs"`
**Result:** ✅ Convex deploys successfully now

### 2. Deployed Convex Functions
```bash
npm install bcryptjs
npx convex deploy --yes
```
**Output:** ✅ Deployed successfully to https://mild-tern-361.convex.cloud

### 3. Rebuilt Frontend (Multiple Times)
```bash
cd frontend
rm -rf dist
rm -rf node_modules/.vite
npm run build
```
**Output:** ✅ Build succeeds, but generates SAME asset hash: `ResetPasswordPage-TX4sDyHG.js`

### 4. Deployed to Netlify (Multiple Times)
```bash
netlify deploy --prod --dir=dist
```
**Output:** ✅ Deploy succeeds, CDN shows "Deploy is live!"

### 5. Tried Convex Codegen
```bash
npx convex codegen
```
**Output:** ⚠️ Runs without error, but `_generated/api.d.ts` timestamp UNCHANGED (Dec 21, not Dec 25)

---

## DIAGNOSTIC DATA

### Convex Environment Variables (CONFIRMED SET):
```
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
STRIPE_SECRET_KEY=sk_live_*** (configured)
IS_PRODUCTION_ENV=true
```

### Build Output Hash (CRITICAL FINDING):
```bash
$ ls -la frontend/dist/assets/*ResetPasswordPage*.js
-rw-r--r--  ResetPasswordPage-TX4sDyHG.js  (Dec 25 01:01)
```
**This is the OLD hash from weeks ago!** Build is not generating new hashes.

### Convex API Generation Status:
```bash
$ ls -la convex/_generated/api.d.ts
-rw-r--r--  api.d.ts  (Dec 21 12:21:04) ← 4 DAYS OLD!
```

### API File Content:
```typescript
import type * as auth from "../auth.js";
// ...
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  // ...
}>;
```
**Note:** File imports `auth` module but runtime shows functions as undefined.

### Source File Verification:
```bash
$ grep "export.*verifyResetToken" convex/auth.ts
export const verifyResetToken = query({

$ grep "export.*changePassword" convex/auth.ts
export const changePassword = mutation({
```
**Both functions EXIST in source code.**

### No Service Worker:
```bash
$ ls -la frontend/dist/sw.js
No service worker found
```

### Production Index.HTML:
```bash
$ curl -s https://propiq.luntra.one/ | grep -i "script"
<script type="module" crossorigin src="/assets/index-C-bSLu8g.js"></script>
```
Loads main bundle, which lazy-loads `ResetPasswordPage-TX4sDyHG.js`.

---

## KEY FINDINGS

1. **Vite generates SAME hash every build**
   - Content hasn't changed (from Vite's perspective)
   - Deterministic hashing: same source = same hash
   - Even after deleting dist/ and .vite cache

2. **Convex `_generated` files are stale**
   - Last updated Dec 21 (4 days ago)
   - `npx convex codegen` runs but doesn't update timestamp
   - `npx convex deploy` deploys backend but doesn't regenerate local API files

3. **Functions exist in source but not in generated API**
   - `convex/auth.ts` has `verifyResetToken` and `changePassword`
   - But these functions throw "undefined" errors at runtime
   - Suggests deployed Convex functions ≠ local source code

---

## HYPOTHESES

### Hypothesis A: Convex Deploy/Codegen Mismatch
- `npx convex deploy` updates cloud but not local `_generated` files
- Frontend builds with stale API definitions
- Runtime calls functions that don't exist in deployed backend

### Hypothesis B: Vite Build Cache Issue
- Vite thinks nothing changed (hash unchanged)
- Source files using old Convex API imports
- Need to force complete rebuild

### Hypothesis C: Netlify CDN Caching
- Netlify serves old files despite new deployment
- CDN cache not invalidating properly
- But research shows Netlify auto-invalidates on deploy

### Hypothesis D: Frontend Symlink Issue
- `frontend/convex` → `../convex` symlink exists
- Symlink might point to stale generated files
- Vite bundles old API definitions

---

## SPECIFIC QUESTIONS FOR GROK

1. **Why does `npx convex codegen` not update `_generated/api.d.ts` timestamp?**
   - Should it regenerate files automatically?
   - Is there an error being silently swallowed?

2. **What's the correct workflow to sync Convex deploy → local API → frontend build?**
   - Should we run `npx convex dev` even in production workflow?
   - Is `npx convex codegen` sufficient?

3. **Why does Vite generate the same hash despite Convex API changes?**
   - Does Vite detect changes in symlinked files?
   - Should we explicitly invalidate Vite cache?

4. **How do other Convex + Vite projects handle this?**
   - Is there a recommended build pipeline?
   - Any known issues with Convex codegen + Vite bundling?

5. **Could this be a TypeScript vs JavaScript mismatch?**
   - TypeScript types say functions exist
   - But JavaScript runtime doesn't have them
   - How to verify deployed Convex functions match local?

---

## WHAT I NEED FROM GROK

### 1. Root Cause Analysis
- Which hypothesis is correct (A, B, C, or D)?
- Exact technical reason for the mismatch

### 2. Step-by-Step Fix
```bash
# Provide exact commands in order
# Include verification steps between each command
```

### 3. Verification Method
- How to confirm Convex functions are deployed correctly
- How to test API definitions match deployed functions
- How to verify frontend is using fresh API

### 4. Prevention Strategy
- Build script changes to prevent recurrence
- Netlify build command updates
- Convex deployment best practices

### 5. Production Deployment Checklist
```
[ ] Step 1: ...
[ ] Step 2: ...
[ ] Verification: ...
```

---

## CONSTRAINTS

- ❌ No manual workarounds (need systematic fix for ALL users)
- ❌ Cannot require users to clear browser cache
- ✅ Must work for both new signups and password resets
- ✅ Must prevent issue from recurring
- ✅ Production-ready solution only

---

## EXPECTED OUTPUT

Please provide a response in this format:

### 1. ROOT CAUSE
[One clear sentence explaining the exact technical issue]

### 2. WHY IT'S HAPPENING
[2-3 paragraphs explaining the mechanism]

### 3. THE FIX (Step-by-Step)
```bash
# Command 1
[explanation]

# Command 2
[explanation]

# Verification
[how to confirm it worked]
```

### 4. PREVENT RECURRENCE
```json
// vite.config.ts changes
// netlify.toml changes
// package.json script updates
```

### 5. FINAL VERIFICATION
[Exact steps to test with a real user signup]

---

## ADDITIONAL CONTEXT

- We've been fighting this for **weeks**
- Multiple deployments haven't fixed it
- User has paid subscription ($1 FRIENDS promo) and can't access account
- This is blocking ALL user signups
- Need solution ASAP

---

**Thank you for your help! This is a production blocker.**
