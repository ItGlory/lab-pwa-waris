'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

// Animated number component
function AnimatedValue({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setDisplayValue(value);
      setIsAnimating(false);
    }, 50);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span
      className={cn(
        'kpi-value transition-all duration-500',
        isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      )}
    >
      {displayValue}
    </span>
  );
}

// Skeleton with shimmer effect
function KPICardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded skeleton-shimmer" />
            <div className="h-8 w-32 rounded skeleton-shimmer" />
            <div className="h-3 w-20 rounded skeleton-shimmer" />
          </div>
          <div className="h-12 w-12 rounded-xl skeleton-shimmer" />
        </div>
      </CardContent>
    </Card>
  );
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
    return <KPICardSkeleton className={className} />;
  }

  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
      ? TrendingDown
      : Minus;

  // Status colors with gradients for modern look
  const statusStyles = {
    normal: {
      bg: 'status-gradient-normal',
      iconBg: 'bg-emerald-500/20',
      ring: 'ring-emerald-500/20',
    },
    warning: {
      bg: 'status-gradient-warning',
      iconBg: 'bg-amber-500/20',
      ring: 'ring-amber-500/20',
    },
    critical: {
      bg: 'status-gradient-critical',
      iconBg: 'bg-red-500/20',
      ring: 'ring-red-500/20',
    },
  };

  const currentStyle = status ? statusStyles[status] : null;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden card-hover',
        'border border-border/50',
        status && 'ring-1',
        status && statusStyles[status].ring,
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          'bg-gradient-to-br from-[var(--pwa-cyan-light)]/5 to-transparent'
        )}
      />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <AnimatedValue value={value} />
              {unit && (
                <span className="text-sm font-medium text-muted-foreground">
                  {unit}
                </span>
              )}
            </div>
            {trend && (
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                  trend.direction === 'up' &&
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  trend.direction === 'down' &&
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                  trend.direction === 'stable' &&
                    'bg-muted text-muted-foreground'
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
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                currentStyle
                  ? currentStyle.bg
                  : 'bg-gradient-to-br from-[var(--pwa-blue-deep)] to-[var(--pwa-navy)]'
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Status indicator line at bottom */}
        {status && (
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 h-1',
              currentStyle?.bg
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
