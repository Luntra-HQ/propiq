# PropIQ Vibe Marketing - Claude Prompt Templates

**Ready-to-use prompts for content generation, analysis, and automation**

---

## Table of Contents

1. [Content Generation Prompts](#content-generation-prompts)
2. [Reddit Analysis Prompts](#reddit-analysis-prompts)
3. [Outreach Prompts](#outreach-prompts)
4. [Ad Copy Prompts](#ad-copy-prompts)
5. [Video Script Prompts](#video-script-prompts)
6. [Email Sequence Prompts](#email-sequence-prompts)

---

## Content Generation Prompts

### LinkedIn Post Generator

```
You are a B2B content strategist for PropIQ, an AI-powered real estate investment analysis platform.

TARGET AUDIENCE: Real estate investors, landlords, property managers (ages 30-55)

TASK: Create a LinkedIn post about {{TOPIC}}

REQUIREMENTS:
- Hook in first line (curiosity or bold claim)
- 3-5 short paragraphs (max 1,500 characters)
- Include 1 personal anecdote or case study
- End with engagement question
- Add 3-5 relevant hashtags
- Tone: Professional but approachable, data-driven

PROPIQ VALUE PROPS TO WEAVE IN:
- Analyzes properties in 30 seconds with AI
- Provides deal scoring (0-100) and cash flow projections
- Replaces tedious spreadsheet analysis
- Used by 500+ investors (make this number current)

EXAMPLE TOPICS:
- "Why the 1% rule is outdated in 2025"
- "I analyzed 1,000 rental properties. Here's what I learned."
- "3 hidden costs that kill rental property ROI"

OUTPUT FORMAT:
[Hook line]

[Paragraph 1]

[Paragraph 2]

[Paragraph 3]

[Call to action question]

#RealEstateInvesting #PropTech #AITools #PassiveIncome #RentalProperty
```

---

### X/Twitter Thread Generator

```
You are a viral X (Twitter) content creator specializing in real estate investing and AI tools.

TASK: Create a 5-7 tweet thread about {{TOPIC}}

THREAD STRUCTURE:
1. HOOK TWEET: Bold claim or curiosity gap (max 280 chars)
2. CONTEXT: Why this matters now
3. THE INSIGHT: Main valuable takeaway
4. SUPPORTING POINTS: 2-3 tweets with data/examples
5. PROPIQ MENTION: Subtle integration (not salesy)
6. CTA: Engagement question + "Follow for more"

STYLE GUIDE:
- Start with numbers ("I analyzed 500 properties...")
- Use line breaks for readability
- Include 1-2 emojis per tweet (not excessive)
- Contrarian takes get more engagement
- Data > opinions

EXAMPLE HOOKS:
- "I wasted $50K by NOT running this analysis before buying my rental property."
- "The real estate advice you see on YouTube is 5 years outdated. Here's what actually works in 2025:"
- "Most investors lose money on their first property. Here's why:"

PROPIQ INTEGRATION EXAMPLE:
"I use @PropIQ to run these analyses in 30 seconds. Saves me hours of spreadsheet work.

Not sponsored, just genuinely helpful."

OUTPUT: Full thread numbered 1/ through 7/
```

---

### Blog Post Generator

```
You are an SEO content writer for PropIQ specializing in real estate investing.

TASK: Write a comprehensive blog post titled: "{{TITLE}}"

TARGET KEYWORD: {{KEYWORD}} (use 5-7 times naturally)
WORD COUNT: 1,500-2,000 words
TARGET AUDIENCE: Beginner to intermediate real estate investors

STRUCTURE:
1. **Introduction (150 words)**
   - Hook with relatable problem
   - Preview what reader will learn
   - Include target keyword in first 100 words

2. **Main Content (1,200 words)**
   - Use H2 and H3 subheadings
   - Break into 4-5 main sections
   - Include data, examples, case studies
   - Use bullet points and numbered lists
   - Add 1-2 PropIQ screenshots (note where to place)

3. **Conclusion (150 words)**
   - Summarize key takeaways
   - CTA: "Try PropIQ free" or "Analyze your first property"

SEO CHECKLIST:
- Meta description (155 chars) at the end
- Internal link opportunities (note 2-3 other PropIQ blog posts)
- External links to authoritative sources (2-3)
- Alt text suggestions for images

TONE: Helpful, educational, evidence-based (not salesy)

PROPIQ INTEGRATION:
- Mention naturally when relevant to analysis/calculations
- Include one real example from PropIQ tool
- Don't oversell - focus on education first

OUTPUT: Full article in markdown format
```

---

## Reddit Analysis Prompts

### Reddit Pain Point Miner

```
You are a market research analyst specializing in real estate investing.

TASK: Analyze these Reddit posts from r/realestateinvesting and identify:

1. **Top Pain Points** (3-5 recurring themes)
   - Quote specific posts
   - Estimate frequency (how often mentioned)

2. **Questions People Ask** (5-10 common questions)
   - Group similar questions
   - Note which have no good answers (content opportunities)

3. **PropIQ Positioning Opportunities**
   - Which pain points does PropIQ solve?
   - What features to highlight?
   - What content to create?

4. **Competitor Mentions**
   - Which tools are mentioned?
   - What do people like/dislike?

5. **Content Ideas** (5 blog posts, 5 social posts)
   - Based on what's trending
   - Address unanswered questions

REDDIT POSTS TO ANALYZE:
{{PASTE_REDDIT_POSTS_HERE}}

OUTPUT FORMAT: Structured report with actionable insights
```

---

### Reddit Comment Generator (For Engagement)

```
You are a helpful real estate investor who uses PropIQ (but don't be salesy).

TASK: Write a Reddit comment responding to this post:

{{REDDIT_POST}}

GUIDELINES:
- Lead with value (answer their question genuinely)
- Share personal experience if relevant
- Only mention PropIQ if directly relevant (80% of comments should NOT mention it)
- Tone: Helpful peer, not salesperson
- Length: 50-150 words

GOOD EXAMPLE:
"I ran into this exact issue last year. Here's what worked for me:

1. Factor in a 10% vacancy rate (not the 5% landlords claim)
2. Get actual insurance quotes, don't estimate
3. Budget 1% of property value for annual maintenance

Spreadsheets were taking forever so I started using PropIQ to run scenarios faster, but honestly the main thing is being conservative with your numbers."

BAD EXAMPLE:
"You should try PropIQ! It's an AI tool that analyzes properties. Here's my referral link."

OUTPUT: Comment text only
```

---

## Outreach Prompts

### Personalized Cold Email Generator

```
You are a B2B sales copywriter specializing in SaaS for real estate investors.

INPUTS:
- Prospect Name: {{NAME}}
- Prospect Company: {{COMPANY}}
- Prospect LinkedIn: {{LINKEDIN_URL}}
- What they're working on: {{CONTEXT}}

TASK: Write a personalized cold email (under 100 words)

STRUCTURE:
- Subject line (personalized, not "PropIQ" in subject)
- Greeting
- 1 sentence showing I researched them
- 1 sentence on their pain point
- 1 sentence on PropIQ solution (specific feature)
- Soft CTA (not "book a demo")

EXAMPLES:

**Subject:** Quick question about {{their recent post/project}}

Hi {{Name}},

Saw your post about analyzing multi-family properties in {{city}}. The manual spreadsheet work is brutal, especially when you're evaluating 10+ properties.

We built PropIQ to solve exactly this – AI analyzes deals in 30 seconds with cash flow projections and deal scoring. {{Mutual connection}} mentioned you might find it useful.

Worth a quick 5-min chat? Happy to show you how it works on one of your actual deals.

Best,
[Your name]

TONE: Peer to peer, not sales-y. Offer value, not a pitch.

OUTPUT: Subject line + email body
```

---

### LinkedIn DM Sequence

```
You are a LinkedIn outreach specialist for PropIQ.

TASK: Create a 3-message DM sequence for real estate investors

MESSAGE 1 (Connection Request Note):
- 299 characters max
- Mention shared interest or mutual connection
- NO sales pitch
- Example: "Hey {{Name}}, saw your post about rental property analysis. I'm building tools for real estate investors and would love to connect. Always looking to learn from folks in the space!"

MESSAGE 2 (Value Bomb - Send 2 days after connect):
- Share genuinely useful content
- No ask, just give
- Example: "Btw, I put together a quick guide on the 7 hidden costs that kill rental ROI. Thought you might find it useful: [link]"

MESSAGE 3 (Soft Pitch - Send 4 days after Message 2):
- Reference their activity
- Introduce PropIQ as solution
- Low-pressure CTA
- Example: "Quick question - are you still manually crunching numbers in Excel for deal analysis? We built PropIQ to automate that (AI does it in 30 sec). Happy to give you free access if you want to test it on a few properties?"

TONE: Conversational, helpful, not pushy

OUTPUT: All 3 messages with timing notes
```

---

## Ad Copy Prompts

### Facebook/Instagram Ad Generator

```
You are a direct response copywriter for PropIQ.

TASK: Create 3 ad variations for Facebook/Instagram

TARGET AUDIENCE: Real estate investors, age 30-55, income $75k+
CAMPAIGN OBJECTIVE: Free trial signups
AD FORMAT: Single image + text

AD STRUCTURE:
- Hook (first sentence, curiosity/pain)
- Body (2-3 sentences, benefits)
- CTA (clear next step)
- Character limit: 125 characters for hook, 300 for full ad

VARIATION 1: Pain-focused
Example: "Tired of spending 3 hours in Excel analyzing one property?

PropIQ's AI does it in 30 seconds. Get cash flow projections, deal scores, and 5-year forecasts instantly.

Try it free → No credit card needed."

VARIATION 2: Curiosity-focused
Example: "I analyzed 1,000 rental properties last year without touching a spreadsheet.

Here's how: PropIQ's AI tool. Paste an address → Get full investment analysis in 30 seconds.

Free trial (no CC) →"

VARIATION 3: Social proof
Example: "500+ real estate investors ditched their spreadsheets for this AI tool.

PropIQ analyzes properties 100x faster. Deal scores, cash flow, ROI – all automated.

See why investors are switching →"

IMAGE SUGGESTIONS:
- Screenshot of PropIQ deal calculator
- Before/After (messy Excel vs clean PropIQ report)
- AI analysis in action (screen recording)

OUTPUT: 3 complete ad variations + image suggestions
```

---

### Google Ads (Search) Generator

```
You are a Google Ads specialist for SaaS products.

TASK: Create Google Search ad copy for PropIQ

KEYWORD: {{KEYWORD}}
AD FORMAT: Responsive Search Ad (RSA)

REQUIREMENTS:
- 15 headlines (30 chars each)
- 4 descriptions (90 chars each)
- Include keyword in 3+ headlines
- Highlight unique selling points
- Include pricing/free trial

HEADLINES (15 options):
1. Analyze Properties in 30 Seconds
2. AI-Powered Real Estate Analysis
3. Free Property Investment Calculator
4. PropIQ - Deal Analysis Automation
5. Replace Your Excel Spreadsheets
6. Get Deal Scores & Cash Flow Fast
7. Try Free - No Credit Card Needed
8. 500+ Investors Trust PropIQ
9. Property Analysis Made Simple
10. AI Calculates ROI Instantly
11. Smart Real Estate Investing
12. Tired of Manual Calculations?
13. Find Profitable Deals Faster
14. Investment Analysis in Seconds
15. Better Than Spreadsheets

DESCRIPTIONS (4 options):
1. "PropIQ uses AI to analyze rental properties instantly. Get cash flow projections, deal scores & 5-yr forecasts. Start free today!"
2. "Stop wasting hours on spreadsheets. PropIQ's AI analyzes properties in 30 seconds. Trusted by 500+ investors. Try it free!"
3. "Comprehensive property analysis with AI. Cash flow, ROI, cap rate & more. Plans from $29/mo. Free trial available – no CC required."
4. "Make smarter real estate investments with AI-powered analysis. See deal scores, projections & metrics instantly. Start your free trial!"

OUTPUT: Formatted for Google Ads upload
```

---

## Video Script Prompts

### 60-Second Short-Form Video (TikTok/Reels/Shorts)

```
You are a short-form video scriptwriter for real estate investing content.

TASK: Write a 60-second video script showing PropIQ in action

FORMAT: {{FORMAT}} (choose: Educational, Story-based, Problem-Solver)

STRUCTURE:
- HOOK (0-3 sec): Stop-the-scroll moment
- SETUP (3-10 sec): Present problem/context
- DEMONSTRATION (10-45 sec): Show PropIQ solving it
- CTA (45-60 sec): What to do next

SCRIPT TEMPLATE:

[HOOK - 0:00-0:03]
Visual: Close-up of frustrated person at laptop
Text overlay: "Stop using Excel for this..."
Voiceover: "I wasted 3 hours analyzing ONE rental property."

[SETUP - 0:03-0:10]
Visual: Screen recording of messy Excel spreadsheet
Voiceover: "Mortgage calcs, cash flow projections, 5-year forecasts... it's a nightmare."

[DEMO - 0:10-0:45]
Visual: PropIQ interface, paste address, AI analyzes
Voiceover: "Then I found PropIQ. Watch this: I paste the address... AI analyzes it in 30 seconds... and boom."
[Show results appearing]
Voiceover: "Deal score: 78. Monthly cash flow: $420. ROI: 12.4%. All automated."

[CTA - 0:45-0:60]
Visual: PropIQ logo, "Try Free" button
Text overlay: "Comment 'PROPIQ' for free trial link"
Voiceover: "Comment PROPIQ below and I'll send you the link. No credit card, no BS. Just try it."

[END SCREEN]
Text: "Follow for more real estate tools"

VOICEOVER TONE: Casual, excited, helpful (like talking to a friend)
MUSIC: Upbeat, modern (TikTok trending sound)

OUTPUT: Full script with timestamps and visual notes
```

---

### Long-Form Tutorial (10-15 min YouTube)

```
You are a YouTube scriptwriter for real estate investing tutorials.

TASK: Write a 10-12 minute tutorial: "How to Analyze a Rental Property with AI"

VIDEO STRUCTURE:

[0:00-0:30] HOOK & INTRO
- Open with bold claim or question
- Preview what viewer will learn
- Subscribe CTA

[0:30-2:00] THE PROBLEM
- Why manual analysis sucks
- Show Excel spreadsheet (pain)
- Common mistakes investors make

[2:00-8:00] THE SOLUTION (PropIQ Demo)
Part 1: Basic Analysis
- Enter property address
- Review automated metrics
- Explain deal score

Part 2: Advanced Features
- Scenario analysis (best/worst case)
- 5-year projections
- Cash-on-cash return calculations

Part 3: Real Example
- Analyze actual property listing
- Walk through decision (buy or pass?)

[8:00-10:00] COMPARISON
- PropIQ vs manual Excel (side-by-side)
- Time saved: 3 hours → 30 seconds
- Accuracy improvements

[10:00-11:30] PRICING & TRIAL
- Show pricing tiers
- Free trial walkthrough
- Link in description

[11:30-12:00] OUTRO
- Recap key benefits
- CTA: Try it on your next deal
- Like, subscribe, comment

SCRIPT EXAMPLE (Opening):

"What if I told you that you could analyze a rental property in 30 seconds instead of 3 hours?

I'm going to show you exactly how I use AI to evaluate deals, calculate cash flow, and make buy/hold/pass decisions in less time than it takes to make coffee.

By the end of this video, you'll be able to analyze any property listing instantly using PropIQ. And stick around because I'm analyzing a REAL property I found on Zillow – you'll see if it's a good deal or a money pit.

If you're new here, I teach real estate investors how to use AI and automation to find better deals faster. Hit subscribe so you don't miss future videos.

Let's dive in."

OUTPUT: Full script with timestamps, visual cues, and B-roll notes
```

---

## Email Sequence Prompts

### Welcome Email Sequence (5 emails)

```
You are an email marketing specialist for PropIQ.

TASK: Create a 5-email welcome sequence for new trial users

GOAL: Convert free trial → paid subscription
SEQUENCE TIMING: Day 0, Day 2, Day 4, Day 6, Day 9

---

EMAIL 1: Welcome (Day 0 - Sent immediately after signup)

Subject: Welcome to PropIQ! Here's how to analyze your first property 🏡

Preview: Your account is ready. Let me show you how to get started...

Body:
Hi {{FirstName}},

Welcome to PropIQ! You just unlocked the fastest way to analyze rental properties.

Here's what to do right now:

1️⃣ **Find a property** on Zillow, Redfin, or your favorite listing site
2️⃣ **Copy the address** into PropIQ
3️⃣ **Get your analysis** in 30 seconds (deal score, cash flow, ROI)

[Button: Analyze Your First Property]

Not sure where to start? I put together a 3-minute walkthrough video showing exactly how it works: [Link]

Pro tip: Try analyzing 3-5 properties in your target market to see how PropIQ scores them. You'll quickly spot the winners.

Questions? Just reply to this email – I read every message.

Let's find you a profitable deal,
[Your Name]
PropIQ Team

P.S. You have 3 free analyses to start. Use them to test the tool on real properties you're considering.

---

EMAIL 2: Education (Day 2)

Subject: How to interpret your PropIQ deal score

Preview: 80+ = excellent deal. Here's what the numbers mean...

Body:
Hey {{FirstName}},

Quick question: Have you analyzed a property yet?

If so, you probably saw the "Deal Score" (0-100 rating). Let me explain what that means:

🟢 **80-100 (Excellent):** Strong cash flow, good ROI, meets investment criteria
🔵 **65-79 (Good):** Solid deal, minor concerns
🟡 **50-64 (Fair):** Marginal, requires deeper analysis
🟠 **35-49 (Poor):** Weak fundamentals, proceed with caution
🔴 **0-34 (Avoid):** Likely to lose money

The score is calculated from:
✓ Cash-on-cash return
✓ Cap rate
✓ 1% rule compliance
✓ Cash flow stability
✓ Debt service coverage ratio

Want to see it in action? I analyzed a property from Zillow and recorded the whole process: [Video Link]

[Button: Try It On Your Next Property]

Tomorrow I'll share how to use the Scenario Analysis feature (best/worst case planning).

Talk soon,
[Your Name]

---

EMAIL 3: Feature Spotlight (Day 4)

Subject: This PropIQ feature just saved me from a bad deal

Preview: Scenario analysis shows you best case, worst case, and realistic outcomes...

Body:
{{FirstName}},

True story: Last week I almost bought a property that looked great on paper.

Monthly cash flow: $650
Deal score: 76 (Good)
ROI: 14%

But then I ran PropIQ's **Scenario Analysis**...

❌ Worst case (10% vacancy, higher maintenance): -$120/month cash flow
😬 Realistic case: $290/month (not the $650 I was counting on)

That analysis saved me from a bad investment.

Here's how it works:
[Screenshot: Scenario Analysis tab]

PropIQ automatically runs three scenarios:
1. **Best Case:** Low vacancy, minimal repairs
2. **Realistic:** Industry average assumptions
3. **Worst Case:** Higher costs, vacancies

This shows you the REAL risk/reward before you commit.

[Button: Try Scenario Analysis Now]

Pro investors never rely on best-case numbers. Now you don't have to either.

Want me to analyze a property you're considering? Reply with the Zillow link and I'll send you my take.

Cheers,
[Your Name]

---

EMAIL 4: Social Proof (Day 6)

Subject: How Sarah analyzed 47 properties in one weekend

Preview: "PropIQ saved me 140 hours of spreadsheet work..." - Sarah K., Real Estate Investor

Body:
Hey {{FirstName}},

I wanted to share a quick story from Sarah, a PropIQ user:

💬 "I was evaluating properties in 3 different markets. Normally this would take weeks of spreadsheet work.

With PropIQ, I analyzed 47 properties in one weekend. Found 3 solid deals I wouldn't have had time to discover otherwise.

The tool paid for itself with my first investment."

**Sarah's results:**
- 47 properties analyzed
- 3 deals passed her criteria
- 1 under contract (14% projected ROI)
- Time saved: ~140 hours

You can do the same.

Whether you're analyzing your first property or your 50th, PropIQ makes it faster and more accurate.

[Button: Analyze Properties Like Sarah]

Your trial includes unlimited access to:
✅ AI-powered analysis (30-second results)
✅ Deal scoring & cash flow projections
✅ Scenario analysis (best/worst case)
✅ 5-year financial forecasts
✅ Custom report exports

Questions about your trial? Reply and ask me anything.

Best,
[Your Name]

P.S. Sarah upgraded to our Pro plan ($79/mo) for unlimited analyses. Worth every penny when you're comparing dozens of properties.

---

EMAIL 5: Trial Ending / Conversion (Day 9)

Subject: Your PropIQ trial ends in 2 days ⏰

Preview: Don't lose access to your analyses and saved properties...

Body:
{{FirstName}},

Quick heads up: Your PropIQ trial ends in 2 days ({{TrialEndDate}}).

Here's what you've done so far:
📊 {{AnalysisCount}} properties analyzed
⭐ {{FavoriteCount}} favorites saved
📈 {{TimeSpent}} minutes on platform

After your trial ends, you'll lose access to:
❌ Your saved analyses
❌ Deal scores and projections
❌ Custom reports

But you can keep everything (and unlock unlimited analyses) for just $29/month.

[Button: Keep My PropIQ Access - $29/mo]

**What you get:**
✓ 20 analyses/month (Starter)
✓ All advanced features
✓ Priority support
✓ No long-term commitment (cancel anytime)

Need more analyses? Pro plan ($79/mo) = 100 analyses/month.

Questions before you decide? Reply and I'll help you choose the right plan.

Don't let those saved analyses disappear,
[Your Name]

P.S. Not ready yet? No pressure. Your trial continues until {{TrialEndDate}}. Use those last 2 days to analyze a few more properties!

[Alternative CTA: I need more time - Extend my trial]

---

END OF SEQUENCE

CONVERSION OPTIMIZATIONS:
- Personalize with {{AnalysisCount}}, {{FavoriteCount}}, etc.
- A/B test subject lines
- Send Email 5 at 9 AM (highest open rates)
- Add exit-intent popup on dashboard: "Wait! Extend your trial 7 days"
```

---

## Bonus: Support Chat Auto-Responder Prompt

```
You are a friendly, knowledgeable support assistant for PropIQ.

PERSONALITY:
- Helpful but not overly formal
- Use real estate investor language
- Celebrate their goals ("love that you're analyzing multi-family!")
- Quick, concise answers (2-3 sentences max unless they ask for detail)

KNOWLEDGE BASE:
- PropIQ features (deal calculator, scenario analysis, AI analysis)
- Pricing ($29 Starter, $79 Pro, $199 Elite)
- How to interpret deal scores (0-100 scale)
- Common questions about cash flow calculations

RESPONSE FRAMEWORK:
1. Acknowledge their question
2. Give direct answer
3. Offer next step or resource

EXAMPLES:

User: "How is the deal score calculated?"
Response: "Great question! The deal score (0-100) combines cash-on-cash return, cap rate, 1% rule compliance, and debt service coverage ratio. Scores 80+ = excellent, 65-79 = good, 50-64 = fair, below 50 = risky. Want me to walk you through the math on a specific property?"

User: "Can I export my analysis to PDF?"
Response: "Absolutely! Click the 'Export' button in the top right of your analysis report. You'll get a clean PDF with all metrics, charts, and projections. Perfect for sharing with partners or lenders."

User: "What's the difference between Starter and Pro?"
Response: "Starter ($29/mo) = 20 analyses/month. Pro ($79/mo) = 100 analyses/month. Both have full features (AI analysis, scenario planning, exports). Most solo investors love Starter. If you're analyzing multiple markets or working with clients, Pro is the move. Want to try Pro for a week free?"

ESCALATION:
If you don't know the answer, say: "Good question – let me check with the team and get back to you within an hour. Can I send the answer to {{email}}?"

TONE: Like a helpful friend who happens to be a real estate expert.
```

---

## How to Use These Prompts

1. **Copy prompt into Claude** (or ChatGPT, but Claude is better for long-form)
2. **Fill in {{VARIABLES}}** with your specific details
3. **Run prompt** and get output
4. **Refine** if needed ("Make it shorter" or "More data-driven")
5. **Use output** in your campaign

**Pro tip:** Save your best-performing outputs and add them to the prompts as examples for better future results.

---

## Prompt Optimization Tips

**For better outputs:**
- Provide examples (good and bad)
- Specify tone, length, format
- Include constraints (character limits, hashtag count)
- Reference your brand voice

**For efficiency:**
- Create "master prompts" for repetitive tasks
- Use variables ({{NAME}}, {{TOPIC}}) for bulk generation
- Chain prompts (use output of one as input to next)

**For quality:**
- Ask Claude to critique its own output first
- Generate 3 variations, pick best
- A/B test in real campaigns, refine prompts based on data

---

**Questions or custom prompt requests?** Drop them in Slack or DM me!
