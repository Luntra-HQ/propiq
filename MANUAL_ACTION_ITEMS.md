# Manual Action Items - PropIQ Paid Beta Launch
**Last Updated:** November 10, 2025
**Status:** 🔴 Critical actions pending

This document tracks all manual actions that cannot be automated and must be completed by the team before launch.

---

## 🔴 CRITICAL - Must Complete Before Sprint 1 Starts

### 1. Database Migration (BLOCKING)
**Owner:** Backend Lead
**Time:** 5 minutes
**Priority:** P0 - CRITICAL

**Action:**
```sql
-- Log into Supabase Dashboard → SQL Editor
-- Run: backend/supabase_migration_dealiq_to_propiq.sql
```

**Verification:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name LIKE '%propiq%';

-- Expected output:
-- propiq_usage_count | integer
-- propiq_usage_limit | integer
-- propiq_last_reset_date | timestamp
```

**Why:** App will crash without this - code expects `propiq_*` columns but database has `dealiq_*`

**Status:** ⬜ Not Started

---

### 2. Configure Sentry Error Monitoring
**Owner:** DevOps / Backend Lead
**Time:** 15-30 minutes
**Priority:** P0 - CRITICAL

**Steps:**
1. Create Sentry account: https://sentry.io
2. Create project "propiq-backend" (Python/FastAPI)
3. Copy DSN from project settings
4. Add to production environment variables:
   ```bash
   SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxx@o000000.ingest.sentry.io/0000000
   SENTRY_TRACES_SAMPLE_RATE=1.0
   SENTRY_PROFILES_SAMPLE_RATE=1.0
   RELEASE_VERSION=propiq@3.1.1
   ENVIRONMENT=production
   ```
5. Restart backend service
6. Test: Send test error via API or Sentry dashboard
7. Verify error appears in Sentry within 2 minutes

**Guide:** `backend/MONITORING_SETUP_GUIDE.md` (Section 1)

**Status:** ⬜ Not Started

---

### 3. Set Up Uptime Monitoring
**Owner:** DevOps
**Time:** 10-15 minutes
**Priority:** P0 - CRITICAL

**Steps:**
1. Create UptimeRobot account: https://uptimerobot.com (free tier)
2. Create 4 monitors:
   - **Backend API Health**
     - URL: https://luntra-outreach-app.azurewebsites.net/health
     - Interval: 5 minutes
   - **PropIQ Analysis API**
     - URL: https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health
     - Interval: 5 minutes
   - **Frontend**
     - URL: https://propiq.luntra.one
     - Interval: 5 minutes
   - **Database Health**
     - URL: https://luntra-outreach-app.azurewebsites.net/health
     - Keyword: "database": "connected"
     - Interval: 5 minutes
3. Add alert contacts (email, Slack)
4. Test one monitor (pause/unpause)

**Guide:** `backend/MONITORING_SETUP_GUIDE.md` (Section 2)

**Status:** ⬜ Not Started

---

## ⚠️ HIGH PRIORITY - Complete During Sprint 1 (Week 1)

### 4. Create Staging Environment
**Owner:** DevOps
**Time:** 2-3 hours
**Priority:** P1 - HIGH

**Requirements:**
- [ ] Azure Web App (staging tier)
- [ ] Separate Supabase project (free tier okay)
- [ ] Stripe test mode configured
- [ ] Environment variables configured
- [ ] URL: https://staging.propiq.luntra.one or similar
- [ ] CI/CD pipeline updated to deploy to staging first
- [ ] Smoke tests configured

**Status:** ⬜ Not Started

---

### 5. Configure Stripe Webhook Endpoint
**Owner:** Backend Lead
**Time:** 15 minutes (after webhook handler is built)
**Priority:** P0 - CRITICAL

**Steps:**
1. Log into Stripe Dashboard
2. Go to Developers → Webhooks
3. Add endpoint:
   - URL: https://luntra-outreach-app.azurewebsites.net/api/v1/stripe/webhook
   - Events to send:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Copy webhook signing secret
5. Add to production environment:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
   ```
6. Test webhook with Stripe CLI:
   ```bash
   stripe trigger customer.subscription.created
   ```

