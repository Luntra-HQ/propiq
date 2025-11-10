/**
 * PropIQ Integration Example
 *
 * This file demonstrates how to integrate the HeroSection and PDFExportButton
 * components into your existing App.tsx
 */

import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { PDFExportButton, PDFExportCard, PDFExportIconButton } from './PDFExportButton';
import { PropertyAnalysis } from '../utils/pdfExport';

/**
 * Example 1: Hero Section Integration
 *
 * Add this to the top of your App.tsx, before the main dashboard content
 */
export const HeroSectionExample = () => {
  const handleGetStarted = () => {
    // Scroll to calculator or trigger signup modal
    const calculatorSection = document.getElementById('deal-calculator');
    calculatorSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDemo = () => {
    // Open demo video or show demo modal
    window.open('https://www.youtube.com/watch?v=your-demo-video', '_blank');
  };

  return (
    <HeroSection
      onGetStarted={handleGetStarted}
      onViewDemo={handleViewDemo}
    />
  );
};

/**
 * Example 2: PDF Export Button Integration
 *
 * Add this after displaying property analysis results
 */
export const PDFExportExample = () => {
  // Example analysis data (replace with your actual data from PropIQ API)
  const sampleAnalysis: PropertyAnalysis = {
    address: '1234 E Roosevelt St, Phoenix, AZ 85006',
    propertyType: 'multi_family',
    purchasePrice: 385000,
    monthlyRent: 3800,
    summary: 'This duplex in Phoenix\'s Roosevelt district shows strong potential for positive cash flow with moderate appreciation prospects.',
    location: {
      neighborhood: 'Roosevelt District',
      marketScore: 78,
      marketTrend: 'up',
    },
    financials: {
      estimatedValue: 385000,
      estimatedRent: 3800,
      cashFlow: 720,
      capRate: 7.4,
      roi: 7.9,
      monthlyMortgage: 2450,
    },
    investment: {
      recommendation: 'buy',
      confidenceScore: 82,
      riskLevel: 'medium',
    },
    pros: [
      'Strong rental demand from Arizona State students',
      'Property is in an up-and-coming neighborhood',
      'Positive monthly cash flow of $720',
      'Cap rate of 7.4% exceeds market average',
    ],
    cons: [
      'Property is priced 8% above market value',
      'Rising interest rates may impact future appreciation',
      'Deferred maintenance estimated at $15K',
      'HOA fees are higher than comparable properties',
    ],
    keyInsights: [
      'Roosevelt district has seen 12% rent appreciation year-over-year',
      'Comparable properties sold for $350K-$380K in the last 6 months',
      'Strong job growth in Phoenix metro area supports rental demand',
    ],
    nextSteps: [
      'Request seller concessions to offset high asking price',
      'Get pre-approved for financing within 48 hours',
      'Schedule property inspection within 7 days',
      'Review HOA documents and financial statements',
      'Research comparable rental rates in the area',
    ],
    dealCalculator: {
      purchasePrice: 385000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: 30,
      monthlyRent: 3800,
      propertyTax: 320,
      insurance: 150,
      maintenance: 190,
      vacancy: 190,
      propertyManagement: 380,
      dealScore: 68,
      dealRating: 'Good',
      monthlyCashFlow: 720,
      capRate: 7.4,
      cashOnCash: 7.9,
      onePercentRule: true,
      totalCashInvested: 77000,
      monthlyPITI: 2890,
    },
    analyzedAt: new Date().toLocaleDateString(),
  };

  return (
    <div className="space-y-6">
      {/* Option 1: Full button with text */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Standard Button</h3>
        <PDFExportButton
          analysis={sampleAnalysis}
          variant="primary"
          size="md"
        />
      </div>

      {/* Option 2: Full-width button */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Full Width Button</h3>
        <PDFExportButton
          analysis={sampleAnalysis}
          variant="secondary"
          size="lg"
          fullWidth
        />
      </div>

      {/* Option 3: Icon-only button */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Icon Button</h3>
        <PDFExportIconButton
          analysis={sampleAnalysis}
        />
      </div>

      {/* Option 4: Card component */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Export Card</h3>
        <PDFExportCard analysis={sampleAnalysis} />
      </div>
    </div>
  );
};

/**
 * Example 3: Integration in App.tsx
 *
 * Here's how to add both components to your main App.tsx:
 */
export const AppIntegrationExample = () => {
  const [showHero, setShowHero] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<PropertyAnalysis | null>(null);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section - Show on first visit or when not logged in */}
      {showHero && (
        <HeroSection
          onGetStarted={() => {
            setShowHero(false);
            // Trigger signup or scroll to calculator
          }}
          onViewDemo={() => {
            // Show demo video
          }}
        />
      )}

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Your existing dashboard code here */}

        {/* Deal Calculator Section */}
        <div id="deal-calculator">
          {/* Your DealCalculator component */}
        </div>

        {/* After PropIQ analysis completes, show PDF export */}
        {analysisResult && (
          <div className="mt-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>

                {/* Icon button in header */}
                <PDFExportIconButton
                  analysis={analysisResult}
                  tooltipText="Download PDF Report"
                />
              </div>

              {/* Display analysis results */}
              <div className="mb-6">
                {/* Your analysis display code */}
              </div>

              {/* Full export button at bottom */}
              <PDFExportButton
                analysis={analysisResult}
                variant="primary"
                size="lg"
                fullWidth
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Example 4: With Your Existing PropIQ API
 *
 * When you receive analysis data from your backend:
 */
export const PropIQAPIIntegration = () => {
  const [analysisData, setAnalysisData] = useState<PropertyAnalysis | null>(null);

  const runAnalysis = async (address: string) => {
    try {
      // API call using /api/v1 prefix (Sprint 7 migration)
      const response = await fetch('https://luntra-outreach-app.azurewebsites.net/api/v1/propiq/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          purchase_price: 385000,
          monthly_rent: 3800,
        }),
      });

      const result = await response.json();

      // Transform API response to PropertyAnalysis format
      const analysis: PropertyAnalysis = {
        address: result.address || address,
        propertyType: result.property_type,
        purchasePrice: result.purchase_price,
        monthlyRent: result.monthly_rent,
        summary: result.summary,
        location: result.location,
        financials: result.financials,
        investment: result.investment,
        pros: result.pros,
        cons: result.cons,
        keyInsights: result.key_insights,
        nextSteps: result.next_steps,
        analyzedAt: new Date().toLocaleDateString(),
      };

      setAnalysisData(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div>
      {/* Analysis trigger button */}
      <button onClick={() => runAnalysis('1234 Main St, Phoenix, AZ')}>
        Run Analysis
      </button>

      {/* Show PDF export when analysis is ready */}
      {analysisData && (
        <PDFExportCard analysis={analysisData} />
      )}
    </div>
  );
};
