# PropIQ Web Presence Testing Guide

**Purpose:** See how PropIQ appears to real users discovering your site through Google, social media, mobile devices, etc.

## Quick Start

```bash
cd frontend

# Run all web presence tests
npx playwright test tests/web-presence-test.spec.ts --reporter=list

# Run specific test
npx playwright test tests/web-presence-test.spec.ts -g "SEO"
npx playwright test tests/web-presence-test.spec.ts -g "Social Media"
npx playwright test tests/web-presence-test.spec.ts -g "Mobile"
```

---

## What This Tests

### 1. **SEO: How You Appear in Google**
- Page title (the blue link in search results)
- Meta description (text under the link)
- Canonical URL (prevents duplicate content penalties)
- Keywords for ranking ("real estate analysis", "property investment", etc.)

**Why it matters:** 90% of users find SaaS products through Google search.

### 2. **Social Media Previews**
- Facebook/LinkedIn share cards (Open Graph tags)
- Twitter share cards
- Image previews when sharing links

**Why it matters:** Social shares drive 30-40% of traffic for B2B SaaS.

### 3. **First-Time Visitor Experience**
- What users see in first 3 seconds (critical for bounce rate)
- Header clarity ("PropIQ" not "LUNTRA Internal Dashboard")
- Value proposition visibility
- Call-to-action prominence

**Why it matters:** Users decide to stay or leave in 3-5 seconds.

### 4. **Mobile Experience**
- Responsive design on iPhone/Android
- Font sizes (must be readable on small screens)
- CTA accessibility (can user click main button without scrolling?)
- Screenshot saved to `tests/screenshots/propiq-mobile-view.png`

**Why it matters:** 60%+ of traffic is mobile. Google penalizes mobile-unfriendly sites.

### 5. **Page Speed**
- Time to interactive (DOM ready)
- Full load time (all resources)
- Compared against Google Core Web Vitals benchmark (2.5s)

**Why it matters:** Every 1 second delay = 7% fewer conversions.

### 6. **Brand Consistency**
- Counts "PropIQ" vs "DealIQ" mentions
- Checks for old branding ("LUNTRA Internal Dashboard")
- Verifies rebrand is complete

**Why it matters:** Inconsistent branding confuses users and hurts trust.

### 7. **Redirect Check**
- Verifies `dealiq.luntra.one` → `propiq.luntra.one`
- Checks 301 status (permanent redirect, tells Google)

**Why it matters:** Prevents split traffic, consolidates SEO authority.

### 8. **User Journey Simulation**
- Simulates: Google search → Click result → See value → Try sample → Sign up
- Tests entire conversion funnel

**Why it matters:** Identifies friction points before they cost you customers.

### 9. **Competitive Positioning**
- Checks for differentiators (AI, speed, affordability)
- Verifies unique selling points are visible

**Why it matters:** Users compare you to competitors. Stand out or lose.

---

## Sample Output

```
🔍 Checking if PropIQ ranks well for target keywords...

🎯 Target Keywords Found:
   ✅ "real estate analysis": Title, Meta, Headings, Content
   ✅ "property investment": Meta, Content
   ✅ "rental property": Content
   ✅ "cap rate": Headings, Content
   ✅ "ROI": Headings, Content
   ⚠️  "investment calculator": Content (add to Title/Meta)

💡 More keywords = better chance of ranking in Google
```

---

## Action Items from Test Results

### If tests show missing SEO tags:
1. Add `<meta name="description">` to `index.html`
2. Add Open Graph tags for social shares
3. Add structured data for rich snippets

### If page load is slow:
1. Optimize images (use WebP, compress)
2. Code-split large JavaScript bundles
3. Enable CDN caching (Netlify does this automatically)

### If mobile experience is poor:
1. Increase font sizes (min 14px on mobile)
2. Increase button sizes (min 44x44px touch target)
3. Add more whitespace for readability

### If brand is inconsistent:
1. Search codebase for "DealIQ" and replace with "PropIQ"
2. Update all documentation
3. Update social media profiles

---

## Advanced: Run on Different Devices

```bash
# Test on different mobile devices
npx playwright test web-presence-test.spec.ts --project=webkit  # iPhone Safari
npx playwright test web-presence-test.spec.ts --project=chromium # Android Chrome

# Test with screenshots
npx playwright test web-presence-test.spec.ts --headed

# Generate HTML report
npx playwright test web-presence-test.spec.ts --reporter=html
npx playwright show-report
```

---

## Integrate with CI/CD

Add to `.github/workflows/test.yml`:

```yaml
- name: Test Web Presence
  run: npx playwright test tests/web-presence-test.spec.ts
```

This ensures brand consistency and SEO stay intact after every deploy.

---

## Compare with Competitors

Want to see how you stack up?

1. Copy `web-presence-test.spec.ts`
2. Change `PRODUCTION_URL` to competitor site
3. Run tests
4. Compare keyword coverage, page speed, mobile UX

Example competitors:
- DealCheck (https://www.dealcheck.io)
- REInvestor (https://www.reinvestor.com)
- BiggerPockets Calculator (https://www.biggerpockets.com/real-estate-investment-calculator)

---

## Next Steps

1. ✅ Run tests now (before Netlify domain switch)
2. ⏳ Configure propiq.luntra.one in Netlify
3. ✅ Deploy
4. ✅ Run tests again (verify rebrand is complete)
5. 📊 Monitor weekly (track keyword rankings, page speed)

---

**Questions?** Check Playwright docs: https://playwright.dev
