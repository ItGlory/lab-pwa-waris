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

// Configuration
const severityConfig = {
  critical: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    dot: 'bg-red-500',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    dot: 'bg-orange-500',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    dot: 'bg-amber-500',
  },
  low: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    dot: 'bg-blue-500',
  },
  info: {
    icon: Info,
    color: 'text-slate-500',
    bg: 'bg-slate-100 dark:bg-slate-800',
    dot: 'bg-slate-500',
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

// Loading Skeleton
function NotificationItemSkeleton() {
  return (
    <div className="flex gap-3 p-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// Empty State
function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Bell className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
        ไม่มีการแจ้งเตือน
      </p>
      <p className="mt-1 text-xs text-slate-500">
        คุณจะได้รับการแจ้งเตือนที่นี่
      </p>
    </div>
  );
}

// Notification Item Component
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
        'flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
        isUnread && 'bg-blue-50/50 dark:bg-blue-900/10'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          severity.bg
        )}
      >
        <SeverityIcon className={cn('h-4 w-4', severity.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              'line-clamp-1 text-sm',
              isUnread ? 'font-semibold' : 'font-medium'
            )}
          >
            {notification.title_th}
          </p>
          {isUnread && (
            <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', severity.dot)} />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {notification.description_th}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
          <span>{formatRelativeTime(notification.createdAt)}</span>
          {notification.metadata?.dmaId && (
            <>
              <span>•</span>
              <span className="font-mono">{notification.metadata.dmaId}</span>
            </>
          )}
        </div>
      </div>
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
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>การแจ้งเตือน</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        className="w-80 p-0 sm:w-96"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">การแจ้งเตือน</h3>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-xs">
                {unreadCount} ใหม่
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              อ่านทั้งหมด
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="divide-y">
              {[1, 2, 3].map((i) => (
                <NotificationItemSkeleton key={i} />
              ))}
            </div>
          ) : latestNotifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="divide-y">
              {latestNotifications.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {!isLoading && latestNotifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-between text-sm"
                onClick={handleViewAll}
                asChild
              >
                <Link href="/notifications">
                  ดูการแจ้งเตือนทั้งหมด
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
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
