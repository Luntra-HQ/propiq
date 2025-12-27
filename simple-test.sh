#!/bin/bash

# PropIQ Simple Testing Script (No Browser Required)
# For Lighthouse, use Chrome DevTools instead (more reliable)

echo "🚀 PropIQ Simple Testing Suite"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# 1. Check if frontend is running
echo -e "${BLUE}[1/5] Checking if dev server is running...${NC}"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Dev server is running at http://localhost:5173${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Dev server not running${NC}"
    echo "Please start it with:"
    echo "  cd frontend && npm run dev"
    ((FAILED++))
    exit 1
fi

echo ""

# 2. Check if backend is running
echo -e "${BLUE}[2/5] Checking backend health...${NC}"
BACKEND_HEALTH=$(curl -s http://localhost:8000/propiq/health 2>/dev/null || echo "DOWN")
if [[ $BACKEND_HEALTH == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Backend is healthy at http://localhost:8000${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Backend not running (optional for frontend testing)${NC}"
    echo "Start it with:"
    echo "  cd backend && source venv/bin/activate && uvicorn api:app --reload --port 8000"
fi

echo ""

# 3. Test frontend response time
echo -e "${BLUE}[3/5] Testing frontend response time...${NC}"
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' http://localhost:5173)
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)

if [ $RESPONSE_MS -lt 1000 ]; then
    echo -e "${GREEN}✅ Response time: ${RESPONSE_MS}ms (excellent!)${NC}"
    ((PASSED++))
elif [ $RESPONSE_MS -lt 3000 ]; then
    echo -e "${YELLOW}⚠️  Response time: ${RESPONSE_MS}ms (acceptable, but could be faster)${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Response time: ${RESPONSE_MS}ms (too slow! Should be < 3000ms)${NC}"
    ((FAILED++))
fi

echo ""

# 4. Check if essential files are served
echo -e "${BLUE}[4/5] Checking if essential files are served...${NC}"

# Check index.html
if curl -s http://localhost:5173 | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✅ index.html served correctly${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ index.html not found or malformed${NC}"
    ((FAILED++))
fi

# Check for PropIQ in title
if curl -s http://localhost:5173 | grep -q "PropIQ"; then
    echo -e "${GREEN}✅ Page title contains 'PropIQ'${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Page title doesn't contain 'PropIQ' (check SEO)${NC}"
fi

echo ""

# 5. Check for common security headers (will be set in production)
echo -e "${BLUE}[5/5] Checking production readiness...${NC}"

# Check if build directory exists
if [ -d "frontend/dist" ]; then
    DIST_SIZE=$(du -sh frontend/dist 2>/dev/null | cut -f1)
    echo -e "${GREEN}✅ Production build exists (${DIST_SIZE})${NC}"
    ((PASSED++))

    # Check build size
    DIST_SIZE_MB=$(du -sm frontend/dist 2>/dev/null | cut -f1)
    if [ $DIST_SIZE_MB -lt 5 ]; then
        echo -e "${GREEN}✅ Build size: ${DIST_SIZE}MB (good!)${NC}"
        ((PASSED++))
    elif [ $DIST_SIZE_MB -lt 10 ]; then
        echo -e "${YELLOW}⚠️  Build size: ${DIST_SIZE}MB (acceptable, but could optimize)${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ Build size: ${DIST_SIZE}MB (too large! Should be < 10MB)${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  No production build found. Run 'npm run build' to create one${NC}"
    echo "  cd frontend && npm run build"
fi

echo ""
echo "================================"
echo "Summary"
echo "================================"
echo ""
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All basic checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run Lighthouse audit using Chrome DevTools (see below)"
    echo "2. Test critical user path manually (signup → analysis → payment)"
    echo "3. Test on real mobile device"
    echo ""
else
    echo -e "${RED}❌ Some checks failed. Fix issues above before proceeding.${NC}"
    echo ""
fi

echo "================================"
echo "How to Run Lighthouse (Recommended)"
echo "================================"
echo ""
echo "Use Chrome DevTools for more reliable results:"
echo ""
echo "1. Open http://localhost:5173 in Chrome"
echo "2. Press F12 (or Cmd+Option+I on Mac)"
echo "3. Click 'Lighthouse' tab"
echo "4. Select all categories (Performance, Accessibility, Best Practices, SEO)"
echo "5. Click 'Analyze page load'"
echo "6. Wait ~30 seconds for results"
echo ""
echo "Target scores:"
echo "  Performance:     > 90"
echo "  Accessibility:   > 95"
echo "  Best Practices:  > 90"
echo "  SEO:            > 95"
echo ""
echo "================================"
echo "Manual Testing Checklist"
echo "================================"
echo ""
echo "Critical Path Test (must complete in < 3 minutes):"
echo ""
echo "1. Sign Up (30 seconds)"
echo "   - Go to http://localhost:5173"
echo "   - Click 'Sign Up'"
echo "   - Email: test-\$(date +%s)@propiq.com"
echo "   - Password: Test123!@#"
echo "   - Submit"
echo "   ✅ Should redirect to dashboard"
echo "   ✅ Should show '3 free analyses remaining'"
echo ""
echo "2. Run Analysis (60 seconds)"
echo "   - Click 'Run PropIQ Analysis'"
echo "   - Enter: 2505 Longview St, Austin, TX 78705"
echo "   - Click 'Analyze Property'"
echo "   ✅ Should show loading state"
echo "   ✅ Should return results in < 15 seconds"
echo "   ✅ Should display Deal Score (0-100)"
echo ""
echo "3. Check Console (F12)"
echo "   - Press F12 to open DevTools"
echo "   - Go to Console tab"
echo "   ✅ Should have ZERO red errors"
echo ""
echo "================================"
echo ""
echo -e "${BLUE}For complete testing guide, see:${NC}"
echo "  TESTING_QUICK_START.md"
echo "  PRE_LAUNCH_QA_STRATEGY.md"
echo ""
