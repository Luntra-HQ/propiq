#!/bin/bash

# Export environment variables from .env file in a format for Render.com
# This script reads your .env file and formats it for easy copy-paste into Render

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     PropIQ Environment Variables for Render.com          ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Copy these environment variables to your Render dashboard:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please run this script from the backend directory."
    exit 1
fi

# Required environment variables for Render
REQUIRED_VARS=(
    "AZURE_OPENAI_ENDPOINT"
    "AZURE_OPENAI_KEY"
    "MONGODB_URI"
    "JWT_SECRET"
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "STRIPE_PRICE_ID"
    "STRIPE_PRICE_STARTER"
    "STRIPE_PRICE_PRO"
    "STRIPE_PRICE_ELITE"
    "SENDGRID_API_KEY"
    "SLACK_WEBHOOK_URL"
    "WANDB_API_KEY"
)

# Optional environment variables
OPTIONAL_VARS=(
    "INTERCOM_ACCESS_TOKEN"
    "INTERCOM_API_KEY"
)

echo "🔴 REQUIRED Variables:"
echo ""

# Extract and display required variables
for var in "${REQUIRED_VARS[@]}"; do
    value=$(grep "^${var}=" .env | cut -d'=' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    if [ -n "$value" ]; then
        echo "${var}=${value}"
    else
        echo "⚠️  ${var}=NOT_SET_IN_ENV_FILE"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🟡 OPTIONAL Variables:"
echo ""

# Extract and display optional variables
for var in "${OPTIONAL_VARS[@]}"; do
    value=$(grep "^${var}=" .env | cut -d'=' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    if [ -n "$value" ]; then
        echo "${var}=${value}"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Instructions:"
echo ""
echo "1. Go to your Render service → Environment tab"
echo "2. Click 'Add Environment Variable'"
echo "3. Copy each line above and paste as KEY=VALUE"
echo "4. Repeat for all required variables"
echo "5. Click 'Save Changes'"
echo ""
echo "💡 Tip: The following are already set in render.yaml:"
echo "   - AZURE_OPENAI_API_VERSION"
echo "   - AZURE_OPENAI_DEPLOYMENT"
echo "   - FROM_EMAIL"
echo "   - SUPPORT_EMAIL"
echo "   - ALLOWED_ORIGINS"
echo "   - APP_URL"
echo "   - ENVIRONMENT"
echo "   - DEBUG"
echo "   - WANDB_MODE"
echo ""
echo "✅ After adding all variables, your service will auto-deploy!"
echo ""
