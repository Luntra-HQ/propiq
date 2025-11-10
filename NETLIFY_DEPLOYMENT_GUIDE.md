# Netlify Deployment Guide for PropIQ

**Status**: Build Complete ✅
**Ready for**: Manual Netlify deployment
**Build Output**: `/home/user/propiq/frontend/dist`

---

## Current Status

✅ **Frontend Built Successfully**
- Build tool: Vite 7.2.2
- Build size: ~343 KB (gzipped)
- Output directory: `dist/`
- Assets optimized and minified

⚠️ **Authentication Required**
- Netlify CLI requires authentication
- Site ID: `28574b8a-3d1e-48fe-a38d-f4eab9ffcc87`

---

## Option 1: Deploy via Netlify CLI (Recommended)

### Step 1: Authenticate
```bash
cd /home/user/propiq/frontend

# Login to Netlify (opens browser)
netlify login

# Or use auth token
export NETLIFY_AUTH_TOKEN=your_token_here
```

### Step 2: Deploy
```bash
# Deploy to production
netlify deploy --prod --dir=dist

# The site is already linked to Netlify site ID: 28574b8a-3d1e-48fe-a38d-f4eab9ffcc87
```

---

## Option 2: Deploy via Netlify Dashboard (Manual)

### Step 1: Access the Build
The frontend has been built and is ready in:
```
/home/user/propiq/frontend/dist/
```

### Step 2: Manual Upload
1. Go to https://app.netlify.com
2. Navigate to your site (ID: 28574b8a-3d1e-48fe-a38d-f4eab9ffcc87)
3. Go to "Deploys" tab
4. Drag and drop the `dist` folder to deploy

---

## Option 3: Deploy via Git Push (Automated)

### Setup Continuous Deployment

1. **Connect Repository to Netlify**:
   ```bash
   # Ensure code is pushed to GitHub
   cd /home/user/propiq
   git add frontend/
   git commit -m "Frontend build ready for deployment"
   git push origin main
   ```

2. **Configure Netlify Site**:
   - Go to https://app.netlify.com
   - Site settings → Build & deploy
   - Configure:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/dist`
     - **Node version**: `20`

3. **Set Environment Variables** (in Netlify dashboard):
   ```
   VITE_API_BASE=https://luntra-outreach-app.azurewebsites.net
   ```

4. **Trigger Deploy**:
   - Push to GitHub: Automatic deployment
   - Or click "Trigger deploy" in Netlify dashboard

---

## Option 4: Deploy with Auth Token (For CI/CD)

### Get Your Auth Token
1. Go to https://app.netlify.com/user/applications
2. Click "New access token"
3. Copy token

### Deploy
```bash
export NETLIFY_AUTH_TOKEN=your_token_here

cd /home/user/propiq/frontend
netlify deploy --prod --dir=dist --site=28574b8a-3d1e-48fe-a38d-f4eab9ffcc87
```

---

## Build Details

### What Was Built

**Source**: `/home/user/propiq/frontend/src`
- React 19.1.1 application
- TypeScript + Vite
- Styled Components
- Lucide React icons

**Output**: `/home/user/propiq/frontend/dist`
```
dist/
├── index.html (13.16 kB)
├── assets/
│   ├── index-DCYvS25v.css (57.08 kB)
│   ├── vendor-ui-ByI6EHtU.js (6.57 kB)
│   ├── vendor-react-RsqJS7wA.js (11.33 kB)
│   ├── purify.es-DXLIWP_F.js (22.50 kB)
│   ├── index.es-D-HDR85M.js (155.73 kB)
│   ├── index-Cl4Oxo2n.js (275.76 kB)
│   └── vendor-utils-DPhE3nQc.js (620.67 kB)
```

**Total**: 1.15 MB (343 KB gzipped)

---

## Environment Configuration

### Current .env
```bash
# Backend API
VITE_API_BASE=https://luntra-outreach-app.azurewebsites.net

# Frontend URL
PLAYWRIGHT_BASE_URL=https://propiq.luntra.one
```

### Netlify Environment Variables Needed
When deploying, ensure these are set in Netlify:

```
VITE_API_BASE=https://luntra-outreach-app.azurewebsites.net
```

---

## Netlify Configuration

### netlify.toml
Already configured with:
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ Node version: 20
- ✅ SPA redirects (/* → /index.html)
- ✅ Security headers
- ✅ Cache headers for static assets

### Site Information
- **Site ID**: `28574b8a-3d1e-48fe-a38d-f4eab9ffcc87`
- **Current config**: `/home/user/propiq/frontend/netlify.toml`

---

## Post-Deployment Verification

### 1. Check Site is Live
```bash
# Get site URL
netlify status

