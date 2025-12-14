/**
 * DealCalculator V2 - ShadCN Migration
 *
 * Migrated version of DealCalculator using:
 * - ShadCN Tabs for tab navigation (better accessibility)
 * - ShadCN Input + Label via FormInput wrapper (glass styled)
 * - Maintains all existing functionality
 * - Improved keyboard navigation and screen reader support
 */

import { useState, useEffect } from 'react';
import {
  PropertyInputs,
  CalculatedMetrics,
  calculateAllMetrics,
  generateScenarioAnalysis,
  generate5YearProjections,
  formatCurrency,
  formatPercent,
  formatNumber,
  ScenarioAnalysis,
  YearlyProjection
} from '../utils/calculatorUtils';
import { PrintIconButton } from './PrintButton';
import { NumericInput } from '@/components/ui/FormInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import './DealCalculator.css';

export const DealCalculatorV2 = () => {
  // Property inputs state
  const [inputs, setInputs] = useState<PropertyInputs>({
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
    strategy: 'rental'
  });

  // Projection assumptions
  const [projectionInputs, setProjectionInputs] = useState({
    annualRentGrowth: 3,
    annualExpenseGrowth: 2,
    annualAppreciation: 3
  });

  // Calculated metrics
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioAnalysis | null>(null);
  const [projections, setProjections] = useState<YearlyProjection[]>([]);

  // Recalculate metrics whenever inputs change
  useEffect(() => {
    const calculatedMetrics = calculateAllMetrics(inputs);
    setMetrics(calculatedMetrics);

    const scenarioAnalysis = generateScenarioAnalysis(inputs);
    setScenarios(scenarioAnalysis);

    const yearlyProjections = generate5YearProjections(
      inputs,
      calculatedMetrics,
      projectionInputs.annualRentGrowth,
      projectionInputs.annualExpenseGrowth,
      projectionInputs.annualAppreciation
    );
    setProjections(yearlyProjections);
  }, [inputs, projectionInputs]);

  const updateInput = (field: keyof PropertyInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const updateProjectionInput = (field: string, value: number) => {
    setProjectionInputs(prev => ({ ...prev, [field]: value }));
  };

  if (!metrics) return null;

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
            orientation: 'portrait'
          }}
          tooltipText="Print Calculator Results"
        />
      </div>

      {/* ShadCN Tabs - Better accessibility */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="bg-surface-200 border-glass-border w-full grid grid-cols-3 mb-6">
          <TabsTrigger
            value="basic"
            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:shadow-glow-sm transition-all"
          >
            Basic Analysis
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:shadow-glow-sm transition-all"
          >
            Advanced Metrics
          </TabsTrigger>
          <TabsTrigger
            value="scenarios"
            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:shadow-glow-sm transition-all"
          >
            Scenarios & Projections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="calculator-content">
          <BasicAnalysisTabV2
            inputs={inputs}
            metrics={metrics}
            updateInput={updateInput}
          />
        </TabsContent>

        <TabsContent value="advanced" className="calculator-content">
          <AdvancedMetricsTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="scenarios" className="calculator-content">
          <ScenariosTab
            scenarios={scenarios}
            projections={projections}
            projectionInputs={projectionInputs}
            updateProjectionInput={updateProjectionInput}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ============================================
   BASIC ANALYSIS TAB (V2 - ShadCN Migration)
   ============================================ */

interface BasicAnalysisTabProps {
  inputs: PropertyInputs;
  metrics: CalculatedMetrics;
  updateInput: (field: keyof PropertyInputs, value: number | string) => void;
}

const BasicAnalysisTabV2 = ({ inputs, metrics, updateInput }: BasicAnalysisTabProps) => {
  // Tooltip helper component
  const InputTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-violet-400 hover:text-violet-300 transition-colors ml-1"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-surface-300 border-glass-border backdrop-blur-glass max-w-xs">
          <p className="text-xs text-gray-200">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="tab-content">
      <div className="calculator-grid">
        {/* Left Column: Inputs */}
        <div className="input-section">
          {/* Property Information */}
          <div className="input-group">
            <h3 className="text-lg font-semibold text-gray-50 mb-4 flex items-center gap-2">
              Property Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <NumericInput
                  id="purchasePrice"
                  label="Purchase Price"
                  value={inputs.purchasePrice}
                  onChange={(val) => updateInput('purchasePrice', val)}
                  placeholder="0"
                  step="1000"
                  className="flex-1"
                />
                <div className="pt-8">
                  <InputTooltip content="The total purchase price of the property" />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <NumericInput
                  id="downPaymentPercent"
                  label="Down Payment (%)"
                  value={inputs.downPaymentPercent}
                  onChange={(val) => updateInput('downPaymentPercent', val)}
                  placeholder="20"
                  step="1"
                  min="0"
                  max="100"
                  className="flex-1"
                />
                <div className="pt-8">
                  <InputTooltip content="Percentage of purchase price paid upfront (typically 20-25%)" />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <NumericInput
                  id="interestRate"
                  label="Interest Rate (%)"
                  value={inputs.interestRate}
                  onChange={(val) => updateInput('interestRate', val)}
                  placeholder="7.0"
                  step="0.125"
                  className="flex-1"
                />
                <div className="pt-8">
                  <InputTooltip content="Annual interest rate for your mortgage loan" />
                </div>
              </div>

              <NumericInput
                id="loanTerm"
                label="Loan Term (years)"
                value={inputs.loanTerm}
                onChange={(val) => updateInput('loanTerm', val)}
                placeholder="30"
              />

              <NumericInput
                id="closingCosts"
                label="Closing Costs"
                value={inputs.closingCosts}
                onChange={(val) => updateInput('closingCosts', val)}
                placeholder="0"
                step="100"
                helpText="Title, escrow, inspection, and other closing fees"
              />

              <NumericInput
                id="rehabCosts"
                label="Rehab Costs"
                value={inputs.rehabCosts}
                onChange={(val) => updateInput('rehabCosts', val)}
                placeholder="0"
                step="100"
                helpText="Renovation and repair costs before renting"
              />
            </div>
          </div>

          {/* Monthly Income */}
          <div className="input-group mt-6">
            <h3 className="text-lg font-semibold text-gray-50 mb-4">Monthly Income</h3>

            <NumericInput
              id="monthlyRent"
              label="Monthly Rent"
              value={inputs.monthlyRent}
              onChange={(val) => updateInput('monthlyRent', val)}
              placeholder="0"
              step="50"
              helpText="Expected monthly rental income"
            />
          </div>

          {/* Monthly Expenses */}
          <div className="input-group mt-6">
            <h3 className="text-lg font-semibold text-gray-50 mb-4">Monthly Expenses</h3>

            <div className="space-y-4">
              <NumericInput
                id="annualPropertyTax"
                label="Property Tax (Annual)"
                value={inputs.annualPropertyTax}
                onChange={(val) => updateInput('annualPropertyTax', val)}
                placeholder="0"
                step="100"
              />

              <NumericInput
                id="annualInsurance"
                label="Insurance (Annual)"
                value={inputs.annualInsurance}
                onChange={(val) => updateInput('annualInsurance', val)}
                placeholder="0"
                step="50"
              />

              <NumericInput
                id="monthlyHOA"
                label="HOA Fees (Monthly)"
                value={inputs.monthlyHOA}
                onChange={(val) => updateInput('monthlyHOA', val)}
                placeholder="0"
                step="10"
              />

              <NumericInput
                id="monthlyUtilities"
                label="Utilities (Monthly)"
                value={inputs.monthlyUtilities}
                onChange={(val) => updateInput('monthlyUtilities', val)}
                placeholder="0"
                step="10"
              />

              <NumericInput
                id="monthlyMaintenance"
                label="Maintenance (Monthly)"
                value={inputs.monthlyMaintenance}
                onChange={(val) => updateInput('monthlyMaintenance', val)}
                placeholder="0"
                step="10"
                helpText="Estimated monthly maintenance costs (typically 1% of property value annually)"
              />

              <NumericInput
                id="monthlyVacancy"
                label="Vacancy Reserve (Monthly)"
                value={inputs.monthlyVacancy}
                onChange={(val) => updateInput('monthlyVacancy', val)}
                placeholder="0"
                step="10"
                helpText="Set aside funds for periods when property is vacant"
              />

              <NumericInput
                id="monthlyPropertyManagement"
                label="Property Management (Monthly)"
                value={inputs.monthlyPropertyManagement}
                onChange={(val) => updateInput('monthlyPropertyManagement', val)}
                placeholder="0"
                step="10"
                helpText="Typically 8-10% of monthly rent if using a property manager"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Results (keep existing) */}
        <div className="results-section">
          <MetricsDisplay metrics={metrics} />
        </div>
      </div>
    </div>
  );
};

