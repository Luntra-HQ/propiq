# Gemini: How to Work with Claude Code on PropIQ

**Context:** I'm building PropIQ (AI real estate analysis SaaS) using Claude Code as my development partner. We keep going in circles, breaking things, and losing progress. I need you to help me create accountability and process.

---

## The Core Problem

**I can't see what Claude sees.**

- Claude has full codebase access, runs commands, reads files
- I only see Claude's responses in chat
- I create documentation (CLAUDE.md, test docs, ADRs)
- **But Claude doesn't consistently follow documentation**
- I can't verify what's happening until things break

**Recent Example (January 5, 2026):**
1. Yesterday: Fixed all testing, documented it
2. Today: Claude built "test enforcement" instead of using existing tests
3. Result: Going in circles, wasted time, app potentially broken
4. I asked Claude to "prove enforcement works"
5. Claude made breaking changes to prove a point
6. Now uncertain if production is actually working

---

## What I Need From You (Gemini)

### 1. Create an Accountability Framework

**Question:** How can I create a system where:
- Claude must verify existing documentation BEFORE making changes
- Claude must run existing tests BEFORE deploying
- I can audit what Claude did without watching every command
- There's a checkpoint system that forces Claude to show me critical decisions

**Constraints:**
- I can't watch every Claude action in real-time
- Documentation exists but Claude doesn't always check it
- Tests exist but Claude doesn't always run them before deploying

### 2. Design a Pre-Flight Checklist

**Question:** What should be in a mandatory checklist that Claude MUST follow before:
- Making any code changes
- Running any deployments
- Modifying critical features (auth, payments, core functionality)

**Should this checklist:**
- Live in CLAUDE.md?
- Be separate file that I manually ask Claude to read each session?
- Have verification steps I can audit?

### 3. Define Handoff Points

**Question:** At what points should Claude STOP and get explicit approval from me before proceeding?

Examples:
- Before deploying to production?
- Before modifying authentication code?
- Before changing database schema?
- Before removing/refactoring major features?

**How do I enforce this when I'm not watching in real-time?**

### 4. Create Session Start Protocol

**Question:** What should happen at the START of every Claude Code session?

Should Claude be required to:
1. Read CLAUDE.md
2. Check git status
3. Verify production is working (curl checks)
4. List recent commits
5. Ask me what we're working on today
6. **WAIT for my approval before starting any work?**

### 5. Audit Trail System

**Question:** How can I create an audit trail of what Claude did?

Ideas:
- Claude writes to SESSION_LOG.md after each major action?
- Git commits are detailed enough to reconstruct what happened?
- Daily summary reports (like DAILY_PROGRESS)?

**What format makes this actually useful for debugging?**

---

## Specific PropIQ Context

### Tech Stack
- **Frontend:** React + TypeScript + Vite, deployed to Netlify
- **Backend:** Convex (serverless), deployed automatically
- **Auth:** Convex auth (httpOnly cookies)
- **Payments:** Stripe
- **Tests:** Playwright (33 test files exist)

### Critical Workflows
1. **Authentication** - Login, signup, password reset (DO NOT BREAK)
2. **Payments** - Stripe checkout for subscriptions (DO NOT BREAK)
3. **PropIQ Analysis** - Core AI feature (DO NOT BREAK)

### Existing Documentation
- `CLAUDE.md` - Main project memory (auto-loads each session)
- `frontend/tests/` - 33 Playwright test files
- `playwright.config.ts` - Test configuration
- Various ADRs in `docs/decisions/`

### The Pattern That Keeps Happening

**Step 1:** I ask Claude to do something (e.g., "add upgrade flow")
**Step 2:** Claude makes changes without checking existing patterns
**Step 3:** Something breaks (often auth or critical path)
**Step 4:** I discover it's broken hours/days later
**Step 5:** We spend time debugging instead of building
**Step 6:** Claude creates "enforcement" or "testing infrastructure"
**Step 7:** But the infrastructure already existed, we just didn't use it
**Step 8:** Repeat

**This is the circle we're stuck in.**

---

## Questions for You (Gemini)

### Process Questions

1. **How do I make Claude check documentation FIRST before making changes?**
   - Is there a prompt pattern that forces this?
   - Should I create a specific file Claude must read each session?
   - How do I verify Claude actually read it?

2. **How do I ensure tests run BEFORE deployments?**
   - Should this be in git hooks? (Already tried, Claude bypasses)
   - Should this be in CI/CD? (Already set up, Claude still deployed broken code)
   - Is there a prompt-level solution?

3. **How do I create checkpoints where Claude MUST stop and show me what it's about to do?**
   - Before deployments?
   - Before modifying critical code?
   - Before large refactors?

4. **What's the right format for session logs/audit trails?**
   - Markdown reports?
   - Git commit messages?
   - Separate log file?
   - How detailed should they be?

### Accountability Questions

5. **How can I verify what Claude did without watching every action?**
   - Post-session audit checklist?
   - Automated diff reports?
   - Daily summary format?

6. **When Claude says "I ran tests" - how do I verify that's true?**
   - Should git commits include test output?
   - Should there be screenshots/logs?
   - What's a reasonable verification method?

7. **How do I prevent "going in circles" (re-solving already-solved problems)?**
   - Better documentation format?
   - Session start checklist that reviews recent work?
   - Something else?

### Strategic Questions

