# Intercom Backend API Setup Guide

## Overview
The PropIQ backend integrates with Intercom's API to:
- **Track user events** server-side (property analyses, subscriptions)
- **Create/update users** in Intercom from backend
- **Receive webhooks** from Intercom (new conversations, user actions)
- **Sync user data** between PropIQ database and Intercom

**Backend integration code**: `routers/intercom.py` ✅ Already implemented

---

## What's Already Implemented

The backend already has full Intercom integration:

### API Endpoints
- `POST /intercom/webhook` - Receive webhooks from Intercom
- `POST /intercom/track-event` - Track custom user events
- `POST /intercom/identify-user` - Create or update users
- `GET /intercom/health` - Check integration status

### Helper Functions
- `notify_user_signup(user_id, email, name, subscription_tier)` - Track new signups
- `notify_property_analysis(user_id, email, address, recommendation)` - Track analyses
- `notify_subscription_change(user_id, email, old_tier, new_tier)` - Track upgrades

### Security
- Webhook signature verification (HMAC SHA-256)
- Graceful degradation when API keys not configured

---

## Required Credentials

You need two credentials from Intercom:

### 1. Access Token
**What it's for**: Making API calls to Intercom (create users, track events)

**How to get it**:
1. Go to https://app.intercom.com/a/apps/hvhctgls/settings/developers
2. Click "Developer Hub" in left sidebar
3. Click "Create new access token"
4. Name it: "PropIQ Backend API"
5. Permissions needed:
   - `Read users` ✅
   - `Write users` ✅
   - `Create events` ✅
   - `Read conversations` (optional)
6. Copy the access token (starts with `dG9r...`)

### 2. Webhook Secret
**What it's for**: Verifying webhook signatures for security

**How to get it**:
1. Go to https://app.intercom.com/a/apps/hvhctgls/settings/developers
2. Click "Webhooks" section
3. Click "Create webhook"
4. Configure webhook:
   - **Webhook URL**: `https://luntra-outreach-app.azurewebsites.net/intercom/webhook`
   - **Topics to subscribe to**:
     - `user.created` ✅
     - `user.deleted` (optional)
     - `conversation.user.created` ✅
     - `conversation.admin.replied` ✅
   - **API Version**: Latest
5. Click "Create webhook"
6. Copy the **Webhook Secret** (shown after creation)

---

## Configuration Steps

### Step 1: Add Credentials to .env

Update `/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/backend/.env`:

```bash
# ============================================================================
# INTERCOM (Customer Messaging)
# ============================================================================
INTERCOM_ACCESS_TOKEN=your_access_token_here
INTERCOM_WEBHOOK_SECRET=your_webhook_secret_here
```

**Example**:
```bash
INTERCOM_ACCESS_TOKEN=dG9rOjdiODQwMzUwX2EzOTJfNGI4N184ZjUyX2E1ZjQzZDUyYTBhYzoxOjA=
INTERCOM_WEBHOOK_SECRET=whsec_3f8d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f
```

### Step 2: Verify Integration

Test the health endpoint:

```bash
curl http://localhost:8000/intercom/health
```

Expected response (after adding credentials):
```json
{
  "status": "healthy",
  "intercom_configured": true,
  "api_base": "https://api.intercom.io"
}
```

### Step 3: Test Event Tracking

Test tracking a user event:

```bash
curl -X POST http://localhost:8000/intercom/track-event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "email": "test@example.com",
    "event_name": "property_analyzed",
    "metadata": {
      "address": "123 Main St",
      "recommendation": "buy"
    }
  }'
```

Expected response:
```json
{
  "status": "success",
  "event": "property_analyzed"
}
```

Then check in Intercom:
1. Go to https://app.intercom.com/a/inbox/
2. Search for `test@example.com`
3. Check user timeline - should see "property_analyzed" event

---

## Integration Points in PropIQ Code

### 1. After User Signup (auth.py)

```python
# In auth.py - after creating new user
from routers.intercom import notify_user_signup

# After successful signup
user = create_user(email, password, full_name)

# Notify Intercom
notify_user_signup(
    user_id=str(user["_id"]),
    email=user["email"],
    name=user.get("full_name"),
    subscription_tier=user.get("subscription_tier", "free")
)
```

### 2. After Property Analysis (propiq.py)

```python
# In routers/propiq.py - after analysis complete
from routers.intercom import notify_property_analysis

# After successful analysis
analysis_data = get_analysis_from_openai(address)

# Notify Intercom
notify_property_analysis(
    user_id=user_id,
    email=user_email,
    address=request.address,
    recommendation=analysis_data["investment"]["recommendation"]
)
```

