# Test Enforcement Setup - PropIQ

**Date:** January 5, 2026
**Status:** ✅ ACTIVE

---

## Summary

This document explains the 3-layer test enforcement system that **prevents broken code from reaching production**.

## Why This Exists

**The Problem:**
- Login/signup broke in production after code changes
- No automated testing before deployments
- Weeks of work lost when changes weren't tested first

**The Solution:**
- Automatic test enforcement at 3 levels
- Impossible to deploy if critical tests fail
- Works automatically, forever (no human intervention needed)

---

## Layer 1: GitHub Actions (Cloud)

**What:** Runs tests automatically on GitHub's servers when you push code
**Where:** `.github/workflows/ci.yml`
**When:** Every push to `main` branch

**Tests Run:**
- `tests/user-signup-integration.spec.ts` - Signup flow
- `tests/password-reset.spec.ts` - Password reset flow
- `npm run build` - Build succeeds

**What Happens:**
- ✅ Tests pass → Green checkmark on GitHub
- ❌ Tests fail → Red X, blocks merge

**View Results:**
- Go to: https://github.com/Luntra-HQ/propiq/actions
- See test reports and artifacts

---

## Layer 2: Netlify Build Checks (Deployment)

**What:** Runs tests before EVERY deployment to production
**Where:** `frontend/netlify.toml`
**When:** Every time Netlify tries to deploy

**Tests Run (in this order):**
1. Install dependencies
2. Install Playwright browser
3. Run auth tests (signup + password reset)
4. If tests pass → Build frontend
5. If build succeeds → Deploy to production

**What Happens:**
- ✅ Tests pass → Deployment proceeds
- ❌ Tests fail → **Deployment blocked** (no bypass possible)

**Why This Matters:**
- Even if you bypass GitHub Actions, Netlify still blocks broken deploys
- No way to accidentally deploy broken code
- Tests run in Netlify's environment (not just local)

---

## Layer 3: Pre-commit Hook (Local - Optional)

**What:** Runs tests on your machine before allowing commits
**Where:** `.git/hooks/pre-commit-tests`
**When:** When you run `git commit`

**Status:** Currently DISABLED (optional)

**To Enable:**
```bash
cd /Users/briandusape/Projects/propiq
ln -sf ../../.git/hooks/pre-commit-tests .git/hooks/pre-commit
```

**To Bypass (if needed):**
```bash
git commit --no-verify
```

**Why Optional:**
- GitHub Actions and Netlify already enforce tests
- Can slow down local development
- Enable if you want extra safety

---

## How It Works (Flow Diagram)

```
1. You make code changes
   ↓
2. git commit (pre-commit hook runs - optional)
   ↓
3. git push origin main
   ↓
4. GitHub Actions runs tests (automatic)
   ├─ ✅ Pass → Green checkmark
   └─ ❌ Fail → Red X, blocks merge
   ↓
5. You deploy to Netlify
   ↓
6. Netlify runs tests (automatic)
   ├─ ✅ Pass → Build → Deploy
   └─ ❌ Fail → DEPLOYMENT BLOCKED
```

---

## What Tests Are Enforced

**Critical Auth Tests (ALWAYS RUN):**
1. `tests/user-signup-integration.spec.ts`
   - Tests user signup via REST API
   - Validates user creation in MongoDB
   - Ensures JWT token generation works

2. `tests/password-reset.spec.ts`
   - Tests password reset request
   - Validates reset token generation
   - Ensures password change succeeds

**Build Test (ALWAYS RUN):**
- `npm run build` - Ensures frontend builds without errors

---

## For Future Claude Code Sessions

**Every new Claude Code conversation will:**
1. Load `CLAUDE.md` automatically
2. See the "🚨 TEST ENFORCEMENT POLICY" section at the top
3. Know to NEVER deploy without running tests
4. Follow the documented test procedures

**CLAUDE.md contains:**
- Test enforcement rules
- List of required tests
- Commands to run tests
- Emergency override procedure

---

