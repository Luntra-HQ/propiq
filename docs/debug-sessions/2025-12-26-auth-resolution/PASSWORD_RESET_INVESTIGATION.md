# Password Reset Page Crash Investigation
**Date:** December 26, 2025
**Issue:** Reset password page shows "Oops! Something went wrong"

## Test Result
```
Test 3 failed: ExpectError
Expected pattern: /reset|forgot/i
Received string: "Oops! Something went wrong"
```

## Investigation Steps

### 1. Backend API Status
✅ **WORKING** - Password reset API test passed:
- Test 8: Password Reset API - PASSED (802ms)
- Endpoint: POST /auth/request-password-reset
- Response: `{success: true}`

### 2. Frontend Component Analysis
Investigating: `/Users/briandusape/Projects/propiq/frontend/src/pages/ResetPasswordPage.tsx`


### 3. ROOT CAUSE IDENTIFIED! 🎯

**File:** `frontend/src/pages/ResetPasswordPage.tsx:12`

**Problem:**
```typescript
import { api } from '../convex/_generated/api';  // ❌ WRONG PATH
```

**Why it fails:**
- Convex generated API files are at PROJECT ROOT: `/convex/_generated/api.ts`
- Frontend is trying to import from: `/frontend/src/convex/_generated/api` (doesn't exist!)
- This causes React to crash with error boundary: "Oops! Something went wrong"

**Evidence:**
- Test shows: `Received string: "Oops! Something went wrong"`
- This is React's error boundary catching the import failure
- Backend API works fine (test passed), so issue is purely frontend import path

### 4. Solution

**Correct import path:**
```typescript
import { api } from '../../convex/_generated/api';  // ✅ CORRECT
```

Or check if there's a path alias configured in vite.config.ts


### 5. ACTUAL ROOT CAUSE - Symlink/Generated Files

**Discovery:**
- ✅ Frontend has symlink: `frontend/convex` → `../convex`
- ✅ Vite alias configured: `'../convex/_generated'` → `'./convex/_generated'`
- ❓ Need to verify: Are generated files accessible via symlink?

**Checking:**
```bash
ls -la /Users/briandusape/Projects/propiq/frontend/convex/_generated/
```


### 6. Verification - Generated Files

✅ Symlink working - files accessible at `/frontend/convex/_generated/`
✅ Generated files dated: Dec 25, 17:47:58

**Now checking:** Does `api.auth.verifyResetToken` exist in generated API?

