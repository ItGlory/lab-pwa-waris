'use client';

import { useQuery } from '@tanstack/react-query';

interface DMA {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  branch_id: string;
  branch_name: string;
  region_id: string;
  region_name: string;
  area_km2: number;
  population: number;
  connections: number;
  pipe_length_km: number;
  current_inflow: number;
  current_outflow: number;
  current_loss: number;
  loss_percentage: number;
  avg_pressure: number;
  status: 'normal' | 'warning' | 'critical';
  last_updated: string;
}

interface DMAFilters {
  region?: string;
  status?: 'normal' | 'warning' | 'critical';
  search?: string;
  page?: number;
  per_page?: number;
}

interface DMAListResponse {
  data: DMA[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

async function fetchDMAs(filters?: DMAFilters): Promise<DMAListResponse> {
  const params = new URLSearchParams();

  if (filters?.region) params.set('region', filters.region);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.per_page) params.set('per_page', filters.per_page.toString());

  const response = await fetch(`/api/dma?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch DMAs');
  }
  const result = await response.json();
  return { data: result.data, meta: result.meta };
}

async function fetchDMA(id: string): Promise<DMA> {
  const response = await fetch(`/api/dma/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch DMA');
  }
  const result = await response.json();
  return result.data;
}

export function useDMAs(filters?: DMAFilters) {
  return useQuery({
    queryKey: ['dmas', filters],
    queryFn: () => fetchDMAs(filters),
  });
}

export function useDMA(id: string) {
  return useQuery({
    queryKey: ['dma', id],
    queryFn: () => fetchDMA(id),
    enabled: !!id,
  });
}

export type { DMA, DMAFilters, DMAListResponse };
