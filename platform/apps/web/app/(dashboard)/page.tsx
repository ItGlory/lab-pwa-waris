'use client';

import * as React from 'react';
import { Droplets, ArrowDownToLine, ArrowUpFromLine, Percent, Bell } from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { AlertList } from '@/components/dashboard/alert-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/use-dashboard';
import { useAlerts } from '@/hooks/use-alerts';
import { formatNumber, formatPercent } from '@/lib/formatting';

export default function DashboardPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: alertsData, isLoading: alertsLoading } = useAlerts({
    status: 'active',
    per_page: 10,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">แดชบอร์ดภาพรวม</h1>
        <p className="text-muted-foreground">
          ข้อมูลน้ำสูญเสียรวมทุกภูมิภาค • อัปเดตล่าสุด:{' '}
          {dashboard?.last_updated
            ? new Date(dashboard.last_updated).toLocaleString('th-TH')
            : '-'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              สถานะ DMA ทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg bg-emerald-500 p-4 text-white">
                <div>
                  <p className="text-sm font-medium text-emerald-100">ปกติ</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboard?.status_distribution.normal ?? 0}
                  </p>
                </div>
                <Badge variant="success">Normal</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-500 p-4 text-white">
                <div>
                  <p className="text-sm font-medium text-amber-100">เฝ้าระวัง</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboard?.status_distribution.warning ?? 0}
                  </p>
                </div>
                <Badge variant="warning">Warning</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-red-500 p-4 text-white">
                <div>
                  <p className="text-sm font-medium text-red-100">วิกฤต</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboard?.status_distribution.critical ?? 0}
                  </p>
                </div>
                <Badge variant="critical">Critical</Badge>
              </div>
            </div>

            {/* Regional Summary */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                สรุปรายเขต
              </h4>
              <div className="space-y-2">
                {dashboard?.regional_summary.map((region) => (
                  <div
                    key={region.region_id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{region.region_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {region.dma_count} DMA
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          region.status === 'normal'
                            ? 'text-green-700 dark:text-green-400'
                            : region.status === 'warning'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-red-700 dark:text-red-400'
                        }`}
                      >
                        {formatPercent(region.avg_loss_percentage)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        เฉลี่ยสูญเสีย
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <div className="space-y-6">
          {/* Alert Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Bell className="h-4 w-4" />
                สรุปการแจ้งเตือน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">
                    {dashboard?.alerts.active ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">รอดำเนินการ</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">
                    {dashboard?.alerts.acknowledged ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">รับทราบแล้ว</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">แก้ไขวันนี้</span>
                <span className="font-medium text-green-600">
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
