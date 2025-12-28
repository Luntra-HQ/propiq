import React from 'react';

interface ChecklistItem {
  title: string;
  description: string;
  redFlag: string;
}

const checklistItems: ChecklistItem[] = [
  {
    title: "1. Verify Actual Rental Income",
    description: "Request actual rent rolls and signed leases, not pro forma projections from the seller. Compare current rents to market rates using Zillow, Rentometer, and local property managers. Look at 12-month payment history to verify consistency.",
    redFlag: "🚩 Red Flag: Seller provides 'potential rent' instead of actual collected rent, or refuses to share rent roll documentation."
  },
  {
    title: "2. Calculate True Operating Expenses",
    description: "Don't trust the seller's expense estimates. Request 2-3 years of actual operating statements, tax returns (if possible), and utility bills. Common underestimated expenses: property management, maintenance, insurance, and vacancy reserves.",
    redFlag: "🚩 Red Flag: Seller claims expenses are 'only 20% of rent' when industry average is 35-45% for residential properties."
  },
  {
    title: "3. Inspect for Deferred Maintenance",
    description: "Check the age and condition of major systems: roof (20-25 year lifespan), HVAC (15-20 years), water heater (10-15 years), appliances (10-12 years). Budget for replacements even if items are currently functioning.",
    redFlag: "🚩 Red Flag: Property has original 20+ year old roof or HVAC, but seller claims 'everything works fine' with no repair budget."
  },
  {
    title: "4. Research Comparable Sales AND Rents",
    description: "Pull 5-10 comparable sales from the last 6 months in the same neighborhood. Also check 3-5 comparable rental listings to verify rent estimates. Use Zillow, Redfin, and MLS data. Don't rely on seller's comps.",
    redFlag: "🚩 Red Flag: Seller's comparable properties are from different neighborhoods, older sales (12+ months ago), or significantly different property types."
  },
  {
    title: "5. Check Property Tax History and Reassessment Risk",
    description: "Review 3-5 years of property tax bills from the county assessor. Many properties have artificially low taxes due to old assessments. When you buy, the county often reassesses at purchase price, increasing your tax bill by 20-50%.",
    redFlag: "🚩 Red Flag: Property was last sold 15+ years ago and hasn't been reassessed. Your taxes will likely jump significantly after purchase."
  },
  {
    title: "6. Verify Zoning and Rental Restrictions",
    description: "Check with the city planning department for zoning compliance, rental permits, and occupancy restrictions. Some areas have new rental caps, short-term rental bans, or require special licenses. Don't assume current use is legal.",
    redFlag: "🚩 Red Flag: Property is in a neighborhood that recently banned or restricted rentals, or seller can't provide valid rental permits."
  },
  {
    title: "7. Review Tenant Leases and Payment History",
    description: "Request copies of all current leases and 12-month payment history. Check for below-market rents (tenant may resist increase), month-to-month tenants (high turnover risk), or tenants with payment issues. Know what you're inheriting.",
    redFlag: "🚩 Red Flag: Tenants are on month-to-month leases at below-market rents, or payment history shows frequent late payments or NSF fees."
  },
  {
    title: "8. Calculate CapEx Reserves (1-2% of Property Value Annually)",
    description: "Budget 1-2% of the property value each year for capital expenditures (roof, HVAC, appliances, major repairs). On a $300K property, that's $3,000-$6,000 per year. Set aside monthly into a dedicated CapEx reserve account.",
    redFlag: "🚩 Red Flag: Seller's cash flow projections don't include any CapEx reserves, only 'maintenance' at 0.5% of rent."
  },
  {
    title: "9. Run Cash Flow Analysis at Realistic Vacancy Rates (8-10%)",
    description: "Use conservative assumptions for vacancy: 8-10% of annual rent (not the 5% most sellers use). Account for turnover costs: cleaning, minor repairs, lost rent during showings. Even 'stable' tenants eventually move.",
    redFlag: "🚩 Red Flag: Deal only works with 0-3% vacancy assumptions, or seller claims 'tenant has lived here 10 years and will never leave.'"
  },
  {
    title: "10. Stress Test the Deal at Higher Interest Rates",
    description: "If financing, model the deal at +1% and +2% interest rates. If buying with cash, model what happens if you later need to cash-out refinance at higher rates. Markets change; your deal should survive moderate rate increases.",
    redFlag: "🚩 Red Flag: Deal barely cash flows at current rates, seller says 'rates will go down soon' or 'you can refinance later at better rates.'"
  }
];

