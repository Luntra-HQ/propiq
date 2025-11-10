#!/usr/bin/env python3
"""
Content Miner - Generate content ideas from research
Usage: python3 content_miner.py [options]
"""

import os
import sys
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict
from collections import Counter

def get_base_dir():
    """Get the base directory for research storage"""
    script_dir = Path(__file__).parent
    return script_dir.parent / "research"

def parse_frontmatter(content: str) -> Dict:
    """Extract YAML frontmatter from markdown file"""
    frontmatter = {}
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            fm_content = parts[1]
            for line in fm_content.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    frontmatter[key.strip()] = value.strip()
    return frontmatter

def parse_list_field(value: str) -> List[str]:
    """Parse a list field from frontmatter"""
    if not value:
        return []
    # Remove brackets and split by comma
    cleaned = value.strip('[]').strip()
    if not cleaned:
        return []
    items = [item.strip().strip("'\"") for item in cleaned.split(',')]
    return [item for item in items if item]

def extract_quotes(content: str) -> List[str]:
    """Extract blockquotes from markdown content"""
    quotes = []
    lines = content.split('\n')
    current_quote = []

    for line in lines:
        if line.strip().startswith('>'):
            quote_text = line.strip()[1:].strip()
            if quote_text and not quote_text.startswith('-'):
                current_quote.append(quote_text)
        elif current_quote:
            if current_quote:
                quotes.append(' '.join(current_quote))
            current_quote = []

    if current_quote:
        quotes.append(' '.join(current_quote))

    return quotes

def load_all_research() -> Dict[str, List[Dict]]:
    """Load all research files"""
    base_dir = get_base_dir()
    research = {
        'reddit': [],
        'customer': [],
        'competitor': [],
        'trend': []
    }

    type_map = {
        'reddit': 'reddit',
        'customer-insights': 'customer',
        'competitor-intel': 'competitor',
        'market-trends': 'trend'
    }

    for dir_name, key in type_map.items():
        search_dir = base_dir / dir_name
        if not search_dir.exists():
            continue

        for filepath in search_dir.glob("*.md"):
            try:
                with open(filepath, 'r') as f:
                    content = f.read()

                frontmatter = parse_frontmatter(content)

                # Extract title
                title = "Untitled"
                for line in content.split('\n'):
                    if line.startswith('# '):
                        title = line.replace('# ', '').strip()
                        break

                # Extract quotes
                quotes = extract_quotes(content)

                research[key].append({
                    'filepath': filepath,
                    'title': title,
                    'content': content,
                    'frontmatter': frontmatter,
                    'quotes': quotes
                })

            except Exception as e:
                print(f"Error loading {filepath}: {e}", file=sys.stderr)
                continue

    return research

def analyze_pain_points(research: Dict) -> Dict:
    """Analyze all pain points across research"""
    pain_points = []

    for research_type in ['reddit', 'customer']:
        for item in research[research_type]:
            fm = item['frontmatter']
            if 'pain_points' in fm:
                points = parse_list_field(fm['pain_points'])
                pain_points.extend(points)

    # Count frequency
    pain_counter = Counter(pain_points)

    return {
        'total': len(pain_points),
        'unique': len(pain_counter),
        'top_10': pain_counter.most_common(10),
        'all': pain_counter
    }

def analyze_topics(research: Dict) -> Dict:
    """Analyze all topics across research"""
    topics = []

    for research_type in ['reddit', 'customer', 'trend']:
        for item in research[research_type]:
            fm = item['frontmatter']
            if 'topics' in fm:
                topic_list = parse_list_field(fm['topics'])
                topics.extend(topic_list)

    # Count frequency
    topic_counter = Counter(topics)

    return {
        'total': len(topics),
        'unique': len(topic_counter),
        'top_10': topic_counter.most_common(10),
        'all': topic_counter
    }

def get_recent_research(research: Dict, days: int = 7) -> List[Dict]:
    """Get research from the last N days"""
    cutoff_date = datetime.now() - timedelta(days=days)
    recent = []

    for research_type in ['reddit', 'customer', 'competitor', 'trend']:
        for item in research[research_type]:
            date_str = item['frontmatter'].get('date', '')
            if date_str:
                try:
                    item_date = datetime.strptime(date_str, '%Y-%m-%d')
                    if item_date >= cutoff_date:
                        recent.append({
                            **item,
                            'type': research_type,
                            'date': item_date
                        })
                except:
                    continue

    # Sort by date (newest first)
    recent.sort(key=lambda x: x['date'], reverse=True)
    return recent

