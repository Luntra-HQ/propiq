# Backup & Disaster Recovery Plan

**Sprint 12 - Task 7: Backup & Disaster Recovery**
**Created:** 2025-11-07

---

## Overview

This document outlines PropIQ's backup strategy and disaster recovery procedures to ensure business continuity and data protection.

**Key Objectives:**
- **RTO (Recovery Time Objective):** 1 hour
- **RPO (Recovery Point Objective):** 24 hours
- **Data Retention:** 30 days for databases, Forever for code

---

## Backup Strategy

### 1. Database Backups (Supabase PostgreSQL)

**Automatic Backups:**
- **Frequency:** Daily (automated by Supabase)
- **Retention:** 30 days on paid plans, 7 days on free tier
- **Type:** Full database snapshots
- **Storage:** Supabase managed (AWS S3)
- **Point-in-Time Recovery (PITR):** Available on Pro plan

**Manual Backups:**
```bash
# Export database to SQL file
pg_dump -h db.yvaujsbktvkzoxfzeimn.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f propiq_backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore -h db.yvaujsbktvkzoxfzeimn.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  propiq_backup_20251107.dump
```

**Backup Schedule:**
- **Daily:** Automatic (Supabase)
- **Weekly:** Manual export to local storage (Saturday)
- **Monthly:** Long-term archive to Azure Blob Storage

**What's Backed Up:**
- All user accounts
- Property analyses history
- Support chat conversations
- Subscription status

### 2. Code & Configuration Backups

**Git Repository:**
- **Frequency:** Every commit (real-time)
- **Retention:** Forever
- **Storage:** GitHub (with 3 geographic replicas)
- **Branches:** main, development, feature branches

**Environment Variables:**
- **Frequency:** On change
- **Storage:** Azure Key Vault (encrypted)
- **Backup:** Export to encrypted `.env.backup` file quarterly

**Configuration Files:**
- Dockerfile, docker-compose.yml
- nginx.conf, deployment scripts
- CI/CD workflows

### 3. Application Backups

**Docker Images:**
- **Frequency:** Every deployment
- **Retention:** Last 10 versions
- **Storage:** Azure Container Registry
- **Size:** ~500MB per image

```bash
# List recent images
az acr repository show-tags \
  --name luntraacr \
  --repository propiq-backend \
  --orderby time_desc \
  --top 10
```

**Frontend Builds:**
- **Frequency:** Every deployment
- **Retention:** Last 10 deployments
- **Storage:** Netlify (automatic)
- **Rollback:** One-click in Netlify UI

### 4. User-Generated Content

**Analysis Reports:**
- Stored in database (backed up automatically)
- Optional: Export to Azure Blob Storage for long-term

**Uploaded Files (if implemented):**
- **Storage:** Azure Blob Storage
- **Backup:** Geo-redundant storage (GRS)
- **Retention:** 90 days

---

## Disaster Recovery Scenarios

### Scenario 1: Database Failure

**Probability:** Low
**Impact:** Critical (service down)

**Recovery Procedure:**

1. **Assess Damage:**
   ```bash
   # Check Supabase status
   curl https://status.supabase.com/api/v2/status.json

   # Test database connection
   psql "postgres://postgres:[password]@db.yvaujsbktvkzoxfzeimn.supabase.co:5432/postgres" -c "SELECT 1;"
   ```

2. **Restore from Backup:**
   - Go to Supabase Dashboard > Database > Backups
   - Select most recent backup (< 24 hours old)
   - Click "Restore"
   - Wait 5-10 minutes for restoration

3. **Verify Restoration:**
   ```bash
   # Check record counts
   psql "..." -c "SELECT COUNT(*) FROM users;"
   psql "..." -c "SELECT COUNT(*) FROM property_analyses;"
   ```

4. **Resume Service:**
   - Update DNS if Supabase provided new endpoint
   - Restart backend application
   - Test critical paths

**Expected Recovery Time:** 30 minutes - 1 hour

### Scenario 2: Backend Application Failure

**Probability:** Medium
**Impact:** High (service down)

**Recovery Procedure:**

1. **Identify Issue:**
   ```bash
   # Check Azure Web App logs
   az webapp log tail \
     --name luntra-outreach-app \
     --resource-group propiq-rg

   # Check Sentry for errors
   # https://sentry.io/organizations/propiq/issues/
   ```

2. **Quick Fix Attempt:**
   - Restart Azure Web App
   - Check environment variables
   - Verify database connection

