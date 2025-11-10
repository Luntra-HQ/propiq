#!/bin/bash

# LUNTRA Creator Automation - Setup Script
# This script sets up the automated posting reminder system

set -e

echo "🤖 LUNTRA Creator Automation Setup"
echo "===================================="
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
python3 -m pip install --user requests 2>&1 | grep -v "Requirement already satisfied" || true

# Make slack-notify.py executable
chmod +x slack-notify.py

echo ""
echo "🔗 Slack Webhook Setup"
echo "======================"
echo ""
echo "To receive notifications in Slack, you need to create a webhook:"
echo ""
echo "1. Go to: https://api.slack.com/messaging/webhooks"
echo "2. Click 'Create your Slack app'"
echo "3. Choose 'From scratch'"
echo "4. Name it 'LUNTRA Creator Bot'"
echo "5. Select your workspace"
echo "6. Click 'Incoming Webhooks' → Enable"
echo "7. Click 'Add New Webhook to Workspace'"
echo "8. Choose a channel (e.g., #reminders or DM yourself)"
echo "9. Copy the webhook URL"
echo ""
read -p "Paste your Slack webhook URL here: " WEBHOOK_URL

if [ -z "$WEBHOOK_URL" ]; then
    echo "⚠️  No webhook URL provided. You can add it later in posting-schedule.json"
else
    # Update posting-schedule.json with webhook URL
    if command -v jq &> /dev/null; then
        # Use jq if available
        jq --arg url "$WEBHOOK_URL" '.slack_webhook_url = $url' posting-schedule.json > temp.json && mv temp.json posting-schedule.json
        echo "✅ Webhook URL saved to posting-schedule.json"
    else
        # Manual sed replacement
        sed -i.bak "s|YOUR_SLACK_WEBHOOK_URL_HERE|$WEBHOOK_URL|g" posting-schedule.json
        rm posting-schedule.json.bak 2>/dev/null || true
        echo "✅ Webhook URL saved to posting-schedule.json"
    fi
fi

echo ""
echo "🧪 Testing Slack Integration"
echo "============================"
echo ""
read -p "Would you like to send a test notification? (y/n): " TEST_CHOICE

if [ "$TEST_CHOICE" = "y" ] || [ "$TEST_CHOICE" = "Y" ]; then
    python3 slack-notify.py test
    echo ""
    echo "Check your Slack channel for the test notification!"
fi

echo ""
echo "⏰ Automated Schedule Setup"
echo "==========================="
echo ""
echo "Choose how you want to run the automation:"
echo ""
echo "1. Manual - Run 'python3 slack-notify.py check' whenever you want"
echo "2. Cron - Automatically check hourly (recommended)"
echo "3. Launchd - macOS native scheduler (most reliable on Mac)"
echo ""
read -p "Enter choice (1/2/3): " SCHEDULE_CHOICE

if [ "$SCHEDULE_CHOICE" = "2" ]; then
    echo ""
    echo "📅 Setting up cron job..."

    SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/slack-notify.py"
    CRON_ENTRY="0 * * * * cd \"$(dirname "$SCRIPT_PATH")\" && python3 slack-notify.py check >> cron.log 2>&1"

    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

    echo "✅ Cron job added. Will check hourly."
    echo "   View logs: cat $(dirname "$SCRIPT_PATH")/cron.log"

elif [ "$SCHEDULE_CHOICE" = "3" ]; then
    echo ""
    echo "📅 Setting up launchd (macOS)..."

    SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/slack-notify.py"
    PLIST_PATH="$HOME/Library/LaunchAgents/com.luntra.creator-automation.plist"

    cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.luntra.creator-automation</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$SCRIPT_PATH</string>
        <string>check</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$(dirname "$SCRIPT_PATH")</string>
    <key>StartInterval</key>
    <integer>3600</integer>
    <key>StandardOutPath</key>
    <string>$(dirname "$SCRIPT_PATH")/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>$(dirname "$SCRIPT_PATH")/launchd-error.log</string>
</dict>
</plist>
EOF

    # Load the launchd job
    launchctl load "$PLIST_PATH"

    echo "✅ Launchd job created and loaded."
    echo "   View logs: cat $(dirname "$SCRIPT_PATH")/launchd.log"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Quick Commands:"
echo "  • Test notification:    python3 slack-notify.py test"
echo "  • Send all pending:     python3 slack-notify.py all"
echo "  • List posts:           python3 slack-notify.py list"
echo "  • Mark as posted:       python3 slack-notify.py mark --post-id linkedin-1"
echo ""
echo "Schedule Configuration:"
echo "  • Edit: posting-schedule.json"
echo "  • Add more posts, change times, update research folders"
echo ""
echo "Your creator automation system is ready! 🚀"
