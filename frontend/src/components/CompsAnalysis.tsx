import { useState, useEffect } from 'react';
import {
  Home,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  MapPin,
  BarChart3,
  Target,
  Thermometer,
  Clock,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import './CompsAnalysis.css';

interface ComparableProperty {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  distance: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  listPrice?: number;
  salePrice?: number;
  saleDate?: string;
  daysOnMarket?: number;
  status: 'sold' | 'active' | 'pending';
  pricePerSqft: number;
  similarityScore: number;
}

interface MarketMetrics {
  medianListPrice: number;
  medianSalePrice: number;
  medianPricePerSqft: number;
  avgDaysOnMarket: number;
  inventoryCount: number;
  monthsOfSupply: number;
  priceChange30Day: number;
  priceChange90Day: number;
  priceChangeYoY: number;
  marketTemperature: string;
  buyerSellerRatio: number;
}

interface CompsData {
  subjectProperty: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    yearBuilt: number;
    targetPrice?: number;
  };
  comparables: ComparableProperty[];
  marketMetrics: MarketMetrics;
  estimatedValue: number;
  estimatedValueLow: number;
  estimatedValueHigh: number;
  confidence: number;
  methodology: string;
  analyzedAt: string;
}

interface CompsAnalysisProps {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  yearBuilt?: number;
  targetPrice?: number;
  onClose?: () => void;
  compact?: boolean;
}

