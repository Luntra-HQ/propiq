# Microsoft Clarity Filters Setup Guide for PropIQ

## Quick Setup Instructions

To exclude internal traffic and get accurate analytics going forward, set up these filters in your Microsoft Clarity dashboard.

### How to Create Filters in Clarity

1. Go to your Clarity dashboard: https://clarity.microsoft.com
2. Select your "Prop IQ" project
3. Navigate to **Settings** → **Filters**
4. Click **"+ Add filter"**

---

## Required Filters

### Filter 1: Exclude All Localhost Development Sessions
**Priority: CRITICAL** - This will immediately improve data quality

```
Filter Name: Block Localhost/Dev Sessions
Filter Type: URL
Condition: URL does not contain any of the following
Values (add each separately):
  - localhost
  - 127.0.0.1
  - :5173
  - :8080
  - :3000

Apply to: All future sessions
Description: Removes all local development traffic
```

**Impact:** Will eliminate ~51% of current false sessions

---

### Filter 2: Production Traffic Only
**Priority: HIGH**

```
Filter Name: Production Domain Only
Filter Type: URL
Condition: URL contains
Value: propiq.luntra.one

Apply to: All future sessions
Description: Only track production domain sessions
```

**Why this helps:** Creates a whitelist approach - only sessions on your actual domain count

---

### Filter 3: Exclude Your Team's IP Addresses
**Priority: HIGH**

```
Filter Name: Block Internal Team IPs
Filter Type: IP Address
Condition: IP address is not any of
Values:
  - [ADD YOUR OFFICE IP]
  - [ADD YOUR HOME IP]
  - [ADD TEAM MEMBER IPs]

Apply to: All future sessions
Description: Filters out testing from development team
```

**How to find your IP:** Visit https://whatismyipaddress.com/

---

### Filter 4: Minimum Engagement Filter
**Priority: MEDIUM**

```
Filter Name: Engaged Sessions Only
Filter Type: Session Duration
Condition: Session duration is greater than
Value: 5 seconds

Apply to: All future sessions
Description: Removes accidental clicks and bot-like behavior
```

**Why this helps:** Bots and accidental traffic usually bounce in <5 seconds

---

### Filter 5: Remove Common Bot User Agents (Advanced)
**Priority: MEDIUM**

```
Filter Name: Block Bot User Agents
Filter Type: Custom Tag
Condition: User Agent does not contain any of
Values:
  - bot
  - crawler
  - spider
  - headless

Apply to: All future sessions
Description: Catches bots that slip through Clarity's detection
```

---

## Combined "Real Users Only" Segment

Create a **Segment** (not filter) for analysis:

```
Segment Name: Real Production Users
Combine all conditions:
  ✓ URL contains: propiq.luntra.one
  ✓ URL does not contain: localhost
  ✓ Session duration > 5 seconds
  ✓ Pages per session > 1
  ✓ Not flagged as bot traffic

Use this for: All conversion funnel analysis
```

---

## Verification Checklist

After setting up filters, verify they're working:

- [ ] Check session count drops significantly (should see ~50% reduction immediately)
- [ ] Verify no localhost URLs appear in "Top Pages"
- [ ] Check that production URL (propiq.luntra.one) is only domain in reports
- [ ] Review session recordings - should only see real user behavior
- [ ] Monitor for 48 hours and confirm metrics stabilize

---

## Additional Recommendations

### 1. Set Up Custom Events for Upgrade Flow

Track these specific events to identify where users drop off:

```javascript
// Add to your checkout/upgrade flow
clarity("event", "upgrade_button_clicked");
clarity("event", "payment_form_viewed");
clarity("event", "payment_form_submitted");
clarity("event", "upgrade_successful");
clarity("event", "upgrade_failed");
```

### 2. Tag Test Sessions

When you or your team need to test in production:

```javascript
// Add to your app when in test mode
if (isTestMode) {
  clarity("set", "test_session", "true");
}
```

Then filter out `test_session = true` in Clarity.

### 3. Enable Heatmaps for Key Pages

In Clarity Settings, enable heatmaps specifically for:
- `/pricing` - See where users look before deciding
- `/signup` - Identify form friction points
- `/app` (upgrade CTA) - See if users even notice the upgrade button

---

## Expected Impact

| Metric | Before Filters | After Filters | Change |
|--------|---------------|---------------|---------|
| Total Sessions | 734 | ~442 | -40% (cleaner data) |
| Signup Rate | 5.31% | **8.82%** | +66% (true rate) |
| Upgrade Rate | 0.27% | **0.45%** | +67% (true rate) |
| Dead Clicks | 11.44% | **19.00%** | More accurate signal |
| Quick Backs | 6.54% | **10.86%** | More accurate signal |

---

## Questions?

Common issues:
- **Filters not working?** - Wait 24 hours for Clarity to process
- **Too many sessions filtered?** - Start with Filter 1 & 2 only, add others gradually
- **Missing important traffic?** - Check that your production URL filter is correct
