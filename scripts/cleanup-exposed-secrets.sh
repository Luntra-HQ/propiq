#!/bin/bash
# ============================================================================
# Clean Up Exposed Secrets in Documentation Files
# ============================================================================

echo "🧹 Cleaning up exposed secrets from documentation..."
echo ""

# Backup first
BACKUP_DIR="backups/cleanup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Files with exposed secrets
FILES_TO_CLEAN=(
  "RENDER_ENV_VARS.txt"
  "DEPLOY_NOW_CHECKLIST.md"
  "docs/DEPLOY_NOW.md"
  "docs/DEPLOYMENT_READY.md"
  "backend/INTEGRATION_SUMMARY.md"
  "SECURITY_AUDIT_REPORT.md"
  "DIAGNOSTIC_REPORT.md"
  "TEST_STRIPE_CHECKOUT.md"
  "README.md"
  "vibe-marketing/DEPLOYMENT_SUCCESS.md"
  "vibe-marketing/DEPLOYMENT_GUIDE.md"
)

# Patterns to replace
declare -A REPLACEMENTS=(
  ["sk_live_[a-zA-Z0-9]{99,}"]="sk_live_*** (see .env.local)"
  ["sk_test_[a-zA-Z0-9]{99,}"]="sk_test_*** (see .env.local)"
  ["pk_live_[a-zA-Z0-9]{99,}"]="pk_live_*** (see .env.local)"
  ["SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}"]="SG.*** (see .env.local)"
  ["mongodb\+srv://[^:]+:[^@]+@"]="mongodb+srv://username:*** (see .env.local)"
  ["[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"]="<uuid-redacted>"
)

for file in "${FILES_TO_CLEAN[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"

    # Create backup
    cp "$file" "$BACKUP_DIR/"

    # Apply replacements
    for pattern in "${!REPLACEMENTS[@]}"; do
      replacement="${REPLACEMENTS[$pattern]}"
      # Use Perl for better regex support
      perl -i -pe "s/$pattern/$replacement/g" "$file" 2>/dev/null || true
    done

    echo "  ✅ Cleaned"
  else
    echo "  ⚠️  $file not found (skipping)"
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo "📁 Backups saved to: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Verify secrets are removed: grep -r 'sk_live_' ."
echo "  3. Commit changes: git add . && git commit -m 'docs: redact exposed secrets'"
