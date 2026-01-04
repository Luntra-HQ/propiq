# QuickCheck Redesign Specification

**Date:** January 3, 2026
**Status:** Implementation Started
**Goal:** Ship trust-first Simple Mode based on user feedback

---

## 🎯 Executive Summary

**What We're Building:**
A radically simplified 2-input calculator (QuickCheck) that replaces the current 3-step wizard, with inline transparency features to build user trust.

**Why:**
User feedback revealed 5 critical pain points:
1. **Trust Issues** - Users don't understand how calculations work
2. **Information Overload** - Beginners struggle with current Simple Mode
3. **Static Assumptions** - Users want time-based projections (breakeven)
4. **No Summary Box** - Users want 3-4 key metrics, not 20+
5. **No Export/Share** - Can't share analyses with partners/lenders

**Target Users:**
- First-Timer Fiona (beginner investors)
- Side-Hustle Sam (screening mode before deep-dive)

---

## 📐 Core Design Principles

### 1. **Speed Over Precision** (for QuickCheck)
- 2 inputs only: Purchase Price + Monthly Rent
- Results in <5 seconds
- Smart defaults for everything else

### 2. **Trust Through Transparency**
- Every number is clickable → shows calculation
- Assumptions are visible and explained
- Confidence meter shows reliability

### 3. **Natural Graduation Path**
- QuickCheck → Advanced Mode (seamless data transfer)
- "Want precision? Load into Advanced Mode" CTA
- Pre-fill Advanced Mode with QuickCheck data + smart defaults

### 4. **Time-Based Thinking**
- Show "When You'll Break Even" (not just Year 1 cash flow)
- Answer "How long to recoup my $50k investment?"
- 5-year timeline with equity buildup

---

## 🧩 Component Architecture

```
QuickCheck (Parent)
├── Input Section (2 fields)
├── ExecutiveSummary
│   ├── Deal Score Badge
│   ├── Confidence Meter
│   └── Key Metrics Grid (3-4 metrics)
├── CalculationExplanation (expandable)
│   ├── Formula Display
│   ├── Step-by-Step Breakdown
│   └── Assumptions Used
├── BreakevenTimeline
│   ├── Hero Number (X years, Y months)
│   ├── Visual Timeline
│   └── 5-Year Projection Table
└── Upgrade CTA
    └── Load into Advanced Mode button
```

---

## 🔢 Smart Defaults

**National Averages (Conservative):**
- Down Payment: 20%
- Interest Rate: 7.0% (current market avg)
- Loan Term: 30 years
- Closing Costs: 3% of purchase price
- Property Tax: 1.2% of purchase price annually
- Insurance: 0.5% of purchase price annually
- Maintenance Reserve: 1% of purchase price annually
- Vacancy Reserve: 8% of monthly rent
- Property Management: 10% of monthly rent
- Appreciation: 3.5% annually (for breakeven calc)

**Why These Numbers:**
- Freddie Mac data for interest rates
- National Association of Realtors for tax/insurance
- BiggerPockets recommendations for reserves
- Conservative to avoid over-optimistic results

---

## 🎨 Key UI Elements

### Executive Summary Box
**Purpose:** Answer "Is this a good deal or not?" in 3 seconds

**Contains:**
1. **Deal Score Badge** (0-100 with color + emoji)
2. **Confidence Meter** (Low/Medium/High based on input quality)
3. **Top 3 Metrics:**
   - Monthly Cash Flow (positive = green, negative = red)
   - Cash-on-Cash Return (>8% = good)
   - 1% Rule (>1% = passes)
4. **Recommended Action** ("Make an offer" / "Negotiate" / "Pass")

### "How We Calculated" Inline Tooltips
**Purpose:** Build trust by showing the math

