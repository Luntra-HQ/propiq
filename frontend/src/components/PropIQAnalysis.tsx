import { useState, useCallback } from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, X, Loader2, FileText, MapPin, DollarSign, BarChart3, Lightbulb, ArrowRight, Zap } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import { PrintButton } from './PrintButton';
import { PDFExportButton } from './PDFExportButton';
import { Tooltip } from './Tooltip';
import { PropertyImageGallery } from './PropertyImageGallery';
import './PropIQAnalysis.css';

interface PropIQAnalysisProps {
  onClose: () => void;
  userId: string | null;
  authToken: string | null;
}

interface PropertyImage {
  url: string;
  type: string;
  width: number;
  height: number;
  heading?: number;
  source: string;
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
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);

  // Callback to handle when property images are loaded
  const handleImagesLoaded = useCallback((images: PropertyImage[], primaryUrl: string | null) => {
    setPropertyImages(images);
    setPrimaryImageUrl(primaryUrl);
  }, []);

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

    // Basic validation
    if (!trimmedAddress) {
      setError('Please enter a property address');
      return;
    }

    // Enhanced validation: Check for minimum address components
    // A valid address should have at least: number + street + (city or state)
    const hasNumber = /\d/.test(trimmedAddress);
    const hasComma = trimmedAddress.includes(',');
    const wordCount = trimmedAddress.split(/\s+/).length;

    if (!hasNumber) {
      setError('Please include a street number (e.g., "123 Main St, City, State")');
      return;
    }

    if (wordCount < 3) {
      setError('Please enter a complete address (e.g., "123 Main St, City, State 12345")');
      return;
    }

    if (!hasComma && wordCount < 5) {
      setError('Please include city and state (e.g., "123 Main St, City, State 12345")');
      return;
    }

    if (!authToken) {
      setError('You must be logged in to use PropIQ Analysis');
      return;
    }

    setStep('loading');
    setError(null);

    try {
      const response = await apiClient.post(API_ENDPOINTS.PROPIQ_ANALYZE, {
        address: address.trim(),
        propertyType,
        purchasePrice: purchasePrice || null,
        downPayment: downPayment || null,
        interestRate: interestRate || null,
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
        setUsesRemaining(response.data.usesRemaining);
        setStep('results');
      } else {
        setError(response.data.error || 'Analysis failed');
        setStep('input');
      }
    } catch (err: any) {
      console.error('PropIQ Analysis error:', err);

      if (err.response?.status === 403) {
        setError('No analyses remaining. Please upgrade to a paid plan.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.detail || 'Failed to analyze property. Please try again.');
      }

      setStep('input');
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

            {/* Property Image Gallery - Shows images as user types address */}
            {authToken && (
              <div className="propiq-image-section">
                <PropertyImageGallery
                  address={address}
                  onImagesLoaded={handleImagesLoaded}
                  compact={true}
                  showControls={true}
                />
              </div>
            )}

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
                  className="propiq-input"
                  autoFocus
                  aria-label="Property Address"
                  aria-required="true"
                />
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
            {/* Property Images at top of results */}
            {propertyImages.length > 0 && (
              <div className="propiq-results-images">
                <PropertyImageGallery
                  address={analysis._metadata?.address || address}
                  onImagesLoaded={handleImagesLoaded}
                  compact={false}
                  showControls={true}
                />
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

            {/* Location & Market */}
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
                    analyzedAt: analysis._metadata?.analyzedAt,
                    propertyImageUrl: primaryImageUrl || undefined
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
