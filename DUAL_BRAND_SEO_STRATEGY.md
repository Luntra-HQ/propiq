# Dual-Brand SEO Strategy: LUNTRA + PropIQ

**Brand Architecture:** Company (LUNTRA) + Product Brand (PropIQ)
**URL Structure:** propiq.luntra.one
**Decision Date:** 2025-11-05

---

## Executive Summary

**Option C is viable and commonly used by successful tech companies**, but it requires careful execution to avoid SEO pitfalls. This document outlines how to implement a dual-brand strategy that:

✅ Builds LUNTRA as the parent brand
✅ Allows PropIQ to have its own identity
✅ Maximizes SEO performance for both
✅ Avoids competition/confusion issues
✅ Sets foundation for future products under LUNTRA umbrella

**TL;DR:** This strategy works IF you follow the domain structure and content distribution rules outlined below.

---

## How Successful Companies Use Dual Branding

### Examples of Multi-Brand SEO Success

| Company (Parent) | Product Brand | URL Structure | SEO Result |
|------------------|---------------|---------------|------------|
| **Salesforce** | Slack | slack.com (separate) | Both rank well independently |
| **Google** | Gmail, Maps, Drive | mail.google.com, maps.google.com | Subdomains work well |
| **HubSpot** | Marketing Hub, Sales Hub | hubspot.com/products/marketing | Subfolder approach |
| **Adobe** | Photoshop, Illustrator | adobe.com/products/photoshop | Parent domain hosts all |
| **Atlassian** | Jira, Confluence | atlassian.com/software/jira | Parent + product strategy |

**Key Insight:** Most successful companies use **subfolder structure** (hubspot.com/products/X) rather than subdomains when they want to maximize SEO sharing between parent and product.

---

## Domain Structure Decision: Subdomain vs Subfolder

### Current State
```
propiq.luntra.one (subdomain)
```

### Option 1: Keep Subdomain Structure (Easier)
```
propiq.luntra.one
```

**Pros:**
- ✅ Easier to set up technically
- ✅ Can use different hosting/tech stack
- ✅ Cleaner separation between products
- ✅ Good for future products (product2.luntra.one, product3.luntra.one)

**Cons:**
- ⚠️ Google treats subdomains as semi-separate sites
- ⚠️ Domain authority doesn't fully transfer from parent
- ⚠️ Backlinks to propiq.luntra.one don't help luntra.one as much
- ⚠️ More SEO work required (each subdomain needs its own link building)

**SEO Impact:** Moderate - Requires independent SEO effort for each subdomain

---

### Option 2: Subfolder Structure (Best for SEO)
```
luntra.one/propiq  (or luntra.one/products/propiq)
```

**Pros:**
- ✅ Google treats it as ONE site
- ✅ All domain authority is shared
- ✅ Backlinks to any page help the entire domain
- ✅ Faster SEO growth (compound effect)
- ✅ Better for small teams with limited resources

**Cons:**
- ⚠️ More complex hosting setup (may need rewrites/proxying)
- ⚠️ All products must be on same tech stack (or use reverse proxy)
- ⚠️ Less product independence

**SEO Impact:** Maximum - All SEO efforts compound across entire site

---

### Option 3: Hybrid Approach (Recommended)
```
Primary: luntra.one/propiq (for SEO)
Redirect: propiq.luntra.one → luntra.one/propiq (for branding)
```

**How it works:**
1. Host PropIQ at `luntra.one/propiq`
2. Set up `propiq.luntra.one` as a redirect (301) to `luntra.one/propiq`
3. Use "PropIQ by LUNTRA" branding everywhere
4. Market using either URL (both end up at same place)

**Pros:**
- ✅ Best of both worlds
- ✅ Maximum SEO benefit (subfolder)
- ✅ Clean product URLs for marketing (subdomain redirects)
- ✅ Simple for users (both URLs work)

**Cons:**
- ⚠️ Slightly more initial setup
- ⚠️ Need to update marketing materials to use canonical URL

