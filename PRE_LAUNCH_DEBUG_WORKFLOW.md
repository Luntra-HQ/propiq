# 🔍 PropIQ Pre-Launch Debug Workflow

**Created:** 2026-01-09
**Purpose:** Disciplined debugging strategy for PropIQ launch (4 days remaining)
**Owner:** Brian Dusape

---

## 🎯 Strategic AI Tool Allocation

### Decision Tree: Which Tool for Which Problem?

```
┌─────────────────────────────────────────────┐
│ PROBLEM CLASSIFICATION                       │
└─────────────────────────────────────────────┘
           │
           ├─── Build/Compilation Issues ────────► Perplexity (Deep Research)
           │    - Vite hanging, webpack errors
           │    - TypeScript type errors
           │    - Dependency conflicts
           │
           ├─── Code Logic/Implementation ────────► Claude Code (60%)
           │    - Bug fixes, refactoring
           │    - Feature implementation
           │    - Code review
           │
           ├─── Quick Debugging/Iteration ────────► Cursor (25%)
           │    - Rapid file edits
           │    - Multi-file changes
           │    - Local testing
           │
           └─── Novel/Bleeding Edge Issues ───────► Grok (15%)
                - Cutting edge framework issues
                - New API patterns
                - Experimental features
```

---

## 🧰 Tool Usage Guidelines

### 1. **Perplexity** (25% - Research & Investigation)

**WHEN TO USE:**
- ✅ Build system issues (Vite, Webpack, Rollup)
- ✅ Dependency version conflicts
- ✅ Performance bottlenecks requiring benchmarks
- ✅ Framework-specific errors with unclear solutions
- ✅ Need to find official documentation/GitHub issues

**WHAT TO ASK:**
- "Why is Vite build timing out during terser minification?"
- "Circular dependency detection in React lazy imports"
- "Vite 7.3.0 known issues with Convex SDK"
- "Best practices for debugging hanging Node.js builds"

**OUTPUT EXPECTED:**
- Links to official docs, GitHub issues, Stack Overflow
- Multiple solution approaches ranked by probability
- Root cause analysis with evidence
- Benchmarks and performance data

**TIME LIMIT:** 15 minutes max per research session

---

### 2. **Claude Code** (60% - Primary Development)

**WHEN TO USE:**
- ✅ Code fixes, refactoring, implementation
- ✅ File reading, git operations, testing
- ✅ Multi-step workflows (test → fix → verify)
- ✅ Documentation and planning
- ✅ Long-running debugging sessions

**STRENGTHS:**
- Deep context understanding across files
- Git workflow integration
- Test execution and verification
- Systematic approach to complex problems

**LIMITATIONS:**
- Cannot access real-time documentation updates
- Knowledge cutoff (January 2025)
- Better at fixing than researching unknown issues

**TIME LIMIT:** No limit - primary tool

---

### 3. **Cursor** (25% - Rapid Iteration)

**WHEN TO USE:**
- ✅ Quick file edits (1-5 files)
- ✅ Inline code generation
- ✅ Rapid prototyping
- ✅ Copy-paste workflows
- ✅ Emergency hotfixes

**STRENGTHS:**
- Fast inline edits
- Multi-cursor editing
- Local file system access
- Quick commit workflows

**LIMITATIONS:**
- Less context across full codebase
- No automated testing
- No strategic planning

**TIME LIMIT:** 5-10 minutes for focused tasks

---

### 4. **Grok** (15% - Novel Problems)

**WHEN TO USE:**
- ✅ Very new framework versions (< 3 months old)
- ✅ Experimental features
- ✅ Real-time events (recent library changes)
- ✅ X/Twitter community solutions

**STRENGTHS:**
- Real-time web access
- Bleeding edge knowledge
- X integration for developer community insights

**LIMITATIONS:**
- Less systematic than Claude
- May suggest untested solutions
- Better at finding new info than deep analysis

**TIME LIMIT:** 10 minutes for exploration

---

## 🚨 Emergency Debugging Protocol

### When Critical Bug Found < 4 Days Before Launch

**Step 1: STOP & CLASSIFY (2 minutes)**
- Is production site broken? → P0 (fix immediately)
- Is local build broken but prod works? → P1 (fix but not blocking)
- Is it a test failure? → P2 (document, fix after launch)

**Step 2: GATHER EVIDENCE (5 minutes)**
```bash
# Capture the error
- Screenshot of error message
- Full terminal output
- Browser console logs (if applicable)
- Network tab (if API-related)
- Git status and recent commits
```

**Step 3: RESEARCH PHASE (15 minutes max)**

Use **Perplexity** for:
```
Query Template:
"[Framework] [Version] [Error Message] [Context]"

Example:
"Vite 7.3.0 build timeout during terser minification with Convex SDK lazy imports"
```

**Step 4: IMPLEMENT FIX (Variable)**

- Use **Claude Code** for systematic multi-file fixes
- Use **Cursor** for quick 1-2 file hotfixes
- Use **Grok** if Perplexity finds recent framework issues

**Step 5: VERIFY (10 minutes)**
```bash
# Test the fix
npm run build        # Does it complete?
npm run dev          # Does dev server start?
# Test on production URL
curl https://propiq.luntra.one
```

