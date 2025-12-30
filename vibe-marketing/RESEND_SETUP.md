# 🚀 Resend Setup (30 Seconds!)

## Why Resend?

✅ **Simplest email API** - Just 4 lines of config
✅ **Modern & fast** - Built for developers
✅ **Free tier: 100 emails/day** - More than enough!
✅ **Better than SendGrid** - Cleaner, simpler

---

## Setup (30 Seconds):

### 1. Sign Up
```bash
open https://resend.com/signup
```

- Sign up with email or GitHub
- Verify email

### 2. Add Domain (Optional but Recommended)
```
Go to: Domains → Add Domain
Add: luntra.one

Copy these DNS records to your domain:
- MX record
- TXT record for SPF
- TXT record for DKIM

(Or skip and use resend.dev for testing)
```

### 3. Get API Key
```
Go to: API Keys → Create API Key
Name: "PropIQ Dashboard"
Permissions: "Sending access"

Copy the key (starts with re_xxx)
```

### 4. Update .env.production
```bash
cd /Users/briandusape/Projects/propiq/vibe-marketing
nano .env.production
```

Add your key:
```bash
RESEND_API_KEY=re_your_key_here
```

### 5. Test!
```bash
python3 daily_intelligence_enhanced.py
```

**Check your email!** Report arrives in ~3 seconds. 📧

---

## Resend vs SendGrid API:

### Resend (Simple!):
```json
{
  "from": "noreply@luntra.one",
  "to": "brian@luntra.one",
  "subject": "Daily Report",
  "html": "<h1>Report</h1>"
}
```

### SendGrid (Complex):
```json
{
  "personalizations": [{
    "to": [{"email": "brian@luntra.one"}],
    "subject": "Daily Report"
  }],
  "from": {"email": "noreply@luntra.one", "name": "PropIQ"},
  "content": [{"type": "text/html", "value": "<h1>Report</h1>"}]
}
```

**Winner: Resend!** 🏆 (75% less code)

---

## Free Tier Comparison:

| Service | Free Emails/Day | Free Emails/Month |
|---------|----------------|------------------|
| **Resend** | ✅ 100 | ✅ 3,000 |
| SendGrid | ✅ 100 | ❌ 3,000 (but complex) |
| Mailgun | ⚠️ 100 | 1,000 |
| Postmark | ❌ 0 | 100 |

**Winner: Resend!** 🎯

---

## After Setup:

### Test immediately:
```bash
python3 daily_intelligence_enhanced.py
```

### Schedule daily:
```bash
crontab -e
```

Add:
```
0 9 * * * cd /Users/briandusape/Projects/propiq/vibe-marketing && python3 daily_intelligence_enhanced.py >> logs/daily_report.log 2>&1
```

**DONE!** Daily intelligence at 9 AM every morning. ☕

---

## Switch to SendGrid Later?

No problem! Just change 2 lines:

```bash
# In .env.production:
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
```

The script supports BOTH! 🎛️

---

## Domain Setup (Optional):

**Without domain:** Emails from `noreply@resend.dev` (works fine!)

**With domain:** Emails from `noreply@luntra.one` (more professional)

**To add domain:**
1. Resend → Domains → Add Domain
2. Add DNS records to your registrar
3. Verify (takes 1-5 minutes)
4. Done!

**Not urgent** - works perfectly without it for testing!

---

## Troubleshooting:

### "401 Unauthorized"
- Check API key is correct
- Make sure it starts with `re_`
- Copy fresh key from Resend dashboard

### "Domain not verified"
- Use `resend.dev` domain for testing
- Or complete domain verification

### "Email not received"
- Check spam folder
- Check email address is correct in `.env.production`
- Verify API key has "Sending access" permission

---

## Cost:

**Free tier:** 100 emails/day, 3,000/month
**You need:** 1 email/day = 30/month
**Usage:** 1% of free quota
**Cost:** $0 forever 🎉

---

## Support:

**Resend Docs:** https://resend.com/docs
**Dashboard:** https://resend.com/emails
**Status:** https://status.resend.com

---

**You're 30 seconds away from automated daily intelligence!**

Ready? Let's go! 🚀
