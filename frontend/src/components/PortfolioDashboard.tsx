import { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bell,
  Plus,
  Eye,
  Trash2,
  Edit3,
  MoreVertical,
  Home,
  AlertCircle,
  Check,
  X,
  Loader2,
  ChevronRight,
  Target,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import './PortfolioDashboard.css';

interface SavedProperty {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  purchasePrice?: number;
  currentValue?: number;
  monthlyRent?: number;
  status: 'watching' | 'owned' | 'under_contract' | 'sold';
  propertyType?: string;
  dealScore?: number;
  notes?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

interface PortfolioSummary {
  totalProperties: number;
  ownedCount: number;
  watchingCount: number;
  totalValue: number;
  totalEquity: number;
  totalMonthlyIncome: number;
  totalCashFlow: number;
  avgDealScore: number;
}

interface DealAlert {
  id: string;
  name: string;
  isActive: boolean;
  cities?: string[];
  states?: string[];
  minPrice?: number;
  maxPrice?: number;
  minDealScore?: number;
  frequency: 'instant' | 'daily' | 'weekly';
  matchCount: number;
  lastMatchAt?: number;
  createdAt: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: number;
}

type TabType = 'properties' | 'alerts' | 'notifications';

export const PortfolioDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  const [properties, setProperties] = useState<SavedProperty[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [alerts, setAlerts] = useState<DealAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    cities: '',
    states: '',
    minPrice: '',
    maxPrice: '',
    minDealScore: '',
    frequency: 'daily' as const
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [propertiesRes, summaryRes, alertsRes, notificationsRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.PORTFOLIO_PROPERTIES),
        apiClient.get(API_ENDPOINTS.PORTFOLIO_SUMMARY),
        apiClient.get(API_ENDPOINTS.PORTFOLIO_ALERTS),
        apiClient.get(API_ENDPOINTS.PORTFOLIO_NOTIFICATIONS)
      ]);

      setProperties(propertiesRes.data.properties || []);
      setSummary(summaryRes.data);
      setAlerts(alertsRes.data.alerts || []);
      setNotifications(notificationsRes.data.notifications || []);
    } catch (err: any) {
      console.error('Failed to load portfolio data:', err);
      setError(err.response?.data?.detail || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to remove this property from your portfolio?')) return;

    try {
      await apiClient.delete(API_ENDPOINTS.PORTFOLIO_PROPERTY(propertyId));
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete property');
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      await apiClient.put(API_ENDPOINTS.PORTFOLIO_ALERT(alertId), {
        is_active: !isActive
      });
      setAlerts(prev =>
        prev.map(a => (a.id === alertId ? { ...a, isActive: !isActive } : a))
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update alert');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      await apiClient.delete(API_ENDPOINTS.PORTFOLIO_ALERT(alertId));
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete alert');
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.name.trim()) {
      alert('Please enter an alert name');
      return;
    }

    try {
      const response = await apiClient.post(API_ENDPOINTS.PORTFOLIO_ALERTS, {
        name: newAlert.name,
        cities: newAlert.cities ? newAlert.cities.split(',').map(c => c.trim()) : undefined,
        states: newAlert.states ? newAlert.states.split(',').map(s => s.trim()) : undefined,
        min_price: newAlert.minPrice ? parseFloat(newAlert.minPrice) : undefined,
        max_price: newAlert.maxPrice ? parseFloat(newAlert.maxPrice) : undefined,
        min_deal_score: newAlert.minDealScore ? parseFloat(newAlert.minDealScore) : undefined,
        frequency: newAlert.frequency
      });

      if (response.data.alert) {
        setAlerts(prev => [...prev, response.data.alert]);
      }
      setShowAddAlert(false);
      setNewAlert({
        name: '',
        cities: '',
        states: '',
        minPrice: '',
        maxPrice: '',
        minDealScore: '',
        frequency: 'daily'
      });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create alert');
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await apiClient.put(API_ENDPOINTS.PORTFOLIO_NOTIFICATION_READ(notificationId));
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put(API_ENDPOINTS.PORTFOLIO_NOTIFICATIONS_READ_ALL);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'owned':
        return 'status-owned';
      case 'watching':
        return 'status-watching';
      case 'under_contract':
        return 'status-contract';
      case 'sold':
        return 'status-sold';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'owned':
        return 'Owned';
      case 'watching':
        return 'Watching';
      case 'under_contract':
        return 'Under Contract';
      case 'sold':
        return 'Sold';
      default:
        return status;
    }
  };

  const filteredProperties =
    statusFilter === 'all'
      ? properties
      : properties.filter(p => p.status === statusFilter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="portfolio-loading">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  return (
    <div className="portfolio-dashboard">
      {/* Header */}
      <div className="portfolio-header">
        <div className="portfolio-header-left">
          <Building2 className="h-7 w-7 text-violet-400" />
          <h1>Investment Portfolio</h1>
        </div>
      </div>

      {error && (
        <div className="portfolio-error">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="portfolio-summary-grid">
          <div className="summary-card">
            <div className="summary-card-icon owned">
              <Home className="h-5 w-5" />
            </div>
            <div className="summary-card-content">
              <span className="summary-label">Total Properties</span>
              <span className="summary-value">{summary.totalProperties}</span>
              <span className="summary-detail">
                {summary.ownedCount} owned, {summary.watchingCount} watching
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-icon value">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="summary-card-content">
              <span className="summary-label">Portfolio Value</span>
              <span className="summary-value">{formatCurrency(summary.totalValue)}</span>
              <span className="summary-detail">
                {formatCurrency(summary.totalEquity)} equity
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-icon income">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="summary-card-content">
              <span className="summary-label">Monthly Income</span>
              <span className="summary-value">{formatCurrency(summary.totalMonthlyIncome)}</span>
              <span className="summary-detail positive">
                <ArrowUpRight className="h-3 w-3" />
                {formatCurrency(summary.totalCashFlow)} cash flow
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-icon score">
              <Target className="h-5 w-5" />
            </div>
            <div className="summary-card-content">
              <span className="summary-label">Avg Deal Score</span>
              <span className="summary-value">{summary.avgDealScore.toFixed(0)}</span>
              <span className="summary-detail">out of 100</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="portfolio-tabs">
        <button
          className={`portfolio-tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          <Building2 className="h-4 w-4" />
          Properties
          <span className="tab-count">{properties.length}</span>
        </button>
        <button
          className={`portfolio-tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <Bell className="h-4 w-4" />
          Deal Alerts
          <span className="tab-count">{alerts.length}</span>
        </button>
        <button
          className={`portfolio-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && <span className="tab-count unread">{unreadCount}</span>}
        </button>
      </div>

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="portfolio-content">
          <div className="content-header">
            <div className="status-filters">
              {['all', 'watching', 'owned', 'under_contract', 'sold'].map(status => (
                <button
                  key={status}
                  className={`status-filter ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'All' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="empty-state">
              <Bookmark className="h-12 w-12 text-gray-500" />
              <h3>No properties yet</h3>
              <p>Save properties from your analyses to track them here</p>
            </div>
          ) : (
            <div className="properties-grid">
              {filteredProperties.map(property => (
                <div key={property.id} className="property-card">
                  <div className="property-card-header">
                    <div className="property-address">
                      <Home className="h-4 w-4 text-violet-400" />
                      <span>{property.address}</span>
                    </div>
                    <span className={`property-status ${getStatusColor(property.status)}`}>
                      {getStatusLabel(property.status)}
                    </span>
                  </div>

                  <div className="property-card-body">
                    {property.city && (
                      <p className="property-location">
                        {property.city}
                        {property.state && `, ${property.state}`}
                        {property.zipCode && ` ${property.zipCode}`}
                      </p>
                    )}

                    <div className="property-metrics">
                      {property.currentValue && (
                        <div className="metric">
                          <span className="metric-label">Value</span>
                          <span className="metric-value">
                            {formatCurrency(property.currentValue)}
                          </span>
                        </div>
                      )}
                      {property.monthlyRent && (
                        <div className="metric">
                          <span className="metric-label">Rent</span>
                          <span className="metric-value">
                            {formatCurrency(property.monthlyRent)}/mo
                          </span>
                        </div>
                      )}
                      {property.dealScore !== undefined && (
                        <div className="metric">
                          <span className="metric-label">Score</span>
                          <span className="metric-value score">{property.dealScore}</span>
                        </div>
                      )}
                    </div>

                    {property.notes && (
                      <p className="property-notes">{property.notes}</p>
                    )}

                    {property.tags && property.tags.length > 0 && (
                      <div className="property-tags">
                        {property.tags.map(tag => (
                          <span key={tag} className="property-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="property-card-footer">
                    <span className="property-date">Added {formatDate(property.createdAt)}</span>
                    <div className="property-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleDeleteProperty(property.id)}
                        title="Remove from portfolio"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="portfolio-content">
          <div className="content-header">
            <h2>Deal Alerts</h2>
            <button className="add-alert-btn" onClick={() => setShowAddAlert(true)}>
              <Plus className="h-4 w-4" />
              New Alert
            </button>
          </div>

          {showAddAlert && (
            <div className="add-alert-form">
              <h3>Create Deal Alert</h3>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Alert Name *</label>
                  <input
                    type="text"
                    value={newAlert.name}
                    onChange={e => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Austin High Score Deals"
                  />
                </div>
                <div className="form-field">
                  <label>Cities (comma-separated)</label>
                  <input
                    type="text"
                    value={newAlert.cities}
                    onChange={e => setNewAlert(prev => ({ ...prev, cities: e.target.value }))}
                    placeholder="Austin, Dallas, Houston"
                  />
                </div>
                <div className="form-field">
                  <label>States (comma-separated)</label>
                  <input
                    type="text"
                    value={newAlert.states}
                    onChange={e => setNewAlert(prev => ({ ...prev, states: e.target.value }))}
                    placeholder="TX, CA"
                  />
                </div>
                <div className="form-field">
                  <label>Min Price</label>
                  <input
                    type="number"
                    value={newAlert.minPrice}
                    onChange={e => setNewAlert(prev => ({ ...prev, minPrice: e.target.value }))}
                    placeholder="100000"
                  />
                </div>
                <div className="form-field">
                  <label>Max Price</label>
                  <input
                    type="number"
                    value={newAlert.maxPrice}
                    onChange={e => setNewAlert(prev => ({ ...prev, maxPrice: e.target.value }))}
                    placeholder="500000"
                  />
                </div>
                <div className="form-field">
                  <label>Min Deal Score (0-100)</label>
                  <input
                    type="number"
                    value={newAlert.minDealScore}
                    onChange={e =>
                      setNewAlert(prev => ({ ...prev, minDealScore: e.target.value }))
                    }
                    placeholder="70"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-field">
                  <label>Frequency</label>
                  <select
                    value={newAlert.frequency}
                    onChange={e =>
                      setNewAlert(prev => ({
                        ...prev,
                        frequency: e.target.value as 'instant' | 'daily' | 'weekly'
                      }))
                    }
                  >
                    <option value="instant">Instant</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowAddAlert(false)}>
                  Cancel
                </button>
                <button className="btn-create" onClick={handleCreateAlert}>
                  Create Alert
                </button>
              </div>
            </div>
          )}

          {alerts.length === 0 && !showAddAlert ? (
            <div className="empty-state">
              <Bell className="h-12 w-12 text-gray-500" />
              <h3>No deal alerts</h3>
              <p>Create alerts to get notified when properties match your criteria</p>
            </div>
          ) : (
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-card ${alert.isActive ? '' : 'inactive'}`}>
                  <div className="alert-card-left">
                    <div className="alert-status-toggle">
                      <button
                        className={`toggle-btn ${alert.isActive ? 'active' : ''}`}
                        onClick={() => handleToggleAlert(alert.id, alert.isActive)}
                      >
                        {alert.isActive ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="alert-info">
                      <h4>{alert.name}</h4>
                      <div className="alert-criteria">
                        {alert.cities && alert.cities.length > 0 && (
                          <span className="criteria-tag">Cities: {alert.cities.join(', ')}</span>
                        )}
                        {alert.states && alert.states.length > 0 && (
                          <span className="criteria-tag">States: {alert.states.join(', ')}</span>
                        )}
                        {alert.minPrice && (
                          <span className="criteria-tag">Min: {formatCurrency(alert.minPrice)}</span>
                        )}
                        {alert.maxPrice && (
                          <span className="criteria-tag">Max: {formatCurrency(alert.maxPrice)}</span>
                        )}
                        {alert.minDealScore && (
                          <span className="criteria-tag">Score: {alert.minDealScore}+</span>
                        )}
                      </div>
                      <span className="alert-frequency">{alert.frequency} notifications</span>
                    </div>
                  </div>
                  <div className="alert-card-right">
                    <div className="alert-stats">
                      <span className="match-count">{alert.matchCount} matches</span>
                      {alert.lastMatchAt && (
                        <span className="last-match">Last: {formatDate(alert.lastMatchAt)}</span>
                      )}
                    </div>
                    <button
                      className="delete-alert-btn"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="portfolio-content">
          <div className="content-header">
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                <Check className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <Bell className="h-12 w-12 text-gray-500" />
              <h3>No notifications</h3>
              <p>You'll receive notifications when deals match your alerts</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => !notification.isRead && handleMarkNotificationRead(notification.id)}
                >
                  <div className="notification-indicator" />
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-date">{formatDate(notification.createdAt)}</span>
                  </div>
                  {notification.actionUrl && (
                    <a href={notification.actionUrl} className="notification-action">
                      <ChevronRight className="h-5 w-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioDashboard;
