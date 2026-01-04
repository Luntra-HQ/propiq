# PropIQ API Key Rotation Schedule

**Created:** December 30, 2025
**Frequency:** Quarterly (every 90 days)
**Duration per rotation:** 30-45 minutes (critical keys), 60-90 minutes (annual)

---

## 📅 2026 Rotation Calendar

| Quarter | Date | Type | Keys to Rotate | Time Blocked |
|---------|------|------|----------------|--------------|
| **Q1** | **March 30, 2026** | Quarterly | Critical only | 9:00 AM - 11:00 AM |
| **Q2** | **June 30, 2026** | Quarterly | Critical only | 9:00 AM - 11:00 AM |
| **Q3** | **September 30, 2026** | Quarterly | Critical only | 9:00 AM - 11:00 AM |
| **Q4** | **December 30, 2026** | **ANNUAL** | **ALL keys + audit** | 9:00 AM - 12:00 PM |

---

## 🔴 Quarterly Rotation (Q1, Q2, Q3)

### Critical Keys to Rotate

1. **Stripe** (3 keys)
   - Secret key
   - Publishable key
   - Webhook secret
   - Time: ~5 minutes

2. **Supabase** (1 key)
   - Service key
   - Time: ~3 minutes

3. **Azure OpenAI** (1 key)
   - API key
   - Time: ~3 minutes

4. **MongoDB** (1 password)
   - Database password
   - Time: ~3 minutes

5. **SendGrid** (1 key)
   - API key
   - Time: ~3 minutes

**Total Time:** 20-30 minutes
**Buffer:** +15 minutes for testing
**Scheduled Block:** 2 hours (includes margin)

### Procedure

```bash
# 1. Navigate to project
cd /Users/briandusape/Projects/propiq

# 2. Run rotation tracker
./scripts/check-rotation-status.sh

# 3. Follow guide
# Open: QUICK_ROTATION_GUIDE.md

# 4. Rotate each key following the guide

# 5. Test services
curl https://luntra-outreach-app.azurewebsites.net/propiq/health

# 6. Update Azure App Settings
# Go to Azure Portal → luntra-outreach-app → Configuration

# 7. Restart backend
# Azure Portal → Overview → Restart

# 8. Final verification
./scripts/check-rotation-status.sh
```

---

## 🔴 Annual Rotation (Q4 - December)

### ALL Keys to Rotate

#### Critical Priority
- ✅ Stripe (3 keys)
- ✅ Supabase (1 key)
- ✅ Azure OpenAI (1 key)
- ✅ MongoDB (1 password)
- ✅ SendGrid (1 key)

#### Moderate Priority
- ✅ Convex deploy key
- ✅ JWT secret (⚠️ logs out all users)
- ✅ Intercom keys (2 keys)
- ✅ Slack webhook

#### Low Priority
- ⚪ Weights & Biases
- ⚪ Sentry DSN

**Total Keys:** 13-15 keys
**Total Time:** 60-90 minutes
**Scheduled Block:** 3 hours

### Additional Annual Tasks

1. **Security Audit**
   - Re-run security scan
   - Check git history for leaks
   - Update SECURITY_AUDIT_REPORT.md

2. **Access Log Review**
   - Stripe payment logs
   - Supabase database access
   - Azure OpenAI usage
   - SendGrid email logs
   - MongoDB connection logs

3. **Service Health Check**
   - Test all integrations
   - Review error logs
   - Check for deprecated APIs
   - Update dependencies

4. **Documentation Update**
   - Update rotation procedures
   - Document any issues encountered
   - Update service credentials in 1Password/vault

5. **Monitoring Setup**
   - Review billing alerts
   - Check fraud detection settings
   - Update rate limits if needed

---

## ⏰ Reminder Schedule

For each rotation date, set these reminders:

### 1 Week Before
**Example: March 23, 2026**
- [ ] Email reminder sent
- [ ] Calendar notification
- [ ] Phone reminder
- **Action:** Review rotation guide, block time on calendar

### 1 Day Before
**Example: March 29, 2026**
- [ ] Calendar notification
- [ ] Phone reminder
- **Action:** Confirm time is still available, gather dashboards

### Day Of
**Example: March 30, 2026 at 9:00 AM**
- [ ] Calendar event starts
- [ ] Phone alarm
- **Action:** Start rotation process

---

## 📧 Auto-Reminder Setup

### Option 1: Email Reminders

Use the script to send yourself email reminders:

