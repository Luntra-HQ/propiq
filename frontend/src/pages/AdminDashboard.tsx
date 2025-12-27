import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  BarChart3,
  PieChart,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Fetch all analytics data
  const revenueDashboard = useQuery(api.analytics.getRevenueDashboard);
  const cancellationStats = useQuery(api.cancellations.getCancellationStats);
  const topReferrers = useQuery(api.referrals.getTopReferrers, { limit: 10 });
  const recentCancellations = useQuery(api.cancellations.getRecentCancellations, { limit: 10 });

  if (!revenueDashboard || !cancellationStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const { mrr, subscribers, conversion, churn } = revenueDashboard;

  // Calculate percentages for pie chart
  const total = subscribers.byTier.starter + subscribers.byTier.pro + subscribers.byTier.elite;
  const starterPercent = total > 0 ? (subscribers.byTier.starter / total) * 100 : 0;
  const proPercent = total > 0 ? (subscribers.byTier.pro / total) * 100 : 0;
  const elitePercent = total > 0 ? (subscribers.byTier.elite / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time revenue and subscription metrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Revenue Overview */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-400" />
            Revenue Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total MRR */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-green-500/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total MRR</span>
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">
                ${mrr.total.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">{mrr.currency} / month</div>
            </div>

            {/* Active Paid Subscribers */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-violet-500/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Paid Subscribers</span>
                <Users className="h-5 w-5 text-violet-400" />
              </div>
              <div className="text-3xl font-bold text-violet-400">
                {subscribers.activePaid}
              </div>
              <div className="text-xs text-gray-500 mt-1">{subscribers.total} total users</div>
            </div>

            {/* ARPU */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">ARPU</span>
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">
                ${subscribers.activePaid > 0 ? (mrr.total / subscribers.activePaid).toFixed(2) : '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Average Revenue Per User</div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Conversion Rate</span>
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-400">
                {conversion.rate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {conversion.conversions}/{conversion.signups} (last 30 days)
              </div>
            </div>
          </div>

          {/* MRR by Tier */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4">MRR by Tier</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Starter ($49/mo)</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {subscribers.byTier.starter} users
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  ${mrr.byTier.starter.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Pro ($99/mo)</span>
                  <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded">
                    {subscribers.byTier.pro} users
                  </span>
                </div>
                <div className="text-2xl font-bold text-violet-400">
                  ${mrr.byTier.pro.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Elite ($199/mo)</span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                    {subscribers.byTier.elite} users
                  </span>
                </div>
                <div className="text-2xl font-bold text-amber-400">
                  ${mrr.byTier.elite.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Churn Analytics */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-400" />
            Churn Analytics
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Churn Summary */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4">30-Day Churn Summary</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Cancellations</div>
                  <div className="text-3xl font-bold text-red-400">{churn.count}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">MRR Lost</div>
                  <div className="text-3xl font-bold text-red-400">${churn.mrrLost}</div>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-400 mb-3">Cancellation Reasons</h4>
              <div className="space-y-2">
                {Object.entries(cancellationStats.byReason || {}).map(([reason, stats]) => (
                  <div key={reason} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-300">
                        {reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-xs text-gray-500">${stats.mrrLost} MRR lost</div>
                    </div>
                    <div className="text-lg font-bold text-gray-400">{stats.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Cancellations */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4">Recent Cancellations</h3>
              <div className="space-y-2">
                {recentCancellations && recentCancellations.length > 0 ? (
                  recentCancellations.map((cancellation) => (
                    <div
                      key={cancellation._id}
                      className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300">
                          {cancellation.userEmail || 'Unknown'}
                        </span>
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                          {cancellation.tier}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {cancellation.reason.replace(/_/g, ' ')} • ${cancellation.mrr}/mo
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(cancellation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No recent cancellations
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Subscriber Distribution */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <PieChart className="h-6 w-6 text-violet-400" />
            Subscriber Distribution
          </h2>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Visual Distribution */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Paid Tier Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">Starter</span>
                      <span className="text-sm font-bold text-blue-400">
                        {starterPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${starterPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">Pro</span>
                      <span className="text-sm font-bold text-violet-400">
                        {proPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div
                        className="bg-violet-500 h-2 rounded-full transition-all"
                        style={{ width: `${proPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">Elite</span>
                      <span className="text-sm font-bold text-amber-400">
                        {elitePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{ width: `${elitePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Numbers */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Total Users</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-gray-500 mb-1">Free</div>
                    <div className="text-2xl font-bold text-gray-400">
                      {subscribers.byTier.free}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-gray-500 mb-1">Starter</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {subscribers.byTier.starter}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-gray-500 mb-1">Pro</div>
                    <div className="text-2xl font-bold text-violet-400">
                      {subscribers.byTier.pro}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-gray-500 mb-1">Elite</div>
                    <div className="text-2xl font-bold text-amber-400">
                      {subscribers.byTier.elite}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Referrers */}
        {topReferrers && topReferrers.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-amber-400" />
              Top Referrers
            </h2>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="space-y-2">
                {topReferrers.map((referrer, index) => (
                  <div
                    key={referrer.userId}
                    className="flex items-center gap-4 bg-slate-900/50 rounded-lg p-4 border border-slate-700"
                  >
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-300">{referrer.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{referrer.email}</div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-lg font-bold text-gray-400">{referrer.total}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Converted</div>
                        <div className="text-lg font-bold text-green-400">{referrer.converted}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Rewarded</div>
                        <div className="text-lg font-bold text-amber-400">{referrer.rewarded}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
