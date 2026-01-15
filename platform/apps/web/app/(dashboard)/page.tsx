'use client';

import * as React from 'react';
import {
  Droplets,
  ArrowDownToLine,
  ArrowUpFromLine,
  Percent,
  Bell,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { AlertList } from '@/components/dashboard/alert-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/use-dashboard';
import { useAlerts } from '@/hooks/use-alerts';
import { formatNumber, formatPercent } from '@/lib/formatting';
import { cn } from '@/lib/utils';

// Status card with innovative glassmorphism design
function StatusCard({
  label,
  labelTh,
  count,
  variant,
}: {
  label: string;
  labelTh: string;
  count: number;
  variant: 'normal' | 'warning' | 'critical';
}) {
  const styles = {
    normal: {
      gradient: 'from-emerald-500 via-emerald-500 to-teal-500',
      badge: 'success' as const,
      light: 'text-emerald-100',
      glow: 'shadow-emerald-500/40',
      ring: 'ring-emerald-400/30',
    },
    warning: {
      gradient: 'from-amber-500 via-orange-500 to-amber-500',
      badge: 'warning' as const,
      light: 'text-amber-100',
      glow: 'shadow-amber-500/40',
      ring: 'ring-amber-400/30',
    },
    critical: {
      gradient: 'from-red-500 via-rose-500 to-red-500',
      badge: 'critical' as const,
      light: 'text-red-100',
      glow: 'shadow-red-500/40',
      ring: 'ring-red-400/30',
    },
  };

  const style = styles[variant];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 text-white',
        'bg-gradient-to-br',
        style.gradient,
        'shadow-xl transition-all duration-500 ease-out',
        style.glow,
        'hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-1',
        'ring-1',
        style.ring,
        'shine-effect'
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/30 blur-2xl animate-float" />
        <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/20 blur-xl" style={{ animationDelay: '2s' }} />
        <div className="absolute right-1/3 top-1/2 h-16 w-16 rounded-full bg-white/10 blur-lg animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />

      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <p className={cn('text-sm font-medium tracking-wide uppercase opacity-90', style.light)}>{labelTh}</p>
          <p className="text-4xl font-black tabular-nums tracking-tight drop-shadow-lg">{count}</p>
        </div>
        <Badge variant={style.badge} className="shadow-lg backdrop-blur-sm ring-1 ring-white/20">
          {label}
        </Badge>
      </div>
    </div>
  );
}

