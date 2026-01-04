# PropIQ Security Quickstart Guide

**Last Updated:** 2025-12-31
**Security Audit Status:** ✅ All HIGH and MEDIUM priority issues resolved

This guide provides a quick reference for PropIQ's security features and best practices for developers.

---

## Table of Contents

1. [Quick Setup](#quick-setup)
2. [Secret Scanning](#secret-scanning)
3. [Authentication Security](#authentication-security)
4. [Rate Limiting](#rate-limiting)
5. [Security Headers](#security-headers)
6. [Audit Logging](#audit-logging)
7. [Security Monitoring](#security-monitoring)
8. [Best Practices](#best-practices)
9. [Incident Response](#incident-response)

---

## Quick Setup

### 1. Install Git-Secrets

Automatically detect and prevent committing API keys and secrets:

```bash
# Run the automated setup script
chmod +x scripts/setup-git-secrets.sh
./scripts/setup-git-secrets.sh
```

**What it does:**
- Installs git-secrets (via Homebrew on macOS, manual on Linux)
- Configures patterns for Stripe, SendGrid, MongoDB, Convex, JWT tokens
- Sets up pre-commit hooks to block secrets
- Scans repository for existing secrets

### 2. Install Pre-commit Hooks

Additional automated checks before each commit:

```bash
# Install pre-commit framework
pip install pre-commit

# Install the hooks
pre-commit install

# Test on all files
pre-commit run --all-files
```

**What it checks:**
- ✅ Secret detection (git-secrets)
- ✅ Private key detection
- ✅ Large file prevention (>500KB)
- ✅ Python formatting (black)
- ✅ Python linting (flake8, bandit)
- ✅ TypeScript formatting (prettier)
- ✅ TypeScript linting (eslint)
- ✅ JSON/YAML validation
- ✅ Trailing whitespace removal

### 3. Verify HTTPS Configuration

Ensure all production endpoints use HTTPS:

```bash
# Frontend .env.local
VITE_CONVEX_URL=https://mild-tern-361.convex.cloud
```

**Security validation:**
- Frontend: `frontend/src/config/security.ts` validates HTTPS on startup
- Backend: All integrations require HTTPS by default
- Development: Warnings for HTTP (non-blocking)
- Production: Errors for HTTP (blocking)

---

## Secret Scanning

### Git-Secrets Patterns

PropIQ detects these secret types:

| Service | Pattern | Example |
|---------|---------|---------|
| **Stripe** | `sk_live_*`, `sk_test_*`, `whsec_*` | `sk_live_abc123...` |
| **SendGrid** | `SG.*` | `SG.abc123...` |
| **MongoDB** | `mongodb+srv://...` | `mongodb+srv://user:pass@cluster...` |
| **JWT** | `eyJ*` (base64 tokens) | `eyJhbGciOiJIUzI1NiIs...` |
| **Azure** | `AZURE_OPENAI_KEY=*` | `AZURE_OPENAI_KEY=abc123...` |
| **Convex** | `CONVEX_DEPLOY_KEY=*` | `CONVEX_DEPLOY_KEY=abc123...` |

### Manual Scanning

Scan specific files:
```bash
git secrets --scan path/to/file.ts
```

Scan repository history:
```bash
git secrets --scan-history
```

Scan all files recursively:
```bash
git secrets --scan -r .
```

---

## Authentication Security

### Session Token Lifetime

**Configuration:** `convex/sessions.ts:16-22`

```typescript
// Session duration: 7 days
const SESSION_IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;
```

**Benefits:**
- Reduced from 30 days to 7 days (76% reduction)
- Limits exposure if token stolen
- Auto-refresh prevents frequent re-authentication

### Password Strength Requirements

**Requirements:**
- ✅ Minimum 12 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*)

**UX Features:**
- Real-time validation with strength meter (0-100 score)
- All errors shown at once
- Color-coded feedback (red → yellow → green)

---

## Rate Limiting

### Endpoints Protected

| Endpoint | Limit | Window | Status Code |
|----------|-------|--------|-------------|
| **Login** | 5 attempts | 15 minutes | 429 |
| **Signup** | 3 attempts | 1 hour | 429 |
| **Password Reset** | 3 attempts | 1 hour | 429 |

### Testing Rate Limiting

```bash
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST https://mild-tern-361.convex.site/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

**Expected:** Attempts 1-5: HTTP 401, Attempt 6+: HTTP 429

---

## Security Headers

### Content Security Policy (CSP)

**Location:** `frontend/index.html:9-22`, `convex/http.ts:55-78`

**Protection:**
- ✅ XSS (Cross-Site Scripting) attacks
- ✅ Code injection attacks
- ✅ Clickjacking (frame-ancestors 'none')
- ✅ Mixed content (upgrade-insecure-requests)

### Testing Headers

```bash
curl -I https://mild-tern-361.convex.site/auth/login | grep -E "Content-Security|X-Frame"
```

---

## Audit Logging

### Security Events Tracked

**25+ event types tracked:**
- 🔐 Authentication: LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT
- 🔑 Passwords: PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED
- 👤 Accounts: ACCOUNT_CREATED, ACCOUNT_DELETED
- 💳 Subscriptions: SUBSCRIPTION_UPGRADED, SUBSCRIPTION_CANCELED
- 🛡️ Security: BRUTE_FORCE_DETECTED, SUSPICIOUS_ACTIVITY, RATE_LIMIT_EXCEEDED

### Retention

**90 days minimum** (GDPR, SOC 2, PCI-DSS compliance)

Auto-cleanup via daily cron job at 3 AM EST

---

## Security Monitoring

### Automated Threat Detection

**Brute Force Detection:**
- Threshold: 10+ failed logins in 60 minutes
- Tracked by: IP address and email
- Severity: Critical

**Account Enumeration Detection:**
- Threshold: 20+ non-existent account attempts in 30 minutes
- Tracked by: IP address
- Severity: Critical

### Cron Job Schedule

```typescript
// Every 15 minutes
crons.interval("security-monitoring", { minutes: 15 }, internal.securityMonitoring.runSecurityChecks);
```

---

## Best Practices

### Environment Variables

**Never commit:**
- ❌ API keys or secrets
- ❌ `.env` files
- ❌ Database credentials

**Always:**
- ✅ Use `.env.local` for local development
- ✅ Use Convex environment variables for backend secrets
- ✅ Add `.env*` to `.gitignore`

### Secure Coding

**Input Validation:**
```typescript
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  // Convex automatically validates args
});
```

**Error Handling:**
```typescript
// ❌ Bad - Reveals details
throw new Error(`Database error: ${error.message}`);

// ✅ Good - Generic message
console.error("Database error:", error);
throw new Error("An unexpected error occurred.");
```

---

## Incident Response

### If a Secret is Leaked

1. **Rotate immediately**
   - Stripe: Dashboard → Developers → API keys → Roll key
   - MongoDB: Atlas → Database Access → Reset password
   - Convex: Dashboard → Settings → Regenerate deploy key

2. **Remove from git history**
   ```bash
   brew install bfg
   bfg --replace-text secrets.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

3. **Monitor for abuse**
   - Check service dashboards
   - Review audit logs

4. **Document the incident**

---

## Security Checklist

### Pre-Development
- [ ] Run `./scripts/setup-git-secrets.sh`
- [ ] Install pre-commit hooks
- [ ] Verify `.env.local` uses HTTPS

### Pre-Commit
- [ ] No secrets in code (auto-checked)
- [ ] Error messages don't reveal internal details
- [ ] All user inputs validated

### Pre-Deployment
- [ ] Run `npm audit` (frontend)
- [ ] Environment variables set in production
- [ ] HTTPS configured
- [ ] Rate limiting tested

### Post-Deployment
- [ ] Test authentication flow
- [ ] Verify security headers
- [ ] Monitor audit logs

---

## Resources

### Internal Documentation
- `SECURITY_AUDIT_REPORT.md` - Comprehensive security audit findings
- `convex/auditLog.ts` - Audit logging implementation
- `convex/securityMonitoring.ts` - Threat detection
- `scripts/setup-git-secrets.sh` - Secret scanning setup

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Git-Secrets](https://github.com/awslabs/git-secrets)
- [Convex Security](https://docs.convex.dev/security)

---

**Last Updated:** 2025-12-31
**Next Security Review:** 2026-03-31 (quarterly)
