#!/usr/bin/env python3
"""
Research Search Tool - Find research by keyword, topic, pain point, or date
Usage: python3 research_search.py [query]
"""

import os
import sys
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

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

def search_files(query: str, research_type: Optional[str] = None) -> List[Dict]:
    """Search through research files"""
    base_dir = get_base_dir()
    results = []

    # Determine which directories to search
    if research_type:
        search_dirs = [base_dir / research_type]
    else:
        search_dirs = [
            base_dir / "reddit",
            base_dir / "customer-insights",
            base_dir / "competitor-intel",
            base_dir / "market-trends"
        ]

    query_lower = query.lower()

    for search_dir in search_dirs:
        if not search_dir.exists():
            continue

        for filepath in search_dir.glob("*.md"):
            try:
                with open(filepath, 'r') as f:
                    content = f.read()

                # Parse frontmatter
                frontmatter = parse_frontmatter(content)

                # Check if query matches
                matches = []
                content_lower = content.lower()

                # Search in content
                if query_lower in content_lower:
                    # Find context around match
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if query_lower in line.lower():
                            # Get context (2 lines before and after)
                            start = max(0, i - 2)
                            end = min(len(lines), i + 3)
                            context = '\n'.join(lines[start:end])
                            matches.append(context)
                            if len(matches) >= 3:  # Limit to 3 matches per file
                                break

                # Search in frontmatter
                fm_match = False
                for key, value in frontmatter.items():
                    if query_lower in str(value).lower():
                        fm_match = True
                        break

                if matches or fm_match:
                    # Extract title from first # heading
                    title = "Untitled"
                    for line in content.split('\n'):
                        if line.startswith('# '):
                            title = line.replace('# ', '').strip()
                            break

                    results.append({
                        'filepath': filepath,
                        'title': title,
                        'type': frontmatter.get('type', 'unknown'),
                        'date': frontmatter.get('date', 'unknown'),
                        'frontmatter': frontmatter,
                        'matches': matches[:3],  # Top 3 matches
                        'match_count': len(matches)
                    })

            except Exception as e:
                print(f"Error reading {filepath}: {e}", file=sys.stderr)
                continue

    # Sort by date (newest first)
    results.sort(key=lambda x: x['date'], reverse=True)
    return results

def format_result(result: Dict, show_context: bool = True) -> str:
    """Format a search result for display"""
    output = []
    output.append(f"\n{'='*70}")
    output.append(f"📄 {result['title']}")
    output.append(f"   Type: {result['type']} | Date: {result['date']}")
    output.append(f"   File: {result['filepath'].name}")

    # Show relevant frontmatter
    fm = result['frontmatter']
    if 'topics' in fm:
        output.append(f"   Topics: {fm['topics']}")
    if 'pain_points' in fm:
        output.append(f"   Pain Points: {fm['pain_points']}")
    if 'competitor' in fm:
        output.append(f"   Competitor: {fm['competitor']}")

    # Show match count
    if result['match_count'] > 0:
        output.append(f"   Matches: {result['match_count']}")

    # Show context if requested
    if show_context and result['matches']:
        output.append(f"\n   📝 Context:")
        for i, match in enumerate(result['matches'][:2], 1):  # Show top 2
            output.append(f"\n   Match {i}:")
            for line in match.split('\n'):
                output.append(f"      {line}")

    output.append(f"\n   🔗 Full path: {result['filepath']}")
    output.append(f"{'='*70}")

    return '\n'.join(output)

def search_by_topic(topic: str) -> List[Dict]:
    """Search for research by topic"""
    return search_files(topic)

def search_by_pain_point(pain_point: str) -> List[Dict]:
    """Search for research by pain point"""
    return search_files(pain_point)

def search_by_date(date_str: str) -> List[Dict]:
    """Search for research by date"""
    return search_files(date_str)

def search_by_type(research_type: str, query: str = "") -> List[Dict]:
    """Search within a specific research type"""
    type_map = {
        'reddit': 'reddit',
        'customer': 'customer-insights',
        'competitor': 'competitor-intel',
        'trend': 'market-trends',
        'market': 'market-trends'
    }

    dir_name = type_map.get(research_type.lower())
    if not dir_name:
        print(f"Unknown research type: {research_type}")
        return []

    if query:
        return search_files(query, dir_name)
    else:
        # List all files in this type
        base_dir = get_base_dir() / dir_name
        if not base_dir.exists():
            return []

        results = []
        for filepath in sorted(base_dir.glob("*.md"), reverse=True):
            try:
                with open(filepath, 'r') as f:
                    content = f.read()

                frontmatter = parse_frontmatter(content)
                title = "Untitled"
                for line in content.split('\n'):
                    if line.startswith('# '):
                        title = line.replace('# ', '').strip()
                        break

                results.append({
                    'filepath': filepath,
                    'title': title,
                    'type': frontmatter.get('type', 'unknown'),
                    'date': frontmatter.get('date', 'unknown'),
                    'frontmatter': frontmatter,
                    'matches': [],
                    'match_count': 0
                })
            except Exception as e:
                continue

        return results

