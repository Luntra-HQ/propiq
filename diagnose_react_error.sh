#!/bin/bash

echo "==================================================================="
echo "PropIQ React Error Diagnostic Script"
echo "==================================================================="

echo ""
echo "1. Checking for multiple React versions in node_modules..."
echo "-------------------------------------------------------------------"
cd /Users/briandusape/Projects/propiq/frontend
find node_modules -name 'package.json' -path '*/react/package.json' -exec grep -H '"version"' {} \;

echo ""
echo "2. Checking React-related dependencies that might cause issues..."
echo "-------------------------------------------------------------------"
echo "React version: $(npm list react --depth=0 2>/dev/null | grep react@)"
echo "React-DOM version: $(npm list react-dom --depth=0 2>/dev/null | grep react-dom@)"

echo ""
echo "3. Checking for libraries that might not support React 19..."
echo "-------------------------------------------------------------------"
echo "Styled-components: $(npm list styled-components --depth=0 2>/dev/null | grep styled-components@)"
echo "@radix-ui packages: $(npm list @radix-ui/react-dialog --depth=0 2>/dev/null | grep react-dialog@)"
echo "React Router: $(npm list react-router-dom --depth=0 2>/dev/null | grep react-router-dom@)"

echo ""
echo "4. Checking build logs for errors..."
echo "-------------------------------------------------------------------"
if [ -f "dist/assets/*.js" ]; then
  echo "Build exists. Checking for error patterns in bundle..."
  grep -o "useLayoutEffect" dist/assets/*.js 2>/dev/null | head -5
else
  echo "No build found. Run 'npm run build' to check bundle."
fi

echo ""
echo "5. Recommended fixes..."
echo "-------------------------------------------------------------------"
echo "The error occurs because a library is trying to access React hooks incorrectly."
echo ""
echo "Option 1 (Quick Fix): Downgrade to React 18"
echo "  npm install react@18 react-dom@18 @types/react@18 @types/react-dom@18"
echo ""
echo "Option 2 (Better): Update all dependencies"
echo "  npm update"
echo "  npm audit fix"
echo ""
echo "Option 3 (If specific library is incompatible): Check library docs"
echo "  - styled-components: Needs v6.1+ for React 19"
echo "  - @radix-ui: Should support React 19"
echo "  - react-router-dom: v7 supports React 19"
echo ""
echo "==================================================================="
