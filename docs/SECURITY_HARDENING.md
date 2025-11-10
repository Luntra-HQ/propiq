# Security Hardening Guide

**Sprint 12 - Task 5: Security Hardening**
**Created:** 2025-11-07

---

## Security Checklist

### Infrastructure Security ✅

- [x] **HTTPS everywhere** - SSL certificates configured (Netlify + Azure)
- [x] **Security headers** - CSP, HSTS, X-Frame-Options configured
- [x] **Environment variables** - Secrets stored securely (not in code)
- [x] **CORS configured** - Specific origins only (no wildcards)
- [ ] **Rate limiting** - Implement per-user and per-IP limits
- [ ] **DDoS protection** - Cloudflare or Azure DDoS protection
- [ ] **Firewall rules** - Restrict database access to app servers only

### Authentication & Authorization ✅

- [x] **Password hashing** - bcrypt with salt
- [x] **JWT tokens** - Short expiry (24 hours)
- [x] **Token validation** - Verify on every protected route
- [ ] **Refresh tokens** - Implement for better UX
- [ ] **Account lockout** - After 5 failed login attempts
- [ ] **2FA** - Optional two-factor authentication
- [ ] **Session management** - Revoke tokens on logout

### Input Validation & Sanitization ✅

- [x] **Pydantic validation** - Backend input validation
- [x] **XSS protection** - DOMPurify on frontend
- [x] **SQL injection prevention** - Parameterized queries (Supabase)
- [ ] **CSRF protection** - CSRF tokens for state-changing requests
- [ ] **File upload validation** - If implementing file uploads
- [ ] **Email validation** - Proper regex and DNS checks

### API Security

- [ ] **Rate limiting per user** - Prevent abuse
- [ ] **API key rotation** - Monthly rotation of sensitive keys
- [ ] **Request signing** - HMAC signatures for webhooks
- [ ] **IP whitelisting** - For admin endpoints
- [ ] **Audit logging** - Log all sensitive operations

### Data Privacy

- [x] **PII protection** - Don't log passwords, tokens
- [x] **HTTPS only** - All data encrypted in transit
- [ ] **Database encryption** - Encryption at rest (Supabase default)
- [ ] **Data retention policy** - Auto-delete old analyses
- [ ] **GDPR compliance** - Data export, deletion requests
- [ ] **Cookie consent** - If using analytics cookies

---

## Implementation Guide

### 1. Rate Limiting (High Priority)

**Install slowapi:**
```bash
pip install slowapi
```

**Implementation:**
```python
# backend/middleware/rate_limiter.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, FastAPI

limiter = Limiter(key_func=get_remote_address)

def setup_rate_limiting(app: FastAPI):
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Usage in routers
from fastapi import Request
from backend.middleware.rate_limiter import limiter

@router.post("/api/v1/propiq/analyze")
@limiter.limit("10/minute")  # Max 10 analyses per minute
async def analyze_property(request: Request, ...):
    pass

@router.post("/api/v1/auth/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(request: Request, ...):
    pass
```

**Rate limits by endpoint:**
- `/auth/login`: 5 requests/minute per IP
- `/auth/signup`: 3 requests/minute per IP
- `/propiq/analyze`: 10 requests/minute per user
- `/support/chat`: 20 requests/minute per user
- `/stripe/*`: 10 requests/minute per user
- All others: 100 requests/minute per IP

### 2. CSRF Protection

**Backend:**
```python
# backend/middleware/csrf.py
from fastapi import Request, HTTPException
import secrets
import hmac

CSRF_SECRET = os.getenv("CSRF_SECRET", secrets.token_hex(32))

def generate_csrf_token(user_id: str) -> str:
    """Generate CSRF token for user"""
    return hmac.new(
        CSRF_SECRET.encode(),
        user_id.encode(),
        'sha256'
    ).hexdigest()

def verify_csrf_token(user_id: str, token: str) -> bool:
    """Verify CSRF token"""
    expected = generate_csrf_token(user_id)
    return hmac.compare_digest(expected, token)

# Middleware
async def csrf_middleware(request: Request, call_next):
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        csrf_token = request.headers.get("X-CSRF-Token")
        user_id = request.state.user_id  # From JWT

        if not csrf_token or not verify_csrf_token(user_id, csrf_token):
            raise HTTPException(status_code=403, detail="Invalid CSRF token")

    return await call_next(request)
```

