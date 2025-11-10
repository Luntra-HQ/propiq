# Official SEO Connection: LUNTRA.one ↔ PropIQ

**Current State:** luntra.one exists and mentions "Deal IQ" in navigation
**Goal:** Officially connect them so Google understands the relationship
**Rebrand Decision:** Deal IQ → PropIQ (to avoid competition)
**Date:** 2025-11-05

---

## Current Situation Analysis

### What's Already Working ✅
Based on the live site at luntra.one:

1. **Navigation includes "Deal IQ"** - Already in the main menu
2. **Parent brand exists** - LUNTRA is established
3. **Clear positioning** - LUNTRA as "purpose-built partner for consultants/freelancers"
4. **Authority signals** - Google for Startups, Microsoft for Startups backing

### What's Missing ❌
1. **No schema markup connecting them** - Google doesn't see the relationship
2. **Unclear URL structure** - Is PropIQ at luntra.one/propiq or propiq.luntra.one?
3. **No sitemap coordination** - Separate or unified?
4. **Inconsistent branding** - Need "by LUNTRA" consistently
5. **No cross-linking strategy** - Internal links between sites

---

## The 5 Official Connection Points

To officially connect LUNTRA and PropIQ in Google's eyes, you need to establish these 5 connections:

### 1. 🔗 **Schema Markup Connection** (Critical)
### 2. 🌐 **URL Structure Decision** (Critical)
### 3. 🗺️ **Sitemap Coordination** (High Priority)
### 4. 🔄 **Internal Linking** (High Priority)
### 5. 📝 **Consistent Branding** (Medium Priority)

Let's go through each one:

---

## Connection Point 1: Schema Markup (Critical)

### What Google Needs to See

**On luntra.one (Parent Organization):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LUNTRA",
  "url": "https://luntra.one",
  "logo": "https://luntra.one/logo.png",
  "description": "LUNTRA provides AI-powered productivity tools for independent consultants, freelancers, and real estate professionals.",
  "founder": {
    "@type": "Person",
    "name": "Brian Dusape"
  },
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "SoftwareApplication",
        "name": "PropIQ",
        "url": "https://luntra.one/propiq",
        "description": "AI-powered real estate investment analysis"
      }
    }
  ]
}
```

**On luntra.one/propiq or propiq.luntra.one (Product):**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PropIQ",
  "alternateName": "PropIQ by LUNTRA",
  "url": "https://luntra.one/propiq",
  "creator": {
    "@type": "Organization",
    "name": "LUNTRA",
    "url": "https://luntra.one"
  },
  "publisher": {
    "@type": "Organization",
    "name": "LUNTRA",
    "url": "https://luntra.one"
  }
}
```

**The Key:** The `creator` and `publisher` fields explicitly tell Google that LUNTRA created PropIQ.

---

## Connection Point 2: URL Structure Decision (Critical)

You have 3 options:

### Option A: Keep Subdomain (Easier, Current Setup)
```
luntra.one (parent)
propiq.luntra.one (product) → Rebrand to propiq.luntra.one
```

**How to Connect:**
- Add prominent link on luntra.one homepage: "Try PropIQ →"
- Update navigation to link to propiq.luntra.one
- Use schema markup (above) to connect them
- Cross-link in footer

**SEO Impact:** Moderate - Treated as semi-separate sites

---

### Option B: Move to Subfolder (Best for SEO)
```
luntra.one (parent)
luntra.one/propiq (product)
```

**How to Connect:**
- Move PropIQ code to subfolder structure
- All internal links automatically connected
- One unified sitemap

**SEO Impact:** Maximum - One unified domain authority

**Technical Requirements:**
- May need reverse proxy or hosting configuration
- Vite config changes
- More complex but worth it

---

### Option C: Hybrid (Recommended)
```
luntra.one/propiq (canonical/primary URL)
propiq.luntra.one → 301 redirects to luntra.one/propiq
```

**How to Connect:**
- Host product at luntra.one/propiq
- Set up 301 redirect from propiq.luntra.one
- Market using either URL (both work)

**SEO Impact:** Maximum with branding flexibility

