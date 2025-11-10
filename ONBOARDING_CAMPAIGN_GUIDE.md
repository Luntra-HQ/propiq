# PropIQ Onboarding Email Campaign

**Complete 4-Day Email Onboarding Sequence for New Users**

---

## Overview

PropIQ's onboarding campaign is a 4-day email sequence designed to educate new users about the platform's features and drive engagement. Inspired by Perplexity's Comet onboarding, the campaign progressively introduces PropIQ's capabilities.

**Key Features:**
- ✅ SendGrid integration for reliable delivery
- ✅ MongoDB tracking of campaign status
- ✅ Beautiful HTML email templates
- ✅ Automated scheduling (Day 1, Day 2, Day 3, Day 4)
- ✅ Graceful error handling (signup never fails due to email issues)
- ✅ Test endpoints for development

---

## Email Sequence

### **Day 1: Welcome to PropIQ**
**Sent:** Immediately on signup
**Subject:** "Day 1 of 4: Welcome to PropIQ"

**Content:**
- Platform introduction and value proposition
- Key features overview (AI analysis, calculator, deal scoring, support chat)
- Quick-start checklist
- Privacy and feedback information

**Goals:**
- Welcome the user warmly
- Set expectations for the sequence
- Encourage first action (run an analysis)

---

### **Day 2: Master Property Analysis**
**Sent:** 24 hours after signup
**Subject:** "Day 2 of 4: Master Property Analysis Like a Pro"

**Content:**
- Deep dive into AI-powered property analysis
- How to interpret deal scores (0-100 rating system)
- Market insights and investment recommendations
- Pro tips for calibrating analysis

**Goals:**
- Educate on core analysis features
- Build confidence in using the platform
- Drive analysis usage

---

### **Day 3: Advanced Deal Calculator**
**Sent:** 48 hours after signup
**Subject:** "Day 3 of 4: Run the Numbers with Our Deal Calculator"

**Content:**
- Introduction to 3-tab calculator (Basic, Advanced, Scenarios)
- Key metrics explained (cash flow, cap rate, 1% rule, DSCR)
- 5-year projection features
- Pro tips for deal analysis

**Goals:**
- Introduce financial modeling tools
- Demonstrate platform depth
- Encourage calculator usage

---

### **Day 4: Join 1,000+ Investors**
**Sent:** 72 hours after signup
**Subject:** "Day 4 of 4: Join 1,000+ Investors Using PropIQ"

**Content:**
- Social proof and success stories
- Platform statistics (25K+ analyses, $2.1B deals evaluated)
- Pricing plans and upgrade paths
- Special launch offer (20% off annual plans)
- Next steps and support information

**Goals:**
- Build trust through social proof
- Drive upgrades to paid plans
- Provide clear next steps

---

## Technical Architecture

### **File Structure**

```
propiq/backend/
├── utils/
│   ├── __init__.py                    # Package exports
│   ├── onboarding_emails.py           # Email templates
│   └── onboarding_campaign.py         # Campaign logic
├── routers/
│   └── onboarding.py                  # API endpoints
├── database_mongodb.py                # Database functions
└── auth.py                            # Signup integration
```

### **Database Schema**

**Collection:** `onboarding_campaigns`

```javascript
{
  _id: ObjectId("..."),
  user_id: ObjectId("..."),
  campaign_started_at: ISODate("2025-01-15T10:00:00Z"),
  status: "active",  // "active", "completed", "paused"
  emails_sent: [
    {
      day: 1,
      subject: "Day 1 of 4: Welcome to PropIQ",
      sent_at: "2025-01-15T10:00:05Z",
      status: "sent"
    }
  ],
  scheduled_emails: [
    {
      day: 2,
      subject: "Day 2 of 4: Master Property Analysis Like a Pro",
      scheduled_for: "2025-01-16T10:00:00Z",
      delay_hours: 24,
      status: "scheduled"  // "scheduled", "sent", "failed"
    },
    // ... days 3 and 4
  ],
  errors: [],
  created_at: ISODate("2025-01-15T10:00:00Z"),
  updated_at: ISODate("2025-01-15T10:00:05Z")
}
```

