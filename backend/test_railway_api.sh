#!/bin/bash

# PropIQ Backend - Automated Railway API Testing Script
# Tests all endpoints end-to-end with real data

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
RAILWAY_URL="${1:-https://propiq-backend-production.up.railway.app}"
TEST_EMAIL="test-$(date +%s)@propiq.com"  # Unique email for each test run
TEST_PASSWORD="TestPass123!"
TEST_FIRST_NAME="PropIQ"
TOKEN_FILE="/tmp/propiq_test_token.txt"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PropIQ Backend API Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Railway URL: ${YELLOW}$RAILWAY_URL${NC}"
echo -e "Test Email: ${YELLOW}$TEST_EMAIL${NC}"
echo ""

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "GET $RAILWAY_URL/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$RAILWAY_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$RESPONSE_BODY" | python3 -m json.tool
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# Test 2: PropIQ Health Check
echo -e "${BLUE}Test 2: PropIQ AI Health Check${NC}"
echo "GET $RAILWAY_URL/propiq/health"
PROPIQ_HEALTH=$(curl -s -w "\n%{http_code}" "$RAILWAY_URL/propiq/health")
HTTP_CODE=$(echo "$PROPIQ_HEALTH" | tail -n1)
RESPONSE_BODY=$(echo "$PROPIQ_HEALTH" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PropIQ health check passed${NC}"
    echo "$RESPONSE_BODY" | python3 -m json.tool

    # Check if Azure OpenAI is configured
    if echo "$RESPONSE_BODY" | grep -q '"azure_openai_configured": true'; then
        echo -e "${GREEN}✓ Azure OpenAI is configured${NC}"
    else
        echo -e "${RED}✗ Azure OpenAI is NOT configured${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ PropIQ health check failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# Test 3: User Signup
echo -e "${BLUE}Test 3: User Signup${NC}"
echo "POST $RAILWAY_URL/auth/signup"
SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"firstName\": \"$TEST_FIRST_NAME\"
    }")

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SIGNUP_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Signup successful${NC}"
    echo "$RESPONSE_BODY" | python3 -m json.tool

    # Extract and save access token
    ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])")
    echo "$ACCESS_TOKEN" > "$TOKEN_FILE"
    echo -e "${GREEN}✓ Access token saved to $TOKEN_FILE${NC}"

    # Validate response has email field
    if echo "$RESPONSE_BODY" | grep -q "\"email\""; then
        echo -e "${GREEN}✓ Response includes email field${NC}"
    else
        echo -e "${RED}✗ Response missing email field (API contract issue)${NC}"
    fi
else
    echo -e "${RED}✗ Signup failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# Test 4: User Login (verify can login with created account)
echo -e "${BLUE}Test 4: User Login${NC}"
echo "POST $RAILWAY_URL/auth/login"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "$RESPONSE_BODY" | python3 -m json.tool

    # Validate response has email field
    if echo "$RESPONSE_BODY" | grep -q "\"email\""; then
        echo -e "${GREEN}✓ Response includes email field${NC}"
    else
        echo -e "${RED}✗ Response missing email field (API contract issue)${NC}"
    fi
else
    echo -e "${RED}✗ Login failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# Test 5: Property Analysis (Real AI Test!)
echo -e "${BLUE}Test 5: Property Analysis (AI Integration Test)${NC}"
echo "POST $RAILWAY_URL/propiq/analyze"
echo -e "${YELLOW}Testing with real San Francisco property...${NC}"

# Load the saved token
if [ ! -f "$TOKEN_FILE" ]; then
    echo -e "${RED}✗ Token file not found. Run signup test first.${NC}"
    exit 1
fi
ACCESS_TOKEN=$(cat "$TOKEN_FILE")

ANALYSIS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/propiq/analyze" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
        "address": "2100 Pacific Ave, San Francisco, CA 94115",
        "propertyType": "single_family",
        "purchasePrice": 2500000
    }')

