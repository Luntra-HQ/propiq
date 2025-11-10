# PropIQ Blog Writer Agent

Autonomous content generation system using Google's Agent Development Kit (ADK).

## 🎯 What This Does

This agent autonomously generates high-quality blog posts and social media content for PropIQ with minimal human oversight. You simply select a topic, and the agent:

1. **Researches** the topic using Google Search
2. **Creates** a detailed outline
3. **Writes** a complete 1000-1500 word blog post
4. **Generates** 3-5 social media posts (Twitter, LinkedIn)
5. **Saves** everything to markdown files

**Autonomy Level:** 85-90%
- **You do:** Select topic, review final output (15 minutes)
- **Agent does:** Everything else (60-90 minutes)

## 📋 Pre-configured Topics

5 blog topics ready to generate:

1. **How to Calculate Rental Property Cash Flow** - Complete guide for investors
2. **Understanding Cap Rate** - What investors need to know
3. **5 Key Metrics Every Real Estate Investor Should Track** - NOI, CoC, Cap Rate, IRR, Occupancy
4. **Zillow vs. Reality** - Why investors need better analysis tools
5. **Analyzing Rental Properties with PropIQ** - Step-by-step walkthrough

All topics include:
- SEO keywords naturally incorporated
- PropIQ brand voice guidelines
- Practical examples and actionable tips
- Call-to-action to try PropIQ
- Placeholders for images/screenshots

## 🚀 Quick Start

### First Time Setup

1. **Ensure dependencies are installed:**
   ```bash
   pip3 install google-adk
   ```

2. **Google Cloud credentials should already be configured** ✅
   (You completed `gcloud auth application-default login`)

### Generate a Blog Post

**List all topics:**
```bash
./run_blog_generation.sh list
```

**Generate topic 1:**
```bash
./run_blog_generation.sh 1
```

**What happens next:**
1. The ADK web interface opens in your browser
2. Select "interactive_blogger_agent" from the dropdown
3. Copy the topic prompt shown in the terminal
4. Paste it into the chat
5. The agent starts working autonomously

**Agent workflow:**
1. Creates outline (you can approve or request changes)
2. Asks about visual content (choose "1" for placeholders)
3. Writes complete blog post
4. You review and approve
5. Generates social media posts
6. Saves to markdown file

**Time required:**
- Agent writing: 5-10 minutes (autonomous)
- Your review: 5-10 minutes
- **Total: 15-20 minutes per blog post**

## 📁 File Structure

```
blog-writer-agent/
├── blogger_agent/           # ADK agent source code
│   ├── agent.py            # Main orchestrator agent
│   ├── sub_agents/         # Specialized sub-agents
│   │   ├── blog_planner.py
│   │   ├── blog_writer.py
│   │   ├── blog_editor.py
│   │   └── social_media_writer.py
│   └── tools.py            # Custom tools (save file, analyze codebase)
├── propiq_prompts.txt      # 5 pre-written topic prompts
├── run_blog_generation.sh  # Automation script
└── README_PROPIQ.md        # This file
```

## 🎨 Brand Voice Guidelines

All topics are configured with PropIQ brand voice:

- **Data-driven and analytical** - Use numbers, formulas, real examples
- **Empowering** - Help investors make better decisions
- **Transparent** - Acknowledge complexities, don't oversimplify
- **Practical** - Focus on actionable insights
- **Professional but approachable** - Educational without being intimidating

## 📊 SEO Keywords (Automatically Incorporated)

- rental property analysis
- real estate investing
- cap rate calculator
- cash flow calculator
- investment property analysis
- NOI calculator
- real estate metrics

## 🔄 Recommended Workflow

### Weekly Content Pipeline (90% Autonomous)

**Monday morning (10 minutes):**
1. Run `./run_blog_generation.sh 1`
2. Paste prompt into ADK web interface
3. Let agent work (5-10 min)
4. Review and approve outline

**Monday afternoon (10 minutes):**
1. Review generated blog post
2. Approve or request minor edits
3. Generate social media posts
4. Save to file

**Tuesday (15 minutes):**
1. Copy blog post to `propiq/content-library/`
2. Upload to your blog platform
3. Schedule social media posts in Buffer

**Result:** 1 complete blog post + 3-5 social posts per week with <30 minutes of your time.

## 📂 Output Location