### 3. After Subscription Change (payment.py)

```python
# In routers/payment.py - after subscription update
from routers.intercom import notify_subscription_change

# After Stripe webhook confirms subscription
user = get_user_by_id(user_id)
old_tier = user.get("subscription_tier", "free")
new_tier = "starter"  # From Stripe event

# Update database
update_user_subscription(user_id, new_tier)

# Notify Intercom
notify_subscription_change(
    user_id=user_id,
    email=user["email"],
    old_tier=old_tier,
    new_tier=new_tier
)
```

---

## Webhook Handling

When Intercom sends webhooks to your backend, `routers/intercom.py` handles them automatically.

### Supported Webhook Topics

| Topic | Trigger | Action |
|-------|---------|--------|
| `user.created` | New user in Intercom | Log event (optional: sync to database) |
| `conversation.user.created` | User starts chat | Log conversation start |
| `conversation.admin.replied` | Support replies to user | Log admin reply |

### Webhook Security

The webhook handler verifies signatures automatically:

```python
# routers/intercom.py - automatic verification
def verify_webhook_signature(request_body: bytes, signature: str) -> bool:
    expected_signature = hmac.new(
        INTERCOM_WEBHOOK_SECRET.encode('utf-8'),
        request_body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(f"sha256={expected_signature}", signature)
```

If signature verification fails, the request is rejected with HTTP 401.

---

## Testing Webhooks Locally

### Option 1: ngrok Tunnel (Recommended for Local Testing)

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/download

# Start your backend
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend
source venv/bin/activate
python -m uvicorn api:app --reload --port 8000

# In another terminal, create tunnel
ngrok http 8000

# You'll get a URL like: https://abc123.ngrok.io
# Update Intercom webhook URL to: https://abc123.ngrok.io/intercom/webhook
```

### Option 2: Production Testing

Once deployed to Azure:
- Webhook URL: `https://luntra-outreach-app.azurewebsites.net/intercom/webhook`
- Webhooks will be sent automatically by Intercom
- Check logs: `az webapp log tail --resource-group luntra-outreach-rg --name luntra-outreach-app`

---

## Monitoring and Debugging

### Check Intercom Logs

View webhook delivery logs in Intercom:
1. Go to https://app.intercom.com/a/apps/hvhctgls/settings/developers
2. Click "Webhooks"
3. Click on your webhook
4. View delivery history:
   - ✅ Success (HTTP 200)
   - ❌ Failed (HTTP 4xx/5xx)
   - 🔄 Retries

### Backend Logs

Check backend logs for Intercom events:

```bash
# Local development
# Look for log lines like:
✅ Intercom event tracked: property_analyzed for user abc123
⚠️  Intercom not configured. Event not tracked: property_analyzed
📨 Intercom webhook received: user.created
```

### Health Check

Monitor integration status:

```bash
# Check if Intercom is configured
curl https://luntra-outreach-app.azurewebsites.net/intercom/health

# Expected when configured:
{
  "status": "healthy",
  "intercom_configured": true,
  "api_base": "https://api.intercom.io"
}

# Expected when NOT configured:
{
  "status": "degraded",
  "intercom_configured": false,
  "api_base": "https://api.intercom.io"
}
```

---

## Deployment

### Step 1: Add Environment Variables to Azure

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend

# Update deploy-azure.sh with Intercom credentials
az webapp config appsettings set \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  --settings \
    INTERCOM_ACCESS_TOKEN="your_access_token" \
    INTERCOM_WEBHOOK_SECRET="your_webhook_secret"
```

### Step 2: Deploy Backend

```bash
./deploy-azure.sh
```

### Step 3: Configure Intercom Webhook

1. Go to https://app.intercom.com/a/apps/hvhctgls/settings/developers
2. Create/update webhook:
   - URL: `https://luntra-outreach-app.azurewebsites.net/intercom/webhook`
   - Topics: `user.created`, `conversation.user.created`, `conversation.admin.replied`
3. Save webhook

### Step 4: Test Production Integration

```bash
# Test health endpoint
curl https://luntra-outreach-app.azurewebsites.net/intercom/health

# Should return:
{
  "status": "healthy",
  "intercom_configured": true,
  "api_base": "https://api.intercom.io"
}
```

---

## API Rate Limits

