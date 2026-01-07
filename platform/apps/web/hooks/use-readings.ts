'use client';

import { useQuery } from '@tanstack/react-query';
import { dmaAPI, type DMAReadings } from '@/lib/api-client';

export function useReadings(dmaId: string, period: string = '30d') {
  return useQuery({
    queryKey: ['readings', dmaId, period],
    queryFn: async () => {
      const response = await dmaAPI.getReadings(dmaId, period);
      return response.data;
    },
    enabled: !!dmaId,
  });
}

export type { DMAReadings };
export type Reading = DMAReadings['readings'][number];