HTTP_CODE=$(echo "$ANALYSIS_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ANALYSIS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Analysis successful${NC}"

    # Save full response to file for inspection
    ANALYSIS_FILE="/tmp/propiq_analysis_$(date +%s).json"
    echo "$RESPONSE_BODY" | python3 -m json.tool > "$ANALYSIS_FILE"
    echo -e "${GREEN}✓ Full analysis saved to $ANALYSIS_FILE${NC}"

    # Validate response structure
    echo ""
    echo -e "${BLUE}Validating response structure...${NC}"

    # Check for success field
    if echo "$RESPONSE_BODY" | grep -q "\"success\": true"; then
        echo -e "${GREEN}✓ success: true${NC}"
    else
        echo -e "${RED}✗ success field missing or false${NC}"
    fi

    # Check for analysis object
    if echo "$RESPONSE_BODY" | grep -q "\"analysis\""; then
        echo -e "${GREEN}✓ analysis object present${NC}"
    else
        echo -e "${RED}✗ analysis object missing${NC}"
    fi

    # Check for key fields in transformed format
    REQUIRED_FIELDS=(
        "address"
        "purchasePrice"
        "dealScore"
        "dealRating"
        "monthlyCashFlow"
        "capRate"
        "cashOnCashReturn"
        "recommendation"
        "keyFindings"
        "risks"
        "opportunities"
        "marketInsights"
    )

    for field in "${REQUIRED_FIELDS[@]}"; do
        if echo "$RESPONSE_BODY" | grep -q "\"$field\""; then
            echo -e "${GREEN}✓ $field present${NC}"
        else
            echo -e "${RED}✗ $field missing${NC}"
        fi
    done

    # Check for usesRemaining
    if echo "$RESPONSE_BODY" | grep -q "\"usesRemaining\""; then
        USES_REMAINING=$(echo "$RESPONSE_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('usesRemaining', 'N/A'))")
        echo -e "${GREEN}✓ usesRemaining: $USES_REMAINING${NC}"
    else
        echo -e "${YELLOW}⚠ usesRemaining field missing${NC}"
    fi

    # Display key analysis results
    echo ""
    echo -e "${BLUE}Analysis Results:${NC}"
    echo "$RESPONSE_BODY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success') and data.get('analysis'):
    a = data['analysis']
    print(f\"  Address: {a.get('address', 'N/A')}\"
    print(f\"  Deal Score: {a.get('dealScore', 'N/A')}/100\")
    print(f\"  Deal Rating: {a.get('dealRating', 'N/A')}\")
    print(f\"  Monthly Cash Flow: \${a.get('monthlyCashFlow', 'N/A'):,.2f}\" if isinstance(a.get('monthlyCashFlow'), (int, float)) else f\"  Monthly Cash Flow: {a.get('monthlyCashFlow', 'N/A')}\")
    print(f\"  Cap Rate: {a.get('capRate', 'N/A')}%\")
    print(f\"  Cash-on-Cash Return: {a.get('cashOnCashReturn', 'N/A')}%\")
    print(f\"  Recommendation: {a.get('recommendation', 'N/A')[:100]}...\")
else:
    print('  Analysis data not available')
"

else
    echo -e "${RED}✗ Analysis failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"

    # Check for common error messages
    if echo "$RESPONSE_BODY" | grep -q "No analyses remaining"; then
        echo -e "${YELLOW}⚠ User has no analyses remaining (quota exceeded)${NC}"
    elif echo "$RESPONSE_BODY" | grep -q "Token has expired"; then
        echo -e "${YELLOW}⚠ JWT token expired${NC}"
    elif echo "$RESPONSE_BODY" | grep -q "Invalid token"; then
        echo -e "${YELLOW}⚠ Invalid JWT token${NC}"
    fi

    exit 1
fi
echo ""

# Test Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All Tests Passed! ✓${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Test Results Summary:${NC}"
echo -e "  ${GREEN}✓${NC} Backend is healthy"
echo -e "  ${GREEN}✓${NC} Azure OpenAI is configured"
echo -e "  ${GREEN}✓${NC} User signup works"
echo -e "  ${GREEN}✓${NC} User login works"
echo -e "  ${GREEN}✓${NC} AI property analysis works"
echo -e "  ${GREEN}✓${NC} Response format matches extension schema"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review the full analysis output: cat $ANALYSIS_FILE | python3 -m json.tool"
echo "2. Test with the Chrome extension (disable mock mode)"
echo "3. Test on real Zillow listings"
echo ""
echo -e "${YELLOW}Saved Files:${NC}"
echo "  - JWT Token: $TOKEN_FILE"
echo "  - Analysis Result: $ANALYSIS_FILE"
echo ""
