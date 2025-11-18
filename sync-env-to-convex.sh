#!/bin/bash

# ============================================================================
# Sync Environment Variables to Convex
# ============================================================================
# This script syncs the .env file to Convex deployment
# Run: bash sync-env-to-convex.sh
# ============================================================================

echo "🚀 Syncing environment variables to Convex..."
echo ""

# Change to project directory
cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Source the .env file
set -a
source .env
set +a

# Sync each variable to Convex
echo "📤 Setting Azure OpenAI variables..."
npx convex env set AZURE_OPENAI_ENDPOINT "$AZURE_OPENAI_ENDPOINT"
npx convex env set AZURE_OPENAI_KEY "$AZURE_OPENAI_KEY"
npx convex env set AZURE_OPENAI_API_VERSION "$AZURE_OPENAI_API_VERSION"
npx convex env set AZURE_OPENAI_DEPLOYMENT "$AZURE_OPENAI_DEPLOYMENT"

echo ""
echo "💳 Setting Stripe variables..."
npx convex env set STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
npx convex env set STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET"
npx convex env set STRIPE_STARTER_PRICE_ID "$STRIPE_STARTER_PRICE_ID"
npx convex env set STRIPE_PRO_PRICE_ID "$STRIPE_PRO_PRICE_ID"
npx convex env set STRIPE_ELITE_PRICE_ID "$STRIPE_ELITE_PRICE_ID"

echo ""
echo "✅ All environment variables synced to Convex!"
echo ""
echo "🔍 To view variables in dashboard:"
echo "   https://dashboard.convex.dev → Settings → Environment Variables"
echo ""
echo "🧪 Next steps:"
echo "   1. npx convex dev          # Start Convex backend"
echo "   2. cd frontend && npm run dev    # Start frontend"
echo "   3. Test signup/login at http://localhost:5173"
