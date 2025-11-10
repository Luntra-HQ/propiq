#!/usr/bin/env python3
"""
Auto-Post Script
Runs via cron to automatically post scheduled content

Usage:
    python3 auto-post.py

Cron example (every hour):
    0 * * * * cd /path/to/social-cli && python3 auto-post.py >> logs/auto-post.log 2>&1
"""

import sys
from datetime import datetime
from modules import scheduler, linkedin, instagram, youtube


def main():
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking for scheduled posts...")

    # Get posts due now
    try:
        posts = scheduler.get_posts_due_now()

        if not posts:
            print("No posts due at this time.")
            return

        print(f"Found {len(posts)} post(s) to publish:\n")

        for post in posts:
            try:
                print(f"Processing: {post['platform']} - ID {post['id']}")

                if post['platform'] == 'linkedin':
                    result = linkedin.post(post['content'])
                    print(f"✅ Posted to LinkedIn: {result['post_url']}")

                elif post['platform'] == 'instagram-reel':
                    result = instagram.post_reel(post['content'], post['caption'])
                    print(f"✅ Posted Instagram Reel: {result['permalink']}")
                    print(f"⏰ REMINDER: Wait 2-3 hours before sharing to Stories!")

                elif post['platform'] == 'youtube-short':
                    result = youtube.upload_with_google_client(post['content'], post['caption'])
                    print(f"✅ Posted YouTube Short: {result['video_url']}")

                # Mark as posted
                scheduler.mark_posted(post['id'])
                print(f"✅ Marked as posted: {post['id']}\n")

            except Exception as e:
                print(f"❌ Error posting {post['id']}: {str(e)}\n")
                continue

    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        sys.exit(1)

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Auto-post check complete.\n")


if __name__ == '__main__':
    main()
