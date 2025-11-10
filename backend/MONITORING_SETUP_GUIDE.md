# Monitoring Setup Guide
**Sprint 0 - Production Readiness**

This guide walks you through setting up error monitoring (Sentry) and uptime monitoring (UptimeRobot) for PropIQ.

---

## 1. Sentry Error Monitoring Setup

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up for free account (Free tier: 5,000 errors/month, 10,000 performance units/month)
3. Verify your email

### Step 2: Create PropIQ Project

1. Click "Create Project"
2. Select platform: **Python**
3. Set alert frequency: **On every new issue**
4. Project name: `propiq-backend`
5. Team: Default (or create "PropIQ Team")
6. Click "Create Project"

### Step 3: Get Your DSN

After creating the project, you'll see the setup instructions. Copy the DSN:

```
https://xxxxxxxxxxxxxxxxxxxx@o000000.ingest.sentry.io/0000000
```

### Step 4: Configure Environment Variables

Add to your `.env` file:

```bash
# Sentry Configuration
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxx@o000000.ingest.sentry.io/0000000
SENTRY_TRACES_SAMPLE_RATE=1.0  # Start with 100% sampling, reduce if needed
SENTRY_PROFILES_SAMPLE_RATE=1.0
RELEASE_VERSION=propiq@3.1.1
ENVIRONMENT=production  # or development, staging
```

### Step 5: Test Sentry

Test that errors are being captured:

```python
# In your Python REPL or create a test endpoint
import sentry_sdk
sentry_sdk.capture_message("Sentry test message from PropIQ")
```

Or trigger a test error:

```bash
curl http://localhost:8000/api/v1/test-sentry-error
```

Check your Sentry dashboard - you should see the error within 1-2 minutes.

### Step 6: Configure Alerts

1. Go to **Alerts** in Sentry dashboard
2. Create alert rule:
   - **Alert name**: "Critical Errors - PropIQ"
   - **When**: An event is seen
   - **If**: `level:error` OR `level:fatal`
   - **Then**: Send notification to Slack/Email
   - **Action interval**: 5 minutes
3. Save alert

### Step 7: Set Up Slack Integration (Optional but Recommended)

1. In Sentry: **Settings** → **Integrations**
2. Find "Slack" → Click "Add to Slack"
3. Authorize Sentry
4. Choose channel: `#propiq-alerts`
5. Configure alert routing:
   - P0 (critical) → `#propiq-alerts` (immediate)
   - P1 (high) → `#propiq-alerts` (5 min delay)
   - P2 (medium) → Daily digest

### Sentry Dashboard Overview

**Key Features to Use:**

1. **Issues** - All errors grouped by fingerprint
2. **Performance** - Slow endpoints and transactions
3. **Releases** - Track errors by version
4. **Dashboards** - Create custom dashboards:
   - Error rate over time
   - Most common errors
   - Errors by user subscription tier
   - Slowest endpoints

**Recommended Dashboards:**

```
1. Production Health
   - Error rate (last 24h)
   - P95 latency
   - Active users with errors

2. Payment Monitoring
   - Stripe webhook errors
   - Payment failures
   - Checkout abandonment

3. AI Analysis Performance
   - Azure OpenAI errors
   - Analysis latency
   - Failed analyses
```

---

## 2. UptimeRobot Uptime Monitoring Setup

### Step 1: Create UptimeRobot Account

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account (Free tier: 50 monitors, 5-minute checks)
3. Verify your email

### Step 2: Create Health Check Monitors

Create the following monitors:

#### Monitor 1: Backend API Health

```
Monitor Type: HTTP(s)
Friendly Name: PropIQ Backend API
URL: https://luntra-outreach-app.azurewebsites.net/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
Alert Contacts: [Your email]
```

#### Monitor 2: PropIQ Analysis Endpoint

```
Monitor Type: HTTP(s)
Friendly Name: PropIQ Analysis API
URL: https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
Alert Contacts: [Your email]
```

#### Monitor 3: Frontend (Netlify)

```
Monitor Type: HTTP(s)
Friendly Name: PropIQ Frontend
URL: https://propiq.luntra.one
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
Alert Contacts: [Your email]
```

#### Monitor 4: Database Health (via Backend)

```
Monitor Type: HTTP(s)
Friendly Name: PropIQ Database Health
URL: https://luntra-outreach-app.azurewebsites.net/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
Expected String: "database": "connected"  # Keyword monitoring
Alert Contacts: [Your email]
```

### Step 3: Configure Alert Contacts

1. Go to **My Settings** → **Alert Contacts**
2. Add alert contacts:
   - **Email**: Your email
   - **Slack**: Add Slack webhook (optional)
   - **SMS**: Add phone number (paid feature)

### Step 4: Set Up Slack Notifications (Optional)

1. In Slack, create incoming webhook:
   - Go to https://api.slack.com/apps
   - Create new app → "From scratch"
   - Name: "UptimeRobot Alerts"
   - Workspace: Your workspace
   - Add "Incoming Webhooks" feature
   - Create webhook for `#propiq-alerts`
   - Copy webhook URL

2. In UptimeRobot:
   - **My Settings** → **Alert Contacts**
   - Add new contact → Web-Hook
   - Paste Slack webhook URL
   - Test the integration

### Step 5: Configure Maintenance Windows

If you have planned maintenance:

1. **Account Settings** → **Maintenance Windows**
2. Create window:
   - Name: "Weekly Deployment"
   - Type: Weekly
   - Day: Sunday
   - Start: 2:00 AM
   - Duration: 1 hour
   - Paused monitors: All

### Step 6: Set Up Status Page (Optional)

