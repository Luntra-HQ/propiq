/**
 * LoadingSkeleton Component
 *
 * Full-screen loading state shown while checking authentication.
 * Prevents any flash of protected content.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSkeletonProps {
  message?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  message = 'Loading...'
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-bold text-white">PropIQ</span>
        </div>
      </div>

      {/* Spinner */}
      <Loader2 className="h-10 w-10 text-violet-500 animate-spin mb-4" />

      {/* Message */}
      <p className="text-gray-400 text-sm">{message}</p>

      {/* Skeleton preview (mimics app layout) */}
      <div className="mt-12 w-full max-w-4xl px-4">
        <div className="space-y-4 animate-pulse">
          {/* Header skeleton */}
          <div className="h-16 bg-slate-800 rounded-lg" />

          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-slate-800 rounded-lg" />
            <div className="h-32 bg-slate-800 rounded-lg" />
            <div className="h-32 bg-slate-800 rounded-lg" />
          </div>

          {/* Main content skeleton */}
          <div className="h-64 bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Inline loading spinner for smaller components
 */
export const InlineLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`${sizeClasses[size]} text-violet-500 animate-spin`} />
    </div>
  );
};

export default LoadingSkeleton;
