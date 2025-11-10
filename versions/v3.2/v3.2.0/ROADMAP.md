# PropIQ v3.2.0 Roadmap

**Planned Release:** TBD  
**Type:** Minor Release  
**Focus:** Rent vs Buy feature, Enhanced House Hacking

---

## 🎯 Goals

1. Add Rent vs Buy comparison tool
2. Improve house hacking support for single apartments
3. Enhance onboarding experience

---

## ✨ Planned Features

### 1. Rent vs Buy Comparison Tool

**Status:** Not Started  
**Priority:** High  
**Impact:** High

**What it does:**
- Side-by-side comparison: "Should I rent or buy this property?"
- Compares total cost of renting vs buying (including opportunity cost)
- Considers rent increases, appreciation, tax benefits
- Shows break-even point

**Why it matters:**
- Current users asking: "Should I buy this or keep renting?"
- PropIQ currently answers "is it a good investment" not "should I buy vs rent"
- Major differentiator vs competitors

**Implementation Notes:**
- New tab in Deal Calculator: "Rent vs Buy"
- Compare monthly costs (PITI + HOA vs rent)
- Factor in: appreciation, tax benefits, flexibility
- Show visual comparison chart

---

### 2. Enhanced House Hacking for Single Apartments

**Status:** Not Started  
**Priority:** Medium  
**Impact:** Medium

**Current Limitation:**
- House Hack strategy assumes multi-unit (you live in one, rent others)
- Single apartment house hacking (renting rooms) not well supported

**What to improve:**
- Add "Room Rental" calculator option
- Calculate income from individual rooms (not full unit rent)
- Account for HOA rules about room rentals
- Better guidance on HOA restrictions

**Implementation Notes:**
- New input: "Number of rooms to rent"
- New input: "Rent per room"
- Warning if HOA typically restricts room rentals
- Adjust income calculations accordingly

---

### 3. Enhanced Onboarding

**Status:** Not Started  
**Priority:** Medium  
**Impact:** Medium

**What to add:**
- Interactive onboarding tour
- Guided first analysis
- Context-aware help based on property type
- Better explanations of metrics

**Implementation Notes:**
- Use tooltips or guided tour library
- Show example property analysis
- Explain deal score calculation
- Link to relevant guides

---

## 📋 Feature Requests to Consider

### From User Feedback

- [ ] Property comparison (compare 2-3 properties side-by-side)
- [ ] Save favorites/bookmarks
- [ ] Export to Excel/CSV
- [ ] Property alerts (notify when similar properties available)
- [ ] Market trend analysis (historical data)

### From Onboarding Sessions

- [ ] Downsizing cost comparison (compare to current housing)
- [ ] Better handling of single-apartment room rentals
- [ ] HOA rules checker (what's typically allowed)
- [ ] Rent vs Buy decision tool (prioritized ✅)

---

## 🗓️ Timeline (Tentative)

**Phase 1: Planning** (Week 1)
- Finalize Rent vs Buy requirements
- Design UI/UX for new features
- Create detailed technical spec

**Phase 2: Development** (Weeks 2-3)
- Build Rent vs Buy comparison tool
- Enhance house hacking calculations
- Add onboarding improvements

**Phase 3: Testing** (Week 4)
- User testing with beta users
- Fix bugs and refine UX
- Update documentation

**Phase 4: Launch** (Week 5)
- Deploy to production
- Announce to users
- Monitor feedback

---

## 🔗 Related Documentation

- [Feature Requests](./FEATURE_REQUESTS.md)
- [Product Capabilities Reference](../../../PRODUCT_CAPABILITIES_REFERENCE.md)
- [Onboarding Guide](../../../ONBOARDING_CONVERSATION_GUIDE.md)

---

## 📝 Notes

**Key Decision Points:**
1. Should Rent vs Buy be a separate tool or integrated into calculator?
   - **Decision:** Integrated tab (consistent UX)
2. How to handle HOA room rental restrictions?
   - **Decision:** Warn user, but allow calculation (let them decide)
3. What opportunity cost rate to use?
   - **Decision:** User-configurable (default: 7% S&P 500 average)

---

**Last Updated:** November 2025  
**Next Review:** When starting v3.2.0 development

