/**
 * DealCalculator Zod Validation Schema
 *
 * Provides comprehensive validation for all property calculator inputs.
 * Works with React Hook Form to provide real-time validation and error messages.
 *
 * @example
 * ```ts
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { dealCalculatorSchema } from '@/schemas/dealCalculatorSchema';
 *
 * const form = useForm({
 *   resolver: zodResolver(dealCalculatorSchema),
 *   defaultValues: { ... }
 * });
 * ```
 */

import { z } from 'zod';

// ============================================================================
// Main Schema
// ============================================================================

export const dealCalculatorSchema = z.object({
  // Property Purchase
  purchasePrice: z
    .number({
      required_error: 'Purchase price is required',
      invalid_type_error: 'Purchase price must be a number',
    })
    .min(1000, 'Purchase price must be at least $1,000')
    .max(100000000, 'Purchase price cannot exceed $100M')
    .finite('Purchase price must be a valid number'),

  downPaymentPercent: z
    .number({
      required_error: 'Down payment is required',
      invalid_type_error: 'Down payment must be a number',
    })
    .min(0, 'Down payment cannot be negative')
    .max(100, 'Down payment cannot exceed 100%')
    .finite('Down payment must be a valid number'),

  closingCosts: z
    .number({
      required_error: 'Closing costs are required',
      invalid_type_error: 'Closing costs must be a number',
    })
    .min(0, 'Closing costs cannot be negative')
    .max(1000000, 'Closing costs seem unusually high')
    .finite('Closing costs must be a valid number'),

  rehabCosts: z
    .number({
      required_error: 'Rehab costs are required',
      invalid_type_error: 'Rehab costs must be a number',
    })
    .min(0, 'Rehab costs cannot be negative')
    .max(10000000, 'Rehab costs cannot exceed $10M')
    .finite('Rehab costs must be a valid number'),

  // Financing
  interestRate: z
    .number({
      required_error: 'Interest rate is required',
      invalid_type_error: 'Interest rate must be a number',
    })
    .min(0, 'Interest rate cannot be negative')
    .max(30, 'Interest rate seems unusually high (max 30%)')
    .finite('Interest rate must be a valid number'),

  loanTerm: z
    .number({
      required_error: 'Loan term is required',
      invalid_type_error: 'Loan term must be a number',
    })
    .int('Loan term must be a whole number')
    .min(1, 'Loan term must be at least 1 year')
    .max(50, 'Loan term cannot exceed 50 years')
    .finite('Loan term must be a valid number'),

  // Income
  monthlyRent: z
    .number({
      required_error: 'Monthly rent is required',
      invalid_type_error: 'Monthly rent must be a number',
    })
    .min(0, 'Monthly rent cannot be negative')
    .max(1000000, 'Monthly rent seems unusually high')
    .finite('Monthly rent must be a valid number'),

  // Expenses - Annual
  annualPropertyTax: z
    .number({
      required_error: 'Annual property tax is required',
      invalid_type_error: 'Property tax must be a number',
    })
    .min(0, 'Property tax cannot be negative')
    .max(1000000, 'Property tax seems unusually high')
    .finite('Property tax must be a valid number'),

  annualInsurance: z
    .number({
      required_error: 'Annual insurance is required',
      invalid_type_error: 'Insurance must be a number',
    })
    .min(0, 'Insurance cannot be negative')
    .max(100000, 'Insurance seems unusually high')
    .finite('Insurance must be a valid number'),

  // Expenses - Monthly
  monthlyHOA: z
    .number({
      required_error: 'Monthly HOA is required',
      invalid_type_error: 'HOA fees must be a number',
    })
    .min(0, 'HOA fees cannot be negative')
    .max(10000, 'HOA fees seem unusually high')
    .finite('HOA fees must be a valid number'),

  monthlyUtilities: z
    .number({
      required_error: 'Monthly utilities are required',
      invalid_type_error: 'Utilities must be a number',
    })
    .min(0, 'Utilities cannot be negative')
    .max(5000, 'Utilities seem unusually high')
    .finite('Utilities must be a valid number'),

  monthlyMaintenance: z
    .number({
      required_error: 'Monthly maintenance is required',
      invalid_type_error: 'Maintenance must be a number',
    })
    .min(0, 'Maintenance cannot be negative')
    .max(10000, 'Maintenance seems unusually high')
    .finite('Maintenance must be a valid number'),

  monthlyVacancy: z
    .number({
      required_error: 'Monthly vacancy reserve is required',
      invalid_type_error: 'Vacancy reserve must be a number',
    })
    .min(0, 'Vacancy reserve cannot be negative')
    .max(10000, 'Vacancy reserve seems unusually high')
    .finite('Vacancy reserve must be a valid number'),

  monthlyPropertyManagement: z
    .number({
      required_error: 'Monthly property management is required',
      invalid_type_error: 'Property management must be a number',
    })
    .min(0, 'Property management cannot be negative')
    .max(10000, 'Property management seems unusually high')
    .finite('Property management must be a valid number'),

  // Investment Strategy
  strategy: z.enum(['rental', 'houseHack', 'brrrr', 'fixFlip', 'commercial'], {
    required_error: 'Investment strategy is required',
    invalid_type_error: 'Invalid investment strategy selected',
  }),

  // Market Tier Classification
  marketTier: z.enum(['A', 'B', 'C', 'D'], {
    required_error: 'Market tier is required',
    invalid_type_error: 'Invalid market tier selected',
  }).optional().default('B'),
});

