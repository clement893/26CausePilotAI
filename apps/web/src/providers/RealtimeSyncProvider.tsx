/**
 * RealtimeSyncProvider
 * 
 * Provider global qui active la synchronisation temps réel pour toute l'application.
 * À intégrer au plus haut niveau de l'arborescence des composants (layout.tsx).
 * 
 * @example
 * ```tsx
 * <QueryClientProvider client={queryClient}>
 *   <RealtimeSyncProvider>
 *     <YourApp />
 *   </RealtimeSyncProvider>
 * </QueryClientProvider>
 * ```
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useAuthStore } from '@/stores/auth';
import { logger } from '@/lib/logger';

export interface RealtimeSyncProviderProps {
  children: ReactNode;
  /** Enable/disable realtime sync (default: true) */
  enabled?: boolean;
}

/**
 * RealtimeSyncProvider - Global provider for real-time synchronization
 */
export function RealtimeSyncProvider({ 
  children, 
  enabled = true 
}: RealtimeSyncProviderProps) {
  const { isAuthenticated } = useAuthStore();
  
  // Activate real-time sync only if authenticated
  const { isConnected, lastMessage } = useRealtimeSync({ 
    enabled: enabled && isAuthenticated 
  });

  // Log sync status
  useEffect(() => {
    if (isAuthenticated && enabled) {
      logger.info('Real-time sync provider active', { 
        isConnected, 
        isAuthenticated 
      });
    }
  }, [isConnected, isAuthenticated, enabled]);

  // Log received messages in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && lastMessage) {
      logger.debug('Real-time message received', lastMessage);
    }
  }, [lastMessage]);

  return <>{children}</>;
}