---

### My Recommendation: Start with Option A (Quick), Plan for Option C

**Phase 1 (This Week):**
- Keep current subdomain setup
- Add proper schema markup
- Establish all 5 connection points
- Get SEO foundation solid

**Phase 2 (Month 2):**
- Migrate to subfolder structure
- Set up redirects
- Maximize SEO compound effect

**Why:** Don't let perfect be the enemy of good. Get connected NOW, optimize structure later.

---

## Connection Point 3: Sitemap Coordination

### Current Setup (Probably)
```
luntra.one/sitemap.xml (parent sitemap)
propiq.luntra.one/sitemap.xml (product sitemap)
```

### How to Connect Them

**Option 1: Sitemap Index (If Using Subdomains)**

Create `luntra.one/sitemap-index.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://luntra.one/sitemap.xml</loc>
    <lastmod>2025-11-05</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://propiq.luntra.one/sitemap.xml</loc>
    <lastmod>2025-11-05</lastmod>
  </sitemap>
</sitemapindex>
```

Update `luntra.one/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://luntra.one/sitemap-index.xml
```

---

**Option 2: Unified Sitemap (If Using Subfolders)**

One sitemap at `luntra.one/sitemap.xml` with all URLs:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Parent pages -->
  <url>
    <loc>https://luntra.one/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://luntra.one/about</loc>
    <priority>0.8</priority>
  </url>

  <!-- Product pages -->
  <url>
    <loc>https://luntra.one/propiq</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://luntra.one/propiq/calculator</loc>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Recommended:** Start with Option 1 (subdomain), move to Option 2 when you migrate to subfolders.

---

## Connection Point 4: Internal Linking Strategy

### From luntra.one → PropIQ

**Homepage (luntra.one):**
```html
<!-- Hero Section CTA -->
<a href="https://propiq.luntra.one">Try PropIQ - Real Estate Analysis →</a>

<!-- Products Section -->
<h2>Our Products</h2>
<div class="product-card">
  <h3>PropIQ</h3>
  <p>AI-powered real estate investment analysis. Analyze deals in under 60 seconds.</p>
  <a href="https://propiq.luntra.one">Learn More →</a>
</div>
```

**Navigation (Global):**
```html
<nav>
  <a href="https://luntra.one">Home</a>
  <a href="https://luntra.one/about">About</a>
  <a href="https://propiq.luntra.one">PropIQ</a> <!-- Link to product -->
  <a href="https://luntra.one/resources">Resources</a>
</nav>
```

**Footer (luntra.one):**
```html
<footer>
  <div class="footer-section">
    <h4>Products</h4>
    <ul>
      <li><a href="https://propiq.luntra.one">PropIQ - Investment Analysis</a></li>
      <li><a href="#">[Future Product 2]</a></li>
    </ul>
  </div>
</footer>
```

---

### From PropIQ → luntra.one

**Header/Navigation (propiq.luntra.one):**
```html
<nav>
  <a href="https://luntra.one">
    <img src="/luntra-logo.png" alt="LUNTRA" />
  </a>
  <span class="product-name">PropIQ</span>
  <!-- Product-specific nav -->
</nav>
```

**Footer (propiq.luntra.one):**
```html
<footer>
  <p>PropIQ is a product by <a href="https://luntra.one">LUNTRA</a></p>
  <ul>
    <li><a href="https://luntra.one/about">About LUNTRA</a></li>
    <li><a href="https://luntra.one/resources">Resources</a></li>
  </ul>
</footer>
```

**About Section (propiq.luntra.one):**
```html
<section>
  <h2>About PropIQ</h2>
  <p>PropIQ is built by <a href="https://luntra.one">LUNTRA</a>,
     a company dedicated to providing AI-powered productivity tools
     for real estate professionals and independent consultants.</p>
</section>
```

---

## Connection Point 5: Consistent Branding

### Branding Rules

**First Mention:**
Always use full brand name with relationship:
```
"PropIQ by LUNTRA"
```

**Subsequent Mentions:**
Can use shortened versions:
```
"PropIQ" or "the platform"
```

