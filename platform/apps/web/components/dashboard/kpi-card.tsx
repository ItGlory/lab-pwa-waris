'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, type LucideIcon } from 'lucide-react';
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

// Animated number component with spring effect
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
        'kpi-value transition-all duration-500 ease-out',
        isAnimating ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
      )}
    >
      {displayValue}
    </span>
  );
}

// Enhanced skeleton with shimmer effect
function KPICardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded-lg skeleton-shimmer" />
            <div className="h-9 w-36 rounded-lg skeleton-shimmer" />
            <div className="h-6 w-24 rounded-full skeleton-shimmer" />
          </div>
          <div className="h-14 w-14 rounded-2xl skeleton-shimmer" />
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

  // Enhanced status colors with modern glass effect
  const statusStyles = {
    normal: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-500/10',
      ring: 'ring-emerald-500/30',
      glow: 'shadow-emerald-500/20',
      accent: 'from-emerald-500/10',
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/10',
      ring: 'ring-amber-500/30',
      glow: 'shadow-amber-500/20',
      accent: 'from-amber-500/10',
    },
    critical: {
      bg: 'bg-gradient-to-br from-red-500 to-rose-600',
      iconBg: 'bg-red-500/10',
      ring: 'ring-red-500/30',
      glow: 'shadow-red-500/20',
      accent: 'from-red-500/10',
    },
  };

  const currentStyle = status ? statusStyles[status] : null;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        'border border-border/40 bg-card',
        'backdrop-blur-xl backdrop-saturate-150',
        'shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50',
        'transition-all duration-500 ease-out',
        'hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-950/70',
        'hover:-translate-y-1 hover:border-border/60',
        status && 'ring-2',
        status && currentStyle?.ring,
        status && `shadow-lg ${currentStyle?.glow}`,
        className
      )}
    >
      {/* Animated gradient background on hover */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100',
          'bg-gradient-to-br to-transparent',
          currentStyle?.accent || 'from-[var(--pwa-cyan)]/5'
        )}
      />

      {/* Floating orb decoration */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--pwa-cyan)]/10 to-transparent opacity-50 blur-2xl transition-all duration-500 group-hover:opacity-80 group-hover:scale-110" />

      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground/80 truncate tracking-wide uppercase">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <AnimatedValue value={value} />
              {unit && (
                <span className="text-sm font-medium text-muted-foreground/70">
                  {unit}
                </span>
              )}
            </div>
            {trend && (
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                  'backdrop-blur-sm transition-all duration-300',
                  trend.direction === 'up' &&
                    'bg-red-500/10 text-red-600 ring-1 ring-red-500/20 dark:bg-red-500/20 dark:text-red-400',
                  trend.direction === 'down' &&
                    'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
                  trend.direction === 'stable' &&
                    'bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/20 dark:text-slate-400'
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
                'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                'shadow-lg transition-all duration-500',
                'group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl',
                currentStyle
                  ? `${currentStyle.bg} ${currentStyle.glow}`
                  : 'bg-gradient-to-br from-[var(--pwa-blue-deep)] to-[var(--pwa-navy)] shadow-[var(--pwa-blue-deep)]/30'
              )}
            >
              {/* Icon glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Icon className="relative h-6 w-6 text-white drop-shadow-sm" />
            </div>
          )}
        </div>

        {/* Enhanced status indicator */}
        {status && (
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
            <div
              className={cn(
                'h-1 w-full',
                currentStyle?.bg
              )}
            />
            {/* Animated shimmer on status bar */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
