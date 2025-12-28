import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Zap, TrendingUp } from 'lucide-react';

/**
 * BlogCTA Component
 * Inline CTAs for blog posts that drive conversion
 *
 * Variants:
 * - try-free: Default CTA to try PropIQ free
 * - calculator: Specific to calculator-related content
 * - upgrade: For existing users to upgrade
 */

type CTAVariant = 'try-free' | 'calculator' | 'upgrade';

interface BlogCTAProps {
  variant?: CTAVariant;
  slug?: string; // Blog post slug for UTM tracking
}

const CTAContent = {
  'try-free': {
    icon: Zap,
    title: 'Skip the math — PropIQ calculates this instantly',
    description: 'Analyze any property in 30 seconds with AI-powered insights. Get cap rate, cash flow, ROI, and 50+ metrics automatically.',
    buttonText: 'Try PropIQ Free',
    buttonIcon: ArrowRight,
  },
  calculator: {
    icon: Calculator,
    title: 'See how this works on a real property',
    description: 'Put these concepts into practice. Analyze your next deal with PropIQ's comprehensive calculator and AI recommendations.',
    buttonText: 'Analyze Now',
    buttonIcon: ArrowRight,
  },
  upgrade: {
    icon: TrendingUp,
    title: 'Get unlimited analyses with PropIQ Pro',
    description: 'Upgrade to Pro for unlimited property analyses, advanced metrics, and priority support. Plans start at $29/month.',
    buttonText: 'View Pricing',
    buttonIcon: ArrowRight,
  },
};

export const BlogCTA: React.FC<BlogCTAProps> = ({ variant = 'try-free', slug }) => {
  const content = CTAContent[variant];
  const Icon = content.icon;
  const ButtonIcon = content.buttonIcon;

  // UTM parameters for tracking
  const utmParams = new URLSearchParams({
    utm_source: 'blog',
    utm_medium: 'content',
    utm_campaign: slug || 'blog-cta',
  });

  const linkTo = variant === 'upgrade' ? `/pricing?${utmParams}` : `/?${utmParams}`;

  return (
    <div className="my-8 bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-sm border border-violet-500/30 rounded-xl p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{content.title}</h3>
          <p className="text-gray-300 mb-4">{content.description}</p>
          <Link
            to={linkTo}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-violet-500/50 group"
          >
            <span>{content.buttonText}</span>
            <ButtonIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCTA;
