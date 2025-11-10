# Intercom Webhook Setup - Step by Step Guide

## Overview
This guide walks you through setting up Intercom webhooks for PropIQ to receive real-time notifications about user events.

**Credentials Configured**: ✅
- Access Token: `dG9rOmNkNDI4ZmQ3XzRhZjdfNDgyYV9iNTMwX2RhODU1ZmQyODNhNjoxOjA=`
- API Key: `c290ac56-e42b-46e3-8371-c39b166b55c0`

---

## Webhook URL

### For Production (Azure)
```
https://luntra-outreach-app.azurewebsites.net/intercom/webhook
```

### For Custom Domain (if configured)
```
https://propiq.luntra.one/intercom/webhook
```

**Important**: Use the FULL URL including `https://` and the `/intercom/webhook` path!

---

## Step-by-Step Webhook Setup

### Step 1: Go to Intercom Developer Hub

1. Visit: https://app.intercom.com/a/apps/hvhctgls/settings/developers
2. Click on **"Developer Hub"** in the left sidebar
3. Look for the **"Webhooks"** section

### Step 2: Create New Webhook Subscription

1. Click **"New webhook"** or **"Create webhook subscription"**
2. You'll see a form to configure your webhook

### Step 3: Configure Webhook Settings

Fill in the form with these exact values:

**Webhook URL**:
```
https://luntra-outreach-app.azurewebsites.net/intercom/webhook
```

**Important Notes**:
- ✅ DO include `https://`
- ✅ DO include the full path `/intercom/webhook`
- ❌ DON'T use just `propiq.luntra.one` (missing https:// and path)
- ❌ DON'T use just the domain without the webhook path

### Step 4: Select Webhook Topics

Select the following topics to subscribe to:

✅ **User Events**:
- `user.created` - When a new user signs up

✅ **Conversation Events**:
- `conversation.user.created` - When a user starts a new conversation
- `conversation.admin.replied` - When support team replies to a user

**Optional Topics** (can add later):
- `user.deleted` - When a user is deleted
- `user.unsubscribed` - When a user unsubscribes
- `conversation.user.replied` - When user replies to a conversation
- `conversation.admin.closed` - When admin closes a conversation

### Step 5: Set Webhook Version

- **API Version**: Select the **latest version** available (usually auto-selected)

### Step 6: Save and Get Webhook Secret

1. Click **"Create webhook"** or **"Save"**
2. After creating, you'll see a **Webhook Secret** (also called "Signing Secret")
3. **IMPORTANT**: Copy this secret immediately - it's shown only once!

Example of what you'll see:
```
Webhook Secret: whsec_abc123def456ghi789jkl012mno345pqr678stu
```

### Step 7: Add Webhook Secret to Backend

1. Open `/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/backend/.env`
2. Update this line:
   ```bash
   # INTERCOM_WEBHOOK_SECRET will be generated when you create the webhook
   ```

   To:
   ```bash
   INTERCOM_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
   ```

3. Save the file

---

## Testing the Webhook

### Step 1: Deploy Backend with Credentials

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend

# Deploy to Azure
./deploy-azure.sh
```

### Step 2: Verify Webhook Endpoint is Accessible

```bash
# Test that the webhook endpoint responds
curl -X POST https://luntra-outreach-app.azurewebsites.net/intercom/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Expected: HTTP 401 (because signature is missing - this is correct!)
```

### Step 3: Test Webhook from Intercom

1. Go back to Intercom Developer Hub
2. Find your webhook in the list
3. Click on it to view details
4. Look for a **"Send test notification"** or **"Test webhook"** button
5. Click it to send a test event

### Step 4: Check Webhook Delivery Status

In the Intercom webhook details page, you should see:

✅ **Success** (HTTP 200):
```
Status: Delivered
Response: 200 OK
```

❌ **Failed** (HTTP 4xx/5xx):
- Check backend logs for errors
- Verify webhook URL is correct
- Verify backend is deployed and running

---

## Troubleshooting

### Issue: "Invalid URL" when creating webhook

**Problem**: Intercom says the webhook URL is invalid

**Solutions**:
1. Make sure you're using the FULL URL:
   ```
   https://luntra-outreach-app.azurewebsites.net/intercom/webhook
   ```

2. Check that your backend is deployed and accessible:
   ```bash
   curl https://luntra-outreach-app.azurewebsites.net/health
   # Should return: {"status": "healthy"}
   ```

3. If using custom domain (propiq.luntra.one):
   - Make sure DNS is configured correctly
   - Use full URL: `https://propiq.luntra.one/intercom/webhook`

