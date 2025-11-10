#!/bin/bash

# PropIQ Trends Monitor Setup Script

echo "=================================================="
echo "PropIQ Google Trends Monitor Setup"
echo "=================================================="
echo ""

# Navigate to trends-agent directory
cd "$(dirname "$0")"

echo "📁 Working directory: $(pwd)"
echo ""

# Step 1: Install dependencies
echo "Step 1/4: Installing dependencies..."
echo "------------------------------------"
if command -v pip3 &> /dev/null; then
    pip3 install --quiet google-adk google-cloud-bigquery pandas requests python-dotenv
    echo "✅ Dependencies installed"
else
    echo "❌ pip3 not found. Please install Python 3 first."
    exit 1
fi
echo ""

# Step 2: Check Google Cloud auth
echo "Step 2/4: Checking Google Cloud authentication..."
echo "------------------------------------"
if gcloud auth application-default print-access-token > /dev/null 2>&1; then
    echo "✅ Google Cloud credentials configured"
else
    echo "⚠️  Google Cloud credentials not found"
    echo "   Run: gcloud auth application-default login"
fi
echo ""

# Step 3: Configure environment variables
echo "Step 3/4: Configuring environment variables..."
echo "------------------------------------"

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration:"
    echo ""
    echo "   1. SLACK_WEBHOOK_URL - Get from creator-automation/posting-schedule.json"
    echo "   2. SENDGRID_API_KEY - Get from backend/.env (if email alerts desired)"
    echo "   3. ALERT_EMAIL - Your email address"
    echo ""
    echo "📝 Opening .env file for editing..."
    sleep 2

    # Try to find Slack webhook from creator-automation
    CREATOR_CONFIG="../creator-automation/posting-schedule.json"
    if [ -f "$CREATOR_CONFIG" ]; then
        SLACK_WEBHOOK=$(python3 -c "import json; f=open('$CREATOR_CONFIG'); d=json.load(f); print(d.get('slack_webhook_url', ''))" 2>/dev/null)
        if [ ! -z "$SLACK_WEBHOOK" ]; then
            echo "✅ Found Slack webhook in creator-automation config"
            sed -i '' "s|SLACK_WEBHOOK_URL=\".*\"|SLACK_WEBHOOK_URL=\"$SLACK_WEBHOOK\"|" .env
        fi
    fi

    # Try to find SendGrid key from backend
    BACKEND_ENV="../backend/.env"
    if [ -f "$BACKEND_ENV" ]; then
        SENDGRID_KEY=$(grep "SENDGRID_API_KEY" "$BACKEND_ENV" | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        if [ ! -z "$SENDGRID_KEY" ]; then
            echo "✅ Found SendGrid key in backend config"
            sed -i '' "s|SENDGRID_API_KEY=\".*\"|SENDGRID_API_KEY=\"$SENDGRID_KEY\"|" .env
        fi
    fi

    echo ""
    echo "⚙️  Environment file created. Please review and update:"
    echo "   nano .env"
else
    echo "✅ .env file already exists"
fi
echo ""

# Step 4: Test the monitor
echo "Step 4/4: Testing the trends monitor..."
echo "------------------------------------"
echo ""
echo "Would you like to run a test check now? (y/n)"
read -r response

if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
    echo ""
    echo "Running test check (this may take 30-60 seconds)..."
    echo ""
    python3 propiq_trends_monitor.py --weeks 1 --no-email
    echo ""
else
    echo "Skipping test. You can run it later with:"
    echo "  python3 propiq_trends_monitor.py --weeks 1"
fi
echo ""

# Setup complete
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Review configuration:"
echo "   nano .env"
echo ""
echo "2. Test the monitor:"
echo "   python3 propiq_trends_monitor.py --weeks 1"
echo ""
echo "3. Set up automation (see README_TRENDS.md):"
echo "   - Daily: ./setup_automation.sh daily"
echo "   - Weekly: ./setup_automation.sh weekly"
echo ""
echo "4. View documentation:"
echo "   cat README_TRENDS.md"
echo ""
echo "🚀 Your Google Trends monitor is ready!"
echo ""
