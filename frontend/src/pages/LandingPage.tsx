/**
 * Public Landing Page
 *
 * Marketing page visible to unauthenticated users.
 * Showcases PropIQ value proposition and drives signups.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  BarChart,
  Calculator,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Lock,
  Download,
  Mail,
} from 'lucide-react';
import { calculateAllMetrics, formatCurrency, formatPercent } from '../utils/calculatorUtils';

const LandingPage: React.FC = () => {
  // Usage tracking
  const [usageCount, setUsageCount] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const USAGE_LIMIT = 3;

  // Lead magnet form state
  const [leadFormData, setLeadFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [leadFormSubmitted, setLeadFormSubmitted] = useState(false);
  const [leadFormSubmitting, setLeadFormSubmitting] = useState(false);

  // Calculator inputs
  const [inputs, setInputs] = useState({
    purchasePrice: 300000,
    downPaymentPercent: 20,
    interestRate: 7.0,
    monthlyRent: 2500,
    annualPropertyTax: 3600,
    annualInsurance: 1200,
    monthlyMaintenance: 200,
    monthlyVacancy: 125,
  });

  // Calculated metrics
  const [metrics, setMetrics] = useState<any>(null);

  // Load usage count from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('propiq_demo_usage');
    if (stored) {
      const count = parseInt(stored, 10);
      setUsageCount(count);
      setIsLimited(count >= USAGE_LIMIT);
    }
  }, []);

  // Calculate metrics when inputs change
  useEffect(() => {
    const calculated = calculateAllMetrics({
      ...inputs,
      loanTerm: 30,
      monthlyHOA: 0,
      monthlyUtilities: 0,
      monthlyPropertyManagement: 0,
      closingCosts: inputs.purchasePrice * 0.03,
      rehabCosts: 0,
      strategy: 'rental' as const,
    });
    setMetrics(calculated);
  }, [inputs]);

  const handleInputChange = (field: string, value: number) => {
    if (isLimited) return;
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    if (isLimited) {
      window.location.href = '#lead-magnet';
      return;
    }

    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('propiq_demo_usage', newCount.toString());

    if (newCount >= USAGE_LIMIT) {
      setIsLimited(true);
    }
  };

  // Handle lead magnet form submission
  const handleLeadFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadFormSubmitting(true);

    try {
      // Get UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const data = {
        ...leadFormData,
        leadMagnetType: 'real-estate-checklist',
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
      };

      // Send to our Convex webhook (primary - triggers nurture sequence)
      const convexResponse = await fetch('https://mild-tern-361.convex.site/formspree-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!convexResponse.ok) {
        console.error('Convex webhook failed:', await convexResponse.text());
      }

      // Also send to Formspree (secondary - for your email notifications)
      const formspreeData = new FormData();
      formspreeData.append('email', leadFormData.email);
      formspreeData.append('firstName', leadFormData.firstName);
      formspreeData.append('lastName', leadFormData.lastName);
      formspreeData.append('leadMagnetType', 'real-estate-checklist');

      await fetch('https://formspree.io/f/xldqywge', {
        method: 'POST',
        body: formspreeData,
      });

      // Show success state
      setLeadFormSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again or email us at bdusape@luntra.one');
    } finally {
      setLeadFormSubmitting(false);
    }
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

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/pricing" className="text-gray-300 hover:text-white transition">
                Pricing
              </Link>
              <a href="#features" className="text-gray-300 hover:text-white transition">
                Features
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition">
                Testimonials
              </a>
              <Link to="/faq" className="text-gray-300 hover:text-white transition">
                FAQ
              </Link>
            </div>

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

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm mb-6">
              <Zap className="h-4 w-4" />
              AI-Powered Real Estate Analysis
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Analyze Any Property in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                30 Seconds
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Get instant cap rate, cash flow, and ROI calculations powered by AI.
              Save your analysis reports and access them anytime from your dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-semibold text-lg transition"
              >
                View Pricing
              </Link>
            </div>

            <p className="text-gray-400 text-sm mt-4">
              3 free analyses included. No credit card required.
            </p>

            <div className="mt-8 flex justify-center">
              <a href="https://www.producthunt.com/products/propiq?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-propiq" target="_blank" rel="noopener noreferrer">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1057395&theme=light&t=1770360962832" alt="PropIQ - Analyze any rental property in 60 seconds | Product Hunt" style={{ width: '250px', height: '54px' }} width="250" height="54" />
              </a>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y border-slate-800 bg-slate-800/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <span>AI-Powered Analysis</span>
              <div className="h-6 w-px bg-slate-700" />
              <span>30-Second Results</span>
              <div className="h-6 w-px bg-slate-700" />
              <span>Advanced Metrics</span>
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-4">
                <Zap className="h-4 w-4" />
                {isLimited ? (
                  <>
                    <Lock className="h-4 w-4" />
                    3 Free Analyses Used - Join Waitlist for Unlimited
                  </>
                ) : (
                  `Try It Live - ${USAGE_LIMIT - usageCount} Free Analyses Left`
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {isLimited ? 'Want Unlimited Analyses?' : 'See PropIQ in Action'}
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {isLimited
                  ? 'Download our free checklist or sign up for unlimited property analyses'
                  : 'Adjust the numbers below and see instant calculations. No signup required!'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Property Details Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-violet-400" />
                  Property Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">Purchase Price</label>
                      <input
                        type="number"
                        value={inputs.purchasePrice}
                        onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                        disabled={isLimited}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-xl font-bold focus:border-violet-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">Monthly Rent</label>
                      <input
                        type="number"
                        value={inputs.monthlyRent}
                        onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                        disabled={isLimited}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-green-400 text-xl font-bold focus:border-violet-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">Down Payment %</label>
                      <input
                        type="number"
                        value={inputs.downPaymentPercent}
                        onChange={(e) => handleInputChange('downPaymentPercent', Number(e.target.value))}
                        disabled={isLimited}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white font-semibold focus:border-violet-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">Interest Rate %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.interestRate}
                        onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                        disabled={isLimited}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white font-semibold focus:border-violet-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <h4 className="text-sm font-semibold mb-3 text-gray-300">Monthly Expenses</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mortgage</span>
                        <span>$1,597</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Property Tax</span>
                        <span>$300</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Insurance</span>
                        <span>$100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Maintenance</span>
                        <span>$200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Vacancy Reserve</span>
                        <span>$125</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Results Card */}
              <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/30 rounded-xl p-6 backdrop-blur">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-violet-400" />
                  Instant Analysis
                </h3>

                {/* Deal Score */}
                {metrics && (
                  <>
                    <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-green-500/30">
                      <p className="text-sm text-gray-400 mb-2">Deal Score</p>
                      <div className="flex items-end gap-3">
                        <p className="text-5xl font-bold text-green-400">{metrics.dealScore}</p>
                        <p className="text-lg text-green-400 mb-2">{metrics.dealRating}</p>
                      </div>
                      <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-blue-500" style={{ width: `${metrics.dealScore}%` }}></div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-800/30 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Monthly Cash Flow</p>
                        <p className={`text-3xl font-bold ${metrics.monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metrics.monthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(metrics.monthlyCashFlow)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">After all expenses</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-800/30 rounded-lg">
                          <p className="text-sm text-gray-400 mb-1">Cap Rate</p>
                          <p className="text-2xl font-bold">{formatPercent(metrics.capRate)}</p>
                        </div>
                        <div className="p-4 bg-slate-800/30 rounded-lg">
                          <p className="text-sm text-gray-400 mb-1">Cash-on-Cash ROI</p>
                          <p className="text-2xl font-bold">{formatPercent(metrics.cashOnCashReturn)}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">1% Rule Check</p>
                          <span className={`px-2 py-1 ${metrics.onePercentRule ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'} text-xs rounded`}>
                            {metrics.onePercentRule ? 'Pass' : 'Close'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Rent is {formatCurrency(inputs.monthlyRent)} vs. 1% target of {formatCurrency(inputs.purchasePrice * 0.01)}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* CTA */}
                {isLimited ? (
                  <a
                    href="#lead-magnet"
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Get Free Checklist
                  </a>
                ) : (
                  <button
                    onClick={handleCalculate}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Calculator className="h-5 w-5" />
                    Calculate ({USAGE_LIMIT - usageCount} left)
                  </button>
                )}
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-violet-400" />
                </div>
                <p className="font-semibold mb-1">Instant Results</p>
                <p className="text-sm text-gray-400">Get complete analysis in under 30 seconds</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BarChart className="h-6 w-6 text-violet-400" />
                </div>
                <p className="font-semibold mb-1">Advanced Metrics</p>
                <p className="text-sm text-gray-400">Cap rate, ROI, cash flow, and 5-year projections</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-violet-400" />
                </div>
                <p className="font-semibold mb-1">Risk Assessment</p>
                <p className="text-sm text-gray-400">Identify red flags before you invest</p>
              </div>
            </div>
          </div>
        </section>

        {/* Video Demo */}
        <section className="py-20 px-4 bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm mb-4">
                <Zap className="h-4 w-4" />
                Watch PropIQ in Action
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                See How It Works
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Watch this quick demo to see how PropIQ analyzes properties in seconds
              </p>
            </div>

            {/* Video Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/8uwHHAkGgF0"
                  title="PropIQ Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Video CTA */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">Ready to start analyzing properties?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center gap-2"
                >
                  Try Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#lead-magnet"
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center gap-2"
                >
                  Download Free Checklist
                  <Download className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Analyze Deals
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                PropIQ combines AI analysis with comprehensive financial calculators
                to help you make confident investment decisions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'AI Property Analysis',
                  description: 'Get instant insights on any property with our GPT-4 powered analysis engine.',
                },
                {
                  icon: BarChart,
                  title: 'Saved Report History',
                  description: 'Access all your property analysis reports anytime from your personal dashboard.',
                },
                {
                  icon: Calculator,
                  title: 'Deal Calculator',
                  description: 'Comprehensive calculator with cap rate, cash flow, ROI, and 5-year projections.',
                },
                {
                  icon: Clock,
                  title: '30-Second Analysis',
                  description: 'From address to full analysis in under 30 seconds.',
                },
                {
                  icon: Shield,
                  title: 'Risk Assessment',
                  description: 'Identify potential risks and red flags before you invest.',
                },
                {
                  icon: CheckCircle,
                  title: 'Deal Comparison',
                  description: 'Compare multiple properties side-by-side to find the best investment.',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-violet-500/50 transition"
                >
                  <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-20 px-4 bg-slate-800/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Start free, upgrade when you're ready.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Free', price: '$0', analyses: '3 analyses', featured: false },
                { name: 'Pro', price: '$79', analyses: '100 analyses/mo', featured: true },
                { name: 'Elite', price: '$199', analyses: 'Unlimited', featured: false },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`p-6 rounded-xl border ${tier.featured
                    ? 'bg-violet-600/10 border-violet-500'
                    : 'bg-slate-800/50 border-slate-700'
                    }`}
                >
                  <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                  <p className="text-3xl font-bold mb-4">
                    {tier.price}
                    <span className="text-sm text-gray-400 font-normal">/mo</span>
                  </p>
                  <p className="text-gray-400 mb-6">{tier.analyses}</p>
                  <Link
                    to="/pricing"
                    className={`block w-full py-2 rounded-lg font-medium transition ${tier.featured
                      ? 'bg-violet-600 hover:bg-violet-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                  >
                    {tier.featured ? 'Get Started' : 'Learn More'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Magnet Section - Free Checklist */}
        <section id="lead-magnet" className="py-20 px-4 bg-gradient-to-b from-slate-900 via-violet-900/10 to-slate-800">
          <div className="max-w-4xl mx-auto">
            {!leadFormSubmitted ? (
              // Form State
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Value Proposition */}
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-6">
                    <Download className="h-4 w-4" />
                    FREE Download
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Get Your FREE Real Estate Investment Checklist
                  </h2>
                  <p className="text-gray-400 text-lg mb-6">
                    Not ready to sign up yet? Download our comprehensive checklist used by professional investors to analyze any property.
                  </p>

                  <div className="space-y-3 mb-6">
                    {[
                      'Complete property analysis framework',
                      'Financial calculation formulas',
                      'Risk assessment criteria',
                      'Deal scoring methodology',
                      'Due diligence checklist',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500">
                    📧 Plus, get exclusive tips on analyzing real estate deals (unsubscribe anytime)
                  </p>
                </div>

                {/* Right: Form */}
                <div className="bg-slate-800/50 border border-violet-500/30 rounded-xl p-8 backdrop-blur">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Download Now</h3>
                      <p className="text-sm text-gray-400">Instant access • No credit card</p>
                    </div>
                  </div>

                  <form onSubmit={handleLeadFormSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">First Name</label>
                      <input
                        type="text"
                        value={leadFormData.firstName}
                        onChange={(e) => setLeadFormData({ ...leadFormData, firstName: e.target.value })}
                        placeholder="John"
                        required
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Last Name</label>
                      <input
                        type="text"
                        value={leadFormData.lastName}
                        onChange={(e) => setLeadFormData({ ...leadFormData, lastName: e.target.value })}
                        placeholder="Smith"
                        required
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
                      <input
                        type="email"
                        value={leadFormData.email}
                        onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={leadFormSubmitting}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2"
                    >
                      {leadFormSubmitting ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5" />
                          Download Free Checklist
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      By downloading, you agree to receive occasional emails from PropIQ. Unsubscribe anytime.
                    </p>
                  </form>
                </div>
              </div>
            ) : (
              // Success State
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Check Your Email! 📧
                </h2>

                <p className="text-xl text-gray-400 mb-8">
                  We've sent your <strong>FREE Real Estate Investment Checklist</strong> to:
                </p>

                <p className="text-2xl font-semibold text-violet-400 mb-8">
                  {leadFormData.email}
                </p>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold mb-3">What's Next?</h3>
                  <div className="space-y-2 text-left text-gray-300">
                    <p>✅ Check your inbox (and spam folder just in case)</p>
                    <p>✅ Download your free checklist</p>
                    <p>✅ Watch for our tips on analyzing real estate deals</p>
                    <p>✅ When you're ready, try PropIQ's AI-powered analysis</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2"
                  >
                    Try PropIQ Free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => setLeadFormSubmitted(false)}
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-semibold text-lg transition"
                  >
                    Download Another Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-bold">PropIQ</span>
              <span className="text-gray-400">by LUNTRA</span>
            </div>

            <div className="flex gap-6 text-gray-400 text-sm">
              <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
              <a href="mailto:bdusape@luntra.one" className="text-violet-400 hover:text-violet-300">bdusape@luntra.one</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
            </div>

            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} LUNTRA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
