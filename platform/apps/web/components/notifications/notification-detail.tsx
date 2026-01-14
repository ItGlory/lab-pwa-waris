'use client';

import * as React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  Info,
  MapPin,
  MoreVertical,
  Settings,
  Share2,
  Trash2,
  User,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Types
interface NotificationDetail {
  id: string;
  title: string;
  title_th: string;
  description: string;
  description_th: string;
  type: 'alert' | 'system' | 'report' | 'maintenance';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'unread' | 'read' | 'acknowledged' | 'resolved';
  createdAt: Date;
  readAt?: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  source: {
    type: 'dma' | 'system' | 'ai' | 'user';
    name: string;
    id?: string;
  };
  metadata?: {
    dmaId?: string;
    dmaName?: string;
    waterLoss?: number;
    threshold?: number;
    recommendation?: string;
    recommendation_th?: string;
    aiConfidence?: number;
    relatedAlerts?: string[];
  };
  actions?: NotificationAction[];
  timeline?: TimelineEvent[];
}

interface NotificationAction {
  id: string;
  label: string;
  label_th: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
}

interface TimelineEvent {
  id: string;
  event: string;
  event_th: string;
  timestamp: Date;
  user?: string;
  icon?: 'create' | 'read' | 'acknowledge' | 'resolve' | 'update';
}

