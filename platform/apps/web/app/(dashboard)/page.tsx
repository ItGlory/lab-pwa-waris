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

// Status card with modern design
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
      gradient: 'status-gradient-normal',
      badge: 'success' as const,
      light: 'text-emerald-100',
    },
    warning: {
      gradient: 'status-gradient-warning',
      badge: 'warning' as const,
      light: 'text-amber-100',
    },
    critical: {
      gradient: 'status-gradient-critical',
      badge: 'critical' as const,
      light: 'text-red-100',
    },
  };

  const style = styles[variant];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl p-4 text-white transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-lg',
        style.gradient
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20" />
        <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
      </div>

      <div className="relative flex items-center justify-between">
        <div>
          <p className={cn('text-sm font-medium', style.light)}>{labelTh}</p>
          <p className="text-3xl font-bold tabular-nums">{count}</p>
        </div>
        <Badge variant={style.badge} className="shadow-sm">
          {label}
        </Badge>
      </div>
    </div>
  );
}

// Regional item with progress bar
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
  const statusColors = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  const textColors = {
    normal: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    critical: 'text-red-600 dark:text-red-400',
  };

  return (
    <div
      className="group rounded-lg border border-border/50 p-4 transition-all duration-300 hover:border-border hover:bg-muted/30 hover:shadow-sm"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground">{dmaCount} DMA</p>
        </div>
        <div className="text-right">
          <p className={cn('text-lg font-bold tabular-nums', textColors[status])}>
            {formatPercent(percentage)}
          </p>
          <p className="text-xs text-muted-foreground">เฉลี่ยสูญเสีย</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out progress-animated',
            statusColors[status]
          )}
          style={{ width: `${Math.min(percentage * 2, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Alert summary stat card
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
        'flex flex-col items-center justify-center rounded-xl p-4 text-center transition-all duration-300',
        accent
          ? 'bg-gradient-to-br from-[var(--pwa-cyan-light)]/30 to-[var(--pwa-sky)]/20'
          : 'bg-muted/50'
      )}
    >
      <Icon
        className={cn(
          'mb-2 h-5 w-5',
          accent ? 'text-[var(--pwa-blue-deep)]' : 'text-muted-foreground'
        )}
      />
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
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
      {/* Page Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">แดชบอร์ดภาพรวม</h1>
          {!dashboardLoading && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <span className="status-dot bg-emerald-500 status-dot-pulse" />
              Live
            </div>
          )}
        </div>
        <p className="mt-1 text-muted-foreground">
          ข้อมูลน้ำสูญเสียรวมทุกภูมิภาค • อัปเดตล่าสุด:{' '}
          <span className="font-medium text-foreground">
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
