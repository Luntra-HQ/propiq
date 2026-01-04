# 🚀 Start Here - Test DealCalculatorV3

**Status:** Ready for Testing
**Time Needed:** 30-60 minutes
**Priority:** HIGH

---

## ⚡ Quick Start (5 minutes)

### 1. Start Dev Server
```bash
cd frontend
npm run dev
```

### 2. Open Calculator with V3
```
http://localhost:5173/calculator?v3=true
```
*Note: `?v3=true` enables the new version*

### 3. Quick Smoke Test
- [ ] Page loads without errors
- [ ] All input fields visible
- [ ] Enter `purchasePrice: 300000` → No error
- [ ] Enter `purchasePrice: 500` → Error shows: "Purchase price must be at least $1,000"
- [ ] Tab key navigates between fields
- [ ] Deal Score displays when valid inputs entered

**✅ If all pass:** Proceed to full testing

**❌ If any fail:** Check console for errors, see Troubleshooting below

---

## 📋 Full Test Checklist (30 minutes)

### Basic Functionality (10 min)
- [ ] **Purchase Price**
  - Enter 300000 → Accepts
  - Enter 500 → Error: "must be at least $1,000"
  - Enter 100000001 → Error: "cannot exceed $100M"

- [ ] **Down Payment**
  - Enter 20 → Accepts
  - Enter -5 → Error: "cannot be negative"
  - Enter 150 → Error: "cannot exceed 100%"

- [ ] **Monthly Rent**
  - Enter 2500 → Accepts
  - Calculations update immediately

- [ ] **All Tabs**
  - Basic tab loads
  - Advanced tab loads
  - Scenarios tab loads
  - Tab switching works

### Validation (5 min)
- [ ] Error messages appear when invalid
- [ ] Error messages disappear when corrected
- [ ] Red border shows on error fields
- [ ] Form stays responsive (no lag)

### Accessibility (5 min)
- [ ] Tab key moves between fields (in order)
- [ ] Enter key submits (if applicable)
- [ ] Focus indicators visible (blue ring)
- [ ] Labels read correctly by screen reader

### Visual (5 min)
- [ ] Glass aesthetic maintained
- [ ] Colors match original
- [ ] Spacing looks correct
- [ ] Responsive on mobile (resize browser)

### Edge Cases (5 min)
- [ ] Enter 0 in all fields → Handles gracefully
- [ ] Delete all text → Validation appears
- [ ] Rapid typing → No lag
- [ ] Switch tabs with errors → Errors persist

---

## 🐛 Troubleshooting

### Page Won't Load
**Error:** "Cannot find module '@/schemas/dealCalculatorSchema'"
**Fix:**
```bash
# Ensure file exists
ls src/schemas/dealCalculatorSchema.ts

# If missing, file not created properly
# Re-run creation step or check path aliases in tsconfig.json
```

### Validation Not Working
**Error:** No errors show when entering invalid values
**Fix:** Check console for error messages, ensure zodResolver is imported

### Calculations Not Updating
**Error:** Deal Score shows 0 or doesn't update
**Fix:** Check if `form.watch()` is being called in component

### Styling Looks Wrong
**Error:** Missing glass effect or wrong colors
**Fix:** Ensure Tailwind is compiling correctly:
```bash
# Restart dev server
npm run dev
```

---

## 📊 Test Results Template

Copy this to track your testing:

```markdown
## Test Results - DealCalculatorV3

**Date:** [Date]
**Tester:** [Your Name]
**Environment:** [Local/Staging]

### Smoke Test
- [ ] Page loads
- [ ] Validation works
- [ ] Calculations update
- [ ] Tabs switch

### Detailed Tests
- [ ] All fields accept valid input
- [ ] All fields reject invalid input
- [ ] Error messages clear and helpful
- [ ] Tab navigation works
- [ ] Visual styling correct

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader (if tested)
- [ ] Focus indicators
- [ ] ARIA labels

### Issues Found
1. [Issue 1 description]
2. [Issue 2 description]

### Overall: [PASS / FAIL / NEEDS WORK]

**Notes:**
[Additional observations]
```

---

## ✅ After Testing

### If All Tests Pass
1. Document results (use template above)
2. Open `DEALCALCULATOR_MIGRATION_GUIDE.md`
3. Follow deployment steps (Section: "Deployment Plan")
4. Consider deploying to staging

### If Tests Fail
1. Document failures clearly
2. Check Troubleshooting section
3. Review `DealCalculatorV3.tsx` for obvious issues
4. Check console for error messages
5. Compare with `DealCalculator.original.tsx`

### If Minor Issues Found
1. Create list of issues
2. Prioritize (blocking vs cosmetic)
3. Fix blocking issues first
4. Deploy with known cosmetic issues (document them)

---

## 🔗 Related Files

- **Component:** `src/components/DealCalculatorV3.tsx`
- **Schema:** `src/schemas/dealCalculatorSchema.ts`
- **Original:** `src/components/DealCalculator.original.tsx`
- **Migration Guide:** `DEALCALCULATOR_MIGRATION_GUIDE.md`
- **Progress:** `PHASE2_PROGRESS.md`

---

## 💡 Quick Tips

### Compare with Original
```bash
# Side-by-side comparison
# Original: http://localhost:5173/calculator
# New:      http://localhost:5173/calculator?v3=true
```

### Check Console
- Open DevTools (F12)
- Watch Console tab while testing
- Look for errors or warnings

### Mobile Testing
- Resize browser to 375px width (iPhone SE)
- Or use DevTools Device Toolbar (Ctrl+Shift+M)

### Accessibility Testing
- Install axe DevTools Chrome extension
- Run audit on calculator page
- Fix any critical issues found

---

## 📞 Need Help?

### Documentation
- Full guide: `DEALCALCULATOR_MIGRATION_GUIDE.md`
- Troubleshooting: See guide Section "Troubleshooting"

### Common Issues
1. **TypeScript errors:** Run `npm run build:strict`
2. **Imports not found:** Check `tsconfig.json` paths
3. **Styling missing:** Restart dev server
4. **Validation not working:** Check zodResolver setup

---

**Ready to test!** 🚀

**Estimated time:** 30-60 minutes for thorough testing

**Start with:** Quick smoke test (5 min) → If pass, proceed to full checklist
