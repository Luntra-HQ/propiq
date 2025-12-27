# Resend Email Service Configuration Guide
**Date:** December 26, 2025
**Purpose:** Enable password reset emails for PropIQ
**Estimated Time:** 20-30 minutes

---

## 🎯 WHAT WE'RE DOING

Configuring Resend to send password reset emails so users can:
- Request password reset from login page
- Receive email with secure reset link
- Reset password without admin intervention

---

## 📋 STEP-BY-STEP GUIDE

### STEP 1: Sign Up for Resend (5 min)

**Go to:** https://resend.com

**Actions:**
1. Click "Get Started" or "Sign Up"
2. Use your email: `bdusape@gmail.com` (or another email)
3. Complete registration
4. Verify your email address
5. Complete onboarding

**Free Tier Includes:**
- 3,000 emails/month (~100/day)
- All features
- No credit card required
- Perfect for MVP/startup

---

### STEP 2: Create API Key (3 min)

**In Resend Dashboard:**
1. Navigate to **"API Keys"** section
2. Click **"Create API Key"**
3. Name it: `PropIQ Production`
4. Permissions: **"Sending access"** (default)
5. Click **"Create"**
6. **COPY THE API KEY** (starts with `re_`)
   - ⚠️ You won't be able to see it again!
   - Save it temporarily in a secure location

**Example API Key Format:**
```
re_AbCdEfGh123456789_SomeRandomString
```

---

### STEP 3: Set API Key in Convex (2 min)

**Run this command in terminal:**
```bash
npx convex env set RESEND_API_KEY re_YourActualKeyHere
```

**Verify it was set:**
```bash
npx convex env list
```

**Expected Output:**
```
RESEND_API_KEY = re_***********  (value hidden for security)
```

---

### STEP 4: Configure Sending Domain (Optional - 10 min)

**For better deliverability, add a verified domain:**

1. In Resend Dashboard: **Domains** → **Add Domain**
2. Enter your domain: `propiq.com` or subdomain like `mail.propiq.com`
3. Add DNS records (provided by Resend):
   - **SPF record** (for authentication)
   - **DKIM record** (for authentication)
   - **DMARC record** (for security)
4. Wait for verification (~5-10 minutes)

**Note:** You can skip this and use Resend's default domain (`onresend.com`) for testing.

---

### STEP 5: Test Password Reset Email (5 min)

**Option A: Test via CLI**
```bash
# Request password reset for your test user
npx convex run auth:requestPasswordReset '{
  "email": "test-admin-dec26@example.com"
}'

# Expected: {"success": true, "message": "Password reset email sent"}
```

**Check your email inbox:**
- From: noreply@propiq.com (or noreply@onresend.com)
- Subject: "Reset Your PropIQ Password"
- Should contain a reset link

**Option B: Test via Frontend**
1. Go to: http://localhost:5173/login
2. Click "Forgot Password?"
3. Enter email: `test-admin-dec26@example.com`
4. Click "Send Reset Link"
5. Check email inbox

---

### STEP 6: Verify Email Template (5 min)

**Check the email you received:**
- ✅ Subject line is clear
- ✅ Reset link is present
- ✅ Link is clickable
- ✅ Branding looks correct
- ✅ No spam/broken images

**Click the reset link:**
- Should open: http://localhost:5173/reset-password?token=...
- Enter new password
- Submit
- Verify login works with new password

---

## 🧪 COMPLETE TESTING CHECKLIST

After configuration, test all scenarios:

### Test 1: Valid Email Reset
- [ ] Request reset for existing user
- [ ] Email arrives within 1 minute
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password

