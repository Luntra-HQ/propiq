# PropIQ Performance Fix Plan

**Current Score:** 32/100 (CRITICAL)
**Target Score:** 90+ (Excellent)
**Est. Time:** 90 minutes
**Expected Impact:** 3-5x faster load time

---

## 🎯 Performance Goals

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Performance Score** | 32 | 90+ | ❌ |
| **FCP** | 4.2s | < 1.8s | ❌ |
| **LCP** | 7.1s | < 2.5s | ❌ |
| **TBT** | 1,960ms | < 200ms | ❌ |
| **Speed Index** | 8.8s | < 3.4s | ❌ |
| **CLS** | 0 | < 0.1 | ✅ |

---

## 🚀 Quick Wins (30 min) - Do These First!

### **Fix #1: Defer Analytics Scripts** (5 min) ⚡

**Problem:** Google Tag Manager, Clarity, Cloudflare loading before critical content

**Impact:** Save ~300-500ms on FCP

**Fix:**

```typescript
// frontend/src/main.tsx
// REMOVE these lines from window.addEventListener('load'):
// Keep analytics but make them truly async

// Add this instead:
const loadAnalytics = () => {
  // Google Tag Manager
  const gtmScript = document.createElement('script');
  gtmScript.async = true;
  gtmScript.defer = true;
  gtmScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
  document.body.appendChild(gtmScript);

  // Clarity (keep existing but ensure it's last)
  setTimeout(() => {
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.defer=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "tts5hc8zf8");
  }, 3000); // Load Clarity after 3 seconds
};

// Load after page is fully interactive
if (document.readyState === 'complete') {
  loadAnalytics();
} else {
  window.addEventListener('load', () => {
    setTimeout(loadAnalytics, 1000); // 1 second delay
  });
}
```

---

### **Fix #2: Add Preconnect Hints** (2 min) ⚡

**Problem:** No DNS prefetch for third-party origins

**Impact:** Save 350ms on Clarity load

**Fix:** Update `frontend/index.html`

```html
<!-- Add these BEFORE existing preconnect tags (line 48) -->
<link rel="preconnect" href="https://scripts.clarity.ms" crossorigin>
<link rel="dns-prefetch" href="https://scripts.clarity.ms">
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
<link rel="preconnect" href="https://mild-tern-361.convex.site">
<link rel="dns-prefetch" href="https://mild-tern-361.convex.site">
```

---

### **Fix #3: Remove Tally.so Widget** (1 min) ⚡

**Problem:** 14 KiB third-party script for unused widget

**Impact:** Save 14 KiB + 10ms

**Check:** Are you using Tally.so forms?
- **No:** Remove the script entirely
- **Yes:** Lazy load it only on pages that use forms

**Fix:** Search codebase for `tally.so` and remove if unused

---

### **Fix #4: Optimize Critical CSS** (10 min)

**Problem:** 16.6 KiB CSS blocking render for 460ms

**Impact:** Save 200-300ms on FCP

**Fix:** Inline critical CSS

```bash
# Install critical CSS tool
npm install --save-dev critical

# Add to package.json scripts:
"critical": "critical src/index.html --base dist --inline --minify > dist/index-critical.html"
```

**OR Manual approach:**

1. Extract CSS for above-the-fold content
2. Inline in `<head>` as `<style>`
3. Load full CSS with `media="print" onload="this.media='all'"`

---

### **Fix #5: Lazy Load Clarity** (2 min) ⚡

**Problem:** Clarity loads immediately, not needed for initial page view

**Impact:** Save 152ms + 28 KiB on initial load

**Fix:** Already in index.html `window.addEventListener('load')` but can delay further

```html
<!-- In index.html, replace Clarity script with: -->
<script>
  // Load Clarity after 5 seconds OR on first user interaction
  let clarityLoaded = false;
  const loadClarity = () => {
    if (clarityLoaded) return;
    clarityLoaded = true;

    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "tts5hc8zf8");
  };

  // Load after 5 seconds
  setTimeout(loadClarity, 5000);

  // OR load on first interaction (whichever comes first)
  ['mousedown', 'touchstart', 'keydown', 'scroll'].forEach(event => {
    document.addEventListener(event, loadClarity, { once: true, passive: true });
  });
</script>
```

---

## 🔧 Medium Impact Fixes (30 min)

### **Fix #6: Code Splitting** (15 min)

**Problem:** 210 KiB bundle with 139 KiB unused code

**Impact:** Reduce initial bundle by 40-50%

**Fix:** Split by route

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react'],
          'vendor-convex': ['convex/react'],

          // Route-based chunks
          'landing': [
            './src/pages/LandingPage.tsx',
            './src/pages/PricingPageWrapper.tsx'
          ],
          'app': [
            './src/App.tsx',
            './src/pages/WelcomePage.tsx'
          ],
          'auth': [
            './src/pages/LoginPage.tsx',
            './src/pages/ResetPasswordPage.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 500 // Warn if chunk > 500 KB
  }
});
```

---

### **Fix #7: Tree Shaking** (10 min)

**Problem:** Unused code in bundle (312 KiB waste)

**Impact:** Reduce bundle by 100-150 KiB

**Fix:**

1. **Check imports:**
```bash
# Find large imports
npx vite-bundle-visualizer

# OR
npm install --save-dev rollup-plugin-visualizer
```

2. **Use named imports:**
```typescript
// ❌ BAD - imports entire library
import * as lucide from 'lucide-react';

// ✅ GOOD - only imports what you use
import { Calculator, Home, Settings } from 'lucide-react';
```

3. **Enable tree shaking in vite.config.ts:**
```typescript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        dead_code: true,
        unused: true
      }
    }
  }
});
```

---

### **Fix #8: Lazy Load Images** (5 min)

**Problem:** Images loading eagerly

**Impact:** Save bandwidth, faster LCP

**Fix:**

```typescript
// Add to all <img> tags not in viewport:
<img
  src="..."
  alt="..."
  loading="lazy"
  decoding="async"