**SEO Impact:** Maximum - Gets subfolder SEO benefits with subdomain branding flexibility

---

## Recommended Structure: Hybrid Approach

### Domain Architecture
```
luntra.one (parent/company site)
├── /propiq (product - real estate investment analysis)
├── /products (product directory)
├── /about (company info)
├── /blog (shared content hub)
└── /resources (guides, tools, calculators)

Redirects:
propiq.luntra.one → luntra.one/propiq (301 permanent)
```

### Why This Works

**1. SEO Power:**
- All backlinks help entire domain
- Blog posts at luntra.one/blog help propiq ranking
- Compound authority growth

**2. Brand Flexibility:**
- Can market as "PropIQ" or "LUNTRA"
- Clean URLs for both
- Easy to add more products later

**3. Technical Simplicity:**
- One hosting environment
- Shared analytics/tracking
- Easier to maintain

---

## Content & Keyword Distribution Strategy

### LUNTRA (Parent Brand)

**Target Keywords:**
- "LUNTRA" (branded)
- "real estate productivity tools"
- "property investment automation"
- "AI real estate software"

**Content Types:**
- Company overview/mission
- Product directory
- Blog (shared by all products)
- Case studies (cross-product)
- Company news/updates

**SEO Priority:** Medium
- Focus: Brand awareness, thought leadership
- Goal: Be the authority for "LUNTRA"

**URL Examples:**
```
luntra.one (homepage)
luntra.one/about
luntra.one/products
luntra.one/blog
luntra.one/blog/5-ways-ai-transforms-real-estate
```

---

### PropIQ (Product Brand)

**Target Keywords:**
- "PropIQ" (branded)
- "real estate investment calculator" (primary)
- "cap rate calculator" (primary)
- "rental property analyzer" (primary)
- "real estate deal analysis" (primary)
- "investment property ROI calculator" (secondary)

**Content Types:**
- Product landing page
- Feature pages
- Calculator tools
- How-to guides (product-specific)
- Pricing page

**SEO Priority:** High
- Focus: Conversion, user acquisition
- Goal: Rank for investment calculator keywords

**URL Examples:**
```
luntra.one/propiq (product homepage)
luntra.one/propiq/features
luntra.one/propiq/pricing
luntra.one/propiq/calculator
luntra.one/propiq/calculator/cap-rate
luntra.one/propiq/calculator/cash-flow
luntra.one/propiq/guides/how-to-analyze-rental-property
```

---

## Schema Markup Strategy

### Parent Organization Schema (luntra.one)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LUNTRA",
  "url": "https://luntra.one",
  "logo": "https://luntra.one/logo.png",
  "description": "LUNTRA provides AI-powered productivity tools for real estate professionals and investors.",
  "sameAs": [
    "https://twitter.com/luntra",
    "https://linkedin.com/company/luntra"
  ]
}
```

### Product Schema (luntra.one/propiq)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PropIQ",
  "alternateName": "PropIQ by LUNTRA",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "AI-powered real estate investment analysis tool...",
  "url": "https://luntra.one/propiq",
  "creator": {
    "@type": "Organization",
    "name": "LUNTRA",
    "url": "https://luntra.one"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

**Key Detail:** The `creator` field links PropIQ back to LUNTRA, establishing the relationship for search engines.

---

## Branding & Messaging Strategy

### When to Use Each Brand

#### Use "PropIQ by LUNTRA":
- Product landing pages
- Feature descriptions
- Pricing pages
- Marketing materials
- Social media posts about the product
- Product-specific support

#### Use "LUNTRA":
- Company pages
- About/mission pages
- Blog posts
- Press releases
- Partnerships/integrations
- Company-wide announcements

#### Use Both:
- Homepage: "LUNTRA - Productivity Tools for Real Estate" (headline)
  - "Including PropIQ, our AI-powered investment analyzer" (subheading)
- Footer: "© 2025 LUNTRA. PropIQ is a product of LUNTRA."
- Navigation:
  ```
  [LUNTRA Logo] Products | PropIQ | Blog | About
  ```

---

## Navigation & Internal Linking

### Recommended Site Navigation

**Primary Navigation (Global)**
```
[LUNTRA Logo]
Products    PropIQ    Blog    Resources    About    Login
    |
    └── Products Dropdown:
        - PropIQ (Investment Analysis)
        - [Future Product 2]
        - [Future Product 3]
