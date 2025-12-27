# PropIQ Deployment Diagnostic Log
**Issue:** Users seeing old cached frontend despite successful deployments
**Date:** 2025-12-24

## Browser Symptoms
- Error: `TypeError: undefined is not an object (evaluating 'x.auth.verifyResetToken')`
- Old asset hash: `ResetPasswordPage-TX4sDyHG.js`
- Persists after hard refresh (Cmd+Shift+R)

## What We've Tried
1. ✅ Fixed bcryptjs import in Convex
2. ✅ Deployed Convex: `npx convex deploy --yes`
3. ✅ Rebuilt frontend: `npm run build`
4. ✅ Deployed to Netlify: `netlify deploy --prod --dir=dist`
5. ❌ Users still see old version

## Deployment Stack
- **Backend:** Convex (https://mild-tern-361.convex.cloud)
- **Frontend:** React + Vite + TypeScript
- **Hosting:** Netlify (propiq.luntra.one)
- **Build Tool:** Vite 7.3.0

## Next Steps Needed
- [ ] Verify actual files on Netlify CDN
- [ ] Check for Service Worker caching
- [ ] Verify Convex API matches frontend expectations
- [ ] Test from completely fresh browser/device
