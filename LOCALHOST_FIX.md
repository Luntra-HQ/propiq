# Localhost Not Loading - Fix Applied

**Date:** 2026-01-02 19:45
**Issue:** Browser couldn't connect to http://localhost:5173
**Status:** ✅ FIXED

---

## Problem

**Symptoms:**
- Page not loading at all in Safari or Chrome
- No console logs appearing
- Browser shows connection refused or unable to connect

**Root Cause:**
Vite dev server was configured to bind to `host: 'localhost'`, which on macOS defaulted to **IPv6 only** (`::1`).

When browsers tried to access `http://localhost:5173`, they attempted IPv4 first (`127.0.0.1`), but the server wasn't listening on IPv4 - only IPv6.

**Evidence:**
```bash
netstat -an | grep 5173 | grep LISTEN
# Before fix:
tcp6  0  0  ::1.5173  *.*  LISTEN  # ❌ IPv6 only

# After fix:
tcp4  0  0  *.5173    *.*  LISTEN  # ✅ IPv4 on all interfaces
```

---

## Solution Applied

**File:** `frontend/vite.config.ts` (line 130)

**Change:**
```typescript
// Before
server: {
  host: 'localhost',  // ❌ Binds to IPv6 only on macOS
  port: 5173,
  ...
}

// After
server: {
  host: '0.0.0.0',    // ✅ Binds to all interfaces (IPv4 + IPv6)
  port: 5173,
  ...
}
```

**Why `0.0.0.0`?**
- Binds to **all network interfaces**
- Accessible via:
  - `http://localhost:5173` (DNS resolves to 127.0.0.1)
  - `http://127.0.0.1:5173` (IPv4 loopback)
  - `http://192.168.68.103:5173` (Local network IP)
  - `http://[::1]:5173` (IPv6 loopback, if needed)

---

## Verification

**Server is now running:**
```
VITE v7.3.0  ready in 442 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.68.103:5173/
```

**Process listening:**
```bash
lsof -i :5173
# Output:
node  56082  briandusape  13u  IPv4  *:5173  (LISTEN)
```

**HTTP response test:**
```bash
curl -s http://127.0.0.1:5173 | grep "<title>"
# Output:
<title>PropIQ - AI Real Estate Investment Analysis | Analyze Properties in 30 Seconds</title>
```

✅ Server is accessible on IPv4

---

## How to Access

**Try these URLs (in order):**

1. **http://127.0.0.1:5173** ← Use this if localhost doesn't work
2. **http://localhost:5173** ← Should work now
3. **http://192.168.68.103:5173** ← Your local network IP

**Recommended:** Use `http://127.0.0.1:5173` to avoid any DNS issues

---

## Browser Testing Steps

1. **Open a new browser window** (don't use existing tabs)
2. **Clear browser cache** (Cmd+Shift+Delete or Ctrl+Shift+Delete)
3. **Enter URL:** `http://127.0.0.1:5173`
4. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

**Expected Result:**
- PropIQ landing page loads
- React app initializes
- No SSL errors in console
- Convex connects successfully

---

## Related Fixes Applied

### Fix #1: CSP SSL Errors (COMPLETED)
**File:** `frontend/index.html`
- Removed `upgrade-insecure-requests` directive
- Added `https://scripts.clarity.ms` to `script-src`
- **See:** `CSP_LOCAL_DEV_FIX.md`

### Fix #2: IPv4 Binding (COMPLETED)
**File:** `frontend/vite.config.ts`
- Changed `host: 'localhost'` → `host: '0.0.0.0'`
- **See:** This file

---

## Common Issues & Solutions

### Issue: "This site can't be reached"
**Solution:** Use `http://127.0.0.1:5173` instead of `localhost`

### Issue: "ERR_CONNECTION_REFUSED"
**Solution:** Check if dev server is running:
```bash
lsof -i :5173
# Should show: node process listening
```

If not running, restart:
```bash
cd /Users/briandusape/Projects/propiq/frontend
npm run dev
```

### Issue: SSL/HTTPS errors
**Solution:** Make sure you're using `http://` not `https://`
- ✅ Correct: `http://127.0.0.1:5173`
- ❌ Wrong: `https://localhost:5173`

### Issue: Blank page, no errors
**Solution:**
1. Open browser dev tools (F12 or Cmd+Option+I)
2. Check Console tab for errors
3. Check Network tab to see if resources are loading
4. Hard refresh (Cmd+Shift+R)

---

## Server Management

**Check if server is running:**
```bash
lsof -i :5173
```

**View live logs:**
```bash
tail -f /tmp/vite-dev-new.log
```

**Stop server:**
```bash
pkill -f "vite"
```

**Start server:**
```bash
cd /Users/briandusape/Projects/propiq/frontend
npm run dev
```

---

## Production Note

⚠️ **Important:** `host: '0.0.0.0'` is fine for **local development only**.

For production (if using Vite preview or similar):
- Use reverse proxy (nginx, Caddy)
- Don't expose Vite directly to internet
- Production builds don't use Vite dev server

---

## Files Modified

1. ✅ `frontend/vite.config.ts` (line 130) - Changed host binding
2. ✅ `frontend/index.html` (lines 10-22) - Removed CSP upgrade directive
3. ✅ Server restarted with new configuration

---

## Next Steps

1. ✅ Server is running on IPv4
2. ✅ CSP updated for local development
3. ⏸️ **User to test:** Open http://127.0.0.1:5173 in browser
4. ⏸️ **If successful:** Proceed to manual password reset test (Issue #18)

---

**Last Updated:** 2026-01-02 19:45
**Status:** ✅ READY FOR TESTING
**Test URL:** http://127.0.0.1:5173
