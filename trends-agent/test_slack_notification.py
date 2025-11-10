#!/usr/bin/env python3
"""
Test Slack notification with sample trending data
"""

import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))

from propiq_trends_monitor import TrendsMonitor
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

print("="*80)
print("Testing Slack Notification System")
print("="*80)
print()

# Create sample trending data
sample_trends = [
    {
        'term': 'rental property calculator',
        'keyword_match': 'rental calculator',
        'detected_at': datetime.now().isoformat()
    },
    {
        'term': 'cap rate analysis real estate',
        'keyword_match': 'cap rate',
        'detected_at': datetime.now().isoformat()
    },
    {
        'term': 'investment property cash flow',
        'keyword_match': 'cash flow',
        'detected_at': datetime.now().isoformat()
    }
]

print(f"📊 Sample trending topics:")
for i, trend in enumerate(sample_trends, 1):
    print(f"  {i}. {trend['term'].title()}")
    print(f"     Match: {trend['keyword_match']}")
print()

# Get Slack webhook
slack_webhook = os.getenv('SLACK_WEBHOOK_URL')
if not slack_webhook:
    print("❌ No Slack webhook found in .env file")
    print("   Please add SLACK_WEBHOOK_URL to .env")
    sys.exit(1)

print(f"✅ Slack webhook configured")
print(f"   Webhook: {slack_webhook[:50]}...")
print()

# Create monitor
monitor = TrendsMonitor(slack_webhook_url=slack_webhook)

# Send notification
print("📤 Sending Slack notification...")
print()

success = monitor.send_slack_notification(sample_trends)

if success:
    print("="*80)
    print("✅ SUCCESS! Check your Slack channel for the notification!")
    print("="*80)
    print()
    print("The notification includes:")
    print("  • 3 sample trending topics")
    print("  • Keyword matches")
    print("  • Suggested actions")
    print("  • Command to generate blog content")
    print()
    print("Next steps:")
    print("  1. Check your Slack channel")
    print("  2. Review the formatted notification")
    print("  3. Try the Blog Writer Agent with one of these topics!")
    print()
else:
    print("="*80)
    print("❌ Notification failed. Check the error above.")
    print("="*80)
