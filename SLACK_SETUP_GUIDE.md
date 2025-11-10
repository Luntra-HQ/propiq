# Slack Notifications Setup Guide

**Goal**: Get real-time notifications in Slack when users sign up and pay

**Time required**: 5-10 minutes

---

## What You'll Get

After setup, you'll receive Slack notifications for:

1. 🎉 **New user signup** - See who just created an account
2. 💰 **User upgrade** - When someone upgrades to paid tier
3. ✅ **Payment success** - Recurring payments received
4. ⚠️ **Payment failed** - URGENT: User needs help (prevent churn!)

---

## Step 1: Create Slack Webhook (5 minutes)

### 1.1 Go to Slack API

Visit: https://api.slack.com/messaging/webhooks

### 1.2 Create a New App

1. Click **"Create an App"**
2. Select **"From scratch"**
3. **App Name**: `PropIQ Notifications`
4. **Workspace**: Select your Slack workspace
5. Click **"Create App"**

### 1.3 Enable Incoming Webhooks

1. In your app settings, click **"Incoming Webhooks"**
2. Toggle **"Activate Incoming Webhooks"** to ON
3. Click **"Add New Webhook to Workspace"**
4. **Select channel**: Choose where notifications will appear
   - Recommended: Create a dedicated channel like `#propiq-alerts`
   - Or use existing channel like `#general`
5. Click **"Allow"**

### 1.4 Copy Your Webhook URL

You'll see a **Webhook URL** that looks like:
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

**✅ Copy this URL** - you'll need it in Step 2!

---

## Step 2: Add Webhook to Your Environment

### Local Development (.env file)

1. Open `/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/backend/.env`

2. Add this line:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```
(Replace with your actual webhook URL)

3. Save the file

### Production Deployment (Render.com)

When you deploy to Render:

1. Go to Render dashboard → Your service → Environment
2. Add environment variable:
   - **Key**: `SLACK_WEBHOOK_URL`
   - **Value**: Your webhook URL
3. Click "Save Changes"
4. Render will auto-redeploy

---

## Step 3: Test the Integration (2 minutes)

### Option A: Test Endpoint (Easiest)

1. **Start your local backend** (if not already running):
```bash
cd propiq/backend
uvicorn api:app --reload --port 8000
```

2. **Send a test notification**:
```bash
curl -X POST http://localhost:8000/api/test-slack
```

3. **Check your Slack channel** - you should see a test message! 🧪

### Option B: Test with Real Signup

1. Go to http://localhost:5173 (your frontend)
2. Sign up with a test email
3. Check Slack - you should see:
```
🎉 New user signup!
• Email: test@example.com
• Name: Test User
• Tier: Free
• Source: web
```

---

## Step 4: Customize Notifications (Optional)

### Change Notification Channel

To send different events to different channels:

1. Create multiple webhooks in Slack (repeat Step 1.3)
2. Use different environment variables:
```bash
SLACK_WEBHOOK_SIGNUPS=https://hooks.slack.com/services/.../...
SLACK_WEBHOOK_PAYMENTS=https://hooks.slack.com/services/.../...
SLACK_WEBHOOK_ALERTS=https://hooks.slack.com/services/.../...
```

3. Update `utils/slack.py` to use the appropriate webhook

### Customize Message Format

Edit `/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/backend/utils/slack.py`:

```python
# Change colors
color="#10B981"  # Green for good news
color="#EF4444"  # Red for urgent alerts
color="#F59E0B"  # Amber for money

