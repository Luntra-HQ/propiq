# Password Reset Feature - Debugging Guide

## Quick Diagnosis

### Step 1: Check Convex Logs
```bash
npx convex logs --prod --history 20
```

Look for:
- `[AUTH] Password reset requested for: <email>` - Backend received the request
- `[AUTH] RESEND_API_KEY not configured` - Email service not set up ❌
- `[AUTH] Password reset email sent to: <email>` - Email sent successfully ✅
- `[AUTH] Password reset successful for: <email>` - Password updated ✅

### Step 2: Check Browser Console
Open browser DevTools (F12) and look for:
```
[Reset Password] Requesting password reset for: <email>
[Reset Password] Endpoint: https://...
[Reset Password] Response status: 200
[Reset Password] Response data: {...}
```

### Step 3: Test Backend Directly
```bash
# Test request password reset
curl -X POST https://mild-tern-361.convex.site/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected response:
# {"success":true,"message":"If an account exists with that email, a password reset link has been sent."}
```

## Common Issues & Solutions

### Issue 1: "RESEND_API_KEY not configured"
**Symptom**: Backend logs show warning about missing API key
**Solution**:
```bash
npx convex env set RESEND_API_KEY re_H7EmkHzY_35Evxg2J4cG7Qfp5eMT2BkGk
```

**Verify**:
```bash
npx convex env list
```

### Issue 2: Emails Not Being Received
**Possible Causes**:
1. **Wrong email address** - Check for typos
2. **Spam folder** - Check junk/spam folder
3. **User doesn't exist** - For security, no error is shown
4. **Resend API issues** - Check Convex logs for API errors

**Debug Steps**:
1. Check Convex logs for "Password reset email sent"
2. Try with a known existing user email
3. Check Resend dashboard for delivery status
4. Verify sender domain (noreply@luntra.one) is configured

### Issue 3: "Invalid or expired reset token"
**Possible Causes**:
1. **Token expired** - Tokens expire after 15 minutes
2. **Token already used** - One-time use only
3. **Typo in token** - Must be exact match

**Debug Steps**:
```bash
# Check token in database (via Convex dashboard)
# Look in passwordResets table for:
# - expiresAt timestamp (should be > current time)
# - used field (should be false)
```

### Issue 4: Frontend Not Connecting to Backend
**Symptom**: Network errors, CORS errors, or no response
**Check**:
1. `VITE_CONVEX_URL` in `.env.local`:
   ```
   VITE_CONVEX_URL=https://mild-tern-361.convex.cloud
   ```

2. Browser console for CORS errors:
   ```
   Access-Control-Allow-Origin: https://propiq.luntra.one
   ```

3. Network tab in DevTools for request/response

### Issue 5: Password Strength Validation Failing
**Requirements**:
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*...)
- Not a common password

**Debug**:
Check browser console for:
```
[Reset Password] Password strength validation failed: <reason>
```

## Testing the Complete Flow

### Manual Test (with logs)
1. **Start watching logs**:
   ```bash
   npx convex logs --prod --tail
   ```

2. **Navigate to reset page**:
   ```
   http://localhost:5173/reset-password
   ```
   or
   ```
   https://propiq.luntra.one/reset-password
   ```

3. **Request reset**:
   - Enter email: `anudesarmes@gmail.com` (or your test email)
   - Click "Send Reset Link"
   - Check logs for: `[AUTH] Password reset requested for: ...`
   - Check logs for: `[AUTH] Password reset email sent to: ...`

4. **Check email**:
   - Should receive email from "PropIQ <noreply@luntra.one>"
   - Subject: "Reset Your PropIQ Password"
   - Should have button + text link

5. **Click reset link**:
   - URL format: `https://propiq.luntra.one/reset-password?token=<64-char-hex>`
   - Should see "Create New Password" page
   - Email field should be pre-filled and disabled

6. **Reset password**:
   - Enter new password (meeting strength requirements)
   - Confirm password
   - Click "Reset Password"
   - Check logs for: `[AUTH] Password reset successful for: ...`
   - Should auto-redirect to login after 2 seconds

7. **Test login**:
   - Login with new password
   - Old sessions should be invalidated

