import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Archive,
  Download,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { PaginationMeta, ReportItem, ReportPriority, ReportStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { PriorityBadge } from '../components/ui/PriorityBadge.tsx';
import { ConfirmModal } from '../components/ui/ConfirmModal.tsx';

interface Props {
  onInspect: (report: ReportItem) => void;
  onEdit: (report: ReportItem) => void;
  onNavigateAdd: () => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ReportsListPage: React.FC<Props> = ({
  onInspect,
  onEdit,
  onNavigateAdd,
  onToast,
}) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [priority, setPriority] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'reportDate' | 'title' | 'reportNumber'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(false);

  // Archive modal state
  const [archiveTarget, setArchiveTarget] = useState<ReportItem | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.data);
    } catch {
      // Fallback
    }
  };

  const fetchReports = async (pageToFetch: number = pagination.page) => {
    setLoading(true);
    try {
      const res = await api.getReports({
        page: pageToFetch,
        limit: 10,
        search,
        status: status !== 'ALL' ? status : undefined,
        category: category !== 'ALL' ? category : undefined,
        priority: priority !== 'ALL' ? priority : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        archived: false,
      });
      setReports(res.data);
      setPagination(res.pagination);
    } catch (err) {
      onToast('error', (err as Error).message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchReports(1);
  }, [search, status, category, priority, startDate, endDate, sortBy, sortOrder]);

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      await api.archiveReport(archiveTarget._id);
      onToast('success', `Report ${archiveTarget.reportNumber} has been safely archived.`);
      setArchiveTarget(null);
      fetchReports();
    } catch (err) {
      onToast('error', (err as Error).message || 'Failed to archive report');
    }
  };

  const handleExportSinglePDF = async (report: ReportItem) => {
    try {
      await api.downloadPDF({ reportId: report._id });
      onToast('success', `Exported ${report.reportNumber}.pdf`);
    } catch (err) {
      onToast('error', (err as Error).message || 'Export failed');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setCategory('ALL');
    setPriority('ALL');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by title, number, keyword, tag, or description..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReports(pagination.page)}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Sort Field</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="createdAt">Created Date</option>
                <option value="reportDate">Report Date</option>
                <option value="reportNumber">Report #</option>
                <option value="title">Title</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Toggle order: currently ${sortOrder.toUpperCase()}`}
                className="px-2 py-1.5 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading filtered reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No reports match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, clearing date filters, or create a new report record.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                onClick={onNavigateAdd}
                className="px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Create New Report
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Report #</th>
                  <th className="px-4 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Report Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Created</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {report.reportNumber}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate" title={report.title}>
                        {report.title}
                      </div>
                      {report.reference && (
                        <div className="text-[11px] text-slate-400">Ref: {report.reference}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap font-medium">
                      {report.category}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {report.reportDate || report.createdAt.substring(0, 10)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <PriorityBadge priority={report.priority} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onInspect(report)}
                          title="View Full Details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(report)}
                          title="Edit Report"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportSinglePDF(report)}
                          title="Export to PDF"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setArchiveTarget(report)}
                          title="Archive Report"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && reports.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-bold text-slate-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-slate-800">{pagination.total}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => fetchReports(pagination.page - 1)}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <span className="px-2 text-slate-500 font-semibold">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => fetchReports(pagination.page + 1)}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Archiving */}
      <ConfirmModal
        isOpen={Boolean(archiveTarget)}
        title="Confirm Report Archival"
        message={`Are you sure you want to archive report ${archiveTarget?.reportNumber} ("${archiveTarget?.title}")? Archived reports are safely stored and can be restored at any time.`}
        confirmLabel="Archive Report"
        isDanger={true}
        onConfirm={handleConfirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
};
