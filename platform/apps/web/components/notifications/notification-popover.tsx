'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCheck,
  ChevronRight,
  FileText,
  Info,
  Settings,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types
interface NotificationItem {
  id: string;
  title_th: string;
  description_th: string;
  type: 'alert' | 'system' | 'report' | 'maintenance';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'unread' | 'read' | 'acknowledged' | 'resolved';
  createdAt: Date;
  metadata?: {
    dmaId?: string;
  };
}

interface NotificationPopoverProps {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading?: boolean;
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllAsRead?: () => void;
  onViewAll?: () => void;
}

// Enhanced severity configuration with glassmorphism styles
const severityConfig = {
  critical: {
    icon: AlertCircle,
    color: 'text-white',
    bg: 'bg-gradient-to-br from-red-500 to-rose-600',
    dot: 'bg-red-500',
    glow: 'shadow-red-500/40',
    ring: 'ring-red-500/30',
    pulse: true,
  },
  high: {
    icon: AlertTriangle,
    color: 'text-white',
    bg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    dot: 'bg-orange-500',
    glow: 'shadow-orange-500/30',
    ring: 'ring-orange-500/30',
    pulse: false,
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-white',
    bg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    dot: 'bg-amber-500',
    glow: 'shadow-amber-500/30',
    ring: 'ring-amber-500/30',
    pulse: false,
  },
  low: {
    icon: Info,
    color: 'text-white',
    bg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    dot: 'bg-blue-500',
    glow: 'shadow-blue-500/30',
    ring: 'ring-blue-500/30',
    pulse: false,
  },
  info: {
    icon: Info,
    color: 'text-white',
    bg: 'bg-gradient-to-br from-slate-500 to-slate-600',
    dot: 'bg-slate-500',
    glow: 'shadow-slate-500/30',
    ring: 'ring-slate-500/30',
    pulse: false,
  },
};

const typeConfig = {
  alert: { icon: AlertCircle, label_th: 'แจ้งเตือน' },
  system: { icon: Settings, label_th: 'ระบบ' },
  report: { icon: FileText, label_th: 'รายงาน' },
  maintenance: { icon: Settings, label_th: 'บำรุงรักษา' },
};

// Utility functions
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชม.ที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH');
}

// Loading Skeleton with enhanced styling
function NotificationItemSkeleton() {
  return (
    <div className="flex gap-3 p-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl skeleton-shimmer" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-lg skeleton-shimmer" />
        <Skeleton className="h-3 w-full rounded-lg skeleton-shimmer" />
        <Skeleton className="h-3 w-1/3 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

// Empty State with modern design
function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-[var(--pwa-cyan)]/20 blur-xl animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/20 ring-1 ring-[var(--pwa-cyan)]/20">
          <Bell className="h-7 w-7 text-[var(--pwa-cyan)]" />
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">
        ไม่มีการแจ้งเตือน
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        คุณจะได้รับการแจ้งเตือนที่นี่
      </p>
    </div>
  );
}

