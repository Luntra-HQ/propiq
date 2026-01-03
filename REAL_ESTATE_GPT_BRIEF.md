# PropIQ DealCalculator Optimization & Personalization Feature Brief

**Date:** January 3, 2026
**For:** Real Estate Investment GPT
**Purpose:** Expert consultation on calculator enhancement, financial modeling improvements, and Simple/Advanced mode design

---

## 🎯 Project Context

**PropIQ** is an AI-powered real estate investment analysis SaaS platform. We just refactored our flagship DealCalculator with modern UI components (React Hook Form + Zod validation + Shadcn UI + glassmorphism design).

**Current Status:**
- ✅ DealCalculatorV3 built with proper form validation
- ✅ Real-time calculations working
- ✅ 3-tab interface (Basic Analysis, Advanced Metrics, Scenarios & Projections)
- ⚠️ Need real estate expertise to maximize accuracy and value

---

## 📊 Current Calculator Implementation

### **Tab 1: Basic Analysis**

**Inputs Collected:**
- **Property Purchase:**
  - Purchase Price ($1,000 - $100M)
  - Down Payment (0-100%)
  - Interest Rate (0-30%)
  - Loan Term (1-50 years)
  - Closing Costs ($0-$1M)
  - Rehab Costs ($0-$10M)

- **Monthly Income:**
  - Monthly Rent ($0-$1M)

- **Monthly Expenses:**
  - Annual Property Tax
  - Annual Insurance
  - Monthly HOA Fees
  - Monthly Utilities (landlord-paid)
  - Monthly Maintenance
  - Monthly Vacancy Reserve
  - Monthly Property Management

- **Investment Strategy:** (TEMPORARILY DISABLED - needs fix)
  - Buy & Hold Rental
  - House Hack
  - BRRRR
  - Fix & Flip
  - Commercial

**Calculated Metrics Displayed:**
- Deal Score (0-100 with color-coded rating)
- Monthly Cash Flow
- Cash on Cash Return
- Cap Rate
- Total Cash Invested
- Annual Cash Flow
- 1% Rule Check

---

### **Tab 2: Advanced Metrics**

**Displayed Metrics:**
- Monthly Breakdown:
  - Principal & Interest (P&I)
  - PITI (includes tax & insurance)
  - Total Monthly Expenses
  - Monthly Cash Flow

- Annual Summary:
  - Gross Rental Income
  - Operating Expenses
  - Net Operating Income (NOI)
  - Annual Debt Service
  - Annual Cash Flow

- Advanced Ratios:
  - Debt Coverage Ratio (DCR)
  - Operating Expense Ratio
  - Break-Even Occupancy
  - Gross Rent Multiplier (GRM)

- Loan Information:
  - Loan Amount
  - Total Cash Invested

---

### **Tab 3: Scenarios & Projections**

**Current Implementation:**
- **Scenario Analysis:**
  - Best Case (+10% rent)
  - Base Case (as entered)
  - Worst Case (-10% rent)
  - Each shows: Monthly Cash Flow, Cap Rate, CoC Return

- **5-Year Projections:**
  - User configurable assumptions:
    - Annual Rent Growth (%) [default: 3%]
    - Annual Expense Growth (%) [default: 2%]
    - Annual Appreciation (%) [default: 3%]

  - Table columns for each year (1-5):
    - Monthly Rent
    - Annual Income
    - Annual Expenses
    - Cash Flow
    - Property Value
    - Equity
    - Total Return (%)

---

## 🧮 Current Financial Calculation Logic

**File:** `frontend/src/utils/calculatorUtils.ts`

**Formulas Implemented:**

1. **Monthly Mortgage Payment:**
   ```
   P = Principal × [r(1+r)^n] / [(1+r)^n - 1]
   where r = monthly interest rate, n = number of payments
   ```

2. **Cap Rate:**
   ```
   Cap Rate = (Annual NOI / Purchase Price) × 100
   ```

3. **Cash on Cash Return:**
   ```
   CoC = (Annual Cash Flow / Total Cash Invested) × 100
   ```