```

**PropIQ Product Navigation (Secondary)**
```
[LUNTRA Logo] > PropIQ

Features    Calculator    Pricing    How It Works    FAQ
```

### Internal Linking Strategy

**From Parent → Product:**
- Homepage: "Try PropIQ →" (prominent CTA)
- Products page: List all products with descriptions
- Blog posts: Link to relevant product features
- Example: Blog post "How to Calculate Cap Rate" → links to luntra.one/propiq/calculator/cap-rate

**From Product → Parent:**
- Footer: "Part of the LUNTRA family"
- About link: Goes to luntra.one/about
- Blog link: Goes to luntra.one/blog
- Other products: Links to luntra.one/products

**Within Product:**
- Heavy cross-linking between features
- Calculator pages link to each other
- Guides link to calculator tools

**SEO Benefit:** Search engines follow links to understand site structure and pass authority between pages.

---

## Meta Tags for Dual-Brand Setup

### Parent Homepage (luntra.one)
```html
<title>LUNTRA - AI-Powered Productivity Tools for Real Estate</title>
<meta name="description" content="LUNTRA provides AI-powered tools for real estate professionals. Including PropIQ for investment analysis, and more coming soon." />
<meta name="keywords" content="LUNTRA, real estate software, AI real estate tools, property technology" />
```

### Product Page (luntra.one/propiq)
```html
<title>PropIQ by LUNTRA - AI-Powered Real Estate Investment Analysis</title>
<meta name="description" content="Analyze real estate deals in under 60 seconds with PropIQ. Get instant cap rate, cash flow, and ROI calculations with AI insights. By LUNTRA." />
<meta name="keywords" content="PropIQ, LUNTRA, real estate calculator, investment analysis, cap rate calculator" />