def list_all_research() -> None:
    """List all research grouped by type"""
    base_dir = get_base_dir()
    types = {
        'reddit': 'Reddit Research',
        'customer-insights': 'Customer Insights',
        'competitor-intel': 'Competitor Intelligence',
        'market-trends': 'Market Trends'
    }

    print("\n" + "="*70)
    print("📚 All Research in Knowledge Base")
    print("="*70)

    total = 0
    for dir_name, display_name in types.items():
        search_dir = base_dir / dir_name
        if not search_dir.exists():
            continue

        files = list(search_dir.glob("*.md"))
        if files:
            print(f"\n{display_name} ({len(files)} files):")
            for filepath in sorted(files, reverse=True)[:5]:  # Show latest 5
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()
                    frontmatter = parse_frontmatter(content)
                    title = filepath.stem
                    for line in content.split('\n'):
                        if line.startswith('# '):
                            title = line.replace('# ', '').strip()
                            break
                    date = frontmatter.get('date', 'unknown')
                    print(f"  • [{date}] {title}")
                except:
                    continue

            if len(files) > 5:
                print(f"  ... and {len(files) - 5} more")

            total += len(files)

    print(f"\n{'='*70}")
    print(f"Total: {total} research files")
    print(f"{'='*70}\n")

def print_usage():
    """Print usage information"""
    print("""
Usage: python3 research_search.py [options] [query]

Options:
  -h, --help              Show this help message
  -l, --list              List all research files
  -t, --type TYPE         Search within specific type (reddit/customer/competitor/trend)
  -c, --no-context        Don't show context snippets

Examples:
  python3 research_search.py "insurance rates"
      Search for "insurance rates" in all research

  python3 research_search.py -t reddit "1% rule"
      Search for "1% rule" in Reddit research only

  python3 research_search.py -t customer "cash flow"
      Search for "cash flow" in customer insights

  python3 research_search.py -l
      List all research files

  python3 research_search.py "2025-10-31"
      Find all research from October 31, 2025
""")

def main():
    """Main entry point"""
    if len(sys.argv) < 2 or '-h' in sys.argv or '--help' in sys.argv:
        print_usage()
        return

    # Parse arguments
    show_context = '--no-context' not in sys.argv and '-c' not in sys.argv
    list_mode = '--list' in sys.argv or '-l' in sys.argv

    if list_mode:
        list_all_research()
        return

    # Check for type filter
    research_type = None
    if '-t' in sys.argv:
        idx = sys.argv.index('-t')
        if idx + 1 < len(sys.argv):
            research_type = sys.argv[idx + 1]
            # Remove -t and type from args
            sys.argv.pop(idx)
            sys.argv.pop(idx)
    elif '--type' in sys.argv:
        idx = sys.argv.index('--type')
        if idx + 1 < len(sys.argv):
            research_type = sys.argv[idx + 1]
            sys.argv.pop(idx)
            sys.argv.pop(idx)

    # Get query (everything after script name and options)
    query_parts = []
    for arg in sys.argv[1:]:
        if not arg.startswith('-'):
            query_parts.append(arg)

    if not query_parts:
        print("Error: Please provide a search query")
        print_usage()
        return

    query = ' '.join(query_parts)

    # Perform search
    print(f"\n🔍 Searching for: '{query}'")
    if research_type:
        print(f"   Type filter: {research_type}")

    if research_type:
        results = search_by_type(research_type, query)
    else:
        results = search_files(query)

    # Display results
    if not results:
        print(f"\n❌ No results found for '{query}'")
        print("\nTry:")
        print("  • Different keywords")
        print("  • Broader search terms")
        print("  • List all research with: python3 research_search.py -l")
        return

    print(f"\n✅ Found {len(results)} result(s)")

    for result in results:
        print(format_result(result, show_context))

    # Summary
    print(f"\n{'='*70}")
    print(f"Found {len(results)} matching research file(s)")
    print(f"{'='*70}\n")

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
