# PropIQ Social Media Image Requirements & Creation Guide

**Created:** November 5, 2025
**Product:** PropIQ by LUNTRA
**URL:** https://propiq.luntra.one

---

## Why Social Media Images Matter

**Without custom images:**
- Generic preview when sharing links on LinkedIn/Twitter
- 80% lower click-through rate
- Unprofessional appearance

**With custom images:**
- ✅ 5x more clicks on shared links
- ✅ Professional brand appearance
- ✅ Higher engagement on social posts
- ✅ Memorable brand identity

---

## Required Images: Priority List

### 🔴 CRITICAL (Block social sharing without these)

#### 1. Open Graph Image (og-image.jpg)
**Purpose:** Preview image when sharing propiq.luntra.one on LinkedIn, Facebook, Slack
**File name:** `og-image.jpg`
**Location:** `frontend/public/og-image.jpg`
**Dimensions:** 1200 x 630 pixels (1.91:1 ratio)
**File size:** < 300 KB
**Format:** JPG (best compatibility)

**What it should include:**
- PropIQ logo / branding
- Tagline: "AI-Powered Real Estate Investment Analysis"
- "by LUNTRA" branding
- Clean, professional design
- High contrast for readability

**Example layout:**
```
┌─────────────────────────────────────┐
│                                     │
│    [PropIQ Logo]                   │
│                                     │
│    AI-Powered Real Estate          │
│    Investment Analysis             │
│                                     │
│    Analyze Properties in 30        │
│    Seconds                          │
│                                     │
│    by LUNTRA                        │
│                                     │
└─────────────────────────────────────┘
```

---

#### 2. Twitter Card Image (twitter-image.jpg)
**Purpose:** Preview image when sharing on Twitter/X
**File name:** `twitter-image.jpg`
**Location:** `frontend/public/twitter-image.jpg`
**Dimensions:** 1200 x 675 pixels (16:9 ratio)
**File size:** < 300 KB
**Format:** JPG

**What it should include:**
- Similar to OG image but 16:9 aspect ratio
- PropIQ branding
- Key value prop (30-second analysis)
- "by LUNTRA"

---

### 🟡 HIGH PRIORITY (For social media posts)

#### 3. LinkedIn Post Images (4 images)
**Purpose:** Visual content for LinkedIn posts
**File names:** `linkedin-post-1.jpg` through `linkedin-post-4.jpg`
**Dimensions:** 1200 x 1200 pixels (square) or 1200 x 628 pixels (landscape)
**File size:** < 500 KB each
**Format:** JPG or PNG

**Suggested content:**

**Post 1 Image - "1% Rule is Dead"**
- Visual: Big "1%" crossed out with red X
- Text: "1% Rule ❌" → "Deal Score ✓"
- Subtext: "Modern metrics for 2025"

**Post 2 Image - "Deal Analysis"**
- Visual: Before/After comparison
- Left side: "3 hours in Excel 😓"
- Right side: "30 seconds with PropIQ ✨"

**Post 3 Image - "Founder Story"**
- Visual: Behind-the-scenes vibe
- Text: "From spreadsheets to AI"
- Quote from founder story

**Post 4 Image - "Product Showcase"**
- Visual: Screenshot of PropIQ interface showing Deal Score
- Callout: "Get your Deal Score 0-100"

---

#### 4. Twitter/X Thread Images (3 images)
**Purpose:** Visual content for Twitter threads
**File names:** `twitter-thread-1.jpg` through `twitter-thread-3.jpg`
**Dimensions:** 1200 x 675 pixels (16:9) or 1080 x 1080 pixels (square)
**File size:** < 500 KB each
**Format:** JPG

**Suggested content:**

**Thread 1 Image - "Property Mistakes"**
- Visual: Checklist with red X's
- Text: "Can your property survive:"
- List: "3 months vacancy, $10K repair, 20% insurance increase"

**Thread 2 Image - "Scenario Analysis"**
- Visual: Three columns
- "Best Case | Realistic | Worst Case"
- Simple metrics shown for each

**Thread 3 Image - "Deal Score"**
- Visual: Circular score badge showing "82/100"
- Text: "Your property scored: Excellent"
- Color: Green for excellent rating

---

### 🟢 NICE TO HAVE (For website & marketing)

