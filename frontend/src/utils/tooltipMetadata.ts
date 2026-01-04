/**
 * Enhanced Tooltip Metadata for Deal Calculator
 *
 * Provides beginner-friendly explanations, warnings, examples, and interpretation
 * guides for all calculator fields and metrics.
 */

export interface TooltipMetadata {
  title: string;
  help: string;
  warning?: string;
  example?: string;
  interpretation?: string;
  goodRange?: string;
  concernRange?: string;
}

/**
 * Input Field Tooltips - Helps users understand what to enter
 */
export const INPUT_TOOLTIPS: Record<string, TooltipMetadata> = {
  purchasePrice: {
    title: "Purchase Price",
    help: "The total amount you'll pay to buy the property. Don't include rehab or closing costs here.",
    warning: "Make sure this matches the offer price or listing price you're analyzing.",
    example: "Example: $250,000 for a 3-bed, 2-bath rental"
  },

  downPaymentPercent: {
    title: "Down Payment Percentage",
    help: "How much cash you'll put down as a percentage of the purchase price.",
    warning: "Investment properties typically require 20-25% down. Some lenders require 30% for non-owner occupied.",
    example: "Example: 25% down on $250k = $62,500 cash down"
  },

  interestRate: {
    title: "Interest Rate",
    help: "The annual interest rate on your mortgage. Investment property rates are typically 0.5-1% higher than primary residence rates.",
    warning: "Don't use a primary residence rate. Call a lender for current investment property rates in your market.",
    example: "Example: 7.5% is typical for investment properties in 2024-2025"
  },

  loanTerm: {
    title: "Loan Term (Years)",
    help: "How many years you'll take to pay off the mortgage.",
    interpretation: "15-year loans have higher monthly payments but save on interest. 30-year loans maximize cash flow.",
    example: "Example: 30 years is most common for rental properties"
  },

  closingCostsPercent: {
    title: "Closing Costs Percentage",
    help: "Fees paid at closing (title insurance, escrow, lender fees, inspections, etc.)",
    warning: "Don't underestimate! Closing costs can be 2-5% of purchase price.",
    example: "Example: 3% of $250k = $7,500 in closing costs"
  },

  rehabBudget: {
    title: "Rehab Budget",
    help: "Money needed to repair or upgrade the property before renting it out.",
    warning: "Get contractor quotes! Add 20% buffer for unexpected issues. Many investors underestimate rehab costs.",
    example: "Example: $15,000 for paint, flooring, kitchen updates, HVAC repair"
  },

  monthlyRent: {
    title: "Monthly Rent",
    help: "Expected monthly rental income. Research 3+ comparable rentals in the area.",
    warning: "Don't use Zillow's estimate alone - verify with local property managers or recent listings.",
    example: "Example: Similar 3-bed homes in this ZIP rent for $2,200-$2,500/month"
  },

  monthlyTaxes: {
    title: "Monthly Property Taxes",
    help: "Annual property taxes divided by 12. Check the county tax assessor's website for exact amounts.",
    warning: "Tax bills can increase after purchase if assessed value goes up. Budget for potential increases.",
    example: "Example: $3,600/year in taxes = $300/month"
  },

  monthlyInsurance: {
    title: "Monthly Insurance",
    help: "Homeowners insurance (required by lender) and landlord insurance (highly recommended).",
    warning: "Investment property insurance costs 15-25% more than homeowner policies. Get quotes from 3+ insurers.",
    example: "Example: $1,200/year = $100/month for landlord insurance"
  },

  monthlyHOA: {
    title: "Monthly HOA Fees",
    help: "Homeowners Association fees (if applicable). Covers community amenities, maintenance, reserves.",
    warning: "HOA fees typically increase 3-5% annually. Check the HOA's financial health and special assessment history.",
    example: "Example: $150/month for townhome HOA with pool and landscaping"
  },

  monthlyUtilities: {
    title: "Monthly Utilities (Landlord Paid)",
    help: "Only include utilities YOU pay, not tenant-paid utilities.",
    interpretation: "Single-family homes: tenants usually pay all utilities. Multi-family: landlords often pay water/trash.",
    example: "Example: $50/month for water and trash (tenant pays electric/gas)"
  },

  monthlyMaintenance: {
    title: "Monthly Maintenance",
    help: "Budget for repairs, lawn care, HVAC servicing, appliance replacements, etc.",
    warning: "Rule of thumb: 1-2% of property value annually. Older homes need more. Don't underestimate!",
    example: "Example: $300k home × 1.5% = $4,500/year = $375/month"
  },

  monthlyVacancy: {
    title: "Monthly Vacancy Reserve",
    help: "Budget for periods when the property is empty between tenants.",
    interpretation: "5-10% of gross rent is standard. Higher for luxury rentals, lower for affordable housing.",
    example: "Example: $2,000 rent × 8% = $160/month vacancy reserve"
  },

  monthlyPropertyManagement: {
    title: "Monthly Property Management",
    help: "Fee charged by property management company (typically 8-12% of rent).",
    interpretation: "Budget for this even if self-managing initially - it protects your analysis if you need to hire later.",
    example: "Example: $2,000 rent × 10% = $200/month management fee"
  },

  strategy: {
    title: "Investment Strategy",
    help: "Your primary goal for this investment.",
    interpretation: "Buy & Hold focuses on cash flow. BRRRR maximizes ROI by refinancing. Fix & Flip is short-term.",
    example: "Example: Buy & Hold for passive income, BRRRR to scale faster"
  },

  marketTier: {
    title: "Market Tier",
    help: "Quality classification of the neighborhood where the property is located.",
    interpretation: "A markets: low cap rates, high prices, stable. C/D markets: higher cash flow, more risk.",
    example: "Example: Suburban area with good schools = A/B tier. Inner city value-add = C tier"
  }
};

