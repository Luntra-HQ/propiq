#!/bin/bash
# PropIQ: Cleanup MongoDB and Supabase References
# Migrate to Convex-only architecture

set -e

echo "🧹 PropIQ MongoDB & Supabase Cleanup"
echo "====================================="
echo ""
echo "This script will:"
echo "  1. Backup current .env files"
echo "  2. Remove MongoDB and Supabase database files"
echo "  3. Clean environment variables"
echo "  4. Update requirements.txt"
echo "  5. List files needing manual review"
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
mkdir -p backups/pre-convex-migration-$(date +%Y%m%d)
BACKUP_DIR="backups/pre-convex-migration-$(date +%Y%m%d)"

# Backup .env files
if [ -f "backend/.env" ]; then
    cp backend/.env "$BACKUP_DIR/.env.backup"
    echo "  ✅ Backed up backend/.env"
fi

if [ -f "backend/.env.example" ]; then
    cp backend/.env.example "$BACKUP_DIR/.env.example.backup"
    echo "  ✅ Backed up backend/.env.example"
fi

echo ""
echo "🗑️  Step 2: Removing MongoDB & Supabase files..."

# Database files
files_to_remove=(
    "backend/database_mongodb.py"
    "backend/database_supabase.py"
    "backend/database.py"
    "backend/test_supabase_connection.py"
    "backend/supabase_schema.sql"
    "backend/supabase_migration_add_last_login.sql"
    "backend/simulations/COMPLETE_MIGRATION.sql"
    "backend/simulations/RUN_THIS_IN_SUPABASE.sql"
    "backend/simulations/MIGRATION_INSTRUCTIONS.md"
    "backend/SUPABASE_SETUP.md"
)

for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        # Backup before delete
        cp "$file" "$BACKUP_DIR/$(basename $file).backup" 2>/dev/null || true
        rm "$file"
        echo "  ✅ Removed $file"
    else
        echo "  ⚠️  $file not found (already removed?)"
    fi
done

echo ""
echo "🧼 Step 3: Cleaning environment variables..."

# Clean backend/.env
if [ -f "backend/.env" ]; then
    echo "  📝 Cleaning backend/.env..."

    # Remove MongoDB section
    sed -i.bak '/# MONGODB/,/^$/d' backend/.env
    sed -i.bak '/MONGODB_URI/d' backend/.env

    # Remove Supabase section
    sed -i.bak '/# SUPABASE/,/^$/d' backend/.env
    sed -i.bak '/SUPABASE_URL/d' backend/.env
    sed -i.bak '/SUPABASE_ANON_KEY/d' backend/.env
    sed -i.bak '/SUPABASE_SERVICE_KEY/d' backend/.env

    # Remove backup file
    rm backend/.env.bak 2>/dev/null || true

    echo "  ✅ Cleaned backend/.env"
fi

# Clean backend/.env.example
if [ -f "backend/.env.example" ]; then
    echo "  📝 Cleaning backend/.env.example..."

    sed -i.bak '/# MONGODB/,/^$/d' backend/.env.example
    sed -i.bak '/MONGODB_URI/d' backend/.env.example
    sed -i.bak '/# SUPABASE/,/^$/d' backend/.env.example
    sed -i.bak '/SUPABASE_URL/d' backend/.env.example
    sed -i.bak '/SUPABASE_ANON_KEY/d' backend/.env.example
    sed -i.bak '/SUPABASE_SERVICE_KEY/d' backend/.env.example

    rm backend/.env.example.bak 2>/dev/null || true

    echo "  ✅ Cleaned backend/.env.example"
fi

echo ""
echo "📦 Step 4: Updating requirements.txt..."

if [ -f "backend/requirements.txt" ]; then
    cp backend/requirements.txt "$BACKUP_DIR/requirements.txt.backup"

    # Remove MongoDB and Supabase dependencies
    grep -v "pymongo\|motor\|supabase\|postgrest" backend/requirements.txt > backend/requirements.txt.tmp
    mv backend/requirements.txt.tmp backend/requirements.txt

    echo "  ✅ Removed pymongo, motor, supabase, postgrest-py"
fi

echo ""
echo "📋 Step 5: Files requiring manual review..."
echo ""
echo "These files import Supabase/MongoDB and need manual updates:"
echo ""

# Find files with imports
files_with_imports=(
    "backend/routers/payment.py"
    "backend/routers/propiq.py"
    "backend/routers/support_chat.py"
    "backend/auth.py"
    "backend/utils/onboarding_campaign.py"
    "backend/tests/conftest.py"
)

for file in "${files_with_imports[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "supabase\|mongodb\|pymongo" "$file" 2>/dev/null; then
            echo "  ⚠️  $file - Contains Supabase/MongoDB imports"
        fi
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📁 Backups saved to: $BACKUP_DIR/"
echo ""
echo "⚠️  IMPORTANT: Manual steps required:"
echo ""
echo "1. Review files listed above and remove Supabase/MongoDB imports"
echo "2. Replace database calls with Convex mutations/queries"
echo "3. Update backend/requirements.txt if needed"
echo "4. Run: pip install -r backend/requirements.txt"
echo "5. Test PropIQ functionality"
echo "6. Update documentation (CLAUDE.md, README.md)"
echo "7. Delete MongoDB cluster in MongoDB Atlas"
echo "8. Pause/delete Supabase project"
echo ""
echo "📝 See CONVEX_ONLY_MIGRATION.md for full checklist"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