**Status:** ⬜ Not Started (waiting for webhook handler code)

---

## 📋 MEDIUM PRIORITY - Complete During Sprint 2 (Week 2)

### 6. Legal Review: Privacy Policy & Terms of Service
**Owner:** Product Manager / CEO
**Time:** 1-2 weeks (external dependency)
**Priority:** P0 - CRITICAL (but can be done async)

**Action:**
1. Engage legal counsel (or use template + review)
2. Draft privacy policy covering:
   - Data collection practices
   - Cookie usage
   - Third-party services (Stripe, Azure, SendGrid)
   - User rights (GDPR)
   - Data retention
3. Draft terms of service covering:
   - Usage limits
   - Payment terms
   - Liability limitations
   - Dispute resolution
4. Get legal approval
5. Publish to website
6. Add acceptance checkbox to signup

**Templates:** Available online (TermsFeed, Termly, etc.)
**Budget:** $2,000-5,000 for legal review

**Status:** ⬜ Not Started

---

### 7. Set Up Slack Alerts
**Owner:** DevOps / Team Lead
**Time:** 30 minutes
**Priority:** P2 - MEDIUM

**Steps:**
1. Create Slack channel: `#propiq-alerts`
2. Configure Sentry → Slack integration
3. Configure UptimeRobot → Slack integration
4. Test alerts
5. Set up alert routing:
   - P0 (critical) → Immediate notification
   - P1 (high) → 5-minute delay
   - P2 (medium) → Daily digest

**Status:** ⬜ Not Started

---

### 8. Database Backup Verification
**Owner:** DevOps / Backend Lead
**Time:** 2 hours
**Priority:** P1 - HIGH

**Action:**
1. Verify Supabase automatic backups enabled
2. Document backup schedule (daily? weekly?)
3. Perform test restore:
   - Create test Supabase project
   - Restore latest backup
   - Verify data integrity
   - Test application connection
4. Document restore procedure (runbook)
5. Schedule monthly backup tests

**Status:** ⬜ Not Started

---

## 📊 GOOD TO HAVE - Complete During Sprint 3 (Week 3)

### 9. Domain Verification for SendGrid
**Owner:** DevOps
**Time:** 1-2 hours (plus DNS propagation time)
**Priority:** P1 - HIGH

**Action:**
1. Log into SendGrid Dashboard
2. Go to Settings → Sender Authentication
3. Authenticate domain: `propiq.luntra.one`
4. Add DNS records:
   - SPF record
   - DKIM records (3 CNAME records)
5. Verify domain (can take up to 48 hours)
6. Test email sending

**Status:** ⬜ Not Started (onboarding emails working but not verified)

---

### 10. Set Up Onboarding Email Scheduler
**Owner:** DevOps / Backend Lead
**Time:** 1 hour
**Priority:** P1 - HIGH

**Action - Option A (Recommended): Cron Job**
```bash
# Add to crontab
0 * * * * cd /path/to/propiq/backend && python3 onboarding_scheduler.py >> /var/log/onboarding.log 2>&1
```

**Action - Option B: Render.com Cron Job**
```yaml
# Add to render.yaml
- type: cron
  name: propiq-onboarding-scheduler
  schedule: "0 * * * *"
  buildCommand: "pip install -r requirements.txt"
  startCommand: "python onboarding_scheduler.py"
```

**Verification:**
- Check logs after 1 hour
- Verify scheduled emails being sent
- Monitor Supabase `onboarding_status` table

**Guide:** `backend/ONBOARDING_SCHEDULER_SETUP.md`

**Status:** ⬜ Not Started

---

## 🔧 TECHNICAL DEBT - Post-Launch

### 11. Add Database Indexes for Performance
**Owner:** Backend Lead
**Time:** 15 minutes
**Priority:** P1 - HIGH

**Action:**
```sql
-- Run in Supabase SQL Editor:
-- File: backend/scripts/add_production_indexes.sql
```

**Impact:** 10-50x faster queries for analysis history and support chats

**Status:** ⬜ Not Started

---

### 12. Implement CI/CD Test Gates
**Owner:** DevOps
**Time:** 2 hours
**Priority:** P1 - HIGH