interface NotificationDetailProps {
  notification: NotificationDetail;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (action: string, notificationId: string) => void;
  onMarkAsRead?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

// Configuration
const severityConfig = {
  critical: {
    icon: AlertCircle,
    variant: 'destructive' as const,
    bgColor: 'bg-red-500',
    textColor: 'text-red-500',
    borderColor: 'border-red-500',
    label: 'Critical',
    label_th: 'วิกฤต',
  },
  high: {
    icon: AlertTriangle,
    variant: 'destructive' as const,
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-500',
    borderColor: 'border-orange-500',
    label: 'High',
    label_th: 'สูง',
  },
  medium: {
    icon: AlertTriangle,
    variant: 'warning' as const,
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500',
    label: 'Medium',
    label_th: 'ปานกลาง',
  },
  low: {
    icon: Info,
    variant: 'secondary' as const,
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500',
    label: 'Low',
    label_th: 'ต่ำ',
  },
  info: {
    icon: Info,
    variant: 'outline' as const,
    bgColor: 'bg-slate-500',
    textColor: 'text-slate-500',
    borderColor: 'border-slate-500',
    label: 'Info',
    label_th: 'ข้อมูล',
  },
};

const typeConfig = {
  alert: {
    icon: AlertCircle,
    label: 'Alert',
    label_th: 'แจ้งเตือน',
    color: 'text-red-500',
  },
  system: {
    icon: Settings,
    label: 'System',
    label_th: 'ระบบ',
    color: 'text-blue-500',
  },
  report: {
    icon: FileText,
    label: 'Report',
    label_th: 'รายงาน',
    color: 'text-green-500',
  },
  maintenance: {
    icon: Settings,
    label: 'Maintenance',
    label_th: 'บำรุงรักษา',
    color: 'text-purple-500',
  },
};

const statusConfig = {
  unread: {
    label: 'Unread',
    label_th: 'ยังไม่อ่าน',
    variant: 'default' as const,
    color: 'bg-blue-500',
  },
  read: {
    label: 'Read',
    label_th: 'อ่านแล้ว',
    variant: 'secondary' as const,
    color: 'bg-slate-500',
  },
  acknowledged: {
    label: 'Acknowledged',
    label_th: 'รับทราบแล้ว',
    variant: 'warning' as const,
    color: 'bg-amber-500',
  },
  resolved: {
    label: 'Resolved',
    label_th: 'แก้ไขแล้ว',
    variant: 'success' as const,
    color: 'bg-green-500',
  },
};

const timelineIconConfig = {
  create: Bell,
  read: Eye,
  acknowledge: CheckCircle2,
  resolve: CheckCircle2,
  update: Settings,
};

// Utility functions
function formatThaiDate(date: Date): string {
  const thaiMonths = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

function formatThaiDateTime(date: Date): string {
  const dateStr = formatThaiDate(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${dateStr} ${hours}:${minutes} น.`;
}

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
  return formatThaiDate(date);
}

// Loading Skeleton Component
function NotificationDetailSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}

// Main Component
export function NotificationDetail({
  notification,
  isOpen,
  onClose,
  onAction,
  onMarkAsRead,
  onAcknowledge,
  onResolve,
  onDelete,
  isLoading = false,
}: NotificationDetailProps) {
  const [activeTab, setActiveTab] = React.useState('details');

  const severity = severityConfig[notification.severity];
  const type = typeConfig[notification.type];
  const status = statusConfig[notification.status];
  const SeverityIcon = severity.icon;
  const TypeIcon = type.icon;

  // Auto mark as read when opened
  React.useEffect(() => {
    if (isOpen && notification.status === 'unread' && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [isOpen, notification.id, notification.status, onMarkAsRead]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-hidden p-0 sm:max-h-[85vh]">
        {isLoading ? (
          <NotificationDetailSkeleton />
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="space-y-0 p-0">
              <div
                className={cn(
                  'relative p-4 sm:p-6',
                  severity.bgColor,
                  'text-white'
                )}
              >
                {/* Close button for mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-white hover:bg-white/20 sm:hidden"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-12 sm:w-12">
                    <SeverityIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1 pr-8 sm:pr-0">
                    <DialogTitle className="mb-1 line-clamp-2 text-lg font-semibold leading-tight text-white sm:text-xl">
                      {notification.title_th}
                    </DialogTitle>
                    <DialogDescription className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                      <Badge
                        variant="outline"
                        className="border-white/50 bg-white/10 text-white"
                      >
                        {severity.label_th}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-white/50 bg-white/10 text-white"
                      >
                        {type.label_th}
                      </Badge>
                      <span className="hidden text-white/60 sm:inline">•</span>
                      <span className="text-white/80">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </DialogDescription>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="mt-3 flex items-center justify-between sm:mt-4">
                  <Badge
                    className={cn(
                      'border-0',
                      status.color,
                      'text-white'
                    )}
                  >
                    {status.label_th}
                  </Badge>

                  {/* Actions dropdown - desktop */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden text-white hover:bg-white/20 sm:flex"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        แชร์
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete?.(notification.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </DialogHeader>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <TabsList className="mx-4 mt-4 grid w-auto grid-cols-3 sm:mx-6">
                <TabsTrigger value="details" className="text-xs sm:text-sm">
                  รายละเอียด
                </TabsTrigger>
                <TabsTrigger value="metadata" className="text-xs sm:text-sm">
                  ข้อมูลเพิ่มเติม
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs sm:text-sm">
                  ประวัติ
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-4 sm:px-6">
                {/* Details Tab */}
                <TabsContent value="details" className="mt-4 space-y-4 pb-4">
                  {/* Description */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        รายละเอียด
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed sm:text-base">
                        {notification.description_th}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Source Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        แหล่งที่มา
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            notification.source.type === 'dma'
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                              : notification.source.type === 'ai'
                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          )}
                        >
                          {notification.source.type === 'dma' ? (
                            <MapPin className="h-5 w-5" />
                          ) : notification.source.type === 'ai' ? (
                            <Settings className="h-5 w-5" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {notification.source.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.source.type === 'dma'
                              ? 'พื้นที่จ่ายน้ำย่อย'
                              : notification.source.type === 'ai'
                                ? 'ระบบ AI'
                                : notification.source.type === 'system'
                                  ? 'ระบบ'
                                  : 'ผู้ใช้งาน'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timestamps */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        ข้อมูลเวลา
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              สร้างเมื่อ
                            </p>
                            <p className="text-sm font-medium">
                              {formatThaiDateTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                        {notification.readAt && (
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                อ่านเมื่อ
                              </p>
                              <p className="text-sm font-medium">
                                {formatThaiDateTime(notification.readAt)}
                              </p>
                            </div>
                          </div>
                        )}
                        {notification.acknowledgedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                รับทราบเมื่อ
                              </p>
                              <p className="text-sm font-medium">
                                {formatThaiDateTime(notification.acknowledgedAt)}
                              </p>
                            </div>
                          </div>
                        )}
                        {notification.resolvedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                แก้ไขเมื่อ
                              </p>
                              <p className="text-sm font-medium">
                                {formatThaiDateTime(notification.resolvedAt)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Metadata Tab */}
                <TabsContent value="metadata" className="mt-4 space-y-4 pb-4">
                  {notification.metadata ? (
                    <>
                      {/* DMA Info */}
                      {notification.metadata.dmaId && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              ข้อมูล DMA
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                รหัส DMA
                              </span>
                              <span className="font-mono text-sm font-medium">
                                {notification.metadata.dmaId}
                              </span>
                            </div>
                            {notification.metadata.dmaName && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  ชื่อ DMA
                                </span>
                                <span className="text-sm font-medium">
                                  {notification.metadata.dmaName}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Water Loss Info */}
                      {notification.metadata.waterLoss !== undefined && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              ข้อมูลน้ำสูญเสีย
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  อัตราน้ำสูญเสีย
                                </span>
                                <span
                                  className={cn(
                                    'text-lg font-bold',
                                    notification.metadata.waterLoss > 25
                                      ? 'text-red-500'
                                      : notification.metadata.waterLoss > 15
                                        ? 'text-amber-500'
                                        : 'text-green-500'
                                  )}
                                >
                                  {notification.metadata.waterLoss.toFixed(1)}%
                                </span>
                              </div>
                              <Progress
                                value={Math.min(
                                  notification.metadata.waterLoss,
                                  100
                                )}
                                className={cn(
                                  'h-2',
                                  notification.metadata.waterLoss > 25
                                    ? '[&>div]:bg-red-500'
                                    : notification.metadata.waterLoss > 15
                                      ? '[&>div]:bg-amber-500'
                                      : '[&>div]:bg-green-500'
                                )}
                              />
                            </div>
                            {notification.metadata.threshold && (
                              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                <span className="text-sm text-muted-foreground">
                                  ค่าเกณฑ์
                                </span>
                                <span className="text-sm font-medium">
                                  {notification.metadata.threshold}%
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* AI Recommendation */}
                      {notification.metadata.recommendation_th && (
                        <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/10">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-purple-500" />
                              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                คำแนะนำจาก AI
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed">
                              {notification.metadata.recommendation_th}
                            </p>
                            {notification.metadata.aiConfidence && (
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  ความเชื่อมั่น:
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {(
                                    notification.metadata.aiConfidence * 100
                                  ).toFixed(0)}
                                  %
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Related Alerts */}
                      {notification.metadata.relatedAlerts &&
                        notification.metadata.relatedAlerts.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                การแจ้งเตือนที่เกี่ยวข้อง
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {notification.metadata.relatedAlerts.map(
                                  (alertId) => (
                                    <Badge
                                      key={alertId}
                                      variant="outline"
                                      className="cursor-pointer hover:bg-muted"
                                    >
                                      #{alertId}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                    </>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Info className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          ไม่มีข้อมูลเพิ่มเติม
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="mt-4 pb-4">
                  {notification.timeline && notification.timeline.length > 0 ? (
                    <div className="relative space-y-0">
                      {notification.timeline.map((event, index) => {
                        const IconComponent =
                          timelineIconConfig[event.icon || 'create'];
                        const isLast =
                          index === notification.timeline!.length - 1;

                        return (
                          <div key={event.id} className="relative flex gap-4">
                            {/* Timeline line */}
                            {!isLast && (
                              <div className="absolute left-[19px] top-10 h-full w-px bg-border" />
                            )}

                            {/* Icon */}
                            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-6">
                              <p className="font-medium">{event.event_th}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatThaiDateTime(event.timestamp)}
                                </span>
                                {event.user && (
                                  <>
                                    <span>•</span>
                                    <span>{event.user}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          ไม่มีประวัติ
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Footer Actions */}
            <DialogFooter className="flex-col gap-2 border-t p-4 sm:flex-row sm:p-6">
              {/* Mobile actions */}
              <div className="flex w-full gap-2 sm:hidden">
                {notification.status === 'unread' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onMarkAsRead?.(notification.id)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    อ่านแล้ว
                  </Button>
                )}
                {notification.status !== 'acknowledged' &&
                  notification.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onAcknowledge?.(notification.id)}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      รับทราบ
                    </Button>
                  )}
                {notification.status !== 'resolved' && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onResolve?.(notification.id)}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    แก้ไขแล้ว
                  </Button>
                )}
              </div>

              {/* Desktop actions */}
              <div className="hidden w-full items-center justify-between sm:flex">
                <Button variant="ghost" onClick={onClose}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  ย้อนกลับ
                </Button>
                <div className="flex gap-2">
                  {notification.status === 'unread' && (
                    <Button
                      variant="outline"
                      onClick={() => onMarkAsRead?.(notification.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      ทำเครื่องหมายว่าอ่านแล้ว
                    </Button>
                  )}
                  {notification.status !== 'acknowledged' &&
                    notification.status !== 'resolved' && (
                      <Button
                        variant="outline"
                        onClick={() => onAcknowledge?.(notification.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        รับทราบ
                      </Button>
                    )}
                  {notification.status !== 'resolved' && (
                    <Button onClick={() => onResolve?.(notification.id)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      แก้ไขแล้ว
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Sample data for demonstration
export const sampleNotification: NotificationDetail = {
  id: 'NTF-2567-001',
  title: 'High Water Loss Detected in DMA-NKR-015',
  title_th: 'ตรวจพบน้ำสูญเสียสูงใน DMA-NKR-015',
  description:
    'Water loss rate has exceeded the threshold of 25%. Current loss rate is 32.5%. Immediate investigation recommended.',
  description_th:
    'อัตราน้ำสูญเสียเกินค่าเกณฑ์ที่กำหนดไว้ที่ 25% โดยอัตราน้ำสูญเสียปัจจุบันอยู่ที่ 32.5% แนะนำให้ตรวจสอบโดยด่วน',
  type: 'alert',
  severity: 'critical',
  status: 'unread',
  createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  source: {
    type: 'ai',
    name: 'ระบบวิเคราะห์ AI',
    id: 'AI-ANOMALY-001',
  },
  metadata: {
    dmaId: 'DMA-NKR-015',
    dmaName: 'พื้นที่นครราชสีมา เขต 15',
    waterLoss: 32.5,
    threshold: 25,
    recommendation:
      'Check for potential pipe bursts in sectors 3 and 4. Historical data suggests increased leak probability in these areas during winter months.',
    recommendation_th:
      'ตรวจสอบท่อแตกรั่วในเขต 3 และ 4 ข้อมูลในอดีตบ่งชี้ว่ามีความเป็นไปได้ที่จะเกิดการรั่วไหลสูงในพื้นที่เหล่านี้ในช่วงฤดูหนาว',
    aiConfidence: 0.87,
    relatedAlerts: ['NTF-2567-098', 'NTF-2567-099'],
  },
  timeline: [
    {
      id: 'TL-001',
      event: 'Notification created',
      event_th: 'สร้างการแจ้งเตือน',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      icon: 'create',
    },
    {
      id: 'TL-002',
      event: 'AI analysis completed',
      event_th: 'การวิเคราะห์ AI เสร็จสิ้น',
      timestamp: new Date(Date.now() - 29 * 60 * 1000),
      icon: 'update',
    },
  ],
};

export default NotificationDetail;
