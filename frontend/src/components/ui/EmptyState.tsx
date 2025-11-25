/**
 * EmptyState Components - 2025 Design System
 *
 * Engaging empty states that guide users to take action.
 * Reduces confusion and drives engagement.
 */

import React from 'react';
import {
  Search,
  Target,
  FileText,
  History,
  Star,
  TrendingUp,
  Home,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from './Button';

type EmptyStateVariant = 'default' | 'search' | 'analysis' | 'history' | 'favorites' | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
}> = {
  default: {
    icon: Sparkles,
    title: 'Nothing here yet',
    description: 'Get started by taking your first action.',
    actionLabel: 'Get Started',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
    actionLabel: 'Clear Search',
  },
  analysis: {
    icon: Target,
    title: 'Ready to analyze?',
    description: 'Enter any US property address to get instant AI-powered analysis with investment insights.',
    actionLabel: 'Analyze a Property',
  },
  history: {
    icon: History,
    title: 'No analysis history',
    description: 'Your analyzed properties will appear here for quick reference.',
    actionLabel: 'Start First Analysis',
  },
  favorites: {
    icon: Star,
    title: 'No favorites yet',
    description: 'Save properties you\'re interested in to quickly access them later.',
    actionLabel: 'Browse Properties',
  },
  custom: {
    icon: FileText,
    title: 'Nothing to show',
    description: 'This section is empty.',
    actionLabel: 'Take Action',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  const config = variantConfig[variant];
  const Icon = icon ? () => <>{icon}</> : config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* Icon */}
      <div className="relative mb-6">
        {/* Background glow */}
        <div className="absolute inset-0 blur-2xl bg-violet-500/20 rounded-full scale-150" />

        {/* Icon container */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center shadow-xl">
          <Icon className="h-10 w-10 text-gray-400" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-white mb-2">{displayTitle}</h3>
      <p className="text-gray-400 max-w-sm mb-6">{displayDescription}</p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onAction && (
          <Button variant="primary" onClick={onAction} icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
            {displayActionLabel}
          </Button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <Button variant="secondary" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * EmptyStateCard - Compact empty state for cards/widgets
 */
interface EmptyStateCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className}`}>
    {icon && (
      <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-3">
        {icon}
      </div>
    )}
    <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
    {description && (
      <p className="text-xs text-gray-500 mb-3">{description}</p>
    )}
    {onAction && actionLabel && (
      <button
        onClick={onAction}
        className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
      >
        {actionLabel}
        <ArrowRight className="h-3 w-3" />
      </button>
    )}
  </div>
);

/**
 * FirstTimeUser - Special welcome for new users
 */
interface FirstTimeUserProps {
  userName?: string;
  onStartTour?: () => void;
  onSkipTour?: () => void;
  onAnalyze?: () => void;
  className?: string;
}

export const FirstTimeUser: React.FC<FirstTimeUserProps> = ({
  userName,
  onStartTour,
  onSkipTour,
  onAnalyze,
  className = '',
}) => {
  const displayName = userName || 'there';

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 to-purple-900/40 border border-violet-500/30 p-8 ${className}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Welcome header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome, {displayName}!</h2>
            <p className="text-violet-300">Let's find your next great investment.</p>
          </div>
        </div>

        {/* Value props */}
        <div className="grid sm:grid-cols-3 gap-4 my-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/30">
            <Target className="h-5 w-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">AI Analysis</p>
              <p className="text-xs text-gray-400">Instant property insights</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/30">
            <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Deal Scoring</p>
              <p className="text-xs text-gray-400">Know your ROI instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/30">
            <FileText className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Full Reports</p>
              <p className="text-xs text-gray-400">Export & share results</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onAnalyze && (
            <Button variant="primary" size="lg" onClick={onAnalyze} icon={<Plus className="h-5 w-5" />}>
              Analyze Your First Property
            </Button>
          )}
          {onStartTour && (
            <Button variant="secondary" size="lg" onClick={onStartTour}>
              Take a Quick Tour
            </Button>
          )}
        </div>

        {onSkipTour && (
          <button
            onClick={onSkipTour}
            className="mt-4 text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            I'll explore on my own
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