def generate_linkedin_ideas(pain_points: Dict, topics: Dict, research: Dict) -> List[Dict]:
    """Generate LinkedIn post ideas"""
    ideas = []

    # Ideas from top pain points
    for pain_point, count in pain_points['top_10'][:5]:
        ideas.append({
            'platform': 'LinkedIn',
            'type': 'Pain Point Post',
            'title': f'Why "{pain_point}" Is Holding Back Real Estate Investors',
            'hook': f'"{pain_point}" - mentioned in {count} conversations this month.',
            'angle': 'Educational + Problem-Solution',
            'source': 'Pain point analysis',
            'potential': 'High' if count >= 3 else 'Medium'
        })

    # Ideas from trending topics
    for topic, count in topics['top_10'][:5]:
        ideas.append({
            'platform': 'LinkedIn',
            'type': 'Topic Deep Dive',
            'title': f'What Every Investor Should Know About {topic}',
            'hook': f'{topic} is trending in real estate investing conversations.',
            'angle': 'Educational + Data-driven',
            'source': 'Topic analysis',
            'potential': 'High' if count >= 3 else 'Medium'
        })

    # Ideas from customer insights
    for item in research['customer'][:3]:
        fm = item['frontmatter']
        use_case = 'property analysis'  # default
        for line in item['content'].split('\n'):
            if 'Use Case:' in line:
                use_case = line.split('Use Case:')[1].strip()
                break

        ideas.append({
            'platform': 'LinkedIn',
            'type': 'Customer Story',
            'title': f'How One Investor Uses PropIQ for {use_case}',
            'hook': 'Real-world use case from a PropIQ user',
            'angle': 'Story + Social Proof',
            'source': f'Customer insight: {item["title"]}',
            'potential': 'High'
        })

    return ideas

def generate_twitter_ideas(pain_points: Dict, research: Dict) -> List[Dict]:
    """Generate Twitter thread ideas"""
    ideas = []

    # Thread from top pain point
    if pain_points['top_10']:
        top_pain, count = pain_points['top_10'][0]
        ideas.append({
            'platform': 'Twitter',
            'type': 'Pain Point Thread',
            'hook': f'{count} investors mentioned "{top_pain}" this month. Here\'s why (and how to fix it):',
            'structure': '7-tweet thread: Problem → Why it matters → Common mistakes → Solution → Example → Action step',
            'source': 'Pain point analysis',
            'potential': 'High'
        })

    # Thread from Reddit research
    for item in research['reddit'][:2]:
        fm = item['frontmatter']
        if item['quotes']:
            ideas.append({
                'platform': 'Twitter',
                'type': 'Quote Thread',
                'hook': f'"{item["quotes"][0][:100]}..." - From r/{fm.get("source", "realestateinvesting").replace("r/", "")}',
                'structure': 'Quote → Context → Why it matters → PropIQ angle → Call to action',
                'source': f'Reddit: {item["title"]}',
                'potential': 'Medium'
            })

    # Contrarian take from competitor research
    for item in research['competitor'][:1]:
        competitor = item['frontmatter'].get('competitor', 'competitors')
        ideas.append({
            'platform': 'Twitter',
            'type': 'Contrarian Thread',
            'hook': f'Everyone uses {competitor}. Here\'s why PropIQ is different:',
            'structure': '7-tweet thread: Status quo → Problem → Our approach → Why it matters → Results → Proof → CTA',
            'source': f'Competitor intel: {item["title"]}',
            'potential': 'High'
        })

    return ideas

