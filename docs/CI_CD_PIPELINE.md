# CI/CD Pipeline Documentation

**Created:** Sprint 12 - Production Readiness
**Last Updated:** 2025-11-07

---

## Overview

PropIQ uses GitHub Actions for automated testing and deployment. Every push to `main` triggers a full CI/CD pipeline that tests, builds, and deploys both backend and frontend.

**Pipeline Stages:**
1. **Test Backend** - Run pytest, code formatting checks
2. **Test Frontend** - Type checking, build verification, tests
3. **Deploy Backend** - Docker build, push to ACR, deploy to Azure Web App
4. **Deploy Frontend** - Build with production config, deploy to Netlify
5. **Verify Deployment** - Health checks on all endpoints
6. **Rollback on Failure** - Notification and rollback guidance

---

## Workflow File

**Location:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch (auto-deploy)
- Pull requests to `main` (test only, no deploy)
- Manual trigger via GitHub Actions UI

---

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings at:
`Settings > Secrets and variables > Actions`

### Azure Secrets

**`AZURE_CREDENTIALS`**
- Azure service principal JSON for authentication
- Format:
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx"
}
```
- **How to get:** `az ad sp create-for-rbac --name "propiq-github-actions" --role contributor --scopes /subscriptions/{subscription-id} --sdk-auth`

**`AZURE_ACR_USERNAME`**
- Azure Container Registry username
- **How to get:** `az acr credential show --name luntraacr --query username -o tsv`

**`AZURE_ACR_PASSWORD`**
- Azure Container Registry password
- **How to get:** `az acr credential show --name luntraacr --query "passwords[0].value" -o tsv`

### Netlify Secrets

**`NETLIFY_AUTH_TOKEN`**
- Personal access token from Netlify
- **How to get:** Netlify Dashboard > User Settings > Applications > Personal access tokens > New access token

**`NETLIFY_SITE_ID`**
- Site ID for PropIQ frontend
- **How to get:** Netlify Dashboard > Site Settings > General > Site information > Site ID

---

## Pipeline Flow

### 1. Test Backend (3-5 minutes)

**What it does:**
- Checks out code
- Sets up Python 3.11
- Installs dependencies from `requirements.txt`
- Runs pytest (if tests exist)
- Checks code formatting with black and flake8

**Success criteria:**
- All dependencies install successfully
- Tests pass (or no tests found)
- No critical code formatting issues

**Logs location:**
`Actions > Deploy PropIQ > test-backend`

### 2. Test Frontend (3-5 minutes)

**What it does:**
- Checks out code
- Sets up Node.js 20.x
- Installs npm dependencies
- Runs TypeScript type checking
- Builds frontend with Vite
- Runs tests (if they exist)

**Success criteria:**
- No TypeScript errors
- Build completes successfully
- Tests pass (or no tests found)

**Logs location:**
`Actions > Deploy PropIQ > test-frontend`

### 3. Deploy Backend (5-7 minutes)

**What it does:**
- Logs into Azure
- Logs into Azure Container Registry
- Builds Docker image from `backend/Dockerfile`
- Tags image with commit SHA and `latest`
- Pushes image to ACR
- Deploys to Azure Web App
- Waits 60 seconds for container restart
- Runs health check (10 attempts, 10 seconds apart)

**Success criteria:**
- Docker image builds successfully
- Image pushed to ACR
- Azure Web App restarts with new image
- Health check returns HTTP 200

**Health check endpoint:**
`https://luntra-outreach-app.azurewebsites.net/propiq/health`

**Logs location:**
`Actions > Deploy PropIQ > deploy-backend`

### 4. Deploy Frontend (3-5 minutes)

**What it does:**
- Checks out code
- Sets up Node.js
- Installs dependencies
- Builds frontend with production config
- Deploys to Netlify
- Runs health check (5 attempts, 10 seconds apart)

**Environment variables set:**
- `VITE_API_URL`: Points to production backend

