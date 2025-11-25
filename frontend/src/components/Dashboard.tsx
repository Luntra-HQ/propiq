/**
 * Dashboard Component - 2025 Design System
 *
 * Bento grid layout with glassmorphism cards for the main PropIQ dashboard.
 */

import React from 'react';
import {
  Target,
  Calculator,
  BarChart,
  TrendingUp,
  Zap,
  ArrowRight,
  Lock,
  CreditCard,
  Shield,
  Clock,
} from 'lucide-react';
import { GlassCard, GlassCardHeader } from './ui/GlassCard';
import { BentoBackground } from './ui/BentoGrid';
import { DealCalculator } from './DealCalculator';
import {
  PRICING_TIERS,
  getRemainingRuns,
  isAtHardCap,
} from '../config/pricing';

// ============================================
// Stat Card Component (Glassmorphism)
// ============================================

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
}) => {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingUp : null;

  return (
    <GlassCard variant="stat" size="md" hover={true}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-50 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 ${trendColors[trend]}`}>
              {TrendIcon && <TrendIcon className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Icon className="h-6 w-6 text-violet-400" />
        </div>
      </div>
    </GlassCard>
  );
};

// ============================================
// Hero PropIQ Card Component
// ============================================

interface HeroPropIQCardProps {
  used: number;
  limit: number;
  currentTier: string;
  onAnalyzeClick: () => void;
  onUpgradeClick: () => void;
}

export const HeroPropIQCard: React.FC<HeroPropIQCardProps> = ({
  used,
  limit,
  currentTier,
  onAnalyzeClick,
  onUpgradeClick,
}) => {
  const isAtLimit = isAtHardCap(used, limit);
  const remaining = getRemainingRuns(used, limit);
  const progressPercent = Math.min((used / limit) * 100, 100);
  const tierConfig = PRICING_TIERS[currentTier] || PRICING_TIERS.free;

  // Progress bar color based on usage
  let progressColor = 'from-emerald-500 to-emerald-400';
  let progressGlow = 'shadow-emerald-500/30';
  if (progressPercent >= 90) {
    progressColor = 'from-red-500 to-red-400';
    progressGlow = 'shadow-red-500/30';
  } else if (progressPercent >= 75) {
    progressColor = 'from-amber-500 to-amber-400';
    progressGlow = 'shadow-amber-500/30';
  }

  return (
    <GlassCard variant="hero" size="hero" className="h-full" glow={!isAtLimit}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 float-soft">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-50">PropIQ AI Analysis</h2>
            <p className="text-gray-400 text-sm">Instant property insights powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30">
          <CreditCard className="h-4 w-4 text-violet-300" />
          <span className="text-sm font-medium text-violet-200">{tierConfig.displayName}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-6 text-base leading-relaxed">
        Get comprehensive AI analysis including market insights, investment recommendations,
        risk assessment, and financial projections in under 30 seconds.
      </p>

      {/* Usage Progress */}
      <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-300">Monthly Usage</span>
          <span className={`text-sm font-bold ${remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {remaining} of {limit} remaining
          </span>
        </div>
        <div className="relative w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${progressColor} rounded-full transition-all duration-700 ease-out progress-animate shadow-lg ${progressGlow}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Used: {used}</span>
          <span>{progressPercent.toFixed(0)}% of limit</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={isAtLimit ? onUpgradeClick : onAnalyzeClick}
        disabled={false}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg
          flex items-center justify-center gap-3
          transition-all duration-300
          ${isAtLimit
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/30'
            : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40'
          }
          text-white
          hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.99]
        `}
      >
        {isAtLimit ? (
          <>
            <Lock className="h-5 w-5" />
            <span>Upgrade to Continue</span>
          </>
        ) : (
          <>
            <Target className="h-5 w-5" />
            <span>Analyze a Property</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Quick tip */}
      {!isAtLimit && (
        <p className="text-center text-xs text-gray-500 mt-3">
          Enter any US property address for instant AI analysis
        </p>
      )}
    </GlassCard>
  );
};

// ============================================
// Calculator Card Component
// ============================================

interface CalculatorCardProps {
  expanded?: boolean;
}

export const CalculatorCard: React.FC<CalculatorCardProps> = ({ expanded = false }) => {
  return (
    <GlassCard variant="default" size="lg" className="h-full">
      <GlassCardHeader
        title="Deal Calculator"
        subtitle="Free unlimited calculations"
        icon={<Calculator className="h-5 w-5" />}
        action={
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Free
          </span>
        }
      />
      <div className="mt-4">
        <DealCalculator />
      </div>
    </GlassCard>
  );
};

// ============================================
// Benefits Card Component
// ============================================

interface BenefitsCardProps {
  currentTier: string;
  onUpgradeClick: () => void;
}

export const BenefitsCard: React.FC<BenefitsCardProps> = ({
  currentTier,
  onUpgradeClick,
}) => {
  const tierConfig = PRICING_TIERS[currentTier] || PRICING_TIERS.free;

  return (
    <GlassCard variant="default" size="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-50">
          Your {tierConfig.displayName} Benefits
        </h3>
        <button
          onClick={onUpgradeClick}
          className="btn-ghost text-sm text-violet-400 hover:text-violet-300"
        >
          Upgrade
        </button>
      </div>

      <div className="space-y-3">
        {tierConfig.features.slice(0, 4).map((feature, index) => (
          <div key={index} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <Shield className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" />
            <p className="text-sm text-gray-300">{feature}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-glass-border">
        <p className="text-xs text-gray-500 text-center">
          Best for: <span className="text-gray-400 font-medium">{tierConfig.bestFor}</span>
        </p>
      </div>
    </GlassCard>
  );
};

// ============================================
// Quick Actions Card
// ============================================

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  badge?: string;
}

interface QuickActionsCardProps {
  actions: QuickAction[];
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ actions }) => {
  return (
    <GlassCard variant="default" size="md">
      <h3 className="text-lg font-semibold text-gray-50 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-transparent hover:border-glass-border-hover transition-all duration-200 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
              <action.icon className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-200">{action.label}</p>
                {action.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/20 text-emerald-300">
                    {action.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{action.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </GlassCard>
  );
};

// ============================================
// Main Dashboard Layout
// ============================================

interface DashboardProps {
  propIqUsed: number;
  propIqLimit: number;
  currentTier: string;
  userEmail: string | null;
  onAnalyzeClick: () => void;
  onUpgradeClick: () => void;
  onCalculatorClick?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  propIqUsed,
  propIqLimit,
  currentTier,
  userEmail,
  onAnalyzeClick,
  onUpgradeClick,
}) => {
  const remaining = getRemainingRuns(propIqUsed, propIqLimit);
  const firstName = userEmail?.split('@')[0] || 'there';

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <BentoBackground>
      <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8 md:py-12">
        {/* Personalized Greeting */}
        <section className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-50 mb-1">
            {getGreeting()}, <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="text-gray-400">
            {remaining > 0
              ? `You have ${remaining} AI analyses remaining this month.`
              : 'Upgrade your plan to continue analyzing properties.'}
          </p>
        </section>

        {/* Main Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
          {/* Hero Card - PropIQ Analysis (2 cols, 2 rows) */}
          <div className="lg:col-span-2 lg:row-span-2">
            <HeroPropIQCard
              used={propIqUsed}
              limit={propIqLimit}
              currentTier={currentTier}
              onAnalyzeClick={onAnalyzeClick}
              onUpgradeClick={onUpgradeClick}
            />
          </div>

          {/* Stats Column */}
          <div className="space-y-5 md:space-y-6 stagger-fade-in">
            <StatCard
              title="Properties Analyzed"
              value={propIqUsed.toString()}
              subtitle="This month"
              icon={Target}
            />
            <StatCard
              title="Analyses Remaining"
              value={remaining.toString()}
              subtitle={`of ${propIqLimit} total`}
              icon={BarChart}
              trend={remaining < 3 ? 'down' : 'neutral'}
              trendValue={remaining < 3 ? 'Running low' : undefined}
            />
            <StatCard
              title="Response Time"
              value="~30s"
              subtitle="Average analysis"
              icon={Clock}
            />
          </div>
        </div>

        {/* Second Row - Calculator and Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Calculator - Takes 2 columns */}
          <div className="lg:col-span-2">
            <CalculatorCard />
          </div>

          {/* Benefits Card */}
          <div>
            <BenefitsCard
              currentTier={currentTier}
              onUpgradeClick={onUpgradeClick}
            />
          </div>
        </div>
      </main>
    </BentoBackground>
  );
};

export default Dashboard;
