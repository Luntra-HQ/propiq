/**
 * DealScore Component - 2025 Design System
 *
 * Circular progress indicator for deal scores with animated reveal.
 * Provides visual feedback on investment quality at a glance.
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Star, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

type ScoreRating = 'excellent' | 'good' | 'fair' | 'poor';
type Recommendation = 'strong_buy' | 'buy' | 'hold' | 'avoid';

interface DealScoreProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeConfig = {
  sm: { size: 80, stroke: 6, fontSize: 'text-xl', labelSize: 'text-xs' },
  md: { size: 120, stroke: 8, fontSize: 'text-3xl', labelSize: 'text-sm' },
  lg: { size: 160, stroke: 10, fontSize: 'text-4xl', labelSize: 'text-sm' },
  xl: { size: 200, stroke: 12, fontSize: 'text-5xl', labelSize: 'text-base' },
};

const getScoreRating = (score: number): ScoreRating => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
};

const ratingConfig: Record<ScoreRating, { color: string; bgColor: string; label: string }> = {
  excellent: { color: 'text-emerald-400', bgColor: 'stroke-emerald-500', label: 'Excellent' },
  good: { color: 'text-blue-400', bgColor: 'stroke-blue-500', label: 'Good' },
  fair: { color: 'text-amber-400', bgColor: 'stroke-amber-500', label: 'Fair' },
  poor: { color: 'text-red-400', bgColor: 'stroke-red-500', label: 'Poor' },
};

export const DealScore: React.FC<DealScoreProps> = ({
  score,
  maxScore = 100,
  size = 'md',
  animated = true,
  showLabel = true,
  label,
  className = '',
}) => {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const config = sizeConfig[size];
  const rating = getScoreRating(score);
  const ratingInfo = ratingConfig[rating];

  const radius = (config.size - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (displayScore / maxScore) * 100;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    setDisplayScore(0);
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [score, animated]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            className="fill-none stroke-slate-700/50"
            strokeWidth={config.stroke}
          />
          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            className={`fill-none ${ratingInfo.bgColor} transition-all duration-100`}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${rating === 'excellent' ? 'rgba(16, 185, 129, 0.4)' : rating === 'good' ? 'rgba(59, 130, 246, 0.4)' : rating === 'fair' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.fontSize} font-bold ${ratingInfo.color}`}>
            {displayScore}
          </span>
          {showLabel && (
            <span className={`${config.labelSize} text-gray-400 font-medium`}>
              {label || ratingInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * RecommendationBadge - Investment recommendation indicator
 */
interface RecommendationBadgeProps {
  recommendation: Recommendation;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const recommendationConfig: Record<Recommendation, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
}> = {
  strong_buy: {
    label: 'Strong Buy',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/40',
    icon: CheckCircle,
  },
  buy: {
    label: 'Buy',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
    icon: TrendingUp,
  },
  hold: {
    label: 'Hold',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/40',
    icon: Minus,
  },
  avoid: {
    label: 'Avoid',
    color: 'text-red-300',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/40',
    icon: XCircle,
  },
};

const badgeSizes = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({
  recommendation,
  size = 'md',
  className = '',
}) => {
  const config = recommendationConfig[recommendation];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center font-semibold rounded-full
        ${config.bgColor} ${config.borderColor} ${config.color}
        border ${badgeSizes[size]} ${className}
      `}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </div>
  );
};

/**
 * ConfidenceIndicator - AI confidence level visualization
 */
interface ConfidenceIndicatorProps {
  confidence: number; // 0-100
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const barCount = 5;
  const filledBars = Math.round((confidence / 100) * barCount);

  const getColor = () => {
    if (confidence >= 80) return 'bg-emerald-500';
    if (confidence >= 60) return 'bg-blue-500';
    if (confidence >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const barHeights = size === 'sm'
    ? ['h-2', 'h-3', 'h-4', 'h-5', 'h-6']
    : ['h-3', 'h-4', 'h-5', 'h-6', 'h-7'];

  return (
    <div className={`flex items-end gap-1 ${className}`}>
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          className={`
            ${size === 'sm' ? 'w-1.5' : 'w-2'} rounded-full
            ${barHeights[index]}
            ${index < filledBars ? getColor() : 'bg-slate-600'}
            transition-colors duration-300
          `}
        />
      ))}
      {showLabel && (
        <span className={`ml-2 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-400`}>
          {confidence}% confident
        </span>
      )}
    </div>
  );
};

/**
 * RiskLevel - Risk assessment indicator
 */
interface RiskLevelProps {
  level: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md';
  className?: string;
}

const riskConfig = {
  low: { label: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: CheckCircle },
  medium: { label: 'Medium Risk', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: AlertTriangle },
  high: { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle },
};

export const RiskLevel: React.FC<RiskLevelProps> = ({
  level,
  size = 'md',
  className = '',
}) => {
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`p-1.5 rounded-lg ${config.bg}`}>
        <Icon className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${config.color}`} />
      </div>
      <span className={`${size === 'sm' ? 'text-sm' : 'text-base'} font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

/**
 * MetricCard - Individual metric display
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sublabel,
  trend,
  trendValue,
  icon,
  highlight = false,
  className = '',
}) => {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={`
        p-4 rounded-xl
        ${highlight
          ? 'bg-violet-500/10 border border-violet-500/30'
          : 'bg-slate-800/50 border border-slate-700/50'
        }
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${highlight ? 'text-violet-300' : 'text-white'}`}>
          {value}
        </span>
        {sublabel && (
          <span className="text-sm text-gray-500">{sublabel}</span>
        )}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 mt-2 ${trendColors[trend]}`}>
          <TrendIcon className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
          <span className="text-xs font-medium">{trendValue}</span>
        </div>
      )}
    </div>
  );
};

export default DealScore;
