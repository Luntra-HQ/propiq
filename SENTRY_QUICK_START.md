# Sentry Quick Start Guide

**⏱️ Total Time:** ~15 minutes
**📚 Full Guide:** See `SENTRY_SETUP_GUIDE.md` for detailed documentation

---

## 🚀 Fast Track Setup (5 Steps)

### Step 1: Create Sentry Account (5 min)

1. **Sign up:** https://sentry.io/signup/
2. **Create 2 projects:**
   - `propiq-frontend` (Platform: React)
   - `propiq-backend` (Platform: Python/FastAPI)
3. **Save DSN keys** from each project (looks like `https://abc123@o456.ingest.sentry.io/789`)

### Step 2: Run Automated Setup (2 min)

```bash
cd /Users/briandusape/Projects/LUNTRA/propiq
./setup-sentry.sh
```

This script will:
- ✅ Install `@sentry/react` and `@sentry/vite-plugin` (frontend)
- ✅ Install `sentry-sdk[fastapi]` (backend)
- ✅ Create `.env.local` and `.env` files
- ✅ Update `requirements.txt`

### Step 3: Add Your DSN Keys (2 min)

**Frontend** (`frontend/.env.local`):
```bash
VITE_SENTRY_DSN=https://YOUR_FRONTEND_DSN_HERE
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_RELEASE=propiq-frontend@1.0.0
```

**Backend** (`backend/.env`):
```bash
SENTRY_DSN=https://YOUR_BACKEND_DSN_HERE
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=propiq-backend@1.0.0
```

### Step 4: Initialize Sentry in Code (5 min)

**Frontend** - Add to `frontend/src/main.tsx` (BEFORE ReactDOM.render):

```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

**Backend** - Add to `backend/api.py` (BEFORE creating FastAPI app):

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        environment=os.getenv("SENTRY_ENVIRONMENT", "development"),
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0,
    )
```

### Step 5: Test It Works (1 min)

**Frontend test:**
```bash
cd frontend
npm run dev
```
Open browser console and run:
```javascript
// In browser console:
import('/src/utils/testSentry.ts').then(m => m.testSentryFrontend())
```

**Backend test:**
```bash
curl http://localhost:8000/test-sentry
```

**Verify:** Check https://sentry.io → Issues (should see test errors within 30 seconds)

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Change `VITE_SENTRY_ENVIRONMENT=production` in `.env.production`
- [ ] Change `SENTRY_ENVIRONMENT=production` in Azure App Settings
- [ ] Set `tracesSampleRate: 0.1` (10% instead of 100%)
- [ ] Add `.env.local` and `.env` to `.gitignore` (should already be there)
- [ ] Set up Sentry alerts (email/Slack)
- [ ] Wrap App with `<SentryErrorBoundary>` (see full guide)
- [ ] Configure source maps (optional but recommended)

---

## 📊 Key Features Enabled

✅ **Error Tracking** - Automatic capture of unhandled exceptions
✅ **Performance Monitoring** - Track slow operations
✅ **Session Replay** - Watch user sessions leading to errors
✅ **Breadcrumbs** - See user actions before errors
✅ **User Context** - Know which users are affected
✅ **Release Tracking** - See which version introduced bugs

---

## 🔥 Common Commands

```bash
# Install dependencies
npm install @sentry/react @sentry/vite-plugin      # Frontend
pip install 'sentry-sdk[fastapi]==1.45.0'          # Backend

# Run dev servers
npm run dev                                        # Frontend (port 5173)
uvicorn api:app --reload                           # Backend (port 8000)

# Test Sentry
curl http://localhost:8000/test-sentry             # Backend test
# (Frontend test in browser console)

# Build for production
npm run build                                      # Frontend
docker build -t propiq-backend .                   # Backend
```

---

## 🆘 Troubleshooting

**Problem:** Errors not showing in Sentry
**Solution:**
1. Check `VITE_SENTRY_DSN` / `SENTRY_DSN` is set correctly
2. Check browser/server console for Sentry errors
3. Verify Sentry is initialized (check logs)
4. Make sure you're not blocking errors in `beforeSend()`

**Problem:** Source maps not working
**Solution:**
1. Set `sourcemap: true` in `vite.config.ts`
2. Generate Sentry auth token
3. Add `SENTRY_AUTH_TOKEN` to `.env.local`

**Problem:** Too many errors (quota exceeded)
**Solution:**
1. Reduce `tracesSampleRate` to 0.05 (5%)
2. Add ignore rules for common benign errors
3. Consider upgrading Sentry plan ($26/month for 50K errors)

---

## 📚 Resources

- **Full Guide:** `SENTRY_SETUP_GUIDE.md` (70+ page detailed guide)
- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/react/
- **Dashboard:** https://sentry.io/
- **Support:** support@sentry.io

---

## 🎯 Next Steps

1. ✅ Complete Steps 1-5 above
2. 📖 Read `SENTRY_SETUP_GUIDE.md` for advanced configuration
3. 🛡️ Add Error Boundaries to critical components
4. 🔔 Set up Slack/email alerts
5. 📊 Monitor dashboard for first week
6. 🚀 Deploy to production

---

**Last Updated:** December 14, 2025
**Author:** Claude Code
**Status:** Ready to Use
