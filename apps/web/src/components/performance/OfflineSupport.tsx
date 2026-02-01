/**
 * Offline Support Component
 * Provides UI for offline status, sync queue, and service worker management
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { clsx } from 'clsx';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import {
  registerServiceWorker,
  unregisterServiceWorker,
  isServiceWorkerSupported,
} from '@/lib/performance/serviceWorker';

export interface OfflineSupportProps {
  className?: string;
  showDetails?: boolean;
}

interface SyncItem {
  id: string;
  action: string;
  data: unknown;
  timestamp: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

export default function OfflineSupport({ className, showDetails = false }: OfflineSupportProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistered, setSwRegistered] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker status
    if (isServiceWorkerSupported()) {
      navigator.serviceWorker.ready.then(() => {
        setSwRegistered(true);
      });

      navigator.serviceWorker.getRegistration().then((registration) => {
        setSwRegistered(!!registration);
      });
    }

    // Load sync queue from localStorage
    const storedQueue = localStorage.getItem('offline_sync_queue');
    if (storedQueue) {
      try {
        setSyncQueue(JSON.parse(storedQueue));
      } catch (e: unknown) {
        logger.error('Failed to parse sync queue:', e);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncQueueToServer = useCallback(async () => {
    if (syncQueue.length === 0 || !isOnline || isSyncing) return;

    setIsSyncing(true);
    const pendingItems = syncQueue.filter((item) => item.status === 'pending');

    for (const item of pendingItems) {
      try {
        // Update status to syncing
        setSyncQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'syncing' as const } : i))
        );

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update status to synced
        setSyncQueue((prev) => {
          const updated: SyncItem[] = prev.map((i) =>
            i.id === item.id ? { ...i, status: 'synced' as const } : i
          );
          localStorage.setItem('offline_sync_queue', JSON.stringify(updated));
          return updated;
        });
      } catch (_error) {
        // Update status to failed
        setSyncQueue((prev) => {
          const updated: SyncItem[] = prev.map((i) =>
            i.id === item.id ? { ...i, status: 'failed' as const } : i
          );
          localStorage.setItem('offline_sync_queue', JSON.stringify(updated));
          return updated;
        });
      }
    }

    setIsSyncing(false);
  }, [syncQueue, isOnline, isSyncing]);

  useEffect(() => {
    if (isOnline && syncQueue.some((item) => item.status === 'pending')) {
      syncQueueToServer();
    }
  }, [isOnline, syncQueue, syncQueueToServer]);

  const clearSyncedItems = () => {
    const filtered = syncQueue.filter((item) => item.status !== 'synced');
    setSyncQueue(filtered);
    localStorage.setItem('offline_sync_queue', JSON.stringify(filtered));
  };

  const handleRegisterSW = () => {
    registerServiceWorker();
    setTimeout(() => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        setSwRegistered(!!registration);
      });
    }, 1000);
  };

  const handleUnregisterSW = () => {
    unregisterServiceWorker();
    setSwRegistered(false);
  };

  const pendingCount = syncQueue.filter((item) => item.status === 'pending').length;
  const failedCount = syncQueue.filter((item) => item.status === 'failed').length;

  return (
    <Card variant="glass" className={clsx('p-6 border border-gray-800', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Offline Support</h3>
            <p className="text-sm text-gray-400 mt-1">
              Service worker and offline data synchronization
            </p>
          </div>
          <Badge variant={isOnline ? 'success' : 'error'}>{isOnline ? 'Online' : 'Offline'}</Badge>
        </div>

        {!isOnline && (
          <Alert variant="warning">
            You are currently offline. Changes will be synced when you reconnect.
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 glass-effect bg-[#1C1C26] rounded-lg border border-gray-800 hover-lift">
            <div className="text-sm text-gray-400">Service Worker</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={swRegistered ? 'success' : 'default'}>
                {swRegistered ? 'Registered' : 'Not Registered'}
              </Badge>
              {isServiceWorkerSupported() ? (
                <span className="text-xs text-gray-500">Supported</span>
              ) : (
                <span className="text-xs text-gray-500">Not Supported</span>
              )}
            </div>
          </div>

          <div className="p-4 glass-effect bg-[#1C1C26] rounded-lg border border-gray-800 hover-lift">
            <div className="text-sm text-gray-400">Pending Sync</div>
            <div className="mt-1 text-2xl font-bold text-white">{pendingCount}</div>
          </div>

          <div className="p-4 glass-effect bg-[#1C1C26] rounded-lg border border-gray-800 hover-lift">
            <div className="text-sm text-gray-400">Failed Sync</div>
            <div className="mt-1 text-2xl font-bold text-red-400">{failedCount}</div>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {isServiceWorkerSupported() && (
                <>
                  {!swRegistered ? (
                    <Button variant="gradient" size="sm" onClick={handleRegisterSW}>
                      Register Service Worker
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleUnregisterSW} className="border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white">
                      Unregister Service Worker
                    </Button>
                  )}
                </>
              )}

              {pendingCount > 0 && isOnline && (
                <Button variant="gradient" size="sm" onClick={syncQueueToServer} loading={isSyncing}>
                  Sync Now
                </Button>
              )}

              {syncQueue.some((item) => item.status === 'synced') && (
                <Button variant="ghost" size="sm" onClick={clearSyncedItems} className="text-gray-400 hover:bg-[#252532] hover:text-white">
                  Clear Synced
                </Button>
              )}
            </div>

            {syncQueue.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Sync Queue ({syncQueue.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {syncQueue.map((item) => (
                    <div
                      key={item.id}
                      className={clsx(
                        'p-3 rounded-lg border text-sm glass-effect',
                        'bg-[#1C1C26]',
                        'border-gray-800',
                        item.status === 'synced' && 'opacity-60',
                        item.status === 'failed' && 'border-red-500/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{item.action}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <Badge
                          variant={
                            item.status === 'synced'
                              ? 'success'
                              : item.status === 'failed'
                                ? 'error'
                                : item.status === 'syncing'
                                  ? 'info'
                                  : 'default'
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
