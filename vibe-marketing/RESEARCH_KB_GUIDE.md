# Research Knowledge Base - Complete Guide

**Never lose research again. Turn insights into content in minutes.**

---

## 🎯 What Is This?

The Research Knowledge Base is your organized system for capturing, storing, and mining customer insights, Reddit discussions, competitor intelligence, and market trends.

**The Problem It Solves:**
- ✅ "Where did I save that Reddit research from last week?"
- ✅ "What pain points are customers mentioning most?"
- ✅ "I have 100 insights but can't find anything when I need it"
- ✅ "How do I turn research into content ideas?"

**The Solution:**
- 📁 Organized folder structure with templates
- 🔍 Instant search across all research
- ✍️ Auto-generate content ideas from insights
- ⚡ 30-second research capture

---

## 📁 Folder Structure

```
propiq/vibe-marketing/
├── research/
│   ├── reddit/                    # Reddit discussions & pain points
│   │   └── 2025-10-31-example.md
│   ├── customer-insights/         # Customer interviews, support chats
│   │   └── 2025-10-31-user-123.md
│   ├── competitor-intel/          # Competitor analysis
│   │   └── 2025-10-31-dealcheck.md
│   ├── market-trends/             # Industry trends & news
│   │   └── 2025-10-31-ai-adoption.md
│   └── _templates/                # Templates for each type
│       ├── reddit-research-template.md
│       ├── customer-insight-template.md
│       ├── competitor-intel-template.md
│       └── market-trends-template.md
├── tools/
│   ├── research_capture.py        # CLI to quickly capture research
│   ├── research_search.py         # Search tool
│   └── content_miner.py           # Generate content ideas
└── RESEARCH_KB_GUIDE.md           # This file
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Capture Your First Research (2 min)

```bash
cd propiq/vibe-marketing
python3 tools/research_capture.py
```

**What happens:**
1. Choose research type (Reddit/Customer/Competitor/Trend)
2. Answer interactive prompts
3. File is auto-created with template and metadata
4. Open file to add details

**Example Session:**
```
What type of research are you capturing?
  1. Reddit Research
  2. Customer Insight
  3. Competitor Intelligence
  4. Market Trend
Enter number: 1

Brief title for this research: Property tax reassessments
Subreddit (e.g., realestateinvesting) [realestateinvesting]:
Topics/themes identified (comma-separated): property taxes, cash flow, expenses
Pain points identified (comma-separated): unexpected tax increases, deal math wrong

✅ Research saved to: research/reddit/2025-10-31-property-tax-reassessments.md
```

### Step 2: Search Your Research (1 min)

```bash
# Search for anything
python3 tools/research_search.py "property tax"

# Search in specific type only
python3 tools/research_search.py -t reddit "cash flow"

