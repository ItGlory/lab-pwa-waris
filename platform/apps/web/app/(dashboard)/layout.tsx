'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { FloatingChat } from '@/components/chat/floating-chat';
import { CommandPalette } from '@/components/command-palette';
import { AlertNotifications } from '@/components/alerts/alert-notifications';
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
      {/* Desktop Sidebar - Fixed */}
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={handleMobileMenuClose}
            onKeyDown={(e) => e.key === 'Escape' && handleMobileMenuClose()}
            aria-label="ปิดเมนู"
            role="button"
            tabIndex={0}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden animate-slide-in-left">
            <Sidebar alertCount={activeAlertCount} onNavigate={handleMobileMenuClose} />
          </div>
        </>
      )}

      {/* Main Content - Add margin to account for fixed sidebar on desktop */}
      <div
        className={`flex flex-1 flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <Header
          alertCount={activeAlertCount}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/30 p-3 sm:p-4 lg:p-6 safe-area-inset">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Chat Widget */}
      <FloatingChat />

      {/* Command Palette (Ctrl/Cmd+K) */}
      <CommandPalette />

      {/* Real-time Alert Notifications via WebSocket */}
      <AlertNotifications />
    </div>
  );
}
