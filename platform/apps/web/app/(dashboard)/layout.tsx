'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { FloatingChat } from '@/components/chat/floating-chat';
import { useAlerts } from '@/hooks/use-alerts';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const { data: alertsData } = useAlerts({ status: 'active' });
  const activeAlertCount = alertsData?.meta.total ?? 0;

  // Close mobile menu when clicking a link
  const handleMobileMenuClose = React.useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen min-h-[100dvh]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          alertCount={activeAlertCount}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={handleMobileMenuClose}
            onKeyDown={(e) => e.key === 'Escape' && handleMobileMenuClose()}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar alertCount={activeAlertCount} onNavigate={handleMobileMenuClose} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          alertCount={activeAlertCount}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-background p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Floating Chat Widget */}
      <FloatingChat />
    </div>
  );
}