# Change emoji
message = f"""🎉 *New user signup!*  # Change this emoji
```

---

## Notification Examples

### New User Signup
```
🎉 New user signup!
• Email: john@example.com
• Name: John Doe
• Tier: Free
• Source: web
• Time: 2025-10-21 14:30:00
```

### User Upgrade
```
💰 User upgraded!
• User: john@example.com
• Free → Pro
• Amount: $79.00
• Time: 2025-10-21 15:00:00
```

### Payment Success
```
✅ Payment received
• User: john@example.com
• Plan: Pro (monthly)
• Amount: $79.00
• Time: 2025-10-21 15:01:00
```

### Payment Failed (URGENT)
```
⚠️ PAYMENT FAILED
• User: john@example.com
• Plan: Pro
• Amount: $79.00
• Reason: Card declined
• Time: 2025-10-21 16:00:00

🚨 ACTION REQUIRED: Contact user ASAP!
```

---

## Troubleshooting

### Issue: No notifications received

**Check 1**: Is webhook URL set?
```bash
# In backend directory
cat .env | grep SLACK_WEBHOOK_URL
```

**Check 2**: Test the webhook directly
```bash
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test from curl"}'
```

**Check 3**: Check backend logs
```bash
# Look for Slack notification attempts
tail -f /tmp/propiq_server.log | grep Slack
```

### Issue: "Slack notifications not available" warning

**Cause**: `utils/slack.py` not found or import error

**Fix**:
```bash
# Verify file exists
ls -la propiq/backend/utils/slack.py

# Restart backend
# Press Ctrl+C and run: uvicorn api:app --reload
```

### Issue: Webhook URL returns 404

**Cause**: Webhook URL is incorrect or webhook was deleted

**Fix**:
1. Go back to https://api.slack.com/apps
2. Select your app → Incoming Webhooks
3. Copy the correct webhook URL
4. Update `.env` file

---

## Advanced: Slack Bot Customization

### Add Custom Bot Icon

1. Go to https://api.slack.com/apps → Your app
2. Click "Basic Information"
3. Scroll to "Display Information"
4. Upload bot icon (PropIQ logo)
5. Set bot name: "PropIQ Bot"

### Add Bot Emoji

In `utils/slack.py`, use emoji in message:
```python
message = f""":rocket: *New user signup!*
:email: Email: {email}
:bust_in_silhouette: Name: {name}
```

---

## Monitoring Best Practices

### What to Do When You Get Alerts

**New User Signup (🎉)**:
- Welcome them personally (optional)
- Monitor their first actions
- Offer help if they seem stuck

**User Upgrade (💰)**:
- Thank them for upgrading
- Offer onboarding call for Pro/Elite users
- Track LTV

**Payment Failed (⚠️)**:
- **URGENT**: Contact within 1 hour
- Email: "Your payment failed, let's fix it!"
- Offer to update payment method
- This prevents churn!

### Slack Channel Organization

**Recommended setup**:
```
#propiq-signups      → New user notifications
#propiq-revenue      → Upgrades and payments
#propiq-alerts       → Failed payments and errors
#propiq-daily        → Daily summaries
```

---

## Future Enhancements

Want more notifications? Edit `utils/slack.py` to add:

- 🏡 First property analyzed
- 📊 Daily summary (signups, revenue, analyses)
- 📈 Weekly cohort report
- 🎯 Milestone achievements (100 users, $1k MRR, etc.)
- 🔔 Custom alerts (e.g., high-value user activity)

All the functions are already in `utils/slack.py`! Just call them from your endpoints.

---

## Testing Checklist

- [ ] Webhook URL created
- [ ] Environment variable set (local)
- [ ] Environment variable set (production)
- [ ] Test signup notification works
- [ ] Test payment notification works (use Stripe test mode)
- [ ] Slack channel accessible by team
- [ ] Bot icon/name customized (optional)

---

## Quick Reference

**Slack API Dashboard**: https://api.slack.com/apps
**Your App**: PropIQ Notifications
**Webhook URL**: Stored in `SLACK_WEBHOOK_URL`
**Code**: `propiq/backend/utils/slack.py`

---

## Support

**Issues?**
1. Check logs: `tail -f /tmp/propiq_server.log`
2. Test webhook with curl (see Troubleshooting)
3. Verify environment variable is set
4. Check Slack webhook is active in Slack API dashboard

---

**Setup complete! 🎉**

Now you'll get real-time notifications for every user event!

**Last Updated**: October 21, 2025