#### 5. Favicon (favicon.ico)
**Purpose:** Browser tab icon
**File name:** `favicon.ico`
**Location:** `frontend/public/favicon.ico`
**Dimensions:** 32 x 32 pixels (multi-size .ico file)
**Format:** ICO file with multiple sizes (16x16, 32x32, 48x48)

**What it should be:**
- PropIQ logo mark (simplified)
- Or "D" letter mark
- High contrast, recognizable at small size

---

#### 6. Apple Touch Icon (apple-touch-icon.png)
**Purpose:** iOS home screen icon when users save as bookmark
**File name:** `apple-touch-icon.png`
**Location:** `frontend/public/apple-touch-icon.png`
**Dimensions:** 180 x 180 pixels
**Format:** PNG

---

#### 7. Logo Files (various sizes)
**Purpose:** Website header, footer, marketing materials
**File names:**
- `logo-full.png` (full logo with text)
- `logo-mark.png` (icon only)
- `logo-white.png` (white version for dark backgrounds)

**Dimensions:** Vector (SVG preferred) or 500-1000px wide PNG

---

## Design Specifications

### Brand Colors (from existing site)

**Primary Colors:**
- **Purple/Violet:** `#8B5CF6` (buttons, highlights)
- **Dark Background:** `#0f172a` (slate-900)
- **Card Background:** `#1e293b` (slate-800)

**Accent Colors:**
- **Success/Excellent:** `#10b981` (green)
- **Good:** `#3b82f6` (blue)
- **Warning:** `#f59e0b` (yellow)
- **Error/Poor:** `#ef4444` (red)

**Text Colors:**
- **Primary Text:** `#f1f5f9` (slate-100)
- **Secondary Text:** `#94a3b8` (slate-400)

### Typography

**Primary Font:** System fonts (works everywhere)
- Headings: 600-700 weight
- Body: 400 weight

**Suggested Fonts (if designing from scratch):**
- **Primary:** Inter, SF Pro, Helvetica
- **Accent:** Poppins (for headings)

### Logo Treatment

**Text to include:**
- "PropIQ" (primary brand name)
- "by LUNTRA" (secondary, smaller)

**Style:**
- Modern, clean, tech-forward
- Not too corporate (approachable)
- Not too playful (professional)

---

## How to Create Images (3 Options)

### Option 1: Canva (Easiest, Free) 🎨

**Best for:** Non-designers, fast results

**Steps:**
1. Go to https://www.canva.com
2. Sign up for free account
3. Create custom dimensions:
   - OG Image: 1200 x 630 px
   - Twitter: 1200 x 675 px
   - LinkedIn Post: 1200 x 1200 px
4. Use templates or start from scratch
5. Add PropIQ branding (text, colors)
6. Download as JPG (high quality)

**Pros:**
- ✅ Free (with paid Pro option)
- ✅ Easy to use (drag-and-drop)
- ✅ Thousands of templates
- ✅ Brand kit feature (save colors/fonts)

**Cons:**
- ⚠️ Watermark on some free elements
- ⚠️ Limited customization vs. professional tools

**Time:** 15-30 minutes per image

---

### Option 2: AI Image Generation (Fast, Unique) 🤖

**Best for:** Unique visuals, abstract concepts

**Tools:**
- **DALL-E 3** (ChatGPT Plus - $20/mo)
- **Midjourney** ($10-30/mo)
- **Adobe Firefly** (Free tier available)

**Example prompts:**

**For OG Image:**
```
Create a professional social media banner for "PropIQ by LUNTRA",
a real estate investment analysis tool. Modern tech aesthetic,
dark purple and blue gradient background, clean typography.
Include text: "AI-Powered Real Estate Analysis in 30 Seconds".
Professional, trustworthy, tech-forward style. 1200x630px ratio.
```

**For LinkedIn Post (1% Rule):**
```
Create a social media post image showing "1% Rule" crossed out
in red with an X, next to modern metrics like "Deal Score" with
a checkmark. Dark background, purple accents, clean design.
Text: "1% Rule is Dead - Use Modern Metrics". Square format.
```

**Pros:**
- ✅ Unique, custom imagery
- ✅ Fast generation (30 seconds)
- ✅ High quality
- ✅ No design skills needed

**Cons:**
- ⚠️ Requires AI tool subscription
- ⚠️ May need multiple iterations
- ⚠️ Text in images often needs fixing

**Time:** 10-20 minutes per image (including iterations)

---

