/**
 * Public Landing Page
 *
 * Marketing page visible to unauthenticated users.
 * Showcases PropIQ value proposition and drives signups.
 */

import React from 'react';
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
} from 'lucide-react';

const LandingPage: React.FC = () => {

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
              <a
                href="#waitlist"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition"
              >
                Join Waitlist
              </a>
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
            <a
              href="#waitlist"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2"
            >
              Get Early Access
              <ArrowRight className="h-5 w-5" />
            </a>
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

      {/* Interactive Demo */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-4">
              <Zap className="h-4 w-4" />
              Try It Live - No Signup Required
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See PropIQ in Action
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Here's a sample analysis of a $300K property. See the instant calculations and insights.
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
                    <p className="text-gray-400 text-sm mb-1">Purchase Price</p>
                    <p className="text-2xl font-bold">$300,000</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Monthly Rent</p>
                    <p className="text-2xl font-bold text-green-400">$2,500</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Down Payment</p>
                    <p className="text-lg font-semibold">$60,000 (20%)</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Interest Rate</p>
                    <p className="text-lg font-semibold">7.0%</p>
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
              <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-green-500/30">
                <p className="text-sm text-gray-400 mb-2">Deal Score</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-bold text-green-400">68</p>
                  <p className="text-lg text-green-400 mb-2">Good Deal</p>
                </div>
                <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-blue-500" style={{ width: '68%' }}></div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Monthly Cash Flow</p>
                  <p className="text-3xl font-bold text-green-400">+$178</p>
                  <p className="text-xs text-gray-500 mt-1">After all expenses</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Cap Rate</p>
                    <p className="text-2xl font-bold">5.7%</p>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Cash-on-Cash ROI</p>
                    <p className="text-2xl font-bold">3.1%</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">1% Rule Check</p>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded">
                      Close
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Rent is $2,500 vs. 1% target of $3,000
                  </p>
                </div>
              </div>

              {/* CTA */}
              <a
                href="#waitlist"
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                Get Early Access
                <ArrowRight className="h-5 w-5" />
              </a>
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
                src="https://www.youtube.com/embed/HPFFqKAPGEg"
                title="PropIQ Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Video CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Ready to get early access?</p>
            <a
              href="#waitlist"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold text-lg transition inline-flex items-center gap-2"
            >
              Join Waitlist
              <ArrowRight className="h-5 w-5" />
            </a>
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

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-6">
            <CheckCircle className="h-4 w-4" />
            Launching Soon
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Early Access to PropIQ
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join 500+ investors on the waitlist. Be the first to know when we launch and get exclusive early access benefits.
          </p>

          {/* Email Signup Form */}
          <form
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6"
            action="https://formspree.io/f/xldqywge"
            method="POST"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold transition whitespace-nowrap"
            >
              Join Waitlist
            </button>
          </form>

          <p className="text-gray-500 text-sm">
            🎁 Early access members get 3 months free + priority support
          </p>
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