**Success criteria:**
- Build completes successfully
- Deploy to Netlify succeeds
- Frontend accessible at https://propiq.luntra.one

**Logs location:**
`Actions > Deploy PropIQ > deploy-frontend`

### 5. Verify Deployment (1-2 minutes)

**What it does:**
- Verifies backend endpoints:
  - `/propiq/health` - PropIQ analysis API
  - `/support/health` - Support chat API
  - `/stripe/health` - Payment processing
- Verifies frontend accessibility
- Sends deployment notification

**Success criteria:**
- All backend endpoints return HTTP 200
- Frontend returns HTTP 200
- No errors in responses

**Logs location:**
`Actions > Deploy PropIQ > verify-deployment`

### 6. Rollback on Failure (if needed)

**What it does:**
- Triggers only if deployment verification fails
- Logs failure notification
- Provides guidance for manual rollback

**Manual rollback required:**
See "Rollback Procedures" section below

---

## Monitoring Deployments

### GitHub Actions UI

**View all workflows:**
`https://github.com/yourusername/yourrepo/actions`

**View specific run:**
`Actions > Deploy PropIQ > Click on specific run`

**Real-time logs:**
Click on any job (test-backend, deploy-frontend, etc.) to see live logs

### Deployment Status Badge

Add to README:
```markdown
![Deploy Status](https://github.com/yourusername/yourrepo/workflows/Deploy%20PropIQ/badge.svg)
```

---

## Rollback Procedures

### Automatic Rollback (Not Implemented)

**Status:** Not yet implemented
**Future enhancement:** Automatic rollback to previous Docker image on failure

### Manual Rollback - Backend

**Option 1: Rollback to previous Docker image**
```bash
# List recent images
az acr repository show-tags --name luntraacr --repository propiq-backend --orderby time_desc --top 10

# Deploy specific version
az webapp config container set \
  --name luntra-outreach-app \
  --resource-group propiq-rg \
  --docker-custom-image-name luntraacr.azurecr.io/propiq-backend:{previous-sha}

# Restart app
az webapp restart --name luntra-outreach-app --resource-group propiq-rg

# Verify
curl https://luntra-outreach-app.azurewebsites.net/propiq/health
```

**Option 2: Redeploy from previous commit**
```bash
# Find working commit
git log --oneline -10

# Checkout previous commit
git checkout {working-commit-sha}

# Manually run deployment
cd propiq/backend
./deploy-azure.sh
```

**Expected RTO:** 15 minutes

### Manual Rollback - Frontend

**Option 1: Rollback in Netlify UI**
1. Go to Netlify Dashboard
2. Navigate to: Deploys > Published deploys
3. Find previous working deployment
4. Click "Publish deploy"

**Option 2: Redeploy from previous commit**
```bash
# Find working commit
git log --oneline -10

# Checkout previous commit
git checkout {working-commit-sha}

# Build and deploy
cd propiq/frontend
npm run build
netlify deploy --prod --dir=dist
```

**Expected RTO:** 10 minutes

### Emergency Maintenance Mode

**If both rollbacks fail:**
1. Update Netlify to display maintenance page
2. Disable backend by scaling down Azure Web App
3. Investigate root cause
4. Restore from last known working state

---

## Deployment Checklist

### Before Deploying

- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] No secrets committed to git
- [ ] Environment variables configured in Azure/Netlify
- [ ] Database migrations tested (if any)
- [ ] Backup created (if making DB changes)

### After Deploying

- [ ] Health checks pass
- [ ] Manual smoke test (login, analyze property, check payment)
- [ ] Check error monitoring (Sentry/logs)
- [ ] Verify analytics (Microsoft Clarity)
- [ ] Monitor for 15 minutes post-deployment

---

## Troubleshooting

### Build Fails

**Symptom:** GitHub Actions shows red X on test-backend or test-frontend

**Common causes:**
- TypeScript errors
- Missing dependencies
- Test failures
- Code formatting issues

