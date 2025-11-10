#!/bin/bash

# PropIQ Onboarding Campaign Test Script
# Tests all 4 onboarding emails locally or in production

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}PropIQ Onboarding Campaign Test Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check for required environment variables
if [ -z "$SENDGRID_API_KEY" ]; then
    echo -e "${RED}❌ Error: SENDGRID_API_KEY not set${NC}"
    echo "Please set it with: export SENDGRID_API_KEY=SG.xxx..."
    exit 1
fi

# Ask for test email
read -p "Enter your test email address: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    echo -e "${RED}❌ Error: Email address required${NC}"
    exit 1
fi

# Ask for environment (local or production)
echo ""
echo "Select environment:"
echo "1) Local (http://localhost:8000)"
echo "2) Production (https://luntra-outreach-app.azurewebsites.net)"
read -p "Enter choice (1 or 2): " ENV_CHOICE

if [ "$ENV_CHOICE" = "1" ]; then
    BASE_URL="http://localhost:8000"
    ENV_NAME="LOCAL"
elif [ "$ENV_CHOICE" = "2" ]; then
    BASE_URL="https://luntra-outreach-app.azurewebsites.net"
    ENV_NAME="PRODUCTION"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Testing against: $ENV_NAME ($BASE_URL)${NC}"
echo ""

# Test health endpoint first
echo -e "${BLUE}1. Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/onboarding/health")
echo "$HEALTH_RESPONSE" | python3 -m json.tool

if echo "$HEALTH_RESPONSE" | grep -q '"sendgrid_configured": true'; then
    echo -e "${GREEN}✅ SendGrid is configured${NC}"
else
    echo -e "${RED}❌ SendGrid is NOT configured${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Sending test emails to: $TEST_EMAIL${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to send test email
send_test_email() {
    local DAY=$1
    local DAY_NAME=$2

    echo -e "${BLUE}$DAY. Sending Day $DAY email: $DAY_NAME${NC}"

    RESPONSE=$(curl -s -X POST "$BASE_URL/onboarding/test-email" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$TEST_EMAIL\", \"day\": $DAY}")

    echo "$RESPONSE" | python3 -m json.tool

    if echo "$RESPONSE" | grep -q '"status": "success"'; then
        echo -e "${GREEN}✅ Day $DAY email sent successfully${NC}"
    else
        echo -e "${RED}❌ Day $DAY email failed${NC}"
    fi

    echo ""
    sleep 2
}

# Send all 4 test emails
send_test_email 1 "Welcome to PropIQ"
send_test_email 2 "Master Property Analysis Like a Pro"
send_test_email 3 "Run the Numbers with Our Deal Calculator"
send_test_email 4 "Join 1,000+ Investors Using PropIQ"

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ All test emails sent!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Check your inbox at: $TEST_EMAIL"
echo ""
echo "You should receive 4 emails:"
echo "  1. Day 1: Welcome to PropIQ"
echo "  2. Day 2: Master Property Analysis Like a Pro"
echo "  3. Day 3: Run the Numbers with Our Deal Calculator"
echo "  4. Day 4: Join 1,000+ Investors Using PropIQ"
echo ""
echo -e "${BLUE}Note: In production, emails 2-4 are scheduled${NC}"
echo -e "${BLUE}      and sent 24, 48, and 72 hours after signup.${NC}"
echo ""
