#!/usr/bin/env python3
"""
Research Capture Tool - Quick CLI to save research insights
Usage: python3 research_capture.py
"""

import os
import sys
from datetime import datetime
from pathlib import Path

def get_base_dir():
    """Get the base directory for research storage"""
    script_dir = Path(__file__).parent
    return script_dir.parent / "research"

def prompt(question, default=None):
    """Prompt user for input with optional default"""
    if default:
        response = input(f"{question} [{default}]: ").strip()
        return response if response else default
    else:
        while True:
            response = input(f"{question}: ").strip()
            if response:
                return response
            print("This field is required. Please enter a value.")

def prompt_list(question, separator=","):
    """Prompt for comma-separated list"""
    response = input(f"{question} (comma-separated): ").strip()
    if response:
        return [item.strip() for item in response.split(separator)]
    return []

def prompt_choice(question, choices):
    """Prompt user to choose from a list"""
    print(f"\n{question}")
    for i, choice in enumerate(choices, 1):
        print(f"  {i}. {choice}")
    while True:
        try:
            choice_num = int(input("Enter number: ").strip())
            if 1 <= choice_num <= len(choices):
                return choices[choice_num - 1]
            print(f"Please enter a number between 1 and {len(choices)}")
        except ValueError:
            print("Please enter a valid number")

def capture_reddit_research():
    """Capture Reddit research"""
    print("\n=== Reddit Research Capture ===\n")

    date = datetime.now().strftime("%Y-%m-%d")
    title = prompt("Brief title for this research")
    subreddit = prompt("Subreddit (e.g., realestateinvesting)", "realestateinvesting")
    post_url = prompt("Post URL (optional)", "")

    topics = prompt_list("Topics/themes identified")
    pain_points = prompt_list("Pain points identified")

    sentiment = prompt_choice("Overall sentiment?", ["positive", "negative", "mixed", "neutral"])
    engagement = prompt_choice("Engagement level?", ["high", "medium", "low"])
    content_potential = prompt_choice("Content potential?", ["high", "medium", "low"])

    print("\n--- Key Insights (press Enter twice when done) ---")
    main_topics = []
    print("Main topics discussed (one per line):")
    while True:
        topic = input("> ").strip()
        if not topic:
            break
        main_topics.append(topic)

    print("\n--- Notable Quotes (press Enter when done entering quote, Enter twice to finish) ---")
    quotes = []
    while True:
        quote = input("Quote: ").strip()
        if not quote:
            break
        context = input("  Context: ").strip()
        link = input("  Link (optional): ").strip()
        quotes.append({"quote": quote, "context": context, "link": link})

    # Generate filename
    filename = f"{date}-{title.lower().replace(' ', '-')}.md"
    filepath = get_base_dir() / "reddit" / filename

    # Generate content from template
    content = f"""---
type: reddit
date: {date}
source: r/{subreddit}
topics: {topics}
pain_points: {pain_points}
sentiment: {sentiment}
engagement_level: {engagement}
content_potential: {content_potential}
---

# Reddit Research: {title}

## Source Information
- **Subreddit:** r/{subreddit}
- **Post URL:** {post_url if post_url else "N/A"}
- **Date Captured:** {date}

## Key Insights

### Main Topics Discussed
{chr(10).join(f"- {topic}" for topic in main_topics) if main_topics else "- "}

### Pain Points Identified
{chr(10).join(f"{i}. **{pain}**" + chr(10) + "   - Description: " + chr(10) + "   - Frequency: " + chr(10) + "   - Intensity: " for i, pain in enumerate(pain_points, 1)) if pain_points else ""}

### Notable Quotes
{chr(10).join(f'> "{q["quote"]}"' + chr(10) + f'> - Context: {q["context"]}' + chr(10) + f'> - Link: {q["link"]}' + chr(10) for q in quotes) if quotes else ""}

## User Questions (Unanswered or Poorly Answered)
1. **"[Question from post]"**
   - Why it matters:
   - PropIQ angle:
   - Link:

## Competitor Mentions
- **[Tool/Competitor Name]:** [what users said]

## Content Ideas Generated

### LinkedIn Post Ideas
1. **Title:** [suggested title based on pain points]
   - Hook: [opening line]
   - Angle: educational

### Twitter Thread Ideas
1. **Hook:** [tweet 1 based on main topics]
   - Thread structure: [outline]

### Blog Post Ideas
1. **Title:** [SEO-friendly title]
   - Target keyword: {topics[0] if topics else "[keyword]"}
   - Outline: [3-5 sections]

## Engagement Opportunities
- **Post to engage with:** {post_url if post_url else "[URL]"}
- **Why:** [reason to engage]
- **Suggested response:** [non-salesy helpful comment]

## Notes & Follow-up
-

---

**Tags:** #reddit #{topics[0] if topics else "topic"} #{pain_points[0] if pain_points else "pain_point"}
"""

    # Save file
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(content)

    print(f"\n✅ Research saved to: {filepath}")
    print(f"\nQuick edit command:")
    print(f"  code '{filepath}'")

    return filepath

