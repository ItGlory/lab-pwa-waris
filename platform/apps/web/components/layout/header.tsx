'use client';

import * as React from 'react';
import { Bell, Search, Sun, Moon, Menu, Wifi, WifiOff } from 'lucide-react';
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

interface HeaderProps {
  alertCount?: number;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

export function Header({ alertCount = 0, onMenuClick, onSearchClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const isConnected = useConnectionStatus((state) => state.isConnected);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
    <header className="relative flex h-14 items-center justify-between border-b bg-white px-3 sm:h-16 sm:px-4 lg:px-6">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:hidden"
          onClick={handleSearchClick}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Desktop Search - Click to open Command Palette */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="relative hidden h-9 w-48 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 sm:flex md:w-64"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">ค้นหา...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language Toggle - Hidden on very small screens */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden text-xs font-medium xs:inline-flex sm:inline-flex">
              TH | EN
            </Button>
          </TooltipTrigger>
          <TooltipContent>เปลี่ยนภาษา</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
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
            <div className="flex h-9 w-9 items-center justify-center">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
          </TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>การแจ้งเตือน</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/admin.jpg" alt="User" />
            <AvatarFallback>สช</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-medium text-slate-900">สมชาย ใจดี</span>
            <span className="text-xs text-slate-500">ผู้ดูแลระบบ</span>
          </div>
        </div>
      </div>
    </header>
  );
}