4. **1% Rule:**
   ```
   1% Rule = (Monthly Rent / Purchase Price) × 100
   ```

5. **Debt Coverage Ratio:**
   ```
   DCR = NOI / Annual Debt Service
   ```

6. **Deal Score Algorithm (0-100):**
   - Based on weighted scoring of:
     - Cash Flow (positive/negative)
     - CoC Return (target: >8%)
     - Cap Rate (target: >6%)
     - 1% Rule (target: ≥1%)
     - DCR (target: >1.25)

---

## ❓ QUESTIONS FOR REAL ESTATE GPT

### **Part 1: Financial Model Accuracy**

1. **Are we missing critical calculations?**
   - What metrics do professional real estate investors ALWAYS look at that we don't have?
   - Should we calculate IRR (Internal Rate of Return)?
   - What about equity multiple over hold period?
   - Tax benefits (depreciation, mortgage interest deduction)?

2. **Is our Deal Score algorithm realistic?**
   - Current weights seem arbitrary. What should they be?
   - Are our targets (8% CoC, 6% Cap, etc.) correct for 2026 market?
   - Should targets vary by property type or market?

3. **Projection Accuracy Issues:**
   - We use simple linear growth (3% rent, 2% expenses, 3% appreciation)
   - **You mentioned rent increases compound more profit** - how should we model this better?
   - Should we account for:
     - Inflation effects?
     - Market cycles?
     - Mortgage paydown acceleration?
     - Principal reduction building equity?
     - Refinance opportunities?

4. **What are we calculating WRONG?**
   - Any formula errors or oversimplifications?
   - Common rookie mistakes in real estate calculators?

---

### **Part 2: Missing Features & Data Points**

1. **What inputs should we add?**
   - Bedroom/bathroom count (affects rent)?
   - Square footage?
   - Property age (affects maintenance)?
   - Local market data (avg rent/sqft, vacancy rates)?
   - Seller concessions?
   - Opportunity zones / tax incentives?

2. **What outputs/reports are missing?**
   - Should we show amortization schedule?
   - Equity buildup chart?
   - Breakeven analysis?
   - Sensitivity analysis (what-if scenarios)?
   - Exit strategy modeling (when to sell)?

3. **How should different investment strategies change calculations?**
   - BRRRR: needs ARV (After Repair Value), cash-out refi modeling
   - House Hack: needs to split personal vs rental income
   - Fix & Flip: needs holding costs, selling costs, flip timeline
   - Commercial: different financing, cap rate expectations

---

### **Part 3: Simple vs Advanced Mode Design**

**GOAL:** Create two user experience modes for different skill levels.

#### **Simple Mode (Target: First-time investors, house hackers)**

**What should Simple Mode include?**
- Minimum inputs needed for basic analysis?
- Which metrics are most important for beginners?
- How to present data without overwhelming?
- Should we pre-fill conservative assumptions?
- What education/tooltips are critical?

**Suggested Simple Mode Flow:**
```
1. Property Price: $______
2. Down Payment: ____%
3. Expected Rent: $______
4. Monthly Expenses (estimated): $______

→ Show: "Can you afford this?" (Yes/No)
→ Show: Monthly profit/loss
→ Show: 3 key metrics only
→ Hide: Everything else
```

**Your expert input:**
- Is this too simple or just right?
- What 3-5 metrics matter most to beginners?
- Should Simple mode have scenario analysis?

---

#### **Advanced Mode (Target: Experienced investors, analyzing portfolios)**

**What should Advanced Mode include?**
- All current inputs plus what else?
- Which advanced metrics are essential vs nice-to-have?
- Should we add:
  - Multiple financing options comparison?
  - Portfolio-level analysis (multiple properties)?
  - Market comparables integration?
  - Risk scoring beyond just Deal Score?

**Advanced Features We're Considering:**
- Custom expense categories (user-defined)
- Multiple exit strategies modeled simultaneously
- Tax impact modeling (depreciation, 1031 exchange)
- Leverage analysis (different down payment scenarios)
- Partnership/syndication structure modeling

