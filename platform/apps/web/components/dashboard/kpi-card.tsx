'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  titleEn?: string;
  value: number | string;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    label: string;
  };
  status?: 'normal' | 'warning' | 'critical';
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  unit,
  trend,
  status,
  icon: Icon,
  loading = false,
  className,
}: KPICardProps) {
  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
      ? TrendingDown
      : Minus;

  const statusColors = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  const iconColors = {
    normal: 'text-white',
    warning: 'text-white',
    critical: 'text-white',
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="kpi-value">{value}</span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs',
                  trend.direction === 'up' && 'text-red-600 dark:text-red-400',
                  trend.direction === 'down' && 'text-green-600 dark:text-green-400',
                  trend.direction === 'stable' && 'text-muted-foreground'
                )}
              >
                <TrendIcon className="h-3 w-3" />
                <span>{trend.label}</span>
              </div>
            )}
          </div>

          {Icon && (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                status ? statusColors[status] : 'bg-primary/10'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  status ? iconColors[status] : 'text-primary'
                )}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
