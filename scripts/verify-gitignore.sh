#!/bin/bash
# ============================================================================
# Verify .gitignore is properly configured
# ============================================================================

echo "🔍 Verifying .gitignore configuration..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Files that should NEVER be tracked
SENSITIVE_FILES=(
  ".env"
  ".env.local"
  ".env.production"
  "backend/.env"
  "backend/.env.local"
  "frontend/.env.local"
  "~/Desktop/new_keys.txt"
)

# Check each file
ALL_SAFE=true

for file in "${SENSITIVE_FILES[@]}"; do
  # Expand tilde
  expanded_file="${file/#\~/$HOME}"

  if [ -f "$expanded_file" ]; then
    # File exists, check if it's ignored
    if git check-ignore -q "$file" 2>/dev/null; then
      echo -e "${GREEN}✅ $file - Properly ignored${NC}"
    else
      echo -e "${RED}❌ $file - NOT IGNORED (DANGEROUS!)${NC}"
      ALL_SAFE=false
    fi
  else
    echo -e "${YELLOW}⚠️  $file - Does not exist (OK)${NC}"
  fi
done

echo ""

if [ "$ALL_SAFE" = true ]; then
  echo -e "${GREEN}✅ All sensitive files are properly protected${NC}"
  exit 0
else
  echo -e "${RED}❌ SECURITY RISK: Some sensitive files are not ignored!${NC}"
  echo ""
  echo "Fix by adding to .gitignore:"
  echo ""
  for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ] && ! git check-ignore -q "$file" 2>/dev/null; then
      echo "  $file"
    fi
  done
  echo ""
  exit 1
fi