**Your expert input:**
- What separates a "pro tool" from a "beginner tool"?
- What do institutional investors calculate that we don't?
- Should Advanced mode have AI recommendations?

---

### **Part 4: Landing Page Demo Design**

**Challenge:** Show DealCalculator power WITHOUT requiring signup.

**Current Ideas:**
1. **Option A: Pre-filled Example Property**
   - Load sample property (e.g., "$250K rental in Austin, TX")
   - Let users tweak inputs and see live updates
   - "Sign up to analyze YOUR property"

2. **Option B: Wizard-style Micro Calculator**
   - 3-step quick analysis:
     - Step 1: Property price + down payment
     - Step 2: Expected rent
     - Step 3: Results + CTA to see full analysis

3. **Option C: Comparison Tool**
   - "Is this a good deal?" → Enter price + rent → Instant verdict
   - Show how PropIQ calculates vs "gut feeling"

**Your expert input:**
- Which approach converts better for investors?
- What's the hook that makes investors think "I need this tool"?
- Should demo be Simple mode only, or show Advanced teaser?
- How to demonstrate value in <30 seconds?

---

### **Part 5: Compounding & Time-Value Improvements**

**You mentioned "rents increasing over time compound more profit"**

**Current Issue:**
Our 5-year projection just does:
```javascript
Year 1 Rent: $2,500
Year 2 Rent: $2,500 × 1.03 = $2,575
Year 3 Rent: $2,575 × 1.03 = $2,652
// etc.
```

But we're NOT showing:
- How equity compounds (principal paydown + appreciation)
- How cash flow improves as rents increase but mortgage stays fixed
- How total return accelerates over time
- Opportunity cost vs other investments

**How should we model compounding better?**

1. **What should Year 5 analysis include that Year 1 doesn't?**
   - Lower loan balance?
   - Higher equity position?
   - Improved cash flow from rent increases?
   - Refinance opportunities?
   - Tax benefits accumulated?

2. **Should we show "Total Wealth Built" calculation?**
   ```
   Total Wealth =
     (Cumulative Cash Flow) +
     (Equity from Appreciation) +
     (Equity from Principal Paydown) +
     (Tax Savings) -
     (Opportunity Cost?)
   ```

3. **How to visualize compounding for users?**
   - Chart showing equity growth curve?
   - Year-by-year wealth accumulation table?
   - "After 5 years, you'll have $X in equity + $Y in cash flow"?

---

## 🎨 UI/UX Considerations

**Current Design:** Glassmorphism aesthetic (translucent cards, blur effects, modern)

**Questions:**
1. How to present Simple vs Advanced toggle?
   - Toggle switch in header?
   - Separate pages?
   - Expandable sections (start simple, click for advanced)?

2. Where to put education/help content?
   - Tooltips on every field (current approach)?
   - "Learn More" links?
   - Video tutorials?
   - AI chat assistant explaining metrics?

3. How to handle mobile experience?
   - Is full calculator too complex for mobile?
   - Should mobile force Simple mode?
   - Progressive disclosure (show more as user scrolls)?

---

## 📈 Success Metrics We Care About

**For the Calculator:**
- Accuracy of analysis vs professional underwriting
- User confidence in making investment decisions
- Time to complete analysis (target: <5 minutes)
- Conversion rate from demo to paid signup

**For Simple/Advanced Feature:**
- % of users starting in Simple mode
- % upgrading to Advanced mode
- Retention difference between Simple vs Advanced users
- Support tickets reduced by better UX

---

## 🚀 Specific Deliverables Needed From GPT

### **Deliverable 1: Calculator Enhancement Spec**
A prioritized list of:
1. Missing calculations to add (with formulas)
2. Input fields to add (with validation ranges)
3. Metrics to remove (if any are useless/misleading)
4. Algorithm improvements (better Deal Score, better projections)

### **Deliverable 2: Simple Mode Spec**
- Exact inputs to show (minimum viable)
- Exact metrics to display (3-5 only)
- User flow from landing → demo → signup
- Copy/messaging for each step

