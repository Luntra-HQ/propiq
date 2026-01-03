# 🚀 Start Here - Mobile Claude Code Handoff

**Date:** January 3, 2026
**Status:** Weekend Sprint Complete, Week 1 Ready to Begin
**Dev Server:** http://localhost:5173/ (should auto-start)

---

## 📋 Quick Start (5 minutes)

### 1. Pull Latest Code
```bash
cd /Users/briandusape/Projects/propiq
git pull origin main
```

### 2. Start Dev Server
```bash
cd frontend
npm run dev
```
Opens at: http://localhost:5173/

### 3. Test Current Features
- Login with test account
- Go to Deal Calculator
- **Basic Analysis tab**: See new Market Classification dropdown
- **Scenarios tab**: See new preset selectors (Rent/Expense/Appreciation Growth)
- Enter a property → See Red Flags or Green Lights appear

---

## 🎯 What Was Completed This Weekend

### ✅ Feature 1: Market-Aware Deal Score
- Deal scoring now adjusts based on market tier (Class A/B/C/D)
- Dropdown selector in Basic Analysis tab
- Hot metros (Class A) expect 4-5% cap rates, cash flow markets (Class C) expect 7-9%

### ✅ Feature 2: Smart Presets for Projections
- 5-year projection assumptions now have guided presets
- Rent Growth: Conservative (2%), Average (3%), Aggressive (5%)
- Educational tooltips explain each option

### ✅ Feature 3: Red Flags & Green Lights
- Automatically detect deal problems (negative cash flow, low DCR, etc.)
- Automatically highlight deal strengths (strong CoC, good cap rate, etc.)
- Color-coded boxes in results

---

## 📊 GitHub Issues - Your Roadmap

All work is organized in GitHub issues: https://github.com/Luntra-HQ/propiq/issues

### **Priority Order:**
1. **Issue #23** - [P0] Fix Radix UI Infinite Loop ← **START HERE**
2. **Issue #24** - [P1] Build Simple Mode MVP (3-step wizard)
3. **Issue #25** - [P2] Add Confidence Score Display
4. **Issue #26** - [P2] Enhanced Beginner Tooltips
5. **Issue #27** - [P3] IRR Calculation
6. **Issue #28** - [P3] Equity Multiple

### **View All Issues:**
```bash
gh issue list --label week-1
```

---

## 🔥 Critical Issue to Fix First

### Issue #23: Radix UI Infinite Loop

**Problem:** RadioGroup and Select components cause infinite renders with React Hook Form

**Current Status:**
- Investment Strategy selector commented out (lines 353-378 in DealCalculatorV3.tsx)
- Market Tier using native HTML select (should be RadioGroup)
- Projection presets using native HTML selects (should be RadioGroup)

**Your Task:**
Fix the Radix UI integration so we can use proper RadioGroup/Select components without infinite loops.

**Detailed Instructions:**
See Issue #23 on GitHub or read `STRATEGIC_ROADMAP_WEEK_1.md` → Day 1, Task 1.1

**Time Estimate:** 3 hours

**Success:** All RadioGroup/Select components work without infinite loops

---

## 📁 Key Files to Know

### **Calculator Components:**
- `frontend/src/components/DealCalculatorV3.tsx` - Main calculator (933 lines)
- `frontend/src/utils/calculatorUtils.ts` - All calculations (520+ lines)
- `frontend/src/schemas/dealCalculatorSchema.ts` - Zod validation (400+ lines)

### **Documentation:**
- `STRATEGIC_ROADMAP_WEEK_1.md` - Your weekly roadmap (detailed tasks)
- `WEEKEND_SPRINT_PROGRESS.md` - What was completed this weekend
- `COMPLETE_GPT_RECOMMENDATIONS.md` - Full Real Estate GPT recommendations
- `GPT_RECOMMENDATIONS_IMPLEMENTATION.md` - Implementation specs with code

### **UI Components:**
- `frontend/src/components/ui/` - Shadcn UI components
- `frontend/src/components/ui/form.tsx` - Form wrapper components
- `frontend/src/components/ui/radio-group.tsx` - RadioGroup (currently broken with RHF)

---

## 🧪 Testing Workflow

### After Each Feature:
```bash
# 1. Save your changes
# 2. Check browser at http://localhost:5173/
# 3. Test in calculator
# 4. Check console for errors (should be 0)
# 5. Commit with descriptive message
```

### Test Properties:
Use these sample inputs to test features:

**Good Deal (Charlotte, NC):**
- Purchase Price: $275,000
- Down Payment: 20%
- Interest Rate: 7.5%
- Monthly Rent: $2,200
- Expected: Green lights, good deal score

**Risky Deal:**
- Purchase Price: $350,000
- Down Payment: 5%
- Monthly Rent: $2,000
- Expected: Red flags, poor deal score

---

## 🎯 Daily Goals (Recommended Pace)