### Option 3: Hire a Designer (Professional, Expensive) 💼

**Best for:** Long-term brand assets, cohesive identity

**Where to hire:**
- **Fiverr:** $25-100 per design
- **Upwork:** $50-200 per design
- **Dribbble:** $500-2,000 for brand package
- **99designs:** $299+ for design contest

**What to request:**
- Brand identity package (logo + colors + fonts)
- Social media image templates (7-10 images)
- Web graphics (OG images, favicons)
- Editable files (Figma, Sketch, or Photoshop)

**Pros:**
- ✅ Professional quality
- ✅ Cohesive brand identity
- ✅ Editable source files
- ✅ Multiple revisions

**Cons:**
- ⚠️ Expensive ($300-2,000+)
- ⚠️ Longer turnaround (3-7 days)
- ⚠️ Requires clear brief

**Time:** 1-2 weeks (including revisions)

---

## Quick Start: Minimum Viable Images (30 minutes)

**Don't have time for full design?** Create these **2 critical images** in Canva:

### 1. OG Image (1200 x 630)

**Canva Quick Setup:**
1. Create custom 1200 x 630 canvas
2. Dark purple gradient background
3. Large white text: "PropIQ"
4. Smaller text: "AI-Powered Real Estate Analysis"
5. Bottom right: "by LUNTRA"
6. Download as JPG

**Time:** 10 minutes

---

### 2. Twitter Image (1200 x 675)

**Canva Quick Setup:**
1. Duplicate OG image
2. Resize to 1200 x 675
3. Adjust text positioning
4. Download as JPG

**Time:** 5 minutes

---

**Result:** Your links will look professional when shared on social media!

---

## Image Placement & Implementation

### Step 1: Create Images
- Use Canva or AI tool to create images
- Save to Desktop with correct filenames

### Step 2: Add to Project
```bash
# From project root
cp ~/Desktop/og-image.jpg "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/frontend/public/"
cp ~/Desktop/twitter-image.jpg "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/frontend/public/"
```

### Step 3: Verify HTML References
The images are already referenced in `index.html`:
```html
<meta property="og:image" content="https://propiq.luntra.one/og-image.jpg" />
<meta name="twitter:image" content="https://propiq.luntra.one/twitter-image.jpg" />
```

### Step 4: Deploy
```bash
git add public/og-image.jpg public/twitter-image.jpg
git commit -m "Add social media preview images"
git push origin main
```

### Step 5: Test
**Facebook Debugger:**
- Go to: https://developers.facebook.com/tools/debug/
- Enter: https://propiq.luntra.one
- Click "Scrape Again" to refresh cache
- Should show your new OG image

**Twitter Card Validator:**
- Go to: https://cards-dev.twitter.com/validator
- Enter: https://propiq.luntra.one
- Should show your Twitter image

---

## Content Ideas for Social Images

### Visual Concepts That Work:

**1. Before/After Comparisons:**
- "3 hours in Excel" → "30 seconds with PropIQ"
- "Guesswork" → "AI-powered insights"
- "One scenario" → "Best/realistic/worst case"

**2. Stats & Numbers:**
- "Deal Score: 82/100"
- "5-year projections"
- "30-second analysis"

**3. Problem/Solution:**
- Problem: "1% Rule fails"
- Solution: "Use Deal Score instead"

**4. Feature Highlights:**
- "Cap Rate ✓ Cash Flow ✓ ROI ✓ Risk Score ✓"
- Grid of key metrics

**5. User Benefits:**
- "Analyze faster. Invest smarter."
- "Skip the spreadsheet. Use PropIQ."

---

## Image Checklist

**Before publishing:**

- [ ] og-image.jpg created (1200 x 630)
- [ ] twitter-image.jpg created (1200 x 675)
- [ ] Images include "PropIQ by LUNTRA" branding
- [ ] File sizes < 300 KB
- [ ] Colors match brand (purple/violet theme)
- [ ] Text is readable at small sizes
- [ ] Images uploaded to `frontend/public/`
- [ ] Committed to git and deployed
- [ ] Tested with Facebook Debugger
- [ ] Tested with Twitter Card Validator

**Optional (do later):**
- [ ] 4 LinkedIn post images created
- [ ] 3 Twitter thread images created
- [ ] Favicon updated
- [ ] Apple touch icon added
- [ ] Logo files created (SVG + PNG)

---

