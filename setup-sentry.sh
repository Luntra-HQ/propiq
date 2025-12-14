#!/bin/bash

# PropIQ Sentry Setup Script
# This script installs and configures Sentry for both frontend and backend

set -e  # Exit on error

echo "🚀 PropIQ Sentry Setup Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if Sentry account is created
echo -e "${YELLOW}Step 1: Sentry Account Setup${NC}"
echo "Have you created a Sentry account at https://sentry.io? (y/n)"
read -r HAS_ACCOUNT

if [ "$HAS_ACCOUNT" != "y" ]; then
    echo -e "${RED}Please create a Sentry account first:${NC}"
    echo "1. Go to https://sentry.io/signup/"
    echo "2. Create two projects: propiq-frontend (React) and propiq-backend (Python)"
    echo "3. Save your DSN keys from both projects"
    echo "4. Run this script again"
    exit 1
fi

echo -e "${GREEN}✓ Sentry account confirmed${NC}"
echo ""

# Step 2: Install frontend dependencies
echo -e "${YELLOW}Step 2: Installing Frontend Dependencies${NC}"
cd frontend
echo "Installing @sentry/react and @sentry/vite-plugin..."
npm install @sentry/react @sentry/vite-plugin
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Step 3: Install backend dependencies
echo -e "${YELLOW}Step 3: Installing Backend Dependencies${NC}"
cd ../backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

echo "Installing sentry-sdk[fastapi]..."
pip install 'sentry-sdk[fastapi]==1.45.0'

# Update requirements.txt if it exists
if [ -f "requirements.txt" ]; then
    if ! grep -q "sentry-sdk" requirements.txt; then
        echo "Adding sentry-sdk to requirements.txt..."
        echo "sentry-sdk[fastapi]==1.45.0" >> requirements.txt
        echo -e "${GREEN}✓ Updated requirements.txt${NC}"
    fi
fi

echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Step 4: Environment variable setup
echo -e "${YELLOW}Step 4: Environment Variable Configuration${NC}"
cd ..

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local from .env.example..."
    cp frontend/.env.example frontend/.env.local
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit frontend/.env.local and add your Sentry DSN${NC}"
else
    echo "frontend/.env.local already exists"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit backend/.env and add your Sentry DSN${NC}"
else
    echo "backend/.env already exists"
fi

echo ""
echo -e "${GREEN}✓ Environment files created${NC}"
echo ""

# Step 5: Summary
echo "================================"
echo -e "${GREEN}🎉 Sentry Installation Complete!${NC}"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add your Sentry DSN keys to environment files:"
echo "   - frontend/.env.local → VITE_SENTRY_DSN"
echo "   - backend/.env → SENTRY_DSN"
echo ""
echo "2. (Optional) Generate Sentry auth token for source maps:"
echo "   - Visit: https://sentry.io/settings/account/api/auth-tokens/"
echo "   - Create token with 'project:releases' and 'project:write' scopes"
echo "   - Add to frontend/.env.local → SENTRY_AUTH_TOKEN"
echo ""
echo "3. Update your code to integrate Sentry:"
echo "   - See SENTRY_SETUP_GUIDE.md for detailed instructions"
echo ""
echo "4. Test Sentry integration:"
echo "   - Frontend: Use testSentryFrontend() function"
echo "   - Backend: Visit /test-sentry endpoint"
echo ""
echo "📖 Full documentation: SENTRY_SETUP_GUIDE.md"
echo ""
echo -e "${YELLOW}Remember: Never commit .env files to git!${NC}"
echo ""
