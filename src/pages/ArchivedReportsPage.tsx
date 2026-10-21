import React, { useState, useEffect } from 'react';
import {
  ArchiveRestore,
  Search,
  Eye,
  RefreshCw,
  Archive,
  Download,
  FolderArchive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PaginationMeta, ReportItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { PriorityBadge } from '../components/ui/PriorityBadge.tsx';
import { ConfirmModal } from '../components/ui/ConfirmModal.tsx';

interface Props {
  onInspect: (report: ReportItem) => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ArchivedReportsPage: React.FC<Props> = ({ onInspect, onToast }) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<ReportItem | null>(null);

  const fetchArchived = async (page: number = pagination.page) => {
    setLoading(true);
    try {
      const res = await api.getReports({
        archived: true,
        search,
        page,
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      setReports(res.data);
      setPagination(res.pagination);
    } catch (err) {
      onToast('error', (err as Error).message || 'Failed to load archived reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived(1);
  }, [search]);

  const handleConfirmRestore = async () => {
    if (!restoreTarget) return;
    try {
      await api.restoreReport(restoreTarget._id);
      onToast('success', `Report ${restoreTarget.reportNumber} restored to active records.`);
      setRestoreTarget(null);
      fetchArchived();
    } catch (err) {
      onToast('error', (err as Error).message || 'Failed to restore report');
    }
  };

  const handleDownloadPDF = async (report: ReportItem) => {
    try {
      await api.downloadPDF({ reportId: report._id });
      onToast('success', `Exported ${report.reportNumber}.pdf`);
    } catch (err) {
      onToast('error', (err as Error).message || 'PDF export failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Archived Reports Repository</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical records retained for governance and audit compliance. Any report can be safely restored.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archived records..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading archived records...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">Archive Vault is Clean</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no archived reports matching your criteria.
            </p>
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
                      <div className="font-semibold text-slate-800 truncate">{report.title}</div>
                      <div className="text-[11px] text-slate-400">Archived from active rotation</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{report.category}</td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {report.reportDate || report.createdAt.substring(0, 10)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <PriorityBadge priority={report.priority} />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInspect(report)}
                          title="Inspect Details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(report)}
                          title="Download PDF"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRestoreTarget(report)}
                          title="Restore to Active Reports"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition cursor-pointer"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restore</span>
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
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Total <span className="font-bold text-slate-800">{pagination.total}</span> archived records
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => fetchArchived(pagination.page - 1)}
                className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => fetchArchived(pagination.page + 1)}
                className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(restoreTarget)}
        title="Confirm Report Restoration"
        message={`Do you want to restore report ${restoreTarget?.reportNumber} ("${restoreTarget?.title}") to active status? It will immediately reappear in the active reports repository and dashboard.`}
        confirmLabel="Restore to Active"
        isDanger={false}
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
};