3. **Rollback if Needed:**
   ```bash
   # List recent Docker images
   az acr repository show-tags \
     --name luntraacr \
     --repository propiq-backend \
     --top 5

   # Rollback to previous version
   az webapp config container set \
     --name luntra-outreach-app \
     --resource-group propiq-rg \
     --docker-custom-image-name luntraacr.azurecr.io/propiq-backend:{previous-sha}

   # Restart app
   az webapp restart \
     --name luntra-outreach-app \
     --resource-group propiq-rg
   ```

4. **Verify:**
   ```bash
   curl https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health
   ```

**Expected Recovery Time:** 15-30 minutes

### Scenario 3: Frontend Application Failure

**Probability:** Low
**Impact:** High (users can't access site)

**Recovery Procedure:**

1. **Check Netlify Status:**
   - Go to Netlify Dashboard
   - Check deployment status
   - Check domain configuration

2. **Rollback Deployment:**
   - Deploys > Published deploys
   - Find last working deployment
   - Click "Publish deploy"

3. **Alternative: Redeploy from Git:**
   ```bash
   git checkout {last-working-commit}
   git push origin main --force  # ONLY if necessary
   ```

4. **Verify:**
   ```bash
   curl -I https://propiq.luntra.one
   ```

**Expected Recovery Time:** 10-15 minutes

### Scenario 4: Complete Infrastructure Failure

**Probability:** Very Low
**Impact:** Critical (everything down)

**Recovery Procedure:**

1. **Assess Scope:**
   - Check Azure status page
   - Check Supabase status page
   - Check Netlify status page
   - Check DNS provider

2. **Restore Services in Order:**

   **Priority 1: Database**
   - Restore Supabase from backup
   - Or migrate to new Supabase project

   **Priority 2: Backend**
   - Deploy to new Azure Web App
   - Or deploy to alternative (Railway, Render, AWS)
   - Configure environment variables
   - Point to restored database

   **Priority 3: Frontend**
   - Deploy to new Netlify site
   - Or deploy to Vercel, Cloudflare Pages
   - Update API URL to point to new backend

   **Priority 4: DNS**
   - Update DNS records to point to new infrastructure

3. **Verify Full Stack:**
   - Test signup flow
   - Test property analysis
   - Test payment processing

**Expected Recovery Time:** 2-4 hours

### Scenario 5: Data Breach / Security Incident

**Probability:** Low
**Impact:** Critical (legal, reputation)

**Immediate Response:**

1. **Isolate:** Take affected systems offline
2. **Assess:** Determine scope of breach
3. **Contain:** Stop ongoing attack
4. **Preserve Evidence:** Save logs, don't delete anything

**Recovery Procedure:**

1. **Restore from Clean Backup:**
   - Use backup from before breach occurred
   - Verify backup is not compromised

2. **Patch Vulnerability:**
   - Fix security hole that allowed breach
   - Update all dependencies
   - Rotate all API keys, secrets, passwords

3. **Notify Affected Users:**
   - Email all users within 72 hours (GDPR requirement)
   - Provide details: what happened, what data affected, what we're doing
   - Offer credit monitoring if PII exposed

4. **File Reports:**
   - Notify authorities if required (GDPR, CCPA)
   - File insurance claim if applicable

**Expected Recovery Time:** 4-24 hours (depending on severity)

---

## Backup Verification

### Monthly Backup Test

**Procedure:**
1. Restore database backup to test environment
2. Verify all tables restored correctly
3. Verify record counts match production
4. Test application against restored database
5. Document any issues found

**Schedule:** First Saturday of each month

**Responsible:** DevOps Lead

### Quarterly Full DR Test

**Procedure:**
1. Simulate complete infrastructure failure
2. Restore all services from backups
3. Time the recovery process
4. Document lessons learned
5. Update DR plan accordingly

**Schedule:** First week of each quarter (Jan, Apr, Jul, Oct)

**Responsible:** Entire engineering team

---

## Backup Monitoring

### Automated Checks

**Daily:**
- Verify Supabase automatic backup completed
- Check backup file size (should be consistent)
- Alert if backup size drops > 50%

**Weekly:**
- Verify manual export succeeded
- Verify backup uploaded to Azure Blob
- Test restore of small table from backup

**Monthly:**
- Full restore test (see above)
- Review backup storage costs
- Archive old backups

### Alerts

**Backup Failure:**
- **Condition:** Daily backup did not complete
- **Action:** Email DevOps team immediately
- **Response Time:** < 1 hour

**Backup Size Anomaly:**
- **Condition:** Backup size changed > 50%
- **Action:** Investigate (data loss or corruption?)
- **Response Time:** < 4 hours

**Storage Full:**
- **Condition:** Backup storage > 90% capacity
- **Action:** Clean up old backups or expand storage
- **Response Time:** < 24 hours

---

## Data Retention Policy

### User Data

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| User accounts | Until deletion request | Required for service |
| Property analyses | 2 years | Historical data value |
| Support chats | 1 year | Customer service records |
| Payment history | 7 years | Tax/legal requirements |
| Logs | 90 days | Debugging, compliance |
| Backups | 30 days | Disaster recovery |

### User Deletion Requests (GDPR/CCPA)

**Procedure:**
1. User requests deletion via email or UI
2. Verify identity
3. Delete all personal data:
   - User account
   - Property analyses (if requested)
   - Support chats
   - Payment methods (keep transaction history)
4. Confirm deletion to user within 30 days
5. Backups will contain data until they age out (30 days)

```sql
-- Delete user data (GDPR right to erasure)
BEGIN;
DELETE FROM support_chats WHERE user_id = 'user-id-here';
DELETE FROM property_analyses WHERE user_id = 'user-id-here';
DELETE FROM users WHERE id = 'user-id-here';
COMMIT;
```

---

## Cost Analysis

### Backup Costs

| Component | Monthly Cost | Storage Size |
|-----------|--------------|--------------|
| Supabase Backups | Included in plan | ~500 MB |
| Azure Blob Storage | ~$1-5 | ~10 GB |
| Azure Container Registry | ~$5 | ~5 GB |
| GitHub (Free tier) | $0 | Unlimited |
| **Total** | **~$6-10/month** | - |

### Cost Optimization

- Delete backups older than 30 days
- Compress manual exports
- Use cold storage for archives (Azure Archive tier)
- Monitor storage growth monthly

---

## Runbook: Common Recovery Tasks

### Restore Database Backup

```bash
# 1. Get latest backup file
BACKUP_FILE="propiq_backup_20251107.dump"

# 2. Stop application (prevent writes during restore)
az webapp stop --name luntra-outreach-app --resource-group propiq-rg

# 3. Restore database
pg_restore -h db.yvaujsbktvkzoxfzeimn.supabase.co \
  -U postgres \
  -d postgres \
  -c \  # Clean (drop) existing objects
  --if-exists \  # Don't error if objects don't exist
  $BACKUP_FILE

# 4. Verify restoration
psql "postgres://..." -c "SELECT COUNT(*) FROM users;"

# 5. Restart application
az webapp start --name luntra-outreach-app --resource-group propiq-rg

# 6. Test critical paths
curl https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health
```

### Rollback Backend Deployment

```bash
# 1. Find previous working version
az acr repository show-tags \
  --name luntraacr \
  --repository propiq-backend \
  --orderby time_desc

# 2. Deploy previous version
az webapp config container set \
  --name luntra-outreach-app \
  --resource-group propiq-rg \
  --docker-custom-image-name luntraacr.azurecr.io/propiq-backend:abc123

# 3. Restart
az webapp restart --name luntra-outreach-app --resource-group propiq-rg

# 4. Wait for restart (2-3 minutes)
sleep 180

# 5. Verify
for i in {1..10}; do
  curl https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health
  sleep 10
done
```

### Rollback Frontend Deployment

```bash
# Option 1: Netlify UI (recommended)
# 1. Go to Netlify Dashboard
# 2. Deploys > Published deploys
# 3. Click on previous deploy
# 4. Click "Publish deploy"

# Option 2: CLI
netlify deploy \
  --prod \
  --dir=dist \
  --site=propiq-luntra-one
```

---

## Contact Information

### Emergency Contacts

- **Primary On-Call:** [Your phone/email]
- **Backup On-Call:** [Backup person]
- **Azure Support:** https://portal.azure.com (create support ticket)
- **Supabase Support:** support@supabase.com
- **Netlify Support:** support@netlify.com

### Escalation Path

1. **Level 1:** On-call developer (respond within 15 min)
2. **Level 2:** Engineering lead (respond within 30 min)
3. **Level 3:** CTO/Founder (respond within 1 hour)

---

## Documentation Updates

This document should be reviewed and updated:
- After every disaster recovery test
- After any incident that required recovery
- Quarterly (even if no incidents)
- When infrastructure changes

**Last Reviewed:** 2025-11-07
**Next Review:** 2026-02-07
**Owner:** DevOps Lead

---

**Status:** Backup & DR plan documented, ready for implementation
**Sprint:** 12 - Production Readiness
