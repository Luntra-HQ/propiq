# PropIQ Onboarding Conversation Guide
**Quick Reference for Screenshares & AI Assistant Context**

---

## 🎯 Before the Call: Quick Prep Checklist

### Information to Gather:
- [ ] Property address (if they have one)
- [ ] Property type (single family, condo, apartment, etc.)
- [ ] Investment goal (rental investment, buy vs rent, house hack, live-in, etc.)
- [ ] Has HOA? If yes, what's the monthly fee?
- [ ] Are they considering renting out rooms? (for house hack scenarios)

---

## 📋 Scenario-Specific Guides

### Scenario: Luxury Apartment Analysis (Your Frat Brother's Case)

**The Setup:**
- IT professional
- Looking into luxury apartment
- Possibly downsizing
- Has HOA fees

**Questions to Ask First:**
1. "Are you looking at this as a rental investment, or to live in?"
   - **Rental:** Use Deal Calculator in "Traditional Rental" mode
   - **Live-in:** No rent vs buy tool, but can calculate costs

2. "Are you thinking about renting out rooms to roommates?"
   - **Yes:** Use "House Hack" strategy, but warn about limitations
   - **No:** Use "Traditional Rental" if investment, or just calculate costs if live-in

3. "What's the HOA monthly fee?"
   - **Important:** Must include this in calculator

**What PropIQ Can Do:**
✅ Calculate if it's a good rental investment (deal score, cash flow)  
✅ Support HOA fees in calculations  
✅ Show 5-year projections  
✅ Run scenario analysis (best/worst case)

**What PropIQ Cannot Do:**
❌ Direct "buy vs rent" comparison tool  
❌ Perfect single-apartment house hacking (room rentals)  
❌ Downsizing cost comparison (vs current housing)

**The Demo Flow:**

1. **Start with AI Property Analysis** (if they have address)
   - Show: Quick insights, deal score
   - Set expectation: "This is AI-powered, use as starting point"

2. **Open Deal Calculator - Basic Tab**
   - Fill in together: Price, down payment, interest rate
   - **Critical:** Include HOA fees!
   - Enter rent potential (check market rates if unknown)
   - Show deal score and monthly cash flow

3. **Show Advanced Tab**
   - Explain key metrics: Cap rate, Cash-on-Cash return, DSCR
   - "These tell you if it's actually profitable"

4. **Show Scenarios Tab**
   - "What if rent is lower? What if expenses are higher?"
   - Show best case vs worst case
   - "Can you survive the worst case?"

**Key Talking Points:**
- "PropIQ tells you if it's a good rental investment. For buy vs rent, you'll need to compare monthly costs manually."
- "House hacking works great for multi-unit (duplex+). For single apartments with room rentals, we support it but you may need to adjust the income number to reflect what you can actually rent rooms for."
- "HOA fees can eat into cash flow - make sure the numbers still work after including them."

**If They Ask About House Hacking:**
- ✅ "Yes, we have a House Hack strategy option"
- ⚠️ "It's designed for multi-unit (you live in one unit, rent others)"
- ⚠️ "For single apartments, if you're renting rooms, you'll want to use the House Hack option but adjust the income to what you can actually get for room rentals"
- ⚠️ "Also check HOA rules - some don't allow room rentals"

**If They Ask About Buy vs Rent:**
- ❌ "We don't have a dedicated rent vs buy comparison tool yet"
- ✅ "But you can use the calculator to see monthly costs (PITI + HOA)"
- ✅ "Compare that to what you'd pay in rent"
- ✅ "Use the 5-year projections to see how rent and property values might change"
- 💡 "I can help you run the numbers manually during our call"

---

## 🤖 For AI Assistant Context

**When asking AI assistants for help:**

### Share This Context:
1. "I'm onboarding someone to PropIQ - they're looking at a luxury apartment with HOA fees"
2. "I need to know: Can PropIQ handle house hacking for a single apartment (renting rooms)?"
3. "Do we have a rent vs buy comparison feature?"
4. "What should I tell them about analyzing apartments with HOA?"

