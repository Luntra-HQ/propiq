/**
 * Personalization Components - 2025 Design System
 *
 * Components for creating personalized, welcoming user experiences.
 * Makes every user feel the product is built for them.
 */

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Sunset,
  Coffee,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  MapPin,
  ArrowRight,
  Calendar,
  BarChart,
} from 'lucide-react';
import { GlassCard } from './GlassCard';

/**
 * PersonalizedGreeting - Time-based greeting with user name
 */
interface PersonalizedGreetingProps {
  userName?: string;
  email?: string;
  analysesRemaining?: number;
  totalAnalyses?: number;
  className?: string;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const greetingConfig: Record<TimeOfDay, { greeting: string; icon: React.ElementType; subtext: string }> = {
  morning: {
    greeting: 'Good morning',
    icon: Sun,
    subtext: 'Ready to find your next deal?',
  },
  afternoon: {
    greeting: 'Good afternoon',
    icon: Coffee,
    subtext: 'Let\'s analyze some properties.',
  },
  evening: {
    greeting: 'Good evening',
    icon: Sunset,
    subtext: 'Wrapping up your research?',
  },
  night: {
    greeting: 'Good evening',
    icon: Moon,
    subtext: 'Burning the midnight oil?',
  },
};

export const PersonalizedGreeting: React.FC<PersonalizedGreetingProps> = ({
  userName,
  email,
  analysesRemaining,
  totalAnalyses,
  className = '',
}) => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay());

  useEffect(() => {
    // Update time of day every minute
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const config = greetingConfig[timeOfDay];
  const Icon = config.icon;
  const displayName = userName || email?.split('@')[0] || 'there';

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <Icon className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {config.greeting}, <span className="text-gradient">{displayName}</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {config.subtext}
            {analysesRemaining !== undefined && totalAnalyses !== undefined && (
              <span className="ml-2 text-violet-400">
                • {analysesRemaining} of {totalAnalyses} analyses remaining
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * RecentAnalysis - Single recent analysis item
 */
interface RecentAnalysisItem {
  id: string;
  address: string;
  city: string;
  state: string;
  score: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  analyzedAt: Date;
}

interface RecentAnalysisCardProps {
  analysis: RecentAnalysisItem;
  onClick?: (id: string) => void;
}

const recommendationColors = {
  strong_buy: 'text-emerald-400',
  buy: 'text-blue-400',
  hold: 'text-amber-400',
  avoid: 'text-red-400',
};

const RecentAnalysisCard: React.FC<RecentAnalysisCardProps> = ({ analysis, onClick }) => {
  const timeAgo = getTimeAgo(analysis.analyzedAt);

  return (
    <button
      onClick={() => onClick?.(analysis.id)}
      className="w-full p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-violet-500/30 transition-all duration-200 text-left group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
            {analysis.address}
          </p>
          <p className="text-xs text-gray-500">
            {analysis.city}, {analysis.state}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className={`text-lg font-bold ${recommendationColors[analysis.recommendation]}`}>
            {analysis.score}
          </p>
          <p className="text-[10px] text-gray-500">{timeAgo}</p>
        </div>
      </div>
    </button>
  );
};

/**
 * RecentAnalyses - Widget showing recent property analyses
 */
interface RecentAnalysesProps {
  analyses: RecentAnalysisItem[];
  onViewAnalysis?: (id: string) => void;
  onViewAll?: () => void;
  maxItems?: number;
  className?: string;
}

export const RecentAnalyses: React.FC<RecentAnalysesProps> = ({
  analyses,
  onViewAnalysis,
  onViewAll,
  maxItems = 3,
  className = '',
}) => {
  const displayedAnalyses = analyses.slice(0, maxItems);

  if (analyses.length === 0) {
    return (
      <GlassCard variant="default" size="md" className={className}>
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-white">Recent Analyses</h3>
        </div>
        <div className="text-center py-6">
          <Target className="h-10 w-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No analyses yet</p>
          <p className="text-gray-500 text-xs mt-1">Your recent property analyses will appear here</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default" size="md" className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-violet-400" />
          <h3 className="font-semibold text-white">Recent Analyses</h3>
        </div>
        {analyses.length > maxItems && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all ({analyses.length})
          </button>
        )}
      </div>
      <div className="space-y-2">
        {displayedAnalyses.map((analysis) => (
          <RecentAnalysisCard
            key={analysis.id}
            analysis={analysis}
            onClick={onViewAnalysis}
          />
        ))}
      </div>
    </GlassCard>
  );
};

/**
 * QuickStats - Personalized stats summary
 */
interface QuickStatsProps {
  totalAnalyses: number;
  thisMonth: number;
  avgScore: number;
  topCity?: string;
  className?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalAnalyses,
  thisMonth,
  avgScore,
  topCity,
  className = '',
}) => (
  <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        <Target className="h-4 w-4 text-violet-400" />
        <span className="text-xs text-gray-400">Total Analyses</span>
      </div>
      <p className="text-xl font-bold text-white">{totalAnalyses}</p>
    </div>
    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="h-4 w-4 text-emerald-400" />
        <span className="text-xs text-gray-400">This Month</span>
      </div>
      <p className="text-xl font-bold text-white">{thisMonth}</p>
    </div>
    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        <BarChart className="h-4 w-4 text-blue-400" />
        <span className="text-xs text-gray-400">Avg Score</span>
      </div>
      <p className="text-xl font-bold text-white">{avgScore}</p>
    </div>
    {topCity && (
      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-gray-400">Top City</span>
        </div>
        <p className="text-lg font-bold text-white truncate">{topCity}</p>
      </div>
    )}
  </div>
);

/**
 * OnboardingChecklist - Progressive onboarding steps
 */
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  onDismiss?: () => void;
  className?: string;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  steps,
  onDismiss,
  className = '',
}) => {
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  if (completedCount === steps.length) {
    return null; // Hide when all complete
  }

  return (
    <GlassCard variant="primary" size="md" className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Sparkles className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Getting Started</h3>
            <p className="text-xs text-gray-400">{completedCount} of {steps.length} complete</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700/50 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              step.completed ? 'bg-emerald-500/10' : 'bg-slate-800/30'
            }`}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.completed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-gray-400'
              }`}
            >
              {step.completed ? '✓' : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${step.completed ? 'text-emerald-300' : 'text-white'}`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              {!step.completed && step.action && (
                <button
                  onClick={step.action}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {step.actionLabel || 'Start'}
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

// Helper function
const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export default PersonalizedGreeting;
