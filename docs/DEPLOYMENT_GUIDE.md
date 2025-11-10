# PropIQ Deployment Guide

**Version:** 3.1.1
**Last Updated:** 2025-11-07
**Environment:** Production/Staging

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Backend Deployment (Azure)](#backend-deployment-azure)
5. [Frontend Deployment](#frontend-deployment)
6. [Database Setup](#database-setup)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring & Logging](#monitoring--logging)
10. [Troubleshooting](#troubleshooting)

---

## Overview

PropIQ uses a microservices architecture deployed across multiple platforms:

- **Backend:** Azure Web App (Linux container)
- **Frontend:** Netlify / Azure Static Web Apps (planned)
- **Database:** Supabase PostgreSQL (cloud-hosted)
- **File Storage:** Azure Blob Storage (future)
- **CDN:** Azure CDN (future)

### Architecture Diagram

```
┌─────────────┐
│   Users     │
└──────┬──────┘
       │
       ├──────────┐
       │          │
       ▼          ▼
┌──────────┐  ┌──────────┐
│ Frontend │  │ Backend  │
│ (Netlify)│  │ (Azure)  │
└─────┬────┘  └────┬─────┘
      │            │
      │      ┌─────┴──────┬─────────┬───────────┐
      │      │            │         │           │
      │      ▼            ▼         ▼           ▼
      │  ┌────────┐  ┌────────┐  ┌─────┐  ┌────────┐
      │  │Supabase│  │ Azure  │  │Strip│  │SendGrid│
      │  │ (DB)   │  │OpenAI  │  │  e  │  │(Email) │
      │  └────────┘  └────────┘  └─────┘  └────────┘
      │
      └──────────────┐
                     │
                     ▼
              ┌────────────┐
              │ Microsoft  │
              │ Clarity    │
              └────────────┘
```

---

## Prerequisites

### Required Accounts

1. **Azure Account** - Backend hosting
   - Azure subscription
   - Resource group created
   - Container registry access

2. **Supabase Account** - Database
   - Project created
   - Connection string available

3. **Azure OpenAI** - AI Analysis
   - Resource provisioned
   - GPT-4o-mini deployment

4. **Stripe Account** - Payments
   - Live API keys
   - Webhook configured

5. **SendGrid Account** - Email
   - API key generated
   - Sender verified

6. **Weights & Biases** - ML Tracking
   - API key generated

### Required Tools

```bash
# Install Azure CLI
brew install azure-cli  # macOS
# OR
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash  # Linux

# Install Docker
brew install docker  # macOS

# Install Node.js
brew install node@20  # macOS

# Install Python 3.11
brew install python@3.11  # macOS
```

### Verify Installations

```bash
az --version          # Should show 2.50+
docker --version      # Should show 24.0+
node --version        # Should show v20+
python3.11 --version  # Should show 3.11+
```

---

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in `propiq/backend/` with the following:

```bash
# Environment
ENVIRONMENT=production  # Options: development, staging, production

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-64-chars-generated-with-openssl
JWT_EXPIRATION_DAYS=7

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
MONGODB_URI=  # Leave empty (deprecated, kept for backwards compatibility)

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-azure-openai-api-key
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini  # Your deployment name

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID_STARTER=price_starter_id
STRIPE_PRICE_ID_PRO=price_pro_id
STRIPE_PRICE_ID_ELITE=price_elite_id

# SendGrid Email
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@propiq.luntra.one

# Weights & Biases (ML Tracking)
WANDB_API_KEY=your-wandb-api-key
WANDB_PROJECT=propiq-analysis
WANDB_MODE=online  # Options: online, offline, disabled

# CORS (Frontend URLs)
ALLOWED_ORIGINS=https://propiq.luntra.one,https://www.propiq.luntra.one

# Logging
LOG_LEVEL=INFO  # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL
ENABLE_FILE_LOGGING=false

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Security
ENABLE_HSTS=true  # Only in production
HSTS_MAX_AGE=31536000  # 1 year
```

### Frontend Environment Variables

Create `.env` file in `propiq/frontend/`:

```bash
# API Configuration
VITE_API_URL=https://luntra-outreach-app.azurewebsites.net/api/v1

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# Microsoft Clarity
VITE_CLARITY_PROJECT_ID=tts5hc8zf8

# Environment
VITE_ENVIRONMENT=production
```

### Generating Secrets

```bash
# Generate JWT secret (64 characters)
openssl rand -hex 32

# Generate webhook secret
openssl rand -base64 32
```

---

## Backend Deployment (Azure)

### Step 1: Login to Azure

```bash
# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "Your Subscription Name"

# Verify login
az account show
```

### Step 2: Configure Environment Variables in Azure

```bash
# Navigate to backend directory
cd propiq/backend

# Set environment variables in Azure App Service
az webapp config appsettings set \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  --settings \
    ENVIRONMENT=production \
    JWT_SECRET="your-secret-key" \
    SUPABASE_URL="https://your-project.supabase.co" \
    SUPABASE_KEY="your-key" \
    AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/" \
    AZURE_OPENAI_KEY="your-key" \
    AZURE_OPENAI_API_VERSION="2025-01-01-preview" \
    AZURE_OPENAI_DEPLOYMENT="gpt-4o-mini" \
    STRIPE_SECRET_KEY="sk_live_..." \
    STRIPE_WEBHOOK_SECRET="whsec_..." \
    SENDGRID_API_KEY="SG...." \
    WANDB_API_KEY="your-key" \
    WANDB_MODE="online" \
    LOG_LEVEL="INFO"
```

**⚠️ SECURITY WARNING:**
- NEVER commit `.env` files to git
- NEVER log environment variables in production
- Rotate secrets regularly (every 90 days)

### Step 3: Deploy Backend

#### Automated Deployment (Recommended)

```bash
# Make deploy script executable
chmod +x deploy-azure.sh

# Run deployment
./deploy-azure.sh
```

The script will:
1. Login to Azure Container Registry
2. Build Docker image
3. Push to registry
4. Deploy to Azure Web App
5. Wait for container to start (2-3 minutes)

#### Manual Deployment

```bash
# 1. Login to ACR
az acr login --name luntraregistry

# 2. Build Docker image
docker build -t luntraregistry.azurecr.io/propiq-backend:latest .

# 3. Push to registry
docker push luntraregistry.azurecr.io/propiq-backend:latest

# 4. Restart Azure Web App
az webapp restart \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app

# 5. Wait for container to start (2-3 minutes)
sleep 180
```

### Step 4: Verify Backend Deployment

```bash
# Check deployment status
az webapp show \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  --query state

# Check health endpoint
curl https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "propiq-analysis",
#   "version": "3.1.1",
#   "timestamp": "2025-11-07T12:00:00Z"
# }
```

### Step 5: View Logs

```bash
# Stream logs
az webapp log tail \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app

# Download logs
az webapp log download \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app
```

---

## Frontend Deployment

### Option 1: Netlify (Recommended)

#### Prerequisites

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login
```

#### Deploy

```bash
# Navigate to frontend
cd propiq/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Test build locally (optional)
npm run preview

# Deploy to Netlify
netlify deploy --prod

# Follow prompts:
# - Site name: propiq
# - Publish directory: dist
```

#### Configure Environment Variables in Netlify

1. Go to https://app.netlify.com
2. Select your site
3. Go to Site settings → Environment variables
4. Add all variables from `.env`:
   - `VITE_API_URL`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_CLARITY_PROJECT_ID`
5. Redeploy

#### Custom Domain

1. Go to Domain settings
2. Add custom domain: `propiq.luntra.one`
3. Update DNS (nameservers or CNAME)
4. Wait for SSL certificate (automatic)

### Option 2: Azure Static Web Apps

```bash
# Create static web app
az staticwebapp create \
  --name propiq-frontend \
  --resource-group luntra-outreach-rg \
  --source https://github.com/your-org/propiq \
  --location "East US 2" \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"

# Configure custom domain
az staticwebapp hostname set \
  --name propiq-frontend \
  --resource-group luntra-outreach-rg \
  --hostname propiq.luntra.one
```

---

## Database Setup

### Supabase PostgreSQL

#### 1. Create Project

1. Go to https://app.supabase.com
2. Create new project
3. Choose region (closest to Azure backend)
4. Save database password

#### 2. Create Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(200),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    analyses_used INT DEFAULT 0,
    analyses_limit INT DEFAULT 3,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Property analyses table
CREATE TABLE property_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(500) NOT NULL,
    analysis_data JSONB NOT NULL,
    score INT,
    created_at TIMESTAMP DEFAULT NOW(),
    wandb_run_id VARCHAR(255)
);

-- Support chats table
CREATE TABLE support_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    message_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_analyses_user_id ON property_analyses(user_id);
CREATE INDEX idx_analyses_created_at ON property_analyses(created_at);
CREATE INDEX idx_chats_conversation_id ON support_chats(conversation_id);
```

#### 3. Configure Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;

-- Policies (examples - adjust based on your auth strategy)
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 4. Get Connection Details

```bash
# From Supabase Dashboard → Settings → Database

# Connection string (for backend)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
```

---

## Post-Deployment Verification

### Automated Test Suite

```bash
# Run integration tests (requires database)
cd propiq/backend
pytest tests/integration/ -v

# Run security tests
pytest tests/security/ -v -m security

# Run all tests
pytest -v
```

### Manual Testing Checklist

#### Backend Tests

- [ ] Health endpoints
  ```bash
  curl https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health
  curl https://luntra-outreach-app.azurewebsites.net/api/v1/auth/health
  curl https://luntra-outreach-app.azurewebsites.net/api/v1/stripe/health
  ```

- [ ] API Documentation
  ```bash
  # Open in browser
  https://luntra-outreach-app.azurewebsites.net/docs
  https://luntra-outreach-app.azurewebsites.net/redoc
  ```

- [ ] User signup
  ```bash
  curl -X POST https://luntra-outreach-app.azurewebsites.net/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"test@propiq.test","password":"TestPass123"}'
  ```

- [ ] User login
  ```bash
  curl -X POST https://luntra-outreach-app.azurewebsites.net/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@propiq.test","password":"TestPass123"}'
  ```

- [ ] Property analysis (with token)
  ```bash
  curl -X POST https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/analyze \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"address":"123 Main St, San Francisco, CA"}'
  ```

#### Frontend Tests

- [ ] Load homepage
- [ ] User can sign up
- [ ] User can log in
- [ ] User can analyze property
- [ ] Payment flow works
- [ ] Support chat loads
- [ ] All links work
- [ ] Microsoft Clarity tracking (check dashboard)

#### Security Tests

- [ ] HTTPS enforced
- [ ] Security headers present (check dev tools)
- [ ] CSP working (no console errors)
- [ ] Rate limiting active (test with rapid requests)
- [ ] JWT tokens expire correctly
- [ ] Invalid tokens rejected

### Performance Tests

```bash
# Test response times
time curl https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health

# Load test (using Apache Bench)
ab -n 100 -c 10 https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/health
```

---

## Rollback Procedures

### Backend Rollback

#### Quick Rollback (Previous Deployment)

```bash
# List deployments
az webapp deployment list \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app

# Rollback to previous deployment
az webapp deployment source config-zip \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  --src previous-deployment.zip
```

#### Rollback to Specific Version

```bash
# Tag your Docker images with versions
docker tag luntraregistry.azurecr.io/propiq-backend:latest \
           luntraregistry.azurecr.io/propiq-backend:v3.1.0

# Deploy specific version
az webapp config container set \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  --docker-custom-image-name luntraregistry.azurecr.io/propiq-backend:v3.1.0
```

### Frontend Rollback

#### Netlify

```bash
# List deployments
netlify sites:list

# Rollback to previous
netlify rollback
```

### Database Rollback

**⚠️ CRITICAL:** Always backup before migrations!

```bash
# Backup database
pg_dump "postgresql://user:pass@host/db" > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql "postgresql://user:pass@host/db" < backup_20251107_120000.sql
```

---

## Monitoring & Logging

### Azure Application Insights

```bash
# Enable Application Insights
az monitor app-insights component create \
  --app propiq-backend \
  --location eastus2 \
  --resource-group luntra-outreach-rg

# Get instrumentation key
az monitor app-insights component show \
  --app propiq-backend \
  --resource-group luntra-outreach-rg \
  --query instrumentationKey
```

### Log Monitoring

```bash
# Stream logs
az webapp log tail \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app

# Filter errors only
az webapp log tail \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  | grep ERROR
```

### Uptime Monitoring

- Use Azure Monitor for backend
- Use Netlify Analytics for frontend
- Set up alerts for downtime

### Performance Monitoring

- **Weights & Biases:** ML model performance
- **Microsoft Clarity:** User behavior
- **Azure Metrics:** Server performance

---

## Troubleshooting

### Common Issues

#### Issue: Container fails to start

```bash
# Check logs
az webapp log tail \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app

# Common causes:
# - Missing environment variables
# - Database connection failed
# - Port configuration wrong
```

**Solution:**
1. Verify all environment variables set
2. Check database connectivity
3. Ensure PORT is not hardcoded

#### Issue: 503 Service Unavailable

**Cause:** Container not ready or crashed

**Solution:**
```bash
# Restart the app
az webapp restart \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app

# Wait 2-3 minutes for container to start
```

#### Issue: CORS errors

**Cause:** Frontend URL not in `ALLOWED_ORIGINS`

**Solution:**
```bash
# Add frontend URL to allowed origins
az webapp config appsettings set \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  --settings ALLOWED_ORIGINS="https://propiq.luntra.one,https://www.propiq.luntra.one"
```

#### Issue: Database connection timeout

**Cause:** Supabase connection string incorrect or network issue

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_KEY`
2. Check Supabase dashboard for outages
3. Test connection locally:
   ```bash
   python3 -c "from supabase import create_client; client = create_client('URL', 'KEY'); print(client.table('users').select('*').limit(1).execute())"
   ```

#### Issue: Stripe webhooks not working

**Cause:** Webhook secret incorrect or endpoint not reachable

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET`
2. Test webhook endpoint:
   ```bash
   stripe listen --forward-to https://luntra-outreach-app.azurewebsites.net/api/v1/stripe/webhook
   ```
3. Check Stripe dashboard for webhook logs

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup current database
- [ ] Tag Docker image with version
- [ ] Update CHANGELOG.md
- [ ] Notify team of deployment

### During Deployment

- [ ] Deploy backend
- [ ] Wait for container to start (2-3 minutes)
- [ ] Verify health endpoints
- [ ] Deploy frontend
- [ ] Run smoke tests

### Post-Deployment

- [ ] Verify all endpoints working
- [ ] Check logs for errors
- [ ] Monitor error rates (first 30 minutes)
- [ ] Test critical user flows
- [ ] Update documentation
- [ ] Tag git release
- [ ] Notify team of completion

---

## Emergency Contacts

- **Azure Support:** https://portal.azure.com
- **Supabase Support:** https://app.supabase.com
- **Stripe Support:** https://dashboard.stripe.com
- **On-Call Engineer:** [Your contact info]

---

## Version History

- **v3.1.1** (2025-11-07) - Testing infrastructure, security tests, OpenAPI docs
- **v3.1.0** (2025-11-07) - Database cleanup, API security, structured logging
- **v3.0.0** (Historical) - Initial PropIQ setup

---

**End of Deployment Guide**

For questions or issues, contact the development team or refer to the [API Usage Guide](API_USAGE_GUIDE.md).
