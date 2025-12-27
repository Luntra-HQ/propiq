# Formspree Email Notification Setup

## Overview
This guide shows you how to configure Formspree to send instant email notifications when someone signs up on your waitlist.

## Step 1: Login to Formspree

1. Go to [formspree.io](https://formspree.io)
2. Login to your account
3. Find your form: **xldqywge**

## Step 2: Enable Email Notifications

### Option A: Direct Email Notifications (Recommended - Simplest)

1. Click on your form **xldqywge**
2. Go to **Settings** → **Notifications**
3. Under "Email Notifications":
   - ✅ Enable "Send me email notifications"
   - **Email address**: Enter the email where you want to receive notifications
   - **Subject line**: `🎉 New PropIQ Waitlist Signup!`
   - **Reply-to**: Use submitter's email (this will be the person who signed up)
4. Click **Save**

**You're done!** Every signup will now send an email to your inbox.

---

### Option B: Advanced Webhook Integration (For Slack/Discord/Zapier)

If you want to send notifications to Slack, Discord, or integrate with other tools:

#### For Slack:

1. Create a Slack Incoming Webhook:
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click **Create New App** → **From scratch**
   - Name: "PropIQ Signups"
   - Choose workspace
   - Go to **Incoming Webhooks** → Enable
   - Click **Add New Webhook to Workspace**
   - Choose channel (e.g., #signups)
   - Copy the webhook URL (starts with https://hooks.slack.com/...)

2. Add webhook to Formspree:
   - Go to your Formspree form settings
   - Click **Integrations**
   - Click **Add Integration** → **Webhook**
   - Paste your Slack webhook URL
   - Click **Save**

3. Test it:
   - Submit a test form
   - Check your Slack channel

#### For Discord:

1. Create Discord Webhook:
   - Go to your Discord server
   - Right-click the channel → **Edit Channel**
   - Go to **Integrations** → **Webhooks**
   - Click **New Webhook**
   - Name: "PropIQ Signups"
   - Copy webhook URL

2. Add to Formspree (same as Slack steps above)

---

## What You'll Receive

When someone signs up, you'll get an email like this:

```
Subject: 🎉 New PropIQ Waitlist Signup!

From: notifications@formspree.io
Reply-To: [user's email]

Email: user@example.com
Submitted: December 24, 2025 at 3:45 PM
Form: xldqywge
```

---

## Additional Formspree Settings (Optional)

### Auto-Response to Users

Send an automatic thank-you email to people who sign up:

1. In Formspree dashboard, go to your form
2. Click **Settings** → **Autoresponder**
3. Enable autoresponder
4. Configure:
   - **Subject**: "Welcome to PropIQ - You're on the waitlist!"
   - **Message**:
     ```
     Hi there!

     Thanks for joining the PropIQ waitlist! You're one of the first to know about our AI-powered real estate investment platform.

     🎁 As an early access member, you'll get:
     - 1 month free when we launch
     - Priority customer support
     - Exclusive feature previews

     We'll send you an email when we're ready to launch.

     Best regards,
     The PropIQ Team
     https://propiq.luntra.one
     ```
4. Click **Save**

### Spam Protection

Formspree already includes:
- ✅ Honeypot spam protection (enabled by default)
- ✅ ReCAPTCHA (can enable in Settings → Security)

---

## Troubleshooting

**Not receiving emails?**
- Check spam/junk folder
- Verify email address in Formspree settings
- Check form submission history in Formspree dashboard

**Webhook not working?**
- Test the webhook URL directly with curl
- Check webhook logs in Formspree dashboard
- Verify the webhook URL is correct

---

## Next Steps

After setup:
1. Test the form by submitting a signup
2. Verify you receive the notification
3. Check GA4 to confirm the conversion event was tracked
4. Use the analytics dashboard script to view all metrics

---

**Setup Complete!** 🎉

You now have:
- ✅ Real-time email notifications for every signup
- ✅ GA4 tracking for page visits and conversions
- ✅ Complete visibility into your landing page performance
