#!/usr/bin/env python3
"""
LUNTRA Creator Automation - Slack Notification System
Sends intelligent reminders about what to post and when.
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
import requests

# Get script directory
SCRIPT_DIR = Path(__file__).parent
SCHEDULE_FILE = SCRIPT_DIR / "posting-schedule.json"


def load_schedule():
    """Load the posting schedule configuration"""
    with open(SCHEDULE_FILE, 'r') as f:
        return json.load(f)


def extract_post_content(file_path, section_header):
    """
    Extract post content from markdown file based on section header

    Args:
        file_path: Path to markdown file
        section_header: Section to extract (e.g., "📱 LINKEDIN POST #1")

    Returns:
        Dict with title, content, and metadata
    """
    full_path = SCRIPT_DIR / file_path

    if not full_path.exists():
        return {"error": f"File not found: {full_path}"}

    with open(full_path, 'r') as f:
        content = f.read()

    # Find the section
    section_pattern = rf"## {re.escape(section_header)}.*?\n\n(.*?)(?=\n##|\Z)"
    match = re.search(section_pattern, content, re.DOTALL)

    if not match:
        return {"error": f"Section not found: {section_header}"}

    section_content = match.group(1).strip()

    # Extract the actual post copy (between ``` markers)
    copy_pattern = r"```\n(.*?)\n```"
    copy_match = re.search(copy_pattern, section_content, re.DOTALL)

    if copy_match:
        post_text = copy_match.group(1).strip()
    else:
        post_text = "Content extraction failed"

    # Extract best time to post
    time_pattern = r"\*\*When to post:\*\* (.*?)(?:\n|$)"
    time_match = re.search(time_pattern, section_content)
    best_time = time_match.group(1) if time_match else "Not specified"

    return {
        "post_text": post_text,
        "best_time": best_time,
        "preview": post_text[:200] + "..." if len(post_text) > 200 else post_text
    }


def get_context_from_research(research_folders):
    """
    Gather relevant context from research folders

    Args:
        research_folders: List of folder paths to scan

    Returns:
        String with relevant insights
    """
    insights = []

    for folder in research_folders:
        folder_path = SCRIPT_DIR / folder

        if folder_path.is_file():
            # It's a file, extract key insights
            try:
                with open(folder_path, 'r') as f:
                    content = f.read()

                # Extract key insights (lines starting with ✅ or - ✅)
                insight_lines = re.findall(r'(?:^|\n)[\-\s]*✅\s*(.+?)(?:\n|$)', content)
                if insight_lines:
                    insights.extend(insight_lines[:3])  # Top 3 insights
            except:
                pass

    if insights:
        return "\n• " + "\n• ".join(insights)
    return "No additional context available"


def send_slack_notification(webhook_url, post_data, schedule_config):
    """
    Send rich Slack notification with post content

    Args:
        webhook_url: Slack webhook URL
        post_data: Post information from schedule
        schedule_config: Full schedule configuration
    """

    # Extract post content
    content = extract_post_content(post_data['file'], post_data['section'])

    if "error" in content:
        print(f"Error: {content['error']}")
        return False

    # Get research context if enabled
    context = ""
    if schedule_config['settings']['include_research_context']:
        context = get_context_from_research(schedule_config['research_folders'])

    # Build Slack message blocks
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"📢 Time to Post: {post_data['title']}",
                "emoji": True
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*Platform:*\n{post_data['platform'].title()}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Best Time:*\n{post_data['optimal_time']}"
                }
            ]
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Post Content:*\n```\n{content['post_text'][:2900]}\n```"  # Slack limit
            }
        }
    ]

    # Add context if available
    if context and schedule_config['settings']['include_research_context']:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*📚 Research Context:*\n{context}"
            }
        })

    # Add notes if present
    if post_data.get('notes'):
        blocks.append({
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": f"💡 *Note:* {post_data['notes']}"
                }
            ]
        })

    # Add action buttons
    blocks.extend([
        {
            "type": "divider"
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "📋 Copy Post",
                        "emoji": True
                    },
                    "value": "copy_post",
                    "action_id": "copy_post"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "✅ Mark Posted",
                        "emoji": True
                    },
                    "value": "mark_posted",
                    "action_id": "mark_posted",
                    "style": "primary"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "⏰ Remind Later",
                        "emoji": True
                    },
                    "value": "remind_later",
                    "action_id": "remind_later"
                }
            ]
        }
    ])

    # Send to Slack
    payload = {
        "blocks": blocks,
        "text": f"Time to post: {post_data['title']}"  # Fallback text
    }

    try:
        response = requests.post(webhook_url, json=payload)
        response.raise_for_status()
        print(f"✅ Slack notification sent for: {post_data['title']}")
        return True
    except Exception as e:
        print(f"❌ Error sending Slack notification: {e}")
        return False


def check_and_notify(mode="check"):
    """
    Check schedule and send notifications if needed

    Args:
        mode: "check" (normal), "test" (send first post), or "all" (send all pending)
    """
    schedule = load_schedule()

    if not schedule['settings']['enable_reminders']:
        print("⏸️  Reminders are disabled in settings")
        return

    webhook_url = schedule['slack_webhook_url']

    if webhook_url == "YOUR_SLACK_WEBHOOK_URL_HERE":
        print("⚠️  Please set your Slack webhook URL in posting-schedule.json")
        print("   Get one at: https://api.slack.com/messaging/webhooks")
        return

    now = datetime.now()

    if mode == "test":
        # Send notification for first pending post
        for post in schedule['posts']:
            if post['status'] == 'pending':
                print(f"🧪 Sending test notification for: {post['title']}")
                send_slack_notification(webhook_url, post, schedule)
                break
        return

    if mode == "all":
        # Send notifications for all pending posts
        for post in schedule['posts']:
            if post['status'] == 'pending':
                print(f"📤 Sending notification for: {post['title']}")
                send_slack_notification(webhook_url, post, schedule)
        return

    # Normal mode: Check if it's time to post
    advance_hours = schedule['advance_notice_hours']

    for post in schedule['posts']:
        if post['status'] != 'pending':
            continue

        # Parse cron expression (simplified for this use case)
        # Format: minute hour day month weekday
        # Example: "0 7 * * 2" = 7:00 AM on Tuesdays
        cron_parts = post['cron'].split()
        cron_hour = int(cron_parts[1])
        cron_weekday = int(cron_parts[4]) if cron_parts[4] != '*' else None

        # Check if we should notify
        notify_hour = cron_hour - advance_hours
        if notify_hour < 0:
            notify_hour += 24

        should_notify = now.hour == notify_hour

        if cron_weekday is not None:
            # 0 = Monday in cron, but Python uses 0 = Monday
            should_notify = should_notify and now.weekday() == cron_weekday

        if should_notify:
            print(f"🔔 Time to notify for: {post['title']}")
            send_slack_notification(webhook_url, post, schedule)


def mark_posted(post_id):
    """Mark a post as completed"""
    schedule = load_schedule()

    for post in schedule['posts']:
        if post['id'] == post_id:
            post['status'] = 'posted'
            post['posted_at'] = datetime.now().isoformat()
            break

    with open(SCHEDULE_FILE, 'w') as f:
        json.dump(schedule, f, indent=2)

    print(f"✅ Marked {post_id} as posted")


def list_posts():
    """List all posts in schedule"""
    schedule = load_schedule()

    print("\n📋 Posting Schedule:\n")

    for post in schedule['posts']:
        status_emoji = "✅" if post['status'] == 'posted' else "⏳"
        print(f"{status_emoji} {post['title']}")
        print(f"   Platform: {post['platform']}")
        print(f"   Time: {post['optimal_time']}")
        print(f"   Status: {post['status']}")
        print()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="LUNTRA Creator Automation")
    parser.add_argument('action', choices=['check', 'test', 'all', 'list', 'mark'],
                       help='Action to perform')
    parser.add_argument('--post-id', help='Post ID (for mark action)')

    args = parser.parse_args()

    if args.action == 'list':
        list_posts()
    elif args.action == 'mark':
        if not args.post_id:
            print("❌ Please specify --post-id")
            sys.exit(1)
        mark_posted(args.post_id)
    else:
        check_and_notify(mode=args.action)
