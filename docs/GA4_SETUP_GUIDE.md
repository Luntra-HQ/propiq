# Google Analytics 4 (GA4) Setup Guide

**Sprint 9: User Onboarding & Growth**

## Overview

PropIQ is configured with Google Analytics 4 for comprehensive event tracking and conversion monitoring. This guide explains how to set up and customize GA4 for PropIQ.

---

## Quick Setup

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon)
3. Under **Property**, click **Create Property**
4. Name: `PropIQ Production`
5. Select timezone and currency
6. Click **Next** → **Create**

### 2. Get Measurement ID

1. In your new property, go to **Admin** → **Data Streams**
2. Click **Add stream** → **Web**
3. Enter website URL: `https://propiq.luntra.one`
4. Stream name: `PropIQ Website`
5. Click **Create stream**
6. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Update PropIQ Code

Replace placeholder in `frontend/index.html`:

```html
<!-- REPLACE BOTH OCCURRENCES -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  gtag('config', 'G-XXXXXXXXXX', {
```

**Search and replace:**
- Find: `G-XXXXXXXXXX`
- Replace with: Your actual Measurement ID (e.g., `G-ABC123DEF`)

### 4. Deploy and Verify

1. Build frontend: `npm run build`
2. Deploy to production
3. Visit your site
4. In GA4, go to **Reports** → **Realtime**
5. Verify you see active users

---

## Events Being Tracked

PropIQ automatically tracks these custom events:

### User Onboarding
- `signup_complete` - New user signs up
- `tour_complete` - User completes product tour
- `tour_skip` - User skips product tour

### Trial & Conversion
- `trial_notification_dismiss` - User dismisses trial countdown
- `trial_notification_upgrade_click` - User clicks upgrade from trial banner
- `analysis_started` - User starts property analysis
- `analysis_complete` - Analysis finishes successfully

### Engagement
- `calculator_open` - User opens deal calculator
- `support_chat_open` - User opens support chat
- `pricing_viewed` - User views pricing page

### Page Views
- Automatic page view tracking on all routes
- Enhanced with page title, location, and path

---

## Recommended Events to Add

Add these events to track more granular user behavior:

### Analysis Events
```typescript
// When user enters address
gtag('event', 'address_entered', {
  event_category: 'analysis',
  page_path: '/analyze'
});

// When analysis results shown
gtag('event', 'results_viewed', {
  event_category: 'analysis',
  deal_score: 75,
  deal_rating: 'good'
});
```

### Calculator Events
```typescript
// When user calculates deal
gtag('event', 'calculate_deal', {
  event_category: 'calculator',
  tab: 'basic' // or 'advanced', 'scenarios'
});
```

### Conversion Events
```typescript
// When user initiates checkout
gtag('event', 'begin_checkout', {
  event_category: 'conversion',
  value: 29.00,
  currency: 'USD',
  items: [{
    item_id: 'starter_plan',
    item_name: 'Starter Plan',
    price: 29.00
  }]
});

// When payment succeeds
gtag('event', 'purchase', {
  event_category: 'conversion',
  transaction_id: 'txn_123',
  value: 29.00,
  currency: 'USD',
  items: [{
    item_id: 'starter_plan',
    item_name: 'Starter Plan',
    price: 29.00,
    quantity: 1
  }]
});
```

---

## GA4 Configuration

### Enhanced Measurement (Recommended)

Enable in GA4 Admin → Data Streams → [Your Stream] → Enhanced measurement:

- ✅ Page views (auto-enabled)
- ✅ Scrolls (track 90% scroll depth)
- ✅ Outbound clicks
- ✅ Site search
- ✅ Video engagement
- ✅ File downloads
- ⬜ Form interactions (disable - using custom events)

### Custom Dimensions

Create these custom dimensions for better reporting:

| Dimension Name | Scope | Event Parameter |
|----------------|-------|-----------------|
| `deal_score` | Event | `deal_score` |
| `deal_rating` | Event | `deal_rating` |
| `subscription_tier` | User | `tier` |
| `analyses_used` | User | `analyses_used` |
| `trial_status` | User | `trial_status` |

**To add custom dimensions:**
1. Admin → Data display → Custom definitions
2. Click **Create custom dimension**
3. Enter details from table above
4. Click **Save**

