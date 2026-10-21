import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NavTab } from './components/layout/Sidebar.tsx';
import { MainLayout } from './components/layout/MainLayout.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AddReportPage } from './pages/AddReportPage.tsx';
import { ReportsListPage } from './pages/ReportsListPage.tsx';
import { ReportDetailPage } from './pages/ReportDetailPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { ArchivedReportsPage } from './pages/ArchivedReportsPage.tsx';
import { ExportPage } from './pages/ExportPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { ToastContainer, ToastMessage } from './components/ui/Toast.tsx';
import { ReportItem } from './types/index.ts';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium tracking-wide">
          Authenticating secure administrator session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  const handleEditReport = (report: ReportItem) => {
    setEditingReport(report);
    setCurrentTab('add-report');
  };

  const handleSaveSuccess = (savedReport: ReportItem) => {
    const wasEdit = Boolean(editingReport);
    setEditingReport(null);
    setCurrentTab('all-reports');
    addToast(
      'success',
      wasEdit
        ? `Report ${savedReport.reportNumber} updated successfully.`
        : `Report ${savedReport.reportNumber} created and recorded.`
    );
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
    setCurrentTab('all-reports');
  };

  return (
    <MainLayout
      currentTab={currentTab}
      onSelectTab={(tab) => {
        if (tab !== 'add-report') {
          setEditingReport(null);
        }
        setCurrentTab(tab);
      }}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          onNavigateAddReport={() => {
            setEditingReport(null);
            setCurrentTab('add-report');
          }}
          onNavigateAllReports={() => setCurrentTab('all-reports')}
          onSelectReport={(r) => setSelectedReport(r)}
        />
      )}

      {currentTab === 'add-report' && (
        <AddReportPage
          editReport={editingReport}
          onSuccess={handleSaveSuccess}
          onCancel={handleCancelEdit}
        />
      )}

      {currentTab === 'all-reports' && (
        <ReportsListPage
          onInspect={(r) => setSelectedReport(r)}
          onEdit={handleEditReport}
          onNavigateAdd={() => {
            setEditingReport(null);
            setCurrentTab('add-report');
          }}
          onToast={addToast}
        />
      )}

      {currentTab === 'analytics' && <AnalyticsPage />}

      {currentTab === 'archived-reports' && (
        <ArchivedReportsPage
          onInspect={(r) => setSelectedReport(r)}
          onToast={addToast}
        />
      )}

      {currentTab === 'export-reports' && <ExportPage onToast={addToast} />}

      {currentTab === 'settings' && <SettingsPage />}

      {/* Inspect Report Modal */}
      {selectedReport && (
        <ReportDetailPage
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onEdit={handleEditReport}
          onToast={addToast}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
