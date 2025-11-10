#!/bin/bash

# Deploy PropIQ Backend to Render
# This script guides you through deploying to Render and monitors the deployment

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         PropIQ Backend - Render Deployment               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this from propiq/backend directory."
    exit 1
fi

echo "📋 Step 1: Verify Git Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git status --short
echo ""

echo "📤 Step 2: Push to GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Pushing to main branch..."
git push origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""

echo "🌐 Step 3: Deploy on Render Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now you need to create the Render service via the dashboard:"
echo ""
echo "1. Open: https://dashboard.render.com"
echo "2. Click: New + → Web Service"
echo "3. Connect repository: Luntra-HQ/luntra"
echo "4. Root directory: LUNTRA MVPS/propiq/backend"
echo "5. Render will auto-detect render.yaml"
echo ""
echo "📝 Environment Variables to Add:"
echo ""
echo "Run this command to see all required env vars:"
echo "   ./copy_env_to_render.sh"
echo ""
echo "Or manually add these in Render dashboard:"
echo "   - AZURE_OPENAI_ENDPOINT"
echo "   - AZURE_OPENAI_KEY"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - STRIPE_PRICE_ID"
echo "   - STRIPE_PRICE_STARTER"
echo "   - STRIPE_PRICE_PRO"
echo "   - STRIPE_PRICE_ELITE"
echo "   - SENDGRID_API_KEY"
echo "   - SLACK_WEBHOOK_URL"
echo "   - WANDB_API_KEY"
echo "   - INTERCOM_ACCESS_TOKEN (optional)"
echo "   - INTERCOM_API_KEY (optional)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏳ Waiting for you to create the service..."
echo ""
read -p "Press ENTER once you've created the service and noted the URL..."

echo ""
read -p "Enter your Render service URL (e.g., https://propiq-backend.onrender.com): " RENDER_URL

if [ -z "$RENDER_URL" ]; then
    echo "❌ Error: No URL provided"
    exit 1
fi

# Remove trailing slash if present
RENDER_URL=${RENDER_URL%/}

echo ""
echo "🔍 Step 4: Test Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Testing health endpoint..."
sleep 2

# Test health endpoint
HEALTH_RESPONSE=$(curl -s "${RENDER_URL}/health" || echo "")

if [ -n "$HEALTH_RESPONSE" ]; then
    echo "✅ Health check response:"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool
else
    echo "⚠️  Health check failed or still deploying..."
    echo "Check logs at: https://dashboard.render.com"
fi

echo ""
echo "Testing Stripe health..."
STRIPE_HEALTH=$(curl -s "${RENDER_URL}/stripe/health" || echo "")

if [ -n "$STRIPE_HEALTH" ]; then
    echo "✅ Stripe health check response:"
    echo "$STRIPE_HEALTH" | python3 -m json.tool
else
    echo "⚠️  Stripe health check failed or still deploying..."
fi

echo ""
echo "🔗 Step 5: Update Stripe Webhook URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load Stripe keys from .env if available
if [ -f ".env" ]; then
    source .env
fi

# Check if STRIPE_SECRET_KEY is set
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "⚠️  STRIPE_SECRET_KEY not found in environment."
    echo "Please export STRIPE_SECRET_KEY before running this step."
    echo ""
    echo "Example:"
    echo "  export STRIPE_SECRET_KEY=sk_live_xxx"
    echo "  ./deploy_render.sh"
    echo ""
else
    echo "Run this command to update your Stripe webhook:"
    echo ""
    echo "stripe webhook_endpoints update YOUR_WEBHOOK_ID \\"
    echo "  -d url=\"${RENDER_URL}/stripe/webhook\""
    echo ""

    read -p "Update webhook now? (y/n): " UPDATE_WEBHOOK

    if [ "$UPDATE_WEBHOOK" = "y" ] || [ "$UPDATE_WEBHOOK" = "Y" ]; then
        # Use STRIPE_SECRET_KEY from environment
        export STRIPE_API_KEY="$STRIPE_SECRET_KEY"

        read -p "Enter your Stripe webhook endpoint ID (we_xxx): " WEBHOOK_ID

        echo "Updating webhook..."
        stripe webhook_endpoints update "$WEBHOOK_ID" \
          -d url="${RENDER_URL}/stripe/webhook"

    echo "✅ Webhook updated!"
fi

echo ""
echo "🧪 Step 6: Run E2E Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Run E2E tests against production? (y/n): " RUN_TESTS

if [ "$RUN_TESTS" = "y" ] || [ "$RUN_TESTS" = "Y" ]; then
    # Update test script with production URL
    sed "s|http://localhost:8000|${RENDER_URL}|g" test_e2e_stripe.py > test_e2e_stripe_prod.py

    echo "Running E2E tests..."
    python3 test_e2e_stripe_prod.py

    rm test_e2e_stripe_prod.py
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              🎉 Deployment Complete! 🎉                   ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Your PropIQ Backend is now live at:"
echo "   ${RENDER_URL}"
echo ""
echo "📝 Next Steps:"
echo "   1. Monitor logs: https://dashboard.render.com"
echo "   2. Update frontend API URL to: ${RENDER_URL}"
echo "   3. Test payment flow end-to-end"
echo "   4. Set up custom domain (optional): api.propiq.luntra.one"
echo ""
echo "🔍 Useful Commands:"
echo "   - View logs: https://dashboard.render.com → Logs tab"
echo "   - Health check: curl ${RENDER_URL}/health"
echo "   - Stripe health: curl ${RENDER_URL}/stripe/health"
echo ""
echo "✅ All done! Your backend is deployed and ready to use."
echo ""
