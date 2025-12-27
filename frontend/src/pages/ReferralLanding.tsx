import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Check, TrendingUp, BarChart3, Shield } from 'lucide-react';

export const ReferralLanding: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [referrerName, setReferrerName] = useState<string>('A PropIQ user');

  const validation = useQuery(
    api.referrals.validateReferralCode,
    code ? { code } : 'skip'
  );

  useEffect(() => {
    if (validation && validation.valid) {
      setReferrerName(validation.referrerName);
      // Store referral code in sessionStorage to attach during signup
      sessionStorage.setItem('referralCode', code || '');
    } else if (validation && !validation.valid) {
      // Invalid code, redirect to regular signup after a moment
      setTimeout(() => navigate('/signup'), 3000);
    }
  }, [validation, code, navigate]);

  const handleSignup = () => {
    navigate('/signup');
  };

  if (!validation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!validation.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Referral Code</h2>
          <p className="text-gray-600 mb-4">
            This referral link is not valid. Redirecting you to signup...
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-all"
          >
            Sign Up Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-violet-600">PropIQ</div>
          <button
            onClick={handleSignup}
            className="px-4 py-2 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Invitation Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-4">
            <span className="text-2xl">🎉</span>
            <span className="text-sm font-medium text-violet-900">
              You were invited by {referrerName}!
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Real Estate
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Deal Analysis
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of investors using PropIQ to analyze properties, avoid bad deals, and find hidden gems.
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-16">
          <button
            onClick={handleSignup}
            className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white text-lg font-bold rounded-lg transition-all shadow-lg shadow-violet-500/30 inline-flex items-center gap-2"
          >
            Start Analyzing Deals
            <span className="text-sm font-normal bg-violet-800 px-2 py-1 rounded">3 Free Analyses</span>
          </button>
          <p className="text-sm text-gray-500 mt-3">No credit card required</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Deal Score Algorithm</h3>
            <p className="text-gray-600 text-sm">
              Get instant 0-100 ratings on any property. Our AI analyzes 15+ metrics to tell you if it's a winner or a dud.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Comprehensive Analytics</h3>
            <p className="text-gray-600 text-sm">
              Cap rate, cash-on-cash return, 1% rule, and 5-year projections. Everything you need to make confident decisions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Risk Assessment</h3>
            <p className="text-gray-600 text-sm">
              Identify red flags before you invest. Market trends, neighborhood analysis, and comparable sales data.
            </p>
          </div>
        </div>

        {/* What You Get */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What You'll Get</h2>
          <div className="space-y-4">
            {[
              '3 free AI-powered property analyses',
              'Instant deal scoring (0-100 rating)',
              'Financial metrics and cash flow projections',
              'Market analysis and comparable properties',
              'Investment risk assessment',
              'Export reports (coming soon)',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleSignup}
            className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-violet-500/30"
          >
            Get Started Now
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 mb-2">Trusted by real estate investors nationwide</p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div>
              <div className="text-2xl font-bold text-gray-700">1,000+</div>
              <div className="text-xs">Properties Analyzed</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div>
              <div className="text-2xl font-bold text-gray-700">500+</div>
              <div className="text-xs">Active Investors</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div>
              <div className="text-2xl font-bold text-gray-700">4.8/5</div>
              <div className="text-xs">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralLanding;
