# Deploy Luntra Backend to Azure (Docker Container)

⚠️ **DEPRECATED - This guide is for legacy Luntra project**

**For PropIQ deployment, see:** [`../FAST_DEPLOYMENT_GUIDE.md`](../FAST_DEPLOYMENT_GUIDE.md)

**Reason for deprecation:** Azure deployments take 10-15 minutes. The new guide uses Netlify + Render/Railway for 2-3 minute deployments.

---

**Update your existing Azure Web App with the new FastAPI backend**

You already have Azure infrastructure set up. This guide will help you update it with the new backend.

---

## Current Azure Setup

- **Web App:** luntra-outreach-app
- **Resource Group:** luntra-outreach-rg
- **Container Registry:** luntracontainerregistry.azurecr.io
- **Current Image:** luntra-outreach-app:v2.0.0
- **URL:** https://luntra-outreach-app.azurewebsites.net

---

## Quick Deploy (Using Warp - 5 Steps)

### Step 1: Create Dockerfile

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/backend
```

Create `Dockerfile`:

```dockerfile
# Use official Python runtime
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 2: Build Docker Image

```bash
# Login to Azure Container Registry
az acr login --name luntracontainerregistry

# Build and tag image
docker build -t luntracontainerregistry.azurecr.io/luntra-api:v3.0.0 .

# Push to registry
docker push luntracontainerregistry.azurecr.io/luntra-api:v3.0.0
```

### Step 3: Configure Environment Variables in Azure

```bash
# Set all environment variables
az webapp config appsettings set \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  --settings \
    ENVIRONMENT=production \
    MONGODB_URI="mongodb+srv://dealIQ_backend_user:nahpyr-dyPhy3-xoqwat@propiq-production-clust.q4050y.mongodb.net/luntra?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster" \
    ALLOWED_ORIGINS="https://luntra.one,https://app.luntra.one" \
    EMAIL_PROVIDER=resend \
    RESEND_API_KEY=re_H7EmkHzY_35Evxg2J4cG7Qfp5eMT2BkGk \
    RESEND_FROM=bdusape@gmail.com \
    STRIPE_SECRET_KEY=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 \
    STRIPE_PRICE_ID=price_1RqHkREtJUE5bLBgPGCA4EOz \
    STRIPE_WEBHOOK_SECRET=whsec_05faf4882ab063e18686d4088b8ee2d6293095a5ce5f74805cbf701bb45745d4 \
    OPENAI_API_KEY=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 \
    SERPER_API_KEY=4683d1c1e4dcbec517be9c7ef871d5e1ef10a613 \
    APOLLO_API_KEY=nBonFucH5lRJoY-eMyDdTA \
    PYTHON_VERSION=3.11 \
    PORT=8000
```

### Step 4: Update Web App to Use New Image

```bash
# Update container image
az webapp config container set \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  --docker-custom-image-name luntracontainerregistry.azurecr.io/luntra-api:v3.0.0 \
  --docker-registry-server-url https://luntracontainerregistry.azurecr.io

# Restart web app
az webapp restart \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app
```

### Step 5: Verify Deployment

```bash
# Wait 30 seconds for container to start
sleep 30

# Test health endpoint
curl https://luntra-outreach-app.azurewebsites.net/health

# Expected response:
# {
#   "status": "healthy",
#   "build_hash": "c96d193",
#   "build_timestamp": "2025-10-20...",
#   "version": "1.0.0",
#   "environment": "production"
# }
```

---

## Alternative: Complete Shell Script (Copy-Paste)

