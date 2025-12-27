#!/bin/bash

# Quick validation script for account maintenance tests
# Runs a subset of tests to verify integration

echo "🚀 Quick Account Maintenance Test Validation"
echo "==========================================="
echo ""

# Check syntax by listing tests
echo "1️⃣  Validating test syntax..."

if npx playwright test --list tests/account-settings.spec.ts 2>&1 | grep -q "account-settings.spec.ts"; then
  echo "  ✅ account-settings.spec.ts - Syntax OK"
else
  echo "  ❌ account-settings.spec.ts - Syntax Error"
  exit 1
fi

if npx playwright test --list tests/change-password.spec.ts 2>&1 | grep -q "change-password.spec.ts"; then
  echo "  ✅ change-password.spec.ts - Syntax OK"
else
  echo "  ❌ change-password.spec.ts - Syntax Error"
  exit 1
fi

if npx playwright test --list tests/subscription-management.spec.ts 2>&1 | grep -q "subscription-management.spec.ts"; then
  echo "  ✅ subscription-management.spec.ts - Syntax OK"
else
  echo "  ❌ subscription-management.spec.ts - Syntax Error"
  exit 1
fi

if npx playwright test --list tests/preferences.spec.ts 2>&1 | grep -q "preferences.spec.ts"; then
  echo "  ✅ preferences.spec.ts - Syntax OK"
else
  echo "  ❌ preferences.spec.ts - Syntax Error"
  exit 1
fi

echo ""
echo "2️⃣  Counting test cases..."

ACCOUNT_TESTS=$(npx playwright test --list tests/account-settings.spec.ts 2>/dev/null | grep -c "›")
CHANGE_PASSWORD_TESTS=$(npx playwright test --list tests/change-password.spec.ts 2>/dev/null | grep -c "›")
SUBSCRIPTION_TESTS=$(npx playwright test --list tests/subscription-management.spec.ts 2>/dev/null | grep -c "›")
PREFERENCES_TESTS=$(npx playwright test --list tests/preferences.spec.ts 2>/dev/null | grep -c "›")

TOTAL_TESTS=$((ACCOUNT_TESTS / 3 + CHANGE_PASSWORD_TESTS / 3 + SUBSCRIPTION_TESTS / 3 + PREFERENCES_TESTS / 3))

echo "  📊 Test Count Summary:"
echo "     - Account Settings: ~$((ACCOUNT_TESTS / 3)) tests"
echo "     - Change Password: ~$((CHANGE_PASSWORD_TESTS / 3)) tests"
echo "     - Subscription Mgmt: ~$((SUBSCRIPTION_TESTS / 3)) tests"
echo "     - Preferences: ~$((PREFERENCES_TESTS / 3)) tests"
echo "     - Total: ~$TOTAL_TESTS tests"

echo ""
echo "3️⃣  Checking package.json scripts..."

if grep -q "test:account-maintenance" package.json; then
  echo "  ✅ npm run test:account-maintenance - Available"
else
  echo "  ❌ npm run test:account-maintenance - Missing"
  exit 1
fi

if grep -q "test:account-settings" package.json; then
  echo "  ✅ npm run test:account-settings - Available"
else
  echo "  ❌ npm run test:account-settings - Missing"
  exit 1
fi

if grep -q "test:change-password" package.json; then
  echo "  ✅ npm run test:change-password - Available"
else
  echo "  ❌ npm run test:change-password - Missing"
  exit 1
fi

echo ""
echo "✅ All validations passed!"
echo ""
echo "📋 Next Steps:"
echo "   1. Run all tests: npm run test:account-maintenance"
echo "   2. Run with UI: npm run test:account-maintenance:headed"
echo "   3. Check documentation: tests/ACCOUNT_MAINTENANCE_TESTS.md"
echo ""
