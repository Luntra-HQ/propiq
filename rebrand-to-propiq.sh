#!/bin/bash

# PropIQ Rebrand Script
# Systematically replaces all instances of PropIQ with PropIQ

set -e  # Exit on error

echo "🎯 Starting PropIQ Rebrand..."
echo "================================"

# Base directory
BASE_DIR="/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq"

# File extensions to search
FILE_PATTERNS=(
  "*.md"
  "*.tsx"
  "*.ts"
  "*.css"
  "*.py"
  "*.sh"
  "*.json"
  "*.html"
  "*.xml"
  "*.txt"
  "*.yaml"
  "*.toml"
)

echo "Step 1: Finding all files with 'PropIQ' or 'propiq'..."
echo "----------------------------------------------------"

# Create temporary file list
TMP_FILE=$(mktemp)

# Find all files matching patterns (excluding node_modules, venv, dist, etc.)
find "$BASE_DIR" -type f \( \
  -name "*.md" -o \
  -name "*.tsx" -o \
  -name "*.ts" -o \
  -name "*.css" -o \
  -name "*.py" -o \
  -name "*.sh" -o \
  -name "*.json" -o \
  -name "*.html" -o \
  -name "*.xml" -o \
  -name "*.txt" -o \
  -name "*.yaml" -o \
  -name "*.toml" \
\) \
  -not -path "*/node_modules/*" \
  -not -path "*/venv/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -not -path "*/wandb/*" \
  -not -path "*/__pycache__/*" \
  > "$TMP_FILE"

TOTAL_FILES=$(wc -l < "$TMP_FILE")
echo "Found $TOTAL_FILES files to process"

echo ""
echo "Step 2: Performing find/replace operations..."
echo "----------------------------------------------------"

REPLACED_COUNT=0

while IFS= read -r file; do
  # Check if file contains any of our target strings
  if grep -q -E "PropIQ|propiq|PROPIQ" "$file" 2>/dev/null; then
    echo "Updating: ${file#$BASE_DIR/}"

    # Perform replacements using sed (macOS compatible)
    sed -i '' 's/PropIQ/PropIQ/g' "$file"
    sed -i '' 's/propiq/propiq/g' "$file"
    sed -i '' 's/PROPIQ/PROPIQ/g' "$file"

    ((REPLACED_COUNT++))
  fi
done < "$TMP_FILE"

echo ""
echo "Updated $REPLACED_COUNT files with PropIQ branding"

echo ""
echo "Step 3: Renaming component files..."
echo "----------------------------------------------------"

# Rename PropIQAnalysis.tsx → PropIQAnalysis.tsx
if [ -f "$BASE_DIR/frontend/src/components/PropIQAnalysis.tsx" ]; then
  mv "$BASE_DIR/frontend/src/components/PropIQAnalysis.tsx" "$BASE_DIR/frontend/src/components/PropIQAnalysis.tsx"
  echo "✓ Renamed PropIQAnalysis.tsx → PropIQAnalysis.tsx"
fi

# Rename PropIQAnalysis.css → PropIQAnalysis.css
if [ -f "$BASE_DIR/frontend/src/components/PropIQAnalysis.css" ]; then
  mv "$BASE_DIR/frontend/src/components/PropIQAnalysis.css" "$BASE_DIR/frontend/src/components/PropIQAnalysis.css"
  echo "✓ Renamed PropIQAnalysis.css → PropIQAnalysis.css"
fi

# Rename backend router: propiq.py → propiq.py
if [ -f "$BASE_DIR/backend/routers/propiq.py" ]; then
  mv "$BASE_DIR/backend/routers/propiq.py" "$BASE_DIR/backend/routers/propiq.py"
  echo "✓ Renamed backend/routers/propiq.py → propiq.py"
fi

# Rename documentation files
if [ -f "$BASE_DIR/PROPIQ_MARKETING_FUNNEL_STRATEGY.md" ]; then
  mv "$BASE_DIR/PROPIQ_MARKETING_FUNNEL_STRATEGY.md" "$BASE_DIR/PROPIQ_MARKETING_FUNNEL_STRATEGY.md"
  echo "✓ Renamed PROPIQ_MARKETING_FUNNEL_STRATEGY.md → PROPIQ_MARKETING_FUNNEL_STRATEGY.md"
fi

# Rename trends agent files
if [ -f "$BASE_DIR/trends-agent/propiq_trends_monitor.py" ]; then
  mv "$BASE_DIR/trends-agent/propiq_trends_monitor.py" "$BASE_DIR/trends-agent/propiq_trends_monitor.py"
  echo "✓ Renamed propiq_trends_monitor.py → propiq_trends_monitor.py"
fi

# Rename blog agent prompts if exists
if [ -f "$BASE_DIR/blog-writer-agent/propiq_prompts.txt" ]; then
  mv "$BASE_DIR/blog-writer-agent/propiq_prompts.txt" "$BASE_DIR/blog-writer-agent/propiq_prompts.txt"
  echo "✓ Renamed propiq_prompts.txt → propiq_prompts.txt"
fi

echo ""
echo "Step 4: Updating import statements..."
echo "----------------------------------------------------"

# Update imports in App.tsx
if [ -f "$BASE_DIR/frontend/src/App.tsx" ]; then
  sed -i '' 's/from.*PropIQAnalysis/from '\''\.\/components\/PropIQAnalysis/g' "$BASE_DIR/frontend/src/App.tsx"
  echo "✓ Updated imports in App.tsx"
fi

# Update CSS imports
if [ -f "$BASE_DIR/frontend/src/components/PropIQAnalysis.tsx" ]; then
  sed -i '' "s/import '\.\/PropIQAnalysis\.css'/import '\.\/PropIQAnalysis\.css'/g" "$BASE_DIR/frontend/src/components/PropIQAnalysis.tsx"
  echo "✓ Updated CSS import in PropIQAnalysis.tsx"
fi

# Update backend router imports in api.py
if [ -f "$BASE_DIR/backend/api.py" ]; then
  sed -i '' 's/from routers import.*propiq/from routers import propiq/g' "$BASE_DIR/backend/api.py"
  sed -i '' 's/from routers\.propiq/from routers\.propiq/g' "$BASE_DIR/backend/api.py"
  echo "✓ Updated router imports in api.py"
fi

# Clean up
rm "$TMP_FILE"

echo ""
echo "================================"
echo "✅ PropIQ Rebrand Complete!"
echo "================================"
echo ""
echo "Summary:"
echo "  • Updated $REPLACED_COUNT files"
echo "  • Renamed component files"
echo "  • Updated import statements"
echo ""
echo "Next steps:"
echo "  1. Fix robots.txt validation errors"
echo "  2. Set up 301 redirects (propiq → propiq)"
echo "  3. Deploy to propiq.luntra.one"
echo "  4. Verify all functionality"
echo ""
