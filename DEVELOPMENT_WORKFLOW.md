# PropIQ - Continuous Development Workflow 🚀

**Created:** October 26, 2025
**Purpose:** Simple, sustainable system for managing feedback and shipping improvements

---

## 🎯 Quick Development Cycle (For Immediate Fixes)

### The 30-Minute Fix-and-Ship Cycle

```
1. Receive Feedback (2 min)
   ↓
2. Create Issue/Task (3 min)
   ↓
3. Implement Fix Locally (15 min)
   ↓
4. Test Locally (5 min)
   ↓
5. Deploy to Production (5 min)
   ↓
DONE ✅
```

**Total Time:** ~30 minutes per fix (for small UX improvements)

---

## 📋 Task Management System (Choose One)

### Option 1: GitHub Issues (Free, Built-in)

**Setup (5 minutes):**

```bash
# Already on GitHub - just use issues!
# Visit: https://github.com/Luntra-HQ/luntra/issues
```

**Create Issue Template:**

Create `.github/ISSUE_TEMPLATE/ux-improvement.md`:

```markdown
---
name: UX Improvement
about: User experience improvement or design feedback
title: '[UX] '
labels: ux, enhancement
assignees: ''
---

## Issue Description
Brief description of the UX issue

## Current Behavior
What happens now

## Expected Behavior
What should happen

## Steps to Reproduce (if applicable)
1. Go to '...'
2. Click on '...'
3. See error

## Screenshots
If applicable, add screenshots

## Priority
- [ ] Critical (blocks users)
- [ ] High (impacts experience)
- [ ] Medium (nice to have)
- [ ] Low (polish)

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

**Using GitHub Issues:**

```bash
# Create issue via CLI
gh issue create --title "[UX] Input fields don't clear zeros" --label "ux,bug"

# List issues
gh issue list --label "ux"

# Close issue when done
gh issue close 123
```

---

### Option 2: Linear (Recommended for Teams)

**Why Linear:**
- ✅ Beautiful, fast interface
- ✅ Keyboard shortcuts (power users love it)
- ✅ Auto-updates from git commits
- ✅ Cycles for sprint planning
- ✅ Free for small teams

**Setup:**

1. Sign up: https://linear.app
2. Create workspace: "PropIQ"
3. Create project: "Frontend UX"
4. Add labels: `ux`, `bug`, `enhancement`, `accessibility`

**Create Issue:**

```
Title: Input fields don't clear placeholder zeros
Priority: High
Labels: ux, bug
Description:
When user clicks in "Rehab Costs" input, the "0" doesn't clear.
User should be able to type over the figure immediately.

Acceptance Criteria:
- [ ] Clicking input clears placeholder
- [ ] User can type immediately
- [ ] Empty input shows placeholder again
```

---

### Option 3: Notion (Best for Documentation + Tasks)

**Setup (10 minutes):**

1. Create Notion page: "PropIQ Development"
2. Add database: "UX Improvements"
3. Add properties:
   - Status: Not Started / In Progress / Done
   - Priority: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)
   - Reporter: Person (Danita, Brian, etc.)
   - Assignee: Person
   - Date Reported: Date
   - Date Fixed: Date

**Template:**

| Issue | Priority | Status | Reporter | Date |
|-------|----------|--------|----------|------|
| Input zeros don't clear | P1 | In Progress | Danita | Oct 26 |
| PropIQ button not working | P0 | Not Started | Danita | Oct 26 |

---

## 🔄 **Recommended Workflow: GitHub Issues + GitHub Projects**

**Why:** Free, built-in, integrates with commits, simple to use

### Setup (5 minutes)

1. **Create GitHub Project Board:**

```bash
# Via GitHub web UI:
# 1. Go to https://github.com/Luntra-HQ/luntra
# 2. Click "Projects" tab
# 3. Create new project: "PropIQ UX Improvements"
# 4. Choose "Board" template
# 5. Add columns: "Backlog", "In Progress", "Testing", "Done"
```

2. **Create Issue Labels:**

Go to https://github.com/Luntra-HQ/luntra/labels and create:

- `ux` (purple) - User experience improvements
- `bug` (red) - Something isn't working
- `enhancement` (blue) - New feature or request
- `accessibility` (green) - A11y improvements
- `priority-high` (orange) - High priority
- `priority-critical` (dark red) - Blocks users

3. **Create Issues from Feedback:**

For each item in Danita's feedback:

```bash
gh issue create --title "[UX] Input fields don't clear placeholder zeros" \
  --label "ux,bug,priority-high" \
  --body "**Current Behavior:**