<!-- Open Graph -->
<meta property="og:site_name" content="LUNTRA" />
<meta property="og:title" content="PropIQ - AI-Powered Real Estate Investment Analysis" />
```

**Key Detail:** Notice how both brands appear but in the right context.

---

## Link Building Strategy for Dual Brand

### Where to Direct Backlinks

**Scenario 1: General Company Mention**
- Target: luntra.one
- Example: Press release, company directory listing

**Scenario 2: Product-Specific Mention**
- Target: luntra.one/propiq
- Example: Product review, calculator directory, "best tools" listicle

**Scenario 3: Content/Educational**
- Target: luntra.one/blog/[post-name]
- Example: Guest post, resource link

### Link Distribution Goal

| Link Target | % of Total Backlinks | Purpose |
|-------------|----------------------|---------|
| luntra.one | 20-30% | Build parent brand authority |
| luntra.one/propiq | 40-50% | Drive product rankings |
| luntra.one/blog/* | 20-30% | Build topical authority |
| luntra.one/propiq/calculator/* | 10-20% | Rank for specific tools |

**Why this works:** Links distributed across the domain help the entire site, while product-specific links boost PropIQ directly.

---

## Branded Search Strategy

### How Branded Searches Will Split

**Users searching "LUNTRA":**
- Should find: luntra.one (company homepage)
- Shows: Overview of all products, company info
- Conversion path: → Products → PropIQ

**Users searching "PropIQ":**
- Should find: luntra.one/propiq (product page)
- Shows: PropIQ landing page
- Conversion path: → Try PropIQ

**Users searching "PropIQ LUNTRA":**
- Should find: Both pages (company and product)
- Shows: Clear relationship between company and product

**Users searching "real estate investment calculator":**
- Should find: luntra.one/propiq or luntra.one/propiq/calculator
- Shows: Product as the solution

### Optimizing for Both Brands

**In Page Titles:**
```
Good: "PropIQ by LUNTRA - Real Estate Investment Calculator"
Why: Includes both brands, shows relationship, has keyword
```

**In Content:**
```
First mention: "PropIQ by LUNTRA"
Subsequent mentions: "PropIQ" or "the platform"
About section: "LUNTRA develops..."
```

**In URLs:**
```
luntra.one/propiq (shows both in one URL)
```

---

## SEO Performance Expectations

### Month 1-3: Foundation
| Metric | Parent (LUNTRA) | Product (PropIQ) |
|--------|-----------------|------------------|
| Pages indexed | 5-10 | 10-20 |
| Branded searches | 10-50/month | 50-200/month |
| Non-branded traffic | 0-10 | 50-100 |
| Backlinks | 0-5 | 5-10 |

**Focus:** Get both brands indexed, establish relationship

---

### Month 4-6: Growth
| Metric | Parent (LUNTRA) | Product (PropIQ) |
|--------|-----------------|------------------|
| Pages indexed | 15-30 | 30-50 |
| Branded searches | 50-200/month | 200-500/month |
| Non-branded traffic | 10-50 | 200-500 |
| Backlinks | 10-30 | 20-50 |

**Focus:** Build authority for PropIQ's target keywords, establish LUNTRA brand

---

### Month 7-12: Maturity
| Metric | Parent (LUNTRA) | Product (PropIQ) |
|--------|-----------------|------------------|
| Pages indexed | 30-100 | 50-100 |
| Branded searches | 200-1,000/month | 500-2,000/month |
| Non-branded traffic | 100-500 | 1,000-3,000 |
| Backlinks | 30-100 | 50-150 |

**Focus:** PropIQ drives most traffic, LUNTRA known as parent company

---

## Potential Pitfalls & Solutions

### Pitfall 1: Brand Confusion
**Problem:** Users don't understand relationship between LUNTRA and PropIQ
**Solution:**
- Always use "PropIQ by LUNTRA" in first mention
- Clear navigation showing relationship
- Consistent footer: "A LUNTRA Product"

### Pitfall 2: Competing for Same Keywords
**Problem:** luntra.one and luntra.one/propiq both target "real estate calculator"
**Solution:**
- Parent targets broad terms: "real estate tools"
- Product targets specific terms: "real estate investment calculator"
- Clear keyword separation in content strategy

### Pitfall 3: Divided Link Building Effort
**Problem:** Not sure where to build links
**Solution:**
- 70% of effort on product pages (drives revenue)
- 30% on parent/blog (builds overall authority)
- All links help entire domain due to subfolder structure

### Pitfall 4: Diluted Brand Identity
**Problem:** Neither brand becomes strong
**Solution:**
- Lead with PropIQ in marketing (it's the product)
- Use LUNTRA for credibility ("by LUNTRA")
- As LUNTRA grows with more products, brand becomes stronger

---

## Comparison: Single Brand vs Dual Brand SEO

### Single Brand (Just "LUNTRA")
**Pros:**
- Simpler messaging
- All SEO efforts go to one brand
- Easier to explain

**Cons:**
- Harder to add products later
- Less specific positioning
- Generic "does everything" perception

**Example URLs:**
```
luntra.one
luntra.one/investment-calculator
luntra.one/features
```

---

### Dual Brand (LUNTRA + PropIQ)
**Pros:**
- Specific product positioning
- Easier to market distinct products
- Allows product-specific branding
- Scalable for future products
- Can target both company and product keywords

**Cons:**
- More complex messaging
- Need to maintain two brands
- Requires careful coordination

**Example URLs:**
```
luntra.one (company)
luntra.one/propiq (product)
luntra.one/products (directory)
```

---

## Implementation Checklist

### Phase 1: Domain Setup
- [ ] Decide: Keep subdomain or switch to subfolder?
  - Recommended: Subfolder (luntra.one/propiq)
- [ ] Set up redirect: propiq.luntra.one → luntra.one/propiq (if using hybrid)
- [ ] Configure hosting/reverse proxy if needed

### Phase 2: Parent Site (luntra.one)
- [ ] Create company homepage
- [ ] Add About page
- [ ] Create Products directory page
- [ ] Set up blog structure
- [ ] Add Organization schema markup
- [ ] Create sitemap for parent site

### Phase 3: Product Site (luntra.one/propiq)
- [ ] Rebrand from PropIQ to PropIQ
- [ ] Update all meta tags with "PropIQ by LUNTRA"
- [ ] Add SoftwareApplication schema with creator link
- [ ] Create product sitemap
- [ ] Set up product navigation

### Phase 4: Integration
- [ ] Add global navigation (parent + product)
- [ ] Set up internal linking strategy
- [ ] Create consistent footer (shows relationship)
- [ ] Update all branding assets
- [ ] Test all redirects

### Phase 5: Content Strategy
- [ ] Define keyword ownership (parent vs product)
- [ ] Create content calendar
- [ ] Plan blog topics (live at luntra.one/blog)
- [ ] Map internal linking structure

### Phase 6: SEO Setup
- [ ] Update all meta tags
- [ ] Submit updated sitemaps to GSC
- [ ] Set up Google Analytics with proper segments
- [ ] Configure schema markup for both brands
- [ ] Test rich results

---

## Future Products Strategy

### Adding Product 2, 3, etc.

When LUNTRA launches more products:

```
luntra.one
├── /propiq (Product 1: Investment Analysis)
├── /leadiq (Product 2: Lead Generation) [example]
├── /propertyai (Product 3: AI Assistant) [example]
└── /products (directory of all products)
```

**SEO Benefit:** Each new product adds to overall domain authority, making it easier for subsequent products to rank.

**Compound Effect:**
- Product 1 (PropIQ): Starts from zero
- Product 2: Starts with authority from Product 1's backlinks
- Product 3: Starts with authority from Products 1 & 2
- Result: Each product launches faster

This is why **subfolder structure is critical for multi-product strategy**.

---

## Recommended Next Steps

### Immediate (This Week)
1. **Decision:** Confirm subfolder structure (luntra.one/propiq)
2. **Rebrand:** PropIQ → PropIQ throughout codebase
3. **Set up parent site:** Create luntra.one homepage (even if simple)

### Short-term (Month 1)
1. **Complete Phase 0:** Meta tags, sitemap, schema for both brands
2. **Phase 1:** Implement SSR/SSG for both parent and product
3. **Content:** Create 3-5 key pages for each brand

### Medium-term (Month 2-3)
1. **Content expansion:** 10-15 blog posts at luntra.one/blog
2. **Link building:** Start with product-specific links
3. **Monitor:** Track branded searches for both LUNTRA and PropIQ

---

## Conclusion: Does Dual Brand Complicate SEO?

**Short Answer: No, IF you use subfolder structure.**

**Why it works:**
- Google treats luntra.one/propiq as part of luntra.one
- All SEO efforts compound across entire domain
- Backlinks to any page help entire site
- Future products benefit from existing authority

**Why it's actually BETTER than single brand:**
- More precise positioning
- Can target both company and product keywords
- Easier to add products later
- Professional, scalable structure

**The catch:**
- Must use subfolder structure (not subdomains)
- Need clear brand architecture
- Requires coordinated content strategy

---

## Final Recommendation

✅ **Go with Option C (Dual Brand)**
✅ **Use subfolder structure:** luntra.one/propiq
✅ **Rebrand from PropIQ to PropIQ** (avoids competition)
✅ **Build parent site at luntra.one** (even if minimal at first)
✅ **Use "PropIQ by LUNTRA" consistently**

**This strategy:**
- Avoids PropIQ competition issues
- Maximizes SEO performance
- Sets you up for future products
- Is used by successful tech companies
- Is MORE effective than single-brand in the long run

---

**Ready to implement?** Next steps:
1. Confirm you want to proceed with dual brand
2. I'll help you set up the parent site structure
3. We'll rebrand PropIQ → PropIQ
4. Continue with Phase 1 (SSR) implementation

