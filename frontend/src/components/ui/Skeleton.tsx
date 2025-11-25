/**
 * Skeleton Components - 2025 Design System
 *
 * Content-aware loading skeletons with shimmer animations.
 * Provides visual feedback while content loads.
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * Base Skeleton - Animated placeholder
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`skeleton bg-slate-700/50 ${roundedStyles[rounded]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * SkeletonText - Text line placeholder
 */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
  lastLineWidth = '60%',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={16}
        width={i === lines - 1 ? lastLineWidth : '100%'}
        rounded="sm"
      />
    ))}
  </div>
);

/**
 * SkeletonCard - Card placeholder for dashboard
 */
interface SkeletonCardProps {
  className?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  hasHeader = true,
  hasFooter = false,
  lines = 3,
}) => (
  <div className={`p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 ${className}`}>
    {hasHeader && (
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width={40} height={40} rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton height={18} width="60%" rounded="sm" />
          <Skeleton height={14} width="40%" rounded="sm" />
        </div>
      </div>
    )}
    <SkeletonText lines={lines} />
    {hasFooter && (
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <Skeleton height={40} width="100%" rounded="lg" />
      </div>
    )}
  </div>
);

/**
 * SkeletonStat - Stat card placeholder
 */
export const SkeletonStat: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 ${className}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton height={14} width="50%" rounded="sm" />
        <Skeleton height={32} width="60%" rounded="md" />
        <Skeleton height={12} width="40%" rounded="sm" />
      </div>
      <Skeleton width={48} height={48} rounded="xl" />
    </div>
  </div>
);

/**
 * SkeletonHero - Hero card placeholder (PropIQ)
 */
export const SkeletonHero: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-8 rounded-3xl bg-gradient-to-br from-violet-500/5 to-slate-800/50 border border-violet-500/20 ${className}`}>
    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        <Skeleton width={56} height={56} rounded="xl" />
        <div className="space-y-2">
          <Skeleton height={24} width={180} rounded="md" />
          <Skeleton height={16} width={220} rounded="sm" />
        </div>
      </div>
      <Skeleton width={100} height={32} rounded="full" />
    </div>

    {/* Description */}
    <SkeletonText lines={2} className="mb-6" />

    {/* Progress section */}
    <div className="bg-slate-900/30 rounded-xl p-4 mb-6">
      <div className="flex justify-between mb-3">
        <Skeleton height={14} width={100} rounded="sm" />
        <Skeleton height={14} width={120} rounded="sm" />
      </div>
      <Skeleton height={12} width="100%" rounded="full" />
    </div>

    {/* CTA Button */}
    <Skeleton height={56} width="100%" rounded="xl" />
  </div>
);

/**
 * SkeletonTable - Table placeholder
 */
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => (
  <div className={`rounded-xl overflow-hidden border border-slate-700/50 ${className}`}>
    {/* Header */}
    <div className="bg-slate-800/80 p-4 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height={16} className="flex-1" rounded="sm" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className="p-4 flex gap-4 border-t border-slate-700/30"
      >
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton
            key={colIdx}
            height={14}
            width={colIdx === 0 ? '80%' : '60%'}
            className="flex-1"
            rounded="sm"
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * SkeletonAvatar - User avatar placeholder
 */
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const avatarSizes = {
  sm: 32,
  md: 40,
  lg: 56,
};

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  className = '',
}) => (
  <Skeleton
    width={avatarSizes[size]}
    height={avatarSizes[size]}
    rounded="full"
    className={className}
  />
);

/**
 * SkeletonDashboard - Full dashboard loading state
 */
export const SkeletonDashboard: React.FC = () => (
  <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 md:py-12">
    {/* Greeting */}
    <div className="mb-8">
      <Skeleton height={32} width={280} rounded="md" className="mb-2" />
      <Skeleton height={18} width={320} rounded="sm" />
    </div>

    {/* Main Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
      {/* Hero Card */}
      <div className="lg:col-span-2 lg:row-span-2">
        <SkeletonHero className="h-full" />
      </div>

      {/* Stats Column */}
      <div className="space-y-5 md:space-y-6">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>
    </div>

    {/* Second Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
      <div className="lg:col-span-2">
        <SkeletonCard hasHeader hasFooter lines={4} />
      </div>
      <div>
        <SkeletonCard hasHeader lines={4} />
      </div>
    </div>
  </div>
);

export default Skeleton;
