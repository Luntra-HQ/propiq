# PropIQ Production Monitoring Guide

Last Updated: 2025-12-27
Deployment: https://mild-tern-361.convex.cloud

---

## QUICK HEALTH CHECK

Run these queries in Convex dashboard to check system health:

### 1. System Health
```typescript
// In Convex Dashboard → Functions → Run Query
monitoring:getSystemHealth()
```

**Expected Output:**
```json
{
  "status": "healthy",
  "timestamp": 1703721234567,
  "checks": {
    "database": { "status": "healthy", "totalUsers": X, "paidUsers": Y },
    "signups": { "last24Hours": Z, "status": "healthy" },
    "analyses": { "last24Hours": N, "status": "healthy" },
    "emails": { "last24Hours": M, "status": "healthy" },
    "referrals": { "total": R, "last24Hours": 0, "status": "healthy" }
  }
}
```

### 2. Daily Metrics
```typescript
monitoring:getDailyMetrics()
```

**Shows:** signups, analyses, emails, active users for today

### 3. Subscription Metrics
```typescript
monitoring:getSubscriptionMetrics()
```

**Shows:** MRR, tier distribution, total users

---

## MONITORING DASHBOARDS

### Convex Dashboard
**URL:** https://dashboard.convex.dev/t/mild-tern-361/

**Check Daily:**
- Functions → Logs (look for errors in red)
- Data → Tables → emailLogs (verify emails sending)
- Functions → Scheduled (verify cron job running)

**Key Tables to Monitor:**
- `users` - New signups
- `propertyAnalyses` - Usage patterns
- `emailLogs` - Email delivery
- `referrals` - Referral signups
- `cancellations` - Churn (hopefully empty!)

### Stripe Dashboard
**URL:** https://dashboard.stripe.com

**Check Daily:**
- Webhooks → View webhook events
- Verify recent events received (subscription updates)
- Check for failed webhooks (should be 0)

**Webhook Endpoint:**
`https://mild-tern-361.convex.site/stripe/webhook`

**Events to Monitor:**
- `checkout.session.completed` - New subscriptions
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Cancellations

### Resend Dashboard
**URL:** https://resend.com/overview

**Check Daily:**
- Emails → View sent emails
- Domain → Verify propiq.luntra.one still verified
- Delivery rate (should be >95%)

**Email Types to Monitor:**
- `onboarding_day_1` through `onboarding_day_4`
- `trial_expiration_warning` (should see after users hit 1 remaining)
- `trial_expired` (should see when users hit 0)
- `reengagement` (should see Mondays after cron runs)

---

## KEY METRICS TO TRACK

### Daily (Check Every Morning)
1. **Signups:** Run `monitoring:getDailyMetrics()` → Check signups
2. **Active Users:** Run `monitoring:getDailyMetrics()` → Check activeUsers
3. **Analyses Run:** Run `monitoring:getDailyMetrics()` → Check analyses
4. **Emails Sent:** Run `monitoring:getEmailQueueHealth()` → Check last24Hours
5. **Errors:** Check Convex logs for any red error messages

### Weekly (Check Every Monday)
1. **MRR:** Run `monitoring:getSubscriptionMetrics()` → Check mrr (should increase!)
2. **Referral Stats:** Run `monitoring:getReferralStats()` → Check conversion rate
3. **Cron Job:** Check Convex → Functions → Scheduled → Verify "check-inactive-users" ran
4. **Churn:** Check `cancellations` table (hopefully 0)

### Monthly
1. **Revenue Trend:** Track MRR over time
2. **Conversion Rate:** Trial → Paid (track manually or build query)
3. **Email Effectiveness:** Open rates in Resend dashboard
4. **Referral ROI:** Conversions / Total referrals

---

## ALERT THRESHOLDS

**Investigate If:**
- ❌ No signups for 3+ days
- ❌ No analyses for 2+ days
- ❌ Emails not sending (check Resend dashboard)
- ❌ Stripe webhook failures >10
- ❌ Convex errors >50/hour
- ❌ MRR decreases 20%+ in a week
- ❌ Cron job didn't run on Monday

---

## COMMON ISSUES & FIXES

### Issue: Emails Not Sending
**Symptoms:** emailLogs shows entries but Resend shows no sends

**Check:**
1. Resend domain still verified? (check DNS records)
2. RESEND_API_KEY still valid?
3. Check Resend dashboard for errors

**Fix:**
- Re-verify domain in Resend
- Rotate API key if needed

### Issue: Stripe Webhooks Failing
**Symptoms:** Subscription changes not reflected in app

**Check:**
1. Webhook URL correct? `https://mild-tern-361.convex.site/stripe/webhook`
2. Webhook secret matches?
3. Check Stripe dashboard for error details

**Fix:**
- Update webhook URL if changed
- Rotate webhook secret if compromised
- Check Convex logs for webhook handler errors

### Issue: Cron Job Not Running
**Symptoms:** No re-engagement emails on Mondays

**Check:**
1. Convex → Functions → Scheduled → "check-inactive-users" registered?
2. Check last run time

**Fix:**
- Redeploy Convex if cron not registered
- Check Convex logs for cron execution errors

### Issue: Referral Links Not Working
**Symptoms:** /r/[CODE] shows error

**Check:**
1. Referral code exists in database?
2. Check browser console for errors

**Fix:**
- Verify referral code in users table
- Check ReferralLanding component logs

---

## MANUAL QUERIES

Useful Convex queries to run manually:

### Check Recent Errors
```typescript
// No built-in query - check Convex Dashboard → Logs
```

### Find Inactive Free Users
```typescript
// See who might get re-engagement email next Monday
users
  .filter(u => u.subscriptionTier === "free")
  .filter(u => u.lastActiveAt < Date.now() - 14 * 24 * 60 * 60 * 1000)
```

### Check Email Send Status
```typescript
emailLogs
  .filter(e => e.sentAt > Date.now() - 24 * 60 * 60 * 1000)
  .sort((a, b) => b.sentAt - a.sentAt)
```

### Find Users About to Hit Trial Limit
```typescript
users
  .filter(u => u.subscriptionTier === "free")
  .filter(u => u.analysesUsed === 2) // 1 remaining
```

---

## PERFORMANCE MONITORING

### Response Times
**Expected:**
- Homepage: <2s
- Analysis: <15s
- API calls: <500ms

**Check:**
- Browser DevTools → Network tab
- Convex Dashboard → Function execution times

### Database Query Performance
**Check:** Convex Dashboard → Data → Query times
**If slow:** Add indexes or optimize queries

---

## BACKUP & DISASTER RECOVERY

### Convex Data Export
Convex doesn't have built-in export, but you can:
1. Run queries to dump key tables
2. Save results as JSON
3. Store in version control or cloud storage

### Rollback Plan
If critical issue:
1. Git revert to previous commit
2. Redeploy: `npx convex deploy`
3. Rebuild frontend: `npm run build`
4. Redeploy frontend

**Previous working commit:** [check git log]

---

## CONTACT INFORMATION

**Convex Support:** support@convex.dev
**Stripe Support:** support@stripe.com
**Resend Support:** support@resend.com

**Internal:** bdusape@gmail.com

---

## AUTOMATED MONITORING (FUTURE)

**Ideas for future automation:**
1. Set up Pingdom/UptimeRobot for uptime monitoring
2. Configure Sentry for error tracking
3. Set up Slack/Discord webhooks for alerts
4. Build internal dashboard for metrics visualization
5. Set up email alerts for critical thresholds

---

Generated with Claude Code - PropIQ Monitoring Guide
