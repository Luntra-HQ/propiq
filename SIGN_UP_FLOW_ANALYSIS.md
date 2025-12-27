# Sign-Up Flow Analysis

**Created:** December 19, 2025
**Status:** ACTIVE INVESTIGATION

---

## 🔍 Sign-Up Flow Map

### Frontend → Backend → Database

```
1. User fills form (SignupFlow.tsx)
   ↓
2. Frontend validates (email format, password strength)
   ↓
3. POST to /auth/signup (Convex HTTP endpoint)
   ↓
4. signupWithSession mutation (convex/auth.ts)
   ↓
5. Create user in Convex database
   ↓
6. Create session token
   ↓
7. Return to frontend
   ↓
8. Store in localStorage (handleAuthSuccess)
   ↓
9. Redirect to dashboard / onSuccess callback
```

---

## ⚠️ **Potential Failure Points Identified**

### 1. Password Validation Mismatch (HIGH RISK)
**Location:** `convex/auth.ts` line 25-53
**Issue:** Backend requires:
- ✅ 12+ characters (but frontend only checks 8+)
- ✅ Uppercase letter
- ✅ Lowercase letter
- ✅ Number
- ✅ Special character
- ✅ Not a common password

**Frontend:** `SignupFlow.tsx` line 67
- ❌ Only checks: `password.length >= 8`
- ❌ Missing: uppercase, lowercase, number, special char checks
- ❌ Missing: common password check

**Result:** User sees "green checkmark" on frontend, but backend REJECTS signup!

**User Experience:**
- Form shows "Strong" password
- User clicks "Sign Up"
- Backend returns error
- **Appears to crash** (unexpected error state)

**Fix Priority:** P0 - CRITICAL

---

### 2. Session Token Not Created (MEDIUM RISK)
**Location:** `SignupFlow.tsx` line 110-112
**Issue:** Code checks `if (result.sessionToken)` but doesn't handle missing token

**Potential Scenario:**
- Signup succeeds (user created)
- Session token generation fails
- User redirected but not authenticated
- Next action requires auth → **crash**

**Fix Priority:** P1

---

### 3. Property Analysis Save Failure (HIGH RISK)
**Location:** Need to check property analysis mutation
**Issue:** Reports don't save to accounts

**Hypothesis:**
- User creates analysis
- Analysis API call succeeds
- But `userId` association fails
- Report exists but orphaned (no owner)

**Need to check:**
- `convex/propiq.ts` - analyze property mutation
- Does it verify userId before saving?
- Does it handle auth token expiry?

**Fix Priority:** P0 - CRITICAL

---

### 4. Race Condition: Navigation Before Save (MEDIUM RISK)
**Location:** `SignupFlow.tsx` line 121
**Issue:** `onSuccess(result.user)` might trigger navigation before localStorage completes

**Code:**
```typescript
// Store auth data
handleAuthSuccess(...); // Async?

// Store session token
localStorage.setItem(...); // Sync but might not complete

// Immediately trigger navigation
onSuccess(result.user); // Might navigate away before storage completes
```

**Result:** User navigates to dashboard, localStorage incomplete, next API call fails

**Fix Priority:** P2

---

## 🧪 **Quick Diagnostic Tests**

### Test 1: Password Validation Mismatch
**Try to sign up with:**
- Email: `test@test.com`
- Password: `password` (8 chars, no uppercase/special)

**Expected:** Frontend shows "Weak" → backend rejects
**If this causes crash:** CONFIRMED BUG #1

---

### Test 2: Check Existing Failed Signups
**Query Convex:**
```typescript
// How many users exist?
// How many have sessions?
// Are there users without sessions? (orphaned signups)
```

---

### Test 3: Check Property Analyses Ownership
**Query Convex:**
```typescript
// How many propertyAnalyses exist?
// How many have null/undefined userId?
// Are there orphaned analyses?
```

---

## 🎯 **Immediate Action Items**

### P0 - Fix Password Validation Mismatch
**Time:** 15 minutes
**Steps:**
1. Update frontend validation to match backend (12 chars, uppercase, lowercase, number, special)
2. Add real-time validation feedback
3. Show specific requirements that are missing
4. Test with weak password

### P0 - Investigate Property Analysis Save Failure
**Time:** 30 minutes
**Steps:**
1. Read `convex/propiq.ts` analyze mutation
2. Check if userId is required
3. Check auth token validation
4. Add error handling for missing userId

### P1 - Add Session Token Error Handling
**Time:** 10 minutes
**Steps:**
1. Check if `signupWithSession` always returns sessionToken
2. Add fallback if token is missing
3. Show error to user instead of silent failure

---

## 📊 **Questions for User**

To narrow down the exact issue, please answer:

1. **When does signup crash?**
   - [ ] Immediately when clicking "Sign Up" button
   - [ ] After seeing loading spinner
   - [ ] After appearing to succeed (redirects then crashes)
   - [ ] Different times (inconsistent)

2. **What password do users typically use?**
   - [ ] Simple (8 chars, lowercase only) → Confirms Bug #1
   - [ ] Complex (12+ chars, mixed case, special) → Different issue

3. **For report saving:**
   - [ ] Reports never save (always lost)
   - [ ] Reports sometimes save (intermittent)
   - [ ] Reports save but disappear later
   - [ ] Can't tell / haven't checked database

4. **Can you access Convex dashboard?**
   - [ ] Yes, I can query the database
   - [ ] No, don't have access
   - If yes, run these queries and paste results:
     ```
     // Count users
     // Count sessions
     // Count propertyAnalyses
     // Count propertyAnalyses with no userId
     ```

---

## 🔧 **Root Cause Hypothesis**

**PRIMARY SUSPECT: Password Validation Mismatch**

**Confidence:** 80%

**Reasoning:**
- Frontend validates password as "8+ chars"
- Backend requires "12+ chars + complexity"
- This would cause **exactly** the symptoms described:
  - Crashes "at different moments" (whenever user picks weak password)
  - Appears random (depends on password chosen)
  - User sees green checkmark → backend rejects → unexpected error

**Test:** Try signup with "password123" (11 chars) → Should fail
**Test:** Try signup with "Password123!" (13 chars with complexity) → Should succeed

---

**NEXT STEP:** Answer diagnostic questions above, or let me run Test 1 with current code.
