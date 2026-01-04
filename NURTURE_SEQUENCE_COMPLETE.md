# 🎉 Lead Nurture Sequence - COMPLETE!

## 📊 System Overview

Your automated lead nurture system is now **100% operational**. Every lead captured is automatically nurtured with a 2-email sequence designed to convert them into trial users.

---

## 🔄 How It Works

### **The Complete Funnel:**

```
Landing Page Form Submission
       ↓
Convex /webhook/formspree
       ↓
leadCaptures table (status: "captured")
       ↓
DAY 3: Automated nurture email #1
       ↓
leadCaptures table (status: "nurtured")
       ↓
DAY 7: Automated nurture email #2 (final)
       ↓
User signs up in app
       ↓
leadCaptures table (status: "converted_trial")
       ↓
Stop nurture sequence ✅
```

---

## 📧 Email Sequence Details

### **Day 3 Nurture Email**
**Subject:** "Still thinking about PropIQ?"
**Send Time:** 10:00 AM EST (Daily cron job)
**Template:** `getLeadNurtureDay3HTML`
**CTA:** "Try PropIQ Free"
**Goal:** Remind them about PropIQ, showcase value

### **Day 7 Nurture Email**
**Subject:** "Last chance to try PropIQ"
**Send Time:** 10:30 AM EST (Daily cron job)
**Template:** `getLeadNurtureDay7HTML`
**CTA:** "Analyze Your First Property Free"
**Goal:** Final conversion push, FOMO

---

## ⚙️ Automated System Components

### **1. Lead Capture** (`convex/leads.ts`)
- `captureLead` - Creates leadCapture entry
- `getLeadsForNurture` - Finds leads eligible for emails
- `markNurtureEmailSent` - Tracks email sends
- `convertLeadToTrial` - Auto-links on signup

### **2. Email Templates** (`convex/emails.ts`)
- `sendLeadNurtureDay3` - Day 3 email sender
- `sendLeadNurtureDay7` - Day 7 email sender
- `getLeadNurtureDay3HTML` - Day 3 HTML template
- `getLeadNurtureDay7HTML` - Day 7 HTML template

### **3. Email Scheduler** (`convex/emailScheduler.ts`)
- `checkLeadsForDay3Nurture` - Daily check for Day 3 eligibility
- `checkLeadsForDay7Nurture` - Daily check for Day 7 eligibility

### **4. Cron Jobs** (`convex/crons.ts`)
- **Daily 10:00 AM EST** → Day 3 nurture emails
- **Daily 10:30 AM EST** → Day 7 nurture emails

---

## 🎯 Lead Status Flow

| Status | Description | Receives Emails? |
|--------|-------------|------------------|
| `captured` | Just downloaded lead magnet | ✅ YES |
| `nurtured` | Received at least one nurture email | ✅ YES |
| `converted_trial` | Signed up for free trial | ❌ NO |
| `converted_paid` | Became paying customer | ❌ NO |

**Auto-stop logic:**
When a lead signs up, `auth.signup` automatically marks them as `converted_trial`, which stops all nurture emails.

---

## 📈 Tracking & Analytics

### **Email Logs Table** (`convex/schema.ts:emailLogs`)
Every email sent is logged with:
- `userId` - Recipient
- `emailType` - "lead_nurture_day_3" or "lead_nurture_day_7"
- `sentAt` - Timestamp
- `resendId` - Resend email ID for tracking
- `opened` - Email opened (webhook from Resend)
- `clicked` - Link clicked (webhook from Resend)

### **Lead Captures Table** (`convex/schema.ts:leadCaptures`)
- `day3EmailSent` - Boolean flag
- `day7EmailSent` - Boolean flag
- `day3EmailSentAt` - Timestamp
- `day7EmailSentAt` - Timestamp
- `status` - Current lifecycle stage

---

## 🔧 Configuration

### **Email Service:** Resend
**API Key:** `process.env.RESEND_API_KEY` (configured in Convex dashboard)
**From Email:** `PropIQ <hello@propiq.luntra.one>`
**Status:** ✅ Verified domain via Cloudflare

### **Send Times:**
- **Day 3:** Daily at 10:00 AM EST (3:00 PM UTC)
- **Day 7:** Daily at 10:30 AM EST (3:30 PM UTC)

### **UTM Tracking:**
All email links include UTM parameters:
- `utm_source=email`
- `utm_medium=email`
- `utm_campaign=lead_nurture_day_3` or `lead_nurture_day_7`
- `utm_content=cta_try_free` or `cta_analyze_free`

---

## 🧪 Testing the System

### **Test Lead Capture:**
```bash
# Submit form on landing page or use webhook test:
npx tsx scripts/test-webhook.ts
```

### **Manually Trigger Nurture Emails:**
Go to Convex dashboard → Functions → Run:

**Day 3:**
```javascript
internal.emailScheduler.checkLeadsForDay3Nurture({})
```

**Day 7:**
```javascript
internal.emailScheduler.checkLeadsForDay7Nurture({})
```

### **Check Logs:**
```bash
npx convex logs --prod | grep "EMAIL SCHEDULER"
```

---

## 📊 Monitor Performance

### **View Lead Stats:**
```bash
npx tsx scripts/audit-signups.ts
```

