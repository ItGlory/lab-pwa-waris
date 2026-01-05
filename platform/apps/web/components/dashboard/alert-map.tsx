'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Types exported for use by parent components
export interface AlertMarker {
  id: string;
  dma_id: string;
  dma_name: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  coordinates: [number, number];
}

export interface AlertMapProps {
  geoJSON?: GeoJSON.FeatureCollection;
  markers?: AlertMarker[];
  className?: string;
  height?: string;
  onMarkerClick?: (markerId: string) => void;
}

// Loading skeleton for the map
function MapSkeleton({ className = '', height = '400px' }: { className?: string; height?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-slate-200 ${className}`} style={{ height }}>
      <Skeleton className="h-full w-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-sm text-slate-500">กำลังโหลดแผนที่...</div>
      </div>
    </div>
  );
}

// Dynamically import the map implementation with no SSR
const AlertMapImpl = dynamic(
  () => import('./alert-map-impl').then((mod) => mod.AlertMapImpl),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export function AlertMap(props: AlertMapProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <MapSkeleton className={props.className} height={props.height} />;
  }

  return <AlertMapImpl {...props} />;
}
