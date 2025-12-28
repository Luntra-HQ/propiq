import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, Mail, TrendingUp, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useAction } from 'convex/react';
import { api } from '../convex/_generated/api';

const LeadMagnetLanding: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  const captureLead = useMutation(api.leads.captureLead);
  const sendLeadMagnetEmail = useAction(api.emails.sendLeadMagnetEmail);

  // Extract UTM parameters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((param) => {
      const value = params.get(param);
      if (value) utm[param] = value;
    });

    setUtmParams(utm);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Capture lead in database
      await captureLead({
        email,
        firstName: firstName || undefined,
        leadMagnet: 'due-diligence-checklist',
        source: 'landing-page',
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term,
      });

      // Step 2: Send lead magnet email immediately
      await sendLeadMagnetEmail({
        email,
        firstName: firstName || undefined,
        leadMagnet: 'due-diligence-checklist',
      });

      setIsSubmitted(true);
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Lead capture error:', err);
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-16">
          {/* Success State */}
          <div className="bg-emerald-900/30 border-2 border-emerald-500 rounded-xl p-8 mb-8 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-3">
              Check Your Email!
            </h1>
            <p className="text-lg text-emerald-100 mb-4">
              Your Due Diligence Checklist is on the way to <strong>{email}</strong>
            </p>
            <p className="text-sm text-emerald-200">
              (Check your spam folder if you don't see it in a few minutes)
            </p>
          </div>

          {/* While You Wait - Soft CTA */}
          <div className="bg-gradient-to-br from-violet-900/50 to-blue-900/50 border border-violet-500/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              While You Wait, See How PropIQ Automates This Entire Process
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-violet-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Analyze Any Property in 60 Seconds</h3>
                  <p className="text-sm text-gray-300">
                    No more manual spreadsheets. AI-powered analysis gives you instant insights.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Deal Score (0-100) + Cash Flow Projection</h3>
                  <p className="text-sm text-gray-300">
                    See if a deal works before making an offer. Conservative assumptions built-in.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Automatic Red Flag Detection</h3>
                  <p className="text-sm text-gray-300">
                    AI identifies hidden costs, market risks, and deal-breakers you might miss.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/signup')}
              className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Try PropIQ Free (3 Analyses) →
            </button>

            <p className="text-center text-sm text-gray-400 mt-4">
              No credit card required · Analyze 3 properties for free
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-emerald-900/30 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Download className="inline-block h-4 w-4 mr-2" />
            FREE DOWNLOAD
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            The 10-Point Rental Property<br />Due Diligence Checklist
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-6">
            The same checklist used by investors who've analyzed <strong>1,000+ properties</strong>
          </p>

          {/* Preview Image Placeholder */}
          <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-8 mb-8 max-w-2xl mx-auto">
            <img
              src="/checklist-preview.png"
              alt="Due Diligence Checklist Preview"
              className="w-full rounded-lg shadow-2xl"
              onError={(e) => {
                // Fallback if image doesn't exist
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Fallback content if image doesn't load */}
            <div className="text-gray-400 text-sm">
              <CheckCircle className="h-12 w-12 text-violet-400 mx-auto mb-3" />
              <p>10 Critical Verification Points</p>
            </div>
          </div>
        </div>

        {/* Pain Point Section */}
        <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Most Investors Skip Due Diligence and Regret It
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">68%</div>
              <p className="text-gray-300 text-sm">
                of failed real estate investments had <strong>red flags that were missed</strong>
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">$30K+</div>
              <p className="text-gray-300 text-sm">
                average loss from <strong>deferred maintenance</strong> not caught during inspection
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">3-6mo</div>
              <p className="text-gray-300 text-sm">
                until investors realize they <strong>overpaid or underestimated expenses</strong>
              </p>
            </div>
          </div>

          <p className="text-lg text-gray-200 text-center">
            <strong>This checklist catches what spreadsheets miss.</strong>
          </p>
        </div>

        {/* What You'll Get */}
        <div className="bg-slate-800 rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            What You'll Get
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">10 Critical Verification Points</h3>
                <p className="text-sm text-gray-300">
                  From rental income to CapEx reserves - everything you need to verify before closing
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Red Flags to Watch For</h3>
                <p className="text-sm text-gray-300">
                  Specific warning signs at each step that indicate a bad deal
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Questions to Ask Sellers</h3>
                <p className="text-sm text-gray-300">
                  Exact questions that reveal if a seller is hiding problems
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Bonus: Cash Flow Sanity Check Formula</h3>
                <p className="text-sm text-gray-300">
                  Quick formula to instantly know if a deal is worth pursuing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Capture Form */}
        <div className="bg-gradient-to-br from-violet-900/50 to-blue-900/50 border-2 border-violet-500 rounded-xl p-8 md:p-12 mb-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <Mail className="h-12 w-12 text-violet-300 mx-auto mb-3" />
              <h2 className="text-3xl font-bold text-white mb-2">
                Get Your Free Checklist
              </h2>
              <p className="text-gray-300">
                Enter your email and we'll send it to you instantly
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name (Optional)
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none disabled:shadow-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Me The Checklist →'
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                <Shield className="inline-block h-3 w-3 mr-1" />
                No spam. Unsubscribe anytime. We respect your privacy.
              </p>
            </form>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center mb-12">
          <p className="text-lg text-gray-300 mb-4">
            <strong className="text-violet-300">Join 500+ investors</strong> who've downloaded this checklist
          </p>

          {/* Testimonial placeholder */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-300 italic mb-2">
              "This checklist saved me from a terrible deal. I caught $25K in deferred maintenance the inspector missed."
            </p>
            <p className="text-sm text-gray-400">
              — Sarah M., Real Estate Investor
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Created by PropIQ · AI-Powered Real Estate Analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadMagnetLanding;
