import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { AuthProvider } from './hooks/useAuth'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import App from './App'

// Components
import { ProtectedRoute, AuthRoute } from './components/ProtectedRoute'

import './index.css'

// Initialize Sentry error tracking before rendering
import { initSentry } from './config/sentry'
initSentry()

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConvexProvider client={convex}>
        <AuthProvider>
          <Routes>
            {/* Public routes - accessible to everyone */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<LandingPage />} />

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
  </React.StrictMode>,
)
