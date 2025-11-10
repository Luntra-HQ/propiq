# Error Monitoring & Alerting Guide

**Sprint 12 - Task 3: Error Monitoring**
**Created:** 2025-11-07

---

## Overview

PropIQ uses **Sentry** for comprehensive error tracking, performance monitoring, and user feedback across both backend (FastAPI) and frontend (React).

**Key Benefits:**
- Real-time error tracking
- Performance monitoring (traces & profiling)
- User context (who experienced errors)
- Session replay for debugging
- Alerting via Slack, email, PagerDuty

---

## Setup Instructions

### 1. Create Sentry Account

1. Go to https://sentry.io
2. Sign up for free account (up to 5,000 events/month free)
3. Create new project:
   - **Backend Project:** PropIQ Backend (Python - FastAPI)
   - **Frontend Project:** PropIQ Frontend (React)

### 2. Get DSN Keys

After creating projects, get your DSN (Data Source Name) keys:

**Backend DSN:**
```
https://xxxxx@sentry.io/yyyyy
```

**Frontend DSN:**
```
https://aaaaa@sentry.io/bbbbb
```

### 3. Configure Environment Variables

**Backend (`.env` or Azure App Settings):**
```bash
SENTRY_DSN=https://xxxxx@sentry.io/yyyyy
ENVIRONMENT=production  # or development, staging
RELEASE_VERSION=propiq-backend@3.12.0
SENTRY_TRACES_SAMPLE_RATE=1.0  # 100% in production, adjust if needed
SENTRY_PROFILES_SAMPLE_RATE=1.0
```

**Frontend (`netlify.toml` or build environment):**
```toml
[build.environment]
  VITE_SENTRY_DSN = "https://aaaaa@sentry.io/bbbbb"
  VITE_RELEASE_VERSION = "propiq-frontend@1.0.0"
  VITE_SENTRY_TRACES_SAMPLE_RATE = "1.0"
```

---

## Backend Integration ✅

**Files created:**
- `backend/config/sentry_config.py` - Sentry configuration
- `backend/api.py` - Initialized in startup

**Features:**
- FastAPI integration (automatic endpoint tracking)
- Error filtering (404s, health checks)
- User context tracking
- Performance traces
- Profiling

**Usage in code:**
```python
from config.sentry_config import (
    capture_exception,
    set_user_context,
    set_tag,
    add_breadcrumb
)

# Track user
set_user_context(
    user_id="user_123",
    email="user@example.com",
    subscription_tier="pro"
)

# Add debugging breadcrumb
add_breadcrumb(
    message="Analyzing property",
    category="propiq",
    data={"address": "123 Main St"}
)

# Capture exception with context
try:
    result = analyze_property(address)
except Exception as e:
    capture_exception(e, address=address, user_id=user_id)
    raise
```

---

## Frontend Integration ✅

**Files created:**
- `frontend/src/config/sentry.ts` - Sentry configuration
- `frontend/src/main.tsx` - Initialized at startup

**Features:**
- Browser tracing (page loads, API calls)
- Session replay (on errors)
- React error boundaries
- User feedback dialog
- Performance monitoring

**Usage in code:**
```typescript
import {
  setUserContext,
  captureException,
  addBreadcrumb,
  showFeedbackDialog
} from './config/sentry';

// Track user (after login)
setUserContext(
  userId,
  email,
  subscriptionTier
);

// Add breadcrumb
addBreadcrumb(
  'Property analysis started',
  'user-action',
  'info',
  { address: '123 Main St' }
);

// Capture error
try {
  await analyzeProperty(address);
} catch (error) {
  captureException(error as Error, { address });
  throw error;
}

// Show user feedback after error
showFeedbackDialog();
```

---

## Monitoring Dashboard

### Sentry Dashboard Sections

1. **Issues** - All errors grouped by type
2. **Performance** - Transaction traces and slow endpoints
3. **Releases** - Track errors by deployment version
4. **Alerts** - Configure notifications
5. **Discover** - Query events with SQL-like syntax

