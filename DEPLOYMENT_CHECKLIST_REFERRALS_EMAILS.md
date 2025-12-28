# PropIQ Deployment Checklist - Referrals & Email Automation

Last Updated: 2025-12-27
Features: Referrals, Shareable Links, Email Automation, Admin Dashboard

---

## CRITICAL SCHEMA FIXES DEPLOYED

✅ FIXED (commit ffef2ec):
- Added users.lastActiveAt field
- Added emailLogs.by_user_and_type index

These were blocking bugs and are now resolved.

---

## PRE-DEPLOYMENT CHECKS

### 1. Convex Schema Migration (REQUIRED)
Deploy schema to production:
```bash
npx convex deploy --prod
```

Verify:
- users.lastActiveAt field exists
- propertyAnalyses sharing fields exist
- emailLogs.by_user_and_type index created
- referrals table created
- cancellations table created

### 2. Environment Variables (Convex Production)
Required:
- RESEND_API_KEY (for email sending)
- STRIPE_SECRET_KEY (live key)
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_IDs (starter, pro, elite)

### 3. Resend Email Setup (CRITICAL)
- Verify domain: propiq.luntra.one
- Add DNS records: SPF, DKIM, DMARC
- Test email sending
- Sender: PropIQ <hello@propiq.luntra.one>

WITHOUT THIS: Emails will log but NOT send!

### 4. Stripe Webhook Update
- Update webhook URL to production Convex endpoint
- Verify webhook secret matches
- Enable subscription events

### 5. Cron Job Verification
Check in Convex dashboard:
- Job: check-inactive-users
- Schedule: Monday 14:00 UTC
- Verify registered and scheduled

---

## DEPLOYMENT STEPS

1. Deploy Convex: npx convex deploy --prod
2. Build frontend: npm run build  
3. Deploy frontend
4. Test in production

---

## TEST IN PRODUCTION

### Critical Flows
1. Signup and trial counter
2. Property analysis triggers emails correctly
3. Referral link works: /r/[code]
4. Share analysis works: /a/[token]
5. Admin dashboard loads: /admin

### Email Triggers
Verify in emailLogs table:
- Trial warning fires at 1 remaining
- Trial expired fires at 0 remaining
- No duplicate sends

---

## KNOWN ISSUES

1. Emails require Resend domain verification
2. Cron runs next Monday (first time)
3. Referral rewards not auto-applied yet

---

## MONITORING

Day 1:
- Convex logs for errors
- Resend dashboard for delivery
- emailLogs table for sends
- referrals table for signups

Week 1:
- Referral conversion rate
- Email open rates
- Share link usage
- Trial-to-paid after automation

---

Generated with Claude Code
