'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Alert {
  id: string;
  dma_id: string;
  dma_name: string;
  type: 'high_nrw' | 'leak_detected' | 'pressure_anomaly' | 'meter_fault' | 'threshold_breach' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  title_th: string;
  message: string;
  message_th: string;
  status: 'active' | 'acknowledged' | 'resolved';
  triggered_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
}

interface AlertFilters {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'active' | 'acknowledged' | 'resolved';
  dma_id?: string;
  page?: number;
  per_page?: number;
}

interface AlertListResponse {
  data: Alert[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

async function fetchAlerts(filters?: AlertFilters): Promise<AlertListResponse> {
  const params = new URLSearchParams();

  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.dma_id) params.set('dma_id', filters.dma_id);
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.per_page) params.set('per_page', filters.per_page.toString());

  const response = await fetch(`/api/alerts?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }
  const result = await response.json();
  return { data: result.data, meta: result.meta };
}

async function updateAlert(data: { id: string; action: 'acknowledge' | 'resolve' }): Promise<Alert> {
  const response = await fetch('/api/alerts', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update alert');
  }
  const result = await response.json();
  return result.data;
}

export function useAlerts(filters?: AlertFilters) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => fetchAlerts(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export type { Alert, AlertFilters, AlertListResponse };
