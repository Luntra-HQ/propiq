# Google Search Console Setup Guide for PropIQ

## Overview
Google Search Console (GSC) is a free tool that helps you monitor, maintain, and troubleshoot your site's presence in Google Search results. This guide walks you through setting up GSC for PropIQ.

---

## Prerequisites

- PropIQ must be deployed to production at `https://propiq.luntra.one`
- You must have a Google account
- You need access to either:
  - PropIQ's DNS settings, OR
  - Ability to upload files to the website

---

## Step-by-Step Setup

### Step 1: Go to Google Search Console

1. Open your browser and go to: https://search.google.com/search-console
2. Sign in with your Google account (use your LUNTRA business account if available)

---

### Step 2: Add Property

1. Click **"Add property"** button
2. You'll see two options:

#### Option A: Domain Property (Recommended)
- **What it tracks:** All subdomains and protocols (http, https, www, non-www)
- **URL to enter:** `luntra.one` (without https://)
- **Verification method:** DNS TXT record

#### Option B: URL Prefix Property (Easier)
- **What it tracks:** Only the exact URL specified
- **URL to enter:** `https://propiq.luntra.one`
- **Verification methods:** Multiple options (HTML file upload, HTML tag, etc.)

**For PropIQ, use Option B (URL Prefix) for easier setup.**

3. Enter: `https://propiq.luntra.one`
4. Click **"Continue"**

---

### Step 3: Verify Ownership

You'll see several verification methods. Choose the easiest one for your setup:

#### Method 1: HTML File Upload (Recommended - Easiest)

1. Download the HTML verification file (e.g., `google1234567890abcdef.html`)
2. Place it in: `/propiq/frontend/public/google1234567890abcdef.html`
3. Rebuild and deploy your site:
   ```bash
   cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/frontend
   npm run build
   # Then deploy to production
   ```
4. Verify the file is accessible at: `https://propiq.luntra.one/google1234567890abcdef.html`
5. Return to GSC and click **"Verify"**

#### Method 2: HTML Tag (Alternative)

1. Copy the meta tag provided (looks like: `<meta name="google-site-verification" content="ABC123..." />`)
2. Add it to `/propiq/frontend/index.html` in the `<head>` section:
   ```html
   <head>
     <!-- Other meta tags -->
     <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
   </head>
   ```
3. Rebuild and deploy
4. Return to GSC and click **"Verify"**

#### Method 3: DNS Record (Most Complex)

1. Copy the TXT record provided
2. Log in to your DNS provider (wherever luntra.one is hosted)
3. Add a TXT record with the verification string
4. Wait for DNS propagation (can take 24-72 hours)
5. Return to GSC and click **"Verify"**

---

### Step 4: Submit Sitemap

Once verified:

1. In the left sidebar, click **"Sitemaps"**
2. Enter: `sitemap.xml`
3. Click **"Submit"**
4. Status should change to "Success" within a few hours

---

## Post-Setup Tasks

### 1. Request Indexing (Optional but Recommended)

1. Go to **"URL Inspection"** in the left sidebar
2. Enter: `https://propiq.luntra.one`
3. Click **"Test live URL"**
4. If the URL is valid, click **"Request indexing"**
5. This speeds up the indexing process (normally takes 1-7 days)

---

### 2. Set Up Email Alerts

1. Click the gear icon (⚙️) in the top right
2. Click **"Users and permissions"**
3. Add team members who should receive alerts
4. Alerts include:
   - Critical site issues
   - Manual actions (penalties)
   - Security issues

---

### 3. Link Google Analytics (Optional)

1. In GSC, click the gear icon (⚙️)
2. Click **"Property settings"**
3. Under **"Associations"**, click **"Associate with Google Analytics"**
4. Select your GA4 property
5. This enables cross-platform reporting

---

## What to Monitor in GSC

### Week 1-2: Initial Indexing
- **Coverage tab:** Check how many pages are indexed
- **URL Inspection:** Test individual pages
- **Expected:** 1-5 pages indexed initially

### Week 3-4: Early Performance
- **Performance tab:** Check impressions (how often PropIQ appears in search)
- **Coverage tab:** Ensure no errors
- **Expected:** 10-100 impressions/week

### Month 2-3: Growth Phase
- **Performance tab:** Monitor clicks and average position
- **Queries:** See what keywords people are searching
- **Expected:** 100-1,000 impressions/month, 5-50 clicks/month

### Month 4+: Optimization
- **Performance tab:** Identify top-performing pages
- **Links:** Monitor backlinks
- **Mobile Usability:** Ensure no mobile issues
- **Core Web Vitals:** Monitor page speed

---

## Common Issues & Solutions

### Issue: "URL is not on Google"
**Solution:**
- Wait 3-7 days after submitting sitemap
- Use "Request Indexing" feature
- Ensure robots.txt allows crawling

### Issue: "Crawled - currently not indexed"
**Cause:** Google crawled the page but chose not to index it (common for low-value pages or SPA issues)
**Solution:**
- Implement SSR/SSG (Phase 1 of SEO plan)
- Add more unique, valuable content
- Build backlinks to the page

### Issue: "Submitted URL marked 'noindex'"
**Solution:**
- Check that `<meta name="robots" content="index, follow">` is in your HTML
- Ensure no conflicting robots directives

### Issue: Sitemap shows errors
**Solution:**
- Verify sitemap is accessible at `https://propiq.luntra.one/sitemap.xml`
- Validate XML syntax at https://www.xml-sitemaps.com/validate-xml-sitemap.html
- Ensure all URLs in sitemap are live (return 200 status)

---

## Key Metrics to Track

### Short-term (Month 1-3)
| Metric | Target |
|--------|--------|
| Pages indexed | 5-10 pages |
| Total impressions | 100-500/month |
| Total clicks | 5-20/month |
| Average position | 30-60 |

### Medium-term (Month 4-6)
| Metric | Target |
|--------|--------|
| Pages indexed | 15-30 pages |
| Total impressions | 1,000-5,000/month |
| Total clicks | 50-200/month |
| Average position | 15-30 |

### Long-term (Month 7-12)
| Metric | Target |
|--------|--------|
| Pages indexed | 30-100 pages |
| Total impressions | 5,000-20,000/month |
| Total clicks | 500-2,000/month |
| Average position | 5-15 |

---

## Additional Tools to Set Up

### 1. Bing Webmaster Tools
- URL: https://www.bing.com/webmasters
- Import settings from Google Search Console (saves time)
- Bing has 3-5% market share but easier to rank on

### 2. Ahrefs Webmaster Tools (Free)
- URL: https://ahrefs.com/webmaster-tools
- Free backlink monitoring
- Technical SEO audit
- Keyword rankings

### 3. Semrush (Optional - Paid)
- Comprehensive SEO monitoring
- Competitor analysis
- Free trial available: https://www.semrush.com/

---

## Checklist

Before considering Phase 0 complete, verify:

- [ ] Google Search Console property created
- [ ] Ownership verified (HTML file or meta tag)
- [ ] Sitemap submitted (`sitemap.xml`)
- [ ] Homepage inspected and indexing requested
- [ ] Email alerts configured
- [ ] No errors in Coverage report
- [ ] (Optional) Bing Webmaster Tools set up

---

## Next Steps After GSC Setup

1. **Wait 3-7 days** for initial indexing
2. **Move to Phase 1:** Implement React-Snap or SSR (critical for visibility)
3. **Create social media images** (see `/propiq/frontend/public/IMAGE_REQUIREMENTS.md`)
4. **Monitor GSC weekly** for indexing progress

---

## Support Resources

- **Google Search Console Help:** https://support.google.com/webmasters
- **SEO Starter Guide:** https://developers.google.com/search/docs/beginner/seo-starter-guide
- **PropIQ SEO Plan:** `/propiq/SEO_AUDIT_AND_IMPLEMENTATION_PLAN.md`

---

## Notes

- GSC data has a **2-3 day lag** (you won't see today's data)
- **"Impressions"** = times your site appeared in search results
- **"Clicks"** = times someone clicked your site in search results
- **"Position"** = average ranking (lower is better; 1 = first result)
- **CTR** = Click-through rate (clicks ÷ impressions)

Good CTR benchmarks:
- Position 1: 30-40% CTR
- Position 5: 8-12% CTR
- Position 10: 3-5% CTR

---

**Last Updated:** 2025-11-05
**Status:** Ready for implementation
**Estimated Setup Time:** 15-30 minutes
