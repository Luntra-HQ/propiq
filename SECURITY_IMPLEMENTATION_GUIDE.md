# 🔐 Security Implementation Guide

**Created:** December 29, 2025
**Purpose:** Step-by-step guide to implement security hardening
**Estimated Time:** 2-3 hours

---

## Overview

This guide helps you implement:
1. ✅ Rate limiting for auth endpoints
2. ✅ Hardened CORS configuration
3. ✅ Security headers
4. ✅ Pre-commit hooks for secret scanning

---

## Step 1: Update Convex Schema (5 minutes)

Add rate limiting table to your database schema.

### Edit: `convex/schema.ts`

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables (users, sessions, etc.) ...

  // ADD THIS TABLE:
  rateLimits: defineTable({
    identifier: v.string(),
    action: v.string(),
    attempts: v.number(),
    windowExpiresAt: v.number(),
    blockedUntil: v.union(v.number(), v.null()),
    lastAttemptAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_identifier_action", ["identifier", "action"])
    .index("by_identifier", ["identifier"])
    .index("by_blocked_until", ["blockedUntil"]),

  // ... rest of your schema ...
});
```

### Deploy Schema Change

```bash
cd /Users/briandusape/Projects/propiq
npx convex dev
```

**Convex will automatically create the new table and indexes.**

---

## Step 2: Add Rate Limiting Module (10 minutes)

The rate limiting module is already created at `convex/rateLimit.ts`.

### Verify File Exists

```bash
ls -la convex/rateLimit.ts
```

**If file doesn't exist**, it was created as part of this security fix.

### Test Rate Limiting

```bash
# Deploy to Convex
npx convex deploy --yes

# Verify functions are available
npx convex run rateLimit:getRateLimitStatus '{"identifier":"test-ip"}'
```

---

## Step 3: Update HTTP Endpoints (45 minutes)

### Option A: Manual Integration (Recommended)

1. **Open** `convex/http.ts`
2. **Compare** with `convex/http_secure.ts`
3. **Apply changes** to your existing endpoints:

#### Key Changes to Apply:

**1. Update CORS Configuration (lines ~38-50)**

```typescript
// BEFORE (insecure):
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // BAD: allows all origins
  ...
};

// AFTER (secure):
const ALLOWED_ORIGINS = [
  "https://propiq.luntra.one",
  "https://www.propiq.luntra.one",
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:5173"]
    : []
  ),
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "false",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    // Security headers
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000",
  };
}
```

**2. Add IP Extraction Function**

```typescript
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("X-Forwarded-For");
  const realIp = request.headers.get("X-Real-IP");
  const cfConnectingIp = request.headers.get("CF-Connecting-IP");

  return cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";
}
```

**3. Update Login Endpoint**

```typescript
http.route({
  path: "/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = getCorsHeaders(request);
    const clientIp = getClientIp(request);

    try {
      // CHECK RATE LIMIT FIRST
      const rateLimit = await ctx.runQuery(api.rateLimit.checkRateLimit, {
        identifier: clientIp,
        action: "login",
      });

      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Too many login attempts. Please try again later.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ... existing login logic ...

      // RECORD ATTEMPT AFTER
      await ctx.runMutation(api.rateLimit.recordAttempt, {
        identifier: clientIp,
        action: "login",
        success: result.success,
      });

      // ... return response ...
    } catch (error) {
      // Record failed attempt
      await ctx.runMutation(api.rateLimit.recordAttempt, {
        identifier: clientIp,
        action: "login",
        success: false,
      });
      // ... error handling ...
    }
  }),
});
```

**4. Apply Same Pattern to Signup and Password Reset**

Repeat the rate limiting pattern for:
- `/auth/signup` → action: "signup"
- `/auth/request-password-reset` → action: "passwordReset"

### Option B: Replace Entire File (Faster, but review first)

```bash
# Backup current file
cp convex/http.ts convex/http.ts.backup

# Review differences
diff convex/http.ts convex/http_secure.ts

# If you're comfortable, replace
cp convex/http_secure.ts convex/http.ts
```

### Deploy Changes

```bash
npx convex deploy --yes
```

---

## Step 4: Install Pre-Commit Hooks (5 minutes)

Prevent future secret leaks with automated scanning.

```bash
cd /Users/briandusape/Projects/propiq

# Run setup script
./scripts/setup-pre-commit-hooks.sh

# Verify installation
ls -la .git/hooks/pre-commit
```

### Test Pre-Commit Hook

```bash
# Try to commit a fake secret (should be blocked)
echo "STRIPE_SECRET_KEY=sk_live_test123" > test-secret.txt
git add test-secret.txt
git commit -m "test"

# Expected: COMMIT BLOCKED - Secrets detected!

