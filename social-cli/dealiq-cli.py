#!/usr/bin/env python3
"""
PropIQ Social Media CLI
Automate posting to LinkedIn, Instagram, and YouTube from the terminal.

Usage:
    python3 propiq-cli.py post linkedin "Your post content here"
    python3 propiq-cli.py post instagram-reel /path/to/video.mp4 "Caption"
    python3 propiq-cli.py schedule linkedin "Content" --date "2025-11-12 07:00"
    python3 propiq-cli.py analytics linkedin --days 7
    python3 propiq-cli.py setup linkedin
"""

import sys
import argparse
from pathlib import Path

# Import platform modules (we'll create these)
try:
    from modules import linkedin, instagram, youtube, analytics, scheduler
except ImportError:
    print("⚠️  Module import failed. Run setup first:")
    print("   python3 propiq-cli.py setup")
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="PropIQ Social Media CLI - Post to LinkedIn, Instagram, YouTube",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Post to LinkedIn
  propiq-cli post linkedin "Your post content here"

  # Post Instagram Reel
  propiq-cli post instagram-reel video.mp4 "Check out this property analysis!"

  # Post YouTube Short
  propiq-cli post youtube-short video.mp4 "30-Second Property Analysis"

  # Schedule a post
  propiq-cli schedule linkedin "Content" --date "2025-11-12 07:00"

  # Get analytics
  propiq-cli analytics linkedin --days 7

  # Setup API credentials
  propiq-cli setup linkedin
  propiq-cli setup instagram
  propiq-cli setup youtube
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to execute')

    # POST command
    post_parser = subparsers.add_parser('post', help='Post content to a platform')
    post_parser.add_argument('platform', choices=['linkedin', 'instagram-reel', 'youtube-short'],
                            help='Platform to post to')
    post_parser.add_argument('content', help='Post content or path to video file')
    post_parser.add_argument('caption', nargs='?', help='Caption for video posts')
    post_parser.add_argument('--image', help='Path to image file (LinkedIn only)')

    # SCHEDULE command
    schedule_parser = subparsers.add_parser('schedule', help='Schedule a post')
    schedule_parser.add_argument('platform', choices=['linkedin', 'instagram-reel', 'youtube-short'])
    schedule_parser.add_argument('content', help='Post content or path to video file')
    schedule_parser.add_argument('--date', required=True, help='Schedule date/time (YYYY-MM-DD HH:MM)')
    schedule_parser.add_argument('--caption', help='Caption for video posts')

    # ANALYTICS command
    analytics_parser = subparsers.add_parser('analytics', help='Get analytics')
    analytics_parser.add_argument('platform', choices=['linkedin', 'instagram', 'youtube', 'all'])
    analytics_parser.add_argument('--days', type=int, default=7, help='Number of days to analyze')

    # SETUP command
    setup_parser = subparsers.add_parser('setup', help='Setup API credentials')
    setup_parser.add_argument('platform', nargs='?', choices=['linkedin', 'instagram', 'youtube', 'all'],
                             help='Platform to set up (leave empty for guided setup)')

    # STATUS command
    status_parser = subparsers.add_parser('status', help='Check API connection status')

    # BATCH command
    batch_parser = subparsers.add_parser('batch', help='Batch schedule from content calendar')
    batch_parser.add_argument('calendar_file', help='Path to content calendar JSON')

    args = parser.parse_args()

    # Route commands
    if args.command == 'post':
        handle_post(args)
    elif args.command == 'schedule':
        handle_schedule(args)
    elif args.command == 'analytics':
        handle_analytics(args)
    elif args.command == 'setup':
        handle_setup(args)
    elif args.command == 'status':
        handle_status()
    elif args.command == 'batch':
        handle_batch(args)
    else:
        parser.print_help()