The 0 doesn't go away when you try to delete them in 'Rehab Costs' and other input fields.

**Expected Behavior:**
User should be able to write over the figures immediately.

**Acceptance Criteria:**
- [ ] Clicking input clears placeholder value
- [ ] User can type immediately
- [ ] onChange updates state correctly"
```

---

## 🚀 Development Workflow (Step-by-Step)

### Step 1: Receive Feedback

**From Slack/Email/Meeting:**
```
Danita: "The 0 doesn't go away when you try to delete them in Rehab Costs"
```

**Create GitHub Issue immediately:**
```bash
gh issue create --title "[UX] Input zeros don't clear" --label "ux,bug"
```

---

### Step 2: Create Feature Branch

```bash
cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq"

# Create branch from main
git checkout main
git pull origin main
git checkout -b fix/input-placeholder-zeros

# Branch naming convention:
# - fix/description-of-fix (for bugs)
# - feature/description-of-feature (for new features)
# - ux/description-of-improvement (for UX improvements)
```

---

### Step 3: Make Changes Locally

**Best Practice: One Issue = One Branch**

```bash
# Make your changes
code frontend/src/components/DealCalculator.tsx

# Test locally
cd frontend
npm run dev
# Visit http://localhost:5173
# Verify fix works
```

---

### Step 4: Commit with Issue Reference

```bash
git add frontend/src/components/DealCalculator.tsx

git commit -m "Fix input placeholder zeros not clearing

- Changed defaultValue to placeholder for all number inputs
- Added onFocus handler to clear input when user clicks
- Tested on Rehab Costs, Down Payment, Interest Rate fields

Fixes #123

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Key:** `Fixes #123` automatically closes GitHub issue when merged!

---

### Step 5: Push and Create Pull Request

```bash
# Push branch to GitHub
git push origin fix/input-placeholder-zeros

# Create PR (via GitHub CLI)
gh pr create \
  --title "Fix: Input placeholder zeros don't clear" \
  --body "Fixes #123

**Changes:**
- Changed defaultValue to placeholder for number inputs
- Added onFocus handler to select all text on focus
- User can now type over placeholder values immediately

**Testing:**
- [x] Tested Rehab Costs input
- [x] Tested Down Payment input
- [x] Tested Interest Rate input
- [x] Tested on Chrome, Firefox, Safari

**Screenshots:**
Before: [screenshot]
After: [screenshot]" \
  --label "ux,bug"
```

---

### Step 6: Review (Optional for Solo, Required for Team)

**If Solo Developer:**
- Skip review, merge immediately if tests pass

**If Team:**
```bash
# Request review
gh pr review --approve

# Or request changes
gh pr review --request-changes --body "Please add unit tests"
```

---

### Step 7: Merge and Deploy

```bash
# Merge PR (via CLI)
gh pr merge --squash --delete-branch

# Or merge via web UI (recommended)
# Visit PR page, click "Squash and merge"

# Pull latest
git checkout main
git pull origin main

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist --message="Fix input placeholder zeros"
```

**Automatic Deployment (Better):**

Set up Netlify to auto-deploy on git push:

1. Go to Netlify dashboard
2. Site settings → Build & deploy
3. Enable "Auto publishing"
4. Set "Production branch": `main`

Now: `git push origin main` → auto-deploys! 🚀

---

## 📅 Sprint Planning (Weekly/Bi-Weekly)

### Monday Morning Ritual (30 minutes)

**1. Review Feedback (10 min)**
- Check Slack, email, user interviews
- Add all feedback to GitHub Issues

**2. Prioritize (10 min)**
- Label issues: P0 (critical), P1 (high), P2 (medium), P3 (low)
- Move P0/P1 issues to "This Week" column

**3. Plan Sprint (10 min)**
- Pick 3-5 issues to tackle this week
- Move to "In Progress" when you start working

**Example Sprint:**
```
This Week (Oct 26 - Nov 1):
- [ ] Fix input placeholder zeros (P0) - 30 min
- [ ] Fix PropIQ button not working (P0) - 1 hour
- [ ] Standardize icon sizes (P1) - 30 min
- [ ] Accessibility contrast fixes (P1) - 1 hour
- [ ] Add padding to dropdown carats (P2) - 15 min

Total: ~3.5 hours (achievable in 1 day)
```

---

## 🧪 Testing Checklist (Before Deploy)

### Manual Testing (5 minutes)

