#!/bin/bash
# Quick Sentry Test Script
# Tests both frontend and backend Sentry integration

set -e

echo "🧪 Testing Sentry Integration..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if DSN is configured
echo "1️⃣ Checking Sentry DSN configuration..."
echo ""

if grep -q "VITE_SENTRY_DSN" frontend/.env.local 2>/dev/null; then
    echo -e "${GREEN}✓ Frontend Sentry DSN configured${NC}"
    FRONTEND_DSN=$(grep VITE_SENTRY_DSN frontend/.env.local | cut -d'=' -f2)
    echo "  DSN: ${FRONTEND_DSN:0:50}..."
else
    echo -e "${RED}✗ Frontend Sentry DSN not configured${NC}"
    echo "  Run: echo 'VITE_SENTRY_DSN=your_dsn' >> frontend/.env.local"
fi

echo ""

if grep -q "SENTRY_DSN" backend/.env 2>/dev/null; then
    echo -e "${GREEN}✓ Backend Sentry DSN configured${NC}"
    BACKEND_DSN=$(grep SENTRY_DSN backend/.env | cut -d'=' -f2)
    echo "  DSN: ${BACKEND_DSN:0:50}..."
else
    echo -e "${RED}✗ Backend Sentry DSN not configured${NC}"
    echo "  Run: echo 'SENTRY_DSN=your_dsn' >> backend/.env"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backend test
echo "2️⃣ Testing Backend Sentry..."
echo ""

if [ -f "backend/venv/bin/python" ]; then
    echo "Running backend Sentry test..."
    cat > /tmp/test_sentry_backend.py << 'EOF'
import sys
sys.path.insert(0, '/Users/briandusape/Projects/LUNTRA/propiq/backend')

from dotenv import load_dotenv
load_dotenv('backend/.env')

from config.sentry_config import init_sentry, capture_exception, sentry_health_check

# Initialize Sentry
init_sentry()

# Check health
health = sentry_health_check()
print(f"Sentry Health: {health}")

# Send test error
try:
    raise Exception("🧪 TEST ERROR from backend - If you see this in Sentry, it's working!")
except Exception as e:
    capture_exception(e, test=True, source="test-script")
    print("\n✓ Test error sent to Sentry")
    print("  Check your Sentry dashboard in 30 seconds:")
    print("  https://sentry.io/organizations/YOUR_ORG/issues/")
EOF

    cd backend && venv/bin/python /tmp/test_sentry_backend.py && cd ..
    echo -e "${GREEN}✓ Backend test complete${NC}"
else
    echo -e "${YELLOW}⚠ Backend venv not found, skipping backend test${NC}"
    echo "  Run: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Frontend test instructions
echo "3️⃣ Testing Frontend Sentry..."
echo ""
echo -e "${YELLOW}To test frontend Sentry:${NC}"
echo ""
echo "  1. Start dev server:"
echo "     cd frontend && npm run dev"
echo ""
echo "  2. Open browser: http://localhost:5173"
echo ""
echo "  3. Open DevTools Console (F12)"
echo ""
echo "  4. Paste this:"
echo "     throw new Error('🧪 TEST ERROR from frontend - If you see this in Sentry, it's working!');"
echo ""
echo "  5. Check Sentry dashboard in 30 seconds:"
echo "     https://sentry.io/organizations/YOUR_ORG/issues/"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ Sentry test script complete!"
echo ""
echo "📊 Next: Check your Sentry dashboard"
echo "   https://sentry.io"
echo ""
echo "🔔 Then: Set up Slack alerts"
echo "   See: SENTRY_SLACK_SETUP.md"
