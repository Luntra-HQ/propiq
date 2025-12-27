# Auth System Quick Start Guide
**For New Projects Using Convex + Resend**

This is a condensed checklist version of the full playbook. Use this when you need to set up auth quickly.

---

## Prerequisites Checklist

- [ ] Convex account created
- [ ] Resend account created (free tier: 3,000 emails/month)
- [ ] Domain for email (or use `onboarding@resend.dev` sandbox)
- [ ] React + TypeScript project initialized
- [ ] Vite or similar build tool configured

---

## 30-Minute Setup

### Step 1: Get API Keys (5 minutes)

**Resend:**
1. Go to https://resend.com/api-keys
2. Create new API key
3. Copy key (starts with `re_`)

**Convex:**
```bash
npx convex env set RESEND_API_KEY re_xxxxx
npx convex env list  # Verify it's set
```

### Step 2: Copy Auth Files (10 minutes)

**From PropIQ, copy these files:**
1. `convex/authUtils.ts` → Password hashing utilities
2. `convex/admin.ts` → Admin CLI tools
3. `convex/auth.ts` → Auth mutations (signup, login, reset)
4. `convex/http.ts` → HTTP endpoints

**Update these lines:**
```typescript
// In http.ts, line ~405
from: "YourApp <onboarding@resend.dev>",  // Change app name

// In auth.ts, line ~549
const expiresAt = now + 60 * 60 * 1000; // 1 hour (keep this!)
```

### Step 3: Add Schema (5 minutes)

**Add to `convex/schema.ts`:**
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    active: v.boolean(),
    emailVerified: v.boolean(),
    subscriptionTier: v.string(),
    analysesUsed: v.number(),
    analysesLimit: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  passwordResets: defineTable({
    userId: v.id("users"),
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user_id", ["userId"]),

  audit_logs: defineTable({
    action: v.string(),
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_user_email", ["email"]),
});
```

### Step 4: Deploy & Test (10 minutes)

**Deploy:**
```bash
npx convex deploy --yes
```

**Test 1: Create test user**
```bash
npx convex run auth:signup '{
  "email": "test@example.com",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User"
}'
```

**Test 2: Test login**
```bash
npx convex run auth:login '{
  "email": "test@example.com",
  "password": "TestPassword123!"
}'
```

**Test 3: Test email**
```bash
curl -X POST https://your-deployment.convex.site/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check email inbox (including spam!)
```

---

## Common Issues & Quick Fixes

### Issue: "Dynamic module import unsupported"
```typescript
// ❌ WRONG
const { hashPassword } = await import("./authUtils");

// ✅ CORRECT
import { hashPassword } from "./authUtils";
```

### Issue: Emails not sending
```bash
# 1. Check API key is set
npx convex env list | grep RESEND

# 2. Verify you're using sandbox domain
# In http.ts:
from: "YourApp <onboarding@resend.dev>",  # ✅ Must use this on free tier

# NOT:
from: "YourApp <noreply@yourdomain.com>",  # ❌ Won't work unless verified

# 3. Check spam folder (sandbox domain often goes to spam)

# 4. Test Resend directly
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "App <onboarding@resend.dev>",
    "to": ["your@email.com"],
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

### Issue: "Invalid or expired reset token"
```typescript
// Check token expiration time in auth.ts
const expiresAt = now + 60 * 60 * 1000; // Should be 1 hour, not 15 minutes!
```

---

## Production Checklist

Before going live, verify:

**Backend:**
- [ ] All environment variables set in production
- [ ] Password hashing using PBKDF2 (600K iterations)
- [ ] Token expiration set to 1 hour minimum
- [ ] Audit logging enabled
- [ ] Admin rollback functions tested

**Email:**
- [ ] Resend API key configured
- [ ] Using `onboarding@resend.dev` OR verified custom domain
- [ ] Test email sent and received
- [ ] Checked spam folder

**Frontend:**
- [ ] Environment variables set (`.env.local` or hosting provider)
- [ ] Build succeeds (`npm run build`)
- [ ] CORS configured correctly
- [ ] Password strength indicator working
- [ ] Error messages user-friendly

**Security:**
- [ ] HTTPS enabled
- [ ] JWT tokens expiring properly
- [ ] No API keys in frontend code
- [ ] Email enumeration prevented (always return success)
- [ ] Rate limiting considered (future enhancement)