**Frontend:**
```typescript
// Get CSRF token from API
const csrfToken = await fetchCSRFToken();

// Include in all state-changing requests
await axios.post('/api/v1/propiq/analyze', data, {
  headers: {
    'X-CSRF-Token': csrfToken
  }
});
```

### 3. Security Headers

**Backend (add to middleware):**
```python
# backend/middleware/security_headers.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' "
            "https://clarity.microsoft.com https://www.clarity.ms; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' "
            "https://luntra-outreach-app.azurewebsites.net "
            "https://sentry.io; "
            "frame-ancestors 'none'; "
        )

        # HSTS (HTTP Strict Transport Security)
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Prevent MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # XSS Protection
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )

        return response

# Add to app
from backend.middleware.security_headers import SecurityHeadersMiddleware
app.add_middleware(SecurityHeadersMiddleware)
```

### 4. Account Lockout

**Implementation:**
```python
# backend/utils/account_security.py
from datetime import datetime, timedelta
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=1)

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = timedelta(minutes=30)

def check_account_locked(email: str) -> bool:
    """Check if account is locked due to failed login attempts"""
    key = f"login_attempts:{email}"
    attempts = redis_client.get(key)

    if attempts and int(attempts) >= MAX_LOGIN_ATTEMPTS:
        return True
    return False

def increment_login_attempts(email: str):
    """Increment failed login attempts counter"""
    key = f"login_attempts:{email}"
    redis_client.incr(key)
    redis_client.expire(key, int(LOCKOUT_DURATION.total_seconds()))

def reset_login_attempts(email: str):
    """Reset failed login attempts on successful login"""
    key = f"login_attempts:{email}"
    redis_client.delete(key)

# Usage in login endpoint
if check_account_locked(email):
    raise HTTPException(
        status_code=429,
        detail="Account locked due to too many failed login attempts. Try again in 30 minutes."
    )

if not verify_password(password, user.password_hash):
    increment_login_attempts(email)
    raise HTTPException(status_code=401, detail="Invalid credentials")

reset_login_attempts(email)  # Successful login
```

### 5. Dependency Vulnerability Scanning

**Python (backend):**
```bash
# Install safety
pip install safety

# Scan dependencies
safety check --json

# Auto-fix
safety check --auto-fix
```

**JavaScript (frontend):**
```bash
# Scan dependencies
npm audit

# Auto-fix
npm audit fix

# Force fix (may break things)
npm audit fix --force
```

**Automated scanning in CI/CD:**
```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  scan-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan Python dependencies
        run: |
          cd propiq/backend
          pip install safety
          safety check --json

  scan-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan npm dependencies
        run: |
          cd propiq/frontend
          npm audit --audit-level=moderate
```

---

## Security Testing

### 1. OWASP ZAP (Automated Security Scanning)

**Install:**
```bash
docker pull owasp/zap2docker-stable
```

**Run scan:**
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://propiq.luntra.one \
  -r zap-report.html