```bash
# Start local server
cd frontend
npm run dev

# Test checklist:
- [ ] Issue is fixed
- [ ] No new bugs introduced
- [ ] Responsive on mobile (resize browser to 375px)
- [ ] Works in Chrome
- [ ] Works in Safari (if Mac)
- [ ] No console errors
- [ ] No TypeScript errors
```

### Automated Testing (Future)

**Set up later when you have more users:**

```bash
# Unit tests
npm test

# E2E tests (Playwright)
npm run test:e2e

# Visual regression tests
npm run test:visual
```

---

## 📊 Metrics to Track

### Weekly Review (Friday Afternoon)

**Track these in a simple spreadsheet:**

| Week | Issues Created | Issues Closed | Deploy Count | User Feedback |
|------|----------------|---------------|--------------|---------------|
| Oct 21-27 | 6 | 5 | 3 | "Input fields much better!" |
| Oct 28-Nov 3 | 4 | 4 | 2 | "Love the new icons" |

**Key Metrics:**
1. **Time to Fix:** How long from feedback → deployed fix?
   - Target: <24 hours for P0 bugs, <1 week for P1 improvements

2. **Deploy Frequency:** How often are you shipping?
   - Target: 2-3 deploys per week (shows momentum)

3. **Feedback Loop:** Are users noticing improvements?
   - Track: Positive comments, reduced complaints

---

## 🎯 Danita's Feedback: Action Plan

Let me convert her feedback into actionable issues:

### Issue 1: Input Placeholder Zeros
```
Title: [UX] Input fields don't clear placeholder zeros
Priority: P1 (High)
Labels: ux, bug
Time Estimate: 30 minutes

Current: The 0 doesn't go away when you try to delete them
Expected: User should be able to write over the figures

File: frontend/src/components/DealCalculator.tsx
Fix: Change `defaultValue="0"` to `placeholder="0"` + add onFocus handler
```

### Issue 2: Dropdown Padding
```
Title: [UX] Add 5pts padding to dropdown carat right side
Priority: P2 (Medium)
Labels: ux, enhancement
Time Estimate: 15 minutes

File: frontend/src/components/DealCalculator.css
Fix: Add `padding-right: 5px` to .dropdown-carat class
```

### Issue 3: PropIQ Button Not Working
```
Title: [BUG] PropIQ Analysis button does nothing
Priority: P0 (Critical)
Labels: bug, priority-critical
Time Estimate: 1 hour

Current: Nothing happens when clicking "Run Deal IQ Analysis"
Expected: Should trigger API call and show analysis results

File: frontend/src/App.tsx or DealCalculator.tsx
Fix: Debug onClick handler, check API integration
```

### Issue 4: Icon Sizes
```
Title: [UX] Standardize target icon sizes and placement
Priority: P1 (High)
Labels: ux, design
Time Estimate: 30 minutes

Current: Target icons on the page are inconsistent sizes
Expected: All target icons should be same size (e.g., 24px × 24px)

Files: All components using <Target /> icon
Fix: Add consistent className="h-6 w-6" to all Target icons
```

### Issue 5: Accessibility
```
Title: [A11y] Text contrast fails accessibility check
Priority: P1 (High)
Labels: accessibility, ux
Time Estimate: 1 hour

Current: "Deal Calculator" text is hard to read
Expected: All text passes WCAG AA contrast requirements (4.5:1)

Tool: Use https://webaim.org/resources/contrastchecker/
Fix: Update text colors in Tailwind config or component styles
```

---

## 🛠️ Quick Fix Implementation Guide

### Fix 1: Input Placeholder Zeros (30 min)

**Current Code (DealCalculator.tsx):**
```tsx
<input
  type="number"
  defaultValue="0"
  onChange={(e) => setRehabCosts(parseFloat(e.target.value))}
/>
```

**Fixed Code:**
```tsx
<input
  type="number"
  placeholder="0"
  value={rehabCosts || ''}
  onChange={(e) => setRehabCosts(parseFloat(e.target.value) || 0)}
  onFocus={(e) => e.target.select()} // Select all on focus
  className="..."
/>
```

**Test:**
1. Click in "Rehab Costs" → text should be selected
2. Type "5000" → should replace, not append to "0"
3. Delete all → should show placeholder "0" again

---

### Fix 2: Dropdown Padding (15 min)

**Add to DealCalculator.css:**
```css
.dropdown-carat {
  padding-right: 5px;
}

/* Or in Tailwind */
<ChevronDown className="h-4 w-4 pr-[5px]" />
```

---

### Fix 3: PropIQ Button Debug (1 hour)

