# Lead Nurture Sequence - Quick Start Guide

**Status:** ✅ **DEPLOYED AND RUNNING**

---

## What's Deployed

✅ **Database:** `leadCaptures` table with full tracking
✅ **Webhook:** `/formspree-webhook` endpoint live at `https://mild-tern-361.convex.site/formspree-webhook`
✅ **Cron Jobs:** Daily emails scheduled at 10 AM and 10:30 AM EST
✅ **Signup Integration:** Auto-converts leads when they sign up
✅ **Analytics:** Lead stats and conversion tracking

---

## Formspree Setup (Required)

### Step 1: Configure Webhook

1. Go to [Formspree Dashboard](https://formspree.io/forms)
2. Select your lead magnet form
3. Go to **Settings** → **Webhooks**
4. Add webhook URL:
   ```
   https://mild-tern-361.convex.site/formspree-webhook
   ```
5. Click **Save**

### Step 2: Test the Form

Submit a test lead through your form. You should see:
- ✅ Formspree shows webhook was called
- ✅ Lead appears in Convex dashboard (Data → leadCaptures)

---

## Cron Schedule

| Time | Email | Action |
|------|-------|--------|
| **10:00 AM EST** | Day 3 Nurture | "Ready to analyze your first property?" |
| **10:30 AM EST** | Day 7 Nurture | "Don't miss your 3 free analyses" |
| **2:00 AM EST** | Cleanup | Remove expired sessions |

**Note:** Cron jobs run automatically daily. No manual intervention needed.

---

## How to Monitor

### Check Lead Stats

```bash
npx convex run leads:getLeadStats
```

**Output:**
```json
{
  "total": 1,
  "captured": 1,
  "nurturedDay3": 0,
  "nurturedDay7": 0,
  "convertedTrial": 0,
  "convertedPaid": 0,
  "conversionRate": 0
}
```

### View Recent Leads

```bash
npx convex run leads:getRecentLeads
```

### View Conversion Funnel (Last 30 Days)

```bash
npx convex run leads:getConversionFunnel '{"days": 30}'
```

---

## Testing the Full Flow

### 1. Test Lead Capture

```bash
curl -X POST https://mild-tern-361.convex.site/formspree-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourtest@example.com",
    "firstName": "Test",
    "lastName": "User",
    "leadMagnetType": "real-estate-checklist"
  }'
```

**Expected:** `{"success":true,"message":"Lead captured successfully"}`

### 2. Verify Lead Was Saved

```bash
npx convex run leads:getRecentLeads
```

**Expected:** See `yourtest@example.com` with status `"captured"`

### 3. Test Day 3 Email (Manual Trigger)

**Note:** To test without waiting 3 days:

1. Go to Convex Dashboard → Data → leadCaptures
2. Find your test lead
3. Edit `capturedAt` field: set to **3 days ago** (timestamp in milliseconds)
   - Current time: 1767804010437
   - 3 days ago: 1767804010437 - (3 × 24 × 60 × 60 × 1000) = 1767544810437
4. Wait for cron job at 10 AM EST, or manually trigger:

```bash
npx convex run emailScheduler:checkLeadsForDay3Nurture
```

**Expected:** Email sent, status changes to `"nurtured_day3"`

### 4. Test Signup Conversion

1. Sign up at https://propiq.luntra.one with the same email
2. Check lead status:

```bash
npx convex run leads:getRecentLeads
```

**Expected:** Status changes to `"converted_trial"`, userId linked

---

## Email Templates

### Day 3 Email
- **Subject:** `{firstName}, ready to analyze your first property?`
- **Content:** Reminds about PropIQ, explains benefits, CTA to start free trial
- **UTM:** `utm_campaign=day3`

### Day 7 Email
- **Subject:** `{firstName}, don't miss your 3 free property analyses`
- **Content:** Urgency message, last chance CTA, social proof
- **UTM:** `utm_campaign=day7`

**Both emails:**
- Professional HTML design
- Personalized with first name
- Unsubscribe link included
- Mobile-responsive

---

## Troubleshooting

### Leads not capturing?

**Check:**
1. Formspree webhook URL is correct
2. Form field names match (`email`, `firstName`, `lastName`)
3. Check Convex logs:
   ```bash
   npx convex logs
   ```
4. Look for `[FORMSPREE]` logs

### Emails not sending?

**Check:**
1. `RESEND_API_KEY` is set in Convex environment variables
2. Wait for cron schedule (10 AM EST)
3. Check logs for `[EMAIL SCHEDULER]` entries
4. Verify lead is 3+ days old

### Conversions not tracking?

**Check:**
1. Email addresses match exactly
2. Signup flow includes conversion logic
3. Check `[SIGNUP]` logs for conversion attempts

---

## Current Status

**Test Lead Captured:**
```json
{
  "email": "test-nurture@example.com",
  "firstName": "Test",
  "lastName": "User",
  "status": "captured",
  "leadMagnetType": "real-estate-checklist",
  "source": "formspree",
  "day3EmailSent": false,
  "day7EmailSent": false
}
```

**Next Steps:**
1. Configure Formspree webhook (see above)
2. Test with real lead capture
3. Monitor analytics daily
4. Optimize based on conversion rates

---

## Analytics Insights

Once you have data, you can track:

- **Capture → Trial conversion rate** (target: 15-25%)
- **Trial → Paid conversion rate** (target: 20-30%)
- **Email engagement** (opens, clicks via Resend dashboard)
- **Best performing UTM sources**
- **Day 3 vs Day 7 effectiveness**

---

## Cost Breakdown

**Current Scale (0-100 leads/month):**

| Service | Usage | Cost |
|---------|-------|------|
| Resend | ~200 emails/month | **FREE** (within 3,000/month free tier) |
| Convex | Crons + mutations | **FREE** (within free tier) |
| Formspree | Webhook calls | **FREE** (part of your plan) |

**Total:** $0/month

**At Scale (1,000 leads/month):**

| Service | Usage | Cost |
|---------|-------|------|
| Resend | ~2,000 emails/month | **FREE** (still within free tier!) |
| Convex | Crons + mutations | **FREE** (still within free tier) |
| Formspree | Webhook calls | **FREE** |

**Total:** $0/month (until 1,500+ leads/month)

---

## Quick Commands Reference

```bash
# View lead stats
npx convex run leads:getLeadStats

# View recent leads
npx convex run leads:getRecentLeads

# View conversion funnel
npx convex run leads:getConversionFunnel '{"days": 30}'

# Check Convex logs
npx convex logs

# Deploy updates
npx convex deploy -y

# Test webhook
curl -X POST https://mild-tern-361.convex.site/formspree-webhook \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","leadMagnetType":"real-estate-checklist"}'
```

---

## What Happens Next

**Automatically, every day:**

1. **10:00 AM EST** - System checks for leads captured 3 days ago
2. Sends Day 3 nurture email to eligible leads
3. Updates database: status → `nurtured_day3`

4. **10:30 AM EST** - System checks for leads captured 7 days ago
5. Sends Day 7 nurture email to eligible leads
6. Updates database: status → `nurtured_day7`

**When a user signs up:**
- System checks if they previously downloaded lead magnet
- If found, links lead → user account
- Updates status → `converted_trial`
- **Stops sending nurture emails** (already converted!)

**When they upgrade to paid:**
- Call `convertLeadToPaid` mutation
- Updates status → `converted_paid`
- Track in analytics

---

## Success! 🎉

Your lead nurture sequence is now **fully automated**. The system will:

✅ Capture leads from Formspree
✅ Send Day 3 and Day 7 nurture emails automatically
✅ Convert leads to trial users on signup
✅ Track all conversion metrics
✅ Stop emails for converted users

**No manual work required!**

---

**Questions?** Check the full documentation: `LEAD_NURTURE_IMPLEMENTATION_COMPLETE.md`

**Deployed:** January 7, 2026
**Status:** ✅ Live and Running
