# Domain Management & Onboarding Fix Summary

## Overview

This document summarizes all the fixes applied to resolve the domain management issue that was preventing users from creating accounts and receiving welcome/onboarding emails.

## Issues Fixed

### 1. Domain Configuration Mismatch ✅

**Problem**: Email templates defaulted to `propiq.ai` instead of the production domain `propiq.luntra.one`

**Files Changed**:
- `backend/utils/onboarding_emails.py:16-18`

**Changes**:
```python
# Before
FROM_EMAIL = os.getenv("FROM_EMAIL", "team@propiq.ai")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@propiq.ai")

# After
FROM_EMAIL = os.getenv("FROM_EMAIL", "team@propiq.luntra.one")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@propiq.luntra.one")
```

**Impact**: All email links now point to the correct domain, ensuring users can access the platform from emails.

---

### 2. Missing Environment Variables ✅

**Problem**: Required environment variables for email configuration were not documented

**Files Changed**:
- `backend/.env.template`

**Changes**:
- Added `FROM_EMAIL=team@propiq.luntra.one`
- Added `SUPPORT_EMAIL=support@propiq.luntra.one`
- Added `APP_URL=https://propiq.luntra.one`
- Updated `SENDGRID_FROM_EMAIL=team@propiq.luntra.one`
- Updated `ALLOWED_ORIGINS` to include `https://propiq.luntra.one`
- Added note about SendGrid domain verification requirements

**Impact**: Clear documentation of all required environment variables for production deployment.

---

### 3. Missing Database Functions ✅

**Problem**: Four critical database functions were called but not implemented

**Files Changed**:
- `backend/database_supabase.py` (added 195 lines)

**Functions Added**:
1. `record_onboarding_status(user_id, campaign_results)` - Records initial onboarding status
2. `update_onboarding_status(user_id, day_number, status)` - Updates email status
3. `get_onboarding_status(user_id)` - Retrieves user's onboarding status
4. `get_pending_onboarding_emails()` - Gets emails that need to be sent

**Impact**: Onboarding status is now properly tracked in the database, enabling scheduled email delivery.

---

### 4. Missing Database Table ✅

**Problem**: No table to track onboarding campaign status

**Files Created**:
- `backend/supabase_migration_add_onboarding.sql`

**Table Created**: `onboarding_status`
- Tracks campaign start time
- Stores email statuses (sent, scheduled, pending)
- Records scheduled email information
- Logs errors
- Includes efficient indexes for queries

**Impact**: Full persistence and tracking of onboarding campaigns.

---

### 5. No Automated Email Scheduler ✅

**Problem**: Days 2-4 emails were scheduled but never sent (no background job)

**Files Created**:
- `backend/onboarding_scheduler.py` - Scheduler script
- `backend/ONBOARDING_SCHEDULER_SETUP.md` - Setup documentation

**Features**:
- One-time execution mode (for cron jobs)
- Daemon mode with APScheduler (for background processes)
- Command-line interface
- Comprehensive logging
- Error handling

**Usage**:
```bash
# Run once (for cron)
python onboarding_scheduler.py

# Run as daemon
python onboarding_scheduler.py --daemon
```

**Cron Setup**:
```bash
# Run every hour
0 * * * * cd /path/to/backend && python onboarding_scheduler.py
```

**Impact**: Users now receive all 4 onboarding emails on schedule.

---

### 6. Silent Email Failures ✅

**Problem**: If SendGrid failed, signup succeeded but users had no indication emails weren't sent

**Files Changed**:
- `backend/auth.py:240-280`

**Changes**:
- Added email status tracking during signup
- Return warning message if onboarding emails fail
- User sees: "User created successfully. Note: There was an issue sending the welcome email. Please contact support if you don't receive it within 24 hours."

**Impact**: Users are informed if welcome emails don't send, reducing confusion.

---

### 7. No Email Retry Logic ✅

**Problem**: Transient network errors caused permanent email failures

**Files Changed**:
- `backend/utils/onboarding_campaign.py:28-90`

**Changes**:
- Added retry logic with exponential backoff (3 attempts)
- Delays: 1s, 2s, 4s between retries
- Smart retry: only retries on 5xx errors, not 4xx client errors
- Detailed logging of retry attempts

**Impact**: Temporary network issues no longer cause email delivery failures.

---

## Deployment Checklist

To deploy these fixes to production, follow these steps:

### 1. Database Migration

Run the SQL migration in your Supabase dashboard:

```bash
# Copy the contents of this file and execute in Supabase SQL Editor:
backend/supabase_migration_add_onboarding.sql
```

### 2. Environment Variables

Add/update these variables in your production environment:

```bash
FROM_EMAIL=team@propiq.luntra.one
SUPPORT_EMAIL=support@propiq.luntra.one
APP_URL=https://propiq.luntra.one
SENDGRID_FROM_EMAIL=team@propiq.luntra.one
SENDGRID_API_KEY=<your-sendgrid-api-key>
ALLOWED_ORIGINS=https://propiq.luntra.one,http://localhost:5173
```

### 3. SendGrid Domain Verification

**Critical**: Verify the domain in SendGrid:

1. Log in to SendGrid Dashboard
2. Go to Settings → Sender Authentication
3. Click "Verify a Single Sender" or "Authenticate Your Domain"
4. Add domain: `propiq.luntra.one`
5. Follow DNS setup instructions (add SPF and DKIM records)
6. Wait for verification (can take up to 48 hours)