**Testing:**
- [ ] Can create new user
- [ ] Can login with correct password
- [ ] Cannot login with wrong password
- [ ] Can request password reset
- [ ] Email arrives within 1 minute
- [ ] Can reset password via email link
- [ ] Can login with new password

---

## Emergency: User Locked Out

If a user can't login and needs immediate access:

```bash
# Step 1: Reset their password via CLI
npx convex run admin:resetUserPassword '{
  "email": "user@example.com",
  "newPassword": "TempPassword123!"
}'

# Step 2: Inform user of temp password (securely!)

# Step 3: User logs in and changes password in Settings
```

**Rollback if needed:**
```bash
npx convex run admin:rollbackPasswordReset '{
  "email": "user@example.com"
}'
```

---

## Upgrading from Sandbox to Custom Domain

When ready for production emails:

**Step 1: Verify Domain in Resend**
1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records:
   - TXT record for verification
   - TXT record for SPF: `v=spf1 include:_spf.resend.com ~all`
   - CNAME/TXT for DKIM (provided by Resend)

**Step 2: Update Code**
```typescript
// In convex/http.ts
from: "YourApp <noreply@yourdomain.com>",  // Use your verified domain
```

**Step 3: Test**
```bash
# Send test email
curl -X POST https://your-deployment.convex.site/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should NOT go to spam now!
```

---

## Useful Commands

**Convex:**
```bash
# Deploy
npx convex deploy --yes

# Check logs
npx convex logs --history 50

# List environment variables
npx convex env list

# Run mutation
npx convex run mutation:name '{"arg":"value"}'

# Check deployment info
cat convex.json
cat .env.local
```

**Testing:**
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- tests/auth-comprehensive.spec.ts

# Watch mode
npm run test -- --watch
```

**Email (Resend):**
```bash
# Test direct API
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "App <onboarding@resend.dev>",
    "to": ["you@example.com"],
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

---

## File Checklist

After setup, you should have:

**Backend (`convex/`):**
- [x] `authUtils.ts` - Password hashing
- [x] `admin.ts` - Admin CLI tools
- [x] `auth.ts` - Auth mutations
- [x] `http.ts` - HTTP endpoints
- [x] `schema.ts` - Database schema (updated)

**Frontend (`frontend/src/`):**
- [x] `pages/LoginPage.tsx`
- [x] `pages/SignupPage.tsx`
- [x] `pages/ResetPasswordPage.tsx`
- [x] `components/PasswordStrengthIndicator.tsx`
- [x] `utils/passwordValidation.ts`

**Config:**
- [x] `convex.json` - Convex deployment config
- [x] `.env.local` - Environment variables (frontend)
- [x] Resend API key set in Convex (`npx convex env list`)

---

## Next Steps After Setup

**Immediate:**
1. ✅ Test all auth flows manually
2. ✅ Run automated test suite
3. ✅ Deploy to production
4. ✅ Monitor for first 24 hours

**Week 1:**
1. Add rate limiting on auth endpoints
2. Set up error tracking (Sentry, LogRocket)
3. Configure domain verification in Resend
4. Create user documentation

**Future Enhancements:**
1. Add 2FA/MFA
2. Implement magic link login
3. Add social auth (Google, GitHub)
4. Create admin dashboard
5. Add comprehensive analytics

---

## Success Metrics

Your auth system is ready when:

- ✅ New users can sign up
- ✅ Users can login
- ✅ Users can reset forgotten passwords
- ✅ Emails arrive within 1 minute
- ✅ Test coverage > 85%
- ✅ No console errors
- ✅ Admin can reset passwords if needed
- ✅ Audit logs are working
- ✅ Security best practices followed

---

## Support Resources

**Documentation:**
- Full playbook: `PROPIQ_AUTH_SYSTEM_PLAYBOOK.md`
- Lessons learned: `SESSION_LESSONS_LEARNED.md`
- This quick start: `AUTH_SETUP_QUICK_START.md`

**External Docs:**
- Convex: https://docs.convex.dev
- Resend: https://resend.com/docs
- OWASP Password Storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

**PropIQ Example:**
- GitHub: [Your repo if public]
- Working implementation in this project

---

## Time Estimate

**Initial Setup:** 30-60 minutes
**Testing & Debugging:** 1-2 hours
**Production Deployment:** 30 minutes
**Total:** ~2-4 hours for complete auth system

**Much faster than building from scratch!** (Would take 2-3 days otherwise)

---

**Good luck with your project! 🚀**

If you run into issues, refer to the full playbook for detailed troubleshooting.