# Clean up
rm test-secret.txt
```

---

## Step 5: Verify .gitignore (5 minutes)

Ensure sensitive files are properly ignored.

```bash
./scripts/verify-gitignore.sh
```

**Expected Output:**
```
✅ .env - Properly ignored
✅ .env.local - Properly ignored
✅ backend/.env - Properly ignored
✅ frontend/.env.local - Properly ignored
```

If any files show `❌ NOT IGNORED`, add them to `.gitignore`:

```bash
echo ".env.local" >> .gitignore
echo "backend/.env.local" >> .gitignore
git add .gitignore
git commit -m "security: ensure all .env files are gitignored"
```

---

## Step 6: Clean Up Exposed Secrets in Docs (10 minutes)

Remove hardcoded secrets from documentation files.

```bash
./scripts/cleanup-exposed-secrets.sh
```

### Review Changes

```bash
git diff
```

### Verify Cleanup

```bash
# Search for remaining exposed keys
grep -r "sk_live_" . --exclude-dir=node_modules --exclude-dir=.git | grep -v "sk_live_\*\*\*"

# Should only show template files with placeholders
```

### Commit Changes

```bash
git add .
git commit -m "security: redact exposed secrets from documentation

- Replaced hardcoded API keys with placeholders
- Updated all documentation to reference .env.local
- Added security warnings to template files
"
```

---

## Step 7: Test Security Hardening (20 minutes)

### 7.1 Test Rate Limiting

```bash
# Test login rate limit (5 attempts in 15 minutes)
for i in {1..6}; do
  curl -X POST https://mild-tern-361.convex.cloud/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done

# Expected: First 5 attempts return 401, 6th returns 429
```

### 7.2 Test CORS

```bash
# Test from unauthorized origin (should fail or return default origin)
curl -X POST https://mild-tern-361.convex.cloud/auth/login \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -i | grep "Access-Control-Allow-Origin"

# Should NOT return: Access-Control-Allow-Origin: https://evil.com
```

### 7.3 Test Security Headers

```bash
curl -I https://mild-tern-361.convex.cloud/auth/login

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

---

## Step 8: Update Documentation (10 minutes)

### Create SECURITY.md

```bash
cat > SECURITY.md << 'EOF'
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please email: security@luntra.one

**Do NOT open a public GitHub issue.**

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Measures

- ✅ Rate limiting on authentication endpoints
- ✅ CORS restricted to known origins
- ✅ PBKDF2 password hashing (600k iterations)
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Pre-commit hooks for secret scanning
- ✅ Regular dependency audits

## Secret Rotation Schedule

All API keys and secrets are rotated every 90 days.

Last rotation: December 29, 2025

## Contact

Security Team: security@luntra.one
EOF

git add SECURITY.md
git commit -m "docs: add security policy"
```

---

## Step 9: Monitor and Alert (15 minutes)

### Set Up Sentry Alerts (Already Integrated)

1. Login to Sentry: https://sentry.io
2. Go to **Alerts** → **Create Alert**
3. Configure alert for:
   - **Rate limit exceeded** (search logs for "RATE LIMIT")
   - **Authentication failures** (search for "Invalid email or password")
   - **API errors** (4xx, 5xx status codes)

### Set Up Uptime Monitoring

```bash
# Add health check endpoint to convex/http.ts
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "healthy", timestamp: Date.now() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});
```

Then monitor with:
- UptimeRobot (free): https://uptimerobot.com
- Better Uptime: https://betterstack.com

---

## ✅ Final Checklist

- [ ] Rate limiting schema added to Convex
- [ ] Rate limiting functions deployed
- [ ] HTTP endpoints updated with rate limiting
- [ ] CORS hardened (no wildcard *)
- [ ] Security headers added
- [ ] Pre-commit hooks installed
- [ ] .gitignore verified
- [ ] Documentation cleaned of secrets
- [ ] Security tests passed
- [ ] SECURITY.md created
- [ ] Monitoring alerts configured

---

## 📊 Before & After

### Before
- CORS: `*` (any origin)
- Rate limiting: None
- Security headers: None
- Secret scanning: None

### After
- CORS: Whitelist only
- Rate limiting: 5 login attempts / 15 min
- Security headers: 6+ headers
- Secret scanning: Pre-commit hooks

---

## 🆘 Troubleshooting

### Rate Limiting Not Working

```bash
# Check if table exists
npx convex run rateLimit:getRateLimitStatus '{"identifier":"test"}'

# Clear rate limits for testing
npx convex run rateLimit:clearRateLimit '{"identifier":"127.0.0.1"}'
```

### CORS Errors in Development

Add localhost to `ALLOWED_ORIGINS`:

```typescript
const ALLOWED_ORIGINS = [
  "https://propiq.luntra.one",
  "http://localhost:5173", // Add this
];
```

### Pre-Commit Hook Not Triggering

```bash
# Reinstall hook
./scripts/setup-pre-commit-hooks.sh

# Make executable
chmod +x .git/hooks/pre-commit
```

---

## Next Steps

1. **Schedule Key Rotation**: Set calendar reminder for 90 days
2. **Security Audit**: Quarterly penetration testing
3. **SOC 2 Compliance**: Consider certification
4. **Bug Bounty**: Set up HackerOne program

---

**Questions?** Review `EMERGENCY_SECURITY_FIX.md` or contact the security team.
