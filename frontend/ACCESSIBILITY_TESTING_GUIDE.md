# Accessibility Testing Guide - PropIQ Help Center

## Quick Start

### 1. Run Automated Accessibility Tests

**Prerequisites:**
- Dev server must be running (`npm run dev`)
- Convex backend must be running (`npx convex dev`)

**Run all accessibility tests:**
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start Convex
npx convex dev

# Terminal 3: Run accessibility tests
npx playwright test accessibility --reporter=list
```

**Run Help Center tests only:**
```bash
npx playwright test accessibility --grep "Help Center" --headed
```

---

## 2. Manual Accessibility Checklist

### Keyboard Navigation Testing

Open the app and use **only your keyboard**:

- [ ] Press `Tab` to navigate to Help button
- [ ] Press `Enter` to open Help Center modal
- [ ] Press `Tab` multiple times - verify focus moves through all interactive elements
- [ ] Verify **visible focus indicators** on all elements
- [ ] Press `Escape` - modal should close
- [ ] Focus should return to Help button after closing
- [ ] Click overlay (outside modal) - modal should close

**Expected Tab Order:**
1. Close button (X)
2. Back button (if viewing article)
3. Search input
4. Article cards / Category buttons
5. Feedback buttons (when viewing article)

---

### Screen Reader Testing

#### macOS (VoiceOver)
```bash
# Enable VoiceOver
Cmd + F5

# Navigate with VoiceOver
Control + Option + Right Arrow (next element)
Control + Option + Left Arrow (previous element)
Control + Option + Space (activate)
```

**What to listen for:**
- [ ] Help button announces: "Open Help Center, button"
- [ ] Modal announces: "PropIQ Help Center, dialog"
- [ ] Search input announces: "Search help articles, search"
- [ ] Close button announces: "Close Help Center, button"
- [ ] Article cards announce title and category
- [ ] Feedback buttons announce: "Mark article as helpful/unhelpful, button"
- [ ] After voting: "Thank you for your feedback!"

#### Windows (NVDA)
```bash
# Download NVDA: https://www.nvaccess.org/download/

# Navigate
Down Arrow (next element)
Up Arrow (previous element)
Enter (activate)
```

---

### Color Contrast Testing

**Using Chrome DevTools:**

1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Open Help Center modal
3. Click "Elements" tab
4. Right-click any text element
5. Select "Inspect"
6. In Styles panel, click the color swatch
7. Verify **Contrast Ratio** section shows:
   - ✅ Green checkmark for AA compliance
   - Ratio should be **≥ 4.5:1** for normal text
   - Ratio should be **≥ 3:1** for large text (18pt+)

**Elements to check:**
- [ ] Modal title (#f3f4f6 on #0f172a)
- [ ] Body text (#d1d5db on #1e293b)
- [ ] Search input text (#f3f4f6 on #0f172a)
- [ ] Button text (#f3f4f6 on #8b5cf6)
- [ ] Category badges (#ffffff on #8b5cf6)
- [ ] Disabled button text (#6b7280 on #0f172a)

---

### Zoom and Reflow Testing

1. Open Help Center modal at 100% zoom
2. Use browser zoom controls: `Cmd/Ctrl + Plus`
3. Zoom to **200%**
4. Verify:
   - [ ] All text is readable
   - [ ] No horizontal scrolling required
   - [ ] All buttons are still clickable
   - [ ] Layout adapts gracefully
   - [ ] No content is cut off

Continue zooming to 300% and 400% for bonus points!

---

## 3. Security Testing

### XSS Protection Tests

Open Help Center and enter these into the search box:

```javascript
// Test 1: Script injection
<script>alert('xss')</script>
Expected: Empty search, no alert

// Test 2: Image onerror
<img src=x onerror=alert(1)>
Expected: Empty search, no alert

// Test 3: Event handler
<div onclick="alert('xss')">Click</div>
Expected: Empty search, no alert

