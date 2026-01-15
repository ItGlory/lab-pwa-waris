'use client';

import { create } from 'zustand';
import { useEffect } from 'react';

interface ConnectionStatusState {
  isConnected: boolean;
  isChecking: boolean;
  setConnected: (connected: boolean) => void;
  setChecking: (checking: boolean) => void;
  checkConnection: () => Promise<void>;
}

const useConnectionStore = create<ConnectionStatusState>((set, get) => ({
  isConnected: true, // Default to true (optimistic)
  isChecking: false,
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  setChecking: (checking: boolean) => set({ isChecking: checking }),
  checkConnection: async () => {
    if (get().isChecking) return;

    set({ isChecking: true });

    try {
      // Check browser online status first
      if (!navigator.onLine) {
        set({ isConnected: false, isChecking: false });
        return;
      }

      // Try to reach the API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      set({ isConnected: response.ok, isChecking: false });
    } catch {
      // If fetch fails, check browser online status as fallback
      set({ isConnected: navigator.onLine, isChecking: false });
    }
  },
}));

// Hook with auto-check on mount and browser events
export function useConnectionStatus() {
  const store = useConnectionStore();

  useEffect(() => {
    // Initial check
    store.checkConnection();

    // Listen for online/offline events
    const handleOnline = () => {
      store.setConnected(true);
      store.checkConnection();
    };

    const handleOffline = () => {
      store.setConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check every 30 seconds
    const interval = setInterval(() => {
      store.checkConnection();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return store;
}

// Export store for direct access if needed
export { useConnectionStore };
