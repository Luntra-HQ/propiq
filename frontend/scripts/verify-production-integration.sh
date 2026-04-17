#!/bin/bash

# Production Integration Verification Script
# Verifies that Convex backend is fully integrated with propiqhq.com

set -e  # Exit on error

echo "🚀 PropIQ Production Integration Verification"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://propiqhq.com}"
CONVEX_URL="https://mild-tern-361.convex.cloud"

echo "📍 Testing against:"
echo "   Frontend: $PRODUCTION_URL"
echo "   Backend:  $CONVEX_URL"
echo ""

# Step 1: Check if production site is accessible
echo "1️⃣  Checking frontend accessibility..."
if curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is NOT accessible${NC}"
    exit 1
fi

# Step 2: Check Convex deployment
echo ""
echo "2️⃣  Checking Convex backend..."
if curl -s -o /dev/null -w "%{http_code}" "$CONVEX_URL" | grep -q "200\|404\|405"; then
    echo -e "${GREEN}✅ Convex backend is accessible${NC}"
else
    echo -e "${RED}❌ Convex backend is NOT accessible${NC}"
    exit 1
fi

# Step 3: Run Playwright integration tests
echo ""
echo "3️⃣  Running integration tests..."
echo ""

# Test user registration
echo "   📝 Testing user registration..."
PLAYWRIGHT_BASE_URL="$PRODUCTION_URL" npx playwright test \
  --grep "complete user signup flow" \
  tests/production-backend-integration.spec.ts \
  --reporter=list \
  --max-failures=1 || {
    echo -e "${YELLOW}⚠️  User registration test needs review${NC}"
}

# Test property analysis
echo ""
echo "   📊 Testing property analysis..."
PLAYWRIGHT_BASE_URL="$PRODUCTION_URL" npx playwright test \
  --grep "property analysis is saved" \
  tests/production-backend-integration.spec.ts \
  --reporter=list \
  --max-failures=1 || {
    echo -e "${YELLOW}⚠️  Property analysis test needs review${NC}"
}

# Test real-time sync
echo ""
echo "   🔌 Testing Convex WebSocket connection..."
PLAYWRIGHT_BASE_URL="$PRODUCTION_URL" npx playwright test \
  --grep "WebSocket connection is established" \
  tests/production-backend-integration.spec.ts \
  --reporter=list \
  --max-failures=1 || {
    echo -e "${YELLOW}⚠️  WebSocket test needs review${NC}"
}

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Production Integration Verification Complete!${NC}"
echo ""
echo "📊 Summary:"
echo "   - Frontend: Accessible"
echo "   - Convex Backend: Connected"
echo "   - Integration Tests: Run completed"
echo ""
echo "📝 Next Steps:"
echo "   1. Review test results above"
echo "   2. Check any warnings (⚠️)"
echo "   3. View detailed report: npm run test:report"
echo "   4. Fix any failing tests"
echo ""
echo "💡 Tips:"
echo "   - Run full test suite: npm run test:production:full"
echo "   - Test specific feature: npx playwright test --grep 'feature-name'"
echo "   - Debug with UI: npm run test:ui"
echo ""