### Key Metrics to Track

**Backend:**
- Error rate: < 0.1%
- API response time (p95): < 500ms
- Database query time (p95): < 100ms
- Most common errors

**Frontend:**
- Error rate: < 0.5%
- Page load time (p95): < 3s
- First paint: < 1.5s
- User-reported issues

---

## Alerting Configuration

### 1. Slack Integration

1. Go to Sentry Settings > Integrations
2. Install Slack app
3. Configure channel: `#propiq-alerts`
4. Set alert rules:
   - New issue created
   - Issue frequency > 10/hour
   - Error rate > 1%
   - Performance degradation

### 2. Email Alerts

1. Go to Sentry Settings > Alerts
2. Create alert rule:
   - Name: "Production Errors"
   - Conditions: Environment = production, Error count > 5 in 1 hour
   - Actions: Email to team

### 3. PagerDuty (Optional)

For on-call rotation:
1. Integrate PagerDuty
2. Create escalation policy
3. Route critical alerts to PagerDuty

---

## Alert Rules

### Critical Alerts (Immediate)

**Rule:** High error rate
- **Condition:** Error rate > 1% for 5 minutes
- **Action:** Slack + PagerDuty
- **Response:** Investigate immediately

**Rule:** Database connection failure
- **Condition:** Error contains "Supabase connection failed"
- **Action:** Slack + PagerDuty
- **Response:** Check database status

**Rule:** Payment processing failure
- **Condition:** Error in Stripe integration
- **Action:** Slack + Email
- **Response:** Check Stripe dashboard

### Warning Alerts (Review within 1 hour)

**Rule:** Slow API responses
- **Condition:** p95 response time > 1s for 10 minutes
- **Action:** Slack
- **Response:** Check performance dashboard

**Rule:** New error type
- **Condition:** New issue created in production
- **Action:** Slack
- **Response:** Triage and assign

### Info Alerts (Review daily)

**Rule:** Usage spike
- **Condition:** Request rate > 2x normal
- **Action:** Slack (info channel)
- **Response:** Monitor capacity

---

## Error Triage Process

### 1. Classify Error

**Severity levels:**
- **Critical:** Service down, payment failures
- **High:** Feature broken for all users
- **Medium:** Feature broken for some users
- **Low:** Minor UI glitch
- **Info:** Expected errors (404s, validation)

### 2. Prioritize

**Priority matrix:**
- Critical + High: Fix within 1 hour
- Critical + Medium: Fix within 4 hours
- High + High: Fix within 1 day
- Medium + Medium: Fix within 1 week
- Low: Backlog

### 3. Assign & Track

1. Create GitHub issue from Sentry
2. Assign to developer
3. Link to Sentry issue
4. Mark as resolved when deployed

---

## Performance Monitoring

### Backend Traces

