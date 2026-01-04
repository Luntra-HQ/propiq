# Security GitHub Issues Created - Summary

**Date:** December 31, 2025
**Audit:** Comprehensive Security Audit
**Repository:** https://github.com/Luntra-HQ/propiq

---

## 📊 Summary Statistics

**Total Issues Created:** 13

| Severity | Count | Timeline |
|----------|-------|----------|
| 🔴 **Critical** | 1 | Fix within 24 hours |
| 🟠 **High** | 5 | Fix within 7-14 days |
| 🟡 **Medium** | 6 | Fix within 30-60 days |
| 🔧 **Infrastructure** | 1 | Preventive measure |

**Total Estimated Effort:** ~60 hours (7-8 working days)

---

## 🔴 CRITICAL PRIORITY (P0)

### Issue #5: CONVEX_DEPLOY_KEY Exposed in .env.local
- **URL:** https://github.com/Luntra-HQ/propiq/issues/5
- **Priority:** P0 - Fix within 24 hours
- **Effort:** 2 hours
- **Risk:** Complete backend compromise
- **Action:**
  1. Verify not in git history
  2. Rotate key in Convex dashboard
  3. Update .env.local
  4. Delete old key

**Due:** January 1, 2026

---

## 🟠 HIGH PRIORITY (P1)

### Issue #6: Overly Permissive CORS Configuration
- **URL:** https://github.com/Luntra-HQ/propiq/issues/6
- **File:** `convex/http.ts:39`
- **Priority:** P1
- **Effort:** 4 hours
- **Fix:** Replace `"*"` with origin whitelist

### Issue #7: Session Tokens in localStorage (XSS Risk)
- **URL:** https://github.com/Luntra-HQ/propiq/issues/7
- **File:** `frontend/src/hooks/useAuth.tsx:21`
- **Priority:** P1
- **Effort:** 6 hours
- **Fix:** Add CSP headers, reduce token lifetime

### Issue #8: No Rate Limiting on Authentication Endpoints
- **URL:** https://github.com/Luntra-HQ/propiq/issues/8
- **File:** `convex/http.ts:121-172`
- **Priority:** P1
- **Effort:** 8 hours
- **Fix:** Implement IP and email-based rate limiting

### Issue #9: Chrome Extension postMessage Security
- **URL:** https://github.com/Luntra-HQ/propiq/issues/9
- **File:** `frontend/src/hooks/useAuth.tsx:217`
- **Priority:** P1
- **Effort:** 4 hours
- **Fix:** Change `targetOrigin` from `'*'` to `window.location.origin`

### Issue #10: Complete Stripe API Key Rotation
- **URL:** https://github.com/Luntra-HQ/propiq/issues/10
- **Reference:** Dec 30, 2025 audit
- **Priority:** P1
- **Effort:** 2 hours
- **Fix:** Complete key rotation started in previous audit

**P1 Total Effort:** ~24 hours (3 days)

---

## 🟡 MEDIUM PRIORITY

### Issue #11: Missing Content Security Policy Headers
- **URL:** https://github.com/Luntra-HQ/propiq/issues/11
- **Files:** `frontend/index.html`, `convex/http.ts`
- **Effort:** 4 hours
- **Fix:** Add CSP meta tag and security headers

### Issue #12: Sensitive Data in Error Messages
- **URL:** https://github.com/Luntra-HQ/propiq/issues/12
- **Files:** Multiple (auth, payments)
- **Effort:** 4 hours
- **Fix:** Use generic error messages, error codes

### Issue #13: Token Lifetime Too Long (30 days → 7 days)
- **URL:** https://github.com/Luntra-HQ/propiq/issues/13
- **File:** `convex/http.ts:157`
- **Effort:** 6 hours
- **Fix:** Reduce to 7 days, add auto-refresh

### Issue #14: Insufficient Security Event Logging
- **URL:** https://github.com/Luntra-HQ/propiq/issues/14
- **Files:** Multiple
- **Effort:** 16 hours
- **Fix:** Build comprehensive audit log system

### Issue #15: Insufficient Password Validation Feedback
- **URL:** https://github.com/Luntra-HQ/propiq/issues/15
- **File:** `convex/auth.ts:27-55`
- **Effort:** 3 hours
- **Fix:** Return all errors, add strength meter

### Issue #16: No HTTPS Enforcement in Development
- **URL:** https://github.com/Luntra-HQ/propiq/issues/16
- **File:** `frontend/src/hooks/useAuth.tsx:18`
- **Effort:** 1 hour
- **Fix:** Add HTTPS validation in production

**Medium Total Effort:** ~34 hours (4-5 days)

---

## 🔧 INFRASTRUCTURE / PREVENTION

### Issue #17: Implement Automated Secret Scanning
- **URL:** https://github.com/Luntra-HQ/propiq/issues/17
- **Type:** Security tooling
- **Effort:** 3 hours (setup + training)
- **Tools:**
  - git-secrets
  - GitHub secret scanning
  - pre-commit hooks
- **Impact:** Prevents 90%+ of future secret leaks

---

## 📅 Recommended Timeline

### Week 1 (Jan 1-7, 2026) - CRITICAL + HIGH
**Focus:** Immediate security gaps

| Day | Tasks | Hours |
|-----|-------|-------|
| Day 1 | #5: Rotate deploy key | 2h |
| Day 2 | #6: Fix CORS, #9: Fix postMessage | 6h |
| Day 3 | #7: Add CSP, reduce token lifetime | 6h |
| Day 4 | #10: Complete Stripe rotation | 2h |
| Day 5 | #8: Implement rate limiting (Part 1) | 8h |