**Pattern:**
```
Monthly Cash Flow: $284 [ℹ️ How we calculated this ▼]

[Expanded:]
Formula: Rent - Expenses - Mortgage = Cash Flow

Step-by-Step:
  Monthly Rent              +$1,800
  Mortgage Payment (P&I)    -$1,142
  Property Tax (/12)        -$250
  Insurance (/12)           -$104
  Maintenance (1% rule)     -$208
  Vacancy Reserve (8%)      -$144
  Property Mgmt (10%)       -$180
  ─────────────────────────────────
  Net Monthly Cash Flow      $284

Assumptions We Used:
• 20% down payment (industry standard)
• 7.0% interest rate (current market avg)
• 1.2% property tax (national average)

Want to use YOUR actual numbers?
[Load into Advanced Mode →]
```

### Breakeven Timeline
**Purpose:** Answer "When do I recoup my investment?"

**Shows:**
- Big number: "4 years, 7 months" (breakeven date)
- Visual timeline with milestones
- 5-year projection table (cash flow + equity buildup)
- Explanation: "This includes $15,964 cash flow + $34,036 equity gain"

---

## 🔄 Conversion Flow (QuickCheck → Advanced)

### Trigger Points:

1. **After QuickCheck result:**
   - Show blurred/locked features:
     - 🔒 5-Year Equity Buildup
     - 🔒 Scenario Analysis (best/worst case)
     - 🔒 PDF Export
   - CTA: "Unlock with Advanced Mode →"

2. **Inside calculation explanations:**
   - "Want to use YOUR actual numbers? Load into Advanced Mode →"

3. **After 3 Quick Checks:**
   - Banner: "🔥 You're on a roll! Upgrade for unlimited analyses"

### Data Transfer:
When user clicks "Load into Advanced Mode":
```tsx
const advancedData = {
  purchasePrice: quickCheckPrice,
  monthlyRent: quickCheckRent,
  downPaymentPercent: 20,
  interestRate: 7.0,
  loanTerm: 30,
  closingCosts: quickCheckPrice * 0.03,
  annualPropertyTax: quickCheckPrice * 0.012,
  annualInsurance: quickCheckPrice * 0.005,
  monthlyMaintenance: (quickCheckPrice * 0.01) / 12,
  monthlyVacancy: quickCheckRent * 0.08,
  monthlyPropertyManagement: quickCheckRent * 0.10,
  // ... pre-fill all fields
};

// Switch to Advanced Mode
setCalculatorMode('advanced');
form.reset(advancedData);

// Show banner
showInfoBanner("We pre-filled these values from your Quick Check. Edit as needed!");
```

---

## 📊 Success Metrics (30-Day Post-Launch)

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Time to First Result** | ~120 sec | <10 sec | Clarity analytics |
| **QuickCheck Completion Rate** | - | >80% | Convex tracking |
| **Calculation Explanation Views** | - | >30% | Clarity events (`quick_check_explanation_opened`) |
| **Conversion to Advanced Mode** | - | >25% | Convex tracking |
| **User Trust Score (survey)** | - | >7/10 | In-app survey |
| **Mobile Engagement** | - | >60% | Clarity device data |

### Event Tracking (Microsoft Clarity):
```tsx
// Track these events:
clarity.event('quick_check_analyze', { price, rent });
clarity.event('calculation_explanation_opened', { metric: 'cashFlow' });
clarity.event('breakeven_viewed', { months: 55 });
clarity.event('switched_to_advanced', { fromQuickCheck: true, dataPreFilled: true });
clarity.event('executive_summary_viewed', { dealScore: 72 });
```

---

## 🚀 7-Day Implementation Roadmap

### **Day 1-2: Core Logic**
- [ ] Create `smartDefaults.ts` with all national averages
- [ ] Add `calculateQuickCheck()` function to `calculatorUtils.ts`
- [ ] Add `calculateBreakeven()` function
- [ ] Add `determineConfidence()` function
- [ ] Unit test all calculations

