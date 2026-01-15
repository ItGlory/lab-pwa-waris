'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCheck,
  ChevronDown,
  Filter,
  FileText,
  Info,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import {
  NotificationDetail,
  sampleNotification,
} from '@/components/notifications/notification-detail';
import { useNotifications, type Notification } from '@/hooks/use-notifications';

// Configuration
const severityConfig = {
  critical: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    dot: 'bg-red-500',
    label_th: 'วิกฤต',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    dot: 'bg-orange-500',
    label_th: 'สูง',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    dot: 'bg-amber-500',
    label_th: 'ปานกลาง',
  },
  low: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    dot: 'bg-blue-500',
    label_th: 'ต่ำ',
  },
  info: {
    icon: Info,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    dot: 'bg-muted-foreground',
    label_th: 'ข้อมูล',
  },
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

// Utility functions
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

// Loading Skeleton
function NotificationItemSkeleton() {
  return (
    <div className="flex gap-3 border-b p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// Empty State
function EmptyNotifications({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        การแจ้งเตือนใหม่จะแสดงที่นี่
      </p>
    </div>
  );
}

// Notification Item Component
function NotificationListItem({
  notification,
  onClick,
  isSelected,
}: {
  notification: Notification;
  onClick: () => void;
  isSelected: boolean;
}) {
  const severity = severityConfig[notification.severity];
  const type = typeConfig[notification.type];
  const status = statusConfig[notification.status];
  const SeverityIcon = severity.icon;
  const isUnread = notification.status === 'unread';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 border-b border-border p-4 text-left transition-colors hover:bg-accent',
        isUnread && 'bg-blue-50/50 dark:bg-blue-950/30',
        isSelected && 'bg-blue-100 dark:bg-blue-900/30 border-l-2 border-l-primary'
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
              'line-clamp-1 text-sm text-foreground',
              isUnread ? 'font-semibold' : 'font-medium'
            )}
          >
            {notification.title_th}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={status.variant} className="text-xs">
              {status.label_th}
            </Badge>
            {isUnread && (
              <span className={cn('h-2 w-2 rounded-full', severity.dot)} />
            )}
          </div>
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
              <span className="hidden font-mono sm:inline">
                {notification.metadata.dmaId}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

// Main Page Component
export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const selectedIdFromUrl = searchParams.get('id');

  // Zustand store
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    markAsAcknowledged,
    markAsResolved,
    removeNotification,
    setSelectedNotification,
  } = useNotifications();

  // Local state
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedNotification, setSelectedNotificationLocal] =
    React.useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('all');

  // Handle URL parameter for selected notification
  React.useEffect(() => {
    if (selectedIdFromUrl) {
      const notification = notifications.find((n) => n.id === selectedIdFromUrl);
      if (notification) {
        setSelectedNotificationLocal(notification);
        setIsDetailOpen(true);
      }
    }
  }, [selectedIdFromUrl, notifications]);

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((notification) => {
      // Tab filter
      if (activeTab === 'unread' && notification.status !== 'unread') return false;
      if (activeTab === 'alerts' && notification.type !== 'alert') return false;

      // Type filter
      if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && notification.status !== statusFilter) return false;

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          notification.title_th.toLowerCase().includes(searchLower) ||
          notification.description_th.toLowerCase().includes(searchLower) ||
          notification.metadata?.dmaId?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [notifications, search, typeFilter, statusFilter, activeTab]);

  // Summary counts
  const counts = {
    all: notifications.length,
    unread: unreadCount(),
    alerts: notifications.filter((n) => n.type === 'alert').length,
  };

  // Handlers
  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotificationLocal(notification);
    setIsDetailOpen(true);
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedNotificationLocal(null);
    // Clear URL parameter
    if (selectedIdFromUrl) {
      window.history.replaceState({}, '', '/notifications');
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    if (selectedNotification?.id === id) {
      setSelectedNotificationLocal({
        ...selectedNotification,
        status: 'read',
        readAt: new Date(),
      });
    }
  };

  const handleAcknowledge = (id: string) => {
    markAsAcknowledged(id);
    if (selectedNotification?.id === id) {
      setSelectedNotificationLocal({
        ...selectedNotification,
        status: 'acknowledged',
        acknowledgedAt: new Date(),
      });
    }
  };

  const handleResolve = (id: string) => {
    markAsResolved(id);
    if (selectedNotification?.id === id) {
      setSelectedNotificationLocal({
        ...selectedNotification,
        status: 'resolved',
        resolvedAt: new Date(),
      });
    }
  };

  const handleDelete = (id: string) => {
    removeNotification(id);
    handleCloseDetail();
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = search || typeFilter !== 'all' || statusFilter !== 'all';

  // Convert Notification to NotificationDetail format for the modal
  const notificationForDetail = selectedNotification
    ? {
        ...selectedNotification,
        actions: [],
        timeline: [
          {
            id: 'TL-001',
            event: 'Notification created',
            event_th: 'สร้างการแจ้งเตือน',
            timestamp: selectedNotification.createdAt,
            icon: 'create' as const,
          },
          ...(selectedNotification.readAt
            ? [
                {
                  id: 'TL-002',
                  event: 'Notification read',
                  event_th: 'อ่านการแจ้งเตือน',
                  timestamp: selectedNotification.readAt,
                  icon: 'read' as const,
                },
              ]
            : []),
          ...(selectedNotification.acknowledgedAt
            ? [
                {
                  id: 'TL-003',
                  event: 'Notification acknowledged',
                  event_th: 'รับทราบการแจ้งเตือน',
                  timestamp: selectedNotification.acknowledgedAt,
                  icon: 'acknowledge' as const,
                },
              ]
            : []),
          ...(selectedNotification.resolvedAt
            ? [
                {
                  id: 'TL-004',
                  event: 'Issue resolved',
                  event_th: 'แก้ไขปัญหาเรียบร้อย',
                  timestamp: selectedNotification.resolvedAt,
                  icon: 'resolve' as const,
                },
              ]
            : []),
        ],
      }
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">การแจ้งเตือน</h1>
          {counts.unread > 0 && (
            <Badge variant="default" className="gap-1">
              <Bell className="h-3 w-3" />
              {counts.unread} ใหม่
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {counts.unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ทำเครื่องหมาย</span>อ่านทั้งหมด
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            <ChevronDown
              className={cn(
                'ml-1 h-3 w-3 transition-transform',
                showFilters && 'rotate-180'
              )}
            />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-3">
          <div className="relative min-w-[150px] max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 bg-background pl-8 text-sm"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[130px] text-sm">
              <SelectValue placeholder="ประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกประเภท</SelectItem>
              <SelectItem value="alert">แจ้งเตือน</SelectItem>
              <SelectItem value="system">ระบบ</SelectItem>
              <SelectItem value="report">รายงาน</SelectItem>
              <SelectItem value="maintenance">บำรุงรักษา</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px] text-sm">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="unread">ยังไม่อ่าน</SelectItem>
              <SelectItem value="read">อ่านแล้ว</SelectItem>
              <SelectItem value="acknowledged">รับทราบแล้ว</SelectItem>
              <SelectItem value="resolved">แก้ไขแล้ว</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={clearFilters}
            >
              <X className="mr-1 h-3 w-3" />
              ล้าง
            </Button>
          )}
        </div>
      )}

      {/* Tabs and Content */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="border-b pb-3">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 gap-1.5 px-3 sm:flex-none sm:px-4">
                ทั้งหมด
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {counts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 gap-1.5 px-3 sm:flex-none sm:px-4">
                ยังไม่อ่าน
                {counts.unread > 0 && (
                  <Badge variant="default" className="h-5 px-1.5 text-xs">
                    {counts.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex-1 gap-1.5 px-3 sm:flex-none sm:px-4">
                แจ้งเตือน
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {counts.alerts}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-0">
            <TabsContent value="all" className="m-0">
              <NotificationList
                notifications={filteredNotifications}
                isLoading={isLoading}
                selectedId={selectedNotification?.id}
                onNotificationClick={handleNotificationClick}
                emptyMessage="ไม่มีการแจ้งเตือน"
              />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <NotificationList
                notifications={filteredNotifications}
                isLoading={isLoading}
                selectedId={selectedNotification?.id}
                onNotificationClick={handleNotificationClick}
                emptyMessage="ไม่มีการแจ้งเตือนที่ยังไม่อ่าน"
              />
            </TabsContent>
            <TabsContent value="alerts" className="m-0">
              <NotificationList
                notifications={filteredNotifications}
                isLoading={isLoading}
                selectedId={selectedNotification?.id}
                onNotificationClick={handleNotificationClick}
                emptyMessage="ไม่มีการแจ้งเตือนประเภทแจ้งเตือน"
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Notification Detail Modal */}
      {notificationForDetail && (
        <NotificationDetail
          notification={notificationForDetail}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onMarkAsRead={handleMarkAsRead}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// Notification List Component
function NotificationList({
  notifications,
  isLoading,
  selectedId,
  onNotificationClick,
  emptyMessage,
}: {
  notifications: Notification[];
  isLoading: boolean;
  selectedId?: string;
  onNotificationClick: (notification: Notification) => void;
  emptyMessage: string;
}) {
  if (isLoading) {
    return (
      <div>
        {[1, 2, 3, 4, 5].map((i) => (
          <NotificationItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return <EmptyNotifications message={emptyMessage} />;
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
      <div>
        {notifications.map((notification) => (
          <NotificationListItem
            key={notification.id}
            notification={notification}
            onClick={() => onNotificationClick(notification)}
            isSelected={selectedId === notification.id}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
