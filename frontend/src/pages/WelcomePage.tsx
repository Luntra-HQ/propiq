import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Search, BarChart3, CheckCircle2, ArrowRight, Chrome } from 'lucide-react';

/**
 * WelcomePage - First-time onboarding for Chrome extension users
 *
 * Shows when extension is first installed, explains PropIQ's value prop,
 * and guides users through the first analysis.
 *
 * URL: /welcome?source=extension
 */
export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');

  useEffect(() => {
    // Track that user saw the welcome page
    if (source === 'extension') {
      console.log('WelcomePage: User arrived from Chrome extension installation');
      // Could send analytics event here
    }
  }, [source]);

  const handleTryDemo = () => {
    // Navigate to app with demo mode enabled
    navigate('/app?demo=true');
  };

  const handleCreateAccount = () => {
    navigate('/signup?source=welcome');
  };

  const handleSignIn = () => {
    navigate('/login?source=welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-violet-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              PropIQ
            </span>
          </div>
          <button
            onClick={handleSignIn}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Already have an account? <span className="text-violet-400 font-semibold">Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {source === 'extension' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full mb-6">
              <Chrome className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">Extension installed successfully!</span>
            </div>
          )}

          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Analyze Real Estate Deals
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              In Seconds, Not Hours
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            PropIQ uses AI to analyze any property on Zillow instantly. Get cash flow projections,
            ROI calculations, and investment recommendations without spreadsheets or guesswork.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleTryDemo}
              className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-violet-500/50 transition-all duration-200 flex items-center gap-2"
            >
              <Zap className="h-5 w-5" />
              Try Demo (No Signup Required)
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleCreateAccount}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-violet-500/30 hover:border-violet-500/50 transition-all duration-200"
            >
              Create Free Account (3 Free Analyses)
            </button>
          </div>

          <p className="text-sm text-gray-400">
            No credit card required • 3 trial analyses • Instant results
          </p>
        </div>

        {/* How It Works - 3 Steps */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-8 hover:border-violet-500/40 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Chrome className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-violet-400">1</span>
                <h3 className="text-xl font-bold">Install Extension</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Add PropIQ to Chrome. The extension icon appears in your browser toolbar.
              </p>
              {source === 'extension' && (
                <div className="mt-4 flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-semibold">Already installed!</span>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-8 hover:border-violet-500/40 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-violet-400">2</span>
                <h3 className="text-xl font-bold">Visit Zillow</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Browse properties on Zillow.com as you normally would. Find any property you want to analyze.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-8 hover:border-violet-500/40 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-violet-400">3</span>
                <h3 className="text-xl font-bold">Click Analyze</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Click the "Analyze with PropIQ" button. Get instant AI-powered investment analysis in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* What You Get */}
        <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/20 rounded-2xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            What You Get With Every Analysis
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: BarChart3, text: 'Monthly cash flow projections' },
              { icon: CheckCircle2, text: 'ROI and cap rate calculations' },
              { icon: CheckCircle2, text: 'Deal score (0-100 rating)' },
              { icon: CheckCircle2, text: 'Investment recommendations' },
              { icon: CheckCircle2, text: '5-year financial projections' },
              { icon: CheckCircle2, text: 'Best/worst case scenarios' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <item.icon className="h-6 w-6 text-violet-400 flex-shrink-0" />
                <span className="text-gray-200 text-lg">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Analyze Your First Property?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleTryDemo}
              className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-violet-500/50 transition-all duration-200 flex items-center gap-2"
            >
              <Zap className="h-5 w-5" />
              Try Demo Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleCreateAccount}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-violet-500/30 hover:border-violet-500/50 transition-all duration-200"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-800/30 bg-slate-900/50 backdrop-blur-sm py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>© 2025 PropIQ by LUNTRA. All rights reserved.</p>
          <p className="mt-2">AI-powered real estate investment analysis for smarter decisions.</p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