```bash
# Edit your email in the script
nano scripts/send-rotation-reminder.sh

# Test it
./scripts/send-rotation-reminder.sh

# Schedule via cron (runs 1 week before each rotation)
crontab -e

# Add these lines:
0 9 23 3 * /Users/briandusape/Projects/propiq/scripts/send-rotation-reminder.sh
0 9 23 6 * /Users/briandusape/Projects/propiq/scripts/send-rotation-reminder.sh
0 9 23 9 * /Users/briandusape/Projects/propiq/scripts/send-rotation-reminder.sh
0 9 23 12 * /Users/briandusape/Projects/propiq/scripts/send-rotation-reminder.sh
```

### Option 2: Calendar Events

Already created by setup script! Check your calendar app.

### Option 3: Recurring Tasks (Notion, Todoist, etc.)

Create a recurring task:
- **Title:** "🔐 Rotate PropIQ API Keys"
- **Frequency:** Every 3 months
- **Start date:** March 30, 2026
- **Reminder:** 1 week before, 1 day before
- **Notes:** Link to `/Users/briandusape/Projects/propiq/QUICK_ROTATION_GUIDE.md`

---

## ✅ Post-Rotation Checklist

After each rotation:

### Immediate (Same Day)
- [ ] All required keys rotated
- [ ] Old keys deleted from dashboards
- [ ] Backend redeployed
- [ ] Azure App Settings updated
- [ ] All services tested and working
- [ ] No errors in logs

### Follow-up (Next Day)
- [ ] Monitor error logs for 24 hours
- [ ] Check for any service disruptions
- [ ] Verify webhooks are working (Stripe)
- [ ] Confirm emails are sending (SendGrid)
- [ ] Update team wiki/documentation

### Long-term (Within Week)
- [ ] Review access logs for unusual activity
- [ ] Verify billing is normal (no unexpected charges)
- [ ] Update rotation status:
  ```bash
  ./scripts/check-rotation-status.sh
  ```
- [ ] Confirm next rotation date in calendar

---

## 🚨 Emergency Rotation

Rotate immediately if:
- [ ] Team member with access leaves
- [ ] Suspected security breach
- [ ] API key appears in logs/public repo
- [ ] Unusual service activity detected
- [ ] Compliance requirement

Emergency rotation process:
1. **Prioritize critical keys first** (Stripe, Supabase, Azure, MongoDB)
2. **Rotate within 1 hour** of detection
3. **Monitor closely** for 24-48 hours
4. **Document incident** in security log
5. **Review access controls** and permissions

---

## 📊 Rotation History

Track your rotations here:

| Date | Quarter | Keys Rotated | Duration | Issues | Notes |
|------|---------|--------------|----------|--------|-------|
| 2025-12-30 | Initial | None yet | - | - | Security audit completed |
| 2026-03-30 | Q1 | TBD | TBD | - | First rotation |
| 2026-06-30 | Q2 | TBD | TBD | - | |
| 2026-09-30 | Q3 | TBD | TBD | - | |
| 2026-12-30 | Q4 Annual | TBD | TBD | - | Full audit |

**Update this table after each rotation!**

---

## 🎯 Success Metrics

Track these metrics to ensure rotations are effective:

- **Rotation completion rate:** Target 100%
- **Average rotation time:** Target <45 mins for quarterly, <90 mins for annual
- **Issues encountered:** Target 0 service disruptions
- **Time to detect issues:** Target <1 hour
- **Time to resolve issues:** Target <4 hours

---

## 📚 Resources

### Quick Links
- **Rotation guide:** [QUICK_ROTATION_GUIDE.md](QUICK_ROTATION_GUIDE.md)
- **Security audit:** [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)
- **Status tracker:** `./scripts/check-rotation-status.sh`
- **Git-secrets setup:** `./scripts/setup-git-secrets.sh`

### Service Dashboards
- Stripe: https://dashboard.stripe.com/apikeys
- Supabase: https://supabase.com/dashboard
- Azure: https://portal.azure.com
- MongoDB: https://cloud.mongodb.com
- SendGrid: https://app.sendgrid.com/settings/api_keys
- Convex: https://dashboard.convex.dev

### Support
- **Questions?** Check SECURITY_AUDIT_REPORT.md
- **Issues?** See troubleshooting in QUICK_ROTATION_GUIDE.md
- **Emergency?** Contact service support directly

---

## 🔄 Schedule Updates

This schedule should be reviewed annually. Update if:
- Business requirements change
- New services are added
- Security policies are updated
- Team structure changes

**Next schedule review:** December 30, 2026

---

**Created:** December 30, 2025
**Last Updated:** December 30, 2025
**Next Rotation:** March 30, 2026 (90 days)
**Version:** 1.0
