# PropIQ Product Capabilities Reference
**For AI Assistant Context & Onboarding Discussions**

**Last Updated:** November 2025  
**Purpose:** Provide clear documentation of what PropIQ can and cannot do, so AI assistants and onboarding conversations are accurate.

---

## 🎯 Quick Status Summary

**✅ Fully Built & Working:**
- AI Property Analysis (GPT-4o-mini powered)
- Deal Calculator (Basic, Advanced, Scenarios tabs)
- HOA fee support
- House Hack strategy option
- Apartment building property type
- PDF export
- AI Support Chat
- 5-year projections
- Scenario analysis (best/realistic/worst case)

**❌ NOT Built / Unclear Status:**
- Rent vs Buy comparison feature (explicit comparison tool)
- House hacking for single apartments/condos (only multi-unit supported)
- Rent vs own calculation (different from investment analysis)

**⚠️ Needs Clarification:**
- Can house hacking work properly with HOA fees? (Calculator supports it, but may need verification)
- Single apartment/condo house hacking logic (currently assumes multi-unit)

---

## 📋 Core Features (Currently Live)

### 1. AI Property Analysis
**What it does:**
- Accepts any property address
- Uses GPT-4o-mini to analyze investment potential
- Provides deal score (0-100), cash flow projections, market trends
- Returns pros/cons with actionable next steps

**Limitations:**
- Uses estimates and market data (not always perfect)
- Best used as starting point for due diligence
- Accuracy varies by market data availability

---

### 2. Deal Calculator
**What it does:**
- 3-tab interface: Basic, Advanced, Scenarios
- Real-time financial calculations
- Supports multiple investment strategies:
  - ✅ Traditional Rental
  - ✅ House Hack
  - ✅ BRRRR Strategy
  - ✅ Fix & Flip
  - ✅ Commercial

**Inputs supported:**
- Purchase price, down payment %, interest rate, loan term
- Monthly rent
- Annual property tax, insurance
- **✅ Monthly HOA fees** (fully supported)
- Monthly utilities, maintenance, vacancy reserve, property management
- Closing costs, rehab costs

**Outputs:**
- Deal Score (0-100) with rating (Excellent/Good/Fair/Poor/Avoid)
- Monthly & annual cash flow
- Cap rate, Cash-on-Cash return, 1% rule
- DSCR (Debt Service Coverage Ratio)
- Operating expense ratio
- Break-even occupancy
- 5-year projections with customizable growth rates

---

### 3. Property Types Supported
**Available options:**
- ✅ Single Family Home
- ✅ Multi-Family (2-4 units)
- ✅ Condo
- ✅ Townhouse
- ✅ Apartment Building (5+ units) ← **Relevant for your frat brother**
- ✅ Commercial

**How property type affects analysis:**
- Used in AI analysis context
- May influence default assumptions (HOA more common for condos/apartments)
- Doesn't change calculation logic significantly (user inputs still primary)

---

### 4. Investment Strategies

#### Traditional Rental ✅
- Standard rental property analysis
- Assumes you won't live in the property
- 20-25% down payment typical

#### House Hack ✅
**What it does:**
- Allows selecting "House Hack" as strategy
- **Current implementation:** Assumes you live in one unit, rent others
- Designed for multi-unit properties (duplex, triplex, quadplex)
- May not work perfectly for single apartments/condos with HOA

**Limitations:**
- Doesn't explicitly handle: "Buy apartment, rent out bedroom" scenario
- Doesn't calculate "rent vs own" comparison (different feature)
- HOA fees are supported but may affect house hack viability (needs manual consideration)

**For your frat brother's scenario:**
- He's looking at luxury apartment (likely single unit with HOA)
- House hack strategy exists but designed for multi-unit
- HOA fees supported, but house hacking a single apartment means renting room(s) to roommate(s)
- This may not be properly accounted for in current calculations

#### BRRRR ✅
- Buy, Rehab, Rent, Refinance, Repeat
- Standard BRRRR analysis supported

#### Fix & Flip ✅
- Short-term investment analysis
- Considers rehab costs, holding period