```

**Review report:**
```bash
open zap-report.html
```

### 2. SSL Labs Test

**Test SSL configuration:**
```
https://www.ssllabs.com/ssltest/analyze.html?d=propiq.luntra.one
```

**Target grade:** A or A+

### 3. Security Headers Check

**Test security headers:**
```
https://securityheaders.com/?q=propiq.luntra.one
```

**Target grade:** A or A+

### 4. Penetration Testing Checklist

- [ ] SQL injection attempts
- [ ] XSS injection attempts
- [ ] CSRF attack simulation
- [ ] Authentication bypass attempts
- [ ] Authorization escalation attempts
- [ ] Rate limit bypass attempts
- [ ] Session hijacking attempts
- [ ] Password brute force attempts

---

## Secrets Management

### Environment Variables

**Never commit:**
- API keys
- Database credentials
- JWT secrets
- Stripe keys
- Azure OpenAI keys
- Sentry DSN (though not super sensitive)

**Use:**
- Azure Key Vault (for production)
- `.env` files (for development, gitignored)
- GitHub Secrets (for CI/CD)

**Rotation schedule:**
- Database passwords: Every 90 days
- API keys: Every 90 days
- JWT secret: Every 180 days
- Webhook secrets: On compromise

### Azure Key Vault Integration

```python
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()
client = SecretClient(
    vault_url="https://propiq-vault.vault.azure.net",
    credential=credential
)

# Get secret
db_password = client.get_secret("database-password").value
```

---

## Incident Response Plan

### 1. Security Incident Classification

**Severity levels:**
- **Critical:** Active breach, data exfiltration
- **High:** Vulnerability discovered in production
- **Medium:** Suspicious activity detected
- **Low:** Potential vulnerability, not exploited

### 2. Response Procedure

**Critical incident:**
1. **Isolate** - Take affected systems offline
2. **Assess** - Determine scope of breach
3. **Contain** - Stop ongoing attack
4. **Notify** - Inform team and users (if PII affected)
5. **Remediate** - Fix vulnerability
6. **Review** - Post-mortem and improvements

**High priority:**
1. **Verify** - Confirm vulnerability
2. **Patch** - Fix ASAP (within 24 hours)
3. **Test** - Verify fix doesn't break anything
4. **Deploy** - Emergency deployment
5. **Monitor** - Watch for exploitation attempts

### 3. Communication Plan

**Internal:**
- Slack: #security-incidents (create channel)
- On-call rotation: PagerDuty

**External (if data breach):**
- Email affected users within 72 hours
- Comply with GDPR/CCPA notification requirements
- Post-mortem blog post (optional)

---

## Compliance Checklist

### GDPR (if EU users)

- [ ] Privacy policy published
- [ ] Cookie consent banner
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Right to be forgotten
- [ ] Data processing agreements
- [ ] Breach notification process

### CCPA (if California users)

- [ ] Privacy policy includes CCPA disclosures
- [ ] "Do Not Sell My Data" option
- [ ] Data deletion requests
- [ ] Data disclosure requests

### SOC 2 (for enterprise customers)

- [ ] Access controls
- [ ] Audit logging
- [ ] Encryption at rest and in transit
- [ ] Incident response plan
- [ ] Regular security audits
- [ ] Employee background checks

---

## Security Monitoring

### Metrics to Track

1. **Failed login attempts** - Spike indicates brute force
2. **Rate limit violations** - Potential abuse
3. **API error rates** - Unexpected errors may indicate attack
4. **Database query patterns** - SQL injection attempts
5. **Unusual traffic patterns** - DDoS or scraping

### Alerting Rules

- Failed logins > 10 in 5 min from same IP
- Rate limit violations > 100/hour
- 500 errors > 1% of requests
- Unusual geographic access patterns
- Admin account accessed from new location

---

## Security Audit Schedule

### Monthly

- Review access logs
- Check for new vulnerabilities (npm audit, safety)
- Review failed login attempts
- Update dependencies

### Quarterly

- Rotate secrets
- Review user permissions
- Penetration testing (self or third-party)
- Security training for team

### Annually

- Full security audit
- Update security policies
- Review incident response plan
- Compliance review (GDPR, CCPA)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [FastAPI Security Best Practices](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security Best Practices](https://www.npmjs.com/package/@lavamoat/react)
- [Azure Security Center](https://azure.microsoft.com/en-us/services/security-center/)

---

**Status:** Security hardening guide complete, implementation in progress
**Last Updated:** 2025-11-07
**Sprint:** 12 - Production Readiness