**Key transactions to monitor:**
- `POST /api/v1/propiq/analyze` - Property analysis
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/propiq/analyses` - Analysis history
- `POST /api/v1/support/chat` - Support chat

**Alerts:**
- p95 > 500ms: Performance degradation
- p50 > 200ms: General slowness

### Frontend Traces

**Key transactions to monitor:**
- Page load (homepage, dashboard)
- Analysis flow (input → results)
- Payment checkout
- Support chat interaction

**Alerts:**
- First paint > 2s: Slow initial load
- Time to interactive > 4s: Poor UX

---

## Session Replay

**Configuration:**
- **Sample rate:** 10% of all sessions
- **Error sample rate:** 100% of sessions with errors
- **Privacy:** All text masked, all media blocked

**Usage:**
1. Go to Sentry issue
2. Click "Replays" tab
3. Watch user session leading up to error
4. Identify UX issues or reproduction steps

---

## Best Practices

### Do's ✅

- **Set user context** on login
- **Clear user context** on logout
- **Add breadcrumbs** for debugging flow
- **Tag errors** by feature/endpoint
- **Release tracking** (tag errors by version)
- **Triage daily** (don't let issues pile up)

### Don'ts ❌

- **Don't log sensitive data** (passwords, tokens, PII)
- **Don't ignore warnings** (they become errors)
- **Don't over-alert** (causes alert fatigue)
- **Don't track expected errors** (404s, validation)
- **Don't skip filtering** (browser extensions, network errors)

---

## Common Errors & Solutions

### 1. "Supabase connection failed"

**Cause:** Database unreachable or credentials invalid
**Solution:** Check Supabase dashboard, verify connection string
**Prevention:** Connection pooling, retry logic

### 2. "Azure OpenAI rate limit exceeded"

**Cause:** Too many AI requests
**Solution:** Implement caching, increase quota
**Prevention:** Rate limiting per user

### 3. "Stripe webhook signature verification failed"

**Cause:** Invalid webhook secret
**Solution:** Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard
**Prevention:** Rotate secrets carefully

### 4. "JWT token expired"

**Cause:** User session expired
**Solution:** Redirect to login, refresh token
**Prevention:** Longer token expiry or refresh token flow

---

## Testing Sentry Integration

### Backend Test

```bash
# Trigger test error
curl -X POST https://luntra-outreach-app.azurewebsites.net/api/v1/test-error \
  -H "Content-Type: application/json"

# Check Sentry dashboard for new issue
```

### Frontend Test

```typescript
// In browser console
throw new Error("Test Sentry error");

// Or click a "Test Error" button
button.addEventListener('click', () => {
  throw new Error("Button click test error");
});
```

### Verify

1. Check Sentry dashboard (should see new issues within 30s)
2. Verify user context attached
3. Verify breadcrumbs captured
4. Verify alert sent (if configured)

---

## Cost Optimization

### Free Tier Limits

- **Events:** 5,000/month
- **Replays:** 500/month
- **Performance:** 10,000 transactions/month

### Optimization Strategies

1. **Sample rates:**
   - Development: 10% traces, 0% replays
   - Staging: 50% traces, 10% replays
   - Production: 100% traces, 10% replays

2. **Filter noise:**
   - Ignore 404s, health checks
   - Filter browser extension errors
   - Filter known network errors

3. **Monitor usage:**
   - Check Sentry Stats page
   - Set up quota alerts
   - Upgrade if needed ($26/month for 50k events)

---

## Sentry CLI

**Install:**
```bash
npm install -g @sentry/cli
```

**Create release:**
```bash
export SENTRY_AUTH_TOKEN=your_token
sentry-cli releases new propiq-frontend@1.0.0
sentry-cli releases files propiq-frontend@1.0.0 upload-sourcemaps ./dist
sentry-cli releases finalize propiq-frontend@1.0.0
```

**Set commits:**
```bash
sentry-cli releases set-commits propiq-frontend@1.0.0 --auto
```

---

## Troubleshooting

### "Sentry not sending events"

1. Check DSN is correct
2. Check network (firewall blocking sentry.io?)
3. Check sample rates (set to 1.0 for testing)
4. Check beforeSend filter (not returning null?)

### "Too many events"

1. Check for infinite error loops
2. Increase filtering
3. Lower sample rates
4. Contact Sentry support for quota increase

### "Can't see user context"

1. Verify `send_default_pii=False` (backend)
2. Verify `setUserContext()` called after login
3. Check Sentry user privacy settings

---

## Next Steps

1. ✅ Backend integration complete
2. ✅ Frontend integration complete
3. [ ] Create Sentry account
4. [ ] Configure DSN keys
5. [ ] Set up Slack alerts
6. [ ] Test error tracking
7. [ ] Monitor for 1 week
8. [ ] Tune alert thresholds

---

**Status:** Sentry integration complete, ready for production
**Last Updated:** 2025-11-07
**Sprint:** 12 - Production Readiness
