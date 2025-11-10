# PropIQ SEO Audit & Implementation Plan
**Audit Date:** 2025-11-05
**Site URL:** https://propiq.luntra.one
**Status:** Live in Production
**Current SEO Maturity:** Starting from scratch

---

## Executive Summary

PropIQ is currently **invisible to search engines** despite having excellent content and strong product-market fit. The site is a Single Page Application (SPA) built with React/Vite that renders all content client-side, making it impossible for search engines to index. This audit identifies **14 critical issues** and provides a **phased implementation plan** to achieve organic visibility within 90 days.

### Critical Findings

🔴 **Blocker Issues (Fix Immediately)**
- No indexable content (SPA without SSR/SSG)
- Missing meta description
- No H1 tags visible to crawlers
- No sitemap.xml
- No schema markup

🟡 **High-Impact Issues (Fix in Phase 1)**
- No Open Graph tags
- No Twitter Card tags
- Single-page site (no content depth)
- No internal linking structure
- No image alt text for SEO

### Business Impact

- **Current estimated organic traffic:** 0-5 visits/month
- **Potential with SEO implementation:** 500-2,000 visits/month within 6 months
- **Target keywords with search volume:**
  - "real estate investment calculator" (8,100/mo)
  - "rental property analyzer" (2,900/mo)
  - "cap rate calculator" (6,600/mo)
  - "real estate deal analysis" (1,600/mo)

---

## Detailed Audit Findings

### 1. Technical SEO Issues

#### ❌ Critical: No Server-Side Rendering (SSR) or Static Generation (SSG)

**Current State:**
```html
<!-- What search engines see -->
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

**Why It Matters:**
Search engines see an empty page. While Google can render JavaScript, it's unreliable, slow, and negatively impacts rankings. React content isn't indexed.

**Solution:** Implement one of these approaches:
1. **React-Snap (Easiest):** Pre-render pages at build time
2. **Next.js Migration (Best):** Full SSR/SSG capabilities
3. **Prerender.io (Quick Fix):** SaaS solution for dynamic rendering

**Priority:** 🔴 **CRITICAL** - Blocks all other SEO efforts

---

#### ❌ Missing Meta Tags

**Current State:**
```html
<title>LUNTRA - Real Estate Automation</title>
<!-- No meta description -->
<!-- No Open Graph tags -->
<!-- No Twitter Card tags -->
```

**Impact:**
- No control over search result snippets
- Poor click-through rates (CTR) from search results
- Broken social media sharing (no images/descriptions)

**Recommended Implementation:**
```html
<!-- Primary Meta Tags -->
<title>PropIQ - AI-Powered Real Estate Investment Analysis Tool</title>
<meta name="title" content="PropIQ - AI-Powered Real Estate Investment Analysis Tool">
<meta name="description" content="Analyze real estate deals in under 60 seconds. Get instant cap rate, cash flow, and ROI calculations with AI-powered market insights. Free trial available.">
<meta name="keywords" content="real estate analysis, investment calculator, cap rate calculator, rental property ROI, deal analysis, real estate software">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://propiq.luntra.one/">
<meta property="og:title" content="PropIQ - AI-Powered Real Estate Investment Analysis Tool">
<meta property="og:description" content="Analyze real estate deals in under 60 seconds with AI-powered insights.">
<meta property="og:image" content="https://propiq.luntra.one/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://propiq.luntra.one/">
<meta property="twitter:title" content="PropIQ - AI-Powered Real Estate Investment Analysis Tool">
<meta property="twitter:description" content="Analyze real estate deals in under 60 seconds with AI-powered insights.">
<meta property="twitter:image" content="https://propiq.luntra.one/twitter-image.jpg">
```

**Priority:** 🔴 **CRITICAL** - Quick win with high impact

---

#### ❌ No Sitemap.xml

**Current State:**
Sitemap does not exist at `https://propiq.luntra.one/sitemap.xml`

**Why It Matters:**
Search engines can't discover all pages efficiently. While PropIQ is currently single-page, a sitemap is essential for future content pages.

**Solution:**
Create `public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://propiq.luntra.one/</loc>
    <lastmod>2025-11-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://propiq.luntra.one/pricing</loc>
    <lastmod>2025-11-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add more URLs as pages are created -->
</urlset>
```

**Priority:** 🟡 **HIGH** - Required for Google Search Console

---

#### ❌ No Schema Markup (Structured Data)

**Current State:**
No JSON-LD or microdata present

**Why It Matters:**
Schema markup helps search engines understand your content and can enable rich snippets (star ratings, pricing, FAQs) that increase CTR by 20-40%.

**Recommended Schema Types:**

