'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Droplets,
  MapPin,
  Users,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useDMA } from '@/hooks/use-dmas';
import { formatNumber, formatPercent } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import { WaterLossChart } from '@/components/charts/water-loss-chart';
import { PredictionChart } from '@/components/charts/prediction-chart';

function getStatusVariant(status: string): 'success' | 'warning' | 'critical' {
  switch (status) {
    case 'normal':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'critical';
    default:
      return 'success';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'normal':
      return 'ปกติ';
    case 'warning':
      return 'เฝ้าระวัง';
    case 'critical':
      return 'วิกฤต';
    default:
      return status;
  }
}

export default function DMADetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: dma, isLoading, error } = useDMA(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !dma) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-xl font-semibold">ไม่พบข้อมูล DMA</h2>
        <p className="mt-2 text-muted-foreground">
          ไม่พบข้อมูล DMA ที่ต้องการ หรือเกิดข้อผิดพลาดในการโหลดข้อมูล
        </p>
        <Button asChild className="mt-4">
          <Link href="/dma">กลับไปหน้ารายการ DMA</Link>
        </Button>
      </div>
    );
  }

  const statusColor = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  }[dma.status] || 'bg-gray-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dma">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{dma.name_th}</h1>
              <Badge variant={getStatusVariant(dma.status)}>
                {getStatusText(dma.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {dma.code} • {dma.branch_name} • {dma.region_name}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(statusColor, 'text-white border-0')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm opacity-90">น้ำสูญเสีย</p>
                <p className="text-2xl font-bold">
                  {formatPercent(dma.loss_percentage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">น้ำเข้า</p>
                <p className="text-2xl font-bold">
                  {formatNumber(dma.current_inflow)}
                </p>
                <p className="text-xs text-muted-foreground">ลบ.ม./วัน</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">น้ำออก</p>
                <p className="text-2xl font-bold">
                  {formatNumber(dma.current_outflow)}
                </p>
                <p className="text-xs text-muted-foreground">ลบ.ม./วัน</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                <Gauge className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ความดันเฉลี่ย</p>
                <p className="text-2xl font-bold">{dma.avg_pressure}</p>
                <p className="text-xs text-muted-foreground">บาร์</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Water Loss Chart */}
      <WaterLossChart dmaId={id} />

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* DMA Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              ข้อมูลพื้นที่
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">พื้นที่</p>
                <p className="text-lg font-semibold">{dma.area_km2} ตร.กม.</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">ประชากร</p>
                <p className="text-lg font-semibold">
                  {formatNumber(dma.population)} คน
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">จำนวนมิเตอร์</p>
                <p className="text-lg font-semibold">
                  {formatNumber(dma.connections)} ราย
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">ความยาวท่อ</p>
                <p className="text-lg font-semibold">{dma.pipe_length_km} กม.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-4 w-4" />
              สมดุลน้ำ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>น้ำเข้าระบบ</span>
                <span className="font-medium">
                  {formatNumber(dma.current_inflow)} ลบ.ม./วัน
                </span>
              </div>
              <Progress value={100} className="h-3 bg-blue-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>น้ำจำหน่าย</span>
                <span className="font-medium text-emerald-600">
                  {formatNumber(dma.current_outflow)} ลบ.ม./วัน (
                  {formatPercent(100 - dma.loss_percentage)})
                </span>
              </div>
              <Progress
                value={100 - dma.loss_percentage}
                className="h-3"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>น้ำสูญเสีย</span>
                <span
                  className={cn(
                    'font-medium',
                    dma.status === 'critical'
                      ? 'text-red-600'
                      : dma.status === 'warning'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  )}
                >
                  {formatNumber(dma.current_loss)} ลบ.ม./วัน (
                  {formatPercent(dma.loss_percentage)})
                </span>
              </div>
              <Progress
                value={dma.loss_percentage}
                className={cn(
                  'h-3',
                  dma.status === 'critical'
                    ? '[&>div]:bg-red-500'
                    : dma.status === 'warning'
                    ? '[&>div]:bg-amber-500'
                    : '[&>div]:bg-emerald-500'
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              การวิเคราะห์ AI
            </CardTitle>
            <CardDescription>
              ผลการวิเคราะห์จากระบบ AI สำหรับการตรวจจับความผิดปกติและคาดการณ์
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Anomaly Detection */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  {dma.status === 'critical' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : dma.status === 'warning' ? (
                    <Info className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                  <span className="font-medium">ตรวจจับความผิดปกติ</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {dma.status === 'critical'
                    ? 'ตรวจพบความผิดปกติของอัตราการไหล'
                    : dma.status === 'warning'
                    ? 'ตรวจพบแนวโน้มน้ำสูญเสียเพิ่มขึ้น'
                    : 'ไม่พบความผิดปกติ'}
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    ความเชื่อมั่น 85%
                  </Badge>
                </div>
              </div>

              {/* Pattern Analysis */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">รูปแบบการใช้น้ำ</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  รูปแบบตามฤดูกาล - สูงในช่วงหน้าร้อน
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    ความเชื่อมั่น 78%
                  </Badge>
                </div>
              </div>

              {/* Loss Classification */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-cyan-500" />
                  <span className="font-medium">ประเภทน้ำสูญเสีย</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  รั่วไหลทางกายภาพ 65% / เชิงพาณิชย์ 35%
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    ความเชื่อมั่น 72%
                  </Badge>
                </div>
              </div>

              {/* Forecast */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  {dma.loss_percentage > 15 ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-emerald-500" />
                  )}
                  <span className="font-medium">แนวโน้ม 7 วัน</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {dma.loss_percentage > 15
                    ? 'คาดว่าจะเพิ่มขึ้นหากไม่ดำเนินการ'
                    : 'คาดว่าจะคงที่'}
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    ความเชื่อมั่น 81%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Prediction Chart */}
      <PredictionChart dmaId={id} />

      {/* Last Updated */}
      <p className="text-center text-sm text-muted-foreground">
        อัปเดตล่าสุด:{' '}
        {new Date(dma.last_updated).toLocaleString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
}
