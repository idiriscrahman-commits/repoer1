import React from 'react';
import { ReportPriority } from '../../types/index.ts';

interface Props {
  priority: ReportPriority;
}

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  switch (priority) {
    case 'Urgent':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800 border border-red-200">
          Urgent
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 border border-amber-200">
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200">
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
          Low
        </span>
      );
  }
};
