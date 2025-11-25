/**
 * AnalysisResults Component - 2025 Design System
 *
 * Enhanced results display for AI property analysis with
 * visual hierarchy, streaming text, and celebration effects.
 */

import React, { useState } from 'react';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Calendar,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { DealScore, RecommendationBadge, ConfidenceIndicator, RiskLevel, MetricCard } from './DealScore';
import { StreamingText, StreamingList } from './StreamingText';

interface AnalysisResultsProps {
  analysis: {
    summary: string;
    location: {
      neighborhood: string;
      city: string;
      state: string;
      marketTrend: 'up' | 'down' | 'stable';
      marketScore: number;
    };
    financials: {
      estimatedValue: number;
      estimatedRent: number;
      cashFlow: number;
      capRate: number;
      roi: number;
      monthlyMortgage: number;
    };
    investment: {
      recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
      confidenceScore: number;
      riskLevel: 'low' | 'medium' | 'high';
      timeHorizon: 'short' | 'medium' | 'long';
    };
    pros: string[];
    cons: string[];
    keyInsights: string[];
    nextSteps: string[];
  };
  address?: string;
  streaming?: boolean;
  className?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  address,
  streaming = false,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    insights: true,
    pros: true,
    cons: true,
    nextSteps: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate deal score (simplified - actual would come from API)
  const dealScore = Math.round(
    (analysis.investment.confidenceScore * 0.3) +
    (analysis.financials.capRate * 8) +
    (analysis.location.marketScore * 0.2)
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero Section - Score & Recommendation */}
      <GlassCard variant="hero" size="lg" className="relative overflow-hidden">
        {/* Background gradient based on recommendation */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {analysis.investment.recommendation === 'strong_buy' && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-transparent" />
          )}
          {analysis.investment.recommendation === 'avoid' && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-transparent" />
          )}
        </div>

        <div className="relative z-10">
          {/* Address header */}
          {address && (
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{address}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Score */}
            <div className="flex items-center gap-6">
              <DealScore score={dealScore} size="lg" animated={streaming} />
              <div>
                <RecommendationBadge
                  recommendation={analysis.investment.recommendation}
                  size="lg"
                />
                <div className="mt-3 space-y-2">
                  <ConfidenceIndicator
                    confidence={analysis.investment.confidenceScore}
                    size="sm"
                  />
                  <RiskLevel level={analysis.investment.riskLevel} size="sm" />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl bg-slate-800/50">
                <p className="text-2xl font-bold text-emerald-400">
                  {formatPercent(analysis.financials.capRate)}
                </p>
                <p className="text-xs text-gray-400">Cap Rate</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-800/50">
                <p className="text-2xl font-bold text-blue-400">
                  {formatPercent(analysis.financials.roi)}
                </p>
                <p className="text-xs text-gray-400">ROI</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-800/50">
                <p className={`text-2xl font-bold ${analysis.financials.cashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(analysis.financials.cashFlow)}
                </p>
                <p className="text-xs text-gray-400">Monthly Cash Flow</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-800/50">
                <p className="text-2xl font-bold text-violet-400">
                  {formatCurrency(analysis.financials.estimatedValue)}
                </p>
                <p className="text-xs text-gray-400">Est. Value</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
            <p className="text-gray-300 leading-relaxed">
              {streaming ? (
                <StreamingText text={analysis.summary} speed={40} />
              ) : (
                analysis.summary
              )}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Est. Value"
          value={formatCurrency(analysis.financials.estimatedValue)}
          icon={<Home className="h-4 w-4" />}
        />
        <MetricCard
          label="Monthly Rent"
          value={formatCurrency(analysis.financials.estimatedRent)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Mortgage"
          value={formatCurrency(analysis.financials.monthlyMortgage)}
          sublabel="/mo"
          icon={<Calendar className="h-4 w-4" />}
        />
        <MetricCard
          label="Market Trend"
          value={analysis.location.marketTrend === 'up' ? 'Growing' : analysis.location.marketTrend === 'down' ? 'Declining' : 'Stable'}
          trend={analysis.location.marketTrend === 'stable' ? 'neutral' : analysis.location.marketTrend}
          icon={analysis.location.marketTrend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          highlight={analysis.location.marketTrend === 'up'}
        />
      </div>

      {/* Expandable Sections */}
      <div className="space-y-4">
        {/* Key Insights */}
        <CollapsibleSection
          title="Key Insights"
          icon={<Lightbulb className="h-5 w-5 text-amber-400" />}
          expanded={expandedSections.insights}
          onToggle={() => toggleSection('insights')}
          count={analysis.keyInsights.length}
        >
          {streaming ? (
            <StreamingList
              items={analysis.keyInsights}
              icon={<Lightbulb className="h-4 w-4 text-amber-400" />}
              itemClassName="text-gray-300"
              speed={40}
            />
          ) : (
            <ul className="space-y-2">
              {analysis.keyInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-300">
                  <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </CollapsibleSection>

        {/* Pros & Cons side by side on desktop */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Pros */}
          <CollapsibleSection
            title="Pros"
            icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
            expanded={expandedSections.pros}
            onToggle={() => toggleSection('pros')}
            count={analysis.pros.length}
            variant="success"
          >
            {streaming ? (
              <StreamingList
                items={analysis.pros}
                icon={<CheckCircle className="h-4 w-4 text-emerald-400" />}
                itemClassName="text-gray-300"
                speed={35}
              />
            ) : (
              <ul className="space-y-2">
                {analysis.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleSection>

          {/* Cons */}
          <CollapsibleSection
            title="Cons"
            icon={<XCircle className="h-5 w-5 text-red-400" />}
            expanded={expandedSections.cons}
            onToggle={() => toggleSection('cons')}
            count={analysis.cons.length}
            variant="danger"
          >
            {streaming ? (
              <StreamingList
                items={analysis.cons}
                icon={<XCircle className="h-4 w-4 text-red-400" />}
                itemClassName="text-gray-300"
                speed={35}
              />
            ) : (
              <ul className="space-y-2">
                {analysis.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleSection>
        </div>

        {/* Next Steps */}
        <CollapsibleSection
          title="Recommended Next Steps"
          icon={<ArrowRight className="h-5 w-5 text-violet-400" />}
          expanded={expandedSections.nextSteps}
          onToggle={() => toggleSection('nextSteps')}
          count={analysis.nextSteps.length}
          variant="primary"
        >
          {streaming ? (
            <StreamingList
              items={analysis.nextSteps}
              icon={<ArrowRight className="h-4 w-4 text-violet-400" />}
              itemClassName="text-gray-300"
              speed={35}
            />
          ) : (
            <ol className="space-y-2">
              {analysis.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-sm font-medium">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </CollapsibleSection>
      </div>
    </div>
  );
};

/**
 * CollapsibleSection - Expandable content section
 */
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  variant?: 'default' | 'success' | 'danger' | 'primary';
  children: React.ReactNode;
}

const variantStyles = {
  default: 'border-slate-700/50',
  success: 'border-emerald-500/20',
  danger: 'border-red-500/20',
  primary: 'border-violet-500/20',
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  expanded,
  onToggle,
  count,
  variant = 'default',
  children,
}) => (
  <GlassCard variant="default" size="md" className={`border ${variantStyles[variant]}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between text-left"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold text-white">{title}</span>
        {count !== undefined && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-gray-400">
            {count}
          </span>
        )}
      </div>
      {expanded ? (
        <ChevronUp className="h-5 w-5 text-gray-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-400" />
      )}
    </button>
    {expanded && (
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        {children}
      </div>
    )}
  </GlassCard>
);

export default AnalysisResults;
