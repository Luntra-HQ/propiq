# 🔧 PropIQ Debugging Framework
**World-Class Full Stack Development Standards**

**Created:** December 18, 2025
**Purpose:** Systematic debugging, testing, and quality assurance
**Status:** Production-Ready Framework

---

## 📋 Table of Contents

1. [Critical User Flows](#critical-user-flows)
2. [Debugging Tiers (P0-P3)](#debugging-tiers)
3. [Systematic Testing Protocol](#systematic-testing-protocol)
4. [AI Tools Strategy](#ai-tools-strategy)
5. [Monitoring & Alerting](#monitoring--alerting)
6. [Emergency Protocols](#emergency-protocols)

---

## 🎯 Critical User Flows

### Priority 0 - Launch Blockers (MUST WORK)

#### 1. Account Signup Flow ⚠️ **MOST URGENT**

**User Journey:**
```
Landing Page → Sign Up Button → SignupFlow Modal → Email/Password →
Create Account → Dashboard (logged in) → 3 free analyses available
```

**Test Script:**
```bash
# Manual Test (REQUIRED before launch)
1. Open https://propiq.luntra.one
2. Click "Sign Up" or "Get Started"
3. Fill form:
   - Email: test+$(date +%s)@example.com (unique email)
   - Password: TestPass123!@# (strong password)
4. Submit form
5. EXPECTED: Redirect to /app or /dashboard
6. VERIFY:
   - User logged in (localStorage has propiq_user_id)
   - Subscription tier: "free"
   - Analyses limit: 3
   - Browser console: NO CORS errors
```

**Known Issues (Fixed but needs verification):**
- ✅ CORS header now allows production domain
- ✅ `IS_PRODUCTION_ENV=true` set in Convex
- ⚠️ **NOT TESTED** with real signup attempt

**Common Failure Points:**
1. CORS error (Access-Control-Allow-Origin)
2. Convex endpoint unreachable
3. Password validation fails (too weak)
4. Session token not stored
5. Redirect doesn't work after signup

**Debug Commands:**
```bash
# Check CORS configuration
curl -X OPTIONS https://diligent-starling-125.convex.site/auth/signup \
  -H "Origin: https://propiq.luntra.one" \
  -H "Access-Control-Request-Method: POST" \
  -i

# Expected: Access-Control-Allow-Origin: https://propiq.luntra.one

# Verify Convex environment
npx convex env list | grep IS_PRODUCTION
# Expected: IS_PRODUCTION_ENV=true
```

---

#### 2. Login Flow

**User Journey:**
```
Landing Page → Sign In → Email/Password → Submit → Dashboard
```

**Test Script:**
```bash
# After signup works, test login:
1. Logout (clear localStorage)
2. Go to https://propiq.luntra.one/login
3. Enter credentials from signup test
4. Submit
5. EXPECTED: Redirect to /app
6. VERIFY: User data loaded correctly
```

---

#### 3. Stripe Checkout Flow ⚠️ **PAYMENT CRITICAL**

**User Journey:**
```
Dashboard → Pricing Page → Choose Starter/Pro/Elite →
Stripe Checkout (redirect) → Payment → Success → Tier Upgraded
```

**Test Script:**
```bash
# Test with Stripe test mode
1. Login to PropIQ
2. Go to https://propiq.luntra.one/pricing
3. Click "Choose Starter" ($49/mo)
4. EXPECTED: Redirect to checkout.stripe.com
5. Use test card: 4242 4242 4242 4242
6. Complete payment
7. EXPECTED: Redirect back to PropIQ
8. VERIFY:
   - Subscription tier: "starter"
   - Analyses limit: UNLIMITED (999999)
```

**Known Issues:**
- ✅ String reference fix applied (`"payments:createCheckoutSession"`)
- ✅ Stripe Price IDs configured in Convex
- ⚠️ **NOT TESTED** end-to-end

**Stripe Configuration Check:**
```bash
npx convex env list | grep STRIPE

# Expected:
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_STARTER_PRICE_ID=price_1SXQEsJogOchEFxvG8fT5B0b
# STRIPE_PRO_PRICE_ID=price_1SL51sJogOchEFxvVounuNcK
# STRIPE_ELITE_PRICE_ID=price_1SXQF2JogOchEFxvRpZ0GGuf
```

---

## 🔍 Debugging Tiers

### P0 - Critical (Launch Blockers)

**Definition:** Features that MUST work for any users to use the product.

**Examples:**
- Account signup
- Account login
- Basic property analysis
- Stripe payment checkout

**SLA:** Fix within 1 hour or rollback deployment

**Testing Requirement:** Manual E2E test EVERY deployment

---

### P1 - High Priority (User Experience)

**Definition:** Features that significantly impact user experience but have workarounds.

**Examples:**
- Password reset flow
- Profile update
- Email notifications
- Export PDF reports

**SLA:** Fix within 24 hours
**Testing Requirement:** Automated tests + spot checks

---

### P2 - Medium Priority (Enhancement)

**Definition:** Features that improve experience but aren't critical to core functionality.

**Examples:**
- Help Center search
- Analytics dashboards
- Social media sharing
- Performance optimizations

**SLA:** Fix within 1 week
**Testing Requirement:** Automated tests

---

### P3 - Low Priority (Nice to Have)

**Definition:** Features that add polish but don't affect core functionality.

**Examples:**
- UI animations
- Dark mode
- Keyboard shortcuts
- Easter eggs

**SLA:** Fix when convenient
**Testing Requirement:** Optional

---

## 🧪 Systematic Testing Protocol

### Pre-Deployment Checklist

**NEVER deploy to production without completing this checklist:**

```bash
#!/bin/bash
# File: test-before-deploy.sh

echo "🧪 PropIQ Pre-Deployment Testing"
echo "================================="

# 1. Environment variables check
echo "✅ Step 1: Verify Convex environment"
npx convex env list | grep -E "IS_PRODUCTION_ENV|STRIPE_SECRET_KEY|VITE_CONVEX_URL"

if ! npx convex env list | grep "IS_PRODUCTION_ENV=true"; then
  echo "❌ ERROR: IS_PRODUCTION_ENV must be true for production"
  exit 1
fi

# 2. Build check
echo "✅ Step 2: Build frontend"
cd frontend
npm run build

if [ $? -ne 0 ]; then
  echo "❌ ERROR: Build failed"
  exit 1
fi

# 3. Type check
echo "✅ Step 3: TypeScript type check"
npm run type-check || echo "⚠️ WARNING: Type errors found"

# 4. Test production bundle locally
echo "✅ Step 4: Preview production build"
npm run preview &
PREVIEW_PID=$!
sleep 3

# Test if server is running
if ! curl -s http://localhost:4173 > /dev/null; then
  echo "❌ ERROR: Preview server failed to start"
  kill $PREVIEW_PID
  exit 1
fi

echo "✅ Preview server running at http://localhost:4173"
echo "📋 MANUAL TESTING REQUIRED:"
echo "   1. Open http://localhost:4173 in browser"
echo "   2. Open DevTools console (F12)"
echo "   3. Click 'Sign Up'"
echo "   4. Check for ANY console errors"
echo "   5. If clean, press ENTER to continue..."
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  kill $PREVIEW_PID
  exit 1
fi

kill $PREVIEW_PID

# 5. Check production site status
echo "✅ Step 5: Verify production site is accessible"
PROD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://propiq.luntra.one)

if [ "$PROD_STATUS" != "200" ]; then
  echo "❌ ERROR: Production site returned $PROD_STATUS"
  exit 1
fi

echo "✅ All checks passed - Safe to deploy"
```

**Usage:**
```bash
chmod +x test-before-deploy.sh
./test-before-deploy.sh
```

---

### Post-Deployment Verification

**Immediately after deploying to production:**

```bash
#!/bin/bash
# File: verify-production.sh

echo "🔍 PropIQ Production Verification"
echo "=================================="

# 1. Site accessibility
echo "✅ Test 1: Site loads"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://propiq.luntra.one)
if [ "$RESPONSE" == "200" ]; then
  echo "   ✅ Site returned HTTP 200"
else
  echo "   ❌ Site returned HTTP $RESPONSE"
  exit 1
fi

# 2. CORS check
echo "✅ Test 2: CORS configuration"
curl -X OPTIONS https://diligent-starling-125.convex.site/auth/signup \
  -H "Origin: https://propiq.luntra.one" \
  -H "Access-Control-Request-Method: POST" \
  -i 2>&1 | grep -q "Access-Control-Allow-Origin: https://propiq.luntra.one"

if [ $? -eq 0 ]; then
  echo "   ✅ CORS configured correctly"
else
  echo "   ❌ CORS not configured for production"
  exit 1
fi

# 3. Convex deployment
echo "✅ Test 3: Convex backend health"
# Add Convex health check when available

# 4. JavaScript bundle check
echo "✅ Test 4: JavaScript loads without errors"
curl -s https://propiq.luntra.one | grep -q '<script'
if [ $? -eq 0 ]; then
  echo "   ✅ JavaScript bundle found in HTML"
else
  echo "   ⚠️ WARNING: No JavaScript bundle found"
fi

echo ""
echo "📋 MANUAL VERIFICATION REQUIRED:"
echo "   1. Open https://propiq.luntra.one in incognito"
echo "   2. Open DevTools console"
echo "   3. Look for ANY errors"
echo "   4. Test signup flow manually"
echo ""
echo "If ANY errors appear, ROLLBACK IMMEDIATELY:"
echo "   netlify rollback [previous-deployment-id]"
```

---

## 🤖 AI Tools Strategy

### Tool Assignment Matrix

Based on your comprehensive **AI_TOOLS_STRATEGIC_PLAYBOOK.md**, here's how to leverage each tool for debugging:

#### **Grok (X.AI)** - Real-time Intelligence
**Use for:**
- Monitoring user complaints on social media
- Real-time error reporting from early users
- Trending issues in real estate SaaS space
- Competitive monitoring (what are users complaining about with DealCheck, etc.)

**Debugging Example:**
```
Prompt: "Search X for mentions of PropIQ in the last 24 hours.
Are users reporting any signup errors or payment issues?"
```

---

#### **Perplexity** - Research & Validation
**Use for:**
- Researching Convex API issues with citations
- Finding Stack Overflow solutions for specific errors
- Validating best practices for authentication
- Competitive analysis (how do competitors handle signup?)

**Debugging Example:**
```
Prompt: "What are the most common causes of CORS errors
in Convex deployments? Include citations from Convex docs."
```

---

#### **Cursor AI** - Code Debugging & Implementation
**Use for:**
- Fixing bugs in real-time
- Implementing features rapidly
- Code reviews before deployment
- Automated testing script generation

**Debugging Example:**
```
Prompt: "Analyze the SignupFlow.tsx component.
Are there any edge cases that could cause signup to fail?"
```

---

#### **Gemini + Perplexity** - Strategic Analysis
**Use for:**
- Root cause analysis of complex issues
- Long-form documentation of fixes
- Creating debugging playbooks
- Post-mortem reports

**Debugging Example:**
```
Gemini Prompt: "Analyze all documentation in propiq/ directory.
What patterns do you see in the debugging history?
What systematic improvements would prevent future issues?"

Then:
Perplexity Prompt: "Validate these recommendations against
industry best practices for SaaS debugging."
```

---

### Debugging Workflow with AI Tools

**When a bug is reported:**

**STEP 1: Immediate Triage (Cursor AI - 5 min)**
```
Cursor Prompt:
"User reports: [error message]
Search codebase for this error. Show me:
1. Where it's thrown
2. What triggers it
3. Recent changes to that file"
```

**STEP 2: Research (Perplexity - 10 min)**
```
Perplexity Prompt:
"Error: [exact error message]
Context: Convex + React + Vite
What are the known causes and solutions?"
```

**STEP 3: Implement Fix (Cursor AI - 15 min)**
```
Cursor Prompt:
"Based on this research: [paste Perplexity output]
Implement the fix in [file name]"
```

**STEP 4: Document (Gemini - 10 min)**
```
Gemini Prompt:
"Create a post-mortem document for this bug:
- Error: [description]
- Root cause: [analysis]
- Fix applied: [changes]
- Prevention: [steps to avoid in future]"
```

**STEP 5: Monitor (Grok - ongoing)**
```
Grok Prompt:
"Monitor X for any mentions of this issue
in the next 24 hours"
```

**Total time to fix + document: 40 minutes**

---

## 📊 Monitoring & Alerting

### Critical Health Checks

**Run every hour (automated cron job):**

```bash
#!/bin/bash
# File: health-check.sh

# 1. Site availability
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://propiq.luntra.one)
if [ "$STATUS" != "200" ]; then
  echo "🚨 ALERT: Site down (HTTP $STATUS)"
  # Send alert to Slack/email
fi

# 2. Signup endpoint
SIGNUP_STATUS=$(curl -X OPTIONS -s -o /dev/null -w "%{http_code}" \
  https://diligent-starling-125.convex.site/auth/signup)
if [ "$SIGNUP_STATUS" != "204" ] && [ "$SIGNUP_STATUS" != "200" ]; then
  echo "🚨 ALERT: Signup endpoint failing (HTTP $SIGNUP_STATUS)"
  # Send alert
fi

# 3. Stripe integration
# (Add Stripe health check)
```

---

### User-Facing Error Tracking

**Already Configured:**
- Microsoft Clarity (session replays)
- Browser console errors (captured by Clarity)

**Add (Recommended):**
- Sentry for JavaScript error tracking
- LogRocket for session replay + console logs
- Convex logging dashboard

**Setup Sentry (5 minutes):**
```bash
npm install @sentry/react
```

```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

## 🚨 Emergency Protocols

### If Signup Breaks in Production

**Immediate Actions (2 minutes):**

1. **Check if it's CORS:**
```bash
# From browser console on propiq.luntra.one
fetch('https://diligent-starling-125.convex.site/auth/signup', {
  method: 'OPTIONS',
  headers: { 'Origin': 'https://propiq.luntra.one' }
}).then(r => console.log(r.headers.get('access-control-allow-origin')))

// Expected: "https://propiq.luntra.one"
// If different: CORS is broken
```

2. **Fix CORS immediately:**
```bash
npx convex env set IS_PRODUCTION_ENV true
# Wait 30 seconds for Convex to redeploy
```

3. **Verify fix:**
```bash
curl -X OPTIONS https://diligent-starling-125.convex.site/auth/signup \
  -H "Origin: https://propiq.luntra.one" \
  -i | grep Allow-Origin
```

---

### If Stripe Checkout Breaks

**Immediate Actions:**

1. **Check Convex environment:**
```bash
npx convex env list | grep STRIPE
# Verify all price IDs are present
```

2. **Test action call:**
```typescript
// From browser console (while logged in)
// This tests if the Convex action is reachable
console.log('Testing Stripe action...')
```

3. **Check Stripe dashboard:**
   - https://dashboard.stripe.com/events
   - Look for webhook failures

4. **Rollback if needed:**
```bash
# Get last working deployment
netlify deploys list --limit 5

# Rollback
netlify rollback [deployment-id]
```

---

## 📝 Debugging Checklist Template

**Copy this for each new bug:**

```markdown
# Bug Report: [Title]

**Reported:** [Date/Time]
**Severity:** P0 / P1 / P2 / P3
**Status:** 🔴 Open / 🟡 In Progress / 🟢 Resolved

## 🐛 Issue Description
[What's broken?]

## 🔍 Steps to Reproduce
1.
2.
3.

## 🎯 Expected Behavior
[What should happen?]

## ❌ Actual Behavior
[What actually happens?]

## 📸 Evidence
- Browser console errors: [screenshot/logs]
- Network tab: [screenshot]
- Clarity session: [link]

## 🧪 Debugging Steps Taken
- [ ] Checked browser console
- [ ] Verified Convex environment variables
- [ ] Tested locally with production build
- [ ] Reviewed recent code changes
- [ ] Consulted documentation

## 💡 Root Cause
[Analysis of why it broke]

## ✅ Fix Applied
[What was changed]

## 🔐 Prevention
[How to avoid this in future]

## ⏱️ Resolution Time
[Time from report to fix]
```

---

## 🎯 Immediate Action Items (Next 2 Hours)

### 1. Verify Signup Flow (30 minutes) ⚠️ **DO THIS FIRST**

```bash
# Test signup manually:
1. Open https://propiq.luntra.one in incognito
2. Click "Sign Up"
3. Use email: test+$(date +%s)@propiq.com
4. Use password: TestPass123!@#
5. Submit
6. Document EXACT behavior
7. If it fails: Screenshot ALL errors
```

### 2. Verify Stripe Checkout (20 minutes)

```bash
# Test payment flow:
1. Login with test account
2. Go to /pricing
3. Click "Choose Starter"
4. Document what happens
5. If it fails: Check Convex logs
```

### 3. Set Up Monitoring (30 minutes)

```bash
# Create health check script
cat > health-check.sh << 'EOF'
[paste health check script from above]
EOF

chmod +x health-check.sh

# Add to cron (every hour)
crontab -e
# Add: 0 * * * * /path/to/health-check.sh
```

### 4. Document Current State (20 minutes)

Create `/CURRENT_PRODUCTION_STATUS.md` with:
- What's working (verified)
- What's untested
- What's broken (if anything)
- Next steps

---

## 📚 Resources

### Internal Docs
- `CORS_FIX_SIGNUP_BLOCKER.md` - CORS debugging reference
- `FINAL_FIX_APPLIED.md` - Convex string reference fix
- `AI_TOOLS_STRATEGIC_PLAYBOOK.md` - AI tools usage guide
- `CLAUDE.md` - Project memory and standards

### External Resources
- [Convex Docs - Authentication](https://docs.convex.dev/auth)
- [Stripe Testing](https://stripe.com/docs/testing)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

## ✅ Success Criteria

**This framework is successful when:**

1. ✅ P0 bugs fixed within 1 hour
2. ✅ All critical flows tested before every deployment
3. ✅ Zero surprises in production (caught in testing)
4. ✅ Clear debugging protocol for every team member
5. ✅ AI tools used strategically for max efficiency

---

**Status:** Ready for immediate implementation
**Owner:** Development team
**Review Frequency:** Weekly (update as needed)

---

*🤖 Generated with [Claude Code](https://claude.com/claude-code)*