**Solution:**
1. Check logs in GitHub Actions
2. Fix issues locally
3. Run tests locally: `npm test` or `pytest`
4. Commit fix and push

### Backend Deployment Fails

**Symptom:** deploy-backend job fails or health check times out

**Common causes:**
- Docker build error
- Azure credentials expired
- Container registry authentication failed
- Backend crash on startup

**Solution:**
1. Check Azure Web App logs:
```bash
az webapp log tail --name luntra-outreach-app --resource-group propiq-rg
```
2. Verify environment variables in Azure App Settings
3. Test Docker image locally:
```bash
docker build -t propiq-backend .
docker run -p 8000:8000 propiq-backend
curl http://localhost:8000/propiq/health
```

### Frontend Deployment Fails

**Symptom:** deploy-frontend job fails

**Common causes:**
- Build errors
- Netlify token expired
- Build output directory incorrect

**Solution:**
1. Check build logs in GitHub Actions
2. Verify Netlify secrets are correct
3. Test build locally:
```bash
cd propiq/frontend
npm run build
ls -la dist/  # Verify output
```

### Health Check Fails

**Symptom:** Deployment succeeds but verification fails

**Common causes:**
- Backend not fully started
- Database connection issues
- Environment variables missing

**Solution:**
1. Wait 2-3 minutes for full startup
2. Check backend logs
3. Manually test endpoints:
```bash
curl https://luntra-outreach-app.azurewebsites.net/propiq/health
curl https://luntra-outreach-app.azurewebsites.net/support/health
```

---

## Performance Metrics

### Target Deployment Times

| Stage | Target | Current |
|-------|--------|---------|
| Test Backend | < 5 min | ⏱️ TBD |
| Test Frontend | < 5 min | ⏱️ TBD |
| Deploy Backend | < 7 min | ⏱️ TBD |
| Deploy Frontend | < 5 min | ⏱️ TBD |
| Verify | < 2 min | ⏱️ TBD |
| **Total** | **< 25 min** | ⏱️ TBD |

### Optimization Opportunities

**Current:**
- Sequential backend and frontend deploys

**Future:**
- Parallel deploys (backend and frontend simultaneously)
- Cached Docker layers
- Cached npm dependencies
- Incremental builds

**Potential time savings:** 5-10 minutes

---

## Security Considerations

### Secrets Management

**Never:**
- ❌ Commit secrets to git
- ❌ Log secrets in workflows
- ❌ Expose secrets in build output

**Always:**
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate credentials regularly (every 90 days)
- ✅ Use service principals with minimal permissions
- ✅ Audit secret access logs

### Deployment Security

**Implemented:**
- Azure Container Registry authentication
- HTTPS only for all endpoints
- Environment-specific configurations

**TODO:**
- Branch protection rules (require PR reviews)
- Required status checks before merge
- Deployment approval gates for production

---

## Future Enhancements

### Phase 1 (Sprint 13)
- [ ] Add integration tests to pipeline
- [ ] Add E2E tests (Playwright)
- [ ] Parallel backend/frontend deploys
- [ ] Deployment notifications (Slack/email)

### Phase 2 (Sprint 14)
- [ ] Automatic rollback on failure
- [ ] Canary deployments (gradual rollout)
- [ ] Staging environment deployments
- [ ] Performance benchmarking in CI

### Phase 3 (Sprint 15+)
- [ ] Multi-region deployments
- [ ] Blue-green deployments
- [ ] Infrastructure as Code (Terraform)
- [ ] Automated security scanning

---

## Support

**Issues with CI/CD:**
- Check GitHub Actions logs
- Review this documentation
- Check Azure/Netlify dashboards
- Create issue in repository

**Emergency contacts:**
- DevOps lead: [Contact info]
- Azure admin: [Contact info]

---

**Last Updated:** 2025-11-07
**Sprint:** 12 - Production Readiness
**Status:** ✅ CI/CD Pipeline Implemented
