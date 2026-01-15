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

// Severity config with enhanced glassmorphism styles
const severityConfig = {
  critical: {
    icon: AlertCircle,
    variant: 'critical' as const,
    color: 'text-white',
    bg: 'bg-gradient-to-br from-red-500 to-rose-600',
    glow: 'shadow-red-500/40',
    border: 'border-l-red-500',
    ring: 'ring-red-500/20',
    pulse: true,
  },
  high: {
    icon: AlertTriangle,
    variant: 'high' as const,
    color: 'text-white',
    bg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    glow: 'shadow-orange-500/30',
    border: 'border-l-orange-500',
    ring: 'ring-orange-500/20',
    pulse: false,
  },
  medium: {
    icon: AlertTriangle,
    variant: 'medium' as const,
    color: 'text-white',
    bg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    glow: 'shadow-amber-500/30',
    border: 'border-l-amber-500',
    ring: 'ring-amber-500/20',
    pulse: false,
  },
  low: {
    icon: Info,
    variant: 'low' as const,
    color: 'text-white',
    bg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    glow: 'shadow-blue-500/30',
    border: 'border-l-blue-500',
    ring: 'ring-blue-500/20',
    pulse: false,
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
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertCircle className="h-4 w-4 text-[var(--pwa-cyan)]" />
            การแจ้งเตือนล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl p-3 bg-muted/30"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Skeleton className="h-9 w-9 rounded-xl skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-lg skeleton-shimmer" />
                  <Skeleton className="h-3 w-1/2 rounded-lg skeleton-shimmer" />
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
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertCircle className="h-4 w-4 text-[var(--pwa-cyan)]" />
            การแจ้งเตือนล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              ไม่มีการแจ้งเตือนที่ต้องดำเนินการ
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              ระบบทำงานปกติ
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertCircle className="h-4 w-4 text-[var(--pwa-cyan)]" />
          การแจ้งเตือนล่าสุด
        </CardTitle>
        {showViewAll && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[var(--pwa-cyan)] hover:text-[var(--pwa-cyan)] hover:bg-[var(--pwa-cyan)]/10 transition-all duration-300"
          >
            <Link href="/alerts" className="flex items-center gap-1 group">
              ดูทั้งหมด
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px] modern-scrollbar">
          <div className="space-y-2">
            {displayedAlerts.map((alert, index) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'group relative flex items-start gap-3 rounded-xl p-3',
                    'border-l-4 transition-all duration-300',
                    'bg-card hover:bg-muted/50',
                    'hover:-translate-y-0.5 hover:shadow-md',
                    'ring-1 ring-border/30 hover:ring-border/50',
                    config.border,
                    config.pulse && 'animate-breathing-glow'
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Severity icon with glow */}
                  <div
                    className={cn(
                      'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      'shadow-lg transition-all duration-300',
                      'group-hover:scale-110 group-hover:rotate-3',
                      config.bg,
                      config.glow
                    )}
                  >
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <Icon className={cn('relative h-4 w-4', config.color)} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium transition-colors group-hover:text-foreground">
                        {alert.title_th}
                      </p>
                      <Badge
                        variant={config.variant}
                        className={cn(
                          'shrink-0 shadow-sm transition-all duration-300',
                          'group-hover:scale-105',
                          config.ring
                        )}
                      >
                        {alert.severity === 'critical'
                          ? 'วิกฤต'
                          : alert.severity === 'high'
                          ? 'สูง'
                          : alert.severity === 'medium'
                          ? 'ปานกลาง'
                          : 'ต่ำ'}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground/80 mt-0.5">
                      {alert.dma_name} • {formatRelativeTime(alert.triggered_at)}
                    </p>
                  </div>

                  {/* Hover chevron */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 self-center" />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
