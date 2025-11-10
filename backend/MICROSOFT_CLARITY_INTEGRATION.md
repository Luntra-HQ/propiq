# Microsoft Clarity Integration Guide

## Overview
Microsoft Clarity is a free user behavior analytics tool that provides:
- **Session Replays**: Watch how users interact with your app
- **Heatmaps**: See where users click, scroll, and spend time
- **Click Analytics**: Understand user engagement patterns
- **Performance Insights**: Identify frustrating user experiences

**No backend integration required** - this is purely a frontend JavaScript integration.

---

## Setup Instructions

### 1. Microsoft Clarity Account ✅ CONFIGURED
- Project Name: **PropIQ**
- Project ID: **tts5hc8zf8**
- Dashboard: https://clarity.microsoft.com/
- Status: Ready for frontend integration

### 2. Frontend Integration

#### For React/Vite Apps

Add the Clarity script to your `index.html`:

```html
<!-- /Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/frontend/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PropIQ - AI-Powered Property Analysis</title>

    <!-- Microsoft Clarity -->
    <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "tts5hc8zf8");
    </script>
    <!-- End Microsoft Clarity -->

  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### Alternative: Component-Based Integration (React)

If you prefer to load Clarity programmatically:

```typescript
// src/utils/clarity.ts
export const initClarity = (projectId: string) => {
  if (typeof window === 'undefined') return;

  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", projectId);
};

// Call in your App.tsx or main.tsx
import { useEffect } from 'react';
import { initClarity } from './utils/clarity';

function App() {
  useEffect(() => {
    // Only in production
    if (import.meta.env.PROD) {
      initClarity('tts5hc8zf8');  // PropIQ Clarity Project ID
    }
  }, []);

  // ... rest of your app
}
```

---

## Environment Variables (Optional)

Add to your frontend `.env` files:

```bash
# .env.development
VITE_CLARITY_PROJECT_ID=  # Leave empty for dev

# .env.production
VITE_CLARITY_PROJECT_ID=tts5hc8zf8
```

Then update the integration:

```typescript
const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;
if (clarityId) {
  initClarity(clarityId);
}
```

---

## What Clarity Tracks Automatically

Once installed, Clarity automatically captures:

### 1. User Interactions
- Clicks, taps, scrolls
- Mouse movements
- Form interactions
- Navigation patterns

### 2. Session Information
- Device type (desktop, mobile, tablet)
- Browser and OS
- Screen resolution
- Geographic location (country level)

### 3. Performance Metrics
- Page load times
- JavaScript errors
- Rage clicks (frustrated users)
- Dead clicks (clicks with no response)

---

## Privacy & GDPR Compliance

### Masking Sensitive Data

Clarity respects privacy by default, but you can add extra protection:

```html
<!-- Mask sensitive inputs -->
<input type="password" class="clarity-mask" />
<input type="email" class="clarity-mask" />

<!-- Mask entire sections -->
<div class="clarity-mask">
  User's private data here
</div>
```

### Disable for Specific Users

```typescript
// Don't track admin users
if (user.role === 'admin') {
  // Don't initialize Clarity
  return;
}

initClarity(projectId);
```

---

## Testing Your Integration

### 1. Verify Installation
1. Deploy frontend with Clarity script
2. Visit your website
3. Go to https://clarity.microsoft.com/
4. Check "Recordings" tab - you should see new sessions appearing

### 2. Check Browser Console
Open DevTools Console and verify:
```javascript
window.clarity // Should be defined
```

### 3. Test Heatmaps
1. In Clarity dashboard, go to "Heatmaps"
2. Enter a URL (e.g., `/pricing`)
3. Wait 24-48 hours for data to accumulate

---

## Using Clarity Data

### Session Replays
**Best for**: Understanding user frustration, bugs, UX issues

1. Go to Clarity Dashboard → Recordings
2. Filter by:
   - Rage clicks (frustrated users)
   - JavaScript errors
   - Specific pages (e.g., `/signup`)
3. Watch replays to identify:
   - Where users get stuck
   - Confusing UI elements
   - Broken features

### Heatmaps
**Best for**: Optimizing page layouts, CTAs, navigation

1. Go to Clarity Dashboard → Heatmaps
2. View by page (e.g., landing page, pricing)
3. Analyze:
   - **Click heatmaps**: Where users click most
   - **Scroll maps**: How far users scroll
   - **Area maps**: Time spent on sections

---

## PropIQ-Specific Recommendations

### Track Key User Journeys

Add custom tracking for important flows:

```typescript
// After signup
window.clarity?.("event", "user_signed_up");

// After property analysis
window.clarity?.("event", "property_analyzed", {
  recommendation: "strong_buy",
  address: "123 Main St"
});

// After subscription
window.clarity?.("event", "subscription_upgraded", {
  from: "free",
  to: "starter"
});
```

### Monitor These Pages
Priority pages to analyze:
1. **Landing Page** (`/`) - Optimize hero, CTAs
2. **Signup** (`/signup`) - Reduce friction
3. **Property Analysis** (`/analyze`) - Improve UX
4. **Pricing** (`/pricing`) - Optimize conversion
5. **Dashboard** - User engagement patterns

### Key Metrics to Watch
- **Rage Clicks**: Users clicking frantically (frustration)
- **Dead Clicks**: Clicking non-interactive elements
- **JavaScript Errors**: Technical issues
- **Quick Backs**: Users leaving pages quickly
- **Time to First Interaction**: How fast page loads

---

## Troubleshooting

### Clarity Not Loading
**Check**:
- Project ID is correct
- Script is in `<head>` tag
- No ad blockers interfering
- No Content Security Policy (CSP) blocking

### No Data Appearing
**Wait**: Clarity can take 2-4 hours to show initial data

**Verify**:
```bash
# Check if script loaded
curl -I https://www.clarity.ms/tag/tts5hc8zf8
```

### Session Replays Not Working
**Requirements**:
- HTTPS (required for replays)
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled

---

## Cost
**Free forever** - Microsoft Clarity has no limits on:
- Number of sessions
- Number of page views
- Team members
- Data retention (1 year)

---

## Next Steps

1. ✅ Clarity account created - Project ID: **tts5hc8zf8**
2. Add script to `luntra/frontend/index.html` (see code examples above)
3. Deploy frontend
4. Wait 2-4 hours for data to start appearing
5. Start analyzing user behavior in dashboard: https://clarity.microsoft.com/

---

## Resources

- Dashboard: https://clarity.microsoft.com/
- Documentation: https://docs.microsoft.com/en-us/clarity/
- Support: https://github.com/microsoft/clarity

---

## Backend Integration
**None required!** Microsoft Clarity is entirely frontend-based.

For backend analytics, we use:
- **Weights & Biases**: AI model performance tracking
- **Intercom**: Customer messaging and events
- **Stripe**: Payment analytics
