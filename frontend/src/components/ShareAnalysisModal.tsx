import { useState } from 'react';
import { Share2, Link, Copy, Check, X, Users, Globe, Lock, Clock, MessageSquare, Download, Loader2 } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import './ShareAnalysisModal.css';

interface ShareAnalysisModalProps {
  analysisId: string;
  address: string;
  onClose: () => void;
}

type ShareType = 'public' | 'private' | 'team';

interface ShareSettings {
  shareType: ShareType;
  title: string;
  description: string;
  allowedEmails: string[];
  canComment: boolean;
  canExport: boolean;
  expiresInDays: number | null;
}

export const ShareAnalysisModal: React.FC<ShareAnalysisModalProps> = ({
  analysisId,
  address,
  onClose
}) => {
  const [step, setStep] = useState<'settings' | 'success'>('settings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const [settings, setSettings] = useState<ShareSettings>({
    shareType: 'public',
    title: '',
    description: '',
    allowedEmails: [],
    canComment: true,
    canExport: true,
    expiresInDays: null
  });

  const [emailInput, setEmailInput] = useState('');

  const handleCreateShare = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(API_ENDPOINTS.SHARE_CREATE, {
        analysis_id: analysisId,
        share_type: settings.shareType,
        title: settings.title || undefined,
        description: settings.description || undefined,
        allowed_emails: settings.shareType === 'private' ? settings.allowedEmails : undefined,
        can_comment: settings.canComment,
        can_export: settings.canExport,
        expires_in_days: settings.expiresInDays
      });

      if (response.data.success) {
        setShareUrl(response.data.share_url);
        setStep('success');
      } else {
        setError(response.data.error || 'Failed to create share link');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && email.includes('@') && !settings.allowedEmails.includes(email)) {
      setSettings(prev => ({
        ...prev,
        allowedEmails: [...prev.allowedEmails, email]
      }));
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setSettings(prev => ({
      ...prev,
      allowedEmails: prev.allowedEmails.filter(e => e !== email)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <div className="share-modal-title">
            <Share2 className="h-5 w-5 text-violet-400" />
            <h2>Share Analysis</h2>
          </div>
          <button onClick={onClose} className="share-modal-close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Property Info */}
        <div className="share-property-info">
          <span className="share-property-label">Property:</span>
          <span className="share-property-address">{address}</span>
        </div>

        {step === 'settings' && (
          <div className="share-modal-content">
            {error && (
              <div className="share-error">
                {error}
              </div>
            )}

            {/* Share Type Selection */}
            <div className="share-section">
              <label className="share-section-label">Who can access?</label>
              <div className="share-type-options">
                <button
                  className={`share-type-btn ${settings.shareType === 'public' ? 'active' : ''}`}
                  onClick={() => setSettings(prev => ({ ...prev, shareType: 'public' }))}
                >
                  <Globe className="h-5 w-5" />
                  <span>Anyone with link</span>
                </button>
                <button
                  className={`share-type-btn ${settings.shareType === 'private' ? 'active' : ''}`}
                  onClick={() => setSettings(prev => ({ ...prev, shareType: 'private' }))}
                >
                  <Lock className="h-5 w-5" />
                  <span>Specific people</span>
                </button>
                <button
                  className={`share-type-btn ${settings.shareType === 'team' ? 'active' : ''}`}
                  onClick={() => setSettings(prev => ({ ...prev, shareType: 'team' }))}
                  disabled
                  title="Coming soon"
                >
                  <Users className="h-5 w-5" />
                  <span>Team only</span>
                </button>
              </div>
            </div>

            {/* Private Share - Email List */}
            {settings.shareType === 'private' && (
              <div className="share-section">
                <label className="share-section-label">Invite people by email</label>
                <div className="share-email-input-row">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter email address"
                    className="share-email-input"
                  />
                  <button onClick={handleAddEmail} className="share-add-email-btn">
                    Add
                  </button>
                </div>
                {settings.allowedEmails.length > 0 && (
                  <div className="share-email-tags">
                    {settings.allowedEmails.map(email => (
                      <span key={email} className="share-email-tag">
                        {email}
                        <button onClick={() => handleRemoveEmail(email)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Optional Title */}
            <div className="share-section">
              <label className="share-section-label">Title (optional)</label>
              <input
                type="text"
                value={settings.title}
                onChange={e => setSettings(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Great rental opportunity in Austin"
                className="share-input"
                maxLength={200}
              />
            </div>

            {/* Optional Notes */}
            <div className="share-section">
              <label className="share-section-label">Notes (optional)</label>
              <textarea
                value={settings.description}
                onChange={e => setSettings(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add any notes about this deal..."
                className="share-textarea"
                maxLength={1000}
                rows={3}
              />
            </div>

            {/* Permissions */}
            <div className="share-section">
              <label className="share-section-label">Permissions</label>
              <div className="share-permissions">
                <label className="share-permission-toggle">
                  <input
                    type="checkbox"
                    checked={settings.canComment}
                    onChange={e => setSettings(prev => ({ ...prev, canComment: e.target.checked }))}
                  />
                  <MessageSquare className="h-4 w-4" />
                  <span>Allow comments</span>
                </label>
                <label className="share-permission-toggle">
                  <input
                    type="checkbox"
                    checked={settings.canExport}
                    onChange={e => setSettings(prev => ({ ...prev, canExport: e.target.checked }))}
                  />
                  <Download className="h-4 w-4" />
                  <span>Allow PDF export</span>
                </label>
              </div>
            </div>

            {/* Expiration */}
            <div className="share-section">
              <label className="share-section-label">
                <Clock className="h-4 w-4" />
                Link expiration
              </label>
              <select
                value={settings.expiresInDays || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  expiresInDays: e.target.value ? parseInt(e.target.value) : null
                }))}
                className="share-select"
              >
                <option value="">Never expires</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            {/* Actions */}
            <div className="share-modal-actions">
              <button onClick={onClose} className="share-btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleCreateShare}
                disabled={loading || (settings.shareType === 'private' && settings.allowedEmails.length === 0)}
                className="share-btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4" />
                    Create Share Link
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && shareUrl && (
          <div className="share-modal-content share-success">
            <div className="share-success-icon">
              <Check className="h-8 w-8" />
            </div>
            <h3>Share Link Created!</h3>
            <p>Anyone with this link can view the analysis.</p>

            <div className="share-url-container">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="share-url-input"
              />
              <button onClick={handleCopyLink} className="share-copy-btn">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="share-modal-actions">
              <button onClick={onClose} className="share-btn-primary full-width">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareAnalysisModal;