### **Day 1 (Monday): Critical Fix**
- Fix Radix UI infinite loop (Issue #23)
- Test all selectors work properly
- **Deliverable:** Investment Strategy selector uncommented and working

### **Day 2 (Tuesday): Simple Mode Part 1**
- Build 3-step wizard component structure (Issue #24)
- Implement Step 1 (Property Basics)
- Implement Step 2 (Income/Expenses)
- **Deliverable:** Wizard UI functional, inputs working

### **Day 3 (Wednesday): Simple Mode Part 2 + UX**
- Finish Step 3 (Results & Verdict) for Simple Mode
- Add Confidence Score (Issue #25)
- **Deliverable:** Simple Mode completable end-to-end

### **Day 4 (Thursday): Education & Advanced Metrics**
- Add Enhanced Tooltips (Issue #26)
- Implement IRR Calculation (Issue #27)
- **Deliverable:** All tooltips done, IRR displaying

### **Day 5 (Friday): Polish & Testing**
- Add Equity Multiple (Issue #28)
- End-to-end testing
- Bug fixes
- **Deliverable:** All 7 issues completed and tested

---

## 💡 Development Tips

### **When Stuck:**
1. Check `STRATEGIC_ROADMAP_WEEK_1.md` for detailed specs
2. Review existing `DealCalculatorV3.tsx` patterns
3. Test with Charlotte sample property
4. Read related GitHub issue for context

### **Code Style:**
- Use TypeScript (no `any` types)
- Follow existing patterns in `DealCalculatorV3.tsx`
- Match glassmorphism design (translucent cards, blur effects)
- Keep calculations in `calculatorUtils.ts`, UI in components

### **Commit Messages:**
```bash
git commit -m "feat: add Simple Mode Step 1 - Property Basics

- Created SimpleModeStep1.tsx component
- Added purchase price and down payment inputs
- Auto-calculate cash needed
- Tested with sample data

Relates to #24

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### **Testing Checklist Before Committing:**
- [ ] 0 TypeScript errors (`npm run type-check`)
- [ ] 0 console errors in browser
- [ ] Feature works as expected
- [ ] Mobile responsive (test 375px width)
- [ ] Glassmorphism styling consistent
- [ ] Git commit with good message

---

## 🚨 Known Issues (Don't Fix These)

These are documented but not blocking:

1. **ReferralCard commented out** - API error, not urgent
2. **Some documentation files untracked** - Intentional, will commit later
3. **Backend files modified** - Unrelated to calculator work, ignore

Focus only on calculator enhancements (Issues #23-28).

---

## 📞 How to Ask for Help

If you get truly stuck:

1. **Document what you tried:**
   - What code did you change?
   - What error did you get?
   - What have you tried so far?

2. **Check these resources:**
   - GitHub issue for that feature
   - STRATEGIC_ROADMAP_WEEK_1.md
   - COMPLETE_GPT_RECOMMENDATIONS.md
   - Existing code patterns

3. **Ask specific questions:**
   - ❌ "The RadioGroup doesn't work"
   - ✅ "I tried Option A (useEffect pattern) but still getting infinite loop on line 390. The error shows componentDidUpdate being called repeatedly. What am I missing?"

---

## 🎉 Success Metrics

By end of Week 1, you should have:

- [ ] 7 GitHub issues completed (#23-28)
- [ ] All code committed to `feature/week-1-enhancements` branch
- [ ] 0 TypeScript errors
- [ ] 0 console errors
- [ ] Simple Mode functional and testable
- [ ] Advanced metrics (IRR, Equity Multiple) calculating correctly
- [ ] All Radix UI components working (no infinite loops)
- [ ] Enhanced tooltips on all fields

---

## 📊 Estimated Time Breakdown

| Task | Hours | Day |
|------|-------|-----|
| Fix Radix UI Infinite Loop | 3h | Mon |
| Simple Mode Wizard UI | 4h | Tue |
| Simple Mode Verdict Logic | 2h | Tue |
| Confidence Score | 2h | Wed |
| Enhanced Tooltips | 3h | Wed-Thu |
| IRR Calculation | 4h | Thu |
| Equity Multiple | 2h | Fri |
| Testing & Polish | 3h | Fri |
| **Total** | **23h** | **5 days** |

---

## 🎯 Your First Command

```bash
cd /Users/briandusape/Projects/propiq
git pull origin main
cd frontend
npm run dev

# Then open Issue #23 in GitHub and start fixing the Radix UI issue!
```

---

**Good luck! You've got a clear roadmap, detailed specs, and working code to build on. Let's ship these features! 🚀**

**Questions? Check STRATEGIC_ROADMAP_WEEK_1.md for detailed specs on every task.**

---

**Last Updated:** January 3, 2026, 2:15 PM
**Next Session:** Mobile Claude Code picks up with Issue #23
**Dev Server:** http://localhost:5173/ (already running)
