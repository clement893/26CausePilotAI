/**
 * useRealtimeSync Hook
 * 
 * Hook global pour synchroniser automatiquement le frontend avec le backend
 * via WebSocket. Invalide et refetch les queries React Query en temps réel.
 * 
 * À utiliser dans un provider global pour activer la sync sur toute l'app.
 * 
 * @example
 * ```tsx
 * function App() {
 *   useRealtimeSync(); // Active la sync temps réel
 *   return <YourApp />;
 * }
 * ```
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { useAuthStore } from '@/lib/store';
import { logger } from '@/lib/logger';

/**
 * Mapping des types d'événements WebSocket vers les query keys à invalider
 */
const EVENT_TO_QUERY_KEYS: Record<string, string[]> = {
  // Projects
  project_created: ['projects', 'dashboard', 'statistics'],
  project_updated: ['projects', 'project', 'dashboard'],
  project_deleted: ['projects', 'dashboard', 'statistics'],
  
  // Users
  user_created: ['users', 'team-members'],
  user_updated: ['users', 'me', 'team-members'],
  user_deleted: ['users', 'team-members'],
  
  // Teams
  team_created: ['teams', 'organizations'],
  team_updated: ['teams', 'team'],
  team_deleted: ['teams', 'organizations'],
  team_member_added: ['teams', 'team-members'],
  team_member_removed: ['teams', 'team-members'],
  
  // Notifications
  notification_created: ['notifications', 'notification-count'],
  notification_read: ['notifications', 'notification-count'],
  notification_deleted: ['notifications', 'notification-count'],
  
  // Organizations
  organization_updated: ['organizations', 'organization'],
  
  // Invitations
  invitation_created: ['invitations'],
  invitation_accepted: ['invitations', 'team-members'],
  invitation_cancelled: ['invitations'],
  
  // Forms & Surveys
  form_created: ['forms'],
  form_updated: ['forms', 'form'],
  form_deleted: ['forms'],
  form_submission: ['form-submissions', 'form-statistics'],
  
  // Subscriptions
  subscription_created: ['subscriptions', 'subscription'],
  subscription_updated: ['subscriptions', 'subscription'],
  subscription_cancelled: ['subscriptions'],
  
  // API Keys
  api_key_created: ['api-keys'],
  api_key_deleted: ['api-keys'],
  
  // Generic updates
  data_updated: ['dashboard', 'statistics'],
};

export interface RealtimeSyncOptions {
  /** Enable/disable realtime sync */
  enabled?: boolean;
  /** Custom event to query keys mapping */
  customMapping?: Record<string, string[]>;
}

/**
 * useRealtimeSync - Global hook for real-time frontend-backend synchronization
 */
export function useRealtimeSync(options: RealtimeSyncOptions = {}) {
  const { enabled = true, customMapping = {} } = options;
  const queryClient = useQueryClient();
  const { user, isAuthenticated: isAuthenticatedFn } = useAuthStore();
  const isAuthenticated = isAuthenticatedFn();

  // Merge custom mapping with default mapping
  const eventMapping = { ...EVENT_TO_QUERY_KEYS, ...customMapping };

  const handleWebSocketMessage = useCallback(
    async (data: any) => {
      const { type, data: eventData } = data;
      
      logger.debug('Real-time event received', { type, eventData });

      // Get query keys to invalidate for this event type
      const queryKeys = eventMapping[type];

      if (!queryKeys || queryKeys.length === 0) {
        logger.debug(`No query keys mapped for event type: ${type}`);
        return;
      }

      logger.info(`Invalidating queries for event: ${type}`, { queryKeys });

      try {
        // Invalidate all related queries
        await Promise.all(
          queryKeys.map(async (key) => {
            await queryClient.invalidateQueries({ 
              queryKey: [key],
              refetchType: 'active', // Only refetch active queries
            });
          })
        );

        // Force immediate refetch of active queries
        await queryClient.refetchQueries({
          queryKey: queryKeys,
          type: 'active',
        });

        logger.info(`Successfully synchronized data for event: ${type}`);
      } catch (error) {
        logger.error('Failed to invalidate queries', error as Error, { type, queryKeys });
      }
    },
    [queryClient, eventMapping]
  );

  // Connect to WebSocket only if authenticated and enabled
  const { isConnected, lastMessage, send } = useWebSocket(
    '/api/ws/notifications',
    {
      onMessage: handleWebSocketMessage,
      onOpen: () => {
        logger.info('Real-time sync connected');
        
        // Send subscription message
        send({
          type: 'subscribe',
          types: Object.keys(eventMapping),
        });
      },
      onClose: () => {
        logger.info('Real-time sync disconnected');
      },
      onError: (error) => {
        logger.error('Real-time sync error', error as any);
      },
      autoReconnect: true,
      reconnectInterval: 3000,
    }
  );

  // Log connection status
  useEffect(() => {
    if (enabled && isAuthenticated) {
      logger.info('Real-time sync enabled', {
        isConnected,
        userId: user?.id,
        eventTypes: Object.keys(eventMapping).length,
      });
    }
  }, [enabled, isAuthenticated, isConnected, user, eventMapping]);

  // Disable if not enabled or not authenticated
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      logger.info('Real-time sync disabled', { enabled, isAuthenticated });
    }
  }, [enabled, isAuthenticated]);

  return {
    isConnected: enabled && isAuthenticated && isConnected,
    lastMessage,
    send,
  };
}

/**
 * Hook for manual query invalidation
 * Useful for components that need to trigger manual syncs
 */
export function useManualSync() {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(
    async (queryKeys: string[]) => {
      logger.info('Manual query invalidation triggered', { queryKeys });
      
      await Promise.all(
        queryKeys.map(async (key) => {
          await queryClient.invalidateQueries({ 
            queryKey: [key],
            refetchType: 'active',
          });
        })
      );

      await queryClient.refetchQueries({
        queryKey: queryKeys,
        type: 'active',
      });
    },
    [queryClient]
  );

  const invalidateAll = useCallback(async () => {
    logger.info('Invalidating all queries');
    await queryClient.invalidateQueries();
    await queryClient.refetchQueries({ type: 'active' });
  }, [queryClient]);

  return {
    invalidateQueries,
    invalidateAll,
  };
}
