import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  FileCheck,
  AlertCircle,
  Hash,
  Tag,
  Bookmark,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';
import { ReportFormData, ReportItem, ReportPriority, ReportStatus } from '../types/index.ts';
import { api } from '../services/api.ts';

interface Props {
  editReport?: ReportItem | null;
  onSuccess: (savedReport: ReportItem) => void;
  onCancel: () => void;
}

const COMMON_CATEGORIES = [
  'Financial Audit',
  'Operational Risk',
  'Security & Compliance',
  'Incident Report',
  'Executive Summary',
  'Technical Review',
  'Quality Assurance',
  'Legal & Governance',
];

export const AddReportPage: React.FC<Props> = ({ editReport, onSuccess, onCancel }) => {
  const isEditing = Boolean(editReport);

  const [formData, setFormData] = useState<ReportFormData>({
    title: editReport?.title || '',
    category: editReport?.category || 'Financial Audit',
    reportDate: editReport?.reportDate || new Date().toISOString().substring(0, 10),
    description: editReport?.description || '',
    findings: editReport?.findings || '',
    recommendations: editReport?.recommendations || '',
    status: editReport?.status || 'Pending',
    priority: editReport?.priority || 'Medium',
    tags: editReport?.tags ? editReport.tags.join(', ') : '',
    reference: editReport?.reference || '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editReport) {
      setFormData({
        title: editReport.title,
        category: editReport.category,
        reportDate: editReport.reportDate || editReport.createdAt.substring(0, 10),
        description: editReport.description,
        findings: editReport.findings || '',
        recommendations: editReport.recommendations || '',
        status: editReport.status,
        priority: editReport.priority,
        tags: editReport.tags ? editReport.tags.join(', ') : '',
        reference: editReport.reference || '',
      });
    }
  }, [editReport]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!formData.title || formData.title.trim().length < 3) {
      errs.push('Report name must be at least 3 characters long.');
    }
    if (!formData.category || formData.category.trim().length < 2) {
      errs.push('Please select or specify a report category.');
    }
    if (!formData.reportDate || !/^\d{4}-\d{2}-\d{2}$/.test(formData.reportDate)) {
      errs.push('Please specify a valid report date (YYYY-MM-DD).');
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errs.push('Description must provide sufficient detail (at least 10 characters).');
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors([]);

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        reportDate: formData.reportDate,
        description: formData.description.trim(),
        findings: formData.findings.trim(),
        recommendations: formData.recommendations.trim(),
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        reference: formData.reference.trim(),
      };

      if (isEditing && editReport) {
        const res = await api.updateReport(editReport._id, payload as any);
        onSuccess(res.data);
      } else {
        const res = await api.createReport(payload as any);
        onSuccess(res.data);
      }
    } catch (err) {
      setErrors([(err as Error).message || 'Failed to save report to database.']);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              {isEditing ? `Editing ${editReport?.reportNumber}` : 'New Report Entry'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {isEditing ? 'Update Existing Report' : 'Create & Register New Report'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEditing
              ? 'Modify report details, findings, or workflow status.'
              : 'All fields are securely recorded with automatic unique sequential numbering.'}
          </p>
        </div>

        {!isEditing && (
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-slate-600">
            <Hash className="w-4 h-4 text-blue-600" />
            <span>Assigned Number: <strong className="text-slate-900">RPT-2026-AUTO</strong></span>
          </div>
        )}
      </div>

      {/* Validation Errors banner */}
      {errors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Please resolve the following before saving:</span>
          </div>
          <ul className="list-disc pl-5 text-xs space-y-0.5 text-rose-700">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Report Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Report Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Q2 Corporate Compliance & Risk Management Review"
            aria-label="Report Name"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Report Category <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              list="category-suggestions"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Financial Audit, Technical Review, Operational Risk"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <datalist id="category-suggestions">
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Report Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Status and Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Workflow Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ReportStatus })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="Pending">Pending (Awaiting Review)</option>
              <option value="In Progress">In Progress (Active Work)</option>
              <option value="Completed">Completed (Approved)</option>
              <option value="Rejected">Rejected (Declined)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Priority Level
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as ReportPriority })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Reference & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Optional Reference #
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="e.g. AUD-2026-X88"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tags / Keywords (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. Finance, Audit, Q2, Compliance"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Comprehensive overview of report context, scope, methodology, and background..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Findings */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Findings & Observed Outcomes
          </label>
          <textarea
            rows={3}
            value={formData.findings}
            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
            placeholder="Specific empirical discoveries, audit notes, measured metrics, or identified irregularities..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Recommendations */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Actionable Recommendations
          </label>
          <textarea
            rows={3}
            value={formData.recommendations}
            onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
            placeholder="Recommended organizational interventions, corrective action plans, or follow-up procedures..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Save Report to Database'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
