/**
 * Dashboard Component - 2025 Design System
 *
 * Bento grid layout with glassmorphism cards for the main PropIQ dashboard.
 */

import React from 'react';
import {
  Calculator,
  Shield,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { GlassCard, GlassCardHeader } from './ui/GlassCard';
import { BentoBackground } from './ui/BentoGrid';
import { DealCalculator } from './DealCalculator';
import {
  PRICING_TIERS,
} from '../config/pricing';

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
  currentTier: string;
  userEmail: string | null;
  userId: string;
  onUpgradeClick: () => void;
  onHelpClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentTier,
  userEmail,
  userId,
  onUpgradeClick,
  onHelpClick,
}) => {
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
        <section className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-50 mb-1">
              {getGreeting()}, <span className="text-gradient">{firstName}</span>
            </h1>
            <p className="text-gray-400">
              Welcome to your PropIQ dashboard.
            </p>
          </div>
          {/* Help Button */}
          <button
            onClick={onHelpClick}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white rounded-lg border border-glass-border hover:border-glass-border-hover transition-all duration-200 group"
            title="Help Center - Get answers to your questions"
            aria-label="Open Help Center"
            data-testid="help-button"
          >
            <HelpCircle className="h-4 w-4 group-hover:text-violet-400 transition-colors" />
            <span className="text-sm font-medium hidden sm:inline">Help</span>
          </button>
        </section>

        {/* Main Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Calculator - Takes 2 columns */}
          <div className="lg:col-span-2" id="calculator">
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
