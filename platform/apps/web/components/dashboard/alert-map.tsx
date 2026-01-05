'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface AlertMarker {
  id: string;
  dma_id: string;
  dma_name: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  coordinates: [number, number];
}

interface AlertMapProps {
  geoJSON?: GeoJSON.FeatureCollection;
  markers?: AlertMarker[];
  className?: string;
  height?: string;
  onMarkerClick?: (markerId: string) => void;
}

// Severity colors for markers and areas
const severityColors: Record<string, string> = {
  critical: '#ef4444', // red-500
  high: '#f97316', // orange-500
  medium: '#f59e0b', // amber-500
  low: '#3b82f6', // blue-500
  normal: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
};

// Custom marker icon function
const createMarkerIcon = (severity: string) => {
  if (typeof window === 'undefined') return null;

  const L = require('leaflet');
  const color = severityColors[severity] || severityColors.normal;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Style function for GeoJSON features
const getFeatureStyle = (feature: GeoJSON.Feature | undefined) => {
  if (!feature?.properties) return {};

  const status = feature.properties.status || 'normal';
  const color = severityColors[status] || severityColors.normal;

  return {
    fillColor: color,
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.4,
  };
};

export function AlertMap({
  geoJSON,
  markers = [],
  className = '',
  height = '400px',
  onMarkerClick,
}: AlertMapProps) {
  const [mounted, setMounted] = React.useState(false);
  const [icons, setIcons] = React.useState<Record<string, L.DivIcon>>({});

  React.useEffect(() => {
    setMounted(true);

    // Import Leaflet CSS
    import('leaflet/dist/leaflet.css');

    // Create icons after mounting
    if (typeof window !== 'undefined') {
      const iconSet: Record<string, L.DivIcon> = {};
      ['critical', 'high', 'medium', 'low'].forEach((severity) => {
        const icon = createMarkerIcon(severity);
        if (icon) iconSet[severity] = icon;
      });
      setIcons(iconSet);
    }
  }, []);

  if (!mounted) {
    return (
      <div className={className} style={{ height }}>
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  // Thailand center coordinates
  const center: [number, number] = [13.7563, 100.5018];
  const zoom = 6;

  return (
    <div className={`relative overflow-hidden rounded-lg border border-slate-200 ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* GeoJSON DMA areas */}
        {geoJSON && (
          <GeoJSON
            data={geoJSON}
            style={getFeatureStyle}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                const { name, code, loss_percentage, status } = feature.properties;
                layer.bindPopup(`
                  <div style="min-width: 150px;">
                    <strong>${name}</strong><br/>
                    <span style="color: #666; font-size: 12px;">${code}</span><br/>
                    <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;"/>
                    <div style="display: flex; justify-content: space-between;">
                      <span>น้ำสูญเสีย:</span>
                      <strong style="color: ${severityColors[status]}">${loss_percentage}%</strong>
                    </div>
                  </div>
                `);
              }
            }}
          />
        )}

        {/* Alert markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.coordinates}
            icon={icons[marker.severity]}
            eventHandlers={{
              click: () => onMarkerClick?.(marker.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: severityColors[marker.severity],
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  {marker.severity === 'critical'
                    ? 'วิกฤต'
                    : marker.severity === 'high'
                      ? 'สูง'
                      : marker.severity === 'medium'
                        ? 'ปานกลาง'
                        : 'ต่ำ'}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{marker.title}</div>
                <div style={{ color: '#666', fontSize: '12px' }}>{marker.dma_name}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white p-3 shadow-lg">
        <div className="mb-2 text-xs font-semibold text-slate-700">ระดับความรุนแรง</div>
        <div className="space-y-1">
          {[
            { severity: 'critical', label: 'วิกฤต' },
            { severity: 'high', label: 'สูง' },
            { severity: 'medium', label: 'ปานกลาง' },
            { severity: 'low', label: 'ต่ำ' },
          ].map(({ severity, label }) => (
            <div key={severity} className="flex items-center gap-2 text-xs">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: severityColors[severity] }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