**Everywhere Include:**
- Footer: "© 2025 LUNTRA. PropIQ is a LUNTRA product."
- Meta tags: Include both brand names
- Schema markup: Creator/publisher relationship

---

### Visual Branding Connection

**Logo Strategy:**

**Option 1: Side-by-side**
```
[LUNTRA Logo] | PropIQ
```

**Option 2: Stacked**
```
      LUNTRA
      -------
      PropIQ
```

**Option 3: Subtle parent brand**
```
PropIQ
by LUNTRA
```

**Recommended:** Option 3 for product pages (PropIQ is prominent), Option 1 for company pages.

---

## Implementation Checklist

### Step 1: Update luntra.one (Parent Site)

**Schema Markup:**
- [ ] Add Organization schema with `makesOffer` for PropIQ
- [ ] Include founder information
- [ ] List all products

**Navigation:**
- [ ] Ensure "PropIQ" link is prominent
- [ ] Update link to point to correct URL (propiq.luntra.one or luntra.one/propiq)

**Homepage:**
- [ ] Add PropIQ product card/section
- [ ] Include CTA to try PropIQ
- [ ] Show screenshot or demo

**Footer:**
- [ ] Add Products section
- [ ] Link to PropIQ

**Sitemap:**
- [ ] Create sitemap-index.xml (if using subdomains)
- [ ] Submit to Google Search Console

---

### Step 2: Update propiq.luntra.one → PropIQ (Product Site)

**Rebrand:**
- [ ] Find/replace "PropIQ" → "PropIQ" throughout codebase
- [ ] Update all meta tags
- [ ] Update schema markup

**Schema Markup:**
- [ ] Add SoftwareApplication schema
- [ ] Include `creator: LUNTRA` field
- [ ] Include `publisher: LUNTRA` field

**Navigation:**
- [ ] Add LUNTRA logo linking to luntra.one
- [ ] Show "PropIQ by LUNTRA" in header

**Footer:**
- [ ] Add "A LUNTRA Product" text
- [ ] Link back to luntra.one
- [ ] Link to luntra.one/about
- [ ] Link to other LUNTRA products (if any)

**About Section:**
- [ ] Create or update About page
- [ ] Mention LUNTRA as the creator
- [ ] Link to company page

---

### Step 3: Google Search Console Setup

**Add Both Properties:**
- [ ] Add luntra.one to Google Search Console
- [ ] Add propiq.luntra.one (or luntra.one/propiq) to GSC
- [ ] Verify ownership for both

**Submit Sitemaps:**
- [ ] Submit luntra.one/sitemap-index.xml (or sitemap.xml)
- [ ] Submit propiq.luntra.one/sitemap.xml (if separate)

**Link Properties:**
- [ ] In GSC, use "Associations" to link the properties (if available)

---

### Step 4: Analytics Connection

**Google Analytics:**
- [ ] Set up GA4 property for luntra.one
- [ ] Track both luntra.one and propiq.luntra.one in same property
- [ ] Use Data Streams to separate traffic
- [ ] Set up cross-domain tracking (if needed)

**Events to Track:**
- Clicks from luntra.one → PropIQ
- Conversions on PropIQ
- User journey across both sites

---

### Step 5: Test & Validate

**Schema Validation:**
- [ ] Test luntra.one schema: https://search.google.com/test/rich-results
- [ ] Test PropIQ schema
- [ ] Verify relationship is detected

**Link Testing:**
- [ ] Click all links from parent → product
- [ ] Click all links from product → parent
- [ ] Verify no 404s

**SEO Testing:**
- [ ] Google "site:luntra.one" - should show both sites (if subdomain)
- [ ] Check that both sites appear in GSC
- [ ] Verify sitemaps are processed

---

## Quick Start: 30-Minute Connection

If you want to get the minimum viable connection TODAY, do this:

### On luntra.one (15 minutes):