**Step 6: DOCUMENT (5 minutes)**
- Update BUG-TRACKER-MASTER.md
- Commit with detailed message
- Update launch readiness score

---

## 🎯 Current Issue: Vite Build Timeout

### Classification
**Category:** Build/Compilation Issue
**Tool to Use:** Perplexity → Claude Code
**Priority:** P1 (Production works, local build broken)

### Research Questions for Perplexity

1. **Primary Query:**
```
"Vite 7.3.0 build hanging during production build with React lazy imports and Convex SDK, terser minification enabled. Build times out after 2 minutes. No error message, just hangs."
```

2. **Secondary Queries:**
```
- "Vite 7.3 known issues terser minification"
- "Circular dependency React.lazy setTimeout Suspense"
- "Convex SDK vite build optimization"
- "Debug hanging Vite build process"
```

3. **Technical Deep Dive:**
```
- "Vite rollupOptions manualChunks causing infinite loops"
- "Drop console.log terser hanging build"
- "TypeScript project references causing Vite timeout"
```

### Expected Insights from Perplexity

- Is Vite 7.3.0 stable or should we downgrade?
- Are there known terser issues with lazy imports?
- Is convex/react client causing build issues?
- Should we disable terser for now?

### Systematic Debug Steps (After Research)

**Phase 1: Minimal Config Test (10 min)**
```javascript
// Temporarily simplify vite.config.ts
- Disable terser minification
- Remove manualChunks
- Check if build completes
```

**Phase 2: Dependency Isolation (15 min)**
```bash
# Check if Convex is the issue
- Comment out Convex imports temporarily
- Test build
- Re-enable incrementally
```

**Phase 3: TypeScript Config (10 min)**
```bash
# Check tsconfig issues
- Verify no circular references
- Check project references
- Validate paths configuration
```

**Phase 4: Binary Search Lazy Imports (20 min)**
```bash
# Find which lazy import causes hang
- Comment out all lazy imports
- Re-enable one by one
- Identify culprit
```

---

## 📊 Debug Session Template

Use this for EVERY debugging session:

```markdown
## Debug Session: [Issue Title]

**Date:** [YYYY-MM-DD HH:MM]
**Tool Used:** [Claude/Cursor/Perplexity/Grok]
**Priority:** [P0/P1/P2]

### Problem Statement
[One sentence description]

### Evidence Collected
- Terminal output: [paste or link]
- Error message: [exact text]
- Recent changes: [git commits]
- Environment: [Node version, npm version]

### Research Results (if using Perplexity/Grok)
- Query: [what you asked]
- Top 3 Solutions Found:
  1. [Solution + source]
  2. [Solution + source]
  3. [Solution + source]

### Hypothesis
[What you think is causing the issue]

### Fix Attempted
[What you tried]

### Result
- ✅ FIXED / ❌ FAILED / 🔄 PARTIAL

### Time Spent
[Minutes]

### Next Steps
[If not fixed, what to try next]
```

---

## 🎓 Learning from This Process

After each debug session, capture:
1. **Root Cause** - What actually caused it?
2. **How We Found It** - Which tool/query worked?
3. **Prevention** - How to avoid in future?
4. **Tool Effectiveness** - Did we use the right tool?

---

## 🚀 Launch Readiness Criteria

**Can we launch if build is broken locally?**
- YES, IF production site works perfectly
- YES, IF we can deploy via CI/CD
- NO, IF we need local builds for hotfixes

**Current Status:**
- Production: ✅ Works (propiq.luntra.one)
- Local Build: ❌ Broken (timeout)
- Deployment: ❓ Unknown (test CI/CD)

**Decision:**
- Priority: Fix build OR verify CI/CD works
- Fallback: Deploy from working machine if needed
- Launch Blocking: NO (production works)

---

## 📋 Action Items - Right Now

### IMMEDIATE (Next 30 minutes)

1. **Perplexity Research** (15 min)
   - Open Perplexity
   - Run the 3 primary queries above
   - Document findings in debug session template

2. **Quick Fix Attempt** (10 min)
   - Disable terser minification
   - Test if build completes
   - If yes → deploy without minification for now

3. **Decision Point** (5 min)
   - If build works without terser → Ship it
   - If still broken → Continue Phase 2 investigation
   - If production broken → EMERGENCY P0 protocol

---

## 🛡️ Fallback Plans

### Plan A: Fix Build (Ideal)
- Timeline: 2 hours max
- Use: Perplexity + Claude Code
- Test: Full build completes

### Plan B: Ship Without Local Build (Acceptable)
- Use: CI/CD pipeline or remote build
- Verify: Production deployment works
- Accept: Can't test locally

### Plan C: Revert to Last Working State (Emergency)
```bash
git log --oneline | head -20
# Find last commit where build worked
git revert [bad-commit-hash]
# Test build
# Deploy
```

### Plan D: Delay Launch (Last Resort)
- Only if production is completely broken
- Only if P0 bugs found in manual testing
- Document reason and new launch date

---

**Next Action:** Open Perplexity and run the first research query.

**Time Budget:** 30 minutes to understand issue, 1 hour to fix, 30 minutes to verify.

**Launch in:** 4 days - We have time, but stay focused.