Create a public status page for transparency:

1. Go to **Public Status Pages**
2. Create new status page:
   - Name: "PropIQ Status"
   - URL: `propiq-status` (will be uptimerobot.com/propiq-status)
   - Monitors to show: All production monitors
   - Custom domain: Optional (paid feature)

Example: https://stats.uptimerobot.com/propiq-status

---

## 3. Additional Monitoring Recommendations

### Log Aggregation (Optional but Recommended)

**Option 1: Azure Monitor Logs**
- Built-in for Azure Web App
- No additional cost for basic logs
- Limited search capabilities

**Option 2: Datadog Logs** ($$)
- Powerful search and filtering
- Integration with APM
- Cost: ~$15-50/month for small apps

**Option 3: ELK Stack** (Self-hosted)
- Free but requires setup
- ElasticSearch + Logstash + Kibana
- More complexity

**Recommendation for Beta:** Use Azure Monitor Logs (built-in)

### Performance Monitoring (APM)

Sentry includes basic performance monitoring. For advanced APM:

**Option 1: Sentry Performance** (Included)
- Transaction tracing
- Slow query detection
- Already configured!

**Option 2: Datadog APM** ($$)
- More detailed profiling
- Infrastructure monitoring
- Cost: ~$30-100/month

**Recommendation for Beta:** Use Sentry Performance (already set up)

---

## 4. Monitoring Checklist

Before launching paid beta, verify:

- [ ] Sentry account created and DSN configured
- [ ] Sentry receiving errors (test error sent)
- [ ] Sentry alerts configured (Slack/email)
- [ ] UptimeRobot monitors created (4 monitors)
- [ ] UptimeRobot alert contacts added
- [ ] Test downtime alert (pause monitor, verify alert)
- [ ] Status page created (optional)
- [ ] Team trained on monitoring dashboards
- [ ] Incident response process documented
- [ ] On-call rotation scheduled

---

## 5. Daily Monitoring Routine

### Morning Check (5 minutes)

1. **Sentry Dashboard**: Check for new critical errors
2. **UptimeRobot**: Verify 100% uptime overnight
3. **Azure Portal**: Check Web App health
4. **Supabase**: Check database performance

### Weekly Review (30 minutes)

1. **Error Trends**: Are errors increasing?
2. **Performance**: Any slow endpoints?
3. **Uptime**: Meet 99.9% SLA?
4. **User Impact**: Errors by subscription tier
5. **Action Items**: Create tickets for top 3 issues

---

## 6. Incident Response Process

### When Uptime Monitor Alerts (Downtime)

1. **Acknowledge** alert (respond to Slack/email)
2. **Investigate**:
   - Check Azure Web App status
   - Check Supabase status
   - Check recent deployments
   - Check Sentry for related errors
3. **Mitigate**:
   - Rollback if recent deployment
   - Restart Web App if needed
   - Scale up if resource exhaustion
4. **Communicate**:
   - Post status update to team
   - Update status page if public-facing
5. **Resolve** and document in post-mortem

### When Sentry Alerts (Errors)

1. **Triage** error severity:
   - P0 (critical): Payment failures, data loss → Fix immediately
   - P1 (high): Feature broken for all users → Fix within 24h
   - P2 (medium): Feature broken for some users → Fix within 3 days
2. **Investigate** using Sentry breadcrumbs and stack trace
3. **Fix** and deploy
4. **Verify** error resolved in Sentry
5. **Mark** as resolved in Sentry

---

## 7. Cost Breakdown

### Free Tier (Recommended for Beta)

| Service | Free Tier | Paid Upgrade |
|---------|-----------|--------------|
| Sentry | 5K errors/month, 10K perf units | $26/month (50K errors) |
| UptimeRobot | 50 monitors, 5-min checks | $7/month (1-min checks) |
| **Total** | **$0/month** | **$33/month** |

### When to Upgrade

**Sentry:**
- Upgrade when approaching 5K errors/month
- Or need >24h data retention
- Or want advanced features (CODEOWNERS integration)

**UptimeRobot:**
- Upgrade for 1-minute checks (faster detection)
- Or need SMS alerts
- Or want custom domain for status page

---

## 8. Testing Your Setup

### Test Sentry

```bash
# Send test error
curl -X POST http://localhost:8000/api/v1/test-sentry \
  -H "Content-Type: application/json" \
  -d '{"test": "error"}'

# Check Sentry dashboard - should see error within 1-2 minutes
```

### Test UptimeRobot

1. Pause one monitor
2. Wait for alert (should arrive within 5 minutes + alert delay)
3. Unpause monitor
4. Verify "up" notification received

### Test End-to-End

1. Deploy a intentional bug to staging
2. Wait for Sentry to catch it
3. Verify alert received
4. Fix and redeploy
5. Verify error rate drops

---

## 9. Useful Sentry Queries

### Find Payment Errors
```
level:error AND transaction:"/api/v1/stripe/*"
```

### Find Slow Endpoints (>3 seconds)
```
transaction.duration:>3000
```

### Errors by Subscription Tier
```
level:error AND user.subscription_tier:free
```

### Find Azure OpenAI Errors
```
level:error AND message:"*OpenAI*"
```

---

## 10. Support

**Sentry Docs:** https://docs.sentry.io/platforms/python/guides/fastapi/
**UptimeRobot Docs:** https://blog.uptimerobot.com/

**Questions?** Check the team Slack channel: #propiq-monitoring

---

**Setup Time Estimate:**
- Sentry: 15-30 minutes
- UptimeRobot: 10-15 minutes
- Testing: 15 minutes
- **Total: ~45-60 minutes**

**Good luck! 🚀**