# List all research
python3 tools/research_search.py -l
```

### Step 3: Generate Content Ideas (2 min)

```bash
python3 tools/content_miner.py
```

**Output:**
- Top 10 pain points across all research
- Top 10 trending topics
- LinkedIn post ideas (auto-generated)
- Twitter thread ideas (auto-generated)
- Blog post ideas (auto-generated)
- Recommended actions

---

## 📝 How to Capture Different Research Types

### 1. Reddit Research

**When to use:**
- Monitoring r/realestateinvesting, r/Landlord, r/realestate
- Found interesting discussion with pain points
- Identified content opportunities

**What to capture:**
- Subreddit and post URL
- Main topics discussed
- Pain points mentioned
- Notable quotes (with context)
- Competitor mentions
- Engagement opportunities

**Example:**
```bash
python3 tools/research_capture.py
# Choose: Reddit Research
# Fill in prompts
# Result: research/reddit/2025-10-31-insurance-rates-crushing-cashflow.md
```

**Pro Tip:** Use Perplexity or Claude to analyze a Reddit thread, then capture insights here for permanent storage.

---

### 2. Customer Insights

**When to use:**
- After customer interview
- Support chat revealed pain point
- Demo call showed interesting use case
- Survey responses came in

**What to capture:**
- Customer tier (free/starter/pro/elite/prospect)
- Use case and workflow
- Pain points mentioned
- Feature requests
- Notable quotes
- What they love vs. what's confusing

**Example:**
```bash
python3 tools/research_capture.py
# Choose: Customer Insight
# Customer: Pro tier user analyzing multi-family properties
# Pain point: "Takes too long to compare 5+ properties side by side"
# Result: research/customer-insights/2025-10-31-pro-user-john.md
```

---

### 3. Competitor Intelligence

**When to use:**
- Researching DealCheck, BiggerPockets, etc.
- Found user reviews mentioning competitors
- Analyzed competitor's marketing/pricing
- Discovered their strengths/weaknesses

**What to capture:**
- Competitor name and website
- Core features (strengths vs. weaknesses)
- Pricing comparison
- Marketing messaging
- User reviews (positive and negative)
- Opportunities for PropIQ

**Example:**
```bash
python3 tools/research_capture.py
# Choose: Competitor Intelligence
# Competitor: DealCheck
# Strength: Mobile app (we don't have)
# Weakness: No AI analysis (we have)
# Result: research/competitor-intel/2025-10-31-dealcheck.md
```

---

### 4. Market Trends

**When to use:**
- Read industry report or article
- Noticed regulatory change
- Saw emerging technology trend
- Market shift affecting real estate

**What to capture:**
- Source and URL
- Trend summary
- Key data/statistics
- Relevance to PropIQ
- Opportunities and threats
- Content ideas

**Example:**
```bash
python3 tools/research_capture.py
# Choose: Market Trend
# Trend: "AI adoption in real estate hits 60%"
# Source: PropTech Report 2025
# Result: research/market-trends/2025-10-31-ai-adoption-real-estate.md
```

---

## 🔍 How to Search Research

### Basic Search

```bash
# Search everything
python3 tools/research_search.py "cash flow"
```

**Returns:**
- All files mentioning "cash flow"
- Context snippets showing where it appears
- File metadata (date, type, topics)
- Full file path to open

### Type-Specific Search

```bash
# Search only Reddit research
python3 tools/research_search.py -t reddit "1% rule"

# Search only customer insights
python3 tools/research_search.py -t customer "analysis"

# Search only competitor intel
python3 tools/research_search.py -t competitor "pricing"

# Search only market trends
python3 tools/research_search.py -t trend "AI"
```

### Search by Date

```bash
# Find research from specific date
python3 tools/research_search.py "2025-10-31"

# Find research from October
python3 tools/research_search.py "2025-10"
```

### List All Research

```bash
# See everything in knowledge base
python3 tools/research_search.py -l
```

**Output:**
```
📚 All Research in Knowledge Base
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reddit Research (5 files):
  • [2025-10-31] Insurance Rates Crushing Cash Flow
  • [2025-10-30] 1% Rule Debate
  • [2025-10-29] Property Tax Reassessments
  ...

Customer Insights (3 files):
  • [2025-10-31] Pro User - Multi-family Analysis
  • [2025-10-30] Free User - First Deal
  ...

Total: 12 research files
```

---

## ✍️ How to Generate Content Ideas

### Run Content Miner

```bash
python3 tools/content_miner.py
```

**What You Get:**

1. **Pain Points Analysis**
   - Top 10 most-mentioned pain points
   - How many times each was mentioned
   - Identifies content gaps

2. **Trending Topics**
   - Top 10 topics across all research
   - Shows what your audience cares about
   - SEO keyword opportunities

3. **LinkedIn Post Ideas**
   - Auto-generated from pain points and topics
   - Includes hook, angle, and potential
   - Ready to expand into full posts

4. **Twitter Thread Ideas**
   - Hooks based on quotes and pain points
   - Suggested thread structure
   - Contrarian takes from competitor research

5. **Blog Post Ideas**
   - SEO-optimized titles
   - Target keywords
   - Suggested outlines

6. **Recommended Actions**
   - What to create first (based on data)
   - High-priority content opportunities
   - Recent insights that need content

### Example Output

```
📊 CONTENT MINING REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Research Database Summary:
   Total Files: 12
   • Reddit Research: 5
   • Customer Insights: 3
   • Competitor Intel: 2
   • Market Trends: 2

