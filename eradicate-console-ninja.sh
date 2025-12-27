#!/bin/bash
#
# Console Ninja Complete Eradication Script
# Based on Perplexity research findings
#
# This script removes:
# 1. ~/.console-ninja directory (global state + binaries)
# 2. Cursor extension directories
# 3. Cursor caches
# 4. PATH modifications (if any)
# 5. Build hooks from Vite binaries
#

set -e  # Exit on error

echo "════════════════════════════════════════════════════════"
echo "   🔥 CONSOLE NINJA COMPLETE ERADICATION"
echo "════════════════════════════════════════════════════════"
echo ""

# Function to safely remove directory
safe_remove() {
    local dir="$1"
    if [ -d "$dir" ]; then
        echo "🗑️  Removing: $dir"
        rm -rf "$dir"
        echo "   ✓ Deleted"
    else
        echo "   ✓ Already gone: $dir"
    fi
}

# Function to safely remove file
safe_remove_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "🗑️  Removing: $file"
        rm -f "$file"
        echo "   ✓ Deleted"
    else
        echo "   ✓ Already gone: $file"
    fi
}

echo "STEP 1: Remove ~/.console-ninja directory (MAIN CULPRIT)"
echo "────────────────────────────────────────────────────────"
safe_remove ~/.console-ninja
echo ""

echo "STEP 2: Remove Cursor extension"
echo "────────────────────────────────────────────────────────"
safe_remove ~/.cursor/extensions/wallabyjs.console-ninja-*
echo ""

echo "STEP 3: Clear Cursor caches"
echo "────────────────────────────────────────────────────────"
safe_remove ~/Library/Caches/Cursor
safe_remove ~/.cursor/CachedExtensions
safe_remove ~/.cursor/Cache
safe_remove ~/.cursor/CachedData
echo ""

echo "STEP 4: Check for build hooks in project Vite binaries"
echo "────────────────────────────────────────────────────────"
PROJECT_VITE="/Users/briandusape/Projects/propiq/frontend/node_modules/.bin/vite"
if [ -f "$PROJECT_VITE" ]; then
    if grep -q "build-hook" "$PROJECT_VITE" 2>/dev/null; then
        echo "⚠️  Found build hooks in project Vite binary"
        echo "   Backing up original..."
        cp "$PROJECT_VITE" "$PROJECT_VITE.backup"

        echo "   Removing build hooks..."
        sed -i '' '/\/\* build-hook-start \*\//,/\/\* build-hook-end \*\//d' "$PROJECT_VITE"
        echo "   ✓ Build hooks removed"
    else
        echo "   ✓ No build hooks found in project Vite"
    fi
else
    echo "   ✓ No project Vite binary to check"
fi
echo ""

echo "STEP 5: Check for global Vite installation"
echo "────────────────────────────────────────────────────────"
GLOBAL_VITE=$(which vite 2>/dev/null || echo "")
if [ -n "$GLOBAL_VITE" ] && [ -f "$GLOBAL_VITE" ]; then
    echo "   Found global Vite: $GLOBAL_VITE"
    if grep -q "build-hook" "$GLOBAL_VITE" 2>/dev/null; then
        echo "⚠️  Found build hooks in global Vite"
        echo "   You may want to reinstall Vite globally:"
        echo "   npm uninstall -g vite && npm install -g vite"
    else
        echo "   ✓ No build hooks in global Vite"
    fi
else
    echo "   ✓ No global Vite installation"
fi
echo ""

echo "STEP 6: Remove Console Ninja from PATH (if present)"
echo "────────────────────────────────────────────────────────"
# Check common shell config files
for rcfile in ~/.zshrc ~/.bashrc ~/.bash_profile ~/.profile; do
    if [ -f "$rcfile" ]; then
        if grep -q "console-ninja" "$rcfile" 2>/dev/null; then
            echo "⚠️  Found console-ninja in $rcfile"
            echo "   Backing up..."
            cp "$rcfile" "$rcfile.backup"

            echo "   Removing PATH modifications..."
            sed -i '' '/console-ninja/d' "$rcfile"
            echo "   ✓ Removed from $rcfile"
        fi
    fi
done
echo "   ✓ PATH check complete"
echo ""

echo "STEP 7: Kill any running Console Ninja processes"
echo "────────────────────────────────────────────────────────"
pkill -f console-ninja 2>/dev/null && echo "   ✓ Killed running processes" || echo "   ✓ No processes running"
echo ""

echo "STEP 8: Verification"
echo "────────────────────────────────────────────────────────"
echo "Checking for remaining Console Ninja artifacts..."
echo ""

# Check ~/.console-ninja
if [ -d ~/.console-ninja ]; then
    echo "❌ ~/.console-ninja still exists"
    CLEAN=false
else
    echo "✅ ~/.console-ninja removed"
fi

# Check Cursor extensions
NINJA_EXT=$(find ~/.cursor/extensions -name "*console-ninja*" 2>/dev/null)
if [ -n "$NINJA_EXT" ]; then
    echo "❌ Cursor extension still present: $NINJA_EXT"
    CLEAN=false
else
    echo "✅ Cursor extensions clean"
fi

# Check PATH
if which console-ninja >/dev/null 2>&1; then
    echo "❌ console-ninja still in PATH"
    CLEAN=false
else
    echo "✅ console-ninja not in PATH"
fi

# Check for any remaining files
REMAINING=$(find ~/ -name "*console-ninja*" 2>/dev/null | grep -v "Library/Caches" | head -5)
if [ -n "$REMAINING" ]; then
    echo "⚠️  Remaining files found:"
    echo "$REMAINING"
else
    echo "✅ No remaining Console Ninja files"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "   ✅ ERADICATION COMPLETE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Restart Cursor completely (Cmd+Q, then reopen)"
echo "2. Reload shell: source ~/.zshrc (or restart terminal)"
echo "3. Test Vite: cd frontend && npm run dev"
echo ""
echo "If Console Ninja still appears:"
echo "- Check npm cache: npm cache clean --force"
echo "- Reinstall node_modules: rm -rf node_modules && npm install"
echo ""
