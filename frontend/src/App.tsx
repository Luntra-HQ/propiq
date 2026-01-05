import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Zap, Target, Lock, CreditCard, X, DollarSign, Loader2, BarChart, HelpCircle } from 'lucide-react';
import { CookieConsent } from './components/CookieConsent';
import { Dashboard } from './components/Dashboard';
import {
  SkipLink,
  CommandPalette,
  useCommandPalette,
  ThemeToggle,
  getDefaultCommands,
} from './components/ui';

// Lazy load heavy components for better initial load performance
const PricingPage = lazy(() => import('./components/PricingPage'));
const SupportChat = lazy(() => import('./components/SupportChat').then(m => ({ default: m.SupportChat })));
const FeedbackWidget = lazy(() => import('./components/FeedbackWidget').then(m => ({ default: m.FeedbackWidget })));
const PropIQAnalysis = lazy(() => import('./components/PropIQAnalysis').then(m => ({ default: m.PropIQAnalysis })));
const ProductTour = lazy(() => import('./components/ProductTour').then(m => ({ default: m.ProductTour })));
const HelpCenter = lazy(() => import('./components/HelpCenter').then(m => ({ default: m.HelpCenter })));
const OnboardingChecklist = lazy(() => import('./components/OnboardingChecklist').then(m => ({ default: m.OnboardingChecklist })));
const ComponentTestPage = lazy(() => import('./pages/ComponentTestPage'));
const ResendVerificationBanner = lazy(() => import('./components/ResendVerification').then(m => ({ default: m.ResendVerificationBanner })));

// Import hook from separate file (avoids static/dynamic import conflict)
import { useShouldShowTour } from './hooks/useProductTour';

// Suspense fallback component
const SuspenseFallback: React.FC<{ minHeight?: string }> = ({ minHeight = '100px' }) => (
  <div
    className="flex items-center justify-center suspense-pulse"
    style={{ minHeight }}
    role="status"
    aria-label="Loading..."
  >
    <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
  </div>
);

// --- BACKEND AUTH IMPORTS (Server-side sessions with httpOnly cookies) ---
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
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
import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
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

