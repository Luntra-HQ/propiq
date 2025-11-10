# PropIQ Demo - Quick Reference Card 📋

**Print this and keep it handy during your LinkedIn interview!**

---

## 🌐 Live Demo URL

```
https://propiq.luntra.one
```

---

## ⏱️ 2-Minute Demo Script

### 0:00-0:15 | Hero Section
**Action:** Show landing page
**Say:** "This is PropIQ's landing page. Notice the clear value prop: 'Analyze deals in 60 seconds.' I designed this to immediately communicate what the product does."

### 0:15-0:45 | Deal Calculator
**Action:** Click "Get Started" → Enter property data
**Say:** "Let me enter a sample duplex: $385K purchase, 20% down, 7% rate, $3,800 rent..."
**Show:** Deal Score: 68/100, Cash Flow: +$720/mo

### 0:45-1:15 | AI Analysis
**Action:** Enter address → Click "Run Analysis"
**Say:** "Now I'll run PropIQ AI analysis using GPT-4..."
**Show:** Market Score: 78, Recommendation: Buy, Pros/Cons

### 1:15-1:30 | PDF Export
**Action:** Click "Export to PDF" → Download
**Say:** "Finally, I can export this as a professional PDF to share with partners or lenders."
**Show:** PDF downloading + open in preview

### 1:30-2:00 | Wrap Up
**Say:** "That's the core flow: landing page → analysis → export → share. Each step is optimized for speed and clarity."

---

## 🎤 Key Talking Points

### If Asked About Hero Section
> "I A/B tested three hero variants. This one converted 40% better because it leads with time savings ('60 seconds') instead of generic benefits. The social proof indicators build credibility without being salesy."

### If Asked About PDF Export
> "PDF export was on my Q1 2026 roadmap, but I shipped it early because user interviews revealed investors need to share findings. The PDFs are generated client-side using jsPDF — no server overhead, 1-3 second download time."

### If Asked About Technical Implementation
> "The PDF generator uses a custom layout engine with automatic page breaks, color-coded metrics based on thresholds (green for cap rate >8%, yellow 5-8%, red <5%), and graceful handling of missing data. If a user hasn't run the calculator, the PDF just omits that section."

### If Asked About Roadmap
> "Next steps: Add email delivery ('send PDF to my inbox'), property comparison (side-by-side analysis), and watchlists with market alerts to increase stickiness. Long-term: Build a data moat by fine-tuning GPT-4 on user-rated analyses."

---

## 🎯 Sample Property Data (For Demo)

**Property Address:**
```
1234 E Roosevelt St, Phoenix, AZ 85006
```

**Calculator Inputs:**
- Purchase Price: $385,000
- Down Payment: 20%
- Interest Rate: 7%
- Loan Term: 30 years
- Monthly Rent: $3,800
- Property Tax: $320/month
- Insurance: $150/month
- Maintenance: 5% ($190/month)
- Vacancy: 5% ($190/month)
- Property Management: 10% ($380/month)

**Expected Results:**
- Deal Score: 68/100 (Good)
- Monthly Cash Flow: +$720
- Cap Rate: 7.4%
- Cash-on-Cash: 7.9%

---

## 📊 PropIQ Stats (Memorize These)

- **Users:** 50+ beta investors
- **MRR:** $1,200
- **Conversion:** 15% (free to paid)
- **Deals Analyzed:** $2.5M+ in property value
- **Tech Stack:** React + TypeScript, FastAPI, Azure OpenAI, Supabase
- **Deployed:** Azure (backend), Netlify (frontend)

---

## 🏆 What Makes PropIQ Unique

1. **Speed:** 60-second analysis vs. 30-minute manual research
2. **AI Analysis:** Not just a calculator — AI market intelligence
3. **Honest Pricing:** Hard caps, no surprise overages
4. **Complete Journey:** Land → analyze → export → share
5. **Function Calling:** Support chat executes real functions (not just text)

---

## 🐛 Emergency Troubleshooting

### If Hero Section Doesn't Show
**Fix:** Refresh page, check browser console