**Indexes:**
- `user_id` (unique)
- `user_id + scheduled_emails.scheduled_for` (for efficient scheduled email queries)

---

## API Endpoints

### **1. Test Email (Development)**

```bash
POST /onboarding/test-email
```

**Body:**
```json
{
  "email": "test@example.com",
  "day": 1
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Test email (Day 1) sent successfully",
  "email": "test@example.com",
  "subject": "Day 1 of 4: Welcome to PropIQ",
  "day": 1
}
```

**Use Case:** Test email templates during development

---

### **2. Get Onboarding Status**

```bash
GET /onboarding/status/{user_id}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": "507f1f77bcf86cd799439011",
    "campaign_started_at": "2025-01-15T10:00:00Z",
    "status": "active",
    "emails_sent": [...],
    "scheduled_emails": [...]
  }
}
```

**Use Case:** Check campaign progress for a user

---

### **3. Start Campaign (Manual)**

```bash
POST /onboarding/start-campaign
```

**Body:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "user_email": "user@example.com",
  "user_name": "John"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Onboarding campaign started successfully",
  "data": {
    "user_id": "507f1f77bcf86cd799439011",
    "emails_sent": [{ "day": 1, "status": "sent" }],
    "emails_scheduled": [
      { "day": 2, "scheduled_for": "..." },
      { "day": 3, "scheduled_for": "..." },
      { "day": 4, "scheduled_for": "..." }
    ]
  }
}
```

**Use Case:** Manually trigger campaign or re-start for testing

---

### **4. Process Scheduled Emails**

```bash
POST /onboarding/process-scheduled
```

**Response:**
```json
{
  "status": "success",
  "message": "Scheduled emails processed successfully"
}
```

**Use Case:** Called by cron job to send scheduled emails

---

### **5. Health Check**

```bash
GET /onboarding/health
```

**Response:**
```json
{
  "status": "healthy",
  "sendgrid_configured": true,
  "features": {
    "test_emails": true,
    "campaign_start": true,
    "scheduled_processing": true
  }
}
```

**Use Case:** Verify SendGrid configuration

---

## Email Scheduling

### **Current Implementation**

Currently, emails are **scheduled in the database** but **not automatically sent**. The system records when each email should be sent, but requires manual triggering.

**Day 1:** Sent immediately on signup ✅
**Day 2-4:** Scheduled but require manual processing ⚠️

### **Production Deployment Options**

To fully automate the email sequence, implement one of these schedulers:

#### **Option 1: Cron Job (Simplest)**

Create a cron job that calls the process endpoint every hour:

```bash
# In crontab
0 * * * * curl -X POST https://luntra-outreach-app.azurewebsites.net/onboarding/process-scheduled
```

#### **Option 2: Azure Functions (Recommended for Azure)**

```python
# Azure Function with timer trigger (hourly)
import azure.functions as func
import requests

def main(mytimer: func.TimerRequest) -> None:
    response = requests.post(
        "https://luntra-outreach-app.azurewebsites.net/onboarding/process-scheduled"
    )
    print(f"Processed scheduled emails: {response.status_code}")
```

**Schedule:** `0 0 * * * *` (every hour)

#### **Option 3: Celery Beat (Python Task Queue)**

```python
# celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('propiq')

@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Run every hour
    sender.add_periodic_task(
        crontab(minute=0),
        process_scheduled_emails.s(),
    )

@app.task
def process_scheduled_emails():
    from utils.onboarding_campaign import process_scheduled_onboarding_emails
    process_scheduled_onboarding_emails()
```

#### **Option 4: APScheduler (Lightweight)**

```python
# scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from utils.onboarding_campaign import process_scheduled_onboarding_emails

