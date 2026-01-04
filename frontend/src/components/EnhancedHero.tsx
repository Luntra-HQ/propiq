/**
 * Enhanced Hero Section for Product Hunt Launch
 *
 * Optimized for conversion with clear value prop, social proof,
 * and compelling CTAs. Mobile-first, accessibility-focused.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, PlayCircle, Star, Users, BarChart, CheckCircle } from 'lucide-react';

interface EnhancedHeroProps {
  /** Show Product Hunt specific messaging */
  isProductHuntLaunch?: boolean;
  /** Override default CTA text */
  ctaText?: string;
  /** Override default CTA link */
  ctaLink?: string;
}

export const EnhancedHero: React.FC<EnhancedHeroProps> = ({
  isProductHuntLaunch = false,
  ctaText = 'Start Free Trial',
  ctaLink = '#waitlist',
}) => {
  const handleWatchDemo = () => {
    // Track demo view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'watch_demo', {
        event_category: 'Engagement',
        event_label: 'Hero Demo Click',
      });
    }

    // Scroll to demo section or open modal
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-slate-900 to-slate-900 -z-10" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Product Hunt Launch Badge */}
          {isProductHuntLaunch && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm mb-6 animate-fadeIn">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              🚀 Live on Product Hunt Today! Support us with an upvote
            </div>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm mb-6 animate-slideInDown">
            <Zap className="h-4 w-4" />
            AI-Powered Real Estate Investment Analysis
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight animate-slideInUp">
            Analyze Any Property in{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
                30 Seconds
              </span>
              <svg
                className="absolute -bottom-2 left-0 right-0 h-3"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C50 5 150 2 298 10"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-slideInUp delay-100">
            Get instant <strong className="text-white">cap rate</strong>,{' '}
            <strong className="text-white">cash flow</strong>, and{' '}
            <strong className="text-white">ROI calculations</strong> powered by AI.
            Make smarter investment decisions with PropIQ.
          </p>

          {/* Key Benefits (Quick Scan) */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-slideInUp delay-200">
            {[
              { icon: Zap, text: '30-Second Analysis' },
              { icon: BarChart, text: '5-Year Projections' },
              { icon: CheckCircle, text: 'Unlimited Properties' },
            ].map((benefit, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-gray-300"
              >
                <benefit.icon className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-slideInUp delay-300">
            <a
              href={ctaLink}
              className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl font-bold text-lg text-white shadow-lg shadow-violet-500/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {ctaText}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={handleWatchDemo}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl font-semibold text-lg text-white transition flex items-center justify-center gap-2"
            >
              <PlayCircle className="h-5 w-5" />
              Watch Demo
            </button>
          </div>

          {/* Trust Signals */}
          <p className="text-gray-400 text-sm mb-10 animate-fadeIn delay-400">
            ✨ <strong>Free trial with 3 analyses</strong> • No credit card required • Cancel anytime
          </p>

          {/* Social Proof */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 px-6 py-4 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl animate-fadeIn delay-500">
            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span className="text-white font-semibold">4.9/5</span>
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-700" />

            {/* Users */}
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="h-5 w-5 text-violet-400" />
              <span>Trusted by <strong className="text-white">2,500+</strong> investors</span>
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-700" />

            {/* Properties Analyzed */}
            <div className="flex items-center gap-2 text-gray-300">
              <BarChart className="h-5 w-5 text-violet-400" />
              <span><strong className="text-white">50,000+</strong> properties analyzed</span>
            </div>
          </div>
        </div>

        {/* Hero Image / Screenshot Preview (Optional) */}
        <div className="mt-16 max-w-5xl mx-auto animate-fadeIn delay-600">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/20 border border-slate-700">
            {/* Placeholder for screenshot - replace with actual image */}
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <BarChart className="h-24 w-24 text-violet-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500 text-lg">
                  Product screenshot will go here
                </p>
                <p className="text-gray-600 text-sm">
                  (Replace with propiq-screenshot-hero.png)
                </p>
              </div>
            </div>

            {/* Optional: Floating UI elements for visual interest */}
            <div className="absolute top-4 right-4 px-4 py-2 bg-green-500/90 backdrop-blur-sm rounded-lg text-white font-semibold text-sm shadow-lg">
              ✓ Deal Score: 82/100
            </div>
            <div className="absolute bottom-4 left-4 px-4 py-2 bg-violet-500/90 backdrop-blur-sm rounded-lg text-white font-semibold text-sm shadow-lg">
              ⚡ Analysis in 30 seconds
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-600 {
          animation-delay: 0.6s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default EnhancedHero;
