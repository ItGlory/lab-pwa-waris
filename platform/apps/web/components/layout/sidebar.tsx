'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Bell,
  MessageSquare,
  FileText,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Droplets,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  labelEn: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    label: 'แดชบอร์ด',
    labelEn: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'พื้นที่ DMA',
    labelEn: 'DMA Areas',
    href: '/dma',
    icon: MapPin,
  },
  {
    label: 'การแจ้งเตือน',
    labelEn: 'Alerts',
    href: '/alerts',
    icon: Bell,
  },
  {
    label: 'ถามตอบ AI',
    labelEn: 'AI Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    label: 'รายงาน',
    labelEn: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    label: 'เอกสาร',
    labelEn: 'Documents',
    href: '/documents',
    icon: FolderOpen,
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  alertCount?: number;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed = false, onCollapse, alertCount = 0, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  // Update alert badge for alerts nav item
  const itemsWithBadge = navItems.map((item) =>
    item.href === '/alerts' ? { ...item, badge: alertCount } : item
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b px-4",
        collapsed ? "justify-center" : "justify-start"
      )}>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Droplets className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span className="text-lg font-bold text-blue-600">WARIS</span>
              <span className="text-[10px] text-slate-500">กปภ.</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {itemsWithBadge.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            const linkContent = (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
                  isActive && 'bg-accent text-accent-foreground font-medium'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
          })}
        </nav>
      </ScrollArea>

      {/* Settings */}
      <div className="border-t p-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
                pathname === '/settings' && 'bg-accent text-accent-foreground font-medium'
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!collapsed && <span>ตั้งค่า</span>}
            </Link>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">ตั้งค่า</TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Collapse Toggle */}
      <Separator />
      <div className="p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={() => onCollapse?.(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