// Header (2025 Glassmorphism Design)
const Header = ({
  propIqUsed,
  propIqLimit,
  currentTier,
  userId,
  userEmail,
  onLogout,
  onHelpClick
}: {
  propIqUsed: number;
  propIqLimit: number;
  currentTier: string;
  userId: string | null;
  userEmail: string | null;
  onLogout: () => void;
  onHelpClick: () => void;
}) => {
  const tierConfig = PRICING_TIERS[currentTier] || PRICING_TIERS.free;

  return (
    <header className="flex justify-between items-center p-4 md:px-6 md:py-4 bg-slate-800/80 backdrop-blur-glass border-b border-glass-border shadow-card sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-50 tracking-tight">
            PropIQ
          </h1>
          <p className="text-[10px] text-gray-400 hidden sm:block">AI Property Analysis</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-glass border border-glass-border">
          <CreditCard className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-medium text-gray-200">{tierConfig.displayName}</span>
        </div>
        <UsageBadge used={propIqUsed} limit={propIqLimit} />
        <button
          onClick={onHelpClick}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg transition-colors"
          title="Help Center"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden md:inline text-xs font-semibold">Help</span>
        </button>
        {userId && (
          <div className="flex items-center space-x-2">
            <div className="hidden lg:block text-xs text-gray-400 truncate max-w-[120px]" title={userEmail || userId}>
              {userEmail || 'Logged In'}
            </div>
            <button
              onClick={onLogout}
              className="btn-ghost text-xs"
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

// Usage Badge Component (2025 Design)
const UsageBadge = ({ used, limit }: { used: number; limit: number }) => {
  const remaining = getRemainingRuns(used, limit);
  const percentage = (used / limit) * 100;

  let statusColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (percentage >= 90) {
    statusColor = 'bg-red-500/20 text-red-300 border-red-500/30';
  } else if (percentage >= 75) {
    statusColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }

  const text = remaining > 0 ? `${remaining} left` : 'Limit reached';

  return (
    <div className={`px-3 py-1.5 text-xs font-medium rounded-full ${statusColor} border flex items-center gap-1.5 transition-colors`}>
      <BarChart className="h-3.5 w-3.5" />
      <span>{text}</span>
    </div>
  );
};

// Upgrade Prompt Banner Component (90% threshold - 2025 Glassmorphism)
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
      <div className="bg-gradient-to-r from-violet-900/90 to-purple-900/90 backdrop-blur-glass border border-violet-500/50 rounded-2xl shadow-glow p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                {CONVERSION_COPY.warningBanner.title.replace('{used}', used.toString()).replace('{total}', limit.toString())}
              </h3>
              <p className="text-sm text-violet-200/80">
                {CONVERSION_COPY.warningBanner.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={onTopUp}
                  className="btn-press px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/30"
                >
                  Buy 10 More ($5)
                </button>
                {nextTier && (
                  <button
                    onClick={onUpgrade}
                    className="btn-press px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/30"
                  >
                    Upgrade to {nextTier.name} ({formatCurrency(nextTier.price)}/mo)
                  </button>
                )}
                <button
                  onClick={onDismiss}
                  className="btn-ghost px-4 py-2 text-violet-200 text-sm font-medium"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 p-1 text-violet-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
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
  // authToken is now provided by useAuth hook as sessionToken

  // Help Center state
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  // Product tour state
  const shouldShowTour = useShouldShowTour();
  const [showTour, setShowTour] = useState(false);

  // Command palette state (Cmd+K)
  const { isOpen: isCommandPaletteOpen, close: closeCommandPalette } = useCommandPalette();

  // Theme state (for now, dark mode only - light mode toggle prepared)
  const [currentTheme] = useState<'dark' | 'light'>('dark');

  // Derived state
  const tierConfig = PRICING_TIERS[currentTier] || PRICING_TIERS.free;
  const propIqLimit = tierConfig.propIqLimit;
  const propIqRemaining = getRemainingRuns(propIqUsed, propIqLimit);

  // Use server-side session auth (httpOnly cookies)
  // Note: App is wrapped in ProtectedRoute, so user is always authenticated here
  const { user, isLoading: authLoading, logout: authLogout, sessionToken } = useAuth();

  // Convex action for Stripe checkout
  const createCheckout = useAction(api.payments.createCheckoutSession);

  // Sync auth state with local component state
  useEffect(() => {
    // Still loading auth - ProtectedRoute handles the loading state,
    // but we still sync here for internal state
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    // Auth loaded - update state from user data
    setIsLoading(false);

    if (user) {
      console.log('[APP] User data synced:', user.email);
      setUserId(user._id);
      setUserEmail(user.email);
      setPropIqUsed(user.analysesUsed || 0);
      setCurrentTier(user.subscriptionTier || 'free');
    }
    // Note: No need to handle unauthenticated case - ProtectedRoute handles it
  }, [user, authLoading]);

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
    console.log('=== CHECKOUT DEBUG START ===');
    console.log('1. Tier selected:', tierId);
    console.log('2. User ID:', userId);
    console.log('3. Current URL:', window.location.origin);

    // UNAUTHENTICATED USER FLOW: Redirect to signup
    if (!userId) {
      console.log('4. User not authenticated - redirecting to signup');
      window.location.href = '/signup';
      return;
    }

    try {
      // Show loading state
      setShowPricingPage(false);

      console.log('4. Calling createCheckout action...');
      const checkoutParams = {
        userId: userId as Id<"users">,
        tier: tierId,
        successUrl: `${window.location.origin}/app?upgrade=success`,
        cancelUrl: `${window.location.origin}/app?upgrade=cancelled`,
      };
      console.log('5. Checkout params:', checkoutParams);

      // Call Convex action to create Stripe checkout session
      const result = await createCheckout(checkoutParams);

      console.log('6. Checkout result received:', result);

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        console.log('7. SUCCESS - Redirecting to Stripe checkout:', result.sessionId);
        console.log('8. Stripe URL:', result.url);
        window.location.href = result.url;
      } else {
        console.error('ERROR: Result missing success or url:', result);
        throw new Error('Failed to create checkout session - invalid response');
      }
    } catch (error: any) {
      console.error('=== CHECKOUT ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);

      // Show user-friendly error message
      const errorMessage = error.message || 'Unable to start checkout. Please try again.';
      alert(`Checkout Error: ${errorMessage}\n\nCheck browser console for details.`);

      // Reopen pricing page so user can try again
      setShowPricingPage(true);
    }
    console.log('=== CHECKOUT DEBUG END ===');
  };

  const handleTopUpPurchase = async (packageId: string) => {
    console.log(`Top-up package selected: ${packageId}`);

    // Top-ups coming soon - for now, suggest upgrading
    const pkg = TOP_UP_PACKAGES.find(p => p.id === packageId);
    const runsText = pkg ? `${pkg.runs} runs` : 'additional runs';

    setShowTopUpModal(false);
    setShowUpgradeBanner(false);

    // Show upgrade suggestion
    const shouldUpgrade = window.confirm(
      `Top-up purchases (${runsText}) are coming soon!\n\n` +
      `In the meantime, would you like to upgrade your plan for more monthly analyses?`
    );

    if (shouldUpgrade) {
      setShowPricingPage(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // No reload needed - useCurrentUser hook will automatically fetch fresh data
    // when localStorage is updated by AuthModal's handleAuthSuccess
  };

  const handleLogout = () => {
    // Use server-side logout (clears httpOnly cookie)
    authLogout();
  };

  const handleDismissUpgradeBanner = () => {
    setShowUpgradeBanner(false);
    // Store dismissal in localStorage to prevent repeated prompts
    localStorage.setItem('upgradeBannerDismissed', Date.now().toString());
  };

  // Removed auto-checkout logic - users now upgrade from dashboard after signup

  // Show product tour after user logs in (if they haven't seen it)
  useEffect(() => {
    if (userId && shouldShowTour && !showAuthModal) {
      // Small delay to let the app finish loading
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userId, shouldShowTour, showAuthModal]);

  // Command palette commands
  const commandPaletteCommands = getDefaultCommands({
    onAnalyze: () => setShowPropIQAnalysis(true),
    onCalculator: () => {
      // Scroll to calculator section
      document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
    },
    onPricing: () => setShowPricingPage(true),
    onHelp: () => window.open('https://luntra.one/support', '_blank'),
    onLogout: handleLogout,
    onThemeToggle: () => {
      // Theme toggle - currently dark mode only, prepared for future
      console.log('Theme toggle - light mode coming soon');
    },
    currentTheme,
  });

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

  // Component Test Page (accessible at /test for rapid testing)
  if (window.location.pathname === '/test') {
    return (
      <Suspense fallback={<SuspenseFallback minHeight="100vh" />}>
        <ComponentTestPage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col font-sans antialiased">
      {/* Skip Link for Keyboard Navigation (Accessibility) */}
      <SkipLink targetId="main-content" />

      {/* Header with tier and usage info */}
      <Header
        propIqUsed={propIqUsed}
        propIqLimit={propIqLimit}
        currentTier={currentTier}
        userId={userId}
        userEmail={userEmail}
        onLogout={handleLogout}
        onHelpClick={() => setShowHelpCenter(true)}
      />

      {/* Email Verification Banner (shows if email not verified) */}
      {user && !user.emailVerified && userEmail && (
        <Suspense fallback={null}>
          <ResendVerificationBanner email={userEmail} />
        </Suspense>
      )}

      {/* Onboarding Checklist (shows for first 7 days) */}
      {userId && <OnboardingChecklist userId={userId as any} />}

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

      {/* Main Dashboard - 2025 Bento Grid Design */}
      <div id="main-content" role="main" tabIndex={-1}>
        <Dashboard
          propIqUsed={propIqUsed}
          propIqLimit={propIqLimit}
          currentTier={currentTier}
          userEmail={userEmail}
          onAnalyzeClick={() => setShowPropIQAnalysis(true)}
          onUpgradeClick={handleUpgradeClick}
          onHelpClick={() => setShowHelpCenter(true)}
        />
      </div>

      {/* Footer - SEO Optimized */}
      <footer className="py-8 text-center text-sm text-gray-300 bg-slate-800/50 border-t border-slate-700/50 backdrop-blur-sm" role="contentinfo">
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

      {/* Lazy-loaded components with Suspense */}
      <Suspense fallback={null}>
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

        {/* Product Tour - shows after login for new users */}
        {showTour && (
          <ProductTour
            onComplete={() => setShowTour(false)}
            onSkip={() => setShowTour(false)}
            autoStart={true}
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
            authToken={sessionToken}
          />
        )}
      </Suspense>

      {/* Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        commands={commandPaletteCommands}
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
      />

      {/* Cookie Consent Banner - GDPR/CCPA Compliance */}
      <CookieConsent />

      {/* Onboarding Checklist - Shows for new users */}
      {userId && (
        <Suspense fallback={null}>
          <OnboardingChecklist userId={userId as any} />
        </Suspense>
      )}

      {/* Help Center Modal */}
      <Suspense fallback={null}>
        {showHelpCenter && (
          <HelpCenter
            isOpen={showHelpCenter}
            onClose={() => setShowHelpCenter(false)}
            userId={userId as any}
          />
        )}
      </Suspense>
    </div>
  );
};

export default App;
