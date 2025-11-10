# PropIQ Backend - Railway Deployment Guide

This guide walks you through deploying the PropIQ backend to Railway, a modern platform that's simpler and more developer-friendly than Azure.

## Why Railway?

- **Simpler deployment**: One-click deploy from GitHub
- **Better DX**: Built-in logs, metrics, and CLI tools
- **Cost-effective**: $5/month hobby plan vs Azure complexity
- **Zero-downtime deploys**: Automatic health checks
- **Free SSL**: Automatic HTTPS certificates
- **Easy environment variables**: Simple UI and CLI management

## Prerequisites

- Railway CLI installed (`brew install railway` or `npm install -g @railway/cli`)
- GitHub account (for connecting repository)
- Railway account (sign up at railway.app)

## Step 1: Authenticate with Railway

```bash
railway login
```

This will open your browser for authentication.

## Step 2: Create a New Railway Project

In the propiq/backend directory:

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend
railway init
```

Follow the prompts to create a new project.

## Step 3: Configure Environment Variables

Add all required environment variables using the Railway CLI:

```bash
# Azure OpenAI Configuration
railway variables set AZURE_OPENAI_ENDPOINT="https://luntra-openai-service.cognitiveservices.azure.com/"
railway variables set AZURE_OPENAI_KEY="938KkvrloTxNKLBPytAuZm2OKQtQOcY1v2DB1bx3isMZ2ewUjYLAJQQJ99BJACYeBjFXJ3w3AAABACOGEx8u"
railway variables set AZURE_OPENAI_API_VERSION="2025-01-01-preview"

# MongoDB Configuration
railway variables set MONGODB_URI='mongodb+srv://dealIQ_backend_user:nahpyr-dyPhy3-xoqwat@propiq-production-clust.q4050y.mongodb.net/propiq?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster'

# Stripe Configuration
railway variables set STRIPE_SECRET_KEY="your_stripe_secret_key"
railway variables set STRIPE_PRICE_ID="your_price_id"
railway variables set STRIPE_WEBHOOK_SECRET="your_webhook_secret"

# Weights & Biases (AI Tracking)
railway variables set WANDB_API_KEY="your_wandb_key"
railway variables set WANDB_MODE="online"

# SendGrid (Email)
railway variables set SENDGRID_API_KEY="your_sendgrid_key"

# JWT Secret
railway variables set JWT_SECRET="your-secure-jwt-secret-change-this"
```

## Step 4: Create railway.json Configuration

The `railway.json` file is already configured in this directory with:
- Build command: Uses Docker
- Health check endpoint: `/health`
- Port: 8000

## Step 5: Create nixpacks.toml (Optional)

Railway uses Nixpacks for builds. A `nixpacks.toml` file has been created to customize the build.

## Step 6: Deploy to Railway

```bash
railway up
```

This will build and deploy your application.

## Step 7: Get Your Deployment URL

```bash
railway domain
```

This will show your public URL (e.g., `propiq-backend-production.up.railway.app`)

If no domain is configured yet, create one:

```bash
railway domain create
```

## Step 8: Update Extension API Endpoint

Once deployed, update the extension's API client:

File: `propiq-extension-starter/src/shared/api-client.ts`

```typescript
constructor() {
  // Railway production endpoint
  this.baseUrl = 'https://your-app.up.railway.app';

  // For local development:
  // this.baseUrl = 'http://localhost:8000';
}
```

## Step 9: Monitor Deployment

View logs:
```bash
railway logs
```

Check status:
```bash
railway status
```

Open in browser:
```bash
railway open
```

## Alternative: Deploy from GitHub

1. Push your code to GitHub
2. Go to railway.app and create a new project
3. Select "Deploy from GitHub repo"
4. Choose the repository
5. Set the root directory to `propiq/backend`
6. Configure environment variables in the Railway dashboard
7. Deploy!

## Continuous Deployment

Once connected to GitHub, Railway will automatically deploy when you push to main branch.

## Cost Estimate

- **Hobby Plan**: $5/month
  - 500 hours of runtime
  - $0.000231/minute after
  - Perfect for MVP and testing

- **Pro Plan**: $20/month
  - Higher limits
  - Priority support

## Troubleshooting

### Build fails
- Check `railway logs --build`
- Verify all dependencies in requirements.txt
- Ensure Dockerfile is valid

### Application won't start
- Check `railway logs`
- Verify environment variables are set
- Test health endpoint: `curl https://your-app.up.railway.app/health`

### Database connection issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Test connection locally first

### Port issues
- Railway automatically sets PORT environment variable
- FastAPI should listen on 0.0.0.0:$PORT
- Health check should use the same port

## Railway CLI Cheat Sheet

```bash
# Project management
railway init              # Create new project
railway link              # Link to existing project
railway status            # Show project status
railway open              # Open project in browser

# Deployment
railway up                # Deploy current directory
railway up --detach       # Deploy without following logs

# Environment variables
railway variables         # List all variables
railway variables set KEY=VALUE
railway variables delete KEY

# Logs and monitoring
railway logs              # View application logs
railway logs --build      # View build logs
railway logs --follow     # Follow logs in real-time

# Domains
railway domain            # Show current domain
railway domain create     # Create new domain
railway domain delete     # Remove domain

# Services
railway service           # Manage services
railway service restart   # Restart service
```

## Next Steps

1. **Test the deployment**: Visit your Railway URL + `/health`
2. **Update extension**: Point to Railway endpoint
3. **Test end-to-end**: Login, analyze a property
4. **Monitor**: Watch logs for any issues
5. **Scale**: Upgrade plan if needed

## Migration from Azure

If migrating from Azure:

1. ✅ Keep same environment variables
2. ✅ No code changes needed
3. ✅ Same database (MongoDB Atlas)
4. ✅ Same APIs (Azure OpenAI, Stripe, etc.)
5. ✅ Update DNS if using custom domain

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

**Generated with Claude Code**
Last Updated: 2025-10-30
