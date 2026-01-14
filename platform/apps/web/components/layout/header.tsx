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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <header className="relative flex h-14 items-center justify-between border-b border-[var(--pwa-blue-deep)] bg-[var(--pwa-blue-deep)] px-3 text-white sm:h-16 sm:px-4 lg:px-6">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-white/10 hover:text-white lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-white/10 hover:text-white sm:hidden"
          onClick={handleSearchClick}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Desktop Search - Click to open Command Palette */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="relative hidden h-9 w-48 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white/80 transition-colors hover:border-white/40 hover:bg-white/20 sm:flex md:w-64"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">ค้นหา...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/70 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language Toggle - Hidden on very small screens */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden text-xs font-medium text-white hover:bg-white/10 hover:text-white xs:inline-flex sm:inline-flex">
              TH | EN
            </Button>
          </TooltipTrigger>
          <TooltipContent>เปลี่ยนภาษา</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="hidden h-6 bg-white/20 sm:block" />

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-white/10 hover:text-white press-effect"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" />
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
            <div className="relative flex h-9 w-9 items-center justify-center">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-[var(--pwa-cyan-light)] transition-colors" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400 status-dot-pulse" />
                </>
              ) : (
                <WifiOff className="h-4 w-4 text-white/50 transition-colors" />
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

        <Separator orientation="vertical" className="hidden h-6 bg-white/20 sm:block" />

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 border-2 border-[var(--pwa-cyan-light)]">
            <AvatarImage src="/avatars/admin.jpg" alt="User" />
            <AvatarFallback className="bg-[var(--pwa-cyan)] text-white">สช</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-medium text-white">สมชาย ใจดี</span>
            <span className="text-xs text-[var(--pwa-cyan-light)]">ผู้ดูแลระบบ</span>
          </div>
        </div>
      </div>
    </header>
  );
}