## Testing the Enforcement

**To verify GitHub Actions works:**
1. Go to: https://github.com/Luntra-HQ/propiq/actions
2. Find the latest workflow run
3. Should show: "Run Tests & Build" with green checkmark

**To verify Netlify enforcement works:**
1. Make a code change
2. Commit and push
3. Netlify will run tests before deploying
4. Check Netlify deploy logs at: https://app.netlify.com/projects/propiq-ai-platform/deploys

---

## When Tests Fail

**GitHub Actions Fails:**
- Check: https://github.com/Luntra-HQ/propiq/actions
- Click the failed run
- See which test failed
- Fix the code or fix the test
- Push again

**Netlify Deploy Fails:**
- Check Netlify deploy logs
- Search for "Running critical auth tests"
- See which test failed
- Fix locally, then push again

**What NOT to Do:**
- ❌ Don't bypass tests with `--no-verify` unless emergency
- ❌ Don't disable test enforcement in netlify.toml
- ❌ Don't remove tests from GitHub Actions workflow

---

## Emergency Override

**If you MUST deploy with failing tests:**

1. **Document why in commit message:**
   ```
   fix: emergency hotfix for critical bug

   TESTS FAILING: user-signup-integration.spec.ts
   REASON: Test environment issue, not code issue
   VERIFIED: Tested manually in production
   FOLLOW-UP: GitHub issue #123 to fix tests
   ```

2. **Create GitHub issue immediately**
3. **Fix within 24 hours**

**To bypass Netlify tests (NOT RECOMMENDED):**
- Edit `frontend/netlify.toml`
- Remove the test commands (but this defeats the purpose)
- Deploy
- **Immediately re-enable tests after deploy**

---

## Monitoring

**Check if enforcement is working:**

```bash
# 1. Check GitHub Actions status
curl -s https://api.github.com/repos/Luntra-HQ/propiq/actions/runs | jq '.workflow_runs[0] | {status, conclusion}'

# 2. Check Netlify deploy status
npx netlify status

# 3. Verify netlify.toml has tests
grep -A 5 "Running critical auth tests" frontend/netlify.toml
```

---

## Files Modified

**Created:**
- `.github/workflows/ci.yml` - GitHub Actions workflow
- `.git/hooks/pre-commit-tests` - Local pre-commit hook
- `TEST_ENFORCEMENT_SETUP.md` - This file

**Modified:**
- `frontend/netlify.toml` - Added test commands to build process
- `CLAUDE.md` - Added test enforcement policy section

---

## Benefits

✅ **Prevents production breakages** - Tests must pass before deploy
✅ **Automatic enforcement** - No human needed, runs forever
✅ **Visible failures** - Clear logs showing what broke
✅ **Multi-layer safety** - GitHub + Netlify both enforce
✅ **Future-proof** - Works in all Claude Code sessions
✅ **Documented** - CLAUDE.md ensures compliance

---

## Next Steps

**Immediate:**
1. ✅ GitHub Actions is active - check https://github.com/Luntra-HQ/propiq/actions
2. ✅ Netlify enforcement is active - next deploy will run tests
3. ✅ CLAUDE.md updated - future sessions will see policy

**Optional:**
- Enable local pre-commit hook (see Layer 3 above)
- Add more tests to the enforcement list
- Set up Slack notifications for test failures

---

## Questions?

**How do I know tests are running?**
- GitHub Actions: Check https://github.com/Luntra-HQ/propiq/actions
- Netlify: Check deploy logs at https://app.netlify.com/projects/propiq-ai-platform/deploys

**Can I add more tests?**
- Yes! Edit `.github/workflows/ci.yml` and `frontend/netlify.toml`

**What if tests are flaky?**
- Fix the tests (flaky tests are worse than no tests)
- Don't disable enforcement

**Can I disable this?**
- Technically yes, but **don't**
- That defeats the entire purpose
- Tests exist to protect you

---

**Last Updated:** January 5, 2026
**Status:** Active and enforced on all deployments
