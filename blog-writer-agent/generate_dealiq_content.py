#!/usr/bin/env python3
"""
PropIQ Blog Content Generator
Runs the ADK Blog Writer Agent to generate content for PropIQ
"""
import os
import sys
from pathlib import Path

# Add the blogger_agent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from blogger_agent.agent import interactive_blogger_agent
from google.adk.agents import Agent

# PropIQ Blog Topics
PROPIQ_TOPICS = [
    {
        "title": "How to Calculate Rental Property Cash Flow: A Complete Guide for Investors",
        "description": "A comprehensive guide explaining cash flow calculation, including rental income, operating expenses, and how PropIQ automates this process for real estate investors."
    },
    {
        "title": "Understanding Cap Rate: What Real Estate Investors Need to Know",
        "description": "Explain what cap rate is, how to calculate it, why it matters for investment decisions, and how PropIQ helps investors analyze properties using cap rates."
    },
    {
        "title": "5 Key Metrics Every Real Estate Investor Should Track",
        "description": "Cover NOI, cash-on-cash return, cap rate, IRR, and occupancy rates. Show how PropIQ makes tracking these metrics simple and automated."
    },
    {
        "title": "Zillow vs. Reality: Why Real Estate Investors Need Better Analysis Tools",
        "description": "Discuss the limitations of Zillow estimates and why serious investors need comprehensive analysis tools like PropIQ that go beyond surface-level data."
    },
    {
        "title": "Analyzing Rental Properties: A Step-by-Step Guide Using PropIQ",
        "description": "Walk through the complete process of analyzing a rental property from finding it online to making an investment decision, using PropIQ's tools."
    },
]

def generate_blog_post(topic_index: int):
    """Generate a blog post for a specific topic"""
    if topic_index >= len(PROPIQ_TOPICS):
        print(f"Invalid topic index. Please choose 0-{len(PROPIQ_TOPICS)-1}")
        return

    topic = PROPIQ_TOPICS[topic_index]
    print(f"\n{'='*80}")
    print(f"Generating blog post: {topic['title']}")
    print(f"{'='*80}\n")

    # Create a prompt for the agent
    prompt = f"""
Write a technical blog post with the following details:

Title: {topic['title']}

Description: {topic['description']}

Additional Guidelines:
- Target audience: Real estate investors (beginners to intermediate)
- Tone: Professional but approachable, educational
- Include practical examples and actionable tips
- Reference PropIQ as the tool that simplifies these calculations
- Include a call-to-action to try PropIQ at propiq.luntra.one
- Aim for 1000-1500 words
- Use headings, bullet points, and clear structure
- For visual content, choose option "1" (placeholders for images)

Brand Voice for PropIQ:
- Data-driven and analytical
- Empowering investors with better tools
- Transparent about real estate investing complexities
- Focus on practical, actionable insights

Please generate the outline first, then write the complete blog post.
"""

    try:
        # Run the agent
        result = interactive_blogger_agent.send_message(prompt)
        print("\n" + "="*80)
        print("Agent Response:")
        print("="*80)
        print(result.content)
        return result
    except Exception as e:
        print(f"Error generating blog post: {e}")
        import traceback
        traceback.print_exc()

def list_topics():
    """List all available topics"""
    print("\nAvailable PropIQ Blog Topics:")
    print("="*80)
    for i, topic in enumerate(PROPIQ_TOPICS):
        print(f"\n{i}. {topic['title']}")
        print(f"   {topic['description']}")
    print("\n" + "="*80)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        list_topics()
        print("\nUsage:")
        print(f"  python {sys.argv[0]} <topic_index>")
        print(f"  python {sys.argv[0]} all")
        print(f"\nExample:")
        print(f"  python {sys.argv[0]} 0    # Generate first topic")
        print(f"  python {sys.argv[0]} all  # Generate all topics")
    elif sys.argv[1] == "all":
        for i in range(len(PROPIQ_TOPICS)):
            generate_blog_post(i)
            print("\n\n" + "="*80)
            print(f"Completed {i+1}/{len(PROPIQ_TOPICS)} blog posts")
            print("="*80 + "\n\n")
    else:
        try:
            topic_index = int(sys.argv[1])
            generate_blog_post(topic_index)
        except ValueError:
            print(f"Invalid topic index: {sys.argv[1]}")
            list_topics()
