import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Target, Shield, ArrowLeft } from 'lucide-react';
import { PRICING_TIERS, formatCurrency } from '../config/pricing';

const PricingPagePublic: React.FC = () => {
  const navigate = useNavigate();
  const tiers = Object.values(PRICING_TIERS);

  // Simple redirect to signup - users create account first
  const handleTierSelect = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-xl font-bold">PropIQ</span>
            </Link>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition font-medium"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Scale your real estate analysis with flexible pricing
          </p>

          {/* Value Proposition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start space-x-3 bg-slate-800 p-4 rounded-lg">
              <Target className="h-6 w-6 text-violet-300 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-bold text-white mb-1">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-300">
                  Get instant property insights with our AI engine
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-800 p-4 rounded-lg">
              <Zap className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-bold text-white mb-1">Unlimited Calculator</h3>
                <p className="text-sm text-gray-300">
                  All plans include unlimited deal calculator access
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-800 p-4 rounded-lg">
              <Shield className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-bold text-white mb-1">No Lock-In</h3>
                <p className="text-sm text-gray-300">
                  Cancel anytime. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const isPopular = tier.id === 'pro';

            return (
              <div
                key={tier.id}
                className={`relative bg-slate-800 rounded-2xl p-8 border-2 transition-all ${
                  isPopular
                    ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-105'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-extrabold text-white">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-gray-400">/month</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{tier.bestFor}</p>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-violet-400">
                      {tier.propIqLimit === 999999 ? 'Unlimited' : tier.propIqLimit}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {tier.propIqLimit === 999999 ? 'analyses' : 'analyses/month'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleTierSelect}
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition ${
                    isPopular
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white'
                      : tier.id === 'free'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {tier.id === 'free' ? 'Start Free Trial' : 'Create Account'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Can I change plans later?</h3>
              <p className="text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time from your account settings.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept all major credit cards via Stripe. Your payment information is never stored on our servers.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Is there a free trial?</h3>
              <p className="text-gray-400">
                Yes! The Free plan includes 3 property analyses. No credit card required to get started.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">
                Absolutely. You can cancel your subscription at any time with no penalties or fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPagePublic;
