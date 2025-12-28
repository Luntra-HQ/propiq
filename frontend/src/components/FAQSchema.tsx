/**
 * FAQ Schema Component
 *
 * Renders FAQPage structured data for calculator guide blog posts.
 * This helps win featured snippets in Google search results.
 *
 * Usage:
 * <FAQSchema questions={faqData} />
 */

import React from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  questions: FAQItem[];
}

export const FAQSchema: React.FC<FAQSchemaProps> = ({ questions }) => {
  if (!questions || questions.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

/**
 * Predefined FAQ data for calculator guide posts
 */

export const CAP_RATE_FAQ: FAQItem[] = [
  {
    question: 'What is a good cap rate for rental property?',
    answer:
      'A good cap rate typically ranges from 4-10% depending on location and property type. Class A properties in prime locations may have 4-6% cap rates, while Class C properties in secondary markets might have 8-12% cap rates. Higher cap rates indicate higher returns but also higher risk.',
  },
  {
    question: 'How do you calculate cap rate?',
    answer:
      'Cap rate = (Net Operating Income / Property Value) × 100. For example, a property with $12,000 annual NOI and $200,000 value has a 6% cap rate. NOI includes all income minus operating expenses, but does NOT include mortgage payments.',
  },
  {
    question: 'What expenses are included in cap rate calculation?',
    answer:
      'Cap rate includes property taxes, insurance, maintenance, property management, utilities (if landlord-paid), HOA fees, and vacancy reserves. It does NOT include mortgage payments, income taxes, or capital expenditures.',
  },
  {
    question: 'Is a higher or lower cap rate better?',
    answer:
      'Higher cap rates mean higher returns but usually indicate higher risk (e.g., C-class neighborhoods, older properties). Lower cap rates mean lower immediate returns but often indicate safer, more appreciating markets. The "better" cap rate depends on your investment strategy.',
  },
];

export const CASH_FLOW_FAQ: FAQItem[] = [
  {
    question: 'What is positive cash flow in rental property?',
    answer:
      'Positive cash flow means your monthly rental income exceeds all monthly expenses, including mortgage, taxes, insurance, maintenance, and reserves. For example, if you collect $2,000 rent and have $1,700 in total expenses, your cash flow is +$300/month.',
  },
  {
    question: 'How much cash flow should a rental property have?',
    answer:
      'Target at least $200-500/month positive cash flow per property. This provides a buffer for unexpected repairs and vacancies. Many investors use the "1% rule" as a screening tool, but actual cash flow calculations are more reliable.',
  },
  {
    question: 'What expenses should I include in cash flow analysis?',
    answer:
      'Include: mortgage payment, property taxes, insurance, property management (10% of rent), maintenance (1% of property value annually), CapEx reserves (5-10% of rent), vacancy reserves (5-10% of rent), and HOA fees if applicable.',
  },
  {
    question: 'Can you have negative cash flow and still profit?',
    answer:
      'Yes, if appreciation and mortgage paydown exceed negative cash flow. This is common in high-growth markets. However, negative cash flow is risky because you must cover losses out-of-pocket. Most investors prefer positive cash flow.',
  },
];

export const ROI_FAQ: FAQItem[] = [
  {
    question: 'What is a good ROI for rental property?',
    answer:
      'Target 8-12% cash-on-cash return (annual cash flow divided by cash invested). Total ROI (cash flow + appreciation + mortgage paydown) should be 12-18%. Anything above 15% total ROI is considered excellent.',
  },
  {
    question: 'How do you calculate ROI on rental property?',
    answer:
      'ROI = (Annual Cash Flow + Appreciation + Mortgage Paydown) / Total Cash Invested × 100. For example: $4,000 cash flow + $6,000 appreciation + $3,000 paydown = $13,000 return on $80,000 invested = 16.25% ROI.',
  },
  {
    question: 'What is cash-on-cash return vs total ROI?',
    answer:
      'Cash-on-cash return only measures cash flow vs cash invested (e.g., $4,000 annual cash flow / $80,000 invested = 5%). Total ROI includes appreciation and mortgage paydown, giving a complete picture of returns.',
  },
];

export const ONE_PERCENT_RULE_FAQ: FAQItem[] = [
  {
    question: 'What is the 1% rule in real estate?',
    answer:
      'The 1% rule states that monthly rent should equal at least 1% of the purchase price. For example, a $200,000 property should rent for $2,000/month. This is a quick screening tool, but it fails in most markets in 2025.',
  },
  {
    question: 'Does the 1% rule still work in 2025?',
    answer:
      'No, only 5% of properties pass the 1% rule in 2025 (down from 47% in 2010). Property prices have tripled while rents only doubled. Most investors now use the 0.7% rule or focus on actual cash flow calculations instead.',
  },
  {
    question: 'What should I use instead of the 1% rule?',
    answer:
      'Use actual cash flow analysis with all expenses included. Calculate cap rate, cash-on-cash return, and DSCR (Debt Service Coverage Ratio). The 0.7% rule is a better quick filter, but detailed financial analysis is essential.',
  },
];
