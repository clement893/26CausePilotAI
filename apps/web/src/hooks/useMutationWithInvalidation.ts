/**
 * useMutationWithInvalidation Hook
 * 
 * Wrapper autour de useMutation de React Query qui invalide automatiquement
 * les queries spécifiées après une mutation réussie.
 * 
 * Garantit que les données affichées sont toujours à jour après une modification.
 * 
 * @example
 * ```tsx
 * const createProject = useMutationWithInvalidation({
 *   mutationFn: (data) => projectsAPI.create(data),
 *   invalidateKeys: ['projects', 'dashboard'],
 *   onSuccess: (project) => {
 *     toast.success(`Project ${project.name} created!`);
 *   },
 * });
 * 
 * // Usage
 * createProject.mutate({ name: 'New Project' });
 * ```
 */

import { 
  useMutation, 
  useQueryClient,
  UseMutationOptions,
  MutationFunction,
} from '@tanstack/react-query';
import { logger } from '@/lib/logger';

export interface UseMutationWithInvalidationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  /** Mutation function to execute */
  mutationFn: MutationFunction<TData, TVariables>;
  
  /** Query keys to invalidate after successful mutation */
  invalidateKeys: string[];
  
  /** 
   * Refetch mode after invalidation
   * - 'active': Only refetch active queries (default)
   * - 'all': Refetch all queries
   * - 'none': Only invalidate, don't refetch
   */
  refetchMode?: 'active' | 'all' | 'none';
  
  /**
   * Wait for refetch to complete before calling onSuccess
   * Default: false (fire and forget)
   */
  waitForRefetch?: boolean;
}

/**
 * useMutationWithInvalidation - Mutation hook with automatic query invalidation
 */
export function useMutationWithInvalidation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(options: UseMutationWithInvalidationOptions<TData, TError, TVariables, TContext>) {
  const {
    mutationFn,
    invalidateKeys,
    refetchMode = 'active',
    waitForRefetch = false,
    onSuccess,
    onError,
    onSettled,
    ...restOptions
  } = options;

  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables, TContext>({
    ...restOptions,
    mutationFn,
    
    onSuccess: async (data, variables, context) => {
      logger.info('Mutation succeeded, invalidating queries', { invalidateKeys });

      try {
        // Invalidate all specified query keys
        const invalidatePromises = invalidateKeys.map((key) =>
          queryClient.invalidateQueries({ 
            queryKey: [key],
            refetchType: refetchMode === 'none' ? 'none' : refetchMode,
          })
        );

        if (waitForRefetch && refetchMode !== 'none') {
          // Wait for all invalidations and refetches to complete
          await Promise.all(invalidatePromises);
          
          // Additional explicit refetch for active queries
          await queryClient.refetchQueries({
            queryKey: invalidateKeys,
            type: refetchMode,
          });
          
          logger.info('Queries invalidated and refetched', { invalidateKeys });
        } else {
          // Fire and forget (don't wait)
          Promise.all(invalidatePromises).catch((error) => {
            logger.error('Failed to invalidate queries', error, { invalidateKeys });
          });
          
          if (refetchMode !== 'none') {
            queryClient.refetchQueries({
              queryKey: invalidateKeys,
              type: refetchMode,
            }).catch((error) => {
              logger.error('Failed to refetch queries', error, { invalidateKeys });
            });
          }
        }
      } catch (error) {
        logger.error('Error during query invalidation', error as Error, { invalidateKeys });
      }

      // Call original onSuccess callback
      onSuccess?.(data, variables, context);
    },
    
    onError: (error, variables, context) => {
      logger.error('Mutation failed', error as Error, { 
        invalidateKeys,
        variables 
      });
      
      // Call original onError callback
      onError?.(error, variables, context);
    },
    
    onSettled: (data, error, variables, context) => {
      // Call original onSettled callback
      onSettled?.(data, error, variables, context);
    },
  });
}

/**
 * Hook for optimistic updates with automatic rollback on error
 * 
 * @example
 * ```tsx
 * const updateProject = useOptimisticMutation({
 *   mutationFn: (data) => projectsAPI.update(data.id, data),
 *   queryKey: 'projects',
 *   optimisticUpdate: (oldData, newData) => {
 *     return oldData.map(p => p.id === newData.id ? newData : p);
 *   },
 * });
 * ```
 */
export interface UseOptimisticMutationOptions<TData, TVariables> {
  /** Mutation function */
  mutationFn: MutationFunction<TData, TVariables>;
  
  /** Query key to update optimistically */
  queryKey: string;
  
  /** Function to update cached data optimistically */
  optimisticUpdate: (oldData: any, variables: TVariables) => any;
  
  /** Additional keys to invalidate on success */
  invalidateKeys?: string[];
  
  /** Success callback */
  onSuccess?: (data: TData) => void;
  
  /** Error callback */
  onError?: (error: Error) => void;
}

export function useOptimisticMutation<TData, TVariables>(
  options: UseOptimisticMutationOptions<TData, TVariables>
) {
  const {
    mutationFn,
    queryKey,
    optimisticUpdate,
    invalidateKeys = [],
    onSuccess,
    onError,
  } = options;

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    
    // Optimistic update before mutation
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      // Snapshot current value
      const previousData = queryClient.getQueryData([queryKey]);

      // Optimistically update cache
      queryClient.setQueryData([queryKey], (old: any) => {
        return optimisticUpdate(old, variables);
      });

      logger.debug('Optimistic update applied', { queryKey, variables });

      // Return context with snapshot
      return { previousData };
    },
    
    // On error, rollback to previous value
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([queryKey], context.previousData);
        logger.info('Optimistic update rolled back', { queryKey });
      }
      
      logger.error('Optimistic mutation failed', error as Error, { 
        queryKey, 
        variables 
      });
      
      onError?.(error as Error);
    },
    
    // On success, invalidate and refetch
    onSuccess: async (data) => {
      // Invalidate primary query
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      
      // Invalidate additional keys
      if (invalidateKeys.length > 0) {
        await Promise.all(
          invalidateKeys.map((key) =>
            queryClient.invalidateQueries({ queryKey: [key] })
          )
        );
      }
      
      logger.info('Optimistic mutation succeeded', { 
        queryKey, 
        invalidateKeys 
      });
      
      onSuccess?.(data);
    },
    
    // Always refetch after settled
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });
}
