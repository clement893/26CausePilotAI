/**
 * useWebSocket Hook
 * 
 * Hook React pour gérer les connexions WebSocket avec auto-reconnexion
 * et gestion d'état complète.
 * 
 * @example
 * ```tsx
 * const { isConnected, lastMessage, send } = useWebSocket('/api/ws/notifications', {
 *   onMessage: (data) => console.log('Received:', data),
 *   autoReconnect: true,
 * });
 * ```
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getApiUrl } from '@/lib/api';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { logger } from '@/lib/logger';

export interface UseWebSocketOptions {
  /** Callback when message is received */
  onMessage?: (data: any) => void;
  /** Callback when connection opens */
  onOpen?: () => void;
  /** Callback when connection closes */
  onClose?: () => void;
  /** Callback when error occurs */
  onError?: (error: Event) => void;
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;
  /** Reconnection interval in ms */
  reconnectInterval?: number;
  /** Maximum reconnection attempts (0 = infinite) */
  maxReconnectAttempts?: number;
}

export interface UseWebSocketReturn {
  /** Connection status */
  isConnected: boolean;
  /** Last received message */
  lastMessage: any | null;
  /** Send message to WebSocket */
  send: (data: any) => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Manually reconnect */
  reconnect: () => void;
  /** Current reconnection attempt count */
  reconnectAttempts: number;
}

/**
 * useWebSocket - Hook for WebSocket connections with auto-reconnect
 */
export function useWebSocket(
  endpoint: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 0, // 0 = infinite
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const intentionalDisconnectRef = useRef(false);

  const connect = useCallback(() => {
    try {
      // Convert HTTP(S) URL to WS(S)
      const apiUrl = getApiUrl().replace(/^https?:\/\//, '');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const token = TokenStorage.getToken();
      
      // Add token to query params if authenticated
      const wsUrl = token
        ? `${protocol}//${apiUrl}${endpoint}?token=${token}`
        : `${protocol}//${apiUrl}${endpoint}`;

      logger.debug('WebSocket connecting', { endpoint, wsUrl: wsUrl.replace(/token=.+/, 'token=***') });

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        onOpen?.();
        logger.info(`WebSocket connected: ${endpoint}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error as Error);
        }
      };

      ws.onerror = (error) => {
        logger.error('WebSocket error', error as any, { endpoint });
        onError?.(error);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        onClose?.();
        logger.info(`WebSocket disconnected: ${endpoint}`, { 
          code: event.code, 
          reason: event.reason 
        });

        // Auto-reconnect if not intentional disconnect
        if (autoReconnect && !intentionalDisconnectRef.current) {
          const shouldReconnect = 
            maxReconnectAttempts === 0 || reconnectAttempts < maxReconnectAttempts;
          
          if (shouldReconnect) {
            const delay = reconnectInterval * Math.min(reconnectAttempts + 1, 5); // Exponential backoff, max 5x
            logger.info(`Attempting to reconnect WebSocket in ${delay}ms (attempt ${reconnectAttempts + 1})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              connect();
            }, delay);
          } else {
            logger.warn(`Max reconnection attempts (${maxReconnectAttempts}) reached`);
          }
        }
      };

      wsRef.current = ws;
    } catch (error) {
      logger.error('Failed to create WebSocket connection', error as Error, { endpoint });
    }
  }, [
    endpoint, 
    onMessage, 
    onOpen, 
    onClose, 
    onError, 
    autoReconnect, 
    reconnectInterval,
    maxReconnectAttempts,
    reconnectAttempts
  ]);

  const disconnect = useCallback(() => {
    intentionalDisconnectRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setReconnectAttempts(0);
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
      logger.debug('WebSocket message sent', { endpoint, data });
    } else {
      logger.warn('WebSocket is not connected, cannot send message', { endpoint, data });
    }
  }, [endpoint]);

  const reconnect = useCallback(() => {
    disconnect();
    intentionalDisconnectRef.current = false;
    setReconnectAttempts(0);
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    intentionalDisconnectRef.current = false;
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    send,
    disconnect,
    reconnect,
    reconnectAttempts,
  };
}
