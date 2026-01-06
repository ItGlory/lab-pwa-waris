'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useReadings, type Reading } from '@/hooks/use-readings';
import { formatNumber } from '@/lib/formatting';

interface WaterLossChartProps {
  dmaId: string;
  period?: '7d' | '14d' | '30d';
}

interface ChartData {
  date: string;
  dateLabel: string;
  inflow: number;
  outflow: number;
  loss: number;
  loss_pct: number;
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
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-2 font-medium">{label}</p>
      <div className="space-y-1 text-sm">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {formatNumber(entry.value)} ลบ.ม.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WaterLossChart({ dmaId, period = '30d' }: WaterLossChartProps) {
  const { data, isLoading, error } = useReadings(dmaId, period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">แนวโน้มน้ำสูญเสีย</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">แนวโน้มน้ำสูญเสีย</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            ไม่สามารถโหลดข้อมูลได้
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform and reverse data for chronological order
  const chartData: ChartData[] = [...data.readings]
    .reverse()
    .map((reading: Reading) => ({
      date: reading.date,
      dateLabel: formatDateLabel(reading.date),
      inflow: reading.inflow,
      outflow: reading.outflow,
      loss: reading.loss,
      loss_pct: reading.loss_pct,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">แนวโน้มน้ำสูญเสีย (30 วัน)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  inflow: 'น้ำเข้า',
                  outflow: 'น้ำออก',
                  loss: 'น้ำสูญเสีย',
                };
                return labels[value] || value;
              }}
            />
            <Area
              type="monotone"
              dataKey="inflow"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorInflow)"
              name="inflow"
            />
            <Area
              type="monotone"
              dataKey="outflow"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorOutflow)"
              name="outflow"
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorLoss)"
              name="loss"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