// ============================================================================
// Projection Inputs Schema (for 5-year projections)
// ============================================================================

export const projectionInputsSchema = z.object({
  annualRentGrowth: z
    .number({
      required_error: 'Annual rent growth is required',
      invalid_type_error: 'Rent growth must be a number',
    })
    .min(-10, 'Rent growth cannot be less than -10%')
    .max(50, 'Rent growth cannot exceed 50%')
    .finite('Rent growth must be a valid number'),

  annualExpenseGrowth: z
    .number({
      required_error: 'Annual expense growth is required',
      invalid_type_error: 'Expense growth must be a number',
    })
    .min(-10, 'Expense growth cannot be less than -10%')
    .max(50, 'Expense growth cannot exceed 50%')
    .finite('Expense growth must be a valid number'),

  annualAppreciation: z
    .number({
      required_error: 'Annual appreciation is required',
      invalid_type_error: 'Appreciation must be a number',
    })
    .min(-20, 'Appreciation cannot be less than -20%')
    .max(50, 'Appreciation cannot exceed 50%')
    .finite('Appreciation must be a valid number'),
});

// ============================================================================
// Type Inference
// ============================================================================

/**
 * TypeScript type inferred from dealCalculatorSchema
 * Use this instead of the original PropertyInputs interface
 */
export type DealCalculatorInputs = z.infer<typeof dealCalculatorSchema>;

/**
 * TypeScript type for projection inputs
 */
export type ProjectionInputs = z.infer<typeof projectionInputsSchema>;

// ============================================================================
// Custom Validation Functions (for complex cross-field validation)
// ============================================================================

/**
 * Validates that down payment amount doesn't exceed purchase price
 */
export const validateDownPaymentAmount = (
  purchasePrice: number,
  downPaymentPercent: number
): boolean => {
  const downPaymentAmount = (purchasePrice * downPaymentPercent) / 100;
  return downPaymentAmount <= purchasePrice;
};

/**
 * Validates that monthly rent meets the 1% rule (optional guideline)
 * Returns true if rent >= 1% of purchase price
 */
export const validate1PercentRule = (
  monthlyRent: number,
  purchasePrice: number
): boolean => {
  const onePercentThreshold = purchasePrice * 0.01;
  return monthlyRent >= onePercentThreshold;
};

/**
 * Validates that total monthly expenses don't exceed monthly rent
 * (Warning only - not enforced)
 */
export const validateExpensesVsRent = (
  monthlyRent: number,
  totalMonthlyExpenses: number
): boolean => {
  return totalMonthlyExpenses < monthlyRent;
};

// ============================================================================
// Field Metadata (for form labels, descriptions, placeholders)
// ============================================================================

