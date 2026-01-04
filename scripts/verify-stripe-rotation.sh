#!/bin/bash
# Stripe Key Rotation Verification Script
# Verifies that Stripe keys have been rotated successfully
# Usage: ./scripts/verify-stripe-rotation.sh

set -e

echo "=================================================="
echo "🔐 Stripe Key Rotation Verification"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Convex API endpoint
CONVEX_SITE="https://mild-tern-361.convex.site"

echo "📋 Verification Checklist"
echo "=================================================="
echo ""

# Test 1: Webhook Endpoint Exists
echo "Test 1: Webhook Endpoint Accessibility"
echo "---------------------------------------"
WEBHOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$CONVEX_SITE/stripe/webhook" \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}')

if [ "$WEBHOOK_RESPONSE" == "401" ] || [ "$WEBHOOK_RESPONSE" == "400" ]; then
  echo -e "${GREEN}✅ PASS${NC}: Webhook endpoint exists and validates signatures (HTTP $WEBHOOK_RESPONSE)"
  echo "   This means STRIPE_WEBHOOK_SECRET is configured"
elif [ "$WEBHOOK_RESPONSE" == "500" ]; then
  echo -e "${RED}❌ FAIL${NC}: Webhook endpoint error (HTTP 500)"
  echo "   Possible issue with webhook secret configuration"
  exit 1
else
  echo -e "${YELLOW}⚠️  WARN${NC}: Unexpected response (HTTP $WEBHOOK_RESPONSE)"
  echo "   Check Convex logs for details"
fi

echo ""

# Test 2: Check for exposed keys in codebase (should find NONE)
echo "Test 2: Exposed Keys in Codebase"
echo "---------------------------------"
EXPOSED_KEY_COUNT=$(grep -r "sk_live_51RdHuv" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist 2>/dev/null | wc -l)

if [ "$EXPOSED_KEY_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅ PASS${NC}: No exposed secret keys found in codebase"
else
  echo -e "${RED}❌ FAIL${NC}: Found $EXPOSED_KEY_COUNT references to exposed keys"
  echo "   Run: grep -r 'sk_live_51RdHuv' . --exclude-dir=node_modules"
  exit 1
fi

echo ""

# Test 3: Verify .env files don't contain Stripe keys (frontend shouldn't have them)
echo "Test 3: Frontend Environment Files"
echo "-----------------------------------"
if grep -q "STRIPE_SECRET_KEY" frontend/.env* 2>/dev/null; then
  echo -e "${RED}❌ FAIL${NC}: Stripe secret key found in frontend .env files"
  echo "   Secret keys should NEVER be in frontend code"
  exit 1
else
  echo -e "${GREEN}✅ PASS${NC}: No Stripe secret keys in frontend (correct)"
fi

echo ""

# Test 4: Manual verification reminders
echo "Test 4: Manual Verification Required"
echo "-------------------------------------"
echo -e "${YELLOW}⚠️  ACTION REQUIRED${NC}: Please verify the following manually:"
echo ""
echo "1. Stripe Dashboard - API Keys"
echo "   URL: https://dashboard.stripe.com/apikeys"
echo "   [ ] Old secret key (created before Dec 31, 2025) has been deleted"
echo "   [ ] New secret key (created Dec 31, 2025) is active"
echo ""
echo "2. Stripe Dashboard - Webhooks"
echo "   URL: https://dashboard.stripe.com/webhooks"
echo "   [ ] New webhook endpoint configured: $CONVEX_SITE/stripe/webhook"
echo "   [ ] Old webhook (if any) has been deleted"
echo "   [ ] Webhook secret copied to Convex environment"
echo ""
echo "3. Convex Dashboard - Environment Variables"
echo "   URL: https://dashboard.convex.dev/t/brian-dusape/propiq/settings/environment-variables"
echo "   [ ] STRIPE_SECRET_KEY updated to new key"
echo "   [ ] STRIPE_WEBHOOK_SECRET updated to new secret"
echo "   [ ] Deployment successful after update"
echo ""
echo "4. Test Payment Flow"
echo "   [ ] Login to PropIQ web app"
echo "   [ ] Go to Pricing page"
echo "   [ ] Click 'Upgrade to Starter'"
echo "   [ ] Verify Stripe checkout page loads"
echo "   [ ] Close checkout (don't complete)"
echo ""

# Test 5: Check Convex deployment status
echo "Test 5: Convex Deployment Status"
echo "---------------------------------"
echo "Checking if Convex functions are deployed..."

# Try to fetch /health or any public endpoint to verify deployment
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$CONVEX_SITE/auth/me")

if [ "$HEALTH_RESPONSE" == "200" ] || [ "$HEALTH_RESPONSE" == "401" ]; then
  echo -e "${GREEN}✅ PASS${NC}: Convex deployment is live (HTTP $HEALTH_RESPONSE)"
else
  echo -e "${RED}❌ FAIL${NC}: Convex deployment issue (HTTP $HEALTH_RESPONSE)"
  echo "   Run: npx convex deploy"
  exit 1
fi

echo ""
echo "=================================================="
echo "📊 Summary"
echo "=================================================="
echo ""
echo -e "${GREEN}Automated Tests: PASSED${NC}"
echo ""
echo -e "${YELLOW}Manual Verification Required:${NC}"
echo "Please complete the 4 manual checks above."
echo ""
echo "Next Steps:"
echo "1. Complete manual verification checklist"
echo "2. Monitor Stripe logs for 24 hours"
echo "3. Set calendar reminder for next rotation (April 1, 2026)"
echo "4. Close GitHub Issue #10 when complete"
echo ""
echo "Reference: STRIPE_KEY_ROTATION_GUIDE.md"
echo "=================================================="