def generate_blog_ideas(topics: Dict, research: Dict) -> List[Dict]:
    """Generate blog post ideas"""
    ideas = []

    # SEO-focused posts from topics
    for topic, count in topics['top_10'][:3]:
        ideas.append({
            'platform': 'Blog',
            'type': 'SEO Guide',
            'title': f'{topic} for Real Estate Investors: Complete Guide',
            'target_keyword': topic.lower(),
            'outline': f'What is {topic} → Why it matters → Common mistakes → Best practices → PropIQ solution',
            'source': 'Topic analysis',
            'potential': 'High'
        })

    # Comparison posts from competitor research
    for item in research['competitor'][:2]:
        competitor = item['frontmatter'].get('competitor', 'competitor')
        ideas.append({
            'platform': 'Blog',
            'type': 'Comparison Post',
            'title': f'PropIQ vs {competitor}: Which Is Better for Real Estate Analysis?',
            'target_keyword': f'{competitor.lower()} alternative',
            'outline': f'Overview → Feature comparison → Pricing → Use cases → Verdict',
            'source': f'Competitor intel: {item["title"]}',
            'potential': 'High'
        })

    # Trend analysis posts
    for item in research['trend'][:1]:
        trend_name = item['title'].replace('Market Trend:', '').strip()
        ideas.append({
            'platform': 'Blog',
            'type': 'Trend Analysis',
            'title': f'{trend_name}: What Real Estate Investors Need to Know',
            'target_keyword': trend_name.lower(),
            'outline': 'What\'s happening → Why it matters → Impact on investors → How to prepare → PropIQ helps',
            'source': f'Market trend: {item["title"]}',
            'potential': 'High'
        })

    return ideas

def print_report(research: Dict, pain_points: Dict, topics: Dict):
    """Print comprehensive content mining report"""
    print("\n" + "="*80)
    print("                     📊 CONTENT MINING REPORT")
    print("="*80)

    # Summary
    total_research = sum(len(research[k]) for k in research)
    print(f"\n📚 Research Database Summary:")
    print(f"   Total Files: {total_research}")
    print(f"   • Reddit Research: {len(research['reddit'])}")
    print(f"   • Customer Insights: {len(research['customer'])}")
    print(f"   • Competitor Intel: {len(research['competitor'])}")
    print(f"   • Market Trends: {len(research['trend'])}")

    # Recent activity
    recent = get_recent_research(research, days=7)
    print(f"\n📅 Recent Activity (Last 7 days): {len(recent)} new research files")

    # Pain Points Analysis
    print(f"\n" + "="*80)
    print("💬 TOP PAIN POINTS (Most Mentioned)")
    print("="*80)

    if pain_points['top_10']:
        for i, (pain, count) in enumerate(pain_points['top_10'], 1):
            emoji = "🔥" if count >= 5 else "⚡" if count >= 3 else "•"
            print(f"{emoji} {i}. {pain} ({count} mentions)")
    else:
        print("   No pain points captured yet. Start adding research!")

    # Topics Analysis
    print(f"\n" + "="*80)
    print("🎯 TRENDING TOPICS")
    print("="*80)

    if topics['top_10']:
        for i, (topic, count) in enumerate(topics['top_10'], 1):
            emoji = "🔥" if count >= 5 else "⚡" if count >= 3 else "•"
            print(f"{emoji} {i}. {topic} ({count} mentions)")
    else:
        print("   No topics captured yet. Start adding research!")

    # Content Ideas
    print(f"\n" + "="*80)
    print("✍️  CONTENT IDEAS GENERATED")
    print("="*80)

    linkedin_ideas = generate_linkedin_ideas(pain_points, topics, research)
    twitter_ideas = generate_twitter_ideas(pain_points, research)
    blog_ideas = generate_blog_ideas(topics, research)

    # LinkedIn Ideas
    print(f"\n📱 LINKEDIN POST IDEAS ({len(linkedin_ideas)} generated):")
    for i, idea in enumerate(linkedin_ideas[:5], 1):
        print(f"\n{i}. {idea['title']}")
        print(f"   Hook: {idea['hook']}")
        print(f"   Angle: {idea['angle']}")
        print(f"   Potential: {idea['potential']}")

    if len(linkedin_ideas) > 5:
        print(f"\n   ... and {len(linkedin_ideas) - 5} more ideas")

    # Twitter Ideas
    print(f"\n🐦 TWITTER THREAD IDEAS ({len(twitter_ideas)} generated):")
    for i, idea in enumerate(twitter_ideas[:3], 1):
        print(f"\n{i}. {idea['hook'][:100]}...")
        print(f"   Structure: {idea['structure']}")
        print(f"   Potential: {idea['potential']}")

    if len(twitter_ideas) > 3:
        print(f"\n   ... and {len(twitter_ideas) - 3} more ideas")

    # Blog Ideas
    print(f"\n📝 BLOG POST IDEAS ({len(blog_ideas)} generated):")
    for i, idea in enumerate(blog_ideas[:3], 1):
        print(f"\n{i}. {idea['title']}")
        print(f"   Keyword: {idea['target_keyword']}")
        print(f"   Outline: {idea['outline']}")
        print(f"   Potential: {idea['potential']}")

    if len(blog_ideas) > 3:
        print(f"\n   ... and {len(blog_ideas) - 3} more ideas")

    # Recommendations
    print(f"\n" + "="*80)
    print("🎯 RECOMMENDED ACTIONS")
    print("="*80)

    if pain_points['top_10']:
        top_pain, count = pain_points['top_10'][0]
        print(f"\n1. CREATE CONTENT addressing: '{top_pain}' ({count} mentions)")
        print(f"   → LinkedIn post or Twitter thread about this pain point")

    if topics['top_10']:
        top_topic, count = topics['top_10'][0]
        print(f"\n2. WRITE BLOG POST about: '{top_topic}' ({count} mentions)")
        print(f"   → SEO opportunity with clear audience interest")

    if research['competitor']:
        print(f"\n3. CREATE COMPARISON CONTENT")
        competitor = research['competitor'][0]['frontmatter'].get('competitor', 'competitors')
        print(f"   → PropIQ vs {competitor} blog post or LinkedIn")

    if len(recent) > 0:
        print(f"\n4. ACT ON RECENT RESEARCH")
        print(f"   → {len(recent)} new insights from last 7 days need content")

    # Export option
    print(f"\n" + "="*80)
    print("💾 EXPORT OPTIONS")
    print("="*80)
    print("\nTo save this report:")
    print("  python3 content_miner.py > content-ideas-$(date +%Y-%m-%d).txt")
    print("\nTo integrate with Claude for content generation:")
    print("  1. Copy top pain points and topics")
    print("  2. Use with PROMPT_TEMPLATES.md")
    print("  3. Generate 10+ posts in minutes")

    print(f"\n" + "="*80)
    print(f"✅ Report Complete | {total_research} research files analyzed")
    print("="*80 + "\n")

