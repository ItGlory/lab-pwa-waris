'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Notification {
  id: string;
  title: string;
  title_th: string;
  description: string;
  description_th: string;
  type: 'alert' | 'system' | 'report' | 'maintenance';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'unread' | 'read' | 'acknowledged' | 'resolved';
  createdAt: Date;
  readAt?: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  source: {
    type: 'dma' | 'system' | 'ai' | 'user';
    name: string;
    id?: string;
  };
  metadata?: {
    dmaId?: string;
    dmaName?: string;
    waterLoss?: number;
    threshold?: number;
    recommendation?: string;
    recommendation_th?: string;
    aiConfidence?: number;
    relatedAlerts?: string[];
  };
}

interface NotificationsState {
  notifications: Notification[];
  selectedNotificationId: string | null;
  isLoading: boolean;

  // Computed
  unreadCount: () => number;
  getNotificationById: (id: string) => Notification | undefined;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markAsAcknowledged: (id: string) => void;
  markAsResolved: (id: string) => void;
  setSelectedNotification: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

// Sample data
const sampleNotifications: Notification[] = [
  {
    id: 'NTF-2567-001',
    title: 'High Water Loss Detected in DMA-NKR-015',
    title_th: 'ตรวจพบน้ำสูญเสียสูงใน DMA-NKR-015',
    description:
      'Water loss rate has exceeded the threshold of 25%. Current loss rate is 32.5%.',
    description_th:
      'อัตราน้ำสูญเสียเกินค่าเกณฑ์ที่กำหนดไว้ที่ 25% โดยอัตราน้ำสูญเสียปัจจุบันอยู่ที่ 32.5%',
    type: 'alert',
    severity: 'critical',
    status: 'unread',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    source: {
      type: 'ai',
      name: 'ระบบวิเคราะห์ AI',
      id: 'AI-ANOMALY-001',
    },
    metadata: {
      dmaId: 'DMA-NKR-015',
      dmaName: 'พื้นที่นครราชสีมา เขต 15',
      waterLoss: 32.5,
      threshold: 25,
      recommendation_th:
        'ตรวจสอบท่อแตกรั่วในเขต 3 และ 4 ข้อมูลในอดีตบ่งชี้ว่ามีความเป็นไปได้ที่จะเกิดการรั่วไหลสูงในพื้นที่เหล่านี้',
      aiConfidence: 0.87,
    },
  },
  {
    id: 'NTF-2567-002',
    title: 'Daily Report Ready',
    title_th: 'รายงานประจำวันพร้อมแล้ว',
    description: 'Daily water loss report for January 14, 2567 is ready.',
    description_th:
      'รายงานน้ำสูญเสียประจำวันที่ 14 มกราคม 2567 พร้อมให้ดาวน์โหลดแล้ว',
    type: 'report',
    severity: 'info',
    status: 'unread',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    source: {
      type: 'system',
      name: 'ระบบรายงาน',
    },
  },
  {
    id: 'NTF-2567-003',
    title: 'Anomaly Detected in DMA-BKK-042',
    title_th: 'ตรวจพบความผิดปกติใน DMA-BKK-042',
    description: 'AI system detected unusual water usage pattern.',
    description_th:
      'ระบบ AI ตรวจพบรูปแบบการใช้น้ำผิดปกติในพื้นที่ DMA-BKK-042',
    type: 'alert',
    severity: 'high',
    status: 'acknowledged',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    acknowledgedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    source: {
      type: 'ai',
      name: 'ระบบวิเคราะห์ AI',
    },
    metadata: {
      dmaId: 'DMA-BKK-042',
      dmaName: 'พื้นที่กรุงเทพ เขต 42',
      waterLoss: 18.2,
      threshold: 20,
    },
  },
  {
    id: 'NTF-2567-004',
    title: 'Scheduled System Maintenance',
    title_th: 'การบำรุงรักษาระบบตามกำหนด',
    description: 'System maintenance scheduled for January 15, 2567.',
    description_th:
      'ระบบจะทำการบำรุงรักษาในวันที่ 15 มกราคม 2567 เวลา 02:00-04:00 น.',
    type: 'maintenance',
    severity: 'low',
    status: 'read',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    readAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    source: {
      type: 'system',
      name: 'ระบบบำรุงรักษา',
    },
  },
  {
    id: 'NTF-2567-005',
    title: 'Pipe Leak Issue Resolved',
    title_th: 'แก้ไขปัญหาท่อรั่วใน DMA-CNX-008 สำเร็จ',
    description: 'The pipe leak issue has been successfully resolved.',
    description_th:
      'ทีมงานได้ทำการแก้ไขปัญหาท่อรั่วในพื้นที่เรียบร้อยแล้ว',
    type: 'alert',
    severity: 'medium',
    status: 'resolved',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    source: {
      type: 'user',
      name: 'สมชาย ใจดี',
    },
    metadata: {
      dmaId: 'DMA-CNX-008',
      dmaName: 'พื้นที่เชียงใหม่ เขต 8',
      waterLoss: 12.5,
      threshold: 20,
    },
  },
];

export const useNotifications = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: sampleNotifications,
      selectedNotificationId: null,
      isLoading: false,

      // Computed
      unreadCount: () => {
        return get().notifications.filter((n) => n.status === 'unread').length;
      },

      getNotificationById: (id: string) => {
        return get().notifications.find((n) => n.id === id);
      },

      // Actions
      setNotifications: (notifications) => {
        set({ notifications });
      },

      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id && n.status === 'unread'
              ? { ...n, status: 'read' as const, readAt: new Date() }
              : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.status === 'unread'
              ? { ...n, status: 'read' as const, readAt: new Date() }
              : n
          ),
        }));
      },

      markAsAcknowledged: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id
              ? {
                  ...n,
                  status: 'acknowledged' as const,
                  acknowledgedAt: new Date(),
                }
              : n
          ),
        }));
      },

      markAsResolved: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id
              ? { ...n, status: 'resolved' as const, resolvedAt: new Date() }
              : n
          ),
        }));
      },

      setSelectedNotification: (id) => {
        set({ selectedNotificationId: id });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      clearAll: () => {
        set({ notifications: [], selectedNotificationId: null });
      },
    }),
    {
      name: 'waris-notifications',
      // Only persist certain fields
      partialize: (state) => ({
        notifications: state.notifications,
      }),
      // Handle date serialization
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.notifications = state.notifications.map((n) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            readAt: n.readAt ? new Date(n.readAt) : undefined,
            acknowledgedAt: n.acknowledgedAt
              ? new Date(n.acknowledgedAt)
              : undefined,
            resolvedAt: n.resolvedAt ? new Date(n.resolvedAt) : undefined,
          }));
        }
      },
    }
  )
);

export default useNotifications;