/* ============================================
   METRICS DISPLAY (Keep existing)
   ============================================ */

interface MetricsDisplayProps {
  metrics: CalculatedMetrics;
}

const MetricsDisplay = ({ metrics }: MetricsDisplayProps) => {
  const getDealScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-400 shadow-glow-emerald';
    if (score >= 65) return 'text-blue-400 border-blue-400';
    if (score >= 50) return 'text-yellow-400 border-yellow-400';
    if (score >= 35) return 'text-orange-400 border-orange-400';
    return 'text-red-400 border-red-400';
  };

  const getDealScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Deal';
    if (score >= 65) return 'Good Deal';
    if (score >= 50) return 'Fair Deal';
    if (score >= 35) return 'Poor Deal';
    return 'Avoid';
  };

  return (
    <div className="space-y-4">
      {/* Deal Score Badge */}
      <div className={`deal-score-badge ${getDealScoreColor(metrics.dealScore)}`}>
        <div className="score-value">{metrics.dealScore}</div>
        <div className="score-label">{getDealScoreLabel(metrics.dealScore)}</div>
      </div>

      {/* Monthly Cash Flow */}
      <div className="metric-card">
        <div className="metric-label">Monthly Cash Flow</div>
        <div className={`metric-value ${metrics.monthlyCashFlow >= 0 ? 'positive' : 'negative'}`}>
          {formatCurrency(metrics.monthlyCashFlow)}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Cap Rate</div>
          <div className="metric-value">{formatPercent(metrics.capRate)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Cash on Cash</div>
          <div className="metric-value">{formatPercent(metrics.cashOnCashReturn)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Cash Invested</div>
          <div className="metric-value">{formatCurrency(metrics.totalCashInvested)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Monthly P&I</div>
          <div className="metric-value">{formatCurrency(metrics.monthlyPI)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Cash on Cash</div>
          <div className="metric-value">{formatPercent(metrics.cashOnCashReturn)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">1% Rule</div>
          <div className={`metric-value ${metrics.onePercentRule ? 'positive' : 'negative'}`}>
            {metrics.onePercentRule ? '✓ Pass' : '✗ Fail'}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   ADVANCED METRICS TAB (Keep existing for now)
   ============================================ */

interface AdvancedMetricsTabProps {
  metrics: CalculatedMetrics;
}

const AdvancedMetricsTab = ({ metrics }: AdvancedMetricsTabProps) => {
  return (
    <div className="tab-content">
      <div className="metrics-grid-large">
        <div className="metric-card">
          <div className="metric-label">Gross Rent Multiplier</div>
          <div className="metric-value">{formatNumber(metrics.grm)}</div>
          <div className="metric-description">Lower is better (ideally {'<'} 15)</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Debt Coverage Ratio</div>
          <div className="metric-value">{formatNumber(metrics.debtCoverageRatio)}</div>
          <div className="metric-description">Should be {'>'} 1.25 for commercial</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Break-Even Occupancy</div>
          <div className="metric-value">{formatPercent(metrics.breakEvenOccupancy)}</div>
          <div className="metric-description">Lower is safer (ideally {'<'} 85%)</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Monthly Total Expenses</div>
          <div className="metric-value">{formatCurrency(metrics.monthlyTotalExpenses)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Annual NOI</div>
          <div className="metric-value">{formatCurrency(metrics.annualNOI)}</div>
          <div className="metric-description">Net Operating Income</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Operating Expense Ratio</div>
          <div className="metric-value">{formatPercent(metrics.operatingExpenseRatio)}</div>
          <div className="metric-description">Ideally 35-45% for residential</div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   SCENARIOS TAB (Keep existing for now)
   ============================================ */

interface ScenariosTabProps {
  scenarios: ScenarioAnalysis | null;
  projections: YearlyProjection[];
  projectionInputs: any;
  updateProjectionInput: (field: string, value: number) => void;
}

const ScenariosTab = ({
  scenarios,
  projections,
  projectionInputs,
  updateProjectionInput,
}: ScenariosTabProps) => {
  if (!scenarios) return null;

  return (
    <div className="tab-content">
      <div className="scenarios-grid">
        {/* Best Case */}
        <div className="scenario-card best-case">
          <h3>Best Case Scenario</h3>
          <p className="scenario-description">Optimistic projections (+20% rent, -10% expenses)</p>
          <div className="scenario-metrics">
            <div className="scenario-metric">
              <span>Monthly Cash Flow</span>
              <span className="positive">{formatCurrency(scenarios.bestCase.monthlyCashFlow)}</span>
            </div>
            <div className="scenario-metric">
              <span>Cap Rate</span>
              <span>{formatPercent(scenarios.bestCase.capRate)}</span>
            </div>
            <div className="scenario-metric">
              <span>Cash on Cash</span>
              <span>{formatPercent(scenarios.bestCase.cashOnCashReturn)}</span>
            </div>
          </div>
        </div>

        {/* Base Case */}
        <div className="scenario-card current-case">
          <h3>Base Scenario</h3>
          <p className="scenario-description">Based on your current inputs</p>
          <div className="scenario-metrics">
            <div className="scenario-metric">
              <span>Monthly Cash Flow</span>
              <span className={scenarios.baseCase.monthlyCashFlow >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(scenarios.baseCase.monthlyCashFlow)}
              </span>
            </div>
            <div className="scenario-metric">
              <span>Cap Rate</span>
              <span>{formatPercent(scenarios.baseCase.capRate)}</span>
            </div>
            <div className="scenario-metric">
              <span>Cash on Cash</span>
              <span>{formatPercent(scenarios.baseCase.cashOnCashReturn)}</span>
            </div>
          </div>
        </div>

        {/* Worst Case */}
        <div className="scenario-card worst-case">
          <h3>Worst Case Scenario</h3>
          <p className="scenario-description">Conservative projections (-20% rent, +10% expenses)</p>
          <div className="scenario-metrics">
            <div className="scenario-metric">
              <span>Monthly Cash Flow</span>
              <span className={scenarios.worstCase.monthlyCashFlow >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(scenarios.worstCase.monthlyCashFlow)}
              </span>
            </div>
            <div className="scenario-metric">
              <span>Cap Rate</span>
              <span>{formatPercent(scenarios.worstCase.capRate)}</span>
            </div>
            <div className="scenario-metric">
              <span>Cash on Cash</span>
              <span>{formatPercent(scenarios.worstCase.cashOnCashReturn)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Year Projections */}
      <div className="projections-section">
        <h3>5-Year Projections</h3>

        {/* Projection Assumptions (could be migrated to NumericInput too) */}
        <div className="projection-inputs">
          <div className="projection-input">
            <label>Annual Rent Growth (%)</label>
            <input
              type="number"
              value={projectionInputs.annualRentGrowth}
              onChange={(e) => updateProjectionInput('annualRentGrowth', parseFloat(e.target.value) || 0)}
              step="0.5"
            />
          </div>
          <div className="projection-input">
            <label>Annual Expense Growth (%)</label>
            <input
              type="number"
              value={projectionInputs.annualExpenseGrowth}
              onChange={(e) => updateProjectionInput('annualExpenseGrowth', parseFloat(e.target.value) || 0)}
              step="0.5"
            />
          </div>
          <div className="projection-input">
            <label>Annual Appreciation (%)</label>
            <input
              type="number"
              value={projectionInputs.annualAppreciation}
              onChange={(e) => updateProjectionInput('annualAppreciation', parseFloat(e.target.value) || 0)}
              step="0.5"
            />
          </div>
        </div>

        {/* Projections Table */}
        <div className="projections-table">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Property Value</th>
                <th>Annual Rent</th>
                <th>Annual Expenses</th>
                <th>Cash Flow</th>
                <th>Equity</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((proj) => (
                <tr key={proj.year}>
                  <td>Year {proj.year}</td>
                  <td>{formatCurrency(proj.propertyValue)}</td>
                  <td>{formatCurrency(proj.annualIncome)}</td>
                  <td>{formatCurrency(proj.annualExpenses)}</td>
                  <td className={proj.annualCashFlow >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(proj.annualCashFlow)}
                  </td>
                  <td>{formatCurrency(proj.equity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DealCalculatorV2;