export const CompsAnalysis: React.FC<CompsAnalysisProps> = ({
  address,
  city,
  state,
  zipCode,
  propertyType = 'single_family',
  bedrooms = 3,
  bathrooms = 2,
  sqft = 1500,
  yearBuilt = 2000,
  targetPrice,
  onClose,
  compact = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CompsData | null>(null);
  const [expandedComp, setExpandedComp] = useState<number | null>(null);
  const [showAllComps, setShowAllComps] = useState(false);

  useEffect(() => {
    loadComps();
  }, [address]);

  const loadComps = async () => {
    if (!address || !city || !state || !zipCode) {
      setError('Missing property information');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        address,
        city,
        state,
        zipcode: zipCode,
        property_type: propertyType,
        bedrooms: bedrooms.toString(),
        bathrooms: bathrooms.toString(),
        sqft: sqft.toString(),
        year_built: yearBuilt.toString()
      });

      if (targetPrice) {
        params.append('target_price', targetPrice.toString());
      }

      const response = await apiClient.get(`${API_ENDPOINTS.COMPS_ANALYZE}?${params}`);

      if (response.data.success) {
        setData(response.data);
      } else {
        setError('Failed to load comparable properties');
      }
    } catch (err: any) {
      console.error('Comps analysis error:', err);
      setError(err.response?.data?.detail || 'Failed to analyze comparable properties');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number, showSign = true) => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sold':
        return 'status-sold';
      case 'active':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case 'hot':
        return <Thermometer className="h-4 w-4 text-red-400" />;
      case 'warm':
        return <Thermometer className="h-4 w-4 text-orange-400" />;
      case 'balanced':
        return <Thermometer className="h-4 w-4 text-yellow-400" />;
      case 'cool':
        return <Thermometer className="h-4 w-4 text-blue-300" />;
      case 'cold':
        return <Thermometer className="h-4 w-4 text-blue-500" />;
      default:
        return <Thermometer className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 1) {
      return <ArrowUpRight className="h-4 w-4 text-green-400" />;
    } else if (value < -1) {
      return <ArrowDownRight className="h-4 w-4 text-red-400" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 85) return 'similarity-high';
    if (score >= 70) return 'similarity-medium';
    return 'similarity-low';
  };

  if (loading) {
    return (
      <div className="comps-loading">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p>Analyzing comparable properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comps-error">
        <AlertCircle className="h-6 w-6" />
        <p>{error}</p>
        <button onClick={loadComps} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const displayedComps = showAllComps ? data.comparables : data.comparables.slice(0, 5);

  return (
    <div className={`comps-analysis ${compact ? 'compact' : ''}`}>
      {/* Header */}
      <div className="comps-header">
        <div className="comps-header-left">
          <BarChart3 className="h-5 w-5 text-violet-400" />
          <h3>Comparable Properties Analysis</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="comps-close-btn">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Value Estimate */}
      <div className="comps-value-estimate">
        <div className="value-main">
          <span className="value-label">Estimated Value</span>
          <span className="value-amount">{formatCurrency(data.estimatedValue)}</span>
          <span className="value-range">
            Range: {formatCurrency(data.estimatedValueLow)} - {formatCurrency(data.estimatedValueHigh)}
          </span>
        </div>
        <div className="value-confidence">
          <div className="confidence-circle">
            <span className="confidence-value">{data.confidence}%</span>
            <span className="confidence-label">Confidence</span>
          </div>
        </div>
      </div>

      {/* Market Metrics */}
      <div className="comps-market-metrics">
        <h4>
          <MapPin className="h-4 w-4" />
          Market Overview - {data.subjectProperty.zipCode}
        </h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="metric-content">
              <span className="metric-value">{formatCurrency(data.marketMetrics.medianSalePrice)}</span>
              <span className="metric-label">Median Sale Price</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Target className="h-4 w-4" />
            </div>
            <div className="metric-content">
              <span className="metric-value">${data.marketMetrics.medianPricePerSqft}/sqft</span>
              <span className="metric-label">Price per Sqft</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Clock className="h-4 w-4" />
            </div>
            <div className="metric-content">
              <span className="metric-value">{data.marketMetrics.avgDaysOnMarket} days</span>
              <span className="metric-label">Avg Days on Market</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Package className="h-4 w-4" />
            </div>
            <div className="metric-content">
              <span className="metric-value">{data.marketMetrics.inventoryCount}</span>
              <span className="metric-label">Active Listings</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              {getTemperatureIcon(data.marketMetrics.marketTemperature)}
            </div>
            <div className="metric-content">
              <span className="metric-value capitalize">{data.marketMetrics.marketTemperature}</span>
              <span className="metric-label">Market Temperature</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              {getTrendIcon(data.marketMetrics.priceChangeYoY)}
            </div>
            <div className="metric-content">
              <span className={`metric-value ${data.marketMetrics.priceChangeYoY >= 0 ? 'positive' : 'negative'}`}>
                {formatPercent(data.marketMetrics.priceChangeYoY)}
              </span>
              <span className="metric-label">YoY Price Change</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparable Properties */}
      <div className="comps-list">
        <h4>
          <Home className="h-4 w-4" />
          Similar Properties ({data.comparables.length} found)
        </h4>

        <div className="comps-table">
          <div className="comps-table-header">
            <span className="col-address">Address</span>
            <span className="col-details">Details</span>
            <span className="col-price">Price</span>
            <span className="col-score">Match</span>
          </div>

          {displayedComps.map((comp, index) => (
            <div
              key={index}
              className={`comp-row ${expandedComp === index ? 'expanded' : ''}`}
              onClick={() => setExpandedComp(expandedComp === index ? null : index)}
            >
              <div className="comp-row-main">
                <div className="col-address">
                  <span className="comp-address">{comp.address}</span>
                  <span className="comp-location">
                    {comp.city}, {comp.state} {comp.zipCode}
                  </span>
                  <span className={`comp-status ${getStatusColor(comp.status)}`}>
                    {comp.status.toUpperCase()}
                  </span>
                </div>

                <div className="col-details">
                  <span className="detail-item">{comp.bedrooms} bd / {comp.bathrooms} ba</span>
                  <span className="detail-item">{comp.sqft.toLocaleString()} sqft</span>
                  <span className="detail-item">Built {comp.yearBuilt}</span>
                </div>

                <div className="col-price">
                  <span className="comp-price">
                    {comp.salePrice ? formatCurrency(comp.salePrice) : formatCurrency(comp.listPrice || 0)}
                  </span>
                  <span className="comp-ppsf">${comp.pricePerSqft}/sqft</span>
                </div>

                <div className="col-score">
                  <div className={`similarity-badge ${getSimilarityColor(comp.similarityScore)}`}>
                    {comp.similarityScore}%
                  </div>
                </div>
              </div>

              {expandedComp === index && (
                <div className="comp-row-expanded">
                  <div className="expanded-details">
                    <div className="detail-group">
                      <span className="detail-label">Distance</span>
                      <span className="detail-value">{comp.distance} miles</span>
                    </div>
                    {comp.daysOnMarket && (
                      <div className="detail-group">
                        <span className="detail-label">Days on Market</span>
                        <span className="detail-value">{comp.daysOnMarket}</span>
                      </div>
                    )}
                    {comp.saleDate && (
                      <div className="detail-group">
                        <span className="detail-label">Sale Date</span>
                        <span className="detail-value">{comp.saleDate}</span>
                      </div>
                    )}
                    <div className="detail-group">
                      <span className="detail-label">Property Type</span>
                      <span className="detail-value capitalize">{comp.propertyType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {data.comparables.length > 5 && (
          <button
            className="show-more-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowAllComps(!showAllComps);
            }}
          >
            {showAllComps ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show All {data.comparables.length} Comps
              </>
            )}
          </button>
        )}
      </div>

      {/* Methodology */}
      <div className="comps-methodology">
        <p>{data.methodology}</p>
        <span className="analyzed-at">
          Analyzed: {new Date(data.analyzedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default CompsAnalysis;
