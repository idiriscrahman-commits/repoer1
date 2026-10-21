import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  BarChart3,
  Archive,
  Download,
  Settings,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export type NavTab =
  | 'dashboard'
  | 'add-report'
  | 'all-reports'
  | 'analytics'
  | 'archived-reports'
  | 'export-reports'
  | 'settings';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'add-report', label: 'Add Report', icon: <FilePlus className="w-5 h-5" /> },
    { id: 'all-reports', label: 'All Reports', icon: <FileText className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'archived-reports', label: 'Archived Reports', icon: <Archive className="w-5 h-5" /> },
    { id: 'export-reports', label: 'Export Reports', icon: <Download className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Navy-Blue Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white uppercase">Report System</h1>
              <span className="text-[10px] tracking-wider text-blue-400 uppercase font-semibold">Admin Console</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Management
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin User Footer & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-xs font-bold text-blue-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@rms.internal'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/30 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
