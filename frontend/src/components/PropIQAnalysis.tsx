import React, { useMemo, useState } from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, X, Loader2, FileText, MapPin, DollarSign, BarChart3, Lightbulb, ArrowRight, Zap, Info } from 'lucide-react';
import { useAction } from 'convex/react';
import type { Id } from '../../convex/_generated/dataModel';
import { PrintButton } from './PrintButton';
import { PDFExportButton } from './PDFExportButton';
import { Tooltip } from './Tooltip';
import { validateAddress, type ValidationResult } from '../utils/addressValidation';
import './PropIQAnalysis.css';

interface PropIQAnalysisProps {
  onClose: () => void;
  userId: string | null;
  authToken: string | null;
}

interface AnalysisData {
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
  _metadata?: {
    address: string;
    analyzedAt: string;
    analyzedBy: string;
    model: string;
  };
}

export const PropIQAnalysis: React.FC<PropIQAnalysisProps> = ({ onClose, userId, authToken }) => {
  const [step, setStep] = useState<'input' | 'loading' | 'results'>('input');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('single_family');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [downPayment, setDownPayment] = useState<number | ''>('');
  const [interestRate, setInterestRate] = useState<number | ''>('');
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usesRemaining, setUsesRemaining] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);

  // Convex action for analysis (avoid REST API drift + prevents auth header issues)
  // Using string reference avoids anyApi proxy edge-cases in production builds.
  const analyzeProperty = useAction('propiq:analyzeProperty' as any);

  // Compute validation without extra setState loops (prevents flicker/flash while typing)
  const validationResult: ValidationResult | null = useMemo(() => {
    const trimmed = address.trim();
    if (!trimmed) return null;
    return validateAddress(trimmed);
  }, [address]);

  const showValidation = address.trim().length >= 10;

  const loadSampleProperty = () => {
    // Sample property: Realistic Austin rental for demo
    setAddress('2505 Longview St, Austin, TX 78705');
    setPropertyType('single_family');
    setPurchasePrice(425000);
    setDownPayment(85000);
    setInterestRate(7.25);
    setError(null);
  };

  const handleAnalyze = async () => {
    const trimmedAddress = address.trim();

    // Check authentication first
    if (!authToken || !userId) {
      setError('You must be logged in to use PropIQ Analysis');
      return;
    }

    // Use computed validation (avoids re-validating on every click)
    const validation = validationResult || validateAddress(trimmedAddress);

    if (!validation.valid) {
      // Show first error message
      setError(validation.errors[0] || 'Please enter a valid address');
      return;
    }

    // Show warnings but allow user to proceed
    if (validation.warnings.length > 0 && validation.confidence === 'low') {
      setError('Address may be incomplete. Please verify before continuing.');
      return;
    }

    setStep('loading');
    setError(null);

    try {
      const result = await analyzeProperty({
        userId: userId as Id<'users'>,
        address: trimmedAddress,
        // Backend supports these optional fields; keep them aligned with Convex.
        purchasePrice: typeof purchasePrice === 'number' ? purchasePrice : undefined,
        downPayment: typeof downPayment === 'number' ? downPayment : undefined,
        monthlyRent: undefined,
      });

      if (result?.success && result.analysis) {
        // Convex returns analysis JSON object; map into UI shape (best-effort).
        setAnalysis(result.analysis as any);
        // In Convex, this is `analysesRemaining`.
        setUsesRemaining(result.analysesRemaining ?? null);
        // Save analysis ID for reference
        setSavedAnalysisId(result.analysisId || null);
        // Show success message
        setShowSuccessMessage(true);
        setStep('results');

        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 10000);
      } else {
        setError(result?.error || 'Analysis failed');
        setStep('input');
      }
    } catch (err: any) {
      console.error('PropIQ Analysis error:', err);

      const message =
        err?.data?.message ||
        err?.message ||
        'Failed to analyze property. Please try again.';

      // Provide clear, actionable error messages
      let userMessage = '';
      if (typeof message === 'string') {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('limit') || lowerMessage.includes('quota')) {
          userMessage = '⚠️ Analysis limit reached. You\'ve used all your free analyses. Please upgrade to continue.';
        } else if (lowerMessage.includes('session') || lowerMessage.includes('auth') || lowerMessage.includes('login')) {
          userMessage = '🔒 Session expired. Please log in again to continue analyzing properties.';
        } else if (lowerMessage.includes('not found')) {
          userMessage = '❌ User account not found. Please try logging out and back in.';
        } else if (lowerMessage.includes('network') || lowerMessage.includes('timeout')) {
          userMessage = '📡 Network error. Please check your internet connection and try again.';
        } else if (lowerMessage.includes('save') || lowerMessage.includes('database')) {
          userMessage = '💾 Failed to save analysis. Your report was generated but may not be saved. Please try again.';
        } else {
          userMessage = `❌ ${message}`;
        }
      } else {
        userMessage = '❌ An unexpected error occurred. Please try again or contact support if the issue persists.';
      }

      setError(userMessage);
      setStep('input');

      // Log detailed error for debugging (viewable in browser console)
      console.error('PropIQ Analysis detailed error:', {
        originalError: err,
        message: message,
        userMessage: userMessage,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy':
        return { text: 'Strong Buy', color: 'excellent', icon: CheckCircle };
      case 'buy':
        return { text: 'Buy', color: 'good', icon: TrendingUp };
      case 'hold':
        return { text: 'Hold', color: 'fair', icon: AlertTriangle };
      case 'avoid':
        return { text: 'Avoid', color: 'poor', icon: X };
      default:
        return { text: 'Unknown', color: 'fair', icon: AlertTriangle };
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return { text: 'Low Risk', color: 'excellent' };
      case 'medium':
        return { text: 'Medium Risk', color: 'fair' };
      case 'high':
        return { text: 'High Risk', color: 'poor' };
      default:
        return { text: 'Unknown', color: 'fair' };
    }
  };

  const getMarketTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'stable':
        return <BarChart3 className="h-5 w-5 text-blue-300" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="propiq-analysis-overlay">
      <div className="propiq-analysis-modal">
        {/* Header */}
        <div className="propiq-header">
          <div className="propiq-header-content">
            <Target className="h-6 w-6 text-violet-300" />
            <h2>PropIQ AI Analysis</h2>
          </div>
          <button onClick={onClose} className="propiq-close-btn">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Input Form */}
        {step === 'input' && (
          <div className="propiq-content">
            <p className="propiq-description">
              Get AI-powered investment analysis for any property. Enter the address and optional details below.
            </p>

            {/* Sample Property Button - Quick Win Feature */}
            <div className="propiq-sample-banner">
              <div className="propiq-sample-content">
                <Zap className="h-5 w-5" />
                <div>
                  <h4>New to PropIQ?</h4>
                  <p>Try our sample property to see instant analysis</p>
                </div>
              </div>
              <button
                onClick={loadSampleProperty}
                className="propiq-sample-btn"
                type="button"
              >
                <Target className="h-4 w-4" />
                Try Sample Property
              </button>
            </div>

            {error && (
              <div className="propiq-error">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="propiq-form">
              <div className="propiq-form-group">
                <label htmlFor="propertyAddress">
                  <MapPin className="h-4 w-4" />
                  Property Address *
                </label>
                <input
                  id="propertyAddress"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="123 Main St, City, State 12345"
                  className={`propiq-input ${
                    showValidation && validationResult
                      ? validationResult.valid
                        ? 'border-green-500/50'
                        : 'border-red-500/50'
                      : ''
                  }`}
                  autoFocus
                  aria-label="Property Address"
                  aria-required="true"
                  aria-invalid={showValidation && validationResult ? !validationResult.valid : undefined}
                />

                {/* Validation Feedback */}
                {showValidation && validationResult && (
                  <div className="mt-2 space-y-2">
                    {/* Validation Errors */}
                    {validationResult.errors.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        {validationResult.errors.map((error, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-red-400 text-sm">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Validation Warnings */}
                    {validationResult.warnings.length > 0 && validationResult.errors.length === 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        {validationResult.warnings.map((warning, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-yellow-400 text-sm">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Success + Suggestions */}
                    {validationResult.valid && validationResult.suggestions.length > 0 && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        {validationResult.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-blue-400 text-sm">
                            <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Validation Success */}
                    {validationResult.valid &&
                     validationResult.errors.length === 0 &&
                     validationResult.warnings.length === 0 &&
                     validationResult.confidence === 'high' && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Address looks complete and ready for analysis</span>
                      </div>
                    )}

                    {/* Parsed Components Preview */}
                    {validationResult.components.streetNumber && (
                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-400">
                          View parsed address components
                        </summary>
                        <div className="mt-2 pl-4 space-y-1 font-mono">
                          {validationResult.components.streetNumber && (
                            <div>Street #: {validationResult.components.streetNumber}</div>
                          )}
                          {validationResult.components.streetName && (
                            <div>Street: {validationResult.components.streetName}</div>
                          )}
                          {validationResult.components.city && (
                            <div>City: {validationResult.components.city}</div>
                          )}
                          {validationResult.components.state && (
                            <div>State: {validationResult.components.state}</div>
                          )}
                          {validationResult.components.zipCode && (
                            <div>ZIP: {validationResult.components.zipCode}</div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>

              <div className="propiq-form-group">
                <label htmlFor="propertyType">Property Type</label>
                <select
                  id="propertyType"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="propiq-select"
                  aria-label="Property Type"
                >
                  <option value="single_family">Single Family Home</option>
                  <option value="multi_family">Multi-Family (2-4 units)</option>
                  <option value="condo">Condominium</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="apartment">Apartment Building (5+ units)</option>
                  <option value="commercial">Commercial Property</option>
                </select>
              </div>

              <div className="propiq-form-row">
                <div className="propiq-form-group">
                  <label htmlFor="purchasePrice">
                    <DollarSign className="h-4 w-4" />
                    Purchase Price (Optional)
                  </label>
                  <input
                    id="purchasePrice"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value ? parseFloat(e.target.value) : '')}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="propiq-input"
                    step="1000"
                    aria-label="Purchase Price in dollars"
                  />
                </div>

                <div className="propiq-form-group">
                  <label htmlFor="downPayment">
                    <DollarSign className="h-4 w-4" />
                    Down Payment (Optional)
                  </label>
                  <input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value ? parseFloat(e.target.value) : '')}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="propiq-input"
                    step="1000"
                    aria-label="Down Payment in dollars"
                  />
                </div>
              </div>

              <div className="propiq-form-group">
                <label htmlFor="interestRate">Interest Rate % (Optional)</label>
                <input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value ? parseFloat(e.target.value) : '')}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="propiq-input"
                  step="0.1"
                  aria-label="Interest Rate Percentage"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!address.trim() || !authToken}
                className="propiq-analyze-btn disabled:opacity-50 disabled:cursor-not-allowed"
                title={!address.trim() ? "Please enter a property address" : !authToken ? "Please log in to analyze properties" : ""}
              >
                <Target className="h-6 w-6" />
                Run PropIQ Analysis
                <ArrowRight className="h-6 w-6" />
              </button>

              {usesRemaining !== null && (
                <p className="propiq-uses-remaining">
                  {usesRemaining} free {usesRemaining === 1 ? 'analysis' : 'analyses'} remaining
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State - Enhanced P2 Fix */}
        {step === 'loading' && (
          <div className="propiq-loading">
            <div className="propiq-loading-header">
              <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
              <h3>Analyzing Property...</h3>
              <p className="propiq-loading-subtitle">This typically takes 10-20 seconds</p>
            </div>

            <div className="propiq-loading-steps">
              <div className="propiq-loading-step active">
                <div className="propiq-step-icon">
                  <Target className="h-5 w-5" />
                </div>
                <div className="propiq-step-content">
                  <h4>Market Analysis</h4>
                  <p>Evaluating location, comparable properties, and market trends</p>
                </div>
              </div>

              <div className="propiq-loading-step active">
                <div className="propiq-step-icon">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="propiq-step-content">
                  <h4>Financial Modeling</h4>
                  <p>Calculating ROI, cash flow, and investment metrics</p>
                </div>
              </div>

              <div className="propiq-loading-step active">
                <div className="propiq-step-icon">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="propiq-step-content">
                  <h4>Risk Assessment</h4>
                  <p>Identifying potential concerns and opportunities</p>
                </div>
              </div>
            </div>

            <div className="propiq-loading-footer">
              <p className="propiq-loading-note">
                <span className="propiq-pulse-dot"></span>
                AI analysis in progress - please don't close this window
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {step === 'results' && analysis && (
          <div className="propiq-results" id="propiq-analysis-results">
            {/* Success Message Banner */}
            {showSuccessMessage && (
              <div className="propiq-success-banner" style={{
                padding: '16px',
                marginBottom: '24px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideInDown 0.3s ease-out'
              }}>
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#10b981',
                    marginBottom: '4px'
                  }}>
                    Analysis Saved Successfully! ✓
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    Your analysis has been saved to your account.{' '}
                    {savedAnalysisId && <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      (ID: {savedAnalysisId.slice(0, 8)}...)
                    </span>}
                    {usesRemaining !== null && (
                      <span style={{ marginLeft: '8px', fontWeight: 500, color: '#10b981' }}>
                        {usesRemaining} {usesRemaining === 1 ? 'analysis' : 'analyses'} remaining.
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  aria-label="Dismiss success message"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Executive Summary */}
            <div className="propiq-section propiq-summary">
              <FileText className="h-5 w-5 text-violet-300" />
              <div>
                <h3>Executive Summary</h3>
                <p>{analysis.summary}</p>
              </div>
            </div>

            {/* Investment Recommendation */}
            {analysis.investment && (
              <div className="propiq-section propiq-recommendation">
                {(() => {
                  const badge = getRecommendationBadge(analysis.investment.recommendation);
                  const Icon = badge.icon;
                  return (
                    <>
                      <div className="propiq-recommendation-header">
                        <Icon className="h-6 w-6" />
                        <h3>
                          Investment Recommendation
                          <Tooltip text="AI-powered assessment based on financials, market data, and risk factors." />
                        </h3>
                      </div>
                      <div className="propiq-badges">
                        <span className={`propiq-badge ${badge.color}`}>{badge.text}</span>
                        <span className={`propiq-badge ${getRiskBadge(analysis.investment.riskLevel).color}`}>
                          {getRiskBadge(analysis.investment.riskLevel).text}
                          <Tooltip text="Risk assessment based on market volatility, location, and deal structure." />
                        </span>
                        <span className="propiq-badge">
                          {analysis.investment.confidenceScore}% Confidence
                          <Tooltip text="How certain our AI is about this recommendation based on data quality." />
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Location & Market */}
            {analysis.location && (
              <div className="propiq-section">
                <div className="propiq-section-header">
                  <MapPin className="h-5 w-5 text-violet-300" />
                  <h3>Location & Market</h3>
                </div>
                <div className="propiq-metrics">
                  <div className="propiq-metric">
                    <span className="propiq-metric-label">Neighborhood</span>
                    <span className="propiq-metric-value">{analysis.location.neighborhood}</span>
                  </div>
                  <div className="propiq-metric">
                    <span className="propiq-metric-label">City, State</span>
                    <span className="propiq-metric-value">{analysis.location.city}, {analysis.location.state}</span>
                  </div>
                  <div className="propiq-metric">
                    <span className="propiq-metric-label">Market Trend</span>
                    <span className="propiq-metric-value">
                      {getMarketTrendIcon(analysis.location.marketTrend)}
                      {analysis.location.marketTrend.toUpperCase()}
                    </span>
                  </div>
                  <div className="propiq-metric">
                    <span className="propiq-metric-label">Market Score</span>
                    <span className="propiq-metric-value">{analysis.location.marketScore}/100</span>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Metrics */}
            <div className="propiq-section">
              <div className="propiq-section-header">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                <h3>Financial Metrics</h3>
              </div>
              <div className="propiq-metrics">
                <div className="propiq-metric">
                  <span className="propiq-metric-label">Estimated Value</span>
                  <span className="propiq-metric-value">${analysis.financials.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="propiq-metric">
                  <span className="propiq-metric-label">Est. Monthly Rent</span>
                  <span className="propiq-metric-value">${analysis.financials.estimatedRent.toLocaleString()}/mo</span>
                </div>
                <div className="propiq-metric">
                  <span className="propiq-metric-label">
                    Monthly Cash Flow
                    <Tooltip text="Money left after all expenses each month. Positive = profit, negative = loss." />
                  </span>
                  <span className={`propiq-metric-value ${analysis.financials.cashFlow >= 0 ? 'positive' : 'negative'}`}>
                    ${analysis.financials.cashFlow.toLocaleString()}/mo
                  </span>
                </div>
                <div className="propiq-metric">
                  <span className="propiq-metric-label">
                    Cap Rate
                    <Tooltip text="Annual return if bought in cash. Higher is better. Target: 8-10%." />
                  </span>
                  <span className="propiq-metric-value">{analysis.financials.capRate.toFixed(2)}%</span>
                </div>
                <div className="propiq-metric">
                  <span className="propiq-metric-label">
                    ROI
                    <Tooltip text="Return on Investment - how much profit you make vs what you put in." />
                  </span>
                  <span className={`propiq-metric-value ${analysis.financials.roi >= 0 ? 'positive' : 'negative'}`}>
                    {analysis.financials.roi.toFixed(2)}%
                  </span>
                </div>
                <div className="propiq-metric">
                  <span className="propiq-metric-label">Monthly Mortgage</span>
                  <span className="propiq-metric-value">${analysis.financials.monthlyMortgage.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="propiq-pros-cons">
              <div className="propiq-section propiq-pros">
                <div className="propiq-section-header">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <h3>Advantages</h3>
                </div>
                <ul>
                  {analysis.pros.map((pro, index) => (
                    <li key={index}>
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="propiq-section propiq-cons">
                <div className="propiq-section-header">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <h3>Considerations</h3>
                </div>
                <ul>
                  {analysis.cons.map((con, index) => (
                    <li key={index}>
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key Insights */}
            <div className="propiq-section">
              <div className="propiq-section-header">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <h3>Key Insights</h3>
              </div>
              <ul className="propiq-insights">
                {analysis.keyInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="propiq-section propiq-next-steps">
              <div className="propiq-section-header">
                <ArrowRight className="h-5 w-5 text-violet-300" />
                <h3>Recommended Next Steps</h3>
              </div>
              <ol className="propiq-steps-list">
                {analysis.nextSteps.map((step, index) => (
                  <li key={index}>
                    <span className="propiq-step-number">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="propiq-actions">
              <div className="flex flex-wrap gap-3 w-full">
                <PrintButton
                  elementId="propiq-analysis-results"
                  printOptions={{
                    title: `PropIQ Analysis - ${analysis._metadata?.address || address}`,
                    includeDate: true,
                    orientation: 'portrait'
                  }}
                  variant="outline"
                  size="md"
                  className="flex-1 min-w-[160px]"
                />
                <PDFExportButton
                  analysis={{
                    address: analysis._metadata?.address || address,
                    propertyType,
                    purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
                    summary: analysis.summary,
                    location: analysis.location,
                    financials: analysis.financials,
                    investment: analysis.investment,
                    pros: analysis.pros,
                    cons: analysis.cons,
                    keyInsights: analysis.keyInsights,
                    nextSteps: analysis.nextSteps,
                    analyzedAt: analysis._metadata?.analyzedAt
                  }}
                  variant="secondary"
                  size="md"
                  className="flex-1 min-w-[160px]"
                />
              </div>
              <div className="flex gap-3 mt-3 w-full">
                <button onClick={() => setStep('input')} className="propiq-btn-secondary flex-1">
                  Analyze Another Property
                </button>
                <button onClick={onClose} className="propiq-btn-primary flex-1">
                  Close
                </button>
              </div>
            </div>

            {usesRemaining !== null && (
              <p className="propiq-uses-remaining">
                {usesRemaining} free {usesRemaining === 1 ? 'analysis' : 'analyses'} remaining
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
