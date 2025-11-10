# PropIQ Demo Script — REFINED FOR LINKEDIN INTERVIEW
**Total Runtime: 2:00 | Aligned with Actual Product Capabilities**

---

## 🎯 DEMO OVERVIEW

**Goal**: Show a working product that solves a real problem for real estate investors
**Format**: Live screen share with real-time interaction
**Tone**: Confident, concise, product-focused (not salesy)

---

## 🎣 HOOK (0:00–0:10)
**[Screen: You on PropIQ dashboard, usage badge visible showing "3/5 analyses used"]**

> "You're a real estate investor evaluating 10 properties this week. Each one takes 20-30 minutes to research: pulling comps, calculating cash flow, checking neighborhood trends. By the time you finish, someone else already made an offer."

**Why this works**: Specific, relatable pain point with time pressure

---

## 😤 PROBLEM (0:10–0:22)
**[Screen: Quick cut showing messy spreadsheet + Zillow tabs open]**

> "Right now, investors juggle spreadsheets, mortgage calculators, and guesswork just to figure out if a deal is worth pursuing. The tools exist, but they're scattered. You need 5 tabs open and still don't have confidence in your numbers."

**Why this works**: Acknowledges existing solutions but shows fragmentation

---

## 💡 SOLUTION INTRO (0:22–0:28)
**[Screen: PropIQ dashboard fades in clearly]**

> "That's why I built PropIQ. It's a single platform that combines financial modeling with AI-powered market research — so you can vet a deal in under 60 seconds."

**Why this works**: Clear value prop, mentions AI (shows technical depth)

---

## 🖥️ LIVE DEMO (0:28–1:38)
**[THIS IS THE CRITICAL SECTION — Practice this until flawless]**

### **Step 1: Deal Calculator — Instant Financial Analysis (0:28–0:50)**
**[Screen: Click "Deal Calculator" if not already open]**

> "Let's say I find a duplex in Phoenix listed at $385,000."