# Or visit Netlify dashboard
```

### 2. Test Key Features
- ✅ Homepage loads
- ✅ API connectivity (backend at https://luntra-outreach-app.azurewebsites.net)
- ✅ Routing works (SPA navigation)
- ✅ No console errors

### 3. Verify Environment
```javascript
// In browser console, check:
console.log(import.meta.env.VITE_API_BASE)
// Should show: https://luntra-outreach-app.azurewebsites.net
```

---

## Troubleshooting

### Issue: "Forbidden" Error
**Cause**: Not authenticated with Netlify
**Solution**: Run `netlify login` or set `NETLIFY_AUTH_TOKEN`

### Issue: Build Fails
**Cause**: Dependencies not installed
**Solution**:
```bash
cd /home/user/propiq/frontend
npm install
npx vite build
```

### Issue: API Calls Fail
**Cause**: CORS or wrong API URL
**Solution**: Verify `VITE_API_BASE` in Netlify environment variables

### Issue: Routes Return 404
**Cause**: SPA redirect not working
**Solution**: Verify `netlify.toml` has:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Quick Deploy Commands

### If you have Netlify auth configured:
```bash
cd /home/user/propiq/frontend

# Deploy in one command
netlify deploy --prod --dir=dist --site=28574b8a-3d1e-48fe-a38d-f4eab9ffcc87
```

### If starting fresh:
```bash
cd /home/user/propiq/frontend

# Install dependencies
npm install

# Build
npx vite build

# Deploy
netlify login  # Authenticate first
netlify deploy --prod --dir=dist
```

---

## Custom Domain Setup

### Current Expected Domain
`propiq.luntra.one`

### To Configure:
1. Go to Netlify dashboard → Domain settings
2. Add custom domain: `propiq.luntra.one`
3. Update DNS:
   ```
   CNAME propiq.luntra.one → [your-site].netlify.app
   ```
4. Enable HTTPS (automatic via Let's Encrypt)

---

## Continuous Deployment Setup

Once Git deployment is configured:

```bash
# Make changes
cd /home/user/propiq/frontend
# ... edit files ...

# Deploy
git add .
git commit -m "Update frontend"
git push origin main

# Netlify will automatically:
# 1. Detect the push
# 2. Run npm install
# 3. Run npm run build
# 4. Deploy dist/ folder
# 5. Notify you when done
```

---

## Build Performance Notes

### Current Build Time
- Dependencies install: ~23 seconds
- Vite build: ~15 seconds
- **Total**: ~38 seconds

### Bundle Size Optimization

⚠️ **Warning**: Some chunks are larger than 500 kB

**Recommendations** (for future optimization):
1. Implement code splitting with dynamic imports
2. Use lazy loading for routes
3. Split vendor libraries into smaller chunks

Example:
```javascript
// Instead of:
import SomeComponent from './SomeComponent'

// Use lazy loading:
const SomeComponent = lazy(() => import('./SomeComponent'))
```

---

## Sentry Warning

⚠️ **Build Warning**: Sentry integration has compatibility issues

**Current Status**:
- Build succeeds with warnings
- Sentry error tracking may not work
- Application functions normally

**To Fix** (optional):
```bash
npm install @sentry/react@latest --save
```

Or remove Sentry temporarily:
```typescript
// In src/config/sentry.ts
export function initSentry() {
  console.log('Sentry disabled')
  return
}
```

---

## Next Steps After Deployment

1. **Verify Deployment**: Visit site URL and test
2. **Set Up Monitoring**: Configure uptime monitoring
3. **Configure Custom Domain**: Set up propiq.luntra.one
4. **Enable Analytics**: Add Google Analytics or PostHog
5. **Test Feedback System**: Verify feedback endpoints work
6. **Performance Testing**: Run Lighthouse audit

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Status**: https://status.netlify.com
- **Support**: https://answers.netlify.com

---

## Summary

✅ **Frontend is built and ready**
✅ **Configuration is correct**
✅ **Site is linked to Netlify**
⏳ **Waiting for**: Netlify authentication

**To deploy now**: Run `netlify login` and then `netlify deploy --prod --dir=dist`

**Estimated time**: 2-3 minutes for authentication + deployment
