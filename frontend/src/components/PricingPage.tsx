import React from 'react';
import { Check, Zap, Target, Shield, Users, X } from 'lucide-react';
import { PRICING_TIERS, formatCurrency, type PricingTier } from '../config/pricing';

interface PricingPageProps {
  currentTier: string;
  onSelectTier: (tierId: string) => void;
  onClose: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ currentTier, onSelectTier, onClose }) => {
  const tiers = Object.values(PRICING_TIERS).filter(t => t.id !== 'free');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/95 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                Choose Your Plan
              </h1>
              <p className="text-xl text-gray-300">
                Scale your real estate analysis with flexible pricing
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          {/* Value Proposition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-start space-x-3 bg-slate-800 p-4 rounded-lg">
              <Target className="h-6 w-6 text-violet-300 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-300">
                  Get instant property insights with our Deal IQ engine
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-800 p-4 rounded-lg">
              <Zap className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Unlimited Deal Calculator</h3>
                <p className="text-sm text-gray-300">
                  All plans include unlimited access to deal analysis tools
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-800 p-4 rounded-lg">
              <Shield className="h-6 w-6 text-blue-300 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">No Surprises</h3>
                <p className="text-sm text-gray-300">
                  Hard caps prevent overage charges. Top up anytime for $0.50/run
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              isCurrentTier={currentTier === tier.id}
              onSelect={() => onSelectTier(tier.id)}
            />
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-7xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Detailed Comparison
          </h2>
          <ComparisonTable tiers={tiers} currentTier={currentTier} />
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="What happens when I reach my Deal IQ limit?"
              answer="You'll receive a notification at 90% usage. Once you hit your limit, you can either upgrade to a higher tier or purchase top-ups at $5 for 10 additional runs ($0.50 each)."
            />
            <FAQItem
              question="Can I change plans anytime?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades will apply at your next billing cycle."
            />
            <FAQItem
              question="Do top-up runs expire?"
              answer="No, top-up runs never expire. They roll over month to month until you use them."
            />
            <FAQItem
              question="Is the Deal Calculator really unlimited?"
              answer="Yes! All plans include unlimited access to the Deal Calculator with no usage caps."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards via Stripe. Your payment information is never stored on our servers."
            />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-violet-900 to-purple-900 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to unlock unlimited analysis?
          </h2>
          <p className="text-xl text-violet-200 mb-6">
            Join hundreds of investors making smarter decisions with LUNTRA
          </p>
          <button
            onClick={() => onSelectTier('pro')}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Start with Pro Plan
          </button>
        </div>
      </div>
    </div>
  );
};

// Pricing Card Component
const PricingCard: React.FC<{
  tier: PricingTier;
  isCurrentTier: boolean;
  onSelect: () => void;
}> = ({ tier, isCurrentTier, onSelect }) => {
  const isPopular = tier.isPopular;

  return (
    <div
      className={`relative bg-slate-800 rounded-2xl p-8 border-2 transition-all transform hover:scale-105 ${
        isPopular
          ? 'border-violet-500 shadow-2xl shadow-violet-500/30'
          : 'border-slate-700 hover:border-violet-500/50'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
            MOST POPULAR
          </span>
        </div>
      )}

      {isCurrentTier && (
        <div className="absolute -top-4 right-4">
          <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            CURRENT PLAN
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{tier.displayName}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-5xl font-extrabold text-white">{formatCurrency(tier.price)}</span>
          <span className="text-gray-300 ml-2">/month</span>
        </div>
        <p className="text-sm text-gray-300">{tier.bestFor}</p>
      </div>

      <div className="mb-6 p-4 bg-slate-900 rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-bold text-violet-300 mb-1">
            {tier.propIqLimit}
          </div>
          <div className="text-sm text-gray-300">
            Deal IQ analyses/month
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {formatCurrency(tier.cogs)} COGS · {tier.grossMargin}% margin
          </div>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-2">
            <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={isCurrentTier}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
          isCurrentTier
            ? 'bg-gray-600 cursor-not-allowed'
            : isPopular
            ? 'bg-violet-600 hover:bg-violet-500 shadow-lg'
            : 'bg-slate-700 hover:bg-slate-600'
        }`}
      >
        {isCurrentTier ? 'Current Plan' : `Choose ${tier.name}`}
      </button>
    </div>
  );
};

// Comparison Table Component
const ComparisonTable: React.FC<{
  tiers: PricingTier[];
  currentTier: string;
}> = ({ tiers, currentTier }) => {
  const features = [
    'Deal IQ Analyses',
    'Deal Calculator',
    'Mobile Access',
    'Usage Dashboard',
    'Support',
    'PDF Reports',
    'CSV Exports',
    'API Access',
    'Team Collaboration'
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-slate-800 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-slate-900">
            <th className="px-6 py-4 text-left text-white font-bold">Feature</th>
            {tiers.map((tier) => (
              <th key={tier.id} className="px-6 py-4 text-center">
                <div className="text-white font-bold">{tier.name}</div>
                <div className="text-sm text-gray-300">{formatCurrency(tier.price)}/mo</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-t border-slate-700">
              <td className="px-6 py-4 text-gray-300">{feature}</td>
              {tiers.map((tier) => (
                <td key={tier.id} className="px-6 py-4 text-center">
                  {getFeatureValue(feature, tier)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// FAQ Item Component
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-2">{question}</h3>
      <p className="text-gray-300">{answer}</p>
    </div>
  );
};

// Helper function to get feature values
function getFeatureValue(feature: string, tier: PricingTier): React.ReactNode {
  switch (feature) {
    case 'Deal IQ Analyses':
      return <span className="text-white font-semibold">{tier.propIqLimit}/mo</span>;
    case 'Deal Calculator':
      return <Check className="h-5 w-5 text-emerald-400 mx-auto" />;
    case 'Mobile Access':
      return <Check className="h-5 w-5 text-emerald-400 mx-auto" />;
    case 'Usage Dashboard':
      return tier.id === 'starter' ? (
        <span className="text-gray-400">Basic</span>
      ) : tier.id === 'pro' ? (
        <span className="text-violet-300">Advanced</span>
      ) : (
        <span className="text-emerald-400">Premium</span>
      );
    case 'Support':
      return tier.id === 'starter' ? (
        <span className="text-gray-300">Email</span>
      ) : tier.id === 'pro' ? (
        <span className="text-gray-300">Email + Chat</span>
      ) : (
        <span className="text-gray-300">Email + Chat + Phone</span>
      );
    case 'PDF Reports':
      return tier.id === 'starter' ? (
        <X className="h-5 w-5 text-gray-600 mx-auto" />
      ) : (
        <Check className="h-5 w-5 text-emerald-400 mx-auto" />
      );
    case 'CSV Exports':
      return tier.id === 'elite' ? (
        <Check className="h-5 w-5 text-emerald-400 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-gray-600 mx-auto" />
      );
    case 'API Access':
      return tier.id === 'elite' ? (
        <span className="text-gray-300">Coming soon</span>
      ) : (
        <X className="h-5 w-5 text-gray-600 mx-auto" />
      );
    case 'Team Collaboration':
      return tier.id === 'elite' ? (
        <span className="text-white">Up to 3 users</span>
      ) : (
        <X className="h-5 w-5 text-gray-600 mx-auto" />
      );
    default:
      return null;
  }
}

export default PricingPage;
