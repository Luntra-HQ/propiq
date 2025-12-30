# Formspree → Convex Webhook Integration

## Overview
This guide shows you how to configure Formspree to send lead captures directly to your Convex database.

---

## Step 1: Get Your Convex Webhook URL

Your Convex webhook endpoint is:
```
https://mild-tern-361.convex.site/webhook/formspree
```

✅ This endpoint is now live and ready to receive webhooks!

---

## Step 2: Configure Formspree Webhook

1. **Login to Formspree:**
   - Go to [formspree.io](https://formspree.io)
   - Login to your account
   - Find your form: **xldqywge**

2. **Add Webhook Integration:**
   - Click on your form **xldqywge**
   - Go to **Integrations** (in the left sidebar)
   - Click **Add Integration**
   - Select **Webhook**

3. **Configure Webhook:**
   - **Webhook URL:** `https://mild-tern-361.convex.site/webhook/formspree`
   - **Method:** POST
   - **Content-Type:** application/json
   - Click **Save**

---

## Step 3: Test the Integration

### Test Submission

1. Go to your lead magnet landing page
2. Submit the form with a test email (e.g., `test@example.com`)
3. Check Formspree dashboard:
   - Go to **Submissions** tab
   - You should see your test submission
   - Click on the submission
   - Scroll down to **Integrations**
   - You should see "Webhook sent successfully" ✅

### Verify in Convex

Run the audit script to see if the lead was captured:
```bash
cd /Users/briandusape/Projects/propiq
npx tsx scripts/audit-signups.ts
```

You should see:
- **Total Leads Captured:** 1 (or more)
- Your test email in the recent leads list

---

## What Data is Sent?

The webhook sends all form fields to Convex:

**Required:**
- `email` - User's email address

**Optional:**
- `firstName` - User's first name
- `leadMagnet` - Name of the lead magnet (e.g., "due-diligence-checklist")
- `source` - Source of the lead (e.g., "landing-page")
- `utm_source` - UTM source parameter
- `utm_medium` - UTM medium parameter
- `utm_campaign` - UTM campaign parameter
- `utm_content` - UTM content parameter
- `utm_term` - UTM term parameter

---

## How it Works

```
User submits form
       ↓
Formspree receives submission
       ↓
Formspree sends webhook to Convex
       ↓
Convex /webhook/formspree endpoint
       ↓
Calls leads.captureLead mutation
       ↓
Creates entry in leadCaptures table
       ↓
Lead is now in nurture system!
```

---

## Troubleshooting

### Webhook Not Firing?

1. **Check Formspree Dashboard:**
   - Go to your form → Submissions
   - Click on a submission
   - Scroll to **Integrations** section
   - Check for errors

2. **Check Webhook URL:**
   - Verify it's exactly: `https://mild-tern-361.convex.site/webhook/formspree`
   - No trailing slash
   - HTTPS, not HTTP

3. **Check Convex Logs:**
   ```bash
   npx convex logs --prod
   ```
   - Look for `[FORMSPREE]` log entries
   - Check for any errors

### Lead Not Created?

1. **Check Email Field:**
   - Formspree must send an `email` field
   - Verify your form has `name="email"` attribute

2. **Check Convex Schema:**
   - Ensure `leadCaptures` table exists
   - Run: `npx convex deploy`

3. **Run Audit Script:**
   ```bash
   npx tsx scripts/audit-signups.ts
   ```

---

## Update Your Landing Page Form

Make sure your landing page form includes hidden fields for tracking:

```html
<form action="https://formspree.io/f/xldqywge" method="POST">
  <!-- Visible fields -->
  <input type="email" name="email" required placeholder="Your email">
  <input type="text" name="firstName" placeholder="First name (optional)">

  <!-- Hidden tracking fields -->
  <input type="hidden" name="leadMagnet" value="due-diligence-checklist">
  <input type="hidden" name="source" value="landing-page">

  <!-- UTM parameters (captured from URL) -->
  <input type="hidden" name="utm_source" id="utm_source">
  <input type="hidden" name="utm_medium" id="utm_medium">
  <input type="hidden" name="utm_campaign" id="utm_campaign">

  <button type="submit">Get Free Checklist</button>
</form>

<script>
  // Capture UTM parameters from URL
  const params = new URLSearchParams(window.location.search);
  document.getElementById('utm_source').value = params.get('utm_source') || '';
  document.getElementById('utm_medium').value = params.get('utm_medium') || '';
  document.getElementById('utm_campaign').value = params.get('utm_campaign') || '';
</script>
```

---

## Next Steps

After webhook is configured:

1. ✅ **Deploy Convex changes:**
   ```bash
   npx convex deploy
   ```

2. ✅ **Run backfill script** to add existing users:
   ```bash
   # Open Convex dashboard
   # Go to Functions tab
   # Run: backfillLeads:backfillLeadCaptures
   ```

3. ✅ **Test end-to-end:**
   - Submit form on landing page
   - Check Formspree dashboard
   - Run audit script to verify lead was captured

4. ✅ **Monitor webhooks:**
   - Check Formspree → Integrations → Webhook logs
   - Check Convex logs: `npx convex logs --prod`

---

**Setup Complete!** 🎉

Your lead capture funnel is now fully integrated:
- ✅ Landing page → Formspree → Convex → leadCaptures table
- ✅ App signup → auth.signup → leadCaptures table
- ✅ All users tracked in one place for nurture emails
