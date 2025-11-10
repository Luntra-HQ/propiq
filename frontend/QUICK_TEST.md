# Quick Rebrand Testing Guide (10 Minutes)

## Step 1: Build & Preview (2 min)



```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/frontend
npm run build
```

**Expected:** Build succeeds with no errors

```bash
npm run preview
```

**Expected:** Server starts at http://localhost:4173

---

## Step 2: Visual Verification (3 min)

Open http://localhost:4173 in browser

### Check 1: Header
- [ ] Should say "LUNTRA Internal Dashboard" (unchanged)

### Check 2: Main Content
- [ ] Feature card says "**DealIQ Analysis**" (not "Prop IQ")
- [ ] Description mentions "DealIQ run" (not "Prop IQ run")

### Check 3: Footer
- [ ] Should say: "DealIQ is a product by **LUNTRA**"
- [ ] Should have links to:
  - luntra.one (parent site)
  - luntra.one/about
- [ ] Copyright says "© 2025 LUNTRA"

### Check 4: Hero Section
- [ ] Subheading mentions "**DealIQ by LUNTRA**"

### Check 5: Modals
- [ ] Open top-up modal
- [ ] Should say "Add More **DealIQ** Runs" (not Prop IQ)

---

## Step 3: Link Testing (2 min)

### Test Footer Links:
1. Click "LUNTRA" link in footer
   - **Expected:** Opens https://luntra.one in new tab
2. Click "About LUNTRA"
   - **Expected:** Opens https://luntra.one/about in new tab
3. Click "Our Products"
   - **Expected:** Opens https://luntra.one in new tab

**All links should work** (even if luntra.one pages don't exist yet, links should be correct)

---

## Step 4: Meta Tags Check (2 min)

1. Right-click → **View Page Source**
2. Search for `<title>` (Ctrl+F or Cmd+F)

**Should see:**
```html
<title>DealIQ by LUNTRA - AI-Powered Real Estate Investment Analysis Tool</title>
```

3. Search for `"@type": "SoftwareApplication"`

**Should see:**
```json
{
  "name": "DealIQ",
  "alternateName": "DealIQ by LUNTRA",
  "creator": {
    "@type": "Organization",
    "name": "LUNTRA",
    "url": "https://luntra.one"
  }
}
```

---

## Step 5: Console Check (1 min)

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Refresh page

**Expected:** No red errors (warnings are OK)

---

## Quick Validation Tools

### Schema Validation (Optional - 2 min)
1. Copy the page URL: http://localhost:4173
2. Go to: https://search.google.com/test/rich-results
3. Paste URL and test

**Note:** May not work with localhost, but can test after deployment

### Alternative: Manual Schema Check
1. View page source
2. Copy entire JSON-LD block (between `<script type="application/ld+json">` tags)
3. Go to: https://validator.schema.org/
4. Paste JSON and validate

**Expected:** Valid schema, no errors

---

## Pass/Fail Criteria

### ✅ PASS if:
- Build completes without errors
- All text shows "DealIQ" (not "PropIQ")
- Footer has LUNTRA links
- Meta tags include "DealIQ by LUNTRA"
- Schema markup has creator/publisher fields
- No console errors
- Links point to luntra.one (even if not working yet)

### ❌ FAIL if:
- Build errors
- Any "PropIQ" text visible to users
- Footer links broken or missing
- Meta tags still say "PropIQ"
- Schema markup missing creator field
- React errors in console

---

## If Tests Pass

**You're ready to deploy!**

Next steps:
1. Commit changes to git
2. Deploy to production
3. Set up Google Search Console
4. Submit sitemap

---

## If Tests Fail

**Common Issues:**

### Issue: Build fails with TypeScript errors
**Solution:** Check that component renames are consistent

### Issue: "PropIQ" still visible somewhere
**Solution:** I can help find and replace remaining instances

### Issue: Footer links don't work (404)
**Expected:** Links to luntra.one will 404 if those pages don't exist yet
**Action:** That's OK - we're just verifying the URLs are correct

### Issue: Schema validation errors
**Solution:** Copy the error and I'll help fix the JSON-LD

---

## After Testing

**If everything passes:**
```bash
# Stop preview server (Ctrl+C)

# Check what changed
git status

# Review changes
git diff

# Commit (if happy with changes)
git add .
git commit -m "Rebrand PropIQ to DealIQ and connect to LUNTRA

- Updated all meta tags with DealIQ by LUNTRA branding
- Added schema markup connecting LUNTRA as creator/publisher
- Updated UI text throughout app
- Added footer cross-links to luntra.one
- Created sitemap coordination

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Then deploy using your normal process.**

---

**Estimated Time:** 10 minutes total
**Complexity:** Low - mostly visual verification
**Tools Needed:** Browser, DevTools
