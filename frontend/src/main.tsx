import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { AuthProvider } from './hooks/useAuth'
import { Loader2 } from 'lucide-react'

// Components (loaded eagerly - small, critical for routing)
import { ProtectedRoute, AuthRoute } from './components/ProtectedRoute'
import { SentryErrorBoundary } from './components/ErrorBoundary'

// Lazy load all pages for route-based code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))
const PricingPageWrapper = lazy(() => import('./pages/PricingPageWrapper'))
const ReferralLandingPage = lazy(() => import('./pages/ReferralLandingPage'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const App = lazy(() => import('./App'))

import './index.css'

// Suspense fallback for route transitions
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
  </div>
)

// Initialize Sentry error tracking before rendering
import { initSentry } from './config/sentry'
initSentry()

// Tag test user sessions in Clarity (exclude your own testing from analytics)
const isTestUser = window.location.hostname === 'localhost' ||
                   localStorage.getItem('clarity_test_user') === 'true';

if (isTestUser && typeof (window as any).clarity === 'function') {
  (window as any).clarity('set', 'test_user', 'true');
  (window as any).clarity('set', 'user_type', 'developer');
  console.log('📊 Clarity: Marked session as test_user (will be filtered out)');
}

// Initialize Convex client
// The Convex React client must use `.convex.cloud` (WebSocket + HTTP).
// `.convex.site` is for HTTP endpoints only.
const rawConvexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convexUrl = (rawConvexUrl || '')
  .replace(/\.convex\.site$/, '.convex.cloud')
  .replace(/\/+$/, '');

console.log('[CONVEX] VITE_CONVEX_URL (raw):', rawConvexUrl || 'NOT SET');
console.log('[CONVEX] ConvexReactClient URL:', convexUrl || 'NOT SET');

if (!rawConvexUrl) {
  console.error('⚠️ VITE_CONVEX_URL is not set. Convex features will not work.');
  console.log('📍 Current environment:', import.meta.env.MODE);
}

const convex = new ConvexReactClient(convexUrl || 'https://placeholder.convex.cloud');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary>
      <BrowserRouter>
        <ConvexProvider client={convex}>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes - accessible to everyone */}
                <Route path="/" element={<LandingPage />} />
                {/* Real pricing route (supports /pricing and /pricing/* for trailing slash) */}
                <Route path="/pricing/*" element={<PricingPageWrapper />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/welcome" element={<WelcomePage />} />

                {/* Blog routes - PUBLIC for SEO */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />

                {/* Referral landing page - /r/CODE */}
                <Route path="/r/:code" element={<ReferralLandingPage />} />

                {/* Auth routes - redirect to /app if already logged in */}
                <Route
                  path="/login"
                  element={
                    <AuthRoute>
                      <LoginPage />
                    </AuthRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <AuthRoute>
                      <LoginPage />
                    </AuthRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={<ResetPasswordPage />}
                />

                {/* Protected routes - require authentication */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <App />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/*"
                  element={
                    <ProtectedRoute>
                      <App />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <App />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <App />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all - redirect to landing */}
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ConvexProvider>
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>,
)
