# GitHub Actions Setup Guide

Quick guide to configure GitHub Actions for PropIQ CI/CD pipeline.

---

## Step 1: Configure GitHub Secrets

Go to your GitHub repository:
`Settings > Secrets and variables > Actions > New repository secret`

### Required Secrets

Add the following 5 secrets:

#### 1. AZURE_CREDENTIALS
```bash
# Create service principal
az ad sp create-for-rbac \
  --name "propiq-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv) \
  --sdk-auth

# Copy the entire JSON output and paste as secret value
```

#### 2. AZURE_ACR_USERNAME
```bash
az acr credential show --name luntraacr --query username -o tsv
```

#### 3. AZURE_ACR_PASSWORD
```bash
az acr credential show --name luntraacr --query "passwords[0].value" -o tsv
```

#### 4. NETLIFY_AUTH_TOKEN
1. Go to Netlify Dashboard
2. User Settings > Applications > Personal access tokens
3. Create new access token
4. Copy token value

#### 5. NETLIFY_SITE_ID
1. Go to Netlify Dashboard
2. Select PropIQ site
3. Site Settings > General > Site information
4. Copy "Site ID"

---

## Step 2: Enable GitHub Actions

1. Go to repository Settings
2. Actions > General
3. Select "Allow all actions and reusable workflows"
4. Save

---

## Step 3: Test the Pipeline

### Option 1: Push to main branch
```bash
git push origin main
```

### Option 2: Manual trigger
1. Go to Actions tab
2. Select "Deploy PropIQ" workflow
3. Click "Run workflow"
4. Select branch: main
5. Click "Run workflow"

---

## Step 4: Monitor Deployment

1. Go to Actions tab
2. Click on the running workflow
3. Watch real-time logs
4. Verify all jobs complete successfully:
   - ✅ test-backend
   - ✅ test-frontend
   - ✅ deploy-backend
   - ✅ deploy-frontend
   - ✅ verify-deployment

Expected total time: ~20-25 minutes

---

## Step 5: Verify Deployment

After pipeline completes, verify endpoints:

```bash
# Backend health
curl https://luntra-outreach-app.azurewebsites.net/propiq/health
curl https://luntra-outreach-app.azurewebsites.net/support/health
curl https://luntra-outreach-app.azurewebsites.net/stripe/health

# Frontend
curl -I https://propiq.luntra.one
```

All should return HTTP 200.

---

## Troubleshooting

### "Azure credentials are invalid"
- Verify `AZURE_CREDENTIALS` secret is valid JSON
- Re-create service principal if expired

### "Failed to authenticate to Azure Container Registry"
- Check `AZURE_ACR_USERNAME` and `AZURE_ACR_PASSWORD`
- Verify ACR admin user is enabled:
  ```bash
  az acr update --name luntraacr --admin-enabled true
  ```

### "Netlify deploy failed"
- Verify `NETLIFY_AUTH_TOKEN` is valid
- Check `NETLIFY_SITE_ID` matches your site
- Ensure Netlify CLI has access to the site

---

## Next Steps

- Set up branch protection rules (require PR reviews)
- Configure deployment notifications (Slack, email)
- Add status badges to README
- Set up staging environment

---

**Setup time:** ~15 minutes
**Status:** Ready for first deployment