### **Deliverable 3: Advanced Mode Spec**
- Additional inputs beyond Simple
- Additional metrics and reports
- Advanced features (sensitivity analysis, multi-scenario, etc.)
- How to surface complexity without overwhelming

### **Deliverable 4: Compounding Model Upgrade**
- Improved projection algorithm
- How to calculate and display wealth building
- Visualization recommendations
- What to show year-by-year

### **Deliverable 5: Demo Strategy**
- Landing page calculator design (wireframe-level detail)
- Hook/value prop to get signups
- Sample property data to pre-load
- A/B test ideas

---

## 🔧 Technical Constraints

**What you should know:**
- React + TypeScript frontend
- Forms built with React Hook Form + Zod validation
- Real-time calculations (every input change recalculates)
- No backend calculations (all client-side for speed)
- Mobile-responsive required
- Accessibility (WCAG 2.1 AA) required

**What's possible:**
- Complex calculations (we can add any formula)
- Charts/visualizations (we can add libraries)
- Conditional logic (show/hide based on inputs)
- Multi-step wizards
- AI integration (we have Azure OpenAI)

---

## 💡 Inspiration & Competitors

**Tools we admire:**
- BiggerPockets Calculator (industry standard)
- DealCheck (mobile-first approach)
- Rehab Valuator (detailed rehab modeling)
- Propstream (market data integration)

**What makes PropIQ different:**
- AI-powered analysis (not just calculator)
- Beautiful modern UI (not clunky old tools)
- Guided experience (not just spreadsheet)
- Learning platform (not just tool)

---

## ❓ Open Questions for Your Expertise

1. **Market Realities (2026):**
   - What are typical cap rates by market tier (A, B, C, D)?
   - What's a "good" cash-on-cash return today?
   - How much have rents increased historically (10yr average)?
   - What appreciation rates are realistic?

2. **Investment Psychology:**
   - What makes investors pull the trigger on a deal?
   - What red flags make them walk away?
   - How do beginners vs pros evaluate deals differently?
   - What fears/objections do first-time investors have?

3. **Tool Adoption:**
   - Why do investors abandon calculator tools mid-analysis?
   - What features drive upgrades from free to paid?
   - How often do investors reuse the same tool?
   - What makes a calculator "trustworthy"?

4. **Future Features:**
   - Market data API integration (rent comps, sales comps)?
   - Property search integration (Zillow, Realtor.com)?
   - Deal sharing/collaboration features?
   - Portfolio tracking over time?
   - Mobile app necessity?

---

## 📞 How to Respond

**Please provide:**

1. **Critical Fixes First:**
   - "You're calculating X wrong - here's the correct formula..."
   - "You're missing Y metric which is essential because..."
   - "Your Deal Score is flawed because..."

2. **Simple Mode Design:**
   - "Simple mode should ONLY ask for: [list]"
   - "Simple mode should ONLY show: [list]"
   - "Here's the exact flow: Step 1 → Step 2 → Step 3"

3. **Advanced Mode Design:**
   - "Advanced mode must add: [prioritized list]"
   - "Advanced investors need to see: [list]"
   - "Here's how to organize it: [structure]"

4. **Compounding Model:**
   - "Year-over-year should calculate: [formula]"
   - "You need to show: [specific metrics]"
   - "Visualize it like this: [description]"

5. **Demo Strategy:**
   - "Landing page demo should: [specific approach]"
   - "Pre-fill with: [example property details]"
   - "The hook is: [value proposition]"

---

## 🎯 Ultimate Goal

**Create the most accurate, user-friendly, and conversion-optimized real estate calculator that:**
- Beginners feel confident using (Simple mode)
- Pros trust for serious deals (Advanced mode)
- Converts landing page visitors to paid users (Demo)
- Accurately models wealth-building over time (Compounding)

**Your expertise is critical to achieving this. Please be brutally honest about what we're doing wrong and what we must improve.**

---

**END OF BRIEF**

*Ready for your expert analysis and recommendations!*
