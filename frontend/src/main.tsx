import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { AuthProvider } from './hooks/useAuth'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import WelcomePage from './pages/WelcomePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import FAQPage from './pages/FAQPage'
import PricingPagePublic from './pages/PricingPagePublic'
import App from './App'

// Components
import { ProtectedRoute, AuthRoute } from './components/ProtectedRoute'
import { SentryErrorBoundary } from './components/ErrorBoundary'

import './index.css'

// Initialize Sentry error tracking before rendering
import { initSentry } from './config/sentry'
initSentry()

// Initialize Convex client
const convexUrl = import.meta.env.VITE_CONVEX_URL;
console.log('🔍 Convex URL:', convexUrl || 'NOT SET - using placeholder');

if (!convexUrl) {
  console.error('⚠️ VITE_CONVEX_URL is not set. Convex features will not work. Please add it to your environment variables.');
  console.log('📍 Current environment:', import.meta.env.MODE);
}

let convex;
try {
  convex = new ConvexReactClient(convexUrl || 'https://placeholder.convex.cloud');
  console.log('✅ Convex client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Convex client:', error);
  throw error; // Re-throw so error boundary catches it
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary>
      <BrowserRouter>
        <ConvexProvider client={convex}>
          <AuthProvider>
            <Routes>
            {/* Public routes - accessible to everyone */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPagePublic />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/welcome" element={<WelcomePage />} />

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
          </AuthProvider>
        </ConvexProvider>
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>,
)