1. **Add schema markup to homepage:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LUNTRA",
  "url": "https://luntra.one",
  "makesOffer": [{
    "@type": "Offer",
    "itemOffered": {
      "@type": "SoftwareApplication",
      "name": "PropIQ",
      "url": "https://propiq.luntra.one"
    }
  }]
}
</script>
```

2. **Add prominent link:**
Wherever "Deal IQ" is mentioned, ensure it links to propiq.luntra.one

3. **Update footer:**
Add "Products: PropIQ" with link

---

### On propiq.luntra.one (15 minutes):

1. **Update existing schema markup:**
Add to the SoftwareApplication schema we created in Phase 0:
```json
"creator": {
  "@type": "Organization",
  "name": "LUNTRA",
  "url": "https://luntra.one"
}
```

2. **Update meta tags:**
Change title from:
```html
<title>PropIQ - AI-Powered Real Estate Investment Analysis Tool</title>
```
To:
```html
<title>PropIQ by LUNTRA - AI-Powered Real Estate Investment Analysis Tool</title>
```

3. **Update footer:**
Change copyright from:
```
© 2025 LUNTRA. All rights reserved.
```
To:
```
© 2025 LUNTRA. PropIQ is a LUNTRA product. | <a href="https://luntra.one">About LUNTRA</a>
```

**Done!** Google will now see the connection.

---

## Long-Term: Full Integration Plan

### Month 1: Establish Connection
- [x] Schema markup on both sites
- [x] Internal linking established
- [x] Consistent branding ("PropIQ by LUNTRA")
- [x] Both sites in Google Search Console

### Month 2: Optimize Structure
- [ ] Consider migration to subfolder (luntra.one/propiq)
- [ ] Unified analytics dashboard
- [ ] Cross-product content strategy
- [ ] Coordinated link building

### Month 3-6: Scale
- [ ] Launch additional LUNTRA products
- [ ] Build company blog (luntra.one/blog)
- [ ] Create product comparison pages
- [ ] Unified content hub

---

## Expected SEO Results

### Week 1-2 (After Connection):
- Google indexes relationship
- Rich snippets show "by LUNTRA"
- Cross-site crawling increases

### Month 1:
- "PropIQ LUNTRA" branded searches appear
- Both sites appear together in some searches
- Improved click-through rates (brand trust)

### Month 3-6:
- Authority from one site helps the other
- Easier to rank new content
- Compound SEO effects visible

### Month 6-12:
- LUNTRA known as multi-product company
- Easier to launch new products
- Strong parent brand + specific product brands

---

## FAQ: Connection Questions

**Q: Will connecting them hurt either site's SEO?**
A: No - it helps both by establishing authority and trust signals.

**Q: Do I need to move to a subfolder structure immediately?**
A: No - subdomains work fine to start. Migrate later for maximum benefit.

**Q: Will Google get confused with two brands?**
A: No - schema markup explicitly tells Google the relationship.

**Q: Can I still market them separately?**
A: Yes - PropIQ can have its own identity while benefiting from LUNTRA's credibility.

**Q: What if I add more products later?**
A: Perfect! Each new product benefits from existing authority.

---

## Tools to Help

**Schema Validation:**
- https://search.google.com/test/rich-results
- https://validator.schema.org/

**Internal Link Analysis:**
- Screaming Frog SEO Spider (free for 500 URLs)
- Ahrefs Site Audit

**Cross-Domain Tracking:**
- Google Analytics 4 (built-in feature)

---

## Next Steps

1. **Decide on URL structure:** Keep subdomain or move to subfolder?
2. **Update schema markup:** Add creator/publisher relationships
3. **Rebrand PropIQ → PropIQ:** Avoid competition with other PropIQs
4. **Establish internal linking:** Connect the sites prominently
5. **Submit to GSC:** Get both sites indexed and monitored

**Time Required:**
- Minimum connection: 30 minutes
- Full connection: 2-3 hours
- Complete migration to subfolder: 1-2 days

---

**Ready to connect them?** Let me know which option you prefer:
- **Option A:** Quick 30-minute connection (keep current structure)
- **Option B:** Full 2-3 hour connection (optimize everything)
- **Option C:** Complete migration to subfolder (1-2 days, maximum SEO)

I can help implement whichever you choose!
