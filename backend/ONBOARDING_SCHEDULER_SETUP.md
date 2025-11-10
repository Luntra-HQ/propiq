# Onboarding Email Scheduler Setup

This guide explains how to set up the automated onboarding email scheduler to ensure users receive their welcome emails on Days 2, 3, and 4.

## Overview

The onboarding system works as follows:
- **Day 1**: Sent immediately when user signs up ✅
- **Days 2-4**: Scheduled in database and sent by background scheduler 📧

Without the scheduler, users will only receive Day 1 email.

## Quick Start (Recommended: Cron Job)

### 1. Set up a cron job to run every hour

```bash
# Edit crontab
crontab -e

# Add this line (adjust path to your backend directory)
0 * * * * cd /path/to/propiq/backend && /usr/bin/python3 onboarding_scheduler.py >> /var/log/onboarding_scheduler.log 2>&1
```

This will:
- Run every hour (at minute 0)
- Check for emails that need to be sent
- Send any pending emails
- Log output to `/var/log/onboarding_scheduler.log`

### 2. Test the scheduler manually

```bash
cd /path/to/propiq/backend
python onboarding_scheduler.py
```

You should see output like:
```
================================================================================
🕐 Onboarding Email Scheduler Started at 2025-11-10T12:00:00
================================================================================
📧 Processing 5 scheduled onboarding emails
✅ Sent Day 2 email to user abc123
✅ Sent Day 3 email to user def456
...
✅ Scheduler completed successfully
```

## Alternative: Daemon Process (APScheduler)

If you prefer a long-running background process instead of cron:

### 1. Install APScheduler

```bash
pip install apscheduler
```

### 2. Run as daemon

```bash
cd /path/to/propiq/backend
python onboarding_scheduler.py --daemon
```

### 3. Keep it running with systemd (Linux)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/propiq-onboarding.service
```

Add this content:

```ini
[Unit]
Description=PropIQ Onboarding Email Scheduler
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/propiq/backend
ExecStart=/usr/bin/python3 /path/to/propiq/backend/onboarding_scheduler.py --daemon
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable propiq-onboarding
sudo systemctl start propiq-onboarding
sudo systemctl status propiq-onboarding
```

View logs:
```bash
sudo journalctl -u propiq-onboarding -f
```

## Cloud Platform Setup

### Render.com

Add a cron job to your `render.yaml`:

```yaml
services:
  - type: cron
    name: propiq-onboarding-scheduler
    env: python
    schedule: "0 * * * *"  # Every hour
    buildCommand: "pip install -r requirements.txt"
    startCommand: "python onboarding_scheduler.py"
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: SUPABASE_URL
        fromDatabase:
          name: your-supabase-url
      - key: SUPABASE_SERVICE_KEY
        fromDatabase:
          name: your-supabase-key
      - key: SENDGRID_API_KEY
        fromDatabase:
          name: your-sendgrid-key
```

### Heroku

Add the Heroku Scheduler add-on:

```bash
heroku addons:create scheduler:standard
heroku addons:open scheduler
```

Then add a job:
- Command: `python onboarding_scheduler.py`
- Frequency: Every hour

### AWS (Lambda + EventBridge)

1. Create a Lambda function with the scheduler code
2. Set up EventBridge rule to trigger every hour
3. Ensure Lambda has access to environment variables

### Google Cloud (Cloud Scheduler + Cloud Run)

1. Deploy scheduler as a Cloud Run job
2. Create Cloud Scheduler job to trigger it hourly
3. Pass environment variables via Cloud Run config

## Monitoring

### Check scheduler logs

```bash
# If using cron
tail -f /var/log/onboarding_scheduler.log

# If using systemd
sudo journalctl -u propiq-onboarding -f
```

### Check pending emails

Use the API endpoint:

```bash
curl http://localhost:8000/api/v1/onboarding/process-scheduled \
  -X POST \
  -H "Content-Type: application/json"
```

### Check user's onboarding status

```bash
curl http://localhost:8000/api/v1/onboarding/status/{user_id}
```

## Troubleshooting

### Emails not being sent

1. **Check if scheduler is running**
   ```bash
   # For cron
   grep CRON /var/log/syslog

   # For systemd
   sudo systemctl status propiq-onboarding
   ```

2. **Check for pending emails in database**
   ```sql
   SELECT * FROM onboarding_status
   WHERE emails_scheduled @> '[{"status":"scheduled"}]'::jsonb;
   ```

3. **Check SendGrid API key**
   ```bash
   # Verify environment variable is set
   echo $SENDGRID_API_KEY
   ```

4. **Check domain verification**
   - Log in to SendGrid Dashboard
   - Go to Settings → Sender Authentication
   - Verify that `propiq.luntra.one` is authenticated

### Database connection errors

1. **Check Supabase credentials**
   ```bash
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_KEY
   ```

2. **Test database connection**
   ```bash
   python -c "from database_supabase import test_connection; print(test_connection())"
   ```

### Rate limiting

SendGrid has rate limits based on your plan. If you have many users:

- Free: 100 emails/day
- Essentials: 40,000-100,000 emails/month
- Pro: 1,500,000+ emails/month

Consider batching emails or adding delays if hitting rate limits.

## Testing

### Test with a real user

1. Sign up a test user
2. Check database for scheduled emails:
   ```sql
   SELECT user_email, emails_scheduled
   FROM onboarding_status
   WHERE user_email = 'test@example.com';
   ```

3. Run scheduler manually:
   ```bash
   python onboarding_scheduler.py
   ```

4. Verify email was sent and status updated

### Test email content

Use the test endpoint:

```bash
curl http://localhost:8000/api/v1/onboarding/test-email \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "user_name": "Test User",
    "day_number": 2
  }'
```

## Production Checklist

- [ ] Environment variables set (FROM_EMAIL, SUPPORT_EMAIL, APP_URL)
- [ ] SendGrid API key configured
- [ ] Domain `propiq.luntra.one` verified in SendGrid
- [ ] SPF and DKIM DNS records set up
- [ ] Database migration run (supabase_migration_add_onboarding.sql)
- [ ] Scheduler set up (cron or daemon)
- [ ] Scheduler tested and running
- [ ] Monitoring/logging configured
- [ ] Test signup and verify all 4 emails arrive

## Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables are set
3. Test database connection
4. Verify SendGrid domain authentication
5. Check for rate limiting

For more help, contact the development team or check the PropIQ documentation.
