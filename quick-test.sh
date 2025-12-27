#!/bin/bash

# PropIQ Quick Testing Script
# Runs the 5 Quick Wins from PRE_LAUNCH_QA_STRATEGY.md

echo "🚀 PropIQ Quick Testing Suite"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if frontend is running
echo -e "${BLUE}Checking if dev server is running...${NC}"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Dev server is running at http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Dev server not running${NC}"
    echo "Please start it with:"
    echo "  cd frontend && npm run dev"
    exit 1
fi

echo ""
echo "================================"
echo "Quick Win 1: Lighthouse Audit"
echo "================================"
echo ""

# Check if Lighthouse CLI is installed
if ! command -v lighthouse &> /dev/null; then
    echo -e "${YELLOW}Installing Lighthouse CLI...${NC}"
    npm install -g lighthouse
fi

# Run Lighthouse
echo -e "${BLUE}Running Lighthouse audit on http://localhost:5173...${NC}"
echo "This will take about 30 seconds..."

lighthouse http://localhost:5173 \
    --output html \
    --output json \
    --output-path ./lighthouse-report \
    --chrome-flags="--headless" \
    --quiet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Lighthouse audit complete!${NC}"
    echo ""

    # Parse scores from JSON
    PERFORMANCE=$(jq '.categories.performance.score * 100' lighthouse-report.json | cut -d'.' -f1)
    ACCESSIBILITY=$(jq '.categories.accessibility.score * 100' lighthouse-report.json | cut -d'.' -f1)
    BEST_PRACTICES=$(jq '."categories"."best-practices".score * 100' lighthouse-report.json | cut -d'.' -f1)
    SEO=$(jq '.categories.seo.score * 100' lighthouse-report.json | cut -d'.' -f1)

    echo "📊 Lighthouse Scores:"
    echo "━━━━━━━━━━━━━━━━━━━━"

    # Performance
    if [ $PERFORMANCE -ge 90 ]; then
        echo -e "Performance:     ${GREEN}${PERFORMANCE}/100 ✅${NC}"
    elif [ $PERFORMANCE -ge 50 ]; then
        echo -e "Performance:     ${YELLOW}${PERFORMANCE}/100 ⚠️${NC}"
    else
        echo -e "Performance:     ${RED}${PERFORMANCE}/100 ❌${NC}"
    fi

    # Accessibility
    if [ $ACCESSIBILITY -ge 95 ]; then
        echo -e "Accessibility:   ${GREEN}${ACCESSIBILITY}/100 ✅${NC}"
    elif [ $ACCESSIBILITY -ge 80 ]; then
        echo -e "Accessibility:   ${YELLOW}${ACCESSIBILITY}/100 ⚠️${NC}"
    else
        echo -e "Accessibility:   ${RED}${ACCESSIBILITY}/100 ❌${NC}"
    fi

    # Best Practices
    if [ $BEST_PRACTICES -ge 90 ]; then
        echo -e "Best Practices:  ${GREEN}${BEST_PRACTICES}/100 ✅${NC}"
    elif [ $BEST_PRACTICES -ge 70 ]; then
        echo -e "Best Practices:  ${YELLOW}${BEST_PRACTICES}/100 ⚠️${NC}"
    else
        echo -e "Best Practices:  ${RED}${BEST_PRACTICES}/100 ❌${NC}"
    fi

    # SEO
    if [ $SEO -ge 95 ]; then
        echo -e "SEO:             ${GREEN}${SEO}/100 ✅${NC}"
    elif [ $SEO -ge 80 ]; then
        echo -e "SEO:             ${YELLOW}${SEO}/100 ⚠️${NC}"
    else
        echo -e "SEO:             ${RED}${SEO}/100 ❌${NC}"
    fi

    echo ""
    echo -e "${BLUE}📄 Full report: lighthouse-report.html${NC}"
    echo "Open with: open lighthouse-report.html"
    echo ""

    # Overall status
    if [ $PERFORMANCE -ge 90 ] && [ $ACCESSIBILITY -ge 95 ] && [ $BEST_PRACTICES -ge 90 ] && [ $SEO -ge 95 ]; then
        echo -e "${GREEN}🎉 EXCELLENT! All scores meet launch criteria!${NC}"
    elif [ $PERFORMANCE -ge 80 ] && [ $ACCESSIBILITY -ge 80 ]; then
        echo -e "${YELLOW}⚠️  GOOD, but could improve. Review the report for opportunities.${NC}"
    else
        echo -e "${RED}❌ NEEDS WORK before launch. Fix critical issues in the report.${NC}"
    fi
else
    echo -e "${RED}❌ Lighthouse audit failed${NC}"
    exit 1
fi

echo ""
echo "================================"
echo "Quick Win 2: Backend Health Check"
echo "================================"
echo ""

# Check backend health
BACKEND_HEALTH=$(curl -s http://localhost:8000/propiq/health 2>/dev/null || echo "DOWN")
if [[ $BACKEND_HEALTH == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend not running at http://localhost:8000${NC}"
    echo "Start it with:"
    echo "  cd backend && source venv/bin/activate && uvicorn api:app --reload --port 8000"
fi

echo ""
echo "================================"
echo "Quick Win 3: Console Error Check"
echo "================================"
echo ""

echo -e "${BLUE}Checking for console errors...${NC}"
echo "Opening browser to check for JavaScript errors"
echo ""
echo "MANUAL STEP:"
echo "1. Browser window will open to http://localhost:5173"
echo "2. Press F12 to open DevTools"
echo "3. Go to Console tab"
echo "4. Look for red errors"
echo ""
echo -e "${YELLOW}✅ = No errors | ❌ = Has errors (need to fix)${NC}"
echo ""

# Open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5173
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:5173
fi

echo ""
echo "================================"
echo "Next Steps"
echo "================================"
echo ""
echo "1. Review Lighthouse report: open lighthouse-report.html"
echo "2. Check browser console for errors (F12)"
echo "3. Run manual critical path test (see PRE_LAUNCH_QA_STRATEGY.md)"
echo "4. Set up automated tests (Playwright)"
echo ""
echo "For complete testing guide, see:"
echo "  PRE_LAUNCH_QA_STRATEGY.md"
echo ""
echo -e "${GREEN}Happy testing! 🚀${NC}"
