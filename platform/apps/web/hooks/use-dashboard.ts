'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardSummary {
  summary: {
    total_dmas: number;
    active_dmas: number;
    total_inflow: number;
    total_outflow: number;
    total_loss: number;
    avg_loss_percentage: number;
    target_loss_percentage: number;
  };
  kpis: {
    water_inflow: KPIData;
    water_outflow: KPIData;
    water_loss: KPIData;
    loss_percentage: KPIData;
  };
  status_distribution: {
    normal: number;
    warning: number;
    critical: number;
  };
  alerts: {
    total: number;
    active: number;
    acknowledged: number;
    resolved_today: number;
    by_severity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  regional_summary: RegionalSummary[];
  recent_trend: TrendData[];
  last_updated: string;
}

interface KPIData {
  value: number;
  unit: string;
  trend: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    label: string;
  };
  status?: 'normal' | 'warning' | 'critical';
  target?: number;
}

interface RegionalSummary {
  region_id: string;
  region_name: string;
  dma_count: number;
  avg_loss_percentage: number;
  status: 'normal' | 'warning' | 'critical';
}

interface TrendData {
  date: string;
  inflow: number;
  outflow: number;
  loss: number;
  loss_pct: number;
}

async function fetchDashboard(): Promise<DashboardSummary> {
  const response = await fetch('/api/dashboard');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  const result = await response.json();
  return result.data;
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 60000, // Refetch every minute
  });
}

export type { DashboardSummary, KPIData, RegionalSummary, TrendData };