def capture_customer_insight():
    """Capture customer insight"""
    print("\n=== Customer Insight Capture ===\n")

    date = datetime.now().strftime("%Y-%m-%d")
    customer_id = prompt("Customer name/ID", "anonymous")
    source_type = prompt_choice("Source type?", ["interview", "support_chat", "email", "demo_call", "survey"])
    customer_tier = prompt_choice("Customer tier?", ["free", "starter", "pro", "elite", "prospect"])

    topics = prompt_list("Topics discussed")
    pain_points = prompt_list("Pain points mentioned")
    feature_requests = prompt_list("Feature requests (if any)")

    urgency = prompt_choice("Urgency level?", ["high", "medium", "low"])

    print("\n--- Key Details (press Enter to skip) ---")
    use_case = prompt("Primary use case", "property analysis")
    experience_level = prompt_choice("Experience level?", ["beginner", "intermediate", "advanced"])

    print("\n--- Quotes & Insights (press Enter when done entering quote, Enter twice to finish) ---")
    quotes = []
    while True:
        quote = input("Quote: ").strip()
        if not quote:
            break
        context = input("  Context: ").strip()
        quotes.append({"quote": quote, "context": context})

    # Generate filename
    filename = f"{date}-{customer_id.lower().replace(' ', '-')}.md"
    filepath = get_base_dir() / "customer-insights" / filename

    # Generate content
    content = f"""---
type: customer_insight
date: {date}
source: {source_type}
customer_tier: {customer_tier}
topics: {topics}
pain_points: {pain_points}
feature_requests: {feature_requests}
urgency: {urgency}
---

# Customer Insight: {customer_id}

## Source Information
- **Customer ID:** {customer_id}
- **Customer Tier:** {customer_tier.capitalize()}
- **Source Type:** {source_type.replace('_', ' ').title()}
- **Date:** {date}

## Background
- **Use Case:** {use_case}
- **Experience Level:** {experience_level}
- **Current Tools:** [what other tools they use]

## Key Insights

### Pain Points Mentioned
{chr(10).join(f"{i}. **{pain}**" + chr(10) + "   - Description: " + chr(10) + "   - Current workaround: " + chr(10) + "   - Impact: " + chr(10) + '   - Quote: ""' for i, pain in enumerate(pain_points, 1)) if pain_points else ""}

### What They Love
-

### What's Confusing or Frustrating
-

### Feature Requests
{chr(10).join(f"{i}. **{feature}**" + chr(10) + "   - What they want: " + chr(10) + "   - Why they need it: " + chr(10) + "   - Priority (their view): " for i, feature in enumerate(feature_requests, 1)) if feature_requests else ""}

## Notable Quotes
{chr(10).join(f'> "{q["quote"]}"' + chr(10) + f'> - Context: {q["context"]}' + chr(10) for q in quotes) if quotes else ""}

## Content Ideas Generated

### Case Study Potential
- **Angle:** [what makes this interesting]
- **Story arc:** [setup → problem → solution → result]
- **Permission needed:** [yes/no]

### Educational Content Ideas
1. **LinkedIn Post:** Addressing "{pain_points[0] if pain_points else "pain point"}"
2. **Twitter Thread:** [their workflow/process as teaching moment]
3. **Blog Post:** [deep dive on their use case]

## Action Items
- [ ] [Follow-up needed?]
- [ ] [Feature to prioritize?]

## Notes
-

---

**Tags:** #customer_insight #{customer_tier} #{pain_points[0] if pain_points else "pain_point"}
"""

    # Save file
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(content)

    print(f"\n✅ Research saved to: {filepath}")
    print(f"\nQuick edit command:")
    print(f"  code '{filepath}'")

    return filepath

