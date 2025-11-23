import { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Clock,
  Zap,
  AlertCircle,
  Loader2,
  Gift,
  Users,
  DollarSign,
  Share2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import './DeveloperPortal.css';

interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  key?: string;
  scopes: string[];
  rateLimit: number;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

interface UsageStats {
  totalCalls: number;
  callsToday: number;
  callsThisMonth: number;
  avgResponseTime: number;
  successRate: number;
  topEndpoints: { endpoint: string; calls: number }[];
  dailyUsage: { date: string; calls: number }[];
}

interface ReferralCode {
  code: string;
  rewardPercent: number;
  discountPercent: number;
  usageCount: number;
  totalEarnings: number;
  isActive: boolean;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  conversionRate: number;
}

type TabType = 'api-keys' | 'usage' | 'referrals';

export const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('api-keys');
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referralUrl, setReferralUrl] = useState<string>('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create key modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState(['read', 'analyze']);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // UI states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [keysRes, usageRes, referralRes, statsRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.API_KEYS),
        apiClient.get(API_ENDPOINTS.API_USAGE),
        apiClient.post(API_ENDPOINTS.REFERRAL_CODE),
        apiClient.get(API_ENDPOINTS.REFERRAL_STATS)
      ]);

      setApiKeys(keysRes.data.keys || []);
      setUsage(usageRes.data);
      if (referralRes.data.code) {
        setReferralCode(referralRes.data.code);
        setReferralUrl(referralRes.data.referralUrl);
      }
      setReferralStats(statsRes.data);
    } catch (err: any) {
      console.error('Failed to load developer portal data:', err);
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for your API key');
      return;
    }

    setCreating(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.API_KEYS, {
        name: newKeyName,
        scopes: newKeyScopes,
        rateLimit: 100
      });

      if (response.data.key) {
        setCreatedKey(response.data.key);
        setApiKeys(prev => [...prev, response.data]);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.API_KEY(keyId));
      setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, isActive: false } : k));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to revoke API key');
    }
  };

  const copyToClipboard = async (text: string, type: 'key' | 'referral') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'key') {
        setCopiedKey(text);
        setTimeout(() => setCopiedKey(null), 2000);
      } else {
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
      }
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="dev-portal-loading">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p>Loading developer portal...</p>
      </div>
    );
  }

  return (
    <div className="dev-portal">
      {/* Header */}
      <div className="dev-portal-header">
        <div className="dev-portal-header-left">
          <Key className="h-6 w-6 text-violet-400" />
          <h1>Developer Portal</h1>
        </div>
        <button onClick={loadData} className="refresh-btn">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="dev-portal-error">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="dev-portal-tabs">
        <button
          className={`dev-tab ${activeTab === 'api-keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('api-keys')}
        >
          <Key className="h-4 w-4" />
          API Keys
        </button>
        <button
          className={`dev-tab ${activeTab === 'usage' ? 'active' : ''}`}
          onClick={() => setActiveTab('usage')}
        >
          <BarChart3 className="h-4 w-4" />
          Usage Stats
        </button>
        <button
          className={`dev-tab ${activeTab === 'referrals' ? 'active' : ''}`}
          onClick={() => setActiveTab('referrals')}
        >
          <Gift className="h-4 w-4" />
          Referral Program
        </button>
      </div>

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="dev-content">
          <div className="content-header">
            <div>
              <h2>Your API Keys</h2>
              <p>Manage API keys for programmatic access to PropIQ</p>
            </div>
            <button
              className="create-key-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4" />
              Create New Key
            </button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="empty-state">
              <Key className="h-12 w-12 text-gray-500" />
              <h3>No API keys yet</h3>
              <p>Create an API key to start using the PropIQ API</p>
            </div>
          ) : (
            <div className="api-keys-list">
              {apiKeys.map(key => (
                <div
                  key={key.id}
                  className={`api-key-card ${!key.isActive ? 'revoked' : ''}`}
                >
                  <div className="key-header">
                    <div className="key-info">
                      <h4>{key.name}</h4>
                      <span className={`key-status ${key.isActive ? 'active' : 'revoked'}`}>
                        {key.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    {key.isActive && (
                      <button
                        className="revoke-btn"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="key-value">
                    <code>{key.keyPrefix}...</code>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(key.keyPrefix, 'key')}
                    >
                      {copiedKey === key.keyPrefix ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="key-meta">
                    <span><Clock className="h-3 w-3" /> Created {formatDate(key.createdAt)}</span>
                    <span><Zap className="h-3 w-3" /> {key.usageCount} calls</span>
                    <span>Rate: {key.rateLimit}/min</span>
                  </div>

                  <div className="key-scopes">
                    {key.scopes.map(scope => (
                      <span key={scope} className="scope-badge">{scope}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* API Documentation Link */}
          <div className="api-docs-link">
            <ExternalLink className="h-4 w-4" />
            <a href="https://docs.propiq.luntra.one" target="_blank" rel="noopener noreferrer">
              View API Documentation
            </a>
          </div>
        </div>
      )}

      {/* Usage Stats Tab */}
      {activeTab === 'usage' && usage && (
        <div className="dev-content">
          <h2>API Usage Statistics</h2>

          <div className="usage-grid">
            <div className="usage-card">
              <div className="usage-icon">
                <Zap className="h-5 w-5" />
              </div>
              <div className="usage-content">
                <span className="usage-value">{usage.totalCalls.toLocaleString()}</span>
                <span className="usage-label">Total API Calls</span>
              </div>
            </div>

            <div className="usage-card">
              <div className="usage-icon today">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="usage-content">
                <span className="usage-value">{usage.callsToday}</span>
                <span className="usage-label">Calls Today</span>
              </div>
            </div>

            <div className="usage-card">
              <div className="usage-icon month">
                <Clock className="h-5 w-5" />
              </div>
              <div className="usage-content">
                <span className="usage-value">{usage.callsThisMonth.toLocaleString()}</span>
                <span className="usage-label">This Month</span>
              </div>
            </div>

            <div className="usage-card">
              <div className="usage-icon success">
                <Check className="h-5 w-5" />
              </div>
              <div className="usage-content">
                <span className="usage-value">{usage.successRate}%</span>
                <span className="usage-label">Success Rate</span>
              </div>
            </div>
          </div>

          <div className="usage-section">
            <h3>Top Endpoints</h3>
            <div className="endpoints-list">
              {usage.topEndpoints.map((endpoint, index) => (
                <div key={index} className="endpoint-row">
                  <code>{endpoint.endpoint}</code>
                  <span className="endpoint-calls">{endpoint.calls.toLocaleString()} calls</span>
                </div>
              ))}
            </div>
          </div>

          <div className="usage-section">
            <h3>Daily Usage (Last 7 Days)</h3>
            <div className="daily-chart">
              {usage.dailyUsage.map((day, index) => (
                <div key={index} className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${Math.max(10, (day.calls / Math.max(...usage.dailyUsage.map(d => d.calls))) * 100)}%`
                    }}
                  />
                  <span className="chart-label">{day.date.slice(-5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="dev-content">
          <h2>Referral Program</h2>
          <p className="section-desc">
            Earn 20% of your referral's first payment. They get 10% off their first month!
          </p>

          {/* Referral Code */}
          {referralCode && (
            <div className="referral-code-section">
              <h3>Your Referral Code</h3>
              <div className="referral-code-box">
                <code>{referralCode.code}</code>
                <button
                  className="copy-btn large"
                  onClick={() => copyToClipboard(referralCode.code, 'referral')}
                >
                  {copiedReferral ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              <div className="referral-url-box">
                <span className="url-label">Share this link:</span>
                <input
                  type="text"
                  value={referralUrl}
                  readOnly
                  className="referral-url-input"
                />
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(referralUrl, 'referral')}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Referral Stats */}
          {referralStats && (
            <div className="referral-stats-grid">
              <div className="stat-card">
                <Users className="h-5 w-5 text-violet-400" />
                <div className="stat-content">
                  <span className="stat-value">{referralStats.totalReferrals}</span>
                  <span className="stat-label">Total Referrals</span>
                </div>
              </div>

              <div className="stat-card">
                <Zap className="h-5 w-5 text-green-400" />
                <div className="stat-content">
                  <span className="stat-value">{referralStats.convertedReferrals}</span>
                  <span className="stat-label">Converted</span>
                </div>
              </div>

              <div className="stat-card">
                <DollarSign className="h-5 w-5 text-amber-400" />
                <div className="stat-content">
                  <span className="stat-value">{formatCurrency(referralStats.totalEarnings)}</span>
                  <span className="stat-label">Total Earnings</span>
                </div>
              </div>

              <div className="stat-card">
                <Gift className="h-5 w-5 text-blue-400" />
                <div className="stat-content">
                  <span className="stat-value">{formatCurrency(referralStats.pendingEarnings)}</span>
                  <span className="stat-label">Pending Payout</span>
                </div>
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="how-it-works">
            <h3>How It Works</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Share your link</h4>
                  <p>Send your referral link to friends and colleagues</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>They sign up</h4>
                  <p>They get 10% off their first month</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>You earn</h4>
                  <p>Receive 20% of their first payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => !creating && setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {!createdKey ? (
              <>
                <h3>Create New API Key</h3>
                <div className="form-group">
                  <label>Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API Key"
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label>Permissions</label>
                  <div className="scope-checkboxes">
                    {['read', 'analyze', 'share', 'portfolio'].map(scope => (
                      <label key={scope} className="scope-checkbox">
                        <input
                          type="checkbox"
                          checked={newKeyScopes.includes(scope)}
                          onChange={e => {
                            if (e.target.checked) {
                              setNewKeyScopes(prev => [...prev, scope]);
                            } else {
                              setNewKeyScopes(prev => prev.filter(s => s !== scope));
                            }
                          }}
                        />
                        <span className="capitalize">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-create"
                    onClick={handleCreateKey}
                    disabled={creating || !newKeyName.trim()}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        Create Key
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="success-icon">
                  <Check className="h-8 w-8" />
                </div>
                <h3>API Key Created!</h3>
                <p className="warning-text">
                  Copy your API key now. You won't be able to see it again!
                </p>

                <div className="created-key-box">
                  <code>{createdKey}</code>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(createdKey, 'key')}
                  >
                    {copiedKey === createdKey ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <button
                  className="btn-done"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreatedKey(null);
                    setNewKeyName('');
                  }}
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperPortal;
