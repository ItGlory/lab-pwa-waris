'use client';

import * as React from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Eye,
  FileText,
  Info,
  Settings,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import {
  NotificationDetail,
  sampleNotification,
} from './notification-detail';

// Sample notifications for the list
const sampleNotifications = [
  sampleNotification,
  {
    ...sampleNotification,
    id: 'NTF-2567-002',
    title_th: 'รายงานประจำวันพร้อมแล้ว',
    description_th: 'รายงานน้ำสูญเสียประจำวันที่ 14 มกราคม 2567 พร้อมให้ดาวน์โหลดแล้ว',
    type: 'report' as const,
    severity: 'info' as const,
    status: 'read' as const,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    source: { type: 'system' as const, name: 'ระบบรายงาน' },
    metadata: undefined,
  },
  {
    ...sampleNotification,
    id: 'NTF-2567-003',
    title_th: 'ตรวจพบความผิดปกติใน DMA-BKK-042',
    description_th: 'ระบบ AI ตรวจพบรูปแบบการใช้น้ำผิดปกติในพื้นที่ DMA-BKK-042',
    severity: 'high' as const,
    status: 'acknowledged' as const,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    acknowledgedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    metadata: {
      dmaId: 'DMA-BKK-042',
      dmaName: 'พื้นที่กรุงเทพ เขต 42',
      waterLoss: 18.2,
      threshold: 20,
    },
  },
  {
    ...sampleNotification,
    id: 'NTF-2567-004',
    title_th: 'การบำรุงรักษาระบบตามกำหนด',
    description_th: 'ระบบจะทำการบำรุงรักษาในวันที่ 15 มกราคม 2567 เวลา 02:00-04:00 น.',
    type: 'maintenance' as const,
    severity: 'low' as const,
    status: 'read' as const,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    source: { type: 'system' as const, name: 'ระบบบำรุงรักษา' },
    metadata: undefined,
  },
  {
    ...sampleNotification,
    id: 'NTF-2567-005',
    title_th: 'แก้ไขปัญหาท่อรั่วใน DMA-CNX-008 สำเร็จ',
    description_th: 'ทีมงานได้ทำการแก้ไขปัญหาท่อรั่วในพื้นที่เรียบร้อยแล้ว',
    severity: 'medium' as const,
    status: 'resolved' as const,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    metadata: {
      dmaId: 'DMA-CNX-008',
      dmaName: 'พื้นที่เชียงใหม่ เขต 8',
      waterLoss: 12.5,
      threshold: 20,
    },
  },
];

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  high: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  medium: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  low: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  info: { icon: Info, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
};

const typeConfig = {
  alert: { icon: AlertCircle, label_th: 'แจ้งเตือน' },
  system: { icon: Settings, label_th: 'ระบบ' },
  report: { icon: FileText, label_th: 'รายงาน' },
  maintenance: { icon: Settings, label_th: 'บำรุงรักษา' },
};

const statusConfig = {
  unread: { label_th: 'ยังไม่อ่าน', variant: 'default' as const },
  read: { label_th: 'อ่านแล้ว', variant: 'secondary' as const },
  acknowledged: { label_th: 'รับทราบแล้ว', variant: 'warning' as const },
  resolved: { label_th: 'แก้ไขแล้ว', variant: 'success' as const },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH');
}

export function NotificationDetailDemo() {
  const [selectedNotification, setSelectedNotification] = React.useState<
    typeof sampleNotification | null
  >(null);
  const [notifications, setNotifications] = React.useState(sampleNotifications);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: 'read' as const, readAt: new Date() } : n
      )
    );
    if (selectedNotification?.id === id) {
      setSelectedNotification((prev) =>
        prev ? { ...prev, status: 'read' as const, readAt: new Date() } : null
      );
    }
  };

  const handleAcknowledge = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, status: 'acknowledged' as const, acknowledgedAt: new Date() }
          : n
      )
    );
    if (selectedNotification?.id === id) {
      setSelectedNotification((prev) =>
        prev
          ? { ...prev, status: 'acknowledged' as const, acknowledgedAt: new Date() }
          : null
      );
    }
  };

  const handleResolve = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, status: 'resolved' as const, resolvedAt: new Date() }
          : n
      )
    );
    if (selectedNotification?.id === id) {
      setSelectedNotification((prev) =>
        prev
          ? { ...prev, status: 'resolved' as const, resolvedAt: new Date() }
          : null
      );
    }
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedNotification(null);
  };

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">การแจ้งเตือน</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              จัดการและติดตามการแจ้งเตือนทั้งหมด
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1">
              <Bell className="h-3 w-3" />
              {unreadCount} ยังไม่อ่าน
            </Badge>
            <Button variant="outline" size="sm">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">ทำเครื่องหมาย</span>อ่านทั้งหมด
            </Button>
          </div>
        </div>

        {/* Notification List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">รายการแจ้งเตือน</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {notifications.map((notification) => {
                  const severity = severityConfig[notification.severity];
                  const type = typeConfig[notification.type];
                  const status = statusConfig[notification.status];
                  const SeverityIcon = severity.icon;

                  return (
                    <button
                      key={notification.id}
                      onClick={() => setSelectedNotification(notification as any)}
                      className={cn(
                        'flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50',
                        notification.status === 'unread' && 'bg-blue-50/50 dark:bg-blue-900/10'
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          severity.bg
                        )}
                      >
                        <SeverityIcon className={cn('h-5 w-5', severity.color)} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              'line-clamp-1 text-sm',
                              notification.status === 'unread'
                                ? 'font-semibold'
                                : 'font-medium'
                            )}
                          >
                            {notification.title_th}
                          </p>
                          <Badge
                            variant={status.variant}
                            className="shrink-0 text-xs"
                          >
                            {status.label_th}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {notification.description_th}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {type.label_th}
                          </Badge>
                          <span>•</span>
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          {notification.metadata?.dmaId && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">
                                {notification.metadata.dmaId}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {notification.status === 'unread' && (
                        <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Notification Detail Modal */}
        {selectedNotification && (
          <NotificationDetail
            notification={selectedNotification}
            isOpen={!!selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onMarkAsRead={handleMarkAsRead}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

export default NotificationDetailDemo;
