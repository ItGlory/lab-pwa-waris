'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Upload,
  Brain,
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
  {
    label: 'นำเข้าข้อมูล',
    labelEn: 'Data Import',
    href: '/data-import',
    icon: Upload,
  },
  {
    label: 'AI Insights',
    labelEn: 'AI Insights',
    href: '/ai-insights',
    icon: Brain,
  },
];

// Animated notification badge
function NotificationBadge({ count, pulse }: { count: number; pulse?: boolean }) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'relative grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold leading-none text-white shadow-sm',
        'bg-gradient-to-r from-red-500 to-red-600',
        pulse && 'notification-pulse'
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  alertCount?: number;
  onNavigate?: () => void;
}

export function Sidebar({
  collapsed = false,
  onCollapse,
  alertCount = 0,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  // Update alert badge for alerts nav item
  const itemsWithBadge = navItems.map((item) =>
    item.href === '/alerts' ? { ...item, badge: alertCount } : item
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col',
        'bg-gradient-to-b from-[var(--pwa-navy)] to-[#081d3a]',
        'border-r border-[var(--pwa-navy)] text-white',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-white/10 px-4',
          collapsed ? 'justify-center' : 'justify-start'
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
        >
          <div
            className={cn(
              'relative flex items-center justify-center rounded-xl',
              'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)]',
              'shadow-lg shadow-[var(--pwa-cyan)]/20',
              'transition-all duration-300 group-hover:shadow-[var(--pwa-cyan)]/40',
              collapsed ? 'h-10 w-10' : 'h-10 w-10'
            )}
          >
            <Droplets className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col text-left animate-fade-in">
              <span className="text-lg font-bold tracking-tight text-[var(--pwa-cyan-light)]">
                WARIS
              </span>
              <span className="text-[10px] font-medium text-white/50">
                Water Loss Analytics
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {itemsWithBadge.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const hasNotification = item.badge !== undefined && item.badge > 0;

            const linkContent = (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
                  'text-white/70 transition-all duration-200',
                  'hover:bg-white/10 hover:text-white',
                  'press-effect touch-target',
                  isActive && [
                    'bg-gradient-to-r from-[var(--pwa-blue-deep)] to-[var(--pwa-blue-deep)]/80',
                    'text-white font-medium shadow-lg shadow-[var(--pwa-blue-deep)]/30',
                  ]
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[var(--pwa-cyan)]" />
                )}

                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200',
                    'group-hover:scale-110',
                    isActive && 'text-[var(--pwa-cyan-light)]'
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    <NotificationBadge count={item.badge ?? 0} pulse={hasNotification} />
                  </>
                )}

                {/* Collapsed badge indicator */}
                {collapsed && hasNotification && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--pwa-navy)]" />
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="flex items-center gap-2 font-medium"
                  >
                    {item.label}
                    <NotificationBadge count={item.badge ?? 0} />
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
          })}
        </nav>
      </ScrollArea>

      {/* Settings */}
      <div className="border-t border-white/10 p-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5',
                'text-white/70 transition-all duration-200',
                'hover:bg-white/10 hover:text-white press-effect',
                pathname === '/settings' && [
                  'bg-gradient-to-r from-[var(--pwa-blue-deep)] to-[var(--pwa-blue-deep)]/80',
                  'text-white font-medium',
                ]
              )}
            >
              <Settings
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-300',
                  'group-hover:rotate-90'
                )}
              />
              {!collapsed && <span>ตั้งค่า</span>}
            </Link>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">ตั้งค่า</TooltipContent>}
        </Tooltip>
      </div>

      {/* Collapse Toggle */}
      <Separator className="bg-white/10" />
      <div className="p-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'w-full text-white/70 transition-all duration-200',
            'hover:bg-white/10 hover:text-white'
          )}
          onClick={() => onCollapse?.(!collapsed)}
        >
          <div
            className={cn(
              'transition-transform duration-300',
              collapsed ? 'rotate-0' : 'rotate-180'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </div>
        </Button>
      </div>

      {/* Version info */}
      {!collapsed && (
        <div className="border-t border-white/5 px-4 py-2">
          <p className="text-[10px] text-white/30">v1.0.0 - PWA Edition</p>
        </div>
      )}
    </aside>
  );
}