💬 TOP PAIN POINTS (Most Mentioned)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 1. Property tax reassessments after purchase (5 mentions)
⚡ 2. Insurance rate increases (4 mentions)
⚡ 3. Calculating accurate CapEx reserves (3 mentions)
• 4. Analyzing multiple properties quickly (2 mentions)

✍️ LINKEDIN POST IDEAS (8 generated):

1. Why "Property tax reassessments after purchase" Is Holding Back Real Estate Investors
   Hook: "Property tax reassessments after purchase" - mentioned in 5 conversations this month.
   Angle: Educational + Problem-Solution
   Potential: High

2. How One Investor Uses PropIQ for Multi-family Analysis
   Hook: Real-world use case from a PropIQ user
   Angle: Story + Social Proof
   Potential: High

🎯 RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CREATE CONTENT addressing: 'Property tax reassessments' (5 mentions)
   → LinkedIn post or Twitter thread about this pain point

2. WRITE BLOG POST about: 'cash flow analysis' (4 mentions)
   → SEO opportunity with clear audience interest
```

### Export as JSON (for automation)

```bash
python3 tools/content_miner.py --json > content-ideas.json
```

Use this to:
- Feed into other automation tools
- Process with scripts
- Integrate with Claude via MCP

---

## 🔄 Daily Workflow Examples

### Workflow 1: Quick Reddit Mining (10 min)

```bash
# 1. Browse r/realestateinvesting for 5 minutes
# 2. Found interesting thread with pain points

# 3. Capture research
python3 tools/research_capture.py
# → Choose Reddit Research
# → Fill in topics, pain points, quotes

# 4. Done! Research saved and searchable
```

### Workflow 2: Post-Customer Interview (5 min)

```bash
# 1. Just finished demo call with prospect

# 2. Capture insights while fresh
python3 tools/research_capture.py
# → Choose Customer Insight
# → Document use case, pain points, quotes

# 3. File created with template
# 4. Open file, add detailed notes

# Total time: 5 minutes vs. lost insights forever
```

### Workflow 3: Weekly Content Planning (20 min)

```bash
# Monday morning: Generate content ideas for the week

# 1. Run content miner
python3 tools/content_miner.py

# 2. Review top pain points and topics

# 3. Pick top 3 content ideas:
#    - LinkedIn post about #1 pain point
#    - Twitter thread about trending topic
#    - Blog post for SEO opportunity

# 4. Use PROMPT_TEMPLATES.md with Claude to write them

# Result: Week's content planned in 20 minutes
```

### Workflow 4: Research Roundup (Monthly)

```bash
# End of month: What did we learn?

# 1. List all research from this month
python3 tools/research_search.py "2025-10"

# 2. Generate comprehensive report
python3 tools/content_miner.py

# 3. Export for team review
python3 tools/content_miner.py > monthly-insights-oct-2025.txt

# 4. Share with team, adjust product roadmap
```

---

## 🎓 Pro Tips

### Tip 1: Capture Research Immediately
Don't wait! If you see something interesting, capture it in 30 seconds:
```bash
python3 tools/research_capture.py
```
You can always add more details later.

### Tip 2: Use Templates as Checklists
The templates remind you what to capture:
- Pain points ✓
- Quotes ✓
- Content ideas ✓
- Action items ✓

### Tip 3: Tag Everything
Use consistent tags in frontmatter:
```yaml
topics: [cash flow, property analysis, deal evaluation]
pain_points: [slow analysis, inaccurate numbers, missing data]
```

This makes search and content mining WAY better.

### Tip 4: Add Content Ideas While Researching
Don't wait for content_miner.py. If you see a LinkedIn post idea while capturing research, add it to the template:

```markdown
## Content Ideas Generated

