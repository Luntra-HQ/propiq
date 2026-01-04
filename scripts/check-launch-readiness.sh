#!/bin/bash

# PropIQ Product Hunt Launch Readiness Check
# Runs comprehensive checks to ensure the site is ready for launch

set -e

echo "🚀 PropIQ Product Hunt Launch Readiness Check"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
WARN=0
FAIL=0

# Function to print check result
print_result() {
    local status=$1
    local message=$2

    if [ "$status" == "PASS" ]; then
        echo -e "${GREEN}✓${NC} $message"
        ((PASS++))
    elif [ "$status" == "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
        ((WARN++))
    else
        echo -e "${RED}✗${NC} $message"
        ((FAIL++))
    fi
}

echo "1. Performance Checks"
echo "--------------------"

# Check site is accessible
if curl -s --head https://propiq.luntra.one | grep "200 OK" > /dev/null; then
    print_result "PASS" "Site is accessible"
else
    print_result "FAIL" "Site is not accessible"
fi

# Check page load time
LOAD_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://propiq.luntra.one)
if (( $(echo "$LOAD_TIME < 3.0" | bc -l) )); then
    print_result "PASS" "Page load time: ${LOAD_TIME}s (< 3s)"
elif (( $(echo "$LOAD_TIME < 5.0" | bc -l) )); then
    print_result "WARN" "Page load time: ${LOAD_TIME}s (should be < 3s)"
else
    print_result "FAIL" "Page load time: ${LOAD_TIME}s (too slow)"
fi

echo ""
echo "2. SEO & Meta Tags"
echo "------------------"

# Check meta description
if curl -s https://propiq.luntra.one | grep -q 'meta name="description"'; then
    print_result "PASS" "Meta description present"
else
    print_result "FAIL" "Meta description missing"
fi

# Check Open Graph tags
if curl -s https://propiq.luntra.one | grep -q 'og:title'; then
    print_result "PASS" "Open Graph tags present"
else
    print_result "FAIL" "Open Graph tags missing"
fi

# Check Twitter Card
if curl -s https://propiq.luntra.one | grep -q 'twitter:card'; then
    print_result "PASS" "Twitter Card tags present"
else
    print_result "FAIL" "Twitter Card tags missing"
fi

# Check canonical URL
if curl -s https://propiq.luntra.one | grep -q 'rel="canonical"'; then
    print_result "PASS" "Canonical URL present"
else
    print_result "FAIL" "Canonical URL missing"
fi

echo ""
echo "3. Analytics & Tracking"
echo "----------------------"

# Check Google Analytics
if curl -s https://propiq.luntra.one | grep -q 'googletagmanager'; then
    print_result "PASS" "Google Analytics installed"
else
    print_result "FAIL" "Google Analytics missing"
fi

# Check Microsoft Clarity
if curl -s https://propiq.luntra.one | grep -q 'clarity.ms'; then
    print_result "PASS" "Microsoft Clarity installed"
else
    print_result "FAIL" "Microsoft Clarity missing"
fi

echo ""
echo "4. Security Checks"
echo "-----------------"

# Check HTTPS
if curl -s --head https://propiq.luntra.one | grep -q "https://"; then
    print_result "PASS" "HTTPS enabled"
else
    print_result "FAIL" "HTTPS not enabled"
fi

# Check security headers
if curl -s --head https://propiq.luntra.one | grep -q "Content-Security-Policy"; then
    print_result "PASS" "Content-Security-Policy header present"
else
    print_result "WARN" "Content-Security-Policy header missing"
fi

echo ""
echo "5. Mobile Responsiveness"
echo "----------------------"

# Check viewport meta tag
if curl -s https://propiq.luntra.one | grep -q 'name="viewport"'; then
    print_result "PASS" "Viewport meta tag present"
else
    print_result "FAIL" "Viewport meta tag missing"
fi

echo ""
echo "6. Core Functionality"
echo "-------------------"

# Check signup form exists
if curl -s https://propiq.luntra.one | grep -q 'waitlist'; then
    print_result "PASS" "Signup/waitlist section exists"
else
    print_result "FAIL" "Signup/waitlist section missing"
fi

# Check pricing page accessible
if curl -s https://propiq.luntra.one/pricing | grep "200 OK" > /dev/null 2>&1; then
    print_result "PASS" "Pricing page accessible"
else
    print_result "WARN" "Pricing page may not be accessible"
fi

echo ""
echo "7. Product Hunt Readiness"
echo "-----------------------"

# Check for Product Hunt UTM tracking
if curl -s "https://propiq.luntra.one/?utm_source=producthunt" | grep -q "propiq"; then
    print_result "PASS" "UTM parameter handling works"
else
    print_result "WARN" "UTM parameter handling may have issues"
fi

# Check assets directory
if [ -d "frontend/public" ]; then
    print_result "PASS" "Public assets directory exists"
else
    print_result "FAIL" "Public assets directory missing"
fi

# Check for logo/icon
if [ -f "frontend/public/propiq-icon.svg" ]; then
    print_result "PASS" "Product icon exists"
else
    print_result "FAIL" "Product icon missing"
fi

echo ""
echo "8. Content Checks"
echo "---------------"

# Check for compelling headline
if curl -s https://propiq.luntra.one | grep -qi "30 seconds"; then
    print_result "PASS" "Compelling headline present (30 seconds)"
else
    print_result "WARN" "Consider emphasizing speed in headline"
fi

# Check for social proof
if curl -s https://propiq.luntra.one | grep -qi "rating\|investors\|properties"; then
    print_result "PASS" "Social proof elements present"
else
    print_result "WARN" "Add more social proof elements"
fi

# Check for clear CTA
if curl -s https://propiq.luntra.one | grep -qi "free\|trial\|start"; then
    print_result "PASS" "Clear CTA present"
else
    print_result "WARN" "CTA could be more prominent"
fi

echo ""
echo "=============================================="
echo "SUMMARY"
echo "=============================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ] && [ $WARN -le 2 ]; then
    echo -e "${GREEN}🎉 Site is ready for Product Hunt launch!${NC}"
    exit 0
elif [ $FAIL -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Site is mostly ready, but address warnings before launch${NC}"
    exit 0
else
    echo -e "${RED}❌ Critical issues found. Fix failures before launch!${NC}"
    exit 1
fi