def handle_post(args):
    """Handle immediate posting to platforms"""
    print(f"📤 Posting to {args.platform}...")

    try:
        if args.platform == 'linkedin':
            result = linkedin.post(args.content, image_path=args.image)
            print(f"✅ Posted to LinkedIn: {result['post_url']}")

        elif args.platform == 'instagram-reel':
            if not args.caption:
                print("❌ Instagram Reels require a caption. Use: propiq-cli post instagram-reel video.mp4 \"Caption\"")
                sys.exit(1)
            result = instagram.post_reel(args.content, args.caption)
            print(f"✅ Posted Instagram Reel: {result['permalink']}")
            print(f"⏰ Remember: Wait 2-3 hours before sharing to Stories!")

        elif args.platform == 'youtube-short':
            if not args.caption:
                print("❌ YouTube Shorts require a title. Use: propiq-cli post youtube-short video.mp4 \"Title\"")
                sys.exit(1)
            result = youtube.post_short(args.content, args.caption)
            print(f"✅ Posted YouTube Short: {result['video_url']}")

    except Exception as e:
        print(f"❌ Error posting: {str(e)}")
        sys.exit(1)


def handle_schedule(args):
    """Handle scheduled posts"""
    print(f"📅 Scheduling post to {args.platform} for {args.date}...")

    try:
        result = scheduler.schedule_post(
            platform=args.platform,
            content=args.content,
            scheduled_time=args.date,
            caption=args.caption
        )
        print(f"✅ Scheduled post ID: {result['schedule_id']}")
        print(f"   Will post on: {args.date}")

    except Exception as e:
        print(f"❌ Error scheduling: {str(e)}")
        sys.exit(1)


def handle_analytics(args):
    """Handle analytics requests"""
    print(f"📊 Fetching analytics for {args.platform} (last {args.days} days)...")

    try:
        result = analytics.get_analytics(args.platform, days=args.days)
        analytics.display_analytics(result)

    except Exception as e:
        print(f"❌ Error fetching analytics: {str(e)}")
        sys.exit(1)


def handle_setup(args):
    """Handle API credential setup"""
    from modules.setup import run_setup

    platform = args.platform if args.platform else 'all'
    print(f"🔧 Setting up {platform}...\n")

    run_setup(platform)


def handle_status():
    """Check API connection status for all platforms"""
    print("🔍 Checking API connection status...\n")

    platforms = ['linkedin', 'instagram', 'youtube']
    for platform in platforms:
        try:
            if platform == 'linkedin':
                status = linkedin.check_connection()
            elif platform == 'instagram':
                status = instagram.check_connection()
            elif platform == 'youtube':
                status = youtube.check_connection()

            if status['connected']:
                print(f"✅ {platform.capitalize()}: Connected")
                print(f"   Account: {status.get('account_name', 'N/A')}")
            else:
                print(f"❌ {platform.capitalize()}: Not connected")
                print(f"   Run: propiq-cli setup {platform}")
        except Exception as e:
            print(f"❌ {platform.capitalize()}: Error - {str(e)}")
        print()


def handle_batch(args):
    """Batch schedule posts from content calendar"""
    print(f"📋 Batch scheduling from {args.calendar_file}...\n")

    try:
        import json
        from pathlib import Path

        calendar_path = Path(args.calendar_file)
        if not calendar_path.exists():
            print(f"❌ Calendar file not found: {args.calendar_file}")
            sys.exit(1)

        with open(calendar_path) as f:
            calendar = json.load(f)

        scheduled_count = 0
        for post in calendar.get('posts', []):
            if post.get('status') == 'posted':
                continue

            try:
                result = scheduler.schedule_post(
                    platform=post['platform'],
                    content=post['content'],
                    scheduled_time=post['scheduled_time']
                )
                print(f"✅ Scheduled: {post['title']}")
                scheduled_count += 1
            except Exception as e:
                print(f"⚠️  Failed to schedule {post['title']}: {str(e)}")

        print(f"\n📅 Scheduled {scheduled_count} posts")

    except Exception as e:
        print(f"❌ Error batch scheduling: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