### **Day 3-4: UI Components**
- [ ] Build `QuickCheck.tsx` (parent container)
- [ ] Build `ExecutiveSummary.tsx` (deal score + top metrics)
- [ ] Build `MetricCard.tsx` (reusable metric display)
- [ ] Build `CalculationExplanation.tsx` (expandable tooltips)
- [ ] Build `BreakevenTimeline.tsx` (timeline + projections)

### **Day 5-6: Integration**
- [ ] Update `Dashboard.tsx` to support 3 modes (quick/simple/advanced)
- [ ] Add mode switcher UI
- [ ] Implement data transfer (QuickCheck → Advanced)
- [ ] Add info banner for pre-filled data
- [ ] Test on desktop + mobile

### **Day 7: Polish & Analytics**
- [ ] Add CSS animations (slide-down, fade-in)
- [ ] Implement Clarity event tracking
- [ ] Add loading states
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Create "How to Use QuickCheck" onboarding tooltip

---

## 📱 Mobile Considerations

**Priority:** Mobile-first design (60% of users)

**Optimizations:**
1. **Stack layout** - No side-by-side grids on mobile
2. **Touch targets** - Minimum 44px tap areas
3. **Expandable sections** - Collapse calculation details by default
4. **Sticky CTA** - "Load into Advanced Mode" button fixed at bottom
5. **Swipe gestures** - Swipe timeline left/right to see years 1-5

**Responsive Breakpoints:**
- Mobile: <768px (single column, larger touch targets)
- Tablet: 768px-1024px (2-column grid for metrics)
- Desktop: >1024px (full layout with sidebar)

---

## 🎓 User Education

**First-Time User Flow:**

1. **Landing on QuickCheck:**
   ```
   💡 Tooltip appears:
   "QuickCheck gives you instant results using industry averages.
   Click any number to see how we calculated it. Want precision?
   Switch to Advanced Mode anytime!"

   [Got it] [Don't show again]
   ```

2. **After first calculation:**
   ```
   🎉 Success modal:
   "Nice! You analyzed your first deal in 5 seconds.

   Now try:
   • Click 'How we calculated' to see the math
   • View your breakeven timeline below
   • Load into Advanced Mode for precision

   [Close]
   ```

3. **When clicking first explanation:**
   ```
   💡 Highlight animation on formula:
   "This is where trust happens. Every number is based on
   national averages, which you can override in Advanced Mode."
   ```

---

## 🔐 Trust & Transparency Features

### Confidence Meter
**Purpose:** Show users when to trust estimates vs. verify

**Logic:**
```tsx
const determineConfidence = (price: number, rent: number): 'low' | 'medium' | 'high' => {
  const rentToPrice = rent / price;

  // Unrealistic rent ratios = low confidence
  if (rentToPrice < 0.003) return 'low'; // Rent too low (e.g., $300/mo for $200k house)
  if (rentToPrice > 0.02) return 'low';  // Rent too high (e.g., $4,000/mo for $200k house)

  // Missing data = medium confidence
  // QuickCheck always uses estimates, so always medium at best
  return 'medium';
};
```

**Display:**
```
┌──────────────────────────────┐
│ Confidence: MEDIUM           │
│ ████████░░░                  │
│ Verify assumptions           │
└──────────────────────────────┘

[Why medium?]
We're using national averages for taxes, insurance,
and maintenance. Your actual costs may vary. Use
Advanced Mode to enter exact numbers.
```

### Assumptions Panel
**Always visible below results:**
```
📋 Assumptions We Used:
• 20% down payment ($50,000)
• 7.0% interest rate (current market avg)
• $3,000 closing costs (3% of price)
• $250/mo property tax (1.2% annually)
• $104/mo insurance (0.5% annually)
• $208/mo maintenance reserve (1% rule)
• $144/mo vacancy reserve (8% of rent)
• $180/mo property mgmt (10% of rent)

💡 These are conservative national averages.
[Edit in Advanced Mode →]
```

---

## 🆚 Competitive Positioning