def capture_competitor_intel():
    """Capture competitor intelligence"""
    print("\n=== Competitor Intelligence Capture ===\n")

    date = datetime.now().strftime("%Y-%m-%d")
    competitor_name = prompt("Competitor name")
    source = prompt_choice("Source type?", ["website", "demo", "ads", "reddit", "reviews", "blog"])

    focus_areas = prompt_list("Focus areas")
    threat_level = prompt_choice("Threat level?", ["high", "medium", "low"])

    website = prompt("Website URL", "")

    print("\n--- Quick Analysis (press Enter to skip) ---")
    strengths = prompt_list("Their strengths vs PropIQ")
    weaknesses = prompt_list("Their weaknesses vs PropIQ")

    # Generate filename
    filename = f"{date}-{competitor_name.lower().replace(' ', '-')}.md"
    filepath = get_base_dir() / "competitor-intel" / filename

    # Generate content
    content = f"""---
type: competitor_intel
date: {date}
competitor: {competitor_name}
source: {source}
focus_areas: {focus_areas}
threat_level: {threat_level}
---

# Competitor Intelligence: {competitor_name}

## Competitor Overview
- **Name:** {competitor_name}
- **Website:** {website if website else "[URL]"}
- **Category:** [direct competitor / adjacent / alternative]
- **Date Analyzed:** {date}

## Product Analysis

### Core Features
-

### Strengths (vs PropIQ)
{chr(10).join(f"{i}. **{strength}**" + chr(10) + "   - What they do: " + chr(10) + "   - Why it matters: " + chr(10) + "   - PropIQ gap: " for i, strength in enumerate(strengths, 1)) if strengths else ""}

### Weaknesses (vs PropIQ)
{chr(10).join(f"{i}. **{weakness}**" + chr(10) + "   - What they lack: " + chr(10) + "   - Why it matters: " + chr(10) + "   - PropIQ advantage: " for i, weakness in enumerate(weaknesses, 1)) if weaknesses else ""}

### Unique Differentiators (Theirs)
-

### Unique Differentiators (Ours)
- AI-powered analysis with GPT-4o-mini
- Scenario analysis (best/realistic/worst case)
- 30-second analysis vs hours in Excel

## Pricing Analysis

| Tier | Price | Features | PropIQ Comparison |
|------|-------|----------|-------------------|
| [Tier 1] | [price] | [key features] | [how we compare] |

## Marketing Analysis

### Messaging
- **Tagline:** "[their tagline]"
- **Value Prop:** [main value proposition]
- **Target Audience:** [who they target]

## User Reviews & Sentiment

### Common Complaints
1. **[Complaint]**
   - Frequency: [how often mentioned]
   - PropIQ opportunity: [how we can position against this]

## Content Ideas Generated

### Comparison Content
1. **"PropIQ vs {competitor_name}"** - Feature comparison blog post
2. **"Why We Built PropIQ Differently"** - Positioning post

## Strategic Insights

### Threats
-

### Opportunities
-

### Recommendations
- [ ] [Product: feature to build or improve]
- [ ] [Marketing: messaging to adjust]

## Notes & Sources
- **Sources:** {website if website else "[URLs, screenshots]"}

---

**Tags:** #competitor #{competitor_name.lower().replace(' ', '_')} #{focus_areas[0] if focus_areas else "analysis"}
"""

    # Save file
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(content)

    print(f"\n✅ Research saved to: {filepath}")
    print(f"\nQuick edit command:")
    print(f"  code '{filepath}'")

    return filepath

