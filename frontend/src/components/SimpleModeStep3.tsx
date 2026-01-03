import { Button } from '@/components/ui/Button';
import {
  calculateAllMetrics,
  calculateSimpleModeVerdict,
  VERDICT_COPY,
  formatCurrency,
  formatPercent,
  getRedFlags,
  getGreenLights,
  type PropertyInputs,
  type CalculatedMetrics,
} from '@/utils/calculatorUtils';

interface SimpleModeStep3Props {
  purchasePrice: number;
  downPaymentPercent: number;
  monthlyRent: number;
  monthlyExpenses: number;
  onBack: () => void;
  onStartOver: () => void;
  onAdvancedMode?: () => void;
}

export const SimpleModeStep3 = ({
  purchasePrice,
  downPaymentPercent,
  monthlyRent,
  monthlyExpenses,
  onBack,
  onStartOver,
  onAdvancedMode,
}: SimpleModeStep3Props) => {
  // Build property inputs for calculation
  const propertyInputs: PropertyInputs = {
    purchasePrice,
    downPaymentPercent,
    interestRate: 7.5, // Default assumption for simple mode
    loanTerm: 30,
    monthlyRent,
    annualPropertyTax: purchasePrice * 0.01, // 1% assumption
    annualInsurance: purchasePrice * 0.005, // 0.5% assumption
    monthlyHOA: 0,
    monthlyUtilities: 0,
    monthlyMaintenance: monthlyExpenses,
    monthlyVacancy: monthlyRent * 0.08, // 8% vacancy assumption
    monthlyCapEx: 0,
    closingCosts: purchasePrice * 0.03,
    rehabCosts: 0,
    strategy: 'buy-hold',
    marketTier: 'B', // Default assumption
  };

  // Calculate metrics
  const metrics: CalculatedMetrics = calculateAllMetrics(propertyInputs);
  const verdict = calculateSimpleModeVerdict(metrics);
  const verdictData = VERDICT_COPY[verdict];
  const redFlags = getRedFlags(metrics);
  const greenLights = getGreenLights(metrics);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Verdict Header */}
      <div
        className="text-center space-y-4 p-8 rounded-2xl border-2 animate-in zoom-in duration-500"
        style={{
          borderColor: verdictData.color,
          background: `linear-gradient(135deg, ${verdictData.color}10, ${verdictData.color}05)`,
        }}
      >
        <div className="text-6xl mb-2">{verdictData.emoji}</div>
        <h2 className="text-3xl font-bold text-gray-100">{verdictData.headline}</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">{verdictData.message}</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-200/80 backdrop-blur-sm border border-glass-border rounded-xl p-5 space-y-2">
          <div className="text-sm text-gray-400 uppercase tracking-wide">Deal Score</div>
          <div className="text-3xl font-bold text-primary">{metrics.dealScore}/100</div>
        </div>

        <div className="bg-surface-200/80 backdrop-blur-sm border border-glass-border rounded-xl p-5 space-y-2">
          <div className="text-sm text-gray-400 uppercase tracking-wide">Monthly Cash Flow</div>
          <div
            className="text-3xl font-bold"
            style={{ color: metrics.monthlyCashFlow >= 0 ? '#28a745' : '#dc3545' }}
          >
            {formatCurrency(metrics.monthlyCashFlow)}
          </div>
        </div>

        <div className="bg-surface-200/80 backdrop-blur-sm border border-glass-border rounded-xl p-5 space-y-2">
          <div className="text-sm text-gray-400 uppercase tracking-wide">Cash-on-Cash Return</div>
          <div className="text-3xl font-bold text-gray-100">{formatPercent(metrics.cashOnCashReturn)}</div>
        </div>

        <div className="bg-surface-200/80 backdrop-blur-sm border border-glass-border rounded-xl p-5 space-y-2">
          <div className="text-sm text-gray-400 uppercase tracking-wide">Cap Rate</div>
          <div className="text-3xl font-bold text-gray-100">{formatPercent(metrics.capRate)}</div>
        </div>
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 animate-in fade-in duration-300">
          <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>Warning Signs</span>
          </h4>
          <ul className="space-y-2">
            {redFlags.map((flag, i) => (
              <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>{flag.replace(/^[⚠️🚨]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Green Lights */}
      {greenLights.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 animate-in fade-in duration-300">
          <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span>Deal Strengths</span>
          </h4>
          <ul className="space-y-2">
            {greenLights.map((light, i) => (
              <li key={i} className="text-sm text-emerald-300 flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>{light.replace(/^✅\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Section */}
      {onAdvancedMode && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 space-y-3 animate-in fade-in duration-500">
          <h4 className="text-primary font-semibold text-lg">Want More Details?</h4>
          <p className="text-gray-300 text-sm">
            {verdictData.cta}. Switch to Advanced Mode for 5-year projections, scenario analysis, tax benefits, and more.
          </p>
          <Button
            onClick={onAdvancedMode}
            className="w-full"
            variant="default"
          >
            Switch to Advanced Mode
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={onStartOver} variant="default" className="flex-1">
          Analyze Another Property
        </Button>
      </div>
    </div>
  );
};