**BiggerPockets Calculator:**
- Requires 12+ inputs (intimidating for beginners)
- No smart defaults
- No breakeven calculator
- **PropIQ Advantage:** 2 inputs, instant results, breakeven timeline

**Roofstock Deal Finder:**
- Similar quick-check approach (good!)
- No transparency (black box calculations)
- No Advanced Mode (dead end)
- **PropIQ Advantage:** "How we calculated" + graduation to Advanced

**DealCheck:**
- 7-step wizard (too many steps)
- Mobile-first (good!)
- Paid only ($9.99/mo)
- **PropIQ Advantage:** Free QuickCheck, better UX, dual-mode strategy

**PropIQ's Unique Moat:**
1. **Dual-mode flexibility** - Speed OR precision (not one-size-fits-all)
2. **Transparent calculations** - Build trust with inline explanations
3. **Breakeven focus** - Answer "when do I profit?" (not just Year 1)
4. **AI integration** - PropIQ analysis powered by GPT-4o (coming soon: AI suggestions)

---

## 🐛 Edge Cases & Validation

### Input Validation
```tsx
// Prevent unrealistic inputs
const validateInputs = (price: number, rent: number): ValidationResult => {
  const errors = [];

  if (price < 10000) errors.push('Purchase price seems too low');
  if (price > 100000000) errors.push('Purchase price seems too high');
  if (rent < 100) errors.push('Rent seems too low');
  if (rent > 1000000) errors.push('Rent seems too high');

  const rentToPrice = rent / price;
  if (rentToPrice < 0.002) errors.push('Rent is very low for this price - verify inputs');
  if (rentToPrice > 0.015) errors.push('Rent is very high for this price - is this commercial?');

  return {
    isValid: errors.length === 0,
    errors,
    warnings: errors // Show as warnings, don't block calculation
  };
};
```

### Negative Cash Flow Handling
```tsx
// If QuickCheck shows negative cash flow
if (result.monthlyCashFlow < 0) {
  return (
    <div className="negative-cashflow-alert">
      ⚠️ This property will cost you ${Math.abs(result.monthlyCashFlow)}/month

      This means you'll be paying out of pocket to own this property.

      💡 Try:
      • Increasing the rent estimate
      • Lowering the purchase price
      • Using Advanced Mode to adjust expenses

      [Fix This Deal in Advanced Mode →]
    </div>
  );
}
```

### Breakeven Calculation Failure
```tsx
// If breakeven never reached in 30 years
if (!breakevenResult.breakevenMonth) {
  return (
    <div className="breakeven-warning">
      ⚠️ Breakeven Not Reached

      With current cash flow (-$142/mo), you won't recoup
      your $50,000 investment within 30 years.

      💡 Recommended Actions:
      1. Pass on this deal
      2. Negotiate a 15-20% price reduction
      3. Verify if rent can be increased

      [Analyze Different Numbers →]
    </div>
  );
}
```

---

## 📚 Technical Debt & Future Enhancements

### Phase 1 (Current Sprint - Week 1)
- ✅ 2-input QuickCheck
- ✅ Executive Summary
- ✅ Inline calculation explanations
- ✅ Breakeven timeline

### Phase 2 (Month 2)
- [ ] Regional defaults (pull property tax rates by ZIP code)
- [ ] Zillow API integration (auto-fill rent estimates)
- [ ] Saved QuickChecks (compare multiple properties)
- [ ] PDF export from QuickCheck

### Phase 3 (Month 3)
- [ ] AI suggestions: "This deal needs 10% higher rent to work"
- [ ] Deal comparison table (side-by-side)
- [ ] Share link (shareable QuickCheck results)
- [ ] Conversational AI mode (Concept A from original design)

### Known Limitations
1. **No regional customization** - Uses national averages (mitigated by showing assumptions)
2. **No property-specific data** - Doesn't know roof age, condition, etc. (future: Zillow integration)
3. **Static interest rate** - Hardcoded 7% (future: Freddie Mac API)
4. **No HOA support** - QuickCheck doesn't ask about HOA fees (shown in Advanced Mode only)

