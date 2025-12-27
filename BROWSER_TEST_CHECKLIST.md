# Browser Testing Checklist - Auth Fix Verification

**Server Running:** http://localhost:5173/
**Date:** December 25, 2025

---

## TEST 1: Password Reset Page Load

### **URL to Test:**
```
http://localhost:5173/reset-password?token=test123
```

### **What to Check:**

#### ✅ **SUCCESS Indicators:**
- [ ] Page loads without errors
- [ ] Email field appears (even if disabled/pre-filled)
- [ ] Password input fields render
- [ ] NO error in console: `undefined is not an object (evaluating 'x.auth.verifyResetToken')`
- [ ] Browser DevTools → Console shows successful API calls
- [ ] Browser DevTools → Network tab shows requests to `mild-tern-361.convex.site`

#### ❌ **FAILURE Indicators:**
- [ ] Blank white page
- [ ] Console error: `undefined is not an object`
- [ ] Console error about missing imports
- [ ] Network requests going to `diligent-starling-125.convex.site` (OLD deployment)
- [ ] TypeScript errors about api.auth

### **Expected Behavior:**
- Token validation will fail (expected - using fake token)
- Should show error message: "Invalid or expired reset token"
- **This is GOOD** - means the function is accessible and running

### **What We're Verifying:**
- `api.auth.verifyResetToken` is importable ✅
- Frontend can connect to correct Convex deployment ✅
- No TypeScript/import errors ✅

---

## TEST 2: Settings Page (Change Password)

### **URL to Test:**
```
http://localhost:5173/settings
```

Or navigate through the app:
1. Login (if not already)
2. Click Settings/Account menu
3. Click Security tab

### **What to Check:**

#### ✅ **SUCCESS Indicators:**
- [ ] Settings page loads
- [ ] Can navigate to Security tab
- [ ] Change Password form renders with fields:
  - [ ] Current Password field
  - [ ] New Password field
  - [ ] Confirm Password field
- [ ] NO error in console: `undefined is not an object (evaluating 'ee.auth.changePassword')`
- [ ] Form validation messages appear (if trying to submit)
- [ ] Password strength indicator shows (if implemented)

#### ❌ **FAILURE Indicators:**
- [ ] Console error about changePassword being undefined
- [ ] Form doesn't render
- [ ] Submit button missing or broken
- [ ] TypeScript errors in console

### **What We're Verifying:**
- `api.auth.changePassword` is importable ✅
- Change password component renders ✅
- No runtime import errors ✅

---

## TEST 3: Network Tab Verification

### **Open Browser DevTools:**
1. Press `F12` or `Cmd+Option+I`
2. Go to **Network** tab
3. Reload the page or trigger an API call

### **What to Check:**

#### ✅ **SUCCESS Indicators:**
- [ ] API requests show domain: `mild-tern-361.convex.site`
- [ ] Request headers include proper CORS
- [ ] Response status codes are appropriate (200, 400, 401, etc.)
- [ ] No 404 errors for Convex API endpoints

#### ❌ **FAILURE Indicators:**
- [ ] Requests going to `diligent-starling-125.convex.site` (OLD!)
- [ ] CORS errors
- [ ] 404 errors on API endpoints
- [ ] Network errors or timeouts

### **How to Find:**
1. Filter network requests by "convex"
2. Look at the "Domain" column
3. Should be: `mild-tern-361.convex.site`

---

## TEST 4: Console Log Inspection

### **Open Browser DevTools Console:**
1. Press `F12` or `Cmd+Option+I`
2. Go to **Console** tab

### **What to Look For:**

#### ✅ **GOOD Messages:**
```javascript
[AUTH] Fetching current user with token...
[AUTH] /me response: { authenticated: true, ... }
[Reset Password] Token verification...
// Any log messages that show successful execution
```

#### ❌ **BAD Messages (Should NOT Appear):**
```javascript
❌ undefined is not an object (evaluating 'x.auth.verifyResetToken')
❌ undefined is not an object (evaluating 'ee.auth.changePassword')
❌ Cannot read property 'verifyResetToken' of undefined
❌ Module not found: convex/_generated/api
❌ TypeError: api.auth.verifyResetToken is not a function
```

---

## TEST 5: Login Flow (Bonus)

### **URL to Test:**
```
http://localhost:5173/login
```

### **What to Check:**
- [ ] Login form renders
- [ ] Can enter email/password
- [ ] "Forgot Password" link works
- [ ] Clicking it goes to password reset page
- [ ] No console errors

---

## QUICK REFERENCE

### **Dev Server:**
```
http://localhost:5173/
```

### **Key URLs:**
- Reset Password: `/reset-password?token=test123`
- Login: `/login`
- Settings: `/settings`

### **Expected Deployment:**
```
API: https://mild-tern-361.convex.site
```

### **TypeScript Verification (Already Done):**
```
✅ api.auth.verifyResetToken - Accessible
✅ api.auth.changePassword - Accessible
✅ No import errors
```

---

## RESULTS TEMPLATE

Copy this and fill it out:

```
## TEST RESULTS

**Date:** December 25, 2025
**Tester:** [Your Name]

### Test 1: Password Reset Page
- Status: [ ] PASS / [ ] FAIL
- Console Errors: [ ] None / [ ] See details below
- Notes:

### Test 2: Settings/Change Password
- Status: [ ] PASS / [ ] FAIL
- Console Errors: [ ] None / [ ] See details below
- Notes:

### Test 3: Network Tab
- Deployment URL: [what you saw]
- Status: [ ] PASS / [ ] FAIL
- Notes:

### Test 4: Console Logs
- Error Count: [number]
- Critical Issues: [ ] None / [ ] See details below
- Notes:

### Overall Result
- [ ] ✅ ALL TESTS PASSED - Ready for production
- [ ] ⚠️ SOME ISSUES - Need fixes
- [ ] ❌ FAILED - Auth fix didn't work

### Screenshots
[Paste screenshots of any errors or successful states]
```

---

## IF TESTS FAIL

### **Common Issues & Solutions:**

**Issue 1: Old deployment URL in requests**
```bash
# Clear browser cache
# Hard refresh: Cmd+Shift+R
# Or open in Incognito mode
```

**Issue 2: Still seeing import errors**
```bash
# Rebuild frontend
cd /Users/briandusape/Projects/propiq/frontend
rm -rf dist .vite
npm run build
```

**Issue 3: Console Ninja returns**
```bash
# Re-run eradication
rm -rf ~/.console-ninja
# Restart Cursor
```

---

## IF ALL TESTS PASS

**Next Steps:**
1. ✅ Update `AUTH_ISSUES_TRACKER.csv` with VERIFIED status
2. ✅ Commit changes to git
3. ✅ Deploy to production
4. ✅ Test in production environment
5. ✅ Monitor for 30 minutes post-deploy

---

**IMPORTANT:** Take screenshots of:
- Browser console (showing no errors)
- Network tab (showing correct deployment)
- Successful page loads

This documentation helps with:
- Proof that fix works
- Debugging if issues appear later
- Deployment approval
- User communication about fix