scheduler = BackgroundScheduler()
scheduler.add_job(
    process_scheduled_onboarding_emails,
    'interval',
    hours=1
)
scheduler.start()
```

---

## Environment Variables

**Required:**

```bash
# SendGrid API Key (required for sending emails)
SENDGRID_API_KEY=SG.xxx...

# Email addresses
FROM_EMAIL=team@propiq.ai
SUPPORT_EMAIL=support@propiq.ai

# Application URL (for links in emails)
APP_URL=https://propiq.luntra.one

# MongoDB (for tracking)
MONGODB_URI=mongodb+srv://...
```

---

## Testing

### **Local Testing**

1. **Set up environment:**

```bash
cd propiq/backend
source venv/bin/activate
export SENDGRID_API_KEY=SG.xxx...
export FROM_EMAIL=team@propiq.ai
export APP_URL=http://localhost:5173
```

2. **Start the API:**

```bash
uvicorn api:app --reload --port 8000
```

3. **Send test email:**

```bash
curl -X POST http://localhost:8000/onboarding/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "day": 1}'
```

4. **Check your inbox** for the Day 1 welcome email

5. **Test all 4 emails:**

```bash
# Day 1
curl -X POST http://localhost:8000/onboarding/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "day": 1}'

# Day 2
curl -X POST http://localhost:8000/onboarding/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "day": 2}'

# Day 3
curl -X POST http://localhost:8000/onboarding/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "day": 3}'

# Day 4
curl -X POST http://localhost:8000/onboarding/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "day": 4}'
```

### **Production Testing**

```bash
# Test email (Azure deployment)
curl -X POST https://luntra-outreach-app.azurewebsites.net/onboarding/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "day": 1}'

# Check health
curl https://luntra-outreach-app.azurewebsites.net/onboarding/health

# Get status
curl https://luntra-outreach-app.azurewebsites.net/onboarding/status/{user_id}
```

---

## Integration with Signup Flow

The onboarding campaign is **automatically triggered** when a user signs up:

**File:** `backend/auth.py`

```python
@router.post("/signup", response_model=UserResponse)
async def signup(request: SignupRequest):
    # ... create user ...

    # Start onboarding email campaign
    try:
        from utils.onboarding_campaign import start_onboarding_campaign
        onboarding_result = await start_onboarding_campaign(
            user_email=request.email.lower(),
            user_id=user_id,
            user_name=request.firstName
        )
        print(f"✅ Onboarding campaign started")
    except Exception as e:
        # Don't fail signup if onboarding campaign fails
        print(f"⚠️  Onboarding campaign failed: {e}")

    return UserResponse(success=True, ...)
```

**Important:** Signup never fails due to email issues - errors are caught and logged.

---

## Monitoring & Analytics

### **SendGrid Dashboard**

Monitor email performance in SendGrid:
- **Deliverability:** Track bounces, spam reports
- **Engagement:** Open rates, click rates
- **Errors:** Failed sends, blocked emails

### **Database Queries**

```javascript
// Count active campaigns
db.onboarding_campaigns.countDocuments({ status: "active" })

// Find users who haven't received Day 2 yet
db.onboarding_campaigns.find({
  "scheduled_emails.day": 2,
  "scheduled_emails.status": "scheduled"
})

// Get campaigns with errors
db.onboarding_campaigns.find({
  "errors.0": { $exists: true }
})

// Average emails sent per campaign
db.onboarding_campaigns.aggregate([
  {
    $project: {
      emailsSentCount: { $size: "$emails_sent" }
    }
  },
  {
    $group: {
      _id: null,
      avgEmailsSent: { $avg: "$emailsSentCount" }
    }
  }
])
```

### **Key Metrics to Track**

- **Campaign Start Rate:** % of signups that trigger campaign
- **Day 1 Delivery Rate:** % of Day 1 emails successfully sent
- **Day 2-4 Completion Rate:** % of campaigns that complete full sequence
- **Open Rates:** By email day (SendGrid)
- **Click-Through Rates:** By email day (SendGrid)
- **Conversion Rate:** % of campaign recipients who upgrade

---

## Customization

### **Modify Email Content**

Edit email templates in `backend/utils/onboarding_emails.py`:

```python
def get_email_day_1(user_name: str = "there", user_email: str = "") -> Dict[str, Any]:
    return {
        "subject": "Your custom subject",
        "html_content": """
        <!-- Your custom HTML -->
        """,
        "delay_hours": 0
    }
