# PropIQ SEO Setup Guide

**Complete guide for configuring search engine optimization and webmaster tools**

**Last Updated:** 2025-11-06
**Domain:** propiq.luntra.one
**Status:** Production Ready

---

## Table of Contents

1. [Google Search Console Setup](#google-search-console-setup)
2. [Bing Webmaster Tools Setup](#bing-webmaster-tools-setup)
3. [Sitemap Submission](#sitemap-submission)
4. [Analytics Integration](#analytics-integration)
5. [Schema Markup Validation](#schema-markup-validation)
6. [Performance Monitoring](#performance-monitoring)
7. [Local SEO Setup](#local-seo-setup)
8. [Social Media Integration](#social-media-integration)
9. [Troubleshooting](#troubleshooting)

---

## Google Search Console Setup

### Step 1: Verify Domain Ownership

**Recommended Method: DNS Verification (Most Reliable)**

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property" → "Domain" (not URL prefix)
3. Enter: `propiq.luntra.one`
4. Google will provide a TXT record

**DNS Record to Add:**
```
Type: TXT
Name: @ (or root domain)
Value: google-site-verification=XXXXXXXXXXXXX
TTL: 3600 (1 hour)
```

5. Add this TXT record to your DNS provider (Netlify/Cloudflare)
6. Wait 5-10 minutes for DNS propagation
7. Click "Verify" in Google Search Console

**Alternative: HTML Meta Tag (Already Implemented)**

The index.html file can be updated with:
```html
<meta name="google-site-verification" content="XXXXXXXXXXXXX" />
```

Add this in the `<head>` section after receiving the verification code from Google.

### Step 2: Submit Sitemap

1. Once verified, go to "Sitemaps" in the left sidebar
2. Enter sitemap URL: `https://propiq.luntra.one/sitemap.xml`
3. Click "Submit"
4. Google will start crawling within 24-48 hours

**Expected Result:**
- Status: "Success"
- Discovered URLs: 3+ pages
- Last read: (current date)

### Step 3: Configure Settings

**URL Inspection:**
- Test homepage: `https://propiq.luntra.one/`
- Verify it's indexed and mobile-friendly

**Coverage Report:**
- Monitor "Valid" pages (should be green)
- Fix any "Error" or "Excluded" pages

**Performance:**
- Track clicks, impressions, CTR, and position
- Monitor top queries and pages

**Core Web Vitals:**
- Ensure all pages pass Core Web Vitals
- Target: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## Bing Webmaster Tools Setup

### Step 1: Import from Google Search Console (Easiest)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sign in with Microsoft account
3. Click "Import from Google Search Console"
4. Authorize access
5. Select "propiq.luntra.one"
6. Click "Import"

**Advantage:** Automatically imports sitemap and settings from Google.

### Alternative: Manual Verification

1. Go to Bing Webmaster Tools
2. Add site: `https://propiq.luntra.one`
3. Choose verification method:
   - **Option 1:** Add `<meta>` tag to index.html
   - **Option 2:** Upload XML file
   - **Option 3:** Add CNAME record

**Meta Tag Method:**
```html
<meta name="msvalidate.01" content="XXXXXXXXXXXXX" />
```

### Step 2: Submit Sitemap

1. Go to "Sitemaps" section
2. Enter: `https://propiq.luntra.one/sitemap.xml`
3. Click "Submit"

### Step 3: Configure Bing Settings

**Crawl Control:**
- Set crawl rate to "Normal"
- Enable "Ignore URL parameters" if needed

**Geo-Targeting:**
- Set to "United States" (primary market)

---

## Sitemap Submission

### Automatic Submission via robots.txt

The robots.txt file already includes:
```
Sitemap: https://propiq.luntra.one/sitemap.xml
```

This tells all search engines where to find the sitemap.

### Manual Submission to Other Search Engines

**DuckDuckGo:**
- Uses Bing's index (covered by Bing Webmaster Tools)

**Yandex (Russian market):**
1. Go to [Yandex Webmaster](https://webmaster.yandex.com)
2. Add site: `https://propiq.luntra.one`
3. Verify via meta tag or DNS
4. Submit sitemap

**Baidu (Chinese market):**
1. Go to [Baidu Webmaster Tools](https://ziyuan.baidu.com)
2. Add site and verify
3. Submit sitemap

---

## Analytics Integration

### Microsoft Clarity (Already Integrated)

**Project ID:** tts5hc8zf8

**Verify Installation:**
1. Go to [Microsoft Clarity](https://clarity.microsoft.com)
2. Select project "PropIQ"
3. Check "Setup" → verify script is detected
4. View dashboard for user recordings and heatmaps

**Key Metrics to Monitor:**
- Session recordings (user behavior)
- Heatmaps (click patterns)
- Rage clicks (user frustration)
- Dead clicks (broken elements)
- Scroll depth

### Google Analytics 4 (Optional - Recommended)

**Setup:**
1. Create GA4 property at [Google Analytics](https://analytics.google.com)
2. Get Measurement ID (format: G-XXXXXXXXXX)
3. Add to `index.html`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Benefits:**
- Track user journeys
- Conversion tracking (sign-ups, purchases)
- Demographics and interests
- Integration with Google Ads

---

## Schema Markup Validation

### Validate Structured Data

**Google Rich Results Test:**
1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Enter URL: `https://propiq.luntra.one`
3. Click "Test URL"
4. Review results

**Expected Schemas:**
- ✅ SoftwareApplication
- ✅ Organization
- ✅ Product
- ✅ BreadcrumbList
- ✅ WebSite

**Schema.org Validator:**
1. Go to [Schema.org Validator](https://validator.schema.org)
2. Enter URL: `https://propiq.luntra.one`
3. Check for errors or warnings

**Fix Common Issues:**
- Ensure all required properties are present
- Verify date formats (YYYY-MM-DD)
- Check URL formats (absolute URLs)
- Validate image dimensions

---

## Performance Monitoring

### PageSpeed Insights

**Test Performance:**
1. Go to [PageSpeed Insights](https://pagespeed.web.dev)
2. Enter URL: `https://propiq.luntra.one`
3. Click "Analyze"

**Target Scores:**
- Mobile: 90+ (green)
- Desktop: 95+ (green)

**Core Web Vitals Targets:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Common Optimizations:**
- Enable Netlify CDN caching
- Compress images (use WebP format)
- Lazy load images
- Minify CSS/JS (done by Vite)
- Enable Brotli compression

### WebPageTest

**Advanced Testing:**
1. Go to [WebPageTest](https://www.webpagetest.org)
2. Enter URL: `https://propiq.luntra.one`
3. Select test location: "Virginia" (closest to users)
4. Run test

**Analyze:**
- Time to First Byte (TTFB): < 600ms
- Start Render: < 1.5s
- Fully Loaded: < 3s

---

## Local SEO Setup

### Google Business Profile (If Applicable)

**If LUNTRA has a physical office:**
1. Go to [Google Business Profile](https://business.google.com)
2. Create/claim business listing
3. Add PropIQ as a product/service
4. Link to `https://propiq.luntra.one`

**Benefits:**
- Appear in local search results
- Google Maps integration
- Customer reviews

### Local Citations

**Submit to:**
- Yelp (business listing)
- Yellow Pages
- Bing Places
- Apple Maps

---

## Social Media Integration

### Open Graph Testing

**Facebook Debugger:**
1. Go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter URL: `https://propiq.luntra.one`
3. Click "Debug"
4. Verify OG tags display correctly
5. Click "Scrape Again" to refresh cache

**Expected Display:**
- Title: "PropIQ - AI Real Estate Investment Analysis in 30 Seconds"
- Description: (truncated to ~150 chars)
- Image: og-image.jpg (1200x630px)

### Twitter Card Validator

1. Go to [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Enter URL: `https://propiq.luntra.one`
3. Click "Preview Card"

**Note:** Requires Twitter/X account login

**Expected Display:**
- Card Type: Summary with Large Image
- Title: PropIQ - AI Real Estate Investment Analysis
- Image: twitter-image.jpg

### LinkedIn Post Inspector

1. Go to [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
2. Enter URL: `https://propiq.luntra.one`
3. Inspect

**Benefit:** Pre-cache for LinkedIn sharing

---

## Image Requirements

### Create Missing Images

**Priority 1: Open Graph Image**
- **File:** `frontend/public/og-image.jpg`
- **Dimensions:** 1200 x 630 px
- **Format:** JPG or PNG
- **Max Size:** 8 MB
- **Content:** PropIQ branding + key value proposition

**Priority 2: Twitter Image**
- **File:** `frontend/public/twitter-image.jpg`
- **Dimensions:** 1200 x 675 px (16:9 ratio)
- **Format:** JPG or PNG
- **Max Size:** 5 MB

**Priority 3: Favicon**
- **File:** `frontend/public/favicon.ico`
- **Dimensions:** 32x32, 16x16 (multi-size)
- **Format:** ICO
- **Alternative:** Use PNG (favicon-32x32.png, favicon-16x16.png)

**Priority 4: Apple Touch Icon**
- **File:** `frontend/public/apple-touch-icon.png`
- **Dimensions:** 180 x 180 px
- **Format:** PNG

**Update index.html with:**
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

---

## Monitoring Schedule

### Daily Checks (Automated)
- Server uptime (Microsoft Clarity)
- Core Web Vitals
- Error monitoring

### Weekly Checks
- Google Search Console coverage
- New backlinks (Google Search Console)
- Top queries and pages

### Monthly Checks
- Organic traffic growth (Analytics)
- Keyword rankings
- Competitor analysis
- Content updates needed

### Quarterly Reviews
- SEO strategy assessment
- Content plan update
- Technical SEO audit
- Schema markup updates

---

## Troubleshooting

### Issue: Site Not Indexed After 2 Weeks

**Solutions:**
1. Use URL Inspection tool in Google Search Console
2. Click "Request Indexing"
3. Check robots.txt is not blocking crawlers
4. Verify sitemap is submitted correctly
5. Check for manual penalties (GSC → Security & Manual Actions)

### Issue: Poor Core Web Vitals

**LCP (Largest Contentful Paint) Too Slow:**
- Optimize images (WebP, lazy loading)
- Use CDN (Netlify already provides this)
- Preload critical resources
- Reduce server response time

**FID (First Input Delay) Issues:**
- Reduce JavaScript execution time
- Code split large bundles
- Use React.lazy() for route splitting

**CLS (Cumulative Layout Shift) Problems:**
- Add explicit width/height to images
- Reserve space for dynamic content
- Avoid inserting content above existing content

### Issue: Structured Data Errors

**Common Fixes:**
- Use absolute URLs (https://propiq.luntra.one/...)
- Format dates correctly (YYYY-MM-DD)
- Include all required properties
- Validate JSON-LD syntax

### Issue: Low Click-Through Rate (CTR)

**Optimize Meta Tags:**
- Make title more compelling
- Add numbers or power words to description
- Include call-to-action in description
- Test different variations

---

## Next Steps After Setup

### Week 1-2: Verification
- [ ] Verify Google Search Console
- [ ] Verify Bing Webmaster Tools
- [ ] Submit sitemaps to both
- [ ] Create and upload social sharing images
- [ ] Test all meta tags with debugging tools

### Week 3-4: Monitoring
- [ ] Check indexation status daily
- [ ] Monitor initial keyword rankings
- [ ] Review Clarity recordings
- [ ] Identify and fix any crawl errors

### Month 2: Optimization
- [ ] Analyze top-performing pages
- [ ] Optimize underperforming pages
- [ ] Create content for high-value keywords
- [ ] Build quality backlinks

### Month 3+: Growth
- [ ] Launch blog for content marketing
- [ ] Create educational guides (from sitemap recommendations)
- [ ] Build comparison pages
- [ ] Implement internal linking strategy

---

## Important Links

**Search Engine Tools:**
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Google Analytics](https://analytics.google.com)
- [Microsoft Clarity](https://clarity.microsoft.com)

**Testing Tools:**
- [Google PageSpeed Insights](https://pagespeed.web.dev)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [WebPageTest](https://www.webpagetest.org)

**SEO Tools (Optional):**
- [Ahrefs](https://ahrefs.com) - Backlink analysis, keyword research
- [SEMrush](https://www.semrush.com) - Competitor analysis
- [Moz](https://moz.com) - Domain authority, keyword tracking

---

**Last Updated:** 2025-11-06
**Maintained By:** LUNTRA Team
**Questions?** Contact: support@luntra.one
