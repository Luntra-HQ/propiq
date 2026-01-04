/**
 * Executive Summary Component
 *
 * Displays the "Box of Most Important Stats" that users requested.
 * Shows deal score, confidence meter, and top 3-4 key metrics.
 *
 * @component
 */

import { TrendingUp, Calculator, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { type QuickCheckResult } from '../utils/smartDefaults';
import { formatCurrency, formatPercent } from '../utils/calculatorUtils';
import { ConfidenceMeter } from './ui/confidence-meter';

export interface ExecutiveSummaryProps {
  result: QuickCheckResult;
  onClickMetric: (metric: string) => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ result, onClickMetric }) => {
  const getDealRating = (score: number) => {
    if (score >= 80) return { text: 'Excellent Deal', color: 'emerald', emoji: '🎉' };
    if (score >= 65) return { text: 'Good Deal', color: 'blue', emoji: '✅' };
    if (score >= 50) return { text: 'Fair Deal', color: 'yellow', emoji: '⚠️' };
    if (score >= 35) return { text: 'Poor Deal', color: 'orange', emoji: '⚠️' };
    return { text: 'Pass on This', color: 'red', emoji: '❌' };
  };

  const getRecommendedAction = (score: number, cashFlow: number) => {
    if (score >= 75 && cashFlow > 200) {
      return {
        text: 'Make an offer or negotiate further',
        icon: '✅',
        color: 'emerald',
      };
    }
    if (score >= 60 && cashFlow > 0) {
      return {
        text: 'Negotiate price or verify expenses',
        icon: '💡',
        color: 'blue',
      };
    }
    if (cashFlow < 0) {
      return {
        text: 'Pass - Negative cash flow',
        icon: '❌',
        color: 'red',
      };
    }
    return {
      text: 'Do more research before deciding',
      icon: '🔍',
      color: 'yellow',
    };
  };

  const rating = getDealRating(result.dealScore);
  const action = getRecommendedAction(result.dealScore, result.monthlyCashFlow);

  return (
    <div className="executive-summary-card glass-panel glow-border">
      {/* Header with Deal Score & Confidence */}
      <div className="summary-header">
        {/* Deal Score Badge */}
        <div className={`deal-score-badge deal-score-${rating.color}`}>
          <div className="score-circle">
            <span className="score-number">{result.dealScore}</span>
            <span className="score-max">/100</span>
          </div>
          <div className="score-label">
            <span className="score-emoji">{rating.emoji}</span>
            <span className="score-text">{rating.text}</span>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="confidence-section">
          <ConfidenceMeter
            score={result.confidenceLevel === 'high' ? 90 : result.confidenceLevel === 'medium' ? 65 : 40}
            message={result.confidenceMessage}
            color={
              result.confidenceLevel === 'high'
                ? '#10b981'
                : result.confidenceLevel === 'medium'
                ? '#3b82f6'
                : '#f59e0b'
            }
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="key-metrics-grid">
        {/* Monthly Cash Flow */}
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Monthly Cash Flow"
          value={formatCurrency(result.monthlyCashFlow)}
          positive={result.monthlyCashFlow >= 0}
          tooltip="Rent minus all expenses and mortgage payment"
          onClick={() => onClickMetric('cashFlow')}
        />

        {/* Cash-on-Cash Return */}
        <MetricCard
          icon={<Calculator className="h-5 w-5" />}
          label="Cash-on-Cash Return"
          value={formatPercent(result.cocReturn)}
          positive={result.cocReturn >= 8}
          tooltip="Annual return on your initial investment"
          onClick={() => onClickMetric('cocReturn')}
        />

        {/* 1% Rule */}
        <MetricCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="1% Rule"
          value={formatPercent(result.onePercentRule)}
          positive={result.onePercentRule >= 1}
          tooltip="Rent should be 1% of purchase price monthly"
          onClick={() => onClickMetric('onePercent')}
        />
      </div>

      {/* Recommended Action */}
      <div className={`recommended-action action-${action.color}`}>
        <div className="action-header">
          <AlertCircle className="h-5 w-5" />
          <span className="font-semibold">Recommended Action</span>
        </div>
        <p className="action-text">
          {action.icon} {action.text}
        </p>
      </div>
    </div>
  );
};

// MetricCard Sub-Component
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive: boolean;
  tooltip: string;
  onClick: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, positive, tooltip, onClick }) => {
  return (
    <div className="metric-card glass-panel-subtle">
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        <div className="metric-label-group">
          <span className="metric-label">{label}</span>
          <button
            onClick={onClick}
            className="metric-info-btn"
            title={tooltip}
            aria-label={`How we calculated ${label}`}
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`metric-value ${positive ? 'metric-positive' : 'metric-negative'}`}>
        {value}
      </div>

      <div className={`metric-status ${positive ? 'status-positive' : 'status-negative'}`}>
        {positive ? '✓ Good' : '⚠ Needs Work'}
      </div>
    </div>
  );
};

export default ExecutiveSummary;
