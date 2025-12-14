# Sentry Error Tracking Setup Guide for PropIQ

**Last Updated:** December 14, 2025
**Author:** Claude Code
**Status:** Implementation Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Sentry Account Setup](#sentry-account-setup)
3. [Frontend Integration (React + Vite)](#frontend-integration-react--vite)
4. [Backend Integration (FastAPI)](#backend-integration-fastapi)
5. [Error Boundaries & Custom Handling](#error-boundaries--custom-handling)
6. [Source Maps Configuration](#source-maps-configuration)
7. [Testing Error Tracking](#testing-error-tracking)
8. [Alerts & Monitoring](#alerts--monitoring)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Sentry?

Sentry is a real-time error tracking platform that helps you:
- **Monitor errors** in production before users report them
- **Debug faster** with stack traces, breadcrumbs, and context
- **Track performance** (page loads, API calls, database queries)
- **Set up alerts** for critical errors

### PropIQ Architecture

```
┌─────────────────┐        ┌─────────────────┐
│  React Frontend │───────▶│  Sentry Frontend│
│  (Vite + TS)    │        │  Project         │
└─────────────────┘        └─────────────────┘
        │
        ▼
┌─────────────────┐        ┌─────────────────┐
│  FastAPI Backend│───────▶│  Sentry Backend │
│  (Python)       │        │  Project         │
└─────────────────┘        └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Convex DB      │ (No Sentry integration needed)
└─────────────────┘
```

### Estimated Setup Time
- **Sentry Account:** 5 minutes
- **Frontend Integration:** 15 minutes
- **Backend Integration:** 15 minutes
- **Error Boundaries:** 20 minutes
- **Testing & Alerts:** 15 minutes
- **Total:** ~70 minutes

---

## Sentry Account Setup

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up with GitHub (recommended) or email
3. Choose the **Free Developer Plan** (up to 5,000 errors/month)

### Step 2: Create Two Projects

**Project 1: Frontend**
```
Name: propiq-frontend
Platform: React
Language: JavaScript/TypeScript
```

**Project 2: Backend**
```
Name: propiq-backend
Platform: Python (FastAPI)
Language: Python
```

### Step 3: Save Your DSN Keys

After creating each project, Sentry will show you a **DSN (Data Source Name)**:

```
Frontend DSN: https://abc123@o123456.ingest.sentry.io/7890123
Backend DSN: https://xyz789@o123456.ingest.sentry.io/7890456
```

**🔒 Security:** Never commit DSNs to git! Store in `.env` files.

---

## Frontend Integration (React + Vite)

### Step 1: Install Sentry Packages

```bash
cd /Users/briandusape/Projects/LUNTRA/propiq/frontend
npm install @sentry/react @sentry/vite-plugin
```

**Packages:**
- `@sentry/react` - React error tracking, performance monitoring
- `@sentry/vite-plugin` - Source map upload, release tracking

### Step 2: Create Environment Variables

Edit `frontend/.env.local`:

```bash
# Sentry Configuration (Frontend)
VITE_SENTRY_DSN=https://YOUR_FRONTEND_DSN_HERE
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_RELEASE=propiq-frontend@1.0.0

# For production (.env.production):
# VITE_SENTRY_ENVIRONMENT=production
```

**⚠️ Important:** Add `.env.local` to `.gitignore` if not already there!

### Step 3: Initialize Sentry in `main.tsx`

Edit `frontend/src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import './index.css'

// Initialize Sentry BEFORE ReactDOM.render
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    release: import.meta.env.VITE_SENTRY_RELEASE || 'development',

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true, // Privacy: mask user-entered text
        blockAllMedia: true, // Privacy: don't record videos/images
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // In production, reduce this to save quota (0.1 = 10%)
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Set `tracePropagationTargets` to control distributed tracing
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/luntra-outreach-app\.azurewebsites\.net/,
      /^https:\/\/.*\.luntra\.one/,
    ],

    // Session Replay: 10% of sessions, 100% of error sessions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Ignore common errors that aren't actionable
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors (handled by app logic)
      'NetworkError',
      'Failed to fetch',
      // ResizeObserver loop (benign Chrome bug)
      'ResizeObserver loop limit exceeded',
    ],

    // Add user context (after login)
    beforeSend(event, hint) {
      // Don't send errors in development (optional)
      if (import.meta.env.DEV) {
        console.error('Sentry would send:', event, hint);
        return null; // Comment this line to send errors in dev
      }
      return event;
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 4: Configure Vite Plugin for Source Maps

Edit `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Sentry plugin for source maps (production only)
    process.env.NODE_ENV === 'production' && sentryVitePlugin({
      org: 'your-sentry-org-slug', // Found in Sentry Settings > General
      project: 'propiq-frontend',
      authToken: process.env.SENTRY_AUTH_TOKEN, // Generate in Sentry Settings > Auth Tokens

      // Upload source maps for better stack traces
      sourcemaps: {
        assets: './dist/**',
        ignore: ['node_modules'],
      },

      release: {
        name: process.env.VITE_SENTRY_RELEASE || 'development',
      },
    }),
  ].filter(Boolean), // Remove falsy values

  build: {
    // Generate source maps for Sentry
    sourcemap: true,
  },
})
```

**Note:** You'll need to generate a Sentry auth token:
1. Go to Sentry → Settings → Auth Tokens
2. Create new token with `project:releases` and `project:write` scopes
3. Add to `.env.local`: `SENTRY_AUTH_TOKEN=your_token_here`

---

## Backend Integration (FastAPI)

### Step 1: Install Sentry SDK

```bash
cd /Users/briandusape/Projects/LUNTRA/propiq/backend
source venv/bin/activate  # Activate virtual environment
pip install sentry-sdk[fastapi]
```

Add to `backend/requirements.txt`:

```txt
sentry-sdk[fastapi]==1.45.0
```

### Step 2: Create Environment Variables

Edit `backend/.env`:

```bash
# Sentry Configuration (Backend)
SENTRY_DSN=https://YOUR_BACKEND_DSN_HERE
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=propiq-backend@1.0.0

# For production (Azure App Settings):
# SENTRY_ENVIRONMENT=production
```

### Step 3: Initialize Sentry in `api.py`

Edit `backend/api.py` (at the very top, before FastAPI app creation):

```python
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize Sentry BEFORE FastAPI app
if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        environment=os.getenv("SENTRY_ENVIRONMENT", "development"),
        release=os.getenv("SENTRY_RELEASE", "development"),

        # Integrations
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            StarletteIntegration(),
        ],

        # Performance monitoring (reduce in production)
        traces_sample_rate=1.0 if os.getenv("SENTRY_ENVIRONMENT") == "development" else 0.1,

        # Set a uniform sample rate for profiling (optional)
        profiles_sample_rate=0.1,

        # Send PII (Personally Identifiable Information) - BE CAREFUL
        send_default_pii=False,  # Set to False for GDPR compliance

        # Before send hook
        before_send=before_send_handler,
    )

def before_send_handler(event, hint):
    """
    Filter or modify events before sending to Sentry.
    """
    # Don't send errors in development (optional)
    if os.getenv("SENTRY_ENVIRONMENT") == "development":
        print(f"[Sentry] Would send: {event}")
        # return None  # Uncomment to disable in dev

    # Scrub sensitive data
    if "request" in event:
        # Remove authorization headers
        if "headers" in event["request"]:
            event["request"]["headers"].pop("Authorization", None)
            event["request"]["headers"].pop("Cookie", None)

    return event

# Now create FastAPI app
app = FastAPI(
    title="PropIQ API",
    description="AI-powered property investment analysis",
    version="1.0.0"
)

# ... rest of your api.py
```

### Step 4: Add User Context to Errors

Edit `backend/routers/auth.py` to set user context:

```python
from fastapi import Depends
import sentry_sdk

@router.post("/login")
async def login(credentials: LoginRequest):
    # ... existing login logic ...

    # After successful login, set Sentry user context
    if user:
        sentry_sdk.set_user({
            "id": str(user["_id"]),
            "email": user["email"],
            "subscription_tier": user.get("subscriptionTier", "free"),
        })

    return {"token": token}
```

In your JWT verification function:

```python
def verify_token(token: str):
    # ... existing token verification ...

    # Set user context for all authenticated requests
    sentry_sdk.set_user({
        "id": payload.get("user_id"),
        "email": payload.get("email"),
    })

    return payload
```

### Step 5: Add Custom Error Tracking

Edit `backend/routers/propiq.py` to track AI analysis errors:

```python
import sentry_sdk

@router.post("/analyze")
async def analyze_property(
    request: AnalysisRequest,
    token_payload: dict = Depends(verify_token)
):
    try:
        # ... existing analysis logic ...

        # Track successful analysis as breadcrumb
        sentry_sdk.add_breadcrumb(
            category="ai_analysis",
            message=f"Analyzed property: {request.address}",
            level="info",
            data={
                "address": request.address,
                "purchase_price": request.purchase_price,
                "user_tier": token_payload.get("subscriptionTier"),
            }
        )

        return analysis_result

    except Exception as e:
        # Capture error with context
        sentry_sdk.capture_exception(
            e,
            extra={
                "address": request.address,
                "user_id": token_payload.get("user_id"),
                "subscription_tier": token_payload.get("subscriptionTier"),
                "request_data": request.dict(),
            }
        )
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Error Boundaries & Custom Handling

### Step 1: Create Error Boundary Component

Create `frontend/src/components/ErrorBoundary.tsx`:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // Send to Sentry
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      const eventId = Sentry.captureException(error);
      this.setState({ eventId, errorInfo });
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleReportFeedback = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({
        eventId: this.state.eventId,
        title: 'It looks like we\'re having issues.',
        subtitle: 'Our team has been notified.',
        subtitle2: 'If you\'d like to help, tell us what happened below.',
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <AlertTriangle className="error-icon" size={64} />
            <h1>Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry for the inconvenience. Our team has been notified and is working on a fix.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-primary">
                <RefreshCw size={20} />
                Try Again
              </button>
              <button onClick={() => window.location.href = '/'} className="btn-secondary">
                <Home size={20} />
                Go Home
              </button>
              {this.state.eventId && (
                <button onClick={this.handleReportFeedback} className="btn-secondary">
                  Report Issue
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap with Sentry's error boundary for better integration
export const SentryErrorBoundary = Sentry.withErrorBoundary(ErrorBoundary, {
  fallback: ({ error, resetError }) => (
    <div className="error-boundary-container">
      <div className="error-boundary-content">
        <AlertTriangle className="error-icon" size={64} />
        <h1>Application Error</h1>
        <p>An unexpected error occurred: {error.message}</p>
        <button onClick={resetError} className="btn-primary">
          <RefreshCw size={20} />
          Reset Application
        </button>
      </div>
    </div>
  ),
  showDialog: true, // Show Sentry feedback dialog
});
```

Create `frontend/src/components/ErrorBoundary.css`:

```css
.error-boundary-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-boundary-content {
  background: white;
  border-radius: 16px;
  padding: 48px;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.error-icon {
  color: #f59e0b;
  margin-bottom: 24px;
}

.error-boundary-content h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1f2937;
}

.error-message {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 32px;
  line-height: 1.6;
}

.error-details {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.error-details pre {
  font-size: 12px;
  color: #dc2626;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #8b5cf6;
  color: white;
}

.btn-primary:hover {
  background: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}
```

### Step 2: Wrap App with Error Boundary

Edit `frontend/src/App.tsx`:

```typescript
import { Suspense, lazy } from 'react';
import { SentryErrorBoundary } from './components/ErrorBoundary';

const HelpCenter = lazy(() => import('./components/HelpCenter').then(m => ({ default: m.HelpCenter })));

function App() {
  return (
    <SentryErrorBoundary>
      <div className="App">
        {/* Existing app code */}

        <Suspense fallback={<LoadingSpinner />}>
          <SentryErrorBoundary>
            {showHelpCenter && (
              <HelpCenter
                isOpen={showHelpCenter}
                onClose={() => setShowHelpCenter(false)}
                userId={userId}
              />
            )}
          </SentryErrorBoundary>
        </Suspense>
      </div>
    </SentryErrorBoundary>
  );
}

export default App;
```

### Step 3: Add Custom Error Tracking

Edit `frontend/src/components/HelpCenter.tsx`:

```typescript
import * as Sentry from '@sentry/react';

export const HelpCenter = ({ isOpen, onClose, userId }: HelpCenterProps) => {
  // ... existing code ...

  useEffect(() => {
    const sanitizedQuery = sanitizeSearchQuery(searchQuery);

    if (sanitizedQuery.length > 2) {
      setIsSearching(true);

      if (searchArticles) {
        setSearchResults(searchArticles);
        setIsSearching(false);

        // Log failed search to Sentry
        if (searchArticles.length === 0) {
          Sentry.addBreadcrumb({
            category: 'help_center',
            message: 'Failed search query',
            level: 'info',
            data: {
              query: sanitizedQuery,
              userId: userId || 'anonymous',
            },
          });

          // Also log to Convex (existing code)
          logFailedSearch({
            query: sanitizedQuery,
            userId: userId || undefined,
            page: "help-center",
            resultsCount: 0,
          });
        }
      }
    }
  }, [searchQuery, searchArticles, userId]);

  // Track article views
  const handleArticleClick = async (article: any) => {
    Sentry.addBreadcrumb({
      category: 'help_center',
      message: 'Article viewed',
      level: 'info',
      data: {
        articleTitle: article.title,
        articleSlug: article.slug,
        userId: userId || 'anonymous',
      },
    });

    // ... rest of existing code ...
  };
};
```

---

## Source Maps Configuration

### Why Source Maps?

Without source maps, Sentry shows minified code:
```
Error at index.abc123.js:1:45678
```

With source maps:
```
Error at HelpCenter.tsx:108 in handleFeedback()
```

### Frontend Source Maps (Already Configured Above)

In `vite.config.ts`:
```typescript
build: {
  sourcemap: true, // ✅ Generates source maps
},
```

Sentry Vite plugin will automatically upload them to Sentry during production builds.

### Backend Source Maps (Not Needed for Python)

Python doesn't minify, so stack traces are already readable. No action needed.

---

## Testing Error Tracking

### Step 1: Test Frontend Error Tracking

Create `frontend/src/utils/testSentry.ts`:

```typescript
import * as Sentry from '@sentry/react';

export function testSentryFrontend() {
  console.log('[Sentry Test] Triggering test error...');

  // 1. Test basic error
  try {
    throw new Error('Sentry frontend test error');
  } catch (e) {
    Sentry.captureException(e);
  }

  // 2. Test with context
  Sentry.withScope((scope) => {
    scope.setTag('test_type', 'manual');
    scope.setExtra('test_data', { foo: 'bar' });
    scope.setLevel('warning');
    Sentry.captureMessage('Sentry test message with context');
  });

  // 3. Test breadcrumb
  Sentry.addBreadcrumb({
    category: 'test',
    message: 'Test breadcrumb',
    level: 'info',
  });

  // 4. Test unhandled error (will show in error boundary)
  setTimeout(() => {
    throw new Error('Unhandled error test');
  }, 1000);

  console.log('[Sentry Test] Check Sentry dashboard for errors!');
}
```

Add a test button in Dashboard (temporary):

```tsx
// In Dashboard.tsx
import { testSentryFrontend } from '../utils/testSentry';

{import.meta.env.DEV && (
  <button onClick={testSentryFrontend}>
    🧪 Test Sentry
  </button>
)}
```

### Step 2: Test Backend Error Tracking

Add test endpoint in `backend/api.py`:

```python
@app.get("/test-sentry")
async def test_sentry():
    """Test endpoint to verify Sentry is working (dev only)"""
    if os.getenv("SENTRY_ENVIRONMENT") != "development":
        raise HTTPException(status_code=404, detail="Not found")

    # Test 1: Capture exception
    try:
        1 / 0
    except Exception as e:
        sentry_sdk.capture_exception(e)

    # Test 2: Capture message
    sentry_sdk.capture_message("Sentry backend test message", level="warning")

    # Test 3: Add breadcrumb
    sentry_sdk.add_breadcrumb(
        category="test",
        message="Test breadcrumb from backend",
        level="info",
    )

    # Test 4: Unhandled exception
    raise Exception("Unhandled backend test error")
```

Test it:

```bash
curl http://localhost:8000/test-sentry
```

### Step 3: Verify in Sentry Dashboard

1. Go to [sentry.io](https://sentry.io)
2. Select `propiq-frontend` project → Issues
3. You should see:
   - ✅ "Sentry frontend test error"
   - ✅ "Sentry test message with context"
   - ✅ "Unhandled error test"
4. Select `propiq-backend` project → Issues
5. You should see:
   - ✅ "division by zero"
   - ✅ "Unhandled backend test error"

**Expected Timeline:** Errors appear within 10-30 seconds

---

## Alerts & Monitoring

### Step 1: Set Up Alert Rules

In Sentry dashboard:

1. **Go to:** Alerts → Create Alert
2. **Choose:** Issues
3. **Set conditions:**

**Alert #1: Critical Errors**
```
When: An event is seen
If: issue.level equals error
And: issue affects more than 5 users
Then: Send notification to email + Slack
```

**Alert #2: High Error Rate**
```
When: Number of events
If: count >= 50 in 1 hour
Then: Send notification to email
```

**Alert #3: New Issues**
```
When: A new issue is created
If: issue.level equals error OR fatal
Then: Send notification to email
```

### Step 2: Configure Notification Channels

**Email:**
- ✅ Enabled by default
- Customize in Settings → Account → Notifications

**Slack (Optional):**
1. Settings → Integrations → Slack
2. Connect Slack workspace
3. Choose channel (e.g., `#propiq-errors`)
4. Test integration

**Discord (Optional):**
1. Settings → Integrations → Discord
2. Webhook URL from Discord channel settings
3. Test integration

### Step 3: Set Up Issue Ownership (Optional)

Create `frontend/.github/CODEOWNERS`:

```
# Automatically assign issues based on file paths

# Help Center errors → Brian
/frontend/src/components/HelpCenter.tsx @briandusape
/convex/articles.ts @briandusape

# Calculator errors → Brian
/frontend/src/components/DealCalculator.tsx @briandusape
/frontend/src/utils/calculatorUtils.ts @briandusape

# Backend errors → Brian
/backend/routers/* @briandusape
```

---

## Best Practices

### 1. **Error Sampling in Production**

```typescript
// frontend/src/main.tsx
tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev
```

**Why?** Free Sentry plan has 5,000 errors/month. Sampling reduces quota usage.

### 2. **Scrub Sensitive Data**

```typescript
// frontend/src/main.tsx
Sentry.init({
  beforeSend(event) {
    // Remove passwords, tokens, credit cards
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.token;
      delete event.request.data.cardNumber;
    }
    return event;
  },
});
```

### 3. **Set User Context After Login**

```typescript
// After successful login:
Sentry.setUser({
  id: userId,
  email: userEmail,
  subscription: userTier,
});

// After logout:
Sentry.setUser(null);
```

### 4. **Use Tags for Better Filtering**

```typescript
Sentry.setTag('feature', 'help_center');
Sentry.setTag('subscription_tier', userTier);
Sentry.setTag('browser', navigator.userAgent);
```

In Sentry, you can filter: `feature:help_center subscription_tier:pro`

### 5. **Add Breadcrumbs for Context**

```typescript
// Before critical operations
Sentry.addBreadcrumb({
  category: 'property_analysis',
  message: 'Starting AI analysis',
  level: 'info',
  data: { address: propertyAddress },
});
```

Breadcrumbs show user actions leading up to error.

### 6. **Track Performance**

```typescript
// frontend/src/components/HelpCenter.tsx
const handleArticleClick = async (article: any) => {
  const transaction = Sentry.startTransaction({
    name: 'load_article',
    op: 'help_center.article_view',
  });

  try {
    await incrementViewCount({ articleId: article._id });
    setSelectedArticle(article);
  } finally {
    transaction.finish();
  }
};
```

### 7. **Ignore Noise**

```typescript
// frontend/src/main.tsx
ignoreErrors: [
  'ResizeObserver loop limit exceeded', // Benign Chrome bug
  'Non-Error promise rejection captured', // Handled by app
  'ChunkLoadError', // User navigated away during load
],
```

### 8. **Release Tracking**

Use semantic versioning for releases:

```bash
# frontend/.env.production
VITE_SENTRY_RELEASE=propiq-frontend@1.2.3

# backend/.env
SENTRY_RELEASE=propiq-backend@1.2.3
```

In Sentry, you can see which errors were introduced in which release.

---

## Troubleshooting

### Issue: Errors Not Appearing in Sentry

**Checklist:**
- ✅ Is `VITE_SENTRY_DSN` / `SENTRY_DSN` set in `.env`?
- ✅ Is Sentry initialized before app renders?
- ✅ Are you in production mode? (Check `beforeSend` filter)
- ✅ Is network blocked? (Check browser console for `sentry.io` requests)
- ✅ Is DSN correct? (Copy/paste from Sentry dashboard)

**Test:**
```typescript
console.log('Sentry DSN:', import.meta.env.VITE_SENTRY_DSN);
console.log('Sentry initialized:', !!Sentry.getCurrentHub().getClient());
```

### Issue: Source Maps Not Working

**Checklist:**
- ✅ Is `sourcemap: true` in `vite.config.ts`?
- ✅ Is `SENTRY_AUTH_TOKEN` set?
- ✅ Did Sentry Vite plugin run? (Check build output for "Uploading source maps...")
- ✅ Is release name the same in frontend and Sentry?

**Test:**
```bash
npm run build
# Look for: "Uploading source maps to Sentry..."
```

### Issue: Too Many Errors (Quota Exceeded)

**Solution 1:** Increase sampling
```typescript
tracesSampleRate: 0.05, // 5% instead of 10%
```

**Solution 2:** Add more ignore rules
```typescript
ignoreErrors: [
  /NetworkError/i,
  /Failed to fetch/i,
],
```

**Solution 3:** Upgrade to paid plan ($26/month for 50K errors)

### Issue: Errors Missing Context

**Solution:** Add more tags and breadcrumbs

```typescript
// Every time user does something important:
Sentry.addBreadcrumb({
  category: 'user_action',
  message: 'User clicked Help Center',
  data: { timestamp: Date.now() },
});

// Set tags for filtering:
Sentry.setTag('page', 'dashboard');
Sentry.setTag('user_tier', subscriptionTier);
```

---

## Next Steps After Setup

### Week 1: Monitor & Tune
1. ✅ Check Sentry daily for new issues
2. ✅ Fix critical errors (level: fatal, error)
3. ✅ Add ignore rules for benign errors
4. ✅ Adjust sampling rate based on quota usage

### Week 2-4: Optimize
1. ✅ Set up Slack/Discord alerts
2. ✅ Create custom dashboards in Sentry
3. ✅ Track error resolution time
4. ✅ Add more breadcrumbs for context

### Month 2+: Advanced
1. ✅ Set up release tracking (semantic versioning)
2. ✅ Create error ownership rules
3. ✅ Track error trends (is error rate increasing?)
4. ✅ Implement error budgets (max 10 errors/day)

---

## Useful Resources

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry FastAPI Docs](https://docs.sentry.io/platforms/python/integrations/fastapi/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)

---

## Summary Checklist

**Before Production:**
- [ ] Frontend Sentry installed and configured
- [ ] Backend Sentry installed and configured
- [ ] Error boundaries added to critical components
- [ ] Source maps configured and uploading
- [ ] Test errors sent successfully
- [ ] Alerts configured (email + Slack/Discord)
- [ ] Sensitive data scrubbed in `beforeSend`
- [ ] User context set after login
- [ ] Sampling rates configured for production
- [ ] Ignore rules added for benign errors

**After Production Launch:**
- [ ] Monitor Sentry dashboard daily (first week)
- [ ] Fix critical errors within 24 hours
- [ ] Review failed searches weekly
- [ ] Adjust ignore rules based on noise
- [ ] Check quota usage (stay under 5,000/month)

---

**Author:** Claude Code
**Last Updated:** December 14, 2025
**Estimated ROI:** Catch bugs before users complain, faster debugging, better product quality

🚀 **Ready to ship with confidence!**
