'use client';

import * as React from 'react';
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useReadings } from '@/hooks/use-readings';
import predictionsData from '@/lib/mock-data/predictions.json';

type PredictionsData = {
  [key: string]: {
    dma_id: string;
    generated_at: string;
    model_version: string;
    current_loss_pct: number;
    predictions: Array<{
      date: string;
      predicted_loss: number;
      lower: number;
      upper: number;
      anomaly_prob: number;
    }>;
    trend: string;
    trend_th: string;
    recommendation: string;
    recommendation_th: string;
  };
};

const predictions = predictionsData as PredictionsData;

interface PredictionChartProps {
  dmaId: string;
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  actual?: number;
  predicted?: number;
  lower?: number;
  upper?: number;
  range?: [number, number];
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | [number, number]; color: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const actualData = payload.find((p) => p.dataKey === 'actual');
  const predictedData = payload.find((p) => p.dataKey === 'predicted');
  const rangeData = payload.find((p) => p.dataKey === 'range');

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-2 font-medium">{label}</p>
      <div className="space-y-1 text-sm">
        {actualData && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">ค่าจริง:</span>
            <span className="font-medium">{(actualData.value as number).toFixed(1)}%</span>
          </div>
        )}
        {predictedData && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">คาดการณ์:</span>
            <span className="font-medium">{(predictedData.value as number).toFixed(1)}%</span>
          </div>
        )}
        {rangeData && Array.isArray(rangeData.value) && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-200" />
            <span className="text-muted-foreground">ช่วงความเชื่อมั่น:</span>
            <span className="font-medium">
              {rangeData.value[0].toFixed(1)} - {rangeData.value[1].toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  switch (trend) {
    case 'increasing':
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    case 'decreasing':
      return <TrendingDown className="h-4 w-4 text-emerald-500" />;
    default:
      return <Minus className="h-4 w-4 text-amber-500" />;
  }
}

function getTrendColor(trend: string): 'success' | 'warning' | 'critical' {
  switch (trend) {
    case 'increasing':
      return 'critical';
    case 'decreasing':
      return 'success';
    default:
      return 'warning';
  }
}

export function PredictionChart({ dmaId }: PredictionChartProps) {
  const { data: readingsData, isLoading } = useReadings(dmaId, '7d');
  const prediction = predictions[dmaId];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">การคาดการณ์ AI</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">การคาดการณ์ AI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            ไม่มีข้อมูลการคาดการณ์
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine historical data with predictions
  const chartData: ChartDataPoint[] = [];

  // Add historical data (last 7 days)
  if (readingsData?.readings) {
    const historicalReadings = [...readingsData.readings].reverse().slice(-7);
    historicalReadings.forEach((reading) => {
      chartData.push({
        date: reading.date,
        dateLabel: formatDateLabel(reading.date),
        actual: reading.loss_pct,
      });
    });
  }

  // Add prediction data
  prediction.predictions.forEach((pred) => {
    chartData.push({
      date: pred.date,
      dateLabel: formatDateLabel(pred.date),
      predicted: pred.predicted_loss,
      lower: pred.lower,
      upper: pred.upper,
      range: [pred.lower, pred.upper],
    });
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">การคาดการณ์ AI (7 วัน)</CardTitle>
            <CardDescription>
              โมเดล {prediction.model_version} • อัปเดต{' '}
              {new Date(prediction.generated_at).toLocaleDateString('th-TH')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TrendIcon trend={prediction.trend} />
            <Badge variant={getTrendColor(prediction.trend)}>
              {prediction.trend_th}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  actual: 'ค่าจริง',
                  predicted: 'คาดการณ์',
                  range: 'ช่วงความเชื่อมั่น',
                };
                return labels[value] || value;
              }}
            />
            <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="5 5" label="" />
            <ReferenceLine y={20} stroke="#dc2626" strokeDasharray="5 5" label="" />
            <Area
              type="monotone"
              dataKey="range"
              fill="url(#colorRange)"
              stroke="none"
              name="range"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="actual"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f97316', r: 4 }}
              name="predicted"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-medium">คำแนะนำ</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {prediction.recommendation_th}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
