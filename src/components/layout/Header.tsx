import React, { useEffect, useState } from 'react';
import { Menu, Plus, Database, RefreshCw } from 'lucide-react';
import { NavTab } from './Sidebar.tsx';
import { api } from '../../services/api.ts';

interface Props {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onQuickAdd: () => void;
}

export const Header: React.FC<Props> = ({ currentTab, onOpenMobileMenu, onQuickAdd }) => {
  const [dbStatus, setDbStatus] = useState<string>('Connecting...');

  const getPageTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Executive Overview', desc: 'Real-time metrics, volume trends, and report status' };
      case 'add-report':
        return { title: 'Create New Report', desc: 'Structured report entry with validation' };
      case 'all-reports':
        return { title: 'Report Repository', desc: 'Search, filter, review, and manage active reports' };
      case 'analytics':
        return { title: 'Advanced Analytics', desc: 'Historical trends, distributions, and comparative models' };
      case 'archived-reports':
        return { title: 'Archived Reports', desc: 'Historical compliance records with restore capability' };
      case 'export-reports':
        return { title: 'Data Export Center', desc: 'Generate customized PDF and Excel workbooks' };
      case 'settings':
        return { title: 'System Configuration', desc: 'Admin profile, database details, and security controls' };
    }
  };

  const { title, desc } = getPageTitle(currentTab);

  useEffect(() => {
    api
      .checkHealth()
      .then((res) => setDbStatus(res.database))
      .catch(() => setDbStatus('Offline'));
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{title}</h2>
          <p className="hidden sm:block text-xs text-slate-500">{desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* DB Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Storage: <strong className="text-slate-800">{dbStatus}</strong></span>
        </div>

        {/* Quick Add Button */}
        {currentTab !== 'add-report' && (
          <button
            onClick={onQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </button>
        )}
      </div>
    </header>
  );
};