**Checklist:**
1. Check if button has onClick handler
2. Check if handler is calling API
3. Check browser console for errors
4. Verify API endpoint is correct
5. Check backend logs if API is being hit

**I'll help debug this in the next step!**

---

### Fix 4: Standardize Icons (30 min)

**Search and replace:**
```bash
# Find all Target icon usage
grep -r "<Target" frontend/src/components/

# Replace with consistent sizing
# Before: <Target className="h-6 w-6" />
# After: <Target className="h-6 w-6" /> (all should match)
```

---

### Fix 5: Accessibility Contrast (1 hour)

**Run contrast check:**
1. Visit: https://webaim.org/resources/contrastchecker/
2. Test "Deal Calculator" heading color vs. background
3. If fails (< 4.5:1), increase contrast

**Fix:**
```tsx
// Before (may be too light)
<h2 className="text-gray-400">Deal Calculator</h2>

// After (higher contrast)
<h2 className="text-gray-100">Deal Calculator</h2>
```

---

## 🚀 Deployment Strategy

### Development → Production Pipeline

```
Local Development (localhost:5173)
         ↓
   Commit to Git
         ↓
   Push to GitHub (main branch)
         ↓
   Netlify Auto-Deploy (2-3 minutes)
         ↓
   Live at propiq.luntra.one ✅
```

**Enable Auto-Deploy:**

1. Go to Netlify dashboard
2. Site settings → Build & deploy → Continuous deployment
3. Set "Production branch": `main`
4. Enable "Auto publishing"

Now every `git push origin main` automatically deploys!

---

## 📋 Daily Development Ritual (15 minutes)

**Morning:**
1. Check GitHub issues (2 min)
2. Pick top priority issue (1 min)
3. Create branch, make fix (5 min)
4. Test locally (3 min)
5. Commit, push, deploy (4 min)

**Evening:**
1. Review what shipped today
2. Update issue statuses
3. Plan tomorrow's priorities

---

## 🎓 Best Practices

### Commit Messages

**Good:**
```
Fix input placeholder zeros not clearing

- Changed defaultValue to placeholder
- Added onFocus handler to select text
- User can now type over placeholder

Fixes #123
```

**Bad:**
```
fix bug
```

### Branch Names

**Good:**
- `fix/input-placeholder-zeros`
- `feature/pdf-export`
- `ux/icon-standardization`

**Bad:**
- `brian-changes`
- `test`
- `asdfasdf`

### PR Descriptions

**Good:**
```
## Summary
Fixes input fields not clearing placeholder zeros

## Changes
- Changed defaultValue to placeholder in DealCalculator.tsx
- Added onFocus handler to select text
- Tested across all number inputs

## Testing
- [x] Tested Rehab Costs
- [x] Tested Down Payment
- [x] Tested on Chrome, Safari

## Screenshots
Before: [screenshot]
After: [screenshot]

Fixes #123
```

---

## 🔧 Tools Setup (One-Time)

### GitHub CLI (if not installed)

```bash
brew install gh
gh auth login
```

### Netlify CLI (already installed ✅)

```bash
# Already have this!
netlify status
```

### VS Code Extensions (Recommended)

```
- GitHub Pull Requests (for PR reviews in editor)
- GitLens (see git blame, history)
- Prettier (auto-format on save)
- ESLint (catch errors early)
```

---

## 📞 When to Ask for Help

**Ask Claude Code for help with:**
- Implementing fixes (like I'm doing now!)
- Debugging complex issues
- Code reviews
- Architecture decisions

**Ask Danita for:**
- Design feedback
- UX validation
- User testing insights

**Ask LinkedIn for:**
- Product strategy
- Scaling advice
- Career mentorship

---

## ✅ Quick Start Checklist

**Set up your workflow (30 minutes):**

- [ ] Create GitHub project board
- [ ] Add issue labels (ux, bug, enhancement, accessibility)
- [ ] Enable Netlify auto-deploy
- [ ] Install GitHub CLI (`brew install gh`)
- [ ] Create first issue from Danita's feedback
- [ ] Create branch, make fix, deploy
- [ ] Celebrate first improvement shipped! 🎉

---

## 🎯 Next Steps

**Right now:**
1. I'll help you fix Danita's 5 issues
2. We'll deploy all fixes in one go
3. You'll have a working system for future feedback

**This week:**
1. Set up GitHub project board
2. Create issues for all feedback
3. Ship 2-3 improvements per day

**Long term:**
1. Collect feedback continuously
2. Prioritize weekly
3. Ship improvements daily
4. Build momentum toward product-market fit

---

**Let's fix Danita's feedback now! 🚀**