### Automated Test (via curl)
```bash
# 1. Request reset
curl -X POST https://mild-tern-361.convex.site/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. Get token from Convex logs
# Look for: [AUTH] Password reset requested for: test@example.com

# 3. Use Convex dashboard to find the token:
#    - Go to https://dashboard.convex.dev
#    - Navigate to Data → passwordResets table
#    - Copy the token value

# 4. Reset password
curl -X POST https://mild-tern-361.convex.site/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<TOKEN_FROM_DB>","newPassword":"NewPassword123!"}'

# Expected: {"success":true,"message":"Password reset successful. Please log in with your new password."}
```

## Monitoring

### Key Metrics to Watch
1. **Request Rate**: Monitor `/auth/request-password-reset` calls
2. **Success Rate**: Ratio of successful resets vs requests
3. **Token Expiration**: How many tokens expire unused
4. **Email Delivery**: Check Resend dashboard

### Convex Dashboard
- **Data → passwordResets**: View all reset tokens
- **Functions → auth:requestPasswordReset**: View mutation logs
- **Functions → auth:resetPassword**: View reset attempts
- **Logs**: Real-time function execution logs

### Browser DevTools
- **Console**: JavaScript logs from ResetPasswordPage
- **Network**: HTTP requests/responses
- **Application → Local Storage**: Check VITE_CONVEX_URL

## Security Notes

### What's Protected
✅ Email enumeration prevention (always returns success)
✅ Secure random tokens (32-byte cryptographic)
✅ 15-minute expiration
✅ One-time use tokens
✅ PBKDF2 password hashing (600k iterations)
✅ All sessions invalidated on password reset

### What to Monitor
🔍 Repeated reset requests from same IP (rate limiting needed)
🔍 Tokens being accessed but not used (suspicious)
🔍 High volume of failed reset attempts

## Environment Variables

### Required (Convex)
```bash
RESEND_API_KEY=re_H7EmkHzY_35Evxg2J4cG7Qfp5eMT2BkGk
```

### Required (Frontend .env.local)
```bash
VITE_CONVEX_URL=https://mild-tern-361.convex.cloud
```

### Optional (Convex)
```bash
IS_PRODUCTION_ENV=true  # Controls CORS origin
```

## Troubleshooting Commands

```bash
# View all environment variables
npx convex env list

# Set environment variable
npx convex env set RESEND_API_KEY <key>

# View real-time logs
npx convex logs --prod --tail

# View recent logs
npx convex logs --prod --history 50

# Deploy schema changes
npx convex deploy --yes

# Check deployment status
npx convex dev

# Test endpoint
curl -v https://mild-tern-361.convex.site/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Database Schema

### passwordResets Table
```typescript
{
  userId: Id<"users">,
  email: string,
  token: string,           // 64-char hex string
  expiresAt: number,       // Unix timestamp (15 min from creation)
  used: boolean,           // One-time use flag
  usedAt?: number,         // When it was used
  createdAt: number,       // When it was created
}
```

**Indexes**:
- `by_token`: Fast token lookup
- `by_email`: Find tokens by email
- `by_user`: Find all tokens for a user

## File Locations

### Backend
- `convex/schema.ts` - Database schema
- `convex/auth.ts` - Password reset mutations
- `convex/http.ts` - HTTP endpoints (email sending)

### Frontend
- `frontend/src/pages/ResetPasswordPage.tsx` - UI component
- `frontend/src/main.tsx` - Route configuration
- `frontend/src/utils/passwordValidation.ts` - Password strength validation

## Support

### Logs Not Showing?
```bash
# Try different log commands
npx convex logs --prod --tail --verbose
npx convex logs --prod --history 100
```

### Deployment Issues?
```bash
# Redeploy
npx convex deploy --yes

# Check for schema validation errors
# (will show in deploy output)
```

### Email Issues?
1. Check Resend dashboard: https://resend.com/emails
2. Verify sender domain is configured
3. Check Convex logs for API errors
4. Test with different email providers

## Quick Fix Checklist

- [ ] RESEND_API_KEY is set in Convex environment
- [ ] VITE_CONVEX_URL is set in frontend/.env.local
- [ ] Convex schema is deployed (passwordResets table exists)
- [ ] No schema validation errors in deployment
- [ ] CORS origin matches frontend URL
- [ ] Browser console shows no errors
- [ ] Convex logs show password reset requests
- [ ] Email is being sent (check logs for "email sent")
- [ ] Reset link format is correct (/reset-password?token=...)
- [ ] Token is valid (not expired, not used)
- [ ] Password meets strength requirements
