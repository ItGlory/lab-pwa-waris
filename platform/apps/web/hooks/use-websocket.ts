'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  data?: unknown;
  action?: string;
  timestamp?: string;
}

interface UseWebSocketOptions {
  channel: 'alerts' | 'dma';
  onMessage?: (message: WebSocketMessage) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket({
  channel,
  onMessage,
  autoReconnect = true,
  reconnectInterval = 5000,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const getWebSocketUrl = useCallback(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // If API URL is relative, use current host
    if (apiUrl.startsWith('/')) {
      return `${wsProtocol}//${window.location.host}${apiUrl}/ws/${channel}`;
    }

    // Replace http/https with ws/wss
    const wsUrl = apiUrl.replace(/^https?:/, wsProtocol);
    const token = localStorage.getItem('access_token');
    const tokenParam = token ? `?token=${token}` : '';

    return `${wsUrl}/ws/${channel}${tokenParam}`;
  }, [channel]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(getWebSocketUrl());

      ws.onopen = () => {
        setIsConnected(true);
        console.log(`WebSocket connected: ${channel}`);

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);

          // Handle different message types
          switch (message.type) {
            case 'new_alert':
            case 'alert_update':
              // Invalidate alerts queries to refetch
              queryClient.invalidateQueries({ queryKey: ['alerts'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard'] });
              break;

            case 'dma_update':
              queryClient.invalidateQueries({ queryKey: ['dmas'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard'] });
              break;

            case 'heartbeat':
            case 'pong':
              // Connection is alive
              break;
          }

          // Call custom message handler
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log(`WebSocket disconnected: ${channel}`);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt reconnection
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error (${channel}):`, error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [channel, getWebSocketUrl, onMessage, autoReconnect, reconnectInterval, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    send,
    connect,
    disconnect,
  };
}

// Hook specifically for alerts
export function useAlertWebSocket(onNewAlert?: (alert: unknown) => void) {
  return useWebSocket({
    channel: 'alerts',
    onMessage: (message) => {
      if (message.type === 'new_alert' && onNewAlert) {
        onNewAlert(message.data);
      }
    },
  });
}

// Hook specifically for DMA updates
export function useDMAWebSocket(onUpdate?: (dma: unknown) => void) {
  return useWebSocket({
    channel: 'dma',
    onMessage: (message) => {
      if (message.type === 'dma_update' && onUpdate) {
        onUpdate(message.data);
      }
    },
  });
}
