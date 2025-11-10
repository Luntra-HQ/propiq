# Using Chrome Extensions with Playwright

## 🎯 Quick Start

### Method 1: Use Your Chrome Profile (All Extensions)

```bash
# Run this test to open Chrome with all your extensions
npx playwright test tests/chrome-with-extensions.spec.ts --headed
```

This opens Chrome with:
- ✅ Axe DevTools
- ✅ WAVE
- ✅ Any other extensions you have installed

---

## 📋 What You Can Do

Once Chrome opens, you can:

1. **Run Axe DevTools**
   - Press F12 → Click "axe DevTools" tab
   - Click "Scan ALL of my page"
   - Review violations

2. **Run Lighthouse**
   - Press F12 → Click "Lighthouse" tab
   - Select categories
   - Click "Analyze page load"

3. **Run WAVE**
   - Click WAVE extension icon
   - Review visual overlay

4. **Use Chrome DevTools**
   - Inspect elements
   - Check CSS Grid/Flexbox
   - Test responsive design
   - Emulate vision deficiencies

---

## 🔧 Configuration Options

### Option A: Use Persistent Context (Your Chrome Profile)

```typescript
const userDataDir = '/Users/briandusape/Library/Application Support/Google/Chrome/Default';

const browser = await chromium.launchPersistentContext(userDataDir, {
  headless: false, // Extensions require headed mode
  channel: 'chrome', // Use installed Chrome
});
```

**Pros:**
- ✅ All your extensions work
- ✅ Your bookmarks, history, settings
- ✅ Logged into websites

**Cons:**
- ❌ Can't run in headless mode
- ❌ Slower (loads full profile)

---

### Option B: Load Specific Extension

```typescript
const pathToExtension = '/path/to/extension/folder';

const browser = await chromium.launch({
  headless: false,
  args: [
    `--disable-extensions-except=${pathToExtension}`,
    `--load-extension=${pathToExtension}`,
  ],
});
```

**Find extension path:**
```bash
# Chrome extensions are here:
cd ~/Library/Application\ Support/Google/Chrome/Default/Extensions

# List installed extensions:
ls -la

# Axe DevTools ID: lhdoppojpmngadmnindnejefpokejbdd
# WAVE ID: jbbplnpkjmmeebjpijfedlgcdilocofh
```

---

### Option C: Use Different Browser

```typescript
// Arc Browser
executablePath: '/Applications/Arc.app/Contents/MacOS/Arc'

// Brave Browser
executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'

// Microsoft Edge
executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'

// Perplexity Comet (if installed)
executablePath: '/Applications/Comet.app/Contents/MacOS/Comet'
```

---

## 🎬 Example Workflow

### 1. Start Your Dev Server

```bash
cd propiq/frontend
npm run dev
# Runs on http://localhost:5173
```

### 2. Open Chrome with Extensions

```bash
npx playwright test tests/chrome-with-extensions.spec.ts --headed
```

### 3. Run Axe DevTools

- Press F12
- Click "axe DevTools" tab
- Click "Scan ALL of my page"
- Review violations:
  - Color contrast issues
  - Missing labels
  - Missing alt text

### 4. Run Lighthouse

- Press F12
- Click "Lighthouse" tab
- Select: Performance, Accessibility, Best Practices, SEO
- Click "Analyze page load"
- Review scores

### 5. Run WAVE

- Click WAVE extension icon (if installed)
- Review visual overlay
- Fix red errors first, then yellow alerts

### 6. Close Browser

- Click "Resume" in Playwright Inspector
- Or just close the browser window

---

## 📊 Typical Issues Found

### Color Contrast (WCAG 2.1)

**Issue:**
```
Element has insufficient color contrast of 3.8
(foreground: #a78bfa, background: #334155)
Expected: 4.5:1
```

**Fix:**
```tsx
// Before
<span className="text-violet-400">Free Trial</span>

// After (better contrast)
<span className="text-violet-300">Free Trial</span>
```

---

### Missing Form Labels

**Issue:**
```
Form element does not have a label
```

**Fix:**
```tsx
// Before
<select>
  <option value="rental">Rental</option>
</select>

// After
<label htmlFor="strategy">Strategy Type</label>
<select id="strategy" aria-label="Investment Strategy">
  <option value="rental">Rental</option>
</select>
```

---

### Missing Alt Text

**Issue:**
```
<img> element missing alt attribute
```

**Fix:**
```tsx
// Before
<img src="/logo.png" />

// After
<img src="/logo.png" alt="PropIQ Logo" />

// Or for decorative images
<img src="/decoration.png" alt="" role="presentation" />
```

---

## 🎯 For Your Interview

### When Asked: "How do you test accessibility?"

**Show Them:**

1. Run the test:
   ```bash
   npx playwright test tests/chrome-with-extensions.spec.ts --headed
   ```

2. Open Axe DevTools (F12 → axe tab)

3. Run scan, show violations

4. Explain:
   > "I use automated testing with Axe and Playwright, plus manual review with browser extensions. The automated tests catch regressions in CI/CD. Manual review with Axe DevTools and Lighthouse helps me understand context and prioritize fixes."

---

## 🚀 Advanced: Automate Extension Checks

You can programmatically interact with some extensions:

```typescript
test('automated Lighthouse run', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Lighthouse can be run via CLI
  // (Chrome DevTools Protocol)

  const lighthouseResult = await page.evaluate(() => {
    // Run Lighthouse programmatically
    // Returns scores
  });

  expect(lighthouseResult.accessibility).toBeGreaterThan(90);
});
```

But for manual review, the headed browser is best!

---

## 🔧 Troubleshooting

### Issue: "Extension not found"

**Solution:**
```bash
# Find your Chrome profile location
ls ~/Library/Application\ Support/Google/Chrome/

# Use correct path in test
const userDataDir = '/Users/YOUR_USERNAME/Library/Application Support/Google/Chrome/Default';
```

---

### Issue: "Can't run in headless mode"

**Solution:**
Extensions require headed mode. Use:
```typescript
headless: false
```

---

### Issue: "Browser closes too fast"

**Solution:**
Add `page.pause()` to keep browser open:
```typescript
await page.goto('http://localhost:5173');
await page.pause(); // Stops here until you click Resume
```

---

## 📚 Resources

**Browser Extension Links:**
- Axe DevTools: https://chrome.google.com/webstore/detail/lhdoppojpmngadmnindnejefpokejbdd
- WAVE: https://chrome.google.com/webstore/detail/jbbplnpkjmmeebjpijfedlgcdilocofh
- Lighthouse: Built into Chrome DevTools

**Playwright Docs:**
- Persistent Context: https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context
- Chrome Extensions: https://playwright.dev/docs/chrome-extensions

---

## ✅ Summary

**Best Setup:**
1. Install Axe DevTools and WAVE extensions in Chrome
2. Run `npx playwright test tests/chrome-with-extensions.spec.ts --headed`
3. Use extensions manually in the opened browser
4. Fix violations found
5. Re-run automated tests to verify fixes

**Time:** 5 minutes to set up, 15 minutes to review

**Benefit:** Professional UX review + automated testing + great interview demo!

---

**Last Updated:** October 27, 2025
**Status:** Ready to use