**[Type values in real-time as you speak — don't pre-fill]:**
- Purchase Price: $385,000
- Down Payment: 20% ($77,000)
- Interest Rate: 7%
- Loan Term: 30 years
- Monthly Rent (per unit): $1,900 × 2 = $3,800
- Property Taxes: $320/month
- Insurance: $150/month
- Maintenance: 5% of rent = $190/month
- Vacancy Loss: 5% = $190/month

**[Results populate immediately — highlight Deal Score]**

> "Instantly, I see a **Deal Score of 68 out of 100** — that's a 'Good' deal. Monthly cash flow: **positive $510**. Cap rate: **6.8%**. All calculated in real-time, no separate mortgage calculator needed."

**[Switch to "Advanced Metrics" tab briefly]**

> "I can dig deeper: Cash-on-Cash return is **7.9%**, which beats most index funds. The 1% Rule shows rent is 0.99% of purchase price — close to the target."

**Why this works**:
- Shows live calculation (not pre-recorded)
- Uses realistic numbers
- Demonstrates understanding of real estate metrics

---

### **Step 2: PropIQ AI Analysis — Market Intelligence (0:50–1:15)**
**[Screen: Scroll down to "PropIQ Analysis" section or navigate to it]**

> "Now, the calculator tells me the deal *could* work — but what about the neighborhood? What are the risks I'm missing?"

**[Click "New Analysis" and type address]:**
- Address: "1234 E Roosevelt St, Phoenix, AZ 85006"
- Purchase Price: $385,000 (auto-filled)
- Monthly Rent: $3,800 (auto-filled)

**[Click "Run PropIQ Analysis" — show loading spinner for 3-5 seconds]**

> "PropIQ uses GPT-4 to analyze market data, neighborhood trends, and risk factors."

**[Analysis results appear — structured JSON with sections]**

**[Highlight key sections as you narrate]:**

> "Here's what it found:
> - **Market Score: 78 out of 100** — Phoenix's Roosevelt district is appreciating
> - **Recommendation: Buy, but negotiate** — property is priced 8% above market value
> - **Risk Level: Medium** — rising interest rates could impact future appreciation
> - **Key Insight**: 'Strong rental demand from Arizona State students and young professionals nearby'
>
> It even suggests **next steps**: 'Request seller concessions, get pre-approved for financing, schedule inspection within 7 days.'"

**Why this works**:
- Shows AI in action (not just form filling)
- Demonstrates real intelligence (not generic responses)
- Highlights structured output (shows engineering rigor)

---

### **Step 3: Usage Tracking & Monetization (1:15–1:28)**
**[Screen: Point to usage badge in header showing "4/5 analyses used"]**

> "Notice the usage badge: I've used 4 of my 5 free trial analyses. When I hit the limit, users see this:"

**[Click "Run Analysis" again to trigger paywall modal]**

**[Paywall modal appears: "You've reached your free trial limit"]**

> "Instead of surprise overages, we show honest pricing: upgrade to **Starter for $69/month** and get 30 analyses, or just **buy 10 more for $5**. No hidden fees."

**[Close modal, show pricing page briefly]**

> "This pricing model came from user feedback — investors hate getting billed $500 unexpectedly. We cap usage and make top-ups cheap."

**Why this works**:
- Shows you understand business model
- Demonstrates user-centric design thinking
- Proves the product is monetized (not just a demo)

---

### **Step 4: Support Agent & Iteration Loop (1:28–1:38)**
**[Screen: Click "Need Help?" chat button in bottom-right]**

**[Chat opens, type a question]:**

> "How many analyses do I have left?"

**[AI responds instantly]:**

> "You have 1 analysis remaining out of your 5 free trial analyses. Would you like to upgrade or purchase a top-up pack?"

**[Point to chat response]**

> "This isn't a static FAQ. The support agent has **function calling** — it actually checks my account in real-time. It can also schedule demos, create support tickets, or award promotional credits."

**[Click feedback widget button]**

> "And users can give instant feedback through this Tally form — which auto-populates their tier and user ID so we know who's asking for what."

**Why this works**:
- Shows advanced technical feature (function calling)
- Demonstrates product iteration mindset
- Proves you're tracking user feedback

---

## 🚀 WRAP-UP (1:38–2:00)

**[Screen: Return to dashboard, show clean UI]**

> "So that's PropIQ: unlimited financial modeling, AI-powered market research, and honest usage-based pricing.
>
> **What I learned building this:**
> - Users don't want another spreadsheet — they want **confidence in their numbers**
> - AI is only valuable if it's **fast and structured** — generic chatbots don't cut it
> - Transparent pricing prevents churn — **hard caps beat surprise bills**
>
> **What's next:**
> - PDF export so investors can share analyses with partners
> - Property comparison tool for side-by-side deal analysis
> - Watchlists and market alerts to increase stickiness
>
> The product is live at **propiq.luntra.one**, backend is deployed on Azure, frontend on Netlify. We're at ~50 beta users with 15% free-to-paid conversion."

**[End screen: Show PropIQ dashboard one final time]**

---

## 🎬 POST-DEMO Q&A PREP

### **Likely Questions After Demo:**

**Q: "How do you ensure the AI analysis is accurate?"**
> "Great question. Right now, PropIQ uses Azure OpenAI's GPT-4o-mini, which is trained on public real estate data but doesn't have live MLS access. The analysis provides directional insights — market score, risk level, key considerations — but I always recommend users verify with local agents or appraisers.
>
> On the roadmap: integrate with Zillow API or Redfin for live comps, and possibly train a fine-tuned model on historical PropIQ analyses that users rated as 'accurate.'"

**Q: "What's your unit economics?"**
> "COGS per analysis is $0.15 (Azure OpenAI token costs). At the Starter tier ($69/month for 30 analyses), that's $4.50 in costs, so **93.5% gross margin**. Even at scale with millions of analyses, the model inference costs stay low because we use GPT-4o-mini (optimized for cost) instead of full GPT-4.
>
> Customer acquisition is the bigger cost — that's TBD as we haven't started paid ads yet. Organic traffic from real estate communities (BiggerPockets, Reddit) is driving initial signups."

**Q: "Who are your competitors?"**
> "Direct competitors:
> - **Zillow/Redfin**: Have calculators but no AI analysis, and they're focused on transactions (not investor tools)
> - **PropStream/RealData**: More comprehensive data but $100-300/month and overwhelming UI
> - **DealCheck**: Similar calculator, but no AI, and clunky mobile experience
>
> Our moat is combining **ease of use** (simple inputs, instant results) with **AI intelligence** (neighborhood insights, risk assessment). The support agent with function calling is also unique — no competitor has that."

**Q: "How did you validate this idea?"**
> "I'm a real estate investor myself (own 2 rental properties), so I was building for my own pain point. Before coding, I interviewed 15 investors in my network. Top complaints:
> 1. 'I waste hours on properties that don't pencil out'
> 2. 'Spreadsheets are error-prone'
> 3. 'I don't trust Zillow's Zestimate'
>
> I built an MVP calculator first, got 10 people using it. Feedback: 'This is great but I still have to research the neighborhood separately.' That's when I added the AI analysis. Conversion jumped from 5% to 15%."

**Q: "What's the biggest technical challenge you faced?"**
> "Two big ones:
>
> 1. **Structured AI outputs**: Early versions of PropIQ returned free-form text analysis, which was hard to display cleanly. I switched to JSON schema enforcement using Pydantic models, so the AI always returns `{summary, location, financials, pros, cons}` in a predictable structure. This also makes it easier to add features like comparison later.
>
> 2. **Function calling in support chat**: Getting the AI to decide *when* to call a function vs. just respond with text was tricky. I solved it by giving very clear tool descriptions and examples in the prompt, plus tracking which tools are used per conversation so I can refine the prompts based on real usage."

**Q: "Why FastAPI instead of Django/Flask?"**
> "Three reasons:
> 1. **Async by default** — important for AI API calls which can take 5-10 seconds
> 2. **Automatic OpenAPI docs** — FastAPI generates Swagger UI for free, makes testing easier
> 3. **Pydantic integration** — input validation and JSON schema enforcement built-in
>
> Django is great for CRUD apps, but FastAPI is faster to iterate for API-first architectures. Plus, the Python ecosystem for AI (OpenAI SDK, LangChain, etc.) integrates better with FastAPI."

**Q: "How would you scale this to 10,000 users?"**
> "Current architecture can handle it:
> - **Backend**: Azure Web App scales horizontally (just increase instance count)
> - **Database**: Supabase PostgreSQL has read replicas and connection pooling
> - **Frontend**: Netlify CDN serves static assets globally
> - **AI**: Azure OpenAI has rate limits, but we can request quota increases or add fallback to Anthropic/Gemini
>
> The only concern is database query performance. Right now, queries are simple (user lookup, usage tracking), but if we add features like 'show all analyses with cap rate > 7%', we'll need indexes on `financials.capRate`. We've already planned for this — the Supabase schema supports JSON indexes."

**Q: "What's your 6-month roadmap?"**
> "Three pillars:
>
> **1. Stickiness (reduce churn):**
> - Watchlists (save favorite properties)
> - Market alerts (notify when cap rates drop in a ZIP code)
> - Comparison tool (side-by-side deal analysis)
>
> **2. Monetization (increase LTV):**
> - Elite tier API access ($500/month for teams)
> - White-label option for real estate coaching programs
> - Referral program (give 5 free analyses, earn $10 per signup)
>
> **3. Data Quality (improve AI accuracy):**
> - Integrate Zillow API for live comps
> - Fine-tune model on user-rated analyses
> - Add confidence intervals ('Market score: 78 ± 5')"

---

## 📋 DEMO CHECKLIST (Print & Practice)

### **Before Demo:**
- [ ] Clear browser cache (avoid autocomplete issues)
- [ ] Pre-research property address that will work (Arizona preferred for live data)
- [ ] Test PropIQ analysis endpoint (make sure Azure backend is up)
- [ ] Check usage badge shows correct count
- [ ] Verify paywall triggers at 5 analyses
- [ ] Confirm support chat responds (test function calling)
- [ ] Close all unrelated browser tabs

### **During Demo:**
- [ ] Speak slowly and clearly (you're screen sharing)
- [ ] Narrate what you're doing before you do it ("Now I'll enter the purchase price...")
- [ ] Pause after key moments (let them absorb the deal score)
- [ ] Make eye contact (don't just read the screen)
- [ ] Show confidence in your product (you built this!)

### **After Demo:**
- [ ] Ask "What questions do you have?" (not "Any questions?")
- [ ] Have propiq/IMPLEMENTATION_SUMMARY.md open in case they ask deep technical questions
- [ ] Be ready to share GitHub repo or architecture diagram

---

## 🎯 SUCCESS CRITERIA

You'll know your demo worked if they ask:
1. "Can I try it myself?" (shows interest)
2. "How do you handle [technical detail]?" (shows they're evaluating your skills)
3. "What if [edge case]?" (shows they're thinking about product design)

If they say "Cool" and move on, your demo was too surface-level. Go deeper on **why** you made technical choices, not just **what** the features are.

---

## 🚀 FINAL TIPS

### **What Makes a Great Demo:**
- **Narrate your thinking**: "I'm adding a 5% vacancy rate because that's standard for Phoenix"
- **Show, don't tell**: Type values in real-time instead of pre-filling
- **Embrace imperfections**: If loading takes 5 seconds, explain "Azure OpenAI typically responds in 3-8 seconds depending on traffic"
- **Connect to business outcomes**: "This $510/month cash flow is what investors care about — positive cash flow beats appreciation for beginners"

### **What Kills a Demo:**
- Pre-recorded video (feels like marketing, not product)
- Reading from a script (sounds robotic)
- Technical failures without recovery ("Hmm, it's not working...")
- Glossing over AI results ("And here's the analysis, moving on...")

### **Practice Drill:**
1. Do the demo 5 times alone (get comfortable with flow)
2. Do it once for a friend (get feedback on clarity)
3. Do it once while recording (watch yourself, fix awkward pauses)
4. Do it one final time with a timer (make sure it's under 2 minutes)

---

## 🎤 ONE-LINER SUMMARY (If Asked to Describe PropIQ in 10 Seconds)

> "PropIQ is Zillow's mortgage calculator meets ChatGPT for real estate investors. You enter a property address, get instant financial analysis plus AI-powered neighborhood research, and know whether to make an offer — all in under 60 seconds."

Good luck! 🚀
