#!/bin/bash

# Script to start Vite dev server bypassing Console Ninja
# Run this in macOS Terminal (NOT VS Code terminal)

echo "🚀 Starting Vite dev server (bypassing Console Ninja)..."
echo ""
echo "⚠️  IMPORTANT: Run this in macOS Terminal app, NOT VS Code terminal!"
echo ""

cd "$(dirname "$0")"

# Kill any existing Vite processes on port 5173
echo "Checking for existing processes on port 5173..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo ""
echo "Starting dev server..."
echo ""

# Run Vite with explicit output
npm run dev

# Note: If this still hangs, disable Console Ninja extension in VS Code:
# 1. Open VS Code
# 2. Go to Extensions
# 3. Search "Console Ninja"
# 4. Click "Disable" or "Uninstall"
# 5. Restart VS Code
# 6. Run this script again