export const fieldMetadata = {
  purchasePrice: {
    label: 'Purchase Price',
    description: 'Total purchase price of the property',
    placeholder: '$300,000',
    tooltip: 'The total amount you will pay to acquire the property',
  },
  downPaymentPercent: {
    label: 'Down Payment (%)',
    description: 'Percentage of purchase price paid upfront',
    placeholder: '20',
    tooltip: 'Typical down payments range from 3.5% (FHA) to 25% (investment)',
  },
  interestRate: {
    label: 'Interest Rate (%)',
    description: 'Annual interest rate on the mortgage',
    placeholder: '7.0',
    tooltip: 'Current mortgage rates vary based on credit score and loan type',
  },
  loanTerm: {
    label: 'Loan Term (Years)',
    description: 'Length of the mortgage in years',
    placeholder: '30',
    tooltip: 'Most common terms are 15 or 30 years',
  },
  monthlyRent: {
    label: 'Monthly Rent',
    description: 'Expected monthly rental income',
    placeholder: '$2,500',
    tooltip: 'Research comparable rentals in the area for accurate estimates',
  },
  annualPropertyTax: {
    label: 'Annual Property Tax',
    description: 'Yearly property tax amount',
    placeholder: '$3,600',
    tooltip: 'Check local tax assessor records for actual rates',
  },
  annualInsurance: {
    label: 'Annual Insurance',
    description: 'Yearly homeowners/landlord insurance',
    placeholder: '$1,200',
    tooltip: 'Get quotes from multiple insurance providers',
  },
  monthlyHOA: {
    label: 'Monthly HOA Fees',
    description: 'Homeowners association monthly fees',
    placeholder: '$0',
    tooltip: 'Not all properties have HOA fees',
  },
  monthlyUtilities: {
    label: 'Monthly Utilities',
    description: 'Utilities paid by landlord (if any)',
    placeholder: '$0',
    tooltip: 'Typically tenants pay utilities, but verify lease terms',
  },
  monthlyMaintenance: {
    label: 'Monthly Maintenance',
    description: 'Estimated monthly maintenance/repairs',
    placeholder: '$200',
    tooltip: 'Rule of thumb: 1-2% of property value annually',
  },
  monthlyVacancy: {
    label: 'Monthly Vacancy Reserve',
    description: 'Monthly reserve for vacancy periods',
    placeholder: '$125',
    tooltip: 'Typically 5-10% of monthly rent',
  },
  monthlyPropertyManagement: {
    label: 'Property Management',
    description: 'Monthly property management fees',
    placeholder: '$0',
    tooltip: 'Typically 8-12% of monthly rent if using a property manager',
  },
  closingCosts: {
    label: 'Closing Costs',
    description: 'One-time costs to close the purchase',
    placeholder: '$9,000',
    tooltip: 'Typically 2-5% of purchase price',
  },
  rehabCosts: {
    label: 'Rehab Costs',
    description: 'One-time renovation/repair costs',
    placeholder: '$0',
    tooltip: 'Estimate based on inspection and contractor quotes',
  },
  strategy: {
    label: 'Investment Strategy',
    description: 'Your investment approach for this property',
    tooltip: 'Different strategies have different metrics and expectations',
    options: [
      { value: 'rental', label: 'Buy & Hold Rental' },
      { value: 'houseHack', label: 'House Hack' },
      { value: 'brrrr', label: 'BRRRR' },
      { value: 'fixFlip', label: 'Fix & Flip' },
      { value: 'commercial', label: 'Commercial' },
    ],
  },
  marketTier: {
    label: 'Market Classification',
    description: 'Property market tier for cap rate targeting',
    tooltip: 'Class A: Hot metros (4-5% cap). Class B: Growth markets (5-7% cap). Class C: Cash flow markets (7-9% cap). Class D: High-risk markets (9%+ cap)',
    options: [
      { value: 'A', label: 'Class A - Hot metros (4-5% cap)' },
      { value: 'B', label: 'Class B - Growth markets (5-7% cap)' },
      { value: 'C', label: 'Class C - Cash flow markets (7-9% cap)' },
      { value: 'D', label: 'Class D - High-risk markets (9%+ cap)' },
    ],
  },
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const defaultDealCalculatorValues: DealCalculatorInputs = {
  purchasePrice: 300000,
  downPaymentPercent: 20,
  interestRate: 7.0,
  loanTerm: 30,
  monthlyRent: 2500,
  annualPropertyTax: 3600,
  annualInsurance: 1200,
  monthlyHOA: 0,
  monthlyUtilities: 0,
  monthlyMaintenance: 200,
  monthlyVacancy: 125,
  monthlyPropertyManagement: 0,
  closingCosts: 9000,
  rehabCosts: 0,
  strategy: 'rental',
  marketTier: 'B',
};

export const defaultProjectionValues: ProjectionInputs = {
  annualRentGrowth: 3,
  annualExpenseGrowth: 2,
  annualAppreciation: 3,
};

// ============================================================================
// Export Everything
// ============================================================================

export default {
  schema: dealCalculatorSchema,
  projectionSchema: projectionInputsSchema,
  defaultValues: defaultDealCalculatorValues,
  defaultProjectionValues,
  fieldMetadata,
  validators: {
    validateDownPaymentAmount,
    validate1PercentRule,
    validateExpensesVsRent,
  },
};
