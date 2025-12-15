/**
 * Public Landing Page
 *
 * Marketing page visible to unauthenticated users.
 * Showcases PropIQ value proposition and drives signups.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Zap,
  BarChart,
  Calculator,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/app');
    } else {
      navigate('/login');
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
              {isAuthenticated ? (
                <Link
                  to="/app"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition"
                >
                  Go to App
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white transition">
                    Log In
                  </Link>
                  <button
                    onClick={handleGetStarted}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition"
                  >
                    Get Started Free
                  </button>
                </>
              )}
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
            Make smarter investment decisions with PropIQ.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </button>
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
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-slate-800 bg-slate-800/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <span>Trusted by 500+ investors</span>
            <div className="h-6 w-px bg-slate-700" />
            <span>10,000+ properties analyzed</span>
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
                icon: Calculator,
                title: 'Deal Calculator',
                description: 'Comprehensive calculator with cap rate, cash flow, ROI, and 5-year projections.',
              },
              {
                icon: BarChart,
                title: 'Deal Scoring',
                description: 'Automatic 0-100 deal score based on multiple investment criteria.',
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
                title: '1% Rule Check',
                description: 'Instant validation against the 1% rule and other investment criteria.',
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
                className={`p-6 rounded-xl border ${
                  tier.featured
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
                  className={`block w-full py-2 rounded-lg font-medium transition ${
                    tier.featured
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

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make Smarter Investments?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join 500+ investors who trust PropIQ for their property analysis.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold text-lg transition"
          >
            Start Your Free Trial
          </button>
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
              <a href="mailto:support@luntra.one" className="hover:text-white transition">Support</a>
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
