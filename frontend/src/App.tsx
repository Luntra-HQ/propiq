import React, { useState, useMemo, useEffect } from 'react';
import { Settings, BarChart, Clock, Zap, Target, Shield, Users, Mail, Search, Calculator, Send, Lock, CreditCard, X, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import PricingPage from './components/PricingPage';
import { SupportChat } from './components/SupportChat';
import { DealCalculator } from './components/DealCalculator';
import { FeedbackWidget } from './components/FeedbackWidget';
import { PropIQAnalysis } from './components/PropIQAnalysis';

// --- BACKEND AUTH IMPORTS ---
import { AuthModal } from './components/AuthModal';
import { isAuthenticated, getUserId, getUserEmail, getUserDetails, logout, type User } from './utils/auth';
// ------------------------

// --- PRICING IMPORTS ---
import {
  PRICING_TIERS,
  TOP_UP_PACKAGES,
  USAGE_THRESHOLDS,
  CONVERSION_COPY,
  shouldShowWarning,
  shouldShowUpgradePrompt,
  isAtHardCap,
  getRemainingRuns,
  formatCurrency,
  formatUsageString,
  getNextTier,
  type PricingTier
} from './config/pricing';
// ------------------------

// --- CONFIGURATION ---
const TOTAL_TRIAL_USES = 3;  // Free tier: 3 analyses
const PRIMARY_ACCENT = 'violet';
const SUCCESS_ACCENT = 'emerald';
// --- END CONFIGURATION ---

// --- Components ---

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-gray-100">
    <Loader2 className="h-10 w-10 text-violet-500 animate-spin mb-4" />
    <p className="text-xl font-semibold">Loading LUNTRA Engine...</p>
    <p className="text-sm text-gray-400">Authenticating user and fetching trial status.</p>
  </div>
);

// Paywall Component (The Hard Stop)
const PaywallModal = ({ isOpen, onUpgradeClick }: { isOpen: boolean; onUpgradeClick: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 transition-opacity duration-300 animate-fadeIn">
      <div className={`w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-violet-700 p-8 text-center animate-slideInUp`}>
        <Lock className={`h-10 w-10 mx-auto mb-4 text-${PRIMARY_ACCENT}-400`} />
        <h2 className="text-3xl font-extrabold text-gray-50 mb-3">
          Trial Limit Reached
        </h2>
        <p className="text-gray-300 mb-6 text-lg">
          You have successfully completed your {TOTAL_TRIAL_USES}-use trial! Unlock unlimited access to the LUNTRA Growth Engine.
        </p>

        <div className="bg-slate-700 p-4 rounded-lg mb-8 shadow-inner">
          <p className="text-xl font-semibold text-emerald-300 flex items-center justify-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Go Pro: Unlock Unlimited Access
          </p>
        </div>

        <button
          onClick={onUpgradeClick}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200
            bg-${SUCCESS_ACCENT}-600 hover:bg-${SUCCESS_ACCENT}-500 active:scale-[0.98] shadow-lg shadow-${SUCCESS_ACCENT}-500/50 focus:outline-none focus:ring-4 focus:ring-${SUCCESS_ACCENT}-300
          `}
        >
          Upgrade Now to Continue
        </button>
        <button
          onClick={() => {
            console.log('Closing modal - User declined upgrade');
            onUpgradeClick();
          }}
          className="mt-4 text-sm font-medium text-gray-300 hover:text-gray-200 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

// Header (Re-used, stable component)
const Header = ({
  propIqUsed,
  propIqLimit,
  currentTier,
  userId,
  userEmail,
  onLogout
}: {
  propIqUsed: number;
  propIqLimit: number;
  currentTier: string;
  userId: string | null;
  userEmail: string | null;
  onLogout: () => void;
}) => {
  const tierConfig = PRICING_TIERS[currentTier] || PRICING_TIERS.free;
  const remaining = getRemainingRuns(propIqUsed, propIqLimit);

  return (
    <header className="flex justify-between items-center p-4 md:p-6 bg-slate-800 border-b border-violet-900 shadow-2xl sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <Zap className={`h-7 w-7 text-${PRIMARY_ACCENT}-400 drop-shadow-lg`} />
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-50 tracking-wide">
          PropIQ - AI Property Analysis
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 bg-slate-700 px-3 py-1.5 rounded-lg">
          <CreditCard className="h-4 w-4 text-violet-300" />
          <span className="text-xs font-semibold text-gray-200">{tierConfig.displayName}</span>
        </div>
        <UsageBadge used={propIqUsed} limit={propIqLimit} />
        {userId && (
          <div className="flex items-center space-x-2">
            <div className="hidden lg:block text-xs text-gray-300 truncate max-w-[150px]" title={userEmail || userId}>
              {userEmail || 'Logged In'}
            </div>
            <button
              onClick={onLogout}
              className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              title="Logout"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// Usage Badge Component
const UsageBadge = ({ used, limit }: { used: number; limit: number }) => {
  const remaining = getRemainingRuns(used, limit);
  const percentage = (used / limit) * 100;

  let statusColor = 'bg-emerald-900 text-emerald-200';
  if (percentage >= 90) {
    statusColor = 'bg-red-900 text-red-200';
  } else if (percentage >= 75) {
    statusColor = 'bg-yellow-900 text-yellow-200';
  }

  const text = remaining > 0 ? `${remaining}/${limit} Runs Left` : 'LIMIT REACHED';

  return (
    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor} flex items-center shadow-inner`}>
      <BarChart className="h-3 w-3 mr-1" />
      {text}
    </div>
  );
};