```

### **Change Email Schedule**

Adjust `delay_hours` in each email function:

```python
# Current schedule:
Day 1: delay_hours = 0   # Immediate
Day 2: delay_hours = 24  # 24 hours
Day 3: delay_hours = 48  # 48 hours
Day 4: delay_hours = 72  # 72 hours

# Example: Compress to 2-day sequence
Day 1: delay_hours = 0
Day 2: delay_hours = 12
Day 3: delay_hours = 24
Day 4: delay_hours = 36
```

### **Add More Emails**

1. Create `get_email_day_5()` in `onboarding_emails.py`
2. Add to sequence in `get_onboarding_sequence()`
3. Update documentation

---

## Troubleshooting

### **Email Not Sending**

**Check:**
1. `SENDGRID_API_KEY` is set in environment variables
2. SendGrid API key is valid and active
3. `FROM_EMAIL` is verified in SendGrid
4. Check logs for errors:
   ```bash
   az webapp log tail --resource-group luntra-outreach-rg --name luntra-outreach-app
   ```

### **Wrong Email Content**

**Fix:**
1. Edit templates in `backend/utils/onboarding_emails.py`
2. Test locally first
3. Deploy to Azure
4. Send test email to verify changes

### **Scheduled Emails Not Sending**

**Cause:** No scheduler configured yet

**Solution:** Set up one of the scheduling options (cron, Azure Functions, Celery)

### **Database Errors**

**Check:**
1. `MONGODB_URI` is set correctly
2. MongoDB Atlas network access allows your IP
3. Database user has read/write permissions
4. Check MongoDB logs in Atlas

---

## Best Practices

### **Email Deliverability**

1. **Warm up your domain:** Start with low volume, gradually increase
2. **Monitor bounce rates:** Keep below 5%
3. **Provide unsubscribe link:** Required by law, included in templates
4. **Authenticate your domain:** Set up SPF, DKIM, DMARC in SendGrid
5. **Avoid spam triggers:** Don't use ALL CAPS, excessive punctuation

### **Content**

1. **Personalize:** Use user's first name when available
2. **Mobile-friendly:** All templates are responsive
3. **Clear CTAs:** Each email has 2-3 clear action buttons
4. **Test across clients:** Gmail, Outlook, Apple Mail, etc.

### **Testing**

1. **Test all 4 emails** before deploying
2. **Check links** work correctly
3. **Verify images** load (if you add any)
4. **Test on mobile devices**
5. **Use test mode** in SendGrid for development

---

## Next Steps

### **Immediate (Required for Full Automation)**

1. ✅ Set up scheduler (cron, Azure Functions, or Celery)
2. ✅ Configure SendGrid domain authentication
3. ✅ Test complete 4-day sequence
4. ✅ Monitor first 10 campaigns closely

### **Short-term Enhancements**

1. Add unsubscribe functionality
2. Track email opens/clicks in database
3. A/B test subject lines
4. Add user behavior triggers (e.g., if user analyzes property, skip Day 2)

### **Long-term**

1. Implement dynamic content based on user activity
2. Add branching logic (different paths for different user types)
3. Create onboarding sequence for paid users
4. Integrate with customer success platform (Intercom, Zendesk)

---

## Support

**Questions?** Contact the development team or check:
- SendGrid documentation: https://docs.sendgrid.com/
- PropIQ backend docs: `backend/README.md`
- Claude Code memory: `propiq/CLAUDE.md`

---

**Last Updated:** 2025-10-22
**Version:** 1.0.0
**Author:** Claude Code (Anthropic)