Intercom API has rate limits:
- **Standard plan**: 83 requests per 10 seconds (500/minute)
- **Exceeded limit**: HTTP 429 Too Many Requests

The backend handles rate limits gracefully:
```python
# routers/intercom.py - graceful error handling
try:
    response = requests.post(...)
    if response.status_code == 429:
        print("⚠️  Intercom API rate limit exceeded. Event will not be tracked.")
except Exception as e:
    print(f"⚠️  Failed to track Intercom event: {e}")
```

---

## Privacy & Compliance

### Data Stored in Intercom
- User ID (PropIQ user._id)
- Email address
- Full name
- Subscription tier
- Trial analyses remaining
- Event history (signups, analyses, upgrades)

### GDPR Data Deletion

To delete user data from Intercom when user deletes account:

```python
# Add to auth.py or user deletion endpoint
import requests

def delete_user_from_intercom(user_id: str):
    """Delete user from Intercom when account is deleted"""
    if not INTERCOM_ACCESS_TOKEN:
        return

    try:
        headers = {
            "Authorization": f"Bearer {INTERCOM_ACCESS_TOKEN}",
            "Accept": "application/json"
        }

        response = requests.delete(
            f"{INTERCOM_API_BASE}/contacts/{user_id}",
            headers=headers,
            timeout=5
        )

        if response.status_code in [200, 204]:
            print(f"✅ Deleted user from Intercom: {user_id}")
        else:
            print(f"⚠️  Failed to delete from Intercom: {response.text}")

    except Exception as e:
        print(f"⚠️  Error deleting from Intercom: {e}")
```

---

## Troubleshooting

### "Intercom not configured" in Logs

**Cause**: Missing `INTERCOM_ACCESS_TOKEN` in environment

**Fix**:
1. Add token to `.env` file
2. Restart backend: `uvicorn api:app --reload`

### Events Not Appearing in Intercom

**Check**:
1. Access token has correct permissions (`Write users`, `Create events`)
2. User email exists in Intercom (check dashboard)
3. No errors in backend logs
4. API rate limits not exceeded

**Debug**:
```python
# Add debug logging to routers/intercom.py
print(f"Tracking event: {event_name} for {email}")
print(f"Response: {response.status_code} - {response.text}")
```

### Webhook Signature Verification Failing

**Cause**: Incorrect `INTERCOM_WEBHOOK_SECRET`

**Fix**:
1. Go to Intercom webhook settings
2. Copy exact secret (including any special characters)
3. Update `.env` file
4. Restart backend

**Debug**:
```bash
# Check webhook deliveries in Intercom dashboard
# Failed webhooks will show error details
```

### "User not found" Errors

**Cause**: Trying to track events for users not yet in Intercom

**Fix**:
Call `notify_user_signup()` first to create user in Intercom before tracking events.

---

## Cost

Intercom API is included in your Intercom subscription:
- **Free trial**: 14 days
- **Paid plans**: Start at $74/month (includes API access)

**API calls are free** - no additional cost for backend integration.

---

## Next Steps

1. Get Access Token from: https://app.intercom.com/a/apps/hvhctgls/settings/developers
2. Create webhook and get Webhook Secret
3. Add both to `.env` file:
   ```bash
   INTERCOM_ACCESS_TOKEN=your_token_here
   INTERCOM_WEBHOOK_SECRET=your_secret_here
   ```
4. Test locally:
   ```bash
   curl http://localhost:8000/intercom/health
   ```
5. Deploy to Azure:
   ```bash
   ./deploy-azure.sh
   ```
6. Configure webhook URL in Intercom:
   `https://luntra-outreach-app.azurewebsites.net/intercom/webhook`
7. Test by creating a test user and analyzing a property

---

## Resources

- Intercom Developer Hub: https://app.intercom.com/a/apps/hvhctgls/settings/developers
- Intercom API Documentation: https://developers.intercom.com/
- Webhook Topics: https://developers.intercom.com/intercom-api-reference/reference/webhook-topics
- PropIQ Backend Code: `routers/intercom.py`

---

## Summary

**What's done**:
✅ Backend integration code (`routers/intercom.py`)
✅ Webhook handler with signature verification
✅ Helper functions for signup/analysis/subscription tracking
✅ Health endpoint for monitoring

**What you need to do**:
1. Get Access Token and Webhook Secret from Intercom
2. Add to `.env` file
3. Test locally
4. Deploy to Azure
5. Configure webhook in Intercom dashboard

**Integration is production-ready** - just add your credentials!