// Test 4: Normal search
property analysis
Expected: Search works normally
```

**Expected Results:**
- ✅ All malicious inputs sanitized (empty search results)
- ✅ Normal searches work properly
- ✅ No JavaScript execution
- ✅ No console errors

---

### Duplicate Vote Prevention

1. Open an article in Help Center
2. Click "Yes" (helpful) button
3. Verify button becomes **disabled**
4. Verify message: "Thank you for your feedback!"
5. Try clicking again
6. Expected: Button stays disabled, no duplicate vote sent

---

## 4. WCAG 2.1 AA Compliance Checklist

### Perceivable

- [x] **1.1.1 Non-text Content** - All icons have accessible labels
- [x] **1.3.1 Info and Relationships** - Semantic HTML used throughout
- [x] **1.3.2 Meaningful Sequence** - Logical tab order maintained
- [x] **1.3.3 Sensory Characteristics** - Not reliant on visual cues alone
- [x] **1.4.1 Use of Color** - Color not sole means of conveying info
- [x] **1.4.3 Contrast (Minimum)** - All text meets 4.5:1 ratio
- [x] **1.4.4 Resize Text** - Works at 200% zoom
- [x] **1.4.10 Reflow** - No horizontal scroll at 320px width
- [x] **1.4.11 Non-text Contrast** - Icons have sufficient contrast
- [x] **1.4.12 Text Spacing** - Adjustable without loss
- [x] **1.4.13 Content on Hover/Focus** - Tooltips dismissable

### Operable

- [x] **2.1.1 Keyboard** - All functionality available via keyboard
- [x] **2.1.2 No Keyboard Trap** - Escape key works
- [x] **2.1.4 Character Key Shortcuts** - N/A (no single-key shortcuts)
- [x] **2.4.1 Bypass Blocks** - Modal is focused component
- [x] **2.4.2 Page Titled** - Modal has aria-labelledby
- [x] **2.4.3 Focus Order** - Logical sequence maintained
- [x] **2.4.6 Headings and Labels** - All descriptive
- [x] **2.4.7 Focus Visible** - Visible focus indicators present
- [x] **2.5.1 Pointer Gestures** - Simple clicks only
- [x] **2.5.3 Label in Name** - Labels match visible text

### Understandable

- [x] **3.1.1 Language of Page** - Inherited from parent
- [x] **3.2.1 On Focus** - No unexpected changes
- [x] **3.2.2 On Input** - Search updates expected
- [x] **3.2.3 Consistent Navigation** - Consistent patterns
- [x] **3.2.4 Consistent Identification** - Consistent icons/labels
- [x] **3.3.1 Error Identification** - Empty results shown clearly
- [x] **3.3.2 Labels or Instructions** - All inputs labeled
- [x] **3.3.3 Error Suggestion** - Search suggestions provided
- [x] **3.3.4 Error Prevention** - Duplicate vote prevention

### Robust

- [x] **4.1.1 Parsing** - Valid HTML
- [x] **4.1.2 Name, Role, Value** - ARIA attributes complete
- [x] **4.1.3 Status Messages** - Vote confirmation displayed

---

## 5. Browser Testing Matrix

| Browser | Version | WCAG AA | Notes |
|---------|---------|---------|-------|
| Chrome | Latest | ✅ Pass | Recommended for testing |
| Firefox | Latest | ✅ Pass | Good ARIA support |
| Safari | Latest | ✅ Pass | VoiceOver integration |
| Edge | Latest | ✅ Pass | Similar to Chrome |

---

## 6. Tools Reference

### Automated Testing
- **axe-core** - WCAG 2.1 AA automated testing
- **Playwright** - E2E testing framework
- Installation: `npm install --save-dev @axe-core/playwright`

### Browser Extensions
- **axe DevTools** - https://www.deque.com/axe/devtools/
- **WAVE** - https://wave.webaim.org/extension/
- **Lighthouse** - Built into Chrome DevTools

### Screen Readers
- **VoiceOver** - Built into macOS (Cmd+F5)
- **NVDA** - Free for Windows - https://www.nvaccess.org/
- **JAWS** - Commercial - https://www.freedomscientific.com/

### Color Contrast
- **Chrome DevTools** - Built-in contrast checker
- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/

---

## 7. Common Issues & Solutions

### Issue: Modal not announcing to screen readers
**Solution:** Verify these attributes are present:
```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Title Here</h2>
</div>
```

### Issue: Keyboard focus not visible
**Solution:** Check focus styles in CSS:
```css
button:focus {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}
```

### Issue: Color contrast too low
**Solution:** Use darker text or lighter backgrounds:
- Normal text: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio

### Issue: Zoom breaks layout
**Solution:** Use relative units (rem, em, %) instead of px

---

## 8. Continuous Monitoring

### Run Tests in CI/CD
```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests
on: [push, pull_request]
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run dev &
      - run: npx playwright test accessibility
```

### Schedule Regular Audits
- **Weekly:** Automated tests (CI/CD)
- **Monthly:** Manual keyboard/screen reader testing
- **Quarterly:** Full WCAG audit
- **After major changes:** Complete accessibility review

---

## 9. Resources

### WCAG Guidelines
- WCAG 2.1 Overview: https://www.w3.org/WAI/WCAG21/quickref/
- Understanding WCAG: https://www.w3.org/WAI/WCAG21/Understanding/

### Testing Guides
- WebAIM: https://webaim.org/articles/
- Deque University: https://dequeuniversity.com/

### Best Practices
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- A11y Project: https://www.a11yproject.com/

---

## 10. Quick Reference: PropIQ Help Center

### ARIA Implementation Summary

```typescript
// Modal Container
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="help-center-title"
>

// Title
<h2 id="help-center-title">PropIQ Help Center</h2>

// Close Button
<button aria-label="Close Help Center">
  <X />
</button>

// Back Button
<button aria-label="Go back to articles list">
  <ArrowLeft />
</button>

// Search Input
<input
  type="text"
  aria-label="Search help articles"
  maxLength={200}
/>

// Feedback Buttons
<button aria-label="Mark article as helpful" disabled={hasVoted}>
  <ThumbsUp /> Yes
</button>

<button aria-label="Mark article as unhelpful" disabled={hasVoted}>
  <ThumbsDown /> No
</button>
```

### Security Features

```typescript
// Input Sanitization
const sanitizeSearchQuery = (input: string): string => {
  let cleaned = input.trim();
  if (cleaned.length > MAX_SEARCH_LENGTH) {
    cleaned = cleaned.substring(0, MAX_SEARCH_LENGTH);
  }
  cleaned = DOMPurify.sanitize(cleaned, { ALLOWED_TAGS: [] });
  return cleaned;
};

// Markdown Security
<ReactMarkdown
  skipHtml={true}
  disallowedElements={['script', 'iframe', 'object', 'embed', 'style']}
  unwrapDisallowed={true}
>
  {article.content}
</ReactMarkdown>

// Duplicate Vote Prevention
const [votedArticles, setVotedArticles] = useState<Set<string>>(new Set());
const hasVoted = votedArticles.has(articleId);
```

---

**Last Updated:** 2025-12-14
**Next Review:** 2025-06-14

For questions or issues, contact: support@luntra.one
