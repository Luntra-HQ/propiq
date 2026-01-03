/**
 * Beginner-friendly tooltips for deal calculator
 * Provides educational context, warnings, and examples
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

export const BEGINNER_TOOLTIPS: Record<string, TooltipMetadata> = {
  purchasePrice: {
    title: "Purchase Price",
    help: "The total amount you'll pay to buy the property. Don't include rehab or closing costs here.",
    warning: "Make sure this matches the offer price or listing price you're analyzing.",
    example: "Example: $250,000 for a 3-bed, 2-bath rental"
  },

  downPaymentPercent: {
    title: "Down Payment",
    help: "The percentage you'll pay upfront. Higher down payment = lower monthly mortgage.",
    example: "20% is traditional. FHA allows 3.5%, but requires PMI insurance.",
  },

  interestRate: {
    title: "Interest Rate",
    help: "Annual percentage rate (APR) on your mortgage. Check current rates on Bankrate.com.",
    warning: "Even 0.5% difference can cost thousands over 30 years.",
    example: "As of 2025, investment property rates are typically 7-8%"
  },

  monthlyRent: {
    title: "Monthly Rent",
    help: "Expected monthly rental income. Research 3+ comparable rentals in the area.",
    warning: "Don't use Zillow's estimate alone - verify with local property managers or recent listings.",
    example: "Example: Similar 3-bed homes in this ZIP rent for $2,200-$2,500/month"
  },

  annualPropertyTax: {
    title: "Annual Property Tax",
    help: "Yearly property tax bill. Check the county assessor's website for actual rates.",
    warning: "Taxes can increase after you buy - especially if assessed value was outdated.",
    example: "Example: $300,000 home × 1% rate = $3,000/year"
  },

  annualInsurance: {
    title: "Annual Insurance",
    help: "Homeowner's insurance, plus landlord liability coverage.",
    example: "Typical: 0.5-1% of property value annually. Get quotes from 3+ insurers.",
  },

  monthlyHOA: {
    title: "HOA Fees",
    help: "Homeowner Association monthly fees for condos/townhomes.",
    warning: "HOA fees often increase 3-5% annually. Check HOA financial health before buying.",
  },

  monthlyMaintenance: {
    title: "Monthly Maintenance",
    help: "Budget for repairs, lawn care, HVAC servicing, pest control, etc.",
    warning: "Rule of thumb: 1-2% of property value annually. Older homes need more. Don't underestimate!",
    example: "Example: $300,000 home × 1.5% = $4,500/year = $375/month"
  },

  monthlyVacancy: {
    title: "Vacancy Reserve",
    help: "Money set aside for months when property is empty between tenants.",
    example: "Standard: 8-10% of monthly rent. Hot markets: 5%. Soft markets: 12-15%.",
  },

  monthlyCapEx: {
    title: "Capital Expenditures (CapEx)",
    help: "Major repairs/replacements: roof, HVAC, water heater, appliances.",
    example: "Rule of thumb: $0.50-$1.00 per square foot per year. A 1,500 sq ft home = $750-$1,500/year = $60-125/month",
  },

  // Calculated Metrics Tooltips
  monthlyCashFlow: {
    title: "Monthly Cash Flow",
    help: "Profit (or loss) after all expenses and mortgage payment.",
    interpretation: "Positive = good. $200+/month = excellent. Negative = you're subsidizing the property.",
    goodRange: "$200+",
    concernRange: "Negative"
  },

  cashOnCashReturn: {
    title: "Cash-on-Cash Return (CoC)",
    help: "Annual return on your actual cash invested (down payment + closing costs).",
    interpretation: "Your 'yield' on money you put in. Compare to stocks, bonds, or other investments.",
    goodRange: "10-15%",
    concernRange: "< 6%"
  },

  capRate: {
    title: "Capitalization Rate (Cap Rate)",
    help: "Net operating income ÷ purchase price. Measures property's earning potential without financing.",
    interpretation: "Hot markets (LA, SF): 4-5%. Cash flow markets (Midwest): 7-9%.",
    goodRange: "Depends on market",
    concernRange: "< 4% unless appreciation market"
  },

  debtCoverageRatio: {
    title: "Debt Coverage Ratio (DCR)",
    help: "How much your net operating income covers your mortgage payment.",
    interpretation: "Lenders require 1.25+ for commercial loans. Shows safety margin.",
    goodRange: "1.25 - 1.50",
    concernRange: "< 1.20"
  },

  totalCashInvested: {
    title: "Total Cash Invested",
    help: "Down payment + closing costs + rehab. Your total out-of-pocket.",
    example: "This is the denominator in your Cash-on-Cash Return calculation.",
  },

  onePercentRule: {
    title: "1% Rule",
    help: "Monthly rent should be ≥ 1% of purchase price for good cash flow.",
    interpretation: "$250k property should rent for $2,500/month. Not all markets meet this.",
    goodRange: "≥ 1.0%",
    concernRange: "< 0.7%"
  },

  operatingExpenseRatio: {
    title: "Operating Expense Ratio",
    help: "What percentage of your rental income goes to operating expenses (not mortgage).",
    interpretation: "Lower is better. Well-managed properties: 35-45%.",
    goodRange: "35-45%",
    concernRange: "> 50%"
  },

  marketTier: {
    title: "Market Tier Classification",
    help: "Class A = Hot metros (high prices, low yields). Class D = Rural/distressed (low prices, high risk).",
    example: "Class A: San Francisco, NYC. Class B: Charlotte, Austin suburbs. Class C: Midwest cash flow markets.",
  },

  strategy: {
    title: "Investment Strategy",
    help: "Buy & Hold = long-term rental. BRRRR = Buy, Rehab, Rent, Refinance, Repeat. Fix & Flip = quick sale.",
    warning: "Each strategy has different tax implications and time commitments.",
  }
};
