# Pre-Deployment Checklist

**Objective:** Zero-regression deployments.

## 1. Technical Validation
- [ ] **Linting:** `npm run lint` passes
- [ ] **Type Check:** `tsc --noEmit` passes
- [ ] **Tests:** Run `npx playwright test`
      *Requirement:* All critical test files must pass. Capture summary output.

## 2. Critical Path Verification
- [ ] Manual/Automated check of `auth` flow
- [ ] Manual/Automated check of `Stripe` checkout session creation

## 3. Evidence of Success
**STOP:** Provide the user with:
1. Terminal output summary of the test run
2. A summary of schema changes (if any)
3. Confirm: "I have verified this does not bypass existing ADRs."

**WAIT FOR USER APPROVAL TO DEPLOY.**