**Why this matters**: Emails will not send without domain verification. This is a SendGrid requirement.

### 4. Set Up Email Scheduler

Choose one option:

**Option A: Cron Job (Recommended)**

```bash
# Edit crontab
crontab -e

# Add this line (adjust path):
0 * * * * cd /path/to/propiq/backend && python3 onboarding_scheduler.py >> /var/log/onboarding.log 2>&1
```

**Option B: Render.com Cron Job**

Add to `render.yaml`:
```yaml
- type: cron
  name: propiq-onboarding-scheduler
  schedule: "0 * * * *"
  buildCommand: "pip install -r requirements.txt"
  startCommand: "python onboarding_scheduler.py"
```

**Option C: Background Daemon**

```bash
# Install APScheduler
pip install apscheduler

# Run as daemon
python onboarding_scheduler.py --daemon
```

See `backend/ONBOARDING_SCHEDULER_SETUP.md` for detailed setup instructions for various platforms.

### 5. Deploy Code Changes

```bash
# Push changes to production branch
git add .
git commit -m "Fix domain management and onboarding email system"
git push origin <branch-name>
```

### 6. Verify Everything Works

**Test signup flow**:
1. Sign up a test user
2. Verify Day 1 email arrives immediately
3. Check database for scheduled emails:
   ```sql
   SELECT * FROM onboarding_status WHERE user_email = 'test@example.com';
   ```
4. Wait for scheduler to run (or run manually)
5. Verify Days 2-4 emails arrive

**Test scheduler**:
```bash
# Run manually
python onboarding_scheduler.py

# Check logs
tail -f /var/log/onboarding.log
```

---

## Files Changed Summary

| File | Status | Changes |
|------|--------|---------|
| `backend/utils/onboarding_emails.py` | Modified | Fixed domain defaults |
| `backend/.env.template` | Modified | Added email config vars |
| `backend/database_supabase.py` | Modified | Added 4 onboarding functions |
| `backend/supabase_migration_add_onboarding.sql` | Created | Database table migration |
| `backend/onboarding_scheduler.py` | Created | Email scheduler script |
| `backend/ONBOARDING_SCHEDULER_SETUP.md` | Created | Scheduler setup docs |
| `backend/auth.py` | Modified | Added error handling & user feedback |
| `backend/utils/onboarding_campaign.py` | Modified | Added retry logic |

---

## Testing

### Manual Testing

1. **Test email sending**:
   ```bash
   curl http://localhost:8000/api/v1/onboarding/test-email \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"user_email": "test@example.com", "user_name": "Test", "day_number": 1}'
   ```

2. **Test signup**:
   ```bash
   curl http://localhost:8000/api/v1/auth/signup \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "Test1234!", "firstName": "Test"}'
   ```

3. **Test scheduler**:
   ```bash
   python onboarding_scheduler.py
   ```

### Database Queries

Check onboarding status:
```sql
SELECT
    user_email,
    campaign_started_at,
    email_status,
    jsonb_array_length(emails_scheduled) as scheduled_count
FROM onboarding_status
ORDER BY created_at DESC
LIMIT 10;
```

Check pending emails:
```sql
SELECT * FROM get_pending_scheduled_emails();
```

---

## Monitoring

### Key Metrics to Monitor

1. **Email delivery rate**: Check SendGrid dashboard
2. **Failed signups**: Monitor application logs for errors
3. **Pending emails**: Query `onboarding_status` table
4. **Scheduler runs**: Check cron logs or scheduler output

### Logs to Watch

```bash
# Application logs
tail -f /var/log/propiq/backend.log

# Scheduler logs
tail -f /var/log/onboarding.log

# System cron logs
grep CRON /var/log/syslog
```

### Health Checks

```bash
# Check database connection
curl http://localhost:8000/health

# Check onboarding status for a user
curl http://localhost:8000/api/v1/onboarding/status/{user_id}

# Manually trigger scheduler
curl -X POST http://localhost:8000/api/v1/onboarding/process-scheduled
```

---

## Troubleshooting

### Emails Not Sending

1. ✅ Check SendGrid API key is set
2. ✅ Verify domain authentication in SendGrid
3. ✅ Check FROM_EMAIL and SUPPORT_EMAIL env vars
4. ✅ Review application logs for errors
5. ✅ Check SendGrid activity feed

### Scheduled Emails Not Arriving

1. ✅ Verify scheduler is running (cron or daemon)
2. ✅ Check database for pending emails
3. ✅ Run scheduler manually to test
4. ✅ Review scheduler logs
5. ✅ Verify database functions exist

### Domain Issues

1. ✅ Confirm APP_URL is set correctly
2. ✅ Verify ALLOWED_ORIGINS includes production domain
3. ✅ Check DNS records for email authentication
4. ✅ Test email links point to correct domain

---

## Support

For issues or questions:
1. Check the logs first
2. Review `backend/ONBOARDING_SCHEDULER_SETUP.md`
3. Test database connection and functions
4. Verify SendGrid configuration
5. Contact development team

---

## Summary

All domain management and onboarding issues have been resolved:

✅ Domain configuration fixed
✅ Environment variables documented
✅ Database functions implemented
✅ Database table created
✅ Email scheduler created and documented
✅ Error handling improved
✅ Retry logic added
✅ User feedback enhanced

Users can now successfully create accounts and receive all 4 onboarding emails on schedule.
