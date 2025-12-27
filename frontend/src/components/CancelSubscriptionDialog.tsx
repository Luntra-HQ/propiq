import React, { useState } from 'react';
import { AlertCircle, X, Loader2 } from 'lucide-react';

interface CancelSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, feedback: string) => Promise<void>;
  currentTier: string;
  cancelDate?: Date;
}

const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using', label: 'Not using it enough' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'switching_provider', label: 'Switching to another provider' },
  { value: 'temporary_pause', label: 'Need a temporary break' },
  { value: 'other', label: 'Other reason' },
];

export const CancelSubscriptionDialog: React.FC<CancelSubscriptionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentTier,
  cancelDate,
}) => {
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason for cancelling');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(reason, feedback);
      // Success - onConfirm should handle closing
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription. Please try again.');
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setReason('');
    setFeedback('');
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-red-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 px-6 py-4 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cancel Subscription?</h2>
                <p className="text-sm text-gray-400">We're sorry to see you go</p>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              disabled={isSubmitting}
              className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700 disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-sm text-amber-200">
              <strong>Your {currentTier} plan will remain active until{' '}
              {cancelDate ? cancelDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : 'the end of your billing period'}.</strong>
            </p>
            <p className="text-xs text-amber-300/80 mt-2">
              You can reactivate your subscription anytime before then to continue without interruption.
            </p>
          </div>

          {/* Reason Selection */}
          <div>
            <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-300 mb-2">
              Why are you cancelling? *
            </label>
            <select
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all disabled:opacity-50"
            >
              <option value="">Select a reason...</option>
              {CANCELLATION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Feedback Text Area */}
          <div>
            <label htmlFor="cancel-feedback" className="block text-sm font-medium text-gray-300 mb-2">
              Any feedback for us? (optional)
            </label>
            <textarea
              id="cancel-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="We'd love to hear how we can improve..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={resetAndClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Never Mind
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !reason}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>Cancel Subscription</>
              )}
            </button>
          </div>

          {/* Reassurance */}
          <p className="text-xs text-center text-gray-500">
            You can reactivate your subscription anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionDialog;
