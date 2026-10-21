import React from 'react';
import {
  X,
  Download,
  Edit,
  Calendar,
  Layers,
  Clock,
  Bookmark,
  Tag,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { ReportItem } from '../types/index.ts';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { PriorityBadge } from '../components/ui/PriorityBadge.tsx';
import { api } from '../services/api.ts';

interface Props {
  report: ReportItem | null;
  onClose: () => void;
  onEdit: (report: ReportItem) => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ReportDetailPage: React.FC<Props> = ({ report, onClose, onEdit, onToast }) => {
  if (!report) return null;

  const handleDownloadPDF = async () => {
    try {
      await api.downloadPDF({ reportId: report._id });
      onToast('success', `Exported ${report.reportNumber}.pdf`);
    } catch (err) {
      onToast('error', (err as Error).message || 'PDF export failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Navy Header Banner */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                {report.reportNumber}
              </span>
              {report.archived && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500 text-white">
                  Archived Record
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-snug">{report.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action and Metadata Strip */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Category: <strong className="text-slate-900">{report.category}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Date: <strong className="text-slate-900">{report.reportDate || 'N/A'}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={report.status} />
              <PriorityBadge priority={report.priority} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(report);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm text-slate-800">
          {/* Reference & Tags */}
          {(report.reference || (report.tags && report.tags.length > 0)) && (
            <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs">
              {report.reference && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Reference: <strong className="text-slate-800">{report.reference}</strong></span>
                </div>
              )}
              {report.tags && report.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {report.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detailed Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Executive Description & Scope
            </h4>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line text-sm">
              {report.description}
            </div>
          </div>

          {/* Findings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Key Findings & Observations
            </h4>
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line text-sm">
              {report.findings ? report.findings : <em className="text-slate-400">No specific findings logged for this entry.</em>}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              Strategic Recommendations
            </h4>
            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 text-slate-700 leading-relaxed whitespace-pre-line text-sm">
              {report.recommendations ? (
                report.recommendations
              ) : (
                <em className="text-slate-400">No follow-up recommendations noted.</em>
              )}
            </div>
          </div>

          {/* Audit Timestamps */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
            <span>Created: {new Date(report.createdAt).toUTCString()}</span>
            <span>Last Updated: {new Date(report.updatedAt).toUTCString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
