'use client';

import { useQuery } from '@tanstack/react-query';

interface Branch {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  region_id: string;
  region_name: string;
  province: string;
  dma_count: number;
  total_inflow: number;
  avg_loss_pct: number;
  status: 'normal' | 'warning' | 'critical';
}

interface BranchesFilters {
  region?: string;
  status?: string;
  search?: string;
}

interface BranchesResponse {
  data: Branch[];
  meta: {
    total: number;
  };
}

async function fetchBranches(filters?: BranchesFilters): Promise<Branch[]> {
  const params = new URLSearchParams();

  if (filters?.region) params.set('region', filters.region);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);

  const response = await fetch(`/api/branches?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch branches');
  }
  const result = await response.json();
  return result.data;
}

export function useBranches(filters?: BranchesFilters) {
  return useQuery({
    queryKey: ['branches', filters],
    queryFn: () => fetchBranches(filters),
  });
}

export type { Branch, BranchesFilters };
