/**
 * FAQ Page - Frequently Asked Questions
 *
 * Comprehensive FAQ page for PropIQ users covering:
 * - Getting Started
 * - Property Analysis
 * - Pricing & Billing
 * - Deal Calculator
 * - Account Management
 * - Technical Support
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Zap,
  Search,
  HelpCircle,
  ChevronRight,
  Home,
  Calculator,
  CreditCard,
  Settings,
  LifeBuoy,
  Sparkles,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // FAQ Data Structure
  const faqData: FAQItem[] = [
    // Getting Started
    {
      category: 'Getting Started',
      question: 'What is PropIQ?',
      answer: 'PropIQ is an AI-powered real estate investment analysis platform that helps you analyze properties in 30 seconds. We provide comprehensive financial analysis, deal scoring, market insights, and investment recommendations using advanced AI technology.',
    },
    {
      category: 'Getting Started',
      question: 'How do I get started with PropIQ?',
      answer: 'Getting started is easy! Click "Get Started Free" to create your account. You\'ll get 3 free property analyses to try out the platform. No credit card required for the trial. After signing up, you can immediately start analyzing properties using our AI-powered analysis tool.',
    },
    {
      category: 'Getting Started',
      question: 'What\'s included in the free trial?',
      answer: 'The free trial includes 3 complete property analyses. Each analysis provides: AI-powered investment recommendations, comprehensive financial metrics, deal scoring (0-100), cash flow projections, ROI calculations, and market insights. This gives you a complete picture of how PropIQ can help with your investment decisions.',
    },
    {
      category: 'Getting Started',
      question: 'Do I need a credit card to start?',
      answer: 'No! You can sign up and use your 3 free trial analyses without entering any payment information. You only need to add a payment method when you\'re ready to upgrade to a paid plan.',
    },

    // Property Analysis
    {
      category: 'Property Analysis',
      question: 'How does the AI property analysis work?',
      answer: 'Our AI analysis uses GPT-4 technology combined with comprehensive real estate investment formulas. You provide property details (address, purchase price, rent, etc.), and our AI analyzes the investment potential, calculates key metrics like cap rate, cash-on-cash return, and provides personalized recommendations based on market conditions and investment strategies.',
    },
    {
      category: 'Property Analysis',
      question: 'What information do I need to analyze a property?',
      answer: 'At minimum, you need the property address and purchase price. For more accurate analysis, provide: monthly rent, down payment percentage, interest rate, property taxes, insurance costs, and expected vacancy rate. The more details you provide, the more accurate and comprehensive your analysis will be.',
    },
    {
      category: 'Property Analysis',
      question: 'How accurate are the AI recommendations?',
      answer: 'Our AI provides highly accurate financial calculations using industry-standard formulas. However, AI recommendations should be used as one tool in your decision-making process. We recommend verifying key assumptions (rent estimates, property taxes, etc.) with local market data and consulting with real estate professionals for final investment decisions.',
    },
    {
      category: 'Property Analysis',
      question: 'Can I save and export my analyses?',
      answer: 'Yes! All your property analyses are automatically saved to your dashboard. You can view your analysis history, compare properties side-by-side, and export reports for your records. Premium plans include PDF export functionality for sharing with partners or advisors.',
    },
    {
      category: 'Property Analysis',
      question: 'What is the Deal Score?',
      answer: 'The Deal Score is a 0-100 rating that evaluates the overall investment potential of a property. It considers multiple factors including: cash flow potential, ROI, cap rate, debt coverage ratio, and alignment with the 1% rule. Scores of 80+ are Excellent, 65-79 are Good, 50-64 are Fair, 35-49 are Poor, and below 35 should be Avoided.',
    },

    // Pricing & Billing
    {
      category: 'Pricing & Billing',
      question: 'What are the pricing tiers?',
      answer: 'We offer 4 tiers: Free (3 trial analyses), Starter ($29/month - 20 analyses), Pro ($79/month - 100 analyses), and Elite ($199/month - unlimited analyses). All paid plans include full access to our AI analysis, deal calculator, support chat, and analysis history. Choose the plan that matches your investment activity level.',
    },
    {
      category: 'Pricing & Billing',
      question: 'What happens when I run out of analyses?',
      answer: 'When you reach your monthly limit, you\'ll see a prompt to upgrade to a higher tier or purchase a top-up package. Top-up packages let you buy additional analyses (10, 25, or 50 runs) that never expire. Alternatively, you can upgrade to a plan with more monthly analyses or wait until your monthly limit resets.',
    },
    {
      category: 'Pricing & Billing',
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes! You can upgrade or downgrade anytime from your account settings. Upgrades take effect immediately, and you\'ll be charged the prorated difference. Downgrades take effect at the end of your current billing period, so you keep your current plan benefits until then.',
    },
    {
      category: 'Pricing & Billing',
      question: 'How does billing work?',
      answer: 'All subscriptions are billed monthly on the day you subscribe. We use Stripe for secure payment processing. You\'ll receive an email receipt for each payment. Your monthly analysis limit resets on your billing date each month. You can view your billing history and update payment methods in your account settings.',
    },
    {
      category: 'Pricing & Billing',
      question: 'Is there a discount for annual billing?',
      answer: 'We currently offer monthly billing. Annual billing with discounts is coming soon! Sign up for our newsletter to be notified when annual plans become available.',
    },
    {
      category: 'Pricing & Billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover) and debit cards through our secure payment processor, Stripe. We do not store your payment information on our servers.',
    },

    // Deal Calculator
    {
      category: 'Deal Calculator',
      question: 'What is the Deal Calculator?',
      answer: 'The Deal Calculator is a comprehensive financial calculator with three tabs: Basic (core metrics like monthly cash flow, cap rate, ROI), Advanced (detailed projections, debt service coverage, operating expenses), and Scenarios (compare best-case, worst-case, and most-likely outcomes). It\'s available to all users for free and works great alongside our AI analysis.',
    },
    {
      category: 'Deal Calculator',
      question: 'How is it different from the AI analysis?',
      answer: 'The Deal Calculator is a manual calculation tool where you input numbers and get instant results. The AI analysis goes deeper - it provides context, market insights, recommendations, and evaluates factors beyond just the numbers (neighborhood trends, comparable properties, investment strategies). Use the calculator for quick math, and the AI for comprehensive investment guidance.',
    },
    {
      category: 'Deal Calculator',
      question: 'What metrics does the calculator show?',
      answer: 'The calculator shows: monthly cash flow, cap rate, cash-on-cash return, gross rent multiplier (GRM), debt service coverage ratio (DSCR), 1% rule compliance, total cash needed, 5-year projections (equity, cash flow, appreciation), and an overall deal score. All calculations use industry-standard real estate formulas.',
    },
    {
      category: 'Deal Calculator',
      question: 'Can I use the calculator without an account?',
      answer: 'Yes! The Deal Calculator is completely free and available to everyone, no account required. However, creating an account lets you save your calculations, access analysis history, and unlock AI-powered analysis features.',
    },

    // Account Management
    {
      category: 'Account Management',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password?" on the login page, enter your email, and we\'ll send you a password reset link. The link is valid for 1 hour. If you don\'t receive the email, check your spam folder or contact support.',
    },
    {
      category: 'Account Management',
      question: 'Can I change my email address?',
      answer: 'Yes! Go to Account Settings and update your email address. You\'ll receive a verification email to confirm the change. For security, you\'ll need to re-authenticate after changing your email.',
    },
    {
      category: 'Account Management',
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel anytime from your Account Settings. Your subscription will remain active until the end of your current billing period, then you\'ll revert to the free tier. All your saved analyses will be preserved, but you won\'t be able to run new analyses without upgrading again.',
    },
    {
      category: 'Account Management',
      question: 'Can I export my data?',
      answer: 'Yes! You can export your analysis history as PDF reports from your dashboard. Premium plans also include CSV export for importing into spreadsheets. We believe your data belongs to you and should be portable.',
    },
    {
      category: 'Account Management',
      question: 'How do I delete my account?',
      answer: 'To permanently delete your account and all associated data, contact support at support@luntra.one. For your security, we require email verification for account deletion. All data is permanently deleted within 30 days per our privacy policy.',
    },

    // Technical Support
    {
      category: 'Technical Support',
      question: 'What browsers are supported?',
      answer: 'PropIQ works best on modern browsers: Chrome (recommended), Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience. Internet Explorer is not supported.',
    },
    {
      category: 'Technical Support',
      question: 'Is PropIQ mobile-friendly?',
      answer: 'Yes! PropIQ is fully responsive and works great on mobile devices and tablets. The interface automatically adapts to your screen size. For the best experience on mobile, we recommend using Chrome or Safari.',
    },
    {
      category: 'Technical Support',
      question: 'I\'m experiencing slow loading times. What should I do?',
      answer: 'Slow loading can be caused by: poor internet connection, browser cache issues, or server load. Try: refreshing the page, clearing your browser cache, disabling browser extensions, or trying a different browser. If issues persist, contact support with details about your browser and connection speed.',
    },
    {
      category: 'Technical Support',
      question: 'How do I contact support?',
      answer: 'You can reach us several ways: (1) Use the in-app Support Chat widget (logged-in users only), (2) Email support@luntra.one, or (3) Use the Help Center for common questions. We typically respond within 24 hours on business days.',
    },
    {
      category: 'Technical Support',
      question: 'Is my data secure?',
      answer: 'Absolutely! We use industry-standard security practices: all data is encrypted in transit (HTTPS/TLS), passwords are hashed with bcrypt, we never store payment information (handled by Stripe), and our database is hosted on secure MongoDB Atlas servers. We take your privacy and security seriously.',
    },
    {
      category: 'Technical Support',
      question: 'Do you have an API?',
      answer: 'We currently don\'t offer a public API, but it\'s on our roadmap! If you\'re interested in API access for integrating PropIQ into your own tools or workflows, email us at api@luntra.one to join the waitlist.',
    },
  ];

  // Category configuration with static Tailwind classes
  const categories = [
    {
      id: 'Getting Started',
      label: 'Getting Started',
      icon: Sparkles,
      activeClass: 'bg-violet-600 text-white shadow-lg shadow-violet-500/30',
      iconBgClass: 'bg-violet-500/10 border-violet-500/20',
      iconClass: 'text-violet-400',
    },
    {
      id: 'Property Analysis',
      label: 'Property Analysis',
      icon: Home,
      activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-500/30',
      iconBgClass: 'bg-blue-500/10 border-blue-500/20',
      iconClass: 'text-blue-400',
    },
    {
      id: 'Pricing & Billing',
      label: 'Pricing & Billing',
      icon: CreditCard,
      activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30',
      iconBgClass: 'bg-emerald-500/10 border-emerald-500/20',
      iconClass: 'text-emerald-400',
    },
    {
      id: 'Deal Calculator',
      label: 'Deal Calculator',
      icon: Calculator,
      activeClass: 'bg-amber-600 text-white shadow-lg shadow-amber-500/30',
      iconBgClass: 'bg-amber-500/10 border-amber-500/20',
      iconClass: 'text-amber-400',
    },
    {
      id: 'Account Management',
      label: 'Account Management',
      icon: Settings,
      activeClass: 'bg-purple-600 text-white shadow-lg shadow-purple-500/30',
      iconBgClass: 'bg-purple-500/10 border-purple-500/20',
      iconClass: 'text-purple-400',
    },
    {
      id: 'Technical Support',
      label: 'Technical Support',
      icon: LifeBuoy,
      activeClass: 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30',
      iconBgClass: 'bg-cyan-500/10 border-cyan-500/20',
      iconClass: 'text-cyan-400',
    },
  ];

  // Filter FAQ items based on search query and selected category
  const filteredFAQs = faqData.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category
  const groupedFAQs = categories.map((category) => ({
    ...category,
    items: filteredFAQs.filter((item) => item.category === category.id),
  }));

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
      <nav className="border-b border-slate-800 sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">PropIQ</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-300 hover:text-white transition">
                Home
              </Link>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition">
                Pricing
              </Link>
              <Link to="/faq" className="text-gray-300 hover:text-white transition font-medium border-b-2 border-violet-500">
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
                  <Link to="/login" className="text-gray-300 hover:text-white transition hidden sm:block">
                    Log In
                  </Link>
                  <button
                    onClick={handleGetStarted}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="py-12 px-4 sm:py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm mb-6">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Everything you need to know about PropIQ. Can't find what you're looking for?{' '}
            <a href="mailto:support@luntra.one" className="text-violet-400 hover:text-violet-300 underline">
              Contact support
            </a>
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? category.activeClass
                      : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            // No results state
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No questions found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search or browse all categories
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            // FAQ Accordion by Category
            groupedFAQs.map((category) => {
              if (category.items.length === 0) return null;

              const Icon = category.icon;

              return (
                <div key={category.id} className="mb-8">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${category.iconBgClass} border flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${category.iconClass}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-100">
                      {category.label}
                    </h2>
                    <span className="text-sm text-gray-400">
                      ({category.items.length} {category.items.length === 1 ? 'question' : 'questions'})
                    </span>
                  </div>

                  {/* Accordion */}
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, index) => (
                        <AccordionItem
                          key={index}
                          value={`${category.id}-${index}`}
                          className="border-slate-700/50"
                        >
                          <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-slate-700/30 transition-colors">
                            <span className="text-base font-semibold text-gray-100 pr-4">
                              {item.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <p className="text-gray-300 leading-relaxed">
                              {item.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 border border-violet-500/20 rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Our team is here to help! Get in touch and we'll respond as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@luntra.one"
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
              >
                <LifeBuoy className="h-5 w-5" />
                Contact Support
              </a>
              {!isAuthenticated && (
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 bg-slate-800/50 border-t border-slate-700/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4">
          <p className="mb-2">
            PropIQ is a product by{' '}
            <a
              href="https://luntra.one"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 font-semibold"
            >
              LUNTRA
            </a>
          </p>
          <p className="mb-4 text-xs">
            <Link to="/" className="hover:text-gray-300">Home</Link>
            {' '} | {' '}
            <Link to="/pricing" className="hover:text-gray-300">Pricing</Link>
            {' '} | {' '}
            <Link to="/faq" className="hover:text-gray-300">FAQ</Link>
            {' '} | {' '}
            <a href="https://luntra.one/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
              Terms
            </a>
            {' '} | {' '}
            <a href="https://luntra.one/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
              Privacy
            </a>
          </p>
          <p>&copy; {new Date().getFullYear()} LUNTRA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FAQPage;