### Conversions

Mark these events as conversions:

1. Admin → Events
2. Mark as conversion:
   - `signup_complete`
   - `purchase`
   - `begin_checkout`
   - `trial_notification_upgrade_click`

---

## Privacy & GDPR Compliance

PropIQ's GA4 configuration is GDPR-compliant:

### Enabled Privacy Features
```javascript
{
  'anonymize_ip': true,  // IP anonymization
  'cookie_flags': 'SameSite=None;Secure',  // Secure cookies
  'allow_ad_personalization_signals': false  // No ad targeting
}
```

### Cookie Consent

For EU users, add cookie consent banner:

```typescript
// Wait for consent before initializing GA4
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied'
});

// After user accepts
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});
```

---

## Testing

### Development Environment

Use separate GA4 property for testing:

1. Create `PropIQ Development` property
2. Get dev Measurement ID
3. Use environment variable:

```typescript
const GA_MEASUREMENT_ID = import.meta.env.PROD
  ? 'G-PROD123'  // Production
  : 'G-DEV456';   // Development
```

### Verify Events

Test events in GA4 DebugView:

1. GA4 Admin → DebugView
2. On your site, add `?debug_mode=true` to URL
3. Trigger events (signup, analysis, etc.)
4. Watch events appear in DebugView in real-time

---

## Reporting

### Key Metrics Dashboard

Create custom dashboard tracking:

**Acquisition**
- New users (daily, weekly, monthly)
- Signup conversion rate
- Top referral sources

**Engagement**
- Active users
- Average session duration
- Analyses per user
- Calculator usage

**Conversion**
- Trial → Paid conversion rate
- Revenue by plan
- Lifetime value (LTV)
- Churn rate

**Retention**
- Day 1, 7, 30 retention
- Feature adoption rate
- Power users (10+ analyses)

---

## Integrations

### Google Ads

Link GA4 to Google Ads for remarketing:

1. GA4 Admin → Product links → Google Ads links
2. Click **Link**
3. Select your Google Ads account
4. Enable **Personalized advertising**
5. Click **Submit**

### Google Search Console

Link for SEO insights:

1. GA4 Admin → Product links → Search Console links
2. Click **Link**
3. Select property
4. Click **Confirm**

---

## Troubleshooting

### No Data in GA4

**Check:**
- ✅ Measurement ID is correct (no typos)
- ✅ Site is deployed and accessible
- ✅ Browser has JavaScript enabled
- ✅ No ad blockers interfering
- ✅ Wait 24-48 hours for data processing

**Test:**
```bash
# Open browser console on your site
window.gtag

# Should return function, not undefined
```

### Events Not Firing

**Debug:**
1. Open Chrome DevTools → Network tab
2. Filter by `collect`
3. Trigger event (e.g., click signup)
4. Look for POST request to `google-analytics.com/g/collect`
5. Check payload includes event name

---

## Best Practices

### Event Naming
- Use lowercase snake_case: `trial_notification_dismiss`
- Be descriptive: `analysis_complete` not `complete`
- Group related events: `calculator_open`, `calculator_tab_change`

### Parameter Naming
- Consistent naming across events
- Use standard ecommerce parameters when applicable
- Avoid PII (names, emails, phone numbers)

### Data Quality
- Test events before deploying
- Monitor for duplicate events
- Set up alerts for missing data
- Review data in DebugView regularly

---

## Support

**GA4 Resources:**
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [gtag.js Reference](https://developers.google.com/tag-platform/gtagjs/reference)

**PropIQ Implementation:**
- Check `src/utils/seo.ts` for event tracking utilities
- See `src/components/SignupFlow.tsx` for event examples
- Review `src/components/TrialCountdown.tsx` for conversion tracking

---

## Migration Checklist

- [ ] Create GA4 property
- [ ] Get Measurement ID
- [ ] Update `index.html` with real ID
- [ ] Create custom dimensions
- [ ] Mark conversions
- [ ] Test in DebugView
- [ ] Deploy to production
- [ ] Verify data collection
- [ ] Set up alerts
- [ ] Create reporting dashboard

---

**Last Updated:** 2025-11-07
**Sprint:** 9
**Author:** Claude Code
