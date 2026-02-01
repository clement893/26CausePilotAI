/**
 * Logs Viewer Component
 * Affiche les logs centralisés avec filtres
 */
'use client';

import { useEffect, useState } from 'react';
import type { LogEntry } from '@/lib/monitoring/types';
import { logStore } from '@/lib/monitoring/logs';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogEntry['level'] | 'all'>(
    'all'
  );

  useEffect(() => {
    const updateLogs = () => {
      const filtered = logStore.getLogs({
        level: levelFilter !== 'all' ? levelFilter : undefined,
        search: search || undefined,
        limit: 100,
      });
      setLogs(filtered);
    };

    updateLogs();
    const interval = setInterval(updateLogs, 2000); // Update every 2s
    return () => clearInterval(interval);
  }, [search, levelFilter]);

  const getLevelColor = (
    level: LogEntry['level']
  ): 'error' | 'warning' | 'info' | 'default' => {
    switch (level) {
      case 'error':
        return 'error';
      case 'warn':
        return 'warning';
      case 'info':
        return 'info';
      case 'debug':
        return 'default';
      default:
        return 'default';
    }
  };

  const logCounts = logStore.getLogCounts();

  return (
    <Card variant="glass" className="border border-gray-800">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Logs</h3>
          <div className="flex gap-2">
            <Badge variant="default">Debug: {logCounts.debug}</Badge>
            <Badge variant="info">Info: {logCounts.info}</Badge>
            <Badge variant="warning">Warn: {logCounts.warn}</Badge>
            <Badge variant="error">Error: {logCounts.error}</Badge>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 form-input-glow"
          />
          <Dropdown
            trigger={
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white">
                Level: {levelFilter}
              </Button>
            }
            items={[
              { label: 'All', onClick: () => setLevelFilter('all') },
              { label: 'Debug', onClick: () => setLevelFilter('debug') },
              { label: 'Info', onClick: () => setLevelFilter('info') },
              { label: 'Warn', onClick: () => setLevelFilter('warn') },
              { label: 'Error', onClick: () => setLevelFilter('error') },
            ]}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => logStore.clearLogs()}
            className="border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white"
          >
            Clear
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No logs found
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 glass-effect bg-[#1C1C26] rounded-lg text-sm font-mono border border-gray-800 hover-lift"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getLevelColor(log.level)}>
                    {log.level}
                  </Badge>
                  {log.service && (
                    <Badge variant="default">{log.service}</Badge>
                  )}
                  <span className="text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-white">{log.message}</div>
                {log.context &&
                  Object.keys(log.context).length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      {JSON.stringify(log.context, null, 2)}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
