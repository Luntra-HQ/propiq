# PropIQ Social Media Image Requirements

## Overview
You need to create social media sharing images for Open Graph (Facebook, LinkedIn) and Twitter Cards. These images will appear when someone shares PropIQ on social media.

---

## Required Images

### 1. Open Graph Image (`og-image.jpg`)
**Dimensions:** 1200 x 630 pixels (1.91:1 ratio)
**File Format:** JPG or PNG
**File Size:** < 1 MB
**Location:** `/propiq/frontend/public/og-image.jpg`

**Design Guidelines:**
- Include PropIQ logo
- Main headline: "AI-Powered Real Estate Analysis"
- Subheadline: "Analyze deals in under 60 seconds"
- Use brand colors (violet/purple gradient: #8B5CF6)
- Include a visual element (e.g., calculator mockup, chart, property icon)
- Ensure text is readable at small sizes

**Used By:**
- Facebook
- LinkedIn
- WhatsApp
- Slack
- Discord

---

### 2. Twitter Card Image (`twitter-image.jpg`)
**Dimensions:** 1200 x 675 pixels (16:9 ratio)
**File Format:** JPG or PNG
**File Size:** < 1 MB
**Location:** `/propiq/frontend/public/twitter-image.jpg`

**Design Guidelines:**
- Similar to OG image but in 16:9 format
- Include PropIQ logo
- Main headline: "AI-Powered Real Estate Analysis"
- Call-to-action: "Start Free Trial"
- Use brand colors (violet/purple gradient)

**Used By:**
- Twitter/X

---

### 3. Favicon (Already exists)
**Current:** `/vite.svg`
**Recommended Update:** Create a PropIQ-branded favicon

**Dimensions:** 32 x 32 pixels (and 16x16)
**File Format:** ICO or PNG
**Location:** `/propiq/frontend/public/favicon.ico`

---

## How to Create Images

### Option 1: Design Tools
- **Canva** (easiest): Use social media templates
- **Figma** (professional): Full design control
- **Adobe Photoshop**: Advanced design

### Option 2: AI Image Generators
- **Midjourney**: Generate professional graphics
- **DALL-E**: Create custom visuals
- **Stable Diffusion**: Open-source option

### Option 3: Quick Placeholder Generator
Use **Social Image Generator** tools:
- https://www.opengraph.xyz/
- https://ogimage.gallery/
- https://www.bannerbear.com/

---

## Sample Prompt (for AI generators)

```
Create a professional social media banner for PropIQ, a real estate investment analysis SaaS tool.
- Dimensions: 1200x630px
- Style: Modern, tech-forward, clean
- Color scheme: Purple/violet gradient (#8B5CF6) with dark background
- Include: Calculator icon, property/house silhouette, upward trending graph
- Text: "PropIQ - AI-Powered Real Estate Analysis" (prominent)
- Text: "Analyze deals in under 60 seconds" (smaller)
- Overall vibe: Professional, trustworthy, high-tech
```

---

## Testing Your Images

### 1. Facebook Debugger
URL: https://developers.facebook.com/tools/debug/
- Enter: `https://propiq.luntra.one`
- Click "Scrape Again" to refresh cache
- Verify image appears correctly

### 2. Twitter Card Validator
URL: https://cards-dev.twitter.com/validator
- Enter: `https://propiq.luntra.one`
- Verify card preview looks good

### 3. LinkedIn Post Inspector
URL: https://www.linkedin.com/post-inspector/
- Enter: `https://propiq.luntra.one`
- Check preview

---

## Quick Temporary Solution

**If you need to deploy NOW without custom images:**

1. Find a free stock image that represents real estate/technology:
   - https://unsplash.com/s/photos/real-estate-technology
   - https://pexels.com/search/real%20estate%20investment/

2. Add text overlay using Canva:
   - Go to canva.com
   - Select "Facebook Post" template (1200x630)
   - Upload stock image
   - Add text: "PropIQ - AI-Powered Real Estate Analysis"
   - Download as JPG
   - Rename to `og-image.jpg`
   - Copy to `/propiq/frontend/public/`

3. For Twitter, repeat with "Twitter Post" template (1200x675)

---

## After Adding Images

1. **Rebuild your site:**
   ```bash
   cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/frontend
   npm run build
   ```

2. **Deploy to production**

3. **Test with validators** (links above)

4. **Clear social media caches** if previously shared without images

---

## Current Status

❌ **og-image.jpg** - Not created yet (referenced in index.html:21)
❌ **twitter-image.jpg** - Not created yet (referenced in index.html:30)
❌ **logo.png** - Not created yet (referenced in schema markup)

**Next Action:** Create these 3 images before deploying to production for optimal SEO and social sharing.
