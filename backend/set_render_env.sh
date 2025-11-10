#!/bin/bash

# Set Render environment variables using CLI (non-interactive mode)
# This bypasses the UI issues with special characters

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     Setting Render Environment Variables via CLI         ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if service ID is provided
if [ -z "$1" ]; then
    echo "❌ Error: Service ID required"
    echo ""
    echo "Usage: ./set_render_env.sh <service-id>"
    echo ""
    echo "To get your service ID:"
    echo "  1. Go to: https://dashboard.render.com"
    echo "  2. Click your service"
    echo "  3. Look at URL: https://dashboard.render.com/web/<SERVICE_ID>"
    echo ""
    exit 1
fi

SERVICE_ID="$1"

echo "🔍 Service ID: ${SERVICE_ID}"
echo ""

# MongoDB URI (load from .env or environment variable)
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  MONGODB_URI not set"
    echo ""
    echo "Please set MONGODB_URI before running this script:"
    echo "  export MONGODB_URI='your-mongodb-connection-string'"
    echo ""
    echo "Or source from .env file:"
    echo "  source ../.env && ./set_render_env.sh <service-id>"
    echo ""
    exit 1
fi

echo "📤 Setting environment variables..."
echo ""

# Using Render API directly (more reliable than CLI)
echo "Using Render API to set MONGODB_URI..."

# Get Render API key
if [ -z "$RENDER_API_KEY" ]; then
    echo "⚠️  RENDER_API_KEY not set"
    echo ""
    echo "To get your API key:"
    echo "  1. Go to: https://dashboard.render.com/u/settings#api-keys"
    echo "  2. Create a new API key"
    echo "  3. Export it: export RENDER_API_KEY=rnd_xxx"
    echo ""
    read -p "Enter your Render API key: " RENDER_API_KEY
    export RENDER_API_KEY
fi

# Set MONGODB_URI using API
curl -X PUT "https://api.render.com/v1/services/${SERVICE_ID}/env-vars/MONGODB_URI" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"value\": \"${MONGODB_URI}\"}"

echo ""
echo "✅ MONGODB_URI set successfully!"
echo ""
echo "🔄 Render will automatically redeploy your service."
echo "   Check logs at: https://dashboard.render.com"
echo ""
