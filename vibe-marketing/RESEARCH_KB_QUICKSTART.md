# Research Knowledge Base - Quick Start

**You now have a complete research intelligence system. Here's how to use it in 5 minutes.**

---

## ✅ What Was Built

✅ **Organized folder structure** for all research types
✅ **4 professional templates** with metadata
✅ **3 powerful CLI tools** for capture, search, and mining
✅ **1 example research file** to show you how it works
✅ **Complete documentation** with workflows and pro tips

---

## 🚀 Try It Now (5 Minutes)

### 1. See What's Already There (30 seconds)

```bash
cd propiq/vibe-marketing

# List all research
python3 tools/research_search.py -l
```

**You'll see:** 1 example Reddit research file about insurance rates

---

### 2. Search for Something (30 seconds)

```bash
# Search for "insurance"
python3 tools/research_search.py "insurance"
```

**You'll see:**
- The example research file
- Context snippets showing matches
- Metadata (topics, pain points, dates)
- Full file path to open

---

### 3. Generate Content Ideas (1 minute)

```bash
# Mine all research for content ideas
python3 tools/content_miner.py
```

**You'll see:**
- Top pain points across all research
- Trending topics
- Auto-generated LinkedIn post ideas
- Auto-generated Twitter thread ideas
- Auto-generated blog post ideas
- Recommended actions

---

### 4. Capture Your First Real Research (3 minutes)

```bash
# Interactive research capture
python3 tools/research_capture.py
```

**Follow the prompts:**
1. Choose research type (Reddit/Customer/Competitor/Trend)
2. Answer questions (title, source, topics, pain points)
3. Add quotes or insights
4. Done! File is created and searchable

---

## 📁 Where Everything Lives

```
propiq/vibe-marketing/
├── research/                      # All your research
│   ├── reddit/                    # Reddit discussions
│   ├── customer-insights/         # Customer interviews
│   ├── competitor-intel/          # Competitor analysis
│   ├── market-trends/             # Industry trends
│   └── _templates/                # Templates (4 types)
├── tools/
│   ├── research_capture.py        # Add research (30 sec)
│   ├── research_search.py         # Find research (instant)
│   └── content_miner.py           # Generate ideas (auto)
└── RESEARCH_KB_GUIDE.md           # Full documentation
```

---

## 🎯 Common Tasks

### Add Research from Perplexity/Comet
```bash
# 1. Ask Perplexity/Comet to analyze Reddit/topic
# 2. Get insights, pain points, quotes
# 3. Run:
python3 tools/research_capture.py

# 4. Choose type, paste insights
# 5. Done! Research saved permanently
```

### Find Research Before Writing Content
```bash
# Before writing about "cash flow":
python3 tools/research_search.py "cash flow"

# Review all insights, quotes, pain points
# Use in your LinkedIn post/thread/blog
```

### Weekly Content Planning
```bash
# Monday morning:
python3 tools/content_miner.py

# Pick top 3 content ideas
# Use with PROMPT_TEMPLATES.md + Claude
# Create week's content in 30 minutes
```

### Search by Type
```bash
# Only Reddit research
python3 tools/research_search.py -t reddit "1% rule"

# Only customer insights
python3 tools/research_search.py -t customer "feature"

# Only competitor intel
python3 tools/research_search.py -t competitor "pricing"
```

---

## 💡 Where to Find That Perplexity Research

**Your Perplexity/Comet research from the other day:**

It's probably in:
- Perplexity Collections (check your account)
- Browser history (search for perplexity.ai)
- Screenshots or notes
- Comet conversation history

**To import it:**
1. Copy the insights (pain points, quotes, topics)
2. Run `python3 tools/research_capture.py`
3. Choose "Reddit Research" (or appropriate type)
4. Paste insights into prompts
5. Now it's permanently saved and searchable!

**Going forward:**
- Every time Comet/Perplexity gives you research
- Spend 2 minutes capturing it here
- Never lose research again

---

## 📚 Full Documentation

**See RESEARCH_KB_GUIDE.md for:**
- Complete workflow examples
- Pro tips and best practices
- Integration with Claude, Comet, daily intelligence
- Troubleshooting
- Advanced features

---

## 🎉 Next Steps

### If You're Migrating Existing Research
1. Find that Perplexity/Comet research
2. Run `research_capture.py` for each piece
3. Takes 2-3 minutes per research file
4. Run `content_miner.py` to see patterns emerge

### If You're Starting Fresh
1. Browse r/realestateinvesting for 10 minutes
2. Find thread with pain points or questions
3. Capture it: `python3 tools/research_capture.py`
4. Repeat 2-3 times
5. Run content miner to generate ideas
6. Create content this week

### For Your Next Comet/Perplexity Session
1. Ask Comet to analyze Reddit/topic
2. When results come back, have research_capture.py ready
3. Immediately capture insights (30 seconds)
4. Continue this habit = never lose research

---

## ❓ Quick Questions

**Q: I found that Reddit research from Perplexity! How do I add it?**
```bash
python3 tools/research_capture.py
# Choose: Reddit Research
# Paste topics, pain points, quotes from Perplexity
# Done!
```

**Q: How do I turn research into LinkedIn posts?**
```bash
# 1. Run content miner
python3 tools/content_miner.py

# 2. Copy top pain point or topic
# 3. Open PROMPT_TEMPLATES.md
# 4. Use "Pain Point Miner" prompt with Claude
# 5. Post generated in 2 minutes
```

**Q: Can I edit research files directly?**
Yes! They're markdown files in `research/` folders. Open in any editor.

**Q: What if I have a lot of research to migrate?**
Start with the best 5-10 pieces. Quality > quantity. You can always add more later.

---

## 🔥 Power User Tip

**Create a research habit:**

Every time you:
- Read interesting Reddit thread → Capture it
- Talk to customer → Capture insights
- Analyze competitor → Capture findings
- Read industry article → Capture trend

Takes 2 minutes. Pays off forever.

**Weekly:**
- Monday: Run content_miner.py
- Pick top 3 ideas
- Create content
- Post
- Repeat

---

## 💪 You're Ready!

**Your research knowledge base is live and ready.**

**Start now:**
```bash
cd propiq/vibe-marketing
python3 tools/research_capture.py
```

**Or find that Perplexity research and import it:**
- Will take 5 minutes
- Will be searchable forever
- Will generate content ideas automatically

---

**Questions? Stuck? Want to enhance the system?**
Just ask! This is your system now. Make it work for you.

🚀 **Happy researching!**