// Notification Item Component with modern styling
function NotificationListItem({
  notification,
  onClick,
}: {
  notification: NotificationItem;
  onClick?: () => void;
}) {
  const severity = severityConfig[notification.severity];
  const SeverityIcon = severity.icon;
  const isUnread = notification.status === 'unread';

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-start gap-3 p-3 text-left',
        'transition-all duration-300',
        'hover:bg-muted/50 hover:-translate-y-0.5',
        isUnread && 'bg-[var(--pwa-cyan)]/5',
        severity.pulse && isUnread && 'animate-breathing-glow'
      )}
    >
      {/* Icon with gradient and glow */}
      <div
        className={cn(
          'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          'shadow-lg transition-all duration-300',
          'group-hover:scale-110 group-hover:rotate-3',
          severity.bg,
          severity.glow
        )}
      >
        {/* Inner glow on hover */}
        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <SeverityIcon className={cn('relative h-4.5 w-4.5', severity.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              'line-clamp-1 text-sm transition-colors',
              isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
            )}
          >
            {notification.title_th}
          </p>
          {isUnread && (
            <span className={cn(
              'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
              severity.dot,
              'shadow-lg animate-pulse',
              `shadow-${severity.dot.replace('bg-', '')}/50`
            )} />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground/80">
          {notification.description_th}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground/60">
          <span>{formatRelativeTime(notification.createdAt)}</span>
          {notification.metadata?.dmaId && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <span className="font-mono text-[var(--pwa-cyan)] font-medium">{notification.metadata.dmaId}</span>
            </>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 self-center" />
    </button>
  );
}

// Main Component
export function NotificationPopover({
  notifications,
  unreadCount,
  isLoading = false,
  onNotificationClick,
  onMarkAllAsRead,
  onViewAll,
}: NotificationPopoverProps) {
  const [open, setOpen] = React.useState(false);

  const handleNotificationClick = (notification: NotificationItem) => {
    onNotificationClick?.(notification);
    setOpen(false);
  };

  const handleViewAll = () => {
    onViewAll?.();
    setOpen(false);
  };

  // Get latest 5 notifications
  const latestNotifications = notifications.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative h-9 w-9 rounded-xl text-white/80 hover:bg-white/10 hover:text-white',
                'transition-all duration-300 hover:scale-105'
              )}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-lg shadow-red-500/40 ring-1 ring-white/20">
                  {unreadCount > 99 ? '99+' : unreadCount}
                  {/* Pulse effect */}
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>การแจ้งเตือน</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        className={cn(
          'w-80 p-0 sm:w-[400px]',
          'backdrop-blur-xl bg-background/95',
          'border border-border/50',
          'shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50',
          'ring-1 ring-black/5 dark:ring-white/5',
          'animate-elastic'
        )}
        sideOffset={8}
      >
        {/* Header with gradient */}
        <div className="relative flex items-center justify-between border-b border-border/50 px-4 py-3.5 bg-gradient-to-r from-[var(--pwa-cyan)]/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--pwa-cyan)]/10 ring-1 ring-[var(--pwa-cyan)]/20">
              <Bell className="h-4 w-4 text-[var(--pwa-cyan)]" />
            </div>
            <h3 className="font-semibold">การแจ้งเตือน</h3>
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="h-5 px-2 text-xs bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] shadow-sm"
              >
                {unreadCount} ใหม่
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[var(--pwa-cyan)] hover:text-[var(--pwa-cyan)] hover:bg-[var(--pwa-cyan)]/10 transition-all duration-300"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              อ่านทั้งหมด
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[420px] modern-scrollbar">
          {isLoading ? (
            <div className="divide-y divide-border/30">
              {[1, 2, 3].map((i) => (
                <NotificationItemSkeleton key={i} />
              ))}
            </div>
          ) : latestNotifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="divide-y divide-border/30">
              {latestNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className="animate-slide-up-fade"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NotificationListItem
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer with gradient */}
        {!isLoading && latestNotifications.length > 0 && (
          <div className="relative border-t border-border/50 p-2 bg-muted/30">
            {/* Top glow line */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--pwa-cyan)]/20 to-transparent" />
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-between text-sm font-medium',
                'text-[var(--pwa-cyan)] hover:text-[var(--pwa-cyan)] hover:bg-[var(--pwa-cyan)]/10',
                'transition-all duration-300 rounded-xl'
              )}
              onClick={handleViewAll}
              asChild
            >
              <Link href="/notifications" className="group">
                ดูการแจ้งเตือนทั้งหมด
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Sample data for demonstration
export const sampleNotifications: NotificationItem[] = [
  {
    id: 'NTF-001',
    title_th: 'ตรวจพบน้ำสูญเสียสูงใน DMA-NKR-015',
    description_th: 'อัตราน้ำสูญเสียเกินค่าเกณฑ์ที่ 25% โดยปัจจุบันอยู่ที่ 32.5%',
    type: 'alert',
    severity: 'critical',
    status: 'unread',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    metadata: { dmaId: 'DMA-NKR-015' },
  },
  {
    id: 'NTF-002',
    title_th: 'รายงานประจำวันพร้อมแล้ว',
    description_th: 'รายงานน้ำสูญเสียประจำวันที่ 14 ม.ค. 2567 พร้อมดาวน์โหลด',
    type: 'report',
    severity: 'info',
    status: 'unread',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'NTF-003',
    title_th: 'ตรวจพบความผิดปกติใน DMA-BKK-042',
    description_th: 'ระบบ AI ตรวจพบรูปแบบการใช้น้ำผิดปกติในพื้นที่',
    type: 'alert',
    severity: 'high',
    status: 'read',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    metadata: { dmaId: 'DMA-BKK-042' },
  },
  {
    id: 'NTF-004',
    title_th: 'การบำรุงรักษาระบบตามกำหนด',
    description_th: 'ระบบจะบำรุงรักษาวันที่ 15 ม.ค. 2567 เวลา 02:00-04:00 น.',
    type: 'maintenance',
    severity: 'low',
    status: 'read',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'NTF-005',
    title_th: 'แก้ไขปัญหาท่อรั่วสำเร็จ',
    description_th: 'ทีมงานแก้ไขปัญหาท่อรั่วใน DMA-CNX-008 เรียบร้อยแล้ว',
    type: 'alert',
    severity: 'medium',
    status: 'resolved',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    metadata: { dmaId: 'DMA-CNX-008' },
  },
];

export default NotificationPopover;
