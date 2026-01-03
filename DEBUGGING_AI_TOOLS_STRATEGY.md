# 🔧 Debugging AI Tools Strategy - PropIQ Development Workflow

**Created:** January 3, 2026
**Purpose:** Strategic tool assignment for debugging, development, and feature implementation
**User Preference:** Minimize manual testing - only test what's truly necessary

---

## 📋 Table of Contents

1. [Tool Capabilities Matrix](#tool-capabilities-matrix)
2. [Decision Trees for Debugging](#decision-trees-for-debugging)
3. [Tool Assignments by Task Type](#tool-assignments-by-task-type)
4. [Current Week 1 Tool Assignments](#current-week-1-tool-assignments)
5. [Context Preservation Rules](#context-preservation-rules)

---

## 🛠️ Tool Capabilities Matrix

### Available Tools & Their Strengths

| Tool | Primary Use | Debugging Strength | When to Use | When NOT to Use |
|------|-------------|-------------------|-------------|----------------|
| **Cursor AI** | Code editor with AI | Real-time code fixes, refactoring | Frontend bugs, UI implementation, file edits | Research, documentation, backend issues |
| **Gemini** | Long-form analysis | Root cause analysis, documentation | Complex multi-file issues, strategic planning | Quick fixes, real-time monitoring |
| **Grok (X.AI)** | Real-time intelligence | Social monitoring, trend detection | Backend API monitoring, user feedback tracking | Code implementation, file editing |
| **Perplexity** | Research with citations | Finding known solutions | Stack Overflow search, best practices | Code generation, implementation |
| **OpenAI Codex** | Code generation | Complex algorithms, calculations | New feature logic, mathematical functions | UI components, styling |
| **Claude Code (Me)** | Orchestration | Multi-tool coordination, planning | Strategic decisions, tool delegation | Direct code editing (I delegate to Cursor) |

---

## 🎯 Decision Trees for Debugging

### Decision Tree 1: Frontend Bug

```
START: Frontend bug detected
│
├─ Is it a UI/styling issue? → YES → Cursor AI
│                            → NO → Continue
│
├─ Is it a React infinite loop? → YES → Perplexity (research) → Cursor (fix)
│                               → NO → Continue
│
├─ Is it a component logic error? → YES → Cursor AI
│                                 → NO → Continue
│
├─ Is it a third-party library issue? → YES → Perplexity (research) → Cursor (implement solution)
│                                     → NO → Cursor AI (default)
```

**Example: Radix UI Infinite Loop**
1. **Perplexity:** Research "Radix UI RadioGroup React Hook Form infinite loop" (10 min)
2. **Claude Code:** Analyze findings, create implementation doc (15 min)
3. **Cursor AI:** Apply fixes to DealCalculatorV3.tsx (20 min)
4. **Cursor AI:** Run `npm run build` to verify (5 min)

**Total: 50 minutes | Manual testing: 0 minutes**

---

### Decision Tree 2: Backend Bug

```
START: Backend bug detected
│
├─ Is it an API endpoint failure? → YES → Grok (monitor errors) → Cursor (fix)
│                                 → NO → Continue
│
├─ Is it a database query issue? → YES → Gemini (analyze schema) → Cursor (fix query)
│                                → NO → Continue
│
├─ Is it an authentication error? → YES → Perplexity (research JWT best practices) → Cursor (fix)
│                                 → NO → Continue
│
├─ Is it a deployment issue? → YES → Grok (check Azure logs) → Cursor (fix config)
│                            → NO → Cursor AI (default)
```

**Example: Convex API Error**
1. **Grok:** Monitor X for mentions of "Convex down" or similar issues (5 min)
2. **Cursor:** Check Convex dashboard, review error logs (10 min)
3. **Perplexity:** Research Convex error code if unknown (10 min)
4. **Cursor:** Apply fix, redeploy (15 min)

**Total: 40 minutes | Manual testing: 0 minutes (Grok monitors production)**

---

### Decision Tree 3: New Feature Implementation

```
START: Need to build new feature
│
├─ Is it a UI component? → YES → Cursor AI (build) → Gemini (document)
│                        → NO → Continue
│
├─ Does it require complex calculations? → YES → Codex (logic) → Cursor (integrate)
│                                        → NO → Continue
│
├─ Does it need research? → YES → Perplexity (patterns) → Cursor (implement)
│                         → NO → Continue
│
├─ Is it a wizard/multi-step flow? → YES → Gemini (design flow) → Cursor (build UI)
│                                  → NO → Cursor AI (default)
```

**Example: Simple Mode Wizard (Issue #24)**
1. **Gemini:** Design 3-step wizard flow, create component structure (30 min)
2. **Cursor AI:** Build SimpleModeWizard.tsx, Step1.tsx, Step2.tsx, Step3.tsx (90 min)
3. **Codex:** Implement verdict logic algorithm (30 min)
4. **Cursor AI:** Integrate with existing calculator, test build (20 min)

**Total: 170 minutes | Manual testing: 5 minutes (smoke test only)**

---

## 📊 Tool Assignments by Task Type

### Task Type 1: Research & Root Cause Analysis

**Primary Tool:** Perplexity
**Secondary Tool:** Gemini

**Use Cases:**
- Finding Stack Overflow solutions
- Researching library documentation
- Understanding error messages
- Competitive analysis (how do others solve this?)

**Workflow:**
```
1. Perplexity: Research the problem (10-20 min)
2. Gemini: Analyze findings, create solution doc (15-30 min)
3. Claude Code: Review and delegate implementation
```

**Example Prompts:**
```
[Perplexity]
"React Hook Form Radix UI Select infinite loop Stack Overflow 2024 2025"

[Gemini]
"Analyze these Stack Overflow solutions and create implementation plan for PropIQ's DealCalculatorV3.tsx"
```

---

### Task Type 2: Code Implementation & Fixes

**Primary Tool:** Cursor AI
**Secondary Tool:** Codex (for complex logic)

**Use Cases:**
- Editing React components
- Adding new functions
- Refactoring code
- Implementing UI designs

**Workflow:**
```
1. Cursor AI: Make code changes (20-60 min depending on complexity)
2. Cursor AI: Run automated tests (npm run build, type-check)
3. Cursor AI: Document changes in commit message
```

**Automated Testing (NO manual browser testing):**
```bash
# Cursor AI runs these automatically
npm run build          # Catches build errors
npm run type-check     # Catches TypeScript errors
npm run test           # Runs unit tests (if available)
```

**Manual Testing Only When:**
- [ ] New user-facing feature (quick smoke test - 2 min max)
- [ ] Critical payment flow change
- [ ] Authentication/security change

**Manual Testing NEVER for:**
- ❌ Bug fixes (automated tests sufficient)
- ❌ Styling changes (visual review in dev server, no interaction testing)
- ❌ Refactoring (tests prove it works)

---

### Task Type 3: Documentation & Analysis

**Primary Tool:** Gemini
**Secondary Tool:** Claude Code

**Use Cases:**
- Creating implementation docs
- Writing session summaries
- Analyzing user feedback
- Strategic planning

**Workflow:**
```
1. Gemini: Create comprehensive documentation (30-60 min)
2. Claude Code: Review, add strategic insights (10-15 min)
3. Save to repo for future sessions
```

---

### Task Type 4: Monitoring & User Feedback

**Primary Tool:** Grok
**Secondary Tool:** Gemini (analysis)

**Use Cases:**
- Social media monitoring (X/Twitter)
- Real-time error tracking
- User sentiment analysis
- Backend health monitoring

**Workflow:**
```
1. Grok: Monitor X for mentions, errors, feedback (continuous background)
2. Grok: Alert when issues detected (real-time)
3. Gemini: Analyze patterns from feedback (weekly)
```

**Example Monitoring:**
```
[Grok - Continuous]
"Monitor X for mentions of 'PropIQ' or 'infinite loop' or 'calculator broken'"

[Grok - Daily Check]
"What are users saying about real estate calculators this week?"
```

---

## 🚀 Current Week 1 Tool Assignments

### Issue #23: Fix Radix UI Infinite Loop (P0)

**Tool Assignment:**
- **Perplexity (Research - 10 min):** ✅ COMPLETED
  - Searched Stack Overflow, Reddit, GitHub
  - Found root cause: `defaultValue` vs `value` pattern

- **Claude Code (Analysis - 15 min):** ✅ COMPLETED
  - Created RADIX_UI_INFINITE_LOOP_ROOT_CAUSE_ANALYSIS.md
  - Identified exact code changes needed

- **Cursor AI (Implementation - 30 min):** ⏳ PENDING
  - Edit DealCalculatorV3.tsx lines 353-378 (Investment Strategy)
  - Edit DealCalculatorV3.tsx lines 380-409 (Market Tier)
  - Replace `defaultValue={field.value}` with `value={field.value}`
  - Run `npm run build` to verify no errors
  - Commit with detailed message

**Estimated Time:** 55 minutes
**Manual Testing Required:** 0 minutes (build success = it works)

---

### Issue #24: Build Simple Mode MVP (P1)

**Tool Assignment:**
- **Gemini (Design - 30 min):**
  - Create SimpleModeWizard component structure
  - Design 3-step flow (Property Basics → Income/Expenses → Results)
  - Write component specifications

- **Cursor AI (UI Implementation - 90 min):**
  - Build SimpleModeWizard.tsx (container)
  - Build SimpleModeStep1.tsx (property inputs)
  - Build SimpleModeStep2.tsx (financial inputs)
  - Build SimpleModeStep3.tsx (results + verdict)
  - Integrate with Dashboard.tsx (mode toggle)

- **Codex (Logic - 30 min):**
  - Implement verdict algorithm
  - Create utils/verdictLogic.ts
  - Calculate confidence score

- **Cursor AI (Testing - 20 min):**
  - Run `npm run build`
  - Run `npm run type-check`
  - Verify dev server starts without errors

**Estimated Time:** 170 minutes
**Manual Testing Required:** 5 minutes (quick wizard walkthrough)

---

### Issue #25: Add Confidence Score (P2)

**Tool Assignment:**
- **Codex (Algorithm - 20 min):**
  - Implement confidence calculation
  - Formula: 60% data quality + 40% market alignment
  - Add to calculatorUtils.ts

- **Cursor AI (UI - 30 min):**
  - Create ConfidenceMeter component
  - Add to DealCalculatorV3 results section
  - Style as circular progress indicator

- **Cursor AI (Integration - 15 min):**
  - Wire up calculations
  - Add tooltips explaining score
  - Test with sample data

**Estimated Time:** 65 minutes
**Manual Testing Required:** 2 minutes (verify visual display)

---

## 📝 Context Preservation Rules

### For Future Claude Code Sessions

**ALWAYS include in handoff docs:**
1. **User Preference:** Minimize manual testing - only test truly necessary
2. **Tool Capabilities:** Reference this DEBUGGING_AI_TOOLS_STRATEGY.md
3. **Division of Labor:** "Cursor handles frontend, Grok monitors backend, Perplexity researches, Gemini documents"

### Session Handoff Template

```markdown
# Session Handoff - [Date]

## User Preferences
- **Manual Testing:** Minimal - automated tests (npm run build, type-check) are sufficient
- **Tool Strategy:** Use external tools (Cursor, Gemini, Grok, Perplexity, Codex) not just Task agents
- **Documentation:** DEBUGGING_AI_TOOLS_STRATEGY.md defines tool assignments

## Current Work
[What was completed]

## Next Steps
- **Cursor AI:** [Frontend work needed]
- **Grok:** [Backend monitoring needed]
- **Perplexity:** [Research needed]
- **Gemini:** [Documentation needed]
- **Codex:** [Complex logic needed]
```

---

## 🔄 Weekly Workflow Pattern

### Monday Morning (Planning)
**Tools:** Gemini + Claude Code
1. Review GitHub issues
2. Prioritize week's work
3. Assign tools to each issue
4. Document in this strategy file

### Monday-Thursday (Execution)
**Tools:** Cursor AI (primary) + Perplexity (as needed)
1. Cursor implements features
2. Perplexity researches blockers
3. Automated testing validates work
4. Minimal manual testing (5-10 min/day total)

### Friday (Testing & Documentation)
**Tools:** Gemini + Cursor AI + Grok
1. Gemini creates session summary
2. Cursor runs full test suite
3. Grok monitors for any production issues
4. Manual smoke test (10 minutes max)

---

## 🎯 Success Metrics for Tool Usage

### Cursor AI
- **Metric:** Code changes per hour
- **Target:** 200-300 lines/hour
- **Quality Check:** Build passes, no TypeScript errors

### Perplexity
- **Metric:** Research questions answered
- **Target:** 5-10 per week
- **Quality Check:** Solutions found within 20 min

### Gemini
- **Metric:** Documentation created
- **Target:** 2-3 comprehensive docs per week
- **Quality Check:** Future sessions reference docs successfully

### Grok
- **Metric:** Issues detected before user reports
- **Target:** 80% early detection rate
- **Quality Check:** Zero surprise production bugs

### Codex
- **Metric:** Complex algorithms implemented
- **Target:** 1-2 per week
- **Quality Check:** Calculations verified against test cases

---

## 📚 Tool-Specific Prompt Templates

### Cursor AI Prompts

**Bug Fix:**
```
Fix the infinite loop in DealCalculatorV3.tsx:
- Replace lines 353-378 with the pattern from RADIX_UI_INFINITE_LOOP_ROOT_CAUSE_ANALYSIS.md
- Use value={field.value} instead of defaultValue={field.value}
- Maintain existing styling and structure
- Run npm run build to verify
```

**New Component:**
```
Create SimpleModeStep1.tsx component:
- Input fields: purchase price, down payment %
- Auto-calculate cash needed
- Next button navigation
- Follow glassmorphism design from DealCalculatorV3
- TypeScript with proper interfaces
```

---

### Perplexity Prompts

**Research Pattern:**
```
[Library/Framework] + [Issue] + "Stack Overflow" + [Year Range]

Example:
"Radix UI RadioGroup React Hook Form infinite loop Stack Overflow 2024 2025"
```

**Best Practices:**
```
"Best practices for [technology] in [use case] 2025 with citations"

Example:
"Best practices for React Hook Form controlled components 2025 with citations"
```

---

### Gemini Prompts

**Documentation:**
```
Create comprehensive documentation for [feature]:
- Overview (what it does)
- Implementation details (how it works)
- Code examples (copy-paste ready)
- Testing checklist
- Known issues and workarounds
```

**Analysis:**
```
Analyze this user feedback [paste]:
- Common themes (3-5 bullets)
- Priority issues (P0, P1, P2)
- Recommended actions (specific, actionable)
- Estimated effort per action
```

---

### Grok Prompts

**Monitoring:**
```
"Monitor X for mentions of 'PropIQ' in the last 24 hours. Alert me to:
- Bug reports
- Feature requests
- User praise
- Competitor comparisons"
```

**Trend Detection:**
```
"What's trending in real estate investing on X this week?
Focus on:
- Popular discussion topics
- Viral posts (>1000 likes)
- Hashtags gaining momentum"
```

---

### Codex Prompts

**Algorithm:**
```
Implement [calculation] in TypeScript:
- Input: [parameters with types]
- Output: [return type]
- Formula: [mathematical formula]
- Edge cases: [list edge cases to handle]
- Testing: Provide 3 test cases
```

**Example:**
```
Implement Internal Rate of Return (IRR) in TypeScript:
- Input: cashFlows: number[], initialInvestment: number
- Output: number (IRR as decimal, e.g., 0.08 for 8%)
- Formula: NPV = 0, solve for discount rate
- Edge cases: all negative cash flows, division by zero
- Testing: Provide 3 test cases with known IRR values
```

---

## 🚨 Emergency Protocols

### Production Bug Detected

**Immediate Response (within 10 minutes):**
1. **Grok:** Check X/social media for user reports
2. **Cursor:** Check error logs, identify affected code
3. **Perplexity:** Quick search for known issue
4. **Cursor:** Implement hotfix
5. **Grok:** Monitor for resolution confirmation

**No manual testing** - deploy fix immediately, Grok monitors production.

---

### User Reports Feature Broken

**Response Workflow:**
1. **Grok:** Thank user publicly, show we're investigating
2. **Cursor:** Reproduce issue locally
3. **Perplexity:** Research if it's a known browser/OS issue
4. **Cursor:** Fix and deploy
5. **Grok:** Update user within 2 hours

---

## ✅ Checklist for New Features

**Before Asking Claude Code to Build a Feature:**

- [ ] Clear specification exists (Gemini created it)
- [ ] Tool assignment decided (Cursor? Codex? Both?)
- [ ] Automated testing plan (what will npm run build catch?)
- [ ] Manual testing scope defined (0 min? 2 min? 5 min?)
- [ ] Success criteria documented (how do we know it's done?)

**Example:**
```
Feature: Confidence Score Display
Spec: ✅ Created by Gemini
Tools: ✅ Codex (algorithm) + Cursor (UI)
Auto Tests: ✅ npm run build (catches type errors)
Manual Test: ✅ 2 min (verify visual display looks right)
Success: ✅ Confidence meter shows on results, tooltips explain score
```

---

## 🎓 Learning from This Session

### What Went Wrong
- ❌ I didn't reference existing AI tools strategy
- ❌ I defaulted to using my Task agents instead of external tools
- ❌ I didn't provide clear division of labor (Cursor vs Grok vs Perplexity)

### What I Should Have Said
> "Here's the tool assignment for fixing Issue #23:
> - **Perplexity** researches the Radix UI infinite loop (10 min)
> - **Claude Code** analyzes findings and creates fix plan (15 min)
> - **Cursor AI** implements the code changes (30 min)
> - **Cursor AI** runs automated tests (5 min)
>
> For Issue #24 (Simple Mode):
> - **Gemini** designs the wizard flow (30 min)
> - **Cursor AI** builds all 4 components (90 min)
> - **Codex** implements the verdict algorithm (30 min)
>
> For backend monitoring:
> - **Grok** watches Azure logs and X mentions (continuous)
>
> **Manual testing:** 0 minutes for bug fixes, 5 minutes max for Simple Mode walkthrough.
>
> Shall I proceed with this tool assignment?"

---

## 📞 How to Use This Document

### In Current Session
1. Reference tool assignments above
2. Execute with assigned tools
3. Update this doc with learnings

### In Future Sessions
1. Claude Code reads this document on startup
2. User says "Follow debugging tools strategy"
3. Claude Code assigns work to appropriate tools
4. Minimal manual testing required

---

**Last Updated:** January 3, 2026
**Status:** Ready for immediate use
**Next Review:** End of Week 1 (capture learnings)

**Key Principle:** Use the right tool for the right job. Cursor codes, Perplexity researches, Gemini documents, Grok monitors, Codex calculates, Claude Code orchestrates.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