#### Commercial ✅
- Commercial property analysis
- Same calculation engine, different assumptions

---

## ❌ Features NOT Built

### Rent vs Buy Comparison Tool
**Status:** NOT BUILT

**What this would be:**
- Side-by-side comparison: "Should I rent this apartment or buy it?"
- Compares total cost of renting vs buying (including opportunity cost)
- Considers rent increases, appreciation, tax benefits
- Shows break-even point

**Why it matters:**
- Your frat brother is looking at luxury apartment, possibly downsizing
- This is a "buy vs rent" decision, not just "is it a good investment"
- Current PropIQ answers "is it a good rental investment" not "should I buy vs rent"

**Workaround:**
- Use Deal Calculator with House Hack strategy
- Manually compare:
  - Buying: Monthly PITI + HOA + maintenance vs current rent
  - But this doesn't account for opportunity cost, tax benefits, rent increases

---

### Single Apartment House Hacking
**Status:** UNCLEAR / LIMITED SUPPORT

**What house hacking typically means:**
1. **Multi-unit:** Live in one unit, rent others (fully supported)
2. **Single unit:** Buy apartment/condo, rent out bedroom(s) to roommate(s) (limited/unclear)

**For apartments with HOA:**
- HOA fees are supported in calculator
- But house hacking logic assumes multi-unit structure
- Single apartment house hacking = renting rooms, which PropIQ may not handle well

**Reality check needed:**
- Can your frat brother rent out room(s) in his apartment? (HOA rules vary)
- If yes, current calculator may underestimate income or overestimate expenses
- Manual adjustment may be needed

---

## 🔍 Specific Scenarios & Guidance

### Scenario 1: Frat Brother - Luxury Apartment Analysis
**The Situation:**
- IT professional looking into luxury apartment
- Possibly downsizing (moving to apartment from house?)
- Has HOA fees
- Wants to know if it's a good investment

**What PropIQ CAN do:**
1. ✅ Run Deal Calculator with:
   - Purchase price, HOA fees, rent potential
   - Traditional Rental or House Hack strategy
2. ✅ Get deal score and cash flow analysis
3. ✅ See 5-year projections

**What PropIQ CANNOT do well:**
1. ❌ "Should I buy or rent this?" comparison (no rent vs buy tool)
2. ⚠️ House hacking a single apartment (renting rooms) - calculator assumes multi-unit
3. ⚠️ Downsizing analysis - doesn't compare to current housing costs

**Recommended Approach:**
1. Use Deal Calculator in "Traditional Rental" mode first
   - Enter all his numbers (price, HOA, rent potential, etc.)
   - See if it cash flows as rental
2. If he wants to house hack (rent rooms):
   - Use House Hack strategy
   - Manually adjust: Income = rent from rooms (not full unit rent)
   - Keep HOA, utilities, etc. as-is
   - May need to estimate room rental rates (not full unit rent)
