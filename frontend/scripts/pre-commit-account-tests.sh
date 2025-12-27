#!/bin/bash

# Pre-commit test script for account maintenance features
# Runs quick validation tests before allowing commit

set -e

echo "🧪 Running account maintenance pre-commit tests..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: Must run from frontend directory${NC}"
  exit 1
fi

# Get list of changed files
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Check if any account maintenance files were changed
ACCOUNT_FILES_CHANGED=false

for file in $CHANGED_FILES; do
  case $file in
    frontend/src/pages/SettingsPage.tsx|\
    frontend/src/components/ChangePasswordForm.tsx|\
    frontend/src/components/CancelSubscriptionDialog.tsx|\
    frontend/src/components/PlanChangeModal.tsx|\
    frontend/src/utils/passwordValidation.ts|\
    frontend/tests/account-settings.spec.ts|\
    frontend/tests/change-password.spec.ts|\
    frontend/tests/subscription-management.spec.ts|\
    frontend/tests/preferences.spec.ts|\
    convex/auth.ts)
      ACCOUNT_FILES_CHANGED=true
      break
      ;;
  esac
done

if [ "$ACCOUNT_FILES_CHANGED" = false ]; then
  echo -e "${YELLOW}⏭️  No account maintenance files changed, skipping tests${NC}"
  exit 0
fi

echo -e "${YELLOW}📝 Account maintenance files changed, running tests...${NC}"
echo ""

# Run tests (fast mode - chromium only)
echo "Running account settings tests..."
if npm run test:account-settings -- --project=chromium --reporter=list --quiet 2>&1 | grep -q "passed"; then
  echo -e "${GREEN}✅ Account settings tests passed${NC}"
else
  echo -e "${RED}❌ Account settings tests failed${NC}"
  exit 1
fi

echo ""
echo "Running change password tests..."
if npm run test:change-password -- --project=chromium --reporter=list --quiet 2>&1 | grep -q "passed"; then
  echo -e "${GREEN}✅ Change password tests passed${NC}"
else
  echo -e "${RED}❌ Change password tests failed${NC}"
  exit 1
fi

echo ""
echo "Running subscription management tests..."
if npm run test:subscription -- --project=chromium --reporter=list --quiet 2>&1 | grep -q "passed"; then
  echo -e "${GREEN}✅ Subscription management tests passed${NC}"
else
  echo -e "${RED}❌ Subscription management tests failed${NC}"
  exit 1
fi

echo ""
echo "Running preferences tests..."
if npm run test:preferences -- --project=chromium --reporter=list --quiet 2>&1 | grep -q "passed"; then
  echo -e "${GREEN}✅ Preferences tests passed${NC}"
else
  echo -e "${RED}❌ Preferences tests failed${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ All account maintenance tests passed!${NC}"
echo ""
exit 0
