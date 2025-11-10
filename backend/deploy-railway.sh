#!/bin/bash

# PropIQ Backend - Railway Deployment Script
# Run this script to deploy to Railway

set -e  # Exit on error

echo "🚂 PropIQ Railway Deployment"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Railway CLI
echo -e "${BLUE}Step 1: Checking Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install with: npm install -g @railway/cli"
    echo "Or: brew install railway"
    exit 1
fi
echo -e "${GREEN}✓ Railway CLI installed${NC}"
echo ""

# Step 2: Authenticate
echo -e "${BLUE}Step 2: Authenticating with Railway...${NC}"
echo "This will open your browser for authentication."
read -p "Press Enter to continue..."
railway login
echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# Step 3: Initialize or link project
echo -e "${BLUE}Step 3: Setting up Railway project...${NC}"
if railway status &> /dev/null; then
    echo -e "${GREEN}✓ Project already linked${NC}"
else
    echo "Creating new Railway project..."
    railway init
fi
echo ""

# Step 4: Set environment variables
echo -e "${BLUE}Step 4: Setting environment variables...${NC}"
echo -e "${YELLOW}You'll need to set these environment variables:${NC}"
echo ""
echo "Required:"
echo "  - AZURE_OPENAI_ENDPOINT"
echo "  - AZURE_OPENAI_KEY"
echo "  - AZURE_OPENAI_API_VERSION"
echo "  - MONGODB_URI"
echo "  - JWT_SECRET"
echo ""
echo "Optional (for full features):"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_PRICE_ID"
echo "  - STRIPE_WEBHOOK_SECRET"
echo "  - WANDB_API_KEY"
echo "  - WANDB_MODE"
echo "  - SENDGRID_API_KEY"
echo ""

read -p "Do you want to set environment variables now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠ Loading environment variables from .env file...${NC}"

    # Load from .env file
    if [ -f ".env" ]; then
        source .env

        # Azure OpenAI
        railway variables set AZURE_OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT"
        railway variables set AZURE_OPENAI_KEY="$AZURE_OPENAI_KEY"
        railway variables set AZURE_OPENAI_API_VERSION="$AZURE_OPENAI_API_VERSION"

        # MongoDB
        railway variables set MONGODB_URI="$MONGODB_URI"

        # JWT Secret (use existing or generate new)
        if [ -z "$JWT_SECRET" ]; then
            JWT_SECRET=$(openssl rand -hex 32)
        fi
        railway variables set JWT_SECRET="$JWT_SECRET"

        # Weights & Biases
        railway variables set WANDB_MODE="${WANDB_MODE:-online}"

        echo -e "${GREEN}✓ Core environment variables set from .env${NC}"
        echo -e "${YELLOW}⚠ Remember to add Stripe and SendGrid keys if needed${NC}"
    else
        echo -e "${RED}❌ .env file not found!${NC}"
        echo "Please create .env file with your credentials first."
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Skipping environment variables. Set them manually with:${NC}"
    echo "  railway variables set KEY=VALUE"
fi
echo ""

# Step 5: Deploy
echo -e "${BLUE}Step 5: Deploying to Railway...${NC}"
read -p "Ready to deploy? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    railway up
    echo -e "${GREEN}✓ Deployment initiated${NC}"
else
    echo -e "${YELLOW}Deployment skipped. Run 'railway up' when ready.${NC}"
    exit 0
fi
echo ""

# Step 6: Get domain
echo -e "${BLUE}Step 6: Getting deployment URL...${NC}"
sleep 3  # Wait for deployment to process
DOMAIN=$(railway domain 2>&1)

if [[ $DOMAIN == *"No domain"* ]]; then
    echo -e "${YELLOW}No domain configured yet. Creating one...${NC}"
    railway domain
    DOMAIN=$(railway domain 2>&1)
fi

echo -e "${GREEN}✓ Your app is deployed at:${NC}"
echo "$DOMAIN"
echo ""

# Step 7: Test deployment
echo -e "${BLUE}Step 7: Testing deployment...${NC}"
if [[ $DOMAIN != *"railway.app"* ]]; then
    echo -e "${YELLOW}⚠ Waiting for domain to be ready...${NC}"
    sleep 10
    DOMAIN=$(railway domain 2>&1)
fi

# Extract URL from domain output
URL=$(echo "$DOMAIN" | grep -o 'https://[^[:space:]]*' || echo "")

if [ -z "$URL" ]; then
    echo -e "${YELLOW}⚠ Could not extract URL. Check with: railway domain${NC}"
else
    echo "Testing health endpoint: $URL/health"
    sleep 5  # Wait for app to start

    if curl -f -s "$URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy!${NC}"
    else
        echo -e "${YELLOW}⚠ Backend may still be starting. Check logs with: railway logs${NC}"
    fi
fi
echo ""

# Final instructions
echo -e "${GREEN}=========================${NC}"
echo -e "${GREEN}Deployment Complete! 🎉${NC}"
echo -e "${GREEN}=========================${NC}"
echo ""
echo "Next steps:"
echo "1. Update extension API endpoint:"
echo "   File: propiq-extension-starter/src/shared/api-client.ts"
echo "   Change baseUrl to: $URL"
echo ""
echo "2. Rebuild extension:"
echo "   cd propiq-extension-starter"
echo "   npm run build"
echo ""
echo "3. Test the extension with Railway backend"
echo ""
echo "Useful commands:"
echo "  railway logs          # View application logs"
echo "  railway status        # Check deployment status"
echo "  railway open          # Open Railway dashboard"
echo "  railway domain        # Show deployment URL"
echo "  railway variables     # List environment variables"
echo ""
echo -e "${BLUE}📚 Full documentation: See RAILWAY_DEPLOY.md${NC}"
