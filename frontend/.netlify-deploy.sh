#!/bin/bash

# PropIQ Netlify Deployment Script
# Automates Netlify site creation and Git-based continuous deployment

set -e

echo "================================================"
echo "PropIQ Frontend - Netlify Deployment Setup"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if already linked
if [ -f .netlify/state.json ]; then
    echo -e "${YELLOW}⚠️  Site already linked to Netlify${NC}"
    echo ""
    echo "Current site:"
    netlify status
    echo ""
    read -p "Do you want to deploy to this site? (y/n): " DEPLOY_CHOICE

    if [ "$DEPLOY_CHOICE" != "y" ]; then
        echo "Aborting deployment"
        exit 0
    fi
else
    echo -e "${BLUE}Setting up new Netlify site...${NC}"
    echo ""

    # Initialize Netlify site with Git-based continuous deployment
    # This will prompt for:
    # 1. Team selection
    # 2. Site name
    # 3. Build command (npm run build)
    # 4. Publish directory (dist)
    netlify init

    echo ""
    echo -e "${GREEN}✅ Netlify site created and linked!${NC}"
fi

# Build the site
echo ""
echo -e "${BLUE}Building frontend...${NC}"
npm run build

# Deploy to production
echo ""
echo -e "${BLUE}Deploying to production...${NC}"
netlify deploy --prod

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Show site URL
echo "Your site is now live at:"
netlify status | grep "Website URL"

echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Go to Netlify dashboard to configure environment variables"
echo "2. Set up custom domain (if needed)"
echo "3. Enable automatic deployments on git push"
echo ""
echo -e "${YELLOW}💡 From now on, just push to GitHub to deploy:${NC}"
echo "   git add ."
echo "   git commit -m 'Update frontend'"
echo "   git push origin main"
echo ""