### Reference Documents:
- **Product Capabilities Reference:** `PRODUCT_CAPABILITIES_REFERENCE.md`
- **Comet Assistant Guide:** `COMET_ASSISTANT_GUIDE.md` (for general product info)

### Example AI Prompt:
```
I'm about to do a screenshare with someone interested in PropIQ. They're:
- Looking at a luxury apartment (single unit)
- Has HOA fees
- Considering house hacking (renting out rooms)
- Possibly downsizing

Based on PRODUCT_CAPABILITIES_REFERENCE.md:
1. What can PropIQ do for them?
2. What are the limitations?
3. What should I demonstrate?
4. How should I handle the house hacking question?
```

---

## 📝 Post-Call Notes Template

**Use this to document what came up:**

```
## Onboarding Session - [Date]

**User Profile:**
- Name/Role: [IT professional, etc.]
- Property Type: [Luxury apartment, etc.]
- Goal: [Rental investment, buy vs rent, house hack, etc.]
- HOA: [Yes/No, $X/month]

**Questions They Asked:**
1. [Question]
   - My Answer: [Answer]
   - Follow-up Needed: [Yes/No]

2. [Question]
   - My Answer: [Answer]

**Features Used:**
- [ ] AI Property Analysis
- [ ] Deal Calculator - Basic
- [ ] Deal Calculator - Advanced
- [ ] Scenarios Tab
- [ ] PDF Export

**Pain Points/Limitations:**
- They wanted [X] but PropIQ can't do [Y]
- Workaround we used: [Z]

**Feature Requests:**
- [Request 1]
- [Request 2]

**Next Steps:**
- [ ] Follow up with [X]
- [ ] Send [Y] resource
- [ ] Schedule another call
```

---

## 🚨 Common Questions & Answers

### Q: "Can PropIQ tell me if I should buy or rent?"
**A:** "PropIQ tells you if it's a good rental investment. For buy vs rent decisions, you'll need to manually compare the monthly cost of buying (from our calculator) to what you'd pay in rent. We don't have an automated comparison tool yet, but I can help you work through it during our call."

### Q: "Can I house hack a single apartment?"
**A:** "Yes! We have a House Hack strategy option. It's designed for multi-unit properties, but you can use it for single apartments too. Just make sure to:
1. Adjust the income to reflect what you can rent rooms for (not full unit rent)
2. Check your HOA rules - some don't allow room rentals
3. Include all your expenses including HOA fees"

### Q: "How do HOA fees affect the analysis?"
**A:** "HOA fees reduce your cash flow because they're a monthly expense. In PropIQ, you'll enter them in the 'Monthly Expenses' section. They're fully supported in all our calculations. Just make sure the deal still works after including them - they can be a deal breaker if they're too high relative to the rent."

### Q: "Is this a good deal?"
**A:** "Let's run the numbers! PropIQ will give you a Deal Score from 0-100. Here's what it means:
- 80-100: Excellent investment
- 65-79: Good investment
- 50-64: Fair (marginal)
- Below 50: Probably not worth it

We'll also look at monthly cash flow - that's the most important number for most investors."

### Q: "What if rent is lower than I expect?"
**A:** "Great question! That's exactly why we built the Scenarios tab. You can see what happens if rent is 10% lower and expenses are 10% higher - the worst case. If the deal still works in the worst case, you're in good shape. If it doesn't, you might want to pass or negotiate better terms."

---

## 💡 Pro Tips for Screenshares

1. **Start with a real property** - Use their actual address if possible, or a local example they know
2. **Fill in numbers together** - Don't just show, let them guide the inputs
3. **Explain the "why"** - Not just "this is the deal score" but "this matters because..."
4. **Address limitations upfront** - "Just so you know, PropIQ doesn't have X yet, but here's what we can do..."
5. **Show multiple tabs** - Basic, Advanced, and Scenarios give the full picture
6. **Use scenarios** - "What if rent is lower?" - show them the Scenarios tab
7. **End with next steps** - "Here's what I'd do next if I were you..."

---

**Last Updated:** November 2025  
**Keep This Updated:** Add new scenarios, questions, and answers as you do more onboarding calls

