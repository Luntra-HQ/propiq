#!/bin/bash
# PropIQ: Remove SendGrid, Switch to Resend
# Resend is already configured in Convex

set -e

echo "📧 PropIQ SendGrid → Resend Migration"
echo "====================================="
echo ""
echo "This script will:"
echo "  1. Backup current .env files"
echo "  2. Remove SendGrid from environment variables"
echo "  3. Remove SendGrid from requirements.txt"
echo "  4. List files that reference SendGrid"
echo "  5. Note: Resend is already configured in convex/emails.ts"
echo ""
read -p "Continue? (y/n): " confirm

if [[ "$confirm" != "y" ]]; then
    echo "❌ Cancelled"
    exit 1
fi

cd "$(dirname "$0")/.."

echo ""
echo "📦 Step 1: Creating backups..."

# Create backup directory
BACKUP_DIR="backups/pre-resend-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup .env files
if [ -f "backend/.env" ]; then
    cp backend/.env "$BACKUP_DIR/.env.backup"
    echo "  ✅ Backed up backend/.env"
fi

echo ""
echo "🧼 Step 2: Removing SendGrid from environment variables..."

# Clean backend/.env
if [ -f "backend/.env" ]; then
    echo "  📝 Cleaning backend/.env..."

    # Remove SendGrid section
    sed -i.bak '/# SENDGRID/,/^$/d' backend/.env
    sed -i.bak '/SENDGRID_API_KEY/d' backend/.env
    sed -i.bak '/FROM_EMAIL/d' backend/.env
    sed -i.bak '/SUPPORT_EMAIL/d' backend/.env

    # Remove backup file
    rm backend/.env.bak 2>/dev/null || true

    echo "  ✅ Cleaned backend/.env"
fi

# Clean backend/.env.example
if [ -f "backend/.env.example" ]; then
    echo "  📝 Cleaning backend/.env.example..."

    sed -i.bak '/# SENDGRID/,/^$/d' backend/.env.example
    sed -i.bak '/SENDGRID_API_KEY/d' backend/.env.example
    sed -i.bak '/FROM_EMAIL/d' backend/.env.example
    sed -i.bak '/SUPPORT_EMAIL/d' backend/.env.example

    rm backend/.env.example.bak 2>/dev/null || true

    echo "  ✅ Cleaned backend/.env.example"
fi

# Clean backend/.env.template
if [ -f "backend/.env.template" ]; then
    echo "  📝 Cleaning backend/.env.template..."

    sed -i.bak '/# SENDGRID/,/^$/d' backend/.env.template
    sed -i.bak '/SENDGRID_API_KEY/d' backend/.env.template

    rm backend/.env.template.bak 2>/dev/null || true

    echo "  ✅ Cleaned backend/.env.template"
fi

echo ""
echo "📦 Step 3: Updating requirements.txt..."

if [ -f "backend/requirements.txt" ]; then
    cp backend/requirements.txt "$BACKUP_DIR/requirements.txt.backup"

    # Remove SendGrid dependency
    grep -v "sendgrid" backend/requirements.txt > backend/requirements.txt.tmp || true
    mv backend/requirements.txt.tmp backend/requirements.txt

    echo "  ✅ Removed sendgrid from requirements.txt"
fi

echo ""
echo "📋 Step 4: Files with SendGrid references..."
echo ""
echo "Python files using SendGrid (need manual update):"
echo ""

# Find Python files with SendGrid
if [ -f "backend/routers/marketing.py" ]; then
    if grep -q "sendgrid\|SendGrid" "backend/routers/marketing.py" 2>/dev/null; then
        echo "  ⚠️  backend/routers/marketing.py"
    fi
fi

if [ -f "backend/utils/onboarding_campaign.py" ]; then
    if grep -q "sendgrid\|SendGrid" "backend/utils/onboarding_campaign.py" 2>/dev/null; then
        echo "  ⚠️  backend/utils/onboarding_campaign.py"
    fi
fi

if [ -f "backend/routers/onboarding.py" ]; then
    if grep -q "sendgrid\|SendGrid" "backend/routers/onboarding.py" 2>/dev/null; then
        echo "  ⚠️  backend/routers/onboarding.py"
    fi
fi

echo ""
echo "✅ Resend is already configured in:"
echo "  ✓ convex/emails.ts"
echo "  ✓ convex/http.ts (HTTP endpoints)"
echo ""

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ SendGrid cleanup complete!"
echo ""
echo "📁 Backups saved to: $BACKUP_DIR/"
echo ""
echo "📧 Email Service Status:"
echo "  ❌ SendGrid - Removed"
echo "  ✅ Resend - Already configured in Convex"
echo ""
echo "📊 Resend Free Tier:"
echo "  • 3,000 emails/month (vs SendGrid's 100/day)"
echo "  • 100 emails/day limit"
echo "  • Perfect for PropIQ!"
echo ""
echo "⚠️  Manual steps:"
echo ""
echo "1. Update any Python backend files listed above to use Convex emails"
echo "2. Or remove email sending from Python backend (Convex handles it)"
echo "3. Run: pip install -r backend/requirements.txt"
echo "4. Test email sending via Convex"
echo "5. Cancel SendGrid account (if you have one)"
echo ""
echo "📝 See RESEND_CONFIGURATION_GUIDE.md for Resend setup"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