Save this as `deploy-azure.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Luntra Backend to Azure..."

# Variables
REGISTRY="luntracontainerregistry"
RESOURCE_GROUP="luntra-outreach-rg"
APP_NAME="luntra-outreach-app"
IMAGE_NAME="luntra-api"
VERSION="v3.0.0"
FULL_IMAGE="${REGISTRY}.azurecr.io/${IMAGE_NAME}:${VERSION}"

# Step 1: Login to Azure Container Registry
echo "📝 Logging into Azure Container Registry..."
az acr login --name $REGISTRY

# Step 2: Build Docker image
echo "🔨 Building Docker image..."
docker build -t $FULL_IMAGE .

# Step 3: Push to registry
echo "📤 Pushing image to registry..."
docker push $FULL_IMAGE

# Step 4: Update environment variables
echo "⚙️  Configuring environment variables..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    ENVIRONMENT=production \
    MONGODB_URI="mongodb+srv://dealIQ_backend_user:nahpyr-dyPhy3-xoqwat@propiq-production-clust.q4050y.mongodb.net/luntra?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster" \
    ALLOWED_ORIGINS="https://luntra.one,https://app.luntra.one" \
    EMAIL_PROVIDER=resend \
    RESEND_API_KEY=re_H7EmkHzY_35Evxg2J4cG7Qfp5eMT2BkGk \
    RESEND_FROM=bdusape@gmail.com \
    STRIPE_SECRET_KEY=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 \
    STRIPE_PRICE_ID=price_1RqHkREtJUE5bLBgPGCA4EOz \
    STRIPE_WEBHOOK_SECRET=whsec_05faf4882ab063e18686d4088b8ee2d6293095a5ce5f74805cbf701bb45745d4 \
    OPENAI_API_KEY=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 \
    SERPER_API_KEY=4683d1c1e4dcbec517be9c7ef871d5e1ef10a613 \
    APOLLO_API_KEY=nBonFucH5lRJoY-eMyDdTA \
    PYTHON_VERSION=3.11 \
    PORT=8000

# Step 5: Update container image
echo "🔄 Updating Web App container..."
az webapp config container set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --docker-custom-image-name $FULL_IMAGE \
  --docker-registry-server-url https://${REGISTRY}.azurecr.io

# Step 6: Restart app
echo "🔄 Restarting Web App..."
az webapp restart \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME

# Step 7: Verify deployment
echo "⏳ Waiting 30 seconds for container to start..."
sleep 30

echo "✅ Testing health endpoint..."
curl -s https://${APP_NAME}.azurewebsites.net/health | python3 -m json.tool

echo ""
echo "🎉 Deployment complete!"
echo "Backend URL: https://${APP_NAME}.azurewebsites.net"
```

Make it executable and run:

```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

---

## Expected Timeline

- Docker build: 1-2 minutes
- Push to registry: 1 minute
- Environment variable config: 30 seconds
- Container update & restart: 2-3 minutes

**Total: ~5-7 minutes**

---

## Monitoring Deployment

Watch logs in real-time:

```bash
az webapp log tail \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app
```

Look for:
```
✅ Auth router registered
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Update Frontend

Once backend is verified:

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/luntra/frontend

# Update API URL
# In .env or Cloudflare Pages:
VITE_API_BASE=https://luntra-outreach-app.azurewebsites.net

# Redeploy frontend
npm run deploy:frontend
```

---

## Troubleshooting

### Container fails to start

Check logs:
```bash
az webapp log tail --resource-group luntra-outreach-rg --name luntra-outreach-app
```

### MongoDB connection fails

1. Check MongoDB Atlas Network Access
2. Add Azure IP ranges or allow 0.0.0.0/0 for testing
3. Verify connection string in app settings

### CORS errors

Update ALLOWED_ORIGINS:
```bash
az webapp config appsettings set \
  --resource-group luntra-outreach-rg \
  --name luntra-outreach-app \
  --settings ALLOWED_ORIGINS="https://luntra.one,https://www.luntra.one"
```

---

## Cost Comparison

### Azure (Your Current Setup)
- Container Registry: ~$5/month (Basic)
- Web App (Basic tier): ~$13/month
- Total: ~$18/month (covered by sponsorship)

### Render (Alternative)
- Free tier available
- Starter (always-on): $7/month
- Standard: $25/month

**Recommendation:** Stick with Azure since you have sponsorship credits and existing infrastructure.

---

## Next Steps After Deployment

1. ✅ Test health endpoint
2. ✅ Test auth endpoints (signup/login)
3. ✅ Update frontend API URL
4. ✅ Run integration tests
5. ✅ Set up custom domain (api.luntra.one)
6. ✅ Enable Application Insights for monitoring

---

**Ready to deploy?** Open Warp and run the commands above!
