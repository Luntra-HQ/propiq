import React from 'react';
import { TrendingUp, Calculator, Brain, Zap, ArrowRight, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onViewDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onViewDemo }) => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-violet-900/20 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Hero content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-violet-300" />
              <span className="text-sm font-medium text-violet-300">AI-Powered Investment Analysis</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Analyze Real Estate Deals in{' '}
              <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Under 60 Seconds
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              Stop juggling spreadsheets and calculators. PropIQ by LUNTRA combines financial modeling with AI-powered
              market research to help you make confident investment decisions — fast.
            </p>

            {/* Value props */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center space-x-3 text-gray-200">
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span>Instant cap rate, cash flow, and ROI calculations</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-200">
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span>AI-generated neighborhood insights and risk scoring</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-200">
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span>5-year projections with multiple scenarios</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-violet-500/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/60 focus:outline-none focus:ring-4 focus:ring-violet-300"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onViewDemo}
                className="inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl border border-slate-600 transition-all duration-200 hover:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-slate-700"
              >
                <span>View Demo</span>
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-8 pt-8 border-t border-slate-700/50">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 border-2 border-slate-900"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-slate-900"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-slate-900"></div>
                  </div>
                  <span className="font-medium text-gray-300">50+ investors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span>4.9/5 rating</span>
                </div>
                <div>
                  <span className="font-semibold text-violet-300">$2.5M+</span> in deals analyzed
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Feature cards */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main feature card */}
              <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/50">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Deal Calculator</h3>
                    <p className="text-sm text-gray-300">Unlimited analyses</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Monthly Cash Flow</span>
                      <span className="text-lg font-bold text-emerald-400">+$720</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-3/4"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                      <div className="text-xs text-gray-300 mb-1">Cap Rate</div>
                      <div className="text-sm font-bold text-white">7.4%</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                      <div className="text-xs text-gray-300 mb-1">Deal Score</div>
                      <div className="text-sm font-bold text-violet-300">68/100</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                      <div className="text-xs text-gray-300 mb-1">Risk</div>
                      <div className="text-sm font-bold text-yellow-400">Medium</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis badge - floating */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl p-4 shadow-xl shadow-violet-500/30 border border-violet-500/50">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-white" />
                  <div>
                    <div className="text-xs text-violet-200">AI Analysis</div>
                    <div className="text-sm font-bold text-white">GPT-4 Powered</div>
                  </div>
                </div>
              </div>

              {/* Market trend badge - floating */}
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 shadow-xl shadow-emerald-500/30 border border-emerald-500/50">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-white" />
                  <div>
                    <div className="text-xs text-emerald-200">Market Score</div>
                    <div className="text-sm font-bold text-white">78/100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-12 border-t border-slate-800">
          <p className="text-center text-sm text-gray-400 mb-6">TRUSTED BY INVESTORS AT</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <div className="text-gray-600 font-semibold text-lg">BiggerPockets</div>
            <div className="text-gray-600 font-semibold text-lg">Roofstock</div>
            <div className="text-gray-600 font-semibold text-lg">Fundrise</div>
            <div className="text-gray-600 font-semibold text-lg">RealtyMogul</div>
          </div>
        </div>
      </div>
    </section>
  );
};
