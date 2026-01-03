/**
 * DealCalculator V3 - Refactored with ShadCN Form + React Hook Form + Zod
 *
 * Major improvements:
 * - ✅ Form validation with Zod schema
 * - ✅ Real-time error messages
 * - ✅ Better accessibility (ARIA labels, error announcements)
 * - ✅ Glass aesthetic maintained
 * - ✅ Same 3-tab structure (Basic, Advanced, Scenarios)
 * - ✅ Type-safe with TypeScript
 *
 * @example
 * ```tsx
 * import { DealCalculator } from './DealCalculator';
 * <DealCalculator />
 * ```
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  dealCalculatorSchema,
  projectionInputsSchema,
  defaultDealCalculatorValues,
  defaultProjectionValues,
  fieldMetadata,
  type DealCalculatorInputs,
  type ProjectionInputs,
} from '@/schemas/dealCalculatorSchema';
import {
  CalculatedMetrics,
  calculateAllMetrics,
  generateScenarioAnalysis,
  generate5YearProjections,
  formatCurrency,
  formatPercent,
  formatNumber,
  ScenarioAnalysis,
  YearlyProjection,
  getRedFlags,
  getGreenLights,
} from '../utils/calculatorUtils';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  GlassFormContainer,
  GlassFormSection,
  GlassFormGrid,
} from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrintIconButton } from './PrintButton';
import './DealCalculator.css';

// ============================================================================
// Main Component
// ============================================================================

export const DealCalculator = () => {
  // Form setup with React Hook Form + Zod
  const form = useForm<DealCalculatorInputs>({
    resolver: zodResolver(dealCalculatorSchema),
    defaultValues: defaultDealCalculatorValues,
    mode: 'onChange', // Validate on every change
  });

  const projectionForm = useForm<ProjectionInputs>({
    resolver: zodResolver(projectionInputsSchema),
    defaultValues: defaultProjectionValues,
    mode: 'onChange',
  });

  // Watch form values for real-time calculations
  const inputs = form.watch();
  const projectionInputs = projectionForm.watch();

  // Calculated metrics state
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioAnalysis | null>(null);
  const [projections, setProjections] = useState<YearlyProjection[]>([]);

  // Recalculate whenever inputs change
  useEffect(() => {
    // Only calculate if form is valid (all required fields have values)
    const hasRequiredFields = inputs.purchasePrice > 0 && inputs.monthlyRent > 0;

    if (hasRequiredFields) {
      const calculatedMetrics = calculateAllMetrics(inputs as any); // Cast for compatibility
      setMetrics(calculatedMetrics);

      const scenarioAnalysis = generateScenarioAnalysis(inputs as any);
      setScenarios(scenarioAnalysis);

      const yearlyProjections = generate5YearProjections(
        inputs as any,
        calculatedMetrics,
        projectionInputs.annualRentGrowth,
        projectionInputs.annualExpenseGrowth,
        projectionInputs.annualAppreciation
      );
      setProjections(yearlyProjections);
    }
  }, [inputs, projectionInputs]);

  if (!metrics) {
    return (
      <div className="deal-calculator" id="deal-calculator-printable">
        <div className="calculator-header">
          <div>
            <h2>Deal Calculator</h2>
            <p>Enter property details to analyze the investment</p>
          </div>
        </div>
        <div className="calculator-content">
          <p className="text-gray-400 text-center py-8">
            Start by entering the purchase price and monthly rent in the Basic Analysis tab
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="deal-calculator" id="deal-calculator-printable">
      <div className="calculator-header">
        <div>
          <h2>Deal Calculator</h2>
          <p>Comprehensive real estate investment analysis</p>
        </div>
        <PrintIconButton
          elementId="deal-calculator-printable"
          printOptions={{
            title: 'Deal Calculator Analysis',
            includeDate: true,
            orientation: 'portrait',
          }}
          tooltipText="Print Calculator Results"
        />
      </div>

      {/* Tab Navigation with ShadCN Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="calculator-tabs bg-surface-200 border-glass-border w-full grid grid-cols-3">
          <TabsTrigger
            value="basic"
            className="tab-button data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
          >
            Basic Analysis
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="tab-button data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
          >
            Advanced Metrics
          </TabsTrigger>
          <TabsTrigger
            value="scenarios"
            className="tab-button data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
          >
            Scenarios & Projections
          </TabsTrigger>
        </TabsList>

        <div className="calculator-content">
          {/* Basic Analysis Tab */}
          <TabsContent value="basic">
            <BasicAnalysisTab form={form} metrics={metrics} />
          </TabsContent>

          {/* Advanced Metrics Tab */}
          <TabsContent value="advanced">
            <AdvancedMetricsTab metrics={metrics} />
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios">
            <ScenariosTab
              scenarios={scenarios}
              projections={projections}
              projectionForm={projectionForm}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// ============================================================================
