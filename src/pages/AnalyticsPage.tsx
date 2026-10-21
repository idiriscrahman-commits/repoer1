import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { FullAnalyticsData } from '../types/index.ts';
import { api } from '../services/api.ts';

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981',
  'In Progress': '#3b82f6',
  Pending: '#f59e0b',
  Rejected: '#f43f5e',
};

const CATEGORY_COLORS = [
  '#2563eb',
  '#0d9488',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#ca8a04',
  '#475569',
  '#0284c7',
];

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<FullAnalyticsData | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Chart toggle
  const [timeView, setTimeView] = useState<'monthly' | 'daily'>('monthly');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, catRes] = await Promise.all([
        api.getFullAnalytics({
          startDate: filterStartDate,
          endDate: filterEndDate,
          category: filterCategory,
          status: filterStatus,
          priority: filterPriority,
        }),
        api.getCategories(),
      ]);
      setAnalytics(analyticsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError((err as Error).message || 'Failed to compute analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStartDate, filterEndDate, filterCategory, filterStatus, filterPriority]);

  const handleResetFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterCategory('ALL');
    setFilterStatus('ALL');
    setFilterPriority('ALL');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Computing aggregation pipelines and trend statistics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 bg-white rounded-xl border border-rose-200 text-center">
        <h3 className="text-base font-bold text-slate-900">Analytics Error</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { overview, categoryDistribution, statusDistribution, monthlyTrends, dailyTrends, monthComparison, yearComparison, executiveInsights } = analytics;

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Interactive Analytics Parameters</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Recalculate analytics"
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Calculated Executive Insights Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-5 rounded-xl shadow-sm border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
            Database Aggregation & Analysis Summary
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {executiveInsights.map((insight, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-xs p-3.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-blue-300 uppercase font-semibold block mb-1">
                Metric #{idx + 1}
              </span>
              <p className="leading-relaxed font-medium">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total Sample Records</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{overview.totalActive}</div>
          <span className="text-[11px] text-slate-400">Within selected parameters</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Completion Efficiency</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{overview.completionRate}%</div>
          <span className="text-[11px] text-slate-400">{overview.completedCount} completed reports</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Active Workload Rate</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{overview.pendingWorkloadRate}%</div>
          <span className="text-[11px] text-slate-400">Pending + In Progress queue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Month-over-Month Shift</span>
          <div
            className={`text-2xl font-black mt-1 ${
              overview.monthlyGrowthPercentage > 0
                ? 'text-emerald-600'
                : overview.monthlyGrowthPercentage < 0
                ? 'text-rose-600'
                : 'text-slate-900'
            }`}
          >
            {overview.monthlyGrowthPercentage > 0 ? `+${overview.monthlyGrowthPercentage}%` : `${overview.monthlyGrowthPercentage}%`}
          </div>
          <span className="text-[11px] text-slate-400">{monthComparison.previousPeriodLabel} baseline</span>
        </div>
      </div>

      {/* Time-Based Trends Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Time-Based Trend & Volume Trajectory</h3>
            <p className="text-xs text-slate-500">
              Granular visualization of report intake patterns
            </p>
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
            <button
              onClick={() => setTimeView('monthly')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                timeView === 'monthly' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              12 Months (Monthly)
            </button>
            <button
              onClick={() => setTimeView('daily')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                timeView === 'daily' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              14 Days (Daily)
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timeView === 'monthly' ? monthlyTrends : dailyTrends}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="total" name="Total Volume" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="inProgress" name="In Progress" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Analysis and Status Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown table and percentages */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Category Analysis & Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Relative frequency across business divisions</p>

            <div className="space-y-3">
              {categoryDistribution.map((cat, idx) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.category}</span>
                    <span className="font-bold text-slate-600">
                      {cat.count} reports ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Analysis Comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Status Ratio & Pending Workload</h3>
            <p className="text-xs text-slate-500 mb-4">Pending vs Completed comparative ratios</p>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-emerald-900">Completed</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">{overview.completedCount}</div>
                <span className="text-[11px] text-emerald-600 font-semibold">{overview.completionRate}% of active</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <Clock className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-amber-900">Pending</span>
                <div className="text-2xl font-black text-amber-700 mt-1">{overview.pendingCount}</div>
                <span className="text-[11px] text-amber-600 font-semibold">{calculatePercentage(overview.pendingCount, overview.totalActive)}% of active</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Comparative Period Growth
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Monthly Variance</span>
                  <span className="font-bold text-slate-800">
                    {monthComparison.absoluteChange >= 0 ? `+${monthComparison.absoluteChange}` : monthComparison.absoluteChange} reports
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Annual Variance</span>
                  <span className="font-bold text-slate-800">
                    {yearComparison.absoluteChange >= 0 ? `+${yearComparison.absoluteChange}` : yearComparison.absoluteChange} reports
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}