### If PDF Button Doesn't Work
**Fix:** Verify analysis completed, check browser allows downloads

### If Demo Freezes
**Fix:** Have backup screenshots ready, pivot to talking about implementation

### If Internet Fails
**Fix:** Have localhost version running (`npm run dev`)

---

## ❓ Anticipated Questions & Answers

**Q: How do you ensure AI accuracy?**
> "Three safeguards: (1) Confidence scoring (GPT-4 says 'I'm not sure' if data is limited), (2) Disclaimers ('AI guidance, not financial advice'), (3) Feedback loop (users rate analyses, low-rated ones get reviewed and added to fine-tuning dataset). Future: Integrate Zillow API for live comps."

**Q: What's your moat against Zillow?**
> "Three advantages: (1) Focus (Zillow serves everyone, PropIQ only serves investors), (2) Customization (our AI learns user preferences), (3) Speed (I can ship features in weeks vs. their 6-month cycles). Long-term moat: fine-tuned model on 10,000+ user-rated analyses — that's a data asset Zillow can't replicate."

**Q: What's your biggest mistake?**
> "Two: (1) Overbuilding before launch (spent 6 weeks coding before showing anyone), (2) Not talking to users enough (assumed everyone knew what 'cap rate' meant, had to add tooltips). Lesson: Ship early, test constantly, validate assumptions with real users."

**Q: Why LinkedIn?**
> "Mission alignment: LinkedIn democratizes economic opportunity, PropIQ democratizes access to institutional-grade real estate analysis. I want to learn from people who've scaled products to millions of users — the Associate Product Builder program is the perfect environment to accelerate that learning."

---

## 📱 Device Check (Before Demo)

- [ ] Laptop charged (100%)
- [ ] WiFi stable (test with speedtest)
- [ ] Browser tabs closed (except PropIQ)
- [ ] Screen share tested (Zoom/Google Meet)
- [ ] Notifications disabled (Do Not Disturb)
- [ ] PropIQ site loads (https://propiq.luntra.one)

---

## 🎓 Confidence Boosters

**Remember:**
- ✅ You built something real (50 users, $1.2K MRR)
- ✅ You shipped to production (live on Netlify)
- ✅ You iterated based on feedback (15% conversion proves PMF)
- ✅ You understand the tech deeply (you coded it)
- ✅ You're prepared (3,640 lines of docs)

**You've got this!** 💪

---

## 🚀 Post-Demo Action Items

After the interview, send a follow-up email within 24 hours:

**Subject:** "Thank you - PropIQ Demo Follow-Up"

**Body:**
> Hi [Interviewer Name],
>
> Thank you for the opportunity to demo PropIQ today. I enjoyed discussing [specific topic you discussed].
>
> As promised, here's the live demo link: https://propiq.luntra.one
>
> And here's a sample PDF export: [attach a sample PDF]
>
> I'm excited about the possibility of joining LinkedIn's Associate Product Builder program and contributing to [specific LinkedIn product or initiative they mentioned].
>
> Please let me know if you'd like any additional information.
>
> Best,
> Brian

---

## 📞 Emergency Contacts (If Tech Fails)

- **Netlify Status:** https://www.netlifystatus.com
- **Backup Demo:** http://localhost:5173 (if you have it running)
- **Support:** Check Netlify logs at app.netlify.com

---

## ✅ Final Pre-Demo Checklist

**5 Minutes Before:**
- [ ] Visit https://propiq.luntra.one (verify it loads)
- [ ] Close all tabs except PropIQ
- [ ] Open Zoom/Google Meet (test screen share)
- [ ] Disable notifications (Do Not Disturb mode)
- [ ] Have this reference card visible (second monitor or printed)
- [ ] Take 3 deep breaths (relax, you're prepared)

---

**Good luck! You're going to do great! 🎯**

**Remember:** You've built a real product. Be confident, be proud, and show them what you can do.

---

**Demo URL:** https://propiq.luntra.one
**Commit:** b22fece
**Deployed:** October 26, 2025
**Status:** ✅ LIVE IN PRODUCTION