// PropIQ Feature Card
const DealIqFeatureCard = ({
  used,
  limit,
  onClick,
  currentTier
}: {
  used: number;
  limit: number;
  onClick: () => void;
  currentTier: string;
}) => {
  const isAtLimit = isAtHardCap(used, limit);
  const remaining = getRemainingRuns(used, limit);
  const progressPercent = useMemo(() => (used / limit) * 100, [used, limit]);
  const tierConfig = PRICING_TIERS[currentTier] || PRICING_TIERS.free;

  // Determine progress bar color
  let progressColor = 'from-emerald-500 to-emerald-400';
  if (progressPercent >= 90) {
    progressColor = 'from-red-500 to-red-400';
  } else if (progressPercent >= 75) {
    progressColor = 'from-yellow-500 to-yellow-400';
  }

  return (
    <div className={`p-6 bg-slate-800 rounded-xl shadow-2xl transition-shadow duration-300 h-full flex flex-col justify-between ${isAtLimit ? 'opacity-60' : `hover:shadow-${PRIMARY_ACCENT}-500/30`}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-50">PropIQ Analysis</h2>
          <Target className="h-6 w-6 text-violet-300" />
        </div>
        <p className="text-gray-300 mb-4">
          AI-powered property analysis with risk scoring and market insights. Each analysis consumes one PropIQ run.
        </p>
        <div className="bg-slate-700 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-300">
            <span className="font-bold text-violet-300">{tierConfig.displayName} Plan:</span> {tierConfig.propIqLimit} runs/month
          </p>
        </div>
      </div>

      <div className={`mb-6 p-4 rounded-lg bg-slate-900 shadow-inner border border-slate-700`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium text-${PRIMARY_ACCENT}-400`}>Monthly Usage</span>
          <span className={`text-sm font-bold ${remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {remaining} of {limit} left
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Used: {used}</span>
          <span>{progressPercent.toFixed(0)}%</span>
        </div>
      </div>

      <button
        onClick={onClick}
        disabled={isAtLimit}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2
          ${isAtLimit
            ? 'bg-gray-600 cursor-not-allowed'
            : `bg-${PRIMARY_ACCENT}-600 hover:bg-${PRIMARY_ACCENT}-500 active:scale-[0.99] shadow-lg shadow-${PRIMARY_ACCENT}-500/50 focus:outline-none focus:ring-4 focus:ring-${PRIMARY_ACCENT}-300`
          }`}
      >
        {isAtLimit ? (
          <>
            <Lock className="h-5 w-5" />
            <span>Limit Reached - Upgrade or Top Up</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>Run PropIQ Analysis ({remaining} left)</span>
          </>
        )}
      </button>
    </div>
  );
};

// Simple Stat Card
const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) => (
  <div className="p-5 bg-slate-800 rounded-xl shadow-xl border border-slate-700 transition-transform duration-300 hover:scale-[1.02]">
    <div className="flex items-center">
      <Icon className={`h-7 w-7 text-${color}-400 mr-3`} />
      <div>
        <p className="text-sm font-medium text-gray-300">{title}</p>
        <p className="text-3xl font-extrabold text-gray-50">{value}</p>
      </div>
    </div>
  </div>
);