## Social Media Best Practices

### For LinkedIn Posts:
- **Image style:** Professional, data-driven
- **Text overlay:** Minimal (let caption do the talking)
- **Ratio:** Square (1:1) or landscape (1.91:1)
- **Branding:** Logo in corner (subtle)

### For Twitter/X:
- **Image style:** Bold, attention-grabbing
- **Text overlay:** Key stat or hook
- **Ratio:** Landscape (16:9) works best
- **Branding:** PropIQ name visible

### For Instagram (future):
- **Ratio:** Square (1:1) or vertical (4:5)
- **Style:** More visual, less text
- **Carousel posts:** 10 slides max

---

## Examples from Competitors

### What BiggerPockets Does:
- Dark blue brand color
- Professional photography
- Minimal text overlay
- Clean, corporate aesthetic

### What DealCheck Does:
- Screenshots of app interface
- Feature callouts with arrows
- Purple/pink brand colors
- Modern, tech-forward design

### What PropIQ Should Do:
- ✅ Dark purple gradient (modern)
- ✅ AI/tech aesthetic (not corporate)
- ✅ Clear value props ("30 seconds")
- ✅ Trustworthy but approachable
- ✅ "by LUNTRA" branding (connection to parent)

---

## Budget Options

### Free (DIY):
- **Tool:** Canva Free
- **Time:** 2-4 hours for all images
- **Cost:** $0

### Low Budget:
- **Tool:** Canva Pro ($12.99/mo) + AI tool
- **Time:** 1-2 hours
- **Cost:** $30-40/mo

### Medium Budget:
- **Hire:** Fiverr designer
- **Time:** 3-5 days turnaround
- **Cost:** $100-300 for package

### High Budget:
- **Hire:** Professional designer (Dribbble)
- **Time:** 1-2 weeks
- **Cost:** $500-2,000 for full brand identity

---

## Quick Decision Matrix

| Need | Timeline | Budget | Recommendation |
|------|----------|--------|----------------|
| **2 images ASAP** | Today | $0 | Canva Free (30 min) |
| **Full social package** | This week | $0-30 | Canva Pro + AI tools |
| **Professional quality** | 1-2 weeks | $100-300 | Fiverr designer |
| **Complete brand identity** | 2-4 weeks | $500-2K | Professional designer |

---

## Immediate Action Plan

**Today (15-30 minutes):**
1. Open Canva (canva.com)
2. Create og-image.jpg (1200 x 630)
   - Dark purple background
   - "PropIQ" in large white text
   - "AI-Powered Real Estate Analysis"
   - "by LUNTRA" at bottom
3. Duplicate and resize to twitter-image.jpg (1200 x 675)
4. Download both as JPG (high quality)
5. Upload to `frontend/public/`
6. Commit and deploy

**This Week (2-3 hours):**
1. Create 4 LinkedIn post images
2. Create 3 Twitter thread images
3. Test all images with social media validators
4. Schedule first social posts with images

**Next Week:**
1. Create favicon
2. Add apple-touch-icon
3. Create logo variations (if needed)

---

## Resources & Tools

### Design Tools:
- **Canva:** https://www.canva.com (easiest)
- **Figma:** https://www.figma.com (professional, free tier)
- **Adobe Express:** https://www.adobe.com/express (quick graphics)

### AI Image Generation:
- **DALL-E 3:** https://chat.openai.com (ChatGPT Plus)
- **Midjourney:** https://www.midjourney.com ($10/mo)
- **Adobe Firefly:** https://www.adobe.com/products/firefly.html

### Hiring Designers:
- **Fiverr:** https://www.fiverr.com (search "social media images")
- **Upwork:** https://www.upwork.com (post job, get proposals)
- **Dribbble:** https://dribbble.com/jobs (find designers)

### Testing Tools:
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

---

## Next Steps

**Priority 1 (Do first):**
- [ ] Create og-image.jpg and twitter-image.jpg
- [ ] Upload to project and deploy
- [ ] Test with social media validators

**Priority 2 (This week):**
- [ ] Create LinkedIn post images (4 images)
- [ ] Create Twitter thread images (3 images)

**Priority 3 (When you have time):**
- [ ] Update favicon
- [ ] Create logo files
- [ ] Build image template library for future posts

---

**You're ready to create professional social media images! 🎨**

Start with the 2 critical images (OG + Twitter) and expand from there.
