import React, { useState } from 'react';
import { X, Check, ArrowRight, AlertTriangle, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { PRICING_TIERS, formatCurrency, type PricingTier } from '../config/pricing';

interface PlanChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newTierId: string) => Promise<void>;
  currentTier: string;
}

export const PlanChangeModal: React.FC<PlanChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentTier,
}) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTierConfig = PRICING_TIERS[currentTier];
  const selectedTierConfig = selectedTier ? PRICING_TIERS[selectedTier] : null;

  const isDowngrade = selectedTierConfig && selectedTierConfig.price < currentTierConfig.price;
  const isUpgrade = selectedTierConfig && selectedTierConfig.price > currentTierConfig.price;

  // Calculate prorated credit (simplified - Stripe handles actual calculation)
  const estimatedCredit = isDowngrade
    ? ((currentTierConfig.price - selectedTierConfig.price) * 0.5).toFixed(2) // Rough estimate for halfway through month
    : null;

  const handleConfirm = async () => {
    if (!selectedTier || selectedTier === currentTier) {
      setError('Please select a different plan');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(selectedTier);
      // Success handled in parent
    } catch (err: any) {
      setError(err.message || 'Failed to change plan. Please try again.');
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSelectedTier(null);
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  // Get all paid tiers (exclude free)
  const availableTiers = Object.values(PRICING_TIERS).filter(t => t.id !== 'free');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl border border-violet-500/30 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 px-6 py-4 border-b border-violet-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Change Your Plan</h2>
              <p className="text-sm text-gray-400">
                Currently on <span className="text-violet-300 font-semibold">{currentTierConfig.displayName}</span>
              </p>
            </div>
            <button
              onClick={resetAndClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700 disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {availableTiers.map((tier) => (
              <PlanCard
                key={tier.id}
                tier={tier}
                isCurrentPlan={tier.id === currentTier}
                isSelected={tier.id === selectedTier}
                onSelect={() => setSelectedTier(tier.id)}
                disabled={isSubmitting || tier.id === currentTier}
              />
            ))}
          </div>

          {/* Change Preview */}
          {selectedTier && selectedTier !== currentTier && (
            <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDowngrade ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                }`}>
                  {isDowngrade ? (
                    <TrendingDown className="h-5 w-5 text-amber-400" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {isDowngrade ? 'Downgrading' : 'Upgrading'} to {selectedTierConfig.displayName}
                  </h3>

                  {/* Price Change */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-1">New monthly price:</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {formatCurrency(selectedTierConfig.price)}
                      </span>
                      <span className="text-sm text-gray-400">/month</span>
                      {isDowngrade && (
                        <span className="text-sm text-emerald-400 font-medium">
                          Save {formatCurrency(currentTierConfig.price - selectedTierConfig.price)}/mo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feature Changes */}
                  {isDowngrade && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-400 mb-2">You'll lose access to:</p>
                      <ul className="space-y-1">
                        {getLostFeatures(currentTierConfig, selectedTierConfig).map((feature, i) => (
                          <li key={i} className="text-sm text-amber-300 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Effective Date */}
                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-xs text-gray-500">
                      <strong>Effective:</strong> {isDowngrade ? 'End of current billing period' : 'Immediately'}
                    </p>
                    {isDowngrade && estimatedCredit && (
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Prorated credit:</strong> ~{formatCurrency(parseFloat(estimatedCredit))} applied to future invoices
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={resetAndClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || !selectedTier || selectedTier === currentTier}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Changing Plan...
                </>
              ) : (
                <>
                  Confirm Change
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Plan Card Component
const PlanCard: React.FC<{
  tier: PricingTier;
  isCurrentPlan: boolean;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}> = ({ tier, isCurrentPlan, isSelected, onSelect, disabled }) => {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        relative p-4 rounded-xl border-2 transition-all text-left
        ${isCurrentPlan
          ? 'border-emerald-500 bg-emerald-500/10'
          : isSelected
          ? 'border-violet-500 bg-violet-500/10'
          : 'border-slate-700 bg-slate-900 hover:border-slate-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
            CURRENT PLAN
          </span>
        </div>
      )}

      {/* Selected Checkmark */}
      {isSelected && !isCurrentPlan && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      <div className="mb-3">
        <h3 className="text-lg font-bold text-white">{tier.displayName}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-white">{formatCurrency(tier.price)}</span>
          <span className="text-xs text-gray-400">/mo</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">{tier.bestFor}</p>

      <div className="space-y-1">
        {tier.features.slice(0, 3).map((feature, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <Check className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-gray-300">{feature}</span>
          </div>
        ))}
        {tier.features.length > 3 && (
          <p className="text-xs text-gray-500 mt-1">+{tier.features.length - 3} more features</p>
        )}
      </div>
    </button>
  );
};

// Helper function to determine lost features on downgrade
function getLostFeatures(currentTier: PricingTier, newTier: PricingTier): string[] {
  // This is a simplified version - you might want more sophisticated logic
  const tierOrder: Record<string, number> = { starter: 1, pro: 2, elite: 3 };

  if (tierOrder[currentTier.id] <= tierOrder[newTier.id]) {
    return []; // Not a downgrade
  }

  // Define features lost when downgrading
  const lostFeatures: Record<string, string[]> = {
    'pro_to_starter': [
      'Market comparisons & trends',
      'Deal alerts (email notifications)',
      'Chrome extension',
      'Bulk import',
      'Priority support',
    ],
    'elite_to_pro': [
      'White-label reports',
      'API access',
      'Team collaboration (up to 5 users)',
      '1-on-1 onboarding call',
      'Custom integrations',
    ],
    'elite_to_starter': [
      'Market comparisons & trends',
      'White-label reports',
      'API access',
      'Team collaboration',
      'Bulk import (100+ properties)',
    ],
  };

  const key = `${currentTier.id}_to_${newTier.id}`;
  return lostFeatures[key] || ['Some premium features'];
}

export default PlanChangeModal;