**Week 1 Total:** ~24 hours

### Week 2 (Jan 8-14, 2026) - HIGH completion
| Day | Tasks | Hours |
|-----|-------|-------|
| Day 6 | #8: Rate limiting (Part 2) | 4h |
| Day 7 | #17: Setup git-secrets | 3h |

**Week 2 Total:** ~7 hours

### Weeks 3-4 (Jan 15-31, 2026) - MEDIUM priority
| Week | Tasks | Hours |
|------|-------|-------|
| Week 3 | #11: CSP headers, #12: Error messages | 8h |
| Week 4 | #13: Token lifetime, #15: Password UX | 9h |

**Weeks 3-4 Total:** ~17 hours

### Month 2 (Feb 2026) - Long-term MEDIUM
| Task | Hours |
|------|-------|
| #14: Audit logging system | 16h |
| #16: HTTPS enforcement | 1h |

**Month 2 Total:** ~17 hours

---

## 🎯 Sprint Milestones

### Sprint 1: Critical Security Fixes (Week 1)
**Goal:** Eliminate critical and high-severity vulnerabilities
**Issues:** #5, #6, #7, #9, #10
**Success Criteria:**
- [ ] No exposed credentials
- [ ] CORS properly restricted
- [ ] CSP headers active
- [ ] postMessage secured
- [ ] Stripe keys rotated

### Sprint 2: Security Hardening (Weeks 2-4)
**Goal:** Implement defense-in-depth measures
**Issues:** #8, #11, #12, #13, #15, #16, #17
**Success Criteria:**
- [ ] Rate limiting active
- [ ] git-secrets installed
- [ ] Error messages sanitized
- [ ] Token lifetime reduced
- [ ] Password UX improved

### Sprint 3: Monitoring & Compliance (Month 2)
**Goal:** Long-term security operations
**Issues:** #14
**Success Criteria:**
- [ ] Audit logging system
- [ ] Security monitoring
- [ ] Compliance tracking

---

## 📋 Quick Reference

### By Priority
- **P0 (24h):** #5
- **P1 (7 days):** #6, #7, #8, #9, #10
- **Medium (30 days):** #11, #12, #13, #15, #16
- **Medium (60 days):** #14
- **Infrastructure:** #17

### By Component
- **Backend (Convex):** #5, #6, #8, #10, #12, #13, #14, #15
- **Frontend:** #7, #9, #11, #16
- **Infrastructure:** #17
- **Chrome Extension:** #9 (integration point)

### By Estimated Effort
- **Quick wins (<2h):** #5, #10, #16
- **Medium (2-6h):** #6, #7, #9, #11, #12, #13, #15, #17
- **Large (8-16h):** #8, #14

---

## ✅ Verification Checklist

After completing all issues:

### Security Posture
- [ ] No secrets in codebase or git history
- [ ] CORS properly configured
- [ ] CSP headers implemented
- [ ] Rate limiting on auth endpoints
- [ ] Tokens expire in 7 days
- [ ] postMessage uses specific origin
- [ ] All API keys rotated
- [ ] git-secrets installed and active

### Monitoring
- [ ] Security event logging operational
- [ ] Failed login tracking
- [ ] Suspicious activity detection
- [ ] Audit trail for sensitive actions

### Documentation
- [ ] Security practices documented
- [ ] Team trained on git-secrets
- [ ] Incident response plan created
- [ ] Key rotation schedule established

### Compliance
- [ ] HTTPS everywhere
- [ ] Error messages sanitized
- [ ] User data protection verified
- [ ] Access controls documented

---

## 🚀 Getting Started

### For Team Lead
1. Review all issues: https://github.com/Luntra-HQ/propiq/labels/security
2. Assign issues to team members
3. Schedule security sprint kickoff
4. Set up daily standups for Week 1 (critical fixes)

### For Developers
1. Read comprehensive audit: `COMPREHENSIVE_SECURITY_AUDIT_REPORT.md`
2. Start with issue #5 (CRITICAL)
3. Follow issue instructions and code examples
4. Test thoroughly before marking complete
5. Document any additional findings

### For DevOps
1. Prepare for key rotations (#5, #10)
2. Set up monitoring for security events
3. Review deployment configurations
4. Assist with git-secrets rollout (#17)

---

## 📞 Support & Questions

**Security Concerns:** brian@luntra.one
**Audit Report:** `COMPREHENSIVE_SECURITY_AUDIT_REPORT.md`
**GitHub Issues:** https://github.com/Luntra-HQ/propiq/labels/security
**Next Review:** March 31, 2026 (quarterly)

---

## 📈 Success Metrics

Track progress with these metrics:

| Metric | Current | Target |
|--------|---------|--------|
| Open Critical Issues | 1 | 0 |
| Open High Issues | 5 | 0 |
| Open Medium Issues | 6 | 3 |
| Security Score | 62/100 | 85/100 |
| Days Since Last Key Rotation | ~30 | 0 |
| Failed Login Tracking | No | Yes |
| Secret Scanning | No | Yes |
| CSP Implemented | No | Yes |
| Rate Limiting | No | Yes |

**Target Date for 85/100 Score:** January 31, 2026

---

**Summary Created:** December 31, 2025
**Issues Created:** #5 through #17
**Total Issues:** 13
**Repository:** https://github.com/Luntra-HQ/propiq