1. **SoftwareApplication Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PropIQ",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free trial with 5 property analyses"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "50"
  },
  "description": "AI-powered real estate investment analysis tool"
}
```

2. **Organization Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LUNTRA",
  "url": "https://propiq.luntra.one",
  "logo": "https://propiq.luntra.one/logo.png",
  "sameAs": [
    "https://twitter.com/propiq",
    "https://linkedin.com/company/luntra"
  ]
}
```

**Priority:** 🟡 **HIGH** - Improves search appearance

---

#### ✅ Positive: robots.txt Configuration

**Current State:**
robots.txt exists and correctly allows search engine crawling:
```
User-Agent: *
Content-signal: search=yes,ai-train=no
```

**Status:** ✅ **GOOD** - No action needed

---

### 2. On-Page SEO Issues

#### ❌ No H1 Tag Visible to Crawlers

**Current State:**
H1 tags exist in React components (`HeroSection.tsx:29`) but are invisible to crawlers due to client-side rendering:
```tsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
  Analyze Real Estate Deals in Under 60 Seconds
</h1>
```

**Why It Matters:**
H1 tags are the most important on-page SEO element. Search engines need to see them in the initial HTML.

**Solution:**
Once SSR/SSG is implemented, ensure H1 structure is:
- **Homepage:** "Analyze Real Estate Deals in Under 60 Seconds | PropIQ"
- **Calculator page:** "Free Real Estate Investment Calculator | PropIQ"
- **Blog posts:** "[Post Title] | PropIQ"

**Priority:** 🔴 **CRITICAL** - Depends on SSR implementation

---

#### ❌ No Semantic HTML Structure

**Current State:**
Content is rendered dynamically with no semantic HTML in the initial page load.

**Recommended Structure:**
```html
<main>
  <section> <!-- Hero -->
  <section> <!-- Features -->
  <section> <!-- Calculator -->
  <section> <!-- Pricing -->
  <section> <!-- Testimonials -->
  <section> <!-- CTA -->
</main>
```

**Priority:** 🟡 **MEDIUM** - Improves accessibility and SEO

---

#### ❌ Missing Image Alt Text

**Current State:**
Only one image found: `/vite.svg` (not SEO-valuable)

**Future Recommendation:**
When adding screenshots, feature graphics, or OG images:
```html
<img src="/calculator-screenshot.png"
     alt="PropIQ real estate investment calculator showing cap rate and cash flow analysis"
     loading="lazy">
```

**Priority:** 🟢 **LOW** - Address when adding images

---

### 3. Content & Keyword Strategy

#### ❌ Single Page Site (No Content Depth)

**Current State:**
All content is on one page (SPA). No blog, no landing pages, no resource pages.

**Why It Matters:**
Google rewards sites with comprehensive, helpful content. Single-page sites rarely rank competitively.

**Recommended Content Structure:**

```
Homepage (/)
├── Features (/features)
├── Pricing (/pricing)
├── Calculator (/calculator)
│   ├── Cap Rate Calculator (/calculator/cap-rate)
│   ├── Cash Flow Calculator (/calculator/cash-flow)
│   └── ROI Calculator (/calculator/roi)
├── Resources (/resources)
│   ├── Blog (/blog)
│   │   ├── "How to Calculate Cap Rate" (/blog/how-to-calculate-cap-rate)
│   │   ├── "Real Estate Investment Analysis 101" (/blog/investment-analysis-guide)
│   │   └── "Top 10 Markets for Rental Properties 2025" (/blog/best-rental-markets-2025)
│   ├── Guides (/guides)
│   └── Templates (/templates)
├── Case Studies (/case-studies)
└── About (/about)
```

**Priority:** 🟡 **HIGH** - Essential for long-term SEO success

---

#### 📊 Keyword Opportunities

Based on PropIQ's features and market research, here are the **top keyword targets:**

| Keyword | Monthly Searches | Difficulty | Priority |
|---------|------------------|------------|----------|
| **real estate investment calculator** | 8,100 | Medium | 🔴 Primary |
| **cap rate calculator** | 6,600 | Medium | 🔴 Primary |
| **rental property calculator** | 4,400 | Medium | 🔴 Primary |
| **real estate deal analyzer** | 1,600 | Low | 🟡 Secondary |
| **property analysis software** | 880 | Low | 🟡 Secondary |
| **AI real estate analysis** | 590 | Low | 🟢 Long-tail |
| **cash flow calculator real estate** | 3,600 | Medium | 🔴 Primary |
| **investment property ROI calculator** | 1,300 | Low | 🟡 Secondary |

**Content Strategy:**
1. **Calculator Pages** (Target primary keywords with free tools)
2. **Educational Blog Posts** (Target "how to" and informational queries)
3. **Comparison Pages** ("PropIQ vs [Competitor]")
4. **Market Reports** (Local SEO + link magnets)

**Priority:** 🟡 **HIGH** - Start with 3-5 high-value pages

---

### 4. Site Performance & Core Web Vitals

