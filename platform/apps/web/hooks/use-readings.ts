'use client';

import { useQuery } from '@tanstack/react-query';

interface Reading {
  date: string;
  inflow: number;
  outflow: number;
  loss: number;
  loss_pct: number;
  pressure: number;
}

interface ReadingsResponse {
  dma_id: string;
  period: string;
  base_inflow: number;
  base_loss_pct: number;
  readings: Reading[];
}

async function fetchReadings(
  dmaId: string,
  period: string = '30d'
): Promise<ReadingsResponse> {
  const response = await fetch(`/api/dma/${dmaId}/readings?period=${period}`);
  if (!response.ok) {
    throw new Error('Failed to fetch readings');
  }
  const result = await response.json();
  return result.data;
}

export function useReadings(dmaId: string, period: string = '30d') {
  return useQuery({
    queryKey: ['readings', dmaId, period],
    queryFn: () => fetchReadings(dmaId, period),
    enabled: !!dmaId,
  });
}

export type { Reading, ReadingsResponse };