### Test 2: Invalid Email Reset
- [ ] Request reset for non-existent email
- [ ] Returns success (security - don't reveal which emails exist)
- [ ] No email sent

### Test 3: Expired Token
- [ ] Request reset
- [ ] Wait 16 minutes (tokens expire after 15 min)
- [ ] Click reset link
- [ ] Should show "Token expired" error
- [ ] Can request new reset

### Test 4: Already Used Token
- [ ] Request reset
- [ ] Complete password change
- [ ] Try using same reset link again
- [ ] Should show "Token already used" error

---

## 🔍 TROUBLESHOOTING

### Email Not Arriving

**Check 1: Spam Folder**
- Check spam/junk folder
- Mark as "Not Spam" if found there

**Check 2: API Key**
```bash
npx convex env list | grep RESEND
```
- Verify key is set correctly
- Starts with `re_`

**Check 3: Resend Dashboard**
- Go to Resend Dashboard → Logs
- Check if email was sent
- Look for any errors

**Check 4: Email Address**
- Verify email is spelled correctly
- Verify user exists in database

### Reset Link Broken

**Check 1: URL Format**
- Should be: `http://localhost:5173/reset-password?token=...`
- Verify token parameter is present

**Check 2: Token Expiration**
- Tokens expire after 15 minutes
- Request new reset if expired

**Check 3: Frontend Route**
- Verify `/reset-password` route exists in App.tsx
- Check browser console for errors

---

## 📊 VERIFICATION COMMANDS

### Check API Key is Set
```bash
npx convex env list
```

### Check Recent Emails Sent (Resend Dashboard)
1. Go to Resend Dashboard
2. Navigate to **"Logs"** section
3. View recent email sends
4. Check delivery status

### Test Backend Directly
```bash
# Test password reset mutation
npx convex run auth:requestPasswordReset '{
  "email": "bdusape@gmail.com"
}'
```

### Check Convex Logs
```bash
npx convex logs --history 20
```
- Look for password reset requests
- Check for any email send errors

---

## 🎯 SUCCESS CRITERIA

**Configuration Complete When:**
- [x] Resend account created
- [x] API key generated
- [x] API key set in Convex
- [ ] Test email received
- [ ] Reset link works
- [ ] Password change successful
- [ ] Login works with new password

---

## 📝 CONFIGURATION SUMMARY

**Service:** Resend
**Plan:** Free (3,000 emails/month)
**Environment Variable:** `RESEND_API_KEY`
**From Email:** noreply@propiq.com (or onresend.com)
**Token Expiration:** 15 minutes
**Use Cases:**
- Password reset emails
- Welcome emails (future)
- Account verification (future)
- Subscription notifications (future)

---

## 🚀 NEXT STEPS AFTER CONFIGURATION

### Immediate
1. Test password reset with your account (bdusape@gmail.com)
2. Verify all email scenarios work
3. Document any issues found

### Short Term
1. Customize email templates (add branding)
2. Add welcome emails for new signups
3. Add email verification flow

### Long Term
1. Set up custom domain for emails
2. Add transactional email templates
3. Implement email analytics tracking
4. Add unsubscribe functionality

---

## 💡 TIPS & BEST PRACTICES

### Email Deliverability
- Use verified domain (prevents spam)
- Keep email content simple
- Include plain text version
- Add unsubscribe link (for marketing emails)
- Monitor bounce rates in Resend dashboard

### Security
- Never expose API key in frontend code
- Store in Convex environment variables only
- Rotate API key periodically (every 90 days)
- Monitor API usage in Resend dashboard

### Development vs Production
- Use separate API keys for dev/staging/prod
- Test with test emails first
- Monitor free tier usage (3,000/month limit)
- Upgrade if approaching limit

---

## 📞 SUPPORT RESOURCES

**Resend Documentation:**
- Docs: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- Email Best Practices: https://resend.com/docs/knowledge-base

**PropIQ Email Implementation:**
- Backend: `convex/auth.ts` (requestPasswordReset mutation)
- Frontend: `frontend/src/pages/ResetPasswordPage.tsx`
- Email template: In `convex/auth.ts` (sendPasswordResetEmail)

---

## ⚠️ IMPORTANT NOTES

1. **API Key Security:**
   - Never commit API keys to git
   - Never expose in frontend code
   - Store only in Convex environment variables

2. **Free Tier Limits:**
   - 3,000 emails/month (~100/day)
   - Monitor usage in Resend dashboard
   - Upgrade if approaching limit

3. **Email Deliverability:**
   - Default domain (onresend.com) works but may go to spam
   - Verified domain (propiq.com) much better deliverability
   - Add SPF/DKIM/DMARC records for best results

4. **Token Expiration:**
   - Reset tokens expire after 15 minutes
   - Users must request new reset if expired
   - Implement clear error messages

---

**Ready to start? Let's begin with Step 1!** 🚀
