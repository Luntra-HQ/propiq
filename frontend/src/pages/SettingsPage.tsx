import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Shield,
  Bell,
  LogOut,
  ExternalLink,
  Calendar,
  Package,
  Mail,
  Building2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { PRICING_TIERS, formatCurrency } from '../config/pricing';
import CancelSubscriptionDialog from '../components/CancelSubscriptionDialog';
import PlanChangeModal from '../components/PlanChangeModal';
import ChangePasswordForm from '../components/ChangePasswordForm';

interface SettingsPageProps {
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    subscriptionTier: string;
    subscriptionStatus?: string;
    analysesUsed: number;
    analysesLimit: number;
    currentPeriodEnd?: number;
    createdAt: number;
    stripeCustomerId?: string;
  } | null;
  onManageSubscription: () => void;
  onCancelSubscription?: (reason: string, feedback: string) => Promise<void>;
  onChangePlan?: (newTierId: string) => Promise<void>;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  onLogout: () => void;
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onManageSubscription,
  onCancelSubscription,
  onChangePlan,
  onChangePassword,
  onLogout,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'preferences' | 'security'>('account');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Please log in to view settings.</p>
      </div>
    );
  }

  const tierConfig = PRICING_TIERS[user.subscriptionTier] || PRICING_TIERS.free;
  const isPaidTier = user.subscriptionTier !== 'free';
  const accountAge = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)); // days

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/95 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                Account Settings
              </h1>
              <p className="text-gray-400">
                Manage your account, subscription, and preferences
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              aria-label="Close settings"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 mb-8">
            <TabButton
              active={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
              icon={User}
              label="Account"
            />
            <TabButton
              active={activeTab === 'subscription'}
              onClick={() => setActiveTab('subscription')}
              icon={CreditCard}
              label="Subscription"
            />
            <TabButton
              active={activeTab === 'preferences'}
              onClick={() => setActiveTab('preferences')}
              icon={Bell}
              label="Preferences"
            />
            <TabButton
              active={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
              icon={Shield}
              label="Security"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto">
          {activeTab === 'account' && (
            <AccountTab
              user={user}
              accountAge={accountAge}
            />
          )}

          {activeTab === 'subscription' && (
            <SubscriptionTab
              user={user}
              tierConfig={tierConfig}
              isPaidTier={isPaidTier}
              onManageSubscription={onManageSubscription}
              onChangePlanClick={() => setShowPlanChangeModal(true)}
              onCancelClick={() => setShowCancelDialog(true)}
            />
          )}

          {activeTab === 'preferences' && (
            <PreferencesTab />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              onChangePassword={onChangePassword}
              onLogout={onLogout}
            />
          )}
        </div>

        {/* Cancellation Dialog */}
        {onCancelSubscription && (
          <CancelSubscriptionDialog
            isOpen={showCancelDialog}
            onClose={() => setShowCancelDialog(false)}
            onConfirm={async (reason, feedback) => {
              await onCancelSubscription(reason, feedback);
              setShowCancelDialog(false);
              // Optionally show success message
            }}
            currentTier={tierConfig.displayName}
            cancelDate={user?.currentPeriodEnd ? new Date(user.currentPeriodEnd) : undefined}
          />
        )}

        {/* Plan Change Modal */}
        {onChangePlan && (
          <PlanChangeModal
            isOpen={showPlanChangeModal}
            onClose={() => setShowPlanChangeModal(false)}
            onConfirm={async (newTierId) => {
              await onChangePlan(newTierId);
              setShowPlanChangeModal(false);
              // Success message shown in parent
            }}
            currentTier={user.subscriptionTier}
          />
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all
      ${active
        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
      }
    `}
  >
    <Icon className="h-4 w-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// Account Tab
const AccountTab: React.FC<{
  user: any;
  accountAge: number;
}> = ({ user, accountAge }) => (
  <div className="space-y-6">
    {/* Personal Information */}
    <SettingsCard title="Personal Information" icon={User}>
      <div className="space-y-4">
        <InfoRow label="Email" value={user.email} icon={Mail} />
        <InfoRow
          label="Name"
          value={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not set'}
          icon={User}
        />
        <InfoRow
          label="Company"
          value={user.company || 'Not set'}
          icon={Building2}
        />
        <InfoRow
          label="Member Since"
          value={`${accountAge} days ago`}
          icon={Calendar}
        />
      </div>
    </SettingsCard>

    {/* Account Statistics */}
    <SettingsCard title="Account Statistics" icon={Package}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Analyses Used"
          value={user.analysesUsed.toString()}
          subtext="This month"
        />
        <StatCard
          label="Analyses Remaining"
          value={(user.analysesLimit - user.analysesUsed).toString()}
          subtext={`of ${user.analysesLimit} total`}
        />
        <StatCard
          label="Account Tier"
          value={PRICING_TIERS[user.subscriptionTier].displayName}
          subtext={PRICING_TIERS[user.subscriptionTier].bestFor}
        />
      </div>
    </SettingsCard>
  </div>
);

// Subscription Tab
const SubscriptionTab: React.FC<{
  user: any;
  tierConfig: any;
  isPaidTier: boolean;
  onManageSubscription: () => void;
  onChangePlanClick: () => void;
  onCancelClick: () => void;
}> = ({ user, tierConfig, isPaidTier, onManageSubscription, onChangePlanClick, onCancelClick }) => {
  const nextBillingDate = user.currentPeriodEnd
    ? new Date(user.currentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <SettingsCard title="Current Plan" icon={Package}>
        <div className="space-y-6">
          {/* Plan Details */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {tierConfig.displayName}
              </h3>
              <p className="text-gray-400 mb-4">{tierConfig.bestFor}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(tierConfig.price)}
                </span>
                <span className="text-gray-400">/month</span>
              </div>
            </div>
            {user.subscriptionStatus === 'active' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-medium">Active</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm font-medium text-gray-400 mb-3">Plan Features:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tierConfig.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Manage Subscription Buttons */}
          {isPaidTier && (
            <div className="pt-4 border-t border-slate-700 space-y-3">
              {/* Change Plan Button */}
              <button
                onClick={onChangePlanClick}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all border border-violet-500/30 hover:border-violet-500/50"
              >
                <Package className="h-5 w-5" />
                Change Plan
              </button>

              {/* Manage Billing Button */}
              <button
                onClick={onManageSubscription}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-violet-500/30"
              >
                <CreditCard className="h-5 w-5" />
                Manage Billing in Stripe
                <ExternalLink className="h-4 w-4" />
              </button>
              <p className="text-xs text-gray-500 text-center">
                Update payment method, view invoices, or manage subscription
              </p>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Billing Information */}
      {isPaidTier && (
        <SettingsCard title="Billing Information" icon={CreditCard}>
          <div className="space-y-4">
            <InfoRow
              label="Next Billing Date"
              value={nextBillingDate}
              icon={Calendar}
            />
            <InfoRow
              label="Billing Status"
              value={user.subscriptionStatus || 'active'}
              icon={user.subscriptionStatus === 'active' ? CheckCircle2 : AlertCircle}
            />
            {user.stripeCustomerId && (
              <InfoRow
                label="Customer ID"
                value={`${user.stripeCustomerId.substring(0, 20)}...`}
                icon={Package}
              />
            )}
          </div>
        </SettingsCard>
      )}

      {/* Danger Zone - Cancel Subscription */}
      {isPaidTier && user.subscriptionStatus !== 'cancelled' && (
        <SettingsCard title="Danger Zone" icon={AlertCircle}>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Cancel Subscription</h3>
                <p className="text-sm text-gray-400">
                  Permanently cancel your subscription. You'll retain access until the end of your billing period.
                </p>
              </div>
              <button
                onClick={onCancelClick}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-red-500/30"
              >
                <Trash2 className="h-4 w-4" />
                Cancel Plan
              </button>
            </div>
          </div>
        </SettingsCard>
      )}

      {/* Upgrade CTA for Free Users */}
      {!isPaidTier && (
        <SettingsCard title="Upgrade Your Plan" icon={Package}>
          <div className="text-center py-6">
            <p className="text-gray-300 mb-6">
              Unlock unlimited AI analyses and premium features
            </p>
            <button
              onClick={onManageSubscription}
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transition-all"
            >
              View Pricing Plans
            </button>
          </div>
        </SettingsCard>
      )}
    </div>
  );
};

// Preferences Tab
const PreferencesTab: React.FC = () => {
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsComment, setNpsComment] = useState('');
  const [npsSubmitted, setNpsSubmitted] = useState(false);

  const handleNpsSubmit = () => {
    if (npsScore === null) return;

    // TODO: Wire to convex mutation (api.nps.submitResponse)
    console.log('NPS submitted:', { score: npsScore, comment: npsComment });
    setNpsSubmitted(true);

    // Track in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'nps_survey_submit', {
        event_category: 'engagement',
        value: npsScore
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* NPS Survey */}
      <SettingsCard title="Help Us Improve" icon={CheckCircle2}>
        {npsSubmitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-white font-semibold mb-2">Thank you for your feedback!</p>
            <p className="text-sm text-gray-400">
              Your input helps us build a better product for investors like you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-300 mb-4">
              How likely are you to recommend PropIQ to a fellow investor?
            </p>

            {/* NPS Score Buttons (0-10) */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setNpsScore(i)}
                  className={`w-12 h-12 rounded-lg font-bold transition-all ${
                    npsScore === i
                      ? 'bg-violet-600 text-white scale-110 shadow-lg'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-xs text-gray-400 mb-4">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>

            {/* Optional Comment */}
            {npsScore !== null && (
              <div className="space-y-2">
                <label className="block text-sm text-gray-300">
                  What's the main reason for your score? (optional)
                </label>
                <textarea
                  value={npsComment}
                  onChange={(e) => setNpsComment(e.target.value)}
                  placeholder="Tell us what you love or what we could improve..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition"
                  rows={3}
                />
                <button
                  onClick={handleNpsSubmit}
                  className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Notifications" icon={Bell}>
        <div className="space-y-4">
          <PreferenceToggle
            label="Email Notifications"
            description="Receive updates about your analyses and subscription"
            defaultChecked={true}
          />
          <PreferenceToggle
            label="Usage Alerts"
            description="Get notified when approaching analysis limit"
            defaultChecked={true}
          />
          <PreferenceToggle
            label="Product Updates"
            description="Stay informed about new features and improvements"
            defaultChecked={false}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Display Preferences" icon={User}>
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Additional preferences coming soon...
          </p>
        </div>
      </SettingsCard>
    </div>
  );
};

// Security Tab
const SecurityTab: React.FC<{
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  onLogout: () => void;
}> = ({ onChangePassword, onLogout }) => (
  <div className="space-y-6">
    <SettingsCard title="Change Password" icon={Shield}>
      {onChangePassword ? (
        <ChangePasswordForm onSubmit={onChangePassword} />
      ) : (
        <p className="text-sm text-gray-400">Password change is not available</p>
      )}
    </SettingsCard>

    <SettingsCard title="Email & Account" icon={Mail}>
      <div className="space-y-4">
        <ActionButton
          icon={Mail}
          label="Update Email"
          description="Change your account email address"
          onClick={() => alert('Email update flow coming soon')}
        />
      </div>
    </SettingsCard>

    <SettingsCard title="Sessions" icon={Shield}>
      <div className="space-y-4">
        <ActionButton
          icon={LogOut}
          label="Sign Out"
          description="Sign out of your account on this device"
          onClick={onLogout}
          variant="danger"
        />
      </div>
    </SettingsCard>
  </div>
);

// Reusable Components
const SettingsCard: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
        <Icon className="h-5 w-5 text-violet-400" />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
    {children}
  </div>
);

const InfoRow: React.FC<{
  label: string;
  value: string;
  icon: React.ElementType;
}> = ({ label, icon: Icon, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-400" />
      <span className="text-gray-400">{label}</span>
    </div>
    <span className="text-white font-medium">{value}</span>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: string;
  subtext: string;
}> = ({ label, value, subtext }) => (
  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    <p className="text-xs text-gray-500">{subtext}</p>
  </div>
);

const PreferenceToggle: React.FC<{
  label: string;
  description: string;
  defaultChecked: boolean;
}> = ({ label, description, defaultChecked }) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`
          relative w-12 h-6 rounded-full transition-colors
          ${checked ? 'bg-violet-600' : 'bg-slate-700'}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};

const ActionButton: React.FC<{
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}> = ({ icon: Icon, label, description, onClick, variant = 'default' }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center justify-between p-4 rounded-lg border transition-all
      ${variant === 'danger'
        ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
        : 'bg-slate-900/50 border-slate-700 hover:bg-slate-900'
      }
    `}
  >
    <div className="flex items-center gap-4">
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        ${variant === 'danger' ? 'bg-red-500/20' : 'bg-violet-500/20'}
      `}>
        <Icon className={`h-5 w-5 ${variant === 'danger' ? 'text-red-400' : 'text-violet-400'}`} />
      </div>
      <div className="text-left">
        <p className="text-white font-medium">{label}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 text-gray-400" />
  </button>
);

export default SettingsPage;
