/**
 * ProtectedRoute Component
 *
 * Bulletproof route protection that ensures:
 * - Loading spinner shown while checking auth
 * - NEVER renders children until auth is confirmed
 * - Redirects to login if not authenticated
 * - No flash of protected content possible
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSkeleton } from './LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔴 [8-PROTECTED-ROUTE] ProtectedRoute checking auth');
  console.log('🔴 [8a-PROTECTED-STATE] isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  console.log('🔴 [8b-PROTECTED-LOCATION] Current location:', location.pathname);

  // State 1: Loading - show skeleton, NEVER render children
  if (isLoading) {
    console.log('🔴 [8-LOADING] Still loading - showing skeleton');
    return <LoadingSkeleton />;
  }

  // State 2: Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log('🔴 [8-NOT-AUTH] Not authenticated - redirecting to login');
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // State 3: Authenticated - render children
  console.log('🔴 [9-AUTH-PASSED] Authentication passed - rendering App');
  return <>{children}</>;
};

/**
 * PublicRoute Component
 *
 * For routes that should redirect authenticated users to the app
 * (e.g., login page - if already logged in, go to dashboard)
 */
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/app'
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Redirect authenticated users to the app
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * AuthRoute Component
 *
 * For login/signup pages - shows login UI if not authenticated,
 * redirects to app if authenticated
 */
export const AuthRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/app'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Redirect authenticated users to the app (or where they came from)
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
