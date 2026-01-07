'use client';

import { create } from 'zustand';

interface ConnectionStatusState {
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useConnectionStatus = create<ConnectionStatusState>((set) => ({
  isConnected: false,
  setConnected: (connected: boolean) => set({ isConnected: connected }),
}));
