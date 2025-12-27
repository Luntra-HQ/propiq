# PropIQ Error Log
**Persistent error tracking across all Claude sessions**

---

## ✅ FIXED ERROR #1 - Password Reset Broken
**Date First Reported:** 2025-12-24
**Date Fixed:** 2025-12-24 (same day!)
**Status:** ✅ FIXED
**Occurrences:** Multiple (exact count unknown)

### Error Message:
```
TypeError: undefined is not an object (evaluating 'x.auth.verifyResetToken')
```

### Stack Trace:
```
b@https://propiq.luntra.one/assets/ResetPasswordPage-TX4sDyHG.js:1:400
de@https://propiq.luntra.one/assets/vendor-react-DS3QBTlo.js:1:26111
```

### Impact:
- ❌ Users cannot reset password
- ❌ Users cannot login
- ❌ New paid subscribers stuck (like bdusape@gmail.com with $1 FRIENDS promo)

### Root Cause:
Production site deployed with OLD Convex API schema. The `api.auth.verifyResetToken` function exists in Convex but production frontend was built before it was added.

### Files Affected:
- `frontend/src/pages/ResetPasswordPage.tsx` (line 49)
- Production deployment (propiq.luntra.one)
- Convex `_generated/api` files (out of date in production bundle)

### Solution - REBUILD & REDEPLOY:
```bash
# 1. Install bcryptjs
npm install bcryptjs

# 2. Fix dynamic import in convex/auth.ts (line 983)
# Changed: const bcrypt = await import("bcryptjs");
# To: import bcrypt from "bcryptjs"; (at top of file)

# 3. Deploy Convex
npx convex deploy --yes

# 4. Rebuild frontend
cd frontend && npm run build

# 5. Redeploy to Netlify
netlify deploy --prod --dir=dist
```

**Fix Applied:** 2025-12-24 at 6:02 AM
**Deployed To:** https://propiq.luntra.one

### User Impact:
- **bdusape@gmail.com** - Paid $1 (FRIENDS promo), cannot access account
- Stripe Customer: cus_TfS8sSuWVZqLjy
- Stripe Subscription: sub_1Si7DuJogOchEFxvFRBb7eVH

---

## Instructions for Future Claude Sessions:
1. Read this file first in every session about PropIQ bugs
2. Update occurrence count when error is reported
3. Mark as ✅ FIXED when resolved
4. Add new errors below with incremental numbers

---