---

## 🎨 Design Tokens

### Colors (Glassmorphism Theme)
```css
--primary-violet: #8b5cf6;
--primary-blue: #3b82f6;
--success-green: #10b981;
--warning-amber: #f59e0b;
--danger-red: #ef4444;

--glass-bg: rgba(30, 41, 59, 0.5);
--glass-border: rgba(100, 116, 139, 0.2);
--glass-glow: rgba(139, 92, 246, 0.3);

--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--text-muted: #64748b;
```

### Typography
```css
--font-display: 'Inter', system-ui, sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Courier New', monospace;

--text-4xl: 48px;  /* Deal Score */
--text-2xl: 32px;  /* Section Headers */
--text-lg: 18px;   /* Metric Values */
--text-base: 16px; /* Body Text */
--text-sm: 14px;   /* Labels */
--text-xs: 12px;   /* Hints */
```

### Spacing
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

---

## 🔗 Related Files

**Implementation Files:**
- `/frontend/src/components/QuickCheck.tsx` - Main component
- `/frontend/src/components/ExecutiveSummary.tsx` - Deal score + metrics
- `/frontend/src/components/CalculationExplanation.tsx` - Inline tooltips
- `/frontend/src/components/BreakevenTimeline.tsx` - Breakeven calculator
- `/frontend/src/utils/smartDefaults.ts` - National averages
- `/frontend/src/styles/quickcheck.css` - Styles
- `/frontend/src/components/Dashboard.tsx` - Integration point

**Documentation:**
- `/propiq/REAL_ESTATE_GPT_BRIEF.md` - Original calculator spec
- `/propiq/CLAUDE.md` - Project memory file
- `/Users/briandusape/Downloads/PROP IQ FEEDBACK.xlsx` - User feedback source

**Testing:**
- `/frontend/tests/quickcheck.spec.ts` - E2E tests (to be created)
- `/frontend/src/utils/__tests__/smartDefaults.test.ts` - Unit tests

---

## 📞 Key Contacts & Resources

**Stakeholder:** Brian (Founder)
**Timeline:** Ship Week 1 (QuickCheck MVP)
**Success Metric:** >80% completion rate, >25% conversion to Advanced

**External APIs:**
- Freddie Mac Mortgage Rates: https://www.freddiemac.com/pmms (for dynamic interest rates)
- Zillow API: (future) Auto-fill rent estimates by address

**Competitive Tools to Study:**
- BiggerPockets Calculator: https://www.biggerpockets.com/real-estate-investment-calculator
- Roofstock Deal Finder: https://www.roofstock.com/investment-property-calculator
- DealCheck: https://dealcheck.io

---

## 🎯 Decision Log

**Why 2 inputs instead of 3-step wizard?**
- User feedback: "Novice may have a hard time following" (Jeff)
- Benchmark: Zillow's Rent Zestimate uses minimal inputs
- Trade-off: Less accuracy, but 10x faster time-to-value

**Why show breakeven instead of just IRR?**
- User feedback: "Want to know when I'll breakeven" (Rob, Shligton)
- Psychology: Investors think in terms of time, not percentages
- Differentiation: Competitors don't show breakeven prominently

**Why inline tooltips instead of modal popups?**
- UX Research: Modals interrupt flow, inline keeps context
- Mobile: Easier to scroll than dismiss modals
- Trust: Always visible, not hidden behind "Help" menu

**Why medium confidence max (never high)?**
- Honesty: QuickCheck uses estimates, not verified data
- Legal: Avoid liability for bad investment decisions
- Conversion: Medium confidence drives users to Advanced Mode

---

**Last Updated:** January 3, 2026
**Status:** ✅ Spec complete, implementation starting
**Next Review:** January 10, 2026 (post-MVP launch)
