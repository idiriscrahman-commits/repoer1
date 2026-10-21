import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  FolderArchive,
} from 'lucide-react';
import { api } from '../services/api.ts';

interface Props {
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ExportPage: React.FC<Props> = ({ onToast }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [priority, setPriority] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [includeArchived, setIncludeArchived] = useState<boolean>(false);

  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    api.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const getExportParams = () => {
    return {
      status: status !== 'ALL' ? status : undefined,
      category: category !== 'ALL' ? category : undefined,
      priority: priority !== 'ALL' ? priority : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      archived: includeArchived,
    };
  };

  const handleExportExcel = async () => {
    setDownloadingExcel(true);
    try {
      await api.downloadExcel(getExportParams());
      onToast('success', 'Excel workbook generated and downloaded successfully.');
    } catch (err) {
      onToast('error', (err as Error).message || 'Failed to download Excel file');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    setDownloadingPDF(true);
    try {
      await api.downloadPDF(getExportParams());
      onToast('success', 'PDF summary document generated and downloaded.');
    } catch (err) {
      onToast('error', (err as Error).message || 'Failed to download PDF summary');
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Data Export Center</h2>
        <p className="text-xs text-slate-500 mt-1">
          Generate official Excel (.xlsx) workbooks and publication-quality PDF audit reports directly from live database records.
        </p>
      </div>

      {/* Export Options Filter Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Step 1: Configure Export Filter Scope</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
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
            <label className="block text-slate-700 font-semibold mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Date From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Date To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Include Archived Records</span>
            </label>
          </div>
        </div>
      </div>

      {/* One File Full Project ZIP Download */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Complete Project Source Code (.zip)</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-bold border border-blue-400/30">
                Single File Archive
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Download the entire codebase bundled into a single ZIP file — including all backend routes, MongoDB schemas, React components, Recharts visualizations, and test suites.
            </p>
          </div>
        </div>

        <a
          href="/api/download/project-zip"
          download="report-management-system.zip"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 transition cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download project.zip</span>
        </a>
      </div>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Excel Export Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Microsoft Excel Export (.xlsx)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export full tabular ledger including report numbers, titles, dates, categories, findings, recommendations, and timestamps.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Frozen header row with corporate navy styling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Formatted dates and auto-adjusted column widths</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready for pivot tables and financial calculations</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleExportExcel}
            disabled={downloadingExcel}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
          >
            {downloadingExcel ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Workbook...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Excel Spreadsheet</span>
              </>
            )}
          </button>
        </div>

        {/* PDF Export Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-200">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Executive PDF Compilation (.pdf)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generate a formatted audit compilation with executive header banner, status metrics, and page numbers.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Professional letterhead with security stamp</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Paginated layout with automatic page totals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Includes active filter scope criteria</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleExportPDF}
            disabled={downloadingPDF}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
          >
            {downloadingPDF ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Rendering PDF Document...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF Summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
