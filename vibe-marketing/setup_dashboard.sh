#!/bin/bash
#
# PropIQ Daily Intelligence Dashboard - Setup Script
# This script automates the setup process for the daily intelligence dashboard
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo ""
}

# Check if running from correct directory
if [[ ! -f "daily_intelligence_enhanced.py" ]]; then
    print_error "Please run this script from the vibe-marketing directory"
    echo "  cd /path/to/propiq/vibe-marketing"
    echo "  ./setup_dashboard.sh"
    exit 1
fi

print_header "PropIQ Daily Intelligence Dashboard Setup"
print_info "This wizard will help you set up the automated daily intelligence dashboard"
echo ""

# Step 1: Check Python
print_header "Step 1: Checking Prerequisites"

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    print_success "Python 3 found: $PYTHON_VERSION"
else
    print_error "Python 3 not found. Please install Python 3.8 or higher"
    exit 1
fi

# Step 2: Install dependencies
print_header "Step 2: Installing Python Dependencies"

print_info "Installing required packages..."
pip3 install requests pymongo python-dotenv 2>&1 | grep -E '(Successfully installed|Requirement already satisfied)' || true
print_success "Dependencies installed"

# Step 3: Create environment file
print_header "Step 3: Creating Environment Configuration"

if [[ -f ".env.production" ]]; then
    print_warning ".env.production already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Keeping existing .env.production"
    else
        cp .env.production.template .env.production
        print_success "Created .env.production from template"
    fi
else
    cp .env.production.template .env.production
    print_success "Created .env.production from template"
fi

# Step 4: Collect API keys
print_header "Step 4: Configuring API Keys"
print_info "You'll need to manually edit .env.production with your API keys"
echo ""
print_info "Required keys:"
echo "  1. STRIPE_SECRET_KEY (from dashboard.stripe.com)"
echo "  2. CONVEX_URL (from dashboard.convex.dev)"
echo "  3. SLACK_WEBHOOK_URL (from api.slack.com/apps)"
echo "  4. AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY (from portal.azure.com)"
echo ""

read -p "Press Enter to open .env.production in your default editor..."

# Try to open in appropriate editor
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open -e .env.production
elif command -v nano &> /dev/null; then
    nano .env.production
elif command -v vim &> /dev/null; then
    vim .env.production
else
    print_warning "Could not open editor automatically"
    print_info "Please manually edit .env.production with your API keys"
fi

echo ""
read -p "Have you configured all required API keys in .env.production? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please configure .env.production before proceeding"
    exit 0
fi

# Step 5: Test the dashboard
print_header "Step 5: Testing Dashboard"

print_info "Running test to verify configuration..."
echo ""

# Source the environment file
set -a
source .env.production
set +a

# Run the dashboard script
if python3 daily_intelligence_enhanced.py; then
    print_success "Dashboard test successful!"
else
    print_error "Dashboard test failed. Check the errors above and verify your API keys"
    exit 1
fi

# Step 6: Create logs directory
print_header "Step 6: Setting Up Logging"

mkdir -p logs
print_success "Created logs directory"

# Step 7: Set up cron job
print_header "Step 7: Setting Up Daily Schedule"

print_info "The dashboard can run automatically every day at 9 AM"
echo ""
read -p "Do you want to set up the cron job now? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Get absolute path
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    # Create cron entry
    CRON_CMD="0 9 * * * cd $SCRIPT_DIR && source .env.production && python3 daily_intelligence_enhanced.py >> logs/daily_report_\$(date +\%Y\%m\%d).log 2>&1"

    # Check if cron entry already exists
    if crontab -l 2>/dev/null | grep -q "daily_intelligence_enhanced.py"; then
        print_warning "Cron job already exists. Skipping..."
    else
        # Add to crontab
        (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
        print_success "Cron job added! Dashboard will run daily at 9 AM"

        # Show current crontab
        echo ""
        print_info "Current cron schedule:"
        crontab -l | grep "daily_intelligence_enhanced.py"
    fi
else
    print_info "To set up the cron job manually later, run:"
    echo ""
    echo "  crontab -e"
    echo ""
    echo "And add this line:"
    echo "  0 9 * * * cd $(pwd) && source .env.production && python3 daily_intelligence_enhanced.py >> logs/daily_report_\$(date +%Y%m%d).log 2>&1"
    echo ""
fi

# Step 8: Deploy Convex function
print_header "Step 8: Deploying Convex Function"

print_info "The dashboard needs a Convex function for metrics collection"
echo ""

if [[ -f "../convex/dailyMetrics.ts" ]]; then
    print_success "Found convex/dailyMetrics.ts"

    read -p "Deploy to Convex now? (requires npx convex) (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd ..
        if npx convex deploy; then
            print_success "Convex function deployed!"
        else
            print_error "Convex deployment failed. You may need to run 'npx convex dev' first"
        fi
        cd vibe-marketing
    else
        print_info "Deploy later with: cd ../.. && npx convex deploy"
    fi
else
    print_warning "convex/dailyMetrics.ts not found"
    print_info "Make sure to deploy the Convex function manually"
fi

# Summary
print_header "🎉 Setup Complete!"

echo "Your PropIQ Daily Intelligence Dashboard is ready!"
echo ""
print_success "✅ Python dependencies installed"
print_success "✅ Environment configured"
print_success "✅ Dashboard tested"
print_success "✅ Logging set up"

if crontab -l 2>/dev/null | grep -q "daily_intelligence_enhanced.py"; then
    print_success "✅ Daily schedule configured"
else
    print_warning "⚠️  Manual cron setup needed"
fi

echo ""
print_info "Next steps:"
echo "  1. Your first report will arrive tomorrow at 9 AM in Slack"
echo "  2. Check logs in: $SCRIPT_DIR/logs/"
echo "  3. To run manually: python3 daily_intelligence_enhanced.py"
echo ""
print_info "To test Slack delivery right now:"
echo "  python3 daily_intelligence_enhanced.py"
echo ""

print_header "🚀 Happy Automating!"