**Action:**
1. Edit `.github/workflows/deploy.yml`
2. Remove all `|| true` and `|| echo "..."` from test steps
3. Make tests mandatory (deployment fails if tests fail)
4. Add test coverage reporting (pytest-cov)
5. Require minimum 50% coverage on new code
6. Add security scanning (bandit, safety)

**Status:** ⬜ Not Started

---

### 13. Azure OpenAI Quota Check
**Owner:** Backend Lead / Azure Admin
**Time:** 15 minutes
**Priority:** P2 - MEDIUM

**Action:**
1. Log into Azure Portal
2. Check Azure OpenAI quota limits
3. Estimate usage for 50-100 beta users
4. Request quota increase if needed
5. Set up usage alerts (80% of quota)

**Status:** ⬜ Not Started

---

## 📅 SPRINT-SPECIFIC TODOS

### Sprint 1 (Nov 13-19): Payment Infrastructure
- [ ] Configure Stripe webhook endpoint (after code is written)
- [ ] Set up staging environment
- [ ] Run database migration
- [ ] Add database indexes

### Sprint 2 (Nov 20-26): Testing & Compliance
- [ ] Engage legal counsel for privacy policy/ToS
- [ ] Configure all monitoring (Sentry, UptimeRobot, Slack)
- [ ] Verify database backups
- [ ] Set up log aggregation (optional)

### Sprint 3 (Nov 27-Dec 3): Subscription Management
- [ ] Set up onboarding email scheduler
- [ ] Verify SendGrid domain
- [ ] Create admin user accounts
- [ ] Configure alerting thresholds

### Sprint 4 (Dec 4-8): Soft Launch
- [ ] Beta user recruitment
- [ ] Create promo codes in Stripe
- [ ] Prepare welcome emails
- [ ] Set up war room (Slack/Zoom)
- [ ] Final security scan

---

## ✅ COMPLETED ITEMS

### Sprint 0 (Nov 10-12)
- [x] Fix database column naming (migration created)
- [x] Document Sentry setup
- [x] Document UptimeRobot setup
- [x] Verify MongoDB code removed
- [x] Investigate rate limiter bug

---

## 📊 PROGRESS TRACKING

### By Priority
- **P0 (Critical):** 5 items (3 not started, 2 in progress)
- **P1 (High):** 6 items (6 not started)
- **P2 (Medium):** 2 items (2 not started)

### By Sprint
- **Sprint 0:** 5/5 completed ✅
- **Sprint 1:** 0/4 started
- **Sprint 2:** 0/4 started
- **Sprint 3:** 0/3 started
- **Sprint 4:** 0/4 started

### Overall Progress
- **Completed:** 5/25 (20%)
- **In Progress:** 0/25 (0%)
- **Not Started:** 20/25 (80%)

---

## 🚨 BLOCKERS

| Item | Blocking What | Action Needed | Owner |
|------|---------------|---------------|-------|
| Database migration | All features | Run SQL script | Backend Lead |
| Sentry config | Error monitoring | Add DSN to .env | DevOps |
| Legal review | GDPR compliance | Engage counsel | PM/CEO |
| Staging environment | Safe testing | Create Azure resources | DevOps |

---

## 📞 CONTACTS & ESCALATION

**For urgent issues:**
- Backend/DevOps: [Team Lead]
- Legal questions: [Legal Counsel]
- Stripe questions: support@stripe.com
- Sentry questions: support@sentry.io
- Azure questions: Azure Portal Support

**Escalation Path:**
1. Team Lead (immediate)
2. CTO (within 1 hour)
3. CEO (P0 incidents only)

---

## 📝 NOTES

**Update Frequency:** This document should be updated:
- Daily during active sprints
- After each manual action is completed
- When new manual actions are identified
- During sprint planning and retrospectives

**Status Indicators:**
- ⬜ Not Started
- 🔄 In Progress
- ✅ Completed
- ⚠️ Blocked
- ❌ Cancelled

---

**Document Owner:** CTO Office
**Last Review:** November 10, 2025
**Next Review:** End of Sprint 1 (November 19, 2025)
