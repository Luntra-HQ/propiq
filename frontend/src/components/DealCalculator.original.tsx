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
import './DealCalculator.css';

type TabType = 'basic' | 'advanced' | 'scenarios';

export const DealCalculator = () => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');

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

      {/* Tab Navigation */}
      <div className="calculator-tabs">
        <button
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Analysis
        </button>
        <button
          className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced Metrics
        </button>
        <button
          className={`tab-button ${activeTab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenarios')}
        >
          Scenarios & Projections
        </button>
      </div>

      {/* Tab Content */}
      <div className="calculator-content">
        {activeTab === 'basic' && (
          <BasicAnalysisTab
            inputs={inputs}
            metrics={metrics}
            updateInput={updateInput}
          />
        )}
        {activeTab === 'advanced' && (
          <AdvancedMetricsTab metrics={metrics} />
        )}
        {activeTab === 'scenarios' && (
          <ScenariosTab
            scenarios={scenarios}
            projections={projections}
            projectionInputs={projectionInputs}
            updateProjectionInput={updateProjectionInput}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================
   BASIC ANALYSIS TAB
   ============================================ */

interface BasicAnalysisTabProps {
  inputs: PropertyInputs;
  metrics: CalculatedMetrics;
  updateInput: (field: keyof PropertyInputs, value: number | string) => void;
}

const BasicAnalysisTab = ({ inputs, metrics, updateInput }: BasicAnalysisTabProps) => {
  return (
    <div className="tab-content">
      <div className="calculator-grid">
        {/* Left Column: Inputs */}
        <div className="input-section">
          {/* Property Information */}
          <div className="input-group">
            <h3>Property Information</h3>

            <div className="input-field">
              <label htmlFor="purchasePrice">Purchase Price</label>
              <input
                id="purchasePrice"
                type="number"
                value={inputs.purchasePrice || ''}
                placeholder="0"
                onChange={(e) => updateInput('purchasePrice', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="1000"
                aria-label="Purchase Price in dollars"
              />
            </div>

            <div className="input-field">
              <label htmlFor="downPaymentPercent">Down Payment (%)</label>
              <input
                id="downPaymentPercent"
                type="number"
                value={inputs.downPaymentPercent || ''}
                placeholder="20"
                onChange={(e) => updateInput('downPaymentPercent', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="1"
                min="0"
                max="100"
                aria-label="Down Payment Percentage"
              />
            </div>

            <div className="input-field">
              <label htmlFor="interestRate">Interest Rate (%)</label>
              <input
                id="interestRate"
                type="number"
                value={inputs.interestRate || ''}
                placeholder="7.0"
                onChange={(e) => updateInput('interestRate', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="0.125"
                aria-label="Interest Rate Percentage"
              />
            </div>

            <div className="input-field">
              <label htmlFor="loanTerm">Loan Term (years)</label>
              <input
                id="loanTerm"
                type="number"
                value={inputs.loanTerm || ''}
                placeholder="30"
                onChange={(e) => updateInput('loanTerm', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                aria-label="Loan Term in years"
              />
            </div>

            <div className="input-field">
              <label htmlFor="closingCosts">Closing Costs</label>
              <input
                id="closingCosts"
                type="number"
                value={inputs.closingCosts || ''}
                placeholder="0"
                onChange={(e) => updateInput('closingCosts', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="100"
                aria-label="Closing Costs in dollars"
              />
            </div>

            <div className="input-field">
              <label htmlFor="rehabCosts">Rehab Costs</label>
              <input
                id="rehabCosts"
                type="number"
                value={inputs.rehabCosts || ''}
                placeholder="0"
                onChange={(e) => updateInput('rehabCosts', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="100"
                aria-label="Rehab Costs in dollars"
              />
            </div>
          </div>

          {/* Monthly Income */}
          <div className="input-group">
            <h3>Monthly Income</h3>

            <div className="input-field">
              <label htmlFor="monthlyRent">Monthly Rent</label>
              <input
                id="monthlyRent"
                type="number"
                value={inputs.monthlyRent || ''}
                placeholder="0"
                onChange={(e) => updateInput('monthlyRent', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="50"
                aria-label="Monthly Rent in dollars"
              />
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="input-group">
            <h3>Monthly Expenses</h3>

            <div className="input-field">
              <label htmlFor="annualPropertyTax">Property Tax (Annual)</label>
              <input
                id="annualPropertyTax"
                type="number"
                value={inputs.annualPropertyTax || ''}
                placeholder="0"
                onChange={(e) => updateInput('annualPropertyTax', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="100"
                aria-label="Annual Property Tax in dollars"
              />
            </div>

            <div className="input-field">
              <label htmlFor="annualInsurance">Insurance (Annual)</label>
              <input
                id="annualInsurance"
                type="number"
                value={inputs.annualInsurance || ''}
                placeholder="0"
                onChange={(e) => updateInput('annualInsurance', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="50"
                aria-label="Annual Insurance in dollars"
              />
            </div>

            <div className="input-field">
              <label htmlFor="monthlyHOA">HOA Fees (Monthly)</label>
              <input
                id="monthlyHOA"
                type="number"
                value={inputs.monthlyHOA || ''}
                placeholder="0"
                onChange={(e) => updateInput('monthlyHOA', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="10"
                aria-label="Monthly HOA Fees in dollars"
              />
            </div>

            <div className="input-field">
              <label htmlFor="monthlyUtilities">Utilities (Monthly)</label>
              <input
                id="monthlyUtilities"
                type="number"
                value={inputs.monthlyUtilities || ''}
                placeholder="0"
                onChange={(e) => updateInput('monthlyUtilities', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="10"
                aria-label="Monthly Utilities in dollars"
              />
            </div>

            <div className="input-field">
              <label htmlFor="monthlyMaintenance">Maintenance (Monthly)</label>
              <input
                id="monthlyMaintenance"
                type="number"
                value={inputs.monthlyMaintenance || ''}
                placeholder="0"
                onChange={(e) => updateInput('monthlyMaintenance', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="10"
                aria-label="Monthly Maintenance in dollars"
              />
            </div>

            <div className="input-field">
              <label htmlFor="monthlyVacancy">Vacancy Reserve (Monthly)</label>
              <input
                id="monthlyVacancy"
                type="number"
                value={inputs.monthlyVacancy || ''}
                placeholder="0"
                onChange={(e) => updateInput('monthlyVacancy', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="10"
                aria-label="Monthly Vacancy Reserve in dollars"
              />
            </div>

            <div className="input-field">
              <label htmlFor="monthlyPropertyManagement">Property Management (Monthly)</label>
              <input
                id="monthlyPropertyManagement"
                type="number"
                value={inputs.monthlyPropertyManagement || ''}
                placeholder="0"
                onChange={(e) => updateInput('monthlyPropertyManagement', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                step="10"
                aria-label="Monthly Property Management in dollars"
              />
            </div>
          </div>

          {/* Investment Strategy */}
          <div className="input-group">
            <h3>Investment Strategy</h3>

            <div className="input-field">
              <label htmlFor="strategy">Strategy Type</label>
              <select
                id="strategy"
                value={inputs.strategy}
                onChange={(e) => updateInput('strategy', e.target.value as PropertyInputs['strategy'])}
                aria-label="Investment Strategy Type"
              >
                <option value="rental">Traditional Rental</option>
                <option value="houseHack">House Hack</option>
                <option value="brrrr">BRRRR</option>
                <option value="fixFlip">Fix & Flip</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="results-section">
          {/* Deal Score */}
          <div className="deal-score-card">
            <h3>Deal Score</h3>
            <div className="score-display">
              <div className="score-circle" data-rating={metrics.dealRating.toLowerCase()}>
                <span className="score-value">{metrics.dealScore}</span>
                <span className="score-max">/100</span>
              </div>
              <div className="score-details">
                <div className={`rating-badge ${metrics.dealRating.toLowerCase()}`}>
                  {metrics.dealRating}
                </div>
                <p className="recommendation">{metrics.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Monthly Cash Flow */}
          <div className="results-group">
            <h3>Monthly Analysis</h3>

            <div className="metric-row">
              <span className="metric-label">Gross Monthly Income</span>
              <span className="metric-value">{formatCurrency(inputs.monthlyRent)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">P&I Payment</span>
              <span className="metric-value">{formatCurrency(metrics.monthlyPI)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">PITI Payment</span>
              <span className="metric-value">{formatCurrency(metrics.monthlyPITI)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Total Monthly Expenses</span>
              <span className="metric-value">{formatCurrency(metrics.monthlyTotalExpenses)}</span>
            </div>

            <div className="metric-row highlight">
              <span className="metric-label">Monthly Cash Flow</span>
              <span className={`metric-value ${metrics.monthlyCashFlow >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(metrics.monthlyCashFlow)}
              </span>
            </div>
          </div>

          {/* Annual Analysis */}
          <div className="results-group">
            <h3>Annual Analysis</h3>

            <div className="metric-row">
              <span className="metric-label">Gross Annual Income</span>
              <span className="metric-value">{formatCurrency(metrics.annualGrossIncome)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Operating Expenses</span>
              <span className="metric-value">{formatCurrency(metrics.annualOperatingExpenses)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Net Operating Income</span>
              <span className="metric-value">{formatCurrency(metrics.annualNOI)}</span>
            </div>

            <div className="metric-row highlight">
              <span className="metric-label">Annual Cash Flow</span>
              <span className={`metric-value ${metrics.annualCashFlow >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(metrics.annualCashFlow)}
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="results-group">
            <h3>Key Investment Metrics</h3>

            <div className="metric-row">
              <span className="metric-label">Total Cash Invested</span>
              <span className="metric-value">{formatCurrency(metrics.totalCashInvested)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Cap Rate</span>
              <span className="metric-value">{formatPercent(metrics.capRate)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Cash-on-Cash Return</span>
              <span className="metric-value">{formatPercent(metrics.cashOnCashReturn)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">1% Rule</span>
              <span className="metric-value">{formatPercent(metrics.onePercentRule)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   ADVANCED METRICS TAB
   ============================================ */

interface AdvancedMetricsTabProps {
  metrics: CalculatedMetrics;
}

const AdvancedMetricsTab = ({ metrics }: AdvancedMetricsTabProps) => {
  return (
    <div className="tab-content">
      <div className="advanced-metrics-grid">
        {/* Investment Analysis */}
        <div className="metric-card">
          <h3>Investment Analysis</h3>

          <div className="metric-item">
            <label>Loan Amount</label>
            <span className="value">{formatCurrency(metrics.loanAmount)}</span>
          </div>

          <div className="metric-item">
            <label>Total Cash Invested</label>
            <span className="value">{formatCurrency(metrics.totalCashInvested)}</span>
          </div>

          <div className="metric-item">
            <label>Cap Rate</label>
            <span className="value">{formatPercent(metrics.capRate)}</span>
            <span className="hint">Target: 8-10%</span>
          </div>

          <div className="metric-item">
            <label>Cash-on-Cash Return</label>
            <span className="value">{formatPercent(metrics.cashOnCashReturn)}</span>
            <span className="hint">Target: 10-12%</span>
          </div>

          <div className="metric-item">
            <label>1% Rule</label>
            <span className="value">{formatPercent(metrics.onePercentRule)}</span>
            <span className="hint">Target: ≥1.0%</span>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="metric-card">
          <h3>Operational Metrics</h3>

          <div className="metric-item">
            <label>Gross Rent Multiplier (GRM)</label>
            <span className="value">{formatNumber(metrics.grm, 2)}</span>
            <span className="hint">Lower is better</span>
          </div>

          <div className="metric-item">
            <label>Debt Coverage Ratio (DCR)</label>
            <span className="value">{formatNumber(metrics.debtCoverageRatio, 2)}</span>
            <span className="hint">Target: ≥1.25</span>
          </div>

          <div className="metric-item">
            <label>Operating Expense Ratio</label>
            <span className="value">{formatPercent(metrics.operatingExpenseRatio)}</span>
            <span className="hint">Target: 35-45%</span>
          </div>

          <div className="metric-item">
            <label>Break-Even Occupancy</label>
            <span className="value">{formatPercent(metrics.breakEvenOccupancy)}</span>
            <span className="hint">Lower is better</span>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="metric-card">
          <h3>Monthly Breakdown</h3>

          <div className="metric-item">
            <label>Principal & Interest</label>
            <span className="value">{formatCurrency(metrics.monthlyPI)}</span>
          </div>

          <div className="metric-item">
            <label>PITI (P+I+T+I)</label>
            <span className="value">{formatCurrency(metrics.monthlyPITI)}</span>
          </div>

          <div className="metric-item">
            <label>Total Monthly Expenses</label>
            <span className="value">{formatCurrency(metrics.monthlyTotalExpenses)}</span>
          </div>

          <div className="metric-item highlight">
            <label>Monthly Cash Flow</label>
            <span className={`value ${metrics.monthlyCashFlow >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(metrics.monthlyCashFlow)}
            </span>
          </div>
        </div>

        {/* Annual Breakdown */}
        <div className="metric-card">
          <h3>Annual Breakdown</h3>

          <div className="metric-item">
            <label>Gross Annual Income</label>
            <span className="value">{formatCurrency(metrics.annualGrossIncome)}</span>
          </div>

          <div className="metric-item">
            <label>Operating Expenses</label>
            <span className="value">{formatCurrency(metrics.annualOperatingExpenses)}</span>
          </div>

          <div className="metric-item">
            <label>Net Operating Income (NOI)</label>
            <span className="value">{formatCurrency(metrics.annualNOI)}</span>
          </div>

          <div className="metric-item">
            <label>Annual Debt Service</label>
            <span className="value">{formatCurrency(metrics.annualDebtService)}</span>
          </div>

          <div className="metric-item highlight">
            <label>Annual Cash Flow</label>
            <span className={`value ${metrics.annualCashFlow >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(metrics.annualCashFlow)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   SCENARIOS & PROJECTIONS TAB
   ============================================ */

interface ScenariosTabProps {
  scenarios: ScenarioAnalysis | null;
  projections: YearlyProjection[];
  projectionInputs: { annualRentGrowth: number; annualExpenseGrowth: number; annualAppreciation: number };
  updateProjectionInput: (field: string, value: number) => void;
}

const ScenariosTab = ({ scenarios, projections, projectionInputs, updateProjectionInput }: ScenariosTabProps) => {
  if (!scenarios) return null;

  return (
    <div className="tab-content">
      {/* Scenario Analysis */}
      <div className="scenarios-section">
        <h3>Scenario Analysis</h3>
        <p className="section-description">
          Compare best case (+10% rent, -5% expenses) vs worst case (-10% rent, +10% expenses)
        </p>

        <div className="scenario-comparison">
          <div className="scenario-card">
            <h4>Best Case</h4>
            <div className="scenario-metrics">
              <div className="metric">
                <label>Monthly Cash Flow</label>
                <span className="value positive">{formatCurrency(scenarios.bestCase.monthlyCashFlow)}</span>
              </div>
              <div className="metric">
                <label>Cap Rate</label>
                <span className="value">{formatPercent(scenarios.bestCase.capRate)}</span>
              </div>
              <div className="metric">
                <label>CoC Return</label>
                <span className="value">{formatPercent(scenarios.bestCase.cashOnCashReturn)}</span>
              </div>
              <div className="metric">
                <label>Deal Score</label>
                <span className="value">{scenarios.bestCase.dealScore}/100</span>
              </div>
            </div>
          </div>

          <div className="scenario-card base">
            <h4>Base Case</h4>
            <div className="scenario-metrics">
              <div className="metric">
                <label>Monthly Cash Flow</label>
                <span className={`value ${scenarios.baseCase.monthlyCashFlow >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(scenarios.baseCase.monthlyCashFlow)}
                </span>
              </div>
              <div className="metric">
                <label>Cap Rate</label>
                <span className="value">{formatPercent(scenarios.baseCase.capRate)}</span>
              </div>
              <div className="metric">
                <label>CoC Return</label>
                <span className="value">{formatPercent(scenarios.baseCase.cashOnCashReturn)}</span>
              </div>
              <div className="metric">
                <label>Deal Score</label>
                <span className="value">{scenarios.baseCase.dealScore}/100</span>
              </div>
            </div>
          </div>

          <div className="scenario-card">
            <h4>Worst Case</h4>
            <div className="scenario-metrics">
              <div className="metric">
                <label>Monthly Cash Flow</label>
                <span className={`value ${scenarios.worstCase.monthlyCashFlow >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(scenarios.worstCase.monthlyCashFlow)}
                </span>
              </div>
              <div className="metric">
                <label>Cap Rate</label>
                <span className="value">{formatPercent(scenarios.worstCase.capRate)}</span>
              </div>
              <div className="metric">
                <label>CoC Return</label>
                <span className="value">{formatPercent(scenarios.worstCase.cashOnCashReturn)}</span>
              </div>
              <div className="metric">
                <label>Deal Score</label>
                <span className="value">{scenarios.worstCase.dealScore}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Year Projections */}
      <div className="projections-section">
        <h3>5-Year Financial Projections</h3>

        {/* Projection Assumptions */}
        <div className="projection-inputs">
          <div className="projection-input">
            <label>Annual Rent Growth (%)</label>
            <input
              type="number"
              value={projectionInputs.annualRentGrowth || ''}
              placeholder="3.0"
              onChange={(e) => updateProjectionInput('annualRentGrowth', parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              step="0.5"
            />
          </div>
          <div className="projection-input">
            <label>Annual Expense Growth (%)</label>
            <input
              type="number"
              value={projectionInputs.annualExpenseGrowth || ''}
              placeholder="2.0"
              onChange={(e) => updateProjectionInput('annualExpenseGrowth', parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              step="0.5"
            />
          </div>
          <div className="projection-input">
            <label>Annual Appreciation (%)</label>
            <input
              type="number"
              value={projectionInputs.annualAppreciation || ''}
              placeholder="3.0"
              onChange={(e) => updateProjectionInput('annualAppreciation', parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
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
                <th>Monthly Rent</th>
                <th>Annual Income</th>
                <th>Annual Expenses</th>
                <th>Cash Flow</th>
                <th>Property Value</th>
                <th>Equity</th>
                <th>Cumulative CF</th>
                <th>Total Return</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((proj) => (
                <tr key={proj.year}>
                  <td>Year {proj.year}</td>
                  <td>{formatCurrency(proj.monthlyRent)}</td>
                  <td>{formatCurrency(proj.annualIncome)}</td>
                  <td>{formatCurrency(proj.annualExpenses)}</td>
                  <td className={proj.annualCashFlow >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(proj.annualCashFlow)}
                  </td>
                  <td>{formatCurrency(proj.propertyValue)}</td>
                  <td>{formatCurrency(proj.equity)}</td>
                  <td className={proj.cumulativeCashFlow >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(proj.cumulativeCashFlow)}
                  </td>
                  <td className={proj.totalReturn >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(proj.totalReturn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
