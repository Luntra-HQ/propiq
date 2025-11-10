#!/bin/bash
# Frontend Diagnostic Check (based on Dev Debug Agent principles)

echo "=== PropIQ Frontend Diagnostic Check ==="
echo ""

echo "1. Checking Node/NPM versions..."
node --version
npm --version
echo ""

echo "2. Checking if all dependencies are installed..."
npm list --depth=0 2>&1 | head -20
echo ""

echo "3. Checking for missing dependencies..."
missing_count=$(npm list 2>&1 | grep -c "UNMET DEPENDENCY" || true)
if [ "$missing_count" -gt 0 ]; then
  echo "❌ Found $missing_count missing dependencies!"
  npm list 2>&1 | grep "UNMET DEPENDENCY"
else
  echo "✅ All dependencies installed"
fi
echo ""

echo "4. Checking Tailwind CSS compilation..."
if [ -f "dist/assets/index-tTbucU0M.css" ]; then
  size=$(wc -c < dist/assets/index-tTbucU0M.css)
  echo "✅ CSS file exists: ${size} bytes"

  # Check if Tailwind utilities are present
  if grep -q "@tailwind" dist/assets/index-tTbucU0M.css; then
    echo "✅ Tailwind directives found in CSS"
  else
    echo "⚠️  Tailwind directives NOT found in CSS (may have been processed)"
  fi
else
  echo "❌ CSS file not found in dist"
fi
echo ""

echo "5. Checking JavaScript bundle..."
if [ -f "dist/assets/index-CgbnR2JV.js" ]; then
  size=$(wc -c < dist/assets/index-CgbnR2JV.js)
  echo "✅ JS bundle exists: ${size} bytes"
else
  echo "❌ JS bundle not found in dist"
fi
echo ""

echo "6. Checking critical files..."
files=("src/App.tsx" "src/main.tsx" "index.html" "tailwind.config.ts" "vite.config.ts")
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ MISSING: $file"
  fi
done
echo ""

echo "7. Testing local build..."
echo "Running: npm run build"
npm run build 2>&1 | tail -20