### LinkedIn Post Ideas
1. **Title:** "Why Property Tax Reassessments Kill Deals"
   - Hook: "Your cash flow just went negative. Here's why..."
   - Angle: Educational + Data-driven
```

### Tip 5: Link to Original Sources
Always include URLs:
- Reddit posts → Engagement opportunities later
- Customer emails → Context when needed
- Competitor websites → Easy reference
- Articles → Cite in content

### Tip 6: Review Research Before Creating Content
Before writing a LinkedIn post or thread:

```bash
# Search related research
python3 tools/research_search.py "cash flow"

# Review all insights on this topic
# Use quotes, pain points, data in your post
# Result: Better content backed by real research
```

### Tip 7: Create Feedback Loop
When content performs well:
1. Note which research it came from
2. Do more research on that topic
3. Create more content on that angle
4. Repeat

---

## 🔗 Integration with Other Tools

### With Claude (MCP or Code)

**Research → Content Pipeline:**
1. Capture research with `research_capture.py`
2. Run `content_miner.py` to get ideas
3. Copy top pain point or topic
4. Use with `PROMPT_TEMPLATES.md` prompts
5. Claude generates full LinkedIn post/thread/blog

**Example:**
```
You: "Using PROMPT_TEMPLATES.md Pain Point Miner prompt:

Top pain point from research: 'Property tax reassessments after purchase'
Mentioned in: 5 conversations
Context: [paste relevant quotes from research files]

Generate a LinkedIn post about this."

Claude: [generates compelling post with hook, story, solution, CTA]
```

### With Perplexity/Comet

**Use Comet for research, Knowledge Base for storage:**

1. Ask Comet to analyze Reddit threads
2. Comet returns insights, pain points, quotes
3. Copy into `research_capture.py`
4. Now research is permanently stored and searchable

**Example Comet Task:**
```
"Analyze the top 10 posts in r/realestateinvesting from the last 24 hours.
Extract:
- Main pain points mentioned
- Notable quotes
- Topics being discussed
- Questions investors are asking

Format as: Topics: [...], Pain Points: [...], Quotes: [...]"
```

Then paste Comet's output into research_capture.py.

### With Daily Intelligence Workflow

**Add research insights to daily reports:**

Modify `daily_intelligence.py` to include:
```python
# Count new research added this week
recent_research = get_recent_research(days=7)
print(f"New research this week: {len(recent_research)}")

# Show top pain point
pain_points = analyze_pain_points()
top_pain = pain_points['top_10'][0]
print(f"Top pain point: {top_pain[0]} ({top_pain[1]} mentions)")
```

---

## 📊 Metrics to Track

### Weekly Metrics
- **Research files added:** Goal: 3-5/week
- **Pain points captured:** Goal: 10+/week
- **Content ideas generated:** Goal: 20+/week
- **Research → Content conversion:** Goal: 50%+

### Monthly Metrics
- **Total research files:** Growing month-over-month
- **Most mentioned pain points:** Trending up or down?
- **Topics emerging:** New opportunities?
- **Research utilization:** How much research becomes content?

### Quality Metrics
- **Research with quotes:** Goal: 80%+
- **Research with content ideas:** Goal: 100%
- **Searchability test:** Can you find research in <10 seconds?

---

## 🚨 Troubleshooting

### "Python command not found"
```bash
# Try python3 instead
python3 tools/research_capture.py

# Or use full path
/usr/bin/python3 tools/research_capture.py
```

### "No research files found"
```bash
# Check if research folder exists
ls -la research/

# If not, create it
mkdir -p research/{reddit,customer-insights,competitor-intel,market-trends}

# Add your first research
python3 tools/research_capture.py
```

### "Search returns no results"
```bash
# List all research first
python3 tools/research_search.py -l

# Make sure files exist in research/ folders

