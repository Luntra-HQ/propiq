# Prompt Patterns for Working with Claude Code

## The "Deep Breath" Prompt (Start of Session)

Use this at the beginning of EVERY session:

```
Initialize session. Follow SESSION_START_PROTOCOL.md. Do not suggest code changes until you have completed the State Verification and I have approved your Alignment Proposal.
```

## The "Pattern Match" Prompt (Before Feature Work)

Use this when asking Claude to implement a new feature:

```
Before you implement [Feature], find the existing code for [Related Feature]. List the design patterns used there and explain how you will stay consistent with them. Reference docs/decisions/ if applicable.
```

## The "Hard Evidence" Prompt (When Claude claims 'it works')

Use this when Claude says something works but you want proof:

```
Don't tell me it works; show me. Paste the output of the Playwright test suite for the [X] module and the last 10 lines of the Convex logs.
```

## The "Constraint First" Prompt (For Complex Tasks)

Use this to prevent Claude from jumping to solutions:

```
Before implementing [Task], list:
1. What existing code/patterns must NOT be changed
2. What tests must pass before and after
3. What could break if this is done wrong
4. What ADRs or documentation exists about this

Then propose your approach and wait for my approval.
```

## The "Accountability" Prompt (End of Session)

Use this to force proper session documentation:

```
Summarize the session in SESSION_LOG.md. Include:
1. What files were changed and why
2. Terminal output of test runs (if any)
3. What's working vs broken
4. What I need to verify manually
5. What should happen next session
```

## The "Rollback" Prompt (When Things Break)

Use this when something is broken and you need to recover:

```
STOP. Do not try to fix this yet.
1. Show me the last 5 commits with git log
2. Tell me which commit was the last known working state
3. Propose a rollback plan
4. Wait for my approval before executing
```

## The "Read First" Prompt (When Claude Ignores Documentation)

Use this when Claude is about to redo work that's already documented:

```
Before proceeding, search the codebase for existing implementations of [X]. Check:
1. CLAUDE.md for existing patterns
2. docs/decisions/ for ADRs
3. Recent commits (last 20) for similar work
4. SESSION_LOG.md for recent context

If this has been done before, explain why we're doing it again.
```

## Examples of Good vs Bad Prompts

### ❌ Bad Prompt (Too Vague)
```
Add an upgrade flow for users
```
**Problem:** Claude will implement however it wants, might break auth, won't check existing patterns

### ✅ Good Prompt (Constraint-First)
```
I need an upgrade flow. Before implementing:
1. Find how we currently handle tier selection (check PricingPage.tsx)
2. Check if there's an ADR about pricing flows
3. List what auth flows must NOT be modified
4. Run auth tests to verify current baseline

Then propose your approach and wait for approval.
```

### ❌ Bad Prompt (Assumes Claude Remembers)
```
Deploy the changes we just made
```
**Problem:** Claude might not have run tests, might deploy broken code

### ✅ Good Prompt (Evidence-Based)
```
Follow PRE_DEPLOYMENT_CHECKLIST.md:
1. Run all tests and paste output
2. Show me what changed (git status)
3. Confirm no ADRs were bypassed
4. Wait for my approval to deploy
```

## Emergency "Hard Reset" Prompts

### When Claude Is Going in Circles
```
STOP. Read the last 3 entries in SESSION_LOG.md.
Tell me if we've already tried to solve this problem.
If yes, explain what we learned and why we're trying again.
```

### When You've Lost Context
```
I'm starting fresh. Ignore everything from earlier in this conversation.
Follow SESSION_START_PROTOCOL.md from the beginning.
```

### When Claude Bypassed a Check
```
You just [deployed/committed/modified] without following [PROTOCOL].
Explain why you bypassed the protocol.
Then follow it now and show me the results.
```

## How to Use These Patterns

1. **Start every session** with the "Deep Breath" prompt
2. **Before any feature work** use "Pattern Match" or "Constraint First"
3. **Before any deployment** explicitly reference PRE_DEPLOYMENT_CHECKLIST.md
4. **End every session** with the "Accountability" prompt
5. **When things break** use "Rollback" prompt immediately

## Key Principle

**Treat Claude like a junior developer with infinite speed:**
- Give constraints BEFORE tasks
- Require evidence, not claims
- Force documentation at checkpoints
- Never assume it remembers previous sessions
