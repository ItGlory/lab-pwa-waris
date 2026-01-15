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
  Gauge,
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
  {
    label: 'ประเมินโมเดล',
    labelEn: 'Model Evaluation',
    href: '/model-evaluation',
    icon: Gauge,
  },
];

// Animated notification badge with glow
function NotificationBadge({ count, pulse }: { count: number; pulse?: boolean }) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'relative grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold leading-none text-white',
        'bg-gradient-to-r from-red-500 to-rose-500',
        'shadow-lg shadow-red-500/40',
        'ring-1 ring-red-400/30',
        pulse && 'notification-pulse animate-pulse'
      )}
    >
      {/* Glow effect */}
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50" />
      )}
      <span className="relative">{count > 99 ? '99+' : count}</span>
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
        'bg-gradient-to-b from-[var(--pwa-navy)] via-[#0a2447] to-[#061830]',
        'border-r border-white/5 text-white',
        'transition-all duration-300 ease-in-out',
        'backdrop-blur-xl',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-[var(--pwa-cyan)]/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-10 h-32 w-32 rounded-full bg-[var(--pwa-blue-deep)]/15 blur-2xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-20 -left-10 h-24 w-24 rounded-full bg-[var(--pwa-cyan-light)]/10 blur-2xl animate-float" style={{ animationDelay: '6s' }} />
      </div>

      {/* Logo */}
      <div
        className={cn(
          'relative flex h-16 items-center border-b border-white/10 px-4',
          collapsed ? 'justify-center' : 'justify-start'
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
        >
          <div
            className={cn(
              'relative flex items-center justify-center rounded-xl',
              'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)]',
              'shadow-lg shadow-[var(--pwa-cyan)]/30',
              'transition-all duration-500 group-hover:shadow-[var(--pwa-cyan)]/50 group-hover:scale-110 group-hover:rotate-3',
              'ring-1 ring-white/20',
              collapsed ? 'h-10 w-10' : 'h-10 w-10'
            )}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Droplets className="relative h-5 w-5 text-white drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
          </div>
          {!collapsed && (
            <div className="flex flex-col text-left animate-fade-in">
              <span className="text-lg font-bold tracking-tight text-[var(--pwa-cyan-light)] drop-shadow-sm">
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
      <ScrollArea className="relative flex-1 px-2 py-4">
        <nav className="relative flex flex-col gap-1">
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
                  'text-white/70 transition-all duration-300',
                  'hover:bg-white/10 hover:text-white',
                  'press-effect touch-target shine-effect',
                  isActive && [
                    'bg-gradient-to-r from-[var(--pwa-blue-deep)] to-[var(--pwa-cyan)]/20',
                    'text-white font-medium',
                    'shadow-lg shadow-[var(--pwa-cyan)]/20',
                    'ring-1 ring-[var(--pwa-cyan)]/30',
                  ]
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator with glow */}
                {isActive && (
                  <>
                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[var(--pwa-cyan)] to-[var(--pwa-cyan-light)] shadow-lg shadow-[var(--pwa-cyan)]/50" />
                    {/* Background glow */}
                    <span className="absolute inset-0 rounded-xl bg-[var(--pwa-cyan)]/5 opacity-50" />
                  </>
                )}

                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-all duration-300',
                    'group-hover:scale-110 group-hover:rotate-3',
                    isActive && 'text-[var(--pwa-cyan-light)] drop-shadow-sm'
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    <NotificationBadge count={item.badge ?? 0} pulse={hasNotification} />
                  </>
                )}

                {/* Collapsed badge indicator with glow */}
                {collapsed && hasNotification && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--pwa-navy)] shadow-lg shadow-red-500/50 animate-pulse" />
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

      {/* Gradient separator */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Settings */}
      <div className="relative border-t border-white/5 p-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5',
                'text-white/70 transition-all duration-300',
                'hover:bg-white/10 hover:text-white press-effect shine-effect',
                pathname?.startsWith('/settings') && [
                  'bg-gradient-to-r from-[var(--pwa-blue-deep)] to-[var(--pwa-cyan)]/20',
                  'text-white font-medium',
                  'ring-1 ring-[var(--pwa-cyan)]/30',
                ]
              )}
            >
              <Settings
                className={cn(
                  'h-5 w-5 shrink-0 transition-all duration-500',
                  'group-hover:rotate-180 group-hover:scale-110'
                )}
              />
              {!collapsed && <span>ตั้งค่า</span>}
            </Link>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">ตั้งค่า</TooltipContent>}
        </Tooltip>
      </div>

      {/* Collapse Toggle */}
      <div className="relative p-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'w-full text-white/70 transition-all duration-300',
            'hover:bg-white/10 hover:text-white',
            'ring-1 ring-white/5 hover:ring-white/20',
            'rounded-xl'
          )}
          onClick={() => onCollapse?.(!collapsed)}
        >
          <div
            className={cn(
              'transition-transform duration-500 ease-out',
              collapsed ? 'rotate-0' : 'rotate-180'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </div>
        </Button>
      </div>

      {/* Version info with subtle glow */}
      {!collapsed && (
        <div className="relative border-t border-white/5 px-4 py-2">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/20 to-transparent" />
          <p className="text-[10px] text-white/30 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            v1.0.0 - PWA Edition
          </p>
        </div>
      )}
    </aside>
  );
}
