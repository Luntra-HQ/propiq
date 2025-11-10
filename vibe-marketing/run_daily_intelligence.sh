#!/bin/bash

# PropIQ Daily Intelligence Report Runner
# This script sets environment variables and runs the daily intelligence report

# Change to script directory
cd "$(dirname "$0")"

# Load environment variables from parent backend directory
if [ -f "../backend/.env" ]; then
    echo "📂 Loading environment variables from backend/.env..."
    while IFS='=' read -r key value; do
        if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
            export "$key=$value"
        fi
    done < ../backend/.env
fi

# Check if we need additional variables
if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "⚠️  SLACK_WEBHOOK_URL not set"
    echo "Creating Slack webhook:"
    echo "1. Go to https://api.slack.com/apps"
    echo "2. Create app → Incoming Webhooks"
    echo "3. Add webhook to workspace"
    echo "4. Copy URL and add to .env:"
    echo "   SLACK_WEBHOOK_URL='https://hooks.slack.com/services/...'"
    echo ""
fi

# Run the Python script
echo "🚀 Running Daily Intelligence Report..."
echo "⏰ $(date)"
echo ""

python3 daily_intelligence.py

# Exit with the same code as the Python script
exit $?
