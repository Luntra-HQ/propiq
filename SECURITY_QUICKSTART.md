# 🚨 SECURITY FIX - QUICK START

**CRITICAL SECURITY INCIDENT - ACT NOW**

---

## What Happened?

Multiple production API keys and secrets were exposed in `.env` files that are tracked in git.

## Immediate Impact

- ✅ Stripe payment keys compromised
- ✅ Database credentials exposed
- ✅ Azure OpenAI keys leaked
- ✅ All other service API keys vulnerable

## What You Need to Do RIGHT NOW

### **Phase 1: Emergency Response** (60 minutes - START HERE)

```bash
# 1. Open the detailed guide
open EMERGENCY_SECURITY_FIX.md

# Or view in terminal:
cat EMERGENCY_SECURITY_FIX.md
```

**Follow Phase 1 step-by-step to:**
1. ✅ Audit for suspicious activity
2. ✅ Rotate ALL API keys
3. ✅ Update environment variables

### **Phase 2: Secure Repository** (90 minutes)

```bash
# 1. Make repository private (if public)
# Go to: https://github.com/Luntra-HQ/propiq/settings

# 2. Clean git history
# CAREFUL: This rewrites history
pip3 install git-filter-repo
git filter-repo --path .env --invert-paths --force
git filter-repo --path .env.local --invert-paths --force
git filter-repo --path backend/.env --invert-paths --force

# 3. Force push (requires admin)
git push origin --force --all

# 4. Clean up exposed secrets in docs
./scripts/cleanup-exposed-secrets.sh

# 5. Review and commit
git diff
git add .
git commit -m "security: redact exposed secrets from documentation"
git push
```

### **Phase 3: Implement Security** (2 hours)

```bash
# 1. Install pre-commit hooks
./scripts/setup-pre-commit-hooks.sh

# 2. Verify gitignore
./scripts/verify-gitignore.sh

# 3. Follow implementation guide
open SECURITY_IMPLEMENTATION_GUIDE.md

# Key steps:
# - Add rate limiting
# - Harden CORS
# - Add security headers
```

---

## Files Created for You

### 📋 Guides
- `EMERGENCY_SECURITY_FIX.md` - Step-by-step emergency response
- `SECURITY_IMPLEMENTATION_GUIDE.md` - Technical implementation details
- `SECURITY_AUDIT_REPORT.md` - Full security assessment

### 🛠️ Scripts
- `scripts/verify-gitignore.sh` - Check gitignore configuration
- `scripts/setup-pre-commit-hooks.sh` - Install secret scanning
- `scripts/cleanup-exposed-secrets.sh` - Remove secrets from docs

### 📄 Templates
- `.env.secure.template` - Root environment template
- `backend/.env.secure.template` - Backend environment template

### 💻 Code
- `convex/rateLimit.ts` - Rate limiting implementation
- `convex/http_secure.ts` - Secure HTTP endpoints reference
- `convex/schema_additions.ts` - Database schema for rate limiting

---

## Priority Order

1. **TODAY (4-6 hours)**
   - [ ] Complete Phase 1: Rotate all API keys
   - [ ] Make repository private
   - [ ] Clean git history

2. **THIS WEEK (2-4 hours)**
   - [ ] Complete Phase 2: Clean documentation
   - [ ] Implement Phase 3: Security hardening
   - [ ] Test all changes

3. **THIS MONTH**
   - [ ] Set up monitoring alerts
   - [ ] Document incident response
   - [ ] Schedule quarterly key rotation

---

## Need Help?

### During Remediation
- Review guides in order: EMERGENCY → IMPLEMENTATION
- Each script has built-in help: `./script.sh --help`
- Test in development first

### After Remediation
- Set up monitoring (Sentry, UptimeRobot)
- Create SECURITY.md for your repo
- Schedule key rotation (90 days)

---

## Quick Commands Reference

```bash
# Verify current security status
./scripts/verify-gitignore.sh

# Check for remaining exposed secrets
grep -r "sk_live_" . --exclude-dir=node_modules --exclude-dir=.git

# Test pre-commit hook
echo "STRIPE_SECRET_KEY=sk_live_test" > test.txt
git add test.txt
git commit -m "test"  # Should be BLOCKED

# Deploy security changes to Convex
npx convex deploy --yes

# Test rate limiting
curl -X POST https://mild-tern-361.convex.cloud/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"wrong"}' \
  -w "\nStatus: %{http_code}\n"
```

---

## ✅ Completion Checklist

```bash
# Track your progress

Phase 1: Emergency Response
- [ ] Audited access logs (no suspicious activity found)
- [ ] Rotated Stripe keys
- [ ] Rotated Azure OpenAI key
- [ ] Rotated SendGrid key
- [ ] Changed MongoDB password
- [ ] Rotated Supabase service key
- [ ] Generated new JWT secret
- [ ] Rotated W&B API key
- [ ] Regenerated Slack webhook
- [ ] Rotated Intercom token
- [ ] Rotated Convex deploy key
- [ ] Revoked all old keys

Phase 2: Secure Repository
- [ ] Repository made private
- [ ] Git history cleaned
- [ ] Secrets removed from docs
- [ ] Changes pushed to GitHub

Phase 3: Implement Security
- [ ] Pre-commit hooks installed
- [ ] Gitignore verified
- [ ] Rate limiting deployed
- [ ] CORS hardened
- [ ] Security headers added
- [ ] All tests passing

Final Steps
- [ ] Application still works
- [ ] Team notified
- [ ] Incident documented
- [ ] Monitoring configured
```

---

## 🆘 Emergency Contacts

**If you find evidence of breach:**
1. Document everything
2. Contact service providers immediately:
   - Stripe: https://support.stripe.com
   - Azure: https://portal.azure.com → Support
   - MongoDB: https://www.mongodb.com/contact

**If you need help with remediation:**
- Review all markdown files in project root
- Each guide has detailed step-by-step instructions
- Scripts include error handling and rollback options

---

## After You're Done

**Set Calendar Reminders:**
- [ ] 90 days: Rotate all API keys
- [ ] Quarterly: Security audit
- [ ] Annually: Penetration testing

**Update Team:**
- Share incident report
- Review secret handling procedures
- Train on pre-commit hooks

**Document Learnings:**
- What went wrong?
- How to prevent next time?
- Update onboarding docs

---

**START NOW → Open `EMERGENCY_SECURITY_FIX.md`**
