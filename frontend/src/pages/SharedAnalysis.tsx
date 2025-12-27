import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Home, TrendingUp, DollarSign, Target, ArrowRight, AlertCircle } from 'lucide-react';

export const SharedAnalysis: React.FC = () => {
  // Extract shareToken from URL path manually (no react-router)
  const shareToken = window.location.pathname.split('/a/')[1];

  const result = useQuery(api.sharing.getPublicAnalysis, shareToken ? { shareToken } : 'skip');

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!result.found || !result.analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl shadow-lg p-8 max-w-md text-center border border-slate-700">
          <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analysis Not Found</h2>
          <p className="text-gray-400 mb-6">
            This analysis link is invalid or has been made private.
          </p>
          <a
            href="https://propiq.luntra.one"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-all"
          >
            Go to PropIQ
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  const { analysis } = result;

  // Parse analysisResult if it's JSON
  let parsedAnalysis: any = {};
  try {
    parsedAnalysis = JSON.parse(analysis.analysisResult);
  } catch (e) {
    parsedAnalysis = { summary: analysis.analysisResult };
  }

  // Deal score color
  let scoreColor = 'text-gray-400';
  let scoreBgColor = 'bg-gray-500/20';
  if (analysis.dealScore >= 80) {
    scoreColor = 'text-green-400';
    scoreBgColor = 'bg-green-500/20';
  } else if (analysis.dealScore >= 65) {
    scoreColor = 'text-blue-400';
    scoreBgColor = 'bg-blue-500/20';
  } else if (analysis.dealScore >= 50) {
    scoreColor = 'text-amber-400';
    scoreBgColor = 'bg-amber-500/20';
  } else {
    scoreColor = 'text-red-400';
    scoreBgColor = 'bg-red-500/20';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">PropIQ Analysis</h1>
              <p className="text-xs text-gray-400">AI-Powered Property Investment Analysis</p>
            </div>
          </div>
          <a
            href="https://propiq.luntra.one"
            className="px-4 py-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            Get PropIQ →
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Property Header */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{analysis.address}</h2>
              <p className="text-gray-400">
                {[analysis.city, analysis.state, analysis.zipCode].filter(Boolean).join(', ')}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${scoreBgColor}`}>
              <div className="text-xs text-gray-400 mb-1">Deal Score</div>
              <div className={`text-3xl font-bold ${scoreColor}`}>{analysis.dealScore}/100</div>
            </div>
          </div>

          {/* Financial Details */}
          {(analysis.purchasePrice || analysis.monthlyRent || analysis.downPayment) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
              {analysis.purchasePrice && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Purchase Price</div>
                  <div className="text-lg font-bold text-white">
                    ${analysis.purchasePrice.toLocaleString()}
                  </div>
                </div>
              )}
              {analysis.monthlyRent && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Monthly Rent</div>
                  <div className="text-lg font-bold text-white">
                    ${analysis.monthlyRent.toLocaleString()}/mo
                  </div>
                </div>
              )}
              {analysis.downPayment && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Down Payment</div>
                  <div className="text-lg font-bold text-white">
                    ${analysis.downPayment.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Recommendation */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-bold text-white">AI Recommendation</h3>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{analysis.aiRecommendation}</p>
        </div>

        {/* Analysis Summary */}
        {parsedAnalysis.summary && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Investment Summary</h3>
            </div>
            <div className="text-gray-300 whitespace-pre-wrap">{parsedAnalysis.summary}</div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-xl p-8 border border-violet-500/30 text-center">
          <div className="w-16 h-16 bg-violet-500 rounded-xl mx-auto flex items-center justify-center mb-4">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Want to analyze your own deals?</h3>
          <p className="text-gray-300 mb-6">
            Get 3 free AI-powered property analyses with PropIQ
          </p>
          <a
            href="https://propiq.luntra.one"
            className="inline-flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-violet-500/30"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <a
              href="https://propiq.luntra.one"
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              PropIQ
            </a>
            {' '} - AI Property Investment Analysis
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Analysis created on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedAnalysis;
