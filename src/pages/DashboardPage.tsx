import React, { useEffect, useState } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Filter,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FullAnalyticsData, ReportItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { PriorityBadge } from '../components/ui/PriorityBadge.tsx';

interface Props {
  onNavigateAddReport: () => void;
  onNavigateAllReports: () => void;
  onSelectReport: (report: ReportItem) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981', // Emerald
  'In Progress': '#3b82f6', // Blue
  Pending: '#f59e0b', // Amber
  Rejected: '#f43f5e', // Rose
};

export const DashboardPage: React.FC<Props> = ({
  onNavigateAddReport,
  onNavigateAllReports,
  onSelectReport,
}) => {
  const [analytics, setAnalytics] = useState<FullAnalyticsData | null>(null);
  const [recentReports, setRecentReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '30d' | '90d' | 'this_year'>('all');

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams: Record<string, string> = {};
      if (dateFilter === '30d') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        filterParams.startDate = d.toISOString().substring(0, 10);
      } else if (dateFilter === '90d') {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        filterParams.startDate = d.toISOString().substring(0, 10);
      } else if (dateFilter === 'this_year') {
        filterParams.startDate = `${new Date().getFullYear()}-01-01`;
      }

      const [analyticsRes, reportsRes] = await Promise.all([
        api.getFullAnalytics(filterParams),
        api.getReports({ limit: 6, archived: false, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      setAnalytics(analyticsRes.data);
      setRecentReports(reportsRes.data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [dateFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Calculating real-time analytics from database...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 bg-white rounded-xl border border-rose-200 shadow-sm text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Unable to load dashboard</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { overview, categoryDistribution, statusDistribution, monthlyTrends, monthComparison, yearComparison } = analytics;

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Active Scope:</span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                dateFilter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('30d')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                dateFilter === '30d' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateFilter('90d')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                dateFilter === '90d' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => setDateFilter('this_year')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                dateFilter === 'this_year' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Year
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadDashboardData}
            title="Refresh database metrics"
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition cursor-pointer"
            aria-label="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateAddReport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Report</span>
          </button>
        </div>
      </div>

      {/* 9 Requested Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Active */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Active Reports</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">{overview.totalActive}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">{overview.totalArchived} archived in repository</p>
          </div>
        </div>

        {/* Created Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Created Today</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">{overview.createdToday}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Last 24 hours</p>
          </div>
        </div>

        {/* Created This Week */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Created This Week</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">{overview.createdThisWeek}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Past 7 days volume</p>
          </div>
        </div>

        {/* Created This Month */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Created This Month</span>
            <CalendarDays className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">{overview.createdThisMonth}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Current calendar month</p>
          </div>
        </div>

        {/* Monthly Growth % */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Monthly Growth</span>
            {overview.monthlyGrowthPercentage >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="mt-2">
            <span
              className={`text-2xl font-black ${
                overview.monthlyGrowthPercentage > 0
                  ? 'text-emerald-600'
                  : overview.monthlyGrowthPercentage < 0
                  ? 'text-rose-600'
                  : 'text-slate-900'
              }`}
            >
              {overview.monthlyGrowthPercentage > 0 ? `+${overview.monthlyGrowthPercentage}%` : `${overview.monthlyGrowthPercentage}%`}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">vs Previous Month</p>
          </div>
        </div>
      </div>

      {/* Status Breakdown Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>Pending Reports</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{overview.pendingCount}</div>
          <span className="text-[11px] text-amber-700/80 font-medium">Awaiting initial review</span>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
            <span>In-Progress Reports</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1">{overview.inProgressCount}</div>
          <span className="text-[11px] text-blue-700/80 font-medium">Active investigation</span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>Completed Reports</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{overview.completedCount}</div>
          <span className="text-[11px] text-emerald-700/80 font-medium">{overview.completionRate}% completion rate</span>
        </div>

        <div className="bg-rose-50/60 border border-rose-200 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
            <span>Rejected Reports</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1">{overview.rejectedCount}</div>
          <span className="text-[11px] text-rose-700/80 font-medium">Disapproved or invalid</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Report Activity (12-Month Volume)</h3>
              <p className="text-xs text-slate-500">Distribution of created reports by status over time</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" />
                <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#3b82f6" />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" />
                <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Report Status Breakdown</h3>
            <p className="text-xs text-slate-500">Current active workload allocation</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} reports`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {statusDistribution.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[s.status] || '#94a3b8' }}
                  />
                  {s.status}:
                </span>
                <span className="font-bold text-slate-800">{s.count} ({s.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparisons and Category Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Comparison Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Comparison</h3>
              <p className="text-xs text-slate-500">Volume distribution across organizational categories</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 11, fill: '#334155' }}
                  width={110}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} reports`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Period Comparisons & Dynamic Insights Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Period Comparisons & Insights</h3>
            <p className="text-xs text-slate-500">Calculated growth metrics from database</p>
          </div>

          <div className="space-y-4 my-4">
            {/* Month-over-Month */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="font-semibold">Month-over-Month</span>
                <span className="font-bold text-slate-800">
                  {monthComparison.currentCount} vs {monthComparison.previousCount}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {monthComparison.summarySentence}
              </p>
            </div>

            {/* Year-over-Year */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="font-semibold">Year-over-Year</span>
                <span className="font-bold text-slate-800">
                  {yearComparison.currentCount} vs {yearComparison.previousCount}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {yearComparison.summarySentence}
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
              Active Executive Summary
            </span>
            <p className="text-xs text-blue-950 leading-relaxed">
              {analytics.executiveInsights[1] || analytics.executiveInsights[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Reports</h3>
            <p className="text-xs text-slate-500">Latest active records logged into system</p>
          </div>
          <button
            onClick={onNavigateAllReports}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            <span>View All Repository</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentReports.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">No active reports found</p>
            <button
              onClick={onNavigateAddReport}
              className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
            >
              Create First Report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Report #</th>
                  <th className="px-4 py-3">Title & Category</th>
                  <th className="px-4 py-3">Report Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      {report.reportNumber}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{report.title}</div>
                      <div className="text-[11px] text-slate-500">{report.category}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {report.reportDate || report.createdAt.substring(0, 10)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={report.priority} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectReport(report)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
