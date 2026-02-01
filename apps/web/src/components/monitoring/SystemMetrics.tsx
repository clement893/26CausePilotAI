/**
 * System Metrics Component
 * Affiche les métriques système (CPU, Memory, Disk, Network)
 */
'use client';

import { useEffect, useState } from 'react';
import type { SystemMetrics } from '@/lib/monitoring/types';
import { metricsCollector } from '@/lib/monitoring/metrics';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';

export default function SystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    const updateMetrics = async () => {
      const systemMetrics = await metricsCollector.collectSystemMetrics();
      setMetrics(systemMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <Card variant="glass" className="border border-gray-800">
        <div className="p-6 text-center text-gray-400">
          Loading system metrics...
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="border border-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">System Metrics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-white">CPU</span>
              <span className="text-sm text-gray-400">
                {metrics.cpu.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.cpu} className="bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-white">Memory</span>
              <span className="text-sm text-gray-400">
                {metrics.memory.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.memory} className="bg-gradient-to-r from-green-500 to-cyan-500" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-white">Disk</span>
              <span className="text-sm text-gray-400">
                {metrics.disk.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.disk} className="bg-gradient-to-r from-orange-500 to-red-500" />
          </div>

          <div className="pt-2 border-t border-gray-800">
            <div className="text-sm font-medium mb-2 text-white">Network</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">In</div>
                <div className="text-lg font-semibold text-white">
                  {(metrics.network.in / 1024 / 1024).toFixed(2)} MB/s
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Out</div>
                <div className="text-lg font-semibold text-white">
                  {(metrics.network.out / 1024 / 1024).toFixed(2)} MB/s
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-4">
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
