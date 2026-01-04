#!/bin/bash

# 🔐 Secure Key Update Script
# This script updates rotated keys in environment files
# Keys are entered interactively and never logged

set -e

echo "🔐 PropIQ Key Rotation Update"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# File paths
ENV_LOCAL="../.env.local"
ENV_BACKEND="../backend/.env"

echo -e "${YELLOW}This script will update your rotated keys securely.${NC}"
echo ""

# 1. Convex Deploy Key
echo "📦 1. Convex Deploy Key"
echo "---"
read -p "Enter new CONVEX_DEPLOY_KEY (or press Enter to skip): " CONVEX_KEY
if [ ! -z "$CONVEX_KEY" ]; then
    # Backup .env.local
    cp "$ENV_LOCAL" "${ENV_LOCAL}.backup-$(date +%Y%m%d-%H%M%S)"

    # Update Convex key in .env.local
    if grep -q "CONVEX_DEPLOY_KEY=" "$ENV_LOCAL"; then
        # Use | as delimiter since key contains slashes
        sed -i.tmp "s|CONVEX_DEPLOY_KEY=.*|CONVEX_DEPLOY_KEY=${CONVEX_KEY}|g" "$ENV_LOCAL"
        rm "${ENV_LOCAL}.tmp"
        echo -e "${GREEN}✅ Convex key updated in .env.local${NC}"
    else
        echo "CONVEX_DEPLOY_KEY=${CONVEX_KEY}" >> "$ENV_LOCAL"
        echo -e "${GREEN}✅ Convex key added to .env.local${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped Convex key${NC}"
fi
echo ""

# 2. Slack Webhook
echo "📣 2. Slack Webhook URL"
echo "---"
read -p "Enter new SLACK_WEBHOOK_URL (or press Enter to skip): " SLACK_WEBHOOK
if [ ! -z "$SLACK_WEBHOOK" ]; then
    # Backup backend/.env
    cp "$ENV_BACKEND" "${ENV_BACKEND}.backup-$(date +%Y%m%d-%H%M%S)"

    # Update Slack webhook in backend/.env
    if grep -q "SLACK_WEBHOOK_URL=" "$ENV_BACKEND"; then
        # Use | as delimiter since webhook contains slashes
        sed -i.tmp "s|SLACK_WEBHOOK_URL=.*|SLACK_WEBHOOK_URL=${SLACK_WEBHOOK}|g" "$ENV_BACKEND"
        rm "${ENV_BACKEND}.tmp"
        echo -e "${GREEN}✅ Slack webhook updated in backend/.env${NC}"
    else
        echo "SLACK_WEBHOOK_URL=${SLACK_WEBHOOK}" >> "$ENV_BACKEND"
        echo -e "${GREEN}✅ Slack webhook added to backend/.env${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped Slack webhook${NC}"
fi
echo ""

# 3. Generate new JWT Secret
echo "🔑 3. JWT Secret"
echo "---"
read -p "Generate new JWT secret? (y/N): " GENERATE_JWT
if [[ "$GENERATE_JWT" =~ ^[Yy]$ ]]; then
    # Generate new 64-character hex string
    NEW_JWT_SECRET=$(openssl rand -hex 32)

    # Backup backend/.env if not already backed up
    if [ ! -f "${ENV_BACKEND}.backup-$(date +%Y%m%d-%H%M%S)" ]; then
        cp "$ENV_BACKEND" "${ENV_BACKEND}.backup-$(date +%Y%m%d-%H%M%S)"
    fi

    # Update JWT secret in backend/.env
    if grep -q "JWT_SECRET=" "$ENV_BACKEND"; then
        sed -i.tmp "s|JWT_SECRET=.*|JWT_SECRET=${NEW_JWT_SECRET}|g" "$ENV_BACKEND"
        rm "${ENV_BACKEND}.tmp"
        echo -e "${GREEN}✅ JWT secret generated and updated in backend/.env${NC}"
        echo -e "${RED}⚠️  WARNING: This will log out all users when deployed!${NC}"
        echo ""
        echo "New JWT Secret (save this for Azure App Settings):"
        echo "${NEW_JWT_SECRET}"
    else
        echo "JWT_SECRET=${NEW_JWT_SECRET}" >> "$ENV_BACKEND"
        echo -e "${GREEN}✅ JWT secret added to backend/.env${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped JWT secret generation${NC}"
fi
echo ""

# 4. Intercom Keys
echo "💬 4. Intercom Keys"
echo "---"
read -p "Enter new INTERCOM_ACCESS_TOKEN (or press Enter to skip): " INTERCOM_TOKEN
if [ ! -z "$INTERCOM_TOKEN" ]; then
    # Backup backend/.env if not already backed up
    if [ ! -f "${ENV_BACKEND}.backup-$(date +%Y%m%d-%H%M%S)" ]; then
        cp "$ENV_BACKEND" "${ENV_BACKEND}.backup-$(date +%Y%m%d-%H%M%S)"
    fi

    # Update Intercom token
    if grep -q "INTERCOM_ACCESS_TOKEN=" "$ENV_BACKEND"; then
        sed -i.tmp "s|INTERCOM_ACCESS_TOKEN=.*|INTERCOM_ACCESS_TOKEN=${INTERCOM_TOKEN}|g" "$ENV_BACKEND"
        rm "${ENV_BACKEND}.tmp"
        echo -e "${GREEN}✅ Intercom access token updated${NC}"
    else
        echo "INTERCOM_ACCESS_TOKEN=${INTERCOM_TOKEN}" >> "$ENV_BACKEND"
        echo -e "${GREEN}✅ Intercom access token added${NC}"
    fi
fi

read -p "Enter new INTERCOM_API_KEY (or press Enter to skip): " INTERCOM_API_KEY
if [ ! -z "$INTERCOM_API_KEY" ]; then
    if grep -q "INTERCOM_API_KEY=" "$ENV_BACKEND"; then
        sed -i.tmp "s|INTERCOM_API_KEY=.*|INTERCOM_API_KEY=${INTERCOM_API_KEY}|g" "$ENV_BACKEND"
        rm "${ENV_BACKEND}.tmp"
        echo -e "${GREEN}✅ Intercom API key updated${NC}"
    else
        echo "INTERCOM_API_KEY=${INTERCOM_API_KEY}" >> "$ENV_BACKEND"
        echo -e "${GREEN}✅ Intercom API key added${NC}"
    fi
else
    if [ -z "$INTERCOM_TOKEN" ]; then
        echo -e "${YELLOW}⏭️  Skipped Intercom keys${NC}"
    fi
fi
echo ""

# Summary
echo "=============================="
echo -e "${GREEN}✅ Key rotation update complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Test locally with new keys"
echo "2. Update Azure App Settings (see Azure portal below)"
echo "3. Redeploy backend if needed"
echo ""
echo "💾 Backups created:"
ls -1 *.backup-* 2>/dev/null || echo "No backups needed"
echo ""
echo "🔒 Remember to:"
echo "   - Update Azure App Settings with new JWT_SECRET"
echo "   - Test Convex deployment: npx convex deploy"
echo "   - Test Slack notifications"