export const LeadMagnetContent: React.FC = () => {
  return (
    <div className="lead-magnet-content">
      <div className="header">
        <h1>The 10-Point Rental Property Due Diligence Checklist</h1>
        <h2>What Smart Investors Verify Before Making an Offer</h2>
      </div>

      <div className="introduction">
        <p>
          Most failed real estate investments had red flags that were obvious in retrospect.
          The problem? Investors either didn't know what to check, or they trusted the seller's numbers without verification.
          This checklist is what experienced investors use to catch problems before closing—not after.
        </p>
      </div>

      <div className="checklist">
        {checklistItems.map((item, index) => (
          <div key={index} className="checklist-item">
            <h3>{item.title}</h3>
            <p className="description">{item.description}</p>
            <p className="red-flag">{item.redFlag}</p>
          </div>
        ))}
      </div>

      <div className="bonus-section">
        <h3>Bonus: Cash Flow Sanity Check Formula</h3>
        <div className="formula-box">
          <p><strong>Monthly Cash Flow = </strong></p>
          <p>Monthly Rent</p>
          <p>- Mortgage Payment (P&I)</p>
          <p>- Property Tax (÷ 12)</p>
          <p>- Insurance (÷ 12)</p>
          <p>- Property Management (10% of rent)</p>
          <p>- Maintenance Reserve (1% of property value ÷ 12)</p>
          <p>- CapEx Reserve (1.5% of property value ÷ 12)</p>
          <p>- Vacancy Reserve (8.3% of annual rent ÷ 12)</p>
          <p className="formula-result"><strong>= True Monthly Cash Flow</strong></p>
        </div>
        <p className="formula-note">
          If the result is negative or less than $100/month, the deal likely doesn't work.
          Walk away or negotiate a significantly lower purchase price.
        </p>
      </div>

      <div className="footer">
        <p className="generated-by">Generated by <strong>PropIQ</strong> - AI-Powered Real Estate Analysis</p>
        <div className="cta">
          <h3>Want to automate this entire analysis?</h3>
          <p>
            PropIQ analyzes any property in 60 seconds with AI-powered insights,
            deal scoring (0-100), and automatic red flag detection. Try it free.
          </p>
        </div>
      </div>
    </div>
  );
};

// Export checklist data for use in emails and PDF generation
export const checklistData = {
  title: "The 10-Point Rental Property Due Diligence Checklist",
  subtitle: "What Smart Investors Verify Before Making an Offer",
  items: checklistItems,
  introduction: "Most failed real estate investments had red flags that were obvious in retrospect. The problem? Investors either didn't know what to check, or they trusted the seller's numbers without verification. This checklist is what experienced investors use to catch problems before closing—not after.",
  bonusFormula: {
    title: "Bonus: Cash Flow Sanity Check Formula",
    items: [
      "Monthly Rent",
      "- Mortgage Payment (P&I)",
      "- Property Tax (÷ 12)",
      "- Insurance (÷ 12)",
      "- Property Management (10% of rent)",
      "- Maintenance Reserve (1% of property value ÷ 12)",
      "- CapEx Reserve (1.5% of property value ÷ 12)",
      "- Vacancy Reserve (8.3% of annual rent ÷ 12)",
      "= True Monthly Cash Flow"
    ],
    note: "If the result is negative or less than $100/month, the deal likely doesn't work. Walk away or negotiate a significantly lower purchase price."
  },
  footer: "Generated by PropIQ - AI-Powered Real Estate Analysis",
  cta: "Want to automate this entire analysis? PropIQ analyzes any property in 60 seconds with AI-powered insights, deal scoring (0-100), and automatic red flag detection. Try it free."
};