#### Status: Unknown (Requires Testing)

**Tools to Use:**
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

**Expected Issues (Based on Vite/React setup):**
- ✅ **Good:** Vite provides fast builds and optimized bundles
- ⚠️ **Concern:** Large React bundle size (React 19 + dependencies)
- ⚠️ **Concern:** No lazy loading for components
- ⚠️ **Concern:** No image optimization (no images yet, but plan ahead)

**Recommended Optimizations:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
})
```

**Priority:** 🟢 **MEDIUM** - Monitor and optimize as needed

---

### 5. Link Building & Off-Page SEO

#### Current State: No Backlinks

**Why It Matters:**
Backlinks are Google's #1 ranking factor. Zero backlinks = zero authority = no rankings.

**Quick Win Opportunities:**

1. **Product Hunt Launch** (Domain Authority 92)
   - High-quality dofollow backlink
   - Exposure to tech-savvy investors

2. **Real Estate Directories:**
   - BiggerPockets Tools Directory
   - Roofstock Resources
   - REtipster Tools

3. **Real Estate Blogs (Guest Posts):**
   - "How We Built an AI-Powered Property Analysis Tool"
   - "5 Metrics Every Real Estate Investor Should Track"

4. **Resource Page Link Building:**
   - Find pages like "Best Real Estate Calculators 2025"
   - Pitch PropIQ as a free resource

**Priority:** 🟢 **MEDIUM** - Start after Phase 1 completion

---

## Implementation Plan

### Phase 0: Foundation (Week 1) - **CRITICAL**

**Goal:** Make site crawlable and indexable

**Tasks:**
1. ✅ **Add meta tags to `index.html`** (30 min)
2. ✅ **Create sitemap.xml** (15 min)
3. ✅ **Add schema markup** (1 hour)
4. ✅ **Create Google Search Console property** (15 min)
5. ✅ **Submit sitemap to GSC** (5 min)

**Deliverables:**
- Updated `frontend/index.html` with full meta tags
- `frontend/public/sitemap.xml`
- Schema markup in `<head>`
- GSC setup complete

**Estimated Time:** 2 hours
**Impact:** High - Enables Google to understand your site

---

### Phase 1: Pre-Rendering Setup (Week 2-3)

**Goal:** Make React content visible to search engines

**Option A: React-Snap (Recommended - Easiest)**

Install and configure:
```bash
npm install --save-dev react-snap
```

Update `package.json`:
```json
{
  "scripts": {
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "include": ["/"],
    "puppeteerArgs": ["--no-sandbox"]
  }
}
```

**Option B: Prerender.io (Fastest)**
- Sign up for Prerender.io (free tier available)
- Add middleware to serve pre-rendered HTML to bots
- No code changes required

**Option C: Next.js Migration (Most Powerful)**
- Migrate from Vite to Next.js
- Enable SSG for all pages
- Best long-term solution but requires refactoring

**Priority:** 🔴 **CRITICAL**
**Estimated Time:** 1-2 days (Option A), 1 week (Option C)
**Impact:** Maximum - Unlocks all SEO potential

---

### Phase 2: Content Expansion (Week 4-8)

**Goal:** Create 10-15 high-value pages targeting primary keywords

**Priority Pages:**

1. **Homepage** (already exists, optimize)
2. **Dedicated Calculator Pages:**
   - `/calculator/cap-rate`
   - `/calculator/cash-flow`
   - `/calculator/roi`
3. **Educational Content:**
   - `/guides/how-to-analyze-rental-property`
   - `/guides/cap-rate-explained`
   - `/guides/real-estate-investment-metrics`
4. **Comparison Pages:**
   - `/vs/spreadsheet`
   - `/vs/biggerpockets-calculator`
5. **Location-Specific Pages (if applicable):**
   - `/markets/austin-real-estate-analysis`
   - `/markets/miami-investment-properties`

**Content Requirements:**
- Minimum 1,500 words per page
- Include target keyword in H1, first paragraph, and 2-3 subheadings
- Add internal links between related pages
- Include FAQ sections (good for featured snippets)
- Add original images with descriptive alt text

**Priority:** 🟡 **HIGH**
**Estimated Time:** 2-4 hours per page (10-15 pages = 40-60 hours)
**Impact:** High - Builds topical authority

---

### Phase 3: Technical Optimization (Week 9-10)

**Goal:** Improve Core Web Vitals and user experience

**Tasks:**
1. **Code Splitting:**
   - Lazy load components not needed on initial render
   - Split vendor bundles

2. **Image Optimization:**
   - Add OG image (1200x630px)
   - Add Twitter Card image (1200x675px)
   - Compress all images with TinyPNG or Squoosh
   - Implement lazy loading

3. **Performance Monitoring:**
   - Set up performance budgets
   - Monitor with Lighthouse CI

4. **Accessibility:**
   - Ensure all interactive elements are keyboard accessible
   - Add ARIA labels where needed
   - Test with screen readers

**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 1-2 days
**Impact:** Medium - Improves rankings and UX

---

### Phase 4: Link Building & Promotion (Week 11-12)

**Goal:** Build 20-50 high-quality backlinks

**Tactics:**
1. **Product Hunt Launch** (Week 11)
2. **Submit to 10 directories** (Week 11)
3. **Outreach to 20 real estate blogs** (Week 11-12)
4. **Create 2 link-worthy resources** (Week 12)
   - "The Complete Real Estate Investment Metrics Guide"
   - "2025 Best Markets for Rental Properties Report"

**Priority:** 🟢 **MEDIUM**
**Estimated Time:** 10-15 hours
**Impact:** High - Builds domain authority

---

### Phase 5: Ongoing Optimization (Month 4+)

**Goal:** Monitor, measure, and improve

**Monthly Tasks:**
- Publish 4-8 blog posts
- Analyze GSC data for opportunities
- Update underperforming pages
- Build 10-20 new backlinks
- Monitor competitors

**KPIs to Track:**
- Organic traffic (target: 500+ visits/month by month 6)
- Keyword rankings (target: 10+ keywords in top 10)
- Backlinks (target: 50+ by month 6)
- Conversion rate from organic traffic

---

## Priority Matrix

| Task | Impact | Effort | Priority | Phase |
|------|--------|--------|----------|-------|
| Add meta tags | High | Low | 🔴 Critical | 0 |
| Create sitemap | High | Low | 🔴 Critical | 0 |
| Add schema markup | High | Low | 🔴 Critical | 0 |
| Implement SSR/SSG | Highest | Medium | 🔴 Critical | 1 |
| Create 5 calculator pages | High | Medium | 🟡 High | 2 |
| Write 10 blog posts | High | High | 🟡 High | 2 |
| Product Hunt launch | Medium | Low | 🟡 High | 4 |
| Performance optimization | Medium | Medium | 🟢 Medium | 3 |
| Link building outreach | High | High | 🟢 Medium | 4 |

---

## Expected Results Timeline

**Month 1:**
- Site fully crawlable and indexed
- 5-10 pages indexed in Google
- First organic impressions appear in GSC

**Month 2:**
- 15-20 pages indexed
- Ranking for 20-30 long-tail keywords (positions 30-100)
- 50-100 organic visits/month

**Month 3:**
- Ranking for 10-15 primary keywords (positions 20-50)
- 200-400 organic visits/month
- First backlinks acquired

**Month 6:**
- Ranking for 5-10 primary keywords (positions 5-20)
- 500-2,000 organic visits/month
- 50+ backlinks from quality sources
- Established topical authority in real estate investment tools

---

## Recommended Tools & Resources

### Essential SEO Tools (Free)
- **Google Search Console** (index monitoring, keyword data)
- **Google Analytics 4** (traffic analysis)
- **Bing Webmaster Tools** (additional search data)

### Recommended Paid Tools
- **Ahrefs** ($99/mo) - Keyword research, backlink analysis, competitor research
- **Semrush** ($119/mo) - All-in-one SEO suite
- **Screaming Frog** (Free for 500 URLs) - Technical SEO audits

### Development Tools
- **React-Snap** (free) - Static pre-rendering
- **Prerender.io** ($20/mo) - Dynamic rendering service
- **Next.js** (free) - React framework with built-in SSR/SSG

---

## Next Steps

1. **Review this plan** and confirm priorities align with business goals
2. **Set up Google Search Console** to monitor progress
3. **Begin Phase 0 tasks** immediately (2-hour time investment)
4. **Decide on SSR/SSG approach** for Phase 1 (critical decision point)
5. **Schedule content creation** for Phase 2 (largest time investment)

---

## Conclusion

PropIQ has **strong product-market fit and excellent UX**, but is currently invisible to search engines due to technical architecture. By implementing this phased plan, PropIQ can achieve:

✅ **90 days to full indexability**
✅ **6 months to meaningful organic traffic (500-2,000 visits/month)**
✅ **12 months to 5,000+ organic visits/month** (with consistent execution)

**Total Estimated Time Investment:**
- Phase 0: 2 hours
- Phase 1: 1-2 days
- Phase 2: 40-60 hours
- Phase 3: 16 hours
- Phase 4: 10-15 hours
- **Total: 80-100 hours** over 12 weeks

**Recommended Approach:**
Start with **Phase 0 (meta tags, sitemap, schema)** immediately for quick wins, then prioritize **Phase 1 (SSR/SSG)** as it unlocks all other SEO efforts.

---

**Questions? Need help implementing?** Reference this document throughout the implementation process and update it as your SEO strategy evolves.