Generated blog posts are saved in:
- `blogger_agent/` directory (default)
- Filename format: `blog_post_YYYY-MM-DD.md`

**Move approved posts to:**
```bash
mv blogger_agent/blog_post_*.md ../content-library/
```

## 🛠️ Advanced Usage

### Customize a Topic

Edit `propiq_prompts.txt` and modify any topic section. The agent will use your updated guidelines.

### Add New Topics

Add a new topic to `propiq_prompts.txt`:

```
TOPIC 6: Your New Topic Title
================================================================================
Write a blog post about [your topic]

Key points to cover:
- Point 1
- Point 2
- Point 3

[Continue with guidelines from existing topics]
```

Then run:
```bash
./run_blog_generation.sh 6
```

### Use ADK Web Interface Directly

```bash
adk web
```

This opens the full ADK interface where you can:
- Chat with the agent freely
- Iterate on content multiple times
- Save multiple versions
- Test different approaches

## 🧠 How the Agent Works

### Multi-Agent Architecture

```
interactive_blogger_agent (orchestrator)
├── robust_blog_planner (creates outline)
│   └── Uses Google Search for research
├── robust_blog_writer (writes full post)
│   └── Uses Google Search for examples
├── blog_editor (refines based on feedback)
└── social_media_writer (creates promotional posts)
```

### Tools Available to Agents

1. **Google Search** - Research topics, find examples
2. **save_blog_post_to_file** - Save markdown files
3. **analyze_codebase** - Analyze code repos (if needed)

### Autonomy Features

- **Self-improving** - Uses validation checks to ensure quality
- **Context-aware** - Remembers brand voice and SEO guidelines
- **Iterative** - Refines content based on your feedback
- **Structured** - Follows consistent formatting and organization

## 🎯 Expected Output Quality

### Blog Post Structure

```markdown
# [Title]

## Introduction
[Hook + context + what reader will learn]

## Section 1
[Content with examples]

## Section 2
[Content with examples]

## Practical Application
[How to use this with PropIQ]

## Conclusion
[Summary + CTA]
```

**Word count:** 1000-1500 words
**Reading level:** Accessible to beginners, valuable for intermediates
**Examples:** At least 2-3 practical examples per post
**CTA:** Link to propiq.luntra.one

### Social Media Posts

**Format:**
```
🏘️ [Hook]

[2-3 sentence value prop]

[Key takeaway]

Read more: [link]

#RealEstateInvesting #PropertyAnalysis
```

**Platforms:** Twitter, LinkedIn, Facebook
**Count:** 3-5 variations per blog post

## 📈 Performance Tracking

After implementing this system, track:

- **Time saved:** vs manual writing
- **Content output:** Posts per week
- **Traffic:** Blog visits from social posts
- **Engagement:** Likes, shares, comments
- **Conversions:** Sign-ups from blog traffic

**Estimated time savings:**
- Manual: 4-6 hours per blog post
- With agent: 30 minutes per blog post
- **Savings: ~5 hours per post**

## 🆘 Troubleshooting

**Problem:** ADK not installed
```bash
pip3 install google-adk
```

**Problem:** Google Cloud auth error
```bash
gcloud auth application-default login
```

**Problem:** Agent generates poor quality
- **Solution:** Be more specific in prompts
- **Solution:** Provide feedback and ask for revision
- **Solution:** Request more examples or clearer explanations

**Problem:** Can't find generated files
- **Solution:** Check `blogger_agent/` directory
- **Solution:** Look for files with today's date

## 🎓 Learning Resources

- [ADK Documentation](https://google.github.io/adk-docs/)
- [Blog Writer Agent Source](./blogger_agent/agent.py)
- [Sub-Agents Source](./blogger_agent/sub_agents/)

## 🚀 Next Steps

1. **Test the system:**
   ```bash
   ./run_blog_generation.sh 1
   ```

2. **Generate all 5 topics** (one per week)

3. **Analyze results:**
   - Quality of content
   - Time saved
   - Traffic/engagement impact

4. **Expand topics:**
   - Add 5 more topics to `propiq_prompts.txt`
   - Build a 10-week content calendar

5. **Automate further:**
   - Set up weekly reminders
   - Create Buffer integration
   - Auto-publish to WordPress/Ghost

---

**Ready to start?** Run your first topic:
```bash
./run_blog_generation.sh 1
```

The agent will handle the rest! 🚀
