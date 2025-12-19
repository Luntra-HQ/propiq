# HOTFIX: White Screen Error - December 18, 2025

## 🚨 **Critical Issue**

**Symptom:** White screen, site completely broken
**Error:** `TypeError: ba is not a function. (In 'ba({args:...', 'ba' is null)`
**Cause:** Convex stub exporting `null` instead of functions

---

## 🔧 **Root Cause**

The `convex-server-stub.js` was exporting `null` for all Convex functions:

```javascript
// BROKEN ❌
export const query = null;
export const mutation = null;
export const action = null;
```

When backend modules (`articles.ts`, `auth.ts`, etc.) were imported into the browser bundle, they tried to CALL these functions:

```javascript
// In articles.ts (gets bundled into browser)
export const getArticles = query({  // ❌ query is null!
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => { ... }
});
```

Result: `TypeError: ba is not a function` (minified `query` → `ba`)

---

## ✅ **Solution**

Changed stub exports from `null` to **actual functions** that return no-op wrappers:

```javascript
// FIXED ✅
export const query = () => ({ handler: () => null });
export const mutation = () => ({ handler: () => null });
export const action = () => ({ handler: () => null });

// ... and all Generic versions
export const queryGeneric = () => ({ handler: () => null });
export const mutationGeneric = () => ({ handler: () => null });
// etc.
```

**Key Changes:**
1. `query`, `mutation`, `action` → Functions returning objects (not null)
2. `v` → Proxy that returns itself for chaining
3. `makeApi` → Actual function that builds API object
4. All `*Generic` variants → Functions (not null)

---

## 📋 **Deployment Timeline**

| Time | Event | Status |
|------|-------|--------|
| 02:37 | First deployment with `api.js` fix | ❌ White screen |
| 02:37 | Error discovered: `ba is not a function` | 🚨 Critical |
| 02:38 | Root cause identified: stub exports null | 🔍 Diagnosed |
| 02:39 | Fixed stub to return functions | ✅ Fixed |
| 02:40 | Rebuilt (74s) | ✅ Success |
| 02:41 | Deployed hotfix | ✅ Live |
| 02:41 | Verified site loads | ✅ Working |

**Total Downtime:** ~4 minutes

---

## 🧪 **Verification**

**Site Status:** ✅ LIVE
- URL: https://propiq.luntra.one
- HTTP Status: 200 OK
- Title: "PropIQ - AI Real Estate Investment Analysis..."
- Console: No TypeErrors

**Before Hotfix:**
```
❌ White screen
❌ TypeError: ba is not a function
❌ Bundle: index-Co3K8UiR.js (broken)
```

**After Hotfix:**
```
✅ Site loads
✅ No console errors
✅ Bundle: index-BsSMpEFh.js (working)
```

---

## 📝 **Files Modified**

**File:** `frontend/convex-server-stub.js`

**Changes:**
- ❌ Removed: `export const query = null;`
- ✅ Added: `export const query = () => ({ handler: () => null });`
- ✅ Added: Proxy for `v` validation builder
- ✅ Added: Proper `makeApi` function implementation
- ✅ Updated: All `*Generic` functions to return objects

**Lines changed:** 25 lines
**Impact:** Critical - Fixed white screen error

---

## 🎯 **Lessons Learned**

1. **Stubs must match expected interface:** If backend code calls `query()`, stub must be a function, not null.

2. **Test in production mode:** Dev server doesn't catch all bundling issues.

3. **Monitor after deploy:** Always check console immediately after deployment.

4. **Keep rollback ready:** Having previous working deployment makes recovery faster.

5. **Convex bundling caveat:** Backend modules (articles.ts, auth.ts) get bundled into browser, need proper stubs.

---

## 🚀 **Current Status**

**✅ RESOLVED**

- [x] Site loads without errors
- [x] Convex stub properly configured
- [x] Build completes successfully
- [x] Deployed to production
- [ ] **USER TO TEST:** Verify Stripe checkout flow works
- [ ] **USER TO TEST:** Full end-to-end testing

---

## 🧪 **Testing Checklist**

Please test:

1. **Site loads:**
   - [ ] Homepage loads (https://propiq.luntra.one)
   - [ ] No white screen
   - [ ] No console errors

2. **Stripe checkout:**
   - [ ] Navigate to /pricing
   - [ ] Click "Choose Starter"
   - [ ] Should redirect to Stripe (not error)
   - [ ] Previous error: `TypeError: null is not an object (evaluating 'qs.payments')`
   - [ ] Expected: Stripe checkout page

3. **Other features:**
   - [ ] Login/signup works
   - [ ] Dashboard loads
   - [ ] Property analysis works

---

## 📞 **If Issues Persist**

1. **Clear browser cache:** Hard refresh (`Cmd+Shift+R`)
2. **Try incognito mode:** Rules out cache issues
3. **Check console:** Screenshot any errors
4. **Share error details:** Copy full error message

---

**Status:** ✅ LIVE AND WORKING
**Next:** Test Stripe checkout end-to-end
**Deployment:** 6943b144536c11e5929a0ec1