// BASIC ANALYSIS TAB
// ============================================================================

interface BasicAnalysisTabProps {
  form: ReturnType<typeof useForm<DealCalculatorInputs>>;
  metrics: CalculatedMetrics;
}

const BasicAnalysisTab = ({ form, metrics }: BasicAnalysisTabProps) => {
  return (
    <div className="tab-content">
      <div className="calculator-grid">
        {/* Left Column: Inputs */}
        <div className="input-section">
          <Form {...form}>
            <form className="space-y-6">
              {/* Property Information */}
              <GlassFormSection title="Property Information">
                <GlassFormGrid columns={2}>
                  {/* Purchase Price */}
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.purchasePrice.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.purchasePrice.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="1000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Down Payment */}
                  <FormField
                    control={form.control}
                    name="downPaymentPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.downPaymentPercent.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.downPaymentPercent.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="1"
                            min="0"
                            max="100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Interest Rate */}
                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.interestRate.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.interestRate.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="0.125"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Loan Term */}
                  <FormField
                    control={form.control}
                    name="loanTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.loanTerm.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.loanTerm.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Closing Costs */}
                  <FormField
                    control={form.control}
                    name="closingCosts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.closingCosts.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.closingCosts.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Rehab Costs */}
                  <FormField
                    control={form.control}
                    name="rehabCosts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.rehabCosts.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.rehabCosts.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </GlassFormGrid>

                {/* Investment Strategy - TEMPORARILY DISABLED DUE TO INFINITE LOOP */}
                {/* TODO: Fix Select component infinite render issue */}
                {/* <FormField
                  control={form.control}
                  name="strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldMetadata.strategy.label}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-surface-200 border-glass-border text-gray-100">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-surface-300 border-glass-border backdrop-blur-glass">
                          {fieldMetadata.strategy.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* Market Tier Classification - Using simple select to avoid infinite loop */}
                <FormField
                  control={form.control}
                  name="marketTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">{fieldMetadata.marketTier.label}</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-glass-border bg-surface-200 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-gray-100"
                        >
                          {fieldMetadata.marketTier.options.map((option) => (
                            <option key={option.value} value={option.value} className="bg-surface-300">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription className="text-xs text-gray-400">
                        {fieldMetadata.marketTier.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </GlassFormSection>

              {/* Monthly Income */}
              <GlassFormSection title="Monthly Income">
                <FormField
                  control={form.control}
                  name="monthlyRent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldMetadata.monthlyRent.label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={fieldMetadata.monthlyRent.placeholder}
                          className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          step="50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </GlassFormSection>

              {/* Monthly Expenses */}
              <GlassFormSection title="Monthly Expenses">
                <GlassFormGrid columns={2}>
                  {/* Annual Property Tax */}
                  <FormField
                    control={form.control}
                    name="annualPropertyTax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.annualPropertyTax.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.annualPropertyTax.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Annual Insurance */}
                  <FormField
                    control={form.control}
                    name="annualInsurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.annualInsurance.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.annualInsurance.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* HOA */}
                  <FormField
                    control={form.control}
                    name="monthlyHOA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.monthlyHOA.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.monthlyHOA.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Utilities */}
                  <FormField
                    control={form.control}
                    name="monthlyUtilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.monthlyUtilities.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.monthlyUtilities.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Maintenance */}
                  <FormField
                    control={form.control}
                    name="monthlyMaintenance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.monthlyMaintenance.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.monthlyMaintenance.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vacancy */}
                  <FormField
                    control={form.control}
                    name="monthlyVacancy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.monthlyVacancy.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.monthlyVacancy.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Property Management */}
                  <FormField
                    control={form.control}
                    name="monthlyPropertyManagement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldMetadata.monthlyPropertyManagement.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldMetadata.monthlyPropertyManagement.placeholder}
                            className="bg-surface-200 border-glass-border focus:ring-primary text-gray-100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            step="10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </GlassFormGrid>
              </GlassFormSection>
            </form>
          </Form>
        </div>

        {/* Right Column: Results */}
        <div className="results-section">
          <ResultsDisplay metrics={metrics} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// RESULTS DISPLAY (unchanged from original)
// ============================================================================

interface ResultsDisplayProps {
  metrics: CalculatedMetrics;
}

const ResultsDisplay = ({ metrics }: ResultsDisplayProps) => {
  const getDealScoreColor = (score: number): string => {
    if (score >= 80) return '#28a745'; // Excellent - Green
    if (score >= 65) return '#17a2b8'; // Good - Blue
    if (score >= 50) return '#ffc107'; // Fair - Yellow
    if (score >= 35) return '#fd7e14'; // Poor - Orange
    return '#dc3545'; // Avoid - Red
  };

  const getDealScoreRating = (score: number): string => {
    if (score >= 80) return 'Excellent Deal';
    if (score >= 65) return 'Good Deal';
    if (score >= 50) return 'Fair Deal';
    if (score >= 35) return 'Poor Deal';
    return 'Avoid';
  };

  const scoreColor = getDealScoreColor(metrics.dealScore);
  const scoreRating = getDealScoreRating(metrics.dealScore);

  // Get red flags and green lights
  const redFlags = getRedFlags(metrics);
  const greenLights = getGreenLights(metrics);

  return (
    <>
      {/* Deal Score Badge */}
      <div className="deal-score-badge" style={{ borderColor: scoreColor }}>
        <div className="score-value" style={{ color: scoreColor }}>
          {metrics.dealScore}/100
        </div>
        <div className="score-rating" style={{ color: scoreColor }}>
          {scoreRating}
        </div>
      </div>

      {/* Red Flags Warning */}
      {redFlags.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
          <h4 className="text-red-400 font-semibold mb-2">⚠️ Warning Signs</h4>
          <ul className="space-y-1">
            {redFlags.map((flag, i) => (
              <li key={i} className="text-sm text-red-300">{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Green Lights Success */}
      {greenLights.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4">
          <h4 className="text-emerald-400 font-semibold mb-2">✅ Deal Strengths</h4>
          <ul className="space-y-1">
            {greenLights.map((light, i) => (
              <li key={i} className="text-sm text-emerald-300">{light}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Monthly Cash Flow */}
      <div className="result-card highlight">
        <div className="result-label">Monthly Cash Flow</div>
        <div
          className="result-value"
          style={{
            color: metrics.monthlyCashFlow >= 0 ? '#28a745' : '#dc3545',
          }}
        >
          {formatCurrency(metrics.monthlyCashFlow)}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Cash Invested</div>
          <div className="metric-value">{formatCurrency(metrics.totalCashInvested)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Loan Amount</div>
          <div className="metric-value">{formatCurrency(metrics.loanAmount)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Cap Rate</div>
          <div className="metric-value">{formatPercent(metrics.capRate)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Cash on Cash Return</div>
          <div className="metric-value">{formatPercent(metrics.cashOnCashReturn)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">1% Rule</div>
          <div className="metric-value">
            {formatPercent(metrics.onePercentRule)}
            {metrics.onePercentRule >= 1 && (
              <span className="badge success" style={{ marginLeft: '8px' }}>
                ✓ Meets
              </span>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Annual NOI</div>
          <div className="metric-value">{formatCurrency(metrics.annualNOI)}</div>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// ADVANCED METRICS TAB (unchanged - reuse from original)
// ============================================================================

interface AdvancedMetricsTabProps {
  metrics: CalculatedMetrics;
}

const AdvancedMetricsTab = ({ metrics }: AdvancedMetricsTabProps) => {
  return (
    <div className="tab-content">
      <div className="metrics-detailed">
        <h3>Advanced Investment Metrics</h3>

        <div className="metrics-grid-advanced">
          <div className="metric-card">
            <div className="metric-label">Gross Rent Multiplier</div>
            <div className="metric-value">{formatNumber(metrics.grm)}</div>
            <div className="metric-description">Lower is better (typically 4-7)</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Debt Coverage Ratio</div>
            <div className="metric-value">{formatNumber(metrics.debtCoverageRatio)}</div>
            <div className="metric-description">
              {metrics.debtCoverageRatio >= 1.25 ? 'Excellent' : 'Needs improvement'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Operating Expense Ratio</div>
            <div className="metric-value">{formatPercent(metrics.operatingExpenseRatio)}</div>
            <div className="metric-description">Lower is better</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Break-Even Occupancy</div>
            <div className="metric-value">{formatPercent(metrics.breakEvenOccupancy)}</div>
            <div className="metric-description">
              {metrics.breakEvenOccupancy <= 85 ? 'Good margin' : 'Tight margin'}
            </div>
          </div>
        </div>

        <h3 style={{ marginTop: '32px' }}>Annual Breakdown</h3>

        <div className="annual-breakdown">
          <div className="breakdown-row">
            <span>Gross Annual Income</span>
            <span>{formatCurrency(metrics.annualGrossIncome)}</span>
          </div>
          <div className="breakdown-row">
            <span>Operating Expenses</span>
            <span className="text-red">-{formatCurrency(metrics.annualOperatingExpenses)}</span>
          </div>
          <div className="breakdown-row highlight">
            <span>Net Operating Income (NOI)</span>
            <span>{formatCurrency(metrics.annualNOI)}</span>
          </div>
          <div className="breakdown-row">
            <span>Debt Service (P&I)</span>
            <span className="text-red">-{formatCurrency(metrics.annualDebtService)}</span>
          </div>
          <div className="breakdown-row total">
            <span>Annual Cash Flow</span>
            <span
              style={{
                color: metrics.annualCashFlow >= 0 ? '#28a745' : '#dc3545',
              }}
            >
              {formatCurrency(metrics.annualCashFlow)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SCENARIOS TAB (with updated projection form)
// ============================================================================

interface ScenariosTabProps {
  scenarios: ScenarioAnalysis | null;
  projections: YearlyProjection[];
  projectionForm: ReturnType<typeof useForm<ProjectionInputs>>;
}

const ScenariosTab = ({ scenarios, projections, projectionForm }: ScenariosTabProps) => {
  if (!scenarios) return null;

  return (
    <div className="tab-content">
      <div className="scenarios-content">
        <h3>Scenario Analysis</h3>

        <div className="scenario-cards">
          <div className="scenario-card best">
            <div className="scenario-header">Best Case (+15%)</div>
            <div className="scenario-metrics">
              <div className="scenario-metric">
                <span>Monthly Cash Flow</span>
                <span>{formatCurrency(scenarios.bestCase.monthlyCashFlow)}</span>
              </div>
              <div className="scenario-metric">
                <span>Cap Rate</span>
                <span>{formatPercent(scenarios.bestCase.capRate)}</span>
              </div>
              <div className="scenario-metric">
                <span>CoC Return</span>
                <span>{formatPercent(scenarios.bestCase.cashOnCashReturn)}</span>
              </div>
            </div>
          </div>

          <div className="scenario-card worst">
            <div className="scenario-header">Worst Case (-10%)</div>
            <div className="scenario-metrics">
              <div className="scenario-metric">
                <span>Monthly Cash Flow</span>
                <span>{formatCurrency(scenarios.worstCase.monthlyCashFlow)}</span>
              </div>
              <div className="scenario-metric">
                <span>Cap Rate</span>
                <span>{formatPercent(scenarios.worstCase.capRate)}</span>
              </div>
              <div className="scenario-metric">
                <span>CoC Return</span>
                <span>{formatPercent(scenarios.worstCase.cashOnCashReturn)}</span>
              </div>
            </div>
          </div>

          <div className="scenario-card realistic">
            <div className="scenario-header">Base Case (Expected)</div>
            <div className="scenario-metrics">
              <div className="scenario-metric">
                <span>Monthly Cash Flow</span>
                <span>{formatCurrency(scenarios.baseCase.monthlyCashFlow)}</span>
              </div>
              <div className="scenario-metric">
                <span>Cap Rate</span>
                <span>{formatPercent(scenarios.baseCase.capRate)}</span>
              </div>
              <div className="scenario-metric">
                <span>CoC Return</span>
                <span>{formatPercent(scenarios.baseCase.cashOnCashReturn)}</span>
              </div>
            </div>
          </div>
        </div>

        <h3 style={{ marginTop: '32px' }}>5-Year Projections</h3>

        {/* Projection Assumptions with Smart Presets */}
        <Form {...projectionForm}>
          <form>
            <GlassFormGrid columns={3}>
              {/* Rent Growth Presets */}
              <FormField
                control={projectionForm.control}
                name="annualRentGrowth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Annual Rent Growth</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value}
                        className="flex h-9 w-full rounded-md border border-glass-border bg-surface-200 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-gray-100"
                      >
                        <option value={2} className="bg-surface-300">Conservative (2%)</option>
                        <option value={3} className="bg-surface-300">Average (3%)</option>
                        <option value={5} className="bg-surface-300">Aggressive (5%)</option>
                      </select>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-400">
                      Conservative: Stabilized markets. Average: National 10-year avg. Aggressive: High-growth Sunbelt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expense Growth Presets */}
              <FormField
                control={projectionForm.control}
                name="annualExpenseGrowth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Annual Expense Growth</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value}
                        className="flex h-9 w-full rounded-md border border-glass-border bg-surface-200 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-gray-100"
                      >
                        <option value={1.5} className="bg-surface-300">Low (1.5%)</option>
                        <option value={2} className="bg-surface-300">Typical (2%)</option>
                        <option value={3} className="bg-surface-300">High (3%)</option>
                      </select>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-400">
                      Account for insurance, taxes, and maintenance cost increases over time
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Appreciation Presets */}
              <FormField
                control={projectionForm.control}
                name="annualAppreciation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Annual Property Appreciation</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value}
                        className="flex h-9 w-full rounded-md border border-glass-border bg-surface-200 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-gray-100"
                      >
                        <option value={3} className="bg-surface-300">Conservative (3%)</option>
                        <option value={4} className="bg-surface-300">Average (4%)</option>
                        <option value={5} className="bg-surface-300">Optimistic (5%)</option>
                        <option value={6} className="bg-surface-300">Aggressive (6%)</option>
                      </select>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-400">
                      Conservative: Long-term safe. Average: Historical avg. Optimistic: Inflation + scarcity. Aggressive: Hot markets
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GlassFormGrid>
          </form>
        </Form>

        {/* Projections Table */}
        <div className="projections-table">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Property Value</th>
                <th>Monthly Rent</th>
                <th>Monthly Cash Flow</th>
                <th>Annual Cash Flow</th>
                <th>Cumulative CF</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((proj) => (
                <tr key={proj.year}>
                  <td>{proj.year}</td>
                  <td>{formatCurrency(proj.propertyValue)}</td>
                  <td>{formatCurrency(proj.monthlyRent)}</td>
                  <td>{formatCurrency(proj.monthlyCashFlow)}</td>
                  <td>{formatCurrency(proj.annualCashFlow)}</td>
                  <td>{formatCurrency(proj.cumulativeCashFlow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DealCalculator;