3. For "buy vs rent" decision:
   - Calculate monthly cost to buy: PITI + HOA + maintenance
   - Compare to current/expected rent
   - Use scenario analysis to see rent growth projections
   - Manual comparison needed (PropIQ doesn't automate this)

---

### Scenario 2: Apartment Complex Analysis
**If analyzing an apartment BUILDING (5+ units):**
- ✅ Fully supported
- Use Traditional Rental or Commercial strategy
- HOA fees not typically applicable (owner pays maintenance directly)
- Calculator handles multi-unit income well

---

## 📊 What Makes a "Good Deal" in PropIQ

**Deal Score Breakdown:**
- 80-100: Excellent (strong investment)
- 65-79: Good (solid fundamentals)
- 50-64: Fair (marginal, needs improvement)
- 35-49: Poor (weak metrics)
- 0-34: Avoid (negative cash flow or poor returns)

**Key Metrics PropIQ Calculates:**
1. **Monthly Cash Flow** (most important for cash flow investors)
2. **Cap Rate** (target: 8-10%+)
3. **Cash-on-Cash Return** (target: 10-12%+)
4. **1% Rule** (monthly rent ≥ 1% of purchase price)
5. **DSCR** (Debt Service Coverage Ratio, target: ≥1.25)

---

## 🚫 Common Misconceptions / Limitations

### Misconception 1: "PropIQ can tell me if I should buy or rent"
**Reality:** PropIQ tells you if it's a good **rental investment**, not if you should buy vs rent for personal use.

### Misconception 2: "House Hack works for any property"
**Reality:** House Hack strategy designed for multi-unit (duplex+). Single apartment house hacking (renting rooms) needs manual calculation adjustments.

### Misconception 3: "HOA fees break house hacking"
**Reality:** HOA fees are supported in calculator. They reduce cash flow, but house hacking can still work if rent from rooms > costs including HOA. Calculator may not perfectly model single-apartment room rentals though.

### Misconception 4: "All calculations are perfect"
**Reality:** PropIQ uses standard formulas but relies on user inputs. Always verify:
- Property tax rates (often reassessed after purchase)
- Insurance costs (get real quotes)
- Rent estimates (check market rates)
- HOA fees and rules (read HOA docs)

---

## 🎯 During Onboarding / Screenshare

### What to Check Before Demo:
1. **What property type?** (Single family, multi-family, apartment, condo)
2. **Investment goal?** (Rental investment, house hack, buy vs rent decision)
3. **Has HOA?** (If yes, make sure to include in calculator)
4. **Single apartment house hack?** (If yes, warn that manual adjustments may be needed)

### What to Show:
1. **AI Property Analysis** (if they have an address)
2. **Deal Calculator - Basic Tab** (show inputs, deal score, cash flow)
3. **Advanced Tab** (show all the metrics)
4. **Scenarios Tab** (show best/worst case analysis)

### What to Explain:
1. "This shows if it's a good rental investment"
2. "For buy vs rent decisions, you'll need to manually compare costs"
3. "House hack for single apartments may need manual room-rent adjustments"
4. "Always verify HOA rules allow room rentals if house hacking"

---

## 📝 Development Status & Roadmap (For Context)

### Confirmed Built Features:
- ✅ Deal Calculator (full)
- ✅ HOA support
- ✅ House Hack strategy (multi-unit)
- ✅ Apartment building property type
- ✅ Scenario analysis
- ✅ 5-year projections

### Needs Verification:
- ⚠️ Single apartment house hacking logic
- ⚠️ How HOA affects house hack calculations

### Not Built (But Would Be Valuable):
- ❌ Rent vs Buy comparison tool
- ❌ Downsizing analysis (compare to current housing)
- ❌ Single-apartment room rental calculator

---

## 💡 Quick Reference: For Your Frat Brother

**If he's asking: "Should I buy this luxury apartment?"**

1. **If asking as investment (will rent it out):**
   - ✅ Use PropIQ Deal Calculator
   - Enter: Price, HOA, rent potential, all expenses
   - See deal score and cash flow
   - This answers: "Will it cash flow as rental?"

2. **If asking to live in (buy vs rent):**
   - ⚠️ PropIQ doesn't have rent vs buy tool
   - Use calculator to see monthly cost (PITI + HOA)
   - Manually compare to rent
   - Consider: appreciation, tax benefits, flexibility

3. **If asking to house hack (rent rooms):**
   - ⚠️ Calculator has House Hack option but assumes multi-unit
   - Try House Hack strategy anyway
   - Adjust income to reflect room rentals (not full unit rent)
   - Verify HOA allows room rentals (read HOA docs!)

4. **If downsizing:**
   - Not directly supported
   - Compare new monthly cost (from calculator) to current housing cost
   - Consider lifestyle factors (PropIQ doesn't calculate these)

---

## 🔄 How to Use This Document

**For AI Assistants:**
- Reference this before answering PropIQ capability questions
- Quote specific sections when explaining what can/can't be done
- Update this document when new features are built

**For Onboarding:**
- Review relevant scenarios before screenshare
- Set expectations about limitations
- Guide user to right tool/approach

**For Development Planning:**
- Use "Not Built" section for feature requests
- Use "Needs Clarification" for testing/verification tasks
- Update status as features are added

---

**Last Updated:** November 2025  
**Next Review:** When rent vs buy feature is built, or when house hack logic is clarified

