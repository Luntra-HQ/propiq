# Moderate-Priority Key Rotation Summary

**Date:** December 30, 2025
**Status:** ✅ Complete - Keys Updated in Environment Files

---

## ✅ Keys Successfully Rotated

### 1. **Convex Deploy Key** ✅
- **File Updated:** `.env.local:3`
- **Old Key:** `prod:mild-tern-361|eyJ2MiI6ImRlNzY3NTIxNzc1NTRiODk4ODBkY2M0NjljNzdkY2IxIn0=`
- **New Key:** `prod:mild-tern-361|eyJ2MiI6IjkwZDM5YjJmNDIyNTQ3M2JiODkzNDNmNDNiOGZjZjI5In0=`
- **Tested:** ✅ Dry-run deployment successful
- **Next Step:** Delete old deploy key from Convex dashboard

### 2. **JWT Secret** ✅
- **File Updated:** `backend/.env:16`
- **Old Secret:** `9990747ca11c97900008bb0f93c77a99791202f56d40e91b4f7d5b2dfedd5e2b`
- **New Secret:** `5ab99a7e3a2a677f51bcce30c82a709c9324b2f698463d42e507a6e0e6e0c572`
- **Generated:** Using `openssl rand -hex 32`
- **⚠️ WARNING:** This will log out all users when deployed!
- **Next Step:** Update Azure App Settings

### 3. **Slack Webhook** ✅
- **File Updated:** `backend/.env:73`
- **Old Webhook:** `https://hooks.slack.com/services/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`
- **New Webhook:** `https://hooks.slack.com/services/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`
- **App:** Prop IQ Service
- **Next Step:** Delete old webhook from Slack API dashboard

### 4. **Intercom Keys** ✅ DEPRECATED
- **File Updated:** `backend/.env:60-65`
- **Action Taken:** Commented out all Intercom references
- **Reason:** Not needed for PropIQ - using custom support chat instead
- **Status:** Keys disabled in environment file

---

## 💾 Backups Created

All original files backed up before modification:

```bash
.env.local.backup-20251230-HHMMSS
backend/.env.backup-20251230-HHMMSS
```

To restore original keys (if needed):
```bash
cp .env.local.backup-* .env.local
cp backend/.env.backup-* backend/.env
```

---

## 🚀 Next Steps (CRITICAL)

### 1. Update Azure App Settings

The backend `.env` was updated locally, but **Azure App Service still has the old JWT_SECRET**.

**Find the correct PropIQ Azure resource:**
```bash
# Login to Azure
az login

# List all App Services
az webapp list --output table

# Find PropIQ resource (NOT luntra-outreach-app)
az webapp list --query "[?contains(name, 'propiq') || contains(name, 'PropIQ')].{Name:name, ResourceGroup:resourceGroup, State:state, URL:defaultHostName}" --output table
```

**Update JWT_SECRET in Azure:**

**Option A: Azure Portal (Recommended)**
1. Go to: https://portal.azure.com
2. Find PropIQ App Service (not luntra-outreach-app)
3. Settings → Configuration → Application settings
4. Find `JWT_SECRET`
5. Update value to: `5ab99a7e3a2a677f51bcce30c82a709c9324b2f698463d42e507a6e0e6e0c572`
6. Click "Save"
7. Restart the app

**Option B: Azure CLI**
```bash
# Replace <propiq-app-name> and <resource-group> with actual values
az webapp config appsettings set \
  --name <propiq-app-name> \
  --resource-group <resource-group> \
  --settings JWT_SECRET="5ab99a7e3a2a677f51bcce30c82a709c9324b2f698463d42e507a6e0e6e0c572"

# Restart the app
az webapp restart --name <propiq-app-name> --resource-group <resource-group>
```

### 2. Update SLACK_WEBHOOK_URL in Azure (If backend uses it)

If your backend sends Slack notifications, update the webhook URL:
```bash
az webapp config appsettings set \
  --name <propiq-app-name> \
  --resource-group <resource-group> \
  --settings SLACK_WEBHOOK_URL="https://hooks.slack.com/services/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"
```

### 3. Delete Old Keys from Services

**Convex:**
1. Go to: https://dashboard.convex.dev
2. Settings → Deploy Keys
3. Delete the old key ending in `...djI5In0=`

**Slack:**
1. Go to: https://api.slack.com/apps
2. Select Prop IQ Service app
3. Incoming Webhooks
4. Delete old webhook ending in `...nPLS`

### 4. Test Functionality

**Test Convex (Frontend):**
```bash
cd /Users/briandusape/Projects/propiq
npx convex dev
# Should connect successfully to prod:mild-tern-361
```

**Test JWT (Backend):**
After updating Azure App Settings:
```bash
# Users will need to log in again
# All existing sessions will be invalidated
# This is expected behavior!
```

**Test Slack Notifications:**
Trigger a notification event in your app to verify the new webhook works.

---

## 📊 Rotation Status Summary

| Service | Status | Location | Next Action |
|---------|--------|----------|-------------|
| **Convex** | ✅ Rotated | `.env.local:3` | Delete old key from dashboard |
| **JWT Secret** | ✅ Rotated | `backend/.env:16` | **UPDATE AZURE APP SETTINGS** |
| **Slack Webhook** | ✅ Rotated | `backend/.env:73` | Delete old webhook from Slack |
| **Intercom** | ✅ Disabled | `backend/.env:60-65` | None (not used) |

---

## ⚠️ Important Notes

### JWT Secret Rotation Impact

**What will happen when you deploy the new JWT_SECRET:**
- ✅ All existing user sessions will be invalidated
- ✅ Users will be logged out automatically
- ✅ Users will need to log in again
- ✅ This is a **security feature**, not a bug

**User Communication (Optional):**
Consider notifying users:
```
Subject: Security Update - Please Log In Again

We've upgraded our security systems. For your protection,
all users will need to log in again.

This is a routine security measure and your account is safe.

Thank you,
PropIQ Team
```

### Backup Recovery

If anything goes wrong, restore backups:
```bash
# Restore .env.local
cp .env.local.backup-20251230-* .env.local

# Restore backend/.env
cp backend/.env.backup-20251230-* backend/.env

# Redeploy
npx convex deploy
```

---

## 🔐 Security Checklist

After rotation is complete:

- [ ] ✅ New Convex key tested (dry-run successful)
- [ ] ⏳ New JWT secret updated in Azure App Settings
- [ ] ⏳ New Slack webhook updated in Azure (if used)
- [ ] ⏳ Old Convex deploy key deleted from dashboard
- [ ] ⏳ Old Slack webhook deleted from Slack API
- [ ] ⏳ Intercom keys revoked (if you had access)
- [ ] ⏳ Azure App Service restarted
- [ ] ⏳ User login tested with new JWT secret
- [ ] ⏳ Slack notifications tested with new webhook

---

## 📞 Support

If you encounter issues:

1. **Convex not deploying:** Check deploy key format
2. **Users can't log in:** Verify JWT_SECRET in Azure matches backend/.env
3. **Slack not working:** Verify webhook URL is correct

---

**Rotation Completed By:** Claude Code
**Files Modified:** 2 (`.env.local`, `backend/.env`)
**Backups Created:** 2
**Next Review Date:** March 30, 2026 (90 days)

---

**End of Rotation Summary**
