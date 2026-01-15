'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sun, Moon, Menu, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useConnectionStatus } from '@/hooks/use-connection-status';
import {
  NotificationPopover,
  sampleNotifications,
} from '@/components/notifications/notification-popover';

interface HeaderProps {
  alertCount?: number;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

export function Header({ alertCount = 0, onMenuClick, onSearchClick }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [notifications, setNotifications] = React.useState(sampleNotifications);
  const isConnected = useConnectionStatus((state) => state.isConnected);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  // Handle notification click - open detail modal or navigate
  const handleNotificationClick = (notification: typeof sampleNotifications[0]) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, status: 'read' as const } : n
      )
    );
    // Navigate to notifications page with selected notification
    router.push(`/notifications?id=${notification.id}`);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'read' as const }))
    );
  };

  // Handle view all notifications
  const handleViewAll = () => {
    router.push('/notifications');
  };

  // Trigger command palette with keyboard shortcut
  const handleSearchClick = () => {
    // Dispatch keyboard event to trigger command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
    onSearchClick?.();
  };

  return (
    <header className="relative flex h-14 items-center justify-between px-3 text-white sm:h-16 sm:px-4 lg:px-6 overflow-hidden">
      {/* Gradient background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--pwa-blue-deep)] via-[var(--pwa-navy)] to-[var(--pwa-blue-deep)]" />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/5 to-transparent opacity-50" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[var(--pwa-cyan)] blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-[var(--pwa-cyan-light)] blur-3xl" />
      </div>

      {/* Bottom border with gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/50 to-transparent" />

      {/* Left: Mobile menu + Search */}
      <div className="relative flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white/90 hover:bg-white/10 hover:text-white lg:hidden rounded-xl transition-all duration-300 hover:scale-105"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white/90 hover:bg-white/10 hover:text-white sm:hidden rounded-xl transition-all duration-300 hover:scale-105"
          onClick={handleSearchClick}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Desktop Search - Click to open Command Palette */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="group relative hidden h-10 w-52 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-[var(--pwa-cyan)]/30 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-[var(--pwa-cyan)]/10 sm:flex md:w-72"
        >
          <Search className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          <span className="flex-1 text-left font-medium">ค้นหา...</span>
          <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 font-mono text-[10px] font-semibold text-white/50 backdrop-blur-sm sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="relative flex items-center gap-1 sm:gap-1.5">
        {/* Language Toggle - Hidden on very small screens */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden h-9 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white xs:inline-flex sm:inline-flex transition-all duration-300 hover:scale-105"
            >
              TH | EN
            </Button>
          </TooltipTrigger>
          <TooltipContent>เปลี่ยนภาษา</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="hidden h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent sm:block mx-1" />

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105 press-effect"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-all duration-500 hover:rotate-180 hover:text-amber-300" />
              ) : (
                <Moon className="h-5 w-5 transition-all duration-500 hover:-rotate-12 hover:text-[var(--pwa-cyan-light)]" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {mounted && theme === 'dark' ? 'โหมดสว่าง' : 'โหมดมืด'}
          </TooltipContent>
        </Tooltip>

        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 hover:bg-white/10">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-[var(--pwa-cyan-light)] transition-colors" />
                  <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  </span>
                </>
              ) : (
                <WifiOff className="h-4 w-4 text-white/40 transition-colors" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
          </TooltipContent>
        </Tooltip>

        {/* Notifications Popover */}
        <NotificationPopover
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
          onViewAll={handleViewAll}
        />

        <Separator orientation="vertical" className="hidden h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent sm:block mx-1" />

        {/* User Menu - Enhanced */}
        <div className="group flex items-center gap-2 sm:gap-3 rounded-xl px-2 py-1.5 transition-all duration-300 hover:bg-white/10 cursor-pointer">
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-[var(--pwa-cyan)]/50 ring-offset-1 ring-offset-[var(--pwa-navy)] transition-all duration-300 group-hover:ring-[var(--pwa-cyan)] group-hover:scale-105">
              <AvatarFallback className="bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] text-white font-semibold text-sm">
                สช
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--pwa-navy)] bg-emerald-400 shadow-lg shadow-emerald-400/50" />
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-semibold text-white transition-colors group-hover:text-[var(--pwa-cyan-light)]">
              สมชาย ใจดี
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--pwa-cyan-light)]/70">
              ผู้ดูแลระบบ
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