/**
 * Metric Result Tooltips - Helps users interpret calculated results
 */
export const METRIC_TOOLTIPS: Record<string, TooltipMetadata> = {
  dealScore: {
    title: "Deal Score (0-100)",
    help: "Overall investment quality score based on cash flow, returns, and risk factors.",
    interpretation: "Weighted algorithm considering cash flow (40%), CoC return (25%), cap rate (20%), 1% rule (15%).",
    goodRange: "80+ = Excellent, 65+ = Good",
    concernRange: "Below 50 = Fair, Below 35 = Avoid"
  },

  monthlyCashFlow: {
    title: "Monthly Cash Flow",
    help: "Net profit or loss each month after all expenses and mortgage payment.",
    interpretation: "Positive = making money. Negative = losing money each month (cash flow negative).",
    goodRange: "$200+ per door",
    concernRange: "Below $0 (negative cash flow)"
  },

  capRate: {
    title: "Cap Rate (Capitalization Rate)",
    help: "Annual return on investment if you paid all cash (no mortgage).",
    interpretation: "Measures property performance independent of financing. Higher cap rate = higher return (but often higher risk).",
    goodRange: "8-12% for rental properties",
    concernRange: "Below 5% (low return) or Above 15% (high risk)"
  },

  cashOnCashReturn: {
    title: "Cash-on-Cash Return",
    help: "Annual return on the actual cash you invested (down payment + closing costs + rehab).",
    interpretation: "Measures how hard your cash is working. Accounts for leverage (mortgage).",
    goodRange: "10-15% is strong",
    concernRange: "Below 6% (consider other investments)"
  },

  debtCoverageRatio: {
    title: "Debt Coverage Ratio (DCR)",
    help: "How much your net operating income covers your mortgage payment.",
    interpretation: "Lenders want to see 1.25+. Below 1.0 means you can't cover the mortgage.",
    goodRange: "1.25 - 1.50",
    concernRange: "Below 1.20 (tight cash flow)"
  },

  onePercentRule: {
    title: "1% Rule",
    help: "Quick screening metric: monthly rent should be at least 1% of purchase price.",
    interpretation: "Not a deal-breaker if you miss it, but deals that meet the 1% rule usually cash flow well.",
    goodRange: "1.0% or higher",
    concernRange: "Below 0.7% (may struggle to cash flow)"
  },

  totalCashInvested: {
    title: "Total Cash Invested",
    help: "Total out-of-pocket cash needed: down payment + closing costs + rehab.",
    warning: "Don't forget to budget for reserves! Many investors run out of cash after closing.",
    example: "Example: $62.5k down + $7.5k closing + $15k rehab = $85k total"
  },

  annualCashFlow: {
    title: "Annual Cash Flow",
    help: "Total net profit for the year (monthly cash flow × 12).",
    interpretation: "This is your passive income from the property.",
    example: "Example: $300/month × 12 = $3,600/year in passive income"
  },

  totalMonthlyExpenses: {
    title: "Total Monthly Expenses",
    help: "Sum of all operating expenses (taxes, insurance, maintenance, etc.) PLUS mortgage payment.",
    warning: "Make sure you didn't miss any expenses! Check with local landlords for market-typical costs.",
    example: "Example: $800 PITI + $600 OpEx = $1,400 total expenses"
  },

  grossRentMultiplier: {
    title: "Gross Rent Multiplier (GRM)",
    help: "Purchase price divided by annual gross rent. Lower GRM = better deal.",
    interpretation: "Quick screening tool. GRM varies by market. Compare to local averages.",
    goodRange: "8-12 in most markets",
    concernRange: "Above 15 (expensive relative to rent)"
  },

  confidenceScore: {
    title: "Deal Confidence Score",
    help: "Combines deal metrics (70%) and input data quality (30%) to show how reliable this analysis is.",
    interpretation: "Higher scores = better data + stronger fundamentals. Low scores suggest more research needed.",
    goodRange: "80%+ = High confidence",
    concernRange: "Below 40% = Low confidence, verify data"
  },

  irr: {
    title: "IRR (Internal Rate of Return)",
    help: "Annualized rate of return accounting for time value of money over a 5-year hold period with property sale.",
    interpretation: "IRR accounts for cash flows over time AND sale proceeds. More accurate than simple ROI or CoC return for buy-and-hold investors.",
    goodRange: "15%+ = Strong, 20%+ = Excellent",
    concernRange: "Below 10% = Weak returns"
  },

  equityMultiple: {
    title: "Equity Multiple (5-Year)",
    help: "Total cash returned divided by total cash invested. Shows how many times you get your money back.",
    interpretation: "Includes cumulative cash flow + equity at sale. Simple metric: 2.0x means you doubled your money.",
    goodRange: "2.0x+ = Strong (doubled money), 3.0x+ = Excellent",
    concernRange: "Below 1.5x = Weak returns"
  }
};

/**
 * Get tooltip metadata for a field or metric
 */
export const getTooltip = (fieldName: string): TooltipMetadata | undefined => {
  return INPUT_TOOLTIPS[fieldName] || METRIC_TOOLTIPS[fieldName];
};

/**
 * Check if a field has tooltip metadata
 */
export const hasTooltip = (fieldName: string): boolean => {
  return fieldName in INPUT_TOOLTIPS || fieldName in METRIC_TOOLTIPS;
};
