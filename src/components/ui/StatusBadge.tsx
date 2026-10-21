import React from 'react';
import { ReportStatus } from '../../types/index.ts';

interface Props {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  switch (status) {
    case 'Completed':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500" />
          Completed
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500 animate-pulse" />
          In Progress
        </span>
      );
    case 'Pending':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500" />
          Pending
        </span>
      );
    case 'Rejected':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
