# PropIQ Performance Optimization Guide

**Complete guide for optimizing Core Web Vitals and site performance**

**Last Updated:** 2025-11-06
**Tech Stack:** React + Vite + Netlify
**Domain:** propiq.luntra.one

---

## Table of Contents

1. [Core Web Vitals Overview](#core-web-vitals-overview)
2. [Current Performance Baseline](#current-performance-baseline)
3. [Image Optimization](#image-optimization)
4. [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
5. [Caching Strategy](#caching-strategy)
6. [Network Optimization](#network-optimization)
7. [React Performance](#react-performance)
8. [Netlify Optimizations](#netlify-optimizations)
9. [Monitoring & Testing](#monitoring--testing)
10. [Performance Budget](#performance-budget)

---

## Core Web Vitals Overview

### What Are Core Web Vitals?

Google's Core Web Vitals are user-centric performance metrics that measure:

**1. Largest Contentful Paint (LCP)**
- **What:** Time until largest content element is visible
- **Target:** < 2.5 seconds (good), < 4s (needs improvement), > 4s (poor)
- **Measures:** Loading performance

**2. First Input Delay (FID) / Interaction to Next Paint (INP)**
- **What:** Time from user interaction to browser response
- **Target:** < 100ms (good), < 300ms (needs improvement), > 300ms (poor)
- **Measures:** Interactivity

**3. Cumulative Layout Shift (CLS)**
- **What:** Visual stability - unexpected layout shifts
- **Target:** < 0.1 (good), < 0.25 (needs improvement), > 0.25 (poor)
- **Measures:** Visual stability

### Why They Matter

- **SEO Impact:** Core Web Vitals are ranking factors
- **User Experience:** Faster sites = better engagement
- **Conversion Rate:** 1 second delay = 7% reduction in conversions
- **Bounce Rate:** 53% of mobile users abandon sites that take > 3s

---

## Current Performance Baseline

### Test Your Site

**Before optimizing, establish baseline:**

1. **PageSpeed Insights**
   ```
   URL: https://pagespeed.web.dev
   Enter: https://propiq.luntra.one
   ```

2. **WebPageTest**
   ```
   URL: https://www.webpagetest.org
   Location: Virginia (closest to users)
   Connection: Cable
   ```

3. **Lighthouse (Chrome DevTools)**
   ```
   1. Open site in Chrome
   2. Press F12 (DevTools)
   3. Go to "Lighthouse" tab
   4. Select "Performance" + "SEO"
   5. Click "Analyze page load"
   ```

### Document Baseline Metrics

**Create a spreadsheet with:**

| Metric | Desktop | Mobile | Target | Status |
|--------|---------|--------|--------|--------|
| LCP | ? | ? | < 2.5s | ❓ |
| FID/INP | ? | ? | < 100ms | ❓ |
| CLS | ? | ? | < 0.1 | ❓ |
| Performance Score | ? | ? | 90+ | ❓ |
| SEO Score | ? | ? | 95+ | ❓ |
| Accessibility | ? | ? | 90+ | ❓ |

---

## Image Optimization

### Current Status

The current implementation uses:
- Vite for bundling
- No images in the initial bundle (just vite.svg)
- Microsoft Clarity analytics script

### Action Items

#### 1. Create Optimized Images

**Required Images:**
- `og-image.jpg` (1200x630px)
- `twitter-image.jpg` (1200x675px)
- `favicon.ico` (32x32)
- `apple-touch-icon.png` (180x180)

**Optimization Steps:**

```bash
# Install image optimization tools
npm install -D vite-plugin-imagemin imagemin-webp

# Or use online tools:
# - TinyPNG: https://tinypng.com
# - Squoosh: https://squoosh.app
# - ImageOptim: https://imageoptim.com (Mac)
```

**Vite Config (vite.config.ts):**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true }
        ]
      }
    })
  ]
});
```

#### 2. Implement Lazy Loading

**For images in React components:**

```tsx
// Use native lazy loading (supported by all modern browsers)
<img
  src="/images/feature-screenshot.jpg"
  alt="PropIQ property analysis screenshot"
  loading="lazy"
  width="800"
  height="600"
/>
```

**For background images:**

```tsx
import { useEffect, useRef, useState } from 'react';

const LazyBackgroundImage = ({ src, className, children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={divRef}
      className={className}
      style={isLoaded ? { backgroundImage: `url(${src})` } : {}}
    >
      {children}
    </div>
  );
};
```

#### 3. Responsive Images

**Use srcset for different screen sizes:**

```tsx
<img
  src="/images/hero-800.jpg"
  srcSet="
    /images/hero-400.jpg 400w,
    /images/hero-800.jpg 800w,
    /images/hero-1200.jpg 1200w
  "
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="PropIQ dashboard"
  loading="lazy"
  width="1200"
  height="630"
/>
```

#### 4. WebP Format

**Convert images to WebP for 25-35% smaller file sizes:**

```tsx
<picture>
  <source srcSet="/images/hero.webp" type="image/webp" />
  <source srcSet="/images/hero.jpg" type="image/jpeg" />
  <img src="/images/hero.jpg" alt="PropIQ" />
</picture>
```

---

## Code Splitting & Lazy Loading

### Current Status

PropIQ currently loads all components upfront. This is fine for small apps, but can be optimized.

### Action Items

#### 1. Route-Based Code Splitting

**If you add routing (React Router):**

```tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load route components
const HomePage = lazy(() => import('./pages/HomePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
```

#### 2. Component-Based Code Splitting

**For large components like modals:**

```tsx
import { lazy, Suspense } from 'react';

// Current: Loads immediately
// import PricingPage from './components/PricingPage';

// Optimized: Loads only when needed
const PricingPage = lazy(() => import('./components/PricingPage'));

const App = () => {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <>
      {showPricing && (
        <Suspense fallback={<LoadingSpinner />}>
          <PricingPage onClose={() => setShowPricing(false)} />
        </Suspense>
      )}
    </>
  );
};
```

**Apply to PropIQ components:**
- `PricingPage` (large component, not always shown)
- `PropIQAnalysis` (loads only when user clicks button)
- `SupportChat` (loads only when user opens chat)

#### 3. Dynamic Imports

**For libraries used conditionally:**

```tsx
// Bad: Loads jsPDF upfront (even if never used)
import jsPDF from 'jspdf';

// Good: Loads jsPDF only when user clicks "Export PDF"
const handleExportPDF = async () => {
  const jsPDF = (await import('jspdf')).default;
  const pdf = new jsPDF();
  // ... generate PDF
};
```

**Apply to:**
- `jsPDF` (used only for PDF export)
- `html2canvas` (used only for screenshots)

---

## Caching Strategy

### Browser Caching

**Netlify automatically handles caching, but you can optimize:**

**Create `netlify.toml` in project root:**

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

**Explanation:**
- `/assets/*`, `*.js`, `*.css`: Cache for 1 year (immutable)
- `/index.html`: Always revalidate (no caching)
- Vite generates hashed filenames, so old versions are never served

### Service Worker (Optional - Advanced)

**For offline functionality and instant repeat visits:**

```bash
npm install -D vite-plugin-pwa
```

**vite.config.ts:**

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ]
});
```

---

## Network Optimization

### 1. Reduce Request Count

**Current external requests:**
- Microsoft Clarity script
- Firebase SDK (if enabled)
- Google Fonts (if used)

**Optimization:**

```tsx
// Bad: Multiple font requests
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

// Good: Preload critical font
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
```

### 2. Preload Critical Resources

**Add to index.html `<head>`:**

```html
<!-- Preload critical JavaScript -->
<link rel="modulepreload" href="/src/main.tsx" />

<!-- Preload critical CSS -->
<link rel="preload" href="/assets/index.css" as="style" />

<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://www.clarity.ms" />
<link rel="dns-prefetch" href="https://www.clarity.ms" />
```

### 3. Minimize JavaScript Bundle

**Analyze bundle size:**

```bash
npm run build
npx vite-bundle-visualizer
```

**Common optimizations:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### 4. Enable Compression

**Netlify automatically enables Brotli compression, but verify:**

**Test compression:**
```bash
curl -H "Accept-Encoding: br" -I https://propiq.luntra.one
# Should see: content-encoding: br
```

---

## React Performance

### 1. Memoization

**Use React.memo for expensive components:**

```tsx
import { memo } from 'react';

// Prevents re-render if props haven't changed
const DealIqFeatureCard = memo(({ used, limit, onClick, currentTier }) => {
  // Component code
});
```

**Use useMemo for expensive calculations:**

```tsx
import { useMemo } from 'react';

const DealCalculator = () => {
  // Expensive calculation - only recalculate when inputs change
  const dealScore = useMemo(() => {
    return calculateDealScore(purchasePrice, monthlyRent, expenses);
  }, [purchasePrice, monthlyRent, expenses]);
};
```

**Use useCallback for functions passed as props:**

```tsx
import { useCallback } from 'react';

const App = () => {
  const handleUpgradeClick = useCallback(() => {
    setShowPricingPage(true);
    setShowPaywall(false);
  }, []); // Dependencies array
};
```

### 2. Virtualization (If Needed)

**For long lists (100+ items):**

```bash
npm install react-virtual
```

```tsx
import { useVirtual } from 'react-virtual';

const LongList = ({ items }) => {
  const parentRef = useRef();

  const rowVirtualizer = useVirtual({
    size: items.length,
    parentRef,
    estimateSize: useCallback(() => 50, [])
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.totalSize}px` }}>
        {rowVirtualizer.virtualItems.map(virtualRow => (
          <div key={virtualRow.index}>
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. Avoid Unnecessary Renders

**Use React DevTools Profiler:**

1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Click "Record"
4. Interact with app
5. Stop recording
6. Analyze flame graph for slow components

**Common fixes:**
- Move state closer to where it's used
- Split large components
- Use composition over prop drilling
- Avoid inline functions in JSX

---

## Netlify Optimizations

### 1. Enable Post Processing

**In Netlify dashboard or `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true
```

### 2. Asset Optimization

**Netlify automatically:**
- Minifies HTML, CSS, JS
- Compresses images
- Enables Brotli compression
- Serves from global CDN

**Verify in build logs:**
```
Post processing - HTML
  index.html                  5.6 kB →  4.8 kB
Post processing - CSS
  assets/index.css           12.3 kB →  9.7 kB
Post processing - JavaScript
  assets/index.js           145.2 kB → 128.4 kB
```

### 3. Redirects for SPA

**Already configured in `frontend/public/_redirects`:**

```
/*    /index.html   200
```

This ensures React Router works correctly.

### 4. Environment Variables

**Set in Netlify dashboard:**
- `NODE_ENV=production`
- `VITE_API_BASE=https://api.luntra.one`

---

## Monitoring & Testing

### Continuous Monitoring

**Set up automated monitoring:**

1. **Google Search Console**
   - Monitors Core Web Vitals for real users
   - Go to: Experience → Core Web Vitals
   - Track LCP, FID, CLS over time

2. **Microsoft Clarity**
   - Already installed (tts5hc8zf8)
   - Check "Heatmaps" and "Recordings"
   - Monitor rage clicks and dead clicks

3. **Lighthouse CI (Optional)**

```bash
npm install -D @lhci/cli
```

**`.lighthouserc.js`:**
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['https://propiq.luntra.one'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }]
      }
    }
  }
};
```

### Performance Budget

**Set limits to prevent regression:**

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500 // Warn if chunk > 500 KB
  }
});
```

**Budget targets:**

| Asset Type | Max Size | Current | Status |
|------------|----------|---------|--------|
| Initial JS | 150 KB | TBD | 🟡 |
| Total CSS | 50 KB | TBD | 🟡 |
| Images | 200 KB each | TBD | 🟡 |
| Total Page Weight | 1 MB | TBD | 🟡 |

---

## Quick Wins (Implement First)

**Priority 1: High Impact, Low Effort**

1. ✅ **Add lazy loading to images**
   - Add `loading="lazy"` to all `<img>` tags

2. ✅ **Optimize images**
   - Convert to WebP
   - Compress with TinyPNG
   - Add proper width/height attributes

3. ✅ **Enable Netlify post-processing**
   - Add `netlify.toml` with optimizations

4. ✅ **Preconnect to external domains**
   - Add `<link rel="preconnect">` for Clarity, Firebase

5. ✅ **Add explicit image dimensions**
   - Prevents CLS (layout shift)

**Priority 2: Medium Impact, Medium Effort**

1. 🟡 **Implement code splitting**
   - Lazy load PricingPage, PropIQAnalysis

2. 🟡 **Memoize expensive components**
   - Use React.memo, useMemo, useCallback

3. 🟡 **Configure caching headers**
   - Use `netlify.toml` for cache control

**Priority 3: Long-Term Improvements**

1. 🔵 **Add service worker (PWA)**
   - Offline functionality
   - Faster repeat visits

2. 🔵 **Implement virtualization**
   - Only if you have long lists

3. 🔵 **Set up Lighthouse CI**
   - Automated performance monitoring

---

## Performance Checklist

### Before Deployment

- [ ] Images optimized (WebP, compressed)
- [ ] Images have width/height attributes
- [ ] Lazy loading enabled (`loading="lazy"`)
- [ ] Code splitting configured
- [ ] Netlify optimizations enabled
- [ ] Lighthouse score: 90+ (mobile)
- [ ] Core Web Vitals: All green
- [ ] Bundle size analyzed

### After Deployment

- [ ] Test with PageSpeed Insights
- [ ] Verify in Google Search Console (Core Web Vitals)
- [ ] Check Microsoft Clarity recordings
- [ ] Monitor for 30 days
- [ ] Review and iterate

---

**Last Updated:** 2025-11-06
**Maintained By:** LUNTRA Team
**Questions?** Contact: support@luntra.one