// Regional item with enhanced progress bar
function RegionalItem({
  name,
  dmaCount,
  percentage,
  status,
  index,
}: {
  name: string;
  dmaCount: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
  index: number;
}) {
  const statusStyles = {
    normal: {
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/5',
      ring: 'ring-emerald-500/10',
      dot: 'bg-emerald-500',
    },
    warning: {
      bar: 'bg-gradient-to-r from-amber-500 to-orange-400',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/5',
      ring: 'ring-amber-500/10',
      dot: 'bg-amber-500',
    },
    critical: {
      bar: 'bg-gradient-to-r from-red-500 to-rose-400',
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-500/5',
      ring: 'ring-red-500/10',
      dot: 'bg-red-500',
    },
  };

  const style = statusStyles[status];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl p-4',
        'border border-border/30 bg-card',
        'backdrop-blur-sm transition-all duration-300',
        'hover:border-border/50 hover:shadow-lg hover:-translate-y-0.5',
        'hover:shadow-md',
        style.ring
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Subtle background glow */}
      <div className={cn('absolute -right-12 -top-12 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-50', style.bg)} />

      <div className="relative flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', style.dot)} />
            <p className="font-semibold truncate">{name}</p>
          </div>
          <p className="ml-4 text-xs text-muted-foreground/70">{dmaCount} DMA</p>
        </div>
        <div className="text-right">
          <p className={cn('text-xl font-bold tabular-nums tracking-tight', style.text)}>
            {formatPercent(percentage)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">เฉลี่ยสูญเสีย</p>
        </div>
      </div>

      {/* Enhanced progress bar */}
      <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out progress-animated',
            style.bar,
            'shadow-sm'
          )}
          style={{ width: `${Math.min(percentage * 2, 100)}%` }}
        />
        {/* Animated shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
    </div>
  );
}

// Alert summary stat card with modern design
function AlertStatCard({
  value,
  label,
  icon: Icon,
  accent,
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-2xl p-5 text-center',
        'transition-all duration-500 ease-out overflow-hidden',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        accent
          ? 'bg-gradient-to-br from-[var(--pwa-cyan)]/10 via-[var(--pwa-cyan-light)]/20 to-[var(--pwa-sky)]/10 ring-1 ring-[var(--pwa-cyan)]/20'
          : 'bg-slate-100/50 dark:bg-slate-800/50 ring-1 ring-slate-200/50 dark:ring-slate-700/50'
      )}
    >
      {/* Decorative blob */}
      {accent && (
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[var(--pwa-cyan)]/20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70" />
      )}

      <div className={cn(
        'relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl',
        'transition-all duration-300 group-hover:scale-110',
        accent
          ? 'bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] shadow-lg shadow-[var(--pwa-cyan)]/30'
          : 'bg-slate-200/80 dark:bg-slate-700/80'
      )}>
        <Icon
          className={cn(
            'h-5 w-5',
            accent ? 'text-white' : 'text-muted-foreground'
          )}
        />
      </div>
      <p className={cn(
        'text-3xl font-black tabular-nums tracking-tight',
        accent ? 'text-[var(--pwa-blue-deep)] dark:text-[var(--pwa-cyan)]' : ''
      )}>{value}</p>
      <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: alertsData, isLoading: alertsLoading } = useAlerts({
    status: 'active',
    per_page: 10,
  });

  return (
    <div className="space-y-6">
      {/* Page Header - Enhanced */}
      <div className="animate-blur-in">
        <div className="flex items-center gap-4">
          <div className="relative">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              แดชบอร์ดภาพรวม
            </h1>
            <div className="absolute -bottom-1 left-0 h-1 w-16 rounded-full bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)]" />
          </div>
          {!dashboardLoading && (
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 px-3 py-1.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20 backdrop-blur-sm dark:from-emerald-500/20 dark:to-emerald-500/10 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              LIVE
            </div>
          )}
        </div>
        <p className="mt-3 text-muted-foreground/80">
          ข้อมูลน้ำสูญเสียรวมทุกภูมิภาค • อัปเดตล่าสุด:{' '}
          <span className="font-semibold text-foreground">
            {dashboard?.last_updated
              ? new Date(dashboard.last_updated).toLocaleString('th-TH')
              : '-'}
          </span>
        </p>
      </div>

      {/* KPI Cards with stagger animation */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <KPICard
          title="น้ำเข้า"
          value={
            dashboardLoading
              ? '-'
              : formatNumber(dashboard?.kpis.water_inflow.value ?? 0)
          }
          unit="ลบ.ม./วัน"
          trend={dashboard?.kpis.water_inflow.trend}
          icon={ArrowDownToLine}
          loading={dashboardLoading}
        />
        <KPICard
          title="น้ำออก"
          value={
            dashboardLoading
              ? '-'
              : formatNumber(dashboard?.kpis.water_outflow.value ?? 0)
          }
          unit="ลบ.ม./วัน"
          trend={dashboard?.kpis.water_outflow.trend}
          icon={ArrowUpFromLine}
          loading={dashboardLoading}
        />
        <KPICard
          title="น้ำสูญเสีย"
          value={
            dashboardLoading
              ? '-'
              : formatNumber(dashboard?.kpis.water_loss.value ?? 0)
          }
          unit="ลบ.ม./วัน"
          trend={dashboard?.kpis.water_loss.trend}
          status={dashboard?.kpis.water_loss.status}
          icon={Droplets}
          loading={dashboardLoading}
        />
        <KPICard
          title="เปอร์เซ็นต์สูญเสีย"
          value={
            dashboardLoading
              ? '-'
              : formatPercent(dashboard?.kpis.loss_percentage.value ?? 0)
          }
          trend={dashboard?.kpis.loss_percentage.trend}
          status={dashboard?.kpis.loss_percentage.status}
          icon={Percent}
          loading={dashboardLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status Distribution */}
        <Card className="lg:col-span-2 card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Activity className="h-4 w-4 text-[var(--pwa-cyan)]" />
              สถานะ DMA ทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatusCard
                label="Normal"
                labelTh="ปกติ"
                count={dashboard?.status_distribution.normal ?? 0}
                variant="normal"
              />
              <StatusCard
                label="Warning"
                labelTh="เฝ้าระวัง"
                count={dashboard?.status_distribution.warning ?? 0}
                variant="warning"
              />
              <StatusCard
                label="Critical"
                labelTh="วิกฤต"
                count={dashboard?.status_distribution.critical ?? 0}
                variant="critical"
              />
            </div>

            {/* Regional Summary */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="h-1 w-1 rounded-full bg-[var(--pwa-cyan)]" />
                สรุปรายเขต
              </h4>
              <div className="space-y-2">
                {dashboard?.regional_summary.map((region, index) => (
                  <RegionalItem
                    key={region.region_id}
                    name={region.region_name}
                    dmaCount={region.dma_count}
                    percentage={region.avg_loss_percentage}
                    status={region.status}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <div className="space-y-6">
          {/* Alert Summary */}
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Bell className="h-4 w-4 text-[var(--pwa-cyan)]" />
                สรุปการแจ้งเตือน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <AlertStatCard
                  value={dashboard?.alerts.active ?? 0}
                  label="รอดำเนินการ"
                  icon={Clock}
                  accent
                />
                <AlertStatCard
                  value={dashboard?.alerts.acknowledged ?? 0}
                  label="รับทราบแล้ว"
                  icon={CheckCircle}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <span className="text-sm text-muted-foreground">
                  แก้ไขวันนี้
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  {dashboard?.alerts.resolved_today ?? 0} รายการ
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <AlertList
            alerts={alertsData?.data ?? []}
            loading={alertsLoading}
            maxItems={5}
          />
        </div>
      </div>
    </div>
  );
}
