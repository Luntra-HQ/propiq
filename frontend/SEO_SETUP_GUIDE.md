# PropIQ SEO Setup Guide

**Complete step-by-step guide to get PropIQ indexed and ranking in Google & Bing**

**Current Status:** Blog posts seeded ✅ | Sitemaps ready ✅ | Awaiting search console setup ⏳

**Timeline to organic traffic:** 60-90 days (typical for new blog content)

---

## Table of Contents

1. [Google Search Console Setup](#1-google-search-console-setup)
2. [Bing Webmaster Tools Setup](#2-bing-webmaster-tools-setup)
3. [Sitemap Submission](#3-sitemap-submission)
4. [Request Indexing for Priority Pages](#4-request-indexing-for-priority-pages)
5. [Schema Markup Verification](#5-schema-markup-verification)
6. [Monitoring & Analytics](#6-monitoring--analytics)
7. [Ongoing SEO Maintenance](#7-ongoing-seo-maintenance)

---

## 1. Google Search Console Setup

### Step 1: Add Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Choose **"URL prefix"** method (not Domain)
4. Enter: `https://propiq.luntra.one`
5. Click **Continue**

### Step 2: Verify Ownership

**Method A - HTML File Upload (Recommended)**

1. Google will show you a verification file (e.g., `google1234abcd.html`)
2. Download the file
3. Replace `/frontend/public/google-site-verification.html` with this file
4. Deploy to production
5. Click **"Verify"** in Google Search Console
6. ✅ Verification complete!

**Method B - Meta Tag (Alternative)**

1. Copy the meta tag provided by Google
2. Open `frontend/index.html`
3. Add the tag in the `<head>` section:
   ```html
   <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   ```
4. Deploy to production
5. Click **"Verify"** in Google Search Console

### Step 3: Confirm Verification

- You should see ✅ "Ownership verified" in Search Console
- It may take a few minutes for the verification to complete

---

## 2. Bing Webmaster Tools Setup

### Why Bing Matters

- Powers **DuckDuckGo**, **Yahoo**, and **Alexa** search
- ~6% of search market share (~15M daily searches in US)
- Often **indexes faster** than Google
- Less competition = easier to rank
- Free additional traffic source

### Step 1: Add Site

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sign in with Microsoft account (create one if needed)
3. Click **"Add a site"**
4. Enter: `https://propiq.luntra.one`

### Step 2: Verify Ownership

**Option A - Import from Google Search Console (Easiest)**

1. If you've already set up Google Search Console, click **"Import from Google"**
2. Authorize Bing to access your GSC data
3. Select `propiq.luntra.one`
4. Click **Import**
5. ✅ Done! (This also imports your sitemap automatically)

**Option B - XML File Authentication**

1. Download `BingSiteAuth.xml` from Bing
2. Replace `/frontend/public/BingSiteAuth.xml` with the downloaded file
3. Deploy to production
4. Click **"Verify"** in Bing Webmaster Tools

**Option C - Meta Tag**

1. Copy the meta tag from Bing
2. Add to `frontend/index.html` in `<head>`:
   ```html
   <meta name="msvalidate.01" content="YOUR_CODE_HERE" />
   ```
3. Deploy and verify

---

## 3. Sitemap Submission

### Sitemaps Available

PropIQ has **2 sitemaps**:

1. **`sitemap.xml`** - Static pages (homepage, pricing, calculator, /blog)
2. **`sitemap-dynamic.xml`** - Blog posts (auto-generated from Convex)

### Submit to Google Search Console

1. In Google Search Console, go to **Sitemaps** (left sidebar)
2. Click **"Add a new sitemap"**
3. Enter: `sitemap.xml`
4. Click **Submit**
5. Repeat for `sitemap-dynamic.xml`

**Expected result:**
- Status: ✅ Success
- URLs discovered: ~10 (sitemap.xml) + 5 (sitemap-dynamic.xml)

### Submit to Bing Webmaster Tools

1. In Bing Webmaster Tools, go to **Sitemaps** (left menu)
2. Click **"Submit Sitemap"**
3. Enter: `https://propiq.luntra.one/sitemap.xml`
4. Click **Submit**
5. Repeat for `https://propiq.luntra.one/sitemap-dynamic.xml`

**Note:** If you imported from Google Search Console, sitemaps are automatically added.

---

## 4. Request Indexing for Priority Pages

Don't wait for Google to discover your pages organically — request indexing immediately.

### Google Search Console - URL Inspection Tool

1. In Google Search Console, click **"URL Inspection"** (top center)
2. Enter the first URL: `https://propiq.luntra.one/blog/cap-rate-calculator-guide`
3. Click **"Request Indexing"**
4. Wait 1-2 minutes for confirmation
5. Repeat for all priority pages (see list below)

### Priority Pages (Request in this order)

**High Priority - Request indexing for these first:**

1. `https://propiq.luntra.one/blog/cap-rate-calculator-guide` (highest search volume)
2. `https://propiq.luntra.one/blog/rental-property-cash-flow-analysis`
3. `https://propiq.luntra.one/blog/1-percent-rule-dead`
4. `https://propiq.luntra.one/blog/hidden-costs-rental-property-roi`
5. `https://propiq.luntra.one/blog/propiq-vs-spreadsheets`

**Medium Priority:**

6. `https://propiq.luntra.one/blog` (blog index)
7. `https://propiq.luntra.one/` (homepage)
8. `https://propiq.luntra.one/pricing`

**Note:** You can request indexing for up to **10 URLs per day** in Google Search Console.

### Bing Webmaster Tools - URL Submission

1. In Bing Webmaster Tools, go to **"URL Submission"**
2. Enter up to 10 URLs at once (paste list above)
3. Click **Submit**

**Bing allows up to 10 URLs/day (free tier).**

---

## 5. Schema Markup Verification

PropIQ already has rich schema markup implemented. Let's verify it's working correctly.

### What Schema is Implemented?

**Homepage (`/`):**
- ✅ Organization schema (LUNTRA company info)
- ✅ SoftwareApplication schema (PropIQ product)
- ✅ Product schema (with pricing and ratings)
- ✅ WebSite schema (with search action)
- ✅ BreadcrumbList schema

**Blog Index (`/blog`):**
- ✅ Blog schema (PropIQ Insights)

**Blog Posts (`/blog/:slug`):**
- ✅ Article schema (with author, publish date, image)

### Verify Schema with Google Rich Results Test

1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter URL: `https://propiq.luntra.one`
3. Click **"Test URL"**
4. Wait 10-20 seconds
5. **Expected result:**
   - ✅ "Page is eligible for rich results"
   - Detected schema: SoftwareApplication, Product, Organization
6. Repeat for:
   - `https://propiq.luntra.one/blog`
   - `https://propiq.luntra.one/blog/cap-rate-calculator-guide`

### Verify with Schema.org Validator

1. Go to [Schema.org Validator](https://validator.schema.org/)
2. Enter URL: `https://propiq.luntra.one`
3. Click **"Run Test"**
4. **Expected result:**
   - ✅ No errors
   - 5+ schema types detected

**If you see warnings, that's okay.** Errors are bad, warnings are fine.

---

## 6. Monitoring & Analytics

### What to Monitor

| Metric | Tool | Target |
|--------|------|--------|
| **Indexing Status** | Google Search Console → Coverage | 15 pages indexed |
| **Impressions** | Google Search Console → Performance | 100+/week (Month 2) |
| **Click-through Rate** | Google Search Console → Performance | 3-5% average |
| **Average Position** | Google Search Console → Performance | <50 (Month 2), <20 (Month 6) |
| **Organic Traffic** | Microsoft Clarity / GA4 | 50+ visits/week (Month 3) |
| **Page Speed** | PageSpeed Insights | 90+ score |

### Weekly SEO Checklist

**Week 1-4 (First Month):**
- [ ] Check Google Search Console → Coverage (Are all pages indexed?)
- [ ] Check for indexing errors or warnings
- [ ] Monitor "Performance" tab for first impressions

**Month 2-3:**
- [ ] Review top queries in Google Search Console
- [ ] Identify pages with high impressions but low CTR
- [ ] Update meta descriptions to improve CTR

**Month 3+:**
- [ ] Publish new blog posts (1-2 per month)
- [ ] Run sitemap generator: `npm run generate-sitemap`
- [ ] Refresh stale content (update old posts with new data)

---

## 7. Ongoing SEO Maintenance

### Content Strategy

**Goal:** Publish 1-2 blog posts per month

**High-value topics to write about:**
- "Real Estate Cap Rate Calculator: Complete Guide 2025"
- "Best Real Estate Investment Analysis Software (2025)"
- "Rental Property Cash Flow Calculator: Free Template"
- "How to Calculate ROI on Rental Property (Step-by-Step)"
- "PropIQ vs BiggerPockets Calculator: Feature Comparison"

**Why these work:**
- High search volume (500-5K searches/month)
- Commercial intent (people searching are ready to buy tools)
- Low competition (easier to rank)

### Update Sitemap After New Posts

Whenever you publish new blog posts via Convex:

1. Run sitemap generator:
   ```bash
   cd /Users/briandusape/Projects/propiq/frontend
   npm run generate-sitemap
   ```
2. Commit and deploy:
   ```bash
   git add public/sitemap-dynamic.xml
   git commit -m "chore: update dynamic sitemap with new blog posts"
   git push
   ```
3. In Google Search Console:
   - Go to **Sitemaps**
   - Click on `sitemap-dynamic.xml`
   - If it shows errors, click **"Re-submit"**
4. In Bing Webmaster Tools:
   - Go to **Sitemaps**
   - Bing auto-refreshes sitemaps daily (no action needed)

### Link Building Strategy

**Internal Linking:**
- Link from homepage to top blog posts
- Link between related blog posts
- Add "Related Articles" section to each post (already implemented ✅)

**External Linking (Optional but powerful):**
- Share blog posts on LinkedIn, Twitter
- Submit to real estate investor communities (BiggerPockets forums)
- Guest post on real estate blogs (link back to PropIQ)

### Technical SEO Monitoring

**Monthly checks:**
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) - Target: 90+ score
- [ ] Check mobile usability in Google Search Console
- [ ] Verify HTTPS certificate is valid (auto-renewed)
- [ ] Check for broken links (use Bing Webmaster Tools → Site Scan)

---

## Expected Timeline to Results

**Week 1-2:**
- ✅ Google discovers site via sitemap submission
- ✅ First 5-10 pages indexed

**Week 3-4:**
- 🔍 Google starts crawling blog posts
- 📊 First impressions appear in Search Console (10-50/day)

**Month 2:**
- 📈 Impressions increase (100-500/day)
- 🎯 First organic clicks (5-20/week)

**Month 3:**
- ✅ Most pages indexed
- 📊 Rankings improve for long-tail keywords
- 🚀 Organic traffic: 50-100 visits/week

**Month 6:**
- 🔥 Rankings for primary keywords ("cap rate calculator", "rental property analysis")
- 📈 Organic traffic: 200-500 visits/week
- 💰 First conversions from organic traffic

---

## Troubleshooting

### "Discovered - currently not indexed" in Google Search Console

**Problem:** Google found the page but hasn't indexed it yet.

**Solution:**
1. Request indexing via URL Inspection tool
2. Wait 1-2 weeks
3. Ensure page has >300 words of content
4. Add internal links to the page from other pages

### "Crawled - currently not indexed"

**Problem:** Google crawled the page but decided not to index it (low quality signal).

**Solution:**
1. Add more unique, valuable content (aim for 1,000+ words)
2. Add images, examples, or case studies
3. Improve internal linking
4. Wait 2-4 weeks and request indexing again

### No impressions after 4 weeks

**Problem:** Pages are indexed but not showing in search results.

**Solution:**
1. Check if pages are targeting actual search queries
2. Use Google Keyword Planner to find search volume
3. Update titles and headings to match search intent
4. Be patient — new sites take 2-3 months to gain trust

---

## Resources

### Tools
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Keyword Planner](https://ads.google.com/home/tools/keyword-planner/)

### Documentation
- [Google Search Central](https://developers.google.com/search)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmasters-guidelines-30fba23a)
- [Schema.org Documentation](https://schema.org/)

---

## Summary Checklist

**Initial Setup (Do this now):**
- [ ] Set up Google Search Console
- [ ] Verify ownership (HTML file or meta tag)
- [ ] Submit `sitemap.xml` and `sitemap-dynamic.xml`
- [ ] Request indexing for 5 priority blog posts
- [ ] Set up Bing Webmaster Tools (import from Google)
- [ ] Verify schema markup with Rich Results Test

**Weekly Tasks:**
- [ ] Check Google Search Console for new issues
- [ ] Monitor impressions and click data
- [ ] Review top queries

**Monthly Tasks:**
- [ ] Publish 1-2 new blog posts
- [ ] Run `npm run generate-sitemap`
- [ ] Update old content with fresh data
- [ ] Check PageSpeed score

**Quarterly Tasks:**
- [ ] Review ranking progress
- [ ] Identify new keyword opportunities
- [ ] Update meta descriptions for low-CTR pages
- [ ] Build backlinks (guest posts, social shares)

---

**Next Steps:**
1. Complete Google Search Console setup (15 min)
2. Complete Bing Webmaster Tools setup (10 min)
3. Submit sitemaps (5 min)
4. Request indexing for priority pages (10 min)

**Total time to complete setup: ~45 minutes**

After that, organic traffic growth is on autopilot. Just publish new content monthly and monitor Search Console.

🚀 **Let's get PropIQ indexed and ranking!**
