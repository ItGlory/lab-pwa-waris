'use client';

import { useQuery } from '@tanstack/react-query';

interface Report {
  id: string;
  title_th: string;
  title_en: string;
  type: 'daily' | 'weekly' | 'monthly' | 'annual' | 'custom';
  category: 'water_loss' | 'dma_performance' | 'alerts' | 'financial';
  period: string;
  created_at: string;
  file_size: string;
  status: 'ready' | 'generating' | 'error';
}

interface ReportsFilters {
  type?: string;
  category?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

interface ReportsResponse {
  data: Report[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

async function fetchReports(filters?: ReportsFilters): Promise<ReportsResponse> {
  const params = new URLSearchParams();

  if (filters?.type) params.set('type', filters.type);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.per_page) params.set('per_page', filters.per_page.toString());

  const response = await fetch(`/api/reports?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  const result = await response.json();
  return { data: result.data, meta: result.meta };
}

export function useReports(filters?: ReportsFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => fetchReports(filters),
  });
}

export type { Report, ReportsFilters, ReportsResponse };
