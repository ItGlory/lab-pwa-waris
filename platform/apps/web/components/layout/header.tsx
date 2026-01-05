'use client';

import * as React from 'react';
import { Bell, Search, Sun, Moon, Menu, User, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  alertCount?: number;
  onMenuClick?: () => void;
}

export function Header({ alertCount = 0, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ค้นหา DMA, รายงาน..."
            className="w-64 pl-9"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs font-medium">
              TH | EN
            </Button>
          </TooltipTrigger>
          <TooltipContent>เปลี่ยนภาษา</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
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

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
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

        <Separator orientation="vertical" className="h-6" />

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/admin.jpg" alt="User" />
            <AvatarFallback>สช</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-medium">สมชาย ใจดี</span>
            <span className="text-xs text-muted-foreground">ผู้ดูแลระบบ</span>
          </div>
        </div>
      </div>
    </header>
  );
}
