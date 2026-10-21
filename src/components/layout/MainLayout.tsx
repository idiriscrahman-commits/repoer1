import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar.tsx';
import { Header } from './Header.tsx';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<Props> = ({ currentTab, onSelectTab, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isOpenMobile={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onQuickAdd={() => onSelectTab('add-report')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