### Issue: Webhook returns HTTP 401 (Unauthorized)

**Problem**: Intercom sends webhooks but gets 401 responses

**Cause**: Webhook signature verification is failing

**Solutions**:
1. Make sure you added the Webhook Secret to `.env`:
   ```bash
   INTERCOM_WEBHOOK_SECRET=whsec_...
   ```

2. Make sure there are no extra spaces or quotes around the secret

3. Redeploy backend after adding the secret:
   ```bash
   ./deploy-azure.sh
   ```

### Issue: Webhook returns HTTP 503 (Service Unavailable)

**Problem**: Intercom says webhook returned HTTP 503

**Cause**: Backend returned error because Intercom is not configured

**Solution**: Make sure both credentials are in `.env`:
```bash
INTERCOM_ACCESS_TOKEN=dG9rOmNkNDI4ZmQ3XzRhZjdfNDgyYV9iNTMwX2RhODU1ZmQyODNhNjoxOjA=
INTERCOM_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### Issue: "URL must be HTTPS"

**Problem**: Intercom requires HTTPS for webhooks

**Solution**: Always use `https://` in the webhook URL (not `http://`)

---

## Verifying Integration

### Check Backend Health

```bash
curl https://luntra-outreach-app.azurewebsites.net/intercom/health
```

Expected response:
```json
{
  "status": "healthy",
  "intercom_configured": true,
  "api_base": "https://api.intercom.io"
}
```

### Check Backend Logs

After a webhook is sent, check Azure logs:

```bash
az webapp log tail \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app
```

Look for log lines like:
```
📨 Intercom webhook received: user.created
✅ New Intercom user: test@example.com
```

### Test Creating a Test User in Intercom

1. Go to Intercom inbox: https://app.intercom.com/a/inbox/
2. Click "New conversation"
3. Create a test user
4. Check backend logs - you should see `user.created` webhook notification

---

## Webhook Notification Examples

### user.created Event
```json
{
  "type": "notification_event",
  "app_id": "hvhctgls",
  "data": {
    "type": "notification_event_data",
    "item": {
      "type": "user",
      "id": "123456",
      "user_id": "abc-123",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": 1729526400
    }
  },
  "id": "notif_abc123",
  "topic": "user.created",
  "created_at": 1729526400
}
```

### conversation.user.created Event
```json
{
  "type": "notification_event",
  "app_id": "hvhctgls",
  "data": {
    "type": "notification_event_data",
    "item": {
      "type": "conversation",
      "id": "789012",
      "created_at": 1729526400,
      "user": {
        "type": "user",
        "id": "123456",
        "email": "user@example.com"
      }
    }
  },
  "id": "notif_xyz789",
  "topic": "conversation.user.created",
  "created_at": 1729526400
}
```

---

## Security Notes

### Webhook Signature Verification

The backend automatically verifies webhook signatures using HMAC SHA-256:

```python
# This happens automatically in routers/intercom.py:47-67
expected_signature = hmac.new(
    INTERCOM_WEBHOOK_SECRET.encode('utf-8'),
    request_body,
    hashlib.sha256
).hexdigest()

if not hmac.compare_digest(f"sha256={expected_signature}", x_hub_signature):
    # Reject webhook with HTTP 401
```

This ensures webhooks are actually from Intercom and not from attackers.

### Rate Limiting

Intercom has rate limits for webhooks:
- If your endpoint returns HTTP 429, Intercom will throttle notifications
- Notifications delayed > 2 hours will be dropped

The backend handles this gracefully by processing webhooks quickly.

---

## Next Steps After Webhook Setup

1. ✅ Webhook created and tested
2. Update `.env` with `INTERCOM_WEBHOOK_SECRET`
3. Deploy backend: `./deploy-azure.sh`
4. Test by creating a user in Intercom
5. Monitor webhook deliveries in Intercom Developer Hub
6. Check backend logs for received events

---

## Summary

**Webhook URL** (copy this):
```
https://luntra-outreach-app.azurewebsites.net/intercom/webhook
```

**Topics to subscribe to**:
- ✅ user.created
- ✅ conversation.user.created
- ✅ conversation.admin.replied

**After creating webhook**:
1. Copy the Webhook Secret
2. Add to `.env`: `INTERCOM_WEBHOOK_SECRET=whsec_...`
3. Deploy backend
4. Test and verify

**Support**:
- Intercom Developer Hub: https://app.intercom.com/a/apps/hvhctgls/settings/developers
- Intercom Webhook Docs: https://developers.intercom.com/intercom-api-reference/reference/webhooks
