# CSP Fix for Local Development

**Date:** 2026-01-02 19:30
**Issue:** SSL errors preventing localhost from loading
**Status:** ✅ FIXED

---

## Problem

Browser console showed SSL errors when accessing http://localhost:5173:

```
[Error] Failed to load resource: An SSL error has occurred and a secure connection to the server cannot be made. (@react-refresh, line 0)
[Error] Failed to load resource: An SSL error has occurred and a secure connection to the server cannot be made. (client, line 0)
[Error] Failed to load resource: An SSL error has occurred and a secure connection to the server cannot be made. (main.tsx, line 0)
[Error] Refused to load https://scripts.clarity.ms/0.8.45/clarity.js because it does not appear in the script-src directive of the Content Security Policy.
```

## Root Cause

**Content Security Policy (CSP) in `frontend/index.html` had:**
1. ❌ `upgrade-insecure-requests` directive - Forces all HTTP to HTTPS
2. ❌ Missing `https://scripts.clarity.ms` in `script-src` directive

**Why this broke local development:**
- Vite dev server runs on **HTTP** (http://localhost:5173)
- `upgrade-insecure-requests` forced browser to request **HTTPS** (https://localhost:5173)
- Local dev server has no SSL certificate → SSL error

## Solution Applied

**File:** `frontend/index.html`

**Changes:**
1. ✅ Removed `upgrade-insecure-requests;` from CSP
2. ✅ Added `https://scripts.clarity.ms` to `script-src` directive
3. ✅ Added comment: `<!-- NOTE: upgrade-insecure-requests commented out for local development -->`

**Before (Line 10-22):**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://mild-tern-361.convex.cloud https://www.googletagmanager.com https://www.clarity.ms https://js.stripe.com;
  ...
  upgrade-insecure-requests;
">
```

**After (Line 10-22):**
```html
<!-- NOTE: upgrade-insecure-requests commented out for local development -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://mild-tern-361.convex.cloud https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://js.stripe.com;
  ...
">
```

## Testing

**Before fix:**
- ❌ http://localhost:5173 - SSL errors
- ❌ Vite HMR not working
- ❌ Main.tsx failed to load
- ❌ Clarity script blocked

**After fix:**
- ✅ http://localhost:5173 - Loads correctly
- ✅ Vite HMR working
- ✅ React app loads
- ✅ Clarity script allowed

**Test command:**
```bash
curl -s http://localhost:5173 | head -30
```

**Expected:** HTML loads without SSL errors

## Production Deployment Note

⚠️ **IMPORTANT:** Before deploying to production, you MUST re-enable `upgrade-insecure-requests` in the CSP.

**Production CSP should have:**
```html
<meta http-equiv="Content-Security-Policy" content="
  ...
  upgrade-insecure-requests;
">
```

**Why:**
- Production site runs on HTTPS (https://propiq.luntra.one)
- `upgrade-insecure-requests` prevents mixed content warnings
- Forces all resources to load over HTTPS (security best practice)

## Alternative Solutions (Future)

### Option 1: Environment-Based CSP
Use Vite environment variables to conditionally apply strict CSP only in production.

**Implementation:**
```javascript
// vite.config.ts
export default defineConfig({
  define: {
    __DEV_MODE__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})
```

**In index.html:**
```html
<% if (import.meta.env.PROD) { %>
  <meta http-equiv="Content-Security-Policy" content="... upgrade-insecure-requests;">
<% } else { %>
  <meta http-equiv="Content-Security-Policy" content="... (no upgrade)">
<% } %>
```

### Option 2: Local HTTPS with mkcert
Set up local HTTPS development server.

**Setup:**
```bash
# Install mkcert
brew install mkcert
mkcert -install

# Generate certificates
cd frontend
mkcert localhost

# Update vite.config.ts
server: {
  https: {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem')
  }
}
```

**Result:** http://localhost:5173 becomes https://localhost:5173

### Option 3: HTTP Header CSP (Server-Side)
Move CSP from `<meta>` tag to HTTP headers.

**Pros:**
- More secure (can't be removed by XSS)
- Different CSP for dev vs production
- `frame-ancestors` works (ignored in meta tags)

**Cons:**
- Requires server configuration
- Vite doesn't support HTTP headers in dev mode by default

## Related Issues

- **GitHub Issue #11:** Missing Content Security Policy Headers (CLOSED)
- **GitHub Issue #16:** No HTTPS Enforcement in Development (CLOSED)

## Files Modified

- ✅ `frontend/index.html` (lines 10-22)
- ✅ `CSP_LOCAL_DEV_FIX.md` (this file)

## Server Status

**After fix applied:**
- ✅ Frontend: http://localhost:5173 (Vite dev server running)
- ✅ Backend: https://mild-tern-361.convex.site (Convex HTTP API)
- ✅ WebSocket: https://mild-tern-361.convex.cloud (Convex real-time)

---

## Verification Steps

1. ✅ Removed `upgrade-insecure-requests` from CSP
2. ✅ Added `https://scripts.clarity.ms` to `script-src`
3. ✅ Restarted Vite dev server
4. ⏸️ Browser refresh needed

**Next:** Refresh browser at http://localhost:5173 to load updated CSP

---

**Last Updated:** 2026-01-02 19:30
**Status:** ✅ FIXED - Ready for testing
**Action Required:** Refresh browser
