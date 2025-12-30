#!/bin/bash
# ============================================================================
# Setup Pre-Commit Hooks for Secret Scanning
# ============================================================================

echo "🔧 Setting up pre-commit hooks for secret scanning..."
echo ""

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook to prevent committing secrets

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Patterns that indicate secrets
SECRET_PATTERNS=(
  "sk_live_"                    # Stripe live keys
  "sk_test_"                    # Stripe test keys
  "AIza"                        # Google API keys
  "AKIA"                        # AWS keys
  "mongodb+srv://.*:.*@"        # MongoDB connection strings with credentials
  "postgres://.*:.*@"           # PostgreSQL with credentials
  "mysql://.*:.*@"              # MySQL with credentials
  "Bearer [a-zA-Z0-9\-._~+/]+=*" # Bearer tokens
  "['\"][0-9a-f]{32,}['\"]"     # Long hex strings (potential tokens)
)

echo "🔍 Scanning for secrets..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Scan each staged file
SECRETS_FOUND=false

for file in $STAGED_FILES; do
  # Skip binary files and large files
  if file "$file" | grep -q "text"; then
    for pattern in "${SECRET_PATTERNS[@]}"; do
      if grep -qE "$pattern" "$file"; then
        echo -e "${RED}❌ BLOCKED: Potential secret found in $file${NC}"
        echo -e "${YELLOW}   Pattern: $pattern${NC}"
        SECRETS_FOUND=true
      fi
    done
  fi
done

# Also check for .env files
if echo "$STAGED_FILES" | grep -qE "\.env$|\.env\.local$|\.env\.production$"; then
  echo -e "${RED}❌ BLOCKED: Attempting to commit .env file!${NC}"
  echo -e "${YELLOW}   .env files should NEVER be committed${NC}"
  SECRETS_FOUND=true
fi

if [ "$SECRETS_FOUND" = true ]; then
  echo ""
  echo -e "${RED}🚨 COMMIT BLOCKED - Secrets detected!${NC}"
  echo ""
  echo "To fix:"
  echo "  1. Remove secrets from the files"
  echo "  2. Use environment variables instead"
  echo "  3. Add sensitive files to .gitignore"
  echo ""
  echo "If you're ABSOLUTELY SURE this is a false positive, use:"
  echo "  git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ No secrets detected"
exit 0
EOF

# Make pre-commit hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully"
echo ""
echo "This will prevent accidental commits of:"
echo "  - API keys (Stripe, Google, AWS, etc.)"
echo "  - Database connection strings with credentials"
echo "  - Bearer tokens"
echo "  - .env files"
echo ""
echo "To bypass the hook (NOT recommended):"
echo "  git commit --no-verify"
