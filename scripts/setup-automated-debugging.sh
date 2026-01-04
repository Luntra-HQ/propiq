#!/bin/bash

# Setup Automated Debugging System for PropIQ
# This script sets up all automated bug detection infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔧 Setting up PropIQ Automated Debugging System"
echo "================================================"
echo ""

# Step 1: Create directories
echo "📁 Step 1: Creating directories..."
mkdir -p "$PROJECT_DIR/frontend/test-results/console-logs"
mkdir -p "$PROJECT_DIR/frontend/test-results/bug-reports"
mkdir -p "$PROJECT_DIR/logs"
echo "   ✅ Directories created"
echo ""

# Step 2: Make scripts executable
echo "🔐 Step 2: Making scripts executable..."
chmod +x "$SCRIPT_DIR/continuous-bug-monitor.sh"
chmod +x "$SCRIPT_DIR/setup-automated-debugging.sh"
echo "   ✅ Scripts are now executable"
echo ""

# Step 3: Verify Playwright is installed
echo "🎭 Step 3: Verifying Playwright installation..."
cd "$PROJECT_DIR/frontend"
if ! npm list @playwright/test > /dev/null 2>&1; then
  echo "   ⚠️  Playwright not found. Installing..."
  npm install --save-dev @playwright/test
  npx playwright install --with-deps
else
  echo "   ✅ Playwright is installed"
fi
echo ""

# Step 4: Run first test
echo "🧪 Step 4: Running first automated bug detection test..."
echo "   (This will take 1-2 minutes)"
echo ""

npm run test:e2e -- tests/automated-bug-detection.spec.ts --reporter=list || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Run manual test:"
echo "   cd frontend && npm run test:e2e -- tests/automated-bug-detection.spec.ts"
echo ""
echo "2. View console logs:"
echo "   cat frontend/test-results/console-logs/*.json"
echo ""
echo "3. Enable continuous monitoring (runs every 15 min):"
echo "   crontab -e"
echo "   # Add this line:"
echo "   */15 * * * * $SCRIPT_DIR/continuous-bug-monitor.sh >> $PROJECT_DIR/logs/bug-monitor.log 2>&1"
echo ""
echo "4. Setup Sentry for production error tracking:"
echo "   - Sign up at https://sentry.io"
echo "   - Get your DSN"
echo "   - Add to .env: VITE_SENTRY_DSN=your_dsn_here"
echo ""
echo "🎉 You're all set! Automated debugging is ready."
