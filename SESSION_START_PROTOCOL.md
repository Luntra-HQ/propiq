# Session Start Protocol (PropIQ)

**Objective:** Ensure alignment with current state and prevent redundant work.

## 1. Context Synchronization
- [ ] Read `CLAUDE.md`
- [ ] Read the last 3 entries in `SESSION_LOG.md`
- [ ] Run `git log -n 5 --oneline` to see recent physical changes

## 2. State Verification
- [ ] Run `npm run test` (or specific Playwright smoke tests)
- [ ] Verify production health: `curl -I https://propiq.luntra.one`
- [ ] Check Convex deployment status

## 3. Alignment Proposal
**STOP:** Before writing code, output a "Session Plan" in this format:

**Current Goal:** (One sentence)

**Files to Modify:** (List)

**Existing Patterns to Follow:** (List relevant ADRs or existing components)

**Potential Risks:** (Impact on Auth/Payments/Core Analysis)

**WAIT FOR USER APPROVAL BEFORE PROCEEDING.**
