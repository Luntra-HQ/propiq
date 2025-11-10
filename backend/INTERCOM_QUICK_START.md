# Intercom Integration - Quick Start

## ✅ What's Configured

**Backend Credentials** (already in `.env`):
```bash
INTERCOM_ACCESS_TOKEN=dG9rOmNkNDI4ZmQ3XzRhZjdfNDgyYV9iNTMwX2RhODU1ZmQyODNhNjoxOjA=
INTERCOM_API_KEY=c290ac56-e42b-46e3-8371-c39b166b55c0
```

**Frontend Credentials**:
```javascript
App ID: hvhctgls
```

**Backend Code**: ✅ Complete in `routers/intercom.py`

---

## 🚀 Next Steps (5 Minutes)

### Step 1: Create Webhook in Intercom

1. Go to: https://app.intercom.com/a/apps/hvhctgls/settings/developers
2. Click **"Developer Hub"** → **"Webhooks"** → **"New webhook"**
3. Enter this EXACT URL:
   ```
   https://luntra-outreach-app.azurewebsites.net/intercom/webhook
   ```

   **Why your previous attempt failed**:
   - ❌ `propiq.luntra.one` - Missing `https://` and `/intercom/webhook` path
   - ✅ `https://luntra-outreach-app.azurewebsites.net/intercom/webhook` - Complete URL

4. Select these topics:
   - ✅ `user.created`
   - ✅ `conversation.user.created`
   - ✅ `conversation.admin.replied`

5. Click **"Create webhook"**

6. **COPY THE WEBHOOK SECRET** (shown only once!)
   - Looks like: `whsec_abc123...`

### Step 2: Add Webhook Secret to Backend

Open `.env` and add this line:
```bash
INTERCOM_WEBHOOK_SECRET=whsec_YOUR_SECRET_FROM_STEP_1
```

### Step 3: Deploy Backend

```bash
cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/backend"
./deploy-azure.sh
```

### Step 4: Test Integration

```bash
# Should return: "status": "healthy", "intercom_configured": true
curl https://luntra-outreach-app.azurewebsites.net/intercom/health
```

---

## 📝 Webhook URL Explained

**Why you need the full URL**:

Intercom requires:
1. ✅ Protocol: `https://` (not http://)
2. ✅ Domain: Your backend domain
3. ✅ Path: `/intercom/webhook` (the specific endpoint)

**Available webhook URLs**:

| URL | Status | Use When |
|-----|--------|----------|
| `https://luntra-outreach-app.azurewebsites.net/intercom/webhook` | ✅ Ready | Default (always works) |
| `https://propiq.luntra.one/intercom/webhook` | ⚠️ If configured | Custom domain setup |

**Recommendation**: Use the Azure URL (`luntra-outreach-app.azurewebsites.net`) since it's guaranteed to work.

---

## 🧪 Testing After Setup

### Test 1: Verify Backend Health

```bash
curl https://luntra-outreach-app.azurewebsites.net/intercom/health
```

Expected:
```json
{
  "status": "healthy",
  "intercom_configured": true,
  "api_base": "https://api.intercom.io"
}
```

### Test 2: Create Test User in Intercom

1. Go to: https://app.intercom.com/a/inbox/
2. Create a new test user
3. Check backend logs:
   ```bash
   az webapp log tail --resource-group luntra-outreach-rg --name luntra-outreach-app
   ```
4. Look for: `📨 Intercom webhook received: user.created`

### Test 3: Check Webhook Delivery

1. Go to: https://app.intercom.com/a/apps/hvhctgls/settings/developers
2. Click on your webhook
3. View delivery history - should show ✅ Success (HTTP 200)

---

## 📚 Full Documentation

For detailed information, see:
- **Webhook Setup Guide**: `INTERCOM_WEBHOOK_SETUP_GUIDE.md`
- **Frontend Integration**: `INTERCOM_MESSENGER_INTEGRATION.md`
- **Backend API Guide**: `INTERCOM_BACKEND_API_SETUP.md`

---

## ❓ Common Issues

### "Invalid URL" Error

**Problem**: Intercom won't accept your webhook URL

**Solution**: Use the EXACT full URL:
```
https://luntra-outreach-app.azurewebsites.net/intercom/webhook
```

Don't forget:
- `https://` at the beginning
- `/intercom/webhook` at the end

### Webhook Returns HTTP 401

**Problem**: Webhooks are being rejected

**Solution**: Add `INTERCOM_WEBHOOK_SECRET` to `.env` and redeploy

### Webhook Returns HTTP 503

**Problem**: Backend says "Intercom not configured"

**Solution**: Make sure both `INTERCOM_ACCESS_TOKEN` and `INTERCOM_WEBHOOK_SECRET` are in `.env`

---

## ✨ What Happens After Setup

Once configured, the backend will automatically:

1. **Track user signups**: When users register, they're added to Intercom
2. **Track property analyses**: Every analysis is logged as an event
3. **Track subscription changes**: Upgrades/downgrades are recorded
4. **Receive webhooks**: Get notified when users start conversations

No additional code needed - it all works automatically!

---

## 📊 Monitoring

**Intercom Dashboard**: https://app.intercom.com/a/apps/hvhctgls

**Webhook Status**: https://app.intercom.com/a/apps/hvhctgls/settings/developers

**Backend Health**: https://luntra-outreach-app.azurewebsites.net/intercom/health

---

## Summary

**What you need to do RIGHT NOW**:

1. ✅ Backend credentials - Already configured in `.env`
2. ⏳ Create webhook at: https://app.intercom.com/a/apps/hvhctgls/settings/developers
   - URL: `https://luntra-outreach-app.azurewebsites.net/intercom/webhook`
3. ⏳ Copy webhook secret and add to `.env`
4. ⏳ Deploy: `./deploy-azure.sh`
5. ✅ Test and verify

**Total time**: ~5 minutes