def capture_market_trend():
    """Capture market trend"""
    print("\n=== Market Trend Capture ===\n")

    date = datetime.now().strftime("%Y-%m-%d")
    trend_name = prompt("Trend name/title")
    source = prompt("Source (article/report name)")
    source_url = prompt("Source URL", "")

    category = prompt_choice("Trend category?", ["technology", "regulation", "market_shift", "consumer_behavior"])
    relevance = prompt_choice("Relevance to PropIQ?", ["high", "medium", "low"])
    timeframe = prompt_choice("Timeframe?", ["immediate", "short_term", "long_term"])

    print("\n--- Trend Summary (2-3 sentences) ---")
    summary = prompt("Brief description")

    # Generate filename
    filename = f"{date}-{trend_name.lower().replace(' ', '-')}.md"
    filepath = get_base_dir() / "market-trends" / filename

    # Generate content
    content = f"""---
type: market_trend
date: {date}
source: {source}
trend_category: {category}
relevance_to_propiq: {relevance}
timeframe: {timeframe}
---

# Market Trend: {trend_name}

## Source Information
- **Source:** {source}
- **URL:** {source_url if source_url else "[link]"}
- **Date Published:** {date}

## Trend Summary
{summary}

## Key Findings

### Main Points
1.
2.
3.

### Data/Statistics
- **[Stat]:** [number/percentage]
  - Source: [where it came from]
  - Why it matters:

## Relevance to PropIQ

### Direct Impact
- **How this affects our target users:**
  -

- **How this affects our product:**
  -

### Opportunities
1. **[Opportunity Name]**
   - What it is:
   - How we can leverage:
   - Timeline: {timeframe}

### Threats
1. **[Threat Name]**
   - What it is:
   - How to mitigate:

## Content Ideas Generated

### Thought Leadership Content
1. **LinkedIn Post:** "What {trend_name} Means for Real Estate Investors"
   - Hook:
   - Key points:

### Educational Content
1. **Blog Post:** "{trend_name} Explained: What You Need to Know"
   - SEO keyword:
   - Outline:

## Strategic Implications

### Product Roadmap
- [ ] Feature to add/enhance:

### Marketing Strategy
- [ ] Messaging to update:
- [ ] Campaign idea:

## Notes
-

---

**Tags:** #market_trend #{category} #{timeframe}
"""

    # Save file
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(content)

    print(f"\n✅ Research saved to: {filepath}")
    print(f"\nQuick edit command:")
    print(f"  code '{filepath}'")

    return filepath

def main():
    """Main entry point"""
    print("\n" + "="*60)
    print("         PropIQ Research Capture Tool")
    print("="*60)

    research_type = prompt_choice(
        "\nWhat type of research are you capturing?",
        [
            "Reddit Research",
            "Customer Insight",
            "Competitor Intelligence",
            "Market Trend"
        ]
    )

    if research_type == "Reddit Research":
        filepath = capture_reddit_research()
    elif research_type == "Customer Insight":
        filepath = capture_customer_insight()
    elif research_type == "Competitor Intelligence":
        filepath = capture_competitor_intel()
    elif research_type == "Market Trend":
        filepath = capture_market_trend()

    print("\n" + "="*60)
    print("✅ Research captured successfully!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Open the file and fill in any missing details")
    print("  2. Add content ideas based on insights")
    print("  3. Run content_miner.py to generate posts from all research")
    print("\nHappy researching! 🚀\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        sys.exit(1)
