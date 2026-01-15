'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAlertWebSocket } from '@/hooks/use-websocket';
import { useConnectionStore } from '@/hooks/use-connection-status';
import { AlertTriangle, Bell, Droplets, Gauge, Wrench } from 'lucide-react';

interface AlertData {
  id: string;
  type: string;
  severity: string;
  message: string;
  message_th?: string;
  dma_name?: string;
  dma_name_th?: string;
  created_at: string;
}

const alertIcons: Record<string, React.ReactNode> = {
  high_loss: <Droplets className="h-4 w-4" />,
  threshold_breach: <AlertTriangle className="h-4 w-4" />,
  pressure_anomaly: <Gauge className="h-4 w-4" />,
  flow_anomaly: <Droplets className="h-4 w-4" />,
  leak_detected: <Droplets className="h-4 w-4 text-blue-500" />,
  meter_fault: <Wrench className="h-4 w-4" />,
  system_error: <AlertTriangle className="h-4 w-4" />,
};

const severityColors: Record<string, string> = {
  critical: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-yellow-600',
  low: 'text-blue-600',
};

const severityLabels: Record<string, string> = {
  critical: 'วิกฤต',
  high: 'สูง',
  medium: 'ปานกลาง',
  low: 'ต่ำ',
};

export function AlertNotifications() {
  const handleNewAlert = useCallback((data: unknown) => {
    const alert = data as AlertData;

    const icon = alertIcons[alert.type] || <Bell className="h-4 w-4" />;
    const severityClass = severityColors[alert.severity] || 'text-gray-600';
    const severityLabel = severityLabels[alert.severity] || alert.severity;

    // Show toast notification
    toast(
      <div className="flex items-start gap-3">
        <div className={severityClass}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">
            {alert.message_th || alert.message}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {alert.dma_name_th || alert.dma_name || 'ระบบ'}
            <span className="mx-1">•</span>
            <span className={severityClass}>ความรุนแรง: {severityLabel}</span>
          </div>
        </div>
      </div>,
      {
        duration: alert.severity === 'critical' ? 10000 : 5000,
        action: {
          label: 'ดูรายละเอียด',
          onClick: () => {
            window.location.href = `/alerts?id=${alert.id}`;
          },
        },
      }
    );

    // For critical alerts, also show browser notification if permitted
    if (alert.severity === 'critical' && Notification.permission === 'granted') {
      new Notification('WARIS - การแจ้งเตือนวิกฤต', {
        body: alert.message_th || alert.message,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    }
  }, []);

  const { isConnected } = useAlertWebSocket(handleNewAlert);
  const setConnected = useConnectionStore((state) => state.setConnected);

  // Sync connection status to global store
  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected, setConnected]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Show connection status toast on reconnection
  useEffect(() => {
    if (isConnected) {
      // Only show on reconnection, not initial connection
      const hasShownConnected = sessionStorage.getItem('ws-connected');
      if (hasShownConnected === 'false') {
        toast.success('เชื่อมต่อระบบแจ้งเตือนสำเร็จ', {
          description: 'กำลังรับการแจ้งเตือนแบบเรียลไทม์',
          duration: 3000,
        });
      }
      sessionStorage.setItem('ws-connected', 'true');
    } else {
      const wasConnected = sessionStorage.getItem('ws-connected');
      if (wasConnected === 'true') {
        toast.error('ขาดการเชื่อมต่อ', {
          description: 'กำลังพยายามเชื่อมต่อใหม่...',
          duration: 3000,
        });
      }
      sessionStorage.setItem('ws-connected', 'false');
    }
  }, [isConnected]);

  // This component doesn't render anything visible
  return null;
}
