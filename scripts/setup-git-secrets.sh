#!/bin/bash
# PropIQ - Automated Git-Secrets Setup Script
# This script installs and configures git-secrets to prevent API key leaks

set -e

echo "🔐 PropIQ Git-Secrets Setup"
echo "==========================="
echo ""

# Check if git-secrets is installed
if ! command -v git-secrets &> /dev/null; then
    echo "📦 Installing git-secrets..."

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install git-secrets
        else
            echo "❌ Homebrew not found. Installing git-secrets manually..."
            git clone https://github.com/awslabs/git-secrets.git /tmp/git-secrets
            cd /tmp/git-secrets
            sudo make install
            cd -
            rm -rf /tmp/git-secrets
        fi
    else
        # Linux
        git clone https://github.com/awslabs/git-secrets.git /tmp/git-secrets
        cd /tmp/git-secrets
        sudo make install
        cd -
        rm -rf /tmp/git-secrets
    fi

    echo "✅ git-secrets installed successfully!"
else
    echo "✅ git-secrets already installed"
fi

echo ""
echo "🔧 Configuring git-secrets for PropIQ..."

# Navigate to propiq directory
cd "$(dirname "$0")/.."

# Install git hooks
git secrets --install

# Register AWS provider (includes basic patterns)
git secrets --register-aws

# Add custom patterns for PropIQ services
echo "Adding custom secret patterns..."

# Stripe keys
git secrets --add 'sk_live_[a-zA-Z0-9]{99,}'
git secrets --add 'sk_test_[a-zA-Z0-9]{99,}'
git secrets --add 'pk_live_[a-zA-Z0-9]{99,}'
git secrets --add 'pk_test_[a-zA-Z0-9]{99,}'
git secrets --add 'whsec_[a-zA-Z0-9]{32,}'

# SendGrid
git secrets --add 'SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}'

# MongoDB
git secrets --add 'mongodb\+srv://[^"'\''[:space:]]*'

# Supabase
git secrets --add 'sb_secret_[a-zA-Z0-9_-]{20,}'
git secrets --add 'sb_publishable_[a-zA-Z0-9_-]{20,}'

# JWT tokens and secrets
git secrets --add 'eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}'
git secrets --add '[0-9a-f]{64}'

# Azure keys
git secrets --add 'AZURE_OPENAI_KEY=[a-zA-Z0-9]{32,}'

# Convex
git secrets --add 'CONVEX_DEPLOY_KEY=[^[:space:]]*'

# Generic API key patterns
git secrets --add 'api_key["\s:=]+[a-zA-Z0-9_-]{20,}'
git secrets --add 'API_KEY["\s:=]+[a-zA-Z0-9_-]{20,}'
git secrets --add 'secret_key["\s:=]+[a-zA-Z0-9_-]{20,}'
git secrets --add 'SECRET_KEY["\s:=]+[a-zA-Z0-9_-]{20,}'

echo ""
echo "✅ Git-secrets configured successfully!"
echo ""
echo "🧪 Testing configuration..."

# Create a test file with a fake secret
echo "STRIPE_SECRET_KEY=sk_live_test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" > /tmp/test-secret.txt

# Try to add it
if git secrets --scan /tmp/test-secret.txt 2>&1 | grep -q "BLOCKED"; then
    echo "✅ Secret detection working! Test secret was blocked."
elif git secrets --scan /tmp/test-secret.txt 2>&1 | grep -q "Found"; then
    echo "✅ Secret detection working! Test secret was detected."
else
    echo "⚠️  Running scan on test file..."
    git secrets --scan /tmp/test-secret.txt || echo "✅ Secret detection working!"
fi

# Clean up
rm -f /tmp/test-secret.txt

echo ""
echo "📊 Scanning repository for existing secrets..."
echo "(This may take a few moments...)"
echo ""

# Scan current staged files
if git secrets --scan 2>&1 | grep -q "OK"; then
    echo "✅ No secrets found in staged files"
elif git secrets --scan 2>&1; then
    echo "⚠️  Warning: Potential secrets detected. Please review the output above."
    echo "    Remember: .env files are already gitignored, so this is likely a false positive."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Git-secrets is now active and will:"
echo "  ✓ Scan all commits before they are created"
echo "  ✓ Block commits containing secrets"
echo "  ✓ Prevent accidental API key leaks"
echo ""
echo "To manually scan a file:"
echo "  git secrets --scan <filename>"
echo ""
echo "To scan entire repo history:"
echo "  git secrets --scan-history"
echo ""
echo "To scan all files:"
echo "  git secrets --scan -r ."
echo ""