# Try broader search terms
python3 tools/research_search.py "estate"  # vs "real estate investing"
```

### "Content miner shows no ideas"
This means you haven't captured enough research yet:
1. Add 3-5 Reddit research files
2. Add 2-3 customer insights
3. Run content_miner again

You need at least 3-5 research files for meaningful content ideas.

---

## 🎯 Next Steps

### If You're Just Starting
1. ✅ Run `research_capture.py` and add your first research
2. ✅ Add 2-3 more pieces of research (Reddit, customer, competitor)
3. ✅ Run `content_miner.py` to see ideas generated
4. ✅ Pick one idea and create content

### If You Have Existing Research
1. 📝 Spend 30 minutes migrating old notes into the system
2. 🔍 Use templates to ensure you capture all important fields
3. 🎯 Run content_miner to see what you've been sitting on
4. ✍️ Turn top insights into content this week

### If You're Advanced
1. 🤖 Automate research capture (webhook from Slack, email, etc.)
2. 📊 Add research metrics to daily intelligence dashboard
3. 🔗 Integrate with Claude for auto-content generation
4. 📈 Build content performance → research feedback loop

---

## 💡 Ideas for Future Enhancements

**Want to build these? Let me know!**

### Auto-Import from Perplexity
- Monitor Perplexity collections
- Auto-parse Comet research outputs
- One-click import into knowledge base

### Slack Integration
- Post new research to #research channel
- Query research via Slack bot
- Get daily "research digest" in Slack

### Content Generation Pipeline
- research_capture.py → content_miner.py → Claude API → content-batch.md
- Fully automated research → content pipeline

### Research Analytics Dashboard
- Visualize pain points over time
- Track which topics are trending up/down
- See research → content → performance correlation

### Web Interface
- Browser-based research capture
- Visual search interface
- Drag-and-drop research organization

---

## ❓ FAQ

**Q: Do I need to fill out every field in the template?**
A: No! Capture what's important now, fill in details later. The template is a guide, not a requirement.

**Q: How much research should I capture?**
A: Aim for 3-5 pieces per week. Quality > quantity. One great Reddit thread with quotes is better than 10 half-captured insights.

**Q: Should I capture every Reddit comment?**
A: No! Only capture if it reveals:
- A pain point you didn't know about
- A quote you want to use in content
- A competitor mention worth tracking
- An engagement opportunity

**Q: How do I organize research by project/campaign?**
A: Use tags in frontmatter:
```yaml
topics: [cash flow, campaign-q4-2025, launch-prep]
```
Then search: `python3 tools/research_search.py "campaign-q4-2025"`

**Q: Can I edit research files manually?**
A: Yes! They're just markdown files. Edit in any text editor or VS Code.

**Q: What if I want to add a new research type?**
A:
1. Create folder: `mkdir research/new-type`
2. Create template: `research/_templates/new-type-template.md`
3. Modify `research_capture.py` to add new option
4. Or just manually create files using the template

**Q: How long does this take to set up?**
A: You're already set up! Just run `research_capture.py` and start.

**Q: How do I back up my research?**
A: Research is in `research/` folder. It's all markdown files. Back up options:
- Git (commit regularly)
- Dropbox/Google Drive sync
- Time Machine / cloud backup
- `tar -czf research-backup-$(date +%Y-%m-%d).tar.gz research/`

---

## 🎉 You're Ready!

You now have a complete research knowledge base system:

✅ **Capture:** 30-second research capture with templates
✅ **Organize:** Clean folder structure with metadata
✅ **Search:** Find any insight in seconds
✅ **Mine:** Auto-generate content ideas from research
✅ **Integrate:** Works with Claude, Comet, daily workflows

**Start now:**
```bash
cd propiq/vibe-marketing
python3 tools/research_capture.py
```

**Questions? Stuck? Want enhancements?**
Just ask! This system is built to evolve with your needs.

---

**Built with:** Python 3, Markdown, Common Sense
**Time to value:** 30 seconds for first research capture
**ROI:** Never lose research again + infinite content ideas

🚀 **Happy researching!**