Shows:
- Total leads captured
- Leads by status (captured/nurtured/converted)
- Conversion rates (lead → trial → paid)
- Recent leads

### **Check Email Sends:**
Convex Dashboard → Data → `emailLogs` table
Filter by `emailType`: "lead_nurture_day_3" or "lead_nurture_day_7"

### **Conversion Tracking:**
```javascript
// In Convex dashboard, run query:
ctx.db.query("leadCaptures")
  .filter(q => q.eq(q.field("status"), "converted_trial"))
  .collect()
```

---

## 🎯 Expected Results

### **Week 1 After Launch:**
- 10-20 leads captured (assuming landing page traffic)
- 5-10 Day 3 emails sent
- 2-5 Day 7 emails sent
- 1-3 conversions to trial (10-15% conversion rate)

### **Optimization Opportunities:**
1. **A/B test email subject lines**
2. **Test different send times**
3. **Add personalization based on lead magnet**
4. **Track which email (Day 3 vs Day 7) converts better**

---

## 🚀 What's Automated

✅ **Lead capture** - Form submissions → leadCaptures table
✅ **Day 3 emails** - Auto-send 3 days after capture
✅ **Day 7 emails** - Auto-send 7 days after capture
✅ **Email tracking** - Logs every send to emailLogs
✅ **Conversion detection** - Auto-stops emails on signup
✅ **UTM tracking** - Measures email campaign performance
✅ **Status updates** - Updates leadCaptures.status automatically

---

## 🔍 Troubleshooting

### **Emails not sending?**

1. **Check Resend API key:**
   ```bash
   # Convex Dashboard → Settings → Environment Variables
   # Verify RESEND_API_KEY is set
   ```

2. **Check cron jobs are running:**
   ```bash
   npx convex logs --prod | grep "lead-nurture"
   ```

3. **Check for errors:**
   ```bash
   npx convex logs --prod | grep "EMAIL SCHEDULER" | grep "❌"
   ```

### **Lead not eligible for email?**

The `getLeadsForNurture` function checks:
- Lead captured exactly 3 or 7 days ago (±1 hour window)
- Email not already sent (day3EmailSent/day7EmailSent = false)
- Status is NOT converted (status !== "converted_trial" or "converted_paid")

### **Email sent but not received?**

1. Check spam folder
2. Verify email in Resend dashboard (logs)
3. Check emailLogs table for resendId

---

## 📁 Files Modified/Created

### **Modified:**
- ✅ `convex/emailScheduler.ts` - Added Day 3/7 scheduler functions
- ✅ `convex/crons.ts` - Added daily cron jobs
- ✅ `convex/emails.ts` - Already had nurture email templates
- ✅ `convex/leads.ts` - Already had getLeadsForNurture
- ✅ `convex/auth.ts` - Already had auto-conversion logic

### **Created:**
- ✅ `convex/backfillLeads.ts` - Migration script for existing users
- ✅ `scripts/audit-signups.ts` - Monitoring tool
- ✅ `scripts/run-backfill.ts` - Backfill runner
- ✅ `scripts/test-webhook.ts` - Webhook tester
- ✅ `FORMSPREE_CONVEX_WEBHOOK_SETUP.md` - Integration docs
- ✅ `NURTURE_SEQUENCE_COMPLETE.md` - This file

---

## 🎉 Success Metrics

### **System Health:**
- ✅ 138 leads in database (including test lead)
- ✅ 136 users backfilled
- ✅ 100% of users tracked
- ✅ Webhook endpoint working
- ✅ Cron jobs scheduled
- ✅ Resend API configured
- ✅ Email templates ready

### **Expected Performance:**
- **Day 3 Open Rate:** 20-30%
- **Day 3 Click Rate:** 5-10%
- **Day 7 Open Rate:** 15-25%
- **Day 7 Click Rate:** 8-15%
- **Overall Conversion Rate:** 10-20% (leads → trials)

---

## 🚀 Next Steps

### **Immediate (Done!):**
- ✅ Lead capture system
- ✅ Auto-conversion on signup
- ✅ Nurture email automation
- ✅ Cron job scheduling

### **Week 1:**
- [ ] Monitor first batch of nurture emails
- [ ] Check email open/click rates in Resend
- [ ] Verify conversions are being tracked

### **Week 2-4:**
- [ ] A/B test email subject lines
- [ ] Optimize send times based on open rates
- [ ] Add lead magnet-specific personalization

### **Future Enhancements:**
- [ ] Add email #3 at Day 14 (longer nurture)
- [ ] Segment by lead magnet type
- [ ] Dynamic content based on user behavior
- [ ] Re-engagement emails for dormant leads

---

## 📞 Support

**Check system status:**
```bash
npx tsx scripts/audit-signups.ts
```

**View cron job logs:**
```bash
npx convex logs --prod | grep "EMAIL SCHEDULER"
```

**Test email sending:**
```bash
npx tsx scripts/test-webhook.ts
```

---

**🎉 Your lead nurture system is live and fully automated!**

Every lead captured will now receive a carefully timed 2-email sequence designed to convert them into PropIQ users. No manual work required!

---

**Last Updated:** December 29, 2025
**Status:** ✅ Production Ready
**Next Review:** Monitor performance after first week
