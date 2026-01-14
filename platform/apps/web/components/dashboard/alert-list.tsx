'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, AlertTriangle, Info, CheckCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import type { Alert } from '@/hooks/use-alerts';

interface AlertListProps {
  alerts: Alert[];
  loading?: boolean;
  maxItems?: number;
  showViewAll?: boolean;
}

// Severity config using CSS variables for PWA brand consistency
const severityConfig = {
  critical: {
    icon: AlertCircle,
    variant: 'critical' as const,
    color: 'text-white',
    bg: 'bg-[var(--status-critical)]',
  },
  high: {
    icon: AlertTriangle,
    variant: 'high' as const,
    color: 'text-white',
    bg: 'bg-orange-500',
  },
  medium: {
    icon: AlertTriangle,
    variant: 'medium' as const,
    color: 'text-white',
    bg: 'bg-[var(--status-warning)]',
  },
  low: {
    icon: Info,
    variant: 'low' as const,
    color: 'text-white',
    bg: 'bg-[var(--status-info)]',
  },
};

export function AlertList({
  alerts,
  loading = false,
  maxItems = 5,
  showViewAll = true,
}: AlertListProps) {
  const displayedAlerts = alerts.slice(0, maxItems);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">การแจ้งเตือนล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">การแจ้งเตือนล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="mt-2 text-sm text-muted-foreground">
              ไม่มีการแจ้งเตือนที่ต้องดำเนินการ
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">การแจ้งเตือนล่าสุด</CardTitle>
        {showViewAll && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/alerts" className="flex items-center gap-1">
              ดูทั้งหมด
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-3">
            {displayedAlerts.map((alert) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      config.bg
                    )}
                  >
                    <Icon className={cn('h-4 w-4', config.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {alert.title_th}
                      </p>
                      <Badge variant={config.variant} className="shrink-0">
                        {alert.severity === 'critical'
                          ? 'วิกฤต'
                          : alert.severity === 'high'
                          ? 'สูง'
                          : alert.severity === 'medium'
                          ? 'ปานกลาง'
                          : 'ต่ำ'}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {alert.dma_name} • {formatRelativeTime(alert.triggered_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