/>

// For LCP image (hero), do OPPOSITE:
<link rel="preload" as="image" href="/hero-image.jpg" fetchpriority="high">
<img
  src="/hero-image.jpg"
  alt="..."
  loading="eager"
  fetchpriority="high"
/>
```

---

## 🚀 High Impact Fixes (30 min)

### **Fix #9: Reduce LCP Element Render Delay** (15 min)

**Problem:** LCP element (main text) takes 2,250ms to render

**Impact:** Massive - could reduce LCP by 2+ seconds!

**Root Cause:** Likely waiting for:
- Fonts to load
- JavaScript to execute
- React to hydrate

**Fix:**

**A. Preload Critical Fonts:**
```html
<!-- In index.html <head> -->
<link
  rel="preload"
  href="/fonts/your-font.woff2"
  as="font"
  type="font/woff2"
  crossorigin
>

<style>
/* Inline font-face for critical font */
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/your-font.woff2') format('woff2');
  font-display: swap; /* Show fallback while loading */
}
</style>
```

**B. Avoid Font Layout Shift:**
```css
/* Use font metric overrides */
@font-face {
  font-family: 'YourFont';
  src: url('...') format('woff2');
  font-display: swap;
  /* Prevent layout shift */
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
```

**C. Server-Side Render (SSR) Critical Content:**
```html
<!-- In index.html, add static content -->
<div id="root">
  <!-- Pre-render hero section -->
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="text-center">
      <h1 class="text-5xl font-bold text-white mb-6">
        PropIQ - AI Real Estate Investment Analysis
      </h1>
      <p class="text-gray-300 mb-6 text-base leading-relaxed">
        Analyze any property in 30 seconds
      </p>
    </div>
  </div>
</div>
```

---

### **Fix #10: Optimize Convex Connection** (10 min)

**Problem:** `/auth/me` request taking 1,901ms in critical path

**Impact:** Blocking page render

**Fix:**

```typescript
// frontend/src/main.tsx
// Don't await auth check on initial load
// Let page render, then update UI when auth loads

const convex = new ConvexReactClient(convexUrl || 'https://placeholder.convex.cloud');

// Add connection options
convex.setOptions({
  // Faster reconnection
  maxBackoff: 5000,
  // Don't wait for auth on initial load
  skipAuth: false
});
```

**Better:** Check auth in background, don't block render

---

### **Fix #11: Remove/Defer Cloudflare Insights** (5 min)

**Problem:** 7 KiB + 28ms for analytics you may not need

**Impact:** Save 28ms + reduce main thread work

**Fix:**

**Option 1:** Remove entirely if not using Cloudflare Analytics
**Option 2:** Defer loading:

```html
<script>
  // Load Cloudflare Insights after page is interactive
  setTimeout(() => {
    const script = document.createElement('script');
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.defer = true;
    script.setAttribute('data-cf-beacon', '{"token": "..."}');
    document.body.appendChild(script);
  }, 5000);
</script>
```

---

## 📊 Testing & Verification

### **1. Build & Test Locally**
```bash
cd frontend
npm run build
npx serve dist

# Open http://localhost:3000
# Run Lighthouse in Chrome DevTools (Incognito mode)
```

### **2. Expected Results After All Fixes**

| Metric | Before | After (Target) | Improvement |
|--------|--------|----------------|-------------|
| Performance | 32 | 90+ | +58 |
| FCP | 4.2s | < 1.8s | -2.4s (57%) |
| LCP | 7.1s | < 2.5s | -4.6s (65%) |
| TBT | 1,960ms | < 200ms | -1,760ms (90%) |
| Speed Index | 8.8s | < 3.4s | -5.4s (61%) |

### **3. Monitor Real Users**
- Use Clarity to watch real user load times
- Check Google Analytics Core Web Vitals
- Monitor Sentry for new performance issues

---

## ✅ Implementation Checklist

**Quick Wins (30 min):**
- [ ] Defer/async all analytics scripts
- [ ] Add preconnect hints
- [ ] Remove Tally.so (if unused)
- [ ] Inline critical CSS OR use `media` trick
- [ ] Lazy load Clarity (5s delay or on interaction)

**Medium Impact (30 min):**
- [ ] Add code splitting (Vite config)
- [ ] Enable tree shaking
- [ ] Add lazy loading to images

**High Impact (30 min):**
- [ ] Preload critical fonts
- [ ] Pre-render hero content in index.html
- [ ] Optimize Convex connection
- [ ] Defer Cloudflare Insights

**Verification:**
- [ ] Run Lighthouse test
- [ ] Deploy to production
- [ ] Monitor real user metrics

---

## 🎯 Priority Order (If Time Limited)

**If you have 30 min:** Do Quick Wins only
**If you have 60 min:** Quick Wins + Medium Impact
**If you have 90 min:** All fixes

**Biggest Impact First:**
1. Defer analytics (Fix #1) - 5 min → ~300ms saved
2. Lazy load Clarity (Fix #5) - 2 min → ~150ms saved
3. Add preconnect (Fix #2) - 2 min → ~350ms saved
4. Pre-render hero (Fix #9C) - 10 min → ~2,000ms saved
5. Code splitting (Fix #6) - 15 min → ~1,000ms saved

---

**Status:** Ready to implement
**Est. Total Time:** 90 minutes
**Expected Score:** 90+ (from 32)
**Expected Load Time:** 2-3 seconds (from 7+ seconds)

---

Last Updated: December 19, 2025