def export_json(research: Dict, pain_points: Dict, topics: Dict):
    """Export data as JSON for programmatic use"""
    import json

    linkedin_ideas = generate_linkedin_ideas(pain_points, topics, research)
    twitter_ideas = generate_twitter_ideas(pain_points, research)
    blog_ideas = generate_blog_ideas(topics, research)

    output = {
        'generated_at': datetime.now().isoformat(),
        'summary': {
            'total_research': sum(len(research[k]) for k in research),
            'by_type': {k: len(research[k]) for k in research},
            'pain_points': {
                'total': pain_points['total'],
                'unique': pain_points['unique'],
                'top_10': [{'pain_point': p, 'mentions': c} for p, c in pain_points['top_10']]
            },
            'topics': {
                'total': topics['total'],
                'unique': topics['unique'],
                'top_10': [{'topic': t, 'mentions': c} for t, c in topics['top_10']]
            }
        },
        'content_ideas': {
            'linkedin': linkedin_ideas,
            'twitter': twitter_ideas,
            'blog': blog_ideas
        }
    }

    print(json.dumps(output, indent=2))

def main():
    """Main entry point"""
    # Check for flags
    export_json_mode = '--json' in sys.argv

    print("\n🔍 Loading research from knowledge base...")

    research = load_all_research()
    total = sum(len(research[k]) for k in research)

    if total == 0:
        print("\n❌ No research files found!")
        print("\nTo get started:")
        print("  1. Run: python3 tools/research_capture.py")
        print("  2. Add some research (Reddit, customer insights, etc.)")
        print("  3. Run this tool again to generate content ideas")
        print("\nOr check that research files are in:")
        print(f"  {get_base_dir()}")
        return

    print(f"✅ Loaded {total} research files")

    # Analyze
    print("📊 Analyzing pain points and topics...")
    pain_points = analyze_pain_points(research)
    topics = analyze_topics(research)

    # Generate report
    if export_json_mode:
        export_json(research, pain_points, topics)
    else:
        print_report(research, pain_points, topics)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