// Feature Showcase List Item
const FeatureListItem = ({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) => (
  <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
    <Icon className={`h-6 w-6 flex-shrink-0 text-${PRIMARY_ACCENT}-400`} />
    <div>
      <h3 className="text-md font-semibold text-gray-50">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  </div>
);

// Upgrade Prompt Banner Component (90% threshold)
const UpgradePromptBanner = ({
  used,
  limit,
  currentTier,
  onUpgrade,
  onTopUp,
  onDismiss
}: {
  used: number;
  limit: number;
  currentTier: string;
  onUpgrade: () => void;
  onTopUp: () => void;
  onDismiss: () => void;
}) => {
  const remaining = getRemainingRuns(used, limit);
  const nextTier = getNextTier(currentTier);

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-4xl px-4 animate-slideInDown">
      <div className="bg-gradient-to-r from-violet-900 to-purple-900 border border-violet-500 rounded-lg shadow-2xl p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 bg-violet-500 rounded-full p-2">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                {CONVERSION_COPY.warningBanner.title.replace('{used}', used.toString()).replace('{total}', limit.toString())}
              </h3>
              <p className="text-sm text-violet-200">
                {CONVERSION_COPY.warningBanner.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={onTopUp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  💰 Buy 10 More ($5)
                </button>
                {nextTier && (
                  <button
                    onClick={onUpgrade}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    ⚡ Upgrade to {nextTier.name} ({formatCurrency(nextTier.price)}/mo)
                  </button>
                )}
                <button
                  onClick={onDismiss}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Remind Me Later
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 text-violet-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Top-Up Modal Component
const TopUpModal = ({
  isOpen,
  onClose,
  onPurchase
}: {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (packageId: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 transition-opacity duration-300 animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-violet-700 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-50">
            Add More PropIQ Runs
          </h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <p className="text-gray-300 mb-6 text-lg">
          {CONVERSION_COPY.topUp.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {TOP_UP_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-slate-700 rounded-lg p-5 border-2 border-slate-600 hover:border-emerald-500 transition-all cursor-pointer"
              onClick={() => onPurchase(pkg.id)}
            >
              <div className="text-center">
                <div className="text-3xl font-extrabold text-emerald-400 mb-2">
                  {pkg.runs}
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  PropIQ Runs
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(pkg.price)}
                </div>
                <div className="text-xs text-gray-400">
                  ${pkg.pricePerRun.toFixed(2)} per run
                </div>
                {pkg.runs > 10 && (
                  <div className="mt-2 px-2 py-1 bg-emerald-900 text-emerald-300 text-xs font-semibold rounded">
                    SAVE {Math.round((1 - pkg.pricePerRun / 0.50) * 100)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <p className="text-sm text-gray-300 text-center">
            💳 Secure checkout powered by Stripe. Top-ups never expire.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Application Component
const App = () => {
  // State for usage tracking and subscription
  const [propIqUsed, setPropIqUsed] = useState(0);
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showPricingPage, setShowPricingPage] = useState(false);
  const [showPropIQAnalysis, setShowPropIQAnalysis] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Derived state
  const tierConfig = PRICING_TIERS[currentTier] || PRICING_TIERS.free;
  const propIqLimit = tierConfig.propIqLimit;
  const propIqRemaining = getRemainingRuns(propIqUsed, propIqLimit);

  // 1. Check authentication status and load user data from backend
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        if (isAuthenticated()) {
          const id = getUserId();
          const email = getUserEmail();

          if (id && email) {
            setUserId(id);
            setUserEmail(email);

            // Fetch user details from backend
            const user = await getUserDetails(id);

            if (user) {
              console.log('User loaded:', user);

              // Set usage from backend (Convex uses analysesUsed)
              const used = user.analysesUsed || 0;
              setPropIqUsed(used);

              // Set tier from backend (Convex uses subscriptionTier)
              const tier = user.subscriptionTier || 'free';
              setCurrentTier(tier);

              setIsLoading(false);
            } else {
              // User details fetch failed, might be invalid token
              console.warn('Failed to fetch user details');
              logout();
              setShowAuthModal(true);
              setIsLoading(false);
            }
          }
        } else {
          // Not logged in - show auth modal
          console.log('User not authenticated');
          setShowAuthModal(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setShowAuthModal(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Run once on mount

  // Effect to show upgrade prompts based on usage thresholds
  useEffect(() => {
    if (isLoading) return;

    // Check if at hard cap (100% usage)
    if (isAtHardCap(propIqUsed, propIqLimit)) {
      setShowPaywall(true);
      setShowUpgradeBanner(false);
    }
    // Check if at 90% threshold
    else if (shouldShowUpgradePrompt(propIqUsed, propIqLimit) && !showUpgradeBanner) {
      setShowUpgradeBanner(true);
    }
  }, [propIqUsed, propIqLimit, isLoading]);

  // Handler to use PropIQ feature (increments usage)
  const handleUsePropIq = async () => {
    if (isLoading || !userId) return;

    // Check if at hard cap
    if (isAtHardCap(propIqUsed, propIqLimit)) {
      setShowPaywall(true);
      return;
    }

    try {
      // Increment usage locally
      const newUsageCount = propIqUsed + 1;
      setPropIqUsed(newUsageCount);

      console.log(`PropIQ used. Total uses: ${newUsageCount}/${propIqLimit}`);

      // Note: Backend will track usage when actual analysis API is called
    } catch (error) {
      console.error("Error incrementing PropIQ usage:", error);
      setShowPaywall(true);
    }
  };

  const handleUpgradeClick = () => {
    // Show pricing page
    setShowPricingPage(true);
    setShowPaywall(false);
    setShowUpgradeBanner(false);
  };

  const handleSelectTier = async (tierId: string) => {
    console.log(`Upgrading to tier: ${tierId}`);

    // In production, this would:
    // 1. Open Stripe checkout
    // 2. Process payment
    // 3. Update subscription via backend webhook

    // For now, just log and close
    setShowPricingPage(false);
    // TODO: Integrate Stripe checkout
  };

  const handleTopUpPurchase = async (packageId: string) => {
    console.log(`Purchasing top-up package: ${packageId}`);

    // In production, this would:
    // 1. Open Stripe checkout
    // 2. Process payment
    // 3. Update usage limits via backend webhook

    setShowTopUpModal(false);
    setShowUpgradeBanner(false);
    // TODO: Integrate Stripe checkout for top-ups
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Reload to fetch user data
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
  };

  const handleDismissUpgradeBanner = () => {
    setShowUpgradeBanner(false);
    // Store dismissal in localStorage to prevent repeated prompts
    localStorage.setItem('upgradeBannerDismissed', Date.now().toString());
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show auth modal if not logged in
  if (!userId) {
    return (
      <>
        <LoadingScreen />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {/* Don't allow closing when not logged in */}}
          onSuccess={handleAuthSuccess}
          defaultMode="signup"
        />
      </>
    );
  }

  return (
    // Note: The classes here rely on the statically compiled Tailwind CSS
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col font-sans antialiased">
      {/* Header with tier and usage info */}
      <Header
        propIqUsed={propIqUsed}
        propIqLimit={propIqLimit}
        currentTier={currentTier}
        userId={userId}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Upgrade Prompt Banner (90% threshold) */}
      {showUpgradeBanner && (
        <UpgradePromptBanner
          used={propIqUsed}
          limit={propIqLimit}
          currentTier={currentTier}
          onUpgrade={handleUpgradeClick}
          onTopUp={() => setShowTopUpModal(true)}
          onDismiss={handleDismissUpgradeBanner}
        />
      )}

      <main className="flex-grow container mx-auto px-4 py-10 md:px-8 md:py-16">
        {/* Hero Section - SEO Optimized */}
        <section className="mb-12 text-center" role="banner">
          <h1 className="text-4xl font-extrabold text-gray-50 sm:text-5xl mb-3 drop-shadow-md">
            AI-Powered Real Estate Investment Analysis
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Analyze any property in 30 seconds with PropIQ by LUNTRA
          </p>
          <p className="text-lg text-gray-400">
            {CONVERSION_COPY.trialEnd.description}
          </p>
        </section>

        {/* PropIQ AI Analysis - PRIMARY FEATURE (Revenue Generator) */}
        <section className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 p-8 md:p-10 rounded-xl shadow-2xl border-2 border-violet-500/30 mb-16" aria-labelledby="propiq-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="propiq-heading" className="text-3xl font-bold text-gray-50">
              PropIQ AI Analysis
            </h2>
            <span className="px-4 py-2 bg-violet-600/20 border border-violet-500/50 rounded-full text-violet-300 text-sm font-semibold">
              {propIqRemaining} analyses remaining
            </span>
          </div>
          <p className="text-gray-300 mb-6 text-lg">
            Get instant AI-powered property analysis with market insights, investment recommendations, and risk assessment in seconds.
          </p>

          {/* PropIQ Feature Card */}
          <DealIqFeatureCard
            used={propIqUsed}
            limit={propIqLimit}
            onClick={handleUsePropIq}
            currentTier={currentTier}
          />

          {/* Prominent CTA */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowPropIQAnalysis(true)}
              className="group flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xl font-bold rounded-xl shadow-2xl transition-all duration-300 hover:shadow-violet-500/50 hover:scale-105"
            >
              <Target className="h-7 w-7" />
              Analyze a Property Now
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Deal Calculator Section - Free Tool */}
        <section className="bg-slate-800 p-8 md:p-10 rounded-xl shadow-xl border border-slate-700 mb-16" aria-labelledby="calculator-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="calculator-heading" className="text-2xl font-bold text-gray-50">
              Real Estate Investment Calculator
            </h2>
            <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/50 rounded-full text-emerald-300 text-sm font-semibold">
              Free Tool
            </span>
          </div>
          <p className="text-gray-400 mb-6">
            Run quick calculations on any property. For deeper insights, use PropIQ AI Analysis above.
          </p>
          <DealCalculator />
        </section>

        {/* Quick Stats Dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <StatCard
            title="Properties Analyzed"
            value={propIqUsed.toString()}
            icon={Target}
            color={PRIMARY_ACCENT}
          />
        </section>

        {/* Tier Benefits Showcase */}
        <section className="bg-slate-800 p-8 md:p-10 rounded-xl shadow-2xl border border-slate-700" aria-labelledby="benefits-heading">
          <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-3">
            <h2 id="benefits-heading" className="text-2xl font-bold text-gray-50">
              Your {tierConfig.displayName} Benefits
            </h2>
            <button
              onClick={handleUpgradeClick}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
            {tierConfig.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Shield className="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                <p className="text-sm text-gray-300">{feature}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-slate-700 p-4 rounded-lg">
            <p className="text-xs text-gray-300 text-center">
              💡 Best for: <span className="font-semibold text-gray-200">{tierConfig.bestFor}</span>
            </p>
          </div>
        </section>
      </main>

      {/* Footer - SEO Optimized */}
      <footer className="mt-12 py-8 text-center text-sm text-gray-300 bg-slate-800 border-t border-slate-700" role="contentinfo">
        <div className="container mx-auto px-4">
          <nav aria-label="Footer navigation" className="mb-4">
            <p className="mb-2">
              PropIQ is a product by <a href="https://luntra.one" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 font-semibold" aria-label="Visit LUNTRA homepage">LUNTRA</a>
            </p>
            <p className="mb-4 text-xs text-gray-400">
              <a href="https://luntra.one/about" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">About LUNTRA</a>
              {' '} | {' '}
              <a href="https://luntra.one" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">Our Products</a>
              {' '} | {' '}
              <a href="https://luntra.one/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">Terms of Service</a>
              {' '} | {' '}
              <a href="https://luntra.one/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">Privacy Policy</a>
            </p>
          </nav>
          <p>&copy; {new Date().getFullYear()} LUNTRA. All rights reserved.</p>
          <p className="text-xs text-gray-400 mt-2">
            AI-Powered Real Estate Investment Analysis | Property Calculator | Deal Analyzer
          </p>
        </div>
      </footer>

      {/* Top-Up Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onPurchase={handleTopUpPurchase}
      />

      {/* The Persistent Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onUpgradeClick={handleUpgradeClick}
      />
      {/* Support Chat Widget (shows for logged-in users) */}
      {userId && <SupportChat />}

      {/* Feedback Widget (shows for logged-in users) */}
      {userId && (
        <FeedbackWidget
          tallyFormId="wkD6rj"
          hiddenFields={{
            user_tier: currentTier,
            user_id: userId,
            feedback_source: 'general'
          }}
          position="bottom-right"
        />
      )}

      {/* Pricing Page */}
      {showPricingPage && (
        <PricingPage
          currentTier={currentTier}
          onSelectTier={handleSelectTier}
          onClose={() => setShowPricingPage(false)}
        />
      )}

      {/* PropIQ Analysis Modal */}
      {showPropIQAnalysis && (
        <PropIQAnalysis
          onClose={() => setShowPropIQAnalysis(false)}
          userId={userId}
          authToken={authToken}
        />
      )}
    </div>
  );
};

export default App;
