#!/bin/bash

# PropIQ - AI Analysis Testing Script
# Tests multiple property types and scenarios to verify AI quality

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
RAILWAY_URL="${1:-https://propiq-backend-production.up.railway.app}"
TOKEN_FILE="/tmp/propiq_test_token.txt"
RESULTS_DIR="/tmp/propiq_ai_tests_$(date +%s)"

# Check for token
if [ ! -f "$TOKEN_FILE" ]; then
    echo -e "${RED}✗ Token file not found at $TOKEN_FILE${NC}"
    echo "Run test_railway_api.sh first to create a test user and get a token"
    exit 1
fi

ACCESS_TOKEN=$(cat "$TOKEN_FILE")
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PropIQ AI Analysis Quality Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Railway URL: ${YELLOW}$RAILWAY_URL${NC}"
echo -e "Results will be saved to: ${YELLOW}$RESULTS_DIR${NC}"
echo ""

# Test function
test_property() {
    local test_name="$1"
    local address="$2"
    local property_type="$3"
    local purchase_price="$4"
    local expected_rating="${5:-any}"  # Optional expected rating

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Test: $test_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "Address: $address"
    echo "Type: $property_type"
    echo "Price: \$$purchase_price"
    echo ""

    # Make API request
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/propiq/analyze" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "{
            \"address\": \"$address\",
            \"propertyType\": \"$property_type\",
            \"purchasePrice\": $purchase_price
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "200" ]; then
        # Save to file
        SAFE_NAME=$(echo "$test_name" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')
        OUTPUT_FILE="$RESULTS_DIR/${SAFE_NAME}.json"
        echo "$RESPONSE_BODY" | python3 -m json.tool > "$OUTPUT_FILE"

        # Parse and display key metrics
        python3 << EOF
import json

with open('$OUTPUT_FILE', 'r') as f:
    data = json.load(f)

if data.get('success') and data.get('analysis'):
    a = data['analysis']

    print("\033[0;32m✓ Analysis completed\033[0m")
    print("")
    print("📊 Key Metrics:")
    print(f"  • Deal Score: {a.get('dealScore', 'N/A')}/100")
    print(f"  • Deal Rating: {a.get('dealRating', 'N/A')}")
    print(f"  • Purchase Price: \\\${a.get('purchasePrice', 'N/A'):,.0f}")

    monthly_rent = a.get('estimatedMonthlyRent', 0)
    if monthly_rent:
        print(f"  • Est. Monthly Rent: \\\${monthly_rent:,.2f}")

    cash_flow = a.get('monthlyCashFlow', 0)
    if isinstance(cash_flow, (int, float)):
        color = '\033[0;32m' if cash_flow > 0 else '\033[0;31m'
        print(f"  • Monthly Cash Flow: {color}\\\${cash_flow:,.2f}\033[0m")

    print(f"  • Cap Rate: {a.get('capRate', 'N/A')}%")
    print(f"  • Cash-on-Cash Return: {a.get('cashOnCashReturn', 'N/A')}%")

    print("")
    print("💡 Recommendation:")
    rec = a.get('recommendation', 'N/A')
    print(f"  {rec[:200]}{'...' if len(rec) > 200 else ''}")

    print("")
    print("📍 Key Findings:")
    for finding in a.get('keyFindings', [])[:3]:
        print(f"  • {finding}")

    print("")
    print("⚠️  Risks:")
    for risk in a.get('risks', [])[:3]:
        print(f"  • {risk}")

    # Validation checks
    print("")
    print("\033[0;34mValidation Checks:\033[0m")

    # Check if numbers are realistic (not zeros)
    checks_passed = 0
    checks_total = 0

    if a.get('dealScore', 0) > 0:
        print("  \033[0;32m✓\033[0m Deal score is non-zero")
        checks_passed += 1
    else:
        print("  \033[0;31m✗\033[0m Deal score is zero")
    checks_total += 1

    if monthly_rent > 0:
        print("  \033[0;32m✓\033[0m Rent estimate is non-zero")
        checks_passed += 1
    else:
        print("  \033[0;31m✗\033[0m Rent estimate is zero")
    checks_total += 1

    if a.get('capRate', 0) != 0:
        print("  \033[0;32m✓\033[0m Cap rate calculated")
        checks_passed += 1
    else:
        print("  \033[0;31m✗\033[0m Cap rate is zero")
    checks_total += 1

    if len(a.get('keyFindings', [])) >= 3:
        print("  \033[0;32m✓\033[0m Has 3+ key findings")
        checks_passed += 1
    else:
        print("  \033[0;31m✗\033[0m Less than 3 key findings")
    checks_total += 1

    if len(a.get('risks', [])) >= 2:
        print("  \033[0;32m✓\033[0m Has 2+ risks identified")
        checks_passed += 1
    else:
        print("  \033[0;31m✗\033[0m Less than 2 risks identified")
    checks_total += 1

    print("")
    print(f"Validation Score: {checks_passed}/{checks_total} checks passed")

    # Check expected rating if provided
    expected = '$expected_rating'
    if expected != 'any':
        actual_rating = a.get('dealRating', '').lower()
        if expected.lower() in actual_rating or actual_rating in expected.lower():
            print(f"  \033[0;32m✓\033[0m Rating matches expectation ({expected})")
        else:
            print(f"  \033[0;33m⚠\033[0m Rating unexpected (got: {a.get('dealRating')}, expected: {expected})")

else:
    print("\033[0;31m✗ Analysis failed or incomplete\033[0m")
    print(json.dumps(data, indent=2))
EOF

        echo -e "\n${GREEN}Saved to: $OUTPUT_FILE${NC}"
    else
        echo -e "${RED}✗ API request failed (HTTP $HTTP_CODE)${NC}"
        echo "$RESPONSE_BODY"
    fi

    echo ""
    sleep 2  # Rate limiting between requests
}

# Test Suite: Various property types and scenarios

# Test 1: Expensive San Francisco property (likely negative cash flow)
test_property \
    "Expensive SF Property" \
    "2100 Pacific Ave, San Francisco, CA 94115" \
    "single_family" \
    2500000 \
    "Fair or Hold"

# Test 2: Mid-range Austin property (potentially positive cash flow)
test_property \
    "Mid-Range Austin Property" \
    "4500 Duval St, Austin, TX 78751" \
    "single_family" \
    450000 \
    "Good or Buy"

# Test 3: Affordable Midwest property (high cash flow potential)
test_property \
    "Affordable Cleveland Property" \
    "3000 West 25th St, Cleveland, OH 44109" \
    "single_family" \
    150000 \
    "Strong Buy or Excellent"

# Test 4: Luxury Miami condo
test_property \
    "Luxury Miami Condo" \
    "1100 Biscayne Blvd, Miami, FL 33132" \
    "condo" \
    800000 \
    "Hold"

# Test 5: Multi-family in Denver
test_property \
    "Denver Multi-Family" \
    "2500 Larimer St, Denver, CO 80205" \
    "multi_family" \
    650000 \
    "Good or Buy"

# Final Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}All analysis results saved to:${NC}"
echo -e "${YELLOW}$RESULTS_DIR${NC}"
echo ""
echo -e "${BLUE}Review Results:${NC}"
echo "  cd $RESULTS_DIR"
echo "  cat *.json | python3 -m json.tool"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Review each analysis for quality and realism"
echo "  2. Check that deal ratings align with cash flow"
echo "  3. Verify market insights are location-specific"
echo "  4. Test with Chrome extension using these same properties"
echo ""