8. **Is Claude Code the right tool for this workflow?**
   - Should I be using it differently?
   - Should I switch to a different AI coding assistant?
   - Should I reduce Claude's autonomy?

9. **What's a realistic expectation for Claude Code autonomy?**
   - Should I be more hands-on?
   - Should I review every change before deployment?
   - What's the right balance?

10. **How do other developers use Claude Code successfully?**
    - What are best practices?
    - What workflows prevent the problems I'm having?
    - Are there case studies or examples?

---

## What I've Already Tried (That Didn't Work)

### ❌ Documentation in CLAUDE.md
- **Tried:** Put all project context, rules, workflows in CLAUDE.md
- **Result:** Claude doesn't consistently check it before making changes
- **Why it failed:** No enforcement that Claude reads it first

### ❌ Git Hooks
- **Tried:** Pre-commit hooks that run tests
- **Result:** Claude commits without running them, or bypasses with --no-verify
- **Why it failed:** No way to enforce Claude uses git properly

### ❌ CI/CD with GitHub Actions + Netlify
- **Tried:** Set up test enforcement in CI/CD today
- **Result:** Tests fail in CI (config issues), but also Claude deployed before setting this up
- **Why it failed:** Doesn't prevent Claude from deploying broken code before tests run

### ❌ ADRs (Architecture Decision Records)
- **Tried:** Document major decisions in docs/decisions/
- **Result:** Claude makes similar decisions without checking if ADR exists
- **Why it failed:** No prompt to check ADRs before architectural changes

### ❌ Test Documentation
- **Tried:** 33 test files, properly configured Playwright setup
- **Result:** Claude doesn't run tests before deploying
- **Why it failed:** No forcing function to run tests first

---

## What Success Looks Like

### Short-term Success (Next Session)
- [ ] Claude starts session by reading CLAUDE.md
- [ ] Claude shows me what it plans to do BEFORE doing it
- [ ] Claude runs tests BEFORE deploying
- [ ] Claude asks permission before modifying auth/payments/core features
- [ ] I can verify tests ran by checking git commit or log file
- [ ] Session ends with clear summary of what was done

### Medium-term Success (Next Week)
- [ ] No more "going in circles" (re-solving solved problems)
- [ ] No more breaking changes deployed to production
- [ ] Clear audit trail of what Claude did each session
- [ ] I can pick up where we left off without confusion
- [ ] Production stability maintained

### Long-term Success (Next Month)
- [ ] Trust that Claude follows process
- [ ] Productive development without constant debugging
- [ ] Clear documentation of system state
- [ ] Ability to onboard another developer easily
- [ ] Sustainable development velocity

---

## Specific Output Requested

Please provide:

### 1. **SESSION_START_PROTOCOL.md**
A file I can tell Claude to read at the start of each session with:
- Checklist of things to verify
- Questions to ask me
- Commands to run to verify system state
- Explicit "STOP and get approval" points

### 2. **PRE_DEPLOYMENT_CHECKLIST.md**
A mandatory checklist before ANY deployment with:
- Test commands to run
- Verification steps
- Output to show me as proof tests passed
- Approval checkpoint

### 3. **AUDIT_TEMPLATE.md**
Format for end-of-session summary including:
- What was changed (files, features)
- What tests were run (with output)
- What was deployed (if anything)
- What's broken (if anything)
- What needs attention next session

### 4. **PROMPT_PATTERNS.md**
Specific prompts I should use to:
- Start sessions correctly
- Request changes safely
- Verify work was done correctly
- Audit what happened

### 5. **RECOVERY_PLAN.md**
Steps to recover from current state:
- How to verify if production is actually broken
- How to rollback if needed
- How to clean up the circular work from today
- How to start fresh tomorrow

---

## Current State (As of January 5, 2026, 6:30 AM PST)

**Production URL:** https://propiq.luntra.one
**Status:** Unknown if actually working (Claude says yes, but uncertainty)

**Recent Changes Today:**
1. Simplified unauthenticated upgrade flow (removed localStorage)
2. Added test enforcement to GitHub Actions + Netlify
3. Made deliberate breaking change to "prove" enforcement
4. Reverted breaking change
5. Created extensive documentation about enforcement

**Current Issues:**
- GitHub Actions failing (test environment config)
- Netlify deployments blocked by tests (by design)
- Uncertainty if production login actually works
- Lost development time going in circles

**Git Status:**
- Latest commit: `70a5488` (daily progress report)
- Branch: `main`
- Commits today: 8 total

**Next Session Should:**
- Verify production actually works
- Fix CI/CD test configuration OR remove if not needed
- Decide: Keep enforcement or remove it?
- Get back to productive feature development

---

## Please Help Me Design

**A system where:**
1. Claude is accountable for following existing processes
2. I can verify work without watching every action
3. We stop going in circles
4. Production stays stable
5. Development is productive

**That works within these constraints:**
1. I can't watch Claude in real-time
2. Claude has full codebase access
3. I rely on documentation to guide Claude
4. I need to trust but verify

**And produces:**
1. Clear audit trails
2. Stable production deployments
3. Productive development sessions
4. No more breaking critical features
5. Sustainable workflow

---

## Thank You

I need your help designing a collaboration framework that actually works. The current approach clearly doesn't. Please be specific and practical in your recommendations.

**What should I do differently?**
**What should Claude do differently?**
**What systems/checklists/processes will actually prevent these problems?**
